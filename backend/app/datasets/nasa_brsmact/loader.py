"""
Dedicated Dataset Loader for NASA BRSMAct (UTMB Bedrest Campaign 1 Actigraphy).

Loads authentic NASA NLSP actigraphy files, normalizes temporal and sleep metrics,
preserves raw observations, resolves duplicates, and enforces non-fabrication policies.
"""

from datetime import datetime, date
from pathlib import Path
from typing import Dict, List, Optional, Any, Generator, Tuple, Union
import numpy as np
import pandas as pd

from app.datasets.nasa_brsmact.models import BRSMActRecord
from app.datasets.nasa_brsmact.provenance import verify_dataset_integrity, METADATA


PRIMARY_FILE_NAME = "BRSMACT_Campagin_1_Actigraphy.csv"
QUERY_RESULT_FILE_NAME = "BRSMACT_Campagin_1_Actigraphy_Query_Result.csv"
README_FILE_NAME = "BRSMACT_Campaign_1_Actigraphy_ReadMe.txt"


def parse_time_to_minutes(val: Any) -> Optional[float]:
    """
    Parse an actigraphy time duration string into float minutes.
    Handles 'HH:mm:ss', 'HH:mm', decimal strings, and missing-data strings.
    Example:
        '7:20' -> 440.0
        '7:20:00' -> 440.0
        '0:14' -> 14.0
        '1:48' -> 108.0
        '0:00' -> 0.0
        'No Data' -> None
    """
    if pd.isna(val) or val is None:
        return None
    val_str = str(val).strip()
    if val_str.lower() in ["no data", "nan", "none", "", "null"]:
        return None

    parts = val_str.split(":")
    if len(parts) == 3:
        try:
            h, m, s = int(parts[0]), int(parts[1]), float(parts[2])
            return round(h * 60.0 + m + s / 60.0, 2)
        except ValueError:
            return None
    elif len(parts) == 2:
        try:
            h, m = int(parts[0]), int(parts[1])
            return round(h * 60.0 + m, 2)
        except ValueError:
            return None

    try:
        f = float(val_str)
        # In NASA files, if it's already a float hours value:
        return round(f * 60.0, 2)
    except ValueError:
        return None


def parse_efficiency(val: Any) -> Optional[float]:
    """
    Parse an actigraphy sleep efficiency percentage into a float (0.0 - 100.0).
    Handles percentages with '%', string representations, and missing indicators.
    Example:
        '92.1' -> 92.1
        '92.1%' -> 92.1
        'No Data' -> None
    """
    if pd.isna(val) or val is None:
        return None
    val_str = str(val).strip().rstrip("%").strip()
    if val_str.lower() in ["no data", "nan", "none", "", "null"]:
        return None
    try:
        f = float(val_str)
        if 0.0 <= f <= 100.0:
            return round(f, 2)
        return None
    except ValueError:
        return None


def parse_date(val: Any) -> date:
    """Parse 'M/D/YYYY' or 'YYYY-MM-DD' string into a datetime.date object."""
    if isinstance(val, (datetime, pd.Timestamp)):
        return val.date()
    if isinstance(val, date):
        return val
    val_str = str(val).strip()
    try:
        dt = datetime.strptime(val_str, "%m/%d/%Y")
        return dt.date()
    except ValueError:
        dt = datetime.strptime(val_str, "%Y-%m-%d")
        return dt.date()


