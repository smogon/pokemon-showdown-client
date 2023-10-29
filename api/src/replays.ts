/**
 * Code for uploading and managing replays.
 *
 * Ported to TypeScript by Annika and Mia.
 */
import {Session} from './user';
import {ActionError, ActionContext} from './server';
import {toID, time, stripNonAscii, md5} from './utils';
import {prepreplays, replays} from './tables';
import {Config} from './config-loader';
import {SQL} from './database';

export interface ReplayData {
	id: string;
	/** player name; starting with ! denotes that player wants the replay private */
	p1: string;
	/** player name; starting with ! denotes that player wants the replay private */
	p2: string;
	format: string;
	log: string;
	inputlog: string | null;
	uploadtime: number;
	views: number;
	p1id: string;
	p2id: string;
	formatid: string;
	rating: number;
	/**
	 * 0 = public
	 * 1 = private (with or without password)
	 * 2 = NOT USED; ONLY USED IN PREPREPLAY
	 * 3 = deleted
	 */
	private: 0 | 1 | 2 | 3;
	password: string | null;
}

export const Replays = new class {
	readonly passwordCharacters = '0123456789abcdefghijklmnopqrstuvwxyz';
	async prep(params: {[k: string]: unknown}) {
		const id = ('' + params.id).toLowerCase().replace(/[^a-z0-9-]+/g, '');
		let isPrivate: 0 | 1 | 2 = params.hidden ? 1 : 0;
		if (params.hidden === 2) isPrivate = 2;
		let p1 = Session.wordfilter(`${params.p1}`);
		let p2 = Session.wordfilter(`${params.p2}`);
		if (isPrivate) {
			p1 = `!${p1}`;
			p2 = `!${p2}`;
		}
		const {loghash, format} = params as Record<string, string>;
		let rating = Number(params.rating);
		if (params.serverid !== Config.mainserver) rating = 0;
		const inputlog = params.inputlog || null;
		const out = await prepreplays.replace({
			id, loghash,
			p1, p2,
			format,
			uploadtime: time(),
			rating,
			inputlog: Array.isArray(inputlog) ? inputlog.join('\n') : inputlog as string,
			private: isPrivate,
		});
		return !!out.affectedRows;
	}

	/**
	 * Not a direct upload; you should call prep first.
	 *
	 * The intended use is that the sim server sends `prepreplay` directly
	 * to here, and then the client sends `upload`. Convoluted mostly in
	 * case of firewalls between the sim server and the loginserver.
	 */
	async upload(params: {[k: string]: string | undefined}, context: ActionContext) {
		let id = ('' + params.id).toLowerCase().replace(/[^a-z0-9-]+/g, '');
		if (!id) throw new ActionError('Battle ID needed.');
		const preppedReplay = await prepreplays.get(id);
		const replay = await replays.get(id, ['id', 'private', 'password']);
		if (!preppedReplay) {
			if (replay) {
				if (replay.password) {
					id += '-' + replay.password + 'pw';
				}
				return 'success:' + id;
			}
			if (!/^[a-z0-9]+-[a-z0-9]+-[0-9]+$/.test(id)) {
				return 'invalid id';
			}
			return 'not found';
		}
		let password: string | null = null;
		if (preppedReplay.private && preppedReplay.private !== 2) {
			if (replay?.password) {
				password = replay.password;
			} else if (!replay?.private) {
				password = this.generatePassword();
			}
		}
		if (typeof params.password === 'string') password = params.password;

		let fullid = id;
		if (password) fullid += '-' + password + 'pw';

		let log = params.log as string;
		if (md5(stripNonAscii(log)) !== preppedReplay.loghash) {
			log = log.replace('\r', '');
			if (md5(stripNonAscii(log)) !== preppedReplay.loghash) {
				// Hashes don't match.

				// Someone else tried to upload a replay of the same battle,
				// while we were uploading this
				// ...pretend it was a success
				return 'success:' + fullid;
			}
		}

		if (password && password.length > 31) {
			context.setHeader('HTTP/1.1', '403 Forbidden');
			return 'password must be 31 or fewer chars long';
		}

		const p1id = toID(preppedReplay.p1);
		const p2id = toID(preppedReplay.p2);
		const formatid = toID(preppedReplay.format);

		const privacy = preppedReplay.private ? 1 : 0;
		const {p1, p2, format, uploadtime, rating, inputlog} = preppedReplay;
		await replays.insert({
			id, p1, p2, format, p1id, p2id,
			formatid, uploadtime,
			private: privacy, rating, log,
			inputlog, password,
		}, SQL`ON DUPLICATE KEY UPDATE log = ${params.log as string},
			inputlog = ${inputlog}, rating = ${rating},
			private = ${privacy}, \`password\` = ${password}`);

		await prepreplays.deleteOne()`WHERE id = ${id} AND loghash = ${preppedReplay.loghash}`;

		return 'success:' + fullid;
	}

	async get(id: string): Promise<ReplayData | null> {
		const replay = await replays.get(id);
		if (!replay) return null;

		for (const player of ['p1', 'p2'] as const) {
			if (replay[player].startsWith('!')) replay[player] = replay[player].slice(1);
		}
		await replays.update(replay.id, {views: SQL`views + 1`});

		return replay;
	}

	async edit(replay: ReplayData) {
		if (replay.private === 3) {
			await replays.update(replay.id, {private: 3, password: null});
		} else if (replay.private === 2) {
			await replays.update(replay.id, {private: 1, password: null});
		} else if (replay.private) {
			if (!replay.password) replay.password = this.generatePassword();
			await replays.update(replay.id, {private: 1, password: replay.password});
		} else {
			await replays.update(replay.id, {private: 1, password: null});
		}
	}

	generatePassword(length = 31) {
		let password = '';
		for (let i = 0; i < length; i++) {
			password += this.passwordCharacters[Math.floor(Math.random() * this.passwordCharacters.length)];
		}

		return password;
	}

	async search(args: {
		page?: number; isPrivate?: boolean; byRating?: boolean;
		format?: string; username?: string; username2?: string;
	}): Promise<ReplayData[]> {
		const page = args.page || 0;
		if (page > 100) return [];

		let limit1 = 50 * (page - 1);
		if (limit1 < 0) limit1 = 0;

		const isPrivate = args.isPrivate ? 1 : 0;

		const format = args.format ? toID(args.format) : null;

		if (args.username) {
			const order = args.byRating ? SQL`ORDER BY rating DESC` : SQL`ORDER BY uploadtime DESC`;
			const userid = toID(args.username);
			if (args.username2) {
				const userid2 = toID(args.username2);
				if (format) {
					return replays.query()`(SELECT uploadtime, id, format, p1, p2, password FROM ps_replays 
						FORCE INDEX (p1) 
						WHERE private = ${isPrivate} AND p1id = ${userid} 
						AND p2id = ${userid2} AND format = ${format} 
						${order})
						 UNION 
						(SELECT uploadtime, id, format, p1, p2, password 
						FROM ps_replays FORCE INDEX (p1) 
						WHERE private = ${isPrivate} AND p1id = ${userid2} AND p2id = ${userid} 
						AND format = ${format}
						 ${order})
						 ${order} LIMIT ${limit1}, 51;`;
				} else {
					return replays.query()`(SELECT uploadtime, id, format, p1, p2, password FROM ps_replays 
						FORCE INDEX (p1) 
						WHERE private = ${isPrivate} AND p1id = ${userid} AND p2id = ${userid2}
						 ${order})
						 UNION 
						(SELECT uploadtime, id, format, p1, p2, password FROM ps_replays FORCE INDEX (p1) 
						WHERE private = ${isPrivate} AND p1id = ${userid2} AND p2id = ${userid} 
						${order})
						 ${order} LIMIT ${limit1}, 51;`;
				}
			} else {
				if (format) {
					return replays.query()`(SELECT uploadtime, id, format, p1, p2, password FROM ps_replays 
						FORCE INDEX (p1) 
						WHERE private = ${isPrivate} AND p1id = ${userid} AND format = ${format} 
						${order})
						 UNION 
						(SELECT uploadtime, id, format, p1, p2, password FROM ps_replays FORCE INDEX (p2)
						 WHERE private = ${isPrivate} AND p2id = ${userid} AND format = ${format} 
						${order})
						 ${order} LIMIT ${limit1}, 51;`;
				} else {
					return replays.query()`(SELECT uploadtime, id, format, p1, p2, password FROM ps_replays 
						FORCE INDEX (p1) 
						WHERE private = ${isPrivate} AND p1id = ${userid} ${order})
						 UNION 
						(SELECT uploadtime, id, format, p1, p2, password FROM ps_replays FORCE INDEX (p2) 
						WHERE private = ${isPrivate} AND p2id = ${userid} ${order})
						 ${order} LIMIT ${limit1}, 51;`;
				}
			}
		}

		if (args.byRating) {
			return replays.query()`SELECT uploadtime, id, format, p1, p2, rating, password 
				FROM ps_replays FORCE INDEX (top) 
				WHERE private = ${isPrivate} AND formatid = ${format} ORDER BY rating DESC LIMIT ${limit1}, 51`;
		} else {
			return replays.query()`SELECT uploadtime, id, format, p1, p2, rating, password 
				FROM ps_replays FORCE INDEX (format) 
				WHERE private = ${isPrivate} AND formatid = ${format} ORDER BY uploadtime DESC LIMIT ${limit1}, 51`;
		}
	}

	async fullSearch(term: string, page = 0): Promise<ReplayData[]> {
		if (page > 0) return [];

		const patterns = term.split(',').map(subterm => {
			const escaped = subterm.replace(/%/g, '\\%').replace(/_/g, '\\_');
			return `%${escaped}%`;
		});
		if (patterns.length !== 1 && patterns.length !== 2) return [];

		const secondPattern = patterns.length >= 2 ? SQL`AND log LIKE ${patterns[1]} ` : undefined;

		return replays.query()`SELECT /*+ MAX_EXECUTION_TIME(10000) */ 
			uploadtime, id, format, p1, p2, password FROM ps_replays 
			FORCE INDEX (recent) WHERE private = 0 AND log LIKE ${patterns[0]} ${secondPattern}
			ORDER BY uploadtime DESC LIMIT 10;`;
	}

	async recent() {
		return replays.selectAll(
			SQL`uploadtime, id, format, p1, p2`
		)`FORCE INDEX (recent) WHERE private = 0 ORDER BY uploadtime DESC LIMIT 50`;
	}
};

export default Replays;
