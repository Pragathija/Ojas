from typing import Dict, Type
from app.datasets.loaders.base_loader import BaseDatasetLoader
from app.datasets.loaders.nasa_osdr_loader import NasaOsdrLoader
from app.datasets.loaders.bidmc_loader import BidmcLoader
from app.datasets.loaders.mitbih_loader import MitBihLoader
from app.datasets.loaders.sleep_edf_loader import SleepEdfLoader
from app.datasets.loaders.wesad_loader import WesadLoader

LOADER_REGISTRY: Dict[str, Type[BaseDatasetLoader]] = {
    "nasa_osdr": NasaOsdrLoader,
    "physionet_bidmc": BidmcLoader,
    "mit_bih": MitBihLoader,
    "sleep_edf": SleepEdfLoader,
    "wesad": WesadLoader,
}


def get_loader(dataset_id: str) -> BaseDatasetLoader:
    """Instantiate and return the appropriate dataset loader for a given dataset ID."""
    if dataset_id not in LOADER_REGISTRY:
        raise KeyError(
            f"No loader registered for dataset '{dataset_id}'. "
            f"Available loaders: {list(LOADER_REGISTRY.keys())}"
        )
    return LOADER_REGISTRY[dataset_id]()


__all__ = [
    "BaseDatasetLoader",
    "NasaOsdrLoader",
    "BidmcLoader",
    "MitBihLoader",
    "SleepEdfLoader",
    "WesadLoader",
    "LOADER_REGISTRY",
    "get_loader",
]
