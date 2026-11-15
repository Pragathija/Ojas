import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, UniqueConstraint
from app.database.connection import Base


class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    astronaut_id = Column(String(64), index=True, nullable=False)
    achievement_id = Column(String(64), index=True, nullable=False)
    title = Column(String(128), nullable=False)
    category = Column(String(64), nullable=False)
    xp_awarded = Column(Integer, default=100, nullable=False)
    unlocked_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("astronaut_id", "achievement_id", name="uq_astronaut_achievement"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "astronaut_id": self.astronaut_id,
            "achievement_id": self.achievement_id,
            "title": self.title,
            "category": self.category,
            "xp_awarded": self.xp_awarded,
            "unlocked_at": self.unlocked_at.isoformat() if self.unlocked_at else None,
        }
