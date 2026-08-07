import hmac
import hashlib
import uuid
from datetime import datetime, timezone

import requests
from flask import Blueprint, request, jsonify
from database import get_collection
from schemas import BookingCreate
from config import settings

payments_bp = Blueprint("payments", __name__, url_prefix="/api/payments")

FLW_BASE_URL = "https://api.flutterwave.com/v3"
FLW_TITLE = "Ewaine Hotels Booking"
FLW_DESCRIPTION = "Hotel booking payment"


def _flw_headers():
    return {
        "Authorization": f"Bearer {settings.flutterwave_secret_key}",
        "Content-Type": "application/json",
    }


def _redirect_url():
    if settings.flutterwave_redirect_url:
        return settings.flutterwave_redirect_url
    origin = request.headers.get("Origin") or request.headers.get("Referer")
    if origin:
        return f"{origin.rstrip('/')}/payment/status"
    return "http://localhost:5173/payment/status"


def _validate_booking(data):
    try:
        booking = BookingCreate(**data)
    except Exception as e:
        return None, ({"error": str(e)}, 422)

    try:
        check_in = datetime.fromisoformat(booking.checkIn)
        check_out = datetime.fromisoformat(booking.checkOut)
    except (ValueError, TypeError):
        return None, ({"error": "Invalid date format; use ISO 8601"}, 422)

    if check_out <= check_in:
        return None, ({"error": "checkOut must be after checkIn"}, 422)

    if check_in.date() < datetime.now(check_in.tzinfo).date():
        return None, ({"error": "checkIn cannot be in the past"}, 422)

    coll = get_collection("bookings")
    overlapping = coll.find_one({
        "hotelId": booking.hotelId,
        "roomType": booking.roomType,
        "checkIn": {"$lt": booking.checkOut},
        "checkOut": {"$gt": booking.checkIn},
        "status": {"$ne": "cancelled"},
    })
    if overlapping:
        return None, ({"error": "Room not available for the selected dates"}, 409)

    return booking, None


@payments_bp.route("/initialize", methods=["POST"])
def initialize_payment():
    if not settings.flutterwave_secret_key:
        return jsonify({"error": "Payments are not configured"}), 501

    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    booking, err = _validate_booking(data)
    if err:
        return jsonify(err[0]), err[1]

    coll = get_collection("bookings")
    doc = booking.model_dump()
    doc["id"] = int(uuid.uuid4().int & ((1 << 53) - 1))
    tx_ref = f"EWAINE-{doc['id']}"
    doc["status"] = "pending"
    doc["paymentStatus"] = "unpaid"
    doc["txRef"] = tx_ref
    doc["createdAt"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    coll.insert_one(doc)

    payload = {
        "tx_ref": tx_ref,
        "amount": round(float(booking.totalPrice), 2),
        "currency": settings.flutterwave_currency or "USD",
        "redirect_url": _redirect_url(),
        "customer": {
            "email": booking.guestEmail,
            "name": booking.guestName,
        },
        "customizations": {
            "title": FLW_TITLE,
            "description": (
                f"{booking.hotelName} - {booking.roomType} "
                f"({booking.checkIn} to {booking.checkOut})"
            ),
        },
        "meta": {"bookingId": doc["id"]},
    }

    try:
        resp = requests.post(
            f"{FLW_BASE_URL}/payments", json=payload, headers=_flw_headers(), timeout=30
        )
        body = resp.json() if resp.content else {}
    except requests.RequestException:
        coll.delete_one({"id": doc["id"]})
        return jsonify({"error": "Payment service unavailable"}), 502

    link = (body.get("data") or {}).get("link")
    if not resp.ok or body.get("status") != "success" or not link:
        coll.delete_one({"id": doc["id"]})
        return jsonify({"error": "Failed to initialize payment"}), 502

    return jsonify({"paymentLink": link, "txRef": tx_ref, "bookingId": doc["id"]}), 201


@payments_bp.route("/verify", methods=["GET"])
def verify_payment():
    tx_ref = request.args.get("tx_ref", "").strip()
    if not tx_ref:
        return jsonify({"error": "tx_ref is required"}), 400

    coll = get_collection("bookings")
    booking = coll.find_one({"txRef": tx_ref})
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if booking.get("status") == "confirmed":
        booking.pop("_id", None)
        return jsonify({"status": "confirmed", "paymentStatus": "paid", "booking": booking}), 200

    try:
        resp = requests.get(
            f"{FLW_BASE_URL}/transactions/verify_by_reference?tx_ref={tx_ref}",
            headers=_flw_headers(),
            timeout=30,
        )
        body = resp.json() if resp.content else {}
    except requests.RequestException:
        return jsonify({"error": "Payment service unavailable"}), 502

    data = body.get("data") or {}
    flw_status = (data.get("status") or "").lower()
    success = resp.ok and flw_status == "successful"

    new_status = "confirmed" if success else "cancelled"
    coll.update_one(
        {"id": booking["id"]},
        {"$set": {"status": new_status, "paymentStatus": "paid" if success else "failed"}},
    )

    booking = coll.find_one({"id": booking["id"]})
    booking.pop("_id", None)
    return jsonify({"status": new_status, "paymentStatus": booking["paymentStatus"], "booking": booking}), 200


@payments_bp.route("/webhook", methods=["POST"])
def payment_webhook():
    if not settings.flutterwave_secret_key:
        return jsonify({"error": "Webhook not configured"}), 501

    raw = request.get_data()
    signature = request.headers.get("verif-hash", "")
    expected = hmac.new(settings.flutterwave_secret_key.encode(), raw, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, signature):
        return jsonify({"error": "Invalid signature"}), 401

    body = request.get_json(silent=True) or {}
    data = body.get("data") or {}
    tx_ref = data.get("tx_ref", "")
    if not tx_ref:
        return jsonify({"status": "ignored"}), 200

    coll = get_collection("bookings")
    booking = coll.find_one({"txRef": tx_ref})
    if not booking:
        return jsonify({"status": "ignored"}), 200

    if body.get("event") == "charge.completed" and (data.get("status") or "").lower() == "successful":
        coll.update_one({"id": booking["id"]}, {"$set": {"status": "confirmed", "paymentStatus": "paid"}})

    return jsonify({"status": "ok"}), 200
