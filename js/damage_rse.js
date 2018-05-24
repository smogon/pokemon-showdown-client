function CALCULATE_ALL_MOVES_ADV(p1, p2, field) {
	checkAirLock(p1, field);
	checkAirLock(p2, field);
	checkForecast(p1, field.getWeather());
	checkForecast(p2, field.getWeather());
	checkIntimidate(p1, p2);
	checkIntimidate(p2, p1);
	var side1 = field.getSide(1);
	var side2 = field.getSide(0);
	var results = [[], []];
	for (var i = 0; i < 4; i++) {
		results[0][i] = CALCULATE_DAMAGE_ADV(p1, p2, p1.moves[i], side1);
		results[1][i] = CALCULATE_DAMAGE_ADV(p2, p1, p2.moves[i], side2);
	}
	return results;
}

function CALCULATE_MOVES_OF_ATTACKER_ADV(attacker, defender, field) {
	checkAirLock(attacker, field);
	checkAirLock(defender, field);
	checkForecast(attacker, field.getWeather());
	checkForecast(defender, field.getWeather());
	checkIntimidate(attacker, defender);
	checkIntimidate(defender, attacker);
	var defenderSide = field.getSide(~~(mode === "one-vs-all"));
	var results = [];
	for (var i = 0; i < 4; i++) {
		results[i] = CALCULATE_DAMAGE_ADV(attacker, defender, attacker.moves[i], defenderSide);
	}
	return results;
}

