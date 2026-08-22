const assert = require('assert').strict;
const {describe, it} = require('node:test');

global.window = global;
global.BattleText = require('../play.pokemonshowdown.com/data/text/en.js').BattleText;
global.BattleText['en-afd'] =
	require('../play.pokemonshowdown.com/data/text/en-afd.js').BattleText['en-afd'];
global.BattleText.en.Default.default.hitCount =
	"  The Pok\u00E9mon was hit [NUMBER] [INFLECT:NUMBER:s=time:p=times]!";
global.BattleText.en.Default.unboost.fail =
	"  [POKEMON]'s [STAT] [INFLECT:STAT:s=was:p=were] not lowered!";

require('../play.pokemonshowdown.com/js/battle-dex-data.js');
require('../play.pokemonshowdown.com/js/battle-dex.js');
require('../play.pokemonshowdown.com/js/battle-text-parser.js');

const BattleTextParser = global.BattleTextParser;

describe('BattleTextParser', () => {
	it('uses en-afd as a sparse English overlay', () => {
		global.Dex.afdMode = true;
		const parser = new BattleTextParser();
		assert.equal(parser.extractMessage('|-hitcount|p1a: Mew|3'), '  Hit 3 times!\n');
		global.Dex.afdMode = false;
	});

	it('uses canonical language tables with English field fallback', () => {
		global.BattleText.ja = {
			Default: {default: {hitCount: '[NUMBER]回 当たった！'}},
			Pokedex: {ironleaves: {name: 'テツノイサハ'}},
			Moves: {knockoff: {name: 'はたきおとす'}},
			Abilities: {levitate: {name: 'ふゆう'}},
			Items: {lifeorb: {name: 'いのちのたま'}},
		};
		const parser = new BattleTextParser('p1', 'ja');
		assert.equal(parser.extractMessage('|-hitcount|p1a: Mew|3'), '3回 当たった！\n');
		assert.equal(parser.pokemon('p1a: Mew'), 'Mew');
	});

	it('translates effect and species names without translating nicknames', () => {
		const parser = new BattleTextParser('p1', 'ja');
		assert.equal(parser.moveName('Knock Off'), 'はたきおとす');
		assert.equal(parser.itemName('Life Orb'), 'いのちのたま');
		assert.equal(parser.abilityName('Levitate'), 'ふゆう');
		assert.deepEqual(
			parser.pokemonFull('p1a: Salad', 'Iron Leaves'),
			['p1', 'Salad (**テツノイサハ**)']
		);
		assert.deepEqual(
			parser.pokemonFull('p1a: Iron Leaves', 'Iron Leaves'),
			['p1', 'Iron Leaves (**テツノイサハ**)']
		);
		assert.deepEqual(parser.pokemonFull('p1a: テツノイサハ', 'Iron Leaves'), ['p1', '**テツノイサハ**']);
	});

	it('falls back by field for past-generation text', () => {
		global.BattleText.en.Moves.testmove = {start: 'modern', gen4: {start: 'old'}};
		global.BattleText.ja.Moves.testmove = {start: '現代'};
		const parser = new BattleTextParser('p1', 'ja');
		parser.gen = 4;
		assert.equal(parser.template('start', 'move: Test Move'), 'old\n');
	});

	it('Dex.text.get returns localized entries with English fallback', () => {
		global.BattleText.en.Moves.testmove = {name: 'Test Move', desc: 'English description'};
		global.BattleText.ja.Moves.testmove = {name: 'テスト技'};
		const move = new global.Dex.Move('testmove', 'Test Move', {});
		assert.deepEqual(global.Dex.text.get(move, 'ja'), {
			name: 'テスト技', desc: 'English description',
		});
	});

	it('selects and unescapes INFLECT values', () => {
		const template = String.raw`[INFLECT:ITEM:s=one:p=two\:three\=four\]five\\six]`;
		assert.equal(BattleTextParser.inflect(template, {ITEM: 's'}), 'one');
		assert.equal(BattleTextParser.inflect(template, {ITEM: 'p'}), 'two:three=four]five\\six');
	});

	it('leaves unresolved INFLECT expressions visible', () => {
		const template = '[INFLECT:ITEM:s=one:p=many]';
		assert.equal(BattleTextParser.inflect(template, {}), template);
		assert.equal(BattleTextParser.inflect(template, {ITEM: 'z'}), template);
	});

	it('inflects hit counts', () => {
		const parser = new BattleTextParser();
		assert.equal(parser.extractMessage('|-hitcount|p1a: Mew|1'), '  The Pok\u00E9mon was hit 1 time!\n');
		assert.equal(parser.extractMessage('|-hitcount|p1a: Mew|3'), '  The Pok\u00E9mon was hit 3 times!\n');
	});

	it('lets translations place the percentage symbol', () => {
		global.BattleText.en.Default.default.damagePercentage =
			'  ([POKEMON] lost [PERCENTAGE]% of its health!)';
		const parser = new BattleTextParser();
		assert.equal(
			parser.extractMessage('|-damage|p1a: Mew|58/100|42%'),
			'  (Mew lost 42% of its health!)\n'
		);
		assert.equal(parser.extractMessage('|-damage|p1a: Mew|58/100'), '  (Mew was hurt!)\n');
	});

	it('inflects single-stat and all-stat failures', () => {
		const parser = new BattleTextParser();
		assert.equal(parser.extractMessage('|-fail|p1a: Mew|unboost|atk'), "  Mew's Attack was not lowered!\n");
		assert.equal(parser.extractMessage('|-fail|p1a: Mew|unboost'), "  Mew's stats were not lowered!\n");
	});
});
