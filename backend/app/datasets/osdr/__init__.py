"""
OJAS NASA Open Science Data Repository (OSDR) Research Integration Package (Phase 12).
Provides:
- Data discovery and metadata retrieval for NASA OSDR studies (OSD-575, OSD-569)
- Cryptographic integrity validation of acquired raw NASA datasets
- Structured parsing of clinical chemistry (CMP), hematology (CBC), and cytokine arrays
- Strict isolation of NASA research data from live astronaut personal baselines
- Longitudinal spaceflight biospecimen analysis (pre-flight baseline vs post-return recovery)
- End-to-end scientific data provenance and processing manifests
"""

from app.datasets.osdr.osdr_models import (
    OSDRStudyMetadata,
    OSDRSampleObservation,
    CMPRecord,
    CBCRecord,
    CytokineRecord,
    OSDRResearchSummary,
    OSDRDataContext,
)
from app.datasets.osdr.osdr_integrity import OSDRIntegrityVerifier
from app.datasets.osdr.osdr_client import OSDRClient
from app.datasets.osdr.osdr_loader import OSDRDataLoader
from app.datasets.osdr.osdr_analysis import OSDRAnalysisEngine
from app.datasets.osdr.osdr_provenance import OSDRProvenanceTracker
from app.datasets.osdr.osdr_service import OSDRResearchService, default_osdr_service

__all__ = [
    "OSDRStudyMetadata",
    "OSDRSampleObservation",
    "CMPRecord",
    "CBCRecord",
    "CytokineRecord",
    "OSDRResearchSummary",
    "OSDRDataContext",
    "OSDRIntegrityVerifier",
    "OSDRClient",
    "OSDRDataLoader",
    "OSDRAnalysisEngine",
    "OSDRProvenanceTracker",
    "OSDRResearchService",
    "default_osdr_service",
]
