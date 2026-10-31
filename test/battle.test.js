const assert = require('assert').strict;
const {describe, it} = require('node:test');

window = global;

require('../play.pokemonshowdown.com/js/battle-dex-data.js');
require('../play.pokemonshowdown.com/js/battle-dex.js');
require('../play.pokemonshowdown.com/js/battle-scene-stub.js');
// global.BattleText = require('../play.pokemonshowdown.com/data/text/en.js').BattleText;
require('../play.pokemonshowdown.com/js/battle-text-parser.js');
require('../play.pokemonshowdown.com/js/battle.js');

describe('Battle', () => {

	it('clears the disguise\'s displayed type when Illusion ends', () => {
		const battle = new Battle({debug: true, log: [
			'|gen|9',
			'|start',
			'|switch|p1a: Hydrapple|Hydrapple, L83, M|312/312',
			'|turn|11',
			'|-terastallize|p1a: Hydrapple|Steel',
			'|switch|p1a: Hawlucha|Hawlucha, L78, M|256/256',
			'|turn|20',
			'|faint|p1a: Hawlucha',
			'|switch|p1a: Hydrapple|Hydrapple, L83, M|235/235',
			'|-damage|p1a: Hydrapple|206/235|[from] Stealth Rock',
			'|-start|p1a: Hydrapple|typechange|Steel|[silent]',
			'|turn|21',
		]});
		assert.deepEqual(battle.p1.active[0].getTypeList(), ['Steel']);
		battle.addBatch([
			'|-damage|p1a: Hydrapple|134/235',
			'|replace|p1a: Zoroark|Zoroark, L83, M',
			'|-end|p1a: Zoroark|Illusion',
		]);
		const zoroark = battle.p1.active[0];
		assert.equal(zoroark.speciesForme, 'Zoroark');
		assert.equal(zoroark.volatiles.typechange, undefined);
		assert.equal(zoroark.terastallized, '');
		assert.equal(zoroark.teraType, '');
		assert.equal(battle.p1.pokemon[0].terastallized, 'Steel');
	});

	it('preserves a move-induced type change when Illusion ends', () => {
		const battle = new Battle({debug: true, log: [
			'|gen|9',
			'|start',
			'|switch|p1a: Hydrapple|Hydrapple, L83, M|235/235',
			'|-start|p1a: Hydrapple|typechange|Steel|[silent]',
			'|-start|p1a: Hydrapple|typechange|Water|[from] move: Soak',
			'|replace|p1a: Zoroark|Zoroark, L83, M',
			'|-end|p1a: Zoroark|Illusion',
		]});
		assert.deepEqual(battle.p1.active[0].getTypeList(), ['Water']);
	});

	it('preserves actual Terastallization when Illusion ends', () => {
		const battle = new Battle({debug: true, log: [
			'|gen|9',
			'|start',
			'|switch|p1a: Hydrapple|Hydrapple, L83, M|235/235',
			'|-terastallize|p1a: Hydrapple|Ghost',
			'|replace|p1a: Zoroark|Zoroark, L83, M',
			'|-end|p1a: Zoroark|Illusion',
		]});
		const zoroark = battle.p1.active[0];
		assert.equal(zoroark.terastallized, 'Ghost');
		assert.equal(zoroark.teraType, 'Ghost');
		assert.deepEqual(zoroark.getTypeList(), ['Ghost']);
	});

	it('preserves chat scrollback when changing viewpoint before catching up', () => {
		const battle = new Battle({paused: true, debug: true});
		const messages = [];
		const pendingMessages = [];
		battle.scene.log.add = (args, kwargs, preempt) => {
			if (args[0] === 'c') (preempt ? pendingMessages : messages).push(args[2]);
		};
		battle.scene.reset = () => {
			messages.length = 0;
			pendingMessages.length = 0;
		};
		battle.scene.preemptCatchup = () => {
			if (pendingMessages.length) messages.push(pendingMessages.shift());
		};
		battle.addBatch([
			'|start',
			'|turn|1',
			'|c| Player|Earlier message',
			'|turn|2',
			'|c| Player|Latest message',
		]);
		assert.equal(battle.turn, 0);
		assert.deepEqual(pendingMessages, ['Earlier message', 'Latest message']);

		battle.setViewpoint('p2');
		battle.seekTurn(Infinity);
		assert.equal(battle.turn, 2);
		assert.deepEqual(messages, ['Earlier message', 'Latest message']);
		assert.deepEqual(pendingMessages, []);

		battle.addBatch(['|c| Player|New message']);
		assert.deepEqual(pendingMessages, ['New message']);
		battle.play();
		assert.deepEqual(messages, ['Earlier message', 'Latest message', 'New message']);
		assert.deepEqual(pendingMessages, []);
	});

	it('should process a bunch of messages properly', () => {
		let battle = new Battle({
			debug: true,
			log: [
				"|init|battle",
				"|title|FOO vs. BAR",
				"|j|FOO",
				"|j|BAR",
				"|request|",
				"|player|p1|FOO|169",
				"|player|p2|BAR|265",
				"|teamsize|p1|6",
				"|teamsize|p2|6",
				"|gametype|singles",
				"|gen|7",
				"|tier|[Gen 7] Random Battle",
				"|rated|",
				"|seed|",
				"|rule|Sleep Clause Mod: Limit one foe put to sleep",
				"|rule|HP Percentage Mod: HP is shown in percentages",
				"|",
				"|start",
				"|switch|p1a: Leafeon|Leafeon, L83, F|100/100",
				"|switch|p2a: Gliscor|Gliscor, L77, F|242/242",
				"|turn|1",
			],
		});

		let p1 = battle.sides[0];
		let p2 = battle.sides[1];

		assert(p1.name === 'FOO');
		let p1leafeon = p1.pokemon[0];
		assert(p1leafeon.ident === 'p1: Leafeon');
		assert(p1leafeon.details === 'Leafeon, L83, F');
		assert(p1leafeon.hp === 100);
		assert(p1leafeon.maxhp === 100);
		assert(p1leafeon.isActive());
		assert.deepEqual(p1leafeon.moveTrack, []);

		assert(p2.name === 'BAR');
		let p2gliscor = p2.pokemon[0];
		assert(p2gliscor.ident === 'p2: Gliscor');
		assert(p2gliscor.details === 'Gliscor, L77, F');
		assert(p2gliscor.hp === 242);
		assert(p2gliscor.maxhp === 242);
		assert(p2gliscor.isActive());
		assert.deepEqual(p2gliscor.moveTrack, []);

		for (const line of [
			"|",
			"|switch|p2a: Kyurem|Kyurem-White, L73|303/303",
			"|-ability|p2a: Kyurem|Turboblaze",
			"|move|p1a: Leafeon|Knock Off|p2a: Kyurem",
			"|-damage|p2a: Kyurem|226/303",
			"|-enditem|p2a: Kyurem|Leftovers|[from] move: Knock Off|[of] p1a: Leafeon",
			"|",
			"|upkeep",
			"|turn|2",
			"|inactive|Time left: 150 sec this turn | 740 sec total",
		]) {
			battle.add(line);
		}

		assert(!p2gliscor.isActive());
		let p2kyurem = p2.pokemon[1];
		assert(p2kyurem.ident === 'p2: Kyurem');
		assert(p2kyurem.details === 'Kyurem-White, L73');
		assert(p2kyurem.hp === 226);
		assert(p2kyurem.maxhp === 303);
		assert(p2kyurem.isActive());
		assert(p2kyurem.item === '');
		assert(p2kyurem.prevItem === 'Leftovers');

		assert.deepEqual(p1leafeon.moveTrack, [['Knock Off', 1]]);
	});
});

