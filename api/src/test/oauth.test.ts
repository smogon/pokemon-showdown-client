/**
 * Tests for the loginserver's OAuth-style assertion flow.
 */
import { strict as assert } from 'node:assert';
import * as crypto from 'node:crypto';
import * as http from 'node:http';
import { after, before, beforeEach, suite, test } from 'node:test';

import { Config } from '../config-loader.ts';
import { Server } from '../server.ts';
import * as tables from '../tables.ts';

const CLIENT_A = '0000000000000000000000000000000a';
const CLIENT_B = '0000000000000000000000000000000b';
const CLIENT_ORIGIN = 'https://client.example';
const TOKEN_TIME = 14 * 24 * 60 * 60 * 1000;
const REFRESH_GRACE_TIME = 7 * 24 * 60 * 60 * 1000;

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

async function httpRequest(
	server: Server,
	path: string,
	options: {
		method?: string,
		headers?: http.OutgoingHttpHeaders,
		body?: string,
	} = {}
) {
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
			method: options.method,
			headers: options.headers,
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
		req.end(options.body);
	});
}

function parseResponse(body: string) {
	assert.equal(body.charAt(0), ']');
	return JSON.parse(body.slice(1));
}

void suite('OAuth', () => {
	let server: Server;
	let sid = '';
	let sessionCookie = '';
	let serverOrigin = '';
	let oldPrivateKey: string;

	void before(async () => {
		server = new Server(0, '127.0.0.1');
		await waitForListening(server);
		const address = server.server.address();
		assert(address && typeof address === 'object');
		serverOrigin = `http://127.0.0.1:${address.port}`;

		oldPrivateKey = Config.privatekey;
		Config.privatekey = crypto.generateKeyPairSync('rsa', {
			modulusLength: 1024,
		}).privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();

		await tables.users.delete('oauthfixture').catch(() => null);
		const registration = await server.request('register', {
			username: 'OAuthFixture',
			password: 'applesauce',
			cpassword: 'applesauce',
			captcha: 'pikachu',
			challstr: crypto.randomBytes(32).toString('hex'),
			challengekeyid: `${Config.challengekeyid}`,
		});
		assert.equal(registration.result.curuser.userid, 'oauthfixture');
		const login = await server.request('login', {
			name: 'OAuthFixture',
			pass: 'applesauce',
			challstr: crypto.randomBytes(32).toString('hex'),
			challengekeyid: `${Config.challengekeyid}`,
		});
		assert(login.result.actionsuccess);
		const setCookie = login.context.response.getHeader('Set-Cookie');
		assert(typeof setCookie === 'string');
		const cookieMatch = /^sid=([^;]+)/.exec(setCookie);
		assert(cookieMatch);
		sessionCookie = `sid=${cookieMatch[1]}`;
		sid = decodeURIComponent(cookieMatch[1]);
	});

	void after(async () => {
		Config.privatekey = oldPrivateKey;
		await closeServer(server);
	});

	void beforeEach(async () => {
		await tables.oauthTokens.deleteAll()``;
		await tables.oauthClients.deleteAll()``;
		await tables.oauthClients.insert({
			owner: 'oauthfixture',
			client_title: 'OAuth fixture A',
			origin_url: `${CLIENT_ORIGIN}/oauth/callback`,
			id: CLIENT_A,
		});
		await tables.oauthClients.insert({
			owner: 'oauthfixture',
			client_title: 'OAuth fixture B',
			origin_url: 'https://other-client.example/callback',
			id: CLIENT_B,
		});
	});

	void test('validates callback origins and serves the hardened authorization page', async () => {
		const validParams = new URLSearchParams({
			client_id: CLIENT_A,
			redirect_uri: `${CLIENT_ORIGIN}/another/path?state=preserved`,
			challenge: 'oauthchallenge',
		});
		const valid = await httpRequest(server, `/api/oauth/authorize?${validParams}`);
		assert.equal(valid.statusCode, 200);
		assert.match(valid.body, /OAuth fixture A/);
		assert.match(valid.body, /\$\.post\('\/api\/oauth\/api\/authorize'/);
		assert.match(valid.body, /redirect\.searchParams\.set\('token', params\.get\('token'\)\)/);
		assert.equal(valid.headers['access-control-allow-origin'], undefined);

		for (const redirectUri of [
			'not-a-url',
			'javascript:alert(1)',
			'http://client.example/oauth/callback',
			'https://client.example:8443/oauth/callback',
			'https://attacker.example/oauth/callback',
		]) {
			const params = new URLSearchParams({
				client_id: CLIENT_A,
				redirect_uri: redirectUri,
				challenge: 'oauthchallenge',
			});
			const response = await httpRequest(server, `/api/oauth/authorize?${params}`);
			assert.equal(response.statusCode, 200);
			assert(parseResponse(response.body).actionerror);
		}
	});

	void test('requires same-origin POST for explicit authorization', async () => {
		const path = `/api/oauth/api/authorize?client_id=${CLIENT_A}`;
		const getResponse = await httpRequest(server, path, {
			headers: { cookie: sessionCookie },
		});
		assert.equal(
			parseResponse(getResponse.body).actionerror,
			'OAuth authorization requires POST.'
		);

		for (const origin of [undefined, 'https://attacker.example']) {
			const response = await httpRequest(server, '/api/oauth/api/authorize', {
				method: 'POST',
				headers: {
					cookie: sessionCookie,
					'content-type': 'application/x-www-form-urlencoded',
					...(origin ? { origin } : {}),
				},
				body: new URLSearchParams({ client_id: CLIENT_A }).toString(),
			});
			assert.equal(
				parseResponse(response.body).actionerror,
				'OAuth authorization requires a same-origin request.'
			);
			assert.equal(response.headers['access-control-allow-origin'], undefined);
		}

		const authorized = await httpRequest(server, '/api/oauth/api/authorize', {
			method: 'POST',
			headers: {
				cookie: sessionCookie,
				origin: serverOrigin,
				'content-type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({ client_id: CLIENT_A }).toString(),
		});
		const result = parseResponse(authorized.body);
		assert.equal(result.user, 'oauthfixture');
		assert.match(result.success, /^[0-9a-f]{32}$/);
		assert.equal((await tables.oauthTokens.get(result.success))?.client, CLIENT_A);
		assert.equal(authorized.headers['access-control-allow-origin'], undefined);

		const defaultPort = await httpRequest(server, '/api/oauth/api/authorize', {
			method: 'POST',
			headers: {
				cookie: sessionCookie,
				host: 'login.example:443',
				origin: 'https://login.example',
				'content-type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({ client_id: CLIENT_A }).toString(),
		});
		assert.equal(parseResponse(defaultPort.body).actionerror, undefined);

		const proxied = await httpRequest(server, '/api/oauth/api/authorize', {
			method: 'POST',
			headers: {
				cookie: sessionCookie,
				host: 'internal.example:8000',
				origin: 'https://login.example',
				'sec-fetch-site': 'same-origin',
				'content-type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({ client_id: CLIENT_A }).toString(),
		});
		assert.equal(parseResponse(proxied.body).actionerror, undefined);
	});

	void test('restricts bearer endpoint CORS to the registered origin', async () => {
		for (const action of ['getassertion', 'refreshtoken']) {
			const path = `/api/oauth/api/${action}?${new URLSearchParams({
				client_id: CLIENT_A,
				token: 'missing',
				...(action === 'getassertion' ? { challenge: 'oauthchallenge' } : {}),
			})}`;
			const allowed = await httpRequest(server, path, { headers: { origin: CLIENT_ORIGIN } });
			assert.deepEqual(parseResponse(allowed.body), { success: false });
			assert.equal(allowed.headers['access-control-allow-origin'], CLIENT_ORIGIN);
			assert.equal(allowed.headers['access-control-allow-credentials'], 'true');

			const rejected = await httpRequest(server, path, {
				headers: { origin: 'https://attacker.example' },
			});
			assert.equal(
				parseResponse(rejected.body).actionerror,
				'This origin is not permitted to use this OAuth client.'
			);
			assert.equal(rejected.headers['access-control-allow-origin'], undefined);

			const serverSide = await httpRequest(server, path);
			assert.deepEqual(parseResponse(serverSide.body), { success: false });
			assert.equal(serverSide.headers['access-control-allow-origin'], undefined);
		}
	});

	void test('binds assertion tokens to their client', async () => {
		const token = 'activeassertiontoken000000000001';
		await tables.oauthTokens.insert({
			owner: 'oauthfixture',
			client: CLIENT_A,
			id: token,
			time: Date.now(),
		});
		const valid = await server.request('oauth/api/getassertion', {
			client_id: CLIENT_A,
			token,
			challenge: 'oauthchallenge',
		});
		assert.equal(typeof valid.result, 'string');
		assert.match(valid.result, /^oauthchallenge,oauthfixture,/);

		const mismatched = await server.request('oauth/api/getassertion', {
			client_id: CLIENT_B,
			token,
			challenge: 'oauthchallenge',
		});
		assert.deepEqual(mismatched.result, { success: false });
		assert(await tables.oauthTokens.get(token));
	});

	void test('retains assertion-expired tokens during the refresh grace period', async () => {
		const graceToken = 'graceassertiontoken000000000001';
		await tables.oauthTokens.insert({
			owner: 'oauthfixture',
			client: CLIENT_A,
			id: graceToken,
			time: Date.now() - TOKEN_TIME - 60 * 60 * 1000,
		});
		const graceResult = await server.request('oauth/api/getassertion', {
			client_id: CLIENT_A,
			token: graceToken,
			challenge: 'oauthchallenge',
		});
		assert.deepEqual(graceResult.result, { success: false });
		assert(await tables.oauthTokens.get(graceToken));

		const oldToken = 'oldassertiontoken00000000000001';
		await tables.oauthTokens.insert({
			owner: 'oauthfixture',
			client: CLIENT_A,
			id: oldToken,
			time: Date.now() - TOKEN_TIME - REFRESH_GRACE_TIME - 1000,
		});
		const oldResult = await server.request('oauth/api/getassertion', {
			client_id: CLIENT_A,
			token: oldToken,
			challenge: 'oauthchallenge',
		});
		assert.deepEqual(oldResult.result, { success: false });
		assert.equal(await tables.oauthTokens.get(oldToken), undefined);
	});

	void test('refreshes only matching tokens within the grace period', async () => {
		const token = 'refreshtoken00000000000000000001';
		await tables.oauthTokens.insert({
			owner: 'oauthfixture',
			client: CLIENT_A,
			id: token,
			time: Date.now() - TOKEN_TIME - 60 * 60 * 1000,
		});

		const mismatch = await server.request('oauth/api/refreshtoken', {
			client_id: CLIENT_B,
			token,
		});
		assert.deepEqual(mismatch.result, { success: false });
		assert(await tables.oauthTokens.get(token));

		const refresh = await server.request('oauth/api/refreshtoken', {
			client_id: CLIENT_A,
			token,
		});
		assert.match(refresh.result.success, /^[0-9a-f]{32}$/);
		assert.notEqual(refresh.result.success, token);
		assert.equal(await tables.oauthTokens.get(token), undefined);
		const rotated = await tables.oauthTokens.get(refresh.result.success);
		assert.equal(rotated?.owner, 'oauthfixture');
		assert.equal(rotated?.client, CLIENT_A);
		assert(refresh.result.expires > Date.now() + TOKEN_TIME - 1000);
	});

	void test('deletes tokens that are too old to refresh', async () => {
		const token = 'expiredrefreshtoken0000000000001';
		await tables.oauthTokens.insert({
			owner: 'oauthfixture',
			client: CLIENT_A,
			id: token,
			time: Date.now() - TOKEN_TIME - REFRESH_GRACE_TIME - 1000,
		});
		const refresh = await server.request('oauth/api/refreshtoken', {
			client_id: CLIENT_A,
			token,
		});
		assert.deepEqual(refresh.result, { success: false });
		assert.equal(await tables.oauthTokens.get(token), undefined);
	});

	void test('allows only one concurrent token refresh to succeed', async () => {
		const token = 'concurrentrefreshtoken0000000001';
		await tables.oauthTokens.insert({
			owner: 'oauthfixture',
			client: CLIENT_A,
			id: token,
			time: Date.now(),
		});
		const results = await Promise.all([
			server.request('oauth/api/refreshtoken', { client_id: CLIENT_A, token }),
			server.request('oauth/api/refreshtoken', { client_id: CLIENT_A, token }),
		]);
		const successful = results.filter(({ result }) => result.success !== false);
		assert.equal(successful.length, 1);
		assert.equal((await tables.oauthTokens.selectAll()`WHERE client = ${CLIENT_A}`).length, 1);
	});

	void test('replaces an expired token during explicit authorization', async () => {
		const oldToken = 'authorizeexpiredtoken000000000001';
		await tables.oauthTokens.insert({
			owner: 'oauthfixture',
			client: CLIENT_A,
			id: oldToken,
			time: Date.now() - TOKEN_TIME - 1,
		});
		const response = await httpRequest(server, '/api/oauth/api/authorize', {
			method: 'POST',
			headers: {
				cookie: sessionCookie,
				origin: serverOrigin,
				'content-type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({ client_id: CLIENT_A }).toString(),
		});
		const result = parseResponse(response.body);
		assert.match(result.success, /^[0-9a-f]{32}$/);
		assert.notEqual(result.success, oldToken);
		assert.equal(await tables.oauthTokens.get(oldToken), undefined);
		assert(await tables.oauthTokens.get(result.success));
	});

	void test('checks token ownership before revocation', async () => {
		const otherToken = 'otherownertoken000000000000000001';
		await tables.oauthTokens.insert({
			owner: 'someoneelse',
			client: CLIENT_A,
			id: otherToken,
			time: Date.now(),
		});
		const denied = await server.request('oauth/api/revoke', {
			sid,
			uri: `${CLIENT_ORIGIN}/oauth/callback`,
		});
		assert.equal(
			denied.result.actionerror,
			"That application doesn't have access granted to your account."
		);
		assert(await tables.oauthTokens.get(otherToken));

		const ownToken = 'oauthfixturetoken0000000000000001';
		await tables.oauthTokens.insert({
			owner: 'oauthfixture',
			client: CLIENT_A,
			id: ownToken,
			time: Date.now(),
		});
		const revoked = await server.request('oauth/api/revoke', {
			sid,
			uri: `${CLIENT_ORIGIN}/oauth/callback`,
		});
		assert.deepEqual(revoked.result, { success: true });
		assert.equal(await tables.oauthTokens.get(ownToken), undefined);
		assert(await tables.oauthTokens.get(otherToken));
	});
});
