/* ============================================
   app.js v0.4
   新增: 症状折叠/搜索优先 | 时段标记 | 症状色彩 | 快捷排序 | 周摘要
   ============================================ */

const pageTitles = {
    record: "📝 今日记录", stats: "📊 统计趋势",
    diary: "📔 日记本", music: "🎵 安心音乐", settings: "⚙️ 设置"
};

const EMOTION_TAGS_POSITIVE = [
    { id: "开心", emoji: "😄", label: "开心" },
    { id: "平静", emoji: "😌", label: "平静" },
    { id: "满足", emoji: "😊", label: "满足" },
    { id: "有动力", emoji: "💪", label: "有动力" },
    { id: "感恩", emoji: "🤗", label: "感恩" }
];
const EMOTION_TAGS_NEUTRAL = [
    { id: "一般", emoji: "😐", label: "一般" },
    { id: "迷茫", emoji: "🤔", label: "迷茫" }
];
const EMOTION_TAGS_NEGATIVE = [
    { id: "低落", emoji: "😞", label: "低落" },
    { id: "焦虑", emoji: "😰", label: "焦虑" },
    { id: "易怒", emoji: "😤", label: "易怒" },
    { id: "恐惧", emoji: "😨", label: "恐惧" },
    { id: "悲伤", emoji: "😢", label: "悲伤" }
];

let currentTimePeriod = null;
let selectedSymptoms = {};
let symptomListExpanded = false;

// ==================== 导航 ====================

function switchPage(pageName) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(`page-${pageName}`)?.classList.add("active");
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    document.querySelector(`.nav-btn[data-page="${pageName}"]`)?.classList.add("active");
    document.getElementById("page-title").textContent = pageTitles[pageName] || pageName;

    try {
        if (pageName === "stats") { buildSingleSymptomSelector(); loadCharts(); renderScaleCards(); renderScaleTrendChart(); }
        else if (pageName === "music") { loadMusicList(); }
        else if (pageName === "settings") { loadContactList(); loadConsentSettings(); }
        else if (pageName === "record") { updateTodaySummary(); loadWeeklySummary(); renderMedicationCheckins(); }
        else if (pageName === "diary") { loadDiaryList(); }
    } catch (e) {
        console.warn("switchPage init error:", pageName, e);
    }
}

// ==================== 初始化 ====================

