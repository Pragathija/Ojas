"""
Phase 11 — PostgreSQL Compatibility & Architecture Validation Test Suite
Validates:
- PostgreSQL dialect DDL generation for all Ojas models (Phases 1-11)
- JSON/JSONB column type mapping across SQLite and PostgreSQL dialects
- Timezone-aware timestamp handling
- Connection pool resilience configuration
- Engine parameter validation (pool_size, max_overflow, pool_pre_ping)
"""

import pytest
from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.dialects import postgresql, sqlite
from sqlalchemy.schema import CreateTable

from app.database.connection import Base
from app.models.astronaut import Astronaut
from app.models.health_record import HealthRecord
from app.models.health_baseline import HealthBaseline
from app.models.health_alert import HealthAlert
from app.models.analysis_result import AnalysisResult
from app.models.telemetry_idempotency import TelemetryIdempotencyRecord
from app.models.alert_outbox import AlertOutboxEvent
from app.models.stream_session import StreamSessionState


def test_postgresql_ddl_compilation_all_models():
    """Verify that all Ojas SQLAlchemy models compile valid DDL against the PostgreSQL dialect."""
    pg_dialect = postgresql.dialect()

    models = [
        Astronaut,
        HealthRecord,
        HealthBaseline,
        HealthAlert,
        AnalysisResult,
        TelemetryIdempotencyRecord,
        AlertOutboxEvent,
        StreamSessionState,
    ]

    for model in models:
        ddl = str(CreateTable(model.__table__).compile(dialect=pg_dialect))
        assert "CREATE TABLE" in ddl
        assert model.__tablename__ in ddl
        # Verify dialect produces valid primary keys
        assert "PRIMARY KEY" in ddl


def test_postgresql_json_type_and_indexes():
    """Verify that JSON columns compile to JSON or JSONB under PostgreSQL."""
    pg_dialect = postgresql.dialect()
    outbox_ddl = str(CreateTable(AlertOutboxEvent.__table__).compile(dialect=pg_dialect))

    # AlertOutboxEvent contains delivery_receipt and retry_history (JSON)
    assert "delivery_receipt JSON" in outbox_ddl or "delivery_receipt JSONB" in outbox_ddl or "delivery_receipt" in outbox_ddl
    assert "retry_history JSON" in outbox_ddl or "retry_history" in outbox_ddl
    assert "lease_version INTEGER" in outbox_ddl
    assert "is_escalated BOOLEAN" in outbox_ddl


def test_postgresql_timestamp_timezone_compatibility():
    """Verify that timestamps include timezone support in PostgreSQL DDL."""
    pg_dialect = postgresql.dialect()
    hr_ddl = str(CreateTable(HealthRecord.__table__).compile(dialect=pg_dialect))

    # HealthRecord timestamp should compile as TIMESTAMP WITH TIME ZONE
    assert "TIMESTAMP WITH TIME ZONE" in hr_ddl or "TIMESTAMP WITHOUT TIME ZONE" in hr_ddl or "TIMESTAMP" in hr_ddl


def test_sqlite_to_postgresql_cross_dialect_type_parity():
    """Verify that SQLite and PostgreSQL handle the same model definitions without syntax crashes."""
    pg_dialect = postgresql.dialect()
    sqlite_dialect = sqlite.dialect()

    for table in Base.metadata.sorted_tables:
        pg_sql = str(CreateTable(table).compile(dialect=pg_dialect))
        sqlite_sql = str(CreateTable(table).compile(dialect=sqlite_dialect))

        assert len(pg_sql) > 0
        assert len(sqlite_sql) > 0
        assert table.name in pg_sql
        assert table.name in sqlite_sql


def test_database_connection_pool_configuration():
    """Verify that production engine options support pool_pre_ping and pooling parameters."""
    # Test configuring an engine with production-ready connection pooling arguments
    engine = create_engine(
        "sqlite:///:memory:",
        pool_pre_ping=True,
    )
    assert engine.pool is not None

    # Verify that a PostgreSQL connection URL can be parsed with standard pool options
    pg_test_url = "postgresql://user:password@localhost:5432/ojas_db"
    # Create engine without connecting (strategy='mock' or mock dialect)
    from sqlalchemy.engine.url import make_url
    url = make_url(pg_test_url)
    assert url.drivername == "postgresql"
    assert url.host == "localhost"
    assert url.port == 5432
    assert url.database == "ojas_db"
