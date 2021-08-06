// MySQL DB settings.
exports.mysql = {
 charset: "utf8",
 database: "ps",
 password: "uwu",
 prefix: "",
 user: "root",
};

// To use for password hashing.
exports.passwordSalt = 10;

// routes
exports.routes = {
 client:	"play.pokemonshowdown.com",
 dex:	"dex.pokemonshowdown.com",
 replays:	"replay.pokemonshowdown.com",
 root:	"pokemonshowdown.com",
 users:	"pokemonshowdown.com/users",
};

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

// array of user IDs who will be given sysop powers on all servers they log into via this loginserver
exports.sysops = ["mia"];

// Private keys to use for validating assertions.
exports.privatekeys = [
 "key here",
];
