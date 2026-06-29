from flask import Blueprint, request, jsonify
from database import get_collection
from routes.auth import token_required

settings_bp = Blueprint("settings", __name__, url_prefix="/api/settings")


@settings_bp.route("", methods=["GET"])
def get_settings():
    coll = get_collection("settings")
    doc = coll.find_one({"key": "whatsapp"})
    if not doc:
        return jsonify({"whatsapp": ""}), 200
    return jsonify({"whatsapp": doc.get("value", "")}), 200


@settings_bp.route("", methods=["PUT"])
@token_required
def update_settings():
    data = request.get_json()
    if not data or "whatsapp" not in data:
        return jsonify({"error": "whatsapp field required"}), 400

    whatsapp = str(data["whatsapp"]).strip()
    coll = get_collection("settings")
    existing = coll.find_one({"key": "whatsapp"})
    if existing:
        coll.update_one({"key": "whatsapp"}, {"$set": {"value": whatsapp}})
    else:
        coll.insert_one({"key": "whatsapp", "value": whatsapp})
    return jsonify({"whatsapp": whatsapp}), 200
