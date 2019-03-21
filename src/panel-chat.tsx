/**
 * Chat panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

class ChatRoom extends PSRoom {
	readonly classType: string = 'chat';
	users: {[userid: string]: string} = {};
	userCount = 0;
	pmTarget: string | null = null;
	constructor(options: RoomOptions) {
		super(options);
		if (options.pmTarget) this.pmTarget = options.pmTarget as string;
		this.updateTarget(true);
		if (!this.connected) {
			if (!this.pmTarget) PS.send(`|/join ${this.id}`);
			this.connected = true;
		}
	}
	updateTarget(force?: boolean) {
		if (this.id.startsWith('pm-')) {
			const [id1, id2] = this.id.slice(3).split('-');
			if (id1 === PS.user.userid && toId(this.pmTarget) !== id2) {
				this.pmTarget = id2;
			} else if (id2 === PS.user.userid && toId(this.pmTarget) !== id1) {
				this.pmTarget = id1;
			} else if (!force) {
				return;
			}
			this.title = `[PM] ${this.pmTarget}`;
		}
	}
	send(line: string) {
		this.updateTarget();
		if (this.pmTarget) {
			PS.send(`|/pm ${this.pmTarget}, ${line}`);
			return;
		}
		super.send(line);
	}
	receive(line: string) {
		this.update(line);
	}
	setUsers(count: number, usernames: string[]) {
		this.userCount = count;
		this.users = {};
		for (const username of usernames) {
			const userid = toId(username);
			this.users[userid] = username;
		}
		this.update('');
	}
	addUser(username: string) {
		const userid = toId(username);
		if (!(userid in this.users)) this.userCount++;
		this.users[userid] = username;
		this.update('');
	}
	removeUser(username: string, noUpdate?: boolean) {
		const userid = toId(username);
		if (userid in this.users) {
			this.userCount--;
			delete this.users[userid];
		}
		if (!noUpdate) this.update('');
	}
	renameUser(username: string, oldUsername: string) {
		this.removeUser(oldUsername, true);
		this.addUser(username);
		this.update('');
	}
	destroy() {
		if (this.pmTarget) this.connected = false;
		super.destroy();
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
				<label style={{color: BattleLog.usernameColor(PS.user.userid)}}>{PS.user.name}:</label>
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

class ChatPanel extends PSRoomPanel<ChatRoom> {
	send = (text: string) => {
		this.props.room.send(text);
	};
	focus() {
		this.base!.querySelector('textarea')!.focus();
	}
	focusIfNoSelection = () => {
		const selection = window.getSelection();
		if (selection.type === 'Range') return;
		this.focus();
	};
	render() {
		return <PSPanelWrapper room={this.props.room}>
			<div class="tournament-wrapper hasuserlist"></div>
			<ChatLog class="chat-log hasuserlist" room={this.props.room} onClick={this.focusIfNoSelection} />
			<ChatTextEntry room={this.props.room} onMessage={this.send} />
			<ChatUserList room={this.props.room} />
		</PSPanelWrapper>;
	}
}

class ChatUserList extends preact.Component<{room: ChatRoom}> {
	subscription: PSSubscription | null = null;
	componentDidMount() {
		this.subscription = this.props.room.subscribe(msg => {
			if (!msg) this.forceUpdate();
		});
	}
	componentWillUnmount() {
		if (this.subscription) this.subscription.unsubscribe();
	}
	render() {
		const room = this.props.room;
		let userList = Object.entries(room.users) as [ID, string][];
		userList.sort(ChatUserList.compareUsers);
		function colorStyle(userid: ID) {
			return {color: BattleLog.usernameColor(userid)};
		}
		return <ul class="userlist">
			<li class="userlist-count" style="text-align:center;padding:2px 0"><small>{room.userCount} users</small></li>
			{userList.map(([userid, name]) => {
				const groupSymbol = name.charAt(0);
				const group = PS.server.groups[groupSymbol] || {type: 'user', order: 0};
				return <li key={userid}><button class="userbutton username" data-name={name}>
					<em class={`group${['leadership', 'staff'].includes(group.type!) ? ' staffgroup' : ''}`}>{groupSymbol}</em>
					{group.type === 'leadership' ?
						<strong><em style={colorStyle(userid)}>{name.substr(1)}</em></strong>
					: group.type === 'staff' ?
						<strong style={colorStyle(userid)}>{name.substr(1)}</strong>
				:
						<span style={colorStyle(userid)}>{name.substr(1)}</span>
				}
				</button></li>;
			})}
		</ul>;
	}
	static compareUsers([userid1, name1]: [ID, string], [userid2, name2]: [ID, string]) {
		if (userid1 === userid2) return 0;
		let rank1 = (
			PS.server.groups[name1.charAt(0)] || {order: 10006.5}
		).order;
		let rank2 = (
			PS.server.groups[name2.charAt(0)] || {order: 10006.5}
		).order;

		if (userid1 === 'zarel' && rank1 === 10003) rank1 = 10000.5;
		if (userid2 === 'zarel' && rank2 === 10003) rank2 = 10000.5;
		if (rank1 !== rank2) return rank1 - rank2;
		return (userid1 > userid2 ? 1 : -1);
	}
}

class ChatLog extends preact.Component<{class: string, room: ChatRoom, onClick?: (e: Event) => void}> {
	log: BattleLog = null!;
	subscription: PSSubscription | null = null;
	componentDidMount() {
		this.log = new BattleLog(this.base! as HTMLDivElement);
		this.subscription = this.props.room.subscribe(msg => {
			if (!msg) return;
			const tokens = PS.lineParse(msg);
			switch (tokens[0]) {
			case 'title':
				this.props.room.title = tokens[1];
				PS.update();
				return;
			case 'users':
				const usernames = tokens[1].split(',');
				const count = parseInt(usernames.shift()!, 10);
				this.props.room.setUsers(count, usernames);
				return;
			case 'join': case 'j': case 'J':
				this.props.room.addUser(tokens[1]);
				break;
			case 'leave': case 'l': case 'L':
				this.props.room.removeUser(tokens[1]);
				break;
			case 'name': case 'n': case 'N':
				this.props.room.renameUser(tokens[1], tokens[2]);
				break;
			}
			this.log.add(tokens);
		});
	}
	componentWillUnmount() {
		if (this.subscription) this.subscription.unsubscribe();
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
