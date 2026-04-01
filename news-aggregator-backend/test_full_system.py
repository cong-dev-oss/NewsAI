from app.worker.tasks import crawl_hacker_news_tech_task, crawl_rss_category_task
import time

print("🚀 [TEST] Bắt đầu kích hoạt cào tin tức toàn bộ danh mục...")

# 1. Test cào 10 bài Công nghệ (Hacker News)
print("📡 Đang gửi lệnh lấy 10 bài Công nghệ từ Hacker News...")
crawl_hacker_news_tech_task.delay(10)

# 2. Test cào 5 bài mỗi chuyên mục (VnExpress)
categories = [
    ('https://vnexpress.net/rss/the-gioi.rss', 'Thế giới'),
    ('https://vnexpress.net/rss/thoi-su.rss', 'Chính trị'),
    ('https://vnexpress.net/rss/kinh-doanh.rss', 'Kinh tế'),
    ('https://vnexpress.net/rss/khoa-hoc.rss', 'Khoa học'),
    ('https://vnexpress.net/rss/suc-khoe.rss', 'Sức khỏe'),
]

for url, cat in categories:
    print(f"📡 Đang gửi lệnh lấy 5 bài mục: {cat}...")
    crawl_rss_category_task.delay(url, cat, 5)

print("\n📦 TẤT CẢ ĐÃ VÀO HÀNG ĐỢI (QUEUE)!")
print("🔍 BƯỚC TIẾP THEO:")
print("1. Kiểm tra cửa sổ terminal chạy CELERY để xem quá trình cào và AI tóm tắt.")
print("2. F5 trang http://localhost:8000/api/v1/articles/ để thấy bài báo mới đổ về.")
print("3. F5 trang http://localhost:3000 để thấy giao diện đã cập nhật tin mới nhất.")
