"""
OJAS NASA OSDR Data Models & Schemas (Phase 12).
Defines schemas for:
- Study metadata & file manifests
- Clinical chemistry: Comprehensive Metabolic Panel (CMP)
- Hematology: Complete Blood Count (CBC)
- Cytokine immunoassay panels (Cardiovascular & Immune)
- Sample-level observation models and study phase categorization
- Longitudinal pre/post-flight comparative research summaries
"""

from enum import Enum
from typing import Optional, List, Dict, Any, Union
from datetime import datetime, timezone
from pydantic import BaseModel, Field


class OSDRDataContext(str, Enum):
    LIVE_TELEMETRY = "LIVE_TELEMETRY"
    SIMULATED_TELEMETRY = "SIMULATED_TELEMETRY"
    NASA_RESEARCH_DATA = "NASA_RESEARCH_DATA"


class StudyPhase(str, Enum):
    PRE_FLIGHT_BASELINE = "PRE_FLIGHT_BASELINE"     # L-92, L-44, L-3
    POST_FLIGHT_ACUTE = "POST_FLIGHT_ACUTE"         # R+1
    POST_FLIGHT_RECOVERY = "POST_FLIGHT_RECOVERY"   # R+45, R+82, R+194
    UNKNOWN = "UNKNOWN"


def map_timepoint_to_phase(timepoint: str) -> StudyPhase:
    """Classifies spaceflight timepoint into standardized study phases."""
    t = timepoint.upper().strip()
    if t.startswith("L-"):
        return StudyPhase.PRE_FLIGHT_BASELINE
    elif t in ["R+1", "R+0"]:
        return StudyPhase.POST_FLIGHT_ACUTE
    elif t.startswith("R+"):
        return StudyPhase.POST_FLIGHT_RECOVERY
    return StudyPhase.UNKNOWN


class OSDRFileManifestItem(BaseModel):
    accession: str
    file_name: str
    category: str
    relative_path: str
    file_size_bytes: int
    sha256: str
    md5: Optional[str] = None
    source_url: str
    acquired_at: str
    description: str


class OSDRStudyMetadata(BaseModel):
    accession: str
    title: str
    organism: str = "Homo sapiens"
    mission: str = "SpaceX Inspiration4"
    study_type: str
    subject_count: int = 4
    subjects: List[str] = ["C001", "C002", "C003", "C004"]
    timepoints: List[str] = ["L-92", "L-44", "L-3", "R+1", "R+45", "R+82", "R+194"]
    publications: List[Dict[str, str]] = []
    file_count: int = 0
    description: str = ""
    public_release_date: Optional[str] = None
    data_context: OSDRDataContext = OSDRDataContext.NASA_RESEARCH_DATA


class CMPRecord(BaseModel):
    """
    Blood Serum Comprehensive Metabolic Panel (Quest Diagnostics / Beckman Coulter AU5800).
    OSD-575 authentic clinical chemistry variables and reference ranges.
    """
    sample_name: str
    subject_id: str
    timepoint: str
    phase: StudyPhase
    
    # Electrolytes & Renal Markers
    sodium_mmol_l: Optional[float] = None
    sodium_range_min: Optional[float] = None
    sodium_range_max: Optional[float] = None

    potassium_mmol_l: Optional[float] = None
    potassium_range_min: Optional[float] = None
    potassium_range_max: Optional[float] = None

    chloride_mmol_l: Optional[float] = None
    chloride_range_min: Optional[float] = None
    chloride_range_max: Optional[float] = None

    carbon_dioxide_mmol_l: Optional[float] = None
    carbon_dioxide_range_min: Optional[float] = None
    carbon_dioxide_range_max: Optional[float] = None

    calcium_mg_dl: Optional[float] = None
    calcium_range_min: Optional[float] = None
    calcium_range_max: Optional[float] = None

    glucose_mg_dl: Optional[float] = None
    glucose_range_min: Optional[float] = None
    glucose_range_max: Optional[float] = None

    urea_nitrogen_bun_mg_dl: Optional[float] = None
    urea_nitrogen_bun_range_min: Optional[float] = None
    urea_nitrogen_bun_range_max: Optional[float] = None

    creatinine_mg_dl: Optional[float] = None
    creatinine_range_min: Optional[float] = None
    creatinine_range_max: Optional[float] = None

    bun_to_creatinine_ratio: Optional[float] = None

    # Hepatic & Protein Markers
    albumin_g_dl: Optional[float] = None
    albumin_range_min: Optional[float] = None
    albumin_range_max: Optional[float] = None

    total_protein_g_dl: Optional[float] = None
    total_protein_range_min: Optional[float] = None
    total_protein_range_max: Optional[float] = None

    globulin_g_dl: Optional[float] = None
    albumin_to_globulin_ratio: Optional[float] = None

    total_bilirubin_mg_dl: Optional[float] = None
    total_bilirubin_range_min: Optional[float] = None
    total_bilirubin_range_max: Optional[float] = None

    alkaline_phosphatase_u_l: Optional[float] = None
    alkaline_phosphatase_range_min: Optional[float] = None
    alkaline_phosphatase_range_max: Optional[float] = None

    alt_u_l: Optional[float] = None
    alt_range_min: Optional[float] = None
    alt_range_max: Optional[float] = None

    ast_u_l: Optional[float] = None
    ast_range_min: Optional[float] = None
    ast_range_max: Optional[float] = None

    # Provenance
    provenance_accession: str = "OSD-575"
    provenance_file: str = "LSDS-8_Comprehensive_Metabolic_Panel_CMP_TRANSFORMED.csv"
    data_context: OSDRDataContext = OSDRDataContext.NASA_RESEARCH_DATA


