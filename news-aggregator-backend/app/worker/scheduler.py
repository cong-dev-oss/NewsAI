from .celery_app import celery_app
from celery.schedules import crontab

# Configure periodic tasks (Celery Beat)
celery_app.conf.beat_schedule = {
    # 10 bài Công nghệ từ Hacker News mỗi ngày (6:00 AM)
    'crawl-tech-hacker-news': {
        'task': 'crawl_hacker_news_tech_task',
        'schedule': crontab(hour=6, minute=0),
        'args': (10,),
    },
    # 5 bài Thế giới mỗi ngày (6:05 AM)
    'crawl-world-news': {
        'task': 'crawl_rss_category_task',
        'schedule': crontab(hour=6, minute=5),
        'args': ('https://vnexpress.net/rss/the-gioi.rss', 'Thế giới', 5),
    },
    # 5 bài Chính trị/Thời sự mỗi ngày (6:10 AM)
    'crawl-politics-news': {
        'task': 'crawl_rss_category_task',
        'schedule': crontab(hour=6, minute=10),
        'args': ('https://vnexpress.net/rss/thoi-su.rss', 'Chính trị', 5),
    },
    # 5 bài Kinh tế mỗi ngày (6:15 AM)
    'crawl-economy-news': {
        'task': 'crawl_rss_category_task',
        'schedule': crontab(hour=6, minute=15),
        'args': ('https://vnexpress.net/rss/kinh-doanh.rss', 'Kinh tế', 5),
    },
    # 5 bài Khoa học mỗi ngày (6:20 AM)
    'crawl-science-news': {
        'task': 'crawl_rss_category_task',
        'schedule': crontab(hour=6, minute=20),
        'args': ('https://vnexpress.net/rss/khoa-hoc.rss', 'Khoa học', 5),
    },
    # 5 bài Sức khỏe mỗi ngày (6:25 AM)
    'crawl-health-news': {
        'task': 'crawl_rss_category_task',
        'schedule': crontab(hour=6, minute=25),
        'args': ('https://vnexpress.net/rss/suc-khoe.rss', 'Sức khỏe', 5),
    },
}
