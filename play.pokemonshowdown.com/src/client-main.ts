/**
 * Client main
 *
 * Dependencies: client-core
 *
 * Sets up the main client models: Prefs, Teams, User, and PS.
 *
 * @author Guangcong Luo <guancongluo@gmail.com>
 * @license AGPLv3
 */

import { type PSConnection, PSLoginServer } from './client-connection';
import { PSModel, PSStreamModel } from './client-core';
import type { PSRoomPanel, PSRouter } from './panels';
import type { ChatRoom } from './panel-chat';
import type { MainMenuRoom } from './panel-mainmenu';
import { Dex, toID, type ID } from './battle-dex';
import { BattleTextParser, type Args } from './battle-text-parser';

declare const BattleTextAFD: any;
declare const BattleTextNotAFD: any;

/**********************************************************************
 * Prefs
 *********************************************************************/

/**
 * String that contains only lowercase alphanumeric characters.
 */
export type RoomID = Lowercase<string> & { __isRoomID: true };

const PSPrefsDefaults: { [key: string]: any } = {};

/**
 * Tracks user preferences, stored in localStorage. Contains most local
 * data, with the exception of backgrounds, teams, and session data,
 * which get their own models.
 *
 * Updates will name the key updated, so you don't need to overreact.
 */
class PSPrefs extends PSStreamModel<string | null> {
	// PREFS START HERE

	/**
	 * The theme to use. "system" matches the theme of the system accessing the client.
	 */
	theme: 'light' | 'dark' | 'system' = 'light';
	/**
	 * Disables animated GIFs, but keeps other animations enabled.
	 * Workaround for a Chrome 64 bug with GIFs.
	 * true - Disable GIFs, will be automatically re-enabled if you
	 *   switch away from Chrome 64.
	 * false - Enable GIFs all the time.
	 * null - Enable GIFs only on Chrome 64.
	 */
	nogif: boolean | null = null;
	/**
	 * Show "User joined" and "User left" messages. serverid:roomid
	 * table. Uses 1 and 0 instead of true/false for JSON packing
	 * reasons.
	 */
	showjoins: { [serverid: string]: { [roomid: string]: 1 | 0 } } | null = null;
	/**
	 * List of users whose messages should be ignored. serverid:userid
	 * table. Uses 1 and 0 instead of true/false for JSON packing
	 * reasons.
	 */
	ignore: { [serverid: string]: { [userid: string]: 1 | 0 } } | null = null;
	/**
	 * true = one panel, false = two panels, left and right
	 */
	onepanel: boolean | 'vertical' = false;

	mute = false;
	effectvolume = 50;
	musicvolume = 50;
	notifvolume = 50;

	afd: boolean | 'sprites' = false;

	// PREFS END HERE

	storageEngine: 'localStorage' | 'iframeLocalStorage' | '' = '';
	storage: { [k: string]: any } = {};
	readonly origin = `https://${Config.routes.client}`;
	constructor() {
		super();

		for (const key in this) {
			const value = (this as any)[key];
			if (['storage', 'subscriptions', 'origin', 'storageEngine', 'updates'].includes(key)) continue;
			if (typeof value === 'function') continue;
			PSPrefsDefaults[key] = value;
		}

		// set up local loading
		try {
			if (window.localStorage) {
				this.storageEngine = 'localStorage';
				this.load(JSON.parse(localStorage.getItem('showdown_prefs')!) || {}, true);
			}
		} catch {}
	}
	/**
	 * Change a preference.
	 */
	set<T extends keyof PSPrefs>(key: T, value: PSPrefs[T] | null) {
		if (value === null) {
			delete this.storage[key];
			(this as any)[key] = PSPrefsDefaults[key];
		} else {
			this.storage[key] = value;
			(this as any)[key] = value;
		}
		this.update(key);
		this.save();
	}

	load(newPrefs: object, noSave?: boolean) {
		this.fixPrefs(newPrefs);
		Object.assign(this, PSPrefsDefaults);
		this.storage = newPrefs;
		for (const key in PSPrefsDefaults) {
			if (key in newPrefs) (this as any)[key] = (newPrefs as any)[key];
		}
		this.setAFD();
		this.update(null);
		if (!noSave) this.save();
	}
	save() {
		switch (this.storageEngine) {
		case 'localStorage':
			localStorage.setItem('showdown_prefs', JSON.stringify(this.storage));
		}
	}
	fixPrefs(newPrefs: any) {
		const oldShowjoins = newPrefs['showjoins'];
		if (oldShowjoins !== undefined && typeof oldShowjoins !== 'object') {
			const showjoins: { [serverid: string]: { [roomid: string]: 1 | 0 } } = {};
			const serverShowjoins: { [roomid: string]: 1 | 0 } = { global: (oldShowjoins ? 1 : 0) };
			const showroomjoins = newPrefs['showroomjoins'] as { [roomid: string]: boolean };
			for (const roomid in showroomjoins) {
				serverShowjoins[roomid] = (showroomjoins[roomid] ? 1 : 0);
			}
			delete newPrefs['showroomjoins'];
			showjoins[Config.server.id] = serverShowjoins;
			newPrefs['showjoins'] = showjoins;
		}

		const isChrome64 = navigator.userAgent.includes(' Chrome/64.');
		if (newPrefs['nogif'] !== undefined) {
			if (!isChrome64) {
				delete newPrefs['nogif'];
			}
		} else if (isChrome64) {
			newPrefs['nogif'] = true;
			PS.alert('Your version of Chrome has a bug that makes animated GIFs freeze games sometimes, so certain animations have been disabled. Only some people have the problem, so you can experiment and enable them in the Options menu setting "Disable GIFs for Chrome 64 bug".');
		}

		const colorSchemeQuerySupported = window.matchMedia?.('(prefers-color-scheme: dark)').media !== 'not all';
		if (newPrefs['theme'] === 'system' && !colorSchemeQuerySupported) {
			newPrefs['theme'] = 'light';
		}
		if (newPrefs['dark'] !== undefined) {
			if (newPrefs['dark']) {
				newPrefs['theme'] = 'dark';
			}
			delete newPrefs['dark'];
		}
	}

	setAFD(mode?: typeof this['afd']) {
		if (mode === undefined) {
			// init
			if (typeof BattleTextAFD !== 'undefined') {
				for (const id in BattleTextNotAFD) {
					if (!BattleTextAFD[id]) {
						BattleTextAFD[id] = BattleTextNotAFD[id];
					} else {
						BattleTextAFD[id] = { ...BattleTextNotAFD[id], ...BattleTextAFD[id] };
					}
				}
			}

			if (Config.server.afd) {
				mode = true;
			} else if (this.afd !== undefined) {
				mode = this.afd;
			} else {
				// uncomment on April Fools' Day
				// mode = true;
			}
		}

		Dex.afdMode = mode;

		if (mode === true) {
			(BattleText as any) = BattleTextAFD;
		} else {
			(BattleText as any) = BattleTextNotAFD;
		}
	}
}

/**********************************************************************
 * Teams
 *********************************************************************/

export interface Team {
	name: string;
	format: ID;
	packedTeam: string;
	folder: string;
	/** The icon cache must be cleared (to `null`) whenever `packedTeam` is modified */
	iconCache: preact.ComponentChildren;
	key: string;
}
if (!window.BattleFormats) window.BattleFormats = {};

/**
 * This model tracks teams and formats, updating when either is updated.
 */
