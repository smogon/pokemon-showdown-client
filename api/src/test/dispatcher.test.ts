/**
 * Tests for dispatcher functions.
 * By Mia.
 * @author mia-pi-git
 */
import {strict as assert} from 'assert';
import {Config} from '../config-loader';
import {ActionContext, ActionError} from '../server';
import * as path from 'path';

import * as utils from './test-utils';

const servertoken = 'jiuhygjhf';
describe('Dispatcher features', () => {
	const dispatcher = utils.makeDispatcher({
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
		const cur = await dispatcher.getServer();
		assert(server.id === cur?.id);
	});
	it('Should validate servertokens', async () => {
		const cur = await dispatcher.getServer(true);
		assert(cur);
		assert(server.id === cur.id);
		// invalidate the servertoken, we shouldn't find the server now
		(dispatcher.opts.body as {[k: string]: string}).servertoken = '';
		const result = await dispatcher.getServer(true).catch(e => e);
		assert(result instanceof ActionError);
	});

	it('Should validate CORS requests', () => {
		Config.cors = [
			[/etheria/, 'server_'],
		];
		dispatcher.request.headers['origin'] = 'https://etheria.psim.us/';
		let prefix = dispatcher.verifyCrossDomainRequest();
		assert(prefix === 'server_', 'Wrong challengeprefix: ' + prefix);
		assert(dispatcher.response.hasHeader('Access-Control-Allow-Origin'), 'missing CORS header');

		dispatcher.response.removeHeader('Access-Control-Allow-Origin');
		dispatcher.request.headers['origin'] = 'nevergonnagiveyouup';

		dispatcher.setPrefix('');
		prefix = dispatcher.verifyCrossDomainRequest();
		assert(prefix === '', 'has improper challengeprefix: ' + prefix);
		const header = dispatcher.response.hasHeader('Access-Control-Allow-Origin');
		assert(!header, 'has CORS header where it should not: ' + header);
	});
	it('Should support requesting /api/[action]', () => {
		const req = dispatcher.request;
		req.url = '/api/mmr?userid=mia';
		const act = ActionContext.parseAction(req, ActionContext.parseURLRequest(req));
		assert(act === 'mmr');
	});
	it('Should support requesting action.php with an `act` param', () => {
		const req = dispatcher.request;
		req.url = '/action.php?act=mmr&userid=mia';
		const body = ActionContext.parseURLRequest(req);
		const act = ActionContext.parseAction(req, body);
		assert(act === 'mmr');
		assert(body?.userid === 'mia');
	});
	it("Should load servers properly", () => {
		const servers = ActionContext.loadServers(
			path.join(__dirname, '/../../', 'src/test/fixtures/servers.php')
		);
		assert.deepStrictEqual({
			showdown: {
				name: 'Smogon University',
				id: 'showdown',
				server: 'sim.psim.us',
				port: 8000,
				owner: 'mia'
			},
		}, servers);
	});
});
