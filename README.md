# AI News Aggregator

He thong tu dong cao, dich va tom tat tin tuc bang AI theo chuyen muc.

## Tinh nang

- Cao tin tu Hacker News va VnExpress RSS.
- AI (Qwen2:1.5b) tu dong dich tieu de, noi dung va tom tat sang tieng Viet.
- Menu chuyen muc dong (tu an muc khong co bai viet).
- Tu dong chay theo lich vao 6h sang hang ngay.

## Cai dat

1. Di chuyen vao backend: `cd news-aggregator-backend`
2. Cai dat thu vien: `pip install -r requirements.txt`
3. Cai dat parser: `pip install lxml`

## Khoi chay

### Terminal 1: Backend API
```bash
cd news-aggregator-backend
.\venv\Scripts\activate
uvicorn app.main:app --reload
```

### Terminal 2: Celery Worker
```bash
cd news-aggregator-backend
.\venv\Scripts\activate
celery -A app.worker.celery_app worker --loglevel=info -P solo
```

### Terminal 3: Celery Beat (Lich trinh)
```bash
cd news-aggregator-backend
.\venv\Scripts\activate
celery -A app.worker.celery_app beat --loglevel=info
```

### Terminal 4: Frontend
```bash
npm run dev
```

## Script cong cu
- `cd news-aggregator-backend && .\venv\Scripts\activate && python reset_db.py`
- `cd news-aggregator-backend && .\venv\Scripts\activate && python test_full_system.py`
- `cd news-aggregator-backend && .\venv\Scripts\activate && python seed_source.py`
