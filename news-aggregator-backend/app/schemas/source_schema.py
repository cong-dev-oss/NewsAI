from pydantic import BaseModel
from typing import Optional, List

class SourceBase(BaseModel):
    source_type: str = "custom"
    name: str
    base_url: Optional[str] = None
    is_active: bool = True

class SourceCreate(SourceBase):
    pass

class SourceUpdate(BaseModel):
    source_type: Optional[str] = None
    name: Optional[str] = None
    base_url: Optional[str] = None
    is_active: Optional[bool] = None

class Source(SourceBase):
    id: int

    class Config:
        from_attributes = True
