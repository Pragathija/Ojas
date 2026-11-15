# OJAS PHASE 6 — AI Intelligence & Decision Support Architecture

**Project**: Ojas — AI-Powered Astronaut Health Monitoring Platform  
**Target Module**: Backend Explainable AI & Autonomous Decision Support Engine  
**Release**: Phase 6 Complete  
**Date**: November 2026  

---

## 1. System Overview & Engineering Objectives

The Ojas Phase 6 AI Health Engine provides an autonomous, multi-tier decision-support system designed for long-duration human spaceflight (e.g., lunar surface operations, Mars transit). Operating in high-latency or communication-blackout environments, the engine continuously monitors multi-modal astronaut vital signs and behavioral indicators, delivering deterministic clinical safety guarantees alongside advanced machine learning anomaly detection.

```
+---------------------------------------------------------------------------------------------------+
|                                  OJAS AI HEALTH ENGINE (PHASE 6)                                  |
+---------------------------------------------------------------------------------------------------+
|  1. INGESTION & DATA QUALITY                                                                      |
|     * Range boundary checks [30-250 BPM, 50-100% SpO2]   * Zero-imputation prevention             |
|     * Binary feature observation mask                     * Blood pressure ratio validity         |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|  2. PERSONALIZED ROBUST BASELINE (Subject Isolated)                                               |
|     * Non-parametric percentiles (p10, p25, median, p75, p90) & IQR                               |
|     * Contamination filtering (pathological crises excluded from nominal baseline)               |
|     * Robust z-score calculation: (x - median) / (0.7413 * IQR)                                   |
+---------------------------------------------------------------------------------------------------+
                         |                                                |
                         v                                                v
+-----------------------------------------------+ +-------------------------------------------------+
|  3. TEMPORAL DETERIORATION ENGINE             | |  4. MULTIVARIATE ANOMALY DETECTION              |
|     * SMA (window=3) & EMA (alpha=0.3)        | |     * Isolation Forest (ojas-isoforest-v2)      |
|     * Delta / Delta t hourly rate of change   | |     * Median/IQR robust feature scaling         |
|     * Trajectory Classification:              | |     * Feature contribution attribution vector   |
|       - SINGLE_SPIKE                          | |     * High-dimensional dispersion calibration   |
|       - REPEATED_DEVIATION                    | |     * Minimum history gate (N >= 20)            |
|       - GRADUAL_DETERIORATION                 | +-------------------------------------------------+
|       - CHRONIC_PERSISTENT                    |                         |
|       - RECOVERY_TREND                        |                         |
|       - STABLE_NOMINAL                        |                         |
+-----------------------------------------------+                         |
                         |                                                |
                         +------------------------+-----------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|  5. DETERMINISTIC PHYSIOLOGICAL RISK RULES & NON-SUPPRESSION GUARANTEE                            |
|     * Hypoxia, Tachycardia, Bradycardia, Hypertension, Pyrexia, Sleep Debt, Stress Rules          |
|     * Temporal Trend Injections (Gradual deterioration & Chronic persistent shifts)               |
|     * NON-SUPPRESSION: ML nominal predictions NEVER override CRITICAL alerts                      |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|  6. EXPLAINABILITY & EPISTEMIC UNCERTAINTY                                                        |
|     * Evidence Cards: observed, baseline, z-score, clinical bounds, diagnostic rationale          |
|     * Evidence Sufficiency Score: Completeness (40%) + Maturity (40%) + Sensor Recency (20%)      |
|     * Out-of-Distribution (OOD) flagging                                                          |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|  7. PERSISTENCE & MISSION NOTIFICATION                                                            |
|     * HealthAlert generation with 30-min deduplication for CAUTION, immediate for CRITICAL       |
|     * Enriched AnalysisResult persistence (100% backward-compatible API response contract)        |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Core Architectural Pillars

### 2.1 Sensor Quality & Zero-Imputation Prevention (`app/ml/preprocessing.py`)
- **Vulnerability Solved**: In biomedical signal processing, zero-filling missing vitals (e.g., heart rate = 0 or $\text{SpO}_2 = 0$) causes false alarms (asystole/cardiac arrest).
- **Implementation**:
  - Validates plausible human limits: Heart Rate ($[30, 250]$ BPM), $\text{SpO}_2$ ($[50, 100]\%$), Systolic BP ($[50, 260]$ mmHg), Diastolic BP ($[30, 160]$ mmHg), Body Temp ($[30.0, 45.0]^\circ\text{C}$).
  - Strictly preserves `NaN` and constructs an explicit binary feature mask (`mask = 1.0` if observed, `0.0` if missing).
  - Validates physiological hemodynamic consistency ($\text{Diastolic BP} < \text{Systolic BP}$).

### 2.2 Contamination-Resistant Personal Baselines (`app/health_engine/baseline.py`)
- **Vulnerability Solved**: Chronic or severe illness gradually corrupts standard arithmetic averages, causing pathological vitals to be redefined as the astronaut's "normal baseline."
- **Implementation**:
  - `is_pathological_contamination()` filters out acute crises ($\text{SpO}_2 \le 89\%$, $\text{HR} \ge 140$ or $\le 38\text{ BPM}$, $\text{Systolic BP} \ge 170\text{ mmHg}$, $\text{Temp} \ge 39.0^\circ\text{C}$) before baseline estimation.
  - Generates non-parametric percentiles ($p_{10}, p_{25}, p_{50}/\text{median}, p_{75}, p_{90}$) and Interquartile Range ($\text{IQR} = p_{75} - p_{25}$).
  - Computes robust z-scores:
    $$\text{Robust } z = \frac{x - \text{median}}{0.7413 \cdot \text{IQR}}$$

### 2.3 Temporal Trajectory & Deterioration Tracking (`app/ml/temporal_analysis.py`)
- **Vulnerability Solved**: Point-in-time thresholding fails to distinguish between a single sensor artifact (e.g., a momentary finger probe slip) and progressive hypoxia or decompensation.
- **Implementation**:
  - **Moving Averages**: Simple Moving Average ($\text{SMA}_3$) and Exponential Moving Average ($\text{EMA}_{\alpha=0.3}$).
  - **Rate of Change ($\Delta / \Delta t$)**: Hourly continuous derivatives for HR, $\text{SpO}_2$, and BP.
  - **Observation Gap Safety**: Suppresses derivative calculation if telemetry gap exceeds $4.0$ hours.
  - **Trajectory State Machine**:
    - `SINGLE_SPIKE`: Isolated abnormality surrounded by nominal readings.
    - `REPEATED_DEVIATION`: Fluctuation without clear directional trend.
    - `GRADUAL_DETERIORATION`: Monotonic worsening across $\ge 3$ consecutive samples.
    - `CHRONIC_PERSISTENT`: $\ge 5$ abnormal readings sustained over the window.
    - `RECOVERY_TREND`: Vitals returning to personal baseline following an excursion.
    - `STABLE_NOMINAL`: Completely stable flight envelope.

### 2.4 Multivariate Anomaly Detection (`app/ml/anomaly_detection.py`)
- **Model Version**: `ojas-isoforest-v2`
- **Features**:
  - Median/IQR robust feature scaling:
    $$x_{\text{scaled}} = \frac{x - \text{median}}{\text{IQR}}$$
    Prevents large-magnitude features (e.g., heart rate at $100\text{ BPM}$) from dominating low-magnitude features (e.g., body temperature at $37^\circ\text{C}$).
  - **Attribution Vector**: Computes normalized feature contribution percentages so flight surgeons know exactly which vitals caused an anomaly.
  - **High-Dimensional Dispersion Scoring**: Overcomes Isolation Forest masking in sparse feature shifts by combining tree isolation depth with scaled Chebyshev/L2 dispersion.
  - **Safety Gate**: Active only when historical samples $N \ge 20$.

### 2.5 Explainable AI Diagnostic Cards (`app/ml/explainability.py`)
- Every physiological parameter produces a structured evidence card:
  - `metric`: Display label and unit.
  - `observed_value`: Exact measured reading.
  - `baseline_mean` & `z_score`: Individual deviation.
  - `clinical_bounds`: Standard nominal operating margins.
  - `status`: `NOMINAL`, `CAUTION`, or `CRITICAL`.
  - `rationale`: Plain-language medical reasoning explaining the operational significance.

### 2.6 Epistemic Uncertainty & Evidence Sufficiency (`app/ml/uncertainty.py`)
- Separates clinical illness severity from system epistemic certainty.
- **Evidence Sufficiency Formula**:
  $$\text{Sufficiency} = 0.40 \cdot C_{\text{features}} + 0.40 \cdot M_{\text{samples}} + 0.20 \cdot R_{\text{recency}}$$
  where:
  - $C_{\text{features}} = \frac{\text{valid features}}{9}$
  - $M_{\text{samples}} = \min(1.0, N / 20)$
  - $R_{\text{recency}} = 1.0$ if age $< 12\text{h}$, $0.8$ if age $< 48\text{h}$, $0.5$ if older.
- **Out-of-Distribution (OOD)**: Flags readings deviating $> 4.0$ standard deviations from the personal baseline.

---

## 3. Database & API Contract Preservation

The Phase 6 enhancements integrate seamlessly into the existing architecture without schema migrations:
- Database table `analysis_results` is preserved.
- Enriched diagnostics, temporal trajectories, uncertainty metrics, and model metadata are embedded into the JSON column `baseline_deviations` under private metadata keys:
  - `_temporal_trajectory`
  - `_uncertainty`
  - `_ml_metadata`
  - `_diagnostic_cards`
- Existing API endpoints (`POST /analysis/run`, `GET /analysis/latest`, `GET /analysis/history`) return 100% compliant `AnalysisInsightResponse` objects.
