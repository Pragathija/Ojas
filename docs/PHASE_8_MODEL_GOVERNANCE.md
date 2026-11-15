# OJAS PHASE 8 — Model Governance & AI Lifecycle Architecture

**Project**: Ojas — AI-Powered Astronaut Health Monitoring Platform  
**Target Milestone**: Phase 8 — Production AI Engineering & Model Governance  
**Date**: November 2026  
**Auditor**: Lead Biomedical Data Engineer & Aerospace ML Systems Specialist  

---

## 1. Executive Summary

Phase 8 introduces enterprise-grade model governance and operational reliability to Project Ojas. In human spaceflight environments where communication latency or blackouts preclude external guidance, AI life-support components must function under strict, tamper-evident governance protocols.

The governance architecture establishes:
1. **Centralized Model Registry** (`backend/app/ml/model_registry.py`): Immutable model versioning, cryptographic SHA-256 artifact verification, and schema lineage.
2. **Explicit Lifecycle State Machine**: Formal states (`DEVELOPMENT` $\rightarrow$ `TRAINED` $\rightarrow$ `VALIDATED` $\rightarrow$ `APPROVED` $\rightarrow$ `ACTIVE`), prohibiting automatic model activation.
3. **Formal Model Rollback Protocol**: Schema-verified restoration of previous production versions with audit logging.
4. **End-to-End Inference Auditability**: Every telemetry analysis embeds a permanent `_model_governance` provenance block into database records.
5. **Decoupled Operational Resilience**: Guaranteed execution of deterministic physiological safety rules even during total machine learning outages.

---

## 2. Model Registry Specification (`app/ml/model_registry.py`)

The Ojas Model Registry manages algorithm weights, configurations, and approval records:

```
+---------------------------------------------------------------------------------------------------+
|                                     OJAS MODEL REGISTRY SCHEMA                                    |
+---------------------------------------------------------------------------------------------------+
| Field                     | Type              | Description                                       |
+---------------------------+-------------------+---------------------------------------------------+
| model_id                  | String            | Unique slug for the model family (e.g. ojas-isoforest)
| version                   | Semantic Version  | Semantic version string (e.g. 1.0.0, 2.0.0)       |
| algorithm                 | String            | Exact algorithm class (e.g. IsolationForest)       |
| training_data_fingerprint | SHA-256 String    | 16-character cryptographic hash of training set   |
| training_timestamp        | ISO-8601 String   | UTC timestamp when model fitting occurred         |
| random_seed               | Integer           | Pseudorandom seed (e.g. 42) for deterministic trees|
| feature_schema            | List[String]      | Exact physiological feature order (9 dimensions)  |
| feature_schema_version    | String            | Schema version (e.g. v2.0)                        |
| preprocessing_config      | Dictionary        | Scaler type, zero-imputation policy, IQR floor   |
| model_params              | Dictionary        | Hyperparameters (n_estimators, contamination, etc)|
| evaluation_metrics        | Dictionary        | Benchmark scores (precision, recall, f1, etc.)    |
| lifecycle_status          | Enum              | DEVELOPMENT, TRAINED, VALIDATED, APPROVED, etc.   |
| approval_metadata         | Dictionary        | Approved by, approval timestamp, clinical notes   |
| artifact_hash             | SHA-256 String    | Full cryptographic hash of model binary weights   |
| history_transitions       | List[Dictionary]  | Complete immutable audit trail of state transitions
+---------------------------------------------------------------------------------------------------+
```

### Registered Production Catalog:
1. **`ojas-isoforest:2.0.0` (ACTIVE)**: Robust median/IQR scaled multivariate Isolation Forest with feature attribution vectors, 75 estimators, contamination=0.05, decision threshold=0.55. Approved by Flight Surgeon.
2. **`ojas-isoforest:1.0.0` (APPROVED / ROLLBACK READY)**: Legacy unscaled baseline model with 50 estimators, preserved for rollback safety.

---

## 3. Production Drift Governance (`app/ml/model_monitoring.py`)

Production drift surveillance monitors four continuous dimensions:
1. **Population Stability Index (PSI)**: Monitors continuous distribution shifts using infinite-edge quantile binning ($[-\infty, +\infty]$).
2. **Standardized Mean Shift ($z$-shift)**: Tracks individual astronaut baseline drift against personal standard deviations.
3. **Variance Volatility Ratios**: Detects physiological signal instability ($\sigma^2_{\text{recent}} / \sigma^2_{\text{baseline}}$).
4. **Channel Missingness Drift**: Detects sensor electrode dropouts or hardware telemetry degradation ($\Delta_{\text{missing}} \ge 30\%$).
5. **Telemetry Schema Drift**: Detects dropped or unexpected feature channels in incoming packets.

### The No-Autonomous-Retraining Rule:
```
INVIOLABLE SAFETY INVARIANT:
Drift detection generates structured surveillance events for crew medical officers.
Autonomous, unattended model retraining is strictly prohibited to prevent uncontrolled
parameter drift in safety-critical life support systems.
```
