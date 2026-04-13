from app.core.database import SessionLocal
from app.models.topic import Topic
from app.models.signal_source import SignalSource
from app.models.topic_source_config import TopicSourceConfig

db = SessionLocal()
try:
    default_sources = [
        ("newsdata", "NewsData.io", "https://newsdata.io"),
        ("gnews", "GNews", "https://gnews.io"),
        ("trading_economics", "Trading Economics", "https://api.tradingeconomics.com"),
    ]
    for source_type, name, base_url in default_sources:
        existing_source = (
            db.query(SignalSource).filter(SignalSource.source_type == source_type).first()
        )
        if existing_source:
            continue
        db.add(
            SignalSource(
                source_type=source_type,
                name=name,
                base_url=base_url,
                is_active=True,
            )
        )

    default_topics = ["Kinh te", "Cong nghe", "Thi truong"]
    for topic_name in default_topics:
        existing_topic = db.query(Topic).filter(Topic.name == topic_name).first()
        if existing_topic:
            continue
        db.add(Topic(name=topic_name))

    db.commit()

    topics = db.query(Topic).all()
    sources = db.query(SignalSource).all()
    for topic in topics:
        for source in sources:
            pair = (
                db.query(TopicSourceConfig)
                .filter(
                    TopicSourceConfig.topic_id == topic.id,
                    TopicSourceConfig.source_type == source.source_type,
                )
                .first()
            )
            if pair:
                continue
            db.add(
                TopicSourceConfig(
                    topic_id=topic.id,
                    signal_source_id=source.id,
                    source_type=source.source_type,
                    is_active=True,
                    schedule_cron="0 2 * * *",
                    fetch_limit=20,
                    pick_limit=8,
                    priority_weight=100,
                )
            )

    db.commit()
    print("Seeded default newsroom sources, topics, and pipeline configs.")
except Exception as e:
    print(f"Seed failed: {e}")
finally:
    db.close()
