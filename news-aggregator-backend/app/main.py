from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.core.config import settings
from app.api.websockets import progress
from app.core.database import Base, engine
from celery_sqlalchemy_scheduler.models import ModelBase as CelerySchedulerModelBase

# Important: Import all models into main so SQLAlchemy mappers are initialized
from app.models.user import User
from app.models.source import Source
from app.models.topic import Topic
from app.models.config import SourceTopicConfig
from app.models.article_history import ArticleHistory
from app.models.article import Article, JobHistory
from app.models.signal_source import SignalSource
from app.models.topic_source_config import TopicSourceConfig
from app.models.research_run import ResearchRun
from app.models.signal_item import SignalItem
from app.models.story import Story
from app.models.story_evidence import StoryEvidence
from app.models.editorial_note import EditorialNote

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(progress.router, tags=["websockets"]) # Tại root: /ws/progress


@app.on_event("startup")
def startup_create_tables() -> None:
    # Dev convenience: automatically create tables on app start.
    # Keep this enabled only in environments where schema auto-create is acceptable.
    if settings.AUTO_CREATE_TABLES:
        Base.metadata.create_all(bind=engine)
        # Required for dynamic scheduler sync in app.worker.scheduler
        CelerySchedulerModelBase.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}
