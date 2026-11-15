"""
OJAS NASA OSDR Data Loader (Phase 12).
Loads and parses authentic NASA OSDR Inspiration4 datasets:
- Comprehensive Metabolic Panel (CMP) from OSD-575
- Complete Blood Count (CBC) from OSD-569
- Cardiovascular & Immune Cytokine Biomarkers from OSD-575
Maintains strict separation from live personal baseline telemetry.
"""

import math
import logging
from typing import Dict, Any, List, Optional, Tuple
from pathlib import Path
import pandas as pd

from app.datasets.osdr.osdr_models import (
    CMPRecord,
    CBCRecord,
    CytokineRecord,
    OSDRSampleObservation,
    StudyPhase,
    map_timepoint_to_phase,
    OSDRDataContext,
)

logger = logging.getLogger("ojas.datasets.osdr.loader")


def _clean_float(val: Any) -> Optional[float]:
    """Converts diverse string representations of floats/NAs into Optional[float]."""
    if pd.isna(val) or val is None:
        return None
    s = str(val).strip().replace(",", "")
    if s.upper() in ["NA", "N/A", "NULL", "NONE", "", "NAN", "--"]:
        return None
    try:
        f = float(s)
        return None if math.isnan(f) else f
    except (ValueError, TypeError):
        return None


def parse_sample_identifier(sample_name: str) -> Tuple[str, str, str]:
    """
    Parses strings like 'C001_serum_L-3' or 'C001_whole-blood_L-3_cbc'.
    Returns: (subject_id, timepoint, sample_type)
    """
    clean_name = str(sample_name).replace("\ufeff", "").strip()
    parts = clean_name.split("_")
    subject_id = parts[0] if len(parts) > 0 else "UNKNOWN"
    sample_type = parts[1] if len(parts) > 1 else "serum"

    # Timepoint extraction
    if len(parts) >= 3:
        tp = parts[2]
        if tp.endswith("_cbc"):
            tp = tp.replace("_cbc", "")
    else:
        tp = "UNKNOWN"

    return subject_id, tp, sample_type


