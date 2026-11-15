"""
OJAS Model Drift & Feature Distribution Monitoring Engine.
Provides:
- Feature distribution profiling (mean, std, median, IQR, missing rate).
- Baseline drift indicators (Population Stability Index - PSI, standardized mean shift, variance ratio).
- Individual vs. Population drift separation.
- Model version and training data fingerprinting (SHA-256).
- Actionable drift warnings and comprehensive monitoring reports.
- STRICT SAFETY INVARIANT: Drift detection alerts flight surgeons but NEVER automatically triggers model retraining.
"""

import hashlib
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Tuple
import numpy as np

from app.models.health_record import HealthRecord
from app.models.health_baseline import HealthBaseline
from app.ml.preprocessing import PHYSIOLOGICAL_FEATURES, FEATURE_UNITS
from app.ml.anomaly_detection import MODEL_VERSION

# Drift Threshold Constants
PSI_NOMINAL_THRESHOLD = 0.10
PSI_MODERATE_THRESHOLD = 0.25
MEAN_SHIFT_MODERATE_Z = 1.5
MEAN_SHIFT_SEVERE_Z = 2.5


class DistributionSummary:
    def __init__(
        self,
        feature_name: str,
        sample_count: int,
        mean: float,
        std: float,
        median: float,
        p10: float,
        p25: float,
        p75: float,
        p90: float,
        iqr: float,
        min_val: float,
        max_val: float,
        missing_rate: float,
    ):
        self.feature_name = feature_name
        self.sample_count = sample_count
        self.mean = mean
        self.std = std
        self.median = median
        self.p10 = p10
        self.p25 = p25
        self.p75 = p75
        self.p90 = p90
        self.iqr = iqr
        self.min_val = min_val
        self.max_val = max_val
        self.missing_rate = missing_rate

    def to_dict(self) -> Dict[str, Any]:
        return {
            "feature_name": self.feature_name,
            "sample_count": self.sample_count,
            "mean": self.mean,
            "std": self.std,
            "median": self.median,
            "p10": self.p10,
            "p25": self.p25,
            "p75": self.p75,
            "p90": self.p90,
            "iqr": self.iqr,
            "min": self.min_val,
            "max": self.max_val,
            "missing_rate": self.missing_rate,
        }


def compute_distribution_summary(
    records: List[HealthRecord],
    feature_name: str
) -> DistributionSummary:
    """Computes comprehensive distribution profile for a single physiological feature."""
    total = len(records)
    if total == 0:
        return DistributionSummary(feature_name, 0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0)

    raw_vals = [getattr(r, feature_name, None) for r in records]
    valid_vals = [float(v) for v in raw_vals if v is not None and not np.isnan(v) and not np.isinf(v)]
    missing_count = total - len(valid_vals)
    missing_rate = round(missing_count / total, 3)

    if not valid_vals:
        return DistributionSummary(feature_name, 0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, missing_rate)

    arr = np.array(valid_vals)
    mean_val = float(np.mean(arr))
    std_val = float(np.std(arr)) or 1.0
    median_val = float(np.median(arr))
    p10 = float(np.percentile(arr, 10))
    p25 = float(np.percentile(arr, 25))
    p75 = float(np.percentile(arr, 75))
    p90 = float(np.percentile(arr, 90))
    iqr_val = p75 - p25 or 1.0

    return DistributionSummary(
        feature_name=feature_name,
        sample_count=len(valid_vals),
        mean=round(mean_val, 2),
        std=round(std_val, 2),
        median=round(median_val, 2),
        p10=round(p10, 2),
        p25=round(p25, 2),
        p75=round(p75, 2),
        p90=round(p90, 2),
        iqr=round(iqr_val, 2),
        min_val=round(float(np.min(arr)), 2),
        max_val=round(float(np.max(arr)), 2),
        missing_rate=missing_rate,
    )


