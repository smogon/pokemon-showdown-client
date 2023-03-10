/**
 * Request handling.
 * By Mia
 * @author mia-pi-git
 */
import * as http from 'http';
import * as https from 'https';
import * as child from 'child_process';
import * as dns from 'dns';
import * as fs from 'fs';

import {Config} from './config-loader';
import {actions} from './actions';
import {Session} from './session';
import {md5} from './replays';
import {User} from './user';
import {URLSearchParams} from 'url';
import IPTools from './ip-tools';

/**
 * API request output should not be valid JavaScript.
 * This is to protect against a CSRF-like attack. Imagine you have an API:
 *     https://example.com/getmysecrets.json
 * Which returns:
 *     {"yoursecrets": [1, 2, 3]}
 *
 * An attacker could trick a user into visiting a site overriding the
 * Array or Object constructor, and then containing:
 *     <script src="https://example.com/getmysecrets.json"></script>
 *
 * This could let them steal the secrets. In modern times, browsers
 * are protected against this kind of attack, but our `]` adds some
 * safety for older browsers.
 *
 * Adding `]` to the beginning makes sure that the output is a syntax
 * error in JS, so treating it as a JS file will simply crash and fail.
 */
const DISPATCH_PREFIX = ']';

export function toID(text: any): string {
	if (text?.id) {
		text = text.id;
	} else if (text?.userid) {
		text = text.userid;
	}
	if (typeof text !== 'string' && typeof text !== 'number') return '';
	return ('' + text).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

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
	this: ActionContext, params: {[k: string]: string}
) => {[k: string]: any} | string | Promise<{[k: string]: any} | string>;

export interface DispatcherOpts {
	body: {[k: string]: string};
	act: string;
}

export class ActionContext {
	static servers: {[k: string]: RegisteredServer} = ActionContext.loadServers();
	static ActionError = ActionError;

