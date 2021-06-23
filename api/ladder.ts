/**
 * Ladder handling.
 * Ported by Mia. Originally by Zarel.
 * @author mia-pi-git
 */

import {time} from './session';
import {toID} from './server';
import {ladder} from "./tables";
import type {User} from './user';

export interface LadderEntry {
	entryid: number;
	formatid: string;
	userid: string;
	username: string;
	w: number;
	l: number;
	t: number;
	gxe: number;
	r: number;
	rd: number;
	sigma: number;
	rptime: number;
	rpr: number;
	rprd: number;
	rpsigma: number;
	rpdata: string;
	elo: number;
	col1: number;
	oldelo: number;
}

interface MatchElement {
	R: number;
	RD: number;
	score: number;
}

export interface FakeUser {
	name: string;
	id: string;
	rating?: LadderEntry;
	ratings?: LadderEntry[];
}

export class NTBBLadder {
	formatid: string;
	rplen: number;
	rpoffset: number;
	constructor(format: string) {
		this.formatid = toID(format);
		this.rplen = 24 * 60 * 60;
		this.rpoffset = 9 * 60 * 60;
	}
	getRP() {
		const rpnum = ((time() - this.rpoffset) / this.rplen) + 1;
		return rpnum * this.rplen + this.rpoffset;
	}
	nextRP(rp: number) {
		const rpnum = (rp / this.rplen);
		return (rpnum + 1) * this.rplen + this.rpoffset;
	}
	clearRating(name: string | User | FakeUser) {
		return ladder.updateOne({
			elo: 1000, col1: 0, w: 0, l: 0, t: 0,
		}, 'userid = ? AND formatid = ?', [toID(name), this.formatid]);
	}
	clearWL(name: User | string) {
		return ladder.updateOne({
			w: 0, l: 0, t: 0,
		}, 'userid = ? AND formatid = ?', [toID(name), this.formatid]);
	}
	async getRating(user: User | FakeUser, create = false) {
		if (!user.rating) {
			const data = await ladder.selectOne('*', 'userid = ? AND formatid = ?', [user.id, this.formatid]);

			if (!data) {
				if (!create) {
					return false;
				}
				const rp = this.getRP();
				const res = await ladder.insert({
					formatid: this.formatid, username: user.name, userid: user.id,
					rptime: rp, rpdata: '', col1: 0,
				});
				user.rating = {
					entryid: res.insertId,
					formatid: this.formatid,
					userid: user.id,
					username: user.name,
					r: 1500,
					rd: 130,
					sigma: 0,
					rpr: 1500,
					rprd: 130,
					rpsigma: 0,
					rptime: rp,
					rpdata: '',
					w: 0,
					l: 0,
					t: 0,
					gxe: 50,
					elo: 1000,
					col1: 0,
					oldelo: 0,
				};
				return user.rating;
			}
			user.rating = data;
		}
		return user.rating;
	}
	async getAllRatings(user: User | FakeUser) {
		if (!user.ratings) {
			const res = await ladder.selectAll('*', 'userid = ?', [user.id]);
			if (!res) {
				return false;
			}
			user.ratings = res;
			for (const row of user.ratings) {
				delete (row as any).rpdata;
			}
		}

		return true;
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
				res = await ladder.query(
					"SELECT * FROM (SELECT * FROM `ntbb_ladder` WHERE `formatid` = ? ORDER BY `elo` DESC LIMIT ?) AS `unusedalias` WHERE `userid` LIKE ? LIMIT ?",
					[this.formatid, prefix, limit, overfetch]
				);
			} else {
				res = await ladder.selectAll('*', 'formatid = ? ORDER BY elo DESC');
			}

