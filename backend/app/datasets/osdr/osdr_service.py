"""
OJAS NASA OSDR Research Service (Phase 12).
Central coordinator for:
- Integrity checking of acquired NASA OSDR datasets
- Harmonized data access across CMP, CBC, and Cytokine panels
- Longitudinal spaceflight research analytics
- Provenance manifest generation and persistence
- Strictly isolates NASA research observations from live astronaut statistical baselines.
"""

import logging
from typing import Dict, Any, List, Optional

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

logger = logging.getLogger("ojas.datasets.osdr.service")


class OSDRResearchService:
    def __init__(self):
        self.client = OSDRClient()
        self.verifier = OSDRIntegrityVerifier()
        self.loader = OSDRDataLoader()
        self.provenance = OSDRProvenanceTracker()
        self._cached_observations: Optional[List[OSDRSampleObservation]] = None
        self._cached_summary: Optional[OSDRResearchSummary] = None

    def get_integrated_studies(self) -> List[OSDRStudyMetadata]:
        """Returns metadata for integrated NASA OSDR studies (OSD-575, OSD-569)."""
        return [
            OSDRStudyMetadata(
                accession="OSD-575",
                title="SpaceX Inspiration4 Blood Serum Metabolic Panel and Immune/Cardiac Cytokine Arrays",
                organism="Homo sapiens",
                mission="SpaceX Inspiration4",
                study_type="Clinical Chemistry & Immunoassay",
                subject_count=4,
                subjects=["C001", "C002", "C003", "C004"],
                timepoints=["L-92", "L-44", "L-3", "R+1", "R+45", "R+82", "R+194"],
                file_count=9,
                description="Comprehensive metabolic panel (Quest) and multiplex cardiovascular/immune cytokine profiles.",
                publications=[
                    {
                        "title": "The Space Omics and Medical Atlas (SOMA) and international astronaut biobank",
                        "doi": "10.1038/s41586-024-07639-y",
                        "journal": "Nature (2024)"
                    }
                ],
                data_context=OSDRDataContext.NASA_RESEARCH_DATA
            ),
            OSDRStudyMetadata(
                accession="OSD-569",
                title="Whole Blood Measurements from the SpaceX Inspiration4 Mission",
                organism="Homo sapiens",
                mission="SpaceX Inspiration4",
                study_type="Complete Blood Count & Hematology",
                subject_count=4,
                subjects=["C001", "C002", "C003", "C004"],
                timepoints=["L-92", "L-44", "L-3", "R+1", "R+45", "R+82", "R+194"],
                file_count=11,
                description="Complete blood counts with white cell differential for Inspiration4 crew members.",
                publications=[
                    {
                        "title": "Collection of Biospecimens from the Inspiration4 Mission",
                        "doi": "10.1038/s41467-024-48806-z",
                        "journal": "Nature Communications (2024)"
                    }
                ],
                data_context=OSDRDataContext.NASA_RESEARCH_DATA
            )
        ]

    def verify_integrity(self) -> Dict[str, Any]:
        """Runs cryptographic SHA-256 integrity verification across all original NASA files."""
        return self.verifier.verify_all_files()

    def get_harmonized_observations(self, force_reload: bool = False) -> List[OSDRSampleObservation]:
        """Retrieves or loads the 28 cross-modal Inspiration4 observations."""
        if self._cached_observations is None or force_reload:
            self._cached_observations = self.loader.load_harmonized_observations()
            # Generate and persist processing manifest upon load
            self.provenance.generate_processing_manifest(self._cached_observations)
        return self._cached_observations

    def get_cmp_records(self, subject_id: Optional[str] = None, timepoint: Optional[str] = None) -> List[CMPRecord]:
        """Retrieves blood serum metabolic panel records with optional subject/timepoint filters."""
        records = self.loader.load_cmp_records()
        if subject_id:
            records = [r for r in records if r.subject_id.upper() == subject_id.upper()]
        if timepoint:
            records = [r for r in records if r.timepoint.upper() == timepoint.upper()]
        return records

    def get_cbc_records(self, subject_id: Optional[str] = None, timepoint: Optional[str] = None) -> List[CBCRecord]:
        """Retrieves complete blood count hematology records with optional filters."""
        records = self.loader.load_cbc_records()
        if subject_id:
            records = [r for r in records if r.subject_id.upper() == subject_id.upper()]
        if timepoint:
            records = [r for r in records if r.timepoint.upper() == timepoint.upper()]
        return records

    def get_cytokine_records(self, subject_id: Optional[str] = None) -> List[CytokineRecord]:
        """Retrieves cardiovascular and immune cytokine records."""
        records = self.loader.load_cytokine_records()
        if subject_id:
            records = [r for r in records if r.subject_id.upper() == subject_id.upper()]
        return records

    def get_research_summary(self, force_reload: bool = False) -> OSDRResearchSummary:
        """Computes or retrieves cached scientific research summary and pre/post flight findings."""
        if self._cached_summary is None or force_reload:
            obs = self.get_harmonized_observations(force_reload=force_reload)
            engine = OSDRAnalysisEngine(obs)
            self._cached_summary = engine.generate_research_summary()
        return self._cached_summary


default_osdr_service = OSDRResearchService()
