/**
 * Pokemon Showdown Battle Animations
 *
 * There are the specific resource files and scripts for misc animations
 *
 * Licensing note: PS's client has complicated licensing:
 * - The client as a whole is AGPLv3
 * - The battle replay/animation engine (battle-*.ts) by itself is MIT
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 */

import type {Battle, Pokemon, Side, WeatherState} from './battle';
import type {BattleSceneStub} from './battle-scene-stub';
import {BattleMoveAnims} from './battle-animations-moves';
import {BattleLog} from './battle-log';
import {BattleBGM, BattleSound} from './battle-sound';

/*

Most of this file is: CC0 (public domain)
  <http://creativecommons.org/publicdomain/zero/1.0/>

This license DOES extend to all images in the fx/ folder, with the exception of icicle.png, lightning.png, and bone.png.

icicle.png and lightning.png by Clint Bellanger are triple-licensed GPLv2/GPLv3/CC-BY-SA-3.0.
  <http://opengameart.org/content/icicle-spell>
  <http://opengameart.org/content/lightning-shock-spell>

rocks.png, rock1.png, rock2.png by PO user "Gilad" is licensed GPLv3.

This license DOES NOT extend to any images in the sprites/ folder.

This license DOES NOT extend to any other files in this repository.

*/

export class BattleScene implements BattleSceneStub {
	battle: Battle;
	animating = true;
	acceleration = 1;

	/** Note: Not the actual generation of the battle, but the gen of the sprites/background */
	gen = 7;
	mod = '';
	/** 1 = singles, 2 = doubles, 3 = triples */
	activeCount = 1;

	numericId = 0;
	$frame: JQuery;
	$battle: JQuery = null!;
	$options: JQuery = null!;
	log: BattleLog;
	$terrain: JQuery = null!;
	$weather: JQuery = null!;
	$bgEffect: JQuery = null!;
	$bg: JQuery = null!;
	$sprite: JQuery = null!;
	$sprites: [JQuery, JQuery] = [null!, null!];
	$spritesFront: [JQuery, JQuery] = [null!, null!];
	$stat: JQuery = null!;
	$fx: JQuery = null!;
	$leftbar: JQuery = null!;
	$rightbar: JQuery = null!;
	$turn: JQuery = null!;
	$messagebar: JQuery = null!;
	$delay: JQuery = null!;
	$hiddenMessage: JQuery = null!;
	$tooltips: JQuery = null!;
	tooltips: BattleTooltips;

	sideConditions: [{[id: string]: Sprite[]}, {[id: string]: Sprite[]}] = [{}, {}];

	preloadDone = 0;
	preloadNeeded = 0;
	bgm: BattleBGM | null = null;
	backdropImage: string = '';
	bgmNum = 0;
	preloadCache: {[url: string]: HTMLImageElement} = {};

	messagebarOpen = false;
	customControls = false;
	interruptionCount = 1;
	curWeather = '';
	curTerrain = '';

	// Animation state
	////////////////////////////////////

	timeOffset = 0;
	pokemonTimeOffset = 0;
	minDelay = 0;
	/** jQuery objects that need to finish animating */
	activeAnimations = $();

	constructor(battle: Battle, $frame: JQuery, $logFrame: JQuery) {
		this.battle = battle;

		$frame.addClass('battle');
		this.$frame = $frame;
		this.log = new BattleLog($logFrame[0] as HTMLDivElement, this);
		this.log.battleParser!.pokemonName = (pokemonId: string) => {
			if (!pokemonId) return '';
			if (battle.ignoreNicks || battle.ignoreOpponent) {
				const pokemon = battle.getPokemon(pokemonId);
				if (pokemon) return pokemon.speciesForme;
			}
			if (!pokemonId.startsWith('p')) return '???pokemon:' + pokemonId + '???';
			if (pokemonId.charAt(3) === ':') return pokemonId.slice(4).trim();
			else if (pokemonId.charAt(2) === ':') return pokemonId.slice(3).trim();
			return '???pokemon:' + pokemonId + '???';
		};

		let numericId = 0;
		if (battle.id) {
			numericId = parseInt(battle.id.slice(battle.id.lastIndexOf('-') + 1), 10);
			if (this.battle.id.includes('digimon')) this.mod = 'digimon';
		}
		if (!numericId) {
			numericId = Math.floor(Math.random() * 1000000);
		}
		this.numericId = numericId;
		this.tooltips = new BattleTooltips(battle);
		this.tooltips.listen($frame[0]);

		this.preloadEffects();
		// reset() is called during battle initialization, so it doesn't need to be called here
	}

	reset() {
		this.updateGen();

		// Log frame
		/////////////

		if (this.$options) {
			this.log.reset();
		} else {
			this.$options = $('<div class="battle-options"></div>');
			$(this.log.elem).prepend(this.$options);
		}

		// Battle frame
		///////////////

		this.$frame.empty();
		this.$battle = $('<div class="innerbattle"></div>');
		this.$frame.append(this.$battle);

		this.$bg = $('<div class="backdrop" style="background-image:url(' + Dex.resourcePrefix + this.backdropImage + ');display:block;opacity:0.8"></div>');
		this.$terrain = $('<div class="weather"></div>');
		this.$weather = $('<div class="weather"></div>');
		this.$bgEffect = $('<div></div>');
		this.$sprite = $('<div></div>');

		this.$sprites = [$('<div></div>'), $('<div></div>')];
		this.$spritesFront = [$('<div></div>'), $('<div></div>')];

		this.$sprite.append(this.$sprites[1]);
		this.$sprite.append(this.$spritesFront[1]);
		this.$sprite.append(this.$spritesFront[0]);
		this.$sprite.append(this.$sprites[0]);

		this.$stat = $('<div role="complementary" aria-label="Active Pokemon"></div>');
		this.$fx = $('<div></div>');
		this.$leftbar = $('<div class="leftbar" role="complementary" aria-label="Your Team"></div>');
		this.$rightbar = $('<div class="rightbar" role="complementary" aria-label="Opponent\'s Team"></div>');
		this.$turn = $('<div></div>');
		this.$messagebar = $('<div class="messagebar message"></div>');
		this.$delay = $('<div></div>');
		this.$hiddenMessage = $('<div class="message" style="position:absolute;display:block;visibility:hidden"></div>');
		this.$tooltips = $('<div class="tooltips"></div>');

		this.$battle.append(this.$bg);
		this.$battle.append(this.$terrain);
		this.$battle.append(this.$weather);
		this.$battle.append(this.$bgEffect);
		this.$battle.append(this.$sprite);
		this.$battle.append(this.$stat);
		this.$battle.append(this.$fx);
		this.$battle.append(this.$leftbar);
		this.$battle.append(this.$rightbar);
		this.$battle.append(this.$turn);
		this.$battle.append(this.$messagebar);
		this.$battle.append(this.$delay);
		this.$battle.append(this.$hiddenMessage);
		this.$battle.append(this.$tooltips);

		if (!this.animating) {
			this.$battle.append('<div class="seeking"><strong>seeking...</strong></div>');
		}

		this.messagebarOpen = false;
		this.timeOffset = 0;
		this.pokemonTimeOffset = 0;
		this.curTerrain = '';
		this.curWeather = '';

		this.log.battleParser!.perspective = this.battle.mySide.sideid;

		this.resetSides(true);
	}

	animationOff() {
		this.$battle.append('<div class="seeking"><strong>seeking...</strong></div>');
		this.$frame.find('div.playbutton').remove();
		this.stopAnimation();

		this.animating = false;
		this.$messagebar.empty().css({
			opacity: 0,
			height: 0,
		});
	}
	stopAnimation() {
		this.interruptionCount++;
		this.$battle.find(':animated').finish();
		this.$fx.empty();
	}
	animationOn() {
		if (this.animating) return;
		$.fx.off = false;
		this.animating = true;
		this.$battle.find('.seeking').remove();
		this.updateSidebars();
		for (const side of this.battle.sides) {
			for (const pokemon of side.pokemon) {
				pokemon.sprite.reset(pokemon);
			}
		}
		this.updateWeather(true);
		this.resetTurn();
		this.resetSideConditions();
	}
	pause() {
		this.stopAnimation();
		this.updateBgm();
		if (!this.battle.started) {
			this.$frame.append('<div class="playbutton"><button name="play" class="button"><i class="fa fa-play"></i> Play</button><br /><br /><button name="play-muted" class="startsoundchooser button" style="font-size:10pt">Play (sound off)</button></div>');
			this.$frame.find('div.playbutton button[name=play-muted]').click(() => {
				this.setMute(true);
				this.battle.play();
			});
		}
		this.$frame.find('div.playbutton button[name=play]').click(() => this.battle.play());
	}
	resume() {
		this.$frame.find('div.playbutton').remove();
		this.updateBgm();
	}
	setMute(muted: boolean) {
		BattleSound.setMute(muted);
	}
	wait(time: number) {
		if (!this.animating) return;
		this.timeOffset += time;
	}

	// Sprite handling
	/////////////////////////////////////////////////////////////////////

	addSprite(sprite: PokemonSprite) {
		if (sprite.$el) this.$sprites[+sprite.isFrontSprite].append(sprite.$el);
	}
	showEffect(
		effect: string | SpriteData, start: ScenePos, end: ScenePos,
		transition: string, after?: string, additionalCss?: JQuery.PlainObject
	) {
		if (typeof effect === 'string') effect = BattleEffects[effect] as SpriteData;
		if (!start.time) start.time = 0;
		if (!end.time) end.time = start.time + 500;
		start.time += this.timeOffset;
		end.time += this.timeOffset;
		if (!end.scale && end.scale !== 0 && start.scale) end.scale = start.scale;
		if (!end.xscale && end.xscale !== 0 && start.xscale) end.xscale = start.xscale;
		if (!end.yscale && end.yscale !== 0 && start.yscale) end.yscale = start.yscale;
		end = {...start, ...end};

		let startpos = this.pos(start, effect);
		let endpos = this.posT(end, effect, transition, start);

		let $effect = $('<img src="' + effect.url + '" style="display:block;position:absolute" />');
		this.$fx.append($effect);
		if (additionalCss) $effect.css(additionalCss);
		$effect = this.$fx.children().last();

		if (start.time) {
			$effect.css({...startpos, opacity: 0});
			$effect.delay(start.time).animate({
				opacity: startpos.opacity,
			}, 1);
		} else {
			$effect.css(startpos);
		}
		$effect.animate(endpos, end.time! - start.time);
		if (after === 'fade') {
			$effect.animate({
				opacity: 0,
			}, 100);
		}
		if (after === 'explode') {
			if (end.scale) end.scale *= 3;
			if (end.xscale) end.xscale *= 3;
			if (end.yscale) end.yscale *= 3;
			end.opacity = 0;
			let endendpos = this.pos(end, effect);
			$effect.animate(endendpos, 200);
		}
		this.waitFor($effect);
	}
	backgroundEffect(bg: string, duration: number, opacity = 1, delay = 0) {
		let $effect = $('<div class="background"></div>');
		$effect.css({
			background: bg,
			display: 'block',
			opacity: 0,
		});
		this.$bgEffect.append($effect);
		$effect.delay(delay).animate({
			opacity,
		}, 250).delay(duration - 250);
		$effect.animate({
			opacity: 0,
		}, 250);
	}

	/**
	 * Converts a PS location (x, y, z, scale, xscale, yscale, opacity)
	 * to a jQuery position (top, left, width, height, opacity) suitable
	 * for passing into `jQuery#css` or `jQuery#animate`.
	 * The display property is passed through if it exists.
	 */
	pos(loc: ScenePos, obj: SpriteData) {
		loc = {
			x: 0,
			y: 0,
			z: 0,
			scale: 1,
			opacity: 1,
			...loc,
		};
		if (!loc.xscale && loc.xscale !== 0) loc.xscale = loc.scale;
		if (!loc.yscale && loc.yscale !== 0) loc.yscale = loc.scale;

		let left = 210;
		let top = 245;
		let scale = (obj.gen === 5
			? 2.0 - ((loc.z!) / 200)
			: 1.5 - 0.5 * ((loc.z!) / 200));
		if (scale < .1) scale = .1;

		left += (410 - 190) * ((loc.z!) / 200);
		top += (135 - 245) * ((loc.z!) / 200);
		left += Math.floor(loc.x! * scale);
		top -= Math.floor(loc.y! * scale /* - loc.x * scale / 4 */);
		let width = Math.floor(obj.w * scale * loc.xscale!);
		let height = Math.floor(obj.h * scale * loc.yscale!);
		let hoffset = Math.floor((obj.h - (obj.y || 0) * 2) * scale * loc.yscale!);
		left -= Math.floor(width / 2);
		top -= Math.floor(hoffset / 2);

		let pos: JQuery.PlainObject = {
			left,
			top,
			width,
			height,
			opacity: loc.opacity,
		};
		if (loc.display) pos.display = loc.display;
		return pos;
	}
	/**
	 * Converts a PS location to a jQuery transition map (see `pos`)
	 * suitable for passing into `jQuery#animate`.
	 * oldLoc is required for ballistic (jumping) animations.
	 */
	posT(loc: ScenePos, obj: SpriteData, transition?: string, oldLoc?: ScenePos): JQuery.PlainObject {
		const pos = this.pos(loc, obj);
		const oldPos = (oldLoc ? this.pos(oldLoc, obj) : null);
		let transitionMap = {
			left: 'linear',
			top: 'linear',
			width: 'linear',
			height: 'linear',
			opacity: 'linear',
		};
		if (transition === 'ballistic') {
			transitionMap.top = (pos.top < oldPos!.top ? 'ballisticUp' : 'ballisticDown');
		}
		if (transition === 'ballisticUnder') {
			transitionMap.top = (pos.top < oldPos!.top ? 'ballisticDown' : 'ballisticUp');
		}
		if (transition === 'ballistic2') {
			transitionMap.top = (pos.top < oldPos!.top ? 'quadUp' : 'quadDown');
		}
		if (transition === 'ballistic2Back') {
			// This _should_ be the same as ballistic2.
			// Unfortunately, oldLoc is the original loc, rather than the
			// previous loc, so when you're "going back", loc === oldLoc, and
			// the direction has to instead be inferred from the destination.
			transitionMap.top = (loc.z! > 0 ? 'quadUp' : 'quadDown');
		}
		if (transition === 'ballistic2Under') {
			transitionMap.top = (pos.top < oldPos!.top ? 'quadDown' : 'quadUp');
		}
		if (transition === 'swing') {
			transitionMap.left = 'swing';
			transitionMap.top = 'swing';
			transitionMap.width = 'swing';
			transitionMap.height = 'swing';
		}
		if (transition === 'accel') {
			transitionMap.left = 'quadDown';
			transitionMap.top = 'quadDown';
			transitionMap.width = 'quadDown';
			transitionMap.height = 'quadDown';
		}
		if (transition === 'decel') {
			transitionMap.left = 'quadUp';
			transitionMap.top = 'quadUp';
			transitionMap.width = 'quadUp';
			transitionMap.height = 'quadUp';
		}
		return {
			left: [pos.left, transitionMap.left],
			top: [pos.top, transitionMap.top],
			width: [pos.width, transitionMap.width],
			height: [pos.height, transitionMap.height],
			opacity: [pos.opacity, transitionMap.opacity],
		};
	}

	waitFor(elem: JQuery) {
		this.activeAnimations = this.activeAnimations.add(elem);
	}

	startAnimations() {
		this.$fx.empty();
		this.activeAnimations = $();
		this.timeOffset = 0;
		this.minDelay = 0;
	}

	finishAnimations() {
		if (this.minDelay || this.timeOffset) {
			this.$delay.delay(Math.max(this.minDelay, this.timeOffset));
			this.activeAnimations = this.activeAnimations.add(this.$delay);
		}
		if (!this.activeAnimations.length) return undefined;
		return this.activeAnimations.promise();
	}

	// Messagebar and log
	/////////////////////////////////////////////////////////////////////

	preemptCatchup() {
		this.log.preemptCatchup();
	}
	message(message: string) {
		if (!this.messagebarOpen) {
			this.log.addSpacer();
			if (this.animating) {
				this.$messagebar.empty();
				this.$messagebar.css({
					display: 'block',
					opacity: 0,
					height: 'auto',
				});
				this.$messagebar.animate({
					opacity: 1,
				}, this.battle.messageFadeTime / this.acceleration);
			}
		}
		if (this.battle.hardcoreMode && message.slice(0, 8) === '<small>(') {
			message = '';
		}
		if (message && this.animating) {
			this.$hiddenMessage.append('<p></p>');
			let $message = this.$hiddenMessage.children().last();
			$message.html(message);
			$message.css({
				display: 'block',
				opacity: 0,
			});
			$message.animate({
				height: 'hide',
			}, 1, () => {
				$message.appendTo(this.$messagebar);
				$message.animate({
					height: 'show',
					'padding-bottom': 4,
					opacity: 1,
				}, this.battle.messageFadeTime / this.acceleration);
			});
			this.waitFor($message);
		}
		this.messagebarOpen = true;
	}
	maybeCloseMessagebar(args: Args, kwArgs: KWArgs) {
		if (this.log.battleParser!.sectionBreak(args, kwArgs)) {
			if (!this.messagebarOpen) return false;
			this.closeMessagebar();
			return true;
		}
		return false;
	}
	closeMessagebar() {
		if (this.messagebarOpen) {
			this.messagebarOpen = false;
			if (this.animating) {
				this.$messagebar.delay(this.battle.messageShownTime / this.acceleration).animate({
					opacity: 0,
				}, this.battle.messageFadeTime / this.acceleration);
				this.waitFor(this.$messagebar);
			}
			return true;
		}
		return false;
	}

	// General updating
	/////////////////////////////////////////////////////////////////////

	runMoveAnim(moveid: ID, participants: Pokemon[]) {
		if (!this.animating) return;
		let animEntry = BattleMoveAnims[moveid];
		if (this.acceleration >= 3) {
			const targetsSelf = !participants[1] || participants[0] === participants[1];
			const isSpecial = !targetsSelf && this.battle.dex.moves.get(moveid).category === 'Special';
			animEntry = BattleOtherAnims[targetsSelf ? 'fastanimself' : isSpecial ? 'fastanimspecial' : 'fastanimattack'];
		} else if (!animEntry) {
			animEntry = BattleMoveAnims['tackle'];
		}
		animEntry.anim(this, participants.map(p => p.sprite));
	}

	runOtherAnim(moveid: ID, participants: Pokemon[]) {
		if (!this.animating) return;
		BattleOtherAnims[moveid].anim(this, participants.map(p => p.sprite));
	}

	runStatusAnim(moveid: ID, participants: Pokemon[]) {
		if (!this.animating) return;
		BattleStatusAnims[moveid].anim(this, participants.map(p => p.sprite));
	}

	runResidualAnim(moveid: ID, pokemon: Pokemon) {
		if (!this.animating) return;
		BattleMoveAnims[moveid].residualAnim!(this, [pokemon.sprite]);
	}

	runPrepareAnim(moveid: ID, attacker: Pokemon, defender: Pokemon) {
		if (!this.animating || this.acceleration >= 3) return;
		const moveAnim = BattleMoveAnims[moveid];
		if (!moveAnim.prepareAnim) return;
		moveAnim.prepareAnim(this, [attacker.sprite, defender.sprite]);
	}

	updateGen() {
		let gen = this.battle.gen;
		if (Dex.prefs('nopastgens')) gen = 6;
		if (Dex.prefs('bwgfx') && gen > 5) gen = 5;
		this.gen = gen;
		this.activeCount = this.battle.nearSide?.active.length || 1;

		const isSPL = (typeof this.battle.rated === 'string' && this.battle.rated.startsWith("Smogon Premier League"));
		let bg: string;
		if (isSPL) {
			if (gen <= 1) bg = 'fx/bg-gen1-spl.png';
			else if (gen <= 2) bg = 'fx/bg-gen2-spl.png';
			else if (gen <= 3) bg = 'fx/bg-gen3-spl.png';
			else if (gen <= 4) bg = 'fx/bg-gen4-spl.png';
			else bg = 'fx/bg-spl.png';
			this.setBgm(-101);
		} else {
			if (gen <= 1) bg = 'fx/bg-gen1.png?';
			else if (gen <= 2) bg = 'fx/bg-gen2.png?';
			else if (gen <= 3) bg = 'fx/' + BattleBackdropsThree[this.numericId % BattleBackdropsThree.length] + '?';
			else if (gen <= 4) bg = 'fx/' + BattleBackdropsFour[this.numericId % BattleBackdropsFour.length];
			else if (gen <= 5) bg = 'fx/' + BattleBackdropsFive[this.numericId % BattleBackdropsFive.length];
			else bg = 'sprites/gen6bgs/' + BattleBackdrops[this.numericId % BattleBackdrops.length];
		}

		this.backdropImage = bg;
		if (this.$bg) {
			this.$bg.css('background-image', 'url(' + Dex.resourcePrefix + '' + this.backdropImage + ')');
		}
	}

