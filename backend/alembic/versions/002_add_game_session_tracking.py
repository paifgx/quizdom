"""Add game session tracking fields

Revision ID: 002_game_tracking
Revises: ada817a8cedb
Create Date: 2024-12-13 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '002_game_tracking'
down_revision: Union[str, None] = 'ada817a8cedb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add tracking fields to game session."""
    # Add columns to track quiz or topic source
    op.add_column('gamesession', 
        sa.Column('quiz_id', sa.Integer(), 
                  sa.ForeignKey('quiz.id'), nullable=True))
    op.add_column('gamesession', 
        sa.Column('topic_id', sa.Integer(), 
                  sa.ForeignKey('topic.id'), nullable=True))
    op.add_column('gamesession', 
        sa.Column('question_ids', sa.JSON(), nullable=True))
    op.add_column('gamesession', 
        sa.Column('current_question_index', sa.Integer(), 
                  nullable=False, server_default='0'))
    
    # Add quiz status fields
    op.add_column('quiz',
        sa.Column('status', sa.String(20), 
                  nullable=False, server_default='draft'))
    op.add_column('quiz',
        sa.Column('published_at', sa.DateTime(), nullable=True))
    op.add_column('quiz',
        sa.Column('play_count', sa.Integer(), 
                  nullable=False, server_default='0'))
    
    # Create indexes
    op.create_index('idx_gamesession_quiz_id', 'gamesession', ['quiz_id'])
    op.create_index('idx_gamesession_topic_id', 'gamesession', ['topic_id'])
    op.create_index('idx_quiz_status', 'quiz', ['status'])


def downgrade() -> None:
    """Remove tracking fields."""
    op.drop_index('idx_quiz_status', 'quiz')
    op.drop_index('idx_gamesession_topic_id', 'gamesession')
    op.drop_index('idx_gamesession_quiz_id', 'gamesession')
    
    op.drop_column('quiz', 'play_count')
    op.drop_column('quiz', 'published_at')
    op.drop_column('quiz', 'status')
    
    op.drop_column('gamesession', 'current_question_index')
    op.drop_column('gamesession', 'question_ids')
    op.drop_column('gamesession', 'topic_id')
    op.drop_column('gamesession', 'quiz_id') 