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

import { PSConnection, PSLoginServer } from './client-connection';
import { PSModel, PSStreamModel } from './client-core';
import type { PSRoomPanel, PSRouter } from './panels';
import { ChatRoom } from './panel-chat';
import type { MainMenuRoom } from './panel-mainmenu';
import { Dex, toID, type ID } from './battle-dex';
import { BattleTextParser, type Args } from './battle-text-parser';
import type { BattleRoom } from './panel-battle';
import { Teams } from './battle-teams';
import type preact from '../js/lib/preact';

declare const BattleTextAFD: any;
declare const BattleTextNotAFD: any;

/**********************************************************************
 * Config
 *********************************************************************/

export interface ServerInfo {
	id: ID;
	protocol: string;
	host: string;
	port: number;
	httpport?: number;
	altport?: number;
	prefix: string;
	afd?: boolean;
	registered?: boolean;
}
export interface PSConfig {
	server: ServerInfo;
	defaultserver: ServerInfo;
	routes: {
		root: string,
		client: string,
		dex: string,
		replays: string,
		users: string,
		teams: string,
	};
	customcolors: Record<string, string>;
	whitelist?: string[];
	testclient?: boolean;
}
export declare const Config: PSConfig;

/**********************************************************************
 * Prefs
 *********************************************************************/

/**
 * String that contains only lowercase alphanumeric characters.
 */
export type RoomID = Lowercase<string> & { __isRoomID: true };
export type TimestampOptions = 'minutes' | 'seconds' | undefined;

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

	/* Graphics Preferences */
	noanim: boolean | null = null;
	bwgfx: boolean | null = null;
	nopastgens: boolean | null = null;

	/* Chat Preferences */
	blockPMs: boolean | null = null;
	blockChallenges: boolean | null = null;
	inchatpm: boolean | null = null;
	noselfhighlight: boolean | null = null;
	temporarynotifications: boolean | null = null;
	leavePopupRoom: boolean | null = null;
	refreshprompt: boolean | null = null;
	language = 'english';
	chatformatting: Record<string, boolean> = {
		hidegreentext: false,
		hideme: false,
		hidespoiler: false,
		hidelinks: false,
		hideinterstice: true,
	};
	nounlink: boolean | null = null;

	/* Battle preferences */
	ignorenicks: boolean | null = null;
	ignorespects: boolean | null = null;
	ignoreopp: boolean | null = null;
	autotimer: boolean | null = null;
	rightpanelbattles: boolean | null = null;
	disallowspectators: boolean | null = null;
	starredformats: { [formatid: string]: true | undefined } | null = null;

	/**
	 * Show "User joined" and "User left" messages. serverid:roomid
	 * table. Uses 1 and 0 instead of true/false for JSON packing
	 * reasons.
	 */
	showjoins: { [serverid: string]: { [roomid: string]: 1 | 0 } } | null = null;
	showdebug: boolean | null = null;
	showbattles = true;
	/**
	 * Comma-separated lists of room titles to autojoin. Single
	 * string is for Main.
	 */
	autojoin: { [serverid: string]: string } | string | null = null;
	/**
	 * List of users whose messages should be ignored. userid table.
	 * Uses 1 and 0 instead of true/false for JSON packing reasons.
	 */
	ignore: { [userid: string]: 1 | 0 } | null = null;
	/**
	 * hide = hide regular display, notify = notify on new tours, null = notify on joined tours.
	 */
	tournaments: 'hide' | 'notify' | null = null;
	/**
	 * true = one panel, false = two panels, left and right
	 */
	onepanel: boolean | 'vertical' = false;
	timestamps: { chatrooms?: TimestampOptions, pms?: TimestampOptions } = {};

	mute = false;
	effectvolume = 50;
	musicvolume = 50;
	notifvolume = 50;
	uploadprivacy = false;

	afd: boolean | 'sprites' = false;

	highlights: Record<string, string[]> | null = null;
	logtimes: { [serverid: ID]: { [roomid: RoomID]: number } } | null = null;

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

			if (Config.server?.afd) {
				mode = true;
			} else if (this.afd !== undefined) {
				mode = this.afd;
			} else {
				// uncomment on April Fools' Day
				// mode = true;
			}
		}

		Dex.afdMode = mode;

		if (typeof BattleTextAFD !== 'undefined') {
			if (mode === true) {
				(BattleText as any) = BattleTextAFD;
			} else {
				(BattleText as any) = BattleTextNotAFD;
			}
		}
	}
	doAutojoin() {
		let autojoin = PS.prefs.autojoin;
		if (autojoin) {
			if (typeof autojoin === 'string') {
				autojoin = { showdown: autojoin };
			}
			let rooms = autojoin[PS.server.id] || '';
			for (let title of rooms.split(",")) {
				PS.addRoom({ id: toID(title) as string as RoomID, title, connected: true, autofocus: false });
			};
			const cmd = `/autojoin ${rooms}`;
			if (PS.connection?.queue.includes(cmd)) {
				// don't jam up the queue with autojoin requests
				// sending autojoin again after a prior autojoin successfully resolves likely returns an error from the server
				return;
			}
			// send even if `rooms` is empty, for server autojoins
			PS.send(cmd);
		}

		for (const roomid in PS.rooms) {
			const room = PS.rooms[roomid]!;
			if (room.type === 'battle') {
				room.connect();
			}
		}
	}
}

/**********************************************************************
 * Teams
 *********************************************************************/

