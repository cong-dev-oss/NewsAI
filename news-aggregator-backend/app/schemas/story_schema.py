from datetime import datetime
from typing import Optional, List

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


class StoryHighlight(BaseModel):
    title: str
    excerpt: Optional[str] = None
    image_url: Optional[str] = None
    original_url: Optional[str] = None
    source_name: Optional[str] = None


class StoryRead(StoryBase):
    id: int
    primary_research_run_id: Optional[int] = None
    topic_name: Optional[str] = None
    effective_hero_image: Optional[str] = None
    highlights: List[StoryHighlight] = []
    published_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
