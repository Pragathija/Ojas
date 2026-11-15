"""
PhysioNet BIDMC PPG and Respiration Dataset Loader.
Processes 1 Hz vital numerics and high-frequency PPG/Respiration signals.
Preserves patient timeline, vital signals, and clinical ICU provenance.
"""

from pathlib import Path
from typing import Dict, Any, Generator, Optional, Union
import math
import pandas as pd

from app.datasets.loaders.base_loader import BaseDatasetLoader


class BidmcLoader(BaseDatasetLoader):
    def __init__(self):
        super().__init__(dataset_id="physionet_bidmc")

    def parse_records(
        self,
        file_path: Union[str, Path],
        chunksize: Optional[int] = 500
    ) -> Generator[Dict[str, Any], None, None]:
        """
        Parses BIDMC numerics records.
        Yields structured observations with ICU clinical tagging.
        """
        p = Path(file_path)
        subject_id = p.stem.split("_")[0] if "_" in p.stem else p.stem

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

                time_s = clean_float(["Time [s]", "time", "Time", "time_s"])
                hr = clean_float(["HR", "heart_rate", "hr"])
                pulse = clean_float(["PULSE", "pulse"])
                spo2 = clean_float(["SpO2", "spo2", "SPO2", "O2Sat"])
                resp = clean_float(["RESP", "resp", "Resp"])

                record = {
                    "source_dataset": self.dataset_id,
                    "category": self.metadata.category.value,
                    "population_type": self.metadata.population_type.value,
                    "subject_id": subject_id,
                    "elapsed_seconds": time_s,
                    # Vital measurements
                    "heart_rate_bpm": hr,
                    "pulse_rate_bpm": pulse,
                    "blood_oxygen_pct": spo2,
                    "respiration_rate_bpm": resp,
                    # Provenance & disclaimer
                    "is_synthetic": False,
                    "provenance_notes": "PhysioNet BIDMC ICU Adult Patient Telemetry (Non-Astronaut Population)"
                }
                yield record
