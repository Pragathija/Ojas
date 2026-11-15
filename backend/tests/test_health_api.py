import pytest
from datetime import datetime, timezone
from fastapi import HTTPException
from pydantic import ValidationError
from app.api.v1.endpoints import health, analysis, alerts
from app.schemas.health import HealthReadingCreate
from app.schemas.analysis import AnalysisRunRequest
from app.schemas.alert import HealthAlertAcknowledge
from app.main import health_check


def test_system_health_check():
    res = health_check()
    assert res["status"] == "healthy"
    assert "version" in res
    assert "database" in res


def test_create_valid_reading(db):
    payload = HealthReadingCreate(
        astronaut_id="TEST-ASTRO-01",
        heart_rate=72.0,
        blood_oxygen=98.5,
        systolic_bp=120.0,
        diastolic_bp=80.0,
        body_temperature=36.6,
        sleep_duration=7.5,
        sleep_quality=88.0,
        stress_level=25.0,
        mood="Nominal",
        physical_activity_minutes=45.0,
        fatigue_level=2.0,
        is_synthetic=True,
        notes="Unit test telemetry"
    )

    result = health.create_reading(reading_in=payload, db=db)
    assert result.id is not None
    assert result.astronaut_id == "TEST-ASTRO-01"
    assert result.heart_rate == 72.0


def test_validation_diastolic_greater_than_systolic():
    with pytest.raises(ValidationError) as exc:
        HealthReadingCreate(
            astronaut_id="TEST-ASTRO-01",
            heart_rate=72.0,
            blood_oxygen=98.5,
            systolic_bp=110.0,
            diastolic_bp=130.0,  # Invalid: diastolic >= systolic
            body_temperature=36.6,
            sleep_duration=7.5,
            sleep_quality=88.0,
            stress_level=25.0,
            fatigue_level=2.0
        )
    assert "Diastolic blood pressure must be lower than systolic" in str(exc.value)


def test_validation_out_of_range_spo2():
    with pytest.raises(ValidationError):
        HealthReadingCreate(
            astronaut_id="TEST-ASTRO-01",
            heart_rate=72.0,
            blood_oxygen=105.0,  # Invalid: SpO2 > 100%
            systolic_bp=120.0,
            diastolic_bp=80.0,
            body_temperature=36.6,
            sleep_duration=7.5,
            sleep_quality=88.0,
            stress_level=25.0,
            fatigue_level=2.0
        )


def test_get_readings_and_latest(db):
    for hr in [70.0, 75.0]:
        payload = HealthReadingCreate(
            astronaut_id="TEST-ASTRO-02",
            heart_rate=hr,
            blood_oxygen=98.0,
            systolic_bp=120.0,
            diastolic_bp=80.0,
            body_temperature=36.6,
            sleep_duration=7.0,
            sleep_quality=85.0,
            stress_level=20.0,
            fatigue_level=2.0
        )
        health.create_reading(reading_in=payload, db=db)

    # List readings
    readings = health.get_readings(astronaut_id="TEST-ASTRO-02", limit=50, offset=0, db=db)
    assert len(readings) == 2

    # Latest reading
    latest = health.get_latest_reading(astronaut_id="TEST-ASTRO-02", db=db)
    assert latest.heart_rate == 75.0


def test_get_summary(db):
    for hr in [70.0, 80.0]:
        payload = HealthReadingCreate(
            astronaut_id="TEST-ASTRO-03",
            heart_rate=hr,
            blood_oxygen=98.0,
            systolic_bp=120.0,
            diastolic_bp=80.0,
            body_temperature=36.6,
            sleep_duration=7.0,
            sleep_quality=85.0,
            stress_level=20.0,
            fatigue_level=2.0
        )
        health.create_reading(reading_in=payload, db=db)

    summary = health.get_summary(astronaut_id="TEST-ASTRO-03", db=db)
    assert summary.astronaut_id == "TEST-ASTRO-03"
    assert summary.total_readings == 2
    assert summary.averages["heart_rate"] == 75.0


def test_analysis_endpoints(db):
    # Ingest a reading first
    payload = HealthReadingCreate(
        astronaut_id="TEST-ASTRO-ANALYSIS",
        heart_rate=72.0,
        blood_oxygen=98.5,
        systolic_bp=120.0,
        diastolic_bp=80.0,
        body_temperature=36.6,
        sleep_duration=7.5,
        sleep_quality=88.0,
        stress_level=25.0,
        fatigue_level=2.0
    )
    health.create_reading(reading_in=payload, db=db)

    # Run analysis
    req = AnalysisRunRequest(astronaut_id="TEST-ASTRO-ANALYSIS")
    res = analysis.run_analysis(request=req, db=db)
    assert res.overall_status in ["NORMAL", "CAUTION", "CRITICAL"]

    # Latest analysis
    latest_analysis = analysis.get_latest_analysis(astronaut_id="TEST-ASTRO-ANALYSIS", db=db)
    assert latest_analysis.astronaut_id == "TEST-ASTRO-ANALYSIS"

    # History
    history = analysis.get_analysis_history(astronaut_id="TEST-ASTRO-ANALYSIS", limit=10, db=db)
    assert len(history) >= 1
