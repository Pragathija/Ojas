import logging
import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.astronaut import Astronaut
from app.models.user import User
from app.models.mission import Mission
from app.models.quest import QuestProgress, AstronautGamificationState
from app.models.achievement import UserAchievement
from app.models.health_baseline import HealthBaseline
from app.models.health_record import HealthRecord
from app.core.security import hash_password

logger = logging.getLogger("ojas.seed")


# Precomputed PBKDF2-HMAC-SHA256 hashes for instant startup
PRECOMPUTED_HASHES = {
    "sarah.connor": "93cbc03e89f0daa441bca3cebc5aa6cc$545a56260f490715052fb5385796ec2e47f02664246582ef3470e2173ec9f65f",
    "dr.stone": "2798a7dd25ef3af3986f5e4f6bf12079$7d4b498f972627e83dce083149304946210c8becaa52c3d317fe70040dd6a413",
    "admin.houston": "e3a8d36b53aa4512a67bbdb2c7669237$93ced2bee04a4f70c6e81222e3ce777e27a2f8605aea4b25d030ed368c2c2ee0",
    "capcom.ops": "af259e4e3023f469ac548e0462ad1bf5$aabb921185c65e6b2be1c62da419c1f2aa01ce546d9bf56575bb2f4f1d2d0d4d",
}


def seed_initial_data(db: Session) -> None:
    """Securely bootstrap initial astronauts, users, mission, and gamification state if not present."""
    try:
        # 1. Ensure Astronaut ASTRO-001 exists
        astro = db.query(Astronaut).filter(Astronaut.astronaut_id == "ASTRO-001").first()
        if not astro:
            astro = Astronaut(
                astronaut_id="ASTRO-001",
                name="Commander Sarah Connor",
                role="Mission Commander",
                mission_day=42,
                age=38
            )
            db.add(astro)
            db.flush()
            logger.info("Created default astronaut ASTRO-001: Commander Sarah Connor")

        # 2. Ensure Default Users exist
        # A. Astronaut account
        user_astro = db.query(User).filter(User.username == "sarah.connor").first()
        if not user_astro:
            user_astro = User(
                username="sarah.connor",
                email="sarah.connor@nasa.gov",
                hashed_password=PRECOMPUTED_HASHES["sarah.connor"],
                full_name="Commander Sarah Connor",
                role="astronaut",
                astronaut_id="ASTRO-001",
                callsign="Valkyrie",
                is_active=True
            )
            db.add(user_astro)
            logger.info("Created default astronaut user 'sarah.connor'")

        # B. Flight Surgeon account
        user_surgeon = db.query(User).filter(User.username == "dr.stone").first()
        if not user_surgeon:
            user_surgeon = User(
                username="dr.stone",
                email="ryan.stone@nasa.gov",
                hashed_password=PRECOMPUTED_HASHES["dr.stone"],
                full_name="Dr. Ryan Stone, MD (Flight Surgeon)",
                role="flight_surgeon",
                astronaut_id=None,
                callsign=None,
                is_active=True
            )
            db.add(user_surgeon)
            logger.info("Created default flight surgeon user 'dr.stone'")

        # C. NASA Super Admin
        user_admin = db.query(User).filter(User.username == "admin.houston").first()
        if not user_admin:
            user_admin = User(
                username="admin.houston",
                email="admin.houston@nasa.gov",
                hashed_password=PRECOMPUTED_HASHES["admin.houston"],
                full_name="Gene Kranz (Flight Director)",
                role="nasa_super_admin",
                astronaut_id=None,
                callsign=None,
                is_active=True
            )
            db.add(user_admin)
            logger.info("Created default NASA super admin 'admin.houston'")

        # D. Operations Monitor
        user_ops = db.query(User).filter(User.username == "capcom.ops").first()
        if not user_ops:
            user_ops = User(
                username="capcom.ops",
                email="capcom.ops@nasa.gov",
                hashed_password=PRECOMPUTED_HASHES["capcom.ops"],
                full_name="CAPCOM Orbital Monitor",
                role="operations_monitor",
                astronaut_id=None,
                callsign=None,
                is_active=True
            )
            db.add(user_ops)
            logger.info("Created default operations monitor 'capcom.ops'")

        # 3. Ensure Mission ARTEMIS-V exists
        mission = db.query(Mission).filter(Mission.code == "ARTEMIS-V").first()
        if not mission:
            mission = Mission(
                code="ARTEMIS-V",
                name="Artemis V - Gateway & Deep Space Transit",
                phase="Lunar Orbit Transit",
                day_number=42,
                total_days=180,
                status="Active",
                description="Long-duration transit mission evaluating astronaut physiological adaptations and psychological resilience.",
                is_active=True
            )
            db.add(mission)
            logger.info("Created default mission ARTEMIS-V")

        # 4. Ensure Gamification State exists
        gamif = db.query(AstronautGamificationState).filter(AstronautGamificationState.astronaut_id == "ASTRO-001").first()
        if not gamif:
            gamif = AstronautGamificationState(
                astronaut_id="ASTRO-001",
                total_xp=1450,
                level=4,
                current_streak_days=7,
                unlocked_planets_json=json.dumps([
                    "serenity_station",
                    "sleep_garden",
                    "focus_nebula",
                    "recovery_moon"
                ])
            )
            db.add(gamif)
            logger.info("Created gamification state for ASTRO-001")

        # 5. Baseline verification
        baseline = db.query(HealthBaseline).filter(HealthBaseline.astronaut_id == "ASTRO-001").first()
        if not baseline:
            baseline = HealthBaseline(
                astronaut_id="ASTRO-001",
                heart_rate_mean=64.0,
                heart_rate_std=4.5,
                blood_oxygen_mean=98.2,
                blood_oxygen_std=0.8,
                systolic_bp_mean=118.0,
                systolic_bp_std=5.0,
                diastolic_bp_mean=76.0,
                diastolic_bp_std=4.0,
                temperature_mean=36.6,
                temperature_std=0.2,
                sleep_duration_mean=7.4,
                sleep_duration_std=0.6,
                stress_level_mean=22.0,
                stress_level_std=5.0,
                fatigue_mean=2.0,
                fatigue_std=0.5,
                sample_count=42,
            )
            db.add(baseline)
            logger.info("Created baseline corridor for ASTRO-001")

        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error during seed_initial_data: {str(e)}")
