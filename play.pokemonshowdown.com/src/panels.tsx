/**
 * Panels
 *
 * Main view - sets up the frame, and the generic panels.
 *
 * Also sets up most global event listeners.
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

import preact from "../js/lib/preact";
import type { Pokemon, ServerPokemon } from "./battle";
import { Dex, toID } from "./battle-dex";
import type { Args } from "./battle-text-parser";
import { BattleTooltips } from "./battle-tooltips";
import { Net } from "./client-connection";
import type { PSModel, PSStreamModel, PSSubscription } from "./client-core";
import {
	NARROW_MODE_HEADER_WIDTH, PS, type PSRoom, type PSRoomFocusOptions, type RoomID, VERTICAL_HEADER_WIDTH,
} from "./client-main";
import type { ChatRoom } from "./panel-chat";
import { PSHeader, PSMiniHeader } from "./panel-topbar";

export const EXTERNAL_REDIRECTS = /^(appeals?|rooms?suggestions?|suggestions?|adminrequests?|bugs?|bugreports?|rules?|faq|credits?|privacy|contact|dex|insecure)$/;

export class PSRouter {
	roomid = '' as RoomID;
	panelState = '';
	constructor() {
		const currentRoomid = location.pathname.slice(1);
		if (/^[a-z0-9-]*$/.test(currentRoomid)) {
			this.subscribeHistory();
		} else if (location.pathname.endsWith('.html')) {
			this.subscribeHash();
		}
	}
	extractRoomID(url: string | null) {
		if (!url) return null;
		if (url.startsWith(document.location.origin)) {
			url = url.slice(document.location.origin.length);
		} else {
			if (url.startsWith('http://')) {
				url = url.slice(7);
			} else if (url.startsWith('https://')) {
				url = url.slice(8);
			}
			if (url.startsWith('psim.us/t/')) {
				url = `viewteam-${url.slice(10)}`;
			}
			if (url.startsWith('teams.pokemonshowdown.com/view/') && /[0-9]/.test(url.charAt(31))) {
				url = `viewteam-${url.slice(31)}`;
			}
			if (url.startsWith('psim.us/r/')) {
				url = `battle-${url.slice(10)}`;
			}
			if (url.startsWith('replay.pokemonshowdown.com/') && /[a-z]/.test(url.charAt(27))) {
				url = `battle-${url.slice(27)}`;
			}
			if (url.startsWith(document.location.host)) {
				url = url.slice(document.location.host.length);
			} else if (PS.server.id === 'showdown' && url.startsWith('play.pokemonshowdown.com')) {
				url = url.slice(24);
			} else if (PS.server.id === 'showdown' && url.startsWith('psim.us')) {
				url = url.slice(7);
			} else if (url.startsWith('replay.pokemonshowdown.com')) {
				url = url.slice(26).replace('/', '/battle-');
			}
		}
		if (url.startsWith('/')) url = url.slice(1);
		if (url === '.') url = '';

		// (exaggerated sigh) PLEASE STOP PUTTING RANDOM CHARACTERS IN ROOM IDS
		if (!/^[a-z0-9-]*$/.test(url) && !url.startsWith('view-')) return null;

		if (EXTERNAL_REDIRECTS.test(url)) return null;

		if (url.startsWith('view-teams-view-')) {
			const teamid = url.slice(16);
			url = `viewteam-${teamid}`;
		}
		return url as RoomID;
	}
	/** true: roomid changed, false: panelState changed, null: neither changed */
	updatePanelState(): { roomid: RoomID, changed: boolean | null, newTitle: string } {
		let room = PS.room;
		// some popups don't have URLs and don't generate history
		// there's definitely a better way to do this but I'm lazy
		if (room.noURL) room = PS.rooms[PS.popups[PS.popups.length - 2]] || PS.panel;
		if (room.noURL) room = PS.panel;

		// don't generate history when focusing things on things visible on the home screen
		if (room.id === 'news' && room.location === 'mini-window') room = PS.mainmenu;
		if (room.id === '' && PS.leftPanelWidth && PS.rightPanel) {
			room = PS.rightPanel;
		}
		if (room.id === 'rooms' && PS.leftPanelWidth) room = PS.leftPanel;

		let roomid = room.id;
		const panelState = (PS.leftPanelWidth && room === PS.panel ?
			PS.leftPanel.id + '..' + PS.rightPanel!.id :
			room.id);
		const newTitle = roomid === '' ? 'Showdown!' : `${room.title} - Showdown!`;
		let changed: boolean | null = (roomid !== this.roomid);

		this.roomid = roomid;
		if (this.panelState === panelState) changed = null;
		this.panelState = panelState;
		return { roomid, changed, newTitle };
	}
	subscribeHash() {
		if (location.hash) {
			const currentRoomid = location.hash.slice(1);
			if (/^[a-z0-9-]+$/.test(currentRoomid)) {
				PS.join(currentRoomid as RoomID);
			}
		}
		{
			const { newTitle } = this.updatePanelState();
			document.title = newTitle;
		}
		PS.subscribe(() => {
			const { roomid, changed, newTitle } = this.updatePanelState();
			if (changed) location.hash = roomid ? `#${roomid}` : '';
			// n.b. must be done after changing hash, so history entry has the old title
			document.title = newTitle;
		});
		window.addEventListener('hashchange', e => {
			// really dumb hack, but it's not like back/forward has ever been very reliable
			if (PS.popups.length && PS.rooms[PS.popups[PS.popups.length - 1]]?.noURL) return;
			const possibleRoomid = location.hash.slice(1);
			let currentRoomid: RoomID | null = null;
			if (/^[a-z0-9-]*$/.test(possibleRoomid)) {
				currentRoomid = possibleRoomid as RoomID;
			}
			if (currentRoomid !== null) {
				if (currentRoomid === this.roomid) return;
				this.roomid = currentRoomid;
				PS.join(currentRoomid);
			}
		});
	}
	subscribeHistory() {
		const currentRoomid = location.pathname.slice(1);
		if (/^[a-z0-9-]+$/.test(currentRoomid)) {
			if (currentRoomid !== 'preactalpha' && currentRoomid !== 'preactbeta' && currentRoomid !== 'beta') {
				PS.join(currentRoomid as RoomID);
			}
		}
		if (!window.history) return;
		{
			const { roomid, newTitle } = this.updatePanelState();
			history.replaceState(this.panelState, '', `/${roomid}`);
			document.title = newTitle;
		}
		PS.subscribe(() => {
			const { roomid, changed, newTitle } = this.updatePanelState();
			if (changed) {
				history.pushState(this.panelState, '', `/${roomid}`);
			} else if (changed !== null) {
				history.replaceState(this.panelState, '', `/${roomid}`);
			}
			// n.b. must be done after changing hash, so history entry has the old title
			document.title = newTitle;
		});
		window.addEventListener('popstate', e => {
			const possibleRoomid = location.pathname.slice(1);
			let roomid: RoomID | null = null;
			if (/^[a-z0-9-]*$/.test(possibleRoomid)) {
				roomid = possibleRoomid as RoomID;
			}
			if (typeof e.state === 'string') {
				const [leftRoomid, rightRoomid] = e.state.split('..') as RoomID[];
				if (rightRoomid) {
					PS.addRoom({ id: leftRoomid, location: 'left', autofocus: false });
					PS.addRoom({ id: rightRoomid, location: 'right', autofocus: false });
					PS.leftPanel = PS.rooms[leftRoomid] || PS.leftPanel;
					PS.rightPanel = PS.rooms[rightRoomid] || PS.rightPanel;
				}
			}
			if (roomid !== null) {
				this.roomid = roomid;
				PS.join(roomid);
			}
		});
	}
}
PS.router = new PSRouter();

