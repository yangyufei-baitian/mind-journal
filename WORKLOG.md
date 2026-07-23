# 心灵日记 — 工作日志

> 最后更新: 2026-07-23 17:40

---

## 总览

```
Phase 1 [进行中 80%] → Phase 2 [待开始] → Phase 3 [待开始] → Phase 4 [待开始] → Phase 5 [待开始]
 部署上线                功能完善             软著申请             科研工具             论文产出
```

---

## Phase 1 🚀 部署上线

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
| 07-23 | 🔴 数据同步调试中 — 注册成功但同步报"网络错误"，已加 debug 日志等验证 | 🔴 |

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

### 1.4 下次继续

1. 手机打开 `https://mind-journal-livid.vercel.app/`
2. 设置页确认"分享情绪记录"开关是开的
3. 点"立即同步" → 把提示文字完整发来
4. 根据错误日志定位根因并修复
5. 修复后做端到端测试 (记录→同步→验证后端收到)
6. PWA 安装测试（添加到主屏幕）

---

## Phase 2 🔧 功能完善 (目标: 3-4周)

### 2.1 核心功能

- [ ] 🐛 修复已知 bug（导航切换等）
- [ ] 💊 服药记录模块（药品名+剂量+时间）
- [ ] 💊 药效对比图（服药 vs 情绪/症状趋势叠加）
- [ ] 📋 医生报告 PDF 导出（含图表+症状摘要）
- [ ] 🔔 每日推送提醒（Notification API）
- [ ] 😴 睡眠追踪（入睡/起床+时长）

### 2.2 增强功能

- [ ] ✏️ 自定义症状
- [ ] 🌐 多设备 Profile 切换
- [ ] 🎨 暗色模式
- [ ] 🧪 基础测试覆盖

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
