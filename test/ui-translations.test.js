const assert = require('assert').strict;
const {describe, it} = require('node:test');

const {
	ParsedUIText, updateUIText,
} = require('../build-tools/translations.mts');
const { TLCalls } = require('../build-tools/tl-calls.mts');

describe('UI translation catalogs', () => {
	it('discovers tagged strings and contextual calls without treating effects as UI text', () => {
		const calls = TLCalls.fromSource(`
			const greeting = TL\`Hello \${name}!\`;
			const action = TL("Open", "verb");
			const term = TL.term.moves;
			const directUI = TL("Add Pokémon");
			const moveName = TL(move);
		`, 'panel-battle.tsx');
		assert.deepEqual([...calls.keys()], ['Hello [1]!', 'Open', 'Add Pokémon']);
		assert.deepEqual([...calls.get('Hello [1]!').contexts], ['default']);
		assert.deepEqual([...calls.get('Open').contexts], ['verb']);
		assert.deepEqual([...calls.get('Add Pokémon').contexts], ['default']);
	});

	it('adds new strings to their mapped region without rewriting existing text', () => {
		const template = `export const translations = {
	// #region Battle
	// ==================================================================

	// An existing comment
	"Battle": null,

	// #endregion Battle
};
`;
		const calls = TLCalls.fromSource('const label = TL`Forfeit`;', 'panel-battle.tsx');
		const updated = new ParsedUIText(template, 'en-template.ts').update(calls);
		assert.deepEqual(updated.added, ['Forfeit']);
		assert.match(updated.source, /\/\/ An existing comment\n\t"Battle": null, \/\/ NOT USED/);
		assert.match(updated.source, /\t"Forfeit": null,\n\n\t\/\/ #endregion Battle/);
	});

	it('marks unused template values and removes the marker when calls return', () => {
		const template = `export const translations = {
	"Used": null, // NOT USED
	"Unused": null,
	"Contextual": {
		"used": null, // NOT USED
		"unused": null,
	},
};
`;
		const calls = TLCalls.fromSource('TL`Used`; TL("Contextual", "used");');
		const updated = new ParsedUIText(template).update(calls);
		assert.match(updated.source, /"Used": null,\n/);
		assert.match(updated.source, /"Unused": null, \/\/ NOT USED/);
		assert.match(updated.source, /"used": null,\n/);
		assert.match(updated.source, /"unused": null, \/\/ NOT USED/);
	});

	it('synchronizes missing entries and shared comments while preserving locale comments', () => {
		const template = `import type { UIText } from '../build-tools/translations.mts';

export const translations: UIText = {
	// #region Navigation
	// ==================================================================

	// TRANSLATORS: Home may match Main menu.
	"Home": null,
	"Main menu": null,

	// #endregion Navigation
};
`;
	const locale = `export const translations = {
	"Main menu": "主菜单",
	// This wording is intentionally short.
	"Home": "首页",
	"Removed": "已删除",
};
`;
		const templateCatalog = new ParsedUIText(template);
		const localeCatalog = new ParsedUIText(locale, 'zh-cn.ts');
		assert.equal(templateCatalog.compare(localeCatalog).orderMismatch, true);
		assert.deepEqual(templateCatalog.compare(localeCatalog).extra, ['Removed']);
		const synced = templateCatalog.sync(localeCatalog);
		assert.doesNotMatch(synced.source, /import type|UIText/);
		assert.match(synced.source, /\/\/ TRANSLATORS: Home may match Main menu\./);
		assert.match(synced.source, /\/\/ This wording is intentionally short\.\n\t"Home": "首页",/);
		assert.ok(synced.source.indexOf('"Home"') < synced.source.indexOf('"Main menu"'));
		assert.match(synced.source, /"Main menu": "主菜单"/);
		assert.doesNotMatch(synced.source, /Removed|已删除/);
		const comparison = templateCatalog.compare(new ParsedUIText(synced.source));
		assert.deepEqual(synced.comparison, comparison);
		assert.deepEqual(comparison, {
			missing: [], extra: [], incompatible: [], commentMismatches: [], orderMismatch: false,
		});
	});

	it('keeps checked-in calls, template, and locale catalogs synchronized', () => {
		updateUIText();
	});
});
