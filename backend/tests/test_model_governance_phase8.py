"""
OJAS Phase 8 Test Suite: Production AI Engineering & Model Governance.
Validates:
1. Model registration, metadata schemas, and version immutability.
2. Formal lifecycle state machine transitions and audit trails.
3. Approval gates (activation strictly requires prior approval).
4. Safe model rollback with feature schema compatibility verification.
5. Cryptographic SHA-256 artifact verification and tamper detection.
6. Schema drift and sensor channel missingness drift monitoring.
7. End-to-end inference auditability (_model_governance payload).
8. Operational resilience and critical alert non-suppression during ML outages.
"""

from datetime import datetime, timezone, timedelta
import pytest
import hashlib
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.connection import Base
from app.models.health_record import HealthRecord
from app.models.health_alert import HealthAlert
from app.ml.model_registry import (
    ModelRegistry,
    ModelRecord,
    ModelLifecycleState,
    InvalidLifecycleTransition,
    ModelApprovalRequired,
    SchemaIncompatibilityError,
)
from app.ml.model_monitoring import (
    evaluate_schema_drift,
    evaluate_missingness_drift,
    generate_drift_monitoring_report,
)
from app.services.analysis_service import run_health_analysis
from app.ml.preprocessing import PHYSIOLOGICAL_FEATURES


@pytest.fixture
def temp_registry(tmp_path):
    """Provides an isolated registry backed by a temporary file."""
    reg_file = tmp_path / "test_registry.json"
    return ModelRegistry(registry_file=reg_file)


@pytest.fixture
def gov_db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = Session()
    yield db
    db.close()


def test_model_registration_and_lookup(temp_registry):
    """Verify model registration, semantic version lookup, and overwrite protection."""
    now_iso = datetime.now(timezone.utc).isoformat()
    record = ModelRecord(
        model_id="test-model",
        version="1.0.0",
        algorithm="IsolationForest",
        training_data_fingerprint="sha256-test-data",
        training_timestamp=now_iso,
        random_seed=42,
        feature_schema=list(PHYSIOLOGICAL_FEATURES),
        feature_schema_version="v1.0",
        preprocessing_config={"scaler": "RobustMedianIQR"},
        model_params={"n_estimators": 50},
        evaluation_metrics={"f1": 0.95},
        lifecycle_status=ModelLifecycleState.DEVELOPMENT,
    )
    temp_registry.register_model(record)

    # Retrieval
    retrieved = temp_registry.get_model("test-model", "1.0.0")
    assert retrieved is not None
    assert retrieved.model_id == "test-model"
    assert retrieved.version == "1.0.0"
    assert retrieved.lifecycle_status == ModelLifecycleState.DEVELOPMENT

    # Overwrite protection
    with pytest.raises(ValueError) as excinfo:
        temp_registry.register_model(record)
    assert "already exists" in str(excinfo.value)


def test_lifecycle_state_transitions(temp_registry):
    """Verify valid progression: DEV -> TRAINED -> VALIDATED -> APPROVED -> ACTIVE."""
    now_iso = datetime.now(timezone.utc).isoformat()
    record = ModelRecord(
        model_id="flow-model",
        version="1.0.0",
        algorithm="IsolationForest",
        training_data_fingerprint="sha256-flow",
        training_timestamp=now_iso,
        random_seed=42,
        feature_schema=list(PHYSIOLOGICAL_FEATURES),
        feature_schema_version="v1.0",
        preprocessing_config={},
        model_params={},
        evaluation_metrics={"precision": 0.95, "recall": 0.98},
        lifecycle_status=ModelLifecycleState.DEVELOPMENT,
    )
    temp_registry.register_model(record)

    # 1. Dev -> Trained
    temp_registry.transition_state("flow-model", "1.0.0", ModelLifecycleState.TRAINED, actor="Engineer", reason="Training complete")
    assert temp_registry.get_model("flow-model", "1.0.0").lifecycle_status == ModelLifecycleState.TRAINED

    # 2. Trained -> Validated
    temp_registry.transition_state("flow-model", "1.0.0", ModelLifecycleState.VALIDATED, actor="QA Harness", reason="Validation passed")
    assert temp_registry.get_model("flow-model", "1.0.0").lifecycle_status == ModelLifecycleState.VALIDATED

    # 3. Validated -> Approved
    temp_registry.approve_model("flow-model", "1.0.0", approved_by="Flight Surgeon Dr. Smith", notes="Approved for crew telemetry")
    rec_approved = temp_registry.get_model("flow-model", "1.0.0")
    assert rec_approved.lifecycle_status == ModelLifecycleState.APPROVED
    assert rec_approved.approval_metadata["approved_by"] == "Flight Surgeon Dr. Smith"

    # 4. Approved -> Active
    temp_registry.activate_model("flow-model", "1.0.0", actor="Mission Control")
    assert temp_registry.get_model("flow-model", "1.0.0").lifecycle_status == ModelLifecycleState.ACTIVE
    assert len(temp_registry.get_model("flow-model", "1.0.0").history_transitions) == 4


