/* ============================================
   sync.js v0.4 — 数据同步模块
   支持: 情绪(含时段) + 症状 + 日记同步
   API 地址优先级:
     1. localStorage "mj_api_base"
     2. window.MJ_API_BASE
     3. 自动检测
   ============================================ */

const API_BASE = (() => {
    const stored = localStorage.getItem("mj_api_base");
    if (stored) return stored;
    if (window.MJ_API_BASE) return window.MJ_API_BASE;
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    if (!host || host === "localhost" || host === "127.0.0.1") {
        return "http://localhost:8000/api";
    }
    // 生产环境: 同域部署，API 在同一域名的 /api 下
    return `${protocol}//${host}/api`;
})();

async function syncData() {
    const settings = await getConsentSettings();

    if (!settings.share_mood && !settings.share_diary) {
        showToast("请先在设置中开启数据共享");
        return;
    }

    const userId = await getUserId();
    let syncedCount = 0;
    let errors = [];

    // 0. 确保用户已在后端注册（静默，已有则返回 is_new:false）
    try {
        await fetch(`${API_BASE}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ anonymous_id: userId })
        });
    } catch (e) {
        handleWarn(e, "同步-静默注册");
    }

    // 1. 同步情绪记录
    if (settings.share_mood) {
        const unsynced = await getAllUnsyncedMoods();
        for (const entry of unsynced) {
            try {
                const resp = await fetch(`${API_BASE}/mood`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        anonymous_id: userId,
                        date: entry.date,
                        time_period: entry.time_period,
                        score: entry.score,
                        emotion_tags: entry.emotion_tags || [],
                        note: entry.note || ""
                    })
                });
                if (resp.ok) {
                    await markMoodSynced(entry.id);
                    syncedCount++;
                } else {
                    const err = await resp.json();
                    errors.push("情绪:" + (err.detail || resp.status));
                }
            } catch (e) {
                errors.push("情绪:" + (e.message || "网络错误"));
                handleError(e, "同步-情绪", { silent: true });
            }
        }
    }

    // 2. 同步症状记录
    if (settings.share_mood) {
        const unsynced = await getAllUnsyncedSymptoms();
        for (const entry of unsynced) {
            try {
                const resp = await fetch(`${API_BASE}/symptom`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        anonymous_id: userId,
                        date: entry.date,
                        time_period: entry.time_period,
                        symptoms: entry.symptoms || []
                    })
                });
                if (resp.ok) {
                    await markSymptomSynced(entry.id);
                    syncedCount++;
                } else {
                    const err = await resp.json();
                    errors.push("症状:" + (err.detail || resp.status));
                }
            } catch (e) {
                errors.push("症状:" + (e.message || "网络错误"));
                handleError(e, "同步-症状", { silent: true });
            }
        }
    }

    // 3. 同步日记
    if (settings.share_diary) {
        const unsynced = await getAllUnsyncedDiaries();
        for (const entry of unsynced) {
            try {
                const resp = await fetch(`${API_BASE}/diary`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        anonymous_id: userId,
                        date: entry.date,
                        title: entry.title,
                        content: entry.content,
                        mood_at_time: entry.mood_at_time
                    })
                });
                if (resp.ok) {
                    await markDiarySynced(entry.id);
                    syncedCount++;
                } else {
                    const err = await resp.json();
                    errors.push("日记:" + (err.detail || resp.status));
                }
            } catch (e) {
                errors.push("日记:" + (e.message || "网络错误"));
                handleError(e, "同步-日记", { silent: true });
            }
        }
    }

    // 4. 同步药品配置
    if (settings.share_mood) {
        const unsyncedConfigs = await getAllUnsyncedMedicationConfigs();
        for (const entry of unsyncedConfigs) {
            try {
                const resp = await fetch(`${API_BASE}/medication/config`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        anonymous_id: userId,
                        med_id: entry.med_id,
                        custom_dose: entry.custom_dose || 0,
                        dose_unit: entry.dose_unit || "mg",
                        pills_per_dose: entry.pills_per_dose || 1,
                        frequency: entry.frequency || {},
                        total_pills: entry.total_pills || 28,
                        start_date: entry.start_date || "",
                        notes: entry.notes || ""
                    })
                });
                if (resp.ok) {
                    await markMedicationConfigSynced(entry.id);
                    syncedCount++;
                } else {
                    const err = await resp.json();
                    errors.push("药品配置:" + (err.detail || resp.status));
                }
            } catch (e) {
                errors.push("药品配置:" + (e.message || "网络错误"));
                handleError(e, "同步-药品配置", { silent: true });
            }
        }
    }

    // 5. 同步服药打卡记录
    if (settings.share_mood) {
        const unsyncedLogs = await getAllUnsyncedMedicationLogs();
        for (const entry of unsyncedLogs) {
            try {
                const resp = await fetch(`${API_BASE}/medication/log`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        anonymous_id: userId,
                        med_id: entry.med_id,
                        date: entry.date,
                        period: entry.period
                    })
                });
                if (resp.ok) {
                    await markMedicationLogSynced(entry.id);
                    syncedCount++;
                } else {
                    const err = await resp.json();
                    errors.push("服药打卡:" + (err.detail || resp.status));
                }
            } catch (e) {
                errors.push("服药打卡:" + (e.message || "网络错误"));
                handleError(e, "同步-服药打卡", { silent: true });
            }
        }
    }

    // 6. 同步量表评估
    if (settings.share_mood) {
        const unsyncedScales = await getAllUnsyncedScales();
        for (const entry of unsyncedScales) {
            try {
                const resp = await fetch(`${API_BASE}/scale`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        anonymous_id: userId,
                        scale_type: entry.scale_type,
                        date: entry.date,
                        answers: entry.answers || [],
                        total_score: entry.total_score,
                        severity_label: entry.severity_label || ""
                    })
                });
                if (resp.ok) {
                    await markScaleSynced(entry.id);
                    syncedCount++;
                } else {
                    const err = await resp.json();
                    errors.push("量表:" + (err.detail || resp.status));
                }
            } catch (e) {
                errors.push("量表:" + (e.message || "网络错误"));
                handleError(e, "同步-量表", { silent: true });
            }
        }
    }

    // 结果反馈
    if (syncedCount > 0) {
        showToast("已同步 " + syncedCount + " 条记录");
        updateSyncStatus(true);
    } else if (errors.length === 0) {
        showToast("没有需要同步的新数据");
    } else if (errors.length > 0) {
        showToast(`同步失败 (${errors.length}项): ${errors[0]}`);
    }
}

function updateSyncStatus(synced) {
    const badge = document.getElementById("sync-status");
    if (badge) {
        badge.textContent = synced ? "☁️" : "💾";
        badge.title = synced ? "数据已同步" : "有未同步数据";
    }
}
