"""
Base Dataset Loader.
Abstract class defining memory-safe loading, chunked reading, provenance tagging,
and metadata validation for scientific biomedical and spaceflight datasets.
"""

from abc import ABC, abstractmethod
from pathlib import Path
from typing import Dict, Any, Generator, List, Optional, Union
import pandas as pd

from app.datasets.registry import get_dataset_metadata, DatasetMetadata


class BaseDatasetLoader(ABC):
    def __init__(self, dataset_id: str):
        self.dataset_id = dataset_id
        self.metadata: DatasetMetadata = get_dataset_metadata(dataset_id)

    def validate_source_file(self, file_path: Union[str, Path]) -> bool:
        """Verify that the target dataset file exists and is accessible."""
        p = Path(file_path)
        if not p.exists():
            raise FileNotFoundError(f"Dataset file not found at: {p.resolve()}")
        if p.stat().st_size == 0:
            raise ValueError(f"Dataset file is empty (0 bytes): {p.resolve()}")
        return True

    def load_raw_chunks(
        self,
        file_path: Union[str, Path],
        chunksize: int = 1000
    ) -> Generator[pd.DataFrame, None, None]:
        """
        Memory-efficient streaming chunk reader using Pandas chunksize.
        Prevents memory spikes on multi-megabyte / multi-gigabyte recordings.
        """
        self.validate_source_file(file_path)
        p = Path(file_path)
        if p.suffix.lower() == ".csv":
            for chunk in pd.read_csv(p, chunksize=chunksize):
                yield chunk
        elif p.suffix.lower() == ".json":
            df = pd.read_json(p)
            # Yield in slices to respect chunking interface
            for i in range(0, len(df), chunksize):
                yield df.iloc[i : i + chunksize]
        else:
            raise ValueError(f"Unsupported file format: '{p.suffix}' for streaming chunk reader.")

    def inspect_file(self, file_path: Union[str, Path]) -> Dict[str, Any]:
        """Extract structural metadata: rows, columns, missing values, memory usage."""
        self.validate_source_file(file_path)
        p = Path(file_path)
        # Read small sample to inspect columns
        sample_df = pd.read_csv(p, nrows=50) if p.suffix.lower() == ".csv" else pd.read_json(p)
        return {
            "dataset_id": self.dataset_id,
            "file_name": p.name,
            "file_size_bytes": p.stat().st_size,
            "columns": list(sample_df.columns),
            "sample_rows": len(sample_df),
            "provenance_category": self.metadata.category.value,
            "population_type": self.metadata.population_type.value,
            "intended_ojas_module": self.metadata.intended_ojas_module,
        }

    @abstractmethod
    def parse_records(
        self,
        file_path: Union[str, Path],
        chunksize: Optional[int] = None
    ) -> Generator[Dict[str, Any], None, None]:
        """
        Parse raw dataset records into dictionaries preserving exact raw measurements,
        original units, timestamps, missing-value indicators, and explicit provenance tags.
        """
        pass
