/**
 * Teambuilder team editor, extracted from the rest of the Preact
 * client so that it can be used in isolation.
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

import preact from "../js/lib/preact";
import { type Team } from "./client-main";
import { PSTeambuilder } from "./panel-teamdropdown";
import { Dex, type ModdedDex, toID, type ID, PSUtils } from "./battle-dex";
import { DexSearch, type SearchRow, type SearchType } from "./battle-dex-search";
import { PSSearchResults } from "./battle-searchresults";
import { BattleNatures, BattleStatNames, type StatName } from "./battle-dex-data";
import { BattleStatGuesser, BattleStatOptimizer } from "./battle-tooltips";
import { PSModel } from "./client-core";

type SelectionType = 'pokemon' | 'ability' | 'item' | 'move' | 'stats' | 'details';

class TeamEditorState extends PSModel {
	team: Team;
	sets: Dex.PokemonSet[] = [];
	gen = Dex.gen;
	dex: ModdedDex = Dex;
	deletedSet: {
		set: Dex.PokemonSet,
		index: number,
	} | null = null;
	search = new DexSearch();
	format: ID = `gen${this.gen}` as ID;
	searchIndex = 0;
	originalSpecies: string | null = null;
	narrow = false;
	selectionTypeOrder: readonly SelectionType[] = [
		'pokemon', 'ability', 'item', 'move', 'stats', 'details',
	];
	isLetsGo = false;
	isNatDex = false;
	isBDSP = false;
	defaultLevel = 100;
	readonly: boolean;
	constructor(team: Team, readonly = false) {
		super();
		this.team = team;
		this.readonly = readonly;
		this.sets = PSTeambuilder.unpackTeam(team.packedTeam);
		this.setFormat(team.format);
		window.search = this.search;
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

		this.defaultLevel = 100;
		if (
			formatid.includes('vgc') || formatid.includes('bss') || formatid.includes('ultrasinnohclassic') ||
			formatid.includes('battlespot') || formatid.includes('battlestadium') || formatid.includes('battlefestival')
		) {
			this.defaultLevel = 50;
		}
		if (formatid.includes('lc')) {
			this.defaultLevel = 5;
		}
	}
	setSearchType(type: SearchType, i: number, value?: string) {
		const set = this.sets[i];
		this.search.setType(type, this.format, set);
		this.originalSpecies = null;
		this.search.prependResults = null;
		if (type === 'move') {
			this.search.prependResults = this.getSearchMoves(set);
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
		this.searchIndex = this.search.results?.[0]?.[0] === 'header' ? 1 : 0;
	}
	updateSearchMoves(set: Dex.PokemonSet) {
		let oldResultsLength = this.search.prependResults?.length || 0;
		this.search.prependResults = this.getSearchMoves(set);
		this.searchIndex += this.search.prependResults.length - oldResultsLength;
		if (this.searchIndex < 0) this.searchIndex = 0;
		this.search.results = null;
		if (this.search.query) {
			this.setSearchValue('');
		} else {
			this.search.find('');
		}
	}
	getSearchMoves(set: Dex.PokemonSet) {
		const out: SearchRow[] = [];
		for (let i = 0; i < Math.max(set.moves.length, 4); i++) {
			out.push(['move', `_${i + 1}_${toID(set.moves[i] || '')}` as ID]);
		}
		return out;
	}
	setSearchValue(value: string) {
		this.search.find(value);
		this.searchIndex = this.search.results?.[0]?.[0] === 'header' ? 1 : 0;
	}
	selectSearchValue(): string | null {
		let result = this.search.results?.[this.searchIndex];
		if (result?.[0] === 'header') {
			this.searchIndex++;
			result = this.search.results?.[this.searchIndex];
		}
		if (!result) return null;
		if (this.search.addFilter(result)) {
			this.searchIndex = 0;
			return null;
		}
		return this.getResultValue(result);
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
	ignoreRows = ['header', 'sortpokemon', 'sortmove', 'html'];
	downSearchValue() {
		if (!this.search.results || this.searchIndex >= this.search.results.length - 1) return;

		this.searchIndex++;
		if (this.ignoreRows.includes(this.search.results[this.searchIndex]?.[0])) {
			if (this.searchIndex >= this.search.results.length - 1) return;
			this.searchIndex++;
		}
		if (this.ignoreRows.includes(this.search.results[this.searchIndex]?.[0])) {
			if (this.searchIndex >= this.search.results.length - 1) return;
			this.searchIndex++;
		}
	}
	upSearchValue() {
		if (!this.search.results || this.searchIndex <= 0) return;

		if (this.searchIndex <= 1 && this.ignoreRows.includes(this.search.results[0]?.[0])) return;
		this.searchIndex--;
		if (this.ignoreRows.includes(this.search.results[this.searchIndex]?.[0])) {
			if (this.searchIndex <= 0) return;
			this.searchIndex--;
		}
		if (this.ignoreRows.includes(this.search.results[this.searchIndex]?.[0])) {
			if (this.searchIndex <= 0) return;
			this.searchIndex--;
		}
	}
	getResultValue(result: SearchRow) {
		switch (result[0]) {
		case 'pokemon':
			return this.dex.species.get(result[1]).name;
		case 'item':
			return this.dex.items.get(result[1]).name;
		case 'ability':
			return this.dex.abilities.get(result[1]).name;
		case 'move':
			if (result[1].startsWith('_')) {
				const [slot, moveid] = result[1].slice(1).split('_');
				return this.dex.moves.get(moveid).name + '|' + slot;
			}
			return this.dex.moves.get(result[1]).name;
		default:
			return result[1];
		}
	}
	canAdd() {
		return this.sets.length < 6 || this.team.isBox;
	}
	getHPType(set: Dex.PokemonSet): Dex.TypeName {
		if (set.hpType) return set.hpType as Dex.TypeName;
		if (!set.ivs) return this.getHPMove(set) || 'Dark';

		const hpTypes = [
			'Fighting', 'Flying', 'Poison', 'Ground', 'Rock', 'Bug', 'Ghost', 'Steel', 'Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Ice', 'Dragon', 'Dark',
		] as const;
		if (this.gen <= 2) {
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
			let hpTypeX = 0;
			let i = 1;
			// n.b. this is not our usual order (Spe and SpD are flipped)
			const statOrder = ['hp', 'atk', 'def', 'spe', 'spa', 'spd'] as const;
			for (const s of statOrder) {
				if (set.ivs[s] === undefined) set.ivs[s] = 31;
				hpTypeX += i * (set.ivs[s] % 2);
				i *= 2;
			}
			return hpTypes[Math.floor(hpTypeX * 15 / 63)];
		}
	};
	hpTypeMatters(set: Dex.PokemonSet) {
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
	getStat(stat: StatName, set: Dex.PokemonSet, evOverride?: number, natureOverride?: number) {
		const team = this.team;

		const supportsEVs = !team.format.includes('letsgo');
		const supportsAVs = !supportsEVs;

		// do this after setting set.evs because it's assumed to exist
		// after getStat is run
		const species = this.dex.species.get(set.species);
		if (!species.exists) return 0;

		const level = set.level || this.defaultLevel;

		const baseStat = species.baseStats[stat];
		let iv = set.ivs?.[stat] ?? 31;
		if (this.gen <= 2) iv &= 30;
		const ev = evOverride ?? set.evs?.[stat] ?? (this.gen > 2 ? 0 : 252);

		if (stat === 'hp') {
			if (baseStat === 1) return 1;
			if (!supportsEVs) return Math.trunc(Math.trunc(2 * baseStat + iv + 100) * level / 100 + 10) + (supportsAVs ? ev : 0);
			return Math.trunc(Math.trunc(2 * baseStat + iv + Math.trunc(ev / 4) + 100) * level / 100 + 10);
		}
		let val = Math.trunc(Math.trunc(2 * baseStat + iv + Math.trunc(ev / 4)) * level / 100 + 5);
		if (!supportsEVs) {
			val = Math.trunc(Math.trunc(2 * baseStat + iv) * level / 100 + 5);
		}
		if (natureOverride) {
			val *= natureOverride;
		} else if (BattleNatures[set.nature!]?.plus === stat) {
			val *= 1.1;
		} else if (BattleNatures[set.nature!]?.minus === stat) {
			val *= 0.9;
		}
		if (!supportsEVs) {
			const friendshipValue = Math.trunc((70 / 255 / 10 + 1) * 100);
			val = Math.trunc(val) * friendshipValue / 100 + (supportsAVs ? ev : 0);
		}
		return Math.trunc(val);
	}
	export(compat?: boolean) {
		return PSTeambuilder.exportTeam(this.sets, this.dex, !compat);
	}
	import(value: string) {
		this.sets = PSTeambuilder.importTeam(value);
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
		if (attackType === 'Ground' && abilityid === 'levitate') return 0;
		if (attackType === 'Water' && abilityid === 'dryskin') return 0;
		if (attackType === 'Fire' && abilityid === 'flashfire') return 0;
		if (attackType === 'Electric' && abilityid === 'lightningrod' && this.gen >= 5) return 0;
		if (attackType === 'Grass' && abilityid === 'sapsipper') return 0;
		if (attackType === 'Electric' && abilityid === 'motordrive') return 0;
		if (attackType === 'Water' && abilityid === 'stormdrain' && this.gen >= 5) return 0;
		if (attackType === 'Electric' && abilityid === 'voltabsorb') return 0;
		if (attackType === 'Water' && abilityid === 'waterabsorb') return 0;
		if (attackType === 'Ground' && abilityid === 'eartheater') return 0;
		if (attackType === 'Fire' && abilityid === 'wellbakedbody') return 0;

		if (abilityid === 'wonderguard') {
			for (const type of types) {
				if (this.getTypeWeakness(type, attackType) <= 1) return 0;
			}
		}

		let factor = 1;
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
	save() {
		this.team.packedTeam = PSTeambuilder.packTeam(this.sets);
		this.team.iconCache = null;
	}
}

export class TeamEditor extends preact.Component<{
	team: Team, narrow?: boolean, onChange?: () => void, readonly?: boolean,
	children?: preact.ComponentChildren,
}> {
	buttons = true;
	editor!: TeamEditorState;
	setButtons = (ev: Event) => {
		const target = ev.currentTarget as HTMLButtonElement;
		const buttons = target.value === 'buttons';
		this.buttons = buttons;
		this.forceUpdate();
	};
	static renderTypeIcon(type: string | null, b?: boolean) { // b is just for utilichart.js
		if (!type) return null;

		type = Dex.types.get(type).name;
		if (!type) type = '???';
		let sanitizedType = type.replace(/\?/g, '%3f');
		return <img
			src={`${Dex.resourcePrefix}sprites/types/${sanitizedType}.png`} alt={type}
			height="14" width="32" class={`pixelated${b ? ' b' : ''}`} style="vertical-align:middle"
		/>;
	}
	static probablyMobile() {
		return document.body.offsetWidth < 500;
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
	override render() {
		this.editor ||= new TeamEditorState(this.props.team, this.props.readonly);
		this.editor.narrow = this.props.narrow ?? document.body.offsetWidth < 500;
		if (this.props.team.format !== this.editor.format) {
			this.editor.setFormat(this.props.team.format);
		}

		return <div class="teameditor">
			<ul class="tabbar">
				<li><button onClick={this.setButtons} value="buttons" class={`button${this.buttons ? ' cur' : ''}`}>
					Wizard
				</button></li>
				<li><button onClick={this.setButtons} class={`button${!this.buttons ? ' cur' : ''}`}>
					Import/Export
				</button></li>
			</ul>
			{this.buttons ? (
				<TeamWizard editor={this.editor} onChange={this.props.onChange} />
			) : (
				<TeamTextbox editor={this.editor} onChange={this.props.onChange} />
			)}
			{this.props.children}
			<div class="team-resources">
				<br /><hr /><br />
				{this.renderDefensiveCoverage()}
			</div>
		</div>;
	}
}

class TeamTextbox extends preact.Component<{ editor: TeamEditorState, onChange?: () => void }> {
	editor!: TeamEditorState;
	setInfo: {
		species: string,
		bottomY: number,
		index: number,
	}[] = [];
	textbox: HTMLTextAreaElement = null!;
	heightTester: HTMLTextAreaElement = null!;
	compat = false;
	/** we changed the set but are delaying updates until the selection form is closed */
	setDirty = false;
	windowing = true;
	selection: {
		setIndex: number,
		type: SelectionType | null,
		typeIndex: number,
		lineRange: [number, number] | null,
	} | null = null;
	innerFocus: {
		offsetY: number | null,
		setIndex: number,
		type: SelectionType,
		/** i.e. which move is this */
		typeIndex: number,
		range: [number, number],
		/** if you edit, you'll change the range end, so it needs to be updated with this in mind */
		rangeEndChar: string,
	} | null = null;
	getYAt(index: number, fullLine?: boolean) {
		if (index < 0) return 10;
		const newValue = this.textbox.value.slice(0, index);
		this.heightTester.value = fullLine && !newValue.endsWith('\n') ? newValue + '\n' : newValue;
		return this.heightTester.scrollHeight;
	}
	input = () => this.updateText();
	keyUp = () => this.updateText(true);
	click = (ev: MouseEvent | KeyboardEvent) => {
		if (ev.altKey || ev.ctrlKey || ev.metaKey) return;
		const oldRange = this.selection?.lineRange;
		this.updateText(true, true);
		if (this.selection) {
			// this shouldn't actually update anything, so the reference comparison is enough
			if (this.selection.lineRange === oldRange) return;
			if (this.textbox.selectionStart === this.textbox.selectionEnd) {
				const range = this.getSelectionTypeRange();
				if (range) this.textbox.setSelectionRange(range[0], range[1]);
			}
		}
	};
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
				editor.upSearchValue();
				const resultsUp = this.base!.querySelector('.searchresults');
				if (resultsUp) {
					resultsUp.scrollTop = Math.max(0, editor.searchIndex * 33 - Math.trunc((window.innerHeight - 100) * 0.4));
				}
				this.forceUpdate();
				ev.preventDefault();
			}
			break;
		case 40: // down
			if (this.innerFocus) {
				editor.downSearchValue();
				const resultsDown = this.base!.querySelector('.searchresults');
				if (resultsDown) {
					resultsDown.scrollTop = Math.max(0, editor.searchIndex * 33 - Math.trunc((window.innerHeight - 100) * 0.4));
				}
				this.forceUpdate();
				ev.preventDefault();
			}
			break;
		case 9: // tab
		case 13: // enter
			if (ev.keyCode === 13 && ev.shiftKey) return;
			if (!this.innerFocus) {
				if (
					this.textbox.selectionStart === this.textbox.value.length &&
					(this.textbox.value.endsWith('\n\n') || !this.textbox.value)
				) {
					this.addPokemon();
				} else {
					this.click(ev);
				}
				ev.stopImmediatePropagation();
				ev.preventDefault();
			} else {
				const result = this.editor.selectSearchValue();
				if (result !== null) {
					const [name, moveSlot] = result.split('|');
					this.selectResult(this.innerFocus.type, name, moveSlot);
				} else {
					this.replaceNoFocus('', this.innerFocus.range[0], this.innerFocus.range[1]);
					this.editor.setSearchValue('');
					this.forceUpdate();
				}
				this.resetScroll();
				ev.stopImmediatePropagation();
				ev.preventDefault();
			}
			break;
		case 80: // p
			if (ev.metaKey) {
				window.PS.alert(editor.export(this.compat));
				ev.stopImmediatePropagation();
				ev.preventDefault();
				break;
			}
		}
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
			} else {
				this.forceUpdate();
			}
			this.textbox.focus();
			return true;
		}
		return false;
	};
	updateText = (noTextChange?: boolean, autoSelect?: boolean | SelectionType) => {
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
		let nextSetIndex = 0;
		if (!noTextChange) this.setInfo = [];
		this.selection = null;

		while (index < value.length) {
			let nlIndex = value.indexOf('\n', index);
			if (nlIndex < 0) nlIndex = value.length;
			const line = value.slice(index, nlIndex);

			if (!line.trim()) {
				setIndex = null;
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
				nextSetIndex++;
			}

			const selectionEndCutoff = (selectionStart === selectionEnd ? nlIndex : nlIndex + 1);
			let start = index, end = index + line.length;
			if (index <= selectionStart && selectionEnd <= selectionEndCutoff) {
				// both ends within range
				let type: SelectionType | null = null;
				const lcLine = line.toLowerCase().trim();

				if (lcLine.startsWith('ability:')) {
					type = 'ability';
				} else if (lcLine.startsWith('-')) {
					type = 'move';
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
					setIndex, type, lineRange: [start, end], typeIndex: 0,
				};
				if (autoSelect) this.engageFocus();
			}

			index = nlIndex + 1;
		}
		if (!noTextChange) {
			const end = value.endsWith('\n\n') ? value.length - 1 : value.length;
			const bottomY = this.getYAt(end, true);
			if (this.setInfo.length) {
				this.setInfo[this.setInfo.length - 1].bottomY = bottomY;
			}

			textbox.style.height = `${bottomY + 100}px`;
			this.save();
		}
		this.forceUpdate();
	};
	engageFocus(focus?: this['innerFocus']) {
		if (this.innerFocus) return;
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

		if (focus.type === 'details' || focus.type === 'stats') {
			this.forceUpdate();
			return;
		}

		const value = this.textbox.value.slice(focus.range[0], focus.range[1]);
		editor.setSearchType(focus.type, focus.setIndex, value);
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
	selectResult = (type: string, name: string, moveSlot?: string) => {
		if (!type) {
			this.changeSet(this.innerFocus!.type, '');
		} else {
			this.changeSet(type as SelectionType, name, moveSlot);
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
	changeSet(type: SelectionType, name: string, moveSlot?: string) {
		const focus = this.innerFocus;
		if (!focus) return;

		if (type === focus.type && (this.editor.sets[focus.setIndex] || !name)) {
			this.replace(name, focus.range[0], focus.range[1]);
			this.updateText(false, true);
			return;
		}

		switch (type) {
		case 'pokemon': {
			const species = this.editor.dex.species.get(name);
			const abilities = Object.values(species.abilities);
			const requiredItem = !(this.editor.format.includes('hackmons') || this.editor.format.endsWith('bh')) &&
				species.requiredItems.length === 1;
			this.editor.sets[focus.setIndex] ||= {
				ability: abilities.length === 1 ? abilities[0] : undefined,
				item: requiredItem ? species.requiredItems[0] : undefined,
				species: '',
				moves: [],
			};
			this.editor.sets[focus.setIndex].species = name;
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
		const start = this.setInfo[index]?.index ?? this.textbox.value.length;
		const end = this.setInfo[index + 1]?.index ?? this.textbox.value.length;
		return [start, end];
	}
	changeCompat = (ev: Event) => {
		const checkbox = ev.currentTarget as HTMLInputElement;
		this.compat = checkbox.checked;
		this.editor.import(this.textbox.value);
		this.textbox.value = this.editor.export(this.compat);
		// this.textbox.select();
		// document.execCommand('insertText', false, this.editor.export(this.compat));
		this.updateText();
	};
	replaceSet(index: number) {
		const editor = this.editor;
		const { team } = editor;
		if (!team) return;

		let newText = PSTeambuilder.exportSet(editor.sets[index], editor.dex, !this.compat);
		const [start, end] = this.getSetRange(index);
		if (start && start === this.textbox.value.length && !this.textbox.value.endsWith('\n\n')) {
			newText = (this.textbox.value.endsWith('\n') ? '\n' : '\n\n') + newText;
		}
		this.replaceNoFocus(newText, start, end, start + newText.length);
		// we won't do a full update but we do need to update where the end is,
		// for future updates
		if (!this.setInfo[index]) {
			this.updateText();
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
		textbox.focus();
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
		const exportedTeam = this.editor.export(this.compat);
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
			type: target.name as SelectionType,
			typeIndex: 0,
			range: [0, 0],
			rangeEndChar: '',
		});
	};
	addPokemon = () => {
		if (!this.textbox.value.endsWith('\n\n')) {
			this.textbox.value += this.textbox.value.endsWith('\n') ? '\n' : '\n\n';
		}
		const end = this.textbox.value.length;
		this.textbox.setSelectionRange(end, end);
		this.textbox.focus();
		this.engageFocus({
			offsetY: this.getYAt(end, true),
			setIndex: this.setInfo.length,
			type: 'pokemon',
			typeIndex: 0,
			range: [end, end],
			rangeEndChar: '@',
		});
	};
	scrollResults = (ev: Event) => {
		if (!(ev.currentTarget as HTMLElement).scrollTop) return;
		this.windowing = false;
		if (document.documentElement.clientWidth === document.documentElement.scrollWidth) {
			(ev.currentTarget as any).scrollIntoViewIfNeeded?.();
		}
		this.forceUpdate();
	};
	resetScroll() {
		this.windowing = true;
		const searchResults = this.base!.querySelector('.searchresults');
		if (searchResults) searchResults.scrollTop = 0;
	}
	windowResults() {
		if (this.windowing) {
			return Math.ceil(window.innerHeight / 33);
		}
		return null;
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
				<label>Shiny</label>{set.shiny ? 'Yes' : 'No'}
			</span>
			{editor.gen === 9 ? (
				<span class="detailcell">
					<label>Tera</label>{TeamEditor.renderTypeIcon(set.teraType || species.forceTeraType || species.types[0])}
				</span>
			) : editor.hpTypeMatters(set) ? (
				<span class="detailcell">
					<label>H. Power</label>{TeamEditor.renderTypeIcon(editor.getHPType(set))}
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
		const button = ev?.currentTarget as HTMLButtonElement;
		if (button) {
			button.innerHTML = '<i class="fa fa-check"></i> Copied';
			button.className += ' cur';
		}
	};
	render() {
		const editor = this.props.editor;
		const statsDetailsOffset = editor.gen >= 3 ? 18 : -1;
		return <div>
			<p>
				<button class="button" onClick={this.copyAll}>
					<i class="fa fa-copy" aria-hidden></i> Copy
				</button> {}
				<label class="checkbox inline">
					<input type="checkbox" name="compat" onChange={this.changeCompat} /> Old export format
				</label>
			</p>
			<div class="teameditor-text">
				<textarea
					class="textbox teamtextbox" style={`padding-left:${editor.narrow ? '50px' : '100px'}`}
					onInput={this.input} onClick={this.click} onKeyUp={this.keyUp} onKeyDown={this.keyDown}
					readOnly={editor.readonly}
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
						const prevOffset = i === 0 ? 8 : this.setInfo[i - 1].bottomY;
						const species = editor.dex.species.get(info.species);
						const num = Dex.getPokemonIconNum(species.id);
						if (!num) return null;

						const top = Math.floor(num / 12) * 30;
						const left = (num % 12) * 40;
						const iconStyle = `background:transparent url(${Dex.resourcePrefix}sprites/pokemonicons-sheet.png) no-repeat scroll -${left}px -${top}px`;

						const itemStyle = set.item && Dex.getItemIcon(editor.dex.items.get(set.item));

						if (editor.narrow) {
							return <div style={`top:${prevOffset + 1}px;left:5px;position:absolute;text-align:center;pointer-events:none`}>
								<div><span class="picon" style={iconStyle}></span></div>
								{species.types.map(type => <div>{TeamEditor.renderTypeIcon(type)}</div>)}
								<div><span class="itemicon" style={itemStyle}></span></div>
							</div>;
						}
						return [<div
							style={
								`top:${prevOffset - 7}px;left:0;position:absolute;text-align:right;` +
								`width:94px;padding:103px 5px 0 0;min-height:24px;pointer-events:none;` +
								Dex.getTeambuilderSprite(set, editor.gen)
							}
						>
							<div>{species.types.map(type => TeamEditor.renderTypeIcon(type))}<span class="itemicon" style={itemStyle}></span></div>
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
					<div
						class="searchresults"
						style={`top:${(this.setInfo[this.innerFocus.setIndex]?.bottomY ?? this.bottomY() + 50) - 12}px`}
						onScroll={this.scrollResults}
					>
						<button class="button closesearch" onClick={this.closeMenu}>
							{!editor.narrow && <kbd>Esc</kbd>} <i class="fa fa-times" aria-hidden></i> Close
						</button>
						{this.innerFocus.type === 'stats' ? (
							<StatForm editor={editor} set={this.editor.sets[this.innerFocus.setIndex]} onChange={this.handleSetChange} />
						) : this.innerFocus.type === 'details' ? (
							<DetailsForm editor={editor} set={this.editor.sets[this.innerFocus.setIndex]} onChange={this.handleSetChange} />
						) : (
							<PSSearchResults
								search={editor.search} resultIndex={editor.searchIndex}
								windowing={this.windowResults()} onSelect={this.selectResult}
							/>
						)}
					</div>
				)}
			</div>
		</div>;
	}
}

class TeamWizard extends preact.Component<{
	editor: TeamEditorState, onChange?: () => void,
}> {
	innerFocus: {
		setIndex: number,
		type: SelectionType,
		typeIndex?: number,
	} | null = null;
	setSearchBox: string | null = null;
	windowing = true;
	setFocus = (ev: Event) => {
		if (this.props.editor.readonly) return;
		const target = ev.currentTarget as HTMLButtonElement;
		const [rawType, i] = target.value.split('|');
		const setIndex = parseInt(i);
		const type = rawType as SelectionType;
		if (!target.value || this.innerFocus && this.innerFocus.setIndex === setIndex && this.innerFocus.type === type) {
			this.changeFocus(null);
			return;
		}
		this.changeFocus({
			setIndex,
			type,
		});
	};
	deleteSet = (ev: Event) => {
		const target = ev.currentTarget as HTMLButtonElement;
		const i = parseInt(target.value);
		const editor = this.props.editor;
		editor.deleteSet(i);
		if (this.innerFocus) {
			this.changeFocus({
				setIndex: editor.sets.length,
				type: 'pokemon',
			});
		}
		this.handleSetChange();
		ev.preventDefault();
	};
	undeleteSet = (ev: Event) => {
		const editor = this.props.editor;
		const setIndex = editor.deletedSet?.index;
		editor.undeleteSet();
		if (this.innerFocus && setIndex !== undefined) {
			this.changeFocus({
				setIndex,
				type: 'pokemon',
			});
		}
		this.handleSetChange();
		ev.preventDefault();
	};
	changeFocus(focus: this['innerFocus']) {
		this.innerFocus = focus;
		if (!focus) {
			this.forceUpdate();
			return;
		}

		const editor = this.props.editor;
		const set = editor.sets[focus.setIndex];
		if (focus.type === 'details') {
			this.setSearchBox = set.name || '';
		} else if (focus.type !== 'stats') {
			let value;
			if (focus.type === 'pokemon') value = set?.species || '';
			else if (focus.type === 'item') value = set.item;
			else if (focus.type === 'ability') value = set.ability;
			editor.setSearchType(focus.type, focus.setIndex, value);
			this.resetScroll();
			this.setSearchBox = value || '';
		}
		this.forceUpdate();
	}
	renderButton(set: Dex.PokemonSet | undefined, i: number) {
		const editor = this.props.editor;
		const sprite = Dex.getTeambuilderSprite(set, editor.gen);
		if (!set) {
			return <div class="set-button">
				<div style="text-align:right">
					{editor.deletedSet ? (
						<button onClick={this.undeleteSet} class="option"><i class="fa fa-undo" aria-hidden></i> Undo delete</button>
					) : (
						<button class="option" style="visibility:hidden"><i class="fa fa-trash" aria-hidden></i> Delete</button>
					)}
				</div>
				<table>
					<tr>
						<td rowSpan={2} class="set-pokemon"><div class="border-collapse">
							<button class="button button-first cur" onClick={this.setFocus} value={`pokemon|${i}`}>
								<span class="sprite" style={sprite}><span class="sprite-inner">
									<strong class="label">Pokemon</strong> {}
									<em>(choose species)</em>
								</span></span>
							</button>
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
		const overfull = set.moves.length > 4 ? ' overfull' : '';

		const cur = (t: SelectionType) => (
			editor.readonly || (this.innerFocus?.type === t && this.innerFocus.setIndex === i) ? ' cur' : ''
		);
		const species = editor.dex.species.get(set.species);
		return <div class="set-button">
			<div style="text-align:right">
				<button class="option" onClick={this.deleteSet} value={i} style={editor.readonly ? "visibility:hidden" : ""}>
					<i class="fa fa-trash" aria-hidden></i> Delete
				</button>
			</div>
			<table>
				<tr>
					<td rowSpan={2} class="set-pokemon"><div class="border-collapse">
						<button class={`button button-first${cur('pokemon')}`} onClick={this.setFocus} value={`pokemon|${i}`}>
							<span class="sprite" style={sprite}><span class="sprite-inner">
								<strong class="label">Pokemon</strong> {}
								{set.species}
							</span></span>
						</button>
					</div></td>
					<td colSpan={2} class="set-details"><div class="border-collapse">
						<button class={`button button-middle${cur('details')}`} onClick={this.setFocus} value={`details|${i}`}>
							<span class="detailcell">
								<strong class="label">Types</strong> {}
								{species.types.map(type => <div>{TeamEditor.renderTypeIcon(type)}</div>)}
							</span>
							<span class="detailcell">
								<strong class="label">Level</strong> {}
								{set.level || editor.defaultLevel}
								{editor.narrow && set.shiny && <><br /><img src="/sprites/misc/shiny.png" width={22} height={22} alt="Shiny" /></>}
								{!editor.narrow && set.gender && set.gender !== 'N' && <>
									<br /><img
										src={`/fx/gender-${set.gender.toLowerCase()}.png`} alt={set.gender} width="7" height="10" class="pixelated"
									/>
								</>}
							</span>
							{!editor.narrow && <span class="detailcell">
								<strong class="label">Shiny</strong> {}
								{set.shiny ? <img src="/sprites/misc/shiny.png" width={22} height={22} alt="Yes" /> : '\u2014'}
							</span>}
							{editor.gen === 9 && <span class="detailcell">
								<strong class="label">Tera</strong> {}
								{TeamEditor.renderTypeIcon(set.teraType || species.forceTeraType || species.types[0])}
							</span>}
							{editor.hpTypeMatters(set) && <span class="detailcell">
								<strong class="label">H.P.</strong> {}
								{TeamEditor.renderTypeIcon(editor.getHPType(set))}
							</span>}
						</button>
					</div></td>
					<td rowSpan={2} class="set-moves"><div class="border-collapse">
						<button class={`button button-middle${cur('move')}${overfull}`} onClick={this.setFocus} value={`move|${i}`}>
							<strong class="label">Moves</strong> {}
							{set.moves.map((move, mi) => <div>
								{!editor.narrow && <small class="gray">&bull;</small>}
								{mi >= 4 ? <span class="message-error">{move || (editor.narrow && '-') || ''}</span> : move || (editor.narrow && '-')}
							</div>)}
							{!set.moves.length && <em>(no moves)</em>}
						</button>
					</div></td>
					<td rowSpan={2} class="set-stats"><div class="border-collapse">
						<button class={`button button-last${cur('stats')}`} onClick={this.setFocus} value={`stats|${i}`}>
							{StatForm.renderStatGraph(set, this.props.editor, true)}
						</button>
					</div></td>
				</tr>
				<tr>
					<td class="set-ability"><div class="border-collapse">
						<button class={`button button-middle${cur('ability')}`} onClick={this.setFocus} value={`ability|${i}`}>
							<strong class="label">Ability</strong> {}
							{set.ability || <em>(no ability)</em>}
						</button>
					</div></td>
					<td class="set-item"><div class="border-collapse">
						<button class={`button button-middle${cur('item')}`} onClick={this.setFocus} value={`item|${i}`}>
							{set.item && <span class="itemicon" style={'float:right;' + Dex.getItemIcon(set.item)}></span>}
							<strong class="label">Item</strong> {}
							{set.item || <em>(no item)</em>}
						</button>
					</div></td>
				</tr>
			</table>
			<button class={`button set-nickname${cur('details')}`} onClick={this.setFocus} value={`details|${i}`}>
				<strong class="label">Nickname</strong> {}
				{editor.getNickname(set)}
			</button>
		</div>;
	}
	handleSetChange = () => {
		this.props.editor.save();
		this.props.onChange?.();
		this.forceUpdate();
	};
	clearSearchBox() {
		const searchBox = this.base!.querySelector<HTMLInputElement>('input[name=value]');
		if (searchBox) {
			searchBox.value = '';
			if (!TeamEditor.probablyMobile()) searchBox.focus();
		}
	}
	selectResult = (type: string, name: string, slot?: string, reverse?: boolean) => {
		const editor = this.props.editor;
		this.clearSearchBox();
		if (!type) {
			editor.setSearchValue('');
			this.resetScroll();
			this.forceUpdate();
		} else {
			const setIndex = this.innerFocus!.setIndex;
			const set = (editor.sets[setIndex] ||= { species: '', moves: [] });
			switch (type) {
			case 'pokemon':
				set.species = name;
				const species = editor.dex.species.get(name);
				if (!(editor.format.includes('hackmons') || editor.format.endsWith('bh')) && species.requiredItems.length === 1) {
					set.item = species.requiredItems[0];
				} else {
					set.item = '';
				}
				const abilities = Object.values(species.abilities);
				if (abilities.length === 1) set.ability = abilities[0];
				this.changeFocus({
					setIndex,
					type: reverse ? 'details' : 'ability',
				});
				break;
			case 'ability':
				set.ability = name;
				this.changeFocus({
					setIndex,
					type: reverse ? 'pokemon' : 'item',
				});
				break;
			case 'item':
				set.item = name;
				this.changeFocus({
					setIndex,
					type: reverse ? 'ability' : 'move',
				});
				break;
			case 'move':
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
				if (set.moves.length === 4 && set.moves.every(Boolean)) {
					this.changeFocus({
						setIndex,
						type: reverse ? 'item' : 'stats',
					});
				} else {
					if (editor.search.query) {
						this.resetScroll();
					}
					editor.updateSearchMoves(set);
				}
				break;
			}
			editor.save();
			this.props.onChange?.();
			this.forceUpdate();
		}
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
	keyDownSearch = (ev: KeyboardEvent) => {
		const searchBox = ev.currentTarget as HTMLInputElement;
		const editor = this.props.editor;
		switch (ev.keyCode) {
		case 8: // backspace
			if (searchBox.selectionStart === 0 && searchBox.selectionEnd === 0) {
				editor.search.removeFilter();
				editor.setSearchValue(searchBox.value);
				this.resetScroll();
				this.forceUpdate();
			}
			break;
		case 38: // up
			editor.upSearchValue();
			const resultsUp = this.base!.querySelector('.wizardsearchresults');
			if (resultsUp) {
				resultsUp.scrollTop = Math.max(0, editor.searchIndex * 33 - Math.trunc((window.innerHeight - 300) / 2));
			}
			this.forceUpdate();
			ev.preventDefault();
			break;
		case 40: // down
			editor.downSearchValue();
			const resultsDown = this.base!.querySelector('.wizardsearchresults');
			if (resultsDown) {
				resultsDown.scrollTop = Math.max(0, editor.searchIndex * 33 - Math.trunc((window.innerHeight - 300) / 2));
			}
			this.forceUpdate();
			ev.preventDefault();
			break;
		case 37: // left
			// prevent jumping to other rooms
			ev.stopImmediatePropagation();
			break;
		case 39: // right
			// prevent jumping to other rooms
			ev.stopImmediatePropagation();
			break;
		case 13: // enter
		case 9: // tab
			const value = editor.selectSearchValue();
			if (this.innerFocus?.type !== 'move') searchBox.value = value || '';
			if (value !== null) {
				if (ev.keyCode === 9 && this.innerFocus?.type === 'move') {
					this.changeFocus({
						setIndex: this.innerFocus.setIndex,
						type: ev.shiftKey ? 'item' : 'stats',
					});
				} else {
					const [name, moveSlot] = value.split('|');
					this.selectResult(this.innerFocus?.type || '', name, moveSlot, ev.keyCode === 9 && ev.shiftKey);
				}
			} else {
				this.clearSearchBox();
				editor.setSearchValue('');
				this.resetScroll();
				this.forceUpdate();
			}
			ev.preventDefault();
			break;
		}
	};
	scrollResults = (ev: Event) => {
		if (!(ev.currentTarget as HTMLElement).scrollTop) return;
		this.windowing = false;
		if (document.documentElement.clientWidth === document.documentElement.scrollWidth) {
			(ev.currentTarget as any).scrollIntoViewIfNeeded?.();
		}
		this.forceUpdate();
	};
	resetScroll() {
		this.windowing = true;
		const searchResults = this.base!.querySelector('.wizardsearchresults');
		if (searchResults) searchResults.scrollTop = 0;
	}
	windowResults() {
		if (this.windowing) {
			return Math.ceil(window.innerHeight / 33);
		}
		return null;
	}

	override componentDidUpdate() {
		const searchBox = this.base!.querySelector<HTMLInputElement>('input[name=value], input[name=nickname]');
		if (this.setSearchBox !== null) {
			if (searchBox) {
				searchBox.value = this.setSearchBox;
				if (!TeamEditor.probablyMobile()) searchBox.select();
			}
			this.setSearchBox = null;
		}
		const filters = this.base!.querySelector('.dexlist-filters');
		if (searchBox && searchBox.name === 'value') {
			if (filters) {
				const { width } = filters.getBoundingClientRect();
				searchBox.style.paddingLeft = `${width + 5}px`;
			} else {
				searchBox.style.paddingLeft = `3px`;
			}
		}
	}
	renderInnerFocus() {
		if (!this.innerFocus) return null;
		const { editor } = this.props;
		const { type, setIndex } = this.innerFocus;
		const set = this.props.editor.sets[setIndex] as Dex.PokemonSet | undefined;
		const cur = (i: number) => setIndex === i ? ' cur' : '';
		return <div class="team-focus-editor">
			<ul class="tabbar">
				<li class="home-li"><button class="button" onClick={this.setFocus}>
					<i class="fa fa-chevron-left" aria-hidden></i> Back
				</button></li>
				{editor.sets.map((curSet, i) => <li><button
					class={`button picontab${cur(i)}`} onClick={this.setFocus} value={`${type}|${i}`}
				>
					<span class="picon" style={Dex.getPokemonIcon(curSet)}></span><br />
					{editor.getNickname(curSet)}
				</button></li>)}
				{editor.canAdd() && <li><button
					class={`button picontab${cur(editor.sets.length)}`} onClick={this.setFocus} value={`pokemon|${editor.sets.length}`}
				>
					<i class="fa fa-plus"></i>
				</button></li>}
			</ul>
			<div class="pad">{this.renderButton(set, setIndex)}</div>
			{type === 'stats' ? (
				<StatForm editor={editor} set={set!} onChange={this.handleSetChange} />
			) : type === 'details' ? (
				<DetailsForm editor={editor} set={set!} onChange={this.handleSetChange} />
			) : (
				<div>
					<div class="searchboxwrapper pad" onClick={this.handleClickFilters}>
						<input
							type="search" name="value" class="textbox" placeholder="Search or filter"
							onInput={this.updateSearch} onKeyDown={this.keyDownSearch} autocomplete="off"
						/>
						{PSSearchResults.renderFilters(editor.search)}
					</div>
					<div class="wizardsearchresults" onScroll={this.scrollResults}><PSSearchResults
						search={editor.search} hideFilters resultIndex={editor.searchIndex}
						onSelect={this.selectResult} windowing={this.windowResults()}
					/></div>
				</div>
			)}
		</div>;
	}
	override render() {
		const { editor } = this.props;
		if (this.innerFocus) return this.renderInnerFocus();

		const deletedSet = (i: number) => editor.deletedSet?.index === i ? <p style="text-align:right">
			<button class="button" onClick={this.undeleteSet}>
				<i class="fa fa-undo" aria-hidden></i> Undo delete
			</button>
		</p> : null;
		return <div class="teameditor">
			{editor.sets.map((set, i) => [
				deletedSet(i),
				this.renderButton(set, i),
			])}
			{deletedSet(editor.sets.length)}
			{editor.canAdd() && <p><button class="button big" onClick={this.setFocus} value={`pokemon|${editor.sets.length}`}>
				<i class="fa fa-plus" aria-hidden></i> Add Pok&eacute;mon
			</button></p>}
		</div>;
	}
}

class StatForm extends preact.Component<{
	editor: TeamEditorState,
	set: Dex.PokemonSet,
	onChange: () => void,
}> {
	static renderStatGraph(set: Dex.PokemonSet, editor: TeamEditorState, evs?: boolean) {
		// const supportsEVs = !team.format.includes('letsgo');
		const defaultEV = (editor.gen > 2 ? 0 : 252);
		return Dex.statNames.map(statID => {
			if (statID === 'spd' && editor.gen === 1) return null;

			const stat = editor.getStat(statID, set);
			let ev: number | string = set.evs?.[statID] ?? defaultEV;
			let width = stat * 75 / 504;
			if (statID === 'hp') width = stat * 75 / 704;
			if (width > 75) width = 75;
			let hue = Math.floor(stat * 180 / 714);
			if (hue > 360) hue = 360;
			const statName = editor.gen === 1 && statID === 'spa' ? 'Spc' : BattleStatNames[statID];
			if (evs && !ev && !set.evs && statID === 'hp') ev = 'EVs';
			return <span class="statrow">
				<label>{statName}</label> {}
				<span class="statgraph">
					<span style={`width:${width}px;background:hsl(${hue},40%,75%);border-color:hsl(${hue},40%,45%)`}></span>
				</span> {}
				{!evs && <em>{stat}</em>}
				{evs && <em>{ev || ''}</em>}
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
		if (!hpIVdata) {
			return <select name="ivspread" class="button" onChange={this.changeIVSpread}>
				<option value="" selected>IV spreads</option>
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

		return <select name="ivspread" class="button" onChange={this.changeIVSpread}>
			<option value="" selected>Hidden Power {hpType} IVs</option>
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
			const ev = `${set.evs?.[statID] || ''}`;
			const plusMinus = this.plus === statID ? '+' : this.minus === statID ? '-' : '';
			const iv = this.ivToDv(set.ivs?.[statID]);
			if (skipID !== `ev-${statID}`) this.setInput(`ev-${statID}`, ev + plusMinus);
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
		let width = stat * 180 / 504;
		if (statID === 'hp') width = Math.floor(stat * 180 / 704);
		if (width > 179) width = 179;
		let hue = Math.floor(stat * 180 / 714);
		if (hue > 360) hue = 360;
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
			set.evs ||= {};
			set.evs[statID] = value;
		}

		if (target.type === 'range') {
			// enforce limit
			const maxEv = this.maxEVs();
			if (maxEv < 6 * 252) {
				let totalEv = 0;
				for (const curEv of Object.values(set.evs || {})) totalEv += curEv;
				if (totalEv > maxEv && totalEv - value <= maxEv) {
					set.evs![statID] = maxEv - (totalEv - value) - (maxEv % 4);
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
	updateNatureFromPlusMinus = () => {
		const { set } = this.props;
		if (!this.plus || !this.minus) {
			delete set.nature;
		} else {
			for (const i in BattleNatures) {
				if (BattleNatures[i as Dex.NatureName].plus === this.plus && BattleNatures[i as Dex.NatureName].minus === this.minus) {
					set.nature = i as Dex.NatureName;
					break;
				}
			}
		}
	};
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
			if (set.ivs) delete set.ivs[statID];
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

		const [hp, atk, def, spa, spd, spe] = target.value.split('/').map(Number);
		set.ivs = { hp, atk, def, spa, spd, spe };
		this.props.onChange();
	};
	maxEVs() {
		const team = this.props.editor.team;
		const useEVs = !team.format.includes('letsgo');
		return useEVs ? 510 : Infinity;
	}
	override render() {
		const { editor, set } = this.props;
		const team = editor.team;
		const species = editor.dex.species.get(set.species);

		const baseStats = species.baseStats;

		const nature = BattleNatures[set.nature || 'Serious'];

		const useEVs = !team.format.includes('letsgo');
		// const useAVs = !useEVs && team.format.endsWith('norestrictions');
		const maxEV = useEVs ? 252 : 200;
		const stepEV = useEVs ? 4 : 1;
		const defaultEV = useEVs && editor.gen <= 2 && !set.evs ? maxEV : 0;
		const useIVs = editor.gen > 2;

		// label column
		const statNames = {
			hp: 'HP',
			atk: 'Attack',
			def: 'Defense',
			spa: 'Sp. Atk.',
			spd: 'Sp. Def.',
			spe: 'Speed',
		};
		if (editor.gen === 1) statNames.spa = 'Special';

		const stats = Dex.statNames.filter(statID => editor.gen > 1 || statID !== 'spd').map(statID => [
			statID, statNames[statID], editor.getStat(statID, set),
		] as const);

		let remaining = null;
		const maxEv = this.maxEVs();
		if (maxEv < 6 * 252) {
			let totalEv = 0;
			for (const ev of Object.values(set.evs || {})) totalEv += ev;
			if (totalEv <= maxEv) {
				remaining = (totalEv > (maxEv - 2) ? 0 : (maxEv - 2) - totalEv);
			} else {
				remaining = maxEv - totalEv;
			}
			remaining ||= null;
		}

		return <div style="font-size:10pt" role="dialog" aria-label="Stats">
			<div class="resultheader"><h3>EVs, IVs, and Nature</h3></div>
			<div class="pad">
				{this.renderSpreadGuesser()}
				<table>
					<tr>
						<th>{/* Stat name */}</th>
						<th>Base</th>
						<th class="setstatbar">{/* Stat bar */}</th>
						<th>{useEVs ? 'EVs' : 'AVs'}</th>
						<th>{/* EV slider */}</th>
						<th>{useIVs ? 'IVs' : 'DVs'}</th>
						<th>{/* Final stat */}</th>
					</tr>
					{stats.map(([statID, statName, stat]) => <tr>
						<th style="text-align:right;font-weight:normal">{statName}</th>
						<td style="text-align:right"><strong>{baseStats[statID]}</strong></td>
						<td class="setstatbar">{this.renderStatbar(stat, statID)}</td>
						<td><input
							name={`ev-${statID}`} placeholder={`${defaultEV || ''}`}
							type="text" inputMode="numeric" class="textbox default-placeholder" style="width:40px"
							onInput={this.changeEV} onChange={this.changeEV}
						/></td>
						<td><input
							name={`evslider-${statID}`} value={set.evs?.[statID] ?? defaultEV} min="0" max={maxEV} step={stepEV}
							type="range" class="evslider" tabIndex={-1} aria-hidden
							onInput={this.changeEV} onChange={this.changeEV}
						/></td>
						<td><input
							name={`iv-${statID}`} min={0} max={useIVs ? 31 : 15} placeholder={useIVs ? '31' : '15'} style="width:40px"
							type="number" class="textbox default-placeholder" onInput={this.changeIV} onChange={this.changeIV}
						/></td>
						<td style="text-align:right"><strong>{stat}</strong></td>
					</tr>)}
					<tr>
						<td colSpan={2}></td>
						<td class="setstatbar" style="text-align:right">{remaining !== null ? 'Remaining:' : ''}</td>
						<td style="text-align:center">{remaining && remaining < 0 ? <b class="message-error">{remaining}</b> : remaining}</td>
						<td colSpan={3} style="text-align:right">{this.renderIVMenu()}</td>
					</tr>
				</table>
				{editor.gen >= 3 && <p>
					Nature: <select name="nature" class="button" onChange={this.changeNature}>
						{Object.entries(BattleNatures).map(([natureName, curNature]) => (
							<option value={natureName} selected={curNature === nature}>
								{natureName}
								{curNature.plus && ` (+${BattleStatNames[curNature.plus]}, -${BattleStatNames[curNature.minus!]})`}
							</option>
						))}
					</select>
				</p>}
				{editor.gen >= 3 && <p>
					<small><em>Protip:</em> You can also set natures by typing <kbd>+</kbd> and <kbd>-</kbd> next to a stat.</small>
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
		if (!target.value || target.value === (species.forceTeraType || species.types[0])) {
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
			<img src={`/fx/gender-${gender.toLowerCase()}.png`} alt="" width="7" height="10" class="pixelated" /> {}
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
					value={set.level ?? ''} placeholder={`${editor.defaultLevel}`}
					type="number" min="1" max="100" step="1" name="level" class="textbox inputform numform default-placeholder"
					onInput={this.changeLevel} onChange={this.changeLevel}
				/></label><small>(You probably want to change the team's levels by changing the format, not here)</small></p>
				{editor.gen > 1 && (<>
					<p><div class="label">Shiny: <div class="labeled">
						<label class="checkbox inline"><input
							type="radio" name="shiny" value="true" checked={set.shiny}
							onInput={this.changeShiny} onChange={this.changeShiny}
						/> <img src="/sprites/misc/shiny.png" width={22} height={22} alt="Shiny" /> Yes</label>
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
							type="number" name="happiness" value="" placeholder="70"
							class="textbox inputform numform default-placeholder"
							onInput={this.changeHappiness} onChange={this.changeHappiness}
						/></label></p>
					) : (editor.gen < 8 || editor.isNatDex) && (
						<p><label class="label">Happiness: <input
							type="number" min="0" max="255" step="1" name="happiness"
							value={set.happiness ?? ''} placeholder="255" class="textbox inputform numform default-placeholder"
							onInput={this.changeHappiness} onChange={this.changeHappiness}
						/></label></p>
					)}
				</>
				)}
				{editor.gen === 8 && !editor.isBDSP && !species.cannotDynamax && (
					<p>
						<label class="label" style="display:inline">Dynamax Level: <input
							type="number" min="0" max="10" step="1" name="dynamaxlevel" class="textbox inputform numform default-placeholder"
							value={set.dynamaxLevel ?? ''} placeholder="10" onInput={this.changeDynamaxLevel} onChange={this.changeDynamaxLevel}
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
					<label class="label">Hidden Power Type: <select name="hptype" class="button" onChange={this.changeHPType}>
						{Dex.types.all().map(type => (
							type.HPivs && <option value={type.name} selected={editor.getHPType(set) === type.name}>
								{type.name}
							</option>
						))}
					</select></label>
				</p>}
				{editor.gen === 9 && <p>
					<label class="label" title="Tera Type">
						Tera Type: {}
						{species.forceTeraType ? (
							<select name="teratype" class="button cur" disabled><option>{species.forceTeraType}</option></select>
						) : (
							<select name="teratype" class="button" onChange={this.changeTera}>
								{Dex.types.all().map(type => (
									<option value={type.name} selected={(set.teraType || species.types[0]) === type.name}>
										{type.name}
									</option>
								))}
							</select>
						)}
					</label>
				</p>}
				{species.cosmeticFormes && <p>
					<button class="button">
						Change sprite
					</button>
				</p>}
			</div>
		</div>;
	}
}
