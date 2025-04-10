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
import { PS, type RoomID } from "./client-main";
import { PSMain } from "./panels";
import type { Battle } from "./battle";
import { BattleLog } from "./battle-log";

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
	handleDragEnter = (e: DragEvent) => {
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
	handleDragStart = (e: DragEvent) => {
		const roomid = PS.router.extractRoomID((e.currentTarget as HTMLAnchorElement).href);
		if (!roomid) return; // should never happen

		PS.dragging = { type: 'room', roomid };
	};
	renderRoomTab(id: RoomID) {
		const room = PS.rooms[id];
		if (!room) return null;
		const closable = (id === '' || id === 'rooms' ? '' : ' closable');
		const cur = PS.isVisible(room) ? ' cur' : '';
		const notifying = room.notifications.length ? ' notifying' : room.isSubtleNotifying ? ' subtle-notifying' : '';
		const RoomType = PS.roomTypes[room.type];
		let className = `roomtab button${notifying}${closable}${cur}`;
		let icon = RoomType?.icon || <i class="fa fa-file-text-o"></i>;
		let title = room.title;
		let closeButton = null;
		switch (room.type) {
		case 'rooms':
			title = '';
			break;
		case 'battle':
			let idChunks = id.substr(7).split('-');
			let formatName;
			// TODO: relocate to room implementation
			if (idChunks.length <= 1) {
				if (idChunks[0] === 'uploadedreplay') formatName = 'Uploaded Replay';
			} else {
				formatName = BattleLog.formatName(idChunks[0]);
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
		if (closable) {
			closeButton = <button class="closebutton" name="closeRoom" value={id} aria-label="Close">
				<i class="fa fa-times-circle"></i>
			</button>;
		}
		const ariaLabel = id === 'rooms' ? { "aria-label": "Join chat" } : {};
		return <li>
			<a
				class={className} href={`/${id}`} draggable={true}
				onDragEnter={this.handleDragEnter} onDragStart={this.handleDragStart}
				{...ariaLabel}
			>
				{icon} <span>{title}</span>
			</a>
			{closeButton}
		</li>;
	}
	override componentDidMount() {
		PS.user.subscribe(() => {
			this.forceUpdate();
		});
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
		const userColor = window.BattleLog && { color: BattleLog.usernameColor(PS.user.userid) };
		return <span class="username" style={userColor}>
			<i class="fa fa-user" style="color:#779EC5"></i> <span class="usernametext">{PS.user.name}</span>
		</span>;
	}
	override render() {
		return <div id="header" class="header" style={this.props.style}>
			<img
				class="logo"
				src={`https://${Config.routes.client}/favicon-256.png`}
				alt="Pokémon Showdown! (beta)"
				width="50" height="50"
			/>
			<div class="maintabbarbottom"></div>
			<div class="tabbar maintabbar"><div class="inner">
				<ul>
					{this.renderRoomTab(PS.leftRoomList[0])}
				</ul>
				<ul>
					{PS.leftRoomList.slice(1).map(roomid => this.renderRoomTab(roomid))}
				</ul>
				<ul class="siderooms" style={{ float: 'none', marginLeft: PS.leftPanelWidth - 52 }}>
					{PS.rightRoomList.map(roomid => this.renderRoomTab(roomid))}
				</ul>
			</div></div>
			<div class="userbar">
				{this.renderUser()} {}
				<button class="icon button" name="joinRoom" value="volume" title="Sound" aria-label="Sound">
					<i class={PS.prefs.mute ? 'fa fa-volume-off' : 'fa fa-volume-up'}></i>
				</button> {}
				<button class="icon button" name="joinRoom" value="options" title="Options" aria-label="Options">
					<i class="fa fa-cog"></i>
				</button>
			</div>
		</div>;
	}
}

preact.render(<PSMain />, document.body, document.getElementById('ps-frame')!);
