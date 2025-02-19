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
import {PSModel, PSStreamModel} from './client-core';
import type {PSRouter} from './panels';
import type {ChatRoom} from './panel-chat';
import type {MainMenuRoom} from './panel-mainmenu';
import {toID, type ID} from './battle-dex';
import {BattleTextParser, type Args} from './battle-text-parser';

/**********************************************************************
 * Prefs
 *********************************************************************/

/**
 * String that contains only lowercase alphanumeric characters.
 */
export type RoomID = string & {__isRoomID: true};

const PSPrefsDefaults: {[key: string]: any} = {};

/**
 * Tracks user preferences, stored in localStorage. Contains most local
 * data, with the exception of backgrounds, teams, and session data,
 * which get their own models.
 *
 * Updates will name the key updated, so you don't need to overreact.
 */
class PSPrefs extends PSStreamModel<string | null> {
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
	showjoins: {[serverid: string]: {[roomid: string]: 1 | 0}} | null = null;
	/**
	 * true = one panel, false = two panels, left and right
	 */
	onepanel = false;

	mute = false;
	effectvolume = 50;
	musicvolume = 50;
	notifvolume = 50;

	storageEngine: 'localStorage' | 'iframeLocalStorage' | '' = '';
	storage: {[k: string]: any} = {};
	readonly origin = `https://${Config.routes.client}`;
	constructor() {
		super();

		for (const key in this) {
			const value = (this as any)[key];
			if (['storage', 'subscriptions', 'origin', 'storageEngine'].includes(key)) continue;
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
	set<T extends keyof PSPrefs>(key: T, value: PSPrefs[T]) {
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
			const showjoins: {[serverid: string]: {[roomid: string]: 1 | 0}} = {};
			const serverShowjoins: {[roomid: string]: 1 | 0} = {global: (oldShowjoins ? 1 : 0)};
			const showroomjoins = newPrefs['showroomjoins'] as {[roomid: string]: boolean};
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
			alert('Your version of Chrome has a bug that makes animated GIFs freeze games sometimes, so certain animations have been disabled. Only some people have the problem, so you can experiment and enable them in the Options menu setting "Disable GIFs for Chrome 64 bug".');
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
	byKey: {[key: string]: Team | undefined} = {};
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

		if (buffer.charAt(0) === '[' && !buffer.trim().includes('\n')) {
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
		alert(`Your team storage format is too old for PS. You'll need to upgrade it at https://${Config.routes.client}/recoverteams.html`);
		this.list = [];
		return;
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
		if (format.slice(0, 3) !== 'gen') format = 'gen6' + format;
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

class PSUser extends PSModel {
	name = "";
	group = '';
	userid = "" as ID;
	named = false;
	registered = false;
	avatar = "1";
	setName(fullName: string, named: boolean, avatar: string) {
		const loggingIn = (!this.named && named);
		const {name, group} = BattleTextParser.parseNameParts(fullName);
		this.name = name;
		this.group = group;
		this.userid = toID(name);
		this.named = named;
		this.avatar = avatar;
		this.update();
		if (loggingIn) {
			for (const roomid in PS.rooms) {
				const room = PS.rooms[roomid]!;
				if (room.connectWhenLoggedIn) room.connect();
			}
		}
	}
	logOut() {
		PSLoginServer.query({
			act: 'logout',
			userid: this.userid,
		});
		PS.send('|/logout');
		PS.connection?.disconnect();

		alert("You have been logged out and disconnected.\n\nIf you wanted to change your name while staying connected, use the 'Change Name' button or the '/nick' command.");
		this.name = "";
		this.group = '';
		this.userid = "" as ID;
		this.named = false;
		this.registered = false;
		this.update();
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
	groups: {[symbol: string]: PSGroup} = {
		'~': {
			name: "Administrator (~)",
			type: 'leadership',
			order: 101,
		},
		'#': {
			name: "Room Owner (#)",
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
	type?: string;
	location?: PSRoomLocation | null;
	/** Handled after initialization, outside of the constructor */
	queue?: Args[];
	parentElem?: HTMLElement | null;
	parentRoomid?: RoomID | null;
	rightPopup?: boolean;
	connected?: boolean;
	[k: string]: unknown;
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
	connected: boolean = false;
	/**
	 * Can this room even be connected to at all?
	 * `true` = pass messages from the server to subscribers
	 * `false` = throw an error if we receive messages from the server
	 */
	readonly canConnect: boolean = false;
	connectWhenLoggedIn: boolean = false;
	onParentEvent: ((eventId: 'focus' | 'keydown', e?: Event) => false | void) | null = null;

	width = 0;
	height = 0;
	parentElem: HTMLElement | null = null;
	rightPopup = false;

	notifications: PSNotificationState[] = [];
	isSubtleNotifying = false;

	// for compatibility with RoomOptions
	[k: string]: unknown;

	constructor(options: RoomOptions) {
		super();
		this.id = options.id;
		if (options.title) this.title = options.title;
		if (!this.title) this.title = this.id;
		if (options.type) this.type = options.type;
		if (options.location) this.location = options.location;
		if (options.parentElem) this.parentElem = options.parentElem;
		if (this.location !== 'popup' && this.location !== 'semimodal-popup') this.parentElem = null;
		if (options.rightPopup) this.rightPopup = true;
		if (options.connected) this.connected = true;
	}
	notify(options: {title: string, body?: string, noAutoDismiss?: boolean, id?: string}) {
		if (options.noAutoDismiss && !options.id) {
			throw new Error(`Must specify id for manual dismissing`);
		}
		this.notifications.push({
			title: options.title,
			body: options.body,
			id: options.id || '',
			noAutoDismiss: options.noAutoDismiss || false,
		});
		PS.update();
	}
	dismissNotification(id: string) {
		this.notifications = this.notifications.filter(notification => notification.id !== id);
		PS.update();
	}
	autoDismissNotifications() {
		this.notifications = this.notifications.filter(notification => notification.noAutoDismiss);
		this.isSubtleNotifying = false;
	}
	setDimensions(width: number, height: number) {
		if (this.width === width && this.height === height) return;
		this.width = width;
		this.height = height;
		this.update(null);
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
			this.notify({title, body, id});
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
		}}
	}
	handleMessage(line: string) {
		if (!line.startsWith('/') || line.startsWith('//')) return false;
		const spaceIndex = line.indexOf(' ');
		const cmd = spaceIndex >= 0 ? line.slice(1, spaceIndex) : line.slice(1);
		// const target = spaceIndex >= 0 ? line.slice(spaceIndex + 1) : '';
		switch (cmd) {
		case 'logout': {
			PS.user.logOut();
			return true;
		}}
		return false;
	}
	send(msg: string, direct?: boolean) {
		if (!direct && !msg) return;
		if (!direct && this.handleMessage(msg)) return;

		PS.send(this.id + '|' + msg);
	}
	destroy() {
		if (this.connected) {
			this.send('/noreply /leave', true);
			this.connected = false;
		}
	}
}

class PlaceholderRoom extends PSRoom {
	queue = [] as Args[];
	override readonly classType: 'placeholder' = 'placeholder';
	override receiveLine(args: Args) {
		this.queue.push(args);
	}
}

/**********************************************************************
 * PS
 *********************************************************************/

type RoomType = {Model?: typeof PSRoom, Component: any, title?: string};

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

	rooms: {[roomid: string]: PSRoom | undefined} = {};
	roomTypes: {
		[type: string]: RoomType | undefined,
	} = {};
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
	leftRoom: PSRoom = null!;
	/**
	 * Currently active right room.
	 *
	 * In two-panel mode, this will be the visible right panel.
	 *
	 * In one-panel mode, this is the visible room only if it is
	 * `PS.room`. Still tracked when not visible, so we know which
	 * panels to display if PS is resized to two-panel mode.
	 */
	rightRoom: PSRoom | null = null;
	/**
	 * The currently focused room. Should always be the topmost popup
	 * if it exists. If no popups are open, it should be
	 * `PS.activePanel`.
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
	 * visible.
	 */
	activePanel: PSRoom = null!;
	/**
	 * Not to be confused with PSPrefs.onepanel, which is permanent.
	 * PS.onePanelMode will be true if one-panel mode is on, but it will
	 * also be true if the right panel is temporarily hidden (by opening
	 * the Rooms panel and clicking "Hide")
	 *
	 * Will NOT be true if only one panel fits onto the screen at the
	 * moment, but resizing will display multiple panels – for that,
	 * check `PS.leftRoomWidth === 0`
	 */
	onePanelMode = false;
	/**
	 * 0 = only one panel visible.
	 * n.b. PS will only update if the left room width changes. Resizes
	 * that don't change the left room width will not trigger an update.
	 */
	leftRoomWidth = 0;
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
	dragging: {type: 'room', roomid: RoomID} | null = null;

	/** Tracks whether or not to display the "Use arrow keys" hint */
	arrowKeysUsed = false;

	newsHTML = document.querySelector('.news-embed .pm-log')?.innerHTML || '';

	constructor() {
		super();

		this.addRoom({
			id: '' as RoomID,
			title: "Home",
		});

		this.addRoom({
			id: 'rooms' as RoomID,
			title: "Rooms",
		});

		if (this.newsHTML) {
			this.addRoom({
				id: 'news' as RoomID,
				title: "News",
			});
		}

		this.updateLayout();
		window.addEventListener('resize', () => this.updateLayout());
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
	updateLayout(alreadyUpdating?: boolean) {
		const leftRoomWidth = this.calculateLeftRoomWidth();
		let roomHeight = document.body.offsetHeight - 56;
		let totalWidth = document.body.offsetWidth;
		if (leftRoomWidth) {
			this.leftRoom.width = leftRoomWidth;
			this.leftRoom.height = roomHeight;
			this.rightRoom!.width = totalWidth + 1 - leftRoomWidth;
			this.rightRoom!.height = roomHeight;
		} else {
			this.activePanel.width = totalWidth;
			this.activePanel.height = roomHeight;
		}

		if (this.leftRoomWidth !== leftRoomWidth) {
			this.leftRoomWidth = leftRoomWidth;
			if (!alreadyUpdating) this.update(true);
		}
	}
	override update(layoutAlreadyUpdated?: boolean) {
		if (!layoutAlreadyUpdated) this.updateLayout(true);
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
					}
				}
				this.update();
				continue;
			}}
			if (room) room.receiveLine(args);
		}
		if (room) room.update(isInit ? [`initdone`] : null);
	}
	send(fullMsg: string) {
		const pipeIndex = fullMsg.indexOf('|');
		const roomid = fullMsg.slice(0, pipeIndex) as RoomID;
		const msg = fullMsg.slice(pipeIndex + 1);
		console.log('\u25b6\ufe0f ' + (roomid ? '[' + roomid + '] ' : '') + '%c' + msg, "color: #776677");
		if (!this.connection) {
			alert(`You are not connected and cannot send ${msg}.`);
			return;
		}
		this.connection.send(fullMsg);
	}
	isVisible(room: PSRoom) {
		if (this.leftRoomWidth === 0) {
			// one panel visible
			return room === this.room;
		} else {
			// both panels visible
			return room === this.rightRoom || room === this.leftRoom;
		}
	}
	calculateLeftRoomWidth() {
		// If we don't have both a left room and a right room, obviously
		// just show one room
		if (!this.leftRoom || !this.rightRoom || this.onePanelMode) {
			return 0;
		}

		// The rest of this code can assume we have both a left room and a
		// right room, and also want to show both if they fit

		const left = this.getWidthFor(this.leftRoom);
		const right = this.getWidthFor(this.rightRoom);
		const available = document.body.offsetWidth;

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
		// type/side not defined in roomTypes because they need to be guessed before the types are loaded
		if (!options.type) {
			const hyphenIndex = options.id.indexOf('-');
			switch (hyphenIndex < 0 ? options.id : options.id.slice(0, hyphenIndex + 1)) {
			case 'teambuilder': case 'ladder': case 'battles': case 'rooms':
			case 'options': case 'volume': case 'teamdropdown': case 'formatdropdown':
			case 'news':
				options.type = options.id;
				break;
			case 'battle-': case 'user-': case 'team-': case 'ladder-':
				options.type = options.id.slice(0, hyphenIndex);
				break;
			case 'view-':
				options.type = 'html';
				break;
			case '':
				options.type = 'mainmenu';
				break;
			default:
				options.type = 'chat';
				break;
			}
		}

		if (!options.location) {
			switch (options.type) {
			case 'rooms':
			case 'chat':
				options.location = 'right';
				break;
			case 'options':
			case 'volume':
			case 'user':
				options.location = 'popup';
				break;
			case 'teamdropdown':
			case 'formatdropdown':
				options.location = 'semimodal-popup';
				break;
			case 'news':
				options.location = 'mini-window';
				break;
			}
			if (options.id.startsWith('pm-')) options.location = 'mini-window';
		}

		const roomType = this.roomTypes[options.type];
		if (roomType?.title) options.title = roomType.title;
		const Model = roomType ? (roomType.Model || PSRoom) : PlaceholderRoom;
		return new Model(options);
	}
	updateRoomTypes() {
		let updated = false;
		for (const roomid in this.rooms) {
			const room = this.rooms[roomid]!;
			if (room.type === room.classType) continue;
			const roomType = this.roomTypes[room.type];
			if (!roomType) continue;

			const options: RoomOptions = room;
			if (roomType.title) options.title = roomType.title;
			const Model = roomType.Model || PSRoom;
			const newRoom = new Model(options);
			this.rooms[roomid] = newRoom;
			if (this.leftRoom === room) this.leftRoom = newRoom;
			if (this.rightRoom === room) this.rightRoom = newRoom;
			if (this.activePanel === room) this.activePanel = newRoom;
			if (this.room === room) this.room = newRoom;
			if (roomid === '') this.mainmenu = newRoom as MainMenuRoom;

			if (options.queue) {
				for (const args of options.queue) {
					room.receiveLine(args);
				}
			}
			updated = true;
		}
		if (updated) this.update();
	}
	focusRoom(roomid: RoomID) {
		if (this.room.id === roomid) return;
		if (this.leftRoomList.includes(roomid)) {
			this.leftRoom = this.rooms[roomid]!;
			this.activePanel = this.leftRoom;
			while (this.popups.length) this.leave(this.popups.pop()!);
			this.room = this.leftRoom;
		} else if (this.rightRoomList.includes(roomid)) {
			this.rightRoom = this.rooms[roomid]!;
			this.activePanel = this.rightRoom;
			while (this.popups.length) this.leave(this.popups.pop()!);
			this.room = this.rightRoom;
		} else if (this.rooms[roomid]) { // popup
			this.room = this.rooms[roomid]!;
		} else {
			return false;
		}
		this.room.autoDismissNotifications();
		this.update();
		this.room.onParentEvent?.('focus', undefined);
		return true;
	}
	focusLeftRoom() {
		const allRooms = this.leftRoomList.concat(this.rightRoomList);
		let roomIndex = allRooms.indexOf(this.room.id);
		if (roomIndex === -1) {
			// inconsistent state: should not happen
			return this.focusRoom('' as RoomID);
		}
		if (roomIndex === 0) {
			return this.focusRoom(allRooms[allRooms.length - 1]);
		}
		return this.focusRoom(allRooms[roomIndex - 1]);
	}
	focusRightRoom() {
		const allRooms = this.leftRoomList.concat(this.rightRoomList);
		let roomIndex = allRooms.indexOf(this.room.id);
		if (roomIndex === -1) {
			// inconsistent state: should not happen
			return this.focusRoom('' as RoomID);
		}
		if (roomIndex === allRooms.length - 1) {
			return this.focusRoom(allRooms[0]);
		}
		return this.focusRoom(allRooms[roomIndex + 1]);
	}
	focusPreview(room: PSRoom) {
		if (room !== this.room) return '';
		const allRooms = this.leftRoomList.concat(this.rightRoomList);
		let roomIndex = allRooms.indexOf(this.room.id);
		if (roomIndex === -1) {
			// inconsistent state: should not happen
			return '';
		}
		let buf = '  ';
		if (roomIndex > 1) { // don't show Home
			const leftRoom = this.rooms[allRooms[roomIndex - 1]]!;
			buf += `\u2190 ${leftRoom.title}`;
		}
		buf += (this.arrowKeysUsed ? " | " : " (use arrow keys) ");
		if (roomIndex < allRooms.length - 1) {
			const rightRoom = this.rooms[allRooms[roomIndex + 1]]!;
			buf += `${rightRoom.title} \u2192`;
		}
		return buf;
	}
	getPMRoom(userid: ID) {
		const myUserid = PS.user.userid;
		const roomid = `pm-${[userid, myUserid].sort().join('-')}` as RoomID;
		if (this.rooms[roomid]) return this.rooms[roomid] as ChatRoom;
		this.join(roomid);
		return this.rooms[roomid]! as ChatRoom;
	}
	addRoom(options: RoomOptions, noFocus?: boolean) {
		// support hardcoded PM room-IDs
		if (options.id.startsWith('challenge-')) {
			options.id = `pm-${options.id.slice(10)}` as RoomID;
			options.challengeMenuOpen = true;
		}
		if (options.id.startsWith('pm-') && options.id.indexOf('-', 3) < 0) {
			const userid1 = PS.user.userid;
			const userid2 = options.id.slice(3);
			options.id = `pm-${[userid1, userid2].sort().join('-')}` as RoomID;
		}

		if (this.rooms[options.id]) {
			for (let i = 0; i < this.popups.length; i++) {
				const popup = this.rooms[this.popups[i]]!;
				if (popup.parentElem === options.parentElem) {
					while (this.popups.length > i) {
						const popupid = this.popups.pop()!;
						this.leave(popupid);
					}
					return;
				}
			}
			if (!noFocus) {
				if (options.challengeMenuOpen) {
					(this.rooms[options.id] as ChatRoom).openChallenge();
				}
				this.focusRoom(options.id);
			}
			return;
		}
		if (!noFocus) {
			while (this.popups.length && this.popups[this.popups.length - 1] !== options.parentRoomid) {
				const popupid = this.popups.pop()!;
				this.leave(popupid);
			}
		}
		const room = this.createRoom(options);
		this.rooms[room.id] = room;
		switch (room.location) {
		case 'left':
			this.leftRoomList.push(room.id);
			if (!noFocus) this.leftRoom = room;
			break;
		case 'right':
			this.rightRoomList.push(room.id);
			if (this.rightRoomList[this.rightRoomList.length - 2] === 'rooms') {
				this.rightRoomList.splice(-2, 1);
				this.rightRoomList.push('rooms' as RoomID);
			}
			if (!noFocus || !this.rightRoom) this.rightRoom = room;
			break;
		case 'mini-window':
			this.miniRoomList.push(room.id);
			break;
		case 'popup':
		case 'semimodal-popup':
		case 'modal-popup':
			this.popups.push(room.id);
			break;
		}
		if (!noFocus) {
			if (!this.popups.length) this.activePanel = room;
			this.room = room;
		}
		if (options.queue) {
			for (const args of options.queue) {
				room.receiveLine(args);
			}
		}
		return room;
	}
	removeRoom(room: PSRoom) {
		room.destroy();
		delete PS.rooms[room.id];

		const leftRoomIndex = PS.leftRoomList.indexOf(room.id);
		if (leftRoomIndex >= 0) {
			PS.leftRoomList.splice(leftRoomIndex, 1);
		}
		if (PS.leftRoom === room) {
			PS.leftRoom = this.mainmenu;
			if (PS.activePanel === room) PS.activePanel = this.mainmenu;
			if (PS.room === room) PS.room = this.mainmenu;
		}

		const rightRoomIndex = PS.rightRoomList.indexOf(room.id);
		if (rightRoomIndex >= 0) {
			PS.rightRoomList.splice(rightRoomIndex, 1);
		}
		if (PS.rightRoom === room) {
			let newRightRoomid = PS.rightRoomList[rightRoomIndex] || PS.rightRoomList[rightRoomIndex - 1];
			PS.rightRoom = newRightRoomid ? PS.rooms[newRightRoomid]! : null;
			if (PS.activePanel === room) PS.activePanel = PS.rightRoom || PS.leftRoom;
			if (PS.room === room) PS.room = PS.activePanel;
		}

		if (room.location === 'mini-window') {
			const miniRoomIndex = PS.miniRoomList.indexOf(room.id);
			if (miniRoomIndex >= 0) {
				PS.miniRoomList.splice(miniRoomIndex, 1);
			}
		}

		if (this.popups.length && room.id === this.popups[this.popups.length - 1]) {
			this.popups.pop();
			PS.room = this.popups.length ? PS.rooms[this.popups[this.popups.length - 1]]! : PS.activePanel;
		}

		this.update();
	}
	closePopup(skipUpdate?: boolean) {
		if (!this.popups.length) return;
		this.leave(this.popups[this.popups.length - 1]);
		if (!skipUpdate) this.update();
	}
	join(roomid: RoomID, side?: PSRoomLocation | null, noFocus?: boolean) {
		if (this.room.id === roomid) return;
		this.addRoom({id: roomid, side}, noFocus);
		this.update();
	}
	leave(roomid: RoomID) {
		const room = PS.rooms[roomid];
		if (room) this.removeRoom(room);
	}
};
