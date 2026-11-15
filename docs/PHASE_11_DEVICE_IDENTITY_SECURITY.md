# Phase 11 — Device Identity, Cryptographic Authentication & Security Architecture

## 1. Executive Summary & Integration Boundary
Phase 11 introduces hardware device identity abstraction and digital cryptographic signature verification for biometric telemetry streams ingesting into Project Ojas. 

> [!IMPORTANT]
> **Simulated Integration Disclaimer**: All cryptographic test keys, TPM/HSM abstractions, and device identities in this phase are software-simulated (`storage_class: "SIMULATED_SOFTWARE_KEY"`) for ground testing and NASA Space Apps demonstration. This implementation proves architectural readiness for real-world spaceflight hardware (e.g., NASA Bio-Harness, ISS crew telemetry adapters), but does not claim actual flight qualification or physical ISS connection.

---

## 2. Cryptographic Device Authentication Engine

### 2.1 Supported Cryptographic Algorithms
The device identity subsystem (`backend/app/core/device_identity.py`) supports two primary cryptographic authentication schemes:
1. **Asymmetric Digital Signatures (Ed25519)**:
   - High-throughput, elliptic-curve digital signature algorithm based on Curve25519.
   - Fixed 64-byte private key, 32-byte public key, and 64-byte signature.
   - Constant-time execution resistant to side-channel and timing attacks.
   - Recommended for high-assurance wearable bio-harnesses and space-suit biosensors.
2. **Symmetric Message Authentication Codes (HMAC-SHA256)**:
   - Pre-shared secret key hashing over the canonicalized packet payload.
   - Produces a 32-byte digest (64 hex characters).
   - Lightweight alternative suitable for low-power edge sensor microcontrollers.

### 2.2 Canonical Packet Serialization
To ensure deterministic digital signatures across heterogeneous sensor firmware and Python backends, telemetry payloads are canonicalized prior to hashing:
- Numerical fields rounded to 2 decimal places (`heart_rate`, `blood_oxygen`, `systolic_bp`, etc.).
- Timestamps strictly normalized to ISO-8601 UTC with explicit trailing zero offsets.
- Key ordering deterministically sorted via `json.dumps(payload_dict, sort_keys=True, separators=(",", ":"))`.
- Canonical digest computed via SHA-256 before asymmetric signing.

---

## 3. Threat Mitigation & Security Controls

| Threat Vector | Mitigation Strategy | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Telemetry Tampering / Man-in-the-Middle** | Cryptographic signature over SHA-256 canonical digest | Ed25519 / HMAC-SHA256 verification. Payload alteration causes immediate `TelemetryAuthenticationError`. |
| **Replay Attacks** | Timestamp freshness window & persistent idempotency | Packets with timestamp drift $> 300\text{ s}$ rejected with `ReplayAttackError`. Duplicate `idempotency_key` dropped at DB gateway. |
| **Unauthorized Astronaut Impersonation** | Device-to-Astronaut RBAC boundary fencing | Each registered device binds to authorized `assigned_astronaut_ids`. Transmissions for unauthorized crew raise `UnauthorizedDeviceError`. |
| **Key Compromise** | Emergency administrative device revocation | `revoke_device(device_id, reason)` marks state `REVOKED`. Subsequent packets immediately raise `DeviceRevokedError`. |
| **Key Retirement / Routine Maintenance** | Epoch-based key rotation | `rotate_key(device_id, new_key)` retires previous key, increments `key_rotation_epoch`, and enforces instant rollover. |

---

## 4. Hardware Security Module (HSM) / TPM Abstraction

The identity subsystem defines a clean interface (`KeyStoreInterface`) allowing zero-code-change drop-in replacement of the simulation backend with:
- **PKCS#11 hardware security modules**.
- **Trusted Platform Module (TPM 2.0)** chips embedded in spaceflight flight computers.
- **Microchip ATECC608A** cryptographic co-processors on wearable crew sensor bands.

In the current test harness, `SimulatedSoftwareKeyStore` provides in-memory key storage with full audit logging:
```python
mgr = DeviceIdentityManager()
pub_key_hex, priv_key_hex = SimulatedSoftwareKeyStore.generate_ed25519_keypair()
mgr.register_device(
    device_id="BIO-HARNESS-ED25519-01",
    assigned_astronaut_id="ASTRO-ALPHA",
    public_key_hex=pub_key_hex,
    algorithm=KeyAlgorithm.ED25519
)
```

---

## 5. Auditability & Verification Status
All authentication attempts (successes, rejections, revocations, and key rotations) append immutable structured records to the internal audit trail (`get_audit_log()`), ensuring full traceability for flight surgeons and ground safety controllers. 

All Phase 11 device identity security tests pass with 100% test coverage in `backend/tests/test_operational_assurance_phase11.py`.
