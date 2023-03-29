/**
 * Request handling.
 *
 * @author mia-pi-git, Zarel
 */
import * as http from 'http';
import * as https from 'https';
import * as child from 'child_process';
import * as dns from 'dns';
import * as fs from 'fs';
import {toID, md5} from './utils';
import {Config} from './config-loader';
import {actions} from './actions';
import {User, Session} from './user';
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

/**
 * Throw this to end a request with an `actionerror` message.
 */
export class ActionError extends Error {
	httpStatus: number;
	constructor(message: string, httpStatus = 200) {
		super(message);
		this.httpStatus = httpStatus;
		this.name = 'ActionError';
		Error.captureStackTrace(this, ActionError);
	}
}

export interface ActionRequest {
	/** Name of the action */
	act: string;

	/** SID to make a request as a logged-in user (usually passed in cookies but can be passed here too) */
	sid?: string;
	servertoken?: string;
	serverid?: string;

	[k: string]: string | undefined;
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
	this: ActionContext, params: ActionRequest
) => {[k: string]: any} | string | Promise<{[k: string]: any} | string>;

export class ActionContext {
	readonly request: http.IncomingMessage;
	readonly response: http.ServerResponse;
	readonly session: Session;
	user: User;
	private prefix: string | null = null;
	readonly body: ActionRequest;
	constructor(req: http.IncomingMessage, res: http.ServerResponse, body: ActionRequest) {
		this.request = req;
		this.response = res;
		this.session = new Session(this);
		this.user = null!;
		this.body = body;
	}
	async executeActions() {
		const body = this.body;
		const act = body.act;

		if (!act) throw new ActionError('Request needs an act - /api/[act] or JSON {act: [act]}', 404);
		const handler = actions[act];
		if (!handler) throw new ActionError(`Request type "${act}" was not recognized.`, 404);

		// the cookies are actually the only CSRF risk,
		// so there's no problem setting CORS
		// if they send it directly
		if (ActionContext.parseURLRequest(this.request).sid?.length) {
			this.setHeader('Access-Control-Allow-Origin', '*');
		}

		try {
			this.user = await this.session.getUser();
			const result = await handler.call(this, body);

			if (result === null) return {code: 404};

			return result;
		} catch (e: any) {
			if (e instanceof ActionError) {
				return {actionerror: e.message};
			}

			for (const k of ['pass', 'password']) delete body[k];
			Server.crashlog(e, 'an API request', body);
			if (Config.devmode && Config.devmode === body.devmode) {
				throw new ActionError(e.stack + '\n' + JSON.stringify(body), 200);
			} else {
				throw new ActionError("Internal Server Error", 500);
			}
		}
	}
	static async getRequestBody(req: http.IncomingMessage) {
		let body = '';
		for await (const data of req) body += data;
		return body;
	}
	static sanitizeBody(body: any): ActionRequest {
		if (typeof body === 'string') return {act: body};
		if (typeof body !== 'object') throw new ActionError("Body must be an object or string", 400);
		if (!('act' in body)) body.act = ''; // we'll let the action handler throw the error
		for (const k in body) {
			body[k] = '' + body[k];
		}
		return body as ActionRequest;
	}
	static async getBody(req: http.IncomingMessage): Promise<ActionRequest | ActionRequest[]> {
		let result: {[k: string]: any} = this.parseURLRequest(req);

		let json;
		const bodyData = await this.getRequestBody(req);
		if (bodyData) {
			try {
				if (bodyData.startsWith('[') || bodyData.startsWith('{')) {
					json = bodyData;
				} else {
					Object.assign(result, Object.fromEntries(new URLSearchParams(bodyData)));
				}
			} catch {}
		}

		if (result.act === 'json' || !result.act) {
			json = result.json;
			result.act = '';
			delete result.json;
		}
		try {
			const jsonResult = JSON.parse(json);
			if (Array.isArray(jsonResult)) {
				return jsonResult.map(body => this.sanitizeBody({...result, ...body}));
			} else {
				result = Object.assign(result, jsonResult);
			}
		} catch {}
		return this.sanitizeBody(result);
	}
	static parseURLRequest(req: http.IncomingMessage) {
		if (!req.url) return {};
		const [pathname, params] = req.url.split('?');
		const actPart = pathname.split('/api/')[1];
		const act = actPart?.split('/')[0];
		const result = params ? Object.fromEntries(new URLSearchParams(params)) : {};
		if (act) result.act = act;
		return result;
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
	getServer(requireToken?: boolean) {
		return SimServers.getServer(this, requireToken);
	}
	async requireServer() {
		const server = await this.getServer(true);
		if (!server) {
			throw new ActionError(
				`This API can only be used by a registered server. Your IP (${this.getIp()}) is unrecognized. ` +
				`If your server is registered, you may need to set up token authentication.`
			);
		}
		return server;
	}
	async requireMainServer(mainServerId = Config.mainserver) {
		const server = await this.requireServer();
		if (!mainServerId) throw new ActionError(`Main server misconfigured`, 500);
		if (server.id !== mainServerId) throw new ActionError(`This API can only be used by the main server.`);
		return server;
	}
}

export const SimServers = new class SimServersT {
	servers: {[k: string]: RegisteredServer} = this.loadServers();
	hostCache = new Map<string, string>();
	constructor() {
		fs.watchFile(Config.serverlist, (curr, prev) => {
			if (curr.mtime > prev.mtime) {
				this.loadServers();
			}
		});
	}

	async getHost(server: string) {
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
	async getServer(context: ActionContext, requireToken = false): Promise<RegisteredServer | null> {
		const serverid = toID(context.body.serverid);
		const server = this.servers[serverid];
		if (!server) return null;

		const ip = context.getIp();
		if (!server.skipipcheck && !server.token && serverid !== Config.mainserver) {
			if (!server.ipcache) {
				server.ipcache = await this.getHost(server.server);
			}
			if (ip !== server.ipcache) return null;
		}
		if (server.token && requireToken) {
			if (server.token !== md5(context.body.servertoken || '')) {
				throw new ActionError(`Invalid servertoken sent for requested serverid.`);
			}
		}
		return server;
	}
	loadServers(path = Config.serverlist): {[k: string]: RegisteredServer} {
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
};

export class Server {
	server: http.Server;
	httpsServer: https.Server | null;
	port: number;
	awaitingEnd?: () => void;
	closing?: Promise<void>;
	activeRequests = 0;
	constructor(port = (Config.port || 8000)) {
		this.port = port;

		this.server = http.createServer((req, res) => void this.handle(req, res));
		this.server.listen(port);
		this.httpsServer = null;
		if (Config.ssl) {
			this.httpsServer = https.createServer(Config.ssl, (req, res) => void this.handle(req, res));
			this.httpsServer.listen(Config.ssl.port || 8043);
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
		this.activeRequests++;
		res.setHeader('Content-Type', 'text/plain; charset=utf-8');

		try {
			const body = await ActionContext.getBody(req);
			let result;
			if (Array.isArray(body)) {
				let context = new ActionContext(req, res, body[0]);

				if (body.length > 20) {
					if (!await context.getServer(true)) {
						throw new ActionError(`Only registered servers can send >20 requests at once.`, 403);
					}
				}

				result = [];
				for (const curBody of body) {
					if (context.body !== curBody) context = new ActionContext(req, res, curBody);
					result.push(await context.executeActions());
				}
			} else {
				const context = new ActionContext(req, res, body);
				// turn undefined into null so it can be JSON stringified
				result = await context.executeActions() ?? null;
			}
			this.ensureHeaders(res);
			res.writeHead(200).end(Server.stringify(result));
		} catch (e) {
			this.ensureHeaders(res);
			if (e instanceof ActionError) {
				if (e.httpStatus) {
					res.writeHead(e.httpStatus).end('Error: ' + e.message);
				} else {
					res.writeHead(200).end(Server.stringify({actionerror: e.message}));
				}
			} else {
				Server.crashlog(e);
				res.writeHead(500).end("Internal Server Error");
			}
		}

		this.activeRequests--;
		if (!this.activeRequests) this.awaitingEnd?.();
	}
	ensureHeaders(res: http.ServerResponse) {
		if (this.awaitingEnd) res.setHeader('Connection', 'close');
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
