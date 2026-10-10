const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');
const {describe, it} = require('node:test');
const vm = require('vm');

global.window = global;
require('../play.pokemonshowdown.com/js/battle-dex-data.js');
require('../play.pokemonshowdown.com/js/battle-dex.js');

const battleChoicesPath = path.resolve(__dirname, '../play.pokemonshowdown.com/js/battle-choices.js');
const BattleChoiceBuilder = vm.runInThisContext(
	`${fs.readFileSync(battleChoicesPath, 'utf8')}\nBattleChoiceBuilder;`,
	{filename: battleChoicesPath}
);

function pokemon(name, options = {}) {
	return {
		name,
		ident: `p1: ${name}`,
		speciesForme: name,
		fainted: false,
		...options,
	};
}

function switchRequest(pokemonList, forceSwitch) {
	return {
		requestType: 'switch',
		rqid: 1,
		side: {
			name: 'Player',
			id: 'p1',
			pokemon: pokemonList,
		},
		forceSwitch,
	};
}

function move(name, options = {}) {
	return {
		name,
		id: name.toLowerCase().replace(/[^a-z0-9]+/g, ''),
		pp: 16,
		maxpp: 16,
		target: 'normal',
		...options,
	};
}

function moveRequest(pokemonList, active) {
	return {
		requestType: 'move',
		rqid: 1,
		side: {
			name: 'Player',
			id: 'p1',
			pokemon: pokemonList,
		},
		active,
	};
}

function teamRequest(pokemonList, chosenTeamSize) {
	return {
		requestType: 'team',
		rqid: 1,
		side: {
			name: 'Player',
			id: 'p1',
			pokemon: pokemonList,
		},
		chosenTeamSize,
	};
}

