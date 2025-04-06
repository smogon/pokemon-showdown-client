/**
 * Example Panel
 *
 * Just an example panel for creating new panels/popups
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

import { PS, PSRoom, type RoomOptions } from "./client-main";
import { PSPanelWrapper, PSRoomPanel } from "./panels";

// Example room with panel

class ExampleRoom extends PSRoom {
	override readonly classType: string = 'example';
	// eslint-disable-next-line no-useless-constructor
	constructor(options: RoomOptions) {
		super(options);
	}
}

class ExamplePanel extends PSRoomPanel<ExampleRoom> {
	static readonly id = 'exampleview';
	static readonly routes = ['exampleview'];
	static readonly Model = ExampleRoom;
	static readonly title = 'Example View';
	override render() {
		const room = this.props.room;
		return <PSPanelWrapper room={room}>
			<div class="mainmessage"><p>Loading...</p></div>
		</PSPanelWrapper>;
	}
}

PS.addRoomType(ExamplePanel);

// Example panel with no room

class ExampleViewPanel extends PSRoomPanel {
	static readonly id = 'exampleview';
	static readonly routes = ['exampleview'];
	static readonly title = 'Example View';
	override render() {
		const room = this.props.room;
		return <PSPanelWrapper room={room}>
			<div class="mainmessage"><p>Loading...</p></div>
		</PSPanelWrapper>;
	}
}

PS.addRoomType(ExampleViewPanel);
