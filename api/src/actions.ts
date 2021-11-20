/**
 * This file handles all loginserver actions. Each of these can be requested by making a request to
 * /api/actionname, or to action.php?act=actname
 * By Mia
 * @author mia-pi-git
 */
import {Config} from './config-loader';
import {ActionError, Dispatcher, QueryHandler} from './dispatcher';
import * as fs from 'fs';
import * as child_process from 'child_process';
import SQL from 'sql-template-strings';
import {NTBBLadder} from './ladder';
import {Replays, md5} from './replays';
import {toID} from './server';
import * as tables from './tables';

// shamelessly stolen from PS main
function bash(command: string, cwd?: string): Promise<[number, string, string]> {
	return new Promise(resolve => {
		child_process.exec(command, {
			cwd: cwd || `${__dirname}/../..`,
		}, (error, stdout, stderr) => {
			resolve([error?.code || 0, stdout, stderr]);
		});
	});
}

// shamelessly stolen from PS main
async function updateserver() {
	let [code, stdout, stderr] = await bash(`git fetch`);
	if (code) throw new Error(`updateserver: Crash while fetching - make sure this is a Git repository`);
	if (!stdout && !stderr) {
		return true; // no changes. we're fine.
	}

	[code, stdout, stderr] = await bash(`git rev-parse HEAD`);
	if (code || stderr) throw new Error(`updateserver: Crash while grabbing hash`);
	const oldHash = String(stdout).trim();

	[code, stdout, stderr] = await bash(`git stash save "PS /updateserver autostash"`);
	let stashedChanges = true;
	if (code) throw new Error(`updateserver: Crash while stashing`);
	if ((stdout + stderr).includes("No local changes")) {
		stashedChanges = false;
	} else if (stderr) {
		throw new Error(`updateserver: Crash while stashing`);
	}

	// errors can occur while rebasing or popping the stash; make sure to recover
	try {
		[code] = await bash(`git rebase --no-autostash FETCH_HEAD`);
		if (code) {
			// conflict while rebasing
			await bash(`git rebase --abort`);
			throw new Error(`restore`);
		}

		if (stashedChanges) {
			[code] = await bash(`git stash pop`);
			if (code) {
				// conflict while popping stash
				await bash(`git reset HEAD .`);
				await bash(`git checkout .`);
				throw new Error(`restore`);
			}
		}

		return true;
	} catch {
		// failed while rebasing or popping the stash
		await bash(`git reset --hard ${oldHash}`);
		if (stashedChanges) await bash(`git stash pop`);
		return false;
	}
}

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
		const curuser = await user.getData();
		delete (curuser as any).passwordhash;
		return {
			assertion,
			actionsuccess: !assertion.startsWith(';'),
			curuser,
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
		return {actionsuccess: true};
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
		const challengekeyid = parseInt(params.challengekeyid) || -1;
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
		const server = await this.getServer(true);
		if (!server) {
			return {actionsuccess: false};
		}

		const date = parseInt(params.date);
		const usercount = parseInt(params.users || params.usercount);
		if (isNaN(date) || isNaN(usercount)) {
			return {actionsuccess: false};
		}

		await tables.userstats.insert({
			serverid: server.id, date, usercount,
		}, SQL`ON DUPLICATE KEY UPDATE \`date\`= ${date}, \`usercount\`= ${usercount}`);

		if (server.id === Config.mainserver) {
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
			const challengekeyid = !params.challengekeyid ? -1 : parseInt(params.challengekeyid);
			const challenge = params.challstr || "";
			res.assertion = await this.session.getAssertion(
				userid, challengekeyid, curuser, challenge, challengeprefix
			);
		}
		return res;
	},
	async json() {
		if (!Dispatcher.isJSON(this.request)) {
			throw new ActionError("/api/json must use application/json requests");
		}
		let json;
		try {
			json = await Dispatcher.parseSentRequest(this.request);
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
		const server = Dispatcher.servers[toID(serverid)];
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
			const dispatcher = new Dispatcher(this.request, this.response, {
				body: request,
				act: request.act,
			});
			try {
				const result = await dispatcher.executeActions();
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
		const extractedFormatId = /^([a-z0-9]+)-[0-9]+$/.exec((`${params.id}`));
		const formatId = /^([a-z0-9]+)$/.exec((`${params.format}`));
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
		const cssfile = `${__dirname}/../config/customcss/${server['id']}.css`;
		return new Promise<{actionsuccess: boolean}>(resolve => {
			fs.unlink(cssfile, err => resolve({actionsuccess: !err}));
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
		// safe to use userid directly because we've confirmed they've logged in.
		const actionsuccess = await tables.users.update(this.user.id, {
			username: params.username,
		}).catch(() => false);
		this.session.updateCookie();
		return {actionsuccess};
	},
	async getassertion(params) {
		if (!params.challenge) {
			throw new ActionError(`Specify a challenge.`);
		}
		if (!this.user.loggedin) {
			throw new ActionError('Your session has expired. Please log in again.');
		}
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
		if (!challengekeyid) {
			throw new ActionError(`Specify a challenge key ID.`);
		}
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
		const server = await this.getServer(true);
		if (server?.id !== Config.mainserver) {
			return {errorip: true};
		}

		if (!toID(params.format)) throw new ActionError(`Specify a format.`);
		const ladder = new NTBBLadder(params.format);
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
		const [, , stderr] = await bash('npx pm2 reload loginserver');
		if (stderr) throw new ActionError(stderr);
		return {updated: update, success: true};
	},
};
