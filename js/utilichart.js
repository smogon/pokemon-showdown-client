function BattleChart()
{
	var self = this;

	this.firstResult = '';
	this.exactResult = false;
	this.lastSearch = '[init]';

	// I know, I know, lots of memory
	// but these are arrays of pointers, so it's not _horrible_
	// and this let me cache sorting
	this.pokemon = [];
	for (var i in BattlePokedex)
	{
		BattlePokedex[i].name = BattlePokedex[i].species;
		this.pokemon.push(BattlePokedex[i]);
	}
	this.items = [];
	for (var i in BattleItems)
	{
		this.items.push(BattleItems[i]);
	}
	this.abilities = [];
	for (var i in BattleAbilities)
	{
		this.abilities.push(BattleAbilities[i]);
	}
	this.moves = [];
	for (var i in BattleMovedex)
	{
		this.moves.push(BattleMovedex[i]);
	}

	this.lastPokemonSort = null;
	this.lastItemSort = null;
	this.lastAbilitySort = null;
	this.lastMoveSort = null;

	this.illegalBuckets = {
		'Illegal': 'Illegal'
	};

	this.selectCallback = null;
	this.select = function(x) {
		if (self.selectCallback) self.selectCallback(x);
	};

	this.row = function(thing, attrs, match, isFirst) {
		if (isFirst)
		{
			self.firstResult = thing.name;
		}
		attrs = attrs || '';
		switch (match.thingType)
		{
		case 'pokemon':
			return self.pokemonRow(thing, attrs, match, isFirst);
			break;
		case 'item':
			return self.itemRow(thing, attrs, match, isFirst);
			break;
		case 'ability':
			return self.abilityRow(thing, attrs, match, isFirst);
			break;
		case 'move':
			return self.moveRow(thing, attrs, match, isFirst);
			break;
		}
	};
	this.pokemonRow = function(pokemon, attrs, match, isFirst) {
		var text = '<li class="result'+(isFirst?' firstresult':'')+'"><a'+attrs+' data-name="'+Tools.escapeHTML(pokemon.species)+'">';

		var tier = pokemon.tier;
		if (!tier) tier = Tools.getTemplate(pokemon.baseSpecies).tier || 'Illegal';

		text += '<span class="col numcol">'+tier+'</span> ';

		var name = Tools.escapeHTML(pokemon.name);

		if (pokemon.forme && pokemon.baseSpecies) name = pokemon.baseSpecies;
		if (match.name)
		{
			name = name.substr(0, match.name.start)+'<b>'+name.substr(match.name.start, match.name.end-match.name.start)+'</b>'+name.substr(match.name.end);
		}
		if (pokemon.forme && pokemon.baseSpecies)
		{
			if (match.name && match.name.end > pokemon.baseSpecies.length)
			{
				if (match.name.start < pokemon.baseSpecies.length+1) match.name.start = pokemon.baseSpecies.length+1;
				name += '<small>-'+pokemon.forme.substr(0, match.name.start-(pokemon.baseSpecies.length+1))+'<b>'+pokemon.name.substr(match.name.start, match.name.end-match.name.start)+'</b>'+pokemon.name.substr(match.name.end)+'</small>';
			}
			else
			{
				name += '<small>-'+pokemon.forme+'</small>';
			}
		}

		/* if (match.name)
		{
			name = name.substr(0, match.name.start)+'<b>'+name.substr(match.name.start, match.name.end-match.name.start)+'</b>'+name.substr(match.name.end);
		} */
		text += '<span class="col iconcol">';
		text += '<span style="'+Tools.getIcon(pokemon)+'"></span>';
		text += '</span> ';
		text += '<span class="col pokemonnamecol" style="white-space:nowrap">'+name+'</span> ';

		if (self.illegalBuckets[match.bucket])
		{
			text += '<span class="col illegalcol"><em>'+self.illegalBuckets[match.bucket]+'</em></span> ';
			text += '</a></li>';
			return text;
		}

		text += '<span class="col typecol">';
		for (var i=0; i<pokemon.types.length; i++)
		{
			text += Tools.getTypeIcon(pokemon.types[i], (match.type&&match.type[i]));
		}
		text += '</span> ';

		text += '<span style="float:left;min-height:26px">';
		if (pokemon.abilities['1'])
		{
			text += '<span class="col twoabilitycol">';
		}
		else
		{
			text += '<span class="col abilitycol">';
		}
		for (var i in pokemon.abilities)
		{
			var ability = pokemon.abilities[i];
			if (!ability) continue;

			if (i === '1') text += '<br />';
			if (match.ability && match.ability[i])
			{
				ability = ability.substr(0, match.ability[i].start)+'<b>'+ability.substr(match.ability[i].start, match.ability[i].end-match.ability[i].start)+'</b>'+ability.substr(match.ability[i].end);
			}
			if (i == 'H') {
				ability = '</span><span class="col abilitycol"><em>' + (pokemon.unreleasedHidden ? '<s>'+ability+'</s>' : ability) + '</em>';
			}
			text += ability;
		}
		if (!pokemon.abilities['H']) text += '</span><span class="col abilitycol">';
		text += '</span>';
		text += '</span>';

		text += '<span style="float:left;min-height:26px">';
		text += '<span class="col statcol"><em>HP</em><br />'+pokemon.baseStats.hp+'</span> ';
		text += '<span class="col statcol"><em>Atk</em><br />'+pokemon.baseStats.atk+'</span> ';
		text += '<span class="col statcol"><em>Def</em><br />'+pokemon.baseStats.def+'</span> ';
		text += '<span class="col statcol"><em>SpA</em><br />'+pokemon.baseStats.spa+'</span> ';
		text += '<span class="col statcol"><em>SpD</em><br />'+pokemon.baseStats.spd+'</span> ';
		text += '<span class="col statcol"><em>Spe</em><br />'+pokemon.baseStats.spe+'</span> ';
		var bst = 0;
		for (i in pokemon.baseStats) bst += pokemon.baseStats[i];
		text += '<span class="col bstcol"><em>BST<br />'+bst+'</em></span> ';
		text += '</span>';

		text += '</a></li>';

		return text;
	};
	this.itemRow = function(item, attrs, match, isFirst) {
		var text = '<li class="result'+(isFirst?' firstresult':'')+'"><a'+attrs+' data-name="'+Tools.escapeHTML(item.name)+'">';

		var url = item.name.toLowerCase().replace(/ /g, '-').replace(/[^a-z-]+/g, '');
		url = '/sprites/itemicons/'+url+'.png';

		text += '<span class="col itemiconcol">';
		text += '<span style="'+Tools.getItemIcon(item)+'"></span>';
		text += '</span> ';

		var name = Tools.escapeHTML(item.name);

		if (match.name)
		{
			name = name.substr(0, match.name.start)+'<b>'+name.substr(match.name.start, match.name.end-match.name.start)+'</b>'+name.substr(match.name.end);
		}
		text += '<span class="col namecol">'+name+'</span> ';

		if (self.illegalBuckets[match.bucket])
		{
			text += '<span class="col illegalcol"><em>'+self.illegalBuckets[match.bucket]+'</em></span> ';
			text += '</a></li>';
			return text;
		}

		text += '<span class="col itemdesccol">'+Tools.escapeHTML(item.shortDesc || item.desc)+'</span> ';

		text += '</a></li>';

		return text;
	};
	this.abilityRow = function(ability, attrs, match, isFirst) {
		var text = '<li class="result'+(isFirst?' firstresult':'')+'"><a'+attrs+' data-name="'+Tools.escapeHTML(ability.name)+'">';

		var name = Tools.escapeHTML(ability.name);
		if (match.name)
		{
			name = name.substr(0, match.name.start)+'<b>'+name.substr(match.name.start, match.name.end-match.name.start)+'</b>'+name.substr(match.name.end);
		}
		text += '<span class="col namecol">'+name+'</span> ';

		if (self.illegalBuckets[match.bucket])
		{
			text += '<span class="col illegalcol"><em>'+self.illegalBuckets[match.bucket]+'</em></span> ';
			text += '</a></li>';
			return text;
		}

		text += '<span class="col abilitydesccol">'+Tools.escapeHTML(ability.shortDesc || ability.desc)+'</span> ';

		text += '</a></li>';

		return text;
	};
	this.moveRow = function(move, attrs, match, isFirst) {
		var text = '<li class="result'+(isFirst?' firstresult':'')+'"><a'+attrs+' data-name="'+Tools.escapeHTML(move.name)+'">';

		var name = Tools.escapeHTML(move.name);
		var hplen = 'Hidden Power'.length;
		if (name.substr(0, hplen) === 'Hidden Power') name = 'Hidden Power';
		if (match.name)
		{
			name = name.substr(0, match.name.start)+'<b>'+name.substr(match.name.start, match.name.end-match.name.start)+'</b>'+name.substr(match.name.end);
		}
		if (move.name.substr(0, hplen) === 'Hidden Power')
		{
			if (match.name && match.name.end > hplen)
			{
				if (match.name.start < hplen+1) match.name.start = hplen+1;
				name += '<small> '+move.name.substr(hplen+1, match.name.start-(hplen+1))+'<b>'+move.name.substr(match.name.start, match.name.end-match.name.start)+'</b>'+move.name.substr(match.name.end)+'</small>';
			}
			else
			{
				name += '<small> '+move.name.substr(hplen+1)+'</small>';
			}
		}
		text += '<span class="col movenamecol">'+name+'</span> ';

		if (self.illegalBuckets[match.bucket])
		{
			text += '<span class="col illegalcol"><em>'+self.illegalBuckets[match.bucket]+'</em></span> ';
			text += '</a></li>';
			return text;
		}

		text += '<span class="col typecol">';
		text += Tools.getTypeIcon(move.type, match.type);
		text += '<img src="' + Tools.resourcePrefix + 'sprites/categories/'+move.category+'.png" alt="'+move.category+'" height="14" width="32"'+(match.category?' class="b"':'')+' />';
		text += '</span> ';

		text += '<span class="col labelcol">'+(move.category!=='Status'?('<em>Power</em><br />'+(move.basePower||'&mdash;')):'')+'</span> ';
		text += '<span class="col widelabelcol"><em>Accuracy</em><br />'+(move.accuracy && move.accuracy!==true?move.accuracy+'%':'&mdash;')+'</span> ';
		text += '<span class="col pplabelcol"><em>PP</em><br />'+(move.pp!==1?move.pp*8/5:move.pp)+'</span> ';

		text += '<span class="col movedesccol">'+Tools.escapeHTML(move.shortDesc || move.desc)+'</span> ';

		text += '</a></li>';

		return text;
	};
	this.chart = function(searchTerm, type, init, thisArrange, thisSort) {
		if (!searchTerm) searchTerm = '';
		else searchTerm = searchTerm.toLowerCase();
		if (!init && searchTerm === self.lastSearch) return;
		self.lastSearch = searchTerm;

		var chartData = {
			exact: {},
			start: {},
			contains: {},
			illegalstart: {},
			illegalcontains: {},
			fullstart: {},
			illegalfullstart: {},
			other: {}
		};
		thisArrange = thisArrange || self.defaultArrange;
		thisSort = thisSort || self.defaultSort;

		self.firstResult = '';
		self.exactResult = false;

		var buckets = thisArrange();
		var things = [];

		switch (type)
		{
		case 'pokemon':
			if (thisSort !== self.lastPokemonSort)
			{
				self.pokemon.sort(thisSort);
				self.lastPokemonSort = thisSort;
			}
			things = self.pokemon;
			break;
		case 'item':
			if (thisSort !== self.lastItemSort)
			{
				self.items.sort(thisSort);
				self.lastItemSort = thisSort;
			}
			things = self.items;
			break;
		case 'ability':
			if (thisSort !== self.lastAbilitySort)
			{
				self.abilities.sort(thisSort);
				self.lastAbilitySort = thisSort;
			}
			things = self.abilities;
			break;
		case 'move':
			if (thisSort !== self.lastMoveSort)
			{
				self.moves.sort(thisSort);
				self.lastMoveSort = thisSort;
			}
			things = self.moves;
			break;
		}

		for (var i=0; i<things.length; i++)
		{
			var thing = things[i];
			if (type==='pokemon' && !thing.species || thing.jp) continue;

			// fill our buckets!
			var bucket = thisArrange(thing);

			var match = {thing: thing, thingType: type, bucket: bucket};
			var matchType = 'other';
			var index = -1;

			if (searchTerm)
			{
				index = thing.name.toLowerCase().indexOf(searchTerm);

				if (index === 0)
				{
					matchType = 'start';
					match.name = {
						start: index,
						end: index+searchTerm.length
					};
					if (searchTerm.length === thing.name.length)
					{
						self.exactResult = thing.name;
						matchType = 'exact';
					}
				}
				else if (index >= 0)
				{
					matchType = 'contains';
					match.name = {
						start: index,
						end: index+searchTerm.length
					};
				}
				else if (type === 'pokemon')
				{
					index = thing.types[0].toLowerCase().indexOf(searchTerm);

					if (index == 0)
					{
						matchType = 'fullstart';
						match.type = {0:{
							start: 0,
							end: searchTerm.length
						}};
					}

					if (thing.types[1])
					{
						index = thing.types[1].toLowerCase().indexOf(searchTerm);

						if (index == 0)
						{
							matchType = 'fullstart';
							match.type = {1:{
								start: 0,
								end: searchTerm.length
							}};
						}
					}

					index = thing.abilities['0'].toLowerCase().indexOf(searchTerm);
					if (index == 0)
					{
						matchType = 'fullstart';
						match.ability = {0:{
							start: 0,
							end: searchTerm.length
						}};
					}

					if (thing.abilities['1'])
					{
						index = thing.abilities['1'].toLowerCase().indexOf(searchTerm);
						if (index == 0)
						{
							matchType = 'fullstart';
							match.ability = {1:{
								start: 0,
								end: searchTerm.length
							}};
						}
					}

					if (thing.abilities['H'])
					{
						index = thing.abilities['H'].toLowerCase().indexOf(searchTerm);
						if (index == 0)
						{
							matchType = 'fullstart';
							match.ability = {H:{
								start: 0,
								end: searchTerm.length
							}};
						}
					}
				}
				else if (type === 'move')
				{
					index = thing.type.toLowerCase().indexOf(searchTerm);

					if (index == 0)
					{
						matchType = 'fullstart';
						match.type = {
							start: 0,
							end: searchTerm.length
						};
					}

					index = thing.category.toLowerCase().indexOf(searchTerm);

					if (index == 0)
					{
						matchType = 'fullstart';
						match.category = {
							start: 0,
							end: searchTerm.length
						};
					}
				}
			}

			if (self.illegalBuckets[bucket])
			{
				if (matchType === 'start' || matchType === 'contains' || matchType === 'fullstart')
				{
					matchType = 'illegal'+matchType;
				}
			}

			if (!chartData[matchType][bucket]) chartData[matchType][bucket] = [];
			chartData[matchType][bucket].push(match);
		}

		// construct a chart from the filled buckets!

		var text = '<ul class="utilichart">';

		var firstMatch = true;
		var noNameMatch = false;

		var matchTypes = ['exact', 'start', 'contains', 'illegalstart', 'illegalcontains'];
		for (var mtIndex = 0; mtIndex < 5; mtIndex++)
		{
			var matchType = matchTypes[mtIndex];
			for (var i in chartData[matchType])
			{
				if (!chartData[matchType][i]) continue;
				for (var j=0; j<chartData[matchType][i].length; j++)
				{
					var match = chartData[matchType][i][j];
					if (firstMatch)
					{
						text += '<li><h3>Matches</h3></li>';
					}
					text += self.row(match.thing, '', match, firstMatch);
					firstMatch = false;
				}
			}
		}

		if (searchTerm && firstMatch)
		{
			text += '<li><h3>Matches</h3></li><li><em>No matches</em></li>';
			firstMatch = false;
			noNameMatch = true;
		}

		firstMatch = true;

		for (var i in chartData.fullstart)
		{
			if (!chartData.fullstart[i]) continue;
			for (var j=0; j<chartData.fullstart[i].length; j++)
			{
				var match = chartData.fullstart[i][j];
				if (firstMatch)
				{
					text += '<li><h3>Details Matches</h3></li>';
				}
				text += self.row(match.thing, '', match, firstMatch && noNameMatch);
				firstMatch = false;
			}
		}
		for (var i in chartData.illegalfullstart)
		{
			if (!chartData.illegalfullstart[i]) continue;
			for (var j=0; j<chartData.illegalfullstart[i].length; j++)
			{
				var match = chartData.illegalfullstart[i][j];
				if (firstMatch)
				{
					text += '<li><h3>Details Matches</h3></li>';
				}
				text += self.row(match.thing, '', match, firstMatch && noNameMatch);
				firstMatch = false;
			}
		}

		if (!searchTerm || init)
		{
			for (var i=0; i<buckets.length; i++)
			{
				var ib = buckets[i];
				if (!chartData.other[ib]) continue;
				firstMatch = true;
				for (var j=0; j<chartData.other[ib].length; j++)
				{
					var match = chartData.other[ib][j];
					if (firstMatch)
					{
						text += '<li><h3>'+buckets[i]+'</h3></li>';
						firstMatch = false;
					}
					text += self.row(match.thing, '', match);
				}
			}
		}

		text += '</ul>';
		return text;
	};

	this.defaultArrange = function(thing) {
		if (!thing)
		{
			// we want the list of buckets
			return ['All'];
		}
		return 'All';
	};
	this.defaultSort = function(a,b) {
		/* if (!a.num) a.num = 1000;
		if (!b.num) b.num = 1000;
		if (a.num != b.num)
		{
			return a.num - b.num;
		} */
		return (a.name == b.name) ? 0 : ( (a.name > b.name) ? 1 : -1 );
	};
}

var Chart = new BattleChart();
