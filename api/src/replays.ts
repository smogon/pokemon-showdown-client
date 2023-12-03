/**
 * Code for uploading and managing replays.
 *
 * Ported to TypeScript by Annika and Mia.
 */
import {Session} from './user';
import {ActionError, ActionContext} from './server';
import {toID, time, stripNonAscii, md5} from './utils';
import {replayPrep, replayPlayers, replays} from './tables';
import {Config} from './config-loader';
import {SQL} from './database';

// must be a type and not an interface to qualify as an SQLRow
export type ReplayRow = {
	id: string;
	format: string;
	/** player names delimited by `,`; starting with `!` denotes that player wants the replay private */
	players: string;
	log: string;
	inputlog: string | null;
	uploadtime: number;
	views: number;
	formatid: string;
	rating: number | null;
	/**
	 * 0 = public
	 * 1 = private (with or without password)
	 * 2 = NOT USED; ONLY USED IN PREPREPLAY
	 * 3 = deleted
	 */
	private: 0 | 1 | 2 | 3;
	password: string | null;
};
type Replay = Omit<ReplayRow, 'formatid' | 'players' | 'password' | 'views'> & {
	players: string[];
	views?: number;
	password?: string | null;
};

export const Replays = new class {
	readonly passwordCharacters = '0123456789abcdefghijklmnopqrstuvwxyz';
	// async prep(params: {[k: string]: unknown}) {
	// 	const id = ('' + params.id).toLowerCase().replace(/[^a-z0-9-]+/g, '');
	// 	let isPrivate: 0 | 1 | 2 = params.hidden ? 1 : 0;
	// 	if (params.hidden === 2) isPrivate = 2;
	// 	let p1 = Session.wordfilter(`${params.p1}`);
	// 	let p2 = Session.wordfilter(`${params.p2}`);
	// 	if (isPrivate) {
	// 		p1 = `!${p1}`;
	// 		p2 = `!${p2}`;
	// 	}
	// 	const {loghash, format} = params as Record<string, string>;
	// 	let rating = Number(params.rating);
	// 	if (params.serverid !== Config.mainserver) rating = 0;
	// 	const inputlog = params.inputlog || null;
	// 	const out = await replayPrep.replace({
	// 		id, loghash,
	// 		players: `${p1},${p2}`,
	// 		format,
	// 		uploadtime: time(),
	// 		rating,
	// 		inputlog: Array.isArray(inputlog) ? inputlog.join('\n') : inputlog as string,
	// 		private: isPrivate,
	// 	});
	// 	return !!out.affectedRows;
	// }

	// /**
	//  * Not a direct upload; you should call prep first.
	//  *
	//  * The intended use is that the sim server sends `prepreplay` directly
	//  * to here, and then the client sends `upload`. Convoluted mostly in
	//  * case of firewalls between the sim server and the loginserver.
	//  */
	// async upload(params: {[k: string]: string | undefined}, context: ActionContext) {
	// 	let id = ('' + params.id).toLowerCase().replace(/[^a-z0-9-]+/g, '');
	// 	if (!id) throw new ActionError('Battle ID needed.');
	// 	const preppedReplay = await replayPrep.get(id);
	// 	const replay = await replays.get(id, ['id', 'private', 'password']);
	// 	if (!preppedReplay) {
	// 		if (replay) {
	// 			if (replay.password) {
	// 				id += '-' + replay.password + 'pw';
	// 			}
	// 			return 'success:' + id;
	// 		}
	// 		if (!/^[a-z0-9]+-[a-z0-9]+-[0-9]+$/.test(id)) {
	// 			return 'invalid id';
	// 		}
	// 		return 'not found';
	// 	}
	// 	let password: string | null = null;
	// 	if (preppedReplay.private && preppedReplay.private !== 2) {
	// 		if (replay?.password) {
	// 			password = replay.password;
	// 		} else if (!replay?.private) {
	// 			password = this.generatePassword();
	// 		}
	// 	}
	// 	if (typeof params.password === 'string') password = params.password;

	// 	let fullid = id;
	// 	if (password) fullid += '-' + password + 'pw';

	// 	let log = params.log as string;
	// 	if (md5(stripNonAscii(log)) !== preppedReplay.loghash) {
	// 		log = log.replace('\r', '');
	// 		if (md5(stripNonAscii(log)) !== preppedReplay.loghash) {
	// 			// Hashes don't match.

	// 			// Someone else tried to upload a replay of the same battle,
	// 			// while we were uploading this
	// 			// ...pretend it was a success
	// 			return 'success:' + fullid;
	// 		}
	// 	}

	// 	if (password && password.length > 31) {
	// 		context.setHeader('HTTP/1.1', '403 Forbidden');
	// 		return 'password must be 31 or fewer chars long';
	// 	}

	// 	const formatid = toID(preppedReplay.format);

	// 	const privacy = preppedReplay.private ? 1 : 0;
	// 	const {players, format, uploadtime, rating, inputlog} = preppedReplay;
	// 	await replays.insert({
	// 		id, players, format,
	// 		formatid, uploadtime,
	// 		private: privacy, rating, log,
	// 		inputlog, password,
	// 	}, SQL`ON DUPLICATE KEY UPDATE log = ${params.log as string},
	// 		inputlog = ${inputlog}, rating = ${rating},
	// 		private = ${privacy}, \`password\` = ${password}`);

	// 	await replayPrep.deleteOne()`WHERE id = ${id} AND loghash = ${preppedReplay.loghash}`;

	// 	return 'success:' + fullid;
	// }

	toReplay(this: void, row: ReplayRow) {
		const replay: Replay = {
			...row,
			players: row.players.split(',').map(player => player.startsWith('!') ? player.slice(1) : player),
		};
		if (!replay.password && replay.private === 1) replay.private = 2;
		return replay;
	}
	toReplays(this: void, rows: ReplayRow[]) {
		return rows.map(row => Replays.toReplay(row));
	}

	toReplayRow(this: void, replay: Replay) {
		const formatid = toID(replay.format);
		const replayData: ReplayRow = {
			password: null,
			views: 0,
			...replay,
			players: replay.players.join(','),
			formatid,
		};
		if (replayData.private === 1 && !replayData.password) {
			replayData.password = Replays.generatePassword();
		} else {
			if (replayData.private === 2) replayData.private = 1;
			replayData.password = null;
		}
		return replayData;
	}

	async add(replay: Replay) {
		const fullid = replay.id + (replay.password ? `-${replay.password}pw` : '');

		// obviously upsert exists but this is the easiest way when multiple things need to be changed
		const replayData = this.toReplayRow(replay);
		try {
			await replays.insert(replayData);
			for (const playerName of replay.players) {
				await replayPlayers.insert({
					playerid: toID(playerName),
					formatid: replayData.formatid,
					id: replayData.id,
					rating: replayData.rating,
					uploadtime: replayData.uploadtime,
					private: replayData.private,
					password: replayData.password,
					format: replayData.format,
					players: replayData.players,
				});
			}
		} catch {
			await replays.update(replay.id, {
				log: replayData.log,
				inputlog: replayData.inputlog,
				rating: replayData.rating,
				private: replayData.private,
				password: replayData.password,
			});
			await replayPlayers.updateAll({
				rating: replayData.rating,
				private: replayData.private,
				password: replayData.password,
			})`WHERE replayid = ${replay.id}`;
		}
		return fullid;
	}

	async get(id: string): Promise<Replay | null> {
		const replayData = await replays.get(id);
		if (!replayData) return null;

		await replays.update(replayData.id, {views: SQL`views + 1`});

		return this.toReplay(replayData);
	}

	async edit(replay: Replay) {
		const replayData = this.toReplayRow(replay);
		await replays.update(replay.id, {private: replayData.private, password: replayData.password});
	}

	generatePassword(length = 31) {
		let password = '';
		for (let i = 0; i < length; i++) {
			password += this.passwordCharacters[Math.floor(Math.random() * this.passwordCharacters.length)];
		}

		return password;
	}

	search(args: {
		page?: number; isPrivate?: boolean; byRating?: boolean;
		format?: string; username?: string; username2?: string;
	}): Promise<Replay[]> {
		const page = args.page || 0;
		if (page > 100) return Promise.resolve([]);

		let limit1 = 50 * (page - 1);
		if (limit1 < 0) limit1 = 0;
		const paginate = SQL`LIMIT 51 OFFSET ${limit1}`;

		const isPrivate = args.isPrivate ? 1 : 0;

		const format = args.format ? toID(args.format) : null;

		if (args.username) {
			const order = args.byRating ? SQL`ORDER BY rating DESC` : SQL`ORDER BY uploadtime DESC`;
			const userid = toID(args.username);
			if (args.username2) {
				const userid2 = toID(args.username2);
				if (format) {
					return replays.query()`SELECT 
							p1.uploadtime AS uploadtime, p1.id AS id, p1.format AS format, p1.players AS players, 
							p1.rating AS rating, p1.password AS password, p1.private AS private 
						FROM replayplayers p1 INNER JOIN replayplayers p2 ON p2.id = p1.id 
						WHERE p1.playerid = ${userid} AND p1.formatid = ${format} AND p1.private = ${isPrivate}
							AND p2.playerid = ${userid2} 
						${order} ${paginate};`.then(this.toReplays);
				} else {
					return replays.query()`SELECT 
							p1.uploadtime AS uploadtime, p1.id AS id, p1.format AS format, p1.players AS players, 
							p1.rating AS rating, p1.password AS password, p1.private AS private 
						FROM replayplayers p1 INNER JOIN replayplayers p2 ON p2.id = p1.id 
						WHERE p1.playerid = ${userid} AND p1.private = ${isPrivate}
							AND p2.playerid = ${userid2} 
						${order} ${paginate};`.then(this.toReplays);
				}
			} else {
				if (format) {
					return replays.query()`SELECT uploadtime, id, format, players, rating, private, password FROM replayplayers 
						WHERE playerid = ${userid} AND formatid = ${format} AND "private" = ${isPrivate} 
						${order} ${paginate};`.then(this.toReplays);
				} else {
					return replays.query()`SELECT uploadtime, id, format, players, rating, private, password FROM replayplayers 
						WHERE playerid = ${userid} AND private = ${isPrivate} 
						${order} ${paginate};`.then(this.toReplays);
				}
			}
		}

		if (args.byRating) {
			return replays.query()`SELECT uploadtime, id, format, players, rating, private, password 
				FROM replays 
				WHERE private = ${isPrivate} AND formatid = ${format} ORDER BY rating DESC ${paginate}`
				.then(this.toReplays);
		} else {
			return replays.query()`SELECT uploadtime, id, format, players, rating, private, password 
				FROM replays 
				WHERE private = ${isPrivate} AND formatid = ${format} ORDER BY uploadtime DESC ${paginate}`
				.then(this.toReplays);
		}
	}

	fullSearch(term: string, page = 0): Promise<Replay[]> {
		if (page > 0) return Promise.resolve([]);

		const patterns = term.split(',').map(subterm => {
			const escaped = subterm.replace(/%/g, '\\%').replace(/_/g, '\\_');
			return `%${escaped}%`;
		});
		if (patterns.length !== 1 && patterns.length !== 2) return Promise.resolve([]);

		const secondPattern = patterns.length >= 2 ? SQL`AND log LIKE ${patterns[1]} ` : undefined;

		return replays.query()`SELECT /*+ MAX_EXECUTION_TIME(10000) */ 
			uploadtime, id, format, players, rating FROM ps_replays 
			WHERE private = 0 AND log LIKE ${patterns[0]} ${secondPattern}
			ORDER BY uploadtime DESC LIMIT 10;`.then(this.toReplays);
	}

	recent() {
		return replays.selectAll(
			SQL`uploadtime, id, format, players, rating`
		)`WHERE private = 0 ORDER BY uploadtime DESC LIMIT 50`.then(this.toReplays);
	}
};

export default Replays;
