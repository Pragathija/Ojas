from typing import Optional
from pydantic import BaseModel, Field


class MissionCreateRequest(BaseModel):
    code: str = Field(..., min_length=2, max_length=32)
    name: str = Field(..., min_length=2, max_length=128)
    phase: str = Field(default="Transit", max_length=64)
    day_number: int = Field(default=1, ge=1)
    total_days: int = Field(default=180, ge=1)
    description: Optional[str] = None


class MissionResponse(BaseModel):
    id: str
    code: str
    name: str
    phase: str
    day_number: int
    total_days: int
    status: str
    description: Optional[str]
    is_active: bool
    created_at: str
