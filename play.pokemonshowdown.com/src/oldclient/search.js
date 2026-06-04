/**
 * Search
 *
 * Basically just an improved version of utilichart
 *
 * Dependencies: jQuery, battledata, search-index
 * Optional dependencies: pokedex, moves, items, abilities
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 */

(function (exports, $) {
	'use strict';

	function Search(elem, viewport) {
		this.$el = $(elem);
		this.el = this.$el[0];
		this.$viewport = (viewport ? $(viewport) : $(window));

		this.urlRoot = '';
		this.q = undefined; // uninitialized
		this.exactMatch = false;

		this.resultSet = null;
		this.filters = null;
		this.sortCol = null;
		this.renderedIndex = 0;
		this.renderingDone = true;
		this.externalFilter = false;
		this.cur = {};
		this.$inputEl = null;
		this.gen = 9;
		this.mod = null;

		this.engine = new DexSearch();
		window.search = this;

		var self = this;
		this.$el.on('click', '.more button', function (e) {
			e.preventDefault();
			self.updateScroll(true);
		});
		this.$el.on('click', '.filter', function (e) {
			e.preventDefault();
			self.removeFilter(e);
			if (self.$inputEl) self.$inputEl.focus();
		});
		this.$el.on('click', '.sortcol', function (e) {
			e.preventDefault();
			e.stopPropagation();
			var sortCol = e.currentTarget.dataset.sort;
			self.engine.toggleSort(sortCol);
			self.sortCol = self.engine.sortCol;
			self.find('');
		});
	}

	Search.prototype.$ = function (query) {
		return this.$el.find(query);
	};

	//
	// Search functions
	//

	Search.prototype.find = function (query, firstElem) {
		if (!this.engine.find(query)) return; // nothing changed

		this.exactMatch = this.engine.exactMatch;
		this.q = this.engine.query;
		this.resultSet = this.engine.results;
		if (firstElem) {
			this.resultSet = [[this.engine.typedSearch.searchType, firstElem]].concat(this.resultSet);
			if (this.resultSet.length > 1 && ['sortpokemon', 'sortmove'].includes(this.resultSet[1][0])) {
				var sortRow = this.resultSet[1];
				this.resultSet[1] = this.resultSet[0];
				this.resultSet[0] = sortRow;
			}
		}
		if (this.filters) {
			this.resultSet = [['html', this.getFilterText()]].concat(this.resultSet);
		}

		this.renderedIndex = 0;
		this.renderingDone = false;
		this.updateScroll();
		return true;
	};
	Search.prototype.addFilter = function (node) {
		if (!node.dataset.entry) return false;
		var entry = node.dataset.entry.split('|');
		var result = this.engine.addFilter(entry);
		this.filters = this.engine.filters;
		return result;
	};
	Search.prototype.removeFilter = function (e) {
		var result;
		if (e) {
			result = this.engine.removeFilter(e.currentTarget.value.split(':'));
		} else {
			result = this.engine.removeFilter();
		}
		this.filters = this.engine.filters;
		this.find('');
		return result;
	};
	Search.prototype.getFilterText = function (q) {
		var buf = '<p>Filters: ';
		for (var i = 0; i < this.filters.length; i++) {
			var text = this.filters[i][1];
			if (this.filters[i][0] === 'move') text = Dex.moves.get(text).name;
			if (this.filters[i][0] === 'pokemon') text = Dex.species.get(text).name;
			buf += '<button class="filter" value="' + BattleLog.escapeHTML(this.filters[i].join(':')) + '">' + text + ' <i class="fa fa-times-circle"></i></button> ';
		}
		if (!q) buf += '<small style="color: #888">(backspace = delete filter)</small>';
		return buf + '</p>';
	};
	Search.prototype.updateScroll = function (forceAdd) {
		if (this.renderingDone) return;
		var top = this.$viewport.scrollTop();
		var bottom = top + this.$viewport.height();
		var windowHeight = $(window).height();
		var i = this.renderedIndex;
		var finalIndex = Math.floor(bottom / 33) + 1;
		if (!forceAdd && finalIndex <= i) return;
		if (finalIndex < i + 20) finalIndex = i + 20;
		if (bottom - top > windowHeight && !i) finalIndex = 20;
		if (forceAdd && finalIndex > i + 40) finalIndex = i + 40;

		var resultSet = this.resultSet;
		var buf = '';
		while (i < finalIndex) {
			if (!resultSet[i]) {
				this.renderingDone = true;
				break;
			}
			var row = resultSet[i];

			var errorMessage = '';
			var label;
			if ((label = this.engine.filterLabel(row[0]))) {
				errorMessage = '<span class="col filtercol"><em>' + label + '</em></span>';
			} else if ((label = this.engine.illegalLabel(row[1]))) {
				errorMessage = '<span class="col illegalcol"><em>' + label + '</em></span>';
			}

			var mStart = 0;
			var mEnd = 0;
			if (row.length > 3) {
				mStart = row[2];
				mEnd = row[3];
			}
			buf += this.renderRow(row[1], row[0], mStart, mEnd, errorMessage, row[1] in this.cur ? ' class="cur"' : '');

			i++;
		}

		// misbehaving ad
		buf = buf.replace(/>Download</g, '>Down<!-- -->load<');

		if (!this.renderedIndex) {
			this.el.innerHTML = '<ul class="utilichart" style="height:' + (resultSet.length * 33) + 'px">' + buf + (!this.renderingDone ? '<li class="result more"><p><button class="button big">More</button></p></li>' : '') + '</ul>';
			this.moreVisible = true;
		} else {
			if (this.moreVisible) {
				this.$el.find('.more').remove();
				if (!forceAdd) this.moreVisible = false;
			}
			$(this.el.firstChild).append(buf + (forceAdd && !this.renderingDone ? '<li class="result more"><p><button class="button big">More</button></p></li>' : ''));
		}
		this.renderedIndex = i;
	};
	Search.prototype.setType = function (qType, format, set, cur) {
		this.engine.setType(qType, format, set);
		this.filters = this.engine.filters;
		this.sortCol = this.engine.sortCol;
		this.cur = cur || {};
		var firstElem;
		for (var id in cur) {
			firstElem = id;
			break;
		}
		this.find('', firstElem);
	};

	/*********************************************************
	 * Rendering functions
	 *********************************************************/

	// These all have static versions

	Search.prototype.renderRow = function (id, type, matchStart, matchLength, errorMessage, attrs) {
		// errorMessage = '<span class="col illegalcol"><em>' + errorMessage + '</em></span>';
		switch (type) {
		case 'html':
			return '<li class="result">' + id + '</li>';
		case 'header':
			return '<li class="result"><h3>' + id + '</h3></li>';
		case 'sortpokemon':
			return this.renderPokemonSortRow();
		case 'sortmove':
			return this.renderMoveSortRow();
		case 'pokemon':
			var pokemon = this.engine.dex.species.get(id);
			return this.renderPokemonRow(pokemon, matchStart, matchLength, errorMessage, attrs);
		case 'move':
			var move = this.engine.dex.moves.get(id);
			return this.renderMoveRow(move, matchStart, matchLength, errorMessage, attrs);
		case 'item':
			var item = this.engine.dex.items.get(id);
			return this.renderItemRow(item, matchStart, matchLength, errorMessage, attrs);
		case 'ability':
			var ability = this.engine.dex.abilities.get(id);
			return this.renderAbilityRow(ability, matchStart, matchLength, errorMessage, attrs);
		case 'type':
			var type = { name: id[0].toUpperCase() + id.substr(1) };
			return this.renderTypeRow(type, matchStart, matchLength, errorMessage);
		case 'egggroup':
			// very hardcode
			var egName;
			if (id === 'humanlike') egName = 'Human-Like';
			else if (id === 'water1') egName = 'Water 1';
			else if (id === 'water2') egName = 'Water 2';
			else if (id === 'water3') egName = 'Water 3';
			if (egName) {
				if (matchLength > 5) matchLength++;
			} else {
				egName = id[0].toUpperCase() + id.substr(1);
			}
			var egggroup = { name: egName };
			return this.renderEggGroupRow(egggroup, matchStart, matchLength, errorMessage);
		case 'tier':
			// very hardcode
			var tierTable = {
				uber: "Uber",
				ou: "OU",
				uu: "UU",
				ru: "RU",
				nu: "NU",
				pu: "PU",
				zu: "ZU",
				nfe: "NFE",
				lc: "LC",
				cap: "CAP",
				caplc: "CAP LC",
				capnfe: "CAP NFE",
				uubl: "UUBL",
				rubl: "RUBL",
				nubl: "NUBL",
				publ: "PUBL",
				zubl: "ZUBL"
			};
			var tier = { name: tierTable[id] };
			return this.renderTierRow(tier, matchStart, matchLength, errorMessage);
		case 'category':
			var category = { name: id[0].toUpperCase() + id.substr(1), id: id };
			return this.renderCategoryRow(category, matchStart, matchLength, errorMessage);
		case 'article':
			var articleTitle = (window.BattleArticleTitles && BattleArticleTitles[id]) || (id[0].toUpperCase() + id.substr(1));
			var article = { name: articleTitle, id: id };
			return this.renderArticleRow(article, matchStart, matchLength, errorMessage);
		}
		return 'Error: not found';
	};
	Search.prototype.renderPokemonSortRow = function () {
		var buf = '<li class="result"><div class="sortrow">';
		buf += '<button class="sortcol numsortcol' + (!this.sortCol ? ' cur' : '') + '">' + (!this.sortCol ? 'Sort: ' : this.engine.firstPokemonColumn) + '</button>';
		buf += '<button class="sortcol pnamesortcol' + (this.sortCol === 'name' ? ' cur' : '') + '" data-sort="name">Name</button>';
		buf += '<button class="sortcol typesortcol' + (this.sortCol === 'type' ? ' cur' : '') + '" data-sort="type">Types</button>';
		buf += '<button class="sortcol abilitysortcol' + (this.sortCol === 'ability' ? ' cur' : '') + '" data-sort="ability">Abilities</button>';
		buf += '<button class="sortcol statsortcol' + (this.sortCol === 'hp' ? ' cur' : '') + '" data-sort="hp">HP</button>';
		buf += '<button class="sortcol statsortcol' + (this.sortCol === 'atk' ? ' cur' : '') + '" data-sort="atk">Atk</button>';
		buf += '<button class="sortcol statsortcol' + (this.sortCol === 'def' ? ' cur' : '') + '" data-sort="def">Def</button>';
		if (this.engine.dex.gen >= 2) {
			buf += '<button class="sortcol statsortcol' + (this.sortCol === 'spa' ? ' cur' : '') + '" data-sort="spa">SpA</button>';
			buf += '<button class="sortcol statsortcol' + (this.sortCol === 'spd' ? ' cur' : '') + '" data-sort="spd">SpD</button>';
		} else {
			buf += '<button class="sortcol statsortcol' + (this.sortCol === 'spa' ? ' cur' : '') + '" data-sort="spa">Spc</button>';
		}
		buf += '<button class="sortcol statsortcol' + (this.sortCol === 'spe' ? ' cur' : '') + '" data-sort="spe">Spe</button>';
		buf += '<button class="sortcol statsortcol' + (this.sortCol === 'bst' ? ' cur' : '') + '" data-sort="bst">BST</button>';
		buf += '</div></li>';
		return buf;
	};
	Search.prototype.renderMoveSortRow = function () {
		var buf = '<li class="result"><div class="sortrow">';
		buf += '<button class="sortcol movenamesortcol' + (this.sortCol === 'name' ? ' cur' : '') + '" data-sort="name">Name</button>';
		buf += '<button class="sortcol movetypesortcol' + (this.sortCol === 'type' ? ' cur' : '') + '" data-sort="type">Type</button>';
		buf += '<button class="sortcol movetypesortcol' + (this.sortCol === 'category' ? ' cur' : '') + '" data-sort="category">Cat</button>';
		buf += '<button class="sortcol powersortcol' + (this.sortCol === 'power' ? ' cur' : '') + '" data-sort="power">Pow</button>';
		buf += '<button class="sortcol accuracysortcol' + (this.sortCol === 'accuracy' ? ' cur' : '') + '" data-sort="accuracy">Acc</button>';
		buf += '<button class="sortcol ppsortcol' + (this.sortCol === 'pp' ? ' cur' : '') + '" data-sort="pp">PP</button>';
		buf += '</div></li>';
		return buf;
	};
	Search.prototype.getRelumiOverrides = function () {
		var table = window.BattleTeambuilderTable;
		return (table && table.gen8relumi) || null;
	};
	Search.prototype.getVanillaSpeciesData = function (speciesId) {
		var relumiTable = this.getRelumiOverrides();
		if (relumiTable && relumiTable.vanillaSpeciesData && relumiTable.vanillaSpeciesData[speciesId]) {
			return relumiTable.vanillaSpeciesData[speciesId];
		}
		// Species with override data but no vanillaSpeciesData entry are custom forms
		// — Dex.forGen would return the mod-added BattlePokedex entry, not true vanilla data.
		if (relumiTable && relumiTable.overrideSpeciesData && speciesId in relumiTable.overrideSpeciesData) {
			return null;
		}
		var vanillaSpecies = Dex.forGen(9).species.get(speciesId);
		if (!vanillaSpecies || !vanillaSpecies.exists) return null;
		return vanillaSpecies;
	};
	Search.prototype.getVanillaMoveData = function (moveId) {
		var relumiTable = this.getRelumiOverrides();
		if (relumiTable && relumiTable.vanillaMoveData && relumiTable.vanillaMoveData[moveId]) {
			return relumiTable.vanillaMoveData[moveId];
		}
		var vanillaMove = Dex.forGen(9).moves.get(moveId);
		if (!vanillaMove || !vanillaMove.exists) return null;
		return vanillaMove;
	};
	Search.prototype.shouldHighlightRelumiChanges = function () {
		if (Dex.prefs('relumiHighlightBalanceChanges') === false) return false;

		if (this.engine && this.engine.dex && this.engine.dex.modid === 'gen8relumi') {
			return true;
		}

		var typedSearch = this.engine && this.engine.typedSearch;
		var format = typedSearch && typedSearch.format;
		return (typeof format === 'string' && format.indexOf('gen8relumi') >= 0);
	};
	Search.prototype.getRelumiDiffSourceSpeciesId = function (speciesId) {
		var relumiTable = this.getRelumiOverrides();
		if (!relumiTable || !relumiTable.overrideSpeciesData) return speciesId;
		if (relumiTable.overrideSpeciesData[speciesId]) return speciesId;

		// Fall back to base form only if base has overrides AND this form is effectively
		// the same as base (either custom form with no vanilla data, or cosmetic form
		// with identical vanilla stats to base).
		var currentDex = (this.engine && this.engine.dex) || Dex;
		if (!currentDex || !currentDex.species) return speciesId;
		var species = currentDex.species.get(speciesId);
		if (!species || !species.exists) return speciesId;
		var baseId = toID(species.baseSpecies || speciesId);
		if (baseId !== speciesId && relumiTable.overrideSpeciesData[baseId]) {
			var vanillaSpecies = Dex.forGen(9).species.get(speciesId);
			var vanillaBase = Dex.forGen(9).species.get(baseId);
			// No vanilla data = custom form, fall back to base
			if (!vanillaSpecies || !vanillaSpecies.exists) return baseId;
			// Vanilla stats differ from base = form has different stats (e.g., Rotom appliances)
			// Compare using currentRelumiDex to get the actual base stats used in the mod
			if (vanillaBase && vanillaBase.exists && vanillaSpecies.baseStats && vanillaBase.baseStats) {
				var stats = vanillaSpecies.baseStats;
				var baseStats = vanillaBase.baseStats;
				if (stats.hp !== baseStats.hp || stats.atk !== baseStats.atk ||
					stats.def !== baseStats.def || stats.spa !== baseStats.spa ||
					stats.spd !== baseStats.spd || stats.spe !== baseStats.spe) {
					return speciesId;
				}
			}
			// Cosmetic form (identical vanilla stats to base) - fall back to base
			return baseId;
		}
		return speciesId;
	};
	Search.prototype.getVanillaComparisonSpeciesId = function (speciesId) {
		var relumiTable = this.getRelumiOverrides();
		var hasVanillaData = relumiTable && relumiTable.vanillaSpeciesData && speciesId in relumiTable.vanillaSpeciesData;
		if (hasVanillaData) return speciesId;

		// Species with override data but no vanillaSpeciesData entry are custom forms.
		// Dex.forGen would return the mod-added BattlePokedex entry, not true vanilla.
		if (relumiTable && relumiTable.overrideSpeciesData && speciesId in relumiTable.overrideSpeciesData) {
			var currentDex = (this.engine && this.engine.dex) || Dex;
			if (!currentDex || !currentDex.species) return speciesId;
			var species = currentDex.species.get(speciesId);
			if (!species || !species.exists) return speciesId;
			var baseId = toID(species.baseSpecies || speciesId);
			if (baseId !== speciesId) return baseId;
			return speciesId;
		}

		// Fall through for species not touched by mod overrides.
		var vanillaSpecies = Dex.forGen(9).species.get(speciesId);
		if (vanillaSpecies && vanillaSpecies.exists) return speciesId;

		// Fall back to base species for forms that do not exist in vanilla data.
		var currentDex = (this.engine && this.engine.dex) || Dex;
		if (!currentDex || !currentDex.species) return speciesId;
		var species = currentDex.species.get(speciesId);
		if (!species || !species.exists) return speciesId;
		var baseId = toID(species.baseSpecies || speciesId);
		if (baseId !== speciesId) return baseId;
		return speciesId;
	};
	// Returns {vanilla, delta} or null if no diff. Used for title tooltips in stat columns
	Search.prototype.getStatDiff = function (speciesId, statName, value) {
		if (!this.shouldHighlightRelumiChanges()) return null;

		var relumiTable = this.getRelumiOverrides();
		if (!relumiTable || !relumiTable.overrideSpeciesData) return null;

		var diffSourceId = this.getRelumiDiffSourceSpeciesId(speciesId);
		var relumiSpeciesDiff = relumiTable.overrideSpeciesData[diffSourceId];
		if (!relumiSpeciesDiff) return null;

		var vanillaComparisonId;
		var vanillaSpecies;

		if (relumiSpeciesDiff.baseStats && relumiSpeciesDiff.baseStats[statName] !== undefined) {
			vanillaComparisonId = this.getVanillaComparisonSpeciesId(diffSourceId);
			vanillaSpecies = this.getVanillaSpeciesData(vanillaComparisonId);
			if (!vanillaSpecies) return null;
		} else if (!relumiSpeciesDiff.baseStats) {
			if (this.getVanillaSpeciesData(speciesId)) return null;
			vanillaComparisonId = this.getVanillaComparisonSpeciesId(speciesId);
			vanillaSpecies = this.getVanillaSpeciesData(vanillaComparisonId);
			if (!vanillaSpecies || !vanillaSpecies.baseStats) return null;
		} else {
			return null;
		}

		var vanillaStat = vanillaSpecies.baseStats[statName];
		if (typeof vanillaStat !== 'number' || vanillaStat === value) return null;

		return { vanilla: vanillaStat, delta: value - vanillaStat };
	};
	Search.prototype.getStatClass = function (speciesId, statName, value) {
		var diff = this.getStatDiff(speciesId, statName, value);
		if (!diff) return '';
		return diff.delta > 0 ? ' relumi-change-up' : ' relumi-change-down';
	};
	// Returns {vanilla, delta} or null if no diff. Used for BST title tooltip
	Search.prototype.getBSTDiff = function (speciesId, currentBST) {
		if (!this.shouldHighlightRelumiChanges()) return null;

		var relumiTable = this.getRelumiOverrides();
		if (!relumiTable || !relumiTable.overrideSpeciesData) return null;

		var diffSourceId = this.getRelumiDiffSourceSpeciesId(speciesId);
		var relumiSpeciesDiff = relumiTable.overrideSpeciesData[diffSourceId];
		if (!relumiSpeciesDiff) return null;

		var vanillaComparisonId;
		var vanillaSpecies;

		if (relumiSpeciesDiff.baseStats) {
			vanillaComparisonId = this.getVanillaComparisonSpeciesId(diffSourceId);
			vanillaSpecies = this.getVanillaSpeciesData(vanillaComparisonId);
			if (!vanillaSpecies || !vanillaSpecies.baseStats) return null;
		} else {
			if (this.getVanillaSpeciesData(speciesId)) return null;
			vanillaComparisonId = this.getVanillaComparisonSpeciesId(speciesId);
			vanillaSpecies = this.getVanillaSpeciesData(vanillaComparisonId);
			if (!vanillaSpecies || !vanillaSpecies.baseStats) return null;
		}

		var vanillaBST = 0;
		for (var stat in vanillaSpecies.baseStats) {
			vanillaBST += vanillaSpecies.baseStats[stat];
		}

		if (typeof vanillaBST !== 'number' || vanillaBST === currentBST) return null;

		return { vanilla: vanillaBST, delta: currentBST - vanillaBST };
	};
	Search.prototype.getBSTClass = function (speciesId, currentBST) {
		var diff = this.getBSTDiff(speciesId, currentBST);
		if (!diff) return '';
		return diff.delta > 0 ? ' relumi-change-up' : ' relumi-change-down';
	};
	Search.prototype.isNewRelumiAbility = function (speciesId, abilityName) {
		if (!abilityName || !this.shouldHighlightRelumiChanges()) return false;

		var relumiTable = this.getRelumiOverrides();
		if (!relumiTable || !relumiTable.overrideSpeciesData) return false;

		var diffSourceId = this.getRelumiDiffSourceSpeciesId(speciesId);
		var relumiSpeciesDiff = relumiTable.overrideSpeciesData[diffSourceId];
		if (!relumiSpeciesDiff) return false;

		var vanillaComparisonId;
		var vanillaSpecies;

		if (relumiSpeciesDiff.abilities) {
			// Normal path: override has abilities
			vanillaComparisonId = this.getVanillaComparisonSpeciesId(diffSourceId);
			vanillaSpecies = this.getVanillaSpeciesData(vanillaComparisonId);
			if (!vanillaSpecies) return false;
		} else {
			// No abilities override — compare custom form (not in vanilla) against base form's vanilla abilities
			if (this.getVanillaSpeciesData(speciesId)) return false;
			vanillaComparisonId = this.getVanillaComparisonSpeciesId(speciesId);
			vanillaSpecies = this.getVanillaSpeciesData(vanillaComparisonId);
			if (!vanillaSpecies) return false;
		}

		var vanillaAbilities = {};
		for (var slot in vanillaSpecies.abilities) {
			var vanillaAbilityName = vanillaSpecies.abilities[slot];
			if (vanillaAbilityName) vanillaAbilities[vanillaAbilityName] = true;
		}

		return !vanillaAbilities[abilityName];
	};
	Search.prototype.wrapRelumiAbility = function (speciesId, abilityName) {
		if (!abilityName) return '';
		if (!this.isNewRelumiAbility(speciesId, abilityName)) return abilityName;
		return '<span class="relumi-change-up">' + BattleLog.escapeHTML(abilityName) + '</span>';
	};
	// Returns {vanilla, delta} or null if no diff. Used for move power/accuracy title tooltips
	Search.prototype.getMoveDiff = function (moveId, valueType, value) {
		if (!this.shouldHighlightRelumiChanges()) return null;

		var relumiTable = this.getRelumiOverrides();
		if (!relumiTable || !relumiTable.overrideMoveData) return null;

		var relumiMoveDiff = relumiTable.overrideMoveData[moveId];
		if (!relumiMoveDiff || relumiMoveDiff[valueType] === undefined) return null;

		var vanillaMove = this.getVanillaMoveData(moveId);
		if (!vanillaMove) return null;

		var vanillaValue = vanillaMove[valueType];
		if (typeof vanillaValue !== 'number' || typeof value !== 'number' || vanillaValue === value) {
			return null;
		}

		return { vanilla: vanillaValue, delta: value - vanillaValue };
	};
	Search.prototype.getMoveChangeClass = function (moveId, valueType, value) {
		var diff = this.getMoveDiff(moveId, valueType, value);
		if (!diff) return '';
		return diff.delta > 0 ? ' relumi-change-up' : ' relumi-change-down';
	};
	// Learnset highlighting
	Search.prototype.isNewRelumiLearnset = function (moveId) {
		if (!this.shouldHighlightRelumiChanges()) return false;

		var typedSearch = this.engine && this.engine.typedSearch;
		if (!typedSearch || !typedSearch.species) return false;

		var currentSpeciesId = typedSearch.species;
		var relumiTable = this.getRelumiOverrides();
		if (!relumiTable || !relumiTable.learnsets) return false;

		var relumiLearnsets = relumiTable.learnsets;
		var vanillaLearnsets = window.BattleTeambuilderTable && window.BattleTeambuilderTable.learnsets;
		if (!vanillaLearnsets) return false;

		// Walk through the learnset chain (pre-evolutions, forms, etc.)
		// to check if the move is learned anywhere in the chain
		var learnsInRelumi = this.canLearnInChain(currentSpeciesId, moveId, relumiLearnsets);
		var learnsInVanilla = this.canLearnInChain(currentSpeciesId, moveId, vanillaLearnsets);

		return learnsInRelumi && !learnsInVanilla;
	};
	// Helper function to check if a species can learn a move in its learnset chain
	Search.prototype.canLearnInChain = function (speciesId, moveId, learnsets) {
		var learnsetid = this.getFirstLearnsetId(speciesId, learnsets);
		while (learnsetid) {
			var learnset = learnsets[learnsetid];
			if (learnset && moveId in learnset) {
				return true;
			}
			learnsetid = this.getNextLearnsetId(learnsetid, speciesId, learnsets);
		}
		return false;
	};
	// Get the first learnset ID for a species (handles base species, battle-only forms, etc.)
	Search.prototype.getFirstLearnsetId = function (speciesId, learnsets) {
		if (speciesId in learnsets) return speciesId;
		var species = this.engine.dex.species.get(speciesId);
		if (!species || !species.exists) return '';

		var baseLearnsetid = toID(species.baseSpecies);
		if (typeof species.battleOnly === 'string' && species.battleOnly !== species.baseSpecies) {
			baseLearnsetid = toID(species.battleOnly);
		}
		if (baseLearnsetid in learnsets) return baseLearnsetid;
		return '';
	};
	// Get the next learnset ID in the chain (pre-evolutions, forms, etc.)
	Search.prototype.getNextLearnsetId = function (learnsetid, speciesId, learnsets) {
		var lsetSpecies = this.engine.dex.species.get(learnsetid);
		if (!lsetSpecies || !lsetSpecies.exists) return '';

		// Special cases for specific forms
		if (learnsetid === 'lycanrocdusk' || (speciesId === 'rockruff' && learnsetid === 'rockruff')) {
			return 'rockruffdusk';
		}
		if (lsetSpecies.id === 'gastrodoneast') return 'gastrodon';
		if (lsetSpecies.id === 'pumpkaboosuper') return 'pumpkaboo';
		if (lsetSpecies.id === 'sinisteaantique') return 'sinistea';
		if (lsetSpecies.id === 'tatsugiristretchy') return 'tatsugiri';

		var next = lsetSpecies.battleOnly || lsetSpecies.changesFrom || lsetSpecies.prevo;
		if (next) return toID(next);

		return '';
	};
	// Parse [buff] and [nerf] tags in description text
	Search.prototype.parseDescriptionTags = function (desc) {
		if (!desc) return '';
		var parsed = desc;
		// Replace [buff]text[/buff] with green highlighting
		parsed = parsed.replace(/\[buff\](.*?)\[\/buff\]/g, '<span class="relumi-change-up">$1</span>');
		// Replace [nerf]text[/nerf] with red highlighting
		parsed = parsed.replace(/\[nerf\](.*?)\[\/nerf\]/g, '<span class="relumi-change-down">$1</span>');
		return parsed;
	};
	Search.prototype.renderPokemonRow = function (pokemon, matchStart, matchLength, errorMessage, attrs) {
		if (!attrs) attrs = '';
		if (!pokemon) return '<li class="result">Unrecognized pokemon</li>';
		var id = toID(pokemon.name);
		if (Search.urlRoot) attrs += ' href="' + Search.urlRoot + 'pokemon/' + id + '" data-target="push"';
		var buf = '<li class="result"><a' + attrs + ' data-entry="pokemon|' + BattleLog.escapeHTML(pokemon.name) + '">';

		// number
		var tier = this.engine ? this.engine.getTier(pokemon) : pokemon.num;
		// buf += '<span class="col numcol">' + (pokemon.num >= 0 ? pokemon.num : 'CAP') + '</span> ';
		buf += '<span class="col numcol">' + tier + '</span> ';

		// icon
		buf += '<span class="col iconcol">';
		buf += '<span style="' + Dex.getPokemonIcon(pokemon.name) + '"></span>';
		buf += '</span> ';

		// name
		var name = pokemon.name;
		var tagStart = (pokemon.forme ? name.length - pokemon.forme.length - 1 : 0);
		if (tagStart) name = name.substr(0, tagStart);
		if (matchLength) {
			name = name.substr(0, matchStart) + '<b>' + name.substr(matchStart, matchLength) + '</b>' + name.substr(matchStart + matchLength);
		}
		if (tagStart) {
			if (matchLength && matchStart + matchLength > tagStart) {
				if (matchStart < tagStart) {
					matchLength -= tagStart - matchStart;
					matchStart = tagStart;
				}
				name += '<small>' + pokemon.name.substr(tagStart, matchStart - tagStart) + '<b>' + pokemon.name.substr(matchStart, matchLength) + '</b>' + pokemon.name.substr(matchStart + matchLength) + '</small>';
			} else {
				name += '<small>' + pokemon.name.substr(tagStart) + '</small>';
			}
		}
		buf += '<span class="col pokemonnamecol">' + name + '</span> ';

		// error
		if (errorMessage) {
			buf += errorMessage + '</a></li>';
			return buf;
		}

		var gen = this.engine ? this.engine.dex.gen : 9;

		// type
		buf += '<span class="col typecol">';
		var types = pokemon.types;
		for (var i = 0; i < types.length; i++) {
			buf += Dex.getTypeIcon(types[i]);
		}
		buf += '</span> ';

		// abilities
		if (gen >= 3 && !(this.engine && this.engine.dex.modid === 'gen7letsgo')) {
			var abilities = pokemon.abilities;
			var ability0 = this.wrapRelumiAbility(id, abilities['0']);
			var ability1 = this.wrapRelumiAbility(id, abilities['1']);
			var hiddenAbility = this.wrapRelumiAbility(id, abilities['H']);
			var specialAbility = this.wrapRelumiAbility(id, abilities['S']);
			if (gen >= 5) {
				if (abilities['1']) {
					buf += '<span class="col twoabilitycol">' + ability0 + '<br />' +
						ability1 + '</span>';
				} else {
					buf += '<span class="col abilitycol">' + ability0 + '</span>';
				}
				var unreleasedHidden = pokemon.unreleasedHidden;
				if (unreleasedHidden === 'Past' && (this.mod === 'natdex' || gen < 8)) unreleasedHidden = false;
				if (abilities['S']) {
					if (abilities['H']) {
						buf += '<span class="col twoabilitycol' + (unreleasedHidden ? ' unreleasedhacol' : '') + '">' + (hiddenAbility || '') + '<br />(' + specialAbility + ')</span>';
					} else {
						buf += '<span class="col abilitycol">(' + specialAbility + ')</span>';
					}
				} else if (abilities['H']) {
					buf += '<span class="col abilitycol' + (unreleasedHidden ? ' unreleasedhacol' : '') + '">' + hiddenAbility + '</span>';
				} else {
					buf += '<span class="col abilitycol"></span>';
				}
			} else {
				buf += '<span class="col abilitycol">' + ability0 + '</span>';
				buf += '<span class="col abilitycol">' + (ability1 || '') + '</span>';
			}
		} else {
			buf += '<span class="col abilitycol"></span>';
			buf += '<span class="col abilitycol"></span>';
		}

		// base stats
		var stats = pokemon.baseStats;
		var hpClass = this.getStatClass(id, 'hp', stats.hp);
		var hpDiff = this.getStatDiff(id, 'hp', stats.hp);
		var atkClass = this.getStatClass(id, 'atk', stats.atk);
		var atkDiff = this.getStatDiff(id, 'atk', stats.atk);
		var defClass = this.getStatClass(id, 'def', stats.def);
		var defDiff = this.getStatDiff(id, 'def', stats.def);
		var spaClass = this.getStatClass(id, 'spa', stats.spa);
		var spaDiff = this.getStatDiff(id, 'spa', stats.spa);
		var spdClass = this.getStatClass(id, 'spd', stats.spd);
		var spdDiff = this.getStatDiff(id, 'spd', stats.spd);
		var speClass = this.getStatClass(id, 'spe', stats.spe);
		var speDiff = this.getStatDiff(id, 'spe', stats.spe);
		buf += '<span class="col statcol' + hpClass + '"' + (hpDiff ? ' title="Vanilla: ' + hpDiff.vanilla + ' → ' + stats.hp + ' (' + (hpDiff.delta > 0 ? '+' : '') + hpDiff.delta + ')"' : '') + '><em>HP</em><br />' + stats.hp + '</span> ';
		buf += '<span class="col statcol' + atkClass + '"' + (atkDiff ? ' title="Vanilla: ' + atkDiff.vanilla + ' → ' + stats.atk + ' (' + (atkDiff.delta > 0 ? '+' : '') + atkDiff.delta + ')"' : '') + '><em>Atk</em><br />' + stats.atk + '</span> ';
		buf += '<span class="col statcol' + defClass + '"' + (defDiff ? ' title="Vanilla: ' + defDiff.vanilla + ' → ' + stats.def + ' (' + (defDiff.delta > 0 ? '+' : '') + defDiff.delta + ')"' : '') + '><em>Def</em><br />' + stats.def + '</span> ';
		if (gen >= 2) {
			buf += '<span class="col statcol' + spaClass + '"' + (spaDiff ? ' title="Vanilla: ' + spaDiff.vanilla + ' → ' + stats.spa + ' (' + (spaDiff.delta > 0 ? '+' : '') + spaDiff.delta + ')"' : '') + '><em>SpA</em><br />' + stats.spa + '</span> ';
			buf += '<span class="col statcol' + spdClass + '"' + (spdDiff ? ' title="Vanilla: ' + spdDiff.vanilla + ' → ' + stats.spd + ' (' + (spdDiff.delta > 0 ? '+' : '') + spdDiff.delta + ')"' : '') + '><em>SpD</em><br />' + stats.spd + '</span> ';
		} else {
			buf += '<span class="col statcol' + spaClass + '"' + (spaDiff ? ' title="Vanilla: ' + spaDiff.vanilla + ' → ' + stats.spa + ' (' + (spaDiff.delta > 0 ? '+' : '') + spaDiff.delta + ')"' : '') + '><em>Spc</em><br />' + stats.spa + '</span> ';
		}
		buf += '<span class="col statcol' + speClass + '"' + (speDiff ? ' title="Vanilla: ' + speDiff.vanilla + ' → ' + stats.spe + ' (' + (speDiff.delta > 0 ? '+' : '') + speDiff.delta + ')"' : '') + '><em>Spe</em><br />' + stats.spe + '</span> ';
		var bst = 0;
		for (i in stats) {
			if (i === 'spd' && gen === 1) continue;
			bst += stats[i];
		}
		var bstClass = this.getBSTClass(id, bst);
		var bstDiff = this.getBSTDiff(id, bst);
		buf += '<span class="col bstcol' + bstClass + '"' + (bstDiff ? ' title="Vanilla BST: ' + bstDiff.vanilla + ' → ' + bst + ' (' + (bstDiff.delta > 0 ? '+' : '') + bstDiff.delta + ')"' : '') + '><em>BST<br />' + bst + '</em></span> ';

		buf += '</a></li>';

		return buf;
	};
	Search.prototype.renderTaggedPokemonRowInner = function (pokemon, tag, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="' + Search.urlRoot + 'pokemon/' + toID(pokemon.name) + '" data-target="push"';
		var buf = '<a' + attrs + ' data-entry="pokemon|' + BattleLog.escapeHTML(pokemon.name) + '">';

		// tag
		buf += '<span class="col tagcol shorttagcol">' + tag + '</span> ';

		// icon
		buf += '<span class="col iconcol">';
		buf += '<span style="' + Dex.getPokemonIcon(pokemon.name) + '"></span>';
		buf += '</span> ';

		// name
		var name = pokemon.name;
		var tagStart = (pokemon.forme ? name.length - pokemon.forme.length - 1 : 0);
		if (tagStart) name = name.substr(0, tagStart) + '<small>' + pokemon.name.substr(tagStart) + '</small>';
		buf += '<span class="col shortpokemonnamecol">' + name + '</span> ';

		// error
		if (errorMessage) {
			buf += errorMessage + '</a></li>';
			return buf;
		}

		// type
		buf += '<span class="col typecol">';
		for (var i = 0; i < pokemon.types.length; i++) {
			buf += Dex.getTypeIcon(pokemon.types[i]);
		}
		buf += '</span> ';

		// abilities
		buf += '<span style="float:left;min-height:26px">';
		if (pokemon.abilities['1']) {
			buf += '<span class="col twoabilitycol">';
		} else {
			buf += '<span class="col abilitycol">';
		}
		for (var i in pokemon.abilities) {
			var ability = pokemon.abilities[i];
			if (!ability) continue;

			if (i === '1') buf += '<br />';
			if (i === 'H') ability = '</span><span class="col abilitycol"><em>' + pokemon.abilities[i] + '</em>';
			buf += ability;
		}
		if (!pokemon.abilities['H']) buf += '</span><span class="col abilitycol">';
		buf += '</span>';
		buf += '</span>';

		// base stats
		buf += '<span style="float:left;min-height:26px">';
		buf += '<span class="col statcol"><em>HP</em><br />' + pokemon.baseStats.hp + '</span> ';
		buf += '<span class="col statcol"><em>Atk</em><br />' + pokemon.baseStats.atk + '</span> ';
		buf += '<span class="col statcol"><em>Def</em><br />' + pokemon.baseStats.def + '</span> ';
		buf += '<span class="col statcol"><em>SpA</em><br />' + pokemon.baseStats.spa + '</span> ';
		buf += '<span class="col statcol"><em>SpD</em><br />' + pokemon.baseStats.spd + '</span> ';
		buf += '<span class="col statcol"><em>Spe</em><br />' + pokemon.baseStats.spe + '</span> ';
		var bst = 0;
		for (i in pokemon.baseStats) bst += pokemon.baseStats[i];
		buf += '<span class="col bstcol"><em>BST<br />' + bst + '</em></span> ';
		buf += '</span>';

		buf += '</a>';

		return buf;
	};

	Search.prototype.renderItemRow = function (item, matchStart, matchLength, errorMessage, attrs) {
		if (!attrs) attrs = '';
		if (!item) return '<li class="result">Unrecognized item</li>';
		var id = toID(item.name);
		if (Search.urlRoot) attrs += ' href="' + Search.urlRoot + 'items/' + id + '" data-target="push"';
		var buf = '<li class="result"><a' + attrs + ' data-entry="item|' + BattleLog.escapeHTML(item.name) + '">';

		// icon
		buf += '<span class="col itemiconcol">';
		buf += '<span style="' + Dex.getItemIcon(item) + '"></span>';
		buf += '</span> ';

		// name
		var name = item.name;
		if (matchLength) {
			name = name.substr(0, matchStart) + '<b>' + name.substr(matchStart, matchLength) + '</b>' + name.substr(matchStart + matchLength);
		}
		buf += '<span class="col namecol">' + name + '</span> ';

		// error
		if (errorMessage) {
			buf += errorMessage + '</a></li>';
			return buf;
		}

		// desc
		buf += '<span class="col itemdesccol">' + BattleLog.escapeHTML(item.shortDesc) + '</span> ';

		buf += '</a></li>';

		return buf;
	};
	Search.prototype.renderAbilityRow = function (ability, matchStart, matchLength, errorMessage, attrs) {
		if (!attrs) attrs = '';
		if (!ability) return '<li class="result">Unrecognized ability</li>';
		var id = toID(ability.name);
		if (Search.urlRoot) attrs += ' href="' + Search.urlRoot + 'abilities/' + id + '" data-target="push"';
		var buf = '<li class="result"><a' + attrs + ' data-entry="ability|' + BattleLog.escapeHTML(ability.name) + '">';

		// name
		var name = ability.name;
		if (matchLength) {
			name = name.substr(0, matchStart) + '<b>' + name.substr(matchStart, matchLength) + '</b>' + name.substr(matchStart + matchLength);
		}
		buf += '<span class="col namecol">' + name + '</span> ';

		// error
		if (errorMessage) {
			buf += errorMessage + '</a></li>';
			return buf;
		}

		buf += '<span class="col abilitydesccol">' + this.parseDescriptionTags(BattleLog.escapeHTML(ability.shortDesc)) + '</span> ';

		buf += '</a></li>';

		return buf;
	};
	Search.prototype.renderMoveRow = function (move, matchStart, matchLength, errorMessage, attrs) {
		if (!attrs) attrs = '';
		if (!move) return '<li class="result">Unrecognized move</li>';
		var id = toID(move.name);
		if (Search.urlRoot) attrs += ' href="' + Search.urlRoot + 'moves/' + id + '" data-target="push"';
		var buf = '<li class="result"><a' + attrs + ' data-entry="move|' + BattleLog.escapeHTML(move.name) + '">';

		// name
		var name = move.name;
		var tagStart = (name.substr(0, 12) === 'Hidden Power' ? 12 : 0);
		if (tagStart) name = name.substr(0, tagStart);
		if (matchLength) {
			name = name.substr(0, matchStart) + '<b>' + name.substr(matchStart, matchLength) + '</b>' + name.substr(matchStart + matchLength);
		}
		if (tagStart) {
			if (matchLength && matchStart + matchLength > tagStart) {
				if (matchStart < tagStart) {
					matchLength -= tagStart - matchStart;
					matchStart = tagStart;
				}
				name += '<small>' + move.name.substr(tagStart, matchStart - tagStart) + '<b>' + move.name.substr(matchStart, matchLength) + '</b>' + move.name.substr(matchStart + matchLength) + '</small>';
			} else {
				name += '<small>' + move.name.substr(tagStart) + '</small>';
			}
		}
		var isNewLearnset = this.isNewRelumiLearnset(id);
		var moveNameClass = isNewLearnset ? ' relumi-change-up' : '';
		buf += '<span class="col movenamecol' + moveNameClass + '">' + name + '</span> ';

		// error
		if (errorMessage) {
			buf += errorMessage + '</a></li>';
			return buf;
		}

		// type
		buf += '<span class="col typecol">';
		buf += Dex.getTypeIcon(move.type);
		buf += Dex.getCategoryIcon(move.category);
		buf += '</span> ';

		// power, accuracy, pp
		var pp = (move.pp === 1 || move.noPPBoosts ? move.pp : move.pp * 8 / 5);
		if (this.engine && this.engine.dex.gen < 3) pp = Math.min(61, pp);
		if (this.engine && this.engine.dex.modid === 'champions') {
			pp = move.pp > 20 ? 20 : move.pp;
			if (!move.noPPBoosts) pp = (pp / 5 + 1) * 4;
		}
		var movePowerClass = this.getMoveChangeClass(id, 'basePower', move.basePower);
		var movePowerDiff = this.getMoveDiff(id, 'basePower', move.basePower);
		var moveAccuracyClass = this.getMoveChangeClass(id, 'accuracy', move.accuracy);
		var moveAccuracyDiff = this.getMoveDiff(id, 'accuracy', move.accuracy);
		buf += '<span class="col labelcol' + movePowerClass + '"' + (movePowerDiff ? ' title="Vanilla Power: ' + movePowerDiff.vanilla + ' → ' + move.basePower + ' (' + (movePowerDiff.delta > 0 ? '+' : '') + movePowerDiff.delta + ')"' : '') + '>' + (move.category !== 'Status' ? ('<em>Power</em><br />' + (move.basePower || '&mdash;')) : '') + '</span> ';
		buf += '<span class="col widelabelcol' + moveAccuracyClass + '"' + (moveAccuracyDiff ? ' title="Vanilla Accuracy: ' + moveAccuracyDiff.vanilla + ' → ' + move.accuracy + ' (' + (moveAccuracyDiff.delta > 0 ? '+' : '') + moveAccuracyDiff.delta + ')"' : '') + '><em>Accuracy</em><br />' + (move.accuracy && move.accuracy !== true ? move.accuracy + '%' : '&mdash;') + '</span> ';
		buf += '<span class="col pplabelcol"><em>PP</em><br />' + pp + '</span> ';

		// desc
		buf += '<span class="col movedesccol">' + this.parseDescriptionTags(BattleLog.escapeHTML(move.shortDesc)) + '</span> ';

		buf += '</a></li>';

		return buf;
	};
	Search.prototype.renderMoveRowInner = function (move, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="' + Search.urlRoot + 'moves/' + toID(move.name) + '" data-target="push"';
		var buf = '<a' + attrs + ' data-entry="move|' + BattleLog.escapeHTML(move.name) + '">';

		// name
		var name = move.name;
		var tagStart = (name.substr(0, 12) === 'Hidden Power' ? 12 : 0);
		if (tagStart) name = name.substr(0, tagStart) + '<small>' + move.name.substr(tagStart) + '</small>';
		buf += '<span class="col movenamecol">' + name + '</span> ';

		// error
		if (errorMessage) {
			buf += errorMessage + '</a></li>';
			return buf;
		}

		// type
		buf += '<span class="col typecol">';
		buf += Dex.getTypeIcon(move.type);
		buf += Dex.getCategoryIcon(move.category);
		buf += '</span> ';

		// power, accuracy, pp
		var pp = (move.pp === 1 || move.noPPBoosts ? move.pp : move.pp * 8 / 5);
		if (this.engine && this.engine.dex.gen < 3) pp = Math.min(61, pp);
		if (this.engine && this.engine.dex.modid === 'champions') {
			pp = move.pp > 20 ? 20 : move.pp;
			if (!move.noPPBoosts) pp = (pp / 5 + 1) * 4;
		}
		var movePowerClass = this.getMoveChangeClass(toID(move.name), 'basePower', move.basePower);
		var movePowerDiff = this.getMoveDiff(toID(move.name), 'basePower', move.basePower);
		var moveAccuracyClass = this.getMoveChangeClass(toID(move.name), 'accuracy', move.accuracy);
		var moveAccuracyDiff = this.getMoveDiff(toID(move.name), 'accuracy', move.accuracy);
		buf += '<span class="col labelcol' + movePowerClass + '"' + (movePowerDiff ? ' title="Vanilla Power: ' + movePowerDiff.vanilla + ' → ' + move.basePower + ' (' + (movePowerDiff.delta > 0 ? '+' : '') + movePowerDiff.delta + ')"' : '') + '>' + (move.category !== 'Status' ? ('<em>Power</em><br />' + (move.basePower || '&mdash;')) : '') + '</span> ';
		buf += '<span class="col widelabelcol' + moveAccuracyClass + '"' + (moveAccuracyDiff ? ' title="Vanilla Accuracy: ' + moveAccuracyDiff.vanilla + ' → ' + move.accuracy + ' (' + (moveAccuracyDiff.delta > 0 ? '+' : '') + moveAccuracyDiff.delta + ')"' : '') + '><em>Accuracy</em><br />' + (move.accuracy && move.accuracy !== true ? move.accuracy + '%' : '&mdash;') + '</span> ';
		buf += '<span class="col pplabelcol"><em>PP</em><br />' + pp + '</span> ';

		// desc
		buf += '<span class="col movedesccol">' + this.parseDescriptionTags(BattleLog.escapeHTML(move.shortDesc || move.desc)) + '</span> ';

		buf += '</a>';

		return buf;
	};
	Search.prototype.renderTaggedMoveRow = function (move, tag, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="' + Search.urlRoot + 'moves/' + toID(move.name) + '" data-target="push"';
		var buf = '<li class="result"><a' + attrs + ' data-entry="move|' + BattleLog.escapeHTML(move.name) + '">';

		// tag
		buf += '<span class="col tagcol">' + tag + '</span> ';

		// name
		var name = move.name;
		if (name.substr(0, 12) === 'Hidden Power') name = 'Hidden Power';
		buf += '<span class="col shortmovenamecol">' + name + '</span> ';

		// error
		if (errorMessage) {
			buf += errorMessage + '</a></li>';
			return buf;
		}

		// type
		buf += '<span class="col typecol">';
		buf += Dex.getTypeIcon(move.type);
		buf += Dex.getCategoryIcon(move.category);
		buf += '</span> ';

		// power, accuracy, pp
		var pp = move.pp === 1 || move.noPPBoosts ? move.pp : move.pp * 8 / 5;
		if (this.engine && this.engine.dex.gen < 3) pp = Math.min(61, pp);
		if (this.engine && this.engine.dex.modid === 'champions') {
			pp = move.pp > 20 ? 20 : move.pp;
			if (!move.noPPBoosts) pp = (pp / 5 + 1) * 4;
		}
		var movePowerDiff = this.getMoveDiff(toID(move.name), 'basePower', move.basePower);
		var moveAccuracyDiff = this.getMoveDiff(toID(move.name), 'accuracy', move.accuracy);
		var movePowerClass = movePowerDiff ? (movePowerDiff.delta > 0 ? ' relumi-change-up' : ' relumi-change-down') : '';
		var moveAccuracyClass = moveAccuracyDiff ? (moveAccuracyDiff.delta > 0 ? ' relumi-change-up' : ' relumi-change-down') : '';
		buf += '<span class="col labelcol' + movePowerClass + '"' + (movePowerDiff ? ' title="Vanilla Power: ' + movePowerDiff.vanilla + ' → ' + move.basePower + ' (' + (movePowerDiff.delta > 0 ? '+' : '') + movePowerDiff.delta + ')"' : '') + '>' + (move.category !== 'Status' ? ('<em>Power</em><br />' + (move.basePower || '&mdash;')) : '') + '</span> ';
		buf += '<span class="col widelabelcol' + moveAccuracyClass + '"' + (moveAccuracyDiff ? ' title="Vanilla Accuracy: ' + moveAccuracyDiff.vanilla + ' → ' + move.accuracy + ' (' + (moveAccuracyDiff.delta > 0 ? '+' : '') + moveAccuracyDiff.delta + ')"' : '') + '><em>Accuracy</em><br />' + (move.accuracy && move.accuracy !== true ? move.accuracy + '%' : '&mdash;') + '</span> ';
		buf += '<span class="col pplabelcol"><em>PP</em><br />' + pp + '</span> ';

		// desc
		buf += '<span class="col movedesccol">' + this.parseDescriptionTags(BattleLog.escapeHTML(move.shortDesc || move.desc)) + '</span> ';

		buf += '</a></li>';

		return buf;
	};

	Search.prototype.renderTypeRow = function (type, matchStart, matchLength, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="' + Search.urlRoot + 'types/' + toID(type.name) + '" data-target="push"';
		var buf = '<li class="result"><a' + attrs + ' data-entry="type|' + BattleLog.escapeHTML(type.name) + '">';

		// name
		var name = type.name;
		if (matchLength) {
			name = name.substr(0, matchStart) + '<b>' + name.substr(matchStart, matchLength) + '</b>' + name.substr(matchStart + matchLength);
		}
		buf += '<span class="col namecol">' + name + '</span> ';

		// type
		buf += '<span class="col typecol">';
		buf += Dex.getTypeIcon(type.name);
		buf += '</span> ';

		// error
		if (errorMessage) {
			buf += errorMessage + '</a></li>';
			return buf;
		}

		buf += '</a></li>';

		return buf;
	};
	Search.prototype.renderCategoryRow = function (category, matchStart, matchLength, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="' + Search.urlRoot + 'categories/' + category.id + '" data-target="push"';
		var buf = '<li class="result"><a' + attrs + ' data-entry="category|' + BattleLog.escapeHTML(category.name) + '">';

		// name
		var name = category.name;
		if (matchLength) {
			name = name.substr(0, matchStart) + '<b>' + name.substr(matchStart, matchLength) + '</b>' + name.substr(matchStart + matchLength);
		}
		buf += '<span class="col namecol">' + name + '</span> ';

		// category
		buf += '<span class="col typecol">' + Dex.getCategoryIcon(category.name) + '</span> ';

		// error
		if (errorMessage) {
			buf += errorMessage + '</a></li>';
			return buf;
		}

		buf += '</a></li>';

		return buf;
	};
	Search.prototype.renderArticleRow = function (article, matchStart, matchLength, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="' + Search.urlRoot + 'articles/' + article.id + '" data-target="push"';
		var isSearchType = (article.id === 'pokemon' || article.id === 'moves');
		if (isSearchType) attrs = ' href="' + article.id + '/" data-target="replace"';
		var buf = '<li class="result"><a' + attrs + ' data-entry="article|' + BattleLog.escapeHTML(article.name) + '">';

		// name
		var name = article.name;
		if (matchLength) {
			name = name.substr(0, matchStart) + '<b>' + name.substr(matchStart, matchLength) + '</b>' + name.substr(matchStart + matchLength);
		}
		buf += '<span class="col namecol">' + name + '</span> ';

		// article
		if (isSearchType) {
			buf += '<span class="col movedesccol">(search type)</span> ';
		} else {
			buf += '<span class="col movedesccol">(article)</span> ';
		}

		// error
		if (errorMessage) {
			buf += errorMessage + '</a></li>';
			return buf;
		}

		buf += '</a></li>';

		return buf;
	};
	Search.prototype.renderEggGroupRow = function (egggroup, matchStart, matchLength, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="' + Search.urlRoot + 'egggroups/' + toID(egggroup.name) + '" data-target="push"';
		var buf = '<li class="result"><a' + attrs + ' data-entry="egggroup|' + BattleLog.escapeHTML(egggroup.name) + '">';

		// name
		var name = egggroup.name;
		if (matchLength) {
			name = name.substr(0, matchStart) + '<b>' + name.substr(matchStart, matchLength) + '</b>' + name.substr(matchStart + matchLength);
		}
		buf += '<span class="col namecol">' + name + '</span> ';

		// error
		if (errorMessage) {
			buf += errorMessage + '</a></li>';
			return buf;
		}

		buf += '</a></li>';

		return buf;
	};
	Search.prototype.renderTierRow = function (tier, matchStart, matchLength, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="' + Search.urlRoot + 'tiers/' + toID(tier.name) + '" data-target="push"';
		var buf = '<li class="result"><a' + attrs + ' data-entry="tier|' + BattleLog.escapeHTML(tier.name) + '">';

		// name
		var name = tier.name;
		if (matchLength) {
			name = name.substr(0, matchStart) + '<b>' + name.substr(matchStart, matchLength) + '</b>' + name.substr(matchStart + matchLength);
		}
		buf += '<span class="col namecol">' + name + '</span> ';

		// error
		if (errorMessage) {
			buf += errorMessage + '</a></li>';
			return buf;
		}

		buf += '</a></li>';

		return buf;
	};

	Search.gen = 9;
	Search.renderRow = Search.prototype.renderRow;
	Search.renderPokemonRow = Search.prototype.renderPokemonRow;
	Search.renderTaggedPokemonRowInner = Search.prototype.renderTaggedPokemonRowInner;
	Search.renderItemRow = Search.prototype.renderItemRow;
	Search.renderAbilityRow = Search.prototype.renderAbilityRow;
	Search.renderMoveRow = Search.prototype.renderMoveRow;
	Search.renderMoveRowInner = Search.prototype.renderMoveRowInner;
	Search.renderTaggedMoveRow = Search.prototype.renderTaggedMoveRow;
	Search.renderTypeRow = Search.prototype.renderTypeRow;
	Search.renderCategoryRow = Search.prototype.renderCategoryRow;
	Search.renderEggGroupRow = Search.prototype.renderEggGroupRow;
	Search.renderTierRow = Search.prototype.renderTierRow;

	exports.BattleSearch = Search;

})(window, jQuery);
