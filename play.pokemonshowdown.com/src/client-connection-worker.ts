declare const SockJS: any;
import type { ServerInfo } from "./client-main";

let socket: WebSocket | null = null;
let serverInfo: ServerInfo;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let queue: string[] = [];

self.onmessage = (event: MessageEvent) => {
	const { type, server, data } = event.data;
	if (type === 'connect') {
		serverInfo = server;
		connectToServer();
	} else if (type === 'send') {
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send(data);
		} else {
			queue.push(data);
		}
	} else if (type === 'disconnect') {
		if (socket) socket.close();
		if (reconnectTimeout) clearTimeout(reconnectTimeout);
		socket = null;
	}
};

function connectToServer() {
	if (!serverInfo) return;

	const port = serverInfo.protocol === 'https' ? '' : ':' + serverInfo.port;
	const url = serverInfo.protocol + '://' + serverInfo.host + port + serverInfo.prefix;

	try {
		socket = new SockJS(url, [], { timeout: 5 * 60 * 1000 });
	} catch {
		socket = new WebSocket(url.replace('http', 'ws') + '/websocket');
	}
	if (socket) {
		socket.onopen = () => {
			postMessage({ type: 'connected' });
			for (const msg of queue) socket?.send(msg);
			queue = [];
		};

		socket.onmessage = (e: MessageEvent) => {
			postMessage({ type: 'message', data: e.data });
		};

		socket.onclose = () => {
			postMessage({ type: 'disconnected' });
			// scheduleReconnect();
		};

		socket.onerror = () => {
			postMessage({ type: 'error' });
			socket?.close();
		};
		return;
	}
	return postMessage({ type: 'error' });
}
