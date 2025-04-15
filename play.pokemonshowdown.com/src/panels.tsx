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
import { toID } from "./battle-dex";
import { BattleLog } from "./battle-log";
import type { Args } from "./battle-text-parser";
import { BattleTooltips } from "./battle-tooltips";
import type { PSStreamModel, PSSubscription } from "./client-core";
import { PS, type PSRoom, type RoomID } from "./client-main";
import { PSHeader, PSMiniHeader } from "./panel-topbar";

export class PSRouter {
	roomid = '' as RoomID;
	panelState = '';
	constructor() {
		const currentRoomid = location.pathname.slice(1);
		if (/^[a-z0-9-]+$/.test(currentRoomid)) {
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

		if (!/^[a-z0-9-]*$/.test(url)) return null;

		const redirects = /^(appeals?|rooms?suggestions?|suggestions?|adminrequests?|bugs?|bugreports?|rules?|faq|credits?|privacy|contact|dex|insecure)$/;
		if (redirects.test(url)) return null;

		return url as RoomID;
	}
	updatePanelState(): { roomid: RoomID, changed: boolean } {
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
		if (room.id === 'rooms') room = PS.leftPanel;

		let roomid = room.id;
		const panelState = (PS.leftPanelWidth && room === PS.panel ?
			PS.leftPanel.id + '..' + PS.rightPanel!.id :
			room.id);
		if (roomid === this.roomid && panelState === this.panelState) {
			return { roomid, changed: false };
		}

		if (roomid === '') {
			document.title = 'Showdown!';
		} else {
			document.title = room.title + ' - Showdown!';
		}
		this.roomid = roomid;
		this.panelState = panelState;
		return { roomid, changed: true };
	}
	subscribeHash() {
		if (location.hash) {
			const currentRoomid = location.hash.slice(1);
			if (/^[a-z0-9-]+$/.test(currentRoomid)) {
				PS.join(currentRoomid as RoomID);
			} else {
				return;
			}
		}
		PS.subscribeAndRun(() => {
			const { roomid, changed } = this.updatePanelState();
			if (changed) location.hash = roomid ? `#${roomid}` : '';
		});
		window.addEventListener('hashchange', e => {
			const possibleRoomid = location.hash.slice(1);
			let currentRoomid: RoomID | null = null;
			if (/^[a-z0-9-]*$/.test(possibleRoomid)) {
				currentRoomid = possibleRoomid as RoomID;
			}
			if (currentRoomid !== null) {
				if (currentRoomid === PS.room.id) return;
				PS.join(currentRoomid);
			}
		});
	}
	subscribeHistory() {
		const currentRoomid = location.pathname.slice(1);
		if (/^[a-z0-9-]+$/.test(currentRoomid)) {
			PS.join(currentRoomid as RoomID);
		} else {
			return;
		}
		if (!window.history) return;
		PS.subscribeAndRun(() => {
			const { roomid, changed } = this.updatePanelState();
			if (changed) {
				history.pushState(this.panelState, '', `/${roomid}`);
			} else {
				history.replaceState(this.panelState, '', `/${roomid}`);
			}
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
					PS.join(leftRoomid, { location: 'left' });
					PS.join(rightRoomid, { location: 'right' });
				} else {
					PS.join(leftRoomid);
				}
			}
			if (roomid !== null) {
				PS.join(roomid);
			}
		});
	}
}
PS.router = new PSRouter();

