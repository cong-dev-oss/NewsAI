from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class SignalItem(Base):
    __tablename__ = "signal_items"

    id = Column(Integer, primary_key=True, index=True)
    research_run_id = Column(Integer, ForeignKey("research_runs.id"), nullable=False, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False, index=True)
    signal_source_id = Column(Integer, ForeignKey("signal_sources.id"), nullable=True, index=True)
    source_type = Column(String(50), nullable=False, index=True)
    source_name = Column(String(255), nullable=True)
    title = Column(String(512), nullable=False)
    excerpt = Column(Text, nullable=True)
    original_url = Column(String(1024), nullable=True)
    published_at = Column(DateTime, nullable=True)
    language = Column(String(16), nullable=True)
    country = Column(String(16), nullable=True)
    signal_score = Column(Integer, nullable=True, index=True)
    tags = Column(JSON, nullable=True)
    raw_payload = Column(JSON, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    research_run = relationship("ResearchRun", back_populates="signal_items")
    topic = relationship("Topic", back_populates="signal_items")
    signal_source = relationship("SignalSource", back_populates="signal_items")
    story_evidences = relationship("StoryEvidence", back_populates="signal_item")
