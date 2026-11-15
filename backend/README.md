# Ojas Backend & AI Health Engine

[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green.svg)](https://fastapi.tiangolo.com/)
[![SQLite](https://img.shields.io/badge/SQLite-SQLAlchemy-orange.svg)](https://www.sqlalchemy.org/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-Isolation--Forest-red.svg)](https://scikit-learn.org/)
[![Tests](https://img.shields.io/badge/Tests-15%20Passed-brightgreen.svg)]()

> **Project Ojas** — NASA Space Apps Challenge 2026.  
> An explainable, lightweight astronaut health monitoring backend and AI analysis engine designed for long-duration deep space exploration missions.

---

## 🚀 Key Highlights & Philosophy

- **10 Core Health & Behavioral Metrics**: Tracks Heart Rate (BPM), SpO₂ (%), Blood Pressure (Systolic/Diastolic), Body Temperature (°C), Sleep Duration, Sleep Quality, Stress Index, Mood, Physical Activity Minutes, and Fatigue Scale.
- **Explainable-First AI**: Multi-tiered decision rules evaluate composite risk (e.g., cardiopulmonary strain, cumulative sleep debt, hypoxia) with human-readable rationale and actionable mission protocols.
- **Dynamic Personal Baselines**: Statistical rolling baseline ($Z$-score deviations) established per individual astronaut.
- **Supplementary Isolation Forest**: Unsupervised multivariate anomaly detection active only when sufficient telemetry history exists ($N \ge 20$) without claiming clinical diagnoses.
- **Intelligent Alert Management**: Severity grading (`NORMAL`, `CAUTION`, `CRITICAL`), automated duplicate suppression for caution conditions within sliding windows, and mandatory unsuppressed escalation for critical states.
- **100% Offline & Hackathon-Ready**: Self-contained SQLite database with zero external paid API dependencies.

---

## 📁 Architecture Overview

```
Ojas/backend/
├── app/
│   ├── main.py                     # FastAPI app, CORS setup, Lifespan DB init, /health endpoint
│   ├── core/
│   │   ├── config.py               # Pydantic Settings, thresholds, CORS origins
│   │   └── dependencies.py         # Database session injection
│   ├── database/
│   │   └── connection.py           # SQLite engine, scoped session maker, init_db()
│   ├── models/
│   │   ├── astronaut.py            # Astronaut profile model
│   │   ├── health_record.py        # 10 vital & behavioral telemetry metrics
│   │   ├── health_baseline.py      # Statistical personal baseline records
│   │   ├── health_alert.py         # Severity (NORMAL, CAUTION, CRITICAL), acknowledgement
│   │   └── analysis_result.py      # Explainable AI insights & recommendations
│   ├── schemas/
│   │   ├── health.py               # Pydantic schemas (HealthReadingCreate, Summary, Response)
│   │   ├── analysis.py             # Schema for AI Insights & trend metrics
│   │   └── alert.py                # Schema for alert listing and acknowledgement
│   ├── health_engine/
│   │   ├── validation.py           # Physiological boundary sanity checks
│   │   ├── baseline.py             # Rolling baseline calculator (mean, std, percentiles)
│   │   ├── risk_rules.py           # Explainable rules (hypoxia, tachycardia, sleep debt, fatigue)
│   │   └── alert_engine.py         # Duplicate prevention & alert persistence
│   ├── ml/
│   │   └── anomaly_detection.py    # Isolation Forest detector (supplementary, N >= 20)
│   ├── services/
│   │   ├── health_service.py       # Telemetry ingestion, latest query, summary calculation
│   │   ├── analysis_service.py     # Orchestrator for rules + baseline + ML anomaly detection
│   │   └── alert_service.py        # Alert query, acknowledgement
│   └── api/
│       └── v1/
│           ├── router.py           # V1 API router bundler
│           └── endpoints/
│               ├── health.py       # /readings, /latest, /summary
│               ├── analysis.py     # /run, /latest, /history
│               └── alerts.py       # /alerts, /{id}/acknowledge
├── scripts/
│   └── seed_database.py            # Synthetic mission scenarios (nominal, hypoxia, sleep decay)
├── tests/
│   ├── conftest.py                 # SQLite in-memory fixture & test database
│   ├── test_health_api.py          # API validation, ingestion & summary tests
│   ├── test_health_engine.py       # Baseline math, rules, & Isolation Forest tests
│   └── test_alerts.py              # Alert deduplication & acknowledgement tests
├── ojas.db                         # Seeded local SQLite database
├── requirements.txt
├── .env.example
└── README.md
```

---

## 🛠️ Installation & Quickstart

### Prerequisites
- Python 3.12+

### 1. Create & Activate Virtual Environment
```bash
# Navigate to backend directory
cd Ojas/backend

# Windows
python -m venv .venv
.\.venv\Scripts\activate

# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Generate Demonstration Seed Data
Populates 3 realistic astronaut profiles (`ASTRO-01`, `ASTRO-02`, `ASTRO-03`) spanning 56 synthetic telemetry readings, baseline calculations, and alerts:
```bash
python scripts/seed_database.py
```

### 4. Run the Backend Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger API documentation will be available at: **[http://localhost:8000/docs](http://localhost:8000/docs)**.

---

## 🧪 Running Automated Tests

Run the complete 15-test test suite covering data validation, rule evaluation, Isolation Forest thresholds, and alert deduplication:
```bash
pytest tests -v
```

All 15 tests run in ~0.1s using isolated in-memory SQLite fixtures.

---

## 📡 API Contract & Integration Examples

### Base URL: `http://localhost:8000` (API v1: `/api/v1`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | System health and database connectivity status |
| `POST` | `/api/v1/health/readings` | Ingest new astronaut telemetry reading |
| `GET` | `/api/v1/health/readings` | Retrieve historical readings (paginated) |
| `GET` | `/api/v1/health/latest` | Retrieve latest reading for an astronaut |
| `GET` | `/api/v1/health/summary` | Retrieve 10-metric averages and overall status |
| `POST` | `/api/v1/analysis/run` | Execute on-demand AI analysis |
| `GET` | `/api/v1/analysis/latest` | Get latest structured AI insight and actions |
| `GET` | `/api/v1/analysis/history` | Get historical AI analysis insights |
| `GET` | `/api/v1/alerts` | List health alerts with severity/status filters |
| `PATCH` | `/api/v1/alerts/{id}/acknowledge` | Acknowledge an active health alert |

---

### Sample Requests & Responses

#### 1. Ingest Telemetry (`POST /api/v1/health/readings`)
**Request:**
```bash
curl -X POST "http://localhost:8000/api/v1/health/readings" \
     -H "Content-Type: application/json" \
     -d '{
       "astronaut_id": "ASTRO-01",
       "heart_rate": 74.0,
       "blood_oxygen": 98.2,
       "systolic_bp": 118.0,
       "diastolic_bp": 78.0,
       "body_temperature": 36.6,
       "sleep_duration": 7.5,
       "sleep_quality": 88.0,
       "stress_level": 28.0,
       "mood": "Focused",
       "physical_activity_minutes": 60.0,
       "fatigue_level": 2.0,
       "is_synthetic": true,
       "notes": "Routine morning packet"
     }'
```
**Response (`201 Created`):**
```json
{
  "astronaut_id": "ASTRO-01",
  "heart_rate": 74.0,
  "blood_oxygen": 98.2,
  "systolic_bp": 118.0,
  "diastolic_bp": 78.0,
  "body_temperature": 36.6,
  "sleep_duration": 7.5,
  "sleep_quality": 88.0,
  "stress_level": 28.0,
  "mood": "Focused",
  "physical_activity_minutes": 60.0,
  "fatigue_level": 2.0,
  "is_synthetic": true,
  "notes": "Routine morning packet",
  "id": 57,
  "timestamp": "2026-11-15T04:22:00Z"
}
```

#### 2. Get Health Summary (`GET /api/v1/health/summary?astronaut_id=ASTRO-01`)
**Response (`200 OK`):**
```json
{
  "astronaut_id": "ASTRO-01",
  "total_readings": 26,
  "latest_reading": {
    "id": 57,
    "astronaut_id": "ASTRO-01",
    "timestamp": "2026-11-15T04:22:00Z",
    "heart_rate": 74.0,
    "blood_oxygen": 98.2,
    "systolic_bp": 118.0,
    "diastolic_bp": 78.0,
    "body_temperature": 36.6,
    "sleep_duration": 7.5,
    "sleep_quality": 88.0,
    "stress_level": 28.0,
    "mood": "Focused",
    "physical_activity_minutes": 60.0,
    "fatigue_level": 2.0,
    "is_synthetic": true,
    "notes": "Routine morning packet"
  },
  "averages": {
    "heart_rate": 68.8,
    "blood_oxygen": 98.4,
    "systolic_bp": 119.5,
    "diastolic_bp": 78.0,
    "body_temperature": 36.7,
    "sleep_duration": 7.6,
    "sleep_quality": 87.5,
    "stress_level": 27.5,
    "fatigue_level": 2.2
  },
  "current_status": "NORMAL",
  "disclaimer": "Ojas health analysis provides synthetic astronaut self-monitoring telemetry and does not represent clinical diagnostic advice."
}
```

#### 3. Run AI Health Analysis (`POST /api/v1/analysis/run`)
**Request:**
```bash
curl -X POST "http://localhost:8000/api/v1/analysis/run" \
     -H "Content-Type: application/json" \
     -d '{
       "astronaut_id": "ASTRO-03"
     }'
```
**Response (`200 OK`):**
```json
{
  "id": 56,
  "astronaut_id": "ASTRO-03",
  "timestamp": "2026-11-15T04:20:00Z",
  "overall_status": "CRITICAL",
  "severity": "CRITICAL",
  "detected_abnormalities": [
    "Cardiopulmonary Strain Detected",
    "Elevated Heart Rate"
  ],
  "baseline_deviations": {
    "heart_rate": {
      "current": 118.0,
      "baseline_mean": 72.2,
      "delta": 45.8,
      "z_score": 19.9,
      "unit": "BPM",
      "direction": "elevated"
    },
    "blood_oxygen": {
      "current": 91.5,
      "baseline_mean": 98.7,
      "delta": -7.2,
      "z_score": -14.4,
      "unit": "%",
      "direction": "reduced"
    }
  },
  "contributing_factors": [
    "SpO2 depressed at 91.5%",
    "Heart rate elevated at 118 BPM"
  ],
  "recommended_actions": [
    "Immediately pause current activity, check cabin/suit atmospheric oxygen levels, and alert mission flight surgeon."
  ],
  "anomaly_score": null,
  "reading_id": 56,
  "disclaimer": "Explainable automated monitoring insight based on deterministic space mission safety parameters."
}
```

#### 4. Acknowledge Alert (`PATCH /api/v1/alerts/{id}/acknowledge`)
**Request:**
```bash
curl -X PATCH "http://localhost:8000/api/v1/alerts/7/acknowledge" \
     -H "Content-Type: application/json" \
     -d '{
       "acknowledged_by": "Commander Sarah Connor"
     }'
```
**Response (`200 OK`):**
```json
{
  "id": 7,
  "astronaut_id": "ASTRO-03",
  "timestamp": "2026-11-15T04:20:00Z",
  "severity": "CRITICAL",
  "category": "COMPOUND",
  "title": "Cardiopulmonary Strain Detected",
  "description": "Simultaneous low oxygen saturation (91.5%) and tachycardia (118 BPM).",
  "recommended_action": "Immediately pause current activity, check cabin/suit atmospheric oxygen levels, and alert mission flight surgeon.",
  "is_acknowledged": true,
  "acknowledged_at": "2026-11-15T04:23:45Z",
  "acknowledged_by": "Commander Sarah Connor"
}
```

---

## 🛡️ Medical & Ethical Disclaimer

All sensor data, rules, baseline calculations, and alerts implemented in **Project Ojas** are synthetic representations developed for the NASA Space Apps Challenge hackathon demonstration. They do not constitute official clinical diagnoses or NASA medical operational flight rules.
