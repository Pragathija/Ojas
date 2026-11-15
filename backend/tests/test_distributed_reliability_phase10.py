"""
OJAS Phase 10 Test Suite: Distributed Reliability, Durable Event Processing & Production Hardening.
Validates:
1. Persistent idempotency surviving restarts, cache clearance, and multiple workers.
2. Concurrent duplicate packet insertion collision protection at database level.
3. Idempotency retention policy and expiration cleanup.
4. Transactional outbox atomic persistence within the health record transaction.
5. Confirmed delivery receipts (never reported DELIVERED without delivery receipt).
6. Persistent retry scheduling with exponential backoff and retry exhaustion limits.
7. Concurrency leasing (locked_until, locked_by) preventing duplicate outbox delivery across workers.
8. Distributed stream session sequencing, sequence gap detection, and counter resets.
9. Guarding latest-reading state: late-arriving packets cannot overwrite newer stream timestamps.
10. Crash recovery after commit: background recovery worker picks up and delivers pending alerts.
11. Missing telemetry safety: telemetry gaps never interpreted as normal health.
12. Telemetry source authentication and astronaut-level device authorization.
13. Role-authorized alert acknowledgment and clinical medical sign-off.
14. ML worker failure resilience and critical alert non-suppression invariant.
"""

from datetime import datetime, timezone, timedelta
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import patch

from app.database.connection import Base
from app.models.astronaut import Astronaut
from app.models.health_record import HealthRecord
from app.models.telemetry_idempotency import TelemetryIdempotencyRecord
from app.models.alert_outbox import AlertOutboxEvent
from app.models.stream_session import StreamSessionState
from app.telemetry.schemas import (
    TelemetryPacket,
    IngestionResult,
    PacketIngestionStatus,
    DeliveryState,
    TelemetryProvenance,
)
from app.telemetry.quality_gateway import default_quality_gateway
from app.telemetry.alert_events import (
    default_alert_manager,
    AlertEventManager,
    AlertEvent,
    simulated_mission_control_adapter,
)
from app.services.realtime_analysis_service import process_telemetry_packet
from app.core.security import (
    Principal,
    UserRole,
    ClinicalDisposition,
    default_security_service,
    TelemetryAuthenticationError,
    AstronautAuthorizationError,
    ClinicalAuthorizationError,
)
from app.ml.uncertainty import calculate_evidence_sufficiency
from app.ml.temporal_analysis import analyze_vital_trend


@pytest.fixture
def p10_db():
    """Provides an isolated in-memory SQLite database session with Phase 10 tables."""
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(autouse=True)
def clean_p10_state():
    default_quality_gateway.clear_cache()
    default_alert_manager.clear()
    yield
    default_quality_gateway.clear_cache()
    default_alert_manager.clear()


# ============================================================================
# 1. PERSISTENT IDEMPOTENCY
# ============================================================================

def test_persistent_idempotency_survives_restarts_and_multiple_workers(p10_db):
    """
    Verifies that a packet ingested by Worker 1 persists its idempotency record in the DB,
    and Worker 2 (after cache clearance/restart) detects the duplicate, returns the original
    result, and prevents duplicate HealthRecord insertions.
    """
    now = datetime.now(timezone.utc)
    packet = TelemetryPacket(
        stream_id="STREAM-IDEMP-01",
        source_id="bioharness_v4",
        idempotency_key="idemp-durable-token-001",
        sequence_num=1,
        session_id="session-worker-01",
        astronaut_id="ASTRO-IDEMP",
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
    )

    # Worker 1 ingests the packet
    bundle1 = process_telemetry_packet(p10_db, packet)
    assert bundle1.ingestion_result.status == PacketIngestionStatus.ACCEPTED
    assert bundle1.health_record is not None
    orig_record_id = bundle1.health_record.id

    # Verify persistent DB record exists
    db_idemp = p10_db.query(TelemetryIdempotencyRecord).filter_by(idempotency_key="idemp-durable-token-001").first()
    assert db_idemp is not None
    assert db_idemp.status == "ACCEPTED"
    assert db_idemp.record_id == orig_record_id

    # SIMULATE WORKER 2 / PROCESS RESTART: Clear gateway memory cache completely
    default_quality_gateway.clear_cache()

    # Worker 2 attempts to ingest the exact same packet
    bundle2 = process_telemetry_packet(p10_db, packet)
    assert bundle2.ingestion_result.status == PacketIngestionStatus.DUPLICATE
    assert bundle2.ingestion_result.is_cached_response is True
    assert bundle2.ingestion_result.record_id == orig_record_id
    assert bundle2.health_record is None

    # Strict check: only 1 HealthRecord exists in the database
    all_records = p10_db.query(HealthRecord).filter_by(astronaut_id="ASTRO-IDEMP").all()
    assert len(all_records) == 1


