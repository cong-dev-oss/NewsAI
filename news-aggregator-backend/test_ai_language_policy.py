from pathlib import Path


ROOT = Path(__file__).resolve().parent
AI_SERVICE_FILE = ROOT / "app" / "services" / "ai_service.py"
STORY_SERVICE_FILE = ROOT / "app" / "services" / "story_generation_service.py"


def test_summary_prompt_is_strict_vietnamese() -> None:
    text = AI_SERVICE_FILE.read_text(encoding="utf-8")
    assert "BAT BUOC CHI DUNG TIENG VIET" in text
    assert "KHONG DUOC TRA VE CAU TIENG ANH" in text


def test_story_prompt_is_strict_vietnamese() -> None:
    text = STORY_SERVICE_FILE.read_text(encoding="utf-8")
    assert "BAT BUOC viet bang tieng Viet" in text


if __name__ == "__main__":
    test_summary_prompt_is_strict_vietnamese()
    test_story_prompt_is_strict_vietnamese()
    print("ai language policy checks passed")
