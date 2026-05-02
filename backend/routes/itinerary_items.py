
from flask import Blueprint, request, jsonify
from db import db
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.proposals import Proposal
from models.itinerary_items import ItineraryItem
from models.trips import Trips
from datetime import datetime

itinerary_items_bp = Blueprint("itinerary_items", __name__)

@itinerary_items_bp.route("/", methods=["GET"])
def get_itinerary_items():
    trip_id = request.args.get("trip_id")
    if not trip_id:
        return jsonify({"error": "trip_id required"}), 400
    try:
        items = (
            db.session.query(ItineraryItem, Proposal)
            .join(Proposal, ItineraryItem.proposalid == Proposal.proposalid)
            .filter(ItineraryItem.tripid == int(trip_id))
            .order_by(ItineraryItem.sequence_order)
            .all()
        )
        result = []
        for i, p in items:
            result.append({
                "ITINERARYID": i.itineraryid,
                "TRIPID": i.tripid,
                "PROPOSALID": i.proposalid,
                "SEQUENCE_ORDER": i.sequence_order,
                "CONFIRMED_AT": str(i.confirmed_at) if i.confirmed_at else None,
                "TITLE": p.title,
                "DESCRIPTION": p.description,
                "CATEGORY": p.category,
                "LOCATION": p.location,
                "START_DATETIME": str(p.start_datetime) if p.start_datetime else None,
                "END_DATETIME": str(p.end_datetime) if p.end_datetime else None,
                "PROPOSED_BY": p.proposed_by,
            })
        return jsonify(result)
    except Exception as e:
        print("GET ITINERARY ERROR:", e)
        return jsonify({"error": str(e)}), 500

@itinerary_items_bp.route("/", methods=["POST"])
def add_itinerary_item():
    data = request.json
    trip_id = data.get("trip_id")
    user_id = data.get("user_id")
    title   = data.get("title")
    if not all([trip_id, user_id, title]):
        return jsonify({"error": "Missing required fields"}), 400
    try:
        start = datetime.fromisoformat(data["start_datetime"]) if data.get("start_datetime") else None
        end   = datetime.fromisoformat(data["end_datetime"])   if data.get("end_datetime")   else None

        # Ghost proposal - auto approved
        proposal = Proposal(
            tripid=int(trip_id),
            proposed_by=int(user_id),
            title=title,
            description=data.get("description", ""),
            category=data.get("category", "Activity"),
            location=data.get("location", ""),
            start_datetime=start,
            end_datetime=end,
            status="approved"
        )
        db.session.add(proposal)
        db.session.flush()

        max_seq = db.session.query(db.func.max(ItineraryItem.sequence_order)).filter_by(
            tripid=int(trip_id)
        ).scalar() or 0

        item = ItineraryItem(
            tripid=int(trip_id),
            proposalid=proposal.proposalid,
            sequence_order=max_seq + 1,
        )
        db.session.add(item)
        db.session.commit()
        return jsonify({"message": "Item added", "itineraryid": item.itineraryid}), 201
    except Exception as e:
        db.session.rollback()
        print("ADD ITINERARY ERROR:", e)
        return jsonify({"error": str(e)}), 500

@itinerary_items_bp.route("/<int:item_id>", methods=["DELETE"])
def delete_item(item_id):
    try:
        item = ItineraryItem.query.get(item_id)
        if not item:
            return jsonify({"error": "Item not found"}), 404
        db.session.delete(item)
        db.session.commit()
        return jsonify({"message": "Item deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



