/* ============================================
   scales.js — 临床量表评估模块 v2.1
   PHQ-9 | GAD-7 | C-SSRS | DSHI-s | SCL-90
   2026-07-24: +SCL-90(90题/10因子), +选做/必做分离, +云端同步, +趋势图
   2026-07-24 v2.1: +文献引用(中国常模/信效度), DSHI-s max修正, SCL-90解读优化
   ============================================ */

// ==================== 量表定义 ====================

const SCALES = {
  // ---------- PHQ-9 抑郁症筛查 ----------
  // Kroenke K, Spitzer RL, Williams JBW (2001) J Gen Intern Med
  // 截断值≥10: 敏感性88%, 特异性88%
  // 中文版: 卞崔冬等 (2009) 上海精神医学, 综合医院信效度良好
  phq9: {
    id: "phq9",
    name: "PHQ-9 抑郁症筛查",
    icon: "🧠",
    shortName: "抑郁症筛查",
    required: true,
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
    flagItems: [8],
    flagThreshold: 2,
    flagMessage: "⚠️ 第9题提示存在自杀意念，建议进一步用 C-SSRS 量表评估。"
  },

  // ---------- GAD-7 焦虑症筛查 ----------
  // Spitzer RL, Kroenke K, Williams JBW (2006) Arch Intern Med
  // 截断值≥10: 敏感性89%, 特异性82%
  gad7: {
    id: "gad7",
    name: "GAD-7 焦虑症筛查",
    icon: "😰",
    shortName: "焦虑症筛查",
    required: true,
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
  // Posner K et al. (2011) Am J Psychiatry
  // 中文版: Ji Y et al. (2023) J Affect Disord, N=456, α=0.884, RMSEA=0.092
  cssrs: {
    id: "cssrs",
    name: "C-SSRS 自杀风险评估",
    icon: "🛡️",
    shortName: "自杀风险评估",
    required: true,
    instruction: "以下问题关于<b>最近 1 个月</b>的情况。请如实回答。",
    timeframe: "最近1个月",
    questions: [
      "你是否希望自己死去，或者希望自己睡着后不再醒来？",
      "你是否有过想要伤害自己（但不一定想死）的念头？",
      "你是否想过自杀的方法（例如吃药、跳楼、上吊等）？",
      "你是否有过实施自杀的意图（不只是想想，而是认真考虑去做）？",
      "你是否已经为自杀做过任何准备（写遗书、准备药物、选择地点等）？",
      "自上次评估以来，你是否实施过任何自杀行为？"
    ],
    options: [
      { value: 0, label: "否" },
      { value: 1, label: "是" }
    ],
    severity: [
      { min: 0, max: 0, label: "低风险", color: "#27ae60", emoji: "🟢" },
      { min: 1, max: 1, label: "中风险：存在自杀意念", color: "#F4A261", emoji: "🟡" },
      { min: 2, max: 2, label: "高风险：有具体方法或计划", color: "#E76F6F", emoji: "🔴" },
      { min: 3, max: 3, label: "极高风险：有自杀行为", color: "#C0392B", emoji: "🚨" }
    ],
    flagItems: [],
    flagThreshold: 0,
    flagMessage: "",
    scoringLogic: "tiered",
    tiers: [
      { maxQ: 2, anyYes: false, level: 0 },
      { maxQ: 2, anyYes: true, level: 1 },
      { maxQ: 5, anyYes: true, level: 2 },
      { maxQ: 6, q6Yes: true, level: 3 }
    ]
  },

  // ---------- DSHI-s 自伤行为筛查 ----------
  // Gratz KL (2001) J Psychopathol Behav Assess, α=0.82, 重测r=0.91
  // 9题, 0-2评分, 总分0-18
  dshi: {
    id: "dshi",
    name: "自伤行为筛查",
    icon: "💔",
    shortName: "自伤行为筛查",
    required: true,
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
      { min: 1, max: 3, label: "轻度 (总分1-3)", color: "#F4A261", emoji: "🟡" },
      { min: 4, max: 8, label: "中度 (总分4-8)", color: "#E76F6F", emoji: "🟠" },
      { min: 9, max: 18, label: "重度 (总分≥9)", color: "#C0392B", emoji: "🔴" }
    ],
    flagItems: [],
    flagThreshold: 0,
    flagMessage: ""
  },

  // ---------- SCL-90 症状自评量表 (选做) ----------
  // Derogatis LR (1977) SCL-90-R. 中文版: 王征宇 (1984) 上海精神医学
  // 中国常模 (金华 1986, 1388名正常成人): GSI=1.44±0.43
  // 筛查阳性标准: GSI≥1.5 或 任一因子分≥2.0
  // 临床显著性: 任一因子分≥3.0
  // 90题, 10因子, 5级评分 (1-5)
  scl90: {
    id: "scl90",
    name: "SCL-90 症状自评量表",
    icon: "📋",
    shortName: "症状自评量表",
    required: false,
    instruction: "以下列出了人们可能会有的问题。请仔细阅读每一条，根据<b>最近1周</b>的实际情况选择最合适的答案。",
    timeframe: "最近1周",
    // 90 questions, 0-indexed. Factor mapping below.
    questions: [
      "头痛",
      "神经过敏，心中不踏实",
      "头脑中有不必要的想法或字句盘旋",
      "头昏或昏倒",
      "对异性的兴趣减退",
      "对旁人责备求全",
      "感到别人能控制你的思想",
      "责怪别人制造麻烦",
      "忘性大",
      "担心自己的衣饰整齐及仪态的端正",
      "容易烦恼和激动",
      "胸痛",
      "害怕空旷的场所或街道",
      "感到自己的精力下降，活动减慢",
      "想结束自己的生命",
      "听到旁人听不到的声音",
      "发抖",
      "感到大多数人都不可信任",
      "胃口不好",
      "容易哭泣",
      "同异性相处时感到害羞不自在",
      "感到受骗，中了圈套或有人想抓住你",
      "无缘无故地突然感到害怕",
      "自己不能控制地大发脾气",
      "怕单独出门",
      "经常责怪自己",
      "腰痛",
      "感到难以完成任务",
      "感到孤独",
      "感到苦闷",
      "过分担忧",
      "对事物不感兴趣",
      "感到害怕",
      "你的感情容易受到伤害",
      "旁人能知道你的私下想法",
      "感到别人不理解你、不同情你",
      "感到人们对你不友好，不喜欢你",
      "做事必须做得很慢以保证做得正确",
      "心跳得很厉害",
      "恶心或胃部不舒服",
      "感到比不上他人",
      "肌肉酸痛",
      "感到有人在监视你、谈论你",
      "入睡困难",
      "做事必须反复检查",
      "难以做出决定",
      "怕乘电车、公共汽车、地铁或火车",
      "呼吸有困难",
      "一阵阵发冷或发热",
      "因为感到害怕而避开某些东西、场合或活动",
      "脑子变空了",
      "身体发麻或刺痛",
      "喉咙有梗塞感",
      "感到前途没有希望",
      "不能集中注意力",
      "感到身体的某部分软弱无力",
      "感到紧张或容易紧张",
      "感到手或脚发重",
      "想到死亡的事",
      "吃得太多",
      "当别人看着你或谈论你时感到不自在",
      "有一些不属于你自己的想法",
      "有想打人或伤害他人的冲动",
      "醒得太早",
      "必须反复洗手、点数目或触摸某些东西",
      "睡得不稳不深",
      "有想摔坏或破坏东西的冲动",
      "有一些别人没有的想法或念头",
      "感到对别人神经过敏",
      "在商店或电影院等人多的地方感到不自在",
      "感到任何事情都很困难",
      "一阵阵恐惧或惊恐",
      "感到在公共场合吃东西很不舒服",
      "经常与人争论",
      "单独一人时神经很紧张",
      "别人对你的成绩没有作出恰当的评价",
      "即使和别人在一起也感到孤单",
      "感到坐立不安、心神不定",
      "感到自己没有什么价值",
      "感到熟悉的东西变成陌生或不像是真的",
      "大叫或摔东西",
      "害怕会在公共场合昏倒",
      "感到别人想占你的便宜",
      "为一些有关\"性\"的想法而很苦恼",
      "你认为应该因为自己的过错而受到惩罚",
      "感到要赶快把事情做完",
      "感到自己的身体有严重问题",
      "从未感到和其他人很亲近",
      "感到自己有罪",
      "感到自己的脑子有毛病"
    ],
    options: [
      { value: 1, label: "从无" },
      { value: 2, label: "轻度" },
      { value: 3, label: "中度" },
      { value: 4, label: "偏重" },
      { value: 5, label: "严重" }
    ],
    // 10 factor dimensions (0-indexed question indices)
    dimensions: [
      { name: "躯体化",      items: [0,3,11,26,39,41,47,48,51,52,55,57] },
      { name: "强迫症状",    items: [2,8,9,27,37,44,45,50,54,64] },
      { name: "人际关系敏感", items: [5,20,33,35,36,40,60,68,72] },
      { name: "抑郁",        items: [4,13,14,19,21,25,28,29,30,31,53,70,78] },
      { name: "焦虑",        items: [1,16,22,32,38,56,71,77,79,85] },
      { name: "敌对",        items: [10,23,62,66,73,80] },
      { name: "恐怖",        items: [12,24,46,49,69,74,81] },
      { name: "偏执",        items: [7,17,42,67,75,82] },
      { name: "精神病性",    items: [6,15,34,61,76,83,84,86,87,89] },
      { name: "其他",        items: [18,43,58,59,63,65,88] }
    ],
    severity: [
      { min: 0, max: 1.49, label: "正常", color: "#27ae60", emoji: "🟢" },
      { min: 1.5, max: 1.99, label: "轻度异常", color: "#F4A261", emoji: "🟡" },
      { min: 2.0, max: 2.49, label: "中度异常", color: "#E76F6F", emoji: "🟠" },
      { min: 2.5, max: 2.99, label: "偏重异常", color: "#C0392B", emoji: "🔴" },
      { min: 3.0, max: 5.0, label: "严重异常", color: "#8B0000", emoji: "🔴" }
    ],
    flagItems: [],
    flagThreshold: 0,
    flagMessage: "",
    scoringLogic: "scl90",
    // 每题分数范围 1-5, 总分范围 90-450
    // 严重度基于 GSI (总均分 = total/90)
    maxTotal: 450,
    minTotal: 90
  }
};

