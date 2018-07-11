/**
 * Pokemon Showdown Battle
 *
 * This is the main file for handling battle animations
 *
 * Licensing note: PS's client has complicated licensing:
 * - The client as a whole is AGPLv3
 * - The battle replay/animation engine (battle-*.ts) by itself is MIT
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 */

/** [id, element?, ...misc] */
type EffectState = any[] & {0: ID};
/** [name, minTimeLeft, maxTimeLeft] */
type WeatherState = [string, number, number];
type EffectTable = {[effectid: string]: EffectState};
type HPColor = 'r' | 'y' | 'g';

class Pokemon {
	name = '';
	species = '';

	/**
	 * A string representing information extractable from textual
	 * messages: side, nickname.
	 *
	 * Will be the empty string between Team Preview and the first
	 * switch-in.
	 *
	 * Examples: `p1: Unown` or `p2: Sparky`
	 */
	ident = '';
	/**
	 * A string representing visible information not included in
	 * ident: species, level, gender, shininess. Level is left off
	 * if it's 100; gender is left off if it's genderless.
	 *
	 * Note: Can be partially filled out in Team Preview, because certain
	 * forme information and shininess isn't visible there. In those
	 * cases, details can change during the first switch-in, but will
	 * otherwise not change over the course of a game.
	 *
	 * Examples: `Mimikyu, L50, F`, `Steelix, M, shiny`
	 */
	details = '';
	/**
	 * `` `${ident}|${details}` ``. Tracked for ease of searching.
	 *
	 * As with ident and details, will only change during the first
	 * switch-in.
	 */
	searchid = '';

	side: Side;
	slot = 0;

	fainted = false;
	hp = 0;
	maxhp = 1000;
	level = 100;
	gender: GenderName = '';
	shiny = false;

	hpcolor = 'g' as HPColor;
	moves = [] as string[];
	ability = '';
	baseAbility = '';
	item = '';
	itemEffect = '';
	prevItem = '';
	prevItemEffect = '';

	boosts = {} as {[stat: string]: number};
	status: StatusName | 'tox' | '' | '???' = '';
	statusStage = 0;
	volatiles = {} as EffectTable;
	turnstatuses = {} as EffectTable;
	movestatuses = {} as EffectTable;
	weightkg = 0;
	lastMove = '';

	/** [[moveName, ppUsed]] */
	moveTrack = [] as [string, number][];
	statusData = {sleepTurns: 0, toxicTurns: 0};

	sprite: PokemonSprite;

	constructor(data: any, side: Side) {
		this.side = side;
		this.species = data.species;

		// TODO: stop doing this
		Object.assign(this, Tools.getTemplate(data.species));
		Object.assign(this, data);

		this.sprite = side.battle.scene.addPokemonSprite(this);
	}

	isActive() {
		return this.side.active.includes(this);
	}

	getHPColor(): HPColor {
		if (this.hpcolor) return this.hpcolor;
		let ratio = this.hp / this.maxhp;
		if (ratio > 0.5) return 'g';
		if (ratio > 0.2) return 'y';
		return 'r';
	}
	getHPColorClass() {
		switch (this.getHPColor()) {
		case 'y': return ' hpbar-yellow';
		case 'r': return ' hpbar-red';
		}
		return '';
	}
	getPixelRange(pixels: number, color: HPColor): [number, number] {
		let epsilon = 0.5 / 714;

		if (pixels === 0) return [0, 0];
		if (pixels === 1) return [0 + epsilon, 2 / 48 - epsilon];
		if (pixels === 9) {
			if (color === 'y') { // ratio is > 0.2
				return [0.2 + epsilon, 10 / 48 - epsilon];
			} else { // ratio is <= 0.2
				return [9 / 48, 0.2];
			}
		}
		if (pixels === 24) {
			if (color === 'g') { // ratio is > 0.5
				return [0.5 + epsilon, 25 / 48 - epsilon];
			} else { // ratio is exactly 0.5
				return [0.5, 0.5];
			}
		}
		if (pixels === 48) return [1, 1];

		return [pixels / 48, (pixels + 1) / 48 - epsilon];
	}
	getFormattedRange(range: [number, number], precision: number, separator: string) {
		if (range[0] === range[1]) {
			let percentage = Math.abs(range[0] * 100);
			if (Math.floor(percentage) === percentage) {
				return percentage + '%';
			}
			return percentage.toFixed(precision) + '%';
		}
		let lower, upper;
		if (precision === 0) {
			lower = Math.floor(range[0] * 100);
			upper = Math.ceil(range[1] * 100);
		} else {
			lower = (range[0] * 100).toFixed(precision);
			upper = (range[1] * 100).toFixed(precision);
		}
		return lower + separator + upper + '%';
	}
	// Returns [min, max] damage dealt as a proportion of total HP from 0 to 1
	getDamageRange(damage: any): [number, number] {
		if (damage[1] !== 48) {
			let ratio = damage[0] / damage[1];
			return [ratio, ratio];
		} else if (damage.length === undefined) {
			// wrong pixel damage.
			// this case exists for backward compatibility only.
			return [damage[2] / 100, damage[2] / 100];
		}
		// pixel damage
		let oldrange = this.getPixelRange(damage[3], damage[4]);
		let newrange = this.getPixelRange(damage[3] + damage[0], this.hpcolor);
		if (damage[0] === 0) {
			// no change in displayed pixel width
			return [0, newrange[1] - newrange[0]];
		}
		if (oldrange[0] < newrange[0]) { // swap order
			let r = oldrange;
			oldrange = newrange;
			newrange = r;
		}
		return [oldrange[0] - newrange[1], oldrange[1] - newrange[0]];
	}
	healthParse(hpstring: string, parsedamage?: boolean, heal?: boolean): [number, number, number] | [number, number, number, number, HPColor] | null {
		// returns [delta, denominator, percent(, oldnum, oldcolor)] or null
		if (!hpstring || !hpstring.length) return null;
		let parenIndex = hpstring.lastIndexOf('(');
		if (parenIndex >= 0) {
			// old style damage and health reporting
			if (parsedamage) {
				let damage = parseFloat(hpstring);
				// unusual check preseved for backward compatbility
				if (isNaN(damage)) damage = 50;
				if (heal) {
					this.hp += this.maxhp * damage / 100;
					if (this.hp > this.maxhp) this.hp = this.maxhp;
				} else {
					this.hp -= this.maxhp * damage / 100;
				}
				// parse the absolute health information
				let ret = this.healthParse(hpstring);
				if (ret && (ret[1] === 100)) {
					// support for old replays with nearest-100th damage and health
					return [damage, 100, damage];
				}
				// complicated expressions preserved for backward compatibility
				let percent = Math.round(Math.ceil(damage * 48 / 100) / 48 * 100);
				let pixels = Math.ceil(damage * 48 / 100);
				return [pixels, 48, percent];
			}
			if (hpstring.substr(hpstring.length - 1) !== ')') {
				return null;
			}
			hpstring = hpstring.substr(parenIndex + 1, hpstring.length - parenIndex - 2);
		}

		let oldhp = this.fainted ? 0 : (this.hp || 1);
		let oldmaxhp = this.maxhp;
		let oldwidth = this.hpWidth(100);
		let oldcolor = this.hpcolor;

		this.side.battle.parseHealth(hpstring, this);
		if (oldmaxhp === 0) { // max hp not known before parsing this message
			oldmaxhp = oldhp = this.maxhp;
		}

		let oldnum = oldhp ? (Math.floor(oldhp / oldmaxhp * this.maxhp) || 1) : 0;
		let delta = this.hp - oldnum;
		let deltawidth = this.hpWidth(100) - oldwidth;
		return [delta, this.maxhp, deltawidth, oldnum, oldcolor];
	}
	checkDetails(details?: string) {
		if (!details) return false;
		if (details === this.details) return true;
		if (this.searchid) return false;
		if (details.indexOf(', shiny') >= 0) {
			if (this.checkDetails(details.replace(', shiny', ''))) return true;
		}
		// the actual forme was hidden on Team Preview
		details = details.replace(/(-[A-Za-z0-9]+)?(, |$)/, '-*$2');
		return (details === this.details);
	}
	getIdent() {
		let slots = ['a', 'b', 'c', 'd', 'e', 'f'];
		return this.ident.substr(0, 2) + slots[this.slot] + this.ident.substr(2);
	}
	removeVolatile(volatile: ID) {
		this.sprite.removeEffect(volatile);
		if (!this.hasVolatile(volatile)) return;
		delete this.volatiles[volatile];
	}
	addVolatile(volatile: ID, ...args: any[]) {
		let battle = this.side.battle;
		if (this.hasVolatile(volatile) && !args.length) return;
		this.volatiles[volatile] = [volatile, ...args] as EffectState;
		this.sprite.addEffect(volatile);
	}
	hasVolatile(volatile: ID) {
		return !!this.volatiles[volatile];
	}
	removeTurnstatus(volatile: ID) {
		this.sprite.removeEffect(volatile);
		if (!this.hasTurnstatus(volatile)) return;
		delete this.turnstatuses[volatile];
	}
	addTurnstatus(volatile: ID) {
		volatile = toId(volatile);
		let battle = this.side.battle;
		this.sprite.addEffect(volatile);
		if (this.hasTurnstatus(volatile)) return;
		this.turnstatuses[volatile] = [volatile];
	}
	hasTurnstatus(volatile: ID) {
		return !!this.turnstatuses[volatile];
	}
	clearTurnstatuses() {
		for (let id in this.turnstatuses) {
			this.removeTurnstatus(id as ID);
		}
		this.turnstatuses = {};
	}
	removeMovestatus(volatile: ID) {
		this.sprite.removeEffect(volatile);
		if (!this.hasMovestatus(volatile)) return;
		delete this.movestatuses[volatile];
	}
	addMovestatus(volatile: ID) {
		volatile = toId(volatile);
		if (this.hasMovestatus(volatile)) return;
		this.movestatuses[volatile] = [volatile];
		this.sprite.addEffect(volatile);
	}
	hasMovestatus(volatile: ID) {
		return !!this.movestatuses[volatile];
	}
	clearMovestatuses() {
		for (let id in this.movestatuses) {
			this.removeMovestatus(id as ID);
		}
		this.movestatuses = {};
	}
	clearVolatiles() {
		this.volatiles = {};
		this.clearTurnstatuses();
		this.clearMovestatuses();
		this.sprite.clearEffects();
	}
	markMove(moveName: string, pp?: number, recursionSource?: string) {
		if (recursionSource === this.ident) return;
		if (pp === undefined) pp = 1;
		moveName = Tools.getMove(moveName).name;
		if (moveName === 'Struggle') return;
		if (this.volatiles.transform) {
			// make sure there is no infinite recursion if both Pokemon are transformed into each other
			if (!recursionSource) recursionSource = this.ident;
			this.volatiles.transform[1].markMove(moveName, 0, recursionSource);
			moveName = '*' + moveName;
		}
		for (let i = 0; i < this.moveTrack.length; i++) {
			if (moveName === this.moveTrack[i][0]) {
				this.moveTrack[i][1] += pp;
				if (this.moveTrack[i][1] < 0) this.moveTrack[i][1] = 0;
				return;
			}
		}
		this.moveTrack.push([moveName, pp]);
	}
	markAbility(ability: string, isNotBase?: boolean) {
		ability = Tools.getAbility(ability).name;
		this.ability = ability;
		if (!this.baseAbility && !isNotBase) {
			this.baseAbility = ability;
		}
	}
	htmlName() {
		return '<span class="battle-nickname' + (this.side.n === 0 ? '' : '-foe') + '" title="' + this.species + '">' + Tools.escapeHTML(this.name) + '</span>';
	}
	getName(shortName?: boolean) {
		if (this.side.n === 0) {
			return this.htmlName();
		} else {
			return (shortName ? "Opposing " : "The opposing ") + this.htmlName();
		}
	}
	getLowerName(shortName?: boolean) {
		if (this.side.n === 0) {
			return this.htmlName();
		} else {
			return (shortName ? "opposing " : "the opposing ") + this.htmlName();
		}
	}
	getTitle() {
		let titlestring = '(' + this.ability + ') ';

		for (let i = 0; i < this.moves.length; i++) {
			if (i != 0) titlestring += ' / ';
			titlestring += Tools.getMove(this.moves[i]).name;
		}
		return titlestring;
	}
	getFullName(plaintext?: boolean) {
		let name = this.side && this.side.n && (this.side.battle.ignoreOpponent || this.side.battle.ignoreNicks) ? this.species : Tools.escapeHTML(this.name);
		if (name !== this.species) {
			if (plaintext) {
				name += ' (' + this.species + ')';
			} else {
				name = '<span class="battle-nickname' + (this.side && this.side.n === 0 ? '' : '-foe') + '" title="' + this.species + '">' + name + ' <small>(' + this.species + ')</small>' + '</span>';
			}
		}
		if (plaintext) {
			if (this === this.side.active[0]) {
				name += ' (active)';
			} else if (this.fainted) {
				name += ' (fainted)';
			} else {
				let statustext = '';
				if (this.hp !== this.maxhp) {
					statustext += this.hpDisplay();
				}
				if (this.status) {
					if (statustext) statustext += '|';
					statustext += this.status;
				}
				if (statustext) {
					name += ' (' + statustext + ')';
				}
			}
		}
		return name;
	}
	getBoost(boostStat: BoostStatName) {
		let boostStatTable = {
			atk: 'Atk',
			def: 'Def',
			spa: 'SpA',
			spd: 'SpD',
			spe: 'Spe',
			accuracy: 'Accuracy',
			evasion: 'Evasion',
			spc: 'Spc'
		};
		if (!this.boosts[boostStat]) {
			return '1&times;&nbsp;' + boostStatTable[boostStat];
		}
		if (this.boosts[boostStat] > 6) this.boosts[boostStat] = 6;
		if (this.boosts[boostStat] < -6) this.boosts[boostStat] = -6;
		if (boostStat === 'accuracy' || boostStat === 'evasion') {
			if (this.boosts[boostStat] > 0) {
				let goodBoostTable = ['1&times;', '1.33&times;', '1.67&times;', '2&times;', '2.33&times;', '2.67&times;', '3&times;'];
				//let goodBoostTable = ['Normal', '+1', '+2', '+3', '+4', '+5', '+6'];
				return '' + goodBoostTable[this.boosts[boostStat]] + '&nbsp;' + boostStatTable[boostStat];
			}
			let badBoostTable = ['1&times;', '0.75&times;', '0.6&times;', '0.5&times;', '0.43&times;', '0.38&times;', '0.33&times;'];
			//let badBoostTable = ['Normal', '&minus;1', '&minus;2', '&minus;3', '&minus;4', '&minus;5', '&minus;6'];
			return '' + badBoostTable[-this.boosts[boostStat]] + '&nbsp;' + boostStatTable[boostStat];
		}
		if (this.boosts[boostStat] > 0) {
			let goodBoostTable = ['1&times;', '1.5&times;', '2&times;', '2.5&times;', '3&times;', '3.5&times;', '4&times;'];
			//let goodBoostTable = ['Normal', '+1', '+2', '+3', '+4', '+5', '+6'];
			return '' + goodBoostTable[this.boosts[boostStat]] + '&nbsp;' + boostStatTable[boostStat];
		}
		let badBoostTable = ['1&times;', '0.67&times;', '0.5&times;', '0.4&times;', '0.33&times;', '0.29&times;', '0.25&times;'];
		//let badBoostTable = ['Normal', '&minus;1', '&minus;2', '&minus;3', '&minus;4', '&minus;5', '&minus;6'];
		return '' + badBoostTable[-this.boosts[boostStat]] + '&nbsp;' + boostStatTable[boostStat];
	}
	getBoostType(boostStat: BoostStatName) {
		if (!this.boosts[boostStat]) return 'neutral';
		if (this.boosts[boostStat] > 0) return 'good';
		return 'bad';
	}
	clearVolatile() {
		this.ability = this.baseAbility;
		if (window.BattlePokedex && BattlePokedex[this.species] && BattlePokedex[this.species].weightkg) {
			this.weightkg = BattlePokedex[this.species].weightkg;
		}
		this.boosts = {};
		this.clearVolatiles();
		for (let i = 0; i < this.moveTrack.length; i++) {
			if (this.moveTrack[i][0].charAt(0) === '*') {
				this.moveTrack.splice(i, 1);
				i--;
			}
		}
		//this.lastMove = '';
		this.statusStage = 0;
	}
	/**
	 * copyAll = false means Baton Pass,
	 * copyAll = true means Illusion breaking
	 */
	copyVolatileFrom(pokemon: Pokemon, copyAll?: boolean) {
		this.boosts = pokemon.boosts;
		this.volatiles = pokemon.volatiles;
		//this.lastMove = pokemon.lastMove; // I think
		if (!copyAll) {
			delete this.volatiles['airballoon'];
			delete this.volatiles['attract'];
			delete this.volatiles['autotomize'];
			delete this.volatiles['disable'];
			delete this.volatiles['encore'];
			delete this.volatiles['foresight'];
			delete this.volatiles['imprison'];
			delete this.volatiles['mimic'];
			delete this.volatiles['miracleeye'];
			delete this.volatiles['nightmare'];
			delete this.volatiles['smackdown'];
			delete this.volatiles['stockpile1'];
			delete this.volatiles['stockpile2'];
			delete this.volatiles['stockpile3'];
			delete this.volatiles['torment'];
			delete this.volatiles['typeadd'];
			delete this.volatiles['typechange'];
			delete this.volatiles['yawn'];
		}
		delete this.volatiles['transform'];
		delete this.volatiles['formechange'];

		pokemon.boosts = {};
		pokemon.volatiles = {};
		pokemon.sprite.removeTransform();
		pokemon.statusStage = 0;
	}
	copyTypesFrom(pokemon: Pokemon) {
		const [types, addedType] = pokemon.getTypes();
		this.addVolatile('typechange' as ID, types.join('/'));
		if (addedType) {
			this.addVolatile('typeadd' as ID, addedType);
		} else {
			this.removeVolatile('typeadd' as ID);
		}
	}
	getTypes(): [string[], string] {
		let types;
		if (this.volatiles.typechange) {
			types = this.volatiles.typechange[1].split('/');
		} else {
			const species = this.getSpecies();
			types = (
				window.BattleTeambuilderTable &&
				window.BattleTeambuilderTable['gen' + this.side.battle.gen] &&
				window.BattleTeambuilderTable['gen' + this.side.battle.gen].overrideType[toId(species)]
			);
			if (types) types = types.split('/');
			if (!types) types = Tools.getTemplate(species).types || [];
		}
		const addedType = (this.volatiles.typeadd ? this.volatiles.typeadd[1] : '');
		return [types, addedType];
	}
	getSpecies(): string {
		return this.volatiles.formechange ? this.volatiles.formechange[1]: this.species;
	}
	reset() {
		this.clearVolatile();
		this.hp = this.maxhp;
		this.fainted = false;
		this.status = '';
		this.moveTrack = [];
		this.name = this.name || this.species;
	}
	// This function is used for two things:
	//   1) The percentage to display beside the HP bar.
	//   2) The width to draw an HP bar.
	//
	// This function is NOT used in the calculation of any other displayed
	// percentages or ranges, which have their own, more complex, formulae.
	hpWidth(maxWidth: number) {
		if (this.fainted || !this.hp) return 0;

		// special case for low health...
		if (this.hp == 1 && this.maxhp > 45) return 1;

		if (this.maxhp === 48) {
			// Draw the health bar to the middle of the range.
			// This affects the width of the visual health bar *only*; it
			// does not affect the ranges displayed in any way.
			let range = this.getPixelRange(this.hp, this.hpcolor);
			let ratio = (range[0] + range[1]) / 2;
			return Math.round(maxWidth * ratio) || 1;
		}
		let percentage = Math.ceil(100 * this.hp / this.maxhp);
		if ((percentage === 100) && (this.hp < this.maxhp)) {
			percentage = 99;
		}
		return percentage * maxWidth / 100;
	}
	hpDisplay(precision = 1) {
		if (this.maxhp === 100) return this.hp + '%';
		if (this.maxhp !== 48) return (this.hp / this.maxhp * 100).toFixed(precision) + '%';
		let range = this.getPixelRange(this.hp, this.hpcolor);
		return this.getFormattedRange(range, precision, '–');
	}
	destroy() {
		if (this.sprite) this.sprite.destroy();
		this.sprite = null!;
		this.side = null!;
	}
}

class Side {
	battle: Battle;
	name = '';
	id = '';
	n: number;
	foe: Side = null!;
	spriteid: string | number = 262;
	totalPokemon = 6;
	x = 0;
	y = 0;
	z = 0;
	missedPokemon: Pokemon = null!;

	wisher: Pokemon | null = null;

	active = [null] as (Pokemon | null)[];
	lastPokemon = null as Pokemon | null;
	pokemon = [] as Pokemon[];

	/** [effectName, levels, minDuration, maxDuration] */
	sideConditions = {} as {[id: string]: [string, number, number, number]};

	constructor(battle: Battle, n: number) {
		this.battle = battle;
		this.n = n;
		this.updateSprites();
	}

	rollTrainerSprites() {
		let sprites = [1, 2, 101, 102, 169, 170];
		this.spriteid = sprites[Math.floor(Math.random() * sprites.length)];
	}

	behindx(offset: number) {
		return this.x + (!this.n ? -1 : 1) * offset;
	}
	behindy(offset: number) {
		return this.y + (!this.n ? 1 : -1) * offset;
	}
	leftof(offset: number) {
		return (!this.n ? -1 : 1) * offset;
	}
	behind(offset: number) {
		return this.z + (!this.n ? -1 : 1) * offset;
	}

