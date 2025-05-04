/**
 * Ladder handling.
 *
 * By Zarel. Ported to TypeScript by Mia.
 * @author Zarel, mia-pi-git
 */

import { toID, time } from './utils';
import { ladder } from './tables';

/** length of a rating period in days (used for Glicko and Elo decay).
 *  Glickman recommends 5-10 games per rating period */
const RP_LENGTH_DAYS = 1;
/** length of a rating period in seconds */
const RP_LENGTH = 24 * 60 * 60 * RP_LENGTH_DAYS;
/** time in UTC rating periods roll over, in seconds (9am UTC, or 4am Chicago Time) */
const RP_OFFSET = 9 * 60 * 60;

const GLICKO_RD_MAX = 130.0;
const GLICKO_RD_MIN = 25.0;

// this solves for going from min RD to max RD in 365 days
const GLICKO_C = Math.sqrt((GLICKO_RD_MAX ** 2 - GLICKO_RD_MIN ** 2) / (365.0 / RP_LENGTH_DAYS));

export interface LadderEntry {
	entryid: number;
	formatid: string;
	userid: string;
	username: string;
	/** wins */
	w: number;
	/** losses */
	l: number;
	/** ties */
	t: number;
	/** estimate of your win chance against a random ladder player */
	gxe: number;
	/** Glicko-1 rating */
	r: number;
	/** Glicko-1 rating deviation */
	rd: number;
	/** @deprecated when we used Glicko-2, this was volatility (currently unused) */
	sigma: number;
	/** last updated (to track rating decay) */
	rptime: number;
	/** estimated Glicko rating for next rating period */
	rpr: number;
	/** estimated Glicko rating deviation for next rating period */
	rprd: number;
	/** @deprecated when we used Glicko-2, this was volatility next period (currently unused) */
	rpsigma: number;
	/** games played since last rating period, for Glicko-1 updates */
	rpdata: string;
	/** Elo. ours starts/floors at 1000 with a scaling K factor */
	elo: number;
	/** @deprecated unused, intended as futureproofing (look, we used MySQL...) */
	col1: number;
	/** Elo before last rating period update */
	oldelo: number;
	/** when did this user first play this ladder? */
	first_played: number;
	/** when did this user most recently play this ladder? */
	last_played: number;
}

interface MatchElement {
	R: number;
	RD: number;
	score: number;
}

export class Ladder {
	formatid: string;
	constructor(format: string) {
		this.formatid = toID(format);
	}
	getRP() {
		const rpnum = Math.trunc((time() - RP_OFFSET) / RP_LENGTH) + 1;
		return rpnum * RP_LENGTH + RP_OFFSET;
	}
	nextRP(rp: number) {
		const rpnum = Math.trunc(rp / RP_LENGTH);
		return (rpnum + 1) * RP_LENGTH + RP_OFFSET;
	}
	clearRating(name: string) {
		return ladder.updateOne({
			elo: 1000, col1: 0, w: 0, l: 0, t: 0,
		})`WHERE userid = ${toID(name)} AND formatid = ${this.formatid}`;
	}
	clearWL(name: string) {
		return ladder.updateOne({
			w: 0, l: 0, t: 0,
		})`WHERE userid = ${toID(name)} AND formatid = ${this.formatid}`;
	}
	getRating(user: string): Promise<LadderEntry | null>;
	getRating(user: string, create: true): Promise<LadderEntry>;
	async getRating(user: string, create = false): Promise<LadderEntry | null> {
		const userid = toID(user);
		const data = await ladder.selectOne()`WHERE userid = ${userid} AND formatid = ${this.formatid}`;
		if (data) return data;

		if (!create) return null;

		const rp = this.getRP();
		const now = time();
		const res = await ladder.insert({
			formatid: this.formatid, username: user, userid,
			rptime: rp, rpdata: '', col1: 0,
			first_played: now, last_played: now,
		});
		return {
			entryid: res.insertId,
			formatid: this.formatid,
			userid,
			username: user,
			r: 1500, rd: 130, sigma: 0,
			rpr: 1500, rprd: 130, rpsigma: 0,
			rptime: rp,
			rpdata: '',
			w: 0, l: 0, t: 0, gxe: 50,
			elo: 1000,
			col1: 0,
			oldelo: 0,
			first_played: now,
			last_played: now,
		};
	}
	static async getAllRatings(user: string) {
		const res = await ladder.selectAll()`WHERE userid = ${toID(user)}`;
		if (!res) return [];

		for (const row of res) delete (row as any).rpdata;
		return res;
	}
	async getTop(prefix: string | null = null) {
		let needUpdate = true;
		let top = [];

		let i = 0;
		while (needUpdate) {
			i++;
			if (i > 2) break;

			needUpdate = false;
			top = [];
			let res: LadderEntry[];

			const limit = 500;
			// if (isset($GLOBALS.curuser) && $GLOBALS.curuser.group != 0) {
			// 	$limit = 1000;
			// }

			if (prefix) {
				// The ladder database can't really handle large queries which aren't indexed, so we instead perform
				// an indexed query for additional rows and filter them down further. This is obviously *not* guaranteed
				// to return exactly $limit results, but should be 'good enough' in practice.
				const overfetch = limit * 2;
				res = await ladder.query()`
					WITH max_elo AS (
						SELECT MAX(elo) AS max_elo FROM ntbb_ladder WHERE formatid = ${this.formatid}
					),
					rpr_filtered AS (
							SELECT * FROM ntbb_ladder WHERE
								((SELECT max_elo FROM max_elo) <= 1500 OR rprd <= 100)
								AND formatid = ${this.formatid}
					)
					SELECT * FROM
						(SELECT * FROM rpr_filtered WHERE formatid = ${this.formatid} ORDER BY elo DESC LIMIT ${limit})
						AS unusedalias WHERE userid LIKE ${prefix} LIMIT ${overfetch}`;
			} else {
				res = await ladder.query()`
					WITH max_elo AS (
						SELECT MAX(elo) AS max_elo FROM ntbb_ladder WHERE formatid = ${this.formatid}
					),
					rpr_filtered AS (
							SELECT * FROM ntbb_ladder WHERE
								((SELECT max_elo FROM max_elo) <= 1500 OR rprd <= 100)
								AND formatid = ${this.formatid}
					)
					SELECT * FROM rpr_filtered ORDER BY elo DESC LIMIT ${limit}`;
			}

			for (const row of res) {
				if (this.update(row)) {
					await this.saveRating(row);
					needUpdate = true;
				}

				delete (row as any).rpdata;
				top.push(row);
			}
		}

		return top;
	}
	clearAllRatings() {
		return ladder.deleteAll()`WHERE formatid = ${this.formatid}`;
	}

