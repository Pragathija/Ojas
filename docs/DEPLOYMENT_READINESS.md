# Project Ojas — Google Cloud Deployment Readiness Specification

**Target Cloud Provider**: Google Cloud Platform (GCP)  
**Project ID**: `project-4e2988e1-3bda-4b44-a3d`  
**Deployment Region**: `asia-south1` (Mumbai)  
**Target Services**: Google Cloud Run (Serverless Containers) + Google Cloud SQL (PostgreSQL 15)  
**Container Registry**: Google Artifact Registry (`asia-south1-docker.pkg.dev`)  
**Deployment Policy**: **Pre-deployment audit only — zero cloud resources to be provisioned without user authorization**.

---

## 1. Cloud Architecture Overview

```
                      Internet / Astronaut Browser
                                   │
                                   ▼
                ┌──────────────────────────────────────┐
                │  Google Cloud Run: Frontend Service   │
                │     (Nginx Alpine - Static Web Host) │
                └──────────────────┬───────────────────┘
                                   │  API Requests (/api/v1/*)
                                   ▼
                ┌──────────────────────────────────────┐
                │   Google Cloud Run: Backend Service  │
                │     (FastAPI, Uvicorn, Non-root)     │
                └──────────────────┬───────────────────┘
                                   │  Unix Socket / Cloud SQL Connector
                                   ▼
                ┌──────────────────────────────────────┐
                │    Google Cloud SQL for PostgreSQL   │
                │ (Managed Persistent Astronaut DB)    │
                └──────────────────────────────────────┘
```

---

## 2. Container Readiness Review

### 2.1 Backend Container (`infrastructure/docker/backend.Dockerfile`)
- **Base Image**: `python:3.12-slim` (official Debian-based lightweight image).
- **Multi-Stage Architecture**:
  - *Stage 1 (Builder)*: Compiles C extensions (`libpq-dev`, `gcc`), installs dependencies into `/opt/venv`, and discards compiler tools.
  - *Stage 2 (Runtime)*: Minimal image containing only runtime shared libraries (`libpq5`, `curl`).
- **Security Compliance**:
  - Runs under dedicated unprivileged system user `ojasuser:ojasgroup` (UID `10001`, GID `10001`).
  - Read-only system binaries; writable directory restricted to `/app/data/runtime`.
- **Dynamic Cloud Run Configuration**:
  - Binds to dynamic `$PORT` environment variable: `uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}`.
- **Built-in Health Probe**:
  - `HEALTHCHECK --interval=30s --timeout=5s CMD curl -f http://localhost:${PORT:-8080}/health || exit 1`.
- **Data Bundling**:
  - Copies `app/`, `scripts/`, `data/sample/`, `data/nasa_original/`, and `data/processed/`.

### 2.2 Frontend Container (`infrastructure/docker/frontend.Dockerfile`)
- **Base Image**: `node:20-alpine` (builder) $\rightarrow$ `nginx:alpine` (runner).
- **Build Stage**:
  - Injects `VITE_API_BASE_URL` build argument.
  - Compiles production Vite assets to `/app/dist`.
- **Serving Stage**:
  - Nginx Alpine with custom `infrastructure/docker/nginx.conf`.
  - Enables SPA fallback routing (`try_files $uri $uri/ /index.html`).
  - Enforces HTTP security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`).
  - Gzip compression for static text/js/css.

### 2.3 Local Orchestration (`infrastructure/docker-compose.yml`)
- Provides local multi-container testing replicating the Cloud Run topology.
- Connects frontend on port 3000 to backend on port 8000 via bridged network `ojas-network`.
- Enforces healthy dependency: frontend container starts only after backend `/health` returns HTTP 200.

---

## 3. Critical Production Database Architecture

> [!CAUTION]
> ### SQLite Prohibition on Google Cloud Run
> **Do NOT use SQLite for persistent production data on Cloud Run.**
> - Cloud Run instances are ephemeral and stateless. Instances automatically scale up, scale to zero, and restart across physical worker nodes.
> - Any local file written inside the container (e.g. `/app/ojas.db`) is **destroyed** when an instance recycles or scales down.
> - Concurrent write requests across multiple auto-scaled Cloud Run containers will corrupt local SQLite database locks.

### Production Solution: Google Cloud SQL (PostgreSQL 15)
- For production, `DATABASE_URL` must point to a managed PostgreSQL instance:
  ```text
  DATABASE_URL=postgresql+psycopg2://ojas_user:SECURE_PASSWORD@/ojas_db?host=/cloudsql/project-4e2988e1-3bda-4b44-a3d:asia-south1:ojas-db-instance
  ```
- Ojas backend natively supports PostgreSQL via `psycopg2-binary` and connection pooling in `backend/app/database/connection.py`.
- Recommended tier: `db-custom-1-3840` or shared-core `db-f1-micro` for hackathon budget compliance.

---

## 4. Production Environment Variables Checklist

| Variable | Recommended Production Value | Purpose |
| :--- | :--- | :--- |
| `ENVIRONMENT` | `production` | Disables debug mode and Swagger/OpenAPI docs if desired |
| `DEBUG` | `False` | Disables verbose exception tracebacks |
| `PORT` | `8080` | Required port binding for Google Cloud Run |
| `DATABASE_URL` | `postgresql+psycopg2://...` | Managed Cloud SQL PostgreSQL connection URI |
| `CORS_ORIGINS` | `https://ojas-frontend-*.run.app` | Whitelisted production frontend origin (wildcard prohibited) |
| `MIN_READINGS_FOR_BASELINE` | `5` | Minimum readings required before calculating personal baselines |
| `MIN_READINGS_FOR_ML_ANOMALY` | `20` | Isolation Forest history threshold |
| `ALERT_DEDUPLICATION_WINDOW_MINUTES` | `30` | Alert deduplication window |

