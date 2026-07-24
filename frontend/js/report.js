/* ============================================
   report.js — PDF 健康报告导出 v2
   打印窗口内 Chart.js 原生渲染，不含图片转换
   内容重点: 服药依从性 > 症状频率趋势 > 情绪摘要
   ============================================ */

// ==================== 弹窗 ====================

function showReportDialog() {
    closeReportDialog();
    const overlay = document.createElement("div");
    overlay.id = "report-dialog-overlay";
    overlay.className = "report-dialog-overlay";
    overlay.addEventListener("click", function(e) { if (e.target === overlay) closeReportDialog(); });
    overlay.innerHTML = `
        <div class="report-dialog">
            <div class="report-dialog-header">
                <h3>📄 导出健康报告</h3>
                <button class="report-dialog-close" onclick="closeReportDialog()">✕</button>
            </div>
            <p style="color:var(--text-light);margin:0 0 16px 0;font-size:0.85rem;">
                选择时间范围，生成 PDF 供医生参考
            </p>
            <div class="report-period-options">
                <button class="report-period-btn" data-days="7" onclick="selectReportPeriod(7, this)">
                    <span class="period-num">7</span><span class="period-unit">天</span><span class="period-desc">最近一周</span>
                </button>
                <button class="report-period-btn" data-days="14" onclick="selectReportPeriod(14, this)">
                    <span class="period-num">14</span><span class="period-unit">天</span><span class="period-desc">两周汇总</span>
                </button>
                <button class="report-period-btn active" data-days="30" onclick="selectReportPeriod(30, this)">
                    <span class="period-num">30</span><span class="period-unit">天</span><span class="period-desc">月度报告</span>
                </button>
            </div>
            <button id="report-generate-btn" class="btn-primary" onclick="generateReport(currentReportDays)" style="width:100%;margin-top:12px;">
                📄 生成报告
            </button>
        </div>`;
    document.body.appendChild(overlay);
}

function closeReportDialog() {
    const el = document.getElementById("report-dialog-overlay");
    if (el) el.remove();
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
        const data = await collectReportData(days);
        closeReportDialog();

        // 打开打印窗口
        const win = window.open("", "_blank", "width=900,height=700");
        if (!win) {
            showToast("弹窗被拦截，请允许本站弹窗后重试");
            if (btn) { btn.disabled = false; btn.textContent = "📄 生成报告"; }
            return;
        }

        win.document.write(buildPrintHTML(data, days));
        win.document.close();
        win.focus();

        // 等 Chart.js 在打印窗口内渲染完成后触发打印
        // 打印窗口的 onRenderComplete 会调用 win.print()
        showToast("报告准备中，即将弹出打印对话框...");

    } catch (e) {
        console.error("Report failed:", e);
        showToast("报告生成失败: " + (e.message || "未知错误"));
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = "📄 生成报告"; }
    }
}

// ==================== 数据收集 ====================

