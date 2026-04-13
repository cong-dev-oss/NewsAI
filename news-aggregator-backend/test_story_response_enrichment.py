from pathlib import Path


ROOT = Path(__file__).resolve().parent
SCHEMA_FILE = ROOT / "app" / "schemas" / "story_schema.py"
ENDPOINT_FILE = ROOT / "app" / "api" / "endpoints" / "stories.py"


def test_story_schema_includes_topic_and_effective_image() -> None:
    text = SCHEMA_FILE.read_text(encoding="utf-8")
    assert "topic_name: Optional[str] = None" in text
    assert "effective_hero_image: Optional[str] = None" in text


def test_stories_endpoint_populates_enriched_story_fields() -> None:
    text = ENDPOINT_FILE.read_text(encoding="utf-8")
    assert "def _resolve_story_hero_image(" in text
    assert "def _to_story_read(" in text
    assert "\"topic_name\": story.topic.name if story.topic else None" in text
    assert "\"effective_hero_image\": effective_hero_image" in text


if __name__ == "__main__":
    test_story_schema_includes_topic_and_effective_image()
    test_stories_endpoint_populates_enriched_story_fields()
    print("story response enrichment checks passed")
