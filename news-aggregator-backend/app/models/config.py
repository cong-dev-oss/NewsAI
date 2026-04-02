from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class SourceTopicConfig(Base):
    __tablename__ = "source_topic_configs"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    
    # URL cụ thể của chuyên mục này (e.g. vnexpress.net/kinh-doanh)
    url = Column(String(512), nullable=False) 
    
    # Chuỗi cronjob (e.g. "0 15 * * *" cho 3 PM hàng ngày)
    cron_config = Column(String(128), nullable=False, default="0 * * * *") 
    
    # Số lượng bài viết tối đa mỗi lần cào
    article_limit = Column(Integer, nullable=False, default=10)
    
    is_active = Column(Boolean, default=True)

    source = relationship("Source", back_populates="configs")
    topic = relationship("Topic", back_populates="configs")
    history = relationship("ArticleHistory", back_populates="config")
