from flask import Blueprint, request, jsonify
from db import db
from models.cost_estimates import CostEstimate
from models.proposals import Proposal

budget_bp = Blueprint("budget", __name__)

@budget_bp.route("/", methods=["GET"])
def get_budget_summary():
    trip_id = request.args.get("trip_id")
    if not trip_id:
        return jsonify({"error": "trip_id required"}), 400
    try:
        proposals = Proposal.query.filter_by(tripid=int(trip_id), status="approved").all()
        proposal_ids = [p.proposalid for p in proposals]

        estimates = CostEstimate.query.filter(
            CostEstimate.proposalid.in_(proposal_ids)
        ).all() if proposal_ids else []

        total_per_person = sum(float(e.cost_per_person or 0) for e in estimates)
        total_cost = sum(float(e.estimated_total_cost or 0) for e in estimates)

        breakdown = {}
        for e in estimates:
            proposal = next((p for p in proposals if p.proposalid == e.proposalid), None)
            cat = proposal.category if proposal else "Other"
            breakdown[cat] = breakdown.get(cat, 0) + float(e.cost_per_person or 0)

        return jsonify({
            "total_per_person": total_per_person,
            "total_cost": total_cost,
            "breakdown": breakdown
        })
    except Exception as ex:
        print("BUDGET ERROR:", ex)
        return jsonify({"error": str(ex)}), 500

@budget_bp.route("/estimate", methods=["POST"])
def add_estimate():
    data = request.json
    try:
        # replace existing estimate for this proposal if one exists
        existing = CostEstimate.query.filter_by(proposalid=data["proposal_id"]).first()
        if existing:
            existing.estimated_total_cost = data.get("total_cost")
            existing.cost_per_person = data.get("per_person")
            existing.num_people = data.get("num_people")
            existing.notes = data.get("notes", "")
        else:
            est = CostEstimate(
                proposalid=data["proposal_id"],
                created_by=data["user_id"],
                estimated_total_cost=data.get("total_cost"),
                cost_per_person=data.get("per_person"),
                num_people=data.get("num_people"),
                notes=data.get("notes", "")
            )
            db.session.add(est)
        db.session.commit()
        return jsonify({"success": True})
    except Exception as ex:
        db.session.rollback()
        print("ADD ESTIMATE ERROR:", ex)
        return jsonify({"error": str(ex)}), 500
