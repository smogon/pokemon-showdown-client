var gen = 100, genWasChanged, notation, pokedex, setdex, typeChart, moves;
var abilities, items, STATS, calcHP, calcStat, calculateAllMoves, damageResults;
var resultLocations = [[], []];

function calculate(room, pokemonDefender, moveName) {
	if (room === "" || pokemonDefender === "")
		return null;
	//TODO tell which pokemon from entire party is best
	var allPokemon = room.myPokemon;
	var pokemonAttacker = undefined;
	for (var i = 0; i < allPokemon.length; i++)
		if (allPokemon[i].active) {
			pokemonAttacker = allPokemon[i];
			break;
		}
	//TODO fix double battles
	//your pokemon
	pokemonAttacker.boosts = room.battle.p2.active[0].boosts;
	this.attacker = new POKEMONValue(pokemonAttacker);
	//opponent pokemon
	pokemonDefender.boosts = room.battle.p1.active[0].boosts;
	this.defender = new POKEMONValue(pokemonDefender.active[0]);
	var damage = calculateDamage(this.attacker, this.defender);
	var d = 0;
	var ar = damage[0];
	//TODO convert to percentages; this.defender.maxHP*this.defender.hp/100
	//TODO change defenders levels and moves, ect when it becomes available
	//TODO ranges based on stat changes like swords dance
	for (var i = 0; i < ar.length; i++)
		if (ar[i].description.includes(moveName)) {
			d = "(" + ar[i].damageText.replace(/ (.*)/, "") + ")";
			break;
		}
	if (d === 0)
		return "";
	return d;
}

