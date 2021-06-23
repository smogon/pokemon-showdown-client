/**
 * Classes for interfacing with specific database tables.
 * Original design by Zarel in https://github.com/Zarel/telepic/blob/master/server/db.ts, redone by Mia
 * @author mia-pi-git
 */
import {Config} from './config-loader';
import {DatabaseTable} from './database';

import type {LadderEntry} from './ladder';
import type {PreparedReplay, ReplayData} from './replays';
import type {UserInfo} from './user';

export const users = new DatabaseTable<UserInfo>('ntbb_users', 'userid');

export const ladder = new DatabaseTable<LadderEntry>(
	'ntbb_ladder', 'entryid', Config.ladderdb
);

export const prepreplays = new DatabaseTable<PreparedReplay>(
	'ps_prepreplays', 'id', Config.replaysdb
);

export const replays = new DatabaseTable<ReplayData>(
	'ps_replays', 'id', Config.replaysdb
);

export const sessions = new DatabaseTable<{
	session: number;
	sid: string;
	userid: string;
	time: number;
	timeout: number;
	ip: string;
}>('ntbb_sessions', 'session');

export const userstats = new DatabaseTable<{
	id: number;
	serverid: string;
	usercount: number;
	date: number;
}>('ntbb_userstats', 'id');

export const loginthrottle = new DatabaseTable<{
	ip: string;
	count: number;
	time: number;
	lastuserid: string;
}>('ntbb_loginthrottle', 'ip');

export const usermodlog = new DatabaseTable<{
	entryid: number;
	userid: string;
	actorid: string;
	date: number;
	ip: string;
	entry: string;
}>('ntbb_usermodlog', 'entryid');

export const userstatshistory = new DatabaseTable<{
	id: number;
	date: number;
	usercount: number;
	programid: 'showdown' | 'po';
}>('ntbb_userstatshistory', 'id');
