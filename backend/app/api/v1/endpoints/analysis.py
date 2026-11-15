from typing import List, Annotated
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.schemas.analysis import AnalysisRunRequest, AnalysisInsightResponse
from app.services import analysis_service

router = APIRouter()


@router.post(
    "/run",
    response_model=AnalysisInsightResponse,
    status_code=status.HTTP_200_OK,
    summary="Run AI Health Analysis",
    description="Trigger an on-demand explainable health analysis against astronaut baseline and mission risk rules."
)
def run_analysis(
    request: AnalysisRunRequest,
    db: Session = Depends(get_db)
):
    try:
        return analysis_service.run_health_analysis(
            db=db,
            astronaut_id=request.astronaut_id,
            reading_id=request.reading_id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get(
    "/latest",
    response_model=AnalysisInsightResponse,
    summary="Get latest AI health insight",
    description="Retrieve the latest generated AI insight and recommendations for the astronaut."
)
def get_latest_analysis(
    astronaut_id: Annotated[str, Query(description="Unique astronaut identifier")],
    db: Session = Depends(get_db)
):
    result = analysis_service.get_latest_analysis(db=db, astronaut_id=astronaut_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No analysis results available for astronaut '{astronaut_id}'."
        )
    return result


@router.get(
    "/history",
    response_model=List[AnalysisInsightResponse],
    summary="Get historical AI health insights",
    description="Retrieve chronological log of AI health analysis findings for trending."
)
def get_analysis_history(
    astronaut_id: Annotated[str, Query(description="Unique astronaut identifier")],
    limit: Annotated[int, Query(ge=1, le=100, description="Max insights to retrieve")] = 20,
    db: Session = Depends(get_db)
):
    return analysis_service.get_analysis_history(
        db=db,
        astronaut_id=astronaut_id,
        limit=limit
    )

