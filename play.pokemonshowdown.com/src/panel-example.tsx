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
	// This is the ID of the panel type. It can be whatever you want, but
	// it must not be the same as any other panel ID.
	static readonly id = 'exampleview';
	// This is a list of panel IDs. This would make <<exampleview>> and
	// <<examples-anything>> open this panel.
	static readonly routes = ['exampleview', 'examples-*'];
	static readonly Model = ExampleRoom;
	// The default title (shown on the tab list). You can edit
	// `ExampleRoom`'s `title` property to change it.
	static readonly title = 'Example View';
	override render() {
		const room = this.props.room;
		return <PSPanelWrapper room={room}>
			<div class="mainmessage"><p>Hello World!</p></div>
		</PSPanelWrapper>;
	}
}

PS.addRoomType(ExamplePanel);

// Example panel with no room

class ExampleViewPanel extends PSRoomPanel {
	static readonly id = 'examplevie2';
	static readonly routes = ['exampleview2'];
	static readonly title = 'Example View';
	override render() {
		const room = this.props.room;
		return <PSPanelWrapper room={room}>
			<div class="mainmessage"><p>Hello World!</p></div>
		</PSPanelWrapper>;
	}
}

PS.addRoomType(ExampleViewPanel);
