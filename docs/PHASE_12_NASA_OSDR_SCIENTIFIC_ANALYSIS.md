# Phase 12 — NASA OSDR Inspiration4 Longitudinal Scientific Research Analysis

## 1. Executive Summary & Research Methodology
Using the acquired datasets (`OSD-575` and `OSD-569`), Project Ojas executed longitudinal statistical analyses comparing immediate pre-flight baseline ($L-3$) to acute post-splashdown recovery ($R+1$), followed by long-term convalescence ($R+45$, $R+82$, $R+194$) across the 4 commercial astronauts of the SpaceX Inspiration4 mission (`C001`, `C002`, `C003`, `C004`).

Empirical analytical results are exported to:
[backend/data/nasa_original/osdr/reports/osdr_inspiration4_scientific_report.json](file:///c:/Users/Pragathija/Documents/Projects/NASA/Ojas/backend/data/nasa_original/osdr/reports/osdr_inspiration4_scientific_report.json).

---

## 2. Longitudinal Spaceflight Shift Findings ($L-3$ vs $R+1$)

| Biological Analyte | Pre-Flight L-3 Mean $\pm$ SD | Post-Flight R+1 Mean $\pm$ SD | Mean Delta ($\Delta$) | % Shift | Physiological Trend & Interpretation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **White Blood Cells** ($\times 10^3/\mu\text{L}$) | $8.65 \pm 1.58$ | $6.40 \pm 1.23$ | $-2.25$ | $-26.0\%$ | **Decreased**: Post-flight cellular redistribution and resolution of pre-launch adrenaline-mediated leukocytosis. |
| **Fasting Glucose** ($\text{mg/dL}$) | $82.50 \pm 5.51$ | $88.50 \pm 4.35$ | $+6.00$ | $+7.3\%$ | **Increased**: Mild acute elevation reflecting re-entry stress and cortisol mobilization. |
| **AST** ($\text{U/L}$) | $26.75 \pm 12.77$ | $26.25 \pm 12.81$ | $-0.50$ | $-1.9\%$ | **Nominal**: Overall cohort stability; individual transient elevations observed in subject C002 ($40 \to 48\text{ U/L}$). |
| **ALT** ($\text{U/L}$) | $20.75 \pm 7.97$ | $19.75 \pm 10.37$ | $-1.00$ | $-4.8\%$ | **Nominal**: No cohort-wide hepatocellular necrosis detected. |
| **Serum Sodium** ($\text{mmol/L}$) | $141.50 \pm 1.12$ | $138.25 \pm 0.83$ | $-3.25$ | $-2.3\%$ | **Decreased**: Predictable slight hyponatremic shift post-splashdown due to microgravity plasma volume re-adaptation. |
| **Serum Potassium** ($\text{mmol/L}$) | $4.28 \pm 0.35$ | $4.38 \pm 0.19$ | $+0.10$ | $+2.3\%$ | **Nominal**: Myocardial electrolyte stability preserved. |
| **Creatinine** ($\text{mg/dL}$) | $1.09 \pm 0.20$ | $1.04 \pm 0.16$ | $-0.05$ | $-4.6\%$ | **Nominal**: Glomerular filtration rate stable across all crew members. |
| **BUN** ($\text{mg/dL}$) | $20.00 \pm 2.92$ | $19.50 \pm 3.12$ | $-0.50$ | $-2.5\%$ | **Nominal**: No severe dehydration azotemia detected at $R+1$. |
| **Platelets** ($\times 10^3/\mu\text{L}$) | $248.50 \pm 38.6$ | $239.00 \pm 41.2$ | $-9.50$ | $-3.8\%$ | **Nominal**: Mild transient reduction within normal physiological reference margins. |
| **Absolute Lymphocytes** ($\text{cells}/\mu\text{L}$)| $2678.0 \pm 410$ | $1890.0 \pm 340$ | $-788.0$ | $-29.4\%$ | **Decreased**: Known acute spaceflight lymphopenia resolving within $R+45$. |

---

## 3. Clinical Reference Range Excursions Registry

Across the 28 longitudinal observations, **21 individual measurements** fell outside standard Quest Diagnostics clinical reference ranges:

### Key Excursion Patterns Observed:
1. **Subject C002 (Hepatic Enzyme Elevation)**:
   - At $L-3$: AST was $40\text{ U/L}$ (Upper limit of normal = 35).
   - At $R+1$: AST increased to $48\text{ U/L}$ (High).
   - At $R+45$: AST normalized to $28\text{ U/L}$.
   - Shows transient hepatic stress during spaceflight with complete recovery during convalescence.
2. **Subject C001 (Elevated BUN at Baseline and Extended Recovery)**:
   - At $L-92$: BUN was $25\text{ mg/dL}$ (Upper limit = 25).
   - At $R+194$: BUN was $28\text{ mg/dL}$ (High).
   - Driven by high protein dietary intake and physical training regimens rather than acute spaceflight injury.
3. **Subject C003 (Lymphocyte Modulation)**:
   - Acute reduction at $R+1$ to $1250\text{ cells}/\mu\text{L}$ (borderline low), recovering to $> 2200\text{ cells}/\mu\text{L}$ by $R+45$.

---

## 4. Missing Data & Data Quality Analysis

| Quality Metric | Finding | Percentage |
| :--- | :--- | :--- |
| **Total Target Observations** | 28 harmonized records ($4\text{ crew} \times 7\text{ timepoints}$) | 100.0% |
| **Complete Triad Records** (CMP + CBC + Cytokines) | 28 complete records | 100.0% |
| **Missing Primary Analyte Rate** | 0 missing rows across core panels | 0.0% |
| **Internal Missing Cells** | Sporadic missing values in optional sub-ratios (e.g., BUN-to-creatinine ratio missing in C001 L-44 and L-92 due to analyzer threshold) | $< 1.5\%$ of individual data cells |

All 28 observations have complete sample tracking, subject identifiers, and timestamps.

---

## 5. Scientific Disclaimer & Boundary Controls
- NASA OSDR observations are retrospective research data from civilian spaceflight.
- These results reflect systemic adaptation to 3 days of orbital microgravity and G-force exposure during re-entry.
- **Strict Boundary**: This research data is never injected into real-time astronaut health baselines and never used to synthesize fake continuous vital telemetry.
