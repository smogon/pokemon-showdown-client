/**
 * Pokemon Showdown Dex
 *
 * Roughly equivalent to sim/dex.js in a Pokemon Showdown server, but
 * designed for use in browsers rather than in Node.
 *
 * This is a generic utility library for Pokemon Showdown code: any
 * code shared between the replay viewer and the client usually ends up
 * here.
 *
 * Licensing note: PS's client has complicated licensing:
 * - The client as a whole is AGPLv3
 * - The battle replay/animation engine (battle-*.ts) by itself is MIT
 *
 * Compiled into battledata.js which includes all dependencies
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 */

declare var require: any;
declare var global: any;

if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function indexOf(searchElement, fromIndex) {
		for (let i = (fromIndex || 0); i < this.length; i++) {
			if (this[i] === searchElement) return i;
		}
		return -1;
	};
}
if (!Array.prototype.includes) {
	Array.prototype.includes = function includes(thing) {
		return this.indexOf(thing) !== -1;
	};
}
if (!Array.isArray) {
	Array.isArray = function isArray(thing): thing is any[] {
		return Object.prototype.toString.call(thing) === '[object Array]';
	};
}
if (!String.prototype.includes) {
	String.prototype.includes = function includes(thing) {
		return this.indexOf(thing) !== -1;
	};
}
if (!String.prototype.startsWith) {
	String.prototype.startsWith = function startsWith(thing) {
		return this.slice(0, thing.length) === thing;
	};
}
if (!String.prototype.endsWith) {
	String.prototype.endsWith = function endsWith(thing) {
		return this.slice(-thing.length) === thing;
	};
}
if (!String.prototype.trim) {
	String.prototype.trim = function trim() {
		return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	};
}
if (!Object.assign) {
	Object.assign = function assign(thing: any, rest: any) {
		for (let i = 1; i < arguments.length; i++) {
			let source = arguments[i];
			for (let k in source) {
				thing[k] = source[k];
			}
		}
		return thing;
	};
}
if (!Object.values) {
	Object.values = function values(thing: any) {
		let out: any[] = [];
		for (let k in thing) {
			out.push(thing[k]);
		}
		return out;
	};
}
// if (!Object.create) {
// 	Object.create = function (proto) {
// 		function F() {}
// 		F.prototype = proto;
// 		return new F();
// 	};
// }

if (typeof window === 'undefined') {
	// Node
	(global as any).window = global;
} else {
	// browser (possibly NW.js!)
	window.exports = window;
}

if (window.soundManager) {
	soundManager.setup({url: 'https://play.pokemonshowdown.com/swf/'});
	if (window.Replays) soundManager.onready(window.Replays.soundReady);
	soundManager.onready(() => {
		soundManager.createSound({
			id: 'notif',
			url: 'https://play.pokemonshowdown.com/audio/notification.wav',
		});
	});
}

// @ts-ignore
window.nodewebkit = !!(typeof process !== 'undefined' && process.versions && process.versions['node-webkit']);

function getString(str: any) {
	if (typeof str === 'string' || typeof str === 'number') return '' + str;
	return '';
}

function toID(text: any) {
	if (text && text.id) {
		text = text.id;
	} else if (text && text.userid) {
		text = text.userid;
	}
	if (typeof text !== 'string' && typeof text !== 'number') return '' as ID;
	return ('' + text).toLowerCase().replace(/[^a-z0-9]+/g, '') as ID;
}

function toUserid(text: any) {
	return toID(text);
}

/**
 * Sanitize a room ID by removing anything that isn't alphanumeric or `-`.
 * Shouldn't actually do anything except against malicious input.
 */
function toRoomid(roomid: string) {
	return roomid.replace(/[^a-zA-Z0-9-]+/g, '').toLowerCase();
}

function toName(name: any) {
	if (typeof name !== 'string' && typeof name !== 'number') return '';
	name = ('' + name).replace(/[\|\s\[\]\,\u202e]+/g, ' ').trim();
	if (name.length > 18) name = name.substr(0, 18).trim();

	// remove zalgo
	name = name.replace(
		/[\u0300-\u036f\u0483-\u0489\u0610-\u0615\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06ED\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]{3,}/g,
		''
	);
	name = name.replace(/[\u239b-\u23b9]/g, '');

	return name;
}