---

## 5. Deployment Blockers & Prerequisites

Before triggering deployment:

1. **User Authorization**: Explicit user approval is required to initiate deployment or provision cloud resources.
2. **Artifact Registry Repository**: An Artifact Registry Docker repository named `ojas-repo` must be created in `asia-south1`:
   ```bash
   gcloud artifacts repositories create ojas-repo \
     --repository-format=docker \
     --location=asia-south1 \
     --description="Ojas Docker Repository"
   ```
3. **Cloud SQL Instance**: A PostgreSQL 15 instance must be provisioned with user `ojas_user` and database `ojas_db`:
   ```bash
   gcloud sql instances create ojas-postgres \
     --database-version=POSTGRES_15 \
     --tier=db-f1-micro \
     --region=asia-south1
   ```
4. **Cloud Run Service Account**: Dedicated service account `ojas-backend-sa` with `Cloud SQL Client` role (`roles/cloudsql.client`).

---

## 6. Step-by-Step Production Deployment Runbook

Once prerequisites are met and user approval is granted:

### Step 1: Submit Cloud Build for Backend
```bash
gcloud builds submit \
  --project=project-4e2988e1-3bda-4b44-a3d \
  --config=cloudbuild.yaml \
  .
```

### Step 2: Deploy Backend Service to Cloud Run
```bash
gcloud run deploy ojas-api \
  --project=project-4e2988e1-3bda-4b44-a3d \
  --region=asia-south1 \
  --image=asia-south1-docker.pkg.dev/project-4e2988e1-3bda-4b44-a3d/ojas-repo/ojas-api:latest \
  --platform=managed \
  --allow-unauthenticated \
  --service-account=ojas-backend-sa@project-4e2988e1-3bda-4b44-a3d.iam.gserviceaccount.com \
  --add-cloudsql-instances=project-4e2988e1-3bda-4b44-a3d:asia-south1:ojas-postgres \
  --set-env-vars="ENVIRONMENT=production,DEBUG=False,DATABASE_URL=postgresql+psycopg2://ojas_user:PASSWORD@/ojas_db?host=/cloudsql/project-4e2988e1-3bda-4b44-a3d:asia-south1:ojas-postgres,CORS_ORIGINS=https://ojas-web.run.app" \
  --memory=1Gi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=3
```

### Step 3: Build & Deploy Frontend Service
```bash
# Build frontend with backend URL
BACKEND_URL=$(gcloud run services describe ojas-api --region=asia-south1 --format='value(status.url)')

docker build \
  -f infrastructure/docker/frontend.Dockerfile \
  --build-arg VITE_API_BASE_URL=$BACKEND_URL \
  -t asia-south1-docker.pkg.dev/project-4e2988e1-3bda-4b44-a3d/ojas-repo/ojas-frontend:latest \
  .

docker push asia-south1-docker.pkg.dev/project-4e2988e1-3bda-4b44-a3d/ojas-repo/ojas-frontend:latest

gcloud run deploy ojas-web \
  --project=project-4e2988e1-3bda-4b44-a3d \
  --region=asia-south1 \
  --image=asia-south1-docker.pkg.dev/project-4e2988e1-3bda-4b44-a3d/ojas-repo/ojas-frontend:latest \
  --platform=managed \
  --allow-unauthenticated \
  --memory=512Mi \
  --min-instances=0 \
  --max-instances=2
```
