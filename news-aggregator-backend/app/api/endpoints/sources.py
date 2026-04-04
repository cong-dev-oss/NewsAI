from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.source import Source as SourceModel
from app.models.topic import Topic as TopicModel
from app.models.config import SourceTopicConfig as ConfigModel
from app.schemas import source_schema, topic_schema, job_schema
from app.worker.scheduler import SchedulerService
from app.worker.tasks import run_config_crawl

router = APIRouter()

@router.post("/trigger-all")
def trigger_all_tasks(db: Session = Depends(get_db)):
    configs = db.query(ConfigModel).filter(ConfigModel.is_active == True).all()
    triggered = 0
    for config in configs:
        run_config_crawl.delay(config.id)
        triggered += 1
    return {"status": "success", "triggered_count": triggered}

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

@router.delete("/topics/{topic_id}")
def delete_topic(topic_id: int, db: Session = Depends(get_db)):
    topic = db.query(TopicModel).filter(TopicModel.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    if topic.configs:
        raise HTTPException(status_code=409, detail="Topic is being used by one or more pipelines")

    db.delete(topic)
    db.commit()
    return {"status": "success", "deleted_id": topic_id}

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

@router.put("/configs/{config_id}", response_model=job_schema.SourceTopicConfig)
def update_config(config_id: int, config: job_schema.SourceTopicConfigUpdate, db: Session = Depends(get_db)):
    db_config = db.query(ConfigModel).filter(ConfigModel.id == config_id).first()
    if not db_config:
        raise HTTPException(status_code=404, detail="Config not found")

    update_data = config.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_config, field, value)

    db.commit()
    db.refresh(db_config)

    SchedulerService.sync_config_to_celery(db, db_config)

    return db_config
