/**
 * Room-list panel (default right-panel)
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

class RoomsRoom extends PSRoom {
	readonly classType: string = 'rooms';
	constructor(options: RoomOptions) {
		super(options);
		PS.send(`|/cmd rooms`);
	}
}

class RoomsPanel extends PSRoomPanel {
	hidden = false;
	componentDidMount() {
		super.componentDidMount();
		this.subscriptions.push(PS.user.subscribe(() => {
			if (PS.user.named) PS.send(`|/cmd rooms`);
		}));
	}
	hide = () => {
		this.hidden = true;
		PS.rightRoom = null;
		PS.room = PS.leftRoom;
		this.forceUpdate();
		PS.update();
	};
	render() {
		if (this.hidden && PS.isVisible(this.props.room)) this.hidden = false;
		if (this.hidden) {
			return <PSPanelWrapper room={this.props.room} scrollable>{null}</PSPanelWrapper>;
		}
		const rooms = PS.mainmenu.roomsCache;
		return <PSPanelWrapper room={this.props.room} scrollable><div class="pad">
			<button class="button" style="float:right;font-size:10pt;margin-top:3px" onClick={this.hide}>
				<i class="fa fa-caret-right"></i> Hide
			</button>
			<div class="roomcounters">
				<span
					style="background:transparent url(https://play.pokemonshowdown.com/sprites/smicons-sheet.png?a5) no-repeat scroll -0px -2790px;"
					class="picon icon-left"
					title="Meloetta is PS's mascot! The Aria forme is about using its voice, and represents our chatrooms."
				></span> {}
				<button class="button" data-href="/users" title="Find an online user">
					<strong>{rooms.userCount || '-'}</strong> users online
				</button> {}
				<button class="button" data-href="/battles" title="Watch an active battle">
					<strong>{rooms.battleCount || '-'}</strong> active battles
				</button> {}
				<span
					style="background:transparent url(https://play.pokemonshowdown.com/sprites/smicons-sheet.png?a5) no-repeat scroll -0px -2220px"
					class="picon icon-right"
					title="Meloetta is PS's mascot! The Pirouette forme is Fighting-type, and represents our battles."
				></span>
			</div>
			{rooms.userCount === undefined && <h2>Connecting...</h2>}
			{this.renderRoomList("Official chat rooms", rooms.official)}
			{this.renderRoomList("PSPL winner", rooms.pspl)}
			{this.renderRoomList("Chat rooms", rooms.chat)}
		</div></PSPanelWrapper>;
	}
	renderRoomList(title: string, rooms?: RoomInfo[]) {
		if (!rooms || !rooms.length) return null;
		return <div class="roomlist">
			<h2>{title}</h2>
			{rooms.map(roomInfo => <div>
				<a href={`/${toId(roomInfo.title)}`} class="ilink">
					<small style="float:right">({roomInfo.userCount} users)</small>
					<strong><i class="fa fa-comment-o"></i> {roomInfo.title}<br /></strong>
					<small>{roomInfo.desc}</small>
					{roomInfo.subRooms && <small><br />
						<i class="fa fa-level-up fa-rotate-90"></i> Subrooms: <strong>
							{roomInfo.subRooms.map((roomName, i) => [
								<i class="fa fa-comment-o"></i>, " " + roomName + (i === roomInfo.subRooms!.length - 1 ? "" : ", "),
							])}
						</strong>
					</small>}
				</a>
			</div>)}
		</div>;
	}
}

PS.roomTypes['rooms'] = {
	Model: RoomsRoom,
	Component: RoomsPanel,
};
PS.updateRoomTypes();
