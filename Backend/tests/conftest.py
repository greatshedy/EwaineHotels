import os
import bcrypt
import pytest

os.environ.setdefault("FLASK_ENV", "test")
os.environ.setdefault("ASTRA_DB_TOKEN", "test-token")
os.environ.setdefault("ASTRA_DB_API_ENDPOINT", "https://test.example.com")
os.environ.setdefault("JWT_SECRET", "test-secret")
os.environ.setdefault("ADMIN_EMAIL", "admin@test.com")
os.environ.setdefault("ADMIN_PASSWORD", "test-password")


@pytest.fixture
def app():
    from app import create_app
    application = create_app()
    application.config["TESTING"] = True
    return application


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture(autouse=True)
def mock_db(monkeypatch):
    class Cursor:
        def __init__(self, items):
            self._items = items

        def skip(self, n):
            self._items = self._items[n:]
            return self

        def limit(self, n):
            self._items = self._items[:n]
            return self

        def __iter__(self):
            return iter(self._items)

    class FakeCollection:
        def __init__(self):
            self.docs = {}
            self._id_counter = 1

        def _match(self, filter_):
            return [dict(d) for d in self.docs.values()
                    if all(d.get(k) == v for k, v in filter_.items())]

        def find_one(self, filter_, *a, **kw):
            for doc in self.docs.values():
                if all(doc.get(k) == v for k, v in filter_.items()):
                    doc_copy = dict(doc)
                    if kw.get("projection"):
                        return {k: doc_copy[k] for k in kw["projection"] if k in doc_copy}
                    return doc_copy
            return None

        def find(self, filter_=None, *a, **kw):
            if filter_ is None:
                filter_ = {}
            return Cursor(self._match(filter_))

        def insert_one(self, doc):
            doc = dict(doc)
            doc["_id"] = self._id_counter
            self._id_counter += 1
            self.docs[doc["_id"]] = doc
            return type("obj", (), {"inserted_id": doc["_id"]})()

        def update_one(self, filter_, update, *a, **kw):
            for doc in self.docs.values():
                if all(doc.get(k) == v for k, v in filter_.items()):
                    if "$set" in update:
                        doc.update(update["$set"])
                    return type("obj", (), {"matched_count": 1, "modified_count": 1})()
            return type("obj", (), {"matched_count": 0, "modified_count": 0})()

        def delete_one(self, filter_):
            for doc_id, doc in list(self.docs.items()):
                if all(doc.get(k) == v for k, v in filter_.items()):
                    del self.docs[doc_id]
                    return type("obj", (), {"deleted_count": 1})()
            return type("obj", (), {"deleted_count": 0})()

        def estimated_document_count(self):
            return len(self.docs)

    fake_collections = {}

    def fake_get_collection(name):
        if name not in fake_collections:
            fake_collections[name] = FakeCollection()
            if name == "admins":
                pw_hash = bcrypt.hashpw(
                    os.environ["ADMIN_PASSWORD"].encode(), bcrypt.gensalt()
                ).decode()
                fake_collections[name].insert_one({
                    "email": os.environ["ADMIN_EMAIL"],
                    "password_hash": pw_hash,
                })
        return fake_collections[name]

    monkeypatch.setattr("routes.auth.get_collection", fake_get_collection)
    monkeypatch.setattr("routes.hotels.get_collection", fake_get_collection)
    monkeypatch.setattr("routes.bookings.get_collection", fake_get_collection)
    monkeypatch.setattr("routes.featured.get_collection", fake_get_collection)
    monkeypatch.setattr("database.get_collection", fake_get_collection)
    monkeypatch.setattr("database.get_db", lambda: None)