function POKEMONValue(pMon) {
	setGeneration(gen);
	this.mon = pMon;
	this.name = pMon.species;
	this.set = setdex[this.name];
	this.pokemon = pokedex[this.name];
	this.gravity = false;
	this.ability = pMon.ability;
	this.abilities = pMon.abilities;
	this.item = pMon.item;
	this.gender = pMon.gender;
	this.level = pMon.level;
	this.hp = pMon.hp;
	this.moves = pMon.moves;
	this.stats = pMon.stats;
	this.boosts = pMon.boosts;
	if (this.boosts !== undefined)
		for (var key in this.boosts)
			this.boosts[key.substr(0, 2)] = this.boosts[key];
	this.getPossibleAbilities = function () {
		if (this.ability !== undefined || this.ability !== "")
			return [this.ability];
		if (this.abilities !== undefined || this.abilities !== [])
			return abilities;
		var abilities = [];
		for (var i = 0; i < this.set.size(); i++)
			abilities.push(this.set["ability"]);
		return abilities;
	};

	this.getPossibleItems = function () {
		if (this.item !== undefined || this.item === "")
			return [this.item];
		var items = [];
		for (var i = 0; i < this.set.size(); i++)
			items.push(this.set["item"]);
		return items;
	};

	this.isGrounded = function () {
		return this.gravity ||
			this.pokemon["t1"] !== "Flying" &&
			this.pokemon["t2"] !== "Flying" &&
			this.getPossibleAbilities().indexOf("Levitate") === -1;
	};

	// var setName = pokeInfo.substring(pokeInfo.indexOf("(") + 1, pokeInfo.lastIndexOf(")"));
	this.type1 = this.pokemon.t1;
	this.type2 = (this.pokemon.t2 && typeof this.pokemon.t2 !== "undefined") ? this.pokemon.t2 : "";
	this.rawStats = [];
	this.stats = [];
	this.evs = [];
	this.curSet = this.set[Object.keys(this.set)[0]];

	this.HPEVs = (this.curSet.evs && typeof this.curSet.evs.hp !== "undefined") ? this.curSet.evs.hp : 0;
	if (gen < 3) {
		var HPDVs = 15;
		this.maxHP = ~~(((this.pokemon.bs.hp + HPDVs) * 2 + 63) * this.level / 100) + this.level + 10;
	} else if (this.pokemon.bs.hp === 1) {
		this.maxHP = 1;
	} else {
		var HPIVs = 31;
		this.maxHP = ~~((this.pokemon.bs.hp * 2 + HPIVs + ~~(this.HPEVs / 4)) * this.level / 100) + this.level + 10;
	}
	this.curHP = this.maxHP;
	this.nature = this.curSet.nature;
	for (var i = 0; i < STATS.length; i++) {
		var stat = STATS[i];
		if (this.boosts[stat] == undefined)
			this.boosts[stat] = 0;
		this.evs[stat] = (this.curSet.evs && typeof this.curSet.evs[stat] !== "undefined") ? this.curSet.evs[stat] : 0;
		if (gen < 3) {
			var dvs = 15;
			this.rawStats[stat] = ~~(((this.pokemon.bs[stat] + dvs) * 2 + 63) * this.level / 100) + 5;
		} else {
			var ivs = (this.curSet.ivs && typeof this.curSet.ivs[stat] !== "undefined") ? this.curSet.ivs[stat] : 31;
			var natureMods = NATURES[this.nature];
			var nature = natureMods[0] === stat ? 1.1 : natureMods[1] === stat ? 0.9 : 1;
			this.rawStats[stat] = ~~((~~((this.pokemon.bs[stat] * 2 + ivs + ~~(this.evs[stat] / 4)) * this.level / 100) + 5) * nature);
		}
	}
	this.ability = (this.curSet.ability && typeof this.curSet.ability !== "undefined") ? this.curSet.ability :
		(this.pokemon.ab && typeof this.pokemon.ab !== "undefined") ? this.pokemon.ab : "";
	this.item = (this.curSet.item && typeof this.curSet.item !== "undefined" && (this.curSet.item === "Eviolite" || this.curSet.item.indexOf("ite") < 0)) ? this.curSet.item : "";
	this.status = "Healthy";
	this.toxicCounter = 0;
	this.mymoves = [];
	for (var i = 0; i < 4; i++) {
		var moveName = this.curSet.moves[i];
		if (this.moves !== undefined && this.moves.length !== 0)
			moveName = Tools.getMove(this.moves[i]).name;
		var defaultDetails = moves[moveName] || moves['(No Move)'];
		this.mymoves.push($.extend({}, defaultDetails, {
			name: (defaultDetails.bp === 0) ? "(No Move)" : moveName,
			bp: defaultDetails.bp,
			type: defaultDetails.type,
			category: defaultDetails.category,
			isCrit: !!defaultDetails.alwaysCrit,
			hits: defaultDetails.isMultiHit ? ((this.ability === "Skill Link" || this.item === "Grip Claw") ? 5 : 3) : defaultDetails.isTwoHit ? 2 : 1,
			usedTimes: defaultDetails.usedTimes
		}));
		this.weight = this.pokemon.w;
		this.gender = this.pokemon.gender ? "genderless" : "Male";


		function calcStats(poke) {
			for (var i = 0; i < STATS.length; i++) {
				calcStat(poke, STATS[i]);
			}
		}

		function calcCurrentHP(max, percent) {
			return Math.ceil(percent * max / 100);
		}

		function calcPercentHP(max, current) {
			return Math.floor(100 * current / max);
		}

		this.hasType = function (type) {
			return this.type1 === type || this.type2 === type;
		};
	}
}
function calculateDamage(pokemonLeft, pokemonRight) {
	var p1 = pokemonLeft;//new Pokemon($("#p1"));
	var p2 = pokemonRight;//new Pokemon($("#p2"));
	var battling = [p1, p2];
	p1.maxDamages = [];
	p2.maxDamages = [];
	var field = new Field();
	damageResults = calculateAllMoves(p1, p2, field);
	var fastestSide = p1.stats[SP] > p2.stats[SP] ? 0 : p1.stats[SP] === p2.stats[SP] ? "tie" : 1;
	var result, minDamage, maxDamage, minDisplay, maxDisplay;
	var highestDamage = -1;
	var bestResult;
	for (var i = 0; i < 4; i++) {
		result = damageResults[0][i];
		minDamage = result.damage[0] * p1.mymoves[i].hits;
		maxDamage = result.damage[result.damage.length - 1] * p1.mymoves[i].hits;
		p1.maxDamages.push({
			moveOrder : i,
			maxDamage : maxDamage
		});
		p1.maxDamages.sort(function (firstMove, secondMove) {
			return secondMove.maxDamage - firstMove.maxDamage;
		});
		minDisplay = notation === '%' ? Math.floor(minDamage * 1000 / p2.maxHP) / 10 : Math.floor(minDamage * 48 / p2.maxHP);
		maxDisplay = notation === '%' ? Math.floor(maxDamage * 1000 / p2.maxHP) / 10 : Math.floor(maxDamage * 48 / p2.maxHP);
		result.damageText = minDamage + "-" + maxDamage + " (" + minDisplay + " - " + maxDisplay + notation + ")";
		result.koChanceText = p1.mymoves[i].bp === 0 ? 'nice move' :
			getKOChanceText(result.damage, p1, p2, field.getSide(1), p1.mymoves[i], p1.mymoves[i].hits, p1.ability === 'Bad Dreams');
		var recoveryText = '';
		if (p1.mymoves[i].givesHealth) {
			var minHealthRecovered = notation === '%' ? Math.floor(minDamage * p1.mymoves[i].percentHealed * 1000 / p1.maxHP) /
			10 : Math.floor(minDamage * p1.mymoves[i].percentHealed * 48 / p1.maxHP);
			var maxHealthRecovered = notation === '%' ? Math.floor(maxDamage * p1.mymoves[i].percentHealed * 1000 / p1.maxHP) /
			10 : Math.floor(maxDamage * p1.mymoves[i].percentHealed * 48 / p1.maxHP);
			if (minHealthRecovered > 100 && notation === '%') {
				minHealthRecovered = Math.floor(p2.maxHP * p1.mymoves[i].percentHealed * 1000 / p1.maxHP) / 10;
				maxHealthRecovered = Math.floor(p2.maxHP * p1.mymoves[i].percentHealed * 1000 / p1.maxHP) / 10;
			} else if (notation !== '%' && minHealthRecovered > 48) {
				minHealthRecovered = Math.floor(p2.maxHP * p1.mymoves[i].percentHealed * 48 / p1.maxHP);
				maxHealthRecovered = Math.floor(p2.maxHP * p1.mymoves[i].percentHealed * 48 / p1.maxHP);
			}
			recoveryText = ' (' + minHealthRecovered + ' - ' + maxHealthRecovered + notation + ' recovered)';
		}
		var recoilText = '';
		if (typeof p1.mymoves[i].hasRecoil === 'number') {
			var damageOverflow = minDamage > p2.curHP || maxDamage > p2.curHP;
			var minRecoilDamage = notation === '%' ? Math.floor(Math.min(minDamage, p2.curHP) * p1.mymoves[i].hasRecoil * 10 / p1.maxHP) / 10 :
				Math.floor(Math.min(minDamage, p2.curHP) * p1.mymoves[i].hasRecoil * 0.48 / p1.maxHP);
			var maxRecoilDamage = notation === '%' ? Math.floor(Math.min(maxDamage, p2.curHP) * p1.mymoves[i].hasRecoil * 10 / p1.maxHP) / 10 :
				Math.floor(Math.min(maxDamage, p2.curHP) * p1.mymoves[i].hasRecoil * 0.48 / p1.maxHP);
			if (damageOverflow) {
				minRecoilDamage = notation === '%' ? Math.floor(p2.curHP * p1.mymoves[i].hasRecoil * 10 / p1.maxHP) / 10 :
					Math.floor(p2.maxHP * p1.mymoves[i].hasRecoil * 0.48 / p1.maxHP);
				maxRecoilDamage = notation === '%' ? Math.floor(p2.curHP * p1.mymoves[i].hasRecoil * 10 / p1.maxHP) / 10 :
					Math.floor(p2.curHP * p1.mymoves[i].hasRecoil * 0.48 / p1.maxHP);
			}
			recoilText = ' (' + minRecoilDamage + ' - ' + maxRecoilDamage + notation + ' recoil damage)';
		} else if (p1.mymoves[i].hasRecoil === 'crash') {
			var genMultiplier = gen === 2 ? 12.5 : gen >= 3 ? 50 : 1;
			var gen4CrashDamage = Math.floor(p2.maxHP * 0.5 / p1.maxHP * 100);
			var minRecoilDamage = notation === '%' ? Math.floor(Math.min(minDamage, p2.maxHP) * genMultiplier * 10 / p1.maxHP) / 10 :
				Math.floor(Math.min(minDamage, p2.maxHP) * genMultiplier * 0.48 / p1.maxHP);
			var maxRecoilDamage = notation === '%' ? Math.floor(Math.min(maxDamage, p2.maxHP) * genMultiplier * 10 / p1.maxHP) / 10 :
				Math.floor(Math.min(maxDamage, p2.maxHP) * genMultiplier * 0.48 / p1.maxHP);
			if (damageOverflow && gen !== 2) {
				minRecoilDamage = notation === '%' ? Math.floor(p2.curHP * genMultiplier * 10 / p1.maxHP) / 10 :
					Math.floor(p2.curHP * genMultiplier * 0.48 / p1.maxHP);
				maxRecoilDamage = notation === '%' ? Math.floor(p2.maxHP * genMultiplier * 10 / p1.maxHP) / 10 :
					Math.floor(Math.min(p2.maxHP, p1.maxHP) * genMultiplier * 0.48);
			}
			recoilText = gen === 1 ? ' (1hp damage on miss)' :
				gen === 2 ? (p2.type1 === "Ghost" || p2.type2 === "Ghost") ? ' (no crash damage on Ghost types)' : ' (' + minRecoilDamage + ' - ' + maxRecoilDamage + notation + ' crash damage on miss)' :
					gen === 3 ? (p2.type1 === "Ghost" || p2.type2 === "Ghost") ? ' (no crash damage on Ghost types)' : ' (' + minRecoilDamage + ' - ' + maxRecoilDamage + notation + ' crash damage on miss)' :
						gen === 4 ? (p2.type1 === "Ghost" || p2.type2 === "Ghost") ? ' (' + gen4CrashDamage + '% crash damage)' : ' (' + minRecoilDamage + ' - ' + maxRecoilDamage + notation + ' crash damage on miss)' :
							gen > 4 ? ' (50% crash damage)' :
								'';
		} else if (p1.mymoves[i].hasRecoil === 'Struggle') {
			recoilText = ' (25% struggle damage)';
		} else if (p1.mymoves[i].hasRecoil) {
			recoilText = ' (50% recoil damage)';
		}
		resultLocations[0][i] = {};
		if (p1.mymoves[i].name !== undefined)
			resultLocations[0][i].move = p1.mymoves[i].name.replace("Hidden Power", "HP");
		resultLocations[0][i].damage = minDisplay + " - " + maxDisplay + notation + recoveryText + recoilText;

		result = damageResults[1][i];
		var recoveryText = '';
		minDamage = result.damage[0] * p2.mymoves[i].hits;
		maxDamage = result.damage[result.damage.length - 1] * p2.mymoves[i].hits;
		p2.maxDamages.push({
			moveOrder : i,
			maxDamage : maxDamage
		});
		p2.maxDamages.sort(function (firstMove, secondMove) {
			return secondMove.maxDamage - firstMove.maxDamage;
		});
		minDisplay = notation === '%' ? Math.floor(minDamage * 1000 / p1.maxHP) / 10 : Math.floor(minDamage * 48 / p1.maxHP);
		maxDisplay = notation === '%' ? Math.floor(maxDamage * 1000 / p1.maxHP) / 10 : Math.floor(maxDamage * 48 / p1.maxHP);
		result.damageText = minDamage + "-" + maxDamage + " (" + minDisplay + " - " + maxDisplay + notation + ")";
		result.koChanceText = p2.mymoves[i].bp === 0 ? 'nice move' :
			getKOChanceText(result.damage, p2, p1, field.getSide(0), p2.mymoves[i], p2.mymoves[i].hits, p2.ability === 'Bad Dreams');
		if (p2.mymoves[i].givesHealth) {
			var minHealthRecovered = notation === '%' ? Math.floor(minDamage * p2.mymoves[i].percentHealed * 1000 / p2.maxHP) /
			10 : Math.floor(minDamage * p2.mymoves[i].percentHealed * 48 / p2.maxHP);
			var maxHealthRecovered = notation === '%' ? Math.floor(maxDamage * p2.mymoves[i].percentHealed * 1000 / p2.maxHP) /
			10 : Math.floor(maxDamage * p2.mymoves[i].percentHealed * 48 / p2.maxHP);
			if (minHealthRecovered > 100 && notation === '%') {
				minHealthRecovered = Math.floor(p1.maxHP * p2.mymoves[i].percentHealed * 1000 / p2.maxHP) / 10;
				maxHealthRecovered = Math.floor(p1.maxHP * p2.mymoves[i].percentHealed * 1000 / p2.maxHP) / 10;
			} else if (notation !== '%' && minHealthRecovered > 48) {
				minHealthRecovered = Math.floor(p1.maxHP * p2.mymoves[i].percentHealed * 48 / p2.maxHP);
				maxHealthRecovered = Math.floor(p1.maxHP * p2.mymoves[i].percentHealed * 48 / p2.maxHP);
			}
			recoveryText = ' (' + minHealthRecovered + ' - ' + maxHealthRecovered + notation + ' recovered)';
		}
		var recoilText = '';
		if (typeof p2.mymoves[i].hasRecoil === 'number') {
			var damageOverflow = minDamage > p1.curHP || maxDamage > p1.curHP;
			var minRecoilDamage = notation === '%' ? Math.floor(Math.min(minDamage, p1.curHP) * p2.mymoves[i].hasRecoil * 10 / p2.maxHP) / 10 :
				Math.floor(Math.min(minDamage, p1.curHP) * p2.mymoves[i].hasRecoil * 0.48 / p2.maxHP);
			var maxRecoilDamage = notation === '%' ? Math.floor(Math.min(maxDamage, p1.maxHP) * p2.mymoves[i].hasRecoil * 10 / p2.maxHP) / 10 :
				Math.floor(Math.min(maxDamage, p1.curHP) * p2.mymoves[i].hasRecoil * 0.48 / p2.maxHP);
			if (damageOverflow) {
				minRecoilDamage = notation === '%' ? Math.floor(Math.min(p1.maxHP * p2.mymoves[i].hasRecoil) * 10 / p2.maxHP) / 10 :
					Math.floor(p1.maxHP * p2.mymoves[i].recoilPercentage * 0.48 / p1.maxHP);
				maxRecoilDamage = notation === '%' ? Math.floor(Math.min(p1.maxHP, p2.mymoves[i].hasRecoil) * 10 / p2.maxHP) / 10 :
					Math.floor(Math.min(p1.maxHP, p2.mymoves[i].hasRecoil) * 0.48 / p2.maxHP);
			}
			recoilText = ' (' + minRecoilDamage + ' - ' + maxRecoilDamage + notation + ' recoil damage)';
		} else if (p2.mymoves[i].hasRecoil === 'crash') {
			var genMultiplier = gen === 2 ? 12.5 : gen >= 3 ? 50 : 1;
			var gen4CrashDamage = Math.floor(p2.maxHP * 0.5 / p1.maxHP * 100);
			var minRecoilDamage = notation === '%' ? Math.floor(Math.min(minDamage, p1.maxHP) * genMultiplier * 10 / p2.maxHP) / 10 :
				Math.floor(Math.min(minDamage, p1.maxHP) * 0.48 / p2.maxHP);
			var maxRecoilDamage = notation === '%' ? Math.floor(Math.min(maxDamage, p1.maxHP) * genMultiplier * 10 / p2.maxHP) / 10 :
				Math.floor(Math.min(maxDamage, p1.maxHP) * 0.48 / p2.maxHP);
			if (damageOverflow && gen !== 2) {
				minRecoilDamage = notation === '%' ? Math.floor(Math.min(p1.maxHP, genMultiplier) * 10 / p2.maxHP) / 10 :
					Math.floor(Math.min(p1.maxHP, p1.maxHP) * genMultiplier * 0.48);
				maxRecoilDamage = notation === '%' ? Math.floor(Math.min(p1.maxHP, genMultiplier) * 10 / p2.maxHP) / 10 :
					Math.floor(Math.min(p1.maxHP, p2.maxHP) * genMultiplier * 0.48);
			}
			recoilText = gen === 1 ? ' (1hp damage on miss)' :
				gen === 2 ? (p1.type1 === "Ghost" || p1.type2 === "Ghost") ? ' (no crash damage on Ghost types)' : ' (' + minRecoilDamage + ' - ' + maxRecoilDamage + notation + ' crash damage on miss)' :
					gen === 3 ? (p1.type1 === "Ghost" || p1.type2 === "Ghost") ? ' (no crash damage on Ghost types)' : ' (' + minRecoilDamage + ' - ' + maxRecoilDamage + notation + ' crash damage on miss)' :
						gen === 4 ? (p1.type1 === "Ghost" || p1.type2 === "Ghost") ? ' (' + gen4CrashDamage + '% crash damage)' : ' (' + minRecoilDamage + ' - ' + maxRecoilDamage + notation + ' crash damage on miss)' :
							gen > 4 ? ' (50% crash damage)' :
								'';
		} else if (p2.mymoves[i].hasRecoil === 'Struggle') {
			recoilText = ' (25% struggle damage)';
		} else if (p2.mymoves[i].hasRecoil) {
			recoilText = ' (50% recoil damage)';
		}
		var bestMove;
		resultLocations[1][i] = {};
		resultLocations[1][i].move = p2.mymoves[i].name.replace("Hidden Power", "HP");
		resultLocations[1][i].damage = minDisplay + " - " + maxDisplay + notation + recoveryText + recoilText;
		if (fastestSide === "tie") {
			battling.sort(function () {
				return 0.5 - Math.random();
			});
			bestMove = battling[0].maxDamages[0].moveOrder;
			var chosenPokemon = battling[0] === p1 ? "0" : "1";
			bestResult = resultLocations[chosenPokemon][bestMove].move;
		} else {
			bestMove = battling[fastestSide].maxDamages[0].moveOrder;
			bestResult = resultLocations[fastestSide][bestMove].move;
		}
	}
	// bestResult.prop("checked", true);
	// bestResult.change();
	// $("#resultHeaderL").text(p1.name + "'s Moves (select one to show detailed results)");
	// $("#resultHeaderR").text(p2.name + "'s Moves (select one to show detailed results)");
	return damageResults;
}


