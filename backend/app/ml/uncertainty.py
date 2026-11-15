"""
OJAS Epistemic Uncertainty & Evidence Sufficiency Engine.
Strictly separates clinical risk severity from epistemic/aleatoric confidence.
Evaluates:
- Telemetry completeness ratio.
- Baseline sample maturity.
- Sensor data staleness / recency.
- Out-of-Distribution (OOD) distance.
- Overall evidence sufficiency score (0.0 to 1.0).
"""

from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
import numpy as np
from app.models.health_record import HealthRecord
from app.models.health_baseline import HealthBaseline
from app.core.config import settings
from app.ml.preprocessing import validate_reading_quality, VALID_PHYSIOLOGICAL_RANGES


class EvidenceSufficiency:
    def __init__(
        self,
        overall_confidence: float,
        feature_completeness_score: float,
        sample_maturity_score: float,
        sensor_recency_score: float,
        is_out_of_distribution: bool,
        ood_reasons: List[str],
        data_quality_warnings: List[str],
    ):
        self.overall_confidence = overall_confidence
        self.feature_completeness_score = feature_completeness_score
        self.sample_maturity_score = sample_maturity_score
        self.sensor_recency_score = sensor_recency_score
        self.is_out_of_distribution = is_out_of_distribution
        self.ood_reasons = ood_reasons
        self.data_quality_warnings = data_quality_warnings

    def to_dict(self) -> Dict[str, Any]:
        return {
            "overall_confidence": self.overall_confidence,
            "feature_completeness_score": self.feature_completeness_score,
            "sample_maturity_score": self.sample_maturity_score,
            "sensor_recency_score": self.sensor_recency_score,
            "is_out_of_distribution": self.is_out_of_distribution,
            "ood_reasons": self.ood_reasons,
            "data_quality_warnings": self.data_quality_warnings,
        }


def calculate_evidence_sufficiency(
    record: HealthRecord,
    historical_count: int,
    baseline: Optional[HealthBaseline] = None
) -> EvidenceSufficiency:
    """
    Computes rigorous evidence sufficiency and uncertainty metrics.
    Does NOT calculate medical diagnosis probability; scores observational reliability.
    """
    warnings: List[str] = []
    ood_reasons: List[str] = []

    # 1. Feature completeness
    quality = validate_reading_quality(record)
    completeness = quality["completeness_ratio"]
    if quality["missing_features"]:
        warnings.append(f"Missing features: {', '.join(quality['missing_features'])}.")
    if quality["out_of_range_features"]:
        warnings.append(f"Implausible sensor readings: {', '.join(quality['out_of_range_features'].keys())}.")

    # 2. Sample maturity (scales to 1.0 at MIN_READINGS_FOR_ML_ANOMALY)
    target_samples = max(20, settings.MIN_READINGS_FOR_ML_ANOMALY)
    maturity = round(min(1.0, max(0.0, historical_count / target_samples)), 3)
    if maturity < 0.5:
        warnings.append(f"Immature astronaut baseline ({historical_count}/{target_samples} samples).")

    # 3. Sensor recency
    recency_score = 1.0
    if record.timestamp:
        t = record.timestamp
        if t.tzinfo is None:
            t = t.replace(tzinfo=timezone.utc)
        age_hours = (datetime.now(timezone.utc) - t).total_seconds() / 3600.0
        if age_hours > 48.0:
            recency_score = 0.5
            warnings.append(f"Telemetry is stale ({age_hours:.1f} hours old).")
        elif age_hours > 12.0:
            recency_score = 0.8
            warnings.append(f"Telemetry latency detected ({age_hours:.1f} hours old).")

    # 4. Out-of-Distribution (OOD) check
    is_ood = False
    # Check baseline z-scores if baseline exists
    if baseline:
        checks = [
            ("heart_rate", record.heart_rate, baseline.heart_rate_mean, baseline.heart_rate_std),
            ("blood_oxygen", record.blood_oxygen, baseline.blood_oxygen_mean, baseline.blood_oxygen_std),
            ("systolic_bp", record.systolic_bp, baseline.systolic_bp_mean, baseline.systolic_bp_std),
            ("body_temperature", record.body_temperature, baseline.temperature_mean, baseline.temperature_std),
        ]
        for name, val, b_mean, b_std in checks:
            if val is not None and b_mean is not None and b_std:
                z = abs(val - b_mean) / b_std
                if z >= 4.0:
                    is_ood = True
                    ood_reasons.append(f"{name} z-score ({z:.1f}) exceeds 4.0 standard deviations from personal baseline.")

    # 5. Composite Confidence Score
    # Weights: Completeness (40%), Maturity (40%), Recency (20%)
    overall = (completeness * 0.40) + (maturity * 0.40) + (recency_score * 0.20)
    if is_ood:
        # Slight penalty to confidence due to distribution uncertainty
        overall = max(0.2, overall * 0.85)

    overall_confidence = round(float(overall), 3)

    return EvidenceSufficiency(
        overall_confidence=overall_confidence,
        feature_completeness_score=completeness,
        sample_maturity_score=maturity,
        sensor_recency_score=round(recency_score, 3),
        is_out_of_distribution=is_ood,
        ood_reasons=ood_reasons,
        data_quality_warnings=warnings,
    )
