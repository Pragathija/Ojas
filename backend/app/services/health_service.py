from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
import numpy as np
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.astronaut import Astronaut
from app.models.health_record import HealthRecord
from app.models.analysis_result import AnalysisResult
from app.schemas.health import HealthReadingCreate, HealthReadingSummary, HealthReadingResponse
from app.health_engine.validation import validate_physiological_ranges
from app.services.analysis_service import run_health_analysis


def ensure_astronaut_exists(db: Session, astronaut_id: str):
    """Auto-creates an astronaut record if not existing yet."""
    astro = db.query(Astronaut).filter(Astronaut.astronaut_id == astronaut_id).first()
    if not astro:
        astro = Astronaut(
            astronaut_id=astronaut_id,
            name=f"Astronaut {astronaut_id}",
            role="Mission Specialist",
            mission_day=1
        )
        db.add(astro)
        db.commit()
        db.refresh(astro)
    return astro


def create_health_reading(db: Session, reading_in: HealthReadingCreate) -> HealthRecord:
    """
    Validates and stores a new health reading, ensures astronaut profile,
    and runs the explainable health analysis pipeline.
    """
    reading_dict = reading_in.model_dump()
    is_valid, validation_errors = validate_physiological_ranges(reading_dict)
    if not is_valid:
        raise HTTPException(
            status_code=422,
            detail={"message": "Physiological boundary validation failed", "errors": validation_errors}
        )

    ensure_astronaut_exists(db, reading_in.astronaut_id)

    timestamp = reading_in.timestamp or datetime.now(timezone.utc)

    record = HealthRecord(
        astronaut_id=reading_in.astronaut_id,
        timestamp=timestamp,
        heart_rate=reading_in.heart_rate,
        blood_oxygen=reading_in.blood_oxygen,
        systolic_bp=reading_in.systolic_bp,
        diastolic_bp=reading_in.diastolic_bp,
        body_temperature=reading_in.body_temperature,
        sleep_duration=reading_in.sleep_duration,
        sleep_quality=reading_in.sleep_quality,
        stress_level=reading_in.stress_level,
        mood=reading_in.mood or "Nominal",
        physical_activity_minutes=reading_in.physical_activity_minutes or 0.0,
        fatigue_level=reading_in.fatigue_level,
        is_synthetic=reading_in.is_synthetic,
        notes=reading_in.notes
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    # Automatically run analysis and evaluate alerts
    try:
        run_health_analysis(db, astronaut_id=reading_in.astronaut_id, reading_id=record.id)
    except Exception as e:
        # Don't fail ingestion if analysis hits an unexpected non-fatal issue
        pass

    return record


def get_health_readings(
    db: Session,
    astronaut_id: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
) -> List[HealthRecord]:
    """Retrieve historical health readings with optional astronaut filter and pagination."""
    query = db.query(HealthRecord)
    if astronaut_id:
        query = query.filter(HealthRecord.astronaut_id == astronaut_id)
    return query.order_by(HealthRecord.timestamp.desc()).offset(offset).limit(limit).all()


def get_latest_health_reading(db: Session, astronaut_id: str) -> Optional[HealthRecord]:
    """Retrieve the most recent health reading for an astronaut."""
    return (
        db.query(HealthRecord)
        .filter(HealthRecord.astronaut_id == astronaut_id)
        .order_by(HealthRecord.timestamp.desc())
        .first()
    )


def get_health_summary(db: Session, astronaut_id: str) -> HealthReadingSummary:
    """Generate overall health metrics summary, averages, and current status."""
    readings = (
        db.query(HealthRecord)
        .filter(HealthRecord.astronaut_id == astronaut_id)
        .order_by(HealthRecord.timestamp.desc())
        .all()
    )

    if not readings:
        return HealthReadingSummary(
            astronaut_id=astronaut_id,
            total_readings=0,
            latest_reading=None,
            averages={},
            current_status="NORMAL"
        )

    latest = readings[0]

    # Calculate rolling averages
    averages = {
        "heart_rate": round(float(np.mean([r.heart_rate for r in readings])), 1),
        "blood_oxygen": round(float(np.mean([r.blood_oxygen for r in readings])), 1),
        "systolic_bp": round(float(np.mean([r.systolic_bp for r in readings])), 1),
        "diastolic_bp": round(float(np.mean([r.diastolic_bp for r in readings])), 1),
        "body_temperature": round(float(np.mean([r.body_temperature for r in readings])), 2),
        "sleep_duration": round(float(np.mean([r.sleep_duration for r in readings])), 1),
        "sleep_quality": round(float(np.mean([r.sleep_quality for r in readings])), 1),
        "stress_level": round(float(np.mean([r.stress_level for r in readings])), 1),
        "fatigue_level": round(float(np.mean([r.fatigue_level for r in readings])), 1),
    }

    # Fetch latest analysis overall status if available
    latest_analysis = (
        db.query(AnalysisResult)
        .filter(AnalysisResult.astronaut_id == astronaut_id)
        .order_by(AnalysisResult.timestamp.desc())
        .first()
    )

    current_status = latest_analysis.overall_status if latest_analysis else "NORMAL"

    return HealthReadingSummary(
        astronaut_id=astronaut_id,
        total_readings=len(readings),
        latest_reading=HealthReadingResponse.model_validate(latest),
        averages=averages,
        current_status=current_status
    )
