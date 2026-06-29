import bcrypt
import jwt
import datetime
from flask import Blueprint, request, jsonify
from functools import wraps
from config import settings
from database import get_collection
from schemas import AdminLogin
from extensions import limiter

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid token"}), 401
        token = auth_header.split(" ", 1)[1]
        try:
            payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
            request.admin_email = payload["email"]
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        return f(*args, **kwargs)

    return decorated


@auth_bp.route("/login", methods=["POST"])
@limiter.limit("10 per minute")
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    try:
        creds = AdminLogin(**data)
    except Exception as e:
        return jsonify({"error": str(e)}), 422

    admins = get_collection("admins")
    admin = admins.find_one({"email": creds.email})
    if not admin:
        return jsonify({"error": "Invalid email or password"}), 401

    if not bcrypt.checkpw(creds.password.encode(), admin["password_hash"].encode()):
        return jsonify({"error": "Invalid email or password"}), 401

    expiry = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(
        hours=settings.jwt_expiry_hours
    )
    token = jwt.encode(
        {"email": creds.email, "exp": expiry},
        settings.jwt_secret,
        algorithm="HS256",
    )

    return jsonify({"token": token, "email": creds.email}), 200


@auth_bp.route("/verify", methods=["GET"])
@token_required
def verify():
    return jsonify({"email": request.admin_email, "valid": True}), 200
