"""
Pydantic 模型 v0.2 — 新增症状、时段字段
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# ==================== 用户 ====================
class UserCreate(BaseModel):
    anonymous_id: str

# v0.5: 账号系统
class UserRegister(BaseModel):
    username: str = Field(..., min_length=2, max_length=20, pattern=r"^[一-龥a-zA-Z0-9_]+$")
    password: str = Field(..., min_length=4, max_length=100)
    anonymous_id: str  # 绑定已有本地数据

class UserLogin(BaseModel):
    username: str
    password: str

class AuthResponse(BaseModel):
    token: str
    username: str
    anonymous_id: str

class UserResponse(BaseModel):
    id: int
    anonymous_id: str
    created_at: datetime
    class Config: from_attributes = True


# ==================== 情绪记录 ====================
class MoodRecordCreate(BaseModel):
    anonymous_id: str
    date: str
    time_period: str = Field(..., description="时段: 0-6, 6-9, 9-12, 12-14, 14-18, 18-22, 22-24")
    score: int = Field(..., ge=1, le=10)
    emotion_tags: List[str] = Field(default=[])
    note: str = Field(default="")

class MoodRecordResponse(BaseModel):
    id: int
    user_id: int
    date: str
    time_period: str
    score: int
    emotion_tags: List[str]
    note: str
    uploaded_at: datetime
    class Config: from_attributes = True


# ==================== 症状条目 ====================
class SymptomItem(BaseModel):
    symptom_id: str
    level: str               # mild / moderate / severe
    frequency: Optional[str] = None  # 频率描述 (如 "每天3次")

class SymptomRecordCreate(BaseModel):
    anonymous_id: str
    date: str
    time_period: str
    symptoms: List[SymptomItem] = Field(default=[])

class SymptomRecordResponse(BaseModel):
    id: int
    user_id: int
    date: str
    time_period: str
    symptoms: List[dict]
    uploaded_at: datetime
    class Config: from_attributes = True


# ==================== 日记 ====================
class DiaryRecordCreate(BaseModel):
    anonymous_id: str
    date: str
    title: str = ""
    content: str = ""
    mood_at_time: int = Field(default=5, ge=1, le=10)

class DiaryRecordResponse(BaseModel):
    id: int
    user_id: int
    date: str
    title: str
    content: str
    mood_at_time: int
    uploaded_at: datetime
    class Config: from_attributes = True


# ==================== 知情同意 ====================
class ConsentUpdate(BaseModel):
    anonymous_id: str
    share_mood: bool = False
    share_diary: bool = False
    status: str = Field(default="active")

class ConsentResponse(BaseModel):
    id: int
    user_id: int
    share_mood: bool
    share_diary: bool
    status: str
    changed_at: Optional[datetime] = None
    class Config: from_attributes = True


# ==================== 研究员 ====================
class ResearcherCreate(BaseModel):
    username: str
    password: str
    institution: str = ""

class ResearcherLogin(BaseModel):
    username: str
    password: str

# ==================== v0.6: 服药管理 ====================

class MedicationConfigCreate(BaseModel):
    anonymous_id: str
    med_id: str
    custom_dose: float = 0
    dose_unit: str = "mg"
    pills_per_dose: float = 1
    frequency: dict = {}
    total_pills: int = 28
    start_date: str = ""
    notes: str = ""

class MedicationConfigResponse(BaseModel):
    id: int
    user_id: int
    med_id: str
    custom_dose: float
    dose_unit: str
    pills_per_dose: float
    frequency: dict
    total_pills: int
    start_date: str
    notes: str
    uploaded_at: datetime
    class Config: from_attributes = True

class MedicationLogCreate(BaseModel):
    anonymous_id: str
    med_id: str
    date: str
    period: str

class MedicationLogResponse(BaseModel):
    id: int
    user_id: int
    med_id: str
    date: str
    period: str
    taken_at: datetime
    class Config: from_attributes = True


class MessageResponse(BaseModel):
    message: str
    detail: Optional[str] = None


# ==================== v0.7: 临床量表评估 ====================

class ScaleAssessmentCreate(BaseModel):
    anonymous_id: str
    scale_type: str
    date: str
    answers: List[int] = Field(default=[])
    total_score: int
    severity_label: str = ""

class ScaleAssessmentResponse(BaseModel):
    id: int
    user_id: int
    date: str
    scale_type: str
    answers: List[int]
    total_score: int
    severity_label: str
    uploaded_at: datetime
    class Config: from_attributes = True