	getDetailsText(pokemon: Pokemon) {
		let name = pokemon.side?.isFar &&
			(this.battle.ignoreOpponent || this.battle.ignoreNicks) ? pokemon.speciesForme : pokemon.name;
		if (name !== pokemon.speciesForme) {
				name += ' (' + pokemon.speciesForme + ')';
		}
		if (pokemon === pokemon.side.active[0]) {
			name += ' (active)';
		} else if (pokemon.fainted) {
			name += ' (fainted)';
		} else {
			let statustext = '';
			if (pokemon.hp !== pokemon.maxhp) {
				statustext += pokemon.getHPText();
			}
			if (pokemon.status) {
				if (statustext) statustext += '|';
				statustext += pokemon.status;
			}
			if (statustext) {
				name += ' (' + statustext + ')';
			}
		}
		return BattleLog.escapeHTML(name);
	}
	getSidebarHTML(side: Side, posStr: string): string {
		let noShow = this.battle.hardcoreMode && this.battle.gen < 7;

		let speciesOverage = this.battle.speciesClause ? Infinity : Math.max(side.pokemon.length - side.totalPokemon, 0);
		const sidebarIcons: (
			['pokemon' | 'pokemon-illusion', number] | ['unrevealed' | 'empty' | 'pseudo-zoroark', null]
		)[] = [];
		const speciesTable: string[] = [];
		let zoroarkRevealed = false;
		let hasIllusion = false;
		if (speciesOverage) {
			for (let i = 0; i < side.pokemon.length; i++) {
				const species = side.pokemon[i].getBaseSpecies().baseSpecies;
				if (speciesOverage && speciesTable.includes(species)) {
					for (const sidebarIcon of sidebarIcons) {
						if (side.pokemon[sidebarIcon[1]!].getBaseSpecies().baseSpecies === species) {
							sidebarIcon[0] = 'pokemon-illusion';
						}
					}
					hasIllusion = true;
					speciesOverage--;
				} else {
					sidebarIcons.push(['pokemon', i]);
					speciesTable.push(species);
					if (['Zoroark', 'Zorua'].includes(species)) {
						zoroarkRevealed = true;
					}
				}
			}
		} else {
			for (let i = 0; i < side.pokemon.length; i++) {
				sidebarIcons.push(['pokemon', i]);
			}
		}
		if (!zoroarkRevealed && hasIllusion && sidebarIcons.length < side.totalPokemon) {
			sidebarIcons.push(['pseudo-zoroark', null]);
		}
		while (sidebarIcons.length < side.totalPokemon) {
			sidebarIcons.push(['unrevealed', null]);
		}
		while (sidebarIcons.length < 6) {
			sidebarIcons.push(['empty', null]);
		}

		let pokemonhtml = '';
		for (let i = 0; i < sidebarIcons.length; i++) {
			const [iconType, pokeIndex] = sidebarIcons[i];
			const poke = pokeIndex !== null ? side.pokemon[pokeIndex] : null;
			const tooltipCode = ` class="picon has-tooltip" data-tooltip="pokemon|${side.n}|${pokeIndex}${iconType === 'pokemon-illusion' ? '|illusion' : ''}"`;
			if (iconType === 'empty') {
				pokemonhtml += `<span class="picon" style="` + Dex.getPokemonIcon('pokeball-none') + `"></span>`;
			} else if (noShow) {
				if (poke?.fainted) {
					pokemonhtml += `<span${tooltipCode} style="` + Dex.getPokemonIcon('pokeball-fainted') + `" aria-label="Fainted"></span>`;
				} else if (poke?.status) {
					pokemonhtml += `<span${tooltipCode} style="` + Dex.getPokemonIcon('pokeball-statused') + `" aria-label="Statused"></span>`;
				} else {
					pokemonhtml += `<span${tooltipCode} style="` + Dex.getPokemonIcon('pokeball') + `" aria-label="Non-statused"></span>`;
				}
			} else if (iconType === 'pseudo-zoroark') {
				pokemonhtml += `<span class="picon" style="` + Dex.getPokemonIcon('zoroark') + `" title="Unrevealed Illusion user" aria-label="Unrevealed Illusion user"></span>`;
			} else if (!poke) {
				pokemonhtml += `<span class="picon" style="` + Dex.getPokemonIcon('pokeball') + `" title="Not revealed" aria-label="Not revealed"></span>`;
			} else if (!poke.ident && this.battle.teamPreviewCount && this.battle.teamPreviewCount < side.pokemon.length) {
				// in VGC (bring 6 pick 4) and other pick-less-than-you-bring formats, this is
				// a pokemon that's been brought but not necessarily picked
				const details = this.getDetailsText(poke);
				pokemonhtml += `<span${tooltipCode} style="` + Dex.getPokemonIcon(poke, !side.isFar) + `;opacity:0.6" aria-label="${details}"></span>`;
			} else {
				const details = this.getDetailsText(poke);
				pokemonhtml += `<span${tooltipCode} style="` + Dex.getPokemonIcon(poke, !side.isFar) + `" aria-label="${details}"></span>`;
			}
			if (i % 3 === 2) pokemonhtml += `</div><div class="teamicons">`;
		}
		pokemonhtml = '<div class="teamicons">' + pokemonhtml + '</div>';
		const ratinghtml = side.rating ? ` title="Rating: ${BattleLog.escapeHTML(side.rating)}"` : ``;
		const faded = side.name ? `` : ` style="opacity: 0.4"`;
		let badgehtml = '';
		if (side.badges.length) {
			badgehtml = '<span class="badges">';
			// hard limiting it to only ever 3 allowed at a time
			// that's what the server limit is anyway but there should be a client limit too
			// just in case
			for (const badgeData of side.badges.slice(0, 3)) {
				// ${badge.type}|${badge.format}|${BADGE_THRESHOLDS[badge.type]}-${badge.season}
				const [type, format, details] = badgeData.split('|');
				// todo, maybe make this more easily configured if we ever add badges for other stuff?
				// but idk that we're planning that for now so
				const [threshold, season] = details.split('-');
				const hover = `Top ${threshold} in ${format} during ladder season ${season}`;
				// ou and randbats get diff badges from everyone else, find it
				// (regex futureproofs for double digit gens)
				let formatType = format.split(/gen\d+/)[1] || 'none';
				if (!['ou', 'randombattle'].includes(formatType)) {
					formatType = 'base';
				}
				badgehtml += `<img src="${Dex.resourcePrefix}/sprites/misc/${formatType}-${type}.png" width="20px" height="20px" title="${hover}" />`;
			}
			badgehtml += '</span>';
		}
		return (
			`<div class="trainer trainer-${posStr}"${faded}><strong>${BattleLog.escapeHTML(side.name)}</strong>` +
			`<div class="trainersprite"${ratinghtml} style="background-image:url(${Dex.resolveAvatar(side.avatar)})">` +
			`</div>${badgehtml}${pokemonhtml}</div>`
		);
	}
	updateSidebar(side: Side) {
		if (this.battle.gameType === 'freeforall') {
			this.updateLeftSidebar();
			this.updateRightSidebar();
		} else if (side === this.battle.nearSide || side === this.battle.nearSide.ally) {
			this.updateLeftSidebar();
		} else {
			this.updateRightSidebar();
		}
	}
	updateLeftSidebar() {
		const side = this.battle.nearSide;

		if (side.ally) {
			const side2 = side.ally!;
			this.$leftbar.html(this.getSidebarHTML(side, 'near2') + this.getSidebarHTML(side2, 'near'));
		} else if (this.battle.sides.length > 2) { // FFA
			const side2 = this.battle.sides[side.n === 0 ? 3 : 2];
			this.$leftbar.html(this.getSidebarHTML(side2, 'near2') + this.getSidebarHTML(side, 'near'));
		} else {
			this.$leftbar.html(this.getSidebarHTML(side, 'near'));
		}
	}
	updateRightSidebar() {
		const side = this.battle.farSide;

		if (side.ally) {
			const side2 = side.ally!;
			this.$rightbar.html(this.getSidebarHTML(side, 'far2') + this.getSidebarHTML(side2, 'far'));
		} else if (this.battle.sides.length > 2) { // FFA
			const side2 = this.battle.sides[side.n === 0 ? 3 : 2];
			this.$rightbar.html(this.getSidebarHTML(side2, 'far2') + this.getSidebarHTML(side, 'far'));
		} else {
			this.$rightbar.html(this.getSidebarHTML(side, 'far'));
		}
	}
	updateSidebars() {
		this.updateLeftSidebar();
		this.updateRightSidebar();
	}
	updateStatbars() {
		for (const side of this.battle.sides) {
			for (const active of side.active) {
				if (active) active.sprite.updateStatbar(active);
			}
		}
	}

	resetSides(skipEmpty?: boolean) {
		if (!skipEmpty) {
			for (const $spritesContainer of this.$sprites) {
				$spritesContainer.empty();
			}
		}
		for (const side of this.battle.sides) {
			side.z = (side.isFar ? 200 : 0);
			side.missedPokemon?.sprite?.destroy();

			side.missedPokemon = {
				sprite: new PokemonSprite(null, {
					x: side.leftof(this.battle.gameType === 'freeforall' ? -50 : -100),
					y: side.y,
					z: side.z,
					opacity: 0,
				}, this, side.isFar),
			} as any;

			side.missedPokemon.sprite.isMissedPokemon = true;
		}
		if (this.battle.sides.length > 2 && this.sideConditions.length === 2) {
			this.sideConditions.push({}, {});
		}
		this.rebuildTooltips();
	}
	rebuildTooltips() {
		let tooltipBuf = '';
		const tooltips = this.battle.gameType === 'freeforall' ? {
			// FFA battles are visually rendered as triple battle with the center slots empty
			// so we swap the 2nd and 3rd tooltips on each side
			p2b: {top: 70, left: 250, width: 80, height: 100, tooltip: 'activepokemon|1|1'},
			p2a: {top: 90, left: 390, width: 100, height: 100, tooltip: 'activepokemon|1|0'},
			p1a: {top: 200, left: 130, width: 120, height: 160, tooltip: 'activepokemon|0|0'},
			p1b: {top: 200, left: 350, width: 150, height: 160, tooltip: 'activepokemon|0|1'},
		} : {
			p2c: {top: 70, left: 250, width: 80, height: 100, tooltip: 'activepokemon|1|2'},
			p2b: {top: 85, left: 320, width: 90, height: 100, tooltip: 'activepokemon|1|1'},
			p2a: {top: 90, left: 390, width: 100, height: 100, tooltip: 'activepokemon|1|0'},
			p1a: {top: 200, left: 130, width: 120, height: 160, tooltip: 'activepokemon|0|0'},
			p1b: {top: 200, left: 250, width: 150, height: 160, tooltip: 'activepokemon|0|1'},
			p1c: {top: 200, left: 350, width: 150, height: 160, tooltip: 'activepokemon|0|2'},
		};
		for (const id in tooltips) {
			let layout = tooltips[id as 'p1a'];
			tooltipBuf += `<div class="has-tooltip" style="position:absolute;`;
			tooltipBuf += `top:${layout.top}px;left:${layout.left}px;width:${layout.width}px;height:${layout.height}px;`;
			tooltipBuf += `" data-id="${id}" data-tooltip="${layout.tooltip}" data-ownheight="1"></div>`;
		}
		this.$tooltips.html(tooltipBuf);
	}

	teamPreview() {
		let newBGNum = 0;
		for (let siden = 0; siden < 2 || (this.battle.gameType === 'multi' && siden < 4); siden++) {
			let side = this.battle.sides[siden];
			const spriteIndex = +this.battle.viewpointSwitched ^ (siden % 2);
			let textBuf = '';
			let buf = '';
			let buf2 = '';
			this.$sprites[spriteIndex].empty();

			let ludicoloCount = 0;
			let lombreCount = 0;
			for (let i = 0; i < side.pokemon.length; i++) {
				let pokemon = side.pokemon[i];
				if (pokemon.speciesForme === 'Xerneas-*') {
					pokemon.speciesForme = 'Xerneas-Neutral';
				}
				if (pokemon.speciesForme === 'Ludicolo') ludicoloCount++;
				if (pokemon.speciesForme === 'Lombre') lombreCount++;

				let spriteData = Dex.getSpriteData(pokemon, !!spriteIndex, {
					gen: this.gen,
					noScale: true,
					mod: this.mod,
				});
				let y = 0;
				let x = 0;
				if (spriteIndex) {
					y = 48 + 50 + 3 * (i + 6 - side.pokemon.length);
					x = 48 + 180 + 50 * (i + 6 - side.pokemon.length);
				} else {
					y = 48 + 200 + 3 * i;
					x = 48 + 100 + 50 * i;
				}
				if (textBuf) textBuf += ' / ';
				textBuf += pokemon.speciesForme;
				let url = spriteData.url;
				// if (this.paused) url.replace('/xyani', '/xy').replace('.gif', '.png');
				buf += '<img src="' + url + '" width="' + spriteData.w + '" height="' + spriteData.h + '" style="position:absolute;top:' + Math.floor(y - spriteData.h / 2) + 'px;left:' + Math.floor(x - spriteData.w / 2) + 'px" />';
				buf2 += '<div style="position:absolute;top:' + (y + 45) + 'px;left:' + (x - 40) + 'px;width:80px;font-size:10px;text-align:center;color:#FFF;">';
				const gender = pokemon.gender;
				if (gender === 'M' || gender === 'F') {
					buf2 += `<img src="${Dex.fxPrefix}gender-${gender.toLowerCase()}.png" alt="${gender}" width="7" height="10" class="pixelated" style="margin-bottom:-1px" /> `;
				}
				if (pokemon.level !== 100) {
					buf2 += '<span style="text-shadow:#000 1px 1px 0,#000 1px -1px 0,#000 -1px 1px 0,#000 -1px -1px 0"><small>L</small>' + pokemon.level + '</span>';
				}
				if (pokemon.item === '(mail)') {
					buf2 += ' <img src="' + Dex.resourcePrefix + 'fx/mail.png" width="8" height="10" alt="F" style="margin-bottom:-1px" />';
				} else if (pokemon.item) {
					buf2 += ' <img src="' + Dex.resourcePrefix + 'fx/item.png" width="8" height="10" alt="F" style="margin-bottom:-1px" />';
				}
				buf2 += '</div>';
			}
			side.totalPokemon = side.pokemon.length;
			if (textBuf) {
				this.log.addDiv('chat battle-history',
					'<strong>' + BattleLog.escapeHTML(side.name) + '\'s team:</strong> <em style="color:#445566;display:block;">' + BattleLog.escapeHTML(textBuf) + '</em>'
				);
			}
			this.$sprites[spriteIndex].html(buf + buf2);

			if (!newBGNum) {
				if (ludicoloCount >= 2) {
					newBGNum = -3;
				} else if (ludicoloCount + lombreCount >= 2) {
					newBGNum = -2;
				}
			}
		}
		if (newBGNum !== 0) {
			this.setBgm(newBGNum);
		}
		this.wait(1000);
		this.updateSidebars();
	}

	showJoinButtons() {
		if (!this.battle.joinButtons) return;
		if (this.battle.ended || this.battle.rated) return;
		if (!this.battle.p1.name) {
			this.$battle.append('<div class="playbutton1"><button name="joinBattle">Join Battle</button></div>');
		}
		if (!this.battle.p2.name) {
			this.$battle.append('<div class="playbutton2"><button name="joinBattle">Join Battle</button></div>');
		}
	}
	hideJoinButtons() {
		if (!this.battle.joinButtons) return;
		this.$battle.find('.playbutton1, .playbutton2').remove();
	}

	pseudoWeatherLeft(pWeather: WeatherState) {
		let buf = '<br />' + Dex.moves.get(pWeather[0]).name;
		if (!pWeather[1] && pWeather[2]) {
			pWeather[1] = pWeather[2];
			pWeather[2] = 0;
		}
		if (this.battle.gen < 7 && this.battle.hardcoreMode) return buf;
		if (pWeather[2]) {
			return buf + ' <small>(' + pWeather[1] + ' or ' + pWeather[2] + ' turns)</small>';
		}
		if (pWeather[1]) {
			return buf + ' <small>(' + pWeather[1] + ' turn' + (pWeather[1] === 1 ? '' : 's') + ')</small>';
		}
		return buf; // weather not found
	}
	sideConditionLeft(cond: [string, number, number, number], isFoe: boolean, all?: boolean) {
		if (!cond[2] && !cond[3] && !all) return '';
		let buf = `<br />${isFoe && !all ? "Foe's " : ""}${Dex.moves.get(cond[0]).name}`;
		if (this.battle.gen < 7 && this.battle.hardcoreMode) return buf;

		if (!cond[2] && !cond[3]) return buf;
		if (!cond[2] && cond[3]) {
			cond[2] = cond[3];
			cond[3] = 0;
		}
		if (!cond[3]) {
			return buf + ' <small>(' + cond[2] + ' turn' + (cond[2] === 1 ? '' : 's') + ')</small>';
		}
		return buf + ' <small>(' + cond[2] + ' or ' + cond[3] + ' turns)</small>';
	}
	weatherLeft() {
		if (this.battle.gen < 7 && this.battle.hardcoreMode) return '';

		let weatherhtml = ``;

		if (this.battle.weather) {
			const weatherNameTable: {[id: string]: string} = {
				sunnyday: 'Sun',
				desolateland: 'Intense Sun',
				raindance: 'Rain',
				primordialsea: 'Heavy Rain',
				sandstorm: 'Sandstorm',
				hail: 'Hail',
				snow: 'Snow',
				deltastream: 'Strong Winds',
			};
			weatherhtml = `${weatherNameTable[this.battle.weather] || this.battle.weather}`;
			if (this.battle.weatherMinTimeLeft !== 0) {
				weatherhtml += ` <small>(${this.battle.weatherMinTimeLeft} or ${this.battle.weatherTimeLeft} turns)</small>`;
			} else if (this.battle.weatherTimeLeft !== 0) {
				weatherhtml += ` <small>(${this.battle.weatherTimeLeft} turn${this.battle.weatherTimeLeft === 1 ? '' : 's'})</small>`;
			}
			const nullifyWeather = this.battle.abilityActive(['Air Lock', 'Cloud Nine']);
			weatherhtml = `${nullifyWeather ? '<s>' : ''}${weatherhtml}${nullifyWeather ? '</s>' : ''}`;
		}

		for (const pseudoWeather of this.battle.pseudoWeather) {
			weatherhtml += this.pseudoWeatherLeft(pseudoWeather);
		}

		return weatherhtml;
	}
	sideConditionsLeft(side: Side, all?: boolean) {
		let buf = ``;
		for (const id in side.sideConditions) {
			buf += this.sideConditionLeft(side.sideConditions[id], side.isFar, all);
		}
		return buf;
	}
	upkeepWeather() {
		const isIntense = ['desolateland', 'primordialsea', 'deltastream'].includes(this.curWeather);
		this.$weather.animate({
			opacity: 1.0,
		}, 300).animate({
			opacity: isIntense ? 0.9 : 0.5,
		}, 300);
	}
	updateWeather(instant?: boolean) {
		if (!this.animating) return;
		let isIntense = false;
		let weather = this.battle.weather;
		if (this.battle.abilityActive(['Air Lock', 'Cloud Nine'])) {
			weather = '' as ID;
		}
		let terrain = '' as ID;
		for (const pseudoWeatherData of this.battle.pseudoWeather) {
			terrain = toID(pseudoWeatherData[0]);
		}
		if (weather === 'desolateland' || weather === 'primordialsea' || weather === 'deltastream') {
			isIntense = true;
		}

		let weatherhtml = this.weatherLeft();
		for (const side of this.battle.sides) {
			weatherhtml += this.sideConditionsLeft(side);
		}
		if (weatherhtml) weatherhtml = `<br />` + weatherhtml;

		if (instant) {
			this.$weather.html('<em>' + weatherhtml + '</em>');
			if (this.curWeather === weather && this.curTerrain === terrain) return;
			this.$terrain.attr('class', terrain ? 'weather ' + terrain + 'weather' : 'weather');
			this.curTerrain = terrain;
			this.$weather.attr('class', weather ? 'weather ' + weather + 'weather' : 'weather');
			this.$weather.css('opacity', isIntense || !weather ? 0.9 : 0.5);
			this.curWeather = weather;
			return;
		}

		if (weather !== this.curWeather) {
			this.$weather.animate({
				opacity: 0,
			}, this.curWeather ? 300 : 100, () => {
				this.$weather.html('<em>' + weatherhtml + '</em>');
				this.$weather.attr('class', weather ? 'weather ' + weather + 'weather' : 'weather');
				this.$weather.animate({opacity: isIntense || !weather ? 0.9 : 0.5}, 300);
			});
			this.curWeather = weather;
		} else {
			this.$weather.html('<em>' + weatherhtml + '</em>');
		}

		if (terrain !== this.curTerrain) {
			this.$terrain.animate({
				top: 360,
				opacity: 0,
			}, this.curTerrain ? 400 : 1, () => {
				this.$terrain.attr('class', terrain ? 'weather ' + terrain + 'weather' : 'weather');
				this.$terrain.animate({top: 0, opacity: 1}, 400);
			});
			this.curTerrain = terrain;
		}
	}
	resetTurn() {
		if (this.battle.turn <= 0) {
			this.$turn.html('');
			return;
		}
		this.$turn.html('<div class="turn has-tooltip" data-tooltip="field" data-ownheight="1">Turn ' + this.battle.turn + '</div>');
	}
	incrementTurn() {
		if (!this.animating) return;

		const turn = this.battle.turn;
		if (turn <= 0) return;
		const $prevTurn = this.$turn.children();
		const $newTurn = $('<div class="turn has-tooltip" data-tooltip="field" data-ownheight="1">Turn ' + turn + '</div>');
		$newTurn.css({
			opacity: 0,
			left: 160,
		});
		this.$turn.append($newTurn);
		$newTurn.animate({
			opacity: 1,
			left: 110,
		}, 500).animate({
			opacity: .4,
		}, 1500);
		$prevTurn.animate({
			opacity: 0,
			left: 60,
		}, 500, () => {
			$prevTurn.remove();
		});
		this.updateAcceleration();
		this.wait(500 / this.acceleration);
	}
	updateAcceleration() {
		if (this.battle.turnsSinceMoved > 2) {
			this.acceleration = (this.battle.messageFadeTime < 150 ? 2 : 1) * Math.min(this.battle.turnsSinceMoved - 1, 3);
		} else {
			this.acceleration = (this.battle.messageFadeTime < 150 ? 2 : 1);
			if (this.battle.messageFadeTime < 50) this.acceleration = 3;
		}
	}

