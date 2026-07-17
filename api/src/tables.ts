/**
 * Login server database tables
 */
import { MockDatabase, MySQLDatabase, PGDatabase, SQLiteDatabase } from './database.ts';
import { Config } from './config-loader.ts';

import type { LadderEntry } from './ladder.ts';
import type { ReplayRow } from './replays.ts';
import type { Suspect } from './actions.ts';

type DatabaseDriver = 'mysql' | 'postgres' | 'sqlite' | 'mock';
type DatabaseConfig = {
	driver: DatabaseDriver,
	prefix?: string,
	[k: string]: any,
};
type RealDatabase = MySQLDatabase | PGDatabase;

function stripDriver(config: DatabaseConfig) {
	const { driver, ...dbConfig } = config;
	return dbConfig;
}

function createDatabase<DB extends RealDatabase>(
	config: DatabaseConfig, name: string
): DB {
	const driver = config.driver;
	if (driver === 'mock') return new MockDatabase(config, name) as unknown as DB;
	if (!config) throw new Error(`Database config "${name}" is required for ${driver}.`);
	if (driver === 'sqlite') return new SQLiteDatabase(stripDriver(config)) as unknown as DB;
	if (driver === 'mysql') return new MySQLDatabase(stripDriver(config)) as DB;
	if (driver === 'postgres') return new PGDatabase(stripDriver(config) as any) as DB;
	throw new Error(`Unsupported database driver for ${name}.`);
}

// direct access
export const loginDB = createDatabase<MySQLDatabase>(Config.logindb, 'mysql');
export const friendsDB = Config.friendsdb ?
	createDatabase<PGDatabase>(Config.friendsdb, 'postgres') : loginDB;
export const replaysDB = Config.replaysdb ?
	createDatabase<PGDatabase>(Config.replaysdb, 'replaysdb') : friendsDB;
export const ladderDB = Config.ladderdb ?
	createDatabase<MySQLDatabase>(Config.ladderdb, 'ladderdb') : loginDB;

export const users = loginDB.getTable<{
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

export const sessions = loginDB.getTable<{
	session: number,
	sid: string,
	userid: string,
	time: number,
	timeout: number,
	ip: string,
}>('sessions', 'session');

export const userstats = loginDB.getTable<{
	id: number,
	serverid: string,
	usercount: number,
	date: number,
}>('userstats', 'id');

export const loginthrottle = loginDB.getTable<{
	ip: string,
	count: number,
	time: number,
	lastuserid: string,
}>('loginthrottle', 'ip');

export const loginattempts = loginDB.getTable<{
	count: number,
	time: number,
	userid: string,
}>('loginattempts', 'userid');

export const usermodlog = loginDB.getTable<{
	entryid: number,
	userid: string,
	actorid: string,
	date: number,
	ip: string,
	entry: string,
}>('usermodlog', 'entryid');

export const userstatshistory = loginDB.getTable<{
	id: number,
	date: number,
	usercount: number,
	programid: 'showdown' | 'po',
}>('userstatshistory', 'id');

// oauth stuff

export const oauthClients = loginDB.getTable<{
	owner: string, // ps username
	client_title: string,
	id: string, // hex hash
	origin_url: string,
}>('oauth_clients', 'id');

export const oauthTokens = loginDB.getTable<{
	owner: string,
	client: string, // id of client
	id: string,
	time: number,
}>('oauth_tokens', 'id');

export const teams = friendsDB.getTable<{
	teamid: string,
	ownerid: string,
	team: string,
	format: string,
	title: string,
	private: string,
	views: number,
}>('teams', 'teamid');

export const suspects = loginDB.getTable<Suspect>("suspects", 'formatid');
