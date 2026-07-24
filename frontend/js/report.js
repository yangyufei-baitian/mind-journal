/* ============================================
   report.js — PDF 健康报告导出模块
   依赖: html2pdf.js (CDN), Chart.js, Dexie (db.js), charts.js (scoreColor)
   ============================================ */

// ==================== 弹窗 ====================

function showReportDialog() {
    // 如果已有弹窗则先移除
    closeReportDialog();

    const overlay = document.createElement("div");
    overlay.id = "report-dialog-overlay";
    overlay.className = "report-dialog-overlay";
    overlay.addEventListener("click", function(e) {
        if (e.target === overlay) closeReportDialog();
    });

    overlay.innerHTML = `
        <div class="report-dialog">
            <div class="report-dialog-header">
                <h3>📄 导出健康报告</h3>
                <button class="report-dialog-close" onclick="closeReportDialog()">✕</button>
            </div>
            <p style="color:var(--text-light);margin:0 0 16px 0;font-size:0.85rem;">
                选择报告涵盖的时间范围，生成 PDF 供医生参考
            </p>
            <div class="report-period-options">
                <button class="report-period-btn" data-days="7" onclick="selectReportPeriod(7, this)">
                    <span class="period-num">7</span>
                    <span class="period-unit">天</span>
                    <span class="period-desc">最近一周</span>
                </button>
                <button class="report-period-btn" data-days="14" onclick="selectReportPeriod(14, this)">
                    <span class="period-num">14</span>
                    <span class="period-unit">天</span>
                    <span class="period-desc">两周汇总</span>
                </button>
                <button class="report-period-btn active" data-days="30" onclick="selectReportPeriod(30, this)">
                    <span class="period-num">30</span>
                    <span class="period-unit">天</span>
                    <span class="period-desc">月度报告</span>
                </button>
            </div>
            <button id="report-generate-btn" class="btn-primary" onclick="generateReport(currentReportDays)" style="width:100%;margin-top:12px;">
                📄 生成报告
            </button>
        </div>
    `;

    document.body.appendChild(overlay);
}

function closeReportDialog() {
    const overlay = document.getElementById("report-dialog-overlay");
    if (overlay) overlay.remove();
}

let currentReportDays = 30;

function selectReportPeriod(days, btn) {
    currentReportDays = days;
    document.querySelectorAll(".report-period-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
}

// ==================== 主流程 ====================

async function generateReport(days) {
    const btn = document.getElementById("report-generate-btn");
    if (btn) { btn.disabled = true; btn.textContent = "⏳ 正在生成..."; }

    try {
        // 检查 html2pdf 是否加载
        if (typeof html2pdf === "undefined") {
            showToast("html2pdf 库未加载，请检查网络后刷新页面");
            if (btn) { btn.disabled = false; btn.textContent = "📄 生成报告"; }
            return;
        }

        // 1. 收集数据
        const data = await collectReportData(days);

        // 2. 关闭弹窗
        closeReportDialog();

        // 3. 构建报告，直接放 body (不要嵌套flex — html2canvas 算宽度会出问题)
        const reportHTML = buildReportHTML(data, days);

        const container = document.createElement("div");
        container.id = "__report_container";
        container.style.cssText = "position:absolute;top:0;left:0;width:750px;background:#fff;z-index:99999;";
        container.innerHTML = reportHTML;
        document.body.appendChild(container);

        // 4. 渲染图表到 canvas
        await renderReportCharts(container, data, days);

        // 5. 等待渲染完成
        await new Promise(r => setTimeout(r, 400));

        // 6. canvas → img (html2canvas 对 img 更可靠)
        const canvases = container.querySelectorAll("canvas");
        for (const canvas of canvases) {
            try {
                const dataUrl = canvas.toDataURL("image/png");
                const img = document.createElement("img");
                img.src = dataUrl;
                img.style.cssText = "display:block;max-width:100%;";
                img.width = canvas.width;
                img.height = canvas.height;
                canvas.parentNode.replaceChild(img, canvas);
            } catch (e) {
                console.warn("Canvas→img failed:", e);
            }
        }

        // 7. 等待图片加载
        await new Promise(r => setTimeout(r, 300));

        // 8. 生成 PDF — 直接用容器元素
        const opt = {
            margin: [6, 6, 6, 6],
            filename: `心灵日记_健康报告_${data.dateStart}_${data.dateEnd}.pdf`,
            image: { type: "jpeg", quality: 0.95 },
            html2canvas: { scale: 2, useCORS: true, logging: false, allowTaint: true },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
            pagebreak: { mode: ["css", "legacy"] }
        };

        await html2pdf().set(opt).from(container).save();

        // 9. 清理
        document.body.removeChild(container);
        showToast("报告已生成 ✅");

    } catch (e) {
        console.error("Report generation failed:", e);
        const temp = document.getElementById("__report_container");
        if (temp) temp.remove();
        showToast("报告生成失败: " + (e.message || "未知错误"));
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = "📄 生成报告"; }
    }
}

