/**
 * Users and sessions
 *
 * Handles authentication, renaming, etc.
 * By Mia.
 *
 * @author mia-pi-git
 */

import * as bcrypt from 'bcrypt';
import {Config} from './config-loader';
import * as crypto from 'crypto';
import * as gal from 'google-auth-library';
import {SQL} from './database';
import {ActionError, ActionContext} from './server';
import {toID, time, signAsync} from './utils';
import {ladder, loginthrottle, sessions, users, usermodlog} from './tables';

const SID_DURATION = 2 * 7 * 24 * 60 * 60;
const LOGINTIME_INTERVAL = 24 * 60 * 60;

export class User {
	name = 'Guest';
	id = 'guest';
	loggedIn = '';
	constructor(name?: string) {
		if (name) this.setName(name);
	}
	setName(name: string) {
		this.name = name;
		this.id = toID(name);
	}
	login(name: string) {
		this.setName(name);
		this.loggedIn = this.id;
		return this;
	}
	logout() {
		this.setName('Guest');
		this.loggedIn = '';
	}
}

export class Session {
	sidhash = '';
	context: ActionContext;
	session = 0;
	readonly cookies: ReadonlyMap<string, string>;
	constructor(context: ActionContext) {
		this.context = context;
		this.cookies = this.parseCookie(context.request.headers.cookie);
	}
	getSid() {
		if (this.sidhash) return this.sidhash;
		const cached = this.cookies.get('sid');
		if (cached) {
			const [, sessionId, sid] = cached.split(',');
			this.sidhash = sid;
			this.session = parseInt(sessionId);
			return this.sidhash;
		}
		return '';
	}
	makeSid() {
		if (Config.makeSid) return Config.makeSid.call(this);
		return crypto.randomBytes(24).toString('hex');
	}
	async setSid() {
		if (!this.sidhash) {
			this.sidhash = await this.makeSid();
		}
		this.updateCookie();
		return this.sidhash;
	}

	parseCookie(cookieString?: string) {
		const list = new Map<string, string>();
		if (!cookieString) return list;
		const parts = cookieString.split(';');
		for (const part of parts) {
			const [curName, val] = part.split('=').map(i => i.trim());
			list.set(curName, decodeURIComponent(val));
		}
		return list;
	}
	deleteCookie() {
		if (this.sidhash) {
			this.session = 0;
			this.context.setHeader(
				"Set-Cookie",
				`sid=${encodeURIComponent(`,,${this.sidhash}`)}; ` +
					`Max-Age=0; Domain=${Config.routes.root}; Path=/; Secure; SameSite=None`
			);
		} else {
			this.context.setHeader(
				"Set-Cookie",
				`sid=;` +
					`Max-Age=0; Domain=${Config.routes.root}; Path=/; Secure; SameSite=None`
			);
		}
	}
	updateCookie() {
		const name = this.context.user.name;
		if (toID(name) === 'guest') return;
		if (!this.sidhash) {
			return this.deleteCookie();
		}
		const rawsid = encodeURIComponent([name, this.session, this.sidhash].join(','));
		this.context.setHeader(
			'Set-Cookie',
			`sid=${rawsid}; Max-Age=31363200; Domain=${Config.routes.root}; Path=/; Secure; SameSite=None`
		);
	}

