"""
OJAS Phase 9 Test Suite: Real-Time Telemetry & AI Orchestration.
Validates:
1. Stream ingestion and multi-stage Data Quality Gateway validation.
2. Idempotent duplicate packet detection and suppression without database pollution.
3. Out-of-order sequence detection and graceful handling.
4. Future drift rejection (>2h) and stale reading tagging (>72h).
5. Physically impossible physiological measurement rejection and rejection logging.
6. Stream interruption and recovery (>4h gap rate-of-change suppression).
7. Per-astronaut data isolation and baseline non-contamination.
8. End-to-end real-time AI orchestration with model governance audit trail.
9. ML outage resilience and critical physiological alert non-suppression.
10. Event-driven alert lifecycle, confirmed delivery receipts, and retry logic.
11. Stream simulator fidelity and strict SIMULATED_TELEMETRY data provenance.
"""

from datetime import datetime, timezone, timedelta
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import patch

from app.database.connection import Base
from app.models.astronaut import Astronaut
from app.models.health_record import HealthRecord
from app.models.health_alert import HealthAlert
from app.models.analysis_result import AnalysisResult
from app.telemetry.schemas import (
    TelemetryPacket,
    IngestionResult,
    PacketIngestionStatus,
    DeliveryState,
    TelemetryProvenance,
)
from app.telemetry.quality_gateway import DataQualityGateway, default_quality_gateway
from app.telemetry.alert_events import AlertEventManager, AlertEvent, default_alert_manager
from app.telemetry.stream_simulator import StreamSimulator
from app.services.realtime_analysis_service import (
    process_telemetry_packet,
    RealTimeOrchestrationBundle,
)
from app.health_engine.risk_rules import RuleEvaluationResult
from app.ml.temporal_analysis import analyze_vital_trend


@pytest.fixture
def test_db():
    """Provides an isolated in-memory SQLite database session."""
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(autouse=True)
def clean_telemetry_state():
    """Cleans in-memory caches before and after each test."""
    default_quality_gateway.clear_cache()
    default_alert_manager.clear()
    yield
    default_quality_gateway.clear_cache()
    default_alert_manager.clear()


def test_stream_ingestion_and_quality_gateway(test_db):
    """Verifies that a valid telemetry packet is accepted with quality_score = 1.0."""
    now = datetime.now(timezone.utc)
    packet = TelemetryPacket(
        stream_id="STREAM-TEST-01",
        source_id="bioharness_v4",
        idempotency_key="idemp-test-01",
        sequence_num=1,
        provenance=TelemetryProvenance.SIMULATED_TELEMETRY,
        astronaut_id="ASTRO-01",
        timestamp=now,
        heart_rate=72.0,
        blood_oxygen=98.5,
        systolic_bp=120.0,
        diastolic_bp=80.0,
        body_temperature=36.6,
        sleep_duration=7.5,
        sleep_quality=85.0,
        stress_level=20.0,
        fatigue_level=2.0,
        mood="Nominal",
        physical_activity_minutes=30.0,
    )

    bundle = process_telemetry_packet(test_db, packet)
    assert bundle.ingestion_result.status == PacketIngestionStatus.ACCEPTED
    assert bundle.ingestion_result.quality_score == 1.0
    assert bundle.health_record is not None
    assert bundle.health_record.heart_rate == 72.0
    assert bundle.analysis_result is not None
    assert bundle.overall_status == "NORMAL"


def test_idempotency_and_duplicate_suppression(test_db):
    """Verifies that duplicate packets return cached result and do not create duplicate DB records."""
    now = datetime.now(timezone.utc)
    packet = TelemetryPacket(
        stream_id="STREAM-DUP-01",
        source_id="bioharness_v4",
        idempotency_key="idemp-duplicate-token-123",
        sequence_num=1,
        provenance=TelemetryProvenance.SIMULATED_TELEMETRY,
        astronaut_id="ASTRO-DUP",
        timestamp=now,
        heart_rate=70.0,
        blood_oxygen=98.0,
        systolic_bp=118.0,
        diastolic_bp=78.0,
        body_temperature=36.5,
        sleep_duration=8.0,
        sleep_quality=90.0,
        stress_level=15.0,
        fatigue_level=1.0,
    )

    bundle1 = process_telemetry_packet(test_db, packet)
    assert bundle1.ingestion_result.status == PacketIngestionStatus.ACCEPTED
    assert bundle1.health_record is not None
    orig_record_id = bundle1.health_record.id

    # Ingest the exact same packet with the same idempotency_key
    bundle2 = process_telemetry_packet(test_db, packet)
    assert bundle2.ingestion_result.status == PacketIngestionStatus.DUPLICATE
    assert bundle2.ingestion_result.is_cached_response is True
    assert bundle2.ingestion_result.record_id == orig_record_id
    assert bundle2.health_record is None

    # Verify database has strictly 1 record for this astronaut
    db_records = test_db.query(HealthRecord).filter(HealthRecord.astronaut_id == "ASTRO-DUP").all()
    assert len(db_records) == 1


