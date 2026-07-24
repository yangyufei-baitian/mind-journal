/* ============================================
   charts.js v0.3 — 每日曲线 + 加权情绪 + 症状分 + 单症状趋势
   ============================================ */

let moodChartInstance = null;
let symptomChartInstance = null;
let singleSymChartInstance = null;
let currentChartPeriod = "week";

const moodEmojis = ["", "😢", "😢", "😞", "😞",
                     "😐", "😐", "🙂", "🙂",
                     "😄", "😄"];

async function loadCharts() {
    if (currentChartPeriod === "day") {
        await loadDailyCurve();
    } else {
        await loadMoodChart();
    }
    await loadSymptomChart();
    loadSingleSymptomChart();
    if (currentChartPeriod !== "day") loadHistoryList();
}

// ==================== 今日时段曲线 ====================

async function loadDailyCurve() {
    const today = new Date().toISOString().split("T")[0];
    const allMoods = await db.moodEntries.toArray();
    const todayMoods = allMoods.filter(e => e.date === today);

    // 构建7个时段的标签和数据
    const labels = TIME_PERIODS.map(tp =>
        tp.id.replace("-", ":00-") + ":00\n" + tp.label
    );
    const scores = TIME_PERIODS.map(tp => {
        const m = todayMoods.find(e => e.time_period === tp.id);
        return m ? m.score : null;
    });
    const weights = TIME_PERIODS.map(tp => tp.hours * tp.bio_weight);

    const ctx = document.getElementById("mood-chart").getContext("2d");
    if (moodChartInstance) moodChartInstance.destroy();

    moodChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "情绪分",
                data: scores,
                borderColor: "#5B8C5A",
                backgroundColor: "rgba(91,140,90,0.1)",
                borderWidth: 2.5,
                fill: true,
                tension: 0.4,
                pointRadius: 8,
                pointBackgroundColor: scores.map(s => s ? scoreColor(s) : "#ddd"),
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                spanGaps: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            onClick: (e, elements) => {
                if (elements.length > 0 && scores[elements[0].index] !== null) {
                    showDailyDetail(today);
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            if (ctx.raw === null) return "暂无记录";
                            const tp = TIME_PERIODS[ctx.dataIndex];
                            return `情绪: ${ctx.raw}/10 (权重:${(tp.hours*tp.bio_weight).toFixed(1)})`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    min: 1, max: 10,
                    ticks: { stepSize: 1, callback: v => moodEmojis[v] || v, font: { size: 16 } },
                    grid: { color: "#f0f0f0" }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 9 }, maxRotation: 0 }
                }
            }
        }
    });

    // 同时加载今天的历史列表
    await loadTodayHistoryList();
}

// ==================== 加权情绪趋势 (周/月) ====================

async function loadMoodChart() {
    const days = currentChartPeriod === "week" ? 7 : 30;
    const history = await getMoodHistory(days);
    const dailyScores = calculateDailyWeightedMood(history);

    const labels = [], scores = [], pointCounts = [];
    const today = new Date();
    const dateList = [];

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const ds = d.toISOString().split("T")[0];
        dateList.push(ds);
        labels.push(`${d.getMonth()+1}/${d.getDate()}`);
        const sc = dailyScores[ds];
        scores.push(sc ? sc.score : null);
        pointCounts.push(sc ? sc.period_count : 0);
    }

    const ctx = document.getElementById("mood-chart").getContext("2d");
    if (moodChartInstance) moodChartInstance.destroy();

    moodChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "加权情绪分",
                data: scores,
                borderColor: "#5B8C5A",
                backgroundColor: "rgba(91,140,90,0.08)",
                borderWidth: 2.5,
                fill: true,
                tension: 0.3,
                pointRadius: scores.map((s, i) => pointCounts[i] > 0 ? 6 : 0),
                pointBackgroundColor: scores.map(s => scoreColor(s)),
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                spanGaps: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            onClick: (e, elements) => {
                if (elements.length > 0 && scores[elements[0].index] !== null) {
                    showDailyDetail(dateList[elements[0].index]);
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const cnt = pointCounts[ctx.dataIndex];
                            return cnt > 0 ? `加权分: ${ctx.raw} (${cnt}时段)` : "暂无记录";
                        }
                    }
                }
            },
            scales: {
                y: {
                    min: 1, max: 10,
                    ticks: { stepSize: 1, callback: v => moodEmojis[v] || v, font:{size:16} },
                    grid: { color: "#f0f0f0" }
                },
                x: { grid: { display: false }, ticks: { font:{size:10} } }
            }
        }
    });
}

// ==================== 症状分柱状图 ====================

