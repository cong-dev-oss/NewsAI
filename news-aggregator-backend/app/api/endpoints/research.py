from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.research_run import ResearchRun
from app.models.story import Story
from app.schemas.research_schema import ResearchRunDetail, ResearchRunRead, SignalItemRead

router = APIRouter(prefix="/research", tags=["research"])


@router.get("/runs", response_model=List[ResearchRunRead])
def list_runs(
    db: Session = Depends(get_db),
    topic_id: Optional[int] = None,
    status: Optional[str] = None,
    limit: int = Query(default=100, ge=1, le=300),
):
    query = db.query(ResearchRun).order_by(ResearchRun.started_at.desc(), ResearchRun.id.desc())
    if topic_id is not None:
        query = query.filter(ResearchRun.topic_id == topic_id)
    if status:
        query = query.filter(ResearchRun.status == status)
    return query.limit(limit).all()


@router.get("/runs/{run_id}", response_model=ResearchRunDetail)
def get_run(run_id: int, db: Session = Depends(get_db)):
    run = db.query(ResearchRun).filter(ResearchRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Research run not found")

    signal_items = [SignalItemRead.model_validate(item) for item in run.signal_items]
    related_story_ids = [
        story_id
        for (story_id,) in db.query(Story.id)
        .filter(Story.primary_research_run_id == run.id)
        .order_by(Story.id.desc())
        .all()
    ]
    return ResearchRunDetail(
        **ResearchRunRead.model_validate(run).model_dump(),
        signals=signal_items,
        related_story_ids=related_story_ids,
    )
