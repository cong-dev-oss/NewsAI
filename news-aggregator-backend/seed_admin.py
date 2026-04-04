import sys
import os
sys.path.append(os.getcwd())

from app.core.database import SessionLocal, engine, Base
from sqlalchemy import inspect
from app.models.user import User
from app.models.source import Source
from app.models.topic import Topic
from app.models.config import SourceTopicConfig
from app.models.article_history import ArticleHistory
from app.models.article import Article, JobHistory

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
