# Ojas Biomedical & Spaceflight Research Integration

This directory maintains scientific references, dataset citations, and integration guidelines for external biomedical datasets used by **Project Ojas**.

---

## 🔬 Four-Tier Dataset Separation Policy

To preserve scientific rigor, Ojas enforces strict categorization across all ingested and processed data. Incompatible cohorts are never merged into combined distributions:

| Tier | Category Tag | Description | Representative Source |
|---|---|---|---|
| **Tier 1** | `REAL_RESEARCH` | Earth-based clinical or laboratory datasets from institutional repositories | PhysioNet BIDMC, MIT-BIH, Sleep-EDF, WESAD |
| **Tier 2** | `SPACEFLIGHT_ANALOG` | Real telemetry from NASA flight archives or ground-based analogs | NASA OSDR (OSD-379, OSD-546), HERA, HDTBR |
| **Tier 3** | `SIMULATED_TELEMETRY` | Deterministic synthetic events generated from spaceflight scenarios | Hypoxia simulations, suit leaks, EVA workload |
| **Tier 4** | `SYNTHETIC_DEMO` | Algorithmic mock data generated exclusively for frontend development | `scripts/seed_database.py` demo profiles |

---

## 📑 Dataset Directory Structure

```
backend/
├── data/
│   ├── sample/                     # Lightweight offline-accessible sample slices (bundled)
│   │   ├── nasa_osdr/              # OSD-379 / OSD-546 sample CSV
│   │   ├── physionet_bidmc/        # BIDMC numeric SpO2/HR/RR 1Hz CSV
│   │   ├── mit_bih/                # MIT-BIH beat annotation & HR summary CSV
│   │   ├── sleep_edf/              # Sleep-EDF 30-sec hypnogram epoch CSV
│   │   └── wesad/                  # WESAD multi-sensor stress condition CSV
│   ├── processed/                  # Normalized benchmark evaluation records
│   └── synthetic/                  # Controlled mission simulation scenario packets
├── research/
│   ├── nasa_sources.md             # Curated NASA OSDR study index with citations
│   └── README.md                   # This document
└── app/
    └── datasets/                   # Registry, loaders, and normalization pipeline
```

---

## ⚖️ Licensing & Redistribution Rules

1. **PhysioNet Datasets** (BIDMC, MIT-BIH, Sleep-EDF):
   - Licensed under **Open Data Commons Attribution License v1.0 (ODC-By 1.0)**.
   - Slices and derived features may be bundled with attribution.
2. **NASA OSDR**:
   - Public domain / U.S. Government Work.
   - Publicly accessible de-identified telemetry may be redistributed.
3. **WESAD**:
   - Distributed for non-commercial academic research.
   - Large raw pickle archives are kept out of Git. Test fixtures use synthetic fixtures adhering strictly to the exact column, unit, and sampling specifications of the original WESAD dataset.
