/* ============================================
   db.js — Dexie.js 本地数据库封装 v0.2
   新增：多时段情绪、情绪-症状分离、严重度三档+频率
   ============================================ */

// ==================== 时段配置 ====================
// bio_weight 基于皮质醇昼夜分泌曲线的定量数据:
//   Skubic et al. (2025) "Circadian Biomarkers in Humans" — Biomolecules
//   Robertson-Dixon et al. (2023) "Light Wavelength on HPA Axis Rhythms" — Life
//   McCurdy et al. (2024) "Diurnal Alpha-Amylase and Cortisol" — 晚间皮质醇升高=抑郁标志
//
// 皮质醇相对峰值: 觉醒时~15nmol/L(65%), CAR峰~23nmol/L(100%), 上午~78%,
//   下午~43%, 傍晚~22%, 深夜~13%, 午夜~9%
// bio_weight 反映该时段情绪自评的生物学"信噪比"——高皮质醇时段评分更反映HPA轴状态
const TIME_PERIODS = [
    { id: "0-6",   label: "深夜/睡眠", hours: 6, bio_weight: 0.5 },  // 皮质醇最低点~9%, 睡眠混杂因素
    { id: "6-9",   label: "早晨",       hours: 3, bio_weight: 1.5 },  // CAR峰值, HPA轴黄金诊断窗口
    { id: "9-12",  label: "上午",       hours: 3, bio_weight: 1.3 },  // 皮质醇高位平台~78%
    { id: "12-14", label: "午间",       hours: 2, bio_weight: 0.8 },  // 餐后皮质醇自然下降
    { id: "14-18", label: "下午",       hours: 4, bio_weight: 1.0 },  // 皮质醇中位~43%, 慢性应激敏感
    { id: "18-22", label: "傍晚",       hours: 4, bio_weight: 0.9 },  // 低皮质醇~22%, 晚间升高=抑郁生物标志
    { id: "22-24", label: "深夜",       hours: 2, bio_weight: 0.6 }   // 皮质醇极低~13%, 接近褪黑素峰值
];

// 情绪标签和症状配置移至:
//   js/symptom-config.js (症状权重表)
//   js/app.js 中的 buildEmotionTags() (情绪标签)

// 向后兼容引用 (symptom-config.js 先加载)
// SYMPTOM_CONFIG, SYMPTOM_MAP, SYMPTOM_CATEGORIES 由 symptom-config.js 提供
// (symptom-config.js 必须在 db.js 之前加载)

// ==================== 数据库初始化 ====================

const db = new Dexie("MindJournalDB");

db.version(3).stores({
    // 情绪记录: date + time_period 作为复合唯一键
    moodEntries: "++id, [date+time_period], date, time_period, synced",
    // 症状记录: 每条记录包含 date + time_period + 选中的症状
    symptomEntries: "++id, [date+time_period], date, time_period, synced",
    diaryEntries: "++id, date, synced",
    contacts: "++id",
    musicTracks: "++id",
    consentSettings: "++id",
    userInfo: "++id",
    // v3: 服药管理
    userMedications: "++id, med_id",
    medicationLog: "++id, [user_med_id+date+period], user_med_id, date, period"
});