interface SpriteData {
	w: number;
	h: number;
	y?: number;
	url?: string;
	rawHTML?: string;
	pixelated?: boolean;
	isBackSprite?: boolean;
	cryurl?: string;
	shiny?: boolean;
}

const Dex = new class implements ModdedDex {
	readonly gen = 7;
	readonly modid = 'gen7' as ID;
	readonly cache = null!;

	readonly statNames: ReadonlyArray<StatName> = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
	readonly statNamesExceptHP: ReadonlyArray<StatNameExceptHP> = ['atk', 'def', 'spa', 'spd', 'spe'];

	resourcePrefix = (() => {
		let prefix = '';
		if (!window.document || !document.location || document.location.protocol !== 'http:') prefix = 'https:';
		return prefix + '//play.pokemonshowdown.com/';
	})();

	fxPrefix = (() => {
		if (window.document && document.location && document.location.protocol === 'file:') {
			if (window.Replays) return 'https://play.pokemonshowdown.com/fx/';
			return 'fx/';
		}
		return '//play.pokemonshowdown.com/fx/';
	})();

	loadedSpriteData = {xy: 1, bw: 0};
	moddedDexes: {[mod: string]: ModdedDex} = {};

	mod(modid: ID): ModdedDex {
		if (modid === 'gen7') return this;
		if (!window.BattleTeambuilderTable) return this;
		if (modid in this.moddedDexes) {
			return this.moddedDexes[modid];
		}
		this.moddedDexes[modid] = new ModdedDex(modid);
		return this.moddedDexes[modid];
	}

	resolveAvatar(avatar: string): string {
		if (window.BattleAvatarNumbers && avatar in BattleAvatarNumbers) {
			avatar = BattleAvatarNumbers[avatar];
		}
		if (avatar.charAt(0) === '#') {
			return Dex.resourcePrefix + 'sprites/trainers-custom/' + toID(avatar.substr(1)) + '.png';
		}
		if (avatar.includes('.') && window.Config && Config.server && Config.server.registered) {
			// custom avatar served by the server
			let protocol = (Config.server.port === 443) ? 'https' : 'http';
			return protocol + '://' + Config.server.host + ':' + Config.server.port +
				'/avatars/' + encodeURIComponent(avatar).replace(/\%3F/g, '?');
		}
		return Dex.resourcePrefix + 'sprites/trainers/' + Dex.sanitizeName(avatar || 'unknown') + '.png';
	}

	/**
	 * This is used to sanitize strings from data files like `moves.js` and
	 * `teambuilder-tables.js`.
	 *
	 * This makes sure untrusted strings can't wreak havoc if someone forgets to
	 * escape it before putting it in HTML.
	 *
	 * None of these characters belong in these files, anyway. (They can be used
	 * in move descriptions, but those are served from `text.js`, which are
	 * definitely always treated as unsanitized.)
	 */
	sanitizeName(name: any) {
		if (!name) return '';
		return ('' + name)
			.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
			.slice(0, 50);
	}

	prefs(prop: string, value?: any, save?: boolean) {
		// @ts-ignore
		if (window.Storage && Storage.prefs) return Storage.prefs(prop, value, save);
		return undefined;
	}

	getShortName(name: string) {
		let shortName = name.replace(/[^A-Za-z0-9]+$/, '');
		if (shortName.indexOf('(') >= 0) {
			shortName += name.slice(shortName.length).replace(/[^\(\)]+/g, '').replace(/\(\)/g, '');
		}
		return shortName;
	}

	getEffect(name: string | null | undefined): PureEffect | Item | Ability | Move {
		name = (name || '').trim();
		if (name.substr(0, 5) === 'item:') {
			return Dex.getItem(name.substr(5).trim());
		} else if (name.substr(0, 8) === 'ability:') {
			return Dex.getAbility(name.substr(8).trim());
		} else if (name.substr(0, 5) === 'move:') {
			return Dex.getMove(name.substr(5).trim());
		}
		let id = toID(name);
		return new PureEffect(id, name);
	}

	getMove(nameOrMove: string | Move | null | undefined): Move {
		if (nameOrMove && typeof nameOrMove !== 'string') {
			// TODO: don't accept Moves here
			return nameOrMove;
		}
		let name = nameOrMove || '';
		let id = toID(nameOrMove);
		if (window.BattleAliases && id in BattleAliases) {
			name = BattleAliases[id];
			id = toID(name);
		}
		if (!window.BattleMovedex) window.BattleMovedex = {};
		let data = window.BattleMovedex[id];
		if (data && typeof data.exists === 'boolean') return data;

		if (!data && id.substr(0, 11) === 'hiddenpower' && id.length > 11) {
			let [, hpWithType, hpPower] = /([a-z]*)([0-9]*)/.exec(id)!;
			data = {
				...(window.BattleMovedex[hpWithType] || {}),
				basePower: Number(hpPower) || 60,
			};
		}
		if (!data && id.substr(0, 6) === 'return' && id.length > 6) {
			data = {
				...(window.BattleMovedex['return'] || {}),
				basePower: Number(id.slice(6)),
			};
		}
		if (!data && id.substr(0, 11) === 'frustration' && id.length > 11) {
			data = {
				...(window.BattleMovedex['frustration'] || {}),
				basePower: Number(id.slice(11)),
			};
		}

		if (!data) data = {exists: false};
		let move = new Move(id, name, data);
		window.BattleMovedex[id] = move;
		return move;
	}

	getGen3Category(type: string) {
		return [
			'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Psychic', 'Dark', 'Dragon',
		].includes(type) ? 'Special' : 'Physical';
	}

	getItem(nameOrItem: string | Item | null | undefined): Item {
		if (nameOrItem && typeof nameOrItem !== 'string') {
			// TODO: don't accept Items here
			return nameOrItem;
		}
		let name = nameOrItem || '';
		let id = toID(nameOrItem);
		if (window.BattleAliases && id in BattleAliases) {
			name = BattleAliases[id];
			id = toID(name);
		}
		if (!window.BattleItems) window.BattleItems = {};
		let data = window.BattleItems[id];
		if (data && typeof data.exists === 'boolean') return data;
		if (!data) data = {exists: false};
		let item = new Item(id, name, data);
		window.BattleItems[id] = item;
		return item;
	}

	getAbility(nameOrAbility: string | Ability | null | undefined): Ability {
		if (nameOrAbility && typeof nameOrAbility !== 'string') {
			// TODO: don't accept Abilities here
			return nameOrAbility;
		}
		let name = nameOrAbility || '';
		let id = toID(nameOrAbility);
		if (window.BattleAliases && id in BattleAliases) {
			name = BattleAliases[id];
			id = toID(name);
		}
		if (!window.BattleAbilities) window.BattleAbilities = {};
		let data = window.BattleAbilities[id];
		if (data && typeof data.exists === 'boolean') return data;
		if (!data) data = {exists: false};
		let ability = new Ability(id, name, data);
		window.BattleAbilities[id] = ability;
		return ability;
	}

	getAbilitiesFor(id: ID, gen: number) {
		return this.mod(`gen${gen}` as ID).getTemplate(id).abilities;
	}

	getTemplate(nameOrTemplate: string | Template | null | undefined): Template {
		if (nameOrTemplate && typeof nameOrTemplate !== 'string') {
			// TODO: don't accept Templates here
			return nameOrTemplate;
		}
		let name = nameOrTemplate || '';
		let id = toID(nameOrTemplate);
		let formid = id;
		if (!window.BattlePokedexAltForms) window.BattlePokedexAltForms = {};
		if (formid in window.BattlePokedexAltForms) return window.BattlePokedexAltForms[formid];
		if (window.BattleAliases && id in BattleAliases) {
			name = BattleAliases[id];
			id = toID(name);
		}
		if (!window.BattlePokedex) window.BattlePokedex = {};
		let data = window.BattlePokedex[id];

		let template: Template;
		if (data && typeof data.exists === 'boolean') {
			template = data;
		} else {
			if (!data) data = {exists: false};
			template = new Template(id, name, data);
			window.BattlePokedex[id] = template;
		}

		if (formid === id || !template.otherForms || !template.otherForms.includes(formid)) {
			return template;
		}
		let forme = formid.slice(id.length);
		forme = forme[0].toUpperCase() + forme.slice(1);
		name = template.baseSpecies + (forme ? '-' + forme : '');

		template = window.BattlePokedexAltForms[formid] = new Template(formid, name, {
			...template,
			name,
			forme,
		});
		return template;
	}

	getTier(pokemon: Pokemon, gen = 7, isDoubles = false): string {
		let table = window.BattleTeambuilderTable;
		gen = Math.floor(gen);
		if (gen < 0 || gen > 7) gen = 7;
		if (gen < 7 && !isDoubles) table = table['gen' + gen];
		if (isDoubles) table = table['gen' + gen + 'doubles'];
		// Prevents Pokemon from having their tier displayed as 'undefined' when they're in a previous generation teambuilder
		if (this.getTemplate(pokemon.species).gen > gen) return 'Illegal';
		return table.overrideTier[toID(pokemon.species)];
	}

	getType(type: any): Effect {
		if (!type || typeof type === 'string') {
			let id = toID(type) as string;
			id = id.substr(0, 1).toUpperCase() + id.substr(1);
			type = (window.BattleTypeChart && window.BattleTypeChart[id]) || {};
			if (type.damageTaken) type.exists = true;
			if (!type.id) type.id = id;
			if (!type.name) type.name = id;
			if (!type.effectType) {
				type.effectType = 'Type';
			}
		}
		return type;
	}

	hasAbility(template: Template, ability: string) {
		for (const i in template.abilities) {
			// @ts-ignore
			if (ability === template.abilities[i]) return true;
		}
		return false;
	}

	loadSpriteData(gen: 'xy' | 'bw') {
		if (this.loadedSpriteData[gen]) return;
		this.loadedSpriteData[gen] = 1;

		let path = $('script[src*="pokedex-mini.js"]').attr('src') || '';
		let qs = '?' + (path.split('?')[1] || '');
		path = (path.match(/.+?(?=data\/pokedex-mini\.js)/) || [])[0] || '';

		let el = document.createElement('script');
		el.src = path + 'data/pokedex-mini-bw.js' + qs;
		document.getElementsByTagName('body')[0].appendChild(el);
	}
	getSpriteData(pokemon: Pokemon | Template | string, siden: number, options: {
		gen?: number, shiny?: boolean, gender?: GenderName, afd?: boolean, noScale?: boolean, mod?: string,
	} = {gen: 6}) {
		if (!options.gen) options.gen = 6;
		if (pokemon instanceof Pokemon) {
			if (pokemon.volatiles.transform) {
				options.shiny = pokemon.volatiles.transform[2];
				options.gender = pokemon.volatiles.transform[3];
			} else {
				options.shiny = pokemon.shiny;
				options.gender = pokemon.gender;
			}
			pokemon = pokemon.getSpecies();
		}
		const template = Dex.getTemplate(pokemon);
		let spriteData = {
			w: 96,
			h: 96,
			y: 0,
			url: Dex.resourcePrefix + 'sprites/',
			pixelated: true,
			isBackSprite: false,
			cryurl: '',
			shiny: options.shiny,
		};
		let name = template.spriteid;
		let dir;
		let facing;
		if (siden) {
			dir = '';
			facing = 'front';
		} else {
			spriteData.isBackSprite = true;
			dir = '-back';
			facing = 'back';
		}

		// Decide what gen sprites to use.
		let fieldGenNum = options.gen;
		if (Dex.prefs('nopastgens')) fieldGenNum = 6;
		if (Dex.prefs('bwgfx') && fieldGenNum >= 6) fieldGenNum = 5;
		let genNum = Math.max(fieldGenNum, Math.min(template.gen, 5));
		let gen = ['', 'rby', 'gsc', 'rse', 'dpp', 'bw', 'xy', 'xy'][genNum];

		let animationData = null;
		let miscData = null;
		let speciesid = template.speciesid;
		if (template.isTotem) speciesid = toID(name);
		if (gen === 'xy' && window.BattlePokemonSprites) {
			animationData = BattlePokemonSprites[speciesid];
		}
		if (gen === 'bw' && window.BattlePokemonSpritesBW) {
			animationData = BattlePokemonSpritesBW[speciesid];
		}
		if (window.BattlePokemonSprites) miscData = BattlePokemonSprites[speciesid];
		if (!miscData && window.BattlePokemonSpritesBW) miscData = BattlePokemonSpritesBW[speciesid];
		if (!animationData) animationData = {};
		if (!miscData) miscData = {};

		if (miscData.num > 0) {
			let baseSpeciesid = toID(template.baseSpecies);
			spriteData.cryurl = 'audio/cries/' + baseSpeciesid;
			let formeid = template.formeid;
			if (template.isMega || formeid && (
				formeid === '-sky' ||
				formeid === '-therian' ||
				formeid === '-primal' ||
				formeid === '-eternal' ||
				baseSpeciesid === 'kyurem' ||
				baseSpeciesid === 'necrozma' ||
				formeid === '-super' ||
				formeid === '-unbound' ||
				formeid === '-midnight' ||
				formeid === '-school' ||
				baseSpeciesid === 'oricorio' ||
				baseSpeciesid === 'zygarde'
			)) {
				spriteData.cryurl += formeid;
			}
			spriteData.cryurl += (window.nodewebkit ? '.ogg' : '.mp3');
		}

		if (options.shiny && options.gen > 1) dir += '-shiny';

		// April Fool's 2014
		if (window.Config && Config.server && Config.server.afd || options.afd) {
			dir = 'afd' + dir;
			spriteData.url += dir + '/' + name + '.png';
			return spriteData;
		}

		// Mod Cries
		if (options.mod) {
			spriteData.cryurl = `sprites/${options.mod}/audio/${toID(template.baseSpecies)}`;
			spriteData.cryurl += (window.nodewebkit ? '.ogg' : '.mp3');
		}

		if (animationData[facing + 'f'] && options.gender === 'F') facing += 'f';
		let allowAnim = !Dex.prefs('noanim') && !Dex.prefs('nogif');
		if (allowAnim && genNum >= 6) spriteData.pixelated = false;
		if (allowAnim && animationData[facing] && genNum >= 5) {
			if (facing.slice(-1) === 'f') name += '-f';
			dir = gen + 'ani' + dir;

			spriteData.w = animationData[facing].w;
			spriteData.h = animationData[facing].h;
			spriteData.url += dir + '/' + name + '.gif';
		} else {
			// There is no entry or enough data in pokedex-mini.js
			// Handle these in case-by-case basis; either using BW sprites or matching the played gen.
			if (gen === 'xy') gen = 'bw';
			dir = gen + dir;

			// Gender differences don't exist prior to Gen 4,
			// so there are no sprites for it
			if (genNum >= 4 && miscData['frontf'] && options.gender === 'F') {
				name += '-f';
			}

			spriteData.url += dir + '/' + name + '.png';
		}

		if (!options.noScale) {
			if (fieldGenNum > 5) {
				// no scaling
			} else if (!spriteData.isBackSprite || fieldGenNum === 5) {
				spriteData.w *= 2;
				spriteData.h *= 2;
				spriteData.y += -16;
			} else {
				// backsprites are multiplied 1.5x by the 3D engine
				spriteData.w *= 2 / 1.5;
				spriteData.h *= 2 / 1.5;
				spriteData.y += -11;
			}
			if (fieldGenNum === 5) spriteData.y = -35;
			if (fieldGenNum === 5 && spriteData.isBackSprite) spriteData.y += 40;
			if (genNum <= 2) spriteData.y += 2;
		}
		if (template.isTotem && !options.noScale) {
			spriteData.w *= 1.5;
			spriteData.h *= 1.5;
			spriteData.y += -11;
		}

		return spriteData;
	}

	getPokemonIcon(pokemon: any, facingLeft?: boolean) {
		let num = 0;
		if (pokemon === 'pokeball') {
			return 'background:transparent url(' + Dex.resourcePrefix + 'sprites/smicons-pokeball-sheet.png) no-repeat scroll -0px 4px';
		} else if (pokemon === 'pokeball-statused') {
			return 'background:transparent url(' + Dex.resourcePrefix + 'sprites/smicons-pokeball-sheet.png) no-repeat scroll -40px 4px';
		} else if (pokemon === 'pokeball-fainted') {
			return 'background:transparent url(' + Dex.resourcePrefix + 'sprites/smicons-pokeball-sheet.png) no-repeat scroll -80px 4px;opacity:.4;filter:contrast(0)';
		} else if (pokemon === 'pokeball-none') {
			return 'background:transparent url(' + Dex.resourcePrefix + 'sprites/smicons-pokeball-sheet.png) no-repeat scroll -80px 4px';
		}
		let id = toID(pokemon);
		if (pokemon && pokemon.species) id = toID(pokemon.species);
		if (pokemon && pokemon.volatiles && pokemon.volatiles.formechange && !pokemon.volatiles.transform) {
			id = toID(pokemon.volatiles.formechange[1]);
		}
		if (pokemon && pokemon.num) {
			num = pokemon.num;
		} else if (window.BattlePokemonSprites && BattlePokemonSprites[id] && BattlePokemonSprites[id].num) {
			num = BattlePokemonSprites[id].num;
		} else if (window.BattlePokedex && window.BattlePokedex[id] && BattlePokedex[id].num) {
			num = BattlePokedex[id].num;
		}
		if (num < 0) num = 0;
		if (num > 809) num = 0;

		if (BattlePokemonIconIndexes[id]) {
			num = BattlePokemonIconIndexes[id];
		}

		if (pokemon && pokemon.gender === 'F') {
			if (id === 'unfezant' || id === 'frillish' || id === 'jellicent' || id === 'meowstic' || id === 'pyroar') {
				num = BattlePokemonIconIndexes[id + 'f'];
			}
		}

		if (facingLeft) {
			if (BattlePokemonIconIndexesLeft[id]) {
				num = BattlePokemonIconIndexesLeft[id];
			}
		}

		let top = Math.floor(num / 12) * 30;
		let left = (num % 12) * 40;
		let fainted = (pokemon && pokemon.fainted ? ';opacity:.3;filter:grayscale(100%) brightness(.5)' : '');
		return 'background:transparent url(' + Dex.resourcePrefix + 'sprites/smicons-sheet.png?a5) no-repeat scroll -' + left + 'px -' + top + 'px' + fainted;
	}

	getTeambuilderSprite(pokemon: any, gen: number = 0) {
		if (!pokemon) return '';
		let id = toID(pokemon.species);
		let spriteid = pokemon.spriteid;
		let template = Dex.getTemplate(pokemon.species);
		if (pokemon.species && !spriteid) {
			spriteid = template.spriteid || toID(pokemon.species);
		}
		if (Dex.getTemplate(pokemon.species).exists === false) {
			return 'background-image:url(' + Dex.resourcePrefix + 'sprites/bw/0.png);background-position:10px 5px;background-repeat:no-repeat';
		}
		let shiny = (pokemon.shiny ? '-shiny' : '');
		// let sdata;
		// if (BattlePokemonSprites[id] && BattlePokemonSprites[id].front && !Dex.prefs('bwgfx')) {
		// 	if (BattlePokemonSprites[id].front.anif && pokemon.gender === 'F') {
		// 		spriteid += '-f';
		// 		sdata = BattlePokemonSprites[id].front.anif;
		// 	} else {
		// 		sdata = BattlePokemonSprites[id].front.ani;
		// 	}
		// } else {
		// 	return 'background-image:url(' + Dex.resourcePrefix + 'sprites/bw' + shiny + '/' + spriteid + '.png);background-position:10px 5px;background-repeat:no-repeat';
		// }
		if (Dex.prefs('nopastgens')) gen = 6;
		let spriteDir = Dex.resourcePrefix + 'sprites/xydex';
		if ((!gen || gen >= 6) && !template.isNonstandard && !Dex.prefs('bwgfx')) {
			let offset = '-2px -3px';
			if (template.gen >= 7) offset = '-6px -7px';
			if (id.substr(0, 6) === 'arceus') offset = '-2px 7px';
			if (id === 'garchomp') offset = '-2px 2px';
			if (id === 'garchompmega') offset = '-2px 0px';
			return 'background-image:url(' + spriteDir + shiny + '/' + spriteid + '.png);background-position:' + offset + ';background-repeat:no-repeat';
		}
		spriteDir = Dex.resourcePrefix + 'sprites/bw';
		if (gen <= 1 && template.gen <= 1) spriteDir = Dex.resourcePrefix + 'sprites/rby';
		else if (gen <= 2 && template.gen <= 2) spriteDir = Dex.resourcePrefix + 'sprites/gsc';
		else if (gen <= 3 && template.gen <= 3) spriteDir = Dex.resourcePrefix + 'sprites/rse';
		else if (gen <= 4 && template.gen <= 4) spriteDir = Dex.resourcePrefix + 'sprites/dpp';
		return 'background-image:url(' + spriteDir + shiny + '/' + spriteid + '.png);background-position:10px 5px;background-repeat:no-repeat';
	}

	getItemIcon(item: any) {
		let num = 0;
		if (typeof item === 'string' && exports.BattleItems) item = exports.BattleItems[toID(item)];
		if (item && item.spritenum) num = item.spritenum;

		let top = Math.floor(num / 16) * 24;
		let left = (num % 16) * 24;
		return 'background:transparent url(' + Dex.resourcePrefix + 'sprites/itemicons-sheet.png) no-repeat scroll -' + left + 'px -' + top + 'px';
	}

	getTypeIcon(type: string, b?: boolean) { // b is just for utilichart.js
		if (!type) return '';
		let sanitizedType = type.replace(/\?/g, '%3f');
		return '<img src="' + Dex.resourcePrefix + 'sprites/types/' + sanitizedType + '.png" alt="' + type + '" height="14" width="32"' + (b ? ' class="b"' : '') + ' />';
	}
};

