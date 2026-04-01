from app.worker.tasks import crawl_and_process_news_task
import time

# URL một bài báo cụ thể để test (Bạn có thể đổi URL khác)
test_url = "https://vnexpress.net/thu-tuong-yeu-cau-giam-lai-suat-cho-vay-4729112.html"

print(f"🚀 Đang gửi yêu cầu cào báo tới Worker cho URL: {test_url}")
# delay() gửi task vào Redis queue để Celery worker xử lý
result = crawl_and_process_news_task.delay(test_url)

print(f"📦 Task ID: {result.id}")
print("🔍 Hãy kiểm tra log ở cửa sổ terminal bạn đang chạy Celery để xem quá trình AI tóm tắt!")

# Bạn có thể kiểm tra kết quả qua API HTTP://localhost:8000/api/v1/articles/
