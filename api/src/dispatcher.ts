/**
 * Request handling.
 * By Mia
 * @author mia-pi-git
 */
import {actions} from './actions';
import * as child from 'child_process';
import {Config} from './config-loader';
import * as http from 'http';
import {Session} from './session';
import {md5} from './replays';
import {User} from './user';
import {URLSearchParams} from 'url';
import {toID} from './server';
import * as dns from 'dns';

/**
 * Throw this to end a request with an `actionerror` message.
 */
export class ActionError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ActionError';
		Error.captureStackTrace(this, ActionError);
	}
}

export interface RegisteredServer {
	name: string;
	id: string;
	server: string;
	port: number;
	token?: string;
	skipipcheck?: boolean;
	ipcache?: string;
}

export type QueryHandler = (
	this: Dispatcher, params: {[k: string]: string}
) => {[k: string]: any} | Promise<{[k: string]: any}>;

export interface DispatcherOpts {
	body: {[k: string]: string};
	act: string;
}

export class Dispatcher {
	readonly request: http.IncomingMessage;
	readonly response: http.ServerResponse;
	readonly session: Session;
	readonly user: User;
	readonly opts: DispatcherOpts;
	readonly cookies: Map<string, string>;
	private prefix: string | null = null;
	constructor(
		req: http.IncomingMessage,
		res: http.ServerResponse,
		opts: DispatcherOpts,
	) {
		this.request = req;
		this.response = res;
		this.session = new Session(this);
		this.user = new User(this.session);
		this.opts = opts;
		this.cookies = Dispatcher.parseCookie(this.request.headers.cookie);
	}
	async executeActions() {
		const {act, body} = this.opts;
		if (!act) throw new ActionError('You must specify a request type.');
		await this.session.checkLoggedIn();
		const handler = actions[act];
		if (!handler) {
			throw new ActionError('That request type was not found.');
		}
		return handler.call(this, body);
	}
	static async parseJSONRequest(req: http.IncomingMessage) {
		let body = '';
		if (this.isJSON(req)) {
			await new Promise<void>(resolve => {
				req.on('data', data => {
					body += data;
				});
				req.once('end', () => {
					resolve();
				});
			});
		}
		try {
			return JSON.parse(body);
		} catch {
			return null;
		}
	}
	static getBody(req: http.IncomingMessage) {
		if (this.isJSON(req)) {
			return this.parseJSONRequest(req);
		}
		return this.parseURLRequest(req);
	}
	static parseURLRequest(req: http.IncomingMessage) {
		if (!req.url) return {};
		const [, params] = req.url.split('?');
		if (!params) return {};
		return Object.fromEntries(new URLSearchParams(params));
	}
	static isJSON(req: http.IncomingMessage) {
		return req.headers['content-type'] === 'application/json';
	}
	verifyCrossDomainRequest(): string {
		if (typeof this.prefix === 'string') return this.prefix;
		// No cross-domain multi-requests for security reasons.
		// No need to do anything if this isn't a cross-domain request.
		const origin = this.request.headers.origin;
		if (!origin) {
			return '';
		}

		let prefix = null;
		for (const [regex, host] of Config.cors) {
			if (!regex.test(origin)) continue;
			prefix = host;
		}
		if (prefix === null) {
			// Bogus request.
			return '';
		}

		// Valid CORS request.
		this.setHeader('Access-Control-Allow-Origin', origin);
		this.setHeader('Access-Control-Allow-Credentials', 'true');
		this.prefix = prefix;
		return prefix;
	}
	setPrefix(prefix: string) {
		this.prefix = prefix;
	}
	getIp() {
		const ip = this.request.socket.remoteAddress;
		let forwarded = this.request.headers['x-forwarded-for'] || '';
		if (!Array.isArray(forwarded)) forwarded = forwarded.split(',');
		if (forwarded.length && Config.trustedproxies.includes(ip)) {
			return forwarded.pop() as string;
		}
		return ip || '';
	}
	setHeader(name: string, value: string | string[]) {
		this.response.setHeader(name, value);
	}
	static hostCache = new Map<string, string>();
	static async getHost(server: string) {
		let result = this.hostCache.get(server);
		if (result) return result;
		const address = await new Promise<string>(resolve => {
			dns.resolve(server, (err, addresses) => {
				if (err) {
					// i don't like this. BUT we have to match behavior with
					// php's gethostbyname, which returns the host given if no results
					resolve(server);
				} else { // see above
					resolve(addresses[0] || server);
				}
			});
		});
		result = address;
		this.hostCache.set(server, result);
		return result;
	}
	static parseAction(req: http.IncomingMessage, body: {[k: string]: string}) {
		if (body.act) {
			return body.act;
		}
		if (!req.url) return null;
		let [pathname] = req.url.split('?');
		if (pathname.endsWith('/')) pathname = pathname.slice(0, -1);
		for (const k in actions) {
			if (pathname.endsWith(`/api/${k}`)) {
				return k;
			}
		}
		return null;
	}
	async getServer(requireToken = false): Promise<RegisteredServer | null> {
		const body = this.opts.body || {};
		const serverid = toID(body.serverid);
		let server = null;
		const ip = this.getIp();
		if (!Dispatcher.servers[serverid]) {
			return server;
		} else {
			server = Dispatcher.servers[serverid];
			if (!server.skipipcheck && !server.token && serverid !== 'showdown') {
				if (!server.ipcache) {
					server.ipcache = await Dispatcher.getHost(server.server);
				}
				if (ip !== server.ipcache) return null;
			}
		}
		if (server.token) {
			if (server.token !== md5(body.servertoken)) {
				if (requireToken) {
					throw new ActionError(`Invalid servertoken sent for requested serverid.`);
				}
				return null;
			}
		}
		return server;
	}
	static parseCookie(cookieString?: string) {
		const list = new Map<string, string>();
		if (!cookieString) return list;
		const parts = cookieString.split(';');
		for (const part of parts) {
			const [curName, val] = part.split('=').map(i => i.trim());
			list.set(curName, decodeURIComponent(val));
		}
		return list;
	}
	static loadServers(path = Config.serverlist): {[k: string]: RegisteredServer} {
		try {
			const stdout = child.execFileSync(
				`php`, ['-f', __dirname + '/../src/lib/load-servers.php', path]
			).toString();
			return JSON.parse(stdout);
		} catch (e: any) {
			if (e.code !== 'ENOENT') throw e;
		}
		return {};
	}
	static servers: {[k: string]: RegisteredServer} = Dispatcher.loadServers();
	static ActionError = ActionError;
}
