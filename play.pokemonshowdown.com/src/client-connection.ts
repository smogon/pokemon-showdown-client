/**
 * Connection library
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 */

import { PS } from "./client-main";

declare const SockJS: any;
declare const POKEMON_SHOWDOWN_TESTCLIENT_KEY: string | undefined;

export class PSConnection {
	socket: any = null;
	connected = false;
	queue: string[] = [];
	private reconnectDelay = 1000;
	private reconnectCap = 15000;
	private shouldReconnect = true;
	private worker: Worker | null = null;

	constructor() {
		const loading = PSStorage.init();
		if (loading) {
			loading.then(() => {
				this.initConnection();
			});
		} else {
			this.initConnection();
		}
	}

	initConnection() {
		const workerConnected = this.tryConnectInWorker();
		if (!workerConnected) {
			this.connect();
		}
	}

	tryConnectInWorker(): boolean {
		try {
			const worker = new Worker('/js/reconnect-worker.js');
			this.worker = worker;

			worker.postMessage({ type: 'connect', server: PS.server });

			worker.onmessage = event => {
				const { type, data } = event.data;
				switch (type) {
				case 'connected':
					console.log('\u2705 (CONNECTED via worker)');
					this.connected = true;
					PS.connected = true;
					this.queue.forEach(msg => worker.postMessage({ type: 'send', data: msg }));
					this.queue = [];
					PS.update();
					break;
				case 'message':
					PS.receive(data);
					break;
				case 'disconnected':
					this.handleDisconnect();
					if (this.shouldReconnect) this.retryConnection();
					break;
				case 'error':
					console.warn('Worker connection error');
					this.worker = null;
					this.connect(); // fallback
					break;
				}
			};

			worker.onerror = (e: ErrorEvent) => {
				console.warn('Worker connection error:', e);
				this.worker = null;
				this.connect(); // fallback
			};

			return true;
		} catch {
			console.warn('Worker connection failed, falling back to regular connection.');
			this.worker = null;
			return false;
		}
	}

	connect() {
		this.worker = null; // ensure worker isn't used. we can keep
		const server = PS.server;
		const port = server.protocol === 'https' ? ':' + server.port : ':' + server.httpport;
		const url = server.protocol + '://' + server.host + port + server.prefix;

		try {
			this.socket = new SockJS(url, [], { timeout: 5 * 60 * 1000 });
		} catch {
			this.socket = new WebSocket(url.replace('http', 'ws') + '/websocket');
		}

		const socket = this.socket;

		socket.onopen = () => {
			console.log('\u2705 (CONNECTED)');
			this.connected = true;
			PS.connected = true;
			this.reconnectDelay = 1000;
			this.queue.forEach(msg => socket.send(msg));
			this.queue = [];
			PS.update();
		};

		socket.onmessage = (e: MessageEvent) => {
			PS.receive('' + e.data);
		};

		socket.onclose = () => {
			console.log('\u274C (DISCONNECTED)');
			this.handleDisconnect();
			if (this.shouldReconnect) this.retryConnection();
		};

		socket.onerror = () => {
			PS.connected = false;
			PS.isOffline = true;
			PS.alert("Connection error.");
			if (this.shouldReconnect) this.retryConnection();
		};
	}

	private handleDisconnect() {
		this.connected = false;
		PS.connected = false;
		PS.isOffline = true;
		this.socket = null;
		for (const roomid in PS.rooms) {
			const room = PS.rooms[roomid]!;
			room.previouslyConnected ||= room.connected;
			room.connected = false;
		}
		PS.update();
	}

