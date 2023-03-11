/**
 * Miscellaneous utilities for tests.
 * We also start up global hooks here.
 * By Mia.
 * @author mia-pi-git
 */

import * as net from 'net';
import {IncomingMessage, ServerResponse} from 'http';
import {ActionContext, RegisteredServer} from '../server';
import {Config} from '../config-loader';
import * as crypto from 'crypto';
import {strict as assert} from 'assert';
import {md5} from '../replays';

/** Removing this as it does not work, but could be useful for future reference.
const commands = [
	'docker run --name api-test -p 3308:3306 -e MYSQL_ROOT_PASSWORD=testpw -d mysql:latest',
];
for (const command of commands) execSync(command);
const config = {
	password: 'testpw',
	user: 'root',
	host: '127.0.0.1',
	port: 3308,
};*/

export function makeDispatcher(body: {[k: string]: any}, url?: string) {
	const socket = new net.Socket();
	const req = new IncomingMessage(socket);
	if (body && !url) {
		const params = Object.entries(body)
			.filter(k => k[0] !== 'act')
			.map(([k, v]) => `${k}=${v}`)
			.join('&');
	}
	if (url) req.url = url;
	return new ActionContext(req, new ServerResponse(req), {body, act: body.act});
}

export function addServer(server: RegisteredServer) {
	if (server.token) server.token = md5(server.token);
	if (!('skipipcheck' in server)) server.skipipcheck = false;
	ActionContext.servers[server.id] = server;
	return server;
}

export async function testDispatcher(
	opts: {[k: string]: any},
	setupFunct?: (context: ActionContext) => any | Promise<any>,
	method = 'POST',
) {
	const context = makeDispatcher(opts);
	context.request.method = method;
	if (setupFunct) await setupFunct(context);
	let result: any;
	try {
		result = await context.executeActions();
	} catch (e: any) {
		assert(false, e.message);
	}
	// we return context in case we need to do more
	return {result, context};
}

export async function randomBytes(size = 128) {
	return new Promise((resolve, reject) => {
		crypto.randomBytes(size, (err, buffer) => err ? reject(err) : resolve(buffer.toString('hex')));
	});
}
