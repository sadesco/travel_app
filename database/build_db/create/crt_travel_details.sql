DROP TABLE TRAVEL_DETAILS CASCADE CONSTRAINTS;
DROP SEQUENCE travel_details_seq;

CREATE TABLE TRAVEL_DETAILS (
    DetailID NUMBER PRIMARY KEY,
    ProposalID NUMBER NOT NULL,
    Provider VARCHAR2(100),
    Departure_Location VARCHAR2(200),
    Arrival_Location VARCHAR2(200),
    Departure_Time TIMESTAMP,
    Arrival_Time TIMESTAMP,
    Confirmation_Number VARCHAR2(100),
    CONSTRAINT fk_travel_prop FOREIGN KEY (ProposalID) REFERENCES PROPOSALS(ProposalID)
);


--geenrate DetailID
CREATE SEQUENCE travel_details_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER travel_details_bir
BEFORE INSERT ON TRAVEL_DETAILS
FOR EACH ROW
BEGIN
    SELECT travel_details_seq.NEXTVAL INTO :NEW.DetailID FROM dual;
END;
/