	clearPokemon() {
		for (const pokemon of this.pokemon) pokemon.destroy();
		this.pokemon = [];
		for (let i = 0; i < this.active.length; i++) this.active[i] = null;
		this.lastPokemon = null;
	}
	reset() {
		this.clearPokemon();
		this.updateSprites();
		this.sideConditions = {};
	}
	updateSprites() {
		this.z = (this.n ? 200 : 0);
		if (this.missedPokemon) {
			this.missedPokemon.sprite.destroy();
		}
		this.missedPokemon = {
			sprite: new PokemonSprite(null, {
				x: this.leftof(-100),
				y: this.y,
				z: this.z,
				opacity: 0,
			},
			this.battle.scene, this.n)
		} as Pokemon;
		this.missedPokemon.sprite.isMissedPokemon = true;
	}
	setAvatar(spriteid: string) {
		this.spriteid = spriteid;
	}
	setName(name: string, spriteid?: string | number) {
		if (name) this.name = (name || '');
		this.id = toId(this.name);
		if (spriteid) {
			this.spriteid = spriteid;
		} else {
			this.rollTrainerSprites();
			if (this.foe && this.spriteid === this.foe.spriteid) this.rollTrainerSprites();
		}
		if (this.battle.stagnateCallback) this.battle.stagnateCallback(this.battle);
	}
	getTeamName() {
		if (this === this.battle.mySide) return "Your team";
		return "The opposing team";
	}
	getLowerTeamName() {
		if (this === this.battle.mySide) return "your team";
		return "the opposing team";
	}
	addSideCondition(effect: Effect) {
		let elem, curelem;
		let condition = effect.id;
		if (this.sideConditions[condition]) {
			if (condition === 'spikes' || condition === 'toxicspikes') {
				this.sideConditions[condition][1]++;
			}
			this.battle.scene.addSideCondition(this.n, condition);
			return;
		}
		// Side conditions work as: [effectName, levels, minDuration, maxDuration]
		switch (condition) {
		case 'auroraveil':
			this.sideConditions[condition] = [effect.name, 1, 5, 8];
			break;
		case 'reflect':
			this.sideConditions[condition] = [effect.name, 1, 5, this.battle.gen >= 4 ? 8 : 0];
			break;
		case 'safeguard':
			this.sideConditions[condition] = [effect.name, 1, 5, 0];
			break;
		case 'lightscreen':
			this.sideConditions[condition] = [effect.name, 1, 5, this.battle.gen >= 4 ? 8 : 0];
			break;
		case 'mist':
			this.sideConditions[condition] = [effect.name, 1, 5, 0];
			break;
		case 'tailwind':
			this.sideConditions[condition] = [effect.name, 1, this.battle.gen >= 5 ? 4 : 3, 0];
			break;
		case 'luckychant':
			this.sideConditions[condition] = [effect.name, 1, 5, 0];
			break;
		case 'stealthrock':
			this.sideConditions[condition] = [effect.name, 1, 0, 0];
			break;
		case 'spikes':
			this.sideConditions[condition] = [effect.name, 1, 0, 0];
			break;
		case 'toxicspikes':
			this.sideConditions[condition] = [effect.name, 1, 0, 0];
			break;
		case 'stickyweb':
			this.sideConditions[condition] = [effect.name, 1, 0, 0];
			break;
		default:
			this.sideConditions[condition] = [effect.name, 1, 0, 0];
			break;
		}
		this.battle.scene.addSideCondition(this.n, condition);
	}
	removeSideCondition(condition: string) {
		const id = toId(condition);
		if (!this.sideConditions[id]) return;
		delete this.sideConditions[id];
		this.battle.scene.removeSideCondition(this.n, id);
	}
	newPokemon(data: any, replaceSlot = -1) {
		let pokeobj;
		let poke = new Pokemon(data, this);
		if (!poke.ability && poke.baseAbility) poke.ability = poke.baseAbility;
		poke.reset();

		if (replaceSlot >= 0) {
			this.pokemon[replaceSlot] = poke;
		} else {
			this.pokemon.push(poke);
		}
		if (this.pokemon.length > this.totalPokemon || this.battle.speciesClause) {
			// check for Illusion
			let existingTable = {} as {[searchid: string]: number};
			let toRemove = -1;
			for (let poke1i = 0; poke1i < this.pokemon.length; poke1i++) {
				let poke1 = this.pokemon[poke1i];
				if (!poke1.searchid) continue;
				if (poke1.searchid in existingTable) {
					let poke2i = existingTable[poke1.searchid];
					let poke2 = this.pokemon[poke2i];
					if (poke === poke1) {
						toRemove = poke2i;
					} else if (poke === poke2) {
						toRemove = poke1i;
					} else if (this.active.indexOf(poke1) >= 0) {
						toRemove = poke2i;
					} else if (this.active.indexOf(poke2) >= 0) {
						toRemove = poke1i;
					} else if (poke1.fainted && !poke2.fainted) {
						toRemove = poke2i;
					} else {
						toRemove = poke1i;
					}
					break;
				}
				existingTable[poke1.searchid] = poke1i;
			}
			if (toRemove >= 0) {
				if (this.pokemon[toRemove].fainted) {
					// A fainted Pokemon was actually a Zoroark
					let illusionFound = null;
					for (let i = 0; i < this.pokemon.length; i++) {
						let curPoke = this.pokemon[i];
						if (curPoke === poke) continue;
						if (curPoke.fainted) continue;
						if (this.active.indexOf(curPoke) >= 0) continue;
						if (curPoke.species === 'Zoroark' || curPoke.species === 'Zorua' || curPoke.ability === 'Illusion') {
							illusionFound = curPoke;
							break;
						}
					}
					if (!illusionFound) {
						// This is Hackmons; we'll just guess a random unfainted Pokemon.
						// This will keep the fainted Pokemon count correct, and will
						// eventually become correct as incorrect guesses are switched in
						// and reguessed.
						for (let i = 0; i < this.pokemon.length; i++) {
							let curPoke = this.pokemon[i];
							if (curPoke === poke) continue;
							if (curPoke.fainted) continue;
							if (this.active.indexOf(curPoke) >= 0) continue;
							illusionFound = curPoke;
							break;
						}
					}
					if (illusionFound) {
						illusionFound.fainted = true;
						illusionFound.hp = 0;
						illusionFound.status = '';
					}
				}
				this.pokemon.splice(toRemove, 1);
			}
		}
		this.battle.scene.updateSidebar(this);

		return poke;
	}

	switchIn(pokemon: Pokemon, slot?: number) {
		if (slot === undefined) slot = pokemon.slot;
		this.active[slot] = pokemon;
		pokemon.slot = slot;
		pokemon.clearVolatile();
		pokemon.lastMove = '';
		this.battle.lastMove = 'switch-in';
		if (this.lastPokemon && (this.lastPokemon.lastMove === 'batonpass' || this.lastPokemon.lastMove === 'zbatonpass')) {
			pokemon.copyVolatileFrom(this.lastPokemon);
		}

		if (pokemon.side.n === 0) {
			this.battle.message('Go! ' + pokemon.getFullName() + '!');
		} else {
			this.battle.message('' + Tools.escapeHTML(pokemon.side.name) + ' sent out ' + pokemon.getFullName() + '!');
		}

		pokemon.sprite.animSummon(pokemon, slot);

		if (this.battle.switchCallback) this.battle.switchCallback(this.battle, this);
	}
	dragIn(pokemon: Pokemon, slot = pokemon.slot) {
		this.battle.message('' + pokemon.getFullName() + ' was dragged out!');
		let oldpokemon = this.active[slot];
		if (oldpokemon === pokemon) return;
		this.lastPokemon = oldpokemon;
		if (oldpokemon) {
			oldpokemon.sprite.animDragOut(oldpokemon);
			oldpokemon.clearVolatile();
		}
		pokemon.clearVolatile();
		pokemon.lastMove = '';
		this.battle.lastMove = 'switch-in';
		this.active[slot] = pokemon;
		pokemon.slot = slot;

		pokemon.sprite.animDragIn(pokemon, slot);

		if (this.battle.dragCallback) this.battle.dragCallback(this.battle, this);
	}
	replace(pokemon: Pokemon, slot = pokemon.slot) {
		let oldpokemon = this.active[slot];
		if (pokemon === oldpokemon) return;
		this.lastPokemon = oldpokemon;
		pokemon.clearVolatile();
		if (oldpokemon) {
			pokemon.lastMove = oldpokemon.lastMove;
			pokemon.hp = oldpokemon.hp;
			pokemon.maxhp = oldpokemon.maxhp;
			pokemon.hpcolor = oldpokemon.hpcolor;
			pokemon.status = oldpokemon.status;
			pokemon.copyVolatileFrom(oldpokemon, true);
			// we don't know anything about the illusioned pokemon except that it's not fainted
			// technically we also know its status but only at the end of the turn, not here
			oldpokemon.fainted = false;
			oldpokemon.hp = oldpokemon.maxhp;
			oldpokemon.status = '???';
		}
		this.active[slot] = pokemon;
		pokemon.slot = slot;

		if (oldpokemon) {
			oldpokemon.sprite.animUnsummon(oldpokemon, true);
		}
		pokemon.sprite.animSummon(pokemon, slot, true);
		// not sure if we want a different callback
		if (this.battle.dragCallback) this.battle.dragCallback(this.battle, this);
	}
	switchOut(pokemon: Pokemon, slot = pokemon.slot) {
		if (pokemon.lastMove !== 'batonpass' && pokemon.lastMove !== 'zbatonpass') {
			pokemon.clearVolatile();
		} else {
			pokemon.removeVolatile('transform' as ID);
			pokemon.removeVolatile('formechange' as ID);
		}
		if (pokemon.lastMove === 'uturn' || pokemon.lastMove === 'voltswitch') {
			this.battle.message('' + pokemon.getName() + ' went back to ' + Tools.escapeHTML(pokemon.side.name) + '!');
		} else if (pokemon.lastMove !== 'batonpass' && pokemon.lastMove !== 'zbatonpass') {
			if (pokemon.side.n === 0) {
				this.battle.message('' + pokemon.getName() + ', come back!');
			} else {
				this.battle.message('' + Tools.escapeHTML(pokemon.side.name) + ' withdrew ' + pokemon.getFullName() + '!');
			}
		}
		if (pokemon.statusData.toxicTurns) pokemon.statusData.toxicTurns = 1;
		if (this.battle.gen === 5) pokemon.statusData.sleepTurns = 0;
		this.lastPokemon = pokemon;
		this.active[slot] = null;

		pokemon.sprite.animUnsummon(pokemon);
	}
	swapTo(pokemon: Pokemon, slot: number, kwargs: {[k: string]: string}) {
		if (pokemon.slot === slot) return;
		let target = this.active[slot];

		if (!kwargs.silent) {
			let fromeffect = Tools.getEffect(kwargs.from);
			switch (fromeffect.id) {
			case 'allyswitch':
				this.battle.message('<small>' + pokemon.getName() + ' and ' + target!.getLowerName() + ' switched places.</small>');
				break;
			default:
				this.battle.message('<small>' + pokemon.getName() + ' moved to the center!</small>');
				break;
			}
		}

		let oslot = pokemon.slot;

		pokemon.slot = slot;
		if (target) target.slot = oslot;

		this.active[slot] = pokemon;
		this.active[oslot] = target;

		pokemon.sprite.animUnsummon(pokemon, true);
		if (target) target.sprite.animUnsummon(target, true);

		pokemon.sprite.animSummon(pokemon, slot, true);
		if (target) target.sprite.animSummon(target, oslot, true);
	}
	swapWith(pokemon: Pokemon, target: Pokemon, kwargs: {[k: string]: string}) {
		// method provided for backwards compatibility only
		if (pokemon === target) return;

		if (!kwargs.silent) {
			let fromeffect = Tools.getEffect(kwargs.from);
			switch (fromeffect.id) {
			case 'allyswitch':
				this.battle.message('<small>' + pokemon.getName() + ' and ' + target.getLowerName() + ' switched places.</small>');
				break;
			}
		}

		let oslot = pokemon.slot;
		let nslot = target.slot;

		pokemon.slot = nslot;
		target.slot = oslot;
		this.active[nslot] = pokemon;
		this.active[oslot] = target;

		pokemon.sprite.animUnsummon(pokemon, true);
		target.sprite.animUnsummon(target, true);

		pokemon.sprite.animSummon(pokemon, nslot, true);
		target.sprite.animSummon(target, oslot, true);
	}
	faint(pokemon: Pokemon, slot = pokemon.slot) {
		pokemon.clearVolatile();
		this.lastPokemon = pokemon;
		this.active[slot] = null;

		this.battle.message('' + pokemon.getName() + ' fainted!');
		if (window.Config && Config.server && Config.server.afd && !Config.server.afdFaint) {
			this.battle.message('<div class="broadcast-red" style="font-size:10pt">Needed that one alive? Buy <strong>Max Revive DLC</strong>, yours for only $9.99!<br /> <a href="/view-dlc">CLICK HERE!</a></div>');
			Config.server.afdFaint = true;
		}

		pokemon.fainted = true;
		pokemon.hp = 0;

		pokemon.sprite.animFaint(pokemon);
		if (this.battle.faintCallback) this.battle.faintCallback(this.battle, this);
	}
	destroy() {
		this.clearPokemon();
		this.battle = null!;
		this.foe = null!;
	}
}

enum Playback {
	Uninitialized = 0,
	Ready = 1,
	Playing = 2,
	Paused = 3,
	Finished = 4,
	Seeking = 5,
}

class Battle {
	scene: BattleScene;

	sidesSwitched = false;

	// activity queue
	activityQueue = [] as string[];
	preemptActivityQueue = [] as string[];
	minorQueue = [] as [string[], {[k: string]: string}][];
	activityStep = 0;
	fastForward = 0;
	fastForwardWillScroll = false;

	resultWaiting = false;
	activeMoveIsSpread: string | null = null;

	// callback
	faintCallback: Function | null = null;
	switchCallback: Function | null = null;
	dragCallback: Function | null = null;
	turnCallback: Function | null = null;
	startCallback: Function | null = null;
	stagnateCallback: Function | null = null;
	endCallback: Function | null = null;
	customCallback: Function | null = null;
	errorCallback: Function | null = null;

	mute = false;
	messageFadeTime = 300;
	messageShownTime = 1;
	turnsSinceMoved = 0;
	hasPreMoveMessage = false;

	turn = 0;
	/**
	 * Has playback gotten to the point where a player has won or tied?
	 * (Affects whether BGM is playing)
	 */
	ended = false;
	usesUpkeep = false;
	weather = '' as ID;
	pseudoWeather = [] as WeatherState[];
	weatherTimeLeft = 0;
	weatherMinTimeLeft = 0;
	mySide: Side = null!;
	yourSide: Side = null!;
	p1: Side = null!;
	p2: Side = null!;
	sides: [Side, Side] = [null!, null!];
	lastMove = '';
	gen = 7;
	teamPreviewCount = 0;
	speciesClause = false;
	tier = '';
	gameType: 'singles' | 'doubles' | 'triples' = 'singles';
	rated = false;
	endLastTurnPending = false;
	totalTimeLeft = 0;
	kickingInactive: number | boolean = false;

	// options
	id = '';
	roomid = '';
	hardcoreMode = false;
	ignoreNicks = Tools.prefs('ignorenicks');
	ignoreOpponent = false;
	ignoreSpects = false;
	debug = false;
	joinButtons = false;

	paused = true;
	playbackState = Playback.Uninitialized;

	// external
	resumeButton: JQuery.EventHandler<HTMLElement, null> | null = null;

	constructor($frame: JQuery<HTMLElement>, $logFrame: JQuery<HTMLElement>, id = '') {
		this.id = id;
		this.scene = new BattleScene(this, $frame, $logFrame);

		this.init();
	}

	removePseudoWeather(weather: string) {
		for (let i = 0; i < this.pseudoWeather.length; i++) {
			if (this.pseudoWeather[i][0] === weather) {
				this.pseudoWeather.splice(i, 1);
				this.scene.updateWeather();
				return;
			}
		}
	}
	addPseudoWeather(weather: string, minTimeLeft: number, timeLeft: number) {
		this.pseudoWeather.push([weather, minTimeLeft, timeLeft]);
		this.scene.updateWeather();
	}
	hasPseudoWeather(weather: string) {
		for (let i = 0; i < this.pseudoWeather.length; i++) {
			if (this.pseudoWeather[i][0] === weather) {
				return true;
			}
		}
		return false;
	}
	init() {
		this.mySide = new Side(this, 0);
		this.yourSide = new Side(this, 1);
		this.mySide.foe = this.yourSide;
		this.yourSide.foe = this.mySide;
		this.sides = [this.mySide, this.yourSide];
		this.p1 = this.mySide;
		this.p2 = this.yourSide;
		this.gen = 7;
		this.reset();
	}
	reset(dontResetSound?: boolean) {
		// battle state
		this.turn = 0;
		this.ended = false;
		this.weather = '' as ID;
		this.weatherTimeLeft = 0;
		this.weatherMinTimeLeft = 0;
		this.pseudoWeather = [];
		this.lastMove = '';

		// DOM state
		this.scene.reset();

		for (const side of this.sides) {
			if (side) side.reset();
		}

		if (this.ignoreNicks) {
			let $log = $('.battle-log .inner');
			if ($log.length) $log.addClass('hidenicks');
			let $message = $('.battle .message');
			if ($message.length) $message.addClass('hidenicks');
		}

		// activity queue state
		this.activeMoveIsSpread = null;
		this.activityStep = 0;
		this.fastForwardOff();
		$.fx.off = false;
		this.minorQueue = [];
		this.resultWaiting = false;
		this.paused = true;
		if (this.playbackState !== Playback.Seeking) {
			this.playbackState = (this.activityQueue.length ? Playback.Ready : Playback.Uninitialized);
			if (!dontResetSound) this.scene.soundStop();
		}
		this.resetTurnsSinceMoved();
	}
	destroy() {
		this.scene.destroy();

		for (let i = 0; i < this.sides.length; i++) {
			if (this.sides[i]) this.sides[i].destroy();
			this.sides[i] = null!;
		}
		this.mySide = null!;
		this.yourSide = null!;
		this.p1 = null!;
		this.p2 = null!;
	}

	message(message: string, hiddenMessage?: string) {
		this.scene.message(message, hiddenMessage);
	}

	switchSides(replay?: boolean) {
		if (this.ended) {
			this.reset(true);
			this.setSidesSwitched(!this.sidesSwitched);
			this.fastForwardTo(-1);
		} else {
			let turn = this.turn;
			let paused = this.paused;
			this.reset(true);
			this.paused = paused;
			this.setSidesSwitched(!this.sidesSwitched);
			if (turn) this.fastForwardTo(turn);
			if (!paused) {
				this.play();
			} else {
				this.pause();
			}
		}
	}
	setSidesSwitched(sidesSwitched: boolean) {
		this.sidesSwitched = sidesSwitched;
		if (this.sidesSwitched) {
			this.mySide = this.p2;
			this.yourSide = this.p1;
		} else {
			this.mySide = this.p1;
			this.yourSide = this.p2;
		}
		this.sides[0] = this.mySide;
		this.sides[1] = this.yourSide;
		this.sides[0].n = 0;
		this.sides[1].n = 1;
		this.sides[0].updateSprites();
		this.sides[1].updateSprites();

		// nothing else should need updating - don't call this function after sending out pokemon
	}

