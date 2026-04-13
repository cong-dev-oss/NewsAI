from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class StoryBase(BaseModel):
    topic_id: int
    story_type: str
    status: str = "draft"
    title: str
    slug: str
    deck: Optional[str] = None
    summary: Optional[str] = None
    body: str
    hero_image: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None


class StoryUpdate(BaseModel):
    status: Optional[str] = None
    title: Optional[str] = None
    deck: Optional[str] = None
    summary: Optional[str] = None
    body: Optional[str] = None
    hero_image: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None


class StoryRead(StoryBase):
    id: int
    primary_research_run_id: Optional[int] = None
    published_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
