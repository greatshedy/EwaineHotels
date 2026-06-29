import re
import uuid
import bcrypt
import jwt
import datetime
from functools import wraps
from flask import Blueprint, request, jsonify
from database import get_collection
from config import settings
from schemas import UserRegister, UserLogin, UserProfileUpdate

users_bp = Blueprint("users", __name__, url_prefix="/api/auth")

USER_JWT_EXPIRY = 720


def user_token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid token"}), 401
        token = auth_header.split(" ", 1)[1]
        try:
            payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
            request.user_email = payload["email"]
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated


@users_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    try:
        creds = UserRegister(**data)
    except Exception as e:
        return jsonify({"error": str(e)}), 422

    if not re.match(r"[^@]+@[^@]+\.[^@]+", creds.email):
        return jsonify({"error": "Invalid email format"}), 422

    if len(creds.password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 422

    users = get_collection("users")
    existing = users.find_one({"email": creds.email})
    if existing:
        return jsonify({"error": "Email already registered"}), 409

    password_hash = bcrypt.hashpw(creds.password.encode(), bcrypt.gensalt()).decode()
    user = {
        "email": creds.email,
        "name": creds.name or "",
        "phone": "",
        "password_hash": password_hash,
        "createdAt": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    users.insert_one(user)

    expiry = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=USER_JWT_EXPIRY)
    token = jwt.encode({"email": creds.email, "exp": expiry}, settings.jwt_secret, algorithm="HS256")

    return jsonify({"token": token, "email": creds.email, "name": creds.name}), 201


@users_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    try:
        creds = UserLogin(**data)
    except Exception as e:
        return jsonify({"error": str(e)}), 422

    users = get_collection("users")
    user = users.find_one({"email": creds.email})
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    if not bcrypt.checkpw(creds.password.encode(), user["password_hash"].encode()):
        return jsonify({"error": "Invalid email or password"}), 401

    expiry = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=USER_JWT_EXPIRY)
    token = jwt.encode({"email": creds.email, "exp": expiry}, settings.jwt_secret, algorithm="HS256")

    return jsonify({"token": token, "email": creds.email, "name": user.get("name", "")}), 200


@users_bp.route("/profile", methods=["GET"])
@user_token_required
def get_profile():
    users = get_collection("users")
    user = users.find_one({"email": request.user_email})
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({
        "email": user["email"],
        "name": user.get("name", ""),
        "phone": user.get("phone", ""),
    }), 200


@users_bp.route("/profile", methods=["PUT"])
@user_token_required
def update_profile():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    update_data = {}
    if "name" in data:
        update_data["name"] = (data["name"] or "").strip()
    if "phone" in data:
        update_data["phone"] = (data["phone"] or "").strip()

    if not update_data:
        return jsonify({"error": "No fields to update"}), 400

    users = get_collection("users")
    users.update_one({"email": request.user_email}, {"$set": update_data})

    user = users.find_one({"email": request.user_email})
    return jsonify({
        "email": user["email"],
        "name": user.get("name", ""),
        "phone": user.get("phone", ""),
    }), 200
