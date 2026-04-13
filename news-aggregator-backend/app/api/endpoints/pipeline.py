from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.research_run import ResearchRun
from app.models.signal_item import SignalItem
from app.models.story import Story
from app.models.story_evidence import StoryEvidence
from app.models.topic_source_config import TopicSourceConfig
from app.schemas import job_schema
from app.schemas.research_schema import PipelineRunNowRequest
from app.worker.scheduler import SchedulerService
from app.worker.tasks import run_topic_source_research

router = APIRouter(prefix="/pipeline", tags=["pipeline"])


def _delete_pipeline_config_dependencies(db: Session, config_id: int) -> None:
    run_ids = [
        run_id
        for (run_id,) in db.query(ResearchRun.id)
        .filter(ResearchRun.topic_source_config_id == config_id)
        .all()
    ]
    if not run_ids:
        return

    db.query(Story).filter(Story.primary_research_run_id.in_(run_ids)).update(
        {Story.primary_research_run_id: None},
        synchronize_session=False,
    )

    signal_item_ids = [
        signal_item_id
        for (signal_item_id,) in db.query(SignalItem.id)
        .filter(SignalItem.research_run_id.in_(run_ids))
        .all()
    ]
    if signal_item_ids:
        db.query(StoryEvidence).filter(StoryEvidence.signal_item_id.in_(signal_item_ids)).delete(
            synchronize_session=False
        )

    db.query(SignalItem).filter(SignalItem.research_run_id.in_(run_ids)).delete(
        synchronize_session=False
    )
    db.query(ResearchRun).filter(ResearchRun.topic_source_config_id == config_id).delete(
        synchronize_session=False
    )


@router.get("/configs", response_model=List[job_schema.TopicSourceConfigRead])
def list_pipeline_configs(db: Session = Depends(get_db)):
    return db.query(TopicSourceConfig).order_by(TopicSourceConfig.id.desc()).all()


@router.post("/configs", response_model=job_schema.TopicSourceConfigRead)
def create_pipeline_config(
    payload: job_schema.TopicSourceConfigCreate,
    db: Session = Depends(get_db),
):
    existing = (
        db.query(TopicSourceConfig)
        .filter(
            TopicSourceConfig.topic_id == payload.topic_id,
            TopicSourceConfig.source_type == payload.source_type,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail="Pipeline config already exists for this topic + source type",
        )

    config = TopicSourceConfig(**payload.model_dump())
    db.add(config)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Pipeline config already exists for this topic + source type",
        )
    db.refresh(config)
    SchedulerService.sync_config_to_celery(db, config)
    return config


@router.put("/configs/{config_id}", response_model=job_schema.TopicSourceConfigRead)
def update_pipeline_config(
    config_id: int,
    payload: job_schema.TopicSourceConfigUpdate,
    db: Session = Depends(get_db),
):
    config = db.query(TopicSourceConfig).filter(TopicSourceConfig.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Pipeline config not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(config, field, value)
    duplicate = (
        db.query(TopicSourceConfig)
        .filter(
            TopicSourceConfig.topic_id == config.topic_id,
            TopicSourceConfig.source_type == config.source_type,
            TopicSourceConfig.id != config_id,
        )
        .first()
    )
    if duplicate:
        raise HTTPException(
            status_code=409,
            detail="Pipeline config already exists for this topic + source type",
        )

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Pipeline config already exists for this topic + source type",
        )
    db.refresh(config)
    SchedulerService.sync_config_to_celery(db, config)
    return config


@router.delete("/configs/{config_id}")
def delete_pipeline_config(config_id: int, db: Session = Depends(get_db)):
    config = db.query(TopicSourceConfig).filter(TopicSourceConfig.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Pipeline config not found")
    SchedulerService.remove_config_from_celery(db, config_id)
    _delete_pipeline_config_dependencies(db, config_id)
    db.delete(config)
    db.commit()
    return {"status": "success", "deleted_id": config_id}


@router.post("/run-now")
def run_now(payload: PipelineRunNowRequest, db: Session = Depends(get_db)):
    query = db.query(TopicSourceConfig).filter(TopicSourceConfig.is_active == True)

    if payload.scope == "config":
        if payload.config_id is None:
            raise HTTPException(status_code=400, detail="config_id is required for config scope")
        query = query.filter(TopicSourceConfig.id == payload.config_id)
    elif payload.scope == "topic":
        if payload.topic_id is None:
            raise HTTPException(status_code=400, detail="topic_id is required for topic scope")
        query = query.filter(TopicSourceConfig.topic_id == payload.topic_id)
    elif payload.scope == "source_topic":
        if payload.topic_id is None or not payload.source_type:
            raise HTTPException(
                status_code=400,
                detail="topic_id and source_type are required for source_topic scope",
            )
        query = query.filter(
            TopicSourceConfig.topic_id == payload.topic_id,
            TopicSourceConfig.source_type == payload.source_type,
        )

    configs = query.all()
    if not configs:
        return {"status": "success", "triggered_count": 0}

    for config in configs:
        run_topic_source_research.delay(config.id)
    return {
        "status": "success",
        "triggered_count": len(configs),
        "triggered_ids": [config.id for config in configs],
    }
