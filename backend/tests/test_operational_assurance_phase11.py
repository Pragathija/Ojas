"""
Phase 11 — Mission-Critical Integration Readiness, Observability & Operational Assurance Test Suite
Tests:
- Cryptographic Device Identity & Packet Authentication (Ed25519 & HMAC-SHA256)
- Anti-Replay Timestamp Validation & Window Fencing
- Device Revocation & Key Rotation Life-Cycle
- Device-to-Astronaut Authorization Fencing
- Alert Delivery Receipt Validation & Fencing Token Concurrency
- CRITICAL Alert Delivery Escalation & Non-Suppression
- Telemetry Observability, Structured Logging & Sensitive Data Masking
- Operational Health Probes (/health/liveness, /health/readiness, /health/metrics)
"""

import json
import logging
import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.device_identity import (
    DeviceIdentityManager,
    KeyAlgorithm,
    DeviceStatus,
    TelemetryAuthenticationError,
    ReplayAttackError,
    DeviceRevokedError,
    UnauthorizedDeviceError,
    SimulatedSoftwareKeyStore,
)
from app.core.observability import (
    MetricsCollector,
    StructuredJsonFormatter,
    TelemetryFreshnessState,
)
from app.models.alert_outbox import AlertOutboxEvent, DeliveryState
from app.telemetry.alert_events import (
    OutboxAlertManager,
    InvalidReceiptError,
    StaleLeaseError,
)
from app.main import app
from app.database.connection import Base


# Setup in-memory SQLite session for tests
@pytest.fixture
def p11_db():
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


def test_device_signature_verification_ed25519():
    """Verify Ed25519 digital signature signing and verification on telemetry packets."""
    mgr = DeviceIdentityManager()
    device_id = "BIO-HARNESS-ED25519-01"
    astro_id = "ASTRO-P11-ALPHA"

    pub_key_hex, priv_key_hex = SimulatedSoftwareKeyStore.generate_ed25519_keypair()
    mgr.register_device(
        device_id=device_id,
        assigned_astronaut_id=astro_id,
        public_key_hex=pub_key_hex,
        algorithm=KeyAlgorithm.ED25519,
    )

    now = datetime.now(timezone.utc)
    packet_payload = {
        "astronaut_id": astro_id,
        "timestamp": now.isoformat(),
        "heart_rate": 78.5,
        "blood_oxygen": 98.2,
    }

    # Sign packet
    signature_hex = SimulatedSoftwareKeyStore.sign_ed25519(packet_payload, priv_key_hex)
    assert len(signature_hex) == 128  # 64 bytes = 128 hex chars

    # Verify packet
    verified = mgr.verify_signed_packet(
        device_id=device_id,
        astronaut_id=astro_id,
        packet_payload=packet_payload,
        signature_hex=signature_hex,
        packet_timestamp=now,
    )
    assert verified is True


def test_device_signature_verification_hmac_sha256():
    """Verify HMAC-SHA256 signature generation and verification."""
    mgr = DeviceIdentityManager()
    device_id = "ECG-PATCH-HMAC-01"
    astro_id = "ASTRO-P11-BETA"

    secret_key = "simulation_secret_key_for_testing_only_12345"
    mgr.register_device(
        device_id=device_id,
        assigned_astronaut_id=astro_id,
        public_key_hex=secret_key,
        algorithm=KeyAlgorithm.HMAC_SHA256,
    )

    now = datetime.now(timezone.utc)
    packet_payload = {
        "astronaut_id": astro_id,
        "timestamp": now.isoformat(),
        "heart_rate": 84.0,
    }

    sig_hex = SimulatedSoftwareKeyStore.sign_hmac_sha256(packet_payload, secret_key)
    assert len(sig_hex) == 64  # 32 bytes = 64 hex chars

    verified = mgr.verify_signed_packet(
        device_id=device_id,
        astronaut_id=astro_id,
        packet_payload=packet_payload,
        signature_hex=sig_hex,
        packet_timestamp=now,
    )
    assert verified is True


