/* ============================================
   error-handler.js — 统一错误处理模块

   用法：
     handleError(e, "保存情绪", { toast: true })
     handleError(e, "加载图表", { silent: true })
     handleError(e, "同步数据", { toast: true, detail: true })
   ============================================ */

const ERROR_LOG_KEY = "mj_error_log";
const MAX_ERROR_LOG = 50;

/**
 * 统一错误处理
 * @param {Error|string} err      - 错误对象或消息
 * @param {string}      context   - 上下文标签（哪个操作失败了）
 * @param {object}      opts      - 选项
 * @param {boolean}     opts.toast    - 是否弹 toast 告知用户 (默认 false)
 * @param {boolean}     opts.silent   - 是否完全静默 (默认 false, 至少打 console)
 * @param {boolean}     opts.detail   - toast 是否包含错误详情 (默认 false, 生产环境不暴露)
 */
function handleError(err, context, opts = {}) {
    const { toast: showUserToast = false, silent = false, detail = false } = opts;
    const message = (err instanceof Error) ? err.message : String(err || "未知错误");

    // 1. 静默模式：连 console 都不打（用于预期中的清理失败等）
    if (silent) return;

    // 2. 开发者日志（统一前缀 + 上下文）
    console.error(`[MindJournal] ${context} 失败:`, err);

    // 3. 内部错误日志（可导出用于调试）
    logToStorage(context, message);

    // 4. 用户提示
    if (showUserToast && typeof showToast === "function") {
        const userMsg = detail
            ? `${context}失败: ${message}`
            : `${context}失败，请重试`;
        showToast(userMsg);
    }
}

/**
 * 非关键操作失败 — 只打 console.warn，不弹 toast
 */
function handleWarn(err, context) {
    const message = (err instanceof Error) ? err.message : String(err || "未知错误");
    console.warn(`[MindJournal] ${context}:`, err);
    logToStorage(context, message);
}

/**
 * 网络错误 — 特殊处理（后端不可达等）
 */
function handleNetworkError(err, context) {
    const message = (err instanceof Error) ? err.message : String(err || "未知错误");
    console.error(`[MindJournal] ${context} 网络错误:`, err);
    logToStorage(context, message);

    if (typeof showToast === "function") {
        if (message.includes("Failed to fetch") || message.includes("NetworkError")) {
            showToast("网络连接失败，请检查网络后重试");
        } else {
            showToast(`${context}失败: ${message}`);
        }
    }
}

/**
 * 写入内存错误日志（最近 N 条）
 */
function logToStorage(context, message) {
    try {
        let logs = [];
        const raw = localStorage.getItem(ERROR_LOG_KEY);
        if (raw) {
            logs = JSON.parse(raw);
        }
        logs.push({
            time: new Date().toISOString(),
            context,
            message: message.substring(0, 200)
        });
        if (logs.length > MAX_ERROR_LOG) {
            logs = logs.slice(-MAX_ERROR_LOG);
        }
        localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(logs));
    } catch (_) {
        // localStorage 不可用时静默忽略
    }
}

/**
 * 获取错误日志（供调试用）
 */
function getErrorLogs() {
    try {
        const raw = localStorage.getItem(ERROR_LOG_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (_) {
        return [];
    }
}

/**
 * 清空错误日志
 */
function clearErrorLogs() {
    try {
        localStorage.removeItem(ERROR_LOG_KEY);
    } catch (_) {}
}
