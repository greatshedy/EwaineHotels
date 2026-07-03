"""Seed initial data into AstraDB"""

import json
import bcrypt
from pathlib import Path
from database import get_db, get_collection
from config import settings


def ensure_collections():
    db = get_db()
    existing = set(db.list_collection_names())
    for name in ("hotels", "bookings", "admins", "destinations", "testimonials", "team", "settings", "users", "favorites", "recent", "blog"):
        if name not in existing:
            db.create_collection(name)
            print(f"Created collection '{name}'.")
        else:
            print(f"Collection '{name}' already exists.")


def seed_hotels():
    hotels_path = Path(__file__).resolve().parent.parent / "src" / "data" / "hotels.json"
    if not hotels_path.exists():
        print(f"hotels.json not found at {hotels_path}, skipping hotel seed.")
        return

    with open(hotels_path, encoding="utf-8-sig") as f:
        raw = json.load(f)

    coll = get_collection("hotels")
    existing = coll.estimated_document_count()
    if existing > 0:
        print(f"Hotels collection already has {existing} documents, skipping seed.")
        return

    for hotel in raw:
        hotel.pop("_id", None)
        coll.insert_one(hotel)

    print(f"Seeded {len(raw)} hotels.")


def seed_admins():
    coll = get_collection("admins")
    existing = coll.find_one({"email": settings.admin_email})
    if existing:
        print(f"Admin {settings.admin_email} already exists, skipping.")
        return

    password_hash = bcrypt.hashpw(
        settings.admin_password.encode(), bcrypt.gensalt()
    ).decode()

    coll.insert_one({
        "email": settings.admin_email,
        "password_hash": password_hash,
    })
    print(f"Admin {settings.admin_email} created.")


def seed_bookings():
    coll = get_collection("bookings")
    count = coll.estimated_document_count()
    print(f"Bookings collection ready ({count} existing documents).")


def seed_collection(collection_name, documents):
    coll = get_collection(collection_name)
    existing = coll.estimated_document_count()
    if existing > 0:
        print(f"{collection_name} collection already has {existing} documents, skipping seed.")
        return
    for doc in documents:
        coll.insert_one(doc)
    print(f"Seeded {len(documents)} {collection_name}.")


def run_seed():
    print("Seeding database...")
    ensure_collections()

    seed_hotels()
    seed_admins()
    seed_bookings()

    seed_collection("destinations", [
        {"id": 1, "name": "Lagos", "country": "Nigeria", "count": 156, "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600"},
        {"id": 2, "name": "Abuja", "country": "Nigeria", "count": 89, "image": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600"},
        {"id": 3, "name": "Port Harcourt", "country": "Nigeria", "count": 45, "image": "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600"},
        {"id": 4, "name": "Accra", "country": "Ghana", "count": 72, "image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600"},
        {"id": 5, "name": "Nairobi", "country": "Kenya", "count": 94, "image": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600"},
        {"id": 6, "name": "Cape Town", "country": "South Africa", "count": 118, "image": "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600"},
    ])

    seed_collection("testimonials", [
        {"id": 1, "name": "Sarah Johnson", "role": "Business Traveler", "avatar": "https://i.pravatar.cc/150?img=1", "rating": 5, "text": "Absolutely stunning experience! The Eko Atlantic Suites exceeded all my expectations. The service was impeccable and the ocean views were breathtaking."},
        {"id": 2, "name": "Michael Osei", "role": "Vacationer", "avatar": "https://i.pravatar.cc/150?img=3", "rating": 5, "text": "Labadi Beach Hotel made our family holiday unforgettable. The staff treated us like royalty and the beach access was perfect for the kids."},
        {"id": 3, "name": "Emily Chemutai", "role": "Solo Traveler", "avatar": "https://i.pravatar.cc/150?img=5", "rating": 4, "text": "Nairobi Serena Hotel offers an incredible blend of luxury and authentic Kenyan culture. The food was amazing and the pool area is gorgeous."},
        {"id": 4, "name": "David Nkosi", "role": "Couples Getaway", "avatar": "https://i.pravatar.cc/150?img=7", "rating": 5, "text": "The Table Bay Hotel in Cape Town is pure magic. Watching the sunset over Table Mountain from our room was an experience we will never forget."},
        {"id": 5, "name": "Amara Eze", "role": "Digital Nomad", "avatar": "https://i.pravatar.cc/150?img=9", "rating": 4, "text": "Eko Atlantic Suites is top-notch, the food was amazing and the pool area is gorgeous."},
    ])

    seed_collection("settings", [
        {"key": "whatsapp", "value": "2348080769019"},
    ])

    seed_collection("team", [
        {"id": 1, "name": "Kwame Asante", "role": "CEO & Founder", "avatar": "https://i.pravatar.cc/150?img=11", "bio": "Visionary leader with 20+ years in hospitality technology."},
        {"id": 2, "name": "Chioma Obi", "role": "CTO", "avatar": "https://i.pravatar.cc/150?img=12", "bio": "Tech innovator who built our booking platform from the ground up."},
        {"id": 3, "name": "Thabo Mbeki", "role": "Head of Operations", "avatar": "https://i.pravatar.cc/150?img=13", "bio": "Ensures seamless experiences across all our partner hotels."},
        {"id": 4, "name": "Amina Hassan", "role": "Customer Experience Director", "avatar": "https://i.pravatar.cc/150?img=14", "bio": "Dedicated to making every customer journey exceptional."},
    ])

    print("Done.")


if __name__ == "__main__":
    run_seed()