// ==================== 数据收集 ====================

async function collectReportData(days) {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - days + 1);
    const dateStart = startDate.toISOString().split("T")[0];
    const dateEnd = today.toISOString().split("T")[0];

    // 情绪数据
    const allMoods = await getMoodHistory(days);
    const dailyMood = calculateDailyWeightedMood(allMoods);

    // 症状数据
    const allSymptoms = await getSymptomHistory(days);
    const dailySymptom = calculateDailySymptomScore(allSymptoms);

    // 服药数据
    const userMeds = await getUserMedications();
    const medDetails = [];
    for (const um of userMeds) {
        const info = getMedicationInfo(um.med_id);
        const logs = await getMedicationLogs(um.id, dateStart);
        const remaining = calculatePillRemaining(um);

        // 计算应打卡次数
        const freq = um.frequency || {};
        const dosesPerDay = (freq.morning ? 1 : 0) + (freq.noon ? 1 : 0) +
                           (freq.evening ? 1 : 0) + (freq.bedtime ? 1 : 0);
        const totalDays = Math.max(1, Math.floor((today - new Date(um.start_date)) / 86400000) + 1);
        const scheduledDoses = totalDays * dosesPerDay * (um.pills_per_dose || 1);
        const takenDoses = logs.length;

        medDetails.push({
            userMed: um,
            info: info,
            logs: logs,
            remaining: remaining,
            dosesPerDay: dosesPerDay,
            scheduledDoses: scheduledDoses,
            takenDoses: takenDoses,
            adherenceRate: scheduledDoses > 0 ? Math.round(takenDoses / scheduledDoses * 100) : 0
        });
    }

    // 日记数据 (低情绪日)
    const allDiaries = await getDiaryList();
    const lowMoodDiaries = [];
    for (const diary of allDiaries) {
        if (diary.date >= dateStart && diary.date <= dateEnd) {
            const moodEntries = allMoods.filter(m => m.date === diary.date);
            const dailyScore = dailyMood[diary.date];
            const avgScore = dailyScore ? dailyScore.score : (diary.mood_at_time || 5);
            if (avgScore !== null && avgScore <= 5) {
                lowMoodDiaries.push({ ...diary, avgScore: avgScore });
            }
        }
    }
    // 按日期倒序，取最新5条
    lowMoodDiaries.sort((a, b) => b.date.localeCompare(a.date));
    const topDiaries = lowMoodDiaries.slice(0, 5);

    // 用户 ID
    const userId = await getUserId();

    // 构建日期列表 (用于图表 x 轴)
    const dateList = [];
    for (let i = 0; i < days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        dateList.push(d.toISOString().split("T")[0]);
    }

    // 情绪统计
    const moodScores = dateList.map(d => dailyMood[d]?.score).filter(s => s != null);
    const avgMood = moodScores.length ? (moodScores.reduce((a, b) => a + b, 0) / moodScores.length) : null;
    let maxMood = null, maxMoodDate = "", minMood = null, minMoodDate = "";
    dateList.forEach(d => {
        const s = dailyMood[d]?.score;
        if (s != null) {
            if (maxMood === null || s > maxMood) { maxMood = s; maxMoodDate = d; }
            if (minMood === null || s < minMood) { minMood = s; minMoodDate = d; }
        }
    });
    const moodTrend = calcTrend(moodScores);

    // 症状统计
    const symScores = dateList.map(d => dailySymptom[d]?.score || 0);
    const avgSym = symScores.reduce((a, b) => a + b, 0) / symScores.length;
    const symTrend = calcTrend(symScores.filter(s => s > 0));

    // 最显著症状 TOP3
    const symFrequency = {};
    dateList.forEach(d => {
        const sd = dailySymptom[d];
        if (sd?.symptom_list) {
            sd.symptom_list.forEach(s => {
                if (!symFrequency[s.symptom_id]) {
                    symFrequency[s.symptom_id] = { label: s.label, totalImpact: 0, days: 0, maxImpact: 0 };
                }
                symFrequency[s.symptom_id].totalImpact += s.impact;
                symFrequency[s.symptom_id].days += 1;
                symFrequency[s.symptom_id].maxImpact = Math.max(symFrequency[s.symptom_id].maxImpact, s.impact);
            });
        }
    });
    const topSymptoms = Object.values(symFrequency)
        .sort((a, b) => b.totalImpact - a.totalImpact)
        .slice(0, 3);

    return {
        dateStart, dateEnd, days, userId,
        dailyMood, dailySymptom, dateList,
        avgMood, maxMood, maxMoodDate, minMood, minMoodDate, moodTrend,
        avgSym, symTrend, topSymptoms,
        medDetails,
        lowMoodDiaries: topDiaries,
        hasMoodData: moodScores.length > 0,
        hasSymData: symScores.some(s => s > 0),
        hasMedData: medDetails.length > 0,
        hasDiaryData: topDiaries.length > 0
    };
}