	addPokemonSprite(pokemon: Pokemon) {
		const sprite = new PokemonSprite(Dex.getSpriteData(pokemon, pokemon.side.isFar, {
			gen: this.gen,
			mod: this.mod,
		}), {
			x: pokemon.side.x,
			y: pokemon.side.y,
			z: pokemon.side.z,
			opacity: 0,
		}, this, pokemon.side.isFar);
		if (sprite.$el) this.$sprites[+pokemon.side.isFar].append(sprite.$el);
		return sprite;
	}

	addSideCondition(siden: number, id: ID, instant?: boolean) {
		if (!this.animating) return;
		const side = this.battle.sides[siden];
		const spriteIndex = +side.isFar;
		let x = side.x;
		let y = side.y;
		if (this.battle.gameType === 'freeforall') {
			x += side.isFar ? 20 : -20;
			if (side.n > 1) {
				x += (side.isFar ? -140 : 140);
				y += side.isFar ? 14 : -20;
			}
		}

		switch (id) {
		case 'auroraveil':
			const auroraveil = new Sprite(BattleEffects.auroraveil, {
				display: 'block',
				x,
				y,
				z: side.behind(-14),
				xscale: 1,
				yscale: 0,
				opacity: 0.1,
			}, this);
			this.$spritesFront[spriteIndex].append(auroraveil.$el!);
			this.sideConditions[siden][id] = [auroraveil];
			auroraveil.anim({
				opacity: 0.7,
				time: instant ? 0 : 400,
			}).anim({
				opacity: 0.3,
				time: instant ? 0 : 300,
			});
			break;
		case 'reflect':
			const reflect = new Sprite(BattleEffects.reflect, {
				display: 'block',
				x,
				y,
				z: side.behind(-17),
				xscale: 1,
				yscale: 0,
				opacity: 0.1,
			}, this);
			this.$spritesFront[spriteIndex].append(reflect.$el!);
			this.sideConditions[siden][id] = [reflect];
			reflect.anim({
				opacity: 0.7,
				time: instant ? 0 : 400,
			}).anim({
				opacity: 0.3,
				time: instant ? 0 : 300,
			});
			break;
		case 'safeguard':
			const safeguard = new Sprite(BattleEffects.safeguard, {
				display: 'block',
				x,
				y,
				z: side.behind(-20),
				xscale: 1,
				yscale: 0,
				opacity: 0.1,
			}, this);
			this.$spritesFront[spriteIndex].append(safeguard.$el!);
			this.sideConditions[siden][id] = [safeguard];
			safeguard.anim({
				opacity: 0.7,
				time: instant ? 0 : 400,
			}).anim({
				opacity: 0.3,
				time: instant ? 0 : 300,
			});
			break;
		case 'lightscreen':
			const lightscreen = new Sprite(BattleEffects.lightscreen, {
				display: 'block',
				x,
				y,
				z: side.behind(-23),
				xscale: 1,
				yscale: 0,
				opacity: 0.1,
			}, this);
			this.$spritesFront[spriteIndex].append(lightscreen.$el!);
			this.sideConditions[siden][id] = [lightscreen];
			lightscreen.anim({
				opacity: 0.7,
				time: instant ? 0 : 400,
			}).anim({
				opacity: 0.3,
				time: instant ? 0 : 300,
			});
			break;
		case 'mist':
			const mist = new Sprite(BattleEffects.mist, {
				display: 'block',
				x,
				y,
				z: side.behind(-27),
				xscale: 1,
				yscale: 0,
				opacity: 0.1,
			}, this);
			this.$spritesFront[spriteIndex].append(mist.$el!);
			this.sideConditions[siden][id] = [mist];
			mist.anim({
				opacity: 0.7,
				time: instant ? 0 : 400,
			}).anim({
				opacity: 0.3,
				time: instant ? 0 : 300,
			});
			break;
		case 'stealthrock':
			const rock1 = new Sprite(BattleEffects.rock1, {
				display: 'block',
				x: x + side.leftof(-40),
				y: y - 10,
				z: side.z,
				opacity: 0.5,
				scale: 0.2,
			}, this);

			const rock2 = new Sprite(BattleEffects.rock2, {
				display: 'block',
				x: x + side.leftof(-20),
				y: y - 40,
				z: side.z,
				opacity: 0.5,
				scale: 0.2,
			}, this);

			const rock3 = new Sprite(BattleEffects.rock1, {
				display: 'block',
				x: x + side.leftof(30),
				y: y - 20,
				z: side.z,
				opacity: 0.5,
				scale: 0.2,
			}, this);

			const rock4 = new Sprite(BattleEffects.rock2, {
				display: 'block',
				x: x + side.leftof(10),
				y: y - 30,
				z: side.z,
				opacity: 0.5,
				scale: 0.2,
			}, this);

			this.$spritesFront[spriteIndex].append(rock1.$el!);
			this.$spritesFront[spriteIndex].append(rock2.$el!);
			this.$spritesFront[spriteIndex].append(rock3.$el!);
			this.$spritesFront[spriteIndex].append(rock4.$el!);
			this.sideConditions[siden][id] = [rock1, rock2, rock3, rock4];
			break;
		case 'gmaxsteelsurge':
			const surge1 = new Sprite(BattleEffects.greenmetal1, {
				display: 'block',
				x: x + side.leftof(-30),
				y: y - 20,
				z: side.z,
				opacity: 0.5,
				scale: 0.8,
			}, this);
			const surge2 = new Sprite(BattleEffects.greenmetal2, {
				display: 'block',
				x: x + side.leftof(35),
				y: y - 15,
				z: side.z,
				opacity: 0.5,
				scale: 0.8,
			}, this);
			const surge3 = new Sprite(BattleEffects.greenmetal1, {
				display: 'block',
				x: x + side.leftof(50),
				y: y - 10,
				z: side.z,
				opacity: 0.5,
				scale: 0.8,
			}, this);

			this.$spritesFront[spriteIndex].append(surge1.$el!);
			this.$spritesFront[spriteIndex].append(surge2.$el!);
			this.$spritesFront[spriteIndex].append(surge3.$el!);
			this.sideConditions[siden][id] = [surge1, surge2, surge3];
			break;
		case 'spikes':
			let spikeArray = this.sideConditions[siden]['spikes'];
			if (!spikeArray) {
				spikeArray = [];
				this.sideConditions[siden]['spikes'] = spikeArray;
			}
			let levels = this.battle.sides[siden].sideConditions['spikes'][1];
			if (spikeArray.length < 1 && levels >= 1) {
				const spike1 = new Sprite(BattleEffects.caltrop, {
					display: 'block',
					x: x - 25,
					y: y - 40,
					z: side.z,
					scale: 0.3,
				}, this);
				this.$spritesFront[spriteIndex].append(spike1.$el!);
				spikeArray.push(spike1);
			}
			if (spikeArray.length < 2 && levels >= 2) {
				const spike2 = new Sprite(BattleEffects.caltrop, {
					display: 'block',
					x: x + 30,
					y: y - 45,
					z: side.z,
					scale: .3,
				}, this);
				this.$spritesFront[spriteIndex].append(spike2.$el!);
				spikeArray.push(spike2);
			}
			if (spikeArray.length < 3 && levels >= 3) {
				const spike3 = new Sprite(BattleEffects.caltrop, {
					display: 'block',
					x: x + 50,
					y: y - 40,
					z: side.z,
					scale: .3,
				}, this);
				this.$spritesFront[spriteIndex].append(spike3.$el!);
				spikeArray.push(spike3);
			}
			break;
		case 'toxicspikes':
			let tspikeArray = this.sideConditions[siden]['toxicspikes'];
			if (!tspikeArray) {
				tspikeArray = [];
				this.sideConditions[siden]['toxicspikes'] = tspikeArray;
			}
			let tspikeLevels = this.battle.sides[siden].sideConditions['toxicspikes'][1];
			if (tspikeArray.length < 1 && tspikeLevels >= 1) {
				const tspike1 = new Sprite(BattleEffects.poisoncaltrop, {
					display: 'block',
					x: x + 5,
					y: y - 40,
					z: side.z,
					scale: 0.3,
				}, this);
				this.$spritesFront[spriteIndex].append(tspike1.$el!);
				tspikeArray.push(tspike1);
			}
			if (tspikeArray.length < 2 && tspikeLevels >= 2) {
				const tspike2 = new Sprite(BattleEffects.poisoncaltrop, {
					display: 'block',
					x: x - 15,
					y: y - 35,
					z: side.z,
					scale: .3,
				}, this);
				this.$spritesFront[spriteIndex].append(tspike2.$el!);
				tspikeArray.push(tspike2);
			}
			break;
		case 'stickyweb':
			const web = new Sprite(BattleEffects.web, {
				display: 'block',
				x: x + 15,
				y: y - 35,
				z: side.z,
				opacity: 0.4,
				scale: 0.7,
			}, this);
			this.$spritesFront[spriteIndex].append(web.$el!);
			this.sideConditions[siden][id] = [web];
			break;
		}
	}
	removeSideCondition(siden: number, id: ID) {
		if (!this.animating) return;
		if (this.sideConditions[siden][id]) {
			for (const sprite of this.sideConditions[siden][id]) sprite.destroy();
			delete this.sideConditions[siden][id];
		}
	}
	resetSideConditions() {
		for (let siden = 0; siden < this.sideConditions.length; siden++) {
			for (const id in this.sideConditions[siden]) {
				this.removeSideCondition(siden, id as ID);
			}
			for (const id in this.battle.sides[siden].sideConditions) {
				this.addSideCondition(siden, id as ID, true);
			}
		}
	}

	typeAnim(pokemon: Pokemon, types: string) {
		const result = BattleLog.escapeHTML(types).split('/').map(type =>
			'<img src="' + Dex.resourcePrefix + 'sprites/types/' + type + '.png" alt="' + type + '" class="pixelated" />'
		).join(' ');
		this.resultAnim(pokemon, result, 'neutral');
	}
	resultAnim(pokemon: Pokemon, result: string, type: 'bad' | 'good' | 'neutral' | StatusName) {
		if (!this.animating) return;
		let $effect = $('<div class="result ' + type + 'result"><strong>' + result + '</strong></div>');
		this.$fx.append($effect);
		$effect.delay(this.timeOffset).css({
			display: 'block',
			opacity: 0,
			top: pokemon.sprite.top - 5,
			left: pokemon.sprite.left - 75,
		}).animate({
			opacity: 1,
		}, 1);
		$effect.animate({
			opacity: 0,
			top: pokemon.sprite.top - 65,
		}, 1000, 'swing');
		this.wait(this.acceleration < 2 ? 350 : 250);
		pokemon.sprite.updateStatbar(pokemon);
		if (this.acceleration < 3) this.waitFor($effect);
	}
	abilityActivateAnim(pokemon: Pokemon, result: string) {
		if (!this.animating) return;
		this.$fx.append('<div class="result abilityresult"><strong>' + result + '</strong></div>');
		let $effect = this.$fx.children().last();
		$effect.delay(this.timeOffset).css({
			display: 'block',
			opacity: 0,
			top: pokemon.sprite.top + 15,
			left: pokemon.sprite.left - 75,
		}).animate({
			opacity: 1,
		}, 1);
		$effect.delay(800).animate({
			opacity: 0,
		}, 400, 'swing');
		this.wait(100);
		pokemon.sprite.updateStatbar(pokemon);
		if (this.acceleration < 3) this.waitFor($effect);
	}
	damageAnim(pokemon: Pokemon, damage: number | string) {
		if (!this.animating) return;
		if (!pokemon.sprite.$statbar) return;
		pokemon.sprite.updateHPText(pokemon);

		let $hp = pokemon.sprite.$statbar.find('div.hp');
		let w = pokemon.hpWidth(150);
		let hpcolor = BattleScene.getHPColor(pokemon);
		let callback;
		if (hpcolor === 'y') {
			callback = () => { $hp.addClass('hp-yellow'); };
		}
		if (hpcolor === 'r') {
			callback = () => { $hp.addClass('hp-yellow hp-red'); };
		}

		if (damage === '100%' && pokemon.hp > 0) damage = '99%';
		this.resultAnim(pokemon, this.battle.hardcoreMode ? 'Damage' : '&minus;' + damage, 'bad');

		$hp.animate({
			width: w,
			'border-right-width': w ? 1 : 0,
		}, 350, callback);
	}
	healAnim(pokemon: Pokemon, damage: number | string) {
		if (!this.animating) return;
		if (!pokemon.sprite.$statbar) return;
		pokemon.sprite.updateHPText(pokemon);

		let $hp = pokemon.sprite.$statbar.find('div.hp');
		let w = pokemon.hpWidth(150);
		let hpcolor = BattleScene.getHPColor(pokemon);
		let callback;
		if (hpcolor === 'g') {
			callback = () => { $hp.removeClass('hp-yellow hp-red'); };
		}
		if (hpcolor === 'y') {
			callback = () => { $hp.removeClass('hp-red'); };
		}

		this.resultAnim(pokemon, this.battle.hardcoreMode ? 'Heal' : '+' + damage, 'good');

		$hp.animate({
			width: w,
			'border-right-width': w ? 1 : 0,
		}, 350, callback);
	}

	// Sprite methods
	/////////////////////////////////////////////////////////////////////

	removeEffect(pokemon: Pokemon, id: ID, instant?: boolean) {
		return pokemon.sprite.removeEffect(id, instant);
	}
	addEffect(pokemon: Pokemon, id: ID, instant?: boolean) {
		return pokemon.sprite.addEffect(id, instant);
	}
	animSummon(pokemon: Pokemon, slot: number, instant?: boolean) {
		return pokemon.sprite.animSummon(pokemon, slot, instant);
	}
	animUnsummon(pokemon: Pokemon, instant?: boolean) {
		return pokemon.sprite.animUnsummon(pokemon, instant);
	}
	animDragIn(pokemon: Pokemon, slot: number) {
		return pokemon.sprite.animDragIn(pokemon, slot);
	}
	animDragOut(pokemon: Pokemon) {
		return pokemon.sprite.animDragOut(pokemon);
	}
	resetStatbar(pokemon: Pokemon, startHidden?: boolean) {
		return pokemon.sprite.resetStatbar(pokemon, startHidden);
	}
	updateStatbar(pokemon: Pokemon, updatePrevhp?: boolean, updateHp?: boolean) {
		return pokemon.sprite.updateStatbar(pokemon, updatePrevhp, updateHp);
	}
	updateStatbarIfExists(pokemon: Pokemon, updatePrevhp?: boolean, updateHp?: boolean) {
		return pokemon.sprite.updateStatbarIfExists(pokemon, updatePrevhp, updateHp);
	}
	animTransform(pokemon: Pokemon, isCustomAnim?: boolean, isPermanent?: boolean) {
		return pokemon.sprite.animTransform(pokemon, isCustomAnim, isPermanent);
	}
	clearEffects(pokemon: Pokemon) {
		return pokemon.sprite.clearEffects();
	}
	removeTransform(pokemon: Pokemon) {
		return pokemon.sprite.removeTransform();
	}
	animFaint(pokemon: Pokemon) {
		return pokemon.sprite.animFaint(pokemon);
	}
	animReset(pokemon: Pokemon) {
		return pokemon.sprite.animReset();
	}
	anim(pokemon: Pokemon, end: ScenePos, transition?: string) {
		return pokemon.sprite.anim(end, transition);
	}
	beforeMove(pokemon: Pokemon) {
		return pokemon.sprite.beforeMove();
	}
	afterMove(pokemon: Pokemon) {
		return pokemon.sprite.afterMove();
	}

	// Misc
	/////////////////////////////////////////////////////////////////////

	setFrameHTML(html: any) {
		this.customControls = true;
		this.$frame.html(html);
	}
	setControlsHTML(html: any) {
		this.customControls = true;
		let $controls = this.$frame.parent().children('.battle-controls');
		$controls.html(html);
	}

