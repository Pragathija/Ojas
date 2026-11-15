# OJAS PHASE 8 — Model Lifecycle State Machine & Rollback Architecture

**Project**: Ojas — AI-Powered Astronaut Health Monitoring Platform  
**Target Module**: Machine Learning Lifecycle Management  
**Date**: November 2026  

---

## 1. Lifecycle State Machine

The Ojas Model Registry enforces a formal, directed state machine controlling the lifecycle of all machine learning models:

```
                  +---------------+
                  |  DEVELOPMENT  |
                  +---------------+
                          | (Fit model on reference data)
                          v
                  +---------------+
                  |    TRAINED    |
                  +---------------+
                          | (Pass benchmark test suite)
                          v
                  +---------------+
                  |   VALIDATED   |
                  +---------------+
                          | (Flight surgeon review & sign-off)
                          v
                  +---------------+
        +-------->|   APPROVED    |
        |         +---------------+
        | (Re-approve)    | (Production activation)
        |                 v
+---------------+ +---------------+
|  ROLLED_BACK  | |    ACTIVE     |
+---------------+ +---------------+
        ^                 |
        | (Trigger        | (Superseded by new version)
        |  rollback)      v
        +---------+---------------+
                  |  DEPRECATED   |
                  +---------------+
```

---

## 2. State Transition Governance & Rules

| Transition | Required Pre-condition | Authorized Actor | Audit Logged? |
| :--- | :--- | :--- | :---: |
| `DEVELOPMENT` $\rightarrow$ `TRAINED` | Model training completed on versioned reference dataset. | ML Engineer | YES |
| `TRAINED` $\rightarrow$ `VALIDATED` | Evaluated against holdout test cohort; Precision $\ge 0.90$, Recall $\ge 0.95$, Zero False Negatives on Critical Hypoxia. | Automated Validation Harness | YES |
| `VALIDATED` $\rightarrow$ `APPROVED` | Peer review by Flight Surgeon or Biomedical Operations Specialist. Clinical notes recorded. | Flight Surgeon / Lead Specialist | YES |
| `APPROVED` $\rightarrow$ `ACTIVE` | Model explicitly activated. Previously active version is automatically transitioned to `DEPRECATED`. | Mission Control / Ops Lead | YES |
| `ACTIVE` $\rightarrow$ `DEPRECATED` | Automatic when a newer approved version is promoted to `ACTIVE`. | System / Ops Lead | YES |
| `ACTIVE` $\rightarrow$ `ROLLED_BACK` | Rollback triggered due to operational anomaly or sensor drift. | Flight Surgeon / Ops Lead | YES |

### Invariant Checks:
- **No Unapproved Activation**: Calling `activate_model()` on a model in `DEVELOPMENT`, `TRAINED`, or `VALIDATED` state immediately raises `ModelApprovalRequired`.
- **No Illegal State Skips**: Calling `approve_model()` on a model directly from `DEVELOPMENT` raises `InvalidLifecycleTransition`.

---

## 3. Formal Model Rollback Protocol

When physiological drift, unexpected sensor behavior, or algorithmic discrepancies arise in production, Ojas provides a single-command, schema-verified rollback:

```python
deactivated_model, activated_model = default_registry.rollback_model(
    model_id="ojas-isoforest",
    target_version="1.0.0",
    actor="Flight Surgeon Dr. Smith",
    reason="Sensor calibration discrepancy on new multi-modal telemetry channels",
)
```

### Safety Protections During Rollback:
1. **Schema Compatibility Guard**:
   The registry computes set equality between the target model's `feature_schema` and current runtime features:
   $$\text{Target Schema} = \text{Runtime Schema}$$
   If the target version expects fewer or different features (e.g. an experimental 2-feature model), `SchemaIncompatibilityError` is raised, and rollback is aborted before runtime execution.
2. **Prior Approval Guard**:
   A model cannot be rolled back to unless it previously held `APPROVED`, `DEPRECATED`, or `ROLLED_BACK` status. Unvalidated experimental models are rejected.
3. **Audit Immutability**:
   Both the deactivated and activated models record the rollback event, actor, timestamp, and cause in their `history_transitions` log.
