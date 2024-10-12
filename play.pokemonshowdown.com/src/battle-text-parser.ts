/**
 * Text parser
 *
 * No dependencies
 * Optional dependency: BattleText
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 */

declare const BattleText: {[id: string]: {[templateName: string]: string}};

type Args = [string, ...string[]];
type KWArgs = {[kw: string]: string};
type SideID = 'p1' | 'p2' | 'p3' | 'p4';

class BattleTextParser {
	/** escaped for string.replace */
	p1 = "Player 1";
	/** escaped for string.replace */
	p2 = "Player 2";
	/** escaped for string.replace */
	p3 = "Player 3";
	/** escaped for string.replace */
	p4 = "Player 4";
	perspective: SideID;
	gen = 9;
	turn = 0;
	curLineSection: 'break' | 'preMajor' | 'major' | 'postMajor' = 'break';
	lowercaseRegExp: RegExp | null | undefined = undefined;

	constructor(perspective: SideID = 'p1') {
		this.perspective = perspective;
	}

	static parseLine(line: string, noDefault: true): Args | null;
	static parseLine(line: string): Args;
	static parseLine(line: string, noDefault?: boolean): Args | null {
		if (!line.startsWith('|')) {
			return ['', line];
		}
		if (line === '|') {
			return ['done'];
		}
		const index = line.indexOf('|', 1);
		const cmd = line.slice(1, index);
		switch (cmd) {
		case 'chatmsg': case 'chatmsg-raw': case 'raw': case 'error': case 'html':
		case 'inactive': case 'inactiveoff': case 'warning':
		case 'fieldhtml': case 'controlshtml': case 'bigerror':
		case 'debug': case 'tier': case 'challstr': case 'popup': case '':
			return [cmd, line.slice(index + 1)];
		case 'c': case 'chat': case 'uhtml': case 'uhtmlchange': case 'queryresponse': case 'showteam':
			// three parts
			const index2a = line.indexOf('|', index + 1);
			return [cmd, line.slice(index + 1, index2a), line.slice(index2a + 1)];
		case 'c:': case 'pm':
			// four parts
			const index2b = line.indexOf('|', index + 1);
			const index3b = line.indexOf('|', index2b + 1);
			return [cmd, line.slice(index + 1, index2b), line.slice(index2b + 1, index3b), line.slice(index3b + 1)];
		}
		if (noDefault) return null;
		return line.slice(1).split('|') as [string, ...string[]];
	}

	static parseBattleLine(line: string): {args: Args, kwArgs: KWArgs} {
		let args = this.parseLine(line, true);
		if (args) return {args, kwArgs: {}};

		args = line.slice(1).split('|') as [string, ...string[]];
		const kwArgs: KWArgs = {};
		while (args.length > 1) {
			const lastArg = args[args.length - 1];
			if (lastArg.charAt(0) !== '[') break;
			const bracketPos = lastArg.indexOf(']');
			if (bracketPos <= 0) break;
			// default to '.' so it evaluates to boolean true
			kwArgs[lastArg.slice(1, bracketPos)] = lastArg.slice(bracketPos + 1).trim() || '.';
			args.pop();
		}
		return BattleTextParser.upgradeArgs({args, kwArgs});
	}

	static parseNameParts(text: string) {
		let group = '';
		// names can't start with a symbol
		if (!/[A-Za-z0-9]/.test(text.charAt(0))) {
			group = text.charAt(0);
			text = text.slice(1);
		}

		let name = text;
		const atIndex = text.indexOf('@');
		let status = '';
		let away = false;
		if (atIndex > 0) {
			name = text.slice(0, atIndex);
			status = text.slice(atIndex + 1);
			if (status.startsWith('!')) {
				away = true;
				status = status.slice(1);
			}
		}
		return {group, name, away, status};
	}

