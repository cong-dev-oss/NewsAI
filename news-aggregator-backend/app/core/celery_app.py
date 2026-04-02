from celery import Celery
from app.core.config import settings
import os

celery_app = Celery(
    "news_worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.worker.tasks"]
)

# Cấu hình cho Dynamic Scheduler (celery-sqlalchemy-scheduler)
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Ho_Chi_Minh",
    enable_utc=True,
    # Sử dụng database làm lưu trữ cho schedule
    beat_dburi=settings.DATABASE_URL,
    beat_scheduler="celery_sqlalchemy_scheduler.schedulers:DatabaseScheduler",
)
