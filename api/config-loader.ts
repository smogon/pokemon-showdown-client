/**
 * Config handling - here because of strange babel errors.
 * By Mia
 * @author mia-pi-git
 */

import * as fs from 'fs';
import * as path from 'path';
// @ts-ignore no typedef file
import * as defaults from '../config/ls-config-example';

export type Configuration = typeof defaults & {[k: string]: any};

export function load(invalidate = false): Configuration {
	if (invalidate) delete require.cache[path.resolve(__dirname, '../config/ls-config')];
	const config = defaults;
	try {
		Object.assign(config, require('../config/ls-config'));
	} catch (err) {
		if (err.code !== 'MODULE_NOT_FOUND' && err.code !== 'ENOENT') throw err; // Should never happen

		console.log("config.js doesn't exist - creating one with default settings...");
		fs.writeFileSync(
			path.resolve(__dirname, '../config/ls-config.js'),
			fs.readFileSync(path.resolve(__dirname, '../config/ls-config-example.js'))
		);
	}
	// we really don't need to load from here afterwards since
	// the configuration in the new ls-config will be the same as defaults.
	if (!config.routes) {
		config.routes = require('../config/routes');
	}
	return config;
}

export const Config = load();

if (Config.watchconfig) {
	fs.watchFile(require.resolve('../config/ls-config'), () => load(true));
}
