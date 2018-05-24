function CALCULATE_ALL_MOVES_BW(p1, p2, field) {
	checkAirLock(p1, field);
	checkAirLock(p2, field);
	checkForecast(p1, field.getWeather());
	checkForecast(p2, field.getWeather());
	checkKlutz(p1);
	checkKlutz(p2);
	checkSeedBoost(p1, field);
	checkSeedBoost(p2, field);
	checkStatBoost(p1, p2);
	p1.stats[DF] = getModifiedStat(p1.rawStats[DF], p1.boosts[DF]);
	p1.stats[SD] = getModifiedStat(p1.rawStats[SD], p1.boosts[SD]);
	p1.stats[SP] = getFinalSpeed(p1, field.getWeather());
	p2.stats[DF] = getModifiedStat(p2.rawStats[DF], p2.boosts[DF]);
	p2.stats[SD] = getModifiedStat(p2.rawStats[SD], p2.boosts[SD]);
	p2.stats[SP] = getFinalSpeed(p2, field.getWeather());
	checkIntimidate(p1, p2);
	checkIntimidate(p2, p1);
	checkDownload(p1, p2);
	checkDownload(p2, p1);
	p1.stats[AT] = getModifiedStat(p1.rawStats[AT], p1.boosts[AT]);
	p1.stats[SA] = getModifiedStat(p1.rawStats[SA], p1.boosts[SA]);
	p2.stats[AT] = getModifiedStat(p2.rawStats[AT], p2.boosts[AT]);
	p2.stats[SA] = getModifiedStat(p2.rawStats[SA], p2.boosts[SA]);
	var side1 = field.getSide(1);
	var side2 = field.getSide(0);
	checkInfiltrator(p1, side1);
	checkInfiltrator(p2, side2);
	var results = [[], []];
	for (var i = 0; i < 4; i++) {
		results[0][i] = getDamageResult(p1, p2, p1.mymoves[i], side1);
		results[1][i] = getDamageResult(p2, p1, p2.mymoves[i], side2);
	}
	return results;
}

function CALCULATE_MOVES_OF_ATTACKER_BW(attacker, defender, field) {
	checkAirLock(attacker, field);
	checkAirLock(defender, field);
	checkForecast(attacker, field.getWeather());
	checkForecast(defender, field.getWeather());
	checkKlutz(attacker);
	checkKlutz(defender);
	attacker.stats[SP] = getFinalSpeed(attacker, field.getWeather());
	defender.stats[DF] = getModifiedStat(defender.rawStats[DF], defender.boosts[DF]);
	defender.stats[SD] = getModifiedStat(defender.rawStats[SD], defender.boosts[SD]);
	defender.stats[SP] = getFinalSpeed(defender, field.getWeather());
	checkIntimidate(attacker, defender);
	checkIntimidate(defender, attacker);
	checkDownload(attacker, defender);
	attacker.stats[AT] = getModifiedStat(attacker.rawStats[AT], attacker.boosts[AT]);
	attacker.stats[SA] = getModifiedStat(attacker.rawStats[SA], attacker.boosts[SA]);
	defender.stats[AT] = getModifiedStat(defender.rawStats[AT], defender.boosts[AT]);
	var defenderSide = field.getSide(~~(mode === "one-vs-all"));
	checkInfiltrator(attacker, defenderSide);
	var results = [];
	for (var i = 0; i < 4; i++) {
		results[i] = getDamageResult(attacker, defender, attacker.mymoves[i], defenderSide);
	}
	return results;
}