// ==================== 数据库操作 ====================

async function saveScaleResult(scaleType, score, answers, severityLabel) {
  const date = new Date().toISOString().split("T")[0];
  const existing = await db.scaleEntries
    .where({ scale_type: scaleType, date: date })
    .first();

  const record = {
    scale_type: scaleType,
    date: date,
    answers: answers,
    total_score: score,
    severity_label: severityLabel,
    synced: false,
    created_at: new Date().toISOString()
  };

  if (existing) {
    await db.scaleEntries.update(existing.id, record);
    return existing.id;
  }
  return await db.scaleEntries.add(record);
}

async function getScaleHistory(scaleType, limitDays = 90) {
  const since = new Date();
  since.setDate(since.getDate() - limitDays);
  const sinceStr = since.toISOString().split("T")[0];

  const all = await db.scaleEntries
    .where("scale_type")
    .equals(scaleType)
    .reverse()
    .sortBy("date");

  return all.filter(e => e.date >= sinceStr);
}

async function getLatestScaleResult(scaleType) {
  const all = await db.scaleEntries
    .where("scale_type")
    .equals(scaleType)
    .reverse()
    .sortBy("date");
  return all[0] || null;
}

// ==================== 同步辅助函数 ====================

async function getAllUnsyncedScales() {
  const all = await db.scaleEntries.toArray();
  return all.filter(e => !e.synced);
}

