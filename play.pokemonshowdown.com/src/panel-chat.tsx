/**
 * Chat panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

declare const MiniEdit: typeof import('./miniedit').MiniEdit;
type MiniEdit = import('./miniedit').MiniEdit;
declare const formatText: any;

class ChatRoom extends PSRoom {
	override readonly classType: 'chat' | 'battle' = 'chat';
	users: {[userid: string]: string} = {};
	userCount = 0;
	override readonly canConnect = true;

	// PM-only properties
	pmTarget: string | null = null;
	challengeMenuOpen = false;
	challengingFormat: string | null = null;
	challengedFormat: string | null = null;

	constructor(options: RoomOptions) {
		super(options);
		if (options.pmTarget) this.pmTarget = options.pmTarget as string;
		if (options.challengeMenuOpen) this.challengeMenuOpen = true;
		this.updateTarget(true);
		this.connect();
	}
	override connect() {
		if (!this.connected) {
			if (!this.pmTarget) PS.send(`|/join ${this.id}`);
			this.connected = true;
			this.connectWhenLoggedIn = false;
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
			} else {
				this.pmTarget = id1;
			}
			if (!this.userCount) {
				this.setUsers(2, [` ${id1}`, ` ${id2}`]);
			}
			this.title = `[PM] ${this.pmTarget}`;
		}
	}
	/**
	 * @return true to prevent line from being sent to server
	 */
	override handleMessage(line: string) {
		if (!line.startsWith('/') || line.startsWith('//')) return false;
		const spaceIndex = line.indexOf(' ');
		const cmd = spaceIndex >= 0 ? line.slice(1, spaceIndex) : line.slice(1);
		const target = spaceIndex >= 0 ? line.slice(spaceIndex + 1) : '';
		switch (cmd) {
		case 'j': case 'join': {
			const roomid = /[^a-z0-9-]/.test(target) ? toID(target) as any as RoomID : target as RoomID;
			PS.join(roomid);
			return true;
		} case 'part': case 'leave': {
			const roomid = /[^a-z0-9-]/.test(target) ? toID(target) as any as RoomID : target as RoomID;
			PS.leave(roomid || this.id);
			return true;
		} case 'chall': case 'challenge': {
			if (target) {
				PS.join(`challenge-${toID(target)}` as RoomID);
				return true;
			}
			this.openChallenge();
			return true;
		} case 'cchall': case 'cancelchallenge': {
			this.cancelChallenge();
			return true;
		} case 'reject': {
			this.challengedFormat = null;
			this.update(null);
			return false;
		}}
		return super.handleMessage(line);
	}
	openChallenge() {
		if (!this.pmTarget) {
			this.receiveLine([`error`, `Can only be used in a PM.`]);
			return;
		}
		this.challengeMenuOpen = true;
		this.update(null);
	}
	cancelChallenge() {
		if (!this.pmTarget) {
			this.receiveLine([`error`, `Can only be used in a PM.`]);
			return;
		}
		if (this.challengingFormat) {
			this.send('/cancelchallenge', true);
			this.challengingFormat = null;
			this.challengeMenuOpen = true;
		} else {
			this.challengeMenuOpen = false;
		}
		this.update(null);
	}
	override send(line: string, direct?: boolean) {
		this.updateTarget();
		if (!direct && !line) return;
		if (!direct && this.handleMessage(line)) return;
		if (this.pmTarget) {
			PS.send(`|/pm ${this.pmTarget}, ${line}`);
			return;
		}
		super.send(line, true);
	}
	setUsers(count: number, usernames: string[]) {
		this.userCount = count;
		this.users = {};
		for (const username of usernames) {
			const userid = toID(username);
			this.users[userid] = username;
		}
		this.update(null);
	}
	addUser(username: string) {
		const userid = toID(username);
		if (!(userid in this.users)) this.userCount++;
		this.users[userid] = username;
		this.update(null);
	}
	removeUser(username: string, noUpdate?: boolean) {
		const userid = toID(username);
		if (userid in this.users) {
			this.userCount--;
			delete this.users[userid];
		}
		if (!noUpdate) this.update(null);
	}
	renameUser(username: string, oldUsername: string) {
		this.removeUser(oldUsername, true);
		this.addUser(username);
		this.update(null);
	}
	override destroy() {
		if (this.pmTarget) this.connected = false;
		super.destroy();
	}
}

