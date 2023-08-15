/**
 * Login server database tables
 */
import {Database, DatabaseTable} from './database';
import {Config} from './config-loader';

import type {LadderEntry} from './ladder';
import type {ReplayData} from './replays';

// direct access
export const psdb = new Database(Config.mysql);
export const replaysDB = Config.replaysdb ? new Database(Config.replaysdb!) : psdb;
export const ladderDB = Config.ladderdb ? new Database(Config.ladderdb!) : psdb;

export const users = new DatabaseTable<{
	userid: string;
	usernum: number;
	username: string;
	nonce: string | null;
	passwordhash: string | null;
	email: string | null;
	registertime: number;
	/**
	 * 0 = unregistered (should never be in db)
	 * 1 = regular user
	 * 2 = admin
	 * 3...6 = PS-specific ranks (voice, driver, mod, leader)
	 */
	group: number;
	banstate: number;
	ip: string;
	avatar: number;
	logintime: number;
	loginip: string | null;
}>(psdb, 'users', 'userid');

export const ladder = new DatabaseTable<LadderEntry>(
	ladderDB, 'ladder', 'entryid',
);

export const prepreplays = new DatabaseTable<{
	id: string;
	p1: string;
	p2: string;
	format: string;
	/**
	 * 0 = public
	 * 1 = private (with password)
	 * 2 = private (no password; used for punishment logging)
	 * 3 = NOT USED; only used in the full replay table
	 */
	private: 0 | 1 | 2;
	loghash: string;
	inputlog: string;
	rating: number;
	uploadtime: number;
}>(
	replaysDB, 'prepreplays', 'id',
);

export const replays = new DatabaseTable<ReplayData>(
	replaysDB, 'replays', 'id',
);

export const sessions = new DatabaseTable<{
	session: number;
	sid: string;
	userid: string;
	time: number;
	timeout: number;
	ip: string;
}>(psdb, 'sessions', 'session');

export const userstats = new DatabaseTable<{
	id: number;
	serverid: string;
	usercount: number;
	date: number;
}>(psdb, 'userstats', 'id');

export const loginthrottle = new DatabaseTable<{
	ip: string;
	count: number;
	time: number;
	lastuserid: string;
}>(psdb, 'loginthrottle', 'ip');

export const usermodlog = new DatabaseTable<{
	entryid: number;
	userid: string;
	actorid: string;
	date: number;
	ip: string;
	entry: string;
}>(psdb, 'usermodlog', 'entryid');

export const userstatshistory = new DatabaseTable<{
	id: number;
	date: number;
	usercount: number;
	programid: 'showdown' | 'po';
}>(psdb, 'userstatshistory', 'id');

// oauth stuff

export const oauthClients = new DatabaseTable<{
	owner: string; // ps username
	client_title: string;
	id: string; // hex hash
	origin_url: string;
}>(psdb, 'oauth_clients', 'id');

export const oauthTokens = new DatabaseTable<{
	owner: string;
	client: string; // id of client
	id: string;
	time: number;
}>(psdb, 'oauth_tokens', 'id');
