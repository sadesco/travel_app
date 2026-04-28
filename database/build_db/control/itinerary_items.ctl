LOAD DATA
INFILE 'csvfiles/itinerary_items.csv'
INTO TABLE ITINERARY_ITEMS
FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"'
(
  ItineraryID,
  TripID,
  ProposalID,
  Sequence_Order
)
