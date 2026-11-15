"""
OJAS Persistent Telemetry Idempotency Model (Phase 10.1).
Provides database-level uniqueness guarantees to survive process restarts,
prevent duplicate packet ingestion across distributed application workers,
and preserve original ingestion responses.
"""

from datetime import datetime, timezone, timedelta
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, UniqueConstraint
from app.database.connection import Base


class TelemetryIdempotencyRecord(Base):
    __tablename__ = "telemetry_idempotency_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    idempotency_key = Column(String(128), unique=True, index=True, nullable=False)
    stream_id = Column(String(100), index=True, nullable=False)
    source_id = Column(String(100), nullable=False)
    astronaut_id = Column(String(50), index=True, nullable=False)
    sequence_num = Column(Integer, nullable=False)
    session_id = Column(String(100), nullable=True)

    status = Column(String(30), nullable=False)  # ACCEPTED, DUPLICATE, OUT_OF_ORDER_ACCEPTED, REJECTED, STALE_ACCEPTED
    quality_score = Column(Float, nullable=False)
    rejection_reason = Column(String(500), nullable=True)
    warnings = Column(JSON, nullable=True)  # List of warning strings
    record_id = Column(Integer, nullable=True)  # Associated HealthRecord.id if accepted

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)

    @classmethod
    def create_expiration(cls, retention_days: int = 7) -> datetime:
        return datetime.now(timezone.utc) + timedelta(days=retention_days)