	/**
	 * Old replays may use syntax we no longer use, so this function upgrades
	 * them to modern versions. Used to keep battle.ts itself cleaner. Not
	 * guaranteed to mutate or not mutate its inputs.
	 */
	static upgradeArgs({args, kwArgs}: {args: Args, kwArgs: KWArgs}): {args: Args, kwArgs: KWArgs} {
		switch (args[0]) {
		case '-activate': {
			if (kwArgs.item || kwArgs.move || kwArgs.number || kwArgs.ability) return {args, kwArgs};
			let [, pokemon, effect, arg3, arg4] = args;
			let target = kwArgs.of;
			const id = BattleTextParser.effectId(effect);

			if (kwArgs.block) return {args: ['-fail', pokemon], kwArgs};

			if (id === 'wonderguard') return {args: ['-immune', pokemon], kwArgs: {from: 'ability:Wonder Guard'}};

			if (id === 'beatup' && kwArgs.of) return {args, kwArgs: {name: kwArgs.of}};

			if ([
				'ingrain', 'quickguard', 'wideguard', 'craftyshield', 'matblock', 'protect', 'mist', 'safeguard',
				'electricterrain', 'mistyterrain', 'psychicterrain', 'telepathy', 'stickyhold', 'suctioncups', 'aromaveil',
				'flowerveil', 'sweetveil', 'disguise', 'safetygoggles', 'protectivepads',
			].includes(id)) {
				if (target) {
					kwArgs.of = pokemon;
					return {args: ['-block', target, effect, arg3], kwArgs};
				}
				return {args: ['-block', pokemon, effect, arg3], kwArgs};
			}

			if (id === 'charge') {
				return {args: ['-singlemove', pokemon, effect], kwArgs: {of: target}};
			}
			if ([
				'bind', 'wrap', 'clamp', 'whirlpool', 'firespin', 'magmastorm', 'sandtomb', 'infestation', 'snaptrap', 'thundercage', 'trapped',
			].includes(id)) {
				return {args: ['-start', pokemon, effect], kwArgs: {of: target}};
			}

			if (id === 'fairylock') {
				return {args: ['-fieldactivate', effect], kwArgs: {}};
			}

			if (id === 'symbiosis' || id === 'poltergeist') {
				kwArgs.item = arg3;
			} else if (id === 'magnitude') {
				kwArgs.number = arg3;
			} else if (id === 'skillswap' || id === 'mummy' || id === 'lingeringaroma' || id === 'wanderingspirit') {
				kwArgs.ability = arg3;
				kwArgs.ability2 = arg4;
			} else if ([
				'eeriespell', 'gmaxdepletion', 'spite', 'grudge', 'forewarn', 'sketch', 'leppaberry', 'mysteryberry',
			].includes(id)) {
				kwArgs.move = arg3;
				kwArgs.number = arg4;
			}
			args = ['-activate', pokemon, effect, target || ''];
			break;
		}

		case '-fail': {
			if (kwArgs.from === 'ability: Flower Veil') {
				return {args: ['-block', kwArgs.of, 'ability: Flower Veil'], kwArgs: {of: args[1]}};
			}
			break;
		}

		case '-start': {
			if (kwArgs.from === 'Protean' || kwArgs.from === 'Color Change') kwArgs.from = 'ability:' + kwArgs.from;
			break;
		}

		case 'move': {
			if (kwArgs.from === 'Magic Bounce') kwArgs.from = 'ability:Magic Bounce';
			break;
		}

		case 'cant': {
			let [, pokemon, effect, move] = args;
			if (['ability: Damp', 'ability: Dazzling', 'ability: Queenly Majesty', 'ability: Armor Tail'].includes(effect)) {
				args[0] = '-block';
				return {args: ['-block', pokemon, effect, move, kwArgs.of], kwArgs: {}};
			}
			break;
		}

		case '-heal': {
			const id = BattleTextParser.effectId(kwArgs.from);
			if (['dryskin', 'eartheater', 'voltabsorb', 'waterabsorb'].includes(id)) kwArgs.of = '';
			break;
		}

		case '-restoreboost': {
			args[0] = '-clearnegativeboost';
			break;
		}

		case '-nothing':
			// OLD: |-nothing
			// NEW: |-activate||move:Splash
			return {args: ['-activate', '', 'move:Splash'], kwArgs};
		}
		return {args, kwArgs};
	}

	extractMessage(buf: string) {
		let out = '';
		for (const line of buf.split('\n')) {
			const {args, kwArgs} = BattleTextParser.parseBattleLine(line);
			out += this.parseArgs(args, kwArgs) || '';
		}
		return out;
	}

	fixLowercase(input: string) {
		if (this.lowercaseRegExp === undefined) {
			const prefixes = ['pokemon', 'opposingPokemon', 'team', 'opposingTeam', 'party', 'opposingParty'].map(templateId => {
				const template = BattleText.default[templateId];
				if (template.charAt(0) === template.charAt(0).toUpperCase()) return '';
				const bracketIndex = template.indexOf('[');
				if (bracketIndex >= 0) return template.slice(0, bracketIndex);
				return template;
			}).filter(prefix => prefix);
			if (prefixes.length) {
				let buf = `((?:^|\n)(?:  |  \\\(|\\\[)?)(` +
					prefixes.map(BattleTextParser.escapeRegExp).join('|') +
					`)`;
				this.lowercaseRegExp = new RegExp(buf, 'g');
			} else {
				this.lowercaseRegExp = null;
			}
		}
		if (!this.lowercaseRegExp) return input;
		return input.replace(this.lowercaseRegExp, (match, p1, p2) => (
			p1 + p2.charAt(0).toUpperCase() + p2.slice(1)
		));
	}

	static escapeRegExp(input: string) {
		return input.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
	}
	static escapeReplace(input: string) {
		return input.replace(/\$/g, '$$$$');
	}

	/** Returns a pokemon name escaped for passing into the second argument of string.replace */
	pokemonName = (pokemon: string) => {
		if (!pokemon) return '';
		if (!pokemon.startsWith('p')) return `???pokemon:${pokemon}???`;
		if (pokemon.charAt(3) === ':') return BattleTextParser.escapeReplace(pokemon.slice(4).trim());
		else if (pokemon.charAt(2) === ':') return BattleTextParser.escapeReplace(pokemon.slice(3).trim());
		return `???pokemon:${pokemon}???`;
	};

	/** Returns a string escaped for passing into the second argument of string.replace */
	pokemon(pokemon: string) {
		if (!pokemon) return '';
		let side = pokemon.slice(0, 2);
		if (!['p1', 'p2', 'p3', 'p4'].includes(side)) return `???pokemon:${pokemon}???`;
		const name = this.pokemonName(pokemon);
		const isNear = side === this.perspective || side === BattleTextParser.allyID(side as SideID);
		const template = BattleText.default[isNear ? 'pokemon' : 'opposingPokemon'];
		return template.replace('[NICKNAME]', name).replace(/\$/g, '$$$$');
	}

	/** Returns a string escaped for passing into the second argument of string.replace */
	pokemonFull(pokemon: string, details: string): [string, string] {
		const nickname = this.pokemonName(pokemon);

		const species = details.split(',')[0];
		if (nickname === species) return [pokemon.slice(0, 2), `**${species}**`];
		return [pokemon.slice(0, 2), `${nickname} (**${species}**)`];
	}

