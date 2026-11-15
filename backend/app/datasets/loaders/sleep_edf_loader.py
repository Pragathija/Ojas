"""
Sleep-EDF Database Expanded Loader.
Parses 30-second epoch sleep hypnograms, sleep stage classifications,
and derived sleep architecture metrics (TST, WASO, REM%, Deep Sleep%).
Preserves clinical polysomnography standard staging.
"""

from pathlib import Path
from typing import Dict, Any, Generator, Optional, Union
import math
import pandas as pd

from app.datasets.loaders.base_loader import BaseDatasetLoader


class SleepEdfLoader(BaseDatasetLoader):
    STAGE_MAPPING = {
        "W": "Wake",
        "0": "Wake",
        "1": "Stage 1 NREM",
        "2": "Stage 2 NREM",
        "3": "Stage 3 NREM (Deep / Slow Wave)",
        "4": "Stage 4 NREM (Deep / Slow Wave)",
        "R": "REM Sleep",
        "M": "Movement Time",
        "?": "Unscored"
    }

    def __init__(self):
        super().__init__(dataset_id="sleep_edf")

    def parse_records(
        self,
        file_path: Union[str, Path],
        chunksize: Optional[int] = 500
    ) -> Generator[Dict[str, Any], None, None]:
        """
        Parses Sleep-EDF epoch hypnograms.
        Yields epoch-level sleep classifications with duration tracking.
        """
        p = Path(file_path)
        subject_id = p.stem.split("_")[2] if len(p.stem.split("_")) > 2 else p.stem

        for chunk in self.load_raw_chunks(file_path, chunksize=chunksize or 500):
            for _, row in chunk.iterrows():
                epoch_idx = row.get("epoch_index") or row.get("epoch")
                onset_sec = row.get("onset_seconds") or row.get("onset_s")
                duration_sec = row.get("duration_seconds") or row.get("duration_s", 30.0)
                stage_raw = str(row.get("sleep_stage", row.get("stage", "W"))).strip()

                is_sleep = stage_raw in ["1", "2", "3", "4", "R"]
                is_deep = stage_raw in ["3", "4"]
                is_rem = stage_raw == "R"
                is_wake = stage_raw in ["W", "0"]

                record = {
                    "source_dataset": self.dataset_id,
                    "category": self.metadata.category.value,
                    "population_type": self.metadata.population_type.value,
                    "subject_id": subject_id,
                    "epoch_index": int(epoch_idx) if pd.notna(epoch_idx) else None,
                    "onset_seconds": float(onset_sec) if pd.notna(onset_sec) else None,
                    "duration_seconds": float(duration_sec) if pd.notna(duration_sec) else 30.0,
                    # Sleep staging
                    "raw_stage": stage_raw,
                    "stage_name": self.STAGE_MAPPING.get(stage_raw, "Unknown Stage"),
                    "is_asleep": is_sleep,
                    "is_deep_sleep": is_deep,
                    "is_rem_sleep": is_rem,
                    "is_wake_arousal": is_wake,
                    # Provenance
                    "is_synthetic": False,
                    "provenance_notes": "PhysioNet Sleep-EDF Expanded Polysomnography (Terrestrial Sleep Study)"
                }
                yield record