def compute_psi(
    expected_vals: List[float],
    actual_vals: List[float],
    num_bins: int = 5
) -> float:
    """
    Computes Population Stability Index (PSI) between baseline (expected) and recent (actual).
    PSI < 0.10: Nominal (No significant change).
    0.10 <= PSI < 0.25: Moderate shift (Monitor telemetry).
    PSI >= 0.25: Significant drift (Requires review).
    """
    clean_exp = [float(v) for v in expected_vals if v is not None and not np.isnan(v)]
    clean_act = [float(v) for v in actual_vals if v is not None and not np.isnan(v)]

    if len(clean_exp) < 5 or len(clean_act) < 5:
        return 0.0

    # Define bins based on expected distribution quantiles, with infinite outer edges
    quantiles = np.linspace(0, 100, num_bins + 1)
    bin_edges = np.percentile(clean_exp, quantiles)
    # Ensure strictly increasing bins
    for i in range(1, len(bin_edges)):
        if bin_edges[i] <= bin_edges[i - 1]:
            bin_edges[i] = bin_edges[i - 1] + 1e-3

    # Extend boundaries to infinity to capture all out-of-bounds shifts
    bin_edges[0] = -np.inf
    bin_edges[-1] = np.inf

    # Histogram binning
    exp_counts, _ = np.histogram(clean_exp, bins=bin_edges)
    act_counts, _ = np.histogram(clean_act, bins=bin_edges)

    # Convert to fractions with small epsilon smoothing
    eps = 1e-4
    exp_fracs = (exp_counts + eps) / (np.sum(exp_counts) + eps * num_bins)
    act_fracs = (act_counts + eps) / (np.sum(act_counts) + eps * num_bins)

    # PSI sum: (actual - expected) * ln(actual / expected)
    psi = np.sum((act_fracs - exp_fracs) * np.log(act_fracs / exp_fracs))
    return round(float(max(0.0, psi)), 4)


def generate_training_data_fingerprint(records: List[HealthRecord]) -> str:
    """
    Generates a deterministic SHA-256 digest of the reference telemetry records.
    Provides verifiable training/baseline provenance.
    """
    fingerprint_data = []
    for r in sorted(records, key=lambda x: (x.astronaut_id, x.timestamp or datetime.min)):
        fingerprint_data.append({
            "astronaut_id": r.astronaut_id,
            "t": r.timestamp.isoformat() if r.timestamp else None,
            "hr": r.heart_rate,
            "spo2": r.blood_oxygen,
            "sys": r.systolic_bp,
            "dia": r.diastolic_bp,
        })
    raw_bytes = json.dumps(fingerprint_data, sort_keys=True).encode("utf-8")
    return hashlib.sha256(raw_bytes).hexdigest()[:16]


def evaluate_individual_drift(
    baseline: Optional[HealthBaseline],
    recent_records: List[HealthRecord]
) -> Dict[str, Any]:
    """
    Audits single-astronaut physiological drift between established personal baseline
    and their recent observation window (e.g. last 10-20 readings).
    """
    if not baseline or len(recent_records) < 3:
        return {
            "status": "INSUFFICIENT_DATA",
            "message": "Insufficient historical or recent samples for individual drift audit.",
            "drift_severity": "NOMINAL",
            "feature_drifts": {}
        }

    feature_drifts = {}
    max_severity = "NOMINAL"
    warnings = []

    metrics = [
        ("heart_rate", baseline.heart_rate_mean, baseline.heart_rate_std),
        ("blood_oxygen", baseline.blood_oxygen_mean, baseline.blood_oxygen_std),
        ("systolic_bp", baseline.systolic_bp_mean, baseline.systolic_bp_std),
        ("diastolic_bp", baseline.diastolic_bp_mean, baseline.diastolic_bp_std),
        ("body_temperature", baseline.temperature_mean, baseline.temperature_std),
        ("sleep_duration", baseline.sleep_duration_mean, baseline.sleep_duration_std),
        ("stress_level", baseline.stress_level_mean, baseline.stress_level_std),
        ("fatigue_level", baseline.fatigue_mean, baseline.fatigue_std),
    ]

    for name, b_mean, b_std in metrics:
        if b_mean is None or not b_std:
            continue

        recent_vals = [getattr(r, name, None) for r in recent_records if getattr(r, name, None) is not None]
        if len(recent_vals) < 3:
            continue

        r_mean = float(np.mean(recent_vals))
        r_std = float(np.std(recent_vals)) or 0.1

        mean_shift_z = round((r_mean - b_mean) / b_std, 2)
        variance_ratio = round((r_std ** 2) / (b_std ** 2), 2)

        # Drift severity per feature
        if abs(mean_shift_z) >= MEAN_SHIFT_SEVERE_Z or variance_ratio >= 3.0:
            feat_sev = "SEVERE_DRIFT"
            warnings.append(f"{name}: severe baseline deviation (mean shift z={mean_shift_z}, var ratio={variance_ratio}).")
        elif abs(mean_shift_z) >= MEAN_SHIFT_MODERATE_Z or variance_ratio >= 2.0:
            feat_sev = "MODERATE_DRIFT"
            warnings.append(f"{name}: moderate baseline drift (mean shift z={mean_shift_z}).")
        else:
            feat_sev = "NOMINAL"

        if feat_sev == "SEVERE_DRIFT":
            max_severity = "SEVERE_DRIFT"
        elif feat_sev == "MODERATE_DRIFT" and max_severity != "SEVERE_DRIFT":
            max_severity = "MODERATE_DRIFT"

        feature_drifts[name] = {
            "baseline_mean": round(b_mean, 2),
            "recent_mean": round(r_mean, 2),
            "mean_shift_z": mean_shift_z,
            "variance_ratio": variance_ratio,
            "severity": feat_sev,
        }

    return {
        "status": "COMPLETED",
        "drift_severity": max_severity,
        "sample_count": len(recent_records),
        "feature_drifts": feature_drifts,
        "warnings": warnings,
        "action_required": max_severity != "NOMINAL",
        "retraining_triggered": False,  # Strict invariant: never automatically retrain
    }


