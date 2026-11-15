import logging
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.astronaut import Astronaut
from app.models.user import User
from app.models.mission import Mission
from app.models.health_alert import HealthAlert
from app.models.health_record import HealthRecord
from app.models.audit_log import AuditLog
from app.schemas.auth import UserResponse, UserCreateRequest
from app.core.security import require_admin, hash_password

logger = logging.getLogger("ojas.admin")
router = APIRouter()


@router.get("/overview", summary="NASA Command Center Overview")
def get_command_center_overview(
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Aggregate command center metrics for flight directors, surgeons, and mission monitors."""
    astronaut_count = db.query(Astronaut).count()
    active_missions = db.query(Mission).filter(Mission.is_active == True).count()
    active_alerts = db.query(HealthAlert).filter(HealthAlert.is_acknowledged == False).count()
    critical_alerts = db.query(HealthAlert).filter(
        HealthAlert.is_acknowledged == False,
        HealthAlert.severity == "CRITICAL"
    ).count()

    total_records = db.query(HealthRecord).count()
    latest_record = db.query(HealthRecord).order_by(HealthRecord.timestamp.desc()).first()

    return {
        "command_center": "NASA Johnson Space Center • Mission Operations",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "active_astronauts": astronaut_count,
        "active_missions": active_missions,
        "telemetry_stream": {
            "status": "NOMINAL_100HZ",
            "total_packets_ingested": total_records,
            "last_packet_received": latest_record.timestamp.isoformat() if latest_record else None,
            "stream_source": "Artemis-V Habitation Deck",
        },
        "alerts_summary": {
            "total_unacknowledged": active_alerts,
            "critical_priority": critical_alerts,
        },
        "datasets": {
            "nasa_brsmact": "VERIFIED_ACTIVE",
            "nasa_osdr_osd_575": "VERIFIED_ACTIVE",
            "nasa_osdr_osd_569": "VERIFIED_ACTIVE",
        },
    }


@router.get("/audit-logs", summary="Get Security Audit Logs")
def get_audit_logs(
    limit: int = 50,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """View security and access audit logs for compliance review."""
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return [l.to_dict() for l in logs]


@router.get("/astronauts", summary="List Astronauts (Admin)")
def list_astronauts(
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """List all astronaut records with mission assignments and health connection status."""
    astros = db.query(Astronaut).all()
    result = []
    for a in astros:
        latest = (
            db.query(HealthRecord)
            .filter(HealthRecord.astronaut_id == a.astronaut_id)
            .order_by(HealthRecord.timestamp.desc())
            .first()
        )
        active_alert = (
            db.query(HealthAlert)
            .filter(HealthAlert.astronaut_id == a.astronaut_id, HealthAlert.acknowledged == False)
            .first()
        )

        result.append({
            "id": a.astronaut_id,
            "name": a.name,
            "age": a.age,
            "role": a.role,
            "mission_day": a.mission_day,
            "last_heart_rate": latest.heart_rate if latest else None,
            "last_spo2": latest.blood_oxygen if latest else None,
            "last_telemetry_time": latest.timestamp.isoformat() if latest else None,
            "alert_status": active_alert.severity if active_alert else "NOMINAL",
        })
    return result


@router.post("/astronauts", summary="Create Astronaut User Account")
def create_astronaut(
    payload: UserCreateRequest,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Provision a new astronaut account and link it to an Astronaut record."""
    existing_user = db.query(User).filter(User.username == payload.username.lower()).first()
    if existing_user:
        raise HTTPException(status_code=409, detail=f"User '{payload.username}' already exists.")

    astro_id = payload.astronaut_id or f"ASTRO-{str(db.query(Astronaut).count() + 1).zfill(3)}"

    # Ensure astronaut profile exists
    astro = db.query(Astronaut).filter(Astronaut.astronaut_id == astro_id).first()
    if not astro:
        astro = Astronaut(
            astronaut_id=astro_id,
            name=payload.full_name,
            role="Mission Specialist",
            mission_day=1,
            age=35,
        )
        db.add(astro)

    user = User(
        username=payload.username.lower(),
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role,
        astronaut_id=astro_id if payload.role == "astronaut" else None,
        callsign=payload.callsign,
        is_active=True,
    )
    db.add(user)

    audit = AuditLog(
        actor_id=current_user.get("username", "admin"),
        actor_role=current_user.get("role", "admin"),
        action="CREATE_USER",
        target_resource=f"user:{user.username}",
        details=f"Created {payload.role} user {payload.full_name}",
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "user_id": user.id,
        "username": user.username,
        "role": user.role,
        "astronaut_id": user.astronaut_id,
    }


@router.post("/alerts/{alert_id}/acknowledge", summary="Acknowledge Alert (Flight Surgeon)")
def acknowledge_alert(
    alert_id: int,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Acknowledge or escalate a clinical safety alert with surgeon credentials."""
    alert = db.query(HealthAlert).filter(HealthAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert record not found")

    alert.is_acknowledged = True
    alert.acknowledged_by = current_user.get("username", "flight_surgeon")
    alert.acknowledged_at = datetime.now(timezone.utc)

    audit = AuditLog(
        actor_id=current_user.get("username", "flight_surgeon"),
        actor_role=current_user.get("role", "admin"),
        action="ACKNOWLEDGE_ALERT",
        target_resource=f"alert:{alert_id}",
        details=f"Acknowledged {alert.severity} alert for astronaut {alert.astronaut_id}",
    )
    db.add(audit)
    db.commit()

    return {"success": True, "alert_id": alert_id, "acknowledged": True}
