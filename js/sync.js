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
    if (!host || host === "localhost" || host === "127.0.0.1") {
        return "http://localhost:8000/api";
    }
    return `http://${host}:8000/api`;
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
                errors.push("情绪POST:" + (e.message || "网络错误"));
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
                errors.push("症状POST:" + (e.message || "网络错误"));
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
                errors.push("日记POST:" + (e.message || "网络错误"));
            }
        }
    }

    // 结果反馈
    if (syncedCount > 0) {
        showToast("已同步 " + syncedCount + " 条记录");
        updateSyncStatus(true);
    } else if (errors.length === 0) {
        showToast("没有需要同步的新数据");
    } else {
        showToast("同步失败: " + errors[0]);
    }
}

function updateSyncStatus(synced) {
    const badge = document.getElementById("sync-status");
    if (badge) {
        badge.textContent = synced ? "☁️" : "💾";
        badge.title = synced ? "数据已同步" : "有未同步数据";
    }
}