async function loadSymptomChart() {
    const days = currentChartPeriod === "week" ? 7 : 30;
    const history = await getSymptomHistory(days);
    const dailyScores = calculateDailySymptomScore(history);

    const labels = [], scores = [], dateList = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today); d.setDate(d.getDate() - i);
        const ds = d.toISOString().split("T")[0];
        dateList.push(ds);
        labels.push(`${d.getMonth()+1}/${d.getDate()}`);
        const sc = dailyScores[ds];
        scores.push(sc ? sc.score : 0);
    }

    const ctx = document.getElementById("symptom-chart").getContext("2d");
    if (symptomChartInstance) symptomChartInstance.destroy();

    symptomChartInstance = new Chart(ctx, {
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
                borderWidth: 1, borderRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            onClick: (e, elements) => {
                if (elements.length > 0) showDailyDetail(dateList[elements[0].index]);
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ctx.raw === 0 ? "无记录" :
                            ctx.raw >= 15 ? `危机: ${ctx.raw}分` :
                            ctx.raw >= 8 ? `严重: ${ctx.raw}分` :
                            ctx.raw >= 3 ? `中度: ${ctx.raw}分` : `轻微: ${ctx.raw}分`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: "#f0f0f0" }
                },
                x: { grid: { display: false }, ticks: { font:{size:10} } }
            }
        }
    });
}

// ==================== 单症状趋势 ====================

function buildSingleSymptomSelector() {
    const select = document.getElementById("single-symptom-select");
    if (!select || select.options.length > 1) return; // 已构建

    SYMPTOM_CONFIG.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s.id;
        opt.textContent = `${s.emoji} ${s.label} (${s.category})`;
        select.appendChild(opt);
    });
}

async function loadSingleSymptomChart() {
    const symptomId = document.getElementById("single-symptom-select").value;
    if (!symptomId) {
        document.getElementById("single-symptom-chart-container").style.display = "none";
        return;
    }

    document.getElementById("single-symptom-chart-container").style.display = "block";

    const days = 30;
    const history = await getSymptomHistory(days);
    const config = SYMPTOM_MAP[symptomId];
    if (!config) return;

    // 按日期提取该症状的严重度
    const today = new Date();
    const labels = [], impacts = [], dateList = [];

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today); d.setDate(d.getDate() - i);
        const ds = d.toISOString().split("T")[0];
        dateList.push(ds);
        labels.push(`${d.getMonth()+1}/${d.getDate()}`);

        // 当天所有含该症状的记录，取最严重
        let maxImpact = 0;
        history.filter(e => e.date === ds).forEach(e => {
            (e.symptoms || []).forEach(s => {
                if (s.symptom_id === symptomId) {
                    const lvl = config.levels.find(l => l.id === s.level);
                    if (lvl) {
                        const impact = config.base_weight * lvl.coef;
                        if (impact > maxImpact) maxImpact = impact;
                    }
                }
            });
        });
        impacts.push(maxImpact);
    }

    const ctx = document.getElementById("single-symptom-chart").getContext("2d");
    if (singleSymChartInstance) singleSymChartInstance.destroy();

    singleSymChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: `${config.label} 严重度`,
                data: impacts,
                backgroundColor: impacts.map(i =>
                    i >= config.base_weight * 3 ? "rgba(192,57,43,0.7)" :
                    i >= config.base_weight * 2 ? "rgba(231,111,111,0.7)" :
                    i > 0 ? "rgba(244,162,97,0.7)" : "rgba(200,200,200,0.3)"
                ),
                borderWidth: 1, borderRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ctx.raw === 0 ? "无症状" :
                            `${config.label}: ${ctx.raw}分 (基础权重${config.base_weight})`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: Math.max(config.base_weight * 3 + 2, 10),
                    ticks: {
                        callback: v => v === 0 ? "无" : v
                    },
                    grid: { color: "#f0f0f0" }
                },
                x: { grid: { display: false }, ticks: { font:{size:10} } }
            }
        }
    });
}

// ==================== 每日详情面板 ====================

