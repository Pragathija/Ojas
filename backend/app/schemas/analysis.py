from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, ConfigDict


class AnalysisRunRequest(BaseModel):
    astronaut_id: str = Field(..., description="Unique astronaut identifier")
    reading_id: Optional[int] = Field(None, description="Specific reading ID to analyze (defaults to latest)")


class AnalysisInsightResponse(BaseModel):
    id: Optional[int] = None
    astronaut_id: str
    timestamp: datetime
    overall_status: str               # NORMAL, CAUTION, CRITICAL
    severity: str                     # NORMAL, CAUTION, CRITICAL
    detected_abnormalities: List[str] = []
    baseline_deviations: Dict[str, Any] = {}
    contributing_factors: List[str] = []
    recommended_actions: List[str] = []
    anomaly_score: Optional[float] = None
    reading_id: Optional[int] = None
    disclaimer: str = "Explainable automated monitoring insight based on deterministic space mission safety parameters."
    model_config = ConfigDict(from_attributes=True)
