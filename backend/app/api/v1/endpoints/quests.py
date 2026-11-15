import logging
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.database.connection import get_db
from app.models.quest import QuestProgress, AstronautGamificationState
from app.models.achievement import UserAchievement
from app.schemas.gamification import QuestClaimRequest, UnlockPlanetRequest, GamificationStateResponse
from app.core.security import get_current_user, verify_astronaut_isolation

logger = logging.getLogger("ojas.gamification")
router = APIRouter()

PLANET_UNLOCK_THRESHOLDS = {
    "serenity_station": 0,
    "sleep_garden": 200,
    "focus_nebula": 500,
    "recovery_moon": 900,
    "science_observatory": 1400,
    "exploration_galaxy": 2000,
}


@router.get("/status", response_model=GamificationStateResponse, summary="Get Astronaut Gamification State")
def get_gamification_status(
    astronaut_id: str = "ASTRO-001",
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve astronaut's XP, level, streak, unlocked planets, and achievements."""
    verify_astronaut_isolation(current_user, astronaut_id)

    state = db.query(AstronautGamificationState).filter(
        AstronautGamificationState.astronaut_id == astronaut_id
    ).first()

    if not state:
        state = AstronautGamificationState(
            astronaut_id=astronaut_id,
            total_xp=1450,
            level=4,
            current_streak_days=7,
            unlocked_planets_json=json.dumps(["serenity_station", "sleep_garden", "focus_nebula", "recovery_moon"]),
        )
        db.add(state)
        db.commit()
        db.refresh(state)

    claimed = db.query(QuestProgress).filter(QuestProgress.astronaut_id == astronaut_id).all()
    achievements = db.query(UserAchievement).filter(UserAchievement.astronaut_id == astronaut_id).all()

    planets = []
    try:
        planets = json.loads(state.unlocked_planets_json) if state.unlocked_planets_json else []
    except Exception:
        planets = ["serenity_station"]

    return GamificationStateResponse(
        astronaut_id=state.astronaut_id,
        total_xp=state.total_xp,
        level=state.level,
        current_streak_days=state.current_streak_days,
        unlocked_planets=planets,
        claimed_quests=[q.to_dict() for q in claimed],
        unlocked_achievements=[a.to_dict() for a in achievements],
    )


@router.post("/claim-quest", summary="Claim Quest XP (Duplicate Protected)")
def claim_quest(
    payload: QuestClaimRequest,
    astronaut_id: str = "ASTRO-001",
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Atomically record quest completion and award XP. Fails if already claimed (duplicate protection)."""
    verify_astronaut_isolation(current_user, astronaut_id)

    # Check for duplicate claim in database
    existing = db.query(QuestProgress).filter(
        QuestProgress.astronaut_id == astronaut_id,
        QuestProgress.quest_id == payload.quest_id,
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Quest '{payload.quest_id}' has already been claimed by astronaut '{astronaut_id}'. Duplicate XP is prevented.",
        )

    try:
        quest = QuestProgress(
            astronaut_id=astronaut_id,
            quest_id=payload.quest_id,
            title=payload.title,
            status="claimed",
            xp_awarded=payload.xp_reward,
        )
        db.add(quest)

        # Update or create astronaut gamification state
        state = db.query(AstronautGamificationState).filter(
            AstronautGamificationState.astronaut_id == astronaut_id
        ).first()

        if not state:
            state = AstronautGamificationState(
                astronaut_id=astronaut_id,
                total_xp=payload.xp_reward,
                level=1,
                current_streak_days=1,
                unlocked_planets_json=json.dumps(["serenity_station"]),
            )
            db.add(state)
        else:
            state.total_xp += payload.xp_reward
            # Calculate level: 1 level per 500 XP
            state.level = max(1, (state.total_xp // 500) + 1)

            # Check if new planets should auto-unlock based on XP
            current_planets = []
            try:
                current_planets = json.loads(state.unlocked_planets_json) if state.unlocked_planets_json else []
            except Exception:
                current_planets = ["serenity_station"]

            for planet, threshold in PLANET_UNLOCK_THRESHOLDS.items():
                if state.total_xp >= threshold and planet not in current_planets:
                    current_planets.append(planet)

            state.unlocked_planets_json = json.dumps(current_planets)

        db.commit()
        return {
            "success": True,
            "quest_id": payload.quest_id,
            "xp_awarded": payload.xp_reward,
            "new_total_xp": state.total_xp,
            "level": state.level,
        }
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Concurrent duplicate claim detected for quest '{payload.quest_id}'. Transaction rolled back.",
        )


@router.post("/unlock-planet", summary="Unlock Explored Planet")
def unlock_planet(
    payload: UnlockPlanetRequest,
    astronaut_id: str = "ASTRO-001",
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark planet as unlocked after satisfying exploration requirements."""
    verify_astronaut_isolation(current_user, astronaut_id)

    state = db.query(AstronautGamificationState).filter(
        AstronautGamificationState.astronaut_id == astronaut_id
    ).first()

    if not state:
        raise HTTPException(status_code=404, detail="Astronaut gamification state not found")

    planets = []
    try:
        planets = json.loads(state.unlocked_planets_json) if state.unlocked_planets_json else []
    except Exception:
        planets = ["serenity_station"]

    if payload.planet_id not in planets:
        planets.append(payload.planet_id)
        state.unlocked_planets_json = json.dumps(planets)
        db.commit()

    return {"success": True, "unlocked_planets": planets}
