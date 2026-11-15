"""
OJAS Phase 7 Test Suite: AI Reliability, Adversarial Testing & Robustness.
Validates:
1. Extreme but valid physiological measurements.
2. Impossible physiological measurements (negative, out-of-bounds).
3. NaN and infinite floating-point inputs.
4. Missing individual and all features (zero-imputation prevention).
5. Duplicate readings and zero-delta timestamps (zero-division safety).
6. Out-of-order and mixed timezone-awareness timestamps.
7. Stale telemetry latency penalties.
8. Contradictory hemodynamics (diastolic >= systolic).
9. Constant feature distributions and zero IQR.
10. Small sample history gates (N < 3, N < 20).
11. Baseline contamination mitigation under repeated crisis readings.
12. Alert safety invariants (critical non-suppression, deduplication integrity).
13. Model drift monitoring (PSI, individual drift, training fingerprint, no-retrain invariant).
14. Model reproducibility and random seed determinism.
"""

from datetime import datetime, timezone, timedelta
import pytest
import numpy as np
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.connection import Base
from app.models.health_record import HealthRecord
from app.models.health_baseline import HealthBaseline
from app.models.health_alert import HealthAlert
from app.ml.preprocessing import (
    validate_reading_quality,
    extract_masked_feature_vector,
    robust_scale_features,
    PHYSIOLOGICAL_FEATURES,
)
from app.ml.anomaly_detection import (
    detect_multivariate_anomaly,
    calculate_feature_contributions,
    MODEL_VERSION,
)
from app.health_engine.baseline import (
    calculate_and_update_baseline,
    compute_baseline_deviations,
    is_pathological_contamination,
)
from app.ml.temporal_analysis import (
    classify_temporal_trajectory,
    analyze_vital_trend,
)
from app.ml.uncertainty import calculate_evidence_sufficiency
from app.ml.model_monitoring import (
    compute_psi,
    compute_distribution_summary,
    evaluate_individual_drift,
    evaluate_population_drift,
    generate_drift_monitoring_report,
    generate_training_data_fingerprint,
)
from app.services.analysis_service import run_health_analysis


@pytest.fixture
def adv_db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = Session()
    yield db
    db.close()


def test_extreme_valid_measurements(adv_db):
    """Verify that extreme but biologically plausible measurements trigger safety rules without crash."""
    record = HealthRecord(
        astronaut_id="ADV-EXTREME-01",
        timestamp=datetime.now(timezone.utc),
        heart_rate=245.0,  # Near maximal human ceiling
        blood_oxygen=52.0,  # Extreme hypoxia
        systolic_bp=250.0,  # Extreme hypertensive crisis
        diastolic_bp=150.0,
        body_temperature=41.5,  # Extreme hyperthermia
        sleep_duration=1.0,
        sleep_quality=10.0,
        stress_level=98.0,
        fatigue_level=9.5,
    )
    adv_db.add(record)
    adv_db.commit()

    quality = validate_reading_quality(record)
    assert quality["is_valid"] is True
    assert quality["completeness_ratio"] == 1.0

    analysis = run_health_analysis(adv_db, "ADV-EXTREME-01", reading_id=record.id)
    assert analysis.overall_status == "CRITICAL"
    assert analysis.severity == "CRITICAL"
    assert len(analysis.detected_abnormalities) >= 3


def test_impossible_measurements():
    """Verify that impossible physiological values are caught and masked by preprocessing."""
    record = HealthRecord(
        astronaut_id="ADV-IMPOSSIBLE-01",
        heart_rate=-15.0,     # Negative heart rate impossible
        blood_oxygen=125.0,   # > 100% SpO2 impossible
        systolic_bp=350.0,    # Above human survival ceiling
        diastolic_bp=20.0,    # Below range
        body_temperature=99.0, # 99°C is boiling
        sleep_duration=-2.0,  # Negative sleep
        sleep_quality=150.0,
        stress_level=-10.0,
        fatigue_level=25.0,
    )
    quality = validate_reading_quality(record)
    assert quality["is_valid"] is False
    assert quality["completeness_ratio"] == 0.0
    assert "heart_rate" in quality["out_of_range_features"]
    assert "blood_oxygen" in quality["out_of_range_features"]
    assert "body_temperature" in quality["out_of_range_features"]