			let j = 0;
			for (const row of res) {
				j++;
				// if ($row.col1 < 0 && $j > 50) break;
				const user: FakeUser = {
					name: row.username,
					id: row.userid,
					rating: row,
				};

				if (await this.update(user as FakeUser & {rating: LadderEntry})) {
					await this.saveRating(user);
					needUpdate = true;
				}

				delete (row as any).rpdata;
				top.push(row);
			}
		}

		return top;
	}
	clearAllRatings() {
		return ladder.deleteAll('formatid = ?', [this.formatid]);
	}

	async saveRating(user: User | FakeUser) {
		if (!user.rating) return false;
		const {w, l, t, r, rd, sigma, rptime, rpr, rprd, rpsigma, rpdata, gxe, col1, entryid} = user.rating;
		return !!(await ladder.update(entryid, {
			w, l, t, r, rd, sigma, rptime, rpr, rprd, rpsigma, rpdata, gxe, col1,
		}));
	}

	async update(
		user: (FakeUser | User) & {rating: LadderEntry},
		newM: MatchElement | false = false,
		newMelo = 1000,
		force = false
	) {
		let offset = 0;

		const rp = this.getRP();
		if (rp <= user.rating.rptime && !newM && !force) {
			return false;
		}

		let elo = user.rating.elo;

		const rating = new GlickoPlayer(user.rating.r, user.rating.rd);
		if (user.rating.rpdata) {
			let rpdata = user.rating.rpdata.split('##');
			if (rpdata.length > 1) offset = parseFloat(rpdata[1]);
			rating.m = JSON.parse(rpdata[0]);
			// var_export($rating->M);
		}

		if (rp > user.rating.rptime) {
			let i = 0;
			while (rp > user.rating.rptime) {
				i++;
				if (i > 1000) break;

				// decay
				if (elo >= 1400) {
					let decay = 0;
					if (rating.m.length > 5) {
						// user was very active
					} else if (rating.m) {
						// user was active
						decay = 0 + (elo - 1400) / 100;
					} else {
						// user was inactive
						decay = 1 + (elo - 1400) / 50;
					}
					switch (this.formatid) {
					case 'gen8randombattle':
					case 'gen8ou':
						break;
					default:
						decay -= 2;
						break;
					}
					if (decay > 0) elo -= decay;
				}

				rating.update();
				if (offset) {
					rating.rating += offset;
					offset = 0;
				}

				user.rating.rptime = this.nextRP(user.rating.rptime);
			}
			user.rating.r = rating.rating;
			user.rating.rd = rating.rd;
			user.rating.elo = elo;
		}

		if (!user.rating.col1) {
			user.rating.col1 = user.rating.w + user.rating.l + user.rating.t;
		}
		if (newM) {
			rating.m.push(newM);
			if (newM.score! > 0.99) {
				user.rating.w++;
			} else if (newM.score! < 0.01) {
				user.rating.l++;
			} else {
				user.rating.t++;
			}
			user.rating.col1++;
		}

		if (rating.m) {
			user.rating.rpdata = JSON.stringify(rating.m);
		} else {
			user.rating.rpdata = '';
		}

		rating.update();

		user.rating.rpr = rating.rating;
		user.rating.rprd = rating.rd;

		// $user.rating.gxe = round(100 / (1 + pow(10,((1500 - $rating->rating) * pi() / sqrt(3 * log(10)*log(10) * $rating->rd*$rating->rd + 2500 * (64 * pi()*pi() + 147 * log(10)*log(10)))))), 1);
		const exp = ((1500 - rating.rating) / 400 / Math.sqrt(1 + 0.0000100724 * (rating.rd * rating.rd + 130 * 130)));
		user.rating.gxe = Math.round(
			100 / (1 + Math.pow(10, exp))
		);

		// if ($newM) {
		// 	// compensate for Glicko2 bug: don't lose rating on win, don't gain rating on lose
		// 	if ($newM.score > .9 && $rating->rating < $oldrpr) {
		// 		$delta = $oldrpr - $rating->rating;
		// 		$offset += $delta;
		// 		$user.rating.rpr += $delta;
		// 	}
		// 	if ($newM.score < .1 && $rating->rating > $oldrpr) {
		// 		$delta = $oldrpr - $rating->rating;
		// 		$offset += $delta;
		// 		$user.rating.rpr += $delta;
		// 	}
		// }
		if (offset) {
			user.rating.rpdata += '##' + offset;
		}

		if (newM) {
			user.rating.oldelo = elo;

			let K = 50;
			if (elo < 1100) {
				if (newM.score! < 0.5) {
					K = 20 + (elo - 1000) * 30 / 100;
				} else if (newM.score! > 0.5) {
					K = 80 - (elo - 1000) * 30 / 100;
				}
			} else if (elo > 1300) {
				K = 40;
			}
			const E = 1 / (1 + Math.pow(10, (newMelo - elo) / 400));
			// console.log({K, score: newM.score, E, res: K * (newM.score - E), elo});
			elo += K * (newM.score! - E);

			if (elo < 1000) elo = 1000;

			user.rating.elo = elo;
		}

		return true;
	}
	async updateRating(
		p1: FakeUser | User,
		p2: FakeUser | User,
		p1score: number,
		p1M?: MatchElement,
		p2M?: MatchElement
	) {
		if (!p1.rating) await this.getRating(p1, true);
		if (!p2.rating) await this.getRating(p2, true);

		let p2score = 1 - p1score;
		if (p1score < 0) {
			p1score = 0;
			p2score = 0;
		}

		if (!p1M) {
			const p2rating = new GlickoPlayer(p2.rating!.r, p2.rating!.rd);
			p1M = p2rating.matchElement(p1score)[0];
		}
		if (!p2M) {
			const p1rating = new GlickoPlayer(p1.rating!.r, p1.rating!.rd);
			p2M = p1rating.matchElement(p2score)[0];
		}
		p1M.score = p1score;
		p2M.score = 1 - p1score;
		const p1Melo = p2.rating!.elo;
		const p2Melo = p1.rating!.elo;

		await this.update(p1 as (User | FakeUser) & {rating: LadderEntry}, p1M, p1Melo);
		await this.update(p2 as (User | FakeUser) & {rating: LadderEntry}, p2M, p2Melo);

		await this.saveRating(p1);
		await this.saveRating(p2);
	}
	static getUserData(username?: string): FakeUser | null {
		if (!username) username = '';
		const userid = toID(username);
		if (userid.length > 18 || !userid) return null;
		return {
			name: username, id: userid,
		};
	}
}

