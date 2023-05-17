/**
 * Database abstraction layer that's vaguely ORM-like.
 * Modern (Promises, strict types, tagged template literals), but ORMs
 * are a bit _too_ magical for me, so none of that magic here.
 *
 * @author Zarel
 */

import * as mysql from 'mysql2';

export type BasicSQLValue = string | number | null;
export type SQLRow = {[k: string]: BasicSQLValue};
export type SQLValue = BasicSQLValue | SQLStatement | PartialOrSQL<SQLRow> | BasicSQLValue[] | undefined;

export class SQLStatement {
	sql: string[];
	values: BasicSQLValue[];
	constructor(strings: TemplateStringsArray, values: SQLValue[]) {
		this.sql = [strings[0]];
		this.values = [];
		for (let i = 0; i < strings.length; i++) {
			this.append(values[i], strings[i + 1]);
		}
	}
	append(value: SQLValue, nextString = ''): this {
		if (value instanceof SQLStatement) {
			if (!value.sql.length) return this;
			const oldLength = this.sql.length;
			this.sql = this.sql.concat(value.sql.slice(1));
			this.sql[oldLength - 1] += value.sql[0];
			this.values = this.values.concat(value.values);
			if (nextString) this.sql[this.sql.length - 1] += nextString;
		} else if (typeof value === 'string' || typeof value === 'number' || value === null) {
			this.values.push(value);
			this.sql.push(nextString);
		} else if (value === undefined) {
			this.sql[this.sql.length - 1] += nextString;
		} else if (Array.isArray(value)) {
			if (this.sql[this.sql.length - 1].endsWith(`\``)) {
				// "`a`, `b`" syntax
				for (const col of value) {
					this.append(col, `\`, \``);
				}
				this.sql[this.sql.length - 1] = this.sql[this.sql.length - 1].slice(0, -4) + nextString;
			} else {
				// "1, 2" syntax
				for (const val of value) {
					this.append(val, `, `);
				}
				this.sql[this.sql.length - 1] = this.sql[this.sql.length - 1].slice(0, -2) + nextString;
			}
		} else if (this.sql[this.sql.length - 1].endsWith('(')) {
			// "(`a`, `b`) VALUES (1, 2)" syntax
			this.sql[this.sql.length - 1] += `\``;
			for (const col in value) {
				this.append(col, `\`, \``);
			}
			this.sql[this.sql.length - 1] = this.sql[this.sql.length - 1].slice(0, -4) + `\`) VALUES (`;
			for (const col in value) {
				this.append(value[col], `, `);
			}
			this.sql[this.sql.length - 1] = this.sql[this.sql.length - 1].slice(0, -2) + nextString;
		} else if (this.sql[this.sql.length - 1].toUpperCase().endsWith(' SET ')) {
			// "`a` = 1, `b` = 2" syntax
			this.sql[this.sql.length - 1] += `\``;
			for (const col in value) {
				this.append(col, `\` = `);
				this.append(value[col], `, \``);
			}
			this.sql[this.sql.length - 1] = this.sql[this.sql.length - 1].slice(0, -3) + nextString;
		} else {
			throw new Error(
				`Objects can only appear in (obj) or after SET; ` +
				`unrecognized: ${this.sql[this.sql.length - 1]}[obj]${nextString}`
			);
		}
		return this;
	}
}

/**
 * Tag function for SQL, with some magic.
 *
 * * `` SQL`UPDATE table SET a = ${'hello"'}` ``
 *   * `` 'UPDATE table SET a = "hello"' ``
 *
 * Values surrounded by `` \` `` become names:
 *
 * * ``` SQL`SELECT * FROM \`${'table'}\`` ```
 *   * `` 'SELECT * FROM `table`' ``
 *
 * Objects preceded by SET become setters:
 *
 * * `` SQL`UPDATE table SET ${{a: 1, b: 2}}` ``
 *   * `` 'UPDATE table SET `a` = 1, `b` = 2' ``
 *
 * Objects surrounded by `()` become keys and values:
 *
 * * `` SQL`INSERT INTO table (${{a: 1, b: 2}})` ``
 *   * `` 'INSERT INTO table (`a`, `b`) VALUES (1, 2)' ``
 *
 * Arrays become lists; surrounding by `` \` `` turns them into lists of names:
 *
 * * `` SQL`INSERT INTO table (\`${['a', 'b']}\`) VALUES (${[1, 2]})` ``
 *   * `` 'INSERT INTO table (`a`, `b`) VALUES (1, 2)' ``
 */
