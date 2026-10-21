"""
Application configuration — loaded from environment variables / .env file.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── App ───────────────────────────────────────────────────
    APP_NAME: str = "JanDrishti AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # ── Database ──────────────────────────────────────────────
    # Use +psycopg2 to force the installed psycopg2-binary driver
    # (SQLAlchemy 2.1 defaults to psycopg3 which isn't installed)
    DATABASE_URL: str = (
        "postgresql+psycopg2://jandrishti:jandrishti_pass@localhost:5432/jandrishti_db"
    )

    # ── Security ──────────────────────────────────────────────
    SECRET_KEY: str = "change-me-in-production-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # ── CORS ──────────────────────────────────────────────────
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # ── File storage ──────────────────────────────────────────
    UPLOAD_DIR: str = "uploads"
    MAX_IMAGE_SIZE_MB: int = 10
    MAX_VIDEO_SIZE_MB: int = 50
    ALLOWED_IMAGE_TYPES: list[str] = ["image/jpeg", "image/png", "image/webp"]
    ALLOWED_VIDEO_TYPES: list[str] = ["video/mp4"]

    # ── AI config (overridable at runtime via admin panel) ────
    SIMILARITY_THRESHOLD: float = 0.55
    SIMILARITY_RADIUS_KM: float = 2.0
    PRIORITY_WEIGHT_SEVERITY: float = 0.30
    PRIORITY_WEIGHT_URGENCY: float = 0.25
    PRIORITY_WEIGHT_FREQUENCY: float = 0.20
    PRIORITY_WEIGHT_COMMUNITY_IMPACT: float = 0.15
    PRIORITY_WEIGHT_PERSISTENCE: float = 0.10

    # ── Pagination ────────────────────────────────────────────
    DEFAULT_PAGE_SIZE: int = 10
    MAX_PAGE_SIZE: int = 100


settings = Settings()