export class PSRoomPanel<T extends PSRoom = PSRoom> extends preact.Component<{ room: T }> {
	subscriptions: PSSubscription[] = [];
	subscribeTo<M>(model: PSStreamModel<M>, callback: (value: M) => void): PSSubscription {
		const subscription = model.subscribe(callback);
		this.subscriptions.push(subscription);
		return subscription;
	}
	override componentDidMount() {
		if (PS.room === this.props.room) this.focus();
		this.props.room.onParentEvent = (id: string, e?: Event) => {
			if (id === 'focus') this.focus();
		};
		this.subscriptions.push(this.props.room.subscribe(args => {
			if (!args) this.forceUpdate();
			else this.receiveLine(args);
		}));
		this.updateDimensions();
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
		if (this.base && ['popup', 'semimodal-popup'].includes(room.location)) {
			if (room.width && room.hiddenInit) {
				room.hiddenInit = false;
				this.focus();
			}
			this.updateDimensions();
		} else if (this.base && room.hiddenInit) {
			room.hiddenInit = false;
			this.focus();
		}
	}
	override componentWillUnmount() {
		this.props.room.onParentEvent = null;
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
		const changeEvent = new Event('change');
		dropdownButton.dispatchEvent(changeEvent);
		PS.closePopup();
	}
	focus() {
		// mobile probably
		if (document.body.offsetWidth < 500) return;

		const autofocus = this.base?.querySelector<HTMLElement>('.autofocus');
		autofocus?.focus();
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
	focusClick?: boolean, scrollable?: boolean | 'hidden', width?: number | 'auto',
}) {
	const room = props.room;
	if (room.location === 'mini-window' && PS.leftPanelWidth !== null) {
		if (room.id === 'news') {
			return <div id={`room-${room.id}`}>{props.children}</div>;
		}
		return <div
			id={`room-${room.id}`} class={'mini-window-contents ps-room-light' + (props.scrollable === true ? ' scrollable' : '')}
			onClick={props.focusClick ? PSMain.focusIfNoSelection : undefined}
		>
			{props.children}
		</div>;
	}
	if (PS.isPopup(room)) {
		const style = PSMain.getPopupStyle(room, props.width);
		return <div class="ps-popup" id={`room-${room.id}`} style={style}>
			{props.children}
		</div>;
	}
	const style = PSMain.posStyle(room) as any;
	if (props.scrollable === 'hidden') style.overflow = 'hidden';
	return <div
		class={'ps-room' + (room.id === '' ? '' : ' ps-room-light') + (props.scrollable === true ? ' scrollable' : '')}
		id={`room-${room.id}`}
		style={style} onClick={props.focusClick ? PSMain.focusIfNoSelection : undefined}
	>
		{room.caughtError ? <div class="broadcast broadcast-red"><pre>{room.caughtError}</pre></div> : props.children}
	</div>;
}

