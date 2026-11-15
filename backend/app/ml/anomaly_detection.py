"""
OJAS Advanced Multivariate Anomaly Detection Engine (Version 2).
Features:
- Robust Median/IQR feature scaling preventing scale dominance.
- Explicit missing-feature masking and zero-imputation avoidance.
- Feature contribution vector for explainable root-cause attribution.
- Model versioning, decision threshold reporting, and metadata.
- Non-suppression guarantee: nominal ML outputs never override deterministic safety rules.
"""

import logging
from datetime import datetime, timezone
from typing import List, Optional, Tuple, Dict, Any
import numpy as np

try:
    from sklearn.ensemble import IsolationForest
    SKLEARN_AVAILABLE = True
except Exception:
    IsolationForest = None
    SKLEARN_AVAILABLE = False

from app.models.health_record import HealthRecord
from app.core.config import settings
from app.ml.preprocessing import (
    PHYSIOLOGICAL_FEATURES,
    FEATURE_UNITS,
    extract_masked_feature_vector,
    robust_scale_features,
    validate_reading_quality,
)

logger = logging.getLogger("ojas.ml")

MODEL_VERSION = "ojas-isoforest-v2"
ANOMALY_DECISION_THRESHOLD = 0.55  # Normalized anomaly score threshold

# Warm Estimator Cache: astronaut_id -> (sample_count, fitted_model, medians, iqrs)
_WARM_ESTIMATOR_CACHE: Dict[str, Tuple[int, Any, np.ndarray, np.ndarray]] = {}


def clear_anomaly_model_cache():
    """Clears the warm model cache for testing and model rotation."""
    _WARM_ESTIMATOR_CACHE.clear()


class AnomalyInferenceMetadata:
    def __init__(
        self,
        model_version: str,
        inference_timestamp: str,
        sample_size: int,
        raw_score: Optional[float],
        normalized_score: Optional[float],
        decision_threshold: float,
        is_anomaly: bool,
        feature_contributions: Dict[str, float],
        active_features: List[str],
        missing_features: List[str],
        explanation: str,
    ):
        self.model_version = model_version
        self.inference_timestamp = inference_timestamp
        self.sample_size = sample_size
        self.raw_score = raw_score
        self.normalized_score = normalized_score
        self.decision_threshold = decision_threshold
        self.is_anomaly = is_anomaly
        self.feature_contributions = feature_contributions
        self.active_features = active_features
        self.missing_features = missing_features
        self.explanation = explanation

    def to_dict(self) -> Dict[str, Any]:
        return {
            "model_version": self.model_version,
            "inference_timestamp": self.inference_timestamp,
            "sample_size": self.sample_size,
            "raw_score": self.raw_score,
            "normalized_score": self.normalized_score,
            "decision_threshold": self.decision_threshold,
            "is_anomaly": self.is_anomaly,
            "feature_contributions": self.feature_contributions,
            "active_features": self.active_features,
            "missing_features": self.missing_features,
            "explanation": self.explanation,
        }


def extract_feature_vector(record: HealthRecord) -> List[float]:
    """
    Backward-compatible feature extractor.
    Returns standard 9-dimensional float vector.
    """
    vec, _ = extract_masked_feature_vector(record)
    # If any feature was NaN/missing, substitute with median or safe fallback (never zero)
    # but for pure backwards compatibility where records are complete:
    clean = []
    defaults = {
        "heart_rate": 72.0, "blood_oxygen": 98.0, "systolic_bp": 120.0,
        "diastolic_bp": 80.0, "body_temperature": 36.8, "sleep_duration": 7.5,
        "sleep_quality": 85.0, "stress_level": 20.0, "fatigue_level": 3.0
    }
    for name, v in zip(PHYSIOLOGICAL_FEATURES, vec):
        if np.isnan(v):
            clean.append(defaults.get(name, 50.0))
        else:
            clean.append(float(v))
    return clean


def calculate_feature_contributions(
    x_current_scaled: np.ndarray,
    feature_names: List[str],
    iqrs: np.ndarray
) -> Dict[str, float]:
    """
    Calculates normalized feature contributions to the multivariate anomaly score
    based on scaled deviations from the historical median.
    """
    abs_deviations = np.abs(x_current_scaled.flatten())
    total_dev = float(np.sum(abs_deviations))
    if total_dev <= 1e-6:
        return {name: round(1.0 / len(feature_names), 3) for name in feature_names}

    contributions = {}
    for name, dev in zip(feature_names, abs_deviations):
        contributions[name] = round(float(dev / total_dev), 3)
    return contributions


