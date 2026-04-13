import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.core.database import SessionLocal
from app.models.signal_source import SignalSource
from app.models.topic import Topic
from app.models.topic_source_config import TopicSourceConfig
from app.models.research_run import ResearchRun
from app.models.story import Story

db = SessionLocal()

print("--- Signal Sources ---")
sources = db.query(SignalSource).all()
print(f"Total signal sources: {len(sources)}")
for source in sources:
    print(f"ID: {source.id}, Type: {source.source_type}, Name: {source.name}")

print("\n--- Topics ---")
topics = db.query(Topic).all()
print(f"Total topics: {len(topics)}")
for topic in topics:
    print(f"ID: {topic.id}, Name: {topic.name}")

print("\n--- Pipeline Configs ---")
configs = db.query(TopicSourceConfig).all()
print(f"Total pipeline configs: {len(configs)}")
for config in configs:
    print(
        f"ID: {config.id}, TopicID: {config.topic_id}, SourceType: {config.source_type}, Cron: {config.schedule_cron}"
    )

print("\n--- Research Runs ---")
runs = db.query(ResearchRun).all()
print(f"Total research runs: {len(runs)}")

print("\n--- Stories ---")
stories = db.query(Story).all()
print(f"Total stories: {len(stories)}")

db.close()
