import os
from celery import Celery
from app.core.config import settings

# CELERY Configuration
celery_app = Celery(
    "news_worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.worker.tasks"]
)

# Standard configuration for Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    # As requested: Only 1 task per worker for AI processing
    worker_concurrency=1,
)

from celery.schedules import crontab

# Cấu hình tự động chay task (tuỳ chọn) khi khởi động celery beat
celery_app.conf.beat_schedule = {
    'daily-tech-research-task': {
        'task': 'app.worker.tasks.run_tech_research_task',
        'schedule': crontab(minute=0, hour=0), # 1 ngày 1 lần (0h00)
        'args': ('Trending in Software Engineering',),
    },
}
