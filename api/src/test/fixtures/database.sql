CREATE TABLE replays (
	id TEXT PRIMARY KEY,
	format TEXT NOT NULL,
	players TEXT NOT NULL,
	log TEXT NOT NULL,
	inputlog TEXT,
	uploadtime INTEGER NOT NULL,
	views INTEGER NOT NULL DEFAULT 0,
	formatid TEXT NOT NULL,
	rating INTEGER,
	private INTEGER NOT NULL DEFAULT 0,
	password TEXT
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
