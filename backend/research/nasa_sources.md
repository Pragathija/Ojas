# NASA Open Science Data Repository (OSDR) & Analog Sources

This directory catalogs NASA scientific studies, spaceflight biomedical repositories, and terrestrial mission analogs utilized to inform and validate **Project Ojas**.

---

## 1. Verified NASA OSDR Studies

### Study 1: OSD-379
- **Title**: Multi-system Spaceflight Countermeasure & Physiological Response in ISS Expeditions
- **Repository**: NASA Open Science Data Repository (OSDR / GeneLab)
- **Persistent Identifier**: `OSD-379` | DOI: `10.26030/d9v3-7e44`
- **Focus**: Continuous and discrete physiological monitoring across long-duration missions (cardiovascular metrics, heart rate variability, sleep logs, actigraphy, and biomarkers).
- **Population**: Healthy international crew members aboard the International Space Station (ISS).
- **Relevance to Ojas**:
  - Baseline distribution validation for heart rate and circadian rest-activity cycles in microgravity.
  - Evaluation of baseline adaptation periods (first 14 days in microgravity).

### Study 2: OSD-546
- **Title**: Standard Measures of Astronaut Human Physiology During Long-Duration Spaceflight
- **Repository**: NASA OSDR / Human Research Program (HRP)
- **Persistent Identifier**: `OSD-546`
- **Focus**: Standard measures protocol compiling cardiovascular, immune, sensorimotor, and behavioral metrics across pre-flight, in-flight, and post-flight phases.
- **Measurements**: Blood pressure (brachial oscillometry), resting heart rate, core body temperature (ingestible sensor pill & surface probes), cognitive test batteries.
- **Relevance to Ojas**:
  - Reference parameters for cardiovascular ceilings ($BP > 140/90\text{ mmHg}$, resting $HR > 100\text{ BPM}$).
  - Temperature range benchmarks under microgravity fluid-shift conditions.

### Study 3: BRSMAct (NASA Life Sciences Portal)
- **Title**: Bed Rest Standard Measures: Actilight / Actigraphy (UTMB Bedrest Campaign 1)
- **Repository**: NASA Life Sciences Data Archive (LSDA) / NASA Life Sciences Portal (NLSP)
- **Persistent Identifier**: `e26501eb-7d7a-5012-8c8e-c5bdb3eecaf6` | Experiment ID: `BRSMAct`
- **Source URL**: `https://nlsp.nasa.gov/search/data/details/e26501eb-7d7a-5012-8c8e-c5bdb3eecaf6?dataType=DATASETS`
- **Focus**: Longitudinal wrist actigraphy tracking sleep latency, duration, and efficiency across 60 days of strict 6° Head-Down Tilt Bed Rest (HDTBR) at the UTMB Flight Analogs Research Unit (FARU).
- **Population**: 3 healthy adult human subjects (`C1G0001`, `C1G0002`, `C1G0003`) screened under astronaut-equivalent medical criteria.
- **Relevance to Ojas**:
  - Direct empirical reference for sleep latency elevation and sleep efficiency decay under continuous horizontal confinement.
  - Integration implemented in `app/datasets/nasa_brsmact/` with zero fabricated telemetry.

---

## 2. Ground-Based Spaceflight Analog Research

Astronaut physiology cannot be isolated without comparison to high-fidelity ground analogs:

1. **NASA HERA (Human Exploration Research Analog)**:
   - *Location*: Johnson Space Center (JSC), Houston, TX.
   - *Environment*: Multi-story habitat with high-consequence operational simulation, circadian lighting, and isolation.
   - *Relevance*: Validates cumulative sleep debt, confinement-induced stress telemetry, and communication latency effects.

2. **Head-Down Tilt Bed Rest (HDTBR - :envihab / DLR / NASA)**:
   - *Protocol*: $-6^\circ$ Head-Down Tilt for 30–60 days.
   - *Physiological Phenotype*: Mimics cephalad fluid shifts, reduced plasma volume, and cardiovascular deconditioning seen in microgravity.
   - *Relevance*: Serves as baseline for resting cardiovascular parameters without cosmic radiation confounders.

3. **NEEMO (NASA Extreme Environment Mission Operations)**:
   - *Location*: Aquarius Reef Base, Key Largo, FL.
   - *Relevance*: Saturation diving analog for EVA metabolic expenditure, elevated physical activity minutes, and high-workload respiratory telemetry.

---

## 3. Provenance & Scientific Disclaimer

All NASA-derived studies referenced in Ojas follow NASA's Open Science Initiative and are utilized strictly under public scientific domains.

> **Operational Warning**: Ground-based analog and retrospective astronaut data are used solely to establish mathematical anomaly detection baselines and evaluate multi-sensor correlations. They **must never** be represented as certified operational flight rules or FDA/medical diagnosis algorithms without NASA Flight Surgeon validation.