def test_invalid_signature_rejection():
    """Verify that forged or corrupted signatures are rejected with TelemetryAuthenticationError."""
    mgr = DeviceIdentityManager()
    device_id = "BIO-TAMPER-01"
    astro_id = "ASTRO-P11-GAMMA"

    pub_key_hex, priv_key_hex = SimulatedSoftwareKeyStore.generate_ed25519_keypair()
    mgr.register_device(
        device_id=device_id,
        assigned_astronaut_id=astro_id,
        public_key_hex=pub_key_hex,
        algorithm=KeyAlgorithm.ED25519,
    )

    now = datetime.now(timezone.utc)
    packet_payload = {"astronaut_id": astro_id, "timestamp": now.isoformat(), "heart_rate": 72.0}
    signature_hex = SimulatedSoftwareKeyStore.sign_ed25519(packet_payload, priv_key_hex)

    # Corrupt the payload
    tampered_payload = {"astronaut_id": astro_id, "timestamp": now.isoformat(), "heart_rate": 180.0}

    with pytest.raises(TelemetryAuthenticationError, match="Digital signature verification failed"):
        mgr.verify_signed_packet(
            device_id=device_id,
            astronaut_id=astro_id,
            packet_payload=tampered_payload,
            signature_hex=signature_hex,
            packet_timestamp=now,
        )


def test_replay_attack_freshness_window_rejection():
    """Verify that stale telemetry packets outside the 300s clock skew window are rejected."""
    mgr = DeviceIdentityManager(max_clock_skew_seconds=300)
    device_id = "BIO-REPLAY-01"
    astro_id = "ASTRO-P11-DELTA"

    pub_key_hex, priv_key_hex = SimulatedSoftwareKeyStore.generate_ed25519_keypair()
    mgr.register_device(
        device_id=device_id,
        assigned_astronaut_id=astro_id,
        public_key_hex=pub_key_hex,
        algorithm=KeyAlgorithm.ED25519,
    )

    # 10 minutes in the past (> 300 seconds)
    stale_time = datetime.now(timezone.utc) - timedelta(seconds=600)
    packet_payload = {"astronaut_id": astro_id, "timestamp": stale_time.isoformat(), "heart_rate": 70.0}
    sig_hex = SimulatedSoftwareKeyStore.sign_ed25519(packet_payload, priv_key_hex)

    with pytest.raises(ReplayAttackError, match="outside acceptable freshness window"):
        mgr.verify_signed_packet(
            device_id=device_id,
            astronaut_id=astro_id,
            packet_payload=packet_payload,
            signature_hex=sig_hex,
            packet_timestamp=stale_time,
        )


def test_device_revocation_during_ingestion():
    """Verify that revoked devices are rejected with DeviceRevokedError."""
    mgr = DeviceIdentityManager()
    device_id = "BIO-REVOKE-01"
    astro_id = "ASTRO-P11-EPSILON"

    pub_key_hex, priv_key_hex = SimulatedSoftwareKeyStore.generate_ed25519_keypair()
    mgr.register_device(
        device_id=device_id,
        assigned_astronaut_id=astro_id,
        public_key_hex=pub_key_hex,
        algorithm=KeyAlgorithm.ED25519,
    )

    now = datetime.now(timezone.utc)
    packet_payload = {"astronaut_id": astro_id, "timestamp": now.isoformat(), "heart_rate": 72.0}
    sig_hex = SimulatedSoftwareKeyStore.sign_ed25519(packet_payload, priv_key_hex)

    # Revoke device
    mgr.revoke_device(device_id, reason="Compromised software test key")

    with pytest.raises(DeviceRevokedError, match="(?i)revoked"):
        mgr.verify_signed_packet(
            device_id=device_id,
            astronaut_id=astro_id,
            packet_payload=packet_payload,
            signature_hex=sig_hex,
            packet_timestamp=now,
        )


