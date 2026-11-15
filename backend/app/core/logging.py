import logging
import sys
from app.core.config import settings


def setup_logging():
    """Configure application-wide structured logging for Cloud Run / Google Cloud Logging."""
    log_level = logging.INFO if not settings.DEBUG else logging.DEBUG

    formatter = logging.Formatter(
        fmt="%(asctime)s [%(levelname)s] [%(name)s]: %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%SZ"
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    # Avoid duplicate handlers if already configured
    if not root_logger.handlers:
        root_logger.addHandler(handler)

    return root_logger