	async saveRating(rating: LadderEntry) {
		const {
			w, l, t, r, rd, sigma,
			rptime, rpr, elo, rprd,
			rpsigma, rpdata, gxe,
			col1, entryid,
		} = rating;
		return !!(await ladder.update(entryid, {
			elo, w, l, t, r, rd, sigma, rptime, rpr, rprd, rpsigma, rpdata, gxe, col1, last_played: time(),
		}));
	}

	update(rating: LadderEntry, newM: MatchElement | null = null, newMelo = 1000, force = false) {
		let offset = 0;

		const rp = this.getRP();
		if (rp <= rating.rptime && !newM && !force) {
			return false;
		}

		let elo = rating.elo;

		const glicko = new GlickoPlayer(rating.r, rating.rd);
		if (rating.rpdata) {
			const rpdata = rating.rpdata.split('##');
			if (rpdata.length > 1) offset = parseFloat(rpdata[1]);
			glicko.m = JSON.parse(rpdata[0]);
		}

		if (rp > rating.rptime) {
			let i = 0;
			while (rp > rating.rptime) {
				i++;
				if (i > 1000) break;

				// decay
				if (elo >= 1400) {
					let decay = 0;
					if (glicko.m.length > 5) {
						// user was very active
					} else if (glicko.m) {
						// user was active
						decay = 0 + (elo - 1400) / 100;
					} else {
						// user was inactive
						decay = 1 + (elo - 1400) / 50;
					}
					switch (this.formatid) {
					case 'gen9randombattle':
					case 'gen9ou':
						break;
					default:
						decay -= 2;
						break;
					}
					if (decay > 0) elo -= decay;
				}

				glicko.update();
				if (offset) {
					glicko.rating += offset;
					offset = 0;
				}

				rating.rptime = this.nextRP(rating.rptime);
			}
			rating.r = glicko.rating;
			rating.rd = glicko.rd;
			rating.elo = elo;
		}

		if (!rating.col1) {
			rating.col1 = rating.w + rating.l + rating.t;
		}
		if (newM) {
			glicko.m.push(newM);
			if (newM.score > 0.99) {
				rating.w++;
			} else if (newM.score < 0.01) {
				rating.l++;
			} else {
				rating.t++;
			}
			rating.col1++;
		}

		if (glicko.m) {
			rating.rpdata = JSON.stringify(glicko.m);
		} else {
			rating.rpdata = '';
		}

		glicko.update();

		rating.rpr = glicko.rating;
		rating.rprd = glicko.rd;

		const exp = ((1500 - glicko.rating) / 400 / Math.sqrt(1 + 0.0000100724 * (glicko.rd * glicko.rd + 130 * 130)));
		rating.gxe = Number((
			100 / (1 + (10 ** exp))
		).toFixed(1));

		// if ($newM) {
		// 	// compensate for Glicko2 bug: don't lose rating on win, don't gain rating on lose
		// 	if ($newM.score > .9 && $rating->rating < $oldrpr) {
		// 		$delta = $oldrpr - $rating->rating;
		// 		$offset += $delta;
		// 		$rating.rpr += $delta;
		// 	}
		// 	if ($newM.score < .1 && $rating->rating > $oldrpr) {
		// 		$delta = $oldrpr - $rating->rating;
		// 		$offset += $delta;
		// 		$rating.rpr += $delta;
		// 	}
		// }
		if (offset) {
			rating.rpdata += `##${offset}`;
		}

		if (newM) {
			rating.oldelo = elo;

			let K = 50;
			if (elo < 1100) {
				if (newM.score < 0.5) {
					K = 20 + (elo - 1000) * 30 / 100;
				} else if (newM.score > 0.5) {
					K = 80 - (elo - 1000) * 30 / 100;
				}
			} else if (elo > 1300) {
				K = 40;
			}
			const E = 1 / (1 + (10 ** ((newMelo - elo) / 400)));
			elo += K * (newM.score - E);

			if (elo < 1000) elo = 1000;

			rating.elo = elo;
		}

		return true;
	}
	async addMatch(player1: string, player2: string, p1score: number) {
		const p1 = await this.getRating(player1, true);
		const p2 = await this.getRating(player2, true);

		let p2score = 1 - p1score;
		if (p1score < 0) [p1score, p2score] = [0, 0];

		const p1M = new GlickoPlayer(p2.r, p2.rd).matchElement(p1score)[0];
		const p2M = new GlickoPlayer(p1.r, p1.rd).matchElement(p2score)[0];
		const p1Melo = p2.elo;
		const p2Melo = p1.elo;
		this.update(p1, p1M, p1Melo);
		this.update(p2, p2M, p2Melo);

		void this.saveRating(p1);
		void this.saveRating(p2);
		return [p1, p2];
	}
	static isValidPlayer(username: string | undefined): string | null {
		const userid = toID(username);
		if (userid.length > 18 || !userid) return null;
		return userid;
	}
}

