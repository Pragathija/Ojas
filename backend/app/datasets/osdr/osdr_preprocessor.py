"""
OJAS NASA OSDR Data Preprocessor & Research Exporter (Phase 12).
Harmonizes raw NASA OSDR records and generates:
- Clean, canonical processed tabular representation
- Longitudinal pre-to-post spaceflight shift report
- Excursion registry documenting reference range outliers
Outputs to:
- `backend/data/nasa_original/osdr/processed/`
- `backend/data/nasa_original/osdr/reports/`
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional
from pathlib import Path
import pandas as pd

from app.datasets.osdr.osdr_loader import OSDRDataLoader
from app.datasets.osdr.osdr_analysis import OSDRAnalysisEngine
from app.datasets.osdr.osdr_models import OSDRSampleObservation

logger = logging.getLogger("ojas.datasets.osdr.preprocessor")


class OSDRPreprocessor:
    def __init__(self, base_dir: Optional[str] = None):
        if base_dir:
            self.base_dir = Path(base_dir)
        else:
            self.base_dir = Path(__file__).resolve().parents[3] / "data" / "nasa_original" / "osdr"
        self.processed_dir = self.base_dir / "processed"
        self.reports_dir = self.base_dir / "reports"
        self.processed_dir.mkdir(parents=True, exist_ok=True)
        self.reports_dir.mkdir(parents=True, exist_ok=True)
        self.loader = OSDRDataLoader(raw_dir=str(self.base_dir / "raw"))

    def run_preprocessing_pipeline(self) -> Dict[str, Any]:
        """
        Executes full preprocessing and exports harmonized artifacts.
        """
        observations = self.loader.load_harmonized_observations()
        engine = OSDRAnalysisEngine(observations)
        summary = engine.generate_research_summary()

        # 1. Flatten observations into a canonical processed CSV
        flat_records = []
        for o in observations:
            row = {
                "sample_id": o.sample_id,
                "subject_id": o.subject_id,
                "timepoint": o.timepoint,
                "phase": o.phase.value,
                "data_context": o.data_context.value,
            }
            # Add key CMP fields
            if o.cmp:
                row.update({
                    "cmp_sodium_mmol_l": o.cmp.sodium_mmol_l,
                    "cmp_potassium_mmol_l": o.cmp.potassium_mmol_l,
                    "cmp_calcium_mg_dl": o.cmp.calcium_mg_dl,
                    "cmp_glucose_mg_dl": o.cmp.glucose_mg_dl,
                    "cmp_creatinine_mg_dl": o.cmp.creatinine_mg_dl,
                    "cmp_bun_mg_dl": o.cmp.urea_nitrogen_bun_mg_dl,
                    "cmp_ast_u_l": o.cmp.ast_u_l,
                    "cmp_alt_u_l": o.cmp.alt_u_l,
                    "cmp_total_bilirubin_mg_dl": o.cmp.total_bilirubin_mg_dl,
                    "cmp_albumin_g_dl": o.cmp.albumin_g_dl,
                })
            # Add key CBC fields
            if o.cbc:
                row.update({
                    "cbc_wbc_thousand_ul": o.cbc.white_blood_cells_cells_ul,
                    "cbc_rbc_million_ul": o.cbc.red_blood_cells_million_cells_ul,
                    "cbc_hemoglobin_pct": o.cbc.hemoglobin_g_dl,
                    "cbc_hematocrit_pct": o.cbc.hematocrit_pct,
                    "cbc_platelets_thousand_ul": o.cbc.platelets_thousand_cells_ul,
                    "cbc_neutrophils_cells_ul": o.cbc.absolute_neutrophils_cells_ul,
                    "cbc_lymphocytes_cells_ul": o.cbc.absolute_lymphocytes_cells_ul,
                })
            # Add key Cytokine fields
            if o.cytokines:
                row.update({
                    "cytokine_crp_ng_ml": o.cytokines.crp_ng_ml,
                    "cytokine_a2_macroglobulin_ng_ml": o.cytokines.a2_macroglobulin_ng_ml,
                    "cytokine_agp_ng_ml": o.cytokines.agp_ng_ml,
                    "cytokine_il_6_pg_ml": o.cytokines.il_6_pg_ml,
                    "cytokine_tnf_alpha_pg_ml": o.cytokines.tnf_alpha_pg_ml,
                })
            flat_records.append(row)

        df = pd.DataFrame(flat_records)
        processed_csv_path = self.processed_dir / "osdr_inspiration4_harmonized_longitudinal.csv"
        df.to_csv(processed_csv_path, index=False)

        # 2. Export detailed JSON research report
        report_data = {
            "title": summary.dataset_title,
            "accessions": summary.accessions,
            "subjects": summary.subjects,
            "timepoints": summary.timepoints,
            "total_harmonized_observations": len(observations),
            "pre_to_post_flight_findings": summary.pre_to_post_flight_findings,
            "reference_range_excursions": summary.reference_range_excursions,
            "missing_data_profile": summary.missing_data_profile,
            "data_context": summary.data_context.value,
            "scientific_disclaimer": summary.scientific_disclaimer,
        }
        report_json_path = self.reports_dir / "osdr_inspiration4_scientific_report.json"
        with open(report_json_path, "w", encoding="utf-8") as f:
            json.dump(report_data, f, indent=2)

        return {
            "processed_csv": str(processed_csv_path),
            "report_json": str(report_json_path),
            "records_processed": len(flat_records),
            "subjects": len(summary.subjects),
            "excursions_found": len(summary.reference_range_excursions)
        }
