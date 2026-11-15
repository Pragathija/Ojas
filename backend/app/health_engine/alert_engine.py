from datetime import datetime, timezone, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.health_record import HealthRecord
from app.models.health_alert import HealthAlert
from app.health_engine.risk_rules import RuleEvaluationResult
from app.core.config import settings


def process_and_create_alerts(
    db: Session,
    astronaut_id: str,
    evaluations: List[RuleEvaluationResult],
    reading_id: Optional[int] = None
) -> List[HealthAlert]:
    """
    Evaluates rule results and generates HealthAlert records with duplicate prevention.
    CRITICAL alerts are NEVER suppressed.
    CAUTION alerts within the deduplication window are suppressed if identical unacknowledged alert exists.
    """
    created_alerts: List[HealthAlert] = []
    now = datetime.now(timezone.utc)
    dedup_cutoff = now - timedelta(minutes=settings.ALERT_DEDUPLICATION_WINDOW_MINUTES)

    for item in evaluations:
        if item.severity == "NORMAL":
            continue

        # Check duplicate rule
        should_create = True
        if item.severity == "CAUTION":
            recent_duplicate = (
                db.query(HealthAlert)
                .filter(
                    HealthAlert.astronaut_id == astronaut_id,
                    HealthAlert.category == item.category,
                    HealthAlert.severity == item.severity,
                    HealthAlert.timestamp >= dedup_cutoff,
                    HealthAlert.is_acknowledged == False
                )
                .first()
            )
            if recent_duplicate:
                # Suppress caution duplicate within window
                should_create = False

        # CRITICAL alerts always bypass deduplication
        if should_create:
            alert = HealthAlert(
                astronaut_id=astronaut_id,
                timestamp=now,
                severity=item.severity,
                category=item.category,
                title=item.title,
                description=item.description,
                recommended_action=item.recommended_action,
                is_acknowledged=False
            )
            db.add(alert)
            created_alerts.append(alert)

    if created_alerts:
        db.commit()
        for a in created_alerts:
            db.refresh(a)

    return created_alerts
