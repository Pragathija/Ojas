"""
OJAS AI Model Evaluation & Scientific Benchmark Validation Engine.
Provides:
- Rigorous statistical evaluation metrics: Precision, Recall, F1, Specificity, FPR, FNR, Confusion Matrix.
- Strict subject-level holdout validation (preventing cross-subject data leakage).
- Scientific domain boundary enforcement across NASA OSDR, BRSMAct, PhysioNet BIDMC, MIT-BIH, Sleep-EDF, and WESAD.
"""

from typing import List, Dict, Any, Tuple, Optional, Set
import numpy as np
from app.datasets.registry import get_dataset_metadata


class EvaluationMetrics:
    def __init__(
        self,
        tp: int,
        fp: int,
        tn: int,
        fn: int,
        precision: float,
        recall: float,
        specificity: float,
        f1_score: float,
        accuracy: float,
        false_positive_rate: float,
        false_negative_rate: float,
        total_samples: int,
    ):
        self.tp = tp
        self.fp = fp
        self.tn = tn
        self.fn = fn
        self.precision = precision
        self.recall = recall
        self.specificity = specificity
        self.f1_score = f1_score
        self.accuracy = accuracy
        self.false_positive_rate = false_positive_rate
        self.false_negative_rate = false_negative_rate
        self.total_samples = total_samples

    def to_dict(self) -> Dict[str, Any]:
        return {
            "confusion_matrix": {
                "true_positives": self.tp,
                "false_positives": self.fp,
                "true_negatives": self.tn,
                "false_negatives": self.fn,
            },
            "precision": self.precision,
            "recall": self.recall,
            "specificity": self.specificity,
            "f1_score": self.f1_score,
            "accuracy": self.accuracy,
            "false_positive_rate": self.false_positive_rate,
            "false_negative_rate": self.false_negative_rate,
            "total_samples": self.total_samples,
        }


def compute_classification_metrics(
    y_true: List[int],
    y_pred: List[int]
) -> EvaluationMetrics:
    """
    Computes rigorous classification metrics from binary ground truth and predictions.
    1 = Positive (Anomaly / Critical / Event), 0 = Negative (Nominal / Inlier).
    """
    if len(y_true) != len(y_pred):
        raise ValueError(f"Length mismatch: y_true ({len(y_true)}) != y_pred ({len(y_pred)})")

    total = len(y_true)
    if total == 0:
        return EvaluationMetrics(0, 0, 0, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0)

    tp = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 1 and yp == 1)
    fp = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 0 and yp == 1)
    tn = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 0 and yp == 0)
    fn = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 1 and yp == 0)

    # Precision
    precision = round(tp / (tp + fp), 4) if (tp + fp) > 0 else 0.0

    # Recall (Sensitivity)
    recall = round(tp / (tp + fn), 4) if (tp + fn) > 0 else 0.0

    # Specificity
    specificity = round(tn / (tn + fp), 4) if (tn + fp) > 0 else 0.0

    # F1 Score
    f1 = round(2 * (precision * recall) / (precision + recall), 4) if (precision + recall) > 0 else 0.0

    # Accuracy
    accuracy = round((tp + tn) / total, 4) if total > 0 else 0.0

    # False Positive Rate: FP / (FP + TN)
    fpr = round(fp / (fp + tn), 4) if (fp + tn) > 0 else 0.0

    # False Negative Rate: FN / (FN + TP)
    fnr = round(fn / (fn + tp), 4) if (fn + tp) > 0 else 0.0

    return EvaluationMetrics(
        tp=tp,
        fp=fp,
        tn=tn,
        fn=fn,
        precision=precision,
        recall=recall,
        specificity=specificity,
        f1_score=f1,
        accuracy=accuracy,
        false_positive_rate=fpr,
        false_negative_rate=fnr,
        total_samples=total,
    )


class SubjectHoldoutValidator:
    """
    Partitions datasets by subject identifier to guarantee zero data leakage
    between training and testing cohorts.
    """
    @staticmethod
    def split_by_subject(
        records: List[Dict[str, Any]],
        subject_key: str = "subject_id",
        test_ratio: float = 0.3,
        random_seed: int = 42
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], Set[str], Set[str]]:
        """
        Splits records into train and test sets such that no subject exists in both.
        """
        subjects = sorted(list(set(str(r[subject_key]) for r in records if subject_key in r)))
        if not subjects:
            raise ValueError(f"No subjects found with key '{subject_key}'.")

        rng = np.random.default_rng(random_seed)
        shuffled = subjects.copy()
        rng.shuffle(shuffled)

        n_test = max(1, int(len(shuffled) * test_ratio))
        test_subjects = set(shuffled[:n_test])
        train_subjects = set(shuffled[n_test:])

        # Ensure train has at least one subject if multiple subjects exist
        if not train_subjects and len(subjects) > 1:
            train_subjects.add(test_subjects.pop())

        train_records = [r for r in records if str(r.get(subject_key)) in train_subjects]
        test_records = [r for r in records if str(r.get(subject_key)) in test_subjects]

        # Verification check: disjoint sets
        assert train_subjects.isdisjoint(test_subjects), "Data leakage detected: train and test subjects overlap!"

        return train_records, test_records, train_subjects, test_subjects


def get_dataset_provenance_category(dataset_id: str) -> Optional[str]:
    """Retrieves provenance category from registry or dedicated NASA BRSMAct provenance module."""
    if dataset_id == "nasa_brsmact":
        try:
            from app.datasets.nasa_brsmact.provenance import STUDY_METADATA
            return STUDY_METADATA.provenance_category
        except Exception:
            return "SPACEFLIGHT_ANALOG"
    try:
        meta = get_dataset_metadata(dataset_id)
        return meta.category.value
    except KeyError:
        return None


def verify_scientific_boundary_compliance(
    dataset_id_a: str,
    dataset_id_b: str
) -> Tuple[bool, str]:
    """
    Enforces scientific boundary compliance.
    Prevents cross-contamination between spaceflight analog data (e.g. BRSMAct bedrest),
    clinical ICU data (e.g. PhysioNet BIDMC), and live astronaut simulated telemetry.
    """
    cat_a = get_dataset_provenance_category(dataset_id_a)
    cat_b = get_dataset_provenance_category(dataset_id_b)

    if not cat_a or not cat_b:
        return False, f"Unknown dataset metadata for comparison: '{dataset_id_a}' or '{dataset_id_b}'."

    # Allow comparison only within compatible scientific categories
    if cat_a != cat_b:
        return False, (
            f"Scientific boundary violation: Cannot pool or cross-train between "
            f"'{dataset_id_a}' ({cat_a}) and '{dataset_id_b}' ({cat_b}). "
            f"Spaceflight analog, real research, and simulated telemetry must remain segregated."
        )

    return True, f"Valid domain pairing: Both datasets share provenance '{cat_a}'."
