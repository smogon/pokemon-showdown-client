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

const PSPrefsDefaults = {} as {[key: string]: any};

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
	storage = {} as {[k: string]: any};
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
		} catch (e) {}
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
	/** In packed format */
	team: string;
	folder: string;
	iconCache: string;
}

class PSTeams extends PSModel {
	list = [] as Team[];
	constructor() {
		super();
		try {
			this.unpackAll(localStorage.getItem('showdown_teams'));
		} catch (e) {}
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
	unpackLine(line: string) {
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
			team: line.slice(pipeIndex + 1),
			folder: line.slice(bracketIndex + 1, slashIndex > 0 ? slashIndex : bracketIndex + 1),
			iconCache: '',
		} as Team;
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
}

/**********************************************************************
 * Server
 *********************************************************************/

class PSServer {
	id = 'showdown';
	host = 'sim2.psim.us';
	port = 8000;
	altport = 80;
	registered = true;
	prefix = '/showdown';
	protocol: 'http' | 'https' = 'https';
}

/**********************************************************************
 * Rooms
 *********************************************************************/

type PSRoomSide = 'left' | 'right' | 'popup';

interface RoomOptions {
	id: RoomID;
	title?: string;
	type?: string;
	side?: PSRoomSide | null;
	/** Handled after initialization, outside of the constructor */
	queue?: string[];
	parentElem?: HTMLElement,
	connected?: boolean,
};

class PSRoom extends PSStreamModel<string | null> implements RoomOptions {
	id: RoomID;
	title = "";
	type = '';
	notifying: '' | ' notifying' | ' subtle-notifying' = '';
	readonly classType: string = '';
	side: PSRoomSide = 'left';
	closable = true;
	/**
	 * Whether the room is connected to the server. This mostly tracks
	 * "should we send /leave if the user closes the room?"
	 *
	 * In particular, this is `true` after sending `/join`, and `false`
	 * after sending `/leave`, even before the server responds.
	 */
	connected = false;
	constructor(options: RoomOptions) {
		super();
		this.id = options.id;
		if (options.title) this.title = options.title;
		if (!this.title) this.title = this.id;
		if (options.type) this.type = options.type;
		if (options.side) this.side = options.side;
		if (options.connected) this.connected = true;
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

type RoomType = {Model: typeof PSRoom, Component: typeof PSRoomPanel};

const PS = new class extends PSModel {
	prefs = new PSPrefs();
	teams = new PSTeams();
	user = new PSUser();
	server = new PSServer();
	connection: PSConnection | null = null;
	connected = false;

	router: PSRouter = null!;

	rooms = {} as {[roomid: string]: PSRoom | undefined};
	roomTypes = {} as {
		[type: string]: RoomType | undefined,
	};
	/** List of rooms on the left side of the top tabbar */
	leftRoomList = [] as RoomID[];
	/** List of rooms on the right side of the top tabbar */
	rightRoomList = [] as RoomID[];
	/** Currently active popups, in stack order (bottom to top) */
	popups = [] as RoomID[];

	/**
	 * Currently active left room.
	 *
	 * In two-panel mode, this will be the visible left panel.
	 *
	 * In one-panel mode, this is the visible room only if
	 * `PS.rightRoomFocused` is `false`. Still tracked when not visible,
	 * so we know which panels to display if PS is resized to allow for
	 * two panels.
	 */
	leftRoom: PSRoom = null!;
	/**
	 * Currently active left room.
	 *
	 * In two-panel mode, this will be the visible left panel.
	 *
	 * In one-panel mode, this is the visible room only if
	 * `PS.rightRoomFocused` is `true`. Still tracked when not visible,
	 * so we know which panels to display if PS is resized to allow for
	 * two panels.
	 */
	rightRoom: PSRoom | null = null;
	/**
	 * In one-panel mode, determines whether the left or right panel is
	 * visible.
	 *
	 * Also determines which room receives keyboard shortcuts.
	 *
	 * Clicking on a panel will focus it, in two-panel mode.
	 */
	rightRoomFocused = false;
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
	mainmenu: PSRoom = null!;

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
						type: type,
						connected: true,
					});
					room = PS.rooms[roomid2];
				} else {
					room.type = type;
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
			return room === (this.rightRoomFocused ? this.rightRoom : this.leftRoom);
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
			switch (options.id) {
			case 'teambuilder': case 'ladder': case 'battles': case 'rooms':
			case 'options': case 'volume':
				options.type = options.id;
				break;
			default:
				if (options.id.startsWith('battle-')) {
					options.type = 'battle';
				} else if (options.id.startsWith('view-')) {
					options.type = 'html';
				} else {
					options.type = 'chat';
				}
			}
		}