export class PSRoomPanel<T extends PSRoom = PSRoom> extends preact.Component<{ room: T }> {
	subscriptions: PSSubscription[] = [];
	wasVisible = true; // remember, shouldComponentUpdate isn't called on first render
	subscribeTo<M>(
		model: PSModel<M> | PSStreamModel<M>, callback: (value: M) => void = () => { this.forceUpdate(); }
	): PSSubscription {
		const subscription = model.subscribe(callback);
		this.subscriptions.push(subscription);
		return subscription;
	}
	override componentDidMount() {
		this.props.room.onRequestFocus = options => this.focus(options);
		this.subscriptions.push(this.props.room.subscribe(args => {
			if (!args) this.forceUpdate();
			else this.receiveLine(args);
		}));
		// just for debugging, please don't depend on this
		(this.props.room as any).__view = this;
		this.componentDidUpdate();
	}
	override shouldComponentUpdate() {
		const wasVisible = this.wasVisible;
		const visible = PS.isVisible(this.props.room);
		this.wasVisible = visible;
		return visible || wasVisible;
	}
	justUpdatedDimensions = false;
	updateDimensions() {
		const justUpdated = this.justUpdatedDimensions;
		this.justUpdatedDimensions = false;

		const room = this.props.room;
		const newWidth = this.base!.offsetWidth;
		const newHeight = this.base!.offsetHeight;
		if (room.width === newWidth && room.height === newHeight) {
			return;
		}

		room.width = newWidth;
		room.height = newHeight;

		if (justUpdated) return; // should never happen; safeguard against infinite loops
		this.justUpdatedDimensions = true;
		this.forceUpdate();
	}
	override componentDidUpdate() {
		const room = this.props.room;
		const currentlyHidden = !room.width && room.parentElem && ['popup', 'modal-popup'].includes(room.location);
		this.updateDimensions();
		if (currentlyHidden) return;
		if (room.focusNextUpdate) {
			const focusOptions = room.focusNextUpdate === true ? undefined : room.focusNextUpdate;
			room.focusNextUpdate = false;
			this.focus(focusOptions);
		}
	}
	override componentWillUnmount() {
		this.props.room.onRequestFocus = null;
		for (const subscription of this.subscriptions) {
			subscription.unsubscribe();
		}
		this.subscriptions = [];
	}
	close() {
		PS.leave(this.props.room.id);
	}
	componentDidCatch(err: Error) {
		this.props.room.caughtError = err.stack || err.message;
		this.setState({});
	}
	receiveLine(args: Args) {}
	/**
	 * PS has "fake select menus", buttons that act like <select> dropdowns.
	 * This function is used by the popups they open to change the button
	 * values.
	 */
	chooseParentValue(value: string) {
		const dropdownButton = this.props.room.parentElem as HTMLButtonElement;
		dropdownButton.value = value;
		if (dropdownButton.getAttribute('data-href') !== '/formatdropdown') {
			// button was made by |html| rather than <FormatDropdown>
			dropdownButton.innerText = value;
		}
		const changeEvent = new Event('change');
		dropdownButton.dispatchEvent(changeEvent);
		PS.closePopup();
	}
	focus(options?: PSRoomFocusOptions) {
		if (!options?.preventScroll && !PS.isPopup(this.props.room)) PSView.scrollToRoom();
		if (PSView.hasTapped) return;

		const autofocus = this.base?.querySelector<HTMLElement>('.autofocus');
		PSView.politeFocus(autofocus);
		(autofocus as HTMLInputElement)?.select?.();
	}
	override render() {
		return <PSPanelWrapper room={this.props.room}>
			<div class="mainmessage"><p>Loading...</p></div>
		</PSPanelWrapper>;
	}
}

export function PSPanelWrapper(props: {
	room: PSRoom, children: preact.ComponentChildren,
	focusClick?: boolean,
	/**
	 * * `true` = overflow: visible
	 * * `false` = overflow: auto (default)
	 * * `"hidden"` = overflow: hidden
	 *
	 * For panels that manually manage their layout (usually with scrolling subareas)
	 * rather than having a single scrollable area
	 */
	noScroll?: boolean | 'hidden',
	width?: number | 'auto',
	/**
	 * on a mini-window, gives it `height: auto` instead of `height: 500px`
	 * on a popup, makes it fill 90% of the screen's height/width
	 */
	fullSize?: boolean,
	onDragEnter?: (ev: DragEvent) => void,
}) {
	const room = props.room;
	const contents = room.caughtError ?
		<div class="broadcast broadcast-red"><pre>{room.caughtError}</pre></div> :
		props.children;
	if (room.location === 'mini-window') {
		const size = props.fullSize ? ' mini-window-flex' : '';
		const scrollable = !props.noScroll && !props.fullSize ? ' scrollable' : '';
		return <div
			id={`room-${room.id}`}
			class={`mini-window-contents tiny-layout ps-room-light${scrollable}${size}`}
			onClick={props.focusClick ? PSView.focusIfNoSelection : undefined} onDragEnter={props.onDragEnter}
		>
			{contents}
		</div>;
	}
	if (PS.isPopup(room)) {
		const style = PSView.getPopupStyle(room, props.width, props.fullSize);
		return <div class="ps-popup" id={`room-${room.id}`} style={style} onDragEnter={props.onDragEnter}>
			{contents}
		</div>;
	}
	const style = PSView.posStyle(room) as any;
	if (props.noScroll === 'hidden') style.overflow = 'hidden';
	const tinyLayout = room.width < 620 ? ' tiny-layout' : '';
	return <div
		class={`ps-room${room.id === '' ? '' : ' ps-room-light'}${!props.noScroll ? ' scrollable' : ''}${tinyLayout}`}
		id={`room-${room.id}`} role="tabpanel" aria-labelledby={`roomtab-${room.id}`}
		style={style} onClick={props.focusClick ? PSView.focusIfNoSelection : undefined} onDragEnter={props.onDragEnter}
	>
		{contents}
	</div>;
}

export class PSPanelErrorBoundary extends preact.Component<{ room: PSRoom }> {
	componentDidCatch(err: Error) {
		this.props.room.caughtError = err.stack || err.message;
		this.setState({});
	}
	override render() {
		const room = this.props.room;
		const RoomType = PS.roomTypes[room.type];
		const Panel = RoomType && !room.isPlaceholder && !room.caughtError ? RoomType : PSRoomPanel;
		return <Panel room={room} />;
	}
}

