import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, UniqueConstraint, Text
from app.database.connection import Base


class QuestProgress(Base):
    __tablename__ = "quest_progress"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    astronaut_id = Column(String(64), index=True, nullable=False)
    quest_id = Column(String(64), index=True, nullable=False)
    title = Column(String(128), nullable=False)
    status = Column(String(32), default="claimed", nullable=False)  # available, in_progress, claimed
    xp_awarded = Column(Integer, default=50, nullable=False)
    claimed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("astronaut_id", "quest_id", name="uq_astronaut_quest"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "astronaut_id": self.astronaut_id,
            "quest_id": self.quest_id,
            "title": self.title,
            "status": self.status,
            "xp_awarded": self.xp_awarded,
            "claimed_at": self.claimed_at.isoformat() if self.claimed_at else None,
        }


class AstronautGamificationState(Base):
    __tablename__ = "astronaut_gamification_state"

    astronaut_id = Column(String(64), primary_key=True)
    total_xp = Column(Integer, default=0, nullable=False)
    level = Column(Integer, default=1, nullable=False)
    current_streak_days = Column(Integer, default=0, nullable=False)
    unlocked_planets_json = Column(Text, default='["serenity_station"]', nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        import json
        planets = []
        try:
            planets = json.loads(self.unlocked_planets_json) if self.unlocked_planets_json else []
        except Exception:
            planets = ["serenity_station"]

        return {
            "astronaut_id": self.astronaut_id,
            "total_xp": self.total_xp,
            "level": self.level,
            "current_streak_days": self.current_streak_days,
            "unlocked_planets": planets,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
