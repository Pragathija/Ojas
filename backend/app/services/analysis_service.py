"""
OJAS Health Telemetry Analysis & Decision Support Service.
Coordinates:
1. Sensor data quality and zero-imputation prevention.
2. Contamination-filtered rolling statistical baselines.
3. Deterministic spaceflight physiological floor/ceiling rules.
4. Dedicated temporal deterioration and trajectory classification.
5. Multivariate Isolation Forest anomaly detection with robust scaling.
6. Epistemic uncertainty and evidence sufficiency scoring.
7. Structured explainable diagnostic evidence synthesis.
8. Alert deduplication and mission safety alert persistence.
"""

from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session

from app.models.health_record import HealthRecord
from app.models.health_baseline import HealthBaseline
from app.models.analysis_result import AnalysisResult
from app.health_engine.baseline import calculate_and_update_baseline, compute_baseline_deviations
from app.health_engine.risk_rules import evaluate_risk_rules, RuleEvaluationResult
from app.health_engine.alert_engine import process_and_create_alerts
from app.ml.model_registry import default_registry, ModelLifecycleState
from app.ml.anomaly_detection import detect_multivariate_anomaly, AnomalyInferenceMetadata, MODEL_VERSION
from app.ml.temporal_analysis import classify_temporal_trajectory
from app.ml.uncertainty import calculate_evidence_sufficiency
from app.ml.explainability import build_metric_evidence_cards, synthesize_explainable_assessment
from app.ml.preprocessing import validate_reading_quality


