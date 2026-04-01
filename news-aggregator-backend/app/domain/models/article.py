from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Source(Base):
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    base_url = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    
    articles = relationship("Article", back_populates="source")


class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True, index=True) # Mới thêm chuyên mục
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    summary = Column(Text, nullable=True)
    url = Column(String(512), nullable=False, unique=True)
    image_url = Column(String(512), nullable=True)
    published_at = Column(DateTime, nullable=True)
    processed_at = Column(DateTime, server_default=func.now())
    is_processed = Column(Boolean, default=False)
    
    source = relationship("Source", back_populates="articles")


class JobHistory(Base):
    __tablename__ = "job_history"
    
    id = Column(Integer, primary_key=True, index=True)
    job_name = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False)  # success, failure, running
    message = Column(Text, nullable=True)
    started_at = Column(DateTime, server_default=func.now())
    finished_at = Column(DateTime, nullable=True)
