import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Text, Boolean
from app.database.connection import Base


class Mission(Base):
    __tablename__ = "missions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(32), unique=True, index=True, nullable=False)  # e.g., ARTEMIS-V
    name = Column(String(128), nullable=False)                         # Artemis V - Gateway & Deep Space Habitat
    phase = Column(String(64), nullable=False, default="Transit")      # Transit, Orbital Operations, Surface Extravehicular
    day_number = Column(Integer, default=42, nullable=False)
    total_days = Column(Integer, default=180, nullable=False)
    status = Column(String(32), default="Active", nullable=False)      # Active, Completed, Planned
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "code": self.code,
            "name": self.name,
            "phase": self.phase,
            "day_number": self.day_number,
            "total_days": self.total_days,
            "status": self.status,
            "description": self.description,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
