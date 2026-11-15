from typing import Literal
from pydantic import BaseModel, Field, ConfigDict

class Finding(BaseModel):
    code: Literal['sleep_decline', 'activity_decline', 'stress_increase', 'unusual_heart_rate', 'persistent_fatigue']
    detail: str = Field(default='', max_length=500)

class HealthInput(BaseModel):
    model_config = ConfigDict(extra='forbid')
    astronaut_id: str = Field(min_length=1, max_length=80)
    sleep_hours: float | None = Field(default=None, ge=0, le=24)
    baseline_sleep_hours: float | None = Field(default=None, gt=0, le=24)
    stress_level: int | None = Field(default=None, ge=0, le=10)
    activity_status: Literal['low', 'normal', 'high'] | None = None
    fatigue: bool = False
    dizziness: bool = False
    chest_pain: bool = False
    unusual_heart_rate: bool = False
    findings: list[Finding] = Field(default_factory=list, max_length=30)

class TaskUpdate(BaseModel):
    status: Literal['pending', 'completed']
