from typing import List, Optional
from pydantic import BaseModel, Field


class QuestClaimRequest(BaseModel):
    quest_id: str = Field(..., min_length=2, max_length=64)
    title: str = Field(..., min_length=2, max_length=128)
    xp_reward: int = Field(default=50, ge=10, le=500)


class UnlockPlanetRequest(BaseModel):
    planet_id: str = Field(..., min_length=2, max_length=64)


class GamificationStateResponse(BaseModel):
    astronaut_id: str
    total_xp: int
    level: int
    current_streak_days: int
    unlocked_planets: List[str]
    claimed_quests: List[dict]
    unlocked_achievements: List[dict]
