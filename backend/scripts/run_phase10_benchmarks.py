"""
OJAS Phase 10 Distributed Reliability, Durable Event Processing & Performance Benchmark.
Executes separated, empirical measurements for:
1. Data Quality Gateway throughput.
2. Persistent Idempotency check & insert throughput.
3. Database write throughput.
4. Deterministic risk rule evaluation.
5. Full end-to-end AI orchestration.
6. Durable outbox alert creation.
7. Alert confirmed delivery and retry scheduling.
8. Multi-astronaut concurrent ingestion across 6 expedition crew streams.
9. Crash recovery and outbox replay performance.
Records throughput, P50, P95, P99 latency, error rate, duplicate prevention rate, memory, and recovery time.
Saves results to backend/scripts/phase10_benchmark_results.json.
"""

import sys
import os
import time
import json
import uuid
import platform
import tracemalloc
from datetime import datetime, timezone, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed
import numpy as np
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database.connection import Base
from app.models.astronaut import Astronaut
from app.models.health_record import HealthRecord
from app.models.telemetry_idempotency import TelemetryIdempotencyRecord
from app.models.alert_outbox import AlertOutboxEvent
from app.models.stream_session import StreamSessionState
from app.telemetry.schemas import TelemetryPacket, PacketIngestionStatus, TelemetryProvenance
from app.telemetry.quality_gateway import DataQualityGateway
from app.telemetry.alert_events import AlertEventManager, simulated_mission_control_adapter
from app.telemetry.stream_simulator import StreamSimulator
from app.services.realtime_analysis_service import process_telemetry_packet
from app.health_engine.risk_rules import evaluate_risk_rules, RuleEvaluationResult


def calc_stats(latencies_ms):
    arr = np.array(latencies_ms)
    return {
        "count": len(arr),
        "mean_ms": round(float(np.mean(arr)), 3),
        "p50_ms": round(float(np.percentile(arr, 50)), 3),
        "p95_ms": round(float(np.percentile(arr, 95)), 3),
        "p99_ms": round(float(np.percentile(arr, 99)), 3),
        "min_ms": round(float(np.min(arr)), 3),
        "max_ms": round(float(np.max(arr)), 3),
    }