class OSDRDataLoader:
    def __init__(self, raw_dir: Optional[str] = None):
        if raw_dir:
            self.raw_dir = Path(raw_dir)
        else:
            self.raw_dir = Path(__file__).resolve().parents[3] / "data" / "nasa_original" / "osdr" / "raw"

    def load_cmp_records(self, file_name: str = "LSDS-8_Comprehensive_Metabolic_Panel_CMP_TRANSFORMED.csv") -> List[CMPRecord]:
        """Loads and parses the 28 Inspiration4 blood serum metabolic panel records."""
        path = self.raw_dir / file_name
        if not path.exists():
            raise FileNotFoundError(f"CMP dataset file not found at: {path}")

        df = pd.read_csv(path)
        sample_col = df.columns[0]
        records: List[CMPRecord] = []

        for _, row in df.iterrows():
            sample_name = str(row[sample_col]).replace("\ufeff", "").strip()
            subject_id, tp, _ = parse_sample_identifier(sample_name)
            phase = map_timepoint_to_phase(tp)

            record = CMPRecord(
                sample_name=sample_name,
                subject_id=subject_id,
                timepoint=tp,
                phase=phase,
                # Electrolytes & Renal
                sodium_mmol_l=_clean_float(row.get("sodium_value_millimol_per_liter")),
                sodium_range_min=_clean_float(row.get("sodium_range_min_millimol_per_liter")),
                sodium_range_max=_clean_float(row.get("sodium_range_max_millimol_per_liter")),

                potassium_mmol_l=_clean_float(row.get("potassium_value_millimol_per_liter")),
                potassium_range_min=_clean_float(row.get("potassium_range_min_millimol_per_liter")),
                potassium_range_max=_clean_float(row.get("potassium_range_max_millimol_per_liter")),

                chloride_mmol_l=_clean_float(row.get("chloride_value_millimol_per_liter")),
                chloride_range_min=_clean_float(row.get("chloride_range_min_millimol_per_liter")),
                chloride_range_max=_clean_float(row.get("chloride_range_max_millimol_per_liter")),

                carbon_dioxide_mmol_l=_clean_float(row.get("carbon_dioxide_value_millimol_per_liter")),
                carbon_dioxide_range_min=_clean_float(row.get("carbon_dioxide_range_min_millimol_per_liter")),
                carbon_dioxide_range_max=_clean_float(row.get("carbon_dioxide_range_max_millimol_per_liter")),

                calcium_mg_dl=_clean_float(row.get("calcium_value_milligram_per_deciliter")),
                calcium_range_min=_clean_float(row.get("calcium_range_min_milligram_per_deciliter")),
                calcium_range_max=_clean_float(row.get("calcium_range_max_milligram_per_deciliter")),

                glucose_mg_dl=_clean_float(row.get("glucose_value_milligram_per_deciliter")),
                glucose_range_min=_clean_float(row.get("glucose_range_min_milligram_per_deciliter")),
                glucose_range_max=_clean_float(row.get("glucose_range_max_milligram_per_deciliter")),

                urea_nitrogen_bun_mg_dl=_clean_float(row.get("urea_nitrogen_bun_value_milligram_per_deciliter")),
                urea_nitrogen_bun_range_min=_clean_float(row.get("urea_nitrogen_bun_range_min_milligram_per_deciliter")),
                urea_nitrogen_bun_range_max=_clean_float(row.get("urea_nitrogen_bun_range_max_milligram_per_deciliter")),

                creatinine_mg_dl=_clean_float(row.get("creatinine_value_milligram_per_deciliter")),
                creatinine_range_min=_clean_float(row.get("creatinine_range_min_milligram_per_deciliter")),
                creatinine_range_max=_clean_float(row.get("creatinine_range_max_milligram_per_deciliter")),

                bun_to_creatinine_ratio=_clean_float(row.get("bun_to_creatinine_ratio_value")),

                # Hepatic & Protein
                albumin_g_dl=_clean_float(row.get("albumin_value_gram_per_deciliter")),
                albumin_range_min=_clean_float(row.get("albumin_range_min_gram_per_deciliter")),
                albumin_range_max=_clean_float(row.get("albumin_range_max_gram_per_deciliter")),

                total_protein_g_dl=_clean_float(row.get("total_protein_value_gram_per_deciliter")),
                total_protein_range_min=_clean_float(row.get("total_protein_range_min_gram_per_deciliter")),
                total_protein_range_max=_clean_float(row.get("total_protein_range_max_gram_per_deciliter")),

                globulin_g_dl=_clean_float(row.get("globulin_value_gram_per_deciliter")),
                albumin_to_globulin_ratio=_clean_float(row.get("albumin_to_globulin_ratio_value")),

                total_bilirubin_mg_dl=_clean_float(row.get("total_bilirubin_value_milligram_per_deciliter")),
                total_bilirubin_range_min=_clean_float(row.get("total_bilirubin_range_min_milligram_per_deciliter")),
                total_bilirubin_range_max=_clean_float(row.get("total_bilirubin_range_max_milligram_per_deciliter")),

                alkaline_phosphatase_u_l=_clean_float(row.get("alkaline_phosphatase_value_units_per_liter")),
                alkaline_phosphatase_range_min=_clean_float(row.get("alkaline_phosphatase_range_min_units_per_liter")),
                alkaline_phosphatase_range_max=_clean_float(row.get("alkaline_phosphatase_range_max_units_per_liter")),

                alt_u_l=_clean_float(row.get("alt_value_units_per_liter")),
                alt_range_min=_clean_float(row.get("alt_range_min_units_per_liter")),
                alt_range_max=_clean_float(row.get("alt_max_units_per_liter")),

                ast_u_l=_clean_float(row.get("ast_value_units_per_liter")),
                ast_range_min=_clean_float(row.get("ast_range_min_units_per_liter")),
                ast_range_max=_clean_float(row.get("ast_max_units_per_liter")),
            )
            records.append(record)

        return records

    def load_cbc_records(self, file_name: str = "LSDS-7_Complete_Blood_Count_CBC_TRANSFORMED.csv") -> List[CBCRecord]:
        """Loads and parses the 28 Inspiration4 complete blood count hematology records."""
        path = self.raw_dir / file_name
        if not path.exists():
            raise FileNotFoundError(f"CBC dataset file not found at: {path}")

        df = pd.read_csv(path)
        sample_col = df.columns[0]
        records: List[CBCRecord] = []

        for _, row in df.iterrows():
            sample_name = str(row[sample_col]).replace("\ufeff", "").strip()
            subject_id, tp, _ = parse_sample_identifier(sample_name)
            phase = map_timepoint_to_phase(tp)

            record = CBCRecord(
                sample_name=sample_name,
                subject_id=subject_id,
                timepoint=tp,
                phase=phase,

                white_blood_cells_cells_ul=_clean_float(row.get("white_blood_cell_count_value_thousand_per_microliter")),
                white_blood_cells_range_min=_clean_float(row.get("white_blood_cell_count_range_min_thousand_per_microliter")),
                white_blood_cells_range_max=_clean_float(row.get("white_blood_cell_count_range_max_thousand_per_microliter")),

                red_blood_cells_million_cells_ul=_clean_float(row.get("red_blood_cell_count_value_million_per_microliter")),
                red_blood_cells_range_min=_clean_float(row.get("red_blood_cell_count_range_min_million_per_microliter")),
                red_blood_cells_range_max=_clean_float(row.get("red_blood_cell_count_range_max_million_per_microliter")),

                hemoglobin_g_dl=_clean_float(row.get("hemoglobin_value_percent")),
                hemoglobin_range_min=_clean_float(row.get("hemoglobin_range_min_percent")),
                hemoglobin_range_max=_clean_float(row.get("hemoglobin_range_max_percent")),

                hematocrit_pct=_clean_float(row.get("hematocrit_value_percent")),
                hematocrit_range_min=_clean_float(row.get("hematocrit_range_min_percent")),
                hematocrit_range_max=_clean_float(row.get("hematocrit_range_max_percent")),

                platelets_thousand_cells_ul=_clean_float(row.get("platelet_count_value_thousand_per_microliter")),
                platelets_range_min=_clean_float(row.get("platelet_count_range_min_thousand_per_microliter")),
                platelets_range_max=_clean_float(row.get("platelet_count_range_max_thousand_per_microliter")),

                absolute_neutrophils_cells_ul=_clean_float(row.get("absolute_neutrophils_value_cells_per_microliter")),
                absolute_neutrophils_range_min=_clean_float(row.get("absolute_neutrophils_range_min_cells_per_microliter")),
                absolute_neutrophils_range_max=_clean_float(row.get("absolute_neutrophils_range_max_cells_per_microliter")),

                absolute_lymphocytes_cells_ul=_clean_float(row.get("absolute_lymphocytes_value_cells_per_microliter")),
                absolute_lymphocytes_range_min=_clean_float(row.get("absolute_lymphocytes_range_min_cells_per_microliter")),
                absolute_lymphocytes_range_max=_clean_float(row.get("absolute_lymphocytes_range_max_cells_per_microliter")),

                absolute_monocytes_cells_ul=_clean_float(row.get("absolute_monocytes_value_cells_per_microliter")),
                absolute_monocytes_range_min=_clean_float(row.get("absolute_monocytes_range_min_cells_per_microliter")),
                absolute_monocytes_range_max=_clean_float(row.get("absolute_monocytes_range_max_cells_per_microliter")),

                absolute_eosinophils_cells_ul=_clean_float(row.get("absolute_eosinophils_value_cells_per_microliter")),
                absolute_eosinophils_range_min=_clean_float(row.get("absolute_eosinophils_range_min_cells_per_microliter")),
                absolute_eosinophils_range_max=_clean_float(row.get("absolute_eosinophils_range_max_cells_per_microliter")),

                absolute_basophils_cells_ul=_clean_float(row.get("absolute_basophils_value_cells_per_microliter")),
                absolute_basophils_range_min=_clean_float(row.get("absolute_basophils_range_min_cells_per_microliter")),
                absolute_basophils_range_max=_clean_float(row.get("absolute_basophils_range_max_cells_per_microliter")),
            )
            records.append(record)

        return records

    def load_cytokine_records(
        self,
        cardio_file: str = "LSDS-8_Multiplex_serum_cardiovascular_EvePanel_TRANSFORMED.csv",
        immune_file: str = "LSDS-8_Multiplex_serum_immune_EvePanel_TRANSFORMED.csv"
    ) -> List[CytokineRecord]:
        """Loads and merges cardiovascular and immune cytokine arrays for Inspiration4."""
        cardio_path = self.raw_dir / cardio_file
        immune_path = self.raw_dir / immune_file

        if not cardio_path.exists():
            raise FileNotFoundError(f"Cardiovascular cytokines file not found: {cardio_path}")

        df_cardio = pd.read_csv(cardio_path)
        df_immune = pd.read_csv(immune_path) if immune_path.exists() else None

        sample_col = df_cardio.columns[0]
        records: List[CytokineRecord] = []

        immune_lookup = {}
        if df_immune is not None:
            immune_col = df_immune.columns[0]
            for _, r in df_immune.iterrows():
                s_name = str(r[immune_col]).replace("\ufeff", "").strip()
                immune_lookup[s_name] = r

        for _, row in df_cardio.iterrows():
            sample_name = str(row[sample_col]).replace("\ufeff", "").strip()
            subject_id, tp, _ = parse_sample_identifier(sample_name)
            phase = map_timepoint_to_phase(tp)

            imm_row = immune_lookup.get(sample_name, {})

            record = CytokineRecord(
                sample_name=sample_name,
                subject_id=subject_id,
                timepoint=tp,
                phase=phase,
                crp_ng_ml=_clean_float(row.get("crp_concentration_picogram_per_milliliter")),
                a2_macroglobulin_ng_ml=_clean_float(row.get("a2_macroglobulin_concentration_nanogram_per_milliliter")),
                agp_ng_ml=_clean_float(row.get("agp_concentration_nanogram_per_milliliter")),
                sap_ng_ml=_clean_float(row.get("sap_concentration_picogram_per_milliliter")),
                fetuin_a_ng_ml=_clean_float(row.get("fetuin_a36_concentration_nanogram_per_milliliter")),
                il_6_pg_ml=_clean_float(imm_row.get("il_6_concentration_picogram_per_milliliter")),
                tnf_alpha_pg_ml=_clean_float(imm_row.get("tnfα_concentration_picogram_per_milliliter")),
                il_10_pg_ml=_clean_float(imm_row.get("il_10_concentration_picogram_per_milliliter")),
                ifn_gamma_pg_ml=_clean_float(imm_row.get("ifnγ_concentration_picogram_per_milliliter")),
            )
            records.append(record)

        return records

    def load_harmonized_observations(self) -> List[OSDRSampleObservation]:
        """Loads and cross-correlates CMP, CBC, and Cytokine records by (subject, timepoint)."""
        cmp_records = self.load_cmp_records()
        cbc_records = self.load_cbc_records()
        cytokine_records = self.load_cytokine_records()

        cbc_map = {(r.subject_id, r.timepoint): r for r in cbc_records}
        cytokine_map = {(r.subject_id, r.timepoint): r for r in cytokine_records}

        observations: List[OSDRSampleObservation] = []

        for cmp_rec in cmp_records:
            key = (cmp_rec.subject_id, cmp_rec.timepoint)
            obs = OSDRSampleObservation(
                sample_id=cmp_rec.sample_name,
                subject_id=cmp_rec.subject_id,
                timepoint=cmp_rec.timepoint,
                phase=cmp_rec.phase,
                sample_type="serum+whole-blood",
                cmp=cmp_rec,
                cbc=cbc_map.get(key),
                cytokines=cytokine_map.get(key),
                data_context=OSDRDataContext.NASA_RESEARCH_DATA
            )
            observations.append(obs)

        return observations