async function markScaleSynced(id) {
  return await db.scaleEntries.update(id, { synced: true });
}

// ==================== SCL-90 因子评分 ====================

function getSCL90Factors(answers) {
  const scl90 = SCALES.scl90;
  if (!scl90) return null;

  const total = answers.reduce((s, a) => s + a, 0);
  const gsi = Math.round((total / 90) * 100) / 100;        // Global Severity Index
  const pst = answers.filter(a => a >= 3).length;           // Positive Symptom Total
  const psdi = pst > 0 ? Math.round((total / pst) * 100) / 100 : 0; // Positive Symptom Distress Index

  const factors = scl90.dimensions.map(dim => {
    const scores = dim.items.map(i => answers[i]).filter(a => a > 0);
    const sum = scores.reduce((s, a) => s + a, 0);
    const avg = dim.items.length > 0 ? Math.round((sum / dim.items.length) * 100) / 100 : 0;
    const positiveCount = scores.filter(a => a >= 3).length;
    return {
      name: dim.name,
      itemCount: dim.items.length,
      avg: avg,
      sum: sum,
      positiveCount: positiveCount
    };
  });

  return { total, gsi, pst, psdi, factors };
}

// ==================== 评分逻辑 ====================

function getSeverity(scaleId, score, answers) {
  const scale = SCALES[scaleId];
  if (!scale) return null;

  // C-SSRS tiered
  if (scale.scoringLogic === "tiered") {
    const q6Yes = answers[5] > 0;
    const q3to5Yes = answers.slice(2, 5).some(a => a > 0);
    const q1to2Yes = answers.slice(0, 2).some(a => a > 0);
    if (q6Yes) return scale.severity[3];
    if (q3to5Yes) return scale.severity[2];
    if (q1to2Yes) return scale.severity[1];
    return scale.severity[0];
  }

  // SCL-90: severity based on GSI (total/90)
  if (scale.scoringLogic === "scl90") {
    const gsi = score / 90; // score = total score
    for (const s of scale.severity) {
      if (gsi >= s.min && gsi <= s.max) return s;
    }
    return scale.severity[scale.severity.length - 1];
  }

  // Standard sum-based
  for (const s of scale.severity) {
    if (score >= s.min && score <= s.max) return s;
  }
  return scale.severity[scale.severity.length - 1];
}

function checkFlags(scaleId, answers) {
  const scale = SCALES[scaleId];
  if (!scale || !scale.flagItems || scale.flagItems.length === 0) return null;

  // 选做量表不触发 flag 警告
  if (scale.required === false) return null;

  for (const idx of scale.flagItems) {
    if (answers[idx] >= scale.flagThreshold) {
      return scale.flagMessage;
    }
  }
  return null;
}

// ==================== 量表 UI 渲染 ====================

let currentScaleId = null;
let currentScaleAnswers = [];
let currentScaleStep = 0;
let scl90Page = 0;           // SCL-90 翻页
const SCL90_PAGE_SIZE = 10;  // 每页10题

