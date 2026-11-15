# Ojas — AI-Powered Astronaut Health Monitoring Platform

**NASA Space Apps Challenge 2026 — Space Health & Exploration Medicine**  
**Repository:** [https://github.com/Pragathija/Ojas](https://github.com/Pragathija/Ojas)

Ojas is an autonomous, mission-critical astronaut health monitoring and medical decision-support platform engineered for deep-space exploration missions (Artemis lunar operations, Mars transit, and commercial low-Earth orbit missions). It pairs continuous biometric telemetry processing with individualized rolling baselines, deterministic physiological safety rules (which unconditionally override statistical models for critical events), unsupervised machine-learning anomaly detection, and empirical validation using authentic NASA spaceflight and mission-analog research data.

---

## 1. System Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                OJAS SYSTEM ARCHITECTURE                              │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ FRONTEND LAYER (React 18 + TypeScript + Vite 6 + Tailwind CSS)                       │
│  • Public Mission Landing Experience (Hero, Challenge, Scientific Foundations)        │
│  • Operational AppShell (Desktop Sidebar + Mobile Header Navigation)                │
│  • Mission Command Dashboard (Real-time vitals, trend charts, telemetry timeline)    │
│  • Biometric Indicators Workspace (Cardiovascular, Respiratory, Circadian, Thermal) │
│  • Longitudinal Trends & Statistical Variance (Historical comparisons & anomalies)   │
│  • NASA Spaceflight Research Explorer (OSDR Inspiration4 & NLSP Bedrest Actigraphy)  │
│  • AI Clinical Insights & Countermeasures (Explainability factors & literature)     │
│  • Data Provider Gateway (Dynamic toggle: live FastAPI backend or offline demo)      │
├──────────────────────────────────────────┬───────────────────────────────────────────┤
│                                          │ REST API / Vite Proxy (:3000 -> :8000)   │
├──────────────────────────────────────────┴───────────────────────────────────────────┤
│ BACKEND & AI ENGINE (Python 3.12 + FastAPI + SQLAlchemy + Scikit-Learn)              │
│  • Cryptographic Device Identity (Ed25519 & HMAC-SHA256 telemetry packet validation) │
│  • High-Throughput Stream Ingestion (Monotonic sequencing & persistent idempotency)  │
│  • Dual-Layer AI Engine:                                                             │
│     - Layer 1: Deterministic Physiological Risk Rules (Critical Non-Suppression)     │
│     - Layer 2: Isolation Forest v2 Anomaly Detector with Robust Median/IQR Scaling    │
│  • Personalized Rolling Baselines (Circadian-aware, drift-resistant tracking)        │
│  • Transactional Outbox Pattern (Guaranteed at-least-once alert event delivery)      │
│  • NASA OSDR Spaceflight Module (OSD-575 & OSD-569 Inspiration4 SOMA Atlas)          │
│  • NASA Analog Module (BRSMAct UTMB Bedrest Campaign 1 Actigraphy)                   │
│  • Production Database Evolution (Alembic migration chain, PostgreSQL compatibility) │
│  • Observability (Structured JSON logs, Prometheus metrics, distributed tracing)     │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### Frontend
- **Runtime & Build Tooling**: Node.js (v20+), Vite 6, TypeScript 5.7
- **UI Framework**: React 18, React Router DOM v6
- **Styling & Design System**: Tailwind CSS v3, PostCSS, Autoprefixer, Custom Cosmos Dark Theme
- **Data Visualization & Charts**: Recharts v2 (Biometric trends, distribution histograms, comparative corridors)
- **State & Query Management**: TanStack React Query v5
- **Icons & Animations**: Lucide React, Framer Motion
- **Architecture**: Pluggable Data Provider Pattern (`mockDataProvider` vs `apiDataProvider`)

### Backend
- **Framework & Web Server**: Python 3.12, FastAPI, Uvicorn, Starlette
- **Data Validation & Schemas**: Pydantic v2, Pydantic-Settings
- **ORM & Database**: SQLAlchemy 2.0, Alembic, SQLite (development) / PostgreSQL (production)
- **Machine Learning & Analytics**: Scikit-Learn (Isolation Forest v2), NumPy, SciPy
- **Security & Cryptography**: Cryptography (Ed25519), hashlib (HMAC-SHA256, SHA-256 dual-hashes)
- **Observability**: Prometheus-compatible metrics collector, structured JSON logging

---

## 3. Prerequisites

- **Python**: 3.12 or higher
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Git**: 2.30+
- **Operating System**: Windows, macOS, or Linux

---

## 4. Environment Configuration

### Backend Configuration (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:
```bash
cd backend
cp .env.example .env
```
Default parameters configured:
```env
PROJECT_NAME="Ojas - Astronaut Health Monitoring Platform"
API_V1_STR="/api/v1"
ENVIRONMENT="development"
DEBUG=True
PORT=8000
DATABASE_URL="sqlite:///./ojas.db"
CORS_ORIGINS=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"]
```

### Frontend Configuration (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:
```bash
cd frontend
cp .env.example .env
```
Key parameters:
```env
# Set to 'api' to connect with the running FastAPI backend, or 'mock' for offline mode
VITE_DATA_PROVIDER=api
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_TITLE=OJAS
```

---

## 5. Quickstart & Installation

### Step 1: Start the Backend Server

```bash
cd backend

# Create and activate virtual environment
# Windows:
python -m venv .venv
.\.venv\Scripts\activate
# Linux / macOS:
# python3 -m venv .venv && source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations (or seed database)
python -m alembic upgrade head
python scripts/seed_database.py

# Launch FastAPI development server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- **Interactive Swagger Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc API Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Service Liveness Probe**: [http://127.0.0.1:8000/health/liveness](http://127.0.0.1:8000/health/liveness)
- **Service Readiness Probe**: [http://127.0.0.1:8000/health/readiness](http://127.0.0.1:8000/health/readiness)

### Step 2: Start the Frontend Application

Open a new terminal window:
```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
- **Application UI**: [http://localhost:3000](http://localhost:3000) (or [http://localhost:5173](http://localhost:5173))

---

## 6. End-to-End API Integration Mapping

| Frontend Feature | Backend API Endpoint | HTTP Method | Integration Status | Description |
| :--- | :--- | :---: | :---: | :--- |
| **Dashboard Summary** | `/api/v1/health/summary` | `GET` | **Integrated** | Retrieves astronaut vitals, baseline corridor, and current health status. |
| **Latest Vitals** | `/api/v1/health/latest` | `GET` | **Integrated** | Returns the most recent physiological sensor reading for an astronaut. |
| **Telemetry History** | `/api/v1/health/readings` | `GET` | **Integrated** | Chronological historical telemetry queryable across timeframes. |
| **Telemetry Ingestion**| `/api/v1/health/readings` | `POST` | **Integrated** | Ingests new telemetry with deduplication and automated alert evaluation. |
| **AI Health Insights** | `/api/v1/analysis/latest` | `GET` | **Integrated** | Retrieves explainable anomaly analysis results and contributing factors. |
| **Insight History** | `/api/v1/analysis/history` | `GET` | **Integrated** | Returns chronological log of AI health analysis findings for trending. |
| **Health Alerts** | `/api/v1/alerts` | `GET` | **Integrated** | Fetches active and historical CAUTION and CRITICAL physiological alerts. |
| **Alert Acknowledgment**| `/api/v1/alerts/{id}/acknowledge` | `PATCH` | **Integrated** | Marks alert as acknowledged with audit actor and timestamp. |
| **NASA OSDR Studies** | `/api/v1/research/osdr/studies` | `GET` | **Integrated** | Returns official metadata for Inspiration4 OSD-575 and OSD-569 datasets. |
| **NASA OSDR Chemistry**| `/api/v1/research/osdr/cmp` | `GET` | **Integrated** | Queries blood serum Comprehensive Metabolic Panel clinical records. |
| **NASA OSDR Hematology**| `/api/v1/research/osdr/cbc` | `GET` | **Integrated** | Queries whole blood Complete Blood Count cellular records. |
| **NASA OSDR Analysis** | `/api/v1/research/osdr/analysis` | `GET` | **Integrated** | Pre-to-post spaceflight deltas, clinical reference excursions, completeness. |
| **NASA OSDR Integrity**| `/api/v1/research/osdr/integrity`| `GET` | **Integrated** | Cryptographic verification of acquired NASA files against SHA-256 manifests. |
| **NASA Analog Metadata**| `/api/v1/research/nasa/metadata` | `GET` | **Integrated** | Returns UTMB bedrest actigraphy experiment and protocol metadata. |
| **NASA Analog Overview**| `/api/v1/research/nasa/overview` | `GET` | **Integrated** | Returns sleep efficiency, duration, latency, and circadian analysis. |
| **NASA Analog Integrity**| `/api/v1/research/nasa/integrity`| `GET` | **Integrated** | Cryptographic verification of raw BRSMAct files against acquisition manifest. |
| **System Readiness** | `/health/readiness` | `GET` | **Integrated** | Verifies database connectivity and model registry readiness. |

---

## 7. Automated Testing Suite

The repository features comprehensive automated test coverage across both backend and frontend layers:

### Running Backend Tests (142 Tests)
```bash
cd backend
python -m pytest tests -v
```
*Current Status: 142 passed, 100% pass rate.*

Test suites include:
- `test_health_api.py`: FastAPI health and telemetry routes
- `test_alerts.py`: Deterministic alert triggers and critical non-suppression
- `test_ai_engine_phase6.py`: Robust scaling, personal baselines, explainability cards
- `test_ai_adversarial_phase7.py`: Stress-testing with extreme values, OOD inputs, zero IQR
- `test_model_governance_phase8.py`: Centralized model registry and lifecycle rollback
- `test_realtime_orchestration_phase9.py`: Stream sequencing, deduplication, quality gateway
- `test_distributed_reliability_phase10.py`: Transactional outbox, restart resilience
- `test_operational_assurance_phase11.py`: Ed25519 device signatures, replay attack rejection
- `test_postgresql_validation_phase11.py`: PostgreSQL DDL and dialect compatibility
- `test_nasa_brsmact.py`: NASA UTMB Bedrest actigraphy research dataset validation
- `test_nasa_osdr_integration_phase12.py`: NASA OSDR Inspiration4 OSD-575 / OSD-569 integration
- `test_e2e_research_and_telemetry_flow_phase12.py`: End-to-end multi-stream and research isolation

### Running Frontend Tests & Typecheck
```bash
cd frontend

# Verify TypeScript compilation across all components
npm run typecheck

# Verify frontend service contract tests
npm test

# Verify production production bundle build
npm run build
```
*Current Status: Zero type errors, 3 service contract tests passing, production bundle built in ~5 seconds.*

---

## 8. Authentic NASA Dataset Attribution

All research datasets integrated into Ojas were acquired from official NASA portals and verified using SHA-256 cryptographic hashes:

1. **NASA Open Science Data Repository (OSDR)**:
   - **OSD-575**: *Spaceflight-induced changes in blood serum comprehensive metabolic panel (CMP) and cytokine profiles from the SpaceX Inspiration4 mission*.
   - **OSD-569**: *Complete blood count (CBC) profiles from the SpaceX Inspiration4 mission crew*.
   - **Mission**: SpaceX Inspiration4 (September 15–18, 2021; low Earth orbit ~585 km).
   - **Cohort**: 4 human civilian commercial astronauts (`C001`–`C004`) across 7 longitudinal epochs (`L-92`, `L-44`, `L-3`, `R+1`, `R+45`, `R+82`, `R+194`).
   - **License**: NASA Open Science Data Policy (U.S. Public Domain / CC0 Equivalent).
2. **NASA Life Sciences Portal (NLSP) & LSDA**:
   - **BRSMAct**: *UTMB Bedrest Campaign 1 Actigraphy* (Dataset ID: `e26501eb-7d7a-5012-8c8e-c5bdb3eecaf6`).
   - **Facility**: University of Texas Medical Branch (UTMB), -6° Head-Down Tilt Bed Rest (HDTBR).
   - **Protocol**: Longitudinal actigraphy, sleep latency, duration, and efficiency.
   - **License**: NASA Open Access Policy / Public Domain.

---

## 9. Operational Boundaries & Disclaimers

1. **Integration-Readiness Prototype**: Ojas is a high-readiness research and mission-control software architecture prototype developed for the NASA Space Apps Challenge 2026. It is not currently certified for active spaceflight operations by NASA Flight Crew Operations or the Johnson Space Center Institutional Review Board.
2. **Three-Tier Data Isolation**: Ojas strictly isolates `LIVE_TELEMETRY`, `SIMULATED_TELEMETRY`, and `NASA_RESEARCH_DATA`. Retrospective research observations never contaminate live baseline calibrations.
3. **Terrestrial Benchmark Delineation**: External benchmark datasets from terrestrial hospital cohorts (PhysioNet BIDMC, MIT-BIH Arrhythmia) are used strictly for offline noise stress-testing and are explicitly demarcated from astronaut physiological baselines.
4. **No Direct Avionics Feeds**: Telemetry ingestion demonstrates verified compatibility with simulated wearable telemetry streams, signed network packets, and authentic NASA retrospective databases. Ojas does not claim unauthorized live data feeds from active ISS avionics or active Orion spacecraft.
