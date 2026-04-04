from app.core.database import SessionLocal
from app.models.source import Source
from app.models.topic import Topic
from app.models.config import SourceTopicConfig
from app.models.article import Article, JobHistory
from app.models.article_history import ArticleHistory
from app.models.user import User

db = SessionLocal()
try:
    # Kiểm tra xem đã có nguồn nào chưa
    existing_source = db.query(Source).filter(Source.name == "VnExpress").first()
    if not existing_source:
        vnexpress = Source(
            name="VnExpress",
            base_url="https://vnexpress.net/rss/tin-moi-nhat.rss",
            is_active=True
        )
        db.add(vnexpress)
        db.commit()
        print("✅ Đã thêm nguồn VnExpress thành công!")
    else:
        print("ℹ️ Nguồn VnExpress đã tồn tại sẵn trong Database.")
except Exception as e:
    print(f"❌ Lỗi khi thêm nguồn: {e}")
finally:
    db.close()
