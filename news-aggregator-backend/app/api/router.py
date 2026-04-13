from fastapi import APIRouter
from .endpoints import auth, history, pipeline, research, sources, stories

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(stories.router)
api_router.include_router(research.router)
api_router.include_router(pipeline.router)
api_router.include_router(sources.router, prefix="/sources", tags=["sources"])
api_router.include_router(history.router, prefix="/history", tags=["history"])
