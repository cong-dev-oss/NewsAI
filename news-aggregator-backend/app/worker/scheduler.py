from sqlalchemy.orm import Session
from sqlalchemy.event import listen, remove
from celery_sqlalchemy_scheduler.models import (
    CrontabSchedule,
    IntervalSchedule,
    PeriodicTask,
    PeriodicTaskChanged,
    SolarSchedule,
)
from sqlalchemy import select, insert, update
from app.models.topic_source_config import TopicSourceConfig
import json
import datetime as dt


def _patch_celery_scheduler_for_sqlalchemy_v2() -> None:
    """
    celery_sqlalchemy_scheduler currently uses SQLAlchemy 1.x style:
    select([Model]) which crashes on SQLAlchemy 2.x.
    Patch update_changed to 2.x-compatible syntax.
    """
    old_update_changed = PeriodicTaskChanged.update_changed
    old_changed = PeriodicTaskChanged.changed

    @classmethod
    def _update_changed_v2(cls, mapper, connection, target):  # type: ignore[no-redef]
        row = connection.execute(
            select(PeriodicTaskChanged).where(PeriodicTaskChanged.id == 1).limit(1)
        ).first()
        if not row:
            connection.execute(
                insert(PeriodicTaskChanged).values(id=1, last_update=dt.datetime.now())
            )
        else:
            connection.execute(
                update(PeriodicTaskChanged)
                .where(PeriodicTaskChanged.id == 1)
                .values(last_update=dt.datetime.now())
            )

    @classmethod
    def _changed_v2(cls, mapper, connection, target):  # type: ignore[no-redef]
        if not getattr(target, "no_changes", False):
            cls.update_changed(mapper, connection, target)

    PeriodicTaskChanged.update_changed = _update_changed_v2
    PeriodicTaskChanged.changed = _changed_v2

    # Existing listeners still point to original function objects.
    for model, event_name, fn in (
        (PeriodicTask, "after_insert", old_update_changed),
        (PeriodicTask, "after_delete", old_update_changed),
        (PeriodicTask, "after_update", old_changed),
        (IntervalSchedule, "after_insert", old_update_changed),
        (IntervalSchedule, "after_delete", old_update_changed),
        (IntervalSchedule, "after_update", old_update_changed),
        (CrontabSchedule, "after_insert", old_update_changed),
        (CrontabSchedule, "after_delete", old_update_changed),
        (CrontabSchedule, "after_update", old_update_changed),
        (SolarSchedule, "after_insert", old_update_changed),
        (SolarSchedule, "after_delete", old_update_changed),
        (SolarSchedule, "after_update", old_update_changed),
    ):
        try:
            remove(model, event_name, fn)
        except Exception:
            pass

    for model, event_name, fn in (
        (PeriodicTask, "after_insert", PeriodicTaskChanged.update_changed),
        (PeriodicTask, "after_delete", PeriodicTaskChanged.update_changed),
        (PeriodicTask, "after_update", PeriodicTaskChanged.changed),
        (IntervalSchedule, "after_insert", PeriodicTaskChanged.update_changed),
        (IntervalSchedule, "after_delete", PeriodicTaskChanged.update_changed),
        (IntervalSchedule, "after_update", PeriodicTaskChanged.update_changed),
        (CrontabSchedule, "after_insert", PeriodicTaskChanged.update_changed),
        (CrontabSchedule, "after_delete", PeriodicTaskChanged.update_changed),
        (CrontabSchedule, "after_update", PeriodicTaskChanged.update_changed),
        (SolarSchedule, "after_insert", PeriodicTaskChanged.update_changed),
        (SolarSchedule, "after_delete", PeriodicTaskChanged.update_changed),
        (SolarSchedule, "after_update", PeriodicTaskChanged.update_changed),
    ):
        listen(model, event_name, fn)

_patch_celery_scheduler_for_sqlalchemy_v2()

class SchedulerService:
    @staticmethod
    def sync_config_to_celery(db: Session, config: TopicSourceConfig):
        """Sync TopicSourceConfig schedule into Celery beat tables."""
        parts = (config.schedule_cron or "0 2 * * *").split()
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

        # 2. Create or update periodic task for research pipeline.
        task_name = f"research_run_{config.id}"
        periodic_task = db.query(PeriodicTask).filter_by(name=task_name).first()
        
        if not periodic_task:
            periodic_task = PeriodicTask(
                name=task_name,
                task="app.worker.tasks.run_topic_source_research",
                crontab_id=schedule.id,
                args=json.dumps([config.id]),
                enabled=config.is_active
            )
            db.add(periodic_task)
        else:
            periodic_task.crontab_id = schedule.id
            periodic_task.enabled = config.is_active
            
        db.commit()

    @staticmethod
    def remove_config_from_celery(db: Session, config_id: int):
        task_name = f"research_run_{config_id}"
        periodic_task = db.query(PeriodicTask).filter_by(name=task_name).first()
        if periodic_task:
            db.delete(periodic_task)
            db.commit()
