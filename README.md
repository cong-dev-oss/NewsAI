# 🚀 NewsAI Aggregator - SaaS Admin Dashboard

Hệ thống tóm tắt tin tức tự động dựa trên AI (Ollama qwen2.5:3b) với quy trình tự động hóa thời gian thực và quản trị chuyên nghiệp.

## 🛠️ Công Nghệ Sử Dụng
- **Backend**: FastAPI, SQLAlchemy (PostgreSQL), Redis (Pub/Sub). Architecture: **Layered Architecture**.
- **Worker**: Celery & Celery Beat (Dynamic Database Scheduling & Daily Jobs).
- **AI Integration (Summarize)**: Ollama (Model: qwen2.5:3b), tóm tắt tiếng Việt.
- **AI Integration (Audio)**: Void-Box Server cho chuyển đổi văn bản tóm tắt sang Audio.
- **AI Integration (Research)**: Bản tin Công nghệ ứng dụng `mvanhorn/last30days-skill`.
- **Frontend**: Next.js 15, TailwindCSS, Lucide-Icons, WebSockets (Giao diện hiển thị cả bài tin tức và trình phát Audio).
- **Security & System**: JWT Authentication, Hashed Passwords. Tách bạch Config tại `app/core/config.py`.

---

## 📅 Roadmap 4 Phases

### Phase 1: Nền tảng Backend & Database
- Tái cấu trúc chuẩn **Layered Architecture** với `models`, `schemas`, `services`, `api` (Tối ưu hóa từ setup cũ phân tán).
- Hỗ trợ lưu trữ cấu hình cào tin động theo từng Link và Chủ đề. Lưu thông số cấu hình URL vào file `config.py`.

### Phase 2: Xử Lý Ngầm & Hệ sinh thái AI
- **Crawler**: Tự động trích xuất nội dung bài báo.
- **Summarize**: AI tóm tắt chính xác 3 câu tiếng Việt từ bất kỳ ngôn ngữ nào.
- **Text-to-Speech**: Giao tiếp thẳng với `Void-Box API` để trích xuất file audio cho phép độc giả nghe tóm tắt ngay trên Frontend.
- **Tech Summary**: Thực thi ngầm `Last30Days-skill` mỗi `00:00` hàng ngày để dò xu hướng diễn đàn, ra tin bài Công nghệ tổng quan.

### Phase 3: Real-time Workflow
- Lập lịch động: Người dùng cấu hình giờ chạy trên UI -> Cập nhật trực tiếp vào Celery Beat.
- WebSocket: Phát sóng tiến độ `CRAWLING` -> `SUMMARIZING` -> `SAVING` cho Frontend.

### Phase 4: Admin Portal Premium
- Portal quản trị `/admin` bảo mật cao.
- **Monitoring Dashboard**: Thanh tiến độ chạy theo thời gian thực cho từng bài viết.
- **Config Manager**: Thêm nguồn, chọn chủ đề, đặt lịch Cron (ví dụ `0 15 * * *`).

---

## 🛠 Getting Started

### 1. Prerequisites
- **Python 3.10+** & **Node.js 18+**
- **Ollama**: Download and run locally. Pull the model: `ollama pull qwen2.5:3b`
- **Redis & PostgreSQL**: Ensure these are running (locally or via Docker).

### 2. Backend Setup & Run (Windows)
```bash
cd news-aggregator-backend
# Initial setup (only first time)
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\python.exe -m pip install "uvicorn[standard]" websockets wsproto

# Run Backend
.\venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8000 --reload

# Run Processing Worker (In another terminal)
.\venv\Scripts\celery.exe -A app.worker.celery_app worker --loglevel=info -P solo
```

### 3. Frontend Setup & Run
```bash
# In the root NewsAI directory
npm install
npm run dev
```

## 🚀 Usage Guide

1.  **Access Dashboard**: Open [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)
2.  **Configure Pipelines**: Go to **System Configs** to add sources (e.g., VnExpress).
3.  **Run Automation**: Click **Trigger Scan** on the Dashboard.
4.  **Monitor Progress**: Watch the **Running Jobs** section for real-time AI progress (0-100%).
5.  **View Results**: Browse articles at [http://localhost:3000/admin/articles](http://localhost:3000/admin/articles) or the NewsHub homepage.

### 4. Truy cập
- **Trang Đăng nhập**: `http://localhost:3000/admin/login`
- **Dashboard Giám sát**: `http://localhost:3000/admin/dashboard`
- **Tài khoản quản trị**: `admin` / `admin123` (Của script seed_admin.py)

---

### ⚠️ Troubleshooting (Windows)
- **WinError 5 (Access Denied)**: Đảm bảo bạn thêm cờ `-P solo` khi chạy lệnh celery worker để tránh lỗi này trên Windows.
- **WebSocket 404**: Luôn chắc chắn đã nạp thư viện uvicorn[standard] trước khi khởi động.
- **Redis Connection Error**: Kiểm tra file `.env` đã trỏ đúng IP của Redis (mặc định là 192.168.119.128).
- **Cài đặt Lịch trình**: `http://localhost:3000/admin/configs`

---

## 🔒 Ghi Chú Bảo Mật & Kết Nối
- Dự án hỗ trợ kết nối **Hybrid Dev**: Bạn có thể code tại máy Local Windows nhưng gọi Database/Redis trực tiếp từ Server Ubuntu (IP: `192.168.119.128`) thông qua file `.env`.
- Toàn bộ mật khẩu được băm (hashing) và API được bảo vệ bởi lớp MiddleWare JWT.
