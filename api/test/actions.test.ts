/**
 * Tests for all actions the loginserver can perform.
 * By Mia.
 * @author mia-pi-git
 */
import {Config} from '../config-loader';
import {strict as assert} from 'assert';
import {NTBBLadder} from '../ladder';
import * as utils from './test-utils';
import * as tables from '../tables';

(Config.testdb ? describe : describe.skip)("Loginserver actions", async () => {
	const server = utils.addServer({
		id: 'showdown',
		name: "Etheria",
		port: 8000,
		server: 'despondos.psim.us',
		token: '42354y6dhgfdsretr',
	});
	it("Should properly log userstats and userstats history", async () => {
		const {result} = await utils.testDispatcher({
			act: 'updateuserstats',
			users: `20`,
			date: `${Date.now()}`,
			servertoken: server.token,
			serverid: 'showdown',
		});
		assert(result.actionsuccess);
	});

	// users
	describe("Users features", () => {
		it("Should properly register users", async () => {
			// erase the user so the test runs uncorrupted
			await tables.users.delete('catra').catch(() => {});

			const {result} = await utils.testDispatcher({
				act: 'register',
				username: 'Catra',
				password: 'applesauce',
				cpassword: 'applesauce',
				captcha: 'pikachu',
				challstr: await utils.randomBytes(),
				challengekeyid: 1,
			});

			assert(result.curuser.userid === 'catra');
			assert(result.actionsuccess);
		});

		it("Should log in a user", async () => {
			const {result} = await utils.testDispatcher({
				act: 'login',
				name: 'catra',
				pass: 'applesauce',
				challengekeyid: 1,
				challstr: await utils.randomBytes(),
			}, async dispatcher => {
				// make sure the user exists, ignore if they do
				await dispatcher.session.addUser('Catra', 'applesauce').catch(() => {});
			});
			assert(result.actionsuccess, "User was not logged in");
			assert(result.assertion.split(';').length > 1);
		});

		it("should change the user's password", async () => {
			const {result} = await utils.testDispatcher({
				act: 'changepassword',
				username: 'Catra',
				oldpassword: 'applesauce',
				cpassword: 'greyskull',
				password: 'greyskull',
			}, dispatcher => {
				dispatcher.user.login('catra'); // we can't set cookies in tests so
			});
			assert(result, "Received falsy success");
		});
	});
	it("Should prepare replays", async () => {
		// clear old
		await tables.prepreplays.deleteOne('id = ?', ['gen8randombattle-3096']);

		// as long as it doesn't throw, we're fine
		const {result} = await utils.testDispatcher({
			act: 'prepreplay',
			id: 'gen8randombattle-3096',
			loghash: 'ec4730e807719f9b94327f4b5ab28034',
			p1: 'Adora',
			p2: 'Catra',
			format: 'gen8randombattle',
			rating: 1500,
			hidden: '',
			private: 0,
			serverid: 'showdown',
			servertoken: server.token,
			inputlog: [
				`>version 3eeccb002ecc608fb66c25b6abb3ef87f667f8b6`,
				`>version-origin a5d3aaee353a60c91076162238b2a6d09c284165`,
				`>start {"formatid":"gen8randombattle","seed":[17049,48118,24089,21353],"rated":"Rated battle"}`,
				`>player p1 {"name":"Adora","avatar":"169","rating":1000,"seed":[14989,14520,19847,43935]}`,
				`>player p2 {"name":"Catra","avatar":"miapi.png","rating":1069,"seed":[35058,54063,46942,19311]}`,
			].join('\n'),
		});

		const cached = await tables.prepreplays.selectOne(
			'*', 'id = ?',
			['gen8randombattle-3096']
		);
		assert(cached, "Could not locate entry for prepped replay");
	});

	describe("Ladder", () => {
		it("Should update the ladder", async () => {
			for (const id of ['catra', 'adora']) {
				await tables.ladder.deleteOne(
					'userid = ? AND formatid = ?',
					[id, 'gen1randombattle'],
				); // clear their ratings entirely
			}
			const {result} = await utils.testDispatcher({
				act: 'ladderupdate',
				serverid: 'showdown',
				servertoken: server.token,
				p1: 'Catra',
				p2: 'Adora',
				format: 'gen1randombattle',
				score: 1, // score 1 means p1 wins
			});
			assert(result.p1rating.elo === 1040, "Received winner elo of " + result.p1rating.elo);
			assert(result.p2rating.elo === 1000, "Received loser elo of " + result.p2rating.elo);
		});
		it("Should fetch the MMR for a given user", async () => {
			const ladder = new NTBBLadder('gen5randombattle');
			const p1 = NTBBLadder.getUserData('shera');
			const p2 = NTBBLadder.getUserData('catra');
			for (const player of [p1, p2]) {
				await tables.ladder.deleteAll(
					'userid = ? AND formatid = ?',
					[player.id, ladder.formatid]
				);
			}
			await ladder.updateRating(p1, p2, 1);
			const {result} = await utils.testDispatcher({
				act: 'mmr',
				format: 'gen5randombattle',
				user: 'shera',
				serverid: 'showdown',
				servertoken: server.token,
			});

			assert.strictEqual(p1.rating.elo, result, `Expected elo ${p1.rating.elo}, got ${result}`);
		});
	});
});