function getDamageResult(attacker, defender, move, field) {
	var description = {
		"attackerName": attacker.name,
		"moveName": move.name,
		"defenderName": defender.name
	};

	if (move.bp === 0) {
		return {"damage": [0], "description": buildDescription(description)};
	}

	if (field.isProtected && !move.bypassesProtect && !move.isZ) {
		description.isProtected = true;
		return {"damage": [0], "description": buildDescription(description)};
	}

	var defAbility = defender.ability;
	if (["Full Metal Body", "Prism Armor", "Shadow Shield"].indexOf(defAbility) === -1) {
		if (["Mold Breaker", "Teravolt", "Turboblaze"].indexOf(attacker.ability) !== -1) {
			defAbility = "";
			description.attackerAbility = attacker.ability;
		}
		if (["Menacing Moonraze Maelstrom", "Moongeist Beam", "Photon Geyser", "Searing Sunraze Smash", "Sunsteel Strike"].indexOf(move.name) !== -1) {
			defAbility = "";
		}
	}

	var isCritical = (move.isZ && move.isCrit) || ((move.isCrit && ["Battle Armor", "Shell Armor"].indexOf(defAbility) === -1 || attacker.ability === "Merciless" && defender.status.indexOf("Poisoned") !== -1) && move.usedTimes === 1);

	if (move.name === "Weather Ball") {
		move.type = field.weather.indexOf("Sun") !== -1 ? "Fire" :
			field.weather.indexOf("Rain") !== -1 ? "Water" :
				field.weather === "Sand" ? "Rock" :
					field.weather === "Hail" ? "Ice" :
						"Normal";
		description.weather = field.weather;
		description.moveType = move.type;
	} else if (move.name === "Judgment" && attacker.item.indexOf("Plate") !== -1) {
		move.type = getItemBoostType(attacker.item);
	} else if (move.name === "Techno Blast" && attacker.item.indexOf("Drive") !== -1) {
		move.type = getTechnoBlast(attacker.item);
	} else if (move.name === "Multi-Attack" && attacker.item.indexOf("Memory") !== -1) {
		move.type = getMultiAttack(attacker.item);
	} else if (move.name === "Natural Gift" && attacker.item.indexOf("Berry") !== -1) {
		var gift = getNaturalGift(attacker.item);
		move.type = gift.t;
		move.bp = gift.p;
		description.attackerItem = attacker.item;
		description.moveBP = move.bp;
		description.moveType = move.type;
	} else if (move.name === "Nature Power") {
		move.type = field.terrain === "Electric" ? "Electric" : field.terrain === "Grassy" ? "Grass" : field.terrain === "Misty" ? "Fairy" : field.terrain === "Psychic" ? "Psychic" : "Normal";
	} else if (move.name === "Revelation Dance") {
		move.type = attacker.type1;
	}

	var isAerilate = false;
	var isPixilate = false;
	var isRefrigerate = false;
	var isGalvanize = false;
	var isLiquidVoice = false;
	var isNormalize = false;

	if (!move.isZ) {
		isAerilate = attacker.ability === "Aerilate" && move.type === "Normal";
		isPixilate = attacker.ability === "Pixilate" && move.type === "Normal";
		isRefrigerate = attacker.ability === "Refrigerate" && move.type === "Normal";
		isGalvanize = attacker.ability === "Galvanize" && move.type === "Normal";
		isLiquidVoice = attacker.ability === "Liquid Voice" && move.isSound;
		isNormalize = attacker.ability === "Normalize" && move.type !== "Normal";
		if (isAerilate) {
			move.type = "Flying";
		} else if (isGalvanize) {
			move.type = "Electric";
		} else if (isLiquidVoice) {
			move.type = "Water";
		} else if (isPixilate) {
			move.type = "Fairy";
		} else if (isRefrigerate) {
			move.type = "Ice";
		} else if (isNormalize) {
			move.type = "Normal";
		}
		if (isGalvanize || isLiquidVoice || isPixilate || isRefrigerate || isAerilate || isNormalize) {
			description.attackerAbility = attacker.ability;
		}
	}

	if ((attacker.ability === "Gale Wings" && move.type === "Flying" && (gen >= 7 ? attacker.curHP === attacker.maxHP : true)) ||
            (attacker.ability === "Triage" && move.givesHealth)) {
		move.hasPriority = true;
		description.attackerAbility = attacker.ability;
	}

	var typeEffect1 = getMoveEffectiveness(move, defender.type1, attacker.ability === "Scrappy" || field.isForesight, field.isGravity);
	var typeEffect2 = defender.type2 ? getMoveEffectiveness(move, defender.type2, attacker.ability === "Scrappy" || field.isForesight, field.isGravity) : 1;
	var typeEffectiveness = typeEffect1 * typeEffect2;
	var resistedKnockOffDamage = (defender.item === "" ||
            (defender.name === "Giratina-Origin" && defender.item === "Griseous Orb") ||
            (defender.name.indexOf("Arceus") !== -1 && defender.item.indexOf("Plate") !== -1) ||
            (defender.name.indexOf("Genesect") !== -1 && defender.item.indexOf("Drive") !== -1) ||
            (defender.ability === "RKS System" && defender.item.indexOf("Memory") !== -1) ||
            (defender.item.indexOf(" Z") !== -1) || (hasMegaStone(defender) && defender.name.indexOf(megaStones[defender.item]) !== -1));
	// The last case only applies when the Pokemon is holding the Mega Stone that matches its species (or when it's already a Mega-Evolution)

	if (typeEffectiveness === 0 && move.name === "Thousand Arrows") {
		typeEffectiveness = 1;
	}
	if (defender.item === "Ring Target" && typeEffectiveness === 0) {
		if (typeChart[move.type][defender.type1] === 0) {
			typeEffectiveness = typeEffect2;
		} else if (typeChart[move.type][defender.type2] === 0) {
			typeEffectiveness = typeEffect1;
		}
	}
	if (typeEffectiveness === 0) {
		return {"damage": [0], "description": buildDescription(description)};
	}
	if (move.name === "Sky Drop" && (defender.hasType("Flying") || (gen >= 6 && defender.weight >= 200) || field.isGravity)) {
		return {"damage": [0], "description": buildDescription(description)};
	}
	if (move.name === "Synchronoise" && !defender.hasType(attacker.type1) &&
            (!attacker.type2 || !defender.hasType(attacker.type2))) {
		return {"damage": [0], "description": buildDescription(description)};
	}
	if (move.name === "Dream Eater" && (defender.status !== 'Asleep' && defender.ability !== 'Comatose')) {
		return {"damage": [0], "description": buildDescription(description)};
	}
	if ((defAbility === "Wonder Guard" && typeEffectiveness <= 1) ||
            (move.type === "Grass" && defAbility === "Sap Sipper") ||
            (move.type === "Fire" && defAbility.indexOf("Flash Fire") !== -1) ||
            (move.type === "Water" && ["Dry Skin", "Storm Drain", "Water Absorb"].indexOf(defAbility) !== -1) ||
            (move.type === "Electric" && ["Lightning Rod", "Motor Drive", "Volt Absorb"].indexOf(defAbility) !== -1) ||
            (move.type === "Ground" && !field.isGravity && move.name !== "Thousand Arrows" && defAbility === "Levitate") ||
            (move.isBullet && defAbility === "Bulletproof") ||
            (move.isSound && defAbility === "Soundproof") ||
            (move.hasPriority && ["Queenly Majesty", "Dazzling"].indexOf(defAbility) !== -1)) {
		description.defenderAbility = defAbility;
		return {"damage": [0], "description": buildDescription(description)};
	}
	if (field.weather === "Strong Winds" && (defender.hasType("Flying") && typeChart[move.type]["Flying"] > 1)) {
		typeEffectiveness /= 2;
		description.weather = field.weather;
	}
	if (move.type === "Ground" && move.name !== "Thousand Arrows" && !field.isGravity && defender.item === "Air Balloon") {
		description.defenderItem = defender.item;
		return {"damage": [0], "description": buildDescription(description)};
	}
	if (move.hasPriority && field.terrain === "Psychic" && isGroundedForCalc(defender, field)) {
		description.terrain = field.terrain;
		return {"damage": [0], "description": buildDescription(description)};
	}

	description.HPEVs = defender.HPEVs + " HP";

	if (["Seismic Toss", "Night Shade"].indexOf(move.name) !== -1) {
		var lv = attacker.level;
		if (attacker.ability === "Parental Bond") {
			lv *= 2;
		}
		return {"damage": [lv], "description": buildDescription(description)};
	}

	if (move.name === "Final Gambit") {
		var hp = attacker.curHP;
		return {"damage": [hp], "description": buildDescription(description)};
	}

	if (move.name === "Guardian of Alola") {
		var zLostHP = field.isProtected ? Math.floor(defender.curHP / 4) : Math.floor(defender.curHP * 3 / 4);
		 return {"damage": [zLostHP], "description": buildDescription(description)};
	}

	if (move.name === "Nature's Madness") {
		var lostHP = field.isProtected ? 0 : Math.floor(defender.curHP / 2);
		return {"damage": [lostHP], "description": buildDescription(description)};
	}

	if (move.name === "Spectral Thief") {
		for (stat in defender.boosts) {
			if (defender.boosts[stat] > 0) {
				attacker.boosts[stat] += attacker.ability === "Contrary" ? -defender.boosts[stat] : defender.boosts[stat];
				attacker.stats[stat] = getModifiedStat(attacker.rawStats[stat], attacker.boosts[stat]);
			}
		}
	}

	if (move.hits > 1) {
		description.hits = move.hits;
	}

	var turnOrder = attacker.stats[SP] > defender.stats[SP] ? "FIRST" : "LAST";

	////////////////////////////////
	////////// BASE POWER //////////
	////////////////////////////////
	var basePower;

	switch (move.name) {
	case "Payback":
		basePower = turnOrder === "LAST" ? 100 : 50;
		description.moveBP = basePower;
		break;
	case "Electro Ball":
		var r = Math.floor(attacker.stats[SP] / defender.stats[SP]);
		basePower = r >= 4 ? 150 : r >= 3 ? 120 : r >= 2 ? 80 : 60;
		description.moveBP = basePower;
		break;
	case "Gyro Ball":
		basePower = Math.min(150, Math.floor(25 * defender.stats[SP] / attacker.stats[SP]));
		description.moveBP = basePower;
		break;
	case "Punishment":
		basePower = Math.min(200, 60 + 20 * countBoosts(defender.boosts));
		description.moveBP = basePower;
		break;
	case "Low Kick":
	case "Grass Knot":
		var w = defender.weight;
		basePower = w >= 200 ? 120 : w >= 100 ? 100 : w >= 50 ? 80 : w >= 25 ? 60 : w >= 10 ? 40 : 20;
		description.moveBP = basePower;
		break;
	case "Hex":
		basePower = move.bp * (defender.status !== "Healthy" ? 2 : 1);
		description.moveBP = basePower;
		break;
	case "Heavy Slam":
	case "Heat Crash":
		var wr = attacker.weight / defender.weight;
		basePower = wr >= 5 ? 120 : wr >= 4 ? 100 : wr >= 3 ? 80 : wr >= 2 ? 60 : 40;
		description.moveBP = basePower;
		break;
	case "Stored Power":
	case "Power Trip":
		basePower = 20 + 20 * countBoosts(attacker.boosts);
		description.moveBP = basePower;
		break;
	case "Acrobatics":
		basePower = attacker.item === "Flying Gem" || !attacker.item ? 110 : 55;
		description.moveBP = basePower;
		break;
	case "Wake-Up Slap":
		basePower = move.bp * (defender.status === "Asleep" ? 2 : 1);
		description.moveBP = basePower;
		break;
	case "Weather Ball":
		basePower = (field.weather !== "" && field.weather !== "Delta Stream") ? 100 : 50;
		description.moveBP = basePower;
		break;
	case "Fling":
		basePower = getFlingPower(attacker.item);
		description.moveBP = basePower;
		description.attackerItem = attacker.item;
		break;
	case "Eruption":
	case "Water Spout":
		basePower = Math.max(1, Math.floor(150 * attacker.curHP / attacker.maxHP));
		description.moveBP = basePower;
		break;
	case "Flail":
	case "Reversal":
		var p = Math.floor(48 * attacker.curHP / attacker.maxHP);
		basePower = p <= 1 ? 200 : p <= 4 ? 150 : p <= 9 ? 100 : p <= 16 ? 80 : p <= 32 ? 40 : 20;
		description.moveBP = basePower;
		break;
	case "Nature Power":
		basePower = ["Electric", "Grassy", "Psychic"].indexOf(field.terrain) !== -1 ? 90 : (field.terrain === "Misty") ? 95 : 80;
		//console.log("A " + field.terrain + " terrain " + move.type + move.name + " with " + move.bp + " base power " + " agaisnt a(n) " + defender.name + " that has " + defender.type1 + " " + defender.type2 + " typing");
		break;
	case "Water Shuriken":
		basePower = (attacker.name === "Greninja-Ash" && attacker.ability === "Battle Bond") ? 20 : 15;
		description.moveBP = basePower;
		break;
	case "Wring Out":
		basePower = Math.max(1, Math.ceil(defender.curHP * 120 / defender.maxHP - 0.5));
		description.moveBP = basePower;
		break;
	default:
		basePower = move.bp;
	}

	var bpMods = [];
	if ((attacker.ability === "Technician" && basePower <= 60) ||
            (attacker.ability === "Flare Boost" && attacker.status === "Burned" && move.category === "Special") ||
            (attacker.ability === "Toxic Boost" && (attacker.status === "Poisoned" || attacker.status === "Badly Poisoned") &&
                    move.category === "Physical")) {
		bpMods.push(0x1800);
		description.attackerAbility = attacker.ability;
	} else if (attacker.ability === "Analytic" && turnOrder !== "FIRST") {
		bpMods.push(0x14CD);
		description.attackerAbility = attacker.ability;
	} else if (attacker.ability === "Sand Force" && field.weather === "Sand" && ["Rock", "Ground", "Steel"].indexOf(move.type) !== -1) {
		bpMods.push(0x14CD);
		description.attackerAbility = attacker.ability;
		description.weather = field.weather;
	} else if ((attacker.ability === "Reckless" && (typeof move.hasRecoil === 'number' || move.hasRecoil === 'crash')) ||
            (attacker.ability === "Iron Fist" && move.isPunch)) {
		bpMods.push(0x1333);
		description.attackerAbility = attacker.ability;
	}

	if (defAbility === "Heatproof" && move.type === "Fire") {
		bpMods.push(0x800);
		description.defenderAbility = defAbility;
	} else if (defAbility === "Dry Skin" && move.type === "Fire") {
		bpMods.push(0x1400);
		description.defenderAbility = defAbility;
	} else if (defAbility === "Fluffy" && (!move.makesContact || attacker.ability === "Long Reach") && move.type === "Fire") {
		bpMods.push(0x2000);
		description.defenderAbility = defAbility;
	} else if (defAbility === "Fluffy" && move.makesContact && attacker.ability !== "Long Reach" && move.type !== "Fire") {
		bpMods.push(0x800);
		description.defenderAbility = defAbility;
	}

	if (attacker.ability === "Sheer Force" && move.hasSecondaryEffect) {
		bpMods.push(0x14CD);
		description.attackerAbility = attacker.ability;
	}

	if (attacker.ability === "Rivalry" && [attacker.gender, defender.gender].indexOf("genderless") === -1) {
		if (attacker.gender === defender.gender) {
			bpMods.push(0x1400);
			description.rivalry = "buffed";
		} else {
			bpMods.push(0xCCD);
			description.rivalry = "nerfed";
		}
		description.attackerAbility = attacker.ability;
	}

	var isSTAB = attacker.hasType(move.type);

	if (getItemBoostType(attacker.item) === move.type) {
		bpMods.push(0x1333);
		description.attackerItem = attacker.item;
	} else if ((attacker.item === "Muscle Band" && move.category === "Physical") ||
            (attacker.item === "Wise Glasses" && move.category === "Special")) {
		bpMods.push(0x1199);
		description.attackerItem = attacker.item;
	} else if (((attacker.item === "Adamant Orb" && attacker.name === "Dialga") ||
            (attacker.item === "Lustrous Orb" && attacker.name === "Palkia") ||
            (attacker.item === "Griseous Orb" && attacker.name === "Giratina-Origin")) && isSTAB) {
		bpMods.push(0x1333);
		description.attackerItem = attacker.item;
	} else if (attacker.item === move.type + " Gem") {
		bpMods.push(gen >= 6 ? 0x14CD : 0x1800);
		description.attackerItem = attacker.item;
	} else if (attacker.item === "Soul Dew" && ["Latios", "Latias", "Latios-Mega", "Latias-Mega"].indexOf(attacker.name) !== -1 && isSTAB) {
		bpMods.push(gen >= 7 ? 0x1333 : 0x1000);
		description.attackerItem = attacker.item;
	}

	if ((move.name === "Facade" && ["Burned", "Paralyzed", "Poisoned", "Badly Poisoned"].indexOf(attacker.status) !== -1) ||
            (move.name === "Brine" && defender.curHP <= defender.maxHP / 2) ||
            (move.name === "Venoshock" && (defender.status === "Poisoned" || defender.status === "Badly Poisoned"))) {
		bpMods.push(0x2000);
		description.moveBP = move.bp * 2;
	} else if (move.name === "Solar Beam" && ["Rain", "Heavy Rain", "Sand", "Hail"].indexOf(field.weather) !== -1) {
		bpMods.push(0x800);
		description.moveBP = move.bp / 2;
		description.weather = field.weather;
	} else if (gen >= 6 && move.name === "Knock Off" && !resistedKnockOffDamage) {
		bpMods.push(0x1800);
		description.moveBP = move.bp * 1.5;
	} else if (["Breakneck Blitz", "Bloom Doom", "Inferno Overdrive", "Hydro Vortex", "Gigavolt Havoc", "Subzero Slammer", "Supersonic Skystrike",
		"Savage Spin-Out", "Acid Downpour", "Tectonic Rage", "Continental Crush", "All-Out Pummeling", "Shattered Psyche", "Never-Ending Nightmare",
		"Devastating Drake", "Black Hole Eclipse", "Corkscrew Crash", "Twinkle Tackle"].indexOf(move.name) !== -1) {
		// show z-move power in description
		description.moveBP = move.bp;
	}

	if (field.isHelpingHand) {
		bpMods.push(0x1800);
		description.isHelpingHand = true;
	}

	if (isAerilate || isPixilate || isRefrigerate || isGalvanize) {
		bpMods.push(gen >= 7 ? 0x1333 : 0x14CD);
		description.attackerAbility = attacker.ability;
	} else if ((attacker.ability === "Mega Launcher" && move.isPulse) ||
            (attacker.ability === "Strong Jaw" && move.isBite)) {
		bpMods.push(0x1800);
		description.attackerAbility = attacker.ability;
	} else if (attacker.ability === "Tough Claws" && move.makesContact) {
		bpMods.push(0x14CD);
		description.attackerAbility = attacker.ability;
	} else if (attacker.ability === "Neuroforce" && typeEffectiveness > 1) {
		bpMods.push(0x1333);
		description.attackerAbility = attacker.ability;
	}

	var isAttackerAura = attacker.ability === (move.type + " Aura");
	var isDefenderAura = defAbility === (move.type + " Aura");
	if (isAttackerAura || isDefenderAura) {
		if (attacker.ability === "Aura Break" || defAbility === "Aura Break") {
			bpMods.push(0x0C00);
			description.attackerAbility = attacker.ability;
			description.defenderAbility = defAbility;
		} else {
			bpMods.push(0x1547);
			if (isAttackerAura) {
				description.attackerAbility = attacker.ability;
			}
			if (isDefenderAura) {
				description.defenderAbility = defAbility;
			}
		}
	}

	basePower = Math.max(1, pokeRound(basePower * chainMods(bpMods) / 0x1000));

	////////////////////////////////
	////////// (SP)ATTACK //////////
	////////////////////////////////
	var attack;
	var attackSource = move.name === "Foul Play" ? defender : attacker;
	if (move.usesHighestAttackStat) {
		move.category = attackSource.stats[AT] >= attackSource.stats[SA] ? "Physical" : "Special";
	}
	var attackStat = move.category === "Physical" ? AT : SA;
	description.attackEVs = attacker.evs[attackStat] +
            (NATURES[attacker.nature][0] === attackStat ? "+" : NATURES[attacker.nature][1] === attackStat ? "-" : "") + " " +
            toSmogonStat(attackStat);
	if (attackSource.boosts[attackStat] === 0 || (isCritical && attackSource.boosts[attackStat] < 0)) {
		attack = attackSource.rawStats[attackStat];
	} else if (defAbility === "Unaware") {
		attack = attackSource.rawStats[attackStat];
		description.defenderAbility = defAbility;
	} else {
		attack = attackSource.stats[attackStat];
		description.attackBoost = attackSource.boosts[attackStat];
	}

	// unlike all other attack modifiers, Hustle gets applied directly
	if (attacker.ability === "Hustle" && move.category === "Physical") {
		attack = pokeRound(attack * 3 / 2);
		description.attackerAbility = attacker.ability;
	}

	var atMods = [];
	if (defAbility === "Thick Fat" && (move.type === "Fire" || move.type === "Ice") || (defAbility === "Water Bubble" && move.type === "Fire")) {
		atMods.push(0x800);
		description.defenderAbility = defAbility;
	}

	if ((attacker.ability === "Guts" && attacker.status !== "Healthy" && move.category === "Physical") ||
			attacker.curHP <= attacker.maxHP / 3 &&
			(attacker.ability === "Overgrow" && move.type === "Grass" ||
			attacker.ability === "Blaze" && move.type === "Fire" ||
			attacker.ability === "Torrent" && move.type === "Water" ||
			attacker.ability === "Swarm" && move.type === "Bug") ||
			(move.category === "Special" && ["Plus", "Minus"].indexOf(attacker.ability) !== -1)) {
		atMods.push(0x1800);
		description.attackerAbility = attacker.ability;
	} else if (attacker.ability === "Flash Fire (activated)" && move.type === "Fire") {
		atMods.push(0x1800);
		description.attackerAbility = "Flash Fire";
	} else if ((attacker.ability === "Solar Power" && field.weather.indexOf("Sun") !== -1 && move.category === "Special") ||
            (attacker.ability === "Flower Gift" && field.weather.indexOf("Sun") !== -1 && move.category === "Physical")) {
		atMods.push(0x1800);
		description.attackerAbility = attacker.ability;
		description.weather = field.weather;
	} else if ((attacker.ability === "Defeatist" && attacker.curHP <= attacker.maxHP / 2) ||
            (attacker.ability === "Slow Start" && move.category === "Physical")) {
		atMods.push(0x800);
		description.attackerAbility = attacker.ability;
	} else if (["Huge Power", "Pure Power"].indexOf(attacker.ability) !== -1 && move.category === "Physical") {
		atMods.push(0x2000);
		description.attackerAbility = attacker.ability;
	}

	if (attacker.item === "Thick Club" && (["Cubone", "Marowak", "Marowak-Alola"].indexOf(attacker.name) !== -1 && move.category === "Physical") ||
            (attacker.item === "Deep Sea Tooth" && attacker.name === "Clamperl" && move.category === "Special") ||
            (attacker.item === "Light Ball" && attacker.name === "Pikachu") && !move.isZ) {
		atMods.push(0x2000);
		description.attackerItem = attacker.item;
	} else if ((gen < 7 && attacker.item === "Soul Dew" && (attacker.name === "Latios" || attacker.name === "Latias") && move.category === "Special") ||
            (!move.isZ && (attacker.item === "Choice Band" && move.category === "Physical" || attacker.item === "Choice Specs" && move.category === "Special"))) {
		atMods.push(0x1800);
		description.attackerItem = attacker.item;
	}

	attack = Math.max(1, pokeRound(attack * chainMods(atMods) / 0x1000));

	////////////////////////////////
	///////// (SP)DEFENSE //////////
	////////////////////////////////
	var defense;
	var hitsPhysical = move.category === "Physical" || move.dealsPhysicalDamage;
	var defenseStat = hitsPhysical ? DF : SD;
	description.defenseEVs = defender.evs[defenseStat] +
            (NATURES[defender.nature][0] === defenseStat ? "+" : NATURES[defender.nature][1] === defenseStat ? "-" : "") + " " +
            toSmogonStat(defenseStat);
	if (defender.boosts[defenseStat] === 0 || (isCritical && defender.boosts[defenseStat] > 0) || move.ignoresDefenseBoosts) {
		defense = defender.rawStats[defenseStat];
	} else if (attacker.ability === "Unaware") {
		defense = defender.rawStats[defenseStat];
		description.attackerAbility = attacker.ability;
	} else {
		defense = defender.stats[defenseStat];
		description.defenseBoost = defender.boosts[defenseStat];
	}

	// unlike all other defense modifiers, Sandstorm SpD boost gets applied directly
	if (field.weather === "Sand" && defender.hasType("Rock") && !hitsPhysical) {
		defense = pokeRound(defense * 3 / 2);
		description.weather = field.weather;
	}

	var dfMods = [];
	if (defAbility === "Marvel Scale" && defender.status !== "Healthy" && hitsPhysical) {
		dfMods.push(0x1800);
		description.defenderAbility = defAbility;
	} else if (defAbility === "Flower Gift" && field.weather.indexOf("Sun") !== -1 && !hitsPhysical) {
		dfMods.push(0x1800);
		description.defenderAbility = defAbility;
		description.weather = field.weather;
	}

	if (field.terrain === "Grassy" && defAbility === "Grass Pelt" && hitsPhysical) {
		dfMods.push(0x1800);
		description.defenderAbility = defAbility;
	}

	if (gen < 7 && (!hitsPhysical && ["Latios", "Latias"].indexOf(defender.name) !== -1 && defender.item === "Soul Dew") || (defender.item === "Eviolite" && pokedex[defender.name].canEvolve) || (!hitsPhysical && defender.item === "Assault Vest")) {
		dfMods.push(0x1800);
		description.defenderItem = defender.item;
	}

	if ((defender.item === "Metal Powder" && defender.name === "Ditto" && hitsPhysical) ||
            (defender.item === "Deep Sea Scale" && defender.name === "Clamperl" && !hitsPhysical)) {
		dfMods.push(0x2000);
		description.defenderItem = defender.item;
	}

	if (defAbility === "Fur Coat" && hitsPhysical) {
		dfMods.push(0x2000);
		description.defenderAbility = defAbility;
	}

	defense = Math.max(1, pokeRound(defense * chainMods(dfMods) / 0x1000));

	////////////////////////////////
	//////////// DAMAGE ////////////
	////////////////////////////////
	var baseDamage = getBaseDamage(attacker.level, basePower, attack, defense);
	if (field.format !== "Singles" && move.isSpread) {
		baseDamage = pokeRound(baseDamage * 0xC00 / 0x1000);
	}
	if ((field.weather.indexOf("Sun") !== -1 && move.type === "Fire") || (field.weather.indexOf("Rain") !== -1 && move.type === "Water")) {
		baseDamage = pokeRound(baseDamage * 0x1800 / 0x1000);
		description.weather = field.weather;
	} else if ((field.weather === "Sun" && move.type === "Water") || (field.weather === "Rain" && move.type === "Fire")) {
		baseDamage = pokeRound(baseDamage * 0x800 / 0x1000);
		description.weather = field.weather;
	} else if ((field.weather === "Harsh Sunshine" && move.type === "Water") || (field.weather === "Heavy Rain" && move.type === "Fire")) {
		return {"damage": [0], "description": buildDescription(description)};
	}
	if (isGroundedForCalc(attacker, field)) {
		if (field.terrain === "Electric" && move.type === "Electric") {
			baseDamage = pokeRound(baseDamage * 0x1800 / 0x1000);
			description.terrain = field.terrain;
		} else if (field.terrain === "Grassy" && move.type === "Grass") {
			baseDamage = pokeRound(baseDamage * 0x1800 / 0x1000);
			description.terrain = field.terrain;
		} else if (field.terrain === "Psychic" && move.type === "Psychic") {
			baseDamage = pokeRound(baseDamage * 0x1800 / 0x1000);
			description.terrain = field.terrain;
		}
	}
	if (isGroundedForCalc(defender, field)) {
		if (field.terrain === "Misty" && move.type === "Dragon") {
			baseDamage = pokeRound(baseDamage * 0x800 / 0x1000);
			description.terrain = field.terrain;
		} else if (field.terrain === "Grassy" && ["Bulldoze", "Earthquake"].indexOf(move.name) !== -1) {
			baseDamage = pokeRound(baseDamage * 0x800 / 0x1000);
			description.terrain = field.terrain;
		}
	}
	if (hasTerrainSeed(defender) && field.terrain === defender.item.substring(0, defender.item.indexOf(" ")) && seedBoostedStat[defender.item] === defenseStat) {
		// Last condition applies so the calc doesn't show a seed where it wouldn't affect the outcome (like Grassy Seed when being hit by a special move)
		description.defenderItem = defender.item;
	}
	if (isCritical) {
		baseDamage = Math.floor(baseDamage * (gen >= 6 ? 1.5 : 2));
		description.isCritical = isCritical;
	}
	// the random factor is applied between the crit mod and the stab mod, so don't apply anything below this until we're inside the loop
	var stabMod = 0x1000;
	if (isSTAB) {
		if (attacker.ability === "Adaptability") {
			stabMod = 0x2000;
			description.attackerAbility = attacker.ability;
		} else {
			stabMod = 0x1800;
		}
	} else if (attacker.ability === "Protean") {
		stabMod = 0x1800;
		description.attackerAbility = attacker.ability;
	}
	var applyBurn = (attacker.status === "Burned" && move.category === "Physical" && attacker.ability !== "Guts" && !move.ignoresBurn);
	description.isBurned = applyBurn;
	var finalMods = [];
	if (field.isReflect && move.category === "Physical" && !isCritical && !field.isAuroraVeil) { //doesn't stack with Aurora Veil
		finalMods.push(field.format !== "Singles" ? (gen >= 6 ? 0xAAC : 0xA8F) : 0x800);
		description.isReflect = true;
	} else if (field.isLightScreen && move.category === "Special" && !isCritical) {
		finalMods.push(field.format !== "Singles" ? (gen >= 6 ? 0xAAC : 0xA8F) : 0x800);
		description.isLightScreen = true;
	}
	if (["Multiscale", "Shadow Shield"].indexOf(defender.ability) !== -1 && defender.curHP === defender.maxHP && !field.isSR && (!field.spikes || defender.hasType("Flying"))) {
		finalMods.push(0x800);
		description.defenderAbility = defender.ability;
	}
	if (attacker.ability === "Tinted Lens" && typeEffectiveness < 1) {
		finalMods.push(0x2000);
		description.attackerAbility = attacker.ability;
	}
	if (attacker.ability === "Water Bubble" && move.type === "Water") {
		finalMods.push(0x2000);
		description.attackerAbility = attacker.ability;
	}
	if (attacker.ability === "Steelworker" && move.type === "Steel") {
		finalMods.push(0x1800);
		description.attackerAbility = attacker.ability;
	}
	if (field.isFriendGuard) {
		finalMods.push(0xC00);
		description.isFriendGuard = true;
	}
	if (field.isAuroraVeil && !isCritical && !field.isReflect) { //doesn't protect from critical hits and doesn't stack with Reflect
		finalMods.push(field.format !== "Singles" ? 0xAAC : 0x800); // 0.5x damage from physical and special attacks in singles, 0.66x damage in Doubles
		description.isAuroraVeil = true;
	}
	if (attacker.ability === "Sniper" && isCritical) {
		finalMods.push(0x1800);
		description.attackerAbility = attacker.ability;
	}
	if (["Solid Rock", "Filter", "Prism Armor"].indexOf(defender.ability) !== -1 && typeEffectiveness > 1) {
		finalMods.push(0xC00);
		description.defenderAbility = defender.ability;
	}
	if (attacker.item === "Expert Belt" && typeEffectiveness > 1 && !move.isZ) {
		finalMods.push(0x1333);
		description.attackerItem = attacker.item;
	} else if (attacker.item === "Life Orb" && !move.isZ) {
		finalMods.push(0x14CC);
		description.attackerItem = attacker.item;
	}
	if (getBerryResistType(defender.item) === move.type && (typeEffectiveness > 1 || move.type === "Normal") &&
            attacker.ability !== "Unnerve") {
		finalMods.push(0x800);
		description.defenderItem = defender.item;
	}
	if (field.isProtected && move.isZ) {
		if (attacker.item.indexOf(" Z") !== -1) {
			finalMods.push(0x400);
			description.isProtected = true;
		} else {
			alert('Although only possible while hacking, Z-Moves fully damage through protect without a Z-Crystal');
		}
	}
	var finalMod = chainMods(finalMods);

	var damage = [];
	for (var i = 0; i < 16; i++) {
		damage[i] = getFinalDamage(baseDamage, i, typeEffectiveness, applyBurn, stabMod, finalMod);
		// is 2nd hit half BP? half attack? half damage range? keeping it as a flat multiplier until I know the specifics
		if (attacker.ability === "Parental Bond" && move.hits === 1 && (field.format === "Singles" || !move.isSpread)) {
			var bondFactor = gen < 7 ? 3 / 2 : 5 / 4; // in gen 7, 2nd hit was reduced from 50% to 25%
			damage[i] = Math.floor(damage[i] * bondFactor);
			description.attackerAbility = attacker.ability;
		}
	}
	if (move.dropsStats && move.usedTimes > 1) {
		var simpleMultiplier = 1;
		if (attacker.ability === "Simple") {
			simpleMultiplier = 2;
		}
		description.moveTurns = 'over ' + move.usedTimes + ' turns';
		var hasWhiteHerb = attacker.item === "White Herb";
		var usedWhiteHerb = false;
		var dropCount = attacker.boosts[attackStat];
		for (var times = 0; times < move.usedTimes; times++) {
			var newAttack = getModifiedStat(attacker.rawStats[attackStat], dropCount);
			var damageMultiplier = 0;
			damage = damage.map(function (affectedAmount) {
				if (times) {
					var newBaseDamage = getBaseDamage(attacker.level, basePower, newAttack, defense);
					var newFinalDamage = getFinalDamage(newBaseDamage, damageMultiplier, typeEffectiveness, applyBurn, stabMod, finalMod);
					damageMultiplier++;
					return affectedAmount + newFinalDamage;
				}
				return affectedAmount;
			});
			if (attacker.ability === "Contrary") {
				dropCount = Math.min(6, dropCount + move.dropsStats);
				description.attackerAbility = attacker.ability;
			} else {
				dropCount = Math.max(-6, dropCount - (move.dropsStats * simpleMultiplier));
				if (attacker.ability === "Simple") {
					description.attackerAbility = attacker.ability;
				}
			}
			// the Pokémon hits THEN the stat rises / lowers
			if (hasWhiteHerb && attacker.boosts[attackStat] < 0 && !usedWhiteHerb) {
				dropCount += move.dropsStats * simpleMultiplier;
				usedWhiteHerb = true;
				description.attackerItem = attacker.item;
			}
		}
	}
	if (attacker.item === "Metronome" && move.metronomeCount > 1) {
		var boostTurns;
		if (move.dropsStats) {
			boostTurns = move.usedTimes;
		} else {
			boostTurns = move.metronomeCount;
		}
		for (metronome = 0; metronome < boostTurns; metronome++) {
			var totalMetronomeBoost = 1 + metronome / 10;
			damage = damage.map(function (damageRoll) {
				return pokeRound(damageRoll * totalMetronomeBoost);
			});
		}
		description.attackerItem = "Metronome";
	}
	description.attackBoost = attacker.boosts[attackStat];
	return {"damage": damage, "description": buildDescription(description)};
}

