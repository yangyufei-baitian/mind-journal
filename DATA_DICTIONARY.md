# 心灵日记 — 科研数据字典
## Mind Journal — Research Data Dictionary

> 适用版本: v0.3+ | 导出编码: UTF-8 BOM | 日期格式: ISO 8601 (YYYY-MM-DD)

---

## 一、情绪记录 (mood.csv)

| 列名 | 类型 | 取值范围 | 说明 |
|------|------|----------|------|
| 日期 | String | YYYY-MM-DD | 记录日期 |
| 时段ID | String | 0-6 / 6-9 / 9-12 / 12-14 / 14-18 / 18-22 / 22-24 | 7时段标识 |
| 时段名称 | String | 深夜/睡眠 ~ 深夜 | 中文时段名 |
| 情绪分(1-10) | Integer | 1-10 | 1=很差, 5=一般, 10=很好 |
| 生物权重 | Float | 0.5 ~ 1.5 | 皮质醇昼夜曲线生物学权重 |
| 时段时长(h) | Float | 2 ~ 6 | 时段持续小时数 |
| 加权贡献 | Float | — | 时长 × 生物权重 × 情绪分 |
| 情绪标签 | String | 分号分隔 | 如 "开心;平静;焦虑" |
| 精力水平 | String | 高/中/低 | 主观精力评价 |
| 睡眠时长 | String | — | 如 "7h" |
| 备注 | String | 自由文本 | 用户输入 |
| 记录时间 | ISO8601 | — | 创建时间戳 |
| 更新时间 | ISO8601 | — | 最后修改时间戳 |

### 核心公式

```
每日加权情绪分:
  dailyScore = Σ(Di × Bi × Si) / Σ(Di × Bi)

  Di = 时段时长 (hours)   — 持续时间加权 (Stone 2023 Annual Review of Clinical Psychology)
  Bi = 生物权重            — 皮质醇相对分泌水平 (Skubic 2025 Biomolecules)
  Si = 情绪自评分数 (1-10)
```

### 生物权重依据

| 时段 | 权重 | 皮质醇水平 | 说明 |
|------|:----:|------------|------|
| 0-6 深夜/睡眠 | 0.5 | ~9% 峰值 | 皮质醇最低点，睡眠混杂因素 |
| 6-9 早晨 | **1.5** | ~100% 峰值 | CAR 觉醒反应，HPA 轴黄金诊断窗口 |
| 9-12 上午 | 1.3 | ~78% 峰值 | 晨间高位平台 |
| 12-14 午间 | 0.8 | 餐后下降 | 午餐后皮质醇自然降低 |
| 14-18 下午 | 1.0 | ~43% 峰值 | 午后中等水平，慢性应激敏感 |
| 18-22 傍晚 | 0.9 | ~22% 峰值 | 晚间低值，晚间升高=抑郁生物标志 |
| 22-24 深夜 | 0.6 | ~13% 峰值 | 睡前低谷，接近褪黑素峰值 |

> 参考文献: Skubic et al. (2025) "Circadian Biomarkers in Humans" — Biomolecules 15(8), 1127
> Robertson-Dixon et al. (2023) "Light Wavelength on HPA Axis Rhythms" — Life 13(8), 1706

---

## 二、症状记录 (symptom.csv)

| 列名 | 类型 | 取值范围 | 说明 |
|------|------|----------|------|
| 日期 | String | YYYY-MM-DD | 记录日期 |
| 时段ID | String | 0-6 / … / 22-24 | 时段标识 |
| 症状ID | String | 英文 key | 症状唯一标识 |
| 症状名称 | String | 中文 | 39项症状之一 |
| 分类 | String | 危机级/严重级/中度级/轻微级 | 严重度分类 |
| 基础权重(CGI-S) | Integer | 1 ~ 10 | CGI-S 临床总体印象映射 |
| 严重度等级 | String | mild / moderate / severe | 用户选择 |
| 严重度系数(coef) | Float | 0.4 / 1.0 / 2.5 | 非线性系数 |
| 症状分 | Float | — | base_weight × severity_coef |
| 频率 | String | 每天/经常/偶尔 | 出现频率 |
| 记录时间 | ISO8601 | — | 创建时间戳 |

### 核心公式

```
症状分 = base_weight × severity_coef

同一日期+时段内同一症状多次出现 → 取最大值 (避免重复计数)
每日症状总分 = Σ(当天各症状分)
```

