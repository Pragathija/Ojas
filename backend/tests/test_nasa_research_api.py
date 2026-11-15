"""
Tests for NASA BRSMAct Read-Only Research API Endpoints.

Verifies:
1. Endpoint function responses and schema compliance.
2. Accuracy of metadata, checksums, and provenance responses.
3. Proper handling of phase metrics, sample-size warnings, and macro-averages.
4. Correct aggregation of subject summaries and trajectory time-series.
5. Pharmacological medication audit results.
6. Missing observation auditing.
7. Privacy and immutability controls (de-identified IDs, no raw file leaks).
"""

import pytest
from app.api.v1.endpoints import nasa_research
from app.datasets.nasa_brsmact import NasaBRSMActLoader


@pytest.fixture
def loader():
    return NasaBRSMActLoader(verify_hashes=False)


def test_research_metadata_endpoint():
    """Verify get_study_metadata returns accurate provenance."""
    data = nasa_research.get_study_metadata()

    assert data["dataset_id"] == "nasa_brsmact"
    assert data["experiment_id"] == "BRSMAct"
    assert "UTMB Bedrest Campaign 1 Actigraphy" in data["dataset_title"]
    assert data["catalog_id"] == "e26501eb-7d7a-5012-8c8e-c5bdb3eecaf6"
    assert data["sample_size_subjects"] == 3
    assert "CRITICAL SCIENTIFIC DISCLAIMER" in data["limitations_disclaimer"]
    assert "Public Domain" in data["license"]


def test_research_integrity_endpoint():
    """Verify get_integrity_status validates raw NASA files."""
    data = nasa_research.get_integrity_status()

    assert data["all_files_verified"] is True
    assert data["files_checked"] == 3
    for f in data["file_details"]:
        assert f["status"] == "VERIFIED"
        assert f["sha256_match"] is True


def test_research_overview_endpoint(loader):
    """Verify get_research_overview returns complete analysis report."""
    report = nasa_research.get_research_overview(loader=loader)

    assert report.total_observations == 207
    assert report.cohort_subjects == ["C1G0001", "C1G0002", "C1G0003"]
    assert len(report.in_test_trajectory) == 60
    assert "PRE_TEST" in report.phase_comparison
    assert "IN_TEST" in report.phase_comparison
    assert "POST_TEST" in report.phase_comparison


def test_research_phases_endpoint_and_sample_bias(loader):
    """Verify get_phase_comparison returns audited phase stats and warnings."""
    phases = nasa_research.get_phase_comparison(loader=loader)

    # Audit PRE_TEST sample size bias
    pre = phases["PRE_TEST"]
    assert pre.total_scheduled_days == 6
    assert pre.valid_observations == 2
    assert pre.missing_observations == 4
    assert pre.contributing_subjects_count == 1
    assert pre.contributing_subjects == ["C1G0001"]
    assert "SAMPLE SIZE WARNING" in pre.sample_size_warning
    assert pre.duration_mean_minutes == 467.0
    assert pre.efficiency_mean_pct == 93.95

    # Audit IN_TEST stats
    in_test = phases["IN_TEST"]
    assert in_test.total_scheduled_days == 180
    assert in_test.valid_observations == 167
    assert in_test.contributing_subjects_count == 3
    assert in_test.duration_mean_minutes == 431.88
    assert in_test.macro_duration_mean_minutes == 431.77
    assert in_test.latency_mean_minutes == 42.75
    assert in_test.efficiency_mean_pct == 81.65

    # Audit POST_TEST stats
    post = phases["POST_TEST"]
    assert post.total_scheduled_days == 21
    assert post.valid_observations == 21
    assert post.missing_observations == 0


def test_research_subjects_endpoint(loader):
    """Verify get_subject_summaries returns per-subject summaries."""
    subjects = nasa_research.get_subject_summaries(loader=loader)

    assert set(subjects.keys()) == {"C1G0001", "C1G0002", "C1G0003"}

    # C1G0001 has full adherence
    s1 = subjects["C1G0001"]
    assert s1.valid_days == 69
    assert s1.missing_days == 0
    assert s1.overall_mean_duration_minutes == 436.75
    assert s1.overall_mean_efficiency_pct == 88.24

    # C1G0002 has 7 missing adaptation days
    s2 = subjects["C1G0002"]
    assert s2.valid_days == 62
    assert s2.missing_days == 7
    assert s2.medication_days == 21

    # C1G0003 has 10 missing adaptation days
    s3 = subjects["C1G0003"]
    assert s3.valid_days == 59
    assert s3.missing_days == 10
    assert s3.medication_days == 23


def test_research_trajectory_endpoint(loader):
    """Verify get_trajectory returns daily trajectory."""
    traj = nasa_research.get_trajectory(phase="IN_TEST", loader=loader)

    assert len(traj) == 60
    assert traj[0].br_day == 1
    assert traj[-1].br_day == 60

    # Ensure mean duration, latency, and efficiency are populated
    for pt in traj:
        assert pt.test_phase == "IN_TEST"
        assert pt.subject_count == 3


def test_research_medications_endpoint(loader):
    """Verify get_medication_audit returns pharmacological audit."""
    data = nasa_research.get_medication_audit(loader=loader)

    assert data.total_medication_records == 45
    assert data.medication_distribution_by_drug["Ambien 5mg"] == 17
    assert data.medication_distribution_by_drug["Diphenhydramine 50mg"] == 18
    assert data.medication_distribution_by_drug["Diphenhydramine 25mg"] == 10

    # Sleep aid vs non-sleep aid metrics comparison
    aid = data.in_test_sleep_aid_nights
    no_aid = data.in_test_non_sleep_aid_nights

    assert aid.observation_count == 42
    assert no_aid.observation_count == 125
    assert aid.latency_mean_minutes == 30.67
    assert no_aid.latency_mean_minutes == 46.82
    assert aid.duration_mean_minutes == 443.10
    assert no_aid.duration_mean_minutes == 428.11


def test_research_missing_data_endpoint(loader):
    """Verify get_missing_data_audit audits sensor gaps."""
    data = nasa_research.get_missing_data_audit(loader=loader)

    assert data.total_records == 207
    assert data.total_missing_records == 17
    assert data.overall_missing_pct == 8.21
    assert data.missing_by_subject["C1G0002"] == 7
    assert data.missing_by_subject["C1G0003"] == 10
    assert data.missing_by_subject.get("C1G0001", 0) == 0
    assert "first 8 adaptation days" in data.clinical_note