function toSmogonStat(stat) {
	return stat === AT ? "Atk" :
		stat === DF ? "Def" :
			stat === SA ? "SpA" :
				stat === SD ? "SpD" :
					stat === SP ? "Spe" :
						"wtf";
}

function chainMods(mods) {
	var M = 0x1000;
	for (var i = 0; i < mods.length; i++) {
		if (mods[i] !== 0x1000) {
			M = ((M * mods[i]) + 0x800) >> 12;
		}
	}
	return M;
}

function getMoveEffectiveness(move, type, isGhostRevealed, isGravity) {
	if (isGhostRevealed && type === "Ghost" && ["Normal", "Fighting"].indexOf(move.type) !== -1) {
		return 1;
	} else if (isGravity && type === "Flying" && move.type === "Ground") {
		return 1;
	} else if (move.name === "Freeze-Dry" && type === "Water") {
		return 2;
	} else if (move.name === "Flying Press") {
		return typeChart["Fighting"][type] * typeChart["Flying"][type];
	} else {
		return typeChart[move.type][type];
	}
}

function getModifiedStat(stat, mod) {
	return mod > 0 ? Math.floor(stat * (2 + mod) / 2) :
		mod < 0 ? Math.floor(stat * 2 / (2 - mod)) :
			stat;
}

