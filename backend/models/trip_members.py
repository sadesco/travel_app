from db import db
from datetime import datetime, timezone

class TripMembers(db.Model):
    __tablename__ = "TRIP_MEMBERS"
    
    # 1. Change 'TRIPS.tripid' to 'TRIPS.TRIPID'
    tripid = db.Column("TRIPID", db.Integer, db.ForeignKey('TRIPS.TRIPID'), primary_key=True, nullable=False)
    
    # 2. Change column name from "USERS" to "USERID" 
    # 3. Change 'USERS.userid' to 'USERS.USERID'
    userid = db.Column("USERID", db.Integer, db.ForeignKey('USERS.USERID'), primary_key=True, nullable=False)

    role = db.Column("ROLE", db.String(20), default='member')

    # Use the same fix we used for Trips to avoid the DPY-3002 error
    joined_at = db.Column("JOINED_AT", db.DateTime, default=lambda: datetime.now(timezone.utc))
