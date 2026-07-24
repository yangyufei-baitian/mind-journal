/* ============================================
   scales.js — 临床量表评估模块 v1.0
   PHQ-9 (抑郁) | GAD-7 (焦虑) | C-SSRS (自杀) | DSHI-s (自伤)
   所有量表基于已验证的中文版，引用文献见各量表注释
   ============================================ */

// ==================== 量表定义 ====================

const SCALES = {
  // ---------- PHQ-9 抑郁症筛查 ----------
  // Kroenke K, Spitzer RL, Williams JBW (2001) J Gen Intern Med
  // 中文版信效度: 卞崔冬等 (2009) 上海精神医学
  phq9: {
    id: "phq9",
    name: "PHQ-9 抑郁症筛查",
    icon: "🧠",
    shortName: "抑郁症筛查",
    instruction: "在过去 <b>2 周</b> 中，您有多少时间受到以下问题困扰？",
    timeframe: "过去2周",
    questions: [
      "做事时提不起劲或没有兴趣",
      "感到心情低落、沮丧或绝望",
      "入睡困难、睡不安稳或睡眠过多",
      "感觉疲倦或没有活力",
      "食欲不振或吃太多",
      "觉得自己很糟——或觉得自己很失败，或让自己或家人失望",
      "对事物专注有困难，例如阅读报纸或看电视时",
      "动作或说话速度缓慢到别人已觉察？或正好相反——烦躁或坐立不安、动来动去比平常更多",
      "有不如死掉或用某种方式伤害自己的念头"
    ],
    options: [
      { value: 0, label: "完全没有" },
      { value: 1, label: "几天" },
      { value: 2, label: "一半以上天数" },
      { value: 3, label: "几乎每天" }
    ],
    severity: [
      { min: 0, max: 4, label: "无/极轻微", color: "#27ae60", emoji: "🟢" },
      { min: 5, max: 9, label: "轻度抑郁", color: "#F4A261", emoji: "🟡" },
      { min: 10, max: 14, label: "中度抑郁", color: "#E76F6F", emoji: "🟠" },
      { min: 15, max: 19, label: "中重度抑郁", color: "#C0392B", emoji: "🔴" },
      { min: 20, max: 27, label: "重度抑郁", color: "#8B0000", emoji: "🔴" }
    ],
    // Q9 flag: 如果第9题 ≥ 2 分，标记自杀风险
    flagItems: [8],
    flagThreshold: 2,
    flagMessage: "⚠️ 第9题提示存在自杀意念，建议进一步用 C-SSRS 量表评估。"
  },

  // ---------- GAD-7 焦虑症筛查 ----------
  // Spitzer RL, Kroenke K, Williams JBW (2006) Arch Intern Med
  // 中文版信效度: 何筱衍等 (2010) 中国心理卫生杂志
  gad7: {
    id: "gad7",
    name: "GAD-7 焦虑症筛查",
    icon: "😰",
    shortName: "焦虑症筛查",
    instruction: "在过去 <b>2 周</b> 中，您有多少时间受到以下问题困扰？",
    timeframe: "过去2周",
    questions: [
      "感到紧张、焦虑或烦躁",
      "无法停止或控制担忧",
      "对各种各样的事情担忧过多",
      "很难放松下来",
      "由于不安而无法静坐",
      "变得容易烦恼或急躁",
      "感到害怕，好像可怕的事情会发生"
    ],
    options: [
      { value: 0, label: "完全没有" },
      { value: 1, label: "几天" },
      { value: 2, label: "一半以上天数" },
      { value: 3, label: "几乎每天" }
    ],
    severity: [
      { min: 0, max: 4, label: "无/极轻微", color: "#27ae60", emoji: "🟢" },
      { min: 5, max: 9, label: "轻度焦虑", color: "#F4A261", emoji: "🟡" },
      { min: 10, max: 14, label: "中度焦虑", color: "#E76F6F", emoji: "🟠" },
      { min: 15, max: 21, label: "重度焦虑", color: "#C0392B", emoji: "🔴" }
    ],
    flagItems: [],
    flagThreshold: 0,
    flagMessage: ""
  },

  // ---------- C-SSRS 哥伦比亚自杀严重度评定量表 (筛查版) ----------
  // Posner K, et al. (2011) Am J Psychiatry
  // 中文版验证: Ji Y, et al. (2023) J Affect Disord
  // Cronbach α = 0.884 (近一周), 0.842 (终生)
  cssrs: {
    id: "cssrs",
    name: "C-SSRS 自杀风险评估",
    icon: "🛡️",
    shortName: "自杀风险评估",
    instruction: "以下问题关于<b>最近 1 个月</b>的情况。请如实回答，这些信息将帮助评估您的安全。",
    timeframe: "最近1个月",
    questions: [
      "你是否希望自己死去，或者希望自己睡着后不再醒来？",
      "你是否有过想要伤害自己（但不一定想死）的念头？",
      "你是否想过自杀的方法（例如吃药、跳楼、上吊等）？",
      "你是否有过实施自杀的意图（不只是想想，而是认真考虑去做）？",
      "你是否已经为自杀做过任何准备（写遗书、准备药物、选择地点等）？",
      "自上次评估以来，你是否实施过任何自杀行为（包括实施后被中断或中止的）？"
    ],
    options: [
      { value: 0, label: "否" },
      { value: 1, label: "是" }
    ],
    // C-SSRS 不使用总分，使用规则判定
    severity: [
      { min: 0, max: 0, label: "低风险", color: "#27ae60", emoji: "🟢" },
      { min: 1, max: 1, label: "中风险：存在自杀意念", color: "#F4A261", emoji: "🟡" },
      { min: 2, max: 2, label: "高风险：有具体方法或计划", color: "#E76F6F", emoji: "🔴" },
      { min: 3, max: 3, label: "极高风险：有自杀行为", color: "#C0392B", emoji: "🚨" }
    ],
    flagItems: [],
    flagThreshold: 0,
    flagMessage: "",
    // 特殊评分逻辑：不是加总分，而是判定最高风险等级
    scoringLogic: "tiered",
    tiers: [
      { maxQ: 2, anyYes: false, level: 0 },              // 全部否 → 低风险
      { maxQ: 2, anyYes: true, level: 1 },               // Q1-Q2 有肯定 → 中风险
      { maxQ: 5, anyYes: true, level: 2 },               // Q3-Q5 有肯定 → 高风险
      { maxQ: 6, q6Yes: true, level: 3 }                 // Q6 肯定 → 极高风险
    ]
  },

  // ---------- DSHI-s 自伤行为筛查 ----------
  // 基于 Gratz KL (2001) DSHI 原版，简化至 9 类核心自伤行为
  // 短版参考: DSHI-s (2023) 巴西验证版 15 题 α=0.95
  dshi: {
    id: "dshi",
    name: "自伤行为筛查",
    icon: "💔",
    shortName: "自伤行为筛查",
    instruction: "以下列出了人们可能对自己做的一些行为。<b>在您的整个生命中</b>，您是否有意（而非意外）做过以下任何行为？",
    timeframe: "终生",
    questions: [
      "用刀、剃须刀片或其他尖锐物品割伤皮肤",
      "用烟头、打火机或火柴烫伤自己",
      "用力击打自己（例如捶墙、捶头、拳打自己）",
      "用头撞墙或其他硬物",
      "阻止伤口愈合（例如反复撕开伤口）",
      "用针、别针或订书钉刺入皮肤",
      "吞下不可食用的物品或有害物质",
      "咬伤自己（例如咬手、咬嘴唇到出血）",
      "严重抓挠皮肤直到破皮或流血"
    ],
    options: [
      { value: 0, label: "从未做过" },
      { value: 1, label: "做过1-2次" },
      { value: 2, label: "做过多次" }
    ],
    severity: [
      { min: 0, max: 0, label: "无自伤行为", color: "#27ae60", emoji: "🟢" },
      { min: 1, max: 3, label: "轻度：1-3种方式", color: "#F4A261", emoji: "🟡" },
      { min: 4, max: 8, label: "中度：4-8种方式", color: "#E76F6F", emoji: "🟠" },
      { min: 9, max: 27, label: "重度：≥9种方式或≥2种方式多次", color: "#C0392B", emoji: "🔴" }
    ],
    flagItems: [],
    flagThreshold: 0,
    flagMessage: ""
  }
};

