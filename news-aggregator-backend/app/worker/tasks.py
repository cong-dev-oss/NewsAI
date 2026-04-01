import asyncio
from .celery_app import celery_app
from app.services.crawler_service import crawler_service
from app.services.ai_service import ai_service
from app.services.article_service import article_service
from app.core.database import SessionLocal
import datetime

@celery_app.task(name="crawl_and_process_news_task")
def crawl_and_process_news_task(source_url: str, category: str = "Tin tức"):
    """Task xử lý đơn lẻ cho một bài báo"""
    loop = asyncio.get_event_loop()
    if loop.is_closed():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    return loop.run_until_complete(_crawl_and_process_flow(source_url, category))

@celery_app.task(name="crawl_hacker_news_tech_task")
def crawl_hacker_news_tech_task(limit: int = 10):
    """Task đặc thù cho Hacker News (10 bài/ngày)"""
    loop = asyncio.get_event_loop()
    if loop.is_closed():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    
    stories = loop.run_until_complete(crawler_service.get_hacker_news_top_stories(limit))
    results = []
    for story in stories:
        # Gửi vào queue từng bài để không làm treo worker
        results.append(crawl_and_process_news_task.delay(story['url'], "Công nghệ"))
    return len(results)

@celery_app.task(name="crawl_rss_category_task")
def crawl_rss_category_task(rss_url: str, category: str, limit: int = 5):
    """Task lấy tin theo chuyên mục từ RSS (5 bài/ngày)"""
    # Logic nạp nhanh RSS lấy danh sách URL
    import httpx
    from bs4 import BeautifulSoup
    
    import warnings
    from bs4 import XMLParsedAsHTMLWarning
    warnings.filterwarnings("ignore", category=XMLParsedAsHTMLWarning)

    try:
        resp = httpx.get(rss_url)
        # Sử dụng lxml để đọc XML chuẩn xác nhất
        soup = BeautifulSoup(resp.content, "xml")
        items = soup.find_all("item")[:limit]
        print(f"📡 [RSS] Tìm thấy {len(items)} bài viết tại {rss_url}")
        
        count = 0
        for item in items:
            link = item.link.text if item.link else None
            if link:
                crawl_and_process_news_task.delay(link, category)
                count += 1
        return count
    except Exception as e:
        print(f"Error RSS {category}: {e}")
        return 0

async def _crawl_and_process_flow(source_url: str, category: str):
    # Step 1: Crawl
    raw_article = await crawler_service.extract_content(source_url)
    if not raw_article:
        return {"status": "error", "message": f"Couldn't crawl {source_url}"}
        
    # Step 2: Translate Title (Dịch sang và Lọc rác AI)
    raw_title = await ai_service.translate_title(raw_article['title'])
    title_vn = "\n".join([line for line in raw_title.split('\n') if not any(k in line for k in ["Nhiệm vụ:", "HÀNH ĐỘNG:", "Dịch là:", "Kết quả:"])]).strip()
    
    # Step 3: Dịch nội dung và Lọc rác bài báo
    raw_content_vn = await ai_service.translate_text(raw_article['content'])
    content_vn = "\n".join([line for line in raw_content_vn.split('\n') if not any(k in line for k in ["QUY TẮC:", "HÀNH ĐỘNG:", "Dịch thuật:", "Văn bản gốc:"])]).strip()
        
    # Step 4: Summarize AI (Dịch & Tóm tắt AI)
    summary = await ai_service.summarize_text(content_vn) 
    if not summary:
        summary = content_vn[:200] + "..." 
        
    # Step 5: Image
    image_url = raw_article.get('image_url') or await ai_service.generate_image(summary)
        
    # Step 6: Save to Database
    db = SessionLocal()
    try:
        from app.domain.schemas.article import ArticleCreate 
        from app.domain.models.article import Source
        
        # Tìm hoặc tạo Source dựa trên URL
        domain = source_url.split('/')[2]
        source = db.query(Source).filter(Source.base_url.contains(domain)).first()
        if not source:
            source = Source(name=domain, base_url=f"https://{domain}")
            db.add(source)
            db.commit()
            db.refresh(source)
            
        article_data = ArticleCreate(
            title=title_vn, # Sử dụng tiêu đề đã dịch
            content=content_vn, # Sử dụng nội dung đã dịch
            category=category,
            url=raw_article['url'],
            image_url=image_url,
            source_id=source.id
        )
        
        db_article = article_service.save_article(db, article_data)
        article_service.mark_processed(db, db_article.id, summary, image_url)
        return {"status": "success", "article_id": db_article.id}
    except Exception as e:
        print(f"Error saving to DB: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()
