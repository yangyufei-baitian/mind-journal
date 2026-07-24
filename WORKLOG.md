# 心灵日记 — 工作日志

> 最后更新: 2026-07-24 14:00

---

## 总览

```
Phase 1 [✅ 完成] → Phase 2 [✅ 进行中] → Phase 3 [待开始] → Phase 4 [待开始] → Phase 5 [待开始]
 部署上线              功能完善             软著申请             科研工具             论文产出
```

---

## Phase 1 🚀 部署上线 ✅ 完成

**目标**：后端部署到公网，不再依赖本地电脑。任何人随时随地可用。

### 1.1 工作日志

| 日期 | 内容 | 状态 |
|------|------|:--:|
| 07-23 | 确定 Phase 1~5 任务清单 | ✅ |
| 07-23 | 后端适配 PostgreSQL + 环境变量 (database.py/auth.py/main.py) | ✅ |
| 07-23 | 前端 API_BASE 优先级系统 (localStorage > window注入 > 自动检测) | ✅ |
| 07-23 | 创建 render.yaml + vercel.json + DEPLOY.md + .gitignore | ✅ |
| 07-23 | Git 初始化 + 首次提交 + 推送 GitHub (yangyufei-baitian/mind-journal) | ✅ |
| 07-23 | Render: 后端部署成功 (mind-journal-api.onrender.com) — /health 返回 OK | ✅ |
| 07-23 | Vercel: 前端部署成功 (mind-journal-livid.vercel.app) — 页面正常加载 | ✅ |
| 07-23 | CORS 修复: CORS_ORIGINS 从 `*` 改为 `https://mind-journal-livid.vercel.app` | ✅ |
| 07-23 | 账号注册测试通过 (手机→Vercel→Render 链路通) | ✅ |
| 07-23 | 🐛 Debug 1: Service Worker 缓存旧 JS → SW v0.6 + 版本号参数 v=2~7 | ✅ |
| 07-23 | 🐛 Debug 2: IndexedDB IDBKeyRange.bound 异常 → 全部改为 toArray()+filter | ✅ |
| 07-23 | 🐛 Debug 3: 跨会话 anonymous_id 不匹配 → 登录后同步 setUserId() | ✅ |
| 07-23 | ✅ 端到端同步成功: 手机记录情绪→登录→同步→后端确认收到 | ✅ |

### 1.2 上线环境信息

| 项目 | 地址 |
|------|------|
| 前端 (Vercel) | `https://mind-journal-livid.vercel.app/` |
| 后端 (Render) | `https://mind-journal-api.onrender.com` |
| API 文档 | `https://mind-journal-api.onrender.com/docs` |
| GitHub | `https://github.com/yangyufei-baitian/mind-journal` |
| 数据库 | Render PostgreSQL (自动注入 DATABASE_URL) |

### 1.3 已知问题

- **同步失败**：curl 直接调 API (`/api/mood`) 返回 200 正常，说明后端没问题。问题在前端 sync.js。已在最新 commit (180ef08) 中加入详细错误日志，下次打开页面点同步会显示具体错误信息。

---

## Phase 2 🔧 功能完善

### 2.1 临床量表 v1.0 (07-23)

| 日期 | 内容 | 状态 |
|------|------|:--:|
| 07-23 | PHQ-9 / GAD-7 / C-SSRS / DSHI-s 四个量表全部实现 | ✅ |
| 07-23 | C-SSRS 分层评分 (tiered: 低/中/高/极高风险) | ✅ |
| 07-23 | 危机干预自动触发 (C-SSRS≥2 → 热线弹窗, PHQ-9 Q9≥2 → C-SSRS引导) | ✅ |
| 07-23 | 量表结果集成到 PDF 报告 (含严重度+基线比较+警告) | ✅ |
| 07-23 | DB v4: +scaleEntries 表 (Dexie.js) | ✅ |

### 2.2 临床量表增强 v2.0 (07-24)

