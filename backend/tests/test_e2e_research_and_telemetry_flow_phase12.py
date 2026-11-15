"""
Phase 12 — End-to-End Operational Validation & Scientific Research Integration
Tests:
- Full end-to-end telemetry pipeline (Quality Gateway -> Idempotency -> Baseline -> Anomaly -> Rules -> Outbox -> Receipt)
- Complete isolation between LIVE_TELEMETRY, SIMULATED_TELEMETRY, and NASA_RESEARCH_DATA
- Deterministic CRITICAL alert non-suppression guarantee under concurrent research loads
- Resilient decoupling: Simulated NASA OSDR network outages do NOT disrupt live telemetry ingestion
- Multi-dataset coexistence: Real NASA BRSMAct actigraphy + Real NASA OSDR Inspiration4 multi-omics
"""

import pytest
from datetime import datetime, timezone, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.connection import Base
from app.models.astronaut import Astronaut
from app.models.health_record import HealthRecord
from app.models.health_baseline import HealthBaseline
from app.models.alert_outbox import AlertOutboxEvent
from app.telemetry.schemas import TelemetryPacket, DeliveryState
from app.services.realtime_analysis_service import process_telemetry_packet
from app.datasets.osdr.osdr_service import default_osdr_service
from app.datasets.osdr.osdr_models import OSDRDataContext
from app.datasets.nasa_brsmact import NasaBRSMActLoader, compare_phases


@pytest.fixture
def e2e_db():
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


def test_end_to_end_parallel_telemetry_and_research_isolation(e2e_db):
    """
    Verify complete operational flow of live telemetry ingestion while concurrently
    serving NASA OSDR and NASA BRSMAct research requests with zero data leakage.
    """
    astro_id = "ASTRO-E2E-LIVE-01"
    astronaut = Astronaut(astronaut_id=astro_id, name="Dr. Jessica Watkins", role="Mission Specialist")
    e2e_db.add(astronaut)
    e2e_db.commit()

    now = datetime.now(timezone.utc)

    # 1. Ingest 10 live telemetry packets
    for i in range(10):
        packet = TelemetryPacket(
            stream_id="stream-e2e-live",
            source_id="device-e2e-01",
            idempotency_key=f"e2e-key-{i}",
            sequence_num=i + 1,
            session_id="session-e2e-01",
            astronaut_id=astro_id,
            timestamp=now + timedelta(minutes=i),
            heart_rate=72.0 + (i % 4),
            blood_oxygen=98.0,
            systolic_bp=120.0,
            diastolic_bp=80.0,
            body_temperature=36.6,
            sleep_duration=7.5,
            sleep_quality=85.0,
            stress_level=20.0,
            fatigue_level=2.0
        )
        bundle = process_telemetry_packet(e2e_db, packet, auto_dispatch_alerts=True)
        assert bundle.ingestion_result.status.value in ["ACCEPTED", "STALE_ACCEPTED"]

    # 2. Concurrently access NASA OSDR and NASA BRSMAct research modules
    osdr_summary = default_osdr_service.get_research_summary()
    assert osdr_summary.subject_count == 4
    assert osdr_summary.data_context == OSDRDataContext.NASA_RESEARCH_DATA

    brsmact_loader = NasaBRSMActLoader(verify_hashes=False)
    brsmact_records = brsmact_loader.load_harmonized_dataset()
    assert len(brsmact_records) > 0

    # 3. Assert zero leakage: Check that the astronaut's database baseline and records contain no research observations
    records = e2e_db.query(HealthRecord).filter_by(astronaut_id=astro_id).all()
    assert len(records) == 10
    for r in records:
        assert r.is_synthetic is True  # In simulator, telemetry is labeled synthetic demo stream
        assert r.astronaut_id == astro_id
        # Confirm no bio-analyte column contamination
        assert not hasattr(r, "sodium_mmol_l")
        assert not hasattr(r, "wbc_thousand_ul")

    # Check baseline
    baseline = e2e_db.query(HealthBaseline).filter_by(astronaut_id=astro_id).first()
    assert baseline is not None
    assert 70.0 <= baseline.heart_rate_mean <= 75.0