def test_out_of_order_packet_sequencing(test_db):
    """Verifies out-of-order sequence detection."""
    now = datetime.now(timezone.utc)
    pkt_seq5 = TelemetryPacket(
        stream_id="STREAM-SEQ-01",
        source_id="bioharness_v4",
        idempotency_key="idemp-seq-5",
        sequence_num=5,
        provenance=TelemetryProvenance.SIMULATED_TELEMETRY,
        astronaut_id="ASTRO-SEQ",
        timestamp=now,
        heart_rate=72.0,
        blood_oxygen=98.0,
        systolic_bp=120.0,
        diastolic_bp=80.0,
        body_temperature=36.6,
        sleep_duration=7.0,
        sleep_quality=80.0,
        stress_level=20.0,
        fatigue_level=2.0,
    )
    bundle5 = process_telemetry_packet(test_db, pkt_seq5)
    assert bundle5.ingestion_result.status == PacketIngestionStatus.ACCEPTED

    # Packet with older sequence_num (3) arrives after sequence 5
    pkt_seq3 = TelemetryPacket(
        stream_id="STREAM-SEQ-01",
        source_id="bioharness_v4",
        idempotency_key="idemp-seq-3",
        sequence_num=3,
        provenance=TelemetryProvenance.SIMULATED_TELEMETRY,
        astronaut_id="ASTRO-SEQ",
        timestamp=now - timedelta(minutes=10),
        heart_rate=71.0,
        blood_oxygen=98.2,
        systolic_bp=120.0,
        diastolic_bp=80.0,
        body_temperature=36.6,
        sleep_duration=7.0,
        sleep_quality=80.0,
        stress_level=20.0,
        fatigue_level=2.0,
    )
    bundle3 = process_telemetry_packet(test_db, pkt_seq3)
    assert bundle3.ingestion_result.status == PacketIngestionStatus.OUT_OF_ORDER_ACCEPTED
    assert any("out of sequence" in w for w in bundle3.ingestion_result.warnings)


def test_timestamp_validation_and_rejection(test_db):
    """Verifies rejection of packets >2h in future and tagging of packets >72h stale."""
    now = datetime.now(timezone.utc)

    # Future packet (>2h)
    future_pkt = TelemetryPacket(
        stream_id="STREAM-TIME-01",
        source_id="bioharness_v4",
        idempotency_key="idemp-future-01",
        sequence_num=1,
        provenance=TelemetryProvenance.SIMULATED_TELEMETRY,
        astronaut_id="ASTRO-TIME",
        timestamp=now + timedelta(hours=3),
        heart_rate=72.0,
        blood_oxygen=98.0,
        systolic_bp=120.0,
        diastolic_bp=80.0,
        body_temperature=36.6,
        sleep_duration=7.0,
        sleep_quality=80.0,
        stress_level=20.0,
        fatigue_level=2.0,
    )
    bundle_future = process_telemetry_packet(test_db, future_pkt)
    assert bundle_future.ingestion_result.status == PacketIngestionStatus.REJECTED
    assert "in the future exceeds" in bundle_future.ingestion_result.rejection_reason
    assert bundle_future.health_record is None

    # Stale packet (>72h)
    stale_pkt = TelemetryPacket(
        stream_id="STREAM-TIME-02",
        source_id="bioharness_v4",
        idempotency_key="idemp-stale-01",
        sequence_num=1,
        provenance=TelemetryProvenance.SIMULATED_TELEMETRY,
        astronaut_id="ASTRO-TIME",
        timestamp=now - timedelta(hours=80),
        heart_rate=72.0,
        blood_oxygen=98.0,
        systolic_bp=120.0,
        diastolic_bp=80.0,
        body_temperature=36.6,
        sleep_duration=7.0,
        sleep_quality=80.0,
        stress_level=20.0,
        fatigue_level=2.0,
    )
    bundle_stale = process_telemetry_packet(test_db, stale_pkt)
    assert bundle_stale.ingestion_result.status == PacketIngestionStatus.STALE_ACCEPTED
    assert any("Stale telemetry" in w for w in bundle_stale.ingestion_result.warnings)
    assert bundle_stale.health_record is not None


