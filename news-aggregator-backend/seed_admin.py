import sys
import os
sys.path.append(os.getcwd())

from app.core.database import SessionLocal, engine, Base
from sqlalchemy import inspect
from app.models.user import User
from app.models.topic import Topic
from app.models.signal_source import SignalSource
from app.models.topic_source_config import TopicSourceConfig
from app.models.research_run import ResearchRun
from app.models.signal_item import SignalItem
from app.models.story import Story
from app.models.story_evidence import StoryEvidence
from app.models.editorial_note import EditorialNote

def seed_admin():
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        print("🛠️ Đang khởi tạo cấu trúc bảng...")
        Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == "admin").first()
        if not existing:
            admin_user = User(
                username="admin",
                hashed_password=User.get_password_hash("admin123"),
                is_superuser=True
            )
            db.add(admin_user)
            db.commit()
            print("✅ Admin user 'admin' created with password 'admin123'")
        else:
            print("ℹ️ Admin user already exists.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
