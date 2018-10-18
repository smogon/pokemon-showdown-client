/**
 * Room-list panel (default right-panel)
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

// The main menu doesn't really have state, right? We'll just use no model for now

class RoomsPanel extends preact.Component<{style: {}, room: PSRoom}> {
	render() {
		return <div class="ps-room ps-room-light scrollabel" id={`room-${this.props.room.id}`} style={this.props.style}>
			<div class="mainmessage"><p>[insert room list here]</p></div>
		</div>;
	}
}
