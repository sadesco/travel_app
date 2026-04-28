from db import db
from datetime import datetime

class LodgingDetail(db.Model):
    __tablename__ = "LODGING_DETAILS"

    lodgingid = db.Column("LODGINGID", db.Integer, primary_key=True)
    proposalid = db.Column("PROPOSALID", db.Integer, db.ForeignKey('PROPOSALS.proposalid'), nullable=False)
    hotel_name = db.Column("HOTEL_NAME", db.String(200))
    address = db.Column("ADDRESS", db.String(300))
    check_in = db.Column("CHECK_IN", db.DateTime)
    check_out = db.Column("CHECK_OUT", db.DateTime)