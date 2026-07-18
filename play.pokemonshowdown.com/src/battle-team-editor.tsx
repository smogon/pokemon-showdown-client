/**
 * Teambuilder team editor, extracted from the rest of the Preact
 * client so that it can be used in isolation.
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

import preact from "../js/lib/preact";
import { type Team, Config, PS } from "./client-main";
import { Dex, type ModdedDex, toID, type ID, PSUtils } from "./battle-dex";
import { Teams } from './battle-teams';
import { DexSearch, type SearchRow, type SearchType } from "./battle-dex-search";
import { PSSearchResults } from "./battle-searchresults";
import { BattleNatures, BattleStatNames, type StatName } from "./battle-dex-data";
import { BattleStatGuesser, BattleStatOptimizer, BattleTooltips } from "./battle-tooltips";
import { PSModel } from "./client-core";
import { Net } from "./client-connection";
import { PSIcon, PSView } from "./panels";

type InnerFocusType = 'pokemon' | 'ability' | 'item' | 'move' | 'stats' | 'details' | 'import';
type TeamEditorMode = 'form' | 'import';

interface FocusState {
	setIndex: number;
	type: InnerFocusType | 'nickname';
	/** -1 means no specific slot is focused; other values used only for move */
	typeIndex: number;
};
interface InnerFocusState extends FocusState {
	type: InnerFocusType;
}
type SampleSets = {
	[speciesName: string]: {
		[setName: string]: Dex.PokemonSet,
	},
};
type SampleSetsTable = { dex?: SampleSets, stats?: SampleSets };

export class TeamEditorState extends PSModel {
	static clipboard: {
		teams: {
			[teamKey: string]: {
				team: Team,
				sets: { [index: number]: Dex.PokemonSet },
				/** was the team added from the team list rather than the team editor's set list?
				  * (if yes, delete the team itself when moving it) */
				entire: boolean,
			},
		} | null,
		otherSets: Dex.PokemonSet[] | null,
		readonly: boolean,
	} | null = null;
	team: Team;
	sets: Dex.PokemonSet[] = [];
	lastPackedTeam = '';
	gen = Dex.gen;
	dex: ModdedDex = Dex;
	deletedSet: {
		set: Dex.PokemonSet,
		index: number,
	} | null = null;
	search = new DexSearch();
	format: ID = `gen${this.gen}` as ID;
	originalSpecies: string | null = null;
	narrow = false;
	innerFocus: InnerFocusState | null = null;
	isLetsGo = false;
	isNatDex = false;
	isBDSP = false;
	isChampions = false;
	formeLegality: 'normal' | 'hackmons' | 'custom' = 'normal';
	abilityLegality: 'normal' | 'hackmons' = 'normal';
	defaultLevel = 100;
	readonly = false;
	fetching = false;
	handleParentKeyDown?: (ev: KeyboardEvent) => boolean | void;
	private userSetsCache: Record<ID, { [species: string]: { [setName: string]: Dex.PokemonSet } }> = {};
	constructor(team: Team) {
		super();
		this.team = team;
		this.updateTeam(false);
		this.setFormat(team.format);
		window.search = this.search;
	}
	updateTeam(readonly: boolean) {
		if (this.lastPackedTeam !== this.team.packedTeam) {
			this.sets = Teams.unpack(this.team.packedTeam);
			this.lastPackedTeam = this.team.packedTeam;
		}
		this.readonly = readonly;
	}
	setFormat(format: string) {
		const team = this.team;
		const formatid = toID(format);
		this.format = formatid;
		team.format = formatid;
		this.dex = Dex.forFormat(formatid);
		this.gen = this.dex.gen;

		format = toID(format).slice(4);
		this.isLetsGo = formatid.includes('letsgo');
		this.isNatDex = formatid.includes('nationaldex') || formatid.includes('natdex');
		this.isBDSP = formatid.includes('bdsp');
		this.isChampions = formatid.includes('champions');
		if (formatid.includes('almostanyability') || formatid.includes('aaa')) {
			this.abilityLegality = 'hackmons';
		} else {
			this.abilityLegality = 'normal';
		}
		if (formatid.includes('hackmons') || formatid.includes('bh')) {
			this.formeLegality = 'hackmons';
			this.abilityLegality = 'hackmons';
		} else if (formatid.includes('metronome') || formatid.includes('customgame')) {
			this.formeLegality = 'custom';
			this.abilityLegality = 'hackmons';
		} else {
			this.formeLegality = 'normal';
		}

		this.defaultLevel = 100;
		if (
			formatid.includes('vgc') || formatid.includes('bss') || formatid.includes('ultrasinnohclassic') ||
			formatid.includes('battlespot') || formatid.includes('battlestadium') || formatid.includes('battlefestival') ||
			formatid.includes('letsgo') || formatid.includes('champions')
		) {
			this.defaultLevel = 50;
		}
		if (formatid.includes('lc')) {
			this.defaultLevel = 5;
		}
	}
	stringifyFocus(focus: FocusState | null): string {
		if (!focus) return '';
		return `set-${focus.setIndex}-${focus.type}${focus.typeIndex >= 0 ? `-${focus.typeIndex}` : ''}`;
	}
	parseFocus(value: null): null;
	parseFocus(value: string): FocusState;
	parseFocus(value: string | null): FocusState | null;
	parseFocus(value: string | null): FocusState | null {
		if (!value) return null;
		const match = value.split('-');
		const type = match[2] as InnerFocusType;
		return {
			setIndex: parseInt(match[1]),
			type,
			typeIndex: match[3] ? parseInt(match[3]) : -1,
		};
	}
	getField({ setIndex, type, typeIndex }: FocusState) {
		const set = this.sets[setIndex];
		if (!set) return '';
		switch (type) {
		case 'pokemon':
			return set.species || '';
		case 'item':
			return set.item || '';
		case 'ability':
			return set.ability || '';
		case 'move':
			return set.moves[typeIndex] || '';
		case 'nickname':
			return set.name || '';
		default:
			return '';
		}
	}
	normalizeField(type: InnerFocusType, value: string): string | null {
		if (!value.trim()) return '';

		switch (type) {
		case 'pokemon': {
			const species = this.dex.species.get(value);
			return species.exists ? species.name : null;
		}
		case 'item': {
			if (toID(value) === 'noitem') return '';
			const item = this.dex.items.get(value);
			return item.exists ? item.name : null;
		}
		case 'ability': {
			if (toID(value) === 'noability') return '';
			const ability = this.dex.abilities.get(value);
			return ability.exists ? ability.name : null;
		}
		case 'move': {
			const move = this.dex.moves.get(value);
			return move.exists ? move.name : null;
		}
		default:
			return value;
		}
	}
	setSearchType(type: SearchType, i: number, value?: string, typeIndex = -1) {
		const set = this.sets[i];
		this.search.setType(type, this.format, set);
		this.originalSpecies = null;
		this.search.prependResults = null;
		if (type === 'move') {
			this.search.prependResults = this.getSearchMoves(set, typeIndex);
			if (value && this.search.prependResults.some(row => row[1].split('_')[2] === toID(value))) {
				value = '';
			}
		} else if (value) {
			switch (type) {
			case 'pokemon':
				if (this.dex.species.get(value).exists) {
					this.originalSpecies = value;
					this.search.prependResults = [['pokemon', toID(value)]];
					value = '';
				}
				break;
			case 'item':
				if (toID(value) === 'noitem') value = '';
				if (this.dex.items.get(value).exists) {
					this.search.prependResults = [['item', toID(value)]];
					value = '';
				}
				break;
			case 'ability':
				if (toID(value) === 'selectability') value = '';
				if (toID(value) === 'noability') value = '';
				if (this.dex.abilities.get(value).exists) {
					this.search.prependResults = [['ability', toID(value)]];
					value = '';
				}
				break;
			}
		}

		if (type === 'item') (this.search.prependResults ||= []).push(['item', '' as ID]);
		this.search.find(value || '');
	}
	updateSearchMoves(set: Dex.PokemonSet, typeIndex = -1) {
		let oldResultsLength = this.search.prependResults?.length || 0;
		this.search.prependResults = this.getSearchMoves(set, typeIndex);
		const selection = Math.max(0, this.search.selection + this.search.prependResults.length - oldResultsLength);
		this.search.results = null;
		if (this.search.query) {
			this.setSearchValue('');
		} else {
			this.search.find('');
			this.search.selection = selection;
		}
	}
	getSearchMoves(set: Dex.PokemonSet, typeIndex = -1) {
		const out: SearchRow[] = [];
		const start = typeIndex >= 0 ? typeIndex : 0;
		const end = typeIndex >= 0 ? typeIndex + 1 : Math.max(set.moves.length, 4);
		for (let i = start; i < end; i++) {
			out.push(['move', `_${i + 1}_${toID(set.moves[i] || '')}` as ID]);
		}
		return out;
	}
	setSearchValue(value: string) {
		this.search.find(value);
	}
	changeSpecies(set: Dex.PokemonSet, speciesName: string) {
		const species = this.dex.species.get(speciesName);
		if (set.item === this.getDefaultItem(set.species)) set.item = undefined;
		if (set.name === set.species.split('-')[0]) delete set.name;
		set.species = species.name;
		set.ability = this.getDefaultAbility(set);
		set.item = this.getDefaultItem(species.name) ?? set.item;

		if (toID(speciesName) === 'Cathy') {
			set.name = "Cathy";
			set.species = 'Trevenant';
			set.level = undefined;
			set.gender = 'F';
			set.item = 'Starf Berry';
			set.ability = 'Harvest';
			set.moves = ['Substitute', 'Horn Leech', 'Earthquake', 'Phantom Force'];
			set.evs = { hp: 36, atk: 252, def: 0, spa: 0, spd: 0, spe: 220 };
			set.ivs = undefined;
			set.nature = 'Jolly';
		}
	}
	deleteSet(index: number) {
		if (this.sets.length <= index) return;
		this.deletedSet = {
			set: this.sets[index],
			index,
		};
		this.sets.splice(index, 1);
	}
	undeleteSet() {
		if (!this.deletedSet) return;
		this.sets.splice(this.deletedSet.index, 0, this.deletedSet.set);
		this.deletedSet = null;
	}
	copySet(index: number) {
		if (this.sets.length <= index) return;

		TeamEditorState.clipboard ||= {
			teams: {},
			otherSets: null,
			readonly: false,
		};
		TeamEditorState.clipboard.teams ||= {};
		TeamEditorState.clipboard.teams[this.team.key] ||= {
			team: this.team, sets: {}, entire: false,
		};
		if (this.readonly) TeamEditorState.clipboard.readonly = true;

		if (TeamEditorState.clipboard.teams[this.team.key].sets[index] === this.sets[index]) {
			// remove
			TeamEditorState.clipboard.teams[this.team.key].entire = false;
			delete TeamEditorState.clipboard.teams[this.team.key].sets[index];
			if (!Object.keys(TeamEditorState.clipboard.teams[this.team.key].sets).length) {
				delete TeamEditorState.clipboard.teams[this.team.key];
			}
			if (!Object.keys(TeamEditorState.clipboard.teams).length) {
				TeamEditorState.clipboard.teams = null;
				if (!TeamEditorState.clipboard.otherSets) {
					TeamEditorState.clipboard = null;
				}
			}
			return;
		}
		TeamEditorState.clipboard.teams[this.team.key].sets[index] = this.sets[index];
	}
	static copyTeam(team: Team) {
		TeamEditorState.clipboard ||= {
			teams: {},
			otherSets: null,
			readonly: false,
		};
		TeamEditorState.clipboard.teams ||= {};

		if (TeamEditorState.clipboard.teams[team.key]) {
			// remove
			delete TeamEditorState.clipboard.teams[team.key];
			if (!Object.keys(TeamEditorState.clipboard.teams).length) {
				TeamEditorState.clipboard.teams = null;
				if (!TeamEditorState.clipboard.otherSets) {
					TeamEditorState.clipboard = null;
				}
			}
			return;
		}
		TeamEditorState.clipboard.teams[team.key] ||= {
			team, sets: {}, entire: true,
		};
		const sets = Teams.unpack(team.packedTeam);
		for (let i = 0; i < sets.length; i++) {
			TeamEditorState.clipboard.teams[team.key].sets[i] = sets[i];
		}
	}
	pasteSet(index: number, isMove?: boolean) {
		if (!TeamEditorState.clipboard) return;
		if (this.readonly) return;

		if (isMove) {
			if (TeamEditorState.clipboard.readonly) return;

			for (const key in TeamEditorState.clipboard.teams) {
				const clipboardTeam = TeamEditorState.clipboard.teams[key];
				const sources = Object.keys(clipboardTeam.sets).map(Number);
				// descending order, so splices won't affect future indices
				sources.sort((a, b) => -(a - b));
				for (const source of sources) {
					if (key === this.team.key) {
						this.sets.splice(source, 1);
						if (source < index) index--;
					} else {
						const team = clipboardTeam.team;
						const sets = Teams.unpack(team.packedTeam);
						sets.splice(source, 1);
						team.packedTeam = Teams.pack(sets);
						team.iconCache = null;
					}
				}
			}
		}

		const sets: Dex.PokemonSet[] = [];
		for (const key in TeamEditorState.clipboard.teams) {
			const clipboardTeam = TeamEditorState.clipboard.teams[key];
			for (const set of Object.values(clipboardTeam.sets)) {
				sets.push(set);
			}
		}
		sets.push(...TeamEditorState.clipboard.otherSets || []);

		const insertIndex = index;
		for (const set of sets) {
			// not the most efficient way to deepclone but we don't need efficiency here
			const newSet = JSON.parse(JSON.stringify(set)) as Dex.PokemonSet;
			this.sets.splice(index, 0, newSet);
			index++;
		}
		TeamEditorState.clipboard = null;
		this.save();
		return insertIndex;
	}
	static pasteTeam(index: number, isMove?: boolean, folder = '') {
		if (!TeamEditorState.clipboard) return;

		if (isMove) {
			if (TeamEditorState.clipboard.readonly) return;

			const indexesToRemove: number[] = [];
			for (const key in TeamEditorState.clipboard.teams) {
				if (TeamEditorState.clipboard.teams[key].entire) {
					const team = TeamEditorState.clipboard.teams[key].team;
					const i = PS.teams.list.indexOf(team);
					if (i >= 0) indexesToRemove.push(i);
				}
			}
			// descending order, so splices won't affect future indices
			indexesToRemove.sort((a, b) => -(a - b));
			for (const i of indexesToRemove) {
				PS.teams.list.splice(i, 1);
				if (i < index) index--;
			}
		}

		const teams: Team[] = [];

		const sets: Teams.PokemonSet[] = [];
		for (const key in TeamEditorState.clipboard.teams) {
			const clipboardTeam = TeamEditorState.clipboard.teams[key];
			if (clipboardTeam.entire) {
				if (isMove) {
					teams.push(clipboardTeam.team);
					clipboardTeam.team.folder = folder;
				} else {
					const team: Team = {
						name: `${clipboardTeam.team.name} (copy)`,
						format: clipboardTeam.team.format,
						folder,
						packedTeam: clipboardTeam.team.packedTeam,
						isBox: clipboardTeam.team.isBox,
						iconCache: null,
						key: '',
					};
					teams.push(team);
				}
			} else {
				for (const set of Object.values(clipboardTeam.sets)) {
					sets.push(set);
				}
			}
		}
		sets.push(...TeamEditorState.clipboard.otherSets || []);
		if (sets.length) {
			const team: Team = {
				name: `Pasted Team`,
				format: Dex.modid,
				folder,
				packedTeam: Teams.pack(sets),
				isBox: false,
				iconCache: null,
				key: '',
			};
			teams.push(team);
		}

		PS.teams.spliceIn(index, teams);

		TeamEditorState.clipboard = null;
		return teams;
	}
	canAdd(): boolean {
		return this.sets.length < 6 || this.team.isBox;
	}
	showItem(set: Dex.PokemonSet) {
		return !!(this.gen > 1 && !this.isLetsGo || set.item);
	}
	showAbility(set: Dex.PokemonSet) {
		return !!(this.gen > 2 && !this.isLetsGo || set.ability);
	}
	getHPType(set: Dex.PokemonSet): Dex.TypeName {
		if (set.hpType) return set.hpType as Dex.TypeName;
		const hpMove = set.ivs ? null : this.getHPMove(set);
		if (hpMove) return hpMove;

		const hpTypes = [
			'Fighting', 'Flying', 'Poison', 'Ground', 'Rock', 'Bug', 'Ghost', 'Steel', 'Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Ice', 'Dragon', 'Dark',
		] as const;
		if (this.gen <= 2) {
			if (!set.ivs) return 'Dark';
			// const hpDV = Math.floor(set.ivs.hp / 2);
			const atkDV = Math.floor(set.ivs.atk / 2);
			const defDV = Math.floor(set.ivs.def / 2);
			// const speDV = Math.floor(set.ivs.spe / 2);
			// const spcDV = Math.floor(set.ivs.spa / 2);
			// const expectedHpDV = (atkDV % 2) * 8 + (defDV % 2) * 4 + (speDV % 2) * 2 + (spcDV % 2);
			// if (expectedHpDV !== hpDV) {
			// 	set.ivs.hp = expectedHpDV * 2;
			// 	if (set.ivs.hp === 30) set.ivs.hp = 31;
			// }
			return hpTypes[4 * (atkDV % 4) + (defDV % 4)];
		} else {
			const ivs = set.ivs || this.defaultIVs(set);
			let hpTypeX = 0;
			let i = 1;
			// n.b. this is not our usual order (Spe and SpD are flipped)
			const statOrder = ['hp', 'atk', 'def', 'spe', 'spa', 'spd'] as const;
			for (const s of statOrder) {
				if (ivs[s] === undefined) ivs[s] = 31;
				hpTypeX += i * (ivs[s] % 2);
				i *= 2;
			}
			return hpTypes[Math.floor(hpTypeX * 15 / 63)];
		}
	};
	hpTypeMatters(set: Dex.PokemonSet): boolean {
		if (this.gen < 2) return false;
		if (this.gen > 7) return false;
		for (const move of set.moves) {
			const moveid = toID(move);
			if (moveid.startsWith('hiddenpower')) return true;
			if (moveid === 'transform') return true;
		}
		if (toID(set.ability) === 'imposter') return true;
		return false;
	}
	getHPMove(set: Dex.PokemonSet): Dex.TypeName | null {
		if (set.moves) {
			for (const move of set.moves) {
				const moveid = toID(move);
				if (moveid.startsWith('hiddenpower')) {
					return moveid.charAt(11).toUpperCase() + moveid.slice(12) as Dex.TypeName;
				}
			}
		}
		return null;
	}
	getIVs(set: Dex.PokemonSet) {
		const ivs = this.defaultIVs(set);
		if (set.ivs) Object.assign(ivs, set.ivs);
		return ivs;
	}
	defaultIVs(set: Dex.PokemonSet, noGuess = !!set.ivs): Record<Dex.StatName, number> {
		const useIVs = this.gen > 2;
		const defaultIVs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
		if (this.isChampions) return defaultIVs;
		if (!useIVs) {
			for (const stat of Dex.statNames) defaultIVs[stat] = 15;
		}
		if (noGuess) return defaultIVs;

		const hpType = this.getHPMove(set);
		const hpModulo = (useIVs ? 2 : 4);
		const { minAtk, minSpe } = this.prefersMinStats(set);
		if (minAtk) defaultIVs['atk'] = 0;
		if (minSpe) defaultIVs['spe'] = 0;

		if (!useIVs) {
			const hpDVs = hpType ? this.dex.types.get(hpType).HPdvs : null;
			if (hpDVs) {
				for (const stat in hpDVs) defaultIVs[stat as Dex.StatName] = hpDVs[stat as Dex.StatName]!;
			}
		} else {
			const hpIVs = hpType ? this.dex.types.get(hpType).HPivs : null;
			if (hpIVs) {
				if (this.canHyperTrain(set)) {
					if (minSpe) defaultIVs['spe'] = hpIVs['spe'] ?? 31;
					if (minAtk) defaultIVs['atk'] = hpIVs['atk'] ?? 31;
				} else {
					for (const stat in hpIVs) defaultIVs[stat as Dex.StatName] = hpIVs[stat as Dex.StatName]!;
				}
			}
		}

		if (hpType) {
			if (minSpe) defaultIVs['spe'] %= hpModulo;
			if (minAtk) defaultIVs['atk'] %= hpModulo;
		}
		if (minAtk && useIVs) {
			// min Atk
			if (['Gouging Fire', 'Iron Boulder', 'Iron Crown', 'Raging Bolt'].includes(set.species)) {
				// only available with 20 Atk IVs
				defaultIVs['atk'] = 20;
			} else if (set.species.startsWith('Terapagos')) {
				// only available with 15 Atk IVs
				defaultIVs['atk'] = 15;
			}
		}
		return defaultIVs;
	}
	defaultHappiness(set: Dex.PokemonSet) {
		if (set.moves.includes('Return')) return 255;
		if (set.moves.includes('Frustration')) return 0;
		return undefined;
	}
	prefersMinStats(set: Dex.PokemonSet) {
		let minSpe = !set.evs?.spe && set.moves.includes('Gyro Ball');
		let minAtk = !set.evs?.atk;

		// only available through an event with 31 Spe IVs
		if (set.species.startsWith('Terapagos')) minSpe = false;

		const preferMaxAtkFormats = ['1v1', 'categoryswap', 'partnersincrime', 'typesplit'];
		if (preferMaxAtkFormats.some(f => this.format.includes(f))) {
			minAtk = false;
			return { minAtk, minSpe };
		}
		if (this.format === 'gen7hiddentype') return { minAtk, minSpe };

		// only available through an event with 31 Atk IVs
		if (set.ability === 'Battle Bond' || ['Koraidon', 'Miraidon', 'Gimmighoul-Roaming'].includes(set.species)) {
			minAtk = false;
			return { minAtk, minSpe };
		}
		if (!set.moves.length) minAtk = false;
		for (const moveName of set.moves) {
			if (!moveName) continue;
			const move = this.dex.moves.get(moveName);
			if (move.id === 'transform') {
				const hasMoveBesidesTransform = set.moves.length > 1;
				if (!hasMoveBesidesTransform) minAtk = false;
			} else if (
				move.category === 'Physical' && !move.damage && !move.ohko &&
				!['foulplay', 'endeavor', 'counter', 'bodypress', 'seismictoss', 'bide', 'metalburst', 'superfang'].includes(move.id) &&
				!(this.gen < 8 && move.id === 'rapidspin')
			) {
				minAtk = false;
			} else if (
				['metronome', 'assist', 'copycat', 'mefirst', 'photongeyser', 'shellsidearm', 'terablast'].includes(move.id) ||
				(this.gen === 5 && move.id === 'naturepower')
			) {
				minAtk = false;
			}
		}

		return { minAtk, minSpe };
	}
	getNickname(set: Dex.PokemonSet) {
		return set.name || this.dex.species.get(set.species).baseSpecies || '';
	}
	canHyperTrain(set: Dex.PokemonSet) {
		let format: string = this.format;
		if (this.gen < 7 || format === 'gen7hiddentype') return false;
		if ((set.level || this.defaultLevel) === 100) return true;
		if ((set.level || this.defaultLevel) >= 50 && this.defaultLevel === 50) return true;
		return false;
	}
	getHPIVs(hpType: Dex.TypeName | null) {
		switch (hpType) {
		case 'Dark':
			return ['111111'];
		case 'Dragon':
			return ['011111', '101111', '110111'];
		case 'Ice':
			return ['010111', '100111', '111110'];
		case 'Psychic':
			return ['011110', '101110', '110110'];
		case 'Electric':
			return ['010110', '100110', '111011'];
		case 'Grass':
			return ['011011', '101011', '110011'];
		case 'Water':
			return ['100011', '111010'];
		case 'Fire':
			return ['101010', '110010'];
		case 'Steel':
			return ['100010', '111101'];
		case 'Ghost':
			return ['101101', '110101'];
		case 'Bug':
			return ['100101', '111100', '101100'];
		case 'Rock':
			return ['001100', '110100', '100100'];
		case 'Ground':
			return ['000100', '111001', '101001'];
		case 'Poison':
			return ['001001', '110001', '100001'];
		case 'Flying':
			return ['000001', '111000', '101000'];
		case 'Fighting':
			return ['001000', '110000', '100000'];
		default:
			return null;
		}
	}
	getStat(stat: StatName, set: Dex.PokemonSet, ivOverride: number, evOverride?: number, natureOverride?: number) {
		// do this after setting set.evs because it's assumed to exist
		// after getStat is run
		const species = this.dex.species.get(set.species);
		if (!species.exists) return 0;

		const level = set.level || this.defaultLevel;

		const baseStat = species.baseStats[stat];
		const iv = ivOverride;
		let ev = evOverride ?? set.evs?.[stat] ?? (this.gen > 2 ? 0 : 252);
		if (this.isChampions) ev *= 8;

		if (stat === 'hp') {
			if (baseStat === 1) return 1;
			if (this.isLetsGo) return Math.trunc(Math.trunc(2 * baseStat + iv + 100) * level / 100 + 10) + ev;
			return Math.trunc(Math.trunc(2 * baseStat + iv + Math.trunc(ev / 4) + 100) * level / 100 + 10);
		}
		let val = Math.trunc(Math.trunc(2 * baseStat + iv + Math.trunc(ev / 4)) * level / 100 + 5);
		if (this.isLetsGo) {
			val = Math.trunc(Math.trunc(2 * baseStat + iv) * level / 100 + 5);
		}
		if (natureOverride) {
			val *= natureOverride;
		} else if (BattleNatures[set.nature!]?.plus === stat) {
			val *= 1.1;
		} else if (BattleNatures[set.nature!]?.minus === stat) {
			val *= 0.9;
		}
		if (this.isLetsGo) {
			const friendshipValue = Math.trunc((70 / 255 / 10 + 1) * 100);
			val = Math.trunc(val) * friendshipValue / 100 + ev;
		}
		return Math.trunc(val);
	}
	export(includeTrailingSpaces?: boolean) {
		const exported = Teams.export(this.sets, this.dex);
		if (includeTrailingSpaces) return exported.replace(/^(.+)$/gm, '$1  ');
		return exported;
	}
	import(value: string) {
		this.sets = Teams.import(value);
		this.save();
	}
	getTypeWeakness(type: Dex.TypeName, attackType: Dex.TypeName): 0 | 0.5 | 1 | 2 {
		const weaknessType = this.dex.types.get(type).damageTaken?.[attackType];
		if (weaknessType === Dex.IMMUNE) return 0;
		if (weaknessType === Dex.RESIST) return 0.5;
		if (weaknessType === Dex.WEAK) return 2;
		return 1;
	}
	getWeakness(types: readonly Dex.TypeName[], abilityid: ID, attackType: Dex.TypeName): number {
		const abilityFactor = BattleTooltips.getTypeAbilityWeakness(attackType, abilityid, this.dex);
		if (abilityFactor === 0) return 0;

		if (abilityid === 'wonderguard') {
			for (const type of types) {
				if (this.getTypeWeakness(type, attackType) <= 1) return 0;
			}
		}

		let factor = abilityFactor;
		for (const type of types) {
			factor *= this.getTypeWeakness(type, attackType);
		}
		return factor;
	}
	pokemonDefensiveCoverage(set: Dex.PokemonSet) {
		const coverage: Record<string, number> = {};
		const species = this.dex.species.get(set.species);
		const abilityid = toID(set.ability);
		for (const type of this.dex.types.names()) {
			coverage[type] = this.getWeakness(species.types, abilityid, type);
		}
		return coverage as Record<Dex.TypeName, number>;
	}
	teamDefensiveCoverage() {
		type Counter = { type: Dex.TypeName, resists: number, neutrals: number, weaknesses: number };
		const counters: Record<Dex.TypeName, Counter> = {} as any;
		for (const type of this.dex.types.names()) {
			counters[type] = {
				type,
				resists: 0,
				neutrals: 0,
				weaknesses: 0,
			};
		}
		for (const set of this.sets) {
			const coverage = this.pokemonDefensiveCoverage(set);
			for (const [type, value] of Object.entries(coverage) as [Dex.TypeName, number][]) {
				if (value < 1) {
					counters[type].resists++;
				} else if (value === 1) {
					counters[type].neutrals++;
				} else {
					counters[type].weaknesses++;
				}
			}
		}
		return counters;
	}
	getDefaultAbility(set: Dex.PokemonSet) {
		if (this.gen < 3 || this.isLetsGo || this.formeLegality === 'custom') return set.ability;
		const species = this.dex.species.get(set.species);
		if (this.formeLegality === 'hackmons') {
			// TODO: support gen 9 hackmons forme legality more completely than this
			if (this.gen < 9 || species.baseSpecies !== 'Xerneas') return set.ability;
			// falls through to final return statement
		} else if (this.abilityLegality === 'hackmons') {
			if (!species.battleOnly) return set.ability;
			if (species.requiredItems.length || species.baseSpecies === 'Meloetta') return set.ability;
			// battle only species only ever have one ability
			// if they don't have a required item and aren't Meloetta, they change formes with that ability
			// so it's forced, even in AAA
			return species.abilities[0];
		}
		const abilities = Object.values(species.abilities);
		if (abilities.length === 1) return abilities[0];
		if (set.ability && abilities.includes(set.ability)) return set.ability;
		return undefined;
	}
	getDefaultItem(speciesName: string) {
		const species = this.dex.species.get(speciesName);
		let items = species.requiredItems;
		if (this.gen !== 7 && !this.isNatDex) {
			// Require plates on Arceus when Z crystals don't exist
			items = items.filter(i => !i.endsWith('ium Z'));
		}
		if (items.length === 1) {
			if (this.formeLegality === 'normal' ||
				this.formeLegality === 'hackmons' && this.gen === 9 && species.battleOnly &&
				!species.isMega && !species.isPrimal && species.name !== 'Necrozma-Ultra') {
				return items[0];
			}
		}
		return undefined;
	}
	save() {
		this.team.packedTeam = Teams.pack(this.sets);
		this.lastPackedTeam = this.team.packedTeam;
		this.team.iconCache = null;
	}

