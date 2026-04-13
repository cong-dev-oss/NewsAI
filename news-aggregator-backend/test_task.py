from app.services.signal_ingestion_service import SignalIngestionService
from app.services.signal_scoring_service import SignalScoringService
from app.services.story_generation_service import StoryGenerationService
from app.worker.tasks import run_topic_source_research


def test_signal_normalization() -> None:
    signals = SignalIngestionService.normalize_items(
        source_type="newsdata",
        topic_name="Kinh te",
        items=[
            {
                "title": " GDP tang ",
                "description": "Tang truong manh",
                "url": "https://example.com/gdp",
                "language": "vi",
                "country": "vn",
            }
        ],
    )

    assert len(signals) == 1
    signal = signals[0]
    assert signal["title"] == "GDP tang"
    assert signal["excerpt"] == "Tang truong manh"
    assert signal["source_type"] == "newsdata"
    assert signal["topic_name"] == "Kinh te"
    assert signal["original_url"] == "https://example.com/gdp"
    assert signal["language"] == "vi"
    assert signal["country"] == "vn"
    assert isinstance(signal["raw_payload"], dict)


def test_signal_scoring() -> None:
    score = SignalScoringService.score_signal(
        {"title": "GDP tang", "excerpt": "Tang truong manh"},
        priority_weight=120,
    )
    assert score == 150


def test_task_exports() -> None:
    assert callable(run_topic_source_research)


def test_story_payload() -> None:
    payload = StoryGenerationService.build_story_payload(
        topic_name="Kinh te",
        story_type="roundup",
        top_signals=[{"title": "GDP tang", "excerpt": "Tang truong manh"}],
    )
    assert payload["story_type"] == "roundup"
    assert "GDP tang" in payload["prompt"]


if __name__ == "__main__":
    test_signal_normalization()
    test_signal_scoring()
    test_task_exports()
    test_story_payload()
    print("task checks passed")
