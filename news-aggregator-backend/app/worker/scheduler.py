from sqlalchemy.orm import Session
from celery_sqlalchemy_scheduler.models import PeriodicTask, CrontabSchedule
from app.models.config import SourceTopicConfig
import json

class SchedulerService:
    @staticmethod
    def sync_config_to_celery(db: Session, config: SourceTopicConfig):
        """Đồng bộ cài đặt từ SourceTopicConfig sang bảng của Celery Beat"""
        # Giả sử cron_config là "0 15 * * *"
        parts = config.cron_config.split()
        if len(parts) != 5:
            print("Invalid cron format")
            return

        minute, hour, day_of_month, month_of_year, day_of_week = parts

        # 1. Tìm hoặc tạo CrontabSchedule
        schedule = db.query(CrontabSchedule).filter_by(
            minute=minute,
            hour=hour,
            day_of_month=day_of_month,
            month_of_year=month_of_year,
            day_of_week=day_of_week,
            timezone="Asia/Ho_Chi_Minh"
        ).first()
        
        if not schedule:
            schedule = CrontabSchedule(
                minute=minute,
                hour=hour,
                day_of_month=day_of_month,
                month_of_year=month_of_year,
                day_of_week=day_of_week,
                timezone="Asia/Ho_Chi_Minh"
            )
            db.add(schedule)
            db.commit()
            db.refresh(schedule)

        # 2. Tạo hoặc cập nhật PeriodicTask
        task_name = f"crawl_job_{config.id}"
        periodic_task = db.query(PeriodicTask).filter_by(name=task_name).first()
        
        if not periodic_task:
            periodic_task = PeriodicTask(
                name=task_name,
                task="app.worker.tasks.run_config_crawl",
                crontab_id=schedule.id,
                args=json.dumps([config.id]),
                enabled=config.is_active
            )
            db.add(periodic_task)
        else:
            periodic_task.crontab_id = schedule.id
            periodic_task.enabled = config.is_active
            
        db.commit()
