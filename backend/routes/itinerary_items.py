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
    # get from both Itinerary_Items table and Proposal
    items = (
        db.session.query(ItineraryItem, Proposal)
        .join(Proposal, ItineraryItem.proposalid == Proposal.proposalid) # join on shared key
        .filter(ItineraryItem.tripid == trip_id) # return items that belong to this trip
        .order_by(ItineraryItem.sequence_order)
        .all() # returns all matching rows
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
            "START_DATETIME":  str(p.start_datetime) if p.start_datetime else None,
            "END_DATETIME": str(p.end_datetime) if p.end_datetime else None
        })
    return jsonify(result)
    
@itinerary_items_bp.route("/<int:item_id>", methods=['DELETE'])
def delete_item(item_id):
    item = ItineraryItem.get(item_id)
    if not item:
        return jsonify({"error": "Item not found"}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item Deleted"})