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
import { PS, type PSRoom, type RoomID } from "./client-main";
import type { ChatRoom } from "./panel-chat";
import { PSHeader, PSMiniHeader } from "./panel-topbar";

export const VERTICAL_HEADER_WIDTH = 240;
export const NARROW_MODE_HEADER_WIDTH = 280;

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

		if (!/^[a-z0-9-]*$/.test(url)) return null;

		const redirects = /^(appeals?|rooms?suggestions?|suggestions?|adminrequests?|bugs?|bugreports?|rules?|faq|credits?|privacy|contact|dex|insecure)$/;
		if (redirects.test(url)) return null;

		if (url.startsWith('view-teams-view-')) {
			const teamid = url.slice(16);
			url = `viewteam-${teamid}` as RoomID;
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
		if (room.id === 'rooms') room = PS.leftPanel;

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
				if (currentRoomid === PS.room.id) return;
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
		if (PSView.hasTapped) return;

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
		const size = props.fullSize ? ' mini-window-flex' : '';
		return <div
			id={`room-${room.id}`}
			class={`mini-window-contents tiny-layout ps-room-light${props.scrollable === true ? ' scrollable' : ''}${size}`}
			onClick={props.focusClick ? PSView.focusIfNoSelection : undefined} onDragEnter={props.onDragEnter}
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
	const tinyLayout = room.width < 620 ? ' tiny-layout' : '';
	return <div
		class={`ps-room${room.id === '' ? '' : ' ps-room-light'}${props.scrollable === true ? ' scrollable' : ''}${tinyLayout}`}
		id={`room-${room.id}`} role="tabpanel" aria-labelledby={`roomtab-${room.id}`}
		style={style} onClick={props.focusClick ? PSView.focusIfNoSelection : undefined} onDragEnter={props.onDragEnter}
	>
		{room.caughtError ? <div class="broadcast broadcast-red"><pre>{room.caughtError}</pre></div> : props.children}
	</div>;
}

export class PSView extends preact.Component {
	static readonly isIOS = [
		'iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod',
	].includes(navigator.platform);
	static readonly isChrome = navigator.userAgent.includes(' Chrome/');
	static readonly isSafari = !this.isChrome && navigator.userAgent.includes(' Safari/');
	static readonly isFirefox = navigator.userAgent.includes(' Firefox/');
	static readonly isMac = navigator.platform?.startsWith('Mac');
	static textboxFocused = false;
	static dragend: ((ev: DragEvent) => void) | null = null;
	/** was the last click event a tap? heristic for mobile/desktop */
	static hasTapped = false;
	/** mode where the tabbar is opened rather than always being there */
	static narrowMode = false;
	static verticalHeaderWidth = VERTICAL_HEADER_WIDTH;
	static setTextboxFocused(focused: boolean) {
		if (!PSView.narrowMode) return;
		if (!PSView.isChrome && !PSView.isSafari) return;
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

		window.addEventListener('pointerdown', ev => {
			// can't be part of the click event because Safari pretends the pointer is a mouse
			PSView.hasTapped = ev.pointerType === 'touch' || ev.pointerType === 'pen';
		});

		window.addEventListener('click', ev => {
			let elem = ev.target as HTMLElement | null;
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
				if (PS.room.onParentEvent?.('keydown', ev) === false) {
					ev.stopImmediatePropagation();
					ev.preventDefault();
					return;
				}
			}
			const modifierKey = ev.ctrlKey || ev.altKey || ev.metaKey || ev.shiftKey;
			const altKey = !ev.ctrlKey && ev.altKey && !ev.metaKey && !ev.shiftKey;
			if (altKey && ev.keyCode === 38) { // alt + up
				PS.arrowKeysUsed = true;
				PS.focusUpRoom();
			} else if (altKey && ev.keyCode === 40) { // alt + down
				PS.arrowKeysUsed = true;
				PS.focusDownRoom();
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
			}
			if (isNonEmptyTextInput) return;
			if (altKey && ev.keyCode === 37) { // alt + left
				PS.arrowKeysUsed = true;
				PS.focusLeftRoom();
			} else if (altKey && ev.keyCode === 39) { // alt + right
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
			} else if (ev.keyCode === 191 && !isTextInput && PS.room === PS.mainmenu) { // forward slash
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

		window.addEventListener('focus', () => {
			PS.isNotifying = false;
			PSHeader.updateFavicon();
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
		if (PSView.narrowMode && window.scrollX > 0) {
			if (PSView.isSafari || PSView.isFirefox) {
				// Safari bug: `scrollBy` doesn't actually work when scroll snap is enabled
				// note: interferes with the `PSView.textboxFocused` workaround for a Chrome bug
				document.documentElement.classList.remove('scroll-snap-enabled');
				window.scrollTo(0, 0);
				setTimeout(() => {
					if (!PSView.textboxFocused) document.documentElement.classList.add('scroll-snap-enabled');
				}, 1);
			} else {
				window.scrollTo(0, 0);
			}
		}
	}
	static scrollToRoom() {
		if (PSView.narrowMode && window.scrollX === 0) {
			if (PSView.isSafari || PSView.isFirefox) {
				// Safari bug: `scrollBy` doesn't actually work when scroll snap is enabled
				// note: interferes with the `PSView.textboxFocused` workaround for a Chrome bug
				document.documentElement.classList.remove('scroll-snap-enabled');
				window.scrollTo(NARROW_MODE_HEADER_WIDTH, 0);
				setTimeout(() => {
					if (!PSView.textboxFocused) document.documentElement.classList.add('scroll-snap-enabled');
				}, 1);
			} else {
				window.scrollTo(NARROW_MODE_HEADER_WIDTH, 0);
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
	handleClickOverlay = (ev: MouseEvent) => {
		// iOS Safari bug, no global click events when tapping
		// I'm sure it's intentional but it interferes with putting the dismiss feature in window.onclick
		if ((ev.target as Element)?.className === 'ps-overlay') {
			PS.closePopup();
			ev.preventDefault();
			ev.stopImmediatePropagation();
		}
	};
	handleButtonClick(elem: HTMLButtonElement) {
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
		case 'register':
			PS.join('register' as RoomID, {
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
				// const minWidth = Math.min(500, Math.max(320, document.body.offsetWidth - 9));
				return { top: '30px', left: `${PSView.verticalHeaderWidth}px`, minWidth: `none` };
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
		return <div key={room.id} class="ps-overlay" onClick={this.handleClickOverlay} role="dialog">
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
		return <div class="ps-frame" role="none">
			<PSHeader />
			<PSMiniHeader />
			{rooms}
			{PS.popups.map(roomid => this.renderPopup(PS.rooms[roomid]!))}
		</div>;
	}
}

export function PSIcon(
	props: { pokemon: string | Pokemon | ServerPokemon | Dex.PokemonSet | null } |
		{ item: string | null } | { type: string, b?: boolean } | { category: string }
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
	return null!;
}