| 日期 | 内容 | 状态 |
|------|------|:--:|
| 07-24 | **SCL-90** 症状自评量表 (90题标准中文版, 10因子维度, 分页显示每页10题) | ✅ |
| 07-24 | SCL-90 因子评分: GSI/PST/PSDI + 10维度因子分表格 + 颜色标记 | ✅ |
| 07-24 | **必做/选做分离**: 核心4量表 required:true (报告+警告), SCL-90 required:false (选做) | ✅ |
| 07-24 | renderScaleCards 重构: 必做卡片组 + 分隔线 + "其他量表（选做）"区 | ✅ |
| 07-24 | **量表云端同步**: saveScaleResult +synced字段, sync.js +scale sync section | ✅ |
| 07-24 | 后端 +ScaleAssessment 表 +POST/GET /api/scale 端点 (upsert by user+date+type) | ✅ |
| 07-24 | **量表分数趋势图**: stats页 +canvas折线图 +下拉选择器, SCL-90显示GSI, 数据点按严重度着色 | ✅ |
| 07-24 | SW bump v0.12, HTML_VER v5-scl90, scales.js bump v2.0 | ✅ |
| 07-24 | collectScaleDataForReport() 只收集 required 量表, 选做量表不进入报告 | ✅ |

### 2.3 bugfix + 文献补齐 (07-24)

| 日期 | 内容 | 状态 |
|------|------|:--:|
| 07-24 | 🐛 **Sync fix**: sync.js 同步前自动调用 POST /api/register (静默注册 anonymous_id) | ✅ |
| 07-24 | 📚 **文献缺口补齐**: bio_weight 基于皮质醇定量数据 (Skubic 2025), symptom coef 基于 CGI-S (Busner 2007, Leucht 2019), 加权公式数学论证 (Stone 2023, Lo 2014), 隐私 consent (Pendse 2024, Kwon 2025) | ✅ |
| 07-24 | 📚 文献文档更新至 22 篇, 新增第六~九章 | ✅ |
| 07-24 | 🔧 **bio_weight 校准**: 基于皮质醇昼夜曲线 (0.5/1.5/1.3/0.8/1.0/0.9/0.6) | ✅ |
| 07-24 | 🔧 **severity coef 非线性化**: mild 0.4 / moderate 1.0 / severe 2.5 (CGI-S 等百分位链接) | ✅ |
| 07-24 | 🔧 DSHI-s max修正 27→18, SCL-90解读 +中国常模 (金华 1986, GSI=1.44±0.43) | ✅ |
| 07-24 | 🔧 量表定义 +PHQ-9/GAD-7/C-SSRS 信效度引用 | ✅ |

### 2.4 待做

- [ ] P1 剩余: CSV 数据导出
- [ ] P2: 工具打磨 (引导页, 数据导入, mini-charts)
- [ ] P3: 工程清理 (移除 html2pdf CDN, 错误处理)

---

## Phase 3 📜 软著申请 (目标: 1-3月)

- [ ] 源代码整理
- [ ] 软件说明书编写
- [ ] 中国版权保护中心提交申请
- [ ] v1.0 正式版定版

---

## Phase 4 🔬 科研工具化 (目标: 2-4周)

- [ ] 📊 研究员仪表盘 Web 页面
- [ ] 📥 数据导出（CSV/SPSS + 数据字典）
- [ ] 📖 算法白皮书（中英文）
- [ ] 📝 IRB 材料模板
- [ ] 🔒 安全加固
- [ ] 👥 被试管理系统

---

## Phase 5 📝 论文与发布 (目标: 3-6月)

- [ ] 算法验证论文
- [ ] 系统设计论文（粒度化知情同意）
- [ ] GitHub 开源 + Zenodo DOI

---

## 技术债务

- [ ] 生物学权重系数查阅文献验证
- [ ] 症状权重咨询精神科临床意见
- [ ] 单元测试覆盖
- [ ] 多语言支持
