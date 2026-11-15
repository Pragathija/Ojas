# Phase 12 — NASA OSDR Inspiration4 Data Dictionary & Variable Specifications

## 1. Scope & Semantic Standards
This data dictionary documents the authentic clinical chemistry, hematology, and cytokine variables integrated into Ojas from NASA OSDR accessions `OSD-575` and `OSD-569`.

> [!IMPORTANT]
> **Measurement Preservation Policy**:
> - Original measurement values and units are preserved without loss of precision.
> - Units are never converted into unrelated vital signs.
> - Reference ranges from Quest Diagnostics (AU5800 automated clinical chemistry and automated hematology analyzers) are preserved alongside numerical values.

---

## 2. Comprehensive Metabolic Panel (CMP) Variables (`OSD-575`)

| Variable Name in Ojas | Raw Column Name | Units | Clinical Reference Range | Physiological Significance in Spaceflight |
| :--- | :--- | :--- | :--- | :--- |
| `sodium_mmol_l` | `sodium_value_millimol_per_liter` | mmol/L | 135.0 – 146.0 | Fluid balance, hydration state, and plasma volume regulation under microgravity fluid shifts. |
| `potassium_mmol_l` | `potassium_value_millimol_per_liter` | mmol/L | 3.5 – 5.3 | Myocardial excitability, neuromuscular conduction, and renal tubular function. |
| `chloride_mmol_l` | `chloride_value_millimol_per_liter` | mmol/L | 98.0 – 110.0 | Acid-base homeostasis and osmotic pressure maintenance. |
| `carbon_dioxide_mmol_l` | `carbon_dioxide_value_millimol_per_liter` | mmol/L | 20.0 – 32.0 | Systemic bicarbonate buffer indicator for metabolic acidosis or alkalosis. |
| `calcium_mg_dl` | `calcium_value_milligram_per_deciliter` | mg/dL | 8.6 – 10.3 | Bone demineralization marker; tracks osteoclastic bone resorption in microgravity. |
| `glucose_mg_dl` | `glucose_value_milligram_per_deciliter` | mg/dL | 65.0 – 99.0 | Fasting carbohydrate metabolism and spaceflight-associated insulin sensitivity shifts. |
| `urea_nitrogen_bun_mg_dl`| `urea_nitrogen_bun_value_milligram_per_deciliter` | mg/dL | 7.0 – 25.0 | Renal glomerular filtration, protein catabolism, and prerenal azotemia. |
| `creatinine_mg_dl` | `creatinine_value_milligram_per_deciliter` | mg/dL | 0.6 – 1.35 | Muscle mass index and renal clearance function. |
| `bun_to_creatinine_ratio`| `bun_to_creatinine_ratio_value` | ratio | 6.0 – 22.0 | Differentiates dehydration/prerenal hypoperfusion from intrinsic renal impairment. |
| `albumin_g_dl` | `albumin_value_gram_per_deciliter` | g/dL | 3.6 – 5.1 | Major serum oncotic protein; nutritional status and intravascular volume marker. |
| `total_protein_g_dl` | `total_protein_value_gram_per_deciliter` | g/dL | 6.1 – 8.1 | Total circulating immunoglobulins and structural serum proteins. |
| `total_bilirubin_mg_dl` | `total_bilirubin_value_milligram_per_deciliter` | mg/dL | 0.2 – 1.2 | Hepatic clearance, biliary excretion, and erythrocyte hemolysis index. |
| `alkaline_phosphatase_u_l`| `alkaline_phosphatase_value_units_per_liter` | U/L | 36.0 – 130.0 | Hepatobiliary and osteoblastic bone turnover activity. |
| `alt_u_l` | `alt_value_units_per_liter` | U/L | 9.0 – 46.0 | Alanine aminotransferase: specific hepatocellular injury marker. |
| `ast_u_l` | `ast_value_units_per_liter` | U/L | 10.0 – 40.0 | Aspartate aminotransferase: hepatic, cardiac, and skeletal muscle stress indicator. |