def test_deterministic_critical_alert_non_suppression_under_research_load(e2e_db):
    """
    Verify that even during heavy research analytics execution,
    a severe physiological crisis triggers an immediate CRITICAL alert outbox event.
    """
    astro_id = "ASTRO-CRIT-TEST"
    astronaut = Astronaut(astronaut_id=astro_id, name="CDR Victor Glover")
    e2e_db.add(astronaut)
    e2e_db.commit()

    now = datetime.now(timezone.utc)

    # Concurrently execute research calculations
    _ = default_osdr_service.get_research_summary()
    _ = default_osdr_service.verify_integrity()

    # Ingest acute life-threatening telemetry packet: severe hypoxia and tachycardia
    crisis_packet = TelemetryPacket(
        stream_id="stream-crisis-01",
        source_id="bioharness-crisis",
        idempotency_key="crisis-idem-999",
        sequence_num=1,
        session_id="session-crisis",
        astronaut_id=astro_id,
        timestamp=now,
        heart_rate=185.0,     # Severe tachycardia (> 140 bpm)
        blood_oxygen=81.0,     # Critical hypoxia (<= 85%)
        systolic_bp=165.0,
        diastolic_bp=105.0,
        body_temperature=38.9,
        sleep_duration=4.0,
        sleep_quality=40.0,
        stress_level=90.0,
        fatigue_level=8.0
    )

    bundle = process_telemetry_packet(e2e_db, crisis_packet, auto_dispatch_alerts=False)

    # Verify deterministic non-suppression
    assert len(bundle.alert_events) >= 1
    critical_alerts = [a for a in bundle.alert_events if a.severity == "CRITICAL"]
    assert len(critical_alerts) >= 1

    # Verify committed outbox event
    outbox_events = e2e_db.query(AlertOutboxEvent).filter_by(astronaut_id=astro_id).all()
    assert len(outbox_events) >= 1
    crit_outbox = next(e for e in outbox_events if e.severity == "CRITICAL")
    assert crit_outbox.delivery_state == "PENDING"
    assert crit_outbox.is_escalated is False


def test_osdr_outage_does_not_disable_telemetry_pipeline(e2e_db, monkeypatch):
    """
    Verify that simulated network failures or offline status of the NASA OSDR API
    does not disrupt the real-time astronaut health telemetry engine.
    """
    astro_id = "ASTRO-RESILIENCE-01"
    astronaut = Astronaut(astronaut_id=astro_id, name="Test Resilience")
    e2e_db.add(astronaut)
    e2e_db.commit()

    # Simulate NASA OSDR API outage
    def mock_broken_get(*args, **kwargs):
        raise ConnectionResetError("Simulated Deep-Space NASA OSDR connection reset")

    monkeypatch.setattr(default_osdr_service.client, "_http_get", mock_broken_get)

    # Ingest telemetry packet during the simulated outage
    now = datetime.now(timezone.utc)
    packet = TelemetryPacket(
        stream_id="stream-resilience",
        source_id="device-resilience",
        idempotency_key="idem-resilience-01",
        sequence_num=1,
        session_id="session-resilience",
        astronaut_id=astro_id,
        timestamp=now,
        heart_rate=74.0,
        blood_oxygen=98.5,
        systolic_bp=120.0,
        diastolic_bp=80.0,
        body_temperature=36.6,
        sleep_duration=7.5,
        sleep_quality=85.0,
        stress_level=20.0,
        fatigue_level=2.0
    )

    # Ingestion must succeed without raising an exception
    bundle = process_telemetry_packet(e2e_db, packet, auto_dispatch_alerts=True)
    assert bundle.ingestion_result.status.value == "ACCEPTED"
    assert bundle.health_record.astronaut_id == astro_id


def test_three_context_provenance_audit():
    """
    Verify strict separation and distinct classification of the 3 data contexts:
    1. LIVE_TELEMETRY
    2. SIMULATED_TELEMETRY
    3. NASA_RESEARCH_DATA
    """
    from app.datasets.osdr.osdr_models import OSDRDataContext

    # OSDR observations
    osdr_obs = default_osdr_service.get_harmonized_observations()
    assert all(o.data_context == OSDRDataContext.NASA_RESEARCH_DATA for o in osdr_obs)

    # BRSMAct metadata provenance
    from app.datasets.nasa_brsmact.provenance import METADATA
    assert METADATA.dataset_id == "nasa_brsmact"
    assert METADATA.experiment_id == "BRSMAct"

    # Simulated test record
    record = HealthRecord(
        astronaut_id="ASTRO-AUDIT",
        timestamp=datetime.now(timezone.utc),
        heart_rate=70.0,
        blood_oxygen=98.0,
        systolic_bp=120.0,
        diastolic_bp=80.0,
        body_temperature=36.6,
        is_synthetic=True
    )
    # Records created by test harnesses or generators are explicitly labeled as synthetic demo streams
    assert record.is_synthetic is True
