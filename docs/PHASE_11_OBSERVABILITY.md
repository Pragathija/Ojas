# Phase 11 — Observability, Structured Logging & Operational Metrics

## 1. Overview
Operational assurance in mission-control environments requires real-time observability into backend health, pipeline throughput, tail latency percentiles, error rates, and crew telemetry freshness.

Phase 11 implements:
1. **Structured JSON Logging** with correlation IDs and sensitive data redaction.
2. **Real-Time Operational Metrics Collector** tracking packets, latencies, delivery rates, and freshness.
3. **Crew Telemetry Freshness Tracking** categorizing sensor health into `REALTIME`, `DELAYED`, or `DISCONNECTED`.
4. **Three Multi-Tiered Health Probes** (`/health/liveness`, `/health/readiness`, `/health/metrics`).

---

## 2. Structured JSON Logging & Sensitive Data Masking

Standard text logs are difficult to parse in cloud logging tools (e.g., Google Cloud Logging, AWS CloudWatch, Datadog) and pose privacy and HIPAA/medical compliance risks if raw biometrics or secrets are emitted.

`StructuredJsonFormatter` (`backend/app/core/observability.py`) enforces:
- **Enrichment**: Injects `timestamp`, `level`, `logger`, `correlation_id`, `trace_id`, `event_id`, and `environment`.
- **Secret Redaction**: Automatically redacts JWT tokens, private keys, HMAC secrets, and credentials via regex masking:
  ```json
  "message": "Authenticated device with token [REDACTED_SECRET] and private_key=[REDACTED_SECRET]"
  ```
- **Biometric PII Redaction**: Keys matching `heart_rate`, `blood_oxygen`, `systolic_bp`, `body_temperature`, etc., in log data dictionaries are masked as `[REDACTED_SENSITIVE_DATA]`.

---

## 3. Operational Metrics Collector

`MetricsCollector` maintains in-memory rolling metrics without adding database query overhead:

| Metric Category | Metrics Collected | Operational Purpose |
| :--- | :--- | :--- |
| **Telemetry Ingestion** | Total packets, accepted, rejected, stale, duplicates, sequence gaps, resets | Detects packet drops, sensor hardware restarts, or telemetry corruption. |
| **Inference Latency** | Mean, Min, P50, P95, P99, Max (rolling 500-sample window) | Detects algorithmic latency spikes before they breach operational SLAs. |
| **Alert Lifecycle** | Total critical alerts, caution alerts, confirmed deliveries, failures, escalations | Ensures zero dropped alerts and monitors ground console delivery success rate. |
| **Telemetry Freshness** | Per-astronaut age in seconds and status (`REALTIME`, `DELAYED`, `DISCONNECTED`) | Alerts flight controllers if an astronaut's telemetry stream stalls. |

---

## 4. Telemetry Freshness Classification

The telemetry freshness engine tracks the timestamp of the latest verified telemetry packet per astronaut:

- **`REALTIME`** ($\text{age} < 60\text{ seconds}$): Nominal real-time streaming; sensors are active and transmitting.
- **`DELAYED` / `DEGRADED`** ($60\text{ s} \le \text{age} < 3600\text{ s}$): Delayed telemetry; intermittent communication or loss of signal (LOS).
- **`DISCONNECTED`** ($\text{age} \ge 3600\text{ seconds}$): Astronaut stream offline. Ground controllers alerted to loss of contact.

Missing telemetry is **never assumed normal**.

---

## 5. Health Probes Specification

### 5.1 Liveness Probe (`GET /health/liveness`)
- **Purpose**: Kubernetes / container runtime health check to detect process deadlocks or fatal crashes.
- **Response**: `200 OK`
```json
{
  "status": "alive",
  "timestamp": "2026-11-15T09:56:30.432775+00:00"
}
```

### 5.2 Readiness Probe (`GET /health/readiness`)
- **Purpose**: Traffic routing probe ensuring the service has an active DB connection and initialized AI models before receiving traffic.
- **Response**: `200 OK` if ready; `503 Service Unavailable` if database is down.
```json
{
  "status": "ready",
  "database": "connected",
  "database_connected": true,
  "database_detail": "Database connection verified successfully.",
  "models_initialized": true,
  "active_model_id": "ojas-isoforest",
  "active_model_version": "2.0.0",
  "timestamp": "2026-11-15T09:56:30.432775+00:00"
}
```

### 5.3 Operational Metrics Probe (`GET /health/metrics`)
- **Purpose**: Prometheus/Datadog scraping endpoint exposing aggregated operational telemetry.
- **Response**: `200 OK`
```json
{
  "system_uptime_seconds": 12450.5,
  "packets_ingested_total": 1540,
  "latency_p50_ms": 23.41,
  "latency_p95_ms": 69.06,
  "latency_p99_ms": 95.39,
  "alerts_escalated": 0,
  "telemetry_freshness": {
    "ASTRO-ALPHA": {
      "last_seen_utc": "2026-11-15T09:55:45+00:00",
      "age_seconds": 15.2,
      "status": "REALTIME",
      "is_active": true
    }
  }
}
```
