from flask import Blueprint, jsonify
from db import db

users_bp = Blueprint("users", __name__)

@users_bp.route("/")
def get_users():
    result = db.session.execute(
        db.text("SELECT USERID, USERNAME FROM USERS")
    ).fetchall()

    return jsonify([dict(r._mapping) for r in result])