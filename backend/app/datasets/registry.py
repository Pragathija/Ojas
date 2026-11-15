"""
Ojas Dataset Registry.
Authoritative registry of external biomedical and spaceflight scientific datasets.
Provides dataset provenance, population characterization, licensing, citations,
and strict operational boundaries between real research, spaceflight analog,
simulated telemetry, and synthetic demo data.
"""

from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class DatasetCategory(str, Enum):
    REAL_RESEARCH = "REAL_RESEARCH"
    SPACEFLIGHT_ANALOG = "SPACEFLIGHT_ANALOG"
    SIMULATED_TELEMETRY = "SIMULATED_TELEMETRY"
    SYNTHETIC_DEMO = "SYNTHETIC_DEMO"


class PopulationType(str, Enum):
    ASTRONAUT_ANALOG = "ASTRONAUT_ANALOG"
    ICU_CLINICAL = "ICU_CLINICAL"
    CARDIOLOGY_AMBULATORY = "CARDIOLOGY_AMBULATORY"
    SLEEP_LAB_COMMUNITY = "SLEEP_LAB_COMMUNITY"
    HEALTHY_ADULT_LAB = "HEALTHY_ADULT_LAB"
    SYNTHETIC_MODEL = "SYNTHETIC_MODEL"


class DatasetMetadata(BaseModel):
    dataset_id: str = Field(..., description="Unique slug for the dataset")
    name: str = Field(..., description="Full scientific title")
    category: DatasetCategory = Field(..., description="Provenance category")
    source_url: str = Field(..., description="Authoritative repository URL")
    license: str = Field(..., description="Official distribution license")
    citation: str = Field(..., description="Peer-reviewed scientific citation / DOI")
    available_measurements: List[str] = Field(..., description="Raw physiological/behavioral signals present")
    population_type: PopulationType = Field(..., description="Demographic and clinical context of subjects")
    sampling_frequency: str = Field(..., description="Sampling rate (e.g. '125 Hz', '1 Hz', '30s epochs')")
    access_restrictions: str = Field(..., description="Access tier (Open, Credentialed, Registration)")
    intended_ojas_module: str = Field(..., description="Target Ojas component evaluated by this dataset")
    format_types: List[str] = Field(..., description="Supported raw file formats: CSV, JSON, WFDB, EDF")
    redistribution_policy: str = Field(..., description="Policy on bundling raw files in repository")
    limitations_disclaimer: str = Field(..., description="Explicit physiological translation boundary disclaimer")


DATASET_REGISTRY: Dict[str, DatasetMetadata] = {
    "nasa_osdr": DatasetMetadata(
        dataset_id="nasa_osdr",
        name="NASA Open Science Data Repository: Spaceflight & Analog Human Telemetry",
        category=DatasetCategory.SPACEFLIGHT_ANALOG,
        source_url="https://osdr.nasa.gov/bio/",
        license="NASA Open Science Data Policy (U.S. Public Domain / No Copyright in US)",
        citation="NASA GeneLab / Open Science Data Repository (OSDR). Studies OSD-379 & OSD-546: Human Spaceflight & Ground-based Analog Telemetry. DOI: 10.26030/d9v3-7e44.",
        available_measurements=[
            "heart_rate",
            "blood_pressure_systolic",
            "blood_pressure_diastolic",
            "body_temperature",
            "sleep_duration",
            "activity_counts",
            "circadian_phase"
        ],
        population_type=PopulationType.ASTRONAUT_ANALOG,
        sampling_frequency="Varies (1 Hz to 1 reading/minute; daily aggregates)",
        access_restrictions="Public Open Access (De-identified aggregated human data; controlled access for raw genomic arrays)",
        intended_ojas_module="Baseline calculation, circadian trend engine, spaceflight physiological drift detection",
        format_types=["CSV", "JSON"],
        redistribution_policy="Permitted with citation. Bundled samples must use de-identified public-tier aggregates.",
        limitations_disclaimer="Ground-based analog (bed rest / confinement) data simulates microgravity fluid shifts and isolation, but lacks cosmic ionizing radiation exposure and true extravehicular microgravity workload."
    ),
    "physionet_bidmc": DatasetMetadata(
        dataset_id="physionet_bidmc",
        name="BIDMC PPG and Respiration Dataset (PhysioNet)",
        category=DatasetCategory.REAL_RESEARCH,
        source_url="https://physionet.org/content/bidmc/1.0.0/",
        license="Open Data Commons Attribution License v1.0 (ODC-By 1.0)",
        citation="Pimentel MA, Johnson AE, Charlton PH, et al. Toward a Robust Estimation of Respiratory Rate: Evaluation of Algorithms on Data From the Beth Israel Deaconess Medical Center. Annals of Biomedical Engineering, 2016. PhysioNet: https://doi.org/10.13026/C20P48.",
        available_measurements=[
            "plethysmograph_ppg",
            "impedance_respiration",
            "ecg_v_lead",
            "heart_rate",
            "blood_oxygen",
            "respiration_rate"
        ],
        population_type=PopulationType.ICU_CLINICAL,
        sampling_frequency="125 Hz for raw signals (PPG, ECG, Resp); 1 Hz for vital numerics (HR, SpO2, RR)",
        access_restrictions="Open Access under PhysioNet Credentialed / ODC-By 1.0 terms",
        intended_ojas_module="SpO2 pattern evaluation, respiratory/hypoxemia rule sensitivity, and photoplethysmogram signal validation",
        format_types=["CSV", "WFDB"],
        redistribution_policy="Permitted under ODC-By 1.0 with attribution. Minimal representative slices bundled for offline testing.",
        limitations_disclaimer="Subjects are hospitalized ICU patients with baseline pathology (e.g. sepsis, respiratory insufficiency, multi-organ distress). Must NEVER be used as nominal physiological reference for healthy astronauts in space."
    ),
    "mit_bih": DatasetMetadata(
        dataset_id="mit_bih",
        name="MIT-BIH Arrhythmia Database (PhysioNet)",
        category=DatasetCategory.REAL_RESEARCH,
        source_url="https://physionet.org/content/mitdb/1.0.0/",
        license="Open Data Commons Attribution License v1.0 (ODC-By 1.0)",
        citation="Moody GB, Mark RG. The impact of the MIT-BIH Arrhythmia Database. IEEE Eng in Med and Biol 20(3):45-50 (May-June 2001). PhysioNet: https://doi.org/10.13026/C2F305.",
        available_measurements=[
            "ecg_lead_ii",
            "ecg_modified_lead_v1",
            "beat_annotations",
            "instantaneous_heart_rate"
        ],
        population_type=PopulationType.CARDIOLOGY_AMBULATORY,
        sampling_frequency="360 Hz per channel; beat annotation timestamps to 1/360 second",
        access_restrictions="Public Open Access (PhysioNet)",
        intended_ojas_module="Cardiovascular anomaly detection, tachycardia/bradycardia rule testing, and Isolation Forest benchmark evaluation",
        format_types=["CSV", "WFDB"],
        redistribution_policy="Permitted under ODC-By 1.0 with attribution. Cleaned beat-summary extracts bundled.",
        limitations_disclaimer="Comprises terrestrial ambulatory patients with high incidence of cardiac arrhythmias. Useful for stress-testing anomaly detectors, but does not reflect microgravity cardiovascular deconditioning."
    ),
    "sleep_edf": DatasetMetadata(
        dataset_id="sleep_edf",
        name="Sleep-EDF Database Expanded (PhysioNet)",
        category=DatasetCategory.REAL_RESEARCH,
        source_url="https://physionet.org/content/sleep-edfx/1.0.0/",
        license="Open Data Commons Attribution License v1.0 (ODC-By 1.0)",
        citation="Kemp B, Zwinderman AH, Tuxhorn B, Kamphuisen HA. Analysis of a sleep-dependent neuronal feedback loop: the slow-wave microcontinuity of the human electroencephalogram. IEEE-BME 47(9):1185-1194 (2000). PhysioNet: https://doi.org/10.13026/C2X676.",
        available_measurements=[
            "eeg_fpz_cz",
            "eeg_pz_oz",
            "eog_horizontal",
            "emg_submental",
            "body_temperature_rectal",
            "hypnogram_sleep_stages",
            "sleep_duration"
        ],
        population_type=PopulationType.SLEEP_LAB_COMMUNITY,
        sampling_frequency="100 Hz for EEG/EOG; 1 Hz for submental EMG; 30-second epoch hypnograms",
        access_restrictions="Public Open Access (PhysioNet)",
        intended_ojas_module="Sleep duration evaluation, sleep architecture fragmentation, and sleep debt progression modeling",
        format_types=["CSV", "JSON", "EDF"],
        redistribution_policy="Permitted under ODC-By 1.0. Extracted 30-second epoch hypnograms and duration aggregates bundled.",
        limitations_disclaimer="Terrestrial circadian sleep studies. Microgravity sleep disruption is influenced by fluid shifts, lack of vestibular gravity cues, 90-minute orbital lighting cycles, and ISS acoustic background noise."
    ),
    "wesad": DatasetMetadata(
        dataset_id="wesad",
        name="WESAD: Wearable Stress and Affect Detection",
        category=DatasetCategory.REAL_RESEARCH,
        source_url="https://ubicomp.eti.uni-siegen.de/home/datasets/icmi18/",
        license="Academic Research License / CC BY-NC-SA 4.0",
        citation="Schmidt P, Reiss A, Duerichen R, Clausen C, Van Laerhoven K. Introducing WESAD, a Multimodal Dataset for Wearable Stress and Affect Detection. In Proceedings of the 20th ACM International Conference on Multimodal Interaction (ICMI '18), 2018. DOI: 10.1145/3242969.3242985.",
        available_measurements=[
            "bvp_blood_volume_pulse",
            "heart_rate",
            "electrodermal_activity_eda",
            "skin_temperature",
            "respiration",
            "accelerometer_3axis",
            "stress_condition_label"
        ],
        population_type=PopulationType.HEALTHY_ADULT_LAB,
        sampling_frequency="700 Hz (RespiBAN chest); 64 Hz (E4 BVP); 4 Hz (E4 EDA / Temp); 1 Hz condition labels",
        access_restrictions="Open for non-commercial academic research upon request/download from Siegen Ubicomp portal",
        intended_ojas_module="Psychophysiological stress index evaluation, thermal response validation, and multi-sensor stress benchmarking",
        format_types=["CSV", "JSON"],
        redistribution_policy="Raw multi-gigabyte archives may not be redistributed without Siegen agreement. Lightweight synthetic fixtures mirroring precise WESAD multi-sensor schema are provided for offline unit tests.",
        limitations_disclaimer="Laboratory-induced acute psychosocial stress via the Trier Social Stress Test (TSST). Astronaut stressors also encompass isolation, microgravity confinement, high-consequence operational tasks, and sleep disruption."
    )
}


def get_dataset_metadata(dataset_id: str) -> DatasetMetadata:
    """Retrieve metadata for a registered dataset by its slug."""
    if dataset_id not in DATASET_REGISTRY:
        raise KeyError(
            f"Dataset '{dataset_id}' not found in Ojas registry. "
            f"Available datasets: {list(DATASET_REGISTRY.keys())}"
        )
    return DATASET_REGISTRY[dataset_id]


def list_all_datasets() -> List[DatasetMetadata]:
    """List all registered dataset metadata entries."""
    return list(DATASET_REGISTRY.values())


def get_datasets_by_category(category: DatasetCategory) -> List[DatasetMetadata]:
    """Filter registered datasets by their provenance category."""
    return [d for d in DATASET_REGISTRY.values() if d.category == category]
