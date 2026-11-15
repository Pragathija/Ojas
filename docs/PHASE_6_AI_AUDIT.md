# OJAS PHASE 6.1 — AI Engine Intelligence & Scientific Audit Report

**Project**: Ojas — AI-Powered Astronaut Health Monitoring Platform  
**Target Milestone**: Phase 6 — AI Intelligence Enhancement & Scientific Validation  
**Date**: November 2026  
**Auditor**: Lead Biomedical Data Engineer & Applied ML Specialist  

---

## 1. Executive Summary

Ojas provides an autonomous physiological monitoring engine for spaceflight crews. Following the completion of Phase 5 (Full System Integration & NASA BRSMAct Dashboard integration), the backend AI stack features deterministic physiological rules, personal baseline deviation tracking, and a supplementary scikit-learn Isolation Forest model.

This audit evaluates the current machine learning, statistical inference, and decision-support architecture. While the deterministic baseline and safety floor/ceiling rules are reliable and prevent critical failure modes, the supplementary ML layer and statistical baseline components exhibited several architectural and mathematical limitations that require enhancement:
1. **Unscaled Feature Vectors**: Features spanning disparate physiological orders of magnitude (e.g., Heart Rate in BPM vs. Temperature in °C) were ingested into tree-partitioning algorithms without robust scaling.
2. **Missing Feature Vulnerability**: The feature extractor assumed complete record vectors, risking runtime exceptions or requiring risky imputation if telemetry streams were degraded.
3. **Baseline Contamination**: Moving average calculations did not filter out acute pathological episodes, allowing severe anomalies to contaminate and skew the nominal personal baseline.
4. **Absence of Temporal Trajectory Tracking**: The engine operated on cross-sectional time-slices without evaluating rate-of-change ($\Delta / \Delta t$), moving average velocity, or distinguishing transient sensor artifacts from sustained physiological degradation.
5. **Confidence & Severity Conflation**: The engine lacked distinction between clinical severity (how critical the condition is) and epistemic uncertainty (evidence sufficiency and data completeness).

---

## 2. Component-by-Component Architectural Audit

### 2.1 Anomaly Detection (`backend/app/ml/anomaly_detection.py`)
- **Current Mechanism**: Supplementary `IsolationForest(n_estimators=50, contamination=0.05, n_jobs=1, random_state=42)` triggered when historical readings $\ge 20$.
- **Strengths**:
  - Gated by minimum history threshold (`MIN_READINGS_FOR_ML_ANOMALY = 20`) preventing erratic small-sample clustering.
  - Non-blocking execution with single-threaded worker configuration (`n_jobs=1`) preventing semaphore deadlocks on Windows and Linux runtimes.
  - Generates normalized anomaly score $0.0 - 1.0$.
- **Identified Weaknesses**:
  - **Feature Magnitude Disparity**: Features (`heart_rate` [40–180], `systolic_bp` [90–180], `blood_oxygen` [85–100], `body_temperature` [35.5–39.5], `sleep_duration` [0–12]) are passed unscaled. While Isolation Forest splits orthogonal axes randomly, variance differences across features cause high-variance dimensions to disproportionately dictate isolation depth.
  - **Absence of Feature Contribution Attribution**: When an anomaly is detected, the engine does not report *which* physiological dimensions contributed most heavily to the isolation score.
  - **Lack of Model Versioning & Inference Metadata**: No record of model version, training sample size, or decision threshold is included in the output.
  - **Zero-Imputation Vulnerability**: If missing features were filled with zeros, extreme artificial anomalies would be reported.

### 2.2 Baseline Calculation (`backend/app/health_engine/baseline.py`)
- **Current Mechanism**: Computes arithmetic mean and standard deviation across all historical readings for an astronaut and stores them in `HealthBaseline`.
- **Strengths**:
  - Strict subject-level isolation (`astronaut_id` filter).
  - Minimum sample gate (`MIN_READINGS_FOR_BASELINE = 3`).
  - Standard deviation floor (`std or 1.0`) preventing zero-division errors.
- **Identified Weaknesses**:
  - **Contamination Susceptibility**: Arithmetic mean and standard deviation are non-robust to outliers. If an astronaut experiences sustained tachycardia or fever, the baseline mean drifts upward, desensitizing future anomaly detection.
  - **Lack of Non-Parametric Percentiles**: Biological signals often exhibit skewed non-Gaussian distributions. The baseline lacked medians, 10th/25th/75th/90th percentiles, and Interquartile Ranges (IQR).

### 2.3 Physiological Risk Rules (`backend/app/health_engine/risk_rules.py`)
- **Current Mechanism**: Deterministic rule evaluations producing structured `RuleEvaluationResult` with `CRITICAL`, `CAUTION`, and `NORMAL` classifications.
- **Strengths**:
  - Covers compound risks (e.g., cardiopulmonary strain: $\text{SpO}_2 \le 93\%$ and $\text{HR} \ge 100\text{ BPM}$).
  - Clinically grounded floor and ceiling bounds for hypoxemia, tachycardia, bradycardia, hypertension, pyrexia, sleep debt, and stress.
  - Generates actionable operational recommendations for crew and flight surgeons.
- **Identified Weaknesses**:
  - Evaluates instantaneous values without considering rate of change (e.g., a rapid heart rate drop from 95 to 45 BPM vs. a resting baseline of 48 BPM).
  - Lacks temporal trend qualifiers (e.g., distinguishing single-reading spike vs. sustained multi-hour excursion).

