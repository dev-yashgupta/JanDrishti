"""
Database engine and session factory.

Configured for Neon serverless PostgreSQL (and any standard PostgreSQL).
Neon uses connection pooling over TLS — ssl is enforced via the URL
sslmode=require parameter when connecting to Neon.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.core.config import settings

# Build engine kwargs — keep pool small for serverless connections
_engine_kwargs = dict(
    pool_pre_ping=True,   # detect and discard stale connections
    pool_size=5,          # reduced for serverless (Neon has a connection limit)
    max_overflow=10,
    pool_recycle=300,     # recycle connections every 5 min
    echo=settings.DEBUG,
)

engine = create_engine(settings.DATABASE_URL, **_engine_kwargs)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency -- yields a DB session and closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
