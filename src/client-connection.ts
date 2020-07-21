/**
 * Connection library
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 */

declare var SockJS: any;

class PSConnection {
	socket: any = null;
	connected = false;
	queue = [] as string[];
	constructor() {
		this.connect();
	}
	connect() {
		const server = PS.server;
		const port = server.protocol === 'https' ? '' : ':' + server.port;
		const url = server.protocol + '://' + server.host + port + server.prefix;
		const socket = this.socket = new SockJS(url, [], {timeout: 5 * 60 * 1000});
		socket.onopen = () => {
			console.log('\u2705 (CONNECTED)');
			this.connected = true;
			PS.connected = true;
			for (const msg of this.queue) socket.send(msg);
			this.queue = [];
			PS.update();
		};
		socket.onmessage = (e: MessageEvent) => {
			PS.receive('' + e.data);
		};
		socket.onclose = () => {
			console.log('\u2705 (DISCONNECTED)');
			this.connected = false;
			PS.connected = false;
			PS.isOffline = true;
			for (const roomid in PS.rooms) {
				PS.rooms[roomid]!.connected = false;
			}
			this.socket = null;
			PS.update();
		};
	}
	send(msg: string) {
		if (!this.connected) {
			this.queue.push(msg);
			return;
		}
		this.socket.send(msg);
	}
}

PS.connection = new PSConnection();

const PSLoginServer = new class {
	query(data: {}, callback: (res: {[k: string]: any} | null) => void) {
		let url = '/~~' + PS.server.id + '/action.php';
		if (location.pathname.endsWith('.html')) {
			url = 'https://' + Config.routes.client + url;
			// @ts-ignore
			if (typeof POKEMON_SHOWDOWN_TESTCLIENT_KEY === 'string') {
				// @ts-ignore
				data.sid = POKEMON_SHOWDOWN_TESTCLIENT_KEY.replace(/\%2C/g, ',');
			}
		}
		this.request(url, data, res => {
			if (!res) callback(null);
			else callback(JSON.parse(res.slice(1)));
		});
	}
	request(url: string, data: {} | null, callback: (res: string | null) => void) {
		const xhr = new XMLHttpRequest();
		xhr.open(data ? 'POST' : 'GET', url);
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				try {
					callback(xhr.responseText || null);
				} catch {
					callback(null);
				}
			}
		};
		if (data) {
			let urlencodedData = '';
			for (const key in data) {
				if (urlencodedData) urlencodedData += '&';
				urlencodedData += encodeURIComponent(key) + '=' + encodeURIComponent((data as any)[key]);
			}
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xhr.send(urlencodedData);
		} else {
			xhr.send();
		}
	}
};
