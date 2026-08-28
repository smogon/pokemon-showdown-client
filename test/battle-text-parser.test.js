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
		"  The Pok\u00E9mon was hit {NUMBER} {INFLECT:NUMBER:s=time:p=times}!";
	global.BattleText.en.Default.unboost.fail =
		"  {POKEMON}'s {STAT} {INFLECT:STAT:s=was:p=were} not lowered!";

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

	it('handles a missing English text preload', async () => {
		const battleText = global.BattleText;
		const loadedEnglish = global.Dex.loadedTextData.en;
		const document = global.document;
		const config = global.Config;
		let fail = true;
		try {
			delete global.BattleText;
			global.Config = {testclient: false};
			global.document = {
				createElement() { return {}; },
				getElementsByTagName() {
					return [{appendChild(element) {
						if (fail) {
							element.onerror();
						} else {
							global.BattleText = battleText;
							element.onload();
						}
					}}];
				},
			};
			await assert.doesNotReject(global.Dex.loadTextData('en'));
			assert.equal(global.Dex.loadedTextData.en, undefined);
			fail = false;
			await global.Dex.loadTextData('en');
			assert.equal(global.TL.term, battleText.en.TermNames);
		} finally {
			global.BattleText = battleText;
			global.Dex.loadedTextData.en = loadedEnglish;
			if (document === undefined) {
				delete global.document;
			} else {
				global.document = document;
			}
			if (config === undefined) {
				delete global.Config;
			} else {
				global.Config = config;
			}
		}
	});

	it('uses canonical language tables with English field fallback', () => {
		global.BattleText.ja = {
			Default: {default: {hitCount: '{NUMBER}回 当たった！'}},
			Pokedex: {ironleaves: {name: 'テツノイサハ', baseSpecies: 'テツノイサハ'}},
			TypeNames: {fire: 'ほのお'},
			NatureNames: {adamant: 'いじっぱり'},
			TermNames: {
				egggroup: 'タマゴグループ', moves: '技', nicknamespecies: '{NICKNAME}（{SPECIES}）',
			},
			TagNames: {physical: 'ぶつり'},
			GenderNames: {female: 'メス'},
			EggGroupNames: {humanlike: 'ひとがた'},
			ColorNames: {purple: 'むらさき'},
			StatusNames: {brn: 'やけど'},
			TargetNames: {self: '自分'},
			StatNames: {atk: '攻撃'},
			StatMediumNames: {atk: 'こうげき'},
			StatShortNames: {atk: 'Ａ'},
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
		assert.equal(global.Dex.text.get(global.Dex.types.get('Fire'), 'ja').name, 'ほのお');
		assert.equal(global.Dex.text.typeName('Fire', 'ja'), 'ほのお');
		assert.equal(global.Dex.text.get(global.BattleNatures.Adamant, 'ja').name, 'いじっぱり');
		assert.equal(global.Dex.text.natureName('Adamant', 'ja'), 'いじっぱり');
		assert.equal(global.Dex.text.get(global.BattleNatures.Adamant, 'en').name, 'Adamant');
		assert.equal(global.Dex.text.natureName('Adamant', 'en'), 'Adamant');
		assert.equal(global.Dex.text.termName('Egg Group', 'ja'), 'タマゴグループ');
		assert.equal(global.Dex.text.categoryName('Physical', 'ja'), 'ぶつり');
		assert.equal(global.Dex.text.genderName('F', 'ja'), 'メス');
		assert.equal(global.Dex.text.eggGroupName('Human-Like', 'ja'), 'ひとがた');
		assert.equal(global.Dex.text.colorName('Purple', 'ja'), 'むらさき');
		assert.deepEqual(
			parser.pokemonFull('p1a: Salad', 'Iron Leaves'),
			['p1', 'Salad（**テツノイサハ**）']
		);
		assert.deepEqual(
			parser.pokemonFull('p1a: Iron Leaves', 'Iron Leaves'),
			['p1', 'Iron Leaves（**テツノイサハ**）']
		);
		assert.deepEqual(parser.pokemonFull('p1a: テツノイサハ', 'Iron Leaves'), ['p1', '**テツノイサハ**']);
		assert.equal(
			parser.extractMessage('|switch|p1a: Salad|Iron Leaves, L50|100/100'),
			'Go! Salad（**テツノイサハ**）!\n'
		);
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
		global.BattleText.ja.Moves.testmove = {name: 'テスト技', desc: null};
		global.BattleText.ja.Abilities.levitate = {name: 'ふゆう'};
		const move = new global.Dex.Move('testmove', 'Test Move', {});
		assert.deepEqual(global.Dex.text.get(move, 'ja'), {
			name: 'テスト技', desc: 'English description', shortDesc: 'English description',
		});
		const ability = new global.Dex.Ability('levitate', 'Levitate', {});
		assert.equal(global.Dex.text.get(ability, 'ja').name, 'ふゆう');
	});

	it('TL translates UI strings and effect text', () => {
		global.BattleUIText = {en: {
			'Hello {1}!': '你好，{1}！',
			Open: {verb: '打开'},
			Untranslated: null,
		}, ja: {
			'Add Pokémon': 'ポケモンを追加',
			Moves: 'UIの技',
		}};
		assert.equal(global.TL`Hello ${'Mew'}!`, '你好，Mew！');
		assert.equal(global.TL('Open', 'verb'), '打开');
		assert.equal(global.TL`Untranslated`, 'Untranslated');
		const prefs = global.Dex.prefs;
		global.Dex.prefs = () => 'japanese';
		void global.Dex.loadTextData();
		for (const [property, table] of Object.entries({
			term: 'TermNames',
			type: 'TypeNames',
			nature: 'NatureNames',
			gender: 'GenderNames',
			egggroup: 'EggGroupNames',
			tag: 'TagNames',
			color: 'ColorNames',
			status: 'StatusNames',
			target: 'TargetNames',
			stat: 'StatNames',
			statShort: 'StatShortNames',
			statMedium: 'StatMediumNames',
		})) {
			assert.equal(global.TL[property], global.BattleText.ja[table]);
		}
		assert.equal(global.TL('Moves'), 'UIの技');
		assert.equal(global.TL`Moves`, 'UIの技');
		assert.equal(global.TL.term.moves, '技');
		assert.equal(global.TL('Add Pokémon'), 'ポケモンを追加');
		assert.equal(global.TL`Add Pokémon`, 'ポケモンを追加');
		assert.equal(global.TL('Unknown term'), 'Unknown term');
		global.Dex.prefs = prefs;
		void global.Dex.loadTextData();

		global.BattleText.en.Moves.testmove = {name: 'Localized Name', start: 'modern', gen4: {start: 'old'}};
		const move = new global.Dex.Move('testmove', 'Fallback Name', {desc: 'Fallback description'});
		assert.equal(global.TL(move), 'Localized Name');

		const untranslated = new global.Dex.Ability('untranslated', 'Fallback Name', {desc: 'Fallback description'});
		assert.equal(global.TL(untranslated), 'Fallback Name');
	});

	it('rejects empty UI translations', () => {
		const {validateBattleUIText} = require('../build-tools/translations.mts');
		assert.deepEqual(validateBattleUIText({Missing: null}, 'zh-cn.ts'), {Missing: null});
		assert.throws(
			() => validateBattleUIText({Missing: ''}, 'zh-cn.ts'),
			/must use null to fall back to English/
		);
		assert.throws(
			() => validateBattleUIText({Open: {verb: ''}}, 'zh-cn.ts'),
			/must use null to fall back to English/
		);
	});

	it('selects and unescapes INFLECT values', () => {
		const template = String.raw`{INFLECT:ITEM:s=one:p=two\:three\=four\}five\\six}`;
		assert.equal(BattleTextParser.inflect(template, {ITEM: 's'}), 'one');
		assert.equal(BattleTextParser.inflect(template, {ITEM: 'p'}), 'two:three=four}five\\six');
	});

	it('leaves unresolved INFLECT expressions visible', () => {
		const template = '{INFLECT:ITEM:s=one:p=many}';
		assert.equal(BattleTextParser.inflect(template, {}), template);
		assert.equal(BattleTextParser.inflect(template, {ITEM: 'z'}), template);
	});

	it('inflects hit counts', () => {
		const parser = new BattleTextParser();
		assert.equal(parser.extractMessage('|-hitcount|p1a: Mew|1'), '  The Pok\u00E9mon was hit 1 time!\n');
		assert.equal(parser.extractMessage('|-hitcount|p1a: Mew|3'), '  The Pok\u00E9mon was hit 3 times!\n');
	});

	it('falls back to default text for namespaced effects', () => {
		const parser = new BattleTextParser('p1');
		assert.equal(
			parser.extractMessage('|-activate|p2a: Indeedee|move: Psychic Terrain'),
			'  The opposing Indeedee is protected by the Psychic Terrain!\n'
		);
		assert.equal(
			parser.extractMessage('|-activate|p2a: Pikachu|move: Electric Terrain'),
			'  The opposing Pikachu is protected by the Electric Terrain!\n'
		);
		assert.equal(
			parser.extractMessage('|-activate|p2a: Garchomp|move: Misty Terrain'),
			'  The opposing Garchomp surrounds itself with a protective mist!\n'
		);
	});

	it('lets translations place the percentage symbol', () => {
		global.BattleText.en.Default.default.damagePercentage =
			'  ({POKEMON} lost {PERCENTAGE}% of its health!)';
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
			faint: "{POKEMON} voit le clone {POKEMON:de} disparaître !",
		}}};
		const parser = new BattleTextParser('p1', 'fr');
		assert.equal(parser.extractMessage('|faint|p1a: Mew'), 'Mew voit le clone de Mew disparaître !\n');
		assert.equal(parser.extractMessage('|faint|p1a: Eevee'), 'Eevee voit le clone d’Eevee disparaître !\n');
	});

	it('renders numbered trainer placeholders and literal dollar signs', () => {
		const original = global.BattleText.en.Default.default.startBattle;
		global.BattleText.en.Default.default.startBattle = '{TRAINER2} vs. {TRAINER1}... start!';
		const parser = new BattleTextParser();
		assert.equal(parser.extractMessage('|player|p1|Alice$1'), '');
		assert.equal(parser.extractMessage('|player|p2|Bob$2'), '');
		assert.equal(parser.extractMessage('|start'), 'Bob$2 vs. Alice$1... start!\n');
		global.BattleText.en.Default.default.startBattle = original;
	});

	it('applies Korean placeholder particles', () => {
		global.BattleText.ko = {Default: {default: {
			faint: '{POKEMON:topic} 쓰러졌다!',
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
				addItem: '{POKEMON} obtient {ITEM:indefinite:classified} !',
				useGem: '{ITEM:definite:capitalize:classified} agi{INFLECT:ITEM:s=t:p=ssent} !',
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
			Default: {default: {activateItem: '{ITEM:definite:capitalize} actúa!'}},
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
		global.BattleText.fr = {
			Default: {default: {boost: '{STAT:definite:capitalize} de {POKEMON} augmente !'}},
			TermNames: {stats: 'Stats'},
			StatNames: {stats: 'stats', 'stats:grammar': 'fp', atk: 'Attaque', 'atk:grammar': 'fs'},
			StatMediumNames: {atk: 'Atq.'},
			StatShortNames: {atk: 'Atq'},
		};
		const parser = new BattleTextParser('p1', 'fr');
		assert.equal(BattleTextParser.stat('atk', 'fr'), 'Attaque');
		assert.equal(BattleTextParser.stat('', 'fr'), 'stats');
		assert.equal(BattleTextParser.statMediumName('atk', 'fr'), 'Atq.');
		assert.equal(BattleTextParser.statShortName('atk', 'fr'), 'Atq');
		assert.equal(parser.extractMessage('|-boost|p1a: Mew|atk|1'), 'L’Attaque de Mew augmente !\n');
	});
});