def test_device_key_rotation():
    """Verify device key rotation: old key is retired and new key is verified."""
    mgr = DeviceIdentityManager()
    device_id = "BIO-ROTATE-01"
    astro_id = "ASTRO-P11-ZETA"

    old_pub, old_priv = SimulatedSoftwareKeyStore.generate_ed25519_keypair()
    new_pub, new_priv = SimulatedSoftwareKeyStore.generate_ed25519_keypair()

    mgr.register_device(
        device_id=device_id,
        assigned_astronaut_id=astro_id,
        public_key_hex=old_pub,
        algorithm=KeyAlgorithm.ED25519,
    )

    # Rotate key
    mgr.rotate_key(device_id, new_public_key_hex=new_pub)
    record = mgr.get_device(device_id)
    assert record.key_epoch == 2
    assert record.public_key_hex == new_pub

    now = datetime.now(timezone.utc)
    packet_payload = {"astronaut_id": astro_id, "timestamp": now.isoformat(), "heart_rate": 75.0}

    # Old key fails
    old_sig = SimulatedSoftwareKeyStore.sign_ed25519(packet_payload, old_priv)
    with pytest.raises(TelemetryAuthenticationError):
        mgr.verify_signed_packet(
            device_id=device_id,
            astronaut_id=astro_id,
            packet_payload=packet_payload,
            signature_hex=old_sig,
            packet_timestamp=now,
        )

    # New key succeeds
    new_sig = SimulatedSoftwareKeyStore.sign_ed25519(packet_payload, new_priv)
    assert mgr.verify_signed_packet(
        device_id=device_id,
        astronaut_id=astro_id,
        packet_payload=packet_payload,
        signature_hex=new_sig,
        packet_timestamp=now,
    ) is True


def test_unauthorized_astronaut_device_rejection():
    """Verify that a device cannot transmit telemetry on behalf of an astronaut it is not assigned to."""
    mgr = DeviceIdentityManager()
    device_id = "BIO-SPOOF-01"
    astro_assigned = "ASTRO-AUTHORIZED"
    astro_spoofed = "ASTRO-ATTACKER"

    pub_key_hex, priv_key_hex = SimulatedSoftwareKeyStore.generate_ed25519_keypair()
    mgr.register_device(
        device_id=device_id,
        assigned_astronaut_id=astro_assigned,
        public_key_hex=pub_key_hex,
        algorithm=KeyAlgorithm.ED25519,
    )

    now = datetime.now(timezone.utc)
    packet_payload = {"astronaut_id": astro_spoofed, "timestamp": now.isoformat(), "heart_rate": 70.0}
    sig_hex = SimulatedSoftwareKeyStore.sign_ed25519(packet_payload, priv_key_hex)

    with pytest.raises(UnauthorizedDeviceError, match="not authorized for astronaut"):
        mgr.verify_signed_packet(
            device_id=device_id,
            astronaut_id=astro_spoofed,
            packet_payload=packet_payload,
            signature_hex=sig_hex,
            packet_timestamp=now,
        )


