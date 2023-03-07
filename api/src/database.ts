/**
 * Promise database implementation, with stricter typing.
 * By Mia
 * @author mia-pi-git
 */
import * as mysql from 'mysql2';
import {Config} from './config-loader';

export type BasicSQLValue = string | number | null;

export class SQLStatement {
	sql: string;
	values: BasicSQLValue[];
	constructor(strings: TemplateStringsArray, values: BasicSQLValue[]) {
		this.sql = strings.join(`?`);
		this.values = values;
	}
	append(statement: SQLStatement | string) {
		if (typeof statement === 'string') {
			this.sql += statement;
		} else {
			this.sql += statement.sql;
			this.values = this.values.concat(statement.values);
		}
	}
}

export function SQL(strings: TemplateStringsArray, ...values: BasicSQLValue[]) {
	return new SQLStatement(strings, values);
}

export interface ResultRow {[k: string]: BasicSQLValue}
export type DBConfig = mysql.PoolOptions & {prefix?: string};

export const connectedDatabases: Database[] = [];

export class Database {
	connection: mysql.Pool;
	prefix: string;
	constructor(config: DBConfig) {
		config = {...config};
		this.prefix = config.prefix || "";
		if (config.prefix) {
			delete config.prefix;
		}
		this.connection = mysql.createPool(config);
		if (!connectedDatabases.includes(this)) connectedDatabases.push(this);
	}
	query<T = ResultRow>(query: SQLStatement) {
		const err = new Error();
		return new Promise<T[]>((resolve, reject) => {
			// this cast is safe since it's only an array of
			// arrays if we specify it in the config.
			// we do not do that and it is not really useful for any of our cases.
			this.connection.query(query.sql, query.values, (e, results: mysql.RowDataPacket[]) => {
				if (e) {
					// bit of a hack? yeah. but we want good stacks :(
					err.message = `${e.message} ('${query.sql}') [${e.code}]`;
					return reject(err);
				}
				if (Array.isArray(results)) {
					for (const chunk of results) {
						for (const k in chunk) {
							if (Buffer.isBuffer(chunk[k])) chunk[k] = chunk[k].toString();
						}
					}
				}
				return resolve(results as T[]);
			});
		});
	}
	async queryOne<T = ResultRow>(query: SQLStatement): Promise<T | null> {
		// if (!queryString.includes('LIMIT')) queryString += ` LIMIT 1`;
		// limit it yourself, consumers
		const rows = await this.query(query);
		if (Array.isArray(rows)) {
			if (!rows.length) return null;
			return rows[0] as unknown as T;
		}
		return rows ?? null;
	}
	async queryOk(query: SQLStatement): Promise<mysql.OkPacket> {
		if (!['UPDATE', 'INSERT', 'DELETE', 'REPLACE'].some(i => query.sql.includes(i))) {
			throw new Error('Use `query` or `get` for non-insertion / update statements.');
		}
		return this.queryOne(query) as Promise<mysql.OkPacket>;
	}
	close() {
		this.connection.end();
	}
	connect(config: DBConfig) {
		if (config.prefix) {
			this.prefix = config.prefix;
			delete config.prefix;
		}
		this.connection = mysql.createPool(config);
	}
}

// direct access
export const psdb = new Database(Config.mysql);
export const replaysDB = Config.replaysdb ? new Database(Config.replaysdb!) : psdb;
export const ladderDB = Config.ladderdb ? new Database(Config.ladderdb!) : psdb;