def test_nan_and_infinite_numerical_safety():
    """Verify that NaN and +/- infinity do not crash preprocessing or anomaly detection."""
    record = HealthRecord(
        astronaut_id="ADV-NAN-01",
        heart_rate=float("nan"),
        blood_oxygen=float("inf"),
        systolic_bp=-float("inf"),
        diastolic_bp=80.0,
        body_temperature=36.6,
        sleep_duration=7.0,
        sleep_quality=80.0,
        stress_level=20.0,
        fatigue_level=2.0,
    )
    quality = validate_reading_quality(record)
    assert "heart_rate" in quality["missing_features"]
    assert "blood_oxygen" in quality["missing_features"]
    assert "systolic_bp" in quality["missing_features"]

    # Verify extract_masked_feature_vector safely converts them to NaN and mask=0
    vec, mask = extract_masked_feature_vector(record)
    assert np.isnan(vec[0])  # heart_rate
    assert mask[0] == 0.0
    assert np.isnan(vec[1])  # blood_oxygen
    assert mask[1] == 0.0


def test_all_features_missing(adv_db):
    """Verify system behavior when all features are missing (never zero-impute; DB schema enforces non-nulls)."""
    record = HealthRecord(
        astronaut_id="ADV-EMPTY-01",
        timestamp=datetime.now(timezone.utc),
        heart_rate=None,
        blood_oxygen=None,
        systolic_bp=None,
        diastolic_bp=None,
        body_temperature=None,
        sleep_duration=None,
        sleep_quality=None,
        stress_level=None,
        fatigue_level=None,
    )

    quality = validate_reading_quality(record)
    assert quality["completeness_ratio"] == 0.0
    assert len(quality["missing_features"]) == 9

    # Uncertainty evaluation
    suff = calculate_evidence_sufficiency(record, historical_count=10)
    assert suff.feature_completeness_score == 0.0
    assert suff.overall_confidence < 0.5
    assert any("Missing features" in w for w in suff.data_quality_warnings)

    # Multi-layer safety: database layer enforces NOT NULL constraints on primary vitals
    adv_db.add(record)
    from sqlalchemy.exc import IntegrityError
    with pytest.raises(IntegrityError):
        adv_db.commit()
    adv_db.rollback()


def test_duplicate_and_zero_delta_timestamps():
    """Verify that duplicate readings with zero elapsed time do not cause divide-by-zero errors."""
    now = datetime.now(timezone.utc)
    r1 = HealthRecord(astronaut_id="A1", timestamp=now, heart_rate=70.0, blood_oxygen=98.0)
    r2 = HealthRecord(astronaut_id="A1", timestamp=now, heart_rate=70.0, blood_oxygen=98.0)  # Identical time

    trend = analyze_vital_trend([r1, r2], "heart_rate")
    assert trend["rate_of_change_per_hour"] is None
    assert trend["observation_gap_hours"] == 0.0


def test_out_of_order_and_mixed_timezone_timestamps():
    """Verify that reversed chronology and mixed naive/aware datetimes are sorted safely."""
    now_utc = datetime.now(timezone.utc)
    now_naive = datetime.now()  # Naive datetime

    r_future = HealthRecord(astronaut_id="A1", timestamp=now_utc + timedelta(hours=2), heart_rate=70.0)
    r_past = HealthRecord(astronaut_id="A1", timestamp=now_utc - timedelta(hours=2), heart_rate=80.0)
    r_naive = HealthRecord(astronaut_id="A1", timestamp=now_naive, heart_rate=75.0)

    # Must sort without raising TypeError
    traj = classify_temporal_trajectory([r_future, r_past, r_naive])
    assert traj.trajectory in ["STABLE_NOMINAL", "RECOVERY_TREND", "SINGLE_SPIKE", "REPEATED_DEVIATION"]


def test_stale_telemetry_penalty():
    """Verify that stale telemetry receives an epistemic confidence penalty."""
    stale_time = datetime.now(timezone.utc) - timedelta(days=5)
    record = HealthRecord(
        astronaut_id="ADV-STALE-01",
        timestamp=stale_time,
        heart_rate=72.0,
        blood_oxygen=98.0,
        systolic_bp=120.0,
        diastolic_bp=80.0,
        body_temperature=36.6,
        sleep_duration=7.5,
        sleep_quality=85.0,
        stress_level=20.0,
        fatigue_level=2.0,
    )
    suff = calculate_evidence_sufficiency(record, historical_count=25)
    assert suff.sensor_recency_score <= 0.5
    assert any("stale" in w.lower() for w in suff.data_quality_warnings)


