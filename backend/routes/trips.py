

from flask import Blueprint, request, jsonify
from db import db
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.trips import Trips
from models.trip_members import TripMembers

trips_bp = Blueprint("trips", __name__)

@trips_bp.route("/", methods=["GET"])
def get_user_trips():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id required"}), 400
    try:
        memberships = TripMembers.query.filter_by(userid=int(user_id)).all()
        result = []
        for m in memberships:
            trip = Trips.query.get(m.tripid)
            if trip:
                result.append({
                    "TRIPID": trip.tripid,
                    "TRIP_NAME": trip.tripname,
                    "JOIN_CODE": trip.joincode,
                    "START_DATE": str(trip.start_date) if trip.start_date else None,
                    "END_DATE": str(trip.end_date) if trip.end_date else None,
                    "CREATED_BY": trip.created_by,
                    "ROLE": m.role,
                })
        return jsonify(result)
    except Exception as e:
        print("GET TRIPS ERROR:", e)
        return jsonify({"error": str(e)}), 500

@trips_bp.route("/join", methods=["POST"])
def join_trip():
    data = request.json
    user_id   = data.get("user_id")
    join_code = data.get("join_code")
    if not all([user_id, join_code]):
        return jsonify({"error": "Missing user_id or join_code"}), 400
    try:
        trip = Trips.query.filter_by(joincode=join_code.upper()).first()
        if not trip:
            return jsonify({"error": "Invalid join code"}), 404
        existing = TripMembers.query.filter_by(tripid=trip.tripid, userid=int(user_id)).first()
        if existing:
            return jsonify({"error": "Already a member"}), 400
        member = TripMembers(tripid=trip.tripid, userid=int(user_id), role="member")
        db.session.add(member)
        db.session.commit()
        return jsonify({"message": "Joined trip", "trip_id": trip.tripid})
    except Exception as e:
        db.session.rollback()
        print("JOIN TRIP ERROR:", e)
        return jsonify({"error": str(e)}), 500

@trips_bp.route("/", methods=["POST"])
def create_trip():
    from datetime import datetime
    data = request.json
    user_id    = data.get("user_id")
    trip_name  = data.get("trip_name")
    start_date = data.get("start_date")
    end_date   = data.get("end_date")

    if not all([user_id, trip_name, start_date, end_date]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        # 2. CONVERSION LOGIC
        # Based on your screenshots, the frontend is sending YYYY-MM-DD 
        date_format = "%Y-%m-%d"
        start_date_obj = datetime.strptime(start_date, date_format).date()
        end_date_obj = datetime.strptime(end_date, date_format).date()

        trip = Trips(
            tripname=trip_name,
            start_date=start_date_obj,  # <--- 3. Use the converted objects
            end_date=end_date_obj,      # <---
            created_by=int(user_id)
        )
        db.session.add(trip)
        db.session.flush()

        member = TripMembers(
            tripid=trip.tripid,
            userid=int(user_id),
            role="admin"
        )
        db.session.add(member)
        db.session.commit()

        return jsonify({
            "message": "Trip created",
            "trip_id": trip.tripid,
            "join_code": trip.joincode
        }), 201
    except Exception as e:
        db.session.rollback()
        print("CREATE TRIP ERROR:", e)
        return jsonify({"error": str(e)}), 500

# this is for the trip members page to show the members of a specific trip
@trips_bp.route("/<int:trip_id>/members", methods=["GET"])
def get_trip_members(trip_id):
    try:
        result = db.session.execute(
            db.text("""
                SELECT u.USERID, u.USERNAME, u.FIRST_NAME, u.LAST_NAME, tm.ROLE
                FROM TRIP_MEMBERS tm
                JOIN USERS u ON tm.USERID = u.USERID
                WHERE tm.TRIPID = :trip_id
            """),
            {"trip_id": trip_id}
        ).fetchall()
        return jsonify([dict(r._mapping) for r in result])
    except Exception as e:
        print("GET MEMBERS ERROR:", e)
        return jsonify({"error": str(e)}), 500
