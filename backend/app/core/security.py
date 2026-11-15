"""
OJAS Security, Authentication & Role-Based Access Control (Phases 10.5 - 13.0).
Provides:
- Telemetry source authentication and device token validation.
- Astronaut-level authorization boundaries and record isolation.
- Role-authorized alert acknowledgment and clinical medical sign-off.
- Tamper-evident clinical audit trail recording previous states and clinical rationale.
- Dual Portal authentication (Astronaut vs NASA Administration).
- Cryptographic password hashing and standard JWT verification.
"""

import os
import hmac
import hashlib
import base64
import json
import time
from enum import Enum
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Set, Any
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.config import settings

# Secret key for signing JWT tokens
JWT_SECRET = os.getenv("OJAS_JWT_SECRET", "ojas-super-secret-mission-key-2026-space-apps-defense")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

security_bearer = HTTPBearer(auto_error=False)


# =========================================================================
# 1. Telemetry & Clinical Roles and Errors (Phases 10-12 Compatibility)
# =========================================================================

class UserRole(str, Enum):
    FLIGHT_SURGEON = "FLIGHT_SURGEON"
    CREW_MEDICAL_OFFICER = "CREW_MEDICAL_OFFICER"
    MISSION_COMMANDER = "MISSION_COMMANDER"
    ASTRONAUT = "ASTRONAUT"
    GROUND_CONTROLLER = "GROUND_CONTROLLER"
    TELEMETRY_INGESTION_SERVICE = "TELEMETRY_INGESTION_SERVICE"


class ClinicalDisposition(str, Enum):
    CLEARED = "CLEARED"
    CONTINUOUS_OBSERVATION = "CONTINUOUS_OBSERVATION"
    REST_AND_HYDRATE = "REST_AND_HYDRATE"
    ADMINISTER_OXYGEN = "ADMINISTER_OXYGEN"
    RESTRICT_EVA = "RESTRICT_EVA"
    GROUND_DUTY = "GROUND_DUTY"
    EMERGENCY_EVACUATION_STANDBY = "EMERGENCY_EVACUATION_STANDBY"


class SecurityError(Exception):
    """Base class for authentication and authorization errors."""
    pass


class TelemetryAuthenticationError(SecurityError):
    """Raised when telemetry source credentials or tokens are invalid."""
    pass


class AstronautAuthorizationError(SecurityError):
    """Raised when a device or user is unauthorized to access or transmit for an astronaut."""
    pass


class ClinicalAuthorizationError(SecurityError):
    """Raised when an unauthorized user attempts to perform clinical medical sign-off."""
    pass


class Principal:
    """Represents an authenticated human user or system device."""
    def __init__(
        self,
        principal_id: str,
        role: UserRole,
        name: str,
        callsign: Optional[str] = None,
        medical_license: Optional[str] = None,
        assigned_astronaut_ids: Optional[List[str]] = None,
    ):
        self.principal_id = principal_id
        self.role = role
        self.name = name
        self.callsign = callsign
        self.medical_license = medical_license
        self.assigned_astronaut_ids: Set[str] = set(assigned_astronaut_ids or [])

    def can_access_astronaut(self, astronaut_id: str) -> bool:
        if self.role in [
            UserRole.FLIGHT_SURGEON,
            UserRole.CREW_MEDICAL_OFFICER,
            UserRole.MISSION_COMMANDER,
            UserRole.GROUND_CONTROLLER,
            UserRole.TELEMETRY_INGESTION_SERVICE
        ]:
            return True
        if self.role == UserRole.ASTRONAUT:
            return astronaut_id in self.assigned_astronaut_ids or self.principal_id == astronaut_id
        return False


