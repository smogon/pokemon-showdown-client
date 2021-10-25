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
	body: {[k: string]: string | number};
	act: string;
}

export class Dispatcher {
	readonly request: http.IncomingMessage;
	readonly response: http.ServerResponse;
	readonly session: Session;
	readonly user: User;
	readonly opts: Partial<DispatcherOpts>;
	readonly cookies: Map<string, string>;
	private prefix: string | null = null;
	constructor(
		req: http.IncomingMessage,
		res: http.ServerResponse,
		opts: Partial<DispatcherOpts> = {}
	) {
		this.request = req;
		this.response = res;
		this.session = new Session(this);
		this.user = new User(this.session);
		this.opts = opts;
		this.cookies = Dispatcher.parseCookie(this.request.headers.cookie);
	}
	async executeActions() {
		const data = this.parseRequest();
		if (data === null) {
			return data;
		}
		const {act, body} = data;
		if (!act) throw new ActionError('You must specify a request type.');
		await this.session.checkLoggedIn();
		const handler = actions[act];
		if (!handler) {
			throw new ActionError('That request type was not found.');
		}
		return handler.call(this, body);
	}
	static async parseJSONRequest(req: http.IncomingMessage) {
		const json: any[] = [];
		if (this.isJSON(req)) {
			await new Promise<void>(resolve => {
				req.on('data', data => {
					try {
						json.push(JSON.parse(data + ""));
					} catch (e) {
						json.push({actionerror: "Malformed JSON sent."});
					}
				});
				req.once('end', () => {
					resolve();
				});
			});
		}
		return json;
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
	parseRequest() {
		const [pathname] = this.request.url?.split('?') || [];
		const body: {[k: string]: any} = this.opts.body || {};
		let act = body.act; // checking for an act in the preset body
		if (!this.opts.body) {
			Object.assign(body, Dispatcher.parseURLRequest(this.request));
		}
		// check for an act in the url body (parsing url body above)
		if (body.act) act = body.act;
		// legacy handling of action.php - todo remove
		// (this is endsWith because we call /~~showdown/action.php a lot in the client)
		if (act && pathname.endsWith('/action.php')) {
			return {act, body};
		}
		if (pathname.includes('/api/')) {
			// support requesting {server}/api/actionnname as well as
			// action.php?act=actionname (TODO: deprecate action.php)
			for (const action in actions) {
				if (pathname.endsWith(`/api/${action}`)) {
					return {act: action, body};
				}
			}
			throw new ActionError('Invalid request passed to /api/. Request /api/{action} instead.');
		}
		return null;
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
	async getServer(requireToken = false): Promise<RegisteredServer | null> {
		const body = this.parseRequest()?.body || {};
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