function getZMoveName(moveName, moveType, item) {
	return moveName.indexOf("Hidden Power") !== -1 ? "Breakneck Blitz" : // Hidden Power will become Breakneck Blitz
		moveName === "Clanging Scales" && item === "Kommonium Z" ? "Clangorous Soulblaze" :
			moveName === "Darkest Lariat" && item === "Incinium Z" ? "Malicious Moonsault" :
				moveName === "Giga Impact" && item === "Snorlium Z" ? "Pulverizing Pancake" :
					moveName === "Moongeist Beam" && item === "Lunalium Z" ? "Menacing Moonraze Maelstrom" :
						moveName === "Photon Geyser" && item === "Ultranecrozium Z" ? "Light That Burns the Sky" :
							moveName === "Play Rough" && item === "Mimikium Z" ? "Let\'s Snuggle Forever" :
								moveName === "Psychic" && item === "Mewnium Z" ? "Genesis Supernova" :
									moveName === "Sparkling Aria" && item === "Primarium Z" ? "Oceanic Operetta" :
										moveName === "Spectral Thief" && item === "Marshadium Z" ? "Soul-Stealing 7-Star Strike" :
											moveName === "Spirit Shackle" && item === "Decidium Z" ? "Sinister Arrow Raid" :
												moveName === "Stone Edge" && item === "Lycanium Z" ? "Splintered Stormshards" :
													moveName === "Sunsteel Strike" && item === "Solganium Z" ? "Searing Sunraze Smash" :
														moveName === "Thunderbolt" && item === "Aloraichium Z" ? "Stoked Sparksurfer" :
															moveName === "Thunderbolt" && item === "Pikashunium Z" ? "10,000,000 Volt Thunderbolt" :
																moveName === "Volt Tackle" && item === "Pikanium Z" ? "Catastropika" :
																	moveName === "Nature\'s Madness" && item === "Tapunium Z" ? "Guardian of Alola" :
																		ZMOVES_TYPING[moveType];
}