export function SQL(strings: TemplateStringsArray, ...values: SQLValue[]) {
	return new SQLStatement(strings, values);
}

export interface ResultRow {[k: string]: BasicSQLValue}

export const connectedDatabases: Database[] = [];

export class Database {
	connection: mysql.Pool;
	prefix: string;
	constructor(config: mysql.PoolOptions & {prefix?: string}) {
		this.prefix = config.prefix || "";
		if (config.prefix) {
			config = {...config};
			delete config.prefix;
		}
		this.connection = mysql.createPool(config);
		connectedDatabases.push(this);
	}
	resolveSQL(query: SQLStatement): [query: string, values: BasicSQLValue[]] {
		let sql = query.sql[0];
		const values = [];
		for (let i = 0; i < query.values.length; i++) {
			const value = query.values[i];
			if (query.sql[i + 1].startsWith('`')) {
				sql = sql.slice(0, -1) + this.connection.escapeId('' + value) + query.sql[i + 1].slice(1);
			} else {
				sql += '?' + query.sql[i + 1];
				values.push(value);
			}
		}
		return [sql, values];
	}
	query<T = ResultRow>(sql: SQLStatement): Promise<T[]>;
	query<T = ResultRow>(): (strings: TemplateStringsArray, ...rest: SQLValue[]) => Promise<T[]>;
	query<T = ResultRow>(sql?: SQLStatement) {
		if (!sql) return (strings: any, ...rest: any) => this.query<T>(new SQLStatement(strings, rest));

		return new Promise<T[]>((resolve, reject) => {
			const [query, values] = this.resolveSQL(sql);
			this.connection.query(query, values, (e, results: any) => {
				if (e) {
					return reject(new Error(`${e.message} (${query}) (${values}) [${e.code}]`));
				}
				if (Array.isArray(results)) {
					for (const row of results) {
						for (const col in row) {
							if (Buffer.isBuffer(row[col])) row[col] = row[col].toString();
						}
					}
				}
				return resolve(results);
			});
		});
	}
	queryOne<T = ResultRow>(sql: SQLStatement): Promise<T | undefined>;
	queryOne<T = ResultRow>(): (strings: TemplateStringsArray, ...rest: SQLValue[]) => Promise<T | undefined>;
	queryOne<T = ResultRow>(sql?: SQLStatement) {
		if (!sql) return (strings: any, ...rest: any) => this.queryOne<T>(new SQLStatement(strings, rest));

		return this.query<T>(sql).then(res => Array.isArray(res) ? res[0] : res);
	}
	queryExec(sql: SQLStatement): Promise<mysql.OkPacket>;
	queryExec(): (strings: TemplateStringsArray, ...rest: SQLValue[]) => Promise<mysql.OkPacket>;
	queryExec(sql?: SQLStatement) {
		if (!sql) return (strings: any, ...rest: any) => this.queryExec(new SQLStatement(strings, rest));
		return this.queryOne<mysql.OkPacket>(sql);
	}
	close() {
		this.connection.end();
	}
}

type PartialOrSQL<T> = {
	[P in keyof T]?: T[P] | SQLStatement;
};

// Row extends SQLRow but TS doesn't support closed types so we can't express this
export class DatabaseTable<Row> {
	db: Database;
	name: string;
	primaryKeyName: keyof Row & string;
	constructor(
		db: Database,
		name: string,
		primaryKeyName: keyof Row & string
	) {
		this.db = db;
		this.name = db.prefix + name;
		this.primaryKeyName = primaryKeyName;
	}
	escapeId(param: string) {
		return this.db.connection.escapeId(param);
	}

	// raw

	query<T = Row>(sql: SQLStatement): Promise<T[]>;
	query<T = Row>(): (strings: TemplateStringsArray, ...rest: SQLValue[]) => Promise<T[]>;
	query<T = Row>(sql?: SQLStatement) {
		return this.db.query<T>(sql as any) as any;
	}
	queryOne<T = Row>(sql: SQLStatement): Promise<T | undefined>;
	queryOne<T = Row>(): (strings: TemplateStringsArray, ...rest: SQLValue[]) => Promise<T | undefined>;
	queryOne<T = Row>(sql?: SQLStatement) {
		return this.db.queryOne<T>(sql as any) as any;
	}
	queryExec(sql: SQLStatement): Promise<mysql.OkPacket>;
	queryExec(): (strings: TemplateStringsArray, ...rest: SQLValue[]) => Promise<mysql.OkPacket>;
	queryExec(sql?: SQLStatement) {
		return this.db.queryExec(sql as any) as any;
	}

