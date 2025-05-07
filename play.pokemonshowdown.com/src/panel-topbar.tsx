/**
 * Topbar Panel
 *
 * Topbar view - handles the topbar and some generic popups.
 *
 * Also handles global drag-and-drop support.
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

import preact from "../js/lib/preact";
import { PS, type PSRoom, type RoomID } from "./client-main";
import { PSView } from "./panels";
import type { Battle } from "./battle";
import { BattleLog } from "./battle-log"; // optional

window.addEventListener('drop', e => {
	console.log('drop ' + e.dataTransfer!.dropEffect);
	const target = e.target as HTMLElement;
	if ((target as HTMLInputElement).type?.startsWith("text")) {
		PS.dragging = null;
		return; // Ignore text fields
	}

	// The default team drop action for Firefox is to open the team as a
	// URL, which needs to be prevented.
	// The default file drop action for most browsers is to open the file
	// in the tab, which is generally undesirable anyway.
	e.preventDefault();
	PS.dragging = null;
	PS.updateAutojoin();
});
window.addEventListener('dragend', e => {
	e.preventDefault();
	PS.dragging = null;
});
window.addEventListener('dragover', e => {
	// this prevents the bounce-back animation
	e.preventDefault();
});

export class PSHeader extends preact.Component<{ style: object }> {
	static toggleMute = (e: Event) => {
		PS.prefs.set('mute', !PS.prefs.mute);
		PS.update();
	};
	static handleDragEnter = (e: DragEvent) => {
		console.log('dragenter ' + e.dataTransfer!.dropEffect);
		e.preventDefault();
		if (!PS.dragging) return; // TODO: handle dragging other things onto roomtabs
		/** the element being passed over */
		const target = e.currentTarget as HTMLAnchorElement;

		const draggingRoom = PS.dragging.roomid;
		if (draggingRoom === null) return;

		const draggedOverRoom = PS.router.extractRoomID(target.href);
		if (draggedOverRoom === null) return; // should never happen
		if (draggingRoom === draggedOverRoom) return;

		const leftIndex = PS.leftRoomList.indexOf(draggedOverRoom);
		if (leftIndex >= 0) {
			PS.dragOnto(PS.rooms[draggingRoom]!, 'left', leftIndex);
		} else {
			const rightIndex = PS.rightRoomList.indexOf(draggedOverRoom);
			if (rightIndex >= 0) {
				PS.dragOnto(PS.rooms[draggingRoom]!, 'right', rightIndex);
			} else {
				// eslint-disable-next-line no-useless-return
				return;
			}
		}

		// dropEffect !== 'none' prevents bounce-back animation in
		// Chrome/Safari/Opera
		// if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
	};
	static handleDragStart = (e: DragEvent) => {
		const roomid = PS.router.extractRoomID((e.currentTarget as HTMLAnchorElement).href);
		if (!roomid) return; // should never happen

		PS.dragging = { type: 'room', roomid };
	};
	static roomInfo(room: PSRoom) {
		const RoomType = PS.roomTypes[room.type];
		let icon = RoomType?.icon || <i class="fa fa-file-text-o" aria-hidden></i>;
		let title = room.title;
		switch (room.type) {
		case 'battle':
			let idChunks = room.id.slice(7).split('-');
			let formatName;
			// TODO: relocate to room implementation
			if (idChunks.length <= 1) {
				if (idChunks[0] === 'uploadedreplay') formatName = 'Uploaded Replay';
			} else {
				formatName = window.BattleLog ? BattleLog.formatName(idChunks[0]) : idChunks[0];
			}
			if (!title) {
				let battle = (room as any).battle as Battle | undefined;
				let p1 = battle?.p1?.name || '';
				let p2 = battle?.p2?.name || '';
				if (p1 && p2) {
					title = `${p1} v. ${p2}`;
				} else if (p1 || p2) {
					title = `${p1}${p2}`;
				} else {
					title = `(empty room)`;
				}
			}
			icon = <i class="text">{formatName}</i>;
			break;
		case 'html':
		default:
			if (title.startsWith('[')) {
				let closeBracketIndex = title.indexOf(']');
				if (closeBracketIndex > 0) {
					icon = <i class="text">{title.slice(1, closeBracketIndex)}</i>;
					title = title.slice(closeBracketIndex + 1);
					break;
				}
			}
			break;
		}
		return { icon, title };
	}
	static renderRoomTab(id: RoomID, noAria?: boolean) {
		const room = PS.rooms[id];
		if (!room) return null;
		const closable = (id === '' || id === 'rooms' ? '' : ' closable');
		const cur = PS.isVisible(room) ? ' cur' : '';
		let notifying = room.isSubtleNotifying ? ' subtle-notifying' : '';
		let hoverTitle = '';
		let notifications = room.notifications;
		if (id === '') {
			for (const roomid of PS.miniRoomList) {
				const miniNotifications = PS.rooms[roomid]?.notifications;
				if (miniNotifications?.length) notifications = [...notifications, ...miniNotifications];
			}
		}
		if (notifications.length) {
			notifying = ' notifying';
			for (const notif of notifications) {
				if (!notif.body) continue;
				hoverTitle += `${notif.title}\n${notif.body}\n`;
			}
		}
		let className = `roomtab button${notifying}${closable}${cur}`;

		let { icon, title: roomTitle } = PSHeader.roomInfo(room);
		if (room.type === 'rooms' && PS.leftPanelWidth !== null) roomTitle = '';
		if (room.type === 'battle') className += ' roomtab-battle';

		let closeButton = null;
		if (closable) {
			closeButton = <button class="closebutton" name="closeRoom" value={id} aria-label="Close">
				<i class="fa fa-times-circle" aria-hidden></i>
			</button>;
		}
		const aria: Record<string, string> = noAria ? {} : {
			"role": "tab", "id": `roomtab-${id}`, "aria-selected": cur ? "true" : "false",
		};
		if (id === 'rooms') aria['aria-label'] = "Join chat";
		return <li class={id === '' ? 'home-li' : ''}>
			<a
				class={className} href={`/${id}`} draggable={true} title={hoverTitle || undefined}
				onDragEnter={this.handleDragEnter} onDragStart={this.handleDragStart}
				{...aria}
			>
				{icon} {roomTitle}
			</a>
			{closeButton}
		</li>;
	}
	handleRoomTabOverflow = () => {
		if (PS.leftPanelWidth === null || !this.base) return;

		const userbarLeft = this.base.querySelector('div.userbar')?.getBoundingClientRect()?.left;
		const plusTabRight = this.base.querySelector('a.roomtab[aria-label="Join chat"]')?.getBoundingClientRect()?.right;
		const overflow = this.base.querySelector<HTMLElement>('.overflow');

		if (!overflow || !userbarLeft || !plusTabRight) return;

		if (plusTabRight > userbarLeft - 3) {
			overflow.style.display = 'block';
		} else {
			overflow.style.display = 'none';
		}
	};
	override componentDidMount() {
		PS.user.subscribe(() => {
			this.forceUpdate();
		});
		window.addEventListener('resize', this.handleRoomTabOverflow);
		this.handleRoomTabOverflow();
	}
	override componentDidUpdate() {
		this.handleRoomTabOverflow();
	}
	renderUser() {
		if (!PS.connected) {
			return <button class="button" disabled><em>Offline</em></button>;
		}
		if (PS.user.initializing) {
			return <button class="button" disabled><em>Connecting...</em></button>;
		}
		if (!PS.user.named) {
			return <a class="button" href="login">Choose name</a>;
		}
		const userColor = window.BattleLog && `color:${BattleLog.usernameColor(PS.user.userid)}`;
		return <span class="username" style={userColor}>
			<span class="usernametext">{PS.user.name}</span>
		</span>;
	}
	renderVertical() {
		return <div
			id="header" class="header-vertical" style={this.props.style} onClick={PSView.scrollToHeader} role="navigation"
		>
			<div class="maintabbarbottom"></div>
			<div class="scrollable-part">
				<img
					class="logo"
					src={`https://${Config.routes.client}/favicon-256.png`}
					alt="Pokémon Showdown! (beta)"
					width="50" height="50"
				/>
				<div class="tablist" role="tablist">
					<ul>
						{PSHeader.renderRoomTab(PS.leftRoomList[0])}
					</ul>
					<ul>
						{PS.leftRoomList.slice(1).map(roomid => PSHeader.renderRoomTab(roomid))}
					</ul>
					<ul class="siderooms">
						{PS.rightRoomList.map(roomid => PSHeader.renderRoomTab(roomid))}
					</ul>
				</div>
			</div>
			<div class="userbar">
				{this.renderUser()} {}
				<div style="float:right">
					<button class="icon button" data-href="volume" title="Sound" aria-label="Sound" onDblClick={PSHeader.toggleMute}>
						<i class={PS.prefs.mute ? 'fa fa-volume-off' : 'fa fa-volume-up'}></i>
					</button> {}
					<button class="icon button" data-href="options" title="Options" aria-label="Options">
						<i class="fa fa-cog" aria-hidden></i>
					</button>
				</div>
			</div>
		</div>;
	}
	override render() {
		if (PS.leftPanelWidth === null) {
			if (!PSView.textboxFocused) {
				document.documentElement.classList?.add('scroll-snap-enabled');
			}
			return this.renderVertical();
		} else {
			document.documentElement.classList?.remove('scroll-snap-enabled');
		}

		return <div id="header" class="header" style={this.props.style} role="navigation">
			<div class="maintabbarbottom"></div>
			<div class="tabbar maintabbar"><div class="inner-1" role={PS.leftPanelWidth ? 'none' : 'tablist'}><div class="inner-2">
				<ul class="maintabbar-left" style={{ width: `${PS.leftPanelWidth}px` }} role={PS.leftPanelWidth ? 'tablist' : 'none'}>
					<li>
						<img
							class="logo"
							src={`https://${Config.routes.client}/favicon-256.png`}
							alt="Pokémon Showdown! (beta)"
							width="48" height="48"
						/>
					</li>
					{PSHeader.renderRoomTab(PS.leftRoomList[0])}
					{PS.leftRoomList.slice(1).map(roomid => PSHeader.renderRoomTab(roomid))}
				</ul>
				<ul class="maintabbar-right" role={PS.leftPanelWidth ? 'tablist' : 'none'}>
					{PS.rightRoomList.map(roomid => PSHeader.renderRoomTab(roomid))}
				</ul>
			</div></div></div>
			<div class="overflow">
				<button name="tablist" class="button" data-href="roomtablist" aria-label="All tabs" type="button">
					<i class="fa fa-caret-down" aria-hidden></i>
				</button>
			</div>
			<div class="userbar">
				{this.renderUser()} {}
				<button class="icon button" data-href="volume" title="Sound" aria-label="Sound" onDblClick={PSHeader.toggleMute}>
					<i class={PS.prefs.mute ? 'fa fa-volume-off' : 'fa fa-volume-up'}></i>
				</button> {}
				<button class="icon button" data-href="options" title="Options" aria-label="Options">
					<i class="fa fa-cog" aria-hidden></i>
				</button>
			</div>
		</div>;
	}
}

