# Project Ojas — Security & Privacy Audit Report

**Date**: November 15, 2026  
**Auditor**: Senior Application Security & Cloud DevOps Engineer  
**Scope**: Project Ojas Backend, Frontend, Docker Infrastructure, Research APIs, and Scientific Data Pipeline  
**Overall Security Status**: **PASSED (Zero High/Critical Vulnerabilities Identified)**  

---

## 1. Secrets & Credentials Management

### 1.1 Repository Scan
A recursive search across all tracked repository files confirmed:
- **No hardcoded API keys**, GCP service account credentials, database passwords, or private keys are committed.
- All secrets are resolved at runtime via environment variables managed through Pydantic Settings (`app.core.config.Settings`).
- `.env` files are strictly excluded from version control via `.gitignore`:
  ```gitignore
  .env
  .env.*
  !.env.example
  *.local
  ```
- `.dockerignore` enforces identical exclusion, preventing local `.env` files from leaking into Docker build contexts.

### 1.2 Configuration Defaults
- `.env.example` provides safe, non-sensitive local defaults (`ENVIRONMENT=development`, `DEBUG=True`, `DATABASE_URL=sqlite:///backend/ojas.db`).
- In production, missing database credentials trigger clean startup termination rather than insecure fallback.

---

## 2. CORS (Cross-Origin Resource Sharing) Security

### 2.1 Implementation Audit (`app/core/config.py`)
```python
@field_validator("CORS_ORIGINS")
@classmethod
def enforce_production_cors_security(cls, origins: List[str], info) -> List[str]:
    env = info.data.get("ENVIRONMENT", "development")
    debug = info.data.get("DEBUG", True)
    if env == "production" or not debug:
        filtered = [o for o in origins if o != "*"]
        if len(filtered) < len(origins):
            return filtered
    return origins
```

### 2.2 Security Findings
- **Wildcard Prohibition**: If a wildcard `*` origin is configured in production, the Pydantic validator automatically strips it out to prevent unauthorized cross-origin requests.
- **Explicit Whitelisting**: Standard allowed origins are explicitly defined:
  - `http://localhost:5173` (Vite dev server)
  - `http://localhost:3000` (Docker frontend host)
  - Production deployments require setting `CORS_ORIGINS` to the exact deployed frontend URL (e.g. `https://ojas-web.run.app`).

---

## 3. API Surface & Input Validation

### 3.1 Physiological Boundary Validation
- All live astronaut telemetry ingested via `POST /api/v1/health/reading` undergoes strict physiological boundary enforcement in `app/health_engine/validation.py`:
  - `heart_rate`: $20.0 \le HR \le 260.0\text{ BPM}$
  - `blood_oxygen`: $50.0 \le \text{SpO}_2 \le 100.0\%$
  - `systolic_bp`: $60.0 \le \text{Systolic} \le 260.0\text{ mmHg}$
  - `diastolic_bp`: $30.0 \le \text{Diastolic} \le 180.0\text{ mmHg}$
  - Relational check: Rejects readings if $\text{Diastolic} \ge \text{Systolic}$.
  - `body_temperature`: $30.0 \le \text{Temp} \le 45.0^\circ\text{C}$
- Invalid readings return structured HTTP 422 Unprocessable Entity responses with detailed validation errors without crashing the server.

### 3.2 SQL Injection Defense
- All database queries are executed via SQLAlchemy ORM model queries (`db.query(Model).filter(...)`).
- Zero raw SQL string interpolation or concatenation is used.
- Connection healthcheck probe uses parameterized `text("SELECT 1")`.

### 3.3 Denial-of-Service & Resource Exhaustion Defense
- Historical telemetry endpoints (`/health/readings`) enforce mandatory pagination (`limit` default 100, max bound).
- Scientific dataset loaders implement streaming generator chunking (`load_raw_chunks(chunksize=1000)`), preventing memory spikes on large datasets.

---

## 4. NASA Research Telemetry & Data Isolation

### 4.1 Read-Only Endpoint Immutability
- All eight NASA research endpoints under `/api/v1/research/nasa/*` are strictly bound to HTTP `GET`.
- Zero write, update, or delete operations are exposed on research routes.
- The underlying raw files in `backend/data/nasa_original/nlsp_actigraphy/raw/` are static and immutable.
- No dynamic filename parameter is accepted by the research API, eliminating arbitrary file disclosure or directory traversal (`../`) vulnerabilities.

### 4.2 Separation of Research and Live Telemetry
- Verified via automated end-to-end test `test_e2e_scientific_separation`:
  - Research participants (`C1G0001`, `C1G0002`, `C1G0003`) **never** enter the `astronauts` or `health_records` database tables.
  - Personal astronaut statistical baselines and alert generation engines only evaluate records associated with the active authenticated astronaut ID.

---

## 5. Human Subject Privacy & Ethical Compliance

### 5.1 De-identification
- The authentic NASA BRSMAct dataset utilizes anonymized subject identifiers (`C1G0001`, `C1G0002`, `C1G0003`).
- No personal identifying information (PII) such as subject names, dates of birth, medical record numbers, or social security numbers is contained in or exposed by the system.

### 5.2 Medication Data Aggregation
- Pharmacological sleep aids (Ambien, Diphenhydramine) are presented as observational clinical summaries.
- Individual medication events are not exposed through unrestricted public endpoints or coupled with real-time astronaut profiles.

---

## 6. Container & Runtime Hardening

### 6.1 Non-Root User Execution
- `infrastructure/docker/backend.Dockerfile` creates and runs under non-root system user `ojasuser:ojasgroup` (UID `10001`, GID `10001`), conforming to CIS container benchmark guidelines:
  ```dockerfile
  RUN groupadd -g 10001 ojasgroup && \
      useradd -u 10001 -g ojasgroup -s /bin/bash -m ojasuser
  USER 10001:10001
  ```
- Prevents container breakout privilege escalation to host root.

### 6.2 HTTP Security Headers (`nginx.conf`)
The frontend Nginx container enforces mandatory defense-in-depth security headers:
- `X-Frame-Options: DENY`: Mitigates clickjacking attacks.
- `X-Content-Type-Options: nosniff`: Prevents MIME-type sniffing.
- `X-XSS-Protection: 1; mode=block`: Activates browser cross-site scripting filters.
- `Referrer-Policy: strict-origin-when-cross-origin`: Restricts referrer leakage.

---

## 7. Security Audit Sign-off

| Security Domain | Standard | Result |
| :--- | :--- | :--- |
| **Secrets & Keys** | Zero hardcoded credentials in repo | **PASSED** |
| **CORS Policy** | Production wildcard forbidden; explicit origins | **PASSED** |
| **SQL Injection** | 100% SQLAlchemy ORM parameterized | **PASSED** |
| **Input Validation** | Physiological range enforcement on all vitals | **PASSED** |
| **Data Separation** | Analog research strictly isolated from live DB | **PASSED** |
| **Container User** | Non-root UID 10001 enforcement | **PASSED** |
| **HTTP Headers** | Security headers configured in Nginx | **PASSED** |
| **Automated Tests** | 49 backend + 3 frontend tests passing | **PASSED** |
