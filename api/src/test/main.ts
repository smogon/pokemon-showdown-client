/**
 * Test setup.
 */
import { start } from './mysql';
import * as fs from 'fs';
import * as path from 'path';
before(async () => {
	process.env.IS_TEST = '1';
	if (!process.env.USE_LOCAL_DB) {
		const files = fs.readdirSync(path.resolve(__dirname, '../')).map(
			f => path.resolve(__dirname, '../schemas', f)
		);
		await start({
			startupFiles: files,
		});
	}
});
