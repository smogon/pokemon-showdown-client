/**
 * This file handles all loginserver actions. Each of these can be requested by making a request to
 * /api/actionname, or to action.php?act=actname
 * By Mia
 * @author mia-pi-git
 */
import {promises as fs, readFileSync} from 'fs';
import * as pathModule from 'path';
import * as crypto from 'crypto';
import * as url from 'url';
import {Config} from './config-loader';
import {Ladder} from './ladder';
import {Replays} from './replays';
import {ActionError, QueryHandler, Server} from './server';
import {Session} from './user';
import {toID, updateserver, bash, time, escapeHTML} from './utils';
import * as tables from './tables';
import {SQL} from './database';
import IPTools from './ip-tools';

const OAUTH_TOKEN_TIME = 2 * 7 * 24 * 60 * 60 * 1000;

async function getOAuthClient(clientId?: string, origin?: string) {
	if (!clientId) throw new ActionError("No client_id provided.");
	const data = await tables.oauthClients.get(clientId);
	if (!data) throw new ActionError("Invalid client_id");
	if (origin) {
		if (new url.URL(origin).host !== new url.URL(data.origin_url).host) {
			throw new ActionError("This origin is not permitted to use this OAuth client.");
		}
	}
	return data;
}

const OAUTH_AUTHORIZE_CONTENT = readFileSync(
	__dirname + "/../../src/public/oauth-authorize.html",
	'utf-8'
);
const OAUTH_AUTHORIZED_CONTENT = readFileSync(
	__dirname + "/../../src/public/oauth-authorized.html",
	'utf-8'
);

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

	async addreplay(params) {
		// required params:
		//   id, format, log, players
		// optional params:
		//   inputlog, hidden, password

		const server = await this.getServer(true);
		if (!server) {
			// legacy error
			return {errorip: this.getIp()};
		}

		// the server must send all the required values
		if (!params.id || !params.format || !params.log || !params.players) {
			throw new ActionError("Required params: id, format, log, players", 400);
		}
		// player usernames cannot be longer than 18 characters
		if (params.players.split(',').some(p => p.length > 18)) {
			throw new ActionError("Player names must be 18 chars or shorter", 400);
		}
		// the battle ID must be valid
		// the format from the battle ID must match the format ID
		const extractedFormatId = /^([a-z0-9]+)-[0-9]+$/.exec(`${params.id}`)?.[1];
		const formatId = toID(params.format);
		if (!extractedFormatId || formatId !== extractedFormatId) {
			throw new ActionError("Format ID must match the one in the replay ID", 400);
		}

		if (server.id !== Config.mainserver) {
			params.id = server.id + '-' + params.id;
		}

		const id = ('' + params.id).toLowerCase().replace(/[^a-z0-9-]+/g, '');
		let isPrivate: 0 | 1 | 2 = params.hidden ? 1 : 0;
		if (params.hidden === '2') isPrivate = 2;
		const players = params.players.split(',').map(p => Session.wordfilter(p));
		const out = await Replays.add({
			id,
			log: params.log,
			players,
			format: params.format,
			uploadtime: time(),
			rating: null,
			inputlog: params.inputlog || null,
			private: isPrivate,
			password: params.password || null,
		});

		this.setPrefix(''); // No need for prefix since only usable by server.
		return {replayid: out};
	},

	prepreplay() {
		throw new ActionError("No longer exists; use addreplay.", 410);
	},

	uploadreplay() {
		throw new ActionError("No longer exists; use addreplay.", 410);
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
		this.verifyCrossDomainRequest();
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

	async rebuildclient(params) {
		await this.requireMainServer();

		if (!Config.restartip || !Config.clientpath) {
			throw new ActionError(`This feature is disabled.`);
		}
		if (this.getIp() !== Config.restartip) {
			throw new ActionError(`Access denied for ${this.getIp()}.`);
		}
		let update;
		try {
			update = await bash('sudo -u www-data git pull', Config.clientpath);
			if (update[0]) throw new Error(update.join(','));
			update = true;
		} catch (e: any) {
			throw new ActionError(e.message as string);
		}
		update = await bash(
			`sudo -u www-data node build${params.full ? ' full' : ''}`, Config.clientpath
		);
		if (update[0]) throw new ActionError(`Compilation failed:\n${update.join(',')}`);
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
		if (!params.reason?.length) {
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
		if (!params.reason?.length) {
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
	// oauth is broken into a few parts
	// oauth/page - public-facing part
	// oauth/api/page - api part (does the actual action)
	async 'oauth/authorize'(params) {
		this.allowCORS();
		if (!params.redirect_uri) {
			throw new ActionError("No redirect_uri provided");
		}
		const clientInfo = await getOAuthClient(params.client_id, this.request.headers.origin);

		this.response.setHeader('Content-Type', 'text/html');
		try {
			let content = OAUTH_AUTHORIZE_CONTENT;
			// table keys are owner, clientName, id
			// expects client, client_name, redirect_uri
			content = content.replace(/\{\{client\}\}/g, escapeHTML(clientInfo.client_title));
			content = content.replace(/\{\{client_name\}\}/g, escapeHTML(clientInfo.owner));
			this.response.setHeader('Content-Length', content.length);
			return content;
		} catch (e) {
			Server.crashlog(e, "oauth/authorize", params);
			return "<body>The OAuth page could not be served at this time. Please try again later.</body>";
		}
	},

	// make a token if they don't already have it
	async 'oauth/api/authorize'(params) {
		this.allowCORS();
		if (!this.user.loggedIn) {
			throw new ActionError("You're not logged in.");
		}
		const clientInfo = await getOAuthClient(params.client_id);
		const existing = await (
			tables.oauthTokens.selectOne()
		)`WHERE client = ${clientInfo.id} AND owner = ${this.user.id}`;
		if (existing) {
			if (Date.now() - existing.time > OAUTH_TOKEN_TIME) { // 2w
				await tables.oauthTokens.delete(existing.id);
				return {success: false};
			} else {
				return {success: existing.id};
			}
		}
		const id = crypto.randomBytes(16).toString('hex');
		await tables.oauthTokens.insert({
			id, owner: this.user.id, client: clientInfo.id, time: Date.now(),
		});
		return {success: id, expires: Date.now() + OAUTH_TOKEN_TIME};
	},

	async 'oauth/api/refreshtoken'(params) {
		this.allowCORS();
		const clientInfo = await getOAuthClient(params.client_id);
		const token = (params.token || "").toString();
		if (!token) {
			throw new ActionError('No token provided.');
		}
		const tokenEntry = await tables.oauthTokens.get(token);
		if (!tokenEntry) {
			return {success: false};
		}
		const id = crypto.randomBytes(16).toString('hex');
		await tables.oauthTokens.insert({
			id, owner: tokenEntry.owner, client: clientInfo.id, time: Date.now(),
		});
		await tables.oauthTokens.delete(tokenEntry.id);
		return {success: id, expires: Date.now() + OAUTH_TOKEN_TIME};
	},

	// validate assertion & get token if it's valid
	async 'oauth/api/getassertion'(params) {
		this.allowCORS();
		await getOAuthClient(params.client_id);
		const token = (params.token || "").toString();
		if (!token) {
			throw new ActionError('No token provided.');
		}
		const challstr = params.challenge || params.challstr;
		if (!challstr) {
			throw new ActionError('No challstr provided.');
		}
		const tokenEntry = await tables.oauthTokens.get(token);
		if (!tokenEntry || tokenEntry.id !== token) {
			return {success: false};
		}
		if ((Date.now() - tokenEntry.time) > OAUTH_TOKEN_TIME) { // 2w
			await tables.oauthTokens.delete(tokenEntry.id);
			return {success: false};
		}
		this.user.login(tokenEntry.owner);
		return this.session.getAssertion(
			this.user.id, Config.challengekeyid, this.user, challstr
		);
	},

	'oauth/authorized'() {
		this.allowCORS();
		this.response.setHeader('Content-Type', 'text/html');
		const content = OAUTH_AUTHORIZED_CONTENT;
		this.response.setHeader('Content-Length', content.length);
		return content;
	},

	async 'oauth/api/authorized'() {
		if (!this.user.loggedIn) {
			throw new ActionError("You're not logged in.");
		}
		const applications = [];
		const tokens = await tables.oauthTokens.selectAll()`WHERE owner = ${this.user.id}`;
		for (const token of tokens) {
			const client = await tables.oauthClients.get(token.client);
			if (!client) throw new Error("Tokens exist for nonexistent application");
			applications.push({title: client.client_title, url: client.origin_url});
		}
		return {
			username: this.user.id,
			applications,
		};
	},

	async 'oauth/api/revoke'(params) {
		if (!this.user.loggedIn) {
			throw new ActionError("You're not logged in.");
		}
		if (!params.uri) {
			throw new ActionError("Specify the URL of the application you wish to revoke access for.");
		}
		const client = await tables.oauthClients.selectOne()`WHERE origin_url = ${params.uri}`;
		if (!client) {
			throw new ActionError('No client found with that URL.');
		}
		const tokenEntry = await tables.oauthTokens.selectOne()`WHERE client = ${client.id}`;
		if (!tokenEntry) {
			throw new ActionError("That application doesn't have access granted to your account.");
		}
		await tables.oauthTokens.deleteAll()`WHERE client = ${client.id} and owner = ${this.user.id}`;
		return {success: true};
	},

	async getteams(params) {
		this.verifyCrossDomainRequest();
		if (!this.user.loggedIn || this.user.id === 'guest') {
			return {teams: []}; // don't wanna nag people with popups if they aren't logged in
		}
		let teams = [];
		try {
			teams = await tables.teams.selectAll<any>(
				SQL`teamid, team, format, title as name`
			)`WHERE ownerid = ${this.user.id}`;
		} catch (e) {
			Server.crashlog(e, 'a teams database query', params);
			throw new ActionError('The server could not load your teams. Please try again later.');
		}
		for (const t of teams) {
			const mons = [];
			const sets = t.team.split(']');
			for (const s of sets) {
				const parts = s.split('|');
				// defer to species if exists, otherwise name
				mons.push(parts[1] || parts[0]);
			}
			// feed it only the species names, that way we can render it in teambuilder
			// and fetch the team later
			t.team = mons.join(',');
		}
		return {teams};
	},
	async getteam(params) {
		if (!this.user.loggedIn || this.user.id === 'guest') {
			throw new ActionError("Access denied");
		}
		let {teamid} = params;
		teamid = toID(teamid);
		if (!teamid) {
			throw new ActionError("Invalid team ID");
		}
		try {
			const data = await tables.teams.selectOne<any>(
				SQL`ownerid, team, private as privacy`
			)`WHERE teamid = ${teamid}`;
			if (!data || data.ownerid !== this.user.id) {
				return {team: null};
			}
			return data;
		} catch (e) {
			Server.crashlog(e, 'a teams database request', params);
			throw new ActionError("Failed to fetch team. Please try again later.");
		}
	},
	'replays/recent'() {
		this.allowCORS();
		return Replays.recent();
	},
	async 'replays/search'(params) {
		this.allowCORS();
		if (params.sort && params.sort !== 'rating' && params.sort !== 'date') {
			throw new ActionError('Sort must be "rating" or "date"');
		}
		const usernames = [
			...(params.username || params.user || '').split(','),
			...(params.username2 || params.user2 || '').split(','),
		].map(toID).filter(Boolean);
		if (usernames.length > 2) {
			throw new ActionError(`Limit 2 usernames in a search`);
		}
		const page = Number(params.page || '1');
		const before = Number(params.before) || undefined;
		if (isNaN(page) || page !== Math.trunc(page) || page <= 0) {
			throw new ActionError(`Invalid page number: ${params.page}`);
		}
		if (params.page && before) {
			throw new ActionError(`Cannot set both "page" and "before", please choose one method of pagination`);
		}

		const search = {
			usernames: usernames,
			format: toID(params.format),
			page,
			before,
			byRating: params.sort === 'rating',
		};
		return Replays.search(search);
	},
	async 'replays/search.json'(params) {
		this.allowCORS();
		if (params.sort && params.sort !== 'rating' && params.sort !== 'date') {
			throw new ActionError('Sort must be "rating" or "date"');
		}
		const usernames = [
			...(params.username || params.user || '').split(','),
			...(params.username2 || params.user2 || '').split(','),
		].map(toID).filter(Boolean);
		if (usernames.length > 2) {
			throw new ActionError(`Limit 2 usernames in a search`);
		}
		const page = Number(params.page || '1');
		const before = Number(params.before) || undefined;
		if (isNaN(page) || page !== Math.trunc(page) || page <= 0) {
			throw new ActionError(`Invalid page number: ${params.page}`);
		}
		if (params.page && before) {
			throw new ActionError(`Cannot set both "page" and "before", please choose one method of pagination`);
		}

		const search = {
			usernames: usernames,
			format: toID(params.format),
			page,
			before,
			byRating: params.sort === 'rating',
		};
		const results = await Replays.search(search);
		this.response.setHeader('Content-Type', 'application/json');
		return JSON.stringify(results);
	},
	async 'replays/searchprivate'(params) {
		this.verifyCrossDomainRequest();

		if (!this.user.loggedIn) throw new ActionError(`Access denied: You must be logged in.`);
		if (params.sort && params.sort !== 'rating' && params.sort !== 'date') {
			throw new ActionError('Sort must be "rating" or "date"');
		}
		const usernames = [
			...(params.username || params.user || '').split(','),
			...(params.username2 || params.user2 || '').split(','),
		].map(toID).filter(Boolean);
		if (usernames.length > 2) {
			throw new ActionError(`Limit 2 usernames in a search`);
		}
		const page = Number(params.page || '1');
		const before = Number(params.before) || null;
		if (isNaN(page) || page !== Math.trunc(page) || page <= 0) {
			throw new ActionError(`Invalid page number: ${params.page}`);
		}
		if (params.page && before) {
			throw new ActionError(`Cannot set both "page" and "before", please choose one method of pagination`);
		}
		if (!(this.user.isSysop() || usernames.includes(this.user.id))) {
			throw new ActionError(`Access denied: You must be logged in as a username you're searching for.`);
		}

		const search = {
			usernames,
			format: toID(params.format),
			page,
			byRating: params.sort === 'rating',
			isPrivate: true,
		};
		return Replays.search(search);
	},
	async 'replays/edit'(params) {
		if (!this.user.isLeader()) throw new ActionError(`Access denied.`);
		const id = toID(params.id);
		if (!id) throw new ActionError(`No replay ID was provided.`);
		const replay = await tables.replays.get(id);
		if (!replay) throw new ActionError(`Replay ${id} not found.`);
		let pw;
		switch (Number(params.private)) {
		case 3:
			await tables.replays.update(id, {
				password: null,
				private: 3,
			});
			break;
		case 2: // private [1], no pass
			await tables.replays.update(id, {
				private: 1,
				password: null,
			});
			break;
		case 1:
			if (!replay.password) replay.password = Replays.generatePassword();
			pw = replay.password;
			await tables.replays.update(id, {
				private: 1,
				password: replay.password,
			});
			break;
		default:
			await tables.replays.update(id, {
				password: null,
				private: 0,
			});
			break;
		}
		return {password: pw};
	},
};

if (Config.actions) {
	Object.assign(actions, Config.actions);
}
