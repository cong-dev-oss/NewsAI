import httpx
import urllib.parse
from typing import Any, Dict, List, Optional, Union

from app.core.config import settings

ParamInput = Union[str, Dict[str, Any], None]


class NewsAPIService:
    @staticmethod
    def _parse_query_params(params_input: ParamInput) -> Dict[str, Any]:
        if not params_input:
            return {}
        if isinstance(params_input, dict):
            return {key: value for key, value in params_input.items() if value is not None}
        if isinstance(params_input, str):
            return dict(urllib.parse.parse_qsl(params_input))
        return {}

    @staticmethod
    def _normalize_source_key(source_identifier: str) -> str:
        value = (source_identifier or "").lower()
        if "newsdata" in value:
            return "newsdata"
        if "gnews" in value:
            return "gnews"
        if "tradingeconomics" in value or "trading_economics" in value:
            return "tradingeconomics"
        return "custom"

    @staticmethod
    def _request_json(base_url: str, params: Dict[str, Any]) -> Any:
        try:
            response = httpx.get(base_url, params=params, timeout=15.0)
            if response.status_code != 200:
                print(f"API Error: Status {response.status_code} for {base_url}")
                print(f"Response Body: {response.text}")
                return {} # Return empty dict on error instead of raising to allow logs to persist
            return response.json()
        except Exception as exc:
            print(f"HTTP Request Exception: {exc}")
            return {}

    @staticmethod
    def fetch_newsdata(params_str: ParamInput, limit: int = 10) -> List[Dict]:
        if not settings.NEWSDATA_API_KEY:
            print("Warning: NEWSDATA_API_KEY not configured.")
            return []

        base_url = "https://newsdata.io/api/1/news"
        params = NewsAPIService._parse_query_params(params_str)
        params["apikey"] = settings.NEWSDATA_API_KEY
        params["size"] = min(limit, 10)

        try:
            data = NewsAPIService._request_json(base_url, params)
            results = data.get("results", []) if isinstance(data, dict) else []
            articles = []
            for item in results[:limit]:
                articles.append(
                    {
                        "title": item.get("title", ""),
                        "description": item.get("description", ""),
                        "content": item.get("content", ""),
                        "url": item.get("link", ""),
                        "image_url": item.get("image_url", ""),
                        "published_at": item.get("pubDate"),
                        "language": item.get("language"),
                        "country": item.get("country"),
                        "source_name": item.get("source_id") or item.get("source_name"),
                    }
                )
            return articles
        except Exception as exc:
            print(f"Exception calling NewsData: {exc}")
            return []

    @staticmethod
    def fetch_gnews(params_str: ParamInput, limit: int = 10) -> List[Dict]:
        if not settings.GNEWS_API_KEY:
            print("Warning: GNEWS_API_KEY not configured.")
            return []

        base_url = "https://gnews.io/api/v4/top-headlines"
        params = NewsAPIService._parse_query_params(params_str)
        params["apikey"] = settings.GNEWS_API_KEY
        params["max"] = limit

        try:
            data = NewsAPIService._request_json(base_url, params)
            results = data.get("articles", []) if isinstance(data, dict) else []
            articles = []
            for item in results[:limit]:
                source_data = item.get("source", {}) if isinstance(item.get("source"), dict) else {}
                articles.append(
                    {
                        "title": item.get("title", ""),
                        "description": item.get("description", ""),
                        "content": item.get("content", ""),
                        "url": item.get("url", ""),
                        "image_url": item.get("image", ""),
                        "published_at": item.get("publishedAt"),
                        "source_name": source_data.get("name"),
                    }
                )
            return articles
        except Exception as exc:
            print(f"Exception calling GNews: {exc}")
            return []

    @staticmethod
    def fetch_trading_economics(params_str: ParamInput, limit: int = 10) -> List[Dict]:
        if not settings.TRADING_ECONOMICS_API_KEY:
            print("Warning: TRADING_ECONOMICS_API_KEY not configured.")
            return []

        base_url = "https://api.tradingeconomics.com/news"
        params = NewsAPIService._parse_query_params(params_str)
        params["c"] = settings.TRADING_ECONOMICS_API_KEY
        params["limit"] = limit

        try:
            data = NewsAPIService._request_json(base_url, params)
            if not isinstance(data, list):
                return []

            articles = []
            for item in data[:limit]:
                articles.append(
                    {
                        "title": item.get("title", ""),
                        "description": item.get("description", ""),
                        "content": item.get("description", ""),
                        "url": item.get("url", ""),
                        "image_url": "",
                        "published_at": item.get("date"),
                        "source_name": item.get("source"),
                    }
                )
            return articles
        except Exception as exc:
            print(f"Exception calling Trading Economics: {exc}")
            return []

    @staticmethod
    def fetch_custom_api(params_str: ParamInput, limit: int = 10) -> List[Dict]:
        if not settings.CUSTOM_API_BASE_URL:
            print("Warning: CUSTOM_API_BASE_URL not configured. Skipping fallback API.")
            return []

        base_url = f"{settings.CUSTOM_API_BASE_URL}/v1/news"
        params = NewsAPIService._parse_query_params(params_str)
        params["limit"] = limit

        try:
            data = NewsAPIService._request_json(base_url, params)
            results = data.get("data", data) if isinstance(data, dict) else data
            if not isinstance(results, list):
                return []

            articles = []
            for item in results[:limit]:
                articles.append(
                    {
                        "title": item.get("title", ""),
                        "description": item.get("summary", ""),
                        "content": item.get("summary", "") or item.get("content", ""),
                        "url": item.get("url", ""),
                        "image_url": item.get("image_url", ""),
                        "published_at": item.get("published_at"),
                        "language": item.get("language"),
                        "country": item.get("country"),
                        "source_name": item.get("source_name"),
                    }
                )
            return articles
        except Exception as exc:
            print(f"Exception calling Custom API: {exc}")
            return []

    @classmethod
    def fetch_signals(
        cls,
        source_type: str,
        limit: int = 10,
        country: Optional[str] = None,
        language: Optional[str] = None,
        category: Optional[str] = None,
        extra_params: Optional[Dict[str, Any]] = None,
    ) -> List[Dict]:
        params: Dict[str, Any] = {}
        if country:
            params["country"] = country
        if language:
            params["language"] = language
        if category:
            params["category"] = category
        if extra_params:
            params.update({key: value for key, value in extra_params.items() if value is not None})

        source_key = cls._normalize_source_key(source_type)
        if source_key == "newsdata":
            return cls.fetch_newsdata(params, limit)
        if source_key == "gnews":
            return cls.fetch_gnews(params, limit)
        if source_key == "tradingeconomics":
            return cls.fetch_trading_economics(params, limit)
        return cls.fetch_custom_api(params, limit)

    @classmethod
    def fetch_articles(cls, source_base_url: str, api_params: str, limit: int = 10) -> List[Dict]:
        source_key = cls._normalize_source_key(source_base_url)
        if source_key == "newsdata":
            return cls.fetch_newsdata(api_params, limit)
        if source_key == "gnews":
            return cls.fetch_gnews(api_params, limit)
        if source_key == "tradingeconomics":
            return cls.fetch_trading_economics(api_params, limit)
        return cls.fetch_custom_api(api_params, limit)
