/**
 * Wrapper around the current user.
 * Mostly handles accessing the data for the user in `ntbb_users`, etc.
 * By Mia.
 * @author mia-pi-git
 */

import type {Dispatcher} from './dispatcher';
import type {LadderEntry} from './ladder';
import {toID} from './server';
import type {Session} from './session';
import {users} from './tables';

export interface UserInfo {
	userid: string;
	usernum: number;
	username: string;
	nonce: string | null;
	passwordhash: string | null;
	email: string | null;
	registertime: number;
	group: number;
	banstate: number;
	ip: string;
	avatar: number;
	logintime: number;
	loginip: string | null;
}

export class User {
	name = 'Guest';
	id = 'guest';
	dispatcher: Dispatcher;
	session: Session;
	loggedin = false;
	rating: LadderEntry | null = null;
	ratings: LadderEntry[] = [];
	constructor(name: string, session: Session) {
		this.name = name;
		this.dispatcher = session.dispatcher;
		this.session = session;
	}
	async getData() {
		if (this.id === 'guest') return User.getUserDefaults();
		const data = await users.selectOne('*', 'userid = ?', [this.id]);
		return data || User.getUserDefaults();
	}
	setName(name: string) {
		this.name = name;
		this.id = toID(name);
	}
	login(name: string) {
		this.setName(name);
		this.loggedin = true;
		return this;
	}
	logout() {
		this.setName('guest');
		this.loggedin = false;
	}
	static getUserDefaults(): UserInfo {
		return {
			username: 'Guest',
			userid: 'guest',
			group: 0,
			passwordhash: '',
			email: null,
			nonce: null,
			usernum: 0,
			registertime: 0,
			banstate: 0,
			ip: '',
			logintime: Date.now(),
			loginip: '',
			avatar: 0,
		};
	}
	toString() {
		return this.id;
	}
}
