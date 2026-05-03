from flask import Flask, send_from_directory
from flask_cors import CORS
from db import db
import os

# blueprints
from routes.users import users_bp
from routes.auth import auth_bp  
from routes.discover import discover_bp
from routes.trips import trips_bp
from routes.proposals import proposals_bp
from routes.itinerary_items import itinerary_items_bp
from routes.budget import budget_bp
from routes.polls import polls_bp

def create_app():
    app = Flask(__name__)

    # -------------------
    # Config
    # -------------------
    app.config["SQLALCHEMY_DATABASE_URI"] = (
        "oracle+oracledb://chealy5:chealy5@172.22.133.114:1539/?service_name=xepdb1"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = "dev-secret-key"

    # -------------------
    # Init extensions
    # -------------------
    CORS(app)
    db.init_app(app)

    # -------------------
    # Register blueprints
    # -------------------
    app.register_blueprint(users_bp, url_prefix="/users")

    try:
        app.register_blueprint(auth_bp, url_prefix="/auth")
    except:
        pass

    try:
        app.register_blueprint(discover_bp)
    except:
        pass

    try:
        app.register_blueprint(trips_bp, url_prefix="/trips")
    except:
        pass

    try:
        app.register_blueprint(proposals_bp, url_prefix="/proposals")
    except:
        pass

    try:
        app.register_blueprint(itinerary_items_bp, url_prefix="/itinerary_items")
    except:
        pass

    app.register_blueprint(budget_bp, url_prefix="/api/budget")

    try:
        app.register_blueprint(polls_bp, url_prefix="/api/polls")
    except:
        pass

    # -------------------
    # React frontend path
    # -------------------
    BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # travel/
    FRONTEND_DIST = os.path.join(BASE_DIR, "frontend/dist")

    # -------------------
    # Serve React
    # -------------------
    @app.route("/")
    def serve_react():
        return send_from_directory(FRONTEND_DIST, "index.html")

    @app.route("/<path:path>")
    def serve_static(path):
        file_path = os.path.join(FRONTEND_DIST, path)

        if os.path.exists(file_path):
            return send_from_directory(FRONTEND_DIST, path)

        return send_from_directory(FRONTEND_DIST, "index.html")

    return app


# -------------------
# Dev only (NOT for Gunicorn)
# -------------------
if __name__ == "__main__":
    app = create_app()

    with app.app_context():
        db.create_all()

    app.run(host="0.0.0.0", port=8005, debug=True)
