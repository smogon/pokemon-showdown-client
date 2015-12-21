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
		this.exactMatch = false;

		this.resultSet = null;
		this.filters = null;
		this.renderedIndex = 0;
		this.renderingDone = true;

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
			if (qType === 'pokemon') {
				this.allPokemon();
				return true;
			} else if (qType === 'moves') {
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
		case 'moves': qTypeIndex = 2; break;
		case 'items': qTypeIndex = 3; break;
		case 'abilities': qTypeIndex = 4; break;
		}

		var qFilterType = '';
		if (query.slice(-4) === 'type') {
			if ((query.charAt(0).toUpperCase() + query.slice(1, -4)) in window.BattleTypeChart) {
				query = query.slice(0, -4);
				qFilterType = 'type';
			}
		}

		var i = Search.getClosest(query);
		if (!BattleSearchIndex[i]) i--;
		if (BattleSearchIndex[i - 1] && BattleSearchIndex[i - 1] === query) i--;
		this.exactMatch = (query === BattleSearchIndex[i]);

		var bufs = ['', '', '', '', '', '', ''];
		var topbufIndex = -1;

		var nearMatch = (BattleSearchIndex[i].substr(0, query.length) !== query);
		this.renderingDone = false;
		if (nearMatch && i) i--;
		for (var j = 0; j < 15; j++) {
			var id = BattleSearchIndex[i + j];
			var type = BattleSearchIndexType[i + j];
			var matchLength = query.length;

			if (!id) break;
			if (id.substr(0, query.length) !== query) {
				this.renderingDone = true;
				if (!(nearMatch && j <= 1)) break;
				matchLength = 0;
			} else {
				matchLength += (BattleSearchIndexOffset[i + j][matchLength - 1] || '0').charCodeAt(0) - 48;
			}

			var typeIndex = typeTable[type];
			if (qType === 'pokemon' && (typeIndex === 3 || typeIndex > 5)) continue;
			if (qType === 'moves' && (typeIndex !== 6 && typeIndex > 2)) continue;
			if (qFilterType === 'type' && typeIndex !== 1) continue;

			var errorMessage = '';
			if (qType && qTypeIndex !== typeIndex) errorMessage = '<span class="col filtercol"><em>Filter</em></span>';

			if (j === 0 && this.exactMatch) {
				topbufIndex = typeIndex;
			}

			if (!bufs[typeIndex]) bufs[typeIndex] = '<li class="resultheader"><h3>' + typeName[type] + '</h3></li>';
			bufs[typeIndex] += Search.renderRow(id, type, 0, matchLength, errorMessage);
		}

		var topbuf = '';
		if (this.filters) {
			topbuf = Search.renderRow(this.getFilterText(1), 'html', 0);
		}
		if (topbufIndex >= 0) {
			topbuf += bufs[topbufIndex];
			bufs[topbufIndex] = '';
		}
		if (query === 'grass' || query === 'flying') {
			topbuf += bufs[5];
			bufs[5] = '';
		}

		if (nearMatch && !qType) topbuf = '<li class="notfound"><em>No exact match found. The closest matches alphabetically are:</em></li>' + topbuf;

		this.el.innerHTML = '<ul class="utilichart">' + topbuf + bufs.join('') + '</ul>' + (this.renderingDone ? '' : '<ul class="utilichart"><li class="more"><button class="utilichart-all">All results</button></li></ul>');
		return true;
	};
	Search.prototype.addFilter = function (name, result) {
		if (this.qType === 'pokemon') {
			result = result.split('/');
			if (result[0] !== 'types' && result[0] !== 'moves' && result[0] !== 'abilities' && result[0] !== 'egggroups') return;
			if (result[0] === 'types') result[1] = name;
			if (result[0] === 'abilities') result[1] = name;
			if (result[0] === 'egggroups') result[1] = name;
			if (!this.filters) this.filters = [];
			this.q = undefined;
			for (var i = 0; i < this.filters.length; i++) {
				if (this.filters[i][0] === result[0] && this.filters[i][1] === result[1]) {
					return true;
				}
			}
			this.filters.push(result);
			return true;
		} else if (this.qType === 'moves') {
			result = result.split('/');
			if (result[0] !== 'types' && result[0] !== 'categories' && result[0] !== 'pokemon') return;
			if (result[0] === 'types') result[1] = name;
			if (result[0] === 'categories') result[1] = name;
			if (!this.filters) this.filters = [];
			this.filters.push(result);
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
		var buf = 'Filters: ';
		for (var i = 0; i < this.filters.length; i++) {
			if (i) buf += ', ';
			var text = this.filters[i][1];
			if (this.filters[i][0] === 'moves') text = Tools.getMove(text).name;
			if (this.filters[i][0] === 'pokemon') text = Tools.getTemplate(text).name;
			buf += '<strong style="padding:1px 3px; border-radius: 3px; border: 1px solid #777">' + text + '</strong>';
		}
		if (!q) buf += ' <small style="color: #888">(backspace = delete filter)</small>';
		return buf;
	};
	Search.prototype.filteredPokemon = function () {
		var resultSet = [['html', this.getFilterText(), 0]];
		resultSet.push(['header', "Filtered results", 0]);
		var filters = this.filters;
		for (var id in BattlePokedex) {
			var template = BattlePokedex[id];
			for (var i = 0; i < filters.length; i++) {
				if (filters[i][0] === 'types') {
					var type = filters[i][1];
					if (template.types[0] !== type && template.types[1] !== type) break;
				} else if (filters[i][0] === 'egggroups') {
					var egggroup = filters[i][1];
					if (template.eggGroups[0] !== egggroup && template.eggGroups[1] !== egggroup) break;
				} else if (filters[i][0] === 'abilities') {
					var ability = filters[i][1];
					if (template.abilities['0'] !== ability && template.abilities['1'] !== ability && template.abilities['H'] !== ability) break;
				} else if (filters[i][0] === 'moves') {
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
			resultSet.push(['pokemon', id, 0]);
		}
		this.resultSet = resultSet;
		this.renderedIndex = 0;
		this.renderingDone = false;
		this.updateScroll();
	};
	Search.prototype.filteredMoves = function () {
		var resultSet = [['html', this.getFilterText(), 0]];
		resultSet.push(['header', "Filtered results", 0]);
		var filters = this.filters;
		for (var id in BattleMovedex) {
			var move = BattleMovedex[id];
			for (var i = 0; i < filters.length; i++) {
				if (filters[i][0] === 'types') {
					if (move.type !== filters[i][1]) break;
				} else if (filters[i][0] === 'categories') {
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
			resultSet.push(['move', id, 0]);
		}
		this.resultSet = resultSet;
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

		var buf = '';
		while (i < finalIndex) {
			if (!this.resultSet[i]) {
				this.renderingDone = true;
				break;
			}
			var row = this.resultSet[i];

			buf += Search.renderRow(row[1], row[0], 0, row[2]);

			i++;
		}
		if (!this.renderedIndex) {
			this.el.innerHTML = '<ul class="utilichart" style="height:' + (this.resultSet.length * 33) + 'px">' + buf + '</ul>';
			// (this.renderingDone ? '' : '<ul class="utilichart"><li class="more more-autoscroll"><button>More</button></li></ul>');
		} else {
			$(this.el.firstChild).append(buf);
			// if (this.renderingDone) {
			// 	this.$el.find('li.more').parent().remove();
			// }
		}
		this.renderedIndex = i;
	};

	Search.getClosest = function (query) {
		// binary search through the index!
		var left = 0;
		var right = BattleSearchIndex.length - 1;
		while (right >= left) {
			var mid = Math.floor((right - left) / 2 + left);
			if (BattleSearchIndex[mid] === query) {
				// that's us
				return mid;
			} else if (BattleSearchIndex[mid] < query) {
				left = mid + 1;
			} else {
				right = mid - 1;
			}
		}
		return left;
	};

	//
	// Rendering functions
	//
	// These are all static!
	//

	Search.renderRow = function (id, type, matchStart, matchLength, errorMessage) {
		// errorMessage = '<span class="col illegalcol"><em>' + errorMessage + '</em></span>';
		switch (type) {
		case 'html':
			return '<li class="result">' + id + '</li>';
		case 'header':
			return '<li class="result"><h3>' + id + '</h3></li>';
		case 'pokemon':
			var pokemon = BattlePokedex[id];
			return Search.renderPokemonRow(pokemon, matchStart, matchLength, errorMessage);
		case 'move':
			var move = BattleMovedex[id];
			return Search.renderMoveRow(move, matchStart, matchLength, errorMessage);
		case 'item':
			var item = BattleItems[id];
			return Search.renderItemRow(item, matchStart, matchLength, errorMessage);
		case 'ability':
			var ability = BattleAbilities[id];
			return Search.renderAbilityRow(ability, matchStart, matchLength, errorMessage);
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
	Search.renderPokemonRow = function (pokemon, matchStart, matchLength, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="' + Search.urlRoot + 'pokemon/' + toId(pokemon.species) + '" data-target="push"';
		var buf = '<li class="result"><a' + attrs + ' data-name="' + Tools.escapeHTML(pokemon.species) + '">';

		// number
		buf += '<span class="col numcol">' + (pokemon.num >= 0 ? pokemon.num : 'CAP') + '</span> ';

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

		buf += '</a></li>';

		return buf;
	};
	Search.renderTaggedPokemonRowInner = function (pokemon, tag, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="' + Search.urlRoot + 'pokemon/' + toId(pokemon.species) + '" data-target="push"';
		var buf = '<a' + attrs + ' data-name="' + Tools.escapeHTML(pokemon.species) + '">';

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

	Search.renderItemRow = function (item, matchStart, matchLength, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="' + Search.urlRoot + 'items/' + toId(item.name) + '" data-target="push"';
		var buf = '<li class="result"><a' + attrs + ' data-name="' + Tools.escapeHTML(item.name) + '">';

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
	Search.renderAbilityRow = function (ability, matchStart, matchLength, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="' + Search.urlRoot + 'abilities/' + toId(ability.name) + '" data-target="push"';
		var buf = '<li class="result"><a' + attrs + ' data-name="' + Tools.escapeHTML(ability.name) + '">';

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
	Search.renderMoveRow = function (move, matchStart, matchLength, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="' + Search.urlRoot + 'moves/' + toId(move.name) + '" data-target="push"';
		var buf = '<li class="result"><a' + attrs + ' data-name="' + Tools.escapeHTML(move.name) + '">';

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
		var buf = '<a' + attrs + ' data-name="' + Tools.escapeHTML(move.name) + '">';

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
		var buf = '<li class="result"><a' + attrs + ' data-name="' + Tools.escapeHTML(move.name) + '">';

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
		var buf = '<li class="result"><a' + attrs + ' data-name="' + Tools.escapeHTML(type.name) + '">';

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
		var buf = '<li class="result"><a' + attrs + ' data-name="' + Tools.escapeHTML(category.name) + '">';

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
		var buf = '<li class="result"><a' + attrs + ' data-name="' + Tools.escapeHTML(egggroup.name) + '">';

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