async function showDailyDetail(dateStr) {
    const section = document.getElementById("daily-detail");
    const title = document.getElementById("daily-detail-title");
    const content = document.getElementById("daily-detail-content");

    title.textContent = `\u{1F4CB} ${dateStr} 详情`;

    const allMoodsArr = await db.moodEntries.toArray();
    const allMoods = allMoodsArr.filter(e => e.date === dateStr);
    const allSymptomArr = await db.symptomEntries.toArray();
    const allSymptoms = allSymptomArr.filter(e => e.date === dateStr);

    if (allMoods.length === 0 && allSymptoms.length === 0) {
        content.innerHTML = '<p style="color:var(--text-muted);text-align:center;">当天没有记录</p>';
        section.style.display = "block";
        return;
    }

    let html = "";

    // 情绪
    if (allMoods.length > 0) {
        const dailyScores = calculateDailyWeightedMood(allMoods);
        const ds = dailyScores[dateStr];
        html += `<div class="detail-section"><h4>\u{1F60A} 情绪记录 (加权分: ${ds?.score ?? "N/A"} | ${ds?.period_count ?? 0}时段)</h4>`;
        TIME_PERIODS.forEach(tp => {
            const mood = allMoods.find(m => m.time_period === tp.id);
            if (mood) {
                html += `<div class="detail-mood-item">
                    <span>\u{1F550} ${tp.id.replace("-",":00-")}:00 ${tp.label}</span>
                    <span>${moodEmojis[mood.score]} ${mood.score}/10</span>
                    <span style="font-size:0.7rem;color:var(--text-muted);">权重:${(tp.hours*tp.bio_weight).toFixed(1)}</span></div>`;
                if (mood.emotion_tags?.length) {
                    html += `<div style="font-size:0.72rem;color:var(--text-light);margin-left:20px;margin-bottom:4px;">
                        感受: ${mood.emotion_tags.join(" · ")}</div>`;
                }
                if (mood.note) {
                    html += `<div style="font-size:0.72rem;color:var(--text-light);margin-left:20px;margin-bottom:4px;">
                        \u{1F4DD} ${mood.note}</div>`;
                }
            }
        });
        html += '</div>';
    }

    // 症状
    if (allSymptoms.length > 0) {
        const symScores = calculateDailySymptomScore(allSymptoms);
        const sds = symScores[dateStr];
        html += `<div class="detail-section"><h4>\u{1F3E5} 症状记录 (总分: ${sds?.score ?? 0})</h4>`;
        if (sds?.symptom_list) {
            sds.symptom_list.forEach(s => {
                const sevClass = s.impact >= 15 ? "severity-severe" :
                                 s.impact >= 8 ? "severity-moderate" : "severity-mild";
                html += `<div class="detail-symptom-item ${sevClass}">
                    <div><strong>${s.label}</strong>
                        <span style="font-size:0.7rem;color:var(--text-light);"> — ${s.level_label}</span>
                        ${s.frequency ? `<br><span style="font-size:0.7rem;color:var(--text-light);">频率: ${s.frequency}</span>` : ""}
                    </div><span style="font-weight:600;">${s.impact}分</span></div>`;
            });
        }
        html += '</div>';
    }

    content.innerHTML = html;
    section.style.display = "block";
    section.scrollIntoView({ behavior: "smooth" });
}

// ==================== 历史列表 ====================

async function loadHistoryList() {
    const container = document.getElementById("history-list");
    const days = currentChartPeriod === "week" ? 7 : 30;
    const moods = await getMoodHistory(days);
    const syms = await getSymptomHistory(days);
    const dailyM = calculateDailyWeightedMood(moods);
    const dailyS = calculateDailySymptomScore(syms);

    const allDates = new Set();
    Object.keys(dailyM).forEach(d => allDates.add(d));
    Object.keys(dailyS).forEach(d => allDates.add(d));
    const sorted = Array.from(allDates).sort().reverse();

    if (sorted.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">\u{1F4CB}</div><p>还没有记录哦</p></div>';
        return;
    }

    container.innerHTML = sorted.map(date => {
        const m = dailyM[date], s = dailyS[date];
        const sc = s && s.score >= 15 ? "severity-severe" : s && s.score >= 8 ? "severity-moderate" : s && s.score >= 3 ? "severity-mild" : "";
        return `<div class="history-item" onclick="showDailyDetail('${date}')">
            <div><div class="history-date">${date}</div>
            ${s && s.score > 0 ? `<div class="history-symptom-score ${sc}" style="display:inline-block;color:white;">\u{1F3E5} ${s.score}分 · ${s.symptom_list.length}项</div>` : ""}</div>
            <div style="text-align:right;">
            ${m ? `<div class="history-mood-score" style="color:${scoreColor(m.score)}">${moodEmojis[Math.round(m.score)]} ${m.score}</div>
            <div style="font-size:0.65rem;color:var(--text-muted);">${m.period_count}时段</div>` : ""}</div></div>`;
    }).join("");
}

async function loadTodayHistoryList() {
    // 每日视图只显示今天的记录
    const container = document.getElementById("history-list");
    const today = new Date().toISOString().split("T")[0];
    container.innerHTML = `<div class="history-item" onclick="showDailyDetail('${today}')" style="justify-content:center;">
        <span style="color:var(--primary);">\u{1F4C5} 点击查看今日详情</span></div>`;
}

// ==================== 辅助 ====================

function scoreColor(score) {
    if (!score && score !== 0) return "#B2BEC3";
    if (score <= 3) return "#E76F6F";
    if (score <= 5) return "#F4A261";
    if (score <= 7) return "#7EB5D6";
    return "#5B8C5A";
}
