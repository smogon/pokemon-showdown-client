/**
 * Search
 *
 * Code for searching for dex information, used by the Dex and
 * Teambuilder.
 *
 * Dependencies: battledata, search-index
 * Optional dependencies: pokedex, moves, items, abilities
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 */

type SearchType = (
	'pokemon' | 'type' | 'tier' | 'move' | 'item' | 'ability' | 'egggroup' | 'category' | 'article'
);

type SearchRow = (
	[SearchType, ID, number?, number?] | ['sortpokemon' | 'sortmove', ''] | ['header' | 'html', string]
);

/** ID, SearchType, index (if alias), offset (if offset alias) */
declare const BattleSearchIndex: [ID, SearchType, number?, number?][];
declare const BattleSearchIndexOffset: any;
declare const BattleTeambuilderTable: any;

class BattleSearch {
	q: string | undefined = undefined; // uninitialized
	/**
	 * Search result type. By default, Search will be a generic search which searches everything.
	 *
	 * Setting the result type will constrain results to be of that type, and also compatible
	 * filters.
	 */
	qType: SearchType | '' = '';
	/**
	 * Default results to display when the search field is blank.
	 */
	defaultResults: SearchRow[] | null = null;
	legalityFilter: {[id: string]: 1 | undefined} | null = null;
	legalityLabel = "Illegal";
	/** Has an exact match been found? */
	exactMatch = false;

	results: SearchRow[] | null = null;
	filters: string[][] | null = null;
	sortCol: string | null = null;
	cur: ID[] = [];
	gen = 8;
	dex: ModdedDex = Dex;
	private isDoubles = false;
	private isLetsGo = false;
	urlRoot = '//dex.pokemonshowdown.com/';

	static gen = 8;

	static typeTable = {
		pokemon: 1,
		type: 2,
		tier: 3,
		move: 4,
		item: 5,
		ability: 6,
		egggroup: 7,
		category: 8,
		article: 9,
	};
	static typeName = {
		pokemon: 'Pok&eacute;mon',
		type: 'Type',
		tier: 'Tiers',
		move: 'Moves',
		item: 'Items',
		ability: 'Abilities',
		egggroup: 'Egg group',
		category: 'Category',
		article: 'Article',
	};

	constructor(qType: SearchType | '' = '', formatid = '' as ID, set?: PokemonSet) {
		this.qType = qType;
		if (set) {
			this.setType(qType, formatid, set);
		}
	}

