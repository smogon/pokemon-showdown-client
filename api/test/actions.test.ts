/**
 * Tests for all actions the loginserver can perform.
 * By Mia.
 * @author mia-pi-git
 */
import {strict as assert} from 'assert';
import * as utils from './test-utils';

describe.skip("Loginserver actions", async () => {
	const server = utils.addServer({
		id: 'etheria',
		name: "Etheria",
		port: 8000,
		server: 'despondos.psim.us',
		token: '42354y6dhgfdsretr',
	});
	it("Should properly log userstats and userstats history", async () => {
		const dispatcher = utils.makeDispatcher({
			act: 'updateuserstats',
			users: `20`,
			date: `${Date.now()}`,
			servertoken: server.token,
			serverid: 'etheria',
		});
		assert.doesNotThrow(async () => {
			const res = await dispatcher.executeActions();
			assert(res.actionsuccess, 'Got falsy success');
		});
	});
	it("Should properly register users", async () => {
		const dispatcher = utils.makeDispatcher({
			username: 'Catra',
			password: 'applesauce',
			cpassword: 'applesauce',
			captcha: 'pikachu',
			challstr: 'erthgsefeg78yuh',
			challengekeyid: 1,
		});
		dispatcher.request.method = 'POST';
		assert.doesNotThrow(async () => {
			const res = await dispatcher.executeActions();
			assert(res.actionsuccess);
			assert(res.curuser.userid === 'catra');
		});
	});

	it("Should log in a user", async () => {
		const dispatcher = utils.makeDispatcher({
			name: 'catra',
			pass: 'applesauce',
			challengekeyid: 1,
			challstr: '454y6htret5yhttg',
		});
		// make sure the user exists. .catch so if they do, we ignore that error
		await dispatcher.session.addUser('Catra', 'applesauce').catch(() => {});
		assert.doesNotThrow(async () => {
			await dispatcher.session.login('catra', 'applesauce');
		});
	});
});
