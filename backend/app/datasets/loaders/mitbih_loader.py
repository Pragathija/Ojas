"""
MIT-BIH Arrhythmia Database Loader.
Parses beat-by-beat ECG annotations, RR intervals, and instantaneous heart rate.
Preserves clinical cardiology classification, rhythm changes, and ambulatory provenance.
"""

from pathlib import Path
from typing import Dict, Any, Generator, Optional, Union
import math
import pandas as pd

from app.datasets.loaders.base_loader import BaseDatasetLoader


class MitBihLoader(BaseDatasetLoader):
    # Mapping of standard PhysioNet MIT-BIH annotation symbols to descriptions
    ANNOTATION_CODES = {
        "N": "Normal Beat",
        "L": "Left Bundle Branch Block Beat",
        "R": "Right Bundle Branch Block Beat",
        "A": "Atrial Premature Contraction",
        "a": "Aberrated Atrial Premature Beat",
        "J": "Nodal (Junctional) Premature Beat",
        "S": "Supraventricular Ectopic Beat",
        "V": "Premature Ventricular Contraction (PVC)",
        "F": "Fusion of Ventricular and Normal Beat",
        "E": "Ventricular Escape Beat",
        "j": "Nodal Escape Beat",
        "+": "Rhythm Change / Header Marker",
        "~": "Signal Quality Change / Noise",
        "|": "Isolated QRS-like Artifact"
    }

    def __init__(self):
        super().__init__(dataset_id="mit_bih")

    def parse_records(
        self,
        file_path: Union[str, Path],
        chunksize: Optional[int] = 500
    ) -> Generator[Dict[str, Any], None, None]:
        """
        Parses MIT-BIH beat annotation records.
        Yields cardiology observations with rhythm and ectopy markers.
        """
        p = Path(file_path)
        record_id = p.stem.split("_")[1] if "_" in p.stem else p.stem

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

                time_sec = clean_float(["Time_sec", "Time", "time", "elapsed_sec"])
                sample_idx = row.get("Sample_Index") or row.get("sample")
                beat_type = str(row.get("Type", row.get("symbol", "N"))).strip()
                instant_hr = clean_float(["Instant_HR_BPM", "instant_hr", "hr", "HR"])

                is_ectopic = beat_type in ["V", "A", "a", "J", "S", "E", "F"]
                is_ventricular = beat_type in ["V", "E", "F"]

                record = {
                    "source_dataset": self.dataset_id,
                    "category": self.metadata.category.value,
                    "population_type": self.metadata.population_type.value,
                    "record_id": record_id,
                    "time_seconds": time_sec,
                    "sample_index": int(sample_idx) if pd.notna(sample_idx) else None,
                    # Beat annotations & HR
                    "beat_type": beat_type,
                    "beat_description": self.ANNOTATION_CODES.get(beat_type, "Unclassified Beat"),
                    "is_ectopic": is_ectopic,
                    "is_ventricular_ectopy": is_ventricular,
                    "instantaneous_heart_rate_bpm": instant_hr,
                    # Provenance
                    "is_synthetic": False,
                    "provenance_notes": "PhysioNet MIT-BIH Ambulatory Cardiology Patient Database"
                }
                yield record
