const assert = require('assert').strict;
const {describe, it} = require('node:test');
const fs = require('fs');
const path = require('path');

const englishTextPath = path.resolve(__dirname, '../play.pokemonshowdown.com/data/text/en.js');
const afdTextPath = path.resolve(__dirname, '../play.pokemonshowdown.com/data/text/en-afd.js');
const hasBuiltText = fs.existsSync(englishTextPath) && fs.existsSync(afdTextPath);

let BattleTextParser;
if (hasBuiltText) {
	global.window = global;
	global.BattleText = require(englishTextPath).BattleText;
	global.BattleText['en-afd'] = require(afdTextPath).BattleText['en-afd'];
	global.BattleText.en.Default.default.hitCount =
		"  The Pok\u00E9mon was hit [NUMBER] [INFLECT:NUMBER:s=time:p=times]!";
	global.BattleText.en.Default.unboost.fail =
		"  [POKEMON]'s [STAT] [INFLECT:STAT:s=was:p=were] not lowered!";

	require('../play.pokemonshowdown.com/js/battle-dex-data.js');
	require('../play.pokemonshowdown.com/js/battle-dex.js');
	require('../play.pokemonshowdown.com/js/battle-text-parser.js');
	BattleTextParser = global.BattleTextParser;
}

describe('BattleTextParser', {skip: hasBuiltText ? false : 'text data has not been built'}, () => {
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

	it('applies placeholder modifiers after substitution', () => {
		global.BattleText.fr = {Default: {default: {
			faint: "[POKEMON] voit le clone [POKEMON:de] disparaître !",
		}}};
		const parser = new BattleTextParser('p1', 'fr');
		assert.equal(parser.extractMessage('|faint|p1a: Mew'), 'Mew voit le clone de Mew disparaître !\n');
		assert.equal(parser.extractMessage('|faint|p1a: Eevee'), 'Eevee voit le clone d’Eevee disparaître !\n');
	});

	it('renders repeated placeholders with distinct values and literal dollar signs', () => {
		const original = global.BattleText.en.Default.default.startBattle;
		global.BattleText.en.Default.default.startBattle = '[TRAINER] vs. [TRAINER]... start!';
		const parser = new BattleTextParser();
		assert.equal(parser.extractMessage('|player|p1|Alice$1'), '');
		assert.equal(parser.extractMessage('|player|p2|Bob$2'), '');
		assert.equal(parser.extractMessage('|start'), 'Alice$1 vs. Bob$2... start!\n');
		global.BattleText.en.Default.default.startBattle = original;
	});

	it('applies Korean placeholder particles', () => {
		global.BattleText.ko = {Default: {default: {
			faint: '[POKEMON:topic] 쓰러졌다!',
		}}};
		const parser = new BattleTextParser('p1', 'ko');
		assert.equal(parser.extractMessage('|faint|p1a: 뮤'), '뮤는 쓰러졌다!\n');
		assert.equal(parser.extractMessage('|faint|p1a: 팬텀'), '팬텀은 쓰러졌다!\n');
	});

	it('applies articles, contractions, and capitalization', () => {
		assert.equal(BattleTextParser.modify('Baie Oran', ['indefinite'], 'fr', 'fs'), 'une Baie Oran');
		assert.equal(BattleTextParser.modify('Angriff', ['definite', 'accusative'], 'de'), 'den Angriff');
		assert.equal(BattleTextParser.modify('avversario', ['a', 'definite'], 'it'), "all’avversario");
		assert.equal(BattleTextParser.modify('equipo', ['capitalize'], 'es'), 'Equipo');
		assert.equal(
			BattleTextParser.modify('Agua Mística', ['definite'], 'es', 'fu', 'stressed-a'),
			'el Agua Mística'
		);
		assert.equal(
			BattleTextParser.modify('Aguas Místicas', ['definite'], 'es', 'fp', 'stressed-a'),
			'las Aguas Místicas'
		);
	});

	it('uses localized grammar and classified item forms', () => {
		global.BattleText.fr = {
			Default: {default: {
				addItem: '[POKEMON] obtient [ITEM:indefinite:classified] !',
				useGem: '[ITEM:definite:capitalize:classified] agi[INFLECT:ITEM:s=t:p=ssent] !',
			}},
			Items: {brightpowder: {
				name: 'Poudre Claire', grammar: 'fu',
				classified: {name: 'sac de Poudre Claire', grammar: 'ms'},
			}},
		};
		const parser = new BattleTextParser('p1', 'fr');
		assert.equal(
			parser.extractMessage('|-item|p1a: Mew|Bright Powder|[from] move: Not Real'),
			'Mew obtient un sac de Poudre Claire !\n'
		);
		assert.equal(
			parser.extractMessage('|-enditem|p1a: Mew|Bright Powder|[from] gem|[move] Tackle'),
			'Le sac de Poudre Claire agit !\n'
		);
	});

	it('uses localized article rules', () => {
		global.BattleText.es = {
			Default: {default: {activateItem: '[ITEM:definite:capitalize] actúa!'}},
			Items: {mysticwater: {
				name: 'Agua Mística', grammar: 'fu', articleRule: 'stressed-a',
			}},
		};
		const parser = new BattleTextParser('p1', 'es');
		assert.equal(
			parser.extractMessage('|-enditem|p1a: Mew|Mystic Water'),
			'El Agua Mística actúa!\n'
		);
	});

	it('uses localized stat grammar', () => {
		global.BattleText.fr = {Default: {
			default: {boost: '[STAT:definite:capitalize] de [POKEMON] augmente !'},
			atk: {statName: 'Attaque', grammar: 'fs'},
		}};
		const parser = new BattleTextParser('p1', 'fr');
		assert.equal(parser.extractMessage('|-boost|p1a: Mew|atk|1'), 'L’Attaque de Mew augmente !\n');
	});
});
