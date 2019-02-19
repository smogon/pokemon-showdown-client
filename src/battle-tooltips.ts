/**
 * Pokemon Showdown Tooltips
 *
 * A file for generating tooltips for battles. This should be IE7+ and
 * use the DOM directly.
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 */

class ModifiableValue {
	value = 0;
	maxValue = 0;
	comment: string[];
	battle: Battle;
	pokemon: Pokemon | null;
	serverPokemon: ServerPokemon;
	itemName: string;
	abilityName: string;
	weatherName: string;
	isAccuracy = false;
	constructor(battle: Battle, pokemon: Pokemon | null, serverPokemon: ServerPokemon) {
		this.comment = [];
		this.battle = battle;
		this.pokemon = pokemon;
		this.serverPokemon = serverPokemon;

		this.itemName = Dex.getItem(serverPokemon.item).name;
		this.abilityName = Dex.getAbility(serverPokemon.ability || (pokemon && pokemon.ability) || serverPokemon.baseAbility).name;
		this.weatherName = Dex.getMove(battle.weather).name;
	}
	reset(value = 0, isAccuracy?: boolean) {
		this.value = value;
		this.maxValue = 0;
		this.isAccuracy = !!isAccuracy;
		this.comment = [];
	}
	tryItem(itemName: string) {
		if (itemName !== this.itemName) return false;
		if (this.battle.hasPseudoWeather('Magic Room')) {
			this.comment.push(` (${itemName} suppressed by Magic Room)`);
			return false;
		}
		if (this.pokemon && this.pokemon.volatiles['embargo']) {
			this.comment.push(` (${itemName} suppressed by Embargo)`);
			return false;
		}
		const ignoreKlutz = ["Macho Brace", "Power Anklet", "Power Band", "Power Belt", "Power Bracer", "Power Lens", "Power Weight"];
		if (this.tryAbility('Klutz') && !ignoreKlutz.includes(itemName)) {
			this.comment.push(` (${itemName} suppressed by Klutz)`);
			return false;
		}
		return true;
	}
	tryAbility(abilityName: string) {
		if (abilityName !== this.abilityName) return false;
		if (this.pokemon && this.pokemon.volatiles['gastroacid']) {
			this.comment.push(` (${abilityName} suppressed by Gastro Acid)`);
			return false;
		}
		return true;
	}
	tryWeather(weatherName?: string) {
		if (!this.weatherName) return false;
		if (!weatherName) weatherName = this.weatherName;
		else if (weatherName !== this.weatherName) return false;
		for (const side of this.battle.sides) {
			for (const active of side.active) {
				if (active && ['Air Lock', 'Cloud Nine'].includes(active.ability)) {
					this.comment.push(` (${weatherName} suppressed by ${active.ability})`);
					return false;
				}
			}
		}
		return true;
	}
	itemModify(factor: number, itemName?: string) {
		if (!itemName) itemName = this.itemName;
		if (!itemName) return false;
		if (!this.tryItem(itemName)) return false;
		return this.modify(factor, itemName);
	}
	abilityModify(factor: number, abilityName: string) {
		if (!this.tryAbility(abilityName)) return false;
		return this.modify(factor, abilityName);
	}
	weatherModify(factor: number, weatherName?: string, name?: string) {
		if (!weatherName) weatherName = this.weatherName;
		if (!weatherName) return false;
		if (!this.tryWeather(weatherName)) return false;
		return this.modify(factor, name || weatherName);
	}
	modify(factor: number, name?: string) {
		if (factor === 0) {
			if (name) this.comment.push(` (${name})`);
			this.value = 0;
			this.maxValue = 0;
			return true;
		}
		if (name) this.comment.push(` (${factor}&times; from ${name})`);
		this.value *= factor;
		if (!(name === 'Technician' && this.maxValue > 60)) this.maxValue *= factor;
		return true;
	}
	set(value: number, reason?: string) {
		if (reason) this.comment.push(` (${reason})`);
		this.value = value;
		this.maxValue = 0;
		return true;
	}
	setRange(value: number, maxValue: number, reason?: string) {
		if (reason) this.comment.push(` (${reason})`);
		this.value = value;
		this.maxValue = maxValue;
		return true;
	}
	toString() {
		let valueString;
		const roundedValue = this.value ? Number(this.value.toFixed(2)) : 0;
		const roundedMaxValue = this.maxValue ? Number(this.maxValue.toFixed(2)) : 0;
		if (this.isAccuracy) {
			valueString = this.value ? `${roundedValue}%` : `can't miss`;
		} else {
			valueString = this.value ? `${roundedValue}` : ``;
		}
		if (this.maxValue) {
			valueString += ` to ${roundedMaxValue}` + (this.isAccuracy ? '%' : '');
		}
		return valueString + this.comment.join('');
	}
}

class BattleTooltips {
	battle: Battle;

	constructor(battle: Battle) {
		this.battle = battle;
	}

	// tooltips
	// Touch delay, pressing finger more than that time will cause the tooltip to open.
	// Shorter time will cause the button to click
	static LONG_TAP_DELAY = 350; // ms
	static longTapTimeout = 0;
	static elem: HTMLDivElement | null = null;
	static parentElem: HTMLElement | null = null;
	static isLocked = false;

	static hideTooltip() {
		if (!BattleTooltips.elem) return;
		BattleTooltips.cancelLongTap();
		BattleTooltips.elem.parentNode!.removeChild(BattleTooltips.elem);
		BattleTooltips.elem = null;
		BattleTooltips.parentElem = null;
		BattleTooltips.isLocked = false;
		$('#tooltipwrapper').removeClass('tooltip-locked');
	}

	static cancelLongTap() {
		if (BattleTooltips.longTapTimeout) {
			clearTimeout(BattleTooltips.longTapTimeout);
			BattleTooltips.longTapTimeout = 0;
		}
	}

	lockTooltip() {
		if (BattleTooltips.elem && !BattleTooltips.isLocked) {
			BattleTooltips.isLocked = true;
			$('#tooltipwrapper').addClass('tooltip-locked');
		}
	}

	handleTouchEnd(e: TouchEvent) {
		BattleTooltips.cancelLongTap();

		if (!BattleTooltips.isLocked) BattleTooltips.hideTooltip();
	}

	listen(elem: HTMLElement) {
		const $elem = $(elem);
		$elem.on('mouseover', '.has-tooltip', this.showTooltipEvent);
		$elem.on('click', '.has-tooltip', this.clickTooltipEvent);
		$elem.on('touchstart', '.has-tooltip', this.holdLockTooltipEvent);
		$elem.on('touchend', '.has-tooltip', BattleTooltips.unshowTooltip);
		$elem.on('touchleave', '.has-tooltip', BattleTooltips.unshowTooltip);
		$elem.on('touchcancel', '.has-tooltip', BattleTooltips.unshowTooltip);
		$elem.on('focus', '.has-tooltip', this.showTooltipEvent);
		$elem.on('mouseout', '.has-tooltip', BattleTooltips.unshowTooltip);
		$elem.on('mousedown', '.has-tooltip', this.holdLockTooltipEvent);
		$elem.on('blur', '.has-tooltip', BattleTooltips.unshowTooltip);
		$elem.on('mouseup', '.has-tooltip', BattleTooltips.unshowTooltip);
	}

