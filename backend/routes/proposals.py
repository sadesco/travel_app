from flask import Blueprint, request, jsonify
from db import db
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.user import User
from models.proposals import Proposal
from models.itinerary_items import ItineraryItem
from datetime import datetime

proposals_bp = Blueprint("proposals", __name__)

@proposals_bp.route("/", methods=["GET"])
def get_proposals():
    trip_id = request.args.get("trip_id")
    if not trip_id:
        return jsonify({"error": "trip_id required"}), 400
    try:
        proposals = Proposal.query.filter_by(tripid=int(trip_id)).order_by(Proposal.created_at.desc()).all()
        result = []
        for p in proposals:
            user = User.query.get(p.proposed_by)
            result.append({
                "PROPOSALID": p.proposalid,
                "TITLE": p.title,
                "DESCRIPTION": p.description,
                "CATEGORY": p.category,
                "LOCATION": p.location,
                "START_DATETIME": str(p.start_datetime) if p.start_datetime else None,
                "END_DATETIME": str(p.end_datetime) if p.end_datetime else None,
                "STATUS": p.status,
                "CREATED_AT": str(p.created_at) if p.created_at else None,
                "PROPOSED_BY": user.username if user else "Unknown",
                "PROPOSED_BY_ID": p.proposed_by,
            })
        return jsonify(result)
    except Exception as e:
        print("GET PROPOSALS ERROR:", e)
        return jsonify({"error": str(e)}), 500

@proposals_bp.route("/", methods=["POST"])
def create_proposal():
    data = request.json
    if not data.get("title") or not data.get("trip_id") or not data.get("user_id"):
        return jsonify({"error": "Missing required fields"}), 400
    try:
        start = datetime.fromisoformat(data["start_datetime"]) if data.get("start_datetime") else None
        end   = datetime.fromisoformat(data["end_datetime"])   if data.get("end_datetime")   else None
        proposal = Proposal(
            tripid=int(data["trip_id"]),
            proposed_by=int(data["user_id"]),
            title=data["title"],
            description=data.get("description", ""),
            category=data.get("category", "Other"),
            location=data.get("location", ""),
            start_datetime=start,
            end_datetime=end,
            status="pending"
        )
        db.session.add(proposal)
        db.session.commit()
        return jsonify({"message": "Proposal created"}), 201
    except Exception as e:
        db.session.rollback()
        print("CREATE PROPOSAL ERROR:", e)
        return jsonify({"error": str(e)}), 500

@proposals_bp.route("/<int:proposal_id>", methods=["PATCH"])
def edit_proposal(proposal_id):
    data = request.json
    try:
        proposal = Proposal.query.get(proposal_id)
        if not proposal:
            return jsonify({"error": "Proposal not found"}), 404
        if data.get("title"):      proposal.title = data["title"]
        if data.get("description") is not None: proposal.description = data["description"]
        if data.get("category"):   proposal.category = data["category"]
        if data.get("location") is not None:    proposal.location = data["location"]
        if data.get("start_datetime"):
            proposal.start_datetime = datetime.fromisoformat(data["start_datetime"])
        if data.get("end_datetime"):
            proposal.end_datetime = datetime.fromisoformat(data["end_datetime"])
        db.session.commit()
        return jsonify({"message": "Proposal created", "proposalid": proposal.proposalid}), 201
    except Exception as e:
        db.session.rollback()
        print("EDIT PROPOSAL ERROR:", e)
        return jsonify({"error": str(e)}), 500

@proposals_bp.route("/<int:proposal_id>/status", methods=["PATCH"])
def update_status(proposal_id):
    data = request.json
    status = data.get("status")
    if status not in ("pending", "approved", "rejected"):
        return jsonify({"error": "Invalid status"}), 400
    try:
        proposal = Proposal.query.get(proposal_id)
        if not proposal:
            return jsonify({"error": "Proposal not found"}), 404
        proposal.status = status
        if status == "approved":
            already_exists = ItineraryItem.query.filter_by(proposalid=proposal_id).first()
            if not already_exists:
                item = ItineraryItem(
                    tripid=proposal.tripid,
                    proposalid=proposal.proposalid,
                    sequence_order=None
                )
                db.session.add(item)
        db.session.commit()
        return jsonify({"message": "Status updated"})
    except Exception as e:
        db.session.rollback()
        print("UPDATE STATUS ERROR:", e)
        return jsonify({"error": str(e)}), 500

@proposals_bp.route("/<int:proposal_id>", methods=["DELETE"])
def delete_proposal(proposal_id):
    try:
        proposal = Proposal.query.get(proposal_id)
        if not proposal:
            return jsonify({"error": "Proposal not found"}), 404
        # delete linked itinerary items first
        ItineraryItem.query.filter_by(proposalid=proposal_id).delete()
        db.session.delete(proposal)
        db.session.commit()
        return jsonify({"message": "Proposal deleted"})
    except Exception as e:
        db.session.rollback()
        print("DELETE PROPOSAL ERROR:", e)
        return jsonify({"error": str(e)}), 500

