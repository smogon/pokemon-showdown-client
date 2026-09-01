/**
 * Text parser
 *
 * No dependencies
 * Optional dependency: BattleText
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 */

import { Dex, toID, type ID } from "./battle-dex";

export type Args = [string, ...string[]];
export type KWArgs = { [kw: string]: string };
export type SideID = 'p1' | 'p2' | 'p3' | 'p4';
export type InflectionCategories = { [placeholder: string]: string };
type BattleTextTableName = 'Default' | 'Moves' | 'Abilities' | 'Items';
type RenderValue = string | {
	value: string,
	table?: 'Items' | 'Default',
	id?: string,
	category?: string,
};

export class BattleTextParser {
	p1 = "Player 1";
	p2 = "Player 2";
	p3 = "Player 3";
	p4 = "Player 4";
	perspective: SideID;
	language: string;
	gen = 9;
	turn = 0;
	curLineSection: 'break' | 'preMajor' | 'major' | 'postMajor' = 'break';
	lowercaseRegExp: RegExp | null | undefined = undefined;

	constructor(perspective: SideID = 'p1', language = Dex.text.getLanguage()) {
		this.perspective = perspective;
		this.language = language;
		Dex.loadTextData(language);
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
		case 'fieldhtml': case 'controlshtml': case 'pagehtml': case 'bigerror':
		case 'debug': case 'tier': case 'challstr': case 'customgroups': case 'popup': case '':
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

	static parseBattleLine(line: string): { args: Args, kwArgs: KWArgs } {
		let args = this.parseLine(line, true);
		if (args) return { args, kwArgs: {} };

		args = line.slice(1).split('|') as [string, ...string[]];
		const kwArgs: KWArgs = {};
		while (args.length > 1) {
			const lastArg = args[args.length - 1];
			if (!lastArg.startsWith('[')) break;
			const bracketPos = lastArg.indexOf(']');
			if (bracketPos <= 0) break;
			// default to '.' so it evaluates to boolean true
			kwArgs[lastArg.slice(1, bracketPos)] = lastArg.slice(bracketPos + 1).trim() || '.';
			args.pop();
		}
		return BattleTextParser.upgradeArgs({ args, kwArgs });
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
		return { group, name, away, status };
	}

	/**
	 * Old replays may use syntax we no longer use, so this function upgrades
	 * them to modern versions. Used to keep battle.ts itself cleaner. Not
	 * guaranteed to mutate or not mutate its inputs.
	 */
	static upgradeArgs({ args, kwArgs }: { args: Args, kwArgs: KWArgs }): { args: Args, kwArgs: KWArgs } {
		switch (args[0]) {
		case '-activate': {
			if (kwArgs.item || kwArgs.move || kwArgs.number || kwArgs.ability) return { args, kwArgs };
			let [, pokemon, effect, arg3, arg4] = args;
			let target = kwArgs.of;
			const id = BattleTextParser.effectId(effect);

			if (kwArgs.block) return { args: ['-fail', pokemon], kwArgs };

			if (id === 'wonderguard') return { args: ['-immune', pokemon], kwArgs: { from: 'ability:Wonder Guard' } };

			if (id === 'beatup' && kwArgs.of) return { args, kwArgs: { name: kwArgs.of } };

			if ([
				'ingrain', 'quickguard', 'wideguard', 'craftyshield', 'matblock', 'protect', 'mist', 'safeguard',
				'electricterrain', 'mistyterrain', 'psychicterrain', 'telepathy', 'stickyhold', 'suctioncups', 'aromaveil',
				'flowerveil', 'sweetveil', 'disguise', 'safetygoggles', 'protectivepads',
			].includes(id)) {
				if (target) {
					kwArgs.of = pokemon;
					return { args: ['-block', target, effect, arg3], kwArgs };
				}
				return { args: ['-block', pokemon, effect, arg3], kwArgs };
			}

			if (id === 'charge') {
				return { args: ['-singlemove', pokemon, effect], kwArgs: { of: target } };
			}
			if ([
				'bind', 'wrap', 'clamp', 'whirlpool', 'firespin', 'magmastorm', 'sandtomb', 'infestation', 'snaptrap', 'thundercage', 'trapped',
			].includes(id)) {
				return { args: ['-start', pokemon, effect], kwArgs: { of: target } };
			}

			if (id === 'fairylock') {
				return { args: ['-fieldactivate', effect], kwArgs: {} };
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
			let [, pokemon, effect, arg3] = args;
			if (kwArgs.from === 'ability: Flower Veil') {
				return { args: ['-block', kwArgs.of, 'ability: Flower Veil'], kwArgs: { of: args[1] } };
			}
			if (effect === 'unboost' && arg3) {
				const statMap: { [key: string]: string } = {
					'Attack': 'atk',
					'Defense': 'def',
					'Special Attack': 'spa',
					'Special Defense': 'spd',
					'Speed': 'spe',
				};
				if (statMap[arg3]) args[3] = statMap[arg3];
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
				return { args: ['-block', pokemon, effect, move, kwArgs.of], kwArgs: {} };
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

		case '-weather': {
			if (args[1] === 'Snow') args[1] = 'Snowscape';
			break;
		}

		case '-ability': {
			if (args[3] && (args[3].startsWith('p1') || args[3].startsWith('p2') || args[3] === 'boost')) {
				args[4] = args[3];
				args[3] = '';
			}
			break;
		}

		case '-nothing':
			// OLD: |-nothing
			// NEW: |-activate||move:Splash
			return { args: ['-activate', '', 'move:Splash'], kwArgs };
		}
		return { args, kwArgs };
	}

	extractMessage(buf: string) {
		let out = '';
		for (const line of buf.split('\n')) {
			const { args, kwArgs } = BattleTextParser.parseBattleLine(line);
			out += this.parseArgs(args, kwArgs) || '';
		}
		return out;
	}

	private textField(table: BattleTextTableName, id: string, field: string) {
		const english = BattleText.en?.[table]?.[id];
		const localized = BattleText[this.language]?.[table]?.[id];
		let value = localized?.[field] || english?.[field];
		for (let i = Dex.gen - 1; i >= this.gen; i--) {
			const genName = `gen${i}`;
			const englishGen = english?.[genName];
			const localizedGen = localized?.[genName];
			if (localizedGen && typeof localizedGen === 'object' && localizedGen[field]) value = localizedGen[field];
			else if (englishGen && typeof englishGen === 'object' && englishGen[field]) value = englishGen[field];
		}
		return typeof value === 'string' ? value : '';
	}

	private defaultText(field: string) {
		return this.textField('Default', 'default', field);
	}

	uiText(field: string, values?: { [placeholder: string]: RenderValue | undefined }) {
		const template = this.textField('Default', 'ui', field);
		if (!template) return '';
		return this.render(template, values);
	}

	private static uiParser: BattleTextParser | null = null;
	static ui(field: string, values?: { [placeholder: string]: RenderValue | undefined }) {
		const parser = (BattleTextParser.uiParser ||= new BattleTextParser());
		parser.language = Dex.text.getLanguage();
		return parser.uiText(field, values);
	}
	static weatherName(weather: string, language = Dex.text.getLanguage()) {
		const parser = (BattleTextParser.uiParser ||= new BattleTextParser());
		parser.language = language;
		return parser.textField('Default', BattleTextParser.effectId(weather), 'weatherName') || weather;
	}

	/**
	 * Render template, resolving placeholders.
	 */
	private render(
		template: string, values: { [placeholder: string]: RenderValue | undefined } = {}
	) {
		const categories: InflectionCategories = {};
		const text = template.replace(
			/\{([A-Z][A-Z0-9]*)(?::([a-z]+(?::[a-z]+)*))?\}/g,
			(match, placeholder: string, modifierText: string | undefined) => {
				const value = values[placeholder];
				if (value === undefined) return match;
				return this.resolveRenderValue(
					placeholder, value, modifierText ? modifierText.split(':') : [], categories
				);
			}
		);
		return BattleTextParser.inflect(text, categories);
	}

	private resolveRenderValue(
		placeholder: string, source: RenderValue, modifiers: string[], categories: InflectionCategories
	) {
		let value = typeof source === 'string' ? source : source.value;
		let category = typeof source === 'string' ? 'ms' : source.category || 'ms';
		let articleRule = '';
		if (typeof source !== 'string' && source.table && source.id) {
			const entry = BattleText[this.language]?.[source.table]?.[source.id] ||
				BattleText.en?.[source.table]?.[source.id] || undefined;
			let form = entry;
			if (modifiers.includes('classified') && entry?.classified && typeof entry.classified === 'object') {
				form = entry.classified;
			}
			value = typeof form?.name === 'string' ? form.name : value;
			category = typeof form?.grammar === 'string' ? form.grammar : category;
			articleRule = typeof form?.articleRule === 'string' ? form.articleRule : '';
		}
		categories[placeholder] = category;
		return BattleTextParser.modify(value, modifiers, this.language, category, articleRule);
	}

	fixLowercase(input: string) {
		if (this.lowercaseRegExp === undefined) {
			const prefixes = ['pokemon', 'opposingPokemon', 'team', 'opposingTeam', 'party', 'opposingParty'].map(templateId => {
				const template = this.defaultText(templateId);
				if (template.startsWith(template.charAt(0).toUpperCase())) return '';
				const braceIndex = template.indexOf('{');
				if (braceIndex >= 0) return template.slice(0, braceIndex);
				return template;
			}).filter(prefix => prefix);
			if (prefixes.length) {
				let buf = `((?:^|\n)(?:  |  \\(|\\[|\\{)?)(` +
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

	static inflect(template: string, categories: InflectionCategories) {
		return template.replace(
			/\{INFLECT:([A-Z][A-Z0-9]*):((?:\\.|[^}\\])*)\}/g,
			(match, placeholder: string, source: string) => {
				const category = categories[placeholder];
				if (!category) return match;
				const grammarCategory = /^[mfn][sup]$/.test(category);
				const normalizedCategory = grammarCategory && category.endsWith('u') ? category.charAt(0) + 's' : category;
				const categoryFallback = grammarCategory ? (category.endsWith('p') ? 'p' : 's') : '';

				const fields: string[] = [];
				let field = '';
				for (let i = 0; i < source.length; i++) {
					if (source.charAt(i) === '\\' && i + 1 < source.length) {
						field += source.charAt(i) + source.charAt(++i);
					} else if (source.charAt(i) === ':') {
						fields.push(field);
						field = '';
					} else {
						field += source.charAt(i);
					}
				}
				fields.push(field);

				for (const candidate of fields) {
					let equalsIndex = -1;
					for (let i = 0; i < candidate.length; i++) {
						if (candidate.charAt(i) === '\\') {
							i++;
						} else if (candidate.charAt(i) === '=') {
							equalsIndex = i;
							break;
						}
					}
					if (equalsIndex < 0 || ![normalizedCategory, categoryFallback].includes(candidate.slice(0, equalsIndex))) continue;
					return candidate.slice(equalsIndex + 1).replace(/\\(.)/g, '$1');
				}
				return match;
			}
		);
	}

	static modify(value: string, modifiers: string[], language: string, category = 'ms', articleRule = '') {
		const knownModifiers = [
			'definite', 'indefinite', 'nominative', 'accusative', 'singular', 'plural', 'masculine',
			'capitalize', 'classified', 'a', 'de', 'di', 'su', 'e', 'y',
			'topic', 'object', 'subject', 'conjunctive', 'directional',
		];
		for (const modifier of modifiers) {
			if (!knownModifiers.includes(modifier)) return value;
		}

		const has = (modifier: string) => modifiers.includes(modifier);
		// Names without localized grammar metadata default to masculine singular
		let plural = category.endsWith('p');
		const uncountable = category.endsWith('u');
		let feminine = category.startsWith('f');
		let neuter = category.startsWith('n');
		if (has('singular')) plural = false;
		if (has('plural')) plural = true;
		if (has('masculine')) feminine = neuter = false;
		const initial = this.grammarInitial(value);
		const vowel = /^[aeiouà-æè-ïò-öù-ü]/i.test(initial);
		let prefix = '';

		if (language === 'fr') {
			let article = '';
			if (has('definite')) {
				article = plural ? 'les ' : vowel ? 'l’' : feminine ? 'la ' : 'le ';
			} else if (has('indefinite')) {
				article = uncountable ? '' : plural ? 'des ' : feminine ? 'une ' : 'un ';
			}
			if (has('a')) {
				if (article === 'le ') prefix = 'au ';
				else if (article === 'les ') prefix = 'aux ';
				else prefix = 'à ' + article;
			} else if (has('de')) {
				if (article === 'le ') prefix = 'du ';
				else if (article === 'les ') prefix = 'des ';
				else if (article) prefix = 'de ' + article;
				else prefix = vowel || /^h/i.test(initial) ? 'd’' : 'de ';
			} else {
				prefix = article;
			}
		} else if (language === 'es') {
			const articleFeminine = feminine && articleRule !== 'stressed-a';
			let article = '';
			if (has('definite')) article = plural ? (feminine ? 'las ' : 'los ') : (articleFeminine ? 'la ' : 'el ');
			else if (has('indefinite')) {
				article = uncountable ? '' : plural ? (feminine ? 'unas ' : 'unos ') : (articleFeminine ? 'una ' : 'un ');
			}
			if (has('a')) prefix = article === 'el ' ? 'al ' : 'a ' + article;
			else if (has('de')) prefix = article === 'el ' ? 'del ' : 'de ' + article;
			else prefix = article;
			if (has('y')) prefix = /^(?:i|hi)(?![aeou])/i.test(initial) ? 'e ' : 'y ';
		} else if (language === 'it') {
			const special = /^(?:s[^aeiouàèéìòù]|z|gn|ps|pn|x|y)/i.test(initial);
			let article = '';
			if (has('definite')) {
				if (plural) article = feminine ? 'le ' : (vowel || special ? 'gli ' : 'i ');
				else if (vowel) article = 'l’';
				else article = feminine ? 'la ' : (special ? 'lo ' : 'il ');
			} else if (has('indefinite')) {
				if (uncountable) article = feminine ? (vowel ? 'dell’' : 'della ') : (vowel ? 'dell’' : special ? 'dello ' : 'del ');
				else if (feminine) article = vowel ? 'un’' : 'una ';
				else article = special ? 'uno ' : 'un ';
			}
			if (has('a') && has('definite')) {
				prefix = this.italianContraction(article, ['al ', 'allo ', 'all’', 'alla ', 'ai ', 'agli ', 'alle ']);
			} else if (has('di') && has('definite')) {
				prefix = this.italianContraction(article, ['del ', 'dello ', 'dell’', 'della ', 'dei ', 'degli ', 'delle ']);
			} else if (has('su') && has('definite')) {
				prefix = this.italianContraction(article, ['sul ', 'sullo ', 'sull’', 'sulla ', 'sui ', 'sugli ', 'sulle ']);
			} else if (has('a')) {
				prefix = vowel ? 'ad ' : 'a ';
			} else if (has('di')) {
				prefix = vowel ? 'd’' : 'di ';
			} else if (has('su')) {
				prefix = 'su ';
			} else if (has('e')) {
				prefix = vowel ? 'ed ' : 'e ';
			} else {
				prefix = article;
			}
		} else if (language === 'de') {
			const accusative = has('accusative');
			if (has('definite')) {
				prefix = plural ? 'die ' : feminine ? 'die ' : neuter ? 'das ' : accusative ? 'den ' : 'der ';
			} else if (has('indefinite')) {
				prefix = uncountable ? '' : feminine ? 'eine ' : neuter ? 'ein ' : accusative ? 'einen ' : 'ein ';
			}
		} else if (language === 'ko') {
			const jong = this.koreanJongseong(value);
			if (has('topic')) value += jong ? '은' : '는';
			else if (has('object')) value += jong ? '을' : '를';
			else if (has('subject')) value += jong ? '이' : '가';
			else if (has('conjunctive')) value += jong ? '과' : '와';
			else if (has('directional')) value += jong && jong !== 8 ? '으로' : '로';
		}

		value = prefix + value;
		if (has('capitalize')) {
			for (let i = 0; i < value.length; i++) {
				const letter = value.charAt(i);
				if (letter.toUpperCase() === letter.toLowerCase()) continue;
				value = value.slice(0, i) + letter.toUpperCase() + value.slice(i + 1);
				break;
			}
		}
		return value;
	}

	private static grammarInitial(value: string) {
		return value.replace(/\*\*/g, '').replace(/^[^A-Za-zÀ-ɏ0-9ㄱ-힣]+/, '');
	}

	private static italianContraction(article: string, forms: string[]) {
		const articles = ['il ', 'lo ', 'l’', 'la ', 'i ', 'gli ', 'le '];
		const index = articles.indexOf(article);
		return index < 0 ? forms[0] : forms[index];
	}

	private static koreanJongseong(value: string) {
		const text = value.replace(/\*\*/g, '').replace(/[^A-Za-z0-9가-힣]+$/g, '');
		if (!text) return 0;
		const code = text.charCodeAt(text.length - 1);
		if (code >= 0xAC00 && code <= 0xD7A3) return (code - 0xAC00) % 28;
		if (code >= 0x30 && code <= 0x39) return [1, 0, 0, 8, 0, 0, 1, 8, 8, 0][code - 0x30];
		return /[lmnr]$/i.test(text) ? 8 : 0;
	}

	pokemonName = (pokemon: string) => {
		if (!pokemon) return '';
		if (!pokemon.startsWith('p')) return `???pokemon:${pokemon}???`;
		if (pokemon.charAt(3) === ':') return pokemon.slice(4).trim();
		else if (pokemon.charAt(2) === ':') return pokemon.slice(3).trim();
		return `???pokemon:${pokemon}???`;
	};

	pokemon(pokemon: string) {
		if (!pokemon) return '';
		let side = pokemon.slice(0, 2);
		if (!['p1', 'p2', 'p3', 'p4'].includes(side)) return `???pokemon:${pokemon}???`;
		const name = this.pokemonName(pokemon);
		const isNear = side === this.perspective || side === BattleTextParser.allyID(side as SideID);
		const template = this.defaultText(isNear ? 'pokemon' : 'opposingPokemon');
		return this.render(template, { NICKNAME: name });
	}

	pokemonFull(pokemon: string, details: string): [side: string, fullName: string] {
		const nickname = this.pokemonName(pokemon);

		const species = details.split(',')[0];
		const localizedSpecies = this.speciesName(species);
		if (nickname === localizedSpecies) return [pokemon.slice(0, 2), `**${localizedSpecies}**`];
		const template = BattleText[this.language]?.TermNames?.nicknamespecies ||
			BattleText.en?.TermNames?.nicknamespecies || '{NICKNAME} ({SPECIES})';
		return [pokemon.slice(0, 2), this.render(template, {
			NICKNAME: nickname,
			SPECIES: `**${localizedSpecies}**`,
		})];
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

	team(side: string, isFar = false) {
		side = side.slice(0, 2);
		if (side === this.perspective || side === BattleTextParser.allyID(side as SideID)) {
			return this.defaultText(!isFar ? 'team' : 'opposingTeam');
		}
		return this.defaultText(isFar ? 'team' : 'opposingTeam');
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
			return this.defaultText('party');
		}
		return this.defaultText('opposingParty');
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
		if (effect.startsWith('item:')) return this.itemValue(effect.slice(5));
		if (effect.startsWith('move:')) return this.moveName(effect.slice(5));
		if (effect.startsWith('ability:')) return this.abilityName(effect.slice(8));
		return effect.trim();
	}

	textName(table: 'Moves' | 'Items' | 'Abilities', name?: string) {
		if (!name) return '';
		name = name.trim();
		const id = toID(name);
		const localized = BattleText[this.language]?.[table]?.[id]?.name;
		const english = BattleText.en?.[table]?.[id]?.name;
		const translated = localized || english;
		return typeof translated === 'string' ? translated : name;
	}

	moveName(name?: string) {
		return this.textName('Moves', name);
	}
	itemName(name?: string) {
		return this.textName('Items', name);
	}
	private itemValue(name: string): RenderValue {
		return { value: this.itemName(name), table: 'Items', id: toID(name) };
	}
	abilityName(name?: string) {
		return this.textName('Abilities', name);
	}
	speciesName(name?: string) {
		if (!name) return '';
		name = name.trim();
		return Dex.text.get(Dex.species.get(name), this.language).name || name;
	}

	template(type: string, ...namespaces: (string | undefined)[]) {
		for (const namespace of namespaces) {
			if (!namespace) continue;
			if (namespace === 'OWN') {
				return this.defaultText(type + 'Own') + '\n';
			}
			if (namespace === 'NODEFAULT') {
				return '';
			}
			let id = BattleTextParser.effectId(namespace);
			let tables: BattleTextTableName[];
			if (namespace.startsWith('item:')) tables = ['Items', 'Default'];
			else if (namespace.startsWith('ability:')) tables = ['Abilities', 'Default'];
			else if (namespace.startsWith('move:')) tables = ['Moves', 'Default'];
			else tables = ['Items', 'Abilities', 'Moves', 'Default'];
			for (const table of tables) {
				let template = this.textField(table, id, type);
				if (!template) continue;
				if (template.charAt(1) === '.') {
					type = template.slice(2);
					template = this.textField(table, id, type);
				}
				if (template.startsWith('#')) {
					id = template.slice(1) as ID;
					template = this.textField(table, id, type);
				}
				return template ? template + '\n' : '';
			}
		}
		const template = this.defaultText(type);
		if (!template) return '';
		return template + '\n';
	}

	maybeAbility(effect: string | undefined, holder: string) {
		if (!effect) return '';
		if (!effect.startsWith('ability:')) return '';
		return this.ability(effect.slice(8).trim(), holder);
	}

	ability(name: string | undefined, holder: string) {
		if (!name) return '';
		return this.render(this.defaultText('abilityActivation'), {
			POKEMON: this.pokemon(holder),
			ABILITY: this.abilityName(name),
		}) + '\n';
	}

	static stat(stat: string, language = Dex.text.getLanguage()) {
		const id = stat || 'stats';
		const name = BattleText[language]?.StatNames?.[id] || BattleText.en?.StatNames?.[id];
		return typeof name === 'string' ? name : `???stat:${stat}???`;
	}
	static statMediumName(stat: string, language = Dex.text.getLanguage()) {
		const name = BattleText[language]?.StatMediumNames?.[stat] || BattleText.en?.StatMediumNames?.[stat];
		return typeof name === 'string' ? name : `???stat:${stat}???`;
	}
	static statShortName(stat: string, language = Dex.text.getLanguage()) {
		const name = BattleText[language]?.StatShortNames?.[stat] || BattleText.en?.StatShortNames?.[stat];
		return typeof name === 'string' ? name : `???stat:${stat}???`;
	}
	private statValue(stat: string): RenderValue {
		const id = stat || 'stats';
		const grammar = BattleText[this.language]?.StatNames?.[`${id}:grammar`] ||
			BattleText.en?.StatNames?.[`${id}:grammar`];
		return {
			value: BattleTextParser.stat(stat, this.language),
			category: grammar || (stat ? 's' : 'p'),
		};
	}

	lineSection(args: Args, kwArgs: KWArgs) {
		if (kwArgs.premajor) return 'preMajor';
		if (kwArgs.postmajor) return 'postMajor';
		if (kwArgs.major) return 'major';

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
		return (cmd.startsWith('-') ? 'postMajor' : '');
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
				this.p1 = name;
			} else if (side === 'p2' && name) {
				this.p2 = name;
			} else if (side === 'p3' && name) {
				this.p3 = name;
			} else if (side === 'p4' && name) {
				this.p4 = name;
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
			return this.render(this.template('turn'), { NUMBER: num }) + '\n';
		}

		case 'start': {
			return this.render(this.template('startBattle'), { TRAINER1: this.p1, TRAINER2: this.p2 });
		}

		case 'win': case 'tie': {
			const [, name] = args;
			if (cmd === 'tie' || !name) {
				return this.render(this.template('tieBattle'), { TRAINER1: this.p1, TRAINER2: this.p2 });
			}
			return this.render(this.template('winBattle'), { TRAINER: name });
		}

		case 'switch': {
			const [, pokemon, details] = args;
			const [side, fullname] = this.pokemonFull(pokemon, details);
			const template = this.template('switchIn', this.own(side));
			return this.render(template, { TRAINER: this.trainer(side), FULLNAME: fullname });
		}

		case 'drag': {
			const [, pokemon, details] = args;
			const [side, fullname] = this.pokemonFull(pokemon, details);
			const template = this.template('drag');
			return this.render(template, { TRAINER: this.trainer(side), FULLNAME: fullname });
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
			return line1 + this.render(template, {
				POKEMON: this.pokemon(pokemon),
				SPECIES: this.speciesName(newSpecies),
			});
		}

		case 'switchout': {
			const [, pokemon] = args;
			const side = pokemon.slice(0, 2);
			const template = this.template('switchOut', kwArgs.from, this.own(side));
			return this.render(template, {
				TRAINER: this.trainer(side),
				NICKNAME: this.pokemonName(pokemon),
				POKEMON: this.pokemon(pokemon),
			});
		}

		case 'faint': {
			const [, pokemon] = args;
			const template = this.template('faint');
			return this.render(template, { POKEMON: this.pokemon(pokemon) });
		}

		case 'swap': {
			const [, pokemon, target] = args;
			if (!target || !isNaN(Number(target))) {
				const template = this.template('swapCenter');
				return this.render(template, { POKEMON: this.pokemon(pokemon) });
			}
			const template = this.template('swap');
			return this.render(template, { POKEMON: this.pokemon(pokemon), TARGET: this.pokemon(target) });
		}

		case 'move': {
			const [, pokemon, move] = args;
			let line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			if (kwArgs.zeffect) {
				line1 = this.render(this.template('zEffect'), { POKEMON: this.pokemon(pokemon) });
			}
			const template = this.template('move', kwArgs.from);
			return line1 + this.render(template, {
				POKEMON: this.pokemon(pokemon), MOVE: this.moveName(move),
			});
		}

		case 'cant': {
			let [, pokemon, effect, move] = args;
			const template = this.template('cant', effect, 'NODEFAULT') ||
				this.template(move ? 'cant' : 'cantNoMove');
			const line1 = this.maybeAbility(effect, kwArgs.of || pokemon);
			return line1 + this.render(template, {
				POKEMON: this.pokemon(pokemon), MOVE: this.moveName(move),
			});
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
			return this.render(template, { TRAINER: this.trainer(side) });
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
				return line1 + this.render(template, {
					POKEMON: this.pokemon(pokemon), TYPE: arg3, SOURCE: this.pokemon(kwArgs.of),
				});
			}
			if (id === 'typeadd') {
				const template = this.template('typeAdd', kwArgs.from);
				return line1 + this.render(template, { POKEMON: this.pokemon(pokemon), TYPE: arg3 });
			}
			if (id.startsWith('stockpile')) {
				const num = id.slice(9);
				const template = this.template('start', 'stockpile');
				return line1 + this.render(template, { POKEMON: this.pokemon(pokemon), NUMBER: num });
			}
			if (id.startsWith('perish')) {
				const num = id.slice(6);
				const template = this.template('activate', 'perishsong');
				return line1 + this.render(template, { POKEMON: this.pokemon(pokemon), NUMBER: num });
			}
			if (id.startsWith('protosynthesis') || id.startsWith('quarkdrive')) {
				const stat = id.slice(-3);
				const template = this.template('start', id.slice(0, id.length - 3));
				return line1 + this.render(template, {
					POKEMON: this.pokemon(pokemon), STAT: this.statValue(stat),
				});
			}
			let templateId = 'start';
			if (kwArgs.already) templateId = 'alreadyStarted';
			if (kwArgs.fatigue) templateId = 'startFromFatigue';
			if (kwArgs.zeffect) templateId = 'startFromZEffect';
			if (kwArgs.damage) templateId = 'activate';
			if (kwArgs.block) templateId = 'block';
			if (kwArgs.upkeep) templateId = 'upkeep';
			if (templateId === 'start' && kwArgs.from?.startsWith('item:')) {
				templateId += 'FromItem';
			}
			const template = this.template(templateId, kwArgs.from, effect);
			return line1 + this.render(template, {
				POKEMON: this.pokemon(pokemon),
				EFFECT: this.effect(effect),
				MOVE: this.moveName(arg3),
				SOURCE: this.pokemon(kwArgs.of),
				ITEM: this.effect(kwArgs.from),
			});
		}

		case '-end': {
			let [, pokemon, effect] = args;
			const line1 = this.maybeAbility(effect, pokemon) || this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			let id = BattleTextParser.effectId(effect);
			if (id === 'doomdesire' || id === 'futuresight') {
				const template = this.template('activate', effect);
				return line1 + this.render(template, { TARGET: this.pokemon(pokemon) });
			}
			let templateId = 'end';
			let template = '';
			if (kwArgs.from?.startsWith('item:')) {
				template = this.template('endFromItem', effect);
			}
			if (!template) template = this.template(templateId, effect);
			return line1 + this.render(template, {
				POKEMON: this.pokemon(pokemon),
				EFFECT: this.effect(effect),
				SOURCE: this.pokemon(kwArgs.of),
				ITEM: this.effect(kwArgs.from),
			});
		}

		case '-ability': {
			let [, pokemon, ability, oldAbility] = args;
			let line1 = '';
			if (oldAbility) line1 += this.ability(oldAbility, pokemon);
			line1 += this.ability(ability, pokemon);
			if (kwArgs.fail) {
				const template = this.template('block', kwArgs.from);
				return line1 + template;
			}
			if (kwArgs.from) {
				if (!oldAbility) line1 = this.maybeAbility(kwArgs.from, pokemon) + line1;
				const template = this.template('changeAbility', kwArgs.from);
				return line1 + this.render(template, {
					POKEMON: this.pokemon(pokemon),
					ABILITY: this.abilityName(ability),
					SOURCE: this.pokemon(kwArgs.of),
				});
			}
			const id = BattleTextParser.effectId(ability);
			if (id === 'unnerve') {
				const template = this.template('start', ability);
				return line1 + this.render(template, { TEAM: this.team(pokemon.slice(0, 2), true) });
			}
			let templateId = 'start';
			if (id === 'anticipation' || id === 'sturdy') templateId = 'activate';
			const template = this.template(templateId, ability, 'NODEFAULT');
			return line1 + this.render(template, { POKEMON: this.pokemon(pokemon) });
		}

		case '-endability': {
			let [, pokemon, ability] = args;
			if (ability) return this.ability(ability, pokemon);
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			const template = this.template('start', 'Gastro Acid');
			return line1 + this.render(template, { POKEMON: this.pokemon(pokemon) });
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
				return line1 + this.render(template, {
					POKEMON: this.pokemon(pokemon),
					ITEM: this.itemValue(item),
					SOURCE: this.pokemon(target || kwArgs.of),
				});
			}
			if (id === 'frisk') {
				const hasTarget = kwArgs.of && pokemon && kwArgs.of !== pokemon;
				const template = this.template(hasTarget ? 'activate' : 'activateNoTarget', "Frisk");
				return line1 + this.render(template, {
					POKEMON: this.pokemon(kwArgs.of),
					ITEM: this.itemValue(item),
					TARGET: this.pokemon(pokemon),
				});
			}
			if (kwArgs.from) {
				const template = this.template('addItem', kwArgs.from);
				return line1 + this.render(template, {
					POKEMON: this.pokemon(pokemon), ITEM: this.itemValue(item),
				});
			}
			const template = this.template('start', item, 'NODEFAULT');
			return line1 + this.render(template, { POKEMON: this.pokemon(pokemon) });
		}

		case '-enditem': {
			let [, pokemon, item] = args;
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			if (kwArgs.eat) {
				const template = this.template('eatItem', kwArgs.from);
				return line1 + this.render(template, {
					POKEMON: this.pokemon(pokemon), ITEM: this.itemValue(item),
				});
			}
			const id = BattleTextParser.effectId(kwArgs.from);
			if (id === 'gem') {
				const template = this.template('useGem', item);
				return line1 + this.render(template, {
					POKEMON: this.pokemon(pokemon),
					ITEM: this.itemValue(item),
					MOVE: this.moveName(kwArgs.move),
				});
			}
			if (id === 'stealeat') {
				const template = this.template('removeItem', "Bug Bite");
				return line1 + this.render(template, {
					SOURCE: this.pokemon(kwArgs.of), ITEM: this.itemValue(item),
				});
			}
			if (kwArgs.from) {
				const template = this.template('removeItem', kwArgs.from);
				return line1 + this.render(template, {
					POKEMON: this.pokemon(pokemon),
					ITEM: this.itemValue(item),
					SOURCE: this.pokemon(kwArgs.of),
				});
			}
			if (kwArgs.weaken) {
				const template = this.template('activateWeaken');
				return line1 + this.render(template, {
					POKEMON: this.pokemon(pokemon), ITEM: this.itemValue(item),
				});
			}
			let template = this.template('end', item, 'NODEFAULT');
			if (!template) template = this.template('activateItem');
			return line1 + this.render(template, {
				POKEMON: this.pokemon(pokemon),
				ITEM: this.itemValue(item),
				TARGET: this.pokemon(kwArgs.of),
			});
		}

		case '-status': {
			const [, pokemon, status] = args;
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			if (kwArgs.from?.startsWith('item:')) {
				const template = this.template('startFromItem', status);
				return line1 + this.render(template, {
					POKEMON: this.pokemon(pokemon), ITEM: this.effect(kwArgs.from),
				});
			}
			if (BattleTextParser.effectId(kwArgs.from) === 'rest') {
				const template = this.template('startFromRest', status);
				return line1 + this.render(template, { POKEMON: this.pokemon(pokemon) });
			}
			const template = this.template('start', status);
			return line1 + this.render(template, { POKEMON: this.pokemon(pokemon) });
		}

		case '-curestatus': {
			const [, pokemon, status] = args;
			if (BattleTextParser.effectId(kwArgs.from) === 'naturalcure') {
				const template = this.template('activate', kwArgs.from);
				return this.render(template, { POKEMON: this.pokemon(pokemon) });
			}
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			if (kwArgs.from?.startsWith('item:')) {
				const template = this.template('endFromItem', status);
				return line1 + this.render(template, {
					POKEMON: this.pokemon(pokemon), ITEM: this.effect(kwArgs.from),
				});
			}
			if (kwArgs.thaw) {
				const template = this.template('endFromMove', status);
				return line1 + this.render(template, {
					POKEMON: this.pokemon(pokemon), MOVE: this.effect(kwArgs.from),
				});
			}
			let template = this.template('end', status, 'NODEFAULT');
			if (!template) template = this.template('end');
			return line1 + this.render(template, { POKEMON: this.pokemon(pokemon), EFFECT: status });
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
				return line1 + this.render(template, {
					POKEMON: this.pokemon(kwArgs.of), TARGET: this.pokemon(pokemon),
				});
			}
			let template = this.template('start', effect, 'NODEFAULT');
			if (!template) template = this.template('start');
			return line1 + this.render(template, {
				EFFECT: this.effect(effect),
				POKEMON: this.pokemon(pokemon),
				SOURCE: this.pokemon(kwArgs.of),
				TEAM: this.team(pokemon.slice(0, 2)),
			});
		}

		case '-sidestart': {
			let [, side, effect] = args;
			let template = this.template('start', effect, 'NODEFAULT');
			if (!template) template = this.template('startTeamEffect');
			return this.render(template, {
				EFFECT: this.effect(effect), TEAM: this.team(side), PARTY: this.party(side),
			});
		}

		case '-sideend': {
			let [, side, effect] = args;
			let template = this.template('end', effect, 'NODEFAULT');
			if (!template) template = this.template('endTeamEffect');
			return this.render(template, {
				EFFECT: this.effect(effect), TEAM: this.team(side), PARTY: this.party(side),
			});
		}

		case '-weather': {
			const [, weather] = args;
			if (!weather || weather === 'none') {
				const template = this.template('end', kwArgs.from, 'NODEFAULT');
				if (!template) {
					return this.render(this.template('endFieldEffect'), { EFFECT: this.effect(weather) });
				}
				return template;
			}
			if (kwArgs.upkeep) {
				return this.template('upkeep', weather, 'NODEFAULT');
			}
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of);
			let template = this.template('start', weather, 'NODEFAULT');
			if (!template) template = this.template('startFieldEffect');
			return line1 + this.render(template, { EFFECT: this.effect(weather) });
		}

		case '-fieldstart': case '-fieldactivate': {
			const [, effect] = args;
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of);
			if (BattleTextParser.effectId(kwArgs.from) === 'hadronengine') {
				return line1 + this.render(this.template('start', 'hadronengine'), {
					POKEMON: this.pokemon(kwArgs.of),
				});
			}
			let templateId = cmd.slice(6);
			if (BattleTextParser.effectId(effect) === 'perishsong') templateId = 'start';
			let template = this.template(templateId, effect, 'NODEFAULT');
			if (!template) template = this.template('startFieldEffect');
			return line1 + this.render(template, {
				EFFECT: this.effect(effect), POKEMON: this.pokemon(kwArgs.of),
			});
		}

		case '-fieldend': {
			let [, effect] = args;
			let template = this.template('end', effect, 'NODEFAULT');
			if (!template) template = this.template('endFieldEffect');
			return this.render(template, { EFFECT: this.effect(effect) });
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
				return this.render(this.template('activate', 'celebrate'), {
					TRAINER: this.trainer(pokemon.slice(0, 2)),
				});
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
				return line1 + this.render(template, {
					POKEMON: this.pokemon(kwArgs.of), SOURCE: this.pokemon(pokemon),
				});
			}

			if ((id === 'mummy' || id === 'lingeringaroma') && kwArgs.ability) {
				line1 += this.ability(kwArgs.ability, target);
				line1 += this.ability(id === 'mummy' ? 'Mummy' : 'Lingering Aroma', target);
				const template = this.template('changeAbility', id);
				return line1 + this.render(template, { TARGET: this.pokemon(target) });
			}

			if (id === 'commander') {
				// Commander didn't have a message prior to v1.2.0 of SV
				// so this is for backwards compatibility
				if (target === pokemon) return line1;
				const template = this.template('activate', id);
				return line1 + this.render(template, {
					POKEMON: this.pokemon(pokemon), TARGET: this.pokemon(target),
				});
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
				return line1 + this.render(template, { EFFECT: this.effect(effect) });
			}

			if (kwArgs.ability) {
				line1 += this.ability(kwArgs.ability, pokemon);
			}
			if (kwArgs.ability2) {
				line1 += this.ability(kwArgs.ability2, target);
			}
			return line1 + this.render(template, {
				TEAM: id === 'brickbreak' ? this.team(target.slice(0, 2)) : undefined,
				MOVE: kwArgs.move ? this.moveName(kwArgs.move) : undefined,
				NUMBER: kwArgs.number,
				ITEM: kwArgs.item ? this.itemValue(kwArgs.item) : undefined,
				NAME: kwArgs.name,
				POKEMON: this.pokemon(pokemon),
				TARGET: this.pokemon(target),
				SOURCE: this.pokemon(kwArgs.of),
			});
		}