class NasaBRSMActLoader:
    """
    Dedicated loader for NASA BRSMAct Actigraphy dataset.
    """

    def __init__(self, raw_dir: Optional[Union[str, Path]] = None, verify_hashes: bool = True):
        if raw_dir is None:
            self.raw_dir = Path(__file__).resolve().parents[3] / "data" / "nasa_original" / "nlsp_actigraphy" / "raw"
        else:
            self.raw_dir = Path(raw_dir)

        self.primary_csv = self.raw_dir / PRIMARY_FILE_NAME
        self.query_result_csv = self.raw_dir / QUERY_RESULT_FILE_NAME
        self.readme_txt = self.raw_dir / README_FILE_NAME

        if verify_hashes:
            self.verify_integrity()

    def verify_integrity(self) -> Dict[str, Any]:
        """Verify the integrity of downloaded files against acquisition manifest."""
        manifest_path = self.raw_dir.parent / "acquisition_manifest.json"
        res = verify_dataset_integrity(manifest_path=manifest_path, raw_dir=self.raw_dir)
        if not res["all_files_verified"]:
            raise ValueError(f"Integrity check failed for BRSMAct raw data: {res['file_details']}")
        return res

    def load_primary_dataset(self) -> List[BRSMActRecord]:
        """
        Load authoritative primary actigraphy dataset (207 records across 3 subjects).
        Strictly 1 record per subject per day, containing canonical sleep duration,
        latency, and efficiency.
        """
        if not self.primary_csv.exists():
            raise FileNotFoundError(f"Primary actigraphy file missing: {self.primary_csv}")

        df = pd.read_csv(self.primary_csv)
        records: List[BRSMActRecord] = []

        for _, row in df.iterrows():
            d = parse_date(row["Date"])
            raw_duration = row.get("Sleep Duration (hours)")
            raw_latency = row.get("Sleep Latency (hours)")
            raw_efficiency = row.get("Sleep Efficiency (%)")
            raw_notes = row.get("Notes")

            dur_mins = parse_time_to_minutes(raw_duration)
            lat_mins = parse_time_to_minutes(raw_latency)
            eff_pct = parse_efficiency(raw_efficiency)

            is_missing = (
                dur_mins is None
                or pd.isna(raw_efficiency)
                or str(raw_notes).strip().lower() == "no data"
            )

            med_note = None
            if pd.notna(raw_notes) and str(raw_notes).strip().lower() != "no data":
                med_note = str(raw_notes).strip()

            rec = BRSMActRecord(
                id=int(row["ID"]),
                subject=str(row["Subject"]).strip(),
                date=d,
                test_phase=str(row["Test_Phase"]).strip(),
                br_day=int(row["BR_Day"]),
                sleep_duration_minutes=dur_mins,
                sleep_latency_minutes=lat_mins,
                sleep_efficiency_pct=eff_pct,
                medication_note=med_note,
                record_number=None,
                raw_values=row.to_dict(),
                source_file=PRIMARY_FILE_NAME,
                is_missing_data=is_missing
            )
            records.append(rec)

        return records

    def load_query_result_dataset(self) -> List[BRSMActRecord]:
        """
        Load internal query result dataset (191 records for C1G0002 and C1G0003).
        Preserves individual query records with internal Record Number.
        """
        if not self.query_result_csv.exists():
            raise FileNotFoundError(f"Query result file missing: {self.query_result_csv}")

        df = pd.read_csv(self.query_result_csv)
        records: List[BRSMActRecord] = []

        for _, row in df.iterrows():
            d = parse_date(row["Date"])
            raw_duration = row.get("Sleep duration")
            raw_latency = row.get("Sleep latency")
            raw_efficiency = row.get("Sleep efficiency")
            raw_comments = row.get("Comments")

            dur_mins = parse_time_to_minutes(raw_duration)
            lat_mins = parse_time_to_minutes(raw_latency)
            eff_pct = parse_efficiency(raw_efficiency)

            is_missing = dur_mins is None or eff_pct is None

            med_note = None
            if pd.notna(raw_comments) and str(raw_comments).strip().lower() != "no data":
                med_note = str(raw_comments).strip()

            rec_num = None
            if pd.notna(row.get("Record Number")):
                try:
                    rec_num = int(row["Record Number"])
                except (ValueError, TypeError):
                    rec_num = None

            rec = BRSMActRecord(
                id=int(row["ID"]),
                subject=str(row["Subject"]).strip(),
                date=d,
                test_phase=str(row["Test_Phase"]).strip(),
                br_day=int(row["BR_Day"]),
                sleep_duration_minutes=dur_mins,
                sleep_latency_minutes=lat_mins,
                sleep_efficiency_pct=eff_pct,
                medication_note=med_note,
                record_number=rec_num,
                raw_values=row.to_dict(),
                source_file=QUERY_RESULT_FILE_NAME,
                is_missing_data=is_missing
            )
            records.append(rec)

        return records

    def load_harmonized_dataset(self) -> List[BRSMActRecord]:
        """
        Intelligently resolves schemas and eliminates duplicate rows.
        
        Strategy:
        1. BRSMACT_Campagin_1_Actigraphy.csv is authoritative for the canonical
           grid of 207 subject-day observations (balanced across all 3 subjects).
        2. BRSMACT_Campagin_1_Actigraphy_Query_Result.csv is used strictly as an
           enrichment source: matching on (subject, date) attaches the database
           Record Number and verifies medication annotations without inflating
           or duplicating rows.
        """
        primary_records = self.load_primary_dataset()
        query_records = self.load_query_result_dataset()

        # Build index from query records on (subject, date)
        query_map: Dict[Tuple[str, date], List[BRSMActRecord]] = {}
        for q in query_records:
            key = (q.subject, q.date)
            query_map.setdefault(key, []).append(q)

        harmonized: List[BRSMActRecord] = []
        for p in primary_records:
            key = (p.subject, p.date)
            matches = query_map.get(key, [])
            
            rec_num = None
            med_note = p.medication_note

            if matches:
                # If primary had no record number, take from match
                rec_num = matches[0].record_number
                # If primary lacked medication note but query result had one
                if not med_note:
                    for m in matches:
                        if m.medication_note:
                            med_note = m.medication_note
                            break

            enriched = p.model_copy(
                update={
                    "record_number": rec_num,
                    "medication_note": med_note,
                }
            )
            harmonized.append(enriched)

        return harmonized

    def stream_records(
        self,
        dataset_type: str = "harmonized",
        chunksize: int = 50
    ) -> Generator[List[BRSMActRecord], None, None]:
        """Stream parsed records in memory-safe slices."""
        if dataset_type == "primary":
            records = self.load_primary_dataset()
        elif dataset_type == "query_result":
            records = self.load_query_result_dataset()
        else:
            records = self.load_harmonized_dataset()

        for i in range(0, len(records), chunksize):
            yield records[i : i + chunksize]
