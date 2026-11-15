"""
OJAS Real-Time Data Quality Gateway (Phase 9 & 10).
Provides:
- Strict UTC timestamp normalization and future/past drift bounds.
- Persistent database-backed idempotency surviving restarts and cross-worker contention.
- In-memory rapid-deflection cache for sub-millisecond duplicate suppression.
- Distributed stream session sequencing, sequence gap detection, and counter reset recovery.
- Guarding latest-reading state: late-arriving packets cannot overwrite newer stream timestamps.
- Rejection of physically impossible physiological measurements with auditable reasons.
- Never silently drops observations: returns structured IngestionResult with auditable metadata.
"""

from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional, Tuple, Set, List
import logging
import numpy as np
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.telemetry.schemas import (
    TelemetryPacket,
    IngestionResult,
    PacketIngestionStatus,
)
from app.ml.preprocessing import VALID_PHYSIOLOGICAL_RANGES
from app.models.telemetry_idempotency import TelemetryIdempotencyRecord
from app.models.stream_session import StreamSessionState

logger = logging.getLogger("ojas.gateway")

MAX_FUTURE_DRIFT_HOURS = 2.0
MAX_STALE_AGE_HOURS = 72.0


class DataQualityGateway:
    def __init__(self):
        # In-memory stream sequencing cache: stream_id -> highest sequence_num seen
        self._stream_sequences: Dict[str, int] = {}
        # In-memory idempotency cache: idempotency_key -> IngestionResult
        self._idempotency_cache: Dict[str, IngestionResult] = {}
        # Rejection audit log
        self._rejection_log: List[Dict[str, Any]] = []

    def normalize_utc_timestamp(self, ts: datetime) -> datetime:
        """Normalizes any datetime (naive or offset-aware) to UTC."""
        if ts.tzinfo is None:
            return ts.replace(tzinfo=timezone.utc)
        return ts.astimezone(timezone.utc)

    def process_packet(
        self,
        packet: TelemetryPacket,
        db: Optional[Session] = None
    ) -> Tuple[bool, IngestionResult]:
        """
        Evaluates a telemetry packet through the multi-stage quality gateway.
        Supports both database-persisted idempotency/sequencing (when db is provided)
        and memory-cached evaluation.
        Returns (is_acceptable_for_db_and_ai, IngestionResult).
        """
        now = datetime.now(timezone.utc)
        packet_id = f"pkt-{packet.stream_id}-{packet.sequence_num}"
        warnings = []

        # 1. Idempotency Check (Persistent DB check first, fallback to memory cache)
        if db is not None:
            db_idemp = (
                db.query(TelemetryIdempotencyRecord)
                .filter(TelemetryIdempotencyRecord.idempotency_key == packet.idempotency_key)
                .first()
            )
            if db_idemp is not None:
                cached_res = IngestionResult(
                    packet_id=packet_id,
                    idempotency_key=packet.idempotency_key,
                    stream_id=db_idemp.stream_id,
                    astronaut_id=db_idemp.astronaut_id,
                    sequence_num=db_idemp.sequence_num,
                    session_id=db_idemp.session_id or packet.session_id,
                    status=PacketIngestionStatus.DUPLICATE,
                    timestamp=self.normalize_utc_timestamp(db_idemp.created_at),
                    quality_score=db_idemp.quality_score,
                    rejection_reason=db_idemp.rejection_reason,
                    warnings=["Persistent duplicate packet detected; returned cached database result."],
                    is_cached_response=True,
                    record_id=db_idemp.record_id
                )
                self._idempotency_cache[packet.idempotency_key] = cached_res
                return False, cached_res

        if packet.idempotency_key in self._idempotency_cache:
            cached = self._idempotency_cache[packet.idempotency_key]
            result = IngestionResult(
                packet_id=packet_id,
                idempotency_key=packet.idempotency_key,
                stream_id=packet.stream_id,
                astronaut_id=packet.astronaut_id,
                sequence_num=packet.sequence_num,
                session_id=packet.session_id,
                status=PacketIngestionStatus.DUPLICATE,
                timestamp=cached.timestamp,
                quality_score=cached.quality_score,
                rejection_reason=None,
                warnings=["Duplicate packet received; returned cached ingestion result."],
                is_cached_response=True,
                record_id=cached.record_id
            )
            return False, result

        # 2. Timestamp Validation & Normalization
        norm_ts = self.normalize_utc_timestamp(packet.timestamp)
        future_limit = now + timedelta(hours=MAX_FUTURE_DRIFT_HOURS)
        if norm_ts > future_limit:
            reason = f"Timestamp '{norm_ts.isoformat()}' in the future exceeds {MAX_FUTURE_DRIFT_HOURS}-hour allowable drift."
            result = IngestionResult(
                packet_id=packet_id,
                idempotency_key=packet.idempotency_key,
                stream_id=packet.stream_id,
                astronaut_id=packet.astronaut_id,
                sequence_num=packet.sequence_num,
                session_id=packet.session_id,
                status=PacketIngestionStatus.REJECTED,
                timestamp=norm_ts,
                quality_score=0.0,
                rejection_reason=reason,
                warnings=[reason]
            )
            self._log_rejection(packet, reason)
            self._persist_idempotency_record(db, packet, result, None)
            return False, result

        # Stale reading check
        is_stale = False
        stale_limit = now - timedelta(hours=MAX_STALE_AGE_HOURS)
        if norm_ts < stale_limit:
            is_stale = True
            age_hrs = round((now - norm_ts).total_seconds() / 3600.0, 1)
            warnings.append(f"Stale telemetry packet received ({age_hrs} hours old).")

        # 3. Physiological Range & Consistency Validation
        invalid_reasons = []
        checks = [
            ("heart_rate", packet.heart_rate),
            ("blood_oxygen", packet.blood_oxygen),
            ("systolic_bp", packet.systolic_bp),
            ("diastolic_bp", packet.diastolic_bp),
            ("body_temperature", packet.body_temperature),
            ("sleep_duration", packet.sleep_duration),
            ("sleep_quality", packet.sleep_quality),
            ("stress_level", packet.stress_level),
            ("fatigue_level", packet.fatigue_level),
        ]

        valid_count = 0
        for name, val in checks:
            if val is None or np.isnan(val) or np.isinf(val):
                invalid_reasons.append(f"{name} is NaN or Infinite.")
                continue

            min_b, max_b = VALID_PHYSIOLOGICAL_RANGES[name]
            if min_b <= float(val) <= max_b:
                valid_count += 1
            else:
                invalid_reasons.append(f"{name}={val} outside operational range [{min_b}, {max_b}].")

        # Hemodynamic consistency
        if packet.diastolic_bp >= packet.systolic_bp:
            invalid_reasons.append(
                f"Hemodynamic impossibility: Diastolic BP ({packet.diastolic_bp}) >= Systolic BP ({packet.systolic_bp})."
            )

        quality_score = round(valid_count / len(checks), 3)

        if invalid_reasons:
            reason = f"Physiological validation failed: {'; '.join(invalid_reasons)}"
            result = IngestionResult(
                packet_id=packet_id,
                idempotency_key=packet.idempotency_key,
                stream_id=packet.stream_id,
                astronaut_id=packet.astronaut_id,
                sequence_num=packet.sequence_num,
                session_id=packet.session_id,
                status=PacketIngestionStatus.REJECTED,
                timestamp=norm_ts,
                quality_score=quality_score,
                rejection_reason=reason,
                warnings=invalid_reasons
            )
            self._log_rejection(packet, reason)
            self._persist_idempotency_record(db, packet, result, None)
            return False, result

        # 4. Stream Sequencing & Out-of-Order Check (Durable when db provided)
        status = PacketIngestionStatus.ACCEPTED

        if db is not None:
            stream_session = (
                db.query(StreamSessionState)
                .filter(StreamSessionState.stream_id == packet.stream_id)
                .first()
            )
            if stream_session is None:
                stream_session = StreamSessionState(
                    stream_id=packet.stream_id,
                    source_id=packet.source_id,
                    session_id=packet.session_id or "session-default-01",
                    astronaut_id=packet.astronaut_id,
                    highest_sequence_num=packet.sequence_num,
                    latest_reading_timestamp=norm_ts,
                    total_packets_received=1,
                    total_gaps_detected=0,
                    total_resets_detected=0
                )
                db.add(stream_session)
                db.flush()
                status = PacketIngestionStatus.ACCEPTED
            else:
                # Check for device session epoch or counter reset
                is_reset = (
                    (packet.session_id and packet.session_id != stream_session.session_id) or
                    (packet.sequence_num == 0 and stream_session.highest_sequence_num > 5)
                )
                if is_reset:
                    stream_session.session_id = packet.session_id or "session-default-01"
                    stream_session.highest_sequence_num = packet.sequence_num
                    stream_session.total_resets_detected += 1
                    warnings.append(
                        f"Device session counter reset detected for stream '{packet.stream_id}' "
                        f"(prior highest: {stream_session.highest_sequence_num})."
                    )
                    status = PacketIngestionStatus.ACCEPTED
                else:
                    # Check for sequence gap
                    if packet.sequence_num > stream_session.highest_sequence_num + 1:
                        gap_count = packet.sequence_num - stream_session.highest_sequence_num - 1
                        stream_session.total_gaps_detected += gap_count
                        warnings.append(
                            f"Sequence gap detected ({gap_count} packets missing between "
                            f"{stream_session.highest_sequence_num} and {packet.sequence_num})."
                        )

                    # Check for out-of-order sequence
                    if packet.sequence_num <= stream_session.highest_sequence_num:
                        status = PacketIngestionStatus.OUT_OF_ORDER_ACCEPTED
                        warnings.append(
                            f"Packet arrived out of sequence (current: {packet.sequence_num}, "
                            f"highest seen: {stream_session.highest_sequence_num})."
                        )
                    else:
                        stream_session.highest_sequence_num = packet.sequence_num

                # Guard latest-reading state: A late-arriving packet must NOT overwrite a newer latest-reading state
                stream_ts = self.normalize_utc_timestamp(stream_session.latest_reading_timestamp) if stream_session.latest_reading_timestamp else None
                if stream_ts is None or norm_ts >= stream_ts:
                    stream_session.latest_reading_timestamp = norm_ts

                stream_session.total_packets_received += 1
                stream_session.updated_at = datetime.now(timezone.utc)
                db.flush()
        else:
            # In-memory sequencing fallback
            last_seq = self._stream_sequences.get(packet.stream_id)
            if last_seq is not None:
                if packet.sequence_num <= last_seq:
                    status = PacketIngestionStatus.OUT_OF_ORDER_ACCEPTED
                    warnings.append(f"Packet arrived out of sequence (current: {packet.sequence_num}, latest seen: {last_seq}).")
                else:
                    self._stream_sequences[packet.stream_id] = packet.sequence_num
            else:
                self._stream_sequences[packet.stream_id] = packet.sequence_num

        if is_stale and status == PacketIngestionStatus.ACCEPTED:
            status = PacketIngestionStatus.STALE_ACCEPTED

        result = IngestionResult(
            packet_id=packet_id,
            idempotency_key=packet.idempotency_key,
            stream_id=packet.stream_id,
            astronaut_id=packet.astronaut_id,
            sequence_num=packet.sequence_num,
            session_id=packet.session_id,
            status=status,
            timestamp=norm_ts,
            quality_score=quality_score,
            rejection_reason=None,
            warnings=warnings,
            is_cached_response=False
        )

        # Cache in memory and DB
        self._idempotency_cache[packet.idempotency_key] = result
        self._persist_idempotency_record(db, packet, result, None)

        return True, result

    def _persist_idempotency_record(
        self,
        db: Optional[Session],
        packet: TelemetryPacket,
        result: IngestionResult,
        record_id: Optional[int]
    ):
        """Persists idempotency record to the database with duplicate collision protection."""
        if db is None:
            return
        try:
            idemp_rec = TelemetryIdempotencyRecord(
                idempotency_key=packet.idempotency_key,
                stream_id=packet.stream_id,
                source_id=packet.source_id,
                astronaut_id=packet.astronaut_id,
                sequence_num=packet.sequence_num,
                session_id=packet.session_id,
                status=result.status.value,
                quality_score=result.quality_score,
                rejection_reason=result.rejection_reason,
                warnings=result.warnings,
                record_id=record_id,
                created_at=result.timestamp,
                expires_at=TelemetryIdempotencyRecord.create_expiration(retention_days=7)
            )
            db.add(idemp_rec)
            db.flush()
        except IntegrityError:
            # Concurrent insertion by another worker: rollback and ignore
            db.rollback()
            logger.info(f"Concurrent duplicate insertion absorbed for idempotency key '{packet.idempotency_key}'.")

    def register_record_id(self, idempotency_key: str, record_id: int, db: Optional[Session] = None):
        """Associates the persisted database record ID with the cached idempotency result."""
        if idempotency_key in self._idempotency_cache:
            self._idempotency_cache[idempotency_key].record_id = record_id

        if db is not None:
            idemp_rec = (
                db.query(TelemetryIdempotencyRecord)
                .filter(TelemetryIdempotencyRecord.idempotency_key == idempotency_key)
                .first()
            )
            if idemp_rec:
                idemp_rec.record_id = record_id
                db.flush()

    def cleanup_expired_idempotency(self, db: Session, now: Optional[datetime] = None) -> int:
        """Purges expired idempotency records according to retention policy."""
        cutoff = now or datetime.now(timezone.utc)
        deleted = (
            db.query(TelemetryIdempotencyRecord)
            .filter(TelemetryIdempotencyRecord.expires_at < cutoff)
            .delete()
        )
        db.commit()
        return deleted

    def _log_rejection(self, packet: TelemetryPacket, reason: str):
        self._rejection_log.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "stream_id": packet.stream_id,
            "sequence_num": packet.sequence_num,
            "session_id": packet.session_id,
            "astronaut_id": packet.astronaut_id,
            "idempotency_key": packet.idempotency_key,
            "rejection_reason": reason,
        })

    def get_rejection_log(self) -> List[Dict[str, Any]]:
        return list(self._rejection_log)

    def clear_cache(self):
        """Clears memory caches for testing or restart simulation."""
        self._stream_sequences.clear()
        self._idempotency_cache.clear()
        self._rejection_log.clear()


# Global Singleton Gateway
default_quality_gateway = DataQualityGateway()
