
class PSHeader extends preact.Component<{style: {}}> {
	renderRoomTab(id: RoomID) {
		const room = PS.rooms[id];
		const closable = (id === '' || id === 'rooms' ? '' : ' closable');
		const cur = (room === PS.leftRoom || room === PS.rightRoom ? ' cur' : '');
		let className = `roomtab button${room.notifying}${closable}${cur}`;
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
				formatid = idChunks[idChunks.length - 2];
			}
			if (!title) {
				let battle = (room as any).battle;
				let p1 = (battle && battle.p1 && battle.p1.name) || '';
				let p2 = (battle && battle.p2 && battle.p2.name) || '';
				if (p1 && p2) {
					title = '' + p1 + ' v. ' + p2;
				} else if (p1 || p2) {
					title = '' + p1 + p2;
				} else {
					title = '(empty room)';
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
			closeButton = <button class="closebutton" name="closeRoom" value={id} aria-label="Close"><i class="fa fa-times-circle"></i></button>;
		}
		return <li><a class={className} href={`/${id}`} draggable={true}>{icon} <span>{title}</span></a>{closeButton}</li>;
	}
	render() {
		return <div id="header" class="header" style={this.props.style}>
			<img class="logo" src="https://play.pokemonshowdown.com/pokemonshowdownbeta.png" srcset="https://play.pokemonshowdown.com/pokemonshowdownbeta@2x.png 2x" alt="Pokémon Showdown! (beta)" width="146" height="44" />
			<div class="maintabbarbottom"></div>
			<div class="tabbar maintabbar"><div class="inner">
				<ul>
					{PS.leftRoomList.map(roomid => this.renderRoomTab(roomid))}
				</ul>
				<ul class="siderooms" style={{float: 'none', marginLeft: PS.leftRoomWidth}}>
					{PS.rightRoomList.map(roomid => this.renderRoomTab(roomid))}
				</ul>
			</div></div>
			<div class="userbar">
				<span class="username" data-name=" Guest" style="color:hsl(96,67%,36%);"><i class="fa fa-user" style="color:#779EC5"></i>  Guest</span>
				<button class="icon button" name="openSounds" title="Sound" aria-label="Sound"><i class="fa fa-volume-up"></i></button>
				<button class="icon button" name="openOptions" title="Options" aria-label="Options"><i class="fa fa-cog"></i></button>
			</div>
		</div>;
	}
}

class PSRoomPanel extends preact.Component<{style: {}, roomid: RoomID}> {
	render() {
		return <div class="ps-room" id={`room-${this.props.roomid}`} style={this.props.style}>
			<p>Loading...</p>
		</div>;
	}
}

class PSMain extends preact.Component {
	constructor() {
		super();
		this.updateLayout();
	}
	posStyle(pos: PanelPosition) {
		if (!pos) return {display: 'none'};

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
			width = right - left;
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
		if (PS.leftRoomWidth !== leftRoomWidth) {
			PS.leftRoomWidth = leftRoomWidth;
			PS.update();
		}
	}
	calculateLeftRoomWidth() {
		// If we don't have both a left room and a right room, obviously
		// just show one room
		if (!PS.leftRoom || !PS.rightRoom || PS.onePanelMode) {
			return 0;
		}

		// The rest of this code can assume we have both a left room and a
		// right room, and also want to show both if they fit

		const left = this.getWidthFor(PS.leftRoom);
		const right = this.getWidthFor(PS.rightRoom);
		const available = window.offsetWidth;

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
	renderRoom(room: PSRoom) {
		let pos = null;
		if (PS.leftRoomWidth === 0) {
			if ((PS.rightRoomFocused && room === PS.leftRoom) ||
			(!PS.rightRoomFocused && room === PS.rightRoom)) {
				pos = {top: 50};
			}
		} else {
			if (room === PS.leftRoom) pos = {top: 50, right: PS.leftRoomWidth};
			if (room === PS.rightRoom) pos = {top: 50, left: PS.leftRoomWidth};
		}
		return <PSRoomPanel style={this.posStyle(pos)} roomid={room.id} />;
	}
	render() {
		let rooms = [] as preact.VNode[];
		for (const k in PS.rooms) {
			rooms.push(this.renderRoom(PS.rooms[k]));
		}
		return <div class="ps-frame">
			<PSHeader style={this.posStyle({bottom: 50})} />
			{rooms}
		</div>;
	}
}

type PanelPosition = {top?: number, bottom?: number, left?: number, right?: number} | null;

preact.render(<PSMain />, document.body, document.getElementById('ps-frame')!);
