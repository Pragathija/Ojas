import pytest
from app.api.v1.endpoints import health, alerts
from app.schemas.health import HealthReadingCreate
from app.schemas.alert import HealthAlertAcknowledge


def test_alert_generation_and_acknowledgement(db):
    # Post a critical reading (SpO2: 89.0%)
    crit_payload = HealthReadingCreate(
        astronaut_id="TEST-ALERT-01",
        heart_rate=78.0,
        blood_oxygen=89.0,  # Critical
        systolic_bp=120.0,
        diastolic_bp=80.0,
        body_temperature=36.6,
        sleep_duration=7.0,
        sleep_quality=80.0,
        stress_level=30.0,
        fatigue_level=2.0
    )

    health.create_reading(reading_in=crit_payload, db=db)

    # Fetch alerts
    alert_list = alerts.get_alerts(astronaut_id="TEST-ALERT-01", db=db)
    assert len(alert_list) >= 1

    crit_alert = next((a for a in alert_list if a.severity == "CRITICAL"), None)
    assert crit_alert is not None
    assert crit_alert.is_acknowledged is False

    # Acknowledge the alert
    ack_payload = HealthAlertAcknowledge(acknowledged_by="Flight Surgeon Dr. Stone")
    ack_data = alerts.acknowledge_alert(alert_id=crit_alert.id, payload=ack_payload, db=db)
    assert ack_data.is_acknowledged is True
    assert ack_data.acknowledged_by == "Flight Surgeon Dr. Stone"


def test_critical_alerts_never_suppressed(db):
    # Post two consecutive critical readings
    crit_payload = HealthReadingCreate(
        astronaut_id="TEST-ALERT-CRIT-DEDUP",
        heart_rate=135.0,  # Critical Tachycardia
        blood_oxygen=98.0,
        systolic_bp=120.0,
        diastolic_bp=80.0,
        body_temperature=36.6,
        sleep_duration=7.0,
        sleep_quality=80.0,
        stress_level=30.0,
        fatigue_level=2.0
    )

    health.create_reading(reading_in=crit_payload, db=db)
    health.create_reading(reading_in=crit_payload, db=db)

    crit_alerts = alerts.get_alerts(astronaut_id="TEST-ALERT-CRIT-DEDUP", severity="CRITICAL", db=db)
    # Critical alerts must NOT be suppressed
    assert len(crit_alerts) == 2


def test_caution_alerts_deduplicated(db):
    # Post two consecutive caution readings with identical caution condition
    caution_payload = HealthReadingCreate(
        astronaut_id="TEST-ALERT-CAUTION-DEDUP",
        heart_rate=105.0,  # Caution Elevated HR
        blood_oxygen=97.0,
        systolic_bp=120.0,
        diastolic_bp=80.0,
        body_temperature=36.6,
        sleep_duration=7.0,
        sleep_quality=80.0,
        stress_level=30.0,
        fatigue_level=2.0
    )

    health.create_reading(reading_in=caution_payload, db=db)
    health.create_reading(reading_in=caution_payload, db=db)

    caution_alerts = alerts.get_alerts(astronaut_id="TEST-ALERT-CAUTION-DEDUP", severity="CAUTION", db=db)
    # Caution duplicate should be suppressed
    assert len(caution_alerts) == 1