def test_impossible_physiological_rejection(test_db):
    """Verifies that impossible physiological measurements are rejected with auditable reasons."""
    now = datetime.now(timezone.utc)

    # Diastolic >= Systolic (hemodynamic impossibility)
    hemo_pkt = TelemetryPacket(
        stream_id="STREAM-HEMO-01",
        source_id="bioharness_v4",
        idempotency_key="idemp-hemo-01",
        sequence_num=1,
        provenance=TelemetryProvenance.SIMULATED_TELEMETRY,
        astronaut_id="ASTRO-INVALID",
        timestamp=now,
        heart_rate=75.0,
        blood_oxygen=98.0,
        systolic_bp=80.0,
        diastolic_bp=120.0,  # Impossible: diastolic > systolic
        body_temperature=36.6,
        sleep_duration=7.0,
        sleep_quality=80.0,
        stress_level=20.0,
        fatigue_level=2.0,
    )
    bundle_hemo = process_telemetry_packet(test_db, hemo_pkt)
    assert bundle_hemo.ingestion_result.status == PacketIngestionStatus.REJECTED
    assert "Hemodynamic impossibility" in bundle_hemo.ingestion_result.rejection_reason
    assert bundle_hemo.health_record is None

    # Check rejection audit log
    rejections = default_quality_gateway.get_rejection_log()
    assert len(rejections) >= 1
    assert any("Hemodynamic impossibility" in r["rejection_reason"] for r in rejections)


def test_stream_interruption_and_recovery():
    """Verifies that a gap > 4 hours suppresses false continuous rate-of-change derivatives."""
    now = datetime.now(timezone.utc)
    t1 = now - timedelta(hours=6)
    t2 = now

    r1 = HealthRecord(astronaut_id="ASTRO-GAP", timestamp=t1, blood_oxygen=98.0)
    r2 = HealthRecord(astronaut_id="ASTRO-GAP", timestamp=t2, blood_oxygen=90.0)

    # 6-hour gap between readings
    trend = analyze_vital_trend([r1, r2], "blood_oxygen")
    assert trend["observation_gap_hours"] == 6.0
    # continuous rate of change must be suppressed
    assert trend["rate_of_change_per_hour"] is None

    # Continuous observation (gap <= 4 hours, e.g. 1 hour)
    t3 = now - timedelta(hours=1)
    r3 = HealthRecord(astronaut_id="ASTRO-CONT", timestamp=t3, blood_oxygen=98.0)
    r4 = HealthRecord(astronaut_id="ASTRO-CONT", timestamp=now, blood_oxygen=94.0)

    trend_cont = analyze_vital_trend([r3, r4], "blood_oxygen")
    assert trend_cont["observation_gap_hours"] == 1.0
    assert trend_cont["rate_of_change_per_hour"] == -4.0


def test_astronaut_data_isolation(test_db):
    """Verifies that multiple concurrent astronaut streams maintain strict baseline and alert isolation."""
    sim = StreamSimulator(random_seed=101)
    p1 = sim.generate_nominal_stream(astronaut_id="CREW-ALICE", count=3)
    p2 = sim.generate_hypoxia_progression_stream(astronaut_id="CREW-BOB", count=3)

    for pkt in p1:
        b = process_telemetry_packet(test_db, pkt)
        assert b.health_record.astronaut_id == "CREW-ALICE"
        assert b.overall_status == "NORMAL"

    for pkt in p2:
        b = process_telemetry_packet(test_db, pkt)
        assert b.health_record.astronaut_id == "CREW-BOB"

    # Alice's baseline records must contain strictly Alice's readings
    alice_records = test_db.query(HealthRecord).filter(HealthRecord.astronaut_id == "CREW-ALICE").all()
    bob_records = test_db.query(HealthRecord).filter(HealthRecord.astronaut_id == "CREW-BOB").all()
    assert len(alice_records) == 3
    assert len(bob_records) == 3
    assert all(r.astronaut_id == "CREW-ALICE" for r in alice_records)
    assert all(r.astronaut_id == "CREW-BOB" for r in bob_records)


def test_realtime_ai_orchestration(test_db):
    """Verifies full orchestration pipeline with active model registry, risk rules, and audit trail."""
    sim = StreamSimulator(random_seed=42)
    packets = sim.generate_nominal_stream(astronaut_id="ASTRO-ORCH", count=5)

    last_bundle = None
    for pkt in packets:
        last_bundle = process_telemetry_packet(test_db, pkt)

    assert last_bundle is not None
    assert last_bundle.analysis_result is not None
    deviations = last_bundle.analysis_result.baseline_deviations

    # Verify diagnostic cards, temporal trajectory, uncertainty, and model governance
    assert "_diagnostic_cards" in deviations
    assert "_temporal_trajectory" in deviations
    assert "_uncertainty" in deviations
    assert "_model_governance" in deviations

    gov = deviations["_model_governance"]
    assert gov["astronaut_id"] == "ASTRO-ORCH"
    assert gov["ml_operational_state"] == "HEALTHY"
    assert gov["algorithm"] == "IsolationForest"
    assert gov["preprocessing_version"] == "RobustMedianIQR-v2"


