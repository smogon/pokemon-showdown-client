const assert = require('assert').strict;
const fs = require('node:fs');
const path = require('node:path');
const {describe, it} = require('node:test');

const {
	compileBattleUIText, loadTranslations, ParsedCatalog, updateTranslationFiles, TL_CALL_OPTIONS,
} = require('../build-tools/translations.mts');
const { TLCalls } = require('../build-tools/tl-calls.mts');

describe('UI translation catalogs', () => {
	it('discovers tagged strings and contextual calls without treating effects as UI text', () => {
		const calls = TLCalls.fromSource(`
			const greeting = TL\`Hello \${name}!\`;
			const action = TL("Open", "verb");
			const term = TL.term.moves;
			const directUI = TL("Add Pokémon");
			const button = TL\`[OK]\`;
			const property = TL\`Value: \${foo.bar}\`;
			const complex = TL\`Result: \${foo.makeResult()}\`;
			const moveName = TL(move);
		`, 'panel-battle.tsx');
		assert.deepEqual(
			[...calls.keys()],
			['Hello {0}!', '[OK]', 'Value: {0}', 'Result: {0}', 'Open', 'Add Pokémon']
		);
		assert.deepEqual([...calls.get('[OK]').contexts], ['']);
		assert.deepEqual([...calls.get('Hello {0}!').contexts], ['']);
		assert.deepEqual([...calls.get('Open').contexts], ['verb']);
		assert.deepEqual([...calls.get('Add Pokémon').contexts], ['']);
		assert.deepEqual(calls.get('Hello {0}!').placeholders, ['name']);
		assert.deepEqual(calls.get('Value: {0}').placeholders, ['foo.bar']);
		assert.deepEqual(calls.get('Result: {0}').placeholders, ['foo.makeResult()']);
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
		const calls = TLCalls.fromSource('const label = TL`Forfeit`;', 'panel-battle.tsx', TL_CALL_OPTIONS);
		const updated = new ParsedCatalog(template, 'en-template.ts').update(calls);
		assert.deepEqual(updated.added, ['Forfeit']);
		assert.match(updated.source, /\/\/ An existing comment\n\t"Battle": null, \/\/ NOT USED/);
		assert.match(updated.source, /\t"Forfeit": null,\n\n\t\/\/ #endregion Battle/);
	});

	it('uses template placeholder names and preserves translations when they are renamed', () => {
		const template = `export const translations = {
	"Hello {POKEMON}": null,
};
`;
		const locale = `export const translations = {
	// Keep this local note about {name}.
	"Hello {name}": "你好，{name}！",
};
`;
		const calls = TLCalls.fromSource('const greeting = TL`Hello \${user.name}`;');
		const templateCatalog = new ParsedCatalog(template);
		assert.deepEqual(templateCatalog.resolveCalls(calls), []);
		assert.ok(calls.has('Hello {0}'));
		assert.equal(calls.has('Hello {name}'), false);
		const call = calls.get('Hello {0}');
		assert.deepEqual(call.placeholders, ['POKEMON']);
		assert.equal(templateCatalog.update(calls).source, template);

		const synced = templateCatalog.sync(new ParsedCatalog(locale), calls);
		assert.match(synced.source, /Keep this local note about \{POKEMON\}/);
		assert.match(synced.source, /"Hello \{POKEMON\}": "你好，\{POKEMON\}！"/);
		assert.deepEqual(compileBattleUIText(ParsedCatalog.evaluate(synced.source), calls), {
			'Hello {0}': '你好，{0}！',
		});
		assert.deepEqual(synced.comparison, {
			missing: [], extra: [], incompatible: [], commentMismatches: [], orderMismatch: false,
		});
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
		const updated = new ParsedCatalog(template).update(calls);
		assert.match(updated.source, /"Used": null,\n/);
		assert.match(updated.source, /"Unused": null, \/\/ NOT USED/);
		assert.match(updated.source, /"used": null,\n/);
		assert.match(updated.source, /"unused": null, \/\/ NOT USED/);
	});

	it('synchronizes missing entries and shared comments while preserving locale comments', () => {
		const template = `import type { TranslationCatalog } from '../build-tools/translations.mts';

export const translations: TranslationCatalog = {
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
		const templateCatalog = new ParsedCatalog(template);
		const localeCatalog = new ParsedCatalog(locale, 'zh-cn.ts');
		assert.equal(templateCatalog.compare(localeCatalog).orderMismatch, true);
		assert.deepEqual(templateCatalog.compare(localeCatalog).extra, ['Removed']);
		const synced = templateCatalog.sync(localeCatalog);
		assert.doesNotMatch(synced.source, /import type|TranslationCatalog/);
		assert.match(synced.source, /\/\/ TRANSLATORS: Home may match Main menu\./);
		assert.match(synced.source, /\/\/ This wording is intentionally short\.\n\t"Home": "首页",/);
		assert.ok(synced.source.indexOf('"Home"') < synced.source.indexOf('"Main menu"'));
		assert.match(synced.source, /"Main menu": "主菜单"/);
		assert.doesNotMatch(synced.source, /Removed|已删除/);
		const comparison = templateCatalog.compare(new ParsedCatalog(synced.source));
		assert.deepEqual(synced.comparison, comparison);
		assert.deepEqual(comparison, {
			missing: [], extra: [], incompatible: [], commentMismatches: [], orderMismatch: false,
		});
	});

	it('keeps checked-in calls, template, and locale catalogs synchronized', () => {
		const calls = updateTranslationFiles();
		// the shared catalog only exists on branches carrying translations
		const sharedFile = path.resolve(__dirname, '../caches/pokemon-showdown/data/text/fr/ui.ts');
		const shared = fs.existsSync(sharedFile) ? ParsedCatalog.evaluate(fs.readFileSync(sharedFile, 'utf8')) : {};
		const client = ParsedCatalog.evaluate(fs.readFileSync(path.resolve(__dirname, '../translations/fr.ts'), 'utf8'));
		const loaded = loadTranslations('fr');
		assert.equal(JSON.stringify(loaded), JSON.stringify({ ...shared, ...client }));
		const compiled = compileBattleUIText(loaded, calls);
		// Shared placeholder names come from the shared template, not source expressions.
		assert.deepEqual(calls.get('{0}: ').placeholders, ['LABEL']);
		assert.deepEqual([...calls.get('Type').contexts].sort(), ['', 'kind']);
		assert.deepEqual([...calls.get('User').contexts].sort(), ['', 'pokemon']);
		if (!fs.existsSync(sharedFile)) return;
		assert.equal(compiled['{0}: '], shared['{LABEL}: ']?.replace('{LABEL}', '{0}') ?? null);
		assert.equal(JSON.stringify(compiled.Type), JSON.stringify(shared.Type));
	});
});
