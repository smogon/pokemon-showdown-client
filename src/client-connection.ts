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
		// this.connect();
	}
	connect() {
		const server = PS.server;
		const port = server.protocol === 'https' ? '' : ':' + server.port;
		const url = server.protocol + '://' + server.host + port + server.prefix;
		const socket = this.socket = new SockJS(url);
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
			PS.connected = false;
			this.connected = false;
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