function CALCULATE_DAMAGE_ADV(attacker, defender, move, field) {
	var description = {
		"attackerName": attacker.name,
		"moveName": move.name,
		"defenderName": defender.name
	};

	if (move.bp === 0) {
		return {"damage": [0], "description": buildDescription(description)};
	}

	if (field.isProtected) {
		description.isProtected = true;
		return {"damage": [0], "description": buildDescription(description)};
	}

	if (move.name === "Weather Ball") {
		move.type = field.weather === "Sun" ? "Fire" :
			field.weather === "Rain" ? "Water" :
				field.weather === "Sand" ? "Rock" :
					field.weather === "Hail" ? "Ice" :
						"Normal";
		description.weather = field.weather;
		description.moveType = move.type;
		description.moveBP = move.bp;
	}

	var typeEffect1 = getMoveEffectiveness(move, defender.type1, field.isForesight);
	var typeEffect2 = defender.type2 ? getMoveEffectiveness(move, defender.type2, field.isForesight) : 1;
	var typeEffectiveness = typeEffect1 * typeEffect2;

	if (typeEffectiveness === 0) {
		return {"damage": [0], "description": buildDescription(description)};
	}

	if ((defender.ability.indexOf("Flash Fire") !== -1 && move.type === "Fire") ||
            (defender.ability === "Levitate" && move.type === "Ground") ||
            (defender.ability === "Volt Absorb" && move.type === "Electric") ||
            (defender.ability === "Water Absorb" && move.type === "Water") ||
            (defender.ability === "Wonder Guard" && typeEffectiveness <= 1) ||
            (defender.ability === "Soundproof" && move.isSound)) {
		description.defenderAbility = defender.ability;
		return {"damage": [0], "description": buildDescription(description)};
	}

	description.HPEVs = defender.HPEVs + " HP";

	var lv = attacker.level;
	if (move.name === "Seismic Toss" || move.name === "Night Shade") {
		return {"damage": [lv], "description": buildDescription(description)};
	}

	if (move.hits > 1) {
		description.hits = move.hits;
	}

	var bp;
	switch (move.name) {
	case "Flail":
	case "Reversal":
		var p = Math.floor(48 * attacker.curHP / attacker.maxHP);
		bp = p <= 1 ? 200 : p <= 4 ? 150 : p <= 9 ? 100 : p <= 16 ? 80 : p <= 32 ? 40 : 20;
		description.moveBP = bp;
		break;
	case "Eruption":
	case "Water Spout":
		bp = Math.max(1, Math.floor(150 * attacker.curHP / attacker.maxHP));
		description.moveBP = bp;
		break;
	case "Low Kick":
		var w = defender.weight;
		bp = w >= 200 ? 120 : w >= 100 ? 100 : w >= 50 ? 80 : w >= 25 ? 60 : w >= 10 ? 40 : 20;
		description.moveBP = bp;
		break;
	default:
		bp = move.bp;
	}

	var isPhysical = typeChart[move.type].category === "Physical";
	var attackStat = isPhysical ? AT : SA;
	description.attackEVs = attacker.evs[attackStat] +
            (NATURES[attacker.nature][0] === attackStat ? "+" : NATURES[attacker.nature][1] === attackStat ? "-" : "") + " " +
            toSmogonStat(attackStat);
	var defenseStat = isPhysical ? DF : SD;
	description.defenseEVs = defender.evs[defenseStat] +
            (NATURES[defender.nature][0] === defenseStat ? "+" : NATURES[defender.nature][1] === defenseStat ? "-" : "") + " " +
            toSmogonStat(defenseStat);
	var at = attacker.rawStats[attackStat];
	var df = defender.rawStats[defenseStat];

	if (isPhysical && (attacker.ability === "Huge Power" || attacker.ability === "Pure Power")) {
		at *= 2;
		description.attackerAbility = attacker.ability;
	}

	if (attacker.item !== "Sea Incense" && getItemBoostType(attacker.item) === move.type) {
		at = Math.floor(at * 1.1);
		description.attackerItem = attacker.item;
	} else if (attacker.item === "Sea Incense" && move.type === "Water") {
		at = Math.floor(at * 1.05);
		description.attackerItem = attacker.item;
	} else if ((isPhysical && attacker.item === "Choice Band") ||
            (!isPhysical && attacker.item === "Soul Dew" && (attacker.name === "Latios" || attacker.name === "Latias"))) {
		at = Math.floor(at * 1.5);
		description.attackerItem = attacker.item;
	} else if ((!isPhysical && attacker.item === "Deep Sea Tooth" && attacker.name === "Clamperl") ||
            (!isPhysical && attacker.item === "Light Ball" && attacker.name === "Pikachu") ||
            (isPhysical && attacker.item === "Thick Club" && (attacker.name === "Cubone" || attacker.name === "Marowak"))) {
		at *= 2;
		description.attackerItem = attacker.item;
	}

	if (!isPhysical && defender.item === "Soul Dew" && (defender.name === "Latios" || defender.name === "Latias")) {
		df = Math.floor(df * 1.5);
		description.defenderItem = defender.item;
	} else if ((!isPhysical && defender.item === "Deep Sea Scale" && defender.name === "Clamperl") ||
            (isPhysical && defender.item === "Metal Powder" && defender.name === "Ditto")) {
		df *= 2;
		description.defenderItem = defender.item;
	}

	if (defender.ability === "Thick Fat" && (move.type === "Fire" || move.type === "Ice")) {
		at = Math.floor(at / 2);
		description.defenderAbility = defender.ability;
	} else if (isPhysical && defender.ability === "Marvel Scale" && defender.status !== "Healthy") {
		df = Math.floor(df * 1.5);
		description.defenderAbility = defender.ability;
	}

	if (isPhysical && (attacker.ability === "Hustle" || (attacker.ability === "Guts" && attacker.status !== "Healthy")) || (!isPhysical && (attacker.ability === "Plus" || attacker.ability === "Minus"))) {
		at = Math.floor(at * 1.5);
		description.attackerAbility = attacker.ability;
	} else if (attacker.curHP <= attacker.maxHP / 3 &&
            ((attacker.ability === "Overgrow" && move.type === "Grass") ||
            (attacker.ability === "Blaze" && move.type === "Fire") ||
            (attacker.ability === "Torrent" && move.type === "Water") ||
            (attacker.ability === "Swarm" && move.type === "Bug"))) {
		bp = Math.floor(bp * 1.5);
		description.attackerAbility = attacker.ability;
	}

	if (move.name === "Explosion" || move.name === "Self-Destruct") {
		df = Math.floor(df / 2);
	}

	var isCritical = move.isCrit && ["Battle Armor", "Shell Armor"].indexOf(defender.ability) === -1;

	var attackBoost = attacker.boosts[attackStat];
	var defenseBoost = defender.boosts[defenseStat];
	if (attackBoost > 0 || (!isCritical && attackBoost < 0)) {
		at = getModifiedStat(at, attackBoost);
		description.attackBoost = attackBoost;
	}
	if (defenseBoost < 0 || (!isCritical && defenseBoost > 0)) {
		df = getModifiedStat(df, defenseBoost);
		description.defenseBoost = defenseBoost;
	}

	var baseDamage = Math.floor(Math.floor(Math.floor(2 * lv / 5 + 2) * at * bp / df) / 50);

	if (attacker.status === "Burned" && isPhysical && attacker.ability !== "Guts") {
		baseDamage = Math.floor(baseDamage / 2);
		description.isBurned = true;
	}

	if (!isCritical) {
		var screenMultiplier = field.format !== "Singles" ? (2 / 3) : (1 / 2);
		if (isPhysical && field.isReflect) {
			baseDamage = Math.floor(baseDamage * screenMultiplier);
			description.isReflect = true;
		} else if (!isPhysical && field.isLightScreen) {
			baseDamage = Math.floor(baseDamage * screenMultiplier);
			description.isLightScreen = true;
		}
	}

	if (field.format !== "Singles" && move.isSpread) {
		// some sources say 3/4, some say 2/3, some say 1/2...using 3/4 for now since that's what DPP+ use
		baseDamage = Math.floor(baseDamage * 3 / 4);
	}

	if ((field.weather === "Sun" && move.type === "Fire") || (field.weather === "Rain" && move.type === "Water")) {
		baseDamage = Math.floor(baseDamage * 1.5);
		description.weather = field.weather;
	} else if ((field.weather === "Sun" && move.type === "Water") || (field.weather === "Rain" && move.type === "Fire") ||
            (move.name === "Solar Beam" && ["Rain", "Sand", "Hail"].indexOf(field.weather) !== -1)) {
		baseDamage = Math.floor(baseDamage / 2);
		description.weather = field.weather;
	}

	if (attacker.ability === "Flash Fire (activated)" && move.type === "Fire") {
		baseDamage = Math.floor(baseDamage * 1.5);
		description.attackerAbility = "Flash Fire";
	}

	baseDamage = Math.max(1, baseDamage) + 2;

	if (isCritical) {
		baseDamage *= 2;
		description.isCritical = true;
	}

	if (move.name === "Weather Ball" && field.weather !== "") {
		baseDamage *= 2;
		description.moveBP = move.bp * 2;
	}

	if (field.isHelpingHand) {
		baseDamage = Math.floor(baseDamage * 1.5);
		description.isHelpingHand = true;
	}

	if (move.type === attacker.type1 || move.type === attacker.type2) {
		baseDamage = Math.floor(baseDamage * 1.5);
	}

	baseDamage = Math.floor(baseDamage * typeEffectiveness);

	var damage = [];
	for (var i = 85; i <= 100; i++) {
		damage[i - 85] = Math.max(1, Math.floor(baseDamage * i / 100));
	}
	return {"damage": damage, "description": buildDescription(description)};
}