	clickTooltipEvent = (e: Event) => {
		if (BattleTooltips.isLocked) {
			e.preventDefault();
			e.stopImmediatePropagation();
		}
	};
	/**
	 * An event that will lock a tooltip if held down
	 *
	 * (Namely, a long-tap or long-click)
	 */
	holdLockTooltipEvent = (e: Event) => {
		if (BattleTooltips.isLocked) BattleTooltips.hideTooltip();
		const target = e.currentTarget as HTMLElement;
		this.showTooltip(target);
		let factor = (e.type === 'mousedown' && target.tagName === 'BUTTON' ? 2 : 1);

		BattleTooltips.longTapTimeout = setTimeout(() => {
			BattleTooltips.longTapTimeout = 0;
			this.lockTooltip();
		}, BattleTooltips.LONG_TAP_DELAY * factor);
	};

	showTooltipEvent = (e: Event) => {
		if (BattleTooltips.isLocked) return;
		this.showTooltip(e.currentTarget as HTMLElement);
	};

	/**
	 * Only hides tooltips if they're not locked
	 */
	static unshowTooltip() {
		if (BattleTooltips.isLocked) return;
		BattleTooltips.hideTooltip();
	}

	showTooltip(elem: HTMLElement) {
		const args = (elem.dataset.tooltip || '').split('|');
		const [type] = args;
		/**
		 * If false, we instead attach the tooltip above the parent element.
		 * This is important for the move/switch menus so the tooltip doesn't
		 * cover up buttons above the hovered button.
		 */
		const ownHeight = !!elem.dataset.ownheight;

		let buf: string;
		switch (type) {
		case 'move':
		case 'zmove': { // move|MOVE|ACTIVEPOKEMON
			let move = this.battle.dex.getMove(args[1]);
			let index = parseInt(args[2], 10);
			let pokemon = this.battle.mySide.active[index]!;
			let serverPokemon = this.battle.myPokemon![index];
			buf = this.showMoveTooltip(move, type === 'zmove', pokemon, serverPokemon);
			break;
		}

		case 'pokemon': { // pokemon|SIDE|POKEMON
			// mouse over sidebar pokemon
			// pokemon definitely exists, serverPokemon always ignored
			let sideIndex = parseInt(args[1], 10);
			let side = this.battle.sides[sideIndex];
			let pokemon = side.pokemon[parseInt(args[2], 10)];
			buf = this.showPokemonTooltip(pokemon);
			break;
		}
		case 'activepokemon': { // activepokemon|SIDE|ACTIVE
			// mouse over active pokemon
			// pokemon definitely exists, serverPokemon maybe
			let sideIndex = parseInt(args[1], 10);
			let side = this.battle.sides[sideIndex];
			let activeIndex = parseInt(args[2], 10);
			let pokemon = side.active[activeIndex];
			let serverPokemon = null;
			if (sideIndex === 0 && this.battle.myPokemon) {
				serverPokemon = this.battle.myPokemon[activeIndex];
			}
			if (!pokemon) return false;
			buf = this.showPokemonTooltip(pokemon, serverPokemon, true);
			break;
		}
		case 'switchpokemon': { // switchpokemon|POKEMON
			// mouse over switchable pokemon
			// serverPokemon definitely exists, sidePokemon maybe
			let side = this.battle.sides[0];
			let activeIndex = parseInt(args[1], 10);
			let pokemon = null;
			if (activeIndex < side.active.length) {
				pokemon = side.active[activeIndex];
			}
			let serverPokemon = this.battle.myPokemon![activeIndex];
			buf = this.showPokemonTooltip(pokemon, serverPokemon);
			break;
		}
		default:
			throw new Error(`unrecognized type`);
		}

		let offset = {
			left: 150,
			top: 500,
		};
		if (elem) offset = $(elem).offset()!;
		let x = offset.left - 2;
		if (elem) {
			offset = (ownHeight ? $(elem) : $(elem).parent()).offset()!;
		}
		let y = offset.top - 5;

		if (y < 140) y = 140;
		// if (x > room.leftWidth + 335) x = room.leftWidth + 335;
		if (x > $(window).width()! - 305) x = Math.max($(window).width()! - 305, 0);
		if (x < 0) x = 0;

		let $wrapper = $('#tooltipwrapper');
		if (!$wrapper.length) {
			$wrapper = $(`<div id="tooltipwrapper" role="tooltip"></div>`);
			$(document.body).append($wrapper);
		} else {
			$wrapper.removeClass('tooltip-locked');
		}
		$wrapper.css({
			left: x,
			top: y,
		});
		buf = `<div class="tooltipinner"><div class="tooltip">${buf}</div></div>`;
		$wrapper.html(buf).appendTo(document.body);
		BattleTooltips.elem = $wrapper.find('.tooltip')[0] as HTMLDivElement;
		BattleTooltips.isLocked = false;
		if (elem) {
			let height = $(BattleTooltips.elem).height()!;
			if (height > y) {
				y += height + 10;
				if (ownHeight) y += $(elem).height()!;
				else y += $(elem).parent().height()!;
				$wrapper.css('top', y);
			}
		}
		BattleTooltips.parentElem = elem;
		return true;
	}

	hideTooltip() {
		BattleTooltips.hideTooltip();
	}

	static zMoveEffects: {[zEffect: string]: string} = {
		'clearnegativeboost': "Restores negative stat stages to 0",
		'crit2': "Crit ratio +2",
		'heal': "Restores HP 100%",
		'curse': "Restores HP 100% if user is Ghost type, otherwise Attack +1",
		'redirect': "Redirects opposing attacks to user",
		'healreplacement': "Restores replacement's HP 100%",
	};

	getStatusZMoveEffect(move: Move) {
		if (move.zMoveEffect in BattleTooltips.zMoveEffects) {
			return BattleTooltips.zMoveEffects[move.zMoveEffect];
		}
		let boostText = '';
		if (move.zMoveBoost) {
			let boosts = Object.keys(move.zMoveBoost) as StatName[];
			boostText = boosts.map(stat =>
				BattleStats[stat] + ' +' + move.zMoveBoost![stat]
			).join(', ');
		}
		return boostText;
	}

	static zMoveTable: {[type in TypeName]: string} = {
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
		"???": "",
	};