class PSTeams extends PSStreamModel<'team' | 'format'> {
	/** false if it uses the ladder in the website */
	usesLocalLadder = false;
	list: Team[] = [];
	byKey: { [key: string]: Team | undefined } = {};
	deletedTeams: [Team, number][] = [];
	constructor() {
		super();
		try {
			this.unpackAll(localStorage.getItem('showdown_teams'));
		} catch {}
	}
	teambuilderFormat(format: string): ID {
		const ruleSepIndex = format.indexOf('@@@');
		if (ruleSepIndex >= 0) format = format.slice(0, ruleSepIndex);
		const formatid = toID(format);
		if (!window.BattleFormats) return formatid;
		const formatEntry = BattleFormats[formatid];
		return formatEntry?.teambuilderFormat || formatid;
	}
	getKey(name: string) {
		const baseKey: string = toID(name) || '0';
		let key = baseKey;
		let i = 1;
		while (key in this.byKey) {
			i++;
			key = `${baseKey}-${i}`;
		}
		return key;
	}
	unpackAll(buffer: string | null) {
		if (!buffer) {
			this.list = [];
			return;
		}

		if (buffer.startsWith('[') && !buffer.trim().includes('\n')) {
			this.unpackOldBuffer(buffer);
			return;
		}

		this.list = [];
		for (const line of buffer.split('\n')) {
			const team = this.unpackLine(line);
			if (team) this.push(team);
		}
		this.update('team');
	}
	push(team: Team) {
		team.key = this.getKey(team.name);
		this.list.push(team);
		this.byKey[team.key] = team;
	}
	unshift(team: Team) {
		team.key = this.getKey(team.name);
		this.list.unshift(team);
		this.byKey[team.key] = team;
	}
	delete(team: Team) {
		const teamIndex = this.list.indexOf(team);
		if (teamIndex < 0) return false;
		this.deletedTeams.push([team, teamIndex]);
		this.list.splice(teamIndex, 1);
		delete this.byKey[team.key];
	}
	undelete() {
		if (!this.deletedTeams.length) return;
		const [team, teamIndex] = this.deletedTeams.pop()!;
		this.list.splice(teamIndex, 0, team);
		if (this.byKey[team.key]) team.key = this.getKey(team.name);
		this.byKey[team.key] = team;
	}
	unpackOldBuffer(buffer: string) {
		PS.alert(`Your team storage format is too old for PS. You'll need to upgrade it at https://${Config.routes.client}/recoverteams.html`);
		this.list = [];
	}
	packAll(teams: Team[]) {
		return teams.map(team => (
			(team.format ? `${team.format}]` : ``) + (team.folder ? `${team.folder}/` : ``) + team.name + `|` + team.packedTeam
		)).join('\n');
	}
	save() {
		try {
			localStorage.setItem('showdown_teams', this.packAll(this.list));
		} catch {}
		this.update('team');
	}
	unpackLine(line: string): Team | null {
		let pipeIndex = line.indexOf('|');
		if (pipeIndex < 0) return null;
		let bracketIndex = line.indexOf(']');
		if (bracketIndex > pipeIndex) bracketIndex = -1;
		let slashIndex = line.lastIndexOf('/', pipeIndex);
		if (slashIndex < 0) slashIndex = bracketIndex; // line.slice(slashIndex + 1, pipeIndex) will be ''
		let format = bracketIndex > 0 ? line.slice(0, bracketIndex) : 'gen7';
		if (!format.startsWith('gen')) format = 'gen6' + format;
		const name = line.slice(slashIndex + 1, pipeIndex);
		return {
			name,
			format: format as ID,
			folder: line.slice(bracketIndex + 1, slashIndex > 0 ? slashIndex : bracketIndex + 1),
			packedTeam: line.slice(pipeIndex + 1),
			iconCache: null,
			key: '',
		};
	}
}

/**********************************************************************
 * User
 *********************************************************************/