class CBCRecord(BaseModel):
    """
    Whole Blood Complete Blood Count (Quest Diagnostics).
    OSD-569 authentic hematology variables and reference ranges.
    """
    sample_name: str
    subject_id: str
    timepoint: str
    phase: StudyPhase

    # Immune & Blood Cells
    white_blood_cells_cells_ul: Optional[float] = None
    white_blood_cells_range_min: Optional[float] = None
    white_blood_cells_range_max: Optional[float] = None

    red_blood_cells_million_cells_ul: Optional[float] = None
    red_blood_cells_range_min: Optional[float] = None
    red_blood_cells_range_max: Optional[float] = None

    hemoglobin_g_dl: Optional[float] = None
    hemoglobin_range_min: Optional[float] = None
    hemoglobin_range_max: Optional[float] = None

    hematocrit_pct: Optional[float] = None
    hematocrit_range_min: Optional[float] = None
    hematocrit_range_max: Optional[float] = None

    platelets_thousand_cells_ul: Optional[float] = None
    platelets_range_min: Optional[float] = None
    platelets_range_max: Optional[float] = None

    # Differential Cell Counts
    absolute_neutrophils_cells_ul: Optional[float] = None
    absolute_neutrophils_range_min: Optional[float] = None
    absolute_neutrophils_range_max: Optional[float] = None

    absolute_lymphocytes_cells_ul: Optional[float] = None
    absolute_lymphocytes_range_min: Optional[float] = None
    absolute_lymphocytes_range_max: Optional[float] = None

    absolute_monocytes_cells_ul: Optional[float] = None
    absolute_monocytes_range_min: Optional[float] = None
    absolute_monocytes_range_max: Optional[float] = None

    absolute_eosinophils_cells_ul: Optional[float] = None
    absolute_eosinophils_range_min: Optional[float] = None
    absolute_eosinophils_range_max: Optional[float] = None

    absolute_basophils_cells_ul: Optional[float] = None
    absolute_basophils_range_min: Optional[float] = None
    absolute_basophils_range_max: Optional[float] = None

    # Provenance
    provenance_accession: str = "OSD-569"
    provenance_file: str = "LSDS-7_Complete_Blood_Count_CBC_TRANSFORMED.csv"
    data_context: OSDRDataContext = OSDRDataContext.NASA_RESEARCH_DATA


class CytokineRecord(BaseModel):
    """
    Cardiovascular & Immune Cytokine Biomarkers (Eve Technologies).
    """
    sample_name: str
    subject_id: str
    timepoint: str
    phase: StudyPhase

    # Key Cardiovascular & Acute Phase Reactants
    crp_ng_ml: Optional[float] = None
    a2_macroglobulin_ng_ml: Optional[float] = None
    agp_ng_ml: Optional[float] = None
    sap_ng_ml: Optional[float] = None
    fetuin_a_ng_ml: Optional[float] = None

    # Key Immune Cytokines
    il_6_pg_ml: Optional[float] = None
    tnf_alpha_pg_ml: Optional[float] = None
    il_10_pg_ml: Optional[float] = None
    ifn_gamma_pg_ml: Optional[float] = None

    # Provenance
    provenance_accession: str = "OSD-575"
    data_context: OSDRDataContext = OSDRDataContext.NASA_RESEARCH_DATA


class OSDRSampleObservation(BaseModel):
    """Unified observation linking sample metadata across modalities."""
    sample_id: str
    subject_id: str
    timepoint: str
    phase: StudyPhase
    sample_type: str  # serum, whole-blood
    cmp: Optional[CMPRecord] = None
    cbc: Optional[CBCRecord] = None
    cytokines: Optional[CytokineRecord] = None
    data_context: OSDRDataContext = OSDRDataContext.NASA_RESEARCH_DATA


class OSDRResearchSummary(BaseModel):
    """Summary of OSDR dataset analysis, subject counts, and longitudinal shifts."""
    dataset_title: str
    accessions: List[str]
    subject_count: int
    subjects: List[str]
    timepoints: List[str]
    total_cmp_observations: int
    total_cbc_observations: int
    total_cytokine_observations: int
    pre_to_post_flight_findings: Dict[str, Any]
    reference_range_excursions: List[Dict[str, Any]]
    missing_data_profile: Dict[str, Any]
    data_context: OSDRDataContext = OSDRDataContext.NASA_RESEARCH_DATA
    scientific_disclaimer: str = (
        "NASA OSDR research observations represent retrospective spaceflight multi-omics "
        "and biospecimen measurements. They are strictly isolated from real-time astronaut "
        "telemetry baselines and do not constitute real-time clinical diagnostic alerts."
    )
