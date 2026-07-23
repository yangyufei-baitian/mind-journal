# 心灵日记 — 部署指南

## 架构

```
手机浏览器 ──→ Vercel (前端静态页面) ──→ Render (后端 API + PostgreSQL)
   │               免费                          免费 (90天)
   └─ 本地 IndexedDB (离线可用，同步可选)
```

---

## 第一步：部署后端到 Render (5分钟)

### 1.1 准备
- 注册 [Render](https://render.com) (用 GitHub 账号登录即可)

### 1.2 创建 PostgreSQL 数据库
1. Render Dashboard → New → PostgreSQL
2. Name: `mind-journal-db`
3. Region: Singapore (亚洲访问快)
4. Plan: Free
5. 创建后，复制 **Internal Database URL** (供 Web Service 用)

### 1.3 创建 Web Service
1. Render Dashboard → New → Web Service
2. 选择你的 GitHub 仓库 (或直接上传 backend/ 文件夹)
3. 设置:
   - **Name**: `mind-journal-api`
   - **Region**: Singapore
   - **Root Directory**: `backend/`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. 环境变量:
   - `JWT_SECRET` — 点 Generate 自动生成
   - `CORS_ORIGINS` — `*` (或改成你的 Vercel 域名)
5. 等 2-3 分钟部署完成，记下 URL: `https://mind-journal-api.onrender.com`

### 1.4 验证
浏览器打开 `https://你的域名.onrender.com/health`
应该显示 `{"status":"ok","app":"心灵日记",...}`

---

## 第二步：部署前端到 Vercel (3分钟)

### 2.1 准备
- 注册 [Vercel](https://vercel.com) (用 GitHub 账号登录)
- **把后端 URL 写入前端配置**：
  编辑 [sync.js](frontend/js/sync.js)，找到 `window.MJ_API_BASE` 那行（第 18 行附近），取消注释并改成你的 Render URL：
  ```js
  // 部署到 Vercel 时取消下面这行的注释:
  // window.MJ_API_BASE = "https://mind-journal-api.onrender.com/api";
  ```
  改成：
  ```js
  window.MJ_API_BASE = "https://mind-journal-api.onrender.com/api";
  ```

### 2.2 部署
1. Vercel Dashboard → New Project
2. 导入你的 GitHub 仓库
3. **Root Directory**: `frontend/`
4. Framework Preset: **Other** (纯静态)
5. Deploy
6. 记下 URL: `https://心灵日记.vercel.app`

### 2.3 验证
手机浏览器打开 Vercel URL，测试：
- [ ] 页面能正常加载
- [ ] 记录一条情绪
- [ ] 设置 → 注册账号 → 立即同步
- [ ] 提示"已同步"即成功

---

## 第三步：PWA 安装测试

1. 安卓手机 Chrome 打开 Vercel URL
2. 等页面完全加载
3. Chrome 菜单 → "添加到主屏幕"
4. 桌面出现"心灵日记"图标，点进去全屏运行

---

## 本地开发 vs 生产环境

| | 本地开发 | 生产环境 |
|---|---|---|
| 前端地址 | `localhost:8888` | `xxx.vercel.app` |
| 后端地址 | `localhost:8000` | `xxx.onrender.com` |
| 数据库 | SQLite 本地文件 | PostgreSQL (自动) |
| 开启方式 | `start-mobile.bat` | 浏览器打开 Vercel URL |

---

## 故障排查

| 问题 | 检查 |
|------|------|
| 同步失败 "网络错误" | sync.js 里的后端 URL 对不对？ |
| 注册失败 | Render 后端是否在运行？(免费层 15 分钟无请求会休眠) |
| 页面白屏 | 浏览器 F12 Console 看报错 |
| CORS 错误 | Render 环境变量 CORS_ORIGINS 是否包含 Vercel 域名？ |
