Config.ports = {
	http: 4280,
	https: 42443,
};

Config.ssl = {
	privateKeyPath: '',
	certificatePath: '',
};

// `defaultserver` specifies the server to use when the domain name in the
// address bar is `Config.routes.client`.
Config.defaultserver = {
	id: 'showdown',
	host: 'sim3.psim.us',
	port: 443,
	httpport: 8000,
	altport: 80,
	registered: true
};

Config.proxies = [{
  protocol: 'http',
  ip: '',
  port: '',
  username: '',
  password: '',
}];
