/**
 * Tests for dispatcher functions.
 * By Mia.
 * @author mia-pi-git
 */
import {strict as assert} from 'assert';
import {Config} from '../config-loader';

import * as utils from './test-utils';

describe("Dispatcher features", () => {
	const dispatcher = utils.makeDispatcher({
		serverid: 'etheria',
		servertoken: '42354y6dhgfdsretr',
		act: 'mmr',
	});
	const server = utils.addServer({
		id: 'etheria',
		name: "Etheria",
		port: 8000,
		server: 'despondos.psim.us',
		token: '42354y6dhgfdsretr',
	});
	it("Should properly detect servers", () => {
		const cur = dispatcher.getServer();
		assert(server.id === cur?.id);
	});
	it("Should validate servertokens", () => {
		const cur = dispatcher.getServer(true);
		assert(server.id === cur.id);
		// invalidate the servertoken, we shouldn't find the server now
		dispatcher.opts.body.servertoken = null;
		assert.throws(() => dispatcher.getServer(true));
	});

	it("Should validate CORS requests", () => {
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
	it("Should support requesting /api/[action]", () => {
		dispatcher.request.url = '/api/mmr?userid=mia';
		dispatcher.opts.body = null;
		const {act} = dispatcher.parseRequest();
		assert(act === 'mmr');
	});
	it('Should support requesting action.php with an `act` param', () => {
		dispatcher.request.url = '/action.php?act=mmr&userid=mia';
		dispatcher.opts.body = null;
		const {act, body} = dispatcher.parseRequest();
		assert(act === 'mmr');
		assert(body.userid === 'mia');
	});
});
