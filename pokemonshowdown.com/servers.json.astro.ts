import { readFile } from 'node:fs/promises';
import { userstats } from '../api/src/tables.ts';
import routes from '../config/routes.json';
import { AsyncCache } from '../lib/async-cache.ts';

export const prerender = false;

type ServerEntry = { id: string, name: string, uri: string, usercount: number };

const serverList = new AsyncCache(10 * 60_000, async () => {
	const registry: Record<string, { id: string, name: string, hidden?: boolean }> =
		JSON.parse(await readFile(import.meta.dirname + '/../config/servers.json', 'utf8'));
	const rows = await userstats.selectAll(
		['serverid', 'usercount']
	)` WHERE serverid = 'showdown' OR date >= ${Date.now() - 30 * 60_000}`;
	const counts = new Map(rows.map(row => [row.serverid, row.usercount]));
	const servers: ServerEntry[] = [];
	for (const { id, name, hidden } of Object.values(registry)) {
		const usercount = counts.get(id);
		if (hidden || usercount === undefined) continue;
		const uri = id === 'showdown' ? `//${routes.client}` : `http://${id}.psim.us`;
		servers.push({ id, name, uri, usercount });
	}
	return servers.sort((a, b) =>
		Number(b.id === 'showdown') - Number(a.id === 'showdown') || b.usercount - a.usercount
	);
});

export async function GET() {
	return Response.json(await serverList.get(), { headers: { 'Access-Control-Allow-Origin': '*' } });
}
