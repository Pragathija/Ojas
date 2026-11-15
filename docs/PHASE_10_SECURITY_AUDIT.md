# OJAS Phase 10 — Security Audit & Role-Based Clinical Authorization

## 1. Security & Governance Review
In mission-critical astronaut health monitoring, clinical alerts directly inform decisions regarding Extravehicular Activity (EVA) aborts, oxygen supplementation, and spacecraft evacuation. 

Phase 10 implements strict authentication, boundary authorization, and credentialed clinical governance (`backend/app/core/security.py`).

---

## 2. Telemetry Source Authentication

Every biometric telemetry source (e.g., Bioharness v4, wrist wearables, habitat atmospheric monitors) must authenticate prior to ingestion:
- **Registered Device Inventory**: `SecurityService` maintains registered hardware identifiers and cryptographic API tokens.
- **Token Verification**: Ingestion requests must present valid source bearer tokens. Unregistered devices or invalid tokens raise `TelemetryAuthenticationError`.
- **Device-to-Astronaut Assignment**: Personal sensor equipment assigned to a specific crew member (e.g., Alice's bioharness) is restricted to streaming for that astronaut. Transmitting for an unauthorized crew member raises `AstronautAuthorizationError`.

---

## 3. Role-Based Access Control (RBAC) Matrix

The system defines six formal operational roles:

| Operational Role | Ingest Telemetry | View Crew Telemetry | Acknowledge Alert | Perform Clinical Sign-Off |
| :--- | :---: | :---: | :---: | :---: |
| **FLIGHT_SURGEON** | NO | YES (All Crew) | YES | **YES (Full Authority)** |
| **CREW_MEDICAL_OFFICER** | NO | YES (All Crew) | YES | **YES (Full Authority)** |
| **MISSION_COMMANDER** | NO | YES (All Crew) | YES | NO |
| **ASTRONAUT** | NO | YES (Self Only) | YES (Self Only) | NO |
| **GROUND_CONTROLLER** | NO | YES (All Crew) | NO | NO |
| **TELEMETRY_INGESTION_SERVICE**| **YES** | NO | NO | NO |

---

## 4. Role-Authorized Clinical Medical Sign-Off

### Critical Invariant:
A stored username or string identifier alone does **not** constitute medical sign-off.

The `SecurityService.authorize_clinical_signoff()` routine enforces:
1. **Medical Credential Check**: The principal must possess role `FLIGHT_SURGEON` or `CREW_MEDICAL_OFFICER`. Attempts by an astronaut or mission commander to clinically clear an alert are rejected with `ClinicalAuthorizationError`.
2. **Clinical Rationale Requirement**: Sign-off requires an explicit clinical diagnosis and explanation ($\ge 5$ characters). Empty or placeholder rationale is rejected.
3. **Clinical Disposition Requirement**: The medical officer must specify an approved patient disposition from `ClinicalDisposition`:
   - `CLEARED`: Astronaut fit for standard duty.
   - `CONTINUOUS_OBSERVATION`: Maintain high-frequency monitoring.
   - `REST_AND_HYDRATE`: Prescribe rest and fluid intake.
   - `ADMINISTER_OXYGEN`: Deploy emergency cabin/suit $\text{O}_2$.
   - `RESTRICT_EVA`: Disqualify astronaut from scheduled spacewalks.
   - `GROUND_DUTY`: Restrict astronaut from physical operations.
   - `EMERGENCY_EVACUATION_STANDBY`: Alert Earth Return Vehicle (ERV) flight crew.

All sign-off events record `signed_off_by`, `clinical_role`, `clinical_signoff_at`, `clinical_rationale`, and `disposition` immutably in `AlertOutboxEvent`.
