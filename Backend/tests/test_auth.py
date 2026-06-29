import json

SAMPLE_ADMIN = {"email": "admin@test.com", "password": "test-password"}


def test_login_success(client):
    resp = client.post("/api/auth/login", json=SAMPLE_ADMIN)
    assert resp.status_code == 200
    data = resp.get_json()
    assert "token" in data
    assert data["email"] == SAMPLE_ADMIN["email"]


def test_login_wrong_password(client):
    resp = client.post("/api/auth/login", json={"email": "admin@test.com", "password": "wrong"})
    assert resp.status_code == 401


def test_login_no_json_body(client):
    resp = client.post("/api/auth/login", data="", content_type="application/json")
    assert resp.status_code == 400


def test_login_invalid_json(client):
    resp = client.post("/api/auth/login", data="not-json", content_type="application/json")
    assert resp.status_code == 400


def test_verify_valid_token(client):
    login_resp = client.post("/api/auth/login", json=SAMPLE_ADMIN)
    token = login_resp.get_json()["token"]

    resp = client.get("/api/auth/verify", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200


def test_verify_no_token(client):
    resp = client.get("/api/auth/verify")
    assert resp.status_code == 401


def test_verify_bad_token(client):
    resp = client.get("/api/auth/verify", headers={"Authorization": "Bearer bad-token"})
    assert resp.status_code == 401
