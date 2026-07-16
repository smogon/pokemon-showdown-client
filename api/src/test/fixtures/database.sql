CREATE TABLE users (
	userid TEXT PRIMARY KEY,
	usernum INTEGER UNIQUE,
	username TEXT NOT NULL,
	nonce TEXT,
	passwordhash TEXT,
	email TEXT,
	registertime INTEGER NOT NULL DEFAULT 0,
	"group" INTEGER NOT NULL DEFAULT 1,
	banstate INTEGER NOT NULL DEFAULT 0,
	ip TEXT NOT NULL DEFAULT '',
	avatar INTEGER NOT NULL DEFAULT 0,
	logintime INTEGER NOT NULL DEFAULT 0,
	loginip TEXT
);

CREATE TABLE sessions (
	session INTEGER PRIMARY KEY AUTOINCREMENT,
	sid TEXT NOT NULL,
	userid TEXT NOT NULL,
	time INTEGER NOT NULL,
	timeout INTEGER NOT NULL,
	ip TEXT NOT NULL
);

CREATE TABLE userstats (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	serverid TEXT NOT NULL UNIQUE,
	usercount INTEGER NOT NULL,
	date INTEGER NOT NULL
);

CREATE TABLE userstatshistory (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	date INTEGER NOT NULL,
	usercount INTEGER NOT NULL,
	programid TEXT NOT NULL DEFAULT 'showdown'
);

CREATE TABLE loginthrottle (
	ip TEXT PRIMARY KEY,
	count INTEGER NOT NULL,
	time INTEGER NOT NULL,
	lastuserid TEXT NOT NULL
);

CREATE TABLE loginattempts (
	userid TEXT PRIMARY KEY,
	count INTEGER NOT NULL,
	time INTEGER NOT NULL
);

CREATE TABLE usermodlog (
	entryid INTEGER PRIMARY KEY AUTOINCREMENT,
	userid TEXT NOT NULL,
	actorid TEXT NOT NULL,
	date INTEGER NOT NULL,
	ip TEXT NOT NULL,
	entry TEXT NOT NULL
);

CREATE TABLE ladder (
	entryid INTEGER PRIMARY KEY AUTOINCREMENT,
	formatid TEXT NOT NULL,
	userid TEXT NOT NULL,
	username TEXT NOT NULL,
	w INTEGER NOT NULL DEFAULT 0,
	l INTEGER NOT NULL DEFAULT 0,
	t INTEGER NOT NULL DEFAULT 0,
	gxe REAL NOT NULL DEFAULT 0,
	r REAL NOT NULL DEFAULT 1500,
	rd REAL NOT NULL DEFAULT 130,
	sigma REAL NOT NULL DEFAULT 0,
	rptime INTEGER NOT NULL,
	rpr REAL NOT NULL DEFAULT 1500,
	rprd REAL NOT NULL DEFAULT 130,
	rpsigma REAL NOT NULL DEFAULT 0,
	rpdata TEXT NOT NULL DEFAULT '',
	elo REAL NOT NULL DEFAULT 1000,
	col1 REAL NOT NULL DEFAULT 0,
	oldelo REAL NOT NULL DEFAULT 1000,
	first_played INTEGER NOT NULL DEFAULT 0,
	last_played INTEGER NOT NULL DEFAULT 0,
	UNIQUE (userid, formatid)
);

CREATE TABLE suspects (
	formatid TEXT PRIMARY KEY,
	start_date INTEGER NOT NULL,
	elo INTEGER,
	coil INTEGER,
	gxe INTEGER
);