document.addEventListener("DOMContentLoaded", () => {
    buildTimePeriods();
    buildEmotionTags();
    buildSymptomCards();
    buildCategoryFilter();
    try { buildSingleSymptomSelector(); } catch(e) { console.warn("single-symptom:", e); }
    try { buildAmbientSounds(); } catch(e) { console.warn("ambient:", e); }
    try { buildAccountUI(); } catch(e) { console.warn("account:", e); }
    try { renderMedicationCheckins(); } catch(e) { console.warn("medication:", e); }
    try { renderScaleCards(); } catch(e) { console.warn("scales:", e); }

    // 弹窗点击外部关闭
    document.getElementById("med-manager-overlay")?.addEventListener("click", function(e) {
        if (e.target === this) closeMedicationManager();
    });
    document.getElementById("med-detail-overlay")?.addEventListener("click", function(e) {
        if (e.target === this) closeMedicationDetail();
    });

    const slider = document.getElementById("mood-slider");
    if (slider) slider.addEventListener("input", () => {
        const v = parseInt(slider.value);
        const e = ["","😢","😢","😞","😞","😐","😐","🙂","🙂","😄","😄"];
        document.getElementById("mood-emoji").textContent = e[v];
        document.getElementById("mood-score").textContent = v;
    });

    document.querySelectorAll(".chart-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".chart-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            currentChartPeriod = tab.dataset.period;
            loadCharts();
        });
    });

    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.addEventListener("click", () => switchPage(btn.dataset.page));
    });

    document.getElementById("save-record")?.addEventListener("click", saveRecord);
    document.getElementById("save-diary")?.addEventListener("click", saveDiary);
    document.getElementById("add-music")?.addEventListener("click", addMusicTrack);
    document.getElementById("add-contact")?.addEventListener("click", addContact);
    document.getElementById("sync-now")?.addEventListener("click", syncData);
    document.getElementById("export-report")?.addEventListener("click", showReportDialog);
    document.getElementById("export-data")?.addEventListener("click", exportDataHandler);
    document.getElementById("clear-data")?.addEventListener("click", clearDataHandler);
    // CSV 导出按钮
    document.getElementById("export-all-csv")?.addEventListener("click", exportAllCSV);
    document.getElementById("export-mood-csv")?.addEventListener("click", () => csvExportWrapper(exportMoodCSV, "情绪"));
    document.getElementById("export-symptom-csv")?.addEventListener("click", () => csvExportWrapper(exportSymptomCSV, "症状"));
    document.getElementById("export-scale-csv")?.addEventListener("click", () => csvExportWrapper(exportScaleCSV, "量表"));
    document.getElementById("export-med-csv")?.addEventListener("click", () => csvExportWrapper(exportMedicationCSV, "服药"));

    document.getElementById("share-mood")?.addEventListener("change", async function() {
        await updateConsentSettings({ share_mood: this.checked });
        showToast(this.checked ? "已开启情绪数据共享" : "已关闭情绪数据共享");
    });
    document.getElementById("share-diary")?.addEventListener("change", async function() {
        await updateConsentSettings({ share_diary: this.checked });
        showToast(this.checked ? "已开启日记数据共享" : "已关闭日记数据共享");
    });

    getUserId().then(id => console.log("[MindJournal v0.4] User:", id));
    updateTodaySummary();
    loadWeeklySummary();

    // 首次访问 → 显示引导页
    if (checkOnboarding()) {
        setTimeout(() => showOnboarding(), 600);
    }
});

// ==================== 时段选择器 (v0.4: 标记已记录时段) ====================

function buildTimePeriods() {
    const container = document.getElementById("time-periods");
    const now = new Date(), h = now.getHours();

    container.innerHTML = TIME_PERIODS.map(tp => {
        const [s, e] = tp.id.split("-").map(Number);
        const isCurrent = h >= s && h < (e || 24);
        return `<button class="time-period-btn ${isCurrent ? 'selected' : ''}"
            data-period="${tp.id}" onclick="selectTimePeriod('${tp.id}', this)">
            <span class="period-time">${tp.id.replace("-",":00-")}:00</span>
            <span class="period-label">${tp.label}</span>
            <span class="period-badge" data-period-badge="${tp.id}" style="display:none;">✓</span>
            </button>`;
    }).join("");

    const currentTP = TIME_PERIODS.find(tp => {
        const [s, e] = tp.id.split("-").map(Number);
        return h >= s && h < (e || 24);
    });
    if (currentTP) { currentTimePeriod = currentTP.id; loadPeriodData(currentTP.id); }

    // 更新时段标记
    updatePeriodBadges();
}

async function updatePeriodBadges() {
    const todayMoods = await getTodayMoods();
    const todaySymptoms = await getTodaySymptoms();

    TIME_PERIODS.forEach(tp => {
        const badge = document.querySelector(`[data-period-badge="${tp.id}"]`);
        if (!badge) return;
        const hasMood = todayMoods.some(m => m.time_period === tp.id);
        const hasSymptom = todaySymptoms.some(s => s.time_period === tp.id);
        if (hasMood || hasSymptom) {
            badge.style.display = "inline-block";
            badge.style.background = hasMood && hasSymptom ? "var(--primary)" :
                                     hasMood ? "#7EB5D6" : "#F4A261";
        } else {
            badge.style.display = "none";
        }
    });
}