async function collectReportData(days) {
    const today = new Date();
    const startDate = new Date(today); startDate.setDate(startDate.getDate() - days + 1);
    const dateStart = startDate.toISOString().split("T")[0];
    const dateEnd = today.toISOString().split("T")[0];

    // Build date list
    const dateList = [];
    for (let i = 0; i < days; i++) {
        const d = new Date(startDate); d.setDate(d.getDate() + i);
        dateList.push(d.toISOString().split("T")[0]);
    }

    // Labels (MM/DD)
    const labels = dateList.map(d => d.slice(5));

    // --- 情绪 ---
    const allMoods = await getMoodHistory(days);
    const dailyMood = calculateDailyWeightedMood(allMoods);
    const moodScores = dateList.map(d => dailyMood[d]?.score ?? null);
    const moodVals = moodScores.filter(s => s != null);
    const avgMood = moodVals.length ? (moodVals.reduce((a,b)=>a+b,0)/moodVals.length) : null;
    let maxMood = null, maxMoodDate = "", minMood = null, minMoodDate = "";
    dateList.forEach(d => {
        const s = dailyMood[d]?.score;
        if (s != null) {
            if (maxMood === null || s > maxMood) { maxMood = s; maxMoodDate = d; }
            if (minMood === null || s < minMood) { minMood = s; minMoodDate = d; }
        }
    });

    // --- 症状 ---
    const allSymptoms = await getSymptomHistory(days);
    const dailySymptom = calculateDailySymptomScore(allSymptoms);
    const symScores = dateList.map(d => dailySymptom[d]?.score || 0);

    // 症状频率统计
    const symStats = {}; // {symptom_id: {label, days, totalImpact, levels:{}}}
    dateList.forEach(d => {
        const sd = dailySymptom[d];
        if (sd?.symptom_list) {
            sd.symptom_list.forEach(s => {
                if (!symStats[s.symptom_id]) {
                    symStats[s.symptom_id] = { id: s.symptom_id, label: s.label, days: 0, totalImpact: 0, levels: {} };
                }
                symStats[s.symptom_id].days++;
                symStats[s.symptom_id].totalImpact += s.impact;
                const lvl = s.level_label || s.level;
                symStats[s.symptom_id].levels[lvl] = (symStats[s.symptom_id].levels[lvl] || 0) + 1;
            });
        }
    });
    const symRanking = Object.values(symStats).sort((a, b) => b.days - a.days);

    // 每个症状的每日严重度 (用于趋势图)
    const topSymptomTrends = symRanking.slice(0, 5).map(sym => {
        const dailyImpact = dateList.map(d => {
            const sd = dailySymptom[d];
            if (!sd?.symptom_list) return 0;
            const found = sd.symptom_list.find(s => s.symptom_id === sym.id);
            return found ? found.impact : 0;
        });
        return { id: sym.id, label: sym.label, data: dailyImpact };
    });

    // --- 服药 ---
    const userMeds = await getUserMedications();
    const medDetails = [];
    for (const um of userMeds) {
        const info = getMedicationInfo(um.med_id);
        const logs = await getMedicationLogs(um.id, dateStart);
        const remaining = calculatePillRemaining(um);
        const freq = um.frequency || {};
        const dosesPerDay = (freq.morning?1:0)+(freq.noon?1:0)+(freq.evening?1:0)+(freq.bedtime?1:0);
        const totalDays = Math.max(1, Math.floor((today - new Date(um.start_date))/86400000)+1);
        const scheduledFromStart = totalDays * dosesPerDay;
        const takenFromStart = (await getMedicationLogs(um.id)).length;

        // 报告时间段内的依从
        const periodDays = Math.min(days, totalDays);
        const periodScheduled = periodDays * dosesPerDay;
        const periodLogs = logs.filter(l => l.date >= dateStart && l.date <= dateEnd);
        const periodTaken = periodLogs.length;

        medDetails.push({
            userMed: um, info: info,
            remaining: remaining, dosesPerDay: dosesPerDay,
            totalDays: totalDays,
            adherenceAll: scheduledFromStart > 0 ? Math.round(takenFromStart/scheduledFromStart*100) : 0,
            adherencePeriod: periodScheduled > 0 ? Math.round(periodTaken/periodScheduled*100) : 0,
            periodTaken: periodTaken, periodScheduled: periodScheduled,
            takenAll: takenFromStart, scheduledAll: scheduledFromStart
        });
    }

    // --- 日记 ---
    const allDiaries = await getDiaryList();
    const diaries = allDiaries
        .filter(d => d.date >= dateStart && d.date <= dateEnd)
        .sort((a, b) => b.date.localeCompare(a.date));

    const userId = await getUserId();

    return {
        dateStart, dateEnd, days, userId, labels, dateList,
        // 情绪
        moodScores, avgMood, maxMood, maxMoodDate, minMood, minMoodDate,
        // 症状
        symScores, symRanking, topSymptomTrends,
        // 服药
        medDetails,
        // 日记
        diaries,
        hasMood: moodVals.length > 0,
        hasSym: symRanking.length > 0,
        hasMed: medDetails.length > 0,
        hasDiary: diaries.length > 0
    };
}