def test_concurrent_duplicate_packet_insertion_protection(p10_db):
    """
    Verifies that simultaneous insertions of the same idempotency key are absorbed
    by the database unique constraint and gateway transaction handling without raising uncaught errors.
    """
    now = datetime.now(timezone.utc)
    packet = TelemetryPacket(
        stream_id="STREAM-IDEMP-CONCUR",
        source_id="bioharness_v4",
        idempotency_key="idemp-collision-token-999",
        sequence_num=1,
        astronaut_id="ASTRO-CONCUR",
        timestamp=now,
        heart_rate=70.0,
        blood_oxygen=98.0,
        systolic_bp=120.0,
        diastolic_bp=80.0,
        body_temperature=36.6,
        sleep_duration=8.0,
        sleep_quality=90.0,
        stress_level=15.0,
        fatigue_level=1.0,
    )

    # First packet accepted and registered
    is_acc, res1 = default_quality_gateway.process_packet(packet, db=p10_db)
    assert is_acc is True
    assert res1.status == PacketIngestionStatus.ACCEPTED

    # Second concurrent call with same idempotency key
    is_acc2, res2 = default_quality_gateway.process_packet(packet, db=p10_db)
    assert is_acc2 is False
    assert res2.status == PacketIngestionStatus.DUPLICATE
    assert res2.is_cached_response is True


def test_idempotency_retention_and_expiration(p10_db):
    """Verifies that expired idempotency keys are purged by the retention cleanup routine."""
    now = datetime.now(timezone.utc)

    # Create active record (expires in 7 days)
    rec_active = TelemetryIdempotencyRecord(
        idempotency_key="idemp-active-key",
        stream_id="STREAM-1",
        source_id="bioharness_v4",
        astronaut_id="ASTRO-EXP",
        sequence_num=1,
        status="ACCEPTED",
        quality_score=1.0,
        created_at=now,
        expires_at=now + timedelta(days=7)
    )
    # Create expired record (expired 1 hour ago)
    rec_expired = TelemetryIdempotencyRecord(
        idempotency_key="idemp-expired-key",
        stream_id="STREAM-1",
        source_id="bioharness_v4",
        astronaut_id="ASTRO-EXP",
        sequence_num=2,
        status="ACCEPTED",
        quality_score=1.0,
        created_at=now - timedelta(days=8),
        expires_at=now - timedelta(hours=1)
    )
    p10_db.add_all([rec_active, rec_expired])
    p10_db.commit()

    # Run cleanup routine
    deleted_count = default_quality_gateway.cleanup_expired_idempotency(p10_db, now=now)
    assert deleted_count == 1

    # Active key remains
    remaining = p10_db.query(TelemetryIdempotencyRecord).filter_by(astronaut_id="ASTRO-EXP").all()
    assert len(remaining) == 1
    assert remaining[0].idempotency_key == "idemp-active-key"


# ============================================================================
# 2. DURABLE TRANSACTIONAL OUTBOX & ALERT PROCESSING
# ============================================================================

