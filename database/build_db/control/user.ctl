LOAD DATA
INFILE 'csvfiles/users.csv'
INTO TABLE USERS
FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"'
(
  UserID,
  Username,
  First_Name,
  Last_Name,
  Password_Hash,
  User_Email
)
