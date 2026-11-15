"""
WESAD (Wearable Stress and Affect Detection) Loader.
Parses multi-modal wearable sensor streams (HR, EDA, Temperature, Respiration)
and ground-truth psychological stress condition labels.
Preserves lab protocol ground truth without synthetic contamination.
"""

from pathlib import Path
from typing import Dict, Any, Generator, Optional, Union
import math
import pandas as pd

from app.datasets.loaders.base_loader import BaseDatasetLoader


class WesadLoader(BaseDatasetLoader):
    CONDITION_MAPPING = {
        0: "Transient / Not Defined",
        1: "Baseline (Neutral)",
        2: "Acute Stress (TSST Protocol)",
        3: "Amusement",
        4: "Meditation / Recovery"
    }

    def __init__(self):
        super().__init__(dataset_id="wesad")

    def parse_records(
        self,
        file_path: Union[str, Path],
        chunksize: Optional[int] = 500
    ) -> Generator[Dict[str, Any], None, None]:
        """
        Parses WESAD multi-sensor records.
        Yields synchronized physiological telemetry paired with ground-truth stress condition.
        """
        for chunk in self.load_raw_chunks(file_path, chunksize=chunksize or 500):
            for _, row in chunk.iterrows():
                def clean_float(key_variants):
                    for k in key_variants:
                        if k in row and pd.notna(row[k]):
                            try:
                                f = float(row[k])
                                return None if math.isnan(f) else f
                            except (ValueError, TypeError):
                                pass
                    return None

                time_s = clean_float(["timestamp_s", "time", "timestamp"])
                sub_id = str(row.get("subject_id", "S2"))
                hr = clean_float(["heart_rate_bpm", "hr", "HR", "bvp_hr"])
                eda = clean_float(["eda_microsiemens", "eda", "EDA"])
                temp_c = clean_float(["temp_celsius", "temp", "skin_temp"])
                resp = clean_float(["resp_rate", "resp", "RESP"])
                acc = clean_float(["acc_magnitude", "acc", "acc_mag"])

                raw_label = row.get("condition_label", row.get("label", 0))
                try:
                    cond_label = int(raw_label) if pd.notna(raw_label) else 0
                except (ValueError, TypeError):
                    cond_label = 0

                is_stress_ground_truth = (cond_label == 2)

                record = {
                    "source_dataset": self.dataset_id,
                    "category": self.metadata.category.value,
                    "population_type": self.metadata.population_type.value,
                    "subject_id": sub_id,
                    "timestamp_seconds": time_s,
                    # Wearable physiological signals
                    "heart_rate_bpm": hr,
                    "eda_microsiemens": eda,
                    "skin_temperature_c": temp_c,
                    "respiration_rate_bpm": resp,
                    "acceleration_magnitude_g": acc,
                    # Ground-truth psychological evaluation label
                    "condition_label": cond_label,
                    "condition_name": self.CONDITION_MAPPING.get(cond_label, "Unknown Condition"),
                    "is_stress_ground_truth": is_stress_ground_truth,
                    # Provenance
                    "is_synthetic": False,
                    "provenance_notes": "WESAD Multi-Sensor Wearable Laboratory Stress Dataset"
                }
                yield record
