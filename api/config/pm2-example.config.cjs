// apparently PM2 will try to load Bun, then fall back to ts-node
module.exports = {
	apps: [{
		name: "loginserver",
		script: "./src/index.ts",
		interpreter: "node",
		exec_mode: "cluster",
	}],
};
