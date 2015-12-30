var BattleTooltips = (function () {
	var incenseTypes = {
		'Odd Incense': 'Psychic',
		'Rock Incense': 'Rock',
		'Rose Incense': 'Grass',
		'Sea Incense': 'Water',
		'Wave Incense': 'Water'
	};
	var itemTypes = {
		'Black Belt': 'Fighting',
		'Black Glasses': 'Dark',
		'Charcoal': 'Fire',
		'Dragon Fang': 'Dragon',
		'Hard Stone': 'Rock',
		'Magnet': 'Electric',
		'Metal Coat': 'Steel',
		'Miracle Seed': 'Grass',
		'Mystic Water': 'Water',
		'Never-Melt Ice': 'Ice',
		'Poison Barb': 'Poison',
		'Sharp Beak': 'Flying',
		'Silk Scarf': 'Normal',
		'SilverPowder': 'Bug',
		'Soft Sand': 'Ground',
		'Spell Tag': 'Ghost',
		'TwistedSpoon': 'Psychic'
	};
	var noGemMoves = {
		'Fire Pledge': 1,
		'Fling': 1,
		'Grass Pledge': 1,
		'Struggle': 1,
		'Water Pledge': 1
	};
	function BattleTooltips() {}
	BattleTooltips.prototype.getItemBoost = function (BattleRoom, move, pokemon) {
		var myPokemon = BattleRoom.myPokemon[pokemon.slot];
		if (!myPokemon.item || BattleRoom.battle.hasPseudoWeather('Magic Room') || pokemon.volatiles && pokemon.volatiles['embargo']) return 0;

		var item = Tools.getItem(myPokemon.item);
		var moveType = BattleRoom.getMoveType(move, pokemon);
		var itemName = item.name;
		var moveName = move.name;

		// Plates
		if (item.onPlate === moveType) return 1.2;

		// Incenses
		if (incenseTypes[item.name] === moveType) return 1.2;

		// Type-enhancing items
		if (itemTypes[item.name] === moveType) return BattleRoom.battle.gen < 4 ? 1.1 : 1.2;

		// Gems
		if (moveName in noGemMoves) return 0;
		if (itemName === moveType + ' Gem') return BattleRoom.battle.gen < 6 ? 1.5 : 1.3;

		return 0;
	};
	BattleTooltips.prototype.boostBasePower = function (BattleRoom, move, pokemon, basePower, basePowerComment) {
		var itemBoost = this.getItemBoost(BattleRoom, move, pokemon);
		if (itemBoost) {
			basePower = Math.floor(basePower * itemBoost);
			var myPokemon = BattleRoom.myPokemon[pokemon.slot];
			basePowerComment += ' (Boosted by ' + Tools.getItem(myPokemon.item).name + ')';
		}
		return basePower + basePowerComment;
	};
	BattleTooltips.prototype.boostBasePower_Ball = function (BattleRoom, move, pokemon, min, max) {
		var myPokemon = BattleRoom.myPokemon[pokemon.slot];
		var technician = Tools.getAbility(myPokemon.baseAbility).name === 'Technician';
		if (technician) {
			if (min <= 60) min *= 1.5;
			if (max <= 60) max *= 1.5;
		}
		var itemBoost = this.getItemBoost(BattleRoom, move, pokemon);
		if (itemBoost) {
			min *= itemBoost;
			max *= itemBoost;
		}
		var basePowerComment = min === max ? '' : Math.floor(min) + ' to ';
		basePowerComment += Math.floor(max);
		if (technician) basePowerComment += ' (Technician boosted)';
		if (itemBoost) basePowerComment += ' (Boosted by ' + Tools.getItem(myPokemon.item).name + ')';
		return basePowerComment;
	};
	return BattleTooltips;
})();