	private retryConnection() {
		console.log(`Reconnecting in ${this.reconnectDelay / 1000}s...`);
		PS.room.add(`||You are disconnected. Attempting to reconnect in ${this.reconnectDelay / 1000}s`);
		setTimeout(() => {
			if (!this.connected && this.shouldReconnect) {
				PSConnection.connect(); // or PS.send('/reconnect') ?
				this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.reconnectCap);
			}
		}, this.reconnectDelay);
	}

	disconnect() {
		this.shouldReconnect = false;
		this.socket?.close();
		this.worker?.terminate();
		this.worker = null;
		PS.connection = null;
		PS.connected = false;
		PS.isOffline = true;
	}

	reconnectTest() {
		this.socket?.close();
		this.worker?.postMessage({ type: 'disconnect' });
		this.worker = null;
		PS.connected = false;
		PS.isOffline = true;
	}

	send(msg: string) {
		if (!this.connected) {
			this.queue.push(msg);
			return;
		}
		if (this.worker) {
			this.worker.postMessage({ type: 'send', data: msg });
		} else if (this.socket) {
			this.socket.send(msg);
		}
	}

	static connect() {
		if (PS.connection?.socket) return;
		PS.isOffline = false;
		if (!PS.connection) {
			PS.connection = new PSConnection();
		} else {
			PS.connection.connect();
		}
		PS.prefs.doAutojoin();
	}
}

export class PSStorage {
	static frame: WindowProxy | null = null;
	static requests: Record<string, (data: any) => void> | null = null;
	static requestCount = 0;
	static readonly origin = 'https://' + Config.routes.client;
	static loader?: () => void;
	static loaded: Promise<void> | boolean = false;
	static init(): void | Promise<void> {
		if (this.loaded) {
			if (this.loaded === true) return;
			return this.loaded;
		}
		if (Config.testclient) {
			return;
		} else if (location.protocol + '//' + location.hostname === PSStorage.origin) {
			// Same origin, everything can be kept as default
			Config.server ||= Config.defaultserver;
			return;
		}

		// Cross-origin
		if (!('postMessage' in window)) {
			// browser does not support cross-document messaging
			PS.alert("Sorry, psim connections are unsupported by your browser.");
			return;
		}

		window.addEventListener('message', this.onMessage);

		if (document.location.hostname !== Config.routes.client) {
			const iframe = document.createElement('iframe');
			iframe.src = 'https://' + Config.routes.client + '/crossdomain.php?host=' +
				encodeURIComponent(document.location.hostname) +
				'&path=' + encodeURIComponent(document.location.pathname.substr(1)) +
				'&protocol=' + encodeURIComponent(document.location.protocol);
			iframe.style.display = 'none';
			document.body.appendChild(iframe);
		} else {
			Config.server ||= Config.defaultserver;
			$(
				'<iframe src="https://' + Config.routes.client + '/crossprotocol.html?v1.2" style="display: none;"></iframe>'
			).appendTo('body');
			setTimeout(() => {
				// HTTPS may be blocked
				// yes, this happens, blame Avast! and BitDefender and other antiviruses
				// that feel a need to MitM HTTPS poorly
			}, 2000);
		}
		this.loaded = new Promise(resolve => {
			this.loader = resolve;
		});
		return this.loaded;
	}

