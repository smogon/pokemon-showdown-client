/**
 * This file handles all loginserver actions. Each of these can be requested by making a request to
 * /api/actionname, or to action.php?act=actname
 * By Mia
 * @author mia-pi-git
 */
import {Config} from './config-loader';
import * as fs from 'fs/promises';
import {NTBBLadder} from './ladder';
import {Replays} from './replays';
import {ActionError, ActionContext, QueryHandler, SimServers} from './server';
import {toID, updateserver, bash, md5} from './utils';
import * as tables from './tables';
import * as pathModule from 'path';

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
		const challengekeyid = parseInt(params.challengekeyid) || -1;
		const challenge = params.challstr || "";
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
		const userid = toID(params.name);
		if (!userid || !params.pass) {
			throw new ActionError(`incorrect login data, you need "name" and "pass" fields`);
		}
		const challengekeyid = parseInt(params.challengekeyid) || -1;
		const actionsuccess = await this.session.login(params.name, params.pass);
		if (!actionsuccess) return {actionsuccess, assertion: false};
		const challenge = params.challstr || "";
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
		const server = await this.getServer(true);
		if (!server) {
			return {actionsuccess: false};
		}

		const date = parseInt(params.date);
		const usercount = parseInt(params.users || params.usercount);
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
			const challenge = params.challstr || "";
			res.assertion = await this.session.getAssertion(
				userid, challengekeyid, curuser, challenge, challengeprefix
			);
		}
		res.loggedin = curuser.loggedin;
		return res;
	},
	async json() {
		if (!ActionContext.isJSON(this.request)) {
			throw new ActionError("/api/json must use application/json requests");
		}
		let json;
		try {
			json = await ActionContext.parseSentRequest(this.request);
		} catch {
			return [{actionerror: 'Malformed JSON sent.'}];
		}
		if (!json || !Array.isArray(json)) {
			throw new ActionError(`Malformed JSON (send a JSON array in the 'json' property).`);
		}

		let serverid, servertoken;
		for (const req of json) {
			if (!serverid) serverid = req.serverid;
			if (!servertoken) servertoken = req.servertoken;
		}
		const server = SimServers.get(serverid);
		if (json.length > 20) {
			if (!server || server.token && server.token !== md5(servertoken)) {
				throw new ActionError(`Only registered servers can send >20 requests at once.`);
			}
		}

		const results = [];
		for (const request of json) {
			if (request.actionerror) continue;
			if (!request.act) {
				results.push({actionerror: 'Must send a request type.'});
				continue;
			}
			const context = new ActionContext(this.request, this.response, {
				body: request,
				act: request.act,
			});
			try {
				const result = await context.executeActions();
				results.push(result);
			} catch (e) {
				if (e instanceof ActionError) {
					results.push({actionerror: e.message});
					continue;
				}
				throw e;
			}
		}
		return results;
	},
	async prepreplay(params) {
		const server = await this.getServer(true);
		if (!server) {
			return {errorip: this.getIp()};
		}
		const extractedFormatId = /^([a-z0-9]+)-[0-9]+$/.exec(`${params.id}`);
		const formatId = /^([a-z0-9]+)$/.exec(`${params.format}`);
		if (
			// the server must be registered
			!server ||
			// the server must send all the required values
			!params.id ||
			!params.format ||
			!params.loghash ||
			!params.p1 ||
			!params.p2 ||
			// player usernames cannot be longer than 18 characters
			(params.p1.length > 18) ||
			(params.p2.length > 18) ||
			// the battle ID must be valid
			!extractedFormatId ||
			// the format ID must be valid
			!formatId ||
			// the format from the battle ID must match the format ID
			(formatId[1] !== extractedFormatId[1])
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
		const server = await this.getServer(true);
		if (!server) {
			return {errorip: this.getIp()};
		}
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

		if (!this.user.loggedin) {
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
		if (!this.user.loggedin) {
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
		params.userid = toID(params.userid);
		if (!params.userid) {
			params.userid = this.user.id;
		}
		if (params.userid === 'guest') {
			return ';'; // Special error message for this case.
		}
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
			return {errorip: "Your version of PS is too old for this ladder system. Please update."};
		}

		if (!toID(params.format)) throw new ActionError("Invalid format.");
		const ladder = new NTBBLadder(params.format);
		const p1 = NTBBLadder.getUserData(params.p1);
		const p2 = NTBBLadder.getUserData(params.p2);
		if (!p1 || !p2) {
			// The server should not send usernames > 18 characters long.
			// (getUserData returns falsy when the usernames are too long)
			return 0;
		}

		const out: {[k: string]: any} = {};
		await ladder.updateRating(p1, p2, parseFloat(params.score));
		out.actionsuccess = true;
		out.p1rating = p1.rating;
		out.p2rating = p2.rating;
		delete out.p1rating.rpdata;
		delete out.p2rating.rpdata;
		this.setPrefix('');	// No need for prefix since only usable by server.
		return out;
	},
	async ladderget(params) {
		const server = await this.getServer();
		if (server?.id !== Config.mainserver) {
			return {errorip: true};
		}

		// yes, this params.format is useless, basically.
		// it's just for parity with old code for now.
		const ladder = new NTBBLadder(toID(params.format));
		const user = NTBBLadder.getUserData(params.user);
		if (!user) return {errorip: true};
		await ladder.getAllRatings(user);
		return user.ratings;
	},
	async mmr(params) {
		const server = await this.getServer(true);
		if (server?.id !== Config.mainserver) {
			return {errorip: 'Your version of PS is too old for this ladder system. Please update.'};
		}
		if (!toID(params.format)) throw new ActionError("Specify a format.");
		const ladder = new NTBBLadder(params.format);
		const user = NTBBLadder.getUserData(params.user);
		let result = 1000;
		if (!user) {
			return result;
		}
		await ladder.getRating(user);
		if (user.rating) {
			result = user.rating.elo;
		}
		return result;
	},
	async restart() {
		const server = await this.getServer(true);
		if (server?.id !== Config.mainserver) {
			throw new ActionError(`Access denied.`);
		}
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
};

if (Config.actions) {
	Object.assign(actions, Config.actions);
}
