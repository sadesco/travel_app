from flask import Blueprint, jsonify, request
from db import db
from models.user import User


users_bp = Blueprint("users", __name__)

@users_bp.route("/<int:user_id>", methods=["PATCH"])
def update_user(user_id):
    data = request.json
    import re
    EMAIL_REGEX = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        if "username" in data:
            if len(data["username"]) < 3:
                return jsonify({"error": "Username must be at least 3 characters"}), 400
            existing = User.query.filter(User.username == data["username"], User.userid != user_id).first()
            if existing:
                return jsonify({"error": "User already exists"}), 400
            user.username = data["username"]

        if "email" in data:
            if not data["email"]:
                return jsonify({"error": "Email required"}), 400
            if not re.match(EMAIL_REGEX, data["email"]):
                return jsonify({"error": "Invalid email"}), 400
            existing_email = User.query.filter(User.user_email == data["email"], User.userid != user_id).first()
            if existing_email:
                return jsonify({"error": "Email already in use"}), 400
            user.user_email = data["email"]

        if "first_name" in data:
            user.first_name = data["first_name"]
        if "last_name" in data:
            user.last_name = data["last_name"]

        if "password" in data and data["password"]:
            if len(data["password"]) < 6:
                return jsonify({"error": "Password must be at least 6 characters"}), 400
            user.set_password(data["password"])

        db.session.commit()
        return jsonify({"message": "User updated"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Username or email already in use"}), 409