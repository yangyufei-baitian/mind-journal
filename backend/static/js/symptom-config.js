/* ============================================
   symptom-config.js — 症状权重配置表 v2.0
   独立文件，方便查阅和修改权重
   每个症状: {id, label, emoji, category, base_weight, needs_frequency, levels[]}

   理论基础:
     base_weight → CGI-S 临床总体印象严重度量表 (Busner & Targum 2007)
       CGI-S 1: 正常 → bw 0 (无对应症状条目)
       CGI-S 2-3: 边缘/轻度 → bw 1
       CGI-S 4: 中度, 临床试验入组阈值 → bw 2-3
       CGI-S 5: 显著, 明显功能损害 → bw 4-5
       CGI-S 6-7: 严重/极重 → bw 8-10
     severity coef → 等百分位链接 (Leucht 2019, Egger 2019: 3067例)
       mild:    0.4 — 近似 CGI-S 2-3, 有症状但功能影响小
       moderate: 1.0 — 近似 CGI-S 4, 临床显著性基准
       severe:   2.5 — 近似 CGI-S 5-6, 功能损害非线加速
     (Leucht 2019: PANSS每降1分CGI-S ≈ 20%总分下降, 证实CGI-S非线性特征)

   权重分级:
     🔴 危机级: base_weight >= 8   (需立即干预 → CGI-S 6-7)
     🟠 严重级: base_weight 4-7    (严重影响功能 → CGI-S 5)
     🟡 中度级: base_weight 2-3    (明显影响生活 → CGI-S 4)
     🟢 轻微级: base_weight 1      (不适但不影响核心功能 → CGI-S 2-3)

   症状分 = base_weight × severity_coef
   ============================================ */

