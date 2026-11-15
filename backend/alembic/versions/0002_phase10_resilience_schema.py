"""Phase 10 Resilience & Distributed Outbox Schema

Revision ID: 0002
Revises: 0001
Create Date: 2026-11-15 15:10:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Telemetry Idempotency Records Table
    op.create_table(
        'telemetry_idempotency_records',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('idempotency_key', sa.String(length=128), nullable=False),
        sa.Column('stream_id', sa.String(length=100), nullable=False),
        sa.Column('source_id', sa.String(length=100), nullable=False),
        sa.Column('astronaut_id', sa.String(length=50), nullable=False),
        sa.Column('sequence_num', sa.Integer(), nullable=False),
        sa.Column('session_id', sa.String(length=100), nullable=True),
        sa.Column('status', sa.String(length=30), nullable=False),
        sa.Column('quality_score', sa.Float(), nullable=False),
        sa.Column('rejection_reason', sa.String(length=500), nullable=True),
        sa.Column('warnings', sa.JSON(), nullable=True),
        sa.Column('record_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_telemetry_idempotency_records_id'), 'telemetry_idempotency_records', ['id'], unique=False)
    op.create_index(op.f('ix_telemetry_idempotency_records_idempotency_key'), 'telemetry_idempotency_records', ['idempotency_key'], unique=True)
    op.create_index(op.f('ix_telemetry_idempotency_records_stream_id'), 'telemetry_idempotency_records', ['stream_id'], unique=False)
    op.create_index(op.f('ix_telemetry_idempotency_records_astronaut_id'), 'telemetry_idempotency_records', ['astronaut_id'], unique=False)
    op.create_index(op.f('ix_telemetry_idempotency_records_created_at'), 'telemetry_idempotency_records', ['created_at'], unique=False)
    op.create_index(op.f('ix_telemetry_idempotency_records_expires_at'), 'telemetry_idempotency_records', ['expires_at'], unique=False)

    # 2. Alert Outbox Events Table
    op.create_table(
        'alert_outbox_events',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('event_id', sa.String(length=64), nullable=False),
        sa.Column('reading_id', sa.Integer(), nullable=True),
        sa.Column('astronaut_id', sa.String(length=50), nullable=False),
        sa.Column('severity', sa.String(length=20), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=150), nullable=False),
        sa.Column('description', sa.String(length=500), nullable=False),
        sa.Column('recommended_action', sa.String(length=500), nullable=False),
        sa.Column('detection_method', sa.String(length=50), nullable=False),
        sa.Column('supporting_evidence', sa.JSON(), nullable=True),
        sa.Column('deduplication_policy', sa.String(length=50), nullable=False),
        sa.Column('delivery_state', sa.String(length=20), nullable=False),
        sa.Column('delivery_channel', sa.String(length=50), nullable=False),
        sa.Column('delivery_receipt', sa.JSON(), nullable=True),
        sa.Column('delivery_confirmed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('retry_count', sa.Integer(), nullable=False),
        sa.Column('max_retries', sa.Integer(), nullable=False),
        sa.Column('next_retry_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_error', sa.String(length=500), nullable=True),
        sa.Column('locked_until', sa.DateTime(timezone=True), nullable=True),
        sa.Column('locked_by', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_acknowledged', sa.Boolean(), nullable=False),
        sa.Column('acknowledged_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('acknowledged_by', sa.String(length=100), nullable=True),
        sa.Column('acknowledged_role', sa.String(length=50), nullable=True),
        sa.Column('acknowledgment_note', sa.String(length=500), nullable=True),
        sa.Column('previous_state', sa.String(length=50), nullable=True),
        sa.Column('is_clinically_signed_off', sa.Boolean(), nullable=False),
        sa.Column('clinical_signoff_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('signed_off_by', sa.String(length=100), nullable=True),
        sa.Column('clinical_role', sa.String(length=50), nullable=True),
        sa.Column('clinical_rationale', sa.String(length=500), nullable=True),
        sa.Column('disposition', sa.String(length=50), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_alert_outbox_events_id'), 'alert_outbox_events', ['id'], unique=False)
    op.create_index(op.f('ix_alert_outbox_events_event_id'), 'alert_outbox_events', ['event_id'], unique=True)
    op.create_index(op.f('ix_alert_outbox_events_astronaut_id'), 'alert_outbox_events', ['astronaut_id'], unique=False)
    op.create_index(op.f('ix_alert_outbox_events_severity'), 'alert_outbox_events', ['severity'], unique=False)
    op.create_index(op.f('ix_alert_outbox_events_delivery_state'), 'alert_outbox_events', ['delivery_state'], unique=False)
    op.create_index(op.f('ix_alert_outbox_events_next_retry_at'), 'alert_outbox_events', ['next_retry_at'], unique=False)
    op.create_index(op.f('ix_alert_outbox_events_locked_until'), 'alert_outbox_events', ['locked_until'], unique=False)
    op.create_index(op.f('ix_alert_outbox_events_created_at'), 'alert_outbox_events', ['created_at'], unique=False)

    # 3. Stream Session States Table
    op.create_table(
        'stream_session_states',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('stream_id', sa.String(length=100), nullable=False),
        sa.Column('source_id', sa.String(length=100), nullable=False),
        sa.Column('session_id', sa.String(length=100), nullable=False),
        sa.Column('astronaut_id', sa.String(length=50), nullable=False),
        sa.Column('highest_sequence_num', sa.Integer(), nullable=False),
        sa.Column('latest_reading_timestamp', sa.DateTime(timezone=True), nullable=True),
        sa.Column('latest_record_id', sa.Integer(), nullable=True),
        sa.Column('total_packets_received', sa.Integer(), nullable=False),
        sa.Column('total_gaps_detected', sa.Integer(), nullable=False),
        sa.Column('total_resets_detected', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_stream_session_states_id'), 'stream_session_states', ['id'], unique=False)
    op.create_index(op.f('ix_stream_session_states_stream_id'), 'stream_session_states', ['stream_id'], unique=True)
    op.create_index(op.f('ix_stream_session_states_astronaut_id'), 'stream_session_states', ['astronaut_id'], unique=False)


def downgrade() -> None:
    op.drop_table('stream_session_states')
    op.drop_table('alert_outbox_events')
    op.drop_table('telemetry_idempotency_records')
