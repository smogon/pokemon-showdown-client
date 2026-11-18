/**
 * @typedef {import('mysql2').PoolOptions} PoolOptions
 * @typedef {import('pg').PoolConfig} PoolConfig
 * @typedef {import('../api/src/database.ts').SQLiteDatabaseConfig} SQLiteDatabaseConfig
 * @typedef {import('../api/src/server.ts').QueryHandler} QueryHandler
 * @typedef {import('../api/src/user.ts').Session} Session
 * @typedef {import('../api/src/user.ts').User} User
 * @typedef {(
 *   | (PoolOptions & { driver: 'mysql' })
 *   | (PoolConfig & { driver: 'postgres' })
 *   | (SQLiteDatabaseConfig & { driver: 'sqlite' | 'mock' })
 * ) & { prefix?: string }} DatabaseConfig
 */

export const config = {
	/**
	 * For logins and ladders
	 * @type {DatabaseConfig}
	 */
	logindb: {
		driver: "mysql",
		charset: "utf8",
		database: "ps",
		password: "",
		host: 'localhost',
		user: "root",
		socketPath: '',
		prefix: "ntbb_",
	},

	/**
	 * For replays
	 * @type {DatabaseConfig | null | undefined}
	 */
	replaysdb: {
		driver: "postgres",
		database: "ps",
		password: "",
		host: 'localhost',
		user: "root",
		prefix: "ntbb_",
	},

	/**
	 * For ladders
	 * @type {DatabaseConfig | null | undefined}
	 */
	ladderdb: null,

	/**
	 * For friends
	 * @type {DatabaseConfig | null | undefined}
	 */
	friendsdb: null,

	// ====================================================================

	/**
	 * For 2FA verification.
	 */
	gapi_clientid: '',

	/**
	 * Terms banned in names
	 * @type {string[]}
	 */
	bannedTerms: [],

	// To use for password hashing.
	passwordSalt: 10,

	routes: {
		root: "pokemonshowdown.com",
	},

	/**
	 * The main server IP to allow privileged requests from.
	 * @type {string | null}
	 */
	mainserverip: null,
	mainserver: 'showdown',

	/**
	 * Password to enable error stacks in responses.
	 * @type {string | null}
	 */
	devmode: null,

	/**
	 * Custom SID maker.
	 * @type {((this: Session) => string | Promise<string>) | null}
	 */
	makeSid: null,

	/**
	 * ips to automatically lock
	 * @type {string[]}
	 */
	autolockip: [],

	/**
	 * compromised private key indexes
	 * @type {number[]}
	 */
	compromisedkeys: [],

	/**
	 * proxies to trust x-forwarded-for, x-forwarded-proto, and x-forwarded-host from
	 * @type {string[]}
	 */
	trustedproxies: [],

	loadprivaterelayips: true,

	/**
	 * [Places to allow cors requests from, prefix to use][]
	 * @type {[RegExp, string][]}
	 */
	cors: [
		[/^http:\/\/smogon\.com$/, "smogon.com_"],
		[/^http:\/\/www\.smogon\.com$/, "www.smogon.com_"],
		[/^http:\/\/logs\.psim\.us$/, "logs.psim.us_"],
		[/^http:\/\/logs\.psim\.us:8080$/, "logs.psim.us_"],
		[/^http:\/\/[a-z0-9]+\.psim\.us$/, ""],
		[/^http:\/\/play\.pokemonshowdown\.com$/, ""],
	],

	/**
	 * array of user IDs who will be given sysop powers on all servers they log into via this loginserver
	 * @type {string[]}
	 */
	sysops: [],

	/**
	 * Private key to use for validating assertions.
	 */
	privatekey: '',

	// current active challengekeyid (backwards compatibility)
	challengekeyid: 4,

	/**
	 * For emailing crashes.
	 * @type {{
	 * 	options: {
	 * 		host: string,
	 * 		port: number,
	 * 		secure?: boolean,
	 * 		auth?: { user: string, pass: string },
	 * 	},
	 * 	from: string,
	 * 	to: string,
	 * 	subject: string,
	 * } | null}
	 */
	crashguardemail: null,

	/**
	 * SSL settings.
	 * @type {{ key: string, cert: string, port?: number } | null}
	 */
	ssl: null,

	/**
	 * Address to bind to.
	 *  Leaving it as `undefined` will result in binding to `0.0.0.0`.
	 * @type {string | undefined}
	 */
	bindaddress: undefined,

	/**
	 * Port to listen on.
	 */
	port: 8080,

	/**
	 * Custom actions for your loginserver.
	 * @type {Record<string, QueryHandler> | null}
	 */
	actions: null,

	/**
	 * @type {Record<string, string>}
	 */
	standings: {
		'-20': "Confirmed",
		'-10': "Autoconfirmed",
		'0': "New",
		"20": "Permalock",
		"30": "Permaban",
		"100": "Disabled",
	},

	/**
	 * Get IPs of a given userid.
	 * @type {((userid: string) => Promise<Record<string, { min: number, max: number, count: number }>>) | null}
	 */
	getuserips: null,

	/**
	 * @type {string | null}
	 */
	smogonpublickey: null,

	/**
	 * Log IP, duration, and action of all requests.
	 * Set equal to a path to log to that path.
	 * @type {string | null}
	 */
	logrequests: null,

	/**
	 * @type {((this: Session, user: User, banstate: number, server: string) => string | void) | null}
	 */
	getUserType: null,

	/**
	 * @type {((
	 * 	this: Session, challengetoken: string | undefined, user: User, assertion: string, serverhostname: string
	 * ) => string | Promise<string>) | null}
	 */
	validateassertion: null,

	/**
	 * @type {((this: Session, userid: string, hash: string) => boolean | Promise<boolean>) | null}
	 */
	passwordNeedsRehash: null,
};

/**
 * @typedef {typeof config} Configuration
 */