def test_alert_delivery_receipt_validation(p11_db):
    """Verify cryptographic/correlation receipt validation upon alert delivery."""
    from app.telemetry.alert_events import validate_delivery_receipt, InvalidReceiptError

    now = datetime.now(timezone.utc)
    evt_id = "EVT-RECEIPT-TEST-001"

    # Insert alert into outbox
    event = AlertOutboxEvent(
        event_id=evt_id,
        reading_id=1,
        astronaut_id="ASTRO-RECEIPT-01",
        severity="CAUTION",
        category="CARDIOVASCULAR",
        title="High Heart Rate",
        description="Heart rate elevated above threshold",
        recommended_action="Hydrate and rest",
        detection_method="DETERMINISTIC_RULE",
        deduplication_policy="IMMEDIATE_BYPASS",
        delivery_state="PENDING",
        locked_by="worker-1",
        locked_until=now + timedelta(seconds=60),
        lease_version=1,
    )
    p11_db.add(event)
    p11_db.commit()

    # 1. Direct validation: valid receipt
    valid_receipt = {
        "receipt_id": "rcpt-mcc-12345",
        "target_event_id": evt_id,
        "ack_id": "MCC-ACK-9999",
        "station_id": "HOUSTON-MCC-SIMULATED",
        "received_at": now.isoformat(),
    }
    validated = validate_delivery_receipt(valid_receipt, expected_event_id=evt_id)
    assert validated["ack_id"] == "MCC-ACK-9999"

    # 2. Direct validation: mismatched target event ID raises InvalidReceiptError
    tampered_receipt = {
        "receipt_id": "rcpt-mcc-tampered",
        "target_event_id": "EVT-MISMATCHED-ID",
        "ack_id": "MCC-ACK-FAKE",
    }
    with pytest.raises(InvalidReceiptError, match="Receipt target_event_id mismatch"):
        validate_delivery_receipt(tampered_receipt, expected_event_id=evt_id)

    # 3. End-to-end delivery with adapter returning valid receipt
    mgr = OutboxAlertManager()
    success = mgr.dispatch_alert(
        event_id=evt_id,
        db=p11_db,
        delivery_adapter=lambda e: valid_receipt,
    )
    assert success is True

    updated = p11_db.query(AlertOutboxEvent).filter_by(event_id=evt_id).first()
    assert updated.delivery_state == "DELIVERED"
    assert updated.delivery_confirmed_at is not None
    assert updated.delivery_receipt["ack_id"] == "MCC-ACK-9999"


def test_stale_lease_fencing_protection(p11_db):
    """Verify that stale workers with outdated lease tokens cannot modify outbox events."""
    mgr = OutboxAlertManager()
    now = datetime.now(timezone.utc)
    evt_id = "EVT-FENCE-001"

    event = AlertOutboxEvent(
        event_id=evt_id,
        reading_id=2,
        astronaut_id="ASTRO-FENCE-01",
        severity="CRITICAL",
        category="RESPIRATORY",
        title="Critical Hypoxia",
        description="SpO2 below critical",
        recommended_action="Emergency O2 mask",
        detection_method="DETERMINISTIC_RULE",
        deduplication_policy="IMMEDIATE_BYPASS",
        delivery_state="PENDING",
        lease_version=1,
    )
    p11_db.add(event)
    p11_db.commit()

    # Recovery worker claims event and bumps lease_version to 2
    event.lease_version = 2
    event.locked_by = "worker-B"
    event.locked_until = now + timedelta(seconds=60)
    p11_db.commit()

    # Stale Worker A attempts to dispatch with its old lease_version=1
    with pytest.raises(StaleLeaseError, match="Stale lease version 1 != current 2"):
        mgr.dispatch_alert(
            event_id=evt_id,
            db=p11_db,
            expected_lease_version=1,  # Stale token!
        )


def test_critical_alert_retry_exhaustion_escalation(p11_db):
    """Verify that CRITICAL alerts escalate on retry exhaustion and preserve underlying alerts."""
    mgr = OutboxAlertManager()
    now = datetime.now(timezone.utc)
    evt_id = "EVT-ESCALATE-001"

    event = AlertOutboxEvent(
        event_id=evt_id,
        reading_id=3,
        astronaut_id="ASTRO-CRIT-01",
        severity="CRITICAL",
        category="CARDIOVASCULAR",
        title="Critical Cardiac Emergency",
        description="HR 190 bpm with SpO2 drop",
        recommended_action="Emergency medical review",
        detection_method="DETERMINISTIC_RULE",
        deduplication_policy="IMMEDIATE_BYPASS",
        delivery_state="PENDING",
        retry_count=2,  # Already failed twice
        max_retries=3,
        lease_version=1,
    )
    p11_db.add(event)
    p11_db.commit()

    # Third failure exhausts retries
    success = mgr.dispatch_alert(
        event_id=evt_id,
        db=p11_db,
        simulate_network_failure=True,
    )
    assert success is False

    updated = p11_db.query(AlertOutboxEvent).filter_by(event_id=evt_id).first()
    assert updated.delivery_state == "ESCALATED"
    assert updated.is_escalated is True
    assert updated.escalated_at is not None
    assert "critical alert delivery failed" in updated.escalation_reason.lower()
    assert len(updated.retry_history) == 1  # Logged the attempt
    assert updated.retry_history[0]["attempt"] == 3


