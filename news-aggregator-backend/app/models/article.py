from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.story import Story

# Legacy import compatibility while the API layer is migrated from Article to Story.
Article = Story


class JobHistory(Base):
    __tablename__ = "job_history"
    
    id = Column(Integer, primary_key=True, index=True)
    job_name = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False)  # success, failure, running
    message = Column(Text, nullable=True)
    started_at = Column(DateTime, server_default=func.now())
    finished_at = Column(DateTime, nullable=True)
