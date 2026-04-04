from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.domain.schemas.article import ArticleRead, ArticleCreate, ArticleUpdate, ArticleList, ArticleBulkDeleteRequest
# from app.services.article_service import ArticleService # We will create this later

router = APIRouter()

@router.get("/", response_model=List[ArticleRead])
def read_articles(
    db: Session = Depends(get_db), 
    skip: int = 0, 
    limit: int = 10,
    is_processed: Optional[bool] = None,
    category: Optional[str] = None # Thêm lọc theo chuyên mục
):
    # Mock for Phase 1 or simple DB query
    from app.models.article import Article
    query = db.query(Article).order_by(Article.processed_at.desc(), Article.id.desc())
    if is_processed is not None:
        query = query.filter(Article.is_processed == is_processed)
    if category is not None:
        query = query.filter(Article.category == category)
    
    articles = query.offset(skip).limit(limit).all()
    return articles

@router.get("/categories")
def get_active_categories(db: Session = Depends(get_db)):
    """Trả về danh sách chuyên mục có ít nhất 1 bài viết"""
    from sqlalchemy import func
    from app.models.article import Article
    
    # Query các category và đếm số lượng bài viết
    results = (
        db.query(Article.category, func.count(Article.id).label("count"))
        .filter(Article.category != None)
        .group_by(Article.category)
        .having(func.count(Article.id) > 0)
        .all()
    )
    
    return [{"name": r[0], "count": r[1]} for r in results]

@router.post("/", response_model=ArticleRead)
def create_article(article: ArticleCreate, db: Session = Depends(get_db)):
    from app.models.article import Article
    db_article = Article(**article.model_dump())
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    return db_article

@router.get("/{article_id}", response_model=ArticleRead)
def read_article(article_id: int, db: Session = Depends(get_db)):
    from app.models.article import Article
    article = db.query(Article).filter(Article.id == article_id).first()
    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")
    return article

@router.delete("/{article_id}")
def delete_article(article_id: int, db: Session = Depends(get_db)):
    from app.models.article import Article
    article = db.query(Article).filter(Article.id == article_id).first()
    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")

    db.delete(article)
    db.commit()
    return {"status": "success", "deleted_ids": [article_id], "deleted_count": 1}

@router.post("/bulk-delete")
def bulk_delete_articles(payload: ArticleBulkDeleteRequest, db: Session = Depends(get_db)):
    from app.models.article import Article

    ids = sorted(set(payload.ids))
    if not ids:
        return {"status": "success", "deleted_ids": [], "deleted_count": 0}

    articles = db.query(Article).filter(Article.id.in_(ids)).all()
    found_ids = [article.id for article in articles]

    for article in articles:
        db.delete(article)

    db.commit()
    return {"status": "success", "deleted_ids": found_ids, "deleted_count": len(found_ids)}
