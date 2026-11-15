# NASA Life Sciences Portal (NLSP) – UTMB Bedrest Campaign 1 Actigraphy (`BRSMAct`)

## 1. Verified Facts from NASA Catalogue

- **Official Catalogue URL**: [https://nlsp.nasa.gov/search/data/details/e26501eb-7d7a-5012-8c8e-c5bdb3eecaf6?dataType=DATASETS](https://nlsp.nasa.gov/search/data/details/e26501eb-7d7a-5012-8c8e-c5bdb3eecaf6?dataType=DATASETS)
- **Dataset Title**: UTMB Bedrest Campaign 1 Actigraphy
- **Catalogue Dataset ID**: `e26501eb-7d7a-5012-8c8e-c5bdb3eecaf6`
- **Experiment ID**: `BRSMAct` (Bed Rest Standard Measures: Actilight / Actigraphy)
- **Mission / Campaign ID**: `Campaign 1`
- **Dataset Catalogue Key**: `BRSMACT_Campaign_1_Actigraphy`
- **Data Source**: Experiment
- **Data Processing Level**: **`Processed Data`** (derived sleep parameters, not raw epoch actigraphy traces)
- **Catalogue Availability**: `Available online` (publicly accessible without authentication)
- **Repository Location**: `JSC LSDA Data Repository` (NASA Johnson Space Center Life Sciences Data Archive)
- **Catalogue Modified Date**: `2026-01-09T01:12:58.941Z`

---

## 2. Facts Confirmed from Downloaded Files

All three catalogue files were successfully downloaded directly from NASA NLSP via `https://nlsp.nasa.gov/api/v1/files/{file_id}/download` without authentication. MD5 checksums match NASA's catalogue records exactly.

### File Manifest & Integrity

| File Name | Catalog File ID | Size (Bytes) | MD5 Checksum (Catalog Verified) | SHA-256 Checksum |
| :--- | :--- | :--- | :--- | :--- |
| `BRSMACT_Campagin_1_Actigraphy_Query_Result.csv` | `e4630225-a050-54fb-be99-795cf1053654` | 10,928 | `50a84a41acc9be8b99eb0d0661b294ed` | `d3932c0f1a72b68dc6d0ba01346d3052040b48616b79380e4892cf47dafea5f2` |
| `BRSMACT_Campaign_1_Actigraphy_ReadMe.txt` | `ba27dc5f-962a-5af8-a232-0b8bef1e4748` | 467 | `5d28f786df8e34ea99f9267040e501cb` | `eae6b6c30671582cb31b50d4b9f3360e2185c4cea2a4ea8264ebfb7b6ee8389e` |
| `BRSMACT_Campagin_1_Actigraphy.csv` | `972badfb-238d-5dd5-81f2-8efc729a4452` | 11,679 | `761c8d9d31e107186be1b9ca9d2bea79` | `2fa3efeb9e6388e8de50f4e2eefc9e6de8740993f1c27ab7ef3282e59398923b` |

*Note: Filenames 1 and 3 retain NASA's original repository spelling (`Campagin`).*

### Study Population & Subjects
- **Subject Count**: 3 human test subjects in Campaign 1:
  - `C1G0001`
  - `C1G0002`
  - `C1G0003`
- File 1 (`Query_Result.csv`, 191 records) contains detailed query results for subjects `C1G0002` and `C1G0003` with internal database record number keys.
- File 3 (`Actigraphy.csv`, 207 records) contains sleep data for all 3 subjects (`C1G0001`, `C1G0002`, `C1G0003`).

### Time Coverage & Study Phases
- **Observation Timeframe**: September 7, 2004 to January 18, 2005.
- **Study Phases**:
  1. `PRE_TEST`: Pre-bedrest ambulatory baseline (days BR-12 through BR-1).
  2. `IN_TEST`: Confinement during 6° Head-Down Tilt Bed Rest (days BR1 through BR60).
  3. `POST_TEST`: Post-bedrest recovery and re-ambulation (days BR+1 through BR+6).

### Actual Variables & Measurement Units
- **`Subject`**: De-identified subject identifier code (`C1G0001`, `C1G0002`, `C1G0003`).
- **`Test_Phase`**: Categorical study phase (`PRE_TEST`, `IN_TEST`, `POST_TEST`).
- **`BR_Day`**: Bed rest day relative to bedrest start (integer, -12 to 60+).
- **`Date`**: Calendar date (`M/D/YYYY`).
- **`Sleep Latency`**: Time to fall asleep, formatted as `HH:mm` (e.g., `0:14` = 14 minutes, `1:48` = 108 minutes).
- **`Sleep Duration`**: Duration of sleep period, formatted as `HH:mm` or `HH:mm:ss` (e.g., `7:20` = 7 hours 20 minutes).
- **`Sleep Efficiency`**: Percentage of time in bed spent asleep, unit `%` from 0.0 to 100.0 (e.g., `92.1%`, `70.8%`).
- **`Comments` / `Notes`**: Medications recorded: `Ambien 5mg`, `Diphenhydramine 50mg`, `Diphenhydramine 25mg`, or `No Data`.
- **`Record Number`**: Database query record index (in `Query_Result.csv`).

### Data Level
- **Individual-Level Nightly Sleep Summaries**: Observations represent per-subject, per-night derived sleep metrics calculated from the actigraph scoring algorithms.
- **NOT Raw Accelerometer Epochs**: This dataset does not contain high-frequency epoch-by-epoch raw counts (e.g. 30-second accelerometer counts) or raw ambient light sensor lux timeseries.

---

## 3. Details That Remain Unverified

- **Raw Epoch Timeseries**: Whether raw 30s/60s epoch actigraphy movement traces (Actiware `.awd` / `.dat` vendor binary exports) exist elsewhere in the LSDA offline tape archive or require a specialized controlled Data Access Request.
- **Photopic Lux Values**: The original protocol mention of ambient light measurement is not present in these three processed CSV summary tables; only sleep latency, duration, efficiency, and sleep medications are recorded.
- **Participant Demographics**: Specific age, height, and weight per de-identified subject code (`C1G0001` - `C1G0003`) are not included in these actigraphy tables.

---

## 4. Official Access & Reuse Conditions

- **Source**: NASA Johnson Space Center Life Sciences Data Archive (LSDA), published on the NASA Life Sciences Portal (NLSP).
- **Authentication**: None required for these catalogue files; available online via public HTTP endpoint.
- **Rights**: U.S. Federal Government Research Data in the public domain. Attribution to NASA LSDA BRSMAct Campaign 1 is required in scientific publications.
