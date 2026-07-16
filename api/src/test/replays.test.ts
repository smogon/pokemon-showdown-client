/**
 * Tests for replays.
 */
import { strict as assert } from 'node:assert';
import { suite, test } from 'node:test';

import { Replays } from '../replays';
import { replays } from '../tables';

void suite('Replay database manipulation', () => {
	// prepreplay no longer exists
	// void test('should properly prepare replays', async () => {
	// 	const inputlog = [
	// 		'>version 3eeccb002ecc608fb66c25b6abb3ef87f667f8b6',
	// 		'>version-origin a5d3aaee353a60c91076162238b2a6d09c284165',
	// 		'>start {"formatid":"gen8randombattle","seed":[1,1,1,1],"rated":"Rated battle"}',
	// 		'>player p1 {"name":"Annika","avatar":"1","rating":1000,"seed":[2,3,4,5]}',
	// 		'>player p2 {"name":"Heart of Etheria","avatar":"1","rating":1069,"seed":[4,5,6,7]}',
	// 	].join('\n');
	// 	const loghash = md5(inputlog);
	// 	await (Replays as any).prep({
	// 		p1: 'annika', p2: 'heartofetheria', id: 'gen8randombattle-42', rating: '1000',
	// 		format: 'gen8randombattle', hidden: true, loghash, serverid: 'showdown', inputlog,
	// 	});

	// 	const currentUnixTime = Math.floor(Date.now() / 1000);
	// 	const databaseResult = await replayPrep.get('gen8randombattle-42');
	// 	assert(databaseResult, 'database entry should exist');
	// 	assert.equal(databaseResult.id, 'gen8randombattle-42');
	// 	assert.equal(databaseResult.format, 'gen8randombattle');
	// 	assert.equal(databaseResult.loghash, loghash);
	// 	assert.equal(databaseResult.uploadtime, currentUnixTime);
	// 	assert.equal(databaseResult.rating, 1000);
	// 	assert.equal(databaseResult.inputlog, inputlog);
	// });

	void test('should increment views upon get()ing a replay', async () => {
		await replays.insert({
			id: 'gettest',
			views: 1,
			players: 'annika,annikatesting',
			format: 'gen8ou',
		});
		let replay = await Replays.get('gettest', true);
		replay = await Replays.get('gettest');
		assert(replay);
		assert.equal(replay.views, 2);
	});

	void test('should support editing replays', async () => {
		await replays.insert({
			id: 'edittest',
			views: 1,
			players: 'annika,annikatesting',
			format: 'gen8ou',
		});

		const original = await Replays.get('edittest');
		assert(original);
		assert.equal(original.private, 0);

		original.private = 2;
		await Replays.edit(original);

		await Replays.get('edittest');
		assert.equal(original.private, 2);
	});

	void test('should properly upload replays', async () => {
		const inputlog = [
			'>version 3643e94ff7b9b025f98fb947cfe103546db62c03',
			'>version-origin 222745920a04435f2585483b5f119227c147005a',
			'>start {"formatid":"gen8randombattle","seed":[10795,22527,59340,715],"rated":"Rated battle"}',
			'>player p1 {"name":"Annika","avatar":"2","rating":1000,"seed":[61291,35585,26582,55949]}',
			'>player p2 {"name":"Mia","avatar":"miapi.png","rating":1000,"seed":[31770,27174,44195,58706]}',
		].join('\n');
		const log = [
			'|j|Annika',
			'|j|Mia',
			'|gametype|singles',
			'|gen|8',
			'|tier|[Gen 8] Random Battle',
			'|start',
		].join('\n');
		const result = await Replays.add({
			id: 'uploadtest',
			password: 'hunter2',
			players: ['Annika', 'Mia'],
			format: '[Gen 8] Random Battle',
			log,
			inputlog,
			uploadtime: 1,
			private: 1,
			rating: 1000,
		});
		assert.equal(result, 'uploadtest-hunter2pw');

		const fetchedReplay = await replays.get('uploadtest');
		assert(fetchedReplay);
		assert.equal(fetchedReplay.players, 'Annika,Mia');
		assert.equal(fetchedReplay.formatid, 'gen8randombattle');
		assert.equal(fetchedReplay.private, 1);
		assert.equal(fetchedReplay.rating, 1000);
		assert.equal(fetchedReplay.log, log);
		assert.equal(fetchedReplay.inputlog, inputlog);
	});

	void suite('searching replays', () => {
		async function search(args: Parameters<typeof Replays.search>[0]) {
			const results = await Replays.search(args);
			return results.map(replay => replay.id).filter(id => id.startsWith('searchtest'));
		}

		void test('should support searching for replays by privacy', async () => {
			const results = await search({ usernames: ['somerandomreg'], isPrivate: true });
			assert.deepEqual(results, ['searchtest3', 'searchtest2', 'searchtest1']);
		});

		void test('should support searching for replays by format', async () => {
			const results = await search({ format: 'gen8ou' });
			assert.deepEqual(results, ['searchtest7', 'searchtest4']);
		});

		void test('should support searching for replays by username', async () => {
			const oneName = await search({ usernames: ['somerandomreg'] });
			assert.deepEqual(oneName, ['searchtest8', 'searchtest7', 'searchtest4']);

			const twoNames = await search({ usernames: ['somerandomreg', 'annikaskywalker'] });
			assert.deepEqual(twoNames, ['searchtest8']);

			const reversed = await search({ usernames: ['annikaskywalker', 'somerandomreg'] });
			assert.deepEqual(twoNames, reversed);
		});

		void test('should support multiple search parameters at once', async () => {
			const results = await search({
				usernames: ['somerandomreg', 'annika'], isPrivate: true, format: 'gen8randombattle',
			});
			assert.deepEqual(results, ['searchtest2']);
		});

		void test('should support different orderings', async () => {
			const rating = await search({ format: 'gen8anythinggoes', byRating: true });
			assert.deepEqual(rating, ['searchtest5', 'searchtest6']);

			const uploadtime = await search({ format: 'gen8anythinggoes' });
			assert.deepEqual(uploadtime, ['searchtest6', 'searchtest5']);
		});

		void test('should support searching the log', async () => {
			const english = await Replays.fullSearch('over,fox');
			assert.equal(english[0].id, 'searchtest5');

			const swedish = await Replays.fullSearch('på,yxmördaren');
			assert.equal(swedish[0].id, 'searchtest6');
		});
	});
});

void suite('password generation', () => {
	void test('should generate 31-character passwords or the specified length', () => {
		assert.equal(Replays.generatePassword().length, 31);
		assert.equal(Replays.generatePassword(64).length, 64);
		assert.equal(Replays.generatePassword(0).length, 0);
	});
});
