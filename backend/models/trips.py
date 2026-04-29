from db import db
import secrets
import string
from datetime import datetime, timezone

def generate_joincode():
    chars = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(chars) for _ in range(6))

class Trips(db.Model):
    __tablename__ = "TRIPS"

    tripid = db.Column("TRIPID", db.Integer, primary_key=True)
    tripname = db.Column("TRIP_NAME", db.String(100), nullable=False)
    joincode = db.Column("JOIN_CODE", db.String(10), unique=True, nullable=False, default=generate_joincode)
    start_date = db.Column("START_DATE", db.Date)
    end_date = db.Column("END_DATE", db.Date)
    created_by = db.Column("CREATED_BY", db.Integer, db.ForeignKey('USERS.USERID'), nullable=False)
    created_at = db.Column("CREATED_AT", db.DateTime, default=datetime.utcnow)

