"""
OJAS Latency Profiling & Root-Cause Tail Latency Analysis Script (Phase 11.7)
Profiles:
1. Cold vs Warm ML Inference (Isolation Forest fitting vs cached inference)
2. Data Quality Gateway Processing (Idempotency, normalization, range check)
3. Rolling Personalized Baseline Calculation
4. Deterministic Risk Rules Evaluation
5. Temporal Trajectory Classification
6. Database Write & Outbox Event Persistence
7. Complete End-to-End Telemetry Pipeline Latency
Computes P50, P95, P99, Mean, Min, Max for 100 iterations.
"""

import sys
import os
import json
import time
from datetime import datetime, timezone, timedelta
import numpy as np

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.connection import Base
from app.models.astronaut import Astronaut
from app.models.health_record import HealthRecord
from app.telemetry.schemas import TelemetryPacket
from app.telemetry.quality_gateway import DataQualityGateway
from app.health_engine.risk_rules import evaluate_risk_rules
from app.health_engine.baseline import calculate_and_update_baseline
from app.ml.anomaly_detection import detect_multivariate_anomaly, _WARM_ESTIMATOR_CACHE
from app.ml.temporal_analysis import classify_temporal_trajectory
from app.telemetry.alert_events import AlertEventManager
from app.services.realtime_analysis_service import process_telemetry_packet