export class PSMiniHeader extends preact.Component {
	override componentDidMount() {
		window.addEventListener('scroll', this.handleScroll);
	}
	override componentWillUnmount() {
		window.removeEventListener('scroll', this.handleScroll);
	}
	handleScroll = () => {
		this.forceUpdate();
	};
	override render() {
		if (PS.leftPanelWidth !== null) return null;

		const minWidth = Math.min(500, Math.max(320, document.body.offsetWidth - 9));
		const { icon, title } = PSHeader.roomInfo(PS.panel);
		const userColor = window.BattleLog && `color:${BattleLog.usernameColor(PS.user.userid)}`;
		const showMenuButton = document.documentElement.offsetWidth >= document.documentElement.scrollWidth;
		const notifying = (
			showMenuButton && !window.scrollX && Object.values(PS.rooms).some(room => room!.notifications.length)
		) ? ' notifying' : '';
		const menuButton = showMenuButton ? (
			null
		) : window.scrollX ? (
			<button onClick={PSView.scrollToHeader} class={`mini-header-left ${notifying}`} aria-label="Menu">
				<i class="fa fa-arrow-left" aria-hidden></i>
			</button>
		) : (
			<button onClick={PSView.scrollToRoom} class="mini-header-left" aria-label="Menu">
				<i class="fa fa-arrow-right" aria-hidden></i>
			</button>
		);
		return <div class="mini-header" style={{ minWidth: `${minWidth}px` }}>
			{menuButton}
			{icon} {title}
			<button data-href="options" class="mini-header-right" aria-label="Options">
				{PS.user.named ? <strong style={userColor}>{PS.user.name}</strong> : <i class="fa fa-cog" aria-hidden></i>}
			</button>
		</div>;
	}
}

preact.render(<PSView />, document.body, document.getElementById('ps-frame')!);