function selectTimePeriod(pid, btn) {
    document.querySelectorAll(".time-period-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    currentTimePeriod = pid;
    selectedSymptoms = {};
    symptomListExpanded = false;
    document.getElementById("symptom-list").style.display = "none";
    document.getElementById("symptom-toggle-btn").textContent = "📋 展开症状列表 (39项)";
    document.getElementById("symptom-toggle-btn").classList.remove("open");
    loadPeriodData(pid);
}

async function loadPeriodData(pid) {
    const today = new Date().toISOString().split("T")[0];
    const emojis = ["","😢","😢","😞","😞","😐","😐","🙂","🙂","😄","😄"];

    // 情绪
    const allMoods = await db.moodEntries.toArray();
    const existingMood = allMoods.find(e => e.date === today && e.time_period === pid);
    if (existingMood) {
        document.getElementById("mood-slider").value = existingMood.score;
        document.getElementById("mood-emoji").textContent = emojis[existingMood.score];
        document.getElementById("mood-score").textContent = existingMood.score;
        document.querySelectorAll(".tag").forEach(t => t.classList.remove("selected"));
        (existingMood.emotion_tags || []).forEach(tid => {
            document.querySelector(`.tag[data-tag="${tid}"]`)?.classList.add("selected");
        });
        document.getElementById("mood-note").value = existingMood.note || "";
    } else {
        document.getElementById("mood-slider").value = 5;
        document.getElementById("mood-emoji").textContent = "😐";
        document.getElementById("mood-score").textContent = "5";
        document.querySelectorAll(".tag").forEach(t => t.classList.remove("selected"));
        document.getElementById("mood-note").value = "";
    }

    // 症状
    selectedSymptoms = {};
    document.querySelectorAll(".symptom-card").forEach(c => {
        c.classList.remove("has-symptom", "level-mild", "level-moderate", "level-severe");
        c.querySelectorAll(".level-btn").forEach(b => b.classList.remove("selected"));
        const fi = c.querySelector(".symptom-frequency input, .symptom-frequency select");
        if (fi) fi.value = "";
    });

    const allSyms = await db.symptomEntries.toArray();
    const existingSym = allSyms.find(e => e.date === today && e.time_period === pid);
    if (existingSym?.symptoms) {
        existingSym.symptoms.forEach(s => {
            selectedSymptoms[s.symptom_id] = { level: s.level, frequency: s.frequency || "" };
            const card = document.querySelector(`.symptom-card[data-symptom="${s.symptom_id}"]`);
            if (card) {
                card.classList.add("has-symptom", `level-${s.level}`);
                card.querySelector(`.level-btn.${s.level}`)?.classList.add("selected");
                const fi = card.querySelector(".symptom-frequency input, .symptom-frequency select");
                if (fi && s.frequency) fi.value = s.frequency;
            }
        });
        // 有已有症状时自动展开列表
        expandSymptomList();
    }

    updateSelectedBadges();
    filterSymptoms();
    sortSymptoms();
}

// ==================== 症状列表折叠/展开 ====================

function toggleSymptomList() {
    symptomListExpanded ? collapseSymptomList() : expandSymptomList();
}

function expandSymptomList() {
    symptomListExpanded = true;
    document.getElementById("symptom-list").style.display = "block";
    const btn = document.getElementById("symptom-toggle-btn");
    btn.textContent = "📋 收起症状列表";
    btn.classList.add("open");
    sortSymptoms();
    filterSymptoms();
}

function collapseSymptomList() {
    symptomListExpanded = false;
    document.getElementById("symptom-list").style.display = "none";
    const btn = document.getElementById("symptom-toggle-btn");
    btn.textContent = `📋 展开症状列表 (${SYMPTOM_CONFIG.length}项)`;
    btn.classList.remove("open");
}

// ==================== 症状排序：记录过的排前面 ====================

async function getSymptomUsageCounts() {
    const all = await db.symptomEntries.toArray();
    const counts = {};
    all.forEach(e => {
        (e.symptoms || []).forEach(s => {
            counts[s.symptom_id] = (counts[s.symptom_id] || 0) + 1;
        });
    });
    return counts;
}

async function sortSymptoms() {
    if (!symptomListExpanded) return;
    const counts = await getSymptomUsageCounts();
    const container = document.getElementById("symptom-list");

    // 按使用次数降序排列
    const sorted = [...SYMPTOM_CONFIG].sort((a, b) => {
        const ca = counts[a.id] || 0;
        const cb = counts[b.id] || 0;
        if (ca !== cb) return cb - ca;  // 使用次数多的排前面
        return b.base_weight - a.base_weight;  // 同等次数，权重高的排前面
    });

    // 重新排列 DOM
    sorted.forEach(config => {
        const card = container.querySelector(`.symptom-card[data-symptom="${config.id}"]`);
        if (card) container.appendChild(card);
    });
}

// ==================== 症状色彩标记 + 徽章 ====================

function selectSymptomLevel(sid, level, btn) {
    btn.parentElement.querySelectorAll(".level-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    if (!selectedSymptoms[sid]) selectedSymptoms[sid] = { level, frequency: "" };
    else selectedSymptoms[sid].level = level;

    const card = document.querySelector(`.symptom-card[data-symptom="${sid}"]`);
    card?.classList.add("has-symptom");
    card?.classList.remove("level-mild", "level-moderate", "level-severe");
    card?.classList.add(`level-${level}`);

    updateSelectedBadges();
}

function updateSymptomFrequency(sid, val) {
    if (!selectedSymptoms[sid]) selectedSymptoms[sid] = { level: null, frequency: val };
    else selectedSymptoms[sid].frequency = val;
}

function updateSelectedBadges() {
    const container = document.getElementById("selected-symptoms-badges");
    const entries = Object.entries(selectedSymptoms).filter(([_, d]) => d.level);
    if (entries.length === 0) { container.style.display = "none"; return; }
    container.style.display = "flex";

    container.innerHTML = entries.map(([id, data]) => {
        const config = SYMPTOM_MAP[id];
        if (!config) return "";
        return `<span class="symptom-badge ${data.level}">
            ${config.emoji} ${config.label}
            <span class="badge-remove" onclick="removeSymptom('${id}')">✕</span>
        </span>`;
    }).join("");
}

function removeSymptom(sid) {
    delete selectedSymptoms[sid];
    const card = document.querySelector(`.symptom-card[data-symptom="${sid}"]`);
    card?.classList.remove("has-symptom", "level-mild", "level-moderate", "level-severe");
    card?.querySelectorAll(".level-btn").forEach(b => b.classList.remove("selected"));
    updateSelectedBadges();
}

// ==================== 情绪标签 ====================

function buildEmotionTags() {
    document.getElementById("emotion-positive").innerHTML = EMOTION_TAGS_POSITIVE.map(t =>
        `<button class="tag" data-tag="${t.id}">${t.emoji} ${t.label}</button>`).join("");
    document.getElementById("emotion-neutral").innerHTML = EMOTION_TAGS_NEUTRAL.map(t =>
        `<button class="tag" data-tag="${t.id}">${t.emoji} ${t.label}</button>`).join("");
    document.getElementById("emotion-negative").innerHTML = EMOTION_TAGS_NEGATIVE.map(t =>
        `<button class="tag" data-tag="${t.id}">${t.emoji} ${t.label}</button>`).join("");
    document.querySelectorAll(".tag").forEach(t => {
        t.addEventListener("click", () => t.classList.toggle("selected"));
    });
}

// ==================== 症状分类和搜索 ====================

function buildCategoryFilter() {
    const select = document.getElementById("symptom-category-filter");
    if (!select || select.options.length > 2) return;
    SYMPTOM_CATEGORIES.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat; opt.textContent = cat;
        select.appendChild(opt);
    });
}

