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
import {User} from './user';

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
	parseRequest() {
		const [pathname, queryString] = this.request.url?.split('?') || [];
		const body: {[k: string]: any} = this.opts.body || {};
		let act = body.act; // checking for an act in the preset body
		if (!this.opts.body && queryString) {
			const parts = queryString.split('&');
			for (const [k, v] of parts.map(p => p.split('='))) body[k] = v;
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
	getServer(requireToken = false): RegisteredServer | null {
		const body = this.parseRequest()?.body || {};
		const server = Dispatcher.servers[body.serverid];
		if (server) {
			if (requireToken && server.token && (
				!body.servertoken || body.servertoken !== server.token
			)) {
				throw new ActionError('You sent an invalid server token.');
			}
			return server;
		}
		return null;
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
	static servers: {[k: string]: RegisteredServer} = (() => {
		try {
			const stdout = child.execFileSync(
				`php`, ['-f', 'src/lib/load-servers.php', Config.serverlist]
			).toString();
			return JSON.parse(stdout);
		} catch (e: any) {
			if (e.code !== 'ENOENT') throw e;
		}
		return {};
	})();
	static ActionError = ActionError;
}