	//
	// activities
	//
	start() {
		this.scene.log('<div>Battle between ' + Tools.escapeHTML(this.p1.name) + ' and ' + Tools.escapeHTML(this.p2.name) + ' started!</div>');
		if (this.startCallback) this.startCallback(this);
	}
	winner(winner?: string) {
		if (winner) this.message('' + Tools.escapeHTML(winner) + ' won the battle!');
		else this.message('Tie between ' + Tools.escapeHTML(this.p1.name) + ' and ' + Tools.escapeHTML(this.p2.name) + '!');
		this.ended = true;
	}
	prematureEnd() {
		this.message('This replay ends here.');
		this.ended = true;
	}
	endLastTurn() {
		if (this.endLastTurnPending) {
			this.endLastTurnPending = false;
			this.scene.updateStatbars();
		}
	}
	setHardcoreMode(mode: boolean) {
		this.hardcoreMode = mode;
		this.scene.updateSidebars();
		this.scene.updateWeather(true);
	}
	setTurn(turnNum: string | number) {
		turnNum = parseInt(turnNum as string, 10);
		if (turnNum == this.turn + 1) {
			this.endLastTurnPending = true;
		}
		if (this.turn && !this.usesUpkeep) this.updatePseudoWeatherLeft(); // for compatibility with old replays
		this.turn = turnNum;

		if (this.mySide.active[0]) this.mySide.active[0]!.clearTurnstatuses();
		if (this.mySide.active[1]) this.mySide.active[1]!.clearTurnstatuses();
		if (this.mySide.active[2]) this.mySide.active[2]!.clearTurnstatuses();
		if (this.yourSide.active[0]) this.yourSide.active[0]!.clearTurnstatuses();
		if (this.yourSide.active[1]) this.yourSide.active[1]!.clearTurnstatuses();
		if (this.yourSide.active[2]) this.yourSide.active[2]!.clearTurnstatuses();

		if (!this.fastForward) this.turnsSinceMoved++;

		this.scene.incrementTurn();
		this.scene.log('<h2 class="battle-history">Turn ' + turnNum + '</h2>');

		if (this.fastForward) {
			if (this.turnCallback) this.turnCallback(this);
			if (this.fastForward > -1 && turnNum >= this.fastForward) {
				this.fastForwardOff();
				if (this.endCallback) this.endCallback(this);
			}
			return;
		}

		if (this.turnCallback) this.turnCallback(this);
	}
	resetTurnsSinceMoved() {
		this.turnsSinceMoved = 0;
		this.scene.acceleration = (this.messageFadeTime < 150 ? 2 : 1);
	}
	updateToxicTurns() {
		for (let i = 0; i < this.sides.length; i++) {
			for (let slot = 0; slot < this.sides[i].active.length; slot++) {
				let poke = this.sides[i].active[slot];
				if (poke && poke.statusData && poke.statusData.toxicTurns) poke.statusData.toxicTurns++;
			}
		}
	}
	changeWeather(weatherName: string, poke?: Pokemon, isUpkeep?: boolean, ability?: Effect) {
		let weather = toId(weatherName);
		let weatherTable = {
			sunnyday: {
				name: 'Sun',
				startMessage: 'The sunlight turned harsh!',
				abilityMessage: "'s Drought intensified the sun's rays!",
				//upkeepMessage: 'The sunlight is strong!',
				endMessage: "The sunlight faded."
			},
			desolateland: {
				name: "Intense Sun",
				startMessage: "The sunlight turned extremely harsh!",
				endMessage: "The harsh sunlight faded."
			},
			raindance: {
				name: 'Rain',
				startMessage: 'It started to rain!',
				abilityMessage: "'s Drizzle made it rain!",
				//upkeepMessage: 'Rain continues to fall!',
				endMessage: 'The rain stopped.'
			},
			primordialsea: {
				name: "Heavy Rain",
				startMessage: "A heavy rain began to fall!",
				endMessage: "The heavy rain has lifted!"
			},
			sandstorm: {
				name: 'Sandstorm',
				startMessage: 'A sandstorm kicked up!',
				abilityMessage: "'s Sand Stream whipped up a sandstorm!",
				upkeepMessage: 'The sandstorm is raging.',
				endMessage: 'The sandstorm subsided.'
			},
			hail: {
				name: 'Hail',
				startMessage: 'It started to hail!',
				abilityMessage: "'s Snow Warning whipped up a hailstorm!",
				upkeepMessage: 'The hail is crashing down.',
				endMessage: 'The hail stopped.'
			},
			deltastream: {
				name: 'Strong Winds',
				startMessage: 'Mysterious strong winds are protecting Flying-type Pok&eacute;mon!',
				endMessage: 'The mysterious strong winds have dissipated!'
			}
		} as {[weatherid: string]: {name: string, startMessage: string, abilityMessage?: string, upkeepMessage?: string, endMessage: string}};
		if (!weather || weather === 'none') {
			weather = '' as ID;
		}
		let newWeather = weatherTable[weather];
		if (isUpkeep) {
			if (this.weather && this.weatherTimeLeft) {
				this.weatherTimeLeft--;
				if (this.weatherMinTimeLeft != 0) this.weatherMinTimeLeft--;
			}
			if (!this.fastForward) {
				this.scene.upkeepWeather();
			}
			if (newWeather && newWeather.upkeepMessage) this.message('<div><small>' + newWeather.upkeepMessage + '</small></div>');
			return;
		}
		if (newWeather) {
			let isExtremeWeather = (weather === 'deltastream' || weather === 'desolateland' || weather === 'primordialsea');
			if (poke) {
				if (ability) {
					this.scene.abilityActivateAnim(poke, ability.name);
					this.message('', "<small>[" + poke.getName(true) + "'s " + ability.name + "!]</small>");
					poke.markAbility(ability.name);
					this.message('<small>' + newWeather.startMessage + '</small>');
				} else {
					this.message('<small>' + poke.getName() + newWeather.abilityMessage + '</small>'); // for backwards compatibility
				}
				this.weatherTimeLeft = (this.gen <= 5 || isExtremeWeather) ? 0 : 8;
				this.weatherMinTimeLeft = (this.gen <= 5 || isExtremeWeather) ? 0 : 5;
			} else if (isUpkeep) {
				this.scene.log('<div><small>' + newWeather.upkeepMessage + '</small></div>');
				this.weatherTimeLeft = 0;
				this.weatherMinTimeLeft = 0;
			} else if (isExtremeWeather) {
				this.message('<small>' + newWeather.startMessage + '</small>');
				this.weatherTimeLeft = 0;
				this.weatherMinTimeLeft = 0;
			} else {
				this.message('<small>' + newWeather.startMessage + '</small>');
				this.weatherTimeLeft = (this.gen <= 3 ? 5 : 8);
				this.weatherMinTimeLeft = (this.gen <= 3 ? 0 : 5);
			}
		}
		if (this.weather && !newWeather) {
			this.message('<small>' + weatherTable[this.weather].endMessage + '</small>');
		}
		this.weather = weather;
		this.scene.updateWeather();
	}
	updatePseudoWeatherLeft() {
		for (let i = 0; i < this.pseudoWeather.length; i++) {
			let pWeather = this.pseudoWeather[i];
			if (pWeather[1]) pWeather[1]--;
			if (pWeather[2]) pWeather[2]--;
		}
		for (let i = 0; i < this.sides.length; i++) {
			for (let id in this.sides[i].sideConditions) {
				let cond = this.sides[i].sideConditions[id];
				if (cond[2]) cond[2]--;
				if (cond[3]) cond[3]--;
			}
		}
		this.scene.updateWeather();
	}
	useMove(pokemon: Pokemon, move: Move, target: Pokemon | null, kwargs: {[k: string]: string}) {
		let fromeffect = Tools.getEffect(kwargs.from);
		pokemon.clearMovestatuses();
		if (move.id === 'focuspunch') {
			pokemon.removeTurnstatus('focuspunch' as ID);
		}
		pokemon.sprite.updateStatbar(pokemon);
		if (!target) {
			target = pokemon.side.foe.active[0];
		}
		if (!target) {
			target = pokemon.side.foe.missedPokemon;
		}
		if (!kwargs.silent) {
			if (kwargs.zeffect) {
				this.message('<small>' + pokemon.getName() + ' unleashes its full-force Z-Move!</small>', '');
			}
			switch (fromeffect.id) {
			case 'snatch':
				break;
			case 'magicbounce':
			case 'magiccoat':
			case 'rebound':
				if (fromeffect.id === 'magiccoat') {
					this.scene.resultAnim(pokemon, "Bounced", 'good');
					pokemon.addTurnstatus('magiccoat' as ID);
				} else {
					this.scene.abilityActivateAnim(pokemon, fromeffect.name);
					this.message('', "<small>[" + pokemon.getName(true) + "'s " + fromeffect.name + "!]</small>");
					pokemon.markAbility(fromeffect.name);
				}
				this.message(pokemon.getName() + " bounced the " + move.name + " back!");
				break;
			case 'metronome':
				this.message('Waggling a finger let it use <strong>' + move.name + '</strong>!');
				break;
			case 'naturepower':
				this.message('Nature Power turned into <strong>' + move.name + '</strong>!');
				break;
			case 'weatherball':
				this.message('Breakneck Blitz turned into <strong>' + move.name + '</strong> due to the weather!');
				break;
			case 'sleeptalk':
				pokemon.markMove(move.name, 0);
				this.message(pokemon.getName() + ' used <strong>' + move.name + '</strong>!');
				break;
			// Gen 1
			case 'bind':
			case 'clamp':
			case 'firespin':
			case 'wrap':
				this.message(pokemon.getName() + "'s attack continues!");
				break;
			default:
				// April Fool's 2014
				if (window.Config && Config.server && Config.server.afd && move.id === 'earthquake') {
					if (!this.fastForward) {
						$('body').css({
							position: 'absolute',
							left: 0,
							right: 0,
							top: 0,
							bottom: 0
						}).animate({
							left: -30,
							right: 30
						}, 75).animate({
							left: 30,
							right: -30
						}, 100).animate({
							left: -30,
							right: 30
						}, 100).animate({
							left: 30,
							right: -30
						}, 100).animate({
							left: 0,
							right: 0
						}, 100, function () {
							$(this).css({
								position: 'static'
							});
						});
					}
					this.message(pokemon.getName() + ' used <strong>Fissure</strong>!');
					this.message('Just kidding! It was <strong>Earthquake</strong>!');
				} else if (window.Config && Config.server && Config.server.afd && move.id === 'stealthrock') {
					let srNames = ['Sneaky Pebbles', 'Sly Rubble', 'Subtle Sediment', 'Buried Bedrock', 'Camouflaged Cinnabar', 'Clandestine Cobblestones', 'Cloaked Clay', 'Concealed Ore', 'Covert Crags', 'Crafty Coal', 'Discreet Bricks', 'Disguised Debris', 'Espionage Pebbles', 'Furtive Fortress', 'Hush-Hush Hardware', 'Incognito Boulders', 'Invisible Quartz', 'Masked Minerals', 'Mischievous Masonry', 'Obscure Ornaments', 'Private Paragon', 'Secret Solitaire', 'Sheltered Sand', 'Surreptitious Sapphire', 'Undercover Ultramarine'];
					this.message(pokemon.getName() + ' used <strong>' + srNames[Math.floor(Math.random() * srNames.length)] + '</strong>!');
				} else if (window.Config && Config.server && Config.server.afd && move.id === 'extremespeed') {
					let fastWords = ['H-Hayai', 'Masaka', 'Its fast'];
					this.message(pokemon.getName() + ' used <strong>' + move.name + '</strong>!');
					this.message('<strong>' + fastWords[Math.floor(Math.random() * fastWords.length)] + '</strong>!');
				} else if (window.Config && Config.server && Config.server.afd && move.id === 'aerialace') {
					this.message(pokemon.getName() + ' used <strong>Tsubame Gaeshi</strong>!');
				// } else if (window.Config && Config.server && Config.server.afd && (move.id === 'metronome' || move.id === 'sleeptalk' || move.id === 'assist')) {
				// 	this.message(pokemon.getName() + ' used <strong>' + move.name + '</strong>!');
				// 	let buttons = ["A", "B", "START", "SELECT", "UP", "DOWN", "LEFT", "RIGHT", "DEMOCRACY", "ANARCHY"];
				// 	let people = ["Zarel", "The Immortal", "Diatom", "Nani Man", "shaymin", "apt-get", "sirDonovan", "Arcticblast", "Trickster"];
				// 	let button;
				// 	for (let i = 0; i < 10; i++) {
				// 		let name = people[Math.floor(Math.random() * people.length)];
				// 		if (!button) button = buttons[Math.floor(Math.random() * buttons.length)];
				// 		this.scene.log('<div class="chat"><strong style="' + hashColor(toUserid(name)) + '" class="username" data-name="' + Tools.escapeHTML(name) + '">' + Tools.escapeHTML(name) + ':</strong> <em>' + button + '</em></div>');
				// 		button = (name === 'Diatom' ? "thanks diatom" : null);
				// 	}
				} else {
					this.message(pokemon.getName() + ' used <strong>' + move.name + '</strong>!');
				}
				if (!fromeffect.id || fromeffect.id === 'pursuit') {
					let moveName = move.name;
					if (move.isZ) {
						pokemon.item = move.isZ;
						let item = Tools.getItem(move.isZ);
						if (item.zMoveFrom) moveName = item.zMoveFrom;
					} else if (move.name.slice(0, 2) === 'Z-') {
						moveName = moveName.slice(2);
						move = Tools.getMove(moveName);
						if (window.BattleItems) {
							for (let item in BattleItems) {
								if (BattleItems[item].zMoveType === move.type) pokemon.item = item;
							}
						}
					}
					let pp = (target && target.side !== pokemon.side && toId(target.ability) === 'pressure' ? 2 : 1);
					pokemon.markMove(moveName, pp);
				}
				break;
			}
			if (window.Config && Config.server && Config.server.afd && move.id === 'taunt') {
				let quotes = [
					"Yo mama so fat, she 4x resists Ice- and Fire-type attacks!",
					"Yo mama so ugly, Captivate raises her opponent's Special Attack!",
					"Yo mama so dumb, she lowers her Special Attack when she uses Nasty Plot!",
					"Yo mama so dumb, she thought Sylveon would be Light Type!"
				];
				let quote = quotes[(this.p1.name.charCodeAt(2) + this.p2.name.charCodeAt(2) + this.turn) % quotes.length];
				this.message(pokemon.getName() + " said, \"" + quote + "\"");
			}
		}
		if (!this.fastForward && !kwargs.still) {
			// skip
			if (kwargs.miss && target.side) {
				target = target.side.missedPokemon;
			}
			if (kwargs.notarget || !target) {
				target = pokemon.side.foe.missedPokemon;
			}
			if (kwargs.prepare || kwargs.anim === 'prepare') {
				this.scene.runPrepareAnim(move.id, pokemon, target);
			} else if (!kwargs.notarget) {
				let usedMove = kwargs.anim ? Tools.getMove(kwargs.anim) : move;
				if (kwargs.spread) {
					this.activeMoveIsSpread = kwargs.spread;
					let targets = [pokemon];
					let hitPokemon = kwargs.spread.split(',');
					if (hitPokemon[0] !== '.') {
						for (const target of hitPokemon) {
							targets.push(this.getPokemon(target + ': ?')!);
						}
					} else {
						// if hitPokemon[0] === '.' then no target was hit by the attack
						targets.push(target.side.missedPokemon);
					}

					this.scene.runMoveAnim(usedMove.id, targets);
				} else {
					this.scene.runMoveAnim(usedMove.id, [pokemon, target]);
				}
			}
		}
		pokemon.lastMove = move.id;
		this.lastMove = move.id;
		if (move.id === 'wish' || move.id === 'healingwish') {
			pokemon.side.wisher = pokemon;
		}
	}
	cantUseMove(pokemon: Pokemon, effect: Effect, move: Move, kwargs: {[k: string]: string}) {
		pokemon.clearMovestatuses();
		pokemon.sprite.updateStatbar(pokemon);
		if (effect.id in BattleStatusAnims) {
			this.scene.runStatusAnim(effect.id, [pokemon]);
		}
		if (effect.effectType === 'Ability') {
			this.scene.abilityActivateAnim(pokemon, effect.name);
			this.message('', "<small>[" + pokemon.getName(true) + "'s " + effect.name + "!]</small>");
			pokemon.markAbility(effect.name);
		}
		switch (effect.id) {
		case 'taunt':
			this.message('' + pokemon.getName() + ' can\'t use ' + move.name + ' after the taunt!');
			pokemon.markMove(move.name, 0);
			break;
		case 'gravity':
			this.message('' + pokemon.getName() + ' can\'t use ' + move.name + ' because of gravity!');
			pokemon.markMove(move.name, 0);
			break;
		case 'healblock':
			this.message('' + pokemon.getName() + ' can\'t use ' + move.name + ' because of Heal Block!');
			pokemon.markMove(move.name, 0);
			break;
		case 'imprison':
			this.message('' + pokemon.getName() + ' can\'t use its sealed ' + move.name + '!');
			pokemon.markMove(move.name, 0);
			break;
		case 'throatchop':
			this.message('The effects of Throat Chop prevent ' + pokemon.getName() + ' from using certain moves!');
			break;
		case 'par':
			this.scene.resultAnim(pokemon, 'Paralyzed', 'par');
			this.message('' + pokemon.getName() + ' is paralyzed! It can\'t move!');
			break;
		case 'frz':
			this.scene.resultAnim(pokemon, 'Frozen', 'frz');
			this.message('' + pokemon.getName() + ' is frozen solid!');
			break;
		case 'slp':
			this.scene.resultAnim(pokemon, 'Asleep', 'slp');
			pokemon.statusData.sleepTurns++;
			this.message('' + pokemon.getName() + ' is fast asleep.');
			break;
		case 'skydrop':
			this.message('Sky Drop won\'t let ' + pokemon.getLowerName() + ' go!');
			break;
		case 'damp':
		case 'dazzling':
		case 'queenlymajesty':
			let ofpoke = this.getPokemon(kwargs.of)!;
			this.message(ofpoke.getName() + ' cannot use ' + move.name + '!');
			break;
		case 'truant':
			this.scene.resultAnim(pokemon, 'Loafing around', 'neutral');
			this.message('' + pokemon.getName() + ' is loafing around!');
			break;
		case 'recharge':
			this.scene.runOtherAnim('selfstatus' as ID, [pokemon]);
			this.scene.resultAnim(pokemon, 'Must recharge', 'neutral');
			this.message('<small>' + pokemon.getName() + ' must recharge!</small>');
			break;
		case 'focuspunch':
			this.scene.resultAnim(pokemon, 'Lost focus', 'neutral');
			this.message(pokemon.getName() + ' lost its focus and couldn\'t move!');
			pokemon.removeTurnstatus('focuspunch' as ID);
			break;
		case 'shelltrap':
			this.scene.resultAnim(pokemon, 'Trap failed', 'neutral');
			this.message(pokemon.getName() + '\'s shell trap didn\'t work!');
			pokemon.removeTurnstatus('shelltrap' as ID);
			break;
		case 'flinch':
			this.scene.resultAnim(pokemon, 'Flinched', 'neutral');
			this.message(pokemon.getName() + ' flinched and couldn\'t move!');
			pokemon.removeTurnstatus('focuspunch' as ID);
			break;
		case 'attract':
			this.scene.resultAnim(pokemon, 'Immobilized', 'neutral');
			this.message(pokemon.getName() + ' is immobilized by love!');
			break;
		case 'nopp':
			this.message(pokemon.getName() + ' used <strong>' + move.name + '</strong>!');
			this.message('But there was no PP left for the move!');
			break;
		default:
			this.message('<small>' + pokemon.getName() + (move.name ? ' can\'t use ' + move.name + '' : ' can\'t move') + '!</small>');
			break;
		}
		pokemon.sprite.animReset();
	}
	runMinor(args?: string[], kwargs?: {[k: string]: string}, preempt?: boolean, nextArgs?: string[], nextKwargs?: {[k: string]: string}) {
		let actions = '';
		let minors = this.minorQueue;
		if (args && kwargs && nextArgs && nextKwargs) {
			if (args[2] === 'Sturdy' && args[0] === '-activate') args[2] = 'ability: Sturdy';
			if (args[0] === '-crit' || args[0] === '-supereffective' || args[0] === '-resisted' || args[2] === 'ability: Sturdy') kwargs.then = '.';
			if (args[0] === '-damage' && !kwargs.from && args[1] !== nextArgs[1] && (nextArgs[0] === '-crit' || nextArgs[0] === '-supereffective' || nextArgs[0] === '-resisted' || (nextArgs[0] === '-damage' && !nextKwargs.from))) kwargs.then = '.';
			if (args[0] === '-damage' && nextArgs[0] === '-damage' && kwargs.from && kwargs.from === nextKwargs.from) kwargs.then = '.';
			if (args[0] === '-ability' && (args[2] === 'Intimidate' || args[3] === 'boost')) kwargs.then = '.';
			if (args[0] === '-unboost' && nextArgs[0] === '-unboost') kwargs.then = '.';
			if (args[0] === '-boost' && nextArgs[0] === '-boost') kwargs.then = '.';
			if (args[0] === '-damage' && kwargs.from === 'Leech Seed' && nextArgs[0] === '-heal' && nextKwargs.silent) kwargs.then = '.';
			minors.push([args, kwargs]);
			if (kwargs.simult || kwargs.then) {
				return;
			}
		}
		while (minors.length) {
			let row = minors.shift()!;
			args = row[0];
			kwargs = row[1];
			if (kwargs.simult) this.scene.timeOffset = 0;

			switch (args[0]) {
			case '-center': {
				actions += "Automatic center!";
				break;
			} case '-damage': {
				let poke = this.getPokemon(args[1])!;
				let damage = poke.healthParse(args[2], true);
				if (damage === null) break;
				let range = poke.getDamageRange(damage);

				if (kwargs.silent) {
					// do nothing
				} else if (kwargs.from) {
					let effect = Tools.getEffect(kwargs.from);
					let ofpoke = this.getPokemon(kwargs.of);
					if (effect.effectType === 'Ability' && ofpoke) {
						this.scene.abilityActivateAnim(ofpoke, effect.name);
						this.message('', "<small>[" + ofpoke.getName(true) + "'s " + effect.name + "!]</small>");
						ofpoke.markAbility(effect.name);
					} else if (effect.effectType === 'Item') {
						(ofpoke || poke).item = effect.name;
					}
					switch (effect.id) {
					case 'stealthrock':
						actions += "Pointed stones dug into " + poke.getLowerName() + "! ";
						break;
					case 'spikes':
						actions += "" + poke.getName() + " is hurt by the spikes! ";
						break;
					case 'brn':
						this.scene.runStatusAnim('brn' as ID, [poke]);
						actions += "" + poke.getName() + " was hurt by its burn! ";
						break;
					case 'psn':
						this.scene.runStatusAnim('psn' as ID, [poke]);
						actions += "" + poke.getName() + " was hurt by poison! ";
						break;
					case 'lifeorb':
						this.message('', '<small>' + poke.getName() + ' lost some of its HP!</small>');
						break;
					case 'recoil':
						actions += "" + poke.getName() + " is damaged by the recoil! ";
						break;
					case 'sandstorm':
						actions += "" + poke.getName() + " is buffeted by the sandstorm! ";
						break;
					case 'hail':
						actions += "" + poke.getName() + " is buffeted by the hail! ";
						break;
					case 'baddreams':
						this.scene.runStatusAnim('cursed' as ID, [poke]);
						actions += "" + poke.getName() + " is tormented!";
						break;
					case 'curse':
						this.scene.runStatusAnim('cursed' as ID, [poke]);
						actions += "" + poke.getName() + " is afflicted by the curse! ";
						break;
					case 'nightmare':
						actions += "" + poke.getName() + " is locked in a nightmare! ";
						break;
					case 'roughskin':
					case 'ironbarbs':
					case 'spikyshield':
						actions += "" + poke.getName() + " was hurt! ";
						break;
					case 'innardsout':
					case 'aftermath':
						actions += "" + poke.getName() + " is hurt! ";
						break;
					case 'liquidooze':
						actions += "" + poke.getName() + " sucked up the liquid ooze! ";
						break;
					case 'dryskin':
					case 'solarpower':
						break;
					case 'confusion':
						this.scene.runStatusAnim('confusedselfhit' as ID, [poke]);
						actions += "It hurt itself in its confusion! ";
						this.hasPreMoveMessage = false;
						break;
					case 'leechseed':
						this.scene.runOtherAnim('leech' as ID, [ofpoke!, poke]);
						actions += "" + poke.getName() + "'s health is sapped by Leech Seed! ";
						break;
					case 'flameburst':
						actions += "The bursting flame hit " + poke.getLowerName() + "! ";
						break;
					case 'firepledge':
						actions += "" + poke.getName() + " is hurt by the sea of fire! ";
						break;
					case 'jumpkick':
					case 'highjumpkick':
						actions += "" + poke.getName() + " kept going and crashed!";
						break;
					case 'bind':
					case 'wrap':
						this.scene.runOtherAnim('bound' as ID, [poke]);
						actions += "" + poke.getName() + ' is hurt by ' + effect.name + '!';
						break;
					default:
						if (ofpoke) {
							actions += "" + poke.getName() + " is hurt by " + ofpoke.getLowerName() + "'s " + effect.name + "! ";
						} else if (effect.effectType === 'Item') {
							actions += "" + poke.getName() + " is hurt by its " + effect.name + "! ";
						} else if (effect.effectType === 'Ability') {
							actions += "" + poke.getName() + " is hurt by its " + effect.name + "! ";
						} else if (kwargs.partiallytrapped) {
							actions += "" + poke.getName() + ' is hurt by ' + effect.name + '! ';
						} else {
							actions += "" + poke.getName() + " lost some HP because of " + effect.name + "! ";
						}
						break;
					}
				} else {
					let damageinfo = '' + poke.getFormattedRange(range, damage[1] === 100 ? 0 : 1, '–');
					if (damage[1] !== 100) {
						let hover = '' + ((damage[0] < 0) ? '&minus;' : '') +
							Math.abs(damage[0]) + '/' + damage[1];
						if (damage[1] === 48) { // this is a hack
							hover += ' pixels';
						}
						damageinfo = '<abbr title="' + hover + '">' + damageinfo + '</abbr>';
					}
					let hiddenactions = '<small>' + poke.getName() + ' lost ' + damageinfo + ' of its health!</small><br />';
					this.message(actions ? '<small>' + actions + '</small>' : '', hiddenactions);
					actions = '';
				}
				this.scene.damageAnim(poke, poke.getFormattedRange(range, 0, ' to '));
				break;
			} case '-heal': {
				let poke = this.getPokemon(args[1])!;
				let damage = poke.healthParse(args[2], true, true);
				if (damage === null) break;
				let range = poke.getDamageRange(damage);

				if (kwargs.silent) {
					// do nothing
				} else if (kwargs.from) {
					let effect = Tools.getEffect(kwargs.from);
					let ofpoke = this.getPokemon(kwargs.of);
					if (effect.effectType === 'Ability') {
						this.scene.abilityActivateAnim(poke, effect.name);
						this.message('', "<small>[" + poke.getName(true) + "'s " + effect.name + "!]</small>");
						poke.markAbility(effect.name);
					}
					switch (effect.id) {
					case 'memento':
					case 'partingshot':
						actions += "" + poke.getName() + "'s HP was restored by the Z-Power!";
						break;
					case 'ingrain':
						actions += "" + poke.getName() + " absorbed nutrients with its roots!";
						break;
					case 'aquaring':
						actions += "A veil of water restored " + poke.getLowerName() + "'s HP!";
						break;
					case 'healingwish':
						actions += "The healing wish came true for " + poke.getLowerName() + "!";
						this.lastMove = 'healing-wish';
						this.scene.runResidualAnim('healingwish' as ID, poke);
						poke.side.wisher = null;
						break;
					case 'lunardance':
						actions += "" + poke.getName() + " became cloaked in mystical moonlight!";
						this.lastMove = 'healing-wish';
						this.scene.runResidualAnim('healingwish' as ID, poke);
						for (let trackedMove of poke.moveTrack) {
							trackedMove[1] = 0;
						}
						poke.side.wisher = null;
						break;
					case 'wish':
						actions += "" + kwargs.wisher + "'s wish came true!";
						this.scene.runResidualAnim('wish' as ID, poke);
						break;
					case 'drain':
						actions += ofpoke!.getName() + ' had its energy drained!';
						break;
					case 'leftovers':
					case 'shellbell':
					case 'blacksludge':
						poke.item = effect.name;
						actions += "" + poke.getName() + " restored a little HP using its " + effect.name + "!";
						break;
					default:
						if (kwargs.absorb) {
							actions += "" + poke.getName() + "'s " + effect.name + " absorbs the attack!";
						} else if (effect.id && effect.effectType !== 'Ability') {
							actions += "" + poke.getName() + " restored HP using its " + effect.name + "!";
						} else {
							actions += poke.getName() + ' restored its HP.';
						}
						break;
					}
				} else if (kwargs.zeffect) {
					actions += "" + poke.getName() + " restored its HP using its Z-Power!";
				} else {
					actions += poke.getName() + ' restored its HP.';
				}
				this.scene.runOtherAnim('heal' as ID, [poke]);
				this.scene.healAnim(poke, poke.getFormattedRange(range, 0, ' to '));
				break;
			} case '-sethp': {
				let effect = Tools.getEffect(kwargs.from);
				let poke, ofpoke;
				for (let k = 0; k < 2; k++) {
					let cpoke = this.getPokemon(args[1 + 2 * k]);
					if (cpoke) {
						let damage = cpoke.healthParse(args[2 + 2 * k])!;
						let range = cpoke.getDamageRange(damage);
						let formattedRange = cpoke.getFormattedRange(range, 0, ' to ');
						let diff = damage[0];
						if (diff > 0) {
							this.scene.healAnim(cpoke, formattedRange);
						} else {
							this.scene.damageAnim(cpoke, formattedRange);
						}
					}
					if (k == 0) poke = cpoke;
					if (k == 1) ofpoke = cpoke;
				}
				switch (effect.id) {
				case 'painsplit':
					actions += 'The battlers shared their pain!';
					break;
				}

				break;

			} case '-boost': {
				let poke = this.getPokemon(args[1])!;
				let stat = args[2] as BoostStatName;
				if (this.gen === 1 && stat === 'spd') break;
				if (this.gen === 1 && stat === 'spa') stat = 'spc';
				let amount = parseInt(args[3], 10);
				if (amount === 0) {
					actions += "" + poke.getName() + "'s " + BattleStats[stat] + " won't go any higher! ";
					this.scene.resultAnim(poke, 'Highest ' + BattleStats[stat], 'good');
					break;
				}
				if (!poke.boosts[stat]) {
					poke.boosts[stat] = 0;
				}
				poke.boosts[stat] += amount;

				let amountString = '';
				if (amount === 2) amountString = ' sharply';
				if (amount >= 3) amountString = ' drastically';
				if (kwargs.silent) {
					// do nothing
				} else if (kwargs.from) {
					let effect = Tools.getEffect(kwargs.from);
					let ofpoke = this.getPokemon(kwargs.of);
					if (effect.effectType === 'Ability' && !(effect.id === 'weakarmor' && stat === 'spe')) {
						this.scene.abilityActivateAnim(ofpoke || poke, effect.name);
						this.message('', "<small>[" + (ofpoke || poke).getName(true) + "'s " + effect.name + "!]</small>");
						poke.markAbility(effect.name);
					}
					switch (effect.id) {
					default:
						if (effect.effectType === 'Ability') {
							actions += "" + poke.getName() + "'s " + BattleStats[stat] + " rose" + amountString + "! ";
						}
						if (effect.effectType === 'Item') {
							actions += "The " + effect.name + amountString + " raised " + poke.getLowerName() + "'s " + BattleStats[stat] + "! ";
						}
						break;
					}
				} else if (kwargs.zeffect) {
					if (minors.length && minors[0][1].zeffect) {
						actions += "" + poke.getName() + " boosted its stats" + amountString + " using its Z-Power! ";
						for (let i = 0; i < minors.length; i++) {
							minors[i][1].silent = '.';
						}
					} else {
						actions += "" + poke.getName() + " boosted its " + BattleStats[stat] + amountString + " using its Z-Power! ";
					}
				} else {
					actions += "" + poke.getName() + "'s " + BattleStats[stat] + " rose" + amountString + "! ";
				}
				this.scene.resultAnim(poke, poke.getBoost(stat), 'good');
				break;
			} case '-unboost': {
				let poke = this.getPokemon(args[1])!;
				let stat = args[2] as BoostStatName;
				if (this.gen === 1 && stat === 'spd') break;
				if (this.gen === 1 && stat === 'spa') stat = 'spc';
				let amount = parseInt(args[3], 10);
				if (amount === 0) {
					actions += "" + poke.getName() + "'s " + BattleStats[stat] + " won't go any lower! ";
					this.scene.resultAnim(poke, 'Lowest ' + BattleStats[stat], 'bad');
					break;
				}
				if (!poke.boosts[stat]) {
					poke.boosts[stat] = 0;
				}
				poke.boosts[stat] -= amount;

				let amountString = '';
				if (amount === 2) amountString = ' harshly';
				if (amount >= 3) amountString = ' severely';
				if (kwargs.silent) {
					// do nothing
				} else if (kwargs.from) {
					let effect = Tools.getEffect(kwargs.from);
					let ofpoke = this.getPokemon(kwargs.of);
					if (effect.effectType === 'Ability') {
						this.scene.abilityActivateAnim(ofpoke || poke, effect.name);
						this.message('', "<small>[" + (ofpoke || poke).getName(true) + "'s " + effect.name + "!]</small>");
						poke.markAbility(effect.name);
					}
					switch (effect.id) {
					default:
						if (effect.effectType === 'Ability') {
							actions += "" + poke.getName() + "'s " + BattleStats[stat] + " fell" + amountString + "! ";
						}
						if (effect.effectType === 'Item') {
							actions += "The " + effect.name + amountString + " lowered " + poke.getLowerName() + "'s " + BattleStats[stat] + "! ";
						}
						break;
					}
				} else {
					actions += "" + poke.getName() + "'s " + BattleStats[stat] + " fell" + amountString + "! ";
				}
				this.scene.resultAnim(poke, poke.getBoost(stat), 'bad');
				break;
			} case '-setboost': {
				let poke = this.getPokemon(args[1])!;
				let stat = args[2] as BoostStatName;
				let amount = parseInt(args[3], 10);
				let effect = Tools.getEffect(kwargs.from);
				let ofpoke = this.getPokemon(kwargs.of);
				poke.boosts[stat] = amount;
				this.scene.resultAnim(poke, poke.getBoost(stat), (amount > 0 ? 'good' : 'bad'));

				if (kwargs.silent) {
					// do nothing
				} else if (kwargs.from) {
					switch (effect.id) {
					case 'bellydrum':
						actions += '' + poke.getName() + ' cut its own HP and maximized its Attack!';
						break;
					case 'angerpoint':
						this.scene.runOtherAnim('anger' as ID, [poke]);
						this.scene.abilityActivateAnim(poke, 'Anger Point');
						this.message('', "<small>[" + poke.getName(true) + "'s Anger Point!]</small>");
						poke.markAbility('Anger Point');
						actions += '' + poke.getName() + ' maxed its Attack!';
						break;
					}
				}
				break;
			} case '-swapboost': {
				let poke = this.getPokemon(args[1])!;
				let poke2 = this.getPokemon(args[2])!;
				let stats = args[3] ? args[3].split(', ') : ['atk', 'def', 'spa', 'spd', 'spe', 'accuracy', 'evasion'];
				let effect = Tools.getEffect(kwargs.from);
				for (let i = 0; i < stats.length; i++) {
					let tmp = poke.boosts[stats[i]];
					poke.boosts[stats[i]] = poke2.boosts[stats[i]];
					if (!poke.boosts[stats[i]]) delete poke.boosts[stats[i]];
					poke2.boosts[stats[i]] = tmp;
					if (!poke2.boosts[stats[i]]) delete poke2.boosts[stats[i]];
				}
				this.scene.resultAnim(poke, 'Stats swapped', 'neutral');
				this.scene.resultAnim(poke2, 'Stats swapped', 'neutral');

				if (kwargs.silent) {
					// do nothing
				} else if (effect.id) {
					switch (effect.id) {
					case 'guardswap':
						actions += '' + poke.getName() + ' switched all changes to its Defense and Sp. Def with its target!';
						break;
					case 'heartswap':
						actions += '' + poke.getName() + ' switched stat changes with its target!';
						break;
					case 'powerswap':
						actions += '' + poke.getName() + ' switched all changes to its Attack and Sp. Atk with its target!';
						break;
					}
				}
				break;
			} case '-clearpositiveboost': {
				let poke = this.getPokemon(args[1])!;
				let ofpoke = this.getPokemon(args[2]);
				let effect = Tools.getEffect(args[3]);
				for (const stat in poke.boosts) {
					if (poke.boosts[stat] > 0) delete poke.boosts[stat];
				}
				this.scene.resultAnim(poke, 'Boosts lost', 'bad');

				if (kwargs.silent) {
					// do nothing
				} else if (effect.id) {
					switch (effect.id) {
					case 'spectralthief':
						// todo: update StealBoosts so it animates 1st on Spectral Thief
						this.scene.runOtherAnim('spectralthiefboost' as ID, [ofpoke!, poke]);
						actions += '' + ofpoke!.getName() + ' stole the target\'s boosted stats!';
						break;
					}
				}
				break;
			} case '-clearnegativeboost': {
				let poke = this.getPokemon(args[1])!;
				for (const stat in poke.boosts) {
					if (poke.boosts[stat] < 0) delete poke.boosts[stat];
				}
				this.scene.resultAnim(poke, 'Restored', 'good');

				if (kwargs.silent) {
					// do nothing
				} else if (kwargs.zeffect) {
					actions += '' + poke.getName() + ' returned its decreased stats to normal using its Z-Power!';
					break;
				}
				break;
			} case '-copyboost': {
				let poke = this.getPokemon(args[1])!;
				let frompoke = this.getPokemon(args[2])!;
				let stats = args[3] ? args[3].split(', ') : ['atk', 'def', 'spa', 'spd', 'spe', 'accuracy', 'evasion'];
				let effect = Tools.getEffect(kwargs.from);
				for (let i = 0; i < stats.length; i++) {
					poke.boosts[stats[i]] = frompoke.boosts[stats[i]];
					if (!poke.boosts[stats[i]]) delete poke.boosts[stats[i]];
				}
				// poke.boosts = {...frompoke.boosts};

				if (kwargs.silent) {
					// do nothing
				} else {
					this.scene.resultAnim(poke, 'Stats copied', 'neutral');
					actions += "" + poke.getName() + " copied " + frompoke.getLowerName() + "'s stat changes!";
				}
				break;
			} case '-clearboost': {
				let poke = this.getPokemon(args[1])!;
				poke.boosts = {};
				this.scene.resultAnim(poke, 'Stats reset', 'neutral');

				if (kwargs.silent) {
					// do nothing
				} else {
					actions += '' + poke.getName() + '\'s stat changes were removed!';
				}
				break;
			} case '-invertboost': {
				let poke = this.getPokemon(args[1])!;
				for (const stat in poke.boosts) {
					poke.boosts[stat] = -poke.boosts[stat];
				}
				this.scene.resultAnim(poke, 'Stats inverted', 'neutral');

				if (kwargs.silent) {
					// do nothing
				} else {
					actions += '' + poke.getName() + '\'s stat changes were inverted!';
				}
				break;
			} case '-clearallboost': {
				for (const side of this.sides) {
					for (const active of side.active) {
						if (active) {
							active.boosts = {};
							this.scene.resultAnim(active, 'Stats reset', 'neutral');
						}
					}
				}

				if (kwargs.silent) {
					// do nothing
				} else {
					actions += 'All stat changes were eliminated!';
				}
				break;

			} case '-crit': {
				let poke = this.getPokemon(args[1]);
				for (let j = 1; !poke && j < 10; j++) poke = this.getPokemon(minors[j][0][1]);
				if (poke) this.scene.resultAnim(poke, 'Critical hit', 'bad');
				actions += "A critical hit" + (poke && this.activeMoveIsSpread ? " on " + poke.getLowerName() : "") + "! ";
				if (window.Config && Config.server && Config.server.afd && !Config.server.afdCrit) {
					actions += '<div class="broadcast-red" style="font-size:10pt">Crit mattered? Buy <strong>Crit Insurance DLC</strong>, yours for only $4.99!<br /> <a href="/view-dlc">CLICK HERE!</a></div>';
					Config.server.afdCrit = true;
				}
				break;

			} case '-supereffective': {
				let poke = this.getPokemon(args[1]);
				for (let j = 1; !poke && j < 10; j++) poke = this.getPokemon(minors[j][0][1]);
				if (poke) {
					this.scene.resultAnim(poke, 'Super-effective', 'bad');
					if (window.Config && Config.server && Config.server.afd) {
						this.scene.runOtherAnim('hitmark' as ID, [poke]);
					}
				}
				actions += "It's super effective" + (poke && this.activeMoveIsSpread ? " on " + poke.getLowerName() : "") + "! ";
				break;

			} case '-resisted': {
				let poke = this.getPokemon(args[1]);
				for (let j = 1; !poke && j < 10; j++) poke = this.getPokemon(minors[j][0][1]);
				if (poke) this.scene.resultAnim(poke, 'Resisted', 'neutral');
				actions += "It's not very effective" + (poke && this.activeMoveIsSpread ? " on " + poke.getLowerName() : "..") + ". ";
				break;

			} case '-immune': {
				let poke = this.getPokemon(args[1])!;
				let effect = Tools.getEffect(args[2]);
				let fromeffect = Tools.getEffect(kwargs.from);
				if (fromeffect && fromeffect.effectType === 'Ability') {
					let ofpoke = this.getPokemon(kwargs.of) || poke;
					this.scene.abilityActivateAnim(ofpoke, fromeffect.name);
					this.message('', "<small>[" + ofpoke.getName(true) + "'s " + fromeffect.name + "!]</small>");
					ofpoke.markAbility(fromeffect.name);
				}
				if (effect.id == 'confusion') {
					actions += "" + poke.getName() + " doesn't become confused! ";
				} else if (kwargs.msg) {
					actions += "It doesn't affect " + poke.getLowerName() + "... ";
				} else if (kwargs.ohko) {
					actions += "" + poke.getName() + " is unaffected! ";
				} else {
					actions += "It had no effect! ";
				}
				this.scene.resultAnim(poke, 'Immune', 'neutral');
				break;

			} case '-miss': {
				let user = this.getPokemon(args[1])!;
				let target = this.getPokemon(args[2]);
				if (target) {
					actions += "" + target.getName() + " avoided the attack!";
					this.scene.resultAnim(target, 'Missed', 'neutral');
				} else {
					actions += "" + user.getName() + "'s attack missed!";
				}
				break;

			} case '-fail': {
				let poke = this.getPokemon(args[1])!;
				let effect = Tools.getEffect(args[2]);
				let fromeffect = Tools.getEffect(kwargs.from);
				let ofpoke = this.getPokemon(kwargs.of);
				if (poke) {
					this.scene.resultAnim(poke, 'Failed', 'neutral');
				}
				// Sky Drop blocking moves takes priority over all other moves
				if (fromeffect.id === 'skydrop') {
					actions += "Sky Drop won't let " + poke.getLowerName() + " go!";
					break;
				}
				switch (effect.id) {
				case 'brn':
					this.scene.resultAnim(poke, 'Already burned', 'neutral');
					actions += "" + poke.getName() + " already has a burn.";
					break;
				case 'tox':
				case 'psn':
					this.scene.resultAnim(poke, 'Already poisoned', 'neutral');
					actions += "" + poke.getName() + " is already poisoned.";
					break;
				case 'slp':
					if (fromeffect.id === 'uproar') {
						this.scene.resultAnim(poke, 'Failed', 'neutral');
						if (kwargs.msg) {
							actions += "But " + poke.getLowerName() + " can't sleep in an uproar!";
						} else {
							actions += "But the uproar kept " + poke.getLowerName() + " awake!";
						}
					} else {
						this.scene.resultAnim(poke, 'Already asleep', 'neutral');
						actions += "" + poke.getName() + " is already asleep!";
					}
					break;
				case 'par':
					this.scene.resultAnim(poke, 'Already paralyzed', 'neutral');
					actions += "" + poke.getName() + " is already paralyzed.";
					break;
				case 'frz':
					this.scene.resultAnim(poke, 'Already frozen', 'neutral');
					actions += "" + poke.getName() + " is already frozen solid!";
					break;
				case 'darkvoid':
				case 'hyperspacefury':
					if (kwargs.forme) {
						actions += 'But ' + poke.getLowerName() + ' can\'t use it the way it is now!';
					} else {
						actions += 'But ' + poke.getLowerName() + ' can\'t use the move!';
					}
					break;
				case 'magikarpsrevenge':
					actions += 'But ' + poke.getLowerName() + ' can\'t use the move!';
					break;
				case 'substitute':
					if (kwargs.weak) {
						actions += "But it does not have enough HP left to make a substitute!";
					} else {
						actions += '' + poke.getName() + ' already has a substitute!';
					}
					break;
				case 'skydrop':
					if (kwargs.heavy) {
						actions += '' + poke.getName() + ' is too heavy to be lifted!';
					} else {
						actions += "But it failed!";
					}
					break;
				case 'sunnyday':
				case 'raindance':
				case 'sandstorm':
				case 'hail':
					switch (fromeffect.id) {
					case 'desolateland':
						actions += "The extremely harsh sunlight was not lessened at all!";
						break;
					case 'primordialsea':
						actions += "There is no relief from this heavy rain!";
						break;
					case 'deltastream':
						actions += "The mysterious strong winds blow on regardless!";
						break;
					default:
						actions += "But it failed!";
					}
					break;
				case 'unboost':
					if (fromeffect.effectType === 'Ability') {
						this.scene.abilityActivateAnim(poke, fromeffect.name);
						this.message('', "<small>[" + poke.getName(true) + "'s " + fromeffect.name + "!]</small>");
						poke.markAbility(fromeffect.name);
					} else {
						this.scene.resultAnim(poke, 'Stat drop blocked', 'neutral');
					}
					switch (fromeffect.id) {
					case 'flowerveil':
						actions += '' + ofpoke!.getName() + ' surrounded itself with a veil of petals!';
						break;
					default:
						let stat = Tools.escapeHTML(args[3]);
						actions += "" + poke.getName() + "'s " + (stat ? stat + " was" : "stats were") + " not lowered!";
					}
					break;
				default:
					switch (fromeffect.id) {
					case 'desolateland':
						actions += "The Water-type attack evaporated in the harsh sunlight!";
						break;
					case 'primordialsea':
						actions += "The Fire-type attack fizzled out in the heavy rain!";
						break;
					default:
						actions += "But it failed!";
					}
					break;
				}
				break;

			} case '-notarget': {
				if (this.gen >= 5) {
					actions += "But it failed!";
				} else {
					actions += "But there was no target...";
				}
				break;

			} case '-ohko': {
				actions += "It's a one-hit KO!";
				break;

			} case '-hitcount': {
				let hits = parseInt(args[2], 10);
				actions += 'Hit ' + hits + (hits > 1 ? ' times!' : ' time!');
				break;

			} case '-nothing': {
				actions += "But nothing happened! ";
				break;

			} case '-waiting': {
				let poke = this.getPokemon(args[1])!;
				let ofpoke = this.getPokemon(args[2])!;
				actions += "" + poke.getName() + " is waiting for " + ofpoke.getLowerName() + "'s move...";
				break;

			} case '-combine': {
				actions += "The two moves have become one! It's a combined move!";
				break;

			} case '-zpower': {
				if (!this.hasPreMoveMessage && this.waitForResult()) return;
				let poke = this.getPokemon(args[1])!;
				this.scene.runOtherAnim('zpower' as ID, [poke]);
				actions += "" + poke.getName() + " surrounded itself with its Z-Power! ";
				this.hasPreMoveMessage = true;
				break;

			} case '-zbroken': {
				let poke = this.getPokemon(args[1])!;
				actions += "" + poke.getName() + " couldn't fully protect itself and got hurt!";
				break;

			} case '-prepare': {
				let poke = this.getPokemon(args[1])!;
				let moveid = toId(args[2]);
				let target = this.getPokemon(args[3]) || poke.side.foe.active[0] || poke;
				this.scene.runPrepareAnim(moveid, poke, target);
				break;

			} case '-mustrecharge': {
				let poke = this.getPokemon(args[1])!;
				poke.addMovestatus('mustrecharge' as ID);
				poke.sprite.updateStatbar(poke);
				break;

			} case '-status': {
				let poke = this.getPokemon(args[1])!;
				let effect = Tools.getEffect(kwargs.from);
				let ofpoke = this.getPokemon(kwargs.of) || poke;
				poke.status = args[2] as StatusName;
				poke.removeVolatile('yawn' as ID);
				let effectMessage = "";
				if (effect.effectType === 'Ability') {
					this.scene.abilityActivateAnim(ofpoke, effect.name);
					this.message('', "<small>[" + ofpoke.getName(true) + "'s " + effect.name + "!]</small>");
					ofpoke.markAbility(effect.name);
				} else if (effect.effectType === 'Item') {
					ofpoke.item = effect.name;
					effectMessage = " by the " + effect.name;
				}

				switch (args[2]) {
				case 'brn':
					this.scene.resultAnim(poke, 'Burned', 'brn');
					this.scene.runStatusAnim('brn' as ID, [poke]);
					actions += "" + poke.getName() + " was burned" + effectMessage + "!";
					break;
				case 'tox':
					this.scene.resultAnim(poke, 'Toxic poison', 'psn');
					this.scene.runStatusAnim('psn' as ID, [poke]);
					poke.statusData.toxicTurns = 1;
					actions += "" + poke.getName() + " was badly poisoned" + effectMessage + "!";
					break;
				case 'psn':
					this.scene.resultAnim(poke, 'Poisoned', 'psn');
					this.scene.runStatusAnim('psn' as ID, [poke]);
					actions += "" + poke.getName() + " was poisoned!";
					break;
				case 'slp':
					this.scene.resultAnim(poke, 'Asleep', 'slp');
					if (effect.id === 'rest') {
						poke.statusData.sleepTurns = 0; // for Gen 2 use through Sleep Talk
						actions += '' + poke.getName() + ' slept and became healthy!';
					} else {
						actions += "" + poke.getName() + " fell asleep!";
					}
					break;
				case 'par':
					this.scene.resultAnim(poke, 'Paralyzed', 'par');
					this.scene.runStatusAnim('par' as ID, [poke]);
					actions += "" + poke.getName() + " is paralyzed! It may be unable to move!";
					break;
				case 'frz':
					this.scene.resultAnim(poke, 'Frozen', 'frz');
					this.scene.runStatusAnim('frz' as ID, [poke]);
					actions += "" + poke.getName() + " was frozen solid!";
					break;
				default:
					poke.sprite.updateStatbar(poke);
					break;
				}
				break;

			} case '-curestatus': {
				let poke = this.getPokemon(args[1])!;
				let effect = Tools.getEffect(kwargs.from);
				let ofpoke = this.getPokemon(kwargs.of);
				let pokeName, pokeSideN;
				if (poke) {
					poke.status = '';
					pokeName = poke.getName();
					pokeSideN = poke.side.n;
				} else {
					let parseIdResult = this.parsePokemonId(args[1]);
					pokeName = parseIdResult.name;
					pokeSideN = parseIdResult.siden;
				}
				if (args[2] === 'slp') poke.statusData.sleepTurns = 0;
				if (effect.id === 'naturalcure' && !this.hasPreMoveMessage && this.waitForResult()) return;

				if (kwargs.silent) {
					// do nothing
				} else if (effect.id) {
					switch (effect.id) {
					case 'psychoshift':
						actions += '' + pokeName + ' moved its status onto ' + ofpoke!.getLowerName() + '!';
						if (poke) this.scene.resultAnim(poke, 'Cured', 'good');
						break;
					case 'flamewheel':
					case 'flareblitz':
					case 'fusionflare':
					case 'sacredfire':
					case 'scald':
					case 'steameruption':
						if (poke) this.scene.resultAnim(poke, 'Thawed', 'good');
						actions += "" + pokeName + "'s " + effect.name + " melted the ice!";
						break;
					case 'naturalcure':
						actions += "(" + pokeName + "'s Natural Cure activated!)";
						if (poke) poke.markAbility('Natural Cure');
						this.hasPreMoveMessage = true;
						break;
					default:
						if (poke) this.scene.resultAnim(poke, 'Cured', 'good');
						actions += "" + pokeName + "'s " + effect.name + " heals its status!";
						break;
					}
				} else {
					switch (args[2]) {
					case 'brn':
						if (poke) this.scene.resultAnim(poke, 'Burn cured', 'good');
						if (effect.effectType === 'Item') {
							actions += "" + pokeName + "'s " + effect.name + " healed its burn!";
							break;
						}
						if (pokeSideN === 0) actions += "" + pokeName + "'s burn was healed.";
						else actions += "" + pokeName + " healed its burn!";
						break;
					case 'tox':
						if (poke) poke.statusData.toxicTurns = 0;
						// falls through
					case 'psn':
						if (poke) this.scene.resultAnim(poke, 'Poison cured', 'good');
						if (effect.effectType === 'Item') {
							actions += "" + pokeName + "'s " + effect.name + " cured its poison!";
							break;
						}
						actions += "" + pokeName + " was cured of its poisoning.";
						break;
					case 'slp':
						if (poke) this.scene.resultAnim(poke, 'Woke up', 'good');
						if (poke) poke.statusData.sleepTurns = 0;
						if (effect.effectType === 'Item') {
							actions += "" + pokeName + "'s " + effect.name + " woke it up!";
							break;
						}
						actions += "" + pokeName + " woke up!";
						break;
					case 'par':
						if (poke) this.scene.resultAnim(poke, 'Paralysis cured', 'good');
						if (effect.effectType === 'Item') {
							actions += "" + pokeName + "'s " + effect.name + " cured its paralysis!";
							break;
						}
						actions += "" + pokeName + " was cured of paralysis.";
						break;
					case 'frz':
						if (poke) this.scene.resultAnim(poke, 'Thawed', 'good');
						if (effect.effectType === 'Item') {
							actions += "" + pokeName + "'s " + effect.name + " defrosted it!";
							break;
						}
						actions += "" + pokeName + " thawed out!";
						break;
					default:
						if (poke) poke.removeVolatile('confusion' as ID);
						if (poke) this.scene.resultAnim(poke, 'Cured', 'good');
						actions += "" + pokeName + "'s status cleared!";
					}
				}
				break;

			} case '-cureteam': { // For old gens when the whole team was always cured
				let poke = this.getPokemon(args[1])!;
				for (const target of poke.side.pokemon) {
					target.status = '';
					if (target.sprite.$statbar) target.sprite.updateStatbar(target);
				}

				this.scene.resultAnim(poke, 'Team Cured', 'good');
				let effect = Tools.getEffect(kwargs.from);
				switch (effect.id) {
				case 'aromatherapy':
					actions += 'A soothing aroma wafted through the area!';
					break;
				case 'healbell':
					actions += 'A bell chimed!';
					break;
				default:
					actions += "" + poke.getName() + "'s team was cured!";
					break;
				}
				break;

			} case '-item': {
				let poke = this.getPokemon(args[1])!;
				let item = Tools.getItem(args[2]);
				let effect = Tools.getEffect(kwargs.from);
				let ofpoke = this.getPokemon(kwargs.of);
				poke.item = item.name;
				poke.itemEffect = '';
				poke.removeVolatile('airballoon' as ID);
				if (item.id === 'airballoon') poke.addVolatile('airballoon' as ID);

				if (effect.id) {
					switch (effect.id) {
					case 'pickup':
						this.scene.abilityActivateAnim(poke, 'Pickup');
						this.message('', "<small>[" + poke.getName(true) + "'s Pickup!]</small>");
						poke.markAbility('Pickup');
						// falls through
					case 'recycle':
						poke.itemEffect = 'found';
						actions += '' + poke.getName() + ' found one ' + item.name + '!';
						this.scene.resultAnim(poke, item.name, 'neutral');
						break;
					case 'frisk':
						this.scene.abilityActivateAnim(ofpoke!, 'Frisk');
						this.message('', "<small>[" + ofpoke!.getName(true) + "'s Frisk!]</small>");
						ofpoke!.markAbility('Frisk');
						if (kwargs.identify) { // used for gen 6
							poke.itemEffect = 'frisked';
							actions += '' + ofpoke!.getName() + ' frisked ' + poke.getLowerName() + ' and found its ' + item.name + '!';
							this.scene.resultAnim(poke, item.name, 'neutral');
						} else {
							actions += '' + ofpoke!.getName() + ' frisked its target and found one ' + item.name + '!';
						}
						break;
					case 'magician':
					case 'pickpocket':
						this.scene.abilityActivateAnim(poke, effect.name);
						this.message('', "<small>[" + poke.getName(true) + "'s " + effect.name + "!]</small>");
						poke.markAbility(effect.name);
						// falls through
					case 'thief':
					case 'covet':
						// simulate the removal of the item from the ofpoke
						ofpoke!.item = '';
						ofpoke!.itemEffect = '';
						ofpoke!.prevItem = item.name;
						ofpoke!.prevItemEffect = 'stolen';
						ofpoke!.addVolatile('itemremoved' as ID);
						poke.itemEffect = 'stolen';
						actions += '' + poke.getName() + ' stole ' + ofpoke!.getLowerName() + "'s " + item.name + "!";
						this.scene.resultAnim(poke, item.name, 'neutral');
						this.scene.resultAnim(ofpoke!, 'Item Stolen', 'bad');
						break;
					case 'harvest':
						poke.itemEffect = 'harvested';
						this.scene.abilityActivateAnim(poke, 'Harvest');
						this.message('', "<small>[" + poke.getName(true) + "'s Harvest!]</small>");
						poke.markAbility('Harvest');
						actions += '' + poke.getName() + ' harvested one ' + item.name + '!';
						this.scene.resultAnim(poke, item.name, 'neutral');
						break;
					case 'bestow':
						poke.itemEffect = 'bestowed';
						actions += '' + poke.getName() + ' received ' + item.name + ' from ' + ofpoke!.getLowerName() + '!';
						this.scene.resultAnim(poke, item.name, 'neutral');
						break;
					case 'trick':
						poke.itemEffect = 'tricked';
						// falls through
					default:
						actions += '' + poke.getName() + ' obtained one ' + item.name + '.';
						this.scene.resultAnim(poke, item.name, 'neutral');
						break;
					}
				} else {
					switch (item.id) {
					case 'airballoon':
						this.scene.resultAnim(poke, 'Balloon', 'good');
						actions += "" + poke.getName() + " floats in the air with its Air Balloon!";
						break;
					default:
						actions += "" + poke.getName() + " has " + item.name + "!";
						break;
					}
				}
				break;

			} case '-enditem': {
				let poke = this.getPokemon(args[1])!;
				let item = Tools.getItem(args[2]);
				let effect = Tools.getEffect(kwargs.from);
				let ofpoke = this.getPokemon(kwargs.of);
				poke.item = '';
				poke.itemEffect = '';
				poke.prevItem = item.name;
				poke.prevItemEffect = '';
				poke.removeVolatile('airballoon' as ID);
				poke.addVolatile('itemremoved' as ID);
				if (kwargs.silent) {
					// do nothing
				} else if (kwargs.eat) {
					poke.prevItemEffect = 'eaten';
					this.scene.runOtherAnim('consume' as ID, [poke]);
					actions += '' + poke.getName() + ' ate its ' + item.name + '!';
					this.lastMove = item.id;
				} else if (kwargs.weaken) {
					poke.prevItemEffect = 'eaten';
					actions += 'The ' + item.name + ' weakened the damage to ' + poke.getLowerName() + '!';
					this.lastMove = item.id;
				} else if (effect.id) {
					switch (effect.id) {
					case 'fling':
						poke.prevItemEffect = 'flung';
						actions += "" + poke.getName() + ' flung its ' + item.name + '!';
						break;
					case 'knockoff':
						poke.prevItemEffect = 'knocked off';
						actions += '' + ofpoke!.getName() + ' knocked off ' + poke.getLowerName() + '\'s ' + item.name + '!';
						this.scene.runOtherAnim('itemoff' as ID, [poke]);
						this.scene.resultAnim(poke, 'Item knocked off', 'neutral');
						break;
					case 'stealeat':
						poke.prevItemEffect = 'stolen';
						actions += '' + ofpoke!.getName() + ' stole and ate its target\'s ' + item.name + '!';
						break;
					case 'gem':
						poke.prevItemEffect = 'consumed';
						actions += 'The ' + item.name + ' strengthened ' + Tools.getMove(kwargs.move).name + '\'s power!';
						break;
					case 'incinerate':
						poke.prevItemEffect = 'incinerated';
						actions += "" + poke.getName() + "'s " + item.name + " was burned up!";
						break;
					default:
						actions += "" + poke.getName() + ' lost its ' + item.name + '!';
						break;
					}
				} else {
					switch (item.id) {
					case 'airballoon':
						poke.prevItemEffect = 'popped';
						poke.removeVolatile('airballoon' as ID);
						this.scene.resultAnim(poke, 'Balloon popped', 'neutral');
						actions += "" + poke.getName() + "'s Air Balloon popped!";
						break;
					case 'focussash':
						poke.prevItemEffect = 'consumed';
						this.scene.resultAnim(poke, 'Sash', 'neutral');
						actions += "" + poke.getName() + ' hung on using its Focus Sash!';
						break;
					case 'focusband':
						this.scene.resultAnim(poke, 'Focus Band', 'neutral');
						actions += "" + poke.getName() + ' hung on using its Focus Band!';
						break;
					case 'powerherb':
						poke.prevItemEffect = 'consumed';
						actions += "" + poke.getName() + " became fully charged due to its Power Herb!";
						break;
					case 'whiteherb':
						poke.prevItemEffect = 'consumed';
						actions += "" + poke.getName() + " returned its status to normal using its White Herb!";
						break;
					case 'ejectbutton':
						poke.prevItemEffect = 'consumed';
						actions += "" + poke.getName() + " is switched out with the Eject Button!";
						break;
					case 'redcard':
						poke.prevItemEffect = 'held up';
						actions += "" + poke.getName() + " held up its Red Card against " + ofpoke!.getLowerName() + "!";
						break;
					default:
						poke.prevItemEffect = 'consumed';
						actions += "" + poke.getName() + "'s " + item.name + " activated!";
						break;
					}
				}
				break;

			} case '-ability': {
				let poke = this.getPokemon(args[1])!;
				let ability = Tools.getAbility(args[2]);
				let effect = Tools.getEffect(kwargs.from);
				let ofpoke = this.getPokemon(kwargs.of);
				poke.markAbility(ability.name, effect.id && !kwargs.fail);

				if (kwargs.silent) {
					// do nothing
				} else if (effect.id) {
					switch (effect.id) {
					case 'trace':
						this.scene.abilityActivateAnim(poke, "Trace");
						this.scene.wait(500);
						this.scene.abilityActivateAnim(poke, ability.name);
						this.message('', "<small>[" + poke.getName(true) + "'s Trace!]</small>");
						if (!poke.baseAbility) poke.baseAbility = effect.name;
						ofpoke!.markAbility(ability.name);
						actions += '' + poke.getName() + ' traced ' + ofpoke!.getLowerName() + '\'s ' + ability.name + '!';
						break;
					case 'powerofalchemy':
					case 'receiver':
						this.scene.abilityActivateAnim(poke, effect.name);
						this.scene.wait(500);
						this.scene.abilityActivateAnim(poke, ability.name);
						this.message('', "<small>[" + poke.getName(true) + "'s " + effect.name + "!]</small>");
						if (!poke.baseAbility) poke.baseAbility = effect.name;
						actions += '' + ofpoke!.getName() + '\'s ' + ability.name + ' was taken over!';
						break;
					case 'roleplay':
						this.scene.abilityActivateAnim(poke, ability.name);
						actions += '' + poke.getName() + ' copied ' + ofpoke!.getLowerName() + '\'s ' + ability.name + ' Ability!';
						ofpoke!.markAbility(ability.name);
						break;
					case 'desolateland':
						if (kwargs.fail) {
							this.scene.abilityActivateAnim(poke, ability.name);
							this.message('', "<small>[" + poke.getName(true) + "'s " + ability.name + "!]</small>");
							actions += "The extremely harsh sunlight was not lessened at all!";
						}
						break;
					case 'primordialsea':
						if (kwargs.fail) {
							this.scene.abilityActivateAnim(poke, ability.name);
							this.message('', "<small>[" + poke.getName(true) + "'s " + ability.name + "!]</small>");
							actions += "There's no relief from this heavy rain!";
						}
						break;
					case 'deltastream':
						if (kwargs.fail) {
							this.scene.abilityActivateAnim(poke, ability.name);
							this.message('', "<small>[" + poke.getName(true) + "'s " + ability.name + "!]</small>");
							actions += "The mysterious strong winds blow on regardless!";
						}
						break;
					default:
						this.scene.abilityActivateAnim(poke, ability.name);
						actions += "" + poke.getName() + " acquired " + ability.name + "!";
						break;
					}
				} else {
					this.scene.abilityActivateAnim(poke, ability.name);
					this.message('', "<small>[" + poke.getName(true) + "'s " + ability.name + "!]</small>");
					switch (ability.id) {
					case 'airlock':
					case 'cloudnine':
						actions += "The effects of the weather disappeared.";
						break;
					case 'anticipation':
						actions += "" + poke.getName() + " shuddered!";
						break;
					case 'aurabreak':
						actions += "" + poke.getName() + " reversed all other Pokémon's auras!";
						break;
					case 'comatose':
						actions += "" + poke.getName() + " is drowsing!";
						break;
					case 'darkaura':
						actions += "" + poke.getName() + " is radiating a dark aura!";
						break;
					case 'fairyaura':
						actions += "" + poke.getName() + " is radiating a fairy aura!";
						break;
					case 'moldbreaker':
						actions += "" + poke.getName() + " breaks the mold!";
						break;
					case 'pressure':
						actions += "" + poke.getName() + " is exerting its pressure!";
						break;
					case 'sturdy':
						actions += "" + poke.getName() + " endured the hit!";
						break;
					case 'teravolt':
						actions += "" + poke.getName() + " is radiating a bursting aura!";
						break;
					case 'turboblaze':
						actions += "" + poke.getName() + " is radiating a blazing aura!";
						break;
					case 'unnerve':
						actions += "" + this.getSide(args[3]).getTeamName() + " is too nervous to eat Berries!";
						break;
					default:
						// Do nothing
					}
				}
				break;

			} case '-endability': {
				let poke = this.getPokemon(args[1])!;
				let ability = Tools.getAbility(args[2]);
				let effect = Tools.getEffect(kwargs.from);
				poke.ability = '';

				if (kwargs.silent) {
					// do nothing
				} else if (ability.exists) {
					actions += "(" + poke.getName() + "'s " + ability.name + " was removed.)";
					this.scene.resultAnim(poke, ability.name + ' removed', 'bad');
					if (!poke.baseAbility) poke.baseAbility = ability.name;
				} else {
					actions += "" + poke.getName() + "\'s Ability was suppressed!";
				}
				break;

			} case '-transform': {
				let poke = this.getPokemon(args[1])!;
				let tpoke = this.getPokemon(args[2])!;
				let effect = Tools.getEffect(kwargs.from);

				if (!kwargs.silent && effect.effectType === 'Ability') {
					this.scene.abilityActivateAnim(poke, effect.name);
					this.message('', "<small>[" + poke.getName(true) + "'s " + effect.name + "!]</small>");
					poke.markAbility(effect.name);
				}

				actions += '' + poke.getName() + ' transformed into ' + tpoke.species + '!';
				poke.boosts = {...tpoke.boosts};
				poke.copyTypesFrom(tpoke);
				poke.weightkg = tpoke.weightkg;
				poke.ability = tpoke.ability;
				const species = (tpoke.volatiles.formechange ? tpoke.volatiles.formechange[1] : tpoke.species);
				const pokemon = tpoke;
				const shiny = tpoke.shiny;
				const gender = tpoke.gender;
				poke.addVolatile('transform' as ID, pokemon, shiny, gender);
				poke.addVolatile('formechange' as ID, species);
				for (const trackedMove of tpoke.moveTrack) {
					poke.markMove(trackedMove[0], 0);
				}
				poke.sprite.animTransform(poke);
				this.scene.resultAnim(poke, 'Transformed', 'good');
				break;
			} case '-formechange': {
				let poke = this.getPokemon(args[1])!;
				let template = Tools.getTemplate(args[2]);
				let fromeffect = Tools.getEffect(kwargs.from);
				let isCustomAnim = false;
				poke.removeVolatile('typeadd' as ID);
				poke.removeVolatile('typechange' as ID);

				if (kwargs.silent) {
					// do nothing
				} else {
					if (fromeffect.effectType === 'Ability') {
						this.scene.abilityActivateAnim(poke, fromeffect.name);
						this.message('', "<small>[" + poke.getName(true) + "'s " + fromeffect.name + "!]</small>");
						poke.markAbility(fromeffect.name);
					}
					if (kwargs.msg) {
						actions += "" + poke.getName() + " transformed!";
						if (toId(template.species) === 'shaymin') break;
					} else if (toId(template.species) === 'darmanitanzen') {
						actions += "Zen Mode triggered!";
					} else if (toId(template.species) === 'darmanitan') {
						actions += "Zen Mode ended!";
					} else if (toId(template.species) === 'aegislashblade') {
						actions += "Changed to Blade Forme!";
					} else if (toId(template.species) === 'aegislash') {
						actions += "Changed to Shield Forme!";
					} else if (toId(template.species) === 'wishiwashischool') {
						actions += "" + poke.getName() + " formed a school!";
						isCustomAnim = true;
					} else if (toId(template.species) === 'wishiwashi') {
						actions += "" + poke.getName() + " stopped schooling!";
						isCustomAnim = true;
					} else if (toId(template.species) === 'miniormeteor') {
						actions += "Shields Down deactivated!";
					} else if (toId(template.species) === 'minior') {
						actions += "Shields Down activated!";
					}
				}
				poke.addVolatile('formechange' as ID, template.species); // the formechange volatile reminds us to revert the sprite change on switch-out
				poke.sprite.animTransform(poke, isCustomAnim);
				break;
			} case '-mega': {
				let poke = this.getPokemon(args[1])!;
				let item = Tools.getItem(args[3]);
				if (args[2] === 'Rayquaza') {
					actions += "" + Tools.escapeHTML(poke.side.name) + "'s fervent wish has reached " + poke.getLowerName() + "!";
				} else {
					poke.item = item.name;
					actions += "" + poke.getName() + "'s " + item.name + " is reacting to " + (this.gen >= 7 ? "the Key Stone" : Tools.escapeHTML(poke.side.name) + "'s Mega Bracelet") + "!";
				}
				actions += "<br />" + poke.getName() + " has Mega Evolved into Mega " + args[2] + "!";
				break;
			} case '-primal': {
				let poke = this.getPokemon(args[1])!;
				actions += "" + poke.getName() + "'s Primal Reversion! It reverted to its primal state!";
				break;
			} case '-burst': {
				let poke = this.getPokemon(args[1])!;
				actions += "Bright light is about to burst out of " + poke.getLowerName() + "!";
				break;

			} case '-start': {
				let poke = this.getPokemon(args[1])!;
				let effect = Tools.getEffect(args[2]);
				let ofpoke = this.getPokemon(kwargs.of);
				let fromeffect = Tools.getEffect(kwargs.from);
				if (fromeffect.id === 'protean' && !this.hasPreMoveMessage && this.waitForResult()) return;

				if (effect.effectType === 'Ability') {
					this.scene.abilityActivateAnim(poke, effect.name);
					this.message('', "<small>[" + poke.getName(true) + "'s " + effect.name + "!]</small>");
					poke.markAbility(effect.name);
				}
				if (kwargs.silent && effect.id !== 'typechange' && effect.id !== 'typeadd') {
					// do nothing
				} else {
					switch (effect.id) {
					case 'typechange':
						const types = Tools.escapeHTML(args[3]);
						poke.removeVolatile('typeadd' as ID);
						poke.addVolatile('typechange' as ID, types);
						if (kwargs.silent) {
							poke.sprite.updateStatbar(poke);
							break;
						}
						if (fromeffect.id) {
							if (fromeffect.id === 'colorchange' || fromeffect.id === 'protean') {
								this.scene.abilityActivateAnim(poke, fromeffect.name);
								this.message('', "<small>[" + poke.getName(true) + "'s " + fromeffect.name + "!]</small>");
								poke.markAbility(fromeffect.name);
								actions += "" + poke.getName() + " transformed into the " + types + " type!";
								this.hasPreMoveMessage = true;
							} else if (fromeffect.id === 'reflecttype') {
								poke.copyTypesFrom(ofpoke!);
								if (!kwargs.silent) actions += "" + poke.getName() + "'s type became the same as " + ofpoke!.getLowerName() + "'s type!";
							} else if (fromeffect.id === 'burnup') {
								actions += "" + poke.getName() + " burned itself out!";
							} else if (!kwargs.silent) {
								actions += "" + poke.getName() + "'s " + fromeffect.name + " made it the " + types + " type!";
							}
						} else {
							actions += "" + poke.getName() + " transformed into the " + types + " type!";
						}
						this.scene.resultAnim(poke, types.split('/').map(function (type) {
							return '<img src="' + Tools.resourcePrefix + 'sprites/types/' + type + '.png" alt="' + type + '" />';
						}).join(' '), 'neutral');
						break;
					case 'typeadd':
						const type = Tools.escapeHTML(args[3]);
						poke.addVolatile('typeadd' as ID, type);
						if (kwargs.silent) break;
						actions += "" + type + " type was added to " + poke.getLowerName() + "!";
						this.scene.resultAnim(poke, '<img src="' + Tools.resourcePrefix + 'sprites/types/' + type + '.png" alt="' + type + '" />', 'neutral');
						break;
					case 'powertrick':
						this.scene.resultAnim(poke, 'Power Trick', 'neutral');
						actions += "" + poke.getName() + " switched its Attack and Defense!";
						break;
					case 'foresight':
					case 'miracleeye':
						this.scene.resultAnim(poke, 'Identified', 'bad');
						actions += "" + poke.getName() + " was identified!";
						break;
					case 'telekinesis':
						this.scene.resultAnim(poke, 'Telekinesis', 'neutral');
						actions += "" + poke.getName() + " was hurled into the air!";
						break;
					case 'confusion':
						if (kwargs.already) {
							actions += "" + poke.getName() + " is already confused!";
						} else {
							this.scene.runStatusAnim('confused' as ID, [poke]);
							this.scene.resultAnim(poke, 'Confused', 'bad');
							if (kwargs.fatigue) {
								actions += "" + poke.getName() + " became confused due to fatigue!";
							} else {
								actions += "" + poke.getName() + " became confused!";
							}
						}
						break;
					case 'leechseed':
						poke.sprite.updateStatbar(poke);
						actions += '' + poke.getName() + ' was seeded!';
						break;
					case 'healblock':
						this.scene.resultAnim(poke, 'Heal Block', 'bad');
						actions += "" + poke.getName() + " was prevented from healing!";
						break;
					case 'mudsport':
						this.scene.resultAnim(poke, 'Mud Sport', 'neutral');
						actions += "Electricity's power was weakened!";
						break;
					case 'watersport':
						this.scene.resultAnim(poke, 'Water Sport', 'neutral');
						actions += "Fire's power was weakened!";
						break;
					case 'yawn':
						this.scene.resultAnim(poke, 'Drowsy', 'slp');
						actions += "" + poke.getName() + ' grew drowsy!';
						break;
					case 'flashfire':
						actions += 'The power of ' + poke.getLowerName() + '\'s Fire-type moves rose!';
						break;
					case 'taunt':
						this.scene.resultAnim(poke, 'Taunted', 'bad');
						actions += '' + poke.getName() + ' fell for the taunt!';
						break;
					case 'imprison':
						this.scene.resultAnim(poke, 'Imprisoning', 'good');
						actions += "" + poke.getName() + " sealed any moves its target shares with it!";
						break;
					case 'disable':
						if (fromeffect.effectType === 'Ability') {
							this.scene.abilityActivateAnim(ofpoke!, fromeffect.name);
							this.message('', "<small>[" + ofpoke!.getName(true) + "'s " + fromeffect.name + "!]</small>");
							ofpoke!.markAbility(fromeffect.name);
						}
						this.scene.resultAnim(poke, 'Disabled', 'bad');
						actions += "" + poke.getName() + "'s " + Tools.escapeHTML(args[3]) + " was disabled!";
						break;
					case 'embargo':
						this.scene.resultAnim(poke, 'Embargo', 'bad');
						actions += "" + poke.getName() + " can't use items anymore!";
						break;
					case 'torment':
						this.scene.resultAnim(poke, 'Tormented', 'bad');
						actions += '' + poke.getName() + ' was subjected to torment!';
						break;
					case 'ingrain':
						this.scene.resultAnim(poke, 'Ingrained', 'good');
						actions += '' + poke.getName() + ' planted its roots!';
						break;
					case 'aquaring':
						this.scene.resultAnim(poke, 'Aqua Ring', 'good');
						actions += '' + poke.getName() + ' surrounded itself with a veil of water!';
						break;
					case 'stockpile1':
						this.scene.resultAnim(poke, 'Stockpile', 'good');
						actions += '' + poke.getName() + ' stockpiled 1!';
						break;
					case 'stockpile2':
						poke.removeVolatile('stockpile1' as ID);
						this.scene.resultAnim(poke, 'Stockpile&times;2', 'good');
						actions += '' + poke.getName() + ' stockpiled 2!';
						break;
					case 'stockpile3':
						poke.removeVolatile('stockpile2' as ID);
						this.scene.resultAnim(poke, 'Stockpile&times;3', 'good');
						actions += '' + poke.getName() + ' stockpiled 3!';
						break;
					case 'perish0':
						poke.removeVolatile('perish1' as ID);
						actions += '' + poke.getName() + "'s perish count fell to 0.";
						break;
					case 'perish1':
						poke.removeVolatile('perish2' as ID);
						this.scene.resultAnim(poke, 'Perish next turn', 'bad');
						actions += '' + poke.getName() + "'s perish count fell to 1.";
						break;
					case 'perish2':
						poke.removeVolatile('perish3' as ID);
						this.scene.resultAnim(poke, 'Perish in 2', 'bad');
						actions += '' + poke.getName() + "'s perish count fell to 2.";
						break;
					case 'perish3':
						this.scene.resultAnim(poke, 'Perish in 3', 'bad');
						actions += '' + poke.getName() + "'s perish count fell to 3.";
						break;
					case 'encore':
						this.scene.resultAnim(poke, 'Encored', 'bad');
						actions += '' + poke.getName() + ' received an encore!';
						break;
					case 'bide':
						this.scene.resultAnim(poke, 'Bide', 'good');
						actions += "" + poke.getName() + " is storing energy!";
						break;
					case 'slowstart':
						actions += "" + poke.getName() + " can't get it going!";
						break;
					case 'attract':
						if (fromeffect.effectType === 'Ability') {
							this.scene.abilityActivateAnim(ofpoke!, fromeffect.name);
							this.message('', "<small>[" + ofpoke!.getName(true) + "'s " + fromeffect.name + "!]</small>");
							ofpoke!.markAbility(fromeffect.name);
						}
						this.scene.resultAnim(poke, 'Attracted', 'bad');
						if (fromeffect.effectType === 'Item') {
							actions += "" + poke.getName() + " fell in love from the " + fromeffect.name + "!";
						} else {
							actions += "" + poke.getName() + " fell in love!";
						}
						break;
					case 'autotomize':
						this.scene.resultAnim(poke, 'Lightened', 'good');
						actions += "" + poke.getName() + " became nimble!";
						break;
					case 'focusenergy':
						this.scene.resultAnim(poke, '+Crit rate', 'good');
						if (fromeffect.effectType === 'Item') {
							actions += "" + poke.getName() + " used the " + fromeffect.name + " to get pumped!";
						} else if (kwargs.zeffect) {
							actions += "" + poke.getName() + " boosted its critical-hit ratio using its Z-Power!";
						} else {
							actions += "" + poke.getName() + " is getting pumped!";
						}
						break;
					case 'curse':
						this.scene.resultAnim(poke, 'Cursed', 'bad');
						actions += "" + ofpoke!.getName() + " cut its own HP and put a curse on " + poke.getLowerName() + "!";
						break;
					case 'nightmare':
						this.scene.resultAnim(poke, 'Nightmare', 'bad');
						actions += "" + poke.getName() + " began having a nightmare!";
						break;
					case 'magnetrise':
						this.scene.resultAnim(poke, 'Magnet Rise', 'good');
						actions += "" + poke.getName() + " levitated with electromagnetism!";
						break;
					case 'smackdown':
						this.scene.resultAnim(poke, 'Smacked Down', 'bad');
						actions += "" + poke.getName() + " fell straight down!";
						poke.removeVolatile('magnetrise' as ID);
						poke.removeVolatile('telekinesis' as ID);
						if (poke.lastMove === 'fly' || poke.lastMove === 'bounce') poke.sprite.animReset();
						break;
					case 'substitute':
						if (kwargs.damage) {
							this.scene.resultAnim(poke, 'Damage', 'bad');
							actions += "The substitute took damage for " + poke.getLowerName() + "!";
						} else if (kwargs.block) {
							this.scene.resultAnim(poke, 'Blocked', 'neutral');
							actions += 'But it failed!';
						} else if (kwargs.already) {
							actions += '' + poke.getName() + ' already has a substitute!';
						} else {
							actions += '' + poke.getName() + ' put in a substitute!';
						}
						break;
					case 'uproar':
						if (kwargs.upkeep) {
							actions += "" + poke.getName() + " is making an uproar!";
						} else {
							actions += "" + poke.getName() + " caused an uproar!";
						}
						break;
					case 'doomdesire':
						actions += '' + poke.getName() + ' chose Doom Desire as its destiny!';
						break;
					case 'futuresight':
						actions += '' + poke.getName() + ' foresaw an attack!';
						break;
					case 'mimic':
						actions += '' + poke.getName() + ' learned ' + Tools.escapeHTML(args[3]) + '!';
						break;
					case 'laserfocus':
						actions += '' + poke.getName() + ' concentrated intensely!';
						break;
					case 'followme':
					case 'ragepowder': // Deprecated, now uses -singleturn
						actions += '' + poke.getName() + ' became the center of attention!';
						break;
					case 'powder': // Deprecated, now uses -singleturn
						actions += '' + poke.getName() + ' is covered in powder!';
						break;

					// Gen 1
					case 'lightscreen':
						this.scene.resultAnim(poke, 'Light Screen', 'good');
						actions += '' + poke.getName() + '\'s protected against special attacks!';
						break;
					case 'reflect':
						this.scene.resultAnim(poke, 'Reflect', 'good');
						actions += '' + poke.getName() + ' gained armor!';
						break;

					default:
						actions += "" + poke.getName() + "'s " + effect.name + " started!";
					}
				}
				poke.addVolatile(effect.id);
				poke.sprite.updateStatbar(poke);
				break;
			} case '-end': {
				let poke = this.getPokemon(args[1])!;
				let effect = Tools.getEffect(args[2]);
				let fromeffect = Tools.getEffect(kwargs.from);
				poke.removeVolatile(effect.id);

				if (kwargs.silent) {
					// do nothing
				} else {
					switch (effect.id) {
					case 'powertrick':
						this.scene.resultAnim(poke, 'Power Trick', 'neutral');
						actions += "" + poke.getName() + " switched its Attack and Defense!";
						break;
					case 'telekinesis':
						this.scene.resultAnim(poke, 'Telekinesis&nbsp;ended', 'neutral');
						actions += "" + poke.getName() + " was freed from the telekinesis!";
						break;
					case 'skydrop':
						if (kwargs.interrupt) {
							poke.sprite.anim({time: 100});
						}
						actions += "" + poke.getName() + " was freed from the Sky Drop!";
						break;
					case 'confusion':
						this.scene.resultAnim(poke, 'Confusion&nbsp;ended', 'good');
						if (!kwargs.silent) {
							if (fromeffect.effectType === 'Item') {
								actions += "" + poke.getName() + "'s " + fromeffect.name + " snapped it out of its confusion!";
								break;
							}
							if (poke.side.n === 0) actions += "" + poke.getName() + " snapped out of its confusion.";
							else actions += "" + poke.getName() + " snapped out of confusion!";
						}
						break;
					case 'leechseed':
						if (fromeffect.id === 'rapidspin') {
							this.scene.resultAnim(poke, 'De-seeded', 'good');
							actions += "" + poke.getName() + " was freed from Leech Seed!";
						}
						break;
					case 'healblock':
						this.scene.resultAnim(poke, 'Heal Block ended', 'good');
						actions += "" + poke.getName() + "'s Heal Block wore off!";
						break;
					case 'attract':
						this.scene.resultAnim(poke, 'Attract&nbsp;ended', 'good');
						if (fromeffect.id === 'oblivious') {
							actions += '' + poke.getName() + " got over its infatuation.";
						}
						if (fromeffect.id === 'mentalherb') {
							actions += "" + poke.getName() + " cured its infatuation status using its " + fromeffect.name + "!";
						}
						break;
					case 'taunt':
						this.scene.resultAnim(poke, 'Taunt&nbsp;ended', 'good');
						actions += '' + poke.getName() + "'s taunt wore off!";
						break;
					case 'disable':
						this.scene.resultAnim(poke, 'Disable&nbsp;ended', 'good');
						actions += '' + poke.getName() + "'s move is no longer disabled!";
						break;
					case 'embargo':
						this.scene.resultAnim(poke, 'Embargo ended', 'good');
						actions += "" + poke.getName() + " can use items again!";
						break;
					case 'torment':
						this.scene.resultAnim(poke, 'Torment&nbsp;ended', 'good');
						actions += '' + poke.getName() + "'s torment wore off!";
						break;
					case 'encore':
						this.scene.resultAnim(poke, 'Encore&nbsp;ended', 'good');
						actions += '' + poke.getName() + "'s encore ended!";
						break;
					case 'bide':
						this.scene.runOtherAnim('bideunleash' as ID, [poke]);
						actions += "" + poke.getName() + " unleashed its energy!";
						break;
					case 'illusion':
						this.scene.resultAnim(poke, 'Illusion ended', 'bad');
						actions += "" + poke.getName() + "'s illusion wore off!";
						poke.markAbility('Illusion');
						break;
					case 'slowstart':
						this.scene.resultAnim(poke, 'Slow Start ended', 'good');
						actions += "" + poke.getName() + " finally got its act together!";
						break;
					case 'magnetrise':
						if (poke.side.n === 0) actions += "" + poke.getName() + "'s electromagnetism wore off!";
						else actions += "The electromagnetism of " + poke.getLowerName() + " wore off!";
						break;
					case 'perishsong': // for backwards compatibility
						poke.removeVolatile('perish3' as ID);
						break;
					case 'substitute':
						this.scene.resultAnim(poke, 'Faded', 'bad');
						actions += '' + poke.getName() + "'s substitute faded!";
						break;
					case 'uproar':
						actions += "" + poke.getName() + " calmed down.";
						break;
					case 'stockpile':
						poke.removeVolatile('stockpile1' as ID);
						poke.removeVolatile('stockpile2' as ID);
						poke.removeVolatile('stockpile3' as ID);
						actions += "" + poke.getName() + "'s stockpiled effect wore off!";
						break;
					case 'bind':
					case 'wrap':
					case 'clamp':
					case 'whirlpool':
					case 'firespin':
					case 'magmastorm':
					case 'sandtomb':
					case 'infestation':
						actions += '' + poke.getName() + ' was freed from ' + effect.name + '!';
						break;
					default:
						if (effect.effectType === 'Move') {
							if (effect.name === 'Doom Desire') {
								this.scene.runOtherAnim('doomdesirehit' as ID, [poke]);
							}
							if (effect.name === 'Future Sight') {
								this.scene.runOtherAnim('futuresighthit' as ID, [poke]);
							}
							actions += '' + poke.getName() + " took the " + effect.name + " attack!";
						} else {
							actions += "" + poke.getName() + "'s " + effect.name + " ended!";
						}
					}
				}
				poke.sprite.updateStatbar(poke);
				break;
			} case '-singleturn': {
				let poke = this.getPokemon(args[1])!;
				let effect = Tools.getEffect(args[2]);
				let ofpoke = this.getPokemon(kwargs.of);
				let fromeffect = Tools.getEffect(kwargs.from);
				poke.addTurnstatus(effect.id);

				switch (effect.id) {
				case 'roost':
					this.scene.resultAnim(poke, 'Landed', 'neutral');
					//actions += '' + poke.getName() + ' landed on the ground!';
					break;
				case 'quickguard':
					this.scene.resultAnim(poke, 'Quick Guard', 'good');
					actions += "Quick Guard protected " + poke.side.getLowerTeamName() + "!";
					break;
				case 'wideguard':
					this.scene.resultAnim(poke, 'Wide Guard', 'good');
					actions += "Wide Guard protected " + poke.side.getLowerTeamName() + "!";
					break;
				case 'craftyshield':
					this.scene.resultAnim(poke, 'Crafty Shield', 'good');
					actions += "Crafty Shield protected " + poke.side.getLowerTeamName() + "!";
					break;
				case 'matblock':
					this.scene.resultAnim(poke, 'Mat Block', 'good');
					actions += '' + poke.getName() + ' intends to flip up a mat and block incoming attacks!';
					break;
				case 'protect':
					this.scene.resultAnim(poke, 'Protected', 'good');
					actions += '' + poke.getName() + ' protected itself!';
					break;
				case 'endure':
					this.scene.resultAnim(poke, 'Enduring', 'good');
					actions += '' + poke.getName() + ' braced itself!';
					break;
				case 'helpinghand':
					this.scene.resultAnim(poke, 'Helping Hand', 'good');
					actions += '' + ofpoke!.getName() + " is ready to help " + poke.getLowerName() + "!";
					break;
				case 'focuspunch':
					this.scene.resultAnim(poke, 'Focusing', 'neutral');
					actions += '' + poke.getName() + ' is tightening its focus!';
					poke.markMove(effect.name, 0);
					break;
				case 'shelltrap':
					this.scene.resultAnim(poke, 'Trap set', 'neutral');
					actions += '' + poke.getName() + ' set a shell trap!';
					poke.markMove(effect.name, 0);
					break;
				case 'snatch':
					actions += '' + poke.getName() + ' waits for a target to make a move!';
					break;
				case 'magiccoat':
					actions += '' + poke.getName() + ' shrouded itself with Magic Coat!';
					break;
				case 'electrify':
					actions += '' + poke.getName() + '\'s moves have been electrified!';
					break;
				case 'followme':
				case 'ragepowder':
				case 'spotlight':
					if (kwargs.zeffect) {
						actions += '' + poke.getName() + ' became the center of attention using its Z-Power!';
					} else {
						actions += '' + poke.getName() + ' became the center of attention!';
					}
					break;
				case 'powder':
					actions += '' + poke.getName() + ' is covered in powder!';
					break;
				case 'instruct':
					actions += '' + poke.getName() + ' used the move instructed by ' + ofpoke!.getLowerName() + '!';
					break;
				case 'beakblast':
					this.scene.runOtherAnim('bidecharge' as ID, [poke]);
					this.scene.resultAnim(poke, 'Beak Blast', 'neutral');
					actions += '' + poke.getName() + ' started heating up its beak!';
					break;
				}
				poke.sprite.updateStatbar(poke);
				break;
			} case '-singlemove': {
				let poke = this.getPokemon(args[1])!;
				let effect = Tools.getEffect(args[2]);
				let ofpoke = this.getPokemon(kwargs.of);
				let fromeffect = Tools.getEffect(kwargs.from);
				poke.addMovestatus(effect.id);

				switch (effect.id) {
				case 'grudge':
					this.scene.resultAnim(poke, 'Grudge', 'neutral');
					actions += '' + poke.getName() + ' wants its target to bear a grudge!';
					break;
				case 'destinybond':
					this.scene.resultAnim(poke, 'Destiny Bond', 'neutral');
					actions += '' + poke.getName() + ' is hoping to take its attacker down with it!';
					break;
				}
				break;

			} case '-activate': {
				let poke = this.getPokemon(args[1])!;
				let effect = Tools.getEffect(args[2]);
				let ofpoke = this.getPokemon(kwargs.of);
				if ((effect.id === 'confusion' || effect.id === 'attract') && !this.hasPreMoveMessage && this.waitForResult()) return;
				if (effect.effectType === 'Ability') {
					this.scene.abilityActivateAnim(poke, effect.name);
					this.message('', "<small>[" + poke.getName(true) + "'s " + effect.name + "!]</small>");
					poke.markAbility(effect.name);
				}
				switch (effect.id) {
				case 'healreplacement':
					actions += "" + poke.getName() + " will restore its replacement's HP using its Z-Power!";
					break;
				case 'confusion':
					actions += "" + poke.getName() + " is confused!";
					this.hasPreMoveMessage = true;
					break;
				case 'destinybond':
					actions += '' + poke.getName() + ' took its attacker down with it!';
					break;
				case 'snatch':
					actions += "" + poke.getName() + " snatched " + ofpoke!.getLowerName() + "'s move!";
					break;
				case 'grudge':
					actions += "" + poke.getName() + "'s " + Tools.escapeHTML(args[3]) + " lost all of its PP due to the grudge!";
					poke.markMove(args[3], Infinity);
					break;
				case 'quickguard':
					poke.addTurnstatus('quickguard' as ID);
					this.scene.resultAnim(poke, 'Quick Guard', 'good');
					actions += "Quick Guard protected " + poke.getLowerName() + "!";
					break;
				case 'wideguard':
					poke.addTurnstatus('wideguard' as ID);
					this.scene.resultAnim(poke, 'Wide Guard', 'good');
					actions += "Wide Guard protected " + poke.getLowerName() + "!";
					break;
				case 'craftyshield':
					poke.addTurnstatus('craftyshield' as ID);
					this.scene.resultAnim(poke, 'Crafty Shield', 'good');
					actions += "Crafty Shield protected " + poke.getLowerName() + "!";
					break;
				case 'protect':
					poke.addTurnstatus('protect' as ID);
					this.scene.resultAnim(poke, 'Protected', 'good');
					actions += '' + poke.getName() + ' protected itself!';
					break;
				case 'substitute':
					if (kwargs.damage) {
						this.scene.resultAnim(poke, 'Damage', 'bad');
						actions += 'The substitute took damage for ' + poke.getLowerName() + '!';
					} else if (kwargs.block) {
						this.scene.resultAnim(poke, 'Blocked', 'neutral');
						actions += '' + poke.getName() + "'s Substitute blocked " + Tools.getMove(kwargs.block || args[3]).name + '!';
					}
					break;
				case 'attract':
					this.scene.runStatusAnim('attracted' as ID, [poke]);
					actions += '' + poke.getName() + ' is in love with ' + ofpoke!.getLowerName() + '!';
					this.hasPreMoveMessage = true;
					break;
				case 'bide':
					this.scene.runOtherAnim('bidecharge' as ID, [poke]);
					actions += "" + poke.getName() + " is storing energy!";
					break;
				case 'mist':
					actions += "" + poke.getName() + " is protected by the mist!";
					break;
				case 'safeguard':
					actions += "" + poke.getName() + " is protected by Safeguard!";
					break;
				case 'trapped':
					actions += "" + poke.getName() + " can no longer escape!";
					break;
				case 'stickyweb':
					actions += '' + poke.getName() + ' was caught in a sticky web!';
					break;
				case 'happyhour':
					actions += 'Everyone is caught up in the happy atmosphere!';
					break;
				case 'celebrate':
					actions += 'Congratulations, ' + Tools.escapeHTML(poke.side.name) + '!';
					break;

				// move activations
				case 'aromatherapy':
					this.scene.resultAnim(poke, 'Team Cured', 'good');
					actions += 'A soothing aroma wafted through the area!';
					break;
				case 'healbell':
					this.scene.resultAnim(poke, 'Team Cured', 'good');
					actions += 'A bell chimed!';
					break;
				case 'trick':
				case 'switcheroo':
					actions += '' + poke.getName() + ' switched items with its target!';
					break;
				case 'brickbreak':
					actions += poke.getName() + " shattered " + ofpoke!.side.getTeamName() + " protections!";
					ofpoke!.side.removeSideCondition('Reflect');
					ofpoke!.side.removeSideCondition('LightScreen');
					break;
				case 'beatup':
					actions += "" + Tools.escapeHTML(kwargs.of) + "'s attack!";
					break;
				case 'pursuit':
					actions += "(" + poke.getName() + " is being withdrawn!)";
					break;
				case 'hyperspacefury':
				case 'hyperspacehole':
				case 'phantomforce':
				case 'shadowforce':
				case 'feint':
					this.scene.resultAnim(poke, 'Protection broken', 'bad');
					if (kwargs.broken) {
						actions += "It broke through " + poke.getLowerName() + "'s protection!";
					} else {
						actions += "" + poke.getName() + " fell for the feint!";
					}
					poke.removeTurnstatus('protect' as ID);
					for (const target of poke.side.pokemon) {
						target.removeTurnstatus('wideguard' as ID);
						target.removeTurnstatus('quickguard' as ID);
						target.removeTurnstatus('craftyshield' as ID);
						target.removeTurnstatus('matblock' as ID);
						target.sprite.updateStatbar(target);
					}
					break;
				case 'spite':
					let move = Tools.getMove(args[3]).name;
					let pp = Tools.escapeHTML(args[4]);
					actions += "It reduced the PP of " + poke.getLowerName() + "'s " + move + " by " + pp + "!";
					poke.markMove(move, Number(pp));
					break;
				case 'gravity':
					actions += "" + poke.getName() + " couldn't stay airborne because of gravity!";
					poke.removeVolatile('magnetrise' as ID);
					poke.removeVolatile('telekinesis' as ID);
					poke.sprite.anim({time: 100});
					break;
				case 'magnitude':
					actions += "Magnitude " + Tools.escapeHTML(args[3]) + "!";
					break;
				case 'sketch':
					actions += "" + poke.getName() + " sketched " + Tools.escapeHTML(args[3]) + "!";
					break;
				case 'skillswap':
					actions += "" + poke.getName() + " swapped Abilities with its target!";
					if (this.gen <= 4) break;
					let pokeability = Tools.escapeHTML(args[3]) || ofpoke!.ability;
					let ofpokeability = Tools.escapeHTML(args[4]) || poke.ability;
					if (pokeability) {
						poke.ability = pokeability;
						if (!ofpoke!.baseAbility) ofpoke!.baseAbility = pokeability;
					}
					if (ofpokeability) {
						ofpoke!.ability = ofpokeability;
						if (!poke.baseAbility) poke.baseAbility = ofpokeability;
					}
					if (poke.side !== ofpoke!.side) {
						this.scene.abilityActivateAnim(poke, pokeability);
						this.scene.abilityActivateAnim(ofpoke!, ofpokeability);
						actions += "<br />" + poke.getName() + " acquired " + pokeability + "!";
						actions += "<br />" + ofpoke!.getName() + " acquired " + ofpokeability + "!";
					}
					break;
				case 'charge':
					actions += "" + poke.getName() + " began charging power!";
					break;
				case 'struggle':
					actions += "" + poke.getName() + " has no moves left!";
					break;
				case 'bind':
					actions += '' + poke.getName() + ' was squeezed by ' + ofpoke!.getLowerName() + '!';
					break;
				case 'wrap':
					actions += '' + poke.getName() + ' was wrapped by ' + ofpoke!.getLowerName() + '!';
					break;
				case 'clamp':
					actions += '' + ofpoke!.getName() + ' clamped down on ' + poke.getLowerName() + '!';
					break;
				case 'whirlpool':
					actions += '' + poke.getName() + ' became trapped in the vortex!';
					break;
				case 'firespin':
					actions += '' + poke.getName() + ' became trapped in the fiery vortex!';
					break;
				case 'magmastorm':
					actions += '' + poke.getName() + ' became trapped by swirling magma!';
					break;
				case 'sandtomb':
					actions += '' + poke.getName() + ' became trapped by the quicksand!';
					break;
				case 'infestation':
					actions += '' + poke.getName() + ' has been afflicted with an infestation by ' + ofpoke!.getLowerName() + '!';
					break;
				case 'afteryou':
					actions += '' + poke.getName() + ' took the kind offer!';
					break;
				case 'quash':
					actions += "" + poke.getName() + "'s move was postponed!";
					break;
				case 'powersplit':
					actions += '' + poke.getName() + ' shared its power with the target!';
					break;
				case 'guardsplit':
					actions += '' + poke.getName() + ' shared its guard with the target!';
					break;
				case 'speedswap':
					actions += '' + poke.getName() + ' switched Speed with its target!';
					break;
				case 'ingrain':
					actions += '' + poke.getName() + ' anchored itself with its roots!';
					break;
				case 'matblock':
					actions += '' + Tools.escapeHTML(args[3]) + ' was blocked by the kicked-up mat!';
					break;
				case 'powder':
					actions += 'When the flame touched the powder on the Pokémon, it exploded!';
					break;
				case 'fairylock':
					actions += 'No one will be able to run away during the next turn!';
					break;
				case 'lockon':
				case 'mindreader':
					actions += '' + poke.getName() + ' took aim at ' + ofpoke!.getLowerName() + '!';
					break;
				case 'endure':
					actions += '' + poke.getName() + ' endured the hit!';
					break;
				case 'electricterrain':
					actions += '' + poke.getName() + ' surrounds itself with electrified terrain!';
					break;
				case 'mistyterrain':
					actions += '' + poke.getName() + ' surrounds itself with a protective mist!';
					break;
				case 'psychicterrain':
					actions += '' + poke.getName() + ' surrounds itself with psychic terrain!';
					break;

				// ability activations
				case 'magicbounce':
				case 'magiccoat':
				case 'rebound':
					break;
				case 'wonderguard': // Deprecated, now uses -immune
					this.scene.resultAnim(poke, 'Immune', 'neutral');
					actions += '' + poke.getName() + '\'s Wonder Guard evades the attack!';
					break;
				case 'forewarn':
					if (this.gen >= 5) {
						actions += "It was alerted to " + ofpoke!.getLowerName() + "'s " + Tools.escapeHTML(args[3]) + "!";
						ofpoke!.markMove(args[3], 0);
					} else {
						actions += "" + poke.getName() + "'s Forewarn alerted it to " + Tools.escapeHTML(args[3]) + "!";
						let foeActive = [] as Pokemon[];
						for (const target of poke.side.foe.active) if (target) foeActive.push(target);
						if (foeActive.length === 1) {
							foeActive[0].markMove(args[3], 0);
						}
					}
					break;
				case 'mummy':
					if (!args[3]) break; // if Mummy activated but failed, no ability will have been sent
					let ability = Tools.getAbility(args[3]);
					this.scene.abilityActivateAnim(ofpoke!, ability.name);
					this.scene.wait(700);
					this.message('', "<small>[" + ofpoke!.getName(true) + "'s " + ability.name + "!]</small>");
					ofpoke!.markAbility(ability.name);
					this.scene.abilityActivateAnim(ofpoke!, 'Mummy');
					this.message('', "<small>[" + ofpoke!.getName(true) + "'s Mummy!]</small>");
					ofpoke!.markAbility('Mummy', true);
					actions += "" + ofpoke!.getName() + "'s Ability became Mummy!";
					break;
				case 'anticipation': // Deprecated, now uses -ability. This is for replay compatability
					actions += "" + poke.getName() + " shuddered!";
					break;
				case 'lightningrod':
				case 'stormdrain':
					actions += '' + poke.getName() + ' took the attack!';
					break;
				case 'telepathy':
					actions += "" + poke.getName() + " avoids attacks by its ally Pok&#xE9;mon!";
					break;
				case 'stickyhold':
					actions += "" + poke.getName() + "'s item cannot be removed!";
					break;
				case 'suctioncups':
					actions += '' + poke.getName() + ' anchors itself!';
					break;
				case 'symbiosis':
					actions += '' + poke.getName() + ' shared its ' + Tools.getItem(args[3]).name + ' with ' + ofpoke!.getLowerName() + '!';
					break;
				case 'aromaveil':
					actions += '' + ofpoke!.getName() + ' is protected by an aromatic veil!';
					break;
				case 'flowerveil':
					actions += '' + ofpoke!.getName() + ' surrounded itself with a veil of petals!';
					break;
				case 'sweetveil':
					actions += '' + ofpoke!.getName() + ' surrounded itself with a veil of sweetness!';
					break;
				case 'battlebond':
					actions += '' + poke.getName() + ' became fully charged due to its bond with its Trainer!';
					break;
				case 'disguise':
					actions += 'Its disguise served it as a decoy!';
					break;
				case 'powerconstruct':
					actions += 'You sense the presence of many!';
					break;
				case 'persistent': // CAP
					actions += '' + poke.getName() + ' extends ' + Tools.getMove(args[3]).name + ' by 2 turns!';
					break;

				// weather activations
				case 'deltastream':
					actions += "The mysterious strong winds weakened the attack!";
					break;

				// item activations
				case 'custapberry':
				case 'quickclaw':
					//actions += '' + poke.getName() + ' is already preparing its next move!';
					actions += '' + poke.getName() + '\'s ' + effect.name + ' let it move first!';
					break;
				case 'leppaberry':
				case 'mysteryberry':
					actions += '' + poke.getName() + " restored PP to its " + Tools.escapeHTML(args[3]) + " move using " + effect.name + "!";
					poke.markMove(args[3], effect.id === 'leppaberry' ? -10 : -5);
					break;
				case 'focusband':
					poke.item = 'Focus Band';
					actions += '' + poke.getName() + " hung on using its Focus Band!";
					break;
				case 'safetygoggles':
					poke.item = 'Safety Goggles';
					actions += '' + poke.getName() + " is not affected by " + Tools.escapeHTML(args[3]) + " thanks to its Safety Goggles!";
					break;
				case 'protectivepads':
					poke.item = 'Protective Pads';
					actions += '' + poke.getName() + " protected itself with the Protective Pads!";
					break;
				default:
					if (kwargs.broken) { // for custom moves that break protection
						this.scene.resultAnim(poke, 'Protection broken', 'bad');
						actions += "It broke through " + poke.getLowerName() + "'s protection!";
					} else if (effect.effectType !== 'Ability') {
						actions += "" + poke.getName() + "'s " + effect.name + " activated!";
					}
				}
				break;

			} case '-sidestart': {
				let side = this.getSide(args[1]);
				let effect = Tools.getEffect(args[2]);
				side.addSideCondition(effect);

				switch (effect.id) {
				case 'stealthrock':
					actions += "Pointed stones float in the air around " + side.getLowerTeamName() + "!";
					break;
				case 'spikes':
					actions += "Spikes were scattered on the ground all around " + side.getLowerTeamName() + "!";
					break;
				case 'toxicspikes':
					actions += "Poison spikes were scattered on the ground all around " + side.getLowerTeamName() + "!";
					break;
				case 'stickyweb':
					actions += "A sticky web spreads out on the ground around " + side.getLowerTeamName() + "!";
					break;
				case 'tailwind':
					actions += "The Tailwind blew from behind " + side.getLowerTeamName() + "!";
					this.scene.updateWeather();
					break;
				case 'auroraveil':
					actions += "Aurora Veil made " + side.getLowerTeamName() + " stronger against physical and special moves!";
					this.scene.updateWeather();
					break;
				case 'reflect':
					actions += "Reflect made " + side.getLowerTeamName() + " stronger against physical moves!";
					this.scene.updateWeather();
					break;
				case 'lightscreen':
					actions += "Light Screen made " + side.getLowerTeamName() + " stronger against special moves!";
					this.scene.updateWeather();
					break;
				case 'safeguard':
					actions += "" + side.getTeamName() + " cloaked itself in a mystical veil!";
					this.scene.updateWeather();
					break;
				case 'mist':
					actions += "" + side.getTeamName() + " became shrouded in mist!";
					this.scene.updateWeather();
					break;
				case 'luckychant':
					actions += 'Lucky Chant shielded ' + side.getLowerTeamName() + ' from critical hits!';
					break;
				case 'firepledge':
					actions += "A sea of fire enveloped " + side.getLowerTeamName() + "!";
					break;
				case 'waterpledge':
					actions += "A rainbow appeared in the sky on " + side.getLowerTeamName() + "'s side!";
					break;
				case 'grasspledge':
					actions += "A swamp enveloped " + side.getLowerTeamName() + "!";
					break;
				default:
					actions += "" + effect.name + " started!";
					break;
				}
				break;
			} case '-sideend': {
				let side = this.getSide(args[1]);
				let effect = Tools.getEffect(args[2]);
				let from = Tools.getEffect(kwargs.from);
				let ofpoke = this.getPokemon(kwargs.of);
				side.removeSideCondition(effect.name);

				switch (effect.id) {
				case 'stealthrock':
					actions += "The pointed stones disappeared from around " + side.getLowerTeamName() + "!";
					break;
				case 'spikes':
					actions += "The spikes disappeared from the ground around " + side.getLowerTeamName() + "!";
					break;
				case 'toxicspikes':
					actions += "The poison spikes disappeared from the ground around " + side.getLowerTeamName() + "!";
					break;
				case 'stickyweb':
					actions += "The sticky web has disappeared from the ground around " + side.getLowerTeamName() + "!";
					break;
				case 'tailwind':
					actions += "" + side.getTeamName() + "'s Tailwind petered out!";
					break;
				case 'auroraveil':
					actions += "" + side.getTeamName() + "'s Aurora Veil wore off!";
					break;
				case 'reflect':
					actions += "" + side.getTeamName() + "'s Reflect wore off!";
					break;
				case 'lightscreen':
					actions += "" + side.getTeamName() + "'s Light Screen wore off!";
					break;
				case 'safeguard':
					actions += "" + side.getTeamName() + " is no longer protected by Safeguard!";
					break;
				case 'mist':
					actions += "" + side.getTeamName() + " is no longer protected by mist!";
					break;
				case 'luckychant':
					actions += "" + side.getTeamName() + "'s Lucky Chant wore off!";
					break;
				case 'firepledge':
					actions += "The sea of fire around " + side.getLowerTeamName() + " disappeared!";
					break;
				case 'waterpledge':
					actions += "The rainbow on " + side.getLowerTeamName() + "'s side disappeared!";
					break;
				case 'grasspledge':
					actions += "The swamp around " + side.getLowerTeamName() + " disappeared!";
					break;
				default:
					actions += "" + effect.name + " ended!";
					break;
				}
				break;

			} case '-weather': {
				let effect = Tools.getEffect(args[1]);
				let poke = this.getPokemon(kwargs.of) || undefined;
				let ability = Tools.getEffect(kwargs.from);
				this.changeWeather(effect.name, poke, !!kwargs.upkeep, ability);
				break;

			} case '-fieldstart': {
				let effect = Tools.getEffect(args[1]);
				let poke = this.getPokemon(kwargs.of);
				let fromeffect = Tools.getEffect(kwargs.from);
				if (fromeffect && fromeffect.effectType === 'Ability') {
					this.scene.abilityActivateAnim(poke!, fromeffect.name);
					this.message('', "<small>[" + poke!.getName(true) + "'s " + fromeffect.name + "!]</small>");
					poke!.markAbility(fromeffect.name);
				}
				let maxTimeLeft = 0;
				if (effect.id in {'electricterrain': 1, 'grassyterrain': 1, 'mistyterrain': 1, 'psychicterrain': 1}) {
					for (let i = this.pseudoWeather.length - 1; i >= 0; i--) {
						let pwName = this.pseudoWeather[i][0];
						if (pwName === 'Electric Terrain' || pwName === 'Grassy Terrain' || pwName === 'Misty Terrain' || pwName === 'Psychic Terrain') {
							this.pseudoWeather.splice(i, 1);
							continue;
						}
					}
					if (this.gen > 6) maxTimeLeft = 8;
				}
				this.addPseudoWeather(effect.name, 5, maxTimeLeft);

				switch (effect.id) {
				case 'wonderroom':
					actions += "It created a bizarre area in which Defense and Sp. Def stats are swapped!";
					break;
				case 'magicroom':
					actions += "It created a bizarre area in which Pok&#xE9;mon's held items lose their effects!";
					break;
				case 'gravity':
					if (!this.fastForward) {
						for (const side of this.sides) for (const active of side.active) {
							if (active) {
								this.scene.runOtherAnim('gravity' as ID, [active]);
							}
						}
					}
					actions += "Gravity intensified!";
					break;
				case 'mudsport':
					actions += "Electricity's power was weakened!";
					break;
				case 'watersport':
					actions += "Fire's power was weakened!";
					break;
				case 'grassyterrain':
					actions += "Grass grew to cover the battlefield!";
					break;
				case 'mistyterrain':
					actions += "Mist swirls around the battlefield!";
					break;
				case 'electricterrain':
					actions += "An electric current runs across the battlefield!";
					break;
				case 'psychicterrain':
					actions += "The battlefield got weird!";
					break;
				case 'trickroom':
					if (poke) {
						actions += "" + poke.getName() + ' twisted the dimensions!';
						break;
					}
					// falls through
				default:
					actions += effect.name + " started!";
					break;
				}
				break;

			} case '-fieldend': {
				let effect = Tools.getEffect(args[1]);
				let poke = this.getPokemon(kwargs.of);
				this.removePseudoWeather(effect.name);

				switch (effect.id) {
				case 'trickroom':
					actions += 'The twisted dimensions returned to normal!';
					break;
				case 'wonderroom':
					actions += 'Wonder Room wore off, and Defense and Sp. Def stats returned to normal!';
					break;
				case 'magicroom':
					actions += "Magic Room wore off, and held items' effects returned to normal!";
					break;
				case 'gravity':
					actions += 'Gravity returned to normal!';
					break;
				case 'mudsport':
					actions += 'The effects of Mud Sport have faded.';
					break;
				case 'watersport':
					actions += 'The effects of Water Sport have faded.';
					break;
				case 'grassyterrain':
					actions += "The grass disappeared from the battlefield.";
					break;
				case 'mistyterrain':
					actions += "The mist disappeared from the battlefield.";
					break;
				case 'electricterrain':
					actions += "The electricity disappeared from the battlefield.";
					break;
				case 'psychicterrain':
					actions += "The weirdness disappeared from the battlefield!";
					break;
				default:
					actions += effect.name + " ended!";
					break;
				}
				break;

			} case '-fieldactivate': {
				let effect = Tools.getEffect(args[1]);
				switch (effect.id) {
				case 'perishsong':
					actions += 'All Pok&#xE9;mon that heard the song will faint in three turns!';
					this.scene.updateStatbars();
					break;
				case 'payday':
					actions += 'Coins were scattered everywhere!';
					break;
				case 'iondeluge':
					actions += 'A deluge of ions showers the battlefield!';
					break;
				default:
					actions += '' + effect.name + ' hit!';
					break;
				}
				break;

			} case '-message': {
				actions += Tools.escapeHTML(args[1]);
				break;

			} case '-anim': {
				let poke = this.getPokemon(args[1])!;
				let move = Tools.getMove(args[2]);
				if (this.checkActive(poke)) return;
				let poke2 = this.getPokemon(args[3]);
				poke.sprite.beforeMove();
				kwargs.silent = '.';
				this.useMove(poke, move, poke2, kwargs);
				poke.sprite.afterMove();
				break;

			} case '-hint': {
				this.message('', '<small>(' + Tools.escapeHTML(args[1]) + ')</small>');
				break;

			} default: {
				if (this.errorCallback) this.errorCallback(this);
				break;
			}}
			if (actions && actions.slice(-1) !== '>') actions += '<br />';
		}
		if (actions) {
			if (actions.slice(-6) === '<br />') actions = actions.slice(0, -6);
			this.message('<small>' + actions + '</small>', '');
		}
	}
	/*
	parseSpriteData(name) {
		let siden = 0,
			foe = false;
		while (true) {
			if (name.substr(0, 6) === 'foeof-') {
				foe = true;
				name = name.substr(6);
			} else if (name.substr(0, 9) === 'switched-') name = name.substr(9);
			else if (name.substr(0, 9) === 'existing-') name = name.substr(9);
			else if (name.substr(0, 4) === 'foe-') {
				siden = this.p2.n;
				name = name.substr(4);
			} else if (name.substr(0, 5) === 'ally-') {
				siden = this.p1.n;
				name = name.substr(5);
			} else break;
		}
		if (name.substr(name.length - 1) === ')') {
			let parenIndex = name.lastIndexOf('(');
			if (parenIndex > 0) {
				let species = name.substr(parenIndex + 1);
				name = species.substr(0, species.length - 1);
			}
		}
		if (foe) siden = (siden ? 0 : 1);

		let data = Tools.getTemplate(name);
		return data.spriteData[siden];
	}
	*/
	parseDetails(name: string, pokemonid: string, details = "", output: any = {}) {
		output.details = details;
		output.name = name;
		output.species = name;
		output.level = 100;
		output.shiny = false;
		output.gender = '';
		output.ident = (name ? pokemonid : '');
		output.searchid = (name ? (pokemonid + '|' + details) : '');
		let splitDetails = details.split(', ');
		if (splitDetails[splitDetails.length - 1] === 'shiny') {
			output.shiny = true;
			splitDetails.pop();
		}
		if (splitDetails[splitDetails.length - 1] === 'M' || splitDetails[splitDetails.length - 1] === 'F') {
			output.gender = splitDetails[splitDetails.length - 1];
			splitDetails.pop();
		}
		if (splitDetails[1]) {
			output.level = parseInt(splitDetails[1].substr(1), 10) || 100;
		}
		if (splitDetails[0]) {
			output.species = splitDetails[0];
		}
		return output;
	}
	parseHealth(hpstring: string, output: any = {}): {hp: number, maxhp: number, hpcolor: HPColor | '', status: StatusName | '', fainted?: boolean} | null {
		let [hp, status] = hpstring.split(' ');

		// hp parse
		output.hpcolor = '';
		if (hp === '0' || hp === '0.0') {
			if (!output.maxhp) output.maxhp = 100;
			output.hp = 0;
		} else if (hp.indexOf('/') > 0) {
			let [curhp, maxhp] = hp.split('/');
			if (isNaN(parseFloat(curhp)) || isNaN(parseFloat(maxhp))) {
				return null;
			}
			output.hp = parseFloat(curhp);
			output.maxhp = parseFloat(maxhp);
			if (output.hp > output.maxhp) output.hp = output.maxhp;
			const colorchar = maxhp.slice(-1);
			if (colorchar === 'y' || colorchar === 'g') {
				output.hpcolor = colorchar;
			}
		} else if (!isNaN(parseFloat(hp))) {
			if (!output.maxhp) output.maxhp = 100;
			output.hp = output.maxhp * parseFloat(hp) / 100;
		}

		// status parse
		if (!status) {
			output.status = '';
		} else if (status === 'par' || status === 'brn' || status === 'slp' || status === 'frz' || status === 'tox') {
			output.status = status;
		} else if (status === 'psn' && output.status !== 'tox') {
			output.status = status;
		} else if (status === 'fnt') {
			output.hp = 0;
			output.fainted = true;
		}
		return output;
	}
	parsePokemonId(pokemonid: string) {
		let name = pokemonid;

		let siden = -1;
		let slot = -1; // if there is an explicit slot for this pokemon
		let slotChart = {a: 0, b: 1, c: 2, d: 3, e: 4, f: 5} as {[k: string]: number};
		if (name.substr(0, 4) === 'p2: ' || name === 'p2') {
			siden = this.p2.n;
			name = name.substr(4);
		} else if (name.substr(0, 4) === 'p1: ' || name === 'p1') {
			siden = this.p1.n;
			name = name.substr(4);
		} else if (name.substr(0, 2) === 'p2' && name.substr(3, 2) === ': ') {
			slot = slotChart[name.substr(2, 1)];
			siden = this.p2.n;
			name = name.substr(5);
			pokemonid = 'p2: ' + name;
		} else if (name.substr(0, 2) === 'p1' && name.substr(3, 2) === ': ') {
			slot = slotChart[name.substr(2, 1)];
			siden = this.p1.n;
			name = name.substr(5);
			pokemonid = 'p1: ' + name;
		}
		return {name: name, siden: siden, slot: slot, pokemonid: pokemonid};
	}
	getPokemon(pokemonid: string, details?: string) {
		let isNew = false; // if true, don't match any pokemon that already exists (for Team Preview)
		let isSwitch = false; // if true, don't match an active, fainted, or immediately-previously switched-out pokemon
		let isInactive = false; // if true, don't match an active pokemon
		let createIfNotFound = false; // if true, create the pokemon if a match wasn't found

		if (pokemonid === undefined || pokemonid === '??') return null;
		if (pokemonid.substr(0, 5) === 'new: ') {
			pokemonid = pokemonid.substr(5);
			isNew = true;
			createIfNotFound = true; // obviously
		}
		if (pokemonid.substr(0, 10) === 'switchin: ') {
			pokemonid = pokemonid.substr(10);
			isSwitch = true;
			createIfNotFound = true;
		}
		let parseIdResult = this.parsePokemonId(pokemonid);
		let name, siden, slot;
		name = parseIdResult.name;
		siden = parseIdResult.siden;
		slot = parseIdResult.slot;
		pokemonid = parseIdResult.pokemonid;

		if (!details) {
			if (siden < 0) return null;
			if (this.sides[siden].active[slot]) return this.sides[siden].active[slot];
			if (slot >= 0) isInactive = true;
		}

		let searchid = '';
		if (details) searchid = pokemonid + '|' + details;

		// search p1's pokemon
		if (siden !== this.p2.n && !isNew) {
			const active = this.p1.active[slot];
			if (active && active.searchid === searchid && !isSwitch) {
				active.slot = slot;
				return active;
			}
			for (let i = 0; i < this.p1.pokemon.length; i++) {
				let pokemon = this.p1.pokemon[i];
				if (pokemon.fainted && (isNew || isSwitch)) continue;
				if (isSwitch || isInactive) {
					if (this.p1.active.indexOf(pokemon) >= 0) continue;
				}
				if (isSwitch && pokemon == this.p1.lastPokemon && !this.p1.active[slot]) continue;
				if ((searchid && pokemon.searchid === searchid) || // exact match
					(!searchid && pokemon.ident === pokemonid)) { // name matched, good enough
					if (slot >= 0) pokemon.slot = slot;
					return pokemon;
				}
				if (!pokemon.searchid && pokemon.checkDetails(details)) { // switch-in matches Team Preview entry
					pokemon = this.p1.newPokemon(this.parseDetails(name, pokemonid, details), i);
					if (slot >= 0) pokemon.slot = slot;
					return pokemon;
				}
			}
		}

		// search p2's pokemon
		if (siden !== this.p1.n && !isNew) {
			const active = this.p2.active[slot];
			if (active && active.searchid === searchid && !isSwitch) {
				if (slot >= 0) active.slot = slot;
				return active;
			}
			for (let i = 0; i < this.p2.pokemon.length; i++) {
				let pokemon = this.p2.pokemon[i];
				if (pokemon.fainted && (isNew || isSwitch)) continue;
				if (isSwitch || isInactive) {
					if (this.p2.active.indexOf(pokemon) >= 0) continue;
				}
				if (isSwitch && pokemon == this.p2.lastPokemon && !this.p2.active[slot]) continue;
				if ((searchid && pokemon.searchid === searchid) || // exact match
					(!searchid && pokemon.ident === pokemonid)) { // name matched, good enough
					if (slot >= 0) pokemon.slot = slot;
					return pokemon;
				}
				if (!pokemon.searchid && pokemon.checkDetails(details)) { // switch-in matches Team Preview entry
					pokemon = this.p2.newPokemon(this.parseDetails(name, pokemonid, details), i);
					if (slot >= 0) pokemon.slot = slot;
					return pokemon;
				}
			}
		}

		if (!details || !createIfNotFound) return null;

		// pokemon not found, create a new pokemon object for it

		if (siden < 0) throw new Error("Invalid pokemonid passed to getPokemon");

		let species = name;
		let gender = '';
		let level = 100;
		let shiny = false;
		if (details) {
			let splitDetails = details.split(', ');
			if (splitDetails[splitDetails.length - 1] === 'shiny') {
				shiny = true;
				splitDetails.pop();
			}
			if (splitDetails[splitDetails.length - 1] === 'M' || splitDetails[splitDetails.length - 1] === 'F') {
				gender = splitDetails[splitDetails.length - 1];
				splitDetails.pop();
			}
			if (splitDetails[1]) {
				level = parseInt(splitDetails[1].substr(1), 10) || 100;
			}
			if (splitDetails[0]) {
				species = splitDetails[0];
			}
		}
		if (slot < 0) slot = 0;
		let pokemon = this.sides[siden].newPokemon({
			species: species,
			details: details,
			name: name,
			ident: (name ? pokemonid : ''),
			searchid: (name ? (pokemonid + '|' + details) : ''),
			level: level,
			gender: gender,
			shiny: shiny,
			slot: slot
		}, isNew ? -2 : -1);
		return pokemon;
	}
	getSide(sidename: string) {
		if (sidename === 'p1' || sidename.substr(0, 3) === 'p1:') return this.p1;
		if (sidename === 'p2' || sidename.substr(0, 3) === 'p2:') return this.p2;
		if (this.mySide.id == sidename) return this.mySide;
		if (this.yourSide.id == sidename) return this.yourSide;
		if (this.mySide.name == sidename) return this.mySide;
		if (this.yourSide.name == sidename) return this.yourSide;
		return {
			name: sidename,
			id: sidename.replace(/ /g, '')
		} as Side;
	}

