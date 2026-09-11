const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const {describe, it} = require('node:test');

const context = {window: {}, Config: {}};
vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, '../play.pokemonshowdown.com/js/battle-log.js'), 'utf8'), context);
const {BattleLog} = context;

describe('BattleLog.parseLogMessage', () => {
	it('formats each bold span independently', () => {
		const expected = 'a <strong>foo</strong> b <strong>bar</strong> c';
		assert.deepEqual(Array.from(BattleLog.parseLogMessage('a **foo** b **bar** c')), [expected, expected]);
	});

	it('escapes HTML inside and outside bold spans', () => {
		const expected = '&lt;a&gt; <strong>&lt;foo&gt;</strong> &amp; <strong>bar</strong>';
		assert.deepEqual(Array.from(BattleLog.parseLogMessage('<a> **<foo>** & **bar**')), [expected, expected]);
	});

	it('leaves unmatched markers literal and does not match across lines', () => {
		const expected = '**foo<br />bar**<br /><strong>baz</strong> **unfinished';
		assert.deepEqual(Array.from(BattleLog.parseLogMessage('**foo\nbar**\n**baz** **unfinished')), [expected, expected]);
	});
});