	find(query: string) {
		query = toID(query);

		if (query === this.q) {
			return false;
		}
		this.q = query;
		this.results = null;
		this.exactMatch = false;
		let qType = this.qType;

		if (!query) {
			// search field is blank, display default results

			if (!this.filters && !this.sortCol && this.defaultResults) {
				this.results = this.defaultResults;
				return true;
			}
			if (qType === 'pokemon') {
				this.allPokemon();
				return true;
			} else if (qType === 'move') {
				this.allMoves();
				return true;
			}
			return true;
		}

		// If qType exists, we're searching mainly for results of that type.
		// We'll still search for results of other types, but those results
		// will only be used to filter results for that type.
		let qTypeIndex = (qType ? BattleSearch.typeTable[qType] : -1);

		let qFilterType: SearchType | '' = '';
		if (query.slice(-4) === 'type') {
			if ((query.charAt(0).toUpperCase() + query.slice(1, -4)) in window.BattleTypeChart) {
				query = query.slice(0, -4);
				qFilterType = 'type';
			}
		}

		// i represents the location of the search index we're looking at
		let i = BattleSearch.getClosest(query);
		this.exactMatch = (BattleSearchIndex[i][0] === query);

		// Even with output buffer buckets, we make multiple passes through
		// the search index. searchPasses is a queue of which pass we're on:
		// [passType, i, query]

		// By doing an alias pass after the normal pass, we ensure that
		// mid-word matches only display after start matches.
		let passType: SearchPassType | '' = '';
		/**
		 * pass types:
		 * * '': time to pop the next pass off the searchPasses queue
		 * * 'normal': start at i and stop when results no longer start with query
		 * * 'alias': like normal, but output aliases instead of non-alias results
		 * * 'fuzzy': start at i and stop when you have two results
		 * * 'exact': like normal, but stop at i
		 */
		type SearchPassType = 'normal' | 'alias' | 'fuzzy' | 'exact';
		/**
		 * [passType, i, query]
		 *
		 * i = index of BattleSearchIndex to start from
		 *
		 * By doing an alias pass after the normal pass, we ensure that
		 * mid-word matches only display after start matches.
		 */
		type SearchPass = [SearchPassType, number, string];
		let searchPasses: SearchPass[] = [['normal', i, query]];

		// For performance reasons, only do an alias pass if query is at
		// least 2 chars long
		if (query.length > 1) searchPasses.push(['alias', i, query]);

		// If the query matches an official alias in BattleAliases: These are
		// different from the aliases in the search index and are given
		// higher priority. We'll do a normal pass through the index with
		// the alias text before any other passes.
		let queryAlias;
		if (query in BattleAliases) {
			if (['sub', 'tr'].includes(query) || toID(BattleAliases[query]).slice(0, query.length) !== query) {
				queryAlias = toID(BattleAliases[query]);
				let aliasPassType: SearchPassType = (queryAlias === 'hiddenpower' ? 'exact' : 'normal');
				searchPasses.unshift([aliasPassType, BattleSearch.getClosest(queryAlias), queryAlias]);
			}
			this.exactMatch = true;
		}

		// If there are no matches starting with query: Do a fuzzy match pass
		// Fuzzy matches will still be shown after alias matches
		if (!this.exactMatch && BattleSearchIndex[i][0].substr(0, query.length) !== query) {
			// No results start with this. Do a fuzzy match pass.
			let matchLength = query.length - 1;
			if (!i) i++;
			while (matchLength &&
				BattleSearchIndex[i][0].substr(0, matchLength) !== query.substr(0, matchLength) &&
				BattleSearchIndex[i - 1][0].substr(0, matchLength) !== query.substr(0, matchLength)) {
				matchLength--;
			}
			let matchQuery = query.substr(0, matchLength);
			while (i >= 1 && BattleSearchIndex[i - 1][0].substr(0, matchLength) === matchQuery) i--;
			searchPasses.push(['fuzzy', i, '']);
		}

		// We split the output buffers into 8 buckets.
		// Bucket 0 is usually unused, and buckets 1-7 represent
		// pokemon, types, moves, etc (see typeTable).

		// When we're done, the buffers are concatenated together to form
		// our results, with each buffer getting its own header, unlike
		// multiple-pass results, which have no header.

		// Notes:
		// - if we have a qType, that qType's buffer will be on top
		let bufs: SearchRow[][] = [[], [], [], [], [], [], [], [], [], []];
		let topbufIndex = -1;

		let count = 0;
		let nearMatch = false;

		/** [type, id, typeIndex] */
		let instafilter: [SearchType, ID, number] | null = null;
		let instafilterSort = [0, 1, 2, 5, 4, 3, 6, 7, 8];

		// We aren't actually looping through the entirety of the searchIndex
		for (i = 0; i < BattleSearchIndex.length; i++) {
			if (!passType) {
				let searchPass = searchPasses.shift();
				if (!searchPass) break;
				passType = searchPass[0];
				i = searchPass[1];
				query = searchPass[2];
			}

			let entry = BattleSearchIndex[i];
			let id = entry[0];
			let type = entry[1];

			if (!id) break;

			if (passType === 'fuzzy') {
				// fuzzy match pass; stop after 2 results
				if (count >= 2) {
					passType = '';
					continue;
				}
				nearMatch = true;
			} else if (passType === 'exact') {
				// exact pass; stop after 1 result
				if (count >= 1) {
					passType = '';
					continue;
				}
			} else if (id.substr(0, query.length) !== query) {
				// regular pass, time to move onto our next match
				passType = '';
				continue;
			}

			if (entry.length > 2) {
				// alias entry
				if (passType !== 'alias') continue;
			} else {
				// normal entry
				if (passType === 'alias') continue;
			}

			let typeIndex = BattleSearch.typeTable[type];

			// For performance, with a query length of 1, we only fill the first bucket
			if (query.length === 1 && typeIndex !== (qType ? qTypeIndex : 1)) continue;

			// For pokemon queries, accept types/tier/abilities/moves/eggroups as filters
			if (qType === 'pokemon' && (typeIndex === 5 || typeIndex > 7)) continue;
			if (qType === 'pokemon' && typeIndex === 3 && this.gen < 8) continue;
			// For move queries, accept types/categories as filters
			if (qType === 'move' && ((typeIndex !== 8 && typeIndex > 4) || typeIndex === 3)) continue;
			// For move queries in the teambuilder, don't accept pokemon as filters
			if (qType === 'move' && this.legalityFilter && typeIndex === 1) continue;
			// For ability/item queries, don't accept anything else as a filter
			if ((qType === 'ability' || qType === 'item') && typeIndex !== qTypeIndex) continue;
			// Query was a type name followed 'type'; only show types
			if (qFilterType === 'type' && typeIndex !== 2) continue;
			// hardcode cases of duplicate non-consecutive aliases
			if ((id === 'megax' || id === 'megay') && 'mega'.startsWith(query)) continue;

			let matchStart = 0;
			let matchEnd = 0;
			if (passType === 'alias') {
				// alias entry
				// [aliasid, type, originalid, matchStart, originalindex]
				matchStart = entry[3]!;
				let originalIndex = entry[2]!;
				if (matchStart) {
					matchEnd = matchStart + query.length;
					matchStart += (BattleSearchIndexOffset[originalIndex][matchStart] || '0').charCodeAt(0) - 48;
					matchEnd += (BattleSearchIndexOffset[originalIndex][matchEnd - 1] || '0').charCodeAt(0) - 48;
				}
				id = BattleSearchIndex[originalIndex][0];
			} else {
				matchEnd = query.length;
				if (matchEnd) matchEnd += (BattleSearchIndexOffset[i][matchEnd - 1] || '0').charCodeAt(0) - 48;
			}

			// some aliases are substrings
			if (queryAlias === id && query !== id) continue;

			if (qType && qTypeIndex !== typeIndex) {
				// This is a filter, set it as an instafilter candidate
				if (!instafilter || instafilterSort[typeIndex] < instafilterSort[instafilter[2]]) {
					instafilter = [type, id, typeIndex];
				}
			}

			// show types above Arceus formes
			if (topbufIndex < 0 && qTypeIndex < 2 && passType === 'alias' && !bufs[1].length && bufs[2].length) topbufIndex = 2;

			if (this.legalityFilter && typeIndex === qTypeIndex) {
				// Always show illegal results under legal results.
				// This is done by putting legal results (and the type header)
				// in bucket 0, and illegal results in the qType's bucket.
				// qType buckets are always on top (but under bucket 0), so
				// illegal results will be seamlessly right under legal results.
				if (!bufs[typeIndex].length && !bufs[0].length) {
					bufs[0] = [['header', BattleSearch.typeName[type]]];
				}
				if (id in this.legalityFilter) typeIndex = 0;
			} else {
				if (!bufs[typeIndex].length) {
					bufs[typeIndex] = [['header', BattleSearch.typeName[type]]];
				}
			}

			// don't match duplicate aliases
			let curBufLength = (passType === 'alias' && bufs[typeIndex].length);
			if (curBufLength && bufs[typeIndex][curBufLength - 1][1] === id) continue;

			bufs[typeIndex].push([type, id, matchStart, matchEnd]);

			count++;
		}

		let topbuf: SearchRow[] = [];
		if (nearMatch) {
			topbuf = [['html', `<em>No exact match found. The closest matches alphabetically are:</em>`]];
		}
		if (topbufIndex >= 0) {
			topbuf = topbuf.concat(bufs[topbufIndex]);
			bufs[topbufIndex] = [];
		}
		if (qTypeIndex >= 0) {
			topbuf = topbuf.concat(bufs[0]);
			topbuf = topbuf.concat(bufs[qTypeIndex]);
			bufs[qTypeIndex] = [];
			bufs[0] = [];
		}

		if (instafilter && count < 20) {
			// Result count is less than 20, so we can instafilter
			bufs.push(this.instafilter(qType, instafilter[0], instafilter[1]));
		}

		this.results = Array.prototype.concat.apply(topbuf, bufs);
		return true;
	}
	private instafilter(qType: SearchType | '', fType: SearchType, fId: ID): SearchRow[] {
		let buf: SearchRow[] = [];
		let illegalBuf: SearchRow[] = [];
		let legal = this.legalityFilter;
		if (qType === 'pokemon') {
			switch (fType) {
			case 'type':
				let type = fId.charAt(0).toUpperCase() + fId.slice(1) as TypeName;
				buf.push(['header', `${type}-type Pok&eacute;mon`]);
				for (let id in BattlePokedex) {
					if (!BattlePokedex[id].types) continue;
					if (this.dex.getSpecies(id).types.includes(type)) {
						(legal && !(id in legal) ? illegalBuf : buf).push(['pokemon', id as ID]);
					}
				}
				break;
			case 'ability':
				let ability = Dex.getAbility(fId).name;
				buf.push(['header', `${ability} Pok&eacute;mon`]);
				for (let id in BattlePokedex) {
					if (!BattlePokedex[id].abilities) continue;
					if (Dex.hasAbility(this.dex.getSpecies(id), ability)) {
						(legal && !(id in legal) ? illegalBuf : buf).push(['pokemon', id as ID]);
					}
				}
				break;
			}
		} else if (qType === 'move') {
			switch (fType) {
			case 'type':
				let type = fId.charAt(0).toUpperCase() + fId.slice(1);
				buf.push(['header', `${type}-type moves`]);
				for (let id in BattleMovedex) {
					if (BattleMovedex[id].type === type) {
						(legal && !(id in legal) ? illegalBuf : buf).push(['move', id as ID]);
					}
				}
				break;
			case 'category':
				let category = fId.charAt(0).toUpperCase() + fId.slice(1);
				buf.push(['header', `${category} moves`]);
				for (let id in BattleMovedex) {
					if (BattleMovedex[id].category === category) {
						(legal && !(id in legal) ? illegalBuf : buf).push(['move', id as ID]);
					}
				}
				break;
			}
		}
		return buf.concat(illegalBuf);
	}
	addFilter(node: HTMLElement) {
		if (!node.dataset.entry) return;
		let entry = node.dataset.entry.split('|');
		let [type] = entry;
		if (this.qType === 'pokemon') {
			if (type === this.sortCol) this.sortCol = null;
			if (!['type', 'move', 'ability', 'egggroup', 'tier'].includes(type)) return;
			if (type === 'move') entry[1] = toID(entry[1]);
			if (!this.filters) this.filters = [];
			this.q = undefined;
			for (const filter of this.filters) {
				if (filter[0] === type && filter[1] === entry[1]) {
					return true;
				}
			}
			this.filters.push(entry);
			return true;
		} else if (this.qType === 'move') {
			if (type === this.sortCol) this.sortCol = null;
			if (!['type', 'category', 'pokemon'].includes(type)) return;
			if (type === 'pokemon') entry[1] = toID(entry[1]);
			if (!this.filters) this.filters = [];
			this.filters.push(entry);
			this.q = undefined;
			return true;
		}
	}
	removeFilter(e: Event) {
		if (!this.filters) return false;
		if (e) {
			let deleted: string[] | null = null;
			const filterid = (e.currentTarget as HTMLButtonElement).value;
			// delete specific filter
			for (let i = 0; i < this.filters.length; i++) {
				if (filterid === this.filters[i].join(':')) {
					deleted = this.filters[i];
					this.filters.splice(i, 1);
					break;
				}
			}
			if (!deleted) return false;
		} else {
			this.filters.pop();
		}
		if (!this.filters.length) this.filters = null;
		this.q = undefined;
		this.find('');
		return true;
	}
	private allPokemon() {
		if (this.filters || this.sortCol) return this.filteredPokemon();
		let results: SearchRow[] = [['sortpokemon', '']];
		for (let id in BattlePokedex) {
			switch (id) {
			case 'bulbasaur':
				results.push(['header', "Generation 1"]);
				break;
			case 'chikorita':
				results.push(['header', "Generation 2"]);
				break;
			case 'treecko':
				results.push(['header', "Generation 3"]);
				break;
			case 'turtwig':
				results.push(['header', "Generation 4"]);
				break;
			case 'victini':
				results.push(['header', "Generation 5"]);
				break;
			case 'chespin':
				results.push(['header', "Generation 6"]);
				break;
			case 'rowlet':
				results.push(['header', "Generation 7"]);
				break;
			case 'grookey':
				results.push(['header', "Generation 8"]);
				break;
			case 'missingno':
				results.push(['header', "Glitch"]);
				break;
			case 'tomohawk':
				results.push(['header', "CAP"]);
				break;
			case 'pikachucosplay':
				continue;
			}
			results.push(['pokemon', id as ID]);
		}
		this.results = results;
	}
	private teambuilderPokemon(format: ID) {
		let requirePentagon = (format === 'battlespotsingles' || format === 'battledoubles' || format.slice(0, 3) === 'vgc');
		let isDoublesOrBS = this.isDoubles;

		let table = BattleTeambuilderTable;
		if (format.endsWith('cap') || format.endsWith('caplc')) {
			// CAP formats always use the singles table
			if (this.gen < 8) {
				table = table['gen' + this.gen];
			}
		} else if (this.gen === 7 && requirePentagon) {
			table = table['gen' + this.gen + 'vgc'];
			isDoublesOrBS = true;
		} else if (table['gen' + this.gen + 'doubles'] && !this.isLetsGo && (
			format.includes('doubles') || format.includes('vgc') || format.includes('triples') ||
			format.endsWith('lc') || format.endsWith('lcuu')
		)) {
			table = table['gen' + this.gen + 'doubles'];
			isDoublesOrBS = true;
		} else if (this.gen < 8) {
			table = table['gen' + this.gen];
		} else if (this.isLetsGo) {
			table = table['letsgo'];
		}

		if (!table.tierSet) {
			table.tierSet = table.tiers.map((r: any) => {
				if (typeof r === 'string') return ['pokemon', r];
				return [r[0], r[1]];
			});
			table.tiers = null;
		}
		let tierSet: SearchRow[] = table.tierSet;
		let slices: {[k: string]: number} = table.formatSlices;
		let agTierSet: SearchRow[] = [];
		if (this.gen >= 6) agTierSet = [['header', "AG"], ['pokemon', 'rayquazamega' as ID]];
		if (format === 'ubers' || format === 'uber') tierSet = tierSet.slice(slices.Uber);
		else if (format === 'vgc2017') tierSet = tierSet.slice(slices.Regular);
		else if (format === 'vgc2018') tierSet = tierSet.slice(slices.Regular);
		else if (format.startsWith('vgc2019')) tierSet = tierSet.slice(slices["Restricted Legendary"]);
		else if (format === 'battlespotsingles') tierSet = tierSet.slice(slices.Regular);
		else if (format === 'battlespotdoubles') tierSet = tierSet.slice(slices.Regular);
		else if (format === 'ou') tierSet = tierSet.slice(slices.OU);
		else if (format === 'uu') tierSet = tierSet.slice(slices.UU);
		else if (format === 'ru') tierSet = tierSet.slice(slices.RU || slices.UU);
		else if (format === 'nu') tierSet = tierSet.slice(slices.NU);
		else if (format === 'pu') tierSet = tierSet.slice(slices.PU || slices.NU);
		else if (format === 'zu') tierSet = tierSet.slice(slices.ZU || slices.PU || slices.NU);
		else if (format === 'lc' || format === 'lcuu') tierSet = tierSet.slice(slices.LC);
		else if (format === 'cap') tierSet = tierSet.slice(0, slices.Uber).concat(tierSet.slice(slices.OU));
		else if (format === 'caplc') tierSet = tierSet.slice(slices['CAP LC'], slices.Uber).concat(tierSet.slice(slices.LC));
		else if (format.startsWith('lc') || format.endsWith('lc')) tierSet = tierSet.slice(slices["LC Uber"]);
		else if (format === 'anythinggoes' || format === 'ag') tierSet = agTierSet.concat(tierSet.slice(slices.Uber));
		else if (format === 'balancedhackmons' || format === 'bh') tierSet = agTierSet.concat(tierSet.slice(slices.Uber));
		else if (format === 'doublesou') tierSet = tierSet.slice(slices.DOU);
		else if (format === 'doublesuu') tierSet = tierSet.slice(slices.DUU);
		else if (format === 'doublesnu') tierSet = tierSet.slice(slices.DNU || slices.DUU);
		else if (this.isLetsGo) tierSet = tierSet.slice(slices.Uber);
		// else if (isDoublesOrBS) tierSet = tierSet;
		else if (!isDoublesOrBS) {
			tierSet = [
				...tierSet.slice(slices.OU, slices.UU),
				...agTierSet,
				...tierSet.slice(slices.Uber, slices.OU),
				...tierSet.slice(slices.UU),
			];
		}

		if (format === 'zu' && this.gen >= 7) {
			tierSet = tierSet.filter(function (r) {
				if (r[1] in table.zuBans) return false;
				return true;
			});
		}

		if (format === 'vgc2016') {
			tierSet = tierSet.filter(function (r) {
				let banned = [
					'deoxys', 'deoxysattack', 'deoxysdefense', 'deoxysspeed', 'mew', 'celebi', 'shaymin', 'shayminsky', 'darkrai', 'victini', 'keldeo', 'keldeoresolute', 'meloetta', 'arceus', 'genesect', 'jirachi', 'manaphy', 'phione', 'hoopa', 'hoopaunbound', 'diancie', 'dianciemega',
				];
				if (banned.includes(r[1]) || r[1].substr(0, 6) === 'arceus') return false;
				return true;
			});
		}

		this.defaultResults = tierSet;
		this.legalityLabel = "Banned";
	}
	private allMoves() {
		if (this.filters || this.sortCol) return this.filteredMoves();
		let results: SearchRow[] = [['sortmove', '']];
		results.push(['header', "Moves"]);
		for (let id in BattleMovedex) {
			switch (id) {
			case 'paleowave':
				results.push(['header', "CAP moves"]);
				break;
			case 'magikarpsrevenge':
				continue;
			}
			results.push(['move', id as ID]);
		}
		this.results = results;
	}
	private teambuilderMoves(format: ID, set: PokemonSet) {
		let species = Dex.getSpecies(set.species);
		const isBH = (format === 'balancedhackmons' || format === 'bh');

		let learnsetid = this.nextLearnsetid(species.id);
		let moves: string[] = [];
		let sMoves: string[] = [];
		let sketch = false;
		let gen = '' + this.gen;
		while (learnsetid) {
			let learnset = BattleTeambuilderTable.learnsets[learnsetid];
			if (this.isLetsGo) learnset = BattleTeambuilderTable['letsgo'].learnsets[learnsetid];
			if (learnset) {
				for (let moveid in learnset) {
					let learnsetEntry = learnset[moveid];
					/* if (requirePentagon && learnsetEntry.indexOf('p') < 0) {
						continue;
					} else */
					if (learnsetEntry.indexOf(gen) < 0) {
						continue;
					}
					if (moves.indexOf(moveid) >= 0) continue;
					moves.push(moveid);
					if (moveid === 'sketch') sketch = true;
					if (moveid === 'hiddenpower') {
						moves.push(
							'hiddenpowerbug', 'hiddenpowerdark', 'hiddenpowerdragon', 'hiddenpowerelectric', 'hiddenpowerfighting', 'hiddenpowerfire', 'hiddenpowerflying', 'hiddenpowerghost', 'hiddenpowergrass', 'hiddenpowerground', 'hiddenpowerice', 'hiddenpowerpoison', 'hiddenpowerpsychic', 'hiddenpowerrock', 'hiddenpowersteel', 'hiddenpowerwater'
						);
					}
				}
			}
			learnsetid = this.nextLearnsetid(learnsetid, species.id);
		}
		if (sketch || isBH) {
			if (isBH) moves = [];
			for (let i in BattleMovedex) {
				if (i === 'chatter' && !isBH) continue;
				if (i === 'magikarpsrevenge') continue;
				if ((format.substr(0, 3) !== 'cap' && (i === 'paleowave' || i === 'shadowstrike'))) continue;
				if (!BattleMovedex[i].gen) {
					if (BattleMovedex[i].num >= 622) {
						BattleMovedex[i].gen = 7;
					} else if (BattleMovedex[i].num >= 560) {
						BattleMovedex[i].gen = 6;
					} else if (BattleMovedex[i].num >= 468) {
						BattleMovedex[i].gen = 5;
					} else if (BattleMovedex[i].num >= 355) {
						BattleMovedex[i].gen = 4;
					} else if (BattleMovedex[i].num >= 252) {
						BattleMovedex[i].gen = 3;
					} else if (BattleMovedex[i].num >= 166) {
						BattleMovedex[i].gen = 2;
					} else if (BattleMovedex[i].num >= 1) {
						BattleMovedex[i].gen = 1;
					} else {
						BattleMovedex[i].gen = 0;
					}
				}
				if (BattleMovedex[i].gen > this.gen) continue;
				if (BattleMovedex[i].isZ) continue;
				if (isBH) {
					moves.push(i);
				} else {
					sMoves.push(i);
				}
			}
		}
		if (format === 'stabmons') {
			for (let i in BattleMovedex) {
				let types = [];
				let baseSpecies = Dex.getSpecies(species.baseSpecies);
				for (const type of species.types) {
					if (species.battleOnly) continue;
					types.push(type);
				}
				if (species.prevo) {
					const prevoSpecies = Dex.getSpecies(species.prevo);
					for (const type of prevoSpecies.types) {
						types.push(type);
					}
					if (prevoSpecies.prevo) {
						for (const type of Dex.getSpecies(prevoSpecies.prevo).types) {
							types.push(type);
						}
					}
				}
				if (species.battleOnly) species = baseSpecies;
				if (baseSpecies.otherFormes && baseSpecies.baseSpecies !== 'Wormadam') {
					for (const type of baseSpecies.types) {
						if (['Alola', 'Alola-Totem', 'Galar', 'Galar-Zen'].includes(species.forme)) {
							continue;
						}
						types.push(type);
					}
					for (const formeName of baseSpecies.otherFormes) {
						const forme = Dex.getSpecies(formeName);
						for (const type of forme.types) {
							if (forme.battleOnly || ['Alola', 'Alola-Totem', 'Galar', 'Galar-Zen'].includes(species.forme)) {
								continue;
							}
							types.push(type);
						}
					}
				}
				if (types.indexOf(BattleMovedex[i].type) < 0) continue;
				if (moves.indexOf(i as ID) >= 0) continue;
				if (!BattleMovedex[i].gen) {
					if (BattleMovedex[i].num >= 622) {
						BattleMovedex[i].gen = 7;
					} else if (BattleMovedex[i].num >= 560) {
						BattleMovedex[i].gen = 6;
					} else if (BattleMovedex[i].num >= 468) {
						BattleMovedex[i].gen = 5;
					} else if (BattleMovedex[i].num >= 355) {
						BattleMovedex[i].gen = 4;
					} else if (BattleMovedex[i].num >= 252) {
						BattleMovedex[i].gen = 3;
					} else if (BattleMovedex[i].num >= 166) {
						BattleMovedex[i].gen = 2;
					} else if (BattleMovedex[i].num >= 1) {
						BattleMovedex[i].gen = 1;
					} else {
						BattleMovedex[i].gen = 0;
					}
				}
				if (BattleMovedex[i].gen > this.gen) continue;
				if (BattleMovedex[i].isZ || BattleMovedex[i].isMax || BattleMovedex[i].isNonstandard) continue;
				moves.push(i);
			}
		}

		moves.sort();
		sMoves.sort();

		let usableMoves: SearchRow[] = [];
		let uselessMoves: SearchRow[] = [];
		let sketchedMoves: SearchRow[] = [];
		for (const id of moves) {
			let isViable: boolean = BattleMovedex[id]?.isViable;
			if (id === 'aerialace') isViable = ['scyther', 'aerodactylmega', 'kricketune'].includes(toID(set.species));
			if (id === 'ancientpower') {
				isViable = (
					toID(set.ability) === 'technician' || (toID(set.ability) === 'serenegrace') ||
					(species.types.includes('Rock') && moves.includes('powergem'))
				);
			}
			if (id === 'bellydrum') isViable = ['azumarill', 'linoone', 'slurpuff'].includes(toID(set.species));
			if (id === 'blizzard') isViable = (toID(set.ability) === 'snowwarning');
			if (id === 'counter') {
				isViable = ['chansey', 'skarmory', 'clefable', 'wobbuffet', 'alakazam'].includes(toID(set.species));
			}
			if (id === 'curse') isViable = (toID(set.species) === 'snorlax');
			if (id === 'drainingkiss') isViable = (toID(set.ability) === 'triage');
			if (id === 'dynamicpunch') isViable = (toID(set.ability) === 'noguard');
			if (id === 'electroball') isViable = (toID(set.ability) === 'surgesurfer');
			if (id === 'gyroball') isViable = (species.baseStats.spe <= 60);
			if (id === 'headbutt') isViable = (toID(set.ability) === 'serenegrace' && species.types.includes('Normal'));
			if (id === 'heartswap') isViable = (toID(set.species) === 'magearna');
			if (id === 'hiddenpowerelectric') isViable = !moves.includes('thunderbolt');
			if (id === 'hiddenpowerfighting') isViable = (!moves.includes('aurasphere') && !moves.includes('focusblast'));
			if (id === 'hiddenpowerfire') isViable = !moves.includes('flamethrower');
			if (id === 'hiddenpowergrass') isViable = (!moves.includes('energyball') && !moves.includes('gigadrain'));
			if (id === 'hiddenpowerice') isViable = (!moves.includes('icebeam') && species.id !== 'xerneas');
			if (id === 'hypnosis') {
				isViable = ((this.gen < 4 && !moves.includes('sleeppowder')) || toID(set.species) === 'darkrai');
			}
			if (id === 'icywind') isViable = toID(set.species).startsWith('keldeo');
			if (id === 'infestation') isViable = (toID(set.species) === 'shuckle');
			if (id === 'irontail') {
				isViable = (species.types.includes('Steel') && moves.indexOf('ironhead') < 0) ||
					(
						(species.types.includes('Dark') || species.types.includes('Dragon')) &&
						!moves.includes('ironhead') && !moves.indexOf('gunkshot')
					);
			}
			if (id === 'jumpkick') isViable = (moves.indexOf('highjumpkick') < 0);
			if (id === 'leechlife') isViable = (this.gen > 6);
			if (id === 'petaldance') isViable = (toID(set.ability) === 'owntempo');
			if (id === 'reflecttype') isViable = ['latias', 'starmie'].includes(toID(set.species));
			if (id === 'rocktomb') isViable = (toID(set.species) === 'groudon' || toID(set.ability) === 'technician');
			if (id === 'selfdestruct') isViable = (this.gen < 5 && moves.indexOf('explosion') < 0);
			if (id === 'skyattack') isViable = (toID(set.species) === 'hawlucha');
			if (id === 'smackdown') isViable = (species.types.indexOf('Ground') > 0);
			if (id === 'smartstrike') isViable = (species.types.indexOf('Steel') > 0 && moves.indexOf('ironhead') < 0);
			if (id === 'solarbeam') isViable = ['drought', 'chlorophyll'].includes(toID(set.ability));
			if (id === 'stompingtantrum') {
				isViable = (
					(!moves.includes('earthquake') && !moves.includes('drillrun')) ||
					(toID(set.ability) === 'toughclaws' && !moves.includes('drillrun') && !moves.includes('earthquake'))
				);
			}
			if (id === 'storedpower') isViable = ['necrozma', 'espeon', 'sigilyph'].includes(toID(set.species));
			if (id === 'stunspore') isViable = (moves.indexOf('thunderwave') < 0);
			if (id === 'thunder') {
				isViable = (['drizzle', 'primordialsea'].includes(toID(set.ability)) || (toID(set.species) === 'xerneas'));
			}
			if (id === 'trickroom') isViable = (species.baseStats.spe <= 100);
			if (id === 'waterpulse') isViable = (toID(set.ability) === 'megalauncher' && moves.indexOf('originpulse') < 0);
			if (format === 'mixandmega') {
				if (id === 'blizzard') isViable = (toID(set.item) === 'abomasite' || toID(set.item) === 'pidgeotite');
				if (id === 'feint') isViable = (toID(set.species) === 'weavile');
				if (id === 'grasswhistle') isViable = (toID(set.item) === 'pidgeotite');
				if (id === 'hypnosis') isViable = (toID(set.item) === 'pidgeotite');
				if (id === 'inferno') isViable = (toID(set.item) === 'pidgeotite' && !moves.includes('fireblast'));
				if (id === 'sing') isViable = (toID(set.item) === 'pidgeotite');
				if (id === 'thunder') isViable = (toID(set.item) === 'pidgeotite' && !moves.includes('zapcannon'));
				if (id === 'waterpulse') isViable = (toID(set.item) === 'blastoisinite' && !moves.includes('originpulse'));
				if (id === 'weatherball') isViable = (toID(set.item) === 'redorb');
				if (id === 'zapcannon') isViable = (toID(set.item) === 'pidgeotite');
			}
			if (this.isLetsGo) {
				if (id === 'megadrain') isViable = true;
			}
			if (this.gen === 1) {
				// Usually viable for Gen 1
				if ([
					'acidarmor', 'amnesia', 'barrier', 'bind', 'clamp', 'confuseray', 'counter', 'firespin',
					'hyperbeam', 'mirrormove', 'pinmissile', 'razorleaf', 'sing', 'slash', 'sludge',
					'twineedle', 'wrap',
				].includes(id)) {
					isViable = true;
				}

				// Usually not viable for Gen 1
				if ([
					'disable', 'firepunch', 'icepunch', 'leechseed', 'quickattack', 'roar', 'thunderpunch',
					'toxic', 'triattack', 'whirlwind',
				].includes(id)) {
					isViable = false;
				}

				// Viable only when certain moves aren't present
				if (id === 'bubblebeam') isViable = !moves.includes('surf') && !moves.includes('blizzard');
				if (id === 'doubleedge') isViable = !moves.includes('bodyslam');
				if (id === 'doublekick') isViable = !moves.includes('submission');
				if (id === 'megadrain') isViable = !moves.includes('razorleaf') && !moves.includes('surf');
				if (id === 'megakick') isViable = !moves.includes('hyperbeam');
				if (id === 'reflect') isViable = !moves.includes('barrier') && !moves.includes('acidarmor');
				if (id === 'submission') isViable = !moves.includes('highjumpkick');
			}
			if (isViable) {
				if (!usableMoves.length) usableMoves.push(['header', "Moves"]);
				usableMoves.push(['move', id as ID]);
			} else {
				if (!uselessMoves.length) uselessMoves.push(['header', "Usually useless moves"]);
				uselessMoves.push(['move', id as ID]);
			}
		}
		for (const id of sMoves) {
			if (!sketchedMoves.length) sketchedMoves.push(['header', "Sketched moves"]);
			sketchedMoves.push(['move', id as ID]);
		}
		this.defaultResults = usableMoves.concat(uselessMoves).concat(sketchedMoves);
	}
	private allTypes(results?: SearchRow[]) {
		if (!results) results = [];
		for (let id in window.BattleTypeChart) {
			results.push(['type', id as ID]);
		}
		this.results = results;
	}
	private allAbilities(results?: SearchRow[]) {
		if (!results) results = [];
		for (let id in BattleAbilities) {
			results.push(['ability', id as ID]);
		}
		this.results = results;
	}
	private teambuilderAbilities(format: ID, set: PokemonSet) {
		const isBH = (format === 'balancedhackmons' || format === 'bh');
		let species = this.dex.getSpecies(set.species);
		let abilitySet: SearchRow[] = [['header', "Abilities"]];

		if (species.isMega) {
			abilitySet.unshift(['html', `Will be <strong>${species.abilities['0']}</strong> after Mega Evolving.`]);
			species = this.dex.getSpecies(species.baseSpecies);
		}
		abilitySet.push(['ability', toID(species.abilities['0'])]);
		if (species.abilities['1']) {
			abilitySet.push(['ability', toID(species.abilities['1'])]);
		}
		if (species.abilities['H']) {
			abilitySet.push(['header', "Hidden Ability"]);
			abilitySet.push(['ability', toID(species.abilities['H'])]);
		}
		if (species.abilities['S']) {
			abilitySet.push(['header', "Special Event Ability"]);
			abilitySet.push(['ability', toID(species.abilities['S'])]);
		}
		if (format === 'almostanyability' || isBH) {
			species = Dex.getSpecies(set.species);
			let abilities: ID[] = [];
			if (species.isMega) {
				if (format === 'almostanyability') {
					abilitySet.unshift(['html', `Will be <strong>${species.abilities['0']}</strong> after Mega Evolving.`]);
				}
				// species is unused after this, so no need to replace
			}
			for (let i in BattleAbilities) {
				if (BattleAbilities[i].isNonstandard) continue;
				if (BattleAbilities[i].gen > this.gen) continue;
				abilities.push(i as ID);
			}

			abilities.sort();

			let goodAbilities: SearchRow[] = [['header', "Abilities"]];
			let poorAbilities: SearchRow[] = [['header', "Situational Abilities"]];
			let badAbilities: SearchRow[] = [['header', "Unviable Abilities"]];
			for (const id of abilities) {
				let rating = BattleAbilities[id]?.rating;
				if (id === 'normalize') rating = 3;
				if (rating >= 3) {
					goodAbilities.push(['ability', id]);
				} else if (rating >= 2) {
					poorAbilities.push(['ability', id]);
				} else {
					badAbilities.push(['ability', id]);
				}
			}
			abilitySet = goodAbilities.concat(poorAbilities).concat(badAbilities);
		}
		this.defaultResults = abilitySet;
	}
	private allCategories(results?: SearchRow[]) {
		if (!results) results = [];
		results.push(['category', 'physical' as ID]);
		results.push(['category', 'special' as ID]);
		results.push(['category', 'status' as ID]);
		this.results = results;
	}
	getTier(pokemon: Species) {
		if (this.isLetsGo) return pokemon.tier;
		let table = window.BattleTeambuilderTable;
		if (table && table[`gen${this.gen}doubles`]) {
			table = table[`gen${this.gen}doubles`];
		}
		if (!table) return pokemon.tier;

		let id = pokemon.id;
		if (id in table.overrideTier) {
			return table.overrideTier[id];
		}
		if (id.slice(-5) === 'totem' && id.slice(0, -5) in table.overrideTier) {
			return table.overrideTier[id.slice(0, -5)];
		}
		id = toID(pokemon.baseSpecies);
		if (id in table.overrideTier) {
			return table.overrideTier[id];
		}

		return pokemon.tier;
	}
	private filteredPokemon() {
		let results: SearchRow[] = [];
		let filters = this.filters || [];
		let sortCol = this.sortCol;

		this.results = [['sortpokemon', '']];
		if (filters.length) {
			this.results.push(['header', "Filtered results"]);
		}
		if (sortCol === 'type') {
			return this.allTypes(this.results);
		} else if (sortCol === 'ability') {
			return this.allAbilities(this.results);
		}

		let illegalresults: SearchRow[] = [];
		const genChar = '' + this.gen;
		let i;
		for (let id in BattlePokedex) {
			let species = this.dex.getSpecies(id);
			if (species.exists === false) continue;
			for (i = 0; i < filters.length; i++) {
				if (filters[i][0] === 'type') {
					let type = filters[i][1];
					if (species.types[0] !== type && species.types[1] !== type) break;
				} else if (filters[i][0] === 'egggroup') {
					let egggroup = filters[i][1];
					if (!species.eggGroups) continue;
					if (species.eggGroups[0] !== egggroup && species.eggGroups[1] !== egggroup) break;
				} else if (filters[i][0] === 'tier') {
					let tier = filters[i][1];
					if (this.getTier(species) !== tier) break;
				} else if (filters[i][0] === 'ability') {
					let ability = filters[i][1];
					if (!Dex.hasAbility(species, ability)) break;
				} else if (filters[i][0] === 'move') {
					let learned = false;
					let learnsetid = this.nextLearnsetid(id as ID);
					while (learnsetid) {
						let learnset = BattleTeambuilderTable.learnsets[learnsetid];
						if (learnset && (filters[i][1] in learnset) && learnset[filters[i][1]].indexOf(genChar) >= 0) {
							learned = true;
							break;
						}
						learnsetid = this.nextLearnsetid(learnsetid, id as ID);
					}
					if (!learned) break;
				}
			}
			if (i < filters.length) continue;
			if (this.legalityFilter && !(id in this.legalityFilter)) {
				if (!sortCol) illegalresults.push(['pokemon', id as ID]);
			} else {
				results.push(['pokemon', id as ID]);
			}
		}
		if (['hp', 'atk', 'def', 'spa', 'spd', 'spe' as string | null].includes(sortCol)) {
			results = results.sort((row1, row2) => {
				const stat1 = BattlePokedex[row1[1]].baseStats[sortCol as StatName];
				const stat2 = BattlePokedex[row2[1]].baseStats[sortCol as StatName];
				return stat2 - stat1;
			});
		} else if (sortCol === 'bst') {
			results = results.sort((row1, row2) => {
				const base1 = BattlePokedex[row1[1]].baseStats;
				const base2 = BattlePokedex[row2[1]].baseStats;
				const bst1 = base1.hp + base1.atk + base1.def + base1.spa + base1.spd + base1.spe;
				const bst2 = base2.hp + base2.atk + base2.def + base2.spa + base2.spd + base2.spe;
				return bst2 - bst1;
			});
		} else if (sortCol === 'name') {
			results = results.sort((row1, row2) => {
				const name1 = row1[1];
				const name2 = row2[1];
				return name1 < name2 ? -1 : name1 > name2 ? 1 : 0;
			});
		}
		this.results = this.results.concat(results, illegalresults);
	}
	private nextLearnsetid(learnsetid: ID, speciesid?: ID) {
		if (!speciesid) {
			if (learnsetid in BattleTeambuilderTable.learnsets) return learnsetid;
			let baseLearnsetid = BattlePokedex[learnsetid] && toID(BattlePokedex[learnsetid].baseSpecies);
			if (!baseLearnsetid) {
				baseLearnsetid = toID(BattleAliases[learnsetid]);
			}
			if (baseLearnsetid in BattleTeambuilderTable.learnsets) return baseLearnsetid;
			return '' as ID;
		}

		if (learnsetid === 'lycanrocdusk' || (speciesid === 'rockruff' && learnsetid === 'rockruff')) {
			return 'rockruffdusk' as ID;
		}
		let species = BattlePokedex[learnsetid];
		if (!species) return '' as ID;
		if (species.prevo) return toID(species.prevo);
		let baseSpecies = species.baseSpecies;
		if (baseSpecies !== species.name && (baseSpecies === 'Rotom' || baseSpecies === 'Pumpkaboo')) {
			return toID(species.baseSpecies);
		}
		return '' as ID;
	}
	private filteredMoves() {
		let results: SearchRow[] = [];
		let filters = this.filters || [];
		let sortCol = this.sortCol;

		this.results = [['sortmove', '']];
		if (filters.length) {
			this.results.push(['header', "Filtered results"]);
		}
		if (sortCol === 'type') {
			return this.allTypes(this.results);
		} else if (sortCol === 'category') {
			return this.allCategories(this.results);
		}

		let illegalresults: SearchRow[] = [];
		for (let id in BattleMovedex) {
			let move = BattleMovedex[id];
			if (move.exists === false) continue;
			let i;
			for (i = 0; i < filters.length; i++) {
				if (filters[i][0] === 'type') {
					if (move.type !== filters[i][1]) break;
				} else if (filters[i][0] === 'category') {
					if (move.category !== filters[i][1]) break;
				} else if (filters[i][0] === 'pokemon') {
					let learned = false;
					let speciesid = filters[i][1] as ID;
					let learnsetid = this.nextLearnsetid(speciesid);
					while (learnsetid) {
						let learnset = BattleTeambuilderTable.learnsets[learnsetid];
						if (learnset && (id in learnset)) {
							learned = true;
							break;
						}
						learnsetid = this.nextLearnsetid(learnsetid, speciesid);
					}
					if (!learned) break;
				}
			}
			if (i < filters.length) continue;
			if (this.legalityFilter && !(id in this.legalityFilter)) {
				if (!sortCol) illegalresults.push(['move', id as ID]);
			} else {
				results.push(['move', id as ID]);
			}
		}
		if (sortCol === 'power') {
			let powerTable: {[id: string]: number | undefined} = {
				return: 102, frustration: 102, spitup: 300, trumpcard: 200, naturalgift: 80, grassknot: 120,
				lowkick: 120, gyroball: 150, electroball: 150, flail: 200, reversal: 200, present: 120,
				wringout: 120, crushgrip: 120, heatcrash: 120, heavyslam: 120, fling: 130, magnitude: 150,
				beatup: 24, punishment: 1020, psywave: 1250, nightshade: 1200, seismictoss: 1200,
				dragonrage: 1140, sonicboom: 1120, superfang: 1350, endeavor: 1399, sheercold: 1501,
				fissure: 1500, horndrill: 1500, guillotine: 1500,
			};
			results = results.sort(function (row1, row2) {
				let move1 = BattleMovedex[row1[1]];
				let move2 = BattleMovedex[row2[1]];
				let pow1 = move1.basePower || powerTable[row1[1]] || (move1.category === 'Status' ? -1 : 1400);
				let pow2 = move2.basePower || powerTable[row2[1]] || (move2.category === 'Status' ? -1 : 1400);
				return pow2 - pow1;
			});
		} else if (sortCol === 'accuracy') {
			results = results.sort(function (row1, row2) {
				let accuracy1 = BattleMovedex[row1[1]].accuracy || 0;
				let accuracy2 = BattleMovedex[row2[1]].accuracy || 0;
				if (accuracy1 === true) accuracy1 = 101;
				if (accuracy2 === true) accuracy2 = 101;
				return accuracy2 - accuracy1;
			});
		} else if (sortCol === 'pp') {
			results = results.sort(function (row1, row2) {
				let pp1 = BattleMovedex[row1[1]].pp || 0;
				let pp2 = BattleMovedex[row2[1]].pp || 0;
				return pp2 - pp1;
			});
		}
		this.results = this.results.concat(results, illegalresults);
	}
	setType(qType: SearchType | '', format = '' as ID, set?: PokemonSet, cur: ID[] = []) {
		if (this.qType !== qType) {
			this.filters = null;
			this.sortCol = null;
		}
		this.qType = qType;
		this.q = undefined;
		this.cur = cur;
		this.legalityFilter = {};
		this.legalityLabel = "Illegal";
		this.gen = 6;
		if (format.slice(0, 3) === 'gen') {
			this.gen = (Number(format.charAt(3)) || 6);
			format = format.slice(4) as ID;
			this.dex = Dex.forGen(this.gen);
		} else if (!format) {
			this.gen = 7;
			this.dex = Dex;
		}

		this.isDoubles = format.includes('doubles');
		this.isLetsGo = format.startsWith('letsgo');
		if (this.isLetsGo) format = format.slice(6) as ID;

		this.results = null;
		this.defaultResults = null;

		if (!qType || !set) return;

		switch (qType) {
		case 'pokemon':
			this.teambuilderPokemon(format);
			break;

		case 'item':
			let table = BattleTeambuilderTable;
			if (this.gen < 8) table = table['gen' + this.gen];
			if (!table.itemSet) {
				table.itemSet = table.items.map((r: any) => {
					if (typeof r === 'string') return ['item', r];
					return [r[0], r[1]];
				});
				table.items = null;
			}
			this.defaultResults = table.itemSet;
			break;

		case 'ability':
			this.teambuilderAbilities(format, set);
			break;

		case 'move':
			this.teambuilderMoves(format, set);
			break;
		}

		if (cur.length && cur[0]) {
			this.defaultResults = [[qType as SearchType, cur[0]], ...(this.defaultResults || [])];
		}
		if (qType === 'pokemon') {
			this.defaultResults = [['sortpokemon', ''], ...(this.defaultResults || [])];
		}
		if (qType === 'move') {
			this.defaultResults = [['sortmove', ''], ...(this.defaultResults || [])];
		}

		if (this.legalityFilter && this.defaultResults) {
			for (const [type, id] of this.defaultResults) {
				if (type !== 'header') {
					this.legalityFilter[id] = 1;
				}
			}
		}
	}

	static getClosest(query: string) {
		// binary search through the index!
		let left = 0;
		let right = BattleSearchIndex.length - 1;
		while (right > left) {
			let mid = Math.floor((right - left) / 2 + left);
			if (BattleSearchIndex[mid][0] === query && (mid === 0 || BattleSearchIndex[mid - 1][0] !== query)) {
				// that's us
				return mid;
			} else if (BattleSearchIndex[mid][0] < query) {
				left = mid + 1;
			} else {
				right = mid - 1;
			}
		}
		if (left >= BattleSearchIndex.length - 1) left = BattleSearchIndex.length - 1;
		else if (BattleSearchIndex[left + 1][0] && BattleSearchIndex[left][0] < query) left++;
		if (left && BattleSearchIndex[left - 1][0] === query) left--;
		return left;
	}
}
