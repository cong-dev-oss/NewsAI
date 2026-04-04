import sys
import os

# Đảm bảo có thể import từ root
sys.path.append(os.getcwd())

from app.core.database import engine, Base
from app.models.user import User
from app.models.source import Source
from app.models.topic import Topic
from app.models.config import SourceTopicConfig
from app.models.article_history import ArticleHistory
# Quan trọng: Import thêm các model từ domain
from app.models.article import Article, JobHistory

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