	/** undefined: loading, null: unavailable */
	static sampleSets: { [formatid: string]: SampleSetsTable | null } = {};
	// not static for complicated reasons. either way leads to an obscure
	// race condition if fetchSampleSets is called simultaneously from
	// different TeamEditorState instances, but this way just means two
	// network requests rather than the UI getting out of sync.
	_sampleSetPromises: Record<string, Promise<void>> = {};
	fetchSampleSets(formatid: ID) {
		if (formatid in TeamEditorState.sampleSets) return;
		if (formatid.length <= 4) {
			TeamEditorState.sampleSets[formatid] = null;
			return;
		}
		if (!(formatid in this._sampleSetPromises)) {
			this._sampleSetPromises[formatid] = Net(
				`https://${Config.routes.client}/data/sets/${formatid}.json`
			).get().then(json => {
				const data = JSON.parse(json);
				TeamEditorState.sampleSets[formatid] = data;
				this.update();
			}).catch(() => {
				TeamEditorState.sampleSets[formatid] = null;
			});
		}
	}
	/** returns null if sample sets aren't done loading */
	getSampleSets(set: Dex.PokemonSet): string[] | null {
		const d = TeamEditorState.sampleSets[this.format];
		if (d === undefined) {
			this.fetchSampleSets(this.format);
			return null;
		}
		if (!d?.dex) return [];
		const speciesid = toID(set.species);
		const all = {
			...d.dex[set.species],
			...d.dex[speciesid],
			...d.stats?.[set.species],
			...d.stats?.[speciesid],
		};
		return Object.keys(all);
	}
	/** returns null if no boxes exist, empty array if no sets for this species */
	getUserSets(set: Dex.PokemonSet): { [setName: string]: Dex.PokemonSet } | null {
		if (!this.userSetsCache[this.format]) {
			const userSets: { [species: string]: { [setName: string]: Dex.PokemonSet } } = {};

			for (const team of window.PS?.teams.list || []) {
				if (team.format !== this.format || !team.isBox) continue;

				const setList = Teams.unpack(team.packedTeam);
				const duplicateNameIndices: Record<string, number> = {};

				for (const boxSet of setList) {
					let name = boxSet.name || boxSet.species;
					if (duplicateNameIndices[name]) {
						name += ` ${duplicateNameIndices[name]}`;
					}
					duplicateNameIndices[name] = (duplicateNameIndices[name] || 0) + 1;

					userSets[boxSet.species] ??= {};
					userSets[boxSet.species][name] = boxSet;
				}
			}

			this.userSetsCache[this.format] = userSets;
		}

		const cachedSets = this.userSetsCache[this.format];
		if (Object.keys(cachedSets).length === 0) return null;
		return cachedSets[set.species] || {};
	}
	loadSampleSet(setIndex: number, setName: string) {
		if (this.readonly) return false;
		const set = this.sets[setIndex];
		if (!set?.species) return false;

		const data = TeamEditorState.sampleSets?.[this.format];
		const sid = toID(set.species);
		const setTemplate = data?.dex?.[set.species]?.[setName] ?? data?.dex?.[sid]?.[setName] ??
			data?.stats?.[set.species]?.[setName] ?? data?.stats?.[sid]?.[setName];
		if (!setTemplate) return false;

		const applied: Partial<Dex.PokemonSet> = JSON.parse(JSON.stringify(setTemplate));
		Object.assign(set, applied);

		this.save();
		return true;
	}
	loadUserSet(setIndex: number, setName: string) {
		if (this.readonly) return false;
		const set = this.sets[setIndex];
		if (!set?.species) return false;

		const userSets = this.getUserSets(set);
		const setTemplate = userSets?.[setName];
		if (!setTemplate) return false;

		const applied: Partial<Dex.PokemonSet> = JSON.parse(JSON.stringify(setTemplate));
		delete applied.name;
		Object.assign(set, applied);

		this.save();
		return true;
	}

	static renderClipboard(cancelClipboard: () => void) {
		if (!TeamEditorState.clipboard) return null;

		const renderSet = (set: Dex.PokemonSet) => <div class="set">
			<small>
				<PSIcon pokemon={set} /> {set.name || set.species}
				{set.ability && ` [${set.ability}]`}{set.item && ` @ ${set.item}`}
				{} - {set.moves.join(' / ') || '(No moves)'}
			</small>
		</div>;
		const renderTeam = (team: Team, sets: Dex.PokemonSet[]) => <div class="set"><small>
			<strong>{team.name}</strong><br />
			{sets.map(set => <PSIcon pokemon={set} />)}
		</small></div>;

		return <div class="infobox">
			Clipboard
			{Object.values(TeamEditorState.clipboard.teams || {})?.map(clipboardTeam => (
				clipboardTeam.entire ? (
					renderTeam(clipboardTeam.team, Object.values(clipboardTeam.sets))
				) : (
					Object.values(clipboardTeam.sets).map(set => renderSet(set))
				)
			))}
			{TeamEditorState.clipboard.otherSets?.map(set => renderSet(set))}
			<button class="button" onClick={cancelClipboard}>
				<i class="fa fa-times" aria-hidden></i> Cancel
			</button>
		</div>;
	}
}

