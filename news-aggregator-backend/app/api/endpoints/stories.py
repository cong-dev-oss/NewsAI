from datetime import datetime
from functools import lru_cache
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, selectinload
from pydantic import BaseModel
from sqlalchemy import func

from app.core.database import get_db
from app.models.editorial_note import EditorialNote
from app.models.story import Story
from app.models.story_evidence import StoryEvidence
from app.models.topic import Topic
from app.services.ai_service import AIService
from app.schemas.story_schema import StoryRead, StoryUpdate, StoryHighlight

router = APIRouter(prefix="/stories", tags=["stories"])


class BulkDeleteRequest(BaseModel):
    ids: List[int]


def _story_query(db: Session):
    return db.query(Story).options(
        selectinload(Story.topic),
        selectinload(Story.story_evidences).selectinload(StoryEvidence.signal_item),
    )


def _normalize_image_url(value: Any) -> Optional[str]:
    candidate = str(value or "").strip()
    if not candidate:
        return None
    if candidate.startswith("//"):
        return f"https:{candidate}"
    if candidate.startswith("http://") or candidate.startswith("https://"):
        return candidate
    return None


def _extract_image_from_payload(payload: Any) -> Optional[str]:
    if not isinstance(payload, dict):
        return None

    for key in ("image_url", "image", "urlToImage", "imageUrl", "thumbnail", "thumb", "url", "src", "link"):
        image_url = _normalize_image_url(payload.get(key))
        if image_url:
            return image_url

    media = payload.get("media")
    if isinstance(media, list):
        for item in media:
            image_url = _extract_image_from_payload(item)
            if image_url:
                return image_url
    elif isinstance(media, dict):
        image_url = _extract_image_from_payload(media)
        if image_url:
            return image_url

    enclosure = payload.get("enclosure")
    if isinstance(enclosure, dict):
        image_url = _extract_image_from_payload(enclosure)
        if image_url:
            return image_url

    return None


def _resolve_story_hero_image(story: Story) -> Optional[str]:
    direct_image = _normalize_image_url(story.hero_image)
    if direct_image:
        return direct_image

    evidences = sorted(story.story_evidences or [], key=lambda item: item.evidence_order or 0)
    for evidence in evidences:
        signal_item = evidence.signal_item
        if not signal_item:
            continue
        image_url = _extract_image_from_payload(signal_item.raw_payload)
        if image_url:
            return image_url
    return None


def _normalize_compare_text(value: str) -> str:
    compact = " ".join(str(value or "").split()).strip().lower()
    compact = compact.lstrip("- ").strip()
    return compact


@lru_cache(maxsize=512)
def _translate_highlight_to_vietnamese(title: str, excerpt: str) -> str:
    source_text = f"{title}\n{excerpt}".strip()
    if not source_text:
        return ""
    try:
        return AIService.summarize(source_text).strip()
    except Exception:
        return source_text


def _to_story_read(story: Story, include_highlights: bool = False) -> StoryRead:
    payload = StoryRead.model_validate(story).model_dump()
    effective_hero_image = _resolve_story_hero_image(story)
    highlights: list[StoryHighlight] = []
    if include_highlights:
        evidences = sorted(story.story_evidences or [], key=lambda item: item.evidence_order or 0)
        for evidence in evidences:
            signal_item = evidence.signal_item
            if not signal_item:
                continue
            image_url = _extract_image_from_payload(signal_item.raw_payload)
            translated = _translate_highlight_to_vietnamese(
                str(signal_item.title or ""),
                str(signal_item.excerpt or evidence.excerpt_used or ""),
            )
            translated_lines = [line.strip("- ").strip() for line in translated.splitlines() if line.strip()]
            
            if len(translated_lines) >= 2:
                translated_title = translated_lines[0]
                translated_excerpt = " ".join(translated_lines[1:]).strip()
            elif len(translated_lines) == 1:
                # If only one line, try to split by colon or just use it as title
                line = translated_lines[0]
                if ":" in line:
                    parts = line.split(":", 1)
                    translated_title = parts[0].strip()
                    translated_excerpt = parts[1].strip()
                else:
                    translated_title = line
                    translated_excerpt = ""
            else:
                translated_title = signal_item.title or "Tin nổi bật"
                translated_excerpt = ""

            translated_title = translated_title.lstrip("- ").strip()
            translated_excerpt = translated_excerpt.lstrip("- ").strip()

            if _normalize_compare_text(translated_title) == _normalize_compare_text(translated_excerpt):
                translated_excerpt = ""
            highlights.append(
                StoryHighlight(
                    title=translated_title,
                    excerpt=translated_excerpt,
                    image_url=image_url,
                    original_url=signal_item.original_url,
                    source_name=signal_item.source_name,
                )
            )
    payload.update(
        {
            "topic_name": story.topic.name if story.topic else None,
            "effective_hero_image": effective_hero_image,
            "hero_image": payload.get("hero_image") or effective_hero_image,
            "highlights": [item.model_dump() for item in highlights],
        }
    )
    return StoryRead(**payload)


