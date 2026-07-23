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
from database import init_db
from routes import auth, data, consent

# CORS 配置
cors_origins = os.environ.get("CORS_ORIGINS", "*")
allow_origins = [o.strip() for o in cors_origins.split(",")] if cors_origins != "*" else ["*"]

app = FastAPI(
    title="心灵日记 API",
    description="精神健康记录助手 — 后端服务。匿名用户注册、情绪/症状/日记数据上传、知情同意管理、研究员数据查询。",
    version="0.5.0",
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
    return {"status": "ok", "app": "心灵日记", "version": "0.5.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
