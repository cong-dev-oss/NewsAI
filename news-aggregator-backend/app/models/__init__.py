"""Model registry bootstrap for SQLAlchemy relationship resolution.

Celery workers may import task modules directly without loading app.main.
Importing this package ensures all model classes are registered so string-based
relationship targets (for example "Source" in SourceTopicConfig) can be resolved.
"""

from app.models.article import Article, JobHistory
from app.models.article_history import ArticleHistory
from app.models.config import SourceTopicConfig
from app.models.editorial_note import EditorialNote
from app.models.research_run import ResearchRun
from app.models.signal_item import SignalItem
from app.models.signal_source import SignalSource
from app.models.source import Source
from app.models.story import Story
from app.models.story_evidence import StoryEvidence
from app.models.topic import Topic
from app.models.topic_source_config import TopicSourceConfig
from app.models.user import User

__all__ = [
    "Article",
    "ArticleHistory",
    "EditorialNote",
    "JobHistory",
    "ResearchRun",
    "SignalItem",
    "SignalSource",
    "Source",
    "SourceTopicConfig",
    "Story",
    "StoryEvidence",
    "Topic",
    "TopicSourceConfig",
    "User",
]
