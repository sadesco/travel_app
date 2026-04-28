from db import db
from datetime import datetime, timezone

class ItineraryItem(db.Model):
    __tablename__ = "ITINERARY_ITEMS"

    itineraryid = db.Column("ITINERARYID", db.Integer, primary_key=True)
    tripid = db.Column("TRIPID", db.Integer, db.ForeignKey('TRIP.tripid'), nullable=False)
    proposalid = db.Column("PROPOSALID", db.Integer, db.ForeignKey('PROPOSALS.proposalid'), nullable=False)
    sequence_order = db.Column("SEQUENCE_ORDER", db.Integer)
    confirmated_at = db.Column("CONFIRMED_AT", db.DateTime, default=lambda: datetime.now(timezone.utc))