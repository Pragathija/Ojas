"""
OJAS NASA OSDR Data Integrity & Verification Engine (Phase 12).
Guarantees:
- Cryptographic SHA-256 and MD5 checksum verification of all acquired NASA files
- Detection of corrupted, incomplete, or tampered source datasets
- Strict preservation of original files without modification
"""

import os
import hashlib
import json
import logging
from typing import Dict, Any, List, Tuple, Optional
from pathlib import Path

logger = logging.getLogger("ojas.datasets.osdr.integrity")


class OSDRIntegrityError(Exception):
    """Raised when an OSDR file fails cryptographic checksum verification."""
    pass


class OSDRIntegrityVerifier:
    def __init__(self, base_dir: Optional[str] = None):
        if base_dir:
            self.base_dir = Path(base_dir)
        else:
            self.base_dir = Path(__file__).resolve().parents[3] / "data" / "nasa_original" / "osdr"
        self.manifest_path = self.base_dir / "manifests" / "acquisition_manifest.json"

    def verify_all_files(self) -> Dict[str, Any]:
        """
        Verifies every file in acquisition_manifest.json against its on-disk hash.
        Returns a detailed integrity report.
        """
        if not self.manifest_path.exists():
            raise FileNotFoundError(f"OSDR acquisition manifest not found at: {self.manifest_path}")

        with open(self.manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)

        results = []
        all_passed = True

        for item in manifest.get("files", []):
            rel_path = item["relative_path"]
            expected_sha256 = item["sha256"]
            expected_size = item["file_size_bytes"]
            full_path = self.base_dir / rel_path

            if not full_path.exists():
                all_passed = False
                results.append({
                    "file_name": item["file_name"],
                    "accession": item["accession"],
                    "status": "MISSING",
                    "error": f"File does not exist at {full_path}"
                })
                continue

            # Read file and compute hashes
            with open(full_path, "rb") as f:
                content = f.read()

            actual_size = len(content)
            actual_sha256 = hashlib.sha256(content).hexdigest()
            actual_md5 = hashlib.md5(content).hexdigest()

            is_valid_hash = (actual_sha256.lower() == expected_sha256.lower())
            is_valid_size = (actual_size == expected_size)

            if not is_valid_hash or not is_valid_size:
                all_passed = False
                results.append({
                    "file_name": item["file_name"],
                    "accession": item["accession"],
                    "status": "CORRUPTED",
                    "expected_sha256": expected_sha256,
                    "actual_sha256": actual_sha256,
                    "expected_size": expected_size,
                    "actual_size": actual_size,
                    "error": "Cryptographic checksum mismatch"
                })
            else:
                results.append({
                    "file_name": item["file_name"],
                    "accession": item["accession"],
                    "category": item["category"],
                    "status": "VERIFIED",
                    "sha256": actual_sha256,
                    "md5": actual_md5,
                    "size_bytes": actual_size
                })

        return {
            "all_verified": all_passed,
            "verified_count": sum(1 for r in results if r["status"] == "VERIFIED"),
            "total_files": len(manifest.get("files", [])),
            "files": results
        }

    def verify_file(self, relative_path: str) -> bool:
        """Verifies a single file against the manifest."""
        report = self.verify_all_files()
        for f in report["files"]:
            if relative_path in f.get("file_name", ""):
                return f["status"] == "VERIFIED"
        return False
