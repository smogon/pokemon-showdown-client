// Library for searching source files for
// `` TL`text` ``, `` TL(text) ``, and `` TL(text, context) `` calls.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_PATH = path.resolve(ROOT_PATH, 'play.pokemonshowdown.com/src');

export interface TLCallsForKey {
	contexts: Set<string>;
	regions: Set<string>;
	locations: { filename: string, offset: number }[];
}

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
	'panel-teambuilder.tsx': 'Teambuilder',
	'panel-teambuilder-team.tsx': 'Teambuilder',
	'battle-team-editor.tsx': 'Teambuilder',
	'battle-searchresults.tsx': 'Teambuilder',
	'panel-popups.tsx': 'Popups',
	'panel-teamdropdown.tsx': 'Popups',
	'panel-resources.tsx': 'Popups',
	'panel-ladder.tsx': 'Ladder',
};

/*
SOURCE FOR TAGGED_TL_REGEX (compile with https://regexfree.k55.io/ )

	\b TL \s* `
	(?<key> ( \\ [\s\S] | [^`] )* )
	`

*/
const TAGGED_TL_REGEX = /\bTL\s*`((?:\\[\s\S]|[^`])*)`/g;

/*
SOURCE FOR CALLED_TL_REGEX (compile with https://regexfree.k55.io/ )

	\b TL \s* \( \s*
	(
		"(?<doubleQuotedKey> ( \\ [\s\S] | [^"\\] )* )"
	|
		'(?<singleQuotedKey> ( \\ [\s\S] | [^'\\] )* )'
	)
	(
		\s* , \s*
		(
			"(?<doubleQuotedContext> ( \\ [\s\S] | [^"\\] )* )"
		|
			'(?<singleQuotedContext> ( \\ [\s\S] | [^'\\] )* )'
		)
	)?
	\s* \)

*/
const CALLED_TL_REGEX = /\bTL\s*\(\s*(?:"((?:\\[\s\S]|[^"\\])*)"|'((?:\\[\s\S]|[^'\\])*)')(?:\s*,\s*(?:"((?:\\[\s\S]|[^"\\])*)"|'((?:\\[\s\S]|[^'\\])*)'))?\s*\)/g;

/** map from key to TL calls */
export class TLCalls extends Map<string, TLCallsForKey> {
	static fromSource(source: string, filename = '<source>'): TLCalls {
		return new TLCalls().scan(source, filename);
	}

	scan(source: string, filename = '<source>'): this {
		for (const match of source.matchAll(TAGGED_TL_REGEX)) {
			try {
				this.addCall(TLCalls.taggedTemplateKey(match[1]), 'default', filename, match.index);
			} catch (error) {
				const line = source.slice(0, match.index).split('\n').length;
				throw new Error(`${filename}:${line}: ${error instanceof Error ? error.message : String(error)}`);
			}
		}
		for (const match of source.matchAll(CALLED_TL_REGEX)) {
			const keyQuote = match[1] === undefined ? "'" : '"';
			const key = TLCalls.decodeLiteral(match[1] ?? match[2], keyQuote);
			let context = 'default';
			if (match[3] !== undefined || match[4] !== undefined) {
				const contextQuote = match[3] === undefined ? "'" : '"';
				context = TLCalls.decodeLiteral(match[3] ?? match[4], contextQuote);
			}
			this.addCall(key, context, filename, match.index);
		}
		return this;
	}

	private addCall(key: string, context: string, filename: string, offset: number): void {
		let call = this.get(key);
		if (!call) {
			call = { contexts: new Set(), regions: new Set(), locations: [] };
			this.set(key, call);
		}
		call.contexts.add(context);
		call.regions.add(TLCalls.regionForFile(filename));
		call.locations.push({ filename, offset });
	}

	private static decodeLiteral(raw: string, quote: string): string {
		return Function(`"use strict"; return ${quote}${raw}${quote};`)() as string;
	}

	private static taggedTemplateKey(raw: string): string {
		const expressionRegex = /(?<!\\)\$\{([^{}]*)\}/g;
		let key = '';
		let lastIndex = 0;
		let index = 0;
		for (const match of raw.matchAll(expressionRegex)) {
			key += this.decodeLiteral(raw.slice(lastIndex, match.index), '`');
			key += `{${++index}}`;
			lastIndex = match.index + match[0].length;
		}
		const remainder = raw.slice(lastIndex);
		if (/(?<!\\)\$\{/.test(remainder)) {
			throw new Error(`TL template expressions may not contain braces`);
		}
		return key + this.decodeLiteral(remainder, '`');
	}

	private static regionForFile(filename: string): string {
		return REGION_BY_FILE[path.basename(filename)] || 'Generic UI';
	}
}

function findSourceFiles(directory: string): string[] {
	const files: string[] = [];
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		const file = path.resolve(directory, entry.name);
		if (entry.isDirectory()) {
			files.push(...findSourceFiles(file));
		} else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
			files.push(file);
		}
	}
	return files.sort();
}

export function findTLCalls(directory = SOURCE_PATH): TLCalls {
	const calls = new TLCalls();
	for (const file of findSourceFiles(directory)) {
		calls.scan(fs.readFileSync(file, 'utf8'), file);
	}
	return calls;
}