	static onMessage = (e: MessageEvent) => {
		if (e.origin !== PSStorage.origin) return;

		this.frame = e.source as WindowProxy;
		const data = e.data;
		// console.log(`top recv: ${data}`);
		switch (data.charAt(0)) {
		case 'c':
			Config.server = JSON.parse(data.substr(1));
			if (Config.server.registered && Config.server.id !== 'showdown' && Config.server.id !== 'smogtours') {
				const link = document.createElement('link');
				link.rel = 'stylesheet';
				link.href = '//' + Config.routes.client + '/customcss.php?server=' + encodeURIComponent(Config.server.id);
				document.head.appendChild(link);
			}
			Object.assign(PS.server, Config.server);
			break;
		case 'p':
			const newData = JSON.parse(data.substr(1));
			if (newData) PS.prefs.load(newData, true);
			PS.prefs.save = function () {
				const prefData = JSON.stringify(PS.prefs.storage);
				PSStorage.postCrossOriginMessage('P' + prefData);

				// in Safari, cross-origin local storage is apparently treated as session
				// storage, so mirror the storage in the current origin just in case
				try {
					localStorage.setItem('showdown_prefs', prefData);
				} catch {}
			};
			PS.prefs.update(null);
			break;
		case 't':
			if (window.nodewebkit) return;
			let oldTeams;
			if (PS.teams.list.length) {
				// Teams are still stored in the old location; merge them with the
				// new teams.
				oldTeams = PS.teams.list;
			}
			PS.teams.unpackAll(data.substr(1));
			PS.teams.save = function () {
				const packedTeams = PS.teams.packAll(PS.teams.list);
				PSStorage.postCrossOriginMessage('T' + packedTeams);

				// in Safari, cross-origin local storage is apparently treated as session
				// storage, so mirror the storage in the current origin just in case
				if (document.location.hostname === Config.routes.client) {
					try {
						localStorage.setItem('showdown_teams_local', packedTeams);
					} catch {}
				}
				PS.teams.update('team');
			};
			if (oldTeams) {
				PS.teams.list = PS.teams.list.concat(oldTeams);
				PS.teams.save();
				localStorage.removeItem('showdown_teams');
			}
			if (data === 'tnull' && !PS.teams.list.length) {
				PS.teams.unpackAll(localStorage.getItem('showdown_teams_local'));
			}
			break;
		case 'a':
			if (data === 'a0') {
				PS.alert("Your browser doesn't support third-party cookies. Some things might not work correctly.");
			}
			if (!window.nodewebkit) {
				// for whatever reason, Node-Webkit doesn't let us make remote
				// Ajax requests or something. Oh well, making them direct
				// isn't a problem, either.

				try {
					// I really hope this is a Chrome bug that this can fail
					PSStorage.frame!.postMessage("", PSStorage.origin);
				} catch {
					return;
				}

				PSStorage.requests = {};
			}
			PSStorage.loaded = true;
			PSStorage.loader?.();
			PSStorage.loader = undefined;
			break;
		case 'r':
			const reqData = JSON.parse(data.slice(1));
			const idx = reqData[0];
			if (PSStorage.requests![idx]) {
				PSStorage.requests![idx](reqData[1]);
				delete PSStorage.requests![idx];
			}
			break;
		}
	};
	static request(type: 'GET' | 'POST', uri: string, data: any): void | Promise<string> {
		if (!PSStorage.requests) return;
		const idx = PSStorage.requestCount++;
		return new Promise(resolve => {
			PSStorage.requests![idx] = resolve;
			PSStorage.postCrossOriginMessage((type === 'GET' ? 'R' : 'S') + JSON.stringify([uri, data, idx, 'text']));
		});
	}
	static postCrossOriginMessage = function (data: string) {
		try {
			// I really hope this is a Chrome bug that this can fail
			return PSStorage.frame!.postMessage(data, PSStorage.origin);
		} catch {
		}
		return false;
	};
};

PSConnection.connect();

export const PSLoginServer = new class {
	rawQuery(act: string, data: PostData): Promise<string | null> {
		// commenting out because for some reason this is working in Chrome????
		// if (location.protocol === 'file:') {
		// 	alert("Sorry, login server queries don't work in the testclient. To log in, see README.md to set up testclient-key.js");
		// 	return Promise.resolve(null);
		// }
		data.act = act;
		let url = '/~~' + PS.server.id + '/action.php';
		if (location.pathname.endsWith('.html')) {
			url = 'https://' + Config.routes.client + url;
			if (typeof POKEMON_SHOWDOWN_TESTCLIENT_KEY === 'string') {
				data.sid = POKEMON_SHOWDOWN_TESTCLIENT_KEY.replace(/%2C/g, ',');
			}
		}
		return PSStorage.request('POST', url, data) || Net(url).get({ method: 'POST', body: data }).then(
			res => res ?? null
		).catch(
			() => null
		);
	}
	query(act: string, data: PostData = {}): Promise<{ [k: string]: any } | null> {
		return this.rawQuery(act, data).then(
			res => res ? JSON.parse(res.slice(1)) : null
		).catch(
			() => null
		);
	}
};

