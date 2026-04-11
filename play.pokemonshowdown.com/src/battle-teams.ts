import { Dex, toID, type ModdedDex } from "./battle-dex";
import { BattleNatures, BattleStatNames, BattleStatIDs, type StatNameExceptHP, type ID } from "./battle-dex-data";

export declare namespace Teams {
	/**
	 * Teams.PokemonSet can be sparse, in which case that entry should be
	 * inferred from the rest of the set, according to sensible
	 * defaults.
	 */
	export interface FullPokemonSet {
		/** Defaults to species name (not including forme), like in games */
		name: string;
		species: string;
		/** Defaults to no item */
		item?: string;
		/** Defaults to no ability (error in Gen 3+) */
		ability?: string;
		moves: string[];
		/** Defaults to no nature (error in Gen 3+) */
		nature?: Dex.NatureName;
		/** Defaults to random legal gender, NOT subject to gender ratios */
		gender?: string;
		/** Defaults to flat 252's (200's/0's in Let's Go) (error in gen 3+) */
		evs: Partial<Dex.StatsTable>;
		/** Defaults to whatever makes sense - flat 31's unless you have Gyro Ball etc */
		ivs: Dex.StatsTable;
		/** Defaults as you'd expect (100 normally, 50 in VGC-likes, 5 in LC) */
		level: number;
		/** Defaults to no (error if shiny event) */
		shiny: boolean;
		/** Defaults to 255 unless you have Frustration, in which case 0 */
		happiness: number;
		/** Defaults to event required ball, otherwise Poké Ball */
		pokeball: string;
		/** Defaults to the type of your Hidden Power in Moves, otherwise Dark */
		hpType?: string;
		/** Defaults to 10 */
		dynamaxLevel?: number;
		/** Defaults to no (can only be yes for certain Pokemon) */
		gigantamax?: boolean;
		/** Defaults to the primary type */
		teraType?: string;
	}
	export interface PokemonSet extends Partial<FullPokemonSet> {
		/** Defaults to species name (not including forme), like in games */
		species: string;
		moves: string[];
	}
	export interface Team {
		name: string;
		format: ID;
		folder: string;
		/** Note that this can be wrong if `.uploaded?.notLoaded` */
		packedTeam: string;
		isBox: boolean;
	}
}

