from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    missions,
    quests,
    wellness,
    ai,
    admin,
    health,
    analysis,
    alerts,
    nasa_research,
    nasa_osdr_research,
)

api_router = APIRouter()

# Phase 2 & 3: Authentication and Mission
api_router.include_router(auth.router, prefix="/auth", tags=["Dual Authentication Portals"])
api_router.include_router(missions.router, prefix="/missions", tags=["Missions & Spaceflight Trajectory"])

# Phase 3 & 4: Gamification & Quests
api_router.include_router(quests.router, prefix="/gamification", tags=["Astronaut Gamification & Quests"])

# Phase 4 & Mind Garden: Voluntary Mental Wellness & Private Journals
api_router.include_router(wellness.router, prefix="/wellness", tags=["Mind Garden & Behavioral Health"])

# Phase 7: Ojas AI Companion
api_router.include_router(ai.router, prefix="/ai", tags=["Ojas AI Companion"])

# Phase 8: NASA Administration Portal
api_router.include_router(admin.router, prefix="/admin", tags=["NASA Administration Command Center"])

# Existing Scientific & Telemetry Endpoints
api_router.include_router(health.router, prefix="/health", tags=["Health Telemetry"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["AI Health Analysis"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Health Alerts"])
api_router.include_router(nasa_research.router, prefix="/research/nasa", tags=["NASA Analog Research"])
api_router.include_router(nasa_osdr_research.router, prefix="/research/osdr", tags=["NASA OSDR Spaceflight Research"])