export class PSMain extends preact.Component {
	static readonly isChrome = navigator.userAgent.includes(' Chrome/');
	static readonly isSafari = !this.isChrome && navigator.userAgent.includes(' Safari/');
	static textboxFocused = false;
	static setTextboxFocused(focused: boolean) {
		if (!PSMain.isChrome || PS.leftPanelWidth !== null) return;
		// Chrome bug: on Android, it insistently scrolls everything leftmost when scroll snap is enabled

		this.textboxFocused = focused;
		if (focused) {
			document.documentElement.classList.remove('scroll-snap-enabled');
			PSMain.scrollToRoom();
		} else {
			document.documentElement.classList.add('scroll-snap-enabled');
		}
	}
	constructor() {
		super();
		PS.subscribe(() => this.forceUpdate());

		let autojoin = PS.prefs.autojoin;
		if (autojoin) {
			let rooms = typeof autojoin === 'string' ? autojoin : autojoin[PS.server.id] || '';
			if (rooms.length) {
				PS.rooms['']?.sendDirect(`/autojoin ${rooms}`);
			}
		}

		if (PSMain.isSafari) {
			// I don't want to prevent users from being able to zoom, but iOS Safari
			// auto-zooms when focusing textboxes (unless the font size is 16px),
			// and this apparently fixes it while still allowing zooming.
			document.querySelector('meta[name=viewport]')?.setAttribute('content', 'width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0');
		}

		window.addEventListener('click', e => {
			let elem = e.target as HTMLElement | null;
			if (elem?.className === 'ps-overlay') {
				PS.closePopup();
				e.preventDefault();
				e.stopImmediatePropagation();
				return;
			}
			const clickedRoom = PS.getRoom(elem);
			while (elem) {
				if (elem.className === 'spoiler') {
					elem.className = 'spoiler-shown';
				} else if (elem.className === 'spoiler-shown') {
					elem.className = 'spoiler';
				}

				if (` ${elem.className} `.includes(' username ')) {
					const name = elem.getAttribute('data-name') || elem.innerText;
					const userid = toID(name);
					const roomid = `${` ${elem.className} `.includes(' no-interact ') ? 'viewuser' : 'user'}-${userid}` as RoomID;
					PS.join(roomid, {
						parentElem: elem,
						rightPopup: elem.className === 'userbutton username',
						args: { username: name },
					});
					e.preventDefault();
					e.stopImmediatePropagation();
					return;
				}

				if (elem.tagName === 'A' || elem.getAttribute('data-href')) {
					const href = elem.getAttribute('data-href') || elem.getAttribute('href');
					const roomid = PS.router.extractRoomID(href);

					if (roomid !== null) {
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
						e.preventDefault();
						e.stopImmediatePropagation();
					}
					return;
				}
				if (elem.getAttribute('data-cmd')) {
					const cmd = elem.getAttribute('data-cmd')!;
					const room = PS.getRoom(elem) || PS.mainmenu;
					room.send(cmd);
					return;
				}
				if (elem.getAttribute('data-sendraw')) {
					const cmd = elem.getAttribute('data-sendraw')!;
					const room = PS.getRoom(elem) || PS.mainmenu;
					room.sendDirect(cmd);
					return;
				}
				if (elem.tagName === 'BUTTON') {
					if (this.handleButtonClick(elem as HTMLButtonElement)) {
						e.preventDefault();
						e.stopImmediatePropagation();
						return;
					} else if (!elem.getAttribute('type')) {
						// the spec says that buttons with no `type` attribute should be
						// submit buttons, but this is a bad default so we're going
						// to just assume they're not
						elem.setAttribute('type', 'button');

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
				PS.closePopupsAbove(clickedRoom);
				PS.update();
			}
			if (clickedRoom && !PS.isPopup(clickedRoom)) {
				PSMain.scrollToRoom();
			}
		});

		window.addEventListener('keydown', e => {
			let elem = e.target as HTMLInputElement | null;
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
				if (PS.room.onParentEvent?.('keydown', e) === false) {
					e.stopImmediatePropagation();
					e.preventDefault();
					return;
				}
			}
			const modifierKey = e.ctrlKey || e.altKey || e.metaKey || e.shiftKey;
			const altKey = !e.ctrlKey && e.altKey && !e.metaKey && !e.shiftKey;
			if (altKey && e.keyCode === 38) { // up
				PS.arrowKeysUsed = true;
				PS.focusUpRoom();
			} else if (altKey && e.keyCode === 40) { // down
				PS.arrowKeysUsed = true;
				PS.focusDownRoom();
			}
			if (isNonEmptyTextInput) return;
			if (altKey && e.keyCode === 37) { // left
				PS.arrowKeysUsed = true;
				PS.focusLeftRoom();
			} else if (altKey && e.keyCode === 39) { // right
				PS.arrowKeysUsed = true;
				PS.focusRightRoom();
			}
			if (modifierKey) return;
			if (e.keyCode === 37) { // left
				PS.arrowKeysUsed = true;
				PS.focusLeftRoom();
			} else if (e.keyCode === 39) { // right
				PS.arrowKeysUsed = true;
				PS.focusRightRoom();
			} else if (e.keyCode === 27) { // escape
				// close popups
				if (PS.popups.length) {
					e.stopImmediatePropagation();
					e.preventDefault();
					PS.closePopup();
					PS.focusRoom(PS.room.id);
				} else if (PS.room.id === 'rooms') {
					PS.hideRightRoom();
				}
			} else if (e.keyCode === 191 && !isTextInput && PS.room === PS.mainmenu) { // forward slash
				e.stopImmediatePropagation();
				e.preventDefault();
				PS.join('dm---' as RoomID);
			}
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
		if (window.scrollX > 0) {
			window.scrollTo({ left: 0 });
		}
	}
	static scrollToRoom() {
		if (document.documentElement.scrollWidth > document.documentElement.clientWidth && window.scrollX === 0) {
			if (PSMain.isSafari && PS.leftPanelWidth === null) {
				// Safari bug: `scrollBy` doesn't actually work when scroll snap is enabled
				// note: interferes with the `PSMain.textboxFocused` workaround for a Chrome bug
				document.documentElement.classList.remove('scroll-snap-enabled');
				window.scrollBy(400, 0);
				setTimeout(() => {
					document.documentElement.classList.add('scroll-snap-enabled');
				}, 0);
			} else {
				// intentionally around twice as big as necessary
				window.scrollBy(400, 0);
			}
		}
	}
	static focusIfNoSelection = (ev: MouseEvent) => {
		const room = PS.getRoom(ev.target as HTMLElement, true);
		if (!room) return;

		if (window.getSelection?.()?.type === 'Range') return;
		PS.setFocus(room);
	};
	handleButtonClick(elem: HTMLButtonElement) {
		switch (elem.name) {
		case 'closeRoom':
			const roomid = elem.value as RoomID || PS.getRoom(elem)?.id || '' as RoomID;
			PS.leave(roomid);
			return true;
		case 'joinRoom':
			PS.join(elem.value as RoomID, {
				parentElem: elem,
			});
			return true;
		case 'send':
		case 'cmd':
			const room = PS.getRoom(elem) || PS.mainmenu;
			if (elem.name === 'send') {
				room.sendDirect(elem.value);
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
				const minWidth = Math.min(500, Math.max(320, document.body.offsetWidth - 9));
				return { top: '25px', left: '200px', minWidth: `${minWidth}px` };
			}
		} else if (PS.leftPanelWidth === 0) {
			// one panel visible
			if (room === PS.panel) return {};
		} else {
			// both panels visible
			if (room === PS.leftPanel) return { width: `${PS.leftPanelWidth}px`, right: 'auto' };
			if (room === PS.rightPanel) return { top: 56, left: PS.leftPanelWidth + 1 };
		}

		return { display: 'none' };
	}
	static getPopupStyle(room: PSRoom, width?: number | 'auto'): any {
		if (room.location === 'modal-popup' || !room.parentElem) {
			return { maxWidth: width || 480 };
		}
		if (!room.width || !room.height) {
			room.hiddenInit = true;
			return {
				position: 'absolute',
				visibility: 'hidden',
				margin: 0,
				top: 0,
				left: 0,
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
		const offsetLeft = isFixed ? 0 : window.scrollX;
		const offsetTop = isFixed ? 0 : window.scrollY;
		const availableWidth = document.documentElement.clientWidth + offsetLeft;
		const availableHeight = document.documentElement.clientHeight;

		const source = room.parentElem.getBoundingClientRect();
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
			} else if (height + 5 <= sourceTop) {
				style.bottom = Math.max(availableHeight - sourceTop, 0);
			} else if (height + 10 < availableHeight) {
				style.bottom = 5;
			} else {
				style.top = 0;
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

		if (width) style.maxWidth = width;

		return style;
	}
	renderRoom(room: PSRoom) {
		const RoomType = PS.roomTypes[room.type];
		const Panel = RoomType && !room.caughtError ? RoomType : PSRoomPanel;
		return <Panel key={room.id} room={room} />;
	}
	renderPopup(room: PSRoom) {
		const RoomType = PS.roomTypes[room.type];
		const Panel = RoomType ? RoomType : PSRoomPanel;
		if (room.location === 'popup' && room.parentElem) {
			return <Panel key={room.id} room={room} />;
		}
		return <div key={room.id} class="ps-overlay">
			<Panel room={room} />
		</div>;
	}
	render() {
		let rooms = [] as preact.VNode[];
		for (const roomid in PS.rooms) {
			const room = PS.rooms[roomid]!;
			if (PS.isNormalRoom(room)) {
				rooms.push(this.renderRoom(room));
			}
		}
		return <div class="ps-frame">
			<PSHeader style={{}} />
			<PSMiniHeader />
			{rooms}
			{PS.popups.map(roomid => this.renderPopup(PS.rooms[roomid]!))}
		</div>;
	}
}

export function SanitizedHTML(props: { children: string }) {
	return <div dangerouslySetInnerHTML={{ __html: BattleLog.sanitizeHTML(props.children) }} />;
}
