"""
Unit and Integration Tests for NASA BRSMAct Research Dataset Integration.

Verifies:
1. Data integrity and checksum matching against acquisition manifest.
2. Robust parsing of duration, latency, efficiency, dates, and phases.
3. Unit conversions (HH:mm -> float minutes, percentages).
4. Strict missing-value handling and zero fabrication policies.
5. Deduplication and authoritative primary dataset handling.
6. Subject cohort and operational phase mapping.
7. Provenance metadata and scientific boundary disclaimers.
8. Research analysis module and trajectory calculations.
"""

from datetime import date
from pathlib import Path
import pytest

from app.datasets.nasa_brsmact import (
    NasaBRSMActLoader,
    METADATA,
    DATA_DICTIONARY,
    NON_INFERRABLE_VARIABLES,
    NON_INFERENCE_POLICY,
    verify_dataset_integrity,
    parse_time_to_minutes,
    parse_efficiency,
    parse_date,
    compare_phases,
    summarize_subjects,
    analyze_br_day_trajectory,
    audit_missing_observations,
    generate_research_report,
    PRIMARY_FILE_NAME,
    QUERY_RESULT_FILE_NAME,
)


@pytest.fixture
def loader():
    return NasaBRSMActLoader(verify_hashes=True)


def test_provenance_and_manifest_integrity():
    """Verify SHA-256 and MD5 hashes of raw NASA files against manifest."""
    res = verify_dataset_integrity()
    assert res["all_files_verified"] is True
    assert res["files_checked"] == 3

    for item in res["file_details"]:
        assert item["status"] == "VERIFIED"
        assert item["sha256_match"] is True
        assert item["md5_match"] is True
        assert item["size_match"] is True

    # Study metadata verification
    assert METADATA.dataset_id == "nasa_brsmact"
    assert METADATA.experiment_id == "BRSMAct"
    assert "Bedrest Campaign 1" in METADATA.dataset_title
    assert "Public Domain" in METADATA.license
    assert "3 healthy adult" in METADATA.study_population
    assert "CRITICAL SCIENTIFIC DISCLAIMER" in METADATA.limitations_disclaimer


def test_parsing_duration_and_latency():
    """Verify conversion of time strings to float minutes."""
    assert parse_time_to_minutes("7:20") == 440.0
    assert parse_time_to_minutes("7:20:00") == 440.0
    assert parse_time_to_minutes("0:14") == 14.0
    assert parse_time_to_minutes("1:48") == 108.0
    assert parse_time_to_minutes("0:00") == 0.0
    assert parse_time_to_minutes("0:06") == 6.0

    # Missing indicators
    assert parse_time_to_minutes("No Data") is None
    assert parse_time_to_minutes("NaN") is None
    assert parse_time_to_minutes("") is None
    assert parse_time_to_minutes(None) is None


def test_parsing_efficiency():
    """Verify percentage parsing."""
    assert parse_efficiency("92.1") == 92.1
    assert parse_efficiency("92.1%") == 92.1
    assert parse_efficiency(77.5) == 77.5
    assert parse_efficiency("0.0") == 0.0
    assert parse_efficiency("100.0") == 100.0

    # Out of range / missing
    assert parse_efficiency("105.0") is None
    assert parse_efficiency("-5.0") is None
    assert parse_efficiency("No Data") is None
    assert parse_efficiency(None) is None


def test_parsing_date():
    """Verify calendar date parsing."""
    d1 = parse_date("9/7/2004")
    assert d1 == date(2004, 9, 7)

    d2 = parse_date("2004-11-09")
    assert d2 == date(2004, 11, 9)

    d3 = parse_date(date(2005, 1, 18))
    assert d3 == date(2005, 1, 18)


def test_primary_dataset_loading(loader):
    """Verify loading of authoritative primary dataset."""
    records = loader.load_primary_dataset()
    assert len(records) == 207

    # Check 3 subjects balanced at 69 records each
    subjects = [r.subject for r in records]
    assert subjects.count("C1G0001") == 69
    assert subjects.count("C1G0002") == 69
    assert subjects.count("C1G0003") == 69

    # Check study phases
    phases = [r.test_phase for r in records]
    assert phases.count("PRE_TEST") == 6    # 2 days * 3 subjects
    assert phases.count("IN_TEST") == 180   # 60 days * 3 subjects
    assert phases.count("POST_TEST") == 21  # 7 days * 3 subjects

    # Verify missing data count in primary dataset (exactly 17)
    missing = [r for r in records if r.is_missing_data]
    assert len(missing) == 17


def test_query_result_loading(loader):
    """Verify loading of internal query result dataset."""
    records = loader.load_query_result_dataset()
    assert len(records) == 191

    # Covers C1G0002 (6 rows) and C1G0003 (185 rows)
    subjects = set(r.subject for r in records)
    assert subjects == {"C1G0002", "C1G0003"}

    # Has record numbers
    rec_nums = [r.record_number for r in records if r.record_number is not None]
    assert len(rec_nums) == 191