def test_approval_requirement_before_activation(temp_registry):
    """Verify activation is strictly blocked without prior approval."""
    now_iso = datetime.now(timezone.utc).isoformat()
    record = ModelRecord(
        model_id="unapproved-model",
        version="1.0.0",
        algorithm="IsolationForest",
        training_data_fingerprint="sha256-unapproved",
        training_timestamp=now_iso,
        random_seed=42,
        feature_schema=list(PHYSIOLOGICAL_FEATURES),
        feature_schema_version="v1.0",
        preprocessing_config={},
        model_params={},
        evaluation_metrics={},
        lifecycle_status=ModelLifecycleState.VALIDATED,  # Validated but NOT approved
    )
    temp_registry.register_model(record)

    # Activation must raise ModelApprovalRequired
    with pytest.raises(ModelApprovalRequired):
        temp_registry.activate_model("unapproved-model", "1.0.0", actor="Rogue Operator")

    # Illegal state jump (DEVELOPMENT -> APPROVED directly) must raise InvalidLifecycleTransition
    dev_record = ModelRecord(
        model_id="jump-model",
        version="1.0.0",
        algorithm="IsolationForest",
        training_data_fingerprint="sha256-jump",
        training_timestamp=now_iso,
        random_seed=42,
        feature_schema=list(PHYSIOLOGICAL_FEATURES),
        feature_schema_version="v1.0",
        preprocessing_config={},
        model_params={},
        evaluation_metrics={},
        lifecycle_status=ModelLifecycleState.DEVELOPMENT,
    )
    temp_registry.register_model(dev_record)
    with pytest.raises(InvalidLifecycleTransition):
        temp_registry.approve_model("jump-model", "1.0.0", approved_by="Doctor", notes="Skipping validation")


def test_safe_model_rollback(temp_registry):
    """Verify rollback safely transitions the active model and restores target."""
    # Seed already has v2.0.0 ACTIVE and v1.0.0 APPROVED
    active_before = temp_registry.get_active_model("ojas-isoforest")
    assert active_before.version == "2.0.0"

    # Roll back to 1.0.0
    deactivated, activated = temp_registry.rollback_model(
        model_id="ojas-isoforest",
        target_version="1.0.0",
        actor="Flight Surgeon",
        reason="Sensor drift on new features"
    )

    assert deactivated.version == "2.0.0"
    assert deactivated.lifecycle_status == ModelLifecycleState.ROLLED_BACK

    assert activated.version == "1.0.0"
    assert activated.lifecycle_status == ModelLifecycleState.ACTIVE

    # Active model query must now return 1.0.0
    assert temp_registry.get_active_model("ojas-isoforest").version == "1.0.0"


def test_rollback_failure_on_schema_mismatch(temp_registry):
    """Verify rollback is aborted if the target model has an incompatible feature schema."""
    now_iso = datetime.now(timezone.utc).isoformat()
    incompatible_record = ModelRecord(
        model_id="ojas-isoforest",
        version="0.5.0",
        algorithm="IsolationForest",
        training_data_fingerprint="sha256-incompatible",
        training_timestamp=now_iso,
        random_seed=42,
        feature_schema=["heart_rate", "blood_oxygen"],  # Incomplete schema! Missing 7 features
        feature_schema_version="v0.5",
        preprocessing_config={},
        model_params={},
        evaluation_metrics={},
        lifecycle_status=ModelLifecycleState.APPROVED,
    )
    temp_registry.register_model(incompatible_record)

    with pytest.raises(SchemaIncompatibilityError):
        temp_registry.rollback_model(
            model_id="ojas-isoforest",
            target_version="0.5.0",
            actor="Operator",
            reason="Attempting rollback to incompatible schema"
        )


def test_cryptographic_artifact_integrity():
    """Verify SHA-256 artifact verification catches tampered bytes."""
    valid_bytes = b"ojas-isoforest-production-model-binary-weights"
    expected_hash = hashlib.sha256(valid_bytes).hexdigest()

    # Valid check
    assert ModelRegistry.verify_artifact_hash(valid_bytes, expected_hash) is True

    # Tampered check
    tampered_bytes = b"ojas-isoforest-tampered-payload"
    assert ModelRegistry.verify_artifact_hash(tampered_bytes, expected_hash) is False


def test_schema_drift_detection():
    """Verify schema drift correctly flags missing or unexpected features."""
    # 1. Nominal: Exact match
    res_nom = evaluate_schema_drift(PHYSIOLOGICAL_FEATURES)
    assert res_nom["severity"] == "NOMINAL"
    assert res_nom["is_schema_valid"] is True

    # 2. Severe: Missing core features
    corrupted_features = ["heart_rate", "blood_oxygen"]  # Missing 7 features
    res_sev = evaluate_schema_drift(corrupted_features)
    assert res_sev["severity"] == "SEVERE_DRIFT"
    assert res_sev["is_schema_valid"] is False
    assert "systolic_bp" in res_sev["missing_features"]

    # 3. Moderate: Unexpected extra features
    extra_features = PHYSIOLOGICAL_FEATURES + ["unknown_cosmic_ray_sensor"]
    res_mod = evaluate_schema_drift(extra_features)
    assert res_mod["severity"] == "MODERATE_DRIFT"
    assert "unknown_cosmic_ray_sensor" in res_mod["unexpected_features"]