def run_benchmarks():
    print("================================================================================")
    print("       OJAS PHASE 10 EMPIRICAL RELIABILITY & PERFORMANCE BENCHMARK              ")
    print("================================================================================")

    tracemalloc.start()
    benchmark_start_time = time.perf_counter()

    # Hardware & Environment
    env_info = {
        "os": f"{platform.system()} {platform.release()} ({platform.version()})",
        "python_version": platform.python_version(),
        "architecture": platform.machine(),
        "processor": platform.processor(),
        "database": "SQLite In-Memory (Thread-Safe Isolation) / PostgreSQL Schema Ready",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "external_services": "SIMULATED_MISSION_CONTROL_CONSOLE (No unapproved cloud calls)",
    }
    print(f"Platform: {env_info['os']} | Python: {env_info['python_version']} | Arch: {env_info['architecture']}")

    sim = StreamSimulator(random_seed=42)

    # Database setup with StaticPool for in-memory cross-connection consistency
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = Session()

    # Pre-seed astronaut
    db.add(Astronaut(astronaut_id="ASTRO-BENCH-01", name="Commander Shepard", role="Mission Commander"))
    db.commit()

    # -------------------------------------------------------------------------
    # 1. DATA QUALITY GATEWAY THROUGHPUT (Memory validation only)
    # -------------------------------------------------------------------------
    print("\n--- 1. Data Quality Gateway Validation (In-Memory) ---")
    gw = DataQualityGateway()
    now_gw = datetime.now(timezone.utc)
    raw_packets = []
    base_t = now_gw - timedelta(minutes=30)
    for seq in range(500):
        raw_packets.append(TelemetryPacket(
            stream_id="STREAM-GW-BENCH",
            source_id="bioharness_v4",
            idempotency_key=f"idemp-gw-{seq}-{uuid.uuid4().hex[:6]}",
            sequence_num=seq,
            astronaut_id="ASTRO-GW",
            timestamp=base_t + timedelta(seconds=seq * 2),
            heart_rate=72.0,
            blood_oxygen=98.0,
            systolic_bp=120.0,
            diastolic_bp=80.0,
            body_temperature=36.6,
            sleep_duration=7.5,
            sleep_quality=85.0,
            stress_level=20.0,
            fatigue_level=2.0
        ))

    gw_latencies = []
    gw_errors = 0
    t0 = time.perf_counter()
    for pkt in raw_packets:
        p_t0 = time.perf_counter()
        try:
            is_acc, res = gw.process_packet(pkt, db=None)
            if not is_acc:
                gw_errors += 1
        except Exception:
            gw_errors += 1
        gw_latencies.append((time.perf_counter() - p_t0) * 1000.0)
    gw_elapsed = time.perf_counter() - t0
    gw_throughput = len(raw_packets) / gw_elapsed
    gw_stats = calc_stats(gw_latencies)
    gw_stats["throughput_pkts_per_sec"] = round(gw_throughput, 1)
    gw_stats["error_rate_pct"] = round((gw_errors / len(raw_packets)) * 100.0, 2)
    print(f"Gateway Throughput: {gw_stats['throughput_pkts_per_sec']} pkts/sec | Mean: {gw_stats['mean_ms']} ms | P95: {gw_stats['p95_ms']} ms")

    # -------------------------------------------------------------------------
    # 2. PERSISTENT IDEMPOTENCY THROUGHPUT (DB checks & duplicate prevention)
    # -------------------------------------------------------------------------
    print("\n--- 2. Persistent Idempotency (Database Level) ---")
    idemp_packets = sim.generate_nominal_stream(astronaut_id="ASTRO-IDEMP-B", count=150)
    idemp_latencies = []
    t0 = time.perf_counter()
    for pkt in idemp_packets:
        p_t0 = time.perf_counter()
        gw.process_packet(pkt, db=db)
        idemp_latencies.append((time.perf_counter() - p_t0) * 1000.0)
    idemp_elapsed = time.perf_counter() - t0
    idemp_insert_throughput = len(idemp_packets) / idemp_elapsed

    # Re-check all 150 packets (simulating duplicate re-transmissions against DB)
    gw.clear_cache()  # Clear memory cache so checks strictly hit DB!
    dup_latencies = []
    dups_prevented = 0
    t0 = time.perf_counter()
    for pkt in idemp_packets:
        p_t0 = time.perf_counter()
        is_acc, res = gw.process_packet(pkt, db=db)
        if res.status == PacketIngestionStatus.DUPLICATE and res.is_cached_response:
            dups_prevented += 1
        dup_latencies.append((time.perf_counter() - p_t0) * 1000.0)
    dup_elapsed = time.perf_counter() - t0
    dup_throughput = len(idemp_packets) / dup_elapsed

    idemp_stats = calc_stats(dup_latencies)
    idemp_stats["insert_throughput_pkts_per_sec"] = round(idemp_insert_throughput, 1)
    idemp_stats["duplicate_check_throughput_pkts_per_sec"] = round(dup_throughput, 1)
    idemp_stats["duplicate_prevention_rate_pct"] = round((dups_prevented / len(idemp_packets)) * 100.0, 2)
    print(f"Persistent DB Duplicate Check: {idemp_stats['duplicate_check_throughput_pkts_per_sec']} checks/sec | P95: {idemp_stats['p95_ms']} ms | Dups Prevented: {idemp_stats['duplicate_prevention_rate_pct']}%")

    # -------------------------------------------------------------------------
    # 3. DATABASE WRITE THROUGHPUT (HealthRecord + SessionState)
    # -------------------------------------------------------------------------
    print("\n--- 3. Database Write Throughput ---")
    now = datetime.now(timezone.utc)
    db_write_latencies = []
    t0 = time.perf_counter()
    for i in range(150):
        w_t0 = time.perf_counter()
        hr = HealthRecord(
            astronaut_id="ASTRO-BENCH-01",
            timestamp=now + timedelta(seconds=i * 10),
            heart_rate=72.0,
            blood_oxygen=98.0,
            systolic_bp=120.0,
            diastolic_bp=80.0,
            body_temperature=36.6,
            sleep_duration=7.0,
            sleep_quality=80.0,
            stress_level=20.0,
            fatigue_level=2.0,
        )
        db.add(hr)
        db.commit()
        db_write_latencies.append((time.perf_counter() - w_t0) * 1000.0)
    db_write_elapsed = time.perf_counter() - t0
    db_write_stats = calc_stats(db_write_latencies)
    db_write_stats["writes_per_sec"] = round(150 / db_write_elapsed, 1)
    print(f"Database Writes: {db_write_stats['writes_per_sec']} writes/sec | Mean: {db_write_stats['mean_ms']} ms | P95: {db_write_stats['p95_ms']} ms")

    # -------------------------------------------------------------------------
    # 4. DETERMINISTIC RULE EVALUATION THROUGHPUT
    # -------------------------------------------------------------------------
    print("\n--- 4. Deterministic Risk Rules Evaluation ---")
    sample_rec = HealthRecord(
        heart_rate=125.0,
        blood_oxygen=84.0,
        systolic_bp=150.0,
        diastolic_bp=95.0,
        body_temperature=36.6,
        sleep_duration=7.0,
        sleep_quality=80.0,
        stress_level=20.0,
        fatigue_level=2.0
    )
    rule_latencies = []
    t0 = time.perf_counter()
    for _ in range(500):
        r_t0 = time.perf_counter()
        _ = evaluate_risk_rules(sample_rec, baseline=None, recent_records=[])
        rule_latencies.append((time.perf_counter() - r_t0) * 1000.0)
    rule_elapsed = time.perf_counter() - t0
    rule_stats = calc_stats(rule_latencies)
    rule_stats["evaluations_per_sec"] = round(500 / rule_elapsed, 1)
    print(f"Rule Evaluation: {rule_stats['evaluations_per_sec']} evals/sec | Mean: {rule_stats['mean_ms']} ms | P95: {rule_stats['p95_ms']} ms")

    # -------------------------------------------------------------------------
    # 5. FULL END-TO-END AI ORCHESTRATION PIPELINE
    # -------------------------------------------------------------------------
    print("\n--- 5. Full End-to-End AI Orchestration Pipeline ---")
    orch_packets = sim.generate_nominal_stream(astronaut_id="ASTRO-ORCH-BENCH", count=30)
    orch_latencies = []
    orch_errors = 0
    t0 = time.perf_counter()
    for pkt in orch_packets:
        o_t0 = time.perf_counter()
        try:
            bundle = process_telemetry_packet(db, pkt)
            if not bundle.analysis_result:
                orch_errors += 1
        except Exception:
            orch_errors += 1
        orch_latencies.append((time.perf_counter() - o_t0) * 1000.0)
    orch_elapsed = time.perf_counter() - t0
    orch_stats = calc_stats(orch_latencies)
    orch_stats["pipeline_throughput_pkts_per_sec"] = round(len(orch_packets) / orch_elapsed, 1)
    orch_stats["error_rate_pct"] = round((orch_errors / len(orch_packets)) * 100.0, 2)
    print(f"Full AI Orchestration: {orch_stats['pipeline_throughput_pkts_per_sec']} pkts/sec | Mean: {orch_stats['mean_ms']} ms | P95: {orch_stats['p95_ms']} ms | P99: {orch_stats['p99_ms']} ms")

    # -------------------------------------------------------------------------
    # 6. DURABLE ALERT CREATION & TRANSACTIONAL OUTBOX
    # -------------------------------------------------------------------------
    print("\n--- 6. Durable Alert Creation & Transactional Outbox ---")
    alert_mgr = AlertEventManager()
    outbox_latencies = []
    t0 = time.perf_counter()
    for i in range(100):
        a_t0 = time.perf_counter()
        evals = [
            RuleEvaluationResult(
                severity="CRITICAL",
                category="RESPIRATORY",
                title=f"Acute Hypoxia Alert #{i}",
                description="Oxygen level depleted.",
                recommended_action="Emergency mask.",
                contributing_factors=["SpO2 84%"]
            )
        ]
        evts = alert_mgr.process_rule_evaluations(
            astronaut_id="ASTRO-OUTBOX-BENCH",
            evaluations=evals,
            reading_id=i,
            db=db
        )
        db.commit()
        outbox_latencies.append((time.perf_counter() - a_t0) * 1000.0)
    outbox_elapsed = time.perf_counter() - t0
    outbox_stats = calc_stats(outbox_latencies)
    outbox_stats["alerts_created_per_sec"] = round(100 / outbox_elapsed, 1)
    print(f"Durable Outbox Alert Creation: {outbox_stats['alerts_created_per_sec']} alerts/sec | Mean: {outbox_stats['mean_ms']} ms | P95: {outbox_stats['p95_ms']} ms")

    # -------------------------------------------------------------------------
    # 7. ALERT CONFIRMED DELIVERY & RETRY SCHEDULING
    # -------------------------------------------------------------------------
    print("\n--- 7. Alert Confirmed Delivery & Retries ---")
    unconfirmed_events = alert_mgr.get_events(astronaut_id="ASTRO-OUTBOX-BENCH")
    dispatch_latencies = []
    t0 = time.perf_counter()
    for evt in unconfirmed_events[:50]:
        d_t0 = time.perf_counter()
        alert_mgr.dispatch_alert(evt.event_id, db=db, delivery_adapter=simulated_mission_control_adapter)
        db.commit()
        dispatch_latencies.append((time.perf_counter() - d_t0) * 1000.0)
    dispatch_elapsed = time.perf_counter() - t0
    dispatch_stats = calc_stats(dispatch_latencies)
    dispatch_stats["confirmed_deliveries_per_sec"] = round(50 / dispatch_elapsed, 1)
    print(f"Confirmed Delivery: {dispatch_stats['confirmed_deliveries_per_sec']} deliveries/sec | Mean: {dispatch_stats['mean_ms']} ms | P95: {dispatch_stats['p95_ms']} ms")

    # -------------------------------------------------------------------------
    # 8. MULTI-ASTRONAUT CONCURRENT INGESTION (6 Crew Members)
    # -------------------------------------------------------------------------
    print("\n--- 8. Multi-Astronaut Concurrent Ingestion (6 Expeditions) ---")
    crew_ids = [f"CREW-BENCH-{i+1}" for i in range(6)]
    crew_streams = {cid: sim.generate_nominal_stream(astronaut_id=cid, count=15) for cid in crew_ids}

    concurrent_latencies = []
    db_contention_errors = 0

    import threading
    sqlite_lock = threading.Lock()

    def worker_stream(cid, packets):
        worker_db = Session()
        w_latencies = []
        errors = 0
        try:
            for p in packets:
                pt0 = time.perf_counter()
                try:
                    with sqlite_lock:
                        b = process_telemetry_packet(worker_db, p)
                        if not b.health_record:
                            errors += 1
                except Exception as e:
                    errors += 1
                w_latencies.append((time.perf_counter() - pt0) * 1000.0)
        finally:
            worker_db.close()
        return w_latencies, errors

    t0 = time.perf_counter()
    with ThreadPoolExecutor(max_workers=6) as executor:
        futures = [executor.submit(worker_stream, cid, crew_streams[cid]) for cid in crew_ids]
        for f in as_completed(futures):
            lats, errs = f.result()
            concurrent_latencies.extend(lats)
            db_contention_errors += errs
    concurrent_elapsed = time.perf_counter() - t0
    concurrent_stats = calc_stats(concurrent_latencies)
    total_concurrent_pkts = len(concurrent_latencies)
    concurrent_stats["crew_size"] = len(crew_ids)
    concurrent_stats["concurrent_throughput_pkts_per_sec"] = round(total_concurrent_pkts / concurrent_elapsed, 1)
    concurrent_stats["db_contention_errors"] = db_contention_errors
    print(f"Concurrent Crew Throughput: {concurrent_stats['concurrent_throughput_pkts_per_sec']} pkts/sec | Mean: {concurrent_stats['mean_ms']} ms | P95: {concurrent_stats['p95_ms']} ms | Contention Errors: {db_contention_errors}")

    # -------------------------------------------------------------------------
    # 9. CRASH RECOVERY & OUTBOX REPLAY PERFORMANCE
    # -------------------------------------------------------------------------
    print("\n--- 9. Crash Recovery & Outbox Replay Performance ---")
    # Seed 50 pending outbox events directly into DB (simulating crash before delivery)
    now = datetime.now(timezone.utc)
    for i in range(50):
        db.add(AlertOutboxEvent(
            event_id=f"evt-replay-crash-{i}-{uuid.uuid4().hex[:6]}",
            astronaut_id="ASTRO-RECOVERY",
            severity="CRITICAL",
            category="COMPOUND",
            title=f"Replay Test #{i}",
            description="Replay description",
            recommended_action="Inspect",
            detection_method="DETERMINISTIC_RULE",
            deduplication_policy="IMMEDIATE_BYPASS",
            delivery_state="PENDING",
            delivery_channel="MISSION_CONTROL_CONSOLE",
            retry_count=0,
            max_retries=3,
            created_at=now
        ))
    db.commit()

    # Time the recovery routine
    t0 = time.perf_counter()
    recovered_events = alert_mgr.recover_pending_outbox_events(
        db,
        worker_id="benchmark-recovery-agent",
        lease_seconds=60,
        max_batch=100
    )
    recovery_elapsed_ms = (time.perf_counter() - t0) * 1000.0
    recovery_throughput = len(recovered_events) / (recovery_elapsed_ms / 1000.0)

    recovery_stats = {
        "recovered_count": len(recovered_events),
        "recovery_wall_time_ms": round(recovery_elapsed_ms, 3),
        "recovery_throughput_events_per_sec": round(recovery_throughput, 1),
        "mean_per_recovery_ms": round(recovery_elapsed_ms / max(1, len(recovered_events)), 3)
    }
    print(f"Outbox Crash Recovery: {recovery_stats['recovered_count']} events recovered in {recovery_stats['recovery_wall_time_ms']} ms ({recovery_stats['recovery_throughput_events_per_sec']} events/sec)")

    # -------------------------------------------------------------------------
    # MEMORY & SUMMARY REPORT
    # -------------------------------------------------------------------------
    current_mem, peak_mem = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    total_benchmark_time_ms = round((time.perf_counter() - benchmark_start_time) * 1000.0, 2)
    memory_stats = {
        "current_allocated_mb": round(current_mem / (1024 * 1024), 3),
        "peak_allocated_mb": round(peak_mem / (1024 * 1024), 3),
    }
    print(f"\nMemory Profile: Current: {memory_stats['current_allocated_mb']} MB | Peak: {memory_stats['peak_allocated_mb']} MB")
    print(f"Total Benchmark Suite Duration: {total_benchmark_time_ms} ms")

    results_payload = {
        "environment": env_info,
        "metrics": {
            "gateway_validation": gw_stats,
            "persistent_idempotency": idemp_stats,
            "database_writes": db_write_stats,
            "deterministic_rule_evaluation": rule_stats,
            "full_ai_orchestration": orch_stats,
            "durable_outbox_creation": outbox_stats,
            "alert_confirmed_delivery": dispatch_stats,
            "concurrent_crew_ingestion": concurrent_stats,
            "crash_recovery_and_replay": recovery_stats,
            "memory_utilization": memory_stats,
            "total_benchmark_duration_ms": total_benchmark_time_ms,
        }
    }

    out_path = os.path.join(os.path.dirname(__file__), "phase10_benchmark_results.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(results_payload, f, indent=2)

    print(f"\nBenchmark results successfully persisted to {out_path}")
    db.close()


if __name__ == "__main__":
    run_benchmarks()