def _delete_story_dependencies(db: Session, story_id: int) -> None:
    db.query(StoryEvidence).filter(StoryEvidence.story_id == story_id).delete(synchronize_session=False)
    db.query(EditorialNote).filter(EditorialNote.story_id == story_id).delete(synchronize_session=False)


@router.get("/categories")
@router.get("/categories/")
def list_story_categories(db: Session = Depends(get_db)):
    rows = (
        db.query(Topic.name, func.count(Story.id).label("count"))
        .join(Story, Story.topic_id == Topic.id)
        .filter(Topic.name != None)
        .group_by(Topic.name)
        .having(func.count(Story.id) > 0)
        .all()
    )
    return [{"name": row[0], "count": row[1]} for row in rows]


@router.get("", response_model=List[StoryRead])
@router.get("/", response_model=List[StoryRead])
def list_stories(
    db: Session = Depends(get_db),
    topic_id: Optional[int] = None,
    topic_name: Optional[str] = None,
    story_type: Optional[str] = None,
    status: Optional[str] = None,
    published_only: bool = Query(default=False),
    limit: int = Query(default=50, ge=1, le=200),
):
    query = _story_query(db).order_by(Story.published_at.desc(), Story.id.desc())
    if topic_id is not None:
        query = query.filter(Story.topic_id == topic_id)
    if topic_name:
        query = query.join(Story.topic).filter(Topic.name.ilike(topic_name.strip()))
    if story_type:
        query = query.filter(Story.story_type == story_type)
    if status:
        query = query.filter(Story.status == status)
    if published_only:
        query = query.filter(Story.status == "published")
    stories = query.limit(limit).all()
    # For Roundups or Deep Dives, we often want to show highlights even in list view
    return [
        _to_story_read(story, include_highlights=(story.story_type in ["roundup", "deep_dive"])) 
        for story in stories
    ]


@router.get("/{story_id}", response_model=StoryRead)
def get_story(story_id: int, db: Session = Depends(get_db)):
    story = _story_query(db).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    return _to_story_read(story, include_highlights=True)


@router.patch("/{story_id}", response_model=StoryRead)
def update_story(story_id: int, payload: StoryUpdate, db: Session = Depends(get_db)):
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(story, field, value)
    db.commit()
    updated_story = _story_query(db).filter(Story.id == story_id).first()
    return _to_story_read(updated_story, include_highlights=True)


@router.post("/{story_id}/review", response_model=StoryRead)
def review_story(story_id: int, db: Session = Depends(get_db)):
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    story.status = "reviewed"
    db.commit()
    updated_story = _story_query(db).filter(Story.id == story_id).first()
    return _to_story_read(updated_story, include_highlights=True)


@router.post("/{story_id}/publish", response_model=StoryRead)
def publish_story(story_id: int, db: Session = Depends(get_db)):
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    story.status = "published"
    story.published_at = datetime.utcnow()
    db.commit()
    updated_story = _story_query(db).filter(Story.id == story_id).first()
    return _to_story_read(updated_story, include_highlights=True)


@router.delete("/{story_id}")
def delete_story(story_id: int, db: Session = Depends(get_db)):
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    _delete_story_dependencies(db, story.id)
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
        _delete_story_dependencies(db, row.id)
        db.delete(row)
    db.commit()
    return {"status": "success", "deleted_ids": found_ids, "deleted_count": len(found_ids)}