def test_ml_outage_resilience(test_db):
    """CRITICAL SAFETY INVARIANT: Verifies ML failure does not crash pipeline and cannot suppress critical alerts."""
    now = datetime.now(timezone.utc)
    critical_pkt = TelemetryPacket(
        stream_id="STREAM-CRIT-01",
        source_id="bioharness_v4",
        idempotency_key="idemp-crit-fault-01",
        sequence_num=1,
        provenance=TelemetryProvenance.SIMULATED_TELEMETRY,
        astronaut_id="ASTRO-CRIT",
        timestamp=now,
        heart_rate=125.0,
        blood_oxygen=84.0,  # Severe hypoxia (CRITICAL)
        systolic_bp=145.0,
        diastolic_bp=95.0,
        body_temperature=36.7,
        sleep_duration=5.0,
        sleep_quality=60.0,
        stress_level=75.0,
        fatigue_level=8.0,
    )

    # Simulate catastrophic failure in the ML anomaly detection routine
    with patch(
        "app.services.realtime_analysis_service.detect_multivariate_anomaly",
        side_effect=RuntimeError("GPU OOM / Memory Bus Fault in ML worker")
    ):
        bundle = process_telemetry_packet(test_db, critical_pkt)

    # Pipeline MUST NOT crash
    assert bundle.overall_status == "CRITICAL"
    assert bundle.analysis_result is not None
    assert bundle.analysis_result.overall_status == "CRITICAL"

    gov = bundle.analysis_result.baseline_deviations["_model_governance"]
    assert gov["ml_operational_state"] == "DEGRADED"

    # Critical alert MUST fire
    crit_alerts = [e for e in bundle.alert_events if e.severity == "CRITICAL"]
    assert len(crit_alerts) >= 1
    assert any("Hypoxia" in a.title or "Cardiopulmonary" in a.title for a in crit_alerts)


def test_alert_event_lifecycle_and_delivery_confirmation():
    """Verifies alert event lifecycle: PENDING -> DELIVERED, FAILED, and RETRIED."""
    mgr = AlertEventManager()
    evaluations = [
        RuleEvaluationResult(
            severity="CRITICAL",
            category="RESPIRATORY",
            title="Acute Critical Hypoxia",
            description="Blood oxygen critically depleted.",
            recommended_action="Don oxygen mask immediately.",
            contributing_factors=["SpO2 84%"]
        )
    ]

    events = mgr.process_rule_evaluations("ASTRO-ALERT", evaluations, reading_id=99)
    assert len(events) == 1
    evt = events[0]
    assert evt.delivery_state == DeliveryState.PENDING
    assert evt.deduplication_policy == "IMMEDIATE_BYPASS"

    # 1. Simulate network failure during dispatch
    mgr.dispatch_alert(evt.event_id, simulate_network_failure=True)
    assert evt.delivery_state == DeliveryState.FAILED
    assert evt.retry_count == 1
    assert "Simulated deep-space" in evt.failure_reason

    # 2. Retry failed alerts
    retried = mgr.retry_failed_alerts()
    assert len(retried) == 1
    assert evt.delivery_state == DeliveryState.DELIVERED
    assert evt.delivery_confirmed_at is not None

    # 3. Flight surgeon acknowledgment
    mgr.acknowledge_event(evt.event_id, acknowledged_by="FlightSurgeon-DrJones")
    assert evt.is_acknowledged is True
    assert evt.acknowledged_by == "FlightSurgeon-DrJones"


def test_stream_simulator_scenarios():
    """Verifies stream simulator generates realistic packets with strict data provenance."""
    sim = StreamSimulator(random_seed=777)

    nominal = sim.generate_nominal_stream(astronaut_id="ASTRO-SIM-A", count=5)
    assert len(nominal) == 5
    assert all(p.provenance == TelemetryProvenance.SIMULATED_TELEMETRY for p in nominal)
    assert all(p.blood_oxygen >= 95.0 for p in nominal)

    hypoxia = sim.generate_hypoxia_progression_stream(astronaut_id="ASTRO-SIM-B", count=6)
    assert len(hypoxia) == 6
    # Verify monotonic oxygen decrease
    spo2s = [p.blood_oxygen for p in hypoxia]
    assert spo2s[0] > spo2s[-1]
    assert all(p.provenance == TelemetryProvenance.SIMULATED_TELEMETRY for p in hypoxia)

    spike = sim.generate_spike_stream(astronaut_id="ASTRO-SIM-C", count=6, spike_index=3)
    assert spike[3].heart_rate == 145.0