export const Teams = new class {
	pack(team: Teams.PokemonSet[] | null): string {
		if (!team) return '';

		function getIv(ivs: Dex.StatsTable, s: keyof Dex.StatsTable): string {
			return ivs[s] === 31 || ivs[s] === undefined ? '' : ivs[s].toString();
		}

		let buf = '';
		for (const set of team) {
			if (buf) buf += ']';

			// name
			buf += (set.name || set.species);

			// species
			const speciesid = this.packName(set.species || set.name);
			buf += `|${this.packName(set.name || set.species) === speciesid ? '' : speciesid}`;

			// item
			buf += `|${this.packName(set.item)}`;

			// ability
			buf += `|${this.packName(set.ability)}`;

			// moves
			buf += '|' + set.moves.map(this.packName).join(',');

			// nature
			buf += `|${set.nature || ''}`;

			// evs
			let evs = '|';
			if (set.evs) {
				evs = `|${set.evs['hp'] || ''},${set.evs['atk'] || ''},${set.evs['def'] || ''},` +
					`${set.evs['spa'] || ''},${set.evs['spd'] || ''},${set.evs['spe'] || ''}`;
			}
			buf += evs === '|,,,,,' ? '|' : evs;

			// gender
			buf += `|${set.gender || ''}`;

			// ivs
			let ivs = '|';
			if (set.ivs) {
				ivs = `|${getIv(set.ivs, 'hp')},${getIv(set.ivs, 'atk')},${getIv(set.ivs, 'def')},` +
					`${getIv(set.ivs, 'spa')},${getIv(set.ivs, 'spd')},${getIv(set.ivs, 'spe')}`;
			}
			buf += ivs === '|,,,,,' ? '|' : ivs;

			// shiny
			buf += `|${set.shiny ? 'S' : ''}`;

			// level
			buf += `|${set.level && set.level !== 100 ? set.level : ''}`;

			// happiness
			buf += `|${set.happiness !== undefined && set.happiness !== 255 ? set.happiness : ''}`;

			if (set.pokeball || set.hpType || set.gigantamax ||
				(set.dynamaxLevel !== undefined && set.dynamaxLevel !== 10) || set.teraType) {
				buf += `,${set.hpType || ''}`;
				buf += `,${this.packName(set.pokeball || '')}`;
				buf += `,${set.gigantamax ? 'G' : ''}`;
				buf += `,${set.dynamaxLevel !== undefined && set.dynamaxLevel !== 10 ? set.dynamaxLevel : ''}`;
				buf += `,${set.teraType || ''}`;
			}
		}

		return buf;
	}
	/** Very similar to toID but without the lowercase conversion */
	packName(this: void, name: string | undefined | null) {
		if (!name) return '';
		return name.replace(/[^A-Za-z0-9]+/g, '');
	}

	unpack(buf: string): Teams.PokemonSet[] {
		if (!buf) return [];

		// first, detect if this has team metadata
		const endIndex = buf.indexOf(']');
		if (endIndex > 0) {
			const firstPart = buf.slice(0, endIndex);
			const pipeCount = firstPart.split('|').length - 1;
			if (pipeCount === 12 || pipeCount === 1) {
				buf = buf.slice(buf.indexOf('|') + 1);
			}
		}

		const team = [];
		let i = 0;
		let j = 0;
		let lastI = 0;

		while (true) {
			const set: Teams.PokemonSet = {} as any;
			team.push(set);

			// name
			j = buf.indexOf('|', i);
			const name = buf.substring(i, j);
			i = j + 1;

			// species
			j = buf.indexOf('|', i);
			const species = Dex.species.get(buf.substring(i, j) || name);
			set.species = species.name;
			if (species.baseSpecies !== name) set.name = name;
			i = j + 1;

			// item
			j = buf.indexOf('|', i);
			set.item = Dex.items.get(buf.substring(i, j)).name;
			i = j + 1;

			// ability
			j = buf.indexOf('|', i);
			const ability = Dex.abilities.get(buf.substring(i, j)).name;
			set.ability = (species.abilities &&
				['', '0', '1', 'H', 'S'].includes(ability) ? species.abilities[ability as '0' || '0'] : ability);
			i = j + 1;

			// moves
			j = buf.indexOf('|', i);
			set.moves = buf.substring(i, j).split(',').map(
				moveid => Dex.moves.get(moveid).name
			);
			i = j + 1;

			// nature
			j = buf.indexOf('|', i);
			set.nature = buf.substring(i, j) as Dex.NatureName;
			if (set.nature as any === 'undefined') delete set.nature;
			i = j + 1;

			// evs
			j = buf.indexOf('|', i);
			if (j !== i) {
				const evstring = buf.substring(i, j);
				if (evstring.length > 5) {
					const evs = evstring.split(',');
					set.evs = {
						hp: Number(evs[0]) || 0,
						atk: Number(evs[1]) || 0,
						def: Number(evs[2]) || 0,
						spa: Number(evs[3]) || 0,
						spd: Number(evs[4]) || 0,
						spe: Number(evs[5]) || 0,
					};
				} else if (evstring === '0') {
					set.evs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
				}
			}
			i = j + 1;

			// gender
			j = buf.indexOf('|', i);
			if (i !== j) set.gender = buf.substring(i, j);
			i = j + 1;

			// ivs
			j = buf.indexOf('|', i);
			if (j !== i) {
				const ivs = buf.substring(i, j).split(',');
				set.ivs = {
					hp: ivs[0] === '' ? 31 : Number(ivs[0]),
					atk: ivs[1] === '' ? 31 : Number(ivs[1]),
					def: ivs[2] === '' ? 31 : Number(ivs[2]),
					spa: ivs[3] === '' ? 31 : Number(ivs[3]),
					spd: ivs[4] === '' ? 31 : Number(ivs[4]),
					spe: ivs[5] === '' ? 31 : Number(ivs[5]),
				};
			}
			i = j + 1;

			// shiny
			j = buf.indexOf('|', i);
			if (i !== j) set.shiny = true;
			i = j + 1;

			// level
			j = buf.indexOf('|', i);
			if (i !== j) set.level = parseInt(buf.substring(i, j), 10);
			i = j + 1;

			// happiness
			j = buf.indexOf(']', i);
			let misc;
			if (j < 0) {
				if (i < buf.length) misc = buf.substring(i).split(',', 6);
			} else {
				if (i !== j) misc = buf.substring(i, j).split(',', 6);
			}
			if (misc) {
				set.happiness = (misc[0] ? Number(misc[0]) : undefined);
				set.hpType = misc[1] || undefined;
				set.pokeball = misc[2] || undefined;
				set.gigantamax = !!misc[3] || undefined;
				set.dynamaxLevel = (misc[4] ? Number(misc[4]) : undefined);
				set.teraType = misc[5] || undefined;
			}
			i = j + 1;
			if (j < 0 || i <= lastI) break;
			lastI = i;
		}

		return team;
	}
	unpackSpeciesOnly(buf: string): string[] {
		if (!buf) return [];

		const team = [];
		let i = 0;
		let lastI = 0;

		while (true) {
			const name = buf.slice(i, buf.indexOf('|', i));
			i = buf.indexOf('|', i) + 1;

			team.push(buf.slice(i, buf.indexOf('|', i)) || name);

			for (let k = 0; k < 9; k++) {
				i = buf.indexOf('|', i) + 1;
			}

			i = buf.indexOf(']', i) + 1;

			if (i < 1 || i <= lastI) break;
			lastI = i;
		}

		return team;
	}
	/**
	 * (You may wish to manually add two spaces to the end of every line so
	 * linebreaks are preserved in Markdown; I assume mostly for Reddit.)
	 */
	exportSet(set: Teams.PokemonSet, dex: ModdedDex = Dex, newFormat?: boolean) {
		let text = '';

		// core
		if (set.name && set.name !== set.species) {
			text += `${set.name} (${set.species})`;
		} else {
			text += `${set.species}`;
		}
		if (set.gender === 'M') text += ` (M)`;
		if (set.gender === 'F') text += ` (F)`;
		if (!newFormat && set.item) {
			text += ` @ ${set.item}`;
		}
		text += `\n`;
		if ((set.item || set.ability || dex.gen >= 2) && newFormat) {
			if (set.ability || dex.gen >= 3) text += `[${set.ability || '(select ability)'}]`;
			if (set.item || dex.gen >= 2) text += ` @ ${set.item || "(no item)"}`;
			text += `\n`;
		} else if (set.ability && set.ability !== 'No Ability') {
			text += `Ability: ${set.ability}\n`;
		}

		if (newFormat) {
			if (set.moves) {
				for (let move of set.moves) {
					if (move.startsWith('Hidden Power ')) {
						const hpType = move.slice(13);
						move = move.slice(0, 13);
						move = `${move}[${hpType}]`;
					}
					text += `- ${move || ''}\n`;
				}
			}
			for (let i = set.moves?.length || 0; i < 4; i++) {
				text += `- \n`;
			}
		}

		// stats
		let first = true;
		if (set.evs || set.nature) {
			const nature = newFormat ? BattleNatures[set.nature as 'Serious'] : null;
			for (const stat of Dex.statNames) {
				const plusMinus = !newFormat ? '' : nature?.plus === stat ? '+' : nature?.minus === stat ? '-' : '';
				const ev = set.evs?.[stat] || '';
				if (ev === '' && !plusMinus) continue;
				text += first ? `EVs: ` : ` / `;
				first = false;
				text += `${ev}${plusMinus} ${BattleStatNames[stat]}`;
			}
		}
		if (!first) {
			if (set.nature && newFormat) text += ` (${set.nature})`;
			text += `\n`;
		}
		if (set.nature && !newFormat) {
			text += `${set.nature} Nature\n`;
		} else if (['Hardy', 'Docile', 'Serious', 'Bashful', 'Quirky'].includes(set.nature!)) {
			text += `${set.nature!} Nature\n`;
		}
		first = true;
		if (set.ivs) {
			for (const stat of Dex.statNames) {
				if (set.ivs[stat] === undefined || isNaN(set.ivs[stat]) || set.ivs[stat] === 31) continue;
				if (first) {
					text += `IVs: `;
					first = false;
				} else {
					text += ` / `;
				}
				text += `${set.ivs[stat]} ${BattleStatNames[stat]}`;
			}
		}
		if (!first) {
			text += `\n`;
		}

		// details
		if (set.level && set.level !== 100) {
			text += `Level: ${set.level}\n`;
		}
		if (set.shiny) {
			text += !newFormat ? `Shiny: Yes\n` : `Shiny\n`;
		}
		if (typeof set.happiness === 'number' && set.happiness !== 255 && !isNaN(set.happiness)) {
			text += `Happiness: ${set.happiness}\n`;
		}
		if (typeof set.dynamaxLevel === 'number' && set.dynamaxLevel !== 255 && !isNaN(set.dynamaxLevel)) {
			text += `Dynamax Level: ${set.dynamaxLevel}\n`;
		}
		if (set.gigantamax) {
			text += !newFormat ? `Gigantamax: Yes\n` : `Gigantamax\n`;
		}
		if (set.teraType) {
			text += `Tera Type: ${set.teraType}\n`;
		}

		if (!newFormat) {
			for (let move of set.moves || []) {
				if (move.startsWith('Hidden Power ')) {
					const hpType = move.slice(13);
					move = move.slice(0, 13);
					move = !newFormat ? `${move}[${hpType}]` : `${move}${hpType}`;
				}
				text += `- ${move}\n`;
			}
			for (let i = set.moves?.length || 0; i < 4; i++) {
				text += `- \n`;
			}
		}

		text += `\n`;
		return text;
	}
	// TODO: finish this impl
	// getFullSet(set: Teams.PokemonSet, dex: ModdedDex): Teams.FullPokemonSet {
	// 	//
	// }
	export(sets: Teams.PokemonSet[], dex?: ModdedDex, newFormat?: boolean) {
		let text = '';
		for (const set of sets) {
			// core
			text += Teams.exportSet(set, dex, newFormat);
		}
		return text;
	}

	parseExportedTeamLine(line: string, isFirstLine: boolean, set: Dex.PokemonSet) {
		if (isFirstLine || line.startsWith('[')) {
			let item;
			[line, item] = line.split('@');
			line = line.trim();
			item = item?.trim();
			if (item) {
				set.item = item;
				if (toID(set.item) === 'noitem') set.item = '';
			}
			if (line.endsWith(' (M)')) {
				set.gender = 'M';
				line = line.slice(0, -4);
			}
			if (line.endsWith(' (F)')) {
				set.gender = 'F';
				line = line.slice(0, -4);
			}
			if (line.startsWith('[') && line.endsWith(']')) {
				// the ending `]` is necessary to establish this as ability
				// (rather than nickname starting with `[`)
				set.ability = line.slice(1, -1);
				if (toID(set.ability) === 'selectability') {
					set.ability = '';
				}
			} else if (line) {
				const parenIndex = line.lastIndexOf(' (');
				if (line.endsWith(')') && parenIndex !== -1) {
					set.species = Dex.species.get(line.slice(parenIndex + 2, -1)).name;
					set.name = line.slice(0, parenIndex);
				} else {
					set.species = Dex.species.get(line).name;
					set.name = '';
				}
			}
		} else if (line.startsWith('Trait: ')) {
			set.ability = line.slice(7);
		} else if (line.startsWith('Ability: ')) {
			set.ability = line.slice(9);
		} else if (line.startsWith('Item: ')) {
			set.item = line.slice(6);
		} else if (line.startsWith('Nickname: ')) {
			set.name = line.slice(10);
		} else if (line.startsWith('Species: ')) {
			set.species = line.slice(9);
		} else if (line === 'Shiny: Yes' || line === 'Shiny') {
			set.shiny = true;
		} else if (line.startsWith('Level: ')) {
			set.level = +line.slice(7);
		} else if (line.startsWith('Happiness: ')) {
			set.happiness = +line.slice(11);
		} else if (line.startsWith('Pokeball: ')) {
			set.pokeball = line.slice(10);
		} else if (line.startsWith('Hidden Power: ')) {
			set.hpType = line.slice(14);
		} else if (line.startsWith('Dynamax Level: ')) {
			set.dynamaxLevel = +line.slice(15);
		} else if (line === 'Gigantamax: Yes' || line === 'Gigantamax') {
			set.gigantamax = true;
		} else if (line.startsWith('Tera Type: ')) {
			set.teraType = line.slice(11);
		} else if (line.startsWith('EVs: ')) {
			const evLines = line.slice(5).split('(')[0].split('/');
			set.evs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
			let plus = '', minus = '';
			for (let evLine of evLines) {
				evLine = evLine.trim();
				const spaceIndex = evLine.indexOf(' ');
				if (spaceIndex === -1) continue;
				const statid = BattleStatIDs[evLine.slice(spaceIndex + 1)];
				if (!statid) continue;
				if (evLine.charAt(spaceIndex - 1) === '+') plus = statid;
				if (evLine.charAt(spaceIndex - 1) === '-') minus = statid;
				set.evs[statid] = parseInt(evLine.slice(0, spaceIndex), 10) || 0;
			}
			const nature = this.getNatureFromPlusMinus(plus as StatNameExceptHP, minus as StatNameExceptHP);
			if (nature) set.nature = nature;
		} else if (line.startsWith('IVs: ')) {
			const ivLines = line.slice(5).split(' / ');
			set.ivs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
			for (let ivLine of ivLines) {
				ivLine = ivLine.trim();
				const spaceIndex = ivLine.indexOf(' ');
				if (spaceIndex === -1) continue;
				const statid = BattleStatIDs[ivLine.slice(spaceIndex + 1)];
				if (!statid) continue;
				let statval = parseInt(ivLine.slice(0, spaceIndex), 10);
				if (isNaN(statval)) statval = 31;
				set.ivs[statid] = statval;
			}
		} else if (/^[A-Za-z]+ (N|n)ature/.exec(line)) {
			let natureIndex = line.indexOf(' Nature');
			if (natureIndex === -1) natureIndex = line.indexOf(' nature');
			if (natureIndex === -1) return;
			line = line.slice(0, natureIndex);
			if (line !== 'undefined') set.nature = line as Dex.NatureName;
		} else if (line.startsWith('-') || line.startsWith('~') || line.startsWith('Move:')) {
			if (line.startsWith('Move:')) line = line.slice(4);
			line = line.slice(line.charAt(1) === ' ' ? 2 : 1);
			if (line.startsWith('Hidden Power [')) {
				let hpType = line.slice(14, line.indexOf(']')) as Dex.TypeName;
				if (hpType.includes(']') || hpType.includes('[')) hpType = '' as any;
				line = 'Hidden Power ' + hpType;
				set.hpType = hpType;
			}
			if (line === 'Frustration' && set.happiness === undefined) {
				set.happiness = 0;
			}
			set.moves.push(line);
		}
	}
	getNatureFromPlusMinus(
		plus: StatNameExceptHP | '' | null, minus: StatNameExceptHP | '' | null
	): Dex.NatureName | null {
		if (!plus || !minus) return null;
		for (const i in BattleNatures) {
			if (BattleNatures[i as 'Serious'].plus === plus && BattleNatures[i as 'Serious'].minus === minus) {
				return i as Dex.NatureName;
			}
		}
		return null;
	}
	import(buffer: string): Dex.PokemonSet[] {
		const lines = buffer.split("\n");

		const sets: Dex.PokemonSet[] = [];
		let curSet: Dex.PokemonSet | null = null;

		while (lines.length && !lines[0]) lines.shift();
		while (lines.length && !lines[lines.length - 1]) lines.pop();

		if (lines.length === 1 && lines[0].includes('|')) {
			return Teams.unpack(lines[0]);
		}
		for (let line of lines) {
			line = line.trim();
			if (line === '' || line === '---') {
				curSet = null;
			} else if (line.startsWith('===')) {
				// team backup format; ignore
			} else if (line.includes('|')) {
				// packed format
				return Teams.unpack(line);
			} else if (!curSet) {
				curSet = {
					name: '', species: '', gender: '',
					moves: [],
				};
				sets.push(curSet);
				this.parseExportedTeamLine(line, true, curSet);
			} else {
				this.parseExportedTeamLine(line, false, curSet);
			}
		}
		return sets;
	}
};
