import { Server } from './server.ts';
import { closeDatabases } from './database.ts';

export const server = new Server();

process.on('SIGINT', () => {
	void (async () => {
		console.log(`Closing server...`);
		await server.close();
		console.log(`Closing databases...`);
		await closeDatabases();
		console.log(`DONE`);
		process.exit(0);
	})();
});

process.on('uncaughtException', err => {
	Server.crashlog(err, 'The main process');
});

process.on('unhandledRejection', err => {
	Server.crashlog(err, 'A main process promise');
});

console.log(`Server listening on ${server.host}:${server.port}`);
