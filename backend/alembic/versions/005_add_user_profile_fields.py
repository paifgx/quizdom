"""add_user_profile_fields

Revision ID: 005_add_user_profile_fields
Revises: 004_quiz_status_idx
Create Date: 2025-07-05 22:11:15.112110

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '005_add_user_profile_fields'
down_revision: Union[str, None] = '004_quiz_status_idx'
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
