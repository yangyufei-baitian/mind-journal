/* ============================================
   db.js — Dexie.js 本地数据库封装 v0.2
   新增：多时段情绪、情绪-症状分离、严重度三档+频率
   ============================================ */

// ==================== 时段配置 ====================
const TIME_PERIODS = [
    { id: "0-6",   label: "深夜/睡眠", hours: 6, bio_weight: 0.6 },
    { id: "6-9",   label: "早晨",       hours: 3, bio_weight: 1.3 },
    { id: "9-12",  label: "上午",       hours: 3, bio_weight: 1.2 },
    { id: "12-14", label: "午间",       hours: 2, bio_weight: 0.8 },
    { id: "14-18", label: "下午",       hours: 4, bio_weight: 1.1 },
    { id: "18-22", label: "傍晚",       hours: 4, bio_weight: 0.9 },
    { id: "22-24", label: "深夜",       hours: 2, bio_weight: 0.7 }
];

// 情绪标签和症状配置移至:
//   js/symptom-config.js (症状权重表)
//   js/app.js 中的 buildEmotionTags() (情绪标签)

// 向后兼容引用 (symptom-config.js 先加载)
// SYMPTOM_CONFIG, SYMPTOM_MAP, SYMPTOM_CATEGORIES 由 symptom-config.js 提供
// (symptom-config.js 必须在 db.js 之前加载)

// ==================== 数据库初始化 ====================

const db = new Dexie("MindJournalDB");

db.version(2).stores({
    // 情绪记录: date + time_period 作为复合唯一键
    moodEntries: "++id, [date+time_period], date, time_period, synced",
    // 症状记录: 每条记录包含 date + time_period + 选中的症状
    symptomEntries: "++id, [date+time_period], date, time_period, synced",
    diaryEntries: "++id, date, synced",
    contacts: "++id",
    musicTracks: "++id",
    consentSettings: "++id",
    userInfo: "++id"
});

// ==================== 用户信息 ====================

async function getUserId() {
    let user = await db.userInfo.get(1);
    if (!user) {
        const anonymousId = crypto.randomUUID ? crypto.randomUUID() :
            'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                const r = Math.random() * 16 | 0;
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
        await db.userInfo.put({ id: 1, anonymous_id: anonymousId, created_at: new Date().toISOString() });
        return anonymousId;
    }
    return user.anonymous_id;
}

// 登录后同步服务器返回的 anonymous_id (用于跨设备/新会话)
async function setUserId(anonymousId) {
    const existing = await db.userInfo.get(1);
    if (existing) {
        await db.userInfo.update(1, { anonymous_id: anonymousId });
    } else {
        await db.userInfo.put({ id: 1, anonymous_id: anonymousId, created_at: new Date().toISOString() });
    }
}

// ==================== 情绪记录 (v2: 多时段) ====================

async function saveMoodEntry(entry) {
    const date = entry.date || new Date().toISOString().split("T")[0];
    const timePeriod = entry.time_period;

    // 检查同一日期+时段是否已有记录，有则更新 (避免 compound index 查询)
    const all = await db.moodEntries.toArray();
    const existing = all.find(e => e.date === date && e.time_period === timePeriod);

    if (existing) {
        await db.moodEntries.update(existing.id, {
            score: entry.score,
            emotion_tags: entry.emotion_tags || [],
            energy_level: entry.energy_level || "",
            sleep_hours: entry.sleep_hours || "",
            note: entry.note || "",
            synced: false,
            updated_at: new Date().toISOString()
        });
        return existing.id;
    }

    return await db.moodEntries.add({
        date: date,
        time_period: timePeriod,
        score: entry.score,
        emotion_tags: entry.emotion_tags || [],
        energy_level: entry.energy_level || "",
        sleep_hours: entry.sleep_hours || "",
        note: entry.note || "",
        synced: false,
        created_at: new Date().toISOString()
    });
}

async function getTodayMoods() {
    const today = new Date().toISOString().split("T")[0];
    const all = await db.moodEntries.toArray();
    return all.filter(e => e.date === today);
}

