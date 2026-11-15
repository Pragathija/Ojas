from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from app.database.connection import Base


class HealthRecord(Base):
    __tablename__ = "health_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    astronaut_id = Column(String(50), index=True, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True, nullable=False)

    # 10 Tracked Metrics
    heart_rate = Column(Float, nullable=False)               # BPM
    blood_oxygen = Column(Float, nullable=False)             # SpO2 (%)
    systolic_bp = Column(Float, nullable=False)              # mmHg
    diastolic_bp = Column(Float, nullable=False)             # mmHg
    body_temperature = Column(Float, nullable=False)         # °C
    sleep_duration = Column(Float, nullable=False)           # Hours
    sleep_quality = Column(Float, nullable=False)            # 1 - 100 score
    stress_level = Column(Float, nullable=False)             # 1 - 100 score
    mood = Column(String(50), default="Nominal")             # Descriptive state
    physical_activity_minutes = Column(Float, default=0.0)   # Minutes active
    fatigue_level = Column(Float, nullable=False)            # 1 - 10 scale

    # Audit & Compliance Flags
    is_synthetic = Column(Boolean, default=True)             # Labeled synthetic demonstration data
    notes = Column(String(255), nullable=True)
