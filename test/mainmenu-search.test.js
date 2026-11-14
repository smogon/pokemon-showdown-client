const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');
const {describe, it} = require('node:test');
const vm = require('vm');

const source = fs.readFileSync(path.resolve(__dirname, '../play.pokemonshowdown.com/js/panel-mainmenu.js'), 'utf8');

function setup() {
	const left = [];
	const context = {
		PSRoom: function () {}, PSRoomPanel: function () {}, preact: {Component: function () {}, h() {}},
		PS: {prefs: {}, rooms: {}, addRoomType() {}, leave(roomid) { left.push(roomid); }},
		toID: value => value.toLowerCase().replace(/[^a-z0-9]/g, ''),
		setTimeout, clearTimeout,
	};
	vm.runInNewContext(source, context);
	const menu = new context.MainMenuRoom();
	context.PS.rooms['battle-old'] = {classType: 'battle', battle: {ended: true}};
	menu.pendingSearch = {
		format: 'gen9ou', packedTeam: 'original-team', rated: true, games: {}, closeRoomid: 'battle-old',
	};
	return {menu, left};
}

const roomid = 'battle-gen9ou-123';
const matched = {searching: [], games: {[roomid]: 'Player vs. Opponent*'}};

describe('Ladder search tracking', () => {
	it('closes the finished battle only after a rated ladder match is confirmed', () => {
		const {menu, left} = setup();
		menu.handleSearchUpdate(matched);
		assert.deepEqual(left, []);
		const result = menu.claimBattleSearch(roomid, {tier: '[Gen 9] OU', rated: true});
		assert.equal(result.format, 'gen9ou');
		assert.equal(result.packedTeam, 'original-team');
		assert.deepEqual(left, ['battle-old']);
	});

	it('honors challenge rejection arriving before updatesearch', () => {
		const {menu, left} = setup();
		menu.rejectBattleSearch(roomid);
		menu.handleSearchUpdate(matched);
		assert.equal(menu.claimBattleSearch(roomid, {tier: '[Gen 9] OU', rated: true}), null);
		assert.deepEqual(left, []);
		menu.clearPendingSearch();
	});

	it('honors rejection between updatesearch and battle initialization', () => {
		const {menu, left} = setup();
		menu.handleSearchUpdate(matched);
		menu.rejectBattleSearch(roomid);
		assert.equal(menu.claimBattleSearch(roomid, {tier: '[Gen 9] OU', rated: true}), null);
		assert.deepEqual(left, []);
	});

	it('does not classify an unrated challenge or tournament as a ladder match', () => {
		for (const rated of [false, 'Tournament battle']) {
			const {menu, left} = setup();
			menu.handleSearchUpdate(matched);
			assert.equal(menu.claimBattleSearch(roomid, {tier: '[Gen 9] OU', rated}), null);
			assert.deepEqual(left, []);
		}
	});

	it('closes after explicit search acknowledgement and preserves the original team', () => {
		const {menu, left} = setup();
		menu.handleSearchUpdate({searching: ['gen9ou'], games: {}});
		assert.deepEqual(left, ['battle-old']);
		assert.equal(menu.pendingSearch.packedTeam, 'original-team');
	});
});
