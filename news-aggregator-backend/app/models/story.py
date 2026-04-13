from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Story(Base):
    __tablename__ = "stories"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False, index=True)
    primary_research_run_id = Column(Integer, ForeignKey("research_runs.id"), nullable=True, index=True)
    story_type = Column(String(32), nullable=False, index=True)
    status = Column(String(32), nullable=False, default="draft", index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False, unique=True)
    deck = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    body = Column(Text, nullable=False)
    hero_image = Column(String(512), nullable=True)
    seo_title = Column(String(255), nullable=True)
    seo_description = Column(Text, nullable=True)
    published_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    topic = relationship("Topic", back_populates="stories")
    primary_research_run = relationship("ResearchRun", back_populates="primary_stories")
    story_evidences = relationship("StoryEvidence", back_populates="story")
    editorial_notes = relationship("EditorialNote", back_populates="story")
