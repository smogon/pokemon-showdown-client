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
		var myPokemon = BattleRoom.myPokemon[pokemon.slot];
		if (myPokemon.item && !BattleRoom.battle.hasPseudoWeather('Magic Room') && (!pokemon.volatiles || !pokemon.volatiles['embargo'])) {
			var item = Tools.getItem(myPokemon.item);
			var moveType = BattleRoom.getMoveType(move, pokemon);
			var splitItemName = item.name.split(' ');
			var moveName = move.name;

			// Gems
			if (splitItemName[1] == 'Gem' && moveType == splitItemName[0] && moveName != 'Struggle' && moveName != 'Water Pledge' && moveName != 'Grass Pledge' && moveName != 'Fire Pledge' && moveName != 'Fling') {
				basePower *= BattleRoom.battle.gen >= 6 ? 1.3 : 1.5;
				basePowerComment += ' (Boosted by ' + item.name + ')';
			}
			// Plates
			if (splitItemName[1] == 'Plate' && item.onPlate && moveType == item.onPlate) {
				basePower *= 1.2;
				basePowerComment += ' (Boosted by ' + item.name + ')';
			}
			// Type-enhancing items
			if (item.name == 'Black Belt' && moveType == 'Fighting' || item.name == 'Black Glasses' && moveType == 'Dark' || item.name == 'Charcoal' && moveType == 'Fire' || item.name == 'Dragon Fang' && moveType == 'Dragon' || item.name == 'Hard Stone' && moveType == 'Rock' || item.name == 'Magnet' && moveType == 'Electric' || item.name == 'Metal Coat' && moveType == 'Steel' || item.name == 'Miracle Seed' && moveType == 'Grass' || item.name == 'Mystic Water' && moveType == 'Water' || item.name == 'Never-Melt Ice' && moveType == 'Ice' || item.name == 'Poison Barb' && moveType == 'Poison' || item.name == 'Sharp Beak' && moveType == 'Flying' || item.name == 'Silk Scarf' && moveType == 'Normal' || item.name == 'SilverPowder' && moveType == 'Bug' || item.name == 'Soft Sand' && moveType == 'Ground' || item.name == 'Spell Tag' && moveType == 'Ghost' || item.name == 'TwistedSpoon' && moveType == 'Psychic') {
				basePower *= BattleRoom.battle.gen >= 4 ? 1.2 : 1.1;
				basePowerComment += ' (Boosted by ' + item.name + ')';
			}
			// Incenses
			if ((item.name == 'Wave Incense' || item.name == 'Sea Incense') && moveType == 'Water' || item.name == 'Rose Incense' && moveType == 'Grass' || item.name == 'Rock Incense' && moveType == 'Rock' || item.name == 'Odd Incense' && moveType == 'Psychic') {
				basePower *= 1.2;
				basePowerComment += ' (Boosted by ' + item.name + ')';
			}

			basePower = Math.floor(basePower);
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
		var itemCheck = false;
		if (myPokemon.item && !BattleRoom.battle.hasPseudoWeather('Magic Room') && (!pokemon.volatiles || !pokemon.volatiles['embargo'])) {
			var item = Tools.getItem(myPokemon.item);
			var moveType = BattleRoom.getMoveType(move, pokemon);
			var splitItemName = item.name.split(' ');
			var moveName = move.name;
			if (splitItemName[1] == 'Gem' && moveType == splitItemName[0]) {
				min *= BattleRoom.battle.gen >= 6 ? 1.3 : 1.5;
				max *= BattleRoom.battle.gen >= 6 ? 1.3 : 1.5;
				itemCheck = true;
			}
			if (splitItemName[1] == 'Plate' && item.onPlate && moveType == item.onPlate) {
				min *= 1.2;
				max *= 1.2;
				itemCheck = true;
			}
			if (item.name == 'Magnet' && moveType == 'Electric' || item.name == 'Metal Coat' && moveType == 'Steel') {
				min *= BattleRoom.battle.gen >= 4 ? 1.2 : 1.1;
				max *= BattleRoom.battle.gen >= 4 ? 1.2 : 1.1;
				itemCheck = true;
			}
		}
		var basePowerComment = min === max ? '' : Math.floor(min) + ' to ';
		basePowerComment += Math.floor(max);
		if (technician) basePowerComment += ' (Technician boosted)';
		if (itemCheck) basePowerComment += ' (Boosted by ' + Tools.getItem(myPokemon.item).name + ')';
		return basePowerComment;
	};
	return BattleTooltips;
})();
