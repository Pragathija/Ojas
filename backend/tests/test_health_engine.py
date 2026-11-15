import pytest
from app.models.health_record import HealthRecord
from app.models.health_baseline import HealthBaseline
from app.health_engine.risk_rules import evaluate_risk_rules
from app.health_engine.baseline import compute_baseline_deviations
from app.ml.anomaly_detection import detect_multivariate_anomaly


def test_hypoxia_rule_evaluation():
    # SpO2 depressed to 88% (critical)
    reading = HealthRecord(
        astronaut_id="ASTRO-RULE-01",
        heart_rate=75.0,
        blood_oxygen=88.0,
        systolic_bp=120.0,
        diastolic_bp=80.0,
        body_temperature=36.6,
        sleep_duration=7.0,
        sleep_quality=80.0,
        stress_level=30.0,
        fatigue_level=2.0
    )

    results = evaluate_risk_rules(reading, baseline=None)
    severities = [r.severity for r in results]
    categories = [r.category for r in results]

    assert "CRITICAL" in severities
    assert "RESPIRATORY" in categories


def test_tachycardia_and_compound_risk():
    # Heart rate 125 BPM + SpO2 92% (Compound critical strain)
    reading = HealthRecord(
        astronaut_id="ASTRO-RULE-02",
        heart_rate=125.0,
        blood_oxygen=92.0,
        systolic_bp=145.0,
        diastolic_bp=95.0,
        body_temperature=37.0,
        sleep_duration=6.0,
        sleep_quality=70.0,
        stress_level=60.0,
        fatigue_level=5.0
    )

    results = evaluate_risk_rules(reading, baseline=None)
    severities = [r.severity for r in results]
    categories = [r.category for r in results]

    assert "CRITICAL" in severities
    assert "COMPOUND" in categories


def test_sleep_debt_and_fatigue_rule():
    # Sleep 3.5 hrs, fatigue 9.0 (Critical neuro-cognitive fatigue)
    reading = HealthRecord(
        astronaut_id="ASTRO-RULE-03",
        heart_rate=80.0,
        blood_oxygen=98.0,
        systolic_bp=122.0,
        diastolic_bp=80.0,
        body_temperature=36.7,
        sleep_duration=3.5,
        sleep_quality=40.0,
        stress_level=70.0,
        fatigue_level=9.0
    )

    results = evaluate_risk_rules(reading, baseline=None)
    severities = [r.severity for r in results]
    assert "CRITICAL" in severities
    assert any("Sleep" in r.title for r in results)


def test_baseline_deviation_calculation():
    baseline = HealthBaseline(
        astronaut_id="ASTRO-DEV-01",
        heart_rate_mean=70.0,
        heart_rate_std=5.0,
        blood_oxygen_mean=98.0,
        blood_oxygen_std=0.5,
        systolic_bp_mean=120.0,
        systolic_bp_std=4.0,
        diastolic_bp_mean=80.0,
        diastolic_bp_std=3.0,
        temperature_mean=36.6,
        temperature_std=0.2,
        sleep_duration_mean=7.5,
        sleep_duration_std=0.5,
        stress_level_mean=25.0,
        stress_level_std=5.0,
        fatigue_mean=2.0,
        fatigue_std=0.5
    )

    reading = HealthRecord(
        astronaut_id="ASTRO-DEV-01",
        heart_rate=90.0,  # +20 BPM above baseline
        blood_oxygen=98.0,
        systolic_bp=120.0,
        diastolic_bp=80.0,
        body_temperature=36.6,
        sleep_duration=7.5,
        sleep_quality=85.0,
        stress_level=25.0,
        fatigue_level=2.0
    )

    devs = compute_baseline_deviations(reading, baseline)
    hr_dev = devs["heart_rate"]
    assert hr_dev["delta"] == 20.0
    assert hr_dev["z_score"] == 4.0
    assert hr_dev["direction"] == "elevated"


def test_isolation_forest_minimum_history_gate():
    reading = HealthRecord(
        astronaut_id="ASTRO-IF-01",
        heart_rate=75.0,
        blood_oxygen=98.0,
        systolic_bp=120.0,
        diastolic_bp=80.0,
        body_temperature=36.6,
        sleep_duration=7.5,
        sleep_quality=85.0,
        stress_level=25.0,
        fatigue_level=2.0
    )

    # Less than 20 historical records
    short_history = [reading] * 10
    is_anomaly, score, reason = detect_multivariate_anomaly(reading, short_history)
    assert not is_anomaly
    assert score is None
    assert "inactive" in reason.lower()