class SecurityService:
    """Manages telemetry source authentication and role authorization."""

    def __init__(self):
        # Known registered telemetry devices: source_id -> {api_key, allowed_astronaut_ids}
        self._registered_devices: Dict[str, Dict[str, Any]] = {
            "bioharness_v4": {
                "token": "ojas-bio-token-secure-v4",
                "allowed_astronauts": {"*"},  # Universal habitat bioharness pool
            },
            "wearable_wrist": {
                "token": "ojas-wrist-token-secure",
                "allowed_astronauts": {"*"},
            },
            "simulator": {
                "token": "ojas-sim-token-dev",
                "allowed_astronauts": {"*"},
            },
            "astro_alice_personal_harness": {
                "token": "alice-device-key-991",
                "allowed_astronauts": {"CREW-ALICE"},
            },
            "astro_bob_personal_harness": {
                "token": "bob-device-key-442",
                "allowed_astronauts": {"CREW-BOB"},
            },
        }

    def register_device(self, source_id: str, token: str, allowed_astronauts: List[str]):
        self._registered_devices[source_id] = {
            "token": token,
            "allowed_astronauts": set(allowed_astronauts)
        }

    def authenticate_telemetry_source(
        self,
        source_id: str,
        auth_token: Optional[str],
        astronaut_id: str
    ) -> bool:
        """
        Authenticates a telemetry source device and verifies device-level astronaut assignment.
        """
        if not auth_token:
            raise TelemetryAuthenticationError(f"Missing telemetry authentication token for source '{source_id}'.")

        device = self._registered_devices.get(source_id)
        if not device:
            raise TelemetryAuthenticationError(f"Unregistered or rogue telemetry source '{source_id}'.")

        if device["token"] != auth_token:
            raise TelemetryAuthenticationError(f"Invalid authentication token for source '{source_id}'.")

        allowed = device["allowed_astronauts"]
        if "*" not in allowed and astronaut_id not in allowed:
            raise AstronautAuthorizationError(
                f"Source '{source_id}' is not authorized to stream telemetry for astronaut '{astronaut_id}'."
            )

        return True

    def authorize_alert_acknowledgment(self, principal: Principal, astronaut_id: str) -> bool:
        """
        Verifies that the principal has authority to mark an alert acknowledged.
        """
        if not principal.can_access_astronaut(astronaut_id):
            raise AstronautAuthorizationError(
                f"Principal '{principal.principal_id}' is unauthorized to acknowledge alerts for '{astronaut_id}'."
            )
        return True

    def authorize_clinical_signoff(
        self,
        principal: Principal,
        astronaut_id: str,
        rationale: Optional[str],
        disposition: Optional[str]
    ) -> bool:
        """
        Enforces strict clinical authorization:
        Only qualified FLIGHT_SURGEON or CREW_MEDICAL_OFFICER roles can perform clinical medical sign-off.
        Requires explicit clinical rationale and valid disposition.
        """
        if principal.role not in [UserRole.FLIGHT_SURGEON, UserRole.CREW_MEDICAL_OFFICER]:
            raise ClinicalAuthorizationError(
                f"Role '{principal.role.value}' is unauthorized for clinical medical sign-off. "
                "Clinical sign-off requires FLIGHT_SURGEON or CREW_MEDICAL_OFFICER."
            )

        if not rationale or len(rationale.strip()) < 5:
            raise ClinicalAuthorizationError("Clinical sign-off requires non-empty clinical justification rationale.")

        if not disposition:
            raise ClinicalAuthorizationError("Clinical sign-off requires specifying an approved patient disposition.")

        return True


default_security_service = SecurityService()


# =========================================================================
# 2. User Authentication, Passwords & JWT (Phase 13 Portals)
# =========================================================================

def hash_password(password: str) -> str:
    """Hash a password using PBKDF2-HMAC-SHA256 with a unique salt."""
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
    return f"{salt.hex()}${key.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the stored salt$key hash."""
    if not hashed_password or "$" not in hashed_password:
        return False
    try:
        salt_hex, key_hex = hashed_password.split("$", 1)
        salt = bytes.fromhex(salt_hex)
        expected_key = bytes.fromhex(key_hex)
        actual_key = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, 100_000)
        return hmac.compare_digest(expected_key, actual_key)
    except Exception:
        return False


