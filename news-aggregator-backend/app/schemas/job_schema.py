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

class SourceTopicConfigUpdate(BaseModel):
    source_id: Optional[int] = None
    topic_id: Optional[int] = None
    url: Optional[str] = None
    cron_config: Optional[str] = None
    article_limit: Optional[int] = None
    is_active: Optional[bool] = None

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


class TopicSourceConfigBase(BaseModel):
    topic_id: int
    source_type: str
    signal_source_id: Optional[int] = None
    is_active: bool = True
    fetch_limit: int = 20
    pick_limit: int = 8
    story_roundup_enabled: bool = True
    story_deep_dive_enabled: bool = True
    roundup_count: int = 1
    deep_dive_count: int = 1
    schedule_cron: str = "0 2 * * *"
    priority_weight: int = 100
    country: Optional[str] = None
    language: Optional[str] = None
    category: Optional[str] = None
    extra_params: Optional[dict] = None


class TopicSourceConfigCreate(TopicSourceConfigBase):
    pass


class TopicSourceConfigUpdate(BaseModel):
    topic_id: Optional[int] = None
    source_type: Optional[str] = None
    signal_source_id: Optional[int] = None
    is_active: Optional[bool] = None
    fetch_limit: Optional[int] = None
    pick_limit: Optional[int] = None
    story_roundup_enabled: Optional[bool] = None
    story_deep_dive_enabled: Optional[bool] = None
    roundup_count: Optional[int] = None
    deep_dive_count: Optional[int] = None
    schedule_cron: Optional[str] = None
    priority_weight: Optional[int] = None
    country: Optional[str] = None
    language: Optional[str] = None
    category: Optional[str] = None
    extra_params: Optional[dict] = None


class TopicSourceConfigRead(TopicSourceConfigBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
