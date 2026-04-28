LOAD DATA
INFILE 'csvfiles/travel_details.csv'
INTO TABLE TRAVEL_DETAILS
FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"'
(
  DetailID,
  ProposalID,
  Provider,
  Departure_Location,
  Arrival_Location,
  Departure_Time TIMESTAMP "YYYY-MM-DD HH24:MI:SS",
  Arrival_Time TIMESTAMP "YYYY-MM-DD HH24:MI:SS",
  Confirmation_Number
)
