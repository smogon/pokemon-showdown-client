#!/usr/bin/env node
/**
 * Checks the databases in the API-server config file without starting the
 * server. Useful for testing a config file before bringing it live.
 *
 * Just run:
 *   ./api/check-databases.ts
 *
 * @author Zarel
 */
import { closeDatabases, SQL } from './src/database.ts';
import { users, teams, replays, ladder } from './src/tables.ts';

const checks = [
	{ name: 'logindb', table: users, record: 'user' },
	{ name: 'friendsdb', table: teams, record: 'team' },
	{ name: 'replaysdb', table: replays, record: 'replay' },
	{ name: 'ladderdb', table: ladder, record: 'ladder entry' },
];
const pending = new Set(checks.map(check => check.name));
const timeout = setTimeout(() => {
	for (const name of pending) {
		console.error(`${name}: failure (timed out after 30 seconds)`);
	}
	if (!pending.size) console.error('failure (timed out closing database connections)');
	process.exit(1);
}, 30_000);

try {
	await Promise.all(checks.map(async ({ name, table, record }) => {
		const label = `${name} (${table.name})`;
		try {
			const row = await table.selectOne(SQL`1 AS present`)``;
			console.log(`${label}: success (${row ? `${record} exists` : 'empty'})`);
		} catch (error) {
			console.error(`${label}: failure`);
			console.error(error);
			process.exitCode = 1;
		} finally {
			pending.delete(name);
		}
	}));
} finally {
	try {
		await closeDatabases();
	} finally {
		clearTimeout(timeout);
	}
}
