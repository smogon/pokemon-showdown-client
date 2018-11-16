/**
 * Chat panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

class ChatRoom extends PSRoom {
	readonly classType: string = 'chat';
	constructor(options: RoomOptions) {
		super(options);
		if (!this.connected && PS.connected) {
			PS.send(`|/join ${this.id}`);
			this.connected = true;
		}
	}
	receive(line: string) {
		this.update(line);
	}
}

class ChatPanel extends preact.Component<{style: {}, room: PSRoom}> {
	render() {
		return <div class="ps-room ps-room-light scrollabel" id={`room-${this.props.room.id}`} style={this.props.style}>
			<div class="tournament-wrapper hasuserlist"></div>
			<ChatLog class="chat-log hasuserlist" room={this.props.room} />
			<div class="chat-log-add hasuserlist"></div>
			<ul class="userlist"></ul>
		</div>;
	}
}

class ChatLog extends preact.Component<{class: string, room: PSRoom}> {
	log: BattleLog = null!;
	componentDidMount() {
		this.log = new BattleLog(this.base! as HTMLDivElement);
		this.props.room.subscribe(msg => {
			if (!msg) return;
			const tokens = PS.lineParse(msg);
			this.log.add(tokens);
		});
	}
	shouldComponentUpdate(props: {class: string}) {
		if (props.class !== this.props.class) {
			this.base!.className = props.class;
		}
		return false;
	}
	render() {
		return <div class={this.props.class} role="log"></div>;
	}
}

PS.roomTypes['chat'] = {
	Model: ChatRoom,
	Component: ChatPanel,
};
PS.updateRoomTypes();
