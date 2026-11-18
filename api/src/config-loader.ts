/**
 * Config loader
 *
 * Loads config/apiserver.mts or config/apiserver.mjs, with argv and CONFIG_PATH overrides.
 *
 * @author mia-pi-git, Zarel
 */

import * as path from 'node:path';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { config as defaults, type Configuration } from '../../config/apiserver-example.mjs';

export type { Configuration } from '../../config/apiserver-example.mjs';

const require = createRequire(import.meta.url);

export function load(): Configuration {
	if (process.env.NODE_TEST_CONTEXT) {
		const databasePath = path.resolve(import.meta.dirname, 'test/fixtures/database.sql');
		return {
			...defaults,
			loadprivaterelayips: false,
			logindb: { driver: 'mock', path: databasePath },
			friendsdb: null,
			replaysdb: null,
			ladderdb: null,
		};
	}

	const configFile = process.argv[2] || process.env.CONFIG_PATH;
	let configPath = path.resolve(import.meta.dirname, '../..', configFile || 'config/apiserver.mts');
	if (!configFile && !existsSync(configPath)) {
		configPath = path.resolve(import.meta.dirname, '../../config/apiserver.mjs');
	}
	const { default: config } = require(configPath) as { default?: Partial<Configuration> };
	if (!config || typeof config !== 'object' || Array.isArray(config)) {
		throw new Error(`Config ${configPath} must default-export a configuration object.`);
	}
	return { ...defaults, ...config };
}
export const Config: Configuration = load();
