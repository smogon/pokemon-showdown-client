/*
* Tests for replays.ts.
* @author Annika
*/
import {Config} from '../config-loader';
import {Replays, md5} from '../replays';
import {prepreplays, replays} from '../tables';
import {strict as assert} from 'assert';
import * as utils from './test-utils';

(Config.testdb ? describe : describe.skip)("Replay database manipulation", () => {
		it('should properly prepare replays', async () => {
				const inputlog = [
						`>version 3eeccb002ecc608fb66c25b6abb3ef87f667f8b6`,
						`>version-origin a5d3aaee353a60c91076162238b2a6d09c284165`,
						`>start {"formatid":"gen8randombattle","seed":[1,1,1,1],"rated":"Rated battle"}`,
						`>player p1 {"name":"Annika","avatar":"1","rating":1000,"seed":[2,3,4,5]}`,
						`>player p2 {"name":"Heart of Etheria","avatar":"1","rating":1069,"seed":[4,5,6,7]}`,
				].join('\n');
				const loghash = md5(inputlog);
				await Replays.prep({
						p1: 'annika', p2: 'heartofetheria', id: 'gen8randombattle-42', rating: '1000',
						format: 'gen8randombattle', hidden: true, loghash, serverid: 'showdown', inputlog,
				});

				const currentUnixTime = Math.floor(Date.now() / 1000);
				const dbResult = await prepreplays.selectOne('*', 'p1 = ? AND p2 = ?', ['annika', 'heartofetheria']);
				assert(dbResult, `database entry should exist`);

				assert.equal(dbResult.id, 'gen8randombattle-42');
				assert.equal(dbResult.format, 'gen8randombattle');
				assert.equal(dbResult.loghash, loghash);
				assert.equal(dbResult.uploadtime, currentUnixTime);
				assert.equal(dbResult.rating, 1000);
				assert.equal(dbResult.inputlog, inputlog);
		});

		it('should increment views upon get()ing a replay', async () => {
				replays.insert({id: 'gettest', views: 1, p1: 'annika', p2: 'annikatesting', format: 'gen8ou'});
				const replay = await Replays.get('gettest');
				assert.equal(replay.views, 2);
		});

		it('should support editing replays', async () => {
				replays.insert({id: 'edittest', views: 1, p1: 'annika', p2: 'annikatesting', format: 'gen8ou'});

				const original = await Replays.get('edittest');
				assert.equal(original.p1, 'annika');

				original.p1 = 'somerandomreg';
				await Replays.edit(original);

				const edited = await Replays.get('edittest');
				assert.equal(original.p1, 'somerandomreg');
		});

		it('should properly upload replays', async () => {
				const dispatcher = utils.makeDispatcher({});
				const inputlog = [
						`>version 3eeccb002ecc608fb66c25b6abb3ef87f667f8b6`,
						`>version-origin a5d3aaee353a60c91076162238b2a6d09c284165`,
						`>start {"formatid":"gen8randombattle","seed":[1,1,1,1],"rated":"Rated battle"}`,
						`>player p1 {"name":"Annika","avatar":"1","rating":1000,"seed":[2,3,4,5]}`,
						`>player p2 {"name":"Heart of Etheria","avatar":"1","rating":1069,"seed":[4,5,6,7]}`,
				].join('\n');
				const loghash = md5(inputlog);
				const toPrep = {
						p1: 'Annika', p2: 'Heart of Etheria', id: 'uploadtest', rating: '1000',
						format: 'gen8randombattle', hidden: true, loghash, serverid: 'showdown', inputlog,
				};
				const replay = {
						id: 'uploadtest',
						password: 'hunter2',
						p1: 'Annika', p2: 'Heart of Etheria',
						format: '[Gen 8] Random Battle',
				};

				const result = await Replays.upload(replay, dispatcher);
				assert(result.startsWith('success:'));

				const fetchedReplay = Replays.get('uploadtest');
				for (const [key, value] of Object.entries(replay)) {
						assert.equal(fetchedReplay[key], value);
				}

				assert.equal(fetchedReplay['p1id'], 'annika');
				assert.equal(fetchedReplay['p2id'], 'heartofetheria');
				assert.equal(fetchedReplay['fullid'], 'uploadtest-hunter2');
				assert.equal(fetchedReplay['formatid'], 'gen8randombattle');
				assert.equal(fetchedReplay['privacy'], 1);
				assert.equal(fetchedReplay['rating'], 1000);
				assert.equal(fetchedReplay['log'], inputlog);
				assert.equal(fetchedReplay['inputlog'], inputlog);
		});

		describe('searching replays', () => {
				async function search(args) {
						const search = await Replays.search(args);
						return search
								.map(r => r.id)
								.filter(id => id.startsWith('searchtest'));
				}

				before(async () => {
						replays.insert({
								id: 'searchtest1', private: 1, views: 1, p1: 'somerandomreg',
								p2: 'annikaskywalker', rating: 1000, format: 'gen8randombattle', uploadtime: 1,
						});
						replays.insert({
								id: 'searchtest2', private: 1, views: 1, p1: 'annika',
								p2: 'somerandomreg', rating: 1100, format: 'gen8randombattle', uploadtime: 2,
						});
						replays.insert({
								id: 'searchtest3', private: 1, views: 1, p1: 'annika',
								p2: 'somerandomreg', rating: 1100, format: 'gen8ou', uploadtime: 3,
						});
						replays.insert({
								id: 'searchtest4', private: 0, views: 1, p1: 'heartofetheria',
								p2: 'somerandomreg', rating: 1200, format: 'gen8ou', uploadtime: 4,
						});
						replays.insert({
								id: 'searchtest5', private: 0, views: 1, p1: 'heartofetheria',
								p2: 'annikaskywalker', rating: 1500, format: 'gen8anythinggoes', uploadtime: 5,
								log: 'the quick brown fox jumped over the lazy dog',
						});
						replays.insert({
								id: 'searchtest6', private: 0, views: 1, p1: 'heartofetheria',
								p2: 'annikaskywalker', rating: 1300, format: 'gen8anythinggoes', uploadtime: 6,
								log: 'yxmördaren Julia Blomqvist på fäktning i Schweiz',
						});
				});

				it('should support searching for replays by privacy', async () => {
						const replays = await search({isPrivate: true});
						assert.deepEqual(replays, ['searchtest1', 'searchtest2', 'searchtest3']);
				});

				it('should support searching for replays by format', async () => {
						const replays = await search({format: 'gen8ou'});
						assert.deepEqual(replays, ['searchtest3', 'searchtest4']);
				});

				it('should support searching for replays by username', async () => {
						const oneName = await search({username: 'somerandomreg'});
						assert.deepEqual(oneName, ['searchtest1', 'searchtest2', 'searchtest3', 'searchtest4']);

						const twoNames = await search({username: 'somerandomreg', username2: 'annikaskywalker'});
						assert.deepEqual(twoNames, ['searchtest1']);

						const reversed = await search({username: 'annikaskywalker', username2: 'somerandomreg'});
						assert.deepEqual(twoNames, reversed);
				});

				it('should support multple search parameters at once', async () => {
						const replays = await search({
								username: 'somerandomreg', username2: 'annika', isPrivate: true, format: 'gen8randombattle',
						});
						assert.deepEqual(replays, ['searchtest2']);
				});

				it('should support different orderings', async () => {
						const rating = await search({format: 'gen8anythinggoes', byRating: true});
						assert.deepEqual(rating, ['searchtest6', 'searchtest5']);

						const uploadtime = await search({format: 'gen8anythinggoes'});
						assert.deepEqual(uploadtime, ['searchtest5', 'searchtest6']);
				});

				it('should support searching the log', async () => {
						const english = await Replays.fullSearch('over,fox');
						assert.equal(english[0].id, 'searchtest5');

						const swedish = await Replays.fullSearch('på,yxmördaren');
						assert.equal(swedish[0].id, 'searchtest6');
				});
		});
});

describe('password generation', () => {
		it('should generate 31-character passwords or the specified length', () => {
				assert.equal(Replays.generatePassword().length, 31);
				assert.equal(Replays.generatePassword(64).length, 64);
				assert.equal(Replays.generatePassword(0).length, 0);
		});
});
