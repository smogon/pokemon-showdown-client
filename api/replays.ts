/**
 * Code for uploading and managing replays.
 *
 * Ported to TypeScript by Annika and Mia.
 */
import * as crypto from 'crypto';
import {ActionError, Dispatcher} from './dispatcher';
import {Session, time} from './session';
import {toID} from './server';
import {prepreplays, replays} from "./tables";

export interface ReplayData {
	id: string;
	p1: string;
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
	/** a boolean stored as a number in MySQL */
	private: number;
	password: string | null;
}

export interface PreparedReplay {
	id: string;
	p1: string;
	p2: string;
	format: string;
	private: number;
	loghash: string;
	inputlog: string;
	rating: number;
	uploadtime: number;
}

function stripNonAscii(str: string) {
	return str.replace(/[^(\x20-\x7F)]+/, '');
}

function md5(str: string) {
	return crypto.createHash('md5').update(str).digest('hex');
}

export const Replays = new class {
	readonly passwordCharacters = '0123456789abcdefghijklmnopqrstuvwxyz';
	async prep(params: {[k: string]: any}) {
		const id = params.id;
		let isPrivate = params.hidden ? 1 : 0;
		if (params.hidden === 2) isPrivate = 2;
		let p1 = Session.wordfilter(params.p1);
		let p2 = Session.wordfilter(params.p2);
		if (isPrivate) {
			p1 = `!${p1}`;
			p2 = `!${p2}`;
		}
		const {loghash, format} = params;
		let rating = Number(params.rating);
		if (params.serverid !== 'showdown') rating = 0;
		const inputlog = params.inputlog || null;
		const out = await prepreplays.replace({
			id, loghash, p1, p2, format, uploadtime: time(), rating, inputlog,
		});
		return !!out;
	}

	generatePassword(length = 31) {
		let password = '';
		for (let i = 0; i < length; i++) {
			password += this.passwordCharacters[Math.floor(Math.random() * this.passwordCharacters.length)];
		}

		return password;
	}

	async get(id: string): Promise<ReplayData | null> {
		const replay = await replays.selectOne('*', 'id = ?', [id]);
		if (!replay) return null;

		for (const player of ['p1', 'p2'] as const) {
			if (replay[player].startsWith('!')) replay[player] = replay[player].slice(1);
		}
		await replays.query(`UPDATE ps_replays SET views = views + 1 WHERE id = ?`, [replay.id]);

		return replay;
	}

	async edit(replay: ReplayData) {
		if (replay.private === 3) {
			replay.private = 3;
			await replays.updateOne({private:  3, password: null}, 'id = ?', [replay.id]);
		} else if (replay.private === 2) {
			replay.private = 1;
			replay.password = null;
			await replays.updateOne({private:  1, password: null}, 'id = ?', [replay.id]);
		} else if (replay.private) {
			if (!replay.password) replay.password = this.generatePassword();
			await replays.updateOne({private:  1, password: replay.password}, 'id = ?', [replay.id]);
		} else {
			await replays.updateOne({private: 1, password: null}, 'id = ?', [replay.id]);
		}
	}

	async search(args: {
		page?: number, isPrivate?: boolean, byRating?: boolean, format?: string, username?: string, username2?: string,
	}): Promise<ReplayData[]> {
		const page = args.page || 0;
		if (page > 100) return [];

		let limit1 = 50 * (page - 1);
		if (limit1 < 0) limit1 = 0;

		const isPrivate = args.isPrivate ? 1 : 0;

		const format = args.format ? toID(args.format) : null;

		if (args.username) {
			const order = args.byRating ? "rating" : "uploadtime";
			const userid = toID(args.username);
			if (args.username2) {
				const userid2 = toID(args.username2);
				if (format) {
					return replays.query(
						`(SELECT uploadtime, id, format, p1, p2, password FROM ps_replays FORCE INDEX (p1) WHERE private = ? AND p1id = ? AND p2id = ? AND format = ? ORDER BY ? DESC)` +
						` UNION ` +
						`(SELECT uploadtime, id, format, p1, p2, password FROM ps_replays FORCE INDEX (p1) WHERE private = ? AND p1id = ? AND p2id = ? AND format = ? ORDER BY ? DESC)` +
						` ORDER BY ? DESC LIMIT ?, 51;`,
						[isPrivate, userid, userid2, format, order, isPrivate, userid, userid2, format, order, order, limit1]
					);
				} else {
					return replays.query(
						`(SELECT uploadtime, id, format, p1, p2, password FROM ps_replays FORCE INDEX (p1) WHERE private = ? AND p1id = ? AND p2id = ? ORDER BY ? DESC)` +
						` UNION ` +
						`(SELECT uploadtime, id, format, p1, p2, password FROM ps_replays FORCE INDEX (p1) WHERE private = ? AND p1id = ? AND p2id = ? ORDER BY ? DESC)` +
						` ORDER BY ? DESC LIMIT ?, 51;`,
						[isPrivate, userid, userid2, order, isPrivate, userid, userid2, order, order, limit1]
					);
				}
			} else {
				if (format) {
					return replays.query(
						`(SELECT uploadtime, id, format, p1, p2, password FROM ps_replays FORCE INDEX (p1) WHERE private = ? AND p1id = ? AND format = ? ORDER BY ? DESC)` +
						` UNION ` +
						`(SELECT uploadtime, id, format, p1, p2, password FROM ps_replays FORCE INDEX (p2) WHERE private = ? AND p2id = ? AND format = ? ORDER BY ? DESC)` +
						` ORDER BY ? DESC LIMIT ?, 51;`,
						[isPrivate, userid, format, order, isPrivate, userid, format, order, order, limit1]
					);
				} else {
					return replays.query(
						`(SELECT uploadtime, id, format, p1, p2, password FROM ps_replays FORCE INDEX (p1) WHERE private = ? AND p1id = ? ORDER BY ? DESC)` +
						` UNION ` +
						`(SELECT uploadtime, id, format, p1, p2, password FROM ps_replays FORCE INDEX (p2) WHERE private = ? AND p2id = ? ORDER BY ? DESC)` +
						` ORDER BY ? DESC LIMIT ?, 51;`,
						[isPrivate, userid, order, isPrivate, userid, order, order, limit1]
					);
				}
			}
		}

		if (args.byRating) {
			return replays.query(
				`SELECT uploadtime, id, format, p1, p2, rating, password FROM ps_replays FORCE INDEX (top) ` +
				`WHERE private = ? AND formatid = ? ORDER BY rating DESC LIMIT 51`,
				[isPrivate, format]
			);
		} else {
			return replays.query(
				`SELECT uploadtime, id, format, p1, p2, rating, password FROM ps_replays FORCE INDEX (format) ` +
				`WHERE private = ? AND formatid = ? ORDER BY rating DESC LIMIT 51`,
				[isPrivate, format]
			);
		}
	}

	async fullSearch(term: string, page = 0) {
		if (page > 0) return [];

		const patterns = term.split(',').map(subterm => {
			const escaped = subterm.replace(/%/g, '\\%').replace(/_/g, '\\_');
			return `%${escaped}%`;
		});
		if (patterns.length !== 1 && patterns.length !== 2) return [];

		const query = (
			`SELECT /*+ MAX_EXECUTION_TIME(10000) */ uploadtime, id, format, p1, p2, password FROM ps_replays ` +
			`FORCE INDEX (recent) WHERE private = 0 AND log LIKE ? ` +
			((patterns.length === 2) ? `AND log LIKE ? ` : ``) +
			` ORDER BY uploadtime DESC LIMIT 10`
		);

		return replays.query(query, patterns);
	}

	async recent() {
		return replays.query(
			`SELECT uploadtime, id, format, p1, p2 FROM ps_replays FORCE INDEX (recent) WHERE private = 0 ORDER BY uploadtime DESC LIMIT 50`, []
		);
	}

	normalizeUsername(username: string) {
		return username.toLowerCase().replace(/[^A-Za-z0-9]+/g, '');
	}

	async upload(params: {[k: string]: any}, dispatcher: Dispatcher) {
		let id = params.id;
		if (!toID(id)) throw new ActionError(`Battle ID needed.`);
		const preppedReplay = await prepreplays.selectOne('*', 'id = ?', [id]);
		const replay = await replays.get(['id', 'private', 'password'], id);
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
		let password = null;
		if (preppedReplay.private && preppedReplay.private !== 2) {
			if (replay?.password) {
				password = replay.password;
			} else if (!replay?.private) {
				password = this.generatePassword();
			}
		}
		if (params.password) password = params.password;

		let fullid = id;
		if (password) fullid += '-' + password + 'pw';

		if (md5(stripNonAscii(params.log)) !== preppedReplay.loghash) {
			params.log = params.log.replace("\r", '');
			if (md5(stripNonAscii(params.log)) !== preppedReplay.loghash) {
				// Hashes don't match.

				// Someone else tried to upload a replay of the same battle,
				// while we were uploading this
				// ...pretend it was a success
				return 'success:' + fullid;
			}
		}

		if (password?.length > 31) {
			dispatcher.setHeader("HTTP/1.1", "403 Forbidden");
			return 'password must be 31 or fewer chars long';
		}

		const p1id = toID(preppedReplay.p1);
		const p2id = toID(preppedReplay.p2);
		const formatid = toID(preppedReplay.format);

		const privacy = preppedReplay.private ? 1 : 0;
		const {p1, p2, format, uploadtime, rating, inputlog} = preppedReplay;
		await replays.execute(
			"INSERT INTO ps_replays (id, p1, p2, format, p1id, p2id, formatid, uploadtime, private, rating, log, inputlog, `password`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE log = ?, inputlog = ?, rating = ?, private = ?, `password` = ?",
			[
				id, p1, p2, format,
				p1id, p2id, formatid,
				uploadtime, privacy, rating,
				params.log, inputlog, password,
				params.log, inputlog, rating,
				privacy, password,
			]
		);

		await prepreplays.deleteOne(`id = ? AND loghash = ?`, [id, preppedReplay.loghash]);

		return 'success:' + fullid;
	}
};

export default Replays;
