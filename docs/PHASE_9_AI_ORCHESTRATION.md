# OJAS Phase 9 — Real-Time AI Orchestration & Inference Pipeline

## 1. Orchestration Architecture Overview
The real-time orchestration engine (`backend/app/services/realtime_analysis_service.py`) coordinates all eight AI and physiological monitoring modules developed across Phases 1 through 8 into a unified, real-time streaming pipeline.

```
+─────────────────────────────────────────────────────────────────────────────+
|                         REAL-TIME AI ORCHESTRATION                           |
|                    (process_telemetry_packet() Pipeline)                    |
+─────────────────────────────────────────────────────────────────────────────+
                                       │
                         [TelemetryPacket Ingested]
                                       │
                                       ▼
                     +───────────────────────────────────+
                     | 1. Data Quality Gateway           |
                     |    • Normalization & Validation   |
                     |    • Duplicate suppression        |
                     +───────────────────────────────────+
                                       │
                                       ▼
                     +───────────────────────────────────+
                     | 2. Subject DB Persistence         |
                     |    • Insert HealthRecord          |
                     |    • Update idempotency mapping   |
                     +───────────────────────────────────+
                                       │
                                       ▼
                     +───────────────────────────────────+
                     | 3. Subject-Isolated History       |
                     |    • Query records <= target ts   |
                     |    • Zero cross-astronaut leakage |
                     +───────────────────────────────────+
                                       │
                                       ▼
                     +───────────────────────────────────+
                     | 4. Contamination-Filtered Baseline|
                     |    • Robust Median / IQR          |
                     |    • Exclude prior anomalies      |
                     +───────────────────────────────────+
                                       │
                                       ▼
                     +───────────────────────────────────+
                     | 5. Temporal Trajectory Analysis   |
                     |    • Moving averages (SMA/EMA)    |
                     |    • Δt > 4h derivative guard     |
                     +───────────────────────────────────+
                                       │
                                       ▼
                     +───────────────────────────────────+
                     | 6. Epistemic Uncertainty & OOD    |
                     |    • History sufficiency check    |
                     |    • Stale age penalty            |
                     +───────────────────────────────────+
                                       │
                                       ▼
                     +───────────────────────────────────+
                     | 7. Active Model Registry Lookup   |
                     |    • Isolation Forest v2 ML       |
                     |    • Resilience Error Boundary    |
                     +───────────────────────────────────+
                                       │
                                       ▼
                     +───────────────────────────────────+
                     | 8. Deterministic Risk Rules       |
                     |    • Hypoxia, Brady/Tachycardia   |
                     |    • CRITICAL Non-Suppression     |
                     +───────────────────────────────────+
                                       │
                                       ▼
                     +───────────────────────────────────+
                     | 9. Event-Driven Alert Dispatch    |
                     |    • PENDING -> DELIVERED receipt |
                     |    • Immediate bypass for CRIT    |
                     +───────────────────────────────────+
                                       │
                                       ▼
                     +───────────────────────────────────+
                     | 10. Audit & Governance Persistence|
                     |    • _model_governance payload    |
                     |    • AnalysisResult committed     |
                     +───────────────────────────────────+
```

---

## 2. Coordinated AI Components

The orchestration bundle executes the following 8 integrated subsystems on every accepted telemetry packet:

1. **Personalized Contamination-Filtered Baseline (`baseline.py`)**:
   - Calculates robust rolling medians and interquartile ranges (IQR) per astronaut.
   - Filters out previously flagged CAUTION and CRITICAL records, ensuring chronic distress or previous acute events do not skew the baseline into normalizing pathology.
   - Enforces temporal causality via `before_timestamp=norm_ts` to eliminate future data leakage.

2. **Temporal Deterioration Trajectory Classifier (`temporal_analysis.py`)**:
   - Computes moving averages (3-point SMA, $\alpha=0.3$ EMA).
   - Classifies trajectory into `SINGLE_SPIKE`, `GRADUAL_DETERIORATION`, `CHRONIC_PERSISTENT`, or `STABLE_NOMINAL`.
   - Injects temporal trend alerts when monotonic degradation is detected.

