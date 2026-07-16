/**
 * Mock database driver.
 */
import { type DatabaseTable } from './database';

type MockTableBase<Row> = Pick<DatabaseTable<Row, any>, 'name' | 'primaryKeyName' | 'db'>;

function createMockTable<Row>(
	name: string, primaryKeyName: keyof Row & string | null = null
): DatabaseTable<Row, any> {
	const table: MockTableBase<Row> = {
		name,
		primaryKeyName,
		db: { type: 'mock' } as any,
	};
	return new Proxy(table, {
		get(target, prop, receiver) {
			if (prop in target) return Reflect.get(target, prop, receiver);
			if (typeof prop === 'string') {
				return () => {
					throw new Error(`Mock table "${name}" attempted to use "${prop}".`);
				};
			}
		},
	}) as DatabaseTable<Row, any>;
}

export class MockDatabase {
	type = 'mock';
	prefix = '';
	readonly name: string;
	constructor(_config: any, name: string) {
		this.name = name;
	}
	getTable<Row>(tableName: string, primaryKeyName: keyof Row & string | null = null) {
		return createMockTable<Row>(`${this.name}.${tableName}`, primaryKeyName);
	}
	close() {}
}
