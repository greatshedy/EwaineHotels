import pytest
from types import SimpleNamespace


class FakeResp:
    def __init__(self, ok=True, status_code=200):
        self.ok = ok
        self.status_code = status_code


@pytest.fixture
def configured(monkeypatch):
    fake = SimpleNamespace(
        email_js_service_id="service_test",
        email_js_template_id="template_test",
        email_js_public_key="pub_test",
        email_js_private_key="priv_test",
        contact_recipient="recipient@example.com",
    )
    monkeypatch.setattr("routes.contact.settings", fake)
    return fake


def test_contact_success(client, configured, monkeypatch):
    calls = {}

    def fake_post(url, json, timeout):
        calls["url"] = url
        calls["json"] = json
        return FakeResp(ok=True)

    monkeypatch.setattr("routes.contact.requests.post", fake_post)

    resp = client.post(
        "/api/contact",
        json={
            "name": "Jane",
            "email": "jane@example.com",
            "subject": "Hello",
            "message": "This is a test message",
        },
    )

    assert resp.status_code == 201
    assert resp.get_json()["message"] == "Message sent"

    params = calls["json"]["template_params"]
    assert params["from_name"] == "Jane"
    assert params["from_email"] == "jane@example.com"
    assert params["subject"] == "Hello"
    assert params["to_email"] == "recipient@example.com"
    assert calls["json"]["accessToken"] == "priv_test"
    assert calls["json"]["service_id"] == "service_test"
    assert calls["json"]["template_id"] == "template_test"


def test_contact_validation_error(client, configured):
    resp = client.post(
        "/api/contact",
        json={"name": "Jane", "email": "not-an-email", "message": "hi"},
    )
    assert resp.status_code == 422


def test_contact_not_configured(client, monkeypatch):
    fake = SimpleNamespace(
        email_js_service_id="",
        email_js_template_id="",
        email_js_public_key="",
        email_js_private_key="",
        contact_recipient="recipient@example.com",
    )
    monkeypatch.setattr("routes.contact.settings", fake)

    resp = client.post(
        "/api/contact",
        json={"name": "Jane", "email": "jane@example.com", "message": "hi"},
    )
    assert resp.status_code == 501


def test_contact_missing_body(client, configured):
    resp = client.post("/api/contact")
    assert resp.status_code == 400
