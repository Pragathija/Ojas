"""
Data models and schemas for the NASA BRSMAct dataset.
"""

import datetime as dt
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class BRSMActRecord(BaseModel):
    """Single normalized observation from NASA BRSMAct study."""
    id: int = Field(..., description="Observation ID within file")
    subject: str = Field(..., description="Subject code: C1G0001, C1G0002, or C1G0003")
    date: dt.date = Field(..., description="Observation calendar date")
    test_phase: str = Field(..., description="PRE_TEST, IN_TEST, or POST_TEST")
    br_day: int = Field(..., description="Bed rest day counter within the phase")

    # Normalized metrics
    sleep_latency_minutes: Optional[float] = Field(None, description="Sleep latency in minutes")
    sleep_duration_minutes: Optional[float] = Field(None, description="Sleep duration in minutes")
    sleep_efficiency_pct: Optional[float] = Field(None, description="Sleep efficiency percentage (0-100)")

    # Clinical metadata
    medication_note: Optional[str] = Field(None, description="Reported medication or note")
    record_number: Optional[int] = Field(None, description="NASA LSDA database record index if present")

    # Raw values preserved exactly
    raw_values: Dict[str, Any] = Field(default_factory=dict, description="Verbatim raw row from source CSV")

    # Provenance tags
    source_file: str = Field(..., description="Original source CSV filename")
    is_missing_data: bool = Field(False, description="True if sleep values were marked 'No Data' or null")


class PhaseSleepMetrics(BaseModel):
    """Descriptive statistics for sleep metrics in a given study phase."""
    phase_name: str
    total_scheduled_days: int
    valid_observations: int
    missing_observations: int
    missing_rate_pct: float
    contributing_subjects_count: int = Field(..., description="Count of subjects with >= 1 valid observation")
    contributing_subjects: List[str] = Field(default_factory=list, description="Subject IDs with valid observations")
    sample_size_warning: Optional[str] = Field(None, description="Specific bias or sample limitation note")

    # Pooled (Micro-average) Duration (minutes)
    duration_mean_minutes: Optional[float] = None
    duration_std_minutes: Optional[float] = None
    duration_median_minutes: Optional[float] = None
    duration_min_minutes: Optional[float] = None
    duration_max_minutes: Optional[float] = None

    # Pooled (Micro-average) Latency (minutes)
    latency_mean_minutes: Optional[float] = None
    latency_std_minutes: Optional[float] = None
    latency_median_minutes: Optional[float] = None
    latency_min_minutes: Optional[float] = None
    latency_max_minutes: Optional[float] = None

    # Pooled (Micro-average) Efficiency (%)
    efficiency_mean_pct: Optional[float] = None
    efficiency_std_pct: Optional[float] = None
    efficiency_median_pct: Optional[float] = None
    efficiency_min_pct: Optional[float] = None
    efficiency_max_pct: Optional[float] = None

    # Macro-average (Subject-averaged) metrics
    macro_duration_mean_minutes: Optional[float] = Field(None, description="Mean of subject-level duration means")
    macro_latency_mean_minutes: Optional[float] = Field(None, description="Mean of subject-level latency means")
    macro_efficiency_mean_pct: Optional[float] = Field(None, description="Mean of subject-level efficiency means")


class SubjectSleepSummary(BaseModel):
    """Subject-level longitudinal sleep summary across study phases."""
    subject_id: str
    total_days: int
    valid_days: int
    missing_days: int
    medication_days: int
    phases: Dict[str, PhaseSleepMetrics]
    overall_mean_duration_minutes: Optional[float] = None
    overall_mean_efficiency_pct: Optional[float] = None
    overall_mean_latency_minutes: Optional[float] = None


class DayTrajectoryPoint(BaseModel):
    """Cohort daily average for a specific bed rest day."""
    test_phase: str
    br_day: int
    calendar_dates: List[str]
    subject_count: int
    valid_count: int
    mean_duration_minutes: Optional[float] = None
    mean_efficiency_pct: Optional[float] = None
    mean_latency_minutes: Optional[float] = None
    reported_medications: List[str] = Field(default_factory=list)


class MissingDataReport(BaseModel):
    """Detailed audit of missing observations."""
    total_records: int
    total_missing_records: int
    overall_missing_pct: float
    missing_by_subject: Dict[str, int]
    missing_by_phase: Dict[str, int]
    missing_dates_per_subject: Dict[str, List[str]]
    clinical_note: str = Field(
        default="Missing observations during IN_TEST occurred exclusively within the first 8 adaptation days.",
        description="Operational context for missing observations."
    )


class MedicationConditionMetrics(BaseModel):
    """Sleep metrics comparing medication vs non-medication nights."""
    observation_count: int
    duration_mean_minutes: Optional[float] = None
    duration_std_minutes: Optional[float] = None
    latency_mean_minutes: Optional[float] = None
    latency_std_minutes: Optional[float] = None
    efficiency_mean_pct: Optional[float] = None
    efficiency_std_pct: Optional[float] = None


class MedicationAudit(BaseModel):
    """Comprehensive analysis of pharmacological sleep aids in BRSMAct."""
    total_medication_records: int
    medication_distribution_by_drug: Dict[str, int]
    medication_distribution_by_subject: Dict[str, Dict[str, int]]
    medication_distribution_by_phase: Dict[str, int]
    in_test_sleep_aid_nights: MedicationConditionMetrics
    in_test_non_sleep_aid_nights: MedicationConditionMetrics
    clinical_interpretation: str


class ResearchAnalysisReport(BaseModel):
    """Comprehensive research analysis output for NASA BRSMAct study."""
    dataset_id: str
    experiment_id: str
    study_title: str
    data_processing_level: str
    total_observations: int
    cohort_subjects: List[str]
    phase_comparison: Dict[str, PhaseSleepMetrics]
    subject_summaries: Dict[str, SubjectSleepSummary]
    missing_data_audit: MissingDataReport
    in_test_trajectory: List[DayTrajectoryPoint]
    medication_audit: MedicationAudit
    scientific_limitations: str
