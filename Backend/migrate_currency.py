"""One-off migration: convert seeded hotel prices from USD to Naira (x1600).

Safe to re-run: documents already in Naira (price >= 100000) are skipped.
Run with:  python migrate_currency.py
"""

from database import get_collection

RATE = 1600
NAIRA_THRESHOLD = 100_000  # Naira prices in this dataset are all well above this


def migrate():
    coll = get_collection("hotels")
    docs = list(coll.find({}))
    updated = 0

    for doc in docs:
        changes = {}

        price = doc.get("price")
        if isinstance(price, (int, float)) and price < NAIRA_THRESHOLD:
            changes["price"] = price * RATE

        room_types = doc.get("roomTypes")
        if isinstance(room_types, list) and room_types:
            new_rooms = []
            changed = False
            for r in room_types:
                if isinstance(r, dict) and isinstance(r.get("price"), (int, float)) and r["price"] < NAIRA_THRESHOLD:
                    r = {**r, "price": r["price"] * RATE}
                    changed = True
                new_rooms.append(r)
            if changed:
                changes["roomTypes"] = new_rooms

        if changes:
            coll.update_one({"id": doc["id"]}, {"$set": changes})
            updated += 1

    print(f"Updated {updated} of {len(docs)} hotels to Naira (x{RATE}).")


if __name__ == "__main__":
    migrate()