	showMoveTooltip(move: Move, isZ: boolean, pokemon: Pokemon, serverPokemon: ServerPokemon) {
		let text = '';

		let zEffect = '';
		let foeActive = pokemon.side.foe.active;
		// TODO: move this somewhere it makes more sense
		if (pokemon.ability === '(suppressed)') serverPokemon.ability = '(suppressed)';
		let ability = toId(serverPokemon.ability || pokemon.ability || serverPokemon.baseAbility);

		let value = new ModifiableValue(this.battle, pokemon, serverPokemon);

		if (isZ) {
			let item = this.battle.dex.getItem(serverPokemon.item);
			if (item.zMoveFrom === move.name) {
				move = this.battle.dex.getMove(item.zMove as string);
			} else if (move.category === 'Status') {
				move = new Move(move.id, "", {
					...move,
					name: 'Z-' + move.name,
				});
				zEffect = this.getStatusZMoveEffect(move);
			} else {
				const zMove = this.battle.dex.getMove(BattleTooltips.zMoveTable[item.zMoveType as TypeName]);
				move = new Move(zMove.id, zMove.name, {
					...zMove,
					category: move.category,
					basePower: move.zMovePower,
				});
				// TODO: Weather Ball type-changing shenanigans
			}
		}

		text += '<h2>' + move.name + '<br />';

		// Handle move type for moves that vary their type.
		let [moveType, category] = this.getMoveType(move, value);

		text += Dex.getTypeIcon(moveType);
		text += ` <img src="${Dex.resourcePrefix}sprites/categories/${category}.png" alt="${category}" /></h2>`;

		// Check if there are more than one active Pokémon to check for multiple possible BPs.
		let showingMultipleBasePowers = false;
		if (category !== 'Status' && foeActive.length > 1) {
			// We check if there is a difference in base powers to note it.
			// Otherwise, it is just shown as in singles.
			// The trick is that we need to calculate it first for each Pokémon to see if it changes.
			let prevBasePower: string | null = null;
			let basePower: string = '';
			let difference = false;
			let basePowers = [];
			for (const active of foeActive) {
				if (!active) continue;
				value = this.getMoveBasePower(move, moveType, value, active);
				basePower = '' + value;
				if (prevBasePower === null) prevBasePower = basePower;
				if (prevBasePower !== basePower) difference = true;
				basePowers.push('Base power vs ' + active.name + ': ' + basePower);
			}
			if (difference) {
				text += '<p>' + basePowers.join('<br />') + '</p>';
				showingMultipleBasePowers = true;
			}
			// Falls through to not to repeat code on showing the base power.
		}
		if (!showingMultipleBasePowers && category !== 'Status') {
			let activeTarget = foeActive[0] || foeActive[1] || foeActive[2];
			value = this.getMoveBasePower(move, moveType, value, activeTarget);
			text += '<p>Base power: ' + value + '</p>';
		}

		let accuracy = this.getMoveAccuracy(move, value);

		// Deal with Nature Power special case, indicating which move it calls.
		if (move.id === 'naturepower') {
			let calls;
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
			let calledMove = this.battle.dex.getMove(calls);
			text += 'Calls ' + Dex.getTypeIcon(this.getMoveType(calledMove, value)[0]) + ' ' + calledMove.name;
		}

		text += '<p>Accuracy: ' + accuracy + '</p>';
		if (zEffect) text += '<p>Z-Effect: ' + zEffect + '</p>';

		if (this.battle.gen < 7 || this.battle.hardcoreMode) {
			text += '<p class="section">' + move.shortDesc + '</p>';
		} else {
			text += '<p class="section">';
			if (move.priority > 1) {
				text += 'Nearly always moves first <em>(priority +' + move.priority + ')</em>.</p><p>';
			} else if (move.priority <= -1) {
				text += 'Nearly always moves last <em>(priority &minus;' + (-move.priority) + ')</em>.</p><p>';
			} else if (move.priority === 1) {
				text += 'Usually moves first <em>(priority +' + move.priority + ')</em>.</p><p>';
			}

			text += '' + (move.desc || move.shortDesc) + '</p>';

			if (this.battle.gameType === 'doubles') {
				if (move.target === 'allAdjacent') {
					text += '<p>&#x25ce; Hits both foes and ally.</p>';
				} else if (move.target === 'allAdjacentFoes') {
					text += '<p>&#x25ce; Hits both foes.</p>';
				}
			} else if (this.battle.gameType === 'triples') {
				if (move.target === 'allAdjacent') {
					text += '<p>&#x25ce; Hits adjacent foes and allies.</p>';
				} else if (move.target === 'allAdjacentFoes') {
					text += '<p>&#x25ce; Hits adjacent foes.</p>';
				} else if (move.target === 'any') {
					text += '<p>&#x25ce; Can target distant Pok&eacute;mon in Triples.</p>';
				}
			}

			if ('defrost' in move.flags) {
				text += '<p class="movetag">The user thaws out if it is frozen.</p>';
			}
			if (!('protect' in move.flags) && move.target !== 'self' && move.target !== 'allySide') {
				text += '<p class="movetag">Not blocked by Protect <small>(and Detect, King\'s Shield, Spiky Shield)</small></p>';
			}
			if ('authentic' in move.flags) {
				text += '<p class="movetag">Bypasses Substitute <small>(but does not break it)</small></p>';
			}
			if (!('reflectable' in move.flags) && move.target !== 'self' && move.target !== 'allySide' && move.category === 'Status') {
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
			if ('punch' in move.flags && ability === 'ironfist') {
				text += '<p class="movetag">&#x2713; Fist <small>(boosted by Iron Fist)</small></p>';
			}
			if ('pulse' in move.flags && ability === 'megalauncher') {
				text += '<p class="movetag">&#x2713; Pulse <small>(boosted by Mega Launcher)</small></p>';
			}
			if ('bite' in move.flags && ability === 'strongjaw') {
				text += '<p class="movetag">&#x2713; Bite <small>(boosted by Strong Jaw)</small></p>';
			}
			if ((move.recoil || move.hasCustomRecoil) && ability === 'reckless') {
				text += '<p class="movetag">&#x2713; Recoil <small>(boosted by Reckless)</small></p>';
			}
			if ('bullet' in move.flags) {
				text += '<p class="movetag">&#x2713; Bullet-like <small>(doesn\'t affect Bulletproof pokemon)</small></p>';
			}
		}
		return text;
	}

	/**
	 * Needs either a Pokemon or a ServerPokemon, but note that neither
	 * are guaranteed: If you hover over a possible switch-in that's
	 * never been switched in before, you'll only have a ServerPokemon,
	 * and if you hover over an opponent's pokemon, you'll only have a
	 * Pokemon.
	 *
	 * isActive is true if hovering over a pokemon in the battlefield,
	 * and false if hovering over a pokemon in the Switch menu.
	 *
	 * @param clientPokemon
	 * @param serverPokemon
	 * @param isActive
	 */
	showPokemonTooltip(clientPokemon: Pokemon | null, serverPokemon?: ServerPokemon | null, isActive?: boolean) {
		const pokemon = clientPokemon || serverPokemon!;
		let text = '';
		let genderBuf = '';
		if (pokemon.gender) {
			genderBuf = ' <img src="' + Dex.resourcePrefix + 'fx/gender-' + pokemon.gender.toLowerCase() + '.png" alt="' + pokemon.gender + '" />';
		}

		let name = BattleLog.escapeHTML(pokemon.name);
		if (pokemon.species !== pokemon.name) {
			name += ' <small>(' + BattleLog.escapeHTML(pokemon.species) + ')</small>';
		}

		text += '<h2>' + name + genderBuf + (pokemon.level !== 100 ? ' <small>L' + pokemon.level + '</small>' : '') + '<br />';

		let template = this.battle.dex.getTemplate(clientPokemon ? clientPokemon.getSpecies() : pokemon.species);
		if (clientPokemon && clientPokemon.volatiles.formechange) {
			if (clientPokemon.volatiles.transform) {
				text += '<small>(Transformed into ' + clientPokemon.volatiles.formechange[1] + ')</small><br />';
			} else {
				text += '<small>(Changed forme: ' + clientPokemon.volatiles.formechange[1] + ')</small><br />';
			}
		}

		let types = this.getPokemonTypes(pokemon);

		if (clientPokemon && (clientPokemon.volatiles.typechange || clientPokemon.volatiles.typeadd)) {
			text += '<small>(Type changed)</small><br />';
		}
		text += types.map(type => Dex.getTypeIcon(type)).join(' ');
		text += '</h2>';

		if (pokemon.fainted) {
			text += '<p><small>HP:</small> (fainted)</p>';
		} else if (this.battle.hardcoreMode) {
			if (serverPokemon) {
				text += '<p><small>HP:</small> ' + serverPokemon.hp + '/' + serverPokemon.maxhp + (pokemon.status ? ' <span class="status ' + pokemon.status + '">' + pokemon.status.toUpperCase() + '</span>' : '') + '</p>';
			}
		} else {
			let exacthp = '';
			if (serverPokemon) {
				exacthp = ' (' + serverPokemon.hp + '/' + serverPokemon.maxhp + ')';
			} else if (pokemon.maxhp === 48) {
				exacthp = ' <small>(' + pokemon.hp + '/' + pokemon.maxhp + ' pixels)</small>';
			}
			text += '<p><small>HP:</small> ' + Pokemon.getHPText(pokemon) + exacthp + (pokemon.status ? ' <span class="status ' + pokemon.status + '">' + pokemon.status.toUpperCase() + '</span>' : '');
			if (clientPokemon) {
				if (pokemon.status === 'tox') {
					if (pokemon.ability === 'Poison Heal' || pokemon.ability === 'Magic Guard') {
						text += ' <small>Would take if ability removed: ' + Math.floor(100 / 16) * Math.min(clientPokemon.statusData.toxicTurns + 1, 15) + '%</small>';
					} else {
						text += ' Next damage: ' + Math.floor(100 / 16) * Math.min(clientPokemon.statusData.toxicTurns + 1, 15) + '%';
					}
				} else if (pokemon.status === 'slp') {
					text += ' Turns asleep: ' + clientPokemon.statusData.sleepTurns;
				}
			}
			text += '</p>';
		}

		const supportsAbilities = this.battle.gen > 2 && !this.battle.tier.includes("Let's Go");
		if (serverPokemon) {
			if (supportsAbilities) {
				let abilityText = Dex.getAbility(serverPokemon.baseAbility).name;
				let ability = Dex.getAbility(serverPokemon.ability || pokemon.ability).name;
				if (ability && (ability !== abilityText)) {
					abilityText = ability + ' (base: ' + abilityText + ')';
				}
				text += '<p><small>Ability:</small> ' + abilityText;
				if (serverPokemon.item) {
					text += ' / <small>Item:</small> ' + Dex.getItem(serverPokemon.item).name;
				}
				text += '</p>';
			} else if (serverPokemon.item) {
				let itemName = Dex.getItem(serverPokemon.item).name;
				text += '<p><small>Item:</small> ' + itemName + '</p>';
			}
		} else if (clientPokemon) {
			if (supportsAbilities) {
				if (!pokemon.baseAbility && !pokemon.ability) {
					let abilities = template.abilities;
					text += '<p><small>Possible abilities:</small> ' + abilities['0'];
					if (abilities['1']) text += ', ' + abilities['1'];
					if (abilities['H']) text += ', ' + abilities['H'];
					if (abilities['S']) text += ', ' + abilities['S'];
					text += '</p>';
				} else if (pokemon.ability) {
					if (pokemon.ability === pokemon.baseAbility) {
						text += '<p><small>Ability:</small> ' + Dex.getAbility(pokemon.ability).name + '</p>';
					} else {
						text += '<p><small>Ability:</small> ' + Dex.getAbility(pokemon.ability).name + ' (base: ' + Dex.getAbility(pokemon.baseAbility).name + ')' + '</p>';
					}
				} else if (pokemon.baseAbility) {
					text += '<p><small>Ability:</small> ' + Dex.getAbility(pokemon.baseAbility).name + '</p>';
				}
			}
			let item = '';
			let itemEffect = clientPokemon.itemEffect || '';
			if (clientPokemon.prevItem) {
				item = 'None';
				if (itemEffect) itemEffect += '; ';
				let prevItem = Dex.getItem(clientPokemon.prevItem).name;
				itemEffect += clientPokemon.prevItemEffect ? prevItem + ' was ' + clientPokemon.prevItemEffect : 'was ' + prevItem;
			}
			if (pokemon.item) item = Dex.getItem(pokemon.item).name;
			if (itemEffect) itemEffect = ' (' + itemEffect + ')';
			if (item) text += '<p><small>Item:</small> ' + item + itemEffect + '</p>';
		}

		text += this.renderStats(clientPokemon, serverPokemon, !isActive);

		if (serverPokemon && !isActive) {
			// move list
			text += '<p class="section">';
			let battlePokemon = this.battle.getPokemon(pokemon.ident, pokemon.details);
			for (const moveid of serverPokemon.moves) {
				let move = Dex.getMove(moveid);
				let moveName = move.name;
				if (battlePokemon && battlePokemon.moveTrack) {
					for (const row of battlePokemon.moveTrack) {
						if (moveName === row[0]) {
							moveName = this.getPPUseText(row, true);
							break;
						}
					}
				}
				text += '&#8226; ' + moveName + '<br />';
			}
			text += '</p>';
		} else if (!this.battle.hardcoreMode && clientPokemon && clientPokemon.moveTrack.length) {
			// move list (guessed)
			text += '<p class="section">';
			for (const row of clientPokemon.moveTrack) {
				text += '&#8226; ' + this.getPPUseText(row) + '<br />';
			}
			if (clientPokemon.moveTrack.length > 4) {
				text += '(More than 4 moves is usually a sign of Illusion Zoroark/Zorua.)';
			}
			if (this.battle.gen === 3) {
				text += '(Pressure is not visible in Gen 3, so in certain situations, more PP may have been lost than shown here.)';
			}
			text += '</p>';
		}
		return text;
	}

	calculateModifiedStats(clientPokemon: Pokemon | null, serverPokemon: ServerPokemon) {
		let stats = {...serverPokemon.stats};
		let pokemon = clientPokemon || serverPokemon;
		for (const statName of Dex.statNamesExceptHP) {
			stats[statName] = serverPokemon.stats[statName];

			if (clientPokemon && clientPokemon.boosts[statName]) {
				let boostTable = [1, 1.5, 2, 2.5, 3, 3.5, 4];
				if (clientPokemon.boosts[statName] > 0) {
					stats[statName] *= boostTable[clientPokemon.boosts[statName]];
				} else {
					if (this.battle.gen <= 2) boostTable = [1, 100 / 66, 2, 2.5, 100 / 33, 100 / 28, 4];
					stats[statName] /= boostTable[-clientPokemon.boosts[statName]];
				}
				stats[statName] = Math.floor(stats[statName]);
			}
		}

		let ability = toId(serverPokemon.ability || pokemon.ability || serverPokemon.baseAbility);
		if (clientPokemon && 'gastroacid' in clientPokemon.volatiles) ability = '' as ID;

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
			for (const statName of Dex.statNamesExceptHP) {
				if (stats[statName] > 999) stats[statName] = 999;
			}
			return stats;
		}

		let item = toId(serverPokemon.item);
		if (ability === 'klutz' && item !== 'machobrace') item = '' as ID;
		let species = Dex.getTemplate(clientPokemon ? clientPokemon.getSpecies() : serverPokemon.species).baseSpecies;

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

		if (species === 'Ditto' && !(clientPokemon && 'transform' in clientPokemon.volatiles)) {
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

		let weather = this.battle.weather;
		if (weather) {
			// Check if anyone has an anti-weather ability
			outer: for (const side of this.battle.sides) {
				for (const active of side.active) {
					if (active && ['Air Lock', 'Cloud Nine'].includes(active.ability)) {
						weather = '' as ID;
						break outer;
					}
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
			if (weather === 'sunnyday' || weather === 'desolateland') {
				if (ability === 'solarpower') {
					stats.spa = Math.floor(stats.spa * 1.5);
				}
				let allyActive = clientPokemon && clientPokemon.side.active;
				if (allyActive && allyActive.length > 1) {
					for (const ally of allyActive) {
						if (!ally || ally.fainted) continue;
						if (ally.ability === 'flowergift' && (ally.getTemplate().baseSpecies === 'Cherrim' || this.battle.gen <= 4)) {
							stats.atk = Math.floor(stats.atk * 1.5);
							stats.spd = Math.floor(stats.spd * 1.5);
						}
					}
				}
			}
			if (this.battle.gen >= 4 && this.pokemonHasType(serverPokemon, 'Rock') && weather === 'sandstorm') {
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
		if (ability === 'defeatist' && serverPokemon.hp <= serverPokemon.maxhp / 2) {
			stats.atk = Math.floor(stats.atk * 0.5);
			stats.spa = Math.floor(stats.spa * 0.5);
		}
		if (clientPokemon) {
			if ('slowstart' in clientPokemon.volatiles) {
				stats.atk = Math.floor(stats.atk * 0.5);
				stats.spe = Math.floor(stats.spe * 0.5);
			}
			if (ability === 'unburden' && 'itemremoved' in clientPokemon.volatiles && !item) {
				stats.spe *= 2;
			}
		}
		if (ability === 'marvelscale' && pokemon.status) {
			stats.def = Math.floor(stats.def * 1.5);
		}
		if (item === 'eviolite' && Dex.getTemplate(pokemon.species).evos) {
			stats.def = Math.floor(stats.def * 1.5);
			stats.spd = Math.floor(stats.spd * 1.5);
		}
		if (ability === 'grasspelt' && this.battle.hasPseudoWeather('Grassy Terrain')) {
			stats.def = Math.floor(stats.def * 1.5);
		}
		if (ability === 'surgesurfer' && this.battle.hasPseudoWeather('Electric Terrain')) {
			stats.spe *= 2;
		}
		if (item === 'choicespecs') {
			stats.spa = Math.floor(stats.spa * 1.5);
		}
		if (item === 'deepseatooth' && species === 'Clamperl') {
			stats.spa *= 2;
		}
		if (item === 'souldew' && this.battle.gen <= 6 && (species === 'Latios' || species === 'Latias')) {
			stats.spa = Math.floor(stats.spa * 1.5);
			stats.spd = Math.floor(stats.spd * 1.5);
		}
		if (clientPokemon && (ability === 'plus' || ability === 'minus')) {
			let allyActive = clientPokemon.side.active;
			if (allyActive.length > 1) {
				let abilityName = (ability === 'plus' ? 'Plus' : 'Minus');
				for (const ally of allyActive) {
					if (!(ally && ally !== clientPokemon && !ally.fainted)) continue;
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
		if (item === 'ironball' || item === 'machobrace' || /power(?!herb)/.test(item)) {
			stats.spe = Math.floor(stats.spe * 0.5);
		}
		if (ability === 'furcoat') {
			stats.def *= 2;
		}

		return stats;
	}

	renderStats(clientPokemon: Pokemon | null, serverPokemon?: ServerPokemon | null, short?: boolean) {
		if (!serverPokemon) {
			if (!clientPokemon) throw new Error('Must pass either clientPokemon or serverPokemon');
			let [min, max] = this.getSpeedRange(clientPokemon);
			return '<p><small>Spe</small> ' + min + ' to ' + max + ' <small>(before items/abilities/modifiers)</small></p>';
		}
		const stats = serverPokemon.stats;
		const modifiedStats = this.calculateModifiedStats(clientPokemon, serverPokemon);

		let buf = '<p>';

		if (!short) {
			let hasModifiedStat = false;
			for (const statName of Dex.statNamesExceptHP) {
				if (this.battle.gen === 1 && statName === 'spd') continue;
				let statLabel = this.battle.gen === 1 && statName === 'spa' ? 'spc' : statName;
				buf += statName === 'atk' ? '<small>' : '<small> / ';
				buf += '' + BattleText[statLabel].statShortName + '&nbsp;</small>';
				buf += '' + stats[statName];
				if (modifiedStats[statName] !== stats[statName]) hasModifiedStat = true;
			}
			buf += '</p>';

			if (!hasModifiedStat) return buf;

			buf += '<p><small>(After stat modifiers:)</small></p>';
			buf += '<p>';
		}

		for (const statName of Dex.statNamesExceptHP) {
			if (this.battle.gen === 1 && statName === 'spd') continue;
			let statLabel = this.battle.gen === 1 && statName === 'spa' ? 'spc' : statName;
			buf += statName === 'atk' ? '<small>' : '<small> / ';
			buf += '' + BattleText[statLabel].statShortName + '&nbsp;</small>';
			if (modifiedStats[statName] === stats[statName]) {
				buf += '' + modifiedStats[statName];
			} else if (modifiedStats[statName] < stats[statName]) {
				buf += '<strong class="stat-lowered">' + modifiedStats[statName] + '</strong>';
			} else {
				buf += '<strong class="stat-boosted">' + modifiedStats[statName] + '</strong>';
			}
		}
		buf += '</p>';
		return buf;
	}

	getPPUseText(moveTrackRow: [string, number], showKnown?: boolean) {
		let [moveName, ppUsed] = moveTrackRow;
		let move;
		let maxpp;
		if (moveName.charAt(0) === '*') {
			// Transformed move
			move = this.battle.dex.getMove(moveName.substr(1));
			maxpp = 5;
		} else {
			move = this.battle.dex.getMove(moveName);
			maxpp = move.noPPBoosts ? move.pp : Math.floor(move.pp * 8 / 5);
		}
		if (ppUsed === Infinity) {
			return move.name + ' <small>(0/' + maxpp + ')</small>';
		}
		if (ppUsed || moveName.charAt(0) === '*') {
			return move.name + ' <small>(' + (maxpp - ppUsed) + '/' + maxpp + ')</small>';
		}
		return move.name + (showKnown ? ' <small>(revealed)</small>' : '');
	}

	ppUsed(move: Move, pokemon: Pokemon) {
		for (let [moveName, ppUsed] of pokemon.moveTrack) {
			if (moveName.charAt(0) === '*') moveName = moveName.substr(1);
			if (move.name === moveName) return ppUsed;
		}
		return 0;
	}

	/**
	 * Calculates possible Speed stat range of an opponent
	 */
	getSpeedRange(pokemon: Pokemon): [number, number] {
		let level = pokemon.level;
		let baseSpe = pokemon.getTemplate().baseStats['spe'];
		let tier = this.battle.tier;
		let gen = this.battle.gen;
		let isRandomBattle = tier.includes('Random Battle') || (tier.includes('Random') && tier.includes('Battle') && gen >= 6);

		let minNature = (isRandomBattle || gen < 3) ? 1 : 0.9;
		let maxNature = (isRandomBattle || gen < 3) ? 1 : 1.1;
		let maxIv = (gen < 3) ? 30 : 31;

		let min;
		let max;
		const tr = Math.trunc || Math.floor;
		if (tier.includes("Let's Go")) {
			min = tr(tr(tr(2 * baseSpe * level / 100 + 5) * minNature) * tr((70 / 255 / 10 + 1) * 100) / 100);
			max = tr(tr(tr((2 * baseSpe + maxIv) * level / 100 + 5) * maxNature) * tr((70 / 255 / 10 + 1) * 100) / 100);
			if (tier.includes('No Restrictions')) max += 200;
			else if (tier.includes('Random')) max += 20;
		} else {
			let maxIvEvOffset = maxIv + ((isRandomBattle && gen >= 3) ? 21 : 63);
			min = tr(tr(2 * baseSpe * level / 100 + 5) * minNature);
			max = tr(tr((2 * baseSpe + maxIvEvOffset) * level / 100 + 5) * maxNature);
		}
		return [min, max];
	}

	/**
	 * Gets the proper current type for moves with a variable type.
	 */
	getMoveType(move: Move, value: ModifiableValue): [TypeName, 'Physical' | 'Special' | 'Status'] {
		let moveType = move.type;
		let category = move.category;
		let pokemonTypes = value.pokemon!.getTypeList(value.serverPokemon);
		value.reset();
		if (move.id === 'revelationdance') {
			moveType = pokemonTypes[0];
		}
		// Moves that require an item to change their type.
		let item = Dex.getItem(value.itemName);
		if (move.id === 'multiattack' && item.onMemory) {
			if (value.itemModify(0)) moveType = item.onMemory;
		}
		if (move.id === 'judgment' && item.onPlate) {
			if (value.itemModify(0)) moveType = item.onPlate;
		}
		if (move.id === 'technoblast' && item.onDrive) {
			if (value.itemModify(0)) moveType = item.onDrive;
		}
		if (move.id === 'naturalgift' && item.naturalGift) {
			if (value.itemModify(0)) moveType = item.naturalGift.type;
		}
		// Weather and pseudo-weather type changes.
		if (move.id === 'weatherball' && value.weatherModify(0)) {
			switch (this.battle.weather) {
			case 'sunnyday': case 'desolateland': moveType = 'Fire'; break;
			case 'raindance': case 'primordialsea': moveType = 'Water'; break;
			case 'sandstorm': moveType = 'Rock'; break;
			case 'hail': moveType = 'Ice'; break;
			}
		}
		// Other abilities that change the move type.
		const noTypeOverride = ['judgment', 'multiattack', 'naturalgift', 'revelationdance', 'struggle', 'technoblast', 'weatherball'];
		const allowTypeOverride = !noTypeOverride.includes(move.id);

		if (allowTypeOverride && move.flags['sound'] && value.abilityModify(0, 'Liquid Voice')) {
			moveType = 'Water';
		}
		if (allowTypeOverride && moveType === 'Normal' && category !== 'Status') {
			if (value.abilityModify(0, 'Aerilate')) moveType = 'Flying';
			if (value.abilityModify(0, 'Galvanize')) moveType = 'Electric';
			if (value.abilityModify(0, 'Pixilate')) moveType = 'Fairy';
			if (value.abilityModify(0, 'Refrigerate')) moveType = 'Ice';
			if (value.abilityModify(0, 'Normalize')) moveType = 'Normal';
			}
		if (this.battle.gen <= 3 && category !== 'Status') {
			category = Dex.getGen3Category(moveType);
		}
		return [moveType, category];
	}

	// Gets the current accuracy for a move.
	getMoveAccuracy(move: Move, value: ModifiableValue, target?: Pokemon) {
		value.reset(move.accuracy === true ? 0 : move.accuracy, true);

		let pokemon = value.pokemon!;
		if (move.id === 'toxic' && this.battle.gen >= 6 && this.pokemonHasType(pokemon, 'Poison')) {
			value.set(0, "Poison type");
			return value;
		}
		if (move.id === 'blizzard') {
			value.weatherModify(0, 'Hail');
		}
		if (move.id === 'hurricane' || move.id === 'thunder') {
			value.weatherModify(0, 'Rain Dance');
			value.weatherModify(0, 'Primordial Sea');
			if (value.tryWeather('Sunny Day')) value.set(50, 'Sunny Day');
			if (value.tryWeather('Desolate Land')) value.set(50, 'Desolate Land');
		}
		value.abilityModify(0, 'No Guard');
		if (!value.value) return value;
		if (move.ohko) {
			if (this.battle.gen === 1) {
				value.set(value.value, `fails if target's Speed is higher`);
				return value;
			}
			if (move.id === 'sheercold' && this.battle.gen >= 7) {
				if (!this.pokemonHasType(pokemon, 'Ice')) value.set(20, 'not Ice-type');
			}
			if (target) {
				if (pokemon.level < target.level) {
					value.reset(0);
					value.set(0, "FAILS: target's level is higher");
				} else if (pokemon.level > target.level) {
					value.set(value.value + pokemon.level - target.level, "+1% per level above target");
				}
			} else {
				if (pokemon.level < 100) value.set(value.value, "fails if target's level is higher");
				if (pokemon.level > 1) value.set(value.value, "+1% per level above target");
			}
			return value;
		}
		if (pokemon && pokemon.boosts.accuracy) {
			if (pokemon.boosts.accuracy > 0) {
				value.modify((pokemon.boosts.accuracy + 3) / 3);
			} else {
				value.modify(3 / (3 - pokemon.boosts.accuracy));
			}
		}
		if (move.category === 'Physical') {
			value.abilityModify(0.8, "Hustle");
		}
		value.abilityModify(1.3, "Compound Eyes");
		for (const active of pokemon.side.active) {
			if (!active || active.fainted) continue;
			let ability = Dex.getAbility(active.ability).name;
			if (ability === 'Victory Star') {
				value.modify(1.1, "Victory Star");
			}
		}
		value.itemModify(1.1, "Wide Lens");
		if (this.battle.hasPseudoWeather('Gravity')) {
			value.modify(5 / 3, "Gravity");
		}
		return value;
	}

	// Gets the proper current base power for moves which have a variable base power.
	// Takes into account the target for some moves.
	// If it is unsure of the actual base power, it gives an estimate.
	getMoveBasePower(move: Move, moveType: TypeName, value: ModifiableValue, target: Pokemon | null = null) {
		const pokemon = value.pokemon!;
		const serverPokemon = value.serverPokemon;

		value.reset(move.basePower);

		if (move.id === 'acrobatics') {
			if (!serverPokemon.item) {
				value.modify(2, "Acrobatics + no item");
			}
		}
		if (['crushgrip', 'wringout'].includes(move.id) && target) {
			value.set(
				Math.floor(Math.floor((120 * (100 * Math.floor(target.hp * 4096 / target.maxhp)) + 2048 - 1) / 4096) / 100) || 1,
				'approximate'
			);
		}
		if (move.id === 'brine' && target && target.hp * 2 <= target.maxhp) {
			value.modify(2, 'Brine + target below half HP');
		}
		if (move.id === 'eruption' || move.id === 'waterspout') {
			value.set(Math.floor(150 * pokemon.hp / pokemon.maxhp) || 1);
		}
		if (move.id === 'facade' && !['', 'slp', 'frz'].includes(pokemon.status)) {
			value.modify(2, 'Facade + status');
		}
		if (move.id === 'flail' || move.id === 'reversal') {
			let multiplier;
			let ratios;
			if (this.battle.gen > 4) {
				multiplier = 48;
				ratios = [2, 5, 10, 17, 33];
			} else {
				multiplier = 64;
				ratios = [2, 6, 13, 22, 43];
			}
			let ratio = pokemon.hp * multiplier / pokemon.maxhp;
			let basePower;
			if (ratio < ratios[0]) basePower = 200;
			else if (ratio < ratios[1]) basePower = 150;
			else if (ratio < ratios[2]) basePower = 100;
			else if (ratio < ratios[3]) basePower = 80;
			else if (ratio < ratios[4]) basePower = 40;
			else basePower = 20;
			value.set(basePower);
		}
		if (move.id === 'hex' && target && target.status) {
			value.modify(2, 'Hex + status');
		}
		if (move.id === 'punishment' && target) {
			let boostCount = 0;
			for (const boost of Object.values(target.boosts)) {
				if (boost > 0) boostCount += boost;
			}
			value.set(Math.min(60 + 20 * boostCount, 200));
		}
		if (move.id === 'smellingsalts' && target) {
			if (target.status === 'par') {
				value.modify(2, 'Smelling Salts + Paralysis');
			}
		}
		if (['storedpower', 'powertrip'].includes(move.id) && target) {
			let boostCount = 0;
			for (const boost of Object.values(pokemon.boosts)) {
				if (boost > 0) boostCount += boost;
			}
			value.set(20 + 20 * boostCount);
		}
		if (move.id === 'trumpcard') {
			const ppLeft = 5 - this.ppUsed(move, pokemon);
			let basePower = 40;
			if (ppLeft === 1) basePower = 200;
			else if (ppLeft === 2) basePower = 80;
			else if (ppLeft === 3) basePower = 60;
			else if (ppLeft === 4) basePower = 50;
			value.set(basePower);
		}
		if (move.id === 'venoshock' && target) {
			if (['psn', 'tox'].includes(target.status)) {
				value.modify(2, 'Venoshock + Poison');
			}
		}
		if (move.id === 'wakeupslap' && target) {
			if (target.status === 'slp') {
				value.modify(2, 'Wake-Up Slap + Sleep');
			}
		}
		if (move.id === 'weatherball') {
			value.weatherModify(2);
		}
		if (move.id === 'watershuriken' && pokemon.getSpecies() === 'Greninja-Ash' && pokemon.ability === 'Battle Bond') {
			value.set(20, 'Battle Bond');
		}
		// Moves that check opponent speed
		if (move.id === 'electroball' && target) {
			let [minSpe, maxSpe] = this.getSpeedRange(target);
			let minRatio = (serverPokemon.stats['spe'] / maxSpe);
			let maxRatio = (serverPokemon.stats['spe'] / minSpe);
			let min;
			let max;

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

			value.setRange(min, max);
		}
		if (move.id === 'gyroball' && target) {
			let [minSpe, maxSpe] = this.getSpeedRange(target);
			let min = (Math.floor(25 * minSpe / serverPokemon.stats['spe']) || 1);
			if (min > 150) min = 150;
			let max = (Math.floor(25 * maxSpe / serverPokemon.stats['spe']) || 1);
			if (max > 150) max = 150;
			value.setRange(min, max);
		}
		// Moves which have base power changed due to items
		if (serverPokemon.item) {
			let item = Dex.getItem(serverPokemon.item);
			if (move.id === 'fling' && item.fling) {
				value.itemModify(item.fling.basePower);
			}
			if (move.id === 'naturalgift') {
				value.itemModify(item.naturalGift.basePower);
			}
		}
		// Moves which have base power changed according to weight
		if (['lowkick', 'grassknot', 'heavyslam', 'heatcrash'].includes(move.id)) {
			let isGKLK = ['lowkick', 'grassknot'].includes(move.id);
			if (target) {
				let targetWeight = target.getWeightKg();
				let pokemonWeight = pokemon.getWeightKg(serverPokemon);
				let basePower;
				if (isGKLK) {
					basePower = 20;
					if (targetWeight >= 200) basePower = 120;
					else if (targetWeight >= 100) basePower = 100;
					else if (targetWeight >= 50) basePower = 80;
					else if (targetWeight >= 25) basePower = 60;
					else if (targetWeight >= 10) basePower = 40;
				} else {
					basePower = 40;
					if (pokemonWeight > targetWeight * 5) basePower = 120;
					else if (pokemonWeight > targetWeight * 4) basePower = 100;
					else if (pokemonWeight > targetWeight * 3) basePower = 80;
					else if (pokemonWeight > targetWeight * 2) basePower = 60;
				}
				value.set(basePower);
			} else {
				value.setRange(isGKLK ? 20 : 40, 120);
			}
		}
		if (!value.value) return value;

		// Other ability boosts
		if (pokemon.status === 'brn' && move.category === 'Special') {
			value.abilityModify(1.5, "Flare Boost");
		}
		if (move.flags['pulse']) {
			value.abilityModify(1.5, "Mega Launcher");
		}
		if (move.flags['bite']) {
			value.abilityModify(1.5, "Strong Jaw");
		}
		if (value.value <= 60) {
			value.abilityModify(1.5, "Technician");
		}
		if (['psn', 'tox'].includes(pokemon.status) && move.category === 'Physical') {
			value.abilityModify(1.5, "Toxic Boost");
		}
		if (['Rock', 'Ground', 'Steel'].includes(moveType) && this.battle.weather === 'sandstorm') {
			if (value.tryAbility("Sand Force")) value.weatherModify(1.3, "Sandstorm", "Sand Force");
		}
		if (move.secondaries) {
			value.abilityModify(1.3, "Sheer Force");
		}
		if (move.flags['contact']) {
			value.abilityModify(1.3, "Tough Claws");
		}
		if (target) {
			if (["MF", "FM"].includes(pokemon.gender + target.gender)) {
				value.abilityModify(0.75, "Rivalry");
			} else if (["MM", "FF"].includes(pokemon.gender + target.gender)) {
				value.abilityModify(1.25, "Rivalry");
			}
		}
		const noTypeOverride = ['judgment', 'multiattack', 'naturalgift', 'revelationdance', 'struggle', 'technoblast', 'weatherball'];
		if (move.type === 'Normal' && move.category !== 'Status' && !noTypeOverride.includes(move.id)) {
			value.abilityModify(this.battle.gen > 6 ? 1.2 : 1.3, "Aerilate");
			value.abilityModify(this.battle.gen > 6 ? 1.2 : 1.3, "Galvanize");
			value.abilityModify(this.battle.gen > 6 ? 1.2 : 1.3, "Pixilate");
			value.abilityModify(this.battle.gen > 6 ? 1.2 : 1.3, "Refrigerate");
			if (this.battle.gen > 6) {
				value.abilityModify(1.2, "Normalize");
			}
		}
		if (move.flags['punch']) {
			value.abilityModify(1.2, 'Iron Fist');
		}
		if (move.recoil || move.hasCustomRecoil) {
			value.abilityModify(1.2, 'Reckless');
		}

		if (move.category !== 'Status') {
			let auraBoosted = '';
			let auraBroken = false;
			for (const ally of pokemon.side.active) {
				if (!ally || ally.fainted) continue;
				if (moveType === 'Fairy' && ally.ability === 'Fairy Aura') {
					auraBoosted = 'Fairy Aura';
				} else if (moveType === 'Dark' && ally.ability === 'Dark Aura') {
					auraBoosted = 'Dark Aura';
				} else if (ally.ability === 'Aura Break') {
					auraBroken = true;
				} else if (ally.ability === 'Battery') {
					if (ally !== pokemon && move.category === 'Special') {
						value.modify(1.3, 'Battery');
					}
				}
			}
			for (const foe of pokemon.side.foe.active) {
				if (!foe || foe.fainted) continue;
				if (foe.ability === 'Fairy Aura') {
					if (moveType === 'Fairy') auraBoosted = 'Fairy Aura';
				} else if (foe.ability === 'Dark Aura') {
					if (moveType === 'Dark') auraBoosted = 'Dark Aura';
				} else if (foe.ability === 'Aura Break') {
					auraBroken = true;
				}
			}
			if (auraBoosted) {
				if (auraBroken) {
					value.modify(0.75, auraBoosted + ' + Aura Break');
				} else {
					value.modify(1.33, auraBoosted);
				}
			}
		}

		// Terrain
		if ((this.battle.hasPseudoWeather('Electric Terrain') && moveType === 'Electric') ||
			(this.battle.hasPseudoWeather('Grassy Terrain') && moveType === 'Grass') ||
			(this.battle.hasPseudoWeather('Psychic Terrain') && moveType === 'Psychic')) {
			if (pokemon.isGrounded(serverPokemon)) {
				value.modify(1.5, 'Terrain boost');
			}
		} else if (this.battle.hasPseudoWeather('Misty Terrain') && moveType === 'Dragon') {
			if (target ? target.isGrounded() : true) {
				value.modify(0.5, 'Misty Terrain + grounded target');
			}
		}

		return value;
	}

	static incenseTypes: {[itemName: string]: TypeName} = {
		'Odd Incense': 'Psychic',
		'Rock Incense': 'Rock',
		'Rose Incense': 'Grass',
		'Sea Incense': 'Water',
		'Wave Incense': 'Water',
	};
	static itemTypes: {[itemName: string]: TypeName} = {
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
		'Twisted Spoon': 'Psychic',
	};
	static orbUsers: {[speciesName: string]: string} = {
		'Latias': 'Soul Dew',
		'Latios': 'Soul Dew',
		'Dialga': 'Adamant Orb',
		'Palkia': 'Lustrous Orb',
		'Giratina': 'Griseous Orb',
	};
	static orbTypes: {[itemName: string]: TypeName} = {
		'Soul Dew': 'Psychic',
		'Adamant Orb': 'Steel',
		'Lustrous Orb': 'Water',
		'Griseous Orb': 'Ghost',
	};
	static noGemMoves = [
		'Fire Pledge',
		'Fling',
		'Grass Pledge',
		'Struggle',
		'Water Pledge',
	];
	getItemBoost(move: Move, value: ModifiableValue, moveType: TypeName) {
		let item = this.battle.dex.getItem(value.serverPokemon.item);
		let itemName = item.name;
		let moveName = move.name;

		// Plates
		if (item.onPlate === moveType && !item.zMove) {
			value.itemModify(1.2);
			return value;
		}

		// Incenses
		if (BattleTooltips.incenseTypes[item.name] === moveType) {
			value.itemModify(1.2);
			return value;
		}

		// Type-enhancing items
		if (BattleTooltips.itemTypes[item.name] === moveType) {
			value.itemModify(this.battle.gen < 4 ? 1.1 : 1.2);
			return value;
		}

		// Pokemon-specific items
		if (item.name === 'Soul Dew' && this.battle.gen < 7) return value;
		if (BattleTooltips.orbUsers[Dex.getTemplate(value.serverPokemon.species).baseSpecies] === item.name &&
			[BattleTooltips.orbTypes[item.name], 'Dragon'].includes(moveType)) {
			value.itemModify(1.2);
			return value;
		}

		// Gems
		if (BattleTooltips.noGemMoves.includes(moveName)) return value;
		if (itemName === moveType + ' Gem') {
			value.itemModify(this.battle.gen < 6 ? 1.5 : 1.3);
			return value;
		}

		return value;
	}
	getPokemonTypes(pokemon: Pokemon | ServerPokemon): ReadonlyArray<TypeName> {
		if (!(pokemon as Pokemon).getTypes) {
			return this.battle.dex.getTemplate(pokemon.species).types;
		}

		return (pokemon as Pokemon).getTypeList();
	}
	pokemonHasType(pokemon: Pokemon | ServerPokemon, type: TypeName, types?: ReadonlyArray<TypeName>) {
		if (!types) types = this.getPokemonTypes(pokemon);
		for (const curType of types) {
			if (curType === type) return true;
		}
		return false;
	}
}
