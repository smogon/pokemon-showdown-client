import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findTLCalls, TLCalls } from '../caches/pokemon-showdown/tools/tl-calls.mts';
import {
	ParsedCatalog, validateCatalog,
	resolveTLCalls, formatKeys, translationMismatchMessage, type TranslationCatalog,
} from '../caches/pokemon-showdown/tools/translations.mts';
import {
	TL_CALL_OPTIONS as SERVER_TL_CALL_OPTIONS, SOURCE_DIRECTORIES as SERVER_SOURCE_DIRECTORIES, UI_TEMPLATE_PATH,
} from '../caches/pokemon-showdown/tools/build-translations.mts';
export * from '../caches/pokemon-showdown/tools/translations.mts';
export {
	ParsedCatalog, validateCatalog as validateBattleUIText,
	compileTranslations as compileBattleUIText, type TranslationCatalog,
} from '../caches/pokemon-showdown/tools/translations.mts';

const ROOT_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TRANSLATIONS_PATH = path.resolve(ROOT_PATH, 'translations');
const TEMPLATE_PATH = path.resolve(TRANSLATIONS_PATH, 'en-template.ts');
const TEXT_DATA_PATH = path.resolve(ROOT_PATH, 'caches/pokemon-showdown/data/text');

const REGION_BY_FILE: Record<string, string> = {
	'panel-topbar.tsx': 'Navigation',
	'panels.tsx': 'Generic UI',
	'panel-page.tsx': 'Generic UI',
	'panel-mainmenu.tsx': 'Main Menu',
	'panel-rooms.tsx': 'Rooms',
	'panel-battle.tsx': 'Battle',
	'battle-tooltips.ts': 'Battle',
	'panel-chat.tsx': 'Chat',
	'panel-chat-tournament.tsx': 'Chat',
	'battle-log.ts': 'Chat',
	'panel-teambuilder.tsx': 'Teambuilder',
	'panel-teambuilder-team.tsx': 'Teambuilder',
	'battle-team-editor.tsx': 'Teambuilder',
	'battle-searchresults.tsx': 'Teambuilder',
	'panel-popups.tsx': 'Popups',
	'panel-teamdropdown.tsx': 'Popups',
	'panel-resources.tsx': 'Popups',
	'panel-ladder.tsx': 'Ladder',
};

export const TL_CALL_OPTIONS = { regionByFile: REGION_BY_FILE, sharedRegion: 'Generic UI' };

function readCatalog(file: string): TranslationCatalog {
	return validateCatalog(ParsedCatalog.evaluate(fs.readFileSync(file, 'utf8'), file), file);
}

export function loadTranslations(lang: string): TranslationCatalog {
	const merged: TranslationCatalog = {};
	for (const file of [path.resolve(TEXT_DATA_PATH, lang, 'ui.ts'), path.resolve(TRANSLATIONS_PATH, `${lang}.ts`)]) {
		if (fs.existsSync(file)) Object.assign(merged, readCatalog(file));
	}
	return merged;
}

function isOwnedBy(template: ParsedCatalog, key: string, call: { placeholders: string[] }): boolean {
	return call.placeholders.length ? template.entriesByCallKey.has(key) : template.entriesByKey.has(key);
}

/**
 * - `sync=false`: updates template files to match TL calls in codebase
 * - `sync=true`: syncs every language's translations to match template files
 */
