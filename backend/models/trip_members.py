from db import db
from datetime import datetime, timezone

class TripMembers(db.Model):
	__tablename__ = "TRIP_MEMBERS"
	
	tripid = db.Column("TRIPID", db.Integer, db.ForeignKey('TRIPS.tripid'), primary_key=True, nullable=False)
	userid = db.Column("USERS", db.Integer, db.ForeignKey('USERS.userid'), primary_key=True, nullable=False)

	role = db.Column("ROLE", db.String(20), default='member')

	joined_at = db.Column("JOINED_AT", db.DateTime, default=lambda: datetime.now(timezone.utc))

	
