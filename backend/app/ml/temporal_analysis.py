"""
OJAS Dedicated Temporal Deterioration & Trend Analysis Module.
Provides:
- Consecutive abnormality tracking.
- Rate-of-change estimation (with observation gap safety).
- Simple (SMA) and Exponential Moving Averages (EMA).
- Dynamic physiological trajectory classification:
  * SINGLE_SPIKE
  * REPEATED_DEVIATION
  * GRADUAL_DETERIORATION
  * CHRONIC_PERSISTENT
  * RECOVERY_TREND
  * STABLE_NOMINAL
"""

from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from app.models.health_record import HealthRecord

MAX_GAP_HOURS_FOR_CONTINUOUS_RATE = 4.0  # Threshold to suppress false derivatives


class TemporalAssessment:
    def __init__(
        self,
        trajectory: str,
        consecutive_abnormalities: int,
        persistent_shift_detected: bool,
        vital_trends: Dict[str, Dict[str, Any]],
        observation_gap_hours: Optional[float],
        summary: str,
    ):
        self.trajectory = trajectory
        self.consecutive_abnormalities = consecutive_abnormalities
        self.persistent_shift_detected = persistent_shift_detected
        self.vital_trends = vital_trends
        self.observation_gap_hours = observation_gap_hours
        self.summary = summary

    def to_dict(self) -> Dict[str, Any]:
        return {
            "trajectory": self.trajectory,
            "consecutive_abnormalities": self.consecutive_abnormalities,
            "persistent_shift_detected": self.persistent_shift_detected,
            "vital_trends": self.vital_trends,
            "observation_gap_hours": self.observation_gap_hours,
            "summary": self.summary,
        }


def compute_ema(series: List[float], alpha: float = 0.3) -> List[float]:
    """Calculates Exponential Moving Average across a 1D sequence."""
    if not series:
        return []
    ema = [series[0]]
    for val in series[1:]:
        ema.append(alpha * val + (1.0 - alpha) * ema[-1])
    return ema


def compute_sma(series: List[float], window: int = 3) -> List[float]:
    """Calculates Simple Moving Average across a 1D sequence."""
    if not series:
        return []
    sma = []
    for i in range(len(series)):
        start = max(0, i - window + 1)
        chunk = series[start:i + 1]
        sma.append(float(np.mean(chunk)))
    return sma


def analyze_vital_trend(
    records: List[HealthRecord],
    metric_name: str,
    baseline_mean: Optional[float] = None
) -> Dict[str, Any]:
    """
    Computes moving averages, velocity (rate of change), and direction for a specific vital metric.
    """
    values = [getattr(r, metric_name, None) for r in records if getattr(r, metric_name, None) is not None]
    if len(values) < 2:
        return {
            "sma_3": values[-1] if values else None,
            "ema_03": values[-1] if values else None,
            "rate_of_change_per_hour": None,
            "direction": "insufficient_data",
            "is_monotonic_deteriorating": False
        }

    sma = compute_sma(values, window=3)
    ema = compute_ema(values, alpha=0.3)

    # Time delta between last two readings
    t_last = records[-1].timestamp
    t_prev = records[-2].timestamp
    gap_hours = None
    rate_of_change = None

    if t_last and t_prev:
        # Normalize timezone awareness
        if t_last.tzinfo is None:
            t_last = t_last.replace(tzinfo=timezone.utc)
        if t_prev.tzinfo is None:
            t_prev = t_prev.replace(tzinfo=timezone.utc)

        dt_seconds = abs((t_last - t_prev).total_seconds())
        gap_hours = round(dt_seconds / 3600.0, 2)

        if 0 < gap_hours <= MAX_GAP_HOURS_FOR_CONTINUOUS_RATE:
            delta_val = float(values[-1] - values[-2])
            rate_of_change = round(delta_val / gap_hours, 2)

    # Check monotonic trend over last 3 readings if available
    is_deteriorating = False
    if len(values) >= 3:
        v0, v1, v2 = values[-3], values[-2], values[-1]
        if metric_name == "blood_oxygen":
            # Declining oxygen is deteriorating
            is_deteriorating = (v0 > v1 > v2)
        elif metric_name in ("heart_rate", "systolic_bp", "stress_level", "fatigue_level"):
            # Increasing values indicate worsening
            is_deteriorating = (v0 < v1 < v2)

    # Direction relative to previous reading
    diff = values[-1] - values[-2]
    direction = "rising" if diff > 0.5 else "falling" if diff < -0.5 else "stable"

    return {
        "current": values[-1],
        "sma_3": round(sma[-1], 2),
        "ema_03": round(ema[-1], 2),
        "rate_of_change_per_hour": rate_of_change,
        "observation_gap_hours": gap_hours,
        "direction": direction,
        "is_monotonic_deteriorating": is_deteriorating
    }