	add(command: string, fastForward?: boolean) {
		if (this.playbackState === Playback.Uninitialized) {
			this.playbackState = Playback.Ready;
			this.activityQueue.push(command);
		} else if (this.playbackState === Playback.Finished) {
			this.playbackState = Playback.Playing;
			this.paused = false;
			this.activityQueue.push(command);
			this.scene.soundStart();
			if (fastForward) {
				this.fastForwardTo(-1);
			} else {
				this.nextActivity();
			}
		} else {
			this.activityQueue.push(command);
		}
	}
	instantAdd(command: string) {
		this.run(command, true);
		this.preemptActivityQueue.push(command);
		this.add(command);
	}
	runMajor(args: string[], kwargs: {[k: string]: string}, preempt?: boolean) {
		switch (args[0]) {
		case 'start': {
			this.scene.teamPreview(false);
			this.mySide.active[0] = null;
			this.yourSide.active[0] = null;
			if (this.waitForResult()) return;
			this.start();
			break;
		} case 'upkeep': {
			this.usesUpkeep = true;
			this.updatePseudoWeatherLeft();
			this.updateToxicTurns();
			break;
		} case 'turn': {
			if (this.endPrevAction()) return;
			this.setTurn(args[1]);
			break;
		} case 'tier': {
			if (!args[1]) args[1] = '';
			for (let i in kwargs) args[1] += '[' + i + '] ' + kwargs[i];
			this.scene.log('<div style="padding:5px 0"><small>Format:</small> <br /><strong>' + Tools.escapeHTML(args[1]) + '</strong></div>');
			this.tier = args[1];
			if (this.tier.slice(-13) === 'Random Battle') {
				this.speciesClause = true;
			}
			break;
		} case 'gametype': {
			this.gameType = args[1] as any;
			switch (args[1]) {
			default:
				this.mySide.active = [null];
				this.yourSide.active = [null];
				break;
			case 'doubles':
				this.mySide.active = [null, null];
				this.yourSide.active = [null, null];
				break;
			case 'triples':
			case 'rotation':
				this.mySide.active = [null, null, null];
				this.yourSide.active = [null, null, null];
				break;
			}
			this.scene.updateGen();
			break;
		} case 'variation': {
			this.scene.log('<div><small>Variation: <em>' + Tools.escapeHTML(args[1]) + '</em></small></div>');
			break;
		} case 'rule': {
			let ruleArgs = args[1].split(': ');
			this.scene.log('<div><small><em>' + Tools.escapeHTML(ruleArgs[0]) + (ruleArgs[1] ? ':' : '') + '</em> ' + Tools.escapeHTML(ruleArgs[1] || '') + '</div>');
			if (ruleArgs[0] === 'Species Clause') this.speciesClause = true;
			break;
		} case 'rated': {
			this.rated = true;
			this.scene.log('<div class="rated"><strong>' + (Tools.escapeHTML(args[1]) || 'Rated battle') + '</strong></div>');
			break;
		} case ':': {
			break;
		} case 'chat': case 'c': case 'c:': {
			let pipeIndex = args[1].indexOf('|');
			if (args[0] === 'c:') {
				args[1] = args[1].slice(pipeIndex + 1);
				pipeIndex = args[1].indexOf('|');
			}
			let name = args[1].slice(0, pipeIndex);
			let rank = name.charAt(0);
			if (this.ignoreSpects && (rank === ' ' || rank === '+')) break;
			if (this.ignoreOpponent && (rank === '\u2605' || rank === '\u2606') && toUserid(name) !== app.user.get('userid')) break;
			if (window.app && app.ignore && app.ignore[toUserid(name)] && (rank === ' ' || rank === '+' || rank === '\u2605' || rank === '\u2606')) break;
			let message = args[1].slice(pipeIndex + 1);
			let isHighlighted = window.app && app.rooms && app.rooms[this.roomid].getHighlight(message);
			let parsedMessage = Tools.parseChatMessage(message, name, '', isHighlighted);
			if (!$.isArray(parsedMessage)) parsedMessage = [parsedMessage];
			for (let i = 0; i < parsedMessage.length; i++) {
				if (!parsedMessage[i]) continue;
				this.scene.log(parsedMessage[i], preempt);
			}
			if (isHighlighted) {
				let notifyTitle = "Mentioned by " + name + " in " + this.roomid;
				app.rooms[this.roomid].notifyOnce(notifyTitle, "\"" + message + "\"", 'highlight');
			}
			break;
		} case 'chatmsg': {
			this.scene.log('<div class="chat">' + Tools.escapeHTML(args[1]) + '</div>', preempt);
			break;
		} case 'chatmsg-raw': case 'raw': case 'html': {
			this.scene.log('<div class="chat">' + Tools.sanitizeHTML(args[1]) + '</div>', preempt);
			break;
		} case 'error': {
			this.scene.log('<div class="chat message-error">' + Tools.escapeHTML(args[1]) + '</div>', preempt);
			break;
		} case 'pm': {
			this.scene.log('<div class="chat"><strong>' + Tools.escapeHTML(args[1]) + ':</strong> <span class="message-pm"><i style="cursor:pointer" onclick="selectTab(\'lobby\');rooms.lobby.popupOpen(\'' + Tools.escapeHTML(args[2], true) + '\')">(Private to ' + Tools.escapeHTML(args[3]) + ')</i> ' + Tools.parseMessage(args[4]) + '</span>');
			break;
		} case 'askreg': {
			this.scene.log('<div class="broadcast-blue"><b>Register an account to protect your ladder rating!</b><br /><button name="register" value="' + Tools.escapeHTML(args[1]) + '"><b>Register</b></button></div>');
			break;
		} case 'inactive': {
			if (!this.kickingInactive) this.kickingInactive = true;
			if (args[1].slice(0, 11) === "Time left: ") {
				this.kickingInactive = parseInt(args[1].slice(11), 10) || true;
				this.totalTimeLeft = parseInt(args[1].split(' | ')[1], 10);
				if (this.totalTimeLeft === this.kickingInactive) this.totalTimeLeft = 0;
				return;
			} else if (args[1].slice(0, 9) === "You have ") {
				// this is ugly but parseInt is documented to work this way
				// so I'm going to be lazy and not chop off the rest of the
				// sentence
				this.kickingInactive = parseInt(args[1].slice(9), 10) || true;
				return;
			} else if (args[1].slice(-14) === ' seconds left.') {
				let hasIndex = args[1].indexOf(' has ');
				let userid = (window.app && app.user && app.user.get('userid'));
				if (toId(args[1].slice(0, hasIndex)) === userid) {
					this.kickingInactive = parseInt(args[1].slice(hasIndex + 5), 10) || true;
				}
			}
			this.scene.log('<div class="chat message-error">' + Tools.escapeHTML(args[1]) + '</div>', preempt);
			break;
		} case 'inactiveoff': {
			this.kickingInactive = false;
			this.scene.log('<div class="chat message-error">' + Tools.escapeHTML(args[1]) + '</div>', preempt);
			break;
		} case 'timer': {
			break;
		} case 'join': case 'j': {
			if (this.roomid) {
				let room = app.rooms[this.roomid];
				let user = args[1];
				let userid = toUserid(user);
				if (/^[a-z0-9]/i.test(user)) user = ' ' + user;
				if (!room.users[userid]) room.userCount.users++;
				room.users[userid] = user;
				room.userList.add(userid);
				room.userList.updateUserCount();
				room.userList.updateNoUsersOnline();
			}
			if (!this.ignoreSpects) {
				this.scene.log('<div class="chat"><small>' + Tools.escapeHTML(args[1]) + ' joined.</small></div>', preempt);
			}
			break;
		} case 'leave': case 'l': {
			if (this.roomid) {
				let room = app.rooms[this.roomid];
				let user = args[1];
				let userid = toUserid(user);
				if (room.users[userid]) room.userCount.users--;
				delete room.users[userid];
				room.userList.remove(userid);
				room.userList.updateUserCount();
				room.userList.updateNoUsersOnline();
			}
			if (!this.ignoreSpects) {
				this.scene.log('<div class="chat"><small>' + Tools.escapeHTML(args[1]) + ' left.</small></div>', preempt);
			}
			break;
		} case 'J': case 'L': case 'N': case 'n': case 'spectator': case 'spectatorleave': {
			break;
		} case 'player': {
			let side = this.getSide(args[1]);
			side.setName(args[2]);
			if (args[3]) side.setAvatar(args[3]);
			this.scene.updateSidebar(side);
			if (this.joinButtons) this.scene.hideJoinButtons();
			break;
		} case 'teamsize': {
			let side = this.getSide(args[1]);
			side.totalPokemon = parseInt(args[2], 10);
			this.scene.updateSidebar(side);
			break;
		} case 'win': {
			this.winner(args[1]);
			break;
		} case 'tie': {
			this.winner();
			break;
		} case 'prematureend': {
			this.prematureEnd();
			break;
		} case 'clearpoke': {
			this.p1.clearPokemon();
			this.p2.clearPokemon();
			break;
		} case 'poke': {
			let pokemon = this.getPokemon('new: ' + args[1], args[2])!;
			if (args[3] === 'item') {
				pokemon.item = '(exists)';
			}
			break;
		} case 'detailschange': {
			let poke = this.getPokemon(args[1])!;
			poke.removeVolatile('formechange' as ID);
			poke.removeVolatile('typeadd' as ID);
			poke.removeVolatile('typechange' as ID);

			let newSpecies = args[2];
			let commaIndex = newSpecies.indexOf(',');
			if (commaIndex !== -1) {
				let level = $.trim(newSpecies.substr(commaIndex + 1));
				if (level.charAt(0) === 'L') {
					poke.level = parseInt(level.substr(1), 10);
				}
				newSpecies = args[2].substr(0, commaIndex);
			}
			let template = Tools.getTemplate(newSpecies);
			let spriteData = {'shiny': poke.sprite.sp.shiny};

			poke.species = newSpecies;
			poke.ability = poke.baseAbility = (template.abilities ? template.abilities['0'] : '');
			poke.weightkg = template.weightkg;

			poke.details = args[2];
			poke.searchid = args[1].substr(0, 2) + args[1].substr(3) + '|' + args[2];

			poke.sprite.animTransform(poke, true, true);
			if (toId(newSpecies) === 'greninjaash') {
				this.message('' + poke.getName() + ' became Ash-Greninja!');
			} else if (toId(newSpecies) === 'mimikyubusted') {
				this.message('<small>' + poke.getName() + "'s disguise was busted!</small>");
			} else if (toId(newSpecies) === 'zygardecomplete') {
				this.message('' + poke.getName() + ' transformed into its Complete Forme!');
			} else if (toId(newSpecies) === 'necrozmaultra') {
				this.message('' + poke.getName() + ' regained its true power through Ultra Burst!');
			}
			break;
		} case 'teampreview': {
			this.teamPreviewCount = parseInt(args[1], 10);
			this.scene.teamPreview(true);
			break;
		} case 'switch': case 'drag': case 'replace': {
			this.endLastTurn();
			if (!this.hasPreMoveMessage && this.waitForResult()) return;
			this.hasPreMoveMessage = false;
			let poke = this.getPokemon('switchin: ' + args[1], args[2])!;
			let slot = poke.slot;
			poke.healthParse(args[3]);
			poke.removeVolatile('itemremoved' as ID);
			if (args[0] === 'switch') {
				if (poke.side.active[slot]) {
					poke.side.switchOut(poke.side.active[slot]!);
				}
				poke.side.switchIn(poke);
			} else if (args[0] === 'replace') {
				poke.side.replace(poke);
			} else {
				poke.side.dragIn(poke);
			}
			break;
		} case 'faint': {
			if (this.waitForResult()) return;
			let poke = this.getPokemon(args[1])!;
			poke.side.faint(poke);
			break;
		} case 'swap': {
			if (isNaN(Number(args[2]))) {
				let poke = this.getPokemon(args[1])!;
				poke.side.swapWith(poke, this.getPokemon(args[2])!, kwargs);
			} else {
				let poke = this.getPokemon(args[1])!;
				poke.side.swapTo(poke, parseInt(args[2], 10), kwargs);
			}
			break;
		} case 'move': {
			this.endLastTurn();
			if ((!kwargs.from || kwargs.from === 'lockedmove') && !this.hasPreMoveMessage && this.waitForResult()) return;
			this.hasPreMoveMessage = false;
			this.resetTurnsSinceMoved();
			let poke = this.getPokemon(args[1])!;
			let move = Tools.getMove(args[2]);
			if (this.checkActive(poke)) return;
			let poke2 = this.getPokemon(args[3]);
			poke.sprite.beforeMove();
			this.useMove(poke, move, poke2, kwargs);
			poke.sprite.afterMove();
			break;
		} case 'cant': {
			this.endLastTurn();
			this.resetTurnsSinceMoved();
			if (!this.hasPreMoveMessage && this.waitForResult()) return;
			this.hasPreMoveMessage = false;
			let poke = this.getPokemon(args[1])!;
			let effect = Tools.getEffect(args[2]);
			let move = Tools.getMove(args[3]);
			this.cantUseMove(poke, effect, move, kwargs);
			break;
		} case 'message': {
			this.message(Tools.escapeHTML(args[1]));
			break;
		} case 'bigerror': {
			this.message('<div class="broadcast-red">' + Tools.escapeHTML(args[1]).replace(/\|/g, '<br />') + '</div>');
			break;
		} case 'done': case '': {
			if (this.ended || this.endPrevAction()) return;
			break;
		} case 'warning': {
			this.message('<strong>Warning:</strong> ' + Tools.escapeHTML(args[1]));
			this.message('Bug? Report it to <a href="http://www.smogon.com/forums/showthread.php?t=3453192">the replay viewer\'s Smogon thread</a>');
			this.scene.wait(1000);
			break;
		} case 'gen': {
			this.gen = parseInt(args[1], 10);
			this.scene.updateGen();
			break;
		} case 'callback': {
			args.shift();
			if (this.customCallback) this.customCallback(this, args[0], args, kwargs);
			break;
		} case 'debug': {
			args.shift();
			const name = args.join(' ');
			this.scene.log('<div class="debug"><div class="chat"><small style="color:#999">[DEBUG] ' + Tools.escapeHTML(name) + '.</small></div></div>', preempt);
			break;
		} case 'seed': case 'choice': {
			break;
		} case 'unlink': {
			if (Tools.prefs('nounlink')) return;
			let user = toId(args[2]) || toId(args[1]);
			let $messages = $('.chatmessage-' + user);
			if (!$messages.length) break;
			$messages.find('a').contents().unwrap();
			if (window.BattleRoom && args[2]) {
				$messages.hide().addClass('revealed').find('button').parent().remove();
				this.scene.log('<div class="chatmessage-' + user + '"><button name="toggleMessages" value="' + user + '" class="subtle"><small>(' + $messages.length + ' line' + ($messages.length > 1 ? 's' : '') + ' from ' + user + ' hidden)</small></button></div>');
			}
			break;
		} case 'fieldhtml': {
			this.playbackState = Playback.Seeking; // force seeking to prevent controls etc
			this.scene.$frame.html(Tools.sanitizeHTML(args[1]));
			break;
		} case 'controlshtml': {
			let $controls = this.scene.$frame.parent().children('.battle-controls');
			$controls.html(Tools.sanitizeHTML(args[1]));
			break;
		} default: {
			this.scene.log('<div class="chat message-error">Unknown command: ' + Tools.escapeHTML(args[0]) + '</div>');
			if (this.errorCallback) this.errorCallback(this);
			break;
		}}
	}
	run(str: string, preempt?: boolean) {
		if (this.preemptActivityQueue.length && str === this.preemptActivityQueue[0]) {
			this.preemptActivityQueue.shift();
			this.scene.preemptCatchup();
			return;
		}
		if (!str) return;
		if (str.charAt(0) !== '|' || str.substr(0, 2) === '||') {
			if (str.charAt(0) === '|') str = str.substr(2);
			this.scene.log('<div class="chat">' + Tools.escapeHTML(str) + '</div>', preempt);
			return;
		}
		let args = ['done'];
		let kwargs = {} as {[k: string]: string};
		if (str !== '|') {
			args = str.substr(1).split('|');
		}
		switch (args[0]) {
		case 'c': case 'c:': case 'chat':
		case 'chatmsg': case 'chatmsg-raw': case 'raw': case 'error': case 'html':
		case 'inactive': case 'inactiveoff': case 'warning':
		case 'fieldhtml': case 'controlshtml': case 'bigerror':
			// chat is preserved untouched
			args = [args[0], str.slice(args[0].length + 2)];
			break;
		default:
			// parse kwargs
			while (args.length) {
				let argstr = args[args.length - 1];
				if (argstr.substr(0, 1) !== '[') break;
				let bracketPos = argstr.indexOf(']');
				if (bracketPos <= 0) break;
				// default to '.' so it evaluates to boolean true
				kwargs[argstr.substr(1, bracketPos - 1)] = ($.trim(argstr.substr(bracketPos + 1)) || '.');
				args.pop();
			}
		}

		// parse the next line if it's a minor: runMinor needs it parsed to determine when to merge minors
		let nextLine = '';
		let nextArgs = [''];
		let nextKwargs = {} as {[k: string]: string};
		nextLine = this.activityQueue[this.activityStep + 1] || '';
		if (nextLine && nextLine.substr(0, 2) === '|-') {
			nextLine = $.trim(nextLine.substr(1));
			nextArgs = nextLine.split('|');
			while (nextArgs[nextArgs.length - 1] && nextArgs[nextArgs.length - 1].substr(0, 1) === '[') {
				let bracketPos = nextArgs[nextArgs.length - 1].indexOf(']');
				if (bracketPos <= 0) break;
				let argstr = nextArgs.pop()!;
				// default to '.' so it evaluates to boolean true
				nextKwargs[argstr.substr(1, bracketPos - 1)] = ($.trim(argstr.substr(bracketPos + 1)) || '.');
			}
		}

		if (this.debug) {
			if (args[0].substr(0, 1) === '-') {
				this.runMinor(args, kwargs, preempt, nextArgs, nextKwargs);
			} else {
				this.runMajor(args, kwargs, preempt);
			}
		} else {
			try {
				if (args[0].substr(0, 1) === '-') {
					this.runMinor(args, kwargs, preempt, nextArgs, nextKwargs);
				} else {
					this.runMajor(args, kwargs, preempt);
				}
			} catch (e) {
				this.scene.log('<div class="broadcast-red">Error parsing: ' + Tools.escapeHTML(str) + ' (' + Tools.escapeHTML('' + e) + ')</div>', preempt);
				if (e.stack) {
					let stack = Tools.escapeHTML('' + e.stack).split('\n');
					for (let i = 0; i < stack.length; i++) {
						if (/\brun\b/.test(stack[i])) {
							stack.length = i;
							break;
						}
					}
					this.scene.log('<div class="broadcast-red">' + stack.join('<br>') + '</div>', preempt);
				}
				if (this.errorCallback) this.errorCallback(this);
			}
		}

		if (this.fastForward > 0 && this.fastForward < 1) {
			if (nextLine.substr(0, 6) === '|start') {
				this.fastForwardOff();
				if (this.endCallback) this.endCallback(this);
			}
		}
	}
	endPrevAction() {
		this.hasPreMoveMessage = false;
		if (this.minorQueue.length) {
			this.runMinor();
			this.activityStep--;
			return true;
		}
		if (this.resultWaiting || this.scene.messagebarOpen) {
			this.scene.closeMessagebar();
			this.activityStep--;
			this.resultWaiting = false;
			this.activeMoveIsSpread = null;
			return true;
		}
		return false;
	}
	checkActive(poke: Pokemon) {
		if (!poke.side.active[poke.slot]) {
			// SOMEONE jumped in in the middle of a replay. <_<
			poke.side.replace(poke);
		}
		return false;
	}
	waitForResult() {
		if (this.endPrevAction()) return true;
		this.resultWaiting = true;
		return false;
	}

