/*
* Tests for replays.ts.
* @author Annika
*/
import { Replays } from '../replays';
import { replays } from '../tables';
import { strict as assert } from 'assert';
// import * as utils from './test-utils';
// import {md5, stripNonAscii} from '../utils';

(describe.skip)('Replay database manipulation', () => {
	// it('should properly prepare replays', async () => {
	// 	const inputlog = [
	// 		'>version 3eeccb002ecc608fb66c25b6abb3ef87f667f8b6',
	// 		'>version-origin a5d3aaee353a60c91076162238b2a6d09c284165',
	// 		'>start {"formatid":"gen8randombattle","seed":[1,1,1,1],"rated":"Rated battle"}',
	// 		'>player p1 {"name":"Annika","avatar":"1","rating":1000,"seed":[2,3,4,5]}',
	// 		'>player p2 {"name":"Heart of Etheria","avatar":"1","rating":1069,"seed":[4,5,6,7]}',
	// 	].join('\n');
	// 	const loghash = md5(inputlog);
	// 	await Replays.prep({
	// 		p1: 'annika', p2: 'heartofetheria', id: 'gen8randombattle-42', rating: '1000',
	// 		format: 'gen8randombattle', hidden: true, loghash, serverid: 'showdown', inputlog,
	// 	});

	// 	const currentUnixTime = Math.floor(Date.now() / 1000);
	// 	const dbResult = await replayPrep.selectOne()`WHERE p1 = ${'annika'} AND p2 = ${'heartofetheria'}`;
	// 	assert(dbResult, 'database entry should exist');

	// 	assert.equal(dbResult.id, 'gen8randombattle-42');
	// 	assert.equal(dbResult.format, 'gen8randombattle');
	// 	assert.equal(dbResult.loghash, loghash);
	// 	assert.equal(dbResult.uploadtime, currentUnixTime);
	// 	assert.equal(dbResult.rating, 1000);
	// 	assert.equal(dbResult.inputlog, inputlog);
	// });

	it('should increment views upon get()ing a replay', async () => {
		await replays.insert({
			id: 'gettest',
			views: 1,
			players: 'annika,annikatesting',
			format: 'gen8ou',
		});
		const replay = await Replays.get('gettest');
		assert(replay);
		assert.equal(replay.views, 2);
	});

	it('should support editing replays', async () => {
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

	// it('should properly upload replays', async () => {
	// 	const context = utils.makeDispatcher({act: ''});
	// 	/* eslint-disable max-len */
	// 	const inputlog = [
	// 		'>version 3643e94ff7b9b025f98fb947cfe103546db62c03',
	// 		'>version-origin 222745920a04435f2585483b5f119227c147005a',
	// 		'>start {"formatid":"gen8randombattle","seed":[10795,22527,59340,715],"rated":"Rated battle"}", ">player p1 {"name":"mia is testing 2","avatar":"2","rating":1000,"seed":[61291,35585,26582,55949]}',
	// 		'>player p2 {"name":"Mia","avatar":"miapi.png","rating":1000,"seed":[31770,27174,44195,58706]}',
	// 	].join('\n');
	// 	/* eslint-enable */
	// 	const log = `|j|☆mia is testing 2
	// 			|j|☆Mia
	// 			|t:|1633454094
	// 			|gametype|singles
	// 			|player|p1|mia is testing 2|2|1000
	// 			|player|p2|Mia|miapi.png|1000
	// 			|teamsize|p1|6
	// 			|teamsize|p2|6
	// 			|gen|8
	// 			|tier|[Gen 8] Random Battle
	// 			|rated|
	// 			|rule|Species Clause: Limit one of each Pokémon
	// 			|rule|HP Percentage Mod: HP is shown in percentages
	// 			|rule|Sleep Clause Mod: Limit one foe put to sleep
	// 			|
	// 			|t:|1633454094
	// 			|start
	// 			|switch|p1a: Tyrantrum|Tyrantrum, L82, M|269/269
	// 			|switch|p2a: Polteageist|Polteageist, L78|222/222
	// 			|turn|1
	// 			`;
	// 	const loghash = md5(stripNonAscii(log));
	// 	const toPrep = {
	// 		p1: 'Annika', p2: 'Heart of Etheria',
	// 		id: 'uploadtest', rating: '1000',
	// 		format: '[Gen 8] Random Battle', hidden: true,
	// 		loghash, serverid: 'showdown', inputlog,
	// 	};
	// 	await Replays.prep(toPrep);
	// 	const replay: {[k: string]: string} = {
	// 		id: 'uploadtest',
	// 		password: 'hunter2',
	// 		p1: 'Annika', p2: 'Heart of Etheria',
	// 		format: toPrep.format,
	// 		log,
	// 	};

	// 	const result = await Replays.upload(replay, context);
	// 	assert(result.startsWith('success:'));

	// 	const fetchedReplay = await Replays.get('uploadtest');
	// 	assert(fetchedReplay);
	// 	for (const k in replay) {
	// 		assert.equal(
	// 			fetchedReplay[k as keyof ReplayRow],
	// 			replay[k as keyof ReplayRow]
	// 		);
	// 	}

	// 	assert.equal(fetchedReplay['p1id'], 'annika');
	// 	assert.equal(fetchedReplay['p2id'], 'heartofetheria');
	// 	assert.equal(fetchedReplay['formatid'], 'gen8randombattle');
	// 	assert.equal(fetchedReplay['private'], 1);
	// 	assert.equal(fetchedReplay['rating'], 1000);
	// 	assert.equal(fetchedReplay['log'], replay.log);
	// 	assert.equal(fetchedReplay['inputlog'], inputlog);
	// });

	describe('searching replays', () => {
		async function search(args: any) {
			const res = await Replays.search(args);
			return res
				.map(r => r.id)
				.filter(id => id.startsWith('searchtest'));
		}

		before(async () => {
			await replays.insert({
				id: 'searchtest1', private: 1, views: 1, players: 'somerandomreg,annikaskywalker',
				rating: 1000, format: 'gen8randombattle', uploadtime: 1,
			});
			await replays.insert({
				id: 'searchtest2', private: 1, views: 1, players: 'annika,somerandomreg',
				rating: 1100, format: 'gen8randombattle', uploadtime: 2,
			});
			await replays.insert({
				id: 'searchtest3', private: 1, views: 1, players: 'annika,somerandomreg',
				rating: 1100, format: 'gen8ou', uploadtime: 3,
			});
			await replays.insert({
				id: 'searchtest4', private: 0, views: 1, players: 'heartofetheria,somerandomreg',
				rating: 1200, format: 'gen8ou', uploadtime: 4,
			});
			await replays.insert({
				id: 'searchtest5', private: 0, views: 1, players: 'heartofetheria,annikaskywalker',
				rating: 1500, format: 'gen8anythinggoes', uploadtime: 5,
				log: 'the quick brown fox jumped over the lazy dog',
			});
			await replays.insert({
				id: 'searchtest6', private: 0, views: 1, players: 'heartofetheria,annikaskywalker',
				rating: 1300, format: 'gen8anythinggoes', uploadtime: 6,
				log: 'yxmördaren Julia Blomqvist på fäktning i Schweiz',
			});
		});

		it('should support searching for replays by privacy', async () => {
			const results = await search({ isPrivate: true });
			assert.deepEqual(results, ['searchtest1', 'searchtest2', 'searchtest3']);
		});

		it('should support searching for replays by format', async () => {
			const results = await search({ format: 'gen8ou' });
			assert.deepEqual(results, ['searchtest3', 'searchtest4']);
		});

		it('should support searching for replays by username', async () => {
			const oneName = await search({ username: 'somerandomreg' });
			assert.deepEqual(oneName, ['searchtest1', 'searchtest2', 'searchtest3', 'searchtest4']);

			const twoNames = await search({ username: 'somerandomreg', username2: 'annikaskywalker' });
			assert.deepEqual(twoNames, ['searchtest1']);

			const reversed = await search({ username: 'annikaskywalker', username2: 'somerandomreg' });
			assert.deepEqual(twoNames, reversed);
		});

		it('should support multple search parameters at once', async () => {
			const results = await search({
				username: 'somerandomreg', username2: 'annika', isPrivate: true, format: 'gen8randombattle',
			});
			assert.deepEqual(results, ['searchtest2']);
		});

		it('should support different orderings', async () => {
			const rating = await search({ format: 'gen8anythinggoes', byRating: true });
			assert.deepEqual(rating, ['searchtest6', 'searchtest5']);

			const uploadtime = await search({ format: 'gen8anythinggoes' });
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
