import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text
from app.database.connection import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    actor_id = Column(String(64), index=True, nullable=False)
    actor_role = Column(String(32), nullable=False)
    action = Column(String(64), index=True, nullable=False)  # LOGIN, VIEW_TELEMETRY, ACK_ALERT, UPDATE_MISSION
    target_resource = Column(String(128), nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String(64), nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "actor_id": self.actor_id,
            "actor_role": self.actor_role,
            "action": self.action,
            "target_resource": self.target_resource,
            "details": self.details,
            "ip_address": self.ip_address,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }
