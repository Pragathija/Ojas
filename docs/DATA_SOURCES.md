# Scientific Dataset Registry & Provenance Specification

**Project Ojas — NASA Space Apps Challenge 2026**

---

## 1. Executive Summary

Project Ojas is an intelligent astronaut health monitoring system designed for long-duration space exploration missions. To validate the AI engine and deterministic physiological rules without fabricating medical baselines, Ojas integrates five gold-standard open scientific datasets.

This document establishes the official registry, access conditions, license metadata, measurement schemas, and critical population-translation limitations for all integrated repositories.

---

## 2. Integrated Dataset Registry

### 2.1 NASA Open Science Data Repository (OSDR)
- **Dataset Slug**: `nasa_osdr`
- **Official Name**: NASA OSDR Spaceflight & Analog Human Telemetry
- **Source URL**: [https://osdr.nasa.gov/bio/](https://osdr.nasa.gov/bio/)
- **License**: NASA Open Science Data Policy (U.S. Public Domain / CC0 Equivalent)
- **Provenance Category**: `SPACEFLIGHT_ANALOG`
- **Population**: Astronaut crew members and terrestrial analog mission participants (HERA, NEEMO, Head-Down Tilt Bed Rest).
- **Available Measurements**: Heart Rate (BPM), Blood Pressure (Systolic/Diastolic mmHg), Core Body Temperature (°C), Actigraphy activity counts, Sleep duration (hrs), Circadian phase index.
- **Sampling Frequency**: Multi-modal (1 Hz continuous during task monitoring; discrete daily vital averages).
- **Intended Ojas Component**: Evaluates personal baseline calculation engine and longitudinal microgravity physiological drift.
- **Scientific Limitation**: Terrestrial isolation and bed rest analogs emulate microgravity cephalad fluid shifts and psychosocial isolation, but cannot replicate the combined stress of secondary cosmic radiation and lunar/Martian fractional gravity ($0.16g / 0.38g$).

### 2.2 PhysioNet BIDMC PPG and Respiration Dataset
- **Dataset Slug**: `physionet_bidmc`
- **Official Name**: BIDMC PPG and Respiration Dataset
- **Source URL**: [https://physionet.org/content/bidmc/1.0.0/](https://physionet.org/content/bidmc/1.0.0/)
- **License**: Open Data Commons Attribution License v1.0 (ODC-By 1.0)
- **Provenance Category**: `REAL_RESEARCH`
- **Population**: 53 adult Intensive Care Unit (ICU) patients at Beth Israel Deaconess Medical Center, Boston, MA.
- **Available Measurements**: Photoplethysmogram (PPG, 125 Hz), Impedance Respiration (125 Hz), Lead II ECG (125 Hz), Numeric SpO₂ (1 Hz, %), Numeric Heart Rate (1 Hz, BPM), Numeric Respiration Rate (1 Hz, breaths/min).
- **Intended Ojas Component**: Evaluates SpO₂ hypoxemia detection sensitivity ($< 94\%$ caution, $< 90\%$ critical) and photoplethysmogram noise rejection.
- **Scientific Limitation**: **Critical Translation Boundary** — ICU patients present with severe baseline comorbidities (pulmonary edema, sepsis, chronic obstructive lung disease, pharmacological sedation). They must **never** be interpreted as nominal baseline values for healthy spaceflight astronauts.

### 2.3 MIT-BIH Arrhythmia Database
- **Dataset Slug**: `mit_bih`
- **Official Name**: MIT-BIH Arrhythmia Database (PhysioNet)
- **Source URL**: [https://physionet.org/content/mitdb/1.0.0/](https://physionet.org/content/mitdb/1.0.0/)
- **License**: Open Data Commons Attribution License v1.0 (ODC-By 1.0)
- **Provenance Category**: `REAL_RESEARCH`
- **Population**: 47 ambulatory terrestrial cardiology patients (25 men aged 32–89; 22 women aged 23–89).
- **Available Measurements**: 2-channel modified limb lead ECG (360 Hz per channel) with certified expert beat-by-beat annotations (Normal beat, Ventricular ectopic beat, Atrial premature contraction, Tachycardia, Bradycardia).
- **Intended Ojas Component**: Benchmarking cardiovascular anomaly detection algorithms (Isolation Forest precision/recall) and validating resting tachycardia ($> 120\text{ BPM}$) / bradycardia ($< 50\text{ BPM}$) threshold triggers.
- **Scientific Limitation**: Captures pathological terrestrial arrhythmias. Astronaut cardiovascular adaptations primarily involve stroke volume reduction, sinus tachycardia during EVA workload, and orthostatic intolerance upon gravitational re-entry.

### 2.4 Sleep-EDF Database Expanded
- **Dataset Slug**: `sleep_edf`
- **Official Name**: Sleep-EDF Database Expanded (PhysioNet)
- **Source URL**: [https://physionet.org/content/sleep-edfx/1.0.0/](https://physionet.org/content/sleep-edfx/1.0.0/)
- **License**: Open Data Commons Attribution License v1.0 (ODC-By 1.0)
- **Provenance Category**: `REAL_RESEARCH`
- **Population**: 197 polysomnographic whole-night recordings across two cohorts: 78 healthy subjects (aged 20–101) and 22 subjects with mild sleep initiation complaints.
- **Available Measurements**: EEG (Fpz-Cz / Pz-Oz, 100 Hz), EOG (100 Hz), submental chin EMG (1 Hz), event markers, and 30-second epoch hypnograms scored into standard Rechtschaffen & Kales (R&K) sleep stages (Wake, N1, N2, N3, N4, REM).
- **Intended Ojas Component**: Evaluates sleep duration tracking, stage fragmentation, sleep debt accumulation, and circadian sleep-wake schedule scoring.
- **Scientific Limitation**: Terrestrial sleep polysomnography does not account for sleep disruption caused by microgravity body tethering, elevated ISS ambient carbon dioxide ($P_{\text{CO}_2} \sim 2\text{–}4\text{ mmHg}$), 90-minute orbital sunrises, or spacecraft equipment acoustic noise.

### 2.5 WESAD (Wearable Stress and Affect Detection)
- **Dataset Slug**: `wesad`
- **Official Name**: WESAD Multimodal Dataset for Wearable Stress and Affect Detection
- **Source URL**: [https://ubicomp.eti.uni-siegen.de/home/datasets/icmi18/](https://ubicomp.eti.uni-siegen.de/home/datasets/icmi18/)
- **License**: Non-commercial Academic Research License / CC BY-NC-SA 4.0
- **Provenance Category**: `REAL_RESEARCH`
- **Population**: 15 healthy adult subjects in a structured laboratory psychological stress protocol (Trier Social Stress Test - TSST).
- **Available Measurements**:
  - *Chest (RespiBAN, 700 Hz)*: ECG, Electrodermal Activity (EDA), Electromyogram (EMG), Respiration, Skin Temperature, 3-axis Accelerometer.
  - *Wrist (Empatica E4)*: Blood Volume Pulse (BVP, 64 Hz), EDA (4 Hz), Skin Temperature (4 Hz), 3-axis Accelerometer (32 Hz).
  - *Ground-Truth Condition Labels (1 Hz)*: Baseline / Neutral (1), Stress / TSST (2), Amusement (3), Meditation / Recovery (4).
- **Intended Ojas Component**: Evaluates psychophysiological stress index classification, skin temperature variation, and multi-sensor stress anomaly detection.
- **Scientific Limitation**: Laboratory stress protocols are acute and transient (~15–30 minutes). Deep space missions involve chronic microgravity stressors, operational workload pressure, prolonged confinement, and mission-critical decision fatigue.

---

## 3. Provenance & Non-Conflation Matrix

```
+---------------------------------------------------------------------------------------------------+
| PROVENANCE TIER        | SOURCE IDENTIFIER      | POPULATION TYPE         | ETHICAL RESTRICTIONS  |
+---------------------------------------------------------------------------------------------------+
| SPACEFLIGHT_ANALOG     | NASA OSDR (OSD-379)    | Healthy Flight Analogs  | Public de-identified  |
| REAL_RESEARCH          | PhysioNet BIDMC        | Hospitalized ICU Adult  | Strictly Non-Astronaut|
| REAL_RESEARCH          | PhysioNet MIT-BIH      | Ambulatory Cardiology   | Terrestrial Pathology |
| REAL_RESEARCH          | PhysioNet Sleep-EDF    | Sleep Lab Community     | Non-Microgravity      |
| REAL_RESEARCH          | WESAD                  | Healthy Lab Adult TSST  | Non-Commercial Only   |
| SIMULATED_TELEMETRY    | Ojas Simulation Engine | Mathematical Models     | Clearly labeled Sim   |
| SYNTHETIC_DEMO         | Ojas Seed Generator    | Synthetic Astronauts    | Clearly labeled Demo  |
+---------------------------------------------------------------------------------------------------+
```

---

## 4. Formal Scientific Citations

```bibtex
@article{nasa_osdr_2023,
  title={NASA Open Science Data Repository: Advancing Space Biology and Human Spaceflight Research},
  author={{NASA GeneLab & Space Biology Consortia}},
  journal={NASA Biological and Physical Sciences},
  volume={OSD-379},
  year={2023},
  doi={10.26030/d9v3-7e44}
}

@article{pimentel2016bidmc,
  title={Toward a Robust Estimation of Respiratory Rate: Evaluation of Algorithms on Data From the Beth Israel Deaconess Medical Center},
  author={Pimentel, Marco AF and Johnson, Alistair EW and Charlton, Peter H and et al.},
  journal={Annals of Biomedical Engineering},
  volume={45},
  number={1},
  pages={191--204},
  year={2016},
  doi={10.1007/s10439-016-1613-3}
}

@article{moody2001mitbih,
  title={The impact of the MIT-BIH Arrhythmia Database},
  author={Moody, George B and Mark, Roger G},
  journal={IEEE Engineering in Medicine and Biology Magazine},
  volume={20},
  number={3},
  pages={45--50},
  year={2001},
  doi={10.1109/51.932724}
}

@article{kemp2000sleepedf,
  title={Analysis of a sleep-dependent neuronal feedback loop: the slow-wave microcontinuity of the human electroencephalogram},
  author={Kemp, Bob and Zwinderman, Aeilko H and Tuxhorn, Bernhard and Kamphuisen, Huub A},
  journal={IEEE Transactions on Biomedical Engineering},
  volume={47},
  number={9},
  pages={1185--1194},
  year={2000},
  doi={10.1109/10.867928}
}

@inproceedings{schmidt2018wesad,
  title={Introducing WESAD, a Multimodal Dataset for Wearable Stress and Affect Detection},
  author={Schmidt, Philip and Reiss, Attila and Duerichen, Robert and Clausen, Claus and Van Laerhoven, Kristof},
  booktitle={Proceedings of the 20th ACM International Conference on Multimodal Interaction (ICMI '18)},
  pages={400--408},
  year={2018},
  doi={10.1145/3242969.3242985}
}
```
