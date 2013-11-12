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

(function(exports, $){
	'use strict';

	function Search(elem) {
		this.$el = $(elem);
		this.el = this.$el[0];
	}
	Search.prototype.$ = function(query) {
		return this.$el.find(query);
	};

	//
	// Search functions
	//

	Search.prototype.q = null;
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
	Search.prototype.find = function(query) {
		query = toId(query);

		if (query === this.q) {
			return false;
		}
		this.q = query;
		if (!query) {
			this.el.innerHTML = '';
			this.exactMatch = false;
			return true;
		}

		var i = Search.getClosest(query);
		if (!BattleSearchIndex[i]) i--;
		if (BattleSearchIndex[i-1] && BattleSearchIndex[i-1] === query) i--;
		this.exactMatch = (query === BattleSearchIndex[i]);

		var bufs = ['','','',''];
		var topbufIndex = -1;

		var nearMatch = (BattleSearchIndex[i].substr(0,query.length) !== query);
		if (nearMatch && i) i--;
		for (var j=0; j<15; j++) {
			var id = BattleSearchIndex[i+j];
			var type = BattleSearchIndexType[i+j];
			var matchLength = query.length;

			if (!id) break;
			if (id.substr(0,query.length) !== query) {
				if (!(nearMatch && j<=1)) break;
				matchLength = 0;
			}
			if (j === 0 && this.exactMatch) {
				topbufIndex = typeTable[type];
			}

			if (!bufs[typeTable[type]]) bufs[typeTable[type]] = '<li><h3>'+typeName[type]+'</h3></li>';
			bufs[typeTable[type]] += Search.renderRow(id, type, 0, matchLength + (BattleSearchIndexOffset[i+j][matchLength-1]||'0').charCodeAt(0)-48);
		}

		var topbuf = '';
		if (topbufIndex >= 0) {
			topbuf = bufs[topbufIndex];
			bufs[topbufIndex] = '';
		}

		if (nearMatch) topbuf = '<li class="notfound"><em>No exact match found. The closest matches alphabetically are:</em></li>'+topbuf;

		this.el.innerHTML = '<ul class="utilichart">'+topbuf+bufs.join('')+'</ul>';
		return true;
	};

	Search.getClosest = function(query) {
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

	Search.urlRoot = '';

	Search.renderRow = function(id, type, matchStart, matchLength, errorMessage) {
		switch (type) {
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
			var type = {name: id[0].toUpperCase()+id.substr(1)};
			return Search.renderTypeRow(type, matchStart, matchLength, errorMessage);
		case 'egggroup':
			var egggroup = {name: id[0].toUpperCase()+id.substr(1)};
			return Search.renderEggGroupRow(egggroup, matchStart, matchLength, errorMessage);
		case 'category':
			var category = {name: id[0].toUpperCase()+id.substr(1)};
			return Search.renderCategoryRow(category, matchStart, matchLength, errorMessage);
		}
		return 'Error: not found';
	};
	Search.renderPokemonRow = function(pokemon, matchStart, matchLength, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="'+Search.urlRoot+'pokemon/'+toId(pokemon.species)+'" data-target="push"';
		var buf = '<li class="result"><a'+attrs+' data-name="'+Tools.escapeHTML(pokemon.species)+'">';

		// number
		buf += '<span class="col numcol">'+(pokemon.num>=0 ? pokemon.num : 'CAP')+'</span> ';

		// icon
		buf += '<span class="col iconcol">';
		buf += '<span style="'+Tools.getIcon(pokemon)+'"></span>';
		buf += '</span> ';

		// name
		var name = pokemon.species;
		var tagStart = (pokemon.forme ? name.length-pokemon.forme.length-1 : 0);
		if (tagStart) name = name.substr(0, tagStart);
		if (matchLength) {
			name = name.substr(0, matchStart)+'<b>'+name.substr(matchStart, matchLength)+'</b>'+name.substr(matchStart+matchLength);
		}
		if (tagStart) {
			if (matchLength && matchStart+matchLength > tagStart) {
				if (matchStart < tagStart) {
					matchLength -= tagStart - matchStart;
					matchStart = tagStart;
				}
				name += '<small>'+pokemon.species.substr(tagStart, matchStart-tagStart)+'<b>'+pokemon.species.substr(matchStart, matchLength)+'</b>'+pokemon.species.substr(matchStart+matchLength)+'</small>';
			} else {
				name += '<small>'+pokemon.species.substr(tagStart)+'</small>';
			}
		}
		buf += '<span class="col pokemonnamecol" style="white-space:nowrap">'+name+'</span> ';

		// error
		if (errorMessage) {
			buf += '<span class="col illegalcol"><em>'+errorMessage+'</em></span> ';
			buf += '</a></li>';
			return buf;
		}

		// type
		buf += '<span class="col typecol">';
		for (var i=0; i<pokemon.types.length; i++) {
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
			if (i === 'H') ability = '</span><span class="col abilitycol"><em>'+pokemon.abilities[i]+'</em>';
			buf += ability;
		}
		if (!pokemon.abilities['H']) buf += '</span><span class="col abilitycol">';
		buf += '</span>';
		buf += '</span>';

		// base stats
		buf += '<span style="float:left;min-height:26px">';
		buf += '<span class="col statcol"><em>HP</em><br />'+pokemon.baseStats.hp+'</span> ';
		buf += '<span class="col statcol"><em>Atk</em><br />'+pokemon.baseStats.atk+'</span> ';
		buf += '<span class="col statcol"><em>Def</em><br />'+pokemon.baseStats.def+'</span> ';
		buf += '<span class="col statcol"><em>SpA</em><br />'+pokemon.baseStats.spa+'</span> ';
		buf += '<span class="col statcol"><em>SpD</em><br />'+pokemon.baseStats.spd+'</span> ';
		buf += '<span class="col statcol"><em>Spe</em><br />'+pokemon.baseStats.spe+'</span> ';
		var bst = 0;
		for (i in pokemon.baseStats) bst += pokemon.baseStats[i];
		buf += '<span class="col bstcol"><em>BST<br />'+bst+'</em></span> ';
		buf += '</span>';

		buf += '</a></li>';

		return buf;
	};
	Search.renderTaggedPokemonRowInner = function(pokemon, tag, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="'+Search.urlRoot+'pokemon/'+toId(pokemon.species)+'" data-target="push"';
		var buf = '<a'+attrs+' data-name="'+Tools.escapeHTML(pokemon.species)+'">';

		// tag
		buf += '<span class="col tagcol shorttagcol">'+tag+'</span> ';

		// icon
		buf += '<span class="col iconcol">';
		buf += '<span style="'+Tools.getIcon(pokemon)+'"></span>';
		buf += '</span> ';

		// name
		var name = pokemon.species;
		var tagStart = (pokemon.forme ? name.length-pokemon.forme.length-1 : 0);
		if (tagStart) name = name.substr(0, tagStart) + '<small>'+pokemon.species.substr(tagStart)+'</small>';
		buf += '<span class="col shortpokemonnamecol" style="white-space:nowrap">'+name+'</span> ';

		// error
		if (errorMessage) {
			buf += '<span class="col illegalcol"><em>'+errorMessage+'</em></span> ';
			buf += '</a></li>';
			return buf;
		}

		// type
		buf += '<span class="col typecol">';
		for (var i=0; i<pokemon.types.length; i++) {
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
			if (i === 'H') ability = '</span><span class="col abilitycol"><em>'+pokemon.abilities[i]+'</em>';
			buf += ability;
		}
		if (!pokemon.abilities['H']) buf += '</span><span class="col abilitycol">';
		buf += '</span>';
		buf += '</span>';

		// base stats
		buf += '<span style="float:left;min-height:26px">';
		buf += '<span class="col statcol"><em>HP</em><br />'+pokemon.baseStats.hp+'</span> ';
		buf += '<span class="col statcol"><em>Atk</em><br />'+pokemon.baseStats.atk+'</span> ';
		buf += '<span class="col statcol"><em>Def</em><br />'+pokemon.baseStats.def+'</span> ';
		buf += '<span class="col statcol"><em>SpA</em><br />'+pokemon.baseStats.spa+'</span> ';
		buf += '<span class="col statcol"><em>SpD</em><br />'+pokemon.baseStats.spd+'</span> ';
		buf += '<span class="col statcol"><em>Spe</em><br />'+pokemon.baseStats.spe+'</span> ';
		var bst = 0;
		for (i in pokemon.baseStats) bst += pokemon.baseStats[i];
		buf += '<span class="col bstcol"><em>BST<br />'+bst+'</em></span> ';
		buf += '</span>';

		buf += '</a>';

		return buf;
	};

	Search.renderItemRow = function(item, matchStart, matchLength, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="'+Search.urlRoot+'items/'+toId(item.name)+'" data-target="push"';
		var buf = '<li class="result"><a'+attrs+' data-name="'+Tools.escapeHTML(item.name)+'">';

		// icon
		buf += '<span class="col itemiconcol">';
		buf += '<span style="'+Tools.getItemIcon(item)+'"></span>';
		buf += '</span> ';

		// name
		var name = item.name;
		if (matchLength) {
			name = name.substr(0, matchStart)+'<b>'+name.substr(matchStart, matchLength)+'</b>'+name.substr(matchStart+matchLength);
		}
		buf += '<span class="col namecol">'+name+'</span> ';

		// error
		if (errorMessage) {
			buf += '<span class="col illegalcol"><em>'+errorMessage+'</em></span> ';
			buf += '</a></li>';
			return buf;
		}

		// desc
		buf += '<span class="col itemdesccol">'+Tools.escapeHTML(item.shortDesc || item.desc)+'</span> ';

		buf += '</a></li>';

		return buf;
	};
	Search.renderAbilityRow = function(ability, matchStart, matchLength, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="'+Search.urlRoot+'abilities/'+toId(ability.name)+'" data-target="push"';
		var buf = '<li class="result"><a'+attrs+' data-name="'+Tools.escapeHTML(ability.name)+'">';

		// name
		var name = ability.name;
		if (matchLength) {
			name = name.substr(0, matchStart)+'<b>'+name.substr(matchStart, matchLength)+'</b>'+name.substr(matchStart+matchLength);
		}
		buf += '<span class="col namecol">'+name+'</span> ';

		// error
		if (errorMessage) {
			buf += '<span class="col illegalcol"><em>'+errorMessage+'</em></span> ';
			buf += '</a></li>';
			return buf;
		}

		buf += '<span class="col abilitydesccol">'+Tools.escapeHTML(ability.shortDesc || ability.desc)+'</span> ';

		buf += '</a></li>';

		return buf;
	};
	Search.renderMoveRow = function(move, matchStart, matchLength, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="'+Search.urlRoot+'moves/'+toId(move.name)+'" data-target="push"';
		var buf = '<li class="result"><a'+attrs+' data-name="'+Tools.escapeHTML(move.name)+'">';

		// name
		var name = move.name;
		var tagStart = (name.substr(0, 12) === 'Hidden Power' ? 12 : 0);
		if (tagStart) name = name.substr(0, tagStart);
		if (matchLength) {
			name = name.substr(0, matchStart)+'<b>'+name.substr(matchStart, matchLength)+'</b>'+name.substr(matchStart+matchLength);
		}
		if (tagStart) {
			if (matchLength && matchStart+matchLength > tagStart) {
				if (matchStart < tagStart) {
					matchLength -= tagStart - matchStart;
					matchStart = tagStart;
				}
				name += '<small>'+move.name.substr(tagStart, matchStart-tagStart)+'<b>'+move.name.substr(matchStart, matchLength)+'</b>'+move.name.substr(matchStart+matchLength)+'</small>';
			} else {
				name += '<small>'+move.name.substr(tagStart)+'</small>';
			}
		}
		buf += '<span class="col movenamecol">'+name+'</span> ';

		// error
		if (errorMessage) {
			buf += '<span class="col illegalcol"><em>'+errorMessage+'</em></span> ';
			buf += '</a></li>';
			return buf;
		}

		// type
		buf += '<span class="col typecol">';
		buf += Tools.getTypeIcon(move.type);
		buf += '<img src="' + Tools.resourcePrefix + 'sprites/categories/'+move.category+'.png" alt="'+move.category+'" height="14" width="32" />';
		buf += '</span> ';

		// power, accuracy, pp
		buf += '<span class="col labelcol">'+(move.category!=='Status'?('<em>Power</em><br />'+(move.basePower||'&mdash;')):'')+'</span> ';
		buf += '<span class="col widelabelcol"><em>Accuracy</em><br />'+(move.accuracy && move.accuracy!==true?move.accuracy+'%':'&mdash;')+'</span> ';
		buf += '<span class="col pplabelcol"><em>PP</em><br />'+(move.pp!==1?move.pp*8/5:move.pp)+'</span> ';

		// desc
		buf += '<span class="col movedesccol">'+Tools.escapeHTML(move.shortDesc || move.desc)+'</span> ';

		buf += '</a></li>';

		return buf;
	};
	Search.renderMoveRowInner = function(move, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="'+Search.urlRoot+'moves/'+toId(move.name)+'" data-target="push"';
		var buf = '<a'+attrs+' data-name="'+Tools.escapeHTML(move.name)+'">';

		// name
		var name = move.name;
		var tagStart = (name.substr(0, 12) === 'Hidden Power' ? 12 : 0);
		if (tagStart) name = name.substr(0, tagStart) + '<small>'+move.name.substr(tagStart)+'</small>';
		buf += '<span class="col movenamecol">'+name+'</span> ';

		// error
		if (errorMessage) {
			buf += '<span class="col illegalcol"><em>'+errorMessage+'</em></span> ';
			buf += '</a></li>';
			return buf;
		}

		// type
		buf += '<span class="col typecol">';
		buf += Tools.getTypeIcon(move.type);
		buf += '<img src="' + Tools.resourcePrefix + 'sprites/categories/'+move.category+'.png" alt="'+move.category+'" height="14" width="32" />';
		buf += '</span> ';

		// power, accuracy, pp
		buf += '<span class="col labelcol">'+(move.category!=='Status'?('<em>Power</em><br />'+(move.basePower||'&mdash;')):'')+'</span> ';
		buf += '<span class="col widelabelcol"><em>Accuracy</em><br />'+(move.accuracy && move.accuracy!==true?move.accuracy+'%':'&mdash;')+'</span> ';
		buf += '<span class="col pplabelcol"><em>PP</em><br />'+(move.pp!==1?move.pp*8/5:move.pp)+'</span> ';

		// desc
		buf += '<span class="col movedesccol">'+Tools.escapeHTML(move.shortDesc || move.desc)+'</span> ';

		buf += '</a>';

		return buf;
	};
	Search.renderTaggedMoveRow = function(move, tag, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="'+Search.urlRoot+'moves/'+toId(move.name)+'" data-target="push"';
		var buf = '<li class="result"><a'+attrs+' data-name="'+Tools.escapeHTML(move.name)+'">';

		// tag
		buf += '<span class="col tagcol">'+tag+'</span> ';

		// name
		var name = move.name;
		if (name.substr(0, 12) === 'Hidden Power') name = 'Hidden Power';
		buf += '<span class="col shortmovenamecol">'+name+'</span> ';

		// error
		if (errorMessage) {
			buf += '<span class="col illegalcol"><em>'+errorMessage+'</em></span> ';
			buf += '</a></li>';
			return buf;
		}

		// type
		buf += '<span class="col typecol">';
		buf += Tools.getTypeIcon(move.type);
		buf += '<img src="' + Tools.resourcePrefix + 'sprites/categories/'+move.category+'.png" alt="'+move.category+'" height="14" width="32" />';
		buf += '</span> ';

		// power, accuracy, pp
		buf += '<span class="col labelcol">'+(move.category!=='Status'?('<em>Power</em><br />'+(move.basePower||'&mdash;')):'')+'</span> ';
		buf += '<span class="col widelabelcol"><em>Accuracy</em><br />'+(move.accuracy && move.accuracy!==true?move.accuracy+'%':'&mdash;')+'</span> ';
		buf += '<span class="col pplabelcol"><em>PP</em><br />'+(move.pp!==1?move.pp*8/5:move.pp)+'</span> ';

		// desc
		buf += '<span class="col movedesccol">'+Tools.escapeHTML(move.shortDesc || move.desc)+'</span> ';

		buf += '</a></li>';

		return buf;
	};

	Search.renderTypeRow = function(type, matchStart, matchLength, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="'+Search.urlRoot+'types/'+toId(type.name)+'" data-target="push"';
		var buf = '<li class="result"><a'+attrs+' data-name="'+Tools.escapeHTML(type.name)+'">';

		// name
		var name = type.name;
		if (matchLength) {
			name = name.substr(0, matchStart)+'<b>'+name.substr(matchStart, matchLength)+'</b>'+name.substr(matchStart+matchLength);
		}
		buf += '<span class="col namecol">'+name+'</span> ';

		// error
		if (errorMessage) {
			buf += '<span class="col illegalcol"><em>'+errorMessage+'</em></span> ';
			buf += '</a></li>';
			return buf;
		}

		// type
		buf += '<span class="col typecol">';
		buf += Tools.getTypeIcon(type.name);
		buf += '</span> ';

		buf += '</a></li>';

		return buf;
	};
	Search.renderCategoryRow = function(category, matchStart, matchLength, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="'+Search.urlRoot+'categories/'+toId(category.name)+'" data-target="push"';
		var buf = '<li class="result"><a'+attrs+' data-name="'+Tools.escapeHTML(category.name)+'">';

		// name
		var name = category.name;
		if (matchLength) {
			name = name.substr(0, matchStart)+'<b>'+name.substr(matchStart, matchLength)+'</b>'+name.substr(matchStart+matchLength);
		}
		buf += '<span class="col namecol">'+name+'</span> ';

		// error
		if (errorMessage) {
			buf += '<span class="col illegalcol"><em>'+errorMessage+'</em></span> ';
			buf += '</a></li>';
			return buf;
		}

		// category
		buf += '<span class="col typecol">';
		buf += '<img src="' + Tools.resourcePrefix + 'sprites/categories/'+category.name+'.png" alt="'+category.name+'" height="14" width="32" />';
		buf += '</span> ';

		buf += '</a></li>';

		return buf;
	};
	Search.renderEggGroupRow = function(egggroup, matchStart, matchLength, errorMessage) {
		var attrs = '';
		if (Search.urlRoot) attrs = ' href="'+Search.urlRoot+'egggroups/'+toId(egggroup.name)+'" data-target="push"';
		var buf = '<li class="result"><a'+attrs+' data-name="'+Tools.escapeHTML(egggroup.name)+'">';

		// name
		var name = egggroup.name;
		if (matchLength) {
			name = name.substr(0, matchStart)+'<b>'+name.substr(matchStart, matchLength)+'</b>'+name.substr(matchStart+matchLength);
		}
		buf += '<span class="col namecol">'+name+'</span> ';

		// error
		if (errorMessage) {
			buf += '<span class="col illegalcol"><em>'+errorMessage+'</em></span> ';
			buf += '</a></li>';
			return buf;
		}

		buf += '</a></li>';

		return buf;
	};

	exports.BattleSearch = Search;

})(window, jQuery);
