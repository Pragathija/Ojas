"""
OJAS Local Telemetry Stream Simulator (Phase 9.1 & 9.5).
Generates realistic, sequential, timestamped telemetry streams for testing:
- Nominal baseline flight streams.
- Progressive hypoxia deterioration streams.
- Sensor artifact spike streams.
- Deep-space network interruption and telemetry gap streams.
- Adversarial duplicates and out-of-order sequences.
- STRICT DATA PROVENANCE: All packets are tagged with provenance = SIMULATED_TELEMETRY.
"""

import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
import numpy as np

from app.telemetry.schemas import TelemetryPacket, TelemetryProvenance


class StreamSimulator:
    def __init__(self, random_seed: int = 42):
        self.rng = np.random.default_rng(random_seed)

    def generate_nominal_stream(
        self,
        astronaut_id: str = "ASTRO-SIM-01",
        count: int = 20,
        start_time: Optional[datetime] = None,
        stream_id: Optional[str] = None
    ) -> List[TelemetryPacket]:
        """Generates a steady, nominal physiological telemetry stream."""
        s_id = stream_id or f"STREAM-{astronaut_id}-NOMINAL"
        base_time = start_time or (datetime.now(timezone.utc) - timedelta(hours=count * 0.5))
        packets = []

        for seq in range(count):
            t = base_time + timedelta(minutes=seq * 15)
            pkt = TelemetryPacket(
                stream_id=s_id,
                source_id="bioharness_v4",
                idempotency_key=f"idemp-{s_id}-{seq}-{uuid.uuid4().hex[:6]}",
                sequence_num=seq,
                provenance=TelemetryProvenance.SIMULATED_TELEMETRY,
                astronaut_id=astronaut_id,
                timestamp=t,
                heart_rate=round(float(self.rng.normal(70.0, 2.5)), 1),
                blood_oxygen=round(min(100.0, float(self.rng.normal(98.2, 0.4))), 1),
                systolic_bp=round(float(self.rng.normal(120.0, 3.0)), 1),
                diastolic_bp=round(float(self.rng.normal(80.0, 2.0)), 1),
                body_temperature=round(float(self.rng.normal(36.6, 0.1)), 2),
                sleep_duration=7.5,
                sleep_quality=85.0,
                stress_level=round(float(self.rng.uniform(15.0, 25.0)), 1),
                fatigue_level=2.0,
                mood="Nominal",
                physical_activity_minutes=30.0,
                notes=f"Simulated nominal telemetry sequence {seq}"
            )
            packets.append(pkt)

        return packets

    def generate_hypoxia_progression_stream(
        self,
        astronaut_id: str = "ASTRO-SIM-02",
        count: int = 10,
        start_time: Optional[datetime] = None
    ) -> List[TelemetryPacket]:
        """Generates progressive, monotonic oxygen saturation decline (gradual deterioration into hypoxia)."""
        s_id = f"STREAM-{astronaut_id}-HYPOXIA"
        base_time = start_time or (datetime.now(timezone.utc) - timedelta(hours=count * 0.5))
        packets = []

        # Monotonically dropping SpO2 from 98% down to 87%
        spo2_levels = np.linspace(98.0, 87.0, count)
        hr_levels = np.linspace(72.0, 118.0, count)  # Compensatory tachycardia

        for seq in range(count):
            t = base_time + timedelta(minutes=seq * 15)
            pkt = TelemetryPacket(
                stream_id=s_id,
                source_id="bioharness_v4",
                idempotency_key=f"idemp-{s_id}-{seq}-{uuid.uuid4().hex[:6]}",
                sequence_num=seq,
                provenance=TelemetryProvenance.SIMULATED_TELEMETRY,
                astronaut_id=astronaut_id,
                timestamp=t,
                heart_rate=round(float(hr_levels[seq]), 1),
                blood_oxygen=round(float(spo2_levels[seq]), 1),
                systolic_bp=round(120.0 + (seq * 1.5), 1),
                diastolic_bp=round(80.0 + (seq * 0.8), 1),
                body_temperature=36.7,
                sleep_duration=6.0,
                sleep_quality=70.0,
                stress_level=round(30.0 + (seq * 4.0), 1),
                fatigue_level=round(min(10.0, 3.0 + (seq * 0.6)), 1),
                mood="Dyspnea" if seq > 5 else "Nominal",
                notes=f"Simulated hypoxia progression step {seq}"
            )
            packets.append(pkt)

        return packets

    def generate_spike_stream(
        self,
        astronaut_id: str = "ASTRO-SIM-03",
        count: int = 8,
        spike_index: int = 4
    ) -> List[TelemetryPacket]:
        """Generates a nominal stream with an isolated, single-packet sensor artifact spike."""
        packets = self.generate_nominal_stream(astronaut_id=astronaut_id, count=count)
        # Inject transient spike
        spike_pkt = packets[spike_index]
        spike_pkt.heart_rate = 145.0  # Acute tachycardia artifact
        spike_pkt.notes = "Simulated transient sensor artifact spike"
        return packets

    def generate_interrupted_stream(
        self,
        astronaut_id: str = "ASTRO-SIM-04",
        gap_hours: float = 6.0
    ) -> List[TelemetryPacket]:
        """Generates stream with an extensive communications blackout gap."""
        now = datetime.now(timezone.utc)
        p1 = self.generate_nominal_stream(astronaut_id=astronaut_id, count=3, start_time=now - timedelta(hours=gap_hours + 1))
        p2 = self.generate_nominal_stream(astronaut_id=astronaut_id, count=3, start_time=now, stream_id=p1[0].stream_id)
        # Adjust sequence numbers
        for i, pkt in enumerate(p2):
            pkt.sequence_num = len(p1) + i
        return p1 + p2
