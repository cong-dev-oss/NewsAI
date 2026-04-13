from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
import os
import sys

# Đảm bảo Python tìm thấy project 'app'
sys.path.append(os.getcwd())

# Import models and Base
from app.core.database import Base
from app.core.config import settings
from app.models.user import User
from app.models.topic import Topic
from app.models.signal_source import SignalSource
from app.models.topic_source_config import TopicSourceConfig
from app.models.research_run import ResearchRun
from app.models.signal_item import SignalItem
from app.models.story import Story
from app.models.story_evidence import StoryEvidence
from app.models.editorial_note import EditorialNote
from app.models.article import JobHistory

# this is the Alembic Config object, which provides access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set DB URL from settings
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "pyformat"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
