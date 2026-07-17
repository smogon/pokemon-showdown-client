/**
 * @typedef {'mysql' | 'postgres' | 'sqlite' | 'mock'} DatabaseDriver
 * @typedef {{driver: DatabaseDriver, prefix?: string, path?: string}} BasicDatabaseConfig
 * @typedef {import('mysql2').PoolOptions & BasicDatabaseConfig & {driver: 'mysql'}} MySQLDatabaseConfig
 * @typedef {import('pg').PoolConfig & BasicDatabaseConfig & {driver: 'postgres'}} PGDatabaseConfig
 * @typedef {{path: string} & BasicDatabaseConfig & {driver: 'mock'}} MockDatabaseConfig
 * @typedef {MySQLDatabaseConfig | PGDatabaseConfig | MockDatabaseConfig} DatabaseConfig
 */

/**
 * For logins and ladders
 * @type {DatabaseConfig}
 */
exports.logindb = {
	driver: "mysql",
	charset: "utf8",
	database: "ps",
	password: "",
	host: 'localhost',
	user: "root",
	socketPath: '',
	prefix: "ntbb_",
};

/**
 * For replays
 * @type {DatabaseConfig | null | undefined}
 */
exports.replaysdb = {
	driver: "postgres",
	database: "ps",
	password: "",
	host: 'localhost',
	user: "root",
	prefix: "ntbb_",
};

/**
 * For ladders
 * @type {DatabaseConfig | null | undefined}
 */
exports.ladderdb = null;

/**
 * For friends
 * @type {DatabaseConfig | null | undefined}
 */
exports.friendsdb = null;

// ====================================================================

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
/** @type {string | null} */
exports.colorpath = null;
/** @type {string | null} */
exports.coilpath = null;

/** @type {string | null} Password, whether to debug error stacks in request or not */
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
/** @type {boolean} */
exports.loadprivaterelayips = true;

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
 * @type {{key: string, cert: string, port: number} | null}
 */
exports.ssl = null;

/**
 * Address to bind to.
 *   Leaving it as `undefined` will result in binding to `0.0.0.0`.
 * @type {undefined | string}
 */
exports.bindaddress = undefined;

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
 * An IP to allow Smogon acc-linking requests from.
 * @type {null | string}
 */
exports.smogonip = null;
/**
 * Retain smogon temporary encryption key at this path
 * @type {null | string}
 */
exports.smogonpath = null;
/**
 * Custom actions for your loginserver.
 * @type {{[k: string]: import('../src/server.ts').QueryHandler} | null}
 */
exports.actions = null;

exports.cssdir = __dirname + "/customcss/";
/**
 * Path to the client root dir.
 * @type {string | null}
 */
exports.clientpath = null;

/**
 * @type {Record<string, string>}
 */
exports.standings = {
	'-20': "Confirmed",
	'-10': "Autoconfirmed",
	'0': "New",
	"20": "Permalock",
	"30": "Permaban",
	"100": "Disabled",
};

/**
 * Get IPs of a given userid.
 * @type {null | ((userid: string) => Promise<{[k: string]: {min: number, max: number, count: number}}>)}
 */
exports.getuserips = null;

/**
 * Index of suspect tests active
 * @type {string | null}
 */
exports.suspectpath = null;

/**
 * @type {string | null}
 */
exports.smogonpublickey = null;
