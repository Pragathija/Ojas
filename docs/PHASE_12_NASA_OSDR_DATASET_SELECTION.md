# Phase 12 — NASA OSDR Dataset Selection, Discovery & Suitability Evaluation

## 1. Executive Summary & Selection Objective
Phase 12 establishes a scientifically traceable integration between the official **NASA Open Science Data Repository (OSDR)** and Project Ojas. 

The primary objective of dataset selection was to discover and acquire authentic, peer-reviewed human spaceflight biomedical data that:
1. Comprises real human astronaut observations from a defined spaceflight mission.
2. Contains longitudinal timepoints spanning pre-flight baseline, acute spaceflight response, and mission recovery.
3. Provides authentic laboratory reference ranges and units (e.g., mg/dL, mmol/L, cells/$\mu$L).
4. Demonstrates clear, complementary physiological value alongside the continuous vitals monitoring architecture of Ojas without falsely conflating retrospective biospecimen omics with continuous sensor telemetry.

---

## 2. Official NASA OSDR Resources Consulted
- **Primary Repository:** [NASA Open Science Data Repository (OSDR)](https://osdr.nasa.gov/)
- **Documentation & Standards:** [NASA OSDR Overview & Data Guidelines](https://science.nasa.gov/biological-physical/data/osdr/)
- **Public REST API Root:** `https://osdr.nasa.gov/osdr/data/`
  - Study Metadata Endpoint: `/osd/meta/{accession}`
  - Study File Listing Endpoint: `/osd/files/{accession}`
  - Dataset Search Endpoint: `/search?term={query}`
  - Direct File Download Endpoint: `https://osdr.nasa.gov/geode-py/ws/studies/{accession}/download?source=datamanager&file={filename}`
- **Reference Publications:** Space Omics and Medical Atlas (SOMA), *Nature* 632, 2024.

---

## 3. Dataset Evaluation & Suitability Matrix

Three principal candidate accessions were evaluated using live REST queries to `https://osdr.nasa.gov/osdr/data/`:

| Evaluation Criterion | Candidate 1: OSD-575 | Candidate 2: OSD-569 | Candidate 3: OSD-379 |
| :--- | :--- | :--- | :--- |
| **Official Study Title** | *SpaceX Inspiration4 Blood Serum Metabolic Panel and Immune/Cardiac Cytokine Arrays* | *Whole Blood Measurements from the SpaceX Inspiration4 Mission* | *Biochemical and Hematological Profile in Astronauts During Long Duration Spaceflight* |
| **NASA Accession ID** | `OSD-575` | `OSD-569` | `OSD-379` |
| **Organism & Subjects** | *Homo sapiens* (4 commercial astronauts: C001, C002, C003, C004) | *Homo sapiens* (4 commercial astronauts: C001, C002, C003, C004) | *Homo sapiens* (Anonymous ISS crew members) |
| **Mission / Platform** | SpaceX Inspiration4 (3-day low Earth orbit, 585 km apogee, Sept 2021) | SpaceX Inspiration4 (3-day low Earth orbit, 585 km apogee, Sept 2021) | International Space Station (ISS Expeditions) |
| **Sample Count & Timepoints** | 28 serum samples across 7 longitudinal timepoints: `L-92`, `L-44`, `L-3`, `R+1`, `R+45`, `R+82`, `R+194` | 28 whole-blood samples across the exact same 7 longitudinal timepoints | Sparse sample timepoints; pooled multi-mission records |
| **Assay Technology** | Beckman Coulter AU5800 (CMP) & Eve Technologies Multiplex Arrays | Quest Diagnostics Automated Hematology Analyzer | Mixed legacy ground laboratory clinical analyzers |
| **Measurement Variables** | 14 Comprehensive Metabolic Panel analytes + 9 cardiovascular + 12 immune cytokines | Complete Blood Count with differential (WBC, RBC, Hemoglobin, Hematocrit, Platelets, Neutrophils, Lymphocytes) | Standard ISS medical chemistry metrics |
| **File Format & Accessibility** | Open access CSV transformed tables & ISA-Tab zip archives | Open access CSV transformed tables & ISA-Tab zip archives | Tabular text files; limited metadata harmonization |
| **Access Restrictions** | Fully public / Open access via NASA OSDR Data Manager | Fully public / Open access via NASA OSDR Data Manager | Fully public |
| **Suitability Verdict** | **SELECTED (Primary Serum Analytics)** | **SELECTED (Complementary Hematology)** | Rejected (Superseded by Inspiration4 SOMA Cohort) |

---

## 4. Final Selection Rationale: Dual Integration of OSD-575 and OSD-569

Rather than selecting a single isolated dataset, Ojas integrates both **OSD-575** and **OSD-569**.

### Scientific & Technical Justification:
1. **Identical Astronaut Cohort**: Both datasets study the exact same 4 crew members (`C001`, `C002`, `C003`, `C004`) of the historic SpaceX Inspiration4 mission—the first all-civilian orbital spaceflight.
2. **Synchronized Longitudinal Timepoints**: Both datasets capture identical biospecimen collection epochs:
   - **Pre-flight baseline**: Launch minus 92 days (`L-92`), minus 44 days (`L-44`), and minus 3 days (`L-3`).
   - **Acute spaceflight recovery**: Return plus 1 day (`R+1`) immediately after splashdown in the Atlantic Ocean.
   - **Post-flight convalescence & re-adaptation**: Return plus 45 days (`R+45`), plus 82 days (`R+82`), and plus 194 days (`R+194`).
3. **Cross-Modal Clinical Synergy**:
   - `OSD-575` supplies clinical biochemistry (kidney function, liver enzymes, electrolytes, fasting glucose) and acute-phase inflammatory cytokines (CRP, alpha-2 macroglobulin, AGP).
   - `OSD-569` supplies cellular hematology (white blood cell differential, immune lymphocyte shifts, platelet counts, red cell volume).
4. **Peer-Reviewed Scientific Lineage**: Both datasets form core components of the Space Omics and Medical Atlas (SOMA), published in *Nature* (2024).
