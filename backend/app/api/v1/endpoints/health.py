from typing import List, Optional, Annotated
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.schemas.health import (
    HealthReadingCreate,
    HealthReadingResponse,
    HealthReadingSummary
)
from app.services import health_service

router = APIRouter()


@router.post(
    "/readings",
    response_model=HealthReadingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit telemetry health reading",
    description="Receive, validate, store a new astronaut health reading, and trigger automated risk analysis."
)
def create_reading(
    reading_in: HealthReadingCreate,
    db: Session = Depends(get_db)
):
    return health_service.create_health_reading(db=db, reading_in=reading_in)


@router.get(
    "/readings",
    response_model=List[HealthReadingResponse],
    summary="List health telemetry history",
    description="Retrieve paginated historical health readings, optionally filtered by astronaut ID."
)
def get_readings(
    astronaut_id: Annotated[Optional[str], Query(description="Filter by astronaut ID")] = None,
    limit: Annotated[int, Query(ge=1, le=500, description="Max records to return")] = 50,
    offset: Annotated[int, Query(ge=0, description="Offset pagination")] = 0,
    db: Session = Depends(get_db)
):
    return health_service.get_health_readings(
        db=db,
        astronaut_id=astronaut_id,
        limit=limit,
        offset=offset
    )


@router.get(
    "/latest",
    response_model=HealthReadingResponse,
    summary="Get latest astronaut health reading",
    description="Retrieve the most recently recorded health reading for the specified astronaut."
)
def get_latest_reading(
    astronaut_id: Annotated[str, Query(description="Unique astronaut identifier (e.g. ASTRO-01)")],
    db: Session = Depends(get_db)
):
    reading = health_service.get_latest_health_reading(db=db, astronaut_id=astronaut_id)
    if not reading:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No health readings found for astronaut '{astronaut_id}'."
        )
    return reading


@router.get(
    "/summary",
    response_model=HealthReadingSummary,
    summary="Get astronaut health summary",
    description="Compute vital averages, latest status, and overall monitoring metrics."
)
def get_summary(
    astronaut_id: Annotated[str, Query(description="Unique astronaut identifier (e.g. ASTRO-01)")],
    db: Session = Depends(get_db)
):
    return health_service.get_health_summary(db=db, astronaut_id=astronaut_id)

