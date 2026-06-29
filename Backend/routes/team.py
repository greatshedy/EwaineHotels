from flask import Blueprint, jsonify
from database import get_collection

team_bp = Blueprint("team", __name__, url_prefix="/api/team")


@team_bp.route("", methods=["GET"])
def list_team():
    coll = get_collection("team")
    docs = list(coll.find({}))
    for d in docs:
        d.pop("_id", None)
    return jsonify(docs), 200