class ModdedDex {
	readonly gen: number;
	readonly modid: ID;
	readonly cache = {
		Moves: {} as any as {[k: string]: Move},
		Items: {} as any as {[k: string]: Item},
		Templates: {} as any as {[k: string]: Template},
	};
	getAbility: (nameOrAbility: string | Ability | null | undefined) => Ability = Dex.getAbility;
	constructor(modid: ID) {
		this.modid = modid;
		let gen = parseInt(modid.slice(3), 10);
		if (!modid.startsWith('gen') || !gen) throw new Error("Unsupported modid");
		this.gen = gen;
	}
	getMove(name: string): Move {
		let id = toID(name);
		if (window.BattleAliases && id in BattleAliases) {
			name = BattleAliases[id];
			id = toID(name);
		}
		if (this.cache.Moves.hasOwnProperty(id)) return this.cache.Moves[id];

		let data = {...Dex.getMove(name)};

		const table = window.BattleTeambuilderTable[this.modid];
		if (id in table.overrideAcc) data.accuracy = table.overrideAcc[id];
		if (id in table.overrideBP) data.basePower = table.overrideBP[id];
		if (id in table.overridePP) data.pp = table.overridePP[id];
		if (id in table.overrideMoveType) data.type = table.overrideMoveType[id];
		for (let i = this.gen; i < 7; i++) {
			if (id in window.BattleTeambuilderTable['gen' + i].overrideMoveDesc) {
				data.shortDesc = window.BattleTeambuilderTable['gen' + i].overrideMoveDesc[id];
				break;
			}
		}
		if (this.gen <= 3 && data.category !== 'Status') {
			data.category = Dex.getGen3Category(data.type);
		}

		const move = new Move(id, name, data);
		this.cache.Moves[id] = move;
		return move;
	}
	getItem(name: string): Item {
		let id = toID(name);
		if (window.BattleAliases && id in BattleAliases) {
			name = BattleAliases[id];
			id = toID(name);
		}
		if (this.cache.Items.hasOwnProperty(id)) return this.cache.Items[id];

		let data = {...Dex.getItem(name)};

		for (let i = this.gen; i < 7; i++) {
			if (id in window.BattleTeambuilderTable['gen' + i].overrideItemDesc) {
				data.shortDesc = window.BattleTeambuilderTable['gen' + i].overrideItemDesc[id];
				break;
			}
		}

		const item = new Item(id, name, data);
		this.cache.Items[id] = item;
		return item;
	}
	getTemplate(name: string): Template {
		let id = toID(name);
		if (window.BattleAliases && id in BattleAliases) {
			name = BattleAliases[id];
			id = toID(name);
		}
		if (this.cache.Templates.hasOwnProperty(id)) return this.cache.Templates[id];

		let data = {...Dex.getTemplate(name)};

		const table = window.BattleTeambuilderTable[this.modid];
		if (this.gen < 3) {
			data.abilities = {0: "None"};
		} else {
			let abilities = {...data.abilities};
			if (id in table.overrideAbility) {
				abilities['0'] = table.overrideAbility[id];
			}
			if (id in table.removeSecondAbility) {
				delete abilities['1'];
			}
			if (id in table.overrideHiddenAbility) {
				abilities['H'] = table.overrideHiddenAbility[id];
			}
			if (this.gen < 5) delete abilities['H'];
			if (this.gen < 7) delete abilities['S'];

			data.abilities = abilities;
		}
		if (id in table.overrideStats) {
			data.baseStats = {...data.baseStats, ...table.overrideStats[id]};
		}
		if (id in table.overrideType) data.types = table.overrideType[id].split('/');

		if (id in table.overrideTier) data.tier = table.overrideTier[id];

		const template = new Template(id, name, data);
		this.cache.Templates[id] = template;
		return template;
	}
}

if (typeof require === 'function') {
	// in Node
	(global as any).Dex = Dex;
	(global as any).toID = toID;
}
