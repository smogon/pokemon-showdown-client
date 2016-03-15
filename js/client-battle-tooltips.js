var BattleTooltips = (function () {

	// In addition to some static methods:
	//   BattleTooltips.tooltipAttrs()
	//   BattleTooltips.showTooltip()
	//   BattleTooltips.hideTooltip()
	// Most tooltips tend to involve a battle and/or room object
	function BattleTooltips(battle, room) {
		this.battle = battle;
		this.room = room;

		// tooltips
		var buf = '';
		var tooltips = {
			your2: {top: 70, left: 250, width: 80, height: 100},
			your1: {top: 85, left: 320, width: 90, height: 100},
			your0: {top: 90, left: 390, width: 100, height: 100},
			my0: {top: 200, left: 130, width: 120, height: 160},
			my1: {top: 200, left: 250, width: 150, height: 160},
			my2: {top: 200, left: 350, width: 150, height: 160}
		};
		for (var active in tooltips) {
			buf += '<div style="position:absolute;';
			for (var css in tooltips[active]) {
				buf += css + ':' + tooltips[active][css] + 'px;';
			}
			buf += '"' + this.tooltipAttrs(active, 'pokemon', true) + '></div>';
		}
		room.$foeHint.html(buf);
	}

	BattleTooltips.showTooltipFor = function (roomid, thing, type, elem, ownHeight) {
		app.rooms[roomid].tooltips.showTooltip(thing, type, elem, ownHeight);
	};
	BattleTooltips.hideTooltip = function () {
		$('#tooltipwrapper').html('');
	};

	// tooltips
	BattleTooltips.prototype.tooltipAttrs = function (thing, type, ownHeight) {
		var roomid = this.room.id;
		return ' onmouseover="BattleTooltips.showTooltipFor(\'' + roomid + '\', \'' + Tools.escapeHTML('' + thing, true) + '\',\'' + type + '\', this, ' + (ownHeight ? 'true' : 'false') + ')" ontouchstart="BattleTooltips.showTooltipFor(\'' + roomid + '\', \'' + Tools.escapeHTML('' + thing, true) + '\',\'' + type + '\', this, ' + (ownHeight ? 'true' : 'false') + ')" onmouseout="BattleTooltips.hideTooltip()" onmouseup="BattleTooltips.hideTooltip()"';
	};

	BattleTooltips.prototype.showTooltip = function (thing, type, elem, ownHeight) {
		var room = this.room;

		var text = '';
		switch (type) {
		case 'move':
			var move = Tools.getMove(thing);
			if (!move) return;
			text = this.showMoveTooltip(move);
			break;

		case 'pokemon':
			var side = room.battle[thing.slice(0, -1) + "Side"];
			var pokemon = side.active[thing.slice(-1)];
			if (!pokemon) return;
			/* falls through */
		case 'sidepokemon':
			var myPokemon;
			var isActive = (type === 'pokemon');
			if (room.myPokemon) {
				if (!pokemon) {
					myPokemon = room.myPokemon[parseInt(thing, 10)];
					pokemon = myPokemon;
				} else if (room.controlsShown && pokemon.side === room.battle.mySide) {
					// battlePokemon = pokemon;
					myPokemon = room.myPokemon[pokemon.slot];
				}
			}
			text = this.showPokemonTooltip(pokemon, myPokemon, isActive);
			break;
		}

		var offset = {
			left: 150,
			top: 500
		};
		if (elem) offset = $(elem).offset();
		var x = offset.left - 2;
		if (elem) {
			if (ownHeight) offset = $(elem).offset();
			else offset = $(elem).parent().offset();
		}
		var y = offset.top - 5;

		if (x > room.leftWidth + 335) x = room.leftWidth + 335;
		if (y < 140) y = 140;
		if (x > $(window).width() - 303) x = Math.max($(window).width() - 303, 0);

		if (!$('#tooltipwrapper').length) $(document.body).append('<div id="tooltipwrapper" onclick="$(\'#tooltipwrapper\').html(\'\');"></div>');
		$('#tooltipwrapper').css({
			left: x,
			top: y
		});
		$('#tooltipwrapper').html(text).appendTo(document.body);
		if (elem) {
			var height = $('#tooltipwrapper .tooltip').height();
			if (height > y) {
				y += height + 10;
				if (ownHeight) y += $(elem).height();
				else y += $(elem).parent().height();
				$('#tooltipwrapper').css('top', y);
			}
		}
	};

	BattleTooltips.prototype.hideTooltip = function () {
		BattleTooltips.hideTooltip();
	};

	BattleTooltips.prototype.showMoveTooltip = function (move) {
		var text = '';
		var basePower = move.basePower;
		var basePowerText = '';
		var additionalInfo = '';
		var yourActive = this.battle.yourSide.active;
		var pokemon = this.battle.mySide.active[this.room.choice.choices.length];
		var myPokemon = this.room.myPokemon[pokemon.slot];

		// Check if there are more than one active Pokémon to check for multiple possible BPs.
		if (yourActive.length > 1) {
			// We check if there is a difference in base powers to note it.
			// Otherwise, it is just shown as in singles.
			// The trick is that we need to calculate it first for each Pokémon to see if it changes.
			var previousBasepower = false;
			var difference = false;
			var basePowers = [];
			for (var i = 0; i < yourActive.length; i++) {
				if (!yourActive[i]) continue;
				basePower = this.getMoveBasePower(move, pokemon, yourActive[i]);
				if (previousBasepower === false) previousBasepower = basePower;
				if (previousBasepower !== basePower) difference = true;
				if (!basePower) basePower = '&mdash;';
				basePowers.push('Base power for ' + yourActive[i].name + ': ' + basePower);
			}
			if (difference) {
				basePowerText = '<p>' + basePowers.join('<br />') + '</p>';
			}
			// Falls through to not to repeat code on showing the base power.
		}
		if (!basePowerText) {
			var activeTarget = yourActive[0] || yourActive[1] || yourActive[2];
			basePower = this.getMoveBasePower(move, pokemon, activeTarget) || basePower;
			if (!basePower) basePower = '&mdash;';
			basePowerText = '<p>Base power: ' + basePower + '</p>';
		}
		var accuracy = move.accuracy;
		if (this.battle.gen < 6) {
			var table = BattleTeambuilderTable['gen' + this.battle.gen];
			if (move.id in table.overrideAcc) basePower = table.overrideAcc[move.id];
		}
		if (!accuracy || accuracy === true) accuracy = '&mdash;';
		else accuracy = '' + accuracy + '%';

		// Handle move type for moves that vary their type.
		var moveType = this.getMoveType(move, pokemon);

		// Deal with Nature Power special case, indicating which move it calls.
		if (move.id === 'naturepower') {
			if (this.battle.gen === 6) {
				additionalInfo = 'Calls ';
				if (this.battle.hasPseudoWeather('Electric Terrain')) {
					additionalInfo += Tools.getTypeIcon('Electric') + ' Thunderbolt';
				} else if (this.battle.hasPseudoWeather('Grassy Terrain')) {
					additionalInfo += Tools.getTypeIcon('Grass') + ' Energy Ball';
				} else if (this.battle.hasPseudoWeather('Misty Terrain')) {
					additionalInfo += Tools.getTypeIcon('Fairy') + ' Moonblast';
				} else {
					additionalInfo += Tools.getTypeIcon('Normal') + ' Tri Attack';
				}
			} else if (this.battle.gen > 3) {
				// In gens 4 and 5 it calls Earthquake.
				additionalInfo = 'Calls ' + Tools.getTypeIcon('Ground') + ' Earthquake';
			} else {
				// In gen 3 it calls Swift, so it retains its normal typing.
				additionalInfo = 'Calls ' + Tools.getTypeIcon('Normal') + ' Swift';
			}
		}

		text = '<div class="tooltipinner"><div class="tooltip">';
		var category = move.category;
		if (this.battle.gen <= 3 && move.category !== 'Status') {
			category = (move.type in {Fire:1, Water:1, Grass:1, Electric:1, Ice:1, Psychic:1, Dark:1, Dragon:1} ? 'Special' : 'Physical');
		}
		text += '<h2>' + move.name + '<br />' + Tools.getTypeIcon(moveType) + ' <img src="' + Tools.resourcePrefix;
		text += 'sprites/categories/' + category + '.png" alt="' + category + '" /></h2>';
		text += basePowerText;
		if (additionalInfo) text += '<p>' + additionalInfo + '</p>';
		text += '<p>Accuracy: ' + accuracy + '</p>';
		if (move.desc) {
			if (this.battle.gen < 6) {
				var desc = move.shortDesc;
				for (var i = this.battle.gen; i < 6; i++) {
					if (move.id in BattleTeambuilderTable['gen' + i].overrideMoveDesc) {
						desc = BattleTeambuilderTable['gen' + i].overrideMoveDesc[move.id];
						break;
					}
				}
				text += '<p class="section">' + desc + '</p>';
			} else {
				text += '<p class="section">';
				if (move.priority > 1) {
					text += 'Nearly always moves first <em>(priority +' + move.priority + ')</em>.</p><p>';
				} else if (move.priority <= -1) {
					text += 'Nearly always moves last <em>(priority &minus;' + (-move.priority) + ')</em>.</p><p>';
				} else if (move.priority == 1) {
					text += 'Usually moves first <em>(priority +' + move.priority + ')</em>.</p><p>';
				}

				text += '' + (move.desc || move.shortDesc) + '</p>';

				if ('defrost' in move.flags) {
					text += '<p class="movetag">The user thaws out if it is frozen.</p>';
				}
				if (!('protect' in move.flags) && move.target !== 'self' && move.target !== 'allySide' && move.target !== 'allyTeam') {
					text += '<p class="movetag">Bypasses Protect <small>(and Detect, King\'s Shield, Spiky Shield)</small></p>';
				}
				if ('authentic' in move.flags) {
					text += '<p class="movetag">Bypasses Substitute <small>(but does not break it)</small></p>';
				}
				if (!('reflectable' in move.flags) && move.target !== 'self' && move.target !== 'allySide' && move.target !== 'allyTeam' && move.category === 'Status') {
					text += '<p class="movetag">&#x2713; Not bounceable <small>(can\'t be bounced by Magic Coat/Bounce)</small></p>';
				}

				if ('contact' in move.flags) {
					text += '<p class="movetag">&#x2713; Contact <small>(triggers Iron Barbs, Spiky Shield, etc)</small></p>';
				}
				if ('sound' in move.flags) {
					text += '<p class="movetag">&#x2713; Sound <small>(doesn\'t affect Soundproof pokemon)</small></p>';
				}
				if ('powder' in move.flags) {
					text += '<p class="movetag">&#x2713; Powder <small>(doesn\'t affect Grass, Overcoat, Safety Goggles)</small></p>';
				}
				if ('punch' in move.flags && (myPokemon.baseAbility === 'ironfist' || pokemon.ability === "Iron Fist")) {
					text += '<p class="movetag">&#x2713; Fist <small>(boosted by Iron Fist)</small></p>';
				}
				if ('pulse' in move.flags && (myPokemon.baseAbility === 'megalauncher' || pokemon.ability === "Mega Launcher")) {
					text += '<p class="movetag">&#x2713; Pulse <small>(boosted by Mega Launcher)</small></p>';
				}
				if ('bite' in move.flags && (myPokemon.baseAbility === 'strongjaw' || pokemon.ability === "Strong Jaw")) {
					text += '<p class="movetag">&#x2713; Bite <small>(boosted by Strong Jaw)</small></p>';
				}
				if ('bullet' in move.flags) {
					text += '<p class="movetag">&#x2713; Ballistic <small>(doesn\'t affect Bulletproof pokemon)</small></p>';
				}

				if (this.battle.gameType === 'doubles') {
					if (move.target === 'allAdjacent') {
						text += '<p class="movetag">&#x25ce; Hits both foes and ally.</p>';
					} else if (move.target === 'allAdjacentFoes') {
						text += '<p class="movetag">&#x25ce; Hits both foes.</p>';
					}
				} else if (this.battle.gameType === 'triples') {
					if (move.target === 'allAdjacent') {
						text += '<p class="movetag">&#x25ce; Hits adjacent foes and allies.</p>';
					} else if (move.target === 'allAdjacentFoes') {
						text += '<p class="movetag">&#x25ce; Hits adjacent foes.</p>';
					} else if (move.target === 'any') {
						text += '<p class="movetag">&#x25ce; Can target distant Pok&eacute;mon in Triples.</p>';
					}
				}
			}
		}
		text += '</div></div>';
		return text;
	};

	BattleTooltips.prototype.showPokemonTooltip = function (pokemon, myPokemon, isActive) {
		var text = '';
		var gender = pokemon.gender;
		if (gender) gender = ' <img src="' + Tools.resourcePrefix + 'fx/gender-' + gender.toLowerCase() + '.png" alt="' + gender + '" />';
		text = '<div class="tooltipinner"><div class="tooltip">';
		text += '<h2>' + pokemon.getFullName() + gender + (pokemon.level !== 100 ? ' <small>L' + pokemon.level + '</small>' : '') + '<br />';

		var template = pokemon;
		if (!pokemon.types) template = Tools.getTemplate(pokemon.species);
		if (pokemon.volatiles && pokemon.volatiles.transform && pokemon.volatiles.formechange) {
			template = Tools.getTemplate(pokemon.volatiles.formechange[2]);
			text += '<small>(Transformed into ' + pokemon.volatiles.formechange[2] + ')</small><br />';
		} else if (pokemon.volatiles && pokemon.volatiles.formechange) {
			template = Tools.getTemplate(pokemon.volatiles.formechange[2]);
			text += '<small>(Forme: ' + pokemon.volatiles.formechange[2] + ')</small><br />';
		}

		var types = template.types;
		var gen = this.battle.gen;
		if (gen < 5 && template.baseSpecies === 'Rotom') {
			types = ["Electric", "Ghost"];
		} else if (gen < 2 && types[1] === 'Steel') {
			types = [types[0]];
		} else if (gen < 6 && types[0] === 'Fairy' && types.length > 1) {
			types = ['Normal', types[1]];
		} else if (gen < 6 && types[0] === 'Fairy') {
			types = ['Normal'];
		} else if (gen < 6 && types[1] === 'Fairy') {
			types = [types[0]];
		}

		var isTypeChanged = false;
		if (pokemon.volatiles && pokemon.volatiles.typechange) {
			isTypeChanged = true;
			types = pokemon.volatiles.typechange[2].split('/');
		}
		if (pokemon.volatiles && pokemon.volatiles.typeadd) {
			isTypeChanged = true;
			if (types && types.indexOf(pokemon.volatiles.typeadd[2]) === -1) {
				types = types.concat(pokemon.volatiles.typeadd[2]);
			}
		}
		if (isTypeChanged) text += '<small>(Type changed)</small><br />';
		if (types) {
			text += types.map(Tools.getTypeIcon).join(' ');
		} else {
			text += 'Types unknown';
		}
		text += '</h2>';
		if (pokemon.fainted) {
			text += '<p>HP: (fainted)</p>';
		} else {
			var exacthp = '';
			if (myPokemon) exacthp = ' (' + myPokemon.hp + '/' + myPokemon.maxhp + ')';
			else if (pokemon.maxhp == 48) exacthp = ' <small>(' + pokemon.hp + '/' + pokemon.maxhp + ' pixels)</small>';
			text += '<p>HP: ' + pokemon.hpDisplay() + exacthp + (pokemon.status ? ' <span class="status ' + pokemon.status + '">' + pokemon.status.toUpperCase() + '</span>' : '') + '</p>';
		}
		var showOtherSees = isActive;
		if (myPokemon) {
			if (this.battle.gen > 2) {
				text += '<p>Ability: ' + Tools.getAbility(myPokemon.baseAbility).name;
				if (myPokemon.item) {
					text += ' / Item: ' + Tools.getItem(myPokemon.item).name;
				}
				text += '</p>';
			} else if (myPokemon.item) {
				item = Tools.getItem(myPokemon.item).name;
				text += '<p>Item: ' + item + '</p>';
			}
			text += '<p>' + myPokemon.stats['atk'] + '&nbsp;Atk /&nbsp;' + myPokemon.stats['def'] + '&nbsp;Def /&nbsp;' + myPokemon.stats['spa'];
			if (this.battle.gen === 1) {
				text += '&nbsp;Spc /&nbsp;';
			} else {
				text += '&nbsp;SpA /&nbsp;' + myPokemon.stats['spd'] + '&nbsp;SpD /&nbsp;';
			}
			text += myPokemon.stats['spe'] + '&nbsp;Spe</p>';
			if (isActive) {
				var modifiedStats = this.calculateModifiedStats(pokemon, myPokemon);
				var statsText = this.makeModifiedStatText(myPokemon, modifiedStats);
				if (statsText.match('<b')) {
					text += '<p>After Modifiers:</p>';
					text += statsText;
				}
				text += '<p class="section">Opponent sees:</p>';
			}
		} else {
			showOtherSees = true;
		}
		if (this.battle.gen > 2 && showOtherSees) {
			if (!pokemon.baseAbility && !pokemon.ability) {
				if (template.abilities) {
					text += '<p>Possible abilities: ' + Tools.getAbility(template.abilities['0']).name;
					if (template.abilities['1']) text += ', ' + Tools.getAbility(template.abilities['1']).name;
					if (this.battle.gen > 4 && template.abilities['H']) text += ', ' + Tools.getAbility(template.abilities['H']).name;
					text += '</p>';
				}
			} else if (pokemon.ability) {
				text += '<p>Ability: ' + Tools.getAbility(pokemon.ability).name + '</p>';
			} else if (pokemon.baseAbility) {
				text += '<p>Ability: ' + Tools.getAbility(pokemon.baseAbility).name + '</p>';
			}
		}

		if (showOtherSees) {
			var item = '';
			var itemEffect = pokemon.itemEffect || '';
			if (pokemon.prevItem) {
				item = 'None';
				if (itemEffect) itemEffect += '; ';
				var prevItem = Tools.getItem(pokemon.prevItem).name;
				itemEffect += pokemon.prevItemEffect ? prevItem + ' was ' + pokemon.prevItemEffect : 'was ' + prevItem;
			}
			if (pokemon.item) item = Tools.getItem(pokemon.item).name;
			if (itemEffect) itemEffect = ' (' + itemEffect + ')';
			if (item) text += '<p>Item: ' + item + itemEffect + '</p>';

			if (template.baseStats) {
				text += '<p>' + this.getTemplateMinSpeed(template, pokemon.level) + ' to ' + this.getTemplateMaxSpeed(template, pokemon.level) + ' Spe (before items/abilities/modifiers)</p>';
			}
		}

		if (myPokemon && !isActive) {
			text += '<p class="section">';
			var battlePokemon = this.battle.getPokemon(pokemon.ident, pokemon.details);
			for (var i = 0; i < myPokemon.moves.length; i++) {
				var move = Tools.getMove(myPokemon.moves[i]);
				var name = move.name;
				var pp = 0, maxpp = 0;
				if (battlePokemon && battlePokemon.moveTrack) {
					for (var j = 0; j < battlePokemon.moveTrack.length; j++) {
						if (name === battlePokemon.moveTrack[j][0]) {
							name = this.getPPUseText(battlePokemon.moveTrack[j], true);
							break;
						}
					}
				}
				text += '&#8226; ' + name + '<br />';
			}
			text += '</p>';
		} else if (pokemon.moveTrack && pokemon.moveTrack.length) {
			text += '<p class="section">';
			for (var i = 0; i < pokemon.moveTrack.length; i++) {
				text += '&#8226; ' + this.getPPUseText(pokemon.moveTrack[i]) + '<br />';
			}
			text += '</p>';
		}
		text += '</div></div>';
		return text;
	};

	BattleTooltips.prototype.findModifier = function (pokemon, myPokemon, statName) {
		var modifier = 1;
		if (pokemon.boosts) {
			if (pokemon.boosts[statName]) {
				if (pokemon.boosts[statName] > 0) {
					var goodBoostTable = [1, 1.5, 2, 2.5, 3, 3.5, 4];
					// var goodBoostTable = ['Normal', '+1', '+2', '+3', '+4', '+5', '+6'];
					modifier = goodBoostTable[pokemon.boosts[statName]];
				} else {
					var badBoostTable = [1, 0.67, 0.5, 0.4, 0.33, 0.29, 0.25];
					// var badBoostTable = ['Normal', '&minus;1', '&minus;2', '&minus;3', '&minus;4', '&minus;5', '&minus;6'];
					modifier =  badBoostTable[-pokemon.boosts[statName]];
				}

			}
		}

		// check for burn, paralysis, guts, quick feet
		if (pokemon.status) {
			if (statName === 'atk') {
				if (this.battle.gen > 2 && pokemon.ability === 'Guts')  {
					modifier = modifier * 1.5;
				} else if (pokemon.status === 'brn') {
					modifier = modifier * 0.5;
				}
			}

			if (statName === 'spe') {
				if (this.battle.gen > 2 && pokemon.ability === 'Quick Feet') {
					modifier = modifier * 1.5;
				} else if (pokemon.status === 'par') {
					modifier = modifier * 0.25;
				}
			}
		}

		// gen 1 stuff doesn’t work yet
		if (this.battle.gen > 1) {
			var item = '';
			if (myPokemon.item) {
				item = Tools.getItem(myPokemon.item).name;
			}


			// check for light ball, thick club, metal/quick powder
			// the only stat modifying items in gen 2 were light ball, thick club, metal powder. gen 1 had none
			if (item === 'Light Ball') {
				if (pokemon.baseSpecies === 'Pikachu' && (statName === 'atk' || statName === 'spa')) {
					modifier = modifier * 2;
				}
			}

			if (item === 'Thick Club') {
				if ((pokemon.baseSpecies === 'Marowak' || pokemon.baseSpecies === 'Cubone') && statName === 'atk') {
					modifier = modifier * 2;
				}
			}

			if (pokemon.baseSpecies === 'Ditto') {
				if (!('transform' in pokemon.volatiles)) {
					if (item === 'Quick Powder' && statName === 'spe') {
						modifier = modifier * 2;
					}
					if (item === 'Metal Powder' && (statName === 'spd' || statName === 'def')) {
						modifier = modifier * 1.5;
					}

				}
			}

			// check abilities other than Guts and Quick Feet
			// check items other than light ball, thick club, metal/quick powder
			if (this.battle.gen > 2) {
				var ability = Tools.getAbility(myPokemon.baseAbility).name;
				if (this.battle.weather) {
					// Check if you have an anti weather ability
					var noWeatherAbility = !!(ability in {'Air Lock': 1, 'Cloud Nine': 1});
					// If you don't, check if the opponent has it afterwards.
					if (!noWeatherAbility) {
						for (var i = 0; i < this.battle.yourSide.active.length; i++) {
							if (this.battle.yourSide.active[i] && this.battle.yourSide.active[i].ability in {'Air Lock': 1, 'Cloud Nine': 1}) {
								noWeatherAbility = true;
								break;
							}
						}
					}
				}

				if (item === 'Choice Band' && statName === 'atk') {
					modifier = modifier * 1.5;
				}
				if (ability === 'Toxic Boost' && (pokemon.status === 'tox' || pokemon.status === 'psn') && statName === 'atk') {
					modifier = modifier * 1.5;
				}
				if ((ability === 'Pure Power' || pokemon.ability === 'Huge Power') && statName === 'atk') {
					modifier = modifier * 2;
				}
				if (ability === 'Hustle' && statName === 'atk') {
					modifier = modifier * 1.5;
				}
				if (this.battle.weather) {
					if (!noWeatherAbility) {
						if (ability === 'Flower Gift' && (statName === 'atk' || statName === 'spd') && (this.battle.weather === 'sunnyday' || this.battle.weather === 'desolateland')) {
							modifier = modifier * 1.5;
						}
						if (ability === 'Solar Power' && (this.battle.weather === 'sunnyday' || this.battle.weather === 'desolateland') && statName === 'spa') {
							modifier = modifier * 1.5;
						}
						if ((pokemon.types[0] === 'Rock' || pokemon.types[1] === 'Rock') && this.battle.weather === 'sandstorm' && statName === 'spd') {
							modifier = modifier * 1.5;
						}
						if (statName === 'spe') {
							if (ability === 'Chlorophyll' && (this.battle.weather === 'sunnyday' || this.battle.weather === 'desolateland')) {
								modifier = modifier * 2;
							}
							if (ability === 'Swift Swim' && (this.battle.weather === 'raindance' || this.battle.weather === 'primordialsea')) {
								modifier = modifier * 2;
							}
							if (ability === 'Sand Rush' && this.battle.weather === 'sandstorm') {
								modifier = modifier * 2;
							}
						}
					}
				}
				if (ability === 'Defeatist' && (statName === 'atk' || statName === 'spa') && myPokemon.hp <= myPokemon.maxhp / 2) {
					modifier = modifier * 0.5;
				}
				if (pokemon.volatiles) {
					for (var volatile in pokemon.volatiles) {
						if (volatile === 'slowstart' && (statName === 'atk' || statName === 'spe')) {
							modifier = modifier * 0.5;
						}
						if (ability === 'Unburden' && volatile === 'itemremoved' && statName === 'spe') {
							modifier = modifier * 2;
						}

					}
				}
				if (ability === 'Marvel Scale' && pokemon.status && statName === 'def') {
					modifier = modifier * 1.5;
				}
				if (item === 'Eviolite' && (statName === 'def' || statName === 'spd')) {
					if (Tools.getTemplate(pokemon.name).evos) {
						modifier = modifier * 1.5;
					}
				}
				if (this.battle.hasPseudoWeather('Grassy Terrain') && ability === 'Grass Pelt' && statName === 'def') {
					modifier = modifier * 1.5;
				}
				if (item === 'Choice Specs' && statName === 'spa') {
					modifier = modifier * 1.5;
				}
				if (ability === 'Flare Boost' && pokemon.status === 'brn' && statName === 'spa') {
					modifier = modifier * 1.5;
				}
				if (item === 'DeepSeaTooth' && pokemon.baseSpecies === 'Clamperl' && statName === 'spa') {
					modifier = modifier * 2;
				}
				if (item === 'Soul Dew' && (pokemon.baseSpecies === 'Latios' || pokemon.baseSpecies === 'Latias') && (statName === 'spa' || statName === 'spd')) {
					modifier = modifier * 1.5;
				}
				if ((ability === 'Plus' || ability === 'Minus') && statName === 'spa') {
					var allyActive = pokemon.side.active;
					if (allyActive.length > 1) {
						if (this.battle.gen > 4) {
							for (var i = 0; i < allyActive.length; i++) {
								if (allyActive[i] && allyActive[i].searchid !== pokemon.searchid && !allyActive[i].fainted && (allyActive[i].ability === 'Plus' || allyActive[i].ability === 'Minus')) {
									modifier = modifier * 1.5;
									break;
								}
							}
						} else {
							if (ability === 'Plus') {
								for (var i = 0; i < allyActive.length; i++) {
									if (allyActive[i] && !allyActive[i].fainted && allyActive[i].ability === 'Minus') {
										modifier = modifier * 1.5;
									}
								}
							}
							if (ability === 'Minus') {
								for (var i = 0; i < allyActive.length; i++) {
									if (allyActive[i] && !allyActive[i].fainted && allyActive[i].ability === 'Plus') {
										modifier = modifier * 1.5;
									}
								}
							}
						}
					}
				}
				if (item === 'Assault Vest' && statName === 'spd') {
					modifier = modifier * 1.5;
				}
				if (item === 'DeepSeaScale' && statName === 'spd') {
					if (pokemon.baseSpecies === 'Clamperl') {
						modifier = modifier * 2;
					}
				}
				if (item === 'Choice Scarf' && statName === 'spe') {
					modifier = modifier * 1.5;
				}
				if ((item === 'Iron Ball' || item === 'Macho Brace') && statName === 'spe') {
					modifier = modifier * 0.5;
				}
			}
		}

		return modifier;
	};

	BattleTooltips.prototype.calculateModifiedStats = function (pokemon, myPokemon) {
		var modifiedStats = {};
		if (this.battle.gen === 1) {
			modifiedStats = {atk: Math.max(Math.floor(myPokemon.stats['atk'] * this.findModifier(pokemon, myPokemon, 'atk')), 999),
							 def: Math.max(Math.floor(myPokemon.stats['def'] * this.findModifier(pokemon, myPokemon, 'def')), 999),
							 spa: Math.max(Math.floor(myPokemon.stats['spa'] * this.findModifier(pokemon, myPokemon, 'spa')), 999),
							 spe: Math.max(Math.floor(myPokemon.stats['spe'] * this.findModifier(pokemon, myPokemon, 'spe')), 999)};

		} else {
			modifiedStats = {atk: Math.floor(myPokemon.stats['atk'] * this.findModifier(pokemon, myPokemon, 'atk')),
							 def: Math.floor(myPokemon.stats['def'] * this.findModifier(pokemon, myPokemon, 'def')),
							 spa: Math.floor(myPokemon.stats['spa'] * this.findModifier(pokemon, myPokemon, 'spa')),
							 spd: Math.floor(myPokemon.stats['spd'] * this.findModifier(pokemon, myPokemon, 'spd')),
							 spe: Math.floor(myPokemon.stats['spe'] * this.findModifier(pokemon, myPokemon, 'spe'))};
		}
		return modifiedStats;
	};

	BattleTooltips.prototype.makeModifiedStatText = function (myPokemon, modifiedStats) {
		var statsText = '<p>';
		var statTable = {atk: '&nbsp;Atk /&nbsp;', def: '&nbsp;Def /&nbsp;', spa: '&nbsp;SpA /&nbsp;',
						 spc: '&nbsp;Spc /&nbsp;', spd: '&nbsp;SpD /&nbsp;', spe: '&nbsp;Spe</p>'};
		statsText += this.boldModifiedStat(myPokemon, modifiedStats, 'atk') + statTable['atk'];
		statsText += this.boldModifiedStat(myPokemon, modifiedStats, 'def') + statTable['def'];
		statsText += this.boldModifiedStat(myPokemon, modifiedStats, 'spa');
		if (this.battle.gen === 1) {
			statsText += statTable['spc'];
		} else {
			statsText += statTable['spa'];
			statsText += this.boldModifiedStat(myPokemon, modifiedStats, 'spd') + statTable['spd'];
		}
		statsText += this.boldModifiedStat(myPokemon, modifiedStats, 'spe') + statTable['spe'];
		return statsText;
	};

	BattleTooltips.prototype.boldModifiedStat = function (myPokemon, modifiedStats, statName) {
		var statText = '';
		if (myPokemon.stats[statName] === modifiedStats[statName]) {
			statText += '' + modifiedStats[statName];
		} else {
			statText += '<b>' + modifiedStats[statName] + '</b>';
		}
		return statText;
	};

	BattleTooltips.prototype.getPPUseText = function (moveTrackRow, showKnown) {
		var moveName = moveTrackRow[0];
		var ppUsed = moveTrackRow[1];
		var move, maxpp;
		if (moveName.charAt(0) === '*') {
			moveName = moveName.substr(1);
			move = Tools.getMove(moveName);
			maxpp = 5;
		} else {
			move = Tools.getMove(moveName);
			maxpp = move.pp;
			if (this.battle.gen < 6) {
				var table = BattleTeambuilderTable['gen' + this.battle.gen];
				if (move.id in table.overridePP) maxpp = table.overridePP[move.id];
			}
			maxpp = Math.floor(maxpp * 8 / 5);
		}
		if (!ppUsed) return move.name + (showKnown ? ' <small>(revealed)</small>' : '');
		return move.name + ' <small>(' + (maxpp - ppUsed) + '/' + maxpp + ')</small>';
	};

	// Functions to calculate speed ranges of an opponent.
	BattleTooltips.prototype.getTemplateMinSpeed = function (template, level) {
		var baseSpe = template.baseStats['spe'];
		if (this.battle.gen < 6) {
			var overrideStats = BattleTeambuilderTable['gen' + this.battle.gen].overrideStats[template.id];
			if (overrideStats && 'spe' in overrideStats) baseSpe = overrideStats['spe'];
		}

		var nature = (this.battle.tier === 'Random Battle' || this.battle.gen < 3) ? 1 : 0.9;
		return Math.floor(Math.floor(2 * baseSpe * level / 100 + 5) * nature);
	};
	BattleTooltips.prototype.getTemplateMaxSpeed = function (template, level) {
		var baseSpe = template.baseStats['spe'];
		if (this.battle.gen < 6) {
			var overrideStats = BattleTeambuilderTable['gen' + this.battle.gen].overrideStats[template.id];
			if (overrideStats && 'spe' in overrideStats) baseSpe = overrideStats['spe'];
		}

		var iv = (this.battle.gen < 3) ? 30 : 31;
		var value = iv + (this.battle.tier === 'Random Battle' ? 21 : 63);
		var nature = (this.battle.tier === 'Random Battle' || this.battle.gen < 3) ? 1 : 1.1;
		return Math.floor(Math.floor(Math.floor(2 * baseSpe + value) * level / 100 + 5) * nature);
	};

	// Gets the proper current type for moves with a variable type.
	BattleTooltips.prototype.getMoveType = function (move, pokemon) {
		var myPokemon = this.room.myPokemon[pokemon.slot];
		var ability = Tools.getAbility(myPokemon.baseAbility).name;
		var moveType = move.type;
		// Normalize is the first move type changing effect.
		if (ability === 'Normalize') {
			moveType = 'Normal';
		}
		if ((move.id === 'bite' || move.id === 'gust' || move.id === 'karatechop' || move.id === 'sandattack') && this.battle.gen <= 1) {
			moveType = 'Normal';
		}
		if ((move.id === 'charm' || move.id === 'moonlight' || move.id === 'sweetkiss') && this.battle.gen <= 5) {
			moveType = 'Normal';
		}
		// Moves that require an item to change their type.
		if (!this.battle.hasPseudoWeather('Magic Room') && (!pokemon.volatiles || !pokemon.volatiles['embargo'])) {
			if (move.id === 'judgment') {
				var item = Tools.getItem(myPokemon.item);
				if (item.onPlate) moveType = item.onPlate;
			}
			if (move.id === 'technoblast') {
				var item = Tools.getItem(myPokemon.item);
				if (item.onDrive) moveType = item.onDrive;
			}
			if (move.id === 'naturalgift') {
				var item = Tools.getItem(myPokemon.item);
				if (item.naturalGift) moveType = item.naturalGift.type;
			}
		}
		// Weather and pseudo-weather type changes.
		if (move.id === 'weatherball' && this.battle.weather) {
			// Check if you have an anti weather ability to skip this.
			var noWeatherAbility = !!(ability in {'Air Lock': 1, 'Cloud Nine': 1});
			// If you don't, check if the opponent has it afterwards.
			if (!noWeatherAbility) {
				for (var i = 0; i < this.battle.yourSide.active.length; i++) {
					if (this.battle.yourSide.active[i] && this.battle.yourSide.active[i].ability in {'Air Lock': 1, 'Cloud Nine': 1}) {
						noWeatherAbility = true;
						break;
					}
				}
			}

			// If the weather is indeed active, check it to see what move type weatherball gets.
			if (!noWeatherAbility) {
				if (this.battle.weather === 'sunnyday' || this.battle.weather === 'desolateland') moveType = 'Fire';
				if (this.battle.weather === 'raindance' || this.battle.weather === 'primordialsea') moveType = 'Water';
				if (this.battle.weather === 'sandstorm') moveType = 'Rock';
				if (this.battle.weather === 'hail') moveType = 'Ice';
			}
		}
		// Other abilities that change the move type.
		if (moveType === 'Normal' && move.category && move.category !== 'Status' && !(move.id in {'naturalgift': 1, 'struggle': 1})) {
			if (ability === 'Aerilate') moveType = 'Flying';
			if (ability === 'Pixilate') moveType = 'Fairy';
			if (ability === 'Refrigerate') moveType = 'Ice';
		}
		return moveType;
	};
	// Gets the proper current base power for moves which have a variable base power.
	// Takes into account the target for some moves.
	// If it is unsure of the actual base power, it gives an estimate.
	BattleTooltips.prototype.getMoveBasePower = function (move, pokemon, target) {
		var myPokemon = this.room.myPokemon[pokemon.slot];
		var ability = Tools.getAbility(myPokemon.baseAbility).name;
		var basePower = move.basePower;
		if (this.battle.gen < 6) {
			var table = BattleTeambuilderTable['gen' + this.battle.gen];
			if (move.id in table.overrideBP) basePower = table.overrideBP[move.id];
		}
		var basePowerComment = '';
		var thereIsWeather = (this.battle.weather in {'sunnyday': 1, 'desolateland': 1, 'raindance': 1, 'primordialsea': 1, 'sandstorm': 1, 'hail':1});
		if (move.id === 'acrobatics') {
			if (!myPokemon.item) {
				basePower *= 2;
				basePowerComment = ' (Boosted by lack of item)';
			}
		}
		if (move.id === 'crushgrip' || move.id === 'wringout') {
			basePower = Math.floor(Math.floor((120 * (100 * Math.floor(target.hp * 4096 / target.maxhp)) + 2048 - 1) / 4096) / 100) || 1;
			basePowerComment = ' (Approximation)';
		}
		if (move.id === 'eruption' || move.id === 'waterspout') {
			basePower = Math.floor(150 * pokemon.hp / pokemon.maxhp) || 1;
		}
		if (move.id === 'flail' || move.id === 'reversal') {
			if (this.battle.gen > 4) {
				var multiplier = 48;
				var ratios = [2, 5, 10, 17, 33];
			} else {
				var multiplier = 64;
				var ratios = [2, 6, 13, 22, 43];
			}
			var ratio = pokemon.hp * multiplier / pokemon.maxhp;
			if (ratio < ratios[0]) basePower = 200;
			else if (ratio < ratios[1]) basePower = 150;
			else if (ratio < ratios[2]) basePower = 100;
			else if (ratio < ratios[3]) basePower = 80;
			else if (ratio < ratios[4]) basePower = 40;
			else basePower = 20;
		}
		if (move.id === 'hex' && target.status) {
			basePower *= 2;
			basePowerComment = ' (Boosted by status)';
		}
		if (move.id === 'punishment') {
			var boosts = Object.keys(target.boosts);
			var multiply = 0;
			for (var i = 0; i < boosts.length; i++) {
				if (target.boosts[boosts[i]] > 0) multiply += target.boosts[boosts[i]];
			}
			basePower = 60 + 20 * multiply;
			if (basePower > 200) basePower = 200;
		}
		if (move.id === 'smellingsalts') {
			if (target.status === 'par') {
				basePower *= 2;
				basePowerComment = ' (Boosted by status)';
			}
		}
		if (move.id === 'storedpower') {
			var boosts = Object.keys(pokemon.boosts);
			var multiply = 0;
			for (var i = 0; i < boosts.length; i++) {
				if (pokemon.boosts[boosts[i]] > 0) multiply += pokemon.boosts[boosts[i]];
			}
			basePower = 20 + 20 * multiply;
		}
		if (move.id === 'trumpcard') {
			basePower = 40;
			if (move.pp === 1) basePower = 200;
			else if (move.pp === 2) basePower = 80;
			else if (move.pp === 3) basePower = 60;
			else if (move.pp === 4) basePower = 50;
		}
		if (move.id === 'venoshock') {
			if (target.status === 'psn' || target.status === 'tox') {
				basePower *= 2;
				basePowerComment = ' (Boosted by status)';
			}
		}
		if (move.id === 'wakeupslap') {
			if (target.status === 'slp') {
				basePower *= 2;
				basePowerComment = ' (Boosted by status)';
			}
		}
		if (move.id === 'weatherball' && thereIsWeather) {
			basePower = 100;
		}
		// Moves that check opponent speed.
		if (move.id === 'electroball') {
			var template = target;
			var min = 0;
			var max = 0;
			if (target.volatiles && target.volatiles.formechange) template = Tools.getTemplate(target.volatiles.formechange[2]);
			var minRatio = (myPokemon.stats['spe'] / this.getTemplateMaxSpeed(template, target.level));
			var maxRatio = (myPokemon.stats['spe'] / this.getTemplateMinSpeed(template, target.level));
			if (minRatio >= 4) min = 150;
			else if (minRatio >= 3) min = 120;
			else if (minRatio >= 2) min = 80;
			else if (minRatio >= 1) min = 60;
			else min = 40;
			if (maxRatio >= 4) max = 150;
			else if (maxRatio >= 3) max = 120;
			else if (maxRatio >= 2) max = 80;
			else if (maxRatio >= 1) max = 60;
			else max = 40;
			// Special case due to being a range.
			return this.boostBasePowerRange(move, pokemon, min, max);
		}
		if (move.id === 'gyroball') {
			var template = target;
			if (target.volatiles && target.volatiles.formechange) template = Tools.getTemplate(target.volatiles.formechange[2]);
			var min = (Math.floor(25 * this.getTemplateMinSpeed(template, target.level) / myPokemon.stats['spe']) || 1);
			var max = (Math.floor(25 * this.getTemplateMaxSpeed(template, target.level) / myPokemon.stats['spe']) || 1);
			if (min > 150) min = 150;
			if (max > 150) max = 150;
			// Special case due to range as well.
			return this.boostBasePowerRange(move, pokemon, min, max);
		}
		// Movements which have base power changed due to items.
		if (myPokemon.item && !this.battle.hasPseudoWeather('Magic Room') && (!pokemon.volatiles || !pokemon.volatiles['embargo'])) {
			if (move.id === 'fling') {
				var item = Tools.getItem(myPokemon.item);
				if (item.fling) basePower = item.fling.basePower;
			}
			if (move.id === 'naturalgift') {
				var item = Tools.getItem(myPokemon.item);
				if (item.naturalGift) basePower = item.naturalGift.basePower;
			}
		}
		// Movements which have base power changed according to weight.
		if (target && target.weightkg) {
			var targetWeight = target.weightkg;
			var pokemonWeight = pokemon.weightkg;
			// Autotomize cannot be really known on client, so we calculate it's one charge.
			if (target.volatiles && target.volatiles.autotomize) targetWeight -= 100;
			if (targetWeight < 0.1) targetWeight = 0.1;
			if (move.id === 'lowkick' || move.id === 'grassknot') {
				basePower = 20;
				if (targetWeight >= 200) basePower = 120;
				else if (targetWeight >= 100) basePower = 100;
				else if (targetWeight >= 50) basePower = 80;
				else if (targetWeight >= 25) basePower = 60;
				else if (targetWeight >= 10) basePower = 40;
				if (target.volatiles && target.volatiles.autotomize) basePowerComment = ' (Approximation)';
			}
			if (move.id === 'heavyslam' || move.id === 'heatcrash') {
				basePower = 40;
				if (pokemonWeight > targetWeight * 5) basePower = 120;
				else if (pokemonWeight > targetWeight * 4) basePower = 100;
				else if (pokemonWeight > targetWeight * 3) basePower = 80;
				else if (pokemonWeight > targetWeight * 2) basePower = 60;
				if (target.volatiles && target.volatiles.autotomize) basePowerComment = ' (Approximation)';
			}
		}
		if (!basePower) return basePowerComment;

		// Other ability boosts.
		if (ability === 'Technician' && basePower <= 60) {
			basePower *= 1.5;
			basePowerComment = ' (Technician boosted)';
		}
		if (move.type === 'Normal' && move.category !== 'Status' && !(move.id in {'naturalgift': 1, 'struggle': 1}) && (!thereIsWeather || thereIsWeather && move.id !== 'weatherball')) {
			if (ability in {'Aerilate': 1, 'Pixilate': 1, 'Refrigerate': 1}) {
				basePower = Math.floor(basePower * 1.3);
				basePowerComment = ' (' + ability + ' boosted)';
			}
		}
		return this.boostBasePower(move, pokemon, basePower, basePowerComment);
	};

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
	BattleTooltips.prototype.getItemBoost = function (move, pokemon) {
		var myPokemon = this.room.myPokemon[pokemon.slot];
		if (!myPokemon.item || this.battle.hasPseudoWeather('Magic Room') || pokemon.volatiles && pokemon.volatiles['embargo']) return 0;

		var item = Tools.getItem(myPokemon.item);
		var moveType = this.getMoveType(move, pokemon);
		var itemName = item.name;
		var moveName = move.name;

		// Plates
		if (item.onPlate === moveType) return 1.2;

		// Incenses
		if (incenseTypes[item.name] === moveType) return 1.2;

		// Type-enhancing items
		if (itemTypes[item.name] === moveType) return this.battle.gen < 4 ? 1.1 : 1.2;

		// Gems
		if (moveName in noGemMoves) return 0;
		if (itemName === moveType + ' Gem') return this.battle.gen < 6 ? 1.5 : 1.3;

		return 0;
	};
	BattleTooltips.prototype.boostBasePower = function (move, pokemon, basePower, basePowerComment) {
		var itemBoost = this.getItemBoost(move, pokemon);
		if (itemBoost) {
			basePower = Math.floor(basePower * itemBoost);
			var myPokemon = this.room.myPokemon[pokemon.slot];
			basePowerComment += ' (Boosted by ' + Tools.getItem(myPokemon.item).name + ')';
		}
		return basePower + basePowerComment;
	};
	BattleTooltips.prototype.boostBasePowerRange = function (move, pokemon, min, max) {
		var myPokemon = this.room.myPokemon[pokemon.slot];
		var technician = Tools.getAbility(myPokemon.baseAbility).name === 'Technician';
		if (technician) {
			if (min <= 60) min *= 1.5;
			if (max <= 60) max *= 1.5;
		}
		var itemBoost = this.getItemBoost(move, pokemon);
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
