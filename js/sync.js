/* ============================================
   sync.js v0.3 — 数据同步模块
   支持: 情绪(含时段) + 症状 + 日记同步
   API 地址优先级:
     1. localStorage "mj_api_base" (手动设置)
     2. window.MJ_API_BASE (部署时注入)
     3. 自动检测: file:///localhost → localhost:8000, 其他 → 同 host:8000
   ============================================ */

const API_BASE = (() => {
    // 优先级 1: localStorage 手动设置
    const stored = localStorage.getItem("mj_api_base");
    if (stored) return stored;

    // 优先级 2: 部署时注入
    if (window.MJ_API_BASE) return window.MJ_API_BASE;

    // 优先级 3: 自动检测
    const host = window.location.hostname;
    if (!host || host === "localhost" || host === "127.0.0.1") {
        return "http://localhost:8000/api";
    }
    return `http://${host}:8000/api`;
})();

async function syncData() {
    try { showToast("Step1: 读取设置..."); } catch(e) {}
    const settings = await getConsentSettings();

    if (!settings.share_mood && !settings.share_diary) {
        showToast("请先在设置中开启数据共享");
        return;
    }

    try { showToast("Step2: 获取用户ID..."); } catch(e) {}
    const userId = await getUserId();
    let syncedCount = 0;
    let errors = [];

    console.log("[sync] API_BASE:", API_BASE);
    console.log("[sync] userId:", userId);
    console.log("[sync] settings:", settings);

    try {
        // 1. 同步情绪记录
        if (settings.share_mood) {
            try { showToast("Step3: 读取未同步情绪..."); } catch(e) {}
            const unsynced = await getAllUnsyncedMoods();
            console.log("[sync] unsynced moods:", unsynced.length);
            try { showToast(`Step3完成: ${unsynced.length}条情绪`); } catch(e) {}
            for (const entry of unsynced) {
                try {
                    const url = `${API_BASE}/mood`;
                    const body = JSON.stringify({
                        anonymous_id: userId,
                        date: entry.date,
                        time_period: entry.time_period,
                        score: entry.score,
                        emotion_tags: entry.emotion_tags || [],
                        note: entry.note || ""
                    });
                    console.log("[sync] POST", url, body);
                    const resp = await fetch(url, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: body
                    });
                    if (resp.ok) {
                        await markMoodSynced(entry.id);
                        syncedCount++;
                    } else {
                        const err = await resp.json();
                        errors.push(`情绪: ${err.detail || resp.status}`);
                    }
                } catch (e) {
                    console.error("[sync] mood error:", e);
                    errors.push(`情绪记录(${entry.date}): ${e.message || "网络错误"}`);
                }
            }
        }

        // 2. 同步症状记录
        if (settings.share_mood) {
            try { showToast("Step4: 读取未同步症状..."); } catch(e) {}
            const unsyncedSymptoms = await getAllUnsyncedSymptoms();
            console.log("[sync] unsynced symptoms:", unsyncedSymptoms.length);
            for (const entry of unsyncedSymptoms) {
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
                        errors.push(`症状: ${err.detail || resp.status}`);
                    }
                } catch (e) {
                    console.error("[sync] symptom error:", e);
                    errors.push(`症状记录(${entry.date}): ${e.message || "网络错误"}`);
                }
            }
        }

        // 3. 同步日记
        if (settings.share_diary) {
            try { showToast("Step5: 读取未同步日记..."); } catch(e) {}
            const unsyncedDiaries = await getAllUnsyncedDiaries();
            console.log("[sync] unsynced diaries:", unsyncedDiaries.length);
            for (const entry of unsyncedDiaries) {
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
                        errors.push(`日记: ${err.detail || resp.status}`);
                    }
                } catch (e) {
                    console.error("[sync] diary error:", e);
                    errors.push(`日记(${entry.date}): ${e.message || "网络错误"}`);
                }
            }
        }

        // 结果反馈
        if (syncedCount > 0) {
            showToast(`已同步 ${syncedCount} 条记录`);
            updateSyncStatus(true);
        } else if (errors.length === 0) {
            showToast("没有需要同步的新数据");
        } else {
            showToast(`同步失败: ${errors[0]}`);
        }

        if (errors.length > 0) {
            console.warn("同步错误:", errors);
        }
    } catch (err) {
        console.error("同步异常:", err);
        showToast(`同步异常: ${err.message || err}`);
    }
}

function updateSyncStatus(synced) {
    const badge = document.getElementById("sync-status");
    if (badge) {
        badge.textContent = synced ? "☁️" : "💾";
        badge.title = synced ? "数据已同步" : "有未同步数据";
    }
}
