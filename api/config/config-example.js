// MySQL DB settings.
exports.mysql = {
	charset: "utf8",
	database: "ps",
	password: "",
	host: 'localhost',
	user: "root",
	socketPath: '',
	prefix: "ntbb_",
};

/** For 2FA verification. */
exports.gapi_clientid = '';

/** Terms banned in names
 * @type {string[]}
 */
exports.bannedTerms = [];

// To use for password hashing.
/** @type {number} */
exports.passwordSalt = 10;

// routes - todo stricter key types?
/** @type {Record<string, string>} */
exports.routes = {
	root: "pokemonshowdown.com",
};

/** @type {string} */
exports.mainserver = 'showdown';
/** @type {string} */
exports.serverlist = '/var/www/html/play.pokemonshowdown.com/config/servers.inc.php';

/** @type {string | null} Password, whether to debug error stacks in request or not*/
exports.devmode = null;

// absolute path to your PS instance. can use the checked-out client that the client clones in.
/** @type {string} */
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
/** @type {string} */
exports.privatekey = '';
// current active challengekeyid (backwards compatibility)
/** @type {number} */
exports.challengekeyid = 4;

/**
 * DBs.
 */
/** @type {typeof exports.mysql | undefined}*/
exports.replaysdb = undefined;
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

/**
 * Custom actions for your loginserver.
 * @type {{[k: string]: import('../src/server').QueryHandler} | null}
 */
exports.actions = null;

exports.cssdir = __dirname + "/customcss/";