export class TeamEditor extends preact.Component<{
	team: Team, narrow?: boolean, onChange?: () => void, readOnly?: boolean,
	children?: preact.ComponentChildren, resources?: preact.ComponentChildren,
	editorRef?: (editor: TeamEditorState) => void,
}> {
	mode: TeamEditorMode = 'form';
	editor!: TeamEditorState;
	setTab = (ev: Event) => {
		const target = ev.currentTarget as HTMLButtonElement;
		this.mode = target.value as TeamEditorMode;
		this.forceUpdate();
	};
	static probablyMobile() {
		return window.innerWidth < 500;
	}
	renderDefensiveCoverage() {
		const { editor } = this;
		if (editor.team.isBox) return null;
		if (!editor.sets.length) return null;

		const counters = Object.values(editor.teamDefensiveCoverage());
		PSUtils.sortBy(counters, counter => [counter.resists, -counter.weaknesses]);
		const good = [], medium = [], bad = [];
		const renderTypeDefensive = (counter: typeof counters[number]) => (
			<tr>
				<th>{counter.type}</th>
				<td>{counter.resists} <small class="gray">resist</small></td>
				<td>{counter.weaknesses} <small class="gray">weak</small></td>
			</tr>
		);
		for (const counter of counters) {
			if (counter.resists > 0) {
				good.push(renderTypeDefensive(counter));
			} else if (counter.weaknesses <= 0) {
				medium.push(renderTypeDefensive(counter));
			} else {
				bad.push(renderTypeDefensive(counter));
			}
		}
		return <details class="details">
			<summary>
				<strong>Defensive coverage</strong>
				<table class="details-preview table">
					{bad}
					<tr><td colSpan={3}><span class="details-preview ilink"><small>See all</small></span></td></tr>
				</table>
			</summary>
			<table class="table">{bad}{medium}{good}</table>
		</details>;
	}
	cancelClipboard = () => {
		TeamEditorState.clipboard = null;
		this.forceUpdate();
	};
	update = () => {
		this.forceUpdate();
	};
	override render() {
		if (!this.editor) {
			this.editor = new TeamEditorState(this.props.team);
			this.editor.subscribe(() => {
				this.forceUpdate();
			});
			this.props.editorRef?.(this.editor);
		}
		const editor = this.editor;
		window.editor = editor; // debug
		editor.updateTeam(!!this.props.readOnly);
		editor.narrow = this.props.narrow ?? window.innerWidth < 500;
		if (this.props.team.format !== editor.format) {
			editor.setFormat(this.props.team.format);
		}

		return <div class="teameditor">
			<ul class="tabbar">
				<li><button onClick={this.setTab} value="form" class={`button${this.mode === 'form' ? ' cur' : ''}`}>
					Form
				</button></li>
				<li><button onClick={this.setTab} value="import" class={`button${this.mode === 'import' ? ' cur' : ''}`}>
					Import/Export
				</button></li>
			</ul>
			{TeamEditorState.renderClipboard(this.cancelClipboard)}
			{this.mode === 'form' ? (
				<TeamEditorForm editor={editor} onChange={this.props.onChange} onUpdate={this.update} />
			) : (
				<TeamTextbox editor={editor} onChange={this.props.onChange} onUpdate={this.update} />
			)}
			{!this.editor.innerFocus && <>
				{this.props.children}
				<div class="team-resources">
					<br /><hr /><br />
					{this.renderDefensiveCoverage()}
					{this.props.resources}
				</div>
			</>}
		</div>;
	}
}

class TeamTextbox extends preact.Component<{
	editor: TeamEditorState,
	onChange?: () => void, onUpdate?: () => void,
}> {
	override state = {
		copyButtonUsed: undefined as number | undefined,
	};
	static EMPTY_PROMISE = Promise.resolve(null);
	editor!: TeamEditorState;
	setInfo: {
		species: string,
		bottomY: number,
		index: number,
	}[] = [];
	textbox: HTMLTextAreaElement = null!;
	heightTester: HTMLTextAreaElement = null!;
	/** we changed the set but are delaying updates until the selection form is closed */
	setDirty = false;
	selection: {
		setIndex: number,
		type: InnerFocusType | null,
		typeIndex: number,
		lineRange: [number, number] | null,
	} | null = null;
	innerFocus: {
		offsetY: number | null,
		setIndex: number,
		type: InnerFocusType,
		/** i.e. which move is this */
		typeIndex: number,
		range: [number, number],
		/** if you edit, you'll change the range end, so it needs to be updated with this in mind */
		rangeEndChar: string,
	} | null = null;
	getYAt(index: number, fullLine?: boolean) {
		if (index < 0) return 10;
		if (index === 0) return 31;
		const newValue = this.textbox.value.slice(0, index);
		this.heightTester.value = fullLine && !newValue.endsWith('\n') ? newValue + '\n' : newValue;
		return this.heightTester.scrollHeight;
	}
	input = () => {
		this.updateText();
		this.save();
	};
	keyUp = () => this.updateText(true);
	contextMenu = (ev: MouseEvent) => {
		if (!ev.shiftKey) {
			const hadInnerFocus = this.innerFocus?.range[1];
			this.openInnerFocus();
			if (hadInnerFocus !== this.innerFocus?.range[1]) {
				ev.preventDefault();
				ev.stopImmediatePropagation();
			}
		}
	};
	openInnerFocus() {
		const oldRange = this.selection?.lineRange;
		this.updateText(true, true);
		if (this.selection) {
			// this shouldn't actually update anything, so the reference comparison is enough
			if (this.selection.lineRange === oldRange) return !!this.innerFocus;
			if (this.textbox.selectionStart === this.textbox.selectionEnd) {
				const range = this.getSelectionTypeRange();
				if (range) this.textbox.setSelectionRange(range[0], range[1]);
			}
		}
		return !!this.innerFocus;
	}
	keyDown = (ev: KeyboardEvent) => {
		const editor = this.editor;
		switch (ev.keyCode) {
		case 27: // escape
		case 8: // backspace
			if (this.innerFocus) {
				const atStart = (this.innerFocus.range[0] === this.textbox.selectionStart &&
					this.innerFocus.range[0] === this.textbox.selectionEnd);
				if (ev.keyCode === 27 || atStart) {
					if (editor.search.removeFilter()) {
						editor.setSearchValue(this.getInnerFocusValue());
						this.resetScroll();
						this.forceUpdate();
						ev.stopImmediatePropagation();
						ev.preventDefault();
					} else if (this.closeMenu()) {
						ev.stopImmediatePropagation();
						ev.preventDefault();
					}
				}
			}
			break;
		case 38: // up
			if (this.innerFocus) {
				editor.search.moveSelection(-1);
				ev.preventDefault();
			}
			break;
		case 40: // down
			if (this.innerFocus) {
				editor.search.moveSelection(1);
				ev.preventDefault();
			}
			break;
		case 9: // tab
		case 13: // enter
			if (ev.keyCode === 13 && ev.shiftKey) return;
			if (ev.altKey || ev.metaKey) return;
			if (!this.innerFocus) {
				if (this.maybeReplaceLine()) {
					// do nothing else
				} else if (
					this.textbox.selectionStart === this.textbox.value.length &&
					(this.textbox.value.endsWith('\n\n') || !this.textbox.value)
				) {
					this.addPokemon();
				} else if (!this.openInnerFocus()) {
					break;
				}
				ev.stopImmediatePropagation();
				ev.preventDefault();
			} else {
				const result = editor.search.selectResult();
				if (result !== null) {
					const [name, moveSlot] = editor.search.getResultName(result).split('|');
					this.selectResult(this.innerFocus.type, name, moveSlot);
				} else {
					this.replaceNoFocus('', this.innerFocus.range[0], this.innerFocus.range[1]);
					editor.setSearchValue('');
					this.forceUpdate();
				}
				this.resetScroll();
				ev.stopImmediatePropagation();
				ev.preventDefault();
			}
			break;
		case 80: // p
			if (ev.metaKey) {
				window.PS?.alert(editor.export());
				ev.stopImmediatePropagation();
				ev.preventDefault();
				break;
			}
		}
	};
	maybeReplaceLine = () => {
		if (this.textbox.selectionStart !== this.textbox.selectionEnd) return;
		const current = this.textbox.selectionEnd;
		const lineStart = this.textbox.value.lastIndexOf('\n', current) + 1;
		const value = this.textbox.value.slice(lineStart, current);

		const pokepaste = /^https?:\/\/pokepast.es\/([a-z0-9]+)(?:\/.*)?$/.exec(value)?.[1];
		if (pokepaste) {
			this.editor.fetching = true;
			Net(`https://pokepast.es/${pokepaste}/json`).get().then(json => {
				const paste = JSON.parse(json);
				const pasteTxt = paste.paste.replace(/\r\n/g, '\n');
				if (this.textbox) {
					// make sure it's still there:
					const valueIndex = this.textbox.value.indexOf(value);
					this.replace(paste.paste.replace(/\r\n/g, '\n'), valueIndex, valueIndex + value.length);
				} else {
					this.editor.import(pasteTxt);
					this.props.onChange?.();
				}
				const notes = paste["notes"] as string;
				if (notes.startsWith("Format: ")) {
					const formatid = toID(notes.slice(8));
					this.editor.setFormat(formatid);
				}
				const title = paste["title"] as string;
				if (title && !title.startsWith('Untitled')) {
					this.editor.team.name = title.replace(/[|\\/]/g, '');
				}
				this.editor.fetching = false;
				this.props.onUpdate?.();
			});
			return true;
		}
		return false;
	};
	getInnerFocusValue() {
		if (!this.innerFocus) return '';
		return this.textbox.value.slice(this.innerFocus.range[0], this.innerFocus.range[1]);
	}
	clearInnerFocus() {
		if (this.innerFocus) {
			if (this.innerFocus.type === 'pokemon') {
				const value = this.getInnerFocusValue();
				if (!toID(value)) {
					this.replaceNoFocus(this.editor.originalSpecies || '', this.innerFocus.range[0], this.innerFocus.range[1]);
				}
			}
			this.innerFocus = null;
		}
	}
	closeMenu = () => {
		if (this.innerFocus) {
			this.clearInnerFocus();
			if (this.setDirty) {
				this.updateText();
				this.save();
			} else {
				this.forceUpdate();
			}
			PSView.politeFocus(this.textbox);
			return true;
		}
		return false;
	};
	updateText = (noTextChange?: boolean, autoSelect?: boolean | InnerFocusType) => {
		const textbox = this.textbox;
		let value = textbox.value;
		let selectionStart = textbox.selectionStart || 0;
		let selectionEnd = textbox.selectionEnd || 0;

		if (this.innerFocus) {
			if (!noTextChange) {
				let lineEnd = this.textbox.value.indexOf('\n', this.innerFocus.range[0]);
				if (lineEnd < 0) lineEnd = this.textbox.value.length;
				const line = this.textbox.value.slice(this.innerFocus.range[0], lineEnd);
				if (this.innerFocus.rangeEndChar) {
					const index = line.indexOf(this.innerFocus.rangeEndChar);
					if (index >= 0) lineEnd = this.innerFocus.range[0] + index;
				}
				this.innerFocus.range[1] = lineEnd;
			}
			const [start, end] = this.innerFocus.range;
			if (selectionStart >= start && selectionStart <= end && selectionEnd >= start && selectionEnd <= end) {
				if (!noTextChange) {
					this.updateSearch();
					this.setDirty = true;
				}
				return;
			}
			this.clearInnerFocus();
			value = textbox.value;
			selectionStart = textbox.selectionStart || 0;
			selectionEnd = textbox.selectionEnd || 0;
		}

		if (this.setDirty) {
			this.setDirty = false;
			noTextChange = false;
		}

		this.heightTester.style.width = `${textbox.offsetWidth}px`;
		/** index of `value` that we've parsed to */
		let index = 0;
		/** for the set we're currently parsing */
		let setIndex: number | null = null;
		let moveIndex = 0;
		let nextSetIndex = 0;
		if (!noTextChange) this.setInfo = [];
		this.selection = null;

		while (index < value.length) {
			let nlIndex = value.indexOf('\n', index);
			if (nlIndex < 0) nlIndex = value.length;
			const line = value.slice(index, nlIndex);

			if (!line.trim()) {
				setIndex = null;
				moveIndex = 0;
				index = nlIndex + 1;
				continue;
			}

			if (setIndex === null && index && !noTextChange && this.setInfo.length) {
				this.setInfo[this.setInfo.length - 1].bottomY = this.getYAt(index - 1);
			}

			if (setIndex === null) {
				if (!noTextChange) {
					const atIndex = line.indexOf('@');
					let species = atIndex >= 0 ? line.slice(0, atIndex).trim() : line.trim();
					if (species.endsWith(' (M)') || species.endsWith(' (F)')) {
						species = species.slice(0, -4);
					}
					if (species.endsWith(')')) {
						const parenIndex = species.lastIndexOf(' (');
						if (parenIndex >= 0) {
							species = species.slice(parenIndex + 2, -1);
						}
					}
					this.setInfo.push({
						species,
						bottomY: -1,
						index,
					});
				}
				setIndex = nextSetIndex;
				moveIndex = 0;
				nextSetIndex++;
			}

			const selectionEndCutoff = (selectionStart === selectionEnd ? nlIndex : nlIndex + 1);
			let start = index, end = index + line.length;
			if (index <= selectionStart && selectionEnd <= selectionEndCutoff) {
				// both ends within range
				let type: InnerFocusType | null = null;
				const lcLine = line.toLowerCase().trim();

				let typeIndex = -1;
				if (lcLine.startsWith('ability:')) {
					type = 'ability';
				} else if (lcLine.startsWith('-')) {
					type = 'move';
					typeIndex = moveIndex;
				} else if (
					!lcLine || lcLine.startsWith('level:') || lcLine.startsWith('gender:') ||
					(lcLine + ':').startsWith('shiny:') || (lcLine + ':').startsWith('gigantamax:') ||
					lcLine.startsWith('tera type:') || lcLine.startsWith('dynamax level:')
				) {
					type = 'details';
				} else if (
					lcLine.startsWith('ivs:') || lcLine.startsWith('evs:') ||
					lcLine.endsWith(' nature')
				) {
					type = 'stats';
				} else {
					type = 'pokemon';
					const atIndex = line.indexOf('@');
					if (atIndex >= 0) {
						if (selectionStart > index + atIndex) {
							type = 'item';
							start = index + atIndex + 1;
						} else {
							end = index + atIndex;
							if (line.charAt(atIndex - 1) === ']' || line.charAt(atIndex - 2) === ']') {
								type = 'ability';
							}
						}
					}
				}

				if (typeof autoSelect === 'string') autoSelect = autoSelect === type;
				this.selection = {
					setIndex, type, lineRange: [start, end], typeIndex,
				};
				if (autoSelect) this.engageFocus();
			}

			if (line.trim().startsWith('-')) moveIndex++;
			index = nlIndex + 1;
		}
		if (!noTextChange) {
			const end = value.endsWith('\n\n') ? value.length - 1 : value.length;
			const bottomY = this.getYAt(end, true);
			if (this.setInfo.length) {
				this.setInfo[this.setInfo.length - 1].bottomY = bottomY;
			}

			textbox.style.height = `${bottomY + 100}px`;
		}
		this.forceUpdate();
	};
	engageFocus(focus?: this['innerFocus']) {
		if (this.innerFocus && !focus) return;
		const editor = this.editor;
		if (editor.readonly) return;

		if (!focus) {
			if (!this.selection?.type) return;

			const range = this.getSelectionTypeRange();
			if (!range) return;
			const { type, setIndex } = this.selection;

			let rangeEndChar = this.textbox.value.charAt(range[1]);
			if (rangeEndChar === ' ') rangeEndChar += this.textbox.value.charAt(range[1] + 1);
			focus = {
				offsetY: this.getYAt(range[0]),
				setIndex,
				type,
				typeIndex: this.selection.typeIndex,
				range,
				rangeEndChar,
			};
		}
		this.innerFocus = focus;

		if (focus.type === 'details' || focus.type === 'stats' || focus.type === 'import') {
			this.forceUpdate();
			return;
		}

		const value = this.textbox.value.slice(focus.range[0], focus.range[1]);
		editor.setSearchType(focus.type, focus.setIndex, value, focus.typeIndex);
		this.resetScroll();
		this.textbox.setSelectionRange(focus.range[0], focus.range[1]);
		this.forceUpdate();
	}
	updateSearch() {
		if (!this.innerFocus) return;
		const { range } = this.innerFocus;
		const editor = this.editor;
		const value = this.textbox.value.slice(range[0], range[1]);

		editor.setSearchValue(value);
		this.resetScroll();
		this.forceUpdate();
	}
	selectResult = (type: string | null, name: string, moveSlot?: string) => {
		if (type === null) {
			this.resetScroll();
			this.forceUpdate();
		} else if (!type) {
			this.changeSet(this.innerFocus!.type, '');
		} else {
			this.changeSet(type as InnerFocusType, name, moveSlot);
		}
	};
	getSelectionTypeRange(): [number, number] | null {
		const selection = this.selection;
		if (!selection?.lineRange) return null;

		let [start, end] = selection.lineRange;
		let lcLine = this.textbox.value.slice(start, end).toLowerCase();
		if (lcLine.endsWith('  ')) {
			end -= 2;
			lcLine = lcLine.slice(0, -2);
		}

		switch (selection.type) {
		case 'pokemon': {
			// let atIndex = lcLine.lastIndexOf('@');
			// if (atIndex >= 0) {
			// 	if (lcLine.charAt(atIndex - 1) === ' ') atIndex--;
			// 	lcLine = lcLine.slice(0, atIndex);
			// 	end = start + atIndex;
			// }

			if (lcLine.endsWith(' ')) {
				lcLine = lcLine.slice(0, -1);
				end--;
			}

			if (lcLine.endsWith(' (m)') || lcLine.endsWith(' (f)')) {
				lcLine = lcLine.slice(0, -4);
				end -= 4;
			}

			if (lcLine.endsWith(')')) {
				const parenIndex = lcLine.lastIndexOf(' (');
				if (parenIndex >= 0) {
					start = start + parenIndex + 2;
					end--;
				}
			}

			return [start, end];
		}
		case 'item': {
			// let atIndex = lcLine.lastIndexOf('@');
			// if (atIndex < 0) return null;

			// if (lcLine.charAt(atIndex + 1) === ' ') atIndex++;
			// return { start: start + atIndex + 1, end };
			if (lcLine.startsWith(' ')) start++;
			return [start, end];
		}
		case 'ability': {
			if (lcLine.startsWith('[')) {
				start++;
				if (lcLine.endsWith(' ')) {
					end--;
					lcLine = lcLine.slice(0, -1);
				}
				if (lcLine.endsWith(']')) {
					end--;
				}
				return [start, end];
			}
			if (!lcLine.startsWith('ability:')) return null;
			start += lcLine.startsWith('ability: ') ? 9 : 8;
			return [start, end];
		}
		case 'move': {
			if (!lcLine.startsWith('-')) return null;
			start += lcLine.startsWith('- ') ? 2 : 1;
			return [start, end];
		}
		}
		return [start, end];
	}
	changeSet(type: InnerFocusType, name: string, moveSlot?: string) {
		const focus = this.innerFocus;
		if (!focus) return;

		if (type === focus.type && type !== 'pokemon') {
			this.replace(name, focus.range[0], focus.range[1]);
			this.updateText(false, true);
			return;
		}

		switch (type) {
		case 'pokemon': {
			const set = this.editor.sets[focus.setIndex] ||= {
				species: '',
				moves: [],
			};
			this.editor.changeSpecies(set, name);
			this.replaceSet(focus.setIndex);
			this.updateText(false, true);
			break;
		}
		case 'ability': {
			this.editor.sets[focus.setIndex].ability = name;
			this.replaceSet(focus.setIndex);
			this.updateText(false, true);
			break;
		}
		}
	}
	getSetRange(index: number) {
		if (!this.setInfo[index]) {
			if (this.innerFocus?.setIndex === index) {
				return this.innerFocus.range;
			}
			return [this.textbox.value.length, this.textbox.value.length];
		}
		const start = this.setInfo[index].index;
		const end = this.setInfo[index + 1].index;
		return [start, end];
	}
	replaceSet(index: number) {
		const editor = this.editor;
		const { team } = editor;
		if (!team) return;

		let newText = Teams.exportSet(editor.sets[index], editor.dex);
		const [start, end] = this.getSetRange(index);
		if (start && start === this.textbox.value.length && !this.textbox.value.endsWith('\n\n')) {
			newText = (this.textbox.value.endsWith('\n') ? '\n' : '\n\n') + newText;
		}
		this.replaceNoFocus(newText, start, end, start + newText.length);
		// we won't do a full update but we do need to update where the end is,
		// for future updates
		if (!this.setInfo[index]) {
			this.updateText();
			this.save();
		} else {
			if (this.setInfo[index + 1]) {
				this.setInfo[index + 1].index = start + newText.length;
			}
			// others don't need to be updated;
			// we'll do a full update next time we focus the textbox
			this.setDirty = true;
		}
	}
	replace(text: string, start: number, end: number, selectionStart = start, selectionEnd = start + text.length) {
		const textbox = this.textbox;
		// const value = textbox.value;
		// textbox.value = value.slice(0, start) + text + value.slice(end);
		PSView.politeFocus(textbox);
		textbox.setSelectionRange(start, end);
		document.execCommand('insertText', false, text);
		// textbox.setSelectionRange(selectionStart, selectionEnd);
		this.save();
	}
	replaceNoFocus(text: string, start: number, end: number, selectionStart = start, selectionEnd = start + text.length) {
		const textbox = this.textbox;
		const value = textbox.value;
		textbox.value = value.slice(0, start) + text + value.slice(end);
		textbox.setSelectionRange(selectionStart, selectionEnd);
		this.save();
	}
	save() {
		this.editor.import(this.textbox.value);
		this.props.onChange?.();
	}
	override componentDidMount() {
		this.textbox = this.base!.getElementsByClassName('teamtextbox')[0] as HTMLTextAreaElement;
		this.heightTester = this.base!.getElementsByClassName('heighttester')[0] as HTMLTextAreaElement;

		this.editor = this.props.editor;
		const exportedTeam = this.editor.export(true);
		this.textbox.value = exportedTeam;
		this.updateText();
		setTimeout(() => this.updateText());
	}
	override componentWillUnmount() {
		this.textbox = null!;
		this.heightTester = null!;
	}
	clickDetails = (ev: Event) => {
		const target = ev.currentTarget as HTMLButtonElement;
		const i = parseInt(target.value || '0');
		if (this.innerFocus?.type === target.name) {
			this.innerFocus = null;
			this.forceUpdate();
			return;
		}
		this.engageFocus({
			offsetY: null,
			setIndex: i,
			type: target.name as InnerFocusType,
			typeIndex: -1,
			range: [0, 0],
			rangeEndChar: '',
		});
	};
	addPokemon = () => {
		if (this.textbox.value && !this.textbox.value.endsWith('\n\n')) {
			this.textbox.value += this.textbox.value.endsWith('\n') ? '\n' : '\n\n';
		}
		const end = this.textbox.value === '\n\n' ? 0 : this.textbox.value.length;
		this.textbox.setSelectionRange(end, end);
		PSView.politeFocus(this.textbox);
		this.engageFocus({
			offsetY: this.getYAt(end, true),
			setIndex: this.setInfo.length,
			type: 'pokemon',
			typeIndex: -1,
			range: [end, end],
			rangeEndChar: '@',
		});
	};
	resetScroll() {
		const searchResults = this.base!.querySelector('.searchresults');
		if (searchResults) searchResults.scrollTop = 0;
	}

	renderDetails(set: Dex.PokemonSet, i: number) {
		const editor = this.editor;
		const species = editor.dex.species.get(set.species);

		const GenderChart = {
			'M': 'Male',
			'F': 'Female',
			'N': '\u2014', // em dash
		};
		const gender = GenderChart[(set.gender || species.gender || 'N') as 'N'];

		return <button class="textbox setdetails" name="details" value={i} onClick={this.clickDetails}>
			<span class="detailcell">
				<label>Level</label>{set.level || editor.defaultLevel}
			</span>
			<span class="detailcell">
				<label>Shiny</label>{set.shiny ? 'Yes' : '\u2014'}
			</span>
			{editor.gen === 9 && !editor.isChampions ? (
				<span class="detailcell">
					<label>Tera</label><PSIcon type={set.teraType || species.requiredTeraType || species.types[0]} />
				</span>
			) : editor.hpTypeMatters(set) ? (
				<span class="detailcell">
					<label>H. Power</label><PSIcon type={editor.getHPType(set)} />
				</span>
			) : (
				<span class="detailcell">
					<label>Gender</label>{gender}
				</span>
			)}
		</button>;
	}

	renderStats(set: Dex.PokemonSet, i: number) {
		const editor = this.editor;

		// stat cell
		return <button class="textbox setstats" name="stats" value={i} onClick={this.clickDetails}>
			{StatForm.renderStatGraph(set, editor)}
		</button>;
	}
	handleSetChange = () => {
		if (this.selection) {
			this.replaceSet(this.selection.setIndex);
			this.forceUpdate();
		}
	};
	bottomY() {
		return this.setInfo[this.setInfo.length - 1]?.bottomY ?? 8;
	}
	copyAll = (ev: Event) => {
		this.textbox.select();
		document.execCommand('copy');
		clearTimeout(this.state.copyButtonUsed);
		this.setState({
			copyButtonUsed: setTimeout(() => this.setState({ copyButtonUsed: undefined }), 3000),
		});
	};
	render() {
		const editor = this.props.editor;
		const statsDetailsOffset = editor.gen >= 3 ? 18 : -1;
		const resultsCSS = this.innerFocus && (
			`top:${(this.setInfo[this.innerFocus.setIndex]?.bottomY ?? this.bottomY() + 50) - 12}px`
		);
		return <div>
			<p>
				<button class={`button ${this.state.copyButtonUsed ? 'cur' : ''}`} onClick={this.copyAll}>
					{this.state.copyButtonUsed ? (
						<><i class="fa fa-check" aria-hidden></i> Copied!</>
					) : (
						<><i class="fa fa-copy" aria-hidden></i> Copy</>
					)}
				</button>
			</p>
			<div class="teameditor-text">
				<textarea
					class="textbox teamtextbox" style={`padding-left:${editor.narrow ? '50px' : '100px'}`}
					onInput={this.input} onContextMenu={this.contextMenu} onKeyUp={this.keyUp} onKeyDown={this.keyDown}
					onClick={this.keyUp} onChange={this.maybeReplaceLine}
					placeholder=" Paste exported teams, pokepaste URLs, or JSON here" readOnly={editor.readonly}
				/>
				<textarea
					class="textbox teamtextbox heighttester" tabIndex={-1} aria-hidden
					style={`padding-left:${editor.narrow ? '50px' : '100px'};visibility:hidden;left:-15px`}
				/>
				<div class="teamoverlays">
					{this.setInfo.slice(0, -1).map(info =>
						<hr style={`top:${info.bottomY - 18}px;pointer-events:none`} />
					)}
					{editor.canAdd() && !!this.setInfo.length && <hr style={`top:${this.bottomY() - 18}px`} />}
					{this.setInfo.map((info, i) => {
						if (!info.species) return null;
						const set = editor.sets[i];
						if (!set) return null;
						const prevOffset = i === 0 ? 8 : this.setInfo[i - 1].bottomY;
						const species = editor.dex.species.get(info.species);
						const num = Dex.getPokemonIconNum(species.id);
						if (!num) return null;

						if (editor.narrow) {
							return <div style={`top:${prevOffset + 1}px;left:5px;position:absolute;text-align:center;pointer-events:none`}>
								<div><PSIcon pokemon={species.id} /></div>
								{species.types.map(type => <div><PSIcon type={type} /></div>)}
								<div><PSIcon item={set.item || null} /></div>
							</div>;
						}
						const spriteData = Dex.getTeambuilderSpriteData(set, editor.dex);
						return [<div
							class={spriteData.pixelated ? 'pixelated' : ''}
							style={
								`top:${prevOffset - 7}px;left:0;position:absolute;text-align:right;` +
								`width:94px;padding:103px 5px 0 0;min-height:24px;pointer-events:none;` +
								Dex.getTeambuilderSprite(set, editor.dex)
							}
						>
							<div>{species.types.map(type => <PSIcon type={type} />)}<PSIcon item={set.item || null} /></div>
						</div>, <div style={`top:${prevOffset + statsDetailsOffset}px;right:9px;position:absolute`}>
							{this.renderStats(set, i)}
						</div>, <div style={`top:${prevOffset + statsDetailsOffset}px;right:145px;position:absolute`}>
							{this.renderDetails(set, i)}
						</div>];
					})}
					{editor.canAdd() && !(this.innerFocus && this.innerFocus.setIndex >= this.setInfo.length) && (
						<div style={`top:${this.bottomY() - 3}px;left:${editor.narrow ? 55 : 105}px;position:absolute`}>
							<button class="button" onClick={this.addPokemon}>
								<i class="fa fa-plus" aria-hidden></i> Add Pok&eacute;mon
							</button>
						</div>
					)}
					{this.innerFocus?.offsetY != null && (
						<div
							class={`teaminnertextbox teaminnertextbox-${this.innerFocus.type}`}
							style={`top:${this.innerFocus.offsetY - 21}px;left:${editor.narrow ? 46 : 96}px;`}
						></div>
					)}
				</div>
				{this.innerFocus && (
					this.innerFocus.type === 'stats' ? (
						<div class="searchresults" style={resultsCSS}>
							<button class="button closesearch" onClick={this.closeMenu}>
								{!editor.narrow && <kbd>Esc</kbd>} <i class="fa fa-times" aria-hidden></i> Close
							</button>
							<StatForm editor={editor} set={this.editor.sets[this.innerFocus.setIndex]} onChange={this.handleSetChange} />
						</div>
					) : this.innerFocus.type === 'details' ? (
						<div class="searchresults" style={resultsCSS}>
							<button class="button closesearch" onClick={this.closeMenu}>
								{!editor.narrow && <kbd>Esc</kbd>} <i class="fa fa-times" aria-hidden></i> Close
							</button>
							<DetailsForm editor={editor} set={this.editor.sets[this.innerFocus.setIndex]} onChange={this.handleSetChange} />
						</div>
					) : (
						<PSSearchResults
							class="searchresults" style={resultsCSS}
							prepend={<button class="button closesearch" onClick={this.closeMenu}>
								{!editor.narrow && <kbd>Esc</kbd>} <i class="fa fa-times" aria-hidden></i> Close
							</button>}
							search={editor.search}
							onSelect={this.selectResult}
						/>
					)
				)}
			</div>
		</div>;
	}
}

