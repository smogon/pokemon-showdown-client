/**********************************************************************
 * Net
 *********************************************************************/

export interface PostData {
	[key: string]: string | number | undefined;
}
export interface NetRequestOptions {
	method?: 'GET' | 'POST';
	body?: string | PostData;
	query?: PostData;
}
export class HttpError extends Error {
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
export class NetRequest {
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
	return new NetRequest(uri);
}

Net.encodeQuery = function (data: string | PostData) {
	if (typeof data === 'string') return data;
	let urlencodedData = '';
	for (const key in data) {
		if ((data as any)[key] === undefined) continue;
		if (urlencodedData) urlencodedData += '&';
		urlencodedData += encodeURIComponent(key) + '=' + encodeURIComponent((data as any)[key]);
	}
	return urlencodedData;
};
Net.decodeQuery = function (query: string): {[key: string]: string} {
	let out: {[key: string]: string} = {};
	const questionIndex = query.indexOf('?');
	if (questionIndex >= 0) query = query.slice(questionIndex + 1);
	for (const queryPart of query.split('&')) {
		const [key, value] = queryPart.split('=');
		out[decodeURIComponent(key)] = decodeURIComponent(value || '');
	}
	return out;
};

/**********************************************************************
 * Models
 *********************************************************************/

export class PSSubscription {
	observable: PSModel | PSStreamModel<any>;
	listener: (value?: any) => void;
	constructor(observable: PSModel | PSStreamModel<any>, listener: (value?: any) => void) {
		this.observable = observable;
		this.listener = listener;
	}
	unsubscribe() {
		const index = this.observable.subscriptions.indexOf(this);
		if (index >= 0) this.observable.subscriptions.splice(index, 1);
	}
}

/**
 * PS Models roughly implement the Observable spec. Not the entire
 * spec - just the parts we use. PSModel just notifies subscribers of
 * updates - a simple model for React.
 */
export class PSModel {
	subscriptions = [] as PSSubscription[];
	subscribe(listener: () => void) {
		const subscription = new PSSubscription(this, listener);
		this.subscriptions.push(subscription);
		return subscription;
	}
	subscribeAndRun(listener: () => void) {
		const subscription = this.subscribe(listener);
		subscription.listener();
		return subscription;
	}
	update() {
		for (const subscription of this.subscriptions) {
			subscription.listener();
		}
	}
}

/**
 * PS Models roughly implement the Observable spec. PSStreamModel
 * streams some data out. This is very not-React, which generally
 * expects the DOM to be a pure function of state. Instead PSModels
 * which hold state, PSStreamModels give state directly to views,
 * so that the model doesn't need to hold a redundant copy of state.
 */
export class PSStreamModel<T = string> {
	subscriptions = [] as PSSubscription[];
	updates = [] as T[];
	subscribe(listener: (value: T) => void) {
		// TypeScript bug
		const subscription: PSSubscription = new PSSubscription(this, listener);
		this.subscriptions.push(subscription);
		if (this.updates.length) {
			for (const update of this.updates) {
				subscription.listener(update);
			}
			this.updates = [];
		}
		return subscription;
	}
	subscribeAndRun(listener: (value: T) => void) {
		const subscription = this.subscribe(listener);
		subscription.listener(null);
		return subscription;
	}
	update(value: T) {
		if (!this.subscriptions.length) {
			// save updates for later
			this.updates.push(value);
		}
		for (const subscription of this.subscriptions) {
			subscription.listener(value);
		}
	}
}
