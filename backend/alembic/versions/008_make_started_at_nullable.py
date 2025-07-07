"""Make started_at nullable in gamesession

Revision ID: 008_make_started_at_nullable
Revises: 007_add_ready_to_session_players
Create Date: 2024-01-01 00:00:02.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "008_make_started_at_nullable"
down_revision: Union[str, None] = "007_add_ready_to_session_players"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Make started_at nullable for WAITING sessions."""
    op.alter_column(
        "gamesession", "started_at", existing_type=sa.DateTime(), nullable=True
    )


def downgrade() -> None:
    """Revert started_at to non-nullable."""
    # First, update any NULL values to a default timestamp
    op.execute(
        "UPDATE gamesession SET started_at = updated_at WHERE started_at IS NULL"
    )

    # Then make the column non-nullable again
    op.alter_column(
        "gamesession", "started_at", existing_type=sa.DateTime(), nullable=False
    )
