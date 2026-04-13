from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class SignalSource(Base):
    __tablename__ = "signal_sources"

    id = Column(Integer, primary_key=True, index=True)
    source_type = Column(String(50), nullable=False, unique=True, index=True)
    name = Column(String(100), nullable=False)
    base_url = Column(String(255), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    topic_source_configs = relationship("TopicSourceConfig", back_populates="signal_source")
    signal_items = relationship("SignalItem", back_populates="signal_source")
