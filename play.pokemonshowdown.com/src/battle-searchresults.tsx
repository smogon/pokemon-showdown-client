/**
 * Search Results
 *
 * Code for displaying sesrch results from battle-dex-search.ts
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

import preact from "../js/lib/preact";
import { Dex, toID, type ID } from "./battle-dex";
import type { DexSearch, SearchRow, SearchType } from "./battle-dex-search";
import { Config } from "./client-main";

export class PSSearchResults extends preact.Component<{
	search: DexSearch, windowing?: number | null, hideFilters?: boolean, firstRow?: SearchRow,
	resultIndex?: number,
	/** type = '' means a filter was selected,
	  * null means a sort was selected (clear not needed) */
	onSelect?: (type: SearchType | '' | null, name: string, moveSlot?: string) => void,
}> {
	readonly URL_ROOT = `//${Config.routes.dex}/`;
	speciesId: ID = '' as ID;
	itemId: ID = '' as ID;
	abilityId: ID = '' as ID;
	moveIds: ID[] = [];
	resultIndex = -1;

	// Per-search memos for Relumi diff/lookup helpers. Cleared at the start of
	// each render cycle so the same species/move/move-field lookups don't repeat.
	private _relumiDiffCache: Record<string, any> = Object.create(null);
	private _relumiHighlightCached: boolean | undefined;

	private getRelumiOverrides() {
		return (window as any).BattleTeambuilderTable?.gen8relumi || null;
	}
	private shouldHighlightRelumiChanges() {
		if (this._relumiHighlightCached !== undefined) return this._relumiHighlightCached;
		if (Dex.prefs('relumiHighlightBalanceChangesTB') === false) {
			return (this._relumiHighlightCached = false);
		}
		if (this.props.search.dex.modid === 'gen8relumi') {
			return (this._relumiHighlightCached = true);
		}
		const format = this.props.search.typedSearch?.format || '';
		return (this._relumiHighlightCached = format.includes('relumi'));
	}
	private getVanillaSpeciesData(speciesId: ID): Dex.Species | null {
		const cacheKey = 'vanillaSpecies|' + speciesId;
		if (cacheKey in this._relumiDiffCache) return this._relumiDiffCache[cacheKey];
		const relumiTable = this.getRelumiOverrides();
		let result: Dex.Species | null;
		if (relumiTable?.vanillaSpeciesData?.[speciesId]) {
			result = relumiTable.vanillaSpeciesData[speciesId];
		} else if (relumiTable?.overrideSpeciesData && speciesId in relumiTable.overrideSpeciesData) {
			// Custom form (override present, no vanilla snapshot) — Dex.forGen would
			// return the mod-added BattlePokedex entry, not true vanilla data.
			result = null;
		} else {
			const vanillaSpecies = Dex.forGen(9).species.get(speciesId);
			result = vanillaSpecies.exists ? vanillaSpecies : null;
		}
		this._relumiDiffCache[cacheKey] = result;
		return result;
	}
	private getVanillaMoveData(moveId: ID): Dex.Move | null {
		const cacheKey = 'vanillaMove|' + moveId;
		if (cacheKey in this._relumiDiffCache) return this._relumiDiffCache[cacheKey];
		const relumiTable = this.getRelumiOverrides();
		let vanillaMove: Dex.Move | null;
		if (relumiTable?.vanillaMoveData?.[moveId]) {
			vanillaMove = relumiTable.vanillaMoveData[moveId];
		} else {
			vanillaMove = Dex.forGen(9).moves.get(moveId);
			if (!vanillaMove.exists) vanillaMove = null;
		}
		this._relumiDiffCache[cacheKey] = vanillaMove;
		return vanillaMove;
	}
	private resolveBaseSpeciesId(speciesId: ID): ID {
		const species = this.props.search.dex.species.get(speciesId);
		if (!species?.exists) return '' as ID;
		const baseId = toID(species.baseSpecies || speciesId);
		return baseId !== speciesId ? baseId : speciesId;
	}
	private formsShareBaseStats(formStats: Dex.StatsTable, baseStats: Dex.StatsTable): boolean {
		if (!formStats || !baseStats) return false;
		return formStats.hp === baseStats.hp && formStats.atk === baseStats.atk &&
			formStats.def === baseStats.def && formStats.spa === baseStats.spa &&
			formStats.spd === baseStats.spd && formStats.spe === baseStats.spe;
	}
	private getRelumiDiffSourceSpeciesId(speciesId: ID): ID {
		const cacheKey = 'diffSource|' + speciesId;
		if (cacheKey in this._relumiDiffCache) return this._relumiDiffCache[cacheKey];
		const relumiTable = this.getRelumiOverrides();
		let result: ID = speciesId;
		if (relumiTable?.overrideSpeciesData) {
			if (relumiTable.overrideSpeciesData[speciesId]) {
				result = speciesId;
			} else {
				// Fall back to base form only if base has overrides AND this form is
				// effectively the same as base (custom form, or cosmetic form with
				// identical vanilla stats to base).
				const baseId = this.resolveBaseSpeciesId(speciesId);
				if (baseId && baseId !== speciesId && relumiTable.overrideSpeciesData[baseId]) {
					const vanillaSpecies = Dex.forGen(9).species.get(speciesId);
					if (!vanillaSpecies.exists) {
						result = baseId;
					} else {
						const vanillaBase = Dex.forGen(9).species.get(baseId);
						if (vanillaBase?.exists &&
							!this.formsShareBaseStats(vanillaSpecies.baseStats, vanillaBase.baseStats)) {
							// Vanilla stats differ from base = form has its own stats
							// (e.g. Rotom appliances); do not coalesce.
							result = speciesId;
						} else {
							result = baseId;
						}
					}
				} else {
					result = speciesId;
				}
			}
		}
		this._relumiDiffCache[cacheKey] = result;
		return result;
	}
	private getVanillaComparisonSpeciesId(speciesId: ID): ID {
		const cacheKey = 'vanillaCmp|' + speciesId;
		if (cacheKey in this._relumiDiffCache) return this._relumiDiffCache[cacheKey];
		const relumiTable = this.getRelumiOverrides();
		const hasVanillaData = !!(relumiTable?.vanillaSpeciesData && speciesId in relumiTable.vanillaSpeciesData);
		let result: ID;
		if (hasVanillaData) {
			result = speciesId;
		} else if (relumiTable?.overrideSpeciesData && speciesId in relumiTable.overrideSpeciesData) {
			// Custom form (override, no vanilla snapshot) — fall back to base form.
			result = this.resolveBaseSpeciesId(speciesId) || speciesId;
		} else {
			const vanillaSpecies = Dex.forGen(9).species.get(speciesId);
			if (vanillaSpecies.exists) {
				result = speciesId;
			} else {
				result = this.resolveBaseSpeciesId(speciesId) || speciesId;
			}
		}
		this._relumiDiffCache[cacheKey] = result;
		return result;
	}
	private getStatDiff(speciesId: ID, statName: Dex.StatName, value: number): { vanilla: number, delta: number } | null {
		const cacheKey = `statDiff|${speciesId}|${statName}|${value}`;
		if (cacheKey in this._relumiDiffCache) return this._relumiDiffCache[cacheKey];
		let result: { vanilla: number, delta: number } | null = null;
		if (!this.shouldHighlightRelumiChanges()) {
			this._relumiDiffCache[cacheKey] = result;
			return result;
		}
		const relumiTable = this.getRelumiOverrides();
		if (!relumiTable?.overrideSpeciesData) {
			this._relumiDiffCache[cacheKey] = result;
			return result;
		}
		const diffSourceId = this.getRelumiDiffSourceSpeciesId(speciesId);
		const relumiSpeciesDiff = relumiTable.overrideSpeciesData[diffSourceId];
		if (!relumiSpeciesDiff) {
			this._relumiDiffCache[cacheKey] = result;
			return result;
		}

		let vanillaComparisonId: ID;
		let vanillaSpecies: Dex.Species | null;
		if (relumiSpeciesDiff.baseStats && relumiSpeciesDiff.baseStats[statName] !== undefined) {
			vanillaComparisonId = this.getVanillaComparisonSpeciesId(diffSourceId);
			vanillaSpecies = this.getVanillaSpeciesData(vanillaComparisonId);
			if (!vanillaSpecies) {
				this._relumiDiffCache[cacheKey] = result;
				return result;
			}
		} else if (!relumiSpeciesDiff.baseStats) {
			if (this.getVanillaSpeciesData(speciesId)) {
				this._relumiDiffCache[cacheKey] = result;
				return result;
			}
			vanillaComparisonId = this.getVanillaComparisonSpeciesId(speciesId);
			vanillaSpecies = this.getVanillaSpeciesData(vanillaComparisonId);
			if (!vanillaSpecies?.baseStats) {
				this._relumiDiffCache[cacheKey] = result;
				return result;
			}
		} else {
			this._relumiDiffCache[cacheKey] = result;
			return result;
		}

		const vanillaStat = vanillaSpecies.baseStats[statName];
		if (typeof vanillaStat !== 'number' || vanillaStat === value) {
			this._relumiDiffCache[cacheKey] = result;
			return result;
		}
		result = { vanilla: vanillaStat, delta: value - vanillaStat };
		this._relumiDiffCache[cacheKey] = result;
		return result;
	}
	private getStatClass(speciesId: ID, statName: Dex.StatName, value: number) {
		const diff = this.getStatDiff(speciesId, statName, value);
		if (!diff) return '';
		return diff.delta > 0 ? 'relumi-change-up' : 'relumi-change-down';
	}
	private getBSTDiff(speciesId: ID, currentBST: number): { vanilla: number, delta: number } | null {
		const cacheKey = `bstDiff|${speciesId}|${currentBST}`;
		if (cacheKey in this._relumiDiffCache) return this._relumiDiffCache[cacheKey];
		let result: { vanilla: number, delta: number } | null = null;
		if (!this.shouldHighlightRelumiChanges()) {
			this._relumiDiffCache[cacheKey] = result;
			return result;
		}
		const relumiTable = this.getRelumiOverrides();
		if (!relumiTable?.overrideSpeciesData) {
			this._relumiDiffCache[cacheKey] = result;
			return result;
		}
		const diffSourceId = this.getRelumiDiffSourceSpeciesId(speciesId);
		const relumiSpeciesDiff = relumiTable.overrideSpeciesData[diffSourceId];
		if (!relumiSpeciesDiff) {
			this._relumiDiffCache[cacheKey] = result;
			return result;
		}

		let vanillaComparisonId: ID;
		let vanillaSpecies: Dex.Species | null;
		if (relumiSpeciesDiff.baseStats) {
			vanillaComparisonId = this.getVanillaComparisonSpeciesId(diffSourceId);
			vanillaSpecies = this.getVanillaSpeciesData(vanillaComparisonId);
			if (!vanillaSpecies?.baseStats) {
				this._relumiDiffCache[cacheKey] = result;
				return result;
			}
		} else {
			if (this.getVanillaSpeciesData(speciesId)) {
				this._relumiDiffCache[cacheKey] = result;
				return result;
			}
			vanillaComparisonId = this.getVanillaComparisonSpeciesId(speciesId);
			vanillaSpecies = this.getVanillaSpeciesData(vanillaComparisonId);
			if (!vanillaSpecies?.baseStats) {
				this._relumiDiffCache[cacheKey] = result;
				return result;
			}
		}

		let vanillaBST = 0;
		for (const stat in vanillaSpecies.baseStats) {
			vanillaBST += vanillaSpecies.baseStats[stat as Dex.StatName];
		}
		if (typeof vanillaBST !== 'number' || vanillaBST === currentBST) {
			this._relumiDiffCache[cacheKey] = result;
			return result;
		}
		result = { vanilla: vanillaBST, delta: currentBST - vanillaBST };
		this._relumiDiffCache[cacheKey] = result;
		return result;
	}
	private getBSTClass(speciesId: ID, currentBST: number) {
		const diff = this.getBSTDiff(speciesId, currentBST);
		if (!diff) return '';
		return diff.delta > 0 ? 'relumi-change-up' : 'relumi-change-down';
	}
	private isNewRelumiAbility(speciesId: ID, abilityName: string): boolean {
		if (!abilityName) return false;
		const cacheKey = 'newAbility|' + speciesId + '|' + abilityName;
		if (cacheKey in this._relumiDiffCache) return this._relumiDiffCache[cacheKey];
		let result = false;
		if (!this.shouldHighlightRelumiChanges()) {
			this._relumiDiffCache[cacheKey] = result;
			return result;
		}
		const relumiTable = this.getRelumiOverrides();
		if (!relumiTable?.overrideSpeciesData) {
			this._relumiDiffCache[cacheKey] = result;
			return result;
		}
		const diffSourceId = this.getRelumiDiffSourceSpeciesId(speciesId);
		const relumiSpeciesDiff = relumiTable.overrideSpeciesData[diffSourceId];
		if (!relumiSpeciesDiff) {
			this._relumiDiffCache[cacheKey] = result;
			return result;
		}

		let vanillaComparisonId: ID;
		let vanillaSpecies: Dex.Species | null;
		if (relumiSpeciesDiff.abilities) {
			// Normal path: override has abilities.
			vanillaComparisonId = this.getVanillaComparisonSpeciesId(diffSourceId);
			vanillaSpecies = this.getVanillaSpeciesData(vanillaComparisonId);
			if (!vanillaSpecies) {
				this._relumiDiffCache[cacheKey] = result;
				return result;
			}
		} else {
			// No abilities override — custom form path: compare against base form's
			// vanilla abilities.
			if (this.getVanillaSpeciesData(speciesId)) {
				this._relumiDiffCache[cacheKey] = result;
				return result;
			}
			vanillaComparisonId = this.getVanillaComparisonSpeciesId(speciesId);
			vanillaSpecies = this.getVanillaSpeciesData(vanillaComparisonId);
			if (!vanillaSpecies) {
				this._relumiDiffCache[cacheKey] = result;
				return result;
			}
		}

		const vanillaAbilities: Record<string, true> = Object.create(null);
		for (const slot in vanillaSpecies.abilities) {
			const vanillaAbilityName = vanillaSpecies.abilities[slot as '0' | '1' | 'H' | 'S'];
			if (vanillaAbilityName) vanillaAbilities[vanillaAbilityName] = true;
		}
		result = !vanillaAbilities[abilityName];
		this._relumiDiffCache[cacheKey] = result;
		return result;
	}
	private getMoveDiff(
		moveId: ID, valueType: 'basePower' | 'accuracy', value: number | true
	): { vanilla: number | true, delta: number } | null {
		const cacheKey = `moveDiff|${moveId}|${valueType}|${String(value)}`;
		if (cacheKey in this._relumiDiffCache) return this._relumiDiffCache[cacheKey];
		let result: { vanilla: number | true, delta: number } | null = null;
		if (!this.shouldHighlightRelumiChanges()) {
			this._relumiDiffCache[cacheKey] = result;
			return result;
		}
		const relumiTable = this.getRelumiOverrides();
		if (!relumiTable?.overrideMoveData) {
			this._relumiDiffCache[cacheKey] = result;
			return result;
		}
		const relumiMoveDiff = relumiTable.overrideMoveData[moveId];
		if (!relumiMoveDiff || relumiMoveDiff[valueType] === undefined) {
			this._relumiDiffCache[cacheKey] = result;
			return result;
		}
		const vanillaMove = this.getVanillaMoveData(moveId);
		if (!vanillaMove) {
			this._relumiDiffCache[cacheKey] = result;
			return result;
		}
		const vanillaValue = vanillaMove[valueType];
		if (typeof vanillaValue !== 'number' && vanillaValue !== true) {
			this._relumiDiffCache[cacheKey] = result;
			return result;
		}
		if (typeof value !== 'number' && value !== true) {
			this._relumiDiffCache[cacheKey] = result;
			return result;
		}
		if (value === vanillaValue) {
			this._relumiDiffCache[cacheKey] = result;
			return result;
		}
		// Compute delta even when one side is `true` (always-hit flag). For the
		// "true" sentinel, there's no meaningful numeric delta, so use a unit +/- 1.
		if (value === true && vanillaValue !== true) {
			result = { vanilla: vanillaValue, delta: 1 };
		} else if (value !== true && vanillaValue === true) {
			result = { vanilla: vanillaValue, delta: -1 };
		} else if (typeof value === 'number' && typeof vanillaValue === 'number') {
			result = { vanilla: vanillaValue, delta: value - vanillaValue };
		}
		this._relumiDiffCache[cacheKey] = result;
		return result;
	}
	private getMoveChangeClass(moveId: ID, valueType: 'basePower' | 'accuracy', value: number | true) {
		const diff = this.getMoveDiff(moveId, valueType, value);
		if (!diff) return '';
		return diff.delta > 0 ? 'relumi-change-up' : 'relumi-change-down';
	}
	private isNewRelumiLearnset(moveId: ID): boolean {
		if (!this.shouldHighlightRelumiChanges()) return false;
		const typedSearch = this.props.search.typedSearch;
		if (!typedSearch?.species) return false;
		const currentSpeciesId = typedSearch.species;
		const relumiTable = this.getRelumiOverrides();
		if (!relumiTable?.learnsets) return false;
		const relumiLearnsets = relumiTable.learnsets;
		const vanillaLearnsets = (window as any).BattleTeambuilderTable?.learnsets;
		if (!vanillaLearnsets) return false;
		return this.canLearnInChain(currentSpeciesId, moveId, relumiLearnsets) &&
			!this.canLearnInChain(currentSpeciesId, moveId, vanillaLearnsets);
	}
	private canLearnInChain(
		speciesId: ID, moveId: ID, learnsets: any, visited: Record<string, true> = Object.create(null)
	): boolean {
		const learnsetid = this.getFirstLearnsetId(speciesId, learnsets);
		let cur: ID = learnsetid;
		while (cur) {
			if (visited[cur]) return false; // guard against chain cycles
			visited[cur] = true;
			const learnset = learnsets[cur];
			if (learnset && moveId in learnset) return true;
			cur = this.getNextLearnsetId(cur, speciesId, learnsets);
		}
		return false;
	}
	private getFirstLearnsetId(speciesId: ID, learnsets: any): ID {
		if (speciesId in learnsets) return speciesId;
		const species = this.props.search.dex.species.get(speciesId);
		if (!species?.exists) return '' as ID;
		let baseLearnsetid: ID = toID(species.baseSpecies);
		if (typeof species.battleOnly === 'string' && species.battleOnly !== species.baseSpecies) {
			baseLearnsetid = toID(species.battleOnly);
		}
		if (baseLearnsetid in learnsets) return baseLearnsetid;
		return '' as ID;
	}
	private getNextLearnsetId(learnsetid: ID, speciesId: ID, learnsets: any): ID {
		const lsetSpecies = this.props.search.dex.species.get(learnsetid);
		if (!lsetSpecies?.exists) return '' as ID;
		// Special cases for specific forms
		if (learnsetid === 'lycanrocdusk' || (speciesId === 'rockruff' && learnsetid === 'rockruff')) {
			return 'rockruffdusk' as ID;
		}
		if (lsetSpecies.id === 'gastrodoneast') return 'gastrodon' as ID;
		if (lsetSpecies.id === 'pumpkaboosuper') return 'pumpkaboo' as ID;
		if (lsetSpecies.id === 'sinisteaantique') return 'sinistea' as ID;
		if (lsetSpecies.id === 'tatsugiristretchy') return 'tatsugiri' as ID;
		const next = lsetSpecies.battleOnly || lsetSpecies.changesFrom || lsetSpecies.prevo;
		if (next) return toID(next);
		return '' as ID;
	}
	private getMoveFlagsTooltip(move: Dex.Move): string {
		if (!move?.flags) return '';
		const parts: string[] = [];
		if (move.flags.contact) parts.push('Contact');
		if (move.flags.slicing) parts.push('Slicing');
		if (move.flags.sound) parts.push('Sound');
		if (move.flags.punch) parts.push('Punch');
		if (move.flags.bite) parts.push('Bite');
		if (move.flags.pulse) parts.push('Pulse');
		if (move.flags.bullet) parts.push('Bullet');
		if (move.flags.powder) parts.push('Powder');
		if (move.flags.wind) parts.push('Wind');
		if (move.flags.dance) parts.push('Dance');
		if (move.flags.bypasssub) parts.push('Bypasses Sub');
		return parts.join(', ');
	}
	private parseMethodCode(methodCode: string): string | null {
		if (!methodCode) return null;
		// Handle pipe-delimited vanilla format: "genavail|L25,M"
		// Handle Relumi format: "9l25,9m,9e" (lowercase, prefixed with '9')
		let methods: string[];
		if (methodCode.includes('|')) {
			methods = methodCode.split('|')[1].split(',');
		} else if (/^\d/.test(methodCode)) {
			// Relumi format: "9l25,9m" → strip gen prefix, uppercase
			methods = methodCode.split(',').map(m => m.replace(/^\d+/, '').toUpperCase());
		} else {
			methods = methodCode.split(',');
		}
		const parts: string[] = [];
		for (const m of methods) {
			const levelMatch = m.match(/^L(\d+)$/);
			if (levelMatch) {
				const lvl = parseInt(levelMatch[1]);
				parts.push(lvl === 0 ? 'Lv1' : `Lv${levelMatch[1]}`);
			} else if (m === 'M') {
				parts.push('TM');
			} else if (m === 'T') {
				parts.push('Tutor');
			} else if (m === 'E') {
				parts.push('Egg');
			} else if (m === 'V') {
				parts.push('Event');
			}
		}
		return parts.length ? parts.join(' / ') : null;
	}

	private parseDescriptionTags(desc: string): preact.ComponentChild {
		if (!desc) return '';
		// [buff]text[/buff] → relumi-change-up, [nerf]text[/nerf] → relumi-change-down.
		// Match the old client's replace semantics: capture inner text and wrap it.
		const out: preact.ComponentChild[] = [];
		const regex = /\[(buff|nerf)\](.*?)\[\/\1\]/g;
		let lastIndex = 0;
		let match: RegExpExecArray | null;
		while ((match = regex.exec(desc)) !== null) {
			if (match.index > lastIndex) out.push(desc.slice(lastIndex, match.index));
			const tag = match[1];
			const inner = match[2];
			const cls = tag === 'buff' ? 'relumi-change-up' : 'relumi-change-down';
			out.push(<span class={cls}>{inner}</span>);
			lastIndex = match.index + match[0].length;
		}
		if (lastIndex < desc.length) out.push(desc.slice(lastIndex));
		return <>{out}</>;
	}

	renderPokemonSortRow() {
		const search = this.props.search;
		const sortCol = search.sortCol;
		return <li class="result"><div class="sortrow">
			<button class={`sortcol numsortcol${!sortCol ? ' cur' : ''}`}>{!sortCol ? 'Sort: ' : search.firstPokemonColumn}</button>
			<button class={`sortcol pnamesortcol${sortCol === 'name' ? ' cur' : ''}`} data-sort="name">Name</button>
			<button class={`sortcol typesortcol${sortCol === 'type' ? ' cur' : ''}`} data-sort="type">Types</button>
			<button class={`sortcol abilitysortcol${sortCol === 'ability' ? ' cur' : ''}`} data-sort="ability">Abilities</button>
			<button class={`sortcol statsortcol${sortCol === 'hp' ? ' cur' : ''}`} data-sort="hp">HP</button>
			<button class={`sortcol statsortcol${sortCol === 'atk' ? ' cur' : ''}`} data-sort="atk">Atk</button>
			<button class={`sortcol statsortcol${sortCol === 'def' ? ' cur' : ''}`} data-sort="def">Def</button>
			<button class={`sortcol statsortcol${sortCol === 'spa' ? ' cur' : ''}`} data-sort="spa">SpA</button>
			<button class={`sortcol statsortcol${sortCol === 'spd' ? ' cur' : ''}`} data-sort="spd">SpD</button>
			<button class={`sortcol statsortcol${sortCol === 'spe' ? ' cur' : ''}`} data-sort="spe">Spe</button>
			<button class={`sortcol statsortcol${sortCol === 'bst' ? ' cur' : ''}`} data-sort="bst">BST</button>
		</div></li>;
	}

	renderMoveSortRow() {
		const sortCol = this.props.search.sortCol;
		return <li class="result"><div class="sortrow">
			<button class={`sortcol movenamesortcol${sortCol === 'name' ? ' cur' : ''}`} data-sort="name">Name</button>
			<button class={`sortcol movetypesortcol${sortCol === 'type' ? ' cur' : ''}`} data-sort="type">Type</button>
			<button class={`sortcol movetypesortcol${sortCol === 'category' ? ' cur' : ''}`} data-sort="category">Cat</button>
			<button class={`sortcol powersortcol${sortCol === 'power' ? ' cur' : ''}`} data-sort="power">Pow</button>
			<button class={`sortcol accuracysortcol${sortCol === 'accuracy' ? ' cur' : ''}`} data-sort="accuracy">Acc</button>
			<button class={`sortcol ppsortcol${sortCol === 'pp' ? ' cur' : ''}`} data-sort="pp">PP</button>
		</div></li>;
	}

	renderPokemonRow(id: ID, matchStart: number, matchEnd: number, errorMessage?: preact.ComponentChildren) {
		const search = this.props.search;
		const pokemon = search.dex.species.get(id);
		if (!pokemon) return <li class="result">Unrecognized pokemon</li>;

		let tagStart = (pokemon.forme ? pokemon.name.length - pokemon.forme.length - 1 : 0);

		const stats = pokemon.baseStats;
		const hpClass = this.getStatClass(id, 'hp', stats.hp);
		const atkClass = this.getStatClass(id, 'atk', stats.atk);
		const defClass = this.getStatClass(id, 'def', stats.def);
		const spaClass = this.getStatClass(id, 'spa', stats.spa);
		const spdClass = this.getStatClass(id, 'spd', stats.spd);
		const speClass = this.getStatClass(id, 'spe', stats.spe);
		const hpDiff = this.getStatDiff(id, 'hp', stats.hp);
		const atkDiff = this.getStatDiff(id, 'atk', stats.atk);
		const defDiff = this.getStatDiff(id, 'def', stats.def);
		const spaDiff = this.getStatDiff(id, 'spa', stats.spa);
		const spdDiff = this.getStatDiff(id, 'spd', stats.spd);
		const speDiff = this.getStatDiff(id, 'spe', stats.spe);
		const ability0NewClass = this.isNewRelumiAbility(id, pokemon.abilities['0']) ?
			'relumi-change-up' : '';
		const ability1NewClass = pokemon.abilities['1'] &&
			this.isNewRelumiAbility(id, pokemon.abilities['1']) ? 'relumi-change-up' : '';
		const hiddenAbilityNewClass = pokemon.abilities['H'] &&
			this.isNewRelumiAbility(id, pokemon.abilities['H']) ? 'relumi-change-up' : '';
		const specialAbilityNewClass = pokemon.abilities['S'] &&
			this.isNewRelumiAbility(id, pokemon.abilities['S']) ? 'relumi-change-up' : '';
		let bst = 0;
		for (const stat of Object.values(stats)) bst += stat;
		if (search.dex.gen < 2) bst -= stats['spd'];
		const bstClass = this.getBSTClass(id, bst);
		const bstDiff = this.getBSTDiff(id, bst);
		const fmtStatTitle = (diff: { vanilla: number, delta: number } | null) =>
			diff ? `Vanilla: ${diff.vanilla} → ${diff.delta + diff.vanilla} (${diff.delta > 0 ? '+' : ''}${diff.delta})` : '';
		const fmtBSTTitle = bstDiff ?
			`Vanilla BST: ${bstDiff.vanilla} → ${bst} (${bstDiff.delta > 0 ? '+' : ''}${bstDiff.delta})` :
			'';

		if (errorMessage) {
			return <li class="result"><a
				href={`${this.URL_ROOT}pokemon/${id}`} class={id === this.speciesId ? 'cur' : ''}
				data-target="push" data-entry={`pokemon|${pokemon.name}`}
			>
				<span class="col numcol">{search.getTier(pokemon)}</span>

				<span class="col iconcol">
					<span class="pixelated" style={Dex.getPokemonIcon(pokemon.id)}></span>
				</span>

				<span class="col pokemonnamecol">{this.renderName(pokemon.name, matchStart, matchEnd, tagStart)}</span>

				{errorMessage}
			</a></li>;
		}

		return <li class="result">
			<a
				href={`${this.URL_ROOT}pokemon/${id}`} class={id === this.speciesId ? 'cur' : ''}
				data-target="push" data-entry={`pokemon|${pokemon.name}`}
			>
				<span class="col numcol">{search.getTier(pokemon)}</span>

				<span class="col iconcol">
					<span class="pixelated" style={Dex.getPokemonIcon(pokemon.id)}></span>
				</span>

				<span class="col pokemonnamecol">{this.renderName(pokemon.name, matchStart, matchEnd, tagStart)}</span>

				<span class="col typecol">
					{pokemon.types.map(type =>
						<img src={`${Dex.resourcePrefix}sprites/types/${type}.png`} alt={type} height="14" width="32" class="pixelated" />
					)}
				</span>

				{search.dex.gen >= 3 && (
					pokemon.abilities['1'] ? (
						<span class="col twoabilitycol">
							<span class={ability0NewClass}>{pokemon.abilities['0']}</span><br />
							<span class={ability1NewClass}>{pokemon.abilities['1']}</span>
						</span>
					) : (
						<span class="col abilitycol"><span class={ability0NewClass}>{pokemon.abilities['0']}</span></span>
					)
				)}
				{search.dex.gen >= 5 && (
					pokemon.abilities['S'] ? (
						<span class={`col twoabilitycol${pokemon.unreleasedHidden ? ' unreleasedhacol' : ''}`}>
							<span class={hiddenAbilityNewClass}>{pokemon.abilities['H'] || ''}</span><br />
							<span class={specialAbilityNewClass}>{pokemon.abilities['S']}</span>
						</span>
					) : pokemon.abilities['H'] ? (
						<span class={`col abilitycol${pokemon.unreleasedHidden ? ' unreleasedhacol' : ''}`}>
							<span class={hiddenAbilityNewClass}>{pokemon.abilities['H']}</span>
						</span>
					) : (
						<span class="col abilitycol"></span>
					)
				)}

				<span class="col statcol" title={fmtStatTitle(hpDiff)}><em>HP</em><br /><span class={hpClass}>{stats.hp}</span></span>
				<span class="col statcol" title={fmtStatTitle(atkDiff)}>
					<em>Atk</em><br /><span class={atkClass}>{stats.atk}</span>
				</span>
				<span class="col statcol" title={fmtStatTitle(defDiff)}>
					<em>Def</em><br /><span class={defClass}>{stats.def}</span>
				</span>
				{search.dex.gen >= 2 && <span class="col statcol" title={fmtStatTitle(spaDiff)}>
					<em>SpA</em><br /><span class={spaClass}>{stats.spa}</span>
				</span>}
				{search.dex.gen >= 2 && <span class="col statcol" title={fmtStatTitle(spdDiff)}>
					<em>SpD</em><br /><span class={spdClass}>{stats.spd}</span>
				</span>}
				{search.dex.gen < 2 && <span class="col statcol" title={fmtStatTitle(spaDiff)}>
					<em>Spc</em><br /><span class={spaClass}>{stats.spa}</span>
				</span>}
				<span class="col statcol" title={fmtStatTitle(speDiff)}>
					<em>Spe</em><br /><span class={speClass}>{stats.spe}</span>
				</span>
				<span class={`col bstcol ${bstClass}`} title={fmtBSTTitle}>
					<em>BST<br />{bst}</em>
				</span>
			</a>
		</li>;
	}

	renderName(name: string, matchStart: number, matchEnd: number, tagStart?: number) {
		if (name === 'No Ability') return <i>(no ability)</i>;

		if (!matchEnd) {
			if (!tagStart) return name;
			return [
				name.slice(0, tagStart), <small>{name.slice(tagStart)}</small>,
			];
		}

		let output: preact.ComponentChild[] = [
			name.slice(0, matchStart),
			<b>{name.slice(matchStart, matchEnd)}</b>,
			name.slice(matchEnd, tagStart || name.length),
		];
		if (!tagStart) return output;

		if (matchEnd && matchEnd > tagStart) {
			if (matchStart < tagStart) {
				matchStart = tagStart;
			}
			output.push(
				<small>{name.slice(matchEnd)}</small>
			);
		} else {
			output.push(<small>{name.slice(tagStart)}</small>);
		}

		return output;
	}

	renderItemRow(id: ID, matchStart: number, matchEnd: number, errorMessage?: preact.ComponentChildren) {
		const search = this.props.search;
		const item = search.dex.items.get(id);
		if (!item) return <li class="result">Unrecognized item</li>;

		return <li class="result"><a
			href={`${this.URL_ROOT}items/${id}`} class={id === this.itemId ? 'cur' : ''}
			data-target="push" data-entry={`item|${item.name}`}
		>
			<span class="col itemiconcol">
				<span class="pixelated" style={Dex.getItemIcon(item)}></span>
			</span>

			<span class="col namecol">{id ? this.renderName(item.name, matchStart, matchEnd) : <i>(no item)</i>}</span>

			{!!id && errorMessage}

			{!errorMessage && <span class="col itemdesccol">{item.shortDesc}</span>}
		</a></li>;
	}

	renderAbilityRow(id: ID, matchStart: number, matchEnd: number, errorMessage?: preact.ComponentChildren) {
		const search = this.props.search;
		const ability = search.dex.abilities.get(id);
		if (!ability) return <li class="result">Unrecognized ability</li>;

		return <li class="result">
			<a
				href={`${this.URL_ROOT}abilities/${id}`} class={id === this.abilityId ? 'cur' : ''}
				data-target="push" data-entry={`ability|${ability.name}`}
			>
				<span class="col namecol">{id ? this.renderName(ability.name, matchStart, matchEnd) : <i>(no ability)</i>}</span>

				{errorMessage}

				{!errorMessage && <span class="col abilitydesccol">{this.parseDescriptionTags(ability.shortDesc)}</span>}
			</a>
		</li>;
	}

	renderMoveRow(id: ID, matchStart: number, matchEnd: number, errorMessage?: preact.ComponentChildren) {
		let slot = null;
		if (id.startsWith('_')) {
			[slot, id] = id.slice(1).split('_') as [string, ID];
			if (!id) {
				return <li class="result"><a
					href={`${this.URL_ROOT}moves/`} class="cur"
					data-target="push" data-entry={`move||${slot}`}
				>
					<span class="col movenamecol"><i>(slot {slot} empty)</i></span>
				</a></li>;
			}
		}

		const search = this.props.search;
		const move = search.dex.moves.get(id);
		const entry = slot ? `move|${move.name}|${slot}` : `move|${move.name}`;
		if (!move) return <li class="result">Unrecognized move</li>;

		const tagStart = (move.name.startsWith('Hidden Power') ? 12 : 0);

		if (errorMessage) {
			return <li class="result"><a
				href={`${this.URL_ROOT}moves/${id}`} class={this.moveIds.includes(id) ? 'cur' : ''}
				data-target="push" data-entry={entry}
			>
				<span class="col movenamecol">{this.renderName(move.name, matchStart, matchEnd, tagStart)}</span>

				{errorMessage}
			</a></li>;
		}

		let pp = (move.pp === 1 || move.noPPBoosts ? move.pp : move.pp * 8 / 5);
		if (search.dex.gen < 3) pp = Math.min(61, pp);
		if (search.dex.modid === 'champions') {
			pp = move.pp > 20 ? 20 : move.pp;
			if (!move.noPPBoosts) pp = (pp / 5 + 1) * 4;
		}
		const movePowerClass = this.getMoveChangeClass(id, 'basePower', move.basePower);
		const moveAccuracyClass = this.getMoveChangeClass(id, 'accuracy', move.accuracy);
		const movePowerDiff = this.getMoveDiff(id, 'basePower', move.basePower);
		const moveAccuracyDiff = this.getMoveDiff(id, 'accuracy', move.accuracy);
		const isNewLearnset = this.isNewRelumiLearnset(id);
		const moveNameClass = isNewLearnset ? 'relumi-change-up' : '';
		const flagsTooltip = this.getMoveFlagsTooltip(move);
		const typedSearch = this.props.search.typedSearch;
		const speciesId = typedSearch?.species || '' as ID;
		let methodCode = '';
		const showLearnsetMethods = Dex.prefs('relumiShowLearnsetMethods') !== false;
		if (speciesId && showLearnsetMethods) {
			const isRelumi = this.props.search.dex.modid === 'gen8relumi' ||
				(this.props.search.typedSearch?.format || '').includes('relumi');
			const table = isRelumi
				? (window as any).BattleTeambuilderTable?.gen8relumi
				: (window as any).BattleTeambuilderTable;
			const rawLearnsets = table?.learnsets;
			if (rawLearnsets) {
				// Walk the learnset chain (like canLearnInChain) so egg moves
				// show for evolved Pokémon, not just the base form.
				let cur: ID = this.getFirstLearnsetId(speciesId, rawLearnsets);
				const visited: Record<string, true> = Object.create(null);
				while (cur) {
					if (visited[cur]) break;
					visited[cur] = true;
					const entry = rawLearnsets[cur]?.[id];
					if (entry) {
						methodCode = entry;
						break;
					}
					cur = this.getNextLearnsetId(cur, speciesId, rawLearnsets);
				}
			}
		}
		const method = this.parseMethodCode(methodCode);
		const fmtValue = (v: number | true) => v === true ? 'always' : String(v);
		type MoveDiff = { vanilla: number | true, delta: number };
		const fmtMoveTitle = (label: string, diff: MoveDiff | null, current: number | true) => {
			if (!diff) return '';
			const sign = diff.delta > 0 ? '+' : '';
			return `Vanilla ${label}: ${fmtValue(diff.vanilla)} → ${fmtValue(current)} (${sign}${diff.delta})`;
		};
		return <li class="result"><a
			href={`${this.URL_ROOT}moves/${id}`} class={this.moveIds.includes(id) ? 'cur' : ''}
			data-target="push" data-entry={entry}
		>
			<span class="col movenamecol">
				<span
					class={`${moveNameClass}${flagsTooltip ? ' has-move-flags' : ''}`}
					title={flagsTooltip || undefined}
				>{this.renderName(move.name, matchStart, matchEnd, tagStart)}</span>
				{method && <span class="move-method-badge">{method}</span>}
			</span>

			<span class="col typecol">
				<img
					src={`${Dex.resourcePrefix}sprites/types/${encodeURIComponent(move.type)}.png`}
					alt={move.type} height="14" width="32" class="pixelated"
				/>
				<img
					src={`${Dex.resourcePrefix}sprites/categories/${move.category}.png`}
					alt={move.category} height="14" width="32" class="pixelated"
				/>
			</span>

			<span class="col labelcol" title={fmtMoveTitle('Power', movePowerDiff, move.basePower)}>
				{move.category !== 'Status' ? [
					<em>Power</em>, <br />, <span class={movePowerClass}>{move.basePower || '\u2014'}</span>,
				] : ''}
			</span>
			<span class="col widelabelcol" title={fmtMoveTitle('Accuracy', moveAccuracyDiff, move.accuracy)}>
				<em>Accuracy</em><br />
				<span class={moveAccuracyClass}>
					{move.accuracy && move.accuracy !== true ? `${move.accuracy}%` : '\u2014'}
				</span>
			</span>
			<span class="col pplabelcol">
				<em>PP</em><br />{pp}
			</span>

			<span class="col movedesccol">{this.parseDescriptionTags(move.shortDesc)}</span>

		</a></li>;
	}

	renderTypeRow(id: ID, matchStart: number, matchEnd: number, errorMessage?: preact.ComponentChildren) {
		const name = id.charAt(0).toUpperCase() + id.slice(1);

		return <li class="result"><a href={`${this.URL_ROOT}types/${id}`} data-target="push" data-entry={`type|${name}`}>
			<span class="col namecol">{this.renderName(name, matchStart, matchEnd)}</span>

			<span class="col typecol">
				<img
					src={`${Dex.resourcePrefix}sprites/types/${encodeURIComponent(name)}.png`}
					alt={name} height="14" width="32" class="pixelated"
				/>
			</span>

			{errorMessage}
		</a></li>;
	}

	renderCategoryRow(id: ID, matchStart: number, matchEnd: number, errorMessage?: preact.ComponentChildren) {
		const name = id.charAt(0).toUpperCase() + id.slice(1);

		return <li class="result">
			<a href={`${this.URL_ROOT}categories/${id}`} data-target="push" data-entry={`category|${name}`}>
				<span class="col namecol">{this.renderName(name, matchStart, matchEnd)}</span>

				<span class="col typecol">
					<img src={`${Dex.resourcePrefix}sprites/categories/${name}.png`} alt={name} height="14" width="32" class="pixelated" />
				</span>

				{errorMessage}
			</a>
		</li>;
	}

	renderFlagRow(id: ID, matchStart: number, matchEnd: number, errorMessage?: preact.ComponentChildren) {
		const name = id.charAt(0).toUpperCase() + id.slice(1);
		return <li class="result">
			<a href="#" data-target="push" data-entry={`flag|${id}`}>
				<span class="col namecol">{this.renderName(name, matchStart, matchEnd)}</span>
				<span class="col movedesccol">(flag)</span>
				{errorMessage}
			</a>
		</li>;
	}

	renderArticleRow(id: ID, matchStart: number, matchEnd: number, errorMessage?: preact.ComponentChildren) {
		const isSearchType = (id === 'pokemon' || id === 'moves');
		const name = window.BattleArticleTitles?.[id] || (id.charAt(0).toUpperCase() + id.substr(1));

		return <li class="result"><a href={`${this.URL_ROOT}articles/${id}`} data-target="push" data-entry={`article|${name}`}>
			<span class="col namecol">{this.renderName(name, matchStart, matchEnd)}</span>

			<span class="col movedesccol">{isSearchType ? "(search type)" : "(article)"}</span>

			{errorMessage}
		</a></li>;
	}

	renderEggGroupRow(id: ID, matchStart: number, matchEnd: number, errorMessage?: preact.ComponentChildren) {
		// very hardcode
		let name: string | undefined;
		if (id === 'humanlike') name = 'Human-Like';
		else if (id === 'water1') name = 'Water 1';
		else if (id === 'water2') name = 'Water 2';
		else if (id === 'water3') name = 'Water 3';
		if (name) {
			if (matchEnd > 5) matchEnd++;
		} else {
			name = id.charAt(0).toUpperCase() + id.slice(1);
		}

		return <li class="result">
			<a href={`${this.URL_ROOT}egggroups/${id}`} data-target="push" data-entry={`egggroup|${name}`}>
				<span class="col namecol">{this.renderName(name, matchStart, matchEnd)}</span>

				<span class="col movedesccol">(egg group)</span>

				{errorMessage}
			</a>
		</li>;
	}

	renderTierRow(id: ID, matchStart: number, matchEnd: number, errorMessage?: preact.ComponentChildren) {
		// very hardcode
		const tierTable: { [id: string]: string } = {
			uber: "Uber",
			caplc: "CAP LC",
			capnfe: "CAP NFE",
		};
		const name = tierTable[id] || id.toUpperCase();

		return <li class="result"><a href={`${this.URL_ROOT}tiers/${id}`} data-target="push" data-entry={`tier|${name}`}>
			<span class="col namecol">{this.renderName(name, matchStart, matchEnd)}</span>

			<span class="col movedesccol">(tier)</span>

			{errorMessage}
		</a></li>;
	}

	renderRow(row: SearchRow) {
		const search = this.props.search;
		const [type, id] = row;
		let matchStart = 0;
		let matchEnd = 0;
		if (row.length > 3) {
			matchStart = row[2]!;
			matchEnd = row[3]!;
		}

		let errorMessage: preact.ComponentChild = null;
		let label;
		if ((label = search.filterLabel(type))) {
			errorMessage = <span class="col filtercol"><em>{label}</em></span>;
		} else if ((label = search.illegalLabel(id as ID))) {
			errorMessage = <span class="col illegalcol"><em>{label}</em></span>;
		}

		switch (type) {
		case 'html':
			const sanitizedHTML = id.replace(/</g, '&lt;')
				.replace(/&lt;em>/g, '<em>').replace(/&lt;\/em>/g, '</em>')
				.replace(/&lt;strong>/g, '<strong>').replace(/&lt;\/strong>/g, '</strong>');
			return <li class="result">
				<p dangerouslySetInnerHTML={{ __html: sanitizedHTML }}></p>
			</li>;
		case 'header':
			return <li class="result"><h3>{id}</h3></li>;
		case 'sortpokemon':
			return this.renderPokemonSortRow();
		case 'sortmove':
			return this.renderMoveSortRow();
		case 'pokemon':
			return this.renderPokemonRow(id, matchStart, matchEnd, errorMessage);
		case 'move':
			return this.renderMoveRow(id, matchStart, matchEnd, errorMessage);
		case 'item':
			return this.renderItemRow(id, matchStart, matchEnd, errorMessage);
		case 'ability':
			return this.renderAbilityRow(id, matchStart, matchEnd, errorMessage);
		case 'type':
			return this.renderTypeRow(id, matchStart, matchEnd, errorMessage);
		case 'egggroup':
			return this.renderEggGroupRow(id, matchStart, matchEnd, errorMessage);
		case 'tier':
			return this.renderTierRow(id, matchStart, matchEnd, errorMessage);
		case 'category':
			return this.renderCategoryRow(id, matchStart, matchEnd, errorMessage);
		case 'article':
			return this.renderArticleRow(id, matchStart, matchEnd, errorMessage);
		case 'flag':
			return this.renderFlagRow(id, matchStart, matchEnd, errorMessage);
		}
		return <li>Error: not found</li>;
	}
	static renderFilters(search: DexSearch, showHints?: boolean) {
		return search.filters && <li class="dexlist-filters">
			{showHints && "Filters: "}
			{search.filters.map(([type, name]) =>
				<button class="filter" data-filter={`${type}:${name}`}>
					{name} <i class="fa fa-times-circle" aria-hidden></i>
				</button>
			)}
			{!search.query && showHints && <small style="color: #888">(backspace = delete filter)</small>}
		</li>;
	}
	handleClick = (ev: Event) => {
		const search = this.props.search;
		let target = ev.target as HTMLElement | null;
		while (target && target.className !== 'dexlist') {
			if (target.tagName === 'A') {
				const entry = target.getAttribute('data-entry');
				if (entry) {
					const [type, name, slot] = entry.split('|');
					if (search.addFilter([type, name])) {
						if (this.props.onSelect) {
							this.props.onSelect?.('', '');
						} else if (search.query) {
							search.find('');
							this.forceUpdate();
						}
					} else {
						this.props.onSelect?.(type as SearchType, name, slot);
					}
					ev.preventDefault();
					ev.stopImmediatePropagation();
					break;
				}
			}
			if (target.tagName === 'BUTTON') {
				const filter = target.getAttribute('data-filter');
				if (filter) {
					search.removeFilter(filter.split(':') as any);
					search.find('');
					ev.preventDefault();
					ev.stopPropagation();
					this.props.onSelect?.(null, '');
					break;
				}

				// sort
				const sort = target.getAttribute('data-sort');
				if (sort) {
					search.toggleSort(sort);
					search.find('');
					ev.preventDefault();
					ev.stopPropagation();
					this.props.onSelect?.(null, '');
					break;
				}
			}

			target = target.parentElement;
		}
	};

	override componentDidUpdate() {
		if (this.props.resultIndex !== undefined) {
			this.base!.children[this.resultIndex + 1]?.children[0]?.classList.remove('hover');
			this.resultIndex = this.props.resultIndex;
			this.base!.children[this.resultIndex + 1]?.children[0]?.classList.add('hover');
		}
	}
	override componentDidMount() {
		this.componentDidUpdate();
	}
	override render() {
		const search = this.props.search;

		// Invalidate per-search memos so Relumi diff lookups don't return stale
		// data when the search dex or current species changes between renders.
		this._relumiDiffCache = Object.create(null);
		this._relumiHighlightCached = undefined;

		const set = search.typedSearch?.set;
		if (set) {
			this.speciesId = toID(set.species);
			this.itemId = toID(set.item);
			this.abilityId = toID(set.ability);
			this.moveIds = set.moves.map(toID);
		}

		let results = search.results;
		if (this.props.windowing) results = results?.slice(0, this.props.windowing) || null;

		return <ul
			class="dexlist" style={`min-height: ${(1 + (search.results?.length || 1)) * 33}px;`} onClick={this.handleClick}
		>
			{(!this.props.hideFilters && PSSearchResults.renderFilters(search, true)) || <li></li>}
			{results?.map(result => this.renderRow(result))}
		</ul>;
	}
}