export type PSLoginState = { error?: string, success?: true, name?: string, needsPassword?: true, needsGoogle?: true };
class PSUser extends PSStreamModel<PSLoginState | null> {
	name = "";
	group = '';
	userid = "" as ID;
	named = false;
	registered = false;
	avatar = "1";
	challstr = '';
	loggingIn: string | null = null;
	initializing = true;
	gapiLoaded = false;
	setName(fullName: string, named: boolean, avatar: string) {
		const loggingIn = (!this.named && named);
		const { name, group } = BattleTextParser.parseNameParts(fullName);
		this.name = name;
		this.group = group;
		this.userid = toID(name);
		this.named = named;
		this.avatar = avatar;
		this.update(null);
		if (loggingIn) {
			for (const roomid in PS.rooms) {
				const room = PS.rooms[roomid]!;
				if (room.connectWhenLoggedIn) room.connect();
			}
		}
	}
	validateName(name: string): string {
		// | , ; are not valid characters in names
		name = name.replace(/[|,;]+/g, '');
		const replaceList = {
			'A': 'ＡⱯȺ', 'B': 'ＢƂƁɃ', 'C': 'ＣꜾȻ', 'D': 'ＤĐƋƊƉꝹ', 'E': 'ＥƐƎ', 'F': 'ＦƑꝻ', 'G': 'ＧꞠꝽꝾ', 'H': 'ＨĦⱧⱵꞍ', 'I': 'ＩƗ', 'J': 'ＪɈ', 'K': 'ＫꞢ', 'L': 'ＬꝆꞀ', 'M': 'ＭⱮƜ', 'N': 'ＮȠƝꞐꞤ', 'O': 'ＯǪǬØǾƆƟꝊꝌ', 'P': 'ＰƤⱣꝐꝒꝔ', 'Q': 'ＱꝖꝘɊ', 'R': 'ＲɌⱤꝚꞦꞂ', 'S': 'ＳẞꞨꞄ', 'T': 'ＴŦƬƮȾꞆ', 'U': 'ＵɄ', 'V': 'ＶƲꝞɅ', 'W': 'ＷⱲ', 'X': 'Ｘ', 'Y': 'ＹɎỾ', 'Z': 'ＺƵȤⱿⱫꝢ', 'a': 'ａąⱥɐ', 'b': 'ｂƀƃɓ', 'c': 'ｃȼꜿↄ', 'd': 'ｄđƌɖɗꝺ', 'e': 'ｅɇɛǝ', 'f': 'ｆḟƒꝼ', 'g': 'ｇɠꞡᵹꝿ', 'h': 'ｈħⱨⱶɥ', 'i': 'ｉɨı', 'j': 'ｊɉ', 'k': 'ｋƙⱪꝁꝃꝅꞣ', 'l': 'ｌſłƚɫⱡꝉꞁꝇ', 'm': 'ｍɱɯ', 'n': 'ｎƞɲŉꞑꞥ', 'o': 'ｏǫǭøǿɔꝋꝍɵ', 'p': 'ｐƥᵽꝑꝓꝕ', 'q': 'ｑɋꝗꝙ', 'r': 'ｒɍɽꝛꞧꞃ', 's': 'ｓꞩꞅẛ', 't': 'ｔŧƭʈⱦꞇ', 'u': 'ｕưừứữửựųṷṵʉ', 'v': 'ｖʋꝟʌ', 'w': 'ｗⱳ', 'x': 'ｘ', 'y': 'ｙɏỿ', 'z': 'ｚƶȥɀⱬꝣ', 'AA': 'Ꜳ', 'AE': 'ÆǼǢ', 'AO': 'Ꜵ', 'AU': 'Ꜷ', 'AV': 'ꜸꜺ', 'AY': 'Ꜽ', 'DZ': 'ǱǄ', 'Dz': 'ǲǅ', 'LJ': 'Ǉ', 'Lj': 'ǈ', 'NJ': 'Ǌ', 'Nj': 'ǋ', 'OI': 'Ƣ', 'OO': 'Ꝏ', 'OU': 'Ȣ', 'TZ': 'Ꜩ', 'VY': 'Ꝡ', 'aa': 'ꜳ', 'ae': 'æǽǣ', 'ao': 'ꜵ', 'au': 'ꜷ', 'av': 'ꜹꜻ', 'ay': 'ꜽ', 'dz': 'ǳǆ', 'hv': 'ƕ', 'lj': 'ǉ', 'nj': 'ǌ', 'oi': 'ƣ', 'ou': 'ȣ', 'oo': 'ꝏ', 'ss': 'ß', 'tz': 'ꜩ', 'vy': 'ꝡ',
		};
		const normalizeList = {
			'A': 'ÀÁÂẦẤẪẨÃĀĂẰẮẴẲȦǠÄǞẢÅǺǍȀȂẠẬẶḀĄ', 'B': 'ḂḄḆ', 'C': 'ĆĈĊČÇḈƇ', 'D': 'ḊĎḌḐḒḎ', 'E': 'ÈÉÊỀẾỄỂẼĒḔḖĔĖËẺĚȄȆẸỆȨḜĘḘḚ', 'F': 'Ḟ', 'G': 'ǴĜḠĞĠǦĢǤƓ', 'H': 'ĤḢḦȞḤḨḪ', 'I': 'ÌÍÎĨĪĬİÏḮỈǏȈȊỊĮḬ', 'J': 'Ĵ', 'K': 'ḰǨḲĶḴƘⱩꝀꝂꝄ', 'L': 'ĿĹĽḶḸĻḼḺŁȽⱢⱠꝈ', 'M': 'ḾṀṂ', 'N': 'ǸŃÑṄŇṆŅṊṈ', 'O': 'ÒÓÔỒỐỖỔÕṌȬṎŌṐṒŎȮȰÖȪỎŐǑȌȎƠỜỚỠỞỢỌỘ', 'P': 'ṔṖ', 'Q': '', 'R': 'ŔṘŘȐȒṚṜŖṞ', 'S': 'ŚṤŜṠŠṦṢṨȘŞⱾ', 'T': 'ṪŤṬȚŢṰṮ', 'U': 'ÙÚÛŨṸŪṺŬÜǛǗǕǙỦŮŰǓȔȖƯỪỨỮỬỰỤṲŲṶṴ', 'V': 'ṼṾ', 'W': 'ẀẂŴẆẄẈ', 'X': 'ẊẌ', 'Y': 'ỲÝŶỸȲẎŸỶỴƳ', 'Z': 'ŹẐŻŽẒẔ', 'a': 'ẚàáâầấẫẩãāăằắẵẳȧǡäǟảåǻǎȁȃạậặḁ', 'b': 'ḃḅḇ', 'c': 'ćĉċčçḉƈ', 'd': 'ḋďḍḑḓḏ', 'e': 'èéêềếễểẽēḕḗĕėëẻěȅȇẹệȩḝęḙḛ', 'f': '', 'g': 'ǵĝḡğġǧģǥ', 'h': 'ĥḣḧȟḥḩḫẖ', 'i': 'ìíîĩīĭïḯỉǐȉȋịįḭ', 'j': 'ĵǰ', 'k': 'ḱǩḳķḵ', 'l': 'ŀĺľḷḹļḽḻ', 'm': 'ḿṁṃ', 'n': 'ǹńñṅňṇņṋṉ', 'o': 'òóôồốỗổõṍȭṏōṑṓŏȯȱöȫỏőǒȍȏơờớỡởợọộ', 'p': 'ṕṗ', 'q': '', 'r': 'ŕṙřȑȓṛṝŗṟ', 's': 'śṥŝṡšṧṣṩșşȿ', 't': 'ṫẗťṭțţṱṯ', 'u': 'ùúûũṹūṻŭüǜǘǖǚủůűǔȕȗụṳ', 'v': 'ṽṿ', 'w': 'ẁẃŵẇẅẘẉ', 'x': 'ẋẍ', 'y': 'ỳýŷỹȳẏÿỷẙỵƴ', 'z': 'źẑżžẓẕ',
		};
		const replaceRegexes: [RegExp, string][] = [];
		for (const i in replaceList) {
			replaceRegexes.push([new RegExp('[' + replaceList[i as 'A'] + ']', 'g'), i]);
		}
		const normalizeRegexes: [RegExp, string][] = [];
		for (const i in normalizeList) {
			normalizeRegexes.push([new RegExp('[' + normalizeList[i as 'A'] + ']', 'g'), i]);
		}

		for (const [regex, replacement] of replaceRegexes) {
			name = name.replace(regex, replacement);
		}
		for (const [regex, replacement] of normalizeRegexes) {
			name = name.replace(regex, replacement);
		}
		return name.trim();
	}
	changeName(name: string) {
		name = this.validateName(name);
		const userid = toID(name);
		if (!userid) {
			this.updateLogin({ name, error: "Usernames must contain at least one letter." });
			return;
		}

		if (userid === this.userid) {
			PS.send(`|/trn ${name}`);
			this.update({ success: true });
			return;
		}
		this.loggingIn = name;
		this.update(null);
		PSLoginServer.rawQuery(
			'getassertion', { userid, challstr: this.challstr }
		).then(res => {
			this.handleAssertion(name, res);
		});
	}
	changeNameWithPassword(name: string, password: string, special: PSLoginState = { needsPassword: true }) {
		this.loggingIn = name;
		if (!password && !special) {
			this.updateLogin({
				name,
				error: "Password can't be empty.",
				...special as any,
			});
		}
		this.update(null);
		PSLoginServer.query(
			'login', { name, pass: password, challstr: this.challstr }
		).then(data => {
			this.loggingIn = null;
			if (data?.curuser?.loggedin) {
				// success!
				this.handleAssertion(name, data.assertion);
			} else {
				// wrong password
				if (special.needsGoogle) {
					try {
						// @ts-expect-error gapi included dynamically
						gapi.auth2.getAuthInstance().signOut();
					} catch {}
				}
				this.updateLogin({
					name,
					error: data?.error || 'Wrong password.',
					...special as any,
				});
			}
		});
	}
	updateLogin(update: PSLoginState) {
		this.update(update);
		if (!PS.rooms['login']) {
			PS.join('login' as RoomID, { args: update });
		}
	}
	handleAssertion(name: string, assertion?: string | null) {
		if (!assertion) {
			PS.alert("Error logging in.");
			return;
		}
		this.loggingIn = null;
		if (assertion.slice(0, 14).toLowerCase() === '<!doctype html') {
			// some sort of MitM proxy; ignore it
			const endIndex = assertion.indexOf('>');
			if (endIndex > 0) assertion = assertion.slice(endIndex + 1);
		}
		if (assertion.startsWith('\r')) assertion = assertion.slice(1);
		if (assertion.startsWith('\n')) assertion = assertion.slice(1);
		if (assertion.includes('<')) {
			PS.alert("Something is interfering with our connection to the login server. Most likely, your internet provider needs you to re-log-in, or your internet provider is blocking Pokémon Showdown.");
			return;
		}
		if (assertion === ';') {
			this.updateLogin({ name, needsPassword: true });
		} else if (assertion === ';;@gmail') {
			this.updateLogin({ name, needsGoogle: true });
		} else if (assertion.startsWith(';;')) {
			this.updateLogin({ error: assertion.slice(2) });
		} else if (assertion.includes('\n') || !assertion) {
			PS.alert("Something is interfering with our connection to the login server.");
		} else {
			PS.send(`|/trn ${name},0,${assertion}`);
			this.update({ success: true });
		}
	}
	logOut() {
		PSLoginServer.query(
			'logout', { userid: this.userid }
		);
		PS.send('|/logout');
		PS.connection?.disconnect();

		PS.alert("You have been logged out and disconnected.\n\nIf you wanted to change your name while staying connected, use the 'Change Name' button or the '/nick' command.");
		this.name = "";
		this.group = '';
		this.userid = "" as ID;
		this.named = false;
		this.registered = false;
		this.update(null);
	}
}

/**********************************************************************
 * Server
 *********************************************************************/

interface PSGroup {
	name?: string;
	type?: 'leadership' | 'staff' | 'punishment';
	order: number;
}

