# Ojas System Architecture & Health Engine Design

**NASA Space Apps Challenge 2026**

---

## 1. High-Level Architecture Diagram

```
+-------------------------------------------------------------+
|                      Ojas Frontend                          |
|             (React, Vite, TypeScript, Tailwind)             |
+-------------------------------------------------------------+
                              |
                     REST API (HTTP / JSON)
                              v
+-------------------------------------------------------------+
|                      Ojas Backend                           |
|                    (FastAPI, Uvicorn)                       |
+-------------------------------------------------------------+
     |                    |                      |
     v                    v                      v
+-----------+    +------------------+    +---------------+
| Telemetry |    | Explainable AI   |    | Alert Engine  |
| Ingestion |    | Health Engine    |    | (Deduplication|
| (Pydantic)|    |                  |    |  Escalation)  |
+-----------+    +------------------+    +---------------+
     |                    |                      |
     |           +--------+--------+             |
     |           |                 |             |
     |           v                 v             |
     |     +------------+   +---------------+    |
     |     | Baseline & |   | Isolation     |    |
     |     | Rule Logic |   | Forest (N>=20)|    |
     |     +------------+   +---------------+    |
     |           |                 |             |
     +-----------+--------+--------+-------------+
                          |
                          v
               +----------------------+
               | SQLite (SQLAlchemy)  |
               | (ojas.db, 5 Tables)  |
               +----------------------+
```

---

## 2. Multi-Tiered AI & Rule Architecture

### Tier 1: Physiological Boundary Validation
Before data hits the database, incoming telemetry is validated against human physiology bounds. Any physically impossible sensor values (e.g., negative heart rate, SpO₂ $> 100\%$, diastolic $\ge$ systolic blood pressure) are rejected with a 422 HTTP response detailing the invalid field.

### Tier 2: Dynamic Rolling Personal Baselines
Astronauts experience space adaptation syndrome, fluid shifts, and varying resting heart rates in microgravity. Ojas dynamically recalculates personal rolling baselines ($Mean$ and Standard Deviation $\sigma$) per astronaut for all 8 continuous parameters.

Deviations are scored using standard $Z$-scores:
$$Z = \frac{X_{\text{current}} - \mu_{\text{baseline}}}{\sigma_{\text{baseline}}}$$

### Tier 3: Explainable Risk Rules
Transparent compound risk indicators evaluate multi-metric interactions without black-box opacity:
1. **Cardiopulmonary Strain**: Low SpO₂ ($\le 93\%$) combined with elevated heart rate ($\ge 100\text{ BPM}$).
2. **Acute Hypoxemia**: SpO₂ $\le 90\%$ (Critical) or drop $\ge 3\%$ below personal baseline (Caution).
3. **Cardiovascular Ceilings**: Resting tachycardia ($> 120\text{ BPM}$) or hypertensive crisis ($> 160/100\text{ mmHg}$).
4. **Thermal Regulation**: Core temp spikes ($> 38.5^\circ\text{C}$).
5. **Neuro-Cognitive Fatigue**: Sleep duration $< 4.5\text{ hrs}$ + fatigue rating $\ge 9/10$.

### Tier 4: Supplementary Isolation Forest ($N \ge 20$)
When sufficient telemetry history is collected ($N \ge 20$), an unsupervised `IsolationForest` model evaluates high-dimensional multivariate vitals drift. If an outlier cluster is identified, an explainable alert is triggered for medical staff verification.

### Tier 5: Intelligent Alert Deduplication & Escalation
- `CAUTION` alerts within a 30-minute sliding window with identical criteria are suppressed to prevent crew alert fatigue.
- `CRITICAL` alerts are **never suppressed**, ensuring safety-critical anomalies immediately surface to the flight deck.