	trainer(side: string) {
		side = side.slice(0, 2);
		if (side === 'p1') return this.p1;
		if (side === 'p2') return this.p2;
		if (side === 'p3') return this.p3;
		if (side === 'p4') return this.p4;
		return `???side:${side}???`;
	}

	static allyID(sideid: SideID): SideID | '' {
		if (sideid === 'p1') return 'p3';
		if (sideid === 'p2') return 'p4';
		if (sideid === 'p3') return 'p1';
		if (sideid === 'p4') return 'p2';
		return '';
	}

	team(side: string, isFar: boolean = false) {
		side = side.slice(0, 2);
		if (side === this.perspective || side === BattleTextParser.allyID(side as SideID)) {
			return !isFar ? BattleText.default.team : BattleText.default.opposingTeam;
		}
		return isFar ? BattleText.default.team : BattleText.default.opposingTeam;
	}

	own(side: string) {
		side = side.slice(0, 2);
		if (side === this.perspective) {
			return 'OWN';
		}
		return '';
	}

	party(side: string) {
		side = side.slice(0, 2);
		if (side === this.perspective || side === BattleTextParser.allyID(side as SideID)) {
			return BattleText.default.party;
		}
		return BattleText.default.opposingParty;
	}

	static effectId(effect?: string) {
		if (!effect) return '';
		if (effect.startsWith('item:') || effect.startsWith('move:')) {
			effect = effect.slice(5);
		} else if (effect.startsWith('ability:')) {
			effect = effect.slice(8);
		}
		return toID(effect);
	}

	effect(effect?: string) {
		if (!effect) return '';
		if (effect.startsWith('item:') || effect.startsWith('move:')) {
			effect = effect.slice(5);
		} else if (effect.startsWith('ability:')) {
			effect = effect.slice(8);
		}
		return effect.trim();
	}

	template(type: string, ...namespaces: (string | undefined)[]) {
		for (const namespace of namespaces) {
			if (!namespace) continue;
			if (namespace === 'OWN') {
				return BattleText.default[type + 'Own'] + '\n';
			}
			if (namespace === 'NODEFAULT') {
				return '';
			}
			let id = BattleTextParser.effectId(namespace);
			if (BattleText[id] && type in BattleText[id]) {
				if (BattleText[id][type].charAt(1) === '.') type = BattleText[id][type].slice(2) as ID;
				if (BattleText[id][type].charAt(0) === '#') id = BattleText[id][type].slice(1) as ID;
				if (!BattleText[id][type]) return '';
				return BattleText[id][type] + '\n';
			}
		}
		if (!BattleText.default[type]) return '';
		return BattleText.default[type] + '\n';
	}

	maybeAbility(effect: string | undefined, holder: string) {
		if (!effect) return '';
		if (!effect.startsWith('ability:')) return '';
		return this.ability(effect.slice(8).trim(), holder);
	}

	ability(name: string | undefined, holder: string) {
		if (!name) return '';
		return BattleText.default.abilityActivation.replace('[POKEMON]', this.pokemon(holder)).replace('[ABILITY]', this.effect(name)) + '\n';
	}

	static stat(stat: string) {
		const entry = BattleText[stat || "stats"];
		if (!entry || !entry.statName) return `???stat:${stat}???`;
		return entry.statName;
	}

	lineSection(args: Args, kwArgs: KWArgs) {
		const cmd = args[0];
		switch (cmd) {
		case 'done' : case 'turn':
			return 'break';
		case 'move' : case 'cant': case 'switch': case 'drag': case 'upkeep': case 'start':
		case '-mega': case '-candynamax': case '-terastallize':
			return 'major';
		case 'switchout': case 'faint':
			return 'preMajor';
		case '-zpower':
			return 'postMajor';
		case '-damage': {
			const id = BattleTextParser.effectId(kwArgs.from);
			if (id === 'confusion') return 'major';
			return 'postMajor';
		}
		case '-curestatus': {
			const id = BattleTextParser.effectId(kwArgs.from);
			if (id === 'naturalcure') return 'preMajor';
			return 'postMajor';
		}
		case '-start': {
			const id = BattleTextParser.effectId(kwArgs.from);
			if (id === 'protean') return 'preMajor';
			return 'postMajor';
		}
		case '-activate': {
			const id = BattleTextParser.effectId(args[2]);
			if (id === 'confusion' || id === 'attract') return 'preMajor';
			return 'postMajor';
		}
		}
		return (cmd.charAt(0) === '-' ? 'postMajor' : '');
	}

	sectionBreak(args: Args, kwArgs: KWArgs) {
		const prevSection = this.curLineSection;
		const curSection = this.lineSection(args, kwArgs);
		if (!curSection) return false;
		this.curLineSection = curSection;
		switch (curSection) {
		case 'break':
			if (prevSection !== 'break') return true;
			return false;
		case 'preMajor':
		case 'major':
			if (prevSection === 'postMajor' || prevSection === 'major') return true;
			return false;
		case 'postMajor':
			return false;
		}
	}

	parseArgs(args: Args, kwArgs: KWArgs, noSectionBreak?: boolean) {
		let buf = !noSectionBreak && this.sectionBreak(args, kwArgs) ? '\n' : '';
		return buf + this.fixLowercase(this.parseArgsInner(args, kwArgs) || '');
	}

