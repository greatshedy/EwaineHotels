from flask import Blueprint, jsonify
from database import get_collection

destinations_bp = Blueprint("destinations", __name__, url_prefix="/api/destinations")


@destinations_bp.route("", methods=["GET"])
def list_destinations():
    coll = get_collection("destinations")
    docs = list(coll.find({}))
    for d in docs:
        d.pop("_id", None)
    return jsonify(docs), 200
