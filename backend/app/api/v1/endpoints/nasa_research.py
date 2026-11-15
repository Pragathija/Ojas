"""
Dedicated Read-Only API Endpoints for NASA BRSMAct Analog Research.

Provides validated, structured access to NASA UTMB Bedrest Campaign 1
actigraphy research data, phase comparisons, longitudinal trajectories,
and medication audits with strict privacy and scientific boundary controls.
"""

from typing import Dict, List, Any
from fastapi import APIRouter, Depends, HTTPException, Query

from app.datasets.nasa_brsmact import (
    NasaBRSMActLoader,
    METADATA,
    verify_dataset_integrity,
    compare_phases,
    summarize_subjects,
    analyze_br_day_trajectory,
    audit_missing_observations,
    audit_medications,
    generate_research_report,
    PhaseSleepMetrics,
    SubjectSleepSummary,
    DayTrajectoryPoint,
    MissingDataReport,
    MedicationAudit,
    ResearchAnalysisReport,
)

router = APIRouter()


# Cached singleton loader instance for read-only query serving
_loader_instance: NasaBRSMActLoader | None = None


def get_brsmact_loader() -> NasaBRSMActLoader:
    global _loader_instance
    if _loader_instance is None:
        _loader_instance = NasaBRSMActLoader(verify_hashes=False)
    return _loader_instance


@router.get(
    "/metadata",
    summary="Get NASA BRSMAct Dataset Metadata and Provenance",
    description="Returns official NASA NLSP catalog metadata, citations, licensing, and ethical analog disclaimers."
)
def get_study_metadata() -> Dict[str, Any]:
    return {
        "dataset_id": METADATA.dataset_id,
        "dataset_title": METADATA.dataset_title,
        "experiment_id": METADATA.experiment_id,
        "mission": METADATA.mission,
        "catalog_key": METADATA.catalog_key,
        "catalog_id": METADATA.catalog_id,
        "host_portal": METADATA.host_portal,
        "source_url": METADATA.source_url,
        "repository": METADATA.repository,
        "license": METADATA.license,
        "citation": METADATA.citation,
        "study_facility": METADATA.study_facility,
        "study_protocol": METADATA.study_protocol,
        "study_population": METADATA.study_population,
        "sample_size_subjects": 3,
        "study_phases": list(METADATA.study_phases),
        "data_processing_level": METADATA.data_processing_level,
        "device_hardware": METADATA.device_hardware,
        "limitations_disclaimer": METADATA.limitations_disclaimer,
    }


@router.get(
    "/integrity",
    summary="Verify Cryptographic File Integrity",
    description="Validates raw NASA actigraphy files against SHA-256 and MD5 hashes in acquisition_manifest.json."
)
def get_integrity_status() -> Dict[str, Any]:
    try:
        return verify_dataset_integrity()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Integrity check failed: {str(e)}")


@router.get(
    "/overview",
    response_model=ResearchAnalysisReport,
    summary="Get Complete NASA BRSMAct Research Analysis Report",
    description="Returns executive analysis report compiling phase comparisons, trajectories, and medication impacts."
)
def get_research_overview(
    loader: NasaBRSMActLoader = Depends(get_brsmact_loader)
) -> ResearchAnalysisReport:
    records = loader.load_harmonized_dataset()
    return generate_research_report(records)


@router.get(
    "/phases",
    response_model=Dict[str, PhaseSleepMetrics],
    summary="Compare Experimental Study Phases",
    description="Returns sleep duration, latency, and efficiency statistics across PRE_TEST, IN_TEST, and POST_TEST."
)
def get_phase_comparison(
    loader: NasaBRSMActLoader = Depends(get_brsmact_loader)
) -> Dict[str, PhaseSleepMetrics]:
    records = loader.load_harmonized_dataset()
    return compare_phases(records)


@router.get(
    "/subjects",
    response_model=Dict[str, SubjectSleepSummary],
    summary="Get Subject-Level Longitudinal Summaries",
    description="Returns individual-level statistics for de-identified subjects C1G0001, C1G0002, and C1G0003."
)
def get_subject_summaries(
    loader: NasaBRSMActLoader = Depends(get_brsmact_loader)
) -> Dict[str, SubjectSleepSummary]:
    records = loader.load_harmonized_dataset()
    return summarize_subjects(records)


@router.get(
    "/trajectory",
    response_model=List[DayTrajectoryPoint],
    summary="Get Day-by-Day Bed Rest Trajectory",
    description="Returns cohort daily averages across experimental bed rest days for interactive time-series charts."
)
def get_trajectory(
    phase: str = Query(default="IN_TEST", description="Target study phase (default: IN_TEST)"),
    loader: NasaBRSMActLoader = Depends(get_brsmact_loader)
) -> List[DayTrajectoryPoint]:
    records = loader.load_harmonized_dataset()
    return analyze_br_day_trajectory(records, target_phase=phase)


@router.get(
    "/medications",
    response_model=MedicationAudit,
    summary="Get Pharmacological Sleep Aid Audit",
    description="Returns drug distribution counts and compares sleep metrics on sleep-aid vs non-sleep-aid nights."
)
def get_medication_audit(
    loader: NasaBRSMActLoader = Depends(get_brsmact_loader)
) -> MedicationAudit:
    records = loader.load_harmonized_dataset()
    return audit_medications(records)


@router.get(
    "/missing-data",
    response_model=MissingDataReport,
    summary="Get Missing Observations Audit",
    description="Returns breakdown of missing sensor observations per subject, phase, and calendar date."
)
def get_missing_data_audit(
    loader: NasaBRSMActLoader = Depends(get_brsmact_loader)
) -> MissingDataReport:
    records = loader.load_harmonized_dataset()
    return audit_missing_observations(records)
