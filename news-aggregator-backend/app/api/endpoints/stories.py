from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import func

from app.core.database import get_db
from app.models.story import Story
from app.schemas.story_schema import StoryRead, StoryUpdate

router = APIRouter(prefix="/stories", tags=["stories"])


class BulkDeleteRequest(BaseModel):
    ids: List[int]


@router.get("/categories")
def list_story_categories(db: Session = Depends(get_db)):
    rows = (
        db.query(Story.story_type, func.count(Story.id).label("count"))
        .filter(Story.story_type != None)
        .group_by(Story.story_type)
        .having(func.count(Story.id) > 0)
        .all()
    )
    return [{"name": row[0], "count": row[1]} for row in rows]


@router.get("/", response_model=List[StoryRead])
def list_stories(
    db: Session = Depends(get_db),
    topic_id: Optional[int] = None,
    story_type: Optional[str] = None,
    status: Optional[str] = None,
    published_only: bool = Query(default=False),
    limit: int = Query(default=50, ge=1, le=200),
):
    query = db.query(Story).order_by(Story.published_at.desc(), Story.id.desc())
    if topic_id is not None:
        query = query.filter(Story.topic_id == topic_id)
    if story_type:
        query = query.filter(Story.story_type == story_type)
    if status:
        query = query.filter(Story.status == status)
    if published_only:
        query = query.filter(Story.status == "published")
    return query.limit(limit).all()


@router.get("/{story_id}", response_model=StoryRead)
def get_story(story_id: int, db: Session = Depends(get_db)):
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    return story


@router.patch("/{story_id}", response_model=StoryRead)
def update_story(story_id: int, payload: StoryUpdate, db: Session = Depends(get_db)):
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(story, field, value)
    db.commit()
    db.refresh(story)
    return story


@router.post("/{story_id}/review", response_model=StoryRead)
def review_story(story_id: int, db: Session = Depends(get_db)):
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    story.status = "reviewed"
    db.commit()
    db.refresh(story)
    return story


@router.post("/{story_id}/publish", response_model=StoryRead)
def publish_story(story_id: int, db: Session = Depends(get_db)):
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    story.status = "published"
    story.published_at = datetime.utcnow()
    db.commit()
    db.refresh(story)
    return story


@router.delete("/{story_id}")
def delete_story(story_id: int, db: Session = Depends(get_db)):
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    db.delete(story)
    db.commit()
    return {"status": "success", "deleted_ids": [story_id], "deleted_count": 1}


@router.post("/bulk-delete")
def bulk_delete_stories(payload: BulkDeleteRequest, db: Session = Depends(get_db)):
    ids = sorted(set(payload.ids))
    if not ids:
        return {"status": "success", "deleted_ids": [], "deleted_count": 0}

    rows = db.query(Story).filter(Story.id.in_(ids)).all()
    found_ids = [row.id for row in rows]
    for row in rows:
        db.delete(row)
    db.commit()
    return {"status": "success", "deleted_ids": found_ids, "deleted_count": len(found_ids)}
