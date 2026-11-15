"""Phase 11 Operational Assurance & Alert Escalation Schema

Revision ID: 0003
Revises: 0002
Create Date: 2026-11-15 15:20:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '0003'
down_revision = '0002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add fencing token and structured retry history to alert_outbox_events
    with op.batch_alter_table('alert_outbox_events') as batch_op:
        batch_op.add_column(sa.Column('lease_version', sa.Integer(), nullable=False, server_default='1'))
        batch_op.add_column(sa.Column('retry_history', sa.JSON(), nullable=True))
        batch_op.add_column(sa.Column('is_escalated', sa.Boolean(), nullable=False, server_default='0'))
        batch_op.add_column(sa.Column('escalated_at', sa.DateTime(timezone=True), nullable=True))
        batch_op.add_column(sa.Column('escalation_reason', sa.String(length=500), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('alert_outbox_events') as batch_op:
        batch_op.drop_column('escalation_reason')
        batch_op.drop_column('escalated_at')
        batch_op.drop_column('is_escalated')
        batch_op.drop_column('retry_history')
        batch_op.drop_column('lease_version')
