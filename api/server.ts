/**
 * HTTP server routing.
 * By Mia.
 * @author mia-pi-git
 */
import {Config} from './config-loader';
import {Dispatcher} from './dispatcher';
import * as http from 'http';
import * as https from 'https';

const DISPATCH_PREFIX = ']';

export function toID(text: any): string {
	if (text?.id) {
		text = text.id;
	} else if (text?.userid) {
		text = text.userid;
	} else if (text?.roomid) {
		text = text.roomid;
	}
	if (typeof text !== 'string' && typeof text !== 'number') return '';
	return ('' + text).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export class Router {
	server: http.Server;
	port: number;
	awaitingEnd?: () => void;
	activeRequests = 0;
	constructor(port = (Config.port || 8000)) {
		this.port = port;
		const handle = (
			req: http.IncomingMessage, res: http.ServerResponse
		) => void this.handle(req, res);

		this.server = Config.ssl ?
			https.createServer(Config.ssl, handle) :
			http.createServer(handle);

		this.server.listen(port);
	}
	async handle(req: http.IncomingMessage, res: http.ServerResponse) {
		const dispatcher = new Dispatcher(req, res);
		this.activeRequests++;
		try {
			const result = await dispatcher.executeActions();
			this.activeRequests--;
			if (!this.activeRequests && this.awaitingEnd) this.awaitingEnd();
			if (result === null) {
				// didn't make a request to action.php or /api/ - custom response here
				// supports delegation to apache
				if (Config.customhttpend) return Config.customhttpend.call(this, req, res, dispatcher);
				return res.end('Not found.');
			}
			res.end(Router.stringify(result));
		} catch (e) {
			this.activeRequests--;
			if (!this.activeRequests && this.awaitingEnd) this.awaitingEnd();
			if (e.name?.endsWith('ActionError')) {
				return res.end(Router.stringify({actionerror: e.message}));
			}
			res.end("Not found.");
			throw e;
		}
	}
	async close() {
		this.server.close();
		return new Promise<void>(resolve => {
			this.awaitingEnd = resolve;
		});
	}
	static stringify(response: {[k: string]: any}) {
		return DISPATCH_PREFIX + JSON.stringify(response);
	}
}
