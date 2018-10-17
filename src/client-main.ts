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
const PSPrefs = new class extends PSModel {
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

	storage = {} as {[k: string]: any};
	readonly origin = 'https://play.pokemonshowdown.com';
	constructor() {
		super();

		for (const key in this) {
			const value = (this as any)[key];
			if (key === 'storage' || key === 'subscriptions' || key === 'origin') continue;
			if (typeof value === 'function') continue;
			PSPrefsDefaults[key] = value;
		}

		// set up local loading
		try {
			if (window.localStorage) {
				this.save = () => {
					localStorage.setItem('showdown_prefs', JSON.stringify(PSPrefs.storage));
				};
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
		// noop by default
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

interface Team {
	name: string;
	format: ID;
	/** In packed format */
	team: string;
	folder: string;
	iconCache: string;
}

const PSTeams = new class extends PSModel {
	list = [] as Team[];
	save() {
		// noop by default
	}
}

class PSRoom {
	id: RoomID;
	title: string;
	type = '';
	notifying: '' | ' notifying' | ' subtle-notifying' = '';
	closable = true;
	constructor(roomid: RoomID, title: string) {
		this.id = roomid;
		this.title = title;
	}
}

const PS = new class extends PSModel {
	rooms = {} as {[roomid: string]: PSRoom};
	leftRoomList = [] as RoomID[];
	rightRoomList = [] as RoomID[];
	leftRoom: PSRoom | null = null;
	rightRoom: PSRoom | null = null;
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
	 * 0 = no left room.
	 * n.b. PS will only update if the left room width changes. Resizes
	 * that don't change the left room width will not trigger an update.
	 */
	leftRoomWidth = 0;
	constructor() {
		super();

		const mainmenu = new PSRoom('' as RoomID, "Home");
		mainmenu.type = 'mainmenu';
		this.rooms[''] = this.leftRoom = mainmenu;
		this.leftRoomList.push('' as RoomID);

		const rooms = new PSRoom('rooms' as RoomID, "Rooms");
		rooms.type = 'rooms';
		this.rooms['rooms'] = this.rightRoom = rooms;
		this.rightRoomList.push('rooms' as RoomID);

		this.updateLayout();
		window.addEventListener('resize', () => this.updateLayout);
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
			return {
				minWidth: 320,
				width: 640,
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

		let excess = available - left.width + right.width;
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
};
