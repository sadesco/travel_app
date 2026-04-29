from db import db
from datetime import datetime

class Proposal(db.Model):
    __tablename__ = "proposals"

    proposalid = db.Column(db.Integer, primary_key=True)
    tripid = db.Column(db.Integer, nullable=False)
    proposed_by = db.Column(db.Integer, nullable=False)

    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50))
    location = db.Column(db.String(255))

    start_datetime = db.Column(db.DateTime)
    end_datetime = db.Column(db.DateTime)

    status = db.Column(db.String(20), default="pending")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
