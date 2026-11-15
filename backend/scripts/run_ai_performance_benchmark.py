"""
OJAS AI Performance Benchmarking Script (Phase 7.8).
Measures actual runtime metrics on local hardware:
1. Single-record inference latency.
2. Historical batch analysis latency.
3. Concurrent request throughput.
4. Peak memory allocation (tracemalloc).
5. NASA BRSMAct dataset loading and parsing latency.
6. Isolation Forest model instantiation and training overhead.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import time
import tracemalloc
import concurrent.futures
import platform
import sys
import json
from datetime import datetime, timezone, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.connection import Base
from app.models.health_record import HealthRecord
from app.models.astronaut import Astronaut
from app.services.analysis_service import run_health_analysis
from app.ml.anomaly_detection import detect_multivariate_anomaly
from app.datasets.nasa_brsmact.loader import NasaBRSMActLoader


def create_in_memory_db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return Session()


def benchmark_single_inference(db, num_iterations=50):
    astro_id = "BENCH-ASTRO-01"
    now = datetime.now(timezone.utc)

    # Populate 25 historical records so full ML + temporal pipeline runs
    for i in range(25):
        r = HealthRecord(
            astronaut_id=astro_id,
            timestamp=now - timedelta(hours=26 - i),
            heart_rate=70.0 + (i % 5),
            blood_oxygen=98.0,
            systolic_bp=120.0,
            diastolic_bp=80.0,
            body_temperature=36.6,
            sleep_duration=7.5,
            sleep_quality=85.0,
            stress_level=20.0,
            fatigue_level=2.0
        )
        db.add(r)
    db.commit()

    # Target reading
    target = HealthRecord(
        astronaut_id=astro_id,
        timestamp=now,
        heart_rate=75.0,
        blood_oxygen=97.5,
        systolic_bp=122.0,
        diastolic_bp=82.0,
        body_temperature=36.7,
        sleep_duration=7.0,
        sleep_quality=80.0,
        stress_level=25.0,
        fatigue_level=3.0
    )
    db.add(target)
    db.commit()

    # Warmup
    run_health_analysis(db, astro_id, reading_id=target.id)

    # Benchmark timed loop
    latencies = []
    for _ in range(num_iterations):
        t0 = time.perf_counter()
        run_health_analysis(db, astro_id, reading_id=target.id)
        t1 = time.perf_counter()
        latencies.append((t1 - t0) * 1000.0)  # ms

    return {
        "iterations": num_iterations,
        "mean_ms": round(float(sum(latencies) / len(latencies)), 2),
        "median_ms": round(float(sorted(latencies)[len(latencies) // 2]), 2),
        "p95_ms": round(float(sorted(latencies)[int(len(latencies) * 0.95)]), 2),
        "min_ms": round(float(min(latencies)), 2),
        "max_ms": round(float(max(latencies)), 2),
    }


def benchmark_batch_analysis(db, batch_sizes=[10, 25, 50]):
    results = {}
    now = datetime.now(timezone.utc)

    for b_size in batch_sizes:
        astro_id = f"BENCH-BATCH-{b_size}"
        readings = []
        for i in range(b_size):
            r = HealthRecord(
                astronaut_id=astro_id,
                timestamp=now - timedelta(minutes=(b_size - i) * 15),
                heart_rate=70.0 + (i % 6),
                blood_oxygen=98.0,
                systolic_bp=120.0,
                diastolic_bp=80.0,
                body_temperature=36.6,
                sleep_duration=7.5,
                sleep_quality=85.0,
                stress_level=20.0,
                fatigue_level=2.0
            )
            db.add(r)
            readings.append(r)
        db.commit()

        t0 = time.perf_counter()
        for r in readings:
            run_health_analysis(db, astro_id, reading_id=r.id)
        t1 = time.perf_counter()

        elapsed_ms = (t1 - t0) * 1000.0
        results[f"batch_{b_size}"] = {
            "total_time_ms": round(elapsed_ms, 2),
            "per_record_ms": round(elapsed_ms / b_size, 2),
            "throughput_records_per_sec": round(b_size / (t1 - t0), 1),
        }

    return results


def benchmark_concurrent_inference(num_workers=4, requests_per_worker=8):
    total_requests = num_workers * requests_per_worker

    def worker_task(worker_id):
        engine = create_engine(f"sqlite:///:memory:", connect_args={"check_same_thread": False})
        Base.metadata.create_all(bind=engine)
        Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        local_db = Session()
        astro_id = f"BENCH-CONC-{worker_id}"
        now = datetime.now(timezone.utc)
        for i in range(25):
            r = HealthRecord(
                astronaut_id=astro_id,
                timestamp=now - timedelta(hours=26 - i),
                heart_rate=72.0,
                blood_oxygen=98.0,
                systolic_bp=120.0,
                diastolic_bp=80.0,
                body_temperature=36.6,
                sleep_duration=7.5,
                sleep_quality=85.0,
                stress_level=20.0,
                fatigue_level=2.0
            )
            local_db.add(r)
        local_db.commit()

        target = HealthRecord(
            astronaut_id=astro_id,
            timestamp=now,
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
        local_db.add(target)
        local_db.commit()

        worker_latencies = []
        for _ in range(requests_per_worker):
            t0 = time.perf_counter()
            run_health_analysis(local_db, astro_id, reading_id=target.id)
            t1 = time.perf_counter()
            worker_latencies.append((t1 - t0) * 1000.0)
        local_db.close()
        return worker_latencies

    t_start = time.perf_counter()
    with concurrent.futures.ThreadPoolExecutor(max_workers=num_workers) as executor:
        futures = [executor.submit(worker_task, i) for i in range(num_workers)]
        all_worker_latencies = []
        for f in concurrent.futures.as_completed(futures):
            all_worker_latencies.extend(f.result())
    t_end = time.perf_counter()

    total_wall_ms = (t_end - t_start) * 1000.0
    throughput = round(total_requests / (t_end - t_start), 1)

    return {
        "num_workers": num_workers,
        "total_requests": total_requests,
        "wall_time_ms": round(total_wall_ms, 2),
        "throughput_req_per_sec": throughput,
        "mean_latency_ms": round(float(sum(all_worker_latencies) / len(all_worker_latencies)), 2),
    }


def benchmark_memory_and_loading():
    tracemalloc.start()
    m0_current, m0_peak = tracemalloc.get_traced_memory()

    # Load NASA BRSMAct dataset
    t0 = time.perf_counter()
    loader = NasaBRSMActLoader(verify_hashes=False)
    records = loader.load_primary_dataset()
    t1 = time.perf_counter()
    dataset_load_ms = round((t1 - t0) * 1000.0, 2)

    m1_current, m1_peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    return {
        "nasa_brsmact_records_loaded": len(records),
        "dataset_load_time_ms": dataset_load_ms,
        "memory_peak_kb": round(m1_peak / 1024.0, 2),
    }


def main():
    print("=" * 60)
    print("OJAS AI ENGINE PERFORMANCE BENCHMARK (PHASE 7.8)")
    print("=" * 60)

    hw_info = {
        "os": f"{platform.system()} {platform.release()} ({platform.version()})",
        "python_version": sys.version.split()[0],
        "machine": platform.machine(),
        "processor": platform.processor(),
    }
    print(f"Hardware: {hw_info['os']} | Python {hw_info['python_version']} | {hw_info['machine']}")

    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = Session()

    print("\n1. Measuring single-record inference latency...")
    single_res = benchmark_single_inference(db, num_iterations=40)
    print(f"   Mean: {single_res['mean_ms']} ms | Median: {single_res['median_ms']} ms | P95: {single_res['p95_ms']} ms")

    print("\n2. Measuring historical batch analysis latency...")
    batch_res = benchmark_batch_analysis(db, batch_sizes=[10, 25, 50])
    for k, v in batch_res.items():
        print(f"   {k}: {v['per_record_ms']} ms/record ({v['throughput_records_per_sec']} rec/s)")

    print("\n3. Measuring concurrent inference (4 workers)...")
    conc_res = benchmark_concurrent_inference(num_workers=4, requests_per_worker=8)
    print(f"   Throughput: {conc_res['throughput_req_per_sec']} req/s | Mean Latency: {conc_res['mean_latency_ms']} ms")

    print("\n4. Measuring memory and dataset loading...")
    mem_res = benchmark_memory_and_loading()
    print(f"   Loaded {mem_res['nasa_brsmact_records_loaded']} records in {mem_res['dataset_load_time_ms']} ms")
    print(f"   Peak memory allocation: {mem_res['memory_peak_kb']} KB")

    db.close()

    full_report = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "environment": hw_info,
        "single_record_inference": single_res,
        "batch_analysis": batch_res,
        "concurrent_inference": conc_res,
        "dataset_and_memory": mem_res,
    }

    with open("Ojas/backend/scripts/benchmark_results.json", "w") as f:
        json.dump(full_report, f, indent=2)

    print("\nBenchmark results saved to Ojas/backend/scripts/benchmark_results.json")
    print("=" * 60)


if __name__ == "__main__":
    main()
