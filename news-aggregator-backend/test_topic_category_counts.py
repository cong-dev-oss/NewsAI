from pathlib import Path


ROOT = Path(__file__).resolve().parent
STORIES_ENDPOINT_FILE = ROOT / "app" / "api" / "endpoints" / "stories.py"
ARTICLES_ENDPOINT_FILE = ROOT / "app" / "api" / "v1" / "articles.py"


def test_stories_categories_group_by_topic_name() -> None:
    text = STORIES_ENDPOINT_FILE.read_text(encoding="utf-8")
    assert "db.query(Topic.name, func.count(Story.id).label(\"count\"))" in text
    assert ".group_by(Topic.name)" in text


def test_articles_filter_and_categories_use_topic_name() -> None:
    text = ARTICLES_ENDPOINT_FILE.read_text(encoding="utf-8")
    assert "query = db.query(Story).join(Story.topic)" in text
    assert "query = query.filter(Topic.name.ilike(category.strip()))" in text
    assert "db.query(Topic.name, func.count(Story.id).label(\"count\"))" in text


if __name__ == "__main__":
    test_stories_categories_group_by_topic_name()
    test_articles_filter_and_categories_use_topic_name()
    print("topic category count checks passed")