def run_latency_profiling(n_iterations: int = 100):
    print(f"[*] Starting OJAS Phase 11 Latency Profiling ({n_iterations} iterations)...")
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    astro_id = "ASTRO-PROFILE-01"
    astronaut = Astronaut(astronaut_id=astro_id, name="Test Profile Astronaut")
    db.add(astronaut)
    db.commit()

    now = datetime.now(timezone.utc)

    # Pre-populate 30 historical records
    history_records = []
    for i in range(30):
        rec = HealthRecord(
            astronaut_id=astro_id,
            timestamp=now - timedelta(minutes=30 - i),
            heart_rate=72.0 + np.sin(i) * 3,
            blood_oxygen=98.5,
            systolic_bp=120.0,
            diastolic_bp=80.0,
            body_temperature=36.6,
            sleep_duration=7.5,
            sleep_quality=85.0,
            stress_level=20.0,
            fatigue_level=2.0,
            is_synthetic=True
        )
        db.add(rec)
        history_records.append(rec)
    db.commit()

    target_record = HealthRecord(
        astronaut_id=astro_id,
        timestamp=now,
        heart_rate=128.0,
        blood_oxygen=94.0,
        systolic_bp=135.0,
        diastolic_bp=88.0,
        body_temperature=37.2,
        sleep_duration=6.0,
        sleep_quality=70.0,
        stress_level=45.0,
        fatigue_level=4.0
    )

    # 1. Cold Start ML Anomaly Latency (Clearing warm cache)
    cold_latencies = []
    for _ in range(20):
        _WARM_ESTIMATOR_CACHE.clear()
        t0 = time.perf_counter()
        detect_multivariate_anomaly(target_record, history_records, return_metadata=True)
        cold_latencies.append((time.perf_counter() - t0) * 1000.0)

    # 2. Warm Cached ML Anomaly Latency
    warm_latencies = []
    # Seed the cache once
    detect_multivariate_anomaly(target_record, history_records, return_metadata=True)
    for _ in range(n_iterations):
        t0 = time.perf_counter()
        detect_multivariate_anomaly(target_record, history_records, return_metadata=True)
        warm_latencies.append((time.perf_counter() - t0) * 1000.0)

    # 3. Quality Gateway Latency
    gateway = DataQualityGateway()
    gateway_latencies = []
    for i in range(n_iterations):
        packet = TelemetryPacket(
            stream_id=f"stream-prof-{i}",
            source_id="device-prof-01",
            idempotency_key=f"idem-key-{i}",
            sequence_num=i + 1,
            session_id="sess-prof-01",
            astronaut_id=astro_id,
            timestamp=now + timedelta(seconds=i),
            heart_rate=75.0,
            blood_oxygen=98.0,
            systolic_bp=120.0,
            diastolic_bp=80.0,
            body_temperature=36.6,
            sleep_duration=7.5,
            sleep_quality=85.0,
            stress_level=20.0,
            fatigue_level=2.0
        )
        t0 = time.perf_counter()
        gateway.process_packet(packet, db=db)
        gateway_latencies.append((time.perf_counter() - t0) * 1000.0)

    # 4. Risk Rules Evaluation Latency
    baseline = calculate_and_update_baseline(db, astro_id)
    rule_latencies = []
    for _ in range(n_iterations):
        t0 = time.perf_counter()
        evaluate_risk_rules(target_record, baseline=baseline)
        rule_latencies.append((time.perf_counter() - t0) * 1000.0)

    # 5. Temporal Trajectory Classification Latency
    temporal_latencies = []
    for _ in range(n_iterations):
        t0 = time.perf_counter()
        classify_temporal_trajectory(history_records)
        temporal_latencies.append((time.perf_counter() - t0) * 1000.0)

    # 6. Baseline Calculation Latency
    baseline_latencies = []
    for _ in range(n_iterations):
        t0 = time.perf_counter()
        calculate_and_update_baseline(db, astro_id)
        baseline_latencies.append((time.perf_counter() - t0) * 1000.0)

    # 7. End-to-End Ingestion Pipeline Latency
    e2e_latencies = []
    for i in range(n_iterations):
        packet = TelemetryPacket(
            stream_id=f"stream-e2e-prof",
            source_id="device-prof-02",
            idempotency_key=f"e2e-idem-{i}",
            sequence_num=i + 1,
            session_id="sess-e2e-01",
            astronaut_id=astro_id,
            timestamp=now + timedelta(minutes=i + 1),
            heart_rate=76.0 + (i % 10),
            blood_oxygen=98.0,
            systolic_bp=120.0,
            diastolic_bp=80.0,
            body_temperature=36.6,
            sleep_duration=7.5,
            sleep_quality=85.0,
            stress_level=20.0,
            fatigue_level=2.0
        )
        t0 = time.perf_counter()
        process_telemetry_packet(db, packet)
        e2e_latencies.append((time.perf_counter() - t0) * 1000.0)

    def stats(arr):
        a = np.array(arr)
        return {
            "mean_ms": round(float(np.mean(a)), 3),
            "std_ms": round(float(np.std(a)), 3),
            "min_ms": round(float(np.min(a)), 3),
            "p50_ms": round(float(np.percentile(a, 50)), 3),
            "p95_ms": round(float(np.percentile(a, 95)), 3),
            "p99_ms": round(float(np.percentile(a, 99)), 3),
            "max_ms": round(float(np.max(a)), 3),
            "samples": len(a)
        }

    results = {
        "profiling_timestamp": datetime.now(timezone.utc).isoformat(),
        "iterations": n_iterations,
        "components": {
            "ml_anomaly_cold_start": stats(cold_latencies),
            "ml_anomaly_warm_cache": stats(warm_latencies),
            "quality_gateway": stats(gateway_latencies),
            "risk_rules_evaluation": stats(rule_latencies),
            "temporal_trajectory_analysis": stats(temporal_latencies),
            "baseline_calculation": stats(baseline_latencies),
            "end_to_end_pipeline": stats(e2e_latencies),
        },
        "tail_latency_root_cause_analysis": {
            "root_cause": "Full IsolationForest ensemble re-fitting (75 trees) on every single packet when history >= 20",
            "cold_fit_mean_ms": stats(cold_latencies)["mean_ms"],
            "warm_inference_mean_ms": stats(warm_latencies)["mean_ms"],
            "speedup_factor": round(stats(cold_latencies)["mean_ms"] / max(0.001, stats(warm_latencies)["mean_ms"]), 1),
            "remediation": "Warm model caching with periodic incremental re-fitting (refresh interval: 15 samples)",
            "p95_reduction_pct": round(
                (1.0 - (stats(warm_latencies)["p95_ms"] / stats(cold_latencies)["p95_ms"])) * 100.0, 1
            )
        }
    }

    output_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "phase11_latency_profile.json"))
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print(f"[+] Profiling complete! Written to: {output_path}")
    print(f"    - Cold-start ML P95: {results['components']['ml_anomaly_cold_start']['p95_ms']:.2f} ms")
    print(f"    - Warm-cache ML P95:  {results['components']['ml_anomaly_warm_cache']['p95_ms']:.2f} ms")
    print(f"    - Speedup Factor:     {results['tail_latency_root_cause_analysis']['speedup_factor']}x")
    print(f"    - End-to-End P95:     {results['components']['end_to_end_pipeline']['p95_ms']:.2f} ms")
    return results


if __name__ == "__main__":
    run_latency_profiling()