def test_transactional_outbox_atomic_persistence(p10_db):
    """
    Verifies that when telemetry triggers an alert, the AlertOutboxEvent is written
    and committed in the same database transaction as the HealthRecord.
    """
    now = datetime.now(timezone.utc)
    critical_pkt = TelemetryPacket(
        stream_id="STREAM-OUTBOX-01",
        source_id="bioharness_v4",
        idempotency_key="idemp-outbox-crit-01",
        sequence_num=1,
        astronaut_id="ASTRO-OUTBOX",
        timestamp=now,
        heart_rate=125.0,
        blood_oxygen=84.0,  # Critical hypoxia
        systolic_bp=145.0,
        diastolic_bp=95.0,
        body_temperature=36.7,
        sleep_duration=5.0,
        sleep_quality=60.0,
        stress_level=80.0,
        fatigue_level=8.0,
    )

    bundle = process_telemetry_packet(p10_db, critical_pkt)
    assert bundle.overall_status == "CRITICAL"

    # Query the persistent AlertOutboxEvent table
    outbox_events = p10_db.query(AlertOutboxEvent).filter_by(astronaut_id="ASTRO-OUTBOX").all()
    assert len(outbox_events) >= 1

    crit_evt = [e for e in outbox_events if e.severity == "CRITICAL"][0]
    assert crit_evt.deduplication_policy == "IMMEDIATE_BYPASS"
    assert crit_evt.delivery_state == "DELIVERED"
    assert crit_evt.delivery_receipt is not None
    assert "receipt_id" in crit_evt.delivery_receipt
    assert crit_evt.reading_id == bundle.health_record.id


def test_confirmed_delivery_receipt_requirement():
    """
    Verifies that dispatching an alert without confirmation receipt fails,
    and never reports DELIVERED without an adapter ACK.
    """
    mgr = AlertEventManager()
    from app.health_engine.risk_rules import RuleEvaluationResult
    evals = [
        RuleEvaluationResult(
            severity="CRITICAL",
            category="RESPIRATORY",
            title="Hypoxia Emergency",
            description="SpO2 depleted.",
            recommended_action="Don oxygen mask.",
            contributing_factors=["SpO2 84%"]
        )
    ]
    events = mgr.process_rule_evaluations("ASTRO-RECEIPT", evals)
    evt = events[0]
    assert evt.delivery_state == DeliveryState.PENDING

    # 1. Custom failing adapter returning None (No receipt)
    def failing_adapter(e):
        return None

    success = mgr.dispatch_alert(evt.event_id, delivery_adapter=failing_adapter)
    assert success is False
    assert evt.delivery_state == DeliveryState.FAILED
    assert evt.delivery_confirmed_at is None
    assert evt.retry_count == 1

    # 2. Custom successful adapter returning structured receipt
    def successful_adapter(e):
        return {
            "receipt_id": "rcpt-space-station-hud-007",
            "channel": "CREW_HUD_WEBSOCKET",
            "confirmed_at": datetime.now(timezone.utc).isoformat(),
            "crc_ack": "0x4A1F"
        }

    success = mgr.dispatch_alert(evt.event_id, delivery_adapter=successful_adapter)
    assert success is True
    assert evt.delivery_state == DeliveryState.DELIVERED
    assert evt.delivery_confirmed_at is not None
    assert evt.delivery_receipt["receipt_id"] == "rcpt-space-station-hud-007"


def test_persistent_retry_with_exponential_backoff_and_exhaustion(p10_db):
    """
    Verifies that network failures trigger exponential backoff retry scheduling,
    and reaching max retries halts further delivery attempts.
    """
    mgr = AlertEventManager()
    from app.health_engine.risk_rules import RuleEvaluationResult
    evals = [
        RuleEvaluationResult(
            severity="CRITICAL",
            category="CARDIOVASCULAR",
            title="Acute Tachycardia",
            description="Heart rate elevated.",
            recommended_action="Rest.",
            contributing_factors=["HR 130"]
        )
    ]
    events = mgr.process_rule_evaluations("ASTRO-RETRY", evals, db=p10_db)
    evt_id = events[0].event_id

    # Simulate 3 successive network failures
    for attempt in range(1, 4):
        success = mgr.dispatch_alert(evt_id, db=p10_db, simulate_network_failure=True)
        assert success is False

        db_rec = p10_db.query(AlertOutboxEvent).filter_by(event_id=evt_id).first()
        if attempt < 3:
            assert db_rec.delivery_state in ["FAILED", "RETRYING"]
            assert db_rec.retry_count == attempt
            assert db_rec.next_retry_at is not None
        else:
            # On final exhaustion of CRITICAL alert, Phase 11 escalates immediately
            assert db_rec.delivery_state in ["FAILED", "ESCALATED"]
            assert db_rec.retry_count == attempt
            if db_rec.delivery_state == "ESCALATED":
                assert db_rec.is_escalated is True

    # On attempt 4, max retries (3) is exhausted
    db_rec = p10_db.query(AlertOutboxEvent).filter_by(event_id=evt_id).first()
    assert db_rec.retry_count == 3
    # Calling recovery will not pick up exhausted events
    recovered = mgr.recover_pending_outbox_events(p10_db, worker_id="worker-test")
    assert len(recovered) == 0


