/**
 * Room-list panel (default right-panel)
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

class RoomsRoom extends PSRoom {
	readonly classType: string = 'mainmenu';
}

class RoomsPanel extends PSRoomPanel {
	render() {
		return <PSPanelWrapper room={this.props.room}>
			<div class="mainmessage">
				<p>[insert room list here]</p>
				<p><a href="/lobby">Lobby</a></p>
				<p><a href="/tours">Tours</a></p>
			</div>
		</PSPanelWrapper>;
	}
}

PS.roomTypes['rooms'] = {
	Model: RoomsRoom,
	Component: RoomsPanel,
};
PS.updateRoomTypes();