	async getRecentRegistrationCount(period: number) {
		const ip = this.context.getIp();
		const timestamp = time() - period;
		const result = await users.selectOne<{regcount: number}>(
			SQL`COUNT(*) AS regcount`
		)`WHERE \`ip\` = ${ip} AND \`registertime\` > ${timestamp}`;
		return result?.['regcount'] || 0;
	}
	async addUser(username: string, password: string) {
		const hash = await bcrypt.hash(password, Config.passwordSalt);
		const userid = toID(username);
		const ip = this.context.getIp();

		const result = await users.insertIgnore({
			userid, username, passwordhash: hash, email: null, registertime: time(), ip,
		});

		if (!result.affectedRows) {
			// 0 affected rows almost always means user already exists
			return null;
		}
		return this.login(username, password);
	}
	async login(name: string, pass: string) {
		const curTime = time();
		await this.logout();
		const userid = toID(name);
		const info = await users.get(userid);
		if (!info) {
			// unregistered. just do the thing
			return this.context.user.login(name);
		}
		// previously, there was a case for banstate here in the php.
		// this is not necessary, as getAssertion handles that. Proceed to verification.
		const verified = await this.passwordVerify(name, pass);
		if (!verified) {
			throw new ActionError('Wrong password.');
		}
		const timeout = (curTime + SID_DURATION);
		const ip = this.context.getIp();
		const sidhash = this.sidhash = await this.makeSid();
		const res = await sessions.insert({
			userid,
			sid: await bcrypt.hash(sidhash, Config.passwordSalt),
			time: time(),
			timeout,
			ip,
		});
		this.session = res.insertId || 0;
		return this.context.user.login(name);
	}
	async logout(deleteCookie = false) {
		if (!this.session) return false;
		await sessions.delete(this.session);
		this.sidhash = '';
		this.session = 0;
		if (deleteCookie) this.deleteCookie();
		this.context.user.logout();
	}
	async getAssertion(
		userid: string, challengekeyid = -1, user: User | null, challenge = '', challengeprefix = ''
	) {
		if (userid === 'guest') {
			return ';';
		} else if (userid.startsWith('guest')) {
			return ';;Your username cannot start with \'guest\'.';
		} else if (userid.length > 18) {
			return ';;Your username must be less than 19 characters long.';
		} else if (!Session.isUseridAllowed(userid)) {
			return ';;Your username contains disallowed text.';
		}
		let data = '';
		const ip = this.context.getIp();
		let forceUsertype: string | false = false;
		if (!user) user = this.context.user;
		if (Config.autolockip.includes(ip)) {
			forceUsertype = '5';
		}
		let userType = '';
		const userData = user.loggedIn ? await users.get(user.id, SQL`banstate, registertime, logintime`) : null;
		const {banstate, registertime, logintime} = userData || {
			banstate: 0, registertime: 0, logintime: 0,
		};
		const server = await this.context.getServer();
		const serverHost = server?.server || 'sim3.psim.us';

		if (user.loggedIn === userid) {
			// already logged in
			userType = '2';
			if (Config.sysops.includes(user.id)) {
				userType = '3';
			} else {
				const customType = (Config as any).getUserType?.call(
					this, user, banstate, serverHost
				);
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
					if (registertime && time() - registertime > (7 * 24 * 60 * 60)) {
						const ladders = await ladder.selectOne(['formatid'])`WHERE userid = ${userid} AND w != 0`;
						if (ladders) {
							userType = '4';
							void users.update(userid, {banstate: -10});
						}
					}
				}
			}
			if (!logintime || time() - logintime > LOGINTIME_INTERVAL) {
				await users.update(userid, {logintime: time(), loginip: ip});
			}
			data = userid + ',' + userType + ',' + time() + ',' + serverHost;
		} else {
			if (userid.length < 1 || !/[a-z]/.test(userid)) {
				return ';;Your username must contain at least one letter.';
			}
			const userstate = await users.get(userid);
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
				data = userid + ',' + userType + ',' + time() + ',' + serverHost;
			}
		}
		let splitChallenge: string[] = [];
		for (const delim of [';', '%7C', '|']) {
			splitChallenge = challenge.split(delim);
			if (splitChallenge.length > 1) break;
		}

		let challengetoken;
		if (splitChallenge.length > 1) {
			challengekeyid = parseInt(splitChallenge[0]);
			challenge = splitChallenge[1];
			if (splitChallenge[2] && !challengetoken) challengetoken = splitChallenge[2];
		}

		if (!toID(challenge)) {
			// Bogus challenge.
			return ';;Corrupt challenge';
		}
		if (challengekeyid < 1) {
			return (
				';;This server is requesting an invalid login key. ' +
				'This probably means that either you are not connected to a server, ' +
				'or the server is set up incorrectly.'
			);
		} else if (Config.compromisedkeys.includes(challengekeyid)) {
			// Compromised keys - no longer supported.
			return (
				`;;This server is using login key ${challengekeyid}, which is no longer supported. ` +
				`Please tell the server operator to update their config.js file.`
			);
		} else if (Config.challengekeyid !== challengekeyid) {
			// Bogus key id.
			return ';;Unknown key ID';
		} else {
			// Include the challenge in the assertion.
			data = (challengeprefix || '') + challenge + ',' + data;
		}

		if ((Config as any).validateassertion) {
			data = await (Config as any).validateassertion.call(
				this, challengetoken, user, data, serverHost
			);
		}

		return data + ';' + await signAsync('RSA-SHA1', data, Config.privatekey);
	}
	static getBannedNameTerms() {
		return [
			...(Config.bannedTerms || []),
			'nigger', 'nigga', 'faggot',
			/(lol|ror)icon/, 'lazyafrican',
			'tranny',
		];
	}
	static isUseridAllowed(userid: string) {
		for (const term of Session.getBannedNameTerms()) {
			if (typeof term === 'object' ? term.test(userid) : userid.includes(term)) {
				return false;
			}
		}
		return true;
	}
	static wordfilter(user: string) {
		for (const term of Session.getBannedNameTerms()) {
			user = user.replace(term, '*');
		}
		return user;
	}
	static oauth = new gal.OAuth2Client(Config.gapi_clientid, '', '');
	async changePassword(name: string, pass: string) {
		const userid = toID(name);

		const userData = await users.get(userid);
		if (!userData) return false;

		const entry = 'Password changed from: ' + userData.passwordhash;
		await usermodlog.insert({
			userid, actorid: userid, date: time(), ip: this.context.getIp(), entry,
		});
		const passwordhash = await bcrypt.hash(pass, Config.passwordSalt);
		await users.update(userid, {
			passwordhash, nonce: null,
		});
		await sessions.deleteAll()`WHERE userid = ${userid}`;
		if (this.context.user.id === userid) {
			await this.login(name, pass);
		}
		return true;
	}
	async passwordVerify(name: string, pass: string) {
		const ip = this.context.getIp();
		const userid = toID(name);
		let throttleTable = await loginthrottle.get(
			ip, ['count', 'time']
		) as {count: number; time: number} || null;
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

		const userData = await users.get(userid);
		if (userData?.email?.endsWith('@')) {
			try {
				const payload = await new Promise<{[k: string]: any} | null>((resolve, reject) => {
					Session.oauth.verifyIdToken({
						idToken: pass,
						audience: Config.gapi_clientid,
					}, (e, login) => {
						if (e) return reject(e);
						resolve(login?.getPayload() || null);
					});
				});
				if (!payload) return false; // dunno why this would happen.
				if (!payload.aud.includes(Config.gapi_clientid)) return false;
				return payload.email === userData.email.slice(0, -1);
			} catch {
				return false;
			}
		}

		let rehash = false;
		if (userData?.passwordhash) {
			userData.passwordhash = Session.sanitizeHash(userData.passwordhash);
			if (!(await bcrypt.compare(pass, userData.passwordhash))) {
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
			if ((Config as any).passwordNeedsRehash) {
				rehash = await (Config as any).passwordNeedsRehash.call(
					this, userid, userData['passwordhash']
				);
			}
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
	async getUser(): Promise<User> {
		return await this.checkLoggedIn() ??
			new User(this.cookies.get('showdown_username'));
	}
	async checkLoggedIn() {
		const ctime = time();
		const body = this.context.body;

		// see if we're logged in
		const scookie = body.sid || this.cookies.get('sid');
		if (body.sid) {
			this.context.response.setHeader('Access-Control-Allow-Origin', '*');
		}
		if (!scookie) {
			// nope, not logged in
			return null;
		}
		let sid = '';
		let session = 0;
		const scsplit = scookie.split(',').filter(Boolean);
		let cookieName;
		if (scsplit.length === 3) {
			cookieName = scsplit[0];
			session = parseInt(scsplit[1]);
			sid = scsplit[2];
			this.sidhash = sid;
		}
		if (!session) {
			return null;
		}
		const res = await sessions.get(session, SQL`sid, timeout, userid`);
		if (!res || !(await bcrypt.compare(sid, res.sid))) {
			// invalid session ID
			this.deleteCookie();
			return null;
		}
		// invalid username
		if (res.userid !== toID(cookieName)) return null;
		if (res.timeout < ctime) {
			// session expired
			await sessions.deleteAll()`WHERE timeout = ${ctime}`;
			this.deleteCookie();
			return null;
		}

		// okay, legit session ID - you're logged in now.
		const user = new User();
		user.login(cookieName as string);

		this.sidhash = sid;
		this.session = session;
		return user;
	}
	static sanitizeHash(pass: string) {
		// https://youtu.be/rnzMkJocw6Q?t=9
		// (php uses $2y, js uses $2b)
		if (!pass.startsWith('$2b')) {
			pass = `$2b${pass.slice(3)}`;
		}
		return pass;
	}
}