function Field() {
	var format = false;//$("input:radio[name='format']:checked").val();
	var isGravity = false;//$("#gravity").prop("checked");
	//stealth rocks left, right
	var isSR = [false, false];//[$("#srL").prop("checked"), $("#srR").prop("checked")];
	var weather;
	var spikes;
	if (gen === 2) {
		spikes = [0, 0];//[$("#gscSpikesL").prop("checked") ? 1 : 0, $("#gscSpikesR").prop("checked") ? 1 : 0];
		weather = [];//$("input:radio[name='gscWeather']:checked").val();
	} else {
		weather = [];//$("input:radio[name='weather']:checked").val();
		spikes = [false, false];//[~~$("input:radio[name='spikesL']:checked").val(), ~~$("input:radio[name='spikesR']:checked").val()];
	}
	var terrain = "";//($("input:checkbox[name='terrain']:checked").val()) ? $("input:checkbox[name='terrain']:checked").val() : "";
	var isReflect = [false, false];//[$("#reflectL").prop("checked"), $("#reflectR").prop("checked")];
	var isLightScreen = [false, false];//[$("#lightScreenL").prop("checked"), $("#lightScreenR").prop("checked")];
	var isProtected = [false, false];//[$("#protectL").prop("checked"), $("#protectR").prop("checked")];
	var isSeeded = [false, false];//[$("#leechSeedL").prop("checked"), $("#leechSeedR").prop("checked")];
	var isForesight = [false, false];//[$("#foresightL").prop("checked"), $("#foresightR").prop("checked")];
	var isHelpingHand = [false, false];//[$("#helpingHandR").prop("checked"), $("#helpingHandL").prop("checked")]; // affects attacks against opposite side
	var isFriendGuard = [false, false];//[$("#friendGuardL").prop("checked"), $("#friendGuardR").prop("checked")];
	var isAuroraVeil = [false, false];//[$("#auroraVeilL").prop("checked"), $("#auroraVeilR").prop("checked")];

	this.getWeather = function () {
		return weather;
	};
	this.clearWeather = function () {
		weather = "";
	};
	this.getSide = function (i) {
		return new Sider(format, terrain, weather, isGravity, isSR[i], spikes[i], isReflect[i], isLightScreen[i], isProtected[i], isSeeded[1 - i], isSeeded[i], isForesight[i], isHelpingHand[i], isFriendGuard[i], isAuroraVeil[i]);
	};
}


