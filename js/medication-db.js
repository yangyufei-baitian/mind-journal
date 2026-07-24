/* ============================================
   medication-db.js — 常用精神科药物数据库 (50种)
   分类: SSRI/SNRI/非典型抗抑郁/TCA/抗精神病/心境稳定剂/苯二氮䓬/非苯二氮䓬/镇静催眠/ADHD
   每条包含: 通用名, 商品名, 禁忌, 常用剂量
   ============================================ */

const MEDICATION_DB = [
  // ==================== SSRI 抗抑郁药 (6) ====================
  {
    id: "fluoxetine",
    name: "氟西汀",
    name_en: "Fluoxetine",
    brands: ["百忧解", "优克", "奥麦伦", "开克"],
    category: "SSRI 抗抑郁药",
    category_group: "antidepressant_ssri",
    contraindications: [
      { text: "禁止与 MAOI 类药物合用，需间隔至少 14 天（司来吉兰除外）", severity: "danger" },
      { text: "禁止与酒精同服，增加肝损伤和中枢抑制风险", severity: "danger" },
      { text: "有癫痫史者慎用，可能降低癫痫发作阈值", severity: "warning" },
      { text: "与华法林等抗凝药合用可能增加出血风险", severity: "warning" },
      { text: "服药初期可能增加自杀风险，需密切观察", severity: "warning" }
    ],
    common_dosages: ["20mg", "40mg", "60mg"],
    description: "SSRI 类抗抑郁药，半衰期最长（4-6天），漏服影响小，适合药物依从性差的患者。用于抑郁、强迫症、贪食症。",
    half_life: "4-6天"
  },
  {
    id: "sertraline",
    name: "舍曲林",
    name_en: "Sertraline",
    brands: ["左洛复", "乐元", "曲优"],
    category: "SSRI 抗抑郁药",
    category_group: "antidepressant_ssri",
    contraindications: [
      { text: "禁止与 MAOI 类药物合用", severity: "danger" },
      { text: "禁止与匹莫齐特合用", severity: "danger" },
      { text: "禁止与酒精同服", severity: "danger" },
      { text: "与抗凝药/抗血小板药合用增加出血风险", severity: "warning" },
      { text: "低钠血症风险，老年患者需监测血钠", severity: "warning" }
    ],
    common_dosages: ["50mg", "100mg", "150mg", "200mg"],
    description: "安全性最好的 SSRI 之一，青少年强迫症一线用药，也是产后抑郁首选。对体重影响较小。",
    half_life: "24-26小时"
  },
  {
    id: "paroxetine",
    name: "帕罗西汀",
    name_en: "Paroxetine",
    brands: ["赛乐特", "乐友", "舒坦罗"],
    category: "SSRI 抗抑郁药",
    category_group: "antidepressant_ssri",
    contraindications: [
      { text: "禁止与 MAOI 类药物合用", severity: "danger" },
      { text: "禁止与硫利达嗪合用，可致严重心律失常", severity: "danger" },
      { text: "禁止与酒精同服", severity: "danger" },
      { text: "孕妇禁用（增加胎儿心脏缺陷风险）", severity: "danger" },
      { text: "撤药反应最严重的 SSRI，绝对不可突然停药", severity: "danger" },
      { text: "与抗凝药合用增加出血风险", severity: "warning" }
    ],
    common_dosages: ["20mg", "30mg", "40mg", "50mg"],
    description: "抗焦虑作用最强的 SSRI，对惊恐障碍、社交焦虑效果好。但撤药反应最重，必须缓慢减量。",
    half_life: "21小时"
  },
  {
    id: "escitalopram",
    name: "艾司西酞普兰",
    name_en: "Escitalopram",
    brands: ["来士普", "心达舒", "乐孚亭"],
    category: "SSRI 抗抑郁药",
    category_group: "antidepressant_ssri",
    contraindications: [
      { text: "禁止与 MAOI 类药物合用", severity: "danger" },
      { text: "禁止与酒精同服", severity: "danger" },
      { text: "QT 间期延长者慎用，大剂量增加心律失常风险", severity: "warning" },
      { text: "与抗凝药合用增加出血风险", severity: "warning" },
      { text: "低钠血症风险，老年患者需监测", severity: "warning" }
    ],
    common_dosages: ["5mg", "10mg", "20mg"],
    description: "副作用最少、耐受性最佳的 SSRI，适合老年患者和药物敏感人群。起效较快，药物相互作用少。",
    half_life: "27-32小时"
  },
  {
    id: "citalopram",
    name: "西酞普兰",
    name_en: "Citalopram",
    brands: ["喜普妙", "圣约翰草"],
    category: "SSRI 抗抑郁药",
    category_group: "antidepressant_ssri",
    contraindications: [
      { text: "禁止与 MAOI 类药物合用", severity: "danger" },
      { text: "禁止与酒精同服", severity: "danger" },
      { text: "QT 间期延长风险！剂量超过 40mg/日显著增加心律失常风险", severity: "danger" },
      { text: "与延长 QT 间期的药物禁止合用", severity: "danger" },
      { text: "低钠血症风险，老年患者需监测血钠", severity: "warning" }
    ],
    common_dosages: ["10mg", "20mg", "40mg"],
    description: "价格较低、性价比好。但大剂量（>40mg）有 QT 延长风险，老年患者需谨慎。",
    half_life: "35小时"
  },
  {
    id: "fluvoxamine",
    name: "氟伏沙明",
    name_en: "Fluvoxamine",
    brands: ["兰释", "氟伏沙明片"],
    category: "SSRI 抗抑郁药",
    category_group: "antidepressant_ssri",
    contraindications: [
      { text: "禁止与 MAOI 类药物合用", severity: "danger" },
      { text: "禁止与酒精同服", severity: "danger" },
      { text: "药物相互作用多（强 CYP1A2 抑制剂），与茶碱、咖啡因、氯氮平、奥氮平等需谨慎联用", severity: "warning" },
      { text: "与抗凝药合用增加出血风险", severity: "warning" }
    ],
    common_dosages: ["50mg", "100mg", "150mg", "300mg"],
    description: "镇静作用较强的 SSRI，对强迫思维和强迫行为效果好。但药物相互作用较多（强 CYP1A2 抑制剂）。",
    half_life: "15-20小时"
  },

  // ==================== SNRI 抗抑郁药 (3) ====================
  {
    id: "venlafaxine",
    name: "文拉法辛",
    name_en: "Venlafaxine",
    brands: ["怡诺思", "博乐欣", "文拉法辛缓释胶囊"],
    category: "SNRI 抗抑郁药",
    category_group: "antidepressant_snri",
    contraindications: [
      { text: "禁止与 MAOI 类药物合用", severity: "danger" },
      { text: "禁止与酒精同服", severity: "danger" },
      { text: "高血压患者慎用！可致血压显著升高（>150mg/日时风险明显）", severity: "danger" },
      { text: "撤药反应非常严重，绝对不可突然停药！", severity: "danger" },
      { text: "闭角型青光眼患者禁用", severity: "warning" },
      { text: "与抗凝药合用增加出血风险", severity: "warning" }
    ],
    common_dosages: ["37.5mg", "75mg", "150mg", "225mg"],
    description: "中重度抑郁一线选择，双通道作用（5-HT+NE），对躯体疼痛有效。需监测血压，撤药反应重。",
    half_life: "5小时（母药）/ 11小时（活性代谢物）"
  },
  {
    id: "duloxetine",
    name: "度洛西汀",
    name_en: "Duloxetine",
    brands: ["欣百达", "奥思平"],
    category: "SNRI 抗抑郁药",
    category_group: "antidepressant_snri",
    contraindications: [
      { text: "禁止与 MAOI 类药物合用", severity: "danger" },
      { text: "禁止与酒精同服！肝损伤风险显著增加", severity: "danger" },
      { text: "肝功能不全者禁用/慎用，有肝衰竭风险", severity: "danger" },
      { text: "闭角型青光眼患者禁用", severity: "warning" },
      { text: "与抗凝药合用增加出血风险", severity: "warning" }
    ],
    common_dosages: ["30mg", "60mg", "90mg", "120mg"],
    description: "对躯体疼痛（纤维肌痛、糖尿病神经病变疼痛）效果突出，抑郁伴躯体症状首选之一。需注意肝损风险。",
    half_life: "12小时"
  },
  {
    id: "desvenlafaxine",
    name: "去甲文拉法辛",
    name_en: "Desvenlafaxine",
    brands: ["怡诺思XR", "文拉法辛缓释片"],
    category: "SNRI 抗抑郁药",
    category_group: "antidepressant_snri",
    contraindications: [
      { text: "禁止与 MAOI 类药物合用", severity: "danger" },
      { text: "禁止与酒精同服", severity: "danger" },
      { text: "高血压患者需监测血压", severity: "warning" },
      { text: "撤药反应较文拉法辛轻但仍有，不能突然停药", severity: "warning" }
    ],
    common_dosages: ["50mg", "100mg"],
    description: "文拉法辛的活性代谢物，副作用较文拉法辛轻，对血压影响更小。国内尚未广泛使用。",
    half_life: "11小时"
  },

  // ==================== 非典型抗抑郁药 (5) ====================
  {
    id: "mirtazapine",
    name: "米氮平",
    name_en: "Mirtazapine",
    brands: ["瑞美隆", "米尔宁"],
    category: "非典型抗抑郁药 (NaSSA)",
    category_group: "antidepressant_atypical",
    contraindications: [
      { text: "禁止与 MAOI 类药物合用", severity: "danger" },
      { text: "禁止与酒精同服，加重镇静和呼吸抑制", severity: "danger" },
      { text: "体重增加明显，糖尿病/肥胖患者慎用", severity: "warning" },
      { text: "可能引起嗜睡，服药后不宜驾驶", severity: "warning" },
      { text: "罕见但需警惕：粒细胞缺乏症", severity: "warning" }
    ],
    common_dosages: ["15mg", "30mg", "45mg"],
    description: "助眠+增食欲效果强，适合失眠消瘦的抑郁患者。性副作用极少。主要副作用：嗜睡、体重增加。",
    half_life: "20-40小时"
  },
  {
    id: "bupropion",
    name: "安非他酮",
    name_en: "Bupropion",
    brands: ["悦刻", "布普品"],
    category: "非典型抗抑郁药 (NDRI)",
    category_group: "antidepressant_atypical",
    contraindications: [
      { text: "癫痫患者绝对禁用！显著降低癫痫发作阈值", severity: "danger" },
      { text: "禁止与 MAOI 类药物合用", severity: "danger" },
      { text: "进食障碍（厌食症/贪食症）患者禁用，癫痫风险增加", severity: "danger" },
      { text: "禁止与酒精同服，增加癫痫风险", severity: "danger" },
      { text: "可能加重焦虑和失眠", severity: "warning" }
    ],
    common_dosages: ["150mg", "300mg"],
    description: "唯一不伤性功能、不增重的抗抑郁药，也是戒烟辅助药物。但禁用于癫痫和进食障碍患者。",
    half_life: "21小时"
  },
  {
    id: "trazodone",
    name: "曲唑酮",
    name_en: "Trazodone",
    brands: ["美舒郁", "安适", "曲唑酮片"],
    category: "非典型抗抑郁药 (SARI)",
    category_group: "antidepressant_atypical",
    contraindications: [
      { text: "禁止与 MAOI 类药物合用", severity: "danger" },
      { text: "禁止与酒精同服，严重加重镇静", severity: "danger" },
      { text: "男性罕见副作用：阴茎异常勃起（需急诊处理）", severity: "danger" },
      { text: "服药后明显嗜睡，禁止驾驶", severity: "warning" },
      { text: "与降压药合用可能导致低血压", severity: "warning" }
    ],
    common_dosages: ["25mg", "50mg", "100mg", "150mg"],
    description: "低剂量常用于失眠辅助治疗（25-50mg），不依赖不成瘾。高剂量作抗抑郁。性副作用极低。",
    half_life: "6-11小时"
  },
  {
    id: "vortioxetine",
    name: "伏硫西汀",
    name_en: "Vortioxetine",
    brands: ["敏特思", "心达悦"],
    category: "非典型抗抑郁药 (SMS)",
    category_group: "antidepressant_atypical",
    contraindications: [
      { text: "禁止与 MAOI 类药物合用", severity: "danger" },
      { text: "禁止与酒精同服", severity: "danger" },
      { text: "与抗凝药合用增加出血风险", severity: "warning" },
      { text: "可能引起恶心（常见，通常2周内缓解）", severity: "warning" }
    ],
    common_dosages: ["5mg", "10mg", "20mg"],
    description: "新型多模式抗抑郁药，显著改善认知功能（注意力、记忆力、执行功能）。不增重、不影响性功能。价格较高。",
    half_life: "66小时"
  },
  {
    id: "agomelatine",
    name: "阿戈美拉汀",
    name_en: "Agomelatine",
    brands: ["维度新", "阿美宁"],
    category: "非典型抗抑郁药（褪黑素受体激动剂）",
    category_group: "antidepressant_atypical",
    contraindications: [
      { text: "肝功能不全者禁用", severity: "danger" },
      { text: "必须定期监测肝功能（基线+第3/6/12/24周）", severity: "danger" },
      { text: "禁止与强 CYP1A2 抑制剂（氟伏沙明、环丙沙星）合用", severity: "danger" },
      { text: "禁止与酒精同服，加重肝损伤", severity: "danger" },
      { text: "65岁以上老年患者有效性证据不足", severity: "warning" }
    ],
    common_dosages: ["25mg", "50mg"],
    description: "调节生物钟节律，改善睡眠-觉醒周期。不影响体重和性功能。必须定期监测肝功能。",
    half_life: "1-2小时"
  },

  // ==================== 三环类抗抑郁药 TCA (3) ====================
  {
    id: "amitriptyline",
    name: "阿米替林",
    name_en: "Amitriptyline",
    brands: ["阿米替林片", "依拉维"],
    category: "三环类抗抑郁药 (TCA)",
    category_group: "antidepressant_tca",
    contraindications: [
      { text: "禁止与 MAOI 类药物合用", severity: "danger" },
      { text: "禁止与酒精同服，严重加重中枢抑制甚至致死", severity: "danger" },
      { text: "心脏病患者禁用！可致心律失常、QT延长", severity: "danger" },
      { text: "闭角型青光眼患者禁用", severity: "danger" },
      { text: "前列腺增生患者禁用（尿潴留风险）", severity: "danger" },
      { text: "过量致死风险极高（窄治疗指数药物）", severity: "danger" }
    ],
    common_dosages: ["10mg", "25mg", "50mg", "75mg", "100mg", "150mg"],
    description: "经典三环类抗抑郁药，效果确切但副作用多。低剂量也用于慢性疼痛和失眠。有自杀风险的患者开药量应限制。",
    half_life: "10-28小时"
  },
  {
    id: "clomipramine",
    name: "氯米帕明",
    name_en: "Clomipramine",
    brands: ["安拿芬尼", "氯丙米嗪"],
    category: "三环类抗抑郁药 (TCA)",
    category_group: "antidepressant_tca",
    contraindications: [
      { text: "禁止与 MAOI 类药物合用", severity: "danger" },
      { text: "禁止与酒精同服", severity: "danger" },
      { text: "心脏病患者禁用", severity: "danger" },
      { text: "癫痫患者慎用（降低癫痫阈值）", severity: "warning" },
      { text: "闭角型青光眼、前列腺增生禁用", severity: "danger" },
      { text: "自杀风险患者限制处方量", severity: "danger" }
    ],
    common_dosages: ["25mg", "50mg", "75mg", "100mg", "150mg", "250mg"],
    description: "强迫症治疗效果最突出的药物之一，但对5-HT和NE的强抑制也带来明显副作用（口干、便秘、嗜睡）。",
    half_life: "19-37小时"
  },
  {
    id: "imipramine",
    name: "丙米嗪",
    name_en: "Imipramine",
    brands: ["丙米嗪片", "托弗拉尼"],
    category: "三环类抗抑郁药 (TCA)",
    category_group: "antidepressant_tca",
    contraindications: [
      { text: "禁止与 MAOI 类药物合用", severity: "danger" },
      { text: "禁止与酒精同服", severity: "danger" },
      { text: "心脏病、闭角型青光眼、前列腺增生禁用", severity: "danger" },
      { text: "惊恐障碍患者初期可能加重焦虑", severity: "warning" },
      { text: "过量致死风险高", severity: "danger" }
    ],
    common_dosages: ["25mg", "50mg", "75mg", "100mg", "150mg"],
    description: "第一个上市的三环类抗抑郁药，也是惊恐障碍的经典治疗药物。副作用谱类似阿米替林。",
    half_life: "6-20小时"
  },

  // ==================== 第一代抗精神病药 (3) ====================
  {
    id: "haloperidol",
    name: "氟哌啶醇",
    name_en: "Haloperidol",
    brands: ["氟哌丁苯", "哈力多"],
    category: "第一代抗精神病药",
    category_group: "antipsychotic_first",
    contraindications: [
      { text: "帕金森病患者禁用", severity: "danger" },
      { text: "禁止与酒精同服", severity: "danger" },
      { text: "锥体外系反应（EPS）极重：手抖、僵硬、静坐不能、急性肌张力障碍", severity: "danger" },
      { text: "QT 延长风险，需监测心电图", severity: "warning" },
      { text: "迟发性运动障碍风险（可能不可逆）", severity: "danger" },
      { text: "恶性综合征风险（肌肉僵硬+高热+意识障碍=急诊！）", severity: "danger" }
    ],
    common_dosages: ["0.5mg", "1mg", "2mg", "5mg", "10mg"],
    description: "经典第一代抗精神病药，控制急性兴奋激越效果好、起效快、价格低。但锥体外系反应最重。",
    half_life: "14-26小时"
  },
  {
    id: "perphenazine",
    name: "奋乃静",
    name_en: "Perphenazine",
    brands: ["奋乃静片"],
    category: "第一代抗精神病药",
    category_group: "antipsychotic_first",
    contraindications: [
      { text: "禁止与酒精同服", severity: "danger" },
      { text: "帕金森病患者慎用", severity: "warning" },
      { text: "锥体外系反应较氟哌啶醇轻但仍有", severity: "warning" },
      { text: "迟发性运动障碍风险", severity: "warning" },
      { text: "恶性综合征风险", severity: "danger" }
    ],
    common_dosages: ["2mg", "4mg", "8mg", "12mg"],
    description: "第一代抗精神病药中锥体外系反应相对较轻的药物，价格低廉，临床仍有广泛使用。",
    half_life: "9小时"
  },
  {
    id: "chlorpromazine",
    name: "氯丙嗪",
    name_en: "Chlorpromazine",
    brands: ["盐酸氯丙嗪片", "冬眠灵"],
    category: "第一代抗精神病药",
    category_group: "antipsychotic_first",
    contraindications: [
      { text: "禁止与酒精同服，严重呼吸抑制", severity: "danger" },
      { text: "低血压风险显著（α受体阻断），老年人慎用", severity: "danger" },
      { text: "光敏反应——服药期间避免阳光直射", severity: "warning" },
      { text: "癫痫患者慎用（降低癫痫阈值）", severity: "warning" },
      { text: "迟发性运动障碍风险", severity: "warning" },
      { text: "恶性综合征风险", severity: "danger" }
    ],
    common_dosages: ["25mg", "50mg", "100mg", "200mg"],
    description: "精神病学历史上第一种抗精神病药（1952年），开创了精神药理学时代。镇静作用强，但副作用较多。",
    half_life: "30小时"
  },

  // ==================== 第二代抗精神病药 (12) ====================
  {
    id: "olanzapine",
    name: "奥氮平",
    name_en: "Olanzapine",
    brands: ["再普乐", "欧兰宁", "悉敏"],
    category: "第二代抗精神病药",
    category_group: "antipsychotic_second",
    contraindications: [
      { text: "禁止与酒精同服，严重加重镇静", severity: "danger" },
      { text: "体重增加最严重的非典型抗精神病药！糖尿病/肥胖患者慎用", severity: "danger" },
      { text: "血糖升高、血脂异常风险显著，需定期监测", severity: "warning" },
      { text: "闭角型青光眼患者禁用", severity: "warning" },
      { text: "老年痴呆相关精神病患者死亡率增加", severity: "warning" }
    ],
    common_dosages: ["2.5mg", "5mg", "10mg", "15mg", "20mg"],
    description: "控制幻觉妄想和兴奋激越效果好，起效快。最大问题是体重增加和代谢副作用（血糖血脂升高）。",
    half_life: "21-54小时"
  },
  {
    id: "clozapine",
    name: "氯氮平",
    name_en: "Clozapine",
    brands: ["氯扎平", "氯氮平片"],
    category: "第二代抗精神病药",
    category_group: "antipsychotic_second",
    contraindications: [
      { text: "粒细胞缺乏症风险！必须定期监测血常规（前6月每周，之后每2-4周，终生）", severity: "danger" },
      { text: "心肌炎风险（前2个月最危险），出现胸痛/心悸/呼吸困难立即就医", severity: "danger" },
      { text: "癫痫风险增加（剂量依赖性）", severity: "danger" },
      { text: "禁止与酒精同服", severity: "danger" },
      { text: "严重便秘可致肠梗阻甚至穿孔！必须积极处理便秘", severity: "danger" },
      { text: "流涎（夜间明显）、体重增加、嗜睡常见", severity: "warning" }
    ],
    common_dosages: ["12.5mg", "25mg", "50mg", "100mg", "200mg", "300mg", "450mg"],
    description: "难治性精神分裂症的'最后王牌'，其他药物无效时氯氮平是唯一选择。但副作用重，需要密切监测。用于降低自杀风险。",
    half_life: "12小时"
  },
  {
    id: "risperidone",
    name: "利培酮",
    name_en: "Risperidone",
    brands: ["维思通", "索乐", "思利舒"],
    category: "第二代抗精神病药",
    category_group: "antipsychotic_second",
    contraindications: [
      { text: "禁止与酒精同服", severity: "danger" },
      { text: "泌乳素升高显著！可致闭经、泌乳、性功能障碍、骨质疏松", severity: "warning" },
      { text: "老年痴呆相关精神病患者死亡/卒中风险增加", severity: "danger" },
      { text: "帕金森病（伴路易体痴呆）患者对利培酮极敏感", severity: "warning" },
      { text: "体重增加和代谢影响较奥氮平轻但仍有", severity: "warning" }
    ],
    common_dosages: ["0.5mg", "1mg", "2mg", "3mg", "4mg", "6mg"],
    description: "使用最广泛的非典型抗精神病药之一，抗幻觉起效快。主要副作用：泌乳素升高（可致月经紊乱、泌乳）、体重增加。",
    half_life: "20小时"
  },
  {
    id: "quetiapine",
    name: "喹硫平",
    name_en: "Quetiapine",
    brands: ["思瑞康", "舒思", "启维"],
    category: "第二代抗精神病药",
    category_group: "antipsychotic_second",
    contraindications: [
      { text: "禁止与酒精同服，严重加重镇静和呼吸抑制", severity: "danger" },
      { text: "白天明显嗜睡/昏沉，服药后不宜驾驶", severity: "warning" },
      { text: "体重增加、血糖血脂升高风险", severity: "warning" },
      { text: "老年痴呆相关精神病患者死亡率增加", severity: "warning" },
      { text: "与延长 QT 间期的药物慎用", severity: "warning" }
    ],
    common_dosages: ["25mg", "50mg", "100mg", "200mg", "300mg", "400mg", "600mg", "800mg"],
    description: "镇静作用最强的非典型抗精神病药，低剂量常被超说明书用于失眠（不推荐长期用于单纯失眠）。双相抑郁也有效。",
    half_life: "6-7小时"
  },
  {
    id: "aripiprazole",
    name: "阿立哌唑",
    name_en: "Aripiprazole",
    brands: ["安律凡", "博思清", "阿立哌唑片"],
    category: "第二代抗精神病药",
    category_group: "antipsychotic_second",
    contraindications: [
      { text: "禁止与酒精同服", severity: "danger" },
      { text: "服药初期可能出现明显的静坐不能（坐立不安、无法静坐）", severity: "warning" },
      { text: "有赌博、性欲亢进、暴食等冲动控制障碍的报告", severity: "warning" },
      { text: "老年痴呆相关精神病患者死亡率增加", severity: "warning" }
    ],
    common_dosages: ["2mg", "5mg", "10mg", "15mg", "20mg", "30mg"],
    description: "代谢副作用最小（几乎不增重、不影响血糖血脂），泌乳素影响也最轻。但初期可能引起静坐不能。有长效针剂。",
    half_life: "75小时"
  },
  {
    id: "paliperidone",
    name: "帕利哌酮",
    name_en: "Paliperidone",
    brands: ["芮达", "善思达（长效针）", "帕利哌酮缓释片"],
    category: "第二代抗精神病药",
    category_group: "antipsychotic_second",
    contraindications: [
      { text: "禁止与酒精同服", severity: "danger" },
      { text: "泌乳素升高显著（利培酮的活性代谢物）", severity: "warning" },
      { text: "老年痴呆相关精神病患者死亡率增加", severity: "warning" },
      { text: "QT 延长风险（较轻微）", severity: "warning" },
      { text: "狭窄性消化道疾病患者禁用缓释片", severity: "warning" }
    ],
    common_dosages: ["3mg", "6mg", "9mg", "12mg"],
    description: "利培酮的升级版，肝代谢负担更低。有每月一次/每季一次的长效针剂，依从性差的患者首选。",
    half_life: "23小时"
  },
  {
    id: "amisulpride",
    name: "氨磺必利",
    name_en: "Amisulpride",
    brands: ["索里昂", "帕克"],
    category: "第二代抗精神病药",
    category_group: "antipsychotic_second",
    contraindications: [
      { text: "禁止与酒精同服", severity: "danger" },
      { text: "泌乳素显著升高！比绝大多数非典型抗精神病药都高", severity: "warning" },
      { text: "QT 延长风险（剂量依赖性）", severity: "warning" },
      { text: "肾衰竭患者禁用（经肾排泄）", severity: "danger" },
      { text: "与延长 QT 间期的药物禁止合用", severity: "danger" }
    ],
    common_dosages: ["50mg", "100mg", "200mg", "400mg", "800mg", "1200mg"],
    description: "低剂量（50-300mg）改善阴性症状，高剂量（400-1200mg）控制阳性症状。独特的剂量双相作用。泌乳素升高显著。",
    half_life: "12小时"
  },
  {
    id: "ziprasidone",
    name: "齐拉西酮",
    name_en: "Ziprasidone",
    brands: ["卓乐定", "齐拉西酮胶囊"],
    category: "第二代抗精神病药",
    category_group: "antipsychotic_second",
    contraindications: [
      { text: "QT 延长风险显著！有心律失常史者禁用", severity: "danger" },
      { text: "禁止与其他延长 QT 间期的药物合用", severity: "danger" },
      { text: "禁止与酒精同服", severity: "danger" },
      { text: "必须随餐服用（空腹吸收率仅40-50%）", severity: "warning" },
      { text: "近期心梗或失代偿性心衰患者禁用", severity: "danger" }
    ],
    common_dosages: ["20mg", "40mg", "60mg", "80mg", "160mg"],
    description: "几乎不增重、不影响血糖，是代谢最友好的非典型抗精神病药之一。但需警惕 QT 延长，必须随餐服用。",
    half_life: "7小时"
  },
  {
    id: "blonanserin",
    name: "布南色林",
    name_en: "Blonanserin",
    brands: ["洛珊"],
    category: "第二代抗精神病药",
    category_group: "antipsychotic_second",
    contraindications: [
      { text: "禁止与酒精同服", severity: "danger" },
      { text: "禁止与 CYP3A4 强抑制剂（如酮康唑、克拉霉素）合用", severity: "danger" },
      { text: "帕金森病患者慎用", severity: "warning" }
    ],
    common_dosages: ["2mg", "4mg", "8mg", "16mg"],
    description: "日本原研，代谢副作用轻，锥体外系反应少。较新的非典型抗精神病药选择。",
    half_life: "10-16小时"
  },
  {
    id: "lurasidone",
    name: "鲁拉西酮",
    name_en: "Lurasidone",
    brands: ["罗舒达"],
    category: "第二代抗精神病药",
    category_group: "antipsychotic_second",
    contraindications: [
      { text: "禁止与酒精同服", severity: "danger" },
      { text: "禁止与强 CYP3A4 抑制剂/诱导剂合用", severity: "danger" },
      { text: "必须随餐服用（至少350千卡，否则吸收率极低）", severity: "warning" },
      { text: "老年痴呆相关精神病患者死亡率增加", severity: "warning" }
    ],
    common_dosages: ["20mg", "40mg", "80mg", "120mg"],
    description: "代谢副作用极轻，对认知功能有潜在保护作用。但必须随餐服用且餐量有要求。",
    half_life: "18小时"
  },
  {
    id: "brexpiprazole",
    name: "布瑞哌唑",
    name_en: "Brexpiprazole",
    brands: ["锐思定"],
    category: "第二代抗精神病药",
    category_group: "antipsychotic_second",
    contraindications: [
      { text: "禁止与酒精同服", severity: "danger" },
      { text: "与强 CYP2D6/CYP3A4 抑制剂需调整剂量", severity: "warning" },
      { text: "老年痴呆相关精神病患者死亡率增加", severity: "warning" },
      { text: "可能有冲动控制障碍（较阿立哌唑轻）", severity: "warning" }
    ],
    common_dosages: ["0.5mg", "1mg", "2mg", "3mg"],
    description: "阿立哌唑的改良版，药理相似但镇静稍多，静坐不能和激越较阿立哌唑少。2020年在国内上市。",
    half_life: "91小时"
  },
  {
    id: "asenapine",
    name: "阿塞那平",
    name_en: "Asenapine",
    brands: ["舍曲林（舌下片）"],
    category: "第二代抗精神病药",
    category_group: "antipsychotic_second",
    contraindications: [
      { text: "禁止与酒精同服", severity: "danger" },
      { text: "舌下含服，服用后10分钟内不能进食饮水", severity: "warning" },
      { text: "QT 延长风险", severity: "warning" },
      { text: "老年痴呆相关精神病患者死亡率增加", severity: "warning" }
    ],
    common_dosages: ["5mg", "10mg", "20mg"],
    description: "舌下含服给药（绕过肝脏首过效应），对急性躁狂有效。口腔麻木和味觉异常较常见。",
    half_life: "24小时"
  },

  // ==================== 心境稳定剂 (5) ====================
  {
    id: "lithium",
    name: "碳酸锂",
    name_en: "Lithium Carbonate",
    brands: ["碳酸锂片", "碳酸锂缓释片", "锂盐"],
    category: "心境稳定剂",
    category_group: "mood_stabilizer",
    contraindications: [
      { text: "必须定期监测血锂浓度！（治疗窗 0.6-1.2 mmol/L，>1.5 中毒，>3.5 致死）", severity: "danger" },
      { text: "肾衰竭/肾功能不全者禁用", severity: "danger" },
      { text: "禁止与 NSAID 类止痛药（布洛芬、双氯芬酸等）合用，可致血锂急剧升高", severity: "danger" },
      { text: "脱水/发热/大量出汗时需立即减量或暂停并就医", severity: "danger" },
      { text: "禁止与酒精同服", severity: "danger" },
      { text: "长期使用可致甲状腺功能减退和肾功能损害", severity: "warning" },
      { text: "孕妇禁用（妊娠前三月 Ebstein 心脏畸形风险）", severity: "danger" },
      { text: "锂中毒前兆：粗大震颤、呕吐、腹泻、嗜睡、构音不清→立即急诊！", severity: "danger" }
    ],
    common_dosages: ["250mg", "300mg", "450mg", "500mg"],
    description: "双相障碍的'金标准'，唯一被证明可降低自杀风险的药物。但治疗窗极窄，必须定期监测血锂浓度。",
    half_life: "18-24小时"
  },
  {
    id: "valproate",
    name: "丙戊酸钠",
    name_en: "Sodium Valproate",
    brands: ["德巴金", "丙戊酸钠缓释片"],
    category: "心境稳定剂",
    category_group: "mood_stabilizer",
    contraindications: [
      { text: "肝功能不全者禁用，有肝衰竭风险！", severity: "danger" },
      { text: "育龄女性尽量避免使用（多囊卵巢综合征、致畸风险）", severity: "danger" },
      { text: "孕妇禁用（神经管缺陷 3-5%、脊柱裂风险）", severity: "danger" },
      { text: "胰腺炎风险（罕见但严重）", severity: "danger" },
      { text: "禁止与酒精同服，加重肝损伤", severity: "danger" },
      { text: "体重增加、脱发、手抖常见", severity: "warning" },
      { text: "与拉莫三嗪合用需调整剂量（丙戊酸抑制拉莫三嗪代谢）", severity: "warning" }
    ],
    common_dosages: ["250mg", "500mg", "750mg", "1000mg", "1500mg"],
    description: "起效最快的心境稳定剂，对混合发作和快速循环型双相障碍效果突出。女性使用时需特别注意生殖副作用。",
    half_life: "9-16小时"
  },
  {
    id: "lamotrigine",
    name: "拉莫三嗪",
    name_en: "Lamotrigine",
    brands: ["利必通", "拉莫三嗪片"],
    category: "心境稳定剂",
    category_group: "mood_stabilizer",
    contraindications: [
      { text: "Stevens-Johnson 综合征风险！出现皮疹必须立即停药就医！", severity: "danger" },
      { text: "必须极缓慢加量（通常需8周达到治疗剂量），快速加量皮疹风险剧增", severity: "danger" },
      { text: "禁止与酒精同服", severity: "danger" },
      { text: "与丙戊酸钠合用时需大幅降低剂量（丙戊酸使其血药浓度翻倍）", severity: "warning" }
    ],
    common_dosages: ["25mg", "50mg", "100mg", "200mg", "300mg"],
    description: "预防双相抑郁复发效果好，不影响体重和代谢。最大风险是皮疹（Stevens-Johnson综合征），必须缓慢加量。",
    half_life: "25-33小时"
  },
  {
    id: "carbamazepine",
    name: "卡马西平",
    name_en: "Carbamazepine",
    brands: ["得理多", "卡马西平片"],
    category: "心境稳定剂",
    category_group: "mood_stabilizer",
    contraindications: [
      { text: "粒细胞缺乏症/再生障碍性贫血风险！需定期查血常规", severity: "danger" },
      { text: "禁止与 MAOI 类药物合用", severity: "danger" },
      { text: "强肝酶诱导剂，会降低几乎所有精神科药物的血药浓度（包括避孕药）", severity: "danger" },
      { text: "低钠血症风险（老年患者尤其常见）", severity: "warning" },
      { text: "禁止与酒精同服", severity: "danger" },
      { text: "孕妇禁用（神经管缺陷风险）", severity: "danger" }
    ],
    common_dosages: ["100mg", "200mg", "400mg", "600mg", "800mg"],
    description: "对难治性双相障碍和躁狂有效，也是三叉神经痛一线药物。最大问题是药物相互作用极多（强CYP3A4诱导剂）。",
    half_life: "12-17小时"
  },
  {
    id: "oxcarbazepine",
    name: "奥卡西平",
    name_en: "Oxcarbazepine",
    brands: ["曲莱", "奥卡西平片"],
    category: "心境稳定剂",
    category_group: "mood_stabilizer",
    contraindications: [
      { text: "禁止与酒精同服", severity: "danger" },
      { text: "低钠血症风险（较卡马西平更常见）", severity: "warning" },
      { text: "药物相互作用较卡马西平少但仍存在", severity: "warning" },
      { text: "可能降低激素类避孕药效果", severity: "warning" }
    ],
    common_dosages: ["150mg", "300mg", "600mg", "900mg", "1200mg"],
    description: "卡马西平的衍生物，耐受性更好，药物相互作用少。但低钠血症风险较卡马西平更高。",
    half_life: "8-10小时"
  },

  // ==================== 苯二氮䓬类抗焦虑药 (6) ====================
  {
    id: "alprazolam",
    name: "阿普唑仑",
    name_en: "Alprazolam",
    brands: ["佳静安定", "阿普唑仑片"],
    category: "苯二氮䓬类抗焦虑药",
    category_group: "anxiolytic_benzo",
    contraindications: [
      { text: "⚠️ 禁止与酒精同服！苯二氮䓬+酒精=呼吸抑制→可能致死！", severity: "danger" },
      { text: "成瘾性在苯二氮䓬类中最强！仅限短期使用（<4周）", severity: "danger" },
      { text: "撤药反应极重：焦虑反跳、失眠加重、惊恐发作、癫痫", severity: "danger" },
      { text: "闭角型青光眼患者禁用", severity: "danger" },
      { text: "重症肌无力患者禁用", severity: "danger" },
      { text: "阿片类药物合用增加过量致死风险", severity: "danger" },
      { text: "孕妇禁用", severity: "danger" }
    ],
    common_dosages: ["0.25mg", "0.4mg", "0.5mg", "1mg"],
    description: "抗惊恐发作起效最快（约15分钟），但成瘾性最强、撤药最难。仅建议短期低剂量间断使用。",
    half_life: "11-13小时"
  },
  {
    id: "lorazepam",
    name: "劳拉西泮",
    name_en: "Lorazepam",
    brands: ["罗拉", "劳拉西泮片"],
    category: "苯二氮䓬类抗焦虑药",
    category_group: "anxiolytic_benzo",
    contraindications: [
      { text: "⚠️ 禁止与酒精同服！呼吸抑制致死风险！", severity: "danger" },
      { text: "闭角型青光眼、重症肌无力禁用", severity: "danger" },
      { text: "阿片类药物合用增加过量致死风险", severity: "danger" },
      { text: "长期使用产生依赖和耐受", severity: "warning" },
      { text: "孕妇禁用", severity: "danger" }
    ],
    common_dosages: ["0.5mg", "1mg", "2mg"],
    description: "不经肝脏代谢（直接葡糖醛酸化），老年人/肝功能不全者相对安全。作用平稳，无活性代谢物蓄积。",
    half_life: "12小时"
  },
  {
    id: "clonazepam",
    name: "氯硝西泮",
    name_en: "Clonazepam",
    brands: ["利福全", "氯硝安定"],
    category: "苯二氮䓬类抗焦虑药",
    category_group: "anxiolytic_benzo",
    contraindications: [
      { text: "⚠️ 禁止与酒精同服！呼吸抑制致死风险！", severity: "danger" },
      { text: "半衰期最长（20-50小时），蓄积风险高，老年人慎用", severity: "danger" },
      { text: "撤药最困难的苯二氮䓬类之一", severity: "danger" },
      { text: "闭角型青光眼、重症肌无力、严重肝病禁用", severity: "danger" },
      { text: "阿片类药物合用增加过量致死风险", severity: "danger" },
      { text: "白天嗜睡、认知功能下降", severity: "warning" },
      { text: "孕妇禁用", severity: "danger" }
    ],
    common_dosages: ["0.5mg", "1mg", "2mg"],
    description: "作用时间最长，适合持续焦虑和辅助抗躁狂。但撤药极难，半衰期长达20-50小时。",
    half_life: "20-50小时"
  },
  {
    id: "diazepam",
    name: "地西泮",
    name_en: "Diazepam",
    brands: ["安定", "地西泮片"],
    category: "苯二氮䓬类抗焦虑药",
    category_group: "anxiolytic_benzo",
    contraindications: [
      { text: "⚠️ 禁止与酒精同服！呼吸抑制致死风险！", severity: "danger" },
      { text: "闭角型青光眼、重症肌无力、严重呼吸功能不全禁用", severity: "danger" },
      { text: "阿片类药物合用增加过量致死风险", severity: "danger" },
      { text: "代谢慢（长半衰期+活性代谢物），老年人易蓄积", severity: "warning" },
      { text: "肌肉松弛作用强，老年人跌倒风险增加", severity: "warning" },
      { text: "孕妇禁用", severity: "danger" }
    ],
    common_dosages: ["2.5mg", "5mg", "10mg"],
    description: "经典的苯二氮䓬类药物，肌肉松弛作用最强。也用于癫痫持续状态和酒精戒断。代谢慢、易蓄积。",
    half_life: "20-100小时（含活性代谢物）"
  },
  {
    id: "estazolam",
    name: "艾司唑仑",
    name_en: "Estazolam",
    brands: ["舒乐安定", "艾司唑仑片"],
    category: "苯二氮䓬类抗焦虑药",
    category_group: "anxiolytic_benzo",
    contraindications: [
      { text: "⚠️ 禁止与酒精同服！", severity: "danger" },
      { text: "闭角型青光眼、重症肌无力禁用", severity: "danger" },
      { text: "阿片类药物合用增加过量致死风险", severity: "danger" },
      { text: "以助眠为主，不宜长期使用", severity: "warning" },
      { text: "孕妇禁用", severity: "danger" }
    ],
    common_dosages: ["1mg", "2mg"],
    description: "国内最常用的助眠类苯二氮䓬药物之一。中效（半衰期10-24小时），次日残留感较轻。依赖风险不低。",
    half_life: "10-24小时"
  },
  {
    id: "oxazepam",
    name: "奥沙西泮",
    name_en: "Oxazepam",
    brands: ["舒宁", "奥沙西泮片"],
    category: "苯二氮䓬类抗焦虑药",
    category_group: "anxiolytic_benzo",
    contraindications: [
      { text: "⚠️ 禁止与酒精同服！", severity: "danger" },
      { text: "闭角型青光眼、重症肌无力禁用", severity: "danger" },
      { text: "阿片类药物合用增加过量致死风险", severity: "danger" },
      { text: "孕妇禁用", severity: "danger" }
    ],
    common_dosages: ["10mg", "15mg", "30mg"],
    description: "不经肝脏代谢（直接葡糖醛酸化），与劳拉西泮类似。肝功能不全者相对安全，短半衰期不易蓄积。",
    half_life: "4-15小时"
  },

  // ==================== 非苯二氮䓬类抗焦虑药 (2) ====================
  {
    id: "buspirone",
    name: "丁螺环酮",
    name_en: "Buspirone",
    brands: ["一舒", "丁螺环酮片"],
    category: "非苯二氮䓬类抗焦虑药",
    category_group: "anxiolytic_nonbenzo",
    contraindications: [
      { text: "禁止与 MAOI 类药物合用（可能引起严重高血压）", severity: "danger" },
      { text: "禁止与酒精同服", severity: "danger" },
      { text: "起效慢（2-4周），不适用于急性焦虑/惊恐", severity: "warning" },
      { text: "严重肝肾功能不全者禁用", severity: "warning" }
    ],
    common_dosages: ["5mg", "10mg", "15mg", "20mg", "30mg"],
    description: "不依赖、不成瘾、不镇静的非苯二氮䓬类抗焦虑药。适合慢性广泛性焦虑的长期维持治疗。起效慢但安全。",
    half_life: "2-11小时"
  },
  {
    id: "hydroxyzine",
    name: "羟嗪",
    name_en: "Hydroxyzine",
    brands: ["安泰乐", "羟嗪片"],
    category: "非苯二氮䓬类抗焦虑药（抗组胺）",
    category_group: "anxiolytic_nonbenzo",
    contraindications: [
      { text: "禁止与酒精同服，加重镇静", severity: "danger" },
      { text: "QT 延长风险，有心律失常史者禁用", severity: "danger" },
      { text: "闭角型青光眼、前列腺增生、排尿困难禁用", severity: "danger" },
      { text: "老年患者慎用（抗胆碱能副作用：意识模糊、便秘、尿潴留）", severity: "warning" }
    ],
    common_dosages: ["10mg", "25mg", "50mg", "100mg"],
    description: "抗组胺类抗焦虑药，不成瘾不依赖。用于短期焦虑缓解和术前镇静。嗜睡明显。",
    half_life: "7-20小时"
  },

  // ==================== 镇静催眠药 (3) ====================
  {
    id: "zolpidem",
    name: "唑吡坦",
    name_en: "Zolpidem",
    brands: ["思诺思", "唑吡坦片"],
    category: "镇静催眠药 (Z-drug)",
    category_group: "sedative_hypnotic",
    contraindications: [
      { text: "⚠️ 禁止与酒精同服！", severity: "danger" },
      { text: "阿片类药物合用增加呼吸抑制和死亡风险", severity: "danger" },
      { text: "复杂睡眠行为报告：梦游驾驶、梦游进食、梦游打电话", severity: "danger" },
      { text: "重症肌无力、严重呼吸功能不全禁用", severity: "danger" },
      { text: "长期使用产生依赖，撤药反跳性失眠", severity: "warning" },
      { text: "孕妇禁用", severity: "danger" }
    ],
    common_dosages: ["5mg", "10mg"],
    description: "最常用的非苯二氮䓬类催眠药（Z-drug），入睡快。但有梦游行为报告，最长不宜超过4周。",
    half_life: "2-3小时"
  },
  {
    id: "zopiclone",
    name: "佐匹克隆",
    name_en: "Zopiclone",
    brands: ["忆梦返", "佐匹克隆片"],
    category: "镇静催眠药 (Z-drug)",
    category_group: "sedative_hypnotic",
    contraindications: [
      { text: "⚠️ 禁止与酒精同服！", severity: "danger" },
      { text: "阿片类药物合用增加呼吸抑制和死亡风险", severity: "danger" },
      { text: "口苦/金属味常见（味觉障碍）", severity: "warning" },
      { text: "重症肌无力、严重呼吸功能不全禁用", severity: "danger" },
      { text: "长期使用产生依赖", severity: "warning" },
      { text: "孕妇禁用", severity: "danger" }
    ],
    common_dosages: ["3.75mg", "7.5mg"],
    description: "Z-drug 类催眠药，维持睡眠效果好于唑吡坦（半衰期稍长）。最常见副作用：口苦/金属味。",
    half_life: "5小时"
  },
  {
    id: "eszopiclone",
    name: "右佐匹克隆",
    name_en: "Eszopiclone",
    brands: ["文飞", "右佐匹克隆片"],
    category: "镇静催眠药 (Z-drug)",
    category_group: "sedative_hypnotic",
    contraindications: [
      { text: "⚠️ 禁止与酒精同服！", severity: "danger" },
      { text: "阿片类药物合用增加呼吸抑制和死亡风险", severity: "danger" },
      { text: "口苦/味觉异常（较佐匹克隆轻）", severity: "warning" },
      { text: "重症肌无力、严重呼吸功能不全禁用", severity: "danger" },
      { text: "长期使用产生依赖", severity: "warning" },
      { text: "孕妇禁用", severity: "danger" }
    ],
    common_dosages: ["1mg", "2mg", "3mg"],
    description: "佐匹克隆的右旋异构体，效果相同但剂量减半，味觉副作用较佐匹克隆轻。适合入睡困难+睡眠维持困难。",
    half_life: "6小时"
  },

  // ==================== ADHD 治疗药 (2) ====================
  {
    id: "methylphenidate",
    name: "哌甲酯",
    name_en: "Methylphenidate",
    brands: ["专注达", "利他林", "哌甲酯缓释片"],
    category: "ADHD 治疗药（中枢兴奋剂）",
    category_group: "adhd",
    contraindications: [
      { text: "MAOI 类合用须间隔 14 天以上", severity: "danger" },
      { text: "严重焦虑/激越患者禁用", severity: "danger" },
      { text: "青光眼患者禁用", severity: "danger" },
      { text: "禁止与酒精同服", severity: "danger" },
      { text: "有成瘾和滥用风险（一类精神药品管理）", severity: "danger" },
      { text: "心脏病/高血压患者需定期监测心血管", severity: "warning" },
      { text: "可能抑制儿童生长发育，需定期监测身高体重", severity: "warning" }
    ],
    common_dosages: ["5mg", "10mg", "18mg", "27mg", "36mg", "54mg"],
    description: "ADHD 一线药物，一类精神药品（严格管控）。速释剂型（利他林）和缓释剂型（专注达）。",
    half_life: "2-4小时（速释）/ 10-12小时（缓释）"
  },
  {
    id: "atomoxetine",
    name: "托莫西汀",
    name_en: "Atomoxetine",
    brands: ["择思达", "托莫西汀胶囊"],
    category: "ADHD 治疗药（非中枢兴奋剂）",
    category_group: "adhd",
    contraindications: [
      { text: "MAOI 类合用须间隔 14 天以上", severity: "danger" },
      { text: "闭角型青光眼禁用", severity: "danger" },
      { text: "禁止与酒精同服", severity: "danger" },
      { text: "罕见但严重：肝损伤（需监测肝功能）", severity: "warning" },
      { text: "儿童青少年自杀意念风险增加，需密切观察", severity: "danger" },
      { text: "可能升高血压和心率", severity: "warning" }
    ],
    common_dosages: ["10mg", "18mg", "25mg", "40mg", "60mg", "80mg", "100mg"],
    description: "非中枢兴奋剂 ADHD 药物，不成瘾不滥用。适合有物质滥用风险的 ADHD 患者及哌甲酯效果不佳者。",
    half_life: "5小时"
  }
];

// 分类配置（用于筛选）
const MED_CATEGORY_GROUPS = [
  { id: "all", label: "全部药品" },
  { id: "antidepressant_ssri", label: "SSRI 抗抑郁药" },
  { id: "antidepressant_snri", label: "SNRI 抗抑郁药" },
  { id: "antidepressant_atypical", label: "非典型抗抑郁药" },
  { id: "antidepressant_tca", label: "三环类抗抑郁药" },
  { id: "antipsychotic_first", label: "第一代抗精神病药" },
  { id: "antipsychotic_second", label: "第二代抗精神病药" },
  { id: "mood_stabilizer", label: "心境稳定剂" },
  { id: "anxiolytic_benzo", label: "苯二氮䓬类" },
  { id: "anxiolytic_nonbenzo", label: "非苯二氮䓬类抗焦虑药" },
  { id: "sedative_hypnotic", label: "镇静催眠药" },
  { id: "adhd", label: "ADHD 治疗药" }
];

// 服药时段
const MED_TIME_SLOTS = [
  { id: "morning", label: "早", icon: "🌅" },
  { id: "noon", label: "中", icon: "☀️" },
  { id: "evening", label: "晚", icon: "🌇" },
  { id: "bedtime", label: "睡前", icon: "🌙" }
];
