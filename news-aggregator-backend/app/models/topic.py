from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.core.database import Base


class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)

    # Legacy relation kept temporarily while old endpoints/services are migrated.
    configs = relationship("SourceTopicConfig", back_populates="topic")
    topic_source_configs = relationship("TopicSourceConfig", back_populates="topic")
    research_runs = relationship("ResearchRun", back_populates="topic")
    signal_items = relationship("SignalItem", back_populates="topic")
    stories = relationship("Story", back_populates="topic")