function Sider(format, terrain, weather, isGravity, isSR, spikes, isReflect, isLightScreen, isProtected, isAttackerSeeded, isDefenderSeeded, isForesight, isHelpingHand, isFriendGuard, isAuroraVeil) {
	this.format = format;
	this.terrain = terrain;
	this.weather = weather;
	this.isGravity = isGravity;
	this.isSR = isSR;
	this.spikes = spikes;
	this.isReflect = isReflect;
	this.isLightScreen = isLightScreen;
	this.isProtected = isProtected;
	this.isAttackerSeeded = isAttackerSeeded;
	this.isDefenderSeeded = isDefenderSeeded;
	this.isForesight = isForesight;
	this.isHelpingHand = isHelpingHand;
	this.isFriendGuard = isFriendGuard;
	this.isAuroraVeil = isAuroraVeil;
}

function setGenerationMoves(gen) {
	switch (gen) {
	case 1:
		calculateAllMoves = CALCULATE_ALL_MOVES_RBY;
		break;
	case 2:
		calculateAllMoves = CALCULATE_ALL_MOVES_GSC;
		break;
	case 3:
		calculateAllMoves = CALCULATE_ALL_MOVES_ADV;
		break;
	case 4:
		calculateAllMoves = CALCULATE_ALL_MOVES_DPP;
		break;
	default:
		calculateAllMoves = CALCULATE_ALL_MOVES_BW;
		break;
	}
}

