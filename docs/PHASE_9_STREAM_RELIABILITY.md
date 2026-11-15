# OJAS Phase 9 — Stream Reliability, Alert Lifecycle & Data Isolation

## 1. Deep-Space Telemetry Reliability Challenges
Deep-space human spaceflight missions encounter communication delays (ranging from 1.3 seconds at the Moon to up to 24 minutes at Mars), temporary line-of-sight occultations behind celestial bodies, solar particle events, and deep-space network dropped packets. 

To withstand these operational conditions, Ojas Phase 9 implements explicit mechanisms for:
1. Stream interruption and recovery handling.
2. Suppression of false rate-of-change derivatives across extended telemetry blackouts.
3. Event-driven alert lifecycle management with receipt confirmations.
4. Total per-astronaut physiological data isolation.

---

## 2. Stream Interruption & Rate-of-Change Suppression

When communication drops out for hours and subsequently resumes, naive numerical differentiation ($dx/dt$) generates erroneous rate-of-change spikes:

$$\frac{\Delta \text{SpO}_2}{\Delta t} = \frac{98\% - 90\%}{6.0\text{ h}} = -1.33\%/\text{hour}$$

A 6-hour gap is not a continuous trajectory; during those 6 hours, the astronaut may have slept, exercised, or engaged in an EVA. Treating sparse observations across extended gaps as continuous slopes produces false alerts and inappropriate clinical interventions.

### The 4-Hour Observation Gap Guard
In `backend/app/ml/temporal_analysis.py`, `MAX_GAP_HOURS_FOR_CONTINUOUS_RATE = 4.0` governs continuous derivative estimation:

```python
if 0 < gap_hours <= MAX_GAP_HOURS_FOR_CONTINUOUS_RATE:
    delta_val = float(values[-1] - values[-2])
    rate_of_change = round(delta_val / gap_hours, 2)
else:
    # Gap exceeds allowable threshold: suppress false derivative
    rate_of_change = None
```

- When $\Delta t \le 4.0\text{ hours}$: Continuous rate-of-change derivatives ($\text{units/hour}$) are safely computed.
- When $\Delta t > 4.0\text{ hours}$: Continuous derivatives are suppressed (`rate_of_change = None`), and `observation_gap_hours` is explicitly recorded in the temporal assessment summary.

---

## 3. Event-Driven Alert Lifecycle & Delivery Receipts

Alerts generated in previous iterations were written directly to database tables. Phase 9 introduces a formal, event-driven alert management layer (`backend/app/telemetry/alert_events.py`) supporting confirmed end-to-end delivery:

```
[Risk Rule Evaluated]
         │
         ▼
[AlertEventManager.process_rule_evaluations()]
         ├── Severity == CRITICAL? ──► deduplication_policy = IMMEDIATE_BYPASS
         └── Severity == CAUTION?  ──► Check 30-min deduplication window
         │
         ▼
[AlertEvent Instantiated]
         └── delivery_state = PENDING
         │
         ▼
[dispatch_alert(delivery_adapter)]
         ├── Adapter confirms transmission? ──► delivery_state = DELIVERED
         │                                       delivery_confirmed_at = UTC Now
         │
         └── Network drop / adapter reject? ──► delivery_state = FAILED
                                                 retry_count += 1
                                                 failure_reason logged
         │
         ▼
[retry_failed_alerts(max_retries=3)]
         └── Re-attempt delivery of FAILED/PENDING alerts until acknowledged
```

### Key Safety Invariants:
1. **Never Assume Delivery**: An alert is NEVER marked `DELIVERED` simply because it was synthesized or enqueued. It remains in `PENDING` until an adapter (e.g., Mission Control console or Crew HUD WebSocket) explicitly acknowledges receipt.
2. **Immediate Critical Bypass**: `CRITICAL` alerts (e.g., acute hypoxia, cardiovascular collapse) immediately bypass the 30-minute deduplication window. Every single critical reading generates an active alert.
3. **Flight Surgeon Acknowledgment**: When a human physician or commander reviews an alert, `acknowledge_event(event_id, acknowledged_by)` records the officer's identity and timestamp.

---

## 4. Multi-Astronaut Data Isolation

In multi-crew exploration missions (e.g., 4 to 6 crew members), biometric metrics and baselines must remain strictly segregated. 

### Enforced Isolation Boundaries:
1. **Database Queries**: All historical record queries and baseline lookups strictly filter by `astronaut_id`:
   ```python
   historical_records = (
       db.query(HealthRecord)
       .filter(HealthRecord.astronaut_id == packet.astronaut_id)
       .filter(HealthRecord.timestamp <= norm_ts)
       .order_by(HealthRecord.timestamp.asc())
       .all()
   )
   ```
2. **Personalized Rolling Baselines**: Each astronaut's baseline is calculated exclusively from their own verified historical readings. An elevated heart rate during Astronaut A's EVA has zero mathematical impact on Astronaut B's resting heart rate baseline.
3. **Stream Sequencing**: Sequence caches in the `DataQualityGateway` are segregated by `stream_id` (`STREAM-{astronaut_id}-{profile}`), ensuring out-of-order packets on one crew member's stream do not impact another crew member's stream status.
4. **Verified by Test Suite**: `test_astronaut_data_isolation` validates concurrent streaming for `CREW-ALICE` and `CREW-BOB`, proving 100% data partition and zero cross-contamination.
