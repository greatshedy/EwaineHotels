from flask import Blueprint, jsonify
from database import get_collection

featured_bp = Blueprint("featured", __name__, url_prefix="/api/hotels")


@featured_bp.route("/featured", methods=["GET"])
def get_featured():
    coll = get_collection("hotels")
    docs = list(coll.find({"featured": True}))
    for d in docs:
        d.pop("_id", None)
    return jsonify(docs), 200
