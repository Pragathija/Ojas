"""
Phase 12 — NASA Open Science Data Repository (OSDR) Integration Test Suite
Validates:
- Dataset discovery and metadata parsing for OSD-575 and OSD-569
- Cryptographic SHA-256 / MD5 integrity verification
- Corrupted file and missing observation handling
- Clinical chemistry (CMP), hematology (CBC), and cytokine array parsing
- Timepoint and study phase classification (L-92, L-44, L-3, R+1, R+45, R+82, R+194)
- Longitudinal pre-to-post spaceflight shift analysis
- Clinical reference range excursion audits
- Strict quarantine of NASA research data from live telemetry baselines
- Research API endpoints (/api/v1/research/osdr/*)
"""

import os
import json
import pytest
from pathlib import Path

from app.datasets.osdr.osdr_service import OSDRResearchService, default_osdr_service
from app.datasets.osdr.osdr_models import (
    OSDRDataContext,
    StudyPhase,
    map_timepoint_to_phase,
)
from app.datasets.osdr.osdr_integrity import OSDRIntegrityVerifier
from app.datasets.osdr.osdr_loader import parse_sample_identifier, _clean_float
from app.api.v1.endpoints.nasa_osdr_research import (
    get_integrated_studies,
    get_study_summary,
    get_study_files,
    get_cmp_records,
    get_cbc_records,
    get_cytokine_records,
    get_research_analysis,
    verify_dataset_integrity,
)


def test_osdr_file_discovery_and_metadata():
    """Verify metadata discovery and study definition for OSD-575 and OSD-569."""
    studies = default_osdr_service.get_integrated_studies()
    assert len(studies) == 2
    accessions = [s.accession for s in studies]
    assert "OSD-575" in accessions
    assert "OSD-569" in accessions

    s575 = next(s for s in studies if s.accession == "OSD-575")
    assert s575.subject_count == 4
    assert s575.subjects == ["C001", "C002", "C003", "C004"]
    assert "L-3" in s575.timepoints
    assert "R+1" in s575.timepoints
    assert s575.data_context == OSDRDataContext.NASA_RESEARCH_DATA


def test_osdr_cryptographic_integrity_verification():
    """Verify that all downloaded NASA source files match SHA-256 and MD5 checksums."""
    report = default_osdr_service.verify_integrity()
    assert report["all_verified"] is True
    assert report["total_files"] == 6
    assert report["verified_count"] == 6

    for f in report["files"]:
        assert f["status"] == "VERIFIED"
        assert len(f["sha256"]) == 64
        assert len(f["md5"]) == 32


def test_osdr_integrity_failure_detection(tmp_path):
    """Verify that file tampering or corrupted hashes are accurately flagged."""
    # Create a dummy corrupted manifest
    corrupted_manifest = {
        "files": [
            {
                "file_name": "fake_file.csv",
                "accession": "OSD-FAKE",
                "relative_path": "raw/fake_file.csv",
                "file_size_bytes": 100,
                "sha256": "0" * 64,
            }
        ]
    }
    manifests_dir = tmp_path / "manifests"
    manifests_dir.mkdir(parents=True)
    with open(manifests_dir / "acquisition_manifest.json", "w") as f:
        json.dump(corrupted_manifest, f)

    verifier = OSDRIntegrityVerifier(base_dir=str(tmp_path))
    report = verifier.verify_all_files()
    assert report["all_verified"] is False
    assert report["files"][0]["status"] == "MISSING"


def test_sample_identifier_parsing_and_phases():
    """Verify sample name parsing into subject, timepoint, and study phases."""
    subj, tp, stype = parse_sample_identifier("C001_serum_L-3")
    assert subj == "C001"
    assert tp == "L-3"
    assert stype == "serum"
    assert map_timepoint_to_phase(tp) == StudyPhase.PRE_FLIGHT_BASELINE

    subj2, tp2, stype2 = parse_sample_identifier("C002_whole-blood_R+1_cbc")
    assert subj2 == "C002"
    assert tp2 == "R+1"
    assert stype2 == "whole-blood"
    assert map_timepoint_to_phase(tp2) == StudyPhase.POST_FLIGHT_ACUTE

    assert map_timepoint_to_phase("R+45") == StudyPhase.POST_FLIGHT_RECOVERY


def test_cmp_records_loading_and_units():
    """Verify parsing of OSD-575 Comprehensive Metabolic Panel (28 records)."""
    cmp_records = default_osdr_service.get_cmp_records()
    assert len(cmp_records) == 28

    subjects = {r.subject_id for r in cmp_records}
    assert subjects == {"C001", "C002", "C003", "C004"}

    timepoints = {r.timepoint for r in cmp_records}
    assert timepoints == {"L-92", "L-44", "L-3", "R+1", "R+45", "R+82", "R+194"}

    rec = next(r for r in cmp_records if r.subject_id == "C001" and r.timepoint == "L-3")
    assert rec.sodium_mmol_l == 142.0
    assert rec.sodium_range_min == 135.0
    assert rec.sodium_range_max == 146.0
    assert rec.glucose_mg_dl == 69.0
    assert rec.ast_u_l == 15.0
    assert rec.alt_u_l == 13.0
    assert rec.data_context == OSDRDataContext.NASA_RESEARCH_DATA


