"""
OJAS NASA OSDR Data Acquisition Script (Phase 12)
Fetches authentic Inspiration4 datasets from NASA Open Science Data Repository (OSDR):
- OSD-575: Comprehensive Metabolic Panel (CMP) + Cardiovascular (HDCVD9) + Immune Cytokines
- OSD-569: Complete Blood Count (CBC)
- Official ISA-Tab study metadata archives
Generates a cryptographically verified acquisition manifest with SHA-256 and MD5 checksums.
"""

import os
import urllib.request
import hashlib
import json
from datetime import datetime, timezone

def acquire_osdr_data():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "nasa_original", "osdr"))
    for sub in ["raw", "metadata", "processed", "reports", "manifests"]:
        os.makedirs(os.path.join(base_dir, sub), exist_ok=True)

    files_to_acquire = [
        {
            "accession": "OSD-575",
            "file_name": "LSDS-8_Comprehensive_Metabolic_Panel_CMP_TRANSFORMED.csv",
            "category": "raw",
            "url": "https://osdr.nasa.gov/geode-py/ws/studies/OSD-575/download?source=datamanager&file=LSDS-8_Comprehensive_Metabolic_Panel_CMP_TRANSFORMED.csv",
            "description": "SpaceX Inspiration4 Blood Serum Comprehensive Metabolic Panel (Quest Diagnostics)"
        },
        {
            "accession": "OSD-575",
            "file_name": "LSDS-8_Multiplex_serum_cardiovascular_EvePanel_TRANSFORMED.csv",
            "category": "raw",
            "url": "https://osdr.nasa.gov/geode-py/ws/studies/OSD-575/download?source=datamanager&file=LSDS-8_Multiplex_serum_cardiovascular_EvePanel_TRANSFORMED.csv",
            "description": "SpaceX Inspiration4 Serum Cardiovascular Biomarkers (Eve Technologies HDCVD9)"
        },
        {
            "accession": "OSD-575",
            "file_name": "LSDS-8_Multiplex_serum_immune_EvePanel_TRANSFORMED.csv",
            "category": "raw",
            "url": "https://osdr.nasa.gov/geode-py/ws/studies/OSD-575/download?source=datamanager&file=LSDS-8_Multiplex_serum_immune_EvePanel_TRANSFORMED.csv",
            "description": "SpaceX Inspiration4 Serum Immune Cytokine Array (Eve Technologies)"
        },
        {
            "accession": "OSD-575",
            "file_name": "OSD-575_metadata_OSD-575-ISA.zip",
            "category": "metadata",
            "url": "https://osdr.nasa.gov/geode-py/ws/studies/OSD-575/download?source=datamanager&file=OSD-575_metadata_OSD-575-ISA.zip",
            "description": "OSD-575 Complete Study Metadata (ISA-Tab archive)"
        },
        {
            "accession": "OSD-569",
            "file_name": "LSDS-7_Complete_Blood_Count_CBC_TRANSFORMED.csv",
            "category": "raw",
            "url": "https://osdr.nasa.gov/geode-py/ws/studies/OSD-569/download?source=datamanager&file=LSDS-7_Complete_Blood_Count_CBC_TRANSFORMED.csv",
            "description": "SpaceX Inspiration4 Whole Blood Complete Blood Count (Quest Diagnostics)"
        },
        {
            "accession": "OSD-569",
            "file_name": "OSD-569_metadata_OSD-569-ISA.zip",
            "category": "metadata",
            "url": "https://osdr.nasa.gov/geode-py/ws/studies/OSD-569/download?source=datamanager&file=OSD-569_metadata_OSD-569-ISA.zip",
            "description": "OSD-569 Complete Study Metadata (ISA-Tab archive)"
        }
    ]

    manifest = {
        "manifest_version": "1.0.0",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "repository": "NASA Open Science Data Repository (OSDR)",
        "repository_url": "https://osdr.nasa.gov/",
        "mission": "SpaceX Inspiration4 (SOMA Atlas)",
        "studies": ["OSD-575", "OSD-569"],
        "files": []
    }

    print(f"[*] Starting NASA OSDR acquisition into: {base_dir}")

    for item in files_to_acquire:
        dest_path = os.path.join(base_dir, item["category"], item["file_name"])
        fname = item["file_name"]
        print(f"[*] Downloading {fname}...")
        req = urllib.request.Request(item["url"], headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            content = resp.read()
        with open(dest_path, "wb") as f:
            f.write(content)

        sha256 = hashlib.sha256(content).hexdigest()
        md5 = hashlib.md5(content).hexdigest()
        file_size = len(content)
        print(f"    Saved to {item['category']}/{fname} ({file_size} bytes, SHA-256: {sha256[:12]}...)")

        manifest["files"].append({
            "accession": item["accession"],
            "file_name": fname,
            "category": item["category"],
            "relative_path": f"{item['category']}/{fname}",
            "file_size_bytes": file_size,
            "sha256": sha256,
            "md5": md5,
            "source_url": item["url"],
            "acquired_at": datetime.now(timezone.utc).isoformat(),
            "description": item["description"]
        })

    manifest_path = os.path.join(base_dir, "manifests", "acquisition_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"[+] Acquisition complete! Manifest written to: {manifest_path}")
    return manifest

if __name__ == "__main__":
    acquire_osdr_data()