	pause() {
		this.paused = true;
		this.playbackState = Playback.Paused;
		this.scene.pause();
	}
	play() {
		this.paused = false;
		this.playbackState = Playback.Playing;
		this.scene.resume();
		this.nextActivity();
	}
	skipTurn() {
		this.fastForwardTo(this.turn + 1);
	}
	fastForwardTo(time: string | number) {
		if (this.fastForward) return;
		if (time === 0 || time === '0') {
			time = 0.5;
		} else {
			time = Math.floor(Number(time));
		}
		if (isNaN(time)) return;
		if (this.ended && time >= this.turn + 1) return;

		if (time <= this.turn && time !== -1) {
			let paused = this.paused;
			this.reset(true);
			if (paused) this.pause();
			else this.paused = false;
			this.fastForwardWillScroll = true;
		}
		this.scene.animationOff();
		this.playbackState = Playback.Seeking;
		this.fastForward = time;
		this.nextActivity();
	}
	fastForwardOff() {
		this.fastForward = 0;
		this.scene.animationOn();
		if (this.paused) {
			this.playbackState = Playback.Paused;
		} else {
			this.playbackState = Playback.Playing;
		}
	}
	nextActivity() {
		this.scene.startAnimations();
		let animations;
		while (!animations) {
			if (this.activityStep >= this.activityQueue.length) {
				this.fastForwardOff();
				if (this.ended) {
					this.paused = true;
					this.scene.soundStop();
				}
				this.playbackState = Playback.Finished;
				if (this.endCallback) this.endCallback(this);
				return;
			}
			let ret;
			if (this.paused && !this.fastForward) return;
			if (!ret) {
				this.run(this.activityQueue[this.activityStep]);
				this.activityStep++;
			}
			animations = this.scene.finishAnimations();
		}

		if (this.playbackState === Playback.Paused) return;

		const interruptionCount = this.scene.interruptionCount;
		animations.done(() => {
			if (interruptionCount === this.scene.interruptionCount) {
				this.nextActivity();
			}
		});
	}

	newBattle() {
		this.reset();
		this.activityQueue = [];
	}
	setQueue(queue: string[]) {
		this.reset();
		this.activityQueue = queue;

		/* for (let i = 0; i < queue.length && i < 20; i++) {
			if (queue[i].substr(0, 8) === 'pokemon ') {
				let sp = this.parseSpriteData(queue[i].substr(8));
				BattleSound.loadEffect(sp.cryurl);
				this.preloadImage(sp.url);
				if (sp.url === '/sprites/bwani/meloetta.gif') {
					this.preloadImage('/sprites/bwani/meloetta-pirouette.gif');
				}
				if (sp.url === '/sprites/bwani-back/meloetta.gif') {
					this.preloadImage('/sprites/bwani-back/meloetta-pirouette.gif');
				}
			}
		} */
		this.playbackState = Playback.Ready;
	}

	setMute(mute: boolean) {
		BattleSound.setMute(mute);
	}
}
