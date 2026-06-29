import sys
import time
from datetime import datetime, timezone

from config import settings
from database import get_db


def ping():
    db = get_db()
    names = db.list_collection_names()
    return names


if __name__ == "__main__":
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    try:
        collections = ping()
        print(f"[{ts}] OK — collections: {collections}")
        sys.exit(0)
    except Exception as e:
        msg = str(e)
        if "503" in msg:
            print(f"[{ts}] Database was hibernating (503) — waiting 10s for wake-up...")
            time.sleep(10)
            try:
                collections = ping()
                print(f"[{ts}] OK (woke up) — collections: {collections}")
                sys.exit(0)
            except Exception as retry_e:
                print(f"[{ts}] FAILED on retry — {retry_e}", file=sys.stderr)
                sys.exit(1)
        else:
            print(f"[{ts}] FAILED — {msg}", file=sys.stderr)
            sys.exit(1)
