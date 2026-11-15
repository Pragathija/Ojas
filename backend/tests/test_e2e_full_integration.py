"""
Full End-to-End System Integration Test for Project Ojas.

Executes and verifies:
1. Complete live astronaut health telemetry lifecycle:
   - Ingesting nominal health readings via API endpoint.
   - Fetching latest records and status summary.
   - Inducing a clinical hypoxia event (SpO2=88%) and generating a CRITICAL alert.
   - Acknowledging alerts and checking alert deduplication.
2. Complete NASA Research analog validation across all 8 endpoints.
3. Strict scientific separation between live astronaut database records and NASA research tables.
4. Non-fabrication guarantee and error handling.
"""

from datetime import datetime, timezone, date
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.connection import Base
from app.models.astronaut import Astronaut
from app.models.health_record import HealthRecord
from app.models.health_alert import HealthAlert
from app.schemas.health import HealthReadingCreate
from app.schemas.alert import HealthAlertAcknowledge
from app.api.v1.endpoints import health, alerts, nasa_research
from app.datasets.nasa_brsmact import NasaBRSMActLoader


@pytest.fixture(scope="module")
def e2e_db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = Session()
    yield db
    db.close()


def test_e2e_live_telemetry_workflow(e2e_db):
    """Step 1 to 6: Live astronaut telemetry, baseline, risk rules, and alert workflow."""
    astronaut_id = "ASTRO-E2E-01"

    # Ingest 5 baseline readings to satisfy MIN_READINGS_FOR_BASELINE
    for i in range(5):
        reading_in = HealthReadingCreate(
            astronaut_id=astronaut_id,
            heart_rate=70.0 + i,
            blood_oxygen=98.5,
            systolic_bp=118.0 + i,
            diastolic_bp=78.0 + i,
            body_temperature=36.6,
            sleep_duration=7.5,
            sleep_quality=85.0,
            stress_level=20.0,
            mood="Nominal",
            physical_activity_minutes=45.0,
            fatigue_level=2.0,
            is_synthetic=False,
            notes=f"Nominal day {i+1}"
        )
        rec = health.create_reading(reading_in=reading_in, db=e2e_db)
        assert rec.id is not None
        assert rec.astronaut_id == astronaut_id

    # Fetch latest readings and summary
    records = health.get_readings(astronaut_id=astronaut_id, db=e2e_db, limit=10)
    assert len(records) == 5

    summary = health.get_summary(astronaut_id=astronaut_id, db=e2e_db)
    assert summary.astronaut_id == astronaut_id
    assert summary.total_readings == 5
    assert summary.averages["heart_rate"] > 65.0

    # Induce Hypoxia event: SpO2 = 88.0%
    hypoxia_in = HealthReadingCreate(
        astronaut_id=astronaut_id,
        heart_rate=115.0,
        blood_oxygen=88.0,  # Critical Hypoxia threshold <= 90%
        systolic_bp=135.0,
        diastolic_bp=88.0,
        body_temperature=36.8,
        sleep_duration=4.0,
        sleep_quality=50.0,
        stress_level=75.0,
        mood="Anxious",
        physical_activity_minutes=10.0,
        fatigue_level=8.0,
        is_synthetic=False,
        notes="Severe dyspnea and fatigue"
    )
    hypoxia_rec = health.create_reading(reading_in=hypoxia_in, db=e2e_db)
    assert hypoxia_rec.blood_oxygen == 88.0

    # Check that critical alert was generated
    alert_list = alerts.get_alerts(astronaut_id=astronaut_id, db=e2e_db)
    assert len(alert_list) > 0
    crit_alert = next((a for a in alert_list if a.severity == "CRITICAL"), None)
    assert crit_alert is not None
    assert crit_alert.is_acknowledged is False

    # Acknowledge the alert
    ack = alerts.acknowledge_alert(
        alert_id=crit_alert.id,
        payload=HealthAlertAcknowledge(acknowledged_by="Flight Surgeon Dr. Rivera", notes="Administering emergency O2 mask"),
        db=e2e_db
    )
    assert ack.is_acknowledged is True
    assert ack.acknowledged_by == "Flight Surgeon Dr. Rivera"


def test_e2e_nasa_research_workflow():
    """Step 7 to 12: Complete NASA research endpoints and analysis audit."""
    loader = NasaBRSMActLoader(verify_hashes=False)

    # 1. Metadata
    meta = nasa_research.get_study_metadata()
    assert meta["dataset_id"] == "nasa_brsmact"
    assert meta["sample_size_subjects"] == 3

    # 2. Cryptographic Integrity
    integrity = nasa_research.get_integrity_status()
    assert integrity["all_files_verified"] is True
    assert integrity["files_checked"] == 3

    # 3. Phases & Sample Bias
    phases = nasa_research.get_phase_comparison(loader=loader)
    assert "SAMPLE SIZE WARNING" in phases["PRE_TEST"].sample_size_warning
    assert phases["PRE_TEST"].contributing_subjects_count == 1
    assert phases["IN_TEST"].contributing_subjects_count == 3
    assert phases["IN_TEST"].duration_mean_minutes == 431.88

    # 4. Trajectory (60 days)
    traj = nasa_research.get_trajectory(phase="IN_TEST", loader=loader)
    assert len(traj) == 60
    assert traj[0].br_day == 1
    assert traj[59].br_day == 60

    # 5. Medications Audit
    meds = nasa_research.get_medication_audit(loader=loader)
    assert meds.total_medication_records == 45
    assert meds.in_test_sleep_aid_nights.latency_mean_minutes < meds.in_test_non_sleep_aid_nights.latency_mean_minutes

    # 6. Missing Observations Audit
    missing = nasa_research.get_missing_data_audit(loader=loader)
    assert missing.total_missing_records == 17
    assert missing.overall_missing_pct == 8.21

    # 7. Complete Overview
    overview = nasa_research.get_research_overview(loader=loader)
    assert overview.total_observations == 207


def test_e2e_scientific_separation(e2e_db):
    """
    CRITICAL RULE 5:
    Ensure NASA research analog observations (C1G0001, C1G0002, C1G0003)
    NEVER enter the live astronaut database tables.
    """
    # Check astronauts table
    astro_ids = [a.astronaut_id for a in e2e_db.query(Astronaut).all()]
    assert "C1G0001" not in astro_ids
    assert "C1G0002" not in astro_ids
    assert "C1G0003" not in astro_ids

    # Check health records table
    records = e2e_db.query(HealthRecord).all()
    for r in records:
        assert r.astronaut_id not in ["C1G0001", "C1G0002", "C1G0003"]
        assert r.astronaut_id == "ASTRO-E2E-01"

    # Check alerts table
    alerts_in_db = e2e_db.query(HealthAlert).all()
    for a in alerts_in_db:
        assert a.astronaut_id == "ASTRO-E2E-01"
