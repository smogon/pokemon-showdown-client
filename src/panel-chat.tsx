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
			if (id1 === PS.user.userid && toID(this.pmTarget) !== id2) {
				this.pmTarget = id2;
			} else if (id2 === PS.user.userid && toID(this.pmTarget) !== id1) {
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
			const userid = toID(username);
			this.users[userid] = username;
		}
		this.update('');
	}
	addUser(username: string) {
		const userid = toID(username);
		if (!(userid in this.users)) this.userCount++;
		this.users[userid] = username;
		this.update('');
	}
	removeUser(username: string, noUpdate?: boolean) {
		const userid = toID(username);
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

class ChatTextEntry extends preact.Component<{
	room: PSRoom, onMessage: (msg: string) => void, onKey: (e: KeyboardEvent) => boolean,
}> {
	subscription: PSSubscription | null = null;
	textbox: HTMLTextAreaElement = null!;
	componentDidMount() {
		this.subscription = PS.user.subscribe(() => {
			this.forceUpdate();
		});
		this.textbox = this.base!.children[0].children[1] as HTMLTextAreaElement;
		if (this.base) this.update();
	}
	componentWillUnmount() {
		if (this.subscription) {
			this.subscription.unsubscribe();
			this.subscription = null;
		}
	}
	update = () => {
		const textbox = this.textbox;
		textbox.style.height = `12px`;
		const newHeight = Math.min(Math.max(textbox.scrollHeight - 2, 16), 600);
		textbox.style.height = `${newHeight}px`;
	};
	focusIfNoSelection = (e: Event) => {
		if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
		const selection = window.getSelection()!;
		if (selection.type === 'Range') return;
		const elem = this.base!.children[0].children[1] as HTMLTextAreaElement;
		elem.focus();
	};
	submit() {
		this.props.onMessage(this.textbox.value);
		this.textbox.value = '';
		this.update();
		return true;
	}
	keyDown = (e: KeyboardEvent) => {
		if (this.handleKey(e) || this.props.onKey(e)) {
			e.preventDefault();
			e.stopImmediatePropagation();
		}
	};
	handleKey(e: KeyboardEvent) {
		const cmdKey = ((e.metaKey ? 1 : 0) + (e.ctrlKey ? 1 : 0) === 1) && !e.altKey && !e.shiftKey;
		const textbox = this.textbox;
		if (e.keyCode === 13 && !e.shiftKey) { // Enter key
			return this.submit();
		} else if (e.keyCode === 73 && cmdKey) { // Ctrl + I key
			return this.toggleFormatChar('_');
		} else if (e.keyCode === 66 && cmdKey) { // Ctrl + B key
			return this.toggleFormatChar('*');
		} else if (e.keyCode === 192 && cmdKey) { // Ctrl + ` key
			return this.toggleFormatChar('`');
		// } else if (e.keyCode === 9 && !e.ctrlKey) { // Tab key
		// 	const reverse = !!e.shiftKey; // Shift+Tab reverses direction
		// 	return this.handleTabComplete(this.$chatbox, reverse);
		// } else if (e.keyCode === 38 && !e.shiftKey && !e.altKey) { // Up key
		// 	return this.chatHistoryUp(this.$chatbox, e);
		// } else if (e.keyCode === 40 && !e.shiftKey && !e.altKey) { // Down key
		// 	return this.chatHistoryDown(this.$chatbox, e);
		// } else if (app.user.lastPM && (textbox.value === '/reply' || textbox.value === '/r' || textbox.value === '/R') && e.keyCode === 32) { // '/reply ' is being written
		// 	var val = '/pm ' + app.user.lastPM + ', ';
		// 	textbox.value = val;
		// 	textbox.setSelectionRange(val.length, val.length);
		// 	return true;
		}
		return false;
	}
	toggleFormatChar(formatChar: string) {
		const textbox = this.textbox;
		if (!textbox.setSelectionRange) return false;

		let value = textbox.value;
		let start = textbox.selectionStart;
		let end = textbox.selectionEnd;

		// make sure start and end aren't midway through the syntax
		if (value.charAt(start) === formatChar && value.charAt(start - 1) === formatChar &&
			value.charAt(start - 2) !== formatChar) {
			start++;
		}
		if (value.charAt(end) === formatChar && value.charAt(end - 1) === formatChar &&
			value.charAt(end - 2) !== formatChar) {
			end--;
		}

		// wrap in doubled format char
		const wrap = formatChar + formatChar;
		value = value.substr(0, start) + wrap + value.substr(start, end - start) + wrap + value.substr(end);
		start += 2;
		end += 2;

		// prevent nesting
		const nesting = wrap + wrap;
		if (value.substr(start - 4, 4) === nesting) {
			value = value.substr(0, start - 4) + value.substr(start);
			start -= 4;
			end -= 4;
		} else if (start !== end && value.substr(start - 2, 4) === nesting) {
			value = value.substr(0, start - 2) + value.substr(start + 2);
			start -= 2;
			end -= 4;
		}
		if (value.substr(end, 4) === nesting) {
			value = value.substr(0, end) + value.substr(end + 4);
		} else if (start !== end && value.substr(end - 2, 4) === nesting) {
			value = value.substr(0, end - 2) + value.substr(end + 2);
			end -= 2;
		}

		textbox.value = value;
		textbox.setSelectionRange(start, end);
		return true;
	}
	render() {
		return <div class="chat-log-add hasuserlist" onClick={this.focusIfNoSelection}>
			<form class="chatbox">
				<label style={{color: BattleLog.usernameColor(PS.user.userid)}}>{PS.user.name}:</label>
				<textarea
					class={this.props.room.connected ? 'textbox' : 'textbox disabled'}
					autofocus
					rows={1}
					onInput={this.update}
					onKeyDown={this.keyDown}
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
		const selection = window.getSelection()!;
		if (selection.type === 'Range') return;
		this.focus();
	};
	onKey = (e: KeyboardEvent) => {
		if (e.keyCode === 33) { // Pg Up key
			const chatLog = this.base!.getElementsByClassName('chat-log')[0] as HTMLDivElement;
			chatLog.scrollTop = chatLog.scrollTop - chatLog.offsetHeight + 60;
			return true;
		} else if (e.keyCode === 34) { // Pg Dn key
			const chatLog = this.base!.getElementsByClassName('chat-log')[0] as HTMLDivElement;
			chatLog.scrollTop = chatLog.scrollTop + chatLog.offsetHeight - 60;
			return true;
		}
		return false;
	};
	render() {
		return <PSPanelWrapper room={this.props.room}>
			<div class="tournament-wrapper hasuserlist"></div>
			<ChatLog class="chat-log hasuserlist" room={this.props.room} onClick={this.focusIfNoSelection} />
			<ChatTextEntry room={this.props.room} onMessage={this.send} onKey={this.onKey} />
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
		this.log.updateScroll();
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
