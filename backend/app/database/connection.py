import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger("ojas.database")

# Configure database engine parameters
engine_kwargs = {"echo": False}

if settings.DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # Production PostgreSQL connection pool configuration
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_size"] = 5
    engine_kwargs["max_overflow"] = 10
    engine_kwargs["pool_recycle"] = 1800

engine = create_engine(
    settings.DATABASE_URL,
    **engine_kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency that provides a database session and ensures closure."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> tuple[bool, str]:
    """Verify live connectivity to the active database engine."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_type = "PostgreSQL" if "postgresql" in settings.DATABASE_URL else "SQLite"
        return True, f"{db_type} Connected"
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        return False, f"Disconnected: {str(e)}"


def init_db():
    """Create all tables in the database and seed baseline accounts."""
    # Import all models so that Base.metadata is fully populated
    from app.models import (
        astronaut,
        health_record,
        health_baseline,
        health_alert,
        analysis_result,
        telemetry_idempotency,
        alert_outbox,
        stream_session,
        user,
        mission,
        quest,
        achievement,
        wellness,
        audit_log,
    )
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")

    # Seed initial demonstration accounts and missions
    from app.services.seed_service import seed_initial_data
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()
