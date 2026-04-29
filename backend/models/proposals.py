from db import db
from datetime import datetime

class Proposal(db.Model):
    __tablename__ = "PROPOSALS"

    proposalid = db.Column("PROPOSALID", db.Integer, primary_key=True)
    tripid = db.Column("TRIPID", db.Integer, db.ForeignKey('TRIPS.TRIPID'), nullable=False)
    proposed_by = db.Column("PROPOSED_BY", db.Integer, nullable=False)

    title = db.Column("TITLE", db.String(255), nullable=False)
    description = db.Column("DESCRIPTION", db.Text)
    category = db.Column("CATEGORY", db.String(50))
    location = db.Column("LOCATION", db.String(255))

    start_datetime = db.Column("START_DATETIME", db.DateTime)
    end_datetime = db.Column("END_DATETIME", db.DateTime)

    status = db.Column("STATUS", db.String(20), default="pending")
    created_at = db.Column("CREATED_AT", db.DateTime, default=datetime.utcnow)
