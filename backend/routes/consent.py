"""
知情同意管理路由
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, ConsentLog
from schemas import ConsentUpdate, ConsentResponse, MessageResponse

router = APIRouter(prefix="/api", tags=["知情同意"])


def get_user_by_anonymous_id(db: Session, anonymous_id: str) -> User:
    """根据匿名 ID 查找用户"""
    user = db.query(User).filter(User.anonymous_id == anonymous_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户未注册，请先调用 /api/register")
    return user


@router.post("/consent", response_model=MessageResponse)
def update_consent(data: ConsentUpdate, db: Session = Depends(get_db)):
    """
    更新用户的知情同意设置。
    每次变更都会记录到 consent_logs 表中，形成完整的审计轨迹。
    """
    user = get_user_by_anonymous_id(db, data.anonymous_id)

    # 将之前的 active 记录标记为 revoked
    db.query(ConsentLog).filter(
        ConsentLog.user_id == user.id,
        ConsentLog.status == "active"
    ).update({"status": "revoked"})

    # 创建新的同意记录
    log = ConsentLog(
        user_id=user.id,
        share_mood=data.share_mood,
        share_diary=data.share_diary,
        status=data.status
    )
    db.add(log)
    db.commit()

    parts = []
    if data.share_mood:
        parts.append("情绪记录")
    if data.share_diary:
        parts.append("日记")

    if data.status == "revoked":
        return MessageResponse(message="数据共享已撤回", detail="所有数据共享已停止")

    if parts:
        return MessageResponse(message=f"已开启共享: {', '.join(parts)}")
    else:
        return MessageResponse(message="数据共享已关闭")


@router.get("/consent/{anonymous_id}", response_model=ConsentResponse)
def get_consent_status(anonymous_id: str, db: Session = Depends(get_db)):
    """获取用户当前的知情同意状态"""
    user = get_user_by_anonymous_id(db, anonymous_id)

    # 获取最新的 active 记录
    log = db.query(ConsentLog).filter(
        ConsentLog.user_id == user.id,
        ConsentLog.status == "active"
    ).order_by(ConsentLog.changed_at.desc()).first()

    if not log:
        # 返回默认的"未同意"状态
        return ConsentResponse(
            id=0,
            user_id=user.id,
            share_mood=False,
            share_diary=False,
            status="none"
        )

    return ConsentResponse.model_validate(log)


@router.get("/consent/{anonymous_id}/history", response_model=list[ConsentResponse])
def get_consent_history(anonymous_id: str, db: Session = Depends(get_db)):
    """获取用户的知情同意变更历史（完整审计轨迹）"""
    user = get_user_by_anonymous_id(db, anonymous_id)
    logs = db.query(ConsentLog).filter(
        ConsentLog.user_id == user.id
    ).order_by(ConsentLog.changed_at.desc()).all()

    return [ConsentResponse.model_validate(log) for log in logs]
