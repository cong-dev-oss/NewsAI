from pydantic import BaseModel
from typing import Optional

class TopicBase(BaseModel):
    name: str

class TopicCreate(TopicBase):
    pass

class Topic(TopicBase):
    id: int

    class Config:
        from_attributes = True
