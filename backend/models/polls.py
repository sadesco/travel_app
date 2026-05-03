from db import db
from datetime import datetime, timezone

class Poll(db.Model):
	__tablename__ = "POLLS"
	
	pollid = db.Column("POLLID", db.Integer, primary_key=True)
	tripid = db.Column("TRIPID", db.Integer, db.ForeignKey("TRIPS.TRIPID"), nullable=False)
	created_by = db.Column("CREATED_BY", db.Integer, db.ForeignKey("USERS.USERID"), nullable=False)
	title = db.Column("TITLE", db.String(200))

	deadline = db.Column("DEADLINE", db.DateTime)
	created_at = db.Column("CREATED_AT", db.DateTime, default=lambda: datetime.now(timezone.utc))

	is_open = db.Column("IS_OPEN", db.Boolean, default=1)
	
	# relationship to get options from poll_options table
	options = db.relationship("PollOption", backref="poll")
