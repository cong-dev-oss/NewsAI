from pathlib import Path


ROOT = Path(__file__).resolve().parent
CONFIG_FILE = ROOT / "app" / "core" / "config.py"
TASKS_FILE = ROOT / "app" / "worker" / "tasks.py"
INGESTION_FILE = ROOT / "app" / "services" / "signal_ingestion_service.py"


def test_auto_publish_setting_exists() -> None:
    text = CONFIG_FILE.read_text(encoding="utf-8")
    assert "AUTO_PUBLISH_STORIES" in text


def test_tasks_assign_story_status_from_auto_publish_toggle() -> None:
    text = TASKS_FILE.read_text(encoding="utf-8")
    assert "status=\"published\" if settings.AUTO_PUBLISH_STORIES else \"draft\"" in text
    assert "published_at=datetime.utcnow() if settings.AUTO_PUBLISH_STORIES else None" in text


def test_signal_ingestion_preserves_image_url() -> None:
    text = INGESTION_FILE.read_text(encoding="utf-8")
    assert "\"image_url\":" in text


def test_tasks_set_hero_image_from_signals() -> None:
    text = TASKS_FILE.read_text(encoding="utf-8")
    assert "hero_image=_pick_story_hero_image(selected_signals)" in text


if __name__ == "__main__":
    test_auto_publish_setting_exists()
    test_tasks_assign_story_status_from_auto_publish_toggle()
    test_signal_ingestion_preserves_image_url()
    test_tasks_set_hero_image_from_signals()
    print("story auto-publish and image checks passed")
