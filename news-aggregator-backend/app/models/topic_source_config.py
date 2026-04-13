from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, String, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class TopicSourceConfig(Base):
    __tablename__ = "topic_source_configs"
    __table_args__ = (UniqueConstraint("topic_id", "source_type", name="uq_topic_source_pair"),)

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False, index=True)
    signal_source_id = Column(Integer, ForeignKey("signal_sources.id"), nullable=True, index=True)
    source_type = Column(String(50), nullable=False, index=True)
    is_active = Column(Boolean, nullable=False, default=True)
    fetch_limit = Column(Integer, nullable=False, default=20)
    pick_limit = Column(Integer, nullable=False, default=8)
    story_roundup_enabled = Column(Boolean, nullable=False, default=True)
    story_deep_dive_enabled = Column(Boolean, nullable=False, default=True)
    roundup_count = Column(Integer, nullable=False, default=1)
    deep_dive_count = Column(Integer, nullable=False, default=1)
    schedule_cron = Column(String(128), nullable=False, default="0 2 * * *")
    priority_weight = Column(Integer, nullable=False, default=100)
    country = Column(String(16), nullable=True)
    language = Column(String(16), nullable=True)
    category = Column(String(64), nullable=True)
    extra_params = Column(JSON, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    topic = relationship("Topic", back_populates="topic_source_configs")
    signal_source = relationship("SignalSource", back_populates="topic_source_configs")
    research_runs = relationship("ResearchRun", back_populates="topic_source_config")
