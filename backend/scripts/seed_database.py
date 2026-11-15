import sys
import os
from pathlib import Path
from datetime import datetime, timezone, timedelta
import random

# Ensure backend root is on sys.path
backend_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_root))

from app.database.connection import SessionLocal, init_db
from app.models.astronaut import Astronaut
from app.models.health_record import HealthRecord
from app.models.health_alert import HealthAlert
from app.models.analysis_result import AnalysisResult
from app.models.health_baseline import HealthBaseline
from app.services.health_service import create_health_reading
from app.schemas.health import HealthReadingCreate


def seed_data():
    print("Initializing database tables...")
    init_db()

    db = SessionLocal()
    try:
        # Clear existing demo data for clean repeatable run
        print("Clearing existing demo telemetry...")
        db.query(HealthAlert).delete()
        db.query(AnalysisResult).delete()
        db.query(HealthBaseline).delete()
        db.query(HealthRecord).delete()
        db.query(Astronaut).delete()
        db.commit()

        base_time = datetime.now(timezone.utc) - timedelta(days=7)

        # ----------------------------------------------------------------------
        # ASTRONAUT 1: ASTRO-01 (Commander Sarah Connor) - Stable Nominal Profile
        # 25 readings across 7 days to fully train Baseline & Isolation Forest
        # ----------------------------------------------------------------------
        print("Generating telemetry for ASTRO-01 (Nominal baseline profile)...")
        astro1 = Astronaut(
            astronaut_id="ASTRO-01",
            name="Commander Sarah Connor",
            role="Mission Commander",
            mission_day=42,
            age=39
        )
        db.add(astro1)
        db.commit()

        for i in range(25):
            t = base_time + timedelta(hours=i * 6.5)
            reading = HealthReadingCreate(
                astronaut_id="ASTRO-01",
                timestamp=t,
                heart_rate=round(random.uniform(62, 75), 1),
                blood_oxygen=round(random.uniform(97.5, 99.2), 1),
                systolic_bp=round(random.uniform(115, 124), 1),
                diastolic_bp=round(random.uniform(74, 82), 1),
                body_temperature=round(random.uniform(36.5, 36.9), 2),
                sleep_duration=round(random.uniform(7.0, 8.2), 1),
                sleep_quality=round(random.uniform(80, 95), 1),
                stress_level=round(random.uniform(20, 35), 1),
                mood="Focused",
                physical_activity_minutes=round(random.uniform(45, 90), 1),
                fatigue_level=round(random.uniform(1.5, 3.0), 1),
                is_synthetic=True,
                notes="Nominal scheduled telemetry packet (Synthetic Data)"
            )
            create_health_reading(db, reading)

        # ----------------------------------------------------------------------
        # ASTRONAUT 2: ASTRO-02 (Dr. Mark Watney) - Gradual Sleep Deterioration
        # ----------------------------------------------------------------------
        print("Generating telemetry for ASTRO-02 (Gradual Sleep Decay & Fatigue)...")
        astro2 = Astronaut(
            astronaut_id="ASTRO-02",
            name="Dr. Mark Watney",
            role="Botanist / Systems Specialist",
            mission_day=85,
            age=41
        )
        db.add(astro2)
        db.commit()

        # Days 1-4: Healthy baseline
        for i in range(15):
            t = base_time + timedelta(hours=i * 7)
            reading = HealthReadingCreate(
                astronaut_id="ASTRO-02",
                timestamp=t,
                heart_rate=round(random.uniform(65, 78), 1),
                blood_oxygen=round(random.uniform(97.0, 98.8), 1),
                systolic_bp=round(random.uniform(118, 126), 1),
                diastolic_bp=round(random.uniform(76, 82), 1),
                body_temperature=round(random.uniform(36.6, 37.0), 2),
                sleep_duration=round(random.uniform(7.2, 8.0), 1),
                sleep_quality=round(random.uniform(82, 90), 1),
                stress_level=round(random.uniform(25, 40), 1),
                mood="Optimal",
                physical_activity_minutes=60.0,
                fatigue_level=2.0,
                is_synthetic=True,
                notes="Nominal baseline phase (Synthetic Data)"
            )
            create_health_reading(db, reading)

        # Days 5-7: Deteriorating sleep & mounting exhaustion
        sleep_degrade = [
            (5.5, 55.0, 50.0, 5.0, "Mildly Tired"),
            (4.8, 42.0, 68.0, 7.0, "Fatigued"),
            (3.8, 30.0, 84.0, 9.2, "Exhausted")
        ]
        for idx, (s_dur, s_qual, stress, fat, mood) in enumerate(sleep_degrade):
            t = base_time + timedelta(days=4 + idx, hours=10)
            reading = HealthReadingCreate(
                astronaut_id="ASTRO-02",
                timestamp=t,
                heart_rate=round(82 + idx * 4, 1),
                blood_oxygen=96.5,
                systolic_bp=128 + idx * 3,
                diastolic_bp=84 + idx * 2,
                body_temperature=36.8,
                sleep_duration=s_dur,
                sleep_quality=s_qual,
                stress_level=stress,
                mood=mood,
                physical_activity_minutes=20.0,
                fatigue_level=fat,
                is_synthetic=True,
                notes=f"Sleep deficit phase day {idx+1} (Synthetic Data)"
            )
            create_health_reading(db, reading)

        # ----------------------------------------------------------------------
        # ASTRONAUT 3: ASTRO-03 (Engineer Elena Rostova) - Hypoxia & Elevated HR
        # ----------------------------------------------------------------------
        print("Generating telemetry for ASTRO-03 (Hypoxia / EVA Simulation Alert)...")
        astro3 = Astronaut(
            astronaut_id="ASTRO-03",
            name="Engineer Elena Rostova",
            role="Flight Engineer",
            mission_day=110,
            age=36
        )
        db.add(astro3)
        db.commit()

        # Baseline records
        for i in range(12):
            t = base_time + timedelta(hours=i * 10)
            reading = HealthReadingCreate(
                astronaut_id="ASTRO-03",
                timestamp=t,
                heart_rate=round(random.uniform(68, 76), 1),
                blood_oxygen=round(random.uniform(98.0, 99.5), 1),
                systolic_bp=round(random.uniform(116, 122), 1),
                diastolic_bp=round(random.uniform(75, 80), 1),
                body_temperature=36.6,
                sleep_duration=7.5,
                sleep_quality=88.0,
                stress_level=30.0,
                mood="Nominal",
                physical_activity_minutes=60.0,
                fatigue_level=2.5,
                is_synthetic=True,
                notes="Nominal pre-EVA baseline (Synthetic Data)"
            )
            create_health_reading(db, reading)

        # EVA telemetry with low O2 & tachycardia trigger
        eva_time = datetime.now(timezone.utc) - timedelta(hours=2)
        reading_eva = HealthReadingCreate(
            astronaut_id="ASTRO-03",
            timestamp=eva_time,
            heart_rate=118.0,
            blood_oxygen=91.5,
            systolic_bp=138.0,
            diastolic_bp=88.0,
            body_temperature=37.4,
            sleep_duration=6.5,
            sleep_quality=75.0,
            stress_level=78.0,
            mood="Strained",
            physical_activity_minutes=120.0,
            fatigue_level=6.5,
            is_synthetic=True,
            notes="EVA Simulation telemetry - low SpO2 incident (Synthetic Data)"
        )
        create_health_reading(db, reading_eva)

        total_readings = db.query(HealthRecord).count()
        total_alerts = db.query(HealthAlert).count()
        total_analyses = db.query(AnalysisResult).count()

        print("\nSeed completed successfully!")
        print(f"Total Astronauts: 3")
        print(f"Total Synthetic Health Readings: {total_readings}")
        print(f"Generated Analysis Insights: {total_analyses}")
        print(f"Generated Alerts: {total_alerts}")

    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