export class PSView extends preact.Component {
	static readonly isIOS = [
		'iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod',
	].includes(navigator.platform);
	static readonly isChrome = navigator.userAgent.includes(' Chrome/');
	static readonly isSafari = !this.isChrome && navigator.userAgent.includes(' Safari/');
	static readonly isFirefox = navigator.userAgent.includes(' Firefox/');
	static readonly isMac = navigator.platform?.startsWith('Mac');
	static readonly isAndroid = /Mobi|Android/i.test(navigator.userAgent) && !this.isIOS;
	static dragend: ((ev: DragEvent) => void) | null = null;
	/** was the last click event a tap? heristic for mobile/desktop */
	static hasTapped = false;
	/** mode where the tabbar is scrolled rather than always being there */
	static narrowMode = false;
	static cssScrollSnap = false;
	static useContentEditable = !this.isIOS && !this.isAndroid;
	static verticalHeaderWidth = VERTICAL_HEADER_WIDTH;
	static scrollFrame: HTMLDivElement | null = null;
	static scrollListeners: (() => void)[] = [];
	static snapTimeout: ReturnType<typeof setTimeout> | null = null;
	static snapFrame: number | null = null;
	static snapStart: {
		x: number, y: number,
		scrollX: number,
		startTime: number, lastX: number, lastY: number, lastTime: number,
		dragging: boolean,
		target: EventTarget | null,
	} | null = null;
	static snapTarget: number | null = null;
	static snapLastScrollX = 0;
	static snapLastScrollTime = 0;
	static snapVelocityX = 0;
	static snapAnimating = false;
	static snapRestingX = NARROW_MODE_HEADER_WIDTH;
	static debugMenu: 'snap' | 'panels' | null = null;
	commandPreviewTextbox: HTMLElement | null = null;
	commandPreviewPlaceholder: string | null = null;
	static setDebug(mode: 'snap' | 'panels' | null) {
		this.debugMenu = mode;
		PS.update();
		if (mode === null) {
			const elem = document.getElementById('ps-debug-menu');
			if (elem) elem.style.display = 'none';
			return;
		}
		setTimeout(() => this.updateSnapDebug(`command ${this.debugMenu || 'off'}`), 1);
	}
	override componentDidMount() {
		PSView.scrollFrame = this.base!.children[0] as HTMLDivElement | null;
		PSView.scrollFrame?.addEventListener('scroll', PSView.handleFrameScroll);
		if (PSView.isFirefox) {
			// Firefox bug: dvh calculated incorrectly
			document.documentElement.style.height = '100%';
		}
		PSView.updateScrollSnap();
	}
	override componentWillUnmount() {
		PSView.scrollFrame?.removeEventListener('scroll', PSView.handleFrameScroll);
		PSView.scrollFrame = null;
	}
	static addScrollListener(listener: () => void) {
		if (!this.scrollListeners.includes(listener)) this.scrollListeners.push(listener);
	}
	static removeScrollListener(listener: () => void) {
		const index = this.scrollListeners.indexOf(listener);
		if (index >= 0) this.scrollListeners.splice(index, 1);
	}
	static notifyScrollListeners() {
		for (const listener of this.scrollListeners) listener();
	}
	static handleFrameScroll = () => {
		PSView.handleSnapScroll();
		PSView.notifyScrollListeners();
	};
	static useCSSScrollSnap() {
		return this.narrowMode && this.cssScrollSnap;
	}
	static useScrollFrame() {
		return this.narrowMode && !this.cssScrollSnap;
	}
	static getScrollX() {
		return this.useScrollFrame() ? this.scrollFrame?.scrollLeft || 0 : window.scrollX;
	}
	static setScrollX(x: number) {
		if (this.useScrollFrame()) {
			if (!this.scrollFrame) return;
			this.scrollFrame.scrollLeft = x;
			this.notifyScrollListeners();
		} else {
			window.scrollTo(x, 0);
		}
	}
	static updateScrollSnap() {
		document.documentElement.classList.toggle('scroll-frame-enabled', this.useScrollFrame());
		if (this.scrollFrame) {
			if (this.useScrollFrame()) {
				this.scrollFrame.scrollLeft = Math.max(this.scrollFrame.scrollLeft, window.scrollX);
				if (window.scrollX) window.scrollTo(0, window.scrollY);
			} else if (this.scrollFrame.scrollLeft) {
				this.scrollFrame.scrollLeft = 0;
			}
		}
		if (this.useCSSScrollSnap() && !this.isTextboxFocused() && !this.isViewportZoomed()) {
			document.documentElement.classList.add('scroll-snap-enabled');
		} else {
			document.documentElement.classList.remove('scroll-snap-enabled');
		}
		if (!this.shouldJSSnap()) this.clearSnap();
		this.updateSnapDebug('mode');
	}
	static shouldJSSnap() {
		return this.useScrollFrame() && !!this.scrollFrame && !this.isViewportZoomed();
	}
	static prefersReducedMotion() {
		return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
	}
	static isViewportZoomed() {
		return (window.visualViewport?.scale || 1) > 1.05;
	}
	static handleVisualViewportChange() {
		if (this.narrowMode) this.updateScrollSnap();
	}
	static isTextboxElement(elem: Element | null): elem is HTMLElement {
		if (!(elem instanceof HTMLElement)) return false;
		if (elem.isContentEditable) return true;
		if (elem instanceof HTMLTextAreaElement) return true;
		if (!(elem instanceof HTMLInputElement)) return false;

		const nonTextTypes = ['button', 'checkbox', 'color', 'file', 'hidden', 'image', 'radio', 'range', 'reset', 'submit'];
		return !nonTextTypes.includes(elem.type);
	}
	static isTextboxFocused() {
		return this.isTextboxElement(document.activeElement);
	}
	static isRoomTextboxFocused() {
		if (!this.isTextboxElement(document.activeElement)) return false;
		const room = PS.getRoom(document.activeElement);
		return !!room && !PS.isPopup(room);
	}
	/**
	 * "Polite" focus, without scrolling into view.
	 *
	 * Use this for convenience focusing so keypresses go to convenient places,
	 * such as when clicking on a tab. For primary focusing, such as any
	 * keyboard-initiated focus, or "Create folder" flows where there's nothing
	 * to do except type something in, directly call `elem.focus()`.
	 *
	 * Note that convenience focusing should not happen at all (and this function
	 * shouldn't be called) if initiated by a tap, because that brings up a
	 * mobile keyboard which covers up a lot of the screen.
	 */
	static politeFocus(elem: HTMLElement | null | undefined, polite = true) {
		try {
			elem?.focus({ preventScroll: polite });
		} catch {
			elem?.focus();
		}
	}
	static jumpToRoom() {
		if (this.getScrollX() < NARROW_MODE_HEADER_WIDTH) this.setScrollX(NARROW_MODE_HEADER_WIDTH);
	}
	static handleActiveElementChange() {
		setTimeout(() => {
			this.updateScrollSnap();
			// Safari iOS does an annoying thing of centering the textbox. there are
			// ways to stop it but they're pretty hacky and not exactly what I'm looking for.
			// see https://github.com/adobe/react-spectrum/blob/main/packages/react-aria/src/overlays/usePreventScroll.ts
			// and https://gist.github.com/kiding/72721a0553fa93198ae2bb6eefaa3299
			// Chrome also centers textboxes, but only if the textbox would be covered up by a keyboard
			if (this.narrowMode && this.isRoomTextboxFocused() && !this.isViewportZoomed()) {
				this.jumpToRoom();
				requestAnimationFrame(() => {
					if (this.narrowMode && this.isRoomTextboxFocused() && !this.isViewportZoomed()) {
						this.jumpToRoom();
					}
					requestAnimationFrame(() => {
						if (this.narrowMode && this.isRoomTextboxFocused() && !this.isViewportZoomed()) {
							this.jumpToRoom();
						}
					});
				});
				return;
			}
			if (this.shouldJSSnap()) this.scheduleScrollSnap();
		}, 1);
	}
	static canScrollHorizontally(elem: HTMLElement, dx: number) {
		if (elem.scrollWidth <= elem.clientWidth + 1) return false;
		const style = getComputedStyle(elem);
		if (!/^(auto|scroll|overlay)$/i.test(style.overflowX)) return false;

		// dx > 0 means finger moved right; content would scroll left.
		if (dx > 0) return elem.scrollLeft > 0;
		return elem.scrollLeft < elem.scrollWidth - elem.clientWidth - 1;
	}
	static hasHorizontalScroller(target: EventTarget | null, dx: number) {
		let elem = target instanceof Element ? target : null;
		while (elem && elem !== document.documentElement) {
			if (elem instanceof HTMLElement && this.canScrollHorizontally(elem, dx)) return true;
			elem = elem.parentElement;
		}
		return false;
	}
	static canSnapHorizontally(scrollX: number, dx: number) {
		if (dx < 0) return scrollX < NARROW_MODE_HEADER_WIDTH - 1;
		if (dx > 0) return scrollX > 1;
		return true;
	}
	static clearSnap() {
		if (this.snapTimeout) {
			clearTimeout(this.snapTimeout);
			this.snapTimeout = null;
		}
		if (this.snapFrame !== null) {
			cancelAnimationFrame(this.snapFrame);
			this.snapFrame = null;
		}
		this.snapStart = null;
		this.snapTarget = null;
		this.snapAnimating = false;
	}
	static scheduleScrollSnap(delay = 120) {
		if (!this.shouldJSSnap()) return;
		if (this.snapTimeout) clearTimeout(this.snapTimeout);
		this.snapTimeout = setTimeout(() => this.settleSnap(), delay);
		this.updateSnapDebug('schedule scroll snap');
	}
	static choosePassiveSnapTarget() {
		const x = this.getScrollX();
		const roomX = NARROW_MODE_HEADER_WIDTH;
		if (this.snapRestingX <= 0) return x >= 30 ? roomX : 0;
		return x <= roomX - 30 ? 0 : roomX;
	}
	static chooseSnapTarget(x = this.getScrollX(), velocity = this.snapVelocityX) {
		const roomX = NARROW_MODE_HEADER_WIDTH;
		const naturalEndpoint = Math.max(0, Math.min(roomX, x + velocity * 260));
		return naturalEndpoint < roomX / 2 ? 0 : roomX;
	}
	static updateSnapDebug(event = '') {
		if (this.debugMenu !== 'snap' || this.cssScrollSnap || !this.narrowMode) {
			return;
		}
		const elem = document.getElementById('ps-debug-menu');
		if (!elem) return;

		const x = this.getScrollX();
		const roomX = NARROW_MODE_HEADER_WIDTH;
		const velocity = this.snapVelocityX;
		const velocityThreshold = (roomX / 2 - x) / 260;
		const naturalEndpoint = Math.max(0, Math.min(roomX, x + velocity * 260));
		const target = this.chooseSnapTarget(x, velocity);
		const passiveTarget = this.choosePassiveSnapTarget();
		const dragging = this.snapStart?.dragging ? 'yes' : this.snapStart ? 'pending' : 'no';
		const side = (pos: number) => pos <= 0 ? 'menu' : 'room';

		elem.style.display = 'block';
		elem.textContent = [
			`snap ${event}`,
			`x ${x.toFixed(1)} / ${roomX}`,
			`v ${velocity.toFixed(3)} px/ms (${(velocity * 1000).toFixed(0)} px/s)`,
			`target flips at v >= ${velocityThreshold.toFixed(3)} px/ms`,
			`projected ${naturalEndpoint.toFixed(1)} -> ${side(target)}`,
			`passive -> ${side(passiveTarget)}; resting ${side(this.snapRestingX)}`,
			`drag ${dragging}; anim ${this.snapAnimating ? 'yes' : 'no'}`,
			`zoom ${this.isViewportZoomed() ? 'yes' : 'no'}`,
		].join('\n');
	}
	static settleSnap(target = this.snapTarget) {
		if (!this.shouldJSSnap()) return;
		if (this.snapTimeout) {
			clearTimeout(this.snapTimeout);
			this.snapTimeout = null;
		}
		target = target ?? this.chooseSnapTarget();
		this.updateSnapDebug(`settle ${target <= 0 ? 'menu' : 'room'}`);
		this.snapTarget = null;
		const scrollX = this.getScrollX();
		if (target === NARROW_MODE_HEADER_WIDTH && scrollX >= target) {
			this.snapRestingX = target;
			this.updateSnapDebug('settled');
			return;
		}
		if (Math.abs(scrollX - target) < 2) {
			if (scrollX !== target) this.setScrollX(target);
			this.snapRestingX = target;
			this.updateSnapDebug('settled');
			return;
		}
		this.animateSnap(target);
	}
	static animateSnap(target: number, duration?: number) {
		if (this.snapFrame !== null) cancelAnimationFrame(this.snapFrame);

		const startX = this.getScrollX();
		const distance = target - startX;
		if (target === NARROW_MODE_HEADER_WIDTH && startX >= target) {
			this.snapAnimating = false;
			this.snapRestingX = target;
			this.updateSnapDebug('already past room');
			return;
		}
		if (this.prefersReducedMotion() || duration === 0) {
			this.setScrollX(target);
			this.snapAnimating = false;
			this.snapRestingX = target;
			this.updateSnapDebug('reduced motion');
			return;
		}
		const velocity = Math.abs(this.snapVelocityX);
		duration ??= Math.max(120, Math.min(260, 180 + Math.abs(distance) * 0.35 - velocity * 45));
		const startTime = performance.now();
		this.snapAnimating = true;
		this.updateSnapDebug('animate start');

		const animate = (now: number) => {
			if (!this.shouldJSSnap()) {
				this.clearSnap();
				return;
			}
			const progress = Math.max(0, Math.min(1, (now - startTime) / duration));
			const eased = 1 - (1 - progress) ** 3;
			this.setScrollX(startX + distance * eased);
			if (progress < 1) {
				this.snapFrame = requestAnimationFrame(animate);
			} else {
				this.snapFrame = null;
				this.snapAnimating = false;
				if (this.getScrollX() !== target) this.setScrollX(target);
				this.snapRestingX = target;
				this.updateSnapDebug('animate end');
			}
		};
		this.snapFrame = requestAnimationFrame(animate);
	}
	static startSnapGesture(x: number, y: number, target: EventTarget | null) {
		if (!this.shouldJSSnap()) return;
		this.clearSnap();
		const now = performance.now();
		this.snapStart = {
			x, y, scrollX: this.getScrollX(),
			startTime: now, lastX: x, lastY: y, lastTime: now,
			dragging: false, target,
		};
		this.snapTarget = null;
		this.snapLastScrollX = this.getScrollX();
		this.snapLastScrollTime = now;
		this.snapVelocityX = 0;
		this.updateSnapDebug('start');
	}
	static moveSnapGesture(x: number, y: number) {
		if (!this.shouldJSSnap() || !this.snapStart) return false;
		const start = this.snapStart;
		const now = performance.now();
		const dx = x - start.x;
		const dy = y - start.y;
		if (!start.dragging) {
			if (Math.abs(dx) > 8 && !this.canSnapHorizontally(start.scrollX, dx)) {
				this.snapStart = null;
				this.updateSnapDebug('wrong direction');
				return false;
			}
			if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx) * 1.15) {
				this.snapStart = null;
				return false;
			}
			if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy) * 1.15) return false;
			if (this.hasHorizontalScroller(start.target, dx)) {
				this.snapStart = null;
				this.updateSnapDebug('nested scroller');
				return false;
			}
			start.dragging = true;
			this.snapLastScrollTime = 0;
		}

		const dt = Math.max(now - start.lastTime, 1);
		this.snapVelocityX = -(x - start.lastX) / dt;
		start.lastX = x;
		start.lastY = y;
		start.lastTime = now;

		const roomX = NARROW_MODE_HEADER_WIDTH;
		const targetX = Math.max(0, Math.min(roomX, start.scrollX - dx * 1.45));
		this.setScrollX(targetX);
		this.updateSnapDebug('drag');
		return true;
	}
	static finishSnapGesture(x: number, y: number) {
		if (!this.shouldJSSnap() || !this.snapStart) return;
		const now = performance.now();
		const dx = x - this.snapStart.x;
		const dy = y - this.snapStart.y;
		const dragging = this.snapStart.dragging;
		const target = this.snapStart.target;
		const scrollX = this.snapStart.scrollX;
		let velocity = this.snapVelocityX;
		const fullGestureVelocity = -dx / Math.max(now - this.snapStart.startTime, 1);
		if (!Number.isFinite(velocity) || Math.abs(fullGestureVelocity) > Math.abs(velocity)) velocity = fullGestureVelocity;
		const isHorizontal = Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.05;
		const flicking = isHorizontal && Math.abs(velocity) > 0.35;
		this.snapStart = null;
		if (!dragging && Math.abs(dx) > 8 && !this.canSnapHorizontally(scrollX, dx)) {
			this.updateSnapDebug('wrong direction');
			return;
		}
		if (flicking && this.hasHorizontalScroller(target, dx)) return;
		if (dragging || flicking || (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.25)) {
			this.snapVelocityX = velocity;
			this.snapTarget = this.chooseSnapTarget(this.getScrollX(), velocity);
			this.updateSnapDebug(flicking ? 'flick' : 'release');
			this.settleSnap(this.snapTarget);
		}
	}
	static handleSnapPointerDown(ev: PointerEvent) {
		if (ev.pointerType === 'touch' && window.TouchEvent) return;
		if (ev.pointerType !== 'touch' && ev.pointerType !== 'pen') return;
		this.startSnapGesture(ev.clientX, ev.clientY, ev.target);
	}
	static handleSnapPointerMove(ev: PointerEvent) {
		if (ev.pointerType === 'touch' && window.TouchEvent) return;
		if (ev.pointerType !== 'touch' && ev.pointerType !== 'pen') return;
		if (this.moveSnapGesture(ev.clientX, ev.clientY)) ev.preventDefault();
	}
	static handleSnapPointerUp(ev: PointerEvent) {
		if (ev.pointerType === 'touch' && window.TouchEvent) return;
		if (ev.pointerType !== 'touch' && ev.pointerType !== 'pen') return;
		this.finishSnapGesture(ev.clientX, ev.clientY);
	}
	static handleSnapTouchStart(ev: TouchEvent) {
		const touch = ev.touches[0];
		if (touch) this.startSnapGesture(touch.clientX, touch.clientY, ev.target);
	}
	static handleSnapTouchMove(ev: TouchEvent) {
		const touch = ev.touches[0];
		if (touch && this.moveSnapGesture(touch.clientX, touch.clientY)) ev.preventDefault();
	}
	static handleSnapTouchEnd(ev: TouchEvent) {
		const touch = ev.changedTouches[0];
		if (touch) this.finishSnapGesture(touch.clientX, touch.clientY);
	}
	static handleSnapScroll() {
		if (!this.shouldJSSnap()) return;
		const now = performance.now();
		const x = this.getScrollX();
		if (this.snapLastScrollTime) {
			const dt = now - this.snapLastScrollTime;
			if (dt > 0) {
				const velocity = (x - this.snapLastScrollX) / dt;
				this.snapVelocityX = this.snapVelocityX * 0.7 + velocity * 0.3;
			}
		}
		this.snapLastScrollX = x;
		this.snapLastScrollTime = now;
		if (this.snapStart) return;
		if (this.snapAnimating) return;
		this.snapTarget = this.choosePassiveSnapTarget();
		this.updateSnapDebug('passive scroll');
		this.scheduleScrollSnap();
	}
	static focusPreview(room: PSRoom) {
		if (room !== PS.room) return '';

		const verticalBuf = this.verticalFocusPreview();
		if (verticalBuf) return verticalBuf;

		const isMiniRoom = PS.room.location === 'mini-window';
		const { rooms, index } = PS.horizontalNav();
		if (index === -1) return '';

		let buf = ' ';
		const leftRoom = PS.rooms[rooms[index - 1]];
		if (leftRoom) buf += `\u2190 ${leftRoom.title}`;
		buf += (PS.arrowKeysUsed || isMiniRoom ? " | " : " (use arrow keys) ");
		const rightRoom = PS.rooms[rooms[index + 1]];
		if (rightRoom) buf += `${rightRoom.title} \u2192`;
		return buf;
	}
	static verticalFocusPreview() {
		const { rooms, index } = PS.verticalNav();
		if (index === -1) return '';

		const upRoom = PS.rooms[rooms[index - 1]];
		let downRoom = PS.rooms[rooms[index + 1]];
		if (index === rooms.length - 2 && rooms[index + 1] === 'news') downRoom = undefined;
		if (!upRoom && !downRoom) return '';

		let buf = ' ';
		// const altLabel = PSMain.isMac ? '⌥' : 'ᴀʟᴛ';
		const altLabel = PSView.isMac ? 'ᴏᴘᴛ' : 'ᴀʟᴛ';
		if (upRoom) buf += `${altLabel}\u2191 ${upRoom.title}`;
		buf += " | ";
		if (downRoom) buf += `${altLabel}\u2193 ${downRoom.title}`;

		return buf;
	}
	getHoveredCommand(target: EventTarget | null): { elem: HTMLElement, cmd: string } | null {
		if (!(target instanceof Element)) return null;
		const elem = target.closest<HTMLButtonElement>(
			'[data-cmd], [data-sendraw], [data-cmdpreview], [data-href], button[name=send], button[name=parseCommand], button[name=joinRoom], button[name=closeRoom], a, .username'
		);
		if (!elem) return null;

		const cmd = elem.getAttribute('data-cmdpreview') ||
			elem.getAttribute('data-cmd') || elem.getAttribute('data-sendraw');
		if (cmd) return { elem, cmd };

		if (elem.name === 'parseCommand' || elem.name === 'send') {
			return { elem, cmd: elem.value };
		}
		if (elem.name === 'closeRoom') {
			return { elem, cmd: '/close ' + elem.value };
		}
		const href = (elem.getAttribute('data-href') || elem.getAttribute('href'))?.replace(/^\//, '');
		if (href && /^[a-z0-9-]+$/.test(href)) {
			if (EXTERNAL_REDIRECTS.test(href)) return null;
			if (href === 'login') return { elem, cmd: '/nick' };
			if (href === 'formatdropdown' || href === 'teamdropdown') return null;
			if (href.startsWith('challenge-')) return { elem, cmd: `/challenge ${href.slice(10)}` };
			return { elem, cmd: '/j ' + href };
		}
		if (elem.classList.contains('username')) {
			return { elem, cmd: '/user ' + toID(elem.getAttribute('data-user') || elem.innerText) };
		}
		return null;
	}
	getCommandPreviewTextbox(elem: HTMLElement): HTMLElement | null {
		const rooms = [PS.getRoom(elem), PS.room, PS.panel, PS.leftPanel, PS.rightPanel];
		for (const room of rooms) {
			if (!room || !(room.type === 'chat' || room.type === 'battle' || room.type === 'rooms')) {
				continue;
			}

			const roomElem = document.getElementById(`room-${room.id}`);
			if (!roomElem) continue;
			const textbox = room.type === 'rooms' ?
				roomElem.querySelector<HTMLElement>('input[name=roomsearch].textbox') :
				roomElem.querySelector<HTMLElement>('.chat-log-add .textbox');
			if (!textbox) continue;
			if (!textbox.getClientRects().length) continue;
			return textbox;
		}
		return null;
	}
	setCommandPreview(textbox: HTMLElement, cmd: string) {
		if (this.commandPreviewTextbox !== textbox) {
			this.clearCommandPreview();
			this.commandPreviewTextbox = textbox;
			this.commandPreviewPlaceholder = textbox.getAttribute('placeholder');
		}
		if (textbox.getAttribute('placeholder') !== cmd) textbox.setAttribute('placeholder', cmd);
	}
	clearCommandPreview() {
		if (!this.commandPreviewTextbox) return;
		if (this.commandPreviewPlaceholder === null) {
			this.commandPreviewTextbox.removeAttribute('placeholder');
		} else {
			this.commandPreviewTextbox.setAttribute('placeholder', this.commandPreviewPlaceholder);
		}
		this.commandPreviewTextbox = null;
		this.commandPreviewPlaceholder = null;
	}
	handleCommandPointerOver = (ev: PointerEvent) => {
		if (ev.pointerType === 'touch') return;
		const hover = this.getHoveredCommand(ev.target);
		if (!hover) return;
		const textbox = this.getCommandPreviewTextbox(hover.elem);
		if (!textbox) return;
		this.setCommandPreview(textbox, hover.cmd);
	};
	handleCommandPointerOut = (ev: PointerEvent) => {
		if (ev.pointerType === 'touch') return;
		const hover = this.getHoveredCommand(ev.target);
		if (!hover) return;
		const nextHover = this.getHoveredCommand(ev.relatedTarget);
		if (nextHover?.elem === hover.elem) return;
		this.clearCommandPreview();
	};
	constructor() {
		super();
		PS.subscribe(() => this.forceUpdate());

		if (PSView.isSafari) {
			// I don't want to prevent users from being able to zoom, but iOS Safari
			// auto-zooms when focusing textboxes (unless the font size is 16px),
			// and this apparently fixes it while still allowing zooming.
			document.querySelector('meta[name=viewport]')?.setAttribute('content', 'width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0');
		}

		window.onbeforeunload = (ev: Event) => {
			for (const room of Object.values(PS.rooms)) {
				const interruptClose = room!.interruptClose(true);
				if (typeof interruptClose === 'string') return interruptClose;
			}
			if (PS.prefs.refreshprompt) {
				return "Are you sure you want to leave?";
			}
			return null;
		};

		window.addEventListener('focus', () => {
			for (const room of [PS.leftPanel, PS.rightPanel]) {
				if (room && PS.isVisiblePanel(room)) {
					room.autoDismissNotifications();
				}
			}
		});

		window.addEventListener('submit', ev => {
			const elem = ev.target as HTMLFormElement | null;
			if (elem?.getAttribute('data-submitsend')) {
				const inputs = Net.formData(elem);
				let cmd = elem.getAttribute('data-submitsend')!;
				for (const [name, value] of Object.entries(inputs)) {
					cmd = cmd.replace(`{${name}}`, value === true ? 'on' : value === false ? 'off' : value);
				}
				cmd = cmd.replace(
					/\{([a-z0-9-]+)\}/g,
					(_, match) => elem.querySelector<HTMLButtonElement>(`button[name="${match}"]`)?.value || ''
				);
				const room = PS.getRoom(elem) || PS.mainmenu;
				room.sendDirect(cmd);

				ev.preventDefault();
				ev.stopImmediatePropagation();
			}
		});
		window.addEventListener('focusin', () => PSView.handleActiveElementChange());
		window.addEventListener('focusout', () => PSView.handleActiveElementChange());

		window.addEventListener('pointerdown', ev => {
			// can't be part of the click event because Safari pretends the pointer is a mouse
			PSView.hasTapped = ev.pointerType === 'touch' || ev.pointerType === 'pen';
			PSView.handleSnapPointerDown(ev);
		});
		window.addEventListener('pointermove', ev => PSView.handleSnapPointerMove(ev));
		window.addEventListener('pointerup', ev => PSView.handleSnapPointerUp(ev));
		window.addEventListener('pointercancel', ev => PSView.handleSnapPointerUp(ev));
		if (window.TouchEvent) {
			window.addEventListener('touchstart', ev => PSView.handleSnapTouchStart(ev), { passive: true });
			window.addEventListener('touchmove', ev => PSView.handleSnapTouchMove(ev), { passive: false });
			window.addEventListener('touchend', ev => PSView.handleSnapTouchEnd(ev), { passive: true });
			window.addEventListener('touchcancel', ev => PSView.handleSnapTouchEnd(ev), { passive: true });
		}
		window.addEventListener('scroll', () => PSView.notifyScrollListeners());
		window.visualViewport?.addEventListener('resize', () => PSView.handleVisualViewportChange());
		window.visualViewport?.addEventListener('scroll', () => PSView.handleVisualViewportChange());
		window.addEventListener('pointerover', this.handleCommandPointerOver);
		window.addEventListener('pointerout', this.handleCommandPointerOut);

		window.addEventListener('click', ev => {
			let elem = ev.target as HTMLElement | null;
			if (BattleTooltips.isLocked) {
				// only dismiss if clicking outside the tooltip
				const tooltipWrapper = document.getElementById('tooltipwrapper');
				if (!tooltipWrapper?.contains(elem)) BattleTooltips.hideTooltip();
			}
			const clickedRoom = PS.getRoom(elem);
			while (elem) {
				if (elem.className === 'spoiler') {
					elem.className = 'spoiler-shown';
				} else if (elem.className === 'spoiler-shown') {
					elem.className = 'spoiler';
				}

				if (elem.classList.contains('username')) {
					const name = elem.getAttribute('data-name') || elem.innerText;
					const userid = toID(name);
					const roomid = `${elem.classList.contains('no-interact') ? 'viewuser' : 'user'}-${userid}` as RoomID;
					PS.join(roomid, {
						parentElem: elem,
						rightPopup: elem.className === 'userbutton username',
						args: { username: name },
					});
					ev.preventDefault();
					ev.stopImmediatePropagation();
					return;
				}

				if (elem.tagName === 'A' || elem.getAttribute('data-href')) {
					if (ev.ctrlKey || ev.metaKey || ev.shiftKey) break;

					const href = elem.getAttribute('data-href') || elem.getAttribute('href');
					let roomid = PS.router.extractRoomID(href);

					// keep this in sync with .htaccess
					const shortLinks = /^(rooms?suggestions?|suggestions?|adminrequests?|forgotpassword|bugs?(reports?)?|formatsuggestions|rules?|faq|credits?|privacy|contact|dex|(damage)?calc|insecure|replays?|devdiscord|smogdex|smogcord|forums?|trustworthy-dlc-link)$/;
					if (roomid === 'appeal' || roomid === 'appeals') roomid = 'view-help-request--appeal' as RoomID;
					if (roomid === 'report') roomid = 'view-help-request--report' as RoomID;
					if (roomid === 'requesthelp') roomid = 'view-help-request--other' as RoomID;

					if (roomid !== null && elem.className !== 'no-panel-intercept' && !shortLinks.test(roomid)) {
						let location = null;
						if (elem.getAttribute('data-target') === 'replace') {
							const room = PS.getRoom(elem);
							if (room) {
								PS.leave(room.id);
								location = room.location;
							}
						}
						PS.join(roomid, {
							parentElem: elem,
							location,
						});
						if (!PS.isPopup(PS.rooms[roomid])) {
							PS.closeAllPopups();
						}
						ev.preventDefault();
						ev.stopImmediatePropagation();
					}
					return;
				}
				if (elem.getAttribute('data-cmd')) {
					const cmd = elem.getAttribute('data-cmd')!;
					const room = PS.getRoom(elem) || PS.mainmenu;
					room.send(cmd, elem);
					ev.preventDefault();
					ev.stopImmediatePropagation();
					return;
				}
				if (elem.getAttribute('data-sendraw')) {
					const cmd = elem.getAttribute('data-sendraw')!;
					const room = PS.getRoom(elem) || PS.mainmenu;
					room.sendDirect(cmd);
					ev.preventDefault();
					ev.stopImmediatePropagation();
					return;
				}
				if (elem.tagName === 'BUTTON') {
					if (this.handleButtonClick(elem as HTMLButtonElement)) {
						ev.preventDefault();
						ev.stopImmediatePropagation();
						return;
					} else if (!elem.getAttribute('type')) {
						// the spec says that buttons with no `type` attribute should be
						// submit buttons, but this is a bad default so we're going
						// to just assume they're not

						// elem.setAttribute('type', 'button');

						// on second thought, a lot of code depends on this default. so
						// we'll leave it alone

						// don't return, to allow <a><button> to make links that look
						// like buttons
					}
				}
				if (elem.id.startsWith('room-')) {
					break;
				}
				elem = elem.parentElement;
			}
			if (PS.room !== clickedRoom) {
				if (clickedRoom) PS.room = clickedRoom;
				PS.room.autoDismissNotifications();
				PS.closePopupsAbove(clickedRoom);
				PS.update();
			}
			if (clickedRoom && !PS.isPopup(clickedRoom)) {
				PSView.scrollToRoom();
			}
		});

		window.addEventListener('keydown', ev => {
			let elem = ev.target as HTMLInputElement | null;
			let isTextInput = false;
			let isNonEmptyTextInput = false;
			if (elem) {
				isTextInput = (elem.tagName === 'INPUT' || elem.tagName === 'TEXTAREA');
				if (isTextInput && ['button', 'radio', 'checkbox', 'file'].includes(elem.type)) {
					isTextInput = false;
				}
				if (isTextInput && elem.value) {
					isNonEmptyTextInput = true;
				}
				if (elem.contentEditable === 'true') {
					isTextInput = true;
					if (elem.textContent && elem.textContent !== '\n') {
						isNonEmptyTextInput = true;
					}
				}
			}
			if (!isNonEmptyTextInput) {
				if (PS.room.onParentKeyDown?.(ev) === false) {
					ev.stopImmediatePropagation();
					ev.preventDefault();
					return;
				}
			}
			const modifierKey = ev.ctrlKey || ev.altKey || ev.metaKey || ev.shiftKey;
			const altKey = !ev.ctrlKey && ev.altKey && !ev.metaKey && !ev.shiftKey;
			const altShiftKey = !ev.ctrlKey && ev.altKey && !ev.metaKey && ev.shiftKey;
			const shiftKey = !ev.ctrlKey && !ev.altKey && !ev.metaKey && ev.shiftKey;
			const kc = ev.keyCode;
			if (altShiftKey && (kc === 37 || kc === 38)) { // alt + shift + left or up
				PS.arrowKeysUsed = true;
				PS.focusUnreadRoom('left');
			} else if (altShiftKey && (kc === 39 || kc === 40)) { // alt + shift + right or down
				PS.arrowKeysUsed = true;
				PS.focusUnreadRoom('right');
			}
			if (altKey && kc === 38) { // alt + up
				PS.arrowKeysUsed = true;
				PS.focusUpRoom();
			} else if (altKey && kc === 40) { // alt + down
				PS.arrowKeysUsed = true;
				PS.focusDownRoom();
			} else if (!modifierKey && kc === 27) { // escape
				if (BattleTooltips.elem) {
					ev.stopImmediatePropagation();
					ev.preventDefault();
					BattleTooltips.hideTooltip();
					return;
				}
				// close popups
				if (PS.popups.length) {
					ev.stopImmediatePropagation();
					ev.preventDefault();
					if (PS.room.closable) {
						PS.closePopup();
						PS.focusRoom(PS.room.id);
					}
				} else if (PS.room.id === 'rooms') {
					PS.hideRightRoom();
				}
			}

			if (isNonEmptyTextInput) return;

			if (altKey && kc === 37) { // alt + left
				PS.arrowKeysUsed = true;
				PS.focusLeftRoom();
			} else if (altKey && kc === 39) { // alt + right
				PS.arrowKeysUsed = true;
				PS.focusRightRoom();
			} else if (shiftKey && kc === 37) { // shift + left
				if (PS.leftPanelWidth === null) return;
				const curLoc = PS.room.location;
				let newLoc = curLoc;
				let newIndex: number | null = null;
				switch (curLoc) {
				case 'right': {
					newIndex = PS.rightRoomList.indexOf(PS.room.id) - 1;
					if (newIndex < 0) {
						newLoc = 'left';
						newIndex = PS.leftRoomList.length + 1;
					}
					break;
				}
				case 'left': {
					newIndex = PS.leftRoomList.indexOf(PS.room.id) - 1;
					// newIndex <= 0 because MainMenu is always at 0 index
					if (newIndex <= 0) {
						newLoc = 'mini-window';
						newIndex = PS.miniRoomList.length + 1;
					}
					break;
				}
				case 'mini-window': {
					newIndex = PS.miniRoomList.indexOf(PS.room.id) - 1;
					if (newIndex < 0) {
						newLoc = 'right';
						newIndex = PS.rightRoomList.length + 1;
					}
					break;
				}
				}
				if (newIndex !== null) {
					PS.moveRoom(PS.room, newLoc, false, newIndex);
					PS.update();
				}
			} else if (shiftKey && kc === 39) { // shift + right
				if (PS.leftPanelWidth === null) return;
				const curLoc = PS.room.location;
				let newLoc = curLoc;
				let newIndex: number | null = null;
				switch (curLoc) {
				case 'right': {
					newIndex = PS.rightRoomList.indexOf(PS.room.id) + 1;
					if (newIndex >= PS.rightRoomList.length - 1) {
						// newIndex = 1 because NewsPanel is at 0
						newLoc = 'mini-window';
						newIndex = 1;
					}
					break;
				}
				case 'left': {
					newIndex = PS.leftRoomList.indexOf(PS.room.id) + 1;
					if (newIndex >= PS.leftRoomList.length) {
						newLoc = 'right';
						newIndex = 0;
					}
					break;
				}
				case 'mini-window': {
					newIndex = PS.miniRoomList.indexOf(PS.room.id) + 1;
					if (newIndex >= PS.miniRoomList.length) {
						newLoc = 'left';
						// newIndex = 1 because MainMenu is at 0
						newIndex = 1;
					}
					break;
				}
				}
				if (newIndex !== null) {
					PS.moveRoom(PS.room, newLoc, false, newIndex);
					PS.update();
				}
			} else if (shiftKey && kc === 38) { // shift + up
				if (PS.prefs.onepanel !== 'vertical') return;
				let newIndex = PS.rightRoomList.indexOf(PS.room.id) - 1;
				if (newIndex < 0) newIndex = PS.rightRoomList.length - 1;
				PS.moveRoom(PS.room, 'right', false, newIndex);
				PS.update();
			} else if (shiftKey && kc === 40) { // shift + down
				if (PS.prefs.onepanel !== 'vertical') return;
				let newIndex = PS.rightRoomList.indexOf(PS.room.id) + 1;
				if (newIndex >= PS.rightRoomList.length - 1) newIndex = 0;
				PS.moveRoom(PS.room, 'right', false, newIndex);
				PS.update();
			}

			if (modifierKey) return;

			if (kc === 37 && elem?.type !== 'radio') { // left
				PS.arrowKeysUsed = true;
				PS.focusLeftRoom();
			} else if (kc === 39 && elem?.type !== 'radio') { // right
				PS.arrowKeysUsed = true;
				PS.focusRightRoom();
			} else if (kc === 191 && !isTextInput && PS.room === PS.mainmenu) { // forward slash
				ev.stopImmediatePropagation();
				ev.preventDefault();
				PS.join('dm---' as RoomID);
			}
		});

		window.addEventListener('dragend', ev => {
			PS.dragging = null;
			ev.preventDefault();
		});

		window.addEventListener('drop', ev => {
			console.log(`drop: ${ev.dataTransfer?.dropEffect as any}`);
			const target = ev.target as HTMLElement;
			if (PS.dragging?.type === 'room') {
				if ((target as HTMLInputElement).type?.startsWith("text")) {
					PS.dragging = null;
					return; // Rooms dragged into text fields become URLs
				}
				PS.updateAutojoin();
				ev.preventDefault();
				PS.dragging = null;
				return;
			}
			if (!PS.dragging || PS.dragging.type === '?') {
				// dragging text
				if (!ev.dataTransfer?.files.length) return;
			}

			// The default file drop action for Firefox is to open the file as a
			// URL, which needs to be prevented.
			// The default file drop action for most browsers is to open the file
			// in the tab, which is generally undesirable anyway.
			ev.preventDefault();

			for (const Panel of Object.values(PS.roomTypes)) {
				if (Panel!.handleDrop?.(ev)) {
					PS.dragging = null;
					return;
				}
			}
			PS.alert(
				`Sorry, we don't know what to do with that file.\n\nSupported file types:\n` +
				`- images (to set your background)\n- downloaded replay files\n- team files`
			);
			PS.dragging = null;
		});

		const colorSchemeQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
		if (colorSchemeQuery?.media !== 'not all') {
			colorSchemeQuery.addEventListener('change', cs => {
				if (PS.prefs.theme === 'system') document.body.className = cs.matches ? 'dark' : '';
			});
		}

		PS.prefs.subscribeAndRun(key => {
			if (!key || key === 'theme') {
				const dark = PS.prefs.theme === 'dark' ||
					(PS.prefs.theme === 'system' && colorSchemeQuery?.matches);
				document.body.className = dark ? 'dark' : '';
			}
		});
	}
	static scrollToHeader() {
		if (PSView.isViewportZoomed()) return;
		if (PSView.narrowMode && PSView.getScrollX() > 0) {
			if (!PSView.cssScrollSnap) {
				PSView.clearSnap();
				PSView.animateSnap(0);
			} else if (PSView.isSafari || PSView.isFirefox) {
				// Safari bug: `scrollBy` doesn't actually work when scroll snap is enabled
				// note: interferes with the textbox-focus workaround for a Chrome bug
				document.documentElement.classList.remove('scroll-snap-enabled');
				PSView.setScrollX(0);
				setTimeout(() => {
					PSView.updateScrollSnap();
				}, 1);
			} else {
				PSView.setScrollX(0);
			}
		}
	}
	static scrollToRoom() {
		if (PSView.isViewportZoomed()) return;
		if (PSView.narrowMode && PSView.getScrollX() < NARROW_MODE_HEADER_WIDTH) {
			if (!PSView.cssScrollSnap) {
				PSView.clearSnap();
				PSView.animateSnap(NARROW_MODE_HEADER_WIDTH, PS.prefs.noanim ? 0 : 160);
			} else if (PSView.isSafari || PSView.isFirefox) {
				// Safari bug: `scrollBy` doesn't actually work when scroll snap is enabled
				// note: interferes with the textbox-focus workaround for a Chrome bug
				document.documentElement.classList.remove('scroll-snap-enabled');
				PSView.jumpToRoom();
				setTimeout(() => {
					PSView.updateScrollSnap();
				}, 1);
			} else {
				PSView.jumpToRoom();
			}
		}
	}
	static focusIfNoSelection = (ev: MouseEvent) => {
		const room = PS.getRoom(ev.target, true);
		if (!room) return;

		if (window.getSelection?.()?.type === 'Range') return;
		room.autoDismissNotifications();
		PS.setFocus(room);
	};
	handleClickOverlay = (ev: MouseEvent) => {
		// iOS Safari bug, no global click events when tapping
		// I'm sure it's intentional but it interferes with putting the dismiss feature in window.onclick
		if ((ev.target as Element)?.className === 'ps-overlay') {
			if (PS.room.closable) {
				PS.closePopup();
			}
			ev.preventDefault();
			ev.stopImmediatePropagation();
		}
	};
	handleButtonClick(elem: HTMLButtonElement) {
		if (elem.classList.contains('formatselect')) {
			// this is an abomination but we gotta support it for backcompat
			PS.join('formatdropdown' as RoomID, {
				parentElem: elem,
			});
			return true;
		}
		switch (elem.name) {
		case 'closeRoom': {
			const roomid = elem.value as RoomID || PS.getRoom(elem)?.id || '' as RoomID;
			PS.rooms[roomid]?.send('/close', elem);
			return true;
		}
		case 'joinRoom':
			PS.join(elem.value as RoomID, {
				parentElem: elem,
			});
			return true;
		case 'format':
			PS.join('formatdropdown' as RoomID, {
				parentElem: elem,
			});
			return true;
		case 'register':
			PS.join('register' as RoomID, {
				parentElem: elem,
			});
			return true;
		case 'openOptions':
			PS.join('options' as RoomID, {
				parentElem: elem,
			});
			return true;
		case 'showOtherFormats': {
			// TODO: refactor to a command after we drop support for the old client
			const table = elem.closest('table');
			const room = PS.getRoom(elem);
			if (table) {
				for (const row of table.querySelectorAll<HTMLElement>('tr.hidden')) {
					row.style.display = 'table-row';
				}
				for (const row of table.querySelectorAll<HTMLElement>('tr.no-matches')) {
					row.style.display = 'none';
				}
				elem.closest('tr')!.style.display = 'none';
				(room as ChatRoom).log?.updateScroll();
			}
			return true;
		}
		case 'copyText':
			const dummyInput = document.createElement("input");
			// This is a hack. You can only "select" an input field.
			//  The trick is to create a short lived input element and destroy it after a copy.
			// (stolen from the replay code, obviously --mia)
			dummyInput.id = "dummyInput";
			dummyInput.value = elem.value || (elem as any).href || "";
			dummyInput.style.position = 'absolute';
			elem.appendChild(dummyInput);
			dummyInput.select();
			document.execCommand("copy");
			elem.removeChild(dummyInput);
			elem.innerText = 'Copied!';
			return true;
		case 'send':
		case 'cmd':
			const room = PS.getRoom(elem) || PS.mainmenu;
			if (elem.name === 'send') {
				// Legacy behavior. Use `data-cmd` or `data-sendraw` once we drop support for the old client.
				if ((room as ChatRoom).pmTarget) {
					PS.send(elem.value);
				} else {
					room.sendDirect(elem.value);
				}
			} else {
				room.send(elem.value);
			}
			return true;
		}
		return false;
	}
	componentDidCatch(err: Error) {
		PS.mainmenu.caughtError = err.stack || err.message;
		this.setState({});
	}
	static containingRoomid(elem: HTMLElement) {
		let curElem: HTMLElement | null = elem;
		while (curElem) {
			if (curElem.id.startsWith('room-')) {
				return curElem.id.slice(5) as RoomID;
			}
			curElem = curElem.parentElement;
		}
		return null;
	}
	static isEmptyClick(e: MouseEvent) {
		try {
			const selection = window.getSelection()!;
			if (selection.type === 'Range') return false;
		} catch {}
		BattleTooltips.hideTooltip();
	}
	static posStyle(room: PSRoom) {
		if (PS.leftPanelWidth === null) {
			// vertical mode
			if (room === PS.panel) {
				// const minWidth = Math.min(500, Math.max(320, window.innerWidth - 9));
				return { top: '30px', left: `${PSView.verticalHeaderWidth}px`, minWidth: `none` };
			}
		} else if (PS.leftPanelWidth === 0) {
			// one panel visible
			if (room === PS.panel) return {};
		} else {
			// both panels visible
			if (room === PS.leftPanel) return { width: `${PS.leftPanelWidth}px`, right: 'auto' };
			if (room === PS.rightPanel) return { top: `56px`, left: `${PS.leftPanelWidth + 1}px` };
		}

		return { display: 'none' };
	}
	static getPopupStyle(room: PSRoom, width?: number | 'auto', fullSize?: boolean): any {
		if (fullSize) {
			return { width: '90%', maxHeight: '90%', maxWidth: 'none', position: 'relative', margin: '5vh auto 0' };
		}

		const source = room.parentElem?.getBoundingClientRect();
		if (source && !source.width && !source.height && !source.top && !source.left) {
			// parent elem has been unmounted
			room.parentElem = null;
			PS.update();
		}

		if (!room.parentElem || !source) {
			return { maxWidth: width || 480 };
		}
		if (!room.width || !room.height) {
			room.focusNextUpdate = true;
			// dimensions unknown; render hidden at top-left so width/height can be grabbed
			// next render will be able to calculate position
			return {
				position: 'absolute',
				visibility: 'hidden',
				margin: 0,
				top: 0,
				left: 0,
				...(width ? { maxWidth: typeof width === 'number' ? width - 2 : width } : {}),
			};
		}
		// nonmodal popup: should be positioned near source element
		let style: any = {
			position: 'absolute',
			margin: 0,
		};
		// semimodal popups exist in a fixed-positioned overlay and are
		// positioned relative to the overlay (the viewport).
		// regular popups are positioned relative to the document root, and so
		// need to account for scrolling.
		const isFixed = room.location !== 'popup';
		const offsetLeft = isFixed || this.useScrollFrame() ? 0 : window.scrollX;
		const offsetTop = isFixed ? 0 : window.scrollY;
		const availableWidth = document.documentElement.clientWidth + offsetLeft;
		const availableHeight = document.documentElement.clientHeight;

		const sourceWidth = source.width;
		const sourceHeight = source.height;
		const sourceTop = source.top + offsetTop;
		const sourceLeft = source.left + offsetLeft;

		const height = room.height;
		width = width || room.width;

		if (room.rightPopup) {

			if (availableHeight > sourceTop + height + 5 &&
				(sourceTop < availableHeight * 2 / 3 || sourceTop + 200 < availableHeight)) {
				style.top = sourceTop;
			} else if (sourceTop + sourceHeight >= height) {
				style.bottom = Math.max(availableHeight - sourceTop - sourceHeight, 0);
			} else {
				style.top = Math.max(0, availableHeight - height);
			}
			const popupLeft = sourceLeft + sourceWidth;
			if (width !== 'auto' && popupLeft + width > availableWidth) {
				// can't fit, give up and put it in the normal place
				style = {
					position: 'absolute',
					margin: 0,
				};
			} else {
				style.left = popupLeft;
			}

		}

		if (style.left === undefined) {

			if (availableHeight > sourceTop + sourceHeight + height + 5 &&
				(sourceTop + sourceHeight < availableHeight * 2 / 3 || sourceTop + sourceHeight + 200 < availableHeight)) {
				style.top = sourceTop + sourceHeight;
			} else if (height + 30 <= sourceTop) {
				style.bottom = Math.max(availableHeight - sourceTop, 0);
			} else if (height + 35 < availableHeight) {
				style.bottom = 5;
			} else {
				style.top = 25;
			}

			const availableAlignedWidth = availableWidth - sourceLeft;
			if (width !== 'auto' && availableAlignedWidth < width + 10) {
				// while `right: 10` would be simpler, it doesn't work if there is horizontal scrolling,
				// like in the mobile layout
				style.left = Math.max(availableWidth - width - 10, offsetLeft);
			} else {
				style.left = sourceLeft;
			}

		}

		// -2 to exclude 1px border on each side
		if (width) style.maxWidth = typeof width === 'number' ? width - 2 : width;

		return style;
	}
	renderPopup(room: PSRoom) {
		if (room.location === 'popup' && room.parentElem) {
			return <PSPanelErrorBoundary key={room.id} room={room} />;
		}
		return <div key={room.id} class="ps-overlay" onClick={this.handleClickOverlay} role="dialog">
			<PSPanelErrorBoundary room={room} />
		</div>;
	}
	renderDebugMenu() {
		if (PSView.debugMenu === 'panels') {
			return `room: ${JSON.stringify(PS.room?.id)}\n` +
				`onepanel: ${JSON.stringify(PS.prefs.onepanel)}, leftPanelWidth: ${JSON.stringify(PS.leftPanelWidth)}\n` +
				`panel: ${JSON.stringify(PS.panel?.id)}, left: ${JSON.stringify(PS.leftPanel?.id)}, right: ${JSON.stringify(PS.rightPanel?.id)}\n` +
				`popups: ${JSON.stringify(PS.popups)}`;
		}
		return null;
	}
	render() {
		let rooms = [] as preact.VNode[];
		for (const roomid in PS.rooms) {
			const room = PS.rooms[roomid]!;
			if (PS.isPanel(room)) {
				rooms.push(<PSPanelErrorBoundary key={room.id} room={room} />);
			}
		}
		return <div class="ps-frame" role="none">
			<div class="ps-scroll-frame">
				<div class="ps-scroll-content">
					<PSHeader />
					<PSMiniHeader />
					{rooms}
				</div>
			</div>
			{PSView.debugMenu && <pre id="ps-debug-menu" aria-hidden="true" style={{ display: 'block' }}>
				{this.renderDebugMenu()}
			</pre>}
			{PS.popups.map(roomid => this.renderPopup(PS.rooms[roomid]!))}
		</div>;
	}
}

