from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, field_validator, ConfigDict


class HealthReadingBase(BaseModel):
    astronaut_id: str = Field(..., description="Unique astronaut identifier (e.g. ASTRO-01)")
    heart_rate: float = Field(..., ge=30, le=250, description="Heart rate in Beats Per Minute (BPM)")
    blood_oxygen: float = Field(..., ge=50.0, le=100.0, description="Blood oxygen saturation SpO2 (%)")
    systolic_bp: float = Field(..., ge=50, le=260, description="Systolic blood pressure (mmHg)")
    diastolic_bp: float = Field(..., ge=30, le=160, description="Diastolic blood pressure (mmHg)")
    body_temperature: float = Field(..., ge=30.0, le=45.0, description="Body temperature in Celsius (°C)")
    sleep_duration: float = Field(..., ge=0.0, le=24.0, description="Sleep duration in hours")
    sleep_quality: float = Field(..., ge=0.0, le=100.0, description="Sleep quality rating (0-100)")
    stress_level: float = Field(..., ge=0.0, le=100.0, description="Calculated stress level (0-100)")
    mood: Optional[str] = Field("Nominal", description="Subjective astronaut mood state")
    physical_activity_minutes: Optional[float] = Field(0.0, ge=0.0, description="Minutes of physical activity/EVA")
    fatigue_level: float = Field(..., ge=1.0, le=10.0, description="Fatigue rating on 1-10 scale")
    is_synthetic: bool = Field(True, description="Demonstration flag indicating synthetic sensor telemetry")
    notes: Optional[str] = Field(None, max_length=255, description="Optional telemetry notes")

    @field_validator("diastolic_bp")
    @classmethod
    def validate_bp_ratio(cls, v: float, info) -> float:
        systolic = info.data.get("systolic_bp")
        if systolic is not None and v >= systolic:
            raise ValueError("Diastolic blood pressure must be lower than systolic blood pressure")
        return v


class HealthReadingCreate(HealthReadingBase):
    timestamp: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))


class HealthReadingResponse(HealthReadingBase):
    id: int
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)


class HealthReadingSummary(BaseModel):
    astronaut_id: str
    total_readings: int
    latest_reading: Optional[HealthReadingResponse] = None
    averages: Dict[str, float] = {}
    current_status: str = "NORMAL"  # NORMAL, CAUTION, CRITICAL
    disclaimer: str = "Ojas health analysis provides synthetic astronaut self-monitoring telemetry and does not represent clinical diagnostic advice."
