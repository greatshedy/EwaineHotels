import uuid
from flask import Blueprint, request, jsonify
from database import get_collection
from routes.auth import token_required

testimonials_bp = Blueprint("testimonials", __name__, url_prefix="/api/testimonials")


@testimonials_bp.route("", methods=["GET"])
def list_testimonials():
    coll = get_collection("testimonials")
    docs = list(coll.find({}))
    for d in docs:
        d.pop("_id", None)
    return jsonify(docs), 200


@testimonials_bp.route("", methods=["POST"])
@token_required
def create_testimonial():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    name = (data.get("name") or "").strip()
    text = (data.get("text") or "").strip()
    if not name or not text:
        return jsonify({"error": "name and text are required"}), 422

    coll = get_collection("testimonials")
    doc = {
        "id": int(uuid.uuid4().int & ((1 << 53) - 1)),
        "name": name,
        "role": (data.get("role") or "").strip(),
        "avatar": (data.get("avatar") or "").strip(),
        "rating": min(5, max(1, int(data.get("rating") or 5))),
        "text": text,
    }
    coll.insert_one(doc)
    doc.pop("_id", None)
    return jsonify(doc), 201


@testimonials_bp.route("/<int:testimonial_id>", methods=["PUT"])
@token_required
def update_testimonial(testimonial_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    coll = get_collection("testimonials")
    existing = coll.find_one({"id": testimonial_id})
    if not existing:
        return jsonify({"error": "Testimonial not found"}), 404

    update_data = {}
    if "name" in data:
        update_data["name"] = (data["name"] or "").strip()
    if "role" in data:
        update_data["role"] = (data["role"] or "").strip()
    if "avatar" in data:
        update_data["avatar"] = (data["avatar"] or "").strip()
    if "rating" in data:
        update_data["rating"] = min(5, max(1, int(data["rating"])))
    if "text" in data:
        update_data["text"] = (data["text"] or "").strip()

    if update_data:
        coll.update_one({"id": testimonial_id}, {"$set": update_data})

    doc = coll.find_one({"id": testimonial_id})
    doc.pop("_id", None)
    return jsonify(doc), 200


@testimonials_bp.route("/<int:testimonial_id>", methods=["DELETE"])
@token_required
def delete_testimonial(testimonial_id):
    coll = get_collection("testimonials")
    result = coll.delete_one({"id": testimonial_id})
    if result.deleted_count == 0:
        return jsonify({"error": "Testimonial not found"}), 404
    return jsonify({"message": "Testimonial deleted"}), 200
