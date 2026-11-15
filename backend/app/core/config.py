import os
import json
from pathlib import Path
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_DB_PATH = BACKEND_DIR / "ojas.db"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    PROJECT_NAME: str = "Ojas - Astronaut Health Monitoring Platform"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"       # "development", "staging", "production"
    DEBUG: bool = True
    PORT: int = 8080

    # Database: defaults to backend/ojas.db; overridden by DATABASE_URL environment variable
    DATABASE_URL: str = f"sqlite:///{DEFAULT_DB_PATH.as_posix()}"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, v: str) -> str:
        if isinstance(v, str):
            # Cloud SQL and older provider URIs use postgres:// which SQLAlchemy 2.0 deprecates
            if v.startswith("postgres://"):
                return v.replace("postgres://", "postgresql+psycopg2://", 1)
            elif v.startswith("postgresql://") and not v.startswith("postgresql+"):
                return v.replace("postgresql://", "postgresql+psycopg2://", 1)
        return v

    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v_stripped = v.strip()
            if v_stripped.startswith("[") and v_stripped.endswith("]"):
                try:
                    return json.loads(v_stripped)
                except Exception:
                    pass
            # Split comma-separated string
            return [origin.strip() for origin in v_stripped.split(",") if origin.strip()]
        return v

    @field_validator("CORS_ORIGINS")
    @classmethod
    def enforce_production_cors_security(cls, origins: List[str], info) -> List[str]:
        # Enforce that wildcard '*' cannot be used in production
        env = info.data.get("ENVIRONMENT", "development")
        debug = info.data.get("DEBUG", True)
        if env == "production" or not debug:
            filtered = [o for o in origins if o != "*"]
            if len(filtered) < len(origins):
                # '*' was present, removed for production safety
                return filtered
        return origins

    # Baseline & Anomaly Configuration
    MIN_READINGS_FOR_BASELINE: int = 5
    MIN_READINGS_FOR_ML_ANOMALY: int = 20
    ALERT_DEDUPLICATION_WINDOW_MINUTES: int = 30

    # Rule Engine Thresholds (Synthetic hackathon parameters for demonstration)
    HEART_RATE_CRITICAL_HIGH: float = 120.0
    HEART_RATE_CAUTION_HIGH: float = 100.0
    HEART_RATE_CAUTION_LOW: float = 50.0

    SPO2_CRITICAL_LOW: float = 90.0
    SPO2_CAUTION_LOW: float = 94.0

    BP_SYSTOLIC_CRITICAL_HIGH: float = 160.0
    BP_SYSTOLIC_CAUTION_HIGH: float = 140.0
    BP_DIASTOLIC_CRITICAL_HIGH: float = 100.0
    BP_DIASTOLIC_CAUTION_HIGH: float = 90.0

    TEMP_CRITICAL_HIGH: float = 38.5
    TEMP_CAUTION_HIGH: float = 37.8
    TEMP_CAUTION_LOW: float = 35.8

    SLEEP_CRITICAL_LOW: float = 4.5
    SLEEP_CAUTION_LOW: float = 6.0

    FATIGUE_CRITICAL_HIGH: float = 9.0
    FATIGUE_CAUTION_HIGH: float = 7.0

    STRESS_CRITICAL_HIGH: float = 85.0
    STRESS_CAUTION_HIGH: float = 70.0


settings = Settings()