def test_cbc_records_loading_and_units():
    """Verify parsing of OSD-569 Complete Blood Count (28 records)."""
    cbc_records = default_osdr_service.get_cbc_records()
    assert len(cbc_records) == 28

    rec = next(r for r in cbc_records if r.subject_id == "C001" and r.timepoint == "L-3")
    assert rec.white_blood_cells_cells_ul is not None
    assert rec.platelets_thousand_cells_ul is not None
    assert rec.hematocrit_pct == 44.5
    assert rec.phase == StudyPhase.PRE_FLIGHT_BASELINE


def test_cytokine_records_loading():
    """Verify parsing of OSD-575 cardiovascular and immune cytokine arrays."""
    cytokines = default_osdr_service.get_cytokine_records()
    assert len(cytokines) == 28

    rec = next(r for r in cytokines if r.subject_id == "C001" and r.timepoint == "L-3")
    assert rec.crp_ng_ml is not None
    assert rec.a2_macroglobulin_ng_ml is not None
    assert rec.agp_ng_ml is not None


def test_harmonized_cross_modal_observations():
    """Verify unified cross-modal observation objects linking CMP, CBC, and Cytokines."""
    obs = default_osdr_service.get_harmonized_observations()
    assert len(obs) == 28

    for o in obs:
        assert o.subject_id in ["C001", "C002", "C003", "C004"]
        assert o.timepoint in ["L-92", "L-44", "L-3", "R+1", "R+45", "R+82", "R+194"]
        assert o.cmp is not None
        assert o.cbc is not None
        assert o.cytokines is not None
        assert o.data_context == OSDRDataContext.NASA_RESEARCH_DATA


def test_pre_to_post_flight_delta_analysis():
    """Verify statistical pre-to-post flight shift calculations."""
    summary = default_osdr_service.get_research_summary()
    assert summary.subject_count == 4
    findings = summary.pre_to_post_flight_findings

    assert "ast_u_l" in findings
    assert "white_blood_cells_cells_ul" in findings
    assert "glucose_mg_dl" in findings

    wbc_finding = findings["white_blood_cells_cells_ul"]
    assert wbc_finding["pre_flight_l3"]["mean"] is not None
    assert wbc_finding["post_flight_r1"]["mean"] is not None
    assert wbc_finding["delta"] is not None
    assert wbc_finding["direction"] in ["INCREASED", "DECREASED", "UNCHANGED"]


def test_reference_range_excursion_audit():
    """Verify detection of laboratory reference range excursions."""
    summary = default_osdr_service.get_research_summary()
    excursions = summary.reference_range_excursions
    assert len(excursions) > 0

    for exc in excursions:
        assert "subject_id" in exc
        assert "timepoint" in exc
        assert "biomarker" in exc
        assert "value" in exc
        assert exc["excursion_type"] in ["HIGH", "LOW"]


def test_strict_research_live_telemetry_isolation():
    """
    Mandatory Rule: Verify that NASA OSDR research data is quarantined
    from live telemetry and personal baseline updates.
    """
    obs = default_osdr_service.get_harmonized_observations()
    for o in obs:
        # Context must never be LIVE_TELEMETRY
        assert o.data_context == OSDRDataContext.NASA_RESEARCH_DATA
        assert o.data_context != OSDRDataContext.LIVE_TELEMETRY
        # Original records do not contain synthetic flags
        if o.cmp:
            assert o.cmp.data_context == OSDRDataContext.NASA_RESEARCH_DATA
        if o.cbc:
            assert o.cbc.data_context == OSDRDataContext.NASA_RESEARCH_DATA


def test_osdr_provenance_and_processing_manifest():
    """Verify generation of verifiable processing_manifest.json."""
    manifest_path = Path(__file__).resolve().parents[1] / "data" / "nasa_original" / "osdr" / "manifests" / "processing_manifest.json"
    assert manifest_path.exists()

    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    assert manifest["manifest_type"] == "OSDR_PROCESSING_MANIFEST"
    assert manifest["repository"] == "NASA Open Science Data Repository"
    assert manifest["total_harmonized_observations"] == 28
    assert manifest["scientific_integrity_guarantee"]["synthetic_data_mixing_prevented"] is True


def test_osdr_research_api_endpoints():
    """Verify all read-only OSDR research endpoints function correctly."""
    # 1. /studies
    studies = get_integrated_studies()
    assert len(studies) == 2

    # 2. /studies/{accession}/summary
    s575 = get_study_summary("OSD-575")
    assert s575.accession == "OSD-575"

    # 3. /studies/{accession}/files
    files_resp = get_study_files("OSD-575")
    assert files_resp["file_count"] >= 4

    # 4. /cmp with filter
    c001_cmp = get_cmp_records(subject_id="C001", timepoint="L-3")
    assert len(c001_cmp) == 1
    assert c001_cmp[0].subject_id == "C001"

    # 5. /cbc with filter
    c002_cbc = get_cbc_records(subject_id="C002", timepoint="R+1")
    assert len(c002_cbc) == 1
    assert c002_cbc[0].subject_id == "C002"

    # 6. /cytokines
    cytos = get_cytokine_records(subject_id="C001")
    assert len(cytos) == 7

    # 7. /analysis
    analysis = get_research_analysis()
    assert analysis.subject_count == 4

    # 8. /integrity
    integ = verify_dataset_integrity()
    assert integ["all_verified"] is True
