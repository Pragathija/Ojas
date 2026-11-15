"""
OJAS Distributed Stream Session State Model (Phase 10.3).
Tracks device identity, session epochs, monotonic sequence progression,
sequence gaps, and counter resets across distributed workers.
Guarantees that late-arriving packets cannot overwrite newer latest-reading state.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from app.database.connection import Base


class StreamSessionState(Base):
    __tablename__ = "stream_session_states"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    stream_id = Column(String(100), unique=True, index=True, nullable=False)
    source_id = Column(String(100), nullable=False)
    session_id = Column(String(100), nullable=False)
    astronaut_id = Column(String(50), index=True, nullable=False)

    highest_sequence_num = Column(Integer, default=0, nullable=False)
    latest_reading_timestamp = Column(DateTime(timezone=True), nullable=True)
    latest_record_id = Column(Integer, nullable=True)

    total_packets_received = Column(Integer, default=0, nullable=False)
    total_gaps_detected = Column(Integer, default=0, nullable=False)
    total_resets_detected = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
