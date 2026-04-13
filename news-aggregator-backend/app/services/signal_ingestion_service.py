from datetime import datetime
from typing import Any, Dict, List, Optional


class SignalIngestionService:
    SCHEMA_SHORT_TEXT_LIMIT = 16

    @staticmethod
    def _clean_text(value: Any) -> str:
        if value is None:
            return ""
        return str(value).strip()

    @staticmethod
    def _to_scalar(value: Any) -> Optional[str]:
        if value is None:
            return None
        if isinstance(value, list):
            if not value:
                return None
            return SignalIngestionService._clean_text(value[0]) or None
        text = SignalIngestionService._clean_text(value)
        return text or None

    @staticmethod
    def _to_limited_scalar(value: Any, max_length: int) -> Optional[str]:
        text = SignalIngestionService._to_scalar(value)
        if not text:
            return None
        return text[:max_length]

    @staticmethod
    def _parse_published_at(value: Any) -> Optional[datetime]:
        if not value:
            return None
        if isinstance(value, datetime):
            return value
        if isinstance(value, (int, float)):
            try:
                return datetime.fromtimestamp(value)
            except (ValueError, OSError):
                return None
        if isinstance(value, str):
            candidate = value.strip()
            if not candidate:
                return None
            if candidate.endswith("Z"):
                candidate = candidate.replace("Z", "+00:00")
            try:
                return datetime.fromisoformat(candidate)
            except ValueError:
                return None
        return None

    @staticmethod
    def _normalize_source_key(source_type: str) -> str:
        value = (source_type or "").lower()
        if "newsdata" in value:
            return "newsdata"
        if "gnews" in value:
            return "gnews"
        if "tradingeconomics" in value or "trading_economics" in value:
            return "tradingeconomics"
        return "custom"

    @staticmethod
    def _normalize_newsdata(item: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "title": SignalIngestionService._clean_text(item.get("title")),
            "excerpt": SignalIngestionService._clean_text(
                item.get("description") or item.get("content")
            ),
            "image_url": SignalIngestionService._clean_text(item.get("image_url") or item.get("image")),
            "original_url": SignalIngestionService._clean_text(item.get("url") or item.get("link")),
            "published_at": SignalIngestionService._parse_published_at(
                item.get("published_at") or item.get("pubDate")
            ),
            "source_name": SignalIngestionService._to_scalar(
                item.get("source_name") or item.get("source_id")
            ),
            "language": SignalIngestionService._to_limited_scalar(
                item.get("language"), SignalIngestionService.SCHEMA_SHORT_TEXT_LIMIT
            ),
            "country": SignalIngestionService._to_limited_scalar(
                item.get("country"), SignalIngestionService.SCHEMA_SHORT_TEXT_LIMIT
            ),
        }

    @staticmethod
    def _normalize_gnews(item: Dict[str, Any]) -> Dict[str, Any]:
        source_data = item.get("source", {}) if isinstance(item.get("source"), dict) else {}
        return {
            "title": SignalIngestionService._clean_text(item.get("title")),
            "excerpt": SignalIngestionService._clean_text(
                item.get("description") or item.get("content")
            ),
            "image_url": SignalIngestionService._clean_text(item.get("image_url") or item.get("image")),
            "original_url": SignalIngestionService._clean_text(item.get("url")),
            "published_at": SignalIngestionService._parse_published_at(
                item.get("published_at") or item.get("publishedAt")
            ),
            "source_name": SignalIngestionService._to_scalar(
                item.get("source_name") or source_data.get("name")
            ),
            "language": SignalIngestionService._to_limited_scalar(
                item.get("language"), SignalIngestionService.SCHEMA_SHORT_TEXT_LIMIT
            ),
            "country": SignalIngestionService._to_limited_scalar(
                item.get("country"), SignalIngestionService.SCHEMA_SHORT_TEXT_LIMIT
            ),
        }

    @staticmethod
    def _normalize_trading_economics(item: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "title": SignalIngestionService._clean_text(item.get("title")),
            "excerpt": SignalIngestionService._clean_text(
                item.get("description") or item.get("content")
            ),
            "image_url": SignalIngestionService._clean_text(item.get("image_url") or item.get("image")),
            "original_url": SignalIngestionService._clean_text(item.get("url")),
            "published_at": SignalIngestionService._parse_published_at(
                item.get("published_at") or item.get("date")
            ),
            "source_name": SignalIngestionService._to_scalar(
                item.get("source_name") or item.get("source")
            ),
            "language": SignalIngestionService._to_limited_scalar(
                item.get("language"), SignalIngestionService.SCHEMA_SHORT_TEXT_LIMIT
            ),
            "country": SignalIngestionService._to_limited_scalar(
                item.get("country"), SignalIngestionService.SCHEMA_SHORT_TEXT_LIMIT
            ),
        }

    @staticmethod
    def _normalize_generic(item: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "title": SignalIngestionService._clean_text(item.get("title")),
            "excerpt": SignalIngestionService._clean_text(
                item.get("excerpt") or item.get("description") or item.get("content")
            ),
            "image_url": SignalIngestionService._clean_text(
                item.get("image_url") or item.get("image") or item.get("thumbnail")
            ),
            "original_url": SignalIngestionService._clean_text(
                item.get("original_url") or item.get("url")
            ),
            "published_at": SignalIngestionService._parse_published_at(item.get("published_at")),
            "source_name": SignalIngestionService._to_scalar(item.get("source_name")),
            "language": SignalIngestionService._to_limited_scalar(
                item.get("language"), SignalIngestionService.SCHEMA_SHORT_TEXT_LIMIT
            ),
            "country": SignalIngestionService._to_limited_scalar(
                item.get("country"), SignalIngestionService.SCHEMA_SHORT_TEXT_LIMIT
            ),
        }

    @classmethod
    def normalize_items(
        cls,
        source_type: str,
        topic_name: str,
        items: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        source_key = cls._normalize_source_key(source_type)
        normalized: List[Dict[str, Any]] = []

        for item in items or []:
            if not isinstance(item, dict):
                continue

            if source_key == "newsdata":
                signal = cls._normalize_newsdata(item)
            elif source_key == "gnews":
                signal = cls._normalize_gnews(item)
            elif source_key == "tradingeconomics":
                signal = cls._normalize_trading_economics(item)
            else:
                signal = cls._normalize_generic(item)

            if not signal.get("title"):
                continue

            signal["source_type"] = source_type
            signal["topic_name"] = topic_name
            signal["raw_payload"] = item
            normalized.append(signal)

        return normalized
