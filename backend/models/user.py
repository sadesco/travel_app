from db import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = "USERS"

    userid = db.Column("USERID", db.Integer, primary_key=True)
    username = db.Column("USERNAME", db.String(50), nullable=False)

    first_name = db.Column("FIRST_NAME", db.String(50))
    last_name = db.Column("LAST_NAME", db.String(50))
    user_email = db.Column("USER_EMAIL", db.String(100))

    password_hash = db.Column("PASSWORD_HASH", db.String(255))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
