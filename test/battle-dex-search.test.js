const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');
const {describe, it} = require('node:test');
const vm = require('vm');

global.Config = {routes: {dex: 'dex.pokemonshowdown.com'}};
global.TL = {term: {noitem: '(localized no item)', noability: '(localized no ability)', moves: 'Moves'}};
global.preact = {Component: function () {}};

const jsPath = (name) => path.resolve(__dirname, '../play.pokemonshowdown.com/js', name);
vm.runInThisContext(
	`${fs.readFileSync(jsPath('battle-dex-data.js'), 'utf8')}`,
	{filename: jsPath('battle-dex-data.js')}
);
vm.runInThisContext(
	`${fs.readFileSync(jsPath('battle-dex.js'), 'utf8')}`,
	{filename: jsPath('battle-dex.js')}
);
vm.runInThisContext(
	`${fs.readFileSync(jsPath('battle-dex-search.js'), 'utf8')}`,
	{filename: jsPath('battle-dex-search.js')}
);

describe('BattleMoveSearch', () => {
	it('should detect Champions VGC as a doubles format', () => {
		// plain VGC already sets isDoubles
		assert.equal(new BattleMoveSearch('move', 'vgc').isDoubles, true);
		// the Champions VGC formats must too
		assert.equal(new BattleMoveSearch('move', 'championsvgc').isDoubles, true);
	});
});
