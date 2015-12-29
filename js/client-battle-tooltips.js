var BattleTooltips = (function () {
	function BattleTooltips() {}
	BattleTooltips.prototype.boostBasePower = function (BattleRoom, move, pokemon, basePower, basePowerComment) {
		var myPokemon = BattleRoom.myPokemon[pokemon.slot];
		if (!BattleRoom.battle.hasPseudoWeather('Magic Room') && (!pokemon.volatiles || !pokemon.volatiles['embargo'])) {
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
		var ability = Tools.getAbility(myPokemon.baseAbility).name;
		var item = Tools.getItem(myPokemon.item);
		var moveType = BattleRoom.getMoveType(move, pokemon);
		var splitItemName = item.name.split(' ');
		var moveName = move.name;
		var itemCheck = false;
		var basePowerComment = '';
		if (!BattleRoom.battle.hasPseudoWeather('Magic Room') && (!pokemon.volatiles || !pokemon.volatiles['embargo'])) {
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
		if (ability === 'Technician') {
			if (min <= 60) min *= 1.5;
			if (max <= 60) max *= 1.5;
			basePowerComment += '' + ((min === max) ? Math.floor(max) : Math.floor(min) + ' to ' + Math.floor(max)) + ' (Technician boosted)';
			if (itemCheck) {
				basePowerComment += ' (Boosted by ' + item.name + ')';
			}
		} else {
			basePowerComment += (min === max) ? Math.floor(max) : Math.floor(min) + ' to ' + Math.floor(max);
			if (itemCheck) {
				basePowerComment += ' (Boosted by ' + item.name + ')';
			}
		}
		return basePowerComment;
	};
	return BattleTooltips;
})();