def classify_temporal_trajectory(
    records: List[HealthRecord],
    baseline_mean_spo2: Optional[float] = 98.0,
    baseline_mean_hr: Optional[float] = 70.0
) -> TemporalAssessment:
    """
    Evaluates historical readings sequence (ordered chronologically)
    and classifies overall clinical/operational trajectory.
    """
    if not records:
        return TemporalAssessment(
            trajectory="STABLE_NOMINAL",
            consecutive_abnormalities=0,
            persistent_shift_detected=False,
            vital_trends={},
            observation_gap_hours=None,
            summary="No historical readings available for temporal sequence evaluation."
        )

    # Order records chronologically with normalized timezone awareness
    def _normalize_dt(r: HealthRecord) -> datetime:
        if not r.timestamp:
            return datetime.min.replace(tzinfo=timezone.utc)
        t = r.timestamp
        return t if t.tzinfo is not None else t.replace(tzinfo=timezone.utc)

    sorted_records = sorted(records, key=_normalize_dt)
    recent_window = sorted_records[-10:]  # Inspect up to 10 most recent readings

    # Check observation gap between latest two readings
    gap_hours = None
    if len(sorted_records) >= 2:
        t_last = sorted_records[-1].timestamp
        t_prev = sorted_records[-2].timestamp
        if t_last and t_prev:
            if t_last.tzinfo is None:
                t_last = t_last.replace(tzinfo=timezone.utc)
            if t_prev.tzinfo is None:
                t_prev = t_prev.replace(tzinfo=timezone.utc)
            gap_hours = round(abs((t_last - t_prev).total_seconds()) / 3600.0, 2)

    # Vital trends
    vital_trends = {
        "heart_rate": analyze_vital_trend(recent_window, "heart_rate", baseline_mean_hr),
        "blood_oxygen": analyze_vital_trend(recent_window, "blood_oxygen", baseline_mean_spo2),
        "systolic_bp": analyze_vital_trend(recent_window, "systolic_bp"),
        "body_temperature": analyze_vital_trend(recent_window, "body_temperature"),
        "stress_level": analyze_vital_trend(recent_window, "stress_level"),
    }

    # Evaluate abnormality flags per reading in window
    def is_abnormal(r: HealthRecord) -> bool:
        if r.blood_oxygen is not None and r.blood_oxygen <= 94.0:
            return True
        if r.heart_rate is not None and (r.heart_rate >= 100.0 or r.heart_rate <= 50.0):
            return True
        if r.systolic_bp is not None and r.systolic_bp >= 140.0:
            return True
        if r.body_temperature is not None and (r.body_temperature >= 38.0 or r.body_temperature <= 35.5):
            return True
        if r.fatigue_level is not None and r.fatigue_level >= 7.5:
            return True
        return False

    abnormal_mask = [is_abnormal(r) for r in recent_window]

    # Calculate consecutive abnormalities at the tail of the sequence
    consecutive_abnormalities = 0
    for flag in reversed(abnormal_mask):
        if flag:
            consecutive_abnormalities += 1
        else:
            break

    # Check for persistent shift (5+ abnormal readings in the window)
    persistent_shift = sum(abnormal_mask) >= 5

    # Check for gradual monotonic deterioration in oxygen or heart rate
    spo2_trend = vital_trends.get("blood_oxygen", {})
    hr_trend = vital_trends.get("heart_rate", {})
    is_gradual_deterioration = (
        spo2_trend.get("is_monotonic_deteriorating", False) or
        hr_trend.get("is_monotonic_deteriorating", False)
    )

    # Check recovery trend: previous was abnormal, current is returning toward baseline
    is_recovery = False
    if len(recent_window) >= 2:
        was_abnormal_prev = abnormal_mask[-2] if len(abnormal_mask) >= 2 else False
        is_curr_normal = not abnormal_mask[-1]
        if was_abnormal_prev and is_curr_normal:
            is_recovery = True

    # Trajectory Classification Logic
    if is_recovery:
        trajectory = "RECOVERY_TREND"
        summary = "Physiological vitals returning toward nominal operational baseline after recent excursion."
    elif persistent_shift:
        trajectory = "CHRONIC_PERSISTENT"
        summary = f"Sustained physiological deviation detected across {sum(abnormal_mask)} of the last {len(recent_window)} readings."
    elif is_gradual_deterioration and consecutive_abnormalities >= 2:
        trajectory = "GRADUAL_DETERIORATION"
        summary = "Monotonic progressive deterioration observed across recent consecutive telemetry samples."
    elif consecutive_abnormalities >= 2:
        trajectory = "REPEATED_DEVIATION"
        summary = f"Multiple consecutive abnormal telemetry readings ({consecutive_abnormalities} in sequence)."
    elif consecutive_abnormalities == 1:
        trajectory = "SINGLE_SPIKE"
        summary = "Isolated abnormal telemetry reading preceded by nominal baseline; potential transient excursion or sensor artifact."
    else:
        trajectory = "STABLE_NOMINAL"
        summary = "Temporal sequence confirms stable vitals within nominal flight limits."

    return TemporalAssessment(
        trajectory=trajectory,
        consecutive_abnormalities=consecutive_abnormalities,
        persistent_shift_detected=persistent_shift,
        vital_trends=vital_trends,
        observation_gap_hours=gap_hours,
        summary=summary
    )