function calcTrend(arr) {
    if (arr.length < 4) return { dir: "→", label: "数据不足" };
    const first = arr.slice(0, Math.min(3, Math.floor(arr.length / 2))).reduce((a, b) => a + b, 0) / Math.min(3, Math.floor(arr.length / 2));
    const last = arr.slice(-Math.min(3, Math.floor(arr.length / 2))).reduce((a, b) => a + b, 0) / Math.min(3, Math.floor(arr.length / 2));
    if (last - first > 0.5) return { dir: "↑", label: "上升" };
    if (last - first < -0.5) return { dir: "↓", label: "下降" };
    return { dir: "→", label: "平稳" };
}

// ==================== 报告 HTML 构建 ====================

function buildReportHTML(data, days) {
    const e = ["", "😢", "😢", "😞", "😞", "😐", "😐", "🙂", "🙂", "😄", "😄"];

    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif; color: #2d3436; font-size: 12px; line-height: 1.6; }
        .report { width: 720px; padding: 24px 28px; }

        /* 页眉 */
        .r-header { text-align: center; padding-bottom: 16px; border-bottom: 3px solid #5B8C5A; margin-bottom: 16px; }
        .r-header h1 { font-size: 22px; color: #5B8C5A; margin-bottom: 4px; }
        .r-header .r-meta { font-size: 11px; color: #636e72; }
        .r-header .r-meta span { margin: 0 8px; }

        /* 统计卡片行 */
        .r-stat-row { display: flex; gap: 10px; margin: 12px 0; }
        .r-stat-card { flex: 1; text-align: center; padding: 10px 6px; border-radius: 8px; background: #f8f9fa; border: 1px solid #e9ecef; }
        .r-stat-card .r-stat-val { font-size: 20px; font-weight: 700; }
        .r-stat-card .r-stat-lbl { font-size: 10px; color: #636e72; margin-top: 2px; }
        .r-stat-card.good { background: #e8f5e9; border-color: #a5d6a7; }
        .r-stat-card.warn { background: #fff3e0; border-color: #ffcc80; }
        .r-stat-card.bad  { background: #ffebee; border-color: #ef9a9a; }
        .r-stat-card .r-trend { font-size: 11px; color: #636e72; }

        /* Section */
        .r-section { margin: 16px 0; page-break-inside: avoid; }
        .r-section h2 { font-size: 15px; color: #5B8C5A; border-bottom: 1px solid #e0e0e0; padding-bottom: 4px; margin-bottom: 10px; }
        .r-chart-wrap { text-align: center; margin: 8px 0; }
        .r-chart-wrap canvas { max-width: 100%; }

        /* 症状 TOP */
        .r-sym-top { display: flex; gap: 8px; margin: 8px 0; }
        .r-sym-item { flex: 1; padding: 8px; border-radius: 6px; background: #f8f9fa; text-align: center; border-left: 3px solid #5B8C5A; }
        .r-sym-item .r-sym-name { font-weight: 600; font-size: 13px; }
        .r-sym-item .r-sym-impact { font-size: 10px; color: #636e72; }
        .r-sym-item .r-sym-days { font-size: 10px; color: #b2bec3; }

        /* 服药卡片 */
        .r-med-card { padding: 10px 12px; margin: 8px 0; border-radius: 8px; border: 1px solid #e0e0e0; background: #fafafa; }
        .r-med-card .r-med-name { font-weight: 700; font-size: 14px; color: #2d3436; }
        .r-med-card .r-med-dose { font-size: 11px; color: #636e72; margin-left: 8px; }
        .r-med-card .r-med-row { display: flex; gap: 12px; margin-top: 6px; }
        .r-med-card .r-med-item { text-align: center; }
        .r-med-card .r-med-item .val { font-size: 16px; font-weight: 700; }
        .r-med-card .r-med-item .lbl { font-size: 9px; color: #636e72; }
        .r-med-card .r-med-pills { margin-top: 6px; padding: 6px 8px; border-radius: 4px; font-size: 11px; }
        .r-med-card .r-med-pills.danger { background: #ffebee; color: #c0392b; }
        .r-med-card .r-med-pills.warning { background: #fff3e0; color: #e67e22; }
        .r-med-card .r-med-pills.normal { background: #e8f5e9; color: #27ae60; }
        .r-adh-good { color: #27ae60; }
        .r-adh-warn { color: #e67e22; }
        .r-adh-bad  { color: #c0392b; }

        /* 日记 */
        .r-diary-item { padding: 8px 10px; margin: 6px 0; border-left: 3px solid #dfe6e9; background: #fafafa; border-radius: 0 6px 6px 0; }
        .r-diary-item .r-diary-date { font-size: 10px; color: #b2bec3; }
        .r-diary-item .r-diary-title { font-weight: 600; font-size: 12px; }
        .r-diary-item .r-diary-excerpt { font-size: 10px; color: #636e72; margin-top: 2px; }

        /* 页脚 */
        .r-footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 9px; color: #b2bec3; }
        .r-footer p { margin: 2px 0; }

        /* 空状态 */
        .r-empty { text-align: center; color: #b2bec3; padding: 20px; font-size: 13px; }

        /* 分页 */
        .r-page-break { page-break-before: always; }
    </style></head><body><div class="report">

    <!-- ===== 页眉 ===== -->
    <div class="r-header">
        <h1>🧠 心灵日记 · 健康报告</h1>
        <div class="r-meta">
            <span>📅 ${data.dateStart} ~ ${data.dateEnd}</span>
            <span>🆔 ${(data.userId || "unknown").substring(0, 8)}</span>
            <span>🕐 ${new Date().toLocaleString("zh-CN")}</span>
        </div>
    </div>

    <!-- ===== 情绪概况 ===== -->
    <div class="r-section">
        <h2>📊 情绪概况 (${days}天加权)</h2>
        ${data.hasMoodData ? `
        <div class="r-stat-row">
            <div class="r-stat-card ${data.avgMood >= 7 ? 'good' : data.avgMood >= 4 ? '' : 'bad'}">
                <div class="r-stat-val">${data.avgMood != null ? e[Math.round(data.avgMood)] + ' ' + data.avgMood.toFixed(1) : '—'}</div>
                <div class="r-stat-lbl">平均情绪分</div>
                <div class="r-trend">${data.moodTrend.label}</div>
            </div>
            <div class="r-stat-card good">
                <div class="r-stat-val">${e[Math.round(data.maxMood)]} ${data.maxMood}</div>
                <div class="r-stat-lbl">最高 · ${data.maxMoodDate.slice(5)}</div>
            </div>
            <div class="r-stat-card ${data.minMood <= 4 ? 'bad' : ''}">
                <div class="r-stat-val">${data.minMood != null ? e[Math.round(data.minMood)] + ' ' + data.minMood : '—'}</div>
                <div class="r-stat-lbl">最低 · ${data.minMoodDate.slice(5)}</div>
            </div>
        </div>
        <div class="r-chart-wrap"><canvas id="report-mood-chart" width="660" height="250"></canvas></div>
        ` : `<div class="r-empty">📭 所选时间段无情绪记录</div>`}
    </div>

    <!-- ===== 症状分析 ===== -->
    <div class="r-section">
        <h2>🏥 症状分析</h2>
        ${data.hasSymData ? `
        <div class="r-stat-row">
            <div class="r-stat-card ${data.avgSym >= 15 ? 'bad' : data.avgSym >= 8 ? 'warn' : data.avgSym >= 3 ? '' : 'good'}">
                <div class="r-stat-val">${data.avgSym.toFixed(1)}</div>
                <div class="r-stat-lbl">日均症状分</div>
                <div class="r-trend">${data.symTrend.dir} ${data.symTrend.label}</div>
            </div>
            ${data.topSymptoms.length > 0 ? `
            <div class="r-stat-card" style="flex:2;">
                <div class="r-stat-lbl" style="margin-bottom:4px;">最显著症状</div>
                <div class="r-sym-top" style="margin:0;">
                    ${data.topSymptoms.map(s => `
                        <div class="r-sym-item">
                            <div class="r-sym-name">${s.label}</div>
                            <div class="r-sym-impact">最高 ${s.maxImpact.toFixed(0)}分</div>
                            <div class="r-sym-days">${s.days}天出现</div>
                        </div>
                    `).join("")}
                </div>
            </div>
            ` : ""}
        </div>
        <div class="r-chart-wrap"><canvas id="report-symptom-chart" width="660" height="250"></canvas></div>
        ` : `<div class="r-empty">📭 所选时间段无症状记录</div>`}
    </div>

    <!-- ===== 服药依从性 ===== -->
    ${data.hasMedData ? `
    <div class="r-section">
        <h2>💊 服药依从性</h2>
        ${data.medDetails.map(md => {
            const adhClass = md.adherenceRate >= 80 ? "r-adh-good" : md.adherenceRate >= 50 ? "r-adh-warn" : "r-adh-bad";
            const pillClass = md.remaining.warningLevel;
            return `
            <div class="r-med-card">
                <div>
                    <span class="r-med-name">${md.info ? md.info.name : md.userMed.med_id}</span>
                    <span class="r-med-dose">${md.userMed.custom_dose || "?"} ${md.userMed.dose_unit || "mg"} · 每次${md.userMed.pills_per_dose || 1}粒 · 每日${md.dosesPerDay}次</span>
                </div>
                <div class="r-med-row">
                    <div class="r-med-item">
                        <div class="val ${adhClass}">${md.adherenceRate}%</div>
                        <div class="lbl">依从率</div>
                    </div>
                    <div class="r-med-item">
                        <div class="val">${md.takenDoses}</div>
                        <div class="lbl">已打卡</div>
                    </div>
                    <div class="r-med-item">
                        <div class="val">${md.scheduledDoses}</div>
                        <div class="lbl">应打卡</div>
                    </div>
                    <div class="r-med-item">
                        <div class="val">${md.userMed.start_date?.slice(5) || "?"}</div>
                        <div class="lbl">开始日期</div>
                    </div>
                </div>
                <div class="r-med-pills ${pillClass}">
                    💊 药量: 剩余约 <b>${md.remaining.remaining}</b> 粒 (${md.remaining.pillsPerDay}粒/天)
                    · 预计可用 <b>${md.remaining.daysLeft}</b> 天
                    ${pillClass === "danger" ? " ⚠️ 请尽快续药！" : pillClass === "warning" ? " ⚡ 建议提前续药" : " ✅ 药量充足"}
                </div>
                ${md.info && md.info.contraindications && md.info.contraindications.length > 0 ? `
                <div style="margin-top:6px;font-size:10px;color:#636e72;">
                    ⚠️ 重要提醒: ${md.info.contraindications.filter(c => c.severity === "danger").map(c => c.text).join("；") || md.info.contraindications[0].text}
                </div>` : ""}
            </div>`;
        }).join("")}
    </div>
    ` : ""}

    <!-- ===== 近期日记 ===== -->
    ${data.hasDiaryData ? `
    <div class="r-section">
        <h2>📔 低情绪日日记 (情绪≤5分)</h2>
        ${data.lowMoodDiaries.map(d => `
            <div class="r-diary-item">
                <div class="r-diary-date">📅 ${d.date} · 情绪 ${d.avgScore.toFixed(0)}/10</div>
                <div class="r-diary-title">${escapeHtml(d.title || "无标题")}</div>
                <div class="r-diary-excerpt">${escapeHtml((d.content || "").substring(0, 150))}${(d.content || "").length > 150 ? "..." : ""}</div>
            </div>
        `).join("")}
    </div>
    ` : ""}

    <!-- ===== 页脚 ===== -->
    <div class="r-footer">
        <p>本报告由 <b>心灵日记</b> App 自动生成，数据来源于用户在设备端的记录。</p>
        <p>此报告仅供医疗参考，不构成诊断或治疗建议。如有疑问请咨询专业医生。</p>
        <p>Generated by Mind Journal v0.6 · ${new Date().toISOString().split("T")[0]}</p>
    </div>

    </div></body></html>`;
}

// ==================== 图表渲染 ====================

async function renderReportCharts(container, data, days) {
    // 只在有数据时渲染图表
    if (data.hasMoodData) {
        await renderMoodReportChart(container, data, days);
    }
    if (data.hasSymData) {
        await renderSymptomReportChart(container, data, days);
    }
}

function renderMoodReportChart(container, data, days) {
    const canvas = container.querySelector("#report-mood-chart");
    if (!canvas) return;

    const labels = data.dateList.map(d => {
        const parts = d.split("-");
        return parts[1] + "/" + parts[2];
    });

    const scores = data.dateList.map(d => {
        const sc = data.dailyMood[d];
        return sc ? sc.score : null;
    });

    new Chart(canvas, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "加权情绪分",
                data: scores,
                borderColor: "#5B8C5A",
                backgroundColor: "rgba(91,140,90,0.08)",
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointRadius: scores.map(s => s != null ? 4 : 0),
                pointBackgroundColor: scores.map(s => scoreColor(s)),
                pointBorderColor: "#fff",
                pointBorderWidth: 1.5,
                spanGaps: false
            }]
        },
        options: {
            animation: false,
            responsive: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    min: 1, max: 10,
                    ticks: {
                        stepSize: 1,
                        callback: v => {
                            const e = ["", "😢", "😢", "😞", "😞", "😐", "😐", "🙂", "🙂", "😄", "😄"];
                            return e[v] || v;
                        },
                        font: { size: 12 }
                    },
                    grid: { color: "#f0f0f0" }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 9 }, maxRotation: 45 }
                }
            }
        }
    });
}

function renderSymptomReportChart(container, data, days) {
    const canvas = container.querySelector("#report-symptom-chart");
    if (!canvas) return;

    const labels = data.dateList.map(d => {
        const parts = d.split("-");
        return parts[1] + "/" + parts[2];
    });

    const scores = data.dateList.map(d => {
        const sc = data.dailySymptom[d];
        return sc ? sc.score : 0;
    });

    new Chart(canvas, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "症状分",
                data: scores,
                backgroundColor: scores.map(s =>
                    s >= 15 ? "rgba(192,57,43,0.7)" :
                    s >= 8 ? "rgba(231,111,111,0.7)" :
                    s >= 3 ? "rgba(244,162,97,0.7)" : "rgba(149,165,166,0.5)"
                ),
                borderColor: scores.map(s =>
                    s >= 15 ? "#C0392B" : s >= 8 ? "#E76F6F" :
                    s >= 3 ? "#F4A261" : "#95A5A6"
                ),
                borderWidth: 1, borderRadius: 3
            }]
        },
        options: {
            animation: false,
            responsive: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: "#f0f0f0" },
                    ticks: { font: { size: 10 } }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 9 }, maxRotation: 45 }
                }
            }
        }
    });
}
