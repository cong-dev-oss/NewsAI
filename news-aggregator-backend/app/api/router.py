from fastapi import APIRouter
from .endpoints import sources, history, auth
from .websockets import progress

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(sources.router, prefix="/sources", tags=["sources"])
api_router.include_router(history.router, prefix="/history", tags=["history"])
api_router.include_router(progress.router, tags=["websockets"])
