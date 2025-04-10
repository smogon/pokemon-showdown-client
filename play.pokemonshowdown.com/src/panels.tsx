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
import { PSHeader } from "./panel-topbar";

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
	extractRoomID(url: string) {
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
		if (this.base) {
			this.props.room.setDimensions(this.base.offsetWidth, this.base.offsetHeight);
		}
	}
	override componentDidUpdate() {
		const room = this.props.room;
		if (this.base && ['popup', 'semimodal-popup'].includes(room.location)) {
			if (room.width && room.hiddenInit) {
				room.hiddenInit = false;
				this.focus();
			}
			room.setDimensions(this.base.offsetWidth, this.base.offsetHeight);
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
		PS.removeRoom(this.props.room);
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
	room: PSRoom, children: preact.ComponentChildren, scrollable?: boolean, width?: number | 'auto',
	focusClick?: boolean,
}) {
	const room = props.room;
	if (room.location === 'mini-window') {
		if (room.id === 'news') {
			return <div id={`room-${room.id}`}>{props.children}</div>;
		}
		return <div
			id={`room-${room.id}`} class={'mini-window-contents ps-room-light' + (props.scrollable ? ' scrollable' : '')}
			onClick={props.focusClick ? PSMain.focusIfNoSelection : undefined}
		>
			{props.children}
		</div>;
	}
	if (room.location !== 'left' && room.location !== 'right') {
		const style = PSMain.getPopupStyle(room, props.width);
		return <div class="ps-popup" id={`room-${room.id}`} style={style}>
			{props.children}
		</div>;
	}
	const style = PSMain.posStyle(room);
	return <div
		class={'ps-room' + (room.id === '' ? '' : ' ps-room-light') + (props.scrollable ? ' scrollable' : '')}
		id={`room-${room.id}`}
		style={style} onClick={props.focusClick ? PSMain.focusIfNoSelection : undefined}
	>
		{room.caughtError ? <div class="broadcast broadcast-red"><pre>{room.caughtError}</pre></div> : props.children}
	</div>;
}

export class PSMain extends preact.Component {
	constructor() {
		super();
		PS.subscribe(() => this.forceUpdate());

		window.addEventListener('click', e => {
			let elem = e.target as HTMLElement | null;
			if (elem?.className === 'ps-overlay') {
				PS.closePopup();
				e.preventDefault();
				e.stopImmediatePropagation();
				return;
			}
			let clickedRoom = null;
			while (elem) {
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
					const href = elem.getAttribute('data-href') || (elem as HTMLAnchorElement).href;
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

						// don't return, to allow <a><button> to make links that look
						// like buttons
						e.preventDefault();
					} else {
						// presumably a different part of the app is handling this button
						return;
					}
				}
				if (elem.id.startsWith('room-')) {
					clickedRoom = PS.rooms[elem.id.slice(5)];
					break;
				}
				elem = elem.parentElement;
			}
			if (PS.room !== clickedRoom) {
				if (clickedRoom) PS.room = clickedRoom;
				// eslint-disable-next-line no-unmodified-loop-condition
				while (PS.popups.length && (!clickedRoom || clickedRoom.id !== PS.popups[PS.popups.length - 1])) {
					PS.closePopup();
				}
				PS.update();
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
	static focusIfNoSelection = (ev: MouseEvent) => {
		const room = PS.getRoom(ev.target as HTMLElement, true);
		if (!room) return;

		if (window.getSelection?.()?.type === 'Range') return;
		ev.preventDefault();
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
		let pos: PanelPosition | null = null;
		if (PS.leftPanelWidth === 0) {
			// one panel visible
			if (room === PS.panel) pos = { top: 56 };
		} else {
			// both panels visible
			if (room === PS.leftPanel) pos = { top: 56, right: PS.leftPanelWidth };
			if (room === PS.rightPanel) pos = { top: 56, left: PS.leftPanelWidth };
		}

		if (!pos) return { display: 'none' };

		let top: number | null = (pos.top || 0);
		let height: number | null = null;
		let bottom: number | null = (pos.bottom || 0);
		if (bottom > 0 || top < 0) {
			height = bottom - top;
			if (height < 0) throw new RangeError("Invalid pos range");
			if (top < 0) top = null;
			else bottom = null;
		}

		let left: number | null = (pos.left || 0);
		let width: number | null = null;
		let right: number | null = (pos.right || 0);
		if (right > 0 || left < 0) {
			width = right - left - 1;
			if (width < 0) throw new RangeError("Invalid pos range");
			if (left < 0) left = null;
			else right = null;
		}

		return {
			display: 'block',
			top: top === null ? `auto` : `${top}px`,
			height: height === null ? `auto` : `${height}px`,
			bottom: bottom === null ? `auto` : `${-bottom}px`,
			left: left === null ? `auto` : `${left}px`,
			width: width === null ? `auto` : `${width}px`,
			right: right === null ? `auto` : `${-right}px`,
		};
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
		let offset = room.parentElem.getBoundingClientRect();
		let sourceWidth = offset.width;
		let sourceHeight = offset.height;

		let availableHeight = document.documentElement.clientHeight;
		let height = room.height;
		width = width || room.width;

		if (room.rightPopup) {

			if (availableHeight > offset.top + height + 5 &&
				(offset.top < availableHeight * 2 / 3 || offset.top + 200 < availableHeight)) {
				style.top = offset.top;
			} else if (offset.top + sourceHeight >= height) {
				style.bottom = Math.max(availableHeight - offset.top - sourceHeight, 0);
			} else {
				style.top = Math.max(0, availableHeight - height);
			}
			let offsetLeft = offset.left + sourceWidth;
			if (width !== 'auto' && offsetLeft + width > document.documentElement.clientWidth) {
				style.right = 1;
			} else {
				style.left = offsetLeft;
			}

		} else {

			if (availableHeight > offset.top + sourceHeight + height + 5 &&
				(offset.top + sourceHeight < availableHeight * 2 / 3 || offset.top + sourceHeight + 200 < availableHeight)) {
				style.top = offset.top + sourceHeight;
			} else if (height + 5 <= offset.top) {
				style.bottom = Math.max(availableHeight - offset.top, 0);
			} else if (height + 10 < availableHeight) {
				style.bottom = 5;
			} else {
				style.top = 0;
			}

			let availableWidth = document.documentElement.clientWidth - offset.left;
			if (width !== 'auto' && availableWidth < width + 10) {
				style.right = 10;
			} else {
				style.left = offset.left;
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
			if (room.location === 'left' || room.location === 'right') {
				rooms.push(this.renderRoom(room));
			}
		}
		return <div class="ps-frame">
			<PSHeader style={{ top: 0, left: 0, right: 0, height: '50px' }} />
			{rooms}
			{PS.popups.map(roomid => this.renderPopup(PS.rooms[roomid]!))}
		</div>;
	}
}

type PanelPosition = { top?: number, bottom?: number, left?: number, right?: number } | null;

export function SanitizedHTML(props: { children: string }) {
	return <div dangerouslySetInnerHTML={{ __html: BattleLog.sanitizeHTML(props.children) }} />;
}