### CGI-S 映射 (Busner & Targum 2007)

| CGI-S 等级 | base_weight | 说明 |
|------------|:-----------:|------|
| CGI-S 1 正常 | — | 无对应条目 |
| CGI-S 2-3 边缘/轻度 | 1 | 不适但不影响核心功能 |
| CGI-S 4 中度 | 2-3 | 临床试验入组阈值 |
| CGI-S 5 显著 | 4-7 | 明显功能损害 |
| CGI-S 6-7 严重/极重 | 8-10 | 需立即干预 |

### 严重度系数 (Leucht 2019; Egger 2019, N=3067)

| 等级 | coef | CGI-S 对应 | 说明 |
|------|:----:|------------|------|
| mild | 0.4 | CGI-S 2-3 | 有症状但功能影响小 |
| moderate | **1.0** | CGI-S 4 | 临床显著性基准 (锚定点) |
| severe | 2.5 | CGI-S 5-6 | 功能损害非线性加速 |

> Leucht et al. (2019) 证实 CGI-S 的非线性特征: PANSS 每降低1分 CGI-S ≠ 线性变化

---

## 三、临床量表 (scale.csv)

| 列名 | 类型 | 取值范围 | 说明 |
|------|------|----------|------|
| 日期 | String | YYYY-MM-DD | 评估日期 |
| 量表类型 | String | phq9 / gad7 / cssrs / dshi / scl90 | 量表标识 |
| 量表名称 | String | 中文 | 量表中文全名 |
| 总分 | Integer | 依量表而定 | 原始总分 |
| 严重度标签 | String | 正常/轻度/中度/… | 临床分级 |
| GSI(总均分) | Float | 1 ~ 5 | SCL-90 专用，其他为空 |
| PST(阳性项目数) | Integer | 0 ~ 90 | SCL-90 专用 (≥3 = 阳性) |
| PSDI(阳性均分) | Float | 3 ~ 5 | SCL-90 专用 |
| 各题答案 | JSON | [int, …] | 每题原始答案数组 |
| 是否必做 | String | 是/否 | 核心4量表=是, SCL-90=否 |
| 记录时间 | ISO8601 | — | 创建时间戳 |

### 量表参数速查

| 量表 | 题数 | 总分范围 | 截断值 | 严重度分级 | 信效度 |
|------|:----:|----------|--------|------------|--------|
| PHQ-9 | 9 | 0-27 | ≥10 | 5级 | Kroenke 2001; 卞崔冬 2009 |
| GAD-7 | 7 | 0-21 | ≥10 | 4级 | Spitzer 2006 |
| C-SSRS | 6 | 分层 | ≥2=高风险 | 4级 | Ji 2023, α=0.884 |
| DSHI-s | 15 | 0-18 | — | 频率计数 | — |
| SCL-90 | 90 | 90-450 | GSI≥2=异常 | 5级(按GSI) | 金华 1986 中国常模 GSI=1.44±0.43 |

---

## 四、服药打卡 (medication.csv)

| 列名 | 类型 | 取值范围 | 说明 |
|------|------|----------|------|
| 日期 | String | YYYY-MM-DD | 打卡日期 |
| 时段 | String | morning/noon/evening/bedtime | 服药时段 |
| 药品ID | String | medication id | 药品种类ID |
| 药品名(处方) | String | 中文 | 处方药名 |
| 自定义剂量 | String | — | 用户实际服用的剂量 |
| 剂量单位 | String | mg/片/粒 | 剂量单位 |
| 每次粒数 | Integer | 1~N | 每次服用粒数 |
| 是否按时 | String | 是 | 打卡即视为按时 |
| 打卡时间 | ISO8601 | — | 实际打卡时间戳 |
| 药品总粒数 | Integer | — | 处方总粒数 |
| 开始日期 | String | YYYY-MM-DD | 用药起始日 |
| 服药备注 | String | — | 自由文本 |

### 依从率计算

```
累计依从率 = 累计打卡次数 / (用药天数 × 每日服药次数) × 100%
时段依从率 = 某时段打卡次数 / (天数 × 该时段每日应打卡次数) × 100%
```

---

## 五、药品配置 (med-config.csv)