class PSServer {
	id = Config.defaultserver.id;
	host = Config.defaultserver.host;
	port = Config.defaultserver.port;
	altport = Config.defaultserver.altport;
	registered = Config.defaultserver.registered;
	prefix = '/showdown';
	protocol: 'http' | 'https' = Config.defaultserver.httpport ? 'https' : 'http';
	groups: { [symbol: string]: PSGroup } = {
		'#': {
			name: "Room Owner (#)",
			type: 'leadership',
			order: 101,
		},
		'~': {
			name: "Administrator (~)",
			type: 'leadership',
			order: 102,
		},
		'&': {
			name: "Administrator (&)",
			type: 'leadership',
			order: 103,
		},
		'\u2605': {
			name: "Host (\u2605)",
			type: 'staff',
			order: 104,
		},
		'@': {
			name: "Moderator (@)",
			type: 'staff',
			order: 105,
		},
		'%': {
			name: "Driver (%)",
			type: 'staff',
			order: 106,
		},
		// by default, unrecognized ranks go here, between driver and bot
		'*': {
			name: "Bot (*)",
			order: 109,
		},
		'\u2606': {
			name: "Player (\u2606)",
			order: 110,
		},
		'+': {
			name: "Voice (+)",
			order: 200,
		},
		' ': {
			order: 201,
		},
		'!': {
			name: "Muted (!)",
			type: 'punishment',
			order: 301,
		},
		'✖': {
			name: "Namelocked (\u2716)",
			type: 'punishment',
			order: 302,
		},
		'\u203d': {
			name: "Locked (\u203d)",
			type: 'punishment',
			order: 303,
		},
	};
	defaultGroup: PSGroup = {
		order: 108,
	};
	getGroup(symbol: string | undefined) {
		return this.groups[(symbol || ' ').charAt(0)] || this.defaultGroup;
	}
}

/**********************************************************************
 * Rooms
 *********************************************************************/

type PSRoomLocation = 'left' | 'right' | 'popup' | 'mini-window' | 'modal-popup' | 'semimodal-popup';

export interface RoomOptions {
	id: RoomID;
	title?: string;
	/** @see {PS.roomTypes} */
	type?: string;
	location?: PSRoomLocation | null;
	/**
	 * In case the room received messages before it was ready for them.
	 */
	backlog?: Args[] | null;
	/**
	 * Popup parent element. If it exists, a popup shows up right above/below that element.
	 *
	 * No effect on non-popup panels.
	 */
	parentElem?: HTMLElement | null;
	/**
	 * Popup's parent room. Inferred from `parentElem`. Closes any popup that isn't this popup.
	 *
	 * No effect on non-popup panels.
	 */
	parentRoomid?: RoomID | null;
	/** Opens the popup to the right of its parent, instead of the default above/below (for userlists) */
	rightPopup?: boolean;
	connected?: boolean;
	/** @see {PSRoomPanelSubclass#noURL} */
	noURL?: boolean;
	args?: Record<string, unknown> | null;
}

interface PSNotificationState {
	title: string;
	body?: string;
	/** Used to identify notifications to be dismissed - '' if you only want to autodismiss */
	id: string;
	/** normally: automatically dismiss the notification when viewing the room; set this to require manual dismissing */
	noAutoDismiss: boolean;
}

/**
 * As a PSStreamModel, PSRoom can emit `Args` to mean "we received a message",
 * and `null` to mean "tell Preact to re-render this room"
 */
export class PSRoom extends PSStreamModel<Args | null> implements RoomOptions {
	id: RoomID;
	title = "";
	type = '';
	readonly classType: string = '';
	location: PSRoomLocation = 'left';
	closable = true;
	/**
	 * Whether the room is connected to the server. This mostly tracks
	 * "should we send /leave if the user closes the room?"
	 *
	 * In particular, this is `true` after sending `/join`, and `false`
	 * after sending `/leave`, even before the server responds.
	 */
	connected = false;
	/**
	 * Can this room even be connected to at all?
	 * `true` = pass messages from the server to subscribers
	 * `false` = throw an error if we receive messages from the server
	 */
	readonly canConnect: boolean = false;
	connectWhenLoggedIn = false;
	onParentEvent: ((eventId: 'focus' | 'keydown', e?: Event) => false | void) | null = null;

	width = 0;
	height = 0;
	/**
	 * popups sometimes initialize hidden, to calculate their position from their
	 * width/height without flickering. But hidden popups can't be focused, so
	 * we need to track their focus timing here.
	 */
	hiddenInit = false;
	parentElem: HTMLElement | null = null;
	rightPopup = false;

	notifications: PSNotificationState[] = [];
	isSubtleNotifying = false;

	/** only affects mini-windows */
	minimized = false;
	caughtError: string | undefined;
	/** @see {PSRoomPanelSubclass#noURL} */
	noURL: boolean;
	args: Record<string, unknown> | null;

	constructor(options: RoomOptions) {
		super();
		this.id = options.id;
		this.title = options.title || this.title || this.id;
		if (options.type) this.type = options.type;
		if (options.location) this.location = options.location;
		if (options.parentElem) this.parentElem = options.parentElem;
		if (this.location !== 'popup' && this.location !== 'semimodal-popup') this.parentElem = null;
		if (options.rightPopup) this.rightPopup = true;
		if (options.connected) this.connected = true;
		if (options.backlog) this.backlog = options.backlog;
		this.noURL = options.noURL || false;
		this.args = options.args || null;
	}
	notify(options: { title: string, body?: string, noAutoDismiss?: boolean, id?: string }) {
		if (PS.isVisible(this)) return;
		if (options.noAutoDismiss && !options.id) {
			throw new Error(`Must specify id for manual dismissing`);
		}
		if (options.id) {
			this.notifications = this.notifications.filter(notification => notification.id !== options.id);
		}
		this.notifications.push({
			title: options.title,
			body: options.body,
			id: options.id || '',
			noAutoDismiss: options.noAutoDismiss || false,
		});
		PS.update();
	}
	subtleNotify() {
		if (PS.isVisible(this)) return;
		this.isSubtleNotifying = true;
	}
	dismissNotification(id: string) {
		this.notifications = this.notifications.filter(notification => notification.id !== id);
		PS.update();
	}
	autoDismissNotifications() {
		this.notifications = this.notifications.filter(notification => notification.noAutoDismiss);
		this.isSubtleNotifying = false;
	}
	connect(): void {
		throw new Error(`This room is not designed to connect to a server room`);
	}
	receiveLine(args: Args): void {
		switch (args[0]) {
		case 'title': {
			this.title = args[1];
			PS.update();
			break;
		} case 'tempnotify': {
			const [, id, title, body, toHighlight] = args;
			this.notify({ title, body, id });
			break;
		} case 'tempnotifyoff': {
			const [, id] = args;
			this.dismissNotification(id);
			break;
		} default: {
			if (this.canConnect) {
				this.update(args);
			} else {
				throw new Error(`This room is not designed to receive messages`);
			}
		}
		}
	}
	/**
	 * Handles outgoing messages, like `/logout`. Return `true` to prevent
	 * the line from being sent to servers.
	 */
	handleSend(line: string) {
		if (!line.startsWith('/') || line.startsWith('//')) return false;
		const spaceIndex = line.indexOf(' ');
		const cmd = spaceIndex >= 0 ? line.slice(1, spaceIndex) : line.slice(1);
		const target = spaceIndex >= 0 ? line.slice(spaceIndex + 1) : '';
		switch (cmd) {
		case 'logout':
			PS.user.logOut();
			return true;
		case 'cancelsearch':
			PS.mainmenu.cancelSearch();
			return true;
		case 'nick':
			if (target) {
				PS.user.changeName(target);
			} else {
				PS.join('login' as RoomID);
			}
			return true;
		}
		return false;
	}
	send(msg: string) {
		if (!msg) return;
		if (this.handleSend(msg)) return;
		this.sendDirect(msg);
	}
	sendDirect(msg: string) {
		PS.send(this.id + '|' + msg);
	}
	destroy() {
		if (this.connected) {
			this.sendDirect('/noreply /leave');
			this.connected = false;
		}
	}
}

class PlaceholderRoom extends PSRoom {
	override readonly classType = 'placeholder';
	override receiveLine(args: Args) {
		(this.backlog ||= []).push(args);
	}
}

/**********************************************************************
 * PS
 *********************************************************************/

type PSRoomPanelSubclass = (new () => PSRoomPanel) & {
	readonly id: string,
	readonly routes: string[],
	/** optional Room class */
	readonly Model?: typeof PSRoom,
	readonly location?: PSRoomLocation,
	/** do not put the roomid into the URL */
	noURL?: boolean,
	icon?: preact.ComponentChildren,
	title?: string,
};