export function updateTranslationFiles(options: { sync?: boolean } = {}): TLCalls {
	const templateSource = fs.readFileSync(TEMPLATE_PATH, 'utf8');
	const template = new ParsedCatalog(templateSource, TEMPLATE_PATH);
	const uiTemplateSource = fs.readFileSync(UI_TEMPLATE_PATH, 'utf8');
	const uiTemplate = new ParsedCatalog(uiTemplateSource, UI_TEMPLATE_PATH);

	const allCalls = findTLCalls(path.resolve(ROOT_PATH, 'play.pokemonshowdown.com/src'), TL_CALL_OPTIONS);
	const calls = new TLCalls(TL_CALL_OPTIONS);
	const uiCalls = new TLCalls(TL_CALL_OPTIONS);
	const duplicates: string[] = [];
	for (const [key, call] of allCalls) {
		if (isOwnedBy(uiTemplate, key, call)) {
			if (isOwnedBy(template, key, call)) duplicates.push(key);
			uiCalls.set(key, call);
		} else {
			calls.set(key, call);
		}
	}
	if (duplicates.length) {
		throw new Error(
			`These keys are in both translations/en-template.ts and server's data/text/ui-template.ts; ` +
			`one needs to be removed:\n${formatKeys(duplicates)}`
		);
	}
	resolveTLCalls(template, calls);
	resolveTLCalls(uiTemplate, uiCalls);

	const update = template.update(calls);
	if (update.errors.length) {
		throw new Error(`UI translation template needs manual changes:\n  - ${update.errors.join('\n  - ')}`);
	}
	if (update.source !== templateSource) {
		fs.writeFileSync(TEMPLATE_PATH, update.source);
		const additions = update.added.length ? ` with new calls:\n${formatKeys(update.added)}` : '';
		throw new Error(
			`UI translation template was updated${additions}.\n` +
			`Review translations/en-template.ts, then run:\n  node build translations --sync`
		);
	}

	const serverCalls = findTLCalls(SERVER_SOURCE_DIRECTORIES, SERVER_TL_CALL_OPTIONS);
	const sharedUsage = new TLCalls(TL_CALL_OPTIONS);
	for (const source of [serverCalls, uiCalls]) {
		for (const [key, call] of source) {
			if (!isOwnedBy(uiTemplate, key, call)) continue;
			const existing = sharedUsage.get(key);
			if (existing) {
				for (const context of call.contexts) existing.contexts.add(context);
			} else {
				sharedUsage.set(key, { ...call, contexts: new Set(call.contexts) });
			}
		}
	}
	resolveTLCalls(uiTemplate, sharedUsage);
	const uiUpdate = uiTemplate.update(sharedUsage);
	if (uiUpdate.errors.length) {
		throw new Error(`Shared UI template needs manual changes:\n  - ${uiUpdate.errors.join('\n  - ')}`);
	}
	if (uiUpdate.source !== uiTemplateSource) fs.writeFileSync(UI_TEMPLATE_PATH, uiUpdate.source);

	const mismatches = [];
	const localeFiles = [];
	for (const entry of fs.readdirSync(TRANSLATIONS_PATH, { withFileTypes: true })) {
		if (!entry.isFile() || !entry.name.endsWith('.ts') || entry.name === 'en-template.ts') continue;
		localeFiles.push(path.resolve(TRANSLATIONS_PATH, entry.name));
	}
	for (const file of localeFiles) {
		const localeSource = fs.readFileSync(file, 'utf8');
		const locale = new ParsedCatalog(localeSource, file);
		const comparison = template.compare(locale);
		if (!comparison.missing.length && !comparison.extra.length && !comparison.incompatible.length &&
			!comparison.commentMismatches.length && !comparison.orderMismatch) continue;
		if (!options.sync) {
			mismatches.push(translationMismatchMessage(file, TEMPLATE_PATH, comparison));
			continue;
		}
		const synced = template.sync(locale, calls);
		if (synced.comparison.extra.length || synced.comparison.incompatible.length) {
			mismatches.push(translationMismatchMessage(file, TEMPLATE_PATH, synced.comparison));
			continue;
		}
		fs.writeFileSync(file, synced.source);
	}
	if (mismatches.length) {
		throw new Error(
			`${mismatches.join('\n\n')}\n\nReview translations/en-template.ts, then run:\n` +
			`  node build translations --sync`
		);
	}
	for (const [key, call] of sharedUsage) calls.set(key, call);
	return calls;
}
