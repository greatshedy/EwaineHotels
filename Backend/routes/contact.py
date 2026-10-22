import requests
from flask import Blueprint, current_app, request, jsonify
from config import settings
from schemas import ContactMessage
from extensions import limiter

contact_bp = Blueprint("contact", __name__, url_prefix="/api/contact")

EMAILJS_SEND_URL = "https://api.emailjs.com/api/v1.0/email/send"


@contact_bp.route("", methods=["POST"])
@limiter.limit("5 per minute")
def send_contact():
    if not (
        settings.email_js_service_id
        and settings.email_js_template_id
        and settings.email_js_public_key
    ):
        return jsonify({"error": "Contact email is not configured"}), 501

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body required"}), 400

    try:
        msg = ContactMessage(**data)
    except Exception as e:
        return jsonify({"error": str(e)}), 422

    payload = {
        "service_id": settings.email_js_service_id,
        "template_id": settings.email_js_template_id,
        "user_id": settings.email_js_public_key,
        "accessToken": settings.email_js_private_key,
        "template_params": {
            "from_name": msg.name,
            "from_email": msg.email,
            "subject": msg.subject,
            "message": msg.message,
            "to_email": settings.contact_recipient,
        },
    }

    try:
        resp = requests.post(EMAILJS_SEND_URL, json=payload, timeout=30)
    except requests.RequestException:
        return jsonify({"error": "Email service unavailable"}), 502

    if not resp.ok:
        current_app.logger.warning(
            "EmailJS send failed (%s): %s", resp.status_code, resp.text
        )
        return jsonify({"error": "Failed to send message"}), 502

    return jsonify({"message": "Message sent"}), 201