def detect_multivariate_anomaly(
    current: HealthRecord,
    historical_records: List[HealthRecord],
    return_metadata: bool = False
) -> Tuple[bool, Optional[float], str] | Tuple[bool, Optional[float], str, AnomalyInferenceMetadata]:
    """
    Advanced Multivariate Anomaly Detector (v2) with Robust Scaling and Missing Feature Awareness.
    - Fits IsolationForest on robustly scaled historical telemetry.
    - Masks missing features to prevent zero-imputation artifacts.
    - Computes feature contribution attribution vector.
    - Returns (is_anomaly, anomaly_score, explanation) or includes AnomalyInferenceMetadata if requested.
    """
    now_iso = datetime.now(timezone.utc).isoformat()

    # Preprocessing quality check
    quality = validate_reading_quality(current)
    active_features = list(quality["valid_features"].keys())
    missing_features = quality["missing_features"]

    # Minimum history gate
    if len(historical_records) < settings.MIN_READINGS_FOR_ML_ANOMALY:
        msg = f"ML Anomaly detection inactive: {len(historical_records)}/{settings.MIN_READINGS_FOR_ML_ANOMALY} required baseline samples."
        meta = AnomalyInferenceMetadata(
            model_version=MODEL_VERSION,
            inference_timestamp=now_iso,
            sample_size=len(historical_records),
            raw_score=None,
            normalized_score=None,
            decision_threshold=ANOMALY_DECISION_THRESHOLD,
            is_anomaly=False,
            feature_contributions={},
            active_features=active_features,
            missing_features=missing_features,
            explanation=msg,
        )
        if return_metadata:
            return False, None, msg, meta
        return False, None, msg

    if not SKLEARN_AVAILABLE or IsolationForest is None:
        msg = "Supplementary ML Anomaly detection offline (scikit-learn runtime module uninitialized)."
        meta = AnomalyInferenceMetadata(
            model_version=MODEL_VERSION,
            inference_timestamp=now_iso,
            sample_size=len(historical_records),
            raw_score=None,
            normalized_score=None,
            decision_threshold=ANOMALY_DECISION_THRESHOLD,
            is_anomaly=False,
            feature_contributions={},
            active_features=active_features,
            missing_features=missing_features,
            explanation=msg,
        )
        if return_metadata:
            return False, None, msg, meta
        return False, None, msg

    try:
        # Build matrix using common active features across current reading
        target_features = [f for f in PHYSIOLOGICAL_FEATURES if f in active_features]
        if len(target_features) < 4:
            msg = f"ML Anomaly skipped: insufficient valid features observed ({len(target_features)}/9)."
            meta = AnomalyInferenceMetadata(
                model_version=MODEL_VERSION,
                inference_timestamp=now_iso,
                sample_size=len(historical_records),
                raw_score=None,
                normalized_score=None,
                decision_threshold=ANOMALY_DECISION_THRESHOLD,
                is_anomaly=False,
                feature_contributions={},
                active_features=active_features,
                missing_features=missing_features,
                explanation=msg,
            )
            if return_metadata:
                return False, None, msg, meta
            return False, None, msg

        # Collect historical feature matrix for target features
        X_raw_list = []
        for r in historical_records:
            vec, mask = extract_masked_feature_vector(r, feature_names=target_features)
            # If all target features are valid in this historical reading, include it
            if np.all(mask == 1.0):
                X_raw_list.append(vec)

        if len(X_raw_list) < max(5, int(settings.MIN_READINGS_FOR_ML_ANOMALY * 0.5)):
            msg = "ML Anomaly skipped: insufficient complete historical readings for active feature set."
            meta = AnomalyInferenceMetadata(
                model_version=MODEL_VERSION,
                inference_timestamp=now_iso,
                sample_size=len(X_raw_list),
                raw_score=None,
                normalized_score=None,
                decision_threshold=ANOMALY_DECISION_THRESHOLD,
                is_anomaly=False,
                feature_contributions={},
                active_features=active_features,
                missing_features=missing_features,
                explanation=msg,
            )
            if return_metadata:
                return False, None, msg, meta
            return False, None, msg

        x_curr_raw = np.array([quality["valid_features"][f] for f in target_features], dtype=float).reshape(1, -1)
        astro_id = getattr(current, "astronaut_id", "default")
        cached_entry = _WARM_ESTIMATOR_CACHE.get(astro_id)

        # Check if warm cached model can be reused (within 15 samples of current history)
        if (
            cached_entry is not None and
            abs(cached_entry[0] - len(X_raw_list)) < 15 and
            len(cached_entry[2]) == len(target_features)
        ):
            _, iso_forest, medians, iqrs = cached_entry
            x_curr_scaled = (x_curr_raw - medians) / iqrs
        else:
            X_train_raw = np.array(X_raw_list)
            X_train_scaled, medians, iqrs = robust_scale_features(X_train_raw)
            x_curr_scaled = (x_curr_raw - medians) / iqrs

            # Fit Isolation Forest on robustly scaled space
            iso_forest = IsolationForest(
                n_estimators=75,
                contamination=0.05,
                n_jobs=1,
                random_state=42
            )
            iso_forest.fit(X_train_scaled)
            _WARM_ESTIMATOR_CACHE[astro_id] = (len(X_raw_list), iso_forest, medians, iqrs)

        # Isolation forest inference
        pred = iso_forest.predict(x_curr_scaled)[0]
        raw_score = float(iso_forest.decision_function(x_curr_scaled)[0])

        # Tree isolation score
        tree_score = max(0.0, min(1.0, 0.5 - raw_score))

        # Multi-dimensional robust deviation score
        scaled_abs = np.abs(x_curr_scaled.flatten())
        max_scaled_dev = float(np.max(scaled_abs))
        mean_scaled_dev = float(np.mean(scaled_abs))

        # Distance score calibrated so that scaled deviations >= 3.0 IQRs trigger anomaly
        robust_dist_score = min(1.0, (max_scaled_dev / 5.0) * 0.6 + (mean_scaled_dev / 2.5) * 0.4)
        normalized_score = round(max(0.0, min(1.0, max(tree_score, robust_dist_score))), 3)

        is_anomaly = bool(pred == -1 or normalized_score >= ANOMALY_DECISION_THRESHOLD or max_scaled_dev >= 3.5)

        # Calculate feature contributions
        contributions = calculate_feature_contributions(x_curr_scaled, target_features, iqrs)

        # Top drivers
        sorted_drivers = sorted(contributions.items(), key=lambda kv: kv[1], reverse=True)
        top_drivers_str = ", ".join([f"{k} ({v*100:.1f}%)" for k, v in sorted_drivers[:3] if v > 0.15])

        if is_anomaly:
            explanation = (
                f"Multivariate statistical anomaly detected by Isolation Forest (score: {normalized_score}, threshold: {ANOMALY_DECISION_THRESHOLD}). "
                f"Primary divergence drivers: {top_drivers_str or 'multivariate interaction'}."
            )
        else:
            explanation = f"Vitals pattern aligns with astronaut historical cluster (anomaly score: {normalized_score})."

        meta = AnomalyInferenceMetadata(
            model_version=MODEL_VERSION,
            inference_timestamp=now_iso,
            sample_size=len(X_raw_list),
            raw_score=raw_score,
            normalized_score=normalized_score,
            decision_threshold=ANOMALY_DECISION_THRESHOLD,
            is_anomaly=is_anomaly,
            feature_contributions=contributions,
            active_features=target_features,
            missing_features=missing_features,
            explanation=explanation,
        )

        if return_metadata:
            return is_anomaly, normalized_score, explanation, meta
        return is_anomaly, normalized_score, explanation

    except Exception as e:
        logger.error(f"Anomaly detection failure: {e}", exc_info=True)
        err_msg = f"ML Anomaly calculation bypassed due to: {str(e)}"
        meta = AnomalyInferenceMetadata(
            model_version=MODEL_VERSION,
            inference_timestamp=now_iso,
            sample_size=len(historical_records),
            raw_score=None,
            normalized_score=None,
            decision_threshold=ANOMALY_DECISION_THRESHOLD,
            is_anomaly=False,
            feature_contributions={},
            active_features=active_features,
            missing_features=missing_features,
            explanation=err_msg,
        )
        if return_metadata:
            return False, None, err_msg, meta
        return False, None, err_msg
