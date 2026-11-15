# NASA BRSMAct Analog Research API Documentation

**Base Path**: `/api/v1/research/nasa`  
**Classification**: Read-Only Ground Analog Research Telemetry  
**Study Accession**: NASA NLSP `e26501eb-7d7a-5012-8c8e-c5bdb3eecaf6` (LSDA BRSMAct)  
**Security & Privacy**: Read-only, immutable raw files, de-identified participant IDs (`C1G0001`, `C1G0002`, `C1G0003`).

---

## 1. Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/research/nasa/metadata` | Official NASA NLSP study metadata, citations, and licensing. |
| `GET` | `/api/v1/research/nasa/integrity` | Cryptographic SHA-256 and MD5 integrity verification against manifest. |
| `GET` | `/api/v1/research/nasa/overview` | Complete executive research report across all 207 observations. |
| `GET` | `/api/v1/research/nasa/phases` | Phase comparison (`PRE_TEST`, `IN_TEST`, `POST_TEST`) with micro/macro statistics. |
| `GET` | `/api/v1/research/nasa/subjects` | Subject-level longitudinal sleep profiles for `C1G0001`, `C1G0002`, `C1G0003`. |
| `GET` | `/api/v1/research/nasa/trajectory` | Daily cohort averages across the 60-day 6° HDT bed rest confinement. |
| `GET` | `/api/v1/research/nasa/medications` | Pharmacological sleep aid audit (Ambien & Diphenhydramine night metrics). |
| `GET` | `/api/v1/research/nasa/missing-data` | Audit of missing sensor observations per subject, phase, and date. |

---

## 2. Endpoint Details

### 2.1 GET `/api/v1/research/nasa/metadata`
Returns official study provenance, protocol details, and scientific boundary notices.

**Response Example (200 OK)**:
```json
{
  "dataset_id": "nasa_brsmact",
  "dataset_title": "UTMB Bedrest Campaign 1 Actigraphy",
  "experiment_id": "BRSMAct",
  "mission": "Campaign 1",
  "catalog_key": "BRSMACT_Campaign_1_Actigraphy",
  "catalog_id": "e26501eb-7d7a-5012-8c8e-c5bdb3eecaf6",
  "host_portal": "NASA Life Sciences Portal (NLSP)",
  "source_url": "https://nlsp.nasa.gov/search/data/details/e26501eb-7d7a-5012-8c8e-c5bdb3eecaf6?dataType=DATASETS",
  "repository": "NASA Johnson Space Center Life Sciences Data Archive (LSDA)",
  "license": "NASA Open Science Policy / U.S. Federal Government Public Domain",
  "sample_size_subjects": 3,
  "study_phases": ["PRE_TEST", "IN_TEST", "POST_TEST"],
  "data_processing_level": "PROCESSED_SUMMARY",
  "limitations_disclaimer": "CRITICAL SCIENTIFIC DISCLAIMER: This dataset contains ground-based bed rest analog data from exactly 3 human subjects..."
}
```

---

### 2.2 GET `/api/v1/research/nasa/phases`
Returns sleep metrics across experimental study phases with explicit sample size disclosures.

**Sample Bias Notice**:
- `PRE_TEST` has only $N=1$ contributing subject (`C1G0001`), as `C1G0002` and `C1G0003` have zero valid baseline readings.
- Micro-average (pooled by observation) vs Macro-average (subject-level equal weighting) are both reported.

