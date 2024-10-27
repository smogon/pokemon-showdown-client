-- Table structure for suspect tracking
-- Unfortunately necessary to be a table in order to properly synchronize
-- cross-processes

CREATE TABLE `ntbb_suspects` (
	formatid varchar(100) NOT NULL PRIMARY KEY,
	start_date bigint(20) NOT NULL,
	elo int,
	coil int,
	gxe int
);