	preloadImage(url: string) {
		let token = url.replace(/\.(gif|png)$/, '').replace(/\//g, '-');
		if (this.preloadCache[token]) {
			return;
		}
		this.preloadNeeded++;
		this.preloadCache[token] = new Image();
		this.preloadCache[token].onload = () => {
			this.preloadDone++;
		};
		this.preloadCache[token].src = url;
	}
	preloadEffects() {
		for (let i in BattleEffects) {
			if (i === 'alpha' || i === 'omega') continue;
			const url = BattleEffects[i].url;
			if (url) this.preloadImage(url);
		}
		this.preloadImage(Dex.resourcePrefix + 'sprites/ani/substitute.gif');
		this.preloadImage(Dex.resourcePrefix + 'sprites/ani-back/substitute.gif');
	}
	rollBgm() {
		this.setBgm(1 + this.numericId % 15);
	}
	setBgm(bgmNum: number) {
		if (this.bgmNum === bgmNum) return;
		this.bgmNum = bgmNum;

		switch (bgmNum) {
		case -1:
			this.bgm = BattleSound.loadBgm('audio/bw2-homika-dogars.mp3', 1661, 68131, this.bgm);
			break;
		case -2:
			this.bgm = BattleSound.loadBgm('audio/xd-miror-b.mp3', 9000, 57815, this.bgm);
			break;
		case -3:
			this.bgm = BattleSound.loadBgm('audio/colosseum-miror-b.mp3', 896, 47462, this.bgm);
			break;
		case 1:
			this.bgm = BattleSound.loadBgm('audio/dpp-trainer.mp3', 13440, 96959, this.bgm);
			break;
		case 2:
			this.bgm = BattleSound.loadBgm('audio/dpp-rival.mp3', 13888, 66352, this.bgm);
			break;
		case 3:
			this.bgm = BattleSound.loadBgm('audio/hgss-johto-trainer.mp3', 23731, 125086, this.bgm);
			break;
		case 4:
			this.bgm = BattleSound.loadBgm('audio/hgss-kanto-trainer.mp3', 13003, 94656, this.bgm);
			break;
		case 5:
			this.bgm = BattleSound.loadBgm('audio/bw-trainer.mp3', 14629, 110109, this.bgm);
			break;
		case 6:
			this.bgm = BattleSound.loadBgm('audio/bw-rival.mp3', 19180, 57373, this.bgm);
			break;
		case 7:
			this.bgm = BattleSound.loadBgm('audio/bw-subway-trainer.mp3', 15503, 110984, this.bgm);
			break;
		case 8:
			this.bgm = BattleSound.loadBgm('audio/bw2-kanto-gym-leader.mp3', 14626, 58986, this.bgm);
			break;
		case 9:
			this.bgm = BattleSound.loadBgm('audio/bw2-rival.mp3', 7152, 68708, this.bgm);
			break;
		case 10:
			this.bgm = BattleSound.loadBgm('audio/xy-trainer.mp3', 7802, 82469, this.bgm);
			break;
		case 11:
			this.bgm = BattleSound.loadBgm('audio/xy-rival.mp3', 7802, 58634, this.bgm);
			break;
		case 12:
			this.bgm = BattleSound.loadBgm('audio/oras-trainer.mp3', 13579, 91548, this.bgm);
			break;
		case 13:
			this.bgm = BattleSound.loadBgm('audio/oras-rival.mp3', 14303, 69149, this.bgm);
			break;
		case 14:
			this.bgm = BattleSound.loadBgm('audio/sm-trainer.mp3', 8323, 89230, this.bgm);
			break;
		case -101:
			this.bgm = BattleSound.loadBgm('audio/spl-elite4.mp3', 3962, 152509, this.bgm);
			break;
		case 15:
		default:
			this.bgm = BattleSound.loadBgm('audio/sm-rival.mp3', 11389, 62158, this.bgm);
			break;
		}

		this.updateBgm();
	}
	updateBgm() {
		/**
		 * - not playing in non-battle RoomGames before `|start` (turn -1)
		 * - not playing at team preview in replays (paused)
		 * - playing at team preview in games (turn 0)
		 * - playing during the game (turn 1+)
		 * - not playing while paused
		 * - playing while waiting for players to choose moves (atQueueEnd && !ended)
		 * - not playing after the game has ended
		 */
		const nowPlaying = (
			this.battle.turn >= 0 && !this.battle.ended && !this.battle.paused
		);
		if (nowPlaying) {
			if (!this.bgm) this.rollBgm();
			this.bgm!.resume();
		} else if (this.bgm) {
			this.bgm.pause();
		}
	}
	resetBgm() {
		if (this.bgm) this.bgm.stop();
	}
	destroy() {
		this.log.destroy();
		if (this.$frame) {
			this.$frame.empty();
			// listeners set by BattleTooltips
			this.$frame.off();
		}
		if (this.bgm) {
			this.bgm.destroy();
			this.bgm = null;
		}
		this.battle = null!;
	}
	static getHPColor(pokemon: {hp: number, maxhp: number}) {
		let ratio = pokemon.hp / pokemon.maxhp;
		if (ratio > 0.5) return 'g';
		if (ratio > 0.2) return 'y';
		return 'r';
	}
}

export interface ScenePos {
	/** - left, + right */
	x?: number;
	/** - down, + up */
	y?: number;
	/** - player, + opponent */
	z?: number;
	scale?: number;
	xscale?: number;
	yscale?: number;
	opacity?: number;
	time?: number;
	display?: string;
}
interface InitScenePos {
	x: number;
	y: number;
	z: number;
	scale?: number;
	xscale?: number;
	yscale?: number;
	opacity?: number;
	time?: number;
	display?: string;
}

export class Sprite {
	scene: BattleScene;
	$el: JQuery = null!;
	sp: SpriteData;
	x: number;
	y: number;
	z: number;
	constructor(spriteData: SpriteData | null, pos: InitScenePos, scene: BattleScene) {
		this.scene = scene;
		let sp = null;
		if (spriteData) {
			sp = spriteData;
			let rawHTML = sp.rawHTML ||
				'<img src="' + sp.url + '" style="display:none;position:absolute"' + (sp.pixelated ? ' class="pixelated"' : '') + ' />';
			this.$el = $(rawHTML);
		} else {
			sp = {
				w: 0,
				h: 0,
				url: '',
			};
		}
		this.sp = sp;

		this.x = pos.x;
		this.y = pos.y;
		this.z = pos.z;
		if (pos.opacity !== 0 && spriteData) this.$el!.css(scene.pos(pos, sp));

		if (!spriteData) {
			this.delay = function () { return this; };
			this.anim = function () { return this; };
		}
	}

	destroy() {
		if (this.$el) this.$el.remove();
		this.$el = null!;
		this.scene = null!;
	}
	delay(time: number) {
		this.$el!.delay(time);
		return this;
	}
	anim(end: ScenePos, transition?: string) {
		end = {
			x: this.x,
			y: this.y,
			z: this.z,
			scale: 1,
			opacity: 1,
			time: 500,
			...end,
		};
		if (end.time === 0) {
			this.$el!.css(this.scene.pos(end, this.sp));
			return this;
		}
		this.$el!.animate(this.scene.posT(end, this.sp, transition, this), end.time!);
		return this;
	}
}

export class PokemonSprite extends Sprite {
	// HTML strings are constructed from this table and stored back in it to cache them
	protected static statusTable: {[id: string]: [string, 'good' | 'bad' | 'neutral'] | null | string} = {
		formechange: null,
		typechange: null,
		typeadd: null,
		dynamax: ['Dynamaxed', 'good'],
		trapped: null, // linked volatiles are not implemented yet
		throatchop: ['Throat Chop', 'bad'],
		confusion: ['Confused', 'bad'],
		healblock: ['Heal Block', 'bad'],
		yawn: ['Drowsy', 'bad'],
		flashfire: ['Flash Fire', 'good'],
		imprison: ['Imprisoning foe', 'good'],
		autotomize: ['Lightened', 'neutral'],
		miracleeye: ['Miracle Eye', 'bad'],
		foresight: ['Foresight', 'bad'],
		telekinesis: ['Telekinesis', 'neutral'],
		transform: ['Transformed', 'neutral'],
		powertrick: ['Power Trick', 'neutral'],
		curse: ['Curse', 'bad'],
		nightmare: ['Nightmare', 'bad'],
		attract: ['Infatuation', 'bad'],
		torment: ['Torment', 'bad'],
		taunt: ['Taunt', 'bad'],
		disable: ['Disable', 'bad'],
		embargo: ['Embargo', 'bad'],
		ingrain: ['Ingrain', 'good'],
		aquaring: ['Aqua Ring', 'good'],
		stockpile1: ['Stockpile', 'good'],
		stockpile2: ['Stockpile&times;2', 'good'],
		stockpile3: ['Stockpile&times;3', 'good'],
		perish0: ['Perish now', 'bad'],
		perish1: ['Perish next turn', 'bad'],
		perish2: ['Perish in 2', 'bad'],
		perish3: ['Perish in 3', 'bad'],
		airballoon: ['Balloon', 'good'],
		leechseed: ['Leech Seed', 'bad'],
		encore: ['Encore', 'bad'],
		mustrecharge: ['Must recharge', 'bad'],
		bide: ['Bide', 'good'],
		magnetrise: ['Magnet Rise', 'good'],
		smackdown: ['Smack Down', 'bad'],
		focusenergy: ['Critical Hit Boost', 'good'],
		dragoncheer: ['Critical Hit Boost', 'good'],
		slowstart: ['Slow Start', 'bad'],
		protosynthesisatk: ['Protosynthesis: Atk', 'good'],
		protosynthesisdef: ['Protosynthesis: Def', 'good'],
		protosynthesisspa: ['Protosynthesis: SpA', 'good'],
		protosynthesisspd: ['Protosynthesis: SpD', 'good'],
		protosynthesisspe: ['Protosynthesis: Spe', 'good'],
		quarkdriveatk: ['Quark Drive: Atk', 'good'],
		quarkdrivedef: ['Quark Drive: Def', 'good'],
		quarkdrivespa: ['Quark Drive: SpA', 'good'],
		quarkdrivespd: ['Quark Drive: SpD', 'good'],
		quarkdrivespe: ['Quark Drive: Spe', 'good'],
		fallen1: ['Fallen: 1', 'good'],
		fallen2: ['Fallen: 2', 'good'],
		fallen3: ['Fallen: 3', 'good'],
		fallen4: ['Fallen: 4', 'good'],
		fallen5: ['Fallen: 5', 'good'],
		noretreat: ['No Retreat', 'bad'],
		octolock: ['Octolock', 'bad'],
		tarshot: ['Tar Shot', 'bad'],
		saltcure: ['Salt Cure', 'bad'],
		syrupbomb: ['Syrupy', 'bad'],
		doomdesire: null,
		futuresight: null,
		mimic: ['Mimic', 'good'],
		watersport: ['Water Sport', 'good'],
		mudsport: ['Mud Sport', 'good'],
		substitute: null,
		// sub graphics are handled elsewhere, see Battle.Sprite.animSub()
		uproar: ['Uproar', 'neutral'],
		rage: ['Rage', 'neutral'],
		roost: ['Landed', 'neutral'],
		protect: ['Protect', 'good'],
		quickguard: ['Quick Guard', 'good'],
		wideguard: ['Wide Guard', 'good'],
		craftyshield: ['Crafty Shield', 'good'],
		matblock: ['Mat Block', 'good'],
		maxguard: ['Max Guard', 'good'],
		helpinghand: ['Helping Hand', 'good'],
		magiccoat: ['Magic Coat', 'good'],
		destinybond: ['Destiny Bond', 'good'],
		snatch: ['Snatch', 'good'],
		grudge: ['Grudge', 'good'],
		charge: ['Charge', 'good'],
		endure: ['Endure', 'good'],
		focuspunch: ['Focusing', 'neutral'],
		shelltrap: ['Trap set', 'neutral'],
		powder: ['Powder', 'bad'],
		electrify: ['Electrify', 'bad'],
		glaiverush: ['Glaive Rush', 'bad'],
		ragepowder: ['Rage Powder', 'good'],
		followme: ['Follow Me', 'good'],
		instruct: ['Instruct', 'neutral'],
		beakblast: ['Beak Blast', 'neutral'],
		laserfocus: ['Laser Focus', 'good'],
		spotlight: ['Spotlight', 'neutral'],
		itemremoved: null,
		// partial trapping
		bind: ['Bind', 'bad'],
		clamp: ['Clamp', 'bad'],
		firespin: ['Fire Spin', 'bad'],
		infestation: ['Infestation', 'bad'],
		magmastorm: ['Magma Storm', 'bad'],
		sandtomb: ['Sand Tomb', 'bad'],
		snaptrap: ['Snap Trap', 'bad'],
		thundercage: ['Thunder Cage', 'bad'],
		whirlpool: ['Whirlpool', 'bad'],
		wrap: ['Wrap', 'bad'],
		// Gen 1-2
		mist: ['Mist', 'good'],
		// Gen 1
		lightscreen: ['Light Screen', 'good'],
		reflect: ['Reflect', 'good'],
	};
	forme = '';
	cryurl: string | undefined = undefined;

	subsp: SpriteData | null = null;
	$sub: JQuery | null = null;
	isSubActive = false;

	$statbar: JQuery | null = null;
	isFrontSprite: boolean;
	isMissedPokemon = false;
	/**
	 * If the pokemon is transformed, sprite.sp will be the transformed
	 * SpriteData and sprite.oldsp will hold the original form's SpriteData
	 */
	oldsp: SpriteData | null = null;

	statbarLeft = 0;
	statbarTop = 0;
	left = 0;
	top = 0;

	effects: {[id: string]: Sprite[]} = {};

	constructor(spriteData: SpriteData | null, pos: InitScenePos, scene: BattleScene, isFrontSprite: boolean) {
		super(spriteData, pos, scene);
		this.cryurl = this.sp.cryurl;
		this.isFrontSprite = isFrontSprite;
	}
	destroy() {
		if (this.$el) this.$el.remove();
		this.$el = null!;
		if (this.$statbar) this.$statbar.remove();
		this.$statbar = null;
		if (this.$sub) this.$sub.remove();
		this.$sub = null;
		this.scene = null!;
	}

	delay(time: number) {
		this.$el.delay(time);
		if (this.$sub) this.$sub.delay(time);
		return this;
	}
	anim(end: ScenePos, transition?: string) {
		end = {
			x: this.x,
			y: this.y,
			z: this.z,
			scale: 1,
			opacity: 1,
			time: 500,
			...end,
		};
		const [$el, sp] = (this.isSubActive ? [this.$sub!, this.subsp!] : [this.$el, this.sp]);
		$el.animate(this.scene.posT(end, sp, transition, this), end.time!);
		return this;
	}

	behindx(offset: number) {
		return this.x + (this.isFrontSprite ? 1 : -1) * offset;
	}
	behindy(offset: number) {
		return this.y + (this.isFrontSprite ? -1 : 1) * offset;
	}
	leftof(offset: number) {
		return this.x + (this.isFrontSprite ? 1 : -1) * offset;
	}
	behind(offset: number) {
		return this.z + (this.isFrontSprite ? 1 : -1) * offset;
	}

