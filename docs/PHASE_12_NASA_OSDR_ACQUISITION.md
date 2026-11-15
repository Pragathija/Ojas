# Phase 12 — NASA OSDR Dataset Acquisition & Cryptographic Manifest

## 1. Acquisition Summary
All source files for NASA OSDR studies `OSD-575` and `OSD-569` were acquired directly from the official NASA Open Science Data Repository file service via automated HTTPS retrieval. Original filenames, directory structures, and file contents have been preserved without modification.

Acquisition Root:
`backend/data/nasa_original/osdr/`
- `raw/`: Unaltered NASA CSV datasets
- `metadata/`: Original ISA-Tab study metadata ZIP archives
- `processed/`: Canonical harmonized research tables
- `reports/`: Scientific summary JSON reports
- `manifests/`: Machine-readable cryptographic acquisition and processing manifests

---

## 2. Acquired Source Files & Cryptographic Verification

| Accession | File Name | Category | Size (Bytes) | SHA-256 Checksum | MD5 Checksum |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **OSD-575** | `LSDS-8_Comprehensive_Metabolic_Panel_CMP_TRANSFORMED.csv` | `raw/` | 8,506 | `5eb1e7f025dd8443a9e70111e62bc32afae3432753024489c5c013e401d709d9` | `80aaff7db2c940d1cf810fa84324ef32` |
| **OSD-575** | `LSDS-8_Multiplex_serum_cardiovascular_EvePanel_TRANSFORMED.csv` | `raw/` | 6,207 | `fdba6c3ce45401c12ca9b699fa375303793959aa0391e2f3c722f354d9cfc75c` | `badd9896458887d4e0097f11acf67dc8` |
| **OSD-575** | `LSDS-8_Multiplex_serum_immune_EvePanel_TRANSFORMED.csv` | `raw/` | 41,214 | `efa8fb807e3b7e363df47f64f48d03c57d2397daf8fd22afc0ea4335d5d3d53e` | `b3d48356c9908542654130ebd7ac49d4` |
| **OSD-575** | `OSD-575_metadata_OSD-575-ISA.zip` | `metadata/` | 71,702 | `a1d3e49e2b61ab427a8760d0c98e0324a53272d0e1314632290266b014476f1d` | `5b29f50d6068120be2734f2a94357425` |
| **OSD-569** | `LSDS-7_Complete_Blood_Count_CBC_TRANSFORMED.csv` | `raw/` | 9,317 | `32e4f9c97d3b636b5d5c2e72dab8c4d3319dee64c437508b092dad04603b2b8f` | `06f3919e07b697119891ed0a777f8ee8` |
| **OSD-569** | `OSD-569_metadata_OSD-569-ISA.zip` | `metadata/` | 123,512 | `5b3c19c5079816b283125caf4009db8e39d48377d92763e9e61e86e3e1b4c159` | `b391305c6ea78a1d9dff78b6a73a5437` |

---

## 3. Acquisition Manifest Architecture

The machine-readable manifest is stored at [backend/data/nasa_original/osdr/manifests/acquisition_manifest.json](file:///c:/Users/Pragathija/Documents/Projects/NASA/Ojas/backend/data/nasa_original/osdr/manifests/acquisition_manifest.json):
```json
{
  "manifest_version": "1.0.0",
  "created_at": "2026-11-15T10:36:00.322593+00:00",
  "repository": "NASA Open Science Data Repository (OSDR)",
  "repository_url": "https://osdr.nasa.gov/",
  "mission": "SpaceX Inspiration4 (SOMA Atlas)",
  "studies": ["OSD-575", "OSD-569"],
  "files": [ ... ]
}
```

### Reproducible Verification
The integrity engine `OSDRIntegrityVerifier` reads this manifest and verifies the byte length, SHA-256 hash, and MD5 hash of every local file. If a file is tampered with or modified, verification fails immediately with `status: CORRUPTED`.
