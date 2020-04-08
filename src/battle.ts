/**
 * Pokemon Showdown Battle
 *
 * This is the main file for handling battle animations
 *
 * Licensing note: PS's client has complicated licensing:
 * - The client as a whole is AGPLv3
 * - The battle replay/animation engine (battle-*.ts) by itself is MIT
 *
 * Layout:
 *
 * - Battle
 *   - Side
 *     - Pokemon
 *   - BattleScene
 *     - BattleLog
 *       - BattleTextParser
 *
 * When a Battle receives a message, it splits the message into tokens
 * and parses what happens, updating its own state, and then telling
 * BattleScene to do any relevant animations. The tokens then get
 * passed directly into BattleLog. If the message is an in-battle
 * message, it'll be extracted by BattleTextParser, which adds it to
 * both the battle log itself, as well as the messagebar.
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

class Pokemon implements PokemonDetails, PokemonHealth {
	name = '';
	speciesForme = '';

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
	 * As with ident, blank before the first switch-in, and will only
	 * change during the first switch-in.
	 */
	searchid = '';

	side: Side;
	slot = 0;

	fainted = false;
	hp = 0;
	maxhp = 1000;
	level = 100;
	gender: GenderName = 'N';
	shiny = false;

	hpcolor: HPColor = 'g';
	moves: string[] = [];
	ability = '';
	baseAbility = '';
	item = '';
	itemEffect = '';
	prevItem = '';
	prevItemEffect = '';

	boosts: {[stat: string]: number} = {};
	status: StatusName | 'tox' | '' | '???' = '';
	statusStage = 0;
	volatiles: EffectTable = {};
	turnstatuses: EffectTable = {};
	movestatuses: EffectTable = {};
	lastMove = '';

	/** [[moveName, ppUsed]] */
	moveTrack: [string, number][] = [];
	statusData = {sleepTurns: 0, toxicTurns: 0};

	sprite: PokemonSprite;

	constructor(data: PokemonDetails, side: Side) {
		this.side = side;
		this.speciesForme = data.speciesForme;

		this.details = data.details;
		this.name = data.name;
		this.level = data.level;
		this.shiny = data.shiny;
		this.gender = data.gender || 'N';
		this.ident = data.ident;
		this.searchid = data.searchid;

		this.sprite = side.battle.scene.addPokemonSprite(this);
	}

	isActive() {
		return this.side.active.includes(this);
	}

	/** @deprecated */
	private getHPColor(): HPColor {
		if (this.hpcolor) return this.hpcolor;
		let ratio = this.hp / this.maxhp;
		if (ratio > 0.5) return 'g';
		if (ratio > 0.2) return 'y';
		return 'r';
	}
	/** @deprecated */
	private getHPColorClass() {
		switch (this.getHPColor()) {
		case 'y': return 'hpbar hpbar-yellow';
		case 'r': return 'hpbar hpbar-red';
		}
		return 'hpbar';
	}
	static getPixelRange(pixels: number, color: HPColor | ''): [number, number] {
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
	static getFormattedRange(range: [number, number], precision: number, separator: string) {
		if (range[0] === range[1]) {
			let percentage = Math.abs(range[0] * 100);
			if (Math.floor(percentage) === percentage) {
				return percentage + '%';
			}
			return percentage.toFixed(precision) + '%';
		}
		let lower;
		let upper;
		if (precision === 0) {
			lower = Math.floor(range[0] * 100);
			upper = Math.ceil(range[1] * 100);
		} else {
			lower = (range[0] * 100).toFixed(precision);
			upper = (range[1] * 100).toFixed(precision);
		}
		return '' + lower + separator + upper + '%';
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
		let oldrange = Pokemon.getPixelRange(damage[3], damage[4]);
		let newrange = Pokemon.getPixelRange(damage[3] + damage[0], this.hpcolor);
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
	healthParse(hpstring: string, parsedamage?: boolean, heal?: boolean):
		[number, number, number] | [number, number, number, number, HPColor] | null {
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

		let oldnum = oldhp ? (Math.floor(this.maxhp * oldhp / oldmaxhp) || 1) : 0;
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
		this.side.battle.scene.removeEffect(this, volatile);
		if (!this.hasVolatile(volatile)) return;
		delete this.volatiles[volatile];
	}
	addVolatile(volatile: ID, ...args: any[]) {
		if (this.hasVolatile(volatile) && !args.length) return;
		this.volatiles[volatile] = [volatile, ...args] as EffectState;
		this.side.battle.scene.addEffect(this, volatile);
	}
	hasVolatile(volatile: ID) {
		return !!this.volatiles[volatile];
	}
	removeTurnstatus(volatile: ID) {
		this.side.battle.scene.removeEffect(this, volatile);
		if (!this.hasTurnstatus(volatile)) return;
		delete this.turnstatuses[volatile];
	}
	addTurnstatus(volatile: ID) {
		volatile = toID(volatile);
		this.side.battle.scene.addEffect(this, volatile);
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
		this.side.battle.scene.updateStatbar(this);
	}
	removeMovestatus(volatile: ID) {
		this.side.battle.scene.removeEffect(this, volatile);
		if (!this.hasMovestatus(volatile)) return;
		delete this.movestatuses[volatile];
	}
	addMovestatus(volatile: ID) {
		volatile = toID(volatile);
		if (this.hasMovestatus(volatile)) return;
		this.movestatuses[volatile] = [volatile];
		this.side.battle.scene.addEffect(this, volatile);
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
		this.side.battle.scene.clearEffects(this);
	}
	rememberMove(moveName: string, pp = 1, recursionSource?: string) {
		if (recursionSource === this.ident) return;
		moveName = Dex.getMove(moveName).name;
		if (moveName.charAt(0) === '*') return;
		if (moveName === 'Struggle') return;
		if (this.volatiles.transform) {
			// make sure there is no infinite recursion if both Pokemon are transformed into each other
			if (!recursionSource) recursionSource = this.ident;
			this.volatiles.transform[1].rememberMove(moveName, 0, recursionSource);
			moveName = '*' + moveName;
		}
		for (const entry of this.moveTrack) {
			if (moveName === entry[0]) {
				entry[1] += pp;
				if (entry[1] < 0) entry[1] = 0;
				return;
			}
		}
		this.moveTrack.push([moveName, pp]);
	}
	rememberAbility(ability: string, isNotBase?: boolean) {
		ability = Dex.getAbility(ability).name;
		this.ability = ability;
		if (!this.baseAbility && !isNotBase) {
			this.baseAbility = ability;
		}
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
			spc: 'Spc',
		};
		if (!this.boosts[boostStat]) {
			return '1&times;&nbsp;' + boostStatTable[boostStat];
		}
		if (this.boosts[boostStat] > 6) this.boosts[boostStat] = 6;
		if (this.boosts[boostStat] < -6) this.boosts[boostStat] = -6;
		if (boostStat === 'accuracy' || boostStat === 'evasion') {
			if (this.boosts[boostStat] > 0) {
				let goodBoostTable = [
					'1&times;', '1.33&times;', '1.67&times;', '2&times;', '2.33&times;', '2.67&times;', '3&times;',
				];
				// let goodBoostTable = ['Normal', '+1', '+2', '+3', '+4', '+5', '+6'];
				return '' + goodBoostTable[this.boosts[boostStat]] + '&nbsp;' + boostStatTable[boostStat];
			}
			let badBoostTable = [
				'1&times;', '0.75&times;', '0.6&times;', '0.5&times;', '0.43&times;', '0.38&times;', '0.33&times;',
			];
			// let badBoostTable = ['Normal', '&minus;1', '&minus;2', '&minus;3', '&minus;4', '&minus;5', '&minus;6'];
			return '' + badBoostTable[-this.boosts[boostStat]] + '&nbsp;' + boostStatTable[boostStat];
		}
		if (this.boosts[boostStat] > 0) {
			let goodBoostTable = [
				'1&times;', '1.5&times;', '2&times;', '2.5&times;', '3&times;', '3.5&times;', '4&times;',
			];
			// let goodBoostTable = ['Normal', '+1', '+2', '+3', '+4', '+5', '+6'];
			return '' + goodBoostTable[this.boosts[boostStat]] + '&nbsp;' + boostStatTable[boostStat];
		}
		let badBoostTable = [
			'1&times;', '0.67&times;', '0.5&times;', '0.4&times;', '0.33&times;', '0.29&times;', '0.25&times;',
		];
		// let badBoostTable = ['Normal', '&minus;1', '&minus;2', '&minus;3', '&minus;4', '&minus;5', '&minus;6'];
		return '' + badBoostTable[-this.boosts[boostStat]] + '&nbsp;' + boostStatTable[boostStat];
	}
	getWeightKg(serverPokemon?: ServerPokemon) {
		let autotomizeFactor = this.volatiles.autotomize?.[1] * 100 || 0;
		return Math.max(this.getSpecies(serverPokemon).weightkg - autotomizeFactor, 0.1);
	}
	getBoostType(boostStat: BoostStatName) {
		if (!this.boosts[boostStat]) return 'neutral';
		if (this.boosts[boostStat] > 0) return 'good';
		return 'bad';
	}
	clearVolatile() {
		this.ability = this.baseAbility;
		this.boosts = {};
		this.clearVolatiles();
		for (let i = 0; i < this.moveTrack.length; i++) {
			if (this.moveTrack[i][0].charAt(0) === '*') {
				this.moveTrack.splice(i, 1);
				i--;
			}
		}
		// this.lastMove = '';
		this.statusStage = 0;
		this.statusData.toxicTurns = 0;
		if (this.side.battle.gen === 5) this.statusData.sleepTurns = 0;
	}
	/**
	 * copyAll = false means Baton Pass,
	 * copyAll = true means Illusion breaking
	 */
	copyVolatileFrom(pokemon: Pokemon, copyAll?: boolean) {
		this.boosts = pokemon.boosts;
		this.volatiles = pokemon.volatiles;
		// this.lastMove = pokemon.lastMove; // I think
		if (!copyAll) {
			delete this.volatiles['airballoon'];
			delete this.volatiles['attract'];
			delete this.volatiles['autotomize'];
			delete this.volatiles['disable'];
			delete this.volatiles['encore'];
			delete this.volatiles['foresight'];
			delete this.volatiles['imprison'];
			delete this.volatiles['laserfocus'];
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
		pokemon.side.battle.scene.removeTransform(pokemon);
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
	getTypes(serverPokemon?: ServerPokemon): [ReadonlyArray<TypeName>, TypeName | ''] {
		let types: ReadonlyArray<TypeName>;
		if (this.volatiles.typechange) {
			types = this.volatiles.typechange[1].split('/');
		} else {
			types = this.getSpecies(serverPokemon).types;
		}
		if (this.volatiles.roost && types.includes('Flying')) {
			types = types.filter(typeName => typeName !== 'Flying');
			if (!types.length) types = ['Normal'];
		}
		const addedType = (this.volatiles.typeadd ? this.volatiles.typeadd[1] : '');
		return [types, addedType];
	}
	isGrounded(serverPokemon?: ServerPokemon) {
		const battle = this.side.battle;
		if (battle.hasPseudoWeather('Gravity')) {
			return true;
		} else if (this.volatiles['ingrain'] && battle.gen >= 4) {
			return true;
		} else if (this.volatiles['smackdown']) {
			return true;
		}

		let item = toID(serverPokemon ? serverPokemon.item : this.item);
		let ability = toID(this.ability || serverPokemon?.ability);
		if (battle.hasPseudoWeather('Magic Room') || this.volatiles['embargo'] || ability === 'klutz') {
			item = '' as ID;
		}

		if (item === 'ironball') {
			return true;
		}
		if (ability === 'levitate') {
			return false;
		}
		if (this.volatiles['magnetrise'] || this.volatiles['telekinesis']) {
			return false;
		}
		if (item === 'airballoon') {
			return false;
		}
		return !this.getTypeList(serverPokemon).includes('Flying');
	}
	getTypeList(serverPokemon?: ServerPokemon) {
		const [types, addedType] = this.getTypes(serverPokemon);
		return addedType ? types.concat(addedType) : types;
	}
	getSpeciesForme(serverPokemon?: ServerPokemon): string {
		return this.volatiles.formechange ? this.volatiles.formechange[1] :
			(serverPokemon ? serverPokemon.speciesForme : this.speciesForme);
	}
	getSpecies(serverPokemon?: ServerPokemon) {
		return this.side.battle.dex.getSpecies(this.getSpeciesForme(serverPokemon));
	}
	getBaseSpecies() {
		return this.side.battle.dex.getSpecies(this.speciesForme);
	}
	reset() {
		this.clearVolatile();
		this.hp = this.maxhp;
		this.fainted = false;
		this.status = '';
		this.moveTrack = [];
		this.name = this.name || this.speciesForme;
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
		if (this.hp === 1 && this.maxhp > 45) return 1;

		if (this.maxhp === 48) {
			// Draw the health bar to the middle of the range.
			// This affects the width of the visual health bar *only*; it
			// does not affect the ranges displayed in any way.
			let range = Pokemon.getPixelRange(this.hp, this.hpcolor);
			let ratio = (range[0] + range[1]) / 2;
			return Math.round(maxWidth * ratio) || 1;
		}
		let percentage = Math.ceil(100 * this.hp / this.maxhp);
		if ((percentage === 100) && (this.hp < this.maxhp)) {
			percentage = 99;
		}
		return percentage * maxWidth / 100;
	}
	static getHPText(pokemon: PokemonHealth, precision = 1) {
		if (pokemon.maxhp === 100) return pokemon.hp + '%';
		if (pokemon.maxhp !== 48) return (100 * pokemon.hp / pokemon.maxhp).toFixed(precision) + '%';
		let range = Pokemon.getPixelRange(pokemon.hp, pokemon.hpcolor);
		return Pokemon.getFormattedRange(range, precision, '–');
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
	avatar: string = 'unknown';
	rating: string = '';
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
	sideConditions: {[id: string]: [string, number, number, number]} = {};

	constructor(battle: Battle, n: number) {
		this.battle = battle;
		this.n = n;
		this.updateSprites();
	}

	rollTrainerSprites() {
		let sprites = ['lucas', 'dawn', 'ethan', 'lyra', 'hilbert', 'hilda'];
		this.avatar = sprites[Math.floor(Math.random() * sprites.length)];
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
		this.battle.scene.updateSpritesForSide(this);
	}
	setAvatar(avatar: string) {
		this.avatar = avatar;
	}
	setName(name: string, avatar?: string) {
		if (name) this.name = name;
		this.id = toID(this.name);
		if (avatar) {
			this.setAvatar(avatar);
		} else {
			this.rollTrainerSprites();
			if (this.foe && this.avatar === this.foe.avatar) this.rollTrainerSprites();
		}
		if (this.battle.stagnateCallback) this.battle.stagnateCallback(this.battle);
	}
	addSideCondition(effect: Effect) {
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
		const id = toID(condition);
		if (!this.sideConditions[id]) return;
		delete this.sideConditions[id];
		this.battle.scene.removeSideCondition(this.n, id);
	}
	addPokemon(name: string, ident: string, details: string, replaceSlot = -1) {
		const oldItem = replaceSlot >= 0 ? this.pokemon[replaceSlot].item : undefined;

		const data = this.battle.parseDetails(name, ident, details);
		const poke = new Pokemon(data, this);
		if (oldItem) poke.item = oldItem;

		if (!poke.ability && poke.baseAbility) poke.ability = poke.baseAbility;
		poke.reset();

		if (replaceSlot >= 0) {
			this.pokemon[replaceSlot] = poke;
		} else {
			this.pokemon.push(poke);
		}
		if (this.pokemon.length > this.totalPokemon || this.battle.speciesClause) {
			// check for Illusion
			let existingTable: {[searchid: string]: number} = {};
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
					for (const curPoke of this.pokemon) {
						if (curPoke === poke) continue;
						if (curPoke.fainted) continue;
						if (this.active.indexOf(curPoke) >= 0) continue;
						if (curPoke.speciesForme === 'Zoroark' || curPoke.speciesForme === 'Zorua' || curPoke.ability === 'Illusion') {
							illusionFound = curPoke;
							break;
						}
					}
					if (!illusionFound) {
						// This is Hackmons; we'll just guess a random unfainted Pokemon.
						// This will keep the fainted Pokemon count correct, and will
						// eventually become correct as incorrect guesses are switched in
						// and reguessed.
						for (const curPoke of this.pokemon) {
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
		if (['batonpass', 'zbatonpass'].includes(this.lastPokemon?.lastMove!)) {
			pokemon.copyVolatileFrom(this.lastPokemon!);
		}

		this.battle.scene.animSummon(pokemon, slot);

		if (this.battle.switchCallback) this.battle.switchCallback(this.battle, this);
	}
	dragIn(pokemon: Pokemon, slot = pokemon.slot) {
		let oldpokemon = this.active[slot];
		if (oldpokemon === pokemon) return;
		this.lastPokemon = oldpokemon;
		if (oldpokemon) {
			this.battle.scene.animDragOut(oldpokemon);
			oldpokemon.clearVolatile();
		}
		pokemon.clearVolatile();
		pokemon.lastMove = '';
		this.battle.lastMove = 'switch-in';
		this.active[slot] = pokemon;
		pokemon.slot = slot;

		this.battle.scene.animDragIn(pokemon, slot);

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
			pokemon.statusData = {...oldpokemon.statusData};
			// we don't know anything about the illusioned pokemon except that it's not fainted
			// technically we also know its status but only at the end of the turn, not here
			oldpokemon.fainted = false;
			oldpokemon.hp = oldpokemon.maxhp;
			oldpokemon.status = '???';
		}
		this.active[slot] = pokemon;
		pokemon.slot = slot;

		if (oldpokemon) {
			this.battle.scene.animUnsummon(oldpokemon, true);
		}
		this.battle.scene.animSummon(pokemon, slot, true);
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
			this.battle.log(['switchout', pokemon.ident], {from: pokemon.lastMove});
		} else if (pokemon.lastMove !== 'batonpass' && pokemon.lastMove !== 'zbatonpass') {
			this.battle.log(['switchout', pokemon.ident]);
		}
		pokemon.statusData.toxicTurns = 0;
		if (this.battle.gen === 5) pokemon.statusData.sleepTurns = 0;
		this.lastPokemon = pokemon;
		this.active[slot] = null;

		this.battle.scene.animUnsummon(pokemon);
	}
	swapTo(pokemon: Pokemon, slot: number, kwArgs: KWArgs) {
		if (pokemon.slot === slot) return;
		let target = this.active[slot];

		let oslot = pokemon.slot;

		pokemon.slot = slot;
		if (target) target.slot = oslot;

		this.active[slot] = pokemon;
		this.active[oslot] = target;

		this.battle.scene.animUnsummon(pokemon, true);
		if (target) this.battle.scene.animUnsummon(target, true);

		this.battle.scene.animSummon(pokemon, slot, true);
		if (target) this.battle.scene.animSummon(target, oslot, true);
	}
	swapWith(pokemon: Pokemon, target: Pokemon, kwArgs: KWArgs) {
		// method provided for backwards compatibility only
		if (pokemon === target) return;

		let oslot = pokemon.slot;
		let nslot = target.slot;

		pokemon.slot = nslot;
		target.slot = oslot;
		this.active[nslot] = pokemon;
		this.active[oslot] = target;

		this.battle.scene.animUnsummon(pokemon, true);
		this.battle.scene.animUnsummon(target, true);

		this.battle.scene.animSummon(pokemon, nslot, true);
		this.battle.scene.animSummon(target, oslot, true);
	}
	faint(pokemon: Pokemon, slot = pokemon.slot) {
		pokemon.clearVolatile();
		this.lastPokemon = pokemon;
		this.active[slot] = null;

		pokemon.fainted = true;
		pokemon.hp = 0;

		this.battle.scene.animFaint(pokemon);
		if (this.battle.faintCallback) this.battle.faintCallback(this.battle, this);
	}
	destroy() {
		this.clearPokemon();
		this.battle = null!;
		this.foe = null!;
	}
}

enum Playback {
	/**
	 * Battle is at the end of the queue. `|start` is not in the queue.
	 * Battle is waiting for `.add()` or `.setQueue()` to add `|start` to
	 * the queue. Adding other queue entries will happen immediately,
	 * bringing the state back to Uninitialized.
	 */
	Uninitialized = 0,
	/**
	 * Battle is at `|start` and hasn't been started yet.
	 * Battle is paused, waiting for `.play()`.
	 */
	Ready = 1,
	/**
	 * `.play()` has been called. Battle should be animating
	 * normally.
	 */
	Playing = 2,
	/**
	 * `.pause()` has been called. Battle is waiting for `.play()`.
	 */
	Paused = 3,
	/**
	 * Battle is at the end of the queue. Battle is waiting for
	 * `.add()` for further battle progress.
	 */
	Finished = 4,
	/**
	 * Battle is fast forwarding through the queue, with animations off.
	 */
	Seeking = 5,
}

interface PokemonDetails {
	details: string;
	name: string;
	speciesForme: string;
	level: number;
	shiny: boolean;
	gender: GenderName | '';
	ident: string;
	searchid: string;
}
interface PokemonHealth {
	hp: number;
	maxhp: number;
	hpcolor: HPColor | '';
	status: StatusName | 'tox' | '' | '???';
	fainted?: boolean;
}
interface ServerPokemon extends PokemonDetails, PokemonHealth {
	ident: string;
	details: string;
	condition: string;
	active: boolean;
	/** unboosted stats */
	stats: {
		atk: number,
		def: number,
		spa: number,
		spd: number,
		spe: number,
	};
	/** currently an ID, will revise to name */
	moves: string[];
	/** currently an ID, will revise to name */
	baseAbility: string;
	/** currently an ID, will revise to name */
	ability?: string;
	/** currently an ID, will revise to name */
	item: string;
	/** currently an ID, will revise to name */
	pokeball: string;
}

class Battle {
	scene: BattleScene | BattleSceneStub;

	sidesSwitched = false;

	// activity queue
	activityQueue = [] as string[];
	/** See battle.instantAdd */
	preemptActivityQueue = [] as string[];
	waitForAnimations: true | false | 'simult' = true;
	activityStep = 0;
	fastForward = 0;
	fastForwardWillScroll = false;

	resultWaiting = false;
	activeMoveIsSpread: string | null = null;

	// callback
	faintCallback: ((battle: Battle, side: Side) => void) | null = null;
	switchCallback: ((battle: Battle, side: Side) => void) | null = null;
	dragCallback: ((battle: Battle, side: Side) => void) | null = null;
	turnCallback: ((battle: Battle) => void) | null = null;
	startCallback: ((battle: Battle) => void) | null = null;
	stagnateCallback: ((battle: Battle) => void) | null = null;
	endCallback: ((battle: Battle) => void) | null = null;
	customCallback: ((battle: Battle, cmd: string, args: string[], kwArgs: KWArgs) => void) | null = null;
	errorCallback: ((battle: Battle) => void) | null = null;

	mute = false;
	messageFadeTime = 300;
	messageShownTime = 1;
	turnsSinceMoved = 0;

	turn = 0;
	/**
	 * Has playback gotten to Team Preview or `|start` yet?
	 * (Affects whether BGM is playing)
	 */
	started = false;
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
	myPokemon: ServerPokemon[] | null = null;
	sides: [Side, Side] = [null!, null!];
	lastMove = '';

	gen = 7;
	dex: ModdedDex = Dex;
	teamPreviewCount = 0;
	speciesClause = false;
	tier = '';
	gameType: 'singles' | 'doubles' | 'triples' = 'singles';
	rated: string | boolean = false;
	isBlitz = false;
	endLastTurnPending = false;
	totalTimeLeft = 0;
	graceTimeLeft = 0;
	/**
	 * true: timer on, state unknown
	 * false: timer off
	 * number: seconds left this turn
	 */
	kickingInactive: number | boolean = false;

	// options
	id = '';
	roomid = '';
	hardcoreMode = false;
	ignoreNicks = Dex.prefs('ignorenicks');
	ignoreOpponent = false;
	ignoreSpects = false;
	debug = false;
	joinButtons = false;

	/**
	 * The actual pause state. Will only be true if playback is actually
	 * paused, not just waiting for the opponent to make a move.
	 */
	paused = true;
	playbackState = Playback.Uninitialized;

	// external
	resumeButton: JQuery.EventHandler<HTMLElement, null> | null = null;

	constructor($frame: JQuery<HTMLElement>, $logFrame: JQuery<HTMLElement>, id = '') {
		this.id = id;

		if (!$frame && !$logFrame) {
			this.scene = new BattleSceneStub();
		} else {
			this.scene = new BattleScene(this, $frame, $logFrame);
		}

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
		for (const [pseudoWeatherName] of this.pseudoWeather) {
			if (weather === pseudoWeatherName) {
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
		this.started = false;
		this.ended = false;
		this.weather = '' as ID;
		this.weatherTimeLeft = 0;
		this.weatherMinTimeLeft = 0;
		this.pseudoWeather = [];
		this.lastMove = '';

		for (const side of this.sides) {
			if (side) side.reset();
		}
		this.myPokemon = null;

		// DOM state
		this.scene.reset();

		// activity queue state
		this.activeMoveIsSpread = null;
		this.activityStep = 0;
		this.fastForwardOff();
		this.resultWaiting = false;
		this.paused = true;
		if (this.playbackState !== Playback.Seeking) {
			this.playbackState = Playback.Uninitialized;
			if (!dontResetSound) this.scene.resetBgm();
		}
		this.resetTurnsSinceMoved();
		this.nextActivity();
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

	log(args: Args, kwArgs?: KWArgs, preempt?: boolean) {
		this.scene.log.add(args, kwArgs, preempt);
	}

	resetToCurrentTurn() {
		if (this.ended) {
			this.reset(true);
			this.fastForwardTo(-1);
		} else {
			let turn = this.turn;
			let paused = this.paused;
			this.reset(true);
			this.paused = paused;
			if (turn) this.fastForwardTo(turn);
			if (!paused) {
				this.play();
			} else {
				this.pause();
			}
		}
	}
	switchSides() {
		this.setSidesSwitched(!this.sidesSwitched);
		this.resetToCurrentTurn();
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

		// nothing else should need updating - don't call this function after sending out pokemon
	}

	//
	// activities
	//
	start() {
		this.log(['start']);
		this.resetTurnsSinceMoved();
		if (this.startCallback) this.startCallback(this);
	}
	winner(winner?: string) {
		this.log(['win', winner || '']);
		this.ended = true;
	}
	prematureEnd() {
		this.log(['message', 'This replay ends here.']);
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
		if (turnNum === this.turn + 1) {
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
		this.scene.updateAcceleration();
	}
	updateToxicTurns() {
		for (const side of this.sides) {
			for (const poke of side.active) {
				if (poke?.status === 'tox') poke.statusData.toxicTurns++;
			}
		}
	}
	changeWeather(weatherName: string, poke?: Pokemon, isUpkeep?: boolean, ability?: Effect) {
		let weather = toID(weatherName);
		if (!weather || weather === 'none') {
			weather = '' as ID;
		}
		if (isUpkeep) {
			if (this.weather && this.weatherTimeLeft) {
				this.weatherTimeLeft--;
				if (this.weatherMinTimeLeft !== 0) this.weatherMinTimeLeft--;
			}
			if (!this.fastForward) {
				this.scene.upkeepWeather();
			}
			return;
		}
		if (weather) {
			let isExtremeWeather = (weather === 'deltastream' || weather === 'desolateland' || weather === 'primordialsea');
			if (poke) {
				if (ability) {
					this.activateAbility(poke, ability.name);
				}
				this.weatherTimeLeft = (this.gen <= 5 || isExtremeWeather) ? 0 : 8;
				this.weatherMinTimeLeft = (this.gen <= 5 || isExtremeWeather) ? 0 : 5;
			} else if (isExtremeWeather) {
				this.weatherTimeLeft = 0;
				this.weatherMinTimeLeft = 0;
			} else {
				this.weatherTimeLeft = (this.gen <= 3 ? 5 : 8);
				this.weatherMinTimeLeft = (this.gen <= 3 ? 0 : 5);
			}
		}
		this.weather = weather;
		this.scene.updateWeather();
	}
	updatePseudoWeatherLeft() {
		for (const pWeather of this.pseudoWeather) {
			if (pWeather[1]) pWeather[1]--;
			if (pWeather[2]) pWeather[2]--;
		}
		for (const side of this.sides) {
			for (const id in side.sideConditions) {
				let cond = side.sideConditions[id];
				if (cond[2]) cond[2]--;
				if (cond[3]) cond[3]--;
			}
		}
		this.scene.updateWeather();
	}
	useMove(pokemon: Pokemon, move: Move, target: Pokemon | null, kwArgs: KWArgs) {
		let fromeffect = Dex.getEffect(kwArgs.from);
		this.activateAbility(pokemon, fromeffect);
		pokemon.clearMovestatuses();
		if (move.id === 'focuspunch') {
			pokemon.removeTurnstatus('focuspunch' as ID);
		}
		this.scene.updateStatbar(pokemon);
		if (fromeffect.id === 'sleeptalk') {
			pokemon.rememberMove(move.name, 0);
		} else if (!fromeffect.id || fromeffect.id === 'pursuit') {
			let moveName = move.name;
			if (move.isZ) {
				pokemon.item = move.isZ;
				let item = Dex.getItem(move.isZ);
				if (item.zMoveFrom) moveName = item.zMoveFrom;
			} else if (move.name.slice(0, 2) === 'Z-') {
				moveName = moveName.slice(2);
				move = Dex.getMove(moveName);
				if (window.BattleItems) {
					for (let item in BattleItems) {
						if (BattleItems[item].zMoveType === move.type) pokemon.item = item;
					}
				}
			}
			let pp = 1;
			if (move.target === "all") {
				for (const active of pokemon.side.foe.active) {
					if (active && toID(active.ability) === 'pressure') {
						pp += 1;
					}
				}
			} else if (target && target.side !== pokemon.side && toID(target.ability) === 'pressure') {
				pp += 1;
			}
			pokemon.rememberMove(moveName, pp);
		}
		pokemon.lastMove = move.id;
		this.lastMove = move.id;
		if (move.id === 'wish' || move.id === 'healingwish') {
			pokemon.side.wisher = pokemon;
		}
	}
	animateMove(pokemon: Pokemon, move: Move, target: Pokemon | null, kwArgs: KWArgs) {
		this.activeMoveIsSpread = kwArgs.spread;
		if (this.fastForward || kwArgs.still) return;

		if (!target) target = pokemon.side.foe.active[0];
		if (!target) target = pokemon.side.foe.missedPokemon;
		if (kwArgs.miss && target.side) {
			target = target.side.missedPokemon;
		}
		if (kwArgs.notarget) {
			return;
		}

		if (kwArgs.prepare || kwArgs.anim === 'prepare') {
			this.scene.runPrepareAnim(move.id, pokemon, target);
			return;
		}

		let usedMove = kwArgs.anim ? Dex.getMove(kwArgs.anim) : move;
		if (!kwArgs.spread) {
			this.scene.runMoveAnim(usedMove.id, [pokemon, target]);
			return;
		}

		let targets = [pokemon];
		if (kwArgs.spread === '.') {
			//  no target was hit by the attack
			targets.push(target.side.missedPokemon);
		} else {
			for (const hitTarget of kwArgs.spread.split(',')) {
				const curTarget = this.getPokemon(hitTarget + ': ?');
				if (!curTarget) {
					this.log(['error', `Invalid spread move target: "${hitTarget}"`]);
					continue;
				}
				targets.push(curTarget);
			}
		}

		this.scene.runMoveAnim(usedMove.id, targets);
	}
	cantUseMove(pokemon: Pokemon, effect: Effect, move: Move, kwArgs: KWArgs) {
		pokemon.clearMovestatuses();
		this.scene.updateStatbar(pokemon);
		if (effect.id in BattleStatusAnims) {
			this.scene.runStatusAnim(effect.id, [pokemon]);
		}
		this.activateAbility(pokemon, effect);
		if (move.id) pokemon.rememberMove(move.name, 0);
		switch (effect.id) {
		case 'par':
			this.scene.resultAnim(pokemon, 'Paralyzed', 'par');
			break;
		case 'frz':
			this.scene.resultAnim(pokemon, 'Frozen', 'frz');
			break;
		case 'slp':
			this.scene.resultAnim(pokemon, 'Asleep', 'slp');
			pokemon.statusData.sleepTurns++;
			break;
		case 'truant':
			this.scene.resultAnim(pokemon, 'Loafing around', 'neutral');
			break;
		case 'recharge':
			this.scene.runOtherAnim('selfstatus' as ID, [pokemon]);
			this.scene.resultAnim(pokemon, 'Must recharge', 'neutral');
			break;
		case 'focuspunch':
			this.scene.resultAnim(pokemon, 'Lost focus', 'neutral');
			pokemon.removeTurnstatus('focuspunch' as ID);
			break;
		case 'shelltrap':
			this.scene.resultAnim(pokemon, 'Trap failed', 'neutral');
			pokemon.removeTurnstatus('shelltrap' as ID);
			break;
		case 'flinch':
			this.scene.resultAnim(pokemon, 'Flinched', 'neutral');
			pokemon.removeTurnstatus('focuspunch' as ID);
			break;
		case 'attract':
			this.scene.resultAnim(pokemon, 'Immobilized', 'neutral');
			break;
		}
		this.scene.animReset(pokemon);
	}

	activateAbility(pokemon: Pokemon | null, effectOrName: Effect | string, isNotBase?: boolean) {
		if (!pokemon || !effectOrName) return;
		if (typeof effectOrName !== 'string') {
			if (effectOrName.effectType !== 'Ability') return;
			effectOrName = effectOrName.name;
		}
		this.scene.abilityActivateAnim(pokemon, effectOrName);
		pokemon.rememberAbility(effectOrName, isNotBase);
	}

	runMinor(args: Args, kwArgs: KWArgs, nextArgs?: Args, nextKwargs?: KWArgs) {
		if (nextArgs && nextKwargs) {
			if (args[2] === 'Sturdy' && args[0] === '-activate') {
				args[2] = 'ability: Sturdy';
			}
			if (['-crit', '-supereffective', '-resisted'].includes(args[0]) || args[2] === 'ability: Sturdy') {
				kwArgs.then = '.';
			}
			if (args[0] === '-damage' && !kwArgs.from && args[1] !== nextArgs[1] && (
				['-crit', '-supereffective', '-resisted'].includes(nextArgs[0]) ||
				(nextArgs[0] === '-damage' && !nextKwargs.from)
			)) {
				kwArgs.then = '.';
			}
			if (args[0] === '-damage' && nextArgs[0] === '-damage' && kwArgs.from && kwArgs.from === nextKwargs.from) {
				kwArgs.then = '.';
			}
			if (args[0] === '-ability' && (args[2] === 'Intimidate' || args[3] === 'boost')) {
				kwArgs.then = '.';
			}
			if (args[0] === '-unboost' && nextArgs[0] === '-unboost') {
				kwArgs.then = '.';
			}
			if (args[0] === '-boost' && nextArgs[0] === '-boost') {
				kwArgs.then = '.';
			}
			if (args[0] === '-damage' && kwArgs.from === 'Leech Seed' && nextArgs[0] === '-heal' && nextKwargs.silent) {
				kwArgs.then = '.';
			}
			if (args[0] === 'detailschange' && nextArgs[0] === '-mega') {
				if (this.scene.closeMessagebar()) {
					this.activityStep--;
					return;
				}
				kwArgs.simult = '.';
			}
		}
		if (kwArgs.then) this.waitForAnimations = false;
		if (kwArgs.simult) this.waitForAnimations = 'simult';

		switch (args[0]) {
		case '-damage': {
			let poke = this.getPokemon(args[1])!;
			let damage = poke.healthParse(args[2], true);
			if (damage === null) break;
			let range = poke.getDamageRange(damage);

			if (kwArgs.from) {
				let effect = Dex.getEffect(kwArgs.from);
				let ofpoke = this.getPokemon(kwArgs.of);
				this.activateAbility(ofpoke, effect);
				if (effect.effectType === 'Item') {
					const itemPoke = ofpoke || poke;
					if (itemPoke.prevItem !== effect.name) {
						itemPoke.item = effect.name;
					}
				}
				switch (effect.id) {
				case 'brn':
					this.scene.runStatusAnim('brn' as ID, [poke]);
					break;
				case 'psn':
					this.scene.runStatusAnim('psn' as ID, [poke]);
					break;
				case 'baddreams':
					this.scene.runStatusAnim('cursed' as ID, [poke]);
					break;
				case 'curse':
					this.scene.runStatusAnim('cursed' as ID, [poke]);
					break;
				case 'confusion':
					this.scene.runStatusAnim('confusedselfhit' as ID, [poke]);
					break;
				case 'leechseed':
					this.scene.runOtherAnim('leech' as ID, [ofpoke!, poke]);
					break;
				case 'bind':
				case 'wrap':
					this.scene.runOtherAnim('bound' as ID, [poke]);
					break;
				}
			} else {
				let damageinfo = '' + Pokemon.getFormattedRange(range, damage[1] === 100 ? 0 : 1, '\u2013');
				if (damage[1] !== 100) {
					let hover = '' + ((damage[0] < 0) ? '\u2212' : '') +
						Math.abs(damage[0]) + '/' + damage[1];
					if (damage[1] === 48) { // this is a hack
						hover += ' pixels';
					}
					// battle-log will convert this into <abbr>
					damageinfo = '||' + hover + '||' + damageinfo + '||';
				}
				args[3] = damageinfo;
			}
			this.scene.damageAnim(poke, Pokemon.getFormattedRange(range, 0, ' to '));
			this.log(args, kwArgs);
			break;
		}
		case '-heal': {
			let poke = this.getPokemon(args[1])!;
			let damage = poke.healthParse(args[2], true, true);
			if (damage === null) break;
			let range = poke.getDamageRange(damage);

			if (kwArgs.from) {
				let effect = Dex.getEffect(kwArgs.from);
				this.activateAbility(poke, effect);
				if (effect.effectType === 'Item') {
					poke.item = effect.name;
				}
				switch (effect.id) {
				case 'lunardance':
					for (let trackedMove of poke.moveTrack) {
						trackedMove[1] = 0;
					}
					// falls through
				case 'healingwish':
					this.lastMove = 'healing-wish';
					this.scene.runResidualAnim('healingwish' as ID, poke);
					poke.side.wisher = null;
					break;
				case 'wish':
					this.scene.runResidualAnim('wish' as ID, poke);
					break;
				}
			}
			this.scene.runOtherAnim('heal' as ID, [poke]);
			this.scene.healAnim(poke, Pokemon.getFormattedRange(range, 0, ' to '));
			this.log(args, kwArgs);
			break;
		}
		case '-sethp': {
			for (let k = 0; k < 2; k++) {
				let cpoke = this.getPokemon(args[1 + 2 * k]);
				if (cpoke) {
					let damage = cpoke.healthParse(args[2 + 2 * k])!;
					let range = cpoke.getDamageRange(damage);
					let formattedRange = Pokemon.getFormattedRange(range, 0, ' to ');
					let diff = damage[0];
					if (diff > 0) {
						this.scene.healAnim(cpoke, formattedRange);
					} else {
						this.scene.damageAnim(cpoke, formattedRange);
					}
				}
			}
			this.log(args, kwArgs);
			break;
		}
		case '-boost': {
			let poke = this.getPokemon(args[1])!;
			let stat = args[2] as BoostStatName;
			if (this.gen === 1 && stat === 'spd') break;
			if (this.gen === 1 && stat === 'spa') stat = 'spc';
			let amount = parseInt(args[3], 10);
			if (amount === 0) {
				this.scene.resultAnim(poke, 'already ' + poke.getBoost(stat), 'neutral');
				this.log(args, kwArgs);
				break;
			}
			if (!poke.boosts[stat]) {
				poke.boosts[stat] = 0;
			}
			poke.boosts[stat] += amount;

			if (!kwArgs.silent && kwArgs.from) {
				let effect = Dex.getEffect(kwArgs.from);
				let ofpoke = this.getPokemon(kwArgs.of);
				if (!(effect.id === 'weakarmor' && stat === 'spe')) {
					this.activateAbility(ofpoke || poke, effect);
				}
			}
			this.scene.resultAnim(poke, poke.getBoost(stat), 'good');
			this.log(args, kwArgs);
			break;
		}
		case '-unboost': {
			let poke = this.getPokemon(args[1])!;
			let stat = args[2] as BoostStatName;
			if (this.gen === 1 && stat === 'spd') break;
			if (this.gen === 1 && stat === 'spa') stat = 'spc';
			let amount = parseInt(args[3], 10);
			if (amount === 0) {
				this.scene.resultAnim(poke, 'already ' + poke.getBoost(stat), 'neutral');
				this.log(args, kwArgs);
				break;
			}
			if (!poke.boosts[stat]) {
				poke.boosts[stat] = 0;
			}
			poke.boosts[stat] -= amount;

			if (!kwArgs.silent && kwArgs.from) {
				let effect = Dex.getEffect(kwArgs.from);
				let ofpoke = this.getPokemon(kwArgs.of);
				this.activateAbility(ofpoke || poke, effect);
			}
			this.scene.resultAnim(poke, poke.getBoost(stat), 'bad');
			this.log(args, kwArgs);
			break;
		}
		case '-setboost': {
			let poke = this.getPokemon(args[1])!;
			let stat = args[2] as BoostStatName;
			let amount = parseInt(args[3], 10);
			poke.boosts[stat] = amount;
			this.scene.resultAnim(poke, poke.getBoost(stat), (amount > 0 ? 'good' : 'bad'));
			this.log(args, kwArgs);
			break;
		}
		case '-swapboost': {
			let poke = this.getPokemon(args[1])!;
			let poke2 = this.getPokemon(args[2])!;
			let stats = args[3] ? args[3].split(', ') : ['atk', 'def', 'spa', 'spd', 'spe', 'accuracy', 'evasion'];
			for (const stat of stats) {
				let tmp = poke.boosts[stat];
				poke.boosts[stat] = poke2.boosts[stat];
				if (!poke.boosts[stat]) delete poke.boosts[stat];
				poke2.boosts[stat] = tmp;
				if (!poke2.boosts[stat]) delete poke2.boosts[stat];
			}
			this.scene.resultAnim(poke, 'Stats swapped', 'neutral');
			this.scene.resultAnim(poke2, 'Stats swapped', 'neutral');

			this.log(args, kwArgs);
			break;
		}
		case '-clearpositiveboost': {
			let poke = this.getPokemon(args[1])!;
			let ofpoke = this.getPokemon(args[2]);
			let effect = Dex.getEffect(args[3]);
			for (const stat in poke.boosts) {
				if (poke.boosts[stat] > 0) delete poke.boosts[stat];
			}
			this.scene.resultAnim(poke, 'Boosts lost', 'bad');

			if (effect.id) {
				switch (effect.id) {
				case 'spectralthief':
					// todo: update StealBoosts so it animates 1st on Spectral Thief
					this.scene.runOtherAnim('spectralthiefboost' as ID, [ofpoke!, poke]);
					break;
				}
			}
			this.log(args, kwArgs);
			break;
		}
		case '-clearnegativeboost': {
			let poke = this.getPokemon(args[1])!;
			for (const stat in poke.boosts) {
				if (poke.boosts[stat] < 0) delete poke.boosts[stat];
			}
			this.scene.resultAnim(poke, 'Restored', 'good');

			this.log(args, kwArgs);
			break;
		}
		case '-copyboost': {
			let poke = this.getPokemon(args[1])!;
			let frompoke = this.getPokemon(args[2])!;
			let stats = args[3] ? args[3].split(', ') : ['atk', 'def', 'spa', 'spd', 'spe', 'accuracy', 'evasion'];
			for (const stat of stats) {
				poke.boosts[stat] = frompoke.boosts[stat];
				if (!poke.boosts[stat]) delete poke.boosts[stat];
			}
			if (this.gen >= 6) {
				const volatilesToCopy = ['focusenergy', 'laserfocus'];
				for (const volatile of volatilesToCopy) {
					if (frompoke.volatiles[volatile]) {
						poke.addVolatile(volatile as ID);
					} else {
						poke.removeVolatile(volatile as ID);
					}
				}
			}
			this.scene.resultAnim(poke, 'Stats copied', 'neutral');

			this.log(args, kwArgs);
			break;
		}
		case '-clearboost': {
			let poke = this.getPokemon(args[1])!;
			poke.boosts = {};
			this.scene.resultAnim(poke, 'Stats reset', 'neutral');

			this.log(args, kwArgs);
			break;
		}
		case '-invertboost': {
			let poke = this.getPokemon(args[1])!;
			for (const stat in poke.boosts) {
				poke.boosts[stat] = -poke.boosts[stat];
			}
			this.scene.resultAnim(poke, 'Stats inverted', 'neutral');

			this.log(args, kwArgs);
			break;
		}
		case '-clearallboost': {
			let timeOffset = this.scene.timeOffset;
			for (const side of this.sides) {
				for (const active of side.active) {
					if (active) {
						active.boosts = {};
						this.scene.timeOffset = timeOffset;
						this.scene.resultAnim(active, 'Stats reset', 'neutral');
					}
				}
			}

			this.log(args, kwArgs);
			break;
		}
		case '-crit': {
			let poke = this.getPokemon(args[1]);
			if (poke) this.scene.resultAnim(poke, 'Critical hit', 'bad');
			if (this.activeMoveIsSpread) kwArgs.spread = '.';
			this.log(args, kwArgs);
			break;
		}
		case '-supereffective': {
			let poke = this.getPokemon(args[1]);
			if (poke) {
				this.scene.resultAnim(poke, 'Super-effective', 'bad');
				if (window.Config?.server?.afd) {
					this.scene.runOtherAnim('hitmark' as ID, [poke]);
				}
			}
			if (this.activeMoveIsSpread) kwArgs.spread = '.';
			this.log(args, kwArgs);
			break;
		}
		case '-resisted': {
			let poke = this.getPokemon(args[1]);
			if (poke) this.scene.resultAnim(poke, 'Resisted', 'neutral');
			if (this.activeMoveIsSpread) kwArgs.spread = '.';
			this.log(args, kwArgs);
			break;
		}
		case '-immune': {
			let poke = this.getPokemon(args[1])!;
			let fromeffect = Dex.getEffect(kwArgs.from);
			this.activateAbility(this.getPokemon(kwArgs.of) || poke, fromeffect);
			this.log(args, kwArgs);
			this.scene.resultAnim(poke, 'Immune', 'neutral');
			break;
		}
		case '-miss': {
			let target = this.getPokemon(args[2]);
			if (target) {
				this.scene.resultAnim(target, 'Missed', 'neutral');
			}
			this.log(args, kwArgs);
			break;
		}
		case '-fail': {
			let poke = this.getPokemon(args[1])!;
			let effect = Dex.getEffect(args[2]);
			let fromeffect = Dex.getEffect(kwArgs.from);
			let ofpoke = this.getPokemon(kwArgs.of);
			this.activateAbility(ofpoke || poke, fromeffect);
			switch (effect.id) {
			case 'brn':
				this.scene.resultAnim(poke, 'Already burned', 'neutral');
				break;
			case 'tox':
			case 'psn':
				this.scene.resultAnim(poke, 'Already poisoned', 'neutral');
				break;
			case 'slp':
				if (fromeffect.id === 'uproar') {
					this.scene.resultAnim(poke, 'Failed', 'neutral');
				} else {
					this.scene.resultAnim(poke, 'Already asleep', 'neutral');
				}
				break;
			case 'par':
				this.scene.resultAnim(poke, 'Already paralyzed', 'neutral');
				break;
			case 'frz':
				this.scene.resultAnim(poke, 'Already frozen', 'neutral');
				break;
			case 'unboost':
				this.scene.resultAnim(poke, 'Stat drop blocked', 'neutral');
				break;
			default:
				if (poke) {
					this.scene.resultAnim(poke, 'Failed', 'neutral');
				}
				break;
			}
			this.scene.animReset(poke);
			this.log(args, kwArgs);
			break;
		}
		case '-block': {
			let poke = this.getPokemon(args[1])!;
			let ofpoke = this.getPokemon(kwArgs.of);
			let effect = Dex.getEffect(args[2]);
			this.activateAbility(ofpoke || poke, effect);
			switch (effect.id) {
			case 'quickguard':
				poke.addTurnstatus('quickguard' as ID);
				this.scene.resultAnim(poke, 'Quick Guard', 'good');
				break;
			case 'wideguard':
				poke.addTurnstatus('wideguard' as ID);
				this.scene.resultAnim(poke, 'Wide Guard', 'good');
				break;
			case 'craftyshield':
				poke.addTurnstatus('craftyshield' as ID);
				this.scene.resultAnim(poke, 'Crafty Shield', 'good');
				break;
			case 'protect':
				poke.addTurnstatus('protect' as ID);
				this.scene.resultAnim(poke, 'Protected', 'good');
				break;

			case 'safetygoggles':
				poke.item = 'Safety Goggles';
				break;
			case 'protectivepads':
				poke.item = 'Protective Pads';
				break;
			}
			this.log(args, kwArgs);
			break;
		}
		case '-center': case '-notarget': case '-ohko':
		case '-combine': case '-hitcount': case '-waiting': case '-zbroken': {
			this.log(args, kwArgs);
			break;
		}
		case '-zpower': {
			let poke = this.getPokemon(args[1])!;
			this.scene.runOtherAnim('zpower' as ID, [poke]);
			this.log(args, kwArgs);
			break;
		}
		case '-prepare': {
			let poke = this.getPokemon(args[1])!;
			let moveid = toID(args[2]);
			let target = this.getPokemon(args[3]) || poke.side.foe.active[0] || poke;
			this.scene.runPrepareAnim(moveid, poke, target);
			this.log(args, kwArgs);
			break;
		}
		case '-mustrecharge': {
			let poke = this.getPokemon(args[1])!;
			poke.addMovestatus('mustrecharge' as ID);
			this.scene.updateStatbar(poke);
			break;
		}
		case '-status': {
			let poke = this.getPokemon(args[1])!;
			let effect = Dex.getEffect(kwArgs.from);
			let ofpoke = this.getPokemon(kwArgs.of) || poke;
			poke.status = args[2] as StatusName;
			poke.removeVolatile('yawn' as ID);
			this.activateAbility(ofpoke || poke, effect);
			if (effect.effectType === 'Item') {
				ofpoke.item = effect.name;
			}

			switch (args[2]) {
			case 'brn':
				this.scene.resultAnim(poke, 'Burned', 'brn');
				this.scene.runStatusAnim('brn' as ID, [poke]);
				break;
			case 'tox':
				this.scene.resultAnim(poke, 'Toxic poison', 'psn');
				this.scene.runStatusAnim('psn' as ID, [poke]);
				poke.statusData.toxicTurns = (effect.name === "Toxic Orb" ? -1 : 0);
				break;
			case 'psn':
				this.scene.resultAnim(poke, 'Poisoned', 'psn');
				this.scene.runStatusAnim('psn' as ID, [poke]);
				break;
			case 'slp':
				this.scene.resultAnim(poke, 'Asleep', 'slp');
				if (effect.id === 'rest') {
					poke.statusData.sleepTurns = 0; // for Gen 2 use through Sleep Talk
				}
				break;
			case 'par':
				this.scene.resultAnim(poke, 'Paralyzed', 'par');
				this.scene.runStatusAnim('par' as ID, [poke]);
				break;
			case 'frz':
				this.scene.resultAnim(poke, 'Frozen', 'frz');
				this.scene.runStatusAnim('frz' as ID, [poke]);
				break;
			default:
				this.scene.updateStatbar(poke);
				break;
			}
			this.log(args, kwArgs);
			break;
		}
		case '-curestatus': {
			let poke = this.getPokemon(args[1])!;
			let effect = Dex.getEffect(kwArgs.from);

			if (effect.id) {
				switch (effect.id) {
				case 'flamewheel':
				case 'flareblitz':
				case 'fusionflare':
				case 'sacredfire':
				case 'scald':
				case 'steameruption':
					kwArgs.thaw = '.';
					break;
				}
			}
			if (poke) {
				poke.status = '';
				switch (args[2]) {
				case 'brn':
					this.scene.resultAnim(poke, 'Burn cured', 'good');
					break;
				case 'tox':
				case 'psn':
					poke.statusData.toxicTurns = 0;
					this.scene.resultAnim(poke, 'Poison cured', 'good');
					break;
				case 'slp':
					this.scene.resultAnim(poke, 'Woke up', 'good');
					poke.statusData.sleepTurns = 0;
					break;
				case 'par':
					this.scene.resultAnim(poke, 'Paralysis cured', 'good');
					break;
				case 'frz':
					this.scene.resultAnim(poke, 'Thawed', 'good');
					break;
				default:
					poke.removeVolatile('confusion' as ID);
					this.scene.resultAnim(poke, 'Cured', 'good');
				}
			}
			this.log(args, kwArgs);
			break;

		}
		case '-cureteam': { // For old gens when the whole team was always cured
			let poke = this.getPokemon(args[1])!;
			for (const target of poke.side.pokemon) {
				target.status = '';
				this.scene.updateStatbarIfExists(target);
			}

			this.scene.resultAnim(poke, 'Team Cured', 'good');
			this.log(args, kwArgs);
			break;
		}
		case '-item': {
			let poke = this.getPokemon(args[1])!;
			let item = Dex.getItem(args[2]);
			let effect = Dex.getEffect(kwArgs.from);
			let ofpoke = this.getPokemon(kwArgs.of);
			poke.item = item.name;
			poke.itemEffect = '';
			poke.removeVolatile('airballoon' as ID);
			if (item.id === 'airballoon') poke.addVolatile('airballoon' as ID);

			if (effect.id) {
				switch (effect.id) {
				case 'pickup':
					this.activateAbility(poke, "Pickup");
					// falls through
				case 'recycle':
					poke.itemEffect = 'found';
					this.scene.resultAnim(poke, item.name, 'neutral');
					break;
				case 'frisk':
					this.activateAbility(ofpoke!, "Frisk");
					if (poke && poke !== ofpoke) { // used for gen 6
						poke.itemEffect = 'frisked';
						this.scene.resultAnim(poke, item.name, 'neutral');
					}
					break;
				case 'magician':
				case 'pickpocket':
					this.activateAbility(poke, effect.name);
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
					this.scene.resultAnim(poke, item.name, 'neutral');
					this.scene.resultAnim(ofpoke!, 'Item Stolen', 'bad');
					break;
				case 'harvest':
					poke.itemEffect = 'harvested';
					this.activateAbility(poke, "Harvest");
					this.scene.resultAnim(poke, item.name, 'neutral');
					break;
				case 'bestow':
					poke.itemEffect = 'bestowed';
					this.scene.resultAnim(poke, item.name, 'neutral');
					break;
				case 'switcheroo':
				case 'trick':
					poke.itemEffect = 'tricked';
					// falls through
				default:
					break;
				}
			} else {
				switch (item.id) {
				case 'airballoon':
					this.scene.resultAnim(poke, 'Balloon', 'good');
					break;
				}
			}
			this.log(args, kwArgs);
			break;
		}
		case '-enditem': {
			let poke = this.getPokemon(args[1])!;
			let item = Dex.getItem(args[2]);
			let effect = Dex.getEffect(kwArgs.from);
			poke.item = '';
			poke.itemEffect = '';
			poke.prevItem = item.name;
			poke.prevItemEffect = '';
			poke.removeVolatile('airballoon' as ID);
			poke.addVolatile('itemremoved' as ID);
			if (kwArgs.eat) {
				poke.prevItemEffect = 'eaten';
				this.scene.runOtherAnim('consume' as ID, [poke]);
				this.lastMove = item.id;
			} else if (kwArgs.weaken) {
				poke.prevItemEffect = 'eaten';
				this.lastMove = item.id;
			} else if (effect.id) {
				switch (effect.id) {
				case 'fling':
					poke.prevItemEffect = 'flung';
					break;
				case 'knockoff':
					poke.prevItemEffect = 'knocked off';
					this.scene.runOtherAnim('itemoff' as ID, [poke]);
					this.scene.resultAnim(poke, 'Item knocked off', 'neutral');
					break;
				case 'stealeat':
					poke.prevItemEffect = 'stolen';
					break;
				case 'gem':
					poke.prevItemEffect = 'consumed';
					break;
				case 'incinerate':
					poke.prevItemEffect = 'incinerated';
					break;
				}
			} else {
				switch (item.id) {
				case 'airballoon':
					poke.prevItemEffect = 'popped';
					poke.removeVolatile('airballoon' as ID);
					this.scene.resultAnim(poke, 'Balloon popped', 'neutral');
					break;
				case 'focussash':
					poke.prevItemEffect = 'consumed';
					this.scene.resultAnim(poke, 'Sash', 'neutral');
					break;
				case 'focusband':
					this.scene.resultAnim(poke, 'Focus Band', 'neutral');
					break;
				case 'redcard':
					poke.prevItemEffect = 'held up';
					break;
				default:
					poke.prevItemEffect = 'consumed';
					break;
				}
			}
			this.log(args, kwArgs);
			break;
		}
		case '-ability': {
			let poke = this.getPokemon(args[1])!;
			let ability = Dex.getAbility(args[2]);
			let effect = Dex.getEffect(kwArgs.from);
			let ofpoke = this.getPokemon(kwArgs.of);
			poke.rememberAbility(ability.name, effect.id && !kwArgs.fail);

			if (kwArgs.silent) {
				// do nothing
			} else if (effect.id) {
				switch (effect.id) {
				case 'trace':
					this.activateAbility(poke, "Trace");
					this.scene.wait(500);
					this.activateAbility(poke, ability.name, true);
					ofpoke!.rememberAbility(ability.name);
					break;
				case 'powerofalchemy':
				case 'receiver':
					this.activateAbility(poke, effect.name);
					this.scene.wait(500);
					this.activateAbility(poke, ability.name, true);
					ofpoke!.rememberAbility(ability.name);
					break;
				case 'roleplay':
					this.activateAbility(poke, ability.name, true);
					ofpoke!.rememberAbility(ability.name);
					break;
				case 'desolateland':
				case 'primordialsea':
				case 'deltastream':
					if (kwArgs.fail) {
						this.activateAbility(poke, ability.name);
					}
					break;
				default:
					this.activateAbility(poke, ability.name);
					break;
				}
			} else {
				this.activateAbility(poke, ability.name);
			}
			this.log(args, kwArgs);
			break;
		}
		case '-endability': {
			// deprecated; use |-start| for Gastro Acid
			// and the third arg of |-ability| for Entrainment et al
			let poke = this.getPokemon(args[1])!;
			let ability = Dex.getAbility(args[2]);
			poke.ability = '(suppressed)';

			if (ability.id) {
				if (!poke.baseAbility) poke.baseAbility = ability.name;
			}
			this.log(args, kwArgs);
			break;
		}
		case 'detailschange': {
			let poke = this.getPokemon(args[1])!;
			poke.removeVolatile('formechange' as ID);
			poke.removeVolatile('typeadd' as ID);
			poke.removeVolatile('typechange' as ID);

			let newSpeciesForme = args[2];
			let commaIndex = newSpeciesForme.indexOf(',');
			if (commaIndex !== -1) {
				let level = newSpeciesForme.substr(commaIndex + 1).trim();
				if (level.charAt(0) === 'L') {
					poke.level = parseInt(level.substr(1), 10);
				}
				newSpeciesForme = args[2].substr(0, commaIndex);
			}
			let species = this.dex.getSpecies(newSpeciesForme);

			poke.speciesForme = newSpeciesForme;
			poke.ability = poke.baseAbility = (species.abilities ? species.abilities['0'] : '');

			poke.details = args[2];
			poke.searchid = args[1].substr(0, 2) + args[1].substr(3) + '|' + args[2];

			this.scene.animTransform(poke, true, true);
			this.log(args, kwArgs);
			break;
		}
		case '-transform': {
			let poke = this.getPokemon(args[1])!;
			let tpoke = this.getPokemon(args[2])!;
			let effect = Dex.getEffect(kwArgs.from);
			if (poke === tpoke) throw new Error("Transforming into self");

			if (!kwArgs.silent) {
				this.activateAbility(poke, effect);
			}

			poke.boosts = {...tpoke.boosts};
			poke.copyTypesFrom(tpoke);
			poke.ability = tpoke.ability;
			const speciesForme = (tpoke.volatiles.formechange ? tpoke.volatiles.formechange[1] : tpoke.speciesForme);
			const pokemon = tpoke;
			const shiny = tpoke.shiny;
			const gender = tpoke.gender;
			poke.addVolatile('transform' as ID, pokemon, shiny, gender);
			poke.addVolatile('formechange' as ID, speciesForme);
			for (const trackedMove of tpoke.moveTrack) {
				poke.rememberMove(trackedMove[0], 0);
			}
			this.scene.animTransform(poke);
			this.scene.resultAnim(poke, 'Transformed', 'good');
			this.log(['-transform', args[1], args[2], tpoke.speciesForme], kwArgs);
			break;
		}
		case '-formechange': {
			let poke = this.getPokemon(args[1])!;
			let species = Dex.getSpecies(args[2]);
			let fromeffect = Dex.getEffect(kwArgs.from);
			let isCustomAnim = false;
			poke.removeVolatile('typeadd' as ID);
			poke.removeVolatile('typechange' as ID);
			if (this.gen >= 7) poke.removeVolatile('autotomize' as ID);

			if (!kwArgs.silent) {
				this.activateAbility(poke, fromeffect);
			}
			poke.addVolatile('formechange' as ID, species.name); // the formechange volatile reminds us to revert the sprite change on switch-out
			this.scene.animTransform(poke, isCustomAnim);
			this.log(args, kwArgs);
			break;
		}
		case '-mega': {
			let poke = this.getPokemon(args[1])!;
			let item = Dex.getItem(args[3]);
			if (args[3]) {
				poke.item = item.name;
			}
			this.log(args, kwArgs);
			break;
		}
		case '-primal': case '-burst': {
			this.log(args, kwArgs);
			break;
		}
		case '-start': {
			let poke = this.getPokemon(args[1])!;
			let effect = Dex.getEffect(args[2]);
			let ofpoke = this.getPokemon(kwArgs.of);
			let fromeffect = Dex.getEffect(kwArgs.from);

			this.activateAbility(poke, effect);
			this.activateAbility(ofpoke || poke, fromeffect);
			switch (effect.id) {
			case 'typechange':
				if (ofpoke && fromeffect.id === 'reflecttype') {
					poke.copyTypesFrom(ofpoke);
				} else {
					const types = Dex.sanitizeName(args[3] || '???');
					poke.removeVolatile('typeadd' as ID);
					poke.addVolatile('typechange' as ID, types);
					if (!kwArgs.silent) {
						this.scene.typeAnim(poke, types);
					}
				}
				this.scene.updateStatbar(poke);
				break;
			case 'typeadd':
				const type = Dex.sanitizeName(args[3]);
				poke.addVolatile('typeadd' as ID, type);
				if (kwArgs.silent) break;
				this.scene.typeAnim(poke, type);
				break;
			case 'dynamax':
				poke.addVolatile('dynamax' as ID);
				this.scene.animTransform(poke, true);
				break;
			case 'powertrick':
				this.scene.resultAnim(poke, 'Power Trick', 'neutral');
				break;
			case 'foresight':
			case 'miracleeye':
				this.scene.resultAnim(poke, 'Identified', 'bad');
				break;
			case 'telekinesis':
				this.scene.resultAnim(poke, 'Telekinesis', 'neutral');
				break;
			case 'confusion':
				if (!kwArgs.already) {
					this.scene.runStatusAnim('confused' as ID, [poke]);
					this.scene.resultAnim(poke, 'Confused', 'bad');
				}
				break;
			case 'leechseed':
				this.scene.updateStatbar(poke);
				break;
			case 'healblock':
				this.scene.resultAnim(poke, 'Heal Block', 'bad');
				break;
			case 'yawn':
				this.scene.resultAnim(poke, 'Drowsy', 'slp');
				break;
			case 'taunt':
				this.scene.resultAnim(poke, 'Taunted', 'bad');
				break;
			case 'imprison':
				this.scene.resultAnim(poke, 'Imprisoning', 'good');
				break;
			case 'disable':
				this.scene.resultAnim(poke, 'Disabled', 'bad');
				break;
			case 'embargo':
				this.scene.resultAnim(poke, 'Embargo', 'bad');
				break;
			case 'torment':
				this.scene.resultAnim(poke, 'Tormented', 'bad');
				break;
			case 'ingrain':
				this.scene.resultAnim(poke, 'Ingrained', 'good');
				break;
			case 'aquaring':
				this.scene.resultAnim(poke, 'Aqua Ring', 'good');
				break;
			case 'stockpile1':
				this.scene.resultAnim(poke, 'Stockpile', 'good');
				break;
			case 'stockpile2':
				poke.removeVolatile('stockpile1' as ID);
				this.scene.resultAnim(poke, 'Stockpile&times;2', 'good');
				break;
			case 'stockpile3':
				poke.removeVolatile('stockpile2' as ID);
				this.scene.resultAnim(poke, 'Stockpile&times;3', 'good');
				break;
			case 'perish0':
				poke.removeVolatile('perish1' as ID);
				break;
			case 'perish1':
				poke.removeVolatile('perish2' as ID);
				this.scene.resultAnim(poke, 'Perish next turn', 'bad');
				break;
			case 'perish2':
				poke.removeVolatile('perish3' as ID);
				this.scene.resultAnim(poke, 'Perish in 2', 'bad');
				break;
			case 'perish3':
				if (!kwArgs.silent) this.scene.resultAnim(poke, 'Perish in 3', 'bad');
				break;
			case 'encore':
				this.scene.resultAnim(poke, 'Encored', 'bad');
				break;
			case 'bide':
				this.scene.resultAnim(poke, 'Bide', 'good');
				break;
			case 'attract':
				this.scene.resultAnim(poke, 'Attracted', 'bad');
				break;
			case 'autotomize':
				this.scene.resultAnim(poke, 'Lightened', 'good');
				if (poke.volatiles.autotomize) {
					poke.volatiles.autotomize[1]++;
				} else {
					poke.addVolatile('autotomize' as ID, 1);
				}
				break;
			case 'focusenergy':
				this.scene.resultAnim(poke, '+Crit rate', 'good');
				break;
			case 'curse':
				this.scene.resultAnim(poke, 'Cursed', 'bad');
				break;
			case 'nightmare':
				this.scene.resultAnim(poke, 'Nightmare', 'bad');
				break;
			case 'magnetrise':
				this.scene.resultAnim(poke, 'Magnet Rise', 'good');
				break;
			case 'smackdown':
				this.scene.resultAnim(poke, 'Smacked Down', 'bad');
				poke.removeVolatile('magnetrise' as ID);
				poke.removeVolatile('telekinesis' as ID);
				if (poke.lastMove === 'fly' || poke.lastMove === 'bounce') this.scene.animReset(poke);
				break;
			case 'substitute':
				if (kwArgs.damage) {
					this.scene.resultAnim(poke, 'Damage', 'bad');
				} else if (kwArgs.block) {
					this.scene.resultAnim(poke, 'Blocked', 'neutral');
				}
				break;

			// Gen 1
			case 'lightscreen':
				this.scene.resultAnim(poke, 'Light Screen', 'good');
				break;
			case 'reflect':
				this.scene.resultAnim(poke, 'Reflect', 'good');
				break;
			}
			poke.addVolatile(effect.id);
			this.scene.updateStatbar(poke);
			this.log(args, kwArgs);
			break;
		}
		case '-end': {
			let poke = this.getPokemon(args[1])!;
			let effect = Dex.getEffect(args[2]);
			let fromeffect = Dex.getEffect(kwArgs.from);
			poke.removeVolatile(effect.id);

			if (kwArgs.silent) {
				// do nothing
			} else {
				switch (effect.id) {
				case 'dynamax':
					this.scene.animTransform(poke);
					break;
				case 'powertrick':
					this.scene.resultAnim(poke, 'Power Trick', 'neutral');
					break;
				case 'telekinesis':
					this.scene.resultAnim(poke, 'Telekinesis&nbsp;ended', 'neutral');
					break;
				case 'skydrop':
					if (kwArgs.interrupt) {
						this.scene.anim(poke, {time: 100});
					}
					break;
				case 'confusion':
					this.scene.resultAnim(poke, 'Confusion&nbsp;ended', 'good');
					break;
				case 'leechseed':
					if (fromeffect.id === 'rapidspin') {
						this.scene.resultAnim(poke, 'De-seeded', 'good');
					}
					break;
				case 'healblock':
					this.scene.resultAnim(poke, 'Heal Block ended', 'good');
					break;
				case 'attract':
					this.scene.resultAnim(poke, 'Attract&nbsp;ended', 'good');
					break;
				case 'taunt':
					this.scene.resultAnim(poke, 'Taunt&nbsp;ended', 'good');
					break;
				case 'disable':
					this.scene.resultAnim(poke, 'Disable&nbsp;ended', 'good');
					break;
				case 'embargo':
					this.scene.resultAnim(poke, 'Embargo ended', 'good');
					break;
				case 'torment':
					this.scene.resultAnim(poke, 'Torment&nbsp;ended', 'good');
					break;
				case 'encore':
					this.scene.resultAnim(poke, 'Encore&nbsp;ended', 'good');
					break;
				case 'bide':
					this.scene.runOtherAnim('bideunleash' as ID, [poke]);
					break;
				case 'illusion':
					this.scene.resultAnim(poke, 'Illusion ended', 'bad');
					poke.rememberAbility('Illusion');
					break;
				case 'slowstart':
					this.scene.resultAnim(poke, 'Slow Start ended', 'good');
					break;
				case 'perishsong': // for backwards compatibility
					poke.removeVolatile('perish3' as ID);
					break;
				case 'substitute':
					this.scene.resultAnim(poke, 'Faded', 'bad');
					break;
				case 'stockpile':
					poke.removeVolatile('stockpile1' as ID);
					poke.removeVolatile('stockpile2' as ID);
					poke.removeVolatile('stockpile3' as ID);
					break;
				default:
					if (effect.effectType === 'Move') {
						if (effect.name === 'Doom Desire') {
							this.scene.runOtherAnim('doomdesirehit' as ID, [poke]);
						}
						if (effect.name === 'Future Sight') {
							this.scene.runOtherAnim('futuresighthit' as ID, [poke]);
						}
					}
				}
			}
			this.scene.updateStatbar(poke);
			this.log(args, kwArgs);
			break;
		}
		case '-singleturn': {
			let poke = this.getPokemon(args[1])!;
			let effect = Dex.getEffect(args[2]);
			poke.addTurnstatus(effect.id);

			if (effect.id === 'roost' && !poke.getTypeList().includes('Flying')) {
				break;
			}
			switch (effect.id) {
			case 'roost':
				this.scene.resultAnim(poke, 'Landed', 'neutral');
				break;
			case 'quickguard':
				this.scene.resultAnim(poke, 'Quick Guard', 'good');
				break;
			case 'wideguard':
				this.scene.resultAnim(poke, 'Wide Guard', 'good');
				break;
			case 'craftyshield':
				this.scene.resultAnim(poke, 'Crafty Shield', 'good');
				break;
			case 'matblock':
				this.scene.resultAnim(poke, 'Mat Block', 'good');
				break;
			case 'protect':
				this.scene.resultAnim(poke, 'Protected', 'good');
				break;
			case 'endure':
				this.scene.resultAnim(poke, 'Enduring', 'good');
				break;
			case 'helpinghand':
				this.scene.resultAnim(poke, 'Helping Hand', 'good');
				break;
			case 'focuspunch':
				this.scene.resultAnim(poke, 'Focusing', 'neutral');
				poke.rememberMove(effect.name, 0);
				break;
			case 'shelltrap':
				this.scene.resultAnim(poke, 'Trap set', 'neutral');
				poke.rememberMove(effect.name, 0);
				break;
			case 'beakblast':
				this.scene.runOtherAnim('bidecharge' as ID, [poke]);
				this.scene.resultAnim(poke, 'Beak Blast', 'neutral');
				break;
			}
			this.scene.updateStatbar(poke);
			this.log(args, kwArgs);
			break;
		}
		case '-singlemove': {
			let poke = this.getPokemon(args[1])!;
			let effect = Dex.getEffect(args[2]);
			poke.addMovestatus(effect.id);

			switch (effect.id) {
			case 'grudge':
				this.scene.resultAnim(poke, 'Grudge', 'neutral');
				break;
			case 'destinybond':
				this.scene.resultAnim(poke, 'Destiny Bond', 'neutral');
				break;
			}
			this.log(args, kwArgs);
			break;
		}
		case '-activate': {
			let poke = this.getPokemon(args[1])!;
			let effect = Dex.getEffect(args[2]);
			let target = this.getPokemon(args[3]);
			this.activateAbility(poke, effect);
			switch (effect.id) {
			case 'grudge':
				poke.rememberMove(kwArgs.move, Infinity);
				break;
			case 'substitute':
				if (kwArgs.damage) {
					this.scene.resultAnim(poke, 'Damage', 'bad');
				} else if (kwArgs.block) {
					this.scene.resultAnim(poke, 'Blocked', 'neutral');
				}
				break;
			case 'attract':
				this.scene.runStatusAnim('attracted' as ID, [poke]);
				break;
			case 'bide':
				this.scene.runOtherAnim('bidecharge' as ID, [poke]);
				break;

			// move activations
			case 'aromatherapy':
				this.scene.resultAnim(poke, 'Team Cured', 'good');
				break;
			case 'healbell':
				this.scene.resultAnim(poke, 'Team Cured', 'good');
				break;
			case 'brickbreak':
				target!.side.removeSideCondition('Reflect');
				target!.side.removeSideCondition('LightScreen');
				break;
			case 'hyperspacefury':
			case 'hyperspacehole':
			case 'phantomforce':
			case 'shadowforce':
			case 'feint':
				this.scene.resultAnim(poke, 'Protection broken', 'bad');
				poke.removeTurnstatus('protect' as ID);
				for (const curTarget of poke.side.pokemon) {
					curTarget.removeTurnstatus('wideguard' as ID);
					curTarget.removeTurnstatus('quickguard' as ID);
					curTarget.removeTurnstatus('craftyshield' as ID);
					curTarget.removeTurnstatus('matblock' as ID);
					this.scene.updateStatbar(curTarget);
				}
				break;
			case 'spite':
				let move = Dex.getMove(kwArgs.move).name;
				let pp = Number(kwArgs.number);
				if (isNaN(pp)) pp = 4;
				poke.rememberMove(move, pp);
				break;
			case 'gravity':
				poke.removeVolatile('magnetrise' as ID);
				poke.removeVolatile('telekinesis' as ID);
				this.scene.anim(poke, {time: 100});
				break;
			case 'skillswap': case 'wanderingspirit':
				if (this.gen <= 4) break;
				let pokeability = Dex.sanitizeName(kwArgs.ability) || target!.ability;
				let targetability = Dex.sanitizeName(kwArgs.ability2) || poke.ability;
				if (pokeability) {
					poke.ability = pokeability;
					if (!target!.baseAbility) target!.baseAbility = pokeability;
				}
				if (targetability) {
					target!.ability = targetability;
					if (!poke.baseAbility) poke.baseAbility = targetability;
				}
				if (poke.side !== target!.side) {
					this.activateAbility(poke, pokeability, true);
					this.activateAbility(target, targetability, true);
				}
				break;

			// ability activations
			case 'forewarn':
				if (target) {
					target.rememberMove(kwArgs.move, 0);
				} else {
					let foeActive = [] as Pokemon[];
					for (const maybeTarget of poke.side.foe.active) {
						if (maybeTarget && !maybeTarget.fainted) foeActive.push(maybeTarget);
					}
					if (foeActive.length === 1) {
						foeActive[0].rememberMove(kwArgs.move, 0);
					}
				}
				break;
			case 'mummy':
				if (!kwArgs.ability) break; // if Mummy activated but failed, no ability will have been sent
				let ability = Dex.getAbility(kwArgs.ability);
				this.activateAbility(target, ability.name);
				this.activateAbility(poke, "Mummy");
				this.scene.wait(700);
				this.activateAbility(target, "Mummy", true);
				break;

			// item activations
			case 'leppaberry':
			case 'mysteryberry':
				poke.rememberMove(kwArgs.move, effect.id === 'leppaberry' ? -10 : -5);
				break;
			case 'focusband':
				poke.item = 'Focus Band';
				break;
			default:
				if (kwArgs.broken) { // for custom moves that break protection
					this.scene.resultAnim(poke, 'Protection broken', 'bad');
				}
			}
			this.log(args, kwArgs);
			break;
		}
		case '-sidestart': {
			let side = this.getSide(args[1]);
			let effect = Dex.getEffect(args[2]);
			side.addSideCondition(effect);

			switch (effect.id) {
			case 'tailwind':
			case 'auroraveil':
			case 'reflect':
			case 'lightscreen':
			case 'safeguard':
			case 'mist':
				this.scene.updateWeather();
				break;
			}
			this.log(args, kwArgs);
			break;
		}
		case '-sideend': {
			let side = this.getSide(args[1]);
			let effect = Dex.getEffect(args[2]);
			// let from = Dex.getEffect(kwArgs.from);
			// let ofpoke = this.getPokemon(kwArgs.of);
			side.removeSideCondition(effect.name);
			this.log(args, kwArgs);
			break;
		}
		case '-weather': {
			let effect = Dex.getEffect(args[1]);
			let poke = this.getPokemon(kwArgs.of) || undefined;
			let ability = Dex.getEffect(kwArgs.from);
			if (!effect.id || effect.id === 'none') {
				kwArgs.from = this.weather;
			}
			this.changeWeather(effect.name, poke, !!kwArgs.upkeep, ability);
			this.log(args, kwArgs);
			break;
		}
		case '-fieldstart': {
			let effect = Dex.getEffect(args[1]);
			let poke = this.getPokemon(kwArgs.of);
			let fromeffect = Dex.getEffect(kwArgs.from);
			this.activateAbility(poke, fromeffect);
			let maxTimeLeft = 0;
			if (effect.id.endsWith('terrain')) {
				for (let i = this.pseudoWeather.length - 1; i >= 0; i--) {
					let pwID = toID(this.pseudoWeather[i][0]);
					if (pwID.endsWith('terrain')) {
						this.pseudoWeather.splice(i, 1);
						continue;
					}
				}
				if (this.gen > 6) maxTimeLeft = 8;
			}
			this.addPseudoWeather(effect.name, 5, maxTimeLeft);

			switch (effect.id) {
			case 'gravity':
				if (!this.fastForward) {
					for (const side of this.sides) {
						for (const active of side.active) {
							if (active) this.scene.runOtherAnim('gravity' as ID, [active]);
						}
					}
				}
				break;
			}
			this.log(args, kwArgs);
			break;
		}
		case '-fieldend': {
			let effect = Dex.getEffect(args[1]);
			// let poke = this.getPokemon(kwArgs.of);
			this.removePseudoWeather(effect.name);
			this.log(args, kwArgs);
			break;
		}
		case '-fieldactivate': {
			let effect = Dex.getEffect(args[1]);
			switch (effect.id) {
			case 'perishsong':
				this.scene.updateStatbars();
				break;
			}
			this.log(args, kwArgs);
			break;
		}
		case '-anim': {
			let poke = this.getPokemon(args[1])!;
			let move = Dex.getMove(args[2]);
			if (this.checkActive(poke)) return;
			let poke2 = this.getPokemon(args[3]);
			this.scene.beforeMove(poke);
			this.animateMove(poke, move, poke2, kwArgs);
			this.scene.afterMove(poke);
			break;
		}
		case '-hint': case '-message': {
			this.log(args, kwArgs);
			break;
		}
		default: {
			throw new Error(`Unrecognized minor action: ${args[0]}`);
			break;
		}}
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

		let data = Dex.getSpecies(name);
		return data.spriteData[siden];
	}
	*/
	/**
	 * @param name Leave blank for Team Preview
	 * @param pokemonid Leave blank for Team Preview
	 * @param details
	 * @param output
	 */
	parseDetails(name: string, pokemonid: string, details: string, output: PokemonDetails = {} as any) {
		const isTeamPreview = !name;
		output.details = details;
		output.name = name;
		output.speciesForme = name;
		output.level = 100;
		output.shiny = false;
		output.gender = '';
		output.ident = (!isTeamPreview ? pokemonid : '');
		output.searchid = (!isTeamPreview ? `${pokemonid}|${details}` : '');
		let splitDetails = details.split(', ');
		if (splitDetails[splitDetails.length - 1] === 'shiny') {
			output.shiny = true;
			splitDetails.pop();
		}
		if (splitDetails[splitDetails.length - 1] === 'M' || splitDetails[splitDetails.length - 1] === 'F') {
			output.gender = splitDetails[splitDetails.length - 1] as GenderName;
			splitDetails.pop();
		}
		if (splitDetails[1]) {
			output.level = parseInt(splitDetails[1].substr(1), 10) || 100;
		}
		if (splitDetails[0]) {
			output.speciesForme = splitDetails[0];
		}
		return output;
	}
	parseHealth(hpstring: string, output: PokemonHealth = {} as any) {
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
		let slotChart: {[k: string]: number} = {a: 0, b: 1, c: 2, d: 3, e: 4, f: 5};
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
		return {name, siden, slot, pokemonid};
	}
	getSwitchedPokemon(pokemonid: string, details: string) {
		if (pokemonid === '??') throw new Error(`pokemonid not passed`);
		const {name, siden, slot, pokemonid: parsedPokemonid} = this.parsePokemonId(pokemonid);
		pokemonid = parsedPokemonid;

		const searchid = `${pokemonid}|${details}`;
		const side = this.sides[siden];

		// search inactive revealed pokemon
		for (let i = 0; i < side.pokemon.length; i++) {
			let pokemon = side.pokemon[i];
			if (pokemon.fainted) continue;
			// already active, can't be switching in
			if (side.active.includes(pokemon)) continue;
			// just switched out, can't be switching in
			if (pokemon === side.lastPokemon && !side.active[slot]) continue;

			if (pokemon.searchid === searchid) {
				// exact match
				if (slot >= 0) pokemon.slot = slot;
				return pokemon;
			}
			if (!pokemon.searchid && pokemon.checkDetails(details)) {
				// switch-in matches Team Preview entry
				pokemon = side.addPokemon(name, pokemonid, details, i);
				if (slot >= 0) pokemon.slot = slot;
				return pokemon;
			}
		}

		// pokemon not found, create a new pokemon object for it
		const pokemon = side.addPokemon(name, pokemonid, details);
		if (slot >= 0) pokemon.slot = slot;
		return pokemon;
	}
	rememberTeamPreviewPokemon(sideid: string, details: string) {
		const {siden} = this.parsePokemonId(sideid);

		return this.sides[siden].addPokemon('', '', details);
	}
	findCorrespondingPokemon(serverPokemon: {ident: string, details: string}) {
		const {siden} = this.parsePokemonId(serverPokemon.ident);
		const searchid = `${serverPokemon.ident}|${serverPokemon.details}`;
		for (const pokemon of this.sides[siden].pokemon) {
			if (pokemon.searchid === searchid) {
				return pokemon;
			}
		}
		return null;
	}
	getPokemon(pokemonid: string | undefined) {
		if (!pokemonid || pokemonid === '??' || pokemonid === 'null' || pokemonid === 'false') {
			return null;
		}
		const {siden, slot, pokemonid: parsedPokemonid} = this.parsePokemonId(pokemonid);
		pokemonid = parsedPokemonid;

		/** if true, don't match an active pokemon */
		const isInactive = (slot < 0);
		const side = this.sides[siden];

		// search player's pokemon
		if (!isInactive && side.active[slot]) return side.active[slot];

		for (const pokemon of side.pokemon) {
			if (isInactive && side.active.includes(pokemon)) continue;
			if (pokemon.ident === pokemonid) { // name matched, good enough
				if (slot >= 0) pokemon.slot = slot;
				return pokemon;
			}
		}

		return null;
	}
	getSide(sidename: string): Side {
		if (sidename === 'p1' || sidename.substr(0, 3) === 'p1:') return this.p1;
		if (sidename === 'p2' || sidename.substr(0, 3) === 'p2:') return this.p2;
		if (this.mySide.id === sidename) return this.mySide;
		if (this.yourSide.id === sidename) return this.yourSide;
		if (this.mySide.name === sidename) return this.mySide;
		if (this.yourSide.name === sidename) return this.yourSide;
		return {
			name: sidename,
			id: sidename.replace(/ /g, ''),
		} as any;
	}

	add(command: string, fastForward?: boolean) {
		if (command) this.activityQueue.push(command);

		if (this.playbackState === Playback.Uninitialized) {
			this.nextActivity();
		} else if (this.playbackState === Playback.Finished) {
			this.playbackState = this.paused ? Playback.Paused : Playback.Playing;
			if (this.paused) return;
			this.scene.updateBgm();
			if (fastForward) {
				this.fastForwardTo(-1);
			} else {
				this.nextActivity();
			}
		}
	}
	/**
	 * PS's preempt system is intended to show chat messages immediately,
	 * instead of waiting for the battle to get to the point where the
	 * message was said.
	 *
	 * In addition to being a nice quality-of-life feature, it's also
	 * important to make sure timer updates happen in real-time.
	 */
	instantAdd(command: string) {
		this.run(command, true);
		this.preemptActivityQueue.push(command);
		this.add(command);
	}
	runMajor(args: Args, kwArgs: KWArgs, preempt?: boolean) {
		switch (args[0]) {
		case 'start': {
			this.scene.teamPreviewEnd();
			this.mySide.active[0] = null;
			this.yourSide.active[0] = null;
			this.start();
			break;
		}
		case 'upkeep': {
			this.usesUpkeep = true;
			this.updatePseudoWeatherLeft();
			this.updateToxicTurns();
			break;
		}
		case 'turn': {
			this.setTurn(args[1]);
			this.log(args);
			break;
		}
		case 'tier': {
			this.tier = args[1];
			if (this.tier.slice(-13) === 'Random Battle') {
				this.speciesClause = true;
			}
			if (this.tier.slice(-8) === ' (Blitz)') {
				this.messageFadeTime = 40;
				this.isBlitz = true;
			}
			this.log(args);
			break;
		}
		case 'gametype': {
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
		}
		case 'rule': {
			let ruleName = args[1].split(': ')[0];
			if (ruleName === 'Species Clause') this.speciesClause = true;
			if (ruleName === 'Blitz') {
				this.messageFadeTime = 40;
				this.isBlitz = true;
			}
			this.log(args);
			break;
		}
		case 'rated': {
			this.rated = args[1] || true;
			this.scene.updateGen();
			this.log(args);
			break;
		}
		case 'inactive': {
			if (!this.kickingInactive) this.kickingInactive = true;
			if (args[1].slice(0, 11) === "Time left: ") {
				let [time, totalTime, graceTime] = args[1].split(' | ');
				this.kickingInactive = parseInt(time.slice(11), 10) || true;
				this.totalTimeLeft = parseInt(totalTime, 10);
				this.graceTimeLeft = parseInt(graceTime || '', 10) || 0;
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
				let userid = window.app?.user?.get('userid');
				if (toID(args[1].slice(0, hasIndex)) === userid) {
					this.kickingInactive = parseInt(args[1].slice(hasIndex + 5), 10) || true;
				}
			} else if (args[1].slice(-27) === ' 15 seconds left this turn.') {
				if (this.isBlitz) return;
			}
			this.log(args, undefined, preempt);
			break;
		}
		case 'inactiveoff': {
			this.kickingInactive = false;
			this.log(args, undefined, preempt);
			break;
		}
		case 'join': case 'j': case 'J': {
			if (this.roomid) {
				let room = app!.rooms[this.roomid];
				let user = BattleTextParser.parseNameParts(args[1]);
				let userid = toUserid(user.name);
				if (!room.users[userid]) room.userCount.users++;
				room.users[userid] = user;
				room.userList.add(userid);
				room.userList.updateUserCount();
				room.userList.updateNoUsersOnline();
			}
			if (!this.ignoreSpects) {
				this.log(args, undefined, preempt);
			}
			break;
		}
		case 'leave': case 'l': case 'L': {
			if (this.roomid) {
				let room = app!.rooms[this.roomid];
				let user = args[1];
				let userid = toUserid(user);
				if (room.users[userid]) room.userCount.users--;
				delete room.users[userid];
				room.userList.remove(userid);
				room.userList.updateUserCount();
				room.userList.updateNoUsersOnline();
			}
			if (!this.ignoreSpects) {
				this.log(args, undefined, preempt);
			}
			break;
		}
		case 'name': case 'n': case 'N': {
			if (this.roomid) {
				let room = app!.rooms[this.roomid];
				let user = BattleTextParser.parseNameParts(args[1]);
				let oldid = args[2];
				if (toUserid(oldid) === app!.user.get('userid')) {
					app!.user.set({
						away: user.away,
						status: user.status,
					});
				}
				let userid = toUserid(user.name);
				room.users[userid] = user;
				room.userList.remove(oldid);
				room.userList.add(userid);
			}
			if (!this.ignoreSpects) {
				this.log(args, undefined, preempt);
			}
			break;
		}
		case 'player': {
			let side = this.getSide(args[1]);
			side.setName(args[2]);
			if (args[3]) side.setAvatar(args[3]);
			if (args[4]) side.rating = args[4];
			this.scene.updateSidebar(side);
			if (this.joinButtons) this.scene.hideJoinButtons();
			this.log(args);
			break;
		}
		case 'teamsize': {
			let side = this.getSide(args[1]);
			side.totalPokemon = parseInt(args[2], 10);
			this.scene.updateSidebar(side);
			break;
		}
		case 'win': case 'tie': {
			this.winner(args[0] === 'tie' ? undefined : args[1]);
			break;
		}
		case 'prematureend': {
			this.prematureEnd();
			break;
		}
		case 'clearpoke': {
			this.p1.clearPokemon();
			this.p2.clearPokemon();
			break;
		}
		case 'poke': {
			let pokemon = this.rememberTeamPreviewPokemon(args[1], args[2])!;
			if (args[3] === 'item') {
				pokemon.item = '(exists)';
			}
			break;
		}
		case 'teampreview': {
			this.teamPreviewCount = parseInt(args[1], 10);
			this.scene.teamPreview();
			break;
		}
		case 'switch': case 'drag': case 'replace': {
			this.endLastTurn();
			let poke = this.getSwitchedPokemon(args[1], args[2])!;
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
			this.log(args, kwArgs);
			break;
		}
		case 'faint': {
			let poke = this.getPokemon(args[1])!;
			poke.side.faint(poke);
			this.log(args, kwArgs);
			break;
		}
		case 'swap': {
			if (isNaN(Number(args[2]))) {
				const poke = this.getPokemon(args[1])!;
				poke.side.swapWith(poke, this.getPokemon(args[2])!, kwArgs);
			} else {
				const poke = this.getPokemon(args[1])!;
				const targetIndex = parseInt(args[2], 10);
				if (kwArgs.from) {
					const target = poke.side.active[targetIndex];
					if (target) args[2] = target.ident;
				}
				poke.side.swapTo(poke, targetIndex, kwArgs);
			}
			this.log(args, kwArgs);
			break;
		}
		case 'move': {
			this.endLastTurn();
			this.resetTurnsSinceMoved();
			let poke = this.getPokemon(args[1])!;
			let move = Dex.getMove(args[2]);
			if (this.checkActive(poke)) return;
			let poke2 = this.getPokemon(args[3]);
			this.scene.beforeMove(poke);
			this.useMove(poke, move, poke2, kwArgs);
			this.animateMove(poke, move, poke2, kwArgs);
			this.log(args, kwArgs);
			this.scene.afterMove(poke);
			break;
		}
		case 'cant': {
			this.endLastTurn();
			this.resetTurnsSinceMoved();
			let poke = this.getPokemon(args[1])!;
			let effect = Dex.getEffect(args[2]);
			let move = Dex.getMove(args[3]);
			this.cantUseMove(poke, effect, move, kwArgs);
			this.log(args, kwArgs);
			break;
		}
		case 'gen': {
			this.gen = parseInt(args[1], 10);
			this.dex = Dex.forGen(this.gen);
			this.scene.updateGen();
			this.log(args);
			break;
		}
		case 'callback': {
			if (this.customCallback) this.customCallback(this, args[1], args.slice(1), kwArgs);
			break;
		}
		case 'fieldhtml': {
			this.playbackState = Playback.Seeking; // force seeking to prevent controls etc
			this.scene.setFrameHTML(BattleLog.sanitizeHTML(args[1]));
			break;
		}
		case 'controlshtml': {
			this.scene.setControlsHTML(BattleLog.sanitizeHTML(args[1]));
			break;
		}
		default: {
			this.log(args, kwArgs, preempt);
			break;
		}}
	}

	run(str: string, preempt?: boolean) {
		if (!preempt && this.preemptActivityQueue.length && str === this.preemptActivityQueue[0]) {
			this.preemptActivityQueue.shift();
			this.scene.preemptCatchup();
			return;
		}
		if (!str) return;
		const {args, kwArgs} = BattleTextParser.parseBattleLine(str);

		if (this.scene.maybeCloseMessagebar(args, kwArgs)) {
			this.activityStep--;
			this.activeMoveIsSpread = null;
			return;
		}

		// parse the next line if it's a minor: runMinor needs it parsed to determine when to merge minors
		let nextArgs: Args = [''];
		let nextKwargs: KWArgs = {};
		const nextLine = this.activityQueue[this.activityStep + 1] || '';
		if (nextLine.slice(0, 2) === '|-') {
			({args: nextArgs, kwArgs: nextKwargs} = BattleTextParser.parseBattleLine(nextLine));
		}

		if (this.debug) {
			if (args[0].charAt(0) === '-' || args[0] === 'detailschange') {
				this.runMinor(args, kwArgs, nextArgs, nextKwargs);
			} else {
				this.runMajor(args, kwArgs, preempt);
			}
		} else {
			try {
				if (args[0].charAt(0) === '-' || args[0] === 'detailschange') {
					this.runMinor(args, kwArgs, nextArgs, nextKwargs);
				} else {
					this.runMajor(args, kwArgs, preempt);
				}
			} catch (err) {
				this.log(['majorerror', 'Error parsing: ' + str + ' (' + err + ')']);
				if (err.stack) {
					let stack = ('' + err.stack).split('\n');
					for (const line of stack) {
						if (/\brun\b/.test(line)) {
							break;
						}
						this.log(['error', line]);
					}
				}
				if (this.errorCallback) this.errorCallback(this);
			}
		}

		if (nextLine.startsWith('|start') || args[0] === 'teampreview') {
			this.started = true;
			if (this.playbackState === Playback.Uninitialized) {
				this.playbackState = Playback.Ready;
			}
			this.scene.updateBgm();
		}
	}
	checkActive(poke: Pokemon) {
		if (!poke.side.active[poke.slot]) {
			// SOMEONE jumped in in the middle of a replay. <_<
			poke.side.replace(poke);
		}
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
		time = Math.floor(Number(time));
		if (isNaN(time)) return;
		if (this.ended && time >= this.turn + 1) return;

		if (time <= this.turn && time !== -1) {
			let paused = this.paused;
			this.reset(true);
			if (paused) this.pause();
			else this.paused = false;
			this.fastForwardWillScroll = true;
		}
		if (!time) {
			this.fastForwardOff();
			this.nextActivity();
			return;
		}
		this.scene.animationOff();
		this.playbackState = Playback.Seeking;
		this.fastForward = time;
		this.nextActivity();
	}
	fastForwardOff() {
		this.fastForward = 0;
		this.scene.animationOn();
		this.playbackState = this.paused ? Playback.Paused : Playback.Playing;
	}
	nextActivity() {
		if (this.playbackState === Playback.Ready || this.playbackState === Playback.Paused) {
			return;
		}

		this.scene.startAnimations();
		let animations = undefined;
		while (!animations) {
			this.waitForAnimations = true;
			if (this.activityStep >= this.activityQueue.length) {
				this.fastForwardOff();
				this.playbackState = Playback.Finished;
				if (this.ended) {
					this.scene.updateBgm();
				}
				if (this.endCallback) this.endCallback(this);
				return;
			}
			// @ts-ignore property modified in method
			if (this.playbackState === Playback.Ready || this.playbackState === Playback.Paused) {
				return;
			}
			this.run(this.activityQueue[this.activityStep]);
			this.activityStep++;
			if (this.waitForAnimations === true) {
				animations = this.scene.finishAnimations();
			} else if (this.waitForAnimations === 'simult') {
				this.scene.timeOffset = 0;
			}
		}

		// @ts-ignore property modified in method
		if (this.playbackState === Playback.Ready || this.playbackState === Playback.Paused) {
			return;
		}

		const interruptionCount = this.scene.interruptionCount;
		animations.done(() => {
			if (interruptionCount === this.scene.interruptionCount) {
				this.nextActivity();
			}
		});
	}

	setQueue(queue: string[]) {
		this.activityQueue = queue;
		this.reset();
	}

	setMute(mute: boolean) {
		BattleSound.setMute(mute);
	}
}

if (typeof require === 'function') {
	// in Node
	(global as any).Battle = Battle;
	(global as any).Pokemon = Pokemon;
}
