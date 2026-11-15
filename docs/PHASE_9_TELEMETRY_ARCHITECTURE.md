# OJAS Phase 9 — Telemetry Stream Architecture & Data Quality Gateway

## 1. Architectural Scope & Mission Objectives
Project **Ojas** provides an intelligent, explainable astronaut physiological monitoring platform designed for extended space exploration missions (e.g., Artemis lunar surface and Mars transit missions).

Phase 9 establishes the **Real-Time Telemetry Processing & Data Quality Gateway** layer located at `backend/app/telemetry/`. This layer ingests high-frequency, continuous, and burst biometric sensor packets from astronaut bioharnesses, habitat sensors, and EVA suits without corrupting baselines or triggering false alarms due to telemetry artifacts.

```
+-----------------------------------------------------------------------------------+
|                        DEEP SPACE / HABITAT TELEMETRY SOURCES                      |
|   (Bioharness v4, Crew HUD, Wearable PPG, Cabin Atmospheric & Sleep Monitors)    |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
                     +---------------------------------------+
                     |        TelemetryPacket (Schema)       |
                     |  • stream_id      • source_id         |
                     |  • sequence_num   • idempotency_key   |
                     |  • provenance     • UTC timestamp     |
                     +---------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                       DATA QUALITY GATEWAY (quality_gateway.py)                   |
|                                                                                   |
|  [Stage 1: Idempotency Check]                                                     |
|   ├── Duplicate Key? ──► Return Cached IngestionResult (Zero DB / AI overhead)    |
|                                                                                   |
|  [Stage 2: Temporal & Clock Validation]                                           |
|   ├── Offset/Naive Conversion ──► Strict UTC Normalization                        |
|   ├── Timestamp > Now + 2.0 hrs? ──► REJECT (Clock skew / future drift)           |
|   └── Timestamp < Now - 72.0 hrs? ──► Tag STALE_ACCEPTED (Stale telemetry penalty)|
|                                                                                   |
|  [Stage 3: Physiological Range & Consistency]                                     |
|   ├── Range Gate [Min, Max] (e.g., HR [30, 240], SpO2 [70, 100])                 |
|   ├── NaN / Inf / Zero-Imputation Check                                           |
|   └── Hemodynamic Sanity Gate: Diastolic BP >= Systolic BP? ──► REJECT            |
|                                                                                   |
|  [Stage 4: Stream Sequencing & Out-of-Order Check]                                |
|   ├── seq <= last_seen_seq? ──► OUT_OF_ORDER_ACCEPTED (Warning logged)            |
|   └── seq > last_seen_seq?  ──► ACCEPTED (Update highest sequence cache)          |
+-----------------------------------------------------------------------------------+
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
         [ACCEPTED / OUT_OF_ORDER]                       [REJECTED]
                    │                                         │
                    ▼                                         ▼
       Orchestration Pipeline                     Auditable Rejection Log
       (DB + Baseline + AI Inference)             (Zero DB pollution)
```

---

## 2. Telemetry Packet Schema & Scientific Provenance

Every incoming telemetry packet conforms strictly to the Pydantic v2 `TelemetryPacket` schema (`backend/app/telemetry/schemas.py`):

```python
class TelemetryPacket(BaseModel):
    stream_id: str
    source_id: str
    idempotency_key: str
    sequence_num: int
    provenance: TelemetryProvenance = TelemetryProvenance.SIMULATED_TELEMETRY
    astronaut_id: str
    timestamp: datetime
    heart_rate: float
    blood_oxygen: float
    systolic_bp: float
    diastolic_bp: float
    body_temperature: float
    sleep_duration: float
    sleep_quality: float
    stress_level: float
    fatigue_level: float
    mood: Optional[str] = "Nominal"
    physical_activity_minutes: Optional[float] = 0.0
    notes: Optional[str] = None
```

### Strict Scientific Data Provenance
In adherence to NASA scientific integrity requirements:
- Any simulated telemetry packet generated locally or via the test harness is explicitly tagged with `provenance: TelemetryProvenance.SIMULATED_TELEMETRY`.
- Research data from UTMB Bedrest Campaign 1 Actigraphy (BRSMAct) remains strictly segregated under `provenance: TelemetryProvenance.RESEARCH_DATASET`.
- Synthetic or simulated data is never intermingled with authentic NASA ground research records.

---

## 3. Data Quality Gateway Verification Stages

The singleton `DataQualityGateway` (`backend/app/telemetry/quality_gateway.py`) evaluates all incoming packets prior to any database write or algorithmic execution:

1. **Idempotency & Duplicate Suppression**:
   - Packets carry a cryptographically unique or UUID-tagged `idempotency_key`.
   - If an `idempotency_key` has already been processed, the gateway returns the cached `IngestionResult` immediately with `is_cached_response=True` and `status=PacketIngestionStatus.DUPLICATE`.
   - No secondary database record or duplicate alert event is ever created.

2. **Temporal Alignment & Normalization**:
   - All timestamps (naive or offset-aware) are normalized to UTC `timezone.utc`.
   - Future clock skew limit: Packets timestamped $>2.0\text{ hours}$ in the future are strictly rejected (`status=REJECTED`).
   - Stale telemetry detection: Packets older than $72.0\text{ hours}$ are tagged `STALE_ACCEPTED` with an age warning, applying an epistemic confidence penalty during uncertainty estimation.

3. **Physiological Validation & Hemodynamic Consistency**:
   - Each vital metric is checked against boundary constants in `VALID_PHYSIOLOGICAL_RANGES`:
     - Heart Rate: $[30, 240]\text{ bpm}$
     - Blood Oxygen ($\text{SpO}_2$): $[70, 100]\%$
     - Systolic Blood Pressure: $[60, 260]\text{ mmHg}$
     - Diastolic Blood Pressure: $[40, 160]\text{ mmHg}$
     - Body Temperature: $[34.0, 42.0]^\circ\text{C}$
   - **Hemodynamic Consistency Gate**: Measurements where `diastolic_bp >= systolic_bp` represent physical impossibilities (e.g., loose blood pressure cuff or sensor inversion). Such packets are immediately rejected.
   - **Zero-Imputation Suppression**: Missing vital values are never filled with `0.0`. NaN or infinite values fail the gateway and are recorded in the structured rejection log.

4. **Sequence & Out-of-Order Tracking**:
   - Per-stream monotonic sequence tracking maintains the highest sequence number seen per `stream_id`.
   - Delayed or re-routed packets with `sequence_num <= last_seen_sequence` are accepted with status `OUT_OF_ORDER_ACCEPTED` and tagged with warning metadata, preventing out-of-order packets from corrupting temporal derivative baselines.

---

## 4. Rejection Audit Logging

Rejected packets are never discarded silently. The gateway maintains an in-memory structured rejection audit log accessible via `get_rejection_log()`:
- `timestamp`: UTC timestamp of rejection event.
- `stream_id`: Stream originating the invalid packet.
- `sequence_num`: Packet sequence index.
- `astronaut_id`: Target astronaut identifier.
- `idempotency_key`: Deduplication key.
- `rejection_reason`: Explicit diagnostic string detailing exact physiological or temporal boundary violations.
