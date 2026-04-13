"""Schema sanity checks for research-first newsroom models."""

from app.models.topic_source_config import TopicSourceConfig
from app.models.research_run import ResearchRun
from app.models.signal_item import SignalItem
from app.models.story import Story


def main() -> None:
    assert TopicSourceConfig.__tablename__ == "topic_source_configs"
    assert ResearchRun.__tablename__ == "research_runs"
    assert SignalItem.__tablename__ == "signal_items"
    assert Story.__tablename__ == "stories"
    print("schema-ok")


if __name__ == "__main__":
    main()
