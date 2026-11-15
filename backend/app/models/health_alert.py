from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.database.connection import Base


class HealthAlert(Base):
    __tablename__ = "health_alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    astronaut_id = Column(String(50), index=True, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True, nullable=False)

    severity = Column(String(20), nullable=False)            # NORMAL, CAUTION, CRITICAL
    category = Column(String(50), nullable=False)            # e.g., CARDIOVASCULAR, RESPIRATORY, SLEEP_DEBT
    title = Column(String(150), nullable=False)
    description = Column(String(500), nullable=False)
    recommended_action = Column(String(500), nullable=False)

    is_acknowledged = Column(Boolean, default=False, nullable=False)
    acknowledged_at = Column(DateTime, nullable=True)
    acknowledged_by = Column(String(100), nullable=True)
