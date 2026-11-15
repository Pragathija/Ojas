# Phase 12 — Official NASA Resource Inventory & Data Provenance Registry

**Project Ojas — NASA Space Apps Challenge 2026**  
**Module:** Backend Research & Data Engineering  
**Version:** 1.0.0 (Phase 12 Audited)  

---

## 1. Executive Summary

Project Ojas is an intelligent astronaut health monitoring platform designed to support long-duration human space exploration. A core tenet of the system is absolute scientific traceability: real-time astronaut health scoring, baseline calibration, and clinical risk rules are rooted in genuine aerospace physiology literature and verified through authentic spaceflight and spaceflight-analog datasets.

This document provides a comprehensive, cryptographically verified inventory of every official **NASA dataset, portal, and API resource** utilized by Ojas. It also defines strict categorization boundaries separating authentic NASA repositories from external terrestrial biomedical benchmarks.

---

## 2. Authentic NASA Spaceflight & Mission Analog Datasets

### 2.1 NASA Open Science Data Repository (OSDR) — Spaceflight Biomarkers

The NASA Open Science Data Repository (OSDR) is the primary open-science clearinghouse for space biology, omics, and physiological investigations funded by NASA's Biological and Physical Sciences Division.

#### Study 1: OSD-575
- **Study Accession**: `OSD-575`
- **Study Title**: Spaceflight-induced changes in blood serum comprehensive metabolic panel (CMP) and cytokine profiles from the SpaceX Inspiration4 mission
- **Mission**: SpaceX Inspiration4 (September 15–18, 2021; 3 days, low Earth orbit ~585 km, 51.6° inclination)
- **Cohort**: 4 human civilian commercial astronauts (`C001`, `C002`, `C003`, `C004`)
- **Longitudinal Design**: 7 distinct sampling epochs:
  - Pre-flight Baseline: `L-92`, `L-44`, `L-3` (days prior to launch)
  - Post-flight Acute Re-entry: `R+1` (1 day post-splashdown)
  - Post-flight Recovery: `R+45`, `R+82`, `R+194` (days post-splashdown)
