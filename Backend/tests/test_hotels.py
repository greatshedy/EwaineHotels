SAMPLE_HOTEL = {
    "name": "Test Hotel",
    "price": 150.0,
    "city": "Test City",
    "description": "A lovely test hotel",
}


def test_list_hotels_empty(client):
    resp = client.get("/api/hotels")
    assert resp.status_code == 200
    assert resp.get_json() == []


def test_create_hotel_needs_auth(client):
    resp = client.post("/api/hotels", json=SAMPLE_HOTEL)
    assert resp.status_code == 401


def test_create_hotel(client):
    login_resp = client.post("/api/auth/login", json={"email": "admin@test.com", "password": "test-password"})
    token = login_resp.get_json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.post("/api/hotels", json=SAMPLE_HOTEL, headers=headers)
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["name"] == SAMPLE_HOTEL["name"]
    assert data["slug"] == "test-hotel"
    assert "id" in data


def test_get_hotel(client):
    login_resp = client.post("/api/auth/login", json={"email": "admin@test.com", "password": "test-password"})
    token = login_resp.get_json()["token"]
    headers = {"Authorization": f"Bearer {token}"}
    create_resp = client.post("/api/hotels", json=SAMPLE_HOTEL, headers=headers)
    hotel_id = create_resp.get_json()["id"]

    resp = client.get(f"/api/hotels/{hotel_id}")
    assert resp.status_code == 200
    assert resp.get_json()["name"] == SAMPLE_HOTEL["name"]


def test_get_hotel_not_found(client):
    resp = client.get("/api/hotels/99999")
    assert resp.status_code == 404


def test_list_hotels_pagination(client):
    login_resp = client.post("/api/auth/login", json={"email": "admin@test.com", "password": "test-password"})
    token = login_resp.get_json()["token"]
    headers = {"Authorization": f"Bearer {token}"}
    for i in range(5):
        client.post("/api/hotels", json={**SAMPLE_HOTEL, "name": f"Hotel {i}"}, headers=headers)

    resp = client.get("/api/hotels?skip=0&limit=2")
    data = resp.get_json()
    assert len(data) == 2
