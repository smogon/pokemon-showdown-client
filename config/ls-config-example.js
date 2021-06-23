// MySQL DB settings.
exports.mysql = {
 charset: "utf8",
 database: "ps",
 password: "uwu",
 user: "root",
};

// Database table prefix.
exports.dbprefix = "ntbb_";

// To use for password hashing.
exports.passwordSalt = 10;

// routes
exports.routes = {
 root:	"6a058bbe924f.ngrok.io",
};

// [Places to allow cors requests from, prefix to use][]
exports.cors = [
 [/^http:\/\/smogon\.com$/, "smogon.com_"],
 [/^http:\/\/www\.smogon\.com$/, "www.smogon.com_"],
 [/^http:\/\/logs\.psim\.us$/, "logs.psim.us_"],
 [/^http:\/\/logs\.psim\.us:8080$/, "logs.psim.us_"],
 [/^http:\/\/[a-z0-9]+\.psim\.us$/, ""],
 [/^http:\/\/play\.pokemonshowdown\.com$/, ""],
];
exports.sysops = ["mia"];

// Private keys to use for validating assertions.
exports.privatekeys = [
 "key here",
];
