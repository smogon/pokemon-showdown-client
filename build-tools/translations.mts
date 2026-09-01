import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { findTLCalls, type TLCalls, type TLCallsForKey } from './tl-calls.mts';

const ROOT_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TRANSLATIONS_PATH = path.resolve(ROOT_PATH, 'translations');
const TEMPLATE_PATH = path.resolve(TRANSLATIONS_PATH, 'en-template.ts');

type TranslationValue = string | null | Record<string, string | null>;
export type UIText = Record<string, TranslationValue>;

interface UITextEntry {
	key: string;
	callKey: string;
	placeholders: string[];
	region: string;
	start: number;
	end: number;
	rawLines: string[];
	sharedComments: string[];
	localComments: string[];
	value: TranslationValue;
}

interface UITextComparison {
	missing: string[];
	extra: string[];
	incompatible: string[];
	commentMismatches: string[];
	orderMismatch: boolean;
}

function parseCatalogKey(catalogKey: string): { callKey: string, placeholders: string[] } {
	const placeholders: string[] = [];
	const callKey = catalogKey.replace(/\{([^{}]+)\}/g, (placeholder, name) => {
		placeholders.push(name);
		return `{${placeholders.length - 1}}`;
	});
	return { callKey, placeholders };
}

function formatCatalogKey(callKey: string, placeholders: string[]): string {
	if (!placeholders.length) return callKey;
	return callKey.replace(/\{(\d+)\}/g, (placeholder, indexText) => {
		const name = placeholders[Number(indexText)];
		return name === undefined ? placeholder : `{${name}}`;
	});
}

function groupCallsByCatalogKey(calls: TLCalls): Map<string, TLCallsForKey> {
	const catalogCalls = new Map<string, TLCallsForKey>();
	for (const [callKey, call] of calls) {
		const key = formatCatalogKey(callKey, call.placeholders);
		let target = catalogCalls.get(key);
		if (!target) {
			target = { placeholders: call.placeholders, contexts: new Set(), region: call.region };
			catalogCalls.set(key, target);
		}
		for (const context of call.contexts) target.contexts.add(context);
		if (target.region !== call.region) target.region = 'Generic UI';
	}
	return catalogCalls;
}

export class ParsedUIText {
	readonly source: string;
	readonly lines: string[];
	readonly entries: UITextEntry[] = [];
	readonly entriesByKey = new Map<string, UITextEntry>();
	readonly entriesByCallKey = new Map<string, UITextEntry[]>();
	readonly regionEnds = new Map<string, number>();
	readonly objectStart: number;
	readonly objectEnd: number;

	static evaluate(source: string, filename = '<ui>'): UIText {
		const withoutTypeImports = source.replace(/^import\s+type\s+.*;\s*$/gm, '');
		const runnable = withoutTypeImports.replace(
			/\bexport\s+const\s+translations(?:\s*:\s*UIText)?\s*=/, 'const translations ='
		);
		if (runnable === withoutTypeImports) throw new Error(`${filename} must export a \`translations\` object`);
		const translations = Function(`"use strict";\n${runnable}\nreturn translations;`)();
		if (!translations || typeof translations !== 'object' || Array.isArray(translations)) {
			throw new Error(`${filename} must export a \`translations\` object`);
		}
		return translations as UIText;
	}

