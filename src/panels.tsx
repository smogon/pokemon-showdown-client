/**
 * Panels
 *
 * Main view - sets up the frame, topbar, and the generic panels.
 *
 * Also sets up global event listeners.
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

class PSHeader extends preact.Component<{style: {}}> {
	renderRoomTab(id: RoomID) {
		const room = PS.rooms[id];
		const closable = (id === '' || id === 'rooms' ? '' : ' closable');
		const cur = PS.isVisible(room) ? ' cur' : '';
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
				<ul class="siderooms" style={{float: 'none', marginLeft: PS.leftRoomWidth - 144}}>
					{PS.rightRoomList.map(roomid => this.renderRoomTab(roomid))}
				</ul>
			</div></div>
			<div class="userbar">
				<span class="username" data-name=" Guest" style="color:hsl(96,67%,36%);"><i class="fa fa-user" style="color:#779EC5"></i>  Guest</span>{' '}
				<button class="icon button" name="openSounds" title="Sound" aria-label="Sound"><i class="fa fa-volume-up"></i></button>{' '}
				<button class="icon button" name="openOptions" title="Options" aria-label="Options"><i class="fa fa-cog"></i></button>
			</div>
		</div>;
	}
}

class PSRoomPanel extends preact.Component<{style: {}, room: PSRoom}> {
	render() {
		return <div class="ps-room" id={`room-${this.props.room.id}`} style={this.props.style}>
			<div class="mainmessage"><p>Loading...</p></div>
		</div>;
	}
}

class PSMain extends preact.Component {
	constructor() {
		super();
		PS.subscribe(() => this.forceUpdate());
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
	renderRoom(room: PSRoom) {
		let pos = null;
		if (PS.leftRoomWidth === 0) {
			// one panel visible
			if (room === (PS.rightRoomFocused ? PS.rightRoom : PS.leftRoom)) {
				pos = {top: 56};
			}
		} else {
			// both panels visible
			if (room === PS.leftRoom) pos = {top: 56, right: PS.leftRoomWidth};
			if (room === PS.rightRoom) pos = {top: 56, left: PS.leftRoomWidth};
		}
		if (room.type === 'mainmenu') {
			return <MainMenuPanel key={room.id} style={this.posStyle(pos)} room={room} />;
		}
		if (room.type === 'rooms') {
			return <RoomsPanel key={room.id} style={this.posStyle(pos)} room={room} />;
		}
		return <PSRoomPanel key={room.id} style={this.posStyle(pos)} room={room} />;
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
