/**
 * User handling - represents the current user's PS session.
 * Handles authentication, renaming, etc.
 * (a Session instance is equivalent to $curuser on the client)
 * By Mia.
 * @author mia-pi-git
 */
import * as bcrypt from 'bcrypt';
import {Config} from './config-loader';
import * as crypto from 'crypto';
import {ActionError, Dispatcher} from './dispatcher';
import * as gal from 'google-auth-library';
import {toID} from './server';
import {ladder, loginthrottle, sessions, users, usermodlog} from './tables';
import type {User} from './user';

const SID_DURATION = 2 * 7 * 24 * 60 * 60;
const LOGINTIME_INTERVAL = 24 * 60 * 60;
const GAL_CLIENT_ID = '912270888098-jjnre816lsuhc5clj3vbcn4o2q7p4qvk.apps.googleusercontent.com';

export function time() {
	// php has this with unix seconds. so we have to as well.
	// for legacy reasons. Yes, I hate it too.
	return Math.round(Date.now() / 1000);
}

export class Session {
	sidhash = '';
	dispatcher: Dispatcher;
	session = 0;
	constructor(dispatcher: Dispatcher) {
		this.dispatcher = dispatcher;
	}
	getSid() {
		if (this.sidhash) return this.sidhash;
		const cached = this.dispatcher.cookies.get('sid');
		if (cached) {
			const [, sessionId, sid] = cached.split(',');
			this.sidhash = sid;
			this.session = parseInt(sessionId, 10);
			return this.sidhash;
		}
		return this.setSid();
	}
	getName() {
		return this.dispatcher.cookies.get('showdown_username') || this.dispatcher.user.name;
	}
	makeSid() {
		if (Config.makeSid) return Config.makeSid.call(this);
		return new Promise((resolve, reject) => {
			crypto.randomBytes(24, (err, buf) => {
				if (err) return reject(err);
				resolve(buf.toString('hex'));
			});
		});
	}
	async setSid() {
		if (!this.sidhash) {
			this.sidhash = await this.makeSid();
		}
		this.updateCookie();
		return this.sidhash;
	}
	deleteCookie() {
		this.dispatcher.setHeader(`Set-Cookie`, [
			`sid=; Max-Age=0; Domain=${Config.routes.root}; Path=/; Secure; SameSite=None`,
		]);
	}
	async getRecentRegistrationCount(period: number) {
		const ip = this.dispatcher.getIp();
		const timestamp = time() - period;
		const rows = await users.database.get(
			"SELECT COUNT(*) AS `registrationcount` FROM `ntbb_users` WHERE `ip` = ? AND `registertime` > ?",
			[ip, timestamp]
		);
		if (!rows) return 0;
		return rows['registrationcount'];
	}
	async addUser(username: string, password: string) {
		const hash = await bcrypt.hash(password, Config.passwordSalt);
		const userid = toID(username);
		const exists = await users.get(['userid'], toID(username));
		if (exists) return null;
		const ip = this.dispatcher.getIp();

		const result = await users.insert({
			userid, username, passwordhash: hash, email: null, registertime: time(), ip,
		});

		if (!result.affectedRows) {
			throw new Error(`User could not be created. (${userid}, ${ip}`);
		}
		return this.login(username, password);
	}
	async login(name: string, pass: string) {
		const curTime = time();
		this.logout();
		const userid = toID(name);
		const info = await users.get('*', userid);
		if (!info) {
			// unregistered. just do the thing
			return this.dispatcher.user;
		}
		// previously, there was a case for banstate here in the php.
		// this is not necessary, as getAssertion handles that. Proceed to verification.
		const verified = await this.passwordVerify(name, pass);
		if (!verified) {
			throw new ActionError(`Wrong password.`);
		}
		const timeout = (curTime + SID_DURATION);
		const ip = this.dispatcher.getIp();
		const sidhash = await this.getSid();
		const res = await sessions.insert({userid, sid: sidhash, time: time(), timeout, ip});
		this.sidhash = sidhash;
		this.session = res.insertId || 0;
		this.dispatcher.user.login(name);
		this.updateCookie();
		return this.dispatcher.user;
	}
	async logout() {
		if (!this.session) return false;
		await sessions.delete(this.session);
		this.sidhash = '';
		this.session = 0;
		this.deleteCookie();
		this.dispatcher.user.logout();
	}
	updateCookie() {
		const name = this.getName();
		if (toID(name) === 'guest') return;
		if (!this.sidhash) {
			return this.deleteCookie();
		}
		const rawsid = encodeURIComponent([name, this.session, this.sidhash].join(','));
		this.dispatcher.setHeader(
			'Set-Cookie',
			`sid=${rawsid}; Max-Age=31363200; Domain=${Config.routes.root}; Path=/; Secure; SameSite=None`
		);
	}
	async getAssertion(
		userid: string,
		challengekeyid: number = -1,
		user: User | null,
		challenge: string = '',
		challengeprefix: string = ''
	) {
		if (userid.startsWith('guest')) {
			return ';;Your username cannot start with \'guest\'.';
		} else if (userid.length > 18) {
			return ';;Your username must be less than 19 characters long.';
		} else if (!Session.isUseridAllowed(userid)) {
			return ';;Your username contains disallowed text.';
		}
		let data = '';
		const ip = this.dispatcher.getIp();
		let forceUsertype: string | false = false;
		if (!user) user = this.dispatcher.user;
		if (ip.includes(Config.autolockip) || Config.autolockip?.includes(ip)) {
			forceUsertype = '5';
		}
		let userType = '';
		const userData = await user.getData();
		const {banstate, registertime: regtime} = userData;
		const server = this.dispatcher.getServer();
		const serverHost = server?.server || "sim3.psim.us";

		if (user.id === userid && user.loggedin) {
			// already logged in
			userType = '2';
			if (Config.sysops?.includes(user.id)) {
				userType = '3';
			} else {
				const customType = Config.getUserType?.call(this, user, banstate, server);
				if (forceUsertype) {
					userType = forceUsertype;
				} else if (customType) {
					userType = customType;
				} else if (banstate <= -10) {
					userType = '4';
				} else if (banstate >= 100) {
					return ';;Your username is no longer available.';
				} else if (banstate >= 40) {
					userType = '2';
				} else if (banstate >= 30) {
					userType = '6';
				} else if (banstate >= 20) {
					userType = '5';
				} else if (banstate === 0) {
					// should we update autoconfirmed status? check to see if it's been long enough
					if (regtime && time() - regtime > (7 * 24 * 60 * 60)) {
						const ladders = await ladder.selectOne('formatid', 'userid = ? AND w != 0', [userid]);
						if (ladders) {
							userType = '4';
							void users.update(userid, {banstate: -10});
						}
					}
				}
			}
			const logintime = userData.logintime;
			if (!logintime || time() - logintime > LOGINTIME_INTERVAL) {
				await users.update(userid, {logintime: time(), loginip: ip});
			}
			data = user.id + ',' + userType + ',' + time() + ',' + serverHost;
		} else {
			if (userid.length < 1 || !/[a-z]/.test(userid)) {
				return ';;Your username must contain at least one letter.';
			}
			const userstate = await users.get('*', userid);
			if (userstate) {
				if (userstate.banstate >= 100 || ((userstate as any).password && userstate.nonce)) {
					return ';;Your username is no longer available.';
				}
				if (userstate.email?.endsWith('@')) {
					return ';;@gmail';
				}
				return ';';
			} else {
				// Unregistered username.
				userType = '1';
				if (forceUsertype) userType = forceUsertype;
				data = user + ',' + userType + ',' + time() + ',' + serverHost;
				this.updateCookie();
			}
		}
		let splitChallenge: string[] = [];
		for (const delim of [';', '%7C', '|']) {
			splitChallenge = challenge.split(delim);
			if (splitChallenge.length > 1) break;
		}
		let challengetoken;
		if (splitChallenge.length > 1) {
			challengekeyid = parseInt(splitChallenge[0], 10);
			challenge = splitChallenge[1];
			if (splitChallenge[2] && !challengetoken) challengetoken = splitChallenge[2];
		}

		if (!toID(challenge)) {
			// Bogus challenge.
			return ';;Corrupt challenge';
		}
		if (challengekeyid < 1) {
			return ';;This server is requesting an invalid login key. This probably means that either you are not connected to a server, or the server is set up incorrectly.';
		} else if (Config.compromisedkeys?.includes(challengekeyid)) {
			// Compromised keys - no longer supported.
			return `;;This server is using login key ${challengekeyid}, which is no longer supported. Please tell the server operator to update their config.js file.`;
		} else if (!Config.privatekeys?.[challengekeyid]) {
			// Bogus key id.
			return ';;Unknown key ID';
		} else {
			// Include the challenge in the assertion.
			data = (challengeprefix || "") + challenge + ',' + data;
		}
		this.updateCookie();

		if (Config.validateassertion) {
			data = Config.validateassertion.call(this, challenge, user, data);
		}

		const sign = crypto.createSign('RSA-SHA1');
		sign.update(data);
		sign.end();
		const sig = sign.sign(Config.privatekeys[challengekeyid], 'hex');
		return data + ';' + sig;
	}
	static isUseridAllowed(userid: string) {
		const disallowed = [
			...(Config.bannedTerms || []),
			'nigger', 'nigga', 'faggot',
			/(lol|ror)icon/, 'lazyafrican',
			'tranny',
		];
		for (const term of disallowed) {
			if (
				(typeof term === 'object' ? term.test(userid) : userid.includes(term))
			) {
				return false;
			}
		}
		return true;
	}
	static wordfilter(user: string) {
		const disallowed = [
			...(Config.bannedTerms || []),
			'nigger', 'nigga', 'faggot',
			/(lol|ror)icon/, 'lazyafrican',
			'tranny',
		];
		for (const term of disallowed) {
			user = user.replace(term, '*');
		}
		return user;
	}
	async changePassword(name: string, pass: string) {
		const userid = toID(name);

		const userData = await users.get('*', userid);
		if (!userData) return false;

		const entry = "Password changed from: " + userData.passwordhash;
		await usermodlog.insert({
			userid, actorid: userid, date: time(), ip: this.dispatcher.getIp(), entry,
		});
		const passwordhash = await bcrypt.hash(pass, Config.passwordSalt);
		await users.update(userid, {
			passwordhash, nonce: null,
		});
		await sessions.deleteOne('userid = ?', [userid]);
		if (this.dispatcher.user.id === userid) {
			await this.login(name, pass);
		}
		return true;
	}
	async passwordVerify(name: string, pass: string) {
		const ip = this.dispatcher.getIp();
		const userid = toID(name);
		let throttleTable = await (loginthrottle.get(
			['count', 'time'], ip
		) as Promise<{count: number, time: number}> || null);
		if (throttleTable) {
			if (throttleTable.count > 500) {
				throttleTable.count++;
				await loginthrottle.update(ip, {
					count: throttleTable.count,
					lastuserid: userid,
					time: time(),
				});
				return false;
			} else if (throttleTable.time + 24 * 60 * 60 < time()) {
				throttleTable = {
					count: 0,
					time: time(),
				};
			}
		}

		const userData = await users.get('*', userid);
		if (userData?.email?.endsWith('@')) {
			const client = new gal.OAuth2Client(GAL_CLIENT_ID, '', '');
			try {
				const payload = await new Promise<{[k: string]: any} | null>((resolve, reject) => {
					client.verifyIdToken({
						idToken: pass,
						audience: GAL_CLIENT_ID,
					}, (e, login) => {
						if (e) return reject(e);
						resolve(login?.getPayload() || null);
					});
				});
				if (!payload?.aud.includes(Config['gapi_clientid'])) return false;
				if (payload?.email === userData['email'].slice(0, -1)) {
					return true;
				}
				return false;
			} catch (e) {
				return false;
			}
		}

		let rehash = false;
		if (userData?.passwordhash) {
			if (!await bcrypt.compare(pass, userData.passwordhash)) {
				if (throttleTable) {
					throttleTable.count++;
					await loginthrottle.update(ip, {
						count: throttleTable.count, lastuserid: userid, time: time(),
					});
				} else {
					await loginthrottle.insert({
						ip, count: 1, lastuserid: userid, time: time(),
					});
				}
				return false;
			}
			// i don't know how often this is actually necessary. so let's make this configurable.
			rehash = await Config.passwordNeedsRehash?.call(this, userid, userData['passwordhash']);
		} else {
			return false;
		}
		if (rehash) {
			// create a new password hash for the user
			const hash = await bcrypt.hash(pass, Config.passwordSalt);
			if (hash) {
				await users.update(toID(name), {
					passwordhash: hash, nonce: null,
				});
			}
		}
		return true;
	}
	async checkLoggedIn() {
		const ctime = time();
		const {body} = this.dispatcher.parseRequest()!;

		// see if we're logged in
		const scookie = body.sid || this.dispatcher.cookies.get('sid');
		if (!scookie) {
			// nope, not logged in
			return;
		}
		let sid = '';
		let session = 0;
		let scsplit = scookie.split(',');
		let cookieName;
		if (scsplit.length === 3) {
			cookieName = scsplit[0];
			session = parseInt(scsplit[1], 10);
			sid = scsplit[2];
			this.sidhash = sid;
		}
		if (!session) {
			return;
		}
		const res = await users.database.get<{sid: string, timeout: number}>(
			"SELECT sid, timeout, `ntbb_users`.* " +
			"FROM `ntbb_sessions`, `ntbb_users` " +
			"WHERE `session` = ? " +
			"AND `ntbb_sessions`.`userid` = `ntbb_users`.`userid` " +
			"LIMIT 1", [session]
		);
		if (!res || !(await this.validateSid(sid, res.sid))) {
			// invalid session ID
			this.deleteCookie();
			return;
		}
		if (res.timeout < ctime) {
			// session expired
			await sessions.deleteAll('timeout = ?', [ctime]);
			this.deleteCookie();
			return;
		}

		// okay, legit session ID - you're logged in now.
		this.dispatcher.user.login(cookieName);

		this.sidhash = sid;
		this.session = session;
	}
	validateSid(cachedSid: string, databaseSid: string): boolean | Promise<boolean> {
		if (Config.validateSid) return Config.validateSid.call(this, cachedSid, databaseSid);
		return cachedSid === databaseSid;
	}
}