	readonly request: http.IncomingMessage;
	readonly response: http.ServerResponse;
	readonly session: Session;
	user: User;
	readonly opts: DispatcherOpts;
	private prefix: string | null = null;
	constructor(
		req: http.IncomingMessage,
		res: http.ServerResponse,
		opts: DispatcherOpts,
	) {
		this.request = req;
		this.response = res;
		this.session = new Session(this);
		this.user = null!;
		this.opts = opts;
	}
	async executeActions() {
		const {act, body} = this.opts;
		if (!act) throw new ActionError('You must specify a request type.');
		const handler = actions[act];
		if (!handler) throw new ActionError(`Request type "${act}" was not found.`);

		this.user = await this.session.getUser();
		return handler.call(this, body);
	}
	static async parseSentRequest(req: http.IncomingMessage) {
		let body = '';
		await new Promise<void>(resolve => {
			req.on('data', data => {
				body += data;
			});
			req.once('end', () => {
				resolve();
			});
		});
		return body;
	}
	static safeJSON(data: string) {
		try {
			return JSON.parse(data);
		} catch {
			return null;
		}
	}
	static async getBody(req: http.IncomingMessage): Promise<{[k: string]: any}> {
		const data = await this.parseSentRequest(req);
		let result: {[k: string]: any} | null = null;
		if (data) {
			if (this.isJSON(req)) {
				result = this.safeJSON(data);
			} else {
				result = Object.fromEntries(new URLSearchParams(data));
			}
		}
		const urlData = this.parseURLRequest(req);
		if (result) {
			if (Array.isArray(result)) {
				for (const part of result) Object.assign(part, urlData);
			} else {
				Object.assign(result, urlData);
			}
		} else {
			result = urlData;
		}
		for (const k in result) {
			result[k] = result[k].toString();
		}
		return result;
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
		return {act: this.opts.body.act, body: this.opts.body};
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
	isTrustedProxy(ip: string) {
		// account for shit like ::ffff:127.0.0.1
		return Config.trustedproxies.some(f => IPTools.checkPattern(f, ip));
	}
	getIp() {
		const ip = this.request.socket.remoteAddress || "";
		let forwarded = this.request.headers['x-forwarded-for'] || '';
		if (!Array.isArray(forwarded)) forwarded = forwarded.split(',');
		const notProxy = forwarded.filter(f => !this.isTrustedProxy(f));
		if (notProxy.length !== forwarded.length) {
			return notProxy.pop() || ip;
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
	static parseAction(req: http.IncomingMessage, body: {[k: string]: unknown}) {
		if (typeof body.act === 'string') {
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
		if (!ActionContext.servers[serverid]) {
			return server;
		} else {
			server = ActionContext.servers[serverid];
			if (!server.skipipcheck && !server.token && serverid !== Config.mainserver) {
				if (!server.ipcache) {
					server.ipcache = await ActionContext.getHost(server.server);
				}
				if (ip !== server.ipcache) return null;
			}
		}
		if (server.token && requireToken) {
			if (server.token !== md5(body.servertoken)) {
				throw new ActionError(`Invalid servertoken sent for requested serverid.`);
			}
		}
		return server;
	}
	static loadServers(path = Config.serverlist): {[k: string]: RegisteredServer} {
		if (!path) return {};
		try {
			const stdout = child.execFileSync(
				`php`, ['-f', __dirname + '/../../src/lib/load-servers.php', path]
			).toString();
			return JSON.parse(stdout);
		} catch (e: any) {
			if (!['ENOENT', 'ENOTDIR', 'ENAMETOOLONG'].includes(e.code)) throw e;
		}
		return {};
	}

	static init() {
		fs.watchFile(Config.serverlist, (curr, prev) => {
			if (curr.mtime > prev.mtime) {
				ActionContext.loadServers();
			}
		});
	}
}

ActionContext.init();

export class Server {
	server: http.Server;
	httpsServer: https.Server | null;
	port: number;
	awaitingEnd?: () => void;
	closing?: Promise<void>;
	activeRequests = 0;
	constructor(port = (Config.port || 8000)) {
		this.port = port;
		const handle = (
			req: http.IncomingMessage, res: http.ServerResponse
		) => void this.handle(req, res);

		this.server = http.createServer(handle);
		this.server.listen(port);
		this.httpsServer = null;
		if (Config.ssl) {
			this.httpsServer = https.createServer(Config.ssl, handle);
			this.httpsServer.listen(port);
		}
	}
	static crashlog(error: unknown, source = '', details = {}) {
		if (!Config.pspath) {
			return console.log(`${source} crashed`, error, details);
		}
		try {
			const {crashlogger} = require(Config.pspath);
			crashlogger(error, source, details, Config.crashguardemail);
		} catch (e) {
			// don't have data/pokemon-showdown built? something else went wrong? oh well
			console.log('CRASH', error);
			console.log('SUBCRASH', e);
		}
	}
	async handle(req: http.IncomingMessage, res: http.ServerResponse) {
		const body = await ActionContext.getBody(req);
		this.ensureHeaders(res);
		if (body.json) {
			if (typeof body.json === 'string') {
				body.json = ActionContext.safeJSON(body.json);
			}
			if (!Array.isArray(body.json)) {
				body.json = [{actionerror: "Invalid JSON sent - must be an array."}];
			}
			const results = [];
			const restData: {[k: string]: any} = {...body, json: null};
			for (const curBody of body.json) {
				if (curBody.actionerror) {
					results.push(curBody);
					continue;
				}
				if (curBody.act === 'json') {
					results.push({actionerror: "Cannot request /api/json in a JSON request."});
					continue;
				}
				// for when extra stuff is sent inside the main body - ie
				// {serverid: string, json: [...]}
				for (const k in restData) {
					if (restData[k] && !curBody[k]) {
						curBody[k] = restData[k].toString();
					}
				}
				const result = await this.handleOne(curBody, req, res);
				if (typeof result === 'object' && result.error) {
					this.tryEnd();
					return;
				}
				results.push(result);
			}
			if (results.length) res.writeHead(200).end(Server.stringify(results));
		} else {
			// fall back onto null so it can be json stringified
			const result = await this.handleOne(body, req, res) || null;
			// returning null should be allowed
			if (!result || !(result as any).error) {
				res.writeHead(200).end(Server.stringify(result));
			}
			this.tryEnd();
		}
	}
	tryEnd() {
		if (!this.activeRequests && this.awaitingEnd) this.awaitingEnd();
	}
	ensureHeaders(res: http.ServerResponse) {
		if (!res.getHeader('Content-Type')) {
			res.setHeader('Content-Type', 'text/plain; charset=utf-8');
		}
	}
	async handleOne(
		body: {[k: string]: string},
		req: http.IncomingMessage,
		res: http.ServerResponse
	) {
		const act = ActionContext.parseAction(req, body);
		if (!act) {
			return {actionerror: "Invalid request action sent."};
		}
		const dispatcher = new ActionContext(req, res, {body, act});
		this.activeRequests++;
		try {
			const result = await dispatcher.executeActions();
			this.activeRequests--;
			if (this.awaitingEnd) res.setHeader('connection', 'close');
			if (result === null) {
				// didn't make a request to action.php or /api/
				return {code: 404};
			}
			return result;
		} catch (e: any) {
			this.activeRequests--;
			if (this.awaitingEnd) res.setHeader('connection', 'close');
			if (e instanceof ActionError) {
				return {actionerror: e.message};
			}

			for (const k of ['pass', 'password']) delete body[k];
			Server.crashlog(e, 'an API request', body);
			if (Config.devmode && Config.devmode === body.devmode) {
				res.writeHead(200).end(
					e.message + '\n' +
					e.stack + '\n' +
					JSON.stringify(body)
				);
			} else {
				res.writeHead(503).end();
			}
			return {error: true};
		}
	}
	close() {
		if (this.closing) return this.closing;
		this.server.close();
		if (!this.activeRequests) return Promise.resolve();
		this.closing = new Promise<void>(resolve => {
			this.awaitingEnd = resolve;
		});
		return this.closing;
	}
	static stringify(response: any) {
		if (typeof response === 'string') {
			return response; // allow ending with just strings;
		}
		// see DISPATCH_PREFIX
		return DISPATCH_PREFIX + JSON.stringify(response);
	}
}
