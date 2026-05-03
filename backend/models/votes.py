from db import db
from datetime import datetime, timezone
from models.user import User

class Votes(db.Model):
	__tablename__ = "VOTES"

	voteid = db.Column("VOTEID", db.Integer, primary_key=True)
	optionid = db.Column("OPTIONID", db.Integer, db.ForeignKey('POLL_OPTIONS.optionid'), nullable=False)
	userid = db.Column("USERID", db.Integer, db.ForeignKey('USERS.userid'), nullable=False)
	voted_at = db.Column("VOTED_AT", db.DateTime, default=lambda: datetime.now(timezone.utc))

	# unique constraint to enforce one user gets to select one option
	__table_args__ = (db.UniqueConstraint("USERID", "OPTIONID", name="unq_user_option"),)
