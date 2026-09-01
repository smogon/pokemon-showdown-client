const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');
const {describe, it} = require('node:test');
const vm = require('vm');

global.preact = {Component: function () {}};
global.Config = {routes: {dex: 'dex.pokemonshowdown.com'}};
global.Dex = {resourcePrefix: '', getPokemonIcon() { return ''; }, getItemIcon() { return ''; }};
global.TL = {term: {noitem: '(localized no item)', noability: '(localized no ability)'}};

const searchResultsPath = path.resolve(__dirname, '../play.pokemonshowdown.com/js/battle-searchresults.js');
const PSSearchResults = vm.runInThisContext(
	`${fs.readFileSync(searchResultsPath, 'utf8')}\nPSSearchResults;`,
	{filename: searchResultsPath}
);

describe('PSSearchResults', () => {
	it('uses localized terms for empty item and ability rows', () => {
		const item = {id: '', name: ''};
		const ability = {id: '', name: 'No Ability'};
		const search = {
			dex: {
				items: {get() { return item; }},
				abilities: {get() { return ability; }},
				text: {get(effect) { return {name: effect.name, shortDesc: ''}; }},
			},
		};
		const renderer = Object.create(PSSearchResults.prototype);
		renderer.props = {search};
		renderer.URL_ROOT = '//dex.pokemonshowdown.com/';
		renderer.itemId = '';
		renderer.abilityId = '';

		assert.match(renderer.renderItemRowHTML(0, '', 0, 0), /<i>\(localized no item\)<\/i>/);
		assert.match(renderer.renderAbilityRowHTML(0, '', 0, 0), /<i>\(localized no ability\)<\/i>/);
	});

	it('renders everything outside the localized base species in small text', () => {
		const renderRow = (canonicalName, name, baseSpecies) => {
			const pokemon = {
				id: canonicalName.toLowerCase().replace(/[^a-z0-9]+/g, ''),
				name: canonicalName,
				baseStats: {hp: 1, atk: 1, def: 1, spa: 1, spd: 1, spe: 1},
				types: [],
				abilities: {},
			};
			const search = {
				dex: {
					gen: 2,
					species: {get() { return pokemon; }},
					text: {get() { return {name, baseSpecies}; }},
				},
				getTier() { return ''; },
			};
			const renderer = Object.create(PSSearchResults.prototype);
			renderer.props = {search};
			renderer.URL_ROOT = '//dex.pokemonshowdown.com/';
			renderer.speciesId = '';
			return renderer.renderPokemonRowHTML(0, pokemon.id, 0, 0);
		};

		assert.match(renderRow('Thundurus', 'Thundurus-Incarnate', 'Thundurus'),
			/<span class="col pokemonnamecol">Thundurus<small>-Incarnate<\/small><\/span>/);
		assert.match(renderRow('Thundurus-Therian', 'Thundurus-Therian', 'Thundurus'),
			/<span class="col pokemonnamecol">Thundurus<small>-Therian<\/small><\/span>/);
		assert.match(renderRow('Mewtwo-Mega-X', 'Mega Mewtwo X', 'Mewtwo'),
			/<span class="col pokemonnamecol"><small>Mega <\/small>Mewtwo<small> X<\/small><\/span>/);
		assert.match(renderRow('Thundurus', 'Inkarnations-Voltolos', 'Voltolos'),
			/<span class="col pokemonnamecol"><small>Inkarnations-<\/small>Voltolos<\/span>/);
		assert.match(renderRow('Thundurus', 'ボルトロス・けしん', 'ボルトロス'),
			/<span class="col pokemonnamecol">ボルトロス<small>・けしん<\/small><\/span>/);
		assert.match(renderRow('Greninja-Ash', 'Sachanobi', 'Amphinobi'),
			/<span class="col pokemonnamecol"><small>Sachanobi<\/small><\/span>/);
	});
});
