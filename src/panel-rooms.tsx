/**
 * Room-list panel (default right-panel)
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

class RoomsRoom extends PSRoom {
	readonly classType: string = 'mainmenu';
}

class RoomsPanel extends preact.Component<{style: {}, room: PSRoom}> {
	render() {
		return <div class="ps-room ps-room-light scrollable" id={`room-${this.props.room.id}`} style={this.props.style}>
			<div class="mainmessage">
				<p>[insert room list here]</p>
				<p><a href="/lobby">Lobby</a></p>
				<p><a href="/tours">Tours</a></p>
			</div>
		</div>;
	}
}

PS.roomTypes['rooms'] = {
	Model: RoomsRoom,
	Component: RoomsPanel,
};
PS.updateRoomTypes();
