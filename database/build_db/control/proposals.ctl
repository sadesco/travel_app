LOAD DATA
INFILE 'csvfiles/proposals.csv'
INTO TABLE PROPOSALS
FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"'
(
  ProposalID,
  TripID,
  Proposed_By,
  Title,
  Description,
  Category,
  Location,
  Start_Datetime TIMESTAMP "YYYY-MM-DD HH24:MI:SS",
  End_Datetime TIMESTAMP "YYYY-MM-DD HH24:MI:SS",
  Deadline TIMESTAMP "YYYY-MM-DD HH24:MI:SS",
  Status,
  Confirmed_At TIMESTAMP "YYYY-MM-DD HH24:MI:SS",
  Created_At TIMESTAMP "YYYY-MM-DD HH24:MI:SS"
)
