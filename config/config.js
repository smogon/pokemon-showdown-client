var Config = Config || {};

/* version */ Config.version = "0";

Config.bannedHosts = ['cool.jit.su', 'pokeball-nixonserver.rhcloud.com'];

Config.whitelist = [
	'wikipedia.org',

	// The full list is maintained outside of this repository so changes to it
	// don't clutter the commit log. Feel free to copy our list for your own
	// purposes; it's here: https://play.pokemonshowdown.com/config/config.js

	// If you would like to change our list, simply message Zarel on Smogon or
	// Discord.
];

// `defaultserver` specifies the server to use when the domain name in the
// address bar is `Config.routes.client`.
Config.defaultserver = {
	id: 'yoshi',
	host: 'vps-74fbeae4.vps.ovh.net.psim.us',
	port: 8000,
	httpport: 8000,
	altport: 80,
	registered: true
};

Config.roomsFirstOpenScript = function () {
};

Config.customcolors = {
	'yoshifanfic': 'yosh',
	'ruadh21': 'rua',
	'dunscy': 'rainbow',
	'justgrace': 'grace',
	'shadowakumo': 'fuckthisguy',
	'brawler456': 'fuckthisguy',
	'nani72': 'nani',
};
/*** Begin automatically generated configuration ***/
Config.version = "0.11.2 (fcc8bbe6)";

Config.routes = {
	root: 'pokemonshowdown.com',
	client: 'play.pokemonshowdown.com',
	dex: 'dex.pokemonshowdown.com',
	replays: 'replay.pokemonshowdown.com',
	users: 'pokemonshowdown.com/users',
};
/*** End automatically generated configuration ***/