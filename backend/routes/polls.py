from flask import Blueprint, request, jsonify
from db import db
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.user import User
from models.proposals import Proposal
from models.itinerary_items import ItineraryItem
from models.polls import Poll
from models.poll_options import PollOption
from models.votes import Votes
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

LOCAL_TZ = ZoneInfo("America/Indianapolis") # for timezone conversion/consistency

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
            if p.deadline and datetime.utcnow() > p.deadline and p.is_open:
                p.is_open = False
                db.session.commit()

            options_data = []
            for option in p.options:
                proposal = Proposal.query.get(option.proposalid)
                # FIX: was option.id (wrong attribute), now option.optionid
                vote_count = Votes.query.filter_by(optionid=option.optionid).count()
                user_voted = 0
                if user_id:
                    existing = Votes.query.filter_by(
                        optionid=option.optionid,
                        userid=int(user_id)
                    ).first()
                    user_voted = 1 if existing else 0

                options_data.append({
                    "OPTIONID": option.optionid,
                    "PROPOSALID": option.proposalid,
                    "PROPOSAL_TITLE": proposal.title if proposal else "Unknown",
                    "PROPOSAL_CATEGORY": proposal.category if proposal else "Other",
                    "PROPOSAL_LOCATION": proposal.location if proposal else "",
                    "VOTE_COUNT": vote_count,
                    "USER_VOTED": user_voted,
                })

            deadline_local = (
                p.deadline.replace(tzinfo=timezone.utc).astimezone(LOCAL_TZ)
                if p.deadline else None
            )

            created_at_local = (
                p.created_at.replace(tzinfo=timezone.utc).astimezone(LOCAL_TZ)
                if p.created_at else None
            )

            result.append({
                "POLLID": p.pollid,
                "TITLE": p.title,
                "TRIPID": p.tripid,
                "DEADLINE": deadline_local.isoformat() if deadline_local else None,
                "IS_OPEN": p.is_open,
                "CREATED_AT": created_at_local.isoformat() if created_at_local else None,
                "CREATED_BY": creator.username if creator else "Unknown",
                "OPTIONS": options_data,
            })
        return jsonify(result)
    except Exception as e:
        print("GET POLLS ERROR:", e)
        return jsonify({"error": str(e)}), 500

@polls_bp.route("/", methods=["POST"])
def create_poll():
    data = request.get_json()
    trip_id = data.get("trip_id")
    user_id = data.get("user_id")
    title = data.get("title")
    deadline = data.get("deadline")
    proposal_ids = data.get("proposal_ids", [])

    if not trip_id or not user_id or not title or not deadline:
        return jsonify({"error": "trip_id, user_id, title, and deadline are required"}), 400
    if len(proposal_ids) < 2:
        return jsonify({"error": "At least 2 proposals required as options"}), 400

    try:
        # convert timezones
        local_deadline = datetime.fromisoformat(deadline).replace(tzinfo=LOCAL_TZ)
        utc_deadline = local_deadline.astimezone(timezone.utc).replace(tzinfo=None)

        new_poll = Poll(
            tripid=int(trip_id),
            created_by=int(user_id),
            title=title,
            deadline=utc_deadline,
            is_open=True
        )
        db.session.add(new_poll)
        db.session.flush()  # gets the new pollid before committing

        for proposal_id in proposal_ids:
            option = PollOption(
                pollid=new_poll.pollid,
                proposalid=int(proposal_id),
            )
            db.session.add(option)

        db.session.commit()
        return jsonify({"success": True, "pollid": new_poll.pollid}), 201

    except Exception as e:
        db.session.rollback()
        print("CREATE POLL ERROR:", e)
        return jsonify({"error": str(e)}), 500

# ---- Cast a vote ----
@polls_bp.route("/<int:poll_id>/vote", methods=["POST"])
def cast_vote(poll_id):
    data = request.get_json()
    user_id = data.get("user_id")
    option_id = data.get("option_id")

    if not user_id or not option_id:
        return jsonify({"error": "user_id and option_id required"}), 400

    try:
        # FIX: was Poll.query.get() with no argument
        poll = Poll.query.get(poll_id)
        if not poll:
            return jsonify({"error": "Poll not found"}), 404
        if not poll.is_open:
            return jsonify({"error": "This poll is closed"}), 400

        if poll.deadline and datetime.utcnow() > poll.deadline:
            poll.is_open = False
            db.session.commit()
            return jsonify({"error": "This poll has expired"}), 400

        # check the option belongs to this poll
        option = PollOption.query.filter_by(optionid=int(option_id), pollid=poll_id).first()
        if not option:
            return jsonify({"error": "Option does not belong to this poll"}), 400

        # check user hasn't already voted on any option in this poll
        already_voted = (
            db.session.query(Votes)
            .join(PollOption, Votes.optionid == PollOption.optionid)
            .filter(PollOption.pollid == poll_id, Votes.userid == int(user_id))
            .first()
        )

        if already_voted:
            already_voted.optionid = int(option_id)
            already_voted.voted_at = datetime.now(timezone.utc)
            db.session.commit()
            return jsonify({"success": True, "updated": True}), 200
            #return jsonify({"error": "You have already voted in this poll"}), 400

        vote = Votes(
            optionid=int(option_id),
            userid=int(user_id),
            voted_at=datetime.utcnow(),
        )
        db.session.add(vote)
        db.session.commit()
        return jsonify({"success": True, "updated": False}), 201

    except Exception as e:
        db.session.rollback()
        print("CAST VOTE ERROR:", e)
        return jsonify({"error": str(e)}), 500

@polls_bp.route("/<int:poll_id>/close", methods=["PATCH"])
def close_poll(poll_id):
    try:
        poll = Poll.query.get(poll_id)
        if not poll:
            return jsonify({"error": "Poll not found"}), 404
        poll.is_open = False
        db.session.commit()
        return jsonify({"success": True})

    except Exception as e:
        db.session.rollback()
        print("CLOSE POLL ERROR:", e)
        return jsonify({"error": str(e)}), 500
