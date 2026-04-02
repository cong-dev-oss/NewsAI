from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class ArticleHistory(Base):
    __tablename__ = "article_history"

    id = Column(Integer, primary_key=True, index=True)
    config_id = Column(Integer, ForeignKey("source_topic_configs.id"), nullable=False)
    
    # Dữ liệu nội dung
    url = Column(String(512), nullable=False)
    title = Column(String(512), nullable=True)
    summary = Column(Text, nullable=True)
    
    # Trạng thái tiến trình: PENDING, CRAWLING, SUMMARIZING, SAVING, COMPLETED, FAILED
    status = Column(String(50), nullable=False, default="PENDING")
    
    # Phần trăm tiến độ (để hiển thị thanh Progress của shadcn) e.g. 0.25 (crawl xong), 0.75 (tóm tắt xong)
    progress = Column(Float, default=0.0) 
    
    # Thời gian
    processed_at = Column(DateTime, server_default=func.now())
    
    config = relationship("SourceTopicConfig", back_populates="history")
