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

/**********************************************************************
 * Prefs
 *********************************************************************/

/**
 * String that contains only lowercase alphanumeric characters.
 */
type RoomID = string & {__isRoomID: true};

const PSPrefsDefaults: {[key: string]: any} = {};

/**
 * Tracks user preferences, stored in localStorage. Contains most local
 * data, with the exception of backgrounds, teams, and session data,
 * which get their own models.
 */
class PSPrefs extends PSModel {
	/**
	 * Dark mode!
	 */
	dark = false;
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

	storageEngine: 'localStorage' | 'iframeLocalStorage' | '' = '';
	storage: {[k: string]: any} = {};
	readonly origin = 'https://play.pokemonshowdown.com';
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
	set(key: string, value: any) {
		if (value === null) {
			delete this.storage[key];
			(this as any)[key] = PSPrefsDefaults[key];
		} else {
			this.storage[key] = value;
			(this as any)[key] = value;
		}
		this.update();
		this.save();
	}
	load(newPrefs: object, noSave?: boolean) {
		this.fixPrefs(newPrefs);
		Object.assign(this, PSPrefsDefaults);
		this.storage = newPrefs;
		this.update();
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
	}
}

/**********************************************************************
 * Teams
 *********************************************************************/

interface Team {
	name: string;
	format: ID;
	packedTeam: string;
	folder: string;
	/** The icon cache must be cleared (to `null`) whenever `packedTeam` is modified */
	iconCache: preact.ComponentChildren;
	key: string;
}

class PSTeams extends PSModel {
	list: Team[] = [];
	byKey: {[key: string]: Team | undefined} = {};
	constructor() {
		super();
		try {
			this.unpackAll(localStorage.getItem('showdown_teams'));
		} catch {}
	}
	getKey(team: Team | null) {
		if (!team) return '';
		if (team.key) return team.key;
		let key = Math.random().toString().substr(2, 1);
		for (let i = 2; key in this.byKey; i++) {
			key = Math.random().toString().substr(2, i);
		}
		team.key = key;
		this.byKey[key] = team;
		return key;
	}
	save() {
		// noop by default
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
			if (team) this.list.push(team);
		}
	}
	unpackOldBuffer(buffer: string) {
		alert("Your team storage format is too old for PS. You'll need to upgrade it at https://play.pokemonshowdown.com/recoverteams.html");
		this.list = [];
		return;
	}
	unpackLine(line: string): Team | null {
		let pipeIndex = line.indexOf('|');
		if (pipeIndex < 0) return null;
		let bracketIndex = line.indexOf(']');
		if (bracketIndex > pipeIndex) bracketIndex = -1;
		let slashIndex = line.lastIndexOf('/', pipeIndex);
		if (slashIndex < 0) slashIndex = bracketIndex; // line.slice(slashIndex + 1, pipeIndex) will be ''
		let format = bracketIndex > 0 ? line.slice(0, bracketIndex) : 'gen7';
		if (format && format.slice(0, 3) !== 'gen') format = 'gen6' + format;
		return {
			name: line.slice(slashIndex + 1, pipeIndex),
			format: format as ID,
			packedTeam: line.slice(pipeIndex + 1),
			folder: line.slice(bracketIndex + 1, slashIndex > 0 ? slashIndex : bracketIndex + 1),
			iconCache: '',
			key: '',
		};
	}
}

/**********************************************************************
 * User
 *********************************************************************/