function filterSymptoms() {
    const search = (document.getElementById("symptom-search")?.value || "").toLowerCase();
    const category = document.getElementById("symptom-category-filter")?.value || "all";

    document.querySelectorAll(".symptom-card").forEach(card => {
        const symId = card.dataset.symptom;
        const config = SYMPTOM_MAP[symId];
        if (!config) { card.style.display = "none"; return; }
        const matchSearch = !search || config.label.includes(search) ||
            config.category.includes(search) || symId.includes(search);
        const matchCategory = category === "all" || config.category === category;
        card.style.display = (matchSearch && matchCategory) ? "block" : "none";
    });
}

// ==================== 症状卡片构建 ====================

function buildSymptomCards() {
    const container = document.getElementById("symptom-list");
    container.innerHTML = SYMPTOM_CONFIG.map(s => {
        const wc = s.base_weight >= 8 ? "weight-crisis" :
                   s.base_weight >= 4 ? "weight-severe" :
                   s.base_weight >= 2 ? "weight-moderate" : "weight-mild";
        const levelsHtml = s.levels.map(l => `
            <button class="level-btn ${l.id}" data-level="${l.id}"
                onclick="selectSymptomLevel('${s.id}', '${l.id}', this); event.stopPropagation();">
                ${l.label}</button>`).join("");
        const freqHtml = s.needs_frequency ? `
            <div class="symptom-frequency"><span>频率/次数:</span>
                <input type="text" placeholder="如: 每天3次"
                    onchange="updateSymptomFrequency('${s.id}', this.value)"></div>` : "";
        return `<div class="symptom-card" data-symptom="${s.id}">
            <div class="symptom-header" onclick="toggleSymptomCard('${s.id}')">
                <span class="symptom-name">${s.emoji} ${s.label}</span>
                <span class="symptom-weight-badge ${wc}">${s.category} · ${s.base_weight}</span></div>
            <div class="symptom-detail"><div class="symptom-levels">${levelsHtml}</div>${freqHtml}</div></div>`;
    }).join("");
}