// ==================== 打印窗口 HTML ====================

function buildPrintHTML(data, days) {
    const moodEmojis = ["","😢","😢","😞","😞","😐","😐","🙂","🙂","😄","😄"];
    const e = moodEmojis;

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>心灵日记 · 健康报告</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"><\/script>
<style>
  @page { size: A4; margin: 10mm; }
  @media print {
    body { background: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page-break { page-break-before: always; }
    .no-print { display: none !important; }
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: "PingFang SC","Microsoft YaHei","Noto Sans SC",sans-serif; color: #2d3436; font-size: 12px; line-height: 1.6; background: #f5f5f5; }
  .report { max-width: 700px; margin: 0 auto; padding: 20px 24px; background: #fff; }

  .r-header { text-align: center; padding-bottom: 12px; border-bottom: 3px solid #5B8C5A; margin-bottom: 16px; }
  .r-header h1 { font-size: 20px; color: #5B8C5A; margin-bottom: 2px; }
  .r-header .r-meta { font-size: 10px; color: #636e72; }
  .r-header .r-meta span { margin: 0 6px; }

  .r-section { margin: 14px 0; page-break-inside: avoid; }
  .r-section h2 { font-size: 14px; color: #5B8C5A; border-bottom: 1px solid #e0e0e0; padding-bottom: 3px; margin-bottom: 8px; }
  .r-section h3 { font-size: 12px; color: #2d3436; margin: 8px 0 4px; }

  table { width: 100%; border-collapse: collapse; margin: 6px 0; font-size: 11px; }
  th, td { padding: 6px 8px; border: 1px solid #e0e0e0; text-align: center; }
  th { background: #f0f7f0; color: #2d3436; font-weight: 600; font-size: 10px; }
  td { font-size: 11px; }
  tr:nth-child(even) td { background: #fafafa; }

  .stat-row { display: flex; gap: 8px; margin: 8px 0; }
  .stat-card { flex:1; text-align:center; padding:8px 4px; border-radius:6px; background:#f8f9fa; border:1px solid #e9ecef; }
  .stat-card .val { font-size:18px; font-weight:700; }
  .stat-card .lbl { font-size:9px; color:#636e72; }

  .chart-wrap { margin: 8px 0; }
  .chart-wrap canvas { max-width: 100%; height: 200px !important; }

  .badge { display:inline-block; padding:2px 8px; border-radius:10px; font-size:10px; font-weight:600; }
  .badge-green { background:#e8f5e9; color:#27ae60; }
  .badge-orange { background:#fff3e0; color:#e67e22; }
  .badge-red { background:#ffebee; color:#c0392b; }
  .badge-gray { background:#f0f0f0; color:#636e72; }

  .med-card { padding:10px 12px; margin:6px 0; border-radius:6px; border:1px solid #e0e0e0; background:#fafafa; }
  .med-card .med-name { font-weight:700; font-size:13px; }
  .med-card .med-dose { font-size:10px; color:#636e72; margin-left:6px; }
  .med-card .med-row { display:flex; gap:10px; margin-top:6px; }
  .med-card .med-stat { text-align:center; flex:1; }
  .med-card .med-stat .v { font-size:15px; font-weight:700; }
  .med-card .med-stat .l { font-size:9px; color:#636e72; }
  .med-pill-info { margin-top:6px; padding:6px 8px; border-radius:4px; font-size:10px; }

  .diary-item { padding:6px 10px; margin:4px 0; border-left:3px solid #dfe6e9; background:#fafafa; border-radius:0 4px 4px 0; }
  .diary-item .dd { font-size:9px; color:#b2bec3; }
  .diary-item .dt { font-weight:600; font-size:11px; }
  .diary-item .dc { font-size:10px; color:#636e72; }

  .r-footer { margin-top:16px; padding-top:8px; border-top:1px solid #e0e0e0; text-align:center; font-size:8px; color:#b2bec3; }
  .r-footer p { margin:1px 0; }
  .r-empty { text-align:center; color:#b2bec3; padding:16px; font-size:12px; }
  .no-print { background:#5B8C5A; color:#fff; text-align:center; padding:10px; font-size:13px; margin-bottom:16px; border-radius:6px; }
</style>
</head>
<body>
<div class="no-print" id="print-hint">⏳ 报告生成中，请稍候...打印对话框将自动弹出</div>
<div class="report">

<!-- ===== HEADER ===== -->
<div class="r-header">
  <h1>🧠 心灵日记 · 健康报告</h1>
  <div class="r-meta">
    <span>📅 ${data.dateStart} ~ ${data.dateEnd}</span>
    <span>🆔 ${(data.userId||"unknown").substring(0,8)}</span>
    <span>🕐 ${new Date().toLocaleString("zh-CN")}</span>
  </div>
</div>

<!-- ===== 1. 服药依从性 (最重要) ===== -->
${data.hasMed ? `
<div class="r-section">
  <h2>💊 服药依从性</h2>
  ${data.medDetails.map(md => {
    const aCls = md.adherenceAll >= 80 ? "badge-green" : md.adherenceAll >= 50 ? "badge-orange" : "badge-red";
    const pCls = md.remaining.warningLevel === "danger" ? "badge-red" : md.remaining.warningLevel === "warning" ? "badge-orange" : "badge-green";
    const pillBg = md.remaining.warningLevel === "danger" ? "background:#ffebee;color:#c0392b;" : md.remaining.warningLevel === "warning" ? "background:#fff3e0;color:#e67e22;" : "background:#e8f5e9;color:#27ae60;";
    return `
  <div class="med-card">
    <div>
      <span class="med-name">${md.info ? md.info.name : md.userMed.med_id}</span>
      <span class="med-dose">${md.userMed.custom_dose||"?"} ${md.userMed.dose_unit||"mg"} · ${md.userMed.pills_per_dose||1}粒/次 · ${md.dosesPerDay}次/日</span>
      <span class="badge ${aCls}" style="float:right;">依从 ${md.adherenceAll}%</span>
    </div>
    <div class="med-row">
      <div class="med-stat"><div class="v">${md.takenAll}</div><div class="l">累计打卡</div></div>
      <div class="med-stat"><div class="v">${md.scheduledAll}</div><div class="l">应打卡</div></div>
      <div class="med-stat"><div class="v">${md.totalDays}</div><div class="l">用药天数</div></div>
      <div class="med-stat"><div class="v">${md.userMed.start_date?.slice(5)||"?"}</div><div class="l">开始日期</div></div>
    </div>
    ${data.days >= 14 ? `
    <div class="med-row" style="margin-top:4px;">
      <div class="med-stat"><div class="v">${md.periodTaken}/${md.periodScheduled}</div><div class="l">本时段打卡/应打</div></div>
      <div class="med-stat"><div class="v">${md.adherencePeriod}%</div><div class="l">本时段依从率</div></div>
    </div>` : ""}
    <div class="med-pill-info" style="${pillBg}">
      💊 剩余约 <b>${md.remaining.remaining}</b> 粒 · ${md.remaining.pillsPerDay}粒/天 · 预计可用 <b>${md.remaining.daysLeft}</b> 天
      ${md.remaining.warningLevel === "danger" ? " ⚠️ 请尽快续药！" : md.remaining.warningLevel === "warning" ? " ⚡ 建议提前续药" : " ✅ 药量充足"}
    </div>
    ${md.info?.contraindications?.filter(c=>c.severity==="danger").length ? `<div style="margin-top:4px;font-size:9px;color:#c0392b;">⚠️ ${md.info.contraindications.filter(c=>c.severity==="danger").map(c=>c.text).join("；")}</div>` : ""}
  </div>`;
  }).join("")}
</div>` : ""}

<!-- ===== 2. 症状分析 (核心) ===== -->
${data.hasSym ? `
<div class="r-section">
  <h2>🏥 症状追踪</h2>

  <!-- 症状频次排名表 -->
  <h3>📋 症状出现频次排名</h3>
  <table>
    <thead><tr><th>排名</th><th>症状</th><th>出现天数</th><th>占比</th><th>严重度分布</th><th>累计影响分</th></tr></thead>
    <tbody>
      ${data.symRanking.map((s, i) => `
      <tr>
        <td>${i+1}</td>
        <td style="text-align:left;font-weight:600;">${s.label}</td>
        <td>${s.days}天</td>
        <td>${Math.round(s.days/data.days*100)}%</td>
        <td>${Object.entries(s.levels).map(([lvl, n]) => `${lvl}×${n}`).join(" ") || "—"}</td>
        <td>${s.totalImpact.toFixed(1)}</td>
      </tr>`).join("")}
    </tbody>
  </table>

  <!-- 每日症状总分趋势 -->
  <h3>📈 每日症状总分趋势</h3>
  <div class="chart-wrap"><canvas id="chart-symptom-score"></canvas></div>

  <!-- TOP5 症状单独趋势 -->
  ${data.topSymptomTrends.length > 0 ? `
  <h3>📊 高频症状趋势 (TOP${Math.min(5, data.topSymptomTrends.length)})</h3>
  <div class="chart-wrap"><canvas id="chart-symptom-detail"></canvas></div>
  ` : ""}
</div>` : `<div class="r-section"><h2>🏥 症状追踪</h2><div class="r-empty">📭 所选时间段无症状记录</div></div>`}

<!-- ===== 3. 情绪摘要 ===== -->
${data.hasMood ? `
<div class="r-section">
  <h2>😊 情绪摘要</h2>
  <div class="stat-row">
    <div class="stat-card"><div class="val">${data.avgMood!=null ? e[Math.round(data.avgMood)]+" "+data.avgMood.toFixed(1) : "—"}</div><div class="lbl">平均情绪 (1-10)</div></div>
    <div class="stat-card"><div class="val">${e[Math.round(data.maxMood)]} ${data.maxMood}</div><div class="lbl">最高 · ${data.maxMoodDate.slice(5)}</div></div>
    <div class="stat-card"><div class="val">${data.minMood!=null ? e[Math.round(data.minMood)]+" "+data.minMood : "—"}</div><div class="lbl">最低 · ${data.minMoodDate.slice(5)}</div></div>
    <div class="stat-card"><div class="val">${data.moodScores.filter(s=>s!=null).length}/${data.days}</div><div class="lbl">记录天数</div></div>
  </div>
  <div class="chart-wrap"><canvas id="chart-mood"></canvas></div>
</div>` : ""}

<!-- ===== 4. 日记摘要 ===== -->
${data.hasDiary ? `
<div class="r-section">
  <h2>📔 近期日记</h2>
  ${data.diaries.slice(0, 5).map(d => `
  <div class="diary-item">
    <div class="dd">📅 ${d.date} · 心情 ${d.mood_at_time||"?"}/10</div>
    <div class="dt">${escapeHtml(d.title||"无标题")}</div>
    <div class="dc">${escapeHtml((d.content||"").substring(0,120))}${(d.content||"").length>120?"...":""}</div>
  </div>`).join("")}
</div>` : ""}

<!-- ===== FOOTER ===== -->
<div class="r-footer">
  <p>本报告由 <b>心灵日记</b> App 自动生成，数据来源于用户设备端记录。</p>
  <p>此报告仅供医疗参考，不构成诊断或治疗建议。</p>
  <p>Generated by Mind Journal · ${new Date().toISOString().split("T")[0]}</p>
</div>

</div><!-- .report -->

<script>
// ===== 嵌入数据 =====
var D = ${JSON.stringify({
  labels: data.labels,
  moodScores: data.moodScores,
  symScores: data.symScores,
  topSymptomTrends: data.topSymptomTrends
})};

// ===== 颜色 =====
function scoreColor(s) {
  if (s == null) return "#B2BEC3";
  if (s <= 3) return "#E76F6F";
  if (s <= 5) return "#F4A261";
  if (s <= 7) return "#7EB5D6";
  return "#5B8C5A";
}

// ===== 渲染所有图表 =====
var chartsToRender = 0;
var chartsDone = 0;

function onChartDone() {
  chartsDone++;
  if (chartsDone >= chartsToRender) {
    // 所有图表渲染完毕，触发打印
    document.getElementById("print-hint").textContent = "✅ 报告就绪，正在打开打印对话框...";
    setTimeout(function() { window.print(); }, 300);
  }
}

// 1) 情绪折线图
if (document.getElementById("chart-mood")) {
  chartsToRender++;
  new Chart(document.getElementById("chart-mood"), {
    type: "line",
    data: {
      labels: D.labels,
      datasets: [{
        label: "加权情绪分",
        data: D.moodScores,
        borderColor: "#5B8C5A",
        backgroundColor: "rgba(91,140,90,0.06)",
        borderWidth: 2, fill: true, tension: 0.3,
        pointRadius: D.moodScores.map(function(s){return s!=null?3:0;}),
        pointBackgroundColor: D.moodScores.map(scoreColor),
        spanGaps: false
      }]
    },
    options: {
      animation: { duration: 300, onComplete: onChartDone },
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { min:1, max:10, ticks:{stepSize:1,font:{size:10}}, grid:{color:"#f0f0f0"} },
        x: { ticks:{font:{size:8},maxRotation:45}, grid:{display:false} }
      }
    }
  });
}

// 2) 症状总分柱状图
if (document.getElementById("chart-symptom-score")) {
  chartsToRender++;
  new Chart(document.getElementById("chart-symptom-score"), {
    type: "bar",
    data: {
      labels: D.labels,
      datasets: [{
        label: "症状总分",
        data: D.symScores,
        backgroundColor: D.symScores.map(function(s){
          return s>=15?"rgba(192,57,43,0.7)":s>=8?"rgba(231,111,111,0.7)":s>=3?"rgba(244,162,97,0.7)":"rgba(149,165,166,0.4)";
        }),
        borderColor: D.symScores.map(function(s){
          return s>=15?"#C0392B":s>=8?"#E76F6F":s>=3?"#F4A261":"#95A5A6";
        }),
        borderWidth:1, borderRadius:3
      }]
    },
    options: {
      animation: { duration: 300, onComplete: onChartDone },
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero:true, grid:{color:"#f0f0f0"}, ticks:{font:{size:10}} },
        x: { ticks:{font:{size:8},maxRotation:45}, grid:{display:false} }
      }
    }
  });
}

// 3) TOP5 症状趋势 (多线)
if (document.getElementById("chart-symptom-detail")) {
  chartsToRender++;
  var colors = ["#E76F6F","#F4A261","#7EB5D6","#5B8C5A","#9B59B6"];
  var datasets = D.topSymptomTrends.map(function(sym, i){
    return {
      label: sym.label,
      data: sym.data,
      borderColor: colors[i],
      backgroundColor: "transparent",
      borderWidth: 2, tension: 0.3,
      pointRadius: 2, pointBackgroundColor: colors[i],
      fill: false
    };
  });
  new Chart(document.getElementById("chart-symptom-detail"), {
    type: "line",
    data: { labels: D.labels, datasets: datasets },
    options: {
      animation: { duration: 300, onComplete: onChartDone },
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position:"bottom", labels:{boxWidth:10,font:{size:9},padding:8} }
      },
      scales: {
        y: { beginAtZero:true, grid:{color:"#f0f0f0"}, ticks:{font:{size:10}}, title:{display:true,text:"严重度(分)",font:{size:9}} },
        x: { ticks:{font:{size:8},maxRotation:45}, grid:{display:false} }
      }
    }
  });
}

// 带 fallback：如果某些 canvas 不存在图表，倒计时 1 秒后直接打印
if (chartsToRender === 0) {
  setTimeout(function() { window.print(); }, 500);
} else {
  setTimeout(function() {
    if (chartsDone < chartsToRender) {
      console.warn("Charts timeout, printing anyway");
      window.print();
    }
  }, 3000);
}
<\/script>
</body>
</html>`;
}
