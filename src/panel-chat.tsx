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

class ChatTextEntry extends preact.Component<{room: PSRoom, onMessage: (msg: string) => void}> {
	subscription: PSSubscription | null = null;
	componentDidMount() {
		this.subscription = PS.user.subscribe(() => {
			this.forceUpdate();
		});
		if (this.base) this.update();
	}
	componentWillUnmount() {
		if (this.subscription) {
			this.subscription.unsubscribe();
			this.subscription = null;
		}
	}
	update = (e?: Event) => {
		let elem;
		if (e) {
			elem = e.currentTarget as HTMLTextAreaElement;
		} else if (this.base) {
			elem = this.base.children[0].children[1] as HTMLTextAreaElement;
		} else {
			return;
		}
		elem.style.height = '12px';
		const newHeight = Math.min(Math.max(elem.scrollHeight - 2, 16), 600);
		elem.style.height = '' + newHeight + 'px';
	};
	focusIfNoSelection = (e: Event) => {
		if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
		const selection = window.getSelection();
		if (selection.type === 'Range') return;
		const elem = this.base!.children[0].children[1] as HTMLTextAreaElement;
		elem.focus();
	};
	keyPress = (e: KeyboardEvent) => {
		let elem = e.currentTarget as HTMLTextAreaElement;
		if (e.keyCode === 13 && !e.shiftKey) {
			this.props.onMessage(elem.value);
			elem.value = '';
			this.update();
			e.preventDefault();
			e.stopImmediatePropagation();
			return;
		}
	};
	render() {
		return <div class="chat-log-add hasuserlist" onClick={this.focusIfNoSelection}>
			<form class="chatbox">
				<label>{PS.user.name}</label>
				<textarea
					class={this.props.room.connected ? 'textbox' : 'textbox disabled'}
					autofocus
					rows={1}
					onInput={this.update}
					onKeyPress={this.keyPress}
					style={{resize: 'none', width: '100%', height: '16px', padding: '2px 3px 1px 3px'}}
					placeholder={PS.focusPreview(this.props.room)}
				/>
			</form>
		</div>;
	}
}

class ChatPanel extends preact.Component<{style: {}, room: PSRoom}> {
	send = (text: string) => {
		this.props.room.send(text);
	};
	componentDidMount() {
		if (PS.room === this.props.room) this.focus();
		this.props.room.onParentEvent = (id: string, e?: Event) => {
			if (id === 'focus') this.focus();
		};
	}
	componentWillUnmount() {
		this.props.room.onParentEvent = null;
	}
	focus() {
		this.base!.querySelector('textarea')!.focus();
	}
	focusIfNoSelection = () => {
		const selection = window.getSelection();
		if (selection.type === 'Range') return;
		this.focus();
	};
	render() {
		return <div class="ps-room ps-room-light scrollabel" id={`room-${this.props.room.id}`} style={this.props.style}>
			<div class="tournament-wrapper hasuserlist"></div>
			<ChatLog class="chat-log hasuserlist" room={this.props.room} onClick={this.focusIfNoSelection} />
			<ChatTextEntry room={this.props.room} onMessage={this.send} />
			<ul class="userlist"></ul>
		</div>;
	}
}

class ChatLog extends preact.Component<{class: string, room: PSRoom, onClick?: (e: Event) => void}> {
	log: BattleLog = null!;
	componentDidMount() {
		this.log = new BattleLog(this.base! as HTMLDivElement);
		this.props.room.subscribe(msg => {
			if (!msg) return;
			const tokens = PS.lineParse(msg);
			switch (tokens[0]) {
			case 'title':
				this.props.room.title = tokens[1];
				PS.update();
				return;
			}
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
		return <div class={this.props.class} role="log" onClick={this.props.onClick}></div>;
	}
}

PS.roomTypes['chat'] = {
	Model: ChatRoom,
	Component: ChatPanel,
};
PS.updateRoomTypes();
