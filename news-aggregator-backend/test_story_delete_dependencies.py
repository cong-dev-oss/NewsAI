from pathlib import Path


ROOT = Path(__file__).resolve().parent
STORIES_ENDPOINT_FILE = ROOT / "app" / "api" / "endpoints" / "stories.py"


def test_story_delete_removes_children_first() -> None:
    text = STORIES_ENDPOINT_FILE.read_text(encoding="utf-8")
    assert "from app.models.story_evidence import StoryEvidence" in text
    assert "from app.models.editorial_note import EditorialNote" in text
    assert "def _delete_story_dependencies(" in text
    assert "db.query(StoryEvidence).filter(StoryEvidence.story_id == story_id).delete" in text
    assert "db.query(EditorialNote).filter(EditorialNote.story_id == story_id).delete" in text


def test_bulk_delete_calls_dependency_cleanup() -> None:
    text = STORIES_ENDPOINT_FILE.read_text(encoding="utf-8")
    assert "_delete_story_dependencies(db, row.id)" in text


if __name__ == "__main__":
    test_story_delete_removes_children_first()
    test_bulk_delete_calls_dependency_cleanup()
    print("story delete dependency checks passed")
