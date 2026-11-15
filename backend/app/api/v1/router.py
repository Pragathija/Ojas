from fastapi import APIRouter
from app.api.v1.endpoints import health, analysis, alerts, nasa_research, nasa_osdr_research

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["Health Telemetry"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["AI Health Analysis"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Health Alerts"])
api_router.include_router(nasa_research.router, prefix="/research/nasa", tags=["NASA Analog Research"])
api_router.include_router(nasa_osdr_research.router, prefix="/research/osdr", tags=["NASA OSDR Spaceflight Research"])
