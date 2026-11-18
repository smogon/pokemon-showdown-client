import { strict as assert } from 'node:assert';
import { once } from 'node:events';
import { after, before, beforeEach, suite, test } from 'node:test';

import * as bcrypt from 'bcrypt';

import { Server } from '../server.ts';
import * as tables from '../tables.ts';

void suite('team changes', () => {
	let server: Server;
	let origin: string;
	let sid: string;
	let invalidSid: string;
	let cookie: string;
	const originalTeam = {
		teamid: '1', ownerid: 'teamtester', team: 'Pikachu|||Static|Thunderbolt',
		format: 'gen9ou', title: 'Test team', private: 'originalpassword', views: 12,
	};

	void before(async () => {
		await tables.users.insert({ userid: 'teamtester', username: 'Team Tester' });
		const secret = 'test-session-secret';
		const now = Math.floor(Date.now() / 1000);
		const { insertId } = await tables.sessions.insert({
			userid: 'teamtester', sid: await bcrypt.hash(secret, 4),
			time: now, timeout: now + 3600, ip: '127.0.0.1',
		});
		sid = `Team Tester,${insertId},${secret}`;
		invalidSid = `Team Tester,${insertId},wrong-secret`;
		cookie = `sid=${encodeURIComponent(sid)}`;
		server = new Server(0, '127.0.0.1');
		await once(server.server, 'listening');
		const address = server.server.address();
		assert(address && typeof address === 'object');
		origin = `http://127.0.0.1:${address.port}`;
	});

	async function resetTeam() {
		await tables.teams.deleteAll()``;
		await tables.teams.insert(originalTeam);
	}
	void beforeEach(resetTeam);

	void after(async () => {
		await new Promise<void>(resolve => {
			server.server.close(() => resolve());
		});
	});

	async function request(action: string, options: {
		method?: string, origin?: string, cookie?: string, sid?: string, fetchSite?: string,
	} = {}) {
		const method = options.method || 'POST';
		const body = new URLSearchParams({
			teamid: '1', private: '0', format: 'gen9uu',
			...(options.sid !== undefined ? { sid: options.sid } : {}),
		});
		const response = await fetch(`${origin}/api/${action}${method === 'GET' ? `?${body}` : ''}`, {
			method,
			headers: {
				...(options.origin !== undefined ? { origin: options.origin } : {}),
				...(options.cookie ? { cookie: options.cookie } : {}),
				...(options.fetchSite ? { 'sec-fetch-site': options.fetchSite } : {}),
				...(method === 'POST' ? { 'content-type': 'application/x-www-form-urlencoded' } : {}),
			},
			...(method === 'POST' ? { body } : {}),
		});
		const text = await response.text();
		assert.equal(text.charAt(0), ']');
		return JSON.parse(text.slice(1));
	}

	async function snapshot() {
		return (await tables.teams.selectAll()`ORDER BY teamid`).map(team => ({ ...team }));
	}

	for (const action of ['editteam', 'deleteteam', 'copyteam']) {
		async function assertMutation(options: Parameters<typeof request>[1]) {
			const [original] = await snapshot();
			const result = await request(action, options);
			assert.equal(result.actionerror, undefined);
			const rows = await snapshot();
			if (action === 'editteam') {
				assert.equal(result.success, true);
				assert.deepEqual(rows, [{ ...original, format: 'gen9uu', private: null }]);
				assert.deepEqual(result.team, rows[0]);
			} else if (action === 'deleteteam') {
				assert.equal(result.success, true);
				assert.deepEqual(rows, []);
			} else {
				assert.equal(rows.length, 2);
				assert.deepEqual(rows[0], original);
				const copy = rows[1];
				assert.equal(copy.ownerid, original.ownerid);
				assert.equal(copy.team, original.team);
				assert.equal(copy.format, original.format);
				assert.equal(copy.title, `Copy of '${original.title}' by ${original.ownerid}`);
				assert.equal(copy.views, 0);
				assert.equal(copy.private.length, 20);
				assert.notEqual(copy.private, original.private);
				assert.equal(result.teamid, `${copy.teamid}-${copy.private}`);
			}
		}

		void test(`${action} mutates the team with a same-origin cookie-authenticated POST`, async () => {
			await assertMutation({ origin, cookie });
		});

		void test(`${action} accepts a valid explicit SID without cookies or a same-origin header`, async () => {
			for (const requestOrigin of [undefined, 'https://client.example']) {
				await resetTeam();
				await assertMutation({ origin: requestOrigin, sid, fetchSite: 'cross-site' });
			}
		});

		void test(`${action} rejects unsafe requests with valid credentials without changing teams`, async () => {
			const original = await snapshot();
			const requests = [
				{ method: 'GET', origin, cookie },
				{ method: 'GET', origin, sid },
				{ cookie },
				{ origin: 'null', cookie },
				{ origin: 'https://attacker.example', cookie },
				{ origin, cookie, fetchSite: 'cross-site' },
				{ origin, cookie, fetchSite: 'same-site' },
				{ origin: 'https://attacker.example', cookie, sid: '' },
			];
			for (const options of requests) {
				const result = await request(action, options);
				assert.equal(result.actionerror, 'Invalid team change request.', JSON.stringify(options));
				assert.deepEqual(await snapshot(), original);
			}
		});

		void test(`${action} never falls back to the cookie when an explicit SID is invalid`, async () => {
			const original = await snapshot();
			for (const badSid of ['dummy', invalidSid]) {
				for (const requestOrigin of [origin, 'https://attacker.example']) {
					const result = await request(action, { origin: requestOrigin, cookie, sid: badSid });
					assert.match(result.actionerror, /Must be logged in/);
					assert.deepEqual(await snapshot(), original);
				}
			}
		});

		void test(`${action} requires authentication even for same-origin requests`, async () => {
			const original = await snapshot();
			assert.match((await request(action, { origin })).actionerror, /Must be logged in/);
			assert.deepEqual(await snapshot(), original);
		});
	}
});
