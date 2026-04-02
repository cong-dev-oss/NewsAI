# 🚀 NewsAI Aggregator - SaaS Admin Dashboard

Hệ thống tóm tắt tin tức tự động dựa trên AI (Ollama qwen2.5:3b) với quy trình tự động hóa thời gian thực và quản trị chuyên nghiệp.

## 🛠️ Công Nghệ Sử Dụng
- **Backend**: FastAPI, SQLAlchemy (PostgreSQL), Redis (Pub/Sub).
- **Worker**: Celery & Celery Beat (Dynamic Database Scheduling).
- **AI Integration**: Ollama (Model: qwen2.5:3b), tóm tắt súc tích, keep_alive=0.
- **Frontend**: Next.js 15, TailwindCSS, Lucide-Icons, WebSockets.
- **Security**: JWT Authentication, Hashed Passwords (Bcrypt).

---

## 📅 Roadmap 4 Phases

### Phase 1: Nền tảng Backend & Database
- Cấu trúc DDD, thiết kế Schema đa tầng: `User`, `Source`, `Topic`, `SourceTopicConfig`, `ArticleHistory`.
- Hỗ trợ lưu trữ cấu hình cào tin động theo từng Link và Chủ đề.

### Phase 2: Xử Lý Ngầm & AI
- Crawler tự động trích xuất nội dung bài báo.
- AI tóm tắt chính xác 3 câu tiếng Việt từ bất kỳ ngôn ngữ nào.
- Tự động hóa RAM: Giải phóng bộ nhớ AI ngay sau khi hoàn tất.

### Phase 3: Real-time Workflow
- Lập lịch động: Người dùng cấu hình giờ chạy trên UI -> Cập nhật trực tiếp vào Celery Beat.
- WebSocket: Phát sóng tiến độ `CRAWLING` -> `SUMMARIZING` -> `SAVING` cho Frontend.

### Phase 4: Admin Portal Premium
- Portal quản trị `/admin` bảo mật cao.
- **Monitoring Dashboard**: Thanh tiến độ chạy theo thời gian thực cho từng bài viết.
- **Config Manager**: Thêm nguồn, chọn chủ đề, đặt lịch Cron (ví dụ `0 15 * * *`).

---

## 🚀 Hướng Dẫn Khởi Chạy

### 1. Khởi tạo Database & Admin User (Lần đầu)
Kết nối môi trường (Local / Server) và chạy script tạo tài khoản quản trị:
```bash
cd news-aggregator-backend
# Kích hoạt venv (nếu có)
.\venv\Scripts\activate
# Cài đặt thư viện
pip install -r requirements.txt
# Chạy script (Tự động tạo bảng & tạo admin user)
python seed_admin.py
```
*Tài khoản mặc định: `admin` / `admin123`*

### 2. Chạy Backend (Docker)
Đảm bảo Docker & Redis/Postgres đã sẵn sàng trên Server Ubuntu:
```bash
docker-compose up --build
```

### 3. Chạy Frontend (Next.js)
```bash
cd ..
npm install
npm run dev
```

### 4. Truy cập
- **Trang Đăng nhập**: `http://localhost:3000/admin/login`
- **Dashboard Giám sát**: `http://localhost:3000/admin/dashboard`
- **Cài đặt Lịch trình**: `http://localhost:3000/admin/configs`

---

## 🔒 Ghi Chú Bảo Mật & Kết Nối
- Dự án hỗ trợ kết nối **Hybrid Dev**: Bạn có thể code tại máy Local Windows nhưng gọi Database/Redis trực tiếp từ Server Ubuntu (IP: `192.168.119.128`) thông qua file `.env`.
- Toàn bộ mật khẩu được băm (hashing) và API được bảo vệ bởi lớp MiddleWare JWT.
