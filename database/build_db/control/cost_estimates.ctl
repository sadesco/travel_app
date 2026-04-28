LOAD DATA
INFILE 'csvfiles/cost_estimates.csv'
INTO TABLE COST_ESTIMATES
FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"'
(
  CostID,
  ProposalID,
  Created_By,
  Estimated_Total_Cost,
  Cost_Per_Person,
  Num_People,
  Notes,
  Created_At TIMESTAMP "YYYY-MM-DD HH24:MI:SS"
)
