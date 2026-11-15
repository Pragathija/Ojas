"""
OJAS Phase 6 Test Suite: AI Intelligence Enhancement & Scientific Validation.
Validates:
1. Preprocessing, sensor quality verification, and zero-imputation prevention.
2. Robust Median/IQR feature scaling.
3. Advanced multivariate Isolation Forest with feature contribution vectors and versioning.
4. Contamination-resistant personal baselines and non-parametric percentiles.
5. Dedicated temporal deterioration detection and trajectory classification.
6. Structured explainable AI diagnostic evidence cards.
7. Epistemic uncertainty, evidence sufficiency, and OOD detection.
8. Classification metrics, confusion matrix, and subject-level holdout validation.
9. Scientific domain boundary preservation.
10. End-to-end integration and non-suppression guarantee.
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
    compute_sma,
    compute_ema,
    analyze_vital_trend,
    classify_temporal_trajectory,
)
from app.ml.uncertainty import calculate_evidence_sufficiency
from app.ml.explainability import (
    build_metric_evidence_cards,
    synthesize_explainable_assessment,
)
from app.ml.evaluation import (
    compute_classification_metrics,
    SubjectHoldoutValidator,
    verify_scientific_boundary_compliance,
)
from app.services.analysis_service import run_health_analysis


@pytest.fixture
def phase6_db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = Session()
    yield db
    db.close()


def test_preprocessing_and_zero_imputation_prevention():
    """Verify that missing vitals are NEVER zero-imputed and invalid data is caught."""
    # Complete nominal record
    record = HealthRecord(
        astronaut_id="ASTRO-P6-01",
        heart_rate=72.0,
        blood_oxygen=98.0,
        systolic_bp=120.0,
        diastolic_bp=80.0,
        body_temperature=36.7,
        sleep_duration=7.5,
        sleep_quality=85.0,
        stress_level=20.0,
        fatigue_level=2.0
    )
    quality = validate_reading_quality(record)
    assert quality["is_valid"] is True
    assert quality["completeness_ratio"] == 1.0
    assert len(quality["missing_features"]) == 0

    # Record with missing fields
    partial = HealthRecord(
        astronaut_id="ASTRO-P6-01",
        heart_rate=72.0,
        blood_oxygen=98.0,
        systolic_bp=120.0,
        diastolic_bp=80.0,
        body_temperature=None,  # Missing
        sleep_duration=None,    # Missing
        sleep_quality=85.0,
        stress_level=20.0,
        fatigue_level=2.0
    )
    p_quality = validate_reading_quality(partial)
    assert "body_temperature" in p_quality["missing_features"]
    assert "sleep_duration" in p_quality["missing_features"]

    vec, mask = extract_masked_feature_vector(partial)
    # Never zero-impute: missing features must be NaN in the raw array
    temp_idx = PHYSIOLOGICAL_FEATURES.index("body_temperature")
    assert np.isnan(vec[temp_idx])
    assert mask[temp_idx] == 0.0


def test_robust_scaling():
    """Verify median/IQR scaling balances features with disparate orders of magnitude."""
    # Data with high variance in HR and small variance in Temp
    X = np.array([
        [60.0, 36.4],
        [70.0, 36.6],
        [80.0, 36.8],
        [150.0, 39.5],  # Outlier
    ])
    scaled, medians, iqrs = robust_scale_features(X)
    assert scaled.shape == (4, 2)
    # Medians must match column medians
    assert medians[0] == 75.0
    assert round(medians[1], 2) == 36.7


def test_anomaly_detection_with_robust_scaling_and_metadata():
    """Verify advanced Isolation Forest returns versioned metadata and attribution."""
    now = datetime.now(timezone.utc)
    history = []
    # Create 25 nominal historical records
    for i in range(25):
        history.append(HealthRecord(
            astronaut_id="ASTRO-P6-02",
            timestamp=now - timedelta(hours=25 - i),
            heart_rate=70.0 + (i % 4),
            blood_oxygen=98.0,
            systolic_bp=120.0,
            diastolic_bp=80.0,
            body_temperature=36.6,
            sleep_duration=7.5,
            sleep_quality=85.0,
            stress_level=20.0,
            fatigue_level=2.0
        ))

    # An anomalous reading with spiked heart rate and fever
    anomalous_reading = HealthRecord(
        astronaut_id="ASTRO-P6-02",
        timestamp=now,
        heart_rate=145.0,  # Extreme spike
        blood_oxygen=94.0,
        systolic_bp=135.0,
        diastolic_bp=85.0,
        body_temperature=38.9,  # High fever
        sleep_duration=6.0,
        sleep_quality=70.0,
        stress_level=65.0,
        fatigue_level=6.0
    )

    is_anomaly, score, explanation, meta = detect_multivariate_anomaly(
        anomalous_reading,
        history,
        return_metadata=True
    )

    assert meta.model_version == MODEL_VERSION
    assert meta.sample_size == 25
    assert score is not None
    assert is_anomaly is True
    assert "heart_rate" in meta.feature_contributions
    # Top contributor should reflect the large deviation
    assert meta.feature_contributions["heart_rate"] > 0.15


def test_baseline_contamination_filtering():
    """Verify that acute pathological readings do not corrupt the baseline."""
    now = datetime.now(timezone.utc)

    # 10 nominal readings
    clean_readings = [
        HealthRecord(
            astronaut_id="ASTRO-P6-03",
            timestamp=now - timedelta(hours=20 - i),
            heart_rate=70.0,
            blood_oxygen=98.5,
            systolic_bp=120.0,
            diastolic_bp=80.0,
            body_temperature=36.6,
            sleep_duration=7.5,
            sleep_quality=85.0,
            stress_level=20.0,
            fatigue_level=2.0
        )
        for i in range(10)
    ]

    # Acute crisis reading
    crisis_reading = HealthRecord(
        astronaut_id="ASTRO-P6-03",
        timestamp=now,
        heart_rate=160.0,
        blood_oxygen=86.0,  # Severe hypoxia
        systolic_bp=180.0,
        diastolic_bp=110.0,
        body_temperature=39.5,
        sleep_duration=2.0,
        sleep_quality=20.0,
        stress_level=95.0,
        fatigue_level=9.0
    )

    assert is_pathological_contamination(crisis_reading) is True
    assert is_pathological_contamination(clean_readings[0]) is False


def test_temporal_trajectories():
    """Verify trajectory classification: single spike vs gradual deterioration vs recovery."""
    now = datetime.now(timezone.utc)

    # 1. Single spike: nominal -> nominal -> spike
    spike_records = [
        HealthRecord(astronaut_id="A1", timestamp=now - timedelta(hours=2), heart_rate=70.0, blood_oxygen=98.0),
        HealthRecord(astronaut_id="A1", timestamp=now - timedelta(hours=1), heart_rate=71.0, blood_oxygen=98.0),
        HealthRecord(astronaut_id="A1", timestamp=now, heart_rate=125.0, blood_oxygen=98.0),  # Spike
    ]
    t_spike = classify_temporal_trajectory(spike_records)
    assert t_spike.trajectory == "SINGLE_SPIKE"
    assert t_spike.consecutive_abnormalities == 1

    # 2. Gradual deterioration: monotonic SpO2 decline
    deteriorating_records = [
        HealthRecord(astronaut_id="A1", timestamp=now - timedelta(hours=3), heart_rate=72.0, blood_oxygen=96.0),
        HealthRecord(astronaut_id="A1", timestamp=now - timedelta(hours=2), heart_rate=78.0, blood_oxygen=93.0),
        HealthRecord(astronaut_id="A1", timestamp=now - timedelta(hours=1), heart_rate=88.0, blood_oxygen=91.0),
        HealthRecord(astronaut_id="A1", timestamp=now, heart_rate=95.0, blood_oxygen=89.0),
    ]
    t_det = classify_temporal_trajectory(deteriorating_records)
    assert t_det.trajectory in ("GRADUAL_DETERIORATION", "REPEATED_DEVIATION")

    # 3. Recovery trend: abnormal -> normal
    recovery_records = [
        HealthRecord(astronaut_id="A1", timestamp=now - timedelta(hours=2), heart_rate=120.0, blood_oxygen=91.0),
        HealthRecord(astronaut_id="A1", timestamp=now, heart_rate=74.0, blood_oxygen=98.0),
    ]
    t_rec = classify_temporal_trajectory(recovery_records)
    assert t_rec.trajectory == "RECOVERY_TREND"


def test_evidence_sufficiency_and_uncertainty():
    """Verify uncertainty estimation cleanly separates confidence from clinical severity."""
    # Complete, fresh record with 25 historical samples
    record = HealthRecord(
        astronaut_id="ASTRO-P6-04",
        timestamp=datetime.now(timezone.utc),
        heart_rate=72.0,
        blood_oxygen=98.0,
        systolic_bp=120.0,
        diastolic_bp=80.0,
        body_temperature=36.6,
        sleep_duration=7.5,
        sleep_quality=85.0,
        stress_level=20.0,
        fatigue_level=2.0
    )
    suff_high = calculate_evidence_sufficiency(record, historical_count=25)
    assert suff_high.overall_confidence >= 0.8
    assert suff_high.feature_completeness_score == 1.0
    assert suff_high.sample_maturity_score == 1.0
    assert not suff_high.is_out_of_distribution

    # Immature sample count and missing features
    partial_record = HealthRecord(
        astronaut_id="ASTRO-P6-04",
        timestamp=datetime.now(timezone.utc),
        heart_rate=72.0,
        blood_oxygen=98.0,
        systolic_bp=None,
        diastolic_bp=None,
        body_temperature=None,
        sleep_duration=7.5,
        sleep_quality=85.0,
        stress_level=20.0,
        fatigue_level=2.0
    )
    suff_low = calculate_evidence_sufficiency(partial_record, historical_count=2)
    assert suff_low.overall_confidence < suff_high.overall_confidence
    assert len(suff_low.data_quality_warnings) > 0


def test_explainable_diagnostic_cards():
    """Verify structured explainable metric diagnostic cards."""
    record = HealthRecord(
        astronaut_id="ASTRO-P6-05",
        heart_rate=115.0,  # Caution
        blood_oxygen=89.0,  # Critical
        systolic_bp=120.0,
        diastolic_bp=80.0,
        body_temperature=36.6,
        sleep_duration=7.5,
        sleep_quality=85.0,
        stress_level=20.0,
        fatigue_level=2.0
    )
    cards = build_metric_evidence_cards(record, baseline=None, baseline_deviations={})
    spo2_card = next((c for c in cards if c.metric == "Blood Oxygen (SpO2)"), None)
    hr_card = next((c for c in cards if c.metric == "Heart Rate"), None)

    assert spo2_card is not None
    assert spo2_card.status == "CRITICAL"
    assert "hypoxemia" in spo2_card.rationale.lower()

    assert hr_card is not None
    assert hr_card.status == "CAUTION"


def test_evaluation_metrics_and_confusion_matrix():
    """Verify precision, recall, F1, specificity, FPR, and FNR calculations."""
    y_true = [1, 1, 1, 1, 0, 0, 0, 0]
    y_pred = [1, 1, 1, 0, 0, 0, 1, 0]

    # TP: 3, FN: 1, TN: 3, FP: 1
    metrics = compute_classification_metrics(y_true, y_pred)
    assert metrics.tp == 3
    assert metrics.fn == 1
    assert metrics.tn == 3
    assert metrics.fp == 1
    assert metrics.precision == 0.75  # 3 / (3 + 1)
    assert metrics.recall == 0.75     # 3 / (3 + 1)
    assert metrics.specificity == 0.75 # 3 / (3 + 1)
    assert metrics.f1_score == 0.75
    assert metrics.false_positive_rate == 0.25 # 1 / (1 + 3)
    assert metrics.false_negative_rate == 0.25 # 1 / (1 + 3)


def test_subject_holdout_validator():
    """Verify strict zero-data-leakage subject splitting."""
    records = [
        {"subject_id": "S1", "val": 10},
        {"subject_id": "S1", "val": 12},
        {"subject_id": "S2", "val": 20},
        {"subject_id": "S3", "val": 30},
        {"subject_id": "S4", "val": 40},
        {"subject_id": "S5", "val": 50},
    ]
    train_recs, test_recs, train_subj, test_subj = SubjectHoldoutValidator.split_by_subject(
        records, subject_key="subject_id", test_ratio=0.4, random_seed=42
    )

    assert len(train_recs) > 0
    assert len(test_recs) > 0
    assert train_subj.isdisjoint(test_subj)
    # Ensure no record in test has a subject from train
    for r in test_recs:
        assert r["subject_id"] not in train_subj


def test_scientific_boundary_compliance():
    """Verify scientific boundary prevents illegal mixing of analog and clinical ICU datasets."""
    # Compliant: real research with real research
    ok, msg = verify_scientific_boundary_compliance("physionet_bidmc", "mit_bih")
    assert ok is True

    # Boundary violation: spaceflight analog (BRSMAct) cannot cross-train against clinical ICU (BIDMC)
    viol, vmsg = verify_scientific_boundary_compliance("nasa_brsmact", "physionet_bidmc")
    assert viol is False
    assert "boundary violation" in vmsg.lower()


def test_end_to_end_analysis_service_with_phase6_engine(phase6_db):
    """Verify analysis_service runs cleanly with all Phase 6 enhancements and non-suppression guarantee."""
    astro_id = "ASTRO-P6-INTEG"

    # Add 5 baseline records
    now = datetime.now(timezone.utc)
    for i in range(5):
        r = HealthRecord(
            astronaut_id=astro_id,
            timestamp=now - timedelta(hours=6 - i),
            heart_rate=70.0 + i,
            blood_oxygen=98.0,
            systolic_bp=120.0,
            diastolic_bp=80.0,
            body_temperature=36.6,
            sleep_duration=7.5,
            sleep_quality=85.0,
            stress_level=20.0,
            fatigue_level=2.0
        )
        phase6_db.add(r)
    phase6_db.commit()

    # Induce acute hypoxia event
    crisis = HealthRecord(
        astronaut_id=astro_id,
        timestamp=now,
        heart_rate=120.0,
        blood_oxygen=88.0,  # Critical
        systolic_bp=135.0,
        diastolic_bp=85.0,
        body_temperature=36.8,
        sleep_duration=5.0,
        sleep_quality=60.0,
        stress_level=60.0,
        fatigue_level=6.0
    )
    phase6_db.add(crisis)
    phase6_db.commit()

    # Run analysis
    analysis_res = run_health_analysis(phase6_db, astronaut_id=astro_id, reading_id=crisis.id)

    # Check non-suppression guarantee: Must be CRITICAL
    assert analysis_res.overall_status == "CRITICAL"
    assert analysis_res.severity == "CRITICAL"

    # Check enriched payload in baseline_deviations
    devs = analysis_res.baseline_deviations
    assert "_temporal_trajectory" in devs
    assert "_uncertainty" in devs
    assert "_diagnostic_cards" in devs
    assert "_ml_metadata" in devs

    # Check that alert was created
    alerts = phase6_db.query(HealthAlert).filter(HealthAlert.astronaut_id == astro_id).all()
    assert len(alerts) > 0
    assert any(a.severity == "CRITICAL" for a in alerts)