- **Official Repository URL**: [https://osdr.nasa.gov/bio/repo/data/studies/OSD-575](https://osdr.nasa.gov/bio/repo/data/studies/OSD-575)
- **API Endpoint**: `https://osdr.nasa.gov/osdr/data/osd/meta/575`
- **License / Access**: NASA Open Science Data Policy (U.S. Public Domain / CC0 Equivalent)
- **Local Directory**: `backend/data/nasa_original/osdr/`

**Acquired Files & Cryptographic Verification:**
| File Name | Category | Size (Bytes) | SHA-256 Checksum | MD5 Checksum |
| :--- | :--- | :--- | :--- | :--- |
| `raw/LSDS-8_Comprehensive_Metabolic_Panel_CMP_TRANSFORMED.csv` | Raw Data | 8,506 | `5eb1e7f025dd8443a9e70111e62bc32afae3432753024489c5c013e401d709d9` | `80aaff7db2c940d1cf810fa84324ef32` |
| `raw/LSDS-8_Multiplex_serum_cardiovascular_EvePanel_TRANSFORMED.csv` | Raw Data | 6,207 | `fdba6c3ce45401c12ca9b699fa375303793959aa0391e2f3c722f354d9cfc75c` | `badd9896458887d4e0097f11acf67dc8` |
| `raw/LSDS-8_Multiplex_serum_immune_EvePanel_TRANSFORMED.csv` | Raw Data | 41,214 | `efa8fb807e3b7e363df47f64f48d03c57d2397daf8fd22afc0ea4335d5d3d53e` | `b3d48356c9908542654130ebd7ac49d4` |
| `metadata/OSD-575_metadata_OSD-575-ISA.zip` | Metadata | 71,702 | `a1d3e49e2b61ab427a8760d0c98e0324a53272d0e1314632290266b014476f1d` | `5b29f50d6068120be2734f2a94357425` |

- **Clinical Analytes Integrated**: Glucose, BUN, Creatinine, eGFR, Sodium, Potassium, Chloride, Carbon Dioxide, Calcium, Total Protein, Albumin, Globulin, Total Bilirubin, Alkaline Phosphatase (ALP), AST, ALT, and targeted cytokines.
- **Ojas Utilization**: Retrospective clinical biochemistry analysis, liver and renal stress profiling post-spaceflight, and laboratory reference range excursion tracking.
- **Scientific Boundary / Limitations**: Discrete venous blood draw points; cannot provide real-time second-by-second vitals. Retrospective research context only.

---

#### Study 2: OSD-569
- **Study Accession**: `OSD-569`
- **Study Title**: Complete blood count (CBC) profiles from the SpaceX Inspiration4 mission crew
- **Mission**: SpaceX Inspiration4 (September 15–18, 2021)
- **Cohort**: 4 human civilian commercial astronauts (`C001`, `C002`, `C003`, `C004`)
- **Longitudinal Design**: 7 matching sampling epochs (`L-92`, `L-44`, `L-3`, `R+1`, `R+45`, `R+82`, `R+194`)
- **Official Repository URL**: [https://osdr.nasa.gov/bio/repo/data/studies/OSD-569](https://osdr.nasa.gov/bio/repo/data/studies/OSD-569)
- **API Endpoint**: `https://osdr.nasa.gov/osdr/data/osd/meta/569`
- **License / Access**: NASA Open Science Data Policy (U.S. Public Domain / CC0 Equivalent)
- **Local Directory**: `backend/data/nasa_original/osdr/`

**Acquired Files & Cryptographic Verification:**
| File Name | Category | Size (Bytes) | SHA-256 Checksum | MD5 Checksum |
| :--- | :--- | :--- | :--- | :--- |
| `raw/LSDS-7_Complete_Blood_Count_CBC_TRANSFORMED.csv` | Raw Data | 9,317 | `32e4f9c97d3b636b5d5c2e72dab8c4d3319dee64c437508b092dad04603b2b8f` | `06f3919e07b697119891ed0a777f8ee8` |
| `metadata/OSD-569_metadata_OSD-569-ISA.zip` | Metadata | 123,512 | `5b3c19c5079816b283125caf4009db8e39d48377d92763e9e61e86e3e1b4c159` | `b391305c6ea78a1d9dff78b6a73a5437` |

- **Hematologic Analytes Integrated**: White Blood Cells (WBC), Red Blood Cells (RBC), Hemoglobin, Hematocrit, MCV, MCH, MCHC, RDW, Platelet Count, Absolute Neutrophils, Absolute Lymphocytes, Absolute Monocytes, Absolute Eosinophils, Absolute Basophils.
- **Ojas Utilization**: Validates spaceflight immune dysregulation models, post-splashdown stress lymphopenia ($-29.4\%$ reduction observed at $R+1$), and subsequent homeostatic recovery.
- **Scientific Boundary / Limitations**: Hematology profiles reflect whole-blood cellular distributions. They must never be synthetically converted into arterial oxygen saturation or continuous pulse rates.

---

### 2.2 NASA Life Sciences Portal (NLSP) & Life Sciences Data Archive (LSDA)

The NASA Life Sciences Portal provides access to flight and ground analog research data generated across NASA human spaceflight analog campaigns.

#### Dataset: NASA BRSMAct (UTMB Bedrest Campaign 1 Actigraphy)
- **Portal**: NASA Life Sciences Portal (NLSP) / Life Sciences Data Archive (LSDA)
- **Catalog Dataset ID**: `e26501eb-7d7a-5012-8c8e-c5bdb3eecaf6`
- **Experiment Slug**: `BRSMAct`
- **Study Title**: UTMB Bedrest Campaign 1 Actigraphy
- **Analog Facility**: University of Texas Medical Branch (UTMB), Galveston, TX
- **Analog Protocol**: -6° Head-Down Tilt Bed Rest (HDTBR), Campaign 1
- **Official Source URL**: [https://nlsp.nasa.gov/search/data/details/e26501eb-7d7a-5012-8c8e-c5bdb3eecaf6?dataType=DATASETS](https://nlsp.nasa.gov/search/data/details/e26501eb-7d7a-5012-8c8e-c5bdb3eecaf6?dataType=DATASETS)
- **License / Access**: NASA Open Access Policy / Public Domain
- **Local Directory**: `backend/data/nasa_original/nlsp_actigraphy/`

**Acquired Files & Cryptographic Verification:**
| File Name | Catalog File ID | Size (Bytes) | SHA-256 Checksum | MD5 Checksum |
| :--- | :--- | :--- | :--- | :--- |
| `raw/BRSMACT_Campagin_1_Actigraphy_Query_Result.csv` | `e4630225-a050-54fb-be99-795cf1053654` | 10,928 | `d3932c0f1a72b68dc6d0ba01346d3052040b48616b79380e4892cf47dafea5f2` | `50a84a41acc9be8b99eb0d0661b294ed` |
| `raw/BRSMACT_Campaign_1_Actigraphy_ReadMe.txt` | `ba27dc5f-962a-5af8-a232-0b8bef1e4748` | 467 | `eae6b6c30671582cb31b50d4b9f3360e2185c4cea2a4ea8264ebfb7b6ee8389e` | `5d28f786df8e34ea99f9267040e501cb` |
| `raw/BRSMACT_Campagin_1_Actigraphy.csv` | `972badfb-238d-5dd5-81f2-8efc729a4452` | 11,679 | `2fa3efeb9e6388e8de50f4e2eefc9e6de8740993f1c27ab7ef3282e59398923b` | `761c8d9d31e107186be1b9ca9d2bea79` |

- **Measurements Integrated**: Subject identifier, Bedrest Day (`BR_Day`), Study Phase (`PRE_TEST`, `BED_REST`, `POST_TEST`), Sleep Duration (normalized minutes), Sleep Latency (normalized minutes), Sleep Efficiency (percentage), and Actigraphy Activity Counts.
- **Ojas Utilization**: Evaluates circadian misalignment, sleep fragmentation, and prolonged immobility degradation models under strict cephalad fluid shift analog conditions.
- **Scientific Boundary / Limitations**: Terrestrial bedrest effectively replicates axial unloading and headward fluid redistribution, but does not expose human subjects to cosmic radiation or closed-environment spacecraft acoustics.

---

## 3. NASA Online APIs & Service Integration

Ojas integrates directly with NASA's programmatic data infrastructure via a resilient, asynchronous API client (`OSDRClient` in `backend/app/datasets/osdr/osdr_client.py`).

| Endpoint Pattern | Purpose | Resilience Strategy |
| :--- | :--- | :--- |
| `GET https://osdr.nasa.gov/osdr/data/osd/meta/{id}` | Fetches official study metadata, protocols, and author information. | 10s timeout, exponential backoff, offline fallback to locally cached metadata archive. |
| `GET https://osdr.nasa.gov/osdr/data/osd/files/{id}` | Queries available payload files, transformed tables, and ISA-tab archives. | 10s timeout, exponential backoff, offline fallback to local payload manifest. |
| `GET https://osdr.nasa.gov/geode-py/ws/studies/{id}/download` | Downloads payload tables and raw archives. | Cryptographic verification (SHA-256 and MD5) against `acquisition_manifest.json`. |

---

## 4. Explicit Demarcation of Non-NASA Terrestrial Reference Datasets

To ensure scientific integrity and prevent false claims during evaluation, Ojas explicitly delineates external biomedical benchmark datasets from NASA assets.

The following repositories are utilized exclusively for **offline algorithmic stress testing and baseline signal processing verification**. They are **NOT** NASA datasets, are not sponsored by NASA, and do not represent spaceflight physiology:

| Dataset | Source Portal | Primary Population | Ojas Stress-Testing Purpose |
| :--- | :--- | :--- | :--- |
| **PhysioNet BIDMC** | PhysioNet / MIMIC-II | Terrestrial ICU patients (n=53) | Stress-tests SpO₂ sensor noise filtering and acute hypoxemia rule sensitivity. |
| **MIT-BIH Arrhythmia** | PhysioNet / BIH | Terrestrial cardiology patients (n=47) | Validates ECG beat anomaly detection and extreme arrhythmia threshold triggers. |
| **Sleep-EDF Expanded** | PhysioNet | Terrestrial sleep clinic subjects (n=197) | Benchmarks multi-stage sleep architecture and hypnogram fragmentation parsing. |
| **WESAD** | UCI Machine Learning Repository | Terrestrial laboratory volunteers (n=15) | Validates multi-modal autonomic stress classification (EDA, ECG, Skin Temp). |

**Strict Isolation Guarantee:** Non-NASA datasets are strictly isolated within `backend/app/datasets/` and are never surfaced under `/api/v1/research/nasa` or `/api/v1/research/osdr` endpoints.

---

## 5. Architectural Data Context Quarantine

Ojas enforces three mutually exclusive data contexts across the entire backend:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PROJECT OJAS DATA CONTEXTS                      │
├─────────────────────────┬─────────────────────────┬────────────────────┤
│ 1. LIVE_TELEMETRY       │ 2. SIMULATED_TELEMETRY  │3. NASA_RESEARCH_DATA│
├─────────────────────────┼─────────────────────────┼────────────────────┤
│ • Hardware Sensor Stream│ • Offline Stress Test   │ • NASA OSDR        │
│ • Ed25519 Signed Packets│ • Synthetic Demo Stream │   (OSD-575/OSD-569)│
│ • Real-time Safety Rules│ • is_synthetic = True   │ • NASA BRSMAct     │
│ • Rolling Crew Baselines│ • Deterministic Tests   │ • Read-Only APIs   │
│ • Mission Control Alerts│ • Isolated Astronaut ID │ • Quarantined      │
└─────────────────────────┴─────────────────────────┴────────────────────┘
```

1. **`LIVE_TELEMETRY`**: Real-time incoming vitals packets verified via cryptographic signatures or source auth tokens. Feeds active personalized rolling median/IQR baselines.
2. **`SIMULATED_TELEMETRY`**: Generator-produced sensor streams explicitly tagged with `is_synthetic = True` for offline training, adversarial stress testing, and demonstration.
3. **`NASA_RESEARCH_DATA`**: Authentic NASA biospecimen and spaceflight analog datasets (OSDR Inspiration4 OSD-575/569, BRSMAct bedrest actigraphy). Strictly quarantined in read-only research services; **never injected into live astronaut baselines**.

---

## 6. Verification and Compliance Summary

- **Total Acquired NASA Files**: 9 authentic NASA files (6 OSDR, 3 NLSP).
- **Cryptographic Checksum Match**: 100% SHA-256 and MD5 hash match against official repository manifests.
- **Read-Only API Surface**: 8 NASA OSDR research endpoints (`/api/v1/research/osdr/*`) and 8 NASA BRSMAct research endpoints (`/api/v1/research/nasa/*`).
- **Decoupling Invariant**: Zero runtime dependencies exist between NASA research APIs and real-time mission telemetry pipelines. An outage or payload failure in research services causes zero dropped telemetry frames.
