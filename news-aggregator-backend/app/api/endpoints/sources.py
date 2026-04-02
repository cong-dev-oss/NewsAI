from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.source import Source as SourceModel
from app.models.topic import Topic as TopicModel
from app.models.config import SourceTopicConfig as ConfigModel
from app.schemas import source_schema, topic_schema, job_schema
from app.worker.scheduler import SchedulerService

router = APIRouter()

# Source CRUD
@router.get("/", response_model=List[source_schema.Source])
def get_sources(db: Session = Depends(get_db)):
    return db.query(SourceModel).all()

@router.post("/", response_model=source_schema.Source)
def create_source(source: source_schema.SourceCreate, db: Session = Depends(get_db)):
    db_source = SourceModel(**source.model_dump())
    db.add(db_source)
    db.commit()
    db.refresh(db_source)
    return db_source

# Topic CRUD
@router.get("/topics", response_model=List[topic_schema.Topic])
def get_topics(db: Session = Depends(get_db)):
    return db.query(TopicModel).all()

@router.post("/topics", response_model=topic_schema.Topic)
def create_topic(topic: topic_schema.TopicCreate, db: Session = Depends(get_db)):
    db_topic = TopicModel(**topic.model_dump())
    db.add(db_topic)
    db.commit()
    db.refresh(db_topic)
    return db_topic

# Config CRUD
@router.get("/configs", response_model=List[job_schema.SourceTopicConfig])
def get_configs(db: Session = Depends(get_db)):
    return db.query(ConfigModel).all()

@router.post("/configs", response_model=job_schema.SourceTopicConfig)
def create_config(config: job_schema.SourceTopicConfigCreate, db: Session = Depends(get_db)):
    db_config = ConfigModel(**config.model_dump())
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    
    # Đồng bộ với Celery Scheduler
    SchedulerService.sync_config_to_celery(db, db_config)
    
    return db_config