class PSUser extends PSModel {
	name = "Guest";
	userid = "guest" as ID;
	named = false;
	registered = false;
	avatar = "1";
	setName(name: string, named: boolean, avatar: string) {
		this.name = name;
		this.userid = toID(name);
		this.named = named;
		this.avatar = avatar;
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
	id = 'showdown';
	host = 'sim2.psim.us';
	port = 8000;
	altport = 80;
	registered = true;
	prefix = '/showdown';
	protocol: 'http' | 'https' = 'https';
	groups: {[symbol: string]: PSGroup} = {
		'~': {
			name: "Administrator (~)",
			type: 'leadership',
			order: 10001,
		},
		'&': {
			name: "Leader (&)",
			type: 'leadership',
			order: 10002,
		},
		'#': {
			name: "Room Owner (#)",
			type: 'leadership',
			order: 10003,
		},
		'\u2605': {
			name: "Host (\u2605)",
			type: 'staff',
			order: 10004,
		},
		'@': {
			name: "Moderator (@)",
			type: 'staff',
			order: 10005,
		},
		'%': {
			name: "Driver (%)",
			type: 'staff',
			order: 10006,
		},
		'*': {
			name: "Bot (*)",
			order: 10007,
		},
		'\u2606': {
			name: "Player (\u2606)",
			order: 10008,
		},
		'+': {
			name: "Voice (+)",
			order: 10009,
		},
		' ': {
			order: 10010,
		},
		'!': {
			name: "Muted (!)",
			type: 'punishment',
			order: 10011,
		},
		'✖': {
			name: "Namelocked (\u2716)",
			type: 'punishment',
			order: 10012,
		},
		'\u203d': {
			name: "Locked (\u203d)",
			type: 'punishment',
			order: 10013,
		},
	};
	defaultGroup: PSGroup = {
		order: 10006.5,
	};
	getGroup(symbol: string | undefined) {
		return this.groups[(symbol || ' ').charAt(0)] || this.defaultGroup;
	}
}

/**********************************************************************
 * Rooms
 *********************************************************************/

type PSRoomLocation = 'left' | 'right' | 'popup' | 'modal-popup' | 'semimodal-popup';

interface RoomOptions {
	id: RoomID;
	title?: string;
	type?: string;
	location?: PSRoomLocation | null;
	/** Handled after initialization, outside of the constructor */
	queue?: string[];
	parentElem?: HTMLElement | null;
	parentRoomid?: RoomID | null;
	rightPopup?: boolean;
	connected?: boolean;
	[k: string]: unknown;
}

class PSRoom extends PSStreamModel<string | null> implements RoomOptions {
	id: RoomID;
	title = "";
	type = '';
	notifying: '' | ' notifying' | ' subtle-notifying' = '';
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
	onParentEvent: ((eventId: 'focus' | 'keydown', e?: Event) => false | void) | null = null;

