from astrapy import DataAPIClient
from config import settings

_client = None
_db = None


def get_db():
    global _client, _db
    if _db is not None:
        return _db
    _client = DataAPIClient()
    _db = _client.get_database(
        settings.astra_db_api_endpoint,
        token=settings.astra_db_token,
    )
    return _db


def get_collection(name: str):
    db = get_db()
    return db.get_collection(name)