		case '-prepare': {
			const [, pokemon, effect, target] = args;
			const template = this.template('prepare', effect);
			return this.render(template, {
				POKEMON: this.pokemon(pokemon), TARGET: this.pokemon(target),
			});
		}

		case '-damage': {
			let [, pokemon, , percentage] = args;
			let template = this.template('damage', kwArgs.from, 'NODEFAULT');
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			const id = BattleTextParser.effectId(kwArgs.from);
			if (template) {
				return line1 + this.render(template, { POKEMON: this.pokemon(pokemon) });
			}

			if (!kwArgs.from) {
				template = this.template(percentage ? 'damagePercentage' : 'damage');
				percentage = percentage ? percentage.replace(/%$/, '') : '';
				return line1 + this.render(template, {
					POKEMON: this.pokemon(pokemon), PERCENTAGE: percentage,
				});
			}
			if (kwArgs.from.startsWith('item:')) {
				template = this.template(kwArgs.of ? 'damageFromPokemon' : 'damageFromItem');
				return line1 + this.render(template, {
					POKEMON: this.pokemon(pokemon),
					ITEM: this.effect(kwArgs.from),
					SOURCE: this.pokemon(kwArgs.of),
				});
			}
			if (kwArgs.partiallytrapped || id === 'bind' || id === 'wrap') {
				template = this.template('damageFromPartialTrapping');
				return line1 + this.render(template, {
					POKEMON: this.pokemon(pokemon), MOVE: this.effect(kwArgs.from),
				});
			}

			template = this.template('damage');
			return line1 + this.render(template, { POKEMON: this.pokemon(pokemon) });
		}