**Response Example (200 OK)**:
```json
{
  "PRE_TEST": {
    "phase_name": "PRE_TEST",
    "total_scheduled_days": 6,
    "valid_observations": 2,
    "missing_observations": 4,
    "missing_rate_pct": 66.67,
    "contributing_subjects_count": 1,
    "contributing_subjects": ["C1G0001"],
    "sample_size_warning": "SAMPLE SIZE WARNING: Only 1 of 3 subjects (C1G0001) has valid observations in PRE_TEST (n=2 days)...",
    "duration_mean_minutes": 467.0,
    "latency_mean_minutes": 10.0,
    "efficiency_mean_pct": 93.95,
    "macro_duration_mean_minutes": 467.0,
    "macro_latency_mean_minutes": 10.0,
    "macro_efficiency_mean_pct": 93.95
  },
  "IN_TEST": {
    "phase_name": "IN_TEST",
    "total_scheduled_days": 180,
    "valid_observations": 167,
    "missing_observations": 13,
    "missing_rate_pct": 7.22,
    "contributing_subjects_count": 3,
    "contributing_subjects": ["C1G0001", "C1G0002", "C1G0003"],
    "duration_mean_minutes": 431.88,
    "macro_duration_mean_minutes": 431.77,
    "latency_mean_minutes": 42.75,
    "macro_latency_mean_minutes": 42.83,
    "efficiency_mean_pct": 81.65,
    "macro_efficiency_mean_pct": 81.42
  },
  "POST_TEST": {
    "phase_name": "POST_TEST",
    "total_scheduled_days": 21,
    "valid_observations": 21,
    "missing_observations": 0,
    "missing_rate_pct": 0.0,
    "contributing_subjects_count": 3,
    "duration_mean_minutes": 444.0,
    "latency_mean_minutes": 32.57,
    "efficiency_mean_pct": 83.26
  }
}
```

---

### 2.3 GET `/api/v1/research/nasa/trajectory?phase=IN_TEST`
Returns daily averages across the 60 consecutive days of 6° HDT confinement for longitudinal charting.

**Query Parameters**:
- `phase` (string, optional, default: `"IN_TEST"`)

**Response Example (200 OK)**:
```json
[
  {
    "test_phase": "IN_TEST",
    "br_day": 1,
    "calendar_dates": ["2004-09-09", "2004-11-03"],
    "subject_count": 3,
    "valid_count": 1,
    "mean_duration_minutes": 472.0,
    "mean_efficiency_pct": 90.8,
    "mean_latency_minutes": 0.0,
    "reported_medications": []
  },
  {
    "test_phase": "IN_TEST",
    "br_day": 5,
    "calendar_dates": ["2004-09-13", "2004-11-07"],
    "subject_count": 3,
    "valid_count": 2,
    "mean_duration_minutes": 448.0,
    "mean_efficiency_pct": 85.65,
    "mean_latency_minutes": 37.0,
    "reported_medications": ["Ambien 5mg"]
  }
]
```

---

### 2.4 GET `/api/v1/research/nasa/medications`
Returns a rigorous pharmacological audit comparing nights with sleep aids vs nights without sleep aids during bed rest.

**Response Example (200 OK)**:
```json
{
  "total_medication_records": 45,
  "medication_distribution_by_drug": {
    "Ambien 5mg": 17,
    "Diphenhydramine 50mg": 18,
    "Diphenhydramine 25mg": 10
  },
  "medication_distribution_by_phase": {
    "IN_TEST": 45
  },
  "in_test_sleep_aid_nights": {
    "observation_count": 42,
    "duration_mean_minutes": 443.10,
    "latency_mean_minutes": 30.67,
    "efficiency_mean_pct": 80.74
  },
  "in_test_non_sleep_aid_nights": {
    "observation_count": 125,
    "duration_mean_minutes": 428.11,
    "latency_mean_minutes": 46.82,
    "efficiency_mean_pct": 81.96
  },
  "clinical_interpretation": "Pharmacological sleep aids (Ambien 5mg, Diphenhydramine 25/50mg) were administered strictly during IN_TEST..."
}
```

---

### 2.5 GET `/api/v1/research/nasa/missing-data`
Returns an audit of missing sensor days per participant and phase.

**Response Example (200 OK)**:
```json
{
  "total_records": 207,
  "total_missing_records": 17,
  "overall_missing_pct": 8.21,
  "missing_by_subject": {
    "C1G0002": 7,
    "C1G0003": 10
  },
  "missing_by_phase": {
    "PRE_TEST": 4,
    "IN_TEST": 13
  },
  "clinical_note": "Missing observations during IN_TEST occurred exclusively within the first 8 adaptation days..."
}
```