	parseArgsInner(args: Args, kwArgs: KWArgs) {
		let cmd = args[0];
		switch (cmd) {
		case 'player': {
			const [, side, name] = args;
			if (side === 'p1' && name) {
				this.p1 = BattleTextParser.escapeReplace(name);
			} else if (side === 'p2' && name) {
				this.p2 = BattleTextParser.escapeReplace(name);
			} else if (side === 'p3' && name) {
				this.p3 = BattleTextParser.escapeReplace(name);
			} else if (side === 'p4' && name) {
				this.p4 = BattleTextParser.escapeReplace(name);
			}
			return '';
		}

		case 'gen': {
			const [, num] = args;
			this.gen = parseInt(num, 10);
			return '';
		}

		case 'turn': {
			const [, num] = args;
			this.turn = Number.parseInt(num, 10);
			return this.template('turn').replace('[NUMBER]', num) + '\n';
		}

		case 'start': {
			return this.template('startBattle').replace('[TRAINER]', this.p1).replace('[TRAINER]', this.p2);
		}

		case 'win': case 'tie': {
			const [, name] = args;
			if (cmd === 'tie' || !name) {
				return this.template('tieBattle').replace('[TRAINER]', this.p1).replace('[TRAINER]', this.p2);
			}
			return this.template('winBattle').replace('[TRAINER]', name);
		}

		case 'switch': {
			const [, pokemon, details] = args;
			const [side, fullname] = this.pokemonFull(pokemon, details);
			const template = this.template('switchIn', this.own(side));
			return template.replace('[TRAINER]', this.trainer(side)).replace('[FULLNAME]', fullname);
		}

		case 'drag': {
			const [, pokemon, details] = args;
			const [side, fullname] = this.pokemonFull(pokemon, details);
			const template = this.template('drag');
			return template.replace('[TRAINER]', this.trainer(side)).replace('[FULLNAME]', fullname);
		}

		case 'detailschange': case '-transform': case '-formechange': {
			const [, pokemon, arg2, arg3] = args;
			let newSpecies = '';
			switch (cmd) {
			case 'detailschange': newSpecies = arg2.split(',')[0].trim(); break;
			case '-transform': newSpecies = arg3; break;
			case '-formechange': newSpecies = arg2; break;
			}
			let newSpeciesId = toID(newSpecies);
			let id = '';
			let templateName = 'transform';
			if (cmd !== '-transform') {
				switch (newSpeciesId) {
				case 'greninjaash': id = 'battlebond'; break;
				case 'mimikyubusted': id = 'disguise'; break;
				case 'zygardecomplete': id = 'powerconstruct'; break;
				case 'necrozmaultra': id = 'ultranecroziumz'; break;
				case 'darmanitanzen': id = 'zenmode'; break;
				case 'darmanitan': id = 'zenmode'; templateName = 'transformEnd'; break;
				case 'darmanitangalarzen': id = 'zenmode'; break;
				case 'darmanitangalar': id = 'zenmode'; templateName = 'transformEnd'; break;
				case 'aegislashblade': id = 'stancechange'; break;
				case 'aegislash': id = 'stancechange'; templateName = 'transformEnd'; break;
				case 'wishiwashischool': id = 'schooling'; break;
				case 'wishiwashi': id = 'schooling'; templateName = 'transformEnd'; break;
				case 'miniormeteor': id = 'shieldsdown'; break;
				case 'minior': id = 'shieldsdown'; templateName = 'transformEnd'; break;
				case 'eiscuenoice': id = 'iceface'; break;
				case 'eiscue': id = 'iceface'; templateName = 'transformEnd'; break;
				case 'terapagosterastal': id = 'terashift'; break;
				}
			} else if (newSpecies) {
				id = 'transform';
			}
			const template = this.template(templateName, id, kwArgs.msg ? '' : 'NODEFAULT');
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[SPECIES]', newSpecies);
		}

		case 'switchout': {
			const [, pokemon] = args;
			const side = pokemon.slice(0, 2);
			const template = this.template('switchOut', kwArgs.from, this.own(side));
			return template.replace('[TRAINER]', this.trainer(side)).replace('[NICKNAME]', this.pokemonName(pokemon)).replace('[POKEMON]', this.pokemon(pokemon));
		}

		case 'faint': {
			const [, pokemon] = args;
			const template = this.template('faint');
			return template.replace('[POKEMON]', this.pokemon(pokemon));
		}

		case 'swap': {
			const [, pokemon, target] = args;
			if (!target || !isNaN(Number(target))) {
				const template = this.template('swapCenter');
				return template.replace('[POKEMON]', this.pokemon(pokemon));
			}
			const template = this.template('swap');
			return template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[TARGET]', this.pokemon(target));
		}

		case 'move': {
			const [, pokemon, move] = args;
			let line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			if (kwArgs.zeffect) {
				line1 = this.template('zEffect').replace('[POKEMON]', this.pokemon(pokemon));
			}
			const template = this.template('move', kwArgs.from);
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[MOVE]', move);
		}

		case 'cant': {
			let [, pokemon, effect, move] = args;
			const template = this.template('cant', effect, 'NODEFAULT') ||
				this.template(move ? 'cant' : 'cantNoMove');
			const line1 = this.maybeAbility(effect, kwArgs.of || pokemon);
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[MOVE]', move);
		}

		case '-candynamax': {
			let [, side] = args;
			const own = this.own(side);
			let template = '';
			if (this.turn === 1) {
				if (own) template = this.template('canDynamax', own);
			} else {
				template = this.template('canDynamax', own);
			}
			return template.replace('[TRAINER]', this.trainer(side));
		}

		case 'message': {
			let [, message] = args;
			return '' + message + '\n';
		}

		case '-start': {
			let [, pokemon, effect, arg3] = args;
			const line1 = this.maybeAbility(effect, pokemon) || this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			let id = BattleTextParser.effectId(effect);
			if (id === 'typechange') {
				const template = this.template('typeChange', kwArgs.from);
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[TYPE]', arg3).replace('[SOURCE]', this.pokemon(kwArgs.of));
			}
			if (id === 'typeadd') {
				const template = this.template('typeAdd', kwArgs.from);
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[TYPE]', arg3);
			}
			if (id.startsWith('stockpile')) {
				const num = id.slice(9);
				const template = this.template('start', 'stockpile');
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[NUMBER]', num);
			}
			if (id.startsWith('perish')) {
				const num = id.slice(6);
				const template = this.template('activate', 'perishsong');
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[NUMBER]', num);
			}
			if (id.startsWith('protosynthesis') || id.startsWith('quarkdrive')) {
				const stat = id.slice(-3);
				const template = this.template('start', id.slice(0, id.length - 3));
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[STAT]', BattleTextParser.stat(stat));
			}
			let templateId = 'start';
			if (kwArgs.already) templateId = 'alreadyStarted';
			if (kwArgs.fatigue) templateId = 'startFromFatigue';
			if (kwArgs.zeffect) templateId = 'startFromZEffect';
			if (kwArgs.damage) templateId = 'activate';
			if (kwArgs.block) templateId = 'block';
			if (kwArgs.upkeep) templateId = 'upkeep';
			if (id === 'mist' && this.gen <= 2) templateId = 'startGen' + this.gen;
			if (id === 'reflect' || id === 'lightscreen') templateId = 'startGen1';
			if (templateId === 'start' && kwArgs.from?.startsWith('item:')) {
				templateId += 'FromItem';
			}
			const template = this.template(templateId, kwArgs.from, effect);
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[EFFECT]', this.effect(effect)).replace('[MOVE]', arg3).replace('[SOURCE]', this.pokemon(kwArgs.of)).replace('[ITEM]', this.effect(kwArgs.from));
		}

		case '-end': {
			let [, pokemon, effect] = args;
			const line1 = this.maybeAbility(effect, pokemon) || this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			let id = BattleTextParser.effectId(effect);
			if (id === 'doomdesire' || id === 'futuresight') {
				const template = this.template('activate', effect);
				return line1 + template.replace('[TARGET]', this.pokemon(pokemon));
			}
			let templateId = 'end';
			let template = '';
			if (kwArgs.from?.startsWith('item:')) {
				template = this.template('endFromItem', effect);
			}
			if (!template) template = this.template(templateId, effect);
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[EFFECT]', this.effect(effect)).replace('[SOURCE]', this.pokemon(kwArgs.of)).replace('[ITEM]', this.effect(kwArgs.from));
		}

		case '-ability': {
			let [, pokemon, ability, oldAbility, arg4] = args;
			let line1 = '';
			if (oldAbility && (oldAbility.startsWith('p1') || oldAbility.startsWith('p2') || oldAbility === 'boost')) {
				arg4 = oldAbility;
				oldAbility = '';
			}
			if (oldAbility) line1 += this.ability(oldAbility, pokemon);
			line1 += this.ability(ability, pokemon);
			if (kwArgs.fail) {
				const template = this.template('block', kwArgs.from);
				return line1 + template;
			}
			if (kwArgs.from) {
				line1 = this.maybeAbility(kwArgs.from, pokemon) + line1;
				const template = this.template('changeAbility', kwArgs.from);
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[ABILITY]', this.effect(ability)).replace('[SOURCE]', this.pokemon(kwArgs.of));
			}
			const id = BattleTextParser.effectId(ability);
			if (id === 'unnerve') {
				const template = this.template('start', ability);
				return line1 + template.replace('[TEAM]', this.team(pokemon.slice(0, 2), true));
			}
			let templateId = 'start';
			if (id === 'anticipation' || id === 'sturdy') templateId = 'activate';
			const template = this.template(templateId, ability, 'NODEFAULT');
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon));
		}