### 2.4 Alert Engine & Deduplication (`backend/app/health_engine/alert_engine.py`)
- **Current Mechanism**: Deduplicates `CAUTION` alerts within a 30-minute rolling window while allowing `CRITICAL` alerts to bypass deduplication.
- **Strengths**:
  - Critical alerts are strictly never suppressed.
  - Unacknowledged duplicate caution alerts are suppressed to prevent alert fatigue.
- **Identified Weaknesses**:
  - Does not link alerts to temporal trajectory states (e.g., deteriorating, recovering, or chronic).

### 2.5 Analysis Service Integration (`backend/app/services/analysis_service.py`)
- **Current Mechanism**: Orchestrates reading retrieval $\rightarrow$ baseline update $\rightarrow$ rule evaluation $\rightarrow$ ML anomaly detection $\rightarrow$ alert generation $\rightarrow$ database persistence in `AnalysisResult`.
- **Strengths**:
  - Fully transactional database operations.
  - Guarantees that ML predictions of "nominal" never suppress rule-based `CRITICAL` alerts.
  - Preserves full audit history.
- **Identified Weaknesses**:
  - Analysis insight structure provides plain lists of abnormalities without structured, per-metric diagnostic evidence cards.
  - No quantification of epistemic uncertainty or data sufficiency score.

---

## 3. Scientific Boundary & Dataset Provenance Audit

| Dataset Source | Provenance Category | Intended Module | Validated Scientific Bounds |
| :--- | :--- | :--- | :--- |
| **NASA OSDR** | `REAL_RESEARCH` | Spaceflight Multi-omics / Radiation | Ground/flight molecular assays; **not** high-frequency live ICU telemetry. |
| **NASA NLSP BRSMAct** | `SPACEFLIGHT_ANALOG` | Bedrest Actigraphy & Circadian | 3 bed-rest subjects over 3 study phases; **not** generalizable to acute in-flight cardiovascular crises. |
| **PhysioNet BIDMC** | `REAL_RESEARCH` | ICU PPG & Respiration | High-acuity hospital patient vitals; used for algorithm benchmarking, **not** astronaut nominal baseline. |
| **MIT-BIH** | `REAL_RESEARCH` | Arrhythmia Telemetry | Holter ECG recordings; used for cardiac anomaly detection benchmarking. |
| **Sleep-EDF** | `REAL_RESEARCH` | Polysomnography & Sleep Stages | Overnight EEG/EOG/EMG; used for sleep architecture validation. |
| **WESAD** | `REAL_RESEARCH` | Wearable Stress & Affect | Ambulatory wrist/chest sensor telemetry; benchmark for psychophysiological stress classification. |
| **Synthetic Simulator** | `SIMULATED_TELEMETRY` | Live Crew Telemetry Simulation | Simulated operational spaceflight scenarios for platform demonstration. |

**Strict Isolation Rule**: Research benchmark datasets and spaceflight analog datasets must **never** be mixed or cross-contaminated into live astronaut operational baselines.

---

## 4. Phase 6 AI Enhancement Implementation Plan

1. **Phase 6.2**: Robust Multivariate Anomaly Detection (`app/ml/anomaly_detection.py`)
   - Median/IQR robust feature scaling.
   - Explicit missing feature masks (zero-imputation strictly forbidden).
   - Physiological dimension weights and feature contribution vectors.
   - Versioned model metadata and inference provenance.

2. **Phase 6.3**: Personalized Health Intelligence & Robust Baselines (`app/health_engine/baseline.py`)
   - Rolling percentiles (p10, p25, p50, p75, p90) and IQR computation.
   - Outlier / pathological contamination filtering for baseline stability.
   - Strict per-astronaut isolation.

3. **Phase 6.4**: Dedicated Temporal Deterioration Detection (`app/ml/temporal_analysis.py`)
   - Moving averages (SMA, EMA with $\alpha=0.3$).
   - Rate of change ($\Delta / \Delta t$) for critical vitals.
   - Trajectory classifications: `SINGLE_SPIKE`, `REPEATED_DEVIATION`, `GRADUAL_DETERIORATION`, `CHRONIC_PERSISTENT`, `RECOVERY_TREND`, `STABLE_NOMINAL`.
   - Observation gap awareness to suppress false rate estimates over prolonged gaps.

4. **Phase 6.5**: Explainable AI Engine (`app/ml/explainability.py`)
   - Structured per-vital evidence cards (observed value, baseline reference, z-score, percentile, clinical boundary, rationale).
   - Compound multi-metric risk explanations.

5. **Phase 6.6**: Confidence & Uncertainty Estimation (`app/ml/uncertainty.py`)
   - Distinction between clinical severity and epistemic uncertainty.
   - Multi-factor Evidence Sufficiency Score (data completeness, sample maturity, sensor recency).
   - Out-of-Distribution (OOD) flagging.

6. **Phase 6.7**: Missing-Data-Aware Preprocessing (`app/ml/preprocessing.py`)
   - Sensor validation, stale data flagging, and partial feature vector handling.

7. **Phase 6.8**: Rigorous Model Evaluation (`app/ml/evaluation.py`)
   - Subject-level holdout validation (zero leakage across train/test subjects).
   - Precision, Recall, F1, Specificity, FPR, FNR, Confusion Matrix.
   - Evaluation harness for benchmark datasets (WESAD, BIDMC, Sleep-EDF).

8. **Phase 6.9 & 6.10**: Seamless Service Integration & Regression Testing
   - Full integration with `analysis_service.py` preserving DB schema and API contracts.
   - Comprehensive test suite in `backend/tests/test_ai_engine_phase6.py`.
