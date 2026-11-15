# OJAS Phase 10 — Durable Alert Event Processing & Transactional Outbox

## 1. Architectural Problem Statement
In real-time astronaut health monitoring, the loss of an alert during an application crash, network drop, or server reboot could compromise crew safety. Conversely, naive retry loops without distributed leasing risk triggering duplicate alarm storms in Mission Control or on crew heads-up displays (HUD).

Phase 10 implements a **Transactional Outbox Pattern** (`backend/app/models/alert_outbox.py` and `backend/app/telemetry/alert_events.py`) ensuring:
1. Alert events are committed atomically inside the same database transaction as the biometric health record.
2. Delivery status is never assumed; alerts transition to `DELIVERED` only upon receipt of an explicit acknowledgment receipt from a delivery adapter.
3. Pending or failed alerts survive application restarts and are retried with persistent exponential backoff.
4. Concurrent recovery workers utilize atomic leases (`locked_until`, `locked_by`) to prevent double delivery.

---

## 2. The Four Stages of the Alert Lifecycle

Ojas Phase 10 strictly separates the four distinct operational milestones of an alert:

```
[System Rule / ML Inference]
            │
            ▼
┌───────────────────────────────────────┐
│ 1. Alert Creation                     │
│    • Severity: CRITICAL or CAUTION    │
│    • Category: RESPIRATORY, COMPOUND  │
│    • Deduplication: IMMEDIATE_BYPASS  │
│      for CRITICAL                     │
│    • State: PENDING                   │
└───────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│ 2. Delivery Confirmation              │
│    • Adapter: Mission Control / HUD   │
│    • Confirmed ACK with Receipt ID    │
│    • State: DELIVERED                 │
│    • delivery_confirmed_at: UTC Now   │
└───────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│ 3. Human Acknowledgment               │
│    • Actor: Astronaut or Flight Surg. │
│    • Role: Verified Principal Role    │
│    • Action: Acknowledgment note      │
│    • is_acknowledged: True            │
└───────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│ 4. Clinical Medical Sign-Off          │
│    • Actor: FLIGHT_SURGEON or CMO     │
│    • Credentials: MD License Call-sign│
│    • Disposition: e.g. RESTRICT_EVA   │
│    • Rationale: Clinical diagnosis    │
│    • is_clinically_signed_off: True   │
└───────────────────────────────────────┘
```

---

## 3. Persistent Retry & Exponential Backoff

When a network drop or adapter timeout occurs:
1. The alert transitions to `delivery_state = "FAILED"`.
2. The retry counter increments (`retry_count += 1`).
3. An exponential backoff delay is computed:
   $$\text{backoff\_seconds} = \min(300, 2^{\text{retry\_count}})$$
   - Retry 1: 2 seconds
   - Retry 2: 4 seconds
   - Retry 3: 8 seconds
4. `next_retry_at` is set to $\text{now} + \text{backoff\_seconds}$.
5. If `retry_count >= max_retries` (default 3), the alert is flagged as exhausted for manual flight surgeon review.

---

## 4. Multi-Worker Lease Locking & Outbox Recovery

For multi-container or distributed worker environments:
- When a recovery worker executes `recover_pending_outbox_events(db, worker_id, lease_seconds=30)`:
  - It queries candidate rows where `delivery_state in ('PENDING', 'FAILED', 'RETRIED')`, `next_retry_at <= now`, and `locked_until < now`.
  - It atomically claims the rows by writing:
    ```sql
    UPDATE alert_outbox_events
    SET locked_until = :now + 30s,
        locked_by = :worker_id,
        delivery_state = 'RETRIED'
    WHERE id = :id;
    ```
  - Other workers cannot see or claim the locked rows.
  - The worker dispatches the alert and transitions the row to `DELIVERED` with `locked_until = NULL`.
