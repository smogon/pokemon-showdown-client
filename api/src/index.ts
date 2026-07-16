import { Server } from './server';
import { closeDatabases } from './database';

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

process.on('uncaughtException', (err: Error) => {
	Server.crashlog(err, 'The main process');
});

process.on('unhandledRejection', (err: Error) => {
	Server.crashlog(err, 'A main process promise');
});

console.log(`Server listening on ${server.host}:${server.port}`);
