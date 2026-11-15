# Ojas Infrastructure & Deployment Guide

This directory contains containerization specifications, orchestration manifests, and deployment procedures for **Project Ojas** on Google Cloud Run.

---

## 🏗️ Container Architecture

The system uses multi-stage, hardened Dockerfiles located in `infrastructure/docker/`:

```
infrastructure/
├── docker/
│   ├── backend.Dockerfile        # Multi-stage Python 3.12 slim, non-root UID 10001
│   ├── frontend.Dockerfile       # Multi-stage Node 20 LTS -> Nginx Alpine
│   └── nginx.conf                # Nginx reverse proxy with SPA routing & security headers
├── docker-compose.yml            # Local development orchestration with volume mounts
└── deployment/
    └── README.md                 # This guide
```

### 1. Backend Container (`backend.Dockerfile`)
- **Base Image**: `python:3.12-slim` (minimal attack surface, ~180MB total size).
- **Multi-Stage Build**:
  - `builder` stage: Compiles wheels and builds `/opt/venv` using `build-essential` and `libpq-dev`.
  - `runner` stage: Copies only the clean virtual environment into a slim runtime without compilers.
- **Security & Non-Root Execution**: Runs as unprivileged user `ojasuser` (`UID 10001`, `GID 10001`). Root access is dropped.
- **Dynamic Port Binding**: Cloud Run injects `$PORT` (default `8080`). Entrypoint dynamically launches `uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}`.
- **Health Check**: Native `curl` probe against `http://localhost:${PORT}/health` checking application and database readiness.
- **Context Isolation**: Protected by `.dockerignore` to ensure `.venv/`, local `.db` files, and `.git` are never bundled.

### 2. Frontend Container (`frontend.Dockerfile`)
- **Stage 1 (Builder)**: `node:20-alpine` runs `npm ci` and Vite production build (`npm run build`). Accepts build argument `ARG VITE_API_BASE_URL`.
- **Stage 2 (Runner)**: `nginx:alpine` serves static assets with SPA routing fallback (`try_files $uri $uri/ /index.html;`) and security headers (`X-Frame-Options`, `X-Content-Type-Options`).
- **Current Blocker**: `frontend/package.json` is currently an empty placeholder pending frontend commit by Person 1.

---

## 💻 Local Container Execution

### Option A: Running with Docker Compose
```bash
# Navigate to infrastructure directory
cd infrastructure

# Build and start services locally
docker compose up --build

# Backend API: http://localhost:8000
# Frontend UI:  http://localhost:3000
```

### Option B: Building Backend Image Directly
```bash
# Build from repository root
cd Ojas
docker build -f infrastructure/docker/backend.Dockerfile -t ojas-api:v1 .

# Run container locally
docker run -p 8080:8080 -e PORT=8080 -e ENVIRONMENT=development ojas-api:v1

# Test container health endpoint
curl http://localhost:8080/health
```

---

## 🗄️ Database Limitations & Persistence Strategy

### The Cloud Run Ephemerality Constraint
- **Cloud Run filesystem is stateless and ephemeral**.
- In-container SQLite (`/app/data/runtime/ojas.db`) resets whenever Cloud Run:
  1. Scales to zero instances during idle periods.
  2. Spawns new parallel instances to handle load.
  3. Re-deploys a revision.
- **Hackathon Demonstration Strategy**:
  - For the 48-hour NASA Space Apps demonstration, the container starts with SQLite pre-configured with 56 baseline synthetic astronaut records (`seed_database.py`), ensuring that judges immediately observe full dashboards and AI insights at **zero cloud infrastructure cost**.
- **Production Persistence Strategy**:
  - For permanent production workloads, configure `DATABASE_URL` to point to a managed PostgreSQL instance (Cloud SQL or external hosted PostgreSQL):
    ```
    DATABASE_URL="postgresql+psycopg2://user:password@host:5432/ojas"
    ```
  - The application automatically detects PostgreSQL, configures connection pooling (`pool_pre_ping=True`, `pool_size=5`), and initializes all tables on startup.

---

## 🚀 Google Cloud Run Prerequisites

Before deploying to Google Cloud project `project-4e2988e1-3bda-4b44-a3d` in `asia-south1`:

1. **Verify Enabled APIs**:
   ```bash
   gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com --project=project-4e2988e1-3bda-4b44-a3d
   ```
2. **Artifact Registry Repository**:
   Create a Docker repository in `asia-south1`:
   ```bash
   gcloud artifacts repositories create ojas-repo \
       --repository-format=docker \
       --location=asia-south1 \
       --description="Ojas Astronaut Platform Container Images" \
       --project=project-4e2988e1-3bda-4b44-a3d
   ```
3. **Cloud Build Submission (Alternative to Local Docker)**:
   If local Docker daemon is not active, build and push directly via Google Cloud Build:
   ```bash
   gcloud builds submit --config=cloudbuild.yaml --project=project-4e2988e1-3bda-4b44-a3d
   ```
