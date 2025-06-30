"""Initial schema

Revision ID: 000_initial
Revises: 001_implement_erm
Create Date: 2025-06-27 20:46:13.046431

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "000_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Apply migration."""
    # Note: Enum types are created automatically by SQLAlchemy when tables are created

    # Create role table
    op.create_table(
        "role",
        sa.Column("id", sa.Integer(), nullable=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index(op.f("ix_role_name"), "role", ["name"], unique=True)

    # Create user table
    op.create_table(
        "user",
        sa.Column("id", sa.Integer(), nullable=True),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("password_hash", sa.String(), nullable=False),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.Column("role_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ["role_id"],
            ["role.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index(op.f("ix_user_email"), "user", ["email"], unique=True)

    # Create refresh_token table
    op.create_table(
        "refreshtoken",
        sa.Column("id", sa.Integer(), nullable=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("token_hash", sa.String(), nullable=False),
        sa.Column("issued_at", sa.DateTime(), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("revoked_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["user.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create game_session table
    op.create_table(
        "gamesession",
        sa.Column("id", sa.Integer(), nullable=True),
        sa.Column(
            "mode", sa.Enum("solo", "duel", "team", name="gamemode"), nullable=False
        ),
        sa.Column(
            "status",
            sa.Enum("active", "paused", "finished", name="gamestatus"),
            nullable=False,
        ),
        sa.Column("started_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.Column("ended_at", sa.DateTime(), nullable=True),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("score", sa.Integer(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["user.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create topic table
    op.create_table(
        "topic",
        sa.Column("id", sa.Integer(), nullable=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("title"),
    )
    op.create_index(op.f("ix_topic_title"), "topic", ["title"], unique=True)

    # Create question table
    op.create_table(
        "question",
        sa.Column("id", sa.Integer(), nullable=True),
        sa.Column("topic_id", sa.Integer(), nullable=False),
        sa.Column(
            "difficulty",
            sa.Enum("1", "2", "3", "4", "5", name="difficulty"),
            nullable=False,
        ),
        sa.Column("content", sa.String(), nullable=False),
        sa.Column("explanation", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["topic_id"],
            ["topic.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_question_topic_id"), "question", ["topic_id"], unique=False
    )

    # Create answer table
    op.create_table(
        "answer",
        sa.Column("id", sa.Integer(), nullable=True),
        sa.Column("question_id", sa.Integer(), nullable=False),
        sa.Column("content", sa.String(), nullable=False),
        sa.Column("is_correct", sa.Boolean(), nullable=False, server_default="false"),
        sa.ForeignKeyConstraint(
            ["question_id"],
            ["question.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_answer_question_id"), "answer", ["question_id"], unique=False
    )

    # Create player_answer table
    op.create_table(
        "playeranswer",
        sa.Column("id", sa.Integer(), nullable=True),
        sa.Column("game_session_id", sa.Integer(), nullable=False),
        sa.Column("question_id", sa.Integer(), nullable=False),
        sa.Column("selected_answer_id", sa.Integer(), nullable=False),
        sa.Column("is_correct", sa.Boolean(), nullable=False),
        sa.Column("points_awarded", sa.Integer(), nullable=False),
        sa.Column("answered_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["game_session_id"],
            ["gamesession.id"],
        ),
        sa.ForeignKeyConstraint(
            ["question_id"],
            ["question.id"],
        ),
        sa.ForeignKeyConstraint(
            ["selected_answer_id"],
            ["answer.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_playeranswer_game_session_id"),
        "playeranswer",
        ["game_session_id"],
        unique=False,
    )

    # Create badge table
    op.create_table(
        "badge",
        sa.Column("id", sa.Integer(), nullable=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("icon_path", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("title"),
    )
    op.create_index(op.f("ix_badge_title"), "badge", ["title"], unique=True)

    # Create user_badge table
    op.create_table(
        "userbadge",
        sa.Column("id", sa.Integer(), nullable=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("badge_id", sa.Integer(), nullable=False),
        sa.Column("achieved_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["badge_id"],
            ["badge.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["user.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_userbadge_badge_id"), "userbadge", ["badge_id"], unique=False
    )
    op.create_index(
        op.f("ix_userbadge_user_id"), "userbadge", ["user_id"], unique=False
    )

    # Create leaderboard table
    op.create_table(
        "leaderboard",
        sa.Column("id", sa.Integer(), nullable=True),
        sa.Column(
            "mode", sa.Enum("solo", "duel", "team", name="gamemode"), nullable=False
        ),
        sa.Column(
            "period",
            sa.Enum("daily", "weekly", "monthly", name="leaderboardperiod"),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create leaderboard_entry table
    op.create_table(
        "leaderboardentry",
        sa.Column("id", sa.Integer(), nullable=True),
        sa.Column("leaderboard_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("rank", sa.Integer(), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["leaderboard_id"],
            ["leaderboard.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["user.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_leaderboardentry_leaderboard_id"),
        "leaderboardentry",
        ["leaderboard_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_leaderboardentry_user_id"),
        "leaderboardentry",
        ["user_id"],
        unique=False,
    )

    # Create quiz table
    op.create_table(
        "quiz",
        sa.Column("id", sa.Integer(), nullable=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("topic_id", sa.Integer(), nullable=False),
        sa.Column(
            "difficulty",
            sa.Enum("1", "2", "3", "4", "5", name="difficulty"),
            nullable=False,
        ),
        sa.Column("time_limit_minutes", sa.Integer(), nullable=True),
        sa.Column("image_data", sa.LargeBinary(), nullable=True),
        sa.Column("image_filename", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["topic_id"],
            ["topic.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create quiz_question table
    op.create_table(
        "quizquestion",
        sa.Column("id", sa.Integer(), nullable=True),
        sa.Column("quiz_id", sa.Integer(), nullable=False),
        sa.Column("question_id", sa.Integer(), nullable=False),
        sa.Column("order", sa.Integer(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(
            ["quiz_id"],
            ["quiz.id"],
        ),
        sa.ForeignKeyConstraint(
            ["question_id"],
            ["question.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    """Revert migration."""
    # Drop all tables in reverse order
    op.drop_table("quizquestion")
    op.drop_table("quiz")
    op.drop_index(op.f("ix_leaderboardentry_user_id"), table_name="leaderboardentry")
    op.drop_index(
        op.f("ix_leaderboardentry_leaderboard_id"), table_name="leaderboardentry"
    )
    op.drop_table("leaderboardentry")
    op.drop_table("leaderboard")
    op.drop_index(op.f("ix_userbadge_user_id"), table_name="userbadge")
    op.drop_index(op.f("ix_userbadge_badge_id"), table_name="userbadge")
    op.drop_table("userbadge")
    op.drop_index(op.f("ix_badge_title"), table_name="badge")
    op.drop_table("badge")
    op.drop_index(op.f("ix_playeranswer_game_session_id"), table_name="playeranswer")
    op.drop_table("playeranswer")
    op.drop_index(op.f("ix_answer_question_id"), table_name="answer")
    op.drop_table("answer")
    op.drop_index(op.f("ix_question_topic_id"), table_name="question")
    op.drop_table("question")
    op.drop_index(op.f("ix_topic_title"), table_name="topic")
    op.drop_table("topic")
    op.drop_table("gamesession")
    op.drop_table("refreshtoken")
    op.drop_index(op.f("ix_user_email"), table_name="user")
    op.drop_table("user")
    op.drop_index(op.f("ix_role_name"), table_name="role")
    op.drop_table("role")

    # Drop enum types if they exist
    op.execute("DROP TYPE IF EXISTS leaderboardperiod")
    op.execute("DROP TYPE IF EXISTS difficulty")
    op.execute("DROP TYPE IF EXISTS gamestatus")
    op.execute("DROP TYPE IF EXISTS gamemode")
