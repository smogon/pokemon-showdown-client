module.exports = {
	apps: [{
		name: "loginserver",
		script: "./.dist/src",
		exec_mode: "cluster",
	}],
};