describe('Text parser', () => {
	it.skip('should process messages correctly', () => {
		let parser = new BattleTextParser();

		assert.equal(parser.extractMessage(`|-activate|p2a: Cool.|move: Skill Swap|Speed Boost|Cute Charm|[of] p1a: Speedy`), `[The opposing Cool.'s Speed Boost]
[Speedy's Cute Charm]
  The opposing Cool. swapped Abilities with its target!
`);
		assert.equal(parser.extractMessage(`|-activate|p2a: Cool.|move: Skill Swap|p1a: Speedy|[ability]Speed Boost|[ability2]Cute Charm`), `[The opposing Cool.'s Speed Boost]
[Speedy's Cute Charm]
  The opposing Cool. swapped Abilities with its target!
`);
		assert.equal(parser.extractMessage(`|move|p2a: Palkia|Swagger|p1a: Shroomish
|-boost|p1a: Shroomish|atk|2
|-start|p1a: Shroomish|confusion
|-activate|p1a: Shroomish|confusion
|move|p1a: Shroomish|Power-Up Punch|p2a: Palkia
`), `
The opposing Palkia used **Swagger**!
  Shroomish's Attack rose sharply!
  Shroomish became confused!

  Shroomish is confused!
Shroomish used **Power-Up Punch**!
`);
	});
});
