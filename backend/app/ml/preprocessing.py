"""
OJAS Health Telemetry Preprocessing and Data Quality Verification Module.
Handles sensor validation, missing data masking, robust feature scaling,
and zero-imputation prevention.
"""

from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from app.models.health_record import HealthRecord

PHYSIOLOGICAL_FEATURES = [
    "heart_rate",
    "blood_oxygen",
    "systolic_bp",
    "diastolic_bp",
    "body_temperature",
    "sleep_duration",
    "sleep_quality",
    "stress_level",
    "fatigue_level",
]

# Clinically plausible operational boundaries
VALID_PHYSIOLOGICAL_RANGES: Dict[str, Tuple[float, float]] = {
    "heart_rate": (30.0, 250.0),
    "blood_oxygen": (50.0, 100.0),
    "systolic_bp": (50.0, 260.0),
    "diastolic_bp": (30.0, 160.0),
    "body_temperature": (30.0, 45.0),
    "sleep_duration": (0.0, 24.0),
    "sleep_quality": (0.0, 100.0),
    "stress_level": (0.0, 100.0),
    "fatigue_level": (1.0, 10.0),
}

FEATURE_UNITS: Dict[str, str] = {
    "heart_rate": "BPM",
    "blood_oxygen": "%",
    "systolic_bp": "mmHg",
    "diastolic_bp": "mmHg",
    "body_temperature": "°C",
    "sleep_duration": "hrs",
    "sleep_quality": "pts",
    "stress_level": "pts",
    "fatigue_level": "pts",
}


def validate_reading_quality(record: HealthRecord) -> Dict[str, Any]:
    """
    Validates sensor reading plausibility and identifies missing or out-of-range values.
    NEVER imputes zeroes into missing vital signals.
    """
    valid_features: Dict[str, float] = {}
    missing_features: List[str] = []
    out_of_range_features: Dict[str, float] = {}

    for feature in PHYSIOLOGICAL_FEATURES:
        val = getattr(record, feature, None)
        if val is None:
            missing_features.append(feature)
            continue

        try:
            val_float = float(val)
            if np.isnan(val_float) or np.isinf(val_float):
                missing_features.append(feature)
                continue
        except (ValueError, TypeError):
            missing_features.append(feature)
            continue

        # Check plausible physiological bounds
        min_bound, max_bound = VALID_PHYSIOLOGICAL_RANGES[feature]
        if min_bound <= val_float <= max_bound:
            valid_features[feature] = val_float
        else:
            out_of_range_features[feature] = val_float

    # Blood pressure ratio consistency
    bp_ratio_valid = True
    if "systolic_bp" in valid_features and "diastolic_bp" in valid_features:
        if valid_features["diastolic_bp"] >= valid_features["systolic_bp"]:
            bp_ratio_valid = False
            out_of_range_features["diastolic_bp"] = valid_features.pop("diastolic_bp")

    total_expected = len(PHYSIOLOGICAL_FEATURES)
    completeness_ratio = round(len(valid_features) / total_expected, 3)

    return {
        "is_valid": len(out_of_range_features) == 0 and completeness_ratio >= 0.5 and bp_ratio_valid,
        "completeness_ratio": completeness_ratio,
        "valid_features": valid_features,
        "missing_features": missing_features,
        "out_of_range_features": out_of_range_features,
        "bp_ratio_valid": bp_ratio_valid,
    }


def extract_masked_feature_vector(
    record: HealthRecord,
    feature_names: Optional[List[str]] = None
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Extracts feature vector with an explicit binary mask (1.0 for observed, 0.0 for missing/invalid).
    Missing values are filled with NaN (NOT zero) to prevent false physiological inference.
    """
    features = feature_names or PHYSIOLOGICAL_FEATURES
    values: List[float] = []
    mask: List[float] = []

    for name in features:
        val = getattr(record, name, None)
        if val is None:
            values.append(np.nan)
            mask.append(0.0)
        else:
            try:
                val_float = float(val)
                if np.isnan(val_float) or np.isinf(val_float):
                    values.append(np.nan)
                    mask.append(0.0)
                    continue
                min_b, max_b = VALID_PHYSIOLOGICAL_RANGES.get(name, (-np.inf, np.inf))
                if min_b <= val_float <= max_b:
                    values.append(val_float)
                    mask.append(1.0)
                else:
                    values.append(np.nan)
                    mask.append(0.0)
            except (ValueError, TypeError):
                values.append(np.nan)
                mask.append(0.0)

    return np.array(values, dtype=np.float64), np.array(mask, dtype=np.float64)


def robust_scale_features(
    X: np.ndarray,
    medians: Optional[np.ndarray] = None,
    iqrs: Optional[np.ndarray] = None
) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Scales features using median and interquartile range (IQR):
    scaled_x = (x - median) / IQR.
    Resistant to outlier skew and preserves relative variance across physiological dimensions.
    """
    if X.ndim == 1:
        X = X.reshape(1, -1)

    if medians is None:
        medians = np.nanmedian(X, axis=0)
    if iqrs is None:
        p75 = np.nanpercentile(X, 75, axis=0)
        p25 = np.nanpercentile(X, 25, axis=0)
        iqrs = p75 - p25
        # Floor zero or NaN IQRs to 1.0 to prevent division by zero
        iqrs = np.where(np.isnan(iqrs) | (iqrs <= 1e-6), 1.0, iqrs)

    scaled = (X - medians) / iqrs
    return scaled, medians, iqrs