def test_observability_metrics_and_telemetry_freshness():
    """Verify MetricsCollector telemetry counters, latency percentile calculations and freshness classification."""
    collector = MetricsCollector()

    # Record 100 packets with simulated latencies (1.0ms to 100.0ms)
    for i in range(1, 101):
        collector.record_packet_ingested(latency_ms=float(i))

    assert collector.packets_ingested_total == 100
    p50 = collector.get_latency_percentile(50)
    p95 = collector.get_latency_percentile(95)
    p99 = collector.get_latency_percentile(99)

    assert 49.0 <= p50 <= 51.0
    assert 94.0 <= p95 <= 96.0
    assert 98.0 <= p99 <= 100.0

    # Freshness testing
    now = datetime.now(timezone.utc)
    collector.update_astronaut_telemetry("ASTRO-FRESH-1", now - timedelta(seconds=15))
    collector.update_astronaut_telemetry("ASTRO-DELAYED-1", now - timedelta(seconds=120))
    collector.update_astronaut_telemetry("ASTRO-DISCONNECTED-1", now - timedelta(seconds=5000))

    snap = collector.get_metrics_snapshot()
    assert snap["telemetry_freshness"]["ASTRO-FRESH-1"]["state"] == TelemetryFreshnessState.REALTIME.value
    assert snap["telemetry_freshness"]["ASTRO-DELAYED-1"]["state"] == TelemetryFreshnessState.DELAYED.value
    assert snap["telemetry_freshness"]["ASTRO-DISCONNECTED-1"]["state"] == TelemetryFreshnessState.DISCONNECTED.value


def test_sensitive_data_masking_in_logs():
    """Verify that StructuredJsonFormatter redacts tokens, private keys, and patient biometric payloads."""
    formatter = StructuredJsonFormatter()

    record = logging.LogRecord(
        name="test_logger",
        level=logging.INFO,
        pathname="test.py",
        lineno=10,
        msg="Authenticated device with token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 and private_key=abc1234567890def",
        args=(),
        exc_info=None,
    )
    record.correlation_id = "CID-TEST-001"

    formatted_json = formatter.format(record)
    data = json.loads(formatted_json)

    assert data["correlation_id"] == "CID-TEST-001"
    assert "[REDACTED_SECRET]" in data["message"]
    assert "abc1234567890def" not in data["message"]


def test_health_probes_liveness_readiness_metrics():
    """Verify FastAPI /health/liveness, /health/readiness, and /health/metrics endpoints."""
    from app.main import liveness_probe, readiness_probe, get_operational_metrics

    # 1. Liveness Probe
    body_live = liveness_probe()
    assert body_live["status"] == "alive"
    assert "timestamp" in body_live

    # 2. Readiness Probe
    body_ready = readiness_probe()
    assert body_ready["status"] == "ready"
    assert body_ready["database"] == "connected"
    assert body_ready["models_initialized"] is True

    # 3. Metrics Probe
    body_metrics = get_operational_metrics()
    assert "packets_ingested_total" in body_metrics
    assert "latency_p50_ms" in body_metrics
    assert "latency_p95_ms" in body_metrics
    assert "alerts_escalated" in body_metrics
    assert "telemetry_freshness" in body_metrics
