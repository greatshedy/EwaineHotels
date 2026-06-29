SAMPLE_BOOKING = {
    "guestName": "John Doe",
    "guestEmail": "john@example.com",
    "hotelName": "Test Hotel",
    "hotelId": 1,
    "roomType": "deluxe",
    "checkIn": "2030-06-01T14:00:00Z",
    "checkOut": "2030-06-05T11:00:00Z",
    "totalPrice": 600.0,
}


def test_create_booking(client):
    resp = client.post("/api/bookings", json=SAMPLE_BOOKING)
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["status"] == "pending"
    assert "id" in data
    assert data["guestName"] == "John Doe"


def test_create_booking_past_dates(client):
    body = {**SAMPLE_BOOKING, "checkIn": "2020-01-01T00:00:00Z", "checkOut": "2020-01-05T00:00:00Z"}
    resp = client.post("/api/bookings", json=body)
    assert resp.status_code == 422


def test_create_booking_inverted_dates(client):
    body = {**SAMPLE_BOOKING, "checkIn": "2030-06-10T00:00:00Z", "checkOut": "2030-06-05T00:00:00Z"}
    resp = client.post("/api/bookings", json=body)
    assert resp.status_code == 422


def test_create_booking_no_json_body(client):
    resp = client.post("/api/bookings", data="", content_type="application/json")
    assert resp.status_code == 400


def test_list_bookings_requires_auth(client):
    # create a booking first
    client.post("/api/bookings", json=SAMPLE_BOOKING)
    resp = client.get("/api/bookings")
    assert resp.status_code == 401


def test_list_bookings_as_admin(client):
    client.post("/api/bookings", json=SAMPLE_BOOKING)
    login_resp = client.post("/api/auth/login", json={"email": "admin@test.com", "password": "test-password"})
    token = login_resp.get_json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/bookings", headers=headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert len(data) >= 1


def test_update_booking_status(client):
    create_resp = client.post("/api/bookings", json=SAMPLE_BOOKING)
    booking_id = create_resp.get_json()["id"]

    login_resp = client.post("/api/auth/login", json={"email": "admin@test.com", "password": "test-password"})
    token = login_resp.get_json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.patch(f"/api/bookings/{booking_id}", json={"status": "confirmed"}, headers=headers)
    assert resp.status_code == 200
    assert resp.get_json()["status"] == "confirmed"
