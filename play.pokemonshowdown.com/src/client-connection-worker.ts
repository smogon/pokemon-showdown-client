declare const SockJS: any;
import type { ServerInfo } from "./client-main";

const KEEPALIVE_INTERVAL = 25000;
const KEEPALIVE_RANGE = 20000;
const RECONNECT_CAP = 60000;
const PING_RESPONSE = '|queryresponse|ping|';

let socket: WebSocket | null = null;
let serverInfo: ServerInfo;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let reconnectDelay = 1000;
let shouldReconnect = true;
let lastReceiveTime = Date.now();
let queue: string[] = [];

self.onmessage = (event: MessageEvent) => {
	const { type, server, data } = event.data;
	if (type === 'connect') {
		serverInfo = server;
		shouldReconnect = true;
		reconnectDelay = 1000;
		connectToServer();
	} else if (type === 'send') {
		if (socket?.readyState === WebSocket.OPEN) {
			socket.send(data);
		} else {
			queue.push(data);
		}
	} else if (type === 'disconnect') {
		shouldReconnect = false;
		if (reconnectTimeout) clearTimeout(reconnectTimeout);
		reconnectTimeout = null;
		if (socket) socket.close();
		socket = null;
	}
};

/**
 * Some internet connections will drop connections with zero activity.
 * SockJS handles this by sending heartbeat pings, but since we're doing
 * raw WebSocket we have to send the heartbeats ourselves.
 *
 * This also lets us detect zombie connections.
 *
 * We only ping when the connection has actually gone quiet - any real
 * traffic (e.g. an active chatroom) keeps it alive on its own.
 *
 * This timer lives in the worker because worker timers aren't throttled
 * in background tabs the way main-thread timers are.
 */
setInterval(() => {
	if (socket?.readyState !== WebSocket.OPEN) return;
	if (Date.now() - lastReceiveTime > 3 * KEEPALIVE_INTERVAL) {
		socket.close(); // zombie connection
		return;
	}
	if (Date.now() - lastReceiveTime >= KEEPALIVE_RANGE) {
		socket.send('|/cmd ping');
	}
}, KEEPALIVE_INTERVAL);

function connectToServer() {
	if (!serverInfo) return;
	if (socket) return; // already connected or connecting

	const port = serverInfo.protocol === 'https' ? '' : `:${serverInfo.port}`;
	const url = `${serverInfo.protocol}://${serverInfo.host}${port}${serverInfo.prefix}`;

	try {
		socket = new WebSocket(url.replace('http', 'ws') + '/websocket');
	} catch {
		socket = new SockJS(url, [], { timeout: 5 * 60 * 1000 });
	}
	if (socket) {
		socket.onopen = () => {
			reconnectDelay = 1000;
			lastReceiveTime = Date.now();
			postMessage({ type: 'connected' });
			for (const msg of queue) socket?.send(msg);
			queue = [];
		};

		socket.onmessage = (e: MessageEvent) => {
			lastReceiveTime = Date.now();
			if (e.data.startsWith(PING_RESPONSE)) return;
			postMessage({ type: 'message', data: e.data });
		};

		socket.onclose = () => {
			socket = null;
			postMessage({ type: 'disconnected' });
			scheduleReconnect();
		};

		socket.onerror = () => {
			// if the connection actually died, onclose will fire and handle it
			socket?.close();
		};
		return;
	}
	return postMessage({ type: 'error' });
}

function scheduleReconnect() {
	if (!shouldReconnect || reconnectTimeout) return;
	postMessage({ type: 'retrying', data: Date.now() + reconnectDelay });
	reconnectTimeout = setTimeout(() => {
		reconnectTimeout = null;
		reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_CAP);
		if (shouldReconnect) connectToServer();
	}, reconnectDelay);
}
