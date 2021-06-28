/**
 * This file handles all loginserver actions. Each of these can be requested by making a request to
 * /api/actionname, or to action.php?act=actname
 * By Mia
 * @author mia-pi-git
 */
import {Config} from './config-loader';
import {ActionError, Dispatcher, QueryHandler} from './dispatcher';
import * as fs from 'fs';
import {NTBBLadder} from './ladder';
import {Replays} from './replays';
import {toID} from './server';
import * as tables from './tables';

export const actions: {[k: string]: QueryHandler} = {
	async register(params) {
		const {username, password, cpassword, captcha} = params;
		if (!username) {
			throw new ActionError(`You must specify a username.`);
		}
		const userid = toID(username);
		if (!/[a-z]/.test(userid)) {
			throw new ActionError(`Your username must include at least one letter.`);
		}
		if (userid.startsWith('guest')) {
			throw new ActionError(`Your username cannot start with 'guest'.`);
		}
		if (password.replace(/ /ig, '').length < 5) {
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
		const challengekeyid = parseInt(params.challengekeyid, 10) || -1;
		const challenge = params.challstr || "";
		if (!challenge) throw new ActionError(`Invalid challenge string argument.`);
		const assertion = await this.session.getAssertion(userid, challengekeyid, user, challenge);
		return {
			assertion,
			actionsuccess: !assertion.startsWith(';'),
			curuser: await user.getData(),
		};
	},
	async logout(params) {
		if (
			this.request.method !== "POST" || !params.userid ||
			params.userid !== this.user.id || this.user.id === 'guest'
		) {
			return {actionsuccess: false};
		}
		await this.session.logout();
		return {success: true};
	},
	async login(params) {
		const challengeprefix = this.verifyCrossDomainRequest();
		if (this.request.method !== 'POST') {
			throw new ActionError(`For security reasons, logins must happen with POST data.`);
		}
		const userid = toID(params.name);
		if (!userid || !params.pass) {
			throw new ActionError(`incorrect login data, you need "name" and "pass" fields`);
		}
		const challengekeyid = parseInt(params.challengekeyid, 10) || -1;
		const actionsuccess = await this.session.login(params.name, params.pass);
		if (!actionsuccess) return {actionsuccess, assertion: false};
		const challenge = params.challstr || "";
		const assertion = await this.session.getAssertion(
			userid, challengekeyid, null, challenge, challengeprefix
		);
		this.session.updateCookie();
		return {
			actionsuccess: true,
			assertion,
		};
	},
	async updateuserstats(params) {
		const server = this.getServer(true);
		if (!server) {
			return {success: false};
		}

		const date = parseInt(params.date, 10);
		const usercount = parseInt(params.users || params.usercount, 10);
		if (isNaN(date) || isNaN(usercount)) {
			return {actionsuccess: false};
		}

		await tables.userstats.insert({
			serverid: server.id, date, usercount,
		}, "ON DUPLICATE KEY UPDATE `date`= ?, `usercount`= ?", [date, usercount]);

		if (server.id === 'showdown') {
			await tables.userstatshistory.insert({date, usercount});
		}
		return {actionsuccess: true};
	},
	async upkeep(params) {
		const challengeprefix = this.verifyCrossDomainRequest();
		const res: {[k: string]: any} = {};
		const curuser = this.user;
		res.loggedin = curuser.loggedin;
		let userid = '';
		if (curuser.loggedin) {
			res.username = curuser.name;
			userid = curuser.id;
		} else if (this.cookies.get('showdown_username')) {
			res.username = this.cookies.get('showdown_username')!;
			userid = toID(res.username);
		}
		if (userid !== '') {
			const challengekeyid = !params.challengekeyid ? -1 : parseInt(params.challengekeyid, 10);
			const challenge = params.challstr || "";
			res.assertion = await this.session.getAssertion(
				userid, challengekeyid, curuser, challenge, challengeprefix
			);
		}
		return res;
	},
	async json(params) {
		const server = this.getServer(true);
		if (!server) {
			throw new ActionError(`Only registered servers can make more than one request.`);
		}
		if (!params.json) throw new ActionError(`No JSON sent.`);
		let json: any[];
		try {
			json = JSON.parse(params.json);
		} catch (e) {
			throw new ActionError(`Invalid JSON sent.`);
		}
		if (!Array.isArray(json)) {
			throw new ActionError(`JSON sent must be an array of requests.`);
		}
		if (server.server !== Config.mainserver && json.length > 20) {
			throw new ActionError(`Too many requests were sent. Send them in more batches.`);
		}
		const results = [];
		for (const request of json) {
			const dispatcher = new Dispatcher(this.request, this.response, {body: request});
			try {
				if (!request.act) throw new ActionError(`Must send a request type.`);
				const data = await dispatcher.executeActions();
				results.push(data);
			} catch (e) {
				if (e.name?.endsWith('ActionError')) {
					results.push({actionerror: e.message});
					continue;
				}
				throw e;
			}
		}
		return results;
	},
	async prepreplay(params) {
		const server = this.getServer(true);
		let out: any = {};
		if (!server) {
			out.errorip = this.getIp();
			return;
		}
		const extractedFormatId = `${params.id}`.match(/^([a-z0-9]+)-[0-9]+$/);
		const formatId = `${params.format}`.match(/^([a-z0-9]+)$/);
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
			out = 0;
			return out;
		}

		if (server.id !== 'showdown') {
			params.id = server.id + '-' + params.id;
		}
		params.serverid = server.id;

		out = await Replays.prep(params);

		this.setPrefix(''); // No need for prefix since only usable by server.
		return out;
	},
	uploadreplay(params) {
		this.setHeader('Content-Type', 'text/plain; charset=utf-8');
		return Replays.upload(params, this);
	},
	invalidatecss() {
		const server = this.getServer(true);
		if (!server) {
			return {errorip: this.getIp()};
		}
		// No need to sanitise $server['id'] because it should be safe already.
		const cssfile = `${__dirname}/../config/customcss/${server['id']}.css`;
		return new Promise<{actionsuccess: boolean}>(resolve => {
			fs.unlink(cssfile, err => {
				return resolve({actionsuccess: !err});
			});
		});
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
		// safe to use userid directly because we've confirmed they've logged in.
		const actionsuccess = await tables.users.update(this.user.id, {
			username: params.username,
		}).catch(() => false);
		this.session.updateCookie();
		return {actionsuccess};
	},
	async ladderupdate(params) {
		const server = this.getServer(true);
		if (!server || server.id !== 'showdown') {
			return {errorip: "Your version of PS is too old for this ladder system. Please update."};
		}

		if (!params.format) throw new ActionError("Invalid format.");
		const ladder = new NTBBLadder(params.format);
		const p1 = NTBBLadder.getUserData(params.p1);
		const p2 = NTBBLadder.getUserData(params.p2);
		if (!p1 || !p2) {
			// The server should not send usernames > 18 characters long.
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
		const server = this.getServer(true);
		if (!server || server.id !== 'showdown') {
			return {errorip: true};
		}

		if (!params.format) throw new ActionError(`Specify a format.`);
		const ladder = new NTBBLadder(params.format);
		const user = NTBBLadder.getUserData(params.user);
		if (!user) return {errorip: true};
		await ladder.getAllRatings(user);
		return user.ratings;
	},
	async mmr(params) {
		const out: {[k: string]: any} = {};
		const server = this.getServer(true);
		if (!server || server.id !== 'showdown') {
			out.errorip = 'Your version of PS is too old for this ladder system. Please update.';
			return out;
		}
		if (!params.format) throw new ActionError("Specify a format.");
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
};
