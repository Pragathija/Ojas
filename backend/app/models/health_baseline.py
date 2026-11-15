from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime
from app.database.connection import Base


class HealthBaseline(Base):
    __tablename__ = "health_baselines"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    astronaut_id = Column(String(50), unique=True, index=True, nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    sample_count = Column(Integer, default=0)

    # Statistical Averages & Standard Deviations
    heart_rate_mean = Column(Float, nullable=True)
    heart_rate_std = Column(Float, nullable=True)

    blood_oxygen_mean = Column(Float, nullable=True)
    blood_oxygen_std = Column(Float, nullable=True)

    systolic_bp_mean = Column(Float, nullable=True)
    systolic_bp_std = Column(Float, nullable=True)

    diastolic_bp_mean = Column(Float, nullable=True)
    diastolic_bp_std = Column(Float, nullable=True)

    temperature_mean = Column(Float, nullable=True)
    temperature_std = Column(Float, nullable=True)

    sleep_duration_mean = Column(Float, nullable=True)
    sleep_duration_std = Column(Float, nullable=True)

    stress_level_mean = Column(Float, nullable=True)
    stress_level_std = Column(Float, nullable=True)

    fatigue_mean = Column(Float, nullable=True)
    fatigue_std = Column(Float, nullable=True)