class TeamEditorForm extends preact.Component<{
	editor: TeamEditorState, onChange?: () => void, onUpdate: () => void,
}> {
	focusAnimationStartLocation: {
		rect: { left: number, top: number },
	} | null = null;
	pendingSetScrollRestore: { index: number, top: number } | null = null;
	/** where to focus after next render */
	pendingFocus: TeamEditorState['innerFocus'] = null;
	pendingFocusValue: string | null = null;
	pendingFocusSelection: [number | null, number | null, 'forward' | 'backward' | 'none' | undefined] | null = null;
	/** whether to focus the details/stats button or their panel contents */
	pendingFocusButton = false;
	pendingFocusPolite = true;
	mouseDownTextbox: HTMLInputElement | null = null;
	startFocusAnimation(source: Element | null) {
		if (this.props.editor.innerFocus) return;
		const setButton = source?.closest('.set-form');
		if (!setButton) return;
		const rect = setButton.getBoundingClientRect();
		this.focusAnimationStartLocation = {
			rect: { left: rect.left, top: rect.top },
		};
	}
	finishFocusAnimation() {
		const start = this.focusAnimationStartLocation;
		if (!start) return;
		this.focusAnimationStartLocation = null;
		if (window.PS?.prefs.noanim || PSView.prefersReducedMotion()) return;
		const setButton = this.base!.querySelector<HTMLElement>('.team-focus-editor .set-form');
		if (!setButton) return;
		const rect = setButton.getBoundingClientRect();
		const dx = start.rect.left - rect.left;
		const dy = start.rect.top - rect.top;
		if (!dx && !dy) return;
		setButton.animate?.([
			{ transform: `translate(${dx}px, ${dy}px)` },
			{ transform: 'translate(0, 0)' },
		], {
			duration: 250,
			easing: 'cubic-bezier(.2, 0, .2, 1)',
		});
	}
	setFocus = (ev: Event) => {
		const { editor } = this.props;
		if (editor.readonly) return;
		const target = ev.currentTarget as HTMLButtonElement;
		if (!target.value || editor.stringifyFocus(editor.innerFocus) === target.value) {
			this.closeInnerFocus(ev);
			return;
		}
		const focus = editor.parseFocus(target.value) as InnerFocusState;
		this.startFocusAnimation(target);
		this.changeFocus(focus);
	};
	deleteSet = (ev: Event) => {
		const target = ev.currentTarget as HTMLButtonElement;
		const i = parseInt(target.value);
		const { editor } = this.props;
		editor.deleteSet(i);
		if (editor.innerFocus) {
			this.changeFocus({
				setIndex: editor.sets.length,
				type: 'pokemon',
				typeIndex: -1,
			});
		}
		this.handleSetChange();
		ev.preventDefault();
	};
	preserveSetScroll(index: number | undefined, elem: HTMLElement | null) {
		if (index === undefined || elem === null) return;
		this.pendingSetScrollRestore = {
			index,
			top: elem.getBoundingClientRect().top,
		};
	}
	restorePendingSetScroll() {
		if (!this.base) return;
		const restore = this.pendingSetScrollRestore;
		if (!restore) return;
		this.pendingSetScrollRestore = null;

		const setButton = this.base.querySelector<HTMLElement>(`.set-form[data-set-index="${restore.index}"]`);
		if (!setButton) return;
		const dy = setButton.getBoundingClientRect().top - restore.top;
		if (!dy) return;
		const scrollParent = this.getSetScrollParent(setButton);
		if (scrollParent) {
			scrollParent.scrollTop += dy;
		} else {
			window.scrollBy(0, dy);
		}
	}
	getSetScrollParent(elem: HTMLElement) {
		for (let parent = elem.parentElement; parent; parent = parent.parentElement) {
			const style = getComputedStyle(parent);
			if (!/(auto|scroll)/.test(style.overflowY)) continue;
			if (parent.scrollHeight <= parent.clientHeight) continue;
			return parent;
		}
		return null;
	}
	copySet = (ev: Event) => {
		const target = ev.currentTarget as HTMLButtonElement;
		const i = parseInt(target.value);
		const { editor } = this.props;
		this.preserveSetScroll(i, target.closest<HTMLElement>('.set-form'));
		editor.copySet(i);
		editor.innerFocus = null;
		this.props.onUpdate();
		window.PS?.update();
		ev.preventDefault();
	};
	undeleteSet = (ev: Event) => {
		const { editor } = this.props;
		const setIndex = editor.deletedSet?.index;
		editor.undeleteSet();
		if (editor.innerFocus && setIndex !== undefined) {
			this.changeFocus({
				setIndex,
				type: 'pokemon',
				typeIndex: -1,
			});
		}
		this.handleSetChange();
		ev.preventDefault();
	};
	pasteSet = (ev: Event) => {
		const target = ev.currentTarget as HTMLButtonElement;
		const i = parseInt(target.value);
		const { editor } = this.props;
		const insertIndex = editor.pasteSet(i);
		this.preserveSetScroll(insertIndex, target);
		this.handleSetChange();
		window.PS?.update();
		ev.preventDefault();
	};
	moveSet = (ev: Event) => {
		const target = ev.currentTarget as HTMLButtonElement;
		const i = parseInt(target.value);
		const { editor } = this.props;
		const insertIndex = editor.pasteSet(i, true);
		this.preserveSetScroll(insertIndex, target);
		this.handleSetChange();
		ev.preventDefault();
	};
	handleSetChange = () => {
		this.props.editor.save();
		this.props.onChange?.();
		this.forceUpdate();
	};
	selectMoveResult(name: string, slot?: string, reverse?: boolean) {
		const { editor } = this.props;
		const setIndex = editor.innerFocus!.setIndex;
		const set = (editor.sets[setIndex] ||= { species: '', moves: [] });
		if (slot) {
			// intentional; we're _removing_ from the slot
			const i = parseInt(slot) - 1;
			if (set.moves[i]) {
				set.moves[i] = '';
				// remove empty slots at the end
				if (i === set.moves.length - 1) {
					while (set.moves.length > 4 && !set.moves[set.moves.length - 1]) {
						set.moves.pop();
					}
				}
				// if we have more than 4 moves, move the last move into the newly-cleared slot
				if (set.moves.length > 4 && i < set.moves.length - 1) {
					set.moves[i] = set.moves.pop()!;
				}
			}
		} else if (set.moves.includes(name)) {
			set.moves.splice(set.moves.indexOf(name), 1);
		} else {
			for (let i = 0; i < set.moves.length + 1; i++) {
				if (!set.moves[i]) {
					set.moves[i] = name;
					break;
				}
			}
		}
		if (reverse) {
			this.changeFocus({
				setIndex,
				type: 'item',
				typeIndex: -1,
			});
		} else {
			if (editor.search.query) {
				this.resetScroll();
			}
			editor.updateSearchMoves(set);
		}
	}
	handleLoadSampleSet = (setName: string) => {
		const { editor } = this.props;
		if (!editor.innerFocus || !editor.loadSampleSet(editor.innerFocus.setIndex, setName)) return;
		this.props.onUpdate?.();
		this.forceUpdate();
	};
	handleLoadUserSet = (setName: string) => {
		const { editor } = this.props;
		if (!editor.innerFocus || !editor.loadUserSet(editor.innerFocus.setIndex, setName)) return;
		this.props.onUpdate?.();
		this.forceUpdate();
	};
	updateSearch = (ev: Event) => {
		const searchBox = ev.currentTarget as HTMLInputElement;
		this.props.editor.setSearchValue(searchBox.value);
		this.resetScroll();
		this.forceUpdate();
	};
	handleClickFilters = (ev: Event) => {
		const search = this.props.editor.search;
		let target = ev.target as HTMLElement | null;
		while (target && target.className !== 'dexlist') {
			if (target.tagName === 'BUTTON') {
				const filter = target.getAttribute('data-filter');
				if (filter) {
					search.removeFilter(filter.split(':') as any);
					const searchBox = this.base!.querySelector<HTMLInputElement>('input[name=value]');
					search.find(searchBox?.value || '');
					if (!TeamEditor.probablyMobile()) searchBox?.select();
					this.forceUpdate();
					ev.preventDefault();
					ev.stopPropagation();
					break;
				}
			}

			target = target.parentElement;
		}
	};
	resetScroll() {
		const searchResults = this.base!.querySelector('.set-searchresults');
		if (searchResults) searchResults.scrollTop = 0;
	}
	renderInnerFocus() {
		const { editor } = this.props;
		if (!editor.innerFocus) return null;
		const { type, setIndex } = editor.innerFocus;
		const set = this.props.editor.sets[setIndex] as Dex.PokemonSet | undefined;
		const cur = (i: number) => setIndex === i ? ' cur' : '';
		const isSearchMode = type !== 'stats' && type !== 'details' && type !== 'import';
		const SEARCH_PLACEHOLDERS = {
			'pokemon': 'Search species or filter by type, learnable moves, ability, or egg group',
			'ability': 'Search abilities',
			'item': 'Search items',
			'move': 'Search moves or filter by type or category',
		};
		return <div class="team-focus-editor" onKeyDown={editor.handleParentKeyDown}>
			<div class={isSearchMode && (set?.moves.length || 0) > 5 ? 'team-focus-top' : ''}>
				<ul class="tabbar">
					<li class="home-li"><button class="button" onClick={this.closeInnerFocus}>
						<i class="fa fa-chevron-left" aria-hidden></i> Back
					</button></li>
					{editor.sets.map((curSet, i) => <li><button
						class={`button picontab${cur(i)}`} onClick={this.setFocus}
						value={`set-${i}-${type}`}
					>
						<PSIcon pokemon={curSet} /><br />
						{editor.getNickname(curSet)}
					</button></li>)}
					{editor.canAdd() && <li><button
						class={`button picontab${cur(editor.sets.length)}`} name="addpokemon"
						onClick={this.setFocus}
						value={`set-${editor.sets.length}-pokemon`}
						aria-label="Add Pokemon"
					>
						<i class="fa fa-plus"></i>
					</button></li>}
				</ul>
				<div class="pad" style="padding-top:0">{this.renderSet(set, setIndex)}</div>
				{isSearchMode && <div class="searchboxwrapper pad" onClick={this.handleClickFilters}>
					<input
						type="search" name="value" class="textbox" placeholder={SEARCH_PLACEHOLDERS[type] || ''}
						onInput={this.updateSearch} onKeyDown={this.keyDownSearch} autocomplete="off"
					/>
					{PSSearchResults.renderFilters(editor.search)}
				</div>}
			</div>
			{type === 'stats' ? (
				<StatForm editor={editor} set={set!} onChange={this.handleSetChange} />
			) : type === 'details' ? (
				<DetailsForm editor={editor} set={set!} onChange={this.handleSetChange} />
			) : type === 'import' ? (
				<SetImportForm
					editor={editor} set={set} setIndex={setIndex}
					onChange={this.handleSetChange}
				/>
			) : (
				<PSSearchResults
					class="set-searchresults"
					search={editor.search} hideFilters
					onSelect={this.selectResult}
				>
					{type === 'ability' && <SetSourceButtons
						editor={editor} set={set}
						onLoadSampleSet={this.handleLoadSampleSet} onLoadUserSet={this.handleLoadUserSet}
					/>}
				</PSSearchResults>
			)}
		</div>;
	}
	override render() {
		const { editor } = this.props;
		if (editor.innerFocus) return this.renderInnerFocus();
		if (editor.fetching) {
			return <div class="teameditor">Fetching Paste...</div>;
		}

		const clipboard = TeamEditorState.clipboard;
		const willNotMove = (i: number) => (
			clipboard?.teams && !clipboard.otherSets && clipboard.teams[editor.team.key] &&
			Object.keys(clipboard.teams[editor.team.key]?.sets).length === 1 &&
			!!(clipboard.teams[editor.team.key]?.sets[i] || clipboard.teams[editor.team.key]?.sets[i - 1])
		);
		const pasteControls = (i: number) => editor.readonly ? (
			null
		) : clipboard ? <p>
			<button class="button notifying" onClick={this.pasteSet} value={i}>
				<i class="fa fa-clipboard" aria-hidden></i> Paste copy here
			</button> {}
			{!willNotMove(i) && <button class="button notifying" onClick={this.moveSet} value={i} disabled={clipboard.readonly}>
				<i class="fa fa-arrow-right" aria-hidden></i> Move here
			</button>}
		</p> : editor.deletedSet?.index === i ? <p style="text-align:right">
			<button class="button" onClick={this.undeleteSet}>
				<i class="fa fa-undo" aria-hidden></i> Undo delete
			</button>
		</p> : null;
		return <div class={`teameditor${editor.readonly ? ' readonly' : ''}`}>
			{editor.sets.map((set, i) => [
				pasteControls(i),
				this.renderSet(set, i),
			])}
			{pasteControls(editor.sets.length)}
			{editor.canAdd() && <p><button
				class="button big" name="addpokemon" onClick={this.setFocus}
				value={`set-${editor.sets.length}-pokemon`}
			>
				<i class="fa fa-plus" aria-hidden></i> Add Pok&eacute;mon
			</button></p>}
		</div>;
	}
	openFocusTextbox(target: HTMLInputElement) {
		const { editor } = this.props;
		if (editor.readonly) return;
		const focus = editor.parseFocus(target.getAttribute('data-focus')) as InnerFocusState;
		if (!focus) return;

		// Focusing after innerfocusing does trigger this listener.
		if (this.pendingFocus) return;

		this.pendingFocusValue = target.value;
		this.pendingFocusSelection = [
			target.selectionStart, target.selectionEnd, target.selectionDirection || undefined,
		];
		target.classList.remove('incomplete');
		this.startFocusAnimation(target);
		const refocusing = editor.stringifyFocus(editor.innerFocus) === editor.stringifyFocus(focus);
		this.changeFocus(focus, false, true, refocusing);
	}
	setFocusTextbox = (ev: FocusEvent) => {
		const target = ev.currentTarget as HTMLInputElement;
		if (this.mouseDownTextbox === target) return;
		this.openFocusTextbox(target);
	};
	mouseDownField = (ev: MouseEvent) => {
		if (ev.button !== 0) return;
		const target = ev.currentTarget as HTMLInputElement;
		if (document.activeElement === target) return;
		this.mouseDownTextbox = target;
		document.addEventListener('mouseup', this.mouseUpField, { once: true });
		PSView.politeFocus(target);
		target.select();
		ev.preventDefault();
	};
	mouseUpField = (ev: MouseEvent) => {
		const target = this.mouseDownTextbox;
		this.mouseDownTextbox = null;
		if (!target || ev.target !== target) return;
		this.openFocusTextbox(target);
	};
	changeFocus(
		focus: TeamEditorState['innerFocus'], focusButton = false, polite = true, preserveSearch = false
	) {
		const { editor } = this.props;
		editor.innerFocus = focus;
		this.pendingFocus = focus;
		this.pendingFocusButton = focusButton;
		this.pendingFocusPolite = polite;
		if (!focus) {
			this.props.onUpdate();
			return;
		}

		const set = editor.sets[focus.setIndex];
		if (!preserveSearch && focus.type !== 'details' && focus.type !== 'stats' && focus.type !== 'import') {
			let value = '';
			if (focus.type === 'pokemon') value = set?.species || '';
			else if (focus.type === 'item') value = set?.item || '';
			else if (focus.type === 'ability') value = set?.ability || '';
			else if (focus.type === 'move' && focus.typeIndex >= 0) value = set?.moves?.[focus.typeIndex] || '';
			editor.setSearchType(focus.type, focus.setIndex, value, focus.typeIndex);
			this.resetScroll();
		}
		this.props.onUpdate();
	}
	override componentDidMount(): void {
		this.props.editor.handleParentKeyDown = this.handleKeyDown;
	}
	override componentWillUnmount(): void {
		this.props.editor.handleParentKeyDown = undefined;
	}
	override componentDidUpdate() {
		this.finishFocusAnimation();
		const { editor } = this.props;
		const focus = this.pendingFocus;
		if (focus) {
			const focusValue = editor.stringifyFocus(focus);
			const input = this.base!.querySelector<HTMLInputElement | HTMLButtonElement>(
				(focus.type === 'details' || focus.type === 'stats' || focus.type === 'import') && this.pendingFocusButton ?
					`button[name="${focus.type}"][value="${focusValue}"]` :
					focus.type === 'details' ? `div[aria-label=Details] input:not([name=nickname]), div[aria-label=Details] select` :
					focus.type === 'stats' ? `div[aria-label=Stats] input` :
					focus.type === 'import' ? `div[aria-label="Import/Export"] textarea` :
					focus.type === 'move' && focus.typeIndex === -1 ? `input[name=value]` :
					`input.set-field[data-focus="${focusValue}"]`
			);
			if (input) {
				if (
					focus.type !== 'details' && focus.type !== 'stats' &&
					focus.type !== 'import' && !(focus.type === 'move' && focus.typeIndex === -1)
				) {
					input.value = this.pendingFocusValue ?? editor.getField(focus);
					input.classList.remove('incomplete');
				}
				PSView.politeFocus(input, this.pendingFocusPolite);
				if (this.pendingFocusSelection && input instanceof HTMLInputElement) {
					input.setSelectionRange?.(...this.pendingFocusSelection);
				} else {
					(input as HTMLInputElement).select?.();
				}
				this.pendingFocus = null;
				this.pendingFocusPolite = true;
				this.pendingFocusValue = null;
				this.pendingFocusSelection = null;
			}
		}
		const activeElement = document.activeElement;
		for (const input of this.base!.querySelectorAll<HTMLInputElement>('input.set-field')) {
			if (input === activeElement) continue;
			const curFocus = editor.parseFocus(input.getAttribute('data-focus')!);
			input.value = editor.getField(curFocus);
		}
		const searchBox = this.base!.querySelector<HTMLInputElement>('input[name=value]');
		const filters = this.base!.querySelector('.dexlist-filters');
		if (searchBox) {
			if (filters) {
				const { width } = filters.getBoundingClientRect();
				searchBox.style.paddingLeft = `${width + 5}px`;
			} else {
				searchBox.style.paddingLeft = `3px`;
			}
		}
		this.restorePendingSetScroll();
	}
	commitField(target: HTMLInputElement, selectNext?: boolean, reverse?: boolean) {
		const { editor } = this.props;
		const focus = editor.parseFocus(target.getAttribute('data-focus')!);
		if (!focus) return true;

		if (focus.type === 'nickname') {
			const set = editor.sets[focus.setIndex];
			if (!set) return true;
			const name = target.value.trim();
			if (name) {
				set.name = name;
			} else {
				delete set.name;
			}
			editor.save();
			this.props.onChange?.();
			this.forceUpdate();
			return true;
		}

		let canonical = editor.normalizeField(focus.type, target.value);
		if (canonical === null) {
			target.classList.add('incomplete');
			canonical = target.value;
		} else {
			target.classList.remove('incomplete');
		}

		if (focus.type === 'pokemon') {
			if (!canonical) return true;
			const set = (editor.sets[focus.setIndex] ||= { species: '', moves: [] });
			editor.changeSpecies(set, canonical);
			target.value = set.species;
		} else {
			const set = editor.sets[focus.setIndex];
			if (!set) return true;
			switch (focus.type) {
			case 'item':
				if (canonical) set.item = canonical;
				else delete set.item;
				target.value = canonical;
				break;
			case 'ability':
				if (canonical) set.ability = canonical;
				else delete set.ability;
				target.value = canonical;
				break;
			case 'move':
				if (focus.typeIndex >= set.moves.length && !canonical) return true;
				while (set.moves.length <= focus.typeIndex) set.moves.push('');
				set.moves[focus.typeIndex] = canonical;
				target.value = canonical;
				break;
			}
		}

		editor.save();
		this.props.onChange?.();
		this.forceUpdate();
		if (selectNext) this.focusAdjacentField(focus, !!reverse);
		return true;
	}
	inputField = (ev: Event) => {
		const target = ev.currentTarget as HTMLInputElement;
		target.classList.remove('incomplete');
		const type = target.name as InnerFocusType | 'nickname';
		if (type === 'nickname') {
			this.commitField(target);
			return;
		}
		let focus = this.props.editor.innerFocus;
		if (!focus) {
			this.openFocusTextbox(target);
			focus = this.pendingFocus;
		}
		if (focus?.type === 'move' && focus.typeIndex >= 0 && !target.value) {
			// blank out move
			this.props.editor.search.prependResults = [['move', `_${focus.typeIndex + 1}_` as ID]];
			this.props.editor.search.results = null;
		} else if (focus?.type === 'item' && !target.value) {
			// blank out item
			this.props.editor.search.prependResults = [['item', '' as ID]];
			this.props.editor.search.results = null;
		}
		this.props.editor.setSearchValue(target.value);
		this.resetScroll();
		this.forceUpdate();
	};
	blurField = (ev: Event) => {
		this.commitField(ev.currentTarget as HTMLInputElement);
	};
	getFocusedSetField() {
		const { editor } = this.props;
		const focus = editor.innerFocus;
		if (!focus || focus.type === 'details' || focus.type === 'stats' || focus.type === 'import') {
			return null;
		}
		if (focus.type === 'move' && focus.typeIndex === -1) return null;
		return this.base!.querySelector<HTMLInputElement>(
			`input.set-field[data-focus="${editor.stringifyFocus(focus)}"]`
		);
	}
	focusFocusedSetField() {
		const input = this.getFocusedSetField();
		if (!input) return false;
		const focus = this.props.editor.parseFocus(input.getAttribute('data-focus'));
		if (!focus) return false;
		input.value = this.props.editor.getField(focus);
		input.classList.remove('incomplete');
		input.focus();
		input.select();
		return true;
	}
	clearSearchFilters() {
		while (true) {
			if (!this.props.editor.search.removeFilter()) return;
		}
	}
	keyDownSearchInput(ev: KeyboardEvent, inSearchBox: boolean) {
		const { editor } = this.props;
		const input = ev.currentTarget as HTMLInputElement;
		switch (ev.keyCode) {
		case 8: // backspace
			if (input.selectionStart === 0 && input.selectionEnd === 0) {
				if (!editor.search.removeFilter() && inSearchBox && !input.value) {
					if (this.focusFocusedSetField()) ev.preventDefault();
					break;
				}
				editor.setSearchValue(input.value);
				this.resetScroll();
				this.forceUpdate();
			}
			break;
		case 27: // escape
			if (inSearchBox) {
				input.value = '';
				this.clearSearchFilters();
				editor.setSearchValue('');
				this.resetScroll();
				if (!this.focusFocusedSetField()) break;
				this.forceUpdate();
				ev.preventDefault();
				ev.stopImmediatePropagation();
			}
			break;
		case 38: // up
			editor.search.moveSelection(-1);
			ev.preventDefault();
			break;
		case 40: // down
			editor.search.moveSelection(1);
			ev.preventDefault();
			break;
		case 37: // left
		case 39: // right
			ev.stopImmediatePropagation();
			break;
		case 13: // enter
		case 9: { // tab
			if (ev.keyCode === 9 && ev.shiftKey) {
				this.commitField(input, true, true);
				this.tryDeleteEmptyMoveSlot(input);
				ev.preventDefault();
				return;
			}
			const result = editor.search.selectResult();
			const value = result && editor.search.getResultName(result);
			if (value === '' && input.value) {
				// value not found
				this.commitField(input, true);
			} else if (value !== null) {
				// selected a value
				const [name, moveSlot] = value.split('|');
				if (editor.innerFocus?.type === 'move' && editor.innerFocus.typeIndex === -1) {
					this.setMoveResult(name, moveSlot);
				} else {
					this.setFocusedValue(name, ev.shiftKey);
				}
				this.tryDeleteEmptyMoveSlot(input);
				if (inSearchBox) input.value = '';
			} else {
				// added a filter
				if (inSearchBox) {
					input.value = '';
				} else {
					// restore focused input
					const focus = editor.parseFocus(input.getAttribute('data-focus'));
					if (focus) input.value = editor.getField(focus);
					input.classList.remove('incomplete');

					// clear and focus search box
					const searchBox = this.base!.querySelector<HTMLInputElement>('input[name=value]');
					if (searchBox) {
						searchBox.value = '';
						searchBox.focus();
					}
				}
				editor.setSearchValue('');
				this.resetScroll();
				this.forceUpdate();
			}
			ev.preventDefault();
			break;
		}
		}
	}
	tryDeleteEmptyMoveSlot(input: HTMLInputElement) {
		if (input.value) return false;
		const { editor } = this.props;
		const focus = editor.parseFocus(input.getAttribute('data-focus'));
		if (focus?.type !== 'move' || focus.typeIndex < 0) return false;

		const moves = editor.sets[focus.setIndex]?.moves;
		if (!moves) return false;
		if (moves[focus.typeIndex]) return false;
		moves.splice(focus.typeIndex, 1);
		if (editor?.innerFocus?.type === 'move' && editor.innerFocus.typeIndex > focus.typeIndex) {
			editor.innerFocus.typeIndex--;
		}
		// easier than guarding against the blur handler clobbering moves
		input.value = moves[focus.typeIndex] || '';
		this.forceUpdate();
		return true;
	}
	keyDownField = (ev: KeyboardEvent) => {
		if (!this.props.editor.innerFocus && ev.keyCode === 9) {
			const target = ev.currentTarget as HTMLInputElement;
			const focus = this.props.editor.parseFocus(target.getAttribute('data-focus')!);
			if (!this.commitField(target)) {
				ev.preventDefault();
				return;
			}
			if (this.focusAdjacentField(focus, ev.shiftKey)) {
				ev.preventDefault();
			}
			return;
		}
		this.keyDownSearchInput(ev, false);
	};
	keyDownNickname = (ev: KeyboardEvent) => {
		if (ev.keyCode !== 9) return;
		const target = ev.currentTarget as HTMLInputElement;
		this.commitField(target);
		const focus = this.props.editor.parseFocus(target.getAttribute('data-focus')!);
		if (this.focusAdjacentField(focus, ev.shiftKey)) {
			ev.preventDefault();
		}
	};
	keyDownSearch = (ev: KeyboardEvent) => {
		this.keyDownSearchInput(ev, true);
	};
	clickPanelButton = (ev: Event) => {
		const { editor } = this.props;
		if (editor.readonly) return;
		const target = ev.currentTarget as HTMLButtonElement;
		const focus = editor.parseFocus(target.value) as InnerFocusState;
		if (editor.stringifyFocus(editor.innerFocus) === target.value) {
			this.pendingFocus = focus;
			this.pendingFocusButton = PSView.hasTapped;
			this.forceUpdate();
			return;
		}
		this.startFocusAnimation(target);
		this.changeFocus(focus, PSView.hasTapped);
	};
	keyDownPanelButton = (ev: KeyboardEvent) => {
		if (ev.keyCode !== 9) return;
		const target = ev.currentTarget as HTMLButtonElement;
		const focus = this.props.editor.parseFocus(target.value);
		if (!focus) return;
		this.focusAdjacentField(focus, ev.shiftKey);
		ev.preventDefault();
	};
	closeInnerFocus = (ev?: Event) => {
		const focus = this.props.editor.innerFocus;
		if (!focus) return;
		const expectedTop = this.base!.querySelector<HTMLElement>(
			'.team-focus-editor .set-form'
		)?.getBoundingClientRect().top ?? null;
		const restoreNickname = document.activeElement?.getAttribute('name') === 'nickname';
		this.props.editor.innerFocus = null;
		this.pendingFocus = null;
		this.forceUpdate(() => {
			const target = this.getOuterFocusTarget(focus, restoreNickname);
			const setButton = this.getOuterSetButton(focus);
			if (target && ((target as HTMLInputElement).name === 'nickname' || !target.classList.contains('set-field'))) {
				PSView.politeFocus(target);
				(target as HTMLInputElement).select?.();
			}
			this.restoreOuterSetScroll(setButton || target || null, expectedTop);
		});
		this.props.onUpdate();
		ev?.stopImmediatePropagation();
		ev?.preventDefault();
	};
	handleKeyDown = (ev: KeyboardEvent) => {
		if (ev.keyCode !== 27) return;
		this.closeInnerFocus(ev);
		return false;
	};
	restoreOuterSetScroll(target: HTMLElement | null, expectedTop: number | null) {
		if (!target || expectedTop === null) return;
		const setButton = target.closest<HTMLElement>('.set-form') || target;
		const dy = setButton.getBoundingClientRect().top - expectedTop;
		if (!dy) return;
		const scrollParent = this.getScrollParent(setButton);
		if (scrollParent) {
			scrollParent.scrollTop += dy;
		} else {
			window.scrollBy(0, dy);
		}
	}
	getScrollParent(elem: HTMLElement) {
		for (let parent = elem.parentElement; parent; parent = parent.parentElement) {
			const style = getComputedStyle(parent);
			if (!/(auto|scroll)/.test(style.overflowY)) continue;
			if (parent.scrollHeight <= parent.clientHeight) continue;
			return parent;
		}
		return null;
	}
	getOuterFocusTarget(focus: NonNullable<TeamEditorState['innerFocus']>, restoreNickname = false) {
		if (restoreNickname) {
			return this.base!.querySelector<HTMLInputElement>(
				`input[data-focus="set-${focus.setIndex}-nickname"]`
			);
		}
		if (focus.type === 'details' || focus.type === 'stats' || focus.type === 'import') {
			return this.base!.querySelector<HTMLButtonElement>(
				`button[name="${focus.type}"][value="${this.props.editor.stringifyFocus(focus)}"]`
			);
		}
		if (focus.type === 'move' && focus.typeIndex === -1) {
			return this.base!.querySelector<HTMLButtonElement>(
				`button[value="${this.props.editor.stringifyFocus(focus)}"]`
			);
		}
		// return this.base!.querySelector<HTMLButtonElement>(
		// 	`button[name=addpokemon][value="set-${focus.setIndex}-pokemon"]`
		// );
	}
	getOuterSetButton(focus: NonNullable<TeamEditorState['innerFocus']>) {
		if (focus.setIndex >= this.props.editor.sets.length) return null;
		return this.base!.querySelectorAll<HTMLElement>('.teameditor > .set-form')[focus.setIndex] || null;
	}
	removeDuplicateMove(name: string) {
		const { editor } = this.props;
		const focus = editor.innerFocus;
		if (!name) return false;
		if (focus?.type !== 'move') return false;
		const set = editor.sets[focus.setIndex];
		if (!set) return false;
		const moveIndex = set.moves.indexOf(name);
		if (moveIndex < 0 || moveIndex === focus.typeIndex) return false;

		set.moves.splice(moveIndex, 1);
		let emptyIndex = 0;
		while (emptyIndex < 4 && set.moves[emptyIndex]) emptyIndex++;
		if (emptyIndex >= 4) emptyIndex = focus.typeIndex;
		this.changeFocus({
			setIndex: focus.setIndex,
			type: 'move',
			typeIndex: emptyIndex,
		});
		editor.save();
		this.props.onChange?.();
		this.forceUpdate();
		return true;
	}
	setFocusedValue(name: string, reverse?: boolean) {
		const focus = this.props.editor.innerFocus;
		if (!focus) return;
		if (this.removeDuplicateMove(name)) return;
		const input = this.base!.querySelector<HTMLInputElement>(
			`input.set-field[data-focus="${this.props.editor.stringifyFocus(focus)}"]`
		);
		if (!input) return;
		input.value = name;
		this.commitField(input, true, reverse);
	}
	setMoveResult(name: string, slot?: string, reverse?: boolean) {
		this.selectMoveResult(name, slot, reverse);
		this.props.editor.save();
		this.props.onChange?.();
		this.forceUpdate();
	}
	selectResult = (type: string | null, name: string, slot?: string, reverse?: boolean) => {
		if (type === null) {
			this.resetScroll();
			this.forceUpdate();
		} else if (!type) {
			const searchBox = this.base!.querySelector<HTMLInputElement>('input[name=value]');
			if (searchBox) {
				searchBox.value = '';
				searchBox.focus();
			}
			this.props.editor.setSearchValue('');
			this.resetScroll();
			this.forceUpdate();
		} else if (type === 'move' && this.props.editor.innerFocus?.typeIndex === -1) {
			this.setMoveResult(name, slot, reverse);
		} else {
			this.setFocusedValue(name);
		}
	};
	focusAdjacentField(focus: FocusState, reverse: boolean): boolean {
		const set = this.props.editor.sets[focus.setIndex];
		const curField = `${focus.type}${focus.typeIndex === -1 ? '' : focus.typeIndex}`;
		const fields: string[] = ['pokemon'];
		if (set) {
			if (this.props.editor.showAbility(set)) fields.push('ability');
			if (this.props.editor.showItem(set)) fields.push('item');
			for (let i = 0; i < Math.max(4, set.moves.length); i++) fields.push(`move${i}`);
			fields.push('stats');
			fields.push('details');
			fields.push('nickname');
		}
		const fieldIndex = fields.indexOf(curField);
		if (fieldIndex < 0) return false;

		const next = fields[fieldIndex + (reverse ? -1 : 1)];
		if (!next && reverse && focus.type === 'pokemon') {
			const prevButton = this.base!.querySelector<HTMLButtonElement>(
				`.team-focus-editor .set-form button[name=delete][value="${focus.setIndex}"]`
			) || this.base!.querySelector<HTMLButtonElement>(
				`.team-focus-editor .tabbar button[name=addpokemon]`
			) || this.base!.querySelector<HTMLButtonElement>(
				`.teameditor > .set-form button[name=delete][value="${focus.setIndex}"]`
			) || this.base!.querySelector<HTMLButtonElement>(
				`.teameditor button[name=addpokemon]`
			);
			prevButton?.focus();
			return !!prevButton;
		}
		if (!next) return false;
		if (next === 'nickname') {
			const input = this.base!.querySelector<HTMLInputElement>(
				`input[data-focus="set-${focus.setIndex}-nickname"]`
			);
			input?.focus();
			input?.select();
			return !!input;
		}
		const nextType = next.startsWith('move') ? 'move' : next as InnerFocusType;
		const nextTypeIndex = parseInt(next.slice(nextType.length) || '-1');
		this.changeFocus({ setIndex: focus.setIndex, type: nextType, typeIndex: nextTypeIndex }, true, false);
		return true;
	}
	cur(type: InnerFocusType, setIndex: number, typeIndex = -1) {
		const focus = this.props.editor.innerFocus;
		return (
			focus?.type === type && focus.setIndex === setIndex && focus.typeIndex === typeIndex
		) ? ' cur' : '';
	}
	renderInput(
		setIndex: number, type: InnerFocusType, value: string | undefined,
		typeIndex = -1, placeholder = ''
	) {
		const { editor } = this.props;
		return <input
			type="text" class="textbox default-placeholder set-field" name={type}
			data-focus={editor.stringifyFocus({ setIndex, type, typeIndex })}
			defaultValue={value || ''} placeholder={placeholder} autocomplete="off" readOnly={editor.readonly}
			onMouseDown={this.mouseDownField} onFocus={this.setFocusTextbox}
			onInput={this.inputField} onKeyDown={this.keyDownField}
			onBlur={this.blurField}
		/>;
	}
	renderNicknameInput(setIndex: number) {
		const { editor } = this.props;
		const set = editor.sets[setIndex];
		const species = editor.dex.species.get(set.species);
		return <input
			type="text" class="textbox default-placeholder set-field" name="nickname"
			data-focus={`set-${setIndex}-nickname`}
			defaultValue={set.name || ''} placeholder={species.baseSpecies} readOnly={editor.readonly}
			onInput={this.inputField} onChange={this.inputField} onKeyDown={this.keyDownNickname} autocomplete="off"
		/>;
	}
	renderSet(set: Dex.PokemonSet | undefined, i: number) {
		const { editor } = this.props;
		const sprite = Dex.getTeambuilderSprite(set, editor.dex);
		const spriteClass = set && Dex.getTeambuilderSpriteData(set, editor.dex).pixelated ? ' pixelated' : '';
		if (!set) {
			return <div class="set-form" data-set-index={i}>
				<div style="text-align:right">
					{editor.deletedSet ? (
						<button onClick={this.undeleteSet} class="option"><i class="fa fa-undo" aria-hidden></i> Undo delete</button>
					) : (
						<button class="option" style="visibility:hidden"><i class="fa fa-trash" aria-hidden></i> Delete</button>
					)} {}
					<button
						class="option" name="import" onClick={this.clickPanelButton}
						value={`set-${i}-import`}
					>
						<i class="fa fa-upload" aria-hidden></i> Import
					</button>
				</div>
				<table class={spriteClass} style={sprite}>
					<tr>
						<td rowSpan={2} class="set-pokemon"><div class="border-collapse">
							<span class="sprite-inner">
								<strong class="label">Pokemon</strong> {}
								{this.renderInput(i, 'pokemon', '')}
							</span>
						</div></td>
						<td colSpan={2} class="set-details"></td>
						<td rowSpan={2} class="set-moves"></td>
						<td rowSpan={2} class="set-stats"></td>
					</tr>
					<tr>
						<td class="set-ability"></td>
						<td class="set-item"></td>
					</tr>
				</table>
			</div>;
		}
		while (set.moves.length < 4) set.moves.push('');

		const species = editor.dex.species.get(set.species);
		const tintClass = ` tint-${species.types[0]}`;
		const isCur = TeamEditorState.clipboard?.teams?.[editor.team.key]?.sets[i] ? ' cur' : '';
		const overfull = set.moves.length > 5 ? ' overfull' : set.moves.length > 4 ? ' overfull overfull5' : '';
		return <div class={`set-form${isCur}`} data-set-index={i}>
			<div style="text-align:right">
				<button class="option" onClick={this.copySet} value={i}>
					<i class="fa fa-copy" aria-hidden></i> {
						isCur ? "Deselect" :
						TeamEditorState.clipboard ? "Add to clipboard" :
						editor.readonly ? "Copy" :
						"Copy/Move"
					}
				</button> {}
				{!(TeamEditorState.clipboard || editor.readonly) && <button
					class="option" name="import" onClick={this.clickPanelButton}
					value={`set-${i}-import`}
				>
					<i class="fa fa-upload" aria-hidden></i> Import/Export
				</button>} {}
				{!(TeamEditorState.clipboard || editor.readonly) && <button
					class="option" name="delete" onClick={this.deleteSet} value={i}
				>
					<i class="fa fa-trash" aria-hidden></i> Delete
				</button>}
			</div>
			<table class={`${spriteClass}${tintClass}`} style={sprite}>
				<tr>
					<td rowSpan={2} class="set-pokemon"><div class="border-collapse">
						<span class="sprite-inner">
							<label class="label">
								<span>Pokemon</span> {}
								{this.renderInput(i, 'pokemon', set.species)}
							</label>
						</span>
					</div></td>
					<td colSpan={2} class="set-details"><div class="border-collapse">
						<label class="label">
							Details {}
							<button
								class={`textbox${this.cur('details', i)}`} onClick={this.clickPanelButton}
								onKeyDown={this.keyDownPanelButton} name="details"
								value={`set-${i}-details`}
							>
								<span class="detailcell">
									<label>Level</label> {}
									{set.level || editor.defaultLevel}
								</span>
								{!!(set.shiny || editor.gen >= 2) && <span class="detailcell">
									<label>Shiny</label> {}
									{set.shiny ? <img
										src={`${Dex.resourcePrefix}sprites/misc/shiny.png`} width={18} height={18} alt="Yes" style="margin-top: -2px"
									/> : '\u2014'}
								</span>}
								{editor.gen === 9 && !editor.isChampions && <span class="detailcell">
									<label>Tera</label> {}
									<PSIcon type={set.teraType || species.requiredTeraType || species.types[0]} new={!editor.narrow} tera />
								</span>}
								{editor.hpTypeMatters(set) && <span class="detailcell">
									<label>H.P.</label> {}
									<PSIcon type={editor.getHPType(set)} new={!editor.narrow} />
								</span>}
								{set.gender && set.gender !== 'N' && <span class="detailcell">
									<label>Gender</label> {}
									<PSIcon gender={set.gender} />
								</span>}
							</button>
						</label>
						<div>
							{species.types.map(type => <><PSIcon type={type} new={!editor.narrow} /> </>)}
						</div>
					</div></td>
					<td rowSpan={2} class={`set-moves${overfull}`}><div class="border-collapse">
						<label class={`label ${this.cur('move', i)}`}>
							Moves <button
								class={`button ${this.cur('move', i)}`} onClick={this.setFocus} value={`set-${i}-move`}
							>+</button>
						</label> {}
						{[...set.moves, ...['', '', '', ''].slice(set.moves.length)].map((move, moveIndex) => (
							<div class="moverow">{this.renderInput(i, 'move', move, moveIndex)}</div>
						))}
					</div></td>
					<td rowSpan={2} class="set-stats">
						<label class="label">
							Stats {}
							<button
								class={`textbox${this.cur('stats', i)}`} onClick={this.clickPanelButton}
								onKeyDown={this.keyDownPanelButton} name="stats"
								value={`set-${i}-stats`}
							>
								{StatForm.renderStatGraph(set, this.props.editor, true)}
							</button>
						</label>
					</td>
				</tr>
				<tr>
					<td class="set-ability"><div class="border-collapse">
						{editor.showAbility(set) && <label class="label">
							Ability {}
							{this.renderInput(i, 'ability', set.ability, -1, editor.gen <= 2 ? '(no ability)' : '(choose ability)')}
						</label>}
					</div></td>
					<td class="set-item"><div class="border-collapse">
						{editor.showItem(set) && <>
							{set.item && <PSIcon item={set.item} />}
							<label class="label">
								Item {}
								{this.renderInput(i, 'item', set.item, -1, '(no item)')}
							</label>
						</>}
					</div></td>
				</tr>
			</table>
			<div class={`set-nickname${tintClass}`}>
				<label class="label">
					<span>Nickname</span>
					{this.renderNicknameInput(i)}
				</label>
			</div>
		</div>;
	}
}

