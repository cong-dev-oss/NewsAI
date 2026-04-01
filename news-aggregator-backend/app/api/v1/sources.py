from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.domain.schemas.article import Source, SourceCreate, SourceUpdate

router = APIRouter()

@router.get("/", response_model=List[Source])
def read_sources(db: Session = Depends(get_db), skip: int = 0, limit: int = 10):
    from app.domain.models.article import Source as DBSource
    sources = db.query(DBSource).offset(skip).limit(limit).all()
    return sources

@router.post("/", response_model=Source)
def create_source(source: SourceCreate, db: Session = Depends(get_db)):
    from app.domain.models.article import Source as DBSource
    db_source = DBSource(**source.model_dump())
    db.add(db_source)
    db.commit()
    db.refresh(db_source)
    return db_source

@router.get("/{source_id}", response_model=Source)
def read_source(source_id: int, db: Session = Depends(get_db)):
    from app.domain.models.article import Source as DBSource
    source = db.query(DBSource).filter(DBSource.id == source_id).first()
    if source is None:
        raise HTTPException(status_code=404, detail="Source not found")
    return source