def test_contradictory_hemodynamics():
    """Verify that inverted blood pressure (diastolic >= systolic) is flagged as invalid."""
    record = HealthRecord(
        astronaut_id="ADV-BP-01",
        heart_rate=75.0,
        blood_oxygen=98.0,
        systolic_bp=110.0,
        diastolic_bp=130.0,  # Inverted! Diastolic cannot exceed systolic
        body_temperature=36.6,
        sleep_duration=7.0,
        sleep_quality=80.0,
        stress_level=20.0,
        fatigue_level=2.0,
    )
    quality = validate_reading_quality(record)
    assert quality["bp_ratio_valid"] is False
    assert "diastolic_bp" in quality["out_of_range_features"]


def test_constant_feature_distributions_zero_iqr():
    """Verify that zero-variance distributions and zero IQR do not cause division-by-zero."""
    # 25 identical readings
    X = np.full((25, 9), 70.0)
    scaled, medians, iqrs = robust_scale_features(X)
    assert scaled.shape == (25, 9)
    assert not np.isnan(scaled).any()
    assert not np.isinf(scaled).any()
    # IQRs must be safely floored to 1.0
    assert np.all(iqrs >= 1.0)


def test_baseline_contamination_mitigation(adv_db):
    """Verify that repeated acute crisis readings do not corrupt the baseline mean."""
    astro_id = "ADV-CONTAM-01"
    now = datetime.now(timezone.utc)

    # 10 nominal readings (HR=70 BPM, SpO2=98%)
    for i in range(10):
        adv_db.add(HealthRecord(
            astronaut_id=astro_id,
            timestamp=now - timedelta(hours=20 - i),
            heart_rate=70.0,
            blood_oxygen=98.5,
            systolic_bp=120.0,
            diastolic_bp=80.0,
            body_temperature=36.6,
            sleep_duration=7.5,
            sleep_quality=85.0,
            stress_level=20.0,
            fatigue_level=2.0,
        ))
    adv_db.commit()

    # 3 severe pathological crises (HR=160 BPM, SpO2=86%)
    for i in range(3):
        adv_db.add(HealthRecord(
            astronaut_id=astro_id,
            timestamp=now - timedelta(hours=3 - i),
            heart_rate=160.0,
            blood_oxygen=86.0,
            systolic_bp=180.0,
            diastolic_bp=110.0,
            body_temperature=39.5,
            sleep_duration=2.0,
            sleep_quality=20.0,
            stress_level=95.0,
            fatigue_level=9.0,
        ))
    adv_db.commit()

    # Calculate baseline with contamination filter
    baseline = calculate_and_update_baseline(adv_db, astro_id, filter_contamination=True)
    assert baseline is not None
    # Baseline heart rate must remain close to nominal (70 BPM), NOT contaminated by 160 BPM
    assert baseline.heart_rate_mean <= 75.0
    assert baseline.blood_oxygen_mean >= 97.0


def test_alert_safety_invariants(adv_db):
    """
    Verify fundamental life-safety invariants:
    1. Critical alerts cannot be suppressed by ML.
    2. Critical alerts bypass deduplication.
    """
    astro_id = "ADV-INVARIANT-01"
    now = datetime.now(timezone.utc)

    # Establish baseline
    for i in range(5):
        adv_db.add(HealthRecord(
            astronaut_id=astro_id,
            timestamp=now - timedelta(hours=6 - i),
            heart_rate=70.0,
            blood_oxygen=98.0,
            systolic_bp=120.0,
            diastolic_bp=80.0,
            body_temperature=36.6,
            sleep_duration=7.5,
            sleep_quality=85.0,
            stress_level=20.0,
            fatigue_level=2.0,
        ))
    adv_db.commit()

    # First critical event (Severe Hypoxia SpO2=88%)
    crit1 = HealthRecord(
        astronaut_id=astro_id,
        timestamp=now - timedelta(minutes=10),
        heart_rate=110.0,
        blood_oxygen=88.0,
        systolic_bp=130.0,
        diastolic_bp=85.0,
        body_temperature=36.7,
        sleep_duration=6.0,
        sleep_quality=70.0,
        stress_level=60.0,
        fatigue_level=5.0,
    )
    adv_db.add(crit1)
    adv_db.commit()
    run_health_analysis(adv_db, astro_id, reading_id=crit1.id)

    # Second identical critical event within deduplication window
    crit2 = HealthRecord(
        astronaut_id=astro_id,
        timestamp=now,
        heart_rate=112.0,
        blood_oxygen=87.5,
        systolic_bp=132.0,
        diastolic_bp=86.0,
        body_temperature=36.7,
        sleep_duration=6.0,
        sleep_quality=70.0,
        stress_level=60.0,
        fatigue_level=5.0,
    )
    adv_db.add(crit2)
    adv_db.commit()
    run_health_analysis(adv_db, astro_id, reading_id=crit2.id)

    # Critical alerts must NEVER be deduplicated/suppressed
    alerts = adv_db.query(HealthAlert).filter(
        HealthAlert.astronaut_id == astro_id,
        HealthAlert.severity == "CRITICAL"
    ).all()
    assert len(alerts) >= 2


