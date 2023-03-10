/**
 * Wrapper around the current user.
 * Mostly handles accessing the data for the user in `ntbb_users`, etc.
 * By Mia.
 * @author mia-pi-git
 */

import type {LadderEntry} from './ladder';
import {toID} from './server';

export class User {
	name = 'Guest';
	id = 'guest';
	loggedin = false;
	rating: LadderEntry | null = null;
	ratings: LadderEntry[] = [];
	constructor(name?: string) {
		if (name) this.setName(name);
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
		this.setName('Guest');
		this.loggedin = false;
	}
}
