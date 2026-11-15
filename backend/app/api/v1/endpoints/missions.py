import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.mission import Mission
from app.models.audit_log import AuditLog
from app.schemas.mission import MissionCreateRequest, MissionResponse
from app.core.security import get_current_user, require_admin

logger = logging.getLogger("ojas.missions")
router = APIRouter()


@router.get("/current", response_model=MissionResponse, summary="Get Active Mission")
def get_current_mission(db: Session = Depends(get_db)):
    """Retrieve current operational spaceflight mission details for dashboard and astronaut universe."""
    mission = db.query(Mission).filter(Mission.is_active == True).order_by(Mission.created_at.desc()).first()
    if not mission:
        # Fallback default if none initialized
        mission = Mission(
            code="ARTEMIS-V",
            name="Artemis V - Gateway & Deep Space Transit",
            phase="Lunar Orbit Transit",
            day_number=42,
            total_days=180,
            status="Active",
            description="Deep space transit evaluating astronaut physiological baselines.",
            is_active=True,
        )
        db.add(mission)
        db.commit()
        db.refresh(mission)

    return MissionResponse(
        id=mission.id,
        code=mission.code,
        name=mission.name,
        phase=mission.phase,
        day_number=mission.day_number,
        total_days=mission.total_days,
        status=mission.status,
        description=mission.description,
        is_active=mission.is_active,
        created_at=mission.created_at.isoformat() if mission.created_at else "",
    )


@router.get("/", response_model=List[MissionResponse], summary="List All Missions (Admin)")
def list_missions(
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Retrieve list of all missions. Requires NASA Administration authorization."""
    missions = db.query(Mission).order_by(Mission.created_at.desc()).all()
    return [
        MissionResponse(
            id=m.id,
            code=m.code,
            name=m.name,
            phase=m.phase,
            day_number=m.day_number,
            total_days=m.total_days,
            status=m.status,
            description=m.description,
            is_active=m.is_active,
            created_at=m.created_at.isoformat() if m.created_at else "",
        )
        for m in missions
    ]


@router.post("/", response_model=MissionResponse, status_code=status.HTTP_201_CREATED, summary="Create Mission (Admin)")
def create_mission(
    payload: MissionCreateRequest,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Create a new mission. Requires administrative permissions."""
    existing = db.query(Mission).filter(Mission.code == payload.code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Mission with code '{payload.code}' already exists.",
        )

    mission = Mission(
        code=payload.code,
        name=payload.name,
        phase=payload.phase,
        day_number=payload.day_number,
        total_days=payload.total_days,
        description=payload.description,
        is_active=True,
    )
    db.add(mission)

    # Log audit event
    audit = AuditLog(
        actor_id=current_user.get("username", "admin"),
        actor_role=current_user.get("role", "admin"),
        action="CREATE_MISSION",
        target_resource=f"mission:{payload.code}",
        details=f"Created mission {payload.name}",
    )
    db.add(audit)
    db.commit()
    db.refresh(mission)

    return MissionResponse(
        id=mission.id,
        code=mission.code,
        name=mission.name,
        phase=mission.phase,
        day_number=mission.day_number,
        total_days=mission.total_days,
        status=mission.status,
        description=mission.description,
        is_active=mission.is_active,
        created_at=mission.created_at.isoformat() if mission.created_at else "",
    )
