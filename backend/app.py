import os
import logging
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from routes.api import api_bp

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("EmailSpamDetectorAPI")

def create_app():
    # Detect if frontend production build exists
    frontend_dist_dir = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
    )
    static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "static"))

    dist_folder = None
    if os.path.exists(static_dir) and os.path.exists(os.path.join(static_dir, "index.html")):
        dist_folder = static_dir
    elif os.path.exists(frontend_dist_dir) and os.path.exists(os.path.join(frontend_dist_dir, "index.html")):
        dist_folder = frontend_dist_dir

    if dist_folder:
        app = Flask(__name__, static_folder=dist_folder, static_url_path="")
    else:
        app = Flask(__name__)

    # Enable CORS for frontend clients
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register API blueprint
    app.register_blueprint(api_bp, url_prefix="/api")

    # If frontend dist exists, serve the Single Page Application
    if dist_folder:
        @app.route("/", defaults={"path": ""})
        @app.route("/<path:path>")
        def serve_frontend(path):
            if path != "" and os.path.exists(os.path.join(dist_folder, path)):
                return send_from_directory(dist_folder, path)
            return send_from_directory(dist_folder, "index.html")
    else:
        @app.route("/", methods=["GET"])
        def index():
            return jsonify({
                "service": "AI-Powered Email Spam Detection API",
                "version": "1.0.0",
                "status": "healthy",
                "endpoints": [
                    "/api/health",
                    "/api/predict",
                    "/api/model-info",
                    "/api/dataset-stats",
                    "/api/samples"
                ]
            })

    @app.errorhandler(404)
    def handle_not_found(e):
        return jsonify({"error": "Endpoint not found"}), 404

    @app.errorhandler(500)
    def handle_server_error(e):
        logger.error(f"Internal server error: {e}")
        return jsonify({"error": "Internal server error occurred"}), 500

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"Starting Email Spam Detection API server on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
