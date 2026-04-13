import sys
import os

# Đảm bảo có thể import từ root
sys.path.append(os.getcwd())

from app.core.database import engine, Base
from app.models.user import User
from app.models.topic import Topic
from app.models.signal_source import SignalSource
from app.models.topic_source_config import TopicSourceConfig
from app.models.research_run import ResearchRun
from app.models.signal_item import SignalItem
from app.models.story import Story
from app.models.story_evidence import StoryEvidence
from app.models.editorial_note import EditorialNote
from app.models.article import JobHistory

def reset_database():
    print("⚠️  Đang tiến hành xoá toàn bộ dữ liệu cũ...")
    
    # Ở Postgres, đôi khi drop_all không xử lý hết CASCADE. 
    # Nhưng nếu ta import đầy đủ các model có liên kết Foreign Key, 
    # SQLAlchemy sẽ tự sắp xếp thứ tự xoá đúng.
    try:
        # Xoá tất cả các bảng
        Base.metadata.drop_all(bind=engine)
        print("✅ Đã xoá sạch các bảng cũ.")
    except Exception as e:
        from app.core.config import settings
        print(f"❌ Lỗi khi xoá bảng: {e}")
        print("💡 Thử sử dụng cách xoá mạnh tay hơn (DROP SCHEMA CASCADE)...")
        # Cách dự phòng cho Postgres: DROP SCHEMA
        with engine.connect() as conn:
            import sqlalchemy
            # Sử dụng text cho SQL thuần
            from sqlalchemy import text
            with conn.begin():
                conn.execute(text("DROP SCHEMA public CASCADE;"))
                conn.execute(text("CREATE SCHEMA public;"))
                conn.execute(text(f"GRANT ALL ON SCHEMA public TO {settings.POSTGRES_USER};"))
                conn.execute(text("GRANT ALL ON SCHEMA public TO public;"))
        print("✅ Đã xoá sạch Schema public và khởi tạo lại.")
    
    # Tạo lại các bảng mới
    print("🛠️  Đang khởi tạo lại cấu trúc database mới...")
    Base.metadata.create_all(bind=engine)
    print("✨ Database đã sẵn sàng và trắng tinh!")

if __name__ == "__main__":
    confirm = input("Bạn có chắc chắn muốn XÓA TOÀN BỘ database không? (y/n): ")
    if confirm.lower() == 'y':
        reset_database()
    else:
        print("❌ Đã hủy thao tác.")
