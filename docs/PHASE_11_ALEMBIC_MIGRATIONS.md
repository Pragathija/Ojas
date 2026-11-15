# Phase 11 — Controlled Database Evolution & Alembic Migrations

## 1. Overview
In mission-critical software, database schema changes must be reversible, deterministic, and auditable. Project Ojas incorporates **Alembic** as its official schema migration framework.

Alembic configuration files:
- Configuration file: `backend/alembic.ini`
- Environment module: `backend/alembic/env.py`
- Version script directory: `backend/alembic/versions/`

---

## 2. Migration Lineage & Version Chain

The schema migration history is structured into three linear, reversible revision steps:

```
[base]
  │
  ▼
0001_initial_schema (rev: 0001_initial_schema)
  │  - astronauts
  │  - health_records
  │  - health_baselines
  │  - health_alerts
  │  - analysis_results
  │
  ▼
0002_phase10_resilience_schema (rev: 0002_phase10_resilience_schema)
  │  - telemetry_idempotency_records
  │  - stream_session_states
  │  - alert_outbox_events (initial outbox columns)
  │
  ▼
0003_phase11_operational_schema (rev: 0003_phase11_operational_schema)
  │  - alert_outbox_events.lease_version (Integer, default 1)
  │  - alert_outbox_events.retry_history (JSON)
  │  - alert_outbox_events.is_escalated (Boolean, default False)
  │  - alert_outbox_events.escalated_at (DateTime with timezone)
  │  - alert_outbox_events.escalation_reason (String 500)
  │
[head]
```

---

## 3. Reversibility & Upgrade/Downgrade Testing

All migration scripts provide complete, symmetrical `upgrade()` and `downgrade()` routines.

### Upgrade Path
```bash
python -m alembic upgrade head
```
Executes all pending migrations up to the latest revision.

### Downgrade Path
```bash
python -m alembic downgrade base
```
Rolls back all changes in reverse dependency order, cleanly removing tables and dropping added columns.

### Verification Cycle
During Phase 11 auditing, migrations were validated against a clean test database:
1. `alembic upgrade head`: Applied 0001 -> 0002 -> 0003 successfully.
2. `alembic downgrade base`: Reverted 0003 -> 0002 -> 0001 -> base cleanly.
3. `alembic upgrade head`: Re-applied all migrations to verify idempotent repeatability.
4. `alembic stamp head`: Stamped current production schema without data loss.

---

## 4. Migration Execution Commands (Production Reference)

To inspect current database revision:
```bash
python -m alembic current
```

To view migration history and description:
```bash
python -m alembic history --verbose
```

To generate a new auto-detected migration during future feature development:
```bash
python -m alembic revision --autogenerate -m "description_of_change"
```

> [!NOTE]
> On Windows environments with application control policies, always invoke Alembic via the virtual environment Python module (`python -m alembic <command>`) rather than invoking `alembic.exe` directly.
