from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.article_history import ArticleHistory as LegacyHistoryModel
from app.models.config import SourceTopicConfig as LegacyConfigModel
from app.models.signal_source import SignalSource as SourceModel
from app.models.topic import Topic as TopicModel
from app.models.topic_source_config import TopicSourceConfig as ConfigModel
from app.schemas import source_schema, topic_schema, job_schema
from app.worker.scheduler import SchedulerService
from app.worker.tasks import run_topic_source_research

router = APIRouter()

@router.post("/trigger-all")
def trigger_all_tasks(db: Session = Depends(get_db)):
    configs = db.query(ConfigModel).filter(ConfigModel.is_active == True).all()
    triggered = 0
    for config in configs:
        run_topic_source_research.delay(config.id)
        triggered += 1
    return {"status": "success", "triggered_count": triggered}

# Source CRUD
@router.get("", response_model=List[source_schema.Source])
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

    if topic.topic_source_configs:
        raise HTTPException(status_code=409, detail="Topic is being used by one or more pipelines")

    legacy_configs = db.query(LegacyConfigModel).filter(LegacyConfigModel.topic_id == topic_id).all()
    if legacy_configs:
        legacy_ids = [cfg.id for cfg in legacy_configs]
        db.query(LegacyHistoryModel).filter(LegacyHistoryModel.config_id.in_(legacy_ids)).delete(
            synchronize_session=False
        )
        db.query(LegacyConfigModel).filter(LegacyConfigModel.id.in_(legacy_ids)).delete(
            synchronize_session=False
        )

    db.delete(topic)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="Topic cannot be deleted due to existing dependencies")
    return {"status": "success", "deleted_id": topic_id}

# Config CRUD
@router.get("/configs", response_model=List[job_schema.TopicSourceConfigRead])
def get_configs(db: Session = Depends(get_db)):
    return db.query(ConfigModel).all()

@router.post("/configs", response_model=job_schema.TopicSourceConfigRead)
def create_config(config: job_schema.TopicSourceConfigCreate, db: Session = Depends(get_db)):
    db_config = ConfigModel(**config.model_dump())
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    
    # Đồng bộ với Celery Scheduler
    SchedulerService.sync_config_to_celery(db, db_config)
    
    return db_config

@router.put("/configs/{config_id}", response_model=job_schema.TopicSourceConfigRead)
def update_config(config_id: int, config: job_schema.TopicSourceConfigUpdate, db: Session = Depends(get_db)):
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


@router.delete("/configs/{config_id}")
def delete_config(config_id: int, db: Session = Depends(get_db)):
    db_config = db.query(ConfigModel).filter(ConfigModel.id == config_id).first()
    if not db_config:
        raise HTTPException(status_code=404, detail="Config not found")

    SchedulerService.remove_config_from_celery(db, config_id)
    db.delete(db_config)
    db.commit()
    return {"status": "success", "deleted_id": config_id}
