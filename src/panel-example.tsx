/**
 * Example Panel
 *
 * Just an example panel for creating new panels/popups
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

class ExampleRoom extends PSRoom {
	readonly classType: string = 'example';
	constructor(options: RoomOptions) {
		super(options);
	}
}

class ExamplePanel extends PSRoomPanel<ExampleRoom> {
	render() {
		const room = this.props.room;
		return <PSPanelWrapper room={room}>
			<div class="mainmessage"><p>Loading...</p></div>
		</PSPanelWrapper>;
	}
}

PS.roomTypes['example'] = {
	Model: ExampleRoom,
	Component: ExamplePanel,
};
