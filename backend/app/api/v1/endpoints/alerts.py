from typing import List, Optional, Annotated
from fastapi import APIRouter, Depends, Query, Path, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.schemas.alert import HealthAlertResponse, HealthAlertAcknowledge
from app.services import alert_service

router = APIRouter()


@router.get(
    "",
    response_model=List[HealthAlertResponse],
    summary="List health alerts",
    description="Retrieve all generated health alerts with optional filters for astronaut, severity, and acknowledgement."
)
def get_alerts(
    astronaut_id: Annotated[Optional[str], Query(description="Filter by astronaut ID")] = None,
    severity: Annotated[Optional[str], Query(description="Filter by severity (NORMAL, CAUTION, CRITICAL)")] = None,
    is_acknowledged: Annotated[Optional[bool], Query(description="Filter by acknowledgement status")] = None,
    limit: Annotated[int, Query(ge=1, le=200, description="Max alerts to retrieve")] = 50,
    db: Session = Depends(get_db)
):
    return alert_service.get_alerts(
        db=db,
        astronaut_id=astronaut_id,
        severity=severity,
        is_acknowledged=is_acknowledged,
        limit=limit
    )


@router.patch(
    "/{alert_id}/acknowledge",
    response_model=HealthAlertResponse,
    summary="Acknowledge alert",
    description="Mark a health alert as acknowledged by the astronaut or flight surgeon."
)
def acknowledge_alert(
    alert_id: Annotated[int, Path(ge=1, description="Unique ID of the alert to acknowledge")],
    payload: Optional[HealthAlertAcknowledge] = None,
    db: Session = Depends(get_db)
):
    acknowledged_by = payload.acknowledged_by if payload else "Astronaut"
    return alert_service.acknowledge_alert(
        db=db,
        alert_id=alert_id,
        acknowledged_by=acknowledged_by
    )