		case '-heal': {
			let [, pokemon] = args;
			let template = this.template('heal', kwArgs.from, 'NODEFAULT');
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			if (template) {
				return line1 + this.render(template, {
					POKEMON: this.pokemon(pokemon),
					SOURCE: this.pokemon(kwArgs.of),
					NICKNAME: kwArgs.wisher,
				});
			}

			if (kwArgs.from && !kwArgs.from.startsWith('ability:')) {
				template = this.template('healFromEffect');
				return line1 + this.render(template, {
					POKEMON: this.pokemon(pokemon), EFFECT: this.effect(kwArgs.from),
				});
			}

			template = this.template('heal');
			return line1 + this.render(template, { POKEMON: this.pokemon(pokemon) });
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
				return line1 + this.render(template, {
					POKEMON: this.pokemon(pokemon),
					STAT: this.statValue(stat),
					ITEM: this.effect(kwArgs.from),
				});
			}
			const template = this.template(templateId, kwArgs.from);
			return line1 + this.render(template, {
				POKEMON: this.pokemon(pokemon), STAT: this.statValue(stat),
			});
		}

		case '-setboost': {
			const [, pokemon] = args;
			const effect = kwArgs.from;
			const line1 = this.maybeAbility(effect, kwArgs.of || pokemon);
			const template = this.template('boost', effect);
			return line1 + this.render(template, { POKEMON: this.pokemon(pokemon) });
		}

		case '-swapboost': {
			const [, pokemon, target] = args;
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			const id = BattleTextParser.effectId(kwArgs.from);
			let templateId = 'swapBoost';
			if (id === 'guardswap') templateId = 'swapDefensiveBoost';
			if (id === 'powerswap') templateId = 'swapOffensiveBoost';
			const template = this.template(templateId, kwArgs.from);
			return line1 + this.render(template, {
				POKEMON: this.pokemon(pokemon), TARGET: this.pokemon(target),
			});
		}

		case '-copyboost': {
			const [, pokemon, target] = args;
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			const template = this.template('copyBoost', kwArgs.from);
			return line1 + this.render(template, {
				POKEMON: this.pokemon(pokemon), TARGET: this.pokemon(target),
			});
		}

		case '-clearboost': case '-clearpositiveboost': case '-clearnegativeboost': {
			const [, pokemon, source] = args;
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			let templateId = 'clearBoost';
			if (kwArgs.zeffect) templateId = 'clearBoostFromZEffect';
			const template = this.template(templateId, kwArgs.from);
			return line1 + this.render(template, {
				POKEMON: this.pokemon(pokemon), SOURCE: this.pokemon(source),
			});
		}

		case '-invertboost': {
			const [, pokemon] = args;
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			const template = this.template('invertBoost', kwArgs.from);
			return line1 + this.render(template, { POKEMON: this.pokemon(pokemon) });
		}

		case '-clearallboost': {
			return this.template('clearAllBoost', kwArgs.from);
		}

		case '-crit': case '-supereffective': case '-resisted': {
			const [, pokemon, effectiveness] = args;
			let templateId = cmd.slice(1);
			if (templateId === 'supereffective') templateId = 'superEffective';
			if (effectiveness === '2') {
				if (templateId === 'superEffective') templateId = 'extremelyEffective';
				if (templateId === 'resisted') templateId = 'mostlyIneffective';
			}
			if (kwArgs.spread) templateId += 'Spread';
			const template = this.template(templateId);
			return this.render(template, { POKEMON: this.pokemon(pokemon) });
		}

		case '-block': {
			let [, pokemon, effect, move, attacker] = args;
			const line1 = this.maybeAbility(effect, kwArgs.of || pokemon);
			const template = this.template('block', effect);
			return line1 + this.render(template, {
				POKEMON: this.pokemon(pokemon),
				SOURCE: this.pokemon(attacker || kwArgs.of),
				MOVE: this.moveName(move),
			});
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
				return line1 + this.render(template, { POKEMON: this.pokemon(pokemon) });
			}

			if (id === 'unboost') {
				template = this.template('fail', 'unboost');
				return line1 + this.render(template, {
					POKEMON: this.pokemon(pokemon), STAT: this.statValue(stat),
				});
			}

			templateId = 'fail';
			if (['brn', 'frz', 'par', 'psn', 'slp', 'substitute', 'shedtail'].includes(id)) {
				templateId = 'alreadyStarted';
			}
			if (kwArgs.heavy) templateId = 'failTooHeavy';
			if (kwArgs.weak) templateId = 'fail';
			if (kwArgs.forme) templateId = 'failWrongForme';
			template = this.template(templateId, id);
			return line1 + this.render(template, { POKEMON: this.pokemon(pokemon) });
		}

		case '-immune': {
			const [, pokemon] = args;
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			let template = this.template('block', kwArgs.from);
			if (!template) {
				const templateId = kwArgs.ohko ? 'immuneOHKO' : 'immune';
				template = this.template(pokemon ? templateId : 'immuneNoPokemon', kwArgs.from);
			}
			return line1 + this.render(template, { POKEMON: this.pokemon(pokemon) });
		}

		case '-miss': {
			const [, source, pokemon] = args;
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			if (!pokemon) {
				const template = this.template('missNoPokemon');
				return line1 + this.render(template, { SOURCE: this.pokemon(source) });
			}
			const template = this.template('miss');
			return line1 + this.render(template, { POKEMON: this.pokemon(pokemon) });
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
			if (!item && cmd === '-mega') templateId = 'megaNoItem';
			let template = this.template(templateId, id);
			const side = pokemon.slice(0, 2);
			const pokemonName = this.pokemon(pokemon);
			if (cmd === '-mega') {
				template += this.template('transformMega');
			}
			return this.render(template, {
				POKEMON: pokemonName,
				SPECIES: this.speciesName(species),
				ITEM: this.itemValue(item),
				TRAINER: this.trainer(side),
			});
		}

		case '-terastallize': {
			const [, pokemon, type] = args;
			let id = '';
			let templateId = cmd.slice(1);
			let template = this.template(templateId, id);
			const pokemonName = this.pokemon(pokemon);
			return this.render(template, { POKEMON: pokemonName, TYPE: type });
		}

		case '-zpower': {
			const [, pokemon] = args;
			const template = this.template('zPower');
			return this.render(template, { POKEMON: this.pokemon(pokemon) });
		}

		case '-burst': {
			const [, pokemon] = args;
			const template = this.template('activate', "Ultranecrozium Z");
			return this.render(template, { POKEMON: this.pokemon(pokemon) });
		}

		case '-zbroken': {
			const [, pokemon] = args;
			const template = this.template('zBroken');
			return this.render(template, { POKEMON: this.pokemon(pokemon) });
		}

		case '-hitcount': {
			const [, , num] = args;
			return this.render(this.template('hitCount'), {
				NUMBER: { value: num, category: num === '1' ? 's' : 'p' },
			});
		}

		case '-waiting': {
			const [, pokemon, target] = args;
			const template = this.template('activate', "Water Pledge");
			return this.render(template, {
				POKEMON: this.pokemon(pokemon), TARGET: this.pokemon(target),
			});
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

declare const require: any;
declare const global: any;
if (typeof require === 'function') {
	// in Node
	global.BattleTextParser = BattleTextParser;
}
