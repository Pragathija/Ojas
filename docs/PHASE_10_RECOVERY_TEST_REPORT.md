# OJAS Phase 10 — Fault Injection & Crash Recovery Test Report

## 1. Executive Summary
This report presents the verification results of the **Fault Injection & Crash Recovery Test Suite** for Project Ojas (`backend/tests/test_distributed_reliability_phase10.py`).

The objective is to prove that Ojas operates safely under deep-space communication dropouts, server process terminations, database contention, and telemetry packet re-transmissions.

---

## 2. Fault Injection Test Matrix

| Fault Scenario | Injected Condition | Expected System Behavior | Test Outcome |
| :--- | :--- | :--- | :--- |
| **Crash Before Commit** | Process terminates during packet ingestion before DB commit. | Database transaction rolls back cleanly. No orphaned or partial records. | **VERIFIED (PASS)** |
| **Crash After Commit (Pending Outbox)** | Process terminates after DB commit but before alert delivery. | Outbox row is persisted as `PENDING`. Recovery worker reboots, picks up event, and delivers it. | **VERIFIED (PASS)** |
| **Repeated Duplicate Retransmission** | Client resends identical packet multiple times after restart. | Database idempotency table absorbs duplicate; returns cached result; zero duplicate DB rows. | **VERIFIED (PASS)** |
| **Simulated Network Packet Drop** | Delivery adapter experiences deep-space communication drop. | Delivery state transitions to `FAILED`. Retry count increments. Exponential backoff scheduled. | **VERIFIED (PASS)** |
| **Retry Exhaustion** | 3 successive network dropouts during alert delivery. | Max retries reached (`retry_count == 3`). Delivery halts; event flagged for manual surgeon review. | **VERIFIED (PASS)** |
| **Concurrent Worker Collision** | Multiple recovery workers pick up pending outbox alerts. | Atomic lease locks (`locked_until`, `locked_by`) ensure only one worker claims and delivers each event. | **VERIFIED (PASS)** |
| **Device Counter Reset** | Bioharness reboots and resets sequence number to 0. | Sequence engine detects epoch reset, increments `total_resets_detected`, and continues nominal tracking. | **VERIFIED (PASS)** |
| **Sequence Gap (Missing Packets)** | Packets 2, 3, 4 dropped; packet 5 arrives after packet 1. | Sequence engine calculates gap size (3 packets), audits in `total_gaps_detected`, and processes packet 5. | **VERIFIED (PASS)** |
| **Late-Arriving Packet** | Delayed packet arrives 2 hours late. | Packet stored in historical records, but `latest_reading_timestamp` on stream session is guarded and preserved. | **VERIFIED (PASS)** |
| **Missing Telemetry (Sensor Gap)** | 8-hour telemetry gap. | System suppresses continuous rate-of-change ($dx/dt = \text{None}$) and drops confidence. Never assumes normal health. | **VERIFIED (PASS)** |
| **Unauthorized Clinical Sign-off** | Non-medical crew member attempts clinical medical clearance. | System strictly raises `ClinicalAuthorizationError`. Clinical sign-off requires Flight Surgeon. | **VERIFIED (PASS)** |
| **ML Worker Failure Outage** | Anomaly detection module crashes with memory bus fault. | Orchestrator catches error, sets `ml_operational_state = DEGRADED`. Critical hypoxia alert fires immediately. | **VERIFIED (PASS)** |

---

## 3. Detailed Failure Recovery Scenarios

### Scenario A: Application Termination After DB Commit
- **Simulation**: In `test_crash_recovery_after_commit`, a critical hypoxia packet is ingested with `auto_dispatch_alerts=False`, simulating application termination immediately following the database transaction commit.
- **Recovery Action**: A new process worker initializes and calls `default_alert_manager.recover_pending_outbox_events(p10_db, "recovery-agent-crash-restart")`.
- **Result**: The pending outbox event is retrieved, lease-locked, dispatched via the delivery adapter, and confirmed `DELIVERED` with `delivery_confirmed_at = UTC Now`. Zero alerts were lost.

### Scenario B: Multi-Worker Concurrent Recovery Lease
- **Simulation**: In `test_concurrent_worker_outbox_recovery_and_leasing`, two asynchronous worker threads attempt to process pending outbox alerts simultaneously.
- **Recovery Action**: Worker 1 acquires an atomic lease (`locked_until = now + 60s`, `locked_by = "recovery-worker-alpha"`).
- **Result**: When Worker 2 queries for pending unassigned alerts, the database returns 0 records. Duplicate transmissions to Mission Control were completely prevented.

### Scenario C: Machine Learning Outage Non-Suppression
- **Simulation**: In `test_critical_alert_non_suppression_under_ml_outage`, `detect_multivariate_anomaly` is mocked to raise a catastrophic `RuntimeError("GPU OOM / Memory Bus Fault")`.
- **Safety Guarantee**: The pipeline catches the exception, updates `_model_governance["ml_operational_state"] = "DEGRADED"`, and evaluates deterministic clinical rules.
- **Result**: The severe hypoxia alert (`overall_status = "CRITICAL"`, `severity = "CRITICAL"`) is atomically committed to `AlertOutboxEvent` with `deduplication_policy = "IMMEDIATE_BYPASS"` and confirmed delivered to the flight console.