function getFinalSpeed(pokemon, weather) {
	var speed = getModifiedStat(pokemon.rawStats[SP], pokemon.boosts[SP]);
	if (pokemon.item === "Choice Scarf") {
		speed = Math.floor(speed * 1.5);
	} else if (["Macho Brace", "Iron Ball"].indexOf(pokemon.item) !== -1) {
		speed = Math.floor(speed / 2);
	}
	if ((pokemon.ability === "Chlorophyll" && weather.indexOf("Sun") !== -1) ||
            (pokemon.ability === "Sand Rush" && weather === "Sand") ||
            (pokemon.ability === "Swift Swim" && weather.indexOf("Rain") !== -1) ||
            (pokemon.ability === "Slush Rush" && weather === "Hail")) {
		speed *= 2;
	}
	return speed;
}

function checkAirLock(pokemon, field) {
	if (["Air Lock", "Cloud Nine"].indexOf(pokemon.ability) !== -1) {
		field.clearWeather();
	}
}

function checkForecast(pokemon, weather) {
	if (pokemon.ability === "Forecast" && pokemon.name === "Castform") {
		switch (weather) {
		case "Sun":
		case "Harsh Sunlight":
			pokemon.type1 = "Fire";
			break;
		case "Rain":
		case "Heavy Rain":
			pokemon.type1 = "Water";
			break;
		case "Hail":
			pokemon.type1 = "Ice";
			break;
		default:
			pokemon.type1 = "Normal";
		}
		pokemon.type2 = "";
	}
}

