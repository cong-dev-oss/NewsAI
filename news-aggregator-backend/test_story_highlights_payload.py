from pathlib import Path


ROOT = Path(__file__).resolve().parent
SCHEMA_FILE = ROOT / "app" / "schemas" / "story_schema.py"
ENDPOINT_FILE = ROOT / "app" / "api" / "endpoints" / "stories.py"


def test_story_schema_exposes_highlights_field() -> None:
    text = SCHEMA_FILE.read_text(encoding="utf-8")
    assert "class StoryHighlight(BaseModel):" in text
    assert "highlights: List[StoryHighlight] = []" in text


def test_story_endpoint_builds_highlights_from_evidence() -> None:
    text = ENDPOINT_FILE.read_text(encoding="utf-8")
    assert "highlights: list[StoryHighlight] = []" in text
    assert "def _translate_highlight_to_vietnamese" in text
    assert "def _normalize_compare_text" in text
    assert "if _normalize_compare_text(translated_title) == _normalize_compare_text(translated_excerpt):" in text
    assert "\"highlights\": [item.model_dump() for item in highlights]" in text
    assert "return _to_story_read(story, include_highlights=True)" in text


if __name__ == "__main__":
    test_story_schema_exposes_highlights_field()
    test_story_endpoint_builds_highlights_from_evidence()
    print("story highlights payload checks passed")