class ChatTextEntry extends preact.Component<{
	room: PSRoom, onMessage: (msg: string) => void, onKey: (e: KeyboardEvent) => boolean,
	left?: number,
}> {
	subscription: PSSubscription | null = null;
	textbox: HTMLTextAreaElement = null!;
	miniedit: MiniEdit | null = null;
	history: string[] = [];
	historyIndex = 0;
	override componentDidMount() {
		this.subscription = PS.user.subscribe(() => {
			this.forceUpdate();
		});
		const textbox = this.base!.children[0].children[1] as HTMLElement;
		if (textbox.tagName === 'TEXTAREA') this.textbox = textbox as HTMLTextAreaElement;
		this.miniedit = new MiniEdit(textbox, {
			setContent: text => {
				textbox.innerHTML = formatText(text, false, false, true) + '\n';
			},
			onKeyDown: this.onKeyDown,
		});
		if (this.base) this.update();
	}
	override componentWillUnmount() {
		if (this.subscription) {
			this.subscription.unsubscribe();
			this.subscription = null;
		}
	}
	update = () => {
		// const textbox = this.textbox;
		// textbox.style.height = `12px`;
		// const newHeight = Math.min(Math.max(textbox.scrollHeight - 2, 16), 600);
		// textbox.style.height = `${newHeight}px`;
	};
	focusIfNoSelection = (e: Event) => {
		if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
		const selection = window.getSelection()!;
		if (selection.type === 'Range') return;
		const elem = this.base!.children[0].children[1] as HTMLTextAreaElement;
		elem.focus();
	};
	submit() {
		this.props.onMessage(this.getValue());
		this.historyPush(this.getValue());
		this.setValue('');
		this.update();
		return true;
	}
	onKeyDown = (e: KeyboardEvent) => {
		if (this.handleKey(e) || this.props.onKey(e)) {
			e.preventDefault();
			e.stopImmediatePropagation();
		}
	};
	getValue() {
		return this.miniedit ? this.miniedit.getValue() : this.textbox.value;
	}
	setValue(value: string, selection?: {start: number, end: number}) {
		if (this.miniedit) {
			this.miniedit.setValue(value, selection);
		} else {
			this.textbox.value = value;
			if (selection) this.textbox.setSelectionRange?.(selection.start, selection.end);
		}
	}
	historyUp() {
		if (this.historyIndex === 0) return false;
		const line = this.getValue();
		if (line !== '') this.history[this.historyIndex] = line;
		this.setValue(this.history[--this.historyIndex]);
		return true;
	}
	historyDown() {
		const line = this.getValue();
		if (line !== '') this.history[this.historyIndex] = line;
		if (this.historyIndex === this.history.length) {
			if (!line) return false;
			this.setValue('');
		} else if (++this.historyIndex === this.history.length) {
			this.setValue('');
		} else {
			this.setValue(this.history[this.historyIndex]);
		}
		return true;
	}
	historyPush(line: string) {
		const duplicateIndex = this.history.lastIndexOf(line);
		if (duplicateIndex >= 0) this.history.splice(duplicateIndex, 1);
		if (this.history.length > 100) this.history.splice(0, 20);
		this.history.push(line);
		this.historyIndex = this.history.length;
	}
	handleKey(ev: KeyboardEvent) {
		const cmdKey = ((ev.metaKey ? 1 : 0) + (ev.ctrlKey ? 1 : 0) === 1) && !ev.altKey && !ev.shiftKey;
		const anyModifier = ev.ctrlKey || ev.altKey || ev.metaKey || ev.shiftKey;
		if (ev.keyCode === 13 && !ev.shiftKey) { // Enter key
			return this.submit();
		} else if (ev.keyCode === 13 && this.miniedit) { // enter
			this.miniedit.replaceSelection('\n');
			return true;
		} else if (ev.keyCode === 73 && cmdKey) { // Ctrl + I key
			return this.toggleFormatChar('_');
		} else if (ev.keyCode === 66 && cmdKey) { // Ctrl + B key
			return this.toggleFormatChar('*');
		} else if (ev.keyCode === 192 && cmdKey) { // Ctrl + ` key
			return this.toggleFormatChar('`');
		// } else if (e.keyCode === 9 && !e.ctrlKey) { // Tab key
		// 	const reverse = !!e.shiftKey; // Shift+Tab reverses direction
		// 	return this.handleTabComplete(this.$chatbox, reverse);
		} else if (ev.keyCode === 38 && !ev.shiftKey && !ev.altKey) { // Up key
			return this.historyUp();
		} else if (ev.keyCode === 40 && !ev.shiftKey && !ev.altKey) { // Down key
			return this.historyDown();
		// } else if (app.user.lastPM && (textbox.value === '/reply' || textbox.value === '/r' || textbox.value === '/R') && e.keyCode === 32) { // '/reply ' is being written
		// 	var val = '/pm ' + app.user.lastPM + ', ';
		// 	textbox.value = val;
		// 	textbox.setSelectionRange(val.length, val.length);
		// 	return true;
		}
		return false;
	}
	getSelection() {
		return this.miniedit ?
			(this.miniedit.getSelection() || {start: 0, end: 0}) :
			{start: this.textbox.selectionStart, end: this.textbox.selectionEnd};
	}
	setSelection(start: number, end: number) {
		if (this.miniedit) {
			this.miniedit.setSelection({start, end});
		} else {
			this.textbox.setSelectionRange?.(start, end);
		}
	}
	toggleFormatChar(formatChar: string) {
		let value = this.getValue();
		let {start, end} = this.getSelection();

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

		this.setValue(value, {start, end});
		return true;
	}
	override render() {
		const OLD_TEXTBOX = false;
		return <div
			class="chat-log-add hasuserlist" onClick={this.focusIfNoSelection} style={{left: this.props.left || 0}}
		>
			<form class="chatbox">
				<label style={{color: BattleLog.usernameColor(PS.user.userid)}}>{PS.user.name}:</label>
				{OLD_TEXTBOX ? <textarea
					class={this.props.room.connected ? 'textbox' : 'textbox disabled'}
					autofocus
					rows={1}
					onInput={this.update}
					onKeyDown={this.onKeyDown}
					style={{resize: 'none', width: '100%', height: '16px', padding: '2px 3px 1px 3px'}}
					placeholder={PS.focusPreview(this.props.room)}
				/> : <ChatTextBox
					class={this.props.room.connected ? 'textbox' : 'textbox disabled'}
					placeholder={PS.focusPreview(this.props.room)}
				/>}
			</form>
		</div>;
	}
}

