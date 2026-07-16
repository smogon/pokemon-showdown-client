// PM2 interprets `.ts` entry points as meaning Bun.
// Setting `interpreter: "node"` makes it interpret `.ts` as ts-node.
// Naming this `.js` fixes that.
// TODO: one day when PM2 supports TypeScript, this will be a `.ts` file
// see https://github.com/Unitech/pm2/issues/6014

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