function checkKlutz(pokemon) {
	if (pokemon.ability === "Klutz") {
		pokemon.item = "";
	}
}

function checkIntimidate(source, target) {
	if (source.ability === "Intimidate" && ["Clear Body", "White Smoke", "Hyper Cutter", "Full Metal Body"].indexOf(target.ability) === -1) {
		if (["Contrary", "Defiant"].indexOf(target.ability) !== -1) {
			target.boosts[AT] = Math.min(6, target.boosts[AT] + 1);
		} else if (target.ability === "Simple") {
			target.boosts[AT] = Math.max(-6, target.boosts[AT] - 2);
		} else {
			target.boosts[AT] = Math.max(-6, target.boosts[AT] - 1);
		}
	}
}

function checkStatBoost(p1, p2) {
	if ($('#StatBoostL').prop("checked")) {
		for (stat in p1.boosts) {
			p1.boosts[stat] = Math.min(6, p1.boosts[stat] + 1);
		}
	}
	if ($('#StatBoostR').prop("checked")) {
		for (stat in p2.boosts) {
			p2.boosts[stat] = Math.min(6, p2.boosts[stat] + 1);
		}
	}
}

function checkDownload(source, target) {
	if (source.ability === "Download") {
		if (target.stats[SD] <= target.stats[DF]) {
			source.boosts[SA] = Math.min(6, source.boosts[SA] + 1);
		} else {
			source.boosts[AT] = Math.min(6, source.boosts[AT] + 1);
		}
	}
}

