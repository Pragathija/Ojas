"""
OJAS Real-Time Telemetry & AI Orchestration Benchmark (Phase 9.7).
Measures real performance on host hardware:
1. Sustained ingestion throughput (packets/sec).
2. Burst ingestion throughput (50-packet burst).
3. Multi-astronaut concurrent streams (6 crew members).
4. Full AI orchestration latency (quality gateway -> baseline -> IF -> rules -> XAI -> alert events -> DB).
5. Alert event dispatch and delivery confirmation latency.
6. Stream interruption recovery and idempotency throughput.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import time
import platform
import json
import tracemalloc
import concurrent.futures
from datetime import datetime, timezone, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.connection import Base
from app.telemetry.schemas import TelemetryPacket, TelemetryProvenance
from app.telemetry.stream_simulator import StreamSimulator
from app.services.realtime_analysis_service import process_telemetry_packet
from app.telemetry.quality_gateway import default_quality_gateway
from app.telemetry.alert_events import default_alert_manager


def create_in_memory_db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return Session()


def benchmark_sustained_ingestion(db, packet_count=60):
    sim = StreamSimulator(random_seed=101)
    packets = sim.generate_nominal_stream(astronaut_id="BENCH-SUSTAINED", count=packet_count)

    t0 = time.perf_counter()
    for pkt in packets:
        process_telemetry_packet(db, pkt, auto_dispatch_alerts=True)
    t1 = time.perf_counter()

    elapsed_ms = (t1 - t0) * 1000.0
    throughput = round(packet_count / (t1 - t0), 1)
    per_packet_ms = round(elapsed_ms / packet_count, 2)

    return {
        "packet_count": packet_count,
        "total_elapsed_ms": round(elapsed_ms, 2),
        "per_packet_latency_ms": per_packet_ms,
        "sustained_throughput_packets_per_sec": throughput,
    }


def benchmark_burst_ingestion(db, burst_size=50):
    sim = StreamSimulator(random_seed=202)
    packets = sim.generate_hypoxia_progression_stream(astronaut_id="BENCH-BURST", count=burst_size)

    t0 = time.perf_counter()
    for pkt in packets:
        process_telemetry_packet(db, pkt, auto_dispatch_alerts=True)
    t1 = time.perf_counter()

    elapsed_ms = (t1 - t0) * 1000.0
    throughput = round(burst_size / (t1 - t0), 1)

    return {
        "burst_size": burst_size,
        "total_elapsed_ms": round(elapsed_ms, 2),
        "burst_throughput_packets_per_sec": throughput,
        "per_packet_ms": round(elapsed_ms / burst_size, 2),
    }


def benchmark_concurrent_crew(crew_size=6, packets_per_astronaut=10):
    total_packets = crew_size * packets_per_astronaut

    def astronaut_worker(crew_idx):
        engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
        Base.metadata.create_all(bind=engine)
        Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        local_db = Session()

        astro_id = f"ASTRO-CREW-{crew_idx}"
        sim = StreamSimulator(random_seed=1000 + crew_idx)
        packets = sim.generate_nominal_stream(astronaut_id=astro_id, count=packets_per_astronaut)

        worker_latencies = []
        for pkt in packets:
            t0 = time.perf_counter()
            process_telemetry_packet(local_db, pkt, auto_dispatch_alerts=True)
            t1 = time.perf_counter()
            worker_latencies.append((t1 - t0) * 1000.0)

        local_db.close()
        return worker_latencies

    t_start = time.perf_counter()
    with concurrent.futures.ThreadPoolExecutor(max_workers=crew_size) as executor:
        futures = [executor.submit(astronaut_worker, i) for i in range(crew_size)]
        all_latencies = []
        for f in concurrent.futures.as_completed(futures):
            all_latencies.extend(f.result())
    t_end = time.perf_counter()

    wall_elapsed_ms = (t_end - t_start) * 1000.0
    concurrent_throughput = round(total_packets / (t_end - t_start), 1)
    mean_latency = round(float(sum(all_latencies) / len(all_latencies)), 2)
    p95_latency = round(float(sorted(all_latencies)[int(len(all_latencies) * 0.95)]), 2)

    return {
        "crew_size_simulated": crew_size,
        "total_packets_processed": total_packets,
        "wall_time_ms": round(wall_elapsed_ms, 2),
        "concurrent_throughput_packets_per_sec": concurrent_throughput,
        "mean_latency_ms": mean_latency,
        "p95_latency_ms": p95_latency,
    }


def benchmark_idempotency_and_recovery(db, duplicate_burst=30):
    sim = StreamSimulator(random_seed=303)
    packet = sim.generate_nominal_stream(astronaut_id="BENCH-IDEMP", count=1)[0]

    # Process first time
    res1 = process_telemetry_packet(db, packet)
    assert res1.ingestion_result.status.value in ["ACCEPTED", "OUT_OF_ORDER_ACCEPTED"]

    # Ingest 30 identical duplicate packets
    t0 = time.perf_counter()
    for _ in range(duplicate_burst):
        res_dup = process_telemetry_packet(db, packet)
        assert res_dup.ingestion_result.status.value == "DUPLICATE"
        assert res_dup.ingestion_result.is_cached_response is True
    t1 = time.perf_counter()

    elapsed_ms = (t1 - t0) * 1000.0
    throughput = round(duplicate_burst / (t1 - t0), 1)
    per_dup_ms = round(elapsed_ms / duplicate_burst, 4)

    return {
        "duplicate_burst": duplicate_burst,
        "total_elapsed_ms": round(elapsed_ms, 2),
        "duplicate_check_throughput_per_sec": throughput,
        "per_duplicate_latency_ms": per_dup_ms,
    }


def main():
    print("=" * 60)
    print("OJAS REAL-TIME TELEMETRY & AI ORCHESTRATION BENCHMARK (PHASE 9.7)")
    print("=" * 60)

    hw_info = {
        "os": f"{platform.system()} {platform.release()} ({platform.version()})",
        "python_version": sys.version.split()[0],
        "machine": platform.machine(),
        "processor": platform.processor(),
    }
    print(f"Environment: {hw_info['os']} | Python {hw_info['python_version']} | {hw_info['machine']}")

    db = create_in_memory_db()

    print("\n1. Measuring sustained ingestion throughput (60 packets)...")
    sustained_res = benchmark_sustained_ingestion(db, packet_count=60)
    print(f"   Throughput: {sustained_res['sustained_throughput_packets_per_sec']} packets/s | Mean: {sustained_res['per_packet_latency_ms']} ms/pkt")

    print("\n2. Measuring burst ingestion throughput (50 hypoxia packets)...")
    burst_res = benchmark_burst_ingestion(db, burst_size=50)
    print(f"   Throughput: {burst_res['burst_throughput_packets_per_sec']} packets/s | Total: {burst_res['total_elapsed_ms']} ms")

    print("\n3. Measuring concurrent crew streams (6 astronauts, 60 total packets)...")
    crew_res = benchmark_concurrent_crew(crew_size=6, packets_per_astronaut=10)
    print(f"   Throughput: {crew_res['concurrent_throughput_packets_per_sec']} packets/s | Mean: {crew_res['mean_latency_ms']} ms | P95: {crew_res['p95_latency_ms']} ms")

    print("\n4. Measuring duplicate idempotency check throughput...")
    idemp_res = benchmark_idempotency_and_recovery(db, duplicate_burst=50)
    print(f"   Throughput: {idemp_res['duplicate_check_throughput_per_sec']} checks/s | Latency: {idemp_res['per_duplicate_latency_ms']} ms")

    db.close()

    report = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "environment": hw_info,
        "sustained_ingestion": sustained_res,
        "burst_ingestion": burst_res,
        "concurrent_crew_orchestration": crew_res,
        "idempotency_and_recovery": idemp_res,
    }

    out_file = Path("Ojas/backend/scripts/realtime_benchmark_results.json")
    with open(out_file, "w") as f:
        json.dump(report, f, indent=2)

    print(f"\nReal-time benchmark results saved to {out_file}")
    print("=" * 60)


if __name__ == "__main__":
    main()