function toggleSymptomCard(sid) {
    const card = document.querySelector(`.symptom-card[data-symptom="${sid}"]`);
    if (!card.classList.contains("has-symptom")) {
        card.classList.add("has-symptom");
    } else if (!selectedSymptoms[sid]) {
        card.classList.remove("has-symptom", "level-mild", "level-moderate", "level-severe");
        card.querySelectorAll(".level-btn").forEach(b => b.classList.remove("selected"));
    }
}

// ==================== 保存 ====================

async function saveRecord() {
    if (!currentTimePeriod) { showToast("请先选择一个时段"); return; }
    const today = new Date().toISOString().split("T")[0];
    const score = parseInt(document.getElementById("mood-slider").value);
    const emotionTags = Array.from(
        document.querySelectorAll("#emotion-positive .tag.selected, #emotion-neutral .tag.selected, #emotion-negative .tag.selected")
    ).map(t => t.dataset.tag);

    try {
        await saveMoodEntry({ date: today, time_period: currentTimePeriod, score, emotion_tags: emotionTags, note: document.getElementById("mood-note").value.trim() });
    } catch (err) { console.error(err); showToast("情绪保存失败"); return; }

    const symList = Object.entries(selectedSymptoms).filter(([_, d]) => d.level).map(([id, d]) => ({ symptom_id: id, level: d.level, frequency: d.frequency || null }));
    if (symList.length > 0) {
        try { await saveSymptomEntry({ date: today, time_period: currentTimePeriod, symptoms: symList }); }
        catch (err) { console.error(err); showToast("症状保存失败"); return; }
    }

    showToast("记录已保存 ✅");
    updateSyncStatus(false);
    updatePeriodBadges();
    updateTodaySummary();
    loadWeeklySummary();
}

