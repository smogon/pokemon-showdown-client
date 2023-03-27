/**
 * This file handles all loginserver actions. Each of these can be requested by making a request to
 * /api/actionname, or to action.php?act=actname
 * By Mia
 * @author mia-pi-git
 */
import {Config} from './config-loader';
import * as fs from 'fs/promises';
import {Ladder} from './ladder';
import {Replays} from './replays';
import {ActionError, QueryHandler} from './server';
import {toID, updateserver, bash, time} from './utils';
import * as tables from './tables';
import * as pathModule from 'path';
import IPTools from './ip-tools';

export const actions: {[k: string]: QueryHandler} = {
	async register(params) {
		this.verifyCrossDomainRequest();
		const {username, password, cpassword, captcha} = params;
		if (!username) {
			throw new ActionError(`You must specify a username.`);
		}
		const userid = toID(username);
		if (!/[a-z]/.test(userid)) {
			throw new ActionError(`Your username must include at least one letter.`);
		}
		if (await tables.users.get(userid)) {
			throw new ActionError("Your username is already taken.");
		}

		if (!password) {
			throw new ActionError('You must specify a password.');
		}
		if (userid.startsWith('guest')) {
			throw new ActionError(`Your username cannot start with 'guest'.`);
		}
		if (password.replace(/\s/ig, '').length < 5) {
			throw new ActionError(`Your password must have at least 5 characters.`);
		}
		if (password !== cpassword) {
			throw new ActionError(`Your passwords do not match.`);
		}
		if (toID(captcha) !== 'pikachu') {
			throw new ActionError(`Answer the anti-spam question.`);
		}
		const regcount = await this.session.getRecentRegistrationCount(2 * 60 * 60);
		if (regcount && regcount > 2) {
			throw new ActionError(`You cannot register more than 2 names every 2 hours.`);
		}
		const user = await this.session.addUser(username, password);
		if (user === null) {
			throw new ActionError(`Your username is already taken.`);
		}
		const challengekeyid = parseInt(params.challengekeyid!) || -1;
		const challenge = params.challstr || params.challenge || "";
		if (!challenge) throw new ActionError(`Invalid challenge string argument.`);
		const assertion = await this.session.getAssertion(userid, challengekeyid, user, challenge);
		return {
			assertion,
			actionsuccess: !assertion.startsWith(';'),
			curuser: {loggedin: true, username, userid},
		};
	},

	async logout(params) {
		if (
			this.request.method !== "POST" || !params.userid ||
			params.userid !== this.user.id || this.user.id === 'guest'
		) {
			return {actionsuccess: false};
		}
		await this.session.logout(true);
		return {actionsuccess: true};
	},

	async login(params) {
		this.setPrefix('');
		const challengeprefix = this.verifyCrossDomainRequest();
		if (this.request.method !== 'POST') {
			throw new ActionError(`For security reasons, logins must happen with POST data.`);
		}
		if (!params.name || !params.pass) {
			throw new ActionError(`incorrect login data, you need "name" and "pass" fields`);
		}
		const userid = toID(params.name);
		if (!userid) {
			throw new ActionError(`incorrect login data, userid must contain at least one letter or number`);
		}
		const challengekeyid = parseInt(params.challengekeyid!) || -1;
		const actionsuccess = await this.session.login(params.name, params.pass);
		if (!actionsuccess) return {actionsuccess, assertion: false};
		const challenge = params.challstr || params.challenge || "";
		const assertion = await this.session.getAssertion(
			userid, challengekeyid, null, challenge, challengeprefix
		);
		await this.session.setSid();
		return {
			actionsuccess: true,
			assertion,
			curuser: {loggedin: true, username: params.name, userid},
		};
	},

	async updateuserstats(params) {
		const server = await this.requireServer();

		const date = parseInt(params.date!);
		const usercount = parseInt(params.users! || params.usercount!);
		if (isNaN(date) || isNaN(usercount)) {
			return {actionsuccess: false};
		}

		await tables.userstats.replace({
			serverid: server.id, date, usercount,
		});

		if (server.id === Config.mainserver) {
			await tables.userstatshistory.insert({date, usercount});
		}
		return {actionsuccess: true};
	},

	async upkeep(params) {
		const challengeprefix = this.verifyCrossDomainRequest();
		const res = {assertion: '', username: '', loggedin: false};
		const curuser = this.user;
		let userid = '';
		if (curuser.id !== 'guest') {
			res.username = curuser.name;
			userid = curuser.id;
		}
		if (userid !== '') {
			const challengekeyid = !params.challengekeyid ? -1 : parseInt(params.challengekeyid);
			const challenge = params.challstr || params.challenge || "";
			res.assertion = await this.session.getAssertion(
				userid, challengekeyid, curuser, challenge, challengeprefix
			);
		}
		res.loggedin = !!curuser.loggedIn;
		return res;
	},

	json() {
		throw new ActionError("Malformed request", 400);
	},

	async prepreplay(params) {
		const server = await this.getServer(true);
		if (!server) {
			// legacy error
			return {errorip: this.getIp()};
		}

		const extractedFormatId = /^([a-z0-9]+)-[0-9]+$/.exec(`${params.id}`)?.[1];
		const formatId = /^([a-z0-9]+)$/.exec(`${params.format}`)?.[1];
		if (
			// the server must send all the required values
			!params.id || !params.format || !params.loghash || !params.p1 || !params.p2 ||
			// player usernames cannot be longer than 18 characters
			params.p1.length > 18 || params.p2.length > 18 ||
			// the battle ID must be valid
			!extractedFormatId ||
			// the format from the battle ID must match the format ID
			formatId !== extractedFormatId
		) {
			return 0;
		}

		if (server.id !== Config.mainserver) {
			params.id = server.id + '-' + params.id;
		}
		params.serverid = server.id;

		const result = await Replays.prep(params);

		this.setPrefix(''); // No need for prefix since only usable by server.
		return result;
	},

	uploadreplay(params) {
		this.setHeader('Content-Type', 'text/plain; charset=utf-8');
		return Replays.upload(params, this);
	},

	async invalidatecss() {
		const server = await this.requireServer();

		// No need to sanitise server['id'] because it should be safe already.
		const cssfile = pathModule.join(process.env.CSS_DIR || Config.cssdir, `/${server['id']}.css`);
		try {
			await fs.unlink(cssfile);
			return {actionsuccess: true};
		} catch (err) {
			return {actionsuccess: false};
		}
	},

	async changepassword(params) {
		if (this.request.method !== 'POST') {
			throw new ActionError(`'changepassword' requests can only be made with POST data.`);
		}
		if (!params.oldpassword) {
			throw new ActionError(`Specify your current password.`);
		}
		if (!params.password) {
			throw new ActionError(`Specify your new password.`);
		}
		if (!params.cpassword) {
			throw new ActionError(`Repeat your new password.`);
		}

		if (!this.user.loggedIn) {
			throw new ActionError('Your session has expired. Please log in again.');
		}
		if (params.password !== params.cpassword) {
			throw new ActionError('Your new passwords do not match.');
		}
		if (!(await this.session.passwordVerify(this.user.id, params.oldpassword))) {
			throw new ActionError('Your old password was incorrect.');
		}
		params.password = params.password.replace(/\s/ig, '');
		if (params.password.length < 5) {
			throw new ActionError('Your new password must be at least 5 characters long.');
		}
		const actionsuccess = await this.session.changePassword(this.user.id, params.password);
		return {actionsuccess};
	},

	async changeusername(params) {
		if (this.request.method !== 'POST') {
			throw new ActionError('Invalid request (username changing must be done through POST requests).');
		}
		if (!params.username) {
			throw new ActionError(`Specify a username.`);
		}
		if (!this.user.loggedIn) {
			throw new ActionError('Your session has expired. Please log in again.');
		}
		if (toID(params.username) !== this.user.id) {
			throw new ActionError('You\'re not logged in as that user.');
		}
		// safe to use userid directly because we've confirmed they've logged in.
		const actionsuccess = await tables.users.update(this.user.id, {
			username: params.username,
		});
		await this.session.setSid();
		return {actionsuccess};
	},

	async getassertion(params) {
		this.setPrefix('');
		params.userid = toID(params.userid) || this.user.id;
		// NaN is falsy so this validates
		const challengekeyid = Number(params.challengekeyid) || -1;
		const challenge = params.challenge || params.challstr || "";
		return this.session.getAssertion(
			params.userid,
			challengekeyid,
			this.user,
			challenge,
			this.verifyCrossDomainRequest()
		);
	},

	async ladderupdate(params) {
		const server = await this.getServer(true);
		if (server?.id !== Config.mainserver) {
			// legacy error
			return {errorip: this.getIp()};
		}

		if (!toID(params.format)) throw new ActionError("Invalid format.");
		if (!params.score) throw new ActionError("Score required.");
		const ladder = new Ladder(params.format!);
		if (!Ladder.isValidPlayer(params.p1)) return 0;
		if (!Ladder.isValidPlayer(params.p2)) return 0;

		const out: {[k: string]: any} = {};
		const [p1rating, p2rating] = await ladder.addMatch(params.p1!, params.p2!, parseFloat(params.score));
		out.actionsuccess = true;
		out.p1rating = p1rating;
		out.p2rating = p2rating;
		delete out.p1rating.rpdata;
		delete out.p2rating.rpdata;
		this.setPrefix('');	// No need for prefix since only usable by server.
		return out;
	},

	async ladderget(params) {
		// used by the client; doesn't need a serverid check; Main can be assumed

		const user = Ladder.isValidPlayer(params.user);
		if (!user) throw new ActionError("Invalid username.");

		return Ladder.getAllRatings(user);
	},

	async mmr(params) {
		const server = await this.getServer(true);
		if (server?.id !== Config.mainserver) {
			// legacy error
			return {errorip: "This ladder is not for your server. You should turn off Config.remoteladder."};
		}
		if (!toID(params.format)) throw new ActionError("Specify a format.");
		const ladder = new Ladder(params.format!);
		if (!Ladder.isValidPlayer(params.user)) return 1000;

		const rating = await ladder.getRating(params.user!);
		return rating?.elo || 1000;
	},

	async restart() {
		await this.requireMainServer();

		if (!Config.restartip) {
			throw new ActionError(`This feature is disabled.`);
		}
		if (this.getIp() !== Config.restartip) {
			throw new ActionError(`Access denied for ${this.getIp()}.`);
		}
		const update = await updateserver();
		let stderr;
		[, , stderr] = await bash('npx tsc');
		if (stderr) throw new ActionError(`Compilation failed:\n${stderr}`);
		[, , stderr] = await bash('npx pm2 reload loginserver');
		if (stderr) throw new ActionError(stderr);
		return {updated: update, success: true};
	},

	async updatenamecolor(params) {
		await this.requireMainServer();

		const userid = toID(params.userid);
		if (!userid) {
			throw new ActionError('No userid was specified.');
		}
		const source = toID(params.source);
		if ('source' in params && !source) {
			throw new ActionError('No color adjustment was specified.');
		}
		if (userid.length > 18 || source.length > 18) {
			throw new ActionError('Usernames can only be 18 characters long');
		}
		const by = toID(params.by);
		if (!by) {
			throw new ActionError('Specify the action\'s actor.');
		}
		if (!Config.colorpath) {
			throw new ActionError("Editing custom colors is disabled");
		}
		const colors = {} as Record<string, string>;
		try {
			const content = await fs.readFile(Config.colorpath, 'utf-8');
			Object.assign(colors, JSON.parse(content));
		} catch (e) {
			throw new ActionError(`Could not read color file (${e})`);
		}
		let entry = '';
		if (!('source' in params)) {
			if (!colors[userid]) {
				throw new ActionError(
					'That user does not have a custom color set by the loginserver. ' +
					'Ask an admin to remove it manually if they have one.'
				);
			} else {
				delete colors[userid];
				entry = 'Username color was removed';
			}
		} else {
			colors[userid] = source;
			entry = `Username color was set to "${source}"${params.reason ? ` (${params.reason})` : ``}`;
		}
		await fs.writeFile(Config.colorpath, JSON.stringify(colors));

		await tables.usermodlog.insert({
			userid, actorid: by, date: time(), ip: this.getIp(), entry,
		});

		return {success: true};
	},

	async setstanding(params) {
		await this.requireMainServer();

		const userid = toID(params.user);
		if (!userid) {
			throw new ActionError("Target username not specified.");
		}
		const actor = toID(params.actor);
		if (!actor) {
			throw new ActionError("The staff executing this action must be specified.");
		}
		if (!params.reason || !params.reason.length) {
			throw new ActionError("A reason must be specified.");
		}
		const standing = Number(params.standing);
		if (isNaN(standing) || !params.standing) {
			throw new ActionError("No standing specified.");
		}
		if (!Config.standings[standing]) {
			throw new ActionError("Invalid standing.");
		}
		const res = await tables.users.update(userid, {
			banstate: standing,
		});
		if (!res.affectedRows) {
			throw new ActionError("User not found.");
		}
		await tables.usermodlog.insert({
			actorid: actor,
			userid,
			date: time(),
			ip: this.getIp(),
			entry: `Standing changed to ${standing} (${Config.standings[standing]}): ${params.reason}`,
		});
		return {success: true};
	},

	async ipstanding(params) {
		await this.requireMainServer();

		const ip = params.ip?.trim() || "";
		if (!IPTools.ipRegex.test(ip)) {
			throw new ActionError("Invalid IP provided.");
		}
		const actor = toID(params.actor);
		if (!actor) {
			throw new ActionError("The staff executing this action must be specified.");
		}
		if (!params.reason || !params.reason.length) {
			throw new ActionError("A reason must be specified.");
		}
		const standing = Number(params.standing);
		if (isNaN(standing) || !params.standing) {
			throw new ActionError("No standing specified.");
		}
		if (!Config.standings[standing]) {
			throw new ActionError("Invalid standing.");
		}
		const matches = await tables.users.selectAll(['userid'])`WHERE ip = ${ip}`;
		for (const {userid} of matches) {
			await tables.users.update(userid, {banstate: standing});
			await tables.usermodlog.insert({
				actorid: actor,
				userid,
				date: time(),
				ip: this.getIp(),
				entry: `Standing changed to ${standing} (${Config.standings[standing]}): ${params.reason}`,
			});
		}
		return {success: matches.length};
	},

	async ipmatches(params) {
		await this.requireMainServer();

		const userid = toID(params.id);
		if (!userid) {
			throw new ActionError("User not specified.");
		}
		const res = await tables.users.get(userid);
		if (!res) {
			throw new ActionError(`User ${userid} not found.`);
		}
		return {
			matches: await tables.users.selectAll(['userid', 'banstate'])`WHERE ip = ${res.ip}`,
		};
	},
};

if (Config.actions) {
	Object.assign(actions, Config.actions);
}
