"""
SQLAlchemy declarative base and metadata.
Import Base into every model so Alembic can discover all tables.
"""
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