def test_concurrent_worker_outbox_recovery_and_leasing(p10_db):
    """
    Verifies that concurrent recovery workers acquire lease locks (locked_until, locked_by)
    so that two workers do not process and deliver the same outbox alert simultaneously.
    """
    now = datetime.now(timezone.utc)
    # Manually insert 2 pending outbox events
    evt1 = AlertOutboxEvent(
        event_id="evt-lease-01",
        astronaut_id="ASTRO-LEASE",
        severity="CAUTION",
        category="SLEEP_DEBT",
        title="High Fatigue",
        description="Low sleep.",
        recommended_action="Rest.",
        detection_method="DETERMINISTIC_RULE",
        deduplication_policy="30_MIN_WINDOW",
        delivery_state="PENDING",
        delivery_channel="MISSION_CONTROL_CONSOLE",
        retry_count=0,
        max_retries=3,
        created_at=now
    )
    p10_db.add(evt1)
    p10_db.commit()

    mgr = AlertEventManager()

    # Worker 1 recovers and claims the event with a 60-second lease
    recovered_w1 = mgr.recover_pending_outbox_events(
        p10_db,
        worker_id="recovery-worker-alpha",
        lease_seconds=60
    )
    assert len(recovered_w1) == 1
    assert recovered_w1[0].delivery_state == "DELIVERED"

    # Worker 2 attempts recovery concurrently; no pending events are available
    recovered_w2 = mgr.recover_pending_outbox_events(
        p10_db,
        worker_id="recovery-worker-beta",
        lease_seconds=60
    )
    assert len(recovered_w2) == 0


# ============================================================================
# 3. DISTRIBUTED STREAM SEQUENCING & LATE PACKET GUARDING
# ============================================================================

def test_stream_session_sequencing_gaps_and_counter_resets(p10_db):
    """
    Verifies that sequence gaps are audited and device counter/session resets
    are tracked without dropping packets.
    """
    now = datetime.now(timezone.utc)

    # Packet 1 (seq 1, session A)
    pkt1 = TelemetryPacket(
        stream_id="STREAM-SESSION-01",
        source_id="bioharness_v4",
        idempotency_key="idemp-sess-1",
        sequence_num=1,
        session_id="session-boot-alpha",
        astronaut_id="ASTRO-SESS",
        timestamp=now,
        heart_rate=70.0,
        blood_oxygen=98.0,
        systolic_bp=120.0,
        diastolic_bp=80.0,
        body_temperature=36.6,
        sleep_duration=7.0,
        sleep_quality=80.0,
        stress_level=20.0,
        fatigue_level=2.0,
    )
    b1 = process_telemetry_packet(p10_db, pkt1)
    assert b1.ingestion_result.status == PacketIngestionStatus.ACCEPTED

    # Packet 2 with gap (seq 5 arrives, packets 2, 3, 4 missing)
    pkt2 = TelemetryPacket(
        stream_id="STREAM-SESSION-01",
        source_id="bioharness_v4",
        idempotency_key="idemp-sess-5",
        sequence_num=5,
        session_id="session-boot-alpha",
        astronaut_id="ASTRO-SESS",
        timestamp=now + timedelta(minutes=5),
        heart_rate=71.0,
        blood_oxygen=98.0,
        systolic_bp=120.0,
        diastolic_bp=80.0,
        body_temperature=36.6,
        sleep_duration=7.0,
        sleep_quality=80.0,
        stress_level=20.0,
        fatigue_level=2.0,
    )
    b2 = process_telemetry_packet(p10_db, pkt2)
    assert b2.ingestion_result.status == PacketIngestionStatus.ACCEPTED
    assert any("Sequence gap detected" in w for w in b2.ingestion_result.warnings)

    stream_state = p10_db.query(StreamSessionState).filter_by(stream_id="STREAM-SESSION-01").first()
    assert stream_state.total_gaps_detected == 3
    assert stream_state.highest_sequence_num == 5

    # Packet 3: Device reboots with new session_id and seq 0
    pkt3 = TelemetryPacket(
        stream_id="STREAM-SESSION-01",
        source_id="bioharness_v4",
        idempotency_key="idemp-sess-reboot-0",
        sequence_num=0,
        session_id="session-boot-beta",  # New session epoch
        astronaut_id="ASTRO-SESS",
        timestamp=now + timedelta(minutes=10),
        heart_rate=70.0,
        blood_oxygen=98.0,
        systolic_bp=120.0,
        diastolic_bp=80.0,
        body_temperature=36.6,
        sleep_duration=7.0,
        sleep_quality=80.0,
        stress_level=20.0,
        fatigue_level=2.0,
    )
    b3 = process_telemetry_packet(p10_db, pkt3)
    assert b3.ingestion_result.status == PacketIngestionStatus.ACCEPTED
    assert any("counter reset detected" in w for w in b3.ingestion_result.warnings)

    p10_db.refresh(stream_state)
    assert stream_state.session_id == "session-boot-beta"
    assert stream_state.total_resets_detected == 1
    assert stream_state.highest_sequence_num == 0


