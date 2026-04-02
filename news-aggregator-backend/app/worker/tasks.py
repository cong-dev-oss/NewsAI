from app.core.celery_app import celery_app
from app.services.crawler_service import CrawlerService
from app.services.ai_service import AIService
from app.services.state_service import StateService
from app.core.database import SessionLocal
from app.models.config import SourceTopicConfig
from app.models.article_history import ArticleHistory
import time

@celery_app.task(bind=True)
def run_config_crawl(self, config_id: int):
    """Nhiệm vụ tổng thể: cào links của một config_id rồi chạy các bài viết"""
    db = SessionLocal()
    try:
        config = db.query(SourceTopicConfig).get(config_id)
        if not config or not config.is_active:
            return {"status": "skipped", "message": "Config not found or inactive"}
            
        # 1. Tìm các links từ category_url
        links = CrawlerService.get_links_from_category(config.url, limit=config.article_limit)
        
        # 2. Với mỗi link, tạo 1 ArticleHistory vào DB và khởi chạy task xử lý lẻ
        task_results = []
        for link in links:
            # Kiểm tra xem link này đã từng xử lý chưa (optionally skip)
            # existing = db.query(ArticleHistory).filter(ArticleHistory.url == link, ArticleHistory.config_id == config_id).first()
            # if existing: continue

            # Tạo record lịch sử PENDING
            new_history = ArticleHistory(
                config_id=config_id,
                url=link,
                status="PENDING",
                progress=0.0
            )
            db.add(new_history)
            db.commit()
            db.refresh(new_history)
            
            # Khởi chạy task xử lý lẻ bài viết này
            process_single_article.delay(new_history.id)
            task_results.append(new_history.id)
            
        return {"status": "started", "articles_queued": len(task_results), "ids": task_results}
    finally:
        db.close()


@celery_app.task(bind=True)
def process_single_article(self, history_id: int):
    """Nhiệm vụ chính: CRAWLING -> SUMMARIZING -> SAVING -> COMPLETED"""
    StateService.update_article_state(history_id, "CRAWLING", 0.25)
    
    db = SessionLocal()
    history = db.query(ArticleHistory).get(history_id)
    if not history:
        return {"status": "failed", "error": "History record not found"}
    url = history.url
    db.close()

    # Bước 1: Cào nội dung
    raw_text = CrawlerService.crawl_article(url)
    if not raw_text:
        StateService.update_article_state(history_id, "FAILED", 0.0)
        return {"status": "failed", "error": "Crawl failed"}
        
    # Bước 2: Tóm tắt
    StateService.update_article_state(history_id, "SUMMARIZING", 0.50)
    summary = AIService.summarize(raw_text)
    if not summary:
        StateService.update_article_state(history_id, "FAILED", 0.0)
        return {"status": "failed", "error": "AI summarize failed"}
        
    # Bước 3: Lưu lại
    StateService.update_article_state(history_id, "SAVING", 0.75)
    # Chúng ta trích xuất tạm Title từ 100 ký tự đầu của raw_text hoặc để crawler làm kỹ hơn
    title = raw_text[:100].strip().replace("\n", " ")
    
    StateService.update_article_state(history_id, "COMPLETED", 1.0, title=title, summary=summary)
    
    return {"status": "success", "id": history_id}
