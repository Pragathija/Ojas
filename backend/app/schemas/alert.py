from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class HealthAlertResponse(BaseModel):
    id: int
    astronaut_id: str
    timestamp: datetime
    severity: str
    category: str
    title: str
    description: str
    recommended_action: str
    is_acknowledged: bool
    acknowledged_at: Optional[datetime] = None
    acknowledged_by: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class HealthAlertAcknowledge(BaseModel):
    acknowledged_by: Optional[str] = Field("Astronaut / Mission Support", description="Identifier of the acknowledging user")
