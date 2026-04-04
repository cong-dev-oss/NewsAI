from app.core.celery_app import celery_app
from app.services.crawler_service import CrawlerService
from app.services.ai_service import AIService
from app.services.tts_service import TTSService
from app.services.state_service import StateService
from app.core.database import SessionLocal
from app.models.config import SourceTopicConfig
from app.models.article_history import ArticleHistory
from app.models.user import User
from app.models.source import Source
from app.models.topic import Topic
from app.models.article import Article, JobHistory
from app.core.config import settings
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


from app.services.state_service import StateService

@celery_app.task(bind=True)
def process_single_article(self, history_id: int):
    """Nhiệm vụ chính: CRAWLING -> SUMMARIZING -> SAVING -> COMPLETED"""
    db = SessionLocal()
    history = db.query(ArticleHistory).get(history_id)
    if not history:
        db.close()
        return {"status": "error", "message": "History not found"}
    
    url = history.url
    config_id = history.config_id
    source_id = history.config.source_id
    category_name = history.config.topic.name if history.config and history.config.topic else None
    db.close()

    try:
        # Step 1: Crawl (20%)
        StateService.update_article_state(history_id, "CRAWLING", 0.20)
        crawl_data = CrawlerService.crawl_article(url)
        raw_text = crawl_data["content"]
        article_title = crawl_data["title"] or "Untitled Article"
        image_url = crawl_data["image_url"]

        if not raw_text or len(raw_text) < 100:
            StateService.update_article_state(history_id, "FAILED", 1.0, title=article_title)
            return {"status": "failed", "message": "Content too short"}

        # Step 2: Summarize (50%)
        StateService.update_article_state(history_id, "SUMMARIZING", 0.50, title=article_title)
        
        summary = ""
        max_retries = 2
        for attempt in range(max_retries + 1):
            try:
                # AIService.summarize là hàm đồng bộ (sync), gọi trực tiếp
                summary = AIService.summarize(raw_text)
                if summary: break
            except Exception as e:
                print(f"Summarize attempt {attempt + 1}/{max_retries + 1} failed: {e}")
                if attempt == max_retries: raise e
                time.sleep(2)

        if not summary:
            summary = AIService.build_fallback_summary(raw_text)

        # Step 3: Generate Audio from TTS (70%)
        StateService.update_article_state(history_id, "GENERATING_AUDIO", 0.70, title=article_title)
        audio_url = TTSService.generate_audio(summary)

        # Step 4: Save to DB (90%)
        StateService.update_article_state(history_id, "SAVING", 0.90, title=article_title)
        
        db = SessionLocal()
        # Save the actual article
        article = Article(
            source_id=source_id,
            title=article_title,
            category=category_name,
            content=raw_text,
            summary=summary,
            url=url,
            image_url=image_url,
            audio_url=audio_url,
            is_processed=True,
        )
        db.add(article)
        db.commit()
        db.refresh(article)
        db.close()

        # Step 4: Complete (100%)
        StateService.update_article_state(history_id, "COMPLETED", 1.0, title=article_title, summary=summary)
        return {"status": "success", "article_id": article.id}

    except Exception as e:
        print(f"Error processing article {url}: {e}")
        StateService.update_article_state(history_id, "FAILED", 1.0, title="Error Processing")
        return {"status": "error", "message": str(e)}

from app.services.research_service import ResearchService

@celery_app.task(bind=True)
def run_tech_research_task(self, topic: str):
    """
    Task chạy định kỳ (1 ngày 1 lần theo cấu hình)
    để nghiên cứu và tổng hợp bài báo cáo công nghệ mới nhất.
    """
    db = SessionLocal()
    try:
        # Gọi tool Last30days-skill (qua ResearchService)
        raw_report = ResearchService.run_last_30_days_research(topic)
        
        # Tóm tắt và tạo CSS
        summary = AIService.summarize(raw_report)
        audio_url = TTSService.generate_audio(summary)
        
        # Tìm source default hoặc source ID riêng cho phân mục Nghiên Cứu
        source = db.query(Source).filter_by(name="Last30Days-Research").first()
        if not source:
            source = Source(name="Last30Days-Research", url=settings.LAST30DAYS_REPO_URL, selector_config="none")
            db.add(source)
            db.commit()
            db.refresh(source)
            
        research_article = Article(
            source_id=source.id,
            title=f"Tech Summary: {topic}",
            category="Tech Summary",
            content=raw_report,
            summary=summary,
            audio_url=audio_url,
            url=f"research://{topic.replace(' ', '-').lower()}-{int(time.time())}",
            image_url="",
            is_processed=True,
        )
        db.add(research_article)
        db.commit()
        db.refresh(research_article)
        
        return {"status": "success", "article_id": research_article.id}
    except Exception as e:
        print(f"Error running tech research task: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()
