from typing import Any, Dict, List


class StoryGenerationService:
    @staticmethod
    def build_story_payload(topic_name: str, story_type: str, top_signals: List[Dict[str, Any]]) -> Dict[str, str]:
        lines = []
        for item in top_signals:
            title = str(item.get("title") or "").strip()
            excerpt = str(item.get("excerpt") or "").strip()
            if not title:
                continue
            lines.append(f"- {title}: {excerpt}")

        evidence_block = "\n".join(lines) if lines else "- No high-confidence signals available."
        prompt = (
            f"Viet bai {story_type} cho chu de '{topic_name}'.\n"
            "BAT BUOC viet bang tieng Viet, tru ten rieng/ten to chuc/ten san pham.\n"
            "Khong viet thanh cau tieng Anh hoan chinh.\n"
            "Uu tien su dung tieng Viet tu nhien, gon, trung lap toi thieu.\n"
            "Dung cac tin hieu bang chung sau:\n"
            f"{evidence_block}\n\n"
            "Tra ve plain text gom: tieu de ngan, tom tat 1-2 cau, va noi dung day du."
        )
        return {
            "story_type": story_type,
            "prompt": prompt,
        }
