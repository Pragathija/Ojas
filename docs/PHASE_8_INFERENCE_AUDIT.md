# OJAS PHASE 8 — Inference Auditability & Provenance Architecture

**Project**: Ojas — AI-Powered Astronaut Health Monitoring Platform  
**Target Module**: Clinical Inference Audit Trail & Telemetry Lineage  
**Date**: November 2026  

---

## 1. Overview & Regulatory Rationale

In autonomous spaceflight health operations, every automated alert, physiological risk assessment, and anomaly score must be verifiable post-mission. If an astronaut's baseline shifts or if a machine learning model is updated from version `2.0.0` to `2.1.0`, historical assessments must remain traceable to the exact model version, training fingerprint, and preprocessing parameters that produced them.

---

## 2. Structured Inference Governance Record

Every execution of `run_health_analysis()` persists a comprehensive `_model_governance` payload inside the `baseline_deviations` JSON column of `AnalysisResult`:

```json
{
  "_model_governance": {
    "assessment_id": "ojas-audit-42-1794738500",
    "astronaut_id": "ASTRO-01",
    "reading_id": 42,
    "reading_timestamp": "2026-11-15T08:30:00Z",
    "model_id": "ojas-isoforest",
    "model_version": "2.0.0",
    "algorithm": "IsolationForest",
    "training_data_fingerprint": "sha256-ojas-v2-ref-baseline",
    "feature_schema_version": "v2.0",
    "preprocessing_version": "RobustMedianIQR-v2",
    "rule_engine_version": "ojas-rules-v2",
    "ml_operational_state": "HEALTHY",
    "anomaly_score": 0.284,
    "temporal_state": "STABLE_NOMINAL",
    "evidence_sufficiency": 0.95,
    "ood_warnings": [],
    "final_assessment_status": "NORMAL"
  }
}
```

---

## 3. Provenance & Privacy Guarantees

1. **Deterministic Lineage**:
   - `assessment_id`: Unique monotonic identifier linking telemetry, analysis, and alerts.
   - `training_data_fingerprint`: 16-character SHA-256 digest of reference telemetry used to fit model parameters.
   - `rule_engine_version`: Tracks the version of deterministic safety thresholds (independent of ML model version).
2. **Privacy & PII Protection**:
   - Telemetry records store only pseudonymized mission astronaut identifiers (e.g. `ASTRO-01`).
   - Personal identifiable information (PII) such as full legal names, biometric photographs, or medical history is stored in isolated user profile tables, strictly separated from telemetry arrays.
3. **Immutability After Model Updates**:
   - Because governance parameters are serialized directly into the persistent JSON record at the moment of inference, updating or rolling back the active model registry never alters the recorded metadata of historical analyses.
