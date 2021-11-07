// MySQL DB settings.
exports.mysql = {
	charset: "utf8",
	database: "ps",
	password: "",
	host: 'localhost',
	prefix: "",
	user: "root",
};

/** For 2FA verification. */
exports.gapi_clientid = '';
exports.galclient = '';

/** Terms banned in names
 * @type {string[]}
 */
exports.bannedTerms = [];

// To use for password hashing.
exports.passwordSalt = 10;

// routes
exports.routes = {
	root: "pokemonshowdown.com",
};

exports.mainserver = 'showdown';
exports.serverlist = '/var/www/html/play.pokemonshowdown.com/config/servers.inc.php';

// absolute path to your PS instance. can use the checked-out client that the client clones in.
exports.pspath = '/var/www/html/play.pokemonshowdown.com/data/pokemon-showdown';

/**
 * Custom SID maker.
 * @type {(() => string | Promise<string>) | null}
 */
exports.makeSid = null;

/** ips to automatically lock 
 * @type {string[]} */
exports.autolockip = [];
/** compromised private key indexes 
 * @type {number[]} */
exports.compromisedkeys = [];
/** proxies to trust x-forwarded-for from 
 * @type {string[]} */
exports.trustedproxies = [];

/**
    * [Places to allow cors requests from, prefix to use][]
    * @type {[RegExp, string][]}
    */
exports.cors = [
	[/^http:\/\/smogon\.com$/, "smogon.com_"],
	[/^http:\/\/www\.smogon\.com$/, "www.smogon.com_"],
	[/^http:\/\/logs\.psim\.us$/, "logs.psim.us_"],
	[/^http:\/\/logs\.psim\.us:8080$/, "logs.psim.us_"],
	[/^http:\/\/[a-z0-9]+\.psim\.us$/, ""],
	[/^http:\/\/play\.pokemonshowdown\.com$/, ""],
];

/**
    * array of user IDs who will be given sysop powers on all servers they log into via this loginserver
    * @type {string[]}
    */
exports.sysops = [];

// Private key to use for validating assertions.
exports.privatekey = '';
// current active challengekeyid (backwards compatibility)
exports.challengekeyid = 4;

/**
 * DBs.
 */
/** @type {typeof exports.mysql | undefined}*/
exports.replaysdb = undefined;
/** @type {typeof exports.mysql | undefined}*/
exports.testdb = undefined;
/** @type {typeof exports.mysql | undefined}*/
exports.ladderdb = undefined;

/**
 * For emailing crashes.
 * @type {{
 * options: {
 * 		host: string, 
 * 		port: number, 
 * 		secure?: boolean, 
 * 		auth?: {user: string, pass: string}
 * 	},
 * 	from: string,
 * 	to: string,
 * 	subject: string,
 * } | null}
 */
exports.crashguardemail = null;

/** 
 * SSL settings.
 * @type {{key: string, cert: string} | null}
 */
exports.ssl = null;

/**
 * Port to listen on.
 * @type {number}
 */
exports.port = 8080;

/**
 * Whether or not to reload the config on edit.
 * @type {boolean}
 */
exports.watchconfig = true;

/**
 * An IP to allow restart requests from.
 * @type {null | string}
 */
exports.restartip = null;