"""
OJAS Real-Time Telemetry Processing & AI Orchestration Service (Phase 9.3).
Coordinates:
1. Data Quality Gateway: UTC normalization, idempotency, duplicate suppression, and range checks.
2. Contamination-filtered personalized baselines.
3. Temporal deterioration trajectory tracking.
4. Active model registry lookup and Isolation Forest inference.
5. Deterministic physiological risk rules (Non-suppression guarantee strictly enforced).
6. Explainable AI diagnostic cards.
7. Epistemic uncertainty and OOD detection.
8. Event-driven alert lifecycle and confirmed delivery dispatch.
9. Audit trail and governance persistence.
"""

import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List, Tuple
from sqlalchemy.orm import Session

from app.models.astronaut import Astronaut
from app.models.health_record import HealthRecord
from app.models.analysis_result import AnalysisResult
from app.models.health_alert import HealthAlert
from app.telemetry.schemas import (
    TelemetryPacket,
    IngestionResult,
    PacketIngestionStatus,
    DeliveryState,
)
from app.telemetry.quality_gateway import default_quality_gateway
from app.telemetry.alert_events import default_alert_manager, AlertEvent
from app.health_engine.baseline import calculate_and_update_baseline, compute_baseline_deviations
from app.health_engine.risk_rules import evaluate_risk_rules, RuleEvaluationResult
from app.health_engine.alert_engine import process_and_create_alerts
from app.ml.model_registry import default_registry, ModelLifecycleState
from app.ml.anomaly_detection import detect_multivariate_anomaly, AnomalyInferenceMetadata, MODEL_VERSION
from app.ml.temporal_analysis import classify_temporal_trajectory
from app.ml.uncertainty import calculate_evidence_sufficiency
from app.ml.explainability import build_metric_evidence_cards
from app.services.health_service import ensure_astronaut_exists

from app.core.security import default_security_service, SecurityError, TelemetryAuthenticationError
from app.core.device_identity import default_device_identity_manager
from app.core.observability import default_metrics_collector
import time

logger = logging.getLogger("ojas.realtime")


class RealTimeOrchestrationBundle:
    def __init__(
        self,
        ingestion_result: IngestionResult,
        health_record: Optional[HealthRecord],
        analysis_result: Optional[AnalysisResult],
        alert_events: List[AlertEvent],
        overall_status: str,
    ):
        self.ingestion_result = ingestion_result
        self.health_record = health_record
        self.analysis_result = analysis_result
        self.alert_events = alert_events
        self.overall_status = overall_status

    def to_dict(self) -> Dict[str, Any]:
        return {
            "ingestion": self.ingestion_result.model_dump(),
            "record_id": self.health_record.id if self.health_record else None,
            "overall_status": self.overall_status,
            "analysis_id": self.analysis_result.id if self.analysis_result else None,
            "alert_events_count": len(self.alert_events),
            "alert_event_ids": [e.event_id for e in self.alert_events],
        }


