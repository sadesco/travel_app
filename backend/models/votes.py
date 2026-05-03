from db import db
from datetime import datetime, timezone

class Votes(db.Model):
    __tablename__ = "VOTES"

    voteid = db.Column("VOTEID", db.Integer, primary_key=True)
    optionid = db.Column("OPTIONID", db.Integer, db.ForeignKey('POLL_OPTIONS.OPTIONID'), nullable=False)
    userid = db.Column("USERID", db.Integer, db.ForeignKey('USERS.USERID'), nullable=False)
    voted_at = db.Column("VOTED_AT", db.DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        db.UniqueConstraint("USERID", "OPTIONID", name="unq_user_option"),
    )
