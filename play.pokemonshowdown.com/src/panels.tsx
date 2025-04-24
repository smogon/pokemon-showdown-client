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
import type { Args } from "./battle-text-parser";
import { BattleTooltips } from "./battle-tooltips";
import { Net } from "./client-connection";
import type { PSModel, PSStreamModel, PSSubscription } from "./client-core";
import { PS, type PSRoom, type RoomID } from "./client-main";
import type { BattleRoom } from "./panel-battle";
import { PSHeader, PSMiniHeader } from "./panel-topbar";

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
	updatePanelState(): { roomid: RoomID, changed: boolean, newTitle: string } {
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
		const newTitle = roomid === '' ? 'Showdown!' : `${room.title} - Showdown!`;
		const changed = (roomid !== this.roomid);

		this.roomid = roomid;
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
			const possibleRoomid = location.hash.slice(1);
			let currentRoomid: RoomID | null = null;
			if (/^[a-z0-9-]*$/.test(possibleRoomid)) {
				currentRoomid = possibleRoomid as RoomID;
			}
			if (currentRoomid !== null) {
				if (currentRoomid === PS.room.id) return;
				this.roomid = currentRoomid;
				PS.join(currentRoomid);
			}
		});
	}
	subscribeHistory() {
		const currentRoomid = location.pathname.slice(1);
		if (/^[a-z0-9-]+$/.test(currentRoomid)) {
			PS.join(currentRoomid as RoomID);
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
			} else {
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
					PS.addRoom({ id: leftRoomid, location: 'left' }, true);
					PS.addRoom({ id: rightRoomid, location: 'right' }, true);
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
	subscribeTo<M>(
		model: PSModel<M> | PSStreamModel<M>, callback: (value: M) => void = () => { this.forceUpdate(); }
	): PSSubscription {
		const subscription = model.subscribe(callback);
		this.subscriptions.push(subscription);
		return subscription;
	}
	override componentDidMount() {
		this.props.room.onParentEvent = (id: string, e?: Event) => {
			if (id === 'focus') this.focus();
		};
		this.subscriptions.push(this.props.room.subscribe(args => {
			if (!args) this.forceUpdate();
			else this.receiveLine(args);
		}));
		this.componentDidUpdate();
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
		const currentlyHidden = !room.width && room.parentElem && ['popup', 'semimodal-popup'].includes(room.location);
		this.updateDimensions();
		if (currentlyHidden) return;
		if (room.focusNextUpdate) {
			room.focusNextUpdate = false;
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
	fullSize?: boolean, onDragEnter?: (ev: DragEvent) => void,
}) {
	const room = props.room;
	if (room.location === 'mini-window') {
		const style = props.fullSize ? 'height: auto' : null;
		return <div
			id={`room-${room.id}`} class={'mini-window-contents ps-room-light' + (props.scrollable === true ? ' scrollable' : '')}
			onClick={props.focusClick ? PSView.focusIfNoSelection : undefined} style={style} onDragEnter={props.onDragEnter}
		>
			{props.children}
		</div>;
	}
	if (PS.isPopup(room)) {
		const style = PSView.getPopupStyle(room, props.width, props.fullSize);
		return <div class="ps-popup" id={`room-${room.id}`} style={style} onDragEnter={props.onDragEnter}>
			{props.children}
		</div>;
	}
	const style = PSView.posStyle(room) as any;
	if (props.scrollable === 'hidden') style.overflow = 'hidden';
	return <div
		class={'ps-room' + (room.id === '' ? '' : ' ps-room-light') + (props.scrollable === true ? ' scrollable' : '')}
		id={`room-${room.id}`}
		style={style} onClick={props.focusClick ? PSView.focusIfNoSelection : undefined} onDragEnter={props.onDragEnter}
	>
		{room.caughtError ? <div class="broadcast broadcast-red"><pre>{room.caughtError}</pre></div> : props.children}
	</div>;
}

export class PSView extends preact.Component {
	static readonly isChrome = navigator.userAgent.includes(' Chrome/');
	static readonly isSafari = !this.isChrome && navigator.userAgent.includes(' Safari/');
	static readonly isMac = navigator.platform?.startsWith('Mac');
	static textboxFocused = false;
	static setTextboxFocused(focused: boolean) {
		if (!PSView.isChrome || PS.leftPanelWidth !== null) return;
		// Chrome bug: on Android, it insistently scrolls everything leftmost when scroll snap is enabled

		this.textboxFocused = focused;
		if (focused) {
			document.documentElement.classList.remove('scroll-snap-enabled');
			PSView.scrollToRoom();
		} else {
			document.documentElement.classList.add('scroll-snap-enabled');
		}
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
			return PS.prefs.refreshprompt ? "Are you sure you want to leave?" : null;
		};

		window.addEventListener('submit', ev => {
			const elem = ev.target as HTMLFormElement | null;
			if (elem?.getAttribute('data-submitsend')) {
				const inputs = Net.formData(elem);
				let cmd = elem.getAttribute('data-submitsend')!;
				for (const [name, value] of Object.entries(inputs)) {
					cmd = cmd.replace(`{${name}}`, value === true ? 'on' : value === false ? 'off' : value);
				}
				cmd = cmd.replace(/\{[a-z0-9-]+\}/g, '');
				const room = PS.getRoom(elem) || PS.mainmenu;
				room.sendDirect(cmd);

				ev.preventDefault();
				ev.stopImmediatePropagation();
			}
		});

		window.addEventListener('click', ev => {
			let elem = ev.target as HTMLElement | null;
			if (elem?.className === 'ps-overlay') {
				PS.closePopup();
				ev.preventDefault();
				ev.stopImmediatePropagation();
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
					// if room is a leaveroom popup, close it
					if (room.id === "confirmleaveroom") PS.closePopup();
					room.send(cmd);
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
				if (PS.room.onParentEvent?.('keydown', ev) === false) {
					ev.stopImmediatePropagation();
					ev.preventDefault();
					return;
				}
			}
			const modifierKey = ev.ctrlKey || ev.altKey || ev.metaKey || ev.shiftKey;
			const altKey = !ev.ctrlKey && ev.altKey && !ev.metaKey && !ev.shiftKey;
			if (altKey && ev.keyCode === 38) { // up
				PS.arrowKeysUsed = true;
				PS.focusUpRoom();
			} else if (altKey && ev.keyCode === 40) { // down
				PS.arrowKeysUsed = true;
				PS.focusDownRoom();
			}
			if (isNonEmptyTextInput) return;
			if (altKey && ev.keyCode === 37) { // left
				PS.arrowKeysUsed = true;
				PS.focusLeftRoom();
			} else if (altKey && ev.keyCode === 39) { // right
				PS.arrowKeysUsed = true;
				PS.focusRightRoom();
			}
			if (modifierKey) return;
			if (ev.keyCode === 37) { // left
				PS.arrowKeysUsed = true;
				PS.focusLeftRoom();
			} else if (ev.keyCode === 39) { // right
				PS.arrowKeysUsed = true;
				PS.focusRightRoom();
			} else if (ev.keyCode === 27) { // escape
				// close popups
				if (PS.popups.length) {
					ev.stopImmediatePropagation();
					ev.preventDefault();
					PS.closePopup();
					PS.focusRoom(PS.room.id);
				} else if (PS.room.id === 'rooms') {
					PS.hideRightRoom();
				}
			} else if (ev.keyCode === 191 && !isTextInput && PS.room === PS.mainmenu) { // forward slash
				ev.stopImmediatePropagation();
				ev.preventDefault();
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
			if (PSView.isSafari && PS.leftPanelWidth === null) {
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
		room.autoDismissNotifications();
		PS.setFocus(room);
	};
	handleButtonClick(elem: HTMLButtonElement) {
		switch (elem.name) {
		case 'closeRoom': {
			const roomid = elem.value as RoomID || PS.getRoom(elem)?.id || '' as RoomID;
			const room = PS.rooms[roomid];
			const battle = (room as BattleRoom).battle;
			if (room?.type === "battle" && !battle.ended && battle.mySide.id === PS.user.userid) {
				PS.join("forfeitbattle" as RoomID, { parentElem: elem });
				return true;
			}
			if (room?.type === "chat" && room.connected && PS.prefs.leavePopupRoom) {
				PS.join("confirmleaveroom" as RoomID, { parentElem: elem });
				return true;
			}
			PS.leave(roomid);
			return true;
		}
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

		if (room.location === 'modal-popup' || !room.parentElem || !source) {
			return { maxWidth: width || 480 };
		}
		if (!room.width || !room.height) {
			room.focusNextUpdate = true;
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
		const Panel = RoomType && !room.isPlaceholder && !room.caughtError ? RoomType : PSRoomPanel;
		return <Panel key={room.id} room={room} />;
	}
	renderPopup(room: PSRoom) {
		const RoomType = PS.roomTypes[room.type];
		const Panel = RoomType && !room.isPlaceholder && !room.caughtError ? RoomType : PSRoomPanel;
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
