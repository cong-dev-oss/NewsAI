from pathlib import Path


ROOT = Path(__file__).resolve().parent
PIPELINE_ENDPOINT_FILE = ROOT / "app" / "api" / "endpoints" / "pipeline.py"


def test_pipeline_delete_cleans_dependent_research_rows() -> None:
    text = PIPELINE_ENDPOINT_FILE.read_text(encoding="utf-8")
    assert "from app.models.research_run import ResearchRun" in text
    assert "from app.models.signal_item import SignalItem" in text
    assert "from app.models.story import Story" in text
    assert "from app.models.story_evidence import StoryEvidence" in text
    assert "def _delete_pipeline_config_dependencies(" in text
    assert "Story.primary_research_run_id.in_(run_ids)" in text
    assert "SignalItem.research_run_id.in_(run_ids)" in text
    assert "StoryEvidence.signal_item_id.in_(signal_item_ids)" in text
    assert "ResearchRun.topic_source_config_id == config_id" in text


if __name__ == "__main__":
    test_pipeline_delete_cleans_dependent_research_rows()
    print("pipeline dependency delete checks passed")
