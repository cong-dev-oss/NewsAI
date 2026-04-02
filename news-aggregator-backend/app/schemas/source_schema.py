from pydantic import BaseModel
from typing import Optional, List

class SourceBase(BaseModel):
    name: str
    base_url: str
    is_active: bool = True

class SourceCreate(SourceBase):
    pass

class SourceUpdate(BaseModel):
    name: Optional[str] = None
    base_url: Optional[str] = None
    is_active: Optional[bool] = None

class Source(SourceBase):
    id: int

    class Config:
        from_attributes = True
