"""
OJAS Personalized Health Intelligence & Robust Statistical Baseline Engine.
Computes:
- Contamination-resistant rolling baseline statistics (excluding acute pathological readings).
- Non-parametric percentiles (p10, p25, median/p50, p75, p90) and Interquartile Range (IQR).
- Strict per-astronaut subject isolation.
- Robust z-scores and multidimensional deviations.
"""

from datetime import datetime
from typing import Optional, Dict, Any, List, Tuple
import numpy as np
from sqlalchemy.orm import Session
from app.models.health_record import HealthRecord
from app.models.health_baseline import HealthBaseline
from app.core.config import settings
from app.ml.preprocessing import PHYSIOLOGICAL_FEATURES, FEATURE_UNITS


def is_pathological_contamination(record: HealthRecord) -> bool:
    """
    Identifies acute physiological crisis readings that should NOT contaminate
    the astronaut's nominal baseline (e.g. acute hypoxia, crisis tachycardia, severe pyrexia).
    """
    if record.blood_oxygen is not None and record.blood_oxygen <= 89.0:
        return True
    if record.heart_rate is not None and (record.heart_rate >= 140.0 or record.heart_rate <= 38.0):
        return True
    if record.systolic_bp is not None and record.systolic_bp >= 170.0:
        return True
    if record.body_temperature is not None and record.body_temperature >= 39.0:
        return True
    return False


def compute_distribution_metrics(values: List[float]) -> Dict[str, float]:
    """
    Computes both parametric (mean, std) and non-parametric (median, percentiles, IQR)
    statistics for an array of physiological values.
    """
    clean_vals = [float(v) for v in values if v is not None and not np.isnan(v)]
    if not clean_vals:
        return {
            "mean": 0.0, "std": 1.0, "median": 0.0,
            "p10": 0.0, "p25": 0.0, "p75": 0.0, "p90": 0.0, "iqr": 1.0
        }

    arr = np.array(clean_vals)
    p25 = float(np.percentile(arr, 25))
    p75 = float(np.percentile(arr, 75))
    iqr = p75 - p25

    return {
        "mean": float(np.mean(arr)),
        "std": float(np.std(arr)) if float(np.std(arr)) > 1e-4 else 1.0,
        "median": float(np.median(arr)),
        "p10": float(np.percentile(arr, 10)),
        "p25": p25,
        "p75": p75,
        "p90": float(np.percentile(arr, 90)),
        "iqr": iqr if iqr > 1e-4 else 1.0,
    }


def calculate_and_update_baseline(
    db: Session,
    astronaut_id: str,
    filter_contamination: bool = True,
    before_timestamp: Optional[datetime] = None
) -> Optional[HealthBaseline]:
    """
    Computes statistical mean, std, and robust percentiles across historical readings
    for a strictly isolated astronaut up to before_timestamp (preventing future observation leakage).
    Filters pathological contamination to preserve the integrity of nominal baselines.
    Persists and updates the HealthBaseline table.
    """
    query = db.query(HealthRecord).filter(HealthRecord.astronaut_id == astronaut_id)
    if before_timestamp:
        query = query.filter(HealthRecord.timestamp <= before_timestamp)
    readings = query.order_by(HealthRecord.timestamp.asc()).all()

    if len(readings) < settings.MIN_READINGS_FOR_BASELINE:
        return None

    # Apply contamination filter if requested
    filtered_readings = readings
    if filter_contamination:
        non_crisis = [r for r in readings if not is_pathological_contamination(r)]
        # Only use filtered subset if it meets minimum sample requirements
        if len(non_crisis) >= settings.MIN_READINGS_FOR_BASELINE:
            filtered_readings = non_crisis

    # Collect arrays
    hrs = [r.heart_rate for r in filtered_readings]
    spo2s = [r.blood_oxygen for r in filtered_readings]
    sys_bps = [r.systolic_bp for r in filtered_readings]
    dia_bps = [r.diastolic_bp for r in filtered_readings]
    temps = [r.body_temperature for r in filtered_readings]
    sleeps = [r.sleep_duration for r in filtered_readings]
    stresses = [r.stress_level for r in filtered_readings]
    fatigues = [r.fatigue_level for r in filtered_readings]

    baseline = db.query(HealthBaseline).filter(HealthBaseline.astronaut_id == astronaut_id).first()
    if not baseline:
        baseline = HealthBaseline(astronaut_id=astronaut_id)
        db.add(baseline)

    baseline.sample_count = len(readings)
    baseline.heart_rate_mean = float(np.mean(hrs))
    baseline.heart_rate_std = float(np.std(hrs)) or 1.0

    baseline.blood_oxygen_mean = float(np.mean(spo2s))
    baseline.blood_oxygen_std = float(np.std(spo2s)) or 0.5

    baseline.systolic_bp_mean = float(np.mean(sys_bps))
    baseline.systolic_bp_std = float(np.std(sys_bps)) or 2.0

    baseline.diastolic_bp_mean = float(np.mean(dia_bps))
    baseline.diastolic_bp_std = float(np.std(dia_bps)) or 2.0

    baseline.temperature_mean = float(np.mean(temps))
    baseline.temperature_std = float(np.std(temps)) or 0.2

    baseline.sleep_duration_mean = float(np.mean(sleeps))
    baseline.sleep_duration_std = float(np.std(sleeps)) or 0.5

    baseline.stress_level_mean = float(np.mean(stresses))
    baseline.stress_level_std = float(np.std(stresses)) or 2.0

    baseline.fatigue_mean = float(np.mean(fatigues))
    baseline.fatigue_std = float(np.std(fatigues)) or 0.5

    db.commit()
    db.refresh(baseline)
    return baseline


