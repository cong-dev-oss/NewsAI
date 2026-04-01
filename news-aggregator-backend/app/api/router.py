from fastapi import APIRouter
from .v1 import articles, sources

api_router = APIRouter()

api_router.include_router(articles.router, prefix="/articles", tags=["articles"])
api_router.include_router(sources.router, prefix="/sources", tags=["sources"])
