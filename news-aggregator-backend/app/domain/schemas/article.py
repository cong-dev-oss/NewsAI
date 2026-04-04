from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime

class SourceBase(BaseModel):
    name: str
    base_url: str
    is_active: bool = True

class SourceCreate(SourceBase):
    pass

class SourceUpdate(SourceBase):
    name: Optional[str] = None
    base_url: Optional[str] = None

class Source(SourceBase):
    id: int

    class Config:
        from_attributes = True

class ArticleBase(BaseModel):
    title: str
    category: Optional[str] = None
    description: Optional[str] = None
    content: str
    url: str
    image_url: Optional[str] = None
    source_id: int

class ArticleCreate(ArticleBase):
    pass

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    is_processed: Optional[bool] = None
    image_url: Optional[str] = None

class ArticleRead(ArticleBase):
    id: int
    summary: Optional[str] = None
    published_at: Optional[datetime] = None
    processed_at: datetime
    is_processed: bool
    source: Optional[Source] = None

    class Config:
        from_attributes = True

class ArticleList(BaseModel):
    items: List[ArticleRead]
    total: int

class ArticleBulkDeleteRequest(BaseModel):
    ids: List[int]
