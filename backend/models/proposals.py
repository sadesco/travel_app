from db import db
from datetime import datetime, timezone

class Proposal(db.Model):
	__tablename__ = "PROPOSALS"

	proposalid = db.Column("PROPOSALID", db.Integer, primary_key=True)
	tripid = db.Column("TRIPID", db.Integer, db.ForeignKey('TRIPS.tripid'), nullable=False)
	proposed_by = db.Column("PROPOSED_BY", db.Integer, db.ForeignKey('USERS.userid'), nullable=False)
	title = db.Column("TITLE", db.String(200), nullable=False)
	description = db.Column("DESCRIPTION", db.String(1000))
	category = db.Column("CATEGORY", db.String(50))
	location = db.Column("LOCATION", db.String(200))

	start_datetime = db.Column("START_DATETIME", db.DateTime)
	end_datetime = db.Column("END_DATETIME", db.DateTime)
	deadline = db.Column("DEADLINE", db.DateTime)
	status = db.Column("STATUS", db.String(20), default='proposed')
	confirmed_at = db.Column("CONFIRMED_AT", db.DateTime)
	created_at = db.Column("CREATED_AT", db.DateTime, default=lambda: datetime.now(timezone.utc))

	itinerary_entry = db.relationship("ItineraryItem", backref="proposal")