| 列名 | 类型 | 取值范围 | 说明 |
|------|------|----------|------|
| 药品ID | String | medication id | 药品种类唯一标识 |
| 药品名(处方) | String | 中文 | 处方药名 |
| 自定义剂量 | String | — | 实际剂量 |
| 剂量单位 | String | mg/片/粒 | 剂量单位 |
| 每次粒数 | Integer | 1~N | 每次服用粒数 |
| 服药频率 | String | 早/中/晚/睡前 | "/"分隔 |
| 总粒数 | Integer | — | 处方总粒数 |
| 开始日期 | String | YYYY-MM-DD | 用药起始日 |
| 备注 | String | — | 自由文本 |
| 创建时间 | ISO8601 | — | 配置创建时间 |

---

## 六、编码说明

| 规则 | 说明 |
|------|------|
| 文件编码 | UTF-8 with BOM (Windows Excel 直接打开不乱码) |
| 日期格式 | YYYY-MM-DD (ISO 8601) |
| 时间戳格式 | ISO 8601 (如 `2026-07-24T15:30:00.000Z`) |
| 缺失值 | 留空，不使用 "N/A" 或 "null" |
| JSON 字段 | 标准 JSON 编码 (双引号) |
| 多值字段 | 分号 `;` 分隔 (如情绪标签列) |
| CSV 分隔符 | 逗号 `,` |
| 换行符 | CRLF (Windows) |

---

## 七、SPSS 导入指南

1. 打开 SPSS → File → Open → Data → 选择 `.csv` 文件
2. 编码选择 **UTF-8**
3. 分隔符选择 **Comma**
4. 确认各列的类型和度量级别:
   - 日期列 → String (Nominal)
   - 分数列 → Numeric (Scale)
   - 标签/ID 列 → String (Nominal)
5. 在 Variable View 中设置 Value Labels (参考本字典各表的值域)

---

## 八、R 导入示例

```r
# 导入情绪数据
mood <- read.csv("mood-2026-07-24.csv", 
                 fileEncoding = "UTF-8-BOM",
                 stringsAsFactors = FALSE)

# 导入症状数据
symptom <- read.csv("symptom-2026-07-24.csv",
                    fileEncoding = "UTF-8-BOM",
                    stringsAsFactors = FALSE)

# 导入量表数据
scale <- read.csv("scale-2026-07-24.csv",
                  fileEncoding = "UTF-8-BOM",
                  stringsAsFactors = FALSE)
```

## Python 导入示例

```python
import pandas as pd

# 导入情绪数据
mood = pd.read_csv("mood-2026-07-24.csv", encoding="utf-8-sig")

# 导入症状数据
symptom = pd.read_csv("symptom-2026-07-24.csv", encoding="utf-8-sig")

# 导入量表数据
scale = pd.read_csv("scale-2026-07-24.csv", encoding="utf-8-sig")
```

---

## 九、关键参考文献

| 主题 | 文献 |
|------|------|
| EMA 加权方法 | Stone et al. (2023) "Ecological Momentary Assessment: State of the Science" — *Annual Review of Clinical Psychology* |
| 皮质醇定量 | Skubic et al. (2025) "Circadian Biomarkers in Humans" — *Biomolecules* 15(8), 1127 |
| CGI-S 量表 | Busner & Targum (2007) "The Clinical Global Impressions Scale" — *Psychiatry* 4(7), 28-37 |
| 等百分位链接 | Leucht et al. (2019) "Equipercentile Linking of CGI-S and PANSS" — *The Lancet Psychiatry* |
| CGI-S 非线性 | Egger et al. (2019) "CGI-S Linking in 3067 Patients" — Manuscript |
| SCL-90 中国常模 | 金华, 吴文源, 张明园 (1986) "SCL-90 中国常模" — *中华神经精神科杂志* |
| C-SSRS 中文版 | Ji et al. (2023) "Chinese C-SSRS Validation" — 上海精神医学, α=0.884 |
| PHQ-9 | Kroenke et al. (2001) "The PHQ-9" — *Journal of General Internal Medicine* |
| PHQ-9 中文版 | 卞崔冬等 (2009) "PHQ-9 中文版信效度" — *中国心理卫生杂志* |
| 隐私 consent | Pendse et al. (2024) "Consent-Forward Paradigm" — *CHI 2024* |
| 动态 consent | Kwon et al. (2025) "Dynamic Consent for mHealth" — *JMIR* |
