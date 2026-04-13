from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class ArticleBase(BaseModel):
    title: str
    summary: Optional[str] = None
    body: str
    story_type: str = "roundup"
    status: str = "draft"
    topic_id: int
    slug: str


class ArticleCreate(ArticleBase):
    pass


class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    body: Optional[str] = None
    story_type: Optional[str] = None
    status: Optional[str] = None


class ArticleRead(ArticleBase):
    id: int
    published_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ArticleList(BaseModel):
    items: List[ArticleRead]
    total: int


class ArticleBulkDeleteRequest(BaseModel):
    ids: List[int]