const SYMPTOM_CONFIG = [
    // ==================== 🔴 危机级 (8-10) ====================
    {
        id: "suicide_attempt", label: "尝试自杀", emoji: "🔴",
        category: "抑郁", base_weight: 10, needs_frequency: true,
        levels: [
            { id: "mild", label: "有过念头但无计划", coef: 0.4 },
            { id: "moderate", label: "有具体计划", coef: 1.0 },
            { id: "severe", label: "已实施/正在实施", coef: 2.5 }
        ]
    },
    {
        id: "suicidal_ideation", label: "自杀想法", emoji: "🔴",
        category: "抑郁", base_weight: 8, needs_frequency: true,
        levels: [
            { id: "mild", label: "偶尔闪过", coef: 0.4 },
            { id: "moderate", label: "频繁出现", coef: 1.0 },
            { id: "severe", label: "持续/有明确意图", coef: 2.5 }
        ]
    },
    {
        id: "self_harm", label: "自伤行为", emoji: "🔴",
        category: "通用", base_weight: 8, needs_frequency: true,
        levels: [
            { id: "mild", label: "轻微(无伤口/淤青)", coef: 0.4 },
            { id: "moderate", label: "有伤口需要处理", coef: 1.0 },
            { id: "severe", label: "严重/需就医", coef: 2.5 }
        ]
    },

    // ==================== 🟠 严重级 (4-7) ====================
    {
        id: "self_harm_ideation", label: "自伤想法", emoji: "🔴",
        category: "通用", base_weight: 5, needs_frequency: true,
        levels: [
            { id: "mild", label: "偶尔念头", coef: 0.4 },
            { id: "moderate", label: "频繁念头", coef: 1.0 },
            { id: "severe", label: "持续/有具体计划", coef: 2.5 }
        ]
    },
    {
        id: "aggression", label: "攻击欲望", emoji: "🟠",
        category: "通用", base_weight: 5, needs_frequency: false,
        levels: [
            { id: "mild", label: "易怒烦躁", coef: 0.4 },
            { id: "moderate", label: "想破坏物品", coef: 1.0 },
            { id: "severe", label: "想伤害他人", coef: 2.5 }
        ]
    },
    {
        id: "mania", label: "躁狂发作", emoji: "🟠",
        category: "双相", base_weight: 5, needs_frequency: false,
        levels: [
            { id: "mild", label: "精力过剩/话多/睡眠减少", coef: 0.4 },
            { id: "moderate", label: "冲动消费/冒险行为/易激惹", coef: 1.0 },
            { id: "severe", label: "妄想/危险行为/完全失控", coef: 2.5 }
        ]
    },
    {
        id: "panic_attack", label: "惊恐发作", emoji: "🟠",
        category: "焦虑", base_weight: 5, needs_frequency: true,
        levels: [
            { id: "mild", label: "短暂胸闷/心慌(<10分钟)", coef: 0.4 },
            { id: "moderate", label: "明显濒死感/呼吸困难", coef: 1.0 },
            { id: "severe", label: "持续>30分钟/无法自控", coef: 2.5 }
        ]
    },
    {
        id: "hallucination", label: "幻觉", emoji: "🟠",
        category: "精神分裂", base_weight: 5, needs_frequency: true,
        levels: [
            { id: "mild", label: "偶尔听到/看到(能分辨真假)", coef: 0.4 },
            { id: "moderate", label: "频繁/内容困扰", coef: 1.0 },
            { id: "severe", label: "命令性幻听/完全当真", coef: 2.5 }
        ]
    },
    {
        id: "delusion", label: "妄想", emoji: "🟠",
        category: "精神分裂", base_weight: 5, needs_frequency: false,
        levels: [
            { id: "mild", label: "可疑/多疑但不坚信", coef: 0.4 },
            { id: "moderate", label: "坚信但行为不受控", coef: 1.0 },
            { id: "severe", label: "坚信且影响行为决策", coef: 2.5 }
        ]
    },
    {
        id: "hostility", label: "对他人敌意", emoji: "🟠",
        category: "通用", base_weight: 4, needs_frequency: false,
        levels: [
            { id: "mild", label: "不信任/猜疑", coef: 0.4 },
            { id: "moderate", label: "明显敌意/争吵", coef: 1.0 },
            { id: "severe", label: "妄想/威胁行为", coef: 2.5 }
        ]
    },
    {
        id: "dissociation", label: "解离症状", emoji: "🟠",
        category: "解离/多重人格", base_weight: 5, needs_frequency: true,
        levels: [
            { id: "mild", label: "短暂恍惚/不真实感", coef: 0.4 },
            { id: "moderate", label: "身份混淆/记忆断片", coef: 1.0 },
            { id: "severe", label: "完全切换/遗忘重要事件", coef: 2.5 }
        ]
    },

    // ==================== 🟡 中度级 (2-3) ====================
    {
        id: "anhedonia", label: "快感缺失", emoji: "🟡",
        category: "抑郁", base_weight: 3, needs_frequency: false,
        levels: [
            { id: "mild", label: "偶尔觉得没意思", coef: 0.4 },
            { id: "moderate", label: "大部分活动失去兴趣", coef: 1.0 },
            { id: "severe", label: "对任何事都无感/麻木", coef: 2.5 }
        ]
    },
    {
        id: "worthlessness", label: "无价值感/自责", emoji: "🟡",
        category: "抑郁", base_weight: 3, needs_frequency: false,
        levels: [
            { id: "mild", label: "偶尔自我怀疑", coef: 0.4 },
            { id: "moderate", label: "经常觉得自己没用", coef: 1.0 },
            { id: "severe", label: "坚信自己是负担/罪人", coef: 2.5 }
        ]
    },
    {
        id: "psychomotor", label: "精神运动迟缓/激越", emoji: "🟡",
        category: "抑郁", base_weight: 2, needs_frequency: false,
        levels: [
            { id: "mild", label: "动作略慢或坐立不安", coef: 0.4 },
            { id: "moderate", label: "明显迟缓或反复踱步", coef: 1.0 },
            { id: "severe", label: "几乎不动或无法静坐", coef: 2.5 }
        ]
    },
    {
        id: "racing_thoughts", label: "思维奔逸", emoji: "🟡",
        category: "双相", base_weight: 2, needs_frequency: false,
        levels: [
            { id: "mild", label: "想法多了但能控制", coef: 0.4 },
            { id: "moderate", label: "思维跳跃/语速快/被打断", coef: 1.0 },
            { id: "severe", label: "完全跟不上/言语紊乱", coef: 2.5 }
        ]
    },
    {
        id: "grandiosity", label: "夸大妄想/过度自信", emoji: "🟡",
        category: "双相", base_weight: 2, needs_frequency: false,
        levels: [
            { id: "mild", label: "比平时自信", coef: 0.4 },
            { id: "moderate", label: "明显夸大能力/计划不现实", coef: 1.0 },
            { id: "severe", label: "坚信有特殊能力/身份", coef: 2.5 }
        ]
    },
    {
        id: "excessive_worry", label: "过度担忧", emoji: "🟡",
        category: "焦虑", base_weight: 2, needs_frequency: false,
        levels: [
            { id: "mild", label: "比平时多担心", coef: 0.4 },
            { id: "moderate", label: "无法控制的担忧/影响专注", coef: 1.0 },
            { id: "severe", label: "完全被担忧占据/无法做事", coef: 2.5 }
        ]
    },
    {
        id: "restlessness", label: "坐立不安/紧张", emoji: "🟡",
        category: "焦虑", base_weight: 2, needs_frequency: false,
        levels: [
            { id: "mild", label: "偶尔感觉紧张", coef: 0.4 },
            { id: "moderate", label: "频繁/需要走动缓解", coef: 1.0 },
            { id: "severe", label: "无法停下/极度烦躁", coef: 2.5 }
        ]
    },
    {
        id: "social_anxiety", label: "社交恐惧", emoji: "🟡",
        category: "焦虑", base_weight: 2, needs_frequency: false,
        levels: [
            { id: "mild", label: "社交前紧张但能完成", coef: 0.4 },
            { id: "moderate", label: "回避部分社交场合", coef: 1.0 },
            { id: "severe", label: "完全无法面对他人", coef: 2.5 }
        ]
    },
    {
        id: "disorganized_speech", label: "言语紊乱", emoji: "🟡",
        category: "精神分裂", base_weight: 3, needs_frequency: false,
        levels: [
            { id: "mild", label: "偶尔跑题/表达不清", coef: 0.4 },
            { id: "moderate", label: "经常离题/难以理解", coef: 1.0 },
            { id: "severe", label: "完全混乱/词杂拌", coef: 2.5 }
        ]
    },
    {
        id: "negative_symptoms", label: "阴性症状(淡漠/退缩)", emoji: "🟡",
        category: "精神分裂", base_weight: 3, needs_frequency: false,
        levels: [
            { id: "mild", label: "表情略少/社交兴趣减退", coef: 0.4 },
            { id: "moderate", label: "明显情感平淡/少语", coef: 1.0 },
            { id: "severe", label: "完全缄默/不动/不社交", coef: 2.5 }
        ]
    },
    {
        id: "depersonalization", label: "人格解体", emoji: "🟡",
        category: "解离/多重人格", base_weight: 3, needs_frequency: false,
        levels: [
            { id: "mild", label: "偶尔觉得自己不真实", coef: 0.4 },
            { id: "moderate", label: "频繁/影响生活", coef: 1.0 },
            { id: "severe", label: "持续/无法辨识自我", coef: 2.5 }
        ]
    },
    {
        id: "derealization", label: "现实解体", emoji: "🟡",
        category: "解离/多重人格", base_weight: 3, needs_frequency: false,
        levels: [
            { id: "mild", label: "偶尔觉得世界不真实", coef: 0.4 },
            { id: "moderate", label: "频繁/如隔雾看世界", coef: 1.0 },
            { id: "severe", label: "持续/完全失真感", coef: 2.5 }
        ]
    },
    {
        id: "amnesia", label: "解离性遗忘", emoji: "🟡",
        category: "解离/多重人格", base_weight: 3, needs_frequency: true,
        levels: [
            { id: "mild", label: "忘记几分钟的事", coef: 0.4 },
            { id: "moderate", label: "忘记几小时/重要对话", coef: 1.0 },
            { id: "severe", label: "大段时间空白/不记得重要事件", coef: 2.5 }
        ]
    },
    {
        id: "binge_eating", label: "暴饮暴食", emoji: "🟡",
        category: "通用", base_weight: 2, needs_frequency: false,
        levels: [
            { id: "mild", label: "偶尔超量", coef: 0.4 },
            { id: "moderate", label: "每周数次", coef: 1.0 },
            { id: "severe", label: "每天/完全失控", coef: 2.5 }
        ]
    },
    {
        id: "insomnia", label: "失眠", emoji: "🟡",
        category: "通用", base_weight: 2, needs_frequency: false,
        levels: [
            { id: "mild", label: "入睡困难(>30分钟)", coef: 0.4 },
            { id: "moderate", label: "频繁醒来/早醒", coef: 1.0 },
            { id: "severe", label: "几乎整夜不睡", coef: 2.5 }
        ]
    },
    {
        id: "hypersomnia", label: "嗜睡", emoji: "🟡",
        category: "通用", base_weight: 2, needs_frequency: false,
        levels: [
            { id: "mild", label: "比平时多睡1-2小时", coef: 0.4 },
            { id: "moderate", label: "白天也困倦", coef: 1.0 },
            { id: "severe", label: "几乎全天昏睡", coef: 2.5 }
        ]
    },
    {
        id: "concentration", label: "注意力难集中", emoji: "🟡",
        category: "通用", base_weight: 2, needs_frequency: false,
        levels: [
            { id: "mild", label: "偶尔分心", coef: 0.4 },
            { id: "moderate", label: "影响工作/学习", coef: 1.0 },
            { id: "severe", label: "无法完成简单任务", coef: 2.5 }
        ]
    },
    {
        id: "social_avoidance", label: "社交回避", emoji: "🟡",
        category: "通用", base_weight: 2, needs_frequency: false,
        levels: [
            { id: "mild", label: "不愿社交但能应付", coef: 0.4 },
            { id: "moderate", label: "回避大多数接触", coef: 1.0 },
            { id: "severe", label: "完全自我隔离", coef: 2.5 }
        ]
    },
    {
        id: "obsession", label: "强迫思维", emoji: "🟡",
        category: "焦虑", base_weight: 2, needs_frequency: false,
        levels: [
            { id: "mild", label: "偶尔重复想法", coef: 0.4 },
            { id: "moderate", label: "经常/耗时>1小时/天", coef: 1.0 },
            { id: "severe", label: "完全占据思维/无法抗拒", coef: 2.5 }
        ]
    },
    {
        id: "compulsion", label: "强迫行为", emoji: "🟡",
        category: "焦虑", base_weight: 2, needs_frequency: true,
        levels: [
            { id: "mild", label: "偶尔检查/清洗", coef: 0.4 },
            { id: "moderate", label: "频繁/耗时>1小时/天", coef: 1.0 },
            { id: "severe", label: "无法停止/严重妨碍生活", coef: 2.5 }
        ]
    },

    // ==================== 🟢 轻微级 (1) ====================
    {
        id: "tremor", label: "手抖", emoji: "🟢",
        category: "通用", base_weight: 1, needs_frequency: true,
        levels: [
            { id: "mild", label: "轻微，不影响动作", coef: 0.4 },
            { id: "moderate", label: "明显，影响写字", coef: 1.0 },
            { id: "severe", label: "严重，无法控制", coef: 2.5 }
        ]
    },
    {
        id: "dizziness", label: "头晕", emoji: "🟢",
        category: "通用", base_weight: 1, needs_frequency: true,
        levels: [
            { id: "mild", label: "偶尔/变换姿势时", coef: 0.4 },
            { id: "moderate", label: "频繁发作", coef: 1.0 },
            { id: "severe", label: "持续/影响行走", coef: 2.5 }
        ]
    },
    {
        id: "appetite_loss", label: "食欲差", emoji: "🟢",
        category: "通用", base_weight: 1, needs_frequency: false,
        levels: [
            { id: "mild", label: "食量略减", coef: 0.4 },
            { id: "moderate", label: "明显减少", coef: 1.0 },
            { id: "severe", label: "几乎不进食", coef: 2.5 }
        ]
    },
    {
        id: "weight_change", label: "体重显著变化", emoji: "🟢",
        category: "抑郁", base_weight: 1, needs_frequency: false,
        levels: [
            { id: "mild", label: "月变化<5%", coef: 0.4 },
            { id: "moderate", label: "月变化5-10%", coef: 1.0 },
            { id: "severe", label: "月变化>10%", coef: 2.5 }
        ]
    },
    {
        id: "muscle_tension", label: "肌肉紧张/酸痛", emoji: "🟢",
        category: "焦虑", base_weight: 1, needs_frequency: false,
        levels: [
            { id: "mild", label: "偶尔不适", coef: 0.4 },
            { id: "moderate", label: "持续紧张/影响活动", coef: 1.0 },
            { id: "severe", label: "剧痛/活动受限", coef: 2.5 }
        ]
    },
    {
        id: "hyperventilation", label: "过度换气", emoji: "🟢",
        category: "焦虑", base_weight: 1, needs_frequency: true,
        levels: [
            { id: "mild", label: "偶尔气短", coef: 0.4 },
            { id: "moderate", label: "频繁/手指发麻", coef: 1.0 },
            { id: "severe", label: "持续/手足抽搐", coef: 2.5 }
        ]
    },
    {
        id: "catatonia", label: "紧张症/木僵", emoji: "🟢",
        category: "精神分裂", base_weight: 1, needs_frequency: false,
        levels: [
            { id: "mild", label: "偶尔发呆/动作减少", coef: 0.4 },
            { id: "moderate", label: "长时间保持怪异姿势", coef: 1.0 },
            { id: "severe", label: "完全不动/缄默/违拗", coef: 2.5 }
        ]
    },
    {
        id: "identity_confusion", label: "身份混乱", emoji: "🟢",
        category: "解离/多重人格", base_weight: 1, needs_frequency: false,
        levels: [
            { id: "mild", label: "偶尔不确定自己是谁", coef: 0.4 },
            { id: "moderate", label: "感觉自己像不同的人", coef: 1.0 },
            { id: "severe", label: "明确的身份切换体验", coef: 2.5 }
        ]
    },
    {
        id: "nightmare", label: "噩梦/夜惊", emoji: "🟢",
        category: "通用", base_weight: 1, needs_frequency: true,
        levels: [
            { id: "mild", label: "偶尔(<1次/周)", coef: 0.4 },
            { id: "moderate", label: "经常(2-4次/周)", coef: 1.0 },
            { id: "severe", label: "几乎每晚/惊醒", coef: 2.5 }
        ]
    }
];

// 构建查找表
const SYMPTOM_MAP = {};
SYMPTOM_CONFIG.forEach(s => { SYMPTOM_MAP[s.id] = s; });

// 提取所有疾病分类
const SYMPTOM_CATEGORIES = [...new Set(SYMPTOM_CONFIG.map(s => s.category))];