describe('BattleChoiceBuilder', () => {
	it('should offer fainted Pokémon when an active Pokémon is reviving', () => {
		const request = switchRequest([
			pokemon('Pawmot', {reviving: true}),
			pokemon('Pikachu', {fainted: true}),
			pokemon('Raichu', {fainted: true}),
		], [true]);
		const choices = new BattleChoiceBuilder(request);

		assert.equal(choices.isDone(), false);
		assert.equal(choices.addChoice('switch 2'), null);
		assert.equal(choices.toString(), 'switch 2');
		assert.equal(choices.isDone(), true);
	});

	it('should allow reviving a fainted Pokémon in an active slot', () => {
		const request = switchRequest([
			pokemon('Pawmot', {reviving: true}),
			pokemon('Pikachu', {fainted: true}),
			pokemon('Raichu', {fainted: true}),
		], [true, true]);
		const choices = new BattleChoiceBuilder(request);

		assert.equal(choices.addChoice('switch 2'), null);
		assert.equal(choices.toString(), 'switch 2, pass');
		assert.equal(choices.isDone(), true);
	});

	it('should apply reviving rules only to the active slot making a choice', () => {
		const request = switchRequest([
			pokemon('Pawmot', {reviving: true}),
			pokemon('Pikachu', {fainted: true}),
			pokemon('Raichu'),
			pokemon('Plusle', {fainted: true}),
		], [true, true]);
		const choices = new BattleChoiceBuilder(request);

		assert.equal(choices.addChoice('switch 3'), 'Raichu still has energy to battle!');
		assert.equal(choices.addChoice('switch 4'), null);
		assert.equal(choices.addChoice('switch 3'), null);
		assert.equal(choices.toString(), 'switch 4, switch 3');
		assert.equal(choices.isDone(), true);
	});

	describe('addChoices', () => {
		it('should deserialize comma-separated choices', () => {
			const request = moveRequest([
				pokemon('Charizard'),
				pokemon('Blastoise'),
				pokemon('Venusaur'),
			], [
				{moves: [move('Flamethrower')], canMegaEvo: true},
				{moves: [move('Hydro Pump')]},
			]);
			const choices = new BattleChoiceBuilder(request);

			assert.equal(choices.addChoices('move Flamethrower mega +1, switch Venusaur'), null);
			assert.deepEqual(choices.choices, ['move 1 mega +1', 'switch 3']);
			assert.equal(choices.toString(), 'move 1 mega +1, switch 3');
			assert.equal(choices.isDone(), true);
			assert.equal(choices.alreadyMega, true);
			assert.deepEqual(choices.alreadySwitchingIn, [3]);
		});

		it('should deserialize and complete compact team choices', () => {
			const request = teamRequest([
				pokemon('Pikachu'),
				pokemon('Raichu'),
				pokemon('Plusle'),
				pokemon('Minun'),
				pokemon('Pachirisu'),
				pokemon('Emolga'),
			], 4);
			const choices = new BattleChoiceBuilder(request);

			assert.equal(choices.addChoices('team 31'), null);
			assert.deepEqual(choices.choices, ['team 3', 'team 1', 'team 2', 'team 4']);
			assert.equal(choices.toString(), 'team 3, 1, 2, 4');
			assert.equal(choices.isDone(), true);
		});

		it('should deserialize and complete bracketed team choices', () => {
			const request = teamRequest([
				pokemon('Pikachu'),
				pokemon('Raichu'),
				pokemon('Plusle'),
				pokemon('Minun'),
				pokemon('Pachirisu'),
				pokemon('Emolga'),
			], 4);
			const choices = new BattleChoiceBuilder(request);

			assert.equal(choices.addChoices('team [3, 1]'), null);
			assert.deepEqual(choices.choices, ['team 3', 'team 1', 'team 2', 'team 4']);
			assert.equal(choices.toString(), 'team 3, 1, 2, 4');
			assert.equal(choices.isDone(), true);
		});

		it('should deserialize a named team choice', () => {
			const request = teamRequest([
				pokemon('Pikachu'),
				pokemon('Raichu'),
				pokemon('Plusle'),
				pokemon('Minun'),
			], 3);
			const choices = new BattleChoiceBuilder(request);

			assert.equal(choices.addChoices('team Plusle, Raichu'), null);
			assert.deepEqual(choices.choices, ['team 3', 'team 2', 'team 1']);
			assert.equal(choices.toString(), 'team 3, 2, 1');
			assert.equal(choices.isDone(), true);
		});

		it('should truncate a full team order to the requested team size', () => {
			const request = teamRequest([
				pokemon('Pikachu'),
				pokemon('Raichu'),
				pokemon('Plusle'),
				pokemon('Minun'),
				pokemon('Pachirisu'),
				pokemon('Emolga'),
			], 3);
			const choices = new BattleChoiceBuilder(request);

			assert.equal(choices.addChoices('team 654321'), null);
			assert.deepEqual(choices.choices, ['team 6', 'team 5', 'team 4']);
			assert.equal(choices.isDone(), true);
		});

		it('should support a multi-digit lead in Team Preview', () => {
			const pokemonList = Array.from({length: 24}, (_, i) => pokemon(`Pokémon ${i + 1}`));
			const request = teamRequest(pokemonList, 1);
			const choices = new BattleChoiceBuilder(request);

			assert.equal(choices.addChoices('team 12'), null);
			assert.deepEqual(choices.choices, ['team 12']);
			assert.equal(choices.toString(), 'team 12');
			assert.equal(choices.isDone(), true);
		});

		it('should serialize automatic choices', () => {
			for (const automaticChoice of ['auto', 'default']) {
				const choices = new BattleChoiceBuilder(switchRequest([
					pokemon('Pikachu'),
					pokemon('Raichu'),
				], [true]));

				assert.equal(choices.addChoices(automaticChoice), null);
				assert.equal(choices.serializedChoice, 'default');
				assert.equal(choices.toString(), 'default');
				assert.equal(choices.isDone(), true);
				assert.equal(choices.isEmpty(), false);
				assert.match(choices.addChoice('switch 2'), /already chosen/);
			}
		});

		it('should serialize an automatic choice after explicit choices', () => {
			const request = moveRequest([
				pokemon('Charizard'),
				pokemon('Blastoise'),
			], [
				{moves: [move('Flamethrower')]},
				{moves: [move('Hydro Pump')]},
			]);
			const choices = new BattleChoiceBuilder(request);

			assert.equal(choices.addChoices('move 1, default'), null);
			assert.deepEqual(choices.choices, ['move 1']);
			assert.equal(choices.serializedChoice, 'move 1, default');
			assert.equal(choices.toString(), 'move 1, default');
			assert.equal(choices.isDone(), true);
		});

		it('should remain incomplete after a partial serialized choice', () => {
			const request = moveRequest([
				pokemon('Charizard'),
				pokemon('Blastoise'),
			], [
				{moves: [move('Flamethrower')]},
				{moves: [move('Hydro Pump')]},
			]);
			const choices = new BattleChoiceBuilder(request);

			assert.equal(choices.addChoices('move 1'), null);
			assert.equal(choices.toString(), 'move 1');
			assert.equal(choices.isDone(), false);
		});
	});
});
