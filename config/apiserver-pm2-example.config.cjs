module.exports = {
	apps: [{
		name: "apiserver",
		cwd: `${__dirname}/..`,
		script: "./api/src/index.ts",
		interpreter: "node",
		exec_mode: "cluster",
	}],
};
