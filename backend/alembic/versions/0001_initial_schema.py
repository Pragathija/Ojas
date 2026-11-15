"""Initial Core Schema (Phase 1-5)

Revision ID: 0001
Revises: 
Create Date: 2026-11-15 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Astronauts Table
    op.create_table(
        'astronauts',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('astronaut_id', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('role', sa.String(length=100), nullable=True),
        sa.Column('mission_day', sa.Integer(), nullable=True),
        sa.Column('age', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_astronauts_id'), 'astronauts', ['id'], unique=False)
    op.create_index(op.f('ix_astronauts_astronaut_id'), 'astronauts', ['astronaut_id'], unique=True)

    # 2. Health Records Table
    op.create_table(
        'health_records',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('astronaut_id', sa.String(length=50), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('heart_rate', sa.Float(), nullable=False),
        sa.Column('blood_oxygen', sa.Float(), nullable=False),
        sa.Column('systolic_bp', sa.Float(), nullable=False),
        sa.Column('diastolic_bp', sa.Float(), nullable=False),
        sa.Column('body_temperature', sa.Float(), nullable=False),
        sa.Column('sleep_duration', sa.Float(), nullable=True),
        sa.Column('sleep_quality', sa.Float(), nullable=True),
        sa.Column('stress_level', sa.Float(), nullable=True),
        sa.Column('mood', sa.String(length=50), nullable=True),
        sa.Column('physical_activity_minutes', sa.Float(), nullable=True),
        sa.Column('fatigue_level', sa.Float(), nullable=True),
        sa.Column('is_synthetic', sa.Boolean(), nullable=False),
        sa.Column('notes', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_health_records_id'), 'health_records', ['id'], unique=False)
    op.create_index(op.f('ix_health_records_astronaut_id'), 'health_records', ['astronaut_id'], unique=False)
    op.create_index(op.f('ix_health_records_timestamp'), 'health_records', ['timestamp'], unique=False)

    # 3. Health Baselines Table
    op.create_table(
        'health_baselines',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('astronaut_id', sa.String(length=50), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('sample_count', sa.Integer(), nullable=False),
        sa.Column('heart_rate_mean', sa.Float(), nullable=False),
        sa.Column('heart_rate_std', sa.Float(), nullable=False),
        sa.Column('blood_oxygen_mean', sa.Float(), nullable=False),
        sa.Column('blood_oxygen_std', sa.Float(), nullable=False),
        sa.Column('systolic_bp_mean', sa.Float(), nullable=False),
        sa.Column('systolic_bp_std', sa.Float(), nullable=False),
        sa.Column('diastolic_bp_mean', sa.Float(), nullable=False),
        sa.Column('diastolic_bp_std', sa.Float(), nullable=False),
        sa.Column('temperature_mean', sa.Float(), nullable=False),
        sa.Column('temperature_std', sa.Float(), nullable=False),
        sa.Column('sleep_duration_mean', sa.Float(), nullable=False),
        sa.Column('sleep_duration_std', sa.Float(), nullable=False),
        sa.Column('stress_level_mean', sa.Float(), nullable=False),
        sa.Column('stress_level_std', sa.Float(), nullable=False),
        sa.Column('fatigue_level_mean', sa.Float(), nullable=False),
        sa.Column('fatigue_level_std', sa.Float(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_health_baselines_id'), 'health_baselines', ['id'], unique=False)
    op.create_index(op.f('ix_health_baselines_astronaut_id'), 'health_baselines', ['astronaut_id'], unique=True)

    # 4. Health Alerts Table
    op.create_table(
        'health_alerts',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('astronaut_id', sa.String(length=50), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('severity', sa.String(length=20), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=150), nullable=False),
        sa.Column('description', sa.String(length=500), nullable=False),
        sa.Column('recommended_action', sa.String(length=500), nullable=False),
        sa.Column('is_acknowledged', sa.Boolean(), nullable=False),
        sa.Column('acknowledged_at', sa.DateTime(), nullable=True),
        sa.Column('acknowledged_by', sa.String(length=100), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_health_alerts_id'), 'health_alerts', ['id'], unique=False)
    op.create_index(op.f('ix_health_alerts_astronaut_id'), 'health_alerts', ['astronaut_id'], unique=False)
    op.create_index(op.f('ix_health_alerts_timestamp'), 'health_alerts', ['timestamp'], unique=False)

    # 5. Analysis Results Table
    op.create_table(
        'analysis_results',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('astronaut_id', sa.String(length=50), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('overall_status', sa.String(length=20), nullable=False),
        sa.Column('severity', sa.String(length=20), nullable=False),
        sa.Column('anomaly_score', sa.Float(), nullable=True),
        sa.Column('detected_abnormalities', sa.JSON(), nullable=True),
        sa.Column('baseline_deviations', sa.JSON(), nullable=True),
        sa.Column('contributing_factors', sa.JSON(), nullable=True),
        sa.Column('recommended_actions', sa.JSON(), nullable=True),
        sa.Column('reading_id', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_analysis_results_id'), 'analysis_results', ['id'], unique=False)
    op.create_index(op.f('ix_analysis_results_astronaut_id'), 'analysis_results', ['astronaut_id'], unique=False)
    op.create_index(op.f('ix_analysis_results_timestamp'), 'analysis_results', ['timestamp'], unique=False)


def downgrade() -> None:
    op.drop_table('analysis_results')
    op.drop_table('health_alerts')
    op.drop_table('health_baselines')
    op.drop_table('health_records')
    op.drop_table('astronauts')