def process_telemetry_packet(
    db: Session,
    packet: TelemetryPacket,
    auto_dispatch_alerts: bool = True,
    auth_token: Optional[str] = None,
    signature_hex: Optional[str] = None
) -> RealTimeOrchestrationBundle:
    """
    Complete end-to-end real-time ingestion, AI orchestration, and alert dispatch pipeline.
    """
    t_start = time.perf_counter()

    # 0. Optional Telemetry Source Cryptographic or Token Authentication
    if signature_hex is not None:
        is_valid, reason, audit_meta = default_device_identity_manager.verify_signed_packet(packet, signature_hex)
        if not is_valid:
            raise TelemetryAuthenticationError(reason)
    elif auth_token is not None:
        default_security_service.authenticate_telemetry_source(
            source_id=packet.source_id,
            auth_token=auth_token,
            astronaut_id=packet.astronaut_id
        )

    # 1. Quality Gateway Verification (Persistent DB-backed idempotency & sequencing)
    is_acceptable, ingestion_result = default_quality_gateway.process_packet(packet, db=db)

    # Record Observability Metrics
    is_gap = any("Sequence gap detected" in w for w in ingestion_result.warnings)
    is_reset = any("counter reset detected" in w for w in ingestion_result.warnings)
    default_metrics_collector.record_packet_ingestion(
        stream_id=packet.stream_id,
        astronaut_id=packet.astronaut_id,
        status=ingestion_result.status.value,
        timestamp=ingestion_result.timestamp,
        is_gap=is_gap,
        is_reset=is_reset
    )

    if not is_acceptable:
        # Rejected or Duplicate
        default_metrics_collector.record_inference_latency((time.perf_counter() - t_start) * 1000.0)
        return RealTimeOrchestrationBundle(
            ingestion_result=ingestion_result,
            health_record=None,
            analysis_result=None,
            alert_events=[],
            overall_status="REJECTED" if ingestion_result.status == PacketIngestionStatus.REJECTED else "DUPLICATE"
        )

    # 2. Astronaut Profile and Database Record Insertion
    ensure_astronaut_exists(db, packet.astronaut_id)
    norm_ts = ingestion_result.timestamp

    record = HealthRecord(
        astronaut_id=packet.astronaut_id,
        timestamp=norm_ts,
        heart_rate=packet.heart_rate,
        blood_oxygen=packet.blood_oxygen,
        systolic_bp=packet.systolic_bp,
        diastolic_bp=packet.diastolic_bp,
        body_temperature=packet.body_temperature,
        sleep_duration=packet.sleep_duration,
        sleep_quality=packet.sleep_quality,
        stress_level=packet.stress_level,
        mood=packet.mood or "Nominal",
        physical_activity_minutes=packet.physical_activity_minutes or 0.0,
        fatigue_level=packet.fatigue_level,
        is_synthetic=True,
        notes=packet.notes
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    # Register record ID in idempotency cache and database
    default_quality_gateway.register_record_id(packet.idempotency_key, record.id, db=db)
    ingestion_result.record_id = record.id

    # 3. Retrieve Subject-Isolated Historical Telemetry (strictly up to target timestamp)
    historical_records = (
        db.query(HealthRecord)
        .filter(HealthRecord.astronaut_id == packet.astronaut_id)
        .filter(HealthRecord.timestamp <= norm_ts)
        .order_by(HealthRecord.timestamp.asc())
        .all()
    )

    # 4. Personalized Contamination-Filtered Baseline
    baseline = calculate_and_update_baseline(
        db=db,
        astronaut_id=packet.astronaut_id,
        filter_contamination=True,
        before_timestamp=norm_ts
    )
    baseline_deviations = compute_baseline_deviations(
        reading=record,
        baseline=baseline,
        historical_records=historical_records
    )

    # 5. Temporal Deterioration Trajectory Analysis
    mean_spo2 = baseline.blood_oxygen_mean if baseline else 98.0
    mean_hr = baseline.heart_rate_mean if baseline else 70.0
    temporal_assessment = classify_temporal_trajectory(
        records=historical_records,
        baseline_mean_spo2=mean_spo2,
        baseline_mean_hr=mean_hr
    )

    # 6. Epistemic Uncertainty & OOD Evaluation
    uncertainty = calculate_evidence_sufficiency(
        record=record,
        historical_count=len(historical_records),
        baseline=baseline
    )

    # 7. Deterministic Physiological Safety Rules
    rule_results = evaluate_risk_rules(record, baseline, historical_records)

    # Inject temporal trajectory risk rules
    if temporal_assessment.trajectory == "GRADUAL_DETERIORATION":
        rule_results.append(RuleEvaluationResult(
            severity="CAUTION",
            category="TEMPORAL_TREND",
            title="Progressive Physiological Deterioration",
            description=f"Monotonic worsening trajectory detected ({temporal_assessment.consecutive_abnormalities} consecutive abnormal readings).",
            recommended_action="Inspect trending telemetry logs; initiate cabin ventilation airflow check.",
            contributing_factors=[temporal_assessment.summary]
        ))
    elif temporal_assessment.trajectory == "CHRONIC_PERSISTENT":
        rule_results.append(RuleEvaluationResult(
            severity="CAUTION",
            category="TEMPORAL_TREND",
            title="Sustained Physiological Shift",
            description="Persistent baseline drift established across observation window.",
            recommended_action="Request non-urgent flight surgeon teleconsultation.",
            contributing_factors=[temporal_assessment.summary]
        ))

    # 8. Active Model Registry & Isolation Forest Anomaly Detection (Safe Resilience Boundary)
    active_model = default_registry.get_active_model()
    ml_operational_state = "HEALTHY"
    try:
        ml_out = detect_multivariate_anomaly(
            current=record,
            historical_records=historical_records,
            return_metadata=True
        )
        is_ml_anomaly, ml_score, ml_explanation, ml_meta = ml_out
    except Exception as ml_err:
        logger.error(f"Operational fault in ML anomaly detector: {ml_err}", exc_info=True)
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

    # 9. Determine Overall Severity (CRITICAL NON-SUPPRESSION INVARIANT)
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

    # 10. Synthesize Structured Evidence Cards & Model Governance Audit Payload
    evidence_cards = build_metric_evidence_cards(record, baseline, baseline_deviations)
    enriched_deviations = dict(baseline_deviations)
    enriched_deviations["_temporal_trajectory"] = temporal_assessment.to_dict()
    enriched_deviations["_uncertainty"] = uncertainty.to_dict()
    enriched_deviations["_ml_metadata"] = ml_meta.to_dict()
    enriched_deviations["_diagnostic_cards"] = [c.to_dict() for c in evidence_cards]

    # Model Governance & Inference Audit Trail (Phase 8.3)
    enriched_deviations["_model_governance"] = {
        "assessment_id": f"ojas-realtime-{record.id}-{int(datetime.now(timezone.utc).timestamp())}",
        "astronaut_id": packet.astronaut_id,
        "stream_id": packet.stream_id,
        "sequence_num": packet.sequence_num,
        "reading_id": record.id,
        "reading_timestamp": norm_ts.isoformat(),
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

    # 11. Event-Driven Alert Lifecycle & Transactional Outbox Delivery Confirmation
    alert_events = default_alert_manager.process_rule_evaluations(
        astronaut_id=packet.astronaut_id,
        evaluations=rule_results,
        reading_id=record.id,
        db=db
    )

    if auto_dispatch_alerts:
        for evt in alert_events:
            default_alert_manager.dispatch_alert(evt.event_id, db=db)

    # Persist database alerts (with critical deduplication bypass)
    process_and_create_alerts(db, packet.astronaut_id, rule_results, reading_id=record.id)

    # 12. Persist Analysis Result
    detected_abnormalities = [r.title for r in rule_results]
    contributing_factors = []
    recommended_actions = []
    for r in rule_results:
        contributing_factors.extend(r.contributing_factors)
        if r.recommended_action not in recommended_actions:
            recommended_actions.append(r.recommended_action)

    if not detected_abnormalities:
        detected_abnormalities.append("All vitals and behavioral metrics within nominal operational bounds.")
        contributing_factors.append("Biometric indicators align with personal baseline.")
        recommended_actions.append("Maintain standard flight schedule, nutrition, hydration, and exercise routine.")

    analysis_record = AnalysisResult(
        astronaut_id=packet.astronaut_id,
        timestamp=datetime.now(timezone.utc),
        overall_status=overall_status,
        severity=severity,
        detected_abnormalities=detected_abnormalities,
        baseline_deviations=enriched_deviations,
        contributing_factors=contributing_factors,
        recommended_actions=recommended_actions,
        anomaly_score=ml_score,
        reading_id=record.id
    )
    db.add(analysis_record)
    db.commit()
    db.refresh(analysis_record)

    # Record Observability Alert & Latency Metrics
    for evt in alert_events:
        default_metrics_collector.record_alert(evt.severity, is_escalated=evt.is_escalated)
    default_metrics_collector.record_inference_latency((time.perf_counter() - t_start) * 1000.0)

    return RealTimeOrchestrationBundle(
        ingestion_result=ingestion_result,
        health_record=record,
        analysis_result=analysis_record,
        alert_events=alert_events,
        overall_status=overall_status
    )
