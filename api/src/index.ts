/**
 * Initialization.
 */
import {Router} from './server';
export const server = new Router();

import {databases} from './database';

console.log(`Server listening on ${server.port}`);

process.on('uncaughtException', (err: Error) => {
	Router.crashlog(err, 'The main process');
});

process.on('unhandledRejection', (err: Error) => {
	Router.crashlog(err, 'A main process promise');
});

// graceful shutdown.
process.on('SIGINT', () => {
	void server.close().then(() => {
		// we are no longer accepting requests and all requests have been handled.
		// now it's safe to close DBs
		for (const database of databases) {
			database.close();
		}
	});
});
