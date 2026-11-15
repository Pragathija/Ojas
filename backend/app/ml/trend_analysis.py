"""
OJAS Trend Analysis Module (re-exports temporal trajectory capabilities).
"""

from app.ml.temporal_analysis import (
    TemporalAssessment,
    compute_ema,
    compute_sma,
    analyze_vital_trend,
    classify_temporal_trajectory,
)

__all__ = [
    "TemporalAssessment",
    "compute_ema",
    "compute_sma",
    "analyze_vital_trend",
    "classify_temporal_trajectory",
]