		if (!options.side) {
			switch (options.type) {
			case 'rooms':
			case 'chat':
				options.side = 'right';
				break;
			case 'options':
			case 'volume':
				options.side = 'popup';
				break;
			}
		}

		const roomType = this.roomTypes[options.type];
		const Model = roomType ? roomType.Model : PlaceholderRoom;
		return new Model(options);
	}
	updateRoomTypes() {
		for (const roomid in this.rooms) {
			const room = this.rooms[roomid]!;
			if (room.type === room.classType) continue;
			const roomType = this.roomTypes[room.type];
			if (!roomType) continue;

			const options: RoomOptions = room;
			const newRoom = new roomType.Model(options);
			this.rooms[roomid] = newRoom;
			if (this.leftRoom === room) this.leftRoom = newRoom;
			if (this.rightRoom === room) this.rightRoom = newRoom;
			if (roomid === '') this.mainmenu = newRoom;

			if (options.queue) {
				for (const line of options.queue) {
					room.receive(line);
				}
			}
		}
	}
	focusRoom(roomid: RoomID) {
		if (this.leftRoomList.includes(roomid)) {
			this.leftRoom = this.rooms[roomid]!;
			this.rightRoomFocused = false;
		}
		if (this.rightRoomList.includes(roomid)) {
			this.rightRoom = this.rooms[roomid]!;
			this.rightRoomFocused = true;
		}
	}
	addRoom(options: RoomOptions) {
		if (this.rooms[options.id]) {
			this.focusRoom(options.id);
			return;
		}
		const room = this.createRoom(options);
		this.rooms[room.id] = room;
		switch (room.side) {
		case 'left':
			this.leftRoomList.push(room.id);
			this.leftRoom = room;
			break;
		case 'right':
			this.rightRoomList.push(room.id);
			if (this.rightRoomList[this.rightRoomList.length - 2] === 'rooms') {
				this.rightRoomList.splice(-2, 1);
				this.rightRoomList.push('rooms' as RoomID);
			}
			this.rightRoom = room;
			break;
		case 'popup':
			this.popups.push(room.id);
			break;
		}
		if (options.queue) {
			for (const line of options.queue) {
				room.receive(line);
			}
		}
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
		}

		const rightRoomIndex = PS.rightRoomList.indexOf(room.id);
		if (rightRoomIndex >= 0) {
			PS.rightRoomList.splice(rightRoomIndex, 1);
		}
		if (PS.rightRoom === room) {
			let newRightRoomid = PS.rightRoomList[rightRoomIndex] || PS.rightRoomList[rightRoomIndex - 1];
			PS.rightRoom = newRightRoomid ? PS.rooms[newRightRoomid]! : null;
		}
		this.update();
	}
	closePopup() {
		if (!this.popups.length) return;
		const roomid = this.popups.pop()!;
		this.leave(roomid);
		this.update();
	}
	join(roomid: RoomID, side?: PSRoomSide | null) {
		this.addRoom({id: roomid, side});
		this.update();
	}
	leave(roomid: RoomID) {
		const room = PS.rooms[roomid];
		if (room) this.removeRoom(room);
	}
};
