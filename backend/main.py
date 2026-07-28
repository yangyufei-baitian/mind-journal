"""
心灵日记 — FastAPI 后端入口

本地启动:
    uvicorn main:app --reload --host 0.0.0.0 --port 8000

生产环境 (Render):
    uvicorn main:app --host 0.0.0.0 --port $PORT

环境变量:
    DATABASE_URL  — 数据库连接串 (Render 自动提供 PostgreSQL)
    JWT_SECRET    — JWT 签名密钥 (生产环境必设)
    CORS_ORIGINS  — 允许的前端域名 (逗号分隔，默认 *)
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from database import init_db
from routes import auth, data, consent

# CORS 配置
cors_origins = os.environ.get("CORS_ORIGINS", "*")
allow_origins = [o.strip() for o in cors_origins.split(",")] if cors_origins != "*" else ["*"]

app = FastAPI(
    title="心灵日记 API",
    description="精神健康记录助手 — 后端服务。匿名用户注册、情绪/症状/日记数据上传、知情同意管理、研究员数据查询。",
    version="0.6.0",
    docs_url="/docs",
    redoc_url=None
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(data.router)
app.include_router(consent.router)


@app.on_event("startup")
def startup():
    init_db()
    print(f"[MindJournal] Backend started (DB: {os.environ.get('DATABASE_URL','SQLite')[:30]}...)")


@app.get("/health")
def health_check():
    return {"status": "ok", "app": "心灵日记", "version": "0.6.0"}


@app.get("/api")
def api_root():
    return {"message": "心灵日记 API v0.6.0", "docs": "/docs"}


# 托管前端静态文件 (同域部署: 所有未匹配 API 路由的请求回落 index.html)
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

@app.get("/")
async def serve_root():
    """Serve index.html at root."""
    idx = os.path.join(STATIC_DIR, "index.html")
    if os.path.isfile(idx):
        return FileResponse(idx)
    return {"message": "前端静态文件尚未部署。请确认 Render build 已执行 cp -r ../frontend/* static/"}


@app.get("/{full_path:path}")
async def serve_static(full_path: str):
    """Catch-all: serve requested static file, fallback to index.html for SPA routing."""
    # Don't intercept API routes — they are matched first by FastAPI routing order
    if full_path.startswith("api/") or full_path in ("health", "docs", "openapi.json"):
        from fastapi.responses import JSONResponse
        return JSONResponse({"detail": "Not Found"}, status_code=404)

    file_path = os.path.join(STATIC_DIR, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    # SPA fallback
    idx = os.path.join(STATIC_DIR, "index.html")
    if os.path.isfile(idx):
        return FileResponse(idx)
    return {"detail": "Not Found"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
