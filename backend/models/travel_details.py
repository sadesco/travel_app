from db import db
from datetime import datetime, timezone
from proposals import Proposal

class TravelDetail(db.Model):
    __tablename__ = "TRAVEL_DETAILS"

    detailid = db.Column("DETAILID", db.Integer, primary_key=True)
    proposalid = db.Column("PROPOSALID", db.Integer, db.ForeignKey('PROPOSALS.proposalid'), nullable=False)
    provider = db.Column("PROVIDER", db.String(100))
    departure_location = db.Column("DEPARTURE_LOCATION", db.String(200))
    arrival_location = db.Column("ARRIVAL_LOCATION", db.String(200))
    departure_time = db.Column("DEPARTURE_TIME", db.DateTime)
    arrival_time = db.Column("ARRIVAL_TIME", db.DateTime)
    confirmation_number = db.Column("CONFIRMATION_NUMBER", db.String(100))