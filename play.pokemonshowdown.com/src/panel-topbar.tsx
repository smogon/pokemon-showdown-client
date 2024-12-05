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

window.addEventListener('drop', e => {
	console.log('drop ' + e.dataTransfer!.dropEffect);
	const target = e.target as HTMLElement;
	if (/^text/.test((target as HTMLInputElement).type)) {
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

class PSHeader extends preact.Component<{style: {}}> {
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
			this.dragOnto(draggingRoom, 'leftRoomList', leftIndex);
		} else {
			const rightIndex = PS.rightRoomList.indexOf(draggedOverRoom);
			if (rightIndex >= 0) {
				this.dragOnto(draggingRoom, 'rightRoomList', rightIndex);
			} else {
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

		PS.dragging = {type: 'room', roomid};
	};
	dragOnto(fromRoom: RoomID, toRoomList: 'leftRoomList' | 'rightRoomList' | 'miniRoomList', toIndex: number) {
		// one day you will be able to rearrange mainmenu and rooms, but not today
		if (fromRoom === '' || fromRoom === 'rooms') return;

		if (fromRoom === PS[toRoomList][toIndex]) return;
		if (fromRoom === '' && toRoomList === 'miniRoomList') return;

		const roomLists = ['leftRoomList', 'rightRoomList', 'miniRoomList'] as const;
		let fromRoomList;
		let fromIndex = -1;
		for (const roomList of roomLists) {
			fromIndex = PS[roomList].indexOf(fromRoom);
			if (fromIndex >= 0) {
				fromRoomList = roomList;
				break;
			}
		}
		if (!fromRoomList) return; // shouldn't happen

		if (toRoomList === 'leftRoomList' && toIndex === 0) toIndex = 1; // Home is always leftmost
		if (toRoomList === 'rightRoomList' && toIndex === PS.rightRoomList.length - 1) toIndex--; // Rooms is always rightmost

		PS[fromRoomList].splice(fromIndex, 1);
		// if dragging within the same roomlist and toIndex > fromIndex,
		// toIndex is offset by 1 now. Fortunately for us, we want to
		// drag to the right of this tab in that case, so the -1 +1
		// cancel out
		PS[toRoomList].splice(toIndex, 0, fromRoom);

		const room = PS.rooms[fromRoom]!;
		switch (toRoomList) {
		case 'leftRoomList': room.location = 'left'; break;
		case 'rightRoomList': room.location = 'right'; break;
		case 'miniRoomList': room.location = 'mini-window'; break;
		}
		if (fromRoomList !== toRoomList) {
			if (fromRoom === PS.leftRoom.id) {
				PS.leftRoom = PS.mainmenu;
			} else if (PS.rightRoom && fromRoom === PS.rightRoom.id) {
				PS.rightRoom = PS.rooms['rooms']!;
			}
			if (toRoomList === 'rightRoomList') {
				PS.rightRoom = room;
			} else if (toRoomList === 'leftRoomList') {
				PS.leftRoom = room;
			}
		}
		PS.update();
	}
	renderRoomTab(id: RoomID) {
		const room = PS.rooms[id]!;
		const closable = (id === '' || id === 'rooms' ? '' : ' closable');
		const cur = PS.isVisible(room) ? ' cur' : '';
		const notifying = room.notifications.length ? ' notifying' : room.isSubtleNotifying ? ' subtle-notifying' : '';
		let className = `roomtab button${notifying}${closable}${cur}`;
		let icon = null;
		let title = room.title;
		let closeButton = null;
		switch (room.type) {
		case '':
		case 'mainmenu':
			icon = <i class="fa fa-home"></i>;
			break;
		case 'teambuilder':
			icon = <i class="fa fa-pencil-square-o"></i>;
			break;
		case 'ladder':
		case 'ladderformat':
			icon = <i class="fa fa-list-ol"></i>;
			break;
		case 'battles':
			icon = <i class="fa fa-caret-square-o-right"></i>;
			break;
		case 'rooms':
			icon = <i class="fa fa-plus" style="margin:7px auto -6px auto"></i>;
			title = '';
			break;
		case 'battle':
			let idChunks = id.substr(7).split('-');
			let formatid;
			// TODO: relocate to room implementation
			if (idChunks.length <= 1) {
				if (idChunks[0] === 'uploadedreplay') formatid = 'Uploaded Replay';
			} else {
				formatid = idChunks[0];
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
			icon = <i class="text">{formatid}</i>;
			break;
		case 'chat':
			icon = <i class="fa fa-comment-o"></i>;
			break;
		case 'html':
		default:
			if (title.charAt(0) === '[') {
				let closeBracketIndex = title.indexOf(']');
				if (closeBracketIndex > 0) {
					icon = <i class="text">{title.slice(1, closeBracketIndex)}</i>;
					title = title.slice(closeBracketIndex + 1);
					break;
				}
			}
			icon = <i class="fa fa-file-text-o"></i>;
			break;
		}
		if (closable) {
			closeButton = <button class="closebutton" name="closeRoom" value={id} aria-label="Close">
				<i class="fa fa-times-circle"></i>
			</button>;
		}
		return <li>
			<a
				class={className} href={`/${id}`} draggable={true}
				onDragEnter={this.handleDragEnter} onDragStart={this.handleDragStart}
			>
				{icon} <span>{title}</span>
			</a>
			{closeButton}
		</li>;
	}
	renderUser() {
		if (!PS.connected) {
			return <button class="button" disabled><em>Offline</em></button>;
		}
		if (!PS.user.userid) {
			return <button class="button" disabled><em>Connecting...</em></button>;
		}
		if (!PS.user.named) {
			return <a class="button" href="login">Choose name</a>;
		}
		const userColor = window.BattleLog && {color: BattleLog.usernameColor(PS.user.userid)};
		return <span class="username myuser" data-name={PS.user.name} style={userColor}>
			<i class="fa fa-user" style="color:#779EC5"></i> <span class="usernametext">{PS.user.name}</span>
		</span>;
	}
	render() {
		return <div id="header" class="header" style={this.props.style}>
			<img
				class="logo"
				src={`https://${Config.routes.client}/pokemonshowdownbeta.png`}
				srcset={`https://${Config.routes.client}/pokemonshowdownbeta@2x.png 2x`}
				alt="Pokémon Showdown! (beta)"
				width="146" height="44"
			/>
			<div class="maintabbarbottom"></div>
			<div class="tabbar maintabbar"><div class="inner">
				<ul>
					{this.renderRoomTab(PS.leftRoomList[0])}
				</ul>
				<ul>
					{PS.leftRoomList.slice(1).map(roomid => this.renderRoomTab(roomid))}
				</ul>
				<ul class="siderooms" style={{float: 'none', marginLeft: PS.leftRoomWidth - 144}}>
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

/**
 * User popup
 */

class UserRoom extends PSRoom {
	readonly classType = 'user';
	userid: ID;
	name: string;
	isSelf: boolean;
	constructor(options: RoomOptions) {
		super(options);
		this.userid = this.id.slice(5) as ID;
		this.isSelf = (this.userid === PS.user.userid);
		this.name = options.username as string || this.userid;
		if (/[a-zA-Z0-9]/.test(this.name.charAt(0))) this.name = ' ' + this.name;
		PS.send(`|/cmd userdetails ${this.userid}`);
	}
}

class UserPanel extends PSRoomPanel<UserRoom> {
	render() {
		const room = this.props.room;
		const user = PS.mainmenu.userdetailsCache[room.userid] || {userid: room.userid, avatar: '[loading]'};
		const name = room.name.slice(1);

		const group = PS.server.getGroup(room.name);
		let groupName: preact.ComponentChild = group.name || null;
		if (group.type === 'punishment') {
			groupName = <span style='color:#777777'>{groupName}</span>;
		}

		const globalGroup = PS.server.getGroup(user.group);
		let globalGroupName: preact.ComponentChild = globalGroup.name && `Global ${globalGroup.name}` || null;
		if (globalGroup.type === 'punishment') {
			globalGroupName = <span style='color:#777777'>{globalGroupName}</span>;
		}
		if (globalGroup.name === group.name) groupName = null;

		let roomsList: preact.ComponentChild = null;
		if (user.rooms) {
			let battlebuf = [];
			let chatbuf = [];
			let privatebuf = [];
			for (let roomid in user.rooms) {
				if (roomid === 'global') continue;
				const curRoom = user.rooms[roomid];
				let roomrank: preact.ComponentChild = null;
				if (!/[A-Za-z0-9]/.test(roomid.charAt(0))) {
					roomrank = <small style="color: #888; font-size: 100%">{roomid.charAt(0)}</small>;
				}
				roomid = toRoomid(roomid);

				if (roomid.substr(0, 7) === 'battle-') {
					const p1 = curRoom.p1!.substr(1);
					const p2 = curRoom.p2!.substr(1);
					const ownBattle = (PS.user.userid === toUserid(p1) || PS.user.userid === toUserid(p2));
					const roomLink = <a href={`/${roomid}`} class={'ilink' + (ownBattle || roomid in PS.rooms ? ' yours' : '')}
						title={`${p1 || '?'} v. ${p2 || '?'}`}
					>{roomrank}{roomid.substr(7)}</a>;
					if (curRoom.isPrivate) {
						if (privatebuf.length) privatebuf.push(', ');
						privatebuf.push(roomLink);
					} else {
						if (battlebuf.length) battlebuf.push(', ');
						battlebuf.push(roomLink);
					}
				} else {
					const roomLink = <a href={`/${roomid}`} class={'ilink' + (roomid in PS.rooms ? ' yours' : '')}>
						{roomrank}{roomid}
					</a>;
					if (curRoom.isPrivate) {
						if (privatebuf.length) privatebuf.push(", ");
						privatebuf.push(roomLink);
					} else {
						if (chatbuf.length) chatbuf.push(', ');
						chatbuf.push(roomLink);
					}
				}
			}
			if (battlebuf.length) battlebuf.unshift(<br />, <em>Battles:</em>, " ");
			if (chatbuf.length) chatbuf.unshift(<br />, <em>Chatrooms:</em>, " ");
			if (privatebuf.length) privatebuf.unshift(<br />, <em>Private rooms:</em>, " ");
			if (battlebuf.length || chatbuf.length || privatebuf.length) {
				roomsList = <small class="rooms">{battlebuf}{chatbuf}{privatebuf}</small>;
			}
		} else if (user.rooms === false) {
			roomsList = <strong class="offline">OFFLINE</strong>;
		}

		const isSelf = user.userid === PS.user.userid;
		let away = false;
		let status = null;
		if (user.status) {
			away = user.status.startsWith('!');
			status = away ? user.status.slice(1) : user.status;
		}

		return <PSPanelWrapper room={room}>
			<div class="userdetails">
				{user.avatar !== '[loading]' &&
					<img
						class={'trainersprite' + (room.isSelf ? ' yours' : '')}
						src={Dex.resolveAvatar('' + (user.avatar || 'unknown'))}
					/>
				}
				<strong><a href={`//${Config.routes.users}/${user.userid}`} target="_blank" style={away ? {color: '#888888'} : null}>{name}</a></strong><br />
				{status && <div class="userstatus">{status}</div>}
				{groupName && <div class="usergroup roomgroup">{groupName}</div>}
				{globalGroupName && <div class="usergroup globalgroup">{globalGroupName}</div>}
				{user.customgroup && <div class="usergroup globalgroup">{user.customgroup}</div>}
				{roomsList}
			</div>
			{isSelf || !PS.user.named ?
				<p class="buttonbar">
					<button class="button" disabled>Challenge</button> {}
					<button class="button" disabled>Chat</button>
				</p>
			:
				<p class="buttonbar">
					<button class="button" data-href={`/challenge-${user.userid}`}>Challenge</button> {}
					<button class="button" data-href={`/pm-${user.userid}`}>Chat</button> {}
					<button class="button disabled" name="userOptions">{'\u2026'}</button>
				</p>
			}
			{isSelf && <hr />}
			{isSelf && <p class="buttonbar" style="text-align: right">
				<button class="button disabled" name="login"><i class="fa fa-pencil"></i> Change name</button> {}
				<button class="button" name="cmd" value="/logout"><i class="fa fa-power-off"></i> Log out</button>
			</p>}
		</PSPanelWrapper>;
	}
}

PS.roomTypes['user'] = {
	Model: UserRoom,
	Component: UserPanel,
};

class VolumePanel extends PSRoomPanel {
	setVolume = (e: Event) => {
		const slider = e.currentTarget as HTMLInputElement;
		PS.prefs.set(slider.name as 'effectvolume', Number(slider.value));
		this.forceUpdate();
	};
	setMute = (e: Event) => {
		const checkbox = e.currentTarget as HTMLInputElement;
		PS.prefs.set('mute', !!checkbox.checked);
		PS.update();
	};
	componentDidMount() {
		super.componentDidMount();
		this.subscriptions.push(PS.prefs.subscribe(() => {
			this.forceUpdate();
		}));
	}
	render() {
		const room = this.props.room;
		return <PSPanelWrapper room={room}>
			<h3>Volume</h3>
			<p class="volume">
				<label class="optlabel">Effects: <span class="value">{!PS.prefs.mute && PS.prefs.effectvolume ? `${PS.prefs.effectvolume}%` : `muted`}</span></label>
				{PS.prefs.mute ?
					<em>(muted)</em> :
					<input
						type="range" min="0" max="100" step="1" name="effectvolume" value={PS.prefs.effectvolume}
						onChange={this.setVolume} onInput={this.setVolume} onKeyUp={this.setVolume}
					/>}
			</p>
			<p class="volume">
				<label class="optlabel">Music: <span class="value">{!PS.prefs.mute && PS.prefs.musicvolume ? `${PS.prefs.musicvolume}%` : `muted`}</span></label>
				{PS.prefs.mute ?
					<em>(muted)</em> :
					<input
						type="range" min="0" max="100" step="1" name="musicvolume" value={PS.prefs.musicvolume}
						onChange={this.setVolume} onInput={this.setVolume} onKeyUp={this.setVolume}
					/>}
			</p>
			<p class="volume">
				<label class="optlabel">Notifications: <span class="value">{!PS.prefs.mute && PS.prefs.notifvolume ? `${PS.prefs.notifvolume}%` : `muted`}</span></label>
				{PS.prefs.mute ?
					<em>(muted)</em> :
					<input
						type="range" min="0" max="100" step="1" name="notifvolume" value={PS.prefs.notifvolume}
						onChange={this.setVolume} onInput={this.setVolume} onKeyUp={this.setVolume}
					/>}
			</p>
			<p>
				<label class="checkbox"><input type="checkbox" name="mute" checked={PS.prefs.mute} onChange={this.setMute} /> Mute all</label>
			</p>
		</PSPanelWrapper>;
	}
}

PS.roomTypes['volume'] = {
	Component: VolumePanel,
};

class OptionsPanel extends PSRoomPanel {
	setTheme = (e: Event) => {
		const theme = (e.currentTarget as HTMLSelectElement).value as 'light' | 'dark' | 'system';
		PS.prefs.set('theme', theme);
		this.forceUpdate();
	};
	render() {
		const room = this.props.room;
		return <PSPanelWrapper room={room}>
			<h3>Graphics</h3>
			<p>
				<label class="optlabel">Theme: <select onChange={this.setTheme}>
					<option value="light" selected={PS.prefs.theme === 'light'}>Light</option>
					<option value="dark" selected={PS.prefs.theme === 'dark'}>Dark</option>
					<option value="system" selected={PS.prefs.theme === 'system'}>Match system theme</option>
				</select></label>
			</p>
		</PSPanelWrapper>;
	}
}

PS.roomTypes['options'] = {
	Component: OptionsPanel,
};
