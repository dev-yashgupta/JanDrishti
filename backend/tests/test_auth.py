"""Authentication endpoint tests."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from tests.conftest import get_token


def test_register_success(client: TestClient):
    resp = client.post("/api/auth/register", json={
        "full_name": "New User",
        "email": "new_user@example.com",
        "password": "NewUser@1234",
        "role": "CITIZEN",
    })
    assert resp.status_code == 201
    body = resp.json()
    assert "tokens" in body
    assert body["tokens"]["access_token"]
    assert body["user"]["email"] == "new_user@example.com"
    assert "hashed_password" not in body["user"]


def test_register_duplicate_email(client: TestClient, seed_citizen):
    resp = client.post("/api/auth/register", json={
        "full_name": "Duplicate",
        "email": seed_citizen.email,
        "password": "Duplicate@1234",
    })
    assert resp.status_code == 409
    assert "already exists" in resp.json()["detail"]


def test_register_weak_password(client: TestClient):
    resp = client.post("/api/auth/register", json={
        "full_name": "Weak Pass",
        "email": "weak@example.com",
        "password": "short",
    })
    assert resp.status_code == 422


def test_login_success(client: TestClient, seed_citizen):
    resp = client.post("/api/auth/login", json={
        "email": seed_citizen.email,
        "password": "Test@1234",
    })
    assert resp.status_code == 200
    body = resp.json()
    assert body["tokens"]["access_token"]
    assert body["user"]["role"] == "CITIZEN"


def test_login_wrong_password(client: TestClient, seed_citizen):
    resp = client.post("/api/auth/login", json={
        "email": seed_citizen.email,
        "password": "WrongPassword1",
    })
    assert resp.status_code == 401


def test_login_unknown_email(client: TestClient):
    resp = client.post("/api/auth/login", json={
        "email": "nobody@example.com",
        "password": "Nobody@1234",
    })
    assert resp.status_code == 401


def test_me_authenticated(client: TestClient, seed_citizen):
    token = get_token(client, seed_citizen.email, "Test@1234")
    resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["id"] == seed_citizen.id


def test_me_unauthenticated(client: TestClient):
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401


def test_logout(client: TestClient, seed_citizen):
    token = get_token(client, seed_citizen.email, "Test@1234")
    resp = client.post("/api/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 204
