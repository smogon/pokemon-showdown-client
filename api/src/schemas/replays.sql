CREATE TABLE public.replayplayers (
	playerid STRING(45) NOT NULL,
	formatid STRING(45) NOT NULL,
	id STRING(255) NOT NULL,
	rating INT8 NULL,
	uploadtime INT8 NOT NULL,
	private INT2 NOT NULL,
	password STRING(31) NULL,
	format STRING NOT NULL,
	players STRING(255) NOT NULL,
	CONSTRAINT replayplayers_pkey PRIMARY KEY (id ASC, playerid ASC),
	INDEX playerid_uploadtime (playerid ASC, uploadtime ASC),
	INDEX playerid_rating (playerid ASC, rating ASC),
	INDEX formatid_playerid_uploadtime (formatid ASC, playerid ASC, uploadtime ASC),
	INDEX formatid_playerid_rating (formatid ASC, playerid ASC, rating ASC)
);

CREATE TABLE public.replays (
	id STRING(255) NOT NULL,
	format STRING(45) NOT NULL,
	players STRING(255) NOT NULL,
	log STRING NOT NULL,
	inputlog STRING NULL,
	uploadtime INT8 NOT NULL,
	views INT8 NOT NULL DEFAULT 0:::INT8,
	formatid STRING(45) NOT NULL,
	rating INT8 NULL,
	private INT8 NOT NULL DEFAULT 0:::INT8,
	password STRING(31) NULL,
	CONSTRAINT replays_pkey PRIMARY KEY (id ASC),
	INDEX private_uploadtime (private ASC, uploadtime ASC),
	INDEX private_formatid_uploadtime (private ASC, formatid ASC, uploadtime ASC),
	INDEX private_formatid_rating (private ASC, formatid ASC, rating ASC),
	INVERTED INDEX log (log)
);
