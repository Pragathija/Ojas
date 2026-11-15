# NASA BRSMAct Dataset Integration Module

**Dataset**: UTMB Bedrest Campaign 1 Actigraphy (`BRSMAct`)  
**Experiment**: Bed Rest Standard Measures: Actilight / Actigraphy  
**Provenance Category**: `SPACEFLIGHT_ANALOG`  
**Host Archive**: NASA Life Sciences Portal (NLSP) / NASA Life Sciences Data Archive (LSDA)  
**Catalogue ID**: `e26501eb-7d7a-5012-8c8e-c5bdb3eecaf6`  

---

## 1. Module Overview

This module provides a dedicated, scientifically rigorous ingestion and research analysis pipeline for authentic NASA actigraphy data collected during UTMB Bedrest Campaign 1 (Flight Analogs Research Unit - FARU, Galveston, TX).

```
backend/app/datasets/nasa_brsmact/
├── __init__.py           # Package exports
├── loader.py             # Dedicated parser, unit normalizer, and deduplicator
├── models.py             # Pydantic validation schemas and analytical structures
├── analysis.py           # Phase comparison, subject summaries, BR_Day trajectory, missing data audit
├── data_dictionary.py    # Authoritative definitions of fields, physical units, and ranges
├── provenance.py         # SHA-256 integrity verification against acquisition_manifest.json
└── README.md             # This document
```

---

## 2. Integrity & Non-Fabrication Guarantees

1. **Original Data Preservation**:
   - Raw NASA files in `backend/data/nasa_original/nlsp_actigraphy/raw/` are **never modified**.
   - SHA-256 and MD5 hashes are validated against `acquisition_manifest.json` before processing.
2. **Zero Inferred Telemetry**:
   - The BRSMAct dataset contains only actigraph-derived sleep parameters.
   - The loader strictly **never invents or imputes** Heart Rate (BPM), SpO₂, Blood Pressure, Body Temperature, Stress Level, Mood, or Step counts.
3. **No Diagnostic Overreach**:
   - Verbatim medication notes (`Ambien 5mg`, `Diphenhydramine 50mg`, etc.) are preserved as clinical annotations and **never converted into health diagnoses**.

---

## 3. Handling Duplicate Records & Schema Divergence

The two NASA CSV files in the catalogue diverge in scope and purpose:

- **`BRSMACT_Campagin_1_Actigraphy.csv` (Authoritative Primary)**:
  - 207 total rows (balanced 69 scheduled days × 3 subjects: `C1G0001`, `C1G0002`, `C1G0003`).
  - Exactly 1 record per subject per day (zero duplicate keys).
  - Explicit `'No Data'` annotations for missing observation nights.
- **`BRSMACT_Campagin_1_Actigraphy_Query_Result.csv` (Database Query Export)**:
  - 191 total rows.
  - Covers only `C1G0002` (6 rows, POST_TEST) and `C1G0003` (185 rows across multiple query matches, sub-episodes, and medication events).
  - Omits `C1G0001` entirely. Contains internal database `Record Number` keys.

### Harmonization & Deduplication Rule
The loader uses `BRSMACT_Campagin_1_Actigraphy.csv` as the canonical master grid (207 records). It enriches records with `Record Number` and detailed medication commentary from the query result file matching on `(Subject, Date)`. It **never blindly concatenates** the two files, preventing row duplication and bias.

---

## 4. Normalized Measurements & Physical Units

| Normalized Field | Target Type | Normalized Unit | Raw Format | Valid Range |
| :--- | :--- | :--- | :--- | :--- |
| `sleep_duration_minutes` | `float` | Minutes | `HH:mm` or `HH:mm:ss` | 60.0 to 720.0 min |
| `sleep_latency_minutes` | `float` | Minutes | `HH:mm` | 0.0 to 300.0 min |
| `sleep_efficiency_pct` | `float` | Percent (%) | String or float | 0.0 to 100.0 % |
| `date` | `datetime.date` | Date | `M/D/YYYY` | 2004-09-07 to 2005-01-18 |
| `test_phase` | `str` | Category | String | `PRE_TEST`, `IN_TEST`, `POST_TEST` |
| `br_day` | `int` | Study Day | Integer | 0 to 60 |

---

## 5. Research Analysis Findings

Executing `generate_research_report()` over the harmonized 207 observations reveals:

### Phase Comparison
- **`PRE_TEST` (Ambulatory Baseline, Days BR-2 to BR-1)**:
  - Scheduled: 6 days (2 valid, 4 missing / 'No Data' for C1G0002 & C1G0003).
  - Mean Duration: 467.0 min (7.78 hrs, std: 4.24 min).
  - Mean Latency: 10.0 min (std: 5.66 min).
  - Mean Efficiency: 93.95% (std: 2.62%).
- **`IN_TEST` (60-Day 6° Head-Down Tilt Bed Rest)**:
  - Scheduled: 180 days (167 valid, 13 missing).
  - Mean Duration: 431.88 min (7.20 hrs, std: 31.59 min) — **35.1 min reduction**.
  - Mean Latency: 42.75 min (std: 31.86 min) — **over 4× increase in sleep latency**.
  - Mean Efficiency: 81.65% (std: 8.47%) — **12.3% drop in sleep efficiency**.
- **`POST_TEST` (Recovery Re-ambulation, Days BR+0 to BR+6)**:
  - Scheduled: 21 days (21 valid, 0 missing).
  - Mean Duration: 444.0 min (7.40 hrs, std: 24.18 min).
  - Mean Latency: 32.57 min (std: 24.25 min).
  - Mean Efficiency: 83.26% (std: 5.79%).

### Subject Summaries
- **`C1G0001`**: 69/69 valid days (0 missing, 1 medication day). Mean Duration: 436.75 min, Mean Efficiency: 88.24%.
- **`C1G0002`**: 62/69 valid days (7 missing, 21 medication days). Mean Duration: 433.0 min, Mean Efficiency: 77.32%.
- **`C1G0003`**: 59/69 valid days (10 missing, 23 medication days). Mean Duration: 430.51 min, Mean Efficiency: 79.49%.

---

## 6. Scientific Limitations & Boundaries

> [!CAUTION]
> **Exploratory Analog Boundary**:
> 1. **Sample Size**: Contains data from exactly **3 human subjects**.
> 2. **Analog Context**: Ground-based head-down tilt bed rest simulates cephalad fluid redistribution and horizontal physical confinement. It does **not** simulate space radiation, EVA workload, or spacecraft cabin acoustics.
> 3. **Non-Generalizability**: This dataset must **never be used to train general machine learning classifiers** or replace real-time astronaut personal baselines.