	// low-level

	selectAll<T = Row>(entries?: (keyof Row & string)[] | SQLStatement):
	(strings: TemplateStringsArray, ...rest: SQLValue[]) => Promise<T[]> {
		if (!entries) entries = SQL`*`;
		if (Array.isArray(entries)) entries = SQL`\`${entries}\``;
		return (strings, ...rest) =>
			this.query<T>()`SELECT ${entries} FROM \`${this.name}\` ${new SQLStatement(strings, rest)}`;
	}
	selectOne<T = Row>(entries?: (keyof Row & string)[] | SQLStatement):
	(strings: TemplateStringsArray, ...rest: SQLValue[]) => Promise<T | undefined> {
		if (!entries) entries = SQL`*`;
		if (Array.isArray(entries)) entries = SQL`\`${entries}\``;
		return (strings, ...rest) =>
			this.queryOne<T>()`SELECT ${entries} FROM \`${this.name}\` ${new SQLStatement(strings, rest)} LIMIT 1`;
	}
	updateAll(partialRow: PartialOrSQL<Row>):
	(strings: TemplateStringsArray, ...rest: SQLValue[]) => Promise<mysql.OkPacket> {
		return (strings, ...rest) =>
			this.queryExec()`UPDATE \`${this.name}\` SET ${partialRow as any} ${new SQLStatement(strings, rest)}`;
	}
	updateOne(partialRow: PartialOrSQL<Row>):
	(strings: TemplateStringsArray, ...rest: SQLValue[]) => Promise<mysql.OkPacket> {
		return (s, ...r) =>
			this.queryExec()`UPDATE \`${this.name}\` SET ${partialRow as any} ${new SQLStatement(s, r)} LIMIT 1`;
	}
	deleteAll():
	(strings: TemplateStringsArray, ...rest: SQLValue[]) => Promise<mysql.OkPacket> {
		return (strings, ...rest) =>
			this.queryExec()`DELETE FROM \`${this.name}\` ${new SQLStatement(strings, rest)}`;
	}
	deleteOne():
	(strings: TemplateStringsArray, ...rest: SQLValue[]) => Promise<mysql.OkPacket> {
		return (strings, ...rest) =>
			this.queryExec()`DELETE FROM \`${this.name}\` ${new SQLStatement(strings, rest)} LIMIT 1`;
	}

	// high-level

	insert(partialRow: PartialOrSQL<Row>, where?: SQLStatement) {
		return this.queryExec()`INSERT INTO \`${this.name}\` (${partialRow as SQLValue}) ${where}`;
	}
	insertIgnore(partialRow: PartialOrSQL<Row>, where?: SQLStatement) {
		return this.queryExec()`INSERT IGNORE INTO \`${this.name}\` (${partialRow as SQLValue}) ${where}`;
	}
	async tryInsert(partialRow: PartialOrSQL<Row>, where?: SQLStatement) {
		try {
			return await this.insert(partialRow, where);
		} catch (err: any) {
			if (err.code === 'ER_DUP_ENTRY') {
				return undefined;
			}
			throw err;
		}
	}
	set(primaryKey: BasicSQLValue, partialRow: PartialOrSQL<Row>, where?: SQLStatement) {
		partialRow[this.primaryKeyName] = primaryKey as any;
		return this.replace(partialRow, where);
	}
	replace(partialRow: PartialOrSQL<Row>, where?: SQLStatement) {
		return this.queryExec()`REPLACE INTO \`${this.name}\` (${partialRow as SQLValue}) ${where}`;
	}
	get(primaryKey: BasicSQLValue, entries?: (keyof Row & string)[] | SQLStatement) {
		return this.selectOne(entries)`WHERE \`${this.primaryKeyName}\` = ${primaryKey}`;
	}
	delete(primaryKey: BasicSQLValue) {
		return this.deleteAll()`WHERE \`${this.primaryKeyName}\` = ${primaryKey} LIMIT 1`;
	}
	update(primaryKey: BasicSQLValue, data: PartialOrSQL<Row>) {
		return this.updateAll(data)`WHERE \`${this.primaryKeyName}\` = ${primaryKey} LIMIT 1`;
	}
}
