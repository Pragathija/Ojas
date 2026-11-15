import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, Boolean
from app.database.connection import Base


class MoodCheckIn(Base):
    __tablename__ = "mood_check_ins"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    astronaut_id = Column(String(64), index=True, nullable=False)
    mood = Column(String(32), nullable=False)  # Calm, Energized, Focused, Tired, Stressed (text only, NO emoji!)
    stress_level = Column(Float, nullable=False, default=20.0)  # 0 to 100
    energy_level = Column(Integer, nullable=False, default=3)   # 1 to 5
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "astronaut_id": self.astronaut_id,
            "mood": self.mood,
            "stress_level": self.stress_level,
            "energy_level": self.energy_level,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class PrivateJournal(Base):
    __tablename__ = "private_journals"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    astronaut_id = Column(String(64), index=True, nullable=False)
    title = Column(String(128), nullable=False)
    content = Column(Text, nullable=False)
    is_shared_with_surgeon = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "astronaut_id": self.astronaut_id,
            "title": self.title,
            "content": self.content,
            "is_shared_with_surgeon": self.is_shared_with_surgeon,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class AIChatHistory(Base):
    __tablename__ = "ai_chat_history"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    astronaut_id = Column(String(64), index=True, nullable=False)
    role = Column(String(16), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    provenance_tag = Column(String(64), default="SELF_REPORTED_WELLNESS", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "astronaut_id": self.astronaut_id,
            "role": self.role,
            "content": self.content,
            "provenance_tag": self.provenance_tag,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
