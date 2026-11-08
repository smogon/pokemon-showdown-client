module.exports = {
	apps: [{
		name: "apiserver",
		// apparently PM2 will try to load Bun, then fall back to ts-node
		// if we give it a `.ts` file here
		script: "./api/src/index.js",
		interpreter: "node",
		exec_mode: "cluster",
	}],
};