def run_health_analysis(
    db: Session,
    astronaut_id: str,
    reading_id: Optional[int] = None
) -> AnalysisResult:
    """
    Executes the complete explainable health analysis pipeline:
    1. Fetches target reading (specified or latest).
    2. Validates reading quality and evaluates evidence sufficiency.
    3. Updates and retrieves personal contamination-filtered statistical baseline.
    4. Computes baseline deviations (parametric + non-parametric percentiles).
    5. Evaluates temporal trajectory (SMA, EMA, rate-of-change, deterioration).
    6. Evaluates deterministic physiological risk rules.
    7. Runs supplementary robustly scaled Isolation Forest.
    8. Synthesizes structured explainable evidence cards.
    9. Processes and creates alerts (with critical non-suppression guarantee).
    10. Persists and returns AnalysisResult.
    """
    # 1. Fetch reading
    if reading_id:
        target_reading = (
            db.query(HealthRecord)
            .filter(HealthRecord.id == reading_id, HealthRecord.astronaut_id == astronaut_id)
            .first()
        )
    else:
        target_reading = (
            db.query(HealthRecord)
            .filter(HealthRecord.astronaut_id == astronaut_id)
            .order_by(HealthRecord.timestamp.desc())
            .first()
        )

    if not target_reading:
        raise ValueError(f"No health telemetry found for astronaut '{astronaut_id}'.")

    # 2. Historical records up to and including target reading (prevents future observation leakage)
    historical_query = db.query(HealthRecord).filter(HealthRecord.astronaut_id == astronaut_id)
    if target_reading.timestamp:
        historical_query = historical_query.filter(HealthRecord.timestamp <= target_reading.timestamp)
    elif target_reading.id:
        historical_query = historical_query.filter(HealthRecord.id <= target_reading.id)
    historical_records = historical_query.order_by(HealthRecord.timestamp.asc()).all()

    # 3. Quality & Uncertainty Assessment
    quality = validate_reading_quality(target_reading)
    baseline = calculate_and_update_baseline(
        db,
        astronaut_id,
        filter_contamination=True,
        before_timestamp=target_reading.timestamp
    )
    uncertainty = calculate_evidence_sufficiency(
        record=target_reading,
        historical_count=len(historical_records),
        baseline=baseline
    )

    # 4. Baseline Deviations (enriched with percentiles and IQR)
    baseline_deviations = compute_baseline_deviations(
        reading=target_reading,
        baseline=baseline,
        historical_records=historical_records
    )

    # 5. Temporal Trajectory Analysis
    mean_spo2 = baseline.blood_oxygen_mean if baseline else 98.0
    mean_hr = baseline.heart_rate_mean if baseline else 70.0
    temporal_assessment = classify_temporal_trajectory(
        records=historical_records,
        baseline_mean_spo2=mean_spo2,
        baseline_mean_hr=mean_hr
    )

    # 6. Deterministic Rule Engine
    rule_results = evaluate_risk_rules(target_reading, baseline, historical_records)

    # Temporal risk rule injection: flag gradual deterioration or chronic shift
    if temporal_assessment.trajectory == "GRADUAL_DETERIORATION":
        rule_results.append(RuleEvaluationResult(
            severity="CAUTION",
            category="TEMPORAL_TREND",
            title="Progressive Physiological Deterioration",
            description=f"Monotonic downward/worsening trajectory detected over recent readings ({temporal_assessment.consecutive_abnormalities} consecutive abnormal readings).",
            recommended_action="Inspect trending telemetry trends; schedule rest cycle and evaluate environmental ECLSS telemetry.",
            contributing_factors=[temporal_assessment.summary]
        ))
    elif temporal_assessment.trajectory == "CHRONIC_PERSISTENT":
        rule_results.append(RuleEvaluationResult(
            severity="CAUTION",
            category="TEMPORAL_TREND",
            title="Sustained Physiological Shift",
            description=f"Persistent deviation from baseline established across recent observation window.",
            recommended_action="Request non-urgent flight surgeon teleconsultation to review baseline drift.",
            contributing_factors=[temporal_assessment.summary]
        ))

    # 7. Supplementary Robust ML Anomaly Detection (only if historical N >= 20)
    active_model = default_registry.get_active_model()
    ml_operational_state = "HEALTHY"
    try:
        ml_out = detect_multivariate_anomaly(
            current=target_reading,
            historical_records=historical_records,
            return_metadata=True
        )
        is_ml_anomaly, ml_score, ml_explanation, ml_meta = ml_out
    except Exception as ml_err:
        # Graceful operational degradation: ML failure must never crash analysis or suppress safety rules
        ml_operational_state = "DEGRADED"
        is_ml_anomaly = False
        ml_score = None
        ml_explanation = f"ML module degraded/offline: {str(ml_err)}"
        ml_meta = AnomalyInferenceMetadata(
            model_version=active_model.version if active_model else MODEL_VERSION,
            inference_timestamp=datetime.now(timezone.utc).isoformat(),
            sample_size=len(historical_records),
            raw_score=None,
            normalized_score=None,
            decision_threshold=0.55,
            is_anomaly=False,
            feature_contributions={},
            active_features=[],
            missing_features=[],
            explanation=ml_explanation,
        )

    if is_ml_anomaly:
        rule_results.append(RuleEvaluationResult(
            severity="CAUTION",
            category="ML_ANOMALY",
            title="Multivariate Vitals Drift Detected",
            description=ml_explanation,
            recommended_action="Conduct full self-diagnostic check and verify telemetry equipment sensor calibration.",
            contributing_factors=["Isolation Forest multi-dimensional divergence"]
        ))

    # 8. Determine Overall Severity (Non-suppression guarantee strictly enforced)
    severities = [r.severity for r in rule_results]
    if "CRITICAL" in severities:
        overall_status = "CRITICAL"
        severity = "CRITICAL"
    elif "CAUTION" in severities:
        overall_status = "CAUTION"
        severity = "CAUTION"
    else:
        overall_status = "NORMAL"
        severity = "NORMAL"

    # 9. Aggregate Findings, Factors, and Recommendations
    detected_abnormalities = [r.title for r in rule_results]
    contributing_factors: List[str] = []
    recommended_actions: List[str] = []

    for r in rule_results:
        contributing_factors.extend(r.contributing_factors)
        if r.recommended_action not in recommended_actions:
            recommended_actions.append(r.recommended_action)

    if not detected_abnormalities:
        detected_abnormalities.append("All vitals and behavioral metrics within nominal operational bounds.")
        contributing_factors.append("Biometric indicators align with personal baseline.")
        recommended_actions.append("Maintain standard flight schedule, nutrition, hydration, and exercise routine.")

    # 10. Synthesize Structured Evidence Cards & AI Governance Audit Record
    evidence_cards = build_metric_evidence_cards(target_reading, baseline, baseline_deviations)
    
    # Enrich baseline_deviations with explainable metadata payloads
    enriched_deviations = dict(baseline_deviations)
    enriched_deviations["_temporal_trajectory"] = temporal_assessment.to_dict()
    enriched_deviations["_uncertainty"] = uncertainty.to_dict()
    enriched_deviations["_ml_metadata"] = ml_meta.to_dict()
    enriched_deviations["_diagnostic_cards"] = [c.to_dict() for c in evidence_cards]

    # Model Governance & Inference Audit Trail (Phase 8.3)
    enriched_deviations["_model_governance"] = {
        "assessment_id": f"ojas-audit-{target_reading.id}-{int(datetime.now(timezone.utc).timestamp())}",
        "astronaut_id": astronaut_id,
        "reading_id": target_reading.id,
        "reading_timestamp": target_reading.timestamp.isoformat() if target_reading.timestamp else None,
        "model_id": active_model.model_id if active_model else "ojas-isoforest",
        "model_version": active_model.version if active_model else MODEL_VERSION,
        "algorithm": active_model.algorithm if active_model else "IsolationForest",
        "training_data_fingerprint": active_model.training_data_fingerprint if active_model else "sha256-ojas-v2-ref",
        "feature_schema_version": active_model.feature_schema_version if active_model else "v2.0",
        "preprocessing_version": "RobustMedianIQR-v2",
        "rule_engine_version": "ojas-rules-v2",
        "ml_operational_state": ml_operational_state,
        "anomaly_score": ml_score,
        "temporal_state": temporal_assessment.trajectory,
        "evidence_sufficiency": uncertainty.overall_confidence,
        "ood_warnings": uncertainty.ood_reasons,
        "final_assessment_status": overall_status,
    }

    # 11. Process Alerts (Critical alerts never suppressed)
    process_and_create_alerts(db, astronaut_id, rule_results, reading_id=target_reading.id)

    # 12. Persist Analysis Result
    analysis_record = AnalysisResult(
        astronaut_id=astronaut_id,
        timestamp=datetime.now(timezone.utc),
        overall_status=overall_status,
        severity=severity,
        detected_abnormalities=detected_abnormalities,
        baseline_deviations=enriched_deviations,
        contributing_factors=contributing_factors,
        recommended_actions=recommended_actions,
        anomaly_score=ml_score,
        reading_id=target_reading.id
    )

    db.add(analysis_record)
    db.commit()
    db.refresh(analysis_record)
    return analysis_record


def get_latest_analysis(db: Session, astronaut_id: str) -> Optional[AnalysisResult]:
    """Retrieve most recent analysis result for an astronaut."""
    return (
        db.query(AnalysisResult)
        .filter(AnalysisResult.astronaut_id == astronaut_id)
        .order_by(AnalysisResult.timestamp.desc())
        .first()
    )


def get_analysis_history(db: Session, astronaut_id: str, limit: int = 20) -> List[AnalysisResult]:
    """Retrieve historical analysis results for an astronaut."""
    return (
        db.query(AnalysisResult)
        .filter(AnalysisResult.astronaut_id == astronaut_id)
        .order_by(AnalysisResult.timestamp.desc())
        .limit(limit)
        .all()
    )
