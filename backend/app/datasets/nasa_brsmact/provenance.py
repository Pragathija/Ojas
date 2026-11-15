"""
NASA BRSMAct Dataset Provenance and Integrity Verification.

Provides authoritative study metadata, source citations, licensing terms,
and SHA-256 integrity verification against acquisition_manifest.json.
"""

from dataclasses import dataclass
from enum import Enum
import hashlib
import json
from pathlib import Path
from typing import Dict, List, Any, Optional


class ProvenanceCategory(str, Enum):
    SPACEFLIGHT_ANALOG = "SPACEFLIGHT_ANALOG"


class PopulationCohort(str, Enum):
    ASTRONAUT_ANALOG = "ASTRONAUT_ANALOG"


@dataclass(frozen=True)
class BRSMActStudyMetadata:
    dataset_id: str = "nasa_brsmact"
    dataset_title: str = "UTMB Bedrest Campaign 1 Actigraphy"
    experiment_id: str = "BRSMAct"
    mission: str = "Campaign 1"
    catalog_key: str = "BRSMACT_Campaign_1_Actigraphy"
    catalog_id: str = "e26501eb-7d7a-5012-8c8e-c5bdb3eecaf6"
    host_portal: str = "NASA Life Sciences Portal (NLSP)"
    source_url: str = "https://nlsp.nasa.gov/search/data/details/e26501eb-7d7a-5012-8c8e-c5bdb3eecaf6?dataType=DATASETS"
    repository: str = "NASA Johnson Space Center Life Sciences Data Archive (LSDA)"
    license: str = "NASA Open Science Policy / U.S. Federal Government Public Domain"
    citation: str = (
        "NASA Life Sciences Data Archive (LSDA). Bed Rest Standard Measures: "
        "Actilight / Actigraphy (BRSMAct), UTMB Bedrest Campaign 1. "
        "National Aeronautics and Space Administration (NASA), 2004-2005. "
        "NLSP ID: e26501eb-7d7a-5012-8c8e-c5bdb3eecaf6."
    )
    study_facility: str = "Flight Analogs Research Unit (FARU), UTMB, Galveston, Texas"
    study_protocol: str = "60-day 6° Head-Down Tilt Bed Rest (HDTBR)"
    study_population: str = (
        "3 healthy adult human test subjects (C1G0001, C1G0002, C1G0003) "
        "screened using NASA astronaut-equivalent medical criteria."
    )
    study_phases: tuple = ("PRE_TEST", "IN_TEST", "POST_TEST")
    data_processing_level: str = "PROCESSED_SUMMARY"
    device_hardware: str = "Mini Mitter Actiwatch / Actilight"
    limitations_disclaimer: str = (
        "CRITICAL SCIENTIFIC DISCLAIMER: This dataset contains ground-based bed rest analog data "
        "from exactly 3 human subjects simulating microgravity fluid shifts and horizontal confinement. "
        "It does NOT contain in-flight spaceflight telemetry (e.g. ISS astronaut data) and does NOT "
        "contain raw second-by-second accelerometer streams or radiation exposure. "
        "It MUST NOT be used to train general astronaut diagnostic models or replace live telemetry baselines."
    )


METADATA = BRSMActStudyMetadata()


def compute_file_sha256(file_path: Path) -> str:
    """Calculate the SHA-256 hash of a file."""
    sha = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            sha.update(chunk)
    return sha.hexdigest()


def compute_file_md5(file_path: Path) -> str:
    """Calculate the MD5 hash of a file."""
    md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            md5.update(chunk)
    return md5.hexdigest()


def verify_dataset_integrity(
    manifest_path: Optional[Path] = None,
    raw_dir: Optional[Path] = None
) -> Dict[str, Any]:
    """
    Verify all raw files in raw_dir against the SHA-256 and MD5 hashes
    in acquisition_manifest.json. Returns a detailed verification result.
    """
    base_dir = Path(__file__).resolve().parents[3] / "data" / "nasa_original" / "nlsp_actigraphy"
    if manifest_path is None:
        manifest_path = base_dir / "acquisition_manifest.json"
    if raw_dir is None:
        raw_dir = base_dir / "raw"

    if not manifest_path.exists():
        raise FileNotFoundError(f"Manifest not found: {manifest_path}")
    if not raw_dir.exists():
        raise FileNotFoundError(f"Raw directory not found: {raw_dir}")

    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest_data = json.load(f)

    file_results = []
    all_passed = True

    for item in manifest_data.get("files", []):
        fname = item["file_name"]
        target = raw_dir / fname
        if not target.exists():
            file_results.append({
                "file_name": fname,
                "status": "MISSING",
                "sha256_match": False,
                "md5_match": False
            })
            all_passed = False
            continue

        actual_sha256 = compute_file_sha256(target)
        actual_md5 = compute_file_md5(target)
        actual_size = target.stat().st_size

        sha256_match = (actual_sha256.lower() == item["sha256"].lower())
        md5_match = (actual_md5.lower() == item["md5"].lower())
        size_match = (actual_size == item["size_bytes"])

        if not (sha256_match and md5_match and size_match):
            all_passed = False

        file_results.append({
            "file_name": fname,
            "status": "VERIFIED" if (sha256_match and md5_match and size_match) else "INTEGRITY_MISMATCH",
            "size_bytes": actual_size,
            "size_match": size_match,
            "sha256": actual_sha256,
            "sha256_match": sha256_match,
            "md5": actual_md5,
            "md5_match": md5_match
        })

    return {
        "dataset_id": METADATA.dataset_id,
        "experiment_id": METADATA.experiment_id,
        "manifest_path": str(manifest_path),
        "raw_dir": str(raw_dir),
        "all_files_verified": all_passed,
        "files_checked": len(file_results),
        "file_details": file_results,
        "provenance_category": ProvenanceCategory.SPACEFLIGHT_ANALOG.value,
        "population_cohort": PopulationCohort.ASTRONAUT_ANALOG.value,
    }