export interface Team {
	name: string;
	format: ID;
	folder: string;
	/** Note that this can be wrong if `.uploaded?.notLoaded` */
	packedTeam: string;
	/** The icon cache must be cleared (to `null`) whenever `packedTeam` is modified */
	iconCache: preact.ComponentChildren;
	/** Used in roomids (`team-[key]`) to refer to the team. Always persists within
	  * a single session, but not always between refreshes. As long as a team still
		* exists, pointers to a Team are equivalent to a key. */
	key: string;
	isBox: boolean;
	/** uploaded team ID. will not exist for teams that are not uploaded. tracked locally */
	teamid?: number;
	/** `uploaded` will only exist if you're logged into the correct account. otherwise teamid is still tracked */
	uploaded?: {
		teamid: number,
		/** Promise = loading. */
		notLoaded: boolean | Promise<void>,
		/** password, if private. null = public, undefined = unknown, not loaded yet */
		private?: string | null,
	};
	/** team at the point it was last uploaded. outside of `uploaded` so it can track loading state */
	uploadedPackedTeam?: string;
}
interface UploadedTeam {
	name: string;
	teamid: number;
	format: ID;
	/** comma-separated list of species, for generating the icon cache */
	team: string;
	/** password, if private */
	private?: string | null;
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
	uploading: Team | null = null;
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
	spliceIn(index: number, teams: Team[]) {
		for (const team of teams) {
			team.key ||= this.getKey(team.name);
			this.byKey[team.key] = team;
		}
		this.list.splice(index, 0, ...teams);
	}
	unpackOldBuffer(buffer: string) {
		PS.alert(`Your team storage format is too old for PS. You'll need to upgrade it at https://${Config.routes.client}/recoverteams.html`);
		this.list = [];
	}
	packAll(teams: Team[]) {
		return teams.map(team => (
			(team.teamid ? `${team.teamid}[` : '') +
			(team.format || team.isBox ? `${team.format || ''}${team.isBox ? '-box' : ''}]` : ``) +
			(team.folder ? `${team.folder}/` : ``) +
			team.name + `|` + team.packedTeam
		)).join('\n');
	}
	save() {
		try {
			localStorage.setItem('showdown_teams', this.packAll(this.list));
		} catch {}
		this.update('team');
	}
	unpackLine(line: string): Team | null {
		const pipeIndex = line.indexOf('|');
		if (pipeIndex < 0) return null;
		let bracketIndex = line.indexOf(']');
		if (bracketIndex > pipeIndex) bracketIndex = -1;
		let leftBracketIndex = line.indexOf('[');
		if (leftBracketIndex < 0) leftBracketIndex = 0;
		const isBox = line.slice(0, bracketIndex).endsWith('-box');
		let slashIndex = line.lastIndexOf('/', pipeIndex);
		if (slashIndex < 0) slashIndex = bracketIndex; // line.slice(slashIndex + 1, pipeIndex) will be ''
		let format = bracketIndex > 0 ? line.slice(
			(leftBracketIndex ? leftBracketIndex + 1 : 0), isBox ? bracketIndex - 4 : bracketIndex
		) : 'gen9';
		if (!format.startsWith('gen')) format = 'gen6' + format;
		const name = line.slice(slashIndex + 1, pipeIndex);
		const teamid = leftBracketIndex > 0 ? Number(line.slice(0, leftBracketIndex)) : undefined;
		return {
			name,
			format: format as ID,
			folder: line.slice(bracketIndex + 1, slashIndex > 0 ? slashIndex : bracketIndex + 1),
			packedTeam: line.slice(pipeIndex + 1),
			iconCache: null,
			key: '',
			isBox,
			teamid,
		};
	}
	loadRemoteTeams() {
		PSLoginServer.query('getteams').then(data => {
			if (!data) return;
			if (data.actionerror) {
				return PS.alert('Error loading uploaded teams: ' + data.actionerror);
			}
			const teams: { [key: string]: UploadedTeam } = {};
			for (const team of data.teams) {
				teams[team.teamid] = team;
			}

			// find exact teamid matches
			for (const localTeam of this.list) {
				if (localTeam.teamid) {
					const team = teams[localTeam.teamid];
					if (!team) {
						continue;
					}
					localTeam.uploaded = {
						teamid: team.teamid,
						notLoaded: false,
						private: team.private,
					};
					delete teams[localTeam.teamid];
				}
			}

			// do best-guess matches for teams that don't have a local team with matching teamid
			for (const team of Object.values(teams)) {
				let matched = false;
				for (const localTeam of this.list) {
					if (localTeam.teamid) continue;

					const compare = this.compareTeams(team, localTeam);
					if (compare === 'rename') {
						if (!localTeam.name.endsWith(' (local version)')) localTeam.name += ' (local version)';
					} else if (compare) {
						// prioritize locally saved teams over remote
						// as so to not overwrite changes
						matched = true;
						localTeam.teamid = team.teamid;
						localTeam.uploaded = {
							teamid: team.teamid,
							notLoaded: false,
							private: team.private,
						};
						break;
					}
				}
				if (!matched) {
					const mons = team.team.split(',').map((m: string) => ({ species: m, moves: [] }));
					const newTeam: Team = {
						name: team.name,
						format: team.format,
						folder: '',
						packedTeam: Teams.pack(mons),
						iconCache: null,
						isBox: false,
						key: this.getKey(team.name),
						uploaded: {
							teamid: team.teamid,
							notLoaded: true,
							private: team.private,
						},
					};
					this.push(newTeam);
				}
			}
		});
	}
	loadTeam(team: Team | undefined | null, ifNeeded: true): void | Promise<void>;
	loadTeam(team: Team | undefined | null): Promise<void>;
	loadTeam(team: Team | undefined | null, ifNeeded?: boolean): void | Promise<void> {
		if (!team?.uploaded || team.uploadedPackedTeam) return ifNeeded ? undefined : Promise.resolve();
		if (team.uploaded.notLoaded && team.uploaded.notLoaded !== true) return team.uploaded.notLoaded;

		const notLoaded = team.uploaded.notLoaded;
		return (team.uploaded.notLoaded = PSLoginServer.query('getteam', {
			teamid: team.uploaded.teamid,
		}).then(data => {
			if (!team.uploaded) return;
			if (!data?.team) {
				PS.alert(`Failed to load team: ${data?.actionerror || "Error unknown. Try again later."}`);
				return;
			}
			team.uploaded.notLoaded = false;
			team.uploadedPackedTeam = data.team;
			if (notLoaded) {
				team.packedTeam = data.team;
				PS.teams.save();
			}
		}));
	}
	compareTeams(serverTeam: UploadedTeam, localTeam: Team) {
		// TODO: decide if we want this
		// if (serverTeam.teamid === localTeam.teamid && localTeam.teamid) return true;

		// if titles match exactly and mons are the same, assume they're the same team
		// if they don't match, it might be edited, but we'll go ahead and add it to the user's
		// teambuilder since they may want that old version around. just go ahead and edit the name
		let sanitize = (name: string) => (name || "").replace(/\s+\(server version\)/g, '').trim();
		const nameMatches = sanitize(serverTeam.name) === sanitize(localTeam.name);
		if (!(nameMatches && serverTeam.format === localTeam.format)) {
			return false;
		}
		// if it's been edited since, invalidate the team id on this one (count it as new)
		// and load from server
		const mons = serverTeam.team.split(',').map(toID).sort().join(',');
		const otherMons = Teams.unpackSpeciesOnly(localTeam.packedTeam).map(toID).sort().join(',');
		if (mons !== otherMons) return 'rename';
		return true;
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
	away = false;
	registered: { name: string, userid: ID } | null = null;
	avatar = "lucas";
	challstr = '';
	loggingIn: string | null = null;
	initializing = true;
	gapiLoaded = false;
	nameRegExp: RegExp | null = null;
	setName(fullName: string, named: boolean, avatar: string) {
		const loggingIn = (!this.named && named);
		const { name, group } = BattleTextParser.parseNameParts(fullName);
		this.name = name;
		this.group = group;
		this.userid = toID(name);
		this.named = named;
		this.avatar = avatar;
		this.away = fullName.endsWith('@!');
		this.update(null);
		if (loggingIn) {
			for (const roomid in PS.rooms) {
				const room = PS.rooms[roomid]!;
				if (room.connectWhenLoggedIn) room.connect();
			}
		}
		this.updateRegExp();
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
			PS.send(`/trn ${name}`);
			this.update({ success: true });
			return;
		}
		this.loggingIn = name;
		this.update(null);
		PSLoginServer.rawQuery(
			'getassertion', { userid, challstr: this.challstr }
		).then(res => {
			this.handleAssertion(name, res);
			this.updateRegExp();
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
				const username = data.curuser.loggedin.username;
				this.registered = { name: username, userid: toID(username) };
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
			PS.send(`/trn ${name},0,${assertion}`);
			this.update({ success: true });
		}
	}
	logOut() {
		PSLoginServer.query(
			'logout', { userid: this.userid }
		);
		PS.send(`/logout`);
		PS.connection?.disconnect();

		PS.alert("You have been logged out and disconnected.\n\nIf you wanted to change your name while staying connected, use the 'Change Name' button or the '/nick' command.");
		this.name = "";
		this.group = '';
		this.userid = "" as ID;
		this.named = false;
		this.registered = null;
		this.update(null);
	}

	updateRegExp() {
		if (!this.named) {
			this.nameRegExp = null;
		} else {
			let escaped = this.name.replace(/[^A-Za-z0-9]+$/, '');
			// we'll use `,` as a sentinel character to mean "any non-alphanumeric char"
			// unicode characters can be replaced with any non-alphanumeric char
			for (let i = escaped.length - 1; i > 0; i--) {
				if (/[^ -~]/.test(escaped[i])) {
					escaped = escaped.slice(0, i) + ',' + escaped.slice(i + 1);
				}
			}
			escaped = escaped.replace(/[[\]/{}()*+?.\\^$|-]/g, "\\$&");
			escaped = escaped.replace(/,/g, "[^A-Za-z0-9]?");
			this.nameRegExp = new RegExp('(?:\\b|(?!\\w))' + escaped + '(?:\\b|\\B(?!\\w))', 'i');
		}
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
	httpport = Config.defaultserver.httpport;
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
	connected?: 'autoreconnect' | 'client-only' | 'expired' | boolean;
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
	notification?: Notification | null;
}

type ClientCommands<RoomT extends PSRoom> = {
	/** return true to send the original command on to the server, or a string to send that command */
	[command: Lowercase<string>]: (
		this: RoomT, target: string, cmd: string, element: HTMLElement | null
	) => string | boolean | null | void,
};
/** The command signature is a lie but TypeScript and string validation amirite? */
type ParsedClientCommands = {
	[command: `parsed${string}`]: (
		this: PSRoom, target: string, cmd: string, element: HTMLElement | null
	) => string | boolean | null | void,
};

export function makeLoadTracker() {
	let resolver: () => void;
	const tracker: Promise<void> & { loaded: () => void } = new Promise<void>(resolve => {
		resolver = resolve;
	}) as any;
	tracker.loaded = () => {
		resolver();
	};
	return tracker;
}

/**
 * As a PSStreamModel, PSRoom can emit `Args` to mean "we received a message",
 * and `null` to mean "tell Preact to re-render this room"
 */
export class PSRoom extends PSStreamModel<Args | null> implements RoomOptions {
	id: RoomID;
	title = "";
	type = '';
	isPlaceholder = false;
	readonly classType: string = '';
	location: PSRoomLocation = 'left';
	closable = true;
	/**
	 * Whether the room is connected to the server. This is _eager_,
	 * we set it to `true` when we send `/join`, not when the server
	 * tells us we're connected. That's because it tracks whether we
	 * still need to send `/join` or `/leave`.
	 *
	 * Only connected to server when `=== true`. String options mean
	 * the room isn't connected to the game server but to something
	 * else.
	 *
	 * 'client-only' for DMs
	 */
	connected: 'autoreconnect' | 'client-only' | 'expired' | boolean = false;
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
	 * Preact means that the DOM state lags behind the app state. This means
	 * rooms frequently have `display: none` at the time we want to focus them.
	 * And popups sometimes initialize hidden, to calculate their position from
	 * their width/height without flickering. But hidden HTML elements can't be
	 * focused, so this is a note-to-self to focus the next time they can be.
	 */
	focusNextUpdate = false;
	parentElem: HTMLElement | null = null;
	parentRoomid: RoomID | null = null;
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
		if (options.parentRoomid) this.parentRoomid = options.parentRoomid;
		if (this.location !== 'popup' && this.location !== 'semimodal-popup') this.parentElem = null;
		if (options.rightPopup) this.rightPopup = true;
		if (options.connected) this.connected = options.connected;
		if (options.backlog) this.backlog = options.backlog;
		this.noURL = options.noURL || false;
		this.args = options.args || null;
	}
	getParent() {
		if (this.parentRoomid) return PS.rooms[this.parentRoomid] || null;
		return null;
	}
	notify(options: { title: string, body?: string, noAutoDismiss?: boolean, id?: string }) {
		let desktopNotification: Notification | null = null;
		const roomIsFocused = document.hasFocus?.() && PS.isVisible(this);
		if (roomIsFocused && !options.noAutoDismiss) return;
		if (!roomIsFocused) {
			PS.playNotificationSound();
			try {
				desktopNotification = new Notification(options.title, { body: options.body });
				if (desktopNotification) {
					desktopNotification.onclick = () => {
						window.focus();
						PS.focusRoom(this.id);
					};
					if (PS.prefs.temporarynotifications) {
						setTimeout(() => { desktopNotification?.close(); }, 5000);
					}
				}
			} catch {}
		}
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
			notification: desktopNotification,
		});
		PS.update();
	}
	subtleNotify() {
		if (PS.isVisible(this)) return;
		const room = PS.rooms[this.id] as ChatRoom;
		const lastSeenTimestamp = PS.prefs.logtimes?.[PS.server.id]?.[this.id] || 0;
		const lastMessageTime = +(room.lastMessage?.[1] || 0);
		this.isSubtleNotifying = !((lastMessageTime + room.timeOffset) <= lastSeenTimestamp);
		PS.update();
	}
	dismissNotificationAt(i: number) {
		try {
			this.notifications[i].notification?.close();
		} catch {}
		this.notifications.splice(i, 1);
	}
	dismissNotification(id: string) {
		const index = this.notifications.findIndex(n => n.id === id);
		if (index !== -1) {
			this.dismissNotificationAt(index);
		}
		PS.update();
	}
	autoDismissNotifications() {
		let room = PS.rooms[this.id] as ChatRoom;
		if (room.lastMessageTime) {
			// Mark chat messages as read to avoid double-notifying on reload
			let lastMessageDates = PS.prefs.logtimes || {};
			if (!lastMessageDates[PS.server.id]) lastMessageDates[PS.server.id] = {};
			lastMessageDates[PS.server.id][room.id] = room.lastMessageTime || 0;
			PS.prefs.set('logtimes', lastMessageDates);
		}
		for (let i = this.notifications.length - 1; i >= 0; i--) {
			if (!this.notifications[i].noAutoDismiss) {
				this.dismissNotificationAt(i);
			}
		}
		this.isSubtleNotifying = false;
	}
	connect(): void {
		throw new Error(`This room is not designed to connect to a server room`);
	}
	/**
	 * By default, a reconnected room will receive the init message as a bunch
	 * of `receiveLine`s as normal. Before that happens, handleReconnect is
	 * called, and you can return true to stop that behavior. You could also
	 * prep for a bunch of `receiveLine`s and then not return anything.
	 */
	handleReconnect(msg: string): boolean | void {}
	receiveLine(args: Args): void {
		switch (args[0]) {
		case 'title': {
			this.title = args[1];
			PS.update();
			break;
		} case 'notify': {
			const [, title, body, toHighlight] = args;
			if (toHighlight && !ChatRoom.getHighlight(toHighlight, this.id)) break;
			this.notify({ title, body });
			break;
		} case 'tempnotify': {
			const [, id, title, body, toHighlight] = args;
			if (toHighlight && !ChatRoom.getHighlight(toHighlight, this.id)) break;
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
	 * Used only by commands; messages from the server go directly from
	 * `PS.receive` to `room.receiveLine`
	 */
	add(line: string, ifChat?: boolean) {
		if (this.type !== 'chat' && this.type !== 'battle') {
			if (!ifChat) {
				PS.mainmenu.handlePM(PS.user.userid, PS.user.userid);
				PS.rooms['dm-' as RoomID]?.receiveLine(BattleTextParser.parseLine(line));
			}
		} else {
			this.receiveLine(BattleTextParser.parseLine(line));
		}
	}
	errorReply(message: string, element = this.currentElement) {
		if (element?.tagName === 'BUTTON') {
			PS.alert(message, { parentElem: element });
		} else {
			this.add(`|error|${message}`);
		}
	}
	parseClientCommands(commands: ClientCommands<this>) {
		const parsedCommands: ParsedClientCommands = {};
		for (const cmd in commands) {
			const names = cmd.split(',').map(name => name.trim());
			for (const name of names) {
				if (name.includes(' ')) throw new Error(`Client command names cannot contain spaces: ${name}`);
				// good luck convincing TypeScript that these types are compatible
				parsedCommands[name as 'parsed'] = commands[cmd as 'cmd'] as any;
			}
		}
		return parsedCommands;
	}
	globalClientCommands = this.parseClientCommands({
		'j,join'(target, cmd, elem) {
			target = PS.router.extractRoomID(target) || target;
			const roomid = /[^a-z0-9-]/.test(target) ? toID(target) as any as RoomID : target as RoomID;
			PS.join(roomid, { parentElem: elem });
		},
		'part,leave,close'(target, cmd, elem) {
			const roomid = (/[^a-z0-9-]/.test(target) ? toID(target) as any as RoomID : target as RoomID) || this.id;
			const room = PS.rooms[roomid] as BattleRoom;
			const battle = room?.battle;

			if (room?.type === "battle" && !battle.ended && room.users[PS.user.userid]?.startsWith('☆') && !battle.isReplay) {
				PS.join("forfeitbattle" as RoomID, { parentElem: elem });
				return;
			}
			if (room?.type === "chat" && room.connected === true && PS.prefs.leavePopupRoom && !target) {
				PS.join("confirmleaveroom" as RoomID, { parentElem: elem });
				return;
			}

			PS.leave(roomid);
		},
		'closeand'(target) {
			// we actually do the close last, because a lot of things stop working
			// after you delete the room
			this.send(target);
			PS.leave(this.id);
		},
		'receivepopup'(target) {
			PS.alert(target);
		},
		'inopener,inparent'(target) {
			// do this command in the popup opener
			let room = this.getParent();
			if (room && PS.isPopup(room)) room = room.getParent();
			// will crash if the parent doesn't exist, which is fine
			room!.send(target);
		},
		'maximize'(target) {
			const roomid = /[^a-z0-9-]/.test(target) ? toID(target) as any as RoomID : target as RoomID;
			const targetRoom = roomid ? PS.rooms[roomid] : this;
			if (!targetRoom) return this.errorReply(`Room '${roomid}' not found.`);
			if (PS.isNormalRoom(targetRoom)) {
				this.errorReply(`'${roomid}' is already maximized.`);
			} else if (!PS.isPopup(targetRoom)) {
				PS.moveRoom(targetRoom, 'left', false, 0);
				PS.update();
			} else {
				this.errorReply(`'${roomid}' is a popup and can't be maximized.`);
			}
		},
		'logout'() {
			PS.user.logOut();
		},
		'reconnect,connect'() {
			if (this.connected && this.connected !== 'autoreconnect') {
				return this.errorReply(`You are already connected.`);
			}

			if (!PS.isOffline) {
				// connect to room
				try {
					this.connect();
				} catch (err: any) {
					this.errorReply(err.message);
				}
				return;
			}

			// connect to server
			const uptime = Date.now() - PS.startTime;
			if (uptime > 24 * 60 * 60 * 1000) {
				PS.confirm(`It's been over a day since you first connected. Please refresh.`, {
					okButton: 'Refresh',
				}).then(confirmed => {
					if (confirmed) this.send(`/refresh`);
				});
				return;
			}
			PSConnection.connect();
		},
		'refresh'() {
			document.location.reload();
		},
		'workoffline'() {
			if (PS.isOffline) {
				return this.add(`|error|You are already offline.`);
			}
			PS.connection?.disconnect();
		},
		'cancelsearch'() {
			if (PS.mainmenu.cancelSearch()) {
				this.add(`||Search cancelled.`, true);
			} else {
				this.errorReply(`You're not currently searching.`);
			}
		},
		'disallowspectators'(target) {
			PS.prefs.set('disallowspectators', target !== 'off');
		},
		'star'(target) {
			const id = toID(target);
			if (!window.BattleFormats[id] && !/^gen[1-9]$/.test(id)) {
				this.errorReply(`Format ${id} does not exist`);
				return;
			}
			let starred = PS.prefs.starredformats || {};
			starred[id] = true;
			PS.prefs.set('starredformats', starred);
			this.add(`||Added format ${id} to favourites`);
			this.update(null);
		},
		'unstar'(target) {
			const id = toID(target);
			if (!window.BattleFormats[id] && !/^gen[1-9]$/.test(id)) {
				this.errorReply(`Format ${id} does not exist`);
				return;
			}
			let starred = PS.prefs.starredformats || {};
			if (!starred[id]) {
				this.errorReply(`${id} is not in your favourites!`);
				return;
			}
			delete starred[id];
			PS.prefs.set('starredformats', starred);
			this.add(`||Removed format ${id} from favourites`);
			this.update(null);
		},
		'nick'(target, cmd, element) {
			const noNameChange = PS.user.userid === toID(target);
			if (!noNameChange) PS.join('login' as RoomID, { parentElem: element });
			if (target) {
				PS.user.changeName(target);
			}
		},
		'avatar'(target) {
			target = target.toLowerCase();
			if (/[^a-z0-9-]/.test(target)) target = toID(target);
			const avatar = window.BattleAvatarNumbers?.[target] || target;
			PS.user.avatar = avatar;
			if (this.type !== 'chat' && this.type !== 'battle') {
				PS.send(`/avatar ${avatar}`);
			} else {
				this.sendDirect(`/avatar ${avatar}`);
			}
		},
		'open,user'(target) {
			let roomid = `user-${toID(target)}` as RoomID;
			PS.join(roomid, {
				args: { username: target },
			});
		},
		'ignore'(target) {
			const ignore = PS.prefs.ignore || {};
			if (!target) return true;
			if (toID(target) === PS.user.userid) {
				this.add(`||You are not able to ignore yourself.`);
			} else if (ignore[toID(target)]) {
				this.add(`||User '${target}' is already on your ignore list. ` +
					`(Moderator messages will not be ignored.)`);
			} else {
				ignore[toID(target)] = 1;
				this.add(`||User '${target}' ignored. (Moderator messages will not be ignored.)`);
				PS.prefs.set("ignore", ignore);
			}
		},
		'unignore'(target) {
			const ignore = PS.prefs.ignore || {};
			if (!target) return false;
			if (!ignore[toID(target)]) {
				this.add(`||User '${target}' isn't on your ignore list.`);
			} else {
				ignore[toID(target)] = 0;
				this.add(`||User '${target}' no longer ignored.`);
				PS.prefs.set("ignore", ignore);
			}
		},
		'clearignore'(target) {
			if (toID(target) !== 'confirm') {
				this.add("||Are you sure you want to clear your ignore list?");
				this.add('|html|If you\'re sure, use <code>/clearignore confirm</code>');
				return false;
			}
			let ignoreList = PS.prefs.ignore || {};
			if (!Object.keys(ignoreList).length) return this.add("You have no ignored users.");
			PS.prefs.set('ignore', null);
			this.add("||Your ignore list was cleared.");
		},
		'ignorelist'(target) {
			let ignoreList = Object.keys(PS.prefs.ignore || {});
			if (ignoreList.length === 0) {
				this.add('||You are currently not ignoring anyone.');
			} else {
				let ignoring: string[] = [];
				for (const key in PS.prefs.ignore) {
					if (PS.prefs.ignore[key] === 1) ignoring.push(key);
				}
				if (!ignoring.length) return this.add('||You are currently not ignoring anyone.');
				this.add(`||You are currently ignoring: ${ignoring.join(', ')}`);
			}
		},
		'showjoins'(target) {
			let showjoins = PS.prefs.showjoins || {};
			let serverShowjoins = showjoins[PS.server.id] || {};
			if (target) {
				let room = toID(target);
				if (serverShowjoins['global']) {
					delete serverShowjoins[room];
				} else {
					serverShowjoins[room] = 1;
				}
				this.add(`||Join/leave messages in room ${room}: ALWAYS ON`);
			} else {
				serverShowjoins = { global: 1 };
				this.add(`||Join/leave messages: ALWAYS ON`);
			}
			showjoins[PS.server.id] = serverShowjoins;
			PS.prefs.set("showjoins", showjoins);
		},
		'hidejoins'(target) {
			let showjoins = PS.prefs.showjoins || {};
			let serverShowjoins = showjoins[PS.server.id] || {};
			if (target) {
				let room = toID(target);
				if (!serverShowjoins['global']) {
					delete serverShowjoins[room];
				} else {
					serverShowjoins[room] = 0;
				}
				this.add(`||Join/leave messages on room ${room}: OFF`);
			} else {
				serverShowjoins = { global: 0 };
				this.add(`||Join/leave messages: OFF`);
			}
			showjoins[PS.server.id] = serverShowjoins;
			PS.prefs.set('showjoins', showjoins);
		},
		'showdebug'() {
			PS.prefs.set('showdebug', true);
			this.add('||Debug battle messages: ON');
			let onCSS = '.debug {display: block;}';
			let style = document.querySelector('style[id=debugstyle]');
			if (style) {
				style.innerHTML = onCSS;
			} else {
				style = document.createElement('style');
				style.id = "debugstyle";
				style.innerHTML = onCSS;
				document.querySelector('head')?.append(style);
			}
		},
		'hidedebug'() {
			PS.prefs.set('showdebug', true);
			this.add('||Debug battle messages: OFF');
			let onCSS = '.debug {display: none;}';
			let style = document.querySelector('style[id=debugstyle]');
			if (style) {
				style.innerHTML = onCSS;
			} else {
				style = document.createElement('style');
				style.id = "debugstyle";
				style.innerHTML = onCSS;
				document.querySelector('head')?.append(style);
			}
		},
		'showbattles'() {
			PS.prefs.set('showbattles', true);
			this.add('||Battle Messages: ON');
		},
		'hidebattles'() {
			PS.prefs.set('showbattles', false);
			this.add('||Battle Messages: HIDDEN');
		},
		'afd'(target) {
			if (!target) return this.send('/help afd');
			let mode = toID(target);
			if (mode === 'sprites') {
				PS.prefs.set('afd', 'sprites');
				PS.prefs.setAFD('sprites');
				this.add('||April Fools\' Day mode set to SPRITES.');
			} else if (mode === 'off') {
				PS.prefs.set('afd', null);
				PS.prefs.setAFD();
				this.add('||April Fools\' Day mode set to OFF temporarily.');
				this.add('||Trying to turn it off permanently? Use /afd never');
			} else if (mode === 'default') {
				PS.prefs.setAFD();
				PS.prefs.set('afd', null);
				this.add('||April Fools\' Day mode set to DEFAULT (Currently ' + (Dex.afdMode ? 'FULL' : 'OFF') + ').');
			} else if (mode === 'full') {
				PS.prefs.set('afd', true);
				PS.prefs.setAFD(true);
				this.add('||April Fools\' Day mode set to FULL.');
			} else if (target === 'never') {
				PS.prefs.set('afd', false);
				PS.prefs.setAFD(false);
				this.add('||April Fools\' Day mode set to NEVER.');
				if (Config.server?.afd) {
					this.add('||You\'re using the AFD URL, which will still override this setting and enable AFD mode on refresh.');
				}
			} else {
				if (target) this.add('||AFD option "' + target + '" not recognized');
				let curMode = PS.prefs.afd as string | boolean;
				if (curMode === true) curMode = 'FULL';
				if (curMode === false) curMode = 'NEVER';
				if (curMode) curMode = curMode.toUpperCase();
				if (!curMode) curMode = 'DEFAULT (currently ' + (Dex.afdMode ? 'FULL' : 'OFF') + ')';
				this.add('||AFD is currently set to ' + mode);
				this.send('/help afd');
			}
			for (let roomid in PS.rooms) {
				let battle = PS.rooms[roomid] && (PS.rooms[roomid] as BattleRoom).battle;
				if (!battle) continue;
				battle.resetToCurrentTurn();
			}
		},
		'clearpms'() {
			let rooms = PS.miniRoomList.filter(roomid => roomid.startsWith('dm-'));
			if (!rooms.length) return this.add('||You do not have any PM windows open.');
			for (const roomid of rooms) {
				PS.leave(roomid);
			}
			this.add("||All PM windows cleared and closed.");
		},
		'unpackhidden'() {
			PS.prefs.set('nounlink', true);
			this.add('||Locked/banned users\' chat messages: ON');
		},
		'packhidden'() {
			PS.prefs.set('nounlink', false);
			this.add('||Locked/banned users\' chat messages: HIDDEN');
		},
		'hl,highlight'(target) {
			let highlights = PS.prefs.highlights || {};
			if (target.includes(' ')) {
				let targets = target.split(' ');
				let subCmd = targets[0];
				targets = targets.slice(1).join(' ').match(/([^,]+?({\d*,\d*})?)+/g) as string[];
				// trim the targets to be safe
				for (let i = 0, len = targets.length; i < len; i++) {
					targets[i] = targets[i].replace(/\n/g, '').trim();
				}
				switch (subCmd) {
				case 'add': case 'roomadd': {
					let key = subCmd === 'roomadd' ? (PS.server.id + '#' + this.id) : 'global';
					let highlightList = highlights[key] || [];
					for (let i = 0, len = targets.length; i < len; i++) {
						if (!targets[i]) continue;
						if (/[\\^$*+?()|{}[\]]/.test(targets[i])) {
							// Catch any errors thrown by newly added regular expressions so they don't break the entire highlight list
							try {
								new RegExp(targets[i]);
							} catch (e: any) {
								return this.add(`|error|${(e.message.substr(0, 28) === 'Invalid regular expression: ' ? e.message : 'Invalid regular expression: /' + targets[i] + '/: ' + e.message)}`);
							}
						}
						if (highlightList.includes(targets[i])) {
							return this.add(`|error|${targets[i]} is already on your highlights list.`);
						}
					}
					highlights[key] = highlightList.concat(targets);
					this.add(`||Now highlighting on ${(key === 'global' ? "(everywhere): " : "(in " + key + "): ")} ${highlights[key].join(', ')}`);
					// We update the regex
					ChatRoom.updateHighlightRegExp(highlights);
					break;
				}
				case 'delete': case 'roomdelete': {
					let key = subCmd === 'roomdelete' ? (PS.server.id + '#' + this.id) : 'global';
					let highlightList = highlights[key] || [];
					let newHls: string[] = [];
					for (let i = 0, len = highlightList.length; i < len; i++) {
						if (!targets.includes(highlightList[i])) {
							newHls.push(highlightList[i]);
						}
					}
					highlights[key] = newHls;
					this.add(`||Now highlighting on ${(key === 'global' ? "(everywhere): " : "(in " + key + "): ")} ${highlights[key].join(', ')}`);
					// We update the regex
					ChatRoom.updateHighlightRegExp(highlights);
					break;
				}
				default:
					// Wrong command
					this.errorReply('Invalid /highlight command.');
					this.handleSend('/help highlight'); // show help
					return;
				}
				PS.prefs.set('highlights', highlights);
			} else {
				if (['clear', 'roomclear', 'clearall'].includes(target)) {
					let key = (target === 'roomclear' ? (PS.server.id + '#' + this.id) : (target === 'clearall' ? '' : 'global'));
					if (key) {
						highlights[key] = [];
						this.add(`||All highlights (${(key === 'global' ? "everywhere" : "in " + key)}) cleared.`);
						ChatRoom.updateHighlightRegExp(highlights);
					} else {
						PS.prefs.set('highlights', null);
						this.add("||All highlights (in all rooms and globally) cleared.");
						ChatRoom.updateHighlightRegExp({});
					}
				} else if (['show', 'list', 'roomshow', 'roomlist'].includes(target)) {
					// Shows a list of the current highlighting words
					let key = target.startsWith('room') ? (PS.server.id + '#' + this.id) : 'global';
					if (highlights[key] && highlights[key].length > 0) {
						this.add(`||Current highlight list ${(key === 'global' ? "(everywhere): " : "(in " + key + "): ")}${highlights[key].join(", ")}`);
					} else {
						this.add(`||Your highlight list${(key === 'global' ? '' : ' in ' + key)} is empty.`);
					}
				} else {
					// Wrong command
					this.errorReply('Invalid /highlight command.');
					this.handleSend('/help highlight'); // show help
				}
			}
		},
		'senddirect'(target) {
			this.sendDirect(target);
		},
		'h,help'(target) {
			switch (toID(target)) {
			case 'chal':
			case 'chall':
			case 'challenge':
				this.add('||/challenge - Open a prompt to challenge a user to a battle.');
				this.add('||/challenge [user] - Challenge the user [user] to a battle.');
				this.add('||/challenge [user], [format] - Challenge the user [user] to a battle in the specified [format].');
				this.add('||/challenge [user], [format] @@@ [rules] - Challenge the user [user] to a battle with custom rules.');
				this.add('||[rules] can be a comma-separated list of: [added rule], ![removed rule], -[banned thing], *[restricted thing], +[unbanned/unrestricted thing]');
				this.add('||/battlerules - Detailed information on what can go in [rules].');
				return;
			case 'accept':
				this.add('||/accept - Accept a challenge if only one is pending.');
				this.add('||/accept [user] - Accept a challenge from the specified user.');
				return;
			case 'reject':
				this.add('||/reject - Reject a challenge if only one is pending.');
				this.add('||/reject [user] - Reject a challenge from the specified user.');
				return;
			case 'user':
			case 'open':
				this.add('||/user [user] - Open a popup containing the user [user]\'s avatar, name, rank, and chatroom list.');
				return;
			case 'news':
				this.add('||/news - Opens a popup containing the news.');
				return;
			case 'ignore':
			case 'unignore':
				this.add('||/ignore [user] - Ignore all messages from the user [user].');
				this.add('||/unignore [user] - Remove the user [user] from your ignore list.');
				this.add('||/ignorelist - List all the users that you currently ignore.');
				this.add('||/clearignore - Remove all users on your ignore list.');
				this.add('||Note that staff messages cannot be ignored.');
				return;
			case 'nick':
				this.add('||/nick [new username] - Change your username.');
				return;
			case 'clear':
				this.add('||/clear - Clear the room\'s chat log.');
				return;
			case 'showdebug':
			case 'hidedebug':
				this.add('||/showdebug - Receive debug messages from battle events.');
				this.add('||/hidedebug - Ignore debug messages from battle events.');
				return;
			case 'showjoins':
			case 'hidejoins':
				this.add('||/showjoins [room] - Receive users\' join/leave messages. Optionally for only specified room.');
				this.add('||/hidejoins [room] - Ignore users\' join/leave messages. Optionally for only specified room.');
				return;
			case 'showbattles':
			case 'hidebattles':
				this.add('||/showbattles - Receive links to new battles in Lobby.');
				this.add('||/hidebattles - Ignore links to new battles in Lobby.');
				return;
			case 'ffto':
			case 'fastforwardto':
				this.add('||/ffto [turn] - Skip to turn [turn] in the current battle.');
				this.add('||/ffto +[turn] - Skip forward [turn] turns.');
				this.add('||/ffto -[turn] - Skip backward [turn] turns.');
				this.add('||/ffto 0 - Skip to the start of the battle.');
				this.add('||/ffto end - Skip to the end of the battle.');
				return;
			case 'unpackhidden':
			case 'packhidden':
				this.add('||/unpackhidden - Suppress hiding locked or banned users\' chat messages after the fact.');
				this.add('||/packhidden - Hide locked or banned users\' chat messages after the fact.');
				this.add('||Hidden messages from a user can be restored by clicking the button underneath their lock/ban reason.');
				return;
			case 'timestamps':
				this.add('||Set your timestamps preference:');
				this.add('||/timestamps [all|lobby|pms], [minutes|seconds|off]');
				this.add('||all - Change all timestamps preferences, lobby - Change only lobby chat preferences, pms - Change only PM preferences.');
				this.add('||off - Set timestamps off, minutes - Show timestamps of the form [hh:mm], seconds - Show timestamps of the form [hh:mm:ss].');
				return;
			case 'highlight':
			case 'hl':
				this.add('||Set up highlights:');
				this.add('||/highlight add [word 1], [word 2], [...] - Add the provided list of words to your highlight list.');
				this.add('||/highlight roomadd [word 1], [word 2], [...] - Add the provided list of words to the highlight list of whichever room you used the command in.');
				this.add('||/highlight list - List all words that currently highlight you.');
				this.add('||/highlight roomlist - List all words that currently highlight you in whichever room you used the command in.');
				this.add('||/highlight delete [word 1], [word 2], [...] - Delete the provided list of words from your entire highlight list.');
				this.add('||/highlight roomdelete [word 1], [word 2], [...] - Delete the provided list of words from the highlight list of whichever room you used the command in.');
				this.add('||/highlight clear - Clear your global highlight list.');
				this.add('||/highlight roomclear - Clear the highlight list of whichever room you used the command in.');
				this.add('||/highlight clearall - Clear your entire highlight list (all rooms and globally).');
				return;
			case 'rank':
			case 'ranking':
			case 'rating':
			case 'ladder':
				this.add('||/rating - Get your own rating.');
				this.add('||/rating [username] - Get user [username]\'s rating.');
				return;
			case 'afd':
				this.add('||/afd full - Enable all April Fools\' Day jokes.');
				this.add('||/afd sprites - Enable April Fools\' Day sprites.');
				this.add('||/afd default - Set April Fools\' Day to default (full on April 1st, off otherwise).');
				this.add('||/afd off - Disable April Fools\' Day jokes until the next refresh, and set /afd default.');
				this.add('||/afd never - Disable April Fools\' Day jokes permanently.');
				return;
			default:
				return true;
			}
		},
		'autojoin,cmd,crq,query'() {
			this.errorReply(`This is a PS system command; do not use it.`);
		},
	});
	clientCommands: ParsedClientCommands | null = null;
	currentElement: HTMLElement | null = null;
	/**
	 * Handles outgoing messages, like `/logout`. Return `true` to prevent
	 * the line from being sent to servers.
	 */
	handleSend(line: string, element = this.currentElement) {
		if (!line.startsWith('/') || line.startsWith('//')) return line;
		const spaceIndex = line.indexOf(' ');
		const cmd = (spaceIndex >= 0 ? line.slice(1, spaceIndex) : line.slice(1)) as 'parsed';
		const target = spaceIndex >= 0 ? line.slice(spaceIndex + 1).trim() : '';

		const cmdHandler = this.globalClientCommands[cmd] || this.clientCommands?.[cmd];
		if (!cmdHandler) return line;

		const previousElement = this.currentElement;
		this.currentElement = element;
		const cmdResult = cmdHandler.call(this, target, cmd, element);
		this.currentElement = previousElement;
		if (cmdResult === true) return line;
		return cmdResult || null;
	}
	send(msg: string | null, element?: HTMLElement | null) {
		if (!msg) return;
		msg = this.handleSend(msg, element);
		if (!msg) return;
		this.sendDirect(msg);
	}
	sendDirect(msg: string) {
		if (this.connected === 'expired') return this.add(`This room has expired (you can't chat in it anymore)`);
		PS.send(msg, this.id);
	}
	destroy() {
		if (this.connected === true) {
			this.sendDirect(`/noreply /leave ${this.id}`);
			this.connected = false;
		}
	}
}

class PlaceholderRoom extends PSRoom {
	override readonly classType = 'placeholder';
	constructor(options: RoomOptions) {
		super(options);
		this.isPlaceholder = true;
	}
	override receiveLine(args: Args) {
		(this.backlog ||= []).push(args);
	}
}

/**********************************************************************
 * PS
 *********************************************************************/

type PSRoomPanelSubclass<T extends PSRoom = PSRoom> = (new () => PSRoomPanel<T>) & {
	readonly id: string,
	readonly routes: string[],
	/** optional Room class */
	readonly Model?: new (options: RoomOptions) => T,
	readonly location?: PSRoomLocation,
	/** do not put the roomid into the URL */
	noURL?: boolean,
	icon?: preact.ComponentChildren,
	title?: string,
	handleDrop?: (ev: DragEvent) => boolean | void,
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
	/**
	 * While PS is technically disconnected while it's trying to connect,
	 * it still shows UI like it's connected, so you can click buttons
	 * before the server connection is established.
	 *
	 * `isOffline` is only set if PS is neither connected nor trying to
	 * connect.
	 */
	isOffline = false;
	readonly startTime = Date.now();

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
		"options": "*semimodal-popup",
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
		"help-*": "*right",
		"tourpopout": "*semimodal-popup",
		"groupchat-*": "*right",
		"users": "*popup",
		"useroptions-*": "*popup",
		"userlist": "*semimodal-popup",
		"avatars": "*semimodal-popup",
		"changepassword": "*semimodal-popup",
		"register": "*semimodal-popup",
		"forfeitbattle": "*semimodal-popup",
		"replaceplayer": "*semimodal-popup",
		"changebackground": "*semimodal-popup",
		"confirmleaveroom": "*semimodal-popup",
		"chatformatting": "*semimodal-popup",
		"popup-*": "*semimodal-popup",
		"roomtablist": "*semimodal-popup",
		"battleoptions": "*semimodal-popup",
		"battletimer": "*semimodal-popup",
		"rules-*": "*modal-popup",
		"resources": "*",
		"game-*": "*",
		"teamstorage-*": "*semimodal-popup",
		"viewteam-*": "*",
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
	 * The currently active panel. Should always be either `PS.leftPanel`
	 * or `PS.leftPanel`. If no popups are open, should be `PS.room`.
	 *
	 * In one-panel mode, determines whether the left or right panel is
	 * visible. Otherwise, it just tracks which panel will be in focus
	 * after all popups are closed.
	 */
	panel: PSRoom = null!;
	/**
	 * Currently active left room.
	 *
	 * In two-panel mode, this will be the visible left panel.
	 *
	 * In one-panel mode, this is the visible room only if it is
	 * `PS.panel`. Still tracked when not visible, so we know which
	 * panels to display if PS is resized to two-panel mode.
	 */
	leftPanel: PSRoom = null!;
	/**
	 * Currently active right room.
	 *
	 * In two-panel mode, this will be the visible right panel.
	 *
	 * In one-panel mode, this is the visible room only if it is
	 * `PS.panel`. Still tracked when not visible, so we know which
	 * panels to display if PS is resized to two-panel mode.
	 */
	rightPanel: PSRoom | null = null;
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
	 * what's being dragged until the `drop` event, so we track what we
	 * do know here.
	 *
	 * Note that `PS.dragging` will sometimes have type `?` if the drag
	 * was initiated outside PS (e.g. dragging a team from File Explorer
	 * to PS), and for security reasons it's impossible to know what
	 * they are until they're dropped.
	 */
	dragging: { type: 'room', roomid: RoomID, foreground?: boolean } |
		{ type: 'team', team: Team | number, folder: string | null } |
		{ type: '?' } | // browser preventing us from knowing what's being dragged
		null = null;
	lastMessageTime = '';

	/** Tracks whether or not to display the "Use arrow keys" hint */
	arrowKeysUsed = false;

	newsHTML = document.querySelector('#room-news .readable-bg')?.innerHTML || '';

	libsLoaded = makeLoadTracker();

	constructor() {
		super();

		this.mainmenu = this.addRoom({
			id: '' as RoomID,
			title: "Home",
		}) as MainMenuRoom;

		this.addRoom({
			id: 'rooms' as RoomID,
			title: "Rooms",
			autofocus: false,
		});
		this.rightPanel = this.rooms['rooms']!;

		if (this.newsHTML) {
			this.addRoom({
				id: 'news' as RoomID,
				title: "News",
				autofocus: false,
			});
		}

		// Create rooms before /autojoin is sent to the server
		let autojoin = this.prefs.autojoin;
		if (autojoin) {
			if (typeof autojoin === 'string') {
				autojoin = { showdown: autojoin };
			}
			let rooms = autojoin[this.server.id] || '';
			for (let title of rooms.split(",")) {
				this.addRoom({ id: toID(title) as unknown as RoomID, title, connected: true, autofocus: false });
			}
		}

		// for old versions of Safari
		if (window.webkitNotification) {
			window.Notification ||= window.webkitNotification;
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
		case 'team':
			return {
				minWidth: 660,
				width: 660,
				maxWidth: 660,
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
		// might be the close button on the roomtab
		if ((curElem as HTMLButtonElement)?.name === 'closeRoom' && (curElem as HTMLButtonElement).value) {
			return PS.rooms[(curElem as HTMLButtonElement).value] || null;
		}
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
					room = this.addRoom({
						id: roomid2,
						type,
						connected: true,
						autofocus: roomid !== 'staff' && roomid !== 'upperstaff',
						// probably the only use for `autoclosePopups: false`.
						// (the server sometimes sends a popup error message and a new room at the same time)
						autoclosePopups: false,
					});
				} else {
					room.type = type;
					this.updateRoomTypes();
				}
				if (room) {
					if (room.connected === 'autoreconnect') {
						room.connected = true;
						if (room.handleReconnect(msg)) return;
					}
					room.connected = true;
				}
				this.updateAutojoin();
				this.update();
				continue;
			} case 'deinit': {
				room = PS.rooms[roomid2];
				if (room && room.connected !== 'expired') {
					room.connected = false;
					this.removeRoom(room);
				}
				this.updateAutojoin();
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
						if (room.type === 'chat' || room.type === 'battle') room.receiveLine(args);
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
	send(msg: string, roomid?: RoomID) {
		const bracketRoomid = roomid ? `[${roomid}] ` : '';
		console.log(`\u25b6\ufe0f ${bracketRoomid}%c${msg}`, "color: #776677");
		if (!this.connection) {
			PS.alert(`You are not connected and cannot send ${msg}.`);
			return;
		}
		this.connection.send(`${roomid || ''}|${msg}`);
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
		if (document.documentElement.clientWidth < 800 || this.prefs.onepanel === 'vertical') {
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
		if (roomid.startsWith('dm-')) {
			if (document.documentElement.clientWidth <= 818) {
				return 'left';
			}
			return 'mini-window';
		}
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
			const typeIsGuessed = room.type === this.routes['*'] && !roomid.includes('-');
			if (!room.isPlaceholder && !typeIsGuessed) continue;

			let type = (!typeIsGuessed && room.type) || this.getRoute(roomid as RoomID) || room.type || '';
			if (!room.isPlaceholder && type === room.type) continue;

			const RoomType = type && this.roomTypes[type];
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
			if (roomid === '') this.mainmenu = newRoom as MainMenuRoom;
			if (this.room === room) {
				this.room = newRoom;
				newRoom.focusNextUpdate = true;
			}

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
		this.closePopupsAbove(room, true);
		if (!this.isVisible(room)) {
			room.focusNextUpdate = true;
		}
		if (PS.isNormalRoom(room)) {
			if (room.location === 'right') {
				this.rightPanel = room;
			} else {
				this.leftPanel = room;
			}
			this.panel = this.room = room;
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
	alert(message: string, opts: { okButton?: string, parentElem?: HTMLElement | null, width?: number } = {}) {
		this.join(`popup-${this.popups.length}` as RoomID, {
			args: { message, ...opts, parentElem: null },
			parentElem: opts.parentElem,
		});
	}
	confirm(message: string, opts: {
		okButton?: string, cancelButton?: string,
		otherButtons?: preact.ComponentChildren, parentElem?: HTMLElement,
	} = {}) {
		opts.cancelButton ??= 'Cancel';
		return new Promise(resolve => {
			this.join(`popup-${this.popups.length}` as RoomID, {
				args: { message, okValue: true, cancelValue: false, callback: resolve, ...opts, parentElem: null },
				parentElem: opts.parentElem,
			});
		});
	}
	prompt(message: string, opts: {
		defaultValue?: string, okButton?: string, cancelButton?: string, type?: 'text' | 'password' | 'number' | 'numeric',
		otherButtons?: preact.ComponentChildren, parentElem?: HTMLElement | null,
	} = {}): Promise<string | null> {
		opts.cancelButton ??= 'Cancel';
		return new Promise(resolve => {
			this.join(`popup-${this.popups.length}` as RoomID, {
				args: {
					message, value: opts.defaultValue || '',
					okValue: true, cancelValue: false, callback: resolve, ...opts, parentElem: null,
				},
				parentElem: opts.parentElem,
			});
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
	 *
	 * By default, focuses the room after adding it. (`options.autofocus = false` to suppress)
	 *
	 * By default, when autofocusing, closes popups that aren't the parent of the added room.
	 * (`options.autoclosePopups = false` to suppress)
	 */
	addRoom(options: RoomOptions & { autoclosePopups?: boolean, autofocus?: boolean }) {
		options.autofocus ??= true;
		options.autoclosePopups ??= options.autofocus;
		// support hardcoded PM room-IDs
		if (options.id.startsWith('challenge-')) {
			this.requestNotifications();
			options.id = `dm-${options.id.slice(10)}` as RoomID;
			options.args = { challengeMenuOpen: true, ...options.args };
		}
		if (options.id.startsWith('dm-')) {
			this.requestNotifications();
			if (options.id.length >= 5 && options.id.endsWith('--')) {
				options.id = options.id.slice(0, -2) as RoomID;
				options.args = { initialSlash: true };
			}
		}
		if (options.id.startsWith('battle-') && PS.prefs.rightpanelbattles) options.location = 'right';
		options.parentRoomid ??= this.getRoom(options.parentElem)?.id;
		const parentRoom = options.parentRoomid ? this.rooms[options.parentRoomid] : null;
		let preexistingRoom = this.rooms[options.id];
		if (preexistingRoom && this.isPopup(preexistingRoom)) {
			const sameOpener = (preexistingRoom.parentElem === options.parentElem);
			this.closePopupsAbove(parentRoom, true);
			if (sameOpener) return;
			preexistingRoom = this.rooms[options.id];
		}
		if (preexistingRoom) {
			if (options.args?.format) {
				preexistingRoom.args = options.args;
				if ((preexistingRoom as ChatRoom).challengeMenuOpen) {
					options.args.format = `!!${options.args.format as string}`;
				}
			}
			if (options.autofocus) {
				if (options.args?.challengeMenuOpen) {
					(preexistingRoom as ChatRoom).openChallenge();
				}
				this.focusRoom(preexistingRoom.id);
			}
			return preexistingRoom;
		}
		if (options.autoclosePopups) {
			let parentPopup = parentRoom;
			if ((options.parentElem as HTMLButtonElement)?.name === 'closeRoom') {
				// We want to close all popups above the parent element.
				// This is usually the parent room, but if we're clicking Close
				// in the overflow tablist, the close button's parent room is
				// the tab rather than the overflow tablist popup,
				// which needs to be corrected here.
				parentPopup = PS.rooms['roomtablist'] || parentPopup;
			}
			this.closePopupsAbove(parentPopup, true);
		}
		const room = this.createRoom(options);
		this.rooms[room.id] = room;
		const location = room.location;
		room.location = null!;
		this.moveRoom(room, location, !options.autofocus);
		if (options.backlog) {
			for (const args of options.backlog) {
				room.receiveLine(args);
			}
		}
		if (options.autofocus) room.focusNextUpdate = true;
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
		return room.location === 'left' || room.location === 'right';
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
			this.room = room;
		}
	}
	removeRoom(room: PSRoom) {
		const wasFocused = this.room === room;
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
			if (this.popups.length) {
				// focus topmost popup
				PS.room = PS.rooms[this.popups[this.popups.length - 1]]!;
			} else {
				// if popup parent is a mini-window, focus popup parent
				PS.room = PS.rooms[room.parentRoomid ?? PS.panel.id] || PS.panel;
				// otherwise focus current panel
				if (PS.room.location !== 'mini-window' || PS.panel !== PS.mainmenu) PS.room = PS.panel;
			}
		}

		if (wasFocused) {
			this.room.focusNextUpdate = true;
		}
	}
	/** do NOT use this in a while loop: see `closePopupsUntil */
	closePopup(skipUpdate?: boolean) {
		if (!this.popups.length) return;
		this.leave(this.popups[this.popups.length - 1]);
		if (!skipUpdate) this.update();
	}
	closeAllPopups(skipUpdate?: boolean) {
		this.closePopupsAbove(null, skipUpdate);
	}
	closePopupsAbove(room: PSRoom | null | undefined, skipUpdate?: boolean) {
		if (!this.popups.length) return;
		// a while-loop may be simpler, but the loop invariant is very hard to prove
		// and any bugs (opening a popup while leaving a room) could lead to an infinite loop
		// a for-loop doesn't have that problem
		for (let i = this.popups.length - 1; i >= 0; i--) {
			if (room && this.popups[i] === room.id) break;
			this.removeRoom(PS.rooms[this.popups[i]]!);
		}
		if (!skipUpdate) this.update();
	}
	/** Focus a room, creating it if it doesn't already exist. */
	join(roomid: RoomID, options?: Partial<RoomOptions> | null) {
		// popups are always reopened rather than focused
		if (PS.rooms[roomid] && !PS.isPopup(PS.rooms[roomid])) {
			if (this.room.id === roomid) return;
			this.focusRoom(roomid);
			return;
		}
		this.addRoom({ id: roomid, ...options });
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

	updateAutojoin() {
		if (!PS.server.registered) return;
		let autojoins: string[] = [];
		let autojoinCount = 0;
		let rooms = this.rightRoomList;
		for (let roomid of rooms) {
			let room = PS.rooms[roomid] as ChatRoom;
			if (!room) return;
			if (room.type !== 'chat' || room.pmTarget) continue;
			autojoins.push(room.id.includes('-') ? room.id : (room.title || room.id));
			if (room.id === 'staff' || room.id === 'upperstaff' || (PS.server.id !== 'showdown' && room.id === 'lobby')) continue;
			autojoinCount++;
			if (autojoinCount >= 15) break;
		}

		const thisAutojoin = autojoins.join(',') || null;
		let autojoin = this.prefs.autojoin || null;
		if (this.server.id === 'showdown' && typeof autojoin !== 'object') {
			// Main server only mode
			if (autojoin === thisAutojoin) return;

			this.prefs.set('autojoin', thisAutojoin || null);
		} else {
			// Multi server mode
			autojoin = typeof autojoin === 'string' ? { showdown: autojoin } : autojoin || {};
			if (autojoin[this.server.id] === thisAutojoin) return;

			autojoin[this.server.id] = thisAutojoin || '';
			this.prefs.set('autojoin', autojoin);
		}
	}
	requestNotifications() {
		try {
			if (window.webkitNotifications?.requestPermission) {
				// Notification.requestPermission crashes Chrome 23:
				//   https://code.google.com/p/chromium/issues/detail?id=139594
				// In lieu of a way to detect Chrome 23, we'll just use the old
				// requestPermission API, which works to request permissions for
				// the new Notification spec anyway.
				window.webkitNotifications.requestPermission();
			} else if (window.Notification) {
				Notification.requestPermission?.(permission => {});
			}
		} catch {}
	}
	playNotificationSound() {
		if (window.BattleSound && !this.prefs.mute) {
			window.BattleSound.playSound('audio/notification.wav', this.prefs.notifvolume);
		}
	}
};
