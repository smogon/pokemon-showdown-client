/**
 * Tests for context functions.
 * By Mia.
 * @author mia-pi-git
 */
import { strict as assert } from 'assert';
import { Config } from '../config-loader';
import { ActionContext, ActionError, SimServers } from '../server';
import * as path from 'path';

import * as utils from './test-utils';

const servertoken = 'jiuhygjhf';
describe('Dispatcher features', () => {
	const context = utils.makeDispatcher({
		serverid: 'etheria',
		servertoken,
		act: 'mmr',
	});
	const server = utils.addServer({
		id: 'etheria',
		name: 'Etheria',
		port: 8000,
		server: 'despondos.psim.us',
		token: servertoken,
	});
	it('Should properly detect servers', async () => {
		const cur = await context.getServer();
		assert(server.id === cur?.id);
	});
	it('Should validate servertokens', async () => {
		const cur = await context.getServer(true);
		assert(cur);
		assert(server.id === cur.id);
		// invalidate the servertoken, we shouldn't find the server now
		// eslint-disable-next-line require-atomic-updates
		context.body.servertoken = '';
		const result = await context.getServer(true).catch(e => e);
		assert(result instanceof ActionError);
	});

	it('Should validate CORS requests', () => {
		Config.cors = [
			[/etheria/, 'server_'],
		];
		context.request.headers['origin'] = 'https://etheria.psim.us/';
		let prefix = context.verifyCrossDomainRequest();
		assert(prefix === 'server_', `Wrong challengeprefix: ${prefix}`);
		assert(context.response.hasHeader('Access-Control-Allow-Origin'), 'missing CORS header');

		context.response.removeHeader('Access-Control-Allow-Origin');
		context.request.headers['origin'] = 'nevergonnagiveyouup';

		context.setPrefix('');
		prefix = context.verifyCrossDomainRequest();
		assert(prefix === '', `has improper challengeprefix: ${prefix}`);
		const header = context.response.hasHeader('Access-Control-Allow-Origin');
		assert(!header, `has CORS header where it should not: ${header}`);
	});
	it('Should support requesting /api/[action]', async () => {
		const req = context.request;
		req.url = '/api/mmr?userid=mia';
		const body = await ActionContext.getBody(req);
		assert(!Array.isArray(body));
		assert(body.act === 'mmr');
	});
	it('Should support requesting action.php with an `act` param', async () => {
		const req = context.request;
		req.url = '/action.php?act=mmr&userid=mia';
		const body = await ActionContext.getBody(req);
		assert(!Array.isArray(body));
		assert(body.act === 'mmr');
		assert(body.userid === 'mia');
	});
	it("Should load servers properly", () => {
		const servers = SimServers.loadServers(
			path.join(__dirname, '/../../', 'src/test/fixtures/servers.php')
		);
		assert.deepStrictEqual({
			showdown: {
				name: 'Smogon University',
				id: 'showdown',
				server: 'sim.psim.us',
				port: 8000,
				owner: 'mia',
			},
		}, servers);
	});
});
