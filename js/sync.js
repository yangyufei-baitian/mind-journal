/* ============================================
   sync.js v0.3-debug — 数据同步模块
   支持: 情绪(含时段) + 症状 + 日记同步
   API 地址优先级:
     1. localStorage "mj_api_base"
     2. window.MJ_API_BASE
     3. 自动检测
   ============================================ */
window._SYNC_VER = "dbg-d1e50f8";
setTimeout(() => { try { showToast&&showToast("sync: dbg-d1e50f8"); } catch(e) {} }, 3000);

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
    // === Step 1: 读取设置 ===
    let settings;
    try {
        showToast("S1: consentSettings...");
        settings = await getConsentSettings();
        showToast("S1 OK");
    } catch(e) {
        showToast("错误@consentSettings: " + (e.message || e));
        console.error(e);
        return;
    }

    if (!settings.share_mood && !settings.share_diary) {
        showToast("请先在设置中开启数据共享");
        return;
    }

    // === Step 2: 获取用户ID ===
    let userId;
    try {
        showToast("S2: getUserId...");
        userId = await getUserId();
        showToast("S2 OK: " + userId.substring(0,8));
    } catch(e) {
        showToast("错误@getUserId: " + (e.message || e));
        console.error(e);
        return;
    }

    let syncedCount = 0;
    let errors = [];

    // === Step 3: 同步情绪 ===
    if (settings.share_mood) {
        let unsynced;
        try {
            showToast("S3: getAllUnsyncedMoods...");
            unsynced = await getAllUnsyncedMoods();
            showToast("S3 OK: " + unsynced.length + "条");
        } catch(e) {
            showToast("错误@getAllUnsyncedMoods: " + (e.message || e));
            console.error(e);
            return;
        }

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
            } catch(e) {
                errors.push("情绪POST: " + (e.message || "网络错误"));
            }
        }
    }

    // === Step 4: 同步症状 ===
    if (settings.share_mood) {
        let unsynced;
        try {
            showToast("S4: getAllUnsyncedSymptoms...");
            unsynced = await getAllUnsyncedSymptoms();
            showToast("S4 OK: " + unsynced.length + "条");
        } catch(e) {
            showToast("错误@getAllUnsyncedSymptoms: " + (e.message || e));
            console.error(e);
            return;
        }

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
            } catch(e) {
                errors.push("症状POST: " + (e.message || "网络错误"));
            }
        }
    }

    // === Step 5: 同步日记 ===
    if (settings.share_diary) {
        let unsynced;
        try {
            showToast("S5: getAllUnsyncedDiaries...");
            unsynced = await getAllUnsyncedDiaries();
            showToast("S5 OK: " + unsynced.length + "条");
        } catch(e) {
            showToast("错误@getAllUnsyncedDiaries: " + (e.message || e));
            console.error(e);
            return;
        }

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
            } catch(e) {
                errors.push("日记POST: " + (e.message || "网络错误"));
            }
        }
    }

    // === 结果 ===
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
