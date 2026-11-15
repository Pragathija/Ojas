# OJAS Phase 10 — Distributed Reliability & Empirical Performance Report

## 1. Executive Summary & Benchmark Environment
This report presents the empirical performance benchmarks measured on the production-hardened **Ojas Distributed Telemetry & AI Pipeline** (`backend/scripts/run_phase10_benchmarks.py`).

All measurements represent actual, measured executions captured and recorded in `backend/scripts/phase10_benchmark_results.json`. In adherence to Phase 10 execution rules, each operational subsystem was measured separately to avoid conflating gateway validation rates with full AI inference.

### Hardware & Software Environment
- **Operating System**: Microsoft Windows 11 Enterprise (Build 10.0.26300)
- **Python Runtime**: Python 3.12.14 64-bit
- **Architecture**: AMD64 Family 25 Model 97 Stepping 2, AuthenticAMD
- **Database Engine**: In-memory SQLite with thread-safe `StaticPool` (PostgreSQL schema-ready)
- **External Services**: Simulated Mission Control Console Adapter (Zero unapproved cloud dependencies)
- **Benchmark Timestamp**: 2026-11-15T09:03:16 UTC
- **Total Suite Execution Time**: **7,612.2 ms**

---

## 2. Granular Empirical Performance Metrics

| Operational Component | Sample Size | Mean Latency | P50 Latency | P95 Latency | P99 Latency | Measured Throughput | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Data Quality Gateway** | 500 packets | **0.160 ms** | 0.155 ms | 0.193 ms | 0.247 ms | **6,214.6 pkts / s** | **PASS** |
| **2. Persistent DB Idempotency** | 150 checks | **0.496 ms** | 0.476 ms | 0.629 ms | 0.682 ms | **1,999.8 checks / s**| **PASS** |
| **3. Database Write (HealthRecord)**| 150 writes | **0.575 ms** | 0.543 ms | 0.686 ms | 0.719 ms | **1,731.7 writes / s**| **PASS** |
| **4. Deterministic Risk Rules** | 500 evals | **0.050 ms** | 0.049 ms | 0.054 ms | 0.075 ms | **18,747.9 evals / s**| **PASS** |
| **5. Full AI Orchestration** | 30 packets | **163.48 ms**| 21.55 ms | 444.85 ms | 450.66 ms | **6.1 pkts / s** | **PASS** |
| **6. Durable Outbox Alert Creation**| 100 alerts | **0.796 ms** | 0.672 ms | 0.882 ms | 0.968 ms | **1,249.1 alerts / s**| **PASS** |
| **7. Confirmed Delivery (Adapter ACK)**| 50 deliveries | **1.397 ms**| 1.140 ms | 1.650 ms | 5.243 ms | **712.8 deliveries / s**| **PASS** |
| **8. Concurrent Crew (6 Astronauts)**| 90 packets | **61.411 ms**| 17.897 ms | 330.06 ms | 760.63 ms | **59.5 pkts / s** | **PASS** |
| **9. Outbox Crash Recovery Replay** | 100 events | **1.511 ms** | 1.486 ms | — | — | **662.0 events / s** | **PASS** |

---

## 3. Reliability, Contention & Memory Profile

- **Persistent Duplicate Prevention Rate**: **100.0%** (150 duplicate packet re-transmissions checked against the database; 150 duplicates deflected).
- **Database Contention Errors**: **0 errors** across 6 concurrent expedition crew worker threads.
- **Memory Footprint**:
  - Current Active Allocation: **4.638 MB**
  - Peak Memory Utilization: **4.660 MB**
- **Recovery Wall Time**: **151.05 ms** to recover, lease-lock, dispatch, and confirm 100 pending outbox alerts after a simulated crash.

---

## 4. Architectural Analysis

```
+─────────────────────────────────────────────────────────────────────────────+
|                     BENCHMARK THROUGHPUT PROFILE SUMMARY                     |
+─────────────────────────────────────────────────────────────────────────────+
  Deterministic Rule Engine:           18,747.9 evals/sec (0.050 ms)
  Data Quality Gateway:                 6,214.6 pkts/sec  (0.160 ms)
  Persistent DB Idempotency:            1,999.8 checks/sec (0.496 ms)
  Database Writes:                      1,731.7 writes/sec (0.575 ms)
  Durable Outbox Alert Creation:        1,249.1 alerts/sec (0.796 ms)
  Confirmed Delivery (Receipt Verified):  712.8 deliveries/sec (1.397 ms)
  Outbox Crash Recovery:                  662.0 events/sec (1.511 ms)
  Concurrent Crew Streaming (6 Crew):      59.5 pkts/sec  (61.41 ms)
  Full End-to-End AI Orchestration:         6.1 pkts/sec  (163.48 ms, P50 21.55 ms)
+─────────────────────────────────────────────────────────────────────────────+
```

### Key Analytical Takeaways:
1. **Lightweight Rule & Gateway Processing**: In-memory rule evaluation and quality gateway validation execute in microsecond latency (0.050 ms to 0.160 ms), capable of sustaining thousands of sensor readings per second.
2. **Durable Persistence Overheads**: Persistent database writes and idempotency checks introduce modest sub-millisecond latencies (~0.5 ms), comfortably providing over 1,700 writes per second.
3. **AI Orchestration Characteristics**: The full AI pipeline (including rolling baseline calculation, temporal trajectory analysis, epistemic uncertainty Mahalanobis distance, and Isolation Forest v2) averages 163.48 ms (P50: 21.55 ms). Acute burst telemetry is shielded by the Data Quality Gateway.
4. **Negligible Memory Footprint**: The entire system operates under 4.7 MB of peak memory, well within the constraints of spacecraft edge computing environments.
