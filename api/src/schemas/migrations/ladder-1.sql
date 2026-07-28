BEGIN;

ALTER TABLE ntbb_ladder
ADD COLUMN first_played bigint(20),
ADD COLUMN last_played bigint(20),
ALGORITHM=INSTANT;

COMMIT;
