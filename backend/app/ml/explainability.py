"""
OJAS Explainable AI (XAI) Health Engine.
Generates structured, evidence-based physiological assessments,
threshold evaluations, baseline comparisons, and clinical rationales.
"""

from typing import List, Dict, Any, Optional
from app.models.health_record import HealthRecord
from app.models.health_baseline import HealthBaseline
from app.health_engine.risk_rules import RuleEvaluationResult
from app.ml.temporal_analysis import TemporalAssessment
from app.ml.uncertainty import EvidenceSufficiency
from app.ml.preprocessing import FEATURE_UNITS


class MetricEvidenceCard:
    def __init__(
        self,
        metric: str,
        observed_value: float,
        unit: str,
        status: str,  # NOMINAL, CAUTION, CRITICAL
        baseline_mean: Optional[float],
        delta: Optional[float],
        z_score: Optional[float],
        clinical_bounds: str,
        rationale: str,
    ):
        self.metric = metric
        self.observed_value = observed_value
        self.unit = unit
        self.status = status
        self.baseline_mean = baseline_mean
        self.delta = delta
        self.z_score = z_score
        self.clinical_bounds = clinical_bounds
        self.rationale = rationale

    def to_dict(self) -> Dict[str, Any]:
        return {
            "metric": self.metric,
            "observed_value": self.observed_value,
            "unit": self.unit,
            "status": self.status,
            "baseline_mean": self.baseline_mean,
            "delta": self.delta,
            "z_score": self.z_score,
            "clinical_bounds": self.clinical_bounds,
            "rationale": self.rationale,
        }


def build_metric_evidence_cards(
    record: HealthRecord,
    baseline: Optional[HealthBaseline],
    baseline_deviations: Dict[str, Any]
) -> List[MetricEvidenceCard]:
    """
    Constructs an evidence card for each available vital sign.
    """
    cards: List[MetricEvidenceCard] = []

    # Map of metric configurations: (attribute, label, caution_rule, critical_rule, normal_bounds_desc)
    configs = [
        ("heart_rate", "Heart Rate", 100.0, 120.0, "50 - 100 BPM (Resting)"),
        ("blood_oxygen", "Blood Oxygen (SpO2)", 94.0, 90.0, "95% - 100%"),
        ("systolic_bp", "Systolic Blood Pressure", 140.0, 160.0, "90 - 130 mmHg"),
        ("diastolic_bp", "Diastolic Blood Pressure", 90.0, 100.0, "60 - 85 mmHg"),
        ("body_temperature", "Body Temperature", 37.8, 38.8, "36.5°C - 37.5°C"),
        ("sleep_duration", "Sleep Duration", 6.0, 4.0, "7.0 - 9.0 hrs"),
        ("stress_level", "Stress Index", 70.0, 85.0, "0 - 50 pts"),
        ("fatigue_level", "Fatigue Level", 6.5, 8.0, "1.0 - 5.0 pts"),
    ]

    for attr, label, caution_thresh, critical_thresh, bounds_str in configs:
        val = getattr(record, attr, None)
        if val is None:
            continue

        dev = baseline_deviations.get(attr, {})
        b_mean = dev.get("baseline_mean")
        delta = dev.get("delta")
        z = dev.get("z_score")
        unit = FEATURE_UNITS.get(attr, "")

        # Status evaluation
        status = "NOMINAL"
        rationale = f"{label} is within nominal operational parameters."

        if attr == "blood_oxygen":
            if val <= critical_thresh:
                status = "CRITICAL"
                rationale = f"Severe hypoxemia detected ({val:.1f}%). Below emergency safety floor ({critical_thresh}%)."
            elif val <= caution_thresh:
                status = "CAUTION"
                rationale = f"Depressed oxygen saturation ({val:.1f}%). Exceeds nominal boundary ({caution_thresh}%)."
        elif attr == "sleep_duration":
            if val <= critical_thresh:
                status = "CRITICAL"
                rationale = f"Acute sleep deficit ({val:.1f} hrs). Severely inadequate for neuro-cognitive recovery."
            elif val <= caution_thresh:
                status = "CAUTION"
                rationale = f"Sleep duration curtailed ({val:.1f} hrs) relative to 7.0 hr mission target."
        elif attr in ("heart_rate", "systolic_bp", "diastolic_bp", "body_temperature", "stress_level", "fatigue_level"):
            if val >= critical_thresh:
                status = "CRITICAL"
                rationale = f"{label} reached {val:.1f} {unit}, violating critical mission limit ({critical_thresh} {unit})."
            elif val >= caution_thresh:
                status = "CAUTION"
                rationale = f"{label} elevated at {val:.1f} {unit}, surpassing nominal caution margin ({caution_thresh} {unit})."
            elif attr == "heart_rate" and val <= 45.0:
                status = "CAUTION"
                rationale = f"Resting bradycardia observed ({val:.1f} BPM)."

        cards.append(MetricEvidenceCard(
            metric=label,
            observed_value=round(float(val), 2),
            unit=unit,
            status=status,
            baseline_mean=b_mean,
            delta=delta,
            z_score=z,
            clinical_bounds=bounds_str,
            rationale=rationale,
        ))

    return cards


def synthesize_explainable_assessment(
    record: HealthRecord,
    baseline: Optional[HealthBaseline],
    rule_results: List[RuleEvaluationResult],
    temporal_assessment: TemporalAssessment,
    uncertainty: EvidenceSufficiency,
    anomaly_metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Synthesizes the complete explainable diagnosis breakdown, linking
    vital signs, temporal trajectory, uncertainty, and actionable recommendations.
    """
    # Build baseline deviations dict
    from app.health_engine.baseline import compute_baseline_deviations
    deviations = compute_baseline_deviations(record, baseline)

    cards = build_metric_evidence_cards(record, baseline, deviations)
    critical_cards = [c for c in cards if c.status == "CRITICAL"]
    caution_cards = [c for c in cards if c.status == "CAUTION"]

    # Trajectory narrative
    trajectory_note = f"Trajectory: {temporal_assessment.trajectory} - {temporal_assessment.summary}"

    # Epistemic confidence narrative
    confidence_note = (
        f"Evidence Sufficiency: {uncertainty.overall_confidence*100:.1f}% "
        f"(Completeness: {uncertainty.feature_completeness_score*100:.0f}%, "
        f"Maturity: {uncertainty.sample_maturity_score*100:.0f}%)."
    )

    # Synthesis summary
    if critical_cards:
        primary_issue = critical_cards[0].metric
        assessment_summary = f"CRITICAL: Acute physiological strain in {primary_issue}. {trajectory_note}"
    elif caution_cards:
        primary_issue = caution_cards[0].metric
        assessment_summary = f"CAUTION: Elevated risk detected in {primary_issue}. {trajectory_note}"
    else:
        assessment_summary = f"NOMINAL: Astronaut vitals are stable and within nominal flight limits. {trajectory_note}"

    return {
        "summary": assessment_summary,
        "evidence_cards": [c.to_dict() for c in cards],
        "temporal_trajectory": temporal_assessment.to_dict(),
        "uncertainty": uncertainty.to_dict(),
        "confidence_note": confidence_note,
        "anomaly_metadata": anomaly_metadata or {},
    }