3. **Epistemic Uncertainty & Out-Of-Distribution Evaluator (`uncertainty.py`)**:
   - Scores sample history sufficiency (requires $\ge 10$ historical readings for full confidence).
   - Penalizes telemetry older than 72 hours.
   - Evaluates multivariate Mahalanobis distance to flag out-of-distribution biometric signatures.

4. **Active Model Registry Lookup (`model_registry.py`)**:
   - Reads the active, approved production model from the centralized registry (`default_registry.get_active_model()`).
   - Verifies model metadata: algorithm, version, preprocessing version, and training data fingerprint (`sha256`).

5. **Isolation Forest v2 Anomaly Detector (`anomaly_detection.py`)**:
   - Scales active features using robust median/IQR scaling parameters.
   - Generates normalized anomaly score $[0.0, 1.0]$ and decision threshold (0.55).
   - Generates per-feature SHAP-like contribution vectors.

6. **Deterministic Physiological Safety Rules (`risk_rules.py`)**:
   - Evaluates acute clinical thresholds (e.g., severe hypoxia $\text{SpO}_2 < 85\%$, cardiopulmonary strain, hypertensive crisis).
   - Enforces the **Critical Non-Suppression Invariant**: an ML prediction of inlier (normal) or an ML worker crash can NEVER suppress or downgrade a critical physiological alert.

7. **Explainable AI Diagnostic Evidence Cards (`explainability.py`)**:
   - Formulates human-readable diagnostic cards for each vital sign, comparing the observed value to the personal baseline and expressing deviations in robust sigma units.

8. **Event-Driven Alert Lifecycle & Confirmed Delivery (`alert_events.py`)**:
   - Constructs strongly typed `AlertEvent` payloads.
   - Tracks delivery state transitions (`PENDING`, `DELIVERED`, `FAILED`, `RETRIED`).
   - Demands explicit acknowledgment from downstream delivery adapters before marking an alert delivered.

---

## 3. Operational Resilience Boundary & Degraded Mode

In long-duration spaceflight, memory bus errors, GPU faults, or package corruption must never take down life-critical monitoring. The orchestration engine implements a protective `try...except` boundary around the ML anomaly detection step:

```python
try:
    ml_out = detect_multivariate_anomaly(...)
    is_ml_anomaly, ml_score, ml_explanation, ml_meta = ml_out
except Exception as ml_err:
    logger.error(f"Operational fault in ML anomaly detector: {ml_err}", exc_info=True)
    ml_operational_state = "DEGRADED"
    is_ml_anomaly = False
    ml_score = None
    ml_explanation = f"ML module degraded/offline: {str(ml_err)}"
```

### Safety Guarantees During ML Degradation:
1. **Pipeline Continuity**: The orchestrator does not crash or raise uncaught exceptions.
2. **Audit Logging**: The operational fault is recorded in `_model_governance["ml_operational_state"] = "DEGRADED"`.
3. **Deterministic Protection**: Deterministic physiological safety rules remain 100% active. If severe hypoxia or cardiac arrest occurs during an ML outage, the system immediately dispatches `CRITICAL` alerts to the crew and ground controllers.

---

## 4. Model Governance & Audit Payload

Every analysis committed to the database contains an auditable `_model_governance` payload embedded in `AnalysisResult.baseline_deviations`:

```json
{
  "assessment_id": "ojas-realtime-42-1763196218",
  "astronaut_id": "ASTRO-01",
  "stream_id": "STREAM-ASTRO-01-NOMINAL",
  "sequence_num": 12,
  "reading_id": 42,
  "reading_timestamp": "2026-11-15T08:43:38Z",
  "model_id": "ojas-isoforest",
  "model_version": "2.0.0",
  "algorithm": "IsolationForest",
  "training_data_fingerprint": "sha256-ojas-v2-ref",
  "feature_schema_version": "v2.0",
  "preprocessing_version": "RobustMedianIQR-v2",
  "rule_engine_version": "ojas-rules-v2",
  "ml_operational_state": "HEALTHY",
  "anomaly_score": 0.312,
  "temporal_state": "STABLE_NOMINAL",
  "evidence_sufficiency": 1.0,
  "ood_warnings": [],
  "final_assessment_status": "NORMAL"
}
```
This payload ensures complete regulatory and scientific trace back to the exact model version, feature schema, and data stream parameters that produced each inference.
