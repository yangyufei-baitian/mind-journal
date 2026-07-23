"""
数据库连接和初始化
开发环境使用 SQLite，生产环境自动切换 PostgreSQL (Render)
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# 优先使用环境变量 (Render 自动提供)，否则用本地 SQLite
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./mind_journal.db")

# SQLite 需要 check_same_thread=False，PostgreSQL 不需要
connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=False)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI 依赖注入：获取数据库会话"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """初始化数据库表"""
    Base.metadata.create_all(bind=engine)