interface PostData {
	[key: string]: string | number | boolean | null | undefined;
}
interface NetRequestOptions {
	method?: 'GET' | 'POST';
	body?: string | PostData;
	query?: PostData;
}
class HttpError extends Error {
	statusCode?: number;
	body: string;
	constructor(message: string, statusCode: number | undefined, body: string) {
		super(message);
		this.name = 'HttpError';
		this.statusCode = statusCode;
		this.body = body;
		try {
			(Error as any).captureStackTrace(this, HttpError);
		} catch {}
	}
}
class NetRequest {
	uri: string;
	constructor(uri: string) {
		this.uri = uri;
	}

	/**
	 * Makes a basic http/https request to the URI.
	 * Returns the response data.
	 *
	 * Will throw if the response code isn't 200 OK.
	 *
	 * @param opts request opts
	 */
	get(opts: NetRequestOptions = {}): Promise<string> {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			let uri = this.uri;
			if (opts.query) {
				uri += (uri.includes('?') ? '&' : '?') + Net.encodeQuery(opts.query);
			}
			xhr.open(opts.method || 'GET', uri);
			xhr.onreadystatechange = function () {
				const DONE = 4;
				if (xhr.readyState === DONE) {
					if (xhr.status === 200) {
						resolve(xhr.responseText || '');
						return;
					}
					const err = new HttpError(xhr.statusText || "Connection error", xhr.status, xhr.responseText);
					reject(err);
				}
			};
			if (opts.body) {
				xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				xhr.send(Net.encodeQuery(opts.body));
			} else {
				xhr.send();
			}
		});
	}

	/**
	 * Makes a http/https POST request to the given link.
	 * @param opts request opts
	 * @param body POST body
	 */
	post(opts: Omit<NetRequestOptions, 'body'>, body: PostData | string): Promise<string>;
	/**
	 * Makes a http/https POST request to the given link.
	 * @param opts request opts
	 */
	post(opts?: NetRequestOptions): Promise<string>;
	post(opts: NetRequestOptions = {}, body?: PostData | string) {
		if (!body) body = opts.body;
		return this.get({
			...opts,
			method: 'POST',
			body,
		});
	}
}

export function Net(uri: string) {
	if (uri.startsWith('/') && !uri.startsWith('//') && Net.defaultRoute) uri = Net.defaultRoute + uri;
	if (uri.startsWith('//') && document.location.protocol === 'file:') uri = 'https:' + uri;
	return new NetRequest(uri);
}

Net.defaultRoute = '';

Net.encodeQuery = function (data: string | PostData): string {
	if (typeof data === 'string') return data;
	let urlencodedData = '';
	for (const key in data) {
		if (urlencodedData) urlencodedData += '&';
		let value = data[key];
		if (value === true) value = 'on';
		if (value === false || value === null || value === undefined) value = '';
		urlencodedData += encodeURIComponent(key) + '=' + encodeURIComponent(value);
	}
	return urlencodedData;
};

Net.formData = function (form: HTMLFormElement): { [name: string]: string | boolean } {
	// not technically all `HTMLInputElement`s but who wants to cast all these?
	const elements = form.querySelectorAll<HTMLInputElement>('input[name], select[name], textarea[name]');
	const out: { [name: string]: string | boolean } = {};
	for (const element of elements) {
		if (element.type === 'checkbox') {
			out[element.name] = element.getAttribute('value') ? (
				element.checked ? element.value : ''
			) : (
				!!element.checked
			);
		} else if (element.type !== 'radio' || element.checked) {
			out[element.name] = element.value;
		}
	}
	return out;
};
