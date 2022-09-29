const Config = {};

Config.ports = {
	http: 4280,
	https: 42443,
};

Config.ssl = {
	privateKeyPath: '',
	certificatePath: '',
};

/* Proxy fields:
	{
		protocol: 'http',
		ip: '',
		port: '',
		username: '',
		password: '',
	}
*/
Config.proxies = [];