	removeTransform() {
		if (!this.scene.animating) return;
		if (!this.oldsp) return;
		let sp = this.oldsp;
		this.cryurl = sp.cryurl;
		this.sp = sp;
		this.oldsp = null;

		const $el = this.isSubActive ? this.$sub! : this.$el;
		$el.attr('src', sp.url!);
		$el.css(this.scene.pos({
			x: this.x,
			y: this.y,
			z: (this.isSubActive ? this.behind(30) : this.z),
			opacity: (this.$sub ? .3 : 1),
		}, sp));
	}
	animSub(instant?: boolean, noAnim?: boolean) {
		if (!this.scene.animating) return;
		if (this.$sub) return;
		const subsp = Dex.getSpriteData('substitute', this.isFrontSprite, {
			gen: this.scene.gen,
			mod: this.scene.mod,
		});
		this.subsp = subsp;
		this.$sub = $('<img src="' + subsp.url + '" style="display:block;opacity:0;position:absolute"' + (subsp.pixelated ? ' class="pixelated"' : '') + ' />');
		this.scene.$spritesFront[+this.isFrontSprite].append(this.$sub);
		this.isSubActive = true;
		if (instant) {
			if (!noAnim) this.animReset();
			return;
		}
		this.$el.animate(this.scene.pos({
			x: this.x,
			y: this.y,
			z: this.behind(30),
			opacity: 0.3,
		}, this.sp), 500);
		this.$sub.css(this.scene.pos({
			x: this.x,
			y: this.y + 50,
			z: this.z,
			opacity: 0,
		}, subsp));
		this.$sub.animate(this.scene.pos({
			x: this.x,
			y: this.y,
			z: this.z,
		}, subsp), 500);
		this.scene.waitFor(this.$sub);
	}
	animSubFade(instant?: boolean) {
		if (!this.$sub || !this.scene.animating) return;
		this.isSubActive = false;
		if (instant) {
			this.$sub.remove();
			this.$sub = null;
			this.animReset();
			return;
		}
		if (this.scene.timeOffset) {
			this.$el.delay(this.scene.timeOffset);
			this.$sub.delay(this.scene.timeOffset);
		}
		this.$sub.animate(this.scene.pos({
			x: this.x,
			y: this.y - 50,
			z: this.z,
			opacity: 0,
		}, this.subsp!), 500);

		this.$sub = null;
		this.anim({time: 500});
		if (this.scene.animating) this.scene.waitFor(this.$el);
	}
	beforeMove() {
		if (!this.scene.animating) return false;
		if (!this.isSubActive) return false;
		this.isSubActive = false;
		this.anim({time: 300});
		this.$sub!.animate(this.scene.pos({
			x: this.leftof(-50),
			y: this.y,
			z: this.z,
			opacity: 0.5,
		}, this.subsp!), 300);
		for (const side of this.scene.battle.sides) {
			for (const active of side.active) {
				if (active && active.sprite !== this) {
					active.sprite.delay(300);
				}
			}
		}
		this.scene.wait(300);
		this.scene.waitFor(this.$el);

		return true;
	}
	afterMove() {
		if (!this.scene.animating) return false;
		if (!this.$sub || this.isSubActive) return false;
		this.isSubActive = true;
		this.$sub.delay(300);
		this.$el.add(this.$sub).promise().done(() => {
			if (!this.$sub || !this.$el) return;
			this.$el.animate(this.scene.pos({
				x: this.x,
				y: this.y,
				z: this.behind(30),
				opacity: 0.3,
			}, this.sp), 300);
			this.anim({time: 300});
		});
		return false;
	}
	removeSub() {
		if (!this.$sub) return;
		this.isSubActive = false;
		if (!this.scene.animating) {
			this.$sub.remove();
		} else {
			const $sub = this.$sub;
			$sub.animate({
				opacity: 0,
			}, () => {
				$sub.remove();
			});
		}
		this.$sub = null;
	}
	reset(pokemon: Pokemon) {
		this.clearEffects();

		if (pokemon.volatiles.formechange || pokemon.volatiles.dynamax || pokemon.volatiles.terastallize) {
			if (!this.oldsp) this.oldsp = this.sp;
			this.sp = Dex.getSpriteData(pokemon, this.isFrontSprite, {
				gen: this.scene.gen,
				mod: this.scene.mod,
			});
		} else if (this.oldsp) {
			this.sp = this.oldsp;
			this.oldsp = null;
		}

		// I can rant for ages about how jQuery sucks, necessitating this function
		// The short version is: after calling elem.finish() on an animating
		// element, there appear to be a grand total of zero ways to hide it
		// afterwards. I've tried `elem.css('display', 'none')`, `elem.hide()`,
		// `elem.hide(1)`, `elem.hide(1000)`, `elem.css('opacity', 0)`,
		// `elem.animate({opacity: 0}, 1000)`.
		// They literally all do nothing, and the element retains
		// a style attribute containing `display: inline-block` and `opacity: 1`
		// Only forcibly removing the element from the DOM actually makes it
		// disappear, so that's what we do.
		if (this.$el) {
			this.$el.stop(true, false);
			this.$el.remove();
			const $newEl = $('<img src="' + this.sp.url + '" style="display:none;position:absolute"' + (this.sp.pixelated ? ' class="pixelated"' : '') + ' />');
			this.$el = $newEl;
		}

		if (!pokemon.isActive()) {
			if (this.$statbar) {
				this.$statbar.remove();
				this.$statbar = null;
			}
			return;
		}

		if (this.$el) this.scene.$sprites[+this.isFrontSprite].append(this.$el);
		this.recalculatePos(pokemon.slot);
		this.resetStatbar(pokemon);
		this.$el.css(this.scene.pos({
			display: 'block',
			x: this.x,
			y: this.y,
			z: this.z,
		}, this.sp));

		for (const id in pokemon.volatiles) this.addEffect(id as ID, true);
		for (const id in pokemon.turnstatuses) this.addEffect(id as ID, true);
		for (const id in pokemon.movestatuses) this.addEffect(id as ID, true);
	}
	animReset() {
		if (!this.scene.animating) return;
		if (this.$sub) {
			this.isSubActive = true;
			this.$el.stop(true, false);
			this.$sub.stop(true, false);
			this.$el.css(this.scene.pos({
				x: this.x,
				y: this.y,
				z: this.behind(30),
				opacity: .3,
			}, this.sp));
			this.$sub.css(this.scene.pos({
				x: this.x,
				y: this.y,
				z: this.z,
			}, this.subsp!));
		} else {
			this.$el.stop(true, false);
			this.$el.css(this.scene.pos({
				x: this.x,
				y: this.y,
				z: this.z,
			}, this.sp));
		}
	}
	recalculatePos(slot: number) {
		let moreActive = this.scene.activeCount - 1;
		let statbarOffset = 0;
		const isFFA = this.scene.battle.gameType === 'freeforall';
		if (isFFA) {
			// create a gap between Pokemon on the same "side" as a distinction between FFA and Multi battles
			moreActive++;
			if (slot) slot++;
		}
		if (this.scene.gen <= 4 && moreActive) {
			this.x = (slot - 0.52) * (this.isFrontSprite ? 1 : -1) * -55;
			this.y = (this.isFrontSprite ? 1 : -1) + 1;
			if (this.isFrontSprite) statbarOffset = 30 * slot;
			if (!this.isFrontSprite) statbarOffset = -28 * slot;
		} else {
			switch (moreActive) {
			case 0:
				this.x = 0;
				break;
			case 1:
				if (this.sp.pixelated) {
					this.x = (slot * -100 + 18) * (this.isFrontSprite ? 1 : -1);
				} else {
					this.x = (slot * -75 + 18) * (this.isFrontSprite ? 1 : -1);
				}
				break;
			case 2:
				this.x = (slot * -70 + 20) * (this.isFrontSprite ? 1 : -1);
				break;
			}
			this.y = this.isFrontSprite ? slot * 7 : slot * -10;
			if (this.isFrontSprite) statbarOffset = 17 * slot;
			if (this.isFrontSprite && !moreActive && this.sp.pixelated) statbarOffset = 15;
			if (!this.isFrontSprite) statbarOffset = -7 * slot;
			if (this.isFrontSprite && moreActive === 2) statbarOffset = 14 * slot - 10;
		}
		if (this.scene.gen <= 2) {
			statbarOffset += this.isFrontSprite ? 20 : 1;
		} else if (this.scene.gen <= 3) {
			statbarOffset += this.isFrontSprite ? 30 : 5;
		} else if (this.scene.gen !== 5) {
			statbarOffset += this.isFrontSprite ? 30 : 20;
		}

		let pos = this.scene.pos({
			x: this.x,
			y: this.y,
			z: this.z,
		}, {
			w: 0,
			h: 96,
		});
		pos.top += 40;

		this.left = pos.left;
		this.top = pos.top;
		this.statbarLeft = pos.left - 80;
		this.statbarTop = pos.top - 73 - statbarOffset;
		if (this.statbarTop < -4) this.statbarTop = -4;

		if (moreActive) {
			// make sure element is in the right z-order
			if (!!slot === this.isFrontSprite) {
				this.$el.prependTo(this.$el.parent());
			} else {
				this.$el.appendTo(this.$el.parent());
			}
		}
	}
	animSummon(pokemon: Pokemon, slot: number, instant?: boolean) {
		if (!this.scene.animating) return;
		this.scene.$sprites[+this.isFrontSprite].append(this.$el);
		this.recalculatePos(slot);

		// 'z-index': (this.isFrontSprite ? 4-slot : 1+slot),
		if (instant) {
			this.$el.css('display', 'block');
			this.animReset();
			this.resetStatbar(pokemon);
			if (pokemon.hasVolatile('substitute' as ID)) this.animSub(true);
			return;
		}
		if (this.cryurl) {
			BattleSound.playEffect(this.cryurl);
		}
		this.$el.css(this.scene.pos({
			display: 'block',
			x: this.x,
			y: this.y - 10,
			z: this.z,
			scale: 0,
			opacity: 0,
		}, this.sp));
		this.scene.showEffect('pokeball', {
			opacity: 0,
			x: this.x,
			y: this.y + 30,
			z: this.behind(50),
			scale: .7,
		}, {
			opacity: 1,
			x: this.x,
			y: this.y - 10,
			z: this.z,
			time: 300 / this.scene.acceleration,
		}, 'ballistic2', 'fade');
		if (this.scene.gen <= 4) {
			this.delay(this.scene.timeOffset + 300 / this.scene.acceleration).anim({
				x: this.x,
				y: this.y,
				z: this.z,
				time: 400 / this.scene.acceleration,
			});
		} else {
			this.delay(this.scene.timeOffset + 300 / this.scene.acceleration).anim({
				x: this.x,
				y: this.y + 30,
				z: this.z,
				time: 400 / this.scene.acceleration,
			}).anim({
				x: this.x,
				y: this.y,
				z: this.z,
				time: 300 / this.scene.acceleration,
			}, 'accel');
		}
		if (this.sp.shiny && this.scene.acceleration < 2) BattleOtherAnims.shiny.anim(this.scene, [this]);
		this.scene.waitFor(this.$el);

		if (pokemon.hasVolatile('substitute' as ID)) {
			this.animSub(true, true);
			this.$sub!.css(this.scene.pos({
				x: this.x,
				y: this.y,
				z: this.z,
			}, this.subsp!));
			this.$el.animate(this.scene.pos({
				x: this.x,
				y: this.y,
				z: this.behind(30),
				opacity: 0.3,
			}, this.sp), 300);
		}

		this.resetStatbar(pokemon, true);
		this.scene.updateSidebar(pokemon.side);
		this.$statbar!.css({
			display: 'block',
			left: this.statbarLeft,
			top: this.statbarTop + 20,
			opacity: 0,
		});
		this.$statbar!.delay(300 / this.scene.acceleration).animate({
			top: this.statbarTop,
			opacity: 1,
		}, 400 / this.scene.acceleration);

		this.dogarsCheck(pokemon);
	}
	animDragIn(pokemon: Pokemon, slot: number) {
		if (!this.scene.animating) return;
		this.scene.$sprites[+this.isFrontSprite].append(this.$el);
		this.recalculatePos(slot);

		// 'z-index': (this.isFrontSprite ? 4-slot : 1+slot),
		this.$el.css(this.scene.pos({
			display: 'block',
			x: this.leftof(-100),
			y: this.y,
			z: this.z,
			opacity: 0,
		}, this.sp));
		this.delay(300).anim({
			x: this.x,
			y: this.y,
			z: this.z,
			time: 400,
		}, 'decel');
		if (!!this.scene.animating && this.sp.shiny) BattleOtherAnims.shiny.anim(this.scene, [this]);
		this.scene.waitFor(this.$el);
		this.scene.timeOffset = 700;

		this.resetStatbar(pokemon, true);
		this.scene.updateSidebar(pokemon.side);
		this.$statbar!.css({
			display: 'block',
			left: this.statbarLeft + (this.isFrontSprite ? -100 : 100),
			top: this.statbarTop,
			opacity: 0,
		});
		this.$statbar!.delay(300).animate({
			left: this.statbarLeft,
			opacity: 1,
		}, 400);

		this.dogarsCheck(pokemon);
	}
	animDragOut(pokemon: Pokemon) {
		if (!this.scene.animating) return this.animUnsummon(pokemon, true);
		if (this.$sub) {
			this.isSubActive = false;
			const $sub = this.$sub;
			$sub.animate(this.scene.pos({
				x: this.leftof(100),
				y: this.y,
				z: this.z,
				opacity: 0,
				time: 400,
			}, this.subsp!), () => {
				$sub.remove();
			});
			this.$sub = null;
		}
		this.anim({
			x: this.leftof(100),
			y: this.y,
			z: this.z,
			opacity: 0,
			time: 400,
		}, 'accel');

		this.updateStatbar(pokemon, true);
		let $statbar = this.$statbar;
		if ($statbar) {
			this.$statbar = null;
			$statbar.animate({
				left: this.statbarLeft - (this.isFrontSprite ? -100 : 100),
				opacity: 0,
			}, 300 / this.scene.acceleration, () => {
				$statbar!.remove();
			});
		}
	}
	animUnsummon(pokemon: Pokemon, instant?: boolean) {
		this.removeSub();
		if (!this.scene.animating || instant) {
			this.$el.hide();
			if (this.$statbar) {
				this.$statbar.remove();
				this.$statbar = null;
			}
			return;
		}
		if (this.scene.gen <= 4) {
			this.anim({
				x: this.x,
				y: this.y - 25,
				z: this.z,
				scale: 0,
				opacity: 0,
				time: 400 / this.scene.acceleration,
			});
		} else {
			this.anim({
				x: this.x,
				y: this.y - 40,
				z: this.z,
				scale: 0,
				opacity: 0,
				time: 400 / this.scene.acceleration,
			});
		}
		this.scene.showEffect('pokeball', {
			opacity: 1,
			x: this.x,
			y: this.y - 40,
			z: this.z,
			scale: .7,
			time: 300 / this.scene.acceleration,
		}, {
			opacity: 0,
			x: this.x,
			y: this.y,
			z: this.behind(50),
			time: 700 / this.scene.acceleration,
		}, 'ballistic2');
		if (this.scene.acceleration < 3) this.scene.wait(600 / this.scene.acceleration);

		this.updateStatbar(pokemon, true);
		let $statbar = this.$statbar;
		if ($statbar) {
			this.$statbar = null;
			$statbar.animate({
				left: this.statbarLeft + (this.isFrontSprite ? 50 : -50),
				opacity: 0,
			}, 300 / this.scene.acceleration, () => {
				$statbar!.remove();
			});
		}
	}
	animFaint(pokemon: Pokemon) {
		this.removeSub();
		if (!this.scene.animating) {
			this.$el.remove();
			if (this.$statbar) {
				this.$statbar.remove();
				this.$statbar = null;
			}
			return;
		}
		this.updateStatbar(pokemon, false, true);
		this.scene.updateSidebar(pokemon.side);
		if (this.cryurl) {
			BattleSound.playEffect(this.cryurl);
		}
		this.anim({
			y: this.y - 80,
			opacity: 0,
		}, 'accel');
		this.scene.waitFor(this.$el);
		this.$el.promise().done(() => {
			this.$el.remove();
		});

		let $statbar = this.$statbar;
		if ($statbar) {
			this.$statbar = null;
			$statbar.animate({
				opacity: 0,
			}, 300, () => {
				$statbar!.remove();
			});
		}
	}
	animTransform(pokemon: Pokemon, isCustomAnim?: boolean, isPermanent?: boolean) {
		if (!this.scene.animating && !isPermanent) return;
		let sp = Dex.getSpriteData(pokemon, this.isFrontSprite, {
			gen: this.scene.gen,
			mod: this.scene.mod,
		});
		let oldsp = this.sp;
		if (isPermanent) {
			if (pokemon.volatiles.dynamax) {
				// if a permanent forme change happens while dynamaxed, we need an undynamaxed sprite to go back to
				this.oldsp = Dex.getSpriteData(pokemon, this.isFrontSprite, {
					gen: this.scene.gen,
					mod: this.scene.mod,
					dynamax: false,
				});
			} else {
				this.oldsp = null;
			}
		} else if (!this.oldsp) {
			this.oldsp = oldsp;
		}
		this.sp = sp;
		this.cryurl = sp.cryurl;

		if (!this.scene.animating) return;
		let speciesid = toID(pokemon.getSpeciesForme());
		let doCry = false;
		const scene = this.scene;
		if (isCustomAnim) {
			if (speciesid === 'kyogreprimal') {
				BattleOtherAnims.primalalpha.anim(scene, [this]);
				doCry = true;
			} else if (speciesid === 'groudonprimal') {
				BattleOtherAnims.primalomega.anim(scene, [this]);
				doCry = true;
			} else if (speciesid === 'necrozmaultra') {
				BattleOtherAnims.ultraburst.anim(scene, [this]);
				doCry = true;
			} else if (speciesid === 'zygardecomplete') {
				BattleOtherAnims.powerconstruct.anim(scene, [this]);
			} else if (speciesid === 'wishiwashischool' || speciesid === 'greninjaash') {
				BattleOtherAnims.schoolingin.anim(scene, [this]);
			} else if (speciesid === 'wishiwashi') {
				BattleOtherAnims.schoolingout.anim(scene, [this]);
			} else if (speciesid === 'mimikyubusted' || speciesid === 'mimikyubustedtotem') {
				// standard animation
			} else {
				BattleOtherAnims.megaevo.anim(scene, [this]);
				doCry = true;
			}
		}
		// Constructing here gives us 300ms extra time to preload the new sprite
		let $newEl = $('<img src="' + sp.url + '" style="display:block;opacity:0;position:absolute"' + (sp.pixelated ? ' class="pixelated"' : '') + ' />');
		$newEl.css(this.scene.pos({
			x: this.x,
			y: this.y,
			z: this.z,
			yscale: 0,
			xscale: 0,
			opacity: 0,
		}, sp));
		if (speciesid === 'palafinhero') {
			this.$el.replaceWith($newEl);
			this.$el = $newEl;
		} else {
			this.$el.animate(this.scene.pos({
				x: this.x,
				y: this.y,
				z: this.z,
				yscale: 0,
				xscale: 0,
				opacity: 0.3,
			}, oldsp), 300, () => {
				if (this.cryurl && doCry) {
					BattleSound.playEffect(this.cryurl);
				}
				this.$el.replaceWith($newEl);
				this.$el = $newEl;
				this.$el.animate(scene.pos({
					x: this.x,
					y: this.y,
					z: this.z,
					opacity: 1,
				}, sp), 300);
			});
			this.scene.wait(500);
		}

		this.scene.updateSidebar(pokemon.side);
		if (isPermanent) {
			this.resetStatbar(pokemon);
		} else {
			this.updateStatbar(pokemon);
		}
	}

	pokeEffect(id: ID) {
		if (id === 'protect' || id === 'magiccoat') {
			this.effects[id][0].anim({
				scale: 1.2,
				opacity: 1,
				time: 100,
			}).anim({
				opacity: .4,
				time: 300,
			});
		}
	}
	addEffect(id: ID, instant?: boolean) {
		if (id in this.effects) {
			this.pokeEffect(id);
			return;
		}
		const spriten = +this.isFrontSprite;
		if (id === 'substitute' || id === 'shedtail') {
			this.animSub(instant);
		} else if (id === 'leechseed') {
			const pos1 = {
				display: 'block',
				x: this.x - 30,
				y: this.y - 40,
				z: this.z,
				scale: .2,
				opacity: .6,
			};
			const pos2 = {
				display: 'block',
				x: this.x + 40,
				y: this.y - 35,
				z: this.z,
				scale: .2,
				opacity: .6,
			};
			const pos3 = {
				display: 'block',
				x: this.x + 20,
				y: this.y - 25,
				z: this.z,
				scale: .2,
				opacity: .6,
			};

			const leechseed1 = new Sprite(BattleEffects.energyball, pos1, this.scene);
			const leechseed2 = new Sprite(BattleEffects.energyball, pos2, this.scene);
			const leechseed3 = new Sprite(BattleEffects.energyball, pos3, this.scene);
			this.scene.$spritesFront[spriten].append(leechseed1.$el!);
			this.scene.$spritesFront[spriten].append(leechseed2.$el!);
			this.scene.$spritesFront[spriten].append(leechseed3.$el!);
			this.effects['leechseed'] = [leechseed1, leechseed2, leechseed3];
		} else if (id === 'protect' || id === 'magiccoat') {
			const protect = new Sprite(BattleEffects.protect, {
				display: 'block',
				x: this.x,
				y: this.y,
				z: this.behind(-15),
				xscale: 1,
				yscale: 0,
				opacity: .1,
			}, this.scene);
			this.scene.$spritesFront[spriten].append(protect.$el!);
			this.effects[id] = [protect];
			protect.anim({
				opacity: .9,
				time: instant ? 0 : 400,
			}).anim({
				opacity: .4,
				time: instant ? 0 : 300,
			});
		}
	}

	removeEffect(id: ID, instant?: boolean) {
		if (id === 'formechange') this.removeTransform();
		if (id === 'substitute') this.animSubFade(instant);
		if (this.effects[id]) {
			for (const sprite of this.effects[id]) sprite.destroy();
			delete this.effects[id];
		}
	}
	clearEffects() {
		for (const id in this.effects) this.removeEffect(id as ID, true);
		this.animSubFade(true);
		this.removeTransform();
	}

	dogarsCheck(pokemon: Pokemon) {
		if (pokemon.side.isFar) return;

		if (pokemon.speciesForme === 'Koffing' && pokemon.name.match(/dogars/i)) {
			this.scene.setBgm(-1);
		} else if (this.scene.bgmNum === -1) {
			this.scene.rollBgm();
		}
	}

	// Statbar
	/////////////////////////////////////////////////////////////////////

	getClassForPosition(slot: number) {
		// DOUBLES: Slot0 -> left / Slot1 -> Right
		// TRIPLES: slot0 -> left / Slot1 -> Center / Slot2 -> Right
		const position = [
			' leftstatbar',
			this.scene.activeCount === 3 ? ' centerstatbar' : ' rightstatbar',
			' rightstatbar',
		];
		return position[slot];
	}

	getStatbarHTML(pokemon: Pokemon) {
		let buf = '<div class="statbar' + (this.isFrontSprite ? ' lstatbar' : ' rstatbar') + this.getClassForPosition(pokemon.slot) + '" style="display: none">';
		const ignoreNick = this.isFrontSprite && (this.scene.battle.ignoreOpponent || this.scene.battle.ignoreNicks);
		buf += `<strong>${BattleLog.escapeHTML(ignoreNick ? pokemon.speciesForme : pokemon.name)}`;
		const gender = pokemon.gender;
		if (gender === 'M' || gender === 'F') {
			buf += ` <img src="${Dex.fxPrefix}gender-${gender.toLowerCase()}.png" alt="${gender}" width="7" height="10" class="pixelated" />`;
		}
		buf += (pokemon.level === 100 ? `` : ` <small>L${pokemon.level}</small>`);

		let symbol = '';
		if (pokemon.speciesForme.indexOf('-Mega') >= 0) symbol = 'mega';
		else if (pokemon.speciesForme === 'Kyogre-Primal') symbol = 'alpha';
		else if (pokemon.speciesForme === 'Groudon-Primal') symbol = 'omega';
		if (symbol) {
			buf += ` <img src="${Dex.resourcePrefix}sprites/misc/${symbol}.png" alt="${symbol}" style="vertical-align:text-bottom;" />`;
		}
		if (pokemon.terastallized) {
			buf += ` <img src="${Dex.resourcePrefix}sprites/types/Tera${pokemon.terastallized}.png" alt="Tera-${pokemon.terastallized}" style="vertical-align:text-bottom;" height="16" width="16" />`;
		}

		buf += `</strong><div class="hpbar"><div class="hptext"></div><div class="hptextborder"></div><div class="prevhp"><div class="hp"></div></div><div class="status"></div>`;
		buf += `</div>`;
		return buf;
	}

	resetStatbar(pokemon: Pokemon, startHidden?: boolean) {
		if (this.$statbar) {
			this.$statbar.remove();
			this.$statbar = null as any; // workaround for TS thinking $statbar is still null after `updateStatbar`
		}
		this.updateStatbar(pokemon, true);
		if (!startHidden && this.$statbar) {
			this.$statbar.css({
				display: 'block',
				left: this.statbarLeft,
				top: this.statbarTop,
				opacity: 1,
			});
		}
	}

	updateStatbarIfExists(pokemon: Pokemon, updatePrevhp?: boolean, updateHp?: boolean) {
		if (this.$statbar) {
			this.updateStatbar(pokemon, updatePrevhp, updateHp);
		}
	}

