# Phase 11 — PostgreSQL Compatibility, Dialect Validation & Pooling

## 1. Overview & Dual-Database Architecture
Project Ojas is designed to operate seamlessly in both lightweight local developer environments (SQLite) and mission-critical production environments (PostgreSQL / Google Cloud SQL).

Phase 11 validates that:
1. All SQLAlchemy models from Phase 1 through Phase 11 compile valid PostgreSQL DDL without errors.
2. Dialect-sensitive column types (`JSON`, `JSONB`, `DateTime(timezone=True)`, `Boolean`, `BigInteger`) translate correctly across SQLite and PostgreSQL.
3. Connection pooling parameters (`pool_pre_ping=True`, `pool_size`, `max_overflow`, `pool_recycle`) are configured for connection drop resilience.

---

## 2. Model DDL Compilation & PostgreSQL Parity

The following 8 tables were validated against the PostgreSQL dialect compiler:

| Table Name | Phase Introduced | Key Column Types Validated in PostgreSQL |
| :--- | :--- | :--- |
| `astronauts` | Phase 1 | `VARCHAR(50)`, `INTEGER`, `TIMESTAMP` |
| `health_records` | Phase 1 | `FLOAT`, `BOOLEAN`, `TIMESTAMP WITH TIME ZONE` |
| `health_baselines` | Phase 2 | `FLOAT`, `TIMESTAMP WITH TIME ZONE` |
| `health_alerts` | Phase 2 | `VARCHAR(50)`, `TEXT`, `BOOLEAN`, `TIMESTAMP` |
| `analysis_results` | Phase 4 | `JSON`, `FLOAT`, `TIMESTAMP` |
| `telemetry_idempotency_records` | Phase 10 | `VARCHAR(64)` Unique Index, `BIGINT`, `TIMESTAMP` |
| `stream_session_states` | Phase 10 | `VARCHAR(64)` PK, `BIGINT`, `TIMESTAMP` |
| `alert_outbox_events` | Phase 10 & 11 | `JSON` (`delivery_receipt`, `retry_history`), `INTEGER` (`lease_version`), `BOOLEAN` (`is_escalated`) |

All models compile cleanly using `CreateTable(model.__table__).compile(dialect=postgresql.dialect())`.

---

## 3. Dialect Details & Cross-Engine Handling

### 3.1 JSON vs JSONB
- **PostgreSQL**: Stores alert receipts and attempt histories in native `JSON` / `JSONB` with indexing capabilities (`GIN` indexes on keys).
- **SQLite**: Stores JSON as text strings with transparent automatic Python serialization and deserialization via SQLAlchemy's `JSON` type.

### 3.2 Timezone-Aware Timestamps
- **PostgreSQL**: Natively stores timestamps with time zone offset (`TIMESTAMP WITH TIME ZONE`).
- **SQLite**: Stores timestamps as ISO strings or naive datetimes. To prevent subtle timezone drift bugs in SQLite, all timestamp fields in Ojas explicitly normalize using `.astimezone(timezone.utc)` prior to persistence and comparison.

### 3.3 Fencing Tokens & Optimistic Locking
The `lease_version` column in `alert_outbox_events` acts as a numerical fencing token. In PostgreSQL, this can be combined with `SELECT ... FOR UPDATE SKIP LOCKED` for concurrent multi-worker outbox processing.

---

## 4. Production Connection Pool Configuration
When deploying to PostgreSQL, connection drop resilience and stale connection recovery are handled by SQLAlchemy's `QueuePool`:

```python
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,      # Tests connection liveness before checking out from pool
    pool_size=10,             # Number of persistent database connections
    max_overflow=20,          # Maximum surge connections for burst telemetry traffic
    pool_recycle=1800,        # Recycles connections every 30 minutes to prevent timeouts
    pool_timeout=30           # Seconds to wait before raising ConnectionTimeout
)
```

### Resilience Benefits:
- **`pool_pre_ping=True`**: Prevents "server closed the connection unexpectedly" errors when connecting over cloud networks or intermittent space ground networks.
- **Failover Recovery**: If the database restarts or fails over to a replica, the pool automatically discards dropped connections and establishes fresh sockets on the next query.

---

## 5. Verification Test Suite
The PostgreSQL integration architecture is validated by `backend/tests/test_postgresql_validation_phase11.py`:
- `test_postgresql_ddl_compilation_all_models`: PASSED.
- `test_postgresql_json_type_and_indexes`: PASSED.
- `test_postgresql_timestamp_timezone_compatibility`: PASSED.
- `test_sqlite_to_postgresql_cross_dialect_type_parity`: PASSED.
- `test_database_connection_pool_configuration`: PASSED.