CREATE TABLE replayprep (
	id TEXT PRIMARY KEY,
	format TEXT NOT NULL,
	players TEXT NOT NULL,
	private INTEGER NOT NULL DEFAULT 0,
	loghash TEXT NOT NULL,
	inputlog TEXT NOT NULL,
	rating INTEGER NOT NULL DEFAULT 0,
	uploadtime INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE replays (
	id TEXT PRIMARY KEY,
	format TEXT NOT NULL,
	players TEXT NOT NULL,
	log TEXT NOT NULL DEFAULT '',
	inputlog TEXT,
	uploadtime INTEGER NOT NULL DEFAULT 0,
	views INTEGER NOT NULL DEFAULT 0,
	formatid TEXT NOT NULL DEFAULT '',
	rating INTEGER,
	private INTEGER NOT NULL DEFAULT 0,
	password TEXT
);

CREATE TABLE replayplayers (
	playerid TEXT NOT NULL,
	formatid TEXT NOT NULL,
	id TEXT NOT NULL,
	rating INTEGER,
	uploadtime INTEGER NOT NULL,
	private INTEGER NOT NULL DEFAULT 0,
	password TEXT,
	format TEXT NOT NULL,
	players TEXT NOT NULL,
	PRIMARY KEY (id, playerid)
);

INSERT INTO replays (
	id, format, players, log, inputlog, uploadtime, views, formatid, rating, private, password
) VALUES (
	'oumonotype-82345404', 'OU Monotype', 'kdarewolf,Onox',
	'|join|kdarewolf
|join|Onox
|player|p1|kdarewolf|37
|player|p2|Onox|159
|gametype|singles
|gen|6
|tier|OU Monotype
|clearpoke
|poke|p1|Kecleon, F, shiny
|poke|p1|Diggersby, M
|poke|p1|Girafarig, M, shiny
|poke|p1|Heliolisk, F
|poke|p1|Chansey, F, shiny
|poke|p1|Staraptor, F, shiny
|poke|p2|Espeon, M, shiny
|poke|p2|Metagross, shiny
|poke|p2|Reuniclus, M, shiny
|poke|p2|Alakazam, M, shiny
|poke|p2|Delphox, M, shiny
|poke|p2|Gardevoir, M, shiny
|teampreview
|callback|decision
|
|start
|switch|p1a: May Day Parade|Kecleon, F, shiny|324/324
|switch|p2a: AMagicalFox|Delphox, M, shiny|292/292
|turn|1
|callback|decision
|
|move|p1a: May Day Parade|Fake Out|p2a: AMagicalFox
|-damage|p2a: AMagicalFox|213/292
|cant|p2a: AMagicalFox|flinch',
	NULL, 1390960565, 5468, '', NULL, 0, NULL
);

INSERT INTO replays (
	id, format, players, log, uploadtime, views, formatid, rating, private
) VALUES
	('searchtest1', 'gen8randombattle', 'somerandomreg,annikaskywalker', '', unixepoch() - 8, 1, 'gen8randombattle', 1000, 1),
	('searchtest2', 'gen8randombattle', 'annika,somerandomreg', '', unixepoch() - 7, 1, 'gen8randombattle', 1100, 1),
	('searchtest3', 'gen8ou', 'annika,somerandomreg', '', unixepoch() - 6, 1, 'gen8ou', 1100, 1),
	('searchtest4', 'gen8ou', 'heartofetheria,somerandomreg', '', unixepoch() - 5, 1, 'gen8ou', 1200, 0),
	(
		'searchtest5', 'gen8anythinggoes', 'heartofetheria,annikaskywalker',
		'the quick brown fox jumped over the lazy dog', unixepoch() - 4, 1, 'gen8anythinggoes', 1500, 0
	),
	(
		'searchtest6', 'gen8anythinggoes', 'heartofetheria,annikaskywalker',
		'yxmördaren Julia Blomqvist på fäktning i Schweiz', unixepoch() - 3, 1, 'gen8anythinggoes', 1300, 0
	),
	('searchtest7', 'gen8ou', 'annika,somerandomreg', '', unixepoch() - 2, 1, 'gen8ou', 1250, 0),
	('searchtest8', 'gen8randombattle', 'somerandomreg,annikaskywalker', '', unixepoch() - 1, 1, 'gen8randombattle', 1400, 0);

INSERT INTO replayplayers (
	playerid, formatid, id, rating, uploadtime, private, password, format, players
) VALUES
	('somerandomreg', 'gen8randombattle', 'searchtest1', 1000, unixepoch() - 8, 1, NULL, 'gen8randombattle', 'somerandomreg,annikaskywalker'),
	('annikaskywalker', 'gen8randombattle', 'searchtest1', 1000, unixepoch() - 8, 1, NULL, 'gen8randombattle', 'somerandomreg,annikaskywalker'),
	('annika', 'gen8randombattle', 'searchtest2', 1100, unixepoch() - 7, 1, NULL, 'gen8randombattle', 'annika,somerandomreg'),
	('somerandomreg', 'gen8randombattle', 'searchtest2', 1100, unixepoch() - 7, 1, NULL, 'gen8randombattle', 'annika,somerandomreg'),
	('annika', 'gen8ou', 'searchtest3', 1100, unixepoch() - 6, 1, NULL, 'gen8ou', 'annika,somerandomreg'),
	('somerandomreg', 'gen8ou', 'searchtest3', 1100, unixepoch() - 6, 1, NULL, 'gen8ou', 'annika,somerandomreg'),
	('heartofetheria', 'gen8ou', 'searchtest4', 1200, unixepoch() - 5, 0, NULL, 'gen8ou', 'heartofetheria,somerandomreg'),
	('somerandomreg', 'gen8ou', 'searchtest4', 1200, unixepoch() - 5, 0, NULL, 'gen8ou', 'heartofetheria,somerandomreg'),
	('heartofetheria', 'gen8anythinggoes', 'searchtest5', 1500, unixepoch() - 4, 0, NULL, 'gen8anythinggoes', 'heartofetheria,annikaskywalker'),
	('annikaskywalker', 'gen8anythinggoes', 'searchtest5', 1500, unixepoch() - 4, 0, NULL, 'gen8anythinggoes', 'heartofetheria,annikaskywalker'),
	('heartofetheria', 'gen8anythinggoes', 'searchtest6', 1300, unixepoch() - 3, 0, NULL, 'gen8anythinggoes', 'heartofetheria,annikaskywalker'),
	('annikaskywalker', 'gen8anythinggoes', 'searchtest6', 1300, unixepoch() - 3, 0, NULL, 'gen8anythinggoes', 'heartofetheria,annikaskywalker'),
	('annika', 'gen8ou', 'searchtest7', 1250, unixepoch() - 2, 0, NULL, 'gen8ou', 'annika,somerandomreg'),
	('somerandomreg', 'gen8ou', 'searchtest7', 1250, unixepoch() - 2, 0, NULL, 'gen8ou', 'annika,somerandomreg'),
	('somerandomreg', 'gen8randombattle', 'searchtest8', 1400, unixepoch() - 1, 0, NULL, 'gen8randombattle', 'somerandomreg,annikaskywalker'),
	('annikaskywalker', 'gen8randombattle', 'searchtest8', 1400, unixepoch() - 1, 0, NULL, 'gen8randombattle', 'somerandomreg,annikaskywalker');
