from pathlib import Path
import pytest

from app.datasets.registry import (
    DATASET_REGISTRY,
    DatasetCategory,
    PopulationType,
    get_dataset_metadata,
    list_all_datasets,
    get_datasets_by_category,
)
from app.datasets.loaders import (
    get_loader,
    NasaOsdrLoader,
    BidmcLoader,
    MitBihLoader,
    SleepEdfLoader,
    WesadLoader,
)

SAMPLE_DIR = Path(__file__).resolve().parent.parent / "data" / "sample"


def test_dataset_registry_completeness():
    expected_ids = ["nasa_osdr", "physionet_bidmc", "mit_bih", "sleep_edf", "wesad"]
    all_datasets = list_all_datasets()
    assert len(all_datasets) == 5

    for d_id in expected_ids:
        meta = get_dataset_metadata(d_id)
        assert meta.dataset_id == d_id
        assert meta.name
        assert meta.source_url.startswith("http")
        assert meta.license
        assert meta.citation
        assert len(meta.available_measurements) >= 3
        assert meta.intended_ojas_module
        assert meta.limitations_disclaimer


def test_dataset_provenance_separation():
    spaceflight = get_datasets_by_category(DatasetCategory.SPACEFLIGHT_ANALOG)
    research = get_datasets_by_category(DatasetCategory.REAL_RESEARCH)

    assert len(spaceflight) == 1
    assert spaceflight[0].dataset_id == "nasa_osdr"
    assert spaceflight[0].population_type == PopulationType.ASTRONAUT_ANALOG

    research_ids = [d.dataset_id for d in research]
    assert "physionet_bidmc" in research_ids
    assert "mit_bih" in research_ids
    assert "sleep_edf" in research_ids
    assert "wesad" in research_ids


def test_nasa_osdr_loader():
    file_path = SAMPLE_DIR / "nasa_osdr" / "osd_379_sample.csv"
    loader = get_loader("nasa_osdr")
    assert isinstance(loader, NasaOsdrLoader)

    inspection = loader.inspect_file(file_path)
    assert inspection["dataset_id"] == "nasa_osdr"
    assert "heart_rate_bpm" in inspection["columns"]
    assert "systolic_bp_mmhg" in inspection["columns"]

    records = list(loader.parse_records(file_path))
    assert len(records) == 18

    # Verify first record content & provenance
    rec0 = records[0]
    assert rec0["subject_id"] == "HERA-01"
    assert rec0["heart_rate_bpm"] == 68.2
    assert rec0["systolic_bp_mmhg"] == 118.0
    assert rec0["diastolic_bp_mmhg"] == 76.0
    assert rec0["sleep_duration_hrs"] == 7.8
    assert rec0["is_synthetic"] is False
    assert rec0["category"] == DatasetCategory.SPACEFLIGHT_ANALOG.value

    # Verify missing fields in mid-day records are None (not fabricated)
    rec1 = records[1]
    assert rec1["sleep_duration_hrs"] is None
    assert rec1["circadian_phase_deg"] is None


def test_physionet_bidmc_loader():
    file_path = SAMPLE_DIR / "physionet_bidmc" / "bidmc_01_numerics.csv"
    loader = get_loader("physionet_bidmc")
    assert isinstance(loader, BidmcLoader)

    records = list(loader.parse_records(file_path))
    assert len(records) == 30

    rec0 = records[0]
    assert rec0["source_dataset"] == "physionet_bidmc"
    assert rec0["population_type"] == PopulationType.ICU_CLINICAL.value
    assert rec0["blood_oxygen_pct"] == 98.5
    assert rec0["heart_rate_bpm"] == 78.2
    assert rec0["is_synthetic"] is False

    # Check that desaturation episode is captured in data
    desat_records = [r for r in records if r["blood_oxygen_pct"] and r["blood_oxygen_pct"] < 92.0]
    assert len(desat_records) >= 5
    assert any(r["blood_oxygen_pct"] <= 90.0 for r in desat_records)


def test_mitbih_loader():
    file_path = SAMPLE_DIR / "mit_bih" / "mitbih_100_annotations.csv"
    loader = get_loader("mit_bih")
    assert isinstance(loader, MitBihLoader)

    records = list(loader.parse_records(file_path))
    assert len(records) == 22

    # Check normal beat
    normal_beats = [r for r in records if r["beat_type"] == "N"]
    assert len(normal_beats) >= 15
    assert normal_beats[0]["is_ectopic"] is False

    # Check ventricular premature contraction (V)
    pvc_beats = [r for r in records if r["beat_type"] == "V"]
    assert len(pvc_beats) == 3
    assert all(r["is_ectopic"] and r["is_ventricular_ectopy"] for r in pvc_beats)
    assert pvc_beats[1]["instantaneous_heart_rate_bpm"] == 128.5  # Tachycardic beat


def test_sleep_edf_loader():
    file_path = SAMPLE_DIR / "sleep_edf" / "sleep_edf_sc4001e0_hypnogram.csv"
    loader = get_loader("sleep_edf")
    assert isinstance(loader, SleepEdfLoader)

    records = list(loader.parse_records(file_path))
    assert len(records) == 20

    wake_epochs = [r for r in records if r["is_wake_arousal"]]
    deep_epochs = [r for r in records if r["is_deep_sleep"]]
    rem_epochs = [r for r in records if r["is_rem_sleep"]]

    assert len(wake_epochs) == 4   # Initial 3 wake + 1 mid-sleep arousal
    assert len(deep_epochs) == 4   # Stages 3 and 4
    assert len(rem_epochs) == 4    # REM periods
    assert records[0]["duration_seconds"] == 30.0


def test_wesad_loader():
    file_path = SAMPLE_DIR / "wesad" / "wesad_s2_sample.csv"
    loader = get_loader("wesad")
    assert isinstance(loader, WesadLoader)

    records = list(loader.parse_records(file_path))
    assert len(records) == 20

    baseline_recs = [r for r in records if r["condition_label"] == 1]
    stress_recs = [r for r in records if r["condition_label"] == 2]
    meditation_recs = [r for r in records if r["condition_label"] == 4]

    assert len(baseline_recs) == 5
    assert len(stress_recs) == 8
    assert len(meditation_recs) == 7

    # Stress condition should exhibit elevated HR and EDA
    assert all(r["is_stress_ground_truth"] for r in stress_recs)
    avg_baseline_hr = sum(r["heart_rate_bpm"] for r in baseline_recs) / len(baseline_recs)
    avg_stress_hr = sum(r["heart_rate_bpm"] for r in stress_recs) / len(stress_recs)
    assert avg_stress_hr > avg_baseline_hr


def test_chunked_streaming_execution():
    file_path = SAMPLE_DIR / "physionet_bidmc" / "bidmc_01_numerics.csv"
    loader = get_loader("physionet_bidmc")

    # Read with chunksize=5 (6 chunks for 30 rows)
    records = list(loader.parse_records(file_path, chunksize=5))
    assert len(records) == 30


def test_missing_file_handling():
    loader = get_loader("nasa_osdr")
    with pytest.raises(FileNotFoundError):
        loader.inspect_file("non_existent_file.csv")


def test_unknown_dataset_id_error():
    with pytest.raises(KeyError):
        get_loader("invalid_dataset_slug")
