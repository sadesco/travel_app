LOAD DATA
INFILE 'csvfiles/trips.csv'
INTO TABLE TRIPS
FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"'
(
  TripID,
  Trip_Name,
  Join_Code,
  Start_Date DATE "YYYY-MM-DD",
  End_Date DATE "YYYY-MM-DD",
  Created_By,
  Created_At TIMESTAMP "YYYY-MM-DD HH24:MI:SS"
)
