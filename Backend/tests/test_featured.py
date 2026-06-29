def test_featured_empty(client):
    resp = client.get("/api/hotels/featured")
    assert resp.status_code == 200
    assert resp.get_json() == []


def test_featured_with_data(client):
    login_resp = client.post("/api/auth/login", json={"email": "admin@test.com", "password": "test-password"})
    token = login_resp.get_json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    client.post("/api/hotels", json={"name": "Regular", "price": 100, "city": "A", "featured": False}, headers=headers)
    client.post("/api/hotels", json={"name": "Featured One", "price": 200, "city": "B", "featured": True}, headers=headers)

    resp = client.get("/api/hotels/featured")
    data = resp.get_json()
    assert len(data) == 1
    assert data[0]["featured"] is True
