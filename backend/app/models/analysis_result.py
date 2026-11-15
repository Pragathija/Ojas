from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from app.database.connection import Base


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    astronaut_id = Column(String(50), index=True, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True, nullable=False)

    overall_status = Column(String(20), nullable=False)      # NORMAL, CAUTION, CRITICAL
    severity = Column(String(20), nullable=False)
    detected_abnormalities = Column(JSON, default=list)      # List of strings
    baseline_deviations = Column(JSON, default=dict)         # Dict of metric -> deviation
    contributing_factors = Column(JSON, default=list)        # List of explainable factors
    recommended_actions = Column(JSON, default=list)         # List of actions
    anomaly_score = Column(Float, nullable=True)             # Isolation Forest score if applied
    reading_id = Column(Integer, nullable=True)
