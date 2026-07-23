"""
用户认证路由 — 匿名用户注册 / 账号登录 / 研究员登录
"""

import os
import hashlib
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import jwt

from database import get_db
from models import User, Researcher
from schemas import (
    UserCreate, UserRegister, UserLogin, AuthResponse,
    ResearcherCreate, ResearcherLogin, MessageResponse
)

router = APIRouter(prefix="/api", tags=["认证"])

# JWT 密钥：生产环境必须通过环境变量设置
SECRET_KEY = os.environ.get("JWT_SECRET", "mind-journal-dev-secret-change-in-production")
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    """SHA256 + salt"""
    salt = "mind-journal-salt"
    return hashlib.sha256((password + salt).encode()).hexdigest()


def create_token(data: dict, expires_delta: timedelta = timedelta(days=365)):
    """生成 JWT token"""
    to_encode = data.copy()
    to_encode.update({"exp": datetime.utcnow() + expires_delta})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/register", response_model=dict)
def register_user(data: UserCreate, db: Session = Depends(get_db)):
    """注册/获取匿名用户。anonymous_id 已存在则返回已有 token。"""
    user = db.query(User).filter(User.anonymous_id == data.anonymous_id).first()

    if user:
        token = create_token({"sub": str(user.id), "anonymous_id": user.anonymous_id})
        return {"token": token, "anonymous_id": user.anonymous_id, "is_new": False}

    user = User(anonymous_id=data.anonymous_id)
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_token({"sub": str(user.id), "anonymous_id": user.anonymous_id})
    return {"token": token, "anonymous_id": user.anonymous_id, "is_new": True}


@router.post("/account/register", response_model=AuthResponse)
def account_register(data: UserRegister, db: Session = Depends(get_db)):
    """注册账号：绑定用户名+密码到已有匿名用户"""
    existing = db.query(User).filter(User.username == data.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="用户名已被注册")

    user = db.query(User).filter(User.anonymous_id == data.anonymous_id).first()
    if user:
        if user.username:
            raise HTTPException(status_code=400, detail="该设备已绑定账号，请登录")
        user.username = data.username
        user.password_hash = hash_password(data.password)
    else:
        user = User(
            anonymous_id=data.anonymous_id,
            username=data.username,
            password_hash=hash_password(data.password)
        )
        db.add(user)

    db.commit()
    db.refresh(user)

    token = create_token({
        "sub": str(user.id),
        "anonymous_id": user.anonymous_id,
        "username": user.username
    })
    return AuthResponse(token=token, username=user.username, anonymous_id=user.anonymous_id)


@router.post("/account/login", response_model=AuthResponse)
def account_login(data: UserLogin, db: Session = Depends(get_db)):
    """账号登录"""
    user = db.query(User).filter(User.username == data.username).first()
    if not user or user.password_hash != hash_password(data.password):
        raise HTTPException(status_code=401, detail="用户名或密码错误")

    token = create_token({
        "sub": str(user.id),
        "anonymous_id": user.anonymous_id,
        "username": user.username
    })
    return AuthResponse(token=token, username=user.username, anonymous_id=user.anonymous_id)


@router.post("/researcher/register", response_model=MessageResponse)
def register_researcher(data: ResearcherCreate, db: Session = Depends(get_db)):
    """注册研究员账号"""
    existing = db.query(Researcher).filter(Researcher.username == data.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="用户名已存在")

    researcher = Researcher(
        username=data.username,
        password_hash=hash_password(data.password),
        institution=data.institution
    )
    db.add(researcher)
    db.commit()
    return MessageResponse(message="研究员账号已创建", detail=data.username)


@router.post("/researcher/login", response_model=dict)
def login_researcher(data: ResearcherLogin, db: Session = Depends(get_db)):
    """研究员登录，返回 JWT token (24h 有效)"""
    researcher = db.query(Researcher).filter(Researcher.username == data.username).first()
    if not researcher or researcher.password_hash != hash_password(data.password):
        raise HTTPException(status_code=401, detail="用户名或密码错误")

    token = create_token(
        {"sub": str(researcher.id), "role": "researcher", "username": researcher.username},
        timedelta(hours=24)
    )
    return {
        "token": token,
        "username": researcher.username,
        "institution": researcher.institution
    }
