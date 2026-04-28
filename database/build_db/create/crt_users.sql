DROP TABLE USERS CASCADE CONSTRAINTS;
DROP SEQUENCE users_seq;

CREATE TABLE USERS (
    UserID NUMBER PRIMARY KEY,
    Username VARCHAR2(50) NOT NULL,       -- login name
    First_Name VARCHAR2(50),
    Last_Name VARCHAR2(50),
    Password_Hash VARCHAR2(1000),
    User_Email VARCHAR2(100),
    CREATED_AT DATE DEFAULT SYSDATE
);

-- The code below generates the primary key automatically

-- create sequence
CREATE SEQUENCE users_seq START WITH 1 INCREMENT BY 1;

-- trigger to auto-increment
CREATE OR REPLACE TRIGGER users_bir
BEFORE INSERT ON USERS
FOR EACH ROW
BEGIN
  IF :NEW.UserID IS NULL THEN
    SELECT users_seq.NEXTVAL INTO :NEW.UserID FROM dual;
  END IF;
END;
/