---

## 3. Complete Blood Count (CBC) Variables (`OSD-569`)

| Variable Name in Ojas | Raw Column Name | Units | Clinical Reference Range | Physiological Significance in Spaceflight |
| :--- | :--- | :--- | :--- | :--- |
| `white_blood_cells_cells_ul` | `white_blood_cell_count_value_thousand_per_microliter` | $\times 10^3/\mu\text{L}$ | 3.8 – 10.8 | General immune status and response to mission stressors. |
| `red_blood_cells_million_cells_ul` | `red_blood_cell_count_value_million_per_microliter` | $\times 10^6/\mu\text{L}$ | 3.8 – 5.1 | Erythrocyte mass; monitors spaceflight anemia. |
| `hemoglobin_g_dl` | `hemoglobin_value_percent` | g/dL (labeled pct) | 11.7 – 15.5 | Oxygen-carrying capacity of circulating whole blood. |
| `hematocrit_pct` | `hematocrit_value_percent` | % | 35.0 – 45.0 | Proportion of blood volume occupied by red blood cells. |
| `platelets_thousand_cells_ul` | `platelet_count_value_thousand_per_microliter` | $\times 10^3/\mu\text{L}$ | 140.0 – 400.0 | Primary hemostasis, coagulation risk, and thrombosis screening. |
| `absolute_neutrophils_cells_ul` | `absolute_neutrophils_value_cells_per_microliter` | cells/$\mu$L | 1500.0 – 7800.0 | Innate immune effector cells; reactive elevation post-splashdown. |
| `absolute_lymphocytes_cells_ul` | `absolute_lymphocytes_value_cells_per_microliter` | cells/$\mu$L | 850.0 – 3900.0 | Adaptive immunity; tracks spaceflight immune dysregulation. |
| `absolute_monocytes_cells_ul` | `absolute_monocytes_value_cells_per_microliter` | cells/$\mu$L | 200.0 – 950.0 | Phagocytic antigen-presenting cells; tissue repair. |
| `absolute_eosinophils_cells_ul` | `absolute_eosinophils_value_cells_per_microliter` | cells/$\mu$L | 15.0 – 500.0 | Allergic and parasitic response tracking. |
| `absolute_basophils_cells_ul` | `absolute_basophils_value_cells_per_microliter` | cells/$\mu$L | 0.0 – 200.0 | Circulating granulocytes and histamine release. |

---

## 4. Cardiovascular & Immune Cytokine Biomarkers (`OSD-575`)

| Biomarker | Raw Column Name | Units | Category | Physiological Context |
| :--- | :--- | :--- | :--- | :--- |
| **CRP** | `crp_concentration_picogram_per_milliliter` | pg/mL | Cardiovascular / Acute Phase | C-reactive protein: systemic vascular inflammation and acute tissue stress. |
| **Alpha-2-Macroglobulin** | `a2_macroglobulin_concentration_nanogram_per_milliliter` | ng/mL | Cardiovascular / Proteinase Inhibitor | Broad-spectrum antiprotease and carrier protein. |
| **AGP** | `agp_concentration_nanogram_per_milliliter` | ng/mL | Acute Phase Glycoprotein | Alpha-1-acid glycoprotein: acute phase inflammatory response. |
| **IL-6** | `il_6_concentration_picogram_per_milliliter` | pg/mL | Immune Cytokine | Interleukin-6: pro-inflammatory cytokine and immune mobilization mediator. |
| **TNF-$\alpha$** | `tnfα_concentration_picogram_per_milliliter` | pg/mL | Immune Cytokine | Tumor necrosis factor alpha: systemic inflammation and immune regulation. |
| **IL-10** | `il_10_concentration_picogram_per_milliliter` | pg/mL | Immune Cytokine | Anti-inflammatory cytokine; immune homeostasis recovery. |
