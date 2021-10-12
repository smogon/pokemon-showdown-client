/**
 * Promise database implementation, with stricter typing.
 * By Mia
 * @author mia-pi-git
 */
import * as mysql from 'mysql';
import SQL, {SQLStatement} from 'sql-template-strings';
import {Config} from './config-loader';

export type SQLInput = string | number | null;
export interface ResultRow {[k: string]: SQLInput}

export const databases: PSDatabase[] = [];

export class PSDatabase {
	pool: mysql.Pool;
	prefix: string;
	constructor(config: {[k: string]: any} = Config.mysql) {
		this.pool = mysql.createPool(config);
		this.prefix = config.prefix || 'ntbb_';
		if (!databases.includes(this)) databases.push(this);
	}
	query<T = ResultRow>(query: SQLStatement) {
		return new Promise<T[]>((resolve, reject) => {
			this.pool.query(query.sql, query.values, (e, results) => {
				if (e) {
					return reject(
						e.sqlMessage ? new Error(`${e.sqlMessage} ('${e.sql}') [${e.code}]`) : new Error(e.message)
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
	async get<T = ResultRow>(query: SQLStatement): Promise<T | null> {
		// if (!queryString.includes('LIMIT')) queryString += ` LIMIT 1`;
		// limit it yourself, consumers
		const rows = await this.query(query);
		if (Array.isArray(rows)) {
			if (!rows.length) return null;
			return rows[0] as unknown as T;
		}
		return rows ?? null;
	}
	async execute(query: SQLStatement): Promise<mysql.OkPacket> {
		if (!['UPDATE', 'INSERT', 'DELETE', 'REPLACE'].some(i => query.sql.includes(i))) {
			throw new Error('Use `query` or `get` for non-insertion / update statements.');
		}
		return this.get(query) as Promise<mysql.OkPacket>;
	}
	close() {
		this.pool.end();
	}
	connect(config: {[k: string]: any}) {
		this.pool = mysql.createPool(config);
	}
}

// direct access
export const psdb = new PSDatabase();

export class DatabaseTable<T> {
	database: PSDatabase;
	name: string;
	primaryKeyName: string;
	constructor(
		name: string,
		primaryKeyName: string,
		prefix = 'ntbb_',
		config = Config.mysql
	) {
		this.name = name;
		if (prefix) {
			config.prefix = prefix;
		}
		this.database = config ? new PSDatabase(config) : psdb;
		this.primaryKeyName = primaryKeyName;
	}
	async selectOne(
		entries: string | string[],
		where?: SQLStatement
	): Promise<T | null> {
		const query = where || SQL``;
		query.append(' LIMIT 1');
		const rows = await this.selectAll(entries, query);
		return rows?.[0] || null;
	}
	selectAll(
		entries: string | string[],
		where?: SQLStatement
	): Promise<T[]> {
		const query = SQL`SELECT `;
		if (typeof entries === 'string') {
			query.append(' * ');
		} else {
			for (let i = 0; i < entries.length; i++) {
				const key = entries[i];
				query.append(this.format(key));
				if (typeof entries[i + 1] !== 'undefined') query.append(', ');
			}
			query.append(' ');
		}
		query.append(`FROM ${this.getName()} `);
		if (where) {
			query.append(' WHERE ');
			query.append(where);
		}
		return this.database.query<T>(query);
	}
	get(entries: string | string[], keyId: SQLInput) {
		const query = SQL``;
		query.append(this.format(this.primaryKeyName));
		query.append(SQL` = ${keyId}`);
		return this.selectOne(entries, query);
	}
	updateAll(toParams: Partial<T>, where?: SQLStatement, limit?: number) {
		const to = Object.entries(toParams);
		const query = SQL`UPDATE `;
		query.append(this.getName() + ' SET ');
		for (let i = 0; i < to.length; i++) {
			const [k, v] = to[i];
			query.append(`${this.format(k)} = `);
			query.append(SQL`${v}`);
			if (typeof to[i + 1] !== 'undefined') {
				query.append(', ');
			}
		}

		if (where) {
			query.append(SQL` WHERE `);
			query.append(where);
		}
		if (limit) query.append(SQL` LIMIT ${limit}`);
		return this.database.execute(query);
	}
	updateOne(to: Partial<T>, where?: SQLStatement) {
		return this.updateAll(to, where, 1);
	}
	private getName() {
		return this.format((this.database.prefix || '') + this.name);
	}
	deleteAll(where?: SQLStatement, limit?: number) {
		const query = SQL`DELETE FROM `;
		query.append(this.getName());
		if (where) {
			query.append(' WHERE ');
			query.append(where);
		}
		if (limit) {
			query.append(SQL` LIMIT ${limit}`);
		}
		return this.database.execute(query);
	}
	delete(keyEntry: SQLInput) {
		const query = SQL``;
		query.append(this.format(this.primaryKeyName));
		query.append(SQL` = ${keyEntry}`);
		return this.deleteOne(query);
	}
	deleteOne(where: SQLStatement) {
		return this.deleteAll(where, 1);
	}
	insert(colMap: Partial<T>, rest?: SQLStatement, isReplace = false) {
		const query = SQL``;
		query.append(`${isReplace ? 'REPLACE' : 'INSERT'} INTO ${this.getName()} (`);
		const keys = Object.keys(colMap);
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			query.append(this.format(key));
			if (typeof keys[i + 1] !== 'undefined') query.append(', ');
		}
		query.append(') VALUES(');
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			query.append(SQL`${colMap[key as keyof T]}`);
			if (typeof keys[i + 1] !== 'undefined') query.append(', ');
		}
		query.append(') ');
		if (rest) query.append(rest);
		return this.database.execute(query);
	}
	replace(cols: Partial<T>, rest?: SQLStatement) {
		return this.insert(cols, rest, true);
	}
	format(param: string) {
		// todo: figure out a better way to do this. backticks are only needed
		// for reserved words, but we tend to have a lot of those (like `session` in ntbb_sessions)
		// so for now + consistency's sake, we're going to keep this. but we might be able to hardcode that out?
		// not sure.
		return `\`${param}\``;
	}
	update(primaryKey: SQLInput, data: Partial<T>) {
		const query = SQL``;
		query.append(this.primaryKeyName + ' = ');
		query.append(SQL`${primaryKey}`);
		return this.updateOne(data, query);
	}

	// catch-alls for "we can't fit this query into any of the wrapper functions"
	query(sql: SQLStatement) {
		return this.database.query<T>(sql);
	}
	execute(sql: SQLStatement) {
		return this.database.execute(sql);
	}
}
