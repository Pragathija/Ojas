# OJAS PHASE 7 — Multivariate Model Robustness & Baseline Integrity Report

**Project**: Ojas — AI-Powered Astronaut Health Monitoring Platform  
**Target Module**: Machine Learning Anomaly Detection, Baseline Physics & Temporal Dynamics  
**Date**: November 2026  

---

## 1. Executive Summary

This report assesses the stability, determinism, and mathematical integrity of the **Ojas Phase 6/7 Machine Learning Engine**. Focusing on `IsolationForest(ojas-isoforest-v2)`, the personal baseline computation engine, and the temporal trajectory classifier, this document verifies that the system maintains numerical stability across edge cases, stochastic seeds, and operational disruptions.

---

## 2. Phase 7.3 — Multivariate Isolation Forest v2 Robustness

### 2.1 Scaler Fitting and Inference Isolation
To prevent scale dominance, features are scaled via Median/IQR:
$$x_{\text{scaled}} = \frac{x - \text{median}}{\text{IQR}}$$
- **Fitting Phase**: Medians and IQRs are computed strictly on reference historical records ($X_{\text{train}}$).
- **Inference Phase**: Current vector $x_{\text{current}}$ is transformed using the reference parameters.
- **Degenerate Variance Safety**: If a feature has zero variance across historical observations (e.g. constant sleep duration or heart rate), $\text{IQR} = 0.0$. The scaler automatically floors zero IQRs to $1.0$, preventing runtime `ZeroDivisionError`.

### 2.2 Seed Stability & Determinism
Unsupervised tree algorithms can exhibit stochastic variance across executions. In Ojas:
- `IsolationForest` is pinned to `random_state=42` and single-threaded execution (`n_jobs=1`).
- Verification via `test_isolation_forest_seed_reproducibility` proved identical decision function scores ($raw\_score_1 = raw\_score_2$) and identical normalized anomaly scores across independent inference runs.

### 2.3 Scientific Disclaimers & Epistemic Boundaries
1. **Attribution is NOT Causality**:
   The feature contribution vector ($c_i = |z_i| / \sum |z_j|$) reports mathematical deviation from the cluster centroid. It identifies which sensor drove the anomaly score; it does **not** assert medical etiology (e.g., whether tachycardia caused hypoxia or vice versa).
2. **Anomaly Scores are NOT Medical Probabilities**:
   Normalized anomaly scores ($0.0\text{--}1.0$) represent geometric isolation depth in multidimensional space; they are **never** labeled as clinical disease probabilities.

---

## 3. Phase 7.4 — Personalized Baseline Integrity & Contamination Mitigation

### 3.1 Contamination Mitigation Mechanism
In prolonged space missions, acute physiological excursions (e.g., carbon dioxide exposure, acute hypoxia, or physical exertion) must not contaminate the nominal resting baseline:
- `is_pathological_contamination(record)` identifies acute departures:
  - $\text{SpO}_2 \le 89\%$
  - $\text{Heart Rate} \ge 140\text{ BPM}$ or $\le 38\text{ BPM}$
  - $\text{Systolic BP} \ge 170\text{ mmHg}$
  - $\text{Body Temperature} \ge 39.0^\circ\text{C}$
- These crisis records are excluded from calculating nominal baseline means and standard deviations.
- If an astronaut experiences a chronic shift where all records are abnormal, the engine falls back to median-based statistics rather than discarding all data.

### 3.2 Non-Parametric Percentiles
Alongside arithmetic mean and standard deviation, the baseline engine calculates non-parametric percentiles ($p_{10}, p_{25}, p_{50}/\text{median}, p_{75}, p_{90}$) and robust z-scores:
$$\text{Robust } z = \frac{x - \text{median}}{0.7413 \cdot \text{IQR}}$$
This formulation provides robust resistance to non-Gaussian physiological distributions.

---

## 4. Phase 7.5 — Temporal Robustness & Data Gap Handling

### 4.1 Trajectory State Machine
The temporal analyzer evaluates recent telemetry sequences against 6 distinct trajectory states:
- `SINGLE_SPIKE`: Isolated abnormality surrounded by normal readings (indicative of sensor detachment or momentary exertion).
- `REPEATED_DEVIATION`: Fluctuation without clear directional trend.
- `GRADUAL_DETERIORATION`: Monotonic progressive worsening over $\ge 3$ consecutive readings (e.g., descending $\text{SpO}_2$).
- `CHRONIC_PERSISTENT`: $\ge 5$ abnormal readings sustained across the window.
- `RECOVERY_TREND`: Vitals returning toward nominal baseline following an excursion.
- `STABLE_NOMINAL`: Completely stable flight envelope.

### 4.2 Data Gap Safety Invariant
Calculating continuous derivatives across long data gaps produces false rates of change. The engine enforces:
$$\text{If } \Delta t > 4.0\text{ hours} \implies \text{Rate of change calculation is SUPPRESSED } (\text{None})$$
This prevents the engine from fabricating continuous deterioration across communications blackouts or sleeping periods where sensors were disconnected.

---

## 5. Phase 7.9 — Reproducibility & Model Fingerprinting

Every generated inference result and drift monitoring report embeds complete provenance metadata:
- `model_version`: `ojas-isoforest-v2`
- `random_seed`: `42`
- `feature_schema`: Exact 9-dimensional physiological feature order.
- `training_data_fingerprint`: 16-character SHA-256 digest of reference telemetry records.
- `decision_threshold`: Fixed at `0.55`.
- `inference_timestamp`: UTC ISO-8601 timestamp.

This guarantees complete traceability of past health decisions back to the exact algorithm and baseline state that produced them.
