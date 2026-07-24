"""
SQLAlchemy 数据模型 v0.2
新增：时段字段、症状记录表
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    anonymous_id = Column(String(64), unique=True, nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=True)       # v0.5: 账号系统
    password_hash = Column(String(200), nullable=True)              # v0.5: 密码哈希
    created_at = Column(DateTime, default=datetime.utcnow)

    mood_records = relationship("MoodRecord", back_populates="user")
    symptom_records = relationship("SymptomRecord", back_populates="user")
    diary_records = relationship("DiaryRecord", back_populates="user")
    consent_logs = relationship("ConsentLog", back_populates="user")
    medications = relationship("UserMedication", back_populates="user")
    medication_logs = relationship("MedicationLogRecord", back_populates="user")


class MoodRecord(Base):
    """情绪记录 (v2: 增加 time_period)"""
    __tablename__ = "mood_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(String(10), nullable=False)       # "YYYY-MM-DD"
    time_period = Column(String(10), nullable=False) # "6-9", "14-18", etc.
    score = Column(Integer, nullable=False)          # 1-10
    emotion_tags = Column(JSON, default=[])           # ["开心", "焦虑", ...]
    note = Column(Text, default="")
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="mood_records")


class SymptomRecord(Base):
    """症状记录 (v2: 新增)"""
    __tablename__ = "symptom_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(String(10), nullable=False)
    time_period = Column(String(10), nullable=False)
    symptoms = Column(JSON, default=[])
    # symptoms: [{"symptom_id": "tremor", "level": "moderate", "frequency": "每天3次"}, ...]
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="symptom_records")


class DiaryRecord(Base):
    __tablename__ = "diary_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(String(10), nullable=False)
    title = Column(String(200), default="")
    content = Column(Text, default="")
    mood_at_time = Column(Integer, default=5)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="diary_records")


class ConsentLog(Base):
    __tablename__ = "consent_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    share_mood = Column(Boolean, default=False)
    share_diary = Column(Boolean, default=False)
    status = Column(String(20), default="active")
    changed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="consent_logs")


class Researcher(Base):
    __tablename__ = "researchers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(200), nullable=False)
    institution = Column(String(200), default="")
    created_at = Column(DateTime, default=datetime.utcnow)


# ==================== v0.6: 服药管理 ====================

class UserMedication(Base):
    """用户药品配置"""
    __tablename__ = "user_medications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    med_id = Column(String(50), nullable=False)         # 对应前端 medication-db.js 的 drug id
    custom_dose = Column(Float, default=0)
    dose_unit = Column(String(10), default="mg")
    pills_per_dose = Column(Float, default=1)
    frequency = Column(JSON, default={})                # {morning: bool, noon: bool, ...}
    total_pills = Column(Integer, default=28)
    start_date = Column(String(10))
    notes = Column(Text, default="")
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="medications")


class MedicationLogRecord(Base):
    """服药打卡记录"""
    __tablename__ = "medication_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    med_id = Column(String(50), nullable=False)          # 对应 medication-db.js 的 drug id
    date = Column(String(10), nullable=False)
    period = Column(String(10), nullable=False)           # morning/noon/evening/bedtime
    taken_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="medication_logs")
