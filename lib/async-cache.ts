export class AsyncCache<T> {
	private readonly ttlMs: number;
	private readonly load: () => Promise<T>;
	private cached?: { value: T, expires: number };
	private loading?: Promise<T>;

	constructor(ttlMs: number, load: () => Promise<T>) {
		this.ttlMs = ttlMs;
		this.load = load;
	}

	async get(): Promise<T> {
		if (this.cached && Date.now() < this.cached.expires) return this.cached.value;
		if (this.loading) return this.loading;
		this.loading = this.load();
		try {
			const value = await this.loading;
			this.cached = { value, expires: Date.now() + this.ttlMs };
			return value;
		} finally {
			this.loading = undefined;
		}
	}
}
