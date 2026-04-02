from app.core.database import SessionLocal
from app.models.article_history import ArticleHistory
from app.core.config import settings
import redis
import json

redis_client = redis.Redis(host=settings.REDIS_HOST, port=int(settings.REDIS_PORT), db=0)

class StateService:
    @staticmethod
    def update_article_state(history_id: int, status: str, progress: float, title: str = None, summary: str = None):
        """Update article status in DB and broadcast via Redis for WebSockets"""
        db = SessionLocal()
        try:
            history = db.query(ArticleHistory).filter(ArticleHistory.id == history_id).first()
            if history:
                history.status = status
                history.progress = progress
                if title: history.title = title
                if summary: history.summary = summary
                db.commit()
                
                # Broadcast the progress for Websockets (WS logic in api/websockets)
                data = {
                    "id": history_id,
                    "status": status,
                    "progress": progress,
                    "title": title or history.title
                }
                redis_client.publish("task_progress", json.dumps(data))
        finally:
            db.close()