	private static isStructuralComment(line: string): boolean {
		return /^\t\/\/ (?:#(?:end)?region |={10,})/.test(line);
	}

	constructor(source: string, filename = '<ui>') {
		this.source = source;
		this.lines = source.split('\n');
		const values = ParsedUIText.evaluate(source, filename);
		let region = '';
		let objectStart = -1;
		let objectEnd = -1;
		for (let i = 0; i < this.lines.length; i++) {
			if (/\bexport\s+const\s+translations(?:\s*:\s*UIText)?\s*=\s*\{/.test(this.lines[i])) {
				objectStart = i;
			}
			const regionStart = this.lines[i].match(/^\t\/\/ #region (.+)$/);
			if (regionStart) region = regionStart[1];
			const regionEnd = this.lines[i].match(/^\t\/\/ #endregion (.+)$/);
			if (regionEnd) {
				this.regionEnds.set(regionEnd[1], i);
				region = '';
			}
			const property = this.lines[i].match(/^\t("(?:\\.|[^"\\])*"):\s*(.*)$/);
			if (!property) continue;
			const key = JSON.parse(property[1]);
			if (this.entriesByKey.has(key)) {
				throw new Error(`${filename}: duplicate translation key ${JSON.stringify(key)}`);
			}
			let end = i;
			if (property[2].trim().startsWith('{')) {
				let foundEnd = false;
				while (++end < this.lines.length) {
					if (/^\t},(?:\s*\/\/.*)?$/.test(this.lines[end])) {
						foundEnd = true;
						break;
					}
				}
				if (!foundEnd) throw new Error(`${filename}: unterminated context map for ${JSON.stringify(key)}`);
			}
			let commentStart = i;
			while (commentStart > objectStart + 1 && /^\t\/\//.test(this.lines[commentStart - 1])) commentStart--;
			const leadingComments = this.lines.slice(commentStart, i);
			const { callKey, placeholders } = parseCatalogKey(key);
			const entry = {
				key, callKey, placeholders, region, start: i, end, rawLines: this.lines.slice(i, end + 1),
				sharedComments: leadingComments.filter(line => /^\t\/\/ TRANSLATORS:/.test(line)),
				localComments: leadingComments.filter(line => (
					!/^\t\/\/ TRANSLATORS:/.test(line) && !ParsedUIText.isStructuralComment(line)
				)),
				value: values[key],
			};
			this.entries.push(entry);
			this.entriesByKey.set(key, entry);
			if (!this.entriesByCallKey.has(callKey)) this.entriesByCallKey.set(callKey, []);
			this.entriesByCallKey.get(callKey)!.push(entry);
			i = end;
		}
		for (let i = this.lines.length - 1; i >= 0; i--) {
			if (this.lines[i].trim() === '};') {
				objectEnd = i;
				break;
			}
		}
		if (objectStart < 0 || objectEnd < 0) throw new Error(`${filename}: malformed translations object`);
		this.objectStart = objectStart;
		this.objectEnd = objectEnd;
	}

	resolveCalls(calls: TLCalls): string[] {
		const errors: string[] = [];
		for (const [callKey, call] of calls) {
			if (!call.placeholders.length) continue;
			const matches = this.entriesByCallKey.get(callKey) || [];
			const inferredKey = formatCatalogKey(callKey, call.placeholders);
			const exact = matches.find(entry => entry.key === inferredKey);
			const match = exact || (matches.length === 1 ? matches[0] : undefined);
			if (!match && matches.length > 1) {
				errors.push(`${JSON.stringify(callKey)} matches multiple translation keys`);
			} else if (match) {
				if (new Set(match.placeholders).size !== match.placeholders.length) {
					errors.push(`${JSON.stringify(match.key)} has duplicate placeholder names`);
				} else {
					call.placeholders = match.placeholders;
				}
			}
		}
		return errors;
	}

	/** Update this template to match the actual TL calls in the source code */
	update(calls: TLCalls): { source: string, added: string[], errors: string[] } {
		const catalogCalls = groupCallsByCatalogKey(calls);
		const additions = new Map<string, [string, TLCallsForKey][]>();
		const errors: string[] = [];
		for (const entry of this.entries) {
			if (entry.value === null) continue;
			if (!entry.value || typeof entry.value !== 'object' || Array.isArray(entry.value) ||
				Object.values(entry.value).some(value => value !== null)) {
				errors.push(`${JSON.stringify(entry.key)} must contain only null template values`);
			}
		}
		for (const [key, call] of catalogCalls) {
			const existing = this.entriesByKey.get(key);
			if (existing) {
				const expectedContexts = new Set(call.contexts);
				const actualContexts = existing.value && typeof existing.value === 'object' ?
					new Set(Object.keys(existing.value)) : new Set(['default']);
				for (const context of expectedContexts) {
					if (!actualContexts.has(context)) {
						errors.push(`${JSON.stringify(key)} needs context ${JSON.stringify(context)}`);
					}
				}
				continue;
			}
			const region = call.region;
			if (!this.regionEnds.has(region)) {
				errors.push(`${JSON.stringify(key)} maps to missing region ${JSON.stringify(region)}`);
				continue;
			}
			if (!additions.has(region)) additions.set(region, []);
			additions.get(region)!.push([key, call]);
		}
		if (errors.length) return { source: this.source, added: [], errors };

		const lines = [...this.lines];
		this.updateNotUsedMarkers(lines, catalogCalls);
		const added: string[] = [];
		const regions = [...additions].sort((a, b) => this.regionEnds.get(b[0])! - this.regionEnds.get(a[0])!);
		for (const [region, regionAdditions] of regions) {
			let insertion = this.regionEnds.get(region)!;
			while (insertion > 0 && lines[insertion - 1] === '') insertion--;
			const newLines = [];
			for (const [key, call] of regionAdditions) {
				newLines.push(...this.templateEntryLines(key, call));
				added.push(key);
			}
			newLines.push('');
			lines.splice(insertion, this.regionEnds.get(region)! - insertion, ...newLines);
		}
		return { source: lines.join('\n'), added, errors: [] };
	}

	private updateNotUsedMarkers(lines: string[], calls: ReadonlyMap<string, TLCallsForKey>): void {
		for (const entry of this.entries) {
			const contexts = calls.get(entry.key)?.contexts || new Set<string>();
			if (entry.value === null) {
				lines[entry.start] = this.setNotUsed(lines[entry.start], !contexts.has('default'));
				continue;
			}
			if (typeof entry.value !== 'object') continue;
			for (let i = entry.start + 1; i < entry.end; i++) {
				const property = lines[i].match(/^\t\t("(?:\\.|[^"\\])*"):\s*null,/);
				if (!property) continue;
				const context = JSON.parse(property[1]);
				lines[i] = this.setNotUsed(lines[i], !contexts.has(context));
			}
		}
	}

	private setNotUsed(line: string, notUsed: boolean): string {
		if (notUsed) return line.replace(/null,\s*(?:\/\/ NOT USED)?$/, 'null, // NOT USED');
		return line.replace(/null,\s*\/\/ NOT USED$/, 'null,');
	}

	compare(locale: ParsedUIText): UITextComparison {
		const missing: string[] = [];
		const extra: string[] = [];
		const incompatible: string[] = [];
		const commentMismatches: string[] = [];
		for (const entry of this.entries) {
			const localized = locale.entriesByKey.get(entry.key);
			if (!localized) {
				missing.push(entry.key);
				continue;
			}
			if (this.schema(entry.value) !== this.schema(localized.value)) incompatible.push(entry.key);
			if (entry.sharedComments.join('\n') !== localized.sharedComments.join('\n')) {
				commentMismatches.push(entry.key);
			}
		}
		for (const entry of locale.entries) {
			if (!this.entriesByKey.has(entry.key)) extra.push(entry.key);
		}
		const orderMismatch = this.entries.some((entry, i) => entry.key !== locale.entries[i]?.key);
		return { missing, extra, incompatible, commentMismatches, orderMismatch };
	}

	/** Update a locale file to match this template */
	sync(locale: ParsedUIText, calls?: TLCalls): { source: string, comparison: UITextComparison } {
		const comparison = this.compare(locale);
		if (comparison.incompatible.length) {
			return { source: locale.source, comparison };
		}

		const output = locale.lines.slice(0, locale.objectStart + 1);
		let cursor = this.objectStart + 1;
		for (const entry of this.entries) {
			output.push(...this.filterScaffolding(this.lines.slice(cursor, entry.start)));
			let localized = locale.entriesByKey.get(entry.key);
			if (!localized && calls?.get(entry.callKey)?.placeholders.length) {
				const matches = locale.entriesByCallKey.get(entry.callKey) || [];
				if (matches.length === 1) localized = matches[0];
			}
			if (localized) {
				const migrated = this.renameEntryPlaceholders(localized, entry);
				output.push(...migrated.localComments, ...migrated.rawLines);
			} else {
				output.push(...this.untranslatedEntryLines(entry));
			}
			cursor = entry.end + 1;
		}
		output.push(...this.filterScaffolding(this.lines.slice(cursor, this.objectEnd)));
		output.push(...locale.lines.slice(locale.objectEnd));
		const source = output.join('\n');
		return { source, comparison: this.compare(new ParsedUIText(source)) };
	}

	private renameEntryPlaceholders(entry: UITextEntry, target: UITextEntry) {
		if (entry.key === target.key || entry.callKey !== target.callKey) return entry;
		const replacements = new Map(entry.placeholders.map((name, i) => (
			[name, target.placeholders[i]]
		)));
		const replacePlaceholders = (text: string) => text.replace(/\{([^{}]+)\}/g, (placeholder, name) => {
			const replacement = replacements.get(name);
			return replacement === undefined ? placeholder : `{${replacement}}`;
		});
		const migrateLine = (line: string) => {
			if (/^\s*\/\//.test(line)) return replacePlaceholders(line);
			return line.replace(/"(?:\\.|[^"\\])*"/g, token => (
				JSON.stringify(replacePlaceholders(JSON.parse(token)))
			));
		};
		return {
			...entry,
			localComments: entry.localComments.map(migrateLine),
			rawLines: entry.rawLines.map(migrateLine),
		};
	}

	private schema(value: TranslationValue): string {
		if (value === null || typeof value === 'string') return 'default';
		if (!value || typeof value !== 'object' || Array.isArray(value)) return 'invalid';
		return Object.keys(value).sort().join('\0');
	}

	private templateEntryLines(key: string, call: TLCallsForKey): string[] {
		const contexts = [...call.contexts].sort((a, b) => (
			a === 'default' ? -1 : b === 'default' ? 1 : a.localeCompare(b)
		));
		if (contexts.length === 1 && contexts[0] === 'default') {
			return [`\t${JSON.stringify(key)}: null,`];
		}
		return [
			`\t${JSON.stringify(key)}: {`,
			...contexts.map(context => `\t\t${JSON.stringify(context)}: null,`),
			'\t},',
		];
	}

	private filterScaffolding(lines: string[]): string[] {
		return lines.filter(line => (
			!/^\t\/\//.test(line) || /^\t\/\/ TRANSLATORS:/.test(line) || ParsedUIText.isStructuralComment(line)
		));
	}

	private untranslatedEntryLines(entry: UITextEntry): string[] {
		if (entry.value === null) return [`\t${JSON.stringify(entry.key)}: null, // NEEDS TRANSLATION`];
		return [
			`\t${JSON.stringify(entry.key)}: {`,
			...Object.keys(entry.value).map(context => (
				`\t\t${JSON.stringify(context)}: null, // NEEDS TRANSLATION`
			)),
			'\t},',
		];
	}
}

export function validateBattleUIText(translations: unknown, filename: string): UIText {
	if (!translations || typeof translations !== 'object' || Array.isArray(translations)) {
		throw new TypeError(`${filename} must export a \`translations\` object`);
	}
	for (const [english, translated] of Object.entries(translations)) {
		if (translated === '') {
			throw new TypeError(
				`${filename}: translation for ${JSON.stringify(english)} must use null to fall back to English`
			);
		}
		if (typeof translated === 'string' || translated === null) continue;
		if (!translated || typeof translated !== 'object' || Array.isArray(translated)) {
			throw new TypeError(
				`${filename}: translation for ${JSON.stringify(english)} must be a string, null, or context map`
			);
		}
		for (const [context, contextTranslation] of Object.entries(translated)) {
			if (contextTranslation === '') {
				throw new TypeError(
					`${filename}: translation for ${JSON.stringify(english)} in context ${JSON.stringify(context)} ` +
					`must use null to fall back to English`
				);
			}
			if (typeof contextTranslation !== 'string' && contextTranslation !== null) {
				throw new TypeError(
					`${filename}: translation for ${JSON.stringify(english)} in context ${JSON.stringify(context)} ` +
					`must be a string or null`
				);
			}
		}
	}
	return translations as UIText;
}

export function loadBattleUIText(lang: string): UIText {
	const file = path.resolve(TRANSLATIONS_PATH, `${lang}.ts`);
	if (!fs.existsSync(file)) return {};
	return validateBattleUIText(ParsedUIText.evaluate(fs.readFileSync(file, 'utf8'), file), file);
}

export function resolveTLCalls(template: ParsedUIText): TLCalls {
	const calls = findTLCalls();
	const errors = template.resolveCalls(calls);
	if (errors.length) throw new Error(`UI translation template needs manual changes:\n  - ${errors.join('\n  - ')}`);
	return calls;
}

/** Compile readable catalog placeholders back to the positional placeholders used by tagged TL calls. */
export function compileBattleUIText(uiText: UIText, calls: TLCalls): UIText {
	const callsByCatalogKey = new Map<string, [string, TLCallsForKey]>();
	for (const [callKey, call] of calls) {
		if (call.placeholders.length) {
			callsByCatalogKey.set(formatCatalogKey(callKey, call.placeholders), [callKey, call]);
		}
	}

	const compiled: UIText = {};
	for (const [key, value] of Object.entries(uiText)) {
		const resolvedCall = callsByCatalogKey.get(key);
		if (!resolvedCall) {
			compiled[key] = value;
			continue;
		}
		const [callKey, call] = resolvedCall;
		const compileValue = (text: string | null) => text?.replace(/\{([^{}]+)\}/g, (placeholder, name) => {
			const index = call.placeholders.indexOf(name);
			return index < 0 ? placeholder : `{${index}}`;
		}) ?? null;
		compiled[callKey] = typeof value === 'object' && value ?
			Object.fromEntries(Object.entries(value).map(([context, text]) => [context, compileValue(text)])) :
			compileValue(value);
	}
	return compiled;
}

function formatKeys(keys: string[]): string {
	return keys.map(key => `  - ${JSON.stringify(key)}`).join('\n');
}

function translationMismatchMessage(filename: string, comparison: UITextComparison): string {
	const parts = [`${filename} does not match translations/en-template.ts.`];
	if (comparison.missing.length) parts.push(`Missing entries:\n${formatKeys(comparison.missing)}`);
	if (comparison.extra.length) parts.push(`Entries absent from template:\n${formatKeys(comparison.extra)}`);
	if (comparison.incompatible.length) {
		parts.push(`Context shapes requiring manual review:\n${formatKeys(comparison.incompatible)}`);
	}
	if (comparison.commentMismatches.length) {
		parts.push(`Outdated TRANSLATORS comments:\n${formatKeys(comparison.commentMismatches)}`);
	}
	if (comparison.orderMismatch) parts.push(`Entries are not in template order.`);
	return parts.join('\n');
}

export function updateUIText(options: { sync?: boolean } = {}): TLCalls {
	const templateSource = fs.readFileSync(TEMPLATE_PATH, 'utf8');
	const template = new ParsedUIText(templateSource, TEMPLATE_PATH);
	const calls = resolveTLCalls(template);
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

	const mismatches = [];
	const localeFiles = [];
	for (const entry of fs.readdirSync(TRANSLATIONS_PATH, { withFileTypes: true })) {
		if (!entry.isFile() || !entry.name.endsWith('.ts') || entry.name === 'en-template.ts') continue;
		localeFiles.push(path.resolve(TRANSLATIONS_PATH, entry.name));
	}
	for (const file of localeFiles) {
		const localeSource = fs.readFileSync(file, 'utf8');
		const locale = new ParsedUIText(localeSource, file);
		const comparison = template.compare(locale);
		if (!comparison.missing.length && !comparison.extra.length && !comparison.incompatible.length &&
			!comparison.commentMismatches.length && !comparison.orderMismatch) continue;
		if (!options.sync) {
			mismatches.push(translationMismatchMessage(file, comparison));
			continue;
		}
		const synced = template.sync(locale, calls);
		if (synced.comparison.extra.length || synced.comparison.incompatible.length) {
			mismatches.push(translationMismatchMessage(file, synced.comparison));
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
	return calls;
}
