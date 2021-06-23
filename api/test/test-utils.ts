/**
 * Miscellaneous utilities for tests.
 * We also start up global hooks here.
 * By Mia.
 * @author mia-pi-git
 */

import * as net from 'net';
import {IncomingMessage, ServerResponse} from 'http';
import {Dispatcher, RegisteredServer} from '../dispatcher';
import {execSync} from 'child_process';
import {databases} from '../database';
import * as mysql from 'mysql';
import * as fs from 'fs';

export let setup = false;
export async function setupContainers() {
	if (setup) return;
	setup = true;

	const config = {
		password: 'testpw',
		user: 'root',
		host: 'localhost',
		port: 3308,
	};
	const commands = [
		'docker run --name api-test -p 3308 -e MYSQL_ROOT_PASSWORD=testpw -d mysql:latest',
	];
	for (const command of commands) execSync(command);

	const sqlFiles = fs.readdirSync(`${__dirname}/../../lib/`)
		.filter(f => f.endsWith('.sql'))
		.map(k => `lib/${k}`)
		.concat(['replays/ps_prepreplays.sql', 'replays/ps_replays.sql']);


	for (const db of databases) {
		db.pool = mysql.createPool(config);
		for (const file of sqlFiles) {
			await db.query(fs.readFileSync(`${__dirname}/../../${file}`, 'utf-8'), []);
		}
	}
}

export function makeDispatcher(body?: {[k: string]: any}, url?: string) {
	const socket = new net.Socket();
	const req = new IncomingMessage(socket);
	if (body && !url) {
		const params = Object.entries(body)
			.filter(k => k[0] !== 'act')
			.map(([k, v]) => `${k}=${v}`)
			.join('&');
		url = `/api/${body.act}?${params}`;
	}
	if (url) req.url = url;
	return new Dispatcher(req, new ServerResponse(req), body ? {body} : undefined);
}

export function addServer(server: RegisteredServer) {
	Dispatcher.servers[server.id] = server;
	return server;
}

beforeEach(async () => {
	await setupContainers();
});
