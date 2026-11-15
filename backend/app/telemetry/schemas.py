"""
OJAS Real-Time Telemetry Stream Schemas & Data Contracts (Phase 9).
Defines:
- Stream identifiers, source identifiers, sequence numbers, and idempotency keys.
- Cryptographic and provenance metadata (SIMULATED_TELEMETRY, HARDWARE_ANALOG, FLIGHT_TELEMETRY).
- Structured packet ingestion results and audit status.
"""

from enum import Enum
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator, ConfigDict


class TelemetryProvenance(str, Enum):
    FLIGHT_TELEMETRY = "FLIGHT_TELEMETRY"
    HARDWARE_ANALOG = "HARDWARE_ANALOG"
    SIMULATED_TELEMETRY = "SIMULATED_TELEMETRY"


class PacketIngestionStatus(str, Enum):
    ACCEPTED = "ACCEPTED"
    DUPLICATE = "DUPLICATE"
    OUT_OF_ORDER_ACCEPTED = "OUT_OF_ORDER_ACCEPTED"
    REJECTED = "REJECTED"
    STALE_ACCEPTED = "STALE_ACCEPTED"


class DeliveryState(str, Enum):
    CREATED = "CREATED"
    PENDING = "PENDING"
    IN_FLIGHT = "IN_FLIGHT"
    DELIVERED = "DELIVERED"
    RETRYING = "RETRYING"
    RETRIED = "RETRIED"
    FAILED = "FAILED"
    ESCALATED = "ESCALATED"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    CLINICALLY_SIGNED_OFF = "CLINICALLY_SIGNED_OFF"


class TelemetryPacket(BaseModel):
    """
    Standard Real-Time Telemetry Packet Schema.
    Embeds stream identification, idempotency key, sequence numbers, and data provenance.
    """
    stream_id: str = Field(..., description="Unique stream identifier (e.g. STREAM-ASTRO-01-EVA-2)")
    source_id: str = Field(..., description="Sensor hardware source (e.g. bioharness_v4, wearable_wrist, simulator)")
    idempotency_key: str = Field(..., description="Unique idempotency token (UUID or packet hash)")
    sequence_num: int = Field(..., ge=0, description="Monotonically increasing packet sequence number")
    session_id: Optional[str] = Field(default="session-default-01", description="Device boot session or epoch identifier")
    provenance: TelemetryProvenance = Field(default=TelemetryProvenance.SIMULATED_TELEMETRY, description="Data origin tag")

    astronaut_id: str = Field(..., description="Unique astronaut identifier (e.g. ASTRO-01)")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Observation timestamp")

    # Core Vitals
    heart_rate: float = Field(..., description="Heart rate in Beats Per Minute (BPM)")
    blood_oxygen: float = Field(..., description="Blood oxygen saturation SpO2 (%)")
    systolic_bp: float = Field(..., description="Systolic blood pressure (mmHg)")
    diastolic_bp: float = Field(..., description="Diastolic blood pressure (mmHg)")
    body_temperature: float = Field(..., description="Body temperature in Celsius (°C)")
    sleep_duration: float = Field(..., description="Sleep duration in hours")
    sleep_quality: float = Field(..., description="Sleep quality rating (0-100)")
    stress_level: float = Field(..., description="Calculated stress level (0-100)")
    fatigue_level: float = Field(..., description="Fatigue rating on 1-10 scale")

    # Optional Contextual Fields
    mood: Optional[str] = Field("Nominal", description="Subjective astronaut mood state")
    physical_activity_minutes: Optional[float] = Field(0.0, description="Minutes of physical activity/EVA")
    notes: Optional[str] = Field(None, max_length=255, description="Telemetry context notes")

    model_config = ConfigDict(from_attributes=True)


class IngestionResult(BaseModel):
    """
    Structured outcome of telemetry gateway packet evaluation.
    Preserves rejection reason and audit metadata without silent drops.
    """
    packet_id: str
    idempotency_key: str
    stream_id: str
    astronaut_id: str
    sequence_num: int
    status: PacketIngestionStatus
    timestamp: datetime
    quality_score: float
    session_id: Optional[str] = "session-default-01"
    rejection_reason: Optional[str] = None
    warnings: List[str] = []
    is_cached_response: bool = False
    record_id: Optional[int] = None
