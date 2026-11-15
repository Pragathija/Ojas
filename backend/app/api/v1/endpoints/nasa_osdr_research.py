"""
Dedicated Read-Only API Endpoints for NASA Open Science Data Repository (OSDR) Research.
Provides validated access to SpaceX Inspiration4 (SOMA Atlas) spaceflight multi-omics
and biospecimen clinical chemistry (OSD-575, OSD-569).
Maintains strict data context boundaries:
- Data context is explicitly labeled NASA_RESEARCH_DATA
- Isolated from real-time operational astronaut baselines
- Zero synthetic mixing
"""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException, Query

from app.datasets.osdr.osdr_service import default_osdr_service
from app.datasets.osdr.osdr_models import (
    OSDRStudyMetadata,
    CMPRecord,
    CBCRecord,
    CytokineRecord,
    OSDRResearchSummary,
    OSDRDataContext,
)

router = APIRouter()


@router.get(
    "/studies",
    response_model=List[OSDRStudyMetadata],
    summary="List Integrated NASA OSDR Spaceflight Studies",
    description="Returns metadata, citations, and experimental context for OSD-575 and OSD-569."
)
def get_integrated_studies():
    return default_osdr_service.get_integrated_studies()


@router.get(
    "/studies/{accession}/summary",
    summary="Get NASA OSDR Study Summary",
    description="Returns study metadata, mission details, publications, and timepoint definitions."
)
def get_study_summary(accession: str):
    accession_clean = accession.upper().strip()
    studies = default_osdr_service.get_integrated_studies()
    match = next((s for s in studies if s.accession == accession_clean), None)
    if not match:
        raise HTTPException(status_code=404, detail=f"NASA OSDR study '{accession}' not found in integrated catalog.")
    return match


@router.get(
    "/studies/{accession}/files",
    summary="List NASA OSDR Study Files",
    description="Lists accessible data files and original checksums for the specified study."
)
def get_study_files(accession: str):
    accession_clean = accession.upper().strip()
    files = default_osdr_service.client.get_study_files(accession_clean)
    if not files:
        raise HTTPException(status_code=404, detail=f"No files discovered for NASA OSDR study '{accession}'.")
    return {
        "accession": accession_clean,
        "file_count": len(files),
        "files": files,
        "data_context": OSDRDataContext.NASA_RESEARCH_DATA.value
    }


@router.get(
    "/cmp",
    response_model=List[CMPRecord],
    summary="Get Blood Serum Comprehensive Metabolic Panel Records (OSD-575)",
    description="Returns longitudinal Quest Diagnostics clinical chemistry observations for the 4 Inspiration4 crew members."
)
def get_cmp_records(
    subject_id: Optional[str] = Query(None, description="Filter by astronaut subject ID (e.g., C001, C002)"),
    timepoint: Optional[str] = Query(None, description="Filter by mission timepoint (e.g., L-3, R+1, R+45)")
):
    try:
        return default_osdr_service.get_cmp_records(subject_id=subject_id, timepoint=timepoint)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get(
    "/cbc",
    response_model=List[CBCRecord],
    summary="Get Whole Blood Complete Blood Count Records (OSD-569)",
    description="Returns longitudinal Quest Diagnostics hematology and immune cell observations."
)
def get_cbc_records(
    subject_id: Optional[str] = Query(None, description="Filter by astronaut subject ID (e.g., C001, C002)"),
    timepoint: Optional[str] = Query(None, description="Filter by mission timepoint (e.g., L-3, R+1, R+45)")
):
    try:
        return default_osdr_service.get_cbc_records(subject_id=subject_id, timepoint=timepoint)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get(
    "/cytokines",
    response_model=List[CytokineRecord],
    summary="Get Cardiovascular & Immune Cytokine Panel Records (OSD-575)",
    description="Returns Eve Technologies multiplex cytokine arrays (CRP, alpha-2 macroglobulin, AGP, IL-6, TNF-alpha)."
)
def get_cytokine_records(
    subject_id: Optional[str] = Query(None, description="Filter by astronaut subject ID (e.g., C001, C002)")
):
    try:
        return default_osdr_service.get_cytokine_records(subject_id=subject_id)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get(
    "/analysis",
    response_model=OSDRResearchSummary,
    summary="Get NASA OSDR Spaceflight Research Analysis",
    description="Computes pre-flight (L-3) vs post-splashdown (R+1) biomarker deltas and reference range excursions."
)
def get_research_analysis():
    try:
        return default_osdr_service.get_research_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compute OSDR research analysis: {str(e)}")


@router.get(
    "/integrity",
    summary="Verify NASA OSDR File Integrity",
    description="Validates cryptographic SHA-256 and MD5 checksums of all acquired NASA OSDR raw and metadata files."
)
def verify_dataset_integrity():
    try:
        report = default_osdr_service.verify_integrity()
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Integrity verification failed: {str(e)}")
