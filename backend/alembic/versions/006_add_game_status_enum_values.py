"""Add WAITING and COUNTDOWN to GameStatus enum

Revision ID: 006_add_game_status_enum_values
Revises: 005_add_user_profile_fields
Create Date: 2024-01-01 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "006_add_game_status_enum_values"
down_revision: Union[str, None] = "005_add_user_profile_fields"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add WAITING and COUNTDOWN values to GameStatus enum."""
    # PostgreSQL requires explicit ALTER TYPE for enum changes
    op.execute(
        "ALTER TYPE gamestatus ADD VALUE IF NOT EXISTS 'waiting' BEFORE 'active'"
    )
    op.execute(
        "ALTER TYPE gamestatus ADD VALUE IF NOT EXISTS 'countdown' AFTER 'waiting'"
    )

    # Add countdown_started_at column to track countdown start time
    op.add_column(
        "gamesession", sa.Column("countdown_started_at", sa.DateTime(), nullable=True)
    )


def downgrade() -> None:
    """Remove WAITING and COUNTDOWN from GameStatus enum and countdown_started_at column."""
    # Drop the countdown_started_at column first
    op.drop_column("gamesession", "countdown_started_at")

    # Note: PostgreSQL doesn't support removing enum values directly
    # A full enum recreation would be needed in production
    # For now, we'll just document this limitation
    pass
