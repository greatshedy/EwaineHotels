import logging
import sys
from flask import Flask, jsonify, request
from flask_cors import CORS
from database import get_db
from config import settings
from extensions import limiter
from routes.auth import auth_bp
from routes.hotels import hotels_bp
from routes.bookings import bookings_bp
from routes.featured import featured_bp
from routes.destinations import destinations_bp
from routes.testimonials import testimonials_bp
from routes.team import team_bp
from routes.settings import settings_bp
from routes.users import users_bp
from routes.favorites import favorites_bp
from routes.recent import recent_bp
from routes.blog import blog_bp


def create_app():
    app = Flask(__name__)

    app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

    origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
    CORS(app, resources={r"/api/*": {"origins": origins if origins != ["*"] else "*"}})

    limiter.init_app(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(hotels_bp)
    app.register_blueprint(bookings_bp)
    app.register_blueprint(featured_bp)
    app.register_blueprint(destinations_bp)
    app.register_blueprint(testimonials_bp)
    app.register_blueprint(team_bp)
    app.register_blueprint(settings_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(favorites_bp)
    app.register_blueprint(recent_bp)
    app.register_blueprint(blog_bp)

    @app.before_request
    def log_request():
        app.logger.info("%s %s", request.method, request.path)

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": "Bad request"}), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(413)
    def payload_too_large(e):
        return jsonify({"error": "Request body too large"}), 413

    @app.errorhandler(422)
    def unprocessable(e):
        return jsonify({"error": "Unprocessable entity"}), 422

    @app.errorhandler(429)
    def rate_limit_exceeded(e):
        return jsonify({"error": "Rate limit exceeded"}), 429

    @app.errorhandler(500)
    def internal_error(e):
        app.logger.exception("Internal server error")
        return jsonify({"error": "Internal server error"}), 500

    @app.route("/api/health", methods=["GET"])
    def health():
        try:
            get_db()
            return jsonify({"status": "ok"}), 200
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    return app


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
        stream=sys.stdout,
    )

    app = create_app()

    if settings.flask_env == "production":
        from waitress import serve
        serve(app, host="0.0.0.0", port=5000)
    else:
        app.run(debug=True, host="0.0.0.0", port=5000)