export class GlickoPlayer {
	rating: number;
	rd: number;

	readonly piSquared = Math.PI ** 2;
	readonly q = 0.00575646273;
	m: MatchElement[] = [];

	constructor(rating = 1500, rd = 130.0) {
		// Step 1
		this.rating = rating;
		this.rd = rd;
	}

	addWin(otherPlayer: GlickoPlayer) {
		this.m = otherPlayer.matchElement(1);
	}

	addLoss(otherPlayer: GlickoPlayer) {
		this.m = otherPlayer.matchElement(0);
	}

	addDraw(otherPlayer: GlickoPlayer) {
		this.m = otherPlayer.matchElement(0.5);
	}

	update() {
		const results = this.addMatches(this.m);
		this.rating = results.R;
		this.rd = results.RD;
		this.m = [];
	}

	matchElement(score: number) {
		return [{
			R: this.rating,
			RD: this.rd,
			score,
		}];
	}

	addMatches(m: MatchElement[]) {
		// This is where the Glicko rating calculation actually happens

		// Follow along the steps using: http://www.glicko.net/glicko/glicko.pdf

		let RD = Math.sqrt((this.rd ** 2) + (GLICKO_C ** 2));
		if (RD > GLICKO_RD_MAX) {
			RD = GLICKO_RD_MAX;
		}
		if (m.length === 0) {
			return { R: this.rating, RD };
		}

		let A = 0.0;
		let d2 = 0.0;
		for (const cur of m) {
			const E = this.E(this.rating, cur.R, cur.RD);
			const g = this.g(cur.RD);

			d2 += (g * g * E * (1 - E));

			A += g * (cur.score - E);
		}

		d2 = 1.0 / this.q / this.q / d2;

		RD = 1.0 / Math.sqrt(1.0 / (RD * RD) + 1.0 / d2);
		const R = this.rating + this.q * (RD ** 2) * A;

		if (RD > GLICKO_RD_MAX) {
			RD = GLICKO_RD_MAX;
		}

		if (RD < GLICKO_RD_MIN) {
			RD = GLICKO_RD_MIN;
		}

		return { R, RD };
	}

	g(RD: number) {
		return 1.0 / Math.sqrt(1.0 + 3.0 * (this.q ** 2) * (RD ** 2) / this.piSquared);
	}

	E(R: number, rJ: number, rdJ: number) {
		return 1.0 / (1.0 + (10.0 ** (-this.g(rdJ) * (R - rJ) / 400.0)));
	}
}