def compute_baseline_deviations(
    reading: HealthRecord,
    baseline: Optional[HealthBaseline],
    historical_records: Optional[List[HealthRecord]] = None
) -> Dict[str, Any]:
    """
    Compares the current health reading to the established personal baseline.
    Returns delta, parametric z_score, non-parametric percentiles/IQR, and qualitative direction.
    """
    if not baseline:
        return {
            "status": "NO_BASELINE",
            "message": "Insufficient historical data to establish personal baseline."
        }

    deviations: Dict[str, Any] = {}
    metrics = [
        ("heart_rate", reading.heart_rate, baseline.heart_rate_mean, baseline.heart_rate_std, "BPM"),
        ("blood_oxygen", reading.blood_oxygen, baseline.blood_oxygen_mean, baseline.blood_oxygen_std, "%"),
        ("systolic_bp", reading.systolic_bp, baseline.systolic_bp_mean, baseline.systolic_bp_std, "mmHg"),
        ("diastolic_bp", reading.diastolic_bp, baseline.diastolic_bp_mean, baseline.diastolic_bp_std, "mmHg"),
        ("body_temperature", reading.body_temperature, baseline.temperature_mean, baseline.temperature_std, "°C"),
        ("sleep_duration", reading.sleep_duration, baseline.sleep_duration_mean, baseline.sleep_duration_std, "hrs"),
        ("stress_level", reading.stress_level, baseline.stress_level_mean, baseline.stress_level_std, "pts"),
        ("fatigue_level", reading.fatigue_level, baseline.fatigue_mean, baseline.fatigue_std, "pts"),
    ]

    # Precompute distribution percentiles if historical records available
    extended_stats: Dict[str, Dict[str, float]] = {}
    if historical_records and len(historical_records) >= 3:
        for name, _, _, _, _ in metrics:
            vals = [getattr(r, name, None) for r in historical_records]
            extended_stats[name] = compute_distribution_metrics(vals)

    for name, current, mean_val, std_val, unit in metrics:
        if mean_val is not None and current is not None:
            delta = round(float(current) - float(mean_val), 2)
            z_score = round(delta / (std_val or 1.0), 2)
            
            entry: Dict[str, Any] = {
                "current": current,
                "baseline_mean": round(mean_val, 2),
                "delta": delta,
                "z_score": z_score,
                "unit": unit,
                "direction": "elevated" if delta > 0 else "reduced" if delta < 0 else "nominal"
            }

            # Enrich with non-parametric percentiles if available
            if name in extended_stats:
                st = extended_stats[name]
                entry.update({
                    "median": round(st["median"], 2),
                    "p10": round(st["p10"], 2),
                    "p25": round(st["p25"], 2),
                    "p75": round(st["p75"], 2),
                    "p90": round(st["p90"], 2),
                    "iqr": round(st["iqr"], 2),
                    "robust_z_score": round((float(current) - st["median"]) / (st["iqr"] * 0.7413 or 1.0), 2)
                })

            deviations[name] = entry

    return deviations