async function getMoodHistory(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().split("T")[0];

    const all = await db.moodEntries.toArray();
    return all.filter(e => e.date >= sinceStr).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * 计算每日加权情绪分
 * 公式: dailyScore = Σ(D_i × B_i × S_i) / Σ(D_i × B_i)
 * 仅对已记录时段计算，不填补缺失数据
 * @returns {date, weighted_score, period_count, periods[]}
 */
function calculateDailyWeightedMood(moodsByDate) {
    const result = {};

    moodsByDate.forEach(entry => {
        const date = entry.date;
        if (!result[date]) {
            result[date] = { weightedSum: 0, weightSum: 0, entries: [], periods: [] };
        }

        const period = TIME_PERIODS.find(p => p.id === entry.time_period);
        if (!period) return;

        const weight = period.hours * period.bio_weight;
        result[date].weightedSum += weight * entry.score;
        result[date].weightSum += weight;
        result[date].entries.push(entry);
        result[date].periods.push(period);
    });

    // 转换为最终分数
    const dailyScores = {};
    Object.keys(result).forEach(date => {
        const r = result[date];
        dailyScores[date] = {
            score: r.weightSum > 0 ? Math.round((r.weightedSum / r.weightSum) * 100) / 100 : null,
            period_count: r.entries.length,
            entries: r.entries,
            periods_recorded: r.periods.map(p => p.id)
        };
    });

    return dailyScores;
}

async function getAllUnsyncedMoods() {
    // 用 filter 代替 where 查询，避免 IndexedDB index 查询异常
    const all = await db.moodEntries.toArray();
    return all.filter(e => !e.synced);
}

async function markMoodSynced(id) {
    return await db.moodEntries.update(id, { synced: true });
}

// ==================== 症状记录 (v2: 新增) ====================

async function saveSymptomEntry(entry) {
    const date = entry.date || new Date().toISOString().split("T")[0];
    const timePeriod = entry.time_period;

    // 检查同一日期+时段是否已有症状记录，有则更新 (避免 compound index 查询)
    const all = await db.symptomEntries.toArray();
    const existing = all.find(e => e.date === date && e.time_period === timePeriod);

    // 构建症状数据: [{symptom_id, level, frequency}]
    const symptomData = entry.symptoms || [];

    if (existing) {
        await db.symptomEntries.update(existing.id, {
            symptoms: symptomData,
            synced: false,
            updated_at: new Date().toISOString()
        });
        return existing.id;
    }

    return await db.symptomEntries.add({
        date: date,
        time_period: timePeriod,
        symptoms: symptomData,
        synced: false,
        created_at: new Date().toISOString()
    });
}

async function getTodaySymptoms() {
    const today = new Date().toISOString().split("T")[0];
    const all = await db.symptomEntries.toArray();
    return all.filter(e => e.date === today);
}

async function getSymptomHistory(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().split("T")[0];

    const all = await db.symptomEntries.toArray();
    return all.filter(e => e.date >= sinceStr).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * 计算每日症状总分
 * 公式: Σ(每个症状的 base_weight × severity_coef)
 * 同一症状多次出现取最严重的
 */
function calculateDailySymptomScore(symptomsByDate) {
    const dailyScores = {};

    symptomsByDate.forEach(entry => {
        const date = entry.date;
        if (!dailyScores[date]) {
            dailyScores[date] = { score: 0, symptom_map: {}, entries: [] };
        }

        dailyScores[date].entries.push(entry);

        (entry.symptoms || []).forEach(s => {
            const config = SYMPTOM_MAP[s.symptom_id];
            if (!config) return;

            const level = config.levels.find(l => l.id === s.level);
            if (!level) return;

            const impact = config.base_weight * level.coef;

            // 同一症状多次出现取最大值
            if (!dailyScores[date].symptom_map[s.symptom_id] ||
                impact > dailyScores[date].symptom_map[s.symptom_id].impact) {
                dailyScores[date].symptom_map[s.symptom_id] = {
                    symptom_id: s.symptom_id,
                    label: config.label,
                    impact: impact,
                    level: s.level,
                    level_label: level.label,
                    frequency: s.frequency || null,
                    base_weight: config.base_weight,
                    coef: level.coef
                };
            }
        });
    });

    // 计算总分
    Object.keys(dailyScores).forEach(date => {
        const r = dailyScores[date];
        r.score = Object.values(r.symptom_map).reduce((sum, s) => sum + s.impact, 0);
        r.symptom_list = Object.values(r.symptom_map);
    });

    return dailyScores;
}

async function getAllUnsyncedSymptoms() {
    const all = await db.symptomEntries.toArray();
    return all.filter(e => !e.synced);
}

async function markSymptomSynced(id) {
    return await db.symptomEntries.update(id, { synced: true });
}

// ==================== 日记 ====================

async function saveDiaryEntry(entry) {
    const data = {
        date: entry.date || new Date().toISOString().split("T")[0],
        title: entry.title || "",
        content: entry.content || "",
        mood_at_time: entry.mood_at_time || 5,
        synced: false,
        created_at: new Date().toISOString()
    };
    return await db.diaryEntries.add(data);
}

async function getDiaryList() {
    return await db.diaryEntries.orderBy("date").reverse().toArray();
}

async function getAllUnsyncedDiaries() {
    const all = await db.diaryEntries.toArray();
    return all.filter(e => !e.synced);
}

async function markDiarySynced(id) {
    return await db.diaryEntries.update(id, { synced: true });
}

// ==================== 联系人 ====================

async function saveContact(contact) {
    return await db.contacts.add({
        name: contact.name,
        phone: contact.phone,
        relationship: contact.relationship || "",
        is_emergency: contact.is_emergency !== false
    });
}

async function getContacts() {
    return await db.contacts.toArray();
}

async function deleteContact(id) {
    return await db.contacts.delete(id);
}

// ==================== 音乐 ====================

async function saveMusicTrack(track) {
    return await db.musicTracks.add({
        name: track.name,
        file_data: track.file_data,
        duration: track.duration || 0,
        category: track.category || "safe"
    });
}

async function getMusicTracks() {
    return await db.musicTracks.toArray();
}

async function deleteMusicTrack(id) {
    return await db.musicTracks.delete(id);
}

// ==================== 知情同意 ====================

async function getConsentSettings() {
    let settings = await db.consentSettings.get(1);
    if (!settings) {
        settings = {
            id: 1,
            share_mood: false,
            share_diary: false,
            researcher_id: "",
            consented_at: null
        };
        await db.consentSettings.put(settings);
    }
    return settings;
}

async function updateConsentSettings(updates) {
    const current = await getConsentSettings();
    return await db.consentSettings.update(1, {
        ...updates,
        changed_at: new Date().toISOString()
    });
}

// ==================== 数据导出 ====================

async function exportAllData() {
    const moods = await db.moodEntries.toArray();
    const symptoms = await db.symptomEntries.toArray();
    const diaries = await db.diaryEntries.toArray();
    const contacts = await db.contacts.toArray();
    const consent = await getConsentSettings();

    return {
        exported_at: new Date().toISOString(),
        user_id: await getUserId(),
        mood_entries: moods,
        symptom_entries: symptoms,
        diary_entries: diaries,
        contacts: contacts,
        consent_settings: consent
    };
}

async function clearAllData() {
    await db.moodEntries.clear();
    await db.symptomEntries.clear();
    await db.diaryEntries.clear();
    await db.contacts.clear();
    await db.musicTracks.clear();
}