def test_sensor_missingness_drift_detection():
    """Verify sensor dropout surge triggers SEVERE_DRIFT monitoring events."""
    now = datetime.now(timezone.utc)
    # Reference records: 0% missing SpO2
    ref_records = [
        HealthRecord(astronaut_id="A1", timestamp=now - timedelta(hours=i), heart_rate=70.0, blood_oxygen=98.0)
        for i in range(20)
    ]

    # Recent records: 40% missing SpO2 (sensor failing or dropping)
    recent_records = [
        HealthRecord(
            astronaut_id="A1",
            timestamp=now - timedelta(minutes=i*10),
            heart_rate=70.0,
            blood_oxygen=None if i < 8 else 98.0  # 8 / 20 = 40% missing
        )
        for i in range(20)
    ]

    drift = evaluate_missingness_drift(ref_records, recent_records)
    assert drift["severity"] == "SEVERE_DRIFT"
    assert drift["channel_missingness"]["blood_oxygen"]["delta_rate"] >= 0.30
    assert any("dropout surge" in w for w in drift["warnings"])


def test_inference_governance_audit_trail(gov_db):
    """Verify end-to-end analysis produces the _model_governance audit trail."""
    astro_id = "ASTRO-GOV-01"
    now = datetime.now(timezone.utc)

    # Insert 5 baseline records
    for i in range(5):
        gov_db.add(HealthRecord(
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
        ))
    gov_db.commit()

    target = HealthRecord(
        astronaut_id=astro_id,
        timestamp=now,
        heart_rate=72.0,
        blood_oxygen=98.5,
        systolic_bp=120.0,
        diastolic_bp=80.0,
        body_temperature=36.6,
        sleep_duration=7.5,
        sleep_quality=85.0,
        stress_level=20.0,
        fatigue_level=2.0
    )
    gov_db.add(target)
    gov_db.commit()

    analysis = run_health_analysis(gov_db, astro_id, reading_id=target.id)
    assert "_model_governance" in analysis.baseline_deviations
    gov = analysis.baseline_deviations["_model_governance"]

    assert gov["astronaut_id"] == astro_id
    assert gov["reading_id"] == target.id
    assert gov["model_version"] == "2.0.0"
    assert gov["model_id"] == "ojas-isoforest"
    assert gov["ml_operational_state"] == "HEALTHY"
    assert gov["rule_engine_version"] == "ojas-rules-v2"
    assert gov["final_assessment_status"] == "NORMAL"


def test_operational_resilience_under_ml_outage(gov_db, monkeypatch):
    """
    Verify that an ML module failure / exception does NOT crash analysis
    and strictly NEVER suppresses a deterministic CRITICAL alert.
    """
    astro_id = "ASTRO-RESILIENCE-01"
    now = datetime.now(timezone.utc)

    # Establish baseline
    for i in range(5):
        gov_db.add(HealthRecord(
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
            fatigue_level=2.0
        ))
    gov_db.commit()

    # Induce acute hypoxia (SpO2=88% -> CRITICAL)
    crisis = HealthRecord(
        astronaut_id=astro_id,
        timestamp=now,
        heart_rate=115.0,
        blood_oxygen=88.0,  # CRITICAL
        systolic_bp=135.0,
        diastolic_bp=85.0,
        body_temperature=36.7,
        sleep_duration=6.0,
        sleep_quality=70.0,
        stress_level=60.0,
        fatigue_level=5.0
    )
    gov_db.add(crisis)
    gov_db.commit()

    # Simulate catastrophic ML failure (e.g. out of memory, corrupted weights, missing dependency)
    def broken_anomaly_detector(*args, **kwargs):
        raise RuntimeError("SIMULATED_CATASTROPHIC_ML_WEIGHT_CORRUPTION")

    monkeypatch.setattr("app.services.analysis_service.detect_multivariate_anomaly", broken_anomaly_detector)

    # Analysis must NOT raise an unhandled exception
    analysis = run_health_analysis(gov_db, astro_id, reading_id=crisis.id)

    # CRITICAL non-suppression invariant must hold: Status is CRITICAL despite ML outage
    assert analysis.overall_status == "CRITICAL"
    assert analysis.severity == "CRITICAL"

    # Governance payload must report ML degraded state
    gov = analysis.baseline_deviations["_model_governance"]
    assert gov["ml_operational_state"] == "DEGRADED"

    # Alert must still be created
    alerts = gov_db.query(HealthAlert).filter(
        HealthAlert.astronaut_id == astro_id,
        HealthAlert.severity == "CRITICAL"
    ).all()
    assert len(alerts) >= 1
