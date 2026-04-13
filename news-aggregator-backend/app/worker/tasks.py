from datetime import datetime
import re
import time
from typing import Any, Dict, Optional

import app.models  # noqa: F401  # Ensure SQLAlchemy model registry is fully loaded in workers.
from app.core.celery_app import celery_app
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.config import SourceTopicConfig
from app.models.research_run import ResearchRun
from app.models.signal_item import SignalItem
from app.models.story import Story
from app.models.story_evidence import StoryEvidence
from app.models.topic_source_config import TopicSourceConfig
from app.services.ai_service import AIService
from app.services.news_api_service import NewsAPIService
from app.services.signal_ingestion_service import SignalIngestionService
from app.services.signal_scoring_service import SignalScoringService
from app.services.story_generation_service import StoryGenerationService


def _detect_source_type(identifier: str) -> str:
    value = (identifier or "").lower()
    if "newsdata" in value:
        return "newsdata"
    if "gnews" in value:
        return "gnews"
    if "tradingeconomics" in value:
        return "tradingeconomics"
    return "custom"


def _coerce_extra_params(extra_params: Any) -> Dict[str, Any]:
    if isinstance(extra_params, dict):
        return extra_params
    return {}


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", (value or "").lower()).strip("-")
    return slug or "story"


def _make_unique_slug(db, base_slug: str, run_id: int, index: int) -> str:
    candidate = f"{base_slug}-{run_id}-{index}"
    while db.query(Story).filter(Story.slug == candidate).first():
        candidate = f"{candidate}-{int(time.time())}"
    return candidate


def _normalize_image_url(value: Any) -> Optional[str]:
    candidate = str(value or "").strip()
    if not candidate:
        return None
    if candidate.startswith("//"):
        return f"https:{candidate}"
    if candidate.startswith("http://") or candidate.startswith("https://"):
        return candidate
    return None


def _extract_image_from_payload(payload: Any) -> Optional[str]:
    if not isinstance(payload, dict):
        return None

    direct_keys = (
        "image_url",
        "image",
        "urlToImage",
        "imageUrl",
        "thumbnail",
        "thumb",
    )
    for key in direct_keys:
        url = _normalize_image_url(payload.get(key))
        if url:
            return url

    media = payload.get("media")
    if isinstance(media, list):
        for item in media:
            url = _extract_image_from_payload(item)
            if url:
                return url
    elif isinstance(media, dict):
        url = _extract_image_from_payload(media)
        if url:
            return url

    enclosure = payload.get("enclosure")
    if isinstance(enclosure, dict):
        url = _extract_image_from_payload(enclosure)
        if url:
            return url

    return None


def _pick_story_hero_image(selected_signals: list[dict]) -> Optional[str]:
    for signal in selected_signals:
        direct_url = _normalize_image_url(signal.get("image_url"))
        if direct_url:
            return direct_url

        raw_payload_url = _extract_image_from_payload(signal.get("raw_payload"))
        if raw_payload_url:
            return raw_payload_url
    return None


def _map_legacy_config(db, config_id: int) -> Optional[TopicSourceConfig]:
    legacy_config = db.query(SourceTopicConfig).filter(SourceTopicConfig.id == config_id).first()
    if not legacy_config:
        return None

    source_identifier = ""
    if legacy_config.source and legacy_config.source.base_url:
        source_identifier = legacy_config.source.base_url
    elif legacy_config.source and legacy_config.source.name:
        source_identifier = legacy_config.source.name
    source_type = _detect_source_type(source_identifier)

    mapped = (
        db.query(TopicSourceConfig)
        .filter(
            TopicSourceConfig.topic_id == legacy_config.topic_id,
            TopicSourceConfig.source_type == source_type,
        )
        .first()
    )
    if mapped:
        return mapped

    legacy_extra_params: Dict[str, Any] = {}
    if legacy_config.url:
        legacy_extra_params["url"] = legacy_config.url

    mapped = TopicSourceConfig(
        topic_id=legacy_config.topic_id,
        source_type=source_type,
        is_active=legacy_config.is_active,
        fetch_limit=max(int(legacy_config.article_limit or 20), 1),
        pick_limit=min(max(int(legacy_config.article_limit or 8), 1), 8),
        schedule_cron=legacy_config.cron_config or "0 2 * * *",
        priority_weight=100,
        extra_params=legacy_extra_params or None,
    )
    db.add(mapped)
    db.commit()
    db.refresh(mapped)
    return mapped


def _create_story_with_evidence(
    db,
    *,
    run: ResearchRun,
    config: TopicSourceConfig,
    topic_name: str,
    story_type: str,
    index: int,
    selected_signals: list[dict],
    created_signal_items: list[SignalItem],
) -> None:
    payload = StoryGenerationService.build_story_payload(
        topic_name=topic_name,
        story_type=story_type,
        top_signals=selected_signals,
    )
    generated = AIService.generate_story_draft(payload["prompt"], story_type=story_type)

    title = generated.get("title") or f"{topic_name} {story_type} {index}"
    slug = _make_unique_slug(db, _slugify(title), run.id, index)
    summary = generated.get("summary") or ""
    body = generated.get("body") or payload["prompt"]

    story = Story(
        topic_id=config.topic_id,
        primary_research_run_id=run.id,
        story_type=story_type,
        status="published" if settings.AUTO_PUBLISH_STORIES else "draft",
        title=title,
        slug=slug,
        summary=summary,
        body=body,
        hero_image=_pick_story_hero_image(selected_signals),
        published_at=datetime.utcnow() if settings.AUTO_PUBLISH_STORIES else None,
    )
    db.add(story)
    db.flush()

    max_evidence = min(len(created_signal_items), max(int(config.pick_limit or 0), 0))
    for evidence_index in range(max_evidence):
        signal_item = created_signal_items[evidence_index]
        db.add(
            StoryEvidence(
                story_id=story.id,
                signal_item_id=signal_item.id,
                evidence_order=evidence_index,
                excerpt_used=signal_item.excerpt,
            )
        )