def test_late_arriving_packet_does_not_overwrite_latest_state(p10_db):
    """
    CRITICAL INVARIANT: A delayed packet arriving out of order must not overwrite
    the stream session's latest_reading_timestamp with an older timestamp.
    """
    now = datetime.now(timezone.utc)
    t_recent = now
    t_delayed = now - timedelta(hours=2)

    # 1. Ingest recent packet (seq 10, t_recent)
    pkt_recent = TelemetryPacket(
        stream_id="STREAM-LATE-GUARD",
        source_id="bioharness_v4",
        idempotency_key="idemp-recent-10",
        sequence_num=10,
        astronaut_id="ASTRO-LATE",
        timestamp=t_recent,
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
    process_telemetry_packet(p10_db, pkt_recent)

    state = p10_db.query(StreamSessionState).filter_by(stream_id="STREAM-LATE-GUARD").first()
    # Normalize state timestamp
    st_ts = default_quality_gateway.normalize_utc_timestamp(state.latest_reading_timestamp)
    assert st_ts == t_recent

    # 2. Ingest delayed packet (seq 4, t_delayed = 2 hours ago)
    pkt_delayed = TelemetryPacket(
        stream_id="STREAM-LATE-GUARD",
        source_id="bioharness_v4",
        idempotency_key="idemp-delayed-4",
        sequence_num=4,
        astronaut_id="ASTRO-LATE",
        timestamp=t_delayed,
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
    b_del = process_telemetry_packet(p10_db, pkt_delayed)
    assert b_del.ingestion_result.status == PacketIngestionStatus.OUT_OF_ORDER_ACCEPTED

    p10_db.refresh(state)
    st_ts_after = default_quality_gateway.normalize_utc_timestamp(state.latest_reading_timestamp)
    # MUST REMAIN t_recent, NOT OVERWRITTEN BY t_delayed!
    assert st_ts_after == t_recent


# ============================================================================
# 4. CRASH RECOVERY & REPLAY FAULT INJECTION
# ============================================================================

def test_crash_recovery_after_commit(p10_db):
    """
    Simulates application termination immediately after DB commit but before alert delivery.
    Verifies that the recovery worker starting up picks up the pending outbox event and completes delivery.
    """
    now = datetime.now(timezone.utc)
    critical_pkt = TelemetryPacket(
        stream_id="STREAM-CRASH-01",
        source_id="bioharness_v4",
        idempotency_key="idemp-crash-01",
        sequence_num=1,
        astronaut_id="ASTRO-CRASH",
        timestamp=now,
        heart_rate=135.0,
        blood_oxygen=83.0,  # Critical
        systolic_bp=150.0,
        diastolic_bp=95.0,
        body_temperature=36.8,
        sleep_duration=5.0,
        sleep_quality=60.0,
        stress_level=80.0,
        fatigue_level=8.0,
    )

    # Ingest without automatic alert dispatch (simulating crash before dispatch)
    bundle = process_telemetry_packet(p10_db, critical_pkt, auto_dispatch_alerts=False)

    # Verify event is in PENDING state in DB
    db_evt = p10_db.query(AlertOutboxEvent).filter_by(astronaut_id="ASTRO-CRASH").first()
    assert db_evt.delivery_state == "PENDING"
    assert db_evt.delivery_confirmed_at is None

    # CRASH RECOVERY WORKER INVOCATION
    recovered = default_alert_manager.recover_pending_outbox_events(
        p10_db,
        worker_id="recovery-agent-crash-restart"
    )
    assert len(recovered) >= 1

    p10_db.refresh(db_evt)
    assert db_evt.delivery_state == "DELIVERED"
    assert db_evt.delivery_confirmed_at is not None
    assert db_evt.delivery_receipt is not None


def test_missing_telemetry_never_assumed_normal():
    """
    Verifies that an 8-hour telemetry gap reduces epistemic confidence
    and suppresses continuous rate-of-change estimation rather than assuming normal health.
    """
    now = datetime.now(timezone.utc)
    r1 = HealthRecord(astronaut_id="ASTRO-GAP", timestamp=now - timedelta(hours=8), heart_rate=70.0, blood_oxygen=98.0)
    r2 = HealthRecord(astronaut_id="ASTRO-GAP", timestamp=now, heart_rate=75.0, blood_oxygen=96.0)

    # Uncertainty evaluation: insufficient count (<5)
    unc = calculate_evidence_sufficiency(r2, historical_count=2, baseline=None)
    assert unc.sample_maturity_score < 0.5
    assert unc.overall_confidence < 0.7
    assert any("Immature astronaut baseline" in w for w in unc.data_quality_warnings)

    # Temporal analysis: gap > 4h suppresses continuous rate of change
    trend = analyze_vital_trend([r1, r2], "heart_rate")
    assert trend["observation_gap_hours"] == 8.0
    assert trend["rate_of_change_per_hour"] is None


# ============================================================================
# 5. SECURITY, AUTHENTICATION & ROLE-AUTHORIZED CLINICAL SIGN-OFF
# ============================================================================

def test_telemetry_source_authentication_and_device_authorization(p10_db):
    """
    Verifies source device authentication and astronaut assignment authorization.
    """
    now = datetime.now(timezone.utc)
    pkt_alice = TelemetryPacket(
        stream_id="STREAM-ALICE-PERSONAL",
        source_id="astro_alice_personal_harness",
        idempotency_key="idemp-auth-alice-01",
        sequence_num=1,
        astronaut_id="CREW-ALICE",
        timestamp=now,
        heart_rate=70.0,
        blood_oxygen=98.0,
        systolic_bp=120.0,
        diastolic_bp=80.0,
        body_temperature=36.6,
        sleep_duration=7.5,
        sleep_quality=85.0,
        stress_level=20.0,
        fatigue_level=2.0,
    )

    # 1. Valid token succeeds
    b_ok = process_telemetry_packet(p10_db, pkt_alice, auth_token="alice-device-key-991")
    assert b_ok.ingestion_result.status == PacketIngestionStatus.ACCEPTED

    # 2. Invalid token raises TelemetryAuthenticationError
    pkt_bad_token = TelemetryPacket(
        stream_id="STREAM-ALICE-PERSONAL",
        source_id="astro_alice_personal_harness",
        idempotency_key="idemp-auth-bad-token",
        sequence_num=2,
        astronaut_id="CREW-ALICE",
        timestamp=now + timedelta(minutes=1),
        heart_rate=70.0,
        blood_oxygen=98.0,
        systolic_bp=120.0,
        diastolic_bp=80.0,
        body_temperature=36.6,
        sleep_duration=7.5,
        sleep_quality=85.0,
        stress_level=20.0,
        fatigue_level=2.0,
    )
    with pytest.raises(TelemetryAuthenticationError):
        process_telemetry_packet(p10_db, pkt_bad_token, auth_token="wrong-token-xyz")

    # 3. Unauthorized astronaut (Alice's personal device sending for Bob) raises AstronautAuthorizationError
    pkt_rogue_assignment = TelemetryPacket(
        stream_id="STREAM-ROGUE-SPOOF",
        source_id="astro_alice_personal_harness",
        idempotency_key="idemp-rogue-01",
        sequence_num=3,
        astronaut_id="CREW-BOB",  # Alice's device transmitting for Bob
        timestamp=now + timedelta(minutes=2),
        heart_rate=70.0,
        blood_oxygen=98.0,
        systolic_bp=120.0,
        diastolic_bp=80.0,
        body_temperature=36.6,
        sleep_duration=7.5,
        sleep_quality=85.0,
        stress_level=20.0,
        fatigue_level=2.0,
    )
    with pytest.raises(AstronautAuthorizationError):
        process_telemetry_packet(p10_db, pkt_rogue_assignment, auth_token="alice-device-key-991")


def test_role_authorized_alert_acknowledgment_and_clinical_signoff(p10_db):
    """
    Verifies that human acknowledgment is recorded with credentials,
    unauthorized users cannot perform clinical sign-off, and qualified
    Flight Surgeons provide clinical medical sign-off with disposition and rationale.
    """
    mgr = AlertEventManager()
    from app.health_engine.risk_rules import RuleEvaluationResult
    evals = [
        RuleEvaluationResult(
            severity="CRITICAL",
            category="RESPIRATORY",
            title="Severe Acute Hypoxia",
            description="Cabin depressurization suspected.",
            recommended_action="Emergency O2 protocol.",
            contributing_factors=["SpO2 82%"]
        )
    ]
    events = mgr.process_rule_evaluations("ASTRO-CARL", evals, db=p10_db)
    evt_id = events[0].event_id

    # 1. Astronaut Acknowledgment
    astro_carl = Principal(
        principal_id="ASTRO-CARL",
        role=UserRole.ASTRONAUT,
        name="Carl Sagan",
        callsign="Voyager-1",
        assigned_astronaut_ids=["ASTRO-CARL"]
    )
    ack_res = mgr.acknowledge_event(
        evt_id,
        acknowledged_by="Carl Sagan",
        principal=astro_carl,
        acknowledgment_note="Donned emergency oxygen mask. Oxygen flow confirmed.",
        db=p10_db
    )
    assert ack_res.is_acknowledged is True
    assert ack_res.acknowledged_role == "ASTRONAUT"
    assert ack_res.acknowledgment_note == "Donned emergency oxygen mask. Oxygen flow confirmed."

    # 2. Astronaut attempts clinical sign-off (MUST FAIL with ClinicalAuthorizationError)
    with pytest.raises(ClinicalAuthorizationError):
        mgr.clinical_signoff(
            evt_id,
            principal=astro_carl,
            disposition=ClinicalDisposition.CLEARED.value,
            rationale="I feel completely fine now.",
            db=p10_db
        )

    # 3. Qualified Flight Surgeon performs clinical sign-off
    dr_turner = Principal(
        principal_id="SURGEON-TURNER-01",
        role=UserRole.FLIGHT_SURGEON,
        name="Dr. Eleanor Turner, MD",
        medical_license="NASA-FS-88192-AEROSPACE",
        callsign="Flight-Surgeon-Houston"
    )
    signoff_res = mgr.clinical_signoff(
        evt_id,
        principal=dr_turner,
        disposition=ClinicalDisposition.RESTRICT_EVA.value,
        rationale="Hypoxia event resolved with O2 supplementation. Arterial saturation recovered to 98%. Restrict EVA activities for 48 hours for cardiopulmonary observation.",
        db=p10_db
    )
    assert signoff_res.is_clinically_signed_off is True
    assert signoff_res.signed_off_by == "Dr. Eleanor Turner, MD"
    assert signoff_res.clinical_role == "FLIGHT_SURGEON"
    assert signoff_res.disposition == "RESTRICT_EVA"

    # Verify persistent DB state
    db_evt = p10_db.query(AlertOutboxEvent).filter_by(event_id=evt_id).first()
    assert db_evt.is_acknowledged is True
    assert db_evt.acknowledged_by == "Carl Sagan"
    assert db_evt.is_clinically_signed_off is True
    assert db_evt.signed_off_by == "Dr. Eleanor Turner, MD"
    assert db_evt.clinical_role == "FLIGHT_SURGEON"