async function openScaleAssessment(scaleId) {
  const scale = SCALES[scaleId];
  if (!scale) return;

  currentScaleId = scaleId;
  currentScaleAnswers = new Array(scale.questions.length).fill(-1);
  scl90Page = 0;

  const today = new Date().toISOString().split("T")[0];
  const existing = await db.scaleEntries
    .where({ scale_type: scaleId, date: today })
    .first();

  const totalQuestions = scale.questions.length;

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
        <p class="scale-subtitle">${scale.timeframe} · ${totalQuestions} 题 · 约 ${Math.ceil(totalQuestions * 0.2)} 分钟</p>
        ${scale.required === false ? '<p class="scale-optional-tag">📋 选做量表（不影响报告和警告）</p>' : ''}
        ${existing ? '<p class="scale-today-done">⚠️ 您今天已完成此量表。再次填写将更新今天的结果。</p>' : ''}
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

function startScaleQuestions() {
  const scale = SCALES[currentScaleId];
  if (!scale) return;

  currentScaleAnswers = new Array(scale.questions.length).fill(-1);
  currentScaleStep = 1;
  scl90Page = 0;

  renderScaleQuestion();
}

function renderScaleQuestion() {
  const scale = SCALES[currentScaleId];
  const dialog = document.getElementById("scale-dialog");
  if (!dialog) return;

  // SCL-90 uses page-based rendering (10 questions per page)
  if (scale.scoringLogic === "scl90") {
    renderSCL90Page();
    return;
  }

  const qIdx = currentScaleAnswers.findIndex(a => a === -1);
  if (qIdx === -1) {
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

// SCL-90 分页渲染
function renderSCL90Page() {
  const scale = SCALES[currentScaleId];
  const dialog = document.getElementById("scale-dialog");
  if (!dialog) return;

  const totalPages = Math.ceil(scale.questions.length / SCL90_PAGE_SIZE);
  const startIdx = scl90Page * SCL90_PAGE_SIZE;
  const endIdx = Math.min(startIdx + SCL90_PAGE_SIZE, scale.questions.length);
  const pageQuestions = scale.questions.slice(startIdx, endIdx);

  const answered = currentScaleAnswers.filter(a => a >= 0).length;
  const progress = Math.round((answered / scale.questions.length) * 100);

  dialog.innerHTML = `
    <div class="scale-header">
      <button class="scale-close" onclick="closeScaleAssessment()">✕</button>
      <div class="scale-progress-bar">
        <div class="scale-progress-fill" style="width:${progress}%"></div>
      </div>
      <span class="scale-progress-text">${answered} / ${scale.questions.length} · 第 ${scl90Page + 1}/${totalPages} 页</span>
    </div>
    <div class="scale-body scl90-body">
      ${pageQuestions.map((q, i) => {
        const qIdx = startIdx + i;
        const val = currentScaleAnswers[qIdx];
        return `
        <div class="scl90-question-row ${val >= 4 ? 'scl90-severe' : val >= 3 ? 'scl90-moderate' : ''}">
          <div class="scl90-q-num">${qIdx + 1}.</div>
          <div class="scl90-q-text">${q}</div>
          <div class="scl90-q-opts">
            ${scale.options.map(opt => `
              <button class="scl90-opt-btn ${val === opt.value ? 'selected' : ''}"
                onclick="selectSCL90Answer(${qIdx}, ${opt.value})">${opt.label}</button>
            `).join("")}
          </div>
        </div>`;
      }).join("")}
    </div>
    <div class="scale-footer scl90-footer">
      <div class="scl90-page-nav">
        ${scl90Page > 0 ? `<button class="btn-text" onclick="scl90PrevPage()">← 上一页</button>` : '<span></span>'}
        <span class="scl90-page-dots">${Array.from({length: totalPages}, (_, i) =>
          `<span class="scl90-dot ${i === scl90Page ? 'active' : ''}
            ${pageHasAnswers(i) ? 'filled' : ''}"
            onclick="scl90GoPage(${i})"></span>`
        ).join("")}</span>
        ${scl90Page < totalPages - 1 ? `<button class="btn-primary" onclick="scl90NextPage()">下一页 →</button>` :
          answered === scale.questions.length ? `<button class="btn-primary" onclick="showScaleResult()">✅ 完成评估</button>` :
          `<button class="btn-secondary" onclick="scl90GoPage(${findFirstUnansweredPage()})">继续答题 →</button>`}
      </div>
    </div>`;
}

function pageHasAnswers(pageNum) {
  const start = pageNum * SCL90_PAGE_SIZE;
  const end = Math.min(start + SCL90_PAGE_SIZE, currentScaleAnswers.length);
  return currentScaleAnswers.slice(start, end).some(a => a >= 0);
}

function findFirstUnansweredPage() {
  const scale = SCALES[currentScaleId];
  const totalPages = Math.ceil(scale.questions.length / SCL90_PAGE_SIZE);
  for (let p = 0; p < totalPages; p++) {
    const start = p * SCL90_PAGE_SIZE;
    const end = Math.min(start + SCL90_PAGE_SIZE, scale.questions.length);
    if (currentScaleAnswers.slice(start, end).some(a => a === -1)) return p;
  }
  return 0;
}

function selectSCL90Answer(qIdx, value) {
  currentScaleAnswers[qIdx] = value;
  renderSCL90Page();
}

function scl90NextPage() {
  scl90Page++;
  renderSCL90Page();
}

function scl90PrevPage() {
  if (scl90Page > 0) { scl90Page--; renderSCL90Page(); }
}

function scl90GoPage(pageNum) {
  scl90Page = pageNum;
  renderSCL90Page();
}

function selectScaleAnswer(qIdx, value) {
  currentScaleAnswers[qIdx] = value;
  renderScaleQuestion();
}

function prevScaleQuestion() {
  const answered = [];
  currentScaleAnswers.forEach((a, i) => { if (a >= 0) answered.push(i); });
  if (answered.length <= 1) return;
  const lastAnswered = answered[answered.length - 1];
  currentScaleAnswers[lastAnswered] = -1;
  renderScaleQuestion();
}

// ==================== 结果页 ====================

async function showScaleResult() {
  const scale = SCALES[currentScaleId];
  const dialog = document.getElementById("scale-dialog");
  if (!dialog) return;

  const isRequired = scale.required !== false;

  // SCL-90 special scoring
  if (scale.scoringLogic === "scl90") {
    showSCL90Result();
    return;
  }

  const totalScore = currentScaleAnswers.reduce((s, a) => s + a, 0);
  const severity = getSeverity(currentScaleId, totalScore, currentScaleAnswers);
  const flagMsg = isRequired ? checkFlags(currentScaleId, currentScaleAnswers) : null;

  try {
    await saveScaleResult(currentScaleId, totalScore, [...currentScaleAnswers], severity.label);
  } catch (e) {
    handleError(e, "保存量表结果", { toast: true });
    return;
  }

  // Crisis intervention (required scales only)
  if (isRequired && currentScaleId === "cssrs" && severity.min >= 2) {
    setTimeout(() => showCrisisIntervention(), 500);
  }
  if (isRequired && currentScaleId === "phq9" && currentScaleAnswers[8] >= 2) {
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

// SCL-90 专用结果页
async function showSCL90Result() {
  const scale = SCALES.scl90;
  const dialog = document.getElementById("scale-dialog");
  if (!dialog) return;

  const factorResult = getSCL90Factors(currentScaleAnswers);
  const severity = getSeverity("scl90", factorResult.total, currentScaleAnswers);

  try {
    await saveScaleResult("scl90", factorResult.total, [...currentScaleAnswers], severity.label);
  } catch (e) {
    handleError(e, "保存SCL-90结果", { toast: true });
    return;
  }

  const factorColors = factorResult.factors.map(f => {
    if (f.avg >= 3.0) return "#C0392B";
    if (f.avg >= 2.0) return "#F4A261";
    return "#27ae60";
  });

  dialog.innerHTML = `
    <div class="scale-header">
      <button class="scale-close" onclick="closeScaleAssessment()">✕</button>
      <div class="scale-icon">${severity.emoji}</div>
      <h2>SCL-90 评估完成</h2>
    </div>
    <div class="scale-body">
      <div class="scale-result-card" style="border-left: 4px solid ${severity.color};">
        <div class="scale-result-score" style="color:${severity.color};">${factorResult.total} 分</div>
        <div class="scale-result-label" style="color:${severity.color};">GSI ${factorResult.gsi} · ${severity.label}</div>
      </div>

      <div class="scl90-stats">
        <div class="scl90-stat-item">
          <div class="scl90-stat-val">${factorResult.total}</div>
          <div class="scl90-stat-lbl">总分 (90-450)</div>
        </div>
        <div class="scl90-stat-item">
          <div class="scl90-stat-val">${factorResult.gsi}</div>
          <div class="scl90-stat-lbl">总均分 GSI</div>
        </div>
        <div class="scl90-stat-item">
          <div class="scl90-stat-val">${factorResult.pst}</div>
          <div class="scl90-stat-lbl">阳性项目数</div>
        </div>
        <div class="scl90-stat-item">
          <div class="scl90-stat-val">${factorResult.psdi}</div>
          <div class="scl90-stat-lbl">阳性均分 PSDI</div>
        </div>
      </div>

      <div class="scale-answers-summary" style="margin-top:12px;">
        <h4>📊 因子分</h4>
        <div class="scl90-factor-table">
          <div class="scl90-factor-header">
            <span>因子</span><span>均分</span><span>阳性</span><span>评估</span>
          </div>
          ${factorResult.factors.map((f, i) => `
            <div class="scl90-factor-row" style="border-left:3px solid ${factorColors[i]};">
              <span class="scl90-factor-name">${f.name}</span>
              <span class="scl90-factor-avg" style="color:${factorColors[i]};">${f.avg}</span>
              <span class="scl90-factor-pos">${f.positiveCount > 0 ? f.positiveCount : '—'}</span>
              <span class="scl90-factor-level" style="color:${factorColors[i]};">
                ${f.avg >= 3.0 ? '⚠️ 重度' : f.avg >= 2.0 ? '🟡 异常' : '✅ 正常'}
              </span>
            </div>
          `).join("")}
        </div>
      </div>

      ${getScaleInterpretation("scl90", factorResult.total, severity)}
    </div>
    <div class="scale-footer">
      <button class="btn-secondary" onclick="closeScaleAssessment()">关闭</button>
      <button class="btn-primary" onclick="startScaleQuestions()">🔄 重新评估</button>
    </div>`;
}

// ==================== 量表解读 ====================

function getScaleInterpretation(scaleId, score, severity) {
  if (scaleId === "phq9") {
    if (score <= 4) return `<div class="scale-interp"><p>✅ 目前无明显抑郁症状。如有需要，建议定期自评。</p></div>`;
    if (score <= 9) return `<div class="scale-interp"><p>🟡 存在轻度抑郁症状。建议：</p><ul><li>保持规律作息和运动</li><li>记录情绪变化，观察趋势</li><li>如持续2周以上未改善，建议就医</li></ul></div>`;
    if (score <= 14) return `<div class="scale-interp"><p>🟠 存在中度抑郁症状。建议：</p><ul><li>尽快预约精神科或心理科</li><li>开始或继续规范治疗（药物+心理治疗）</li><li>告知家人或信任的人</li><li>避免独自承受</li></ul></div>`;
    if (score <= 19) return `<div class="scale-interp"><p>🔴 中重度抑郁。强烈建议：</p><ul><li>尽早就医，不拖延</li><li>如已在治疗中，与医生讨论调整方案</li><li>确保身边有人陪伴</li><li>将自杀意念告知医生</li></ul></div>`;
    return `<div class="scale-interp"><p>🔴 重度抑郁。请立即行动：</p><ul><li>尽快就医（精神科急诊或门诊）</li><li>如有自杀计划，立即拨打心理援助热线：<b>400-161-9995</b></li><li>不要让药物调整自行进行</li><li>确保24小时有人陪伴</li></ul></div>`;
  }

  if (scaleId === "gad7") {
    if (score <= 4) return `<div class="scale-interp"><p>✅ 目前无明显焦虑症状。</p></div>`;
    if (score <= 9) return `<div class="scale-interp"><p>🟡 轻度焦虑。建议练习深呼吸、正念冥想等放松技巧。</p></div>`;
    if (score <= 14) return `<div class="scale-interp"><p>🟠 中度焦虑，可能已影响日常功能。建议就医评估是否需要药物或心理治疗。</p></div>`;
    return `<div class="scale-interp"><p>🔴 重度焦虑。建议尽早就医，考虑药物治疗和心理治疗联合。</p></div>`;
  }

  if (scaleId === "cssrs") {
    if (score === 0) return `<div class="scale-interp"><p>✅ 目前无自杀意念或行为。请继续保持。</p></div>`;
    if (score === 1) return `<div class="scale-interp"><p>🟡 <b>存在自杀意念。</b>请：</p><ul><li>将感受告诉医生或信任的人</li><li>制定安全计划</li><li>保存紧急联系方式</li><li>心理援助热线：<b>400-161-9995</b></li></ul></div>`;
    if (score === 2) return `<div class="scale-interp"><p>🔴 <b>高风险：有具体自杀方法或计划。</b></p><ul><li>请立即告知主治医生</li><li>确保环境安全（移除危险物品）</li><li>24小时有人陪伴</li><li>心理援助热线：<b>400-161-9995</b></li><li>如有紧急情况，拨打 <b>110</b> 或前往最近急诊室</li></ul></div>`;
    return `<div class="scale-interp"><p>🚨 <b>极高风险：有自杀行为。</b></p><ul><li>请立即就医（精神科急诊）</li><li>不要独处</li><li>心理援助热线：<b>400-161-9995</b></li><li>紧急情况拨打 <b>120</b> 或 <b>110</b></li></ul></div>`;
  }

  if (scaleId === "dshi") {
    if (score === 0) return `<div class="scale-interp"><p>✅ 无自伤行为史。</p></div>`;
    return `<div class="scale-interp"><p>⚠️ 有自伤行为史。建议：</p><ul><li>在就诊时告知医生</li><li>自伤通常与情绪调节困难有关</li><li>DBT（辩证行为疗法）对减少自伤行为有循证支持</li><li>如当前仍有强烈自伤冲动，请拨打 <b>400-161-9995</b></li></ul></div>`;
  }

  if (scaleId === "scl90") {
    // score = total score (90-450), GSI = score/90
    // 中国常模 (金华 1986, N=1388): GSI=1.44±0.43
    // 筛查阳性阈值: GSI≥1.5; 因子阳性阈值: 均分≥2.0; 临床显著: ≥3.0
    if (score <= 135) return `<div class="scale-interp"><p>✅ GSI ${(score/90).toFixed(2)}，在中国常模范围内(GSI=1.44±0.43, 金华1986)。整体心理健康状况良好。</p><p style="font-size:0.8rem;color:var(--text-light);margin-top:4px;">注：此结果为自评筛查工具，不能替代专业临床诊断。如有疑虑请咨询精神科医生。</p></div>`;
    if (score <= 180) return `<div class="scale-interp"><p>🟡 轻度异常(GSI ${(score/90).toFixed(2)})，超过中国常模+1SD。建议：</p><ul><li>关注因子分≥2.0的维度（已过筛查阳性线）</li><li>保持每1-2周定期自评，观察趋势变化</li><li>如持续2周以上未改善，建议就医咨询</li></ul></div>`;
    if (score <= 225) return `<div class="scale-interp"><p>🟠 中度异常(GSI ${(score/90).toFixed(2)})。多个维度可能超出正常范围。建议：</p><ul><li>预约精神科或临床心理科进行系统评估</li><li>重点关注因子分≥2.5的维度</li><li>阳性项目数(PST)偏高提示症状广度大</li><li>PSDI偏高提示主观痛苦程度高</li></ul></div>`;
    return `<div class="scale-interp"><p>🔴 重度异常(GSI ${(score/90).toFixed(2)})，远超中国常模。强烈建议：</p><ul><li>尽快就医进行全面临床评估</li><li>携带本次评估结果供医生参考</li><li>如有自杀意念(Q15)请立即求助：<b>400-161-9995</b></li><li>如已在治疗中，建议与主治医生讨论治疗调整</li></ul></div>`;
  }

  return "";
}

function closeScaleAssessment() {
  const overlay = document.getElementById("scale-overlay");
  if (overlay) overlay.remove();
  currentScaleId = null;
  currentScaleAnswers = [];
  currentScaleStep = 0;
  scl90Page = 0;
  if (typeof renderScaleCards === "function") renderScaleCards();
  if (typeof renderScaleTrendChart === "function") renderScaleTrendChart();
}

// ==================== 危机干预 ====================

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
            💡 你可以在设置中添加紧急联系人。
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

// ==================== 量表历史 ====================

async function showScaleHistory(scaleId) {
  const scale = SCALES[scaleId];
  const history = await getScaleHistory(scaleId, 365);

  const dialog = document.getElementById("scale-dialog");
  if (!dialog) return;

  // SCL-90 history uses GSI for scoring label
  const getScoreDisplay = (h) => {
    if (scale.scoringLogic === "scl90") {
      const gsi = Math.round((h.total_score / 90) * 100) / 100;
      return { score: `${h.total_score}分`, gsi: gsi };
    }
    return { score: `${h.total_score} 分` };
  };

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

            const sd = getScoreDisplay(h);

            return `
            <div class="scale-history-item" style="border-left: 3px solid ${sev.color};">
              <div class="scale-history-top">
                <span class="scale-history-date">${h.date}</span>
                <span class="scale-history-score" style="color:${sev.color};">${sd.score} · ${sev.label}${sd.gsi ? ' (GSI ' + sd.gsi + ')' : ''}</span>
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

  // 分必做和选做
  const requiredScales = [];
  const optionalScales = [];

  Object.entries(SCALES).forEach(([id, scale]) => {
    const desc = scale.scoringLogic === "scl90" ? "90题 · 10-15分钟 · 全面症状评估" :
                 id === "phq9" ? "9题 · 2分钟 · 筛查抑郁严重度" :
                 id === "gad7" ? "7题 · 1分钟 · 筛查焦虑严重度" :
                 id === "cssrs" ? "6题 · 2分钟 · 评估自杀风险 (哥伦比亚量表)" :
                 id === "dshi" ? "9题 · 3分钟 · 自伤行为筛查" : "";
    const cls = (id === "cssrs" || id === "dshi") ? "scale-card-deep" : "";
    const item = { id, scale, desc, cls };
    if (scale.required !== false) requiredScales.push(item);
    else optionalScales.push(item);
  });

  async function renderCard(s) {
    const latest = await getLatestScaleResult(s.id);
    let statusHtml = "";
    if (latest) {
      const sev = getSeverity(s.id, latest.total_score, latest.answers);
      const scoreText = s.scale.scoringLogic === "scl90"
        ? `${latest.total_score}分 · GSI ${Math.round((latest.total_score/90)*100)/100}`
        : `${latest.total_score}分`;
      statusHtml = `
        <div class="scale-card-status">
          <span class="scale-card-date">最近: ${latest.date.slice(5)}</span>
          <span class="scale-card-severity" style="color:${sev.color};">${sev.emoji} ${scoreText} · ${sev.label}</span>
        </div>`;
    } else {
      statusHtml = `<div class="scale-card-status"><span class="scale-card-date" style="color:var(--text-light);">尚未评估</span></div>`;
    }
    return `
      <div class="scale-card ${s.cls}">
        <div class="scale-card-top">
          <span class="scale-card-icon">${s.scale.icon}</span>
          <div class="scale-card-info">
            <div class="scale-card-name">${s.scale.shortName}${s.scale.required === false ? ' <span style="font-size:0.65rem;color:var(--text-light);">选做</span>' : ''}</div>
            <div class="scale-card-desc">${s.desc}</div>
          </div>
        </div>
        ${statusHtml}
        <button class="btn-scale-start" onclick="openScaleAssessment('${s.id}')">
          ${latest ? '🔄 重新评估' : '📝 开始评估'}
        </button>
      </div>`;
  }

  // 必做量表
  const requiredHtml = (await Promise.all(requiredScales.map(renderCard))).join("");

  // 选做量表
  let optionalHtml = "";
  if (optionalScales.length > 0) {
    const cards = (await Promise.all(optionalScales.map(renderCard))).join("");
    optionalHtml = `
      <div class="scale-optional-divider">
        <span>📋 其他量表（选做，不影响报告）</span>
      </div>
      ${cards}`;
  }

  container.innerHTML = requiredHtml + optionalHtml;
}

// ==================== 量表趋势图 ====================

let scaleTrendChartInstance = null;

async function renderScaleTrendChart() {
  const canvas = document.getElementById("scale-trend-chart");
  if (!canvas) return;

  const select = document.getElementById("scale-trend-select");
  const scaleId = select?.value || "phq9";
  const scale = SCALES[scaleId];
  if (!scale) return;

  const history = await getScaleHistory(scaleId, 90);
  // 按日期升序排列
  history.reverse();

  if (scaleTrendChartInstance) {
    scaleTrendChartInstance.destroy();
    scaleTrendChartInstance = null;
  }

  const ctx = canvas.getContext("2d");

  if (history.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "14px 'PingFang SC', 'Microsoft YaHei', sans-serif";
    ctx.fillStyle = "#999";
    ctx.textAlign = "center";
    ctx.fillText("暂无数据 — 请至少完成一次评估", canvas.width / 2, canvas.height / 2);
    return;
  }

  const labels = history.map(h => {
    const d = h.date.split("-");
    return d[1] + "/" + d[2];
  });

  // For SCL-90, show GSI instead of total score for better readability
  const scores = history.map(h => {
    if (scale.scoringLogic === "scl90") {
      return Math.round((h.total_score / 90) * 100) / 100;
    }
    return h.total_score;
  });

  const pointColors = history.map(h => {
    const sev = getSeverity(scaleId, h.total_score, h.answers);
    return sev?.color || "#636e72";
  });

  scaleTrendChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: scale.scoringLogic === "scl90" ? "GSI (总均分)" : "总分",
        data: scores,
        borderColor: "#5B8C5A",
        backgroundColor: "rgba(91,140,90,0.08)",
        borderWidth: 2.5,
        tension: 0.35,
        pointRadius: 5,
        pointBackgroundColor: pointColors,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointHoverRadius: 7,
        fill: true,
        spanGaps: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index"
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(ctx) {
              const h = history[ctx.dataIndex];
              if (!h) return "";
              const sev = getSeverity(scaleId, h.total_score, h.answers);
              if (scale.scoringLogic === "scl90") {
                const gsi = Math.round((h.total_score / 90) * 100) / 100;
                return `GSI ${gsi} · ${sev?.label || ""} (总分${h.total_score})`;
              }
              return `${h.total_score} 分 · ${sev?.label || ""}`;
            }
          }
        }
      },
      scales: {
        y: {
          grid: { color: "#f0f0f0" },
          ticks: { font: { size: 10 } },
          title: {
            display: true,
            text: scale.scoringLogic === "scl90" ? "GSI (总均分)" : "量表总分",
            font: { size: 10 }
          }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 9 }, maxRotation: 45 }
        }
      }
    }
  });
}

// ==================== 报告数据收集 ====================

async function collectScaleDataForReport(days) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split("T")[0];

  // 只收集必做量表 (required !== false)
  const scaleIds = Object.keys(SCALES).filter(id => SCALES[id].required !== false);
  const result = {};

  for (const scaleId of scaleIds) {
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
      max-width: 520px; width: 92vw; max-height: 92vh; overflow-y: auto;
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
    .scale-optional-tag {
      display: inline-block; background: #e8f4fd; color: #2980b9;
      font-size: 0.75rem; padding: 4px 10px; border-radius: 12px; margin-top: 6px;
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

    /* SCL-90 分页样式 */
    .scl90-body { max-height: 55vh; overflow-y: auto; }
    .scl90-question-row {
      padding: 10px 8px; border-radius: 8px; margin-bottom: 6px;
      background: #fafafa; transition: background 0.2s;
    }
    .scl90-question-row.scl90-moderate { background: #FFF8E1; }
    .scl90-question-row.scl90-severe { background: #FFEBEE; }
    .scl90-q-num { font-size: 0.75rem; color: var(--text-light); margin-bottom: 2px; }
    .scl90-q-text { font-size: 0.85rem; color: var(--text); line-height: 1.4; margin-bottom: 6px; }
    .scl90-q-opts { display: flex; gap: 4px; flex-wrap: wrap; }
    .scl90-opt-btn {
      padding: 5px 10px; border-radius: 14px; border: 1px solid #ddd;
      background: #fff; font-size: 0.7rem; cursor: pointer; white-space: nowrap;
      transition: all 0.15s;
    }
    .scl90-opt-btn.selected {
      background: var(--primary); color: #fff; border-color: var(--primary);
      font-weight: 600;
    }
    .scl90-footer { padding-top: 10px; border-top: 1px solid #eee; }
    .scl90-page-nav { display: flex; align-items: center; justify-content: space-between; width: 100%; }
    .scl90-page-dots { display: flex; gap: 4px; flex-wrap: wrap; justify-content: center; }
    .scl90-dot {
      width: 8px; height: 8px; border-radius: 50%; background: #ddd;
      cursor: pointer; transition: all 0.2s;
    }
    .scl90-dot.active { background: var(--primary); transform: scale(1.5); }
    .scl90-dot.filled { background: #a0c4a0; }

    /* SCL-90 结果统计 */
    .scl90-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 12px 0; }
    .scl90-stat-item { text-align: center; background: #f8f9fa; padding: 10px 6px; border-radius: 8px; }
    .scl90-stat-val { font-size: 1.3rem; font-weight: 700; color: var(--text); }
    .scl90-stat-lbl { font-size: 0.7rem; color: var(--text-light); margin-top: 2px; }

    /* SCL-90 因子表格 */
    .scl90-factor-table {
      background: #fff; border-radius: 8px; overflow: hidden;
      border: 1px solid #e9ecef;
    }
    .scl90-factor-header {
      display: grid; grid-template-columns: 2fr 1fr 0.8fr 1.2fr;
      padding: 8px 10px; background: #f8f9fa; font-size: 0.72rem;
      font-weight: 600; color: var(--text-light);
    }
    .scl90-factor-row {
      display: grid; grid-template-columns: 2fr 1fr 0.8fr 1.2fr;
      padding: 7px 10px; font-size: 0.78rem; align-items: center;
      border-bottom: 1px solid #f0f0f0;
    }
    .scl90-factor-row:last-child { border-bottom: none; }
    .scl90-factor-name { color: var(--text); font-weight: 500; }
    .scl90-factor-avg { font-weight: 600; }
    .scl90-factor-pos { color: var(--text-light); text-align: center; }
    .scl90-factor-level { font-size: 0.7rem; font-weight: 500; }

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
    .scale-history-top { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .scale-history-date { font-size: 0.85rem; font-weight: 600; color: var(--text); }
    .scale-history-score { font-size: 0.85rem; font-weight: 600; }
    .scale-empty {
      text-align: center; color: var(--text-light); padding: 24px;
      font-size: 0.9rem;
    }

    /* 卡片区 */
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

    /* 选做量表分隔线 */
    .scale-optional-divider {
      grid-column: 1 / -1;
      display: flex; align-items: center; gap: 8px;
      margin: 10px 0 6px; font-size: 0.75rem; color: var(--text-light);
    }
    .scale-optional-divider::before, .scale-optional-divider::after {
      content: ""; flex: 1; height: 1px; background: #e0e0e0;
    }

    /* 趋势图 */
    #scale-trend-section .chart-container { height: 220px; margin-top: 8px; }
    #scale-trend-select {
      width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px;
      font-size: 0.85rem; background: #fff; margin-bottom: 8px;
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

injectScaleStyles();
