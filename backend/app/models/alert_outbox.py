"""
OJAS Durable Alert Event Outbox Model (Phase 10.2).
Implements a transactional outbox pattern to guarantee:
- Alert events and health records commit atomically in the same database transaction.
- Pending alerts survive application crashes and restarts.
- Confirmed delivery receipt tracking (never reports DELIVERED without delivery receipt).
- Exponential backoff retry scheduling with lease locking for concurrent recovery workers.
- Separate auditing of alert creation, delivery confirmation, human acknowledgment, and clinical sign-off.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON
from app.database.connection import Base
from app.telemetry.schemas import DeliveryState


class AlertOutboxEvent(Base):
    __tablename__ = "alert_outbox_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_id = Column(String(64), unique=True, index=True, nullable=False)
    reading_id = Column(Integer, nullable=True)
    astronaut_id = Column(String(50), index=True, nullable=False)

    severity = Column(String(20), index=True, nullable=False)  # CRITICAL, CAUTION, NORMAL
    category = Column(String(50), nullable=False)  # RESPIRATORY, CARDIOVASCULAR, COMPOUND, etc.
    title = Column(String(150), nullable=False)
    description = Column(String(500), nullable=False)
    recommended_action = Column(String(500), nullable=False)
    detection_method = Column(String(50), nullable=False)  # DETERMINISTIC_RULE, TEMPORAL_DETERIORATION, ISOLATION_FOREST
    supporting_evidence = Column(JSON, nullable=True)  # List of evidence strings

    deduplication_policy = Column(String(50), nullable=False)  # IMMEDIATE_BYPASS or 30_MIN_WINDOW
    delivery_state = Column(String(20), index=True, default="PENDING", nullable=False)  # PENDING, DELIVERED, FAILED, RETRIED
    delivery_channel = Column(String(50), default="MISSION_CONTROL_CONSOLE", nullable=False)
    delivery_receipt = Column(JSON, nullable=True)  # Receipt payload from delivery adapter
    delivery_confirmed_at = Column(DateTime(timezone=True), nullable=True)

    # Retry and Worker Concurrency Management
    retry_count = Column(Integer, default=0, nullable=False)
    max_retries = Column(Integer, default=3, nullable=False)
    next_retry_at = Column(DateTime(timezone=True), nullable=True, index=True)
    last_error = Column(String(500), nullable=True)
    locked_until = Column(DateTime(timezone=True), nullable=True, index=True)
    locked_by = Column(String(100), nullable=True)
    lease_version = Column(Integer, default=1, nullable=False)  # Fencing token for optimistic concurrency
    retry_history = Column(JSON, default=list, nullable=True)  # Structured attempt history

    # Escalation for unacknowledged / undelivered CRITICAL alerts
    is_escalated = Column(Boolean, default=False, nullable=False)
    escalated_at = Column(DateTime(timezone=True), nullable=True)
    escalation_reason = Column(String(500), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Human Flight Surgeon / Crew Acknowledgment
    is_acknowledged = Column(Boolean, default=False, nullable=False)
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    acknowledged_by = Column(String(100), nullable=True)
    acknowledged_role = Column(String(50), nullable=True)
    acknowledgment_note = Column(String(500), nullable=True)
    previous_state = Column(String(50), nullable=True)

    # Clinical Medical Sign-Off (Requires FLIGHT_SURGEON or CREW_MEDICAL_OFFICER)
    is_clinically_signed_off = Column(Boolean, default=False, nullable=False)
    clinical_signoff_at = Column(DateTime(timezone=True), nullable=True)
    signed_off_by = Column(String(100), nullable=True)
    clinical_role = Column(String(50), nullable=True)
    clinical_rationale = Column(String(500), nullable=True)
    disposition = Column(String(50), nullable=True)  # e.g., EVACUATE, GROUND_DUTY, CONTINUOUS_OBSERVATION, CLEARED