def evaluate_population_drift(
    reference_records: List[HealthRecord],
    evaluation_records: List[HealthRecord]
) -> Dict[str, Any]:
    """
    Audits cohort-wide population drift between mission reference cohort
    and active flight telemetry using Population Stability Index (PSI).
    """
    if len(reference_records) < 10 or len(evaluation_records) < 10:
        return {
            "status": "INSUFFICIENT_DATA",
            "message": "At least 10 reference and 10 evaluation records required for population drift audit.",
            "overall_drift_severity": "NOMINAL",
            "feature_psis": {}
        }

    feature_psis = {}
    max_severity = "NOMINAL"
    warnings = []

    for feat in PHYSIOLOGICAL_FEATURES:
        exp = [getattr(r, feat, None) for r in reference_records]
        act = [getattr(r, feat, None) for r in evaluation_records]

        psi = compute_psi(exp, act)
        if psi >= PSI_MODERATE_THRESHOLD:
            sev = "SEVERE_DRIFT"
            warnings.append(f"Cohort {feat} exhibits significant distribution drift (PSI={psi}).")
        elif psi >= PSI_NOMINAL_THRESHOLD:
            sev = "MODERATE_DRIFT"
            warnings.append(f"Cohort {feat} exhibits moderate distribution shift (PSI={psi}).")
        else:
            sev = "NOMINAL"

        if sev == "SEVERE_DRIFT":
            max_severity = "SEVERE_DRIFT"
        elif sev == "MODERATE_DRIFT" and max_severity != "SEVERE_DRIFT":
            max_severity = "MODERATE_DRIFT"

        feature_psis[feat] = {
            "psi": psi,
            "severity": sev,
            "unit": FEATURE_UNITS.get(feat, ""),
        }

    return {
        "status": "COMPLETED",
        "overall_drift_severity": max_severity,
        "reference_sample_count": len(reference_records),
        "evaluation_sample_count": len(evaluation_records),
        "feature_psis": feature_psis,
        "warnings": warnings,
        "retraining_triggered": False,  # Strict invariant
    }