		case '-endability': {
			let [, pokemon, ability] = args;
			if (ability) return this.ability(ability, pokemon);
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			const template = this.template('start', 'Gastro Acid');
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon));
		}

		case '-item': {
			const [, pokemon, item] = args;
			const id = BattleTextParser.effectId(kwArgs.from);
			let target = '';
			if (['magician', 'pickpocket'].includes(id)) {
				[target, kwArgs.of] = [kwArgs.of, ''];
			}
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			if (['thief', 'covet', 'bestow', 'magician', 'pickpocket'].includes(id)) {
				const template = this.template('takeItem', kwArgs.from);
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[ITEM]', this.effect(item)).replace('[SOURCE]', this.pokemon(target || kwArgs.of));
			}
			if (id === 'frisk') {
				const hasTarget = kwArgs.of && pokemon && kwArgs.of !== pokemon;
				const template = this.template(hasTarget ? 'activate' : 'activateNoTarget', "Frisk");
				return line1 + template.replace('[POKEMON]', this.pokemon(kwArgs.of)).replace('[ITEM]', this.effect(item)).replace('[TARGET]', this.pokemon(pokemon));
			}
			if (kwArgs.from) {
				const template = this.template('addItem', kwArgs.from);
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[ITEM]', this.effect(item));
			}
			const template = this.template('start', item, 'NODEFAULT');
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon));
		}

		case '-enditem': {
			let [, pokemon, item] = args;
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			if (kwArgs.eat) {
				const template = this.template('eatItem', kwArgs.from);
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[ITEM]', this.effect(item));
			}
			const id = BattleTextParser.effectId(kwArgs.from);
			if (id === 'gem') {
				const template = this.template('useGem', item);
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[ITEM]', this.effect(item)).replace('[MOVE]', kwArgs.move);
			}
			if (id === 'stealeat') {
				const template = this.template('removeItem', "Bug Bite");
				return line1 + template.replace('[SOURCE]', this.pokemon(kwArgs.of)).replace('[ITEM]', this.effect(item));
			}
			if (kwArgs.from) {
				const template = this.template('removeItem', kwArgs.from);
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[ITEM]', this.effect(item)).replace('[SOURCE]', this.pokemon(kwArgs.of));
			}
			if (kwArgs.weaken) {
				const template = this.template('activateWeaken');
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[ITEM]', this.effect(item));
			}
			let template = this.template('end', item, 'NODEFAULT');
			if (!template) template = this.template('activateItem').replace('[ITEM]', this.effect(item));
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[TARGET]', this.pokemon(kwArgs.of));
		}

		case '-status': {
			const [, pokemon, status] = args;
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			if (BattleTextParser.effectId(kwArgs.from) === 'rest') {
				const template = this.template('startFromRest', status);
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon));
			}
			const template = this.template('start', status);
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon));
		}

		case '-curestatus': {
			const [, pokemon, status] = args;
			if (BattleTextParser.effectId(kwArgs.from) === 'naturalcure') {
				const template = this.template('activate', kwArgs.from);
				return template.replace('[POKEMON]', this.pokemon(pokemon));
			}
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			if (kwArgs.from?.startsWith('item:')) {
				const template = this.template('endFromItem', status);
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[ITEM]', this.effect(kwArgs.from));
			}
			if (kwArgs.thaw) {
				const template = this.template('endFromMove', status);
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[MOVE]', this.effect(kwArgs.from));
			}
			let template = this.template('end', status, 'NODEFAULT');
			if (!template) template = this.template('end').replace('[EFFECT]', status);
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon));
		}

		case '-cureteam': {
			return this.template('activate', kwArgs.from);
		}

		case '-singleturn': case '-singlemove': {
			const [, pokemon, effect] = args;
			const line1 = this.maybeAbility(effect, kwArgs.of || pokemon) ||
				this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			let id = BattleTextParser.effectId(effect);
			if (id === 'instruct') {
				const template = this.template('activate', effect);
				return line1 + template.replace('[POKEMON]', this.pokemon(kwArgs.of)).replace('[TARGET]', this.pokemon(pokemon));
			}
			let template = this.template('start', effect, 'NODEFAULT');
			if (!template) template = this.template('start').replace('[EFFECT]', this.effect(effect));
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[SOURCE]', this.pokemon(kwArgs.of)).replace('[TEAM]', this.team(pokemon.slice(0, 2)));
		}

		case '-sidestart': {
			let [, side, effect] = args;
			let template = this.template('start', effect, 'NODEFAULT');
			if (!template) template = this.template('startTeamEffect').replace('[EFFECT]', this.effect(effect));
			return template.replace('[TEAM]', this.team(side)).replace('[PARTY]', this.party(side));
		}

		case '-sideend': {
			let [, side, effect] = args;
			let template = this.template('end', effect, 'NODEFAULT');
			if (!template) template = this.template('endTeamEffect').replace('[EFFECT]', this.effect(effect));
			return template.replace('[TEAM]', this.team(side)).replace('[PARTY]', this.party(side));
		}

		case '-weather': {
			const [, weather] = args;
			if (!weather || weather === 'none') {
				const template = this.template('end', kwArgs.from, 'NODEFAULT');
				if (!template) return this.template('endFieldEffect').replace('[EFFECT]', this.effect(weather));
				return template;
			}
			if (kwArgs.upkeep) {
				return this.template('upkeep', weather, 'NODEFAULT');
			}
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of);
			let template = this.template('start', weather, 'NODEFAULT');
			if (!template) template = this.template('startFieldEffect').replace('[EFFECT]', this.effect(weather));
			return line1 + template;
		}

		case '-fieldstart': case '-fieldactivate': {
			const [, effect] = args;
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of);
			if (BattleTextParser.effectId(kwArgs.from) === 'hadronengine') {
				return line1 + this.template('start', 'hadronengine').replace('[POKEMON]', this.pokemon(kwArgs.of));
			}
			let templateId = cmd.slice(6);
			if (BattleTextParser.effectId(effect) === 'perishsong') templateId = 'start';
			let template = this.template(templateId, effect, 'NODEFAULT');
			if (!template) template = this.template('startFieldEffect').replace('[EFFECT]', this.effect(effect));
			return line1 + template.replace('[POKEMON]', this.pokemon(kwArgs.of));
		}

		case '-fieldend': {
			let [, effect] = args;
			let template = this.template('end', effect, 'NODEFAULT');
			if (!template) template = this.template('endFieldEffect').replace('[EFFECT]', this.effect(effect));
			return template;
		}

		case '-sethp': {
			let effect = kwArgs.from;
			return this.template('activate', effect);
		}

		case '-message': {
			let [, message] = args;
			return '  ' + message + '\n';
		}

		case '-hint': {
			let [, message] = args;
			return '  (' + message + ')\n';
		}

		case '-activate': {
			let [, pokemon, effect, target] = args;
			let id = BattleTextParser.effectId(effect);
			if (id === 'celebrate') {
				return this.template('activate', 'celebrate').replace('[TRAINER]', this.trainer(pokemon.slice(0, 2)));
			}
			if (!target &&
				['hyperdrill', 'hyperspacefury', 'hyperspacehole', 'phantomforce', 'shadowforce', 'feint'].includes(id)) {
				[pokemon, target] = [kwArgs.of, pokemon];
				if (!pokemon) pokemon = target;
			}
			if (!target) target = kwArgs.of || pokemon;

			let line1 = this.maybeAbility(effect, pokemon);

			if (id === 'lockon' || id === 'mindreader') {
				const template = this.template('start', effect);
				return line1 + template.replace('[POKEMON]', this.pokemon(kwArgs.of)).replace('[SOURCE]', this.pokemon(pokemon));
			}

			if ((id === 'mummy' || id === 'lingeringaroma') && kwArgs.ability) {
				line1 += this.ability(kwArgs.ability, target);
				line1 += this.ability(id === 'mummy' ? 'Mummy' : 'Lingering Aroma', target);
				const template = this.template('changeAbility', id);
				return line1 + template.replace('[TARGET]', this.pokemon(target));
			}

			if (id === 'commander') {
				// Commander didn't have a message prior to v1.2.0 of SV
				// so this is for backwards compatibility
				if (target === pokemon) return line1;
				const template = this.template('activate', id);
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace(/\[TARGET\]/g, this.pokemon(target));
			}

			let templateId = 'activate';
			if (id === 'forewarn' && pokemon === target) {
				templateId = 'activateNoTarget';
			}
			if ((id === 'protosynthesis' || id === 'quarkdrive') && kwArgs.fromitem) {
				templateId = 'activateFromItem';
			}
			if (id === 'orichalcumpulse' && kwArgs.source) {
				templateId = 'start';
			}
			let template = this.template(templateId, effect, 'NODEFAULT');
			if (!template) {
				if (line1) return line1; // Abilities don't have a default template
				template = this.template('activate');
				return line1 + template.replace('[EFFECT]', this.effect(effect));
			}

			if (id === 'brickbreak') {
				template = template.replace('[TEAM]', this.team(target.slice(0, 2)));
			}
			if (kwArgs.ability) {
				line1 += this.ability(kwArgs.ability, pokemon);
			}
			if (kwArgs.ability2) {
				line1 += this.ability(kwArgs.ability2, target);
			}
			if (kwArgs.move || kwArgs.number || kwArgs.item || kwArgs.name) {
				template = template.replace('[MOVE]', kwArgs.move).replace('[NUMBER]', kwArgs.number).replace('[ITEM]', kwArgs.item).replace('[NAME]', kwArgs.name);
			}
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[TARGET]', this.pokemon(target)).replace('[SOURCE]', this.pokemon(kwArgs.of));
		}

		case '-prepare': {
			const [, pokemon, effect, target] = args;
			const template = this.template('prepare', effect);
			return template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[TARGET]', this.pokemon(target));
		}

		case '-damage': {
			let [, pokemon, , percentage] = args;
			let template = this.template('damage', kwArgs.from, 'NODEFAULT');
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			const id = BattleTextParser.effectId(kwArgs.from);
			if (template) {
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon));
			}

			if (!kwArgs.from) {
				template = this.template(percentage ? 'damagePercentage' : 'damage');
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[PERCENTAGE]', percentage);
			}
			if (kwArgs.from.startsWith('item:')) {
				template = this.template(kwArgs.of ? 'damageFromPokemon' : 'damageFromItem');
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[ITEM]', this.effect(kwArgs.from)).replace('[SOURCE]', this.pokemon(kwArgs.of));
			}
			if (kwArgs.partiallytrapped || id === 'bind' || id === 'wrap') {
				template = this.template('damageFromPartialTrapping');
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[MOVE]', this.effect(kwArgs.from));
			}

			template = this.template('damage');
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon));
		}

		case '-heal': {
			let [, pokemon] = args;
			let template = this.template('heal', kwArgs.from, 'NODEFAULT');
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			if (template) {
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[SOURCE]', this.pokemon(kwArgs.of)).replace('[NICKNAME]', kwArgs.wisher);
			}

			if (kwArgs.from && !kwArgs.from.startsWith('ability:')) {
				template = this.template('healFromEffect');
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[EFFECT]', this.effect(kwArgs.from));
			}

			template = this.template('heal');
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon));
		}

		case '-boost': case '-unboost': {
			let [, pokemon, stat, num] = args;
			if (stat === 'spa' && this.gen === 1) stat = 'spc';
			const amount = parseInt(num, 10);
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			let templateId = cmd.slice(1);
			if (amount >= 3) templateId += '3';
			else if (amount >= 2) templateId += '2';
			else if (amount === 0) templateId += '0';
			if (amount && kwArgs.zeffect) {
				templateId += (kwArgs.multiple ? 'MultipleFromZEffect' : 'FromZEffect');
			} else if (amount && kwArgs.from?.startsWith('item:')) {
				const template = this.template(templateId + 'FromItem', kwArgs.from);
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[STAT]', BattleTextParser.stat(stat)).replace('[ITEM]', this.effect(kwArgs.from));
			}
			const template = this.template(templateId, kwArgs.from);
			return line1 + template.replace(/\[POKEMON\]/g, this.pokemon(pokemon)).replace('[STAT]', BattleTextParser.stat(stat));
		}

		case '-setboost': {
			const [, pokemon] = args;
			const effect = kwArgs.from;
			const line1 = this.maybeAbility(effect, kwArgs.of || pokemon);
			const template = this.template('boost', effect);
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon));
		}

		case '-swapboost': {
			const [, pokemon, target] = args;
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			const id = BattleTextParser.effectId(kwArgs.from);
			let templateId = 'swapBoost';
			if (id === 'guardswap') templateId = 'swapDefensiveBoost';
			if (id === 'powerswap') templateId = 'swapOffensiveBoost';
			const template = this.template(templateId, kwArgs.from);
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[TARGET]', this.pokemon(target));
		}

		case '-copyboost': {
			const [, pokemon, target] = args;
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			const template = this.template('copyBoost', kwArgs.from);
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[TARGET]', this.pokemon(target));
		}

		case '-clearboost': case '-clearpositiveboost': case '-clearnegativeboost': {
			const [, pokemon, source] = args;
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			let templateId = 'clearBoost';
			if (kwArgs.zeffect) templateId = 'clearBoostFromZEffect';
			const template = this.template(templateId, kwArgs.from);
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[SOURCE]', this.pokemon(source));
		}

		case '-invertboost': {
			const [, pokemon] = args;
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			const template = this.template('invertBoost', kwArgs.from);
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon));
		}

		case '-clearallboost': {
			return this.template('clearAllBoost', kwArgs.from);
		}

		case '-crit': case '-supereffective': case '-resisted': {
			const [, pokemon] = args;
			let templateId = cmd.slice(1);
			if (templateId === 'supereffective') templateId = 'superEffective';
			if (kwArgs.spread) templateId += 'Spread';
			const template = this.template(templateId);
			return template.replace('[POKEMON]', this.pokemon(pokemon));
		}

		case '-block': {
			let [, pokemon, effect, move, attacker] = args;
			const line1 = this.maybeAbility(effect, kwArgs.of || pokemon);
			let id = BattleTextParser.effectId(effect);
			let templateId = 'block';
			if (id === 'mist' && this.gen <= 2) templateId = 'blockGen' + this.gen;
			const template = this.template(templateId, effect);
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[SOURCE]', this.pokemon(attacker || kwArgs.of)).replace('[MOVE]', move);
		}

		case '-fail': {
			let [, pokemon, effect, stat] = args;
			let id = BattleTextParser.effectId(effect);
			let blocker = BattleTextParser.effectId(kwArgs.from);
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			let templateId = 'block';
			if (['desolateland', 'primordialsea'].includes(blocker) &&
				!['sunnyday', 'raindance', 'sandstorm', 'hail', 'snowscape', 'chillyreception'].includes(id)) {
				templateId = 'blockMove';
			} else if (blocker === 'uproar' && kwArgs.msg) {
				templateId = 'blockSelf';
			}
			let template = this.template(templateId, kwArgs.from);
			if (template) {
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon));
			}

			if (id === 'unboost') {
				template = this.template(stat ? 'failSingular' : 'fail', 'unboost');
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[STAT]', stat);
			}

			templateId = 'fail';
			if (['brn', 'frz', 'par', 'psn', 'slp', 'substitute', 'shedtail'].includes(id)) {
				templateId = 'alreadyStarted';
			}
			if (kwArgs.heavy) templateId = 'failTooHeavy';
			if (kwArgs.weak) templateId = 'fail';
			if (kwArgs.forme) templateId = 'failWrongForme';
			template = this.template(templateId, id);
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon));
		}

		case '-immune': {
			const [, pokemon] = args;
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			let template = this.template('block', kwArgs.from);
			if (!template) {
				const templateId = kwArgs.ohko ? 'immuneOHKO' : 'immune';
				template = this.template(pokemon ? templateId : 'immuneNoPokemon', kwArgs.from);
			}
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon));
		}

		case '-miss': {
			const [, source, pokemon] = args;
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			if (!pokemon) {
				const template = this.template('missNoPokemon');
				return line1 + template.replace('[SOURCE]', this.pokemon(source));
			}
			const template = this.template('miss');
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon));
		}

		case '-center': case '-ohko': case '-combine': {
			return this.template(cmd.slice(1));
		}

		case '-notarget': {
			return this.template('noTarget');
		}

		case '-mega': case '-primal': {
			const [, pokemon, species, item] = args;
			let id = '';
			let templateId = cmd.slice(1);
			if (species === 'Rayquaza') {
				id = 'dragonascent';
				templateId = 'megaNoItem';
			}
			if (!id && cmd === '-mega' && this.gen < 7) templateId = 'megaGen6';
			if (!item && cmd === '-mega') templateId = 'megaNoItem';
			let template = this.template(templateId, id);
			const side = pokemon.slice(0, 2);
			const pokemonName = this.pokemon(pokemon);
			if (cmd === '-mega') {
				const template2 = this.template('transformMega');
				template += template2.replace('[POKEMON]', pokemonName).replace('[SPECIES]', species);
			}
			return template.replace('[POKEMON]', pokemonName).replace('[ITEM]', item).replace('[TRAINER]', this.trainer(side));
		}

		case '-terastallize': {
			const [, pokemon, type] = args;
			let id = '';
			let templateId = cmd.slice(1);
			let template = this.template(templateId, id);
			const pokemonName = this.pokemon(pokemon);
			return template.replace('[POKEMON]', pokemonName).replace('[TYPE]', type);
		}

		case '-zpower': {
			const [, pokemon] = args;
			const template = this.template('zPower');
			return template.replace('[POKEMON]', this.pokemon(pokemon));
		}

		case '-burst': {
			const [, pokemon] = args;
			const template = this.template('activate', "Ultranecrozium Z");
			return template.replace('[POKEMON]', this.pokemon(pokemon));
		}

		case '-zbroken': {
			const [, pokemon] = args;
			const template = this.template('zBroken');
			return template.replace('[POKEMON]', this.pokemon(pokemon));
		}

		case '-hitcount': {
			const [, , num] = args;
			if (num === '1') {
				return this.template('hitCountSingular');
			}
			return this.template('hitCount').replace('[NUMBER]', num);
		}

		case '-waiting': {
			const [, pokemon, target] = args;
			const template = this.template('activate', "Water Pledge");
			return template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[TARGET]', this.pokemon(target));
		}

		case '-anim': {
			return '';
		}

		default: {
			return null;
		}
		}
	}
}

if (typeof require === 'function') {
	// in Node
	(global as any).BattleTextParser = BattleTextParser;
}
