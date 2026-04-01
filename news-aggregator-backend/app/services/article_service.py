from sqlalchemy.orm import Session
from app.domain.models.article import Article
from app.domain.schemas.article import ArticleCreate, ArticleUpdate
from typing import List, Optional

class ArticleService:
    @staticmethod
    def save_article(db: Session, article_data: ArticleCreate) -> Article:
        db_article = db.query(Article).filter(Article.url == article_data.url).first()
        if db_article:
            # Maybe update some fields like content if needed
            return db_article
        
        db_article = Article(**article_data.model_dump())
        db.add(db_article)
        db.commit()
        db.refresh(db_article)
        return db_article

    @staticmethod
    def update_article(db: Session, article_id: int, article_update: ArticleUpdate) -> Optional[Article]:
        db_article = db.query(Article).filter(Article.id == article_id).first()
        if not db_article:
            return None
        
        for key, value in article_update.model_dump(exclude_unset=True).items():
            setattr(db_article, key, value)
            
        db.commit()
        db.refresh(db_article)
        return db_article

    @staticmethod
    def mark_processed(db: Session, article_id: int, summary: str, image_url: Optional[str] = None):
        db_article = db.query(Article).filter(Article.id == article_id).first()
        if db_article:
            db_article.summary = summary
            db_article.is_processed = True
            if image_url:
                db_article.image_url = image_url
            db.commit()
            db.refresh(db_article)
        return db_article

article_service = ArticleService()