export class ReconnectTimer extends preact.Component {
	timer: ReturnType<typeof setInterval> | null = null;
	override componentDidMount() {
		this.timer = setInterval(() => this.forceUpdate(), 1000);
	}
	override componentWillUnmount() {
		if (this.timer) clearInterval(this.timer);
	}
	override render() {
		const nextRetryTime = PS.connection?.nextRetryTime;
		if (!nextRetryTime) return null;
		const secs = Math.ceil((nextRetryTime - Date.now()) / 1000);
		return <small>{secs > 0 ? `(Autoreconnect in ${secs}s)` : `(Reconnecting...)`}</small>;
	}
}

export function PSIcon(
	props: { pokemon: string | Pokemon | ServerPokemon | Dex.PokemonSet | null } |
		{ item: string | null } | { type: string, b?: boolean, new?: boolean, tera?: boolean } |
		{ category: string } | { gender: string }
) {
	if ('pokemon' in props) {
		return <span class="picon" style={Dex.getPokemonIcon(props.pokemon)} />;
	}
	if ('item' in props) {
		return <span class="itemicon" style={Dex.getItemIcon(props.item)} />;
	}
	if ('type' in props) {
		let type = Dex.types.get(props.type).name;
		if (!type) type = '???';
		if (props.new) {
			return <span class={`typeicon typeicon-${type}${props.tera ? ' tera' : ''}`}>{type}</span>;
		}
		let sanitizedType = type.replace(/\?/g, '%3f');
		return <img
			src={`${Dex.resourcePrefix}sprites/types/${sanitizedType}.png`} alt={type}
			height="14" width="32" class={`pixelated${props.b ? ' b' : ''}`} style="vertical-align:middle"
		/>;
	}
	if ('category' in props) {
		const categoryID = toID(props.category);
		let sanitizedCategory = '';
		switch (categoryID) {
		case 'physical':
		case 'special':
		case 'status':
			sanitizedCategory = categoryID.charAt(0).toUpperCase() + categoryID.slice(1);
			break;
		default:
			sanitizedCategory = 'undefined';
			break;
		}
		return <img
			src={`${Dex.resourcePrefix}sprites/categories/${sanitizedCategory}.png`} alt={sanitizedCategory}
			height="14" width="32" class="pixelated" style="vertical-align:middle"
		/>;
	}
	if ('gender' in props) {
		return <img
			src={`${Dex.resourcePrefix}sprites/misc/gender-${props.gender.toLowerCase()}.png`}
			width={18} height={18} alt={props.gender} style="margin-top: -1px; filter: grayscale(30%)"
		/>;
	}
	return null!;
}
