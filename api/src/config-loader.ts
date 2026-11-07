/**
 * Config loader
 *
 * Normal use is to pass the config file in either argv or the
 * `CONFIG_PATH` env variable.
 *
 * @author mia-pi-git, Zarel
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { createRequire } from 'node:module';
import type configDefaults from '../config/config-example.cjs';

const require = createRequire(import.meta.url);
const defaults = require('../config/config-example.cjs') as typeof configDefaults;
const configFile = process.argv[2] || process.env.CONFIG_PATH;
const configPath = configFile ? path.resolve(import.meta.dirname, '..', configFile) : null;
let resolvedConfigPath: string | null = null;

export type Configuration = typeof defaults;

export function load(invalidate = false): Configuration {
	if (process.env.NODE_TEST_CONTEXT) {
		const databasePath = path.resolve(import.meta.dirname, 'test/fixtures/database.sql');
		return {
			...defaults,
			watchconfig: false,
			loadprivaterelayips: false,
			logindb: { driver: 'mock', path: databasePath },
			friendsdb: null,
			replaysdb: null,
			ladderdb: null,
		};
	}

	if (!configPath) {
		console.log("No config specified in process.argv or process.env - loading default settings...");
		return { ...defaults };
	}
	let config = { ...defaults };
	try {
		resolvedConfigPath ||= require.resolve(configPath);
		if (invalidate) delete require.cache[resolvedConfigPath];
		config = { ...config, ...require(resolvedConfigPath) };
	} catch (err: any) {
		if (err.code !== 'MODULE_NOT_FOUND') throw err; // Should never happen

		console.log("No config specified in process.argv or process.env - loading default settings...");
		return { ...config };
	}
	return { ...config };
}
export const Config: Configuration = load();

if (Config.watchconfig && resolvedConfigPath) {
	fs.watchFile(resolvedConfigPath, () => {
		Object.assign(Config, { ...load(true) });
	});
}
