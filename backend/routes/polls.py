from flask import Blueprint, request, jsonify
from db import db
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.proposals import Proposal
from models.itinerary_items import ItineraryItem
from models.polls import Poll
from models.poll_options import PollOption
from models.user import User
from datetime import datetime, timezone

polls_bp = Blueprint("polls", __name__)

@polls_bp.route("/", methods=["GET"])
def get_polls():
    trip_id = request.args.get("trip_id")
    user_id = request.args.get("user_id")
    if not trip_id:
        return jsonify({"error": "trip_id required"}), 400
    try:
        polls = Poll.query.filter_by(tripid=int(trip_id)).order_by(Poll.created_at.desc()).all()
        result = []
        for p in polls:
            creator = User.query.get(p.created_by)

            # auto-close if deadline has passed
            if p.deadline and datetime.now(timezone.utc) > p.deadline.replace(tzinfo=timezone.utc) and p.is_open:
                p.is_open = False
                db.session.commit()

            result.append({
                "POLLID": p.pollid,
                "TITLE": p.title,
                "TRIPID": p.tripid,
                "DEADLINE": str(p.deadline) if p.deadline else None,
                "IS_OPEN": p.is_open,
                "CREATED_AT": str(p.created_at) if p.created_at else None,
                "CREATED_BY": user.username if user else "Unknown",
            })
        return jsonify(result)
    except Exception as e:
        print("GET POLLS ERROR:", e)
        return jsonify({"error": str(e)}), 500