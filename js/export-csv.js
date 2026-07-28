/* ============================================
   export-csv.js — CSV 数据导出模块 v1.0
   支持: 情绪/症状/量表/服药 CSV + 数据字典 + ZIP打包
   编码: UTF-8 BOM (Windows Excel 直接打开)
   依赖: JSZip (CDN, 打包全部功能)
   ============================================ */

const CSV_BOM = "﻿";

// CSV 字段转义 (处理逗号、引号、换行)
function csvEscape(val) {
    if (val === null || val === undefined) return "";
    const s = String(val);
    if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
        return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
}

// 对象数组 → CSV 字符串
function toCSV(headers, rows) {
    const lines = [headers.join(",")];
    for (const row of rows) {
        lines.push(headers.map(h => csvEscape(row[h] !== undefined ? row[h] : "")).join(","));
    }
    return CSV_BOM + lines.join("\n");
}

// 触发浏览器下载
function downloadBlob(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType || "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ==================== 情绪 CSV ====================

async function exportMoodCSV() {
    const all = await db.moodEntries.toArray();
    all.sort((a, b) => a.date.localeCompare(b.date) || a.time_period.localeCompare(b.time_period));

    const headers = [
        "日期", "时段ID", "时段名称", "情绪分(1-10)",
        "生物权重", "时段时长(h)", "加权贡献",
        "情绪标签", "精力水平", "睡眠时长",
        "备注", "记录时间", "更新时间"
    ];
    const rows = all.map(e => {
        const period = TIME_PERIODS.find(p => p.id === e.time_period) || {};
        const hours = period.hours || 0;
        const bioW = period.bio_weight || 0;
        const contrib = hours * bioW * (e.score || 0);
        return {
            "日期": e.date,
            "时段ID": e.time_period || "",
            "时段名称": period.label || "",
            "情绪分(1-10)": e.score,
            "生物权重": bioW,
            "时段时长(h)": hours,
            "加权贡献": Math.round(contrib * 100) / 100,
            "情绪标签": (e.emotion_tags || []).join(";"),
            "精力水平": e.energy_level || "",
            "睡眠时长": e.sleep_hours || "",
            "备注": e.note || "",
            "记录时间": e.created_at || "",
            "更新时间": e.updated_at || ""
        };
    });

    const dateStr = new Date().toISOString().split("T")[0];
    downloadBlob(toCSV(headers, rows), `mind-journal-mood-${dateStr}.csv`);
    return rows.length;
}

// ==================== 症状 CSV ====================
// 每条症状记录按 symptom_id 展开 (unnest)

async function exportSymptomCSV() {
    const all = await db.symptomEntries.toArray();
    all.sort((a, b) => a.date.localeCompare(b.date));

    const headers = [
        "日期", "时段ID", "症状ID", "症状名称", "分类",
        "基础权重(CGI-S)", "严重度等级", "严重度系数(coef)",
        "症状分(base_weight×coef)", "频率",
        "记录时间"
    ];
    const rows = [];
    for (const e of all) {
        for (const s of (e.symptoms || [])) {
            const cfg = typeof SYMPTOM_MAP !== "undefined" ? (SYMPTOM_MAP[s.symptom_id] || {}) : {};
            const baseW = cfg.base_weight || 0;
            const sevCoef = { mild: 0.4, moderate: 1.0, severe: 2.5 }[s.level] || 0;
            rows.push({
                "日期": e.date,
                "时段ID": e.time_period || "",
                "症状ID": s.symptom_id,
                "症状名称": cfg.label || s.symptom_id,
                "分类": cfg.category || "",
                "基础权重(CGI-S)": baseW,
                "严重度等级": s.level || "",
                "严重度系数(coef)": sevCoef,
                "症状分(base_weight×coef)": Math.round(baseW * sevCoef * 100) / 100,
                "频率": s.frequency || "",
                "记录时间": e.created_at || ""
            });
        }
    }

    const dateStr = new Date().toISOString().split("T")[0];
    downloadBlob(toCSV(headers, rows), `mind-journal-symptom-${dateStr}.csv`);
    return rows.length;
}

// ==================== 量表 CSV ====================

async function exportScaleCSV() {
    const all = await db.scaleEntries.toArray();
    all.sort((a, b) => a.date.localeCompare(b.date));

    const headers = [
        "日期", "量表类型", "量表名称", "总分", "严重度标签",
        "GSI(总均分)", "PST(阳性项目数)", "PSDI(阳性均分)",
        "各题答案", "是否必做", "记录时间"
    ];
    const rows = all.map(e => {
        const scaleDef = typeof SCALES !== "undefined" ? (SCALES[e.scale_type] || {}) : {};
        // SCL-90 特殊字段
        let gsi = "", pst = "", psdi = "";
        if (e.scale_type === "scl90" && Array.isArray(e.answers)) {
            const total = e.answers.reduce((a, b) => a + b, 0);
            gsi = (total / e.answers.length).toFixed(2);
            pst = e.answers.filter(v => v >= 3).length;  // ≥3 = 阳性
            const positives = e.answers.filter(v => v >= 3);
            psdi = positives.length > 0 ? (positives.reduce((a, b) => a + b, 0) / positives.length).toFixed(2) : "";
        }
        return {
            "日期": e.date,
            "量表类型": e.scale_type,
            "量表名称": scaleDef.name || e.scale_type,
            "总分": e.total_score,
            "严重度标签": e.severity_label || "",
            "GSI(总均分)": gsi,
            "PST(阳性项目数)": pst,
            "PSDI(阳性均分)": psdi,
            "各题答案": Array.isArray(e.answers) ? JSON.stringify(e.answers) : (e.answers || ""),
            "是否必做": scaleDef.required !== false ? "是" : "否",
            "记录时间": e.created_at || ""
        };
    });

    const dateStr = new Date().toISOString().split("T")[0];
    downloadBlob(toCSV(headers, rows), `mind-journal-scale-${dateStr}.csv`);
    return rows.length;
}

// ==================== 服药 CSV ====================
// 合并药品配置 + 打卡记录

async function exportMedicationCSV() {
    const userMeds = await db.userMedications.toArray();
    const logs = await db.medicationLog.toArray();
    logs.sort((a, b) => (a.date || "").localeCompare(b.date || ""));

    const medMap = {};
    for (const um of userMeds) {
        medMap[um.id] = um;
    }

    const headers = [
        "日期", "时段", "药品ID", "药品名(处方)", "自定义剂量", "剂量单位",
        "每次粒数", "是否按时", "打卡时间",
        "药品总粒数", "开始日期", "服药备注"
    ];
    const rows = logs.map(l => {
        const um = medMap[l.user_med_id] || {};
        const info = typeof getMedicationInfo === "function" ? getMedicationInfo(l.med_id) : null;
        return {
            "日期": l.date || "",
            "时段": l.period || "",
            "药品ID": l.med_id || "",
            "药品名(处方)": info ? info.name : (l.med_id || ""),
            "自定义剂量": um.custom_dose || "",
            "剂量单位": um.dose_unit || "",
            "每次粒数": um.pills_per_dose || "",
            "是否按时": "是",  // 打卡即按时
            "打卡时间": l.taken_at || l.created_at || "",
            "药品总粒数": um.total_pills || "",
            "开始日期": um.start_date || "",
            "服药备注": um.notes || ""
        };
    });

    const dateStr = new Date().toISOString().split("T")[0];
    downloadBlob(toCSV(headers, rows), `mind-journal-medication-${dateStr}.csv`);
    return rows.length;
}

// ==================== 药品配置 CSV ====================

async function exportMedicationConfigCSV() {
    const userMeds = await db.userMedications.toArray();

    const headers = [
        "药品ID", "药品名(处方)", "自定义剂量", "剂量单位",
        "每次粒数", "服药频率", "总粒数", "开始日期", "备注", "创建时间"
    ];
    const rows = userMeds.map(um => {
        const info = typeof getMedicationInfo === "function" ? getMedicationInfo(um.med_id) : null;
        const freq = um.frequency || {};
        const freqParts = [];
        if (freq.morning) freqParts.push("早");
        if (freq.noon) freqParts.push("中");
        if (freq.evening) freqParts.push("晚");
        if (freq.bedtime) freqParts.push("睡前");
        return {
            "药品ID": um.med_id || "",
            "药品名(处方)": info ? info.name : (um.med_id || ""),
            "自定义剂量": um.custom_dose || "",
            "剂量单位": um.dose_unit || "",
            "每次粒数": um.pills_per_dose || "",
            "服药频率": freqParts.join("/"),
            "总粒数": um.total_pills || "",
            "开始日期": um.start_date || "",
            "备注": um.notes || "",
            "创建时间": um.created_at || ""
        };
    });

    const dateStr = new Date().toISOString().split("T")[0];
    downloadBlob(toCSV(headers, rows), `mind-journal-med-config-${dateStr}.csv`);
    return rows.length;
}

// ==================== 数据字典 (Markdown) ====================

function buildDataDictionary() {
    return `# 心灵日记 — 科研数据字典
# Mind Journal — Research Data Dictionary
# 导出日期: ${new Date().toISOString().split("T")[0]}
# ============================================================

============================================================
一、情绪记录 (mood.csv)
============================================================

列名              类型      取值范围          说明
日期              String    YYYY-MM-DD         记录日期
时段ID            String    0-6/6-9/9-12/...   7时段标识
时段名称          String    深夜~深夜           中文时段名
情绪分(1-10)      Integer   1-10                1=很差, 10=很好
生物权重          Float     0.5~1.5             皮质醇昼夜曲线权重
时段时长(h)       Float     2~6                 时段持续小时数
加权贡献          Float     D×B×S               时长×权重×情绪分
情绪标签          String    分号分隔             开心;平静;焦虑等
精力水平          String    高/中/低            主观精力评价
睡眠时长          String    e.g. "7h"           前一晚睡眠
备注              String    自由文本
记录时间          ISO8601                       创建时间戳
更新时间          ISO8601                       最后修改时间戳

加权公式:
  dailyScore = Σ(Di × Bi × Si) / Σ(Di × Bi)
  Di = 时段时长, Bi = bio_weight, Si = 情绪评分
  文献: Stone (2023) Annual Review of Clinical Psychology

生物权重依据:
  时段    权重    皮质醇水平 (Skubic 2025)
  0-6     0.5     ~9% 峰值 (午夜最低点)
  6-9     1.5     ~100% 峰值 (CAR觉醒反应, 最高诊断价值)
  9-12    1.3     ~78% 峰值 (晨间平台期)
  12-14   0.8     餐后下降
  14-18   1.0     ~43% 峰值 (午后中等水平)
  18-22   0.9     ~22% 峰值 (晚间低值, 抑郁标志物)
  22-24   0.6     ~13% 峰值 (睡前低谷)

============================================================
二、症状记录 (symptom.csv)
============================================================

列名              类型      取值范围          说明
日期              String    YYYY-MM-DD         记录日期
时段ID            String    0-6/6-9/...        时段标识
症状ID            String    英文key            症状唯一标识
症状名称          String    中文                症状中文名
分类              String    危机级/严重级/...   严重度分类
基础权重(CGI-S)   Integer   1~10               CGI-S映射
严重度等级        String    mild/moderate/severe
严重度系数(coef)  Float     0.4/1.0/2.5       非线性系数
症状分            Float     base_weight×coef   单项症状分
频率              String    每天/经常/偶尔      出现频率
记录时间          ISO8601                       创建时间戳

症状分公式:
  symptomScore = Σ(base_weight_i × severity_coef_j)
  同一日期+时段内, 同一症状多次记录取最大值

CGI-S 映射 (Busner & Targum 2007):
  base_weight 1  = CGI-S 2-3 (边缘/轻度)
  base_weight 2-3 = CGI-S 4 (中度, 临床试验入组阈值)
  base_weight 4-7 = CGI-S 5 (显著功能损害)
  base_weight 8-10 = CGI-S 6-7 (严重/极重)

严重度系数 (Leucht 2019, Egger 2019: 3067例):
  mild:     0.4 — CGI-S 2-3, 有症状但功能影响小
  moderate: 1.0 — CGI-S 4, 临床显著性基准
  severe:   2.5 — CGI-S 5-6, 功能损害非线性加速

============================================================
三、临床量表 (scale.csv)
============================================================

列名              类型      取值范围          说明
日期              String    YYYY-MM-DD         评估日期
量表类型          String    phq9/gad7/cssrs/... 量表标识
量表名称          String    中文                量表中文全名
总分              Integer   依量表而定          原始总分
严重度标签        String    正常/轻度/中度/...  临床分级
GSI(总均分)       Float     1~5                SCL-90专用, 其他为空
PST(阳性项目数)   Integer   0~90               SCL-90专用, ≥3为阳性
PSDI(阳性均分)    Float     3~5                SCL-90专用
各题答案          JSON      [0,1,2,...]        每题原始答案
是否必做          String    是/否               核心4量表=是, SCL-90=否
记录时间          ISO8601                       创建时间戳

量表类型对照:
  phq9  = PHQ-9 抑郁症筛查 (Kroenke 2001, 卞崔冬 2009 中文版)
  gad7  = GAD-7 焦虑症筛查 (Spitzer 2006)
  cssrs = C-SSRS 自杀风险评估 (Ji 2023, α=0.884)
  dshi  = DSHI-s 自伤行为筛查
  scl90 = SCL-90 症状自评量表 (金华 1986 中国常模 GSI=1.44±0.43)

============================================================
四、服药打卡 (medication.csv)
============================================================

列名              类型      取值范围          说明
日期              String    YYYY-MM-DD         打卡日期
时段              String    morning/noon/...   服药时段
药品ID            String    medication id      药品种类ID
药品名(处方)      String    中文                处方药名
自定义剂量        String    e.g. "20"          用户实际剂量
剂量单位          String    mg/片/粒           剂量单位
每次粒数          Integer   1~N                每次服用粒数
是否按时          String    是                  打卡即视为按时
打卡时间          ISO8601                       实际打卡时间戳
药品总粒数        Integer   处方总粒数
开始日期          String    YYYY-MM-DD         用药起始日
服药备注          String    自由文本

============================================================
五、药品配置 (med-config.csv)
============================================================

列名              类型      取值范围          说明
药品ID            String    medication id      药品种类ID
药品名(处方)      String    中文                处方药名
自定义剂量        String    e.g. "20"          用户实际剂量
剂量单位          String    mg/片/粒           剂量单位
每次粒数          Integer   1~N                每次服用粒数
服药频率          String    早/中/晚/睡前       每日服药时段
总粒数            Integer   处方总粒数
开始日期          String    YYYY-MM-DD         用药起始日
备注              String    自由文本
创建时间          ISO8601                       配置创建时间

============================================================
六、编码说明
============================================================

- 所有CSV文件使用 UTF-8 BOM 编码, Windows Excel 可直接打开
- 日期格式统一为 YYYY-MM-DD (ISO 8601)
- 时间戳格式统一为 ISO 8601 (e.g. 2026-07-24T15:30:00.000Z)
- 缺失值留空, 不使用 "N/A" 或 "null"
- JSON 字段使用标准 JSON 编码 (双引号)
- 多值字段使用分号(;)分隔 (如情绪标签列)

============================================================
七、关键参考文献
============================================================

日用加权: Stone (2023) "EMA: state of the science"
          Annual Review of Clinical Psychology
皮质醇:   Skubic et al. (2025) "Circadian Biomarkers"
          Biomolecules 15(8), 1127
CGI-S:    Busner & Targum (2007) "CGI clinical global
          impressions scale" Psychiatry 4(7), 28-37
等百分位: Leucht et al. (2019) "Equipercentile linking
          of CGI-S and PANSS" The Lancet Psychiatry
中国常模: 金华, 吴文源, 张明园 (1986)
          "SCL-90中国常模" 中华神经精神科杂志
C-SSRS:   Ji et al. (2023) "Chinese C-SSRS validation"
          上海精神医学, α=0.884
`;
}

function downloadDataDictionary() {
    const content = CSV_BOM + buildDataDictionary();
    const dateStr = new Date().toISOString().split("T")[0];
    downloadBlob(content, `mind-journal-data-dictionary-${dateStr}.txt`, "text/plain;charset=utf-8");
}

// ==================== 知情同意导出 ====================

async function exportConsentCSV() {
    const all = await db.consentSettings.toArray();

    const headers = [
        "记录ID", "共享情绪数据", "共享日记内容",
        "同意时间", "更新时间"
    ];
    const rows = [];
    for (const c of all) {
        rows.push({
            "记录ID": c.id || "",
            "共享情绪数据": c.share_mood ? "是" : "否",
            "共享日记内容": c.share_diary ? "是" : "否",
            "同意时间": c.created_at || "",
            "更新时间": c.updated_at || ""
        });
    }

    const dateStr = new Date().toISOString().split("T")[0];
    downloadBlob(toCSV(headers, rows), `mind-journal-consent-${dateStr}.csv`);
    return rows.length;
}

// ==================== 一键导出全部 (ZIP) ====================

async function exportAllCSV() {
    // 检查 JSZip 是否可用
    if (typeof JSZip === "undefined") {
        showToast("⚠️ JSZip 未加载，正在分别下载...");
        await exportAllCSVFallback();
        return;
    }

    showToast("⏳ 正在打包数据...");

    try {
        const zip = new JSZip();
        const dateStr = new Date().toISOString().split("T")[0];

        // 收集各数据集并生成 CSV 字符串 (不含BOM, ZIP内统一处理)
        // 情绪
        const moods = await db.moodEntries.toArray();
        moods.sort((a, b) => a.date.localeCompare(b.date) || a.time_period.localeCompare(b.time_period));
        const moodHeaders = ["日期","时段ID","时段名称","情绪分(1-10)","生物权重","时段时长(h)","加权贡献","情绪标签","精力水平","睡眠时长","备注","记录时间","更新时间"];
        const moodRows = moods.map(e => {
            const period = TIME_PERIODS.find(p => p.id === e.time_period) || {};
            const h = period.hours || 0, bw = period.bio_weight || 0;
            return {
                "日期":e.date,"时段ID":e.time_period||"","时段名称":period.label||"","情绪分(1-10)":e.score,
                "生物权重":bw,"时段时长(h)":h,"加权贡献":Math.round(h*bw*(e.score||0)*100)/100,
                "情绪标签":(e.emotion_tags||[]).join(";"),"精力水平":e.energy_level||"","睡眠时长":e.sleep_hours||"",
                "备注":e.note||"","记录时间":e.created_at||"","更新时间":e.updated_at||""
            };
        });
        zip.file(`mood-${dateStr}.csv`, CSV_BOM + toCSV(moodHeaders, moodRows));

        // 症状
        const symAll = await db.symptomEntries.toArray();
        symAll.sort((a, b) => a.date.localeCompare(b.date));
        const symHeaders = ["日期","时段ID","症状ID","症状名称","分类","基础权重(CGI-S)","严重度等级","严重度系数(coef)","症状分","频率","记录时间"];
        const symRows = [];
        for (const e of symAll) {
            for (const s of (e.symptoms || [])) {
                const cfg = typeof SYMPTOM_MAP !== "undefined" ? (SYMPTOM_MAP[s.symptom_id] || {}) : {};
                const bw = cfg.base_weight || 0;
                const sc = {mild:0.4,moderate:1.0,severe:2.5}[s.level] || 0;
                symRows.push({
                    "日期":e.date,"时段ID":e.time_period||"","症状ID":s.symptom_id,"症状名称":cfg.label||s.symptom_id,
                    "分类":cfg.category||"","基础权重(CGI-S)":bw,"严重度等级":s.level||"",
                    "严重度系数(coef)":sc,"症状分":Math.round(bw*sc*100)/100,"频率":s.frequency||"","记录时间":e.created_at||""
                });
            }
        }
        zip.file(`symptom-${dateStr}.csv`, CSV_BOM + toCSV(symHeaders, symRows));

        // 量表
        const scales = await db.scaleEntries.toArray();
        scales.sort((a, b) => a.date.localeCompare(b.date));
        const scaleHeaders = ["日期","量表类型","量表名称","总分","严重度标签","GSI","PST","PSDI","各题答案","是否必做","记录时间"];
        const scaleRows = scales.map(e => {
            const def = typeof SCALES !== "undefined" ? (SCALES[e.scale_type] || {}) : {};
            let gsi="", pst="", psdi="";
            if (e.scale_type === "scl90" && Array.isArray(e.answers)) {
                const t = e.answers.reduce((a,b)=>a+b,0);
                gsi = (t/e.answers.length).toFixed(2);
                pst = e.answers.filter(v=>v>=3).length;
                const pos = e.answers.filter(v=>v>=3);
                psdi = pos.length>0 ? (pos.reduce((a,b)=>a+b,0)/pos.length).toFixed(2) : "";
            }
            return {
                "日期":e.date,"量表类型":e.scale_type,"量表名称":def.name||e.scale_type,"总分":e.total_score,
                "严重度标签":e.severity_label||"","GSI":gsi,"PST":pst,"PSDI":psdi,
                "各题答案":Array.isArray(e.answers)?JSON.stringify(e.answers):(e.answers||""),
                "是否必做":def.required!==false?"是":"否","记录时间":e.created_at||""
            };
        });
        zip.file(`scale-${dateStr}.csv`, CSV_BOM + toCSV(scaleHeaders, scaleRows));

        // 服药打卡
        const medLogs = await db.medicationLog.toArray();
        medLogs.sort((a,b) => (a.date||"").localeCompare(b.date||""));
        const userMeds = await db.userMedications.toArray();
        const medMap = {}; for (const um of userMeds) { medMap[um.id] = um; }
        const medHeaders = ["日期","时段","药品ID","药品名(处方)","自定义剂量","剂量单位","每次粒数","是否按时","打卡时间","药品总粒数","开始日期","服药备注"];
        const medRows = medLogs.map(l => {
            const um = medMap[l.user_med_id] || {};
            const info = typeof getMedicationInfo === "function" ? getMedicationInfo(l.med_id) : null;
            return {
                "日期":l.date||"","时段":l.period||"","药品ID":l.med_id||"",
                "药品名(处方)":info?info.name:(l.med_id||""),"自定义剂量":um.custom_dose||"",
                "剂量单位":um.dose_unit||"","每次粒数":um.pills_per_dose||"","是否按时":"是",
                "打卡时间":l.taken_at||l.created_at||"","药品总粒数":um.total_pills||"",
                "开始日期":um.start_date||"","服药备注":um.notes||""
            };
        });
        zip.file(`medication-${dateStr}.csv`, CSV_BOM + toCSV(medHeaders, medRows));

        // 药品配置
        const medCfgHeaders = ["药品ID","药品名(处方)","自定义剂量","剂量单位","每次粒数","服药频率","总粒数","开始日期","备注","创建时间"];
        const medCfgRows = userMeds.map(um => {
            const info = typeof getMedicationInfo === "function" ? getMedicationInfo(um.med_id) : null;
            const freq = um.frequency || {};
            const fp = [];
            if (freq.morning) fp.push("早"); if (freq.noon) fp.push("中");
            if (freq.evening) fp.push("晚"); if (freq.bedtime) fp.push("睡前");
            return {
                "药品ID":um.med_id||"","药品名(处方)":info?info.name:(um.med_id||""),
                "自定义剂量":um.custom_dose||"","剂量单位":um.dose_unit||"","每次粒数":um.pills_per_dose||"",
                "服药频率":fp.join("/"),"总粒数":um.total_pills||"","开始日期":um.start_date||"",
                "备注":um.notes||"","创建时间":um.created_at||""
            };
        });
        zip.file(`med-config-${dateStr}.csv`, CSV_BOM + toCSV(medCfgHeaders, medCfgRows));

        // 数据字典
        zip.file(`data-dictionary-${dateStr}.txt`, CSV_BOM + buildDataDictionary());

        // 知情同意
        const consents = await db.consentSettings.toArray();
        const consentHeaders = ["记录ID","共享情绪数据","共享日记内容","同意时间","更新时间"];
        const consentRows = consents.map(c => ({
            "记录ID":c.id||"","共享情绪数据":c.share_mood?"是":"否","共享日记内容":c.share_diary?"是":"否",
            "同意时间":c.created_at||"","更新时间":c.updated_at||""
        }));
        zip.file(`consent-${dateStr}.csv`, CSV_BOM + toCSV(consentHeaders, consentRows));

        // 生成 ZIP 并下载
        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `mind-journal-all-${dateStr}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        const totalFiles = Object.keys(zip.files).length;
        showToast(`✅ 已导出 ${totalFiles} 个文件 (CSV + 数据字典 + 知情同意)`);

    } catch (e) {
        handleError(e, "打包ZIP", { toast: true, detail: true });
        showToast("正在分别下载...");
        await exportAllCSVFallback();
    }
}

// 降级方案：无 JSZip 时逐个下载
async function exportAllCSVFallback() {
    const counts = [];
    counts.push(await exportMoodCSV());
    await sleep(300);
    counts.push(await exportSymptomCSV());
    await sleep(300);
    counts.push(await exportScaleCSV());
    await sleep(300);
    counts.push(await exportMedicationCSV());
    await sleep(300);
    downloadDataDictionary();
    showToast(`✅ 已分别导出 ${counts.reduce((a,b)=>a+b,0)} 条记录 + 数据字典`);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
