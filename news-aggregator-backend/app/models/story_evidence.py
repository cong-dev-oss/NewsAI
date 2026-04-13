from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class StoryEvidence(Base):
    __tablename__ = "story_evidences"
    __table_args__ = (UniqueConstraint("story_id", "signal_item_id", name="uq_story_signal_pair"),)

    id = Column(Integer, primary_key=True, index=True)
    story_id = Column(Integer, ForeignKey("stories.id"), nullable=False, index=True)
    signal_item_id = Column(Integer, ForeignKey("signal_items.id"), nullable=False, index=True)
    evidence_order = Column(Integer, nullable=False, default=0)
    excerpt_used = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    story = relationship("Story", back_populates="story_evidences")
    signal_item = relationship("SignalItem", back_populates="story_evidences")