	width = 0;
	height = 0;
	parentElem: HTMLElement | null = null;
	rightPopup = false;

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
	setDimensions(width: number, height: number) {
		if (this.width === width && this.height === height) return;
		this.width = width;
		this.height = height;
		this.update('');
	}
	receive(message: string) {
		throw new Error(`This room is not designed to receive messages`);
	}
	send(msg: string) {
		const id = this.id === 'lobby' ? '' : this.id;
		PS.send(id + '|' + msg);
	}
	destroy() {
		if (this.connected) {
			this.send('/leave');
			this.connected = false;
		}
	}
}

class PlaceholderRoom extends PSRoom {
	queue = [] as string[];
	readonly classType: 'placeholder' = 'placeholder';
	receive(message: string) {
		this.queue.push(message);
	}
}

/**********************************************************************
 * PS
 *********************************************************************/

type RoomType = {Model: typeof PSRoom, Component: any, title?: string};

/**
 * This model updates:
 * - when a room is joined or left
 * - changing which room is focused
 * - changing the width of the left room, in two-panel mode
 */
const PS = new class extends PSModel {
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
	 * Currently active left room.
	 *
	 * In two-panel mode, this will be the visible left panel.
	 *
	 * In one-panel mode, this is the visible room only if it is
	 * `PS.room`. Still tracked when not visible, so we know which
	 * panels to display if PS is resized to two-panel mode.
	 */
	rightRoom: PSRoom | null = null;
	/**
	 * The currently focused room. Should always be the topmost popup,
	 * or either `PS.leftRoom` or `PS.rightRoom`.
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
	 * check PS.leftRoomWidth === 0
	 */
	onePanelMode = false;
	/**
	 * 0 = only one panel visible.
	 * n.b. PS will only update if the left room width changes. Resizes
	 * that don't change the left room width will not trigger an update.
	 */
	leftRoomWidth = 0;
	mainmenu: MainMenuRoom = null!;

	/** Tracks whether or not to display the "Use arrow keys" hint */
	arrowKeysUsed = false;

	constructor() {
		super();

		this.addRoom({
			id: '' as RoomID,
			title: "Home",
			type: 'mainmenu',
		});

		this.addRoom({
			id: 'rooms' as RoomID,
			title: "Rooms",
			type: 'rooms',
		});

		this.updateLayout();
		window.addEventListener('resize', () => this.updateLayout());
	}

	lineParse(str: string): [string, ...string[]] {
		if (!str.startsWith('|')) {
			return ['', str];
		}
		const index = str.indexOf('|', 1);
		const cmd = str.slice(1, index);
		switch (cmd) {
		case 'html':
		case 'raw':
		case 'challstr':
		case '':
			return [cmd, str.slice(index + 1)];
		case 'c':
		case 'uhtml':
		case 'uhtmlchange':
			// three parts
			const index2a = str.indexOf('|', index + 1);
			return [cmd, str.slice(index + 1, index2a), str.slice(index2a + 1)];
		case 'c:':
			// four parts
			const index2b = str.indexOf('|', index + 1);
			const index3b = str.indexOf('|', index2b + 1);
			return [cmd, str.slice(index + 1, index2b), str.slice(index2b + 1, index3b), str.slice(index3b + 1)];
		}
		return str.slice(1).split('|') as [string, ...string[]];
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
	updateLayout() {
		const leftRoomWidth = this.calculateLeftRoomWidth();
		if (this.leftRoomWidth !== leftRoomWidth) {
			this.leftRoomWidth = leftRoomWidth;
			this.update(true);
		}
	}
	update(layoutAlreadyUpdated?: boolean) {
		if (!layoutAlreadyUpdated) this.updateLayout();
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
		for (const line of msg.split('\n')) {
			if (line.startsWith('|init|')) {
				room = PS.rooms[roomid2];
				const type = line.slice(6);
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
			}
			if ((line + '|').startsWith('|deinit|')) {
				room = PS.rooms[roomid2];
				if (room) {
					room.connected = false;
					this.removeRoom(room);
				}
				this.update();
				continue;
			}
			if (room) room.receive(line);
		}
		if (room) room.update(null);
	}
	send(fullMsg: string) {
		const pipeIndex = fullMsg.indexOf('|');
		const roomid = fullMsg.slice(0, pipeIndex) as RoomID;
		const msg = fullMsg.slice(pipeIndex + 1);
		console.log('\u25b6\ufe0f ' + (roomid ? '[' + roomid + '] ' : '') + '%c' + msg, "color: #776677");
		this.connection!.send(fullMsg);
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
			case 'options': case 'volume': case 'teamdropdown':
				options.type = options.id;
				break;
			case 'battle-': case 'user-': case 'team-':
				options.type = options.id.slice(0, hyphenIndex);
				break;
			case 'view-':
				options.type = 'html';
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
				options.location = 'semimodal-popup';
				break;
			}
		}

		const roomType = this.roomTypes[options.type];
		if (roomType && roomType.title) options.title = roomType.title;
		const Model = roomType ? roomType.Model : PlaceholderRoom;
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
			const newRoom = new roomType.Model(options);
			this.rooms[roomid] = newRoom;
			if (this.leftRoom === room) this.leftRoom = newRoom;
			if (this.rightRoom === room) this.rightRoom = newRoom;
			if (this.activePanel === room) this.activePanel = newRoom;
			if (this.room === room) this.room = newRoom;
			if (roomid === '') this.mainmenu = newRoom as MainMenuRoom;

			if (options.queue) {
				for (const line of options.queue) {
					room.receive(line);
				}
			}
			updated = true;
		}
		if (updated) this.update();
	}
	focusRoom(roomid: RoomID) {
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
		this.update();
		if (this.room.onParentEvent) this.room.onParentEvent('focus', undefined);
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
	addRoom(options: RoomOptions, noFocus?: boolean) {
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
			if (!noFocus) this.focusRoom(options.id);
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
			for (const line of options.queue) {
				room.receive(line);
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
		this.addRoom({id: roomid, side}, noFocus);
		this.update();
	}
	leave(roomid: RoomID) {
		const room = PS.rooms[roomid];
		if (room) this.removeRoom(room);
	}
};