	updateStatbar(pokemon: Pokemon, updatePrevhp?: boolean, updateHp?: boolean) {
		if (!this.scene.animating) return;
		if (!pokemon.isActive()) {
			if (this.$statbar) this.$statbar.hide();
			return;
		}
		if (!this.$statbar) {
			this.$statbar = $(this.getStatbarHTML(pokemon));
			this.scene.$stat.append(this.$statbar);
			updatePrevhp = true;
		}
		let hpcolor;
		if (updatePrevhp || updateHp) {
			hpcolor = BattleScene.getHPColor(pokemon);
			let w = pokemon.hpWidth(150);
			let $hp = this.$statbar.find('.hp');
			$hp.css({
				width: w,
				'border-right-width': (w ? 1 : 0),
			});
			if (hpcolor === 'g') $hp.removeClass('hp-yellow hp-red');
			else if (hpcolor === 'y') $hp.removeClass('hp-red').addClass('hp-yellow');
			else $hp.addClass('hp-yellow hp-red');
			this.updateHPText(pokemon);
		}
		if (updatePrevhp) {
			let $prevhp = this.$statbar.find('.prevhp');
			$prevhp.css('width', pokemon.hpWidth(150) + 1);
			if (hpcolor === 'g') $prevhp.removeClass('prevhp-yellow prevhp-red');
			else if (hpcolor === 'y') $prevhp.removeClass('prevhp-red').addClass('prevhp-yellow');
			else $prevhp.addClass('prevhp-yellow prevhp-red');
		}
		let status = '';
		if (pokemon.status === 'brn') {
			status += '<span class="brn">BRN</span> ';
		} else if (pokemon.status === 'psn') {
			status += '<span class="psn">PSN</span> ';
		} else if (pokemon.status === 'tox') {
			status += '<span class="psn">TOX</span> ';
		} else if (pokemon.status === 'slp') {
			status += '<span class="slp">SLP</span> ';
		} else if (pokemon.status === 'par') {
			status += '<span class="par">PAR</span> ';
		} else if (pokemon.status === 'frz') {
			status += '<span class="frz">FRZ</span> ';
		}
		if (pokemon.terastallized) {
			status += `<img src="${Dex.resourcePrefix}sprites/types/${encodeURIComponent(pokemon.terastallized)}.png" alt="${pokemon.terastallized}" class="pixelated" /> `;
		} else if (pokemon.volatiles.typechange && pokemon.volatiles.typechange[1]) {
			const types = pokemon.volatiles.typechange[1].split('/');
			for (const type of types) {
				status += '<img src="' + Dex.resourcePrefix + 'sprites/types/' + encodeURIComponent(type) + '.png" alt="' + type + '" class="pixelated" /> ';
			}
		}
		if (pokemon.volatiles.typeadd) {
			const type = pokemon.volatiles.typeadd[1];
			status += '+<img src="' + Dex.resourcePrefix + 'sprites/types/' + type + '.png" alt="' + type + '" class="pixelated" /> ';
		}
		for (const stat in pokemon.boosts) {
			if (pokemon.boosts[stat]) {
				status += '<span class="' + pokemon.getBoostType(stat as BoostStatName) + '">' + pokemon.getBoost(stat as BoostStatName) + '</span> ';
			}
		}

		for (let i in pokemon.volatiles) {
			status += PokemonSprite.getEffectTag(i);
		}
		for (let i in pokemon.turnstatuses) {
			if (i === 'roost' && !pokemon.getTypeList().includes('Flying')) continue;
			status += PokemonSprite.getEffectTag(i);
		}
		for (let i in pokemon.movestatuses) {
			status += PokemonSprite.getEffectTag(i);
		}
		let statusbar = this.$statbar.find('.status');
		statusbar.html(status);
	}

	private static getEffectTag(id: string) {
		let effect = PokemonSprite.statusTable[id];
		if (typeof effect === 'string') return effect;
		if (effect === null) return PokemonSprite.statusTable[id] = '';
		if (effect === undefined) {
			let label = `[[${id}]]`;
			if (Dex.species.get(id).exists) {
				label = Dex.species.get(id).name;
			} else if (Dex.items.get(id).exists) {
				label = Dex.items.get(id).name;
			} else if (Dex.moves.get(id).exists) {
				label = Dex.moves.get(id).name;
			} else if (Dex.abilities.get(id).exists) {
				label = Dex.abilities.get(id).name;
			}
			effect = [label, 'neutral'];
		}
		return PokemonSprite.statusTable[id] = `<span class="${effect[1]}">${effect[0].replace(/ /g, '&nbsp;')}</span> `;
	}

