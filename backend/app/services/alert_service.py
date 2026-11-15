from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.health_alert import HealthAlert


def get_alerts(
    db: Session,
    astronaut_id: Optional[str] = None,
    severity: Optional[str] = None,
    is_acknowledged: Optional[bool] = None,
    limit: int = 50
) -> List[HealthAlert]:
    """Retrieve alerts with optional filtering by astronaut, severity, and status."""
    query = db.query(HealthAlert)
    if astronaut_id:
        query = query.filter(HealthAlert.astronaut_id == astronaut_id)
    if severity:
        query = query.filter(HealthAlert.severity == severity.upper())
    if is_acknowledged is not None:
        query = query.filter(HealthAlert.is_acknowledged == is_acknowledged)

    return query.order_by(HealthAlert.timestamp.desc()).limit(limit).all()


def acknowledge_alert(
    db: Session,
    alert_id: int,
    acknowledged_by: Optional[str] = None
) -> HealthAlert:
    """Acknowledge an active health alert."""
    alert = db.query(HealthAlert).filter(HealthAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert with ID {alert_id} not found.")

    alert.is_acknowledged = True
    alert.acknowledged_at = datetime.now(timezone.utc)
    alert.acknowledged_by = acknowledged_by or "Astronaut"

    db.commit()
    db.refresh(alert)
    return alert
