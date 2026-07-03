import uuid
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from database import get_collection

recent_bp = Blueprint("recent", __name__, url_prefix="/api/recent")


@recent_bp.route("", methods=["GET"])
def list_recent():
    email = request.args.get("email", "").strip()
    if not email:
        return jsonify({"error": "email query param required"}), 400

    coll = get_collection("recent")
    docs = list(coll.find({"email": email}).sort({"viewedAt": -1}).limit(10))
    for d in docs:
        d.pop("_id", None)
        d.pop("email", None)
    return jsonify(docs), 200


@recent_bp.route("", methods=["POST"])
def add_recent():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    email = (data.get("email") or "").strip()
    hotel_id = data.get("hotelId")
    if not email or hotel_id is None:
        return jsonify({"error": "email and hotelId are required"}), 422

    coll = get_collection("recent")
    coll.delete_many({"email": email, "hotelId": hotel_id})

    coll.insert_one({
        "id": int(uuid.uuid4().int & ((1 << 53) - 1)),
        "email": email,
        "hotelId": hotel_id,
        "name": (data.get("name") or "").strip(),
        "city": (data.get("city") or "").strip(),
        "price": data.get("price", 0),
        "rating": data.get("rating", 0),
        "image": (data.get("image") or "").strip(),
        "viewedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    })

    count = coll.count_documents({"email": email})
    if count > 10:
        docs = list(coll.find({"email": email}).sort("viewedAt", -1).skip(10))
        for d in docs:
            coll.delete_one({"_id": d["_id"]})

    return jsonify({"message": "Added"}), 201
