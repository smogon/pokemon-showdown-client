import { strict as assert } from 'assert';
import * as http from 'http';
import test from 'node:test';
import { Replays } from '../replays';
import { Server } from '../server';
import { replays } from '../tables';

async function waitForListening(server: Server) {
	await new Promise<void>((resolve, reject) => {
		const cleanup = () => {
			server.server.off('listening', onListening);
			server.server.off('error', onError);
		};
		const onListening = () => {
			cleanup();
			resolve();
		};
		const onError = (err: Error) => {
			cleanup();
			reject(err);
		};
		server.server.once('listening', onListening);
		server.server.once('error', onError);
	});
}

async function closeServer(server: Server) {
	if (!server.server.listening) {
		try {
			server.server.close();
		} catch {}
		return;
	}
	await new Promise<void>(resolve => {
		try {
			server.server.close(() => resolve());
		} catch {
			resolve();
		}
	});
}

void test('/api/test reports unknown request type', async () => {
	const server = new Server(0, '127.0.0.1');
	try {
		await waitForListening(server);
		const address = server.server.address();
		assert(address && typeof address === 'object');

		const response = await new Promise<{ statusCode: number | undefined, body: string }>((resolve, reject) => {
			const req = http.request({
				host: '127.0.0.1',
				port: address.port,
				path: '/api/test',
			}, res => {
				let body = '';
				res.setEncoding('utf8');
				res.on('data', chunk => {
					body += chunk;
				});
				res.on('end', () => resolve({ statusCode: res.statusCode, body }));
			});
			req.on('error', reject);
			req.end();
		});

		assert.equal(response.statusCode, 404);
		assert.equal(response.body, 'Error: Request type "test" was not recognized.');
	} finally {
		await closeServer(server);
	}
});

void test('/api/replays/get.json uses the mock database', async () => {
	const server = new Server(null);
	try {
		assert.equal(replays.db.type, 'sqlite');
		const firstResponse = await server.request('/api/replays/get.json', { id: 'oumonotype-82345404' });
		assert.equal(firstResponse.statusCode, 200);
		assert.equal(JSON.parse(firstResponse.body).views, 5468);

		const replay = await Replays.get('oumonotype-82345404');
		assert(replay);
		assert.equal(replay.views, 5468);

		const secondResponse = await server.request('/api/replays/get.json', { id: 'oumonotype-82345404' });
		assert.equal(secondResponse.statusCode, 200);
		assert.equal(JSON.parse(secondResponse.body).views, 5469);
	} finally {
		await server.close();
	}
});
