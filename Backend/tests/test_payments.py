import hashlib
import hmac
import json
import os
from datetime import datetime, timedelta, timezone
from unittest.mock import Mock

os.environ.setdefault("FLUTTERWAVE_SECRET_KEY", "test-flw-secret")
os.environ.setdefault("FLUTTERWAVE_PUBLIC_KEY", "test-flw-public")
os.environ.setdefault("FLUTTERWAVE_ENCRYPTION_KEY", "test-flw-enc")

import routes.payments  # noqa: E402

SAMPLE_PAYMENT = {
    "guestName": "John Doe",
    "guestEmail": "john@example.com",
    "hotelName": "Test Hotel",
    "hotelId": 1,
    "roomType": "deluxe",
    "checkIn": "2030-06-01T14:00:00Z",
    "checkOut": "2030-06-05T11:00:00Z",
    "totalPrice": 600.0,
}

CHECKOUT_LINK = "https://checkout.flutterwave.com/abc123"


def _fake_response(ok=True, json_data=None):
    resp = Mock()
    resp.ok = ok
    resp.content = b"{}"
    resp.json.return_value = json_data or {}
    return resp


def _init_payment(client, monkeypatch, body=None):
    flw = _fake_response(json_data={"status": "success", "data": {"link": CHECKOUT_LINK}})
    monkeypatch.setattr(routes.payments.requests, "post", Mock(return_value=flw))
    return client.post("/api/payments/initialize", json=body or SAMPLE_PAYMENT)


def test_initialize_payment_returns_link(client, monkeypatch):
    resp = _init_payment(client, monkeypatch)
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["paymentLink"] == CHECKOUT_LINK
    assert data["txRef"].startswith("EWAINE-")
    assert "bookingId" in data


def test_initialize_payment_requires_body(client):
    resp = client.post("/api/payments/initialize", data="", content_type="application/json")
    assert resp.status_code == 400


def test_initialize_payment_rejects_past_dates(client, monkeypatch):
    body = {**SAMPLE_PAYMENT, "checkIn": "2020-01-01T00:00:00Z", "checkOut": "2020-01-05T00:00:00Z"}
    resp = client.post("/api/payments/initialize", json=body)
    assert resp.status_code == 422


def test_initialize_payment_naive_dates(client, monkeypatch):
    body = {**SAMPLE_PAYMENT, "checkIn": "2030-09-01", "checkOut": "2030-09-05"}
    resp = _init_payment(client, monkeypatch, body)
    assert resp.status_code == 201
    assert resp.get_json()["txRef"].startswith("EWAINE-")


def test_initialize_payment_same_day_checkin(client, monkeypatch):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    check_out = (datetime.now(timezone.utc) + timedelta(days=2)).strftime("%Y-%m-%d")
    body = {**SAMPLE_PAYMENT, "checkIn": today, "checkOut": check_out}
    resp = _init_payment(client, monkeypatch, body)
    assert resp.status_code == 201


def test_initialize_payment_failure_removes_booking(client, monkeypatch):
    flw = _fake_response(ok=False, json_data={"status": "error", "message": "bad"})
    monkeypatch.setattr(routes.payments.requests, "post", Mock(return_value=flw))
    resp = client.post("/api/payments/initialize", json=SAMPLE_PAYMENT)
    assert resp.status_code == 502

    verify = _fake_response(json_data={"status": "success", "data": {"status": "failed"}})
    monkeypatch.setattr(routes.payments.requests, "get", Mock(return_value=verify))
    check = client.get("/api/payments/verify?tx_ref=EWAINE-1")
    assert check.status_code == 404


def test_verify_payment_confirms_on_success(client, monkeypatch):
    created = _init_payment(client, monkeypatch)
    tx_ref = created.get_json()["txRef"]

    flw = _fake_response(json_data={"status": "success", "data": {"status": "successful", "tx_ref": tx_ref}})
    monkeypatch.setattr(routes.payments.requests, "get", Mock(return_value=flw))

    resp = client.get(f"/api/payments/verify?tx_ref={tx_ref}")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["status"] == "confirmed"
    assert data["booking"]["txRef"] == tx_ref
    assert data["booking"]["paymentStatus"] == "paid"


def test_verify_payment_cancels_on_failure(client, monkeypatch):
    created = _init_payment(client, monkeypatch)
    tx_ref = created.get_json()["txRef"]

    flw = _fake_response(json_data={"status": "success", "data": {"status": "failed", "tx_ref": tx_ref}})
    monkeypatch.setattr(routes.payments.requests, "get", Mock(return_value=flw))

    resp = client.get(f"/api/payments/verify?tx_ref={tx_ref}")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["status"] == "cancelled"
    assert data["booking"]["paymentStatus"] == "failed"


def test_verify_payment_requires_tx_ref(client):
    resp = client.get("/api/payments/verify")
    assert resp.status_code == 400


def test_verify_payment_unknown_ref(client):
    flw = _fake_response(json_data={"status": "success", "data": {"status": "failed"}})
    client.post("/api/payments/initialize", json=SAMPLE_PAYMENT)
    resp = client.get("/api/payments/verify?tx_ref=EWAINE-999999")
    assert resp.status_code == 404


def test_webhook_confirms_payment(client, monkeypatch):
    created = _init_payment(client, monkeypatch)
    tx_ref = created.get_json()["txRef"]

    payload = {"event": "charge.completed", "data": {"id": 123, "tx_ref": tx_ref, "status": "successful"}}
    raw = json.dumps(payload).encode()
    secret = routes.payments.settings.flutterwave_secret_key.encode()
    sig = hmac.new(secret, raw, hashlib.sha256).hexdigest()

    resp = client.post(
        "/api/payments/webhook",
        data=raw,
        content_type="application/json",
        headers={"verif-hash": sig},
    )
    assert resp.status_code == 200

    flw = _fake_response(json_data={"status": "success", "data": {"status": "successful", "tx_ref": tx_ref}})
    monkeypatch.setattr(routes.payments.requests, "get", Mock(return_value=flw))
    check = client.get(f"/api/payments/verify?tx_ref={tx_ref}")
    assert check.get_json()["status"] == "confirmed"


def test_webhook_rejects_bad_signature(client, monkeypatch):
    created = _init_payment(client, monkeypatch)
    tx_ref = created.get_json()["txRef"]

    payload = {"event": "charge.completed", "data": {"id": 123, "tx_ref": tx_ref, "status": "successful"}}
    raw = json.dumps(payload).encode()
    resp = client.post(
        "/api/payments/webhook",
        data=raw,
        content_type="application/json",
        headers={"verif-hash": "wrong-signature"},
    )
    assert resp.status_code == 401