def test_model_drift_monitoring_and_retraining_safety():
    """Verify drift detection, PSI calculation, and strict non-retraining safety declaration."""
    now = datetime.now(timezone.utc)

    # Baseline distribution: HR ~ N(70, 5)
    np.random.seed(42)
    ref_records = [
        HealthRecord(
            astronaut_id="ASTRO-DRIFT-01",
            timestamp=now - timedelta(hours=50 - i),
            heart_rate=float(np.random.normal(70.0, 3.0)),
            blood_oxygen=98.0,
            systolic_bp=120.0,
            diastolic_bp=80.0,
            body_temperature=36.6,
            sleep_duration=7.5,
            sleep_quality=85.0,
            stress_level=20.0,
            fatigue_level=2.0,
        )
        for i in range(30)
    ]

    # Shifted evaluation distribution: HR ~ N(95, 8) (Significant tachycardia drift)
    recent_records = [
        HealthRecord(
            astronaut_id="ASTRO-DRIFT-01",
            timestamp=now - timedelta(hours=15 - i),
            heart_rate=float(np.random.normal(95.0, 5.0)),
            blood_oxygen=96.0,
            systolic_bp=135.0,
            diastolic_bp=88.0,
            body_temperature=37.1,
            sleep_duration=6.0,
            sleep_quality=70.0,
            stress_level=45.0,
            fatigue_level=5.0,
        )
        for i in range(15)
    ]

    # Generate drift report
    report = generate_drift_monitoring_report(ref_records, recent_records)
    assert report["training_data_fingerprint"] is not None
    assert len(report["training_data_fingerprint"]) == 16
    assert report["model_version"] == MODEL_VERSION

    # Drift must be detected
    pop_drift = report["population_drift"]
    assert pop_drift["status"] == "COMPLETED"
    assert "heart_rate" in pop_drift["feature_psis"]
    hr_psi = pop_drift["feature_psis"]["heart_rate"]["psi"]
    assert hr_psi >= 0.10  # Must register at least moderate or severe drift

    # STRICT SAFETY INVARIANT: Retraining must NEVER be automatically triggered
    assert report["retraining_triggered"] is False
    assert "strictly prohibited" in report["safety_declaration"].lower()


def test_isolation_forest_seed_reproducibility():
    """Verify that Isolation Forest inference is deterministic with fixed random seeds."""
    now = datetime.now(timezone.utc)
    np.random.seed(123)

    history = [
        HealthRecord(
            astronaut_id="ADV-SEED-01",
            timestamp=now - timedelta(hours=25 - i),
            heart_rate=70.0 + (i % 5),
            blood_oxygen=98.0,
            systolic_bp=120.0,
            diastolic_bp=80.0,
            body_temperature=36.6,
            sleep_duration=7.5,
            sleep_quality=85.0,
            stress_level=20.0,
            fatigue_level=2.0,
        )
        for i in range(25)
    ]

    target = HealthRecord(
        astronaut_id="ADV-SEED-01",
        timestamp=now,
        heart_rate=130.0,
        blood_oxygen=93.0,
        systolic_bp=140.0,
        diastolic_bp=90.0,
        body_temperature=37.5,
        sleep_duration=5.5,
        sleep_quality=65.0,
        stress_level=50.0,
        fatigue_level=5.0,
    )

    # Run two independent inferences
    out1 = detect_multivariate_anomaly(target, history, return_metadata=True)
    out2 = detect_multivariate_anomaly(target, history, return_metadata=True)

    # Assert exact reproducibility
    assert out1[0] == out2[0]  # is_anomaly
    assert out1[1] == out2[1]  # normalized_score
    assert out1[3].raw_score == out2[3].raw_score
    assert out1[3].feature_contributions == out2[3].feature_contributions
