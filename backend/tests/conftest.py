"""
Test fixtures — in-memory SQLite DB for fast, isolated tests.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.database.base import Base
from app.database.session import get_db
from app.main import app
from app.models import User, Category
from app.core.security import hash_password
import uuid


TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def create_tables():
    """Create all tables once per test session."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db():
    """Provide a clean DB session for each test (rolls back after)."""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture()
def client(db: Session):
    """FastAPI test client with DB override."""
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def seed_category(db: Session) -> Category:
    cat = Category(
        id=str(uuid.uuid4()),
        name="Roads & Infrastructure",
        slug="roads-infrastructure",
        color="#ef4444",
        is_active=True,
        sort_order=1,
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@pytest.fixture()
def seed_citizen(db: Session) -> User:
    user = User(
        id=str(uuid.uuid4()),
        full_name="Test Citizen",
        email="test_citizen@example.com",
        hashed_password=hash_password("Test@1234"),
        role="CITIZEN",
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture()
def seed_authority(db: Session) -> User:
    user = User(
        id=str(uuid.uuid4()),
        full_name="Test Authority",
        email="test_authority@example.com",
        hashed_password=hash_password("Test@1234"),
        role="AUTHORITY",
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_token(client: TestClient, email: str, password: str) -> str:
    resp = client.post("/api/auth/login", json={"email": email, "password": password})
    return resp.json()["tokens"]["access_token"]
