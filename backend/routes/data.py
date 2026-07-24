"""
数据路由 v0.2 — 情绪(含时段) + 症状记录 + 研究查询
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, MoodRecord, SymptomRecord, DiaryRecord, ConsentLog, UserMedication, MedicationLogRecord, ScaleAssessment
from schemas import (
    MoodRecordCreate, MoodRecordResponse,
    SymptomRecordCreate, SymptomRecordResponse,
    DiaryRecordCreate, DiaryRecordResponse,
    MedicationConfigCreate, MedicationConfigResponse,
    MedicationLogCreate, MedicationLogResponse,
    ScaleAssessmentCreate, ScaleAssessmentResponse,
    MessageResponse
)

router = APIRouter(prefix="/api", tags=["数据"])


def get_user_by_anonymous_id(db: Session, anonymous_id: str) -> User:
    user = db.query(User).filter(User.anonymous_id == anonymous_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户未注册")
    return user


# ==================== 情绪记录 ====================

@router.post("/mood", response_model=MessageResponse)
def upload_mood_record(data: MoodRecordCreate, db: Session = Depends(get_db)):
    """上传/更新一条情绪记录（同一日期+时段会更新而非覆盖不同时段）"""
    user = get_user_by_anonymous_id(db, data.anonymous_id)

    existing = db.query(MoodRecord).filter(
        MoodRecord.user_id == user.id,
        MoodRecord.date == data.date,
        MoodRecord.time_period == data.time_period
    ).first()

    if existing:
        existing.score = data.score
        existing.emotion_tags = data.emotion_tags
        existing.note = data.note
        db.commit()
        return MessageResponse(message="记录已更新", detail=f"{data.date} {data.time_period}")

    record = MoodRecord(
        user_id=user.id,
        date=data.date,
        time_period=data.time_period,
        score=data.score,
        emotion_tags=data.emotion_tags,
        note=data.note
    )
    db.add(record)
    db.commit()
    return MessageResponse(message="记录已上传", detail=f"{data.date} {data.time_period}")


@router.get("/mood/{anonymous_id}", response_model=List[MoodRecordResponse])
def get_mood_records(
    anonymous_id: str,
    days: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    user = get_user_by_anonymous_id(db, anonymous_id)
    records = db.query(MoodRecord).filter(
        MoodRecord.user_id == user.id
    ).order_by(MoodRecord.date.desc(), MoodRecord.time_period).limit(days * 7).all()
    return records


# ==================== 症状记录 ====================

@router.post("/symptom", response_model=MessageResponse)
def upload_symptom_record(data: SymptomRecordCreate, db: Session = Depends(get_db)):
    """上传/更新症状记录"""
    user = get_user_by_anonymous_id(db, data.anonymous_id)

    existing = db.query(SymptomRecord).filter(
        SymptomRecord.user_id == user.id,
        SymptomRecord.date == data.date,
        SymptomRecord.time_period == data.time_period
    ).first()

    symptom_data = [s.model_dump() for s in data.symptoms]

    if existing:
        existing.symptoms = symptom_data
        db.commit()
        return MessageResponse(message="症状记录已更新", detail=f"{data.date} {data.time_period}")

    record = SymptomRecord(
        user_id=user.id,
        date=data.date,
        time_period=data.time_period,
        symptoms=symptom_data
    )
    db.add(record)
    db.commit()
    return MessageResponse(message="症状记录已上传", detail=f"{data.date} {data.time_period}")


@router.get("/symptom/{anonymous_id}", response_model=List[SymptomRecordResponse])
def get_symptom_records(
    anonymous_id: str,
    days: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    user = get_user_by_anonymous_id(db, anonymous_id)
    records = db.query(SymptomRecord).filter(
        SymptomRecord.user_id == user.id
    ).order_by(SymptomRecord.date.desc()).limit(days * 7).all()
    return records


# ==================== 日记 ====================

@router.post("/diary", response_model=MessageResponse)
def upload_diary_record(data: DiaryRecordCreate, db: Session = Depends(get_db)):
    user = get_user_by_anonymous_id(db, data.anonymous_id)
    record = DiaryRecord(
        user_id=user.id, date=data.date, title=data.title,
        content=data.content, mood_at_time=data.mood_at_time
    )
    db.add(record)
    db.commit()
    return MessageResponse(message="日记已上传", detail=data.date)


@router.get("/diary/{anonymous_id}", response_model=List[DiaryRecordResponse])
def get_diary_records(
    anonymous_id: str,
    days: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    user = get_user_by_anonymous_id(db, anonymous_id)
    records = db.query(DiaryRecord).filter(
        DiaryRecord.user_id == user.id
    ).order_by(DiaryRecord.date.desc()).limit(days * 5).all()
    return records


# ==================== v0.6: 服药管理 ====================

@router.post("/medication/config", response_model=MessageResponse)
def upload_medication_config(data: MedicationConfigCreate, db: Session = Depends(get_db)):
    """上传/更新药品配置（同一 med_id 会更新）"""
    user = get_user_by_anonymous_id(db, data.anonymous_id)

    existing = db.query(UserMedication).filter(
        UserMedication.user_id == user.id,
        UserMedication.med_id == data.med_id
    ).first()

    if existing:
        existing.custom_dose = data.custom_dose
        existing.dose_unit = data.dose_unit
        existing.pills_per_dose = data.pills_per_dose
        existing.frequency = data.frequency
        existing.total_pills = data.total_pills
        existing.start_date = data.start_date
        existing.notes = data.notes
        db.commit()
        return MessageResponse(message="药品配置已更新", detail=data.med_id)

    record = UserMedication(
        user_id=user.id,
        med_id=data.med_id,
        custom_dose=data.custom_dose,
        dose_unit=data.dose_unit,
        pills_per_dose=data.pills_per_dose,
        frequency=data.frequency,
        total_pills=data.total_pills,
        start_date=data.start_date,
        notes=data.notes
    )
    db.add(record)
    db.commit()
    return MessageResponse(message="药品配置已上传", detail=data.med_id)


@router.get("/medication/config/{anonymous_id}", response_model=List[MedicationConfigResponse])
def get_medication_configs(anonymous_id: str, db: Session = Depends(get_db)):
    """获取用户所有药品配置"""
    user = get_user_by_anonymous_id(db, anonymous_id)
    records = db.query(UserMedication).filter(
        UserMedication.user_id == user.id
    ).all()
    return records


@router.delete("/medication/config/{anonymous_id}/{med_id}", response_model=MessageResponse)
def delete_medication_config(anonymous_id: str, med_id: str, db: Session = Depends(get_db)):
    """删除药品配置及关联的打卡记录"""
    user = get_user_by_anonymous_id(db, anonymous_id)
    db.query(UserMedication).filter(
        UserMedication.user_id == user.id,
        UserMedication.med_id == med_id
    ).delete()
    db.query(MedicationLogRecord).filter(
        MedicationLogRecord.user_id == user.id,
        MedicationLogRecord.med_id == med_id
    ).delete()
    db.commit()
    return MessageResponse(message="已删除", detail=med_id)


@router.post("/medication/log", response_model=MessageResponse)
def upload_medication_log(data: MedicationLogCreate, db: Session = Depends(get_db)):
    """上传服药打卡记录（同一 med_id+date+period 去重）"""
    user = get_user_by_anonymous_id(db, data.anonymous_id)

    existing = db.query(MedicationLogRecord).filter(
        MedicationLogRecord.user_id == user.id,
        MedicationLogRecord.med_id == data.med_id,
        MedicationLogRecord.date == data.date,
        MedicationLogRecord.period == data.period
    ).first()

    if existing:
        return MessageResponse(message="已存在", detail=f"{data.med_id} {data.date} {data.period}")

    record = MedicationLogRecord(
        user_id=user.id,
        med_id=data.med_id,
        date=data.date,
        period=data.period
    )
    db.add(record)
    db.commit()
    return MessageResponse(message="打卡已上传", detail=f"{data.med_id} {data.date} {data.period}")


@router.get("/medication/log/{anonymous_id}", response_model=List[MedicationLogResponse])
def get_medication_logs(
    anonymous_id: str,
    days: int = Query(default=90, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """获取用户服药打卡记录"""
    user = get_user_by_anonymous_id(db, anonymous_id)
    records = db.query(MedicationLogRecord).filter(
        MedicationLogRecord.user_id == user.id
    ).order_by(MedicationLogRecord.date.desc()).limit(days * 10).all()
    return records


# ==================== v0.7: 临床量表评估 ====================

@router.post("/scale", response_model=MessageResponse)
def upload_scale_assessment(data: ScaleAssessmentCreate, db: Session = Depends(get_db)):
    """上传/更新量表评估（同一日期+量表类型会更新）"""
    user = get_user_by_anonymous_id(db, data.anonymous_id)

    existing = db.query(ScaleAssessment).filter(
        ScaleAssessment.user_id == user.id,
        ScaleAssessment.date == data.date,
        ScaleAssessment.scale_type == data.scale_type
    ).first()

    if existing:
        existing.answers = data.answers
        existing.total_score = data.total_score
        existing.severity_label = data.severity_label
        db.commit()
        return MessageResponse(message="评估已更新", detail=f"{data.scale_type} {data.date}")

    record = ScaleAssessment(
        user_id=user.id,
        date=data.date,
        scale_type=data.scale_type,
        answers=data.answers,
        total_score=data.total_score,
        severity_label=data.severity_label
    )
    db.add(record)
    db.commit()
    return MessageResponse(message="评估已上传", detail=f"{data.scale_type} {data.date}")


@router.get("/scale/{anonymous_id}", response_model=List[ScaleAssessmentResponse])
def get_scale_assessments(
    anonymous_id: str,
    days: int = Query(default=90, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """获取用户量表评估历史"""
    user = get_user_by_anonymous_id(db, anonymous_id)
    records = db.query(ScaleAssessment).filter(
        ScaleAssessment.user_id == user.id
    ).order_by(ScaleAssessment.date.desc()).limit(days).all()
    return records


# ==================== 研究员数据查询 ====================

@router.get("/research/moods", response_model=List[MoodRecordResponse])
def research_get_moods(
    db: Session = Depends(get_db),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000)
):
    consented_users = db.query(ConsentLog.user_id).filter(
        ConsentLog.share_mood == True, ConsentLog.status == "active"
    ).distinct().all()
    consented_user_ids = [u[0] for u in consented_users]
    if not consented_user_ids:
        return []

    records = db.query(MoodRecord).filter(
        MoodRecord.user_id.in_(consented_user_ids)
    ).order_by(MoodRecord.date.desc()).offset(skip).limit(limit).all()
    return records


@router.get("/research/symptoms", response_model=List[SymptomRecordResponse])
def research_get_symptoms(
    db: Session = Depends(get_db),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000)
):
    """研究员查询所有已授权的症状记录"""
    consented_users = db.query(ConsentLog.user_id).filter(
        ConsentLog.share_mood == True, ConsentLog.status == "active"
    ).distinct().all()
    consented_user_ids = [u[0] for u in consented_users]
    if not consented_user_ids:
        return []

    records = db.query(SymptomRecord).filter(
        SymptomRecord.user_id.in_(consented_user_ids)
    ).order_by(SymptomRecord.date.desc()).offset(skip).limit(limit).all()
    return records


@router.get("/research/diaries", response_model=List[DiaryRecordResponse])
def research_get_diaries(
    db: Session = Depends(get_db),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000)
):
    consented_users = db.query(ConsentLog.user_id).filter(
        ConsentLog.share_diary == True, ConsentLog.status == "active"
    ).distinct().all()
    consented_user_ids = [u[0] for u in consented_users]
    if not consented_user_ids:
        return []

    records = db.query(DiaryRecord).filter(
        DiaryRecord.user_id.in_(consented_user_ids)
    ).order_by(DiaryRecord.date.desc()).offset(skip).limit(limit).all()
    return records


@router.get("/research/stats")
def research_get_stats(db: Session = Depends(get_db)):
    consented_mood_users = db.query(ConsentLog.user_id).filter(
        ConsentLog.share_mood == True, ConsentLog.status == "active"
    ).distinct().count()

    consented_diary_users = db.query(ConsentLog.user_id).filter(
        ConsentLog.share_diary == True, ConsentLog.status == "active"
    ).distinct().count()

    return {
        "consented_mood_users": consented_mood_users,
        "consented_diary_users": consented_diary_users,
        "total_mood_records": db.query(MoodRecord).count(),
        "total_symptom_records": db.query(SymptomRecord).count(),
        "total_diary_records": db.query(DiaryRecord).count(),
        "total_medication_configs": db.query(UserMedication).count(),
        "total_medication_logs": db.query(MedicationLogRecord).count(),
        "total_scale_assessments": db.query(ScaleAssessment).count()
    }


# ==================== v0.6: 研究员 — 服药数据 ====================

@router.get("/research/medication/configs", response_model=List[MedicationConfigResponse])
def research_get_medication_configs(
    db: Session = Depends(get_db),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000)
):
    """研究员查询所有已授权的药品配置"""
    consented_users = db.query(ConsentLog.user_id).filter(
        ConsentLog.share_mood == True, ConsentLog.status == "active"
    ).distinct().all()
    consented_user_ids = [u[0] for u in consented_users]
    if not consented_user_ids:
        return []

    records = db.query(UserMedication).filter(
        UserMedication.user_id.in_(consented_user_ids)
    ).order_by(UserMedication.user_id).offset(skip).limit(limit).all()
    return records


@router.get("/research/medication/logs", response_model=List[MedicationLogResponse])
def research_get_medication_logs(
    db: Session = Depends(get_db),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000)
):
    """研究员查询所有已授权的服药打卡记录"""
    consented_users = db.query(ConsentLog.user_id).filter(
        ConsentLog.share_mood == True, ConsentLog.status == "active"
    ).distinct().all()
    consented_user_ids = [u[0] for u in consented_users]
    if not consented_user_ids:
        return []

    records = db.query(MedicationLogRecord).filter(
        MedicationLogRecord.user_id.in_(consented_user_ids)
    ).order_by(MedicationLogRecord.date.desc()).offset(skip).limit(limit).all()
    return records
