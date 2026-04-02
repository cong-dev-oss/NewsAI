from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.article_history import ArticleHistory as HistoryModel
from app.schemas import job_schema

router = APIRouter()

@router.get("/", response_model=List[job_schema.ArticleHistory])
def get_article_history(
    skip: int = 0, 
    limit: int = 50, 
    db: Session = Depends(get_db)
):
    return db.query(HistoryModel).order_by(HistoryModel.processed_at.desc()).offset(skip).limit(limit).all()

@router.get("/config/{config_id}", response_model=List[job_schema.ArticleHistory])
def get_history_by_config(config_id: int, db: Session = Depends(get_db)):
    return db.query(HistoryModel).filter(HistoryModel.config_id == config_id).order_by(HistoryModel.processed_at.desc()).all()
