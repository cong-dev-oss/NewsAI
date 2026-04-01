from app.core.database import engine, Base
from app.domain.models.article import Article, Source, JobHistory

def reset_database():
    print("⚠️  Đang tiến hành xoá toàn bộ dữ liệu cũ...")
    
    # Xoá tất cả các bảng
    Base.metadata.drop_all(bind=engine)
    print("✅ Đã xoá sạch các bảng cũ.")
    
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
