from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "News AI Aggregator"
    API_V1_STR: str = "/api/v1"
    
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "news_db"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: str = "5432"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-69-420")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 1 week
    
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    REDIS_HOST: str = "localhost"
    REDIS_PORT: str = "6379"
    
    @property
    def CELERY_BROKER_URL(self) -> str:
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"
    
    @property
    def CELERY_RESULT_BACKEND(self) -> str:
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"
    
    OPENAI_API_KEY: str = ""
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    OPENAI_MODEL: str = "gpt-4o-mini"
    OPENAI_TIMEOUT_SECONDS: float = 90.0
    OPENAI_PROMPT_MAX_CHARS: int = 12000 # Increased for larger context summaries
    OPENAI_MAX_COMPLETION_TOKENS: int = 500 # Increased for situation summaries
    OPENAI_TEMPERATURE: float = 0.2
    OPENAI_VIETNAMESE_STRICT: bool = True
    AUTO_PUBLISH_STORIES: bool = True
    AUTO_CREATE_TABLES: bool = False
    
    # News Providers API Keys
    NEWSDATA_API_KEY: str = ""
    GNEWS_API_KEY: str = ""
    TRADING_ECONOMICS_API_KEY: str = ""
    CUSTOM_API_BASE_URL: str = ""

    # External Services
    VOID_BOX_URL: str = "http://192.168.119.128:8000/tts"
    LAST30DAYS_REPO_URL: str = "https://github.com/mvanhorn/last30days-skill"
    DEFAULT_USER_AGENT: str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