class ChatTextBox extends preact.Component<{placeholder: string, class: string}> {
	override shouldComponentUpdate() {
		return false;
	}
	override render() {
		return <pre class={this.props.class} placeholder={this.props.placeholder}>{'\n'}</pre>;
	}
}

class ChatPanel extends PSRoomPanel<ChatRoom> {
	send = (text: string) => {
		this.props.room.send(text);
	};
	override focus() {
		// Called synchronously after a forceUpdate, so before the DOM has
		// been updated to make the panel visible. The order isn't
		// important for textboxes, which can be focused while inside a
		// `display: none` element, but contentEditable boxes are pickier.
		// Waiting for a 0 timeout turns out to be enough.
		setTimeout(() => {
			(this.base!.querySelector('textarea, pre.textbox') as HTMLElement).focus();
		}, 0);
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
	makeChallenge = (e: Event, format: string, team?: Team) => {
		const room = this.props.room;
		const packedTeam = team ? team.packedTeam : '';
		if (!room.pmTarget) throw new Error("Not a PM room");
		PS.send(`|/utm ${packedTeam}`);
		PS.send(`|/challenge ${room.pmTarget}, ${format}`);
		room.challengeMenuOpen = false;
		room.challengingFormat = format;
		room.update(null);
	};
	acceptChallenge = (e: Event, format: string, team?: Team) => {
		const room = this.props.room;
		const packedTeam = team ? team.packedTeam : '';
		if (!room.pmTarget) throw new Error("Not a PM room");
		PS.send(`|/utm ${packedTeam}`);
		this.props.room.send(`/accept`);
		room.challengedFormat = null;
		room.update(null);
	};
	override render() {
		const room = this.props.room;
		const tinyLayout = room.width < 450;

		const challengeTo = room.challengingFormat ? <div class="challenge">
			<TeamForm format={room.challengingFormat} onSubmit={null}>
				<button name="cmd" value="/cancelchallenge" class="button">Cancel</button>
			</TeamForm>
		</div> : room.challengeMenuOpen ? <div class="challenge">
			<TeamForm onSubmit={this.makeChallenge}>
				<button type="submit" class="button"><strong>Challenge</strong></button> {}
				<button name="cmd" value="/cancelchallenge" class="button">Cancel</button>
			</TeamForm>
		</div> : null;

		const challengeFrom = room.challengedFormat ? <div class="challenge">
			<TeamForm format={room.challengedFormat} onSubmit={this.acceptChallenge}>
				<button type="submit" class="button"><strong>Accept</strong></button> {}
				<button name="cmd" value="/reject" class="button">Reject</button>
			</TeamForm>
		</div> : null;

		return <PSPanelWrapper room={room}>
			<div class="tournament-wrapper hasuserlist"></div>
			<ChatLog class="chat-log" room={this.props.room} onClick={this.focusIfNoSelection} left={tinyLayout ? 0 : 146}>
				{challengeTo || challengeFrom && [challengeTo, challengeFrom]}
			</ChatLog>
			<ChatTextEntry room={this.props.room} onMessage={this.send} onKey={this.onKey} left={tinyLayout ? 0 : 146} />
			<ChatUserList room={this.props.room} minimized={tinyLayout} />
		</PSPanelWrapper>;
	}
}

class ChatUserList extends preact.Component<{room: ChatRoom, left?: number, minimized?: boolean}> {
	subscription: PSSubscription | null = null;
	override state = {
		expanded: false,
	};
	toggleExpanded = () => {
		this.setState({expanded: !this.state.expanded});
	};
	override componentDidMount() {
		this.subscription = this.props.room.subscribe(msg => {
			if (!msg) this.forceUpdate();
		});
	}
	override componentWillUnmount() {
		if (this.subscription) this.subscription.unsubscribe();
	}
	render() {
		const room = this.props.room;
		let userList = Object.entries(room.users) as [ID, string][];
		PSUtils.sortBy(userList, ([id, name]) => (
			[PS.server.getGroup(name.charAt(0)).order, !name.endsWith('@!'), id]
		));
		return <ul class={'userlist' + (this.props.minimized ? (this.state.expanded ? ' userlist-maximized' : ' userlist-minimized') : '')} style={{left: this.props.left || 0}}>
			<li class="userlist-count" onClick={this.toggleExpanded}><small>{room.userCount} users</small></li>
			{userList.map(([userid, name]) => {
				const groupSymbol = name.charAt(0);
				const group = PS.server.groups[groupSymbol] || {type: 'user', order: 0};
				let color;
				if (name.endsWith('@!')) {
					name = name.slice(0, -2);
					color = '#888888';
				} else {
					color = BattleLog.usernameColor(userid);
				}
				return <li key={userid}><button class="userbutton username" data-name={name}>
					<em class={`group${['leadership', 'staff'].includes(group.type!) ? ' staffgroup' : ''}`}>
						{groupSymbol}
					</em>
					{group.type === 'leadership' ?
						<strong><em style={{color}}>{name.substr(1)}</em></strong>
					: group.type === 'staff' ?
						<strong style={{color}}>{name.substr(1)}</strong>
					:
						<span style={{color}}>{name.substr(1)}</span>
					}
				</button></li>;
			})}
		</ul>;
	}
}

class ChatLog extends preact.Component<{
	class: string, room: ChatRoom, onClick?: (e: Event) => void, children?: preact.ComponentChildren,
	left?: number, top?: number, noSubscription?: boolean;
}> {
	log: BattleLog | null = null;
	subscription: PSSubscription | null = null;
	override componentDidMount() {
		if (!this.props.noSubscription) {
			this.log = new BattleLog(this.base! as HTMLDivElement);
		}
		this.subscription = this.props.room.subscribe(tokens => {
			if (!tokens) return;
			switch (tokens[0]) {
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
			if (!this.props.noSubscription) this.log!.add(tokens);
		});
		this.setControlsJSX(this.props.children);
	}
	override componentWillUnmount() {
		if (this.subscription) this.subscription.unsubscribe();
	}
	override shouldComponentUpdate(props: typeof ChatLog.prototype.props) {
		if (props.class !== this.props.class) {
			this.base!.className = props.class;
		}
		if (props.left !== this.props.left) this.base!.style.left = `${props.left || 0}px`;
		if (props.top !== this.props.top) this.base!.style.top = `${props.top || 0}px`;
		this.setControlsJSX(props.children);
		this.updateScroll();
		return false;
	}
	setControlsJSX(jsx: preact.ComponentChildren | undefined) {
		const children = this.base!.children;
		let controlsElem = children[children.length - 1] as HTMLDivElement | undefined;
		if (controlsElem && controlsElem.className !== 'controls') controlsElem = undefined;
		if (!jsx) {
			if (!controlsElem) return;
			preact.render(null, this.base!, controlsElem);
			this.updateScroll();
			return;
		}
		if (!controlsElem) {
			controlsElem = document.createElement('div');
			controlsElem.className = 'controls';
			this.base!.appendChild(controlsElem);
		}
		preact.render(<div class="controls">{jsx}</div>, this.base!, controlsElem);
		this.updateScroll();
	}
	updateScroll() {
		if (this.log) {
			this.log.updateScroll();
		} else if (this.props.room.battle) {
			this.log = (this.props.room.battle as Battle).scene.log;
			this.log.updateScroll();
		}
	}
	render() {
		return <div class={this.props.class} role="log" onClick={this.props.onClick} style={{
			left: this.props.left || 0, top: this.props.top || 0,
		}}></div>;
	}
}

PS.roomTypes['chat'] = {
	Model: ChatRoom,
	Component: ChatPanel,
};
PS.updateRoomTypes();
