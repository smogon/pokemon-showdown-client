/**
 * Config handling - here because of strange babel errors.
 * By Mia
 * @author mia-pi-git
 */

import * as fs from 'fs';
import * as path from 'path';
// @ts-ignore no typedef file
import * as defaults from '../config/config-example';

export type Configuration = typeof defaults;

export function load(invalidate = false): Configuration {
	const configPath = path.resolve(__dirname, '../config/config.js');
	if (invalidate) delete require.cache[configPath];
	let config = defaults;
	try {
		config = {...config, ...require(configPath)};
	} catch (err: any) {
		if (err.code !== 'ENOENT') throw err; // Should never happen

		console.log("config.js doesn't exist - creating one with default settings...");
		fs.writeFileSync(
			configPath,
			fs.readFileSync(path.resolve(__dirname, '../config/config-example.js'))
		);
	}
	if (!config.mainserver) {
		config.mainserver = 'showdown';
	}
	const needsSet = ['autolockip', 'sysops', 'trustedproxies', 'compromisedkeys'] as const;
	for (const key of needsSet) {
		if (!config[key]) config[key] = [];
	}
	return config;
}

export const Config: Configuration = load();

if (Config.watchconfig) {
	fs.watchFile(require.resolve('../config/config'), () => {
		Object.assign(Config, {...load(true)});
	});
}
