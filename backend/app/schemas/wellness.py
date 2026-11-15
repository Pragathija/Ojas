from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class MoodCheckInCreate(BaseModel):
    mood: str = Field(..., description="Self-reported mood state (e.g. Calm, Energized, Focused, Tired, Stressed)")
    stress_level: float = Field(..., ge=0.0, le=100.0, description="Self-reported stress percentage")
    energy_level: int = Field(..., ge=1, le=5, description="Self-reported energy scale (1-5)")
    notes: Optional[str] = Field(None, max_length=500)


class MoodCheckInResponse(BaseModel):
    id: str
    astronaut_id: str
    mood: str
    stress_level: float
    energy_level: int
    notes: Optional[str]
    created_at: str


class JournalEntryCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=128)
    content: str = Field(..., min_length=1)
    is_shared_with_surgeon: bool = False


class JournalEntryResponse(BaseModel):
    id: str
    astronaut_id: str
    title: str
    content: str
    is_shared_with_surgeon: bool
    created_at: str
    updated_at: Optional[str] = None


class AIChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    history: Optional[List[dict]] = None


class AIChatResponse(BaseModel):
    reply: str
    source_context: str
    safety_notice: str
    model_used: str
    timestamp: str
