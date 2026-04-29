from flask import Blueprint, request, jsonify
from db import db

proposals_bp = Blueprint("proposals", __name__)


# GET all proposals for a trip
@proposals_bp.route("/", methods=["GET"])
def get_proposals():
    trip_id = request.args.get("trip_id")
    if not trip_id:
        return jsonify({"error": "trip_id required"}), 400

    result = db.session.execute(db.text("""
        SELECT p.PROPOSALID, p.TITLE, p.DESCRIPTION, p.CATEGORY,
               p.LOCATION, p.START_DATETIME, p.END_DATETIME,
               p.STATUS, p.CREATED_AT, u.USERNAME as PROPOSED_BY
        FROM PROPOSALS p
        JOIN USERS u ON p.PROPOSED_BY = u.USERID
        WHERE p.TRIPID = :tid
        ORDER BY p.CREATED_AT DESC
    """), {"tid": trip_id}).fetchall()

    return jsonify([dict(r._mapping) for r in result])


# POST create a proposal
@proposals_bp.route("/", methods=["POST"])
def create_proposal():
    data = request.json
    required = ["trip_id", "user_id", "title", "category"]
    if not all(data.get(f) for f in required):
        return jsonify({"error": "Missing required fields"}), 400

    start = data.get("start_datetime", "")
    end   = data.get("end_datetime", "")

    # build query dynamically to handle empty datetimes
    if start and end:
        db.session.execute(db.text("""
            INSERT INTO PROPOSALS
              (TRIPID, PROPOSED_BY, TITLE, DESCRIPTION, CATEGORY,
               LOCATION, START_DATETIME, END_DATETIME, STATUS, CREATED_AT)
            VALUES
              (:tid, :uid, :title, :desc, :cat,
               :loc,
               TO_TIMESTAMP(:start, 'YYYY-MM-DD"T"HH24:MI'),
               TO_TIMESTAMP(:end,   'YYYY-MM-DD"T"HH24:MI'),
               'pending', SYSDATE)
        """), {
            "tid":   data["trip_id"],
            "uid":   data["user_id"],
            "title": data["title"],
            "desc":  data.get("description", ""),
            "cat":   data["category"],
            "loc":   data.get("location", ""),
            "start": start,
            "end":   end,
        })
    else:
        db.session.execute(db.text("""
            INSERT INTO PROPOSALS
              (TRIPID, PROPOSED_BY, TITLE, DESCRIPTION, CATEGORY,
               LOCATION, STATUS, CREATED_AT)
            VALUES
              (:tid, :uid, :title, :desc, :cat,
               :loc, 'pending', SYSDATE)
        """), {
            "tid":   data["trip_id"],
            "uid":   data["user_id"],
            "title": data["title"],
            "desc":  data.get("description", ""),
            "cat":   data["category"],
            "loc":   data.get("location", ""),
        })

    db.session.commit()
    return jsonify({"message": "Proposal created"}), 201


# PATCH update proposal status
@proposals_bp.route("/<int:proposal_id>/status", methods=["PATCH"])
def update_status(proposal_id):
    data = request.json
    status = data.get("status")
    if status not in ("pending", "approved", "rejected"):
        return jsonify({"error": "Invalid status"}), 400

    db.session.execute(db.text("""
        UPDATE PROPOSALS SET STATUS = :status WHERE PROPOSALID = :pid
    """), {"status": status, "pid": proposal_id})
    db.session.commit()

    return jsonify({"message": "Status updated"})
