/**
 * Search
 *
 * Basically just an improved version of utilichart
 *
 * Dependencies: jQuery, battledata, search-index
 * Optional dependencies: pokedex, moves, items, abilities
 *
 * @author  Guangcong Luo <Zarel>
 */

(function (exports, $) {
	'use strict';

	function Search(elem, viewport) {
		this.$el = $(elem);
		this.el = this.$el[0];
		this.$viewport = (viewport ? $(viewport) : $(window));

		this.urlRoot = '';
		this.q = undefined; // uninitialized
		this.qType = '';
		this.defaultResultSet = null;
		this.legalityFilter = null;
		this.legalityLabel = "Illegal";
		this.exactMatch = false;

		this.resultSet = null;
		this.filters = null;
		this.renderedIndex = 0;
		this.renderingDone = true;
		this.cur = {};
		this.$inputEl = null;

		var self = this;
		this.$el.on('mouseover', '.more-autoscroll', function () {
			self.updateScroll(true);
		});
		this.$el.on('click', '.more button', function (e) {
			e.preventDefault();
			if (e.currentTarget.className === 'utilichart-all') {
				self.all();
			} else {
				self.updateScroll(true);
			}
		});
		this.$el.on('click', '.filter', function (e) {
			e.preventDefault();
			if (!self.filters) return;
			// delete filter
			for (var i = 0; i < self.filters.length; i++) {
				if (e.currentTarget.value === self.filters[i].join(':')) {
					self.filters.splice(i, 1);
					if (!self.filters.length) self.filters = null;
					self.q = undefined;
					self.find('');
					break;
				}
			}
			if (self.$inputEl) self.$inputEl.focus();
		});
	}

	Search.prototype.$ = function (query) {
		return this.$el.find(query);
	};

	//
	// Search functions
	//

	var typeTable = {
		pokemon: 0,
		type: 1,
		move: 2,
		item: 3,
		ability: 4,
		egggroup: 5,
		category: 6
	};
	var typeName = {
		pokemon: 'Pokemon',
		type: 'Type',
		move: 'Moves',
		item: 'Items',
		ability: 'Abilities',
		egggroup: 'Egg group',
		category: 'Category'
	};
	Search.prototype.find = function (query) {
		query = toId(query);

		if (query === this.q) {
			return false;
		}
		this.q = query;
		this.resultSet = null;
		var qType = this.qType;
		if (!query) {
			if (!this.filters && this.defaultResultSet) {
				this.renderedIndex = 0;
				this.renderingDone = false;
				this.updateScroll();
				return true;
			}
			if (qType === 'pokemon') {
				this.allPokemon();
				return true;
			} else if (qType === 'move') {
				this.allMoves();
				return true;
			}
			this.el.innerHTML = '';
			this.exactMatch = false;
			return true;
		}

		var qTypeIndex = -1;
		switch (qType) {
		case 'pokemon': qTypeIndex = 0; break;
		case 'move': qTypeIndex = 2; break;
		case 'item': qTypeIndex = 3; break;
		case 'ability': qTypeIndex = 4; break;
		}

		var qFilterType = '';
		if (query.slice(-4) === 'type') {
			if ((query.charAt(0).toUpperCase() + query.slice(1, -4)) in window.BattleTypeChart) {
				query = query.slice(0, -4);
				qFilterType = 'type';
			}
		}

		var i = Search.getClosest(query);
		var nearMatch = (BattleSearchIndex[i].substr(0, query.length) !== query);
		if (nearMatch) {
			var matchLength = query.length - 1;
			if (!i) i++;
			while (matchLength &&
				BattleSearchIndex[i].substr(0, matchLength) !== query.substr(0, matchLength) &&
				BattleSearchIndex[i - 1].substr(0, matchLength) !== query.substr(0, matchLength)) {
				matchLength--;
			}
			var matchQuery = query.substr(0, matchLength);
			while (BattleSearchIndex[i - 1] && BattleSearchIndex[i - 1].substr(0, matchLength) === matchQuery) i--;
		}

		var queryOriginal = '';
		var iOriginal = -1;
		var iAlias = -1;
		if (query in BattleAliases) {
			iOriginal = i;
			queryOriginal = query;
			query = toId(BattleAliases[query]);
			i = iAlias = Search.getClosest(query);
			nearMatch = false;
		}
		this.exactMatch = (iAlias >= 0 || query === BattleSearchIndex[i]);

		var bufs = ['', '', '', '', '', '', ''];
		var topbuf = '';
		var topbufIndex = -1;

		this.renderingDone = false;
		for (var count = 0; count < 15; i++) {
			if (iOriginal < 0 && i === iAlias) {
				i++;
			}

			var id = BattleSearchIndex[i];
			var type = BattleSearchIndexType[i];
			var matchLength = query.length;

			if (!id) break;
			if (id.substr(0, query.length) !== query) {
				if (!count && !nearMatch) nearMatch = true; // was an alias not matching our qType
				if (iOriginal >= 0) {
					// done matching on alias, match on original query now
					i = iOriginal - 1;
					query = queryOriginal;
					iOriginal = -1;
					continue;
				}
				this.renderingDone = true;
				if (!(nearMatch && count <= 1)) break; // if a nearMatch, generate two results
				matchLength = 0;
			} else {
				matchLength += (BattleSearchIndexOffset[i][matchLength - 1] || '0').charCodeAt(0) - 48;
			}

			var typeIndex = typeTable[type];
			if (qType === 'pokemon' && (typeIndex === 3 || typeIndex > 5)) continue;
			if (qType === 'move' && (typeIndex !== 6 && typeIndex > 2)) continue;
			if ((qType === 'ability' || qType === 'item') && typeIndex !== qTypeIndex) continue;
			if (qFilterType === 'type' && typeIndex !== 1) continue;

			var errorMessage = '';
			if (qType && qTypeIndex !== typeIndex) errorMessage = '<span class="col filtercol"><em>Filter</em></span>';
			else if (this.legalityFilter && !(id in this.legalityFilter)) errorMessage = '<span class="col illegalcol"><em>' + this.legalityLabel + '</em></span>';

			if (count === 0 && this.exactMatch) {
				topbufIndex = typeIndex;
			}

			if (!bufs[typeIndex]) bufs[typeIndex] = '<li class="resultheader"><h3>' + typeName[type] + '</h3></li>';
			bufs[typeIndex] += Search.renderRow(id, type, 0, matchLength, errorMessage);
			count++;
		}

		if (nearMatch) topbuf = '<li class="result notfound"><p><em>No exact match found. The closest matches alphabetically are:</em></p></li>' + topbuf;
		if (this.filters) {
			topbuf = Search.renderRow(this.getFilterText(1), 'html', 0);
		}
		if (qTypeIndex === 2 && query === 'psychic') topbufIndex = 2;
		if (topbufIndex >= 0) {
			topbuf += bufs[topbufIndex];
			bufs[topbufIndex] = '';
		}
		if (query === 'grass' || query === 'flying') {
			topbuf += bufs[5];
			bufs[5] = '';
		}

		this.el.innerHTML = '<ul class="utilichart">' + topbuf + bufs.join('') + '</ul>' + (this.renderingDone || qType ? '' : '<ul class="utilichart"><li class="more"><button class="utilichart-all">All results</button></li></ul>');
		return true;
	};
	Search.prototype.addFilter = function (node) {
		if (!node.dataset.entry) return;
		var entry = node.dataset.entry.split(':');
		if (this.qType === 'pokemon') {
			if (entry[0] !== 'type' && entry[0] !== 'move' && entry[0] !== 'ability' && entry[0] !== 'egggroup') return;
			if (entry[0] === 'move') entry[1] = toId(entry[1]);
			if (!this.filters) this.filters = [];
			this.q = undefined;
			for (var i = 0; i < this.filters.length; i++) {
				if (this.filters[i][0] === entry[0] && this.filters[i][1] === entry[1]) {
					return true;
				}
			}
			this.filters.push(entry);
			return true;
		} else if (this.qType === 'move') {
			if (entry[0] !== 'type' && entry[0] !== 'category' && entry[0] !== 'pokemon') return;
			if (entry[0] === 'pokemon') entry[1] = toId(entry[1]);
			if (!this.filters) this.filters = [];
			this.filters.push(entry);
			this.q = undefined;
			return true;
		}
	};
	Search.prototype.removeFilter = function () {
		if (!this.filters) return;
		this.filters.pop();
		if (!this.filters.length) this.filters = null;
		this.q = undefined;
		return true;
	};
	Search.prototype.all = function () {
		var query = this.q;
		var bufs = [[], [], [], [], [], [], []];
		var topbufIndex = -1;

		var i = Search.getClosest(query);
		var resultSet = [];

		while (true) {
			var id = BattleSearchIndex[i];
			var type = BattleSearchIndexType[i];
			var matchLength = query.length;

			if (!id) break;
			if (id.substr(0, query.length) !== query) {
				break;
			} else {
				matchLength += (BattleSearchIndexOffset[i][matchLength - 1] || '0').charCodeAt(0) - 48;
			}

			var typeIndex = typeTable[type];
			if (topbufIndex < 0 && this.exactMatch) {
				topbufIndex = typeIndex;
			}

			if (!bufs[typeIndex].length) bufs[typeIndex] = [['header', typeName[type], 0]];
			bufs[typeIndex].push([type, id, matchLength]);

			i++;
		}

		if (topbufIndex >= 0) {
			var topbuf = bufs[topbufIndex];
			bufs.splice(topbufIndex, 1);
			bufs.unshift(topbuf);
		}

		this.resultSet = Array.prototype.concat.apply([], bufs);
		this.renderedIndex = 0;
		this.renderingDone = false;
		this.updateScroll();
	};
	Search.prototype.allPokemon = function () {
		if (this.filters) return this.filteredPokemon();
		var resultSet = [];
		for (var id in BattlePokedex) {
			switch (id) {
			case 'bulbasaur':
				resultSet.push(['header', "Generation 1", 0]);
				break;
			case 'chikorita':
				resultSet.push(['header', "Generation 2", 0]);
				break;
			case 'treecko':
				resultSet.push(['header', "Generation 3", 0]);
				break;
			case 'turtwig':
				resultSet.push(['header', "Generation 4", 0]);
				break;
			case 'victini':
				resultSet.push(['header', "Generation 5", 0]);
				break;
			case 'chespin':
				resultSet.push(['header', "Generation 6", 0]);
				break;
			case 'missingno':
				resultSet.push(['header', "Glitch", 0]);
				break;
			case 'tomohawk':
				resultSet.push(['header', "CAP", 0]);
				break;
			case 'pikachucosplay':
				continue;
			}
			resultSet.push(['pokemon', id, 0]);
		}
		this.resultSet = resultSet;
		this.renderedIndex = 0;
		this.renderingDone = false;
		this.updateScroll();
	};
	Search.prototype.allMoves = function () {
		if (this.filters) return this.filteredMoves();
		var resultSet = [];
		resultSet.push(['header', "Moves", 0]);
		for (var id in BattleMovedex) {
			switch (id) {
			case 'paleowave':
				resultSet.push(['header', "CAP moves", 0]);
				break;
			case 'magikarpsrevenge':
				continue;
			}
			resultSet.push(['move', id, 0]);
		}
		this.resultSet = resultSet;
		this.renderedIndex = 0;
		this.renderingDone = false;
		this.updateScroll();
	};
	Search.prototype.getFilterText = function (q) {
		var buf = '<p>Filters: ';
		for (var i = 0; i < this.filters.length; i++) {
			var text = this.filters[i][1];
			if (this.filters[i][0] === 'move') text = Tools.getMove(text).name;
			if (this.filters[i][0] === 'pokemon') text = Tools.getTemplate(text).name;
			buf += '<button class="filter" value="' + Tools.escapeHTML(this.filters[i].join(':')) + '">' + text + ' <i class="fa fa-times-circle"></i></button> ';
		}
		if (!q) buf += '<small style="color: #888">(backspace = delete filter)</small>';
		return buf + '</p>';
	};
	Search.prototype.filteredPokemon = function () {
		var resultSet = [['html', this.getFilterText(), 0]];
		resultSet.push(['header', "Filtered results", 0]);
		var illegalResultSet = [];
		var filters = this.filters;
		for (var id in BattlePokedex) {
			var template = BattlePokedex[id];
			if (template.exists === false) continue;
			for (var i = 0; i < filters.length; i++) {
				if (filters[i][0] === 'type') {
					var type = filters[i][1];
					if (template.types[0] !== type && template.types[1] !== type) break;
				} else if (filters[i][0] === 'egggroup') {
					var egggroup = filters[i][1];
					if (template.eggGroups[0] !== egggroup && template.eggGroups[1] !== egggroup) break;
				} else if (filters[i][0] === 'ability') {
					var ability = filters[i][1];
					if (template.abilities['0'] !== ability && template.abilities['1'] !== ability && template.abilities['H'] !== ability) break;
				} else if (filters[i][0] === 'move') {
					var learned = false;
					var learnsetid = id;
					while (true) {
						var learnset = BattleLearnsets[learnsetid];
						if (learnset && (filters[i][1] in learnset.learnset)) {
							learned = true;
							break;
						}
						var learnsetTemplate = BattlePokedex[learnsetid];
						if (learnsetTemplate.baseSpecies && !learnset) learnsetid = toId(learnsetTemplate.baseSpecies);
						else if (learnsetTemplate.prevo) learnsetid = learnsetTemplate.prevo;
						else break;
					}
					if (!learned) break;
				}
			}
			if (i < filters.length) continue;
			if (this.legalityFilter && !(id in this.legalityFilter)) {
				illegalResultSet.push(['pokemon', id, -1]);
			} else {
				resultSet.push(['pokemon', id, 0]);
			}
		}
		this.resultSet = resultSet.concat(illegalResultSet);
		this.renderedIndex = 0;
		this.renderingDone = false;
		this.updateScroll();
	};
	Search.prototype.filteredMoves = function () {
		var resultSet = [['html', this.getFilterText(), 0]];
		resultSet.push(['header', "Filtered results", 0]);
		var illegalResultSet = [];
		var filters = this.filters;
		for (var id in BattleMovedex) {
			var move = BattleMovedex[id];
			if (move.exists === false) continue;
			for (var i = 0; i < filters.length; i++) {
				if (filters[i][0] === 'type') {
					if (move.type !== filters[i][1]) break;
				} else if (filters[i][0] === 'category') {
					if (move.category !== filters[i][1]) break;
				} else if (filters[i][0] === 'pokemon') {
					var learned = false;
					var learnsetid = filters[i][1];
					while (true) {
						var learnset = BattleLearnsets[learnsetid];
						if (learnset && (id in learnset.learnset)) {
							learned = true;
							break;
						}
						var learnsetTemplate = BattlePokedex[learnsetid];
						if (learnsetTemplate.baseSpecies && !learnset) learnsetid = toId(learnsetTemplate.baseSpecies);
						else if (learnsetTemplate.prevo) learnsetid = learnsetTemplate.prevo;
						else break;
					}
					if (!learned) break;
				}
			}
			if (i < filters.length) continue;
			if (this.legalityFilter && !(id in this.legalityFilter)) {
				illegalResultSet.push(['move', id, -1]);
			} else {
				resultSet.push(['move', id, 0]);
			}
		}
		this.resultSet = resultSet.concat(illegalResultSet);
		this.renderedIndex = 0;
		this.renderingDone = false;
		this.updateScroll();
	};
	Search.prototype.updateScroll = function (forceAdd) {
		if (this.renderingDone) return;
		var top = this.$viewport.scrollTop();
		var bottom = top + this.$viewport.height();
		var i = this.renderedIndex;
		var finalIndex = Math.floor(bottom / 33) + 10;
		if (forceAdd && finalIndex < i + 20) finalIndex = i + 20;
		if (finalIndex <= i) return;

		var resultSet = this.resultSet || this.defaultResultSet;
		var buf = '';
		while (i < finalIndex) {
			if (!resultSet[i]) {
				this.renderingDone = true;
				break;
			}
			var row = resultSet[i];

			var errorMessage = '';
			if (row[2] < 0) {
				errorMessage = '<span class="col illegalcol"><em>' + this.legalityLabel + '</em></span>';
				row[2] = 0;
			}

			buf += Search.renderRow(row[1], row[0], 0, row[2], errorMessage, row[1] in this.cur ? ' class="cur"' : '');

			i++;
		}
		if (!this.renderedIndex) {
			this.el.innerHTML = '<ul class="utilichart" style="height:' + (resultSet.length * 33) + 'px">' + buf + '</ul>';
		} else {
			$(this.el.firstChild).append(buf);
		}
		this.renderedIndex = i;
	};
	Search.prototype.setType = function (qType, format, set, cur) {
		if (!format) format = '';
		if (this.qType !== qType) this.filters = null;
		this.qType = qType;
		this.q = undefined;
		this.cur = cur || {};
		this.legalityFilter = {};
		this.legalityLabel = "Illegal";
		var gen = 6;
		if (format.slice(0, 3) === 'gen') gen = (Number(format.charAt(3)) || 6);
		var requirePentagon = (format === 'vgc2016');
		var template;
		this.resultSet = null;
		this.defaultResultSet = null;

		switch (qType) {
		case 'pokemon':
			if (!BattleTeambuilderTable.tierSet) {
				BattleTeambuilderTable.tierSet = BattleTeambuilderTable.tiers.map(function (r) {
					if (typeof r === 'string') return ['pokemon', r, 0];
					return [r[0], r[1], 0];
				});
				BattleTeambuilderTable.tiers = null;
			}
			var tierSet = BattleTeambuilderTable.tierSet;
			var slices = BattleTeambuilderTable.formatSlices;
			if (format === 'uber') tierSet = tierSet.slice(slices.Uber);
			else if (format === 'ou') tierSet = tierSet.slice(slices.OU);
			else if (format === 'uu') tierSet = tierSet.slice(slices.UU);
			else if (format === 'ru') tierSet = tierSet.slice(slices.RU);
			else if (format === 'nu') tierSet = tierSet.slice(slices.NU);
			else if (format === 'pu') tierSet = tierSet.slice(slices.PU);
			else if (format === 'lc') tierSet = tierSet.slice(slices.LC);
			else if (format === 'cap') tierSet = tierSet.slice(0, slices.Uber).concat(tierSet.slice(slices.OU));
			else if (format === 'ag') tierSet = [['header', "AG", 0], ['pokemon', 'rayquazamega', 0]].concat(tierSet.slice(slices.Uber));
			else tierSet = tierSet.slice(slices.OU, slices.UU).concat([['header', "AG", 0], ['pokemon', 'rayquazamega', 0]]).concat(tierSet.slice(slices.Uber, slices.OU)).concat(tierSet.slice(slices.UU));
			this.defaultResultSet = tierSet;
			this.legalityLabel = "Banned";
			break;

		case 'item':
			var itemSet = [['header', "Items", 0]];
			for (var id in BattleItems) {
				itemSet.push(['item', id, 0]);
			}
			this.defaultResultSet = itemSet;
			this.legalityFilter = null;
			break;

		case 'ability':
			template = Tools.getTemplate(set.species);
			var abilitySet = [['header', "Abilities", 0]];
			if (template.isMega) {
				abilitySet.unshift(['html', '<p>Will be <strong>' + Tools.escapeHTML(template.abilities['0']) + '</strong> after Mega Evolving.</p>']);
				template = Tools.getTemplate(template.baseSpecies);
			}
			abilitySet.push(['ability', toId(template.abilities['0']), 0]);
			if (template.abilities['1']) {
				abilitySet.push(['ability', toId(template.abilities['1']), 0]);
			}
			if (template.abilities['H']) {
				abilitySet.push(['header', "Hidden Ability", 0]);
				abilitySet.push(['ability', toId(template.abilities['H']), 0]);
			}
			this.defaultResultSet = abilitySet;
			break;

		case 'move':
			template = Tools.getTemplate(set.species);
			if (!(toId(template.species) in BattleLearnsets)) template = Tools.getTemplate(template.baseSpecies);
			var moves = [];
			var sketch = false;
			while (true) {
				var learnsetTemplate = BattleLearnsets[toId(template.species)];
				if (learnsetTemplate) {
					for (var l in learnsetTemplate.learnset) {
						if (requirePentagon && !learnsetTemplate.learnset[l].length) continue;
						if (moves.indexOf(l) >= 0) continue;
						moves.push(l);
						if (l === 'sketch') sketch = true;
						if (l === 'hiddenpower') {
							moves.push('hiddenpowerbug', 'hiddenpowerdark', 'hiddenpowerdragon', 'hiddenpowerelectric', 'hiddenpowerfighting', 'hiddenpowerfire', 'hiddenpowerflying', 'hiddenpowerghost', 'hiddenpowergrass', 'hiddenpowerground', 'hiddenpowerice', 'hiddenpowerpoison', 'hiddenpowerpsychic', 'hiddenpowerrock', 'hiddenpowersteel', 'hiddenpowerwater');
						}
					}
				}
				if (!template.prevo) break;
				template = BattlePokedex[template.prevo];
			}
			if (sketch) {
				moves = [];
				for (var i in BattleMovedex) {
					if (i === 'chatter' || i === 'magikarpsrevenge' || i === 'paleowave' || i === 'shadowstrike') continue;
					moves.push(i);
				}
			}

			moves.sort();

			var usableMoves = [];
			var uselessMoves = [];
			for (var i = 0; i < moves.length; i++) {
				var id = moves[i];
				var isViable = BattleMovedex[id] && BattleMovedex[id].isViable;
				if (id === 'aerialace') isViable = (toId(set.ability) === 'technician');
				if (id === 'dynamicpunch') isViable = (toId(set.ability) === 'noguard');
				if (id === 'icywind') isViable = (toId(set.species).substr(0, 6) === 'keldeo');
				if (id === 'focuspunch') isViable = (toId(set.species) === 'breloom');
				if (id === 'skyattack') isViable = (toId(set.species) === 'hawlucha');
				if (id === 'counter') isViable = (toId(set.species) in {chansey:1, skarmory:1, clefable:1, wobbuffet:1});
				if (isViable) {
					if (!usableMoves.length) usableMoves.push(['header', "Moves", 0]);
					usableMoves.push(['move', id, 0]);
				} else {
					if (!uselessMoves.length) uselessMoves.push(['header', "Usually useless moves", 0]);
					uselessMoves.push(['move', id, 0]);
				}
			}
			this.defaultResultSet = usableMoves.concat(uselessMoves);
			break;
		}

		if (this.legalityFilter) {
			for (var i = 0; i < this.defaultResultSet.length; i++) {
				if (this.defaultResultSet[i][0] !== 'header') {
					this.legalityFilter[this.defaultResultSet[i][1]] = 1;
				}
			}
		}

		this.renderedIndex = 0;
		this.renderingDone = false;
		this.find('');
	};

	Search.getClosest = function (query) {
		// binary search through the index!
		var left = 0;
		var right = BattleSearchIndex.length - 1;
		while (right > left) {
			var mid = Math.floor((right - left) / 2 + left);
			if (BattleSearchIndex[mid] === query) {
				// that's us
				if (BattleSearchIndex[mid - 1] === query) mid--;
				return mid;
			} else if (BattleSearchIndex[mid] < query) {
				left = mid + 1;
			} else {
				right = mid - 1;
			}
		}
		if (!BattleSearchIndex[left]) left--;
		else if (BattleSearchIndex[left + 1] && BattleSearchIndex[left] < query) left++;
		if (BattleSearchIndex[left - 1] === query) left--;
		return left;
	};

/*********************************************************
 * Rendering functions
 *********************************************************/

	// These are all static!

	Search.renderRow = function (id, type, matchStart, matchLength, errorMessage, attrs) {
		// errorMessage = '<span class="col illegalcol"><em>' + errorMessage + '</em></span>';
		switch (type) {
		case 'html':
			return '<li class="result">' + id + '</li>';
		case 'header':
			return '<li class="result"><h3>' + id + '</h3></li>';
		case 'pokemon':
			var pokemon = BattlePokedex[id];
			return Search.renderPokemonRow(pokemon, matchStart, matchLength, errorMessage, attrs);
		case 'move':
			var move = BattleMovedex[id];
			return Search.renderMoveRow(move, matchStart, matchLength, errorMessage, attrs);
		case 'item':
			var item = BattleItems[id];
			return Search.renderItemRow(item, matchStart, matchLength, errorMessage, attrs);
		case 'ability':
			var ability = BattleAbilities[id];
			return Search.renderAbilityRow(ability, matchStart, matchLength, errorMessage, attrs);
		case 'type':
			var type = {name: id[0].toUpperCase() + id.substr(1)};
			return Search.renderTypeRow(type, matchStart, matchLength, errorMessage);
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
			var egggroup = {name: egName};
			return Search.renderEggGroupRow(egggroup, matchStart, matchLength, errorMessage);
		case 'category':
			var category = {name: id[0].toUpperCase() + id.substr(1)};
			return Search.renderCategoryRow(category, matchStart, matchLength, errorMessage);
		}
		return 'Error: not found';
	};
	Search.renderPokemonRow = function (pokemon, matchStart, matchLength, errorMessage, attrs) {
		if (!attrs) attrs = '';
		var id = toId(pokemon.species);
		if (Search.urlRoot) attrs += ' href="' + Search.urlRoot + 'pokemon/' + id + '" data-target="push"';
		var buf = '<li class="result"><a' + attrs + ' data-entry="pokemon:' + Tools.escapeHTML(pokemon.species) + '">';

		// number
		// buf += '<span class="col numcol">' + (pokemon.num >= 0 ? pokemon.num : 'CAP') + '</span> ';
		buf += '<span class="col numcol">' + (pokemon.tier || Tools.getTemplate(pokemon.baseSpecies).tier) + '</span> ';

		// icon
		buf += '<span class="col iconcol">';
		buf += '<span style="' + Tools.getIcon(pokemon) + '"></span>';
		buf += '</span> ';

		// name
		var name = pokemon.species;
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
				name += '<small>' + pokemon.species.substr(tagStart, matchStart - tagStart) + '<b>' + pokemon.species.substr(matchStart, matchLength) + '</b>' + pokemon.species.substr(matchStart + matchLength) + '</small>';
			} else {
				name += '<small>' + pokemon.species.substr(tagStart) + '</small>';
			}
		}
		buf += '<span class="col pokemonnamecol" style="white-space:nowrap">' + name + '</span> ';

		// error
		if (errorMessage) {
			buf += errorMessage + '</a></li>';
			return buf;
		}

		// type
		buf += '<span class="col typecol">';
		for (var i = 0; i < pokemon.types.length; i++) {
			buf += Tools.getTypeIcon(pokemon.types[i]);
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
			if (i === 'H') ability = '</span><span class="col abilitycol' + (pokemon.unreleasedHidden ? ' unreleasedhacol' : ' hacol') + '"><em>' + pokemon.abilities[i] + '</em>';
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

		buf += '</a></li>';

		return buf;
	};
	Search.renderTaggedPokemonRowInner = function (pokemon, tag, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="' + Search.urlRoot + 'pokemon/' + toId(pokemon.species) + '" data-target="push"';
		var buf = '<a' + attrs + ' data-entry="pokemon:' + Tools.escapeHTML(pokemon.species) + '">';

		// tag
		buf += '<span class="col tagcol shorttagcol">' + tag + '</span> ';

		// icon
		buf += '<span class="col iconcol">';
		buf += '<span style="' + Tools.getIcon(pokemon) + '"></span>';
		buf += '</span> ';

		// name
		var name = pokemon.species;
		var tagStart = (pokemon.forme ? name.length - pokemon.forme.length - 1 : 0);
		if (tagStart) name = name.substr(0, tagStart) + '<small>' + pokemon.species.substr(tagStart) + '</small>';
		buf += '<span class="col shortpokemonnamecol" style="white-space:nowrap">' + name + '</span> ';

		// error
		if (errorMessage) {
			buf += errorMessage + '</a></li>';
			return buf;
		}

		// type
		buf += '<span class="col typecol">';
		for (var i = 0; i < pokemon.types.length; i++) {
			buf += Tools.getTypeIcon(pokemon.types[i]);
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

	Search.renderItemRow = function (item, matchStart, matchLength, errorMessage, attrs) {
		if (!attrs) attrs = '';
		var id = toId(item.name);
		if (Search.urlRoot) attrs += ' href="' + Search.urlRoot + 'items/' + id + '" data-target="push"';
		var buf = '<li class="result"><a' + attrs + ' data-entry="item:' + Tools.escapeHTML(item.name) + '">';

		// icon
		buf += '<span class="col itemiconcol">';
		buf += '<span style="' + Tools.getItemIcon(item) + '"></span>';
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
		buf += '<span class="col itemdesccol">' + Tools.escapeHTML(item.shortDesc || item.desc) + '</span> ';

		buf += '</a></li>';

		return buf;
	};
	Search.renderAbilityRow = function (ability, matchStart, matchLength, errorMessage, attrs) {
		if (!attrs) attrs = '';
		var id = toId(ability.name);
		if (Search.urlRoot) attrs += ' href="' + Search.urlRoot + 'abilities/' + id + '" data-target="push"';
		var buf = '<li class="result"><a' + attrs + ' data-entry="ability:' + Tools.escapeHTML(ability.name) + '">';

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

		buf += '<span class="col abilitydesccol">' + Tools.escapeHTML(ability.shortDesc || ability.desc) + '</span> ';

		buf += '</a></li>';

		return buf;
	};
	Search.renderMoveRow = function (move, matchStart, matchLength, errorMessage, attrs) {
		if (!attrs) attrs = '';
		var id = toId(move.name);
		if (Search.urlRoot) attrs += ' href="' + Search.urlRoot + 'moves/' + id + '" data-target="push"';
		var buf = '<li class="result"><a' + attrs + ' data-entry="move:' + Tools.escapeHTML(move.name) + '">';

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
		buf += '<span class="col movenamecol">' + name + '</span> ';

		// error
		if (errorMessage) {
			buf += errorMessage + '</a></li>';
			return buf;
		}

		// type
		buf += '<span class="col typecol">';
		buf += Tools.getTypeIcon(move.type);
		buf += '<img src="' + Tools.resourcePrefix + 'sprites/categories/' + move.category + '.png" alt="' + move.category + '" height="14" width="32" />';
		buf += '</span> ';

		// power, accuracy, pp
		buf += '<span class="col labelcol">' + (move.category !== 'Status' ? ('<em>Power</em><br />' + (move.basePower || '&mdash;')) : '') + '</span> ';
		buf += '<span class="col widelabelcol"><em>Accuracy</em><br />' + (move.accuracy && move.accuracy !== true ? move.accuracy + '%' : '&mdash;') + '</span> ';
		buf += '<span class="col pplabelcol"><em>PP</em><br />' + (move.pp !== 1 ? move.pp * 8 / 5 : move.pp) + '</span> ';

		// desc
		buf += '<span class="col movedesccol">' + Tools.escapeHTML(move.shortDesc || move.desc) + '</span> ';

		buf += '</a></li>';

		return buf;
	};
	Search.renderMoveRowInner = function (move, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="' + Search.urlRoot + 'moves/' + toId(move.name) + '" data-target="push"';
		var buf = '<a' + attrs + ' data-entry="move:' + Tools.escapeHTML(move.name) + '">';

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
		buf += Tools.getTypeIcon(move.type);
		buf += '<img src="' + Tools.resourcePrefix + 'sprites/categories/' + move.category + '.png" alt="' + move.category + '" height="14" width="32" />';
		buf += '</span> ';

		// power, accuracy, pp
		buf += '<span class="col labelcol">' + (move.category !== 'Status' ? ('<em>Power</em><br />' + (move.basePower || '&mdash;')) : '') + '</span> ';
		buf += '<span class="col widelabelcol"><em>Accuracy</em><br />' + (move.accuracy && move.accuracy !== true ? move.accuracy + '%' : '&mdash;') + '</span> ';
		buf += '<span class="col pplabelcol"><em>PP</em><br />' + (move.pp !== 1 ? move.pp * 8 / 5 : move.pp) + '</span> ';

		// desc
		buf += '<span class="col movedesccol">' + Tools.escapeHTML(move.shortDesc || move.desc) + '</span> ';

		buf += '</a>';

		return buf;
	};
	Search.renderTaggedMoveRow = function (move, tag, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="' + Search.urlRoot + 'moves/' + toId(move.name) + '" data-target="push"';
		var buf = '<li class="result"><a' + attrs + ' data-entry="move:' + Tools.escapeHTML(move.name) + '">';

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
		buf += Tools.getTypeIcon(move.type);
		buf += '<img src="' + Tools.resourcePrefix + 'sprites/categories/' + move.category + '.png" alt="' + move.category + '" height="14" width="32" />';
		buf += '</span> ';

		// power, accuracy, pp
		buf += '<span class="col labelcol">' + (move.category !== 'Status' ? ('<em>Power</em><br />' + (move.basePower || '&mdash;')) : '') + '</span> ';
		buf += '<span class="col widelabelcol"><em>Accuracy</em><br />' + (move.accuracy && move.accuracy !== true ? move.accuracy + '%' : '&mdash;') + '</span> ';
		buf += '<span class="col pplabelcol"><em>PP</em><br />' + (move.pp !== 1 ? move.pp * 8 / 5 : move.pp) + '</span> ';

		// desc
		buf += '<span class="col movedesccol">' + Tools.escapeHTML(move.shortDesc || move.desc) + '</span> ';

		buf += '</a></li>';

		return buf;
	};

	Search.renderTypeRow = function (type, matchStart, matchLength, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="' + Search.urlRoot + 'types/' + toId(type.name) + '" data-target="push"';
		var buf = '<li class="result"><a' + attrs + ' data-entry="type:' + Tools.escapeHTML(type.name) + '">';

		// name
		var name = type.name;
		if (matchLength) {
			name = name.substr(0, matchStart) + '<b>' + name.substr(matchStart, matchLength) + '</b>' + name.substr(matchStart + matchLength);
		}
		buf += '<span class="col namecol">' + name + '</span> ';

		// type
		buf += '<span class="col typecol">';
		buf += Tools.getTypeIcon(type.name);
		buf += '</span> ';

		// error
		if (errorMessage) {
			buf += errorMessage + '</a></li>';
			return buf;
		}

		buf += '</a></li>';

		return buf;
	};
	Search.renderCategoryRow = function (category, matchStart, matchLength, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="' + Search.urlRoot + 'categories/' + toId(category.name) + '" data-target="push"';
		var buf = '<li class="result"><a' + attrs + ' data-entry="category:' + Tools.escapeHTML(category.name) + '">';

		// name
		var name = category.name;
		if (matchLength) {
			name = name.substr(0, matchStart) + '<b>' + name.substr(matchStart, matchLength) + '</b>' + name.substr(matchStart + matchLength);
		}
		buf += '<span class="col namecol">' + name + '</span> ';

		// category
		buf += '<span class="col typecol">';
		buf += '<img src="' + Tools.resourcePrefix + 'sprites/categories/' + category.name + '.png" alt="' + category.name + '" height="14" width="32" />';
		buf += '</span> ';

		// error
		if (errorMessage) {
			buf += errorMessage + '</a></li>';
			return buf;
		}

		buf += '</a></li>';

		return buf;
	};
	Search.renderEggGroupRow = function (egggroup, matchStart, matchLength, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="' + Search.urlRoot + 'egggroups/' + toId(egggroup.name) + '" data-target="push"';
		var buf = '<li class="result"><a' + attrs + ' data-entry="egggroup:' + Tools.escapeHTML(egggroup.name) + '">';

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

	exports.BattleSearch = Search;

})(window, jQuery);
