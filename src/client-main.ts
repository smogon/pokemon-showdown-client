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
	/** 0 = no left room */
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
	}
};
