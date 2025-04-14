/**********************************************************************
 * Net
 *********************************************************************/
/** @jsx preact.h */
/** @jsxFrag preact.Fragment */
import preact from "../../play.pokemonshowdown.com/js/lib/preact";
import { Dex } from "../../play.pokemonshowdown.com/src/battle-dex";

declare const toID: (str: any) => string;

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
	if (uri.startsWith('/') && !uri.startsWith('//') && Net.defaultRoute) uri = Net.defaultRoute + uri;
	if (uri.startsWith('//') && document.location.protocol === 'file:') uri = 'https:' + uri;
	return new NetRequest(uri);
}

/** Prepends URLs starting with `/` with this string. Used by testclient. */
Net.defaultRoute = '';

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
Net.decodeQuery = function (query: string): { [key: string]: string } {
	let out: { [key: string]: string } = {};
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

export class PSIcon extends preact.Component<{
	pokemon?: string, item?: string, type?: string, category?: string, hideAlt?: boolean,
}> {
	render() {
		if (this.props.pokemon) {
			return <span
				class="picon"
				style={{ background: Dex.getPokemonIcon(this.props.pokemon).replace('background:', '') }}
			></span>;
		} else if (this.props.item) {
			return <span
				className="itemicon"
				style={{ background: Dex.getItemIcon(this.props.item).replace('background:', '') }}
			></span>;
		} else if (this.props.type) {
			let type = Dex.types.get(this.props.type).name;
			if (!type) type = '???';
			let sanitizedType = type.replace(/\?/g, '%3f');
			return <img
				src={`${Dex.resourcePrefix}sprites/types/${sanitizedType}.png`}
				alt={this.props.hideAlt ? undefined : type}
				height="14"
				width="32"
				class="pixelated"
			/>;
		} else if (this.props.category) {
			const categoryID = toID(this.props.category);
			let sanitizedCategory = '';
			switch (categoryID) {
			case 'physical':
			case 'special':
			case 'status':
				sanitizedCategory = categoryID.charAt(0).toUpperCase() + categoryID.slice(1);
				break;
			default:
				sanitizedCategory = 'undefined';
				break;
			}
			return <img
				src={`${Dex.resourcePrefix}sprites/categories/${sanitizedCategory}.png`}
				alt={this.props.hideAlt ? undefined : sanitizedCategory}
				height="14"
				width="32"
				class="pixelated"
			/>;
		} else {
			return <span></span>;
		}
	}
}

export type ServerTeam = {
	teamid: string,
	format: string,
	private: string,
	team: string,
	name?: string,
	title?: string,
};

export function unpackTeam(buf: string) {
	if (!buf) return [];

	let team: Dex.PokemonSet[] = [];

	for (const setBuf of buf.split(`]`)) {
		const parts = setBuf.split(`|`);
		if (parts.length < 11) continue;
		let set: Dex.PokemonSet = { species: '', moves: [] };
		team.push(set);

		// name
		set.name = parts[0];

		// species
		set.species = Dex.species.get(parts[1]).name || set.name;

		// item
		set.item = Dex.items.get(parts[2]).name;

		// ability
		const species = Dex.species.get(set.species);
		set.ability =
			parts[3] === '-' ? '' :
			(species.baseSpecies === 'Zygarde' && parts[3] === 'H') ? 'Power Construct' :
			['', '0', '1', 'H', 'S'].includes(parts[3]) ?
				species.abilities[parts[3] as '0' || '0'] || (parts[3] === '' ? '' : '!!!ERROR!!!') :
				Dex.abilities.get(parts[3]).name;

		// moves
		set.moves = parts[4].split(',').map(moveid =>
			Dex.moves.get(moveid).name
		);

		// nature
		set.nature = parts[5] as Dex.NatureName;
		if (set.nature as any === 'undefined') set.nature = undefined;

		// evs
		if (parts[6]) {
			if (parts[6].length > 5) {
				const evs = parts[6].split(',');
				set.evs = {
					hp: Number(evs[0]) || 0,
					atk: Number(evs[1]) || 0,
					def: Number(evs[2]) || 0,
					spa: Number(evs[3]) || 0,
					spd: Number(evs[4]) || 0,
					spe: Number(evs[5]) || 0,
				};
			} else if (parts[6] === '0') {
				set.evs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
			}
		}

		// gender
		if (parts[7]) set.gender = parts[7];

		// ivs
		if (parts[8]) {
			const ivs = parts[8].split(',');
			set.ivs = {
				hp: ivs[0] === '' ? 31 : Number(ivs[0]),
				atk: ivs[1] === '' ? 31 : Number(ivs[1]),
				def: ivs[2] === '' ? 31 : Number(ivs[2]),
				spa: ivs[3] === '' ? 31 : Number(ivs[3]),
				spd: ivs[4] === '' ? 31 : Number(ivs[4]),
				spe: ivs[5] === '' ? 31 : Number(ivs[5]),
			};
		}

		// shiny
		if (parts[9]) set.shiny = true;

		// level
		if (parts[10]) set.level = parseInt(parts[9], 10);

		// happiness
		if (parts[11]) {
			let misc = parts[11].split(',', 4);
			set.happiness = (misc[0] ? Number(misc[0]) : undefined);
			set.hpType = misc[1];
			set.pokeball = misc[2];
			set.gigantamax = !!misc[3];
			set.dynamaxLevel = (misc[4] ? Number(misc[4]) : 10);
			set.teraType = misc[5];
		}
	}

	return team;
}

export class MiniTeam extends preact.Component<{ team: ServerTeam, fullTeam?: boolean }> {
	render() {
		const team = this.props.team;
		return <>
			<a
				class="team"
				style={{ color: 'black', textDecoration: 'none' }}
				href={`/view/${team.teamid}${team.private ? `-${team.private}` : ''}`}
			>
				<strong>
					{team.name || team.title || "Untitled " + team.teamid}
					{team.private ? <> <i class="fa fa-lock"></i></> : <></>}
				</strong>
				<br />
				<small>
					{(this.props.fullTeam ?
						unpackTeam(team.team).map(x => x.species) :
						team.team.split(',')
					).map(x => <PSIcon pokemon={x} />) || <em>(Empty team)</em>}
				</small>
			</a>
		</>;
	}
}