def evaluate_schema_drift(
    actual_features: List[str],
    expected_features: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Audits input schema drift.
    Detects dropped, missing, or extraneous feature fields against the approved model schema.
    """
    expected = expected_features or PHYSIOLOGICAL_FEATURES
    actual_set = set(actual_features)
    expected_set = set(expected)

    missing_fields = sorted(list(expected_set - actual_set))
    unexpected_fields = sorted(list(actual_set - expected_set))

    if missing_fields:
        severity = "SEVERE_DRIFT"
        msg = f"Schema drift detected: Missing expected features: {missing_fields}"
    elif unexpected_fields:
        severity = "MODERATE_DRIFT"
        msg = f"Schema drift detected: Unexpected extra features: {unexpected_fields}"
    else:
        severity = "NOMINAL"
        msg = "Telemetry feature schema matches approved model specification."

    return {
        "status": "COMPLETED",
        "severity": severity,
        "is_schema_valid": len(missing_fields) == 0,
        "expected_features": expected,
        "actual_features": actual_features,
        "missing_features": missing_fields,
        "unexpected_features": unexpected_fields,
        "message": msg,
    }


def evaluate_missingness_drift(
    reference_records: List[HealthRecord],
    recent_records: List[HealthRecord]
) -> Dict[str, Any]:
    """
    Audits missingness drift across physiological channels.
    Detects sensor degradation or hardware telemetry dropouts before complete failure.
    """
    if not reference_records or not recent_records:
        return {
            "status": "INSUFFICIENT_DATA",
            "severity": "NOMINAL",
            "channel_missingness": {}
        }

    max_severity = "NOMINAL"
    channel_missingness = {}
    warnings = []

    for feat in PHYSIOLOGICAL_FEATURES:
        ref_nulls = sum(1 for r in reference_records if getattr(r, feat, None) is None)
        rec_nulls = sum(1 for r in recent_records if getattr(r, feat, None) is None)

        ref_rate = round(ref_nulls / len(reference_records), 3)
        rec_rate = round(rec_nulls / len(recent_records), 3)
        delta_rate = round(rec_rate - ref_rate, 3)

        if delta_rate >= 0.30:
            sev = "SEVERE_DRIFT"
            warnings.append(f"{feat}: Critical sensor dropout surge (+{delta_rate*100:.1f}% missingness).")
        elif delta_rate >= 0.15:
            sev = "MODERATE_DRIFT"
            warnings.append(f"{feat}: Moderate telemetry drop rate increase (+{delta_rate*100:.1f}% missingness).")
        else:
            sev = "NOMINAL"

        if sev == "SEVERE_DRIFT":
            max_severity = "SEVERE_DRIFT"
        elif sev == "MODERATE_DRIFT" and max_severity != "SEVERE_DRIFT":
            max_severity = "MODERATE_DRIFT"

        channel_missingness[feat] = {
            "reference_missing_rate": ref_rate,
            "recent_missing_rate": rec_rate,
            "delta_rate": delta_rate,
            "severity": sev,
        }

    return {
        "status": "COMPLETED",
        "severity": max_severity,
        "channel_missingness": channel_missingness,
        "warnings": warnings,
    }


def generate_drift_monitoring_report(
    reference_records: List[HealthRecord],
    recent_records: List[HealthRecord],
    astronaut_id: Optional[str] = None,
    baseline: Optional[HealthBaseline] = None,
    incoming_feature_schema: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Generates full end-to-end drift monitoring report with model provenance,
    fingerprint, PSI values, individual shifts, missingness drift, and safety disclosures.
    """
    fingerprint = generate_training_data_fingerprint(reference_records)
    pop_drift = evaluate_population_drift(reference_records, recent_records)
    ind_drift = evaluate_individual_drift(baseline, recent_records) if baseline else None
    miss_drift = evaluate_missingness_drift(reference_records, recent_records)
    schema_drift = evaluate_schema_drift(incoming_feature_schema or PHYSIOLOGICAL_FEATURES)

    # Determine overall status
    severities = [
        pop_drift.get("overall_drift_severity", "NOMINAL"),
        miss_drift.get("severity", "NOMINAL"),
        schema_drift.get("severity", "NOMINAL"),
    ]
    if ind_drift:
        severities.append(ind_drift.get("drift_severity", "NOMINAL"))

    if "SEVERE_DRIFT" in severities:
        overall = "SEVERE_DRIFT"
    elif "MODERATE_DRIFT" in severities:
        overall = "MODERATE_DRIFT"
    else:
        overall = "NOMINAL"

    # Compile structured drift events
    drift_events = []
    now_iso = datetime.now(timezone.utc).isoformat()
    if overall != "NOMINAL":
        if schema_drift.get("severity") != "NOMINAL":
            drift_events.append({
                "event_type": "SCHEMA_DRIFT",
                "severity": schema_drift["severity"],
                "timestamp": now_iso,
                "description": schema_drift["message"],
                "recommended_action": "Verify telemetry stream format and client schema version.",
            })
        for feat, data in pop_drift.get("feature_psis", {}).items():
            if data.get("severity") != "NOMINAL":
                drift_events.append({
                    "event_type": "POPULATION_PSI_EXCURSION",
                    "severity": data["severity"],
                    "metric": feat,
                    "psi": data["psi"],
                    "timestamp": now_iso,
                    "description": f"Cohort {feat} drifted with PSI={data['psi']}",
                    "recommended_action": "Inspect spacecraft ECLSS habitat telemetry and cohort environmental logs.",
                })
        for feat, data in miss_drift.get("channel_missingness", {}).items():
            if data.get("severity") != "NOMINAL":
                drift_events.append({
                    "event_type": "SENSOR_MISSINGNESS_SPIKE",
                    "severity": data["severity"],
                    "metric": feat,
                    "delta_missing_rate": data["delta_rate"],
                    "timestamp": now_iso,
                    "description": f"Sensor channel '{feat}' missingness increased by {data['delta_rate']*100:.1f}%.",
                    "recommended_action": "Inspect physical sensor harness, electrodes, and transmitter battery.",
                })

    return {
        "report_id": f"drift-report-{int(datetime.now(timezone.utc).timestamp())}",
        "timestamp": now_iso,
        "model_version": MODEL_VERSION,
        "training_data_fingerprint": fingerprint,
        "overall_drift_severity": overall,
        "population_drift": pop_drift,
        "individual_drift": ind_drift,
        "missingness_drift": miss_drift,
        "schema_drift": schema_drift,
        "drift_events": drift_events,
        "safety_declaration": (
            "Model drift monitoring serves advisory and surveillance functions only. "
            "Autonomous retraining is strictly prohibited to prevent unvalidated parameter changes "
            "in mission-critical life support environments. Human flight surgeon review required."
        ),
        "retraining_triggered": False,
    }
