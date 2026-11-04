// apparently PM2 will try to load Bun, then fall back to ts-node
module.exports = {
	apps: [{
		name: "loginserver",
		script: "./api/src/index.js",
		interpreter: "node",
		exec_mode: "cluster",
	}],
};
