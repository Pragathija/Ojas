"""
NASA Open Science Data Repository (OSDR) Loader.
Handles spaceflight and ground-based analog (HERA, Bed Rest) physiological telemetry.
Preserves analog subject tracking, timestamps, units, and missing value indicators.
"""

from pathlib import Path
from typing import Dict, Any, Generator, Optional, Union
import math
import pandas as pd

from app.datasets.loaders.base_loader import BaseDatasetLoader


class NasaOsdrLoader(BaseDatasetLoader):
    def __init__(self):
        super().__init__(dataset_id="nasa_osdr")

    def parse_records(
        self,
        file_path: Union[str, Path],
        chunksize: Optional[int] = 500
    ) -> Generator[Dict[str, Any], None, None]:
        """
        Parses NASA OSDR telemetry records.
        Yields raw records with provenance tagging.
        """
        for chunk in self.load_raw_chunks(file_path, chunksize=chunksize or 500):
            for _, row in chunk.iterrows():
                # Extract original fields without inventing missing values
                def clean_float(val):
                    if pd.isna(val) or val is None:
                        return None
                    try:
                        f = float(val)
                        return None if math.isnan(f) else f
                    except (ValueError, TypeError):
                        return None

                record = {
                    "source_dataset": self.dataset_id,
                    "category": self.metadata.category.value,
                    "population_type": self.metadata.population_type.value,
                    "subject_id": str(row.get("subject_id", "UNKNOWN")),
                    "mission_day": int(row.get("mission_day", 1)) if pd.notna(row.get("mission_day")) else None,
                    "timestamp": str(row.get("timestamp")),
                    # Raw measurements in original units
                    "heart_rate_bpm": clean_float(row.get("heart_rate_bpm")),
                    "systolic_bp_mmhg": clean_float(row.get("systolic_bp_mmhg")),
                    "diastolic_bp_mmhg": clean_float(row.get("diastolic_bp_mmhg")),
                    "body_temp_c": clean_float(row.get("body_temp_c")),
                    "activity_counts": clean_float(row.get("activity_counts")),
                    "sleep_duration_hrs": clean_float(row.get("sleep_duration_hrs")),
                    "circadian_phase_deg": clean_float(row.get("circadian_phase_deg")),
                    # Provenance tracking
                    "is_synthetic": False,
                    "provenance_notes": "NASA OSDR Ground-based spaceflight analog telemetry (OSD-379/546 schema)"
                }
                yield record