async function updateTodaySummary() {
    const section = document.getElementById("today-summary");
    const content = document.getElementById("today-summary-content");
    const moods = await getTodayMoods();
    const syms = await getTodaySymptoms();
    const all = {};
    TIME_PERIODS.forEach(tp => {
        const m = moods.find(e => e.time_period === tp.id);
        const s = syms.find(e => e.time_period === tp.id);
        if (m || s) all[tp.id] = { ...tp, mood: m, symptom: s };
    });
    if (!Object.keys(all).length) { section.style.display = "none"; return; }
    section.style.display = "block";
    const e = ["","😢","😢","😞","😞","😐","😐","🙂","🙂","😄","😄"];
    content.innerHTML = Object.keys(all).map(pid => {
        const p = all[pid]; let d = "";
        if (p.mood) {
            d += `${e[p.mood.score]} 情绪:${p.mood.score}/10`;
            const tags = (p.mood.emotion_tags || []).join(" · ");
            if (tags) d += `<br>感受: ${tags}`;
        }
        if (p.symptom?.symptoms?.length) {
            d += `<br>🏥 ${p.symptom.symptoms.map(s => {
                const c = SYMPTOM_MAP[s.symptom_id]; const l = c?.levels.find(lv => lv.id === s.level); return `${c?.label||s.symptom_id}(${l?.label||s.level})`;
            }).join(", ")}`;
        }
        return `<div class="today-period-card"><div class="period-header">🕐 ${p.id.replace("-",":00-")}:00 — ${p.label}</div><div class="period-detail">${d}</div></div>`;
    }).join("");
}

// ==================== 周摘要卡片 ====================

async function loadWeeklySummary() {
    const content = document.getElementById("weekly-summary-content");
    const moods = await getMoodHistory(7);
    const syms = await getSymptomHistory(7);

    const dailyM = calculateDailyWeightedMood(moods);
    const dailyS = calculateDailySymptomScore(syms);

    const mScores = Object.values(dailyM).map(d => d.score).filter(s => s !== null);
    const sScores = Object.values(dailyS).map(d => d.score).filter(s => s > 0);

    const avgMood = mScores.length ? (mScores.reduce((a, b) => a + b, 0) / mScores.length).toFixed(1) : "—";
    const avgSym = sScores.length ? (sScores.reduce((a, b) => a + b, 0) / sScores.length).toFixed(1) : "—";
    const recordDays = Object.keys(dailyM).length;

    // 趋势：比较前3天和后3天
    const trend = (arr) => {
        if (arr.length < 4) return "—";
        const first = arr.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
        const last = arr.slice(-3).reduce((a, b) => a + b, 0) / 3;
        if (last - first > 0.5) return "↑ 上升";
        if (last - first < -0.5) return "↓ 下降";
        return "→ 平稳";
    };

    const moodEmoji = avgMood !== "—" ?
        (avgMood >= 7 ? "😊" : avgMood >= 4 ? "😐" : "😞") : "❓";
    const symLevel = avgSym !== "—" ?
        (avgSym >= 15 ? "🔴" : avgSym >= 8 ? "🟠" : avgSym >= 3 ? "🟡" : "🟢") : "❓";

    content.innerHTML = `
        <div class="weekly-summary-grid">
            <div class="summary-item">
                <div class="summary-value">${moodEmoji} ${avgMood}</div>
                <div class="summary-label">情绪均值</div>
                <div class="summary-trend" style="color:${trend(mScores).includes('上升') ? 'var(--primary)' : trend(mScores).includes('下降') ? 'var(--danger)' : 'var(--text-muted)'}">${trend(mScores)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${symLevel} ${avgSym}</div>
                <div class="summary-label">症状均分</div>
                <div class="summary-trend" style="color:${trend(sScores).includes('下降') ? 'var(--primary)' : trend(sScores).includes('上升') ? 'var(--danger)' : 'var(--text-muted)'}">${trend(sScores).includes('上升') ? '↑ 加重' : trend(sScores).includes('下降') ? '↓ 好转' : '→ 平稳'}</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">📅 ${recordDays}</div>
                <div class="summary-label">记录天数</div>
                <div class="summary-trend" style="color:var(--text-muted);">/7天</div>
            </div>
        </div>`;
}

// ==================== 日记 ====================

