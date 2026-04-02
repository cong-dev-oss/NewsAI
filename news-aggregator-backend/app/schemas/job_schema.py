from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .source_schema import Source
from .topic_schema import Topic

class SourceTopicConfigBase(BaseModel):
    source_id: int
    topic_id: int
    url: str
    cron_config: str = "0 * * * *"
    article_limit: int = 10
    is_active: bool = True

class SourceTopicConfigCreate(SourceTopicConfigBase):
    pass

class SourceTopicConfig(SourceTopicConfigBase):
    id: int
    source: Source
    topic: Topic

    class Config:
        from_attributes = True

class ArticleHistoryBase(BaseModel):
    config_id: int
    url: str
    title: Optional[str] = None
    summary: Optional[str] = None
    status: str
    progress: float

class ArticleHistory(ArticleHistoryBase):
    id: int
    processed_at: datetime

    class Config:
        from_attributes = True