/**
 * This model updates:
 * - when a room is joined or left
 * - changing which room is focused
 * - changing the width of the left room, in two-panel mode
 */
export const PS = new class extends PSModel {
	down: string | boolean = false;

	prefs = new PSPrefs();
	teams = new PSTeams();
	user = new PSUser();
	server = new PSServer();
	connection: PSConnection | null = null;
	connected = false;
	/**
	 * While PS is technically disconnected while it's trying to connect,
	 * it still shows UI like it's connected, so you can click buttons
	 * before the server connection is established.
	 *
	 * `isOffline` is only set if PS is neither connected nor trying to
	 * connect.
	 */
	isOffline = false;

	router: PSRouter = null!;

	rooms: { [roomid: string]: PSRoom | undefined } = {};
	roomTypes: {
		[type: string]: PSRoomPanelSubclass | undefined,
	} = {};
	/**
	 * If a route starts with `*`, it's a cached room location for the room placeholder.
	 * Otherwise, it's a RoomType ID.
	 *
	 * Routes are filled in by `PS.updateRoomTypes()` and do not need to be manually
	 * filled.
	 */
	routes: Record<string, string> = Object.assign(Object.create(null), {
		// locations cached here because it needs to be guessed before roomTypes is filled in
		// this cache is optional, but prevents some flickering during loading
		// to update:
		// console.log('\t\t' + JSON.stringify(Object.fromEntries(Object.entries(PS.routes).filter(([k, v]) => k !== 'dm-*').map(([k, v]) => [k, '*' + (PS.roomTypes[v].location || '')]))).replaceAll(',', ',\n\t\t').replaceAll('":"', '": "').slice(1, -1) + ',')
		"teambuilder": "*",
		"news": "*mini-window",
		"": "*",
		"rooms": "*right",
		"user-*": "*popup",
		"viewuser-*": "*popup",
		"volume": "*popup",
		"options": "*popup",
		"*": "*right",
		"battle-*": "*",
		"battles": "*right",
		"teamdropdown": "*semimodal-popup",
		"formatdropdown": "*semimodal-popup",
		"team-*": "*",
		"ladder": "*",
		"ladder-*": "*",
		"view-*": "*",
		"login": "*semimodal-popup",
	});
	/** List of rooms on the left side of the top tabbar */
	leftRoomList: RoomID[] = [];
	/** List of rooms on the right side of the top tabbar */
	rightRoomList: RoomID[] = [];
	/** List of mini-rooms in the Main Menu */
	miniRoomList: RoomID[] = [];
	/** Currently active popups, in stack order (bottom to top) */
	popups: RoomID[] = [];

	/**
	 * Currently active left room.
	 *
	 * In two-panel mode, this will be the visible left panel.
	 *
	 * In one-panel mode, this is the visible room only if it is
	 * `PS.room`. Still tracked when not visible, so we know which
	 * panels to display if PS is resized to two-panel mode.
	 */
	leftPanel: PSRoom = null!;
	/**
	 * Currently active right room.
	 *
	 * In two-panel mode, this will be the visible right panel.
	 *
	 * In one-panel mode, this is the visible room only if it is
	 * `PS.room`. Still tracked when not visible, so we know which
	 * panels to display if PS is resized to two-panel mode.
	 */
	rightPanel: PSRoom | null = null;
	/**
	 * The currently focused room. Should always be the topmost popup
	 * if it exists. If no popups are open, it should be
	 * `PS.panel`.
	 *
	 * Determines which room receives keyboard shortcuts.
	 *
	 * Clicking inside a panel will focus it, in two-panel mode.
	 */
	room: PSRoom = null!;
	/**
	 * The currently active panel. Should always be either `PS.leftRoom`
	 * or `PS.rightRoom`. If no popups are open, should be `PS.room`.
	 *
	 * In one-panel mode, determines whether the left or right panel is
	 * visible. Otherwise, no effect.
	 */
	panel: PSRoom = null!;
	/**
	 * * 0 = only one panel visible
	 * * null = vertical nav layout
	 * n.b. PS will only update if the left room width changes. Resizes
	 * that don't change the left room width will not trigger an update.
	 */
	leftPanelWidth: number | null = 0;
	mainmenu: MainMenuRoom = null!;

	/**
	 * The drag-and-drop API is incredibly dumb and doesn't let us know
	 * what's being dragged until the `drop` event, so we track it here.
	 *
	 * Note that `PS.dragging` will be null if the drag was initiated
	 * outside PS (e.g. dragging a team from File Explorer to PS), and
	 * for security reasons it's impossible to know what they are until
	 * they're dropped.
	 */
	dragging: { type: 'room', roomid: RoomID, foreground?: boolean } | null = null;

	/** Tracks whether or not to display the "Use arrow keys" hint */
	arrowKeysUsed = false;

	newsHTML = document.querySelector('#room-news .mini-window-body')?.innerHTML || '';

	constructor() {
		super();

		this.mainmenu = this.addRoom({
			id: '' as RoomID,
			title: "Home",
		}) as MainMenuRoom;

		this.addRoom({
			id: 'rooms' as RoomID,
			title: "Rooms",
		});

		if (this.newsHTML) {
			this.addRoom({
				id: 'news' as RoomID,
				title: "News",
			}, true);
		}

		this.updateLayout();
		window.addEventListener('resize', () => {
			// super.update() skips another updateLayout() call
			if (this.updateLayout()) super.update();
		});
	}

	// Panel layout
	///////////////
	/**
	 * "minWidth" and "maxWidth" are a bit deceptive here - to be clear,
	 * all PS rooms are expected to responsively support any width from
	 * 320px up, when in single panel mode. These metrics are used purely
	 * to calculate the location of the separator in two-panel mode.
	 *
	 * - `minWidth` - minimum width as a right-panel
	 * - `width` - preferred width, minimum width as a left-panel
	 * - `maxWidth` - maximum width as a left-panel
	 *
	 * PS will only show two panels if it can fit `width` in the left, and
	 * `minWidth` in the right. Extra space will be given to to right panel
	 * until it reaches `width`, then evenly distributed until both panels
	 * reach `maxWidth`, and extra space above that will be given to the
	 * right panel.
	 */
	getWidthFor(room: PSRoom) {
		switch (room.type) {
		case 'mainmenu':
			return {
				minWidth: 340,
				width: 628,
				maxWidth: 628,
				isMainMenu: true,
			};
		case 'chat':
		case 'rooms':
		case 'battles':
			return {
				minWidth: 320,
				width: 570,
				maxWidth: 640,
			};
		case 'battle':
			return {
				minWidth: 320,
				width: 956,
				maxWidth: 1180,
			};
		}
		return {
			minWidth: 640,
			width: 640,
			maxWidth: 640,
		};
	}
	/** @returns changed */
	updateLayout(): boolean {
		const leftPanelWidth = this.calculateLeftPanelWidth();
		const totalWidth = document.body.offsetWidth;
		const totalHeight = document.body.offsetHeight;
		const roomHeight = totalHeight - 56;
		if (leftPanelWidth === null) {
			this.panel.width = totalWidth - 200;
			this.panel.height = totalHeight;
		} else if (leftPanelWidth) {
			this.leftPanel.width = leftPanelWidth;
			this.leftPanel.height = roomHeight;
			this.rightPanel!.width = totalWidth + 1 - leftPanelWidth;
			this.rightPanel!.height = roomHeight;
		} else {
			this.panel.width = totalWidth;
			this.panel.height = roomHeight;
		}

		if (this.leftPanelWidth !== leftPanelWidth) {
			this.leftPanelWidth = leftPanelWidth;
			return true;
		}
		return false;
	}
	getRoom(elem: HTMLElement | EventTarget | null | undefined, skipClickable?: boolean): PSRoom | null {
		let curElem: HTMLElement | null = elem as HTMLElement;
		while (curElem) {
			if (curElem.id.startsWith('room-')) {
				return PS.rooms[curElem.id.slice(5)] || null;
			}
			if (curElem.getAttribute('data-roomid')) {
				return PS.rooms[curElem.getAttribute('data-roomid') as RoomID] || null;
			}
			if (skipClickable && (
				curElem.tagName === 'A' || curElem.tagName === 'BUTTON' || curElem.tagName === 'INPUT' ||
				curElem.tagName === 'SELECT' || curElem.tagName === 'TEXTAREA' || curElem.tagName === 'LABEL' ||
				curElem.classList?.contains('textbox') || curElem.classList?.contains('username')
			)) {
				return null;
			}
			curElem = curElem.parentElement;
		}
		return null;
	}
	dragOnto(fromRoom: PSRoom, toLocation: 'left' | 'right' | 'mini-window', toIndex: number) {
		// one day you will be able to rearrange mainmenu and rooms, but not today
		if (fromRoom.id === '' || fromRoom.id === 'rooms') return;

		const onHome = (toLocation === 'left' && toIndex === 0);

		PS.moveRoom(fromRoom, toLocation, onHome, toIndex);
		PS.update();
	}
	override update() {
		this.updateLayout();
		super.update();
	}
	receive(msg: string) {
		msg = msg.endsWith('\n') ? msg.slice(0, -1) : msg;
		let roomid = '' as RoomID;
		if (msg.startsWith('>')) {
			const nlIndex = msg.indexOf('\n');
			roomid = msg.slice(1, nlIndex) as RoomID;
			msg = msg.slice(nlIndex + 1);
		}
		const roomid2 = roomid || 'lobby' as RoomID;
		let room = PS.rooms[roomid];
		console.log('\u2705 ' + (roomid ? '[' + roomid + '] ' : '') + '%c' + msg, "color: #007700");
		let isInit = false;
		for (const line of msg.split('\n')) {
			const args = BattleTextParser.parseLine(line);
			switch (args[0]) {
			case 'init': {
				isInit = true;
				room = PS.rooms[roomid2];
				const [, type] = args;
				if (!room) {
					this.addRoom({
						id: roomid2,
						type,
						connected: true,
					}, roomid === 'staff' || roomid === 'upperstaff');
					room = PS.rooms[roomid2];
				} else {
					room.type = type;
					room.connected = true;
					this.updateRoomTypes();
				}
				this.update();
				continue;
			} case 'deinit': {
				room = PS.rooms[roomid2];
				if (room) {
					room.connected = false;
					this.removeRoom(room);
				}
				this.update();
				continue;
			} case 'noinit': {
				room = PS.rooms[roomid2];
				if (room) {
					room.connected = false;
					if (args[1] === 'namerequired') {
						room.connectWhenLoggedIn = true;
						if (!PS.user.initializing) {
							room.receiveLine(['error', args[2]]);
						}
					} else if (args[1] === 'nonexistent') {
						// sometimes we assume a room is a chatroom when it's not
						// when that happens, just ignore this error
						if (room.type === 'chat') room.receiveLine(['bigerror', 'Room does not exist']);
					} else if (args[1] === 'rename') {
						room.connected = true;
						room.title = args[3] || room.title;
						this.renameRoom(room, args[2] as RoomID);
					}
				}
				this.update();
				continue;
			}
			}
			room?.receiveLine(args);
		}
		room?.update(isInit ? [`initdone`] : null);
	}
	send(fullMsg: string) {
		const pipeIndex = fullMsg.indexOf('|');
		const roomid = fullMsg.slice(0, pipeIndex) as RoomID;
		const msg = fullMsg.slice(pipeIndex + 1);
		console.log('\u25b6\ufe0f ' + (roomid ? '[' + roomid + '] ' : '') + '%c' + msg, "color: #776677");
		if (!this.connection) {
			PS.alert(`You are not connected and cannot send ${msg}.`);
			return;
		}
		this.connection.send(fullMsg);
	}
	isVisible(room: PSRoom) {
		if (!this.leftPanelWidth) {
			// one panel visible
			return room === this.panel || room === this.room;
		} else {
			// both panels visible
			return room === this.rightPanel || room === this.leftPanel || room === this.room;
		}
	}
	calculateLeftPanelWidth() {
		const available = document.body.offsetWidth;
		if (available < 800 || this.prefs.onepanel === 'vertical') {
			return null;
		}
		// If we don't have both a left room and a right room, obviously
		// just show one room
		if (!this.leftPanel || !this.rightPanel || this.prefs.onepanel) {
			return 0;
		}

		// The rest of this code can assume we have both a left room and a
		// right room, and also want to show both if they fit

		const left = this.getWidthFor(this.leftPanel);
		const right = this.getWidthFor(this.rightPanel);

		let excess = available - (left.width + right.width);
		if (excess >= 0) {
			// both fit in full size
			const leftStretch = left.maxWidth - left.width;
			if (!leftStretch) return left.width;
			const rightStretch = right.maxWidth - right.width;
			if (leftStretch + rightStretch >= excess) return left.maxWidth;
			// evenly distribute the excess
			return left.width + Math.floor(excess * leftStretch / (leftStretch + rightStretch));
		}

		if (left.isMainMenu) {
			if (available >= left.minWidth + right.width) {
				return left.minWidth;
			}
			return 0;
		}

		if (available >= left.width + right.minWidth) {
			return left.width;
		}
		return 0;
	}
	createRoom(options: RoomOptions) {
		options.location ||= this.getRouteLocation(options.id);
		options.type ||= this.getRoute(options.id) || '';
		const RoomType = this.roomTypes[options.type];
		options.noURL ??= RoomType?.noURL;
		if (RoomType?.title) options.title = RoomType.title;
		const Model = RoomType ? (RoomType.Model || PSRoom) : PlaceholderRoom;
		return new Model(options);
	}
	getRouteInfo(roomid: RoomID) {
		if (this.routes[roomid]) return this.routes[roomid];
		const hyphenIndex = roomid.indexOf('-');
		if (hyphenIndex < 0) return this.routes['*'] || null;
		roomid = roomid.slice(0, hyphenIndex) + '-*' as RoomID;
		if (this.routes[roomid]) return this.routes[roomid];
		return null;
	}
	getRouteLocation(roomid: RoomID): PSRoomLocation {
		// must be hardcoded here to have a different loc while also being a ChatRoom
		if (roomid.startsWith('dm-')) return 'mini-window';
		const routeInfo = this.getRouteInfo(roomid);
		if (!routeInfo) return 'left';
		if (routeInfo.startsWith('*')) return routeInfo.slice(1) as PSRoomLocation;
		return PS.roomTypes[routeInfo]!.location || 'left';
	}
	getRoute(roomid: RoomID) {
		const routeInfo = this.getRouteInfo(roomid);
		return routeInfo?.startsWith('*') ? null : routeInfo || null;
	}
	addRoomType(...types: PSRoomPanelSubclass[]) {
		for (const RoomType of types) {
			this.roomTypes[RoomType.id] = RoomType;
			for (const route of RoomType.routes) {
				this.routes[route] = RoomType.id;
			}
		}
		this.updateRoomTypes();
	}
	updateRoomTypes() {
		let updated = false;
		for (const roomid in this.rooms) {
			const room = this.rooms[roomid]!;
			let type = this.getRoute(roomid as RoomID) || room.type || '';
			// room IDs with no `-` default to chat, so they can be overridden by more specific routes
			if (room.type && room.type !== this.routes['*'] && !roomid.includes('-')) {
				type = room.type;
			}
			if (type === room.type || !type) continue;
			const RoomType = this.roomTypes[type];
			if (!RoomType) continue;

			const options: RoomOptions = room;
			if (RoomType.title) options.title = RoomType.title;
			options.type = type;
			const Model = RoomType.Model || PSRoom;
			const newRoom = new Model(options);
			this.rooms[roomid] = newRoom;
			if (this.leftPanel === room) this.leftPanel = newRoom;
			if (this.rightPanel === room) this.rightPanel = newRoom;
			if (this.panel === room) this.panel = newRoom;
			if (this.room === room) this.room = newRoom;
			if (roomid === '') this.mainmenu = newRoom as MainMenuRoom;

			updated = true;
		}
		if (updated) this.update();
	}
	setFocus(room: PSRoom) {
		room.onParentEvent?.('focus');
	}
	focusRoom(roomid: RoomID) {
		const room = this.rooms[roomid];
		if (!room) return false;
		if (this.room === room) {
			this.setFocus(room);
			return true;
		}
		this.closePopupsUntil(room, true);
		if (!this.isVisible(room)) {
			room.hiddenInit = true;
		}
		if (PS.isNormalRoom(room)) {
			if (room.location === 'right' && !this.prefs.onepanel) {
				this.rightPanel = this.panel = room;
			} else {
				this.leftPanel = this.panel = room;
			}
			PS.closeAllPopups(true);
			this.room = room;
		} else { // popup or mini-window
			if (room.location === 'mini-window') {
				this.leftPanel = this.panel = PS.mainmenu;
			}
			this.room = room;
		}
		this.room.autoDismissNotifications();
		this.update();
		this.setFocus(room);
		return true;
	}
	horizontalNav(room = this.room) {
		if (this.leftPanelWidth === null) {
			return { rooms: [], index: -1 };
		}
		const rooms = this.leftRoomList.concat(this.rightRoomList);
		const miniRoom = this.miniRoomList[0] !== 'news' ? this.miniRoomList[0] : null;
		if (miniRoom) rooms.splice(1, 0, miniRoom);
		const roomid = (room.location === 'mini-window' && miniRoom) || room.id;

		const index = rooms.indexOf(roomid);
		// index === -1: popup or something
		return { rooms, index };
	}
	verticalNav(room = this.room) {
		if (this.leftPanelWidth === null) {
			const rooms = ['' as RoomID, ...this.miniRoomList, ...this.leftRoomList.slice(1), ...this.rightRoomList];
			const index = rooms.indexOf(room.id);
			return { rooms, index };
		}
		if (room.location !== 'mini-window') {
			return { rooms: [], index: -1 };
		}
		const rooms = this.miniRoomList;
		const index = rooms.indexOf(room.id);
		// index === -1: shouldn't happen
		return { rooms, index };
	}
	focusLeftRoom() {
		const { rooms, index } = this.horizontalNav();
		if (index === -1) return;

		if (index === 0) {
			return this.focusRoom(rooms[rooms.length - 1]);
		}
		return this.focusRoom(rooms[index - 1]);
	}
	focusRightRoom() {
		const { rooms, index } = this.horizontalNav();
		if (index === -1) return;

		if (index === rooms.length - 1) {
			return this.focusRoom(rooms[0]);
		}
		return this.focusRoom(rooms[index + 1]);
	}
	focusUpRoom() {
		const { rooms, index } = this.verticalNav();
		if (index === -1) return;

		if (index === 0) {
			return this.focusRoom(rooms[rooms.length - 1]);
		}
		return this.focusRoom(rooms[index - 1]);
	}
	focusDownRoom() {
		const { rooms, index } = this.verticalNav();
		if (index === -1) return;

		if (index === rooms.length - 1) {
			return this.focusRoom(rooms[0]);
		}
		return this.focusRoom(rooms[index + 1]);
	}
	focusPreview(room: PSRoom) {
		if (room !== this.room) return '';

		const verticalBuf = this.verticalFocusPreview();
		if (verticalBuf) return verticalBuf;

		const isMiniRoom = this.room.location === 'mini-window';
		const { rooms, index } = this.horizontalNav();
		if (index === -1) return '';

		let buf = ' ';
		const leftRoom = this.rooms[rooms[index - 1]];
		if (leftRoom) buf += `\u2190 ${leftRoom.title}`;
		buf += (this.arrowKeysUsed || isMiniRoom ? " | " : " (use arrow keys) ");
		const rightRoom = this.rooms[rooms[index + 1]];
		if (rightRoom) buf += `${rightRoom.title} \u2192`;
		return buf;
	}
	verticalFocusPreview() {
		const { rooms, index } = this.verticalNav();
		if (index === -1) return '';

		const upRoom = this.rooms[rooms[index - 1]];
		let downRoom = this.rooms[rooms[index + 1]];
		if (index === rooms.length - 2 && rooms[index + 1] === 'news') downRoom = undefined;
		if (!upRoom && !downRoom) return '';

		let buf = ' ';
		// const altLabel = navigator.platform?.startsWith('Mac') ? '⌥' : 'ᴀʟᴛ';
		const altLabel = navigator.platform?.startsWith('Mac') ? 'ᴏᴘᴛ' : 'ᴀʟᴛ';
		if (upRoom) buf += `${altLabel}\u2191 ${upRoom.title}`;
		buf += " | ";
		if (downRoom) buf += `${altLabel}\u2193 ${downRoom.title}`;

		return buf;
	}
	alert(message: string) {
		this.join(`popup-${this.popups.length}` as RoomID, {
			args: { message },
		});
	}
	prompt(message: string, defaultValue?: string, opts?: {
		okButton?: string, type?: 'text' | 'password' | 'number',
	}): Promise<string | null> {
		return new Promise(resolve => {
			const input = prompt(message, defaultValue);
			resolve(input);
		});
	}
	getPMRoom(userid: ID): ChatRoom {
		const myUserid = PS.user.userid;
		const roomid = `dm-${[userid, myUserid].sort().join('-')}` as RoomID;
		if (this.rooms[roomid]) return this.rooms[roomid] as ChatRoom;
		this.join(roomid);
		return this.rooms[roomid]! as ChatRoom;
	}
	/**
	 * Low-level add room. You usually want `join`.
	 */
	addRoom(options: RoomOptions, noFocus = false) {
		// support hardcoded PM room-IDs
		if (options.id.startsWith('challenge-')) {
			options.id = `dm-${options.id.slice(10)}` as RoomID;
			options.args = { challengeMenuOpen: true };
		}
		if (options.id.startsWith('dm-')) {
			if (options.id.length >= 5 && options.id.endsWith('--')) {
				options.id = options.id.slice(0, -2) as RoomID;
				options.args = { initialSlash: true };
			}
		}

		options.parentRoomid ??= this.getRoom(options.parentElem)?.id;
		let preexistingRoom = this.rooms[options.id];
		if (preexistingRoom && this.isPopup(preexistingRoom)) {
			const sameOpener = (preexistingRoom.parentElem === options.parentElem);
			this.closePopupsUntil(this.rooms[options.parentRoomid!], true);
			if (sameOpener) return;
			preexistingRoom = this.rooms[options.id];
		}
		if (preexistingRoom) {
			if (!noFocus) {
				if (options.args?.challengeMenuOpen) {
					(preexistingRoom as ChatRoom).openChallenge();
				}
				this.focusRoom(preexistingRoom.id);
			}
			return preexistingRoom;
		}
		if (!noFocus) {
			this.closePopupsUntil(this.rooms[options.parentRoomid!], true);
		}
		const room = this.createRoom(options);
		this.rooms[room.id] = room;
		const location = room.location;
		room.location = null!;
		this.moveRoom(room, location, noFocus);
		if (options.backlog) {
			for (const args of options.backlog) {
				room.receiveLine(args);
			}
		}
		return room;
	}
	hideRightRoom() {
		if (PS.rightPanel) {
			if (PS.panel === PS.rightPanel) PS.panel = PS.leftPanel;
			if (PS.room === PS.rightPanel) PS.room = PS.leftPanel;
			PS.rightPanel = null;
			PS.update();
			PS.focusRoom(PS.leftPanel.id);
		}
	}
	roomVisible(room: PSRoom): boolean {
		if (PS.isNormalRoom(room)) {
			return !this.leftPanelWidth ? room === this.panel : room === this.leftPanel || room === this.rightPanel;
		}
		if (room.location === 'mini-window') {
			return !this.leftPanelWidth ? this.mainmenu === this.panel : this.mainmenu === this.leftPanel;
		}
		// some kind of popup
		return true;
	}
	renameRoom(room: PSRoom, id: RoomID) {
		// should never happen
		if (this.rooms[id]) this.removeRoom(this.rooms[id]);

		const oldid = room.id;
		room.id = id;
		this.rooms[id] = room;
		delete this.rooms[oldid];

		const popupIndex = this.popups.indexOf(oldid);
		if (popupIndex >= 0) this.popups[popupIndex] = id;
		const leftRoomIndex = this.leftRoomList.indexOf(oldid);
		if (leftRoomIndex >= 0) this.leftRoomList[leftRoomIndex] = id;
		const rightRoomIndex = this.rightRoomList.indexOf(oldid);
		if (rightRoomIndex >= 0) this.rightRoomList[rightRoomIndex] = id;
		const miniRoomIndex = this.miniRoomList.indexOf(oldid);
		if (miniRoomIndex >= 0) this.miniRoomList[miniRoomIndex] = id;

		this.update();
	}
	isPopup(room: PSRoom | undefined | null) {
		if (!room) return false;
		return room.location === 'popup' || room.location === 'semimodal-popup' || room.location === 'modal-popup';
	}
	isNormalRoom(room: PSRoom | undefined | null) {
		if (!room) return false;
		return room.location === 'left' || room.location === 'right' ||
			(room.location === 'mini-window' && PS.leftPanelWidth === null);
	}
	moveRoom(room: PSRoom, location: PSRoomLocation, background?: boolean, index?: number) {
		if (room.location === location && index === undefined) {
			if (background === true) {
				if (room === this.leftPanel) {
					this.leftPanel = this.mainmenu;
					this.panel = this.mainmenu;
				} else if (room === this.rightPanel) {
					this.rightPanel = this.rooms['rooms'] || null;
					this.panel = this.rightPanel || this.leftPanel;
				}
			} else if (background === false) {
				this.focusRoom(room.id);
			}
			return;
		}
		const POPUPS = ['popup', 'semimodal-popup', 'modal-popup'];
		if (this.isPopup(room) && POPUPS.includes(location)) {
			room.location = location;
			return;
		}

		background ??= !this.roomVisible(room);

		if (room.location === 'mini-window') {
			const miniRoomIndex = this.miniRoomList.indexOf(room.id);
			if (miniRoomIndex >= 0) {
				this.miniRoomList.splice(miniRoomIndex, 1);
			}
			if (this.room === room) this.room = this.panel;
		} else if (POPUPS.includes(room.location)) {
			const popupIndex = this.popups.indexOf(room.id);
			if (popupIndex >= 0) {
				this.popups.splice(popupIndex, 1);
			}
			if (this.room === room) this.room = this.panel;
		} else if (room.location === 'left') {
			const leftRoomIndex = this.leftRoomList.indexOf(room.id);
			if (leftRoomIndex >= 0) {
				this.leftRoomList.splice(leftRoomIndex, 1);
			}
			if (this.room === room) this.room = this.mainmenu;
			if (this.panel === room) this.panel = this.mainmenu;
			if (this.leftPanel === room) this.leftPanel = this.mainmenu;
		} else if (room.location === 'right') {
			const rightRoomIndex = this.rightRoomList.indexOf(room.id);
			if (rightRoomIndex >= 0) {
				this.rightRoomList.splice(rightRoomIndex, 1);
			}
			if (this.room === room) this.room = this.rooms['rooms'] || this.leftPanel;
			if (this.panel === room) this.panel = this.rooms['rooms'] || this.leftPanel;
			if (this.rightPanel === room) this.rightPanel = this.rooms['rooms'] || null;
		}

		room.location = location;
		switch (location) {
		case 'left':
			this.leftRoomList.splice(Math.max(index ?? Infinity, 1), 0, room.id);
			break;
		case 'right':
			this.rightRoomList.splice(Math.min(index ?? -1, this.rightRoomList.length - 1), 0, room.id);
			break;
		case 'mini-window':
			this.miniRoomList.splice(index ?? 0, 0, room.id);
			break;
		case 'popup':
		case 'semimodal-popup':
		case 'modal-popup':
			// moving a room to a popup must move it to the topmost popup
			this.popups.push(room.id);
			this.room = room; // popups can't be backgrounded
			break;
		default:
			throw new Error(`Invalid room location: ${location satisfies never as string}`);
		}
		if (!background) {
			if (location === 'left') this.leftPanel = this.panel = room;
			if (location === 'right') this.rightPanel = this.panel = room;
			if (location === 'mini-window') this.leftPanel = this.panel = this.mainmenu;
			if (location === 'mini-window' && PS.leftPanelWidth === null) this.leftPanel = this.panel = room;
			this.room = room;
		}
	}
	removeRoom(room: PSRoom) {
		room.destroy();
		delete PS.rooms[room.id];

		const leftRoomIndex = PS.leftRoomList.indexOf(room.id);
		if (leftRoomIndex >= 0) {
			PS.leftRoomList.splice(leftRoomIndex, 1);
		}
		if (PS.leftPanel === room) {
			PS.leftPanel = this.mainmenu;
			if (PS.panel === room) PS.panel = this.mainmenu;
			if (PS.room === room) PS.room = this.mainmenu;
		}

		const rightRoomIndex = PS.rightRoomList.indexOf(room.id);
		if (rightRoomIndex >= 0) {
			PS.rightRoomList.splice(rightRoomIndex, 1);
		}
		if (PS.rightPanel === room) {
			let newRightRoomid = PS.rightRoomList[rightRoomIndex] || PS.rightRoomList[rightRoomIndex - 1];
			PS.rightPanel = newRightRoomid ? PS.rooms[newRightRoomid]! : null;
			if (PS.panel === room) PS.panel = PS.rightPanel || PS.leftPanel;
			if (PS.room === room) PS.room = PS.panel;
		}

		if (room.location === 'mini-window') {
			const miniRoomIndex = PS.miniRoomList.indexOf(room.id);
			if (miniRoomIndex >= 0) {
				PS.miniRoomList.splice(miniRoomIndex, 1);
			}
			if (PS.room === room) {
				PS.room = PS.rooms[PS.miniRoomList[miniRoomIndex]] || PS.rooms[PS.miniRoomList[miniRoomIndex - 1]] || PS.mainmenu;
			}
		}

		if (this.popups.length && room.id === this.popups[this.popups.length - 1]) {
			this.popups.pop();
			PS.room = this.popups.length ? PS.rooms[this.popups[this.popups.length - 1]]! : PS.panel;
		}

		PS.setFocus(PS.room);
	}
	/** do NOT use this in a while loop: see `closePopupsUntil */
	closePopup(skipUpdate?: boolean) {
		if (!this.popups.length) return;
		this.leave(this.popups[this.popups.length - 1]);
		if (!skipUpdate) this.update();
	}
	closeAllPopups(skipUpdate?: boolean) {
		this.closePopupsUntil(null, skipUpdate);
	}
	closePopupsUntil(room: PSRoom | null | undefined, skipUpdate?: boolean) {
		// a while-loop may be simpler, but the loop invariant is very hard to prove
		// and any bugs (opening a popup while leaving a room) could lead to an infinite loop
		// a for-loop doesn't have that problem
		for (let i = this.popups.length - 1; i >= 0; i--) {
			if (room && this.popups[i] === room.id) break;
			this.removeRoom(PS.rooms[this.popups[i]]!);
		}
		if (!skipUpdate) this.update();
	}
	join(roomid: RoomID, options?: Partial<RoomOptions> | null, noFocus?: boolean) {
		// popups are always reopened rather than focused
		if (PS.rooms[roomid] && !PS.isPopup(PS.rooms[roomid])) {
			if (this.room.id === roomid) return;
			this.focusRoom(roomid);
			return;
		}
		this.addRoom({ id: roomid, ...options }, noFocus);
		this.update();
	}
	leave(roomid: RoomID) {
		if (!roomid || roomid === 'rooms') return;
		const room = PS.rooms[roomid];
		if (room) {
			this.removeRoom(room);
			this.update();
		}
	}
};
