"""Reset schema to research-first newsroom model.

Revision ID: 7c8b4d2f1a9e
Revises: 1f0e95895794
Create Date: 2026-04-13 13:30:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "7c8b4d2f1a9e"
down_revision: Union[str, None] = "1f0e95895794"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    for table_name in (
        "editorial_notes",
        "story_evidences",
        "stories",
        "signal_items",
        "research_runs",
        "topic_source_configs",
        "signal_sources",
        "article_history",
        "source_topic_configs",
        "articles",
        "sources",
    ):
        op.execute(f'DROP TABLE IF EXISTS "{table_name}" CASCADE')

    op.create_table(
        "signal_sources",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("source_type", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("base_url", sa.String(length=255), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("source_type"),
    )
    op.create_index(op.f("ix_signal_sources_id"), "signal_sources", ["id"], unique=False)
    op.create_index(op.f("ix_signal_sources_source_type"), "signal_sources", ["source_type"], unique=False)

    op.create_table(
        "topic_source_configs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("topic_id", sa.Integer(), nullable=False),
        sa.Column("signal_source_id", sa.Integer(), nullable=True),
        sa.Column("source_type", sa.String(length=50), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("fetch_limit", sa.Integer(), server_default=sa.text("20"), nullable=False),
        sa.Column("pick_limit", sa.Integer(), server_default=sa.text("8"), nullable=False),
        sa.Column("story_roundup_enabled", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("story_deep_dive_enabled", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("roundup_count", sa.Integer(), server_default=sa.text("1"), nullable=False),
        sa.Column("deep_dive_count", sa.Integer(), server_default=sa.text("1"), nullable=False),
        sa.Column("schedule_cron", sa.String(length=128), server_default=sa.text("'0 2 * * *'"), nullable=False),
        sa.Column("priority_weight", sa.Integer(), server_default=sa.text("100"), nullable=False),
        sa.Column("country", sa.String(length=16), nullable=True),
        sa.Column("language", sa.String(length=16), nullable=True),
        sa.Column("category", sa.String(length=64), nullable=True),
        sa.Column("extra_params", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["signal_source_id"], ["signal_sources.id"]),
        sa.ForeignKeyConstraint(["topic_id"], ["topics.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("topic_id", "source_type", name="uq_topic_source_pair"),
    )
    op.create_index(op.f("ix_topic_source_configs_id"), "topic_source_configs", ["id"], unique=False)
    op.create_index(op.f("ix_topic_source_configs_topic_id"), "topic_source_configs", ["topic_id"], unique=False)
    op.create_index(
        op.f("ix_topic_source_configs_signal_source_id"),
        "topic_source_configs",
        ["signal_source_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_topic_source_configs_source_type"),
        "topic_source_configs",
        ["source_type"],
        unique=False,
    )

    op.create_table(
        "research_runs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("topic_source_config_id", sa.Integer(), nullable=False),
        sa.Column("topic_id", sa.Integer(), nullable=False),
        sa.Column("trigger_mode", sa.String(length=32), server_default=sa.text("'scheduled'"), nullable=False),
        sa.Column("status", sa.String(length=32), server_default=sa.text("'queued'"), nullable=False),
        sa.Column("started_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
        sa.Column("finished_at", sa.DateTime(), nullable=True),
        sa.Column("raw_count", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("selected_count", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["topic_id"], ["topics.id"]),
        sa.ForeignKeyConstraint(["topic_source_config_id"], ["topic_source_configs.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_research_runs_id"), "research_runs", ["id"], unique=False)
    op.create_index(
        op.f("ix_research_runs_topic_source_config_id"),
        "research_runs",
        ["topic_source_config_id"],
        unique=False,
    )
    op.create_index(op.f("ix_research_runs_topic_id"), "research_runs", ["topic_id"], unique=False)
    op.create_index(op.f("ix_research_runs_trigger_mode"), "research_runs", ["trigger_mode"], unique=False)
    op.create_index(op.f("ix_research_runs_status"), "research_runs", ["status"], unique=False)

    op.create_table(
        "signal_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("research_run_id", sa.Integer(), nullable=False),
        sa.Column("topic_id", sa.Integer(), nullable=False),
        sa.Column("signal_source_id", sa.Integer(), nullable=True),
        sa.Column("source_type", sa.String(length=50), nullable=False),
        sa.Column("source_name", sa.String(length=255), nullable=True),
        sa.Column("title", sa.String(length=512), nullable=False),
        sa.Column("excerpt", sa.Text(), nullable=True),
        sa.Column("original_url", sa.String(length=1024), nullable=True),
        sa.Column("published_at", sa.DateTime(), nullable=True),
        sa.Column("language", sa.String(length=16), nullable=True),
        sa.Column("country", sa.String(length=16), nullable=True),
        sa.Column("signal_score", sa.Integer(), nullable=True),
        sa.Column("tags", sa.JSON(), nullable=True),
        sa.Column("raw_payload", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["research_run_id"], ["research_runs.id"]),
        sa.ForeignKeyConstraint(["signal_source_id"], ["signal_sources.id"]),
        sa.ForeignKeyConstraint(["topic_id"], ["topics.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_signal_items_id"), "signal_items", ["id"], unique=False)
    op.create_index(op.f("ix_signal_items_research_run_id"), "signal_items", ["research_run_id"], unique=False)
    op.create_index(op.f("ix_signal_items_topic_id"), "signal_items", ["topic_id"], unique=False)
    op.create_index(op.f("ix_signal_items_signal_source_id"), "signal_items", ["signal_source_id"], unique=False)
    op.create_index(op.f("ix_signal_items_source_type"), "signal_items", ["source_type"], unique=False)
    op.create_index(op.f("ix_signal_items_signal_score"), "signal_items", ["signal_score"], unique=False)

    op.create_table(
        "stories",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("topic_id", sa.Integer(), nullable=False),
        sa.Column("primary_research_run_id", sa.Integer(), nullable=True),
        sa.Column("story_type", sa.String(length=32), nullable=False),
        sa.Column("status", sa.String(length=32), server_default=sa.text("'draft'"), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("deck", sa.Text(), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("hero_image", sa.String(length=512), nullable=True),
        sa.Column("seo_title", sa.String(length=255), nullable=True),
        sa.Column("seo_description", sa.Text(), nullable=True),
        sa.Column("published_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["primary_research_run_id"], ["research_runs.id"]),
        sa.ForeignKeyConstraint(["topic_id"], ["topics.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index(op.f("ix_stories_id"), "stories", ["id"], unique=False)
    op.create_index(op.f("ix_stories_topic_id"), "stories", ["topic_id"], unique=False)
    op.create_index(
        op.f("ix_stories_primary_research_run_id"),
        "stories",
        ["primary_research_run_id"],
        unique=False,
    )
    op.create_index(op.f("ix_stories_story_type"), "stories", ["story_type"], unique=False)
    op.create_index(op.f("ix_stories_status"), "stories", ["status"], unique=False)

    op.create_table(
        "story_evidences",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("story_id", sa.Integer(), nullable=False),
        sa.Column("signal_item_id", sa.Integer(), nullable=False),
        sa.Column("evidence_order", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("excerpt_used", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["signal_item_id"], ["signal_items.id"]),
        sa.ForeignKeyConstraint(["story_id"], ["stories.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("story_id", "signal_item_id", name="uq_story_signal_pair"),
    )
    op.create_index(op.f("ix_story_evidences_id"), "story_evidences", ["id"], unique=False)
    op.create_index(op.f("ix_story_evidences_story_id"), "story_evidences", ["story_id"], unique=False)
    op.create_index(
        op.f("ix_story_evidences_signal_item_id"),
        "story_evidences",
        ["signal_item_id"],
        unique=False,
    )

    op.create_table(
        "editorial_notes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("story_id", sa.Integer(), nullable=False),
        sa.Column("note", sa.Text(), nullable=False),
        sa.Column("created_by", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["story_id"], ["stories.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_editorial_notes_id"), "editorial_notes", ["id"], unique=False)
    op.create_index(op.f("ix_editorial_notes_story_id"), "editorial_notes", ["story_id"], unique=False)


def downgrade() -> None:
    for table_name in (
        "editorial_notes",
        "story_evidences",
        "stories",
        "signal_items",
        "research_runs",
        "topic_source_configs",
        "signal_sources",
    ):
        op.execute(f'DROP TABLE IF EXISTS "{table_name}" CASCADE')

    op.create_table(
        "sources",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("base_url", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_sources_id"), "sources", ["id"], unique=False)

    op.create_table(
        "articles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("source_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("url", sa.String(length=512), nullable=False),
        sa.Column("image_url", sa.String(length=512), nullable=True),
        sa.Column("audio_url", sa.String(length=512), nullable=True),
        sa.Column("published_at", sa.DateTime(), nullable=True),
        sa.Column("processed_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
        sa.Column("is_processed", sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(["source_id"], ["sources.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("url"),
    )
    op.create_index(op.f("ix_articles_id"), "articles", ["id"], unique=False)
    op.create_index(op.f("ix_articles_category"), "articles", ["category"], unique=False)

    op.create_table(
        "source_topic_configs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("source_id", sa.Integer(), nullable=False),
        sa.Column("topic_id", sa.Integer(), nullable=False),
        sa.Column("url", sa.String(length=512), nullable=False),
        sa.Column("cron_config", sa.String(length=128), nullable=False),
        sa.Column("article_limit", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(["source_id"], ["sources.id"]),
        sa.ForeignKeyConstraint(["topic_id"], ["topics.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_source_topic_configs_id"), "source_topic_configs", ["id"], unique=False)

    op.create_table(
        "article_history",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("config_id", sa.Integer(), nullable=False),
        sa.Column("url", sa.String(length=512), nullable=False),
        sa.Column("title", sa.String(length=512), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("progress", sa.Float(), nullable=True),
        sa.Column("processed_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["config_id"], ["source_topic_configs.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_article_history_id"), "article_history", ["id"], unique=False)
