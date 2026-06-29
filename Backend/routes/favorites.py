import uuid
from flask import Blueprint, request, jsonify
from database import get_collection

favorites_bp = Blueprint("favorites", __name__, url_prefix="/api/favorites")


@favorites_bp.route("", methods=["GET"])
def list_favorites():
    email = request.args.get("email", "").strip()
    if not email:
        return jsonify({"error": "email query param required"}), 400

    coll = get_collection("favorites")
    docs = list(coll.find({"email": email}))
    favs = [d.get("hotelId") for d in docs]
    return jsonify(favs), 200


@favorites_bp.route("", methods=["POST"])
def add_favorite():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    email = (data.get("email") or "").strip()
    hotel_id = data.get("hotelId")
    if not email or hotel_id is None:
        return jsonify({"error": "email and hotelId are required"}), 422

    coll = get_collection("favorites")
    existing = coll.find_one({"email": email, "hotelId": hotel_id})
    if existing:
        return jsonify({"message": "Already favorited"}), 200

    coll.insert_one({
        "id": int(uuid.uuid4().int & ((1 << 53) - 1)),
        "email": email,
        "hotelId": hotel_id,
    })

    return jsonify({"message": "Added to favorites"}), 201


@favorites_bp.route("/<int:hotel_id>", methods=["DELETE"])
def remove_favorite(hotel_id):
    email = request.args.get("email", "").strip()
    if not email:
        return jsonify({"error": "email query param required"}), 400

    coll = get_collection("favorites")
    result = coll.delete_one({"email": email, "hotelId": hotel_id})
    if result.deleted_count == 0:
        return jsonify({"error": "Favorite not found"}), 404
    return jsonify({"message": "Removed from favorites"}), 200
