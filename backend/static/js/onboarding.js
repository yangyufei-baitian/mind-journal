/* ============================================
   onboarding.js — 新用户引导页 v1.0
   首次打开时展示4步滑动引导，介绍核心功能
   完成后存储 localStorage "mj_onboarding_done"
   ============================================ */

const ONBOARDING_KEY = "mj_onboarding_done";

const ONBOARDING_STEPS = [
    {
        emoji: "🧠",
        title: "欢迎来到心灵日记",
        desc: "一款面向精神科复诊场景的<br>自我监测工具",
        bullets: [
            "📝 每天7个时段记录情绪变化",
            "🏥 追踪39项精神科症状",
            "📋 完成标准化临床量表",
            "💊 管理服药打卡"
        ],
        note: ""
    },
    {
        emoji: "⏰",
        title: "为什么分7个时段？",
        desc: "皮质醇（压力激素）在一天中剧烈波动，<br>同一情绪在不同时间的意义不同",
        bullets: [
            "🌅 早晨6-9点 · 权重最高 — 皮质醇峰值，HPA轴黄金诊断窗口",
            "☀️ 上午9-12点 · 高权重 — 晨间激素平台期",
            "🌤 下午2-6点 · 中等权重 — 慢性应激敏感时段",
            "🌙 傍晚6-10点 · 低权重 — 晚间皮质醇升高可能是抑郁的生物标志"
        ],
        note: "💡 每天选1-2个时段就可以开始，不需要全部填满"
    },
    {
        emoji: "📋",
        title: "临床量表有什么用？",
        desc: "标准化工具让医生快速了解你的状态",
        bullets: [
            "🔴 <b>核心4量表</b>（必做）：PHQ-9 抑郁 / GAD-7 焦虑 / C-SSRS 自杀风险 / DSHI-s 自伤筛查",
            "🟢 <b>SCL-90</b>（选做）：90题症状自评，10个维度全面评估",
            "📈 <b>趋势追踪</b>：每次评估都会记录，可以看到分数变化",
            "⚠️ <b>危机干预</b>：如果量表显示高风险，会自动提醒你寻求帮助"
        ],
        note: "🩺 量表结果会汇总到健康报告，方便复诊时给医生看"
    },
    {
        emoji: "🔒",
        title: "你的数据由你掌控",
        desc: "隐私保护是我们设计的第一原则",
        bullets: [
            "📱 <b>默认本地存储</b>：所有数据存在你的设备上，不上传任何服务器",
            "🔬 <b>分层知情同意</b>：你可以分别选择是否共享情绪数据 / 日记内容用于研究",
            "🔄 <b>随时撤回</b>：开启后也可以随时在设置中关闭",
            "🗑️ <b>随时删除</b>：设置页一键清除所有本地数据"
        ],
        note: "🔐 即使选择不共享任何数据，App的所有功能都可以正常使用"
    }
];

// ==================== 渲染和交互 ====================

function showOnboarding() {
    // 防止重复创建
    if (document.getElementById("onboarding-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "onboarding-overlay";
    overlay.className = "onboarding-overlay";
    overlay.innerHTML = buildOnboardingHTML();
    document.body.appendChild(overlay);

    // 阻止背景滚动
    document.body.style.overflow = "hidden";

    let currentStep = 0;
    const dots = overlay.querySelectorAll(".ob-dot");
    const slides = overlay.querySelectorAll(".ob-slide");
    const prevBtn = overlay.querySelector(".ob-btn-prev");
    const nextBtn = overlay.querySelector(".ob-btn-next");
    const skipBtn = overlay.querySelector(".ob-btn-skip");

    function goToStep(n) {
        currentStep = Math.max(0, Math.min(n, ONBOARDING_STEPS.length - 1));
        // 滑动切换
        overlay.querySelector(".ob-slides-track").style.transform =
            `translateX(-${currentStep * 100}%)`;
        // 更新指示点
        dots.forEach((d, i) => d.classList.toggle("active", i === currentStep));
        // 更新按钮
        prevBtn.style.visibility = currentStep === 0 ? "hidden" : "visible";
        skipBtn.style.display = currentStep === ONBOARDING_STEPS.length - 1 ? "none" : "block";
        if (currentStep === ONBOARDING_STEPS.length - 1) {
            nextBtn.textContent = "🚀 开始使用";
            nextBtn.className = "ob-btn ob-btn-next ob-btn-primary";
        } else {
            nextBtn.textContent = "下一步 →";
            nextBtn.className = "ob-btn ob-btn-next ob-btn-next-outline";
        }
    }

    // 按钮事件
    prevBtn.addEventListener("click", () => goToStep(currentStep - 1));
    nextBtn.addEventListener("click", () => {
        if (currentStep >= ONBOARDING_STEPS.length - 1) {
            finishOnboarding(overlay);
        } else {
            goToStep(currentStep + 1);
        }
    });
    skipBtn.addEventListener("click", () => finishOnboarding(overlay));

    // 触摸滑动支持
    let touchStartX = 0, touchEndX = 0;
    const track = overlay.querySelector(".ob-slides-track");
    track.addEventListener("touchstart", (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    track.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            goToStep(diff > 0 ? currentStep + 1 : currentStep - 1);
        }
    }, { passive: true });

    // 初始状态
    goToStep(0);
}

function buildOnboardingHTML() {
    const slidesHTML = ONBOARDING_STEPS.map((step, i) => `
        <div class="ob-slide">
            <div class="ob-icon">${step.emoji}</div>
            <h2 class="ob-title">${step.title}</h2>
            <p class="ob-desc">${step.desc}</p>
            <ul class="ob-bullets">
                ${step.bullets.map(b => `<li>${b}</li>`).join("")}
            </ul>
            ${step.note ? `<p class="ob-note">${step.note}</p>` : ""}
        </div>
    `).join("");

    return `
        <div class="ob-container">
            <button class="ob-btn ob-btn-skip">跳过</button>
            <div class="ob-slides-wrapper">
                <div class="ob-slides-track">${slidesHTML}</div>
            </div>
            <div class="ob-dots">
                ${ONBOARDING_STEPS.map((_, i) =>
                    `<span class="ob-dot${i === 0 ? " active" : ""}"></span>`
                ).join("")}
            </div>
            <div class="ob-actions">
                <button class="ob-btn ob-btn-prev" style="visibility:hidden;">← 上一步</button>
                <button class="ob-btn ob-btn-next ob-btn-next-outline">下一步 →</button>
            </div>
        </div>
    `;
}

function finishOnboarding(overlay) {
    try { localStorage.setItem(ONBOARDING_KEY, "1"); } catch (e) {}
    // 淡出动画
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 0.3s ease";
    setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        document.body.style.overflow = "";
    }, 300);
}

// ==================== 初始化检查 ====================

function checkOnboarding() {
    try {
        if (localStorage.getItem(ONBOARDING_KEY) === "1") return false;
    } catch (e) { return true; }
    return true;
}

// ==================== 重置引导（调试用） ====================

function resetOnboarding() {
    try { localStorage.removeItem(ONBOARDING_KEY); } catch (e) {}
}