	updateHPText(pokemon: Pokemon) {
		if (!this.$statbar) return;
		let $hptext = this.$statbar.find('.hptext');
		let $hptextborder = this.$statbar.find('.hptextborder');
		if (pokemon.maxhp === 48 || this.scene.battle.hardcoreMode && pokemon.maxhp === 100) {
			$hptext.hide();
			$hptextborder.hide();
		} else if (this.scene.battle.hardcoreMode) {
			$hptext.html(pokemon.hp + '/');
			$hptext.show();
			$hptextborder.show();
		} else {
			$hptext.html(pokemon.hpWidth(100) + '%');
			$hptext.show();
			$hptextborder.show();
		}
	}
}

// par: -webkit-filter:  sepia(100%) hue-rotate(373deg) saturate(592%);
//      -webkit-filter:  sepia(100%) hue-rotate(22deg) saturate(820%) brightness(29%);
// psn: -webkit-filter:  sepia(100%) hue-rotate(618deg) saturate(285%);
// brn: -webkit-filter:  sepia(100%) hue-rotate(311deg) saturate(469%);
// slp: -webkit-filter:  grayscale(100%);
// frz: -webkit-filter:  sepia(100%) hue-rotate(154deg) saturate(759%) brightness(23%);

// @ts-ignore
Object.assign($.easing, {
	ballisticUp(x: number, t: number, b: number, c: number, d: number) {
		return -3 * x * x + 4 * x;
	},
	ballisticDown(x: number, t: number, b: number, c: number, d: number) {
		x = 1 - x;
		return 1 - (-3 * x * x + 4 * x);
	},
	quadUp(x: number, t: number, b: number, c: number, d: number) {
		x = 1 - x;
		return 1 - (x * x);
	},
	quadDown(x: number, t: number, b: number, c: number, d: number) {
		return x * x;
	},
});

interface AnimData {
	anim(scene: BattleScene, args: PokemonSprite[]): void;
	prepareAnim?(scene: BattleScene, args: PokemonSprite[]): void;
	residualAnim?(scene: BattleScene, args: PokemonSprite[]): void;
}
export type AnimTable = {[k: string]: AnimData};

const BattleEffects: {[k: string]: SpriteData} = {
	wisp: {
		url: 'wisp.png',
		w: 100, h: 100,
	},
	poisonwisp: {
		url: 'poisonwisp.png',
		w: 100, h: 100,
	},
	waterwisp: {
		url: 'waterwisp.png',
		w: 100, h: 100,
	},
	mudwisp: {
		url: 'mudwisp.png',
		w: 100, h: 100,
	},
	blackwisp: {
		url: 'blackwisp.png',
		w: 100, h: 100,
	},
	fireball: {
		url: 'fireball.png',
		w: 64, h: 64,
	},
	bluefireball: {
		url: 'bluefireball.png',
		w: 64, h: 64,
	},
	icicle: {
		url: 'icicle.png', // http://opengameart.org/content/icicle-spell
		w: 80, h: 60,
	},
	pinkicicle: {
		url: 'icicle-pink.png', // http://opengameart.org/content/icicle-spell, recolored by Kalalokki
		w: 80, h: 60,
	},
	lightning: {
		url: 'lightning.png', // by Pokemon Showdown user SailorCosmos
		w: 41, h: 229,
	},
	rocks: {
		url: 'rocks.png', // Pokemon Online - Gilad
		w: 100, h: 100,
	},
	rock1: {
		url: 'rock1.png', // Pokemon Online - Gilad
		w: 64, h: 80,
	},
	rock2: {
		url: 'rock2.png', // Pokemon Online - Gilad
		w: 66, h: 72,
	},
	rock3: {
		url: 'rock3.png', // by Pokemon Showdown user SailorCosmos
		w: 66, h: 72,
	},
	leaf1: {
		url: 'leaf1.png',
		w: 32, h: 26,
	},
	leaf2: {
		url: 'leaf2.png',
		w: 40, h: 26,
	},
	bone: {
		url: 'bone.png',
		w: 29, h: 29,
	},
	caltrop: {
		url: 'caltrop.png', // by Pokemon Showdown user SailorCosmos
		w: 80, h: 80,
	},
	greenmetal1: {
		url: 'greenmetal1.png', // by Pokemon Showdown user Kalalokki
		w: 45, h: 45,
	},
	greenmetal2: {
		url: 'greenmetal2.png', // by Pokemon Showdown user Kalalokki
		w: 45, h: 45,
	},
	poisoncaltrop: {
		url: 'poisoncaltrop.png', // by Pokemon Showdown user SailorCosmos
		w: 80, h: 80,
	},
	shadowball: {
		url: 'shadowball.png',
		w: 100, h: 100,
	},
	energyball: {
		url: 'energyball.png',
		w: 100, h: 100,
	},
	electroball: {
		url: 'electroball.png',
		w: 100, h: 100,
	},
	mistball: {
		url: 'mistball.png',
		w: 100, h: 100,
	},
	iceball: {
		url: 'iceball.png',
		w: 100, h: 100,
	},
	flareball: {
		url: 'flareball.png',
		w: 100, h: 100,
	},
	moon: {
		url: 'moon.png', // by Kalalokki
		w: 100, h: 100,
	},
	pokeball: {
		url: 'pokeball.png',
		w: 24, h: 24,
	},
	fist: {
		url: 'fist.png', // by Pokemon Showdown user SailorCosmos
		w: 55, h: 49,
	},
	fist1: {
		url: 'fist1.png',
		w: 49, h: 55,
	},
	foot: {
		url: 'foot.png', // by Pokemon Showdown user SailorCosmos
		w: 50, h: 75,
	},
	topbite: {
		url: 'topbite.png',
		w: 108, h: 64,
	},
	bottombite: {
		url: 'bottombite.png',
		w: 108, h: 64,
	},
	web: {
		url: 'web.png', // by Pokemon Showdown user SailorCosmos
		w: 120, h: 122,
	},
	leftclaw: {
		url: 'leftclaw.png',
		w: 44, h: 60,
	},
	rightclaw: {
		url: 'rightclaw.png',
		w: 44, h: 60,
	},
	leftslash: {
		url: 'leftslash.png', // by Pokemon Showdown user Modeling Clay
		w: 57, h: 56,
	},
	rightslash: {
		url: 'rightslash.png', // by Pokemon Showdown user Modeling Clay
		w: 57, h: 56,
	},
	leftchop: {
		url: 'leftchop.png', // by Pokemon Showdown user SailorCosmos
		w: 100, h: 130,
	},
	rightchop: {
		url: 'rightchop.png', // by Pokemon Showdown user SailorCosmos
		w: 100, h: 130,
	},
	angry: {
		url: 'angry.png', // by Pokemon Showdown user SailorCosmos
		w: 30, h: 30,
	},
	heart: {
		url: 'heart.png', // by Pokemon Showdown user SailorCosmos
		w: 30, h: 30,
	},
	pointer: {
		url: 'pointer.png', // by Pokemon Showdown user SailorCosmos
		w: 100, h: 100,
	},
	sword: {
		url: 'sword.png', // by Pokemon Showdown user SailorCosmos
		w: 48, h: 100,
	},
	impact: {
		url: 'impact.png', // by Pokemon Showdown user SailorCosmos
		w: 127, h: 119,
	},
	stare: {
		url: 'stare.png',
		w: 100, h: 35,
	},
	shine: {
		url: 'shine.png', // by Smogon user Jajoken
		w: 127, h: 119,
	},
	feather: {
		url: 'feather.png', // Ripped from http://www.clker.com/clipart-black-and-white-feather.html
		w: 100, h: 38,
	},
	shell: {
		url: 'shell.png', // by Smogon user Jajoken
		w: 100, h: 91.5,
	},
	petal: {
		url: 'petal.png', // by Smogon user Jajoken
		w: 60, h: 60,
	},
	gear: {
		url: 'gear.png', // by Smogon user Jajoken
		w: 100, h: 100,
	},
	alpha: {
		url: 'alpha.png', // Ripped from Pokemon Global Link
		w: 80, h: 80,
	},
	omega: {
		url: 'omega.png', // Ripped from Pokemon Global Link
		w: 80, h: 80,
	},
	rainbow: {
		url: 'rainbow.png',
		w: 128, h: 128,
	},
	zsymbol: {
		url: 'z-symbol.png', // From http://froggybutt.deviantart.com/art/Pokemon-Z-Move-symbol-633125033
		w: 150, h: 100,
	},
	ultra: {
		url: 'ultra.png', // by Pokemon Showdown user Modeling Clay
		w: 113, h: 165,
	},
	hitmark: {
		url: 'hitmarker.png', // by Pokemon Showdown user Ridaz
		w: 100, h: 100,
	},
	protect: {
		rawHTML: '<div class="turnstatus-protect" style="display:none;position:absolute" />',
		w: 100, h: 70,
	},
	auroraveil: {
		rawHTML: '<div class="sidecondition-auroraveil" style="display:none;position:absolute" />',
		w: 100, h: 50,
	},
	reflect: {
		rawHTML: '<div class="sidecondition-reflect" style="display:none;position:absolute" />',
		w: 100, h: 50,
	},
	safeguard: {
		rawHTML: '<div class="sidecondition-safeguard" style="display:none;position:absolute" />',
		w: 100, h: 50,
	},
	lightscreen: {
		rawHTML: '<div class="sidecondition-lightscreen" style="display:none;position:absolute" />',
		w: 100, h: 50,
	},
	mist: {
		rawHTML: '<div class="sidecondition-mist" style="display:none;position:absolute" />',
		w: 100, h: 50,
	},
};
(() => {
	if (!window.Dex || !Dex.resourcePrefix) return;
	for (const id in BattleEffects) {
		if (!BattleEffects[id].url) continue;
		BattleEffects[id].url = Dex.fxPrefix + BattleEffects[id].url;
	}
})();
const BattleBackdropsThree = [
	'bg-gen3.png',
	'bg-gen3-cave.png',
	'bg-gen3-ocean.png',
	'bg-gen3-sand.png',
	'bg-gen3-forest.png',
	'bg-gen3-arena.png',
];
const BattleBackdropsFour = [
	'bg-gen4.png',
	'bg-gen4-cave.png',
	'bg-gen4-snow.png',
	'bg-gen4-indoors.png',
	'bg-gen4-water.png',
];
const BattleBackdropsFive = [
	'bg-beach.png',
	'bg-beachshore.png',
	'bg-desert.png',
	'bg-meadow.png',
	'bg-thunderplains.png',
	'bg-city.png',
	'bg-earthycave.png',
	'bg-mountain.png',
	'bg-volcanocave.png',
	'bg-dampcave.png',
	'bg-forest.png',
	'bg-river.png',
	'bg-deepsea.png',
	'bg-icecave.png',
	'bg-route.png',
];
const BattleBackdrops = [
	'bg-aquacordetown.jpg',
	'bg-beach.jpg',
	'bg-city.jpg',
	'bg-dampcave.jpg',
	'bg-darkbeach.jpg',
	'bg-darkcity.jpg',
	'bg-darkmeadow.jpg',
	'bg-deepsea.jpg',
	'bg-desert.jpg',
	'bg-earthycave.jpg',
	'bg-elite4drake.jpg',
	'bg-forest.jpg',
	'bg-icecave.jpg',
	'bg-leaderwallace.jpg',
	'bg-library.jpg',
	'bg-meadow.jpg',
	'bg-orasdesert.jpg',
	'bg-orassea.jpg',
	'bg-skypillar.jpg',
];

export const BattleOtherAnims: AnimTable = {
	hitmark: {
		anim(scene, [attacker]) {
			scene.showEffect('hitmark', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
			}, {
				opacity: 0.5,
				time: 250,
			}, 'linear', 'fade');
		},
	},
	attack: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 1,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(40),
				scale: 1,
				opacity: 0.5,
			}, 'linear');
		},
	},
	contactattack: {
		anim(scene, [attacker, defender]) {
			attacker.anim({
				x: defender.x,
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 400,
			}, 'ballistic');
			attacker.anim({
				x: defender.x,
				y: defender.y + 5,
				z: defender.z,
				time: 100,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(450);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
			scene.wait(500);
		},
	},
	xattack: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 700,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 1000,
			}, 'linear');
			defender.delay(480);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 200,
			}, 'swing');
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 400,
			}, 'ballistic');
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 5,
				z: defender.z,
				time: 100,
			});
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 200,
			}, 'ballisticUp');
			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 5,
				z: defender.z,
				time: 100,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
		},
	},
	slashattack: {
		anim(scene, [attacker, defender]) {
			attacker.anim({
				x: defender.x,
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 400,
			}, 'ballistic');
			attacker.anim({
				x: defender.x,
				y: defender.y + 5,
				z: defender.z,
				time: 100,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(450);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');

			scene.showEffect('rightslash', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 500,
			}, {
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear', 'fade');
		},
	},
	clawattack: {
		anim(scene, [attacker, defender]) {
			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 400,
			}, 'ballistic');
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 5,
				z: defender.z,
				time: 100,
			});
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 200,
			}, 'ballisticUp');
			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 5,
				z: defender.z,
				time: 100,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(450);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 200,
			}, 'swing');
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');

			scene.showEffect('leftclaw', {
				x: defender.x - 20,
				y: defender.y + 20,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400,
			}, {
				x: defender.x - 20,
				y: defender.y + 20,
				z: defender.z,
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear', 'fade');
			scene.showEffect('leftclaw', {
				x: defender.x - 20,
				y: defender.y - 20,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400,
			}, {
				x: defender.x - 20,
				y: defender.y - 20,
				z: defender.z,
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear', 'fade');
			scene.showEffect('rightclaw', {
				x: defender.x + 20,
				y: defender.y + 20,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 700,
			}, {
				x: defender.x + 20,
				y: defender.y + 20,
				z: defender.z,
				scale: 3,
				opacity: 0,
				time: 1000,
			}, 'linear', 'fade');
			scene.showEffect('rightclaw', {
				x: defender.x + 20,
				y: defender.y - 20,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 700,
			}, {
				x: defender.x + 20,
				y: defender.y - 20,
				z: defender.z,
				scale: 3,
				opacity: 0,
				time: 1000,
			}, 'linear', 'fade');
		},
	},
	punchattack: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('fist', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 2,
				opacity: 0,
				time: 800,
			}, 'linear');
			attacker.anim({
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(-20),
				time: 400,
			}, 'ballistic2Under');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 50,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2');
			defender.delay(425);
			defender.anim({
				x: defender.leftof(-15),
				y: defender.y,
				z: defender.behind(15),
				time: 50,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	bite: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('topbite', {
				x: defender.x,
				y: defender.y + 50,
				z: defender.z,
				scale: 0.5,
				opacity: 0,
				time: 370,
			}, {
				x: defender.x,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 500,
			}, 'linear', 'fade');
			scene.showEffect('bottombite', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				scale: 0.5,
				opacity: 0,
				time: 370,
			}, {
				x: defender.x,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 500,
			}, 'linear', 'fade');
		},
	},
	kick: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('foot', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400,
			}, {
				x: defender.x,
				y: defender.y - 20,
				z: defender.behind(15),
				scale: 2,
				opacity: 0,
				time: 800,
			}, 'linear');
		},
	},
	fastattack: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 260,
			}, {
				scale: 2,
				opacity: 0,
				time: 560,
			}, 'linear');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 310,
			}, {
				scale: 2,
				opacity: 0,
				time: 610,
			}, 'linear');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 50,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(70),
				time: 350,
			}, 'accel', 'fade');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 100,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(70),
				time: 400,
			}, 'accel', 'fade');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(70),
				time: 300,
				opacity: 0.5,
			}, 'accel');
			attacker.anim({
				x: defender.x,
				y: defender.x,
				z: defender.behind(100),
				opacity: 0,
				time: 100,
			}, 'linear');
			attacker.anim({
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(70),
				opacity: 0,
				time: 1,
			}, 'linear');
			attacker.anim({
				opacity: 1,
				time: 500,
			}, 'decel');
			defender.delay(260);
			defender.anim({
				z: defender.behind(30),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	fastanimattack: {
		anim(scene, [attacker, defender]) {
			attacker.anim({
				z: attacker.behind(-70),
				time: 50,
				opacity: 1,
			}, 'decel');
			attacker.anim({
				opacity: 1,
				time: 150,
			}, 'accel');
			defender.anim({
				z: defender.behind(30),
				time: 70,
			}, 'decel');
			defender.anim({
				time: 170,
			}, 'accel');
		},
	},
	fastanimspecial: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.8,
				time: 0,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 100,
			}, 'decel');
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.8,
				time: 70,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 170,
			}, 'decel');
			defender.anim({
				z: defender.behind(30),
				time: 70,
			}, 'decel');
			defender.anim({
				time: 170,
			}, 'accel');
		},
	},
	fastanimself: {
		anim(scene, [attacker, defender]) {
			attacker.anim({
				scale: 1.5,
				time: 50,
			}, 'decel');
			attacker.anim({
				time: 170,
			}, 'accel');
		},
	},
	sneakattack: {
		anim(scene, [attacker, defender]) {
			attacker.anim({
				x: attacker.leftof(-20),
				y: attacker.y,
				z: attacker.behind(-20),
				opacity: 0,
				time: 200,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-120),
				opacity: 0,
				time: 1,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(40),
				opacity: 1,
				time: 250,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				opacity: 0,
				time: 300,
			}, 'linear');
			attacker.anim({
				opacity: 0,
				time: 1,
			}, 'linear');
			attacker.anim({
				time: 300,
				opacity: 1,
			}, 'linear');
			defender.delay(330);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	spinattack: {
		anim(scene, [attacker, defender]) {
			attacker.anim({
				x: defender.x,
				y: defender.y + 60,
				z: defender.behind(-30),
				time: 400,
			}, 'ballistic2');
			attacker.anim({
				x: defender.x,
				y: defender.y + 5,
				z: defender.z,
				time: 100,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2');
			defender.delay(450);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
			scene.wait(500);
		},
	},
	bound: {
		anim(scene, [attacker]) {
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y + 15,
				z: attacker.z,
				scale: 0.7,
				xscale: 2,
				opacity: 0.3,
				time: 0,
			}, {
				scale: 0.4,
				xscale: 1,
				opacity: 0.1,
				time: 500,
			}, 'decel', 'fade');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y - 5,
				z: attacker.z,
				scale: 0.7,
				xscale: 2,
				opacity: 0.3,
				time: 50,
			}, {
				scale: 0.4,
				xscale: 1,
				opacity: 0.1,
				time: 550,
			}, 'decel', 'fade');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y - 20,
				z: attacker.z,
				scale: 0.7,
				xscale: 2,
				opacity: 0.3,
				time: 100,
			}, {
				scale: 0.4,
				xscale: 1,
				opacity: 0.1,
				time: 600,
			}, 'decel', 'fade');
			attacker.anim({
				y: attacker.y + 15,
				z: attacker.behind(10),
				yscale: 1.3,
				time: 200,
			}, 'swing');
			attacker.anim({
				time: 200,
			}, 'swing');
			attacker.delay(25);
			attacker.anim({
				x: attacker.leftof(-10),
				y: attacker.y + 15,
				z: attacker.behind(5),
				yscale: 1.3,
				time: 200,
			}, 'swing');
			attacker.anim({
				time: 200,
			}, 'swing');
		},
	},
	selfstatus: {
		anim(scene, [attacker]) {
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.2,
				time: 0,
			}, {
				scale: 0,
				opacity: 1,
				time: 300,
			}, 'linear');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.2,
				time: 200,
			}, {
				scale: 0,
				opacity: 1,
				time: 500,
			}, 'linear');
		},
	},
	lightstatus: {
		anim(scene, [attacker]) {
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.1,
				time: 0,
			}, {
				scale: 0,
				opacity: 0.5,
				time: 600,
			}, 'linear');
		},
	},
	chargestatus: {
		anim(scene, [attacker]) {
			scene.showEffect('electroball', {
				x: attacker.x - 60,
				y: attacker.y + 40,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.7,
				time: 0,
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 0.2,
				opacity: 0.2,
				time: 300,
			}, 'linear', 'fade');
			scene.showEffect('electroball', {
				x: attacker.x + 60,
				y: attacker.y - 5,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.7,
				time: 100,
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 0.2,
				opacity: 0.2,
				time: 300,
			}, 'linear', 'fade');
			scene.showEffect('electroball', {
				x: attacker.x - 30,
				y: attacker.y + 60,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.7,
				time: 100,
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 0.2,
				opacity: 0.2,
				time: 400,
			}, 'linear', 'fade');
			scene.showEffect('electroball', {
				x: attacker.x + 20,
				y: attacker.y - 50,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.7,
				time: 100,
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 0.2,
				opacity: 0.2,
				time: 400,
			}, 'linear', 'fade');
			scene.showEffect('electroball', {
				x: attacker.x - 70,
				y: attacker.y - 50,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.7,
				time: 200,
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 0.2,
				opacity: 0.2,
				time: 500,
			}, 'linear', 'fade');
		},
	},
	heal: {
		anim(scene, [attacker]) {
			scene.showEffect('iceball', {
				x: attacker.x + 30,
				y: attacker.y + 5,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.7,
				time: 200,
			}, {
				x: attacker.x + 40,
				y: attacker.y + 10,
				opacity: 0,
				time: 600,
			}, 'accel');
			scene.showEffect('iceball', {
				x: attacker.x - 30,
				y: attacker.y - 10,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.7,
				time: 300,
			}, {
				x: attacker.x - 40,
				y: attacker.y - 20,
				opacity: 0,
				time: 700,
			}, 'accel');
			scene.showEffect('iceball', {
				x: attacker.x + 15,
				y: attacker.y + 10,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.7,
				time: 400,
			}, {
				x: attacker.x + 25,
				y: attacker.y + 20,
				opacity: 0,
				time: 800,
			}, 'accel');
			scene.showEffect('iceball', {
				x: attacker.x - 15,
				y: attacker.y - 30,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.7,
				time: 500,
			}, {
				x: attacker.x - 25,
				y: attacker.y - 40,
				opacity: 0,
				time: 900,
			}, 'accel');
		},
	},
	shiny: {
		anim(scene, [attacker]) {
			scene.backgroundEffect('#000000', 800, 0.3, 100);
			scene.showEffect('shine', {
				x: attacker.x + 5,
				y: attacker.y + 20,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.7,
				time: 450,
			}, {
				y: attacker.y + 35,
				opacity: 0,
				time: 675,
			}, 'decel');
			scene.showEffect('shine', {
				x: attacker.x + 15,
				y: attacker.y + 20,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.7,
				time: 475,
			}, {
				x: attacker.x + 25,
				y: attacker.y + 30,
				opacity: 0,
				time: 700,
			}, 'decel');
			scene.showEffect('shine', {
				x: attacker.x - 15,
				y: attacker.y + 20,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.7,
				time: 500,
			}, {
				x: attacker.x - 25,
				y: attacker.y + 30,
				opacity: 0,
				time: 725,
			}, 'decel');
			scene.showEffect('shine', {
				x: attacker.x - 20,
				y: attacker.y + 5,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.7,
				time: 550,
			}, {
				x: attacker.x - 30,
				y: attacker.y - 5,
				opacity: 0,
				time: 775,
			}, 'decel');
			scene.showEffect('shine', {
				x: attacker.x + 15,
				y: attacker.y + 10,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.7,
				time: 650,
			}, {
				x: attacker.x + 35,
				y: attacker.y - 5,
				opacity: 0,
				time: 875,
			}, 'decel');
			scene.showEffect('shine', {
				x: attacker.x + 5,
				y: attacker.y - 5,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.7,
				time: 675,
			}, {
				y: attacker.y - 20,
				opacity: 0,
				time: 900,
			}, 'decel');
		},
	},
	flight: {
		anim(scene, [attacker, defender]) {
			attacker.anim({
				x: attacker.leftof(-200),
				y: attacker.y + 80,
				z: attacker.z,
				opacity: 0,
				time: 350,
			}, 'accel');
			attacker.anim({
				x: defender.leftof(-200),
				y: defender.y + 80,
				z: defender.z,
				time: 1,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 1,
				time: 350,
			}, 'accel');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 700,
			}, {
				scale: 2,
				opacity: 0,
				time: 900,
			}, 'linear');
			attacker.anim({
				x: defender.leftof(100),
				y: defender.y - 40,
				z: defender.z,
				opacity: 0,
				time: 175,
			});
			attacker.anim({
				x: attacker.x,
				y: attacker.y + 40,
				z: attacker.behind(40),
				time: 1,
			});
			attacker.anim({
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 250,
			}, 'decel');
			defender.delay(700);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	shake: {
		anim(scene, [attacker]) {
			attacker.anim({x: attacker.x - 10, time: 200});
			attacker.anim({x: attacker.x + 10, time: 300});
			attacker.anim({x: attacker.x, time: 200});
		},
	},
	dance: {
		anim(scene, [attacker]) {
			attacker.anim({x: attacker.x - 10});
			attacker.anim({x: attacker.x + 10});
			attacker.anim({x: attacker.x});
		},
	},
	consume: {
		anim(scene, [defender]) {
			scene.showEffect('wisp', {
				x: defender.leftof(-25),
				y: defender.y + 40,
				z: defender.behind(-20),
				scale: 0.5,
				opacity: 1,
			}, {
				x: defender.leftof(-15),
				y: defender.y + 35,
				z: defender.z,
				scale: 0,
				opacity: 0.2,
				time: 500,
			}, 'swing', 'fade');

			defender.delay(400);
			defender.anim({
				y: defender.y + 5,
				yscale: 1.1,
				time: 200,
			}, 'swing');
			defender.anim({
				time: 200,
			}, 'swing');
			defender.anim({
				y: defender.y + 5,
				yscale: 1.1,
				time: 200,
			}, 'swing');
			defender.anim({
				time: 200,
			}, 'swing');
		},
	},
	leech: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('energyball', {
				x: defender.x - 30,
				y: defender.y - 40,
				z: defender.z,
				scale: 0.2,
				opacity: 0.7,
				time: 0,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 500,
				opacity: 0.1,
			}, 'ballistic2', 'fade');
			scene.showEffect('energyball', {
				x: defender.x + 40,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.2,
				opacity: 0.7,
				time: 50,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 550,
				opacity: 0.1,
			}, 'linear', 'fade');
			scene.showEffect('energyball', {
				x: defender.x + 20,
				y: defender.y - 25,
				z: defender.z,
				scale: 0.2,
				opacity: 0.7,
				time: 100,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 600,
				opacity: 0.1,
			}, 'ballistic2Under', 'fade');
		},
	},
	drain: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 0,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 500,
				opacity: 0,
			}, 'ballistic2');
			scene.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 50,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 550,
				opacity: 0,
			}, 'linear');
			scene.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 100,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 600,
				opacity: 0,
			}, 'ballistic2Under');
		},
	},
	hydroshot: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
			}, {
				x: defender.x + 10,
				y: defender.y + 5,
				z: defender.behind(30),
				scale: 1,
				opacity: 0.6,
			}, 'decel', 'explode');
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
				time: 75,
			}, {
				x: defender.x - 10,
				y: defender.y - 5,
				z: defender.behind(30),
				scale: 1,
				opacity: 0.6,
			}, 'decel', 'explode');
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
				time: 150,
			}, {
				x: defender.x,
				y: defender.y + 5,
				z: defender.behind(30),
				scale: 1,
				opacity: 0.6,
			}, 'decel', 'explode');
		},
	},
	sound: {
		anim(scene, [attacker]) {
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.7,
				time: 0,
			}, {
				z: attacker.behind(-50),
				scale: 5,
				opacity: 0,
				time: 400,
			}, 'linear');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.7,
				time: 150,
			}, {
				z: attacker.behind(-50),
				scale: 5,
				opacity: 0,
				time: 600,
			}, 'linear');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.7,
				time: 300,
			}, {
				z: attacker.behind(-50),
				scale: 5,
				opacity: 0,
				time: 800,
			}, 'linear');
		},
	},
	gravity: {
		anim(scene, [attacker]) {
			attacker.anim({
				y: attacker.y - 20,
				yscale: 0.5,
				time: 300,
			}, 'decel');
			attacker.delay(200);
			attacker.anim({
				time: 300,
			});
		},
	},
	futuresighthit: {
		anim(scene, [defender]) {
			scene.backgroundEffect('#AA44BB', 250, 0.6);
			scene.backgroundEffect('#AA44FF', 250, 0.6, 400);
			defender.anim({
				scale: 1.2,
				time: 100,
			});
			defender.anim({
				scale: 1,
				time: 100,
			});
			defender.anim({
				scale: 1.4,
				time: 150,
			});
			defender.anim({
				scale: 1,
				time: 150,
			});
			scene.wait(700);
		},
	},
	doomdesirehit: {
		anim(scene, [defender]) {
			scene.backgroundEffect('#ffffff', 600, 0.6);
			scene.showEffect('fireball', {
				x: defender.x + 40,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
			}, {
				scale: 6,
				opacity: 0,
			}, 'linear');
			scene.showEffect('fireball', {
				x: defender.x - 40,
				y: defender.y - 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 150,
			}, {
				scale: 6,
				opacity: 0,
			}, 'linear');
			scene.showEffect('fireball', {
				x: defender.x + 10,
				y: defender.y + 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 300,
			}, {
				scale: 6,
				opacity: 0,
			}, 'linear');

			defender.delay(100);
			defender.anim({
				x: defender.x - 30,
				time: 75,
			});
			defender.anim({
				x: defender.x + 30,
				time: 100,
			});
			defender.anim({
				x: defender.x - 30,
				time: 100,
			});
			defender.anim({
				x: defender.x + 30,
				time: 100,
			});
			defender.anim({
				x: defender.x,
				time: 100,
			});
		},
	},
	itemoff: {
		anim(scene, [defender]) {
			scene.showEffect('pokeball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
			}, {
				x: defender.x,
				y: defender.y + 40,
				z: defender.behind(70),
				opacity: 0,
				time: 400,
			}, 'ballistic2');
		},
	},
	anger: {
		anim(scene, [attacker]) {
			scene.showEffect('angry', {
				x: attacker.x + 20,
				y: attacker.y + 20,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 0,
			}, {
				scale: 1,
				opacity: 1,
				time: 300,
			}, 'ballistic2Under', 'fade');
			scene.showEffect('angry', {
				x: attacker.x - 20,
				y: attacker.y + 10,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 100,
			}, {
				scale: 1,
				opacity: 1,
				time: 400,
			}, 'ballistic2Under', 'fade');
			scene.showEffect('angry', {
				x: attacker.x,
				y: attacker.y + 40,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 200,
			}, {
				scale: 1,
				opacity: 1,
				time: 500,
			}, 'ballistic2Under', 'fade');
		},
	},
	bidecharge: {
		anim(scene, [attacker]) {
			scene.showEffect('wisp', {
				x: attacker.x + 30,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
				time: 0,
			}, {
				y: attacker.y + 60,
				opacity: 0.2,
				time: 400,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: attacker.x - 30,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
				time: 100,
			}, {
				y: attacker.y + 60,
				opacity: 0.2,
				time: 500,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: attacker.x + 15,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
				time: 200,
			}, {
				y: attacker.y + 60,
				opacity: 0.2,
				time: 600,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: attacker.x - 15,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
				time: 300,
			}, {
				y: attacker.y + 60,
				opacity: 0.2,
				time: 700,
			}, 'linear', 'fade');

			attacker.anim({
				x: attacker.x - 2.5,
				time: 75,
			}, 'swing');
			attacker.anim({
				x: attacker.x + 2.5,
				time: 75,
			}, 'swing');
			attacker.anim({
				x: attacker.x - 2.5,
				time: 75,
			}, 'swing');
			attacker.anim({
				x: attacker.x + 2.5,
				time: 75,
			}, 'swing');
			attacker.anim({
				x: attacker.x - 2.5,
				time: 75,
			}, 'swing');
			attacker.anim({
				time: 100,
			}, 'accel');
		},
	},
	bideunleash: {
		anim(scene, [attacker]) {
			scene.showEffect('fireball', {
				x: attacker.x + 40,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.6,
			}, {
				scale: 6,
				opacity: 0,
			}, 'linear');
			scene.showEffect('fireball', {
				x: attacker.x - 40,
				y: attacker.y - 20,
				z: attacker.z,
				scale: 0,
				opacity: 0.6,
				time: 150,
			}, {
				scale: 6,
				opacity: 0,
			}, 'linear');
			scene.showEffect('fireball', {
				x: attacker.x + 10,
				y: attacker.y + 20,
				z: attacker.z,
				scale: 0,
				opacity: 0.6,
				time: 300,
			}, {
				scale: 6,
				opacity: 0,
			}, 'linear');

			attacker.anim({
				x: attacker.x - 30,
				time: 75,
			});
			attacker.anim({
				x: attacker.x + 30,
				time: 100,
			});
			attacker.anim({
				x: attacker.x - 30,
				time: 100,
			});
			attacker.anim({
				x: attacker.x + 30,
				time: 100,
			});
			attacker.anim({
				x: attacker.x - 30,
				time: 100,
			});
			attacker.anim({
				x: attacker.x + 30,
				time: 100,
			});
			attacker.anim({
				x: attacker.x,
				time: 100,
			});
		},
	},
	spectralthiefboost: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('linear-gradient(#000000 30%, #440044', 1400, 0.5);
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.5,
				xscale: 0.5,
				yscale: 1,
				opacity: 0.5,
			}, {
				scale: 2,
				xscale: 4,
				opacity: 0.1,
				time: 400,
			}, 'decel', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y - 25,
				z: defender.z,
				scale: 1,
			}, {
				x: defender.x + 50,
				scale: 3,
				xscale: 3.5,
				opacity: 0.3,
				time: 500,
			}, 'linear', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y - 25,
				z: defender.z,
				scale: 1,
			}, {
				x: defender.x - 50,
				scale: 3,
				xscale: 3.5,
				opacity: 0.3,
				time: 500,
			}, 'linear', 'fade');
			scene.showEffect('shadowball', {
				x: defender.x + 35,
				y: defender.y,
				z: defender.z,
				opacity: 0.4,
				scale: 0.25,
				time: 50,
			}, {
				y: defender.y - 40,
				opacity: 0,
				time: 300,
			}, 'accel');
			scene.showEffect('shadowball', {
				x: defender.x - 35,
				y: defender.y,
				z: defender.z,
				opacity: 0.4,
				scale: 0.25,
				time: 100,
			}, {
				y: defender.y - 40,
				opacity: 0,
				time: 350,
			}, 'accel');
			scene.showEffect('shadowball', {
				x: defender.x + 15,
				y: defender.y,
				z: defender.z,
				opacity: 0.4,
				scale: 0.5,
				time: 150,
			}, {
				y: defender.y - 40,
				opacity: 0,
				time: 400,
			}, 'accel');
			scene.showEffect('shadowball', {
				x: defender.x + 15,
				y: defender.y,
				z: defender.z,
				opacity: 0.4,
				scale: 0.25,
				time: 200,
			}, {
				y: defender.y - 40,
				opacity: 0,
				time: 450,
			}, 'accel');

			scene.showEffect('poisonwisp', {
				x: defender.x - 50,
				y: defender.y - 40,
				z: defender.z,
				scale: 2,
				opacity: 0.3,
				time: 300,
			}, {
				x: attacker.x - 50,
				y: attacker.y - 40,
				z: attacker.z,
				time: 900,
			}, 'decel', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x - 50,
				y: defender.y - 40,
				z: defender.z,
				scale: 2,
				opacity: 0.3,
				time: 400,
			}, {
				x: attacker.x - 50,
				y: attacker.y - 40,
				z: attacker.z,
				time: 900,
			}, 'decel', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y - 40,
				z: defender.z,
				scale: 2,
				opacity: 0.3,
				time: 450,
			}, {
				x: attacker.x,
				y: attacker.y - 40,
				z: attacker.z,
				time: 950,
			}, 'decel', 'fade');

			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y - 30,
				z: attacker.z,
				scale: 0,
				xscale: 0.5,
				yscale: 1,
				opacity: 0.5,
				time: 750,
			}, {
				scale: 2,
				xscale: 4,
				opacity: 0.1,
				time: 1200,
			}, 'decel', 'fade');

			scene.showEffect('shadowball', {
				x: attacker.x + 35,
				y: attacker.y - 40,
				z: attacker.z,
				opacity: 0.4,
				scale: 0.25,
				time: 750,
			}, {
				y: attacker.y,
				opacity: 0,
				time: 1000,
			}, 'decel');
			scene.showEffect('shadowball', {
				x: attacker.x - 35,
				y: attacker.y - 40,
				z: attacker.z,
				opacity: 1,
				scale: 0.25,
				time: 800,
			}, {
				y: attacker.y,
				opacity: 0,
				time: 1150,
			}, 'decel');
			scene.showEffect('shadowball', {
				x: attacker.x + 15,
				y: attacker.y - 40,
				z: attacker.z,
				opacity: 1,
				scale: 0.25,
				time: 950,
			}, {
				y: attacker.y,
				opacity: 0,
				time: 1200,
			}, 'decel');
			scene.showEffect('shadowball', {
				x: attacker.x + 15,
				y: attacker.y - 40,
				z: attacker.z,
				opacity: 1,
				scale: 0.25,
				time: 1000,
			}, {
				y: attacker.y,
				opacity: 0,
				time: 1350,
			}, 'decel');

			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 2,
				opacity: 1,
				time: 750,
			}, {
				x: attacker.x + 75,
				opacity: 0.3,
				time: 1200,
			}, 'linear', 'fade');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 2,
				opacity: 1,
				time: 750,
			}, {
				x: attacker.x - 75,
				opacity: 0.3,
				time: 1200,
			}, 'linear', 'fade');

			defender.anim({
				x: defender.x - 15,
				time: 75,
			});
			defender.anim({
				x: defender.x + 15,
				time: 100,
			});
			defender.anim({
				x: defender.x - 15,
				time: 100,
			});
			defender.anim({
				x: defender.x + 15,
				time: 100,
			});
			defender.anim({
				x: defender.x - 15,
				time: 100,
			});
			defender.anim({
				x: defender.x + 15,
				time: 100,
			});
			defender.anim({
				x: defender.x,
				time: 100,
			});
		},
	},
	schoolingin: {
		anim(scene, [attacker]) {
			scene.backgroundEffect('#0000DD', 600, 0.2);
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2.5,
				opacity: 1,
			}, {
				scale: 3,
				time: 600,
			}, 'linear', 'explode');
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 3,
				opacity: 0.3,
			}, {
				scale: 3.25,
				time: 600,
			}, 'linear', 'explode');

			scene.showEffect('iceball', {
				x: attacker.leftof(200),
				y: attacker.y + 40,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0,
				time: 200,
			}, 'ballistic', 'fade');
			scene.showEffect('iceball', {
				x: attacker.leftof(-140),
				y: attacker.y - 60,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 100,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0,
				time: 300,
			}, 'ballistic2Under', 'fade');
			scene.showEffect('iceball', {
				x: attacker.leftof(-140),
				y: attacker.y + 50,
				z: attacker.behind(170),
				scale: 0.5,
				opacity: 0.5,
				time: 200,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0,
				time: 400,
			}, 'ballistic2', 'fade');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y + 30,
				z: attacker.behind(-250),
				scale: 0.5,
				opacity: 0.5,
				time: 200,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0,
				time: 500,
			}, 'ballistic', 'fade');
			scene.showEffect('iceball', {
				x: attacker.leftof(240),
				y: attacker.y - 80,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 300,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0,
				time: 600,
			}, 'ballistic2Under');
		},
	},
	schoolingout: {
		anim(scene, [attacker]) {
			scene.backgroundEffect('#0000DD', 600, 0.2);
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 3,
				opacity: 1,
			}, {
				scale: 2,
				time: 600,
			}, 'linear', 'explode');
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 3.25,
				opacity: 0.3,
			}, {
				scale: 2.5,
				time: 600,
			}, 'linear', 'explode');

			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
			}, {
				x: attacker.leftof(200),
				y: attacker.y + 40,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 200,
			}, 'ballistic', 'fade');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 100,
			}, {
				x: attacker.leftof(-140),
				y: attacker.y - 60,
				z: attacker.z,
				opacity: 0.5,
				time: 300,
			}, 'ballistic2Under', 'fade');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 200,
			}, {
				x: attacker.leftof(-140),
				y: attacker.y + 50,
				z: attacker.behind(170),
				opacity: 0.5,
				time: 400,
			}, 'ballistic2', 'fade');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 200,
			}, {
				x: attacker.x,
				y: attacker.y + 30,
				z: attacker.behind(-250),
				opacity: 0.5,
				time: 500,
			}, 'ballistic', 'fade');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 300,
			}, {
				x: attacker.leftof(240),
				y: attacker.y - 80,
				z: attacker.z,
				opacity: 0.5,
				time: 600,
			}, 'ballistic2Under');
		},
	},
	primalalpha: {
		anim(scene, [attacker]) {
			scene.backgroundEffect('#0000DD', 500, 0.4);
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.2,
				time: 0,
			}, {
				scale: 0.5,
				opacity: 1,
				time: 300,
			}, 'linear', 'fade');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 300,
			}, {
				scale: 4,
				opacity: 0,
				time: 700,
			}, 'linear', 'fade');
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 300,
			}, {
				scale: 5,
				opacity: 0,
				time: 600,
			}, 'linear', 'fade');
			scene.showEffect('alpha', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 300,
			}, {
				scale: 2.5,
				opacity: 0,
				time: 600,
			}, 'decel');
		},
	},
	primalomega: {
		anim(scene, [attacker]) {
			scene.backgroundEffect('linear-gradient(#390000 30%, #B84038)', 500, 0.4);
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.2,
				time: 0,
			}, {
				scale: 0.5,
				opacity: 1,
				time: 300,
			}, 'linear', 'fade');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 300,
			}, {
				scale: 4,
				opacity: 0,
				time: 700,
			}, 'linear', 'fade');
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 300,
			}, {
				scale: 5,
				opacity: 0,
				time: 600,
			}, 'linear', 'fade');
			scene.showEffect('omega', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 300,
			}, {
				scale: 2.5,
				opacity: 0,
				time: 600,
			}, 'decel');
		},
	},
	megaevo: {
		anim(scene, [attacker]) {
			scene.backgroundEffect('#835BA5', 500, 0.6);
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.2,
				time: 0,
			}, {
				scale: 0.5,
				opacity: 1,
				time: 300,
			}, 'linear', 'fade');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 300,
			}, {
				scale: 4,
				opacity: 0,
				time: 700,
			}, 'linear', 'fade');
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 300,
			}, {
				scale: 5,
				opacity: 0,
				time: 600,
			}, 'linear', 'fade');
			scene.showEffect('rainbow', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 300,
			}, {
				scale: 5,
				opacity: 0,
				time: 600,
			}, 'linear', 'fade');
		},
	},
	zpower: {
		anim(scene, [attacker]) {
			scene.backgroundEffect('linear-gradient(#000000 20%, #0000DD)', 1800, 0.4);
			scene.showEffect('electroball', {
				x: attacker.x - 60,
				y: attacker.y + 40,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.7,
				time: 0,
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 0.2,
				opacity: 0.2,
				time: 300,
			}, 'linear', 'fade');
			scene.showEffect('electroball', {
				x: attacker.x + 60,
				y: attacker.y - 5,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.7,
				time: 100,
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 0.2,
				opacity: 0.2,
				time: 300,
			}, 'linear', 'fade');
			scene.showEffect('electroball', {
				x: attacker.x - 30,
				y: attacker.y + 60,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.7,
				time: 100,
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 0.2,
				opacity: 0.2,
				time: 400,
			}, 'linear', 'fade');
			scene.showEffect('electroball', {
				x: attacker.x + 20,
				y: attacker.y - 50,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.7,
				time: 100,
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 0.2,
				opacity: 0.2,
				time: 400,
			}, 'linear', 'fade');
			scene.showEffect('electroball', {
				x: attacker.x - 70,
				y: attacker.y - 50,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.7,
				time: 200,
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 0.2,
				opacity: 0.2,
				time: 500,
			}, 'linear', 'fade');
			scene.showEffect('zsymbol', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.7,
				opacity: 1,
				time: 500,
			}, {
				scale: 1,
				opacity: 0.5,
				time: 800,
			}, 'decel', 'explode');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 800,
			}, {
				y: attacker.y + 20,
				scale: 2,
				opacity: 0,
				time: 1200,
			}, 'accel');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 1000,
			}, {
				y: attacker.y + 20,
				scale: 2,
				opacity: 0,
				time: 1400,
			}, 'accel');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 1200,
			}, {
				y: attacker.y + 20,
				scale: 2,
				opacity: 0,
				time: 1600,
			}, 'accel');
		},
	},
	powerconstruct: {
		anim(scene, [attacker]) {
			let xf = [1, -1, 1, -1];
			let yf = [1, -1, -1, 1];
			let xf2 = [1, 0, -1, 0];
			let yf2 = [0, 1, 0, -1];

			scene.backgroundEffect('#000000', 1000, 0.7);
			for (let i = 0; i < 4; i++) {
				scene.showEffect('energyball', {
					x: attacker.x + 150 * xf[i],
					y: attacker.y - 50,
					z: attacker.z + 70 * yf[i],
					scale: 0.1,
					xscale: 0.5,
					opacity: 0.4,
				}, {
					x: attacker.x,
					y: attacker.y - 50,
					z: attacker.z,
					scale: 0.3,
					xscale: 0.8,
					opacity: 0,
					time: 500,
				}, 'decel', 'fade');
				scene.showEffect('energyball', {
					x: attacker.x + 200 * xf2[i],
					y: attacker.y - 50,
					z: attacker.z + 90 * yf2[i],
					scale: 0.1,
					xscale: 0.5,
					opacity: 0.4,
				}, {
					x: attacker.x,
					y: attacker.y - 50,
					z: attacker.z,
					scale: 0.3,
					xscale: 0.8,
					opacity: 0,
					time: 500,
				}, 'decel', 'fade');

				scene.showEffect('energyball', {
					x: attacker.x + 50 * xf[i],
					y: attacker.y - 50,
					z: attacker.z + 100 * yf[i],
					scale: 0.1,
					xscale: 0.5,
					opacity: 0.4,
					time: 200,
				}, {
					x: attacker.x,
					y: attacker.y - 50,
					z: attacker.z,
					scale: 0.3,
					xscale: 0.8,
					opacity: 0,
					time: 500,
				}, 'decel', 'fade');
				scene.showEffect('energyball', {
					x: attacker.x + 100 * xf2[i],
					y: attacker.y - 50,
					z: attacker.z + 90 * yf2[i],
					scale: 0.1,
					xscale: 0.5,
					opacity: 0.4,
					time: 200,
				}, {
					x: attacker.x,
					y: attacker.y - 50,
					z: attacker.z,
					scale: 0.3,
					xscale: 0.8,
					opacity: 0,
					time: 500,
				}, 'decel', 'fade');
			}
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 3,
				opacity: 0,
				time: 50,
			}, {
				scale: 1,
				opacity: 0.8,
				time: 300,
			}, 'linear', 'fade');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 3.5,
				opacity: 0,
				time: 150,
			}, {
				scale: 1.5,
				opacity: 1,
				time: 350,
			}, 'linear', 'fade');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 200,
			}, {
				scale: 3,
				opacity: 0,
				time: 600,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 1,
				opacity: 0.6,
				time: 100,
			}, {
				scale: 3.5,
				opacity: 0.8,
				time: 500,
			}, 'linear', 'explode');
		},
	},
	ultraburst: {
		anim(scene, [attacker]) {
			scene.backgroundEffect('#000000', 600, 0.5);
			scene.backgroundEffect('#ffffff', 500, 1, 550);
			scene.showEffect('wisp', {
				x: attacker.x - 60,
				y: attacker.y + 40,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.7,
				time: 0,
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 0.2,
				opacity: 0.2,
				time: 150,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: attacker.x + 60,
				y: attacker.y - 5,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.7,
				time: 100,
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 0.2,
				opacity: 0.2,
				time: 150,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: attacker.x - 30,
				y: attacker.y + 60,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.7,
				time: 100,
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 0.2,
				opacity: 0.2,
				time: 250,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: attacker.x + 20,
				y: attacker.y - 50,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.7,
				time: 100,
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 0.2,
				opacity: 0.2,
				time: 250,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: attacker.x - 70,
				y: attacker.y - 50,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.7,
				time: 100,
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 0.2,
				opacity: 0.2,
				time: 300,
			}, 'linear', 'fade');

			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.5,
				opacity: 1,
			}, {
				scale: 4,
				time: 600,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0,
			}, {
				scale: 2.25,
				opacity: 0.1,
				time: 600,
			}, 'linear', 'explode');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0,
				time: 200,
			}, {
				scale: 2.25,
				opacity: 0.1,
				time: 600,
			}, 'linear', 'explode');

			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 6,
				opacity: 0.2,
			}, {
				scale: 1,
				opacity: 0,
				time: 300,
			}, 'linear');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 6,
				opacity: 0.2,
				time: 150,
			}, {
				scale: 1,
				opacity: 0,
				time: 450,
			}, 'linear');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 6,
				opacity: 0.2,
				time: 300,
			}, {
				scale: 1,
				opacity: 0,
				time: 600,
			}, 'linear');
			scene.showEffect('ultra', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 600,
			}, {
				scale: 1,
				opacity: 0,
				time: 900,
			}, 'decel');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y - 60,
				z: attacker.z,
				scale: 0.5,
				xscale: 0.25,
				yscale: 0,
				opacity: 0.5,
				time: 600,
			}, {
				scale: 2,
				xscale: 6,
				yscale: 1,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y - 60,
				z: attacker.z,
				scale: 0.5,
				xscale: 0.25,
				yscale: 0.75,
				opacity: 0.5,
				time: 800,
			}, {
				scale: 2,
				xscale: 6,
				opacity: 0.1,
				time: 1000,
			}, 'linear');
		},
	},
};
export const BattleStatusAnims: AnimTable = {
	brn: {
		anim(scene, [attacker]) {
			scene.showEffect('fireball', {
				x: attacker.x - 20,
				y: attacker.y - 15,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.3,
			}, {
				x: attacker.x + 40,
				y: attacker.y + 15,
				z: attacker.z,
				scale: 1,
				opacity: 1,
				time: 300,
			}, 'swing', 'fade');
		},
	},
	psn: {
		anim(scene, [attacker]) {
			scene.showEffect('poisonwisp', {
				x: attacker.x + 30,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 0,
			}, {
				y: attacker.y,
				scale: 1,
				opacity: 0.5,
				time: 300,
			}, 'decel', 'fade');
			scene.showEffect('poisonwisp', {
				x: attacker.x - 30,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 100,
			}, {
				y: attacker.y,
				scale: 1,
				opacity: 0.5,
				time: 400,
			}, 'decel', 'fade');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 200,
			}, {
				y: attacker.y,
				scale: 1,
				opacity: 0.5,
				time: 500,
			}, 'decel', 'fade');
		},
	},
	slp: {
		anim(scene, [attacker]) {
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y + 20,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.1,
			}, {
				x: attacker.x,
				y: attacker.y + 20,
				z: attacker.behind(-50),
				scale: 1.5,
				opacity: 1,
				time: 400,
			}, 'ballistic2Under', 'fade');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y + 20,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.1,
				time: 200,
			}, {
				x: attacker.x,
				y: attacker.y + 20,
				z: attacker.behind(-50),
				scale: 1.5,
				opacity: 1,
				time: 600,
			}, 'ballistic2Under', 'fade');
		},
	},
	par: {
		anim(scene, [attacker]) {
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.5,
				opacity: 0.2,
			}, {
				scale: 2,
				opacity: 0.1,
				time: 300,
			}, 'linear', 'fade');

			attacker.delay(100);
			attacker.anim({
				x: attacker.x - 1,
				time: 75,
			}, 'swing');
			attacker.anim({
				x: attacker.x + 1,
				time: 75,
			}, 'swing');
			attacker.anim({
				x: attacker.x - 1,
				time: 75,
			}, 'swing');
			attacker.anim({
				x: attacker.x + 1,
				time: 75,
			}, 'swing');
			attacker.anim({
				x: attacker.x - 1,
				time: 75,
			}, 'swing');
			attacker.anim({
				time: 100,
			}, 'accel');
		},
	},
	frz: {
		anim(scene, [attacker]) {
			scene.showEffect('icicle', {
				x: attacker.x - 30,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 200,
			}, {
				scale: 0.9,
				opacity: 0,
				time: 600,
			}, 'linear', 'fade');
			scene.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y - 30,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 300,
			}, {
				scale: 0.9,
				opacity: 0,
				time: 650,
			}, 'linear', 'fade');
			scene.showEffect('icicle', {
				x: attacker.x + 15,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 400,
			}, {
				scale: 0.9,
				opacity: 0,
				time: 700,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.5,
			}, {
				scale: 3,
				opacity: 0,
				time: 600,
			}, 'linear', 'fade');
		},
	},
	flinch: {
		anim(scene, [attacker]) {
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
			}, {
				scale: 3,
				opacity: 0.1,
				time: 300,
			}, 'linear', 'fade');
		},
	},
	attracted: {
		anim(scene, [attacker]) {
			scene.showEffect('heart', {
				x: attacker.x + 20,
				y: attacker.y + 20,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 0,
			}, {
				scale: 1,
				opacity: 1,
				time: 300,
			}, 'ballistic2Under', 'fade');
			scene.showEffect('heart', {
				x: attacker.x - 20,
				y: attacker.y + 10,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 100,
			}, {
				scale: 1,
				opacity: 1,
				time: 400,
			}, 'ballistic2Under', 'fade');
			scene.showEffect('heart', {
				x: attacker.x,
				y: attacker.y + 40,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 200,
			}, {
				scale: 1,
				opacity: 1,
				time: 500,
			}, 'ballistic2Under', 'fade');
		},
	},
	cursed: {
		anim(scene, [attacker]) {
			scene.backgroundEffect('#000000', 700, 0.2);
			attacker.delay(300);
			attacker.anim({x: attacker.x - 5, time: 50});
			attacker.anim({x: attacker.x + 5, time: 50});
			attacker.anim({x: attacker.x - 5, time: 50});
			attacker.anim({x: attacker.x + 5, time: 50});
			attacker.anim({x: attacker.x, time: 50});

			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.5,
				time: 0,
			}, {
				z: attacker.behind(20),
				opacity: 0,
				time: 600,
			}, 'decel');
		},
	},
	confused: {
		anim(scene, [attacker]) {
			scene.showEffect('electroball', {
				x: attacker.x + 50,
				y: attacker.y + 30,
				z: attacker.z,
				scale: 0.1,
				opacity: 1,
				time: 400,
			}, {
				x: attacker.x - 50,
				scale: 0.15,
				opacity: 0.4,
				time: 600,
			}, 'linear', 'fade');
			scene.showEffect('electroball', {
				x: attacker.x - 50,
				y: attacker.y + 30,
				z: attacker.z,
				scale: 0.1,
				opacity: 1,
				time: 400,
			}, {
				x: attacker.x + 50,
				scale: 0.15,
				opacity: 0.4,
				time: 600,
			}, 'linear', 'fade');
			scene.showEffect('electroball', {
				x: attacker.x + 50,
				y: attacker.y + 30,
				z: attacker.z,
				scale: 0.1,
				opacity: 1,
				time: 600,
			}, {
				x: attacker.x - 50,
				scale: 0.4,
				opacity: 0.4,
				time: 800,
			}, 'linear', 'fade');
			scene.showEffect('electroball', {
				x: attacker.x - 50,
				y: attacker.y + 30,
				z: attacker.z,
				scale: 0.15,
				opacity: 1,
				time: 600,
			}, {
				x: attacker.x + 50,
				scale: 0.4,
				opacity: 0.4,
				time: 800,
			}, 'linear', 'fade');
		},
	},
	confusedselfhit: {
		anim(scene, [attacker]) {
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.5,
			}, {
				scale: 2,
				opacity: 0,
				time: 200,
			}, 'linear');
			attacker.delay(50);
			attacker.anim({
				x: attacker.leftof(2),
				z: attacker.behind(5),
				time: 100,
			}, 'swing');
			attacker.anim({
				time: 300,
			}, 'swing');
		},
	},
};
BattleStatusAnims['focuspunch'] = {anim: BattleStatusAnims['flinch'].anim};
