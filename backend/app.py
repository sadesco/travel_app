from flask import Flask
from flask_cors import CORS
from db import db


# blueprints
from routes.users import users_bp
from routes.auth import auth_bp  
from routes.discover import discover_bp
from routes.trips import trips_bp
from routes.proposals import proposals_bp

def create_app():
    app = Flask(__name__)

    # -------------------
    # Config
    # -------------------
    app.config["SQLALCHEMY_DATABASE_URI"] = (
    "oracle+oracledb://chealy5:chealy5@172.22.133.114:1539/?service_name=xepdb1"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = "dev-secret-key"  # change later

    # -------------------
    # Init extensions
    # -------------------
    CORS(app)
    db.init_app(app)

    # -------------------
    # Register blueprints
    # -------------------
    app.register_blueprint(users_bp, url_prefix="/users")

    # only register if they exist
    try:
        app.register_blueprint(auth_bp, url_prefix="/auth")
    except:
        pass

    try:
        app.register_blueprint(dashboard_bp, url_prefix="/dashboard")
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

# -------------------
    # Basic route
    # -------------------
    @app.route("/")
    def home():
        return {"message": "API running"}

    return app
    
# -------------------
# Run server
# -------------------
if __name__ == "__main__":
    app = create_app()

    with app.app_context():
        db.create_all()  # creates tables if they don’t exist

    app.run(host="0.0.0.0", port=8005, debug=True)
