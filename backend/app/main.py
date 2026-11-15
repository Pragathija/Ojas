import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Optional
from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.connection import init_db, check_db_connection
from app.api.v1.router import api_router

# Configure structured logging for Cloud Logging compatibility
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ojas.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    logger.info(f"Starting {settings.PROJECT_NAME} in '{settings.ENVIRONMENT}' environment")
    init_db()
    yield
    logger.info("Application shutdown completed.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Ojas Astronaut Health & Behavioral Monitoring Backend for Long-Duration Space Missions.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG or settings.ENVIRONMENT != "production" else "/docs",
    redoc_url="/redoc" if settings.DEBUG or settings.ENVIRONMENT != "production" else None
)

# Configure CORS for Frontend Integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Mount API v1
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get(
    "/health",
    tags=["System Status"],
    summary="Backend Health Check",
    description="Returns backend service readiness, timestamp, version, and database connectivity."
)
def health_check(response: Response = Response()):
    db_ok, db_msg = check_db_connection()
    if not db_ok:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "unhealthy",
            "service": "Ojas Backend & AI Engine",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "version": "1.0.0",
            "database": db_msg
        }

    return {
        "status": "healthy",
        "service": "Ojas Backend & AI Engine",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0",
        "database": db_msg
    }


@app.get(
    "/health/liveness",
    tags=["System Status"],
    summary="Process Liveness Probe",
    description="Returns HTTP 200 as long as the backend server process is alive."
)
def liveness_probe():
    return {
        "status": "alive",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.get(
    "/health/readiness",
    tags=["System Status"],
    summary="Service Readiness Probe",
    description="Validates database connectivity, active model registry, and telemetry gateway availability."
)
def readiness_probe(response: Response = Response()):
    from app.ml.model_registry import default_registry
    db_ok, db_msg = check_db_connection()
    active_model = default_registry.get_active_model()

    is_ready = db_ok
    if not is_ready:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return {
        "status": "ready" if is_ready else "not_ready",
        "database": "connected" if db_ok else "disconnected",
        "database_connected": db_ok,
        "database_detail": db_msg,
        "models_initialized": True,
        "active_model_id": active_model.model_id if active_model else "ojas-isoforest",
        "active_model_version": active_model.version if active_model else "2.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.get(
    "/health/metrics",
    tags=["System Status"],
    summary="Observability & Operational Metrics",
    description="Exposes structured telemetry ingestion rates, latency percentiles, and crew freshness."
)
def get_operational_metrics():
    from app.core.observability import default_metrics_collector
    return default_metrics_collector.get_metrics_snapshot()