// ==================== 数据库操作 ====================

// 保存量表结果
async function saveScaleResult(scaleType, score, answers, severityLabel) {
  const date = new Date().toISOString().split("T")[0];
  const existing = await db.scaleEntries
    .where({ scale_type: scaleType, date: date })
    .first();

  const record = {
    scale_type: scaleType,
    date: date,
    answers: answers,        // 每题的分数或选项值
    total_score: score,
    severity_label: severityLabel,
    created_at: new Date().toISOString()
  };

  if (existing) {
    await db.scaleEntries.update(existing.id, record);
    return existing.id;
  }
  return await db.scaleEntries.add(record);
}

// 获取某量表的所有历史结果
async function getScaleHistory(scaleType, limit = 10) {
  return await db.scaleEntries
    .where("scale_type")
    .equals(scaleType)
    .reverse()
    .sortBy("date");
}

// 获取某量表最近一次结果
async function getLatestScaleResult(scaleType) {
  const all = await db.scaleEntries
    .where("scale_type")
    .equals(scaleType)
    .reverse()
    .sortBy("date");
  return all[0] || null;
}

// ==================== 评分逻辑 ====================

function getSeverity(scaleId, score, answers) {
  const scale = SCALES[scaleId];
  if (!scale) return null;

  // 特殊评分：C-SSRS
  if (scale.scoringLogic === "tiered") {
    const q6Yes = answers[5] > 0;
    const q3to5Yes = answers.slice(2, 5).some(a => a > 0);
    const q1to2Yes = answers.slice(0, 2).some(a => a > 0);

    if (q6Yes) return scale.severity[3];   // 极高风险
    if (q3to5Yes) return scale.severity[2]; // 高风险
    if (q1to2Yes) return scale.severity[1]; // 中风险
    return scale.severity[0];               // 低风险
  }

  // 标准评分
  for (const s of scale.severity) {
    if (score >= s.min && score <= s.max) return s;
  }
  return scale.severity[scale.severity.length - 1];
}

