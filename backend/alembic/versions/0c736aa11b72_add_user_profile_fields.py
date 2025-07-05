"""add_user_profile_fields

Revision ID: 0c736aa11b72
Revises: 002_game_tracking
Create Date: 2025-07-05 22:11:15.112110

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '0c736aa11b72'
down_revision: Union[str, None] = '002_game_tracking'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Apply migration to add user profile fields."""
    # Add avatar_url field
    op.add_column(
        'user',
        sa.Column('avatar_url', sa.String(), nullable=True)
    )

    # Add bio field
    op.add_column(
        'user',
        sa.Column('bio', sa.String(), nullable=True)
    )


def downgrade() -> None:
    """Revert migration by removing profile fields."""
    # Remove bio field
    op.drop_column('user', 'bio')

    # Remove avatar_url field
    op.drop_column('user', 'avatar_url')
