import re
import uuid
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from database import get_collection
from routes.auth import token_required

blog_bp = Blueprint("blog", __name__, url_prefix="/api/blog")


def _slugify(title: str) -> str:
    s = title.lower().replace(" ", "-").replace("/", "-")
    s = re.sub(r"[^a-z0-9-]", "", s).strip("-")
    return s[:80]


@blog_bp.route("", methods=["GET"])
def list_posts():
    all_param = request.args.get("all", "").strip().lower()
    coll = get_collection("blog")
    if all_param == "true":
        docs = list(coll.find({}).sort("createdAt", -1))
    else:
        docs = list(coll.find({"published": True}).sort("createdAt", -1))
    for d in docs:
        d.pop("_id", None)
    return jsonify(docs), 200


@blog_bp.route("/<slug>", methods=["GET"])
def get_post(slug):
    coll = get_collection("blog")
    doc = coll.find_one({"slug": slug})
    if not doc:
        return jsonify({"error": "Post not found"}), 404
    doc.pop("_id", None)
    return jsonify(doc), 200


@blog_bp.route("", methods=["POST"])
@token_required
def create_post():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    title = (data.get("title") or "").strip()
    content = (data.get("content") or "").strip()
    if not title or not content:
        return jsonify({"error": "title and content are required"}), 422

    coll = get_collection("blog")
    base_slug = _slugify(title)
    slug = base_slug
    counter = 1
    while coll.find_one({"slug": slug}):
        slug = f"{base_slug}-{counter}"
        counter += 1

    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    doc = {
        "id": int(uuid.uuid4().int & ((1 << 53) - 1)),
        "title": title,
        "slug": slug,
        "content": content,
        "excerpt": (data.get("excerpt") or "")[:300].strip(),
        "coverImage": (data.get("coverImage") or "").strip(),
        "author": (data.get("author") or "Admin").strip(),
        "tags": data.get("tags") or [],
        "published": bool(data.get("published", False)),
        "createdAt": now,
        "updatedAt": now,
    }
    coll.insert_one(doc)
    doc.pop("_id", None)
    return jsonify(doc), 201


@blog_bp.route("/<int:post_id>", methods=["PUT"])
@token_required
def update_post(post_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    coll = get_collection("blog")
    existing = coll.find_one({"id": post_id})
    if not existing:
        return jsonify({"error": "Post not found"}), 404

    update_data = {}
    if "title" in data:
        title = (data["title"] or "").strip()
        if title:
            update_data["title"] = title
            base_slug = _slugify(title)
            slug = base_slug
            counter = 1
            while coll.find_one({"slug": slug, "id": {"$ne": post_id}}):
                slug = f"{base_slug}-{counter}"
                counter += 1
            update_data["slug"] = slug
    if "content" in data:
        update_data["content"] = (data["content"] or "").strip()
    if "excerpt" in data:
        update_data["excerpt"] = (data["excerpt"] or "")[:300].strip()
    if "coverImage" in data:
        update_data["coverImage"] = (data["coverImage"] or "").strip()
    if "author" in data:
        update_data["author"] = (data["author"] or "").strip()
    if "tags" in data:
        update_data["tags"] = data.get("tags") or []
    if "published" in data:
        update_data["published"] = bool(data["published"])

    update_data["updatedAt"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    coll.update_one({"id": post_id}, {"$set": update_data})
    doc = coll.find_one({"id": post_id})
    doc.pop("_id", None)
    return jsonify(doc), 200


@blog_bp.route("/<int:post_id>", methods=["DELETE"])
@token_required
def delete_post(post_id):
    coll = get_collection("blog")
    result = coll.delete_one({"id": post_id})
    if result.deleted_count == 0:
        return jsonify({"error": "Post not found"}), 404
    return jsonify({"message": "Post deleted"}), 200