// 检查 flag（如 PHQ-9 Q9）
function checkFlags(scaleId, answers) {
  const scale = SCALES[scaleId];
  if (!scale || !scale.flagItems || scale.flagItems.length === 0) return null;

  for (const idx of scale.flagItems) {
    if (answers[idx] >= scale.flagThreshold) {
      return scale.flagMessage;
    }
  }
  return null;
}

// ==================== 量表 UI 渲染 ====================

// 当前正在填写的量表状态
let currentScaleId = null;
let currentScaleAnswers = [];
let currentScaleStep = 0; // 0=介绍页, 1=问题页, 2=结果页

// 打开量表评估弹窗
async function openScaleAssessment(scaleId) {
  const scale = SCALES[scaleId];
  if (!scale) return;

  currentScaleId = scaleId;

  // 检查今天是否已填过
  const today = new Date().toISOString().split("T")[0];
  const existing = await db.scaleEntries
    .where({ scale_type: scaleId, date: today })
    .first();

  const overlay = document.createElement("div");
  overlay.id = "scale-overlay";
  overlay.className = "report-dialog-overlay";
  overlay.addEventListener("click", function(e) {
    if (e.target === overlay) closeScaleAssessment();
  });

  overlay.innerHTML = `
    <div class="scale-dialog" id="scale-dialog">
      <div class="scale-header">
        <button class="scale-close" onclick="closeScaleAssessment()">✕</button>
        <div class="scale-icon">${scale.icon}</div>
        <h2>${scale.name}</h2>
        <p class="scale-subtitle">${scale.timeframe} · ${scale.questions.length} 题 · 约 ${Math.ceil(scale.questions.length * 0.3)} 分钟</p>
        ${existing ? `<p class="scale-today-done">⚠️ 您今天已完成此量表。再次填写将更新今天的结果。</p>` : ""}
        <button class="btn-primary" onclick="startScaleQuestions()" style="margin-top:12px;width:100%;">
          ${existing ? '🔄 重新评估' : '📝 开始评估'}
        </button>
        <button class="btn-text" onclick="showScaleHistory('${scaleId}')" style="margin-top:8px;width:100%;">
          📊 查看历史记录
        </button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
}

// 开始答题
function startScaleQuestions() {
  const scale = SCALES[currentScaleId];
  if (!scale) return;

  currentScaleAnswers = new Array(scale.questions.length).fill(-1);
  currentScaleStep = 1;

  renderScaleQuestion();
}

// 渲染当前问题
function renderScaleQuestion() {
  const scale = SCALES[currentScaleId];
  const dialog = document.getElementById("scale-dialog");
  if (!dialog) return;

  const qIdx = currentScaleAnswers.findIndex(a => a === -1);
  if (qIdx === -1) {
    // 所有问题已答完
    showScaleResult();
    return;
  }

  const total = scale.questions.length;
  const answered = currentScaleAnswers.filter(a => a >= 0).length;
  const progress = Math.round((answered / total) * 100);

  dialog.innerHTML = `
    <div class="scale-header">
      <button class="scale-close" onclick="closeScaleAssessment()">✕</button>
      <div class="scale-progress-bar">
        <div class="scale-progress-fill" style="width:${progress}%"></div>
      </div>
      <span class="scale-progress-text">${answered + 1} / ${total}</span>
    </div>
    <div class="scale-body">
      <p class="scale-question-label">${answered + 1}. ${scale.questions[qIdx]}</p>
      <div class="scale-options">
        ${scale.options.map(opt => `
          <button class="scale-option-btn" onclick="selectScaleAnswer(${qIdx}, ${opt.value})">
            ${opt.label}
          </button>
        `).join("")}
      </div>
    </div>
    <div class="scale-footer">
      ${answered > 0 ? `<button class="btn-text" onclick="prevScaleQuestion()">← 上一题</button>` : '<span></span>'}
    </div>`;
}

// 选择答案
function selectScaleAnswer(qIdx, value) {
  currentScaleAnswers[qIdx] = value;
  renderScaleQuestion();
}

// 上一题
function prevScaleQuestion() {
  // 找到当前题之前最后一个已答的题
  const answered = [];
  currentScaleAnswers.forEach((a, i) => { if (a >= 0) answered.push(i); });
  if (answered.length <= 1) return;

  const lastAnswered = answered[answered.length - 1];
  currentScaleAnswers[lastAnswered] = -1; // 撤销最后一题
  renderScaleQuestion();
}

// 显示结果
async function showScaleResult() {
  const scale = SCALES[currentScaleId];
  const dialog = document.getElementById("scale-dialog");
  if (!dialog) return;

  // 计算总分
  const totalScore = currentScaleAnswers.reduce((s, a) => s + a, 0);
  const severity = getSeverity(currentScaleId, totalScore, currentScaleAnswers);
  const flagMsg = checkFlags(currentScaleId, currentScaleAnswers);

  // 保存到数据库
  await saveScaleResult(currentScaleId, totalScore, [...currentScaleAnswers], severity.label);

  // 如果是 C-SSRS 高风险，触发危机干预
  if (currentScaleId === "cssrs" && (severity.min >= 2)) {
    setTimeout(() => showCrisisIntervention(), 500);
  }

  // 如果是 PHQ-9 Q9 ≥ 2，提示做 C-SSRS
  if (currentScaleId === "phq9" && currentScaleAnswers[8] >= 2) {
    setTimeout(() => {
      if (confirm("⚠️ 您在 PHQ-9 中报告了自杀意念。\n\n建议立即完成 C-SSRS 自杀风险评估量表。\n\n是否现在进行评估？")) {
        closeScaleAssessment();
        setTimeout(() => openScaleAssessment("cssrs"), 300);
      }
    }, 800);
  }

  dialog.innerHTML = `
    <div class="scale-header">
      <button class="scale-close" onclick="closeScaleAssessment()">✕</button>
      <div class="scale-icon">${severity.emoji}</div>
      <h2>评估完成</h2>
    </div>
    <div class="scale-body">
      <div class="scale-result-card" style="border-left: 4px solid ${severity.color};">
        <div class="scale-result-score" style="color:${severity.color};">${totalScore} 分</div>
        <div class="scale-result-label" style="color:${severity.color};">${severity.label}</div>
      </div>

      ${flagMsg ? `<div class="scale-flag-warning">${flagMsg}</div>` : ""}

      <div class="scale-answers-summary">
        <h4>📋 各题得分</h4>
        ${scale.questions.map((q, i) => `
          <div class="scale-answer-row ${currentScaleAnswers[i] >= 2 && scale.id !== 'cssrs' ? 'scale-answer-high' : ''} ${currentScaleAnswers[i] >= 1 && scale.id === 'cssrs' ? 'scale-answer-high' : ''}">
            <span class="scale-answer-num">${i + 1}.</span>
            <span class="scale-answer-text">${q}</span>
            <span class="scale-answer-val">${scale.options.find(o => o.value === currentScaleAnswers[i])?.label || "—"}</span>
          </div>`).join("")}
      </div>

      ${getScaleInterpretation(currentScaleId, totalScore, severity)}
    </div>
    <div class="scale-footer">
      <button class="btn-secondary" onclick="closeScaleAssessment()">关闭</button>
      <button class="btn-primary" onclick="startScaleQuestions()">🔄 重新评估</button>
    </div>`;
}

// 量表解读文案
function getScaleInterpretation(scaleId, score, severity) {
  // PHQ-9
  if (scaleId === "phq9") {
    if (score <= 4) return `<div class="scale-interp"><p>✅ 目前无明显抑郁症状。如有需要，建议定期自评。</p></div>`;
    if (score <= 9) return `<div class="scale-interp"><p>🟡 存在轻度抑郁症状。建议：</p><ul><li>保持规律作息和运动</li><li>记录情绪变化，观察趋势</li><li>如持续2周以上未改善，建议就医</li></ul></div>`;
    if (score <= 14) return `<div class="scale-interp"><p>🟠 存在中度抑郁症状。建议：</p><ul><li>尽快预约精神科或心理科</li><li>开始或继续规范治疗（药物+心理治疗）</li><li>告知家人或信任的人</li><li>避免独自承受</li></ul></div>`;
    if (score <= 19) return `<div class="scale-interp"><p>🔴 中重度抑郁。强烈建议：</p><ul><li>尽早就医，不拖延</li><li>如已在治疗中，与医生讨论调整方案</li><li>确保身边有人陪伴</li><li>将自杀意念告知医生</li></ul></div>`;
    return `<div class="scale-interp"><p>🔴 重度抑郁。请立即行动：</p><ul><li>尽快就医（精神科急诊或门诊）</li><li>如有自杀计划，立即拨打心理援助热线：<b>400-161-9995</b></li><li>不要让药物调整自行进行</li><li>确保24小时有人陪伴</li></ul></div>`;
  }

  // GAD-7
  if (scaleId === "gad7") {
    if (score <= 4) return `<div class="scale-interp"><p>✅ 目前无明显焦虑症状。</p></div>`;
    if (score <= 9) return `<div class="scale-interp"><p>🟡 轻度焦虑。建议练习深呼吸、正念冥想等放松技巧。</p></div>`;
    if (score <= 14) return `<div class="scale-interp"><p>🟠 中度焦虑，可能已影响日常功能。建议就医评估是否需要药物或心理治疗。</p></div>`;
    return `<div class="scale-interp"><p>🔴 重度焦虑。建议尽早就医，考虑药物治疗和心理治疗联合。</p></div>`;
  }

  // C-SSRS
  if (scaleId === "cssrs") {
    if (score === 0) return `<div class="scale-interp"><p>✅ 目前无自杀意念或行为。请继续保持。</p></div>`;
    if (score === 1) return `<div class="scale-interp"><p>🟡 <b>存在自杀意念。</b>请：</p><ul><li>将感受告诉医生或信任的人</li><li>制定安全计划</li><li>保存紧急联系方式</li><li>心理援助热线：<b>400-161-9995</b></li></ul></div>`;
    if (score === 2) return `<div class="scale-interp"><p>🔴 <b>高风险：有具体自杀方法或计划。</b></p><ul><li>请立即告知主治医生</li><li>确保环境安全（移除危险物品）</li><li>24小时有人陪伴</li><li>心理援助热线：<b>400-161-9995</b></li><li>如有紧急情况，拨打 <b>110</b> 或前往最近急诊室</li></ul></div>`;
    return `<div class="scale-interp"><p>🚨 <b>极高风险：有自杀行为。</b></p><ul><li>请立即就医（精神科急诊）</li><li>不要独处</li><li>心理援助热线：<b>400-161-9995</b></li><li>紧急情况拨打 <b>120</b> 或 <b>110</b></li></ul></div>`;
  }

  // DSHI
  if (scaleId === "dshi") {
    if (score === 0) return `<div class="scale-interp"><p>✅ 无自伤行为史。</p></div>`;
    return `<div class="scale-interp"><p>⚠️ 有自伤行为史。建议：</p><ul><li>在就诊时告知医生</li><li>自伤通常与情绪调节困难有关</li><li>DBT（辩证行为疗法）对减少自伤行为有循证支持</li><li>如当前仍有强烈自伤冲动，请拨打 <b>400-161-9995</b></li></ul></div>`;
  }

  return "";
}

// 关闭量表弹窗
function closeScaleAssessment() {
  const overlay = document.getElementById("scale-overlay");
  if (overlay) overlay.remove();
  currentScaleId = null;
  currentScaleAnswers = [];
  currentScaleStep = 0;
  // 刷新统计页的量表卡片
  if (typeof renderScaleCards === "function") renderScaleCards();
}

// ==================== 危机干预流程 ====================

function showCrisisIntervention() {
  const overlay = document.createElement("div");
  overlay.id = "crisis-overlay";
  overlay.className = "report-dialog-overlay";
  overlay.innerHTML = `
    <div class="crisis-dialog">
      <div class="crisis-header">
        <div class="crisis-icon">🛡️</div>
        <h2>安全提醒</h2>
        <p>您的评估结果显示存在较高风险。以下信息可能对您有帮助：</p>
      </div>
      <div class="crisis-body">
        <div class="crisis-hotline">
          <div class="crisis-hotline-icon">📞</div>
          <div class="crisis-hotline-info">
            <div class="crisis-hotline-name">全国24小时心理援助热线</div>
            <div class="crisis-hotline-num">400-161-9995</div>
          </div>
        </div>
        <div class="crisis-hotline">
          <div class="crisis-hotline-icon">📞</div>
          <div class="crisis-hotline-info">
            <div class="crisis-hotline-name">北京心理危机研究与干预中心</div>
            <div class="crisis-hotline-num">010-82951332</div>
          </div>
        </div>
        <div class="crisis-hotline">
          <div class="crisis-hotline-icon">📞</div>
          <div class="crisis-hotline-info">
            <div class="crisis-hotline-name">希望24热线（上海）</div>
            <div class="crisis-hotline-num">400-161-9995</div>
          </div>
        </div>
        <div class="crisis-actions">
          <p style="margin-top:12px;font-size:0.9rem;color:var(--text-light);">
            💡 你可以在设置中添加紧急联系人，当你需要帮助时一键呼叫。
          </p>
        </div>
      </div>
      <button class="btn-primary" onclick="document.getElementById('crisis-overlay').remove()" style="width:100%;margin-top:12px;">
        我已了解
      </button>
      <button class="btn-text" onclick="document.getElementById('crisis-overlay').remove();switchPage('settings');" style="width:100%;margin-top:4px;">
        ⚙️ 去设置紧急联系人
      </button>
    </div>`;
  document.body.appendChild(overlay);
}

// ==================== 量表历史记录 ====================

async function showScaleHistory(scaleId) {
  const scale = SCALES[scaleId];
  const history = await getScaleHistory(scaleId, 20);

  const dialog = document.getElementById("scale-dialog");
  if (!dialog) return;

  dialog.innerHTML = `
    <div class="scale-header">
      <button class="scale-close" onclick="openScaleAssessment('${scaleId}')">← 返回</button>
      <h2>📊 ${scale.shortName} · 历史记录</h2>
    </div>
    <div class="scale-body">
      ${history.length === 0 ? '<p class="scale-empty">暂无历史记录</p>' : `
        <div class="scale-history-list">
          ${history.map((h, i) => {
            const sev = getSeverity(scaleId, h.total_score, h.answers);
            const prev = history[i + 1];
            const delta = prev ? h.total_score - prev.total_score : null;
            let deltaStr = "";
            if (delta !== null && delta > 0) deltaStr = `<span style="color:#c0392b;">↑${delta}</span>`;
            else if (delta !== null && delta < 0) deltaStr = `<span style="color:#27ae60;">↓${Math.abs(delta)}</span>`;
            else if (delta !== null) deltaStr = `<span style="color:#636e72;">→0</span>`;

            return `
            <div class="scale-history-item" style="border-left: 3px solid ${sev.color};">
              <div class="scale-history-top">
                <span class="scale-history-date">${h.date}</span>
                <span class="scale-history-score" style="color:${sev.color};">${h.total_score} 分 · ${sev.label}</span>
                ${delta !== null ? `<span style="font-size:0.8rem;">${deltaStr}</span>` : ""}
              </div>
            </div>`;
          }).join("")}
        </div>
      `}
    </div>`;
}

// ==================== 统计页量表卡片 ====================

async function renderScaleCards() {
  const container = document.getElementById("scale-cards-container");
  if (!container) return;

  const scales = [
    { id: "phq9", desc: "9题 · 2分钟 · 筛查抑郁严重度" },
    { id: "gad7", desc: "7题 · 1分钟 · 筛查焦虑严重度" },
    { id: "cssrs", desc: "6题 · 2分钟 · 评估自杀风险 (哥伦比亚量表)", cls: "scale-card-deep" },
    { id: "dshi", desc: "9题 · 3分钟 · 自伤行为筛查", cls: "scale-card-deep" }
  ];

  const cards = await Promise.all(scales.map(async (s) => {
    const scale = SCALES[s.id];
    const latest = await getLatestScaleResult(s.id);
    let statusHtml = "";

    if (latest) {
      const sev = getSeverity(s.id, latest.total_score, latest.answers);
      statusHtml = `
        <div class="scale-card-status">
          <span class="scale-card-date">最近: ${latest.date.slice(5)}</span>
          <span class="scale-card-severity" style="color:${sev.color};">${sev.emoji} ${latest.total_score}分 · ${sev.label}</span>
        </div>`;
    } else {
      statusHtml = `<div class="scale-card-status"><span class="scale-card-date" style="color:var(--text-light);">尚未评估</span></div>`;
    }

    return `
      <div class="scale-card ${s.cls || ""}">
        <div class="scale-card-top">
          <span class="scale-card-icon">${scale.icon}</span>
          <div class="scale-card-info">
            <div class="scale-card-name">${scale.shortName}</div>
            <div class="scale-card-desc">${s.desc}</div>
          </div>
        </div>
        ${statusHtml}
        <button class="btn-scale-start" onclick="openScaleAssessment('${s.id}')">
          ${latest ? '🔄 重新评估' : '📝 开始评估'}
        </button>
      </div>`;
  }));

  container.innerHTML = cards.join("");
}

// ==================== 报告数据收集 ====================

// 获取报告所需的量表数据
async function collectScaleDataForReport(days) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split("T")[0];

  const scales = ["phq9", "gad7", "cssrs", "dshi"];
  const result = {};

  for (const scaleId of scales) {
    const all = await db.scaleEntries
      .where("scale_type")
      .equals(scaleId)
      .reverse()
      .sortBy("date");

    const inRange = all.filter(e => e.date >= sinceStr);
    const latest = all[0] || null;
    const baseline = all.length > 0 ? all[all.length - 1] : null;

    result[scaleId] = {
      entries: inRange,
      latest: latest,
      baseline: baseline,
      hasData: inRange.length > 0,
      trend: inRange.length >= 2 ? inRange[0].total_score - inRange[inRange.length - 1].total_score : null
    };
  }

  return result;
}

// ==================== CSS 动态注入 ====================

function injectScaleStyles() {
  if (document.getElementById("scale-styles")) return;
  const style = document.createElement("style");
  style.id = "scale-styles";
  style.textContent = `
    /* 量表弹窗 */
    .scale-dialog {
      background: #fff; border-radius: 16px; padding: 20px;
      max-width: 480px; width: 90vw; max-height: 90vh; overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    .scale-header { text-align: center; position: relative; margin-bottom: 16px; }
    .scale-close {
      position: absolute; right: 0; top: 0; background: none; border: none;
      font-size: 20px; cursor: pointer; color: var(--text-light); padding: 4px 8px;
    }
    .scale-icon { font-size: 40px; margin-bottom: 8px; }
    .scale-header h2 { font-size: 1.1rem; color: var(--text); margin: 4px 0; }
    .scale-subtitle { font-size: 0.8rem; color: var(--text-light); margin: 0; }
    .scale-today-done {
      background: #FFF3E0; color: #E67E22; font-size: 0.8rem;
      padding: 8px 12px; border-radius: 8px; margin-top: 8px;
    }

    /* 进度条 */
    .scale-progress-bar {
      width: 100%; height: 4px; background: #e9ecef; border-radius: 2px;
      margin: 8px 0; overflow: hidden;
    }
    .scale-progress-fill {
      height: 100%; background: var(--primary); border-radius: 2px;
      transition: width 0.3s ease;
    }
    .scale-progress-text { font-size: 0.75rem; color: var(--text-light); }

    /* 题目区 */
    .scale-body { margin: 16px 0; }
    .scale-question-label {
      font-size: 1rem; color: var(--text); margin-bottom: 16px;
      line-height: 1.6; font-weight: 500;
    }
    .scale-options { display: flex; flex-direction: column; gap: 8px; }
    .scale-option-btn {
      width: 100%; padding: 14px 16px; background: #f8f9fa; border: 2px solid #e9ecef;
      border-radius: 12px; font-size: 0.95rem; cursor: pointer; text-align: left;
      transition: all 0.15s ease;
    }
    .scale-option-btn:hover { border-color: var(--primary); background: #f0f7f0; }
    .scale-option-btn:active { transform: scale(0.98); }

    .scale-footer { display: flex; justify-content: space-between; padding-top: 8px; }

    /* 结果页 */
    .scale-result-card {
      text-align: center; padding: 16px; margin: 8px 0; border-radius: 12px;
      background: #f8f9fa;
    }
    .scale-result-score { font-size: 2.5rem; font-weight: 700; }
    .scale-result-label { font-size: 1.1rem; font-weight: 600; margin-top: 4px; }
    .scale-flag-warning {
      background: #FFEBEE; color: #C0392B; padding: 10px 14px;
      border-radius: 8px; margin: 8px 0; font-size: 0.85rem; font-weight: 500;
    }
    .scale-answers-summary { margin-top: 16px; }
    .scale-answers-summary h4 {
      font-size: 0.9rem; color: var(--text); margin-bottom: 8px;
    }
    .scale-answer-row {
      display: flex; align-items: center; padding: 6px 8px;
      border-radius: 6px; font-size: 0.8rem; gap: 6px;
    }
    .scale-answer-row:nth-child(odd) { background: #fafafa; }
    .scale-answer-high { background: #FFF3E0 !important; }
    .scale-answer-num { color: var(--text-light); min-width: 20px; }
    .scale-answer-text { flex: 1; color: var(--text); }
    .scale-answer-val {
      font-weight: 600; color: var(--primary); white-space: nowrap;
      min-width: 80px; text-align: right;
    }
    .scale-answer-high .scale-answer-val { color: #E67E22; }
    .scale-interp {
      background: #f8f9fa; padding: 12px; border-radius: 8px;
      margin-top: 12px; font-size: 0.85rem; line-height: 1.6;
    }
    .scale-interp ul { margin: 4px 0 0 16px; }
    .scale-interp li { margin: 2px 0; }

    /* 历史 */
    .scale-history-list { display: flex; flex-direction: column; gap: 8px; }
    .scale-history-item { padding: 10px 12px; border-radius: 8px; background: #f8f9fa; }
    .scale-history-top { display: flex; align-items: center; gap: 10px; }
    .scale-history-date { font-size: 0.85rem; font-weight: 600; color: var(--text); }
    .scale-history-score { font-size: 0.85rem; font-weight: 600; }
    .scale-empty {
      text-align: center; color: var(--text-light); padding: 24px;
      font-size: 0.9rem;
    }

    /* 卡片区 (统计页) */
    .scale-cards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    @media (max-width: 420px) { .scale-cards-grid { grid-template-columns: 1fr; } }
    .scale-card {
      background: #f8f9fa; border-radius: 10px; padding: 12px;
      border: 1px solid #e9ecef;
    }
    .scale-card-deep { background: #fafafa; border-color: #e0e0e0; }
    .scale-card-top { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .scale-card-icon { font-size: 24px; }
    .scale-card-info { flex: 1; }
    .scale-card-name { font-size: 0.9rem; font-weight: 600; color: var(--text); }
    .scale-card-desc { font-size: 0.7rem; color: var(--text-light); }
    .scale-card-status { font-size: 0.75rem; margin: 4px 0; display: flex; flex-wrap: wrap; gap: 6px; }
    .scale-card-date { color: var(--text-light); }
    .scale-card-severity { font-weight: 600; }
    .btn-scale-start {
      width: 100%; padding: 8px; margin-top: 6px;
      background: var(--primary); color: #fff; border: none;
      border-radius: 8px; font-size: 0.85rem; cursor: pointer;
    }
    .btn-scale-start:hover { opacity: 0.9; }
    .scale-section-divider {
      display: flex; align-items: center; gap: 8px;
      margin: 10px 0 6px; font-size: 0.75rem; color: var(--text-light);
    }
    .scale-section-divider::before, .scale-section-divider::after {
      content: ""; flex: 1; height: 1px; background: #e0e0e0;
    }

    /* 危机弹窗 */
    .crisis-dialog {
      background: #fff; border-radius: 16px; padding: 20px;
      max-width: 420px; width: 90vw; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      border: 3px solid #E76F6F;
    }
    .crisis-header { text-align: center; margin-bottom: 12px; }
    .crisis-icon { font-size: 48px; }
    .crisis-header h2 { color: #C0392B; margin: 4px 0; }
    .crisis-header p { font-size: 0.85rem; color: var(--text-light); }
    .crisis-body { margin: 12px 0; }
    .crisis-hotline {
      display: flex; align-items: center; gap: 10px; padding: 10px;
      background: #FFF5F5; border-radius: 8px; margin: 6px 0;
    }
    .crisis-hotline-icon { font-size: 28px; }
    .crisis-hotline-name { font-size: 0.85rem; color: var(--text); font-weight: 600; }
    .crisis-hotline-num {
      font-size: 1.2rem; font-weight: 700; color: #C0392B;
      letter-spacing: 1px;
    }
  `;
  document.head.appendChild(style);
}

// 初始化：注入样式
injectScaleStyles();
