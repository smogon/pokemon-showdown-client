/**
 * Initialization.
 */
import { Server } from './server';
export const server = new Server();

import { connectedDatabases } from './database';

console.log(`Server listening on ${server.port}`);

process.on('uncaughtException', (err: Error) => {
	Server.crashlog(err, 'The main process');
});

process.on('unhandledRejection', (err: Error) => {
	Server.crashlog(err, 'A main process promise');
});

// graceful shutdown.
process.on('SIGINT', () => {
	console.log(`Quitting...`);
	void server.close().then(() => {
		// we are no longer accepting requests and all requests have been handled.
		// now it's safe to close DBs
		for (const database of connectedDatabases) {
			database.close();
		}
		process.exit(0);
	});
});
