from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class ResearchRun(Base):
    __tablename__ = "research_runs"

    id = Column(Integer, primary_key=True, index=True)
    topic_source_config_id = Column(Integer, ForeignKey("topic_source_configs.id"), nullable=False, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False, index=True)
    trigger_mode = Column(String(32), nullable=False, default="scheduled", index=True)
    status = Column(String(32), nullable=False, default="queued", index=True)
    started_at = Column(DateTime, server_default=func.now())
    finished_at = Column(DateTime, nullable=True)
    raw_count = Column(Integer, nullable=False, default=0)
    selected_count = Column(Integer, nullable=False, default=0)
    summary = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)

    topic_source_config = relationship("TopicSourceConfig", back_populates="research_runs")
    topic = relationship("Topic", back_populates="research_runs")
    signal_items = relationship("SignalItem", back_populates="research_run")
    primary_stories = relationship("Story", back_populates="primary_research_run")
