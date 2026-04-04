import httpx
import re
import time
from app.core.config import settings

class AIService:
    @staticmethod
    def _prepare_prompt_text(text: str) -> str:
        paragraphs = [part.strip() for part in text.splitlines() if part.strip()]
        if not paragraphs:
            return text[:settings.OPENAI_PROMPT_MAX_CHARS]

        # Ưu tiên đoạn mở đầu vì tin báo thường chứa ý chính ở phần đầu bài.
        compact_parts = []
        total_len = 0
        for paragraph in paragraphs:
            next_len = total_len + len(paragraph) + (1 if compact_parts else 0)
            if next_len > settings.OPENAI_PROMPT_MAX_CHARS:
                remaining = settings.OPENAI_PROMPT_MAX_CHARS - total_len
                if remaining > 80:
                    compact_parts.append(paragraph[:remaining].strip())
                break

            compact_parts.append(paragraph)
            total_len = next_len

        return "\n".join(compact_parts).strip()

    @staticmethod
    def build_fallback_summary(text: str) -> str:
        if not text:
            return ""

        cleaned_text = " ".join(text.split())
        sentences = re.split(r"(?<=[.!?])\s+", cleaned_text)
        selected = [sentence.strip() for sentence in sentences if sentence.strip()][:3]

        if selected:
            return " ".join(selected)

        return cleaned_text[:300].strip()

    @staticmethod
    def summarize(text: str) -> str:
        if not text:
            return ""

        if not settings.OPENAI_API_KEY:
            raise RuntimeError("Missing OPENAI_API_KEY for AIService")

        system_prompt = "Ban la tro ly tom tat tin tuc. Hay tom tat bai bao bang tieng Viet, dung 3 cau ngan, ro rang, khong mo dau, khong them tieu de."

        prompt_text = AIService._prepare_prompt_text(text)
        url = f"{settings.OPENAI_BASE_URL}/chat/completions"

        payload = {
            "model": settings.OPENAI_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt_text},
            ],
            "temperature": settings.OPENAI_TEMPERATURE,
            "max_completion_tokens": settings.OPENAI_MAX_COMPLETION_TOKENS,
        }

        timeout = httpx.Timeout(
            connect=10.0,
            write=30.0,
            read=settings.OPENAI_TIMEOUT_SECONDS,
            pool=10.0,
        )

        try:
            start_time = time.perf_counter()
            response = httpx.post(
                url,
                json=payload,
                timeout=timeout,
                headers={
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                },
            )
            elapsed = time.perf_counter() - start_time
            if response.status_code == 200:
                data = response.json()
                choices = data.get("choices") or []
                if not choices:
                    return ""

                message = choices[0].get("message") or {}
                return (message.get("content") or "").strip()
            else:
                raise RuntimeError(
                    f"OpenAI error {response.status_code} after {elapsed:.2f}s: {response.text[:300]}"
                )
        except httpx.TimeoutException as e:
            raise RuntimeError(
                f"AIService timeout after {settings.OPENAI_TIMEOUT_SECONDS:.0f}s "
                f"(model={settings.OPENAI_MODEL}, prompt_chars={len(prompt_text)})"
            ) from e
        except httpx.HTTPError as e:
            raise RuntimeError(f"AIService HTTP error: {e}") from e
