# Phase 12 — End-to-End Scientific Data Provenance & Traceability

## 1. Overview & Provenance Standards
Project Ojas strictly adheres to NASA open science data traceability guidelines. Every observation processed by the backend carries immutable lineage markers linking it back to:
- Official NASA accession ID.
- Original acquired file name and SHA-256 hash.
- Specific biological sample and astronaut subject identifier.
- Pipeline processing version and timestamp.
- Explicit data context tagging.

---

## 2. Three-Tier Data Context Architecture

To eliminate the risk of synthetic data contamination or confusing retrospective research with live sensor streams, Ojas enforces **three disjoint data contexts**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PROJECT OJAS BACKEND                          │
├─────────────────────────┬─────────────────────────┬────────────────────┤
│    1. LIVE_TELEMETRY    │ 2. SIMULATED_TELEMETRY  │3. NASA_RESEARCH_DATA│
│                         │                         │                    │
│ • Wearable Sensor Stream│ • Synthetic Demo Stream │ • NASA OSDR        │
│ • Ed25519/HMAC Signed   │ • is_synthetic = True   │   (OSD-575/569)    │
│ • Rolling Baselines     │ • Test Harness Scenarios│ • NASA BRSMAct     │
│ • Physiological Alerts  │ • Isolated Astronaut ID │ • Retrospective    │
│ • Non-suppression rules │ • Separate Database DB  │ • Quarantined      │
└─────────────────────────┴─────────────────────────┴────────────────────┘
```

1. **`LIVE_TELEMETRY`**: Real-time incoming vitals packets verified via cryptographic signatures or source auth tokens. Feeds into active personalized rolling median/IQR baselines.
2. **`SIMULATED_TELEMETRY`**: Generator-produced sensor streams explicitly tagged with `is_synthetic = True` for offline training, adversarial stress testing, and demonstration.
3. **`NASA_RESEARCH_DATA`**: Authentic NASA biospecimen and spaceflight analog datasets (OSDR Inspiration4 OSD-575/569, BRSMAct bedrest actigraphy). Strictly quarantined in read-only research services; **never injected into live astronaut baselines**.

---

## 3. Provenance Descriptor Specification

Every processed observation returned by `OSDRDataLoader.load_harmonized_observations()` generates a cryptographic lineage record:
```json
{
  "sample_id": "C001_serum_L-3",
  "subject_id": "C001",
  "timepoint": "L-3",
  "phase": "PRE_FLIGHT_BASELINE",
  "data_context": "NASA_RESEARCH_DATA",
  "source_repository": "NASA Open Science Data Repository (OSDR)",
  "primary_accession": "OSD-575",
  "source_files": [
    "LSDS-8_Comprehensive_Metabolic_Panel_CMP_TRANSFORMED.csv",
    "LSDS-7_Complete_Blood_Count_CBC_TRANSFORMED.csv"
  ],
  "processing_version": "1.0.0",
  "transformation_pipeline": "OSDRDataLoader.load_harmonized_observations",
  "is_synthetic": false,
  "is_live_telemetry": false
}
```

---

## 4. Processing Manifest

The processing manifest [backend/data/nasa_original/osdr/manifests/processing_manifest.json](file:///c:/Users/Pragathija/Documents/Projects/NASA/Ojas/backend/data/nasa_original/osdr/manifests/processing_manifest.json) records:
- Pipeline generation timestamp.
- SHA-256 fingerprints of raw source files.
- Full provenance descriptors for all 28 harmonized observations.
- Scientific integrity guarantee flags ensuring synthetic data mixing is structurally prevented.
