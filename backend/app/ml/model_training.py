"""
OJAS Model Training & Offline Calibration Utility.
Supports:
- Training versioned multivariate anomaly detection models.
- Serializing/deserializing model weights and calibration parameters.
- Validating offline training data quality.
"""

from typing import List, Dict, Any, Optional, Tuple
import numpy as np

try:
    from sklearn.ensemble import IsolationForest
    SKLEARN_AVAILABLE = True
except Exception:
    IsolationForest = None
    SKLEARN_AVAILABLE = False

from app.ml.preprocessing import robust_scale_features, extract_masked_feature_vector, PHYSIOLOGICAL_FEATURES


class IsolationForestTrainer:
    def __init__(
        self,
        n_estimators: int = 100,
        contamination: float = 0.05,
        random_state: int = 42
    ):
        self.n_estimators = n_estimators
        self.contamination = contamination
        self.random_state = random_state
        self.model: Optional[IsolationForest] = None
        self.medians: Optional[np.ndarray] = None
        self.iqrs: Optional[np.ndarray] = None

    def fit(self, X_raw: np.ndarray) -> "IsolationForestTrainer":
        """
        Fits robust scaler and Isolation Forest on training matrix.
        """
        if not SKLEARN_AVAILABLE or IsolationForest is None:
            raise RuntimeError("scikit-learn is not available for model training.")

        if len(X_raw) < 10:
            raise ValueError(f"Insufficient samples for training ({len(X_raw)} < 10).")

        X_scaled, self.medians, self.iqrs = robust_scale_features(X_raw)

        self.model = IsolationForest(
            n_estimators=self.n_estimators,
            contamination=self.contamination,
            random_state=self.random_state,
            n_jobs=1
        )
        self.model.fit(X_scaled)
        return self

    def predict(self, X_new_raw: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Returns (predictions, anomaly_scores).
        """
        if self.model is None or self.medians is None or self.iqrs is None:
            raise RuntimeError("Model is not fitted.")

        X_new_scaled = (X_new_raw - self.medians) / self.iqrs
        preds = self.model.predict(X_new_scaled)
        raw_scores = self.model.decision_function(X_new_scaled)
        normalized_scores = np.round(np.clip(0.5 - raw_scores, 0.0, 1.0), 3)

        return preds, normalized_scores
