from db import db
from datetime import datetime, timezone

class CostEstimate(db.Model):
    __tablename__ = "COST_ESTIMATES"

    costid = db.Column("COSTID", db.Integer, primary_key=True)
    proposalid = db.Column("PROPOSALID", db.Integer, db.ForeignKey('PROPOSALS.proposalid'), nullable=False)
    created_by = db.Column("CREATED_BY", db.Integer, db.ForeignKey('USERS.userid'), nullable=False)
    estimated_total_cost = db.Column("ESTIMATED_TOTAL_COST", db.Numeric(10, 2))
    cost_per_person = db.Column("COST_PER_PERSON", db.Numeric(10, 2))
    num_people = db.Column("NUM_PEOPLE", db.Integer)
    notes = db.Column("NOTES", db.String(300))
    created_at = db.Column("CREATED_AT", db.DateTime, default=lambda: datetime.now(timezone.utc))
