from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel


class SignalItemRead(BaseModel):
    id: int
    research_run_id: int
    topic_id: int
    source_type: str
    source_name: Optional[str] = None
    title: str
    excerpt: Optional[str] = None
    original_url: Optional[str] = None
    published_at: Optional[datetime] = None
    signal_score: Optional[int] = None

    class Config:
        from_attributes = True


class ResearchRunRead(BaseModel):
    id: int
    topic_source_config_id: int
    topic_id: int
    trigger_mode: str
    status: str
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    raw_count: int
    selected_count: int
    summary: Optional[str] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True


class ResearchRunDetail(ResearchRunRead):
    signals: List[SignalItemRead] = []
    related_story_ids: List[int] = []


class PipelineRunNowRequest(BaseModel):
    scope: Literal["all", "topic", "config", "source_topic"] = "all"
    topic_id: Optional[int] = None
    config_id: Optional[int] = None
    source_type: Optional[str] = None