async function saveDiary() {
    const c = document.getElementById("diary-content").value.trim();
    if (!c) { showToast("请写点什么吧"); return; }
    await saveDiaryEntry({ title: document.getElementById("diary-title").value.trim() || "无标题", content: c, mood_at_time: parseInt(document.getElementById("diary-mood").value) });
    document.getElementById("diary-title").value = ""; document.getElementById("diary-content").value = "";
    showToast("日记已保存 ✅"); await loadDiaryList();
}

async function loadDiaryList() {
    const container = document.getElementById("diary-list");
    const entries = await getDiaryList();
    if (!entries.length) { container.innerHTML = '<div class="empty-state"><div class="empty-icon">📔</div><p>还没有写日记</p></div>'; return; }
    const e = ["","😢","😢","😞","😞","😐","😐","🙂","🙂","😄","😄"];
    container.innerHTML = entries.map(en => `<div class="diary-item"><div style="display:flex;justify-content:space-between;width:100%;margin-bottom:4px;"><strong>${escapeHtml(en.title)}</strong><span style="font-size:0.8rem;color:var(--text-light);">${en.date}</span></div><p style="font-size:0.82rem;color:var(--text-light);">${escapeHtml(en.content.substring(0,100))}${en.content.length>100?"...":""}</p><span>${e[en.mood_at_time]||"😐"}</span></div>`).join("");
}

// ==================== 导出/清除 ====================

async function exportDataHandler() {
    const data = await exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url;
    a.download = `mind-journal-${new Date().toISOString().split("T")[0]}.json`; a.click(); URL.revokeObjectURL(url);
    showToast("数据已导出 ✅");
}

// CSV 导出包装器 (统一错误处理 + Toast)
async function csvExportWrapper(exportFn, label) {
    try {
        const count = await exportFn();
        if (count > 0) {
            showToast(`✅ ${label}CSV 已导出 (${count} 条记录)`);
        } else {
            showToast(`📭 ${label}无数据可导出`);
        }
    } catch (e) {
        console.error(`CSV export (${label}) failed:`, e);
        showToast(`❌ ${label}CSV 导出失败: ${e.message || "未知错误"}`);
    }
}

function clearDataHandler() {
    if (confirm("确定要清除所有本地数据吗？\n此操作不可恢复！建议先导出数据备份。")) {
        if (confirm("再次确认：清除所有记录、日记、联系人和音乐？")) {
            clearAllData().then(() => { showToast("数据已清除"); updateTodaySummary(); loadWeeklySummary(); });
        }
    }
}

async function loadConsentSettings() {
    const s = await getConsentSettings();
    document.getElementById("share-mood").checked = s.share_mood;
    document.getElementById("share-diary").checked = s.share_diary;
}

function showToast(msg) {
    const t = document.getElementById("toast"); t.textContent = msg; t.classList.remove("hidden");
    clearTimeout(t._timeout); t._timeout = setTimeout(() => t.classList.add("hidden"), 2500);
}

