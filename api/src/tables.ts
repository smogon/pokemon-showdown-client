/**
 * Login server database tables
 */
import {Database, DatabaseTable} from './database';
import {Config} from './config-loader';

import type {LadderEntry} from './ladder';
import type {PreparedReplay, ReplayData} from './replays';
import type {UserInfo} from './user';

// direct access
export const psdb = new Database(Config.mysql);
export const replaysDB = Config.replaysdb ? new Database(Config.replaysdb!) : psdb;
export const ladderDB = Config.ladderdb ? new Database(Config.ladderdb!) : psdb;

export const users = new DatabaseTable<UserInfo>(psdb, 'users', 'userid');

export const ladder = new DatabaseTable<LadderEntry>(
	ladderDB, 'ladder', 'entryid',
);

export const prepreplays = new DatabaseTable<PreparedReplay>(
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