// v4: 临床量表评估
db.version(4).stores({
    scaleEntries: "++id, scale_type, date, [scale_type+date]"
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
 * 公式: dailyScore = Σ(Dᵢ × Bᵢ × Sᵢ) / Σ(Dᵢ × Bᵢ)
 *   Dᵢ = 时段时长(hours) — 持续时间加权 (Stone 2023 Annual Review: IPW不等间隔校正)
 *   Bᵢ = bio_weight — 生物学信噪比 (Skubic 2025: 皮质醇昼夜曲线定量数据)
 *   Sᵢ = 情绪评分 (1-10)
 * 分母归一化: 保证不同记录天数和时段数的分数可比
 * 仅对已记录时段计算，不填补缺失数据 (避免 moment selection bias)
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
 *   base_weight: 基于 CGI-S 临床总体印象严重度量表 (Busner & Targum 2007)
 *     bw 1 = CGI-S 2-3 (边缘/轻度), bw 2-3 = CGI-S 4 (中度, 临床试验入组阈值)
 *     bw 4-5 = CGI-S 5 (显著), bw 8-10 = CGI-S 6-7 (严重/极重)
 *   severity_coef: 基于等百分位链接 (Leucht 2019 PANSS; Egger 2019 N=3067)
 *     mild=0.4, moderate=1.0 (临床显著性基准), severe=2.5 (功能损害非线加速)
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
    await db.userMedications.clear();
    await db.medicationLog.clear();
    await db.scaleEntries.clear();
    await db.consentSettings.clear();
}

// 重置本地身份: 删除旧 anonymous_id, 生成新的 (用于切换用户)
async function resetAnonymousId() {
    await db.userInfo.clear();
    return await getUserId();  // 自动生成新的
}

// ==================== 服药管理 (v3) ====================

async function addUserMedication(med) {
    return await db.userMedications.add({
        med_id: med.med_id,
        custom_dose: med.custom_dose || "",
        dose_unit: med.dose_unit || "mg",
        pills_per_dose: med.pills_per_dose || 1,
        frequency: med.frequency || { morning: false, noon: false, evening: false, bedtime: false },
        total_pills: med.total_pills || 28,
        start_date: med.start_date || new Date().toISOString().split("T")[0],
        notes: med.notes || "",
        synced: false,
        created_at: new Date().toISOString()
    });
}

async function getUserMedications() {
    return await db.userMedications.toArray();
}

async function updateUserMedication(id, updates) {
    return await db.userMedications.update(id, { ...updates, synced: false, updated_at: new Date().toISOString() });
}

async function removeUserMedication(id) {
    // 同时删除该药品的所有打卡记录
    const logs = await db.medicationLog.where("user_med_id").equals(id).toArray();
    for (const log of logs) {
        await db.medicationLog.delete(log.id);
    }
    return await db.userMedications.delete(id);
}

// 获取某药品的所有打卡记录
async function getMedicationLogs(userMedId, sinceDate) {
    const all = await db.medicationLog.toArray();
    let filtered = all.filter(e => e.user_med_id === userMedId);
    if (sinceDate) {
        filtered = filtered.filter(e => e.date >= sinceDate);
    }
    return filtered;
}

// 今日打卡状态
async function getTodayMedicationLog(userMedId) {
    const today = new Date().toISOString().split("T")[0];
    const all = await db.medicationLog.toArray();
    return all.filter(e => e.user_med_id === userMedId && e.date === today);
}

// 打卡/取消打卡
async function toggleMedicationCheck(userMedId, date, period) {
    const all = await db.medicationLog.toArray();
    const existing = all.find(e => e.user_med_id === userMedId && e.date === date && e.period === period);
    if (existing) {
        await db.medicationLog.delete(existing.id);
        return false; // 取消打卡
    }
    const um = await db.userMedications.get(userMedId);
    await db.medicationLog.add({
        user_med_id: userMedId,
        med_id: um ? um.med_id : "",
        date: date,
        period: period,
        synced: false,
        taken_at: new Date().toISOString()
    });
    return true; // 打卡成功
}

// 计算余量
function calculatePillRemaining(userMed) {
    const today = new Date().toISOString().split("T")[0];
    const startDate = userMed.start_date;

    // 计算从开始日期到今天过了多少天
    const start = new Date(startDate);
    const now = new Date(today);
    const daysElapsed = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));

    // 每天需要的粒数
    const freq = userMed.frequency || {};
    const dosesPerDay = (freq.morning ? 1 : 0) + (freq.noon ? 1 : 0) +
                        (freq.evening ? 1 : 0) + (freq.bedtime ? 1 : 0);
    const pillsPerDay = dosesPerDay * (userMed.pills_per_dose || 1);

    const pillsTaken = daysElapsed * pillsPerDay;
    const remaining = Math.max(0, userMed.total_pills - pillsTaken);
    const daysLeft = pillsPerDay > 0 ? Math.floor(remaining / pillsPerDay) : 0;

    let warningLevel = "normal"; // normal | warning | danger
    if (daysLeft <= 3) warningLevel = "danger";
    else if (daysLeft <= 7) warningLevel = "warning";

    return { remaining, daysLeft, pillsPerDay, warningLevel, dosesPerDay };
}

// 获取药品预设信息
function getMedicationInfo(medId) {
    return MEDICATION_DB.find(m => m.id === medId) || null;
}

// 同步辅助：未同步的药品配置
async function getAllUnsyncedMedicationConfigs() {
    const all = await db.userMedications.toArray();
    return all.filter(m => !m.synced);
}

// 同步辅助：标记药品配置已同步
async function markMedicationConfigSynced(id, medId) {
    // 更新本地记录，存储 med_id 用于后续打卡同步
    return await db.userMedications.update(id, { synced: true });
}

// 同步辅助：未同步的打卡记录
async function getAllUnsyncedMedicationLogs() {
    const all = await db.medicationLog.toArray();
    return all.filter(l => !l.synced);
}

// 同步辅助：标记打卡记录已同步
async function markMedicationLogSynced(id) {
    return await db.medicationLog.update(id, { synced: true });
}

async function getPillsTakenSoFar(userMedId) {
    const all = await db.medicationLog.toArray();
    return all.filter(e => e.user_med_id === userMedId).length;
}

// ==================== 量表评估同步辅助 (v4+) ====================

async function getAllUnsyncedScales() {
  const all = await db.scaleEntries.toArray();
  return all.filter(e => !e.synced);
}

async function markScaleSynced(id) {
  return await db.scaleEntries.update(id, { synced: true });
}
