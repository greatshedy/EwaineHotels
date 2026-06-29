import uuid
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from database import get_collection
from schemas import BookingCreate, BookingStatusUpdate
from routes.auth import token_required

bookings_bp = Blueprint("bookings", __name__, url_prefix="/api/bookings")


@bookings_bp.route("", methods=["GET"])
def list_bookings():
    coll = get_collection("bookings")
    email = request.args.get("email", "").strip()
    if email:
        docs = list(coll.find({"guestEmail": email}))
    else:
        docs = list(coll.find({}))
    for d in docs:
        d.pop("_id", None)
    return jsonify(docs), 200


@bookings_bp.route("", methods=["POST"])
def create_booking():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    try:
        booking = BookingCreate(**data)
    except Exception as e:
        return jsonify({"error": str(e)}), 422

    try:
        check_in = datetime.fromisoformat(booking.checkIn)
        check_out = datetime.fromisoformat(booking.checkOut)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid date format; use ISO 8601"}), 422

    if check_out <= check_in:
        return jsonify({"error": "checkOut must be after checkIn"}), 422

    if check_in < datetime.now().astimezone(check_in.tzinfo or None):
        return jsonify({"error": "checkIn cannot be in the past"}), 422

    coll = get_collection("bookings")
    overlapping = coll.find_one({
        "hotelId": booking.hotelId,
        "roomType": booking.roomType,
        "checkIn": {"$lt": booking.checkOut},
        "checkOut": {"$gt": booking.checkIn},
        "status": {"$ne": "cancelled"},
    })
    if overlapping:
        return jsonify({"error": "Room not available for the selected dates"}), 409

    doc = booking.model_dump()
    doc["id"] = int(uuid.uuid4().int & ((1 << 53) - 1))
    doc["status"] = "pending"
    doc["createdAt"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    coll.insert_one(doc)
    doc.pop("_id", None)
    return jsonify(doc), 201


@bookings_bp.route("/<int:booking_id>", methods=["PATCH"])
@token_required
def update_booking_status(booking_id: int):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    try:
        status_update = BookingStatusUpdate(**data)
    except Exception as e:
        return jsonify({"error": str(e)}), 422

    coll = get_collection("bookings")
    existing = coll.find_one({"id": booking_id})
    if not existing:
        return jsonify({"error": "Booking not found"}), 404

    coll.update_one(
        {"id": booking_id},
        {"$set": {"status": status_update.status}},
    )

    doc = coll.find_one({"id": booking_id})
    doc.pop("_id", None)
    return jsonify(doc), 200
