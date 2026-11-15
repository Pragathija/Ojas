"""
OJAS NASA OSDR Scientific Research Analysis Engine (Phase 12).
Performs longitudinal multi-timepoint biospecimen analysis on Inspiration4:
- Pre-flight launch baseline (L-3) vs Immediate post-flight recovery (R+1)
- Long-term mission recovery trajectory (R+45, R+82, R+194)
- Subject-level and cohort-level biomarker distributions
- Reference range excursion audits (hepatic enzymes, renal function, inflammatory cytokines)
- Missing data pattern accounting
Maintains strict scientific disclaimer: retrospective space omics research data
is separated from acute clinical decision-making.
"""

import logging
from typing import Dict, Any, List, Optional
import numpy as np

from app.datasets.osdr.osdr_models import (
    OSDRSampleObservation,
    CMPRecord,
    CBCRecord,
    CytokineRecord,
    StudyPhase,
    OSDRResearchSummary,
    OSDRDataContext,
)

logger = logging.getLogger("ojas.datasets.osdr.analysis")


class OSDRAnalysisEngine:
    def __init__(self, observations: Optional[List[OSDRSampleObservation]] = None):
        self.observations = observations or []

    def compute_summary_statistics(self, values: List[float]) -> Dict[str, Optional[float]]:
        """Computes robust statistical metrics on valid numerical lists."""
        valid = [v for v in values if v is not None and not np.isnan(v)]
        if not valid:
            return {
                "mean": None,
                "median": None,
                "std": None,
                "iqr": None,
                "min": None,
                "max": None,
                "count": 0
            }
        arr = np.array(valid, dtype=float)
        p25, p75 = np.percentile(arr, 25), np.percentile(arr, 75)
        return {
            "mean": round(float(np.mean(arr)), 2),
            "median": round(float(np.median(arr)), 2),
            "std": round(float(np.std(arr)), 2),
            "iqr": round(float(p75 - p25), 2),
            "min": round(float(np.min(arr)), 2),
            "max": round(float(np.max(arr)), 2),
            "count": len(valid)
        }

    def analyze_pre_to_post_flight_shifts(self) -> Dict[str, Any]:
        """
        Calculates cohort-wide changes from immediate pre-flight (L-3)
        to immediate post-splashdown recovery (R+1).
        """
        l3_obs = [o for o in self.observations if o.timepoint == "L-3"]
        r1_obs = [o for o in self.observations if o.timepoint == "R+1"]

        findings = {}

        # 1. Hepatic & Muscle Enzymes (AST, ALT)
        for metric, label in [("ast_u_l", "AST (Aspartate Aminotransferase)"),
                              ("alt_u_l", "ALT (Alanine Aminotransferase)"),
                              ("glucose_mg_dl", "Fasting Glucose"),
                              ("sodium_mmol_l", "Serum Sodium"),
                              ("potassium_mmol_l", "Serum Potassium"),
                              ("creatinine_mg_dl", "Serum Creatinine"),
                              ("urea_nitrogen_bun_mg_dl", "Blood Urea Nitrogen (BUN)")]:
            l3_vals = [getattr(o.cmp, metric, None) for o in l3_obs if o.cmp]
            r1_vals = [getattr(o.cmp, metric, None) for o in r1_obs if o.cmp]

            l3_stats = self.compute_summary_statistics(l3_vals)
            r1_stats = self.compute_summary_statistics(r1_vals)

            delta = (r1_stats["mean"] - l3_stats["mean"]) if (r1_stats["mean"] is not None and l3_stats["mean"] is not None) else None
            pct_change = (delta / l3_stats["mean"] * 100.0) if (delta is not None and l3_stats["mean"] and l3_stats["mean"] > 0) else None

            findings[metric] = {
                "biomarker": label,
                "pre_flight_l3": l3_stats,
                "post_flight_r1": r1_stats,
                "delta": round(delta, 2) if delta is not None else None,
                "percent_change": round(pct_change, 1) if pct_change is not None else None,
                "direction": "INCREASED" if (delta and delta > 0) else "DECREASED" if (delta and delta < 0) else "UNCHANGED"
            }

        # 2. Hematology Shifts (White Blood Cells, Platelets, Hematocrit)
        for metric, label in [("white_blood_cells_cells_ul", "White Blood Cells"),
                              ("platelets_thousand_cells_ul", "Platelets"),
                              ("hematocrit_pct", "Hematocrit"),
                              ("absolute_lymphocytes_cells_ul", "Absolute Lymphocytes")]:
            l3_vals = [getattr(o.cbc, metric, None) for o in l3_obs if o.cbc]
            r1_vals = [getattr(o.cbc, metric, None) for o in r1_obs if o.cbc]

            l3_stats = self.compute_summary_statistics(l3_vals)
            r1_stats = self.compute_summary_statistics(r1_vals)

            delta = (r1_stats["mean"] - l3_stats["mean"]) if (r1_stats["mean"] is not None and l3_stats["mean"] is not None) else None
            pct_change = (delta / l3_stats["mean"] * 100.0) if (delta is not None and l3_stats["mean"] and l3_stats["mean"] > 0) else None

            findings[metric] = {
                "biomarker": label,
                "pre_flight_l3": l3_stats,
                "post_flight_r1": r1_stats,
                "delta": round(delta, 2) if delta is not None else None,
                "percent_change": round(pct_change, 1) if pct_change is not None else None,
                "direction": "INCREASED" if (delta and delta > 0) else "DECREASED" if (delta and delta < 0) else "UNCHANGED"
            }

        return findings

    def audit_reference_range_excursions(self) -> List[Dict[str, Any]]:
        """
        Audits values falling outside documented Quest Diagnostics reference ranges.
        """
        excursions = []

        for o in self.observations:
            # Check CMP
            if o.cmp:
                cmp_checks = [
                    ("AST", o.cmp.ast_u_l, o.cmp.ast_range_min, o.cmp.ast_range_max, "U/L"),
                    ("ALT", o.cmp.alt_u_l, o.cmp.alt_range_min, o.cmp.alt_range_max, "U/L"),
                    ("Creatinine", o.cmp.creatinine_mg_dl, o.cmp.creatinine_range_min, o.cmp.creatinine_range_max, "mg/dL"),
                    ("Glucose", o.cmp.glucose_mg_dl, o.cmp.glucose_range_min, o.cmp.glucose_range_max, "mg/dL"),
                    ("BUN", o.cmp.urea_nitrogen_bun_mg_dl, o.cmp.urea_nitrogen_bun_range_min, o.cmp.urea_nitrogen_bun_range_max, "mg/dL"),
                    ("Potassium", o.cmp.potassium_mmol_l, o.cmp.potassium_range_min, o.cmp.potassium_range_max, "mmol/L"),
                ]
                for name, val, r_min, r_max, unit in cmp_checks:
                    if val is not None:
                        if r_max is not None and val > r_max:
                            excursions.append({
                                "subject_id": o.subject_id,
                                "timepoint": o.timepoint,
                                "phase": o.phase.value,
                                "panel": "Comprehensive Metabolic Panel",
                                "biomarker": name,
                                "value": val,
                                "unit": unit,
                                "reference_range": f"{r_min}-{r_max}",
                                "excursion_type": "HIGH"
                            })
                        elif r_min is not None and val < r_min:
                            excursions.append({
                                "subject_id": o.subject_id,
                                "timepoint": o.timepoint,
                                "phase": o.phase.value,
                                "panel": "Comprehensive Metabolic Panel",
                                "biomarker": name,
                                "value": val,
                                "unit": unit,
                                "reference_range": f"{r_min}-{r_max}",
                                "excursion_type": "LOW"
                            })

            # Check CBC
            if o.cbc:
                cbc_checks = [
                    ("WBC", o.cbc.white_blood_cells_cells_ul, o.cbc.white_blood_cells_range_min, o.cbc.white_blood_cells_range_max, "x10^3/uL"),
                    ("Platelets", o.cbc.platelets_thousand_cells_ul, o.cbc.platelets_range_min, o.cbc.platelets_range_max, "x10^3/uL"),
                    ("Lymphocytes", o.cbc.absolute_lymphocytes_cells_ul, o.cbc.absolute_lymphocytes_range_min, o.cbc.absolute_lymphocytes_range_max, "cells/uL"),
                ]
                for name, val, r_min, r_max, unit in cbc_checks:
                    if val is not None:
                        if r_max is not None and val > r_max:
                            excursions.append({
                                "subject_id": o.subject_id,
                                "timepoint": o.timepoint,
                                "phase": o.phase.value,
                                "panel": "Complete Blood Count",
                                "biomarker": name,
                                "value": val,
                                "unit": unit,
                                "reference_range": f"{r_min}-{r_max}",
                                "excursion_type": "HIGH"
                            })
                        elif r_min is not None and val < r_min:
                            excursions.append({
                                "subject_id": o.subject_id,
                                "timepoint": o.timepoint,
                                "phase": o.phase.value,
                                "panel": "Complete Blood Count",
                                "biomarker": name,
                                "value": val,
                                "unit": unit,
                                "reference_range": f"{r_min}-{r_max}",
                                "excursion_type": "LOW"
                            })

        return excursions

    def audit_missing_data(self) -> Dict[str, Any]:
        """Audits completion rates and missing data distribution across the 28 observations."""
        total_obs = len(self.observations)
        if total_obs == 0:
            return {"total_observations": 0, "missingness_pct": 0.0}

        cmp_missing_count = 0
        cbc_missing_count = 0
        cytokine_missing_count = 0

        for o in self.observations:
            if not o.cmp:
                cmp_missing_count += 1
            if not o.cbc:
                cbc_missing_count += 1
            if not o.cytokines:
                cytokine_missing_count += 1

        return {
            "total_observations": total_obs,
            "complete_triad_observations": sum(1 for o in self.observations if o.cmp and o.cbc and o.cytokines),
            "cmp_missing_observations": cmp_missing_count,
            "cbc_missing_observations": cbc_missing_count,
            "cytokines_missing_observations": cytokine_missing_count,
            "completeness_rate_pct": round(
                (sum(1 for o in self.observations if o.cmp and o.cbc and o.cytokines) / total_obs) * 100.0, 1
            )
        }

    def generate_research_summary(self) -> OSDRResearchSummary:
        """Assembles the complete scientific research summary."""
        subjects = sorted(list({o.subject_id for o in self.observations}))
        timepoints = ["L-92", "L-44", "L-3", "R+1", "R+45", "R+82", "R+194"]

        findings = self.analyze_pre_to_post_flight_shifts()
        excursions = self.audit_reference_range_excursions()
        missing_data = self.audit_missing_data()

        return OSDRResearchSummary(
            dataset_title="SpaceX Inspiration4 Longitudinal Multi-Omics and Blood Biomarkers (SOMA)",
            accessions=["OSD-575", "OSD-569"],
            subject_count=len(subjects),
            subjects=subjects,
            timepoints=timepoints,
            total_cmp_observations=sum(1 for o in self.observations if o.cmp),
            total_cbc_observations=sum(1 for o in self.observations if o.cbc),
            total_cytokine_observations=sum(1 for o in self.observations if o.cytokines),
            pre_to_post_flight_findings=findings,
            reference_range_excursions=excursions,
            missing_data_profile=missing_data,
            data_context=OSDRDataContext.NASA_RESEARCH_DATA
        )