function SetSourceButtons(props: {
	editor: TeamEditorState,
	set?: Dex.PokemonSet,
	onLoadSampleSet: (setName: string) => void,
	onLoadUserSet: (setName: string) => void,
}) {
	const { editor, set } = props;
	if (!set?.species) return null;
	const sampleSets = editor.getSampleSets(set);
	const userSets = editor.getUserSets(set);
	return <>
		{sampleSets?.length !== 0 && (
			<div class="sample-sets">
				<h3>Sample sets</h3>
				{sampleSets ? (
					<div>
						{sampleSets.map(setName => <>
							<button class="button" onClick={() => props.onLoadSampleSet(setName)}>
								{setName}
							</button> {}
						</>)}
					</div>
				) : (
					<div>Loading...</div>
				)}
			</div>
		)}
		{userSets !== null && (
			<div class="sample-sets">
				<h3>Box sets</h3>
				{Object.keys(userSets).length > 0 ? (
					<div>
						{Object.keys(userSets).map(setName => <>
							<button class="button" onClick={() => props.onLoadUserSet(setName)}>
								{setName}
							</button> {}
						</>)}
					</div>
				) : (
					<div>No {set.species} sets found in boxes</div>
				)}
			</div>
		)}
	</>;
}

class SetImportForm extends preact.Component<{
	editor: TeamEditorState,
	set?: Dex.PokemonSet,
	setIndex: number,
	onChange: () => void,
}, {
		error: string,
		copied: boolean,
		dirty: boolean,
	}> {
	override state = {
		error: '',
		copied: false,
		dirty: false,
	};
	textbox: HTMLTextAreaElement | null = null;
	revertText = '';
	getExportText() {
		if (!this.props.set) return '';
		return Teams.exportSet(this.props.set, this.props.editor.dex).trim();
	}
	override componentDidMount() {
		this.setRevertPoint();
	}
	override componentDidUpdate(prevProps: this['props']) {
		if (prevProps.setIndex === this.props.setIndex) return;
		this.setRevertPoint();
	}
	setTextbox = (el: HTMLTextAreaElement | null) => {
		this.textbox = el;
	};
	setRevertPoint() {
		if (!this.textbox) return;
		this.revertText = this.getExportText();
		this.refreshText(this.revertText, false);
	}
	refreshText(text = this.getExportText(), dirty = text !== this.revertText) {
		if (!this.textbox) return;
		this.textbox.value = text;
		if (!PSView.hasTapped) {
			PSView.politeFocus(this.textbox);
			this.textbox.select();
		}
		this.setState({ error: '', copied: false, dirty });
	}
	revertSetToRevertPoint() {
		const { editor, setIndex } = this.props;
		const set = Teams.import(this.revertText)[0];
		if (set) {
			editor.sets[setIndex] = set;
		} else if (!this.revertText) {
			if (editor.sets[setIndex]) editor.sets.splice(setIndex, 1);
		} else {
			return false;
		}
		editor.save();
		this.props.onChange();
		return true;
	}
	revertTextToRevertPoint = () => {
		const { editor } = this.props;
		if (editor.readonly || !this.textbox) return;
		this.textbox.value = this.revertText;
		if (!this.revertSetToRevertPoint()) return;
		PSView.politeFocus(this.textbox);
		this.textbox.select();
		this.setState({ error: '', copied: false, dirty: false });
	};
	copyText = () => {
		if (!this.textbox) return;
		this.textbox.select();
		document.execCommand('copy');
		this.setState({ copied: true });
	};
	loadSampleSet = (setName: string) => {
		const { editor, setIndex } = this.props;
		if (!editor.loadSampleSet(setIndex, setName)) return;
		this.refreshText();
		this.props.onChange();
	};
	loadUserSet = (setName: string) => {
		const { editor, setIndex } = this.props;
		if (!editor.loadUserSet(setIndex, setName)) return;
		this.refreshText();
		this.props.onChange();
	};
	inputText = () => {
		const { editor, setIndex } = this.props;
		if (editor.readonly || !this.textbox) return;
		const dirty = this.textbox.value !== this.revertText;
		const set = Teams.import(this.textbox.value)[0];
		if (!set) {
			this.revertSetToRevertPoint();
			if (!this.textbox.value.trim() && !this.revertText) {
				this.setState({ error: '', copied: false, dirty: false });
			} else {
				this.setState({ error: 'No Pokemon set found.', copied: false, dirty });
			}
			return;
		}
		editor.sets[setIndex] = set;
		editor.save();
		this.props.onChange();
		this.setState({ error: '', copied: false, dirty });
	};
	override render() {
		const { editor } = this.props;
		return <div role="dialog" aria-label="Import/Export" class="set-import-form">
			<div class="resultheader"><h3>Import/Export Set</h3></div>
			<div class="pad">
				<p>
					<button class={`button${this.state.copied ? ' cur' : ''}`} onClick={this.copyText}>
						<i class={`fa fa-${this.state.copied ? 'check' : 'copy'}`} aria-hidden></i> {}
						{this.state.copied ? 'Copied!' : 'Copy'}
					</button> {}
					{this.state.dirty && <button
						class="button" onClick={this.revertTextToRevertPoint} disabled={editor.readonly}
					>
						<i class="fa fa-undo" aria-hidden></i> Revert
					</button>}
				</p>
				{this.state.error && <p class="message-error">{this.state.error}</p>}
				<textarea
					ref={this.setTextbox} class="textbox set-import-textbox" rows={14}
					readOnly={editor.readonly} onInput={this.inputText}
					style="min-height:6em"
				></textarea>
				<SetSourceButtons
					editor={editor} set={this.props.set}
					onLoadSampleSet={this.loadSampleSet} onLoadUserSet={this.loadUserSet}
				/>
			</div>
		</div>;
	}
}

