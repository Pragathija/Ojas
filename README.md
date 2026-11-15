# Ojas — AI-Powered Astronaut Health Monitoring Platform

**NASA Space Apps Challenge 2026**

Ojas is an AI-powered, gamified astronaut health monitoring platform designed for long-duration deep space exploration missions. It combines continuous health analytics, personal statistical baselines, explainable risk rules, unsupervised anomaly detection, and interactive self-monitoring challenges to help astronauts maintain physical and psychological readiness.

---

## 🏛️ Project Structure

```
Ojas/
├── backend/                  # FastAPI & AI Health Engine (Person 2)
│   ├── app/                  # Application code (API v1, models, schemas, health engine, ML)
│   ├── data/                 # Sample & synthetic datasets
│   ├── scripts/              # Database seeding and demo scripts
│   ├── tests/                # Automated pytest suite (15 unit & integration tests)
│   ├── ojas.db               # SQLite database
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Environment variables template
│   └── README.md             # Detailed Backend Documentation
│
├── frontend/                 # React & Vite Frontend (Person 1)
│   ├── src/                  # Components, pages, services, layouts, hooks
│   ├── public/               # Static icons, images, manifest
│   ├── package.json          # Frontend packages
│   └── vite.config.ts        # Vite config
│
├── docs/                     # System architecture and API specifications
├── infrastructure/           # Dockerfiles and compose setups
└── README.md
```

---

## 🚀 Getting Started

### 1. Backend Quickstart (Python 3.12+)

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.\.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed realistic astronaut mission telemetry (3 profiles, 56 readings, alerts)
python scripts/seed_database.py

# Run the API server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- Interactive API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

### 2. Frontend Quickstart (Node.js & Vite)

```bash
cd frontend
npm install
npm run dev
```
- App UI: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Testing

Run backend automated tests:
```bash
cd backend
pytest tests -v
```

---

## 📄 Documentation

- [Backend Documentation](file:///c:/Users/Pragathija/Documents/Projects/NASA/Ojas/backend/README.md)
- [API Contract & Schema](file:///c:/Users/Pragathija/Documents/Projects/NASA/Ojas/docs/API_CONTRACT.md)
- [Architecture](file:///c:/Users/Pragathija/Documents/Projects/NASA/Ojas/docs/ARCHITECTURE.md)