def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _base64url_decode(data: str) -> bytes:
    padding = 4 - (len(data) % 4)
    if padding and padding != 4:
        data += "=" * padding
    return base64.urlsafe_b64decode(data.encode("utf-8"))


def create_access_token(payload: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a standard HS256 JWT access token."""
    header = {"alg": JWT_ALGORITHM, "typ": "JWT"}
    header_json = json.dumps(header, separators=(",", ":")).encode("utf-8")
    header_b64 = _base64url_encode(header_json)

    to_encode = payload.copy()
    now = int(time.time())
    if expires_delta:
        expire = now + int(expires_delta.total_seconds())
    else:
        expire = now + (ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    to_encode.update({"iat": now, "exp": expire})

    payload_json = json.dumps(to_encode, separators=(",", ":")).encode("utf-8")
    payload_b64 = _base64url_encode(payload_json)

    signature_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    signature = hmac.new(JWT_SECRET.encode("utf-8"), signature_input, hashlib.sha256).digest()
    signature_b64 = _base64url_encode(signature)

    return f"{header_b64}.{payload_b64}.{signature_b64}"


def decode_access_token(token: str) -> Dict[str, Any]:
    """Decode and cryptographically verify HS256 JWT access token."""
    parts = token.split(".")
    if len(parts) != 3:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token format",
            headers={"WWW-Authenticate": "Bearer"},
        )

    header_b64, payload_b64, signature_b64 = parts
    signature_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    expected_sig = hmac.new(JWT_SECRET.encode("utf-8"), signature_input, hashlib.sha256).digest()
    actual_sig = _base64url_decode(signature_b64)

    if not hmac.compare_digest(expected_sig, actual_sig):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token signature",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = json.loads(_base64url_decode(payload_b64).decode("utf-8"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    exp = payload.get("exp")
    if exp and int(time.time()) > exp:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


# Role Definitions
ASTRONAUT_ROLE = "astronaut"
ADMIN_ROLES = [
    "nasa_super_admin",
    "nasa_mission_admin",
    "flight_surgeon",
    "research_analyst",
    "operations_monitor",
]
ALL_ROLES = [ASTRONAUT_ROLE] + ADMIN_ROLES


def get_current_user_optional(
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
) -> Optional[Dict[str, Any]]:
    """Return user dict from bearer token if present and valid, otherwise None."""
    if not auth_header or not auth_header.credentials:
        return None
    try:
        return decode_access_token(auth_header.credentials)
    except HTTPException:
        return None


def get_current_user(
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
) -> Dict[str, Any]:
    """Strictly require a valid JWT token and return user claims."""
    if not auth_header or not auth_header.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in to proceed.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return decode_access_token(auth_header.credentials)


def require_role(allowed_roles: List[str]):
    """Dependency factory that verifies the authenticated user possesses one of the allowed roles."""
    def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_role = current_user.get("role")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {allowed_roles}. Your role: '{user_role}'.",
            )
        return current_user
    return role_checker


def require_astronaut(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Ensure current user is an astronaut."""
    if current_user.get("role") != ASTRONAUT_ROLE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Astronaut portal credentials required.",
        )
    return current_user


def require_admin(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Ensure current user has an authorized administrative role."""
    if current_user.get("role") not in ADMIN_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. NASA Administration credentials required.",
        )
    return current_user


def verify_astronaut_isolation(current_user: Dict[str, Any], target_astronaut_id: str) -> None:
    """Enforce strict isolation: an astronaut may only access their own records."""
    user_role = current_user.get("role")
    if user_role == ASTRONAUT_ROLE:
        user_astro_id = current_user.get("astronaut_id")
        if user_astro_id != target_astronaut_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You cannot view or modify another astronaut's personal records.",
            )