class StatForm extends preact.Component<{
	editor: TeamEditorState,
	set: Dex.PokemonSet,
	onChange: () => void,
}> {
	static renderStatGraph(set: Dex.PokemonSet, editor: TeamEditorState, evs?: boolean) {
		const defaultEV = (editor.gen > 2 ? 0 : 252);
		const ivs = editor.getIVs(set);
		return Dex.statNames.map(statID => {
			if (statID === 'spd' && editor.gen === 1) return null;

			const stat = editor.getStat(statID, set, ivs[statID]);
			let ev: number | string = set.evs ? (set.evs[statID] || 0) : defaultEV;
			const maxStat = statID === 'hp' ?
				Math.floor(176 * editor.defaultLevel / 25) + 10 :
				Math.floor(247 * editor.defaultLevel / 50) + 5;
			const width = Math.min(stat * 75 / maxStat, 75);
			const hue = Math.min(Math.floor(stat * 180 / maxStat), 360);
			const statName = editor.gen === 1 && statID === 'spa' ? 'Spc' : BattleStatNames[statID];
			if (evs && !ev && !set.evs && statID === 'hp') ev = 'EVs';
			return <span class="statrow">
				<em>{statName}</em> {}
				<span class="statgraph">
					<span style={`width:${width}px;background:hsl(${hue},40%,75%);border-color:hsl(${hue},40%,45%)`}></span>
				</span> {}
				{!evs && <strong>{stat}</strong>}
				{evs && <strong>{ev || ''}</strong>}
				{evs && (BattleNatures[set.nature!]?.plus === statID ? (
					<small>+</small>
				) : BattleNatures[set.nature!]?.minus === statID ? (
					<small>&minus;</small>
				) : null)}
			</span>;
		});
	}
	renderIVMenu() {
		const { editor, set } = this.props;
		if (editor.gen <= 2) return null;

		const hpType = editor.getHPMove(set);
		const hpIVdata = hpType && !editor.canHyperTrain(set) && editor.getHPIVs(hpType) || null;
		const autoSpread = set.ivs && editor.defaultIVs(set, false);
		const autoSpreadValue = autoSpread && Object.values(autoSpread).join('/');
		if (editor.isChampions) return null;
		if (!hpIVdata) {
			return <select name="ivspread" class="select" onChange={this.changeIVSpread}>
				<option value="" selected>IV spreads</option>
				{autoSpreadValue && <option value="auto">Auto ({autoSpreadValue})</option>}
				<optgroup label="min Atk">
					<option value="31/0/31/31/31/31">31/0/31/31/31/31</option>
				</optgroup>
				<optgroup label="min Atk, min Spe">
					<option value="31/0/31/31/31/0">31/0/31/31/31/0</option>
				</optgroup>
				<optgroup label="max all">
					<option value="31/31/31/31/31/31">31/31/31/31/31/31</option>
				</optgroup>
				<optgroup label="min Spe">
					<option value="31/31/31/31/31/0">31/31/31/31/31/0</option>
				</optgroup>
			</select>;
		}
		const minStat = editor.gen >= 6 ? 0 : 2;
		const hpIVs = hpIVdata.map(ivs => ivs.split('').map(iv => parseInt(iv)));

		return <select name="ivspread" class="select" onChange={this.changeIVSpread}>
			<option value="" selected>Hidden Power {hpType} IVs</option>
			{autoSpreadValue && <option value="auto">Auto ({autoSpreadValue})</option>}
			<optgroup label="min Atk">
				{hpIVs.map(ivs => {
					const spread = ivs.map((iv, i) => (i === 1 ? minStat : 30) + iv).join('/');
					return <option value={spread}>{spread}</option>;
				})}
			</optgroup>
			<optgroup label="min Atk, min Spe">
				{hpIVs.map(ivs => {
					const spread = ivs.map((iv, i) => (i === 5 || i === 1 ? minStat : 30) + iv).join('/');
					return <option value={spread}>{spread}</option>;
				})}
			</optgroup>
			<optgroup label="max all">
				{hpIVs.map(ivs => {
					const spread = ivs.map(iv => 30 + iv).join('/');
					return <option value={spread}>{spread}</option>;
				})}
			</optgroup>
			<optgroup label="min Spe">
				{hpIVs.map(ivs => {
					const spread = ivs.map((iv, i) => (i === 5 ? minStat : 30) + iv).join('/');
					return <option value={spread}>{spread}</option>;
				})}
			</optgroup>
		</select>;
	}
	smogdexLink(s: string) {
		const { editor } = this.props;
		const species = editor.dex.species.get(s);
		let format: string = editor.format;
		let smogdexid: string = toID(species.baseSpecies);

		if (species.id === 'meowstic') {
			smogdexid = 'meowstic-m';
		} else if (species.forme) {
			switch (species.baseSpecies) {
			case 'Alcremie':
			case 'Basculin':
			case 'Burmy':
			case 'Castform':
			case 'Cherrim':
			case 'Deerling':
			case 'Flabebe':
			case 'Floette':
			case 'Florges':
			case 'Furfrou':
			case 'Gastrodon':
			case 'Genesect':
			case 'Keldeo':
			case 'Mimikyu':
			case 'Minior':
			case 'Pikachu':
			case 'Polteageist':
			case 'Sawsbuck':
			case 'Shellos':
			case 'Sinistea':
			case 'Tatsugiri':
			case 'Vivillon':
				break;
			default:
				smogdexid += '-' + toID(species.forme);
				break;
			}
		}

		let generationNumber = 9;
		if (format.startsWith('gen')) {
			let number = parseInt(format.charAt(3), 10);
			if (1 <= number && number <= 8) {
				generationNumber = number;
			}
			format = format.slice(4);
		}
		const generation = ['rb', 'gs', 'rs', 'dp', 'bw', 'xy', 'sm', 'ss', 'sv'][generationNumber - 1];
		if (format === 'battlespotdoubles') {
			smogdexid += '/vgc15';
		} else if (format === 'doublesou' || format === 'doublesuu') {
			smogdexid += '/doubles';
		} else if (
			format === 'ou' || format === 'uu' || format === 'ru' || format === 'nu' || format === 'pu' ||
			format === 'lc' || format === 'monotype' || format === 'mixandmega' || format === 'nfe' ||
			format === 'nationaldex' || format === 'stabmons' || format === '1v1' || format === 'almostanyability'
		) {
			smogdexid += '/' + format;
		} else if (format === 'balancedhackmons') {
			smogdexid += '/bh';
		} else if (format === 'anythinggoes') {
			smogdexid += '/ag';
		} else if (format === 'nationaldexag') {
			smogdexid += '/national-dex-ag';
		}
		return `http://smogon.com/dex/${generation}/pokemon/${smogdexid}/`;
	}
	handleGuess = () => {
		const { editor, set } = this.props;
		const team = editor.team;

		const guess = new BattleStatGuesser(team.format).guess(set);
		set.evs = guess.evs;
		this.plus = guess.plusStat || null;
		this.minus = guess.minusStat || null;
		this.updateNatureFromPlusMinus();
		this.props.onChange();
	};
	handleOptimize = () => {
		const { editor, set } = this.props;
		const team = editor.team;

		const optimized = BattleStatOptimizer(set, team.format);
		if (!optimized) return;

		set.evs = optimized.evs;
		this.plus = optimized.plus || null;
		this.minus = optimized.minus || null;
		this.updateNatureFromPlusMinus();
		this.props.onChange();
	};
	renderSpreadGuesser() {
		const { editor, set } = this.props;
		const team = editor.team;

		if (editor.gen < 3) {
			return <p>
				(<a target="_blank" href={this.smogdexLink(set.species)}>Smogon&nbsp;analysis</a>)
			</p>;
		}

		const guess = new BattleStatGuesser(team.format).guess(set);
		const role = guess.role;

		const guessedEVs = guess.evs;
		const guessedPlus = guess.plusStat || null;
		const guessedMinus = guess.minusStat || null;
		return <p class="suggested">
			<small>Guessed spread: </small>
			{role === '?' ? (
				"(Please choose 4 moves to get a guessed spread)"
			) : (
				<button name="setStatFormGuesses" class="button" onClick={this.handleGuess}>{role}: {}
					{
						Dex.statNames.map(statID => guessedEVs[statID] ? `${guessedEVs[statID]} ${BattleStatNames[statID]}` : null)
							.filter(Boolean).join(' / ')
					}
					{!!(guessedPlus && guessedMinus) && (
						` (+${BattleStatNames[guessedPlus]}, -${BattleStatNames[guessedMinus]})`
					)}
				</button>
			)}
			<small> (<a target="_blank" href={this.smogdexLink(set.species)}>Smogon&nbsp;analysis</a>)</small>
			{/* <small>
				({role} | bulk: phys {Math.round(guess.moveCount.physicalBulk / 1000)}
				{} + spec {Math.round(guess.moveCount.specialBulk / 1000)}
				{} = {Math.round(guess.moveCount.bulk / 1000)})
			</small> */}
		</p>;
	}
	renderStatOptimizer() {
		const optimized = BattleStatOptimizer(this.props.set, this.props.editor.format);
		if (!optimized) return null;

		return <p>
			<small><em>Protip:</em> Use a different nature to {
				optimized.savedEVs ?
					`save ${optimized.savedEVs} EVs` :
					'get higher stats'
			}: </small>
			<button name="setStatFormOptimization" class="button" onClick={this.handleOptimize}>
				{
					Dex.statNames.map(statID => optimized.evs[statID] ? `${optimized.evs[statID]} ${BattleStatNames[statID]}` : null)
						.filter(Boolean).join(' / ')
				}
				{!!(optimized.plus && optimized.minus) && (
					` (+${BattleStatNames[optimized.plus]}, -${BattleStatNames[optimized.minus]})`
				)}
			</button>
		</p>;
	}
	setInput(name: string, value: string) {
		const evInput = this.base!.querySelector<HTMLInputElement>(`input[name="${name}"]`);
		if (evInput) evInput.value = value;
	}
	getEVText(statID: Dex.StatName) {
		const ev = `${this.props.set.evs?.[statID] || ''}`;
		const plusMinus = this.plus === statID ? '+' : this.minus === statID ? '-' : '';
		return ev + plusMinus;
	}
	update(init?: boolean) {
		const { set } = this.props;
		const nature = BattleNatures[set.nature!];
		const skipID = !init ? this.base!.querySelector<HTMLInputElement>('input:focus')?.name : undefined;
		if (nature?.plus) {
			this.plus = nature?.plus || null;
			this.minus = nature?.minus || null;
		} else if (this.plus && this.minus) {
			// if only one of plus or minus is set, clearing Nature doesn't change them
			this.plus = null;
			this.minus = null;
		}
		for (const statID of Dex.statNames) {
			const iv = this.ivToDv(set.ivs?.[statID]);
			if (skipID !== `ev-${statID}`) this.setInput(`ev-${statID}`, this.getEVText(statID));
			if (skipID !== `iv-${statID}`) this.setInput(`iv-${statID}`, iv);
		}
	}
	override componentDidMount(): void {
		this.update(true);
	}
	override componentDidUpdate(): void {
		this.update();
	}
	plus: Dex.StatNameExceptHP | null = null;
	minus: Dex.StatNameExceptHP | null = null;
	renderStatbar(stat: number, statID: StatName) {
		const { editor } = this.props;
		const maxStat = statID === 'hp' ?
			Math.floor(176 * editor.defaultLevel / 25) + 10 :
			Math.floor(247 * editor.defaultLevel / 50) + 5;
		const width = Math.min(stat * 180 / maxStat, 180);
		const hue = Math.min(Math.floor(stat * 180 / maxStat), 360);
		return <span
			style={`width:${Math.floor(width)}px;background:hsl(${hue},85%,45%);border-color:hsl(${hue},85%,35%)`}
		></span>;
	}
	changeEV = (ev: Event) => {
		const target = ev.currentTarget as HTMLInputElement;
		const { set } = this.props;
		const statID = target.name.split('-')[1] as Dex.StatName;
		let value = Math.abs(parseInt(target.value));

		if (isNaN(value)) {
			if (set.evs) delete set.evs[statID];
		} else {
			if (this.maxEVs() < 6 * 252 || this.props.editor.isLetsGo) {
				set.evs ||= {};
			} else {
				set.evs ||= { hp: 252, atk: 252, def: 252, spa: 252, spd: 252, spe: 252 };
			}
			set.evs[statID] = value;
		}

		if (target.type === 'range') {
			// enforce limit
			const maxEv = this.maxEVs();
			let usableMaxEv = maxEv === 510 ? 508 : maxEv;
			if (maxEv < 6 * 252) {
				let totalEv = 0;
				for (const curEv of Object.values(set.evs || {})) totalEv += curEv;
				if (totalEv > maxEv && totalEv - value <= maxEv) {
					set.evs![statID] = usableMaxEv - (totalEv - value);
					// in mobile, you can drag the slider while the textbox is still focused,
					// so onChange won't update it, so we manually update it here too
					const textbox = this.base!.querySelector<HTMLInputElement>(`input.stat-input[name="ev-${statID}"]`);
					if (textbox) textbox.value = this.getEVText(statID);
				}
			}
		} else {
			if (target.value.includes('+')) {
				if (statID === 'hp') {
					alert("Natures cannot raise or lower HP.");
					return;
				}
				this.plus = statID;
			} else if (this.plus === statID) {
				this.plus = null;
			}
			if (target.value.includes('-')) {
				if (statID === 'hp') {
					alert("Natures cannot raise or lower HP.");
					return;
				}
				this.minus = statID;
			} else if (this.minus === statID) {
				this.minus = null;
			}
			this.updateNatureFromPlusMinus();
		}

		this.props.onChange();
	};
	keyDownStatInput = (ev: KeyboardEvent) => {
		// rearranges tab order to be all EVs, then all IVs
		// (column-major instead of row-major)
		if (ev.keyCode !== 9) return;
		const target = ev.currentTarget as HTMLInputElement;

		const unsortedInputs = Array.from(this.base!.querySelectorAll<HTMLInputElement>('.stat-input'));
		const evInputs = unsortedInputs.filter(input => input.name.startsWith('ev-'));
		const ivInputs = unsortedInputs.filter(input => input.name.startsWith('iv-'));
		const inputs = [...evInputs, ...ivInputs];

		const inputIndex = inputs.indexOf(target);
		if (inputIndex < 0) return;
		const nextInput = inputs[inputIndex + (ev.shiftKey ? -1 : 1)];
		if (!nextInput) return;
		nextInput.focus();
		nextInput.select();
		ev.preventDefault();
	};
	changeNatureModifier = (ev: Event) => {
		const target = ev.currentTarget as HTMLButtonElement;
		const statID = target.value.slice(0, -1) as Dex.StatNameExceptHP;
		const modifier = target.value.slice(-1);
		if (modifier === '+') {
			this.plus = statID;
			if (this.minus === statID) this.minus = null;
		} else {
			this.minus = statID;
			if (this.plus === statID) this.plus = null;
		}
		this.updateNatureFromPlusMinus();
		this.props.onChange();
	};
	updateNatureFromPlusMinus = () => {
		const { set } = this.props;
		set.nature = Teams.getNatureFromPlusMinus(this.plus, this.minus) || undefined;
	};
	renderNatureButtons(statID: Dex.StatName) {
		if (statID === 'hp' || this.props.editor.gen < 3) return null;
		const statName = BattleStatNames[statID];
		return <span class="stat-nature-buttons">
			<button
				class={`button button-first${this.minus === statID ? ' cur' : ''}`}
				value={`${statID}-`} onClick={this.changeNatureModifier}
				tabIndex={-1} aria-label={`Minus ${statName} Nature`}
			>&ndash;</button>
			<button
				class={`button button-last${this.plus === statID ? ' cur' : ''}`}
				value={`${statID}+`} onClick={this.changeNatureModifier}
				tabIndex={-1} aria-label={`Plus ${statName} Nature`}
			>+</button>
		</span>;
	}
	/** Converts DV/IV in a textbox to the value in set. */
	dvToIv(dvOrIvString?: string): number | null {
		const dvOrIv = Number(dvOrIvString);
		if (isNaN(dvOrIv)) return null;
		const useIVs = this.props.editor.gen > 2;
		return useIVs ? dvOrIv : (dvOrIv === 15 ? 31 : dvOrIv * 2);
	}
	/** Converts set.iv value to a DV/IV for a text box. */
	ivToDv(iv?: number | null): string {
		if (iv === null || iv === undefined) return '';
		const useIVs = this.props.editor.gen > 2;
		return `${useIVs ? iv : Math.trunc(iv / 2)}`;
	}
	changeIV = (ev: Event) => {
		const target = ev.currentTarget as HTMLInputElement;
		const { set } = this.props;
		const statID = target.name.split('-')[1] as StatName;
		const value = this.dvToIv(target.value);
		if (value === null) {
			if (set.ivs) {
				delete set.ivs[statID];
				if (Object.values(set.ivs).every(iv => iv === undefined)) {
					set.ivs = undefined;
				}
			}
		} else {
			set.ivs ||= { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
			set.ivs[statID] = value;
		}
		this.props.onChange();
	};
	changeNature = (ev: Event) => {
		const target = ev.currentTarget as HTMLSelectElement;
		const { set } = this.props;
		const nature = target.value as Dex.NatureName;
		if (nature === 'Serious') {
			delete set.nature;
		} else {
			set.nature = nature;
		}
		this.props.onChange();
	};
	changeIVSpread = (ev: Event) => {
		const target = ev.currentTarget as HTMLSelectElement;
		const { set } = this.props;
		if (!target.value) return;

		if (target.value === 'auto') {
			set.ivs = undefined;
		} else {
			const [hp, atk, def, spa, spd, spe] = target.value.split('/').map(Number);
			set.ivs = { hp, atk, def, spa, spd, spe };
		}
		this.props.onChange();
	};
	maxEVs() {
		const editor = this.props.editor;
		const useCappedEVs = !editor.isLetsGo && editor.gen >= 3 && !editor.isChampions;
		return editor.isChampions ? 66 : useCappedEVs ? 510 : Infinity;
	}
	override render() {
		const { editor, set } = this.props;
		const species = editor.dex.species.get(set.species);

		const baseStats = species.baseStats;

		const useEVs = !editor.isLetsGo && !editor.isChampions;
		// const useAVs = editor.isLetsGo && team.format.endsWith('norestrictions');
		const maxEV = editor.isChampions ? 32 : useEVs ? 252 : 200;
		const stepEV = useEVs ? 4 : 1;
		const defaultEV = useEVs && editor.gen <= 2 && !set.evs ? maxEV : 0;
		const useIVs = editor.gen > 2;

		// label column
		const statNames = editor.narrow ? {
			hp: 'HP',
			atk: 'Atk',
			def: 'Def',
			spa: 'SpA',
			spd: 'SpD',
			spe: 'Spe',
		} : {
			hp: 'HP',
			atk: 'Attack',
			def: 'Defense',
			spa: 'Sp. Atk.',
			spd: 'Sp. Def.',
			spe: 'Speed',
		};
		if (editor.gen === 1) statNames.spa = 'Special';

		const ivs = editor.getIVs(set);
		const stats = Dex.statNames.filter(statID => editor.gen > 1 || statID !== 'spd').map(statID => [
			statID, statNames[statID], editor.getStat(statID, set, ivs[statID]),
		] as const);

		let remaining = null;
		const maxEVs = this.maxEVs();
		if (maxEVs < 6 * 252) {
			let totalEv = 0;
			for (const ev of Object.values(set.evs || {})) totalEv += ev;
			if (totalEv <= maxEVs && !editor.isChampions) {
				remaining = (totalEv > (maxEVs - 2) ? 0 : (maxEVs - 2) - totalEv);
			} else {
				remaining = maxEVs - totalEv;
			}
			remaining ||= null;
		}
		const defaultIVs = editor.defaultIVs(set);

		return <div style="font-size:10pt" role="dialog" aria-label="Stats">
			<div class="resultheader"><h3>EVs, IVs, and Nature</h3></div>
			<div class="pad">
				{this.renderSpreadGuesser()}
				<table>
					<tr>
						<th>{/* Stat name */}</th>
						<th>Base</th>
						<th class="setstatbar">{/* Stat bar */}</th>
						<th>{editor.isLetsGo ? 'AVs' : editor.isChampions ? 'Points' : 'EVs'}</th>
						<th>{/* EV slider */}</th>
						{!editor.isChampions && <th>{useIVs ? 'IVs' : 'DVs'}</th>}
						<th>{/* Final stat */}</th>
					</tr>
					{stats.map(([statID, statName, stat]) => <tr>
						<th style="text-align:right;font-weight:normal">{statName}</th>
						<td style="text-align:right"><strong>{baseStats[statID]}</strong></td>
						<td class="setstatbar">{this.renderStatbar(stat, statID)}</td>
						<td><input
							name={`ev-${statID}`} placeholder={`${defaultEV || ''}`}
							type="text" inputMode="numeric" class="textbox default-placeholder stat-input" style="width:40px;vertical-align:middle"
							onInput={this.changeEV} onChange={this.changeEV} onKeyDown={this.keyDownStatInput}
						/>{this.renderNatureButtons(statID)}</td>
						<td><input
							name={`evslider-${statID}`} value={set.evs?.[statID] ?? defaultEV} min="0" max={maxEV} step={stepEV}
							type="range" class="evslider" tabIndex={-1} aria-hidden
							onInput={this.changeEV} onChange={this.changeEV}
						/></td>
						{!editor.isChampions && <td><input
							name={`iv-${statID}`} min={0} max={useIVs ? 31 : 15} placeholder={`${defaultIVs[statID]}`}
							style={editor.narrow ? "width:22px" : "width:40px"} type={editor.narrow ? 'text' : 'number'} inputMode="numeric"
							class="textbox default-placeholder stat-input" onInput={this.changeIV}
							onChange={this.changeIV} onKeyDown={this.keyDownStatInput}
						/></td>}
						<td style="text-align:right"><strong>{stat}</strong></td>
					</tr>)}
					<tr>
						<td colSpan={2}></td>
						<td class="setstatbar" style="text-align:right">{remaining !== null ? 'Remaining:' : <>&nbsp;</>}</td>
						<td style="text-align:center">{remaining && remaining < 0 ? <b class="message-error">{remaining}</b> : remaining}</td>
						<td colSpan={3} style="text-align:right">{this.renderIVMenu()}</td>
					</tr>
				</table>
				{editor.gen >= 3 && <p>
					Nature: <select name="nature" class="select" onChange={this.changeNature} value={set.nature || 'Serious'}>
						{Object.entries(BattleNatures).map(([natureName, curNature]) => (
							<option value={natureName}>
								{natureName}
								{curNature.plus && ` (+${BattleStatNames[curNature.plus]}, -${BattleStatNames[curNature.minus!]})`}
							</option>
						))}
					</select>
				</p>}
				{editor.gen >= 3 && !editor.narrow && <p>
					<small><em>Protip:</em> You can also set natures by typing <kbd>+</kbd> and <kbd>-</kbd> in the EV box.</small>
				</p>}
				{editor.gen >= 3 && this.renderStatOptimizer()}
			</div>
		</div>;
	}
}

class DetailsForm extends preact.Component<{
	editor: TeamEditorState,
	set: Dex.PokemonSet,
	onChange: () => void,
}> {
	update(init?: boolean) {
		const { set } = this.props;
		const skipID = !init ? this.base!.querySelector<HTMLInputElement>('input:focus')?.name : undefined;

		const nickname = this.base!.querySelector<HTMLInputElement>('input[name="nickname"]');
		if (nickname && skipID !== 'nickname') nickname.value = set.name || '';
	}
	override componentDidMount(): void {
		this.update(true);
	}
	override componentDidUpdate(): void {
		this.update();
	}
	changeNickname = (ev: Event) => {
		const target = ev.currentTarget as HTMLInputElement;
		const { set } = this.props;
		if (target.value) {
			set.name = target.value.trim();
		} else {
			delete set.name;
		}
		this.props.onChange();
	};
	changeTera = (ev: Event) => {
		const target = ev.currentTarget as HTMLInputElement;
		const { editor, set } = this.props;
		const species = editor.dex.species.get(set.species);
		if (!target.value || target.value === (species.requiredTeraType || species.types[0])) {
			delete set.teraType;
		} else {
			set.teraType = target.value.trim();
		}
		this.props.onChange();
	};
	changeLevel = (ev: Event) => {
		const target = ev.currentTarget as HTMLInputElement;
		const { set } = this.props;
		if (target.value) {
			set.level = parseInt(target.value.trim());
		} else {
			delete set.level;
		}
		this.props.onChange();
	};
	changeGender = (ev: Event) => {
		const target = ev.currentTarget as HTMLInputElement;
		const { set } = this.props;
		if (target.value) {
			set.gender = target.value.trim();
		} else {
			delete set.gender;
		}
		this.props.onChange();
	};
	changeHappiness = (ev: Event) => {
		const target = ev.currentTarget as HTMLInputElement;
		const { set } = this.props;
		if (target.value) {
			set.happiness = parseInt(target.value.trim());
		} else {
			delete set.happiness;
		}
		this.props.onChange();
	};
	changeShiny = (ev: Event) => {
		const target = ev.currentTarget as HTMLInputElement;
		const { set } = this.props;
		if (target.value) {
			set.shiny = true;
		} else {
			delete set.shiny;
		}
		this.props.onChange();
	};
	changeDynamaxLevel = (ev: Event) => {
		const target = ev.currentTarget as HTMLInputElement;
		const { set } = this.props;
		if (target.value) {
			set.dynamaxLevel = parseInt(target.value.trim());
		} else {
			delete set.dynamaxLevel;
		}
		this.props.onChange();
	};
	changeGigantamax = (ev: Event) => {
		const target = ev.currentTarget as HTMLInputElement;
		const { set } = this.props;
		if (target.checked) {
			set.gigantamax = true;
		} else {
			delete set.gigantamax;
		}
		this.props.onChange();
	};
	changeHPType = (ev: Event) => {
		const target = ev.currentTarget as HTMLInputElement;
		const { set } = this.props;
		if (target.value) {
			set.hpType = target.value;
		} else {
			delete set.hpType;
		}
		this.props.onChange();
	};
	renderGender(gender: Dex.GenderName) {
		const genderTable = { 'M': "Male", 'F': "Female" };
		if (gender === 'N') return 'Unknown';
		return <>
			<PSIcon gender={gender} /> {}
			{genderTable[gender]}
		</>;
	}
	render() {
		const { editor, set } = this.props;
		const species = editor.dex.species.get(set.species);
		return <div style="font-size:10pt" role="dialog" aria-label="Details">
			<div class="resultheader"><h3>Details</h3></div>
			<div class="pad">
				<p><label class="label">Nickname: <input
					name="nickname" class="textbox default-placeholder" placeholder={species.baseSpecies}
					onInput={this.changeNickname} onChange={this.changeNickname}
				/></label></p>
				<p><label class="label">Level: <input
					name="level" value={set.level ?? ''} placeholder={`${editor.defaultLevel}`}
					type="number" inputMode="numeric" min="1" max="100" step="1"
					class="textbox inputform numform default-placeholder" style="width: 50px"
					onInput={this.changeLevel} onChange={this.changeLevel} disabled={editor.isChampions}
				/></label><small>(You probably want to change the team's levels by changing the format, not here)</small></p>
				{editor.gen > 1 && (<>
					<p><div class="label">Shiny: <div class="labeled">
						<label class="checkbox inline"><input
							type="radio" name="shiny" value="true" checked={set.shiny}
							onInput={this.changeShiny} onChange={this.changeShiny}
						/> <img src={`${Dex.resourcePrefix}sprites/misc/shiny.png`} width={22} height={22} alt="Shiny" /> Yes</label>
						<label class="checkbox inline"><input
							type="radio" name="shiny" value="" checked={!set.shiny}
							onInput={this.changeShiny} onChange={this.changeShiny}
						/> No</label>
					</div></div></p>
					<p><div class="label">Gender: {species.gender ? (
						<strong>{this.renderGender(species.gender)}</strong>
					) : (
						<div class="labeled">
							<label class="checkbox inline"><input
								type="radio" name="gender" value="M" checked={set.gender === 'M'}
								onInput={this.changeGender} onChange={this.changeGender}
							/> {this.renderGender('M')}</label>
							<label class="checkbox inline"><input
								type="radio" name="gender" value="F" checked={set.gender === 'F'}
								onInput={this.changeGender} onChange={this.changeGender}
							/> {this.renderGender('F')}</label>
							<label class="checkbox inline"><input
								type="radio" name="gender" value="" checked={!set.gender || set.gender === 'N'}
								onInput={this.changeGender} onChange={this.changeGender}
							/> Random</label>
						</div>
					)}</div></p>
					{editor.isLetsGo ? (
						<p><label class="label">Happiness: <input
							name="happiness" value="" placeholder="70"
							type="number" inputMode="numeric"
							class="textbox inputform numform default-placeholder" style="width: 50px"
							onInput={this.changeHappiness} onChange={this.changeHappiness}
						/></label></p>
					) : (editor.gen < 8 || editor.isNatDex) && (
						<p><label class="label">Happiness: <input
							name="happiness" value={set.happiness ?? ''} placeholder="255"
							type="number" inputMode="numeric" min="0" max="255" step="1"
							class="textbox inputform numform default-placeholder" style="width: 50px"
							onInput={this.changeHappiness} onChange={this.changeHappiness}
						/></label></p>
					)}
				</>
				)}
				{editor.gen === 8 && !editor.isBDSP && !species.cannotDynamax && (
					<p>
						<label class="label" style="display:inline">Dynamax Level: <input
							name="dynamaxlevel" value={set.dynamaxLevel ?? ''} placeholder="10"
							type="number" inputMode="numeric" min="0" max="10" step="1" class="textbox inputform numform default-placeholder"
							onInput={this.changeDynamaxLevel} onChange={this.changeDynamaxLevel}
						/></label> {}
						{species.canGigantamax ? (
							<label class="checkbox inline"><input
								type="checkbox" name="gigantamax" value="true" checked={set.gigantamax}
								onInput={this.changeGigantamax} onChange={this.changeGigantamax}
							/> Gigantamax</label>
						) : species.forme === 'Gmax' && (
							<label class="checkbox inline"><input
								type="checkbox" checked disabled
							/> Gigantamax</label>
						)}
					</p>
				)}
				{((!editor.isLetsGo && editor.gen === 7) || editor.isNatDex || species.baseSpecies === 'Unown') && <p>
					<label class="label">Hidden Power Type: <select
						name="hptype" class="select" onChange={this.changeHPType} value={editor.getHPType(set)}
					>
						{Dex.types.all().map(type => (
							type.HPivs && <option value={type.name}>
								{type.name}
							</option>
						))}
					</select></label>
				</p>}
				{editor.gen === 9 && !editor.isChampions && <p>
					<label class="label" title="Tera Type">
						Tera Type: {}
						{species.requiredTeraType && editor.formeLegality === 'normal' ? (
							<select name="teratype" class="button cur" disabled><option>{species.requiredTeraType}</option></select>
						) : (
							<select
								name="teratype" class="button base-select" onChange={this.changeTera}
								value={set.teraType || species.requiredTeraType || species.types[0]}
							>
								<button><selectedcontent></selectedcontent></button>
								{Dex.types.all().map(type => (
									<option value={type.name}><PSIcon type={type.name} new tera /></option>
								))}
							</select>
						)}
					</label>
				</p>}
				{species.cosmeticFormes && <div>
					<p><strong>Form:</strong></p>
					<div style="display:flex;flex-wrap:wrap;gap:6px;max-width:400px;">
						{(() => {
							const baseId = toID(species.baseSpecies);
							const forms = species.cosmeticFormes?.length ? [baseId, ...species.cosmeticFormes.map(toID)] : [baseId];
							return forms.map(id => {
								const sp = editor.dex.species.get(id);
								const isCur = toID(set.species) === id;
								return <button
									value={id} class={`button piconbtn${isCur ? ' cur' : ''}`}
									style={{ padding: '2px' }} onClick={this.selectSprite}
								>
									<PSIcon pokemon={{ species: sp.name } as Dex.PokemonSet} />
									<br />{sp.forme || sp.baseForme || sp.baseSpecies}
								</button>;
							});
						})()}
					</div>
				</div>}
			</div>
		</div>;
	}

	selectSprite = (ev: Event) => {
		const target = ev.currentTarget as HTMLButtonElement;
		const formId = target.value;
		const { editor, set } = this.props;
		const species = editor.dex.species.get(formId);
		if (!species.exists) return;
		editor.changeSpecies(set, species.name);
		this.props.onChange();
		this.forceUpdate();
	};
}
