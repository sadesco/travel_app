from db import db

class PollOption(db.Model):
	__tablename__ = "POLL_OPTIONS"

	optionid = db.Column("OPTIONID", db.Integer, primary_key=True)
	pollid = db.Column("POLLID", db.Integer, db.ForeignKey('POLLS.POLLID'), nullable=False)
	proposalid = db.Column("PROPOSALID", db.Integer, db.ForeignKey('PROPOSALS.proposalid'), nullable=False)

	votes = db.relationship("Votes", backref="option")
