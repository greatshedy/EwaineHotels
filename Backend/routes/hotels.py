import re
import uuid
from flask import Blueprint, request, jsonify
from database import get_collection
from schemas import HotelCreate, HotelUpdate
from routes.auth import token_required

hotels_bp = Blueprint("hotels", __name__, url_prefix="/api/hotels")


def _slugify(name: str) -> str:
    s = name.lower().replace(" ", "-").replace("/", "-")
    return re.sub(r"[^a-z0-9-]", "", s).strip("-")


@hotels_bp.route("", methods=["GET"])
def list_hotels():
    coll = get_collection("hotels")
    docs = list(coll.find({}))
    for d in docs:
        d.pop("_id", None)

    search = request.args.get("search", "").strip().lower()
    location = request.args.get("location", "").strip().lower()
    min_price = request.args.get("minPrice", type=float)
    max_price = request.args.get("maxPrice", type=float)
    min_rating = request.args.get("rating", type=float)
    amenities_param = request.args.get("amenities", "").strip()
    sort_by = request.args.get("sort", "").strip()

    if search:
        docs = [d for d in docs if search in d.get("name", "").lower()
                or search in d.get("city", "").lower()
                or search in d.get("state", "").lower()]
    if location:
        docs = [d for d in docs if location in d.get("city", "").lower()
                or location in d.get("state", "").lower()]
    if min_price is not None:
        docs = [d for d in docs if (d.get("price") or 0) >= min_price]
    if max_price is not None:
        docs = [d for d in docs if (d.get("price") or 0) <= max_price]
    if min_rating is not None:
        docs = [d for d in docs if (d.get("rating") or 0) >= min_rating]
    if amenities_param:
        required = [a.strip().lower() for a in amenities_param.split(",") if a.strip()]
        if required:
            docs = [d for d in docs if required
                    and all(r in [a.lower() for a in d.get("amenities", [])] for r in required)]

    if sort_by == "price-asc":
        docs.sort(key=lambda d: d.get("price") or 0)
    elif sort_by == "price-desc":
        docs.sort(key=lambda d: d.get("price") or 0, reverse=True)
    elif sort_by == "rating":
        docs.sort(key=lambda d: d.get("rating") or 0, reverse=True)
    elif sort_by == "name":
        docs.sort(key=lambda d: d.get("name", "").lower())

    skip = request.args.get("skip", 0, type=int)
    limit = request.args.get("limit", 50, type=int)
    limit = min(limit, 200)
    docs = docs[skip:skip + limit]

    return jsonify(docs), 200


@hotels_bp.route("/<int:hotel_id>", methods=["GET"])
def get_hotel(hotel_id: int):
    coll = get_collection("hotels")
    doc = coll.find_one({"id": hotel_id})
    if not doc:
        return jsonify({"error": "Hotel not found"}), 404
    doc.pop("_id", None)
    return jsonify(doc), 200


@hotels_bp.route("", methods=["POST"])
@token_required
def create_hotel():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    try:
        hotel = HotelCreate(**data)
    except Exception as e:
        return jsonify({"error": str(e)}), 422

    coll = get_collection("hotels")
    doc = hotel.model_dump()
    doc["id"] = int(uuid.uuid4().int & ((1 << 53) - 1))
    doc["slug"] = _slugify(hotel.name)
    doc["reviews"] = 0

    coll.insert_one(doc)
    doc.pop("_id", None)
    return jsonify(doc), 201


@hotels_bp.route("/<int:hotel_id>", methods=["PUT"])
@token_required
def update_hotel(hotel_id: int):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    try:
        updates = HotelUpdate(**data)
    except Exception as e:
        return jsonify({"error": str(e)}), 422

    coll = get_collection("hotels")
    existing = coll.find_one({"id": hotel_id})
    if not existing:
        return jsonify({"error": "Hotel not found"}), 404

    update_data = updates.model_dump(exclude_unset=True)
    if "name" in update_data:
        update_data["slug"] = _slugify(update_data["name"])

    if update_data:
        coll.update_one({"id": hotel_id}, {"$set": update_data})

    doc = coll.find_one({"id": hotel_id})
    doc.pop("_id", None)
    return jsonify(doc), 200


@hotels_bp.route("/<int:hotel_id>", methods=["DELETE"])
@token_required
def delete_hotel(hotel_id: int):
    coll = get_collection("hotels")
    result = coll.delete_one({"id": hotel_id})
    if result.deleted_count == 0:
        return jsonify({"error": "Hotel not found"}), 404
    return jsonify({"message": "Hotel deleted"}), 200