export class DatabaseTable<T> {
	name: string;
	primaryKeyName: string;
	constructor(
		name: string,
		primaryKeyName: string
	) {
		this.name = name;
		this.primaryKeyName = primaryKeyName;
	}
	async selectOne(
		entries: string | string[],
		where?: SQLStatement,
		db?: Database
	): Promise<T | null> {
		const query = where || SQL``;
		query.append(' LIMIT 1');
		const rows = await this.selectAll(entries, query, db);
		return rows?.[0] || null;
	}
	selectAll(
		entries: string | string[],
		where?: SQLStatement,
		db?: Database
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
		query.append(`FROM ${this.getName(db)} `);
		if (where) {
			query.append(' WHERE ');
			query.append(where);
		}
		return this.query(query, db);
	}
	get(entries: string | string[], keyId: BasicSQLValue, db?: Database) {
		const query = SQL``;
		query.append(this.format(this.primaryKeyName));
		query.append(SQL` = ${keyId}`);
		return this.selectOne(entries, query, db);
	}
	updateAll(toParams: Partial<T>, where?: SQLStatement, limit?: number, db?: Database) {
		const to = Object.entries(toParams) as [string, BasicSQLValue][];
		const query = SQL`UPDATE `;
		query.append(this.getName(db) + ' SET ');
		for (let i = 0; i < to.length; i++) {
			const [k, v] = to[i];
			query.append(`${this.format(k)} = `);
			query.append(SQL`${v}`);
			if (typeof to[i + 1] !== 'undefined') {
				query.append(', ');
			}
		}

		if (where) {
			query.append(` WHERE `);
			query.append(where);
		}
		if (limit) query.append(SQL` LIMIT ${limit}`);
		return this.execute(query, db);
	}
	updateOne(to: Partial<T>, where?: SQLStatement, db?: Database) {
		return this.updateAll(to, where, 1, db);
	}
	private getName(db?: Database) {
		if (!db) db = psdb;
		return this.format((db.prefix || '') + this.name);
	}
	deleteAll(where?: SQLStatement, limit?: number, db?: Database) {
		const query = SQL`DELETE FROM `;
		query.append(this.getName(db));
		if (where) {
			query.append(' WHERE ');
			query.append(where);
		}
		if (limit) {
			query.append(SQL` LIMIT ${limit}`);
		}
		return this.execute(query, db);
	}
	delete(keyEntry: BasicSQLValue) {
		const query = SQL``;
		query.append(this.format(this.primaryKeyName));
		query.append(SQL` = ${keyEntry}`);
		return this.deleteOne(query);
	}
	deleteOne(where: SQLStatement, db?: Database) {
		return this.deleteAll(where, 1, db);
	}
	insert(colMap: Partial<T>, rest?: SQLStatement, isReplace = false, db?: Database) {
		const query = SQL``;
		query.append(`${isReplace ? 'REPLACE' : 'INSERT'} INTO ${this.getName(db)} (`);
		const keys = Object.keys(colMap);
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			query.append(this.format(key));
			if (typeof keys[i + 1] !== 'undefined') query.append(', ');
		}
		query.append(') VALUES (');
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			query.append(SQL`${colMap[key as keyof T] as BasicSQLValue}`);
			if (typeof keys[i + 1] !== 'undefined') query.append(', ');
		}
		query.append(') ');
		if (rest) query.append(rest);
		return this.execute(query, db);
	}
	replace(cols: Partial<T>, rest?: SQLStatement, db?: Database) {
		return this.insert(cols, rest, true, db);
	}
	format(param: string) {
		// todo: figure out a better way to do this. backticks are only needed
		// for reserved words, but we tend to have a lot of those (like `session` in ntbb_sessions)
		// so for now + consistency's sake, we're going to keep this. but we might be able to hardcode that out?
		// not sure.
		return `\`${param}\``;
	}
	update(primaryKey: BasicSQLValue, data: Partial<T>, db?: Database) {
		const query = SQL``;
		query.append(this.primaryKeyName + ' = ');
		query.append(SQL`${primaryKey}`);
		return this.updateOne(data, query, db);
	}

	// catch-alls for "we can't fit this query into any of the wrapper functions"
	query<Z = T>(sql: SQLStatement, db?: Database) {
		if (!db) db = psdb;
		return db.query<Z>(sql);
	}
	execute(sql: SQLStatement, db?: Database) {
		if (!db) db = psdb;
		return db.queryOk(sql);
	}
}
