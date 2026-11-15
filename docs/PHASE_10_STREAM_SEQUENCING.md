# OJAS Phase 10 — Distributed Stream Sequencing & State Preservation

## 1. Overview & Operational Principles
Astronaut biometric telemetry flows across heterogeneous channels: local suit Bluetooth Low Energy (BLE) links, habitat Wi-Fi, lunar relay satellites, and NASA Deep Space Network (DSN) stations. Packet re-ordering, transmission dropouts, and hardware reboots are routine occurrences.

Phase 10 implements a dedicated **Distributed Stream Sequencing & Session State Engine** (`backend/app/models/stream_session.py` and `backend/app/telemetry/quality_gateway.py`).

---

## 2. Core Sequencing Invariants

### 1. Monotonic Sequence Progression & Gap Auditing
Every packet carries a `sequence_num` and `session_id`.
- When packet $N$ arrives and the previous highest sequence was $M$:
  - If $N == M + 1$: Nominal sequential packet.
  - If $N > M + 1$: Sequence gap detected. The missing count $N - M - 1$ is added to `total_gaps_detected` in `StreamSessionState`, and a warning is logged. The packet is processed as `ACCEPTED`.
  - If $N \le M$: Out-of-order packet detected. The packet is processed as `OUT_OF_ORDER_ACCEPTED`.

### 2. Device Counter & Session Resets
When a bioharness reboots, recharges, or power-cycles:
- The device initializes with a new `session_id` (or sequence resets to 0 while the previous sequence was high).
- The sequencing engine detects the reset:
  - Increments `total_resets_detected`.
  - Updates `session_id` to the new epoch.
  - Resets sequence progression without rejecting valid health data.

### 3. Guarding Latest-Reading State
A common flaw in distributed telemetry architectures is when a delayed, late-arriving packet with an older timestamp overwrites a dashboard's or cache's "current vitals" indicator.

**Ojas Invariant**:
- Late-arriving packets ($T_{\text{late}} < T_{\text{latest}}$) are accepted and inserted into `HealthRecord` historical tables for retrospective analysis.
- However, `StreamSessionState.latest_reading_timestamp` and `latest_record_id` are **strictly guarded**:
  ```python
  if stream_session.latest_reading_timestamp is None or norm_ts >= stream_session.latest_reading_timestamp:
      stream_session.latest_reading_timestamp = norm_ts
      stream_session.latest_record_id = record.id
  # If norm_ts < latest_reading_timestamp, the older timestamp is PRESERVED.
  ```

---

## 3. Stream Session Data Model

Table: `stream_session_states`
- `stream_id` (VARCHAR(100), UNIQUE, INDEX): Unique stream identifier.
- `source_id` (VARCHAR(100)): Hardware sensor source.
- `session_id` (VARCHAR(100)): Device boot session or epoch identifier.
- `astronaut_id` (VARCHAR(50), INDEX): Monitored astronaut.
- `highest_sequence_num` (INTEGER): Highest monotonic sequence received in the active session.
- `latest_reading_timestamp` (DATETIME WITH TIMEZONE): Guarded timestamp of the most recent physical observation.
- `latest_record_id` (INTEGER): Pointer to the latest `HealthRecord`.
- `total_packets_received` (INTEGER): Total valid packets ingested.
- `total_gaps_detected` (INTEGER): Cumulative missing packets across all gaps.
- `total_resets_detected` (INTEGER): Total device power-cycles or session epoch resets.
