"""Implement ERM schema changes

Revision ID: 001_implement_erm
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_implement_erm'
down_revision: Union[str, None] = '000_initial'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Apply migration to implement ERM schema."""

    # Note: Enum types are created automatically by SQLAlchemy when tables are created

    # Create user_roles table
    op.create_table(
        'userroles',
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('role_id', sa.Integer(), nullable=False),
        sa.Column('granted_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['role_id'], ['role.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('user_id', 'role_id')
    )

    # Create wallet table
    op.create_table(
        'wallet',
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('wisecoins', sa.Integer(),
                  nullable=False, server_default='0'),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('user_id')
    )

    # Create email_tokens table
    op.create_table(
        'emailtokens',
        sa.Column('id', sa.Integer(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('token', sa.String(), nullable=False),
        sa.Column('type', sa.Enum('verify', 'reset',
                  name='emailtokentype'), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token')
    )
    op.create_index(op.f('ix_emailtokens_token'),
                    'emailtokens', ['token'], unique=True)
    op.create_index(op.f('ix_emailtokens_user_id'),
                    'emailtokens', ['user_id'], unique=False)

    # Create audit_logs table
    op.create_table(
        'auditlogs',
        sa.Column('id', sa.Integer(), nullable=True),
        sa.Column('actor_id', sa.Integer(), nullable=False),
        sa.Column('target_id', sa.Integer(), nullable=True),
        sa.Column('action', sa.String(), nullable=False),
        sa.Column('meta', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['actor_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_auditlogs_actor_id'),
                    'auditlogs', ['actor_id'], unique=False)

    # Create session_players table
    op.create_table(
        'sessionplayers',
        sa.Column('session_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('hearts_left', sa.Integer(),
                  nullable=False, server_default='3'),
        sa.Column('score', sa.Integer(), nullable=False, server_default='0'),
        sa.ForeignKeyConstraint(['session_id'], ['gamesession.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('session_id', 'user_id')
    )

    # Create question_media table
    op.create_table(
        'questionmedia',
        sa.Column('id', sa.Integer(), nullable=True),
        sa.Column('question_id', sa.Integer(), nullable=False),
        sa.Column('url', sa.String(), nullable=False),
        sa.Column('media_type', sa.Enum('png', 'gif',
                  'mp3', name='mediatype'), nullable=False),
        sa.ForeignKeyConstraint(['question_id'], ['question.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_questionmedia_question_id'),
                    'questionmedia', ['question_id'], unique=False)

    # Create user_question_star table
    op.create_table(
        'userquestionstar',
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('question_id', sa.Integer(), nullable=False),
        sa.Column('starred_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['question_id'], ['question.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('user_id', 'question_id')
    )

    # Update existing tables

    # Add nickname to user table
    op.add_column('user', sa.Column('nickname', sa.String(), nullable=True))

    # Update game mode enum values
    op.execute("ALTER TYPE gamemode RENAME VALUE 'duel' TO 'comp'")
    op.execute("ALTER TYPE gamemode RENAME VALUE 'team' TO 'collab'")

    # Add answer_time_ms to playeranswer
    op.add_column('playeranswer', sa.Column('answer_time_ms',
                  sa.Integer(), nullable=False, server_default='0'))

    # Rename game_session_id to session_id in playeranswer
    op.alter_column('playeranswer', 'game_session_id',
                    new_column_name='session_id')

    # Migrate existing data

    # Migrate role data from user.role_id to user_roles
    op.execute("""
        INSERT INTO userroles (user_id, role_id, granted_at)
        SELECT id, role_id, created_at
        FROM "user"
        WHERE role_id IS NOT NULL
    """)

    # Migrate game session data to session_players
    op.execute("""
        INSERT INTO sessionplayers (session_id, user_id, hearts_left, score)
        SELECT id, user_id, 3, score
        FROM gamesession
        WHERE user_id IS NOT NULL
    """)

    # Drop old columns
    op.drop_column('user', 'role_id')
    op.drop_column('gamesession', 'user_id')
    op.drop_column('gamesession', 'score')

    # Add indexes
    op.create_index(op.f('ix_refreshtoken_token_hash'),
                    'refreshtoken', ['token_hash'], unique=False)
    op.create_index(op.f('ix_refreshtoken_user_id'),
                    'refreshtoken', ['user_id'], unique=False)


def downgrade() -> None:
    """Revert migration."""

    # Add back removed columns
    op.add_column('gamesession', sa.Column(
        'score', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('gamesession', sa.Column(
        'user_id', sa.Integer(), nullable=True))
    op.add_column('user', sa.Column('role_id', sa.Integer(), nullable=True))

    # Restore data
    op.execute("""
        UPDATE "user" u
        SET role_id = ur.role_id
        FROM userroles ur
        WHERE u.id = ur.user_id
    """)

    op.execute("""
        UPDATE gamesession g
        SET user_id = sp.user_id, score = sp.score
        FROM sessionplayers sp
        WHERE g.id = sp.session_id
    """)

    # Rename columns back
    op.alter_column('playeranswer', 'session_id',
                    new_column_name='game_session_id')
    op.drop_column('playeranswer', 'answer_time_ms')

    # Revert enum values
    op.execute("ALTER TYPE gamemode RENAME VALUE 'comp' TO 'duel'")
    op.execute("ALTER TYPE gamemode RENAME VALUE 'collab' TO 'team'")

    # Drop nickname column
    op.drop_column('user', 'nickname')

    # Drop indexes
    op.drop_index(op.f('ix_refreshtoken_user_id'), table_name='refreshtoken')
    op.drop_index(op.f('ix_refreshtoken_token_hash'),
                  table_name='refreshtoken')

    # Drop new tables
    op.drop_table('userquestionstar')
    op.drop_index(op.f('ix_questionmedia_question_id'),
                  table_name='questionmedia')
    op.drop_table('questionmedia')
    op.drop_table('sessionplayers')
    op.drop_index(op.f('ix_auditlogs_actor_id'), table_name='auditlogs')
    op.drop_table('auditlogs')
    op.drop_index(op.f('ix_emailtokens_user_id'), table_name='emailtokens')
    op.drop_index(op.f('ix_emailtokens_token'), table_name='emailtokens')
    op.drop_table('emailtokens')
    op.drop_table('wallet')
    op.drop_table('userroles')

    # Drop enum types if they exist
    op.execute("DROP TYPE IF EXISTS mediatype")
    op.execute("DROP TYPE IF EXISTS emailtokentype")
