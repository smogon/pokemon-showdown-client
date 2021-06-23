/**
 * Promise implementation (with stricter typing) database implementation.
 * By Mia
 * @author mia-pi-git
 */
import * as mysql from 'mysql';
import {Config} from './config-loader';

export type SQLInput = string | number | null;
export type ResultRow = {[k: string]: SQLInput};

export const databases: PSDatabase[] = [];

export class PSDatabase {
	pool: mysql.Pool;
	prefix: string;
	constructor(config: {[k: string]: any} = Config.mysql, prefix?: string) {
		if (!prefix) prefix = Config.dbprefix;
		this.pool = mysql.createPool(config);
		this.prefix = prefix || "ntbb_";
		if (!databases.includes(this)) databases.push(this);
	}
	query<T = ResultRow>(queryString: string, args: SQLInput[]) {
		return new Promise<T[]>((resolve, reject) => {
			this.pool.query(queryString, args, (e, results) => {
				// conn.active = false;
				if (e) {
					return reject(
						e.sqlMessage ? new Error(`${e.sqlMessage} ('${e.sql}')`) : new Error(e.message)
					);
				}
				if (Array.isArray(results)) {
					for (const chunk of results) {
						for (const k in chunk) {
							if (Buffer.isBuffer(chunk[k])) chunk[k] = chunk[k].toString();
						}
					}
				}
				return resolve(results);
			});
		});
	}
	async get<T = ResultRow>(queryString: string, args: SQLInput[]): Promise<T | null> {
		// if (!queryString.includes('LIMIT')) queryString += ` LIMIT 1`;
		// limit it yourself, consumers
		const rows = await this.query(queryString, args);
		if (Array.isArray(rows)) return rows[0] as unknown as T;
		return rows || null;
	}
	async execute(queryString: string, args: SQLInput[]): Promise<mysql.OkPacket> {
		if (!['UPDATE', 'INSERT', 'DELETE'].some(i => queryString.includes(i))) {
			throw new Error('Use `query` or `get` for non-insertion / update statements.');
		}
		return this.get(queryString, args) as Promise<mysql.OkPacket>;
	}
	close() {
		this.pool.end();
	}
}

// direct access
export const psdb = new PSDatabase();

export class DatabaseTable<T> {
	database: PSDatabase;
	name: string;
	primaryKeyName: string;
	constructor(name: string, primaryKeyName: string, config = Config.mysql) {
		this.name = name;
		this.database = config ? new PSDatabase(config) : psdb;
		this.primaryKeyName = primaryKeyName;
	}
	async selectOne(
		entries: string | string[],
		where?: string, params?: SQLInput[]
	): Promise<T | null> {
		const rows = await this.selectAll(entries, where + ' LIMIT 1', params);
		return rows?.[0] as T || null;
 	}
	selectAll(
		entries: string | string[],
		where?: string, params?: SQLInput[]
	): Promise<T[]> {
		const colStr = typeof entries === 'string' ? entries : entries.map(k => this.format(k)).join(', ');
		return this.database.query<T>(
			`SELECT ${colStr} FROM ${this.format(this.name)} ${where ? ` WHERE ${where}` : ''}`, params || []
		);
	}
	get(entries: string | string[], keyId: SQLInput) {
		return this.selectOne(entries, `${this.format(this.primaryKeyName)} = ?`, [keyId]);
	}
	updateAll(toParams: Partial<T>, where?: string, whereArgs?: SQLInput[], limit?: number) {
		const to = Object.entries(toParams);
		const updateStr = to.map(k => `${this.format(k[0])} = ?`);
		let queryStr = `UPDATE ${this.format(this.name)} SET ${updateStr}`;
		if (where) queryStr += ` WHERE ${where}`;
		if (limit) queryStr += ` LIMIT ${limit}`;
		return this.database.execute(
			queryStr,
			to.map(([, data]) => data as SQLInput).concat(whereArgs || [])
		);
	}
	updateOne(to: Partial<T>, where?: string, whereArgs?: SQLInput[]) {
		return this.updateAll(to, where, whereArgs, 1);
	}
	deleteAll(where?: string, args?: SQLInput[], limit?: number) {
		return this.database.execute(
			`DELETE FROM ${this.format(this.name)}${where ? ` WHERE ${where}` : ''}` +
				`${limit ? ` LIMIT ${limit}` : ''}`,
			args || []
		);
	}
	delete(keyEntry: SQLInput) {
		return this.deleteOne(`${this.format(this.primaryKeyName)} = ?`, [keyEntry]);
	}
	deleteOne(where: string, args?: SQLInput[]) {
		return this.deleteAll(where, args, 1);
	}
	insert(colMap: Partial<T>, rest?: string, restArgs?: SQLInput[], isReplace = false) {
		let queryString = `${isReplace ? 'REPLACE' : 'INSERT'} INTO ${this.format(this.name)} (`;
		const query = Object.entries(colMap);
		queryString += query.map(([name]) => this.format(name)).join(', ');
		queryString += ') VALUES (';
		queryString += query.map(() => '?').join(', ');
		queryString += ')';
		if (rest) queryString += ` ${rest}`;
		return this.database.execute(
			queryString,
			query.map(k => k[1] as SQLInput).concat(restArgs || [])
		);
	}
	replace(cols: Partial<T>, rest?: string, restArgs?: SQLInput[]) {
		return this.insert(cols, rest, restArgs, true);
	}
	format(param: string) {
		// todo: figure out a better way to do this. backticks are only needed
		// for reserved words, but we tend to have a lot of those (like `session` in ntbb_sessions)
		// so for now + consistency's sake, we're going to keep this. but we might be able to hardcode that out?
		// not sure.
		return `\`${param}\``;
	}
	update(primaryKey: SQLInput, data: Partial<T>) {
		return this.updateOne(data, `${this.primaryKeyName} = ?`, [primaryKey]);
	}

	// catch-alls for "we can't fit this query into any of the wrapper functions"
	query(sqlString: string, params: SQLInput[]) {
		return this.database.query<T>(sqlString, params);
	}
	execute(sqlString: string, params: SQLInput[]) {
		return this.database.execute(sqlString, params);
	}
}
