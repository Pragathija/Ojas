from typing import Optional
from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=64)
    password: str = Field(..., min_length=4, max_length=128)
    portal_type: str = Field(..., pattern="^(astronaut|admin)$")


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    role: str
    astronaut_id: Optional[str] = None
    callsign: Optional[str] = None
    is_active: bool


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class UserCreateRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=64)
    email: str = Field(..., min_length=5, max_length=128)
    password: str = Field(..., min_length=6, max_length=128)
    full_name: str = Field(..., min_length=2, max_length=128)
    role: str = Field(..., pattern="^(astronaut|nasa_super_admin|nasa_mission_admin|flight_surgeon|research_analyst|operations_monitor)$")
    astronaut_id: Optional[str] = None
    callsign: Optional[str] = None
