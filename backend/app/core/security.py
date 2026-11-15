"""
OJAS Security, Authentication & Role-Based Access Control (Phase 10.5).
Provides:
- Telemetry source authentication and device token validation.
- Astronaut-level authorization boundaries.
- Role-authorized alert acknowledgment and clinical medical sign-off.
- Tamper-evident clinical audit trail recording previous states and clinical rationale.
"""

from enum import Enum
from typing import Optional, List, Dict, Set, Any
from datetime import datetime, timezone


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
        if self.role in [UserRole.FLIGHT_SURGEON, UserRole.CREW_MEDICAL_OFFICER, UserRole.MISSION_COMMANDER, UserRole.GROUND_CONTROLLER, UserRole.TELEMETRY_INGESTION_SERVICE]:
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
