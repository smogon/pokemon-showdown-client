/**
 * Initialization.
 */
import {Router} from './server';
export const server = new Router();

import {databases} from './database';

console.log(`Server listening on ${server.port}`);

process.on('uncaughtException', (err: Error) => {
	console.log(`${err.message}\n${err.stack}`);
});

process.on('unhandledRejection', (err: Error) => {
	console.log(`A promise crashed: ${err.message}\n${err.stack}`);
});

// graceful shutdown.
process.once('SIGINT', () => {
	void server.close().then(() => {
		// we are no longer accepting requests and all requests have been handled.
		// now it's safe to close DBs
		for (const database of databases) {
			database.close();
		}
		process.exit(0);
	});
});