def test_harmonized_deduplication(loader):
    """
    Verify duplicate handling:
    The canonical output must have exactly 207 records (zero duplicated subject-dates),
    enriched with query result metadata.
    """
    harmonized = loader.load_harmonized_dataset()
    assert len(harmonized) == 207

    # Ensure zero duplicate keys
    keys = [(r.subject, r.date) for r in harmonized]
    assert len(keys) == len(set(keys))

    # Check that record_number enrichment occurred for matched dates
    enriched_recs = [r for r in harmonized if r.record_number is not None]
    assert len(enriched_recs) > 0


def test_streaming_generator(loader):
    """Verify memory-efficient chunked streaming."""
    chunks = list(loader.stream_records(dataset_type="harmonized", chunksize=50))
    assert len(chunks) == 5  # 50, 50, 50, 50, 7
    total = sum(len(c) for c in chunks)
    assert total == 207


def test_non_fabrication_and_data_dictionary():
    """Verify strict adherence to non-fabrication of unmeasured vitals."""
    assert len(NON_INFERRABLE_VARIABLES) >= 6
    assert "heart_rate" in NON_INFERRABLE_VARIABLES
    assert "blood_oxygen_spo2" in NON_INFERRABLE_VARIABLES
    assert "blood_pressure_systolic" in NON_INFERRABLE_VARIABLES
    assert "STRICT PROTOCOL RULE" in NON_INFERENCE_POLICY

    # Verify data dictionary completeness
    expected_fields = [
        "subject", "date", "test_phase", "br_day",
        "sleep_latency_minutes", "sleep_duration_minutes",
        "sleep_efficiency_pct", "medication_note"
    ]
    for f in expected_fields:
        assert f in DATA_DICTIONARY
        defn = DATA_DICTIONARY[f]
        assert defn.description
        assert defn.valid_range


def test_research_analysis_phase_comparison(loader):
    """Verify research analysis module phase statistics."""
    records = loader.load_harmonized_dataset()
    phase_metrics = compare_phases(records)

    assert set(phase_metrics.keys()) == {"PRE_TEST", "IN_TEST", "POST_TEST"}

    pre = phase_metrics["PRE_TEST"]
    assert pre.total_scheduled_days == 6
    assert pre.valid_observations == 2
    assert pre.missing_observations == 4
    assert pre.duration_mean_minutes == 467.0
    assert pre.efficiency_mean_pct == 93.95

    in_test = phase_metrics["IN_TEST"]
    assert in_test.total_scheduled_days == 180
    assert in_test.valid_observations == 167
    assert in_test.missing_observations == 13
    assert in_test.duration_mean_minutes == 431.88
    assert in_test.efficiency_mean_pct == 81.65
    assert in_test.latency_mean_minutes == 42.75

    post = phase_metrics["POST_TEST"]
    assert post.total_scheduled_days == 21
    assert post.valid_observations == 21
    assert post.missing_observations == 0
    assert post.efficiency_mean_pct == 83.26


def test_research_analysis_subject_summaries(loader):
    """Verify subject-level longitudinal sleep summaries."""
    records = loader.load_harmonized_dataset()
    summaries = summarize_subjects(records)

    assert set(summaries.keys()) == {"C1G0001", "C1G0002", "C1G0003"}

    s1 = summaries["C1G0001"]
    assert s1.valid_days == 69
    assert s1.missing_days == 0
    assert s1.overall_mean_duration_minutes == 436.75
    assert s1.overall_mean_efficiency_pct == 88.24

    s2 = summaries["C1G0002"]
    assert s2.valid_days == 62
    assert s2.missing_days == 7
    assert s2.medication_days == 21

    s3 = summaries["C1G0003"]
    assert s3.valid_days == 59
    assert s3.missing_days == 10
    assert s3.medication_days == 23


def test_missing_data_audit(loader):
    """Verify audit of missing observations."""
    records = loader.load_harmonized_dataset()
    audit = audit_missing_observations(records)

    assert audit.total_records == 207
    assert audit.total_missing_records == 17
    assert audit.overall_missing_pct == 8.21
    assert audit.missing_by_subject == {"C1G0002": 7, "C1G0003": 10}
    assert audit.missing_by_phase == {"PRE_TEST": 4, "IN_TEST": 13}
    assert len(audit.missing_dates_per_subject["C1G0002"]) == 7
    assert len(audit.missing_dates_per_subject["C1G0003"]) == 10


def test_research_report_generation(loader):
    """Verify full compilation of research report and limitations boundary."""
    records = loader.load_harmonized_dataset()
    report = generate_research_report(records)

    assert report.dataset_id == "nasa_brsmact"
    assert report.total_observations == 207
    assert report.cohort_subjects == ["C1G0001", "C1G0002", "C1G0003"]
    assert len(report.in_test_trajectory) == 60  # Days 1 to 60

    # Ensure Day 1 through Day 60 are present
    days = [pt.br_day for pt in report.in_test_trajectory]
    assert days == list(range(1, 61))

    # Verify limitations disclaimer is prominent
    assert "CRITICAL SCIENTIFIC DISCLAIMER" in report.scientific_limitations
    assert "exactly 3 human subjects" in report.scientific_limitations
    assert "MUST NOT be used to train general astronaut" in report.scientific_limitations