function escapeHtml(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

// ==================== v0.5: 内置环境音 ====================

function buildAmbientSounds() {
    const container = document.getElementById("ambient-sounds");
    if (!container) return;

    container.innerHTML = SOUND_PRESETS.map(sp => `
        <button class="ambient-btn" id="ambient-${sp.id}" onclick="toggleAmbientSound('${sp.id}')">
            <span class="ambient-emoji">${sp.emoji}</span>
            <span class="ambient-name">${sp.name}</span>
            <span class="ambient-desc">${sp.desc}</span>
        </button>
    `).join("");
}

function toggleAmbientSound(presetId) {
    // 如果已在播放同一声音，停止
    if (currentSound) {
        const playingBtn = document.querySelector(".ambient-btn.playing");
        if (playingBtn?.id === `ambient-${presetId}`) {
            stopAmbientSound();
            updateAmbientUI(null);
            return;
        }
    }

    // 播放新声音
    const preset = playAmbientSound(presetId);
    if (preset) updateAmbientUI(preset);
}

function updateAmbientUI(preset) {
    document.querySelectorAll(".ambient-btn").forEach(b => b.classList.remove("playing"));

    const controls = document.getElementById("ambient-controls");
    const nowPlaying = document.getElementById("ambient-now-playing");

    if (preset) {
        document.getElementById(`ambient-${preset.id}`)?.classList.add("playing");
        controls.classList.remove("hidden");
        nowPlaying.textContent = `正在播放: ${preset.emoji} ${preset.name}`;
        document.getElementById("ambient-volume").value = 30;
    } else {
        controls.classList.add("hidden");
        nowPlaying.textContent = "";
    }
}

// ==================== v0.5: 账号管理 ====================

async function buildAccountUI() {
    const container = document.getElementById("account-area");
    if (!container) return;

    const token = localStorage.getItem("mj_auth_token");
    const username = localStorage.getItem("mj_username");

    if (token && username) {
        // 已登录
        container.innerHTML = `
            <div class="account-info">
                <div class="account-username">👤 ${escapeHtml(username)}</div>
                <p style="font-size:0.8rem;color:var(--text-light);margin:6px 0;">数据将自动同步到云端</p>
                <button class="btn-secondary" onclick="handleLogout()" style="margin-top:8px;">🚪 退出登录</button>
            </div>`;
    } else {
        // 未登录
        container.innerHTML = `
            <div class="account-form" id="account-form">
                <p style="font-size:0.82rem;color:var(--text-light);margin-bottom:10px;">注册账号后，数据可备份到云端，换手机也能恢复。</p>
                <input type="text" id="account-username" placeholder="用户名（至少2个字符）">
                <input type="password" id="account-password" placeholder="密码（至少4个字符）">
                <div style="display:flex;gap:8px;">
                    <button class="btn-primary" onclick="handleRegister()" style="flex:1;">📝 注册</button>
                    <button class="btn-secondary" onclick="handleLogin()" style="flex:1;">🔑 登录</button>
                </div>
            </div>`;
    }
}

async function handleRegister() {
    const username = document.getElementById("account-username").value.trim();
    const password = document.getElementById("account-password").value;

    if (username.length < 2 || password.length < 4) {
        showToast("用户名至少2个字符，密码至少4个字符");
        return;
    }

    try {
        const anonymousId = await getUserId();
        const resp = await fetch(`${API_BASE}/account/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, anonymous_id: anonymousId })
        });

        if (!resp.ok) {
            const err = await resp.json();
            showToast(err.detail || "注册失败");
            return;
        }

        const data = await resp.json();
        localStorage.setItem("mj_auth_token", data.token);
        localStorage.setItem("mj_username", data.username);
        // 同步服务器分配的 anonymous_id，确保后续 sync 能匹配
        if (data.anonymous_id) await setUserId(data.anonymous_id);
        showToast("注册成功! 数据将自动同步");
        buildAccountUI();
    } catch (e) {
        console.error(e);
        showToast("网络错误，请确认后端已启动");
    }
}

async function handleLogin() {
    const username = document.getElementById("account-username").value.trim();
    const password = document.getElementById("account-password").value;

    if (!username || !password) {
        showToast("请输入用户名和密码");
        return;
    }

    try {
        const resp = await fetch(`${API_BASE}/account/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (!resp.ok) {
            const err = await resp.json();
            showToast(err.detail || "登录失败");
            return;
        }

        const data = await resp.json();
        localStorage.setItem("mj_auth_token", data.token);
        localStorage.setItem("mj_username", data.username);
        // 同步服务器 anonymous_id，后续 sync 才能匹配
        if (data.anonymous_id) await setUserId(data.anonymous_id);
        showToast("登录成功! 欢迎回来");
        buildAccountUI();
    } catch (e) {
        console.error(e);
        showToast("网络错误，请确认后端已启动");
    }
}

function handleLogout() {
    if (!confirm("确定退出登录吗？本地数据不会丢失。")) return;
    localStorage.removeItem("mj_auth_token");
    localStorage.removeItem("mj_username");
    showToast("已退出登录");
    buildAccountUI();
}
