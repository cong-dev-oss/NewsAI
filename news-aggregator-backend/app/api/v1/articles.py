from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.domain.schemas.article import ArticleRead, ArticleCreate, ArticleUpdate, ArticleList, ArticleBulkDeleteRequest
from app.models.story import Story

router = APIRouter()

@router.get("/", response_model=List[ArticleRead])
def read_articles(
    db: Session = Depends(get_db), 
    skip: int = 0, 
    limit: int = 10,
    status: Optional[str] = None,
    category: Optional[str] = None,
):
    query = db.query(Story).order_by(Story.published_at.desc(), Story.id.desc())
    if status is not None:
        query = query.filter(Story.status == status)
    if category is not None:
        query = query.filter(Story.story_type == category)
    
    articles = query.offset(skip).limit(limit).all()
    return articles

@router.get("/categories")
def get_active_categories(db: Session = Depends(get_db)):
    from sqlalchemy import func

    results = (
        db.query(Story.story_type, func.count(Story.id).label("count"))
        .filter(Story.story_type != None)
        .group_by(Story.story_type)
        .having(func.count(Story.id) > 0)
        .all()
    )
    
    return [{"name": r[0], "count": r[1]} for r in results]

@router.post("/", response_model=ArticleRead)
def create_article(article: ArticleCreate, db: Session = Depends(get_db)):
    db_article = Story(**article.model_dump())
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    return db_article

@router.get("/{article_id}", response_model=ArticleRead)
def read_article(article_id: int, db: Session = Depends(get_db)):
    article = db.query(Story).filter(Story.id == article_id).first()
    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")
    return article

@router.delete("/{article_id}")
def delete_article(article_id: int, db: Session = Depends(get_db)):
    article = db.query(Story).filter(Story.id == article_id).first()
    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")

    db.delete(article)
    db.commit()
    return {"status": "success", "deleted_ids": [article_id], "deleted_count": 1}

@router.post("/bulk-delete")
def bulk_delete_articles(payload: ArticleBulkDeleteRequest, db: Session = Depends(get_db)):
    ids = sorted(set(payload.ids))
    if not ids:
        return {"status": "success", "deleted_ids": [], "deleted_count": 0}

    articles = db.query(Story).filter(Story.id.in_(ids)).all()
    found_ids = [article.id for article in articles]

    for article in articles:
        db.delete(article)

    db.commit()
    return {"status": "success", "deleted_ids": found_ids, "deleted_count": len(found_ids)}
