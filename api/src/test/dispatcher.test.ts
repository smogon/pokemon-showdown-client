/**
 * Tests for HTTP request dispatch.
 */
import { strict as assert } from 'assert';
import * as http from 'http';
import { after, before, suite, test } from 'node:test';

import { Config } from '../config-loader';
import { Server } from '../server';

const SERVERTOKEN = 'jiuhygjhf';

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
		const onError = (error: Error) => {
			cleanup();
			reject(error);
		};
		server.server.once('listening', onListening);
		server.server.once('error', onError);
	});
}

async function closeServer(server: Server) {
	await new Promise<void>(resolve => {
		server.server.close(() => resolve());
	});
}

async function request(server: Server, path: string, headers: http.OutgoingHttpHeaders = {}) {
	const address = server.server.address();
	assert(address && typeof address === 'object');
	return new Promise<{
		statusCode: number | undefined,
		body: string,
		headers: http.IncomingHttpHeaders,
	}>((resolve, reject) => {
		const req = http.request({
			host: '127.0.0.1',
			port: address.port,
			path,
			headers,
		}, response => {
			let body = '';
			response.setEncoding('utf8');
			response.on('data', chunk => {
				body += chunk;
			});
			response.on('end', () => resolve({
				statusCode: response.statusCode,
				body,
				headers: response.headers,
			}));
		});
		req.on('error', reject);
		req.end();
	});
}

function parseResponse(body: string): any {
	assert.equal(body.charAt(0), ']');
	return JSON.parse(body.slice(1));
}

void suite('Dispatcher features', () => {
	let server: Server;

	void before(async () => {
		server = new Server(0, '127.0.0.1');
		await waitForListening(server);
	});

	void after(async () => {
		await closeServer(server);
	});

	void test('Should properly detect servers', async () => {
		const response = await request(
			server,
			`/api/invalidatecss?serverid=etheria&servertoken=${SERVERTOKEN}`
		);
		assert.equal(response.statusCode, 200);
		assert.deepEqual(parseResponse(response.body), { actionsuccess: false });
	});

	void test('Should validate servertokens', async () => {
		const response = await request(
			server,
			'/api/mmr?format=gen9ou&user=mia&serverid=etheria&servertoken=invalid'
		);
		assert.equal(response.statusCode, 200);
		assert.deepEqual(parseResponse(response.body), {
			actionerror: 'Invalid servertoken sent for requested serverid.',
		});
	});

	void test('Should validate CORS requests', async () => {
		Config.cors = [[/etheria/, 'server_']];
		const allowed = await request(server, '/api/register', { origin: 'https://etheria.psim.us/' });
		assert.equal(allowed.headers['access-control-allow-origin'], 'https://etheria.psim.us/');

		const rejected = await request(server, '/api/register', { origin: 'nevergonnagiveyouup' });
		assert.equal(rejected.headers['access-control-allow-origin'], undefined);
	});

	void test('Should support requesting /api/[action]', async () => {
		const response = await request(server, '/api/mmr?format=gen9ou&user=mia&serverid=showdown');
		assert.equal(response.statusCode, 200);
		assert.equal(parseResponse(response.body), 1000);
	});

	void test('Should support requesting action.php with an `act` param', async () => {
		const response = await request(
			server, '/action.php?act=mmr&format=gen9ou&user=mia&serverid=showdown'
		);
		assert.equal(response.statusCode, 200);
		assert.equal(parseResponse(response.body), 1000);
	});

	void test('Should load servers properly', async () => {
		const response = await request(
			server,
			`/api/mmr?format=gen9ou&user=mia&serverid=etheria&servertoken=${SERVERTOKEN}`
		);
		assert.equal(response.statusCode, 200);
		assert.deepEqual(parseResponse(response.body), {
			errorip: 'This ladder is not for your server. You should turn off Config.remoteladder.',
		});
	});
});
