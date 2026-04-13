from pathlib import Path


ROOT = Path(__file__).resolve().parent


def test_models_package_initializes_all_relational_models() -> None:
    models_init = ROOT / "app" / "models" / "__init__.py"
    assert models_init.exists(), "app/models/__init__.py must exist to initialize mapper registry"

    text = models_init.read_text(encoding="utf-8")
    required_imports = [
        "from app.models.source import Source",
        "from app.models.topic import Topic",
        "from app.models.config import SourceTopicConfig",
        "from app.models.topic_source_config import TopicSourceConfig",
    ]
    for line in required_imports:
        assert line in text, f"Missing model registry import: {line}"


def test_worker_tasks_bootstrap_model_registry() -> None:
    tasks_file = ROOT / "app" / "worker" / "tasks.py"
    text = tasks_file.read_text(encoding="utf-8")
    assert (
        "import app.models" in text or "from app import models" in text
    ), "worker tasks must import app.models to pre-register SQLAlchemy relationships"


if __name__ == "__main__":
    test_models_package_initializes_all_relational_models()
    test_worker_tasks_bootstrap_model_registry()
    print("worker model registration checks passed")
