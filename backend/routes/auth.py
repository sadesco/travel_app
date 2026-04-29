from flask import Blueprint, request, jsonify
from models.user import User
from db import db

auth_bp = Blueprint("auth", __name__)

# ----------------------
# REGISTER
# ----------------------
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json

    username = data.get("username")
    password = data.get("password")
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    email = data.get("email")

    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400

    # ensure it is a valid and unique username
    existing = User.query.filter_by(username=username).first()
    if existing:
        return jsonify({"error": "User already exists"}), 400
    
    if len(username) < 3:
        return jsonify({"error": "Username must be at least 3 characters"}), 400

    #check if it seems like a valid email
    if not email:
        return jsonify({"error": "Email required"}), 400

    existing_email = User.query.filter_by(user_email=email).first()
    if existing_email:
        return jsonify({"error": "Email already in use"}), 400

    # basic regex to see if it gives email vibes and seems legit
    import re
    EMAIL_REGEX = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"

    if not re.match(EMAIL_REGEX, email):
        return jsonify({"error": "Invalid email"}), 400
    
    # Require streong password
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    user = User(
        username=username,
        first_name=first_name,
        last_name=last_name,
        user_email=email
    )

    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "User created",
        "user": {
            "username": user.username,
            "user_id": user.userid
        }
    })

# ----------------------
# LOGIN
# ----------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()

    print("LOGIN HIT:", data)
    print("USER FOUND:", user)

    if user:
        print("RAW USER OBJECT:", user.__dict__)

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    print("PASSWORD HASH IN DB:", user.password_hash)

    if not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({
        "message": "Login successful",
        "username": user.username,
        "user_id": user.userid
    })