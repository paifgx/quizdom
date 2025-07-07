"""Add ready column to session_players

Revision ID: 007_add_ready_to_session_players
Revises: 006_add_game_status_enum_values
Create Date: 2024-01-01 00:00:01.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '007_add_ready_to_session_players'
down_revision: Union[str, None] = '006_add_game_status_enum_values'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add ready column to session_players table."""
    op.add_column(
        'sessionplayers',
        sa.Column('ready', sa.Boolean(), nullable=False, server_default='false')
    )


def downgrade() -> None:
    """Remove ready column from session_players table."""
    op.drop_column('sessionplayers', 'ready')
