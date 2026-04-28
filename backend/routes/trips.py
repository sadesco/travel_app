from flask import Blueprint, request, jsonify
from db import db
import random
import string

trips_bp = Blueprint("trips", __name__)

# GET all trips for a user
@trips_bp.route("/", methods=["GET"])
def get_user_trips():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id required"}), 400

    result = db.session.execute(db.text("""
        SELECT t.TRIPID, t.TRIP_NAME, t.JOIN_CODE, t.START_DATE, t.END_DATE,
               t.CREATED_BY, m.ROLE
        FROM TRIPS t
        JOIN TRIPMEMBERS m ON t.TRIPID = m.TRIPID
        WHERE m.USERID = :uid
    """), {"uid": user_id}).fetchall()

    return jsonify([dict(r._mapping) for r in result])


# GET single trip
@trips_bp.route("/<int:trip_id>", methods=["GET"])
def get_trip(trip_id):
    row = db.session.execute(db.text("""
        SELECT TRIPID, TRIP_NAME, JOIN_CODE, START_DATE, END_DATE, CREATED_BY, CREATED_AT
        FROM TRIPS WHERE TRIPID = :tid
    """), {"tid": trip_id}).fetchone()

    if not row:
        return jsonify({"error": "Trip not found"}), 404

    return jsonify(dict(row._mapping))


# POST create a trip
@trips_bp.route("/", methods=["POST"])
def create_trip():
    data = request.json
    user_id  = data.get("user_id")
    trip_name = data.get("trip_name")
    start_date = data.get("start_date")
    end_date   = data.get("end_date")

    if not all([user_id, trip_name, start_date, end_date]):
        return jsonify({"error": "Missing required fields"}), 400

    join_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

    db.session.execute(db.text("""
        INSERT INTO TRIPS (TRIP_NAME, JOIN_CODE, START_DATE, END_DATE, CREATED_BY, CREATED_AT)
        VALUES (:name, :code, TO_DATE(:start, 'YYYY-MM-DD'), TO_DATE(:end, 'YYYY-MM-DD'), :uid, SYSDATE)
    """), {"name": trip_name, "code": join_code, "start": start_date, "end": end_date, "uid": user_id})

    row = db.session.execute(db.text(
        "SELECT TRIPID FROM TRIPS WHERE JOIN_CODE = :code"
    ), {"code": join_code}).fetchone()

    trip_id = row._mapping["TRIPID"]

    db.session.execute(db.text("""
        INSERT INTO TRIPMEMBERS (TRIPID, USERID, ROLE, JOINED_AT)
        VALUES (:tid, :uid, 'admin', SYSDATE)
    """), {"tid": trip_id, "uid": user_id})

    db.session.commit()

    return jsonify({"message": "Trip created", "trip_id": trip_id, "join_code": join_code}), 201


# POST join a trip by code
@trips_bp.route("/join", methods=["POST"])
def join_trip():
    data = request.json
    user_id   = data.get("user_id")
    join_code = data.get("join_code")

    if not all([user_id, join_code]):
        return jsonify({"error": "Missing user_id or join_code"}), 400

    trip = db.session.execute(db.text(
        "SELECT TRIPID FROM TRIPS WHERE JOIN_CODE = :code"
    ), {"code": join_code.upper()}).fetchone()

    if not trip:
        return jsonify({"error": "Invalid join code"}), 404

    trip_id = trip._mapping["TRIPID"]

    existing = db.session.execute(db.text("""
        SELECT 1 FROM TRIPMEMBERS WHERE TRIPID = :tid AND USERID = :uid
    """), {"tid": trip_id, "uid": user_id}).fetchone()

    if existing:
        return jsonify({"error": "Already a member"}), 400

    db.session.execute(db.text("""
        INSERT INTO TRIPMEMBERS (TRIPID, USERID, ROLE, JOINED_AT)
        VALUES (:tid, :uid, 'member', SYSDATE)
    """), {"tid": trip_id, "uid": user_id})
    db.session.commit()

    return jsonify({"message": "Joined trip", "trip_id": trip_id})
