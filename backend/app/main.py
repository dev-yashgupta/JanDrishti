"""
JanDrishti AI — FastAPI application entrypoint.
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from sqlalchemy.orm import Session

from app.core.config import settings
from app.api import register_routers

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup:
      1. Warm up the similarity engine with all existing reports.
    Shutdown:
      Nothing needed — engine is in-process memory.
    """
    try:
        from app.database.session import SessionLocal
        from app.models.report import Report
        from app.ai.ai_service import ai_service, _ExistingReport

        db: Session = SessionLocal()
        try:
            reports = db.query(Report).all()
            existing = [
                _ExistingReport(
                    id=r.id,
                    text=f"{r.title} {r.description}",
                    latitude=r.location.latitude if r.location else None,
                    longitude=r.location.longitude if r.location else None,
                )
                for r in reports
            ]
            ai_service.warm_up(existing)
            logger.info(f"AI similarity engine warmed up with {len(existing)} reports.")
        finally:
            db.close()
    except Exception as e:
        logger.warning(f"AI warm-up skipped (DB may not be ready): {e}")

    yield
    logger.info("JanDrishti AI shutdown.")


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=(
            "JanDrishti AI — Civic Intelligence Platform. "
            "AI-powered discovery and prioritisation of unresolved community problems in India."
        ),
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
        lifespan=lifespan,
    )

    # ── CORS ──────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Static file serving for uploads ───────────────────────
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")

    # ── Routers ────────────────────────────────────────────────
    register_routers(app)

    # ── Health check ───────────────────────────────────────────
    @app.get("/health", tags=["health"])
    def health():
        return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}

    return app


app = create_app()
