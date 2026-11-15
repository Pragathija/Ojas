from typing import List, Dict, Any, Optional
from app.models.health_record import HealthRecord
from app.models.health_baseline import HealthBaseline
from app.core.config import settings


class RuleEvaluationResult:
    def __init__(
        self,
        severity: str,
        category: str,
        title: str,
        description: str,
        recommended_action: str,
        contributing_factors: List[str]
    ):
        self.severity = severity
        self.category = category
        self.title = title
        self.description = description
        self.recommended_action = recommended_action
        self.contributing_factors = contributing_factors

    def to_dict(self) -> Dict[str, Any]:
        return {
            "severity": self.severity,
            "category": self.category,
            "title": self.title,
            "description": self.description,
            "recommended_action": self.recommended_action,
            "contributing_factors": self.contributing_factors,
        }


def evaluate_risk_rules(
    current: HealthRecord,
    baseline: Optional[HealthBaseline],
    recent_records: Optional[List[HealthRecord]] = None
) -> List[RuleEvaluationResult]:
    """
    Evaluates explainable deterministic physiological & behavioral risk rules.
    Does not make medical diagnoses; detects anomalies and mission risk indicators.
    """
    results: List[RuleEvaluationResult] = []

    # 1. COMPOUND CARDIO-RESPIRATORY STRESS
    if current.blood_oxygen <= 93.0 and current.heart_rate >= 100.0:
        results.append(RuleEvaluationResult(
            severity="CRITICAL",
            category="COMPOUND",
            title="Cardiopulmonary Strain Detected",
            description=f"Simultaneous low oxygen saturation ({current.blood_oxygen}%) and tachycardia ({current.heart_rate:.0f} BPM).",
            recommended_action="Immediately pause current activity, check cabin/suit atmospheric oxygen levels, and alert mission flight surgeon.",
            contributing_factors=[
                f"SpO2 depressed at {current.blood_oxygen}%",
                f"Heart rate elevated at {current.heart_rate:.0f} BPM"
            ]
        ))

    # 2. RESPIRATORY (SpO2)
    elif current.blood_oxygen <= settings.SPO2_CRITICAL_LOW:
        results.append(RuleEvaluationResult(
            severity="CRITICAL",
            category="RESPIRATORY",
            title="Severe Hypoxemia Telemetry",
            description=f"Blood oxygen saturation is critically low at {current.blood_oxygen}%.",
            recommended_action="Inspect environmental control and life support system (ECLSS) O2 partial pressure and initiate supplemental O2 protocol.",
            contributing_factors=[f"SpO2 below critical limit ({settings.SPO2_CRITICAL_LOW}%)"]
        ))
    elif current.blood_oxygen <= settings.SPO2_CAUTION_LOW:
        drop_note = ""
        if baseline and baseline.blood_oxygen_mean:
            delta = current.blood_oxygen - baseline.blood_oxygen_mean
            if delta <= -3.0:
                drop_note = f" (Dropped {abs(delta):.1f}% below personal baseline of {baseline.blood_oxygen_mean:.1f}%)"
        results.append(RuleEvaluationResult(
            severity="CAUTION",
            category="RESPIRATORY",
            title="Depressed Blood Oxygen Saturation",
            description=f"SpO2 reading of {current.blood_oxygen}%{drop_note} is below normal operational margin.",
            recommended_action="Check suit seal / breathing apparatus, verify cabin ventilation airflow, and re-test in 15 minutes.",
            contributing_factors=[f"SpO2 reading: {current.blood_oxygen}%"]
        ))

    # 3. CARDIOVASCULAR (Heart Rate & Blood Pressure)
    if current.heart_rate >= settings.HEART_RATE_CRITICAL_HIGH:
        results.append(RuleEvaluationResult(
            severity="CRITICAL",
            category="CARDIOVASCULAR",
            title="Critical Resting Tachycardia",
            description=f"Heart rate reached {current.heart_rate:.0f} BPM, exceeding critical mission ceiling.",
            recommended_action="Cease high-exertion tasks, rest in neutral posture, hydrate, and notify medical support.",
            contributing_factors=[f"Heart rate ({current.heart_rate:.0f} BPM) > {settings.HEART_RATE_CRITICAL_HIGH:.0f} BPM"]
        ))
    elif current.heart_rate >= settings.HEART_RATE_CAUTION_HIGH:
        results.append(RuleEvaluationResult(
            severity="CAUTION",
            category="CARDIOVASCULAR",
            title="Elevated Heart Rate",
            description=f"Heart rate elevated at {current.heart_rate:.0f} BPM.",
            recommended_action="Monitor telemetry trend; reduce physical and cognitive stressors.",
            contributing_factors=[f"Heart rate: {current.heart_rate:.0f} BPM"]
        ))
    elif current.heart_rate <= settings.HEART_RATE_CAUTION_LOW:
        results.append(RuleEvaluationResult(
            severity="CAUTION",
            category="CARDIOVASCULAR",
            title="Resting Bradycardia Alert",
            description=f"Heart rate is depressed at {current.heart_rate:.0f} BPM.",
            recommended_action="Verify sensor placement; verify whether reading occurred during deep sleep or rest.",
            contributing_factors=[f"Heart rate: {current.heart_rate:.0f} BPM"]
        ))

    # Blood Pressure checks
    if current.systolic_bp >= settings.BP_SYSTOLIC_CRITICAL_HIGH or current.diastolic_bp >= settings.BP_DIASTOLIC_CRITICAL_HIGH:
        results.append(RuleEvaluationResult(
            severity="CRITICAL",
            category="CARDIOVASCULAR",
            title="Acute Hypertensive Telemetry",
            description=f"Blood pressure reached {current.systolic_bp:.0f}/{current.diastolic_bp:.0f} mmHg.",
            recommended_action="Sit upright, rest quietly, avoid stimulants, and request medical officer check.",
            contributing_factors=[f"BP reading: {current.systolic_bp:.0f}/{current.diastolic_bp:.0f} mmHg"]
        ))
    elif current.systolic_bp >= settings.BP_SYSTOLIC_CAUTION_HIGH or current.diastolic_bp >= settings.BP_DIASTOLIC_CAUTION_HIGH:
        results.append(RuleEvaluationResult(
            severity="CAUTION",
            category="CARDIOVASCULAR",
            title="Elevated Blood Pressure",
            description=f"Blood pressure reading of {current.systolic_bp:.0f}/{current.diastolic_bp:.0f} mmHg is above nominal baseline.",
            recommended_action="Check hydration and stress levels; re-measure after 20 minutes of relaxation.",
            contributing_factors=[f"BP reading: {current.systolic_bp:.0f}/{current.diastolic_bp:.0f} mmHg"]
        ))

    # 4. THERMAL REGULATION
    if current.body_temperature >= settings.TEMP_CRITICAL_HIGH:
        results.append(RuleEvaluationResult(
            severity="CRITICAL",
            category="THERMAL",
            title="Hyperthermia / High Temperature Spike",
            description=f"Core body temperature measured at {current.body_temperature:.1f}°C.",
            recommended_action="Activate suit active liquid cooling garment (LCG), consume cool fluids, and contact flight surgeon.",
            contributing_factors=[f"Body temp: {current.body_temperature:.1f}°C"]
        ))
    elif current.body_temperature >= settings.TEMP_CAUTION_HIGH:
        results.append(RuleEvaluationResult(
            severity="CAUTION",
            category="THERMAL",
            title="Mild Pyrexia Indicator",
            description=f"Elevated body temperature measured at {current.body_temperature:.1f}°C.",
            recommended_action="Assess ambient cabin ventilation, hydrate, and log thermal symptoms.",
            contributing_factors=[f"Body temp: {current.body_temperature:.1f}°C"]
        ))
    elif current.body_temperature <= settings.TEMP_CAUTION_LOW:
        results.append(RuleEvaluationResult(
            severity="CAUTION",
            category="THERMAL",
            title="Low Body Temperature Indicator",
            description=f"Body temperature measured at {current.body_temperature:.1f}°C.",
            recommended_action="Adjust environmental thermal controls and inspect thermal garments.",
            contributing_factors=[f"Body temp: {current.body_temperature:.1f}°C"]
        ))

    # 5. SLEEP DEBT & NEURO-COGNITIVE FATIGUE
    if current.sleep_duration <= settings.SLEEP_CRITICAL_LOW and current.fatigue_level >= settings.FATIGUE_CRITICAL_HIGH:
        results.append(RuleEvaluationResult(
            severity="CRITICAL",
            category="FATIGUE_SLEEP",
            title="Acute Sleep Deprivation & Cognitive Fatigue",
            description=f"Sleep duration severely curtailed ({current.sleep_duration:.1f} hrs) combined with critical fatigue ({current.fatigue_level:.0f}/10).",
            recommended_action="Reschedule safety-critical EVA/robotic operations. Mandate protected sleep cycle.",
            contributing_factors=[
                f"Sleep duration: {current.sleep_duration:.1f} hrs",
                f"Fatigue level: {current.fatigue_level:.0f}/10"
            ]
        ))
    elif current.sleep_duration <= settings.SLEEP_CAUTION_LOW or current.fatigue_level >= settings.FATIGUE_CAUTION_HIGH:
        results.append(RuleEvaluationResult(
            severity="CAUTION",
            category="FATIGUE_SLEEP",
            title="Elevated Fatigue / Sleep Deficit",
            description=f"Sleep duration of {current.sleep_duration:.1f} hrs with elevated fatigue rating ({current.fatigue_level:.0f}/10).",
            recommended_action="Implement sleep hygiene protocols, dim cabin blue spectrum lighting, and avoid strenuous workload.",
            contributing_factors=[
                f"Sleep duration: {current.sleep_duration:.1f} hrs",
                f"Fatigue level: {current.fatigue_level:.0f}/10"
            ]
        ))

    # 6. STRESS
    if current.stress_level >= settings.STRESS_CRITICAL_HIGH:
        results.append(RuleEvaluationResult(
            severity="CRITICAL",
            category="PSYCHOPHYSIOLOGICAL",
            title="Severe Psychophysiological Stress",
            description=f"Composite stress telemetry index is acute at {current.stress_level:.0f}/100.",
            recommended_action="Engage guided autogenic breathing exercises, take mental wellness break, and consult crew support.",
            contributing_factors=[f"Stress index: {current.stress_level:.0f}/100"]
        ))
    elif current.stress_level >= settings.STRESS_CAUTION_HIGH:
        results.append(RuleEvaluationResult(
            severity="CAUTION",
            category="PSYCHOPHYSIOLOGICAL",
            title="Elevated Stress Telemetry",
            description=f"Elevated stress level detected at {current.stress_level:.0f}/100.",
            recommended_action="Initiate 10-minute mindfulness/breathing routine and pace mission tasks.",
            contributing_factors=[f"Stress index: {current.stress_level:.0f}/100"]
        ))

    return results
