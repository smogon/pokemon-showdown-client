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
	// Touch delay, pressing finger more than that time will cause the tooltip to open.
	// Shorter time will cause the button to click
	var LONG_TAP_DELAY = 350; // ms
	var touchTooltipTimeout;
	var runClickActionOfButtonWithTooltip = false;

	// Each time a finger presses the button this function will be callled
	// First finger starts the counter, and when last finger leaves time is checked
	BattleTooltips._handleTouchStartFor = function (e, roomid, thing, type, elem, ownHeight) {
		// Prevent default on touch events to block mouse events when touch is used
		e.preventDefault();

		// On first tap start counting
		if (e.touches.length === 1) {
			// Timeout will be canceled by `_handleTouchEndFor` if a short tap have occurred
			touchTooltipTimeout = setTimeout(function () {
				touchTooltipTimeout = undefined;
				BattleTooltips.showTooltipFor(roomid, thing, type, elem, ownHeight);
			}, LONG_TAP_DELAY);
		}
	};
	BattleTooltips._handleTouchLeaveFor = function (e) {
		// Prevent default on touch events to block mouse events when touch is used
		e.preventDefault();

		// If tooltip is open and the last finger just left, close the tooptip
		if (touchTooltipTimeout === undefined && e.touches.length === 0) {
			BattleTooltips.hideTooltip();
		}
	};
	BattleTooltips._handleTouchEndFor = function (e, elem) {
		// Close tooptip if needed
		BattleTooltips._handleTouchLeaveFor(e);

		// If tooltip is not opened (`touchTooltipTimeout` is still defined) and the last finger left,
		// meaning the timeout in `_handleTouchStartFor` wasn't fired, fire the action
		if (touchTooltipTimeout !== undefined && e.touches.length === 0) {
			clearTimeout(touchTooltipTimeout);
			touchTooltipTimeout = undefined;
			runClickActionOfButtonWithTooltip = true;

			// Need to call `click` event manually because we prevented default behaviour of `touchend` event
			elem.click();
		}
	};
	// Call click on mouse up, because `runClickActionOfButtonWithTooltip` must be set before the click
	BattleTooltips._handleMouseUpFor = function () {
		BattleTooltips.hideTooltip();
		runClickActionOfButtonWithTooltip = true;
	};
	// Stop click from doing it's action unless `runClickActionOfButtonWithTooltip` was set to true
	// (in `_handleMouseUpFor` or in `_handleTouchEndFor`)
	BattleTooltips._handleClickFor = function (e) {
		if (!runClickActionOfButtonWithTooltip) {
			e.stopPropagation();
		} else {
			// Reset `runClickActionOfButtonWithTooltip` value to false for next click
			runClickActionOfButtonWithTooltip = false;
		}
	};
	BattleTooltips.prototype.tooltipAttrs = function (thing, type, ownHeight) {
		var roomid = this.room.id;
		return ' onclick="BattleTooltips._handleClickFor(event)"' +
		' ontouchstart="BattleTooltips._handleTouchStartFor(event, \'' + roomid + '\', \'' + Tools.escapeHTML('' + thing, true) + '\',\'' + type + '\', this, ' + (ownHeight ? 'true' : 'false') + ')"' +
		' ontouchend="BattleTooltips._handleTouchEndFor(event, this)"' +
		' ontouchleave="BattleTooltips._handleTouchLeaveFor(event)"' +
		' ontouchcancel="BattleTooltips._handleTouchLeaveFor(event)"' +
		' onmouseover="BattleTooltips.showTooltipFor(\'' + roomid + '\', \'' + Tools.escapeHTML('' + thing, true) + '\',\'' + type + '\', this, ' + (ownHeight ? 'true' : 'false') + ')"' +
		' onfocus="BattleTooltips.showTooltipFor(\'' + roomid + '\', \'' + Tools.escapeHTML('' + thing, true) + '\',\'' + type + '\', this, ' + (ownHeight ? 'true' : 'false') + ')"' +
		' onmouseout="BattleTooltips.hideTooltip()"' +
		' onblur="BattleTooltips.hideTooltip()"' +
		' onmouseup="BattleTooltips._handleMouseUpFor()"' +
		' aria-describedby="tooltipwrapper"';
	};
	BattleTooltips.prototype.showTooltip = function (thing, type, elem, ownHeight) {
		var room = this.room;

		var text = '';
		switch (type) {
		case 'move':
		case 'zmove':
			var move = Tools.getMove(thing);
			if (!move) return;
			text = this.showMoveTooltip(move, type === 'zmove');
			break;

		case 'pokemon':
			var side = room.battle[thing.slice(0, -1) + "Side"];
			var pokemon = side.active[thing.slice(-1)];
			if (!pokemon) return;
			/* falls through */
		case 'sidepokemon':
			var pokemonData;
			var isActive = (type === 'pokemon');
			if (room.myPokemon) {
				if (!pokemon) {
					pokemonData = room.myPokemon[parseInt(thing, 10)];
					pokemon = pokemonData;
				} else if (room.controlsShown && pokemon.side === room.battle.mySide) {
					// battlePokemon = pokemon;
					pokemonData = room.myPokemon[pokemon.slot];
				}
			}
			text = this.showPokemonTooltip(pokemon, pokemonData, isActive);
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

		if (!$('#tooltipwrapper').length) $(document.body).append('<div id="tooltipwrapper" onclick="$(\'#tooltipwrapper\').html(\'\');" role="tooltip"></div>');
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

	BattleTooltips.prototype.zMoveTable = {
		Poison: "Acid Downpour",
		Fighting: "All-Out Pummeling",
		Dark: "Black Hole Eclipse",
		Grass: "Bloom Doom",
		Normal: "Breakneck Blitz",
		Rock: "Continental Crush",
		Steel: "Corkscrew Crash",
		Dragon: "Devastating Drake",
		Electric: "Gigavolt Havoc",
		Water: "Hydro Vortex",
		Fire: "Inferno Overdrive",
		Ghost: "Never-Ending Nightmare",
		Bug: "Savage Spin-Out",
		Psychic: "Shattered Psyche",
		Ice: "Subzero Slammer",
		Flying: "Supersonic Skystrike",
		Ground: "Tectonic Rage",
		Fairy: "Twinkle Tackle",
	};

	BattleTooltips.prototype.showMoveTooltip = function (move, isZ) {
		var text = '';
		var basePowerText = '';
		var additionalInfo = '';
		var yourActive = this.battle.yourSide.active;
		var pokemon = this.battle.mySide.active[this.room.choice.choices.length];
		var pokemonData = this.room.myPokemon[pokemon.slot];

		if (isZ) {
			var item = Tools.getItem(pokemonData.item);
			if (item.zMoveFrom == move.name) {
				move = Tools.getMove(item.zMove);
			} else if (move.category === 'Status') {
				move = JSON.parse(JSON.stringify(move));
				move.name = 'Z-' + move.name;
				// TODO: show zMoveBoost/Effect
			} else {
				var zmove = Tools.getMove(this.zMoveTable[item.zMoveType]);
				zmove = JSON.parse(JSON.stringify(zmove));
				zmove.category = move.category;
				zmove.basePower = move.zMovePower;
				move = zmove;
				// TODO: Weather Ball type-changing shenanigans
			}
		}

		var basePower = move.basePower;

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
		var accuracy = this.getMoveAccuracy(move, pokemon);

		// Handle move type for moves that vary their type.
		var moveType = this.getMoveType(move, pokemon);

		// Deal with Nature Power special case, indicating which move it calls.
		if (move.id === 'naturepower') {
			var calls;
			if (this.battle.gen > 5) {
				if (this.battle.hasPseudoWeather('Electric Terrain')) {
					calls = 'Thunderbolt';
				} else if (this.battle.hasPseudoWeather('Grassy Terrain')) {
					calls = 'Energy Ball';
				} else if (this.battle.hasPseudoWeather('Misty Terrain')) {
					calls = 'Moonblast';
				} else if (this.battle.hasPseudoWeather('Psychic Terrain')) {
					calls = 'Psychic';
				} else {
					calls = 'Tri Attack';
				}
			} else if (this.battle.gen > 3) {
				// In gens 4 and 5 it calls Earthquake.
				calls = 'Earthquake';
			} else {
				// In gen 3 it calls Swift, so it retains its normal typing.
				calls = 'Swift';
			}
			calls = Tools.getMove(calls);
			additionalInfo = 'Calls ' + Tools.getTypeIcon(this.getMoveType(calls, pokemon)) + ' ' + calls.name;
		}

		text = '<div class="tooltipinner"><div class="tooltip">';
		var category = Tools.getCategory(move, this.battle.gen, moveType);
		text += '<h2>' + move.name + '<br />' + Tools.getTypeIcon(moveType) + ' <img src="' + Tools.resourcePrefix;
		text += 'sprites/categories/' + category + '.png" alt="' + category + '" /></h2>';
		text += basePowerText;
		if (additionalInfo) text += '<p>' + additionalInfo + '</p>';
		text += '<p>Accuracy: ' + accuracy + '</p>';
		if (move.desc) {
			if (this.battle.gen < 7 || this.battle.hardcoreMode) {
				var desc = move.shortDesc;
				for (var i = this.battle.gen; i < 7; i++) {
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
				if ('punch' in move.flags && (pokemonData.baseAbility === 'ironfist' || pokemon.ability === "Iron Fist")) {
					text += '<p class="movetag">&#x2713; Fist <small>(boosted by Iron Fist)</small></p>';
				}
				if ('pulse' in move.flags && (pokemonData.baseAbility === 'megalauncher' || pokemon.ability === "Mega Launcher")) {
					text += '<p class="movetag">&#x2713; Pulse <small>(boosted by Mega Launcher)</small></p>';
				}
				if ('bite' in move.flags && (pokemonData.baseAbility === 'strongjaw' || pokemon.ability === "Strong Jaw")) {
					text += '<p class="movetag">&#x2713; Bite <small>(boosted by Strong Jaw)</small></p>';
				}
				if ((move.recoil || move.hasCustomRecoil) && (pokemonData.baseAbility === 'reckless' || pokemon.ability === "Reckless")) {
					text += '<p class="movetag">&#x2713; Recoil <small>(boosted by Reckless)</small></p>';
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

	BattleTooltips.prototype.showPokemonTooltip = function (pokemon, pokemonData, isActive) {
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
		if (this.battle.gen < 7) {
			var table = BattleTeambuilderTable['gen' + this.battle.gen];
			if (template.speciesid in table.overrideType) types = table.overrideType[template.speciesid].split('/');
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
		} else if (this.battle.hardcoreMode) {
			if (pokemonData) {
				text += '<p>HP: ' + pokemonData.hp + '/' + pokemonData.maxhp + (pokemon.status ? ' <span class="status ' + pokemon.status + '">' + pokemon.status.toUpperCase() + '</span>' : '') + '</p>';
			}
		} else {
			var exacthp = '';
			if (pokemonData) exacthp = ' (' + pokemonData.hp + '/' + pokemonData.maxhp + ')';
			else if (pokemon.maxhp == 48) exacthp = ' <small>(' + pokemon.hp + '/' + pokemon.maxhp + ' pixels)</small>';
			text += '<p>HP: ' + pokemon.hpDisplay() + exacthp + (pokemon.status ? ' <span class="status ' + pokemon.status + '">' + pokemon.status.toUpperCase() + '</span>' : '') + '</p>';
		}
		var showOtherSees = !this.battle.hardcoreMode && isActive;
		if (pokemonData) {
			if (this.battle.gen > 2) {
				var abilityText = '';
				if (pokemon.ability && (pokemon.ability !== pokemon.baseAbility)) {
					abilityText = Tools.getAbility(pokemon.ability).name + ' (base: ' + Tools.getAbility(pokemon.baseAbility).name + ')';
				} else {
					abilityText = Tools.getAbility(pokemonData.baseAbility).name;
				}
				text += '<p>Ability: ' + abilityText;
				if (pokemonData.item) {
					text += ' / Item: ' + Tools.getItem(pokemonData.item).name;
				}
				text += '</p>';
			} else if (pokemonData.item) {
				item = Tools.getItem(pokemonData.item).name;
				text += '<p>Item: ' + item + '</p>';
			}
			text += '<p>' + pokemonData.stats['atk'] + '&nbsp;Atk /&nbsp;' + pokemonData.stats['def'] + '&nbsp;Def /&nbsp;' + pokemonData.stats['spa'];
			if (this.battle.gen === 1) {
				text += '&nbsp;Spc /&nbsp;';
			} else {
				text += '&nbsp;SpA /&nbsp;' + pokemonData.stats['spd'] + '&nbsp;SpD /&nbsp;';
			}
			text += pokemonData.stats['spe'] + '&nbsp;Spe</p>';
			if (showOtherSees) {
				if (this.battle.gen > 1) {
					var modifiedStats = this.calculateModifiedStats(pokemon, pokemonData);
					var statsText = this.makeModifiedStatText(pokemonData, modifiedStats);
					if (statsText.match('<b')) {
						text += '<p>After Modifiers:</p>';
						text += statsText;
					}
				}
				text += '<p class="section">Opponent sees:</p>';
			}
		} else {
			showOtherSees = !this.battle.hardcoreMode;
		}
		if (this.battle.gen > 2 && showOtherSees) {
			if (!pokemon.baseAbility && !pokemon.ability) {
				if (template.abilities) {
					var ability0 = template.abilities['0'];
					if (this.battle.gen < 7) {
						var table = BattleTeambuilderTable['gen' + this.battle.gen];
						if (template.speciesid in table.overrideAbility) ability0 = table.overrideAbility[template.speciesid];
					}
					text += '<p>Possible abilities: ' + Tools.getAbility(ability0).name;
					if (template.abilities['1']) text += ', ' + Tools.getAbility(template.abilities['1']).name;
					if (this.battle.gen > 4 && template.abilities['H']) text += ', ' + Tools.getAbility(template.abilities['H']).name;
					if (this.battle.gen > 6 && template.abilities['S']) text += ', ' + Tools.getAbility(template.abilities['S']).name;
					text += '</p>';
				}
			} else if (pokemon.ability) {
				if (pokemon.ability === pokemon.baseAbility) {
					text += '<p>Ability: ' + Tools.getAbility(pokemon.ability).name + '</p>';
				} else {
					text += '<p>Ability: ' + Tools.getAbility(pokemon.ability).name + ' (base: ' + Tools.getAbility(pokemon.baseAbility).name + ')' + '</p>';
				}
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

		if (pokemonData && !isActive) {
			text += '<p class="section">';
			var battlePokemon = this.battle.getPokemon(pokemon.ident, pokemon.details);
			for (var i = 0; i < pokemonData.moves.length; i++) {
				var move = Tools.getMove(pokemonData.moves[i]);
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
		} else if (!this.battle.hardcoreMode && pokemon.moveTrack && pokemon.moveTrack.length) {
			text += '<p class="section">';
			for (var i = 0; i < pokemon.moveTrack.length; i++) {
				text += '&#8226; ' + this.getPPUseText(pokemon.moveTrack[i]) + '<br />';
			}
			text += '</p>';
		}
		text += '</div></div>';
		return text;
	};

	BattleTooltips.prototype.calculateModifiedStats = function (pokemon, pokemonData) {
		var stats = {};
		for (var statName in pokemonData.stats) {
			stats[statName] = pokemonData.stats[statName];

			if (pokemon.boosts && pokemon.boosts[statName]) {
				var boostTable = [1, 1.5, 2, 2.5, 3, 3.5, 4];
				if (pokemon.boosts[statName] > 0) {
					stats[statName] *= boostTable[pokemon.boosts[statName]];
				} else {
					if (this.battle.gen <= 2) boostTable = [1, 100 / 66, 2, 2.5, 100 / 33, 100 / 28, 4];
					stats[statName] /= boostTable[-pokemon.boosts[statName]];
				}
				stats[statName] = Math.floor(stats[statName]);
			}
		}

		var ability = toId(pokemon.ability || pokemonData.baseAbility);
		if ('gastroacid' in pokemon.volatiles) ability = '';

		// check for burn, paralysis, guts, quick feet
		if (pokemon.status) {
			if (this.battle.gen > 2 && ability === 'guts') {
				stats.atk = Math.floor(stats.atk * 1.5);
			} else if (pokemon.status === 'brn') {
				stats.atk = Math.floor(stats.atk * 0.5);
			}

			if (this.battle.gen > 2 && ability === 'quickfeet') {
				stats.spe = Math.floor(stats.spe * 1.5);
			} else if (pokemon.status === 'par') {
				if (this.battle.gen > 6) {
					stats.spe = Math.floor(stats.spe * 0.5);
				} else {
					stats.spe = Math.floor(stats.spe * 0.25);
				}
			}
		}

		// gen 1 doesn't support items
		if (this.battle.gen <= 1) {
			for (var statName in stats) {
				if (stats[statName] > 999) stats[statName] = 999;
			}
			return stats;
		}

		var item = toId(pokemonData.item);
		if (ability === 'klutz' && item !== 'machobrace') item = '';
		var species = pokemon.baseSpecies;

		// check for light ball, thick club, metal/quick powder
		// the only stat modifying items in gen 2 were light ball, thick club, metal powder
		if (item === 'lightball' && species === 'Pikachu') {
			if (this.battle.gen >= 4) stats.atk *= 2;
			stats.spa *= 2;
		}

		if (item === 'thickclub') {
			if (species === 'Marowak' || species === 'Cubone') {
				stats.atk *= 2;
			}
		}

		if (species === 'Ditto' && !('transform' in pokemon.volatiles)) {
			if (item === 'quickpowder') {
				stats.spe *= 2;
			}
			if (item === 'metalpowder') {
				if (this.battle.gen === 2) {
					stats.def = Math.floor(stats.def * 1.5);
					stats.spd = Math.floor(stats.spd * 1.5);
				} else {
					stats.def *= 2;
				}
			}
		}

		// check abilities other than Guts and Quick Feet
		// check items other than light ball, thick club, metal/quick powder
		if (this.battle.gen <= 2) {
			return stats;
		}

		var weather = this.battle.weather;
		if (weather) {
			// Check if anyone has an anti-weather ability
			for (var i = 0; i < this.battle.p1.active.length; i++) {
				if (this.battle.p1.active[i] && this.battle.p1.active[i].ability in {'Air Lock': 1, 'Cloud Nine': 1}) {
					weather = '';
					break;
				}
				if (this.battle.p2.active[i] && this.battle.p2.active[i].ability in {'Air Lock': 1, 'Cloud Nine': 1}) {
					weather = '';
					break;
				}
			}
		}

		if (item === 'choiceband') {
			stats.atk = Math.floor(stats.atk * 1.5);
		}
		if (ability === 'purepower' || ability === 'hugepower') {
			stats.atk *= 2;
		}
		if (ability === 'hustle') {
			stats.atk = Math.floor(stats.atk * 1.5);
		}
		if (weather) {
			if (ability === 'flowergift' && (weather === 'sunnyday' || weather === 'desolateland')) {
				stats.atk = Math.floor(stats.atk * 1.5);
				stats.spd = Math.floor(stats.spd * 1.5);
			}
			if (ability === 'solarpower' && (weather === 'sunnyday' || weather === 'desolateland')) {
				stats.spa = Math.floor(stats.spa * 1.5);
			}
			if (this.battle.gen >= 4 && (pokemon.types[0] === 'Rock' || pokemon.types[1] === 'Rock') && weather === 'sandstorm') {
				stats.spd = Math.floor(stats.spd * 1.5);
			}
			if (ability === 'chlorophyll' && (weather === 'sunnyday' || weather === 'desolateland')) {
				stats.spe *= 2;
			}
			if (ability === 'swiftswim' && (weather === 'raindance' || weather === 'primordialsea')) {
				stats.spe *= 2;
			}
			if (ability === 'sandrush' && weather === 'sandstorm') {
				stats.spe *= 2;
			}
			if (ability === 'slushrush' && weather === 'hail') {
				stats.spe *= 2;
			}
		}
		if (ability === 'defeatist' && pokemonData.hp <= pokemonData.maxhp / 2) {
			stats.atk = Math.floor(stats.atk * 0.5);
			stats.spa = Math.floor(stats.spa * 0.5);
		}
		if (pokemon.volatiles) {
			if ('slowstart' in pokemon.volatiles) {
				stats.atk = Math.floor(stats.atk * 0.5);
				stats.spe = Math.floor(stats.spe * 0.5);
			}
			if (ability === 'unburden' && 'itemremoved' in pokemon.volatiles && !item) {
				stats.spe *= 2;
			}
		}
		if (ability === 'marvelscale' && pokemon.status) {
			stats.def = Math.floor(stats.def * 1.5);
		}
		if (item === 'eviolite' && Tools.getTemplate(pokemon.species).evos) {
			stats.def = Math.floor(stats.def * 1.5);
			stats.spd = Math.floor(stats.spd * 1.5);
		}
		if (ability === 'grasspelt' && this.battle.hasPseudoWeather('grassyterrain')) {
			stats.def = Math.floor(stats.def * 1.5);
		}
		if (ability === 'surgesurfer' && this.battle.hasPseudoWeather('electricterrain')) {
			stats.spe *= 2;
		}
		if (item === 'choicespecs') {
			stats.spa = Math.floor(stats.spa * 1.5);
		}
		if (ability === 'flareboost' && pokemon.status === 'brn') {
			stats.spa = Math.floor(stats.spa * 1.5);
		}
		if (item === 'deepseatooth' && species === 'Clamperl') {
			stats.spa *= 2;
		}
		if (item === 'souldew' && this.battle.gen <= 6 && (species === 'Latios' || species === 'Latias')) {
			stats.spa = Math.floor(stats.spa * 1.5);
			stats.spd = Math.floor(stats.spd * 1.5);
		}
		if (ability === 'plus' || ability === 'minus') {
			var allyActive = pokemon.side.active;
			if (allyActive.length > 1) {
				var abilityName = (ability === 'plus' ? 'Plus' : 'Minus');
				for (var i = 0; i < allyActive.length; i++) {
					var ally = allyActive[i];
					if (!(ally && ally !== pokemon && !ally.fainted)) continue;
					if (!(ally.ability === 'Plus' || ally.ability === 'Minus')) continue;
					if (this.battle.gen <= 4 && ally.ability === abilityName) continue;
					stats.spa = Math.floor(stats.spa * 1.5);
					break;
				}
			}
		}
		if (item === 'assaultvest') {
			stats.spd = Math.floor(stats.spd * 1.5);
		}
		if (item === 'deepseascale' && species === 'Clamperl') {
			stats.spd *= 2;
		}
		if (item === 'choicescarf') {
			stats.spe = Math.floor(stats.spe * 1.5);
		}
		if (item === 'ironball' || item === 'machobrace') {
			stats.spe = Math.floor(stats.spe * 0.5);
		}
		if (ability === 'furcoat') {
			stats.def *= 2;
		}

		return stats;
	};

	BattleTooltips.prototype.makeModifiedStatText = function (pokemonData, modifiedStats) {
		var statsText = '<p>';
		var statTable = {atk: '&nbsp;Atk /&nbsp;', def: '&nbsp;Def /&nbsp;', spa: '&nbsp;SpA /&nbsp;',
						 spc: '&nbsp;Spc /&nbsp;', spd: '&nbsp;SpD /&nbsp;', spe: '&nbsp;Spe</p>'};
		statsText += this.boldModifiedStat(pokemonData, modifiedStats, 'atk') + statTable['atk'];
		statsText += this.boldModifiedStat(pokemonData, modifiedStats, 'def') + statTable['def'];
		statsText += this.boldModifiedStat(pokemonData, modifiedStats, 'spa');
		if (this.battle.gen === 1) {
			statsText += statTable['spc'];
		} else {
			statsText += statTable['spa'];
			statsText += this.boldModifiedStat(pokemonData, modifiedStats, 'spd') + statTable['spd'];
		}
		statsText += this.boldModifiedStat(pokemonData, modifiedStats, 'spe') + statTable['spe'];
		return statsText;
	};

	BattleTooltips.prototype.boldModifiedStat = function (pokemonData, modifiedStats, statName) {
		var statText = '';
		if (pokemonData.stats[statName] === modifiedStats[statName]) {
			statText += '' + modifiedStats[statName];
		} else if (pokemonData.stats[statName] > modifiedStats[statName]) {
			statText += '<b class="stat-lowered">' + modifiedStats[statName] + '</b>';
		} else {
			statText += '<b class="stat-boosted">' + modifiedStats[statName] + '</b>';
		}
		return statText;
	};

	BattleTooltips.prototype.getPPUseText = function (moveTrackRow, showKnown) {
		var moveName = moveTrackRow[0];
		var ppUsed = moveTrackRow[1];
		var move, maxpp;
		if (moveName.charAt(0) === '*') {
			move = Tools.getMove(moveName.substr(1));
			maxpp = 5;
		} else {
			move = Tools.getMove(moveName);
			maxpp = move.pp;
			if (this.battle.gen < 7) {
				var table = BattleTeambuilderTable['gen' + this.battle.gen];
				if (move.id in table.overridePP) maxpp = table.overridePP[move.id];
			}
			maxpp = Math.floor(maxpp * 8 / 5);
		}
		if (ppUsed === Infinity) return move.name + ' <small>(0/' + maxpp + ')</small>';
		if (ppUsed || moveName.charAt(0) === '*') return move.name + ' <small>(' + (maxpp - ppUsed) + '/' + maxpp + ')</small>';
		return move.name + (showKnown ? ' <small>(revealed)</small>' : '');
	};

	// Functions to calculate speed ranges of an opponent.
	BattleTooltips.prototype.getTemplateMinSpeed = function (template, level) {
		var baseSpe = template.baseStats['spe'];
		var tier = this.battle.tier;
		var gen = this.battle.gen;
		if (gen < 7) {
			var overrideStats = BattleTeambuilderTable['gen' + gen].overrideStats[template.id];
			if (overrideStats && 'spe' in overrideStats) baseSpe = overrideStats['spe'];
		}

		var nature = (tier.indexOf('Random Battle') >= 0 || (tier.indexOf('Random') >= 0 && tier.indexOf('Battle') >= 0 && gen >= 7) || gen < 3) ? 1 : 0.9;
		return Math.floor(Math.floor(2 * baseSpe * level / 100 + 5) * nature);
	};
	BattleTooltips.prototype.getTemplateMaxSpeed = function (template, level) {
		var baseSpe = template.baseStats['spe'];
		var tier = this.battle.tier;
		var gen = this.battle.gen;
		if (gen < 7) {
			var overrideStats = BattleTeambuilderTable['gen' + gen].overrideStats[template.id];
			if (overrideStats && 'spe' in overrideStats) baseSpe = overrideStats['spe'];
		}

		var iv = (gen < 3) ? 30 : 31;
		var value = iv + (((tier.indexOf('Random') >= 0 && tier.indexOf('Battle') >= 0 && gen >= 7) || (tier.indexOf('Random Battle') >= 0 && gen >= 3)) ? 21 : 63);
		var nature = (this.battle.tier.indexOf('Random Battle') >= 0 || gen < 3) ? 1 : 1.1;
		return Math.floor(Math.floor(Math.floor(2 * baseSpe + value) * level / 100 + 5) * nature);
	};

	// Gets the proper current type for moves with a variable type.
	BattleTooltips.prototype.getMoveType = function (move, pokemon) {
		var pokemonData = this.room.myPokemon[pokemon.slot] || pokemon;
		var ability = Tools.getAbility(pokemonData.baseAbility).name;
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
			if (move.id === 'multiattack') {
				var item = Tools.getItem(pokemonData.item);
				if (item.onMemory) moveType = item.onMemory;
			}
			if (move.id === 'judgment') {
				var item = Tools.getItem(pokemonData.item);
				if (item.onPlate && !item.zMove) moveType = item.onPlate;
			}
			if (move.id === 'technoblast') {
				var item = Tools.getItem(pokemonData.item);
				if (item.onDrive) moveType = item.onDrive;
			}
			if (move.id === 'naturalgift') {
				var item = Tools.getItem(pokemonData.item);
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
		if ('sound' in move.flags && ability === 'Liquid Voice') moveType = 'Water';
		if (moveType === 'Normal' && move.category && move.category !== 'Status' && !(move.id in {'naturalgift': 1, 'struggle': 1})) {
			if (ability === 'Aerilate') moveType = 'Flying';
			if (ability === 'Galvanize') moveType = 'Electric';
			if (ability === 'Pixilate') moveType = 'Fairy';
			if (ability === 'Refrigerate') moveType = 'Ice';
		}
		return moveType;
	};

	BattleTooltips.prototype.makePercentageChangeText = function (boost, source) {
		return ' (&times;' + boost + ' from ' + source + ')';
	};

	// Gets the current accuracy for a move.
	BattleTooltips.prototype.getMoveAccuracy = function (move, pokemon) {
		var pokemonData = this.room.myPokemon[pokemon.slot];
		var ability = Tools.getAbility(pokemon.ability || pokemonData.baseAbility).name;
		var accuracy = move.accuracy;
		if (this.battle.gen < 7) {
			var table = BattleTeambuilderTable['gen' + this.battle.gen];
			if (move.id in table.overrideAcc) accuracy = table.overrideAcc[move.id];
		}
		var accuracyComment = '%';
		if (move.id === 'blizzard' && this.battle.weather === 'hail') return '&mdash; (Boosted by Hail)';
		if (move.id === 'hurricane' || move.id === 'thunder') {
			if (this.battle.weather === 'raindance' || this.battle.weather === 'primordialsea') return '&mdash; (Boosted by Rain)';
			if (this.battle.weather === 'sunnyday' || this.battle.weather === 'desolateland') {
				accuracy = 50;
				accuracyComment += ' (Reduced by Sun)';
			}
		}
		if (!accuracy || accuracy === true) return '&mdash;';
		if (ability === 'No Guard') return '&mdash; (Boosted by No Guard)';
		if (move.ohko) {
			if (this.battle.gen === 1) return accuracy + '% (Will fail if target\'s speed is higher)';
			return accuracy + '% (Will fail if target\'s level is higher, increases 1% per each level above target)';
		}
		if (pokemon.boosts && pokemon.boosts.accuracy) {
			if (pokemon.boosts.accuracy > 0) {
				accuracy *= (pokemon.boosts.accuracy + 3) / 3;
			} else {
				accuracy *= 3 / (3 - pokemon.boosts.accuracy);
			}
		}
		if (ability === 'Hustle' && move.category === 'Physical') {
			accuracy *= 0.8;
			accuracyComment += this.makePercentageChangeText(0.8, 'Hustle');
		}
		if (ability === 'Compound Eyes') {
			accuracy *= 1.3;
			accuracyComment += this.makePercentageChangeText(1.3, 'Compound Eyes');
		}
		for (var i = 0; i < pokemon.side.active.length; i++) {
			if (!pokemon.side.active[i] || pokemon.side.active[i].zerohp) continue;
			ability = Tools.getAbility(pokemon.side.pokemon[i].ability).name;
			if (ability === 'Victory Star') {
				accuracy *= 1.1;
				accuracyComment += this.makePercentageChangeText(1.1, 'Victory Star');
			}
		}
		if (pokemonData.item === 'widelens' && !this.battle.hasPseudoWeather('Magic Room') && !(pokemon.volatiles && pokemon.volatiles['embargo'])) {
			accuracy *= 1.1;
			accuracyComment += this.makePercentageChangeText(1.1, 'Wide Lens');
		}
		if (this.battle.hasPseudoWeather('Gravity')) {
			accuracy *= 5 / 3;
			accuracyComment += this.makePercentageChangeText(1.66, 'Gravity');
		}
		return Math.round(accuracy) + accuracyComment;
	};

	// Gets the proper current base power for moves which have a variable base power.
	// Takes into account the target for some moves.
	// If it is unsure of the actual base power, it gives an estimate.
	BattleTooltips.prototype.getMoveBasePower = function (move, pokemon, target) {
		if (!target) target = this.room.myPokemon[0]; // fallback
		var pokemonData = this.room.myPokemon[pokemon.slot];
		if (!pokemonData) return '' + move.basePower;
		var ability = Tools.getAbility(pokemonData.baseAbility).name;
		var item = {};
		var basePower = move.basePower;
		if (this.battle.gen < 7) {
			var table = BattleTeambuilderTable['gen' + this.battle.gen];
			if (move.id in table.overrideBP) basePower = table.overrideBP[move.id];
		}
		var basePowerComment = '';
		var thereIsWeather = !!this.battle.weather;
		if (move.id === 'acrobatics') {
			if (!pokemonData.item) {
				basePower *= 2;
				basePowerComment = this.makePercentageChangeText(2, 'Acrobatics + no item');
			}
		}
		if (move.id === 'crushgrip' || move.id === 'wringout') {
			basePower = Math.floor(Math.floor((120 * (100 * Math.floor(target.hp * 4096 / target.maxhp)) + 2048 - 1) / 4096) / 100) || 1;
			basePowerComment = ' (Approximation)';
		}
		if (move.id === 'eruption' || move.id === 'waterspout') {
			basePower = Math.floor(150 * pokemon.hp / pokemon.maxhp) || 1;
		}
		if (move.id === 'facade' && !(pokemon.status in {'': 1, 'slp': 1, 'frz': 1})) {
			basePower *= 2;
			basePowerComment = this.makePercentageChangeText(2, 'Facade + status');
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
			basePowerComment = this.makePercentageChangeText(2, 'Hex + status');
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
				basePowerComment = this.makePercentageChangeText(2, 'Smelling Salts + Paralysis');
			}
		}
		if (move.id === 'storedpower' || move.id == 'powertrip') {
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
				basePowerComment = this.makePercentageChangeText(2, 'Venoshock + Poison');
			}
		}
		if (move.id === 'wakeupslap') {
			if (target.status === 'slp') {
				basePower *= 2;
				basePowerComment = this.makePercentageChangeText(2, 'Wake-Up Slap + Sleep');
			}
		}
		if (move.id === 'weatherball' && thereIsWeather) {
			basePower = 100;
		}
		if (move.id === 'watershuriken' && pokemon.species === 'Greninja-Ash' && pokemon.ability === 'Battle Bond') {
			basePower += 5;
		}
		// Moves that check opponent speed.
		var template = target;
		if (target.volatiles && target.volatiles.formechange) template = Tools.getTemplate(target.volatiles.formechange[2]);
		if (move.id === 'electroball') {
			var min = 0;
			var max = 0;
			var minRatio = (pokemonData.stats['spe'] / this.getTemplateMaxSpeed(template, target.level));
			var maxRatio = (pokemonData.stats['spe'] / this.getTemplateMinSpeed(template, target.level));
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
			var min = (Math.floor(25 * this.getTemplateMinSpeed(template, target.level) / pokemonData.stats['spe']) || 1);
			var max = (Math.floor(25 * this.getTemplateMaxSpeed(template, target.level) / pokemonData.stats['spe']) || 1);
			if (min > 150) min = 150;
			if (max > 150) max = 150;
			// Special case due to range as well.
			return this.boostBasePowerRange(move, pokemon, min, max);
		}
		// Movements which have base power changed due to items.
		if (pokemonData.item && !this.battle.hasPseudoWeather('Magic Room') && (!pokemon.volatiles || !pokemon.volatiles['embargo'])) {
			item = Tools.getItem(pokemonData.item);
			if (move.id === 'fling') {
				if (item.fling) basePower = item.fling.basePower;
			}
			if (move.id === 'naturalgift') {
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
		var abilityBoost = 0;
		if (ability === 'Water Bubble' && move.type === 'Water') {
			abilityBoost = 2;
		} else if ((ability === 'Flare Boost' && pokemon.status === 'brn' && move.category === 'Special') ||
			(ability === 'Mega Launcher' && move.flags['pulse']) ||
			(ability === 'Steelworker' && move.type === 'Steel') ||
			(ability === 'Strong Jaw' && move.flags['bite']) ||
			(ability === 'Technician' && basePower <= 60) ||
			(ability === 'Toxic Boost' && (pokemon.status === 'psn' || pokemon.status === 'tox') && move.category === 'Physical')) {
			abilityBoost = 1.5;
		} else if ((ability === 'Sand Force' && this.battle.weather === 'sandstorm' && (move.type === 'Rock' || move.type === 'Ground' || move.type === 'Steel')) ||
			(ability === 'Sheer Force' && move.secondaries) ||
			(ability === 'Tough Claws' && move.flags['contact'])) {
			abilityBoost = 1.3;
		} else if (ability === 'Rivalry' && pokemon.gender && target.gender) {
			if (pokemon.gender === target.gender) {
				abilityBoost = 1.25;
			} else {
				abilityBoost = 0.75;
			}
		} else if (move.type === 'Normal' && move.category !== 'Status' &&
			ability in {'Aerilate': 1, 'Galvanize':1, 'Pixilate': 1, 'Refrigerate': 1} &&
			!(move.id in {'naturalgift': 1, 'struggle': 1} ||
			  move.id === 'weatherball' && thereIsWeather ||
			  move.id === 'multiattack' && item.onMemory ||
			  move.id === 'judgment' && item.onPlate ||
			  move.id === 'technoblast' && item.onDrive)) {
			abilityBoost = (this.battle.gen > 6 ? 1.2 : 1.3);
		} else if ((ability === 'Iron Fist' && move.flags['punch']) ||
			(ability === 'Reckless' && (move.recoil || move.hasCustomRecoil)) ||
			(ability === 'Normalize' && this.battle.gen > 6)) {
			abilityBoost = 1.2;
		}
		if (abilityBoost) {
			basePower = Math.floor(basePower * abilityBoost);
			basePowerComment = this.makePercentageChangeText(abilityBoost, ability);
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
		var pokemonData = this.room.myPokemon[pokemon.slot];
		if (!pokemonData.item || this.battle.hasPseudoWeather('Magic Room') || pokemon.volatiles && pokemon.volatiles['embargo']) return 0;

		var item = Tools.getItem(pokemonData.item);
		var moveType = this.getMoveType(move, pokemon);
		var itemName = item.name;
		var moveName = move.name;

		// Plates
		if (item.onPlate === moveType && !item.zMove) return 1.2;

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
			var pokemonData = this.room.myPokemon[pokemon.slot];
			basePowerComment += this.makePercentageChangeText(itemBoost, Tools.getItem(pokemonData.item).name);
		}
		return basePower + basePowerComment;
	};
	BattleTooltips.prototype.boostBasePowerRange = function (move, pokemon, min, max) {
		var pokemonData = this.room.myPokemon[pokemon.slot];
		var technician = Tools.getAbility(pokemonData.baseAbility).name === 'Technician';
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
		if (technician) basePowerComment += this.makePercentageChangeText(1.5, 'Technician');
		if (itemBoost) basePowerComment += this.makePercentageChangeText(itemBoost, Tools.getItem(pokemonData.item).name);
		return basePowerComment;
	};
	return BattleTooltips;
})();
