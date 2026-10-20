"""Report endpoint tests."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from tests.conftest import get_token


def _auth(client, user, password="Test@1234"):
    return {"Authorization": f"Bearer {get_token(client, user.email, password)}"}


def test_create_report_success(client: TestClient, seed_citizen, seed_category):
    headers = _auth(client, seed_citizen)
    resp = client.post("/api/reports", json={
        "title": "Large pothole on main road causing damage",
        "description": "There is a very large pothole near the market. Multiple vehicles have been damaged. It has been there for two weeks and is causing accidents.",
        "category_id": seed_category.id,
        "city": "Jaipur",
        "state": "Rajasthan",
        "latitude": 26.912,
        "longitude": 75.787,
    }, headers=headers)
    assert resp.status_code == 201
    body = resp.json()
    assert body["title"] == "Large pothole on main road causing damage"
    assert body["status"] == "REPORTED"
    assert body["category"]["id"] == seed_category.id


def test_create_report_title_too_short(client: TestClient, seed_citizen, seed_category):
    headers = _auth(client, seed_citizen)
    resp = client.post("/api/reports", json={
        "title": "Short",
        "description": "This description is long enough to pass validation it has thirty characters.",
        "category_id": seed_category.id,
        "city": "Jaipur",
        "state": "Rajasthan",
    }, headers=headers)
    assert resp.status_code == 422


def test_create_report_unauthenticated(client: TestClient, seed_category):
    resp = client.post("/api/reports", json={
        "title": "Some issue that is long enough",
        "description": "This description is long enough to pass validation it has thirty characters.",
        "category_id": seed_category.id,
        "city": "Delhi",
        "state": "Delhi",
    })
    assert resp.status_code == 401


def test_list_reports(client: TestClient, seed_citizen, seed_category):
    headers = _auth(client, seed_citizen)
    # Create one report first
    client.post("/api/reports", json={
        "title": "Broken street light near park area",
        "description": "All street lights on our road have been non-functional for two weeks causing safety issues.",
        "category_id": seed_category.id,
        "city": "Bengaluru",
        "state": "Karnataka",
    }, headers=headers)
    resp = client.get("/api/reports", headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    assert "items" in body
    assert "total" in body
    assert isinstance(body["items"], list)


def test_get_report_by_id(client: TestClient, seed_citizen, seed_category):
    headers = _auth(client, seed_citizen)
    create_resp = client.post("/api/reports", json={
        "title": "Water supply disrupted in our colony",
        "description": "There has been no water supply for three days. Residents are struggling. We need immediate action from the water board.",
        "category_id": seed_category.id,
        "city": "Pune",
        "state": "Maharashtra",
    }, headers=headers)
    report_id = create_resp.json()["id"]
    resp = client.get(f"/api/reports/{report_id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == report_id


def test_get_report_not_found(client: TestClient):
    resp = client.get("/api/reports/nonexistent-id-00000000")
    assert resp.status_code == 404


def test_support_report(client: TestClient, seed_citizen, seed_category):
    headers = _auth(client, seed_citizen)
    create_resp = client.post("/api/reports", json={
        "title": "Garbage pile near residential area",
        "description": "A large garbage pile has been accumulating near our residential area for more than one week and is causing bad smell and health hazard.",
        "category_id": seed_category.id,
        "city": "Delhi",
        "state": "Delhi",
    }, headers=headers)
    report_id = create_resp.json()["id"]
    resp = client.post(f"/api/reports/{report_id}/support", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["supported"] is True


def test_change_status_requires_authority(client: TestClient, seed_citizen, seed_category):
    headers = _auth(client, seed_citizen)
    create_resp = client.post("/api/reports", json={
        "title": "Dangerous pothole blocking the main road entry",
        "description": "A very dangerous pothole has developed blocking the main road entry to our colony. Cars are getting stuck and damaged.",
        "category_id": seed_category.id,
        "city": "Mumbai",
        "state": "Maharashtra",
    }, headers=headers)
    report_id = create_resp.json()["id"]
    resp = client.patch(
        f"/api/reports/{report_id}/status",
        json={"new_status": "VERIFIED"},
        headers=headers,
    )
    assert resp.status_code == 403


def test_change_status_as_authority(client: TestClient, seed_authority, seed_citizen, seed_category):
    citizen_headers = _auth(client, seed_citizen)
    create_resp = client.post("/api/reports", json={
        "title": "Sewage overflowing near the hospital entrance road",
        "description": "Sewage water is overflowing near the hospital entrance for three days causing severe health hazard and blocking access.",
        "category_id": seed_category.id,
        "city": "Lucknow",
        "state": "Uttar Pradesh",
    }, headers=citizen_headers)
    report_id = create_resp.json()["id"]

    auth_headers = _auth(client, seed_authority)
    resp = client.patch(
        f"/api/reports/{report_id}/status",
        json={"new_status": "UNDER_REVIEW", "note": "Report received and under review."},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "UNDER_REVIEW"
