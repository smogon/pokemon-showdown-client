/**
 * Login server database tables
 */
import { MySQLDatabase, PGDatabase } from './database';
import { Config } from './config-loader';

import type { LadderEntry } from './ladder';
import type { ReplayRow } from './replays';
import type { Suspect } from './actions';

// direct access
export const psdb = new MySQLDatabase(Config.mysql);
export const pgdb = new PGDatabase(Config.postgres!);
export const replaysDB = Config.replaysdb ? new PGDatabase(Config.replaysdb) : pgdb;
export const ladderDB = Config.ladderdb ? new MySQLDatabase(Config.ladderdb!) : psdb;

export const users = psdb.getTable<{
	userid: string,
	usernum: number,
	username: string,
	nonce: string | null,
	passwordhash: string | null,
	email: string | null,
	registertime: number,
	/**
	 * 0 = unregistered (should never be in db)
	 * 1 = regular user
	 * 2 = admin
	 * 3...6 = PS-specific ranks (voice, driver, mod, leader)
	 */
	group: number,
	banstate: number,
	ip: string,
	avatar: number,
	logintime: number,
	loginip: string | null,
}>('users', 'userid');

export const ladder = ladderDB.getTable<
	LadderEntry
>('ladder', 'entryid');

export const replayPrep = replaysDB.getTable<{
	id: string,
	format: string,
	players: string,
	/**
	 * 0 = public
	 * 1 = private (with password)
	 * 2 = private (no password; used for punishment logging)
	 * 3 = NOT USED; only used in the full replay table
	 */
	private: 0 | 1 | 2,
	loghash: string,
	inputlog: string,
	rating: number,
	uploadtime: number,
}>('replayprep', 'id');

export const replays = replaysDB.getTable<
	ReplayRow
>('replays', 'id');

export const replayPlayers = replaysDB.getTable<{
	playerid: string,
	formatid: string,
	id: string,
	rating: number | null,
	uploadtime: number,
	private: ReplayRow['private'],
	password: string | null,
	format: string,
	/** comma-delimited player names */
	players: string,
}>('replayplayers');

export const sessions = psdb.getTable<{
	session: number,
	sid: string,
	userid: string,
	time: number,
	timeout: number,
	ip: string,
}>('sessions', 'session');

export const userstats = psdb.getTable<{
	id: number,
	serverid: string,
	usercount: number,
	date: number,
}>('userstats', 'id');

export const loginthrottle = psdb.getTable<{
	ip: string,
	count: number,
	time: number,
	lastuserid: string,
}>('loginthrottle', 'ip');

export const loginattempts = psdb.getTable<{
	count: number,
	time: number,
	userid: string,
}>('loginattempts', 'userid');

export const usermodlog = psdb.getTable<{
	entryid: number,
	userid: string,
	actorid: string,
	date: number,
	ip: string,
	entry: string,
}>('usermodlog', 'entryid');

export const userstatshistory = psdb.getTable<{
	id: number,
	date: number,
	usercount: number,
	programid: 'showdown' | 'po',
}>('userstatshistory', 'id');

// oauth stuff

export const oauthClients = psdb.getTable<{
	owner: string, // ps username
	client_title: string,
	id: string, // hex hash
	origin_url: string,
}>('oauth_clients', 'id');

export const oauthTokens = psdb.getTable<{
	owner: string,
	client: string, // id of client
	id: string,
	time: number,
}>('oauth_tokens', 'id');

export const teams = pgdb.getTable<{
	teamid: string,
	ownerid: string,
	team: string,
	format: string,
	title: string,
	private: string,
	views: number,
}>('teams', 'teamid');

export const suspects = psdb.getTable<Suspect>("suspects", 'formatid');