export class GlickoPlayer {
	rating: number;
	rd: number;

	readonly piSquared = Math.PI ** 2;
	readonly RDmax = 130.0;
	readonly RDmin = 25.0;
	c: number;
	readonly q = 0.00575646273;
	m: MatchElement[] = [];

	constructor(rating = 1500, rd = 130.0) {
		// Step 1
		this.rating = rating;
		this.rd = rd;
		this.c = Math.sqrt((this.RDmax * this.RDmax - this.RDmin * this.RDmin) / 365.0);
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

		if (m.length === 0) {
			const RD = Math.sqrt((this.rd * this.rd) + (this.c * this.c));
			return {R: this.rating, RD};
		}

		let A = 0.0;
		let d2 = 0.0;
		for (const cur of m) {
			let E = this.E(this.rating, cur.R, cur.RD);
			let g = this.g(cur.RD);

			d2 +=  (g * g * E * (1 - E));

			A += g * (cur.score - E);
		}

		d2 = 1.0 / this.q / this.q / d2;

		let RD = 1.0 / Math.sqrt(1.0 / (this.rd * this.rd) + 1.0 / d2);
		let R = this.rating + this.q * (RD * RD) * A;

		if (RD > this.RDmax) {
			RD = this.RDmax;
		}

		if (RD < this.RDmin) {
			RD = this.RDmin;
		}

		return {R, RD};
	}

	g(RD: number) {
		return 1.0 / Math.sqrt(1.0 + 3.0 * this.q * this.q * RD * RD / this.piSquared);
	}

	E(R: number, rJ: number, rdJ: number) {
		return 1.0 / (1.0 + Math.pow(10.0, -this.g(rdJ) * (R - rJ) / 400.0));
	}
}
