from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.core.config import settings
from app.api.websockets import progress

# Important: Import all models into main so SQLAlchemy mappers are initialized
from app.models.user import User
from app.models.source import Source
from app.models.topic import Topic
from app.models.config import SourceTopicConfig
from app.models.article_history import ArticleHistory
from app.domain.models.article import Article, JobHistory

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

@app.get("/")
def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}
