# Google Cloud Production Deployment Guide

**Project Ojas — NASA Space Apps Challenge 2026**

---

## 1. Cloud Architecture Overview

```
                           +----------------------------------------+
                           |          Internet / Astronauts         |
                           +----------------------------------------+
                                                |
                                      HTTPS (TLS Termination)
                                                v
                           +----------------------------------------+
                           |       Google Cloud Run (asia-south1)   |
                           |       Service: ojas-api                |
                           |       - 1 vCPU, 512 MiB RAM            |
                           |       - Min instances: 0               |
                           |       - Max instances: 2               |
                           |       - Non-root UID: 10001            |
                           +----------------------------------------+
                                                |
                         +----------------------+----------------------+
                         | (Default Demo)                              | (Managed Production)
                         v                                             v
              +--------------------+                        +--------------------+
              | Ephemeral SQLite   |                        | Cloud SQL Postgres |
              | Auto-seeded Demo   |                        | Permanent Storage  |
              | (Zero Cost)        |                        | (Optional Tier)    |
              +--------------------+                        +--------------------+
```

---

## 2. Environment Variables Specification

| Variable Name | Default Value | Production Recommended Value | Purpose |
|---|---|---|---|
| `PORT` | `8080` | `8080` (Auto-injected by Cloud Run) | Port on which the container listens |
| `ENVIRONMENT` | `development` | `production` | Enables production security constraints |
| `DEBUG` | `True` | `False` | Disables debug logs and detailed stack traces |
| `DATABASE_URL` | `sqlite:///./ojas.db` | `postgresql+psycopg2://...` or SQLite | Database connection URI |
| `CORS_ORIGINS` | `http://localhost:5173,...` | `https://ojas-frontend.web.app,...` | Whitelisted frontend origins |
| `MIN_READINGS_FOR_BASELINE` | `5` | `5` | Historical readings needed for personal baseline |
| `MIN_READINGS_FOR_ML_ANOMALY` | `20` | `20` | Samples required before Isolation Forest activates |
| `ALERT_DEDUPLICATION_WINDOW_MINUTES` | `30` | `30` | Sliding window for caution alert suppression |

---

## 3. Cost Optimization Policy (₹1,000 Monthly Budget)

1. **`min-instances=0`**:
   - The container scales down to 0 instances when no requests are being processed.
   - Cost when idle: **₹0.00**.
2. **`max-instances=2`**:
   - Caps concurrent scaling to prevent unexpected billing runaway.
3. **512 MiB Memory & 1 vCPU**:
   - Keeps resource allocation well inside Google Cloud's monthly Free Tier allowance (first 2 million requests/month and 360,000 GB-seconds memory are free).
4. **Monthly Cost Projection**:
   - Cloud Run: **₹0 to ₹50/month**.
   - Artifact Registry: **< ₹10/month**.
   - Cloud Build: **₹0/month** (within 120 free build-minutes/day).

---

## 4. Security Hardening Checklist

- [x] **Non-Root Execution**: Container runs as user `ojasuser` (UID 10001, GID 10001).
- [x] **No Secrets in Images**: `.dockerignore` excludes `.env`, `*.db`, `.git`, and private credentials.
- [x] **Production CORS Guard**: `app/core/config.py` explicitly strips wildcard `*` origins in production mode.
- [x] **Dependency Minimization**: Multi-stage build strips compilers (`gcc`, `build-essential`) from the final runtime image.
- [x] **Dynamic Port Compatibility**: Entrypoint responds to dynamic `$PORT` environment variable provided by Cloud Run.
- [x] **Database Probing**: `/health` endpoint performs live query check (`SELECT 1`) to report real database status.