function setGeneration(gen) {
	genWasChanged = true;
	setGenerationMoves(gen);
	switch (gen) {
	case 1:
		pokedex = POKEDEX_RBY;
		setdex = SETDEX_RBY;
		typeChart = TYPE_CHART_RBY;
		moves = MOVES_RBY;
		items = [];
		abilities = [];
		STATS = STATS_RBY;
		calcHP = CALC_HP_RBY;
		calcStat = CALC_STAT_RBY;
		break;
	case 2:
		pokedex = POKEDEX_GSC;
		setdex = SETDEX_GSC;
		typeChart = TYPE_CHART_GSC;
		moves = MOVES_GSC;
		items = ITEMS_GSC;
		abilities = [];
		STATS = STATS_GSC;
		calcHP = CALC_HP_RBY;
		calcStat = CALC_STAT_RBY;
		break;
	case 3:
		pokedex = POKEDEX_ADV;
		setdex = SETDEX_ADV;
		typeChart = TYPE_CHART_GSC;
		moves = MOVES_ADV;
		items = ITEMS_ADV;
		abilities = ABILITIES_ADV;
		STATS = STATS_GSC;
		calcHP = CALC_HP_ADV;
		calcStat = CALC_STAT_ADV;
		break;
	case 4:
		pokedex = POKEDEX_DPP;
		setdex = SETDEX_DPP;
		typeChart = TYPE_CHART_GSC;
		moves = MOVES_DPP;
		items = ITEMS_DPP;
		abilities = ABILITIES_DPP;
		STATS = STATS_GSC;
		calcHP = CALC_HP_ADV;
		calcStat = CALC_STAT_ADV;
		break;
	case 5:
		pokedex = POKEDEX_BW;
		setdex = SETDEX_BW;
		typeChart = TYPE_CHART_GSC;
		moves = MOVES_BW;
		items = ITEMS_BW;
		abilities = ABILITIES_BW;
		STATS = STATS_GSC;
		calcHP = CALC_HP_ADV;
		calcStat = CALC_STAT_ADV;
		break;
	case 6:
		pokedex = POKEDEX_XY;
		setdex = SETDEX_XY;
		typeChart = TYPE_CHART_XY;
		moves = MOVES_XY;
		items = ITEMS_XY;
		abilities = ABILITIES_XY;
		STATS = STATS_GSC;
		calcHP = CALC_HP_ADV;
		calcStat = CALC_STAT_ADV;
		break;
	default:
		pokedex = POKEDEX_SM;
		setdex = SETDEX_SM;
		typeChart = TYPE_CHART_XY;
		moves = MOVES_SM;
		items = ITEMS_SM;
		abilities = ABILITIES_SM;
		STATS = STATS_GSC;
		calcHP = CALC_HP_ADV;
		calcStat = CALC_STAT_ADV;
	}
}
