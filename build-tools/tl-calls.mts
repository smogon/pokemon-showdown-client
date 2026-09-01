// Library for searching source files for
// `` TL`text` ``, `` TL(text) ``, and `` TL(text, context) `` calls.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_PATH = path.resolve(ROOT_PATH, 'play.pokemonshowdown.com/src');

export interface TLCallsForKey {
	placeholders: string[];
	contexts: Set<string>;
	region: string;
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
				const template = TLCalls.taggedTemplate(match[1]);
				this.addCall(template.key, template.placeholders, 'default', filename);
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
			this.addCall(key, [], context, filename);
		}
		return this;
	}

	private addCall(key: string, placeholders: string[], context: string, filename: string): void {
		const region = TLCalls.regionForFile(filename);
		let call = this.get(key);
		if (!call) {
			call = { placeholders, contexts: new Set(), region };
			this.set(key, call);
		} else if (!call.placeholders.length && placeholders.length) {
			call.placeholders = placeholders;
		}
		if (call.region !== region) call.region = 'Generic UI';
		call.contexts.add(context);
	}

	private static decodeLiteral(raw: string, quote: string): string {
		return Function(`"use strict"; return ${quote}${raw}${quote};`)() as string;
	}

	private static taggedTemplate(raw: string): {
		key: string, placeholders: string[],
	} {
		const expressionRegex = /(?<!\\)\$\{([^{}]*)\}/g;
		const strings: string[] = [];
		const expressions: string[] = [];
		let lastIndex = 0;
		for (const match of raw.matchAll(expressionRegex)) {
			strings.push(this.decodeLiteral(raw.slice(lastIndex, match.index), '`'));
			expressions.push(match[1].trim());
			lastIndex = match.index + match[0].length;
		}
		const remainder = raw.slice(lastIndex);
		if (/(?<!\\)\$\{/.test(remainder)) {
			throw new Error(`TL template expressions may not contain braces`);
		}
		strings.push(this.decodeLiteral(remainder, '`'));

		const placeholderBases = expressions.map(expression => expression.slice(expression.lastIndexOf('.') + 1));
		const counts = new Map<string, number>();
		for (const placeholder of placeholderBases) {
			counts.set(placeholder, (counts.get(placeholder) || 0) + 1);
		}
		const seen = new Map<string, number>();
		const placeholders = placeholderBases.map(placeholder => {
			if (counts.get(placeholder) === 1) return placeholder;
			const index = (seen.get(placeholder) || 0) + 1;
			seen.set(placeholder, index);
			return `${placeholder}${index}`;
		});

		let key = strings[0];
		for (let i = 0; i < placeholders.length; i++) {
			key += `{${i}}${strings[i + 1]}`;
		}
		return { key, placeholders };
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