def _run_topic_source_research(
    topic_source_config_id: int,
    trigger_mode: str = "scheduled",
    allow_legacy_mapping: bool = False,
) -> Dict[str, Any]:
    db = SessionLocal()
    run: Optional[ResearchRun] = None
    try:
        config = (
            db.query(TopicSourceConfig)
            .filter(TopicSourceConfig.id == topic_source_config_id)
            .first()
        )
        if not config and allow_legacy_mapping:
            config = _map_legacy_config(db, topic_source_config_id)
        if not config:
            return {"status": "skipped", "message": "TopicSourceConfig not found"}
        if not config.is_active:
            return {"status": "skipped", "message": "TopicSourceConfig is inactive"}

        run = ResearchRun(
            topic_source_config_id=config.id,
            topic_id=config.topic_id,
            trigger_mode=trigger_mode,
            status="running",
            started_at=datetime.utcnow(),
        )
        db.add(run)
        db.commit()
        db.refresh(run)

        raw_signals = NewsAPIService.fetch_signals(
            source_type=config.source_type,
            limit=max(int(config.fetch_limit or 20), 1),
            country=config.country,
            language=config.language,
            category=config.category,
            extra_params=_coerce_extra_params(config.extra_params),
        )
        topic_name = config.topic.name if config.topic else "General"
        normalized = SignalIngestionService.normalize_items(
            source_type=config.source_type,
            topic_name=topic_name,
            items=raw_signals,
        )
        selected = SignalScoringService.rank_signals(
            signals=normalized,
            priority_weight=int(config.priority_weight or 0),
            pick_limit=max(int(config.pick_limit or 0), 0),
        )

        created_signal_items: list[SignalItem] = []
        for signal in selected:
            signal_item = SignalItem(
                research_run_id=run.id,
                topic_id=config.topic_id,
                signal_source_id=config.signal_source_id,
                source_type=config.source_type,
                source_name=signal.get("source_name"),
                title=signal.get("title", ""),
                excerpt=signal.get("excerpt"),
                original_url=signal.get("original_url"),
                published_at=signal.get("published_at"),
                language=signal.get("language"),
                country=signal.get("country"),
                signal_score=signal.get("signal_score"),
                raw_payload=signal.get("raw_payload"),
            )
            db.add(signal_item)
            created_signal_items.append(signal_item)
        db.flush()

        story_counter = 0
        if config.story_roundup_enabled:
            for _ in range(max(int(config.roundup_count or 0), 0)):
                story_counter += 1
                _create_story_with_evidence(
                    db,
                    run=run,
                    config=config,
                    topic_name=topic_name,
                    story_type="roundup",
                    index=story_counter,
                    selected_signals=selected,
                    created_signal_items=created_signal_items,
                )
        if config.story_deep_dive_enabled:
            for _ in range(max(int(config.deep_dive_count or 0), 0)):
                story_counter += 1
                _create_story_with_evidence(
                    db,
                    run=run,
                    config=config,
                    topic_name=topic_name,
                    story_type="deep_dive",
                    index=story_counter,
                    selected_signals=selected,
                    created_signal_items=created_signal_items,
                )

        run.raw_count = len(normalized)
        run.selected_count = len(selected)
        run.status = "completed"
        run.summary = (
            f"Ingested {run.raw_count} signals from {config.source_type}; "
            f"selected {run.selected_count} by score."
        )
        run.finished_at = datetime.utcnow()
        db.commit()

        return {
            "status": "success",
            "research_run_id": run.id,
            "raw_count": run.raw_count,
            "selected_count": run.selected_count,
            "stories_created": story_counter,
        }
    except Exception as exc:
        db.rollback()
        if run:
            run.status = "failed"
            run.error_message = str(exc)
            run.finished_at = datetime.utcnow()
            db.add(run)
            db.commit()
        return {"status": "error", "message": str(exc), "research_run_id": run.id if run else None}
    finally:
        db.close()


@celery_app.task(bind=True)
def run_topic_source_research(self, topic_source_config_id: int):
    return _run_topic_source_research(topic_source_config_id=topic_source_config_id)


@celery_app.task(bind=True)
def run_config_fetch(self, config_id: int):
    # Legacy task wrapper for old scheduler/api code paths.
    return _run_topic_source_research(
        topic_source_config_id=config_id,
        trigger_mode="legacy",
        allow_legacy_mapping=True,
    )


@celery_app.task(bind=True)
def run_tech_research_task(self, topic: str):
    from app.services.research_service import ResearchService

    try:
        raw_report = ResearchService.run_last_30_days_research(topic)
        return {
            "status": "success",
            "topic": topic,
            "report_length": len(raw_report or ""),
        }
    except Exception as exc:
        print(f"Error running tech research task: {exc}")
        return {"status": "error", "message": str(exc)}
