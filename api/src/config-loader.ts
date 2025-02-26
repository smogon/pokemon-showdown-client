/**
 * Config handling - here because of strange babel errors.
 * By Mia
 * @author mia-pi-git
 */

import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore no typedef file
import * as defaults from '../config/config-example';

export type Configuration = typeof defaults;

export function load(invalidate = false): Configuration {
	const configPath = path.resolve(__dirname + "/../../", (process.argv[2] || process.env.CONFIG_PATH || ""));
	if (invalidate) delete require.cache[configPath];
	let config = { ...defaults };
	try {
		config = { ...config, ...require(configPath) };
	} catch (err: any) {
		if (err.code !== 'MODULE_NOT_FOUND') throw err; // Should never happen

		if (process.env.IS_TEST) return config; // should not need this for tests
		console.log("No config specified in process.argv or process.env - loading default settings...");
		return { ...config };
	}
	return { ...config };
}
export const Config: Configuration = load();

if (Config.watchconfig) {
	fs.watchFile(require.resolve('../../config/config'), () => {
		Object.assign(Config, { ...load(true) });
	});
}
