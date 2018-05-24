function CALCULATE_ALL_MOVES_GSC(p1, p2, field) {
	p1.stats[AT] = Math.min(999, Math.max(1, getModifiedStat(p1.rawStats[AT], p1.boosts[AT])));
	p1.stats[DF] = Math.min(999, Math.max(1, getModifiedStat(p1.rawStats[DF], p1.boosts[DF])));
	p1.stats[SA] = Math.min(999, Math.max(1, getModifiedStat(p1.rawStats[SA], p1.boosts[SA])));
	p1.stats[SD] = Math.min(999, Math.max(1, getModifiedStat(p1.rawStats[SD], p1.boosts[SD])));
	p2.stats[AT] = Math.min(999, Math.max(1, getModifiedStat(p2.rawStats[AT], p2.boosts[AT])));
	p2.stats[DF] = Math.min(999, Math.max(1, getModifiedStat(p2.rawStats[DF], p2.boosts[DF])));
	p2.stats[SA] = Math.min(999, Math.max(1, getModifiedStat(p2.rawStats[SA], p2.boosts[SA])));
	p2.stats[SD] = Math.min(999, Math.max(1, getModifiedStat(p2.rawStats[SD], p2.boosts[SD])));
	var side1 = field.getSide(1);
	var side2 = field.getSide(0);
	var results = [[], []];
	for (var i = 0; i < 4; i++) {
		results[0][i] = CALCULATE_DAMAGE_GSC(p1, p2, p1.moves[i], side1);
		results[1][i] = CALCULATE_DAMAGE_GSC(p2, p1, p2.moves[i], side2);
	}
	return results;
}

function CALCULATE_MOVES_OF_ATTACKER_GSC(attacker, defender, field) {
	attacker.stats[AT] = Math.min(999, Math.max(1, getModifiedStat(attacker.rawStats[AT], attacker.boosts[AT])));
	attacker.stats[SA] = Math.min(999, Math.max(1, getModifiedStat(attacker.rawStats[SA], attacker.boosts[SA])));
	defender.stats[DF] = Math.min(999, Math.max(1, getModifiedStat(defender.rawStats[DF], defender.boosts[DF])));
	defender.stats[SD] = Math.min(999, Math.max(1, getModifiedStat(defender.rawStats[SD], defender.boosts[SD])));
	var defenderSide = field.getSide(~~(mode === "one-vs-all"));
	var results = [];
	for (var i = 0; i < 4; i++) {
		results[i] = CALCULATE_DAMAGE_GSC(attacker, defender, attacker.moves[i], defenderSide);
	}
	return results;
}

function CALCULATE_DAMAGE_GSC(attacker, defender, move, field) {
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

	var typeEffect1 = getMoveEffectiveness(move, defender.type1, field.isForesight);
	var typeEffect2 = defender.type2 ? getMoveEffectiveness(move, defender.type2, field.isForesight) : 1;
	var typeEffectiveness = typeEffect1 * typeEffect2;

	if (typeEffectiveness === 0) {
		return {"damage": [0], "description": buildDescription(description)};
	}

	var lv = attacker.level;
	if (move.name === "Seismic Toss" || move.name === "Night Shade") {
		return {"damage": [lv], "description": buildDescription(description)};
	}

	if (move.hits > 1) {
		description.hits = move.hits;
	}

	// Flail and Reversal are variable BP and never crit
	if (move.name === "Flail" || move.name === "Reversal") {
		move.isCrit = false;
		var p = Math.floor(48 * attacker.curHP / attacker.maxHP);
		move.bp = p <= 1 ? 200 : p <= 4 ? 150 : p <= 9 ? 100 : p <= 16 ? 80 : p <= 32 ? 40 : 20;
		description.moveBP = move.bp;
	}

	var isPhysical = typeChart[move.type].category === "Physical";
	var attackStat = isPhysical ? AT : SA;
	var defenseStat = isPhysical ? DF : SD;
	var at = attacker.stats[attackStat];
	var df = defender.stats[defenseStat];

	// ignore Reflect, Light Screen, stat stages, and burns if attack is a crit and attacker does not have stat stage advantage
	var ignoreMods = move.isCrit && attacker.boosts[attackStat] <= defender.boosts[defenseStat];

	if (ignoreMods) {
		at = attacker.rawStats[attackStat];
		df = defender.rawStats[defenseStat];
	} else {
		if (attacker.boosts[attackStat] !== 0) {
			description.attackBoost = attacker.boosts[attackStat];
		}
		if (defender.boosts[defenseStat] !== 0) {
			description.defenseBoost = defender.boosts[defenseStat];
		}
		if (isPhysical && attacker.status === "Burned") {
			at = Math.floor(at / 2);
			description.isBurned = true;
		}
	}

	if (move.name === "Explosion" || move.name === "Self-Destruct") {
		df = Math.floor(df / 2);
	}

	if (!ignoreMods) {
		if (isPhysical && field.isReflect) {
			df *= 2;
			description.isReflect = true;
		} else if (!isPhysical && field.isLightScreen) {
			df *= 2;
			description.isLightScreen = true;
		}
	}

	if ((attacker.name === "Pikachu" && attacker.item === "Light Ball" && !isPhysical) ||
            ((attacker.name === "Cubone" || attacker.name === "Marowak") && attacker.item === "Thick Club" && isPhysical)) {
		at *= 2;
		description.attackerItem = attacker.item;
	}

	if (at > 255 || df > 255) {
		at = Math.floor(at / 4) % 256;
		df = Math.floor(df / 4) % 256;
	}

	if (defender.name === "Ditto" && defender.item === "Metal Powder") {
		df = Math.floor(df * 1.5);
		description.defenderItem = defender.item;
	}

	var baseDamage = Math.floor(Math.floor(Math.floor(2 * lv / 5 + 2) * Math.max(1, at) * move.bp / Math.max(1, df)) / 50);

	if (move.isCrit) {
		baseDamage *= 2;
		description.isCritical = true;
	}

	if (getItemBoostType(attacker.item) === move.type) {
		baseDamage = Math.floor(baseDamage * 1.1);
		description.attackerItem = attacker.item;
	}

	baseDamage = Math.min(997, baseDamage) + 2;

	if ((field.weather === "Sun" && move.type === "Fire") || (field.weather === "Rain" && move.type === "Water")) {
		baseDamage = Math.floor(baseDamage * 1.5);
		description.weather = field.weather;
	} else if ((field.weather === "Sun" && move.type === "Water") || (field.weather === "Rain" && (move.type === "Fire" || move.name === "Solar Beam"))) {
		baseDamage = Math.floor(baseDamage / 2);
		description.weather = field.weather;
	}

	if (move.type === attacker.type1 || move.type === attacker.type2) {
		baseDamage = Math.floor(baseDamage * 1.5);
	}

	baseDamage = Math.floor(baseDamage * typeEffectiveness);

	// Flail and Reversal don't use random factor
	if (move.name === "Flail" || move.name === "Reversal") {
		return {"damage": [baseDamage], "description": buildDescription(description)};
	}

	var damage = [];
	for (var i = 217; i <= 255; i++) {
		damage[i - 217] = Math.floor(baseDamage * i / 255);
	}
	return {"damage": damage, "description": buildDescription(description)};
}
