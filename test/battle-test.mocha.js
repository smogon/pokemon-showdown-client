const fs = require('fs');
const path = require('path');
const assert = require('assert').strict;

process.chdir(path.resolve(__dirname, '..'));

window = global;

// Without making these modules, the best we can do is directly include them into this workspace.
eval('' + fs.readFileSync(`js/battle-scene-stub.js`));
eval('' + fs.readFileSync(`js/battle-dex.js`));
eval('' + fs.readFileSync(`js/battle-dex-data.js`));
eval('' + fs.readFileSync(`js/battle.js`));

describe('Battle', function () {

	it('should instantiate without issue', function () {
		var battle = new Battle();
	});

	it('should process a bunch of messages properly', function () {
		var battle = new Battle();
		battle.debug = true;

		battle.setQueue([
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
		]);
		battle.fastForwardTo(-1);

		var p1 = battle.sides[0];
		var p2 = battle.sides[1];

		assert(p1.name === 'FOO');
		var p1leafeon = p1.pokemon[0];
		assert(p1leafeon.ident === 'p1: Leafeon');
		assert(p1leafeon.details === 'Leafeon, L83, F');
		assert(p1leafeon.hp === 100);
		assert(p1leafeon.maxhp === 100);
		assert(p1leafeon.isActive());
		assert.deepEqual(p1leafeon.moveTrack, []);

		assert(p2.name === 'BAR');
		var p2gliscor = p2.pokemon[0];
		assert(p2gliscor.ident === 'p2: Gliscor');
		assert(p2gliscor.details === 'Gliscor, L77, F');
		assert(p2gliscor.hp === 242);
		assert(p2gliscor.maxhp === 242);
		assert(p2gliscor.isActive());
		assert.deepEqual(p2gliscor.moveTrack, []);

		[
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
		].forEach(msg => battle.add(msg));
		battle.fastForwardTo(-1);

		assert(!p2gliscor.isActive());
		var p2kyurem = p2.pokemon[1];
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