function checkSeedBoost(pokemon, field) {
	var mappedField = field.getSide();
	if (mappedField.terrain && pokemon.item.indexOf("Seed") !== -1) {
		var terrainSeed = pokemon.item.substring(0, pokemon.item.indexOf(" "));
		if (terrainSeed === mappedField.terrain) {
			if (terrainSeed === "Grassy" || terrainSeed === "Electric") {
				pokemon.boosts[DF] = pokemon.ability === "Contrary" ? Math.max(-6, pokemon.boosts[DF] - 1) : Math.min(6, pokemon.boosts[DF] + 1);
			} else {
				pokemon.boosts[SD] = pokemon.ability === "Contrary" ? Math.max(-6, pokemon.boosts[SD] - 1) : Math.min(6, pokemon.boosts[SD] + 1);
			}
		}
	}
}

function hasTerrainSeed(pokemon) {
	return ["Electric Seed", "Misty Seed", "Grassy Seed", "Psychic Seed"].indexOf(pokemon.item) !== -1;
}

function checkInfiltrator(attacker, affectedSide) {
	if (attacker.ability === "Infiltrator") {
		affectedSide.isReflect = false;
		affectedSide.isLightScreen = false;
		affectedSide.isAuroraVeil = false;
	}
}

function countBoosts(boosts) {
	var sum = 0;
	for (var i = 0; i < STATS.length; i++) {
		if (boosts[STATS[i]] > 0) {
			sum += boosts[STATS[i]];
		}
	}
	return sum;
}

function isGroundedForCalc(pokemon, field) {
	return field.isGravity || (
		!pokemon.hasType("Flying") &&
        pokemon.ability !== "Levitate" &&
        pokemon.item !== "Air Balloon"
	);
}

function hasMegaStone(pokemon) {
	return mega_Stones.indexOf(pokemon.item) !== -1;
}

// GameFreak rounds DOWN on .5
function pokeRound(num) {
	return (num % 1 > 0.5) ? Math.ceil(num) : Math.floor(num);
}

function getBaseDamage(level, basePower, attack, defense) {
	return Math.floor(Math.floor((Math.floor((2 * level) / 5 + 2) * basePower * attack) / defense) / 50 + 2);
}

function getFinalDamage(baseAmount, i, effectiveness, isBurned, stabMod, finalMod) {
	var damageAmount = Math.floor(
		pokeRound(Math.floor(baseAmount * (85 + i) / 100) * stabMod / 0x1000) * effectiveness
	);
	if (isBurned) {
		damageAmount = Math.floor(damageAmount / 2);
	}
	return pokeRound(Math.max(1, damageAmount * finalMod / 0x1000));
}
