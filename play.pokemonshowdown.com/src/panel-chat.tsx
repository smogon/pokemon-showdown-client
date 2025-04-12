/**
 * Chat panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

import preact from "../js/lib/preact";
import type { PSSubscription } from "./client-core";
import { PS, PSRoom, type RoomOptions, type RoomID, type Team } from "./client-main";
import { PSPanelWrapper, PSRoomPanel } from "./panels";
import { TeamForm } from "./panel-mainmenu";
import { BattleLog } from "./battle-log";
import type { Battle } from "./battle";
import { MiniEdit } from "./miniedit";
import { PSUtils, toID, type ID } from "./battle-dex";
import type { Args } from "./battle-text-parser";

declare const formatText: any; // from js/server/chat-formatter.js

type Challenge = {
	formatName: string,
	teamFormat: string,
	message?: string,
	acceptButtonLabel?: string,
	rejectButtonLabel?: string,
};

export class ChatRoom extends PSRoom {
	override readonly classType: 'chat' | 'battle' = 'chat';
	users: { [userid: string]: string } = {};
	userCount = 0;
	override readonly canConnect = true;

	// PM-only properties
	pmTarget: string | null = null;
	challengeMenuOpen = false;
	initialSlash = false;
	challenging: Challenge | null = null;
	challenged: Challenge | null = null;
	/** n.b. this will be null outside of battle rooms */
	battle: Battle | null = null;
	log: BattleLog | null = null;

	constructor(options: RoomOptions) {
		super(options);
		if (options.args?.pmTarget) this.pmTarget = options.args.pmTarget as string;
		if (options.args?.challengeMenuOpen) this.challengeMenuOpen = true;
		if (options.args?.initialSlash) this.initialSlash = true;
		this.updateTarget(this.pmTarget);
		this.connect();
	}
	override connect() {
		if (!this.connected) {
			if (this.pmTarget === null) PS.send(`|/join ${this.id}`);
			this.connected = true;
			this.connectWhenLoggedIn = false;
		}
	}
	override receiveLine(args: Args) {
		switch (args[0]) {
		case 'users':
			const usernames = args[1].split(',');
			const count = parseInt(usernames.shift()!, 10);
			this.setUsers(count, usernames);
			return;
		case 'join': case 'j': case 'J':
			this.addUser(args[1]);
			break;
		case 'leave': case 'l': case 'L':
			this.removeUser(args[1]);
			break;
		case 'name': case 'n': case 'N':
			this.renameUser(args[1], args[2]);
			break;
		case 'c':
			if (`${args[2]} `.startsWith('/challenge ')) {
				this.updateChallenge(args[1], args[2].slice(11));
				return;
			}
			// falls through
		case 'c:':
			this.subtleNotify();
			break;
		}
		super.receiveLine(args);
	}
	updateTarget(name?: string | null) {
		if (this.id === 'dm-') {
			this.pmTarget = PS.user.name;
			this.setUsers(1, [` ${PS.user.name}`]);
			this.title = `Console`;
		} else if (this.id.startsWith('dm-')) {
			const id = this.id.slice(3);
			if (!name || toID(name) !== id) name = this.pmTarget || id;
			this.pmTarget = name;
			if (!PS.user.userid) {
				this.setUsers(1, [` ${name}`]);
			} else {
				this.setUsers(2, [` ${name}`, ` ${PS.user.name}`]);
			}
			this.title = `[DM] ${name}`;
		}
	}
	/**
	 * @return true to prevent line from being sent to server
	 */
	override handleSend(line: string) {
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
		} case 'chall': case 'challenge': case 'closeandchallenge': {
			if (target) {
				const [targetUser, format] = target.split(',');
				PS.join(`challenge-${toID(targetUser)}` as RoomID);
				if (cmd === 'closeandchallenge') PS.leave(this.id);
				return true;
			}
			this.openChallenge();
			return true;
		} case 'cchall': case 'cancelchallenge': {
			this.cancelChallenge();
			return true;
		} case 'reject': {
			this.challenged = null;
			this.update(null);
			return false;
		}
		case 'clear': {
			this.log?.reset();
			this.update(null);
			return true;
		}
		case 'rank':
		case 'ranking':
		case 'rating':
		case 'ladder': {
			let arg = target;
			if (!arg) {
				arg = PS.user.userid;
			}
			if (this.battle && !arg.includes(',')) {
				arg += ", " + this.id.split('-')[1];
			}

			let targets = arg.split(',');
			let formatTargeting = false;
			let formats: { [key: string]: number } = {};
			let gens: { [key: string]: number } = {};
			for (let i = 1, len = targets.length; i < len; i++) {
				targets[i] = $.trim(targets[i]);
				if (targets[i].length === 4 && targets[i].substr(0, 3) === 'gen') {
					gens[targets[i]] = 1;
				} else {
					formats[toID(targets[i])] = 1;
				}
				formatTargeting = true;
			}

			// let self = this;
			$.get(PS.server.getActionPHP(), {
				act: 'ladderget',
				user: targets[0],
			}, (data:string) => {
				if (data[0] === ']') data = data.substr(1);
				data = JSON.parse(data);
				console.log(data);
				if (!data || !Array.isArray(data)) return this.receiveLine(['raw', 'Error: corrupted ranking data']);
				let buffer = '<div class="ladder"><table><tr><td colspan="9">User: <strong>' + toID(targets[0]) + '</strong></td></tr>';
				if (!data.length) {
					buffer += '<tr><td colspan="9"><em>This user has not played any ladder games yet.</em></td></tr>';
					buffer += '</table></div>';
					return this.receiveLine(['raw', buffer]);
				}
				buffer += '<tr><th>Format</th><th><abbr title="Elo rating">Elo</abbr></th><th><abbr title="user\'s percentage chance of winning a random battle (aka GLIXARE)">GXE</abbr></th><th><abbr title="Glicko-1 rating: rating±deviation">Glicko-1</abbr></th><th>COIL</th><th>W</th><th>L</th><th>Total</th>';
				let suspect = false;
				for (let item of data) {
					if ('suspect' in item) suspect = true;
				}
				if (suspect) buffer += '<th>Suspect reqs possible?</th>';
				buffer += '</tr>';
				let hiddenFormats = [];
				for (let row of data) {
					if (!row) return this.receiveLine(['raw', 'Error: corrupted ranking data']);
					let formatId = toID(row.formatid);
					if (!formatTargeting ||
						formats[formatId] ||
						gens[formatId.slice(0, 4)] ||
						(gens['gen6'] && formatId.substr(0, 3) !== 'gen')) {
						buffer += '<tr>';
					} else {
						buffer += '<tr class="hidden">';
						hiddenFormats.push(window.BattleLog.escapeFormat(formatId));
					}

					// Validate all the numerical data
					let values = [row.elo, row.rpr, row.rprd, row.gxe, row.w, row.l, row.t];
					for (let value of values) {
						if (typeof value !== 'number' && typeof value !== 'string' ||
							isNaN(value as number)) return this.receiveLine(['raw', 'Error: corrupted ranking data']);
					}

					buffer += `<td> ${BattleLog.escapeFormat(formatId)} </td><td><strong> ${Math.round(row.elo)} </strong></td>'`;
					if (row.rprd > 100) {
						// High rating deviation. Provisional rating.
						buffer += `<td>&ndash;</td>`;
						buffer += `<td><span><em> ${Math.round(row.rpr)} <small> &#177; ${Math.round(row.rprd)} </small></em> <small>(provisional)</small></span></td>`;
					} else {
						let gxe = Math.round(row.gxe * 10);
						buffer += `<td> ${Math.floor(gxe / 10)} <small> ${(gxe % 10)}%</small></td>`;
						buffer += `<td><em> ${Math.round(row.rpr)} <small> &#177; ${Math.round(row.rprd)}</small></em></td>`;
					}
					let N = parseInt(row.w, 10) + parseInt(row.l, 10) + parseInt(row.t, 10);
					let COIL_B = undefined;

					// Uncomment this after LadderRoom logic is implemented
					// COIL_B = LadderRoom?.COIL_B[formatId];

					if (COIL_B) {
						buffer += `<td> ${Math.round(40.0 * parseFloat(row.gxe) * 2.0 ** (-COIL_B / N), 0)} </td>`;
					} else {
						buffer += '<td>--</td>';
					}
					buffer += `<td> ${row.w} </td><td> ${row.l} </td><td> ${N} </td>`;
					if (suspect) {
						if (typeof row.suspect === 'undefined') {
							buffer += '<td>--</td>';
						} else {
							buffer += '<td>';
							buffer += (row.suspect ? "Yes" : "No");
							buffer += '</td>';
						}
					}
					buffer += '</tr>';
				}
				if (hiddenFormats.length) {
					if (hiddenFormats.length === data.length) {
						buffer += '<tr class="no-matches"><td colspan="8"><em>This user has not played any ladder games that match "' + BattleLog.escapeHTML(Object.keys(gens).concat(Object.keys(formats)).join(', ')) + '".</em></td></tr>';
					}
					buffer += `<tr><td colspan="8"><button name="showOtherFormats"> ${hiddenFormats.slice(0, 3).join(', ') + (hiddenFormats.length > 3 ? ' and ' + (hiddenFormats.length - 3) + ' other formats' : '')} not shown</button></td></tr>'`;
				}
				let userid = toID(targets[0]);
				let registered = PS.user.registered;
				if (registered && PS.user.userid === userid) {
					buffer += '<tr><td colspan="8" style="text-align:right"><a href="//' + PS.routes.users + '/' + userid + '">Reset W/L</a></tr></td>';
				}
				buffer += '</table></div>';
				this.receiveLine(['raw', buffer]);
			}, 'text');
			return true;
		}

		}
		return super.handleSend(line);
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
		if (this.challenging) {
			this.sendDirect('/cancelchallenge');
			this.challenging = null;
			this.challengeMenuOpen = true;
		} else {
			this.challengeMenuOpen = false;
		}
		this.update(null);
	}
	parseChallenge(challengeString: string | null): Challenge | null {
		if (!challengeString) return null;

		let splitChallenge = challengeString.split('|');

		const challenge = {
			formatName: splitChallenge[0],
			teamFormat: splitChallenge[1] ?? splitChallenge[0],
			message: splitChallenge[2],
			acceptButtonLabel: splitChallenge[3],
			rejectButtonLabel: splitChallenge[4],
		};
		if (!challenge.formatName && !challenge.message) {
			return null;
		}
		return challenge;
	}
	updateChallenge(name: string, challengeString: string) {
		const challenge = this.parseChallenge(challengeString);
		const userid = toID(name);

		if (userid === PS.user.userid) {
			if (!challenge && !this.challenging) {
				// this is also used for canceling challenges
				this.challenged = null;
			}
			// we are sending the challenge
			this.challenging = challenge;
		} else {
			if (!challenge && !this.challenged) {
				// this is also used for rejecting challenges
				this.challenging = null;
			}
			this.challenged = challenge;
			if (challenge) {
				this.notify({
					title: `Challenge from ${name}`,
					body: `Format: ${BattleLog.formatName(challenge.formatName)}`,
					id: 'challenge',
				});
				// app.playNotificationSound();
			}
		}
		this.update(null);
	}
	override sendDirect(line: string) {
		if (this.pmTarget) {
			PS.send(`|/pm ${this.pmTarget}, ${line}`);
			return;
		}
		super.sendDirect(line);
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
		if (this.battle) {
			// since battle is defined here, we might as well deallocate it here
			this.battle.destroy();
		} else {
			this.log?.destroy();
		}
		super.destroy();
	}
}

export class ChatTextEntry extends preact.Component<{
	room: PSRoom, onMessage: (msg: string) => void, onKey: (e: KeyboardEvent) => boolean,
	left?: number, tinyLayout?: boolean,
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
				textbox.classList?.toggle('textbox-empty', !text);
			},
			onKeyDown: this.onKeyDown,
		});
		if (this.props.room.args?.initialSlash) {
			this.props.room.args.initialSlash = false;
			this.miniedit.setValue('/', { start: 1, end: 1 });
		}
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
	setValue(value: string, selection?: { start: number, end: number }) {
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
		// const anyModifier = ev.ctrlKey || ev.altKey || ev.metaKey || ev.shiftKey;
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
		} else if (ev.keyCode === 27) { // esc
			if (PS.room !== PS.panel) { // only close if in mini-room mode
				PS.leave(PS.room.id);
				return true;
			}
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
			(this.miniedit.getSelection() || { start: 0, end: 0 }) :
			{ start: this.textbox.selectionStart, end: this.textbox.selectionEnd };
	}
	setSelection(start: number, end: number) {
		if (this.miniedit) {
			this.miniedit.setSelection({ start, end });
		} else {
			this.textbox.setSelectionRange?.(start, end);
		}
	}
	toggleFormatChar(formatChar: string) {
		let value = this.getValue();
		let { start, end } = this.getSelection();

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

		this.setValue(value, { start, end });
		return true;
	}
	override render() {
		const OLD_TEXTBOX = false;
		return <div
			class="chat-log-add hasuserlist" onClick={this.focusIfNoSelection} style={{ left: this.props.left || 0 }}
		>
			<form class={`chatbox${this.props.tinyLayout ? ' nolabel' : ''}`} style={PS.user.named ? {} : { display: 'none' }}>
				<label style={{ color: BattleLog.usernameColor(PS.user.userid) }}>{PS.user.name}:</label>
				{OLD_TEXTBOX ? <textarea
					class={this.props.room.connected && PS.user.named ? 'textbox autofocus' : 'textbox disabled'}
					autofocus
					rows={1}
					onInput={this.update}
					onKeyDown={this.onKeyDown}
					style={{ resize: 'none', width: '100%', height: '16px', padding: '2px 3px 1px 3px' }}
					placeholder={PS.focusPreview(this.props.room)}
				/> : <ChatTextBox
					disabled={!this.props.room.connected || !PS.user.named}
					placeholder={PS.focusPreview(this.props.room)}
				/>}
			</form>
			{!PS.user.named && <button data-href="login" class="button autofocus">
				Choose a name before sending messages
			</button>}
		</div>;
	}
}

class ChatTextBox extends preact.Component<{ placeholder: string, disabled?: boolean }> {
	override shouldComponentUpdate(nextProps: any) {
		this.base!.setAttribute("placeholder", nextProps.placeholder);
		this.base!.classList?.toggle('disabled', !!nextProps.disabled);
		this.base!.classList?.toggle('autofocus', !nextProps.disabled);
		return false;
	}
	override render() {
		return <pre
			class={`textbox textbox-empty ${this.props.disabled ? ' disabled' : ''}`} placeholder={this.props.placeholder}
		>{'\n'}</pre>;
	}
}

class ChatPanel extends PSRoomPanel<ChatRoom> {
	static readonly id = 'chat';
	static readonly routes = ['dm-*', '*'];
	static readonly Model = ChatRoom;
	static readonly location = 'right';
	static readonly icon = <i class="fa fa-comment-o"></i>;
	override componentDidMount(): void {
		this.subscribeTo(PS.user, () => {
			this.props.room.updateTarget();
		});
		super.componentDidMount();
	}
	send = (text: string) => {
		this.props.room.send(text);
	};
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
		room.challenging = {
			formatName: format,
			teamFormat: format,
		};
		room.update(null);
	};
	acceptChallenge = (e: Event, format: string, team?: Team) => {
		const room = this.props.room;
		const packedTeam = team ? team.packedTeam : '';
		if (!room.pmTarget) throw new Error("Not a PM room");
		PS.send(`|/utm ${packedTeam}`);
		this.props.room.send(`/accept`);
		room.challenged = null;
		room.update(null);
	};
	override render() {
		const room = this.props.room;
		const tinyLayout = room.width < 450;

		const challengeTo = room.challenging ? <div class="challenge">
			<p>Waiting for {room.pmTarget}...</p>
			<TeamForm format={room.challenging.formatName} teamFormat={room.challenging.teamFormat} onSubmit={null}>
				<button data-cmd="/cancelchallenge" class="button">Cancel</button>
			</TeamForm>
		</div> : room.challengeMenuOpen ? <div class="challenge">
			<TeamForm onSubmit={this.makeChallenge}>
				<button type="submit" class="button"><strong>Challenge</strong></button> {}
				<button data-cmd="/cancelchallenge" class="button">Cancel</button>
			</TeamForm>
		</div> : null;

		const challengeFrom = room.challenged ? <div class="challenge">
			{!!room.challenged.message && <p>{room.challenged.message}</p>}
			<TeamForm format={room.challenged.formatName} teamFormat={room.challenged.teamFormat} onSubmit={this.acceptChallenge}>
				<button type="submit" class="button"><strong>{room.challenged.acceptButtonLabel || 'Accept'}</strong></button> {}
				<button data-cmd="/reject" class="button">{room.challenged.rejectButtonLabel || 'Reject'}</button>
			</TeamForm>
		</div> : null;

		return <PSPanelWrapper room={room} focusClick>
			<div class="tournament-wrapper hasuserlist"></div>
			<ChatLog class="chat-log" room={this.props.room} left={tinyLayout ? 0 : 146}>
				{challengeTo || challengeFrom && [challengeTo, challengeFrom]}
			</ChatLog>
			<ChatTextEntry
				room={this.props.room} onMessage={this.send} onKey={this.onKey} left={tinyLayout ? 0 : 146} tinyLayout={tinyLayout}
			/>
			<ChatUserList room={this.props.room} minimized={tinyLayout} />
		</PSPanelWrapper>;
	}
}

export class ChatUserList extends preact.Component<{
	room: ChatRoom, left?: number, top?: number, minimized?: boolean,
}> {
	override state = {
		expanded: false,
	};
	toggleExpanded = () => {
		this.setState({ expanded: !this.state.expanded });
	};
	render() {
		const room = this.props.room;
		let userList = Object.entries(room.users) as [ID, string][];
		PSUtils.sortBy(userList, ([id, name]) => (
			[PS.server.getGroup(name.charAt(0)).order, !name.endsWith('@!'), id]
		));
		return <ul
			class={'userlist' + (this.props.minimized ? (this.state.expanded ? ' userlist-maximized' : ' userlist-minimized') : '')}
			style={{ left: this.props.left || 0, top: this.props.top || 0 }}
		>
			<li class="userlist-count" onClick={this.toggleExpanded}><small>{room.userCount} users</small></li>
			{userList.map(([userid, name]) => {
				const groupSymbol = name.charAt(0);
				const group = PS.server.groups[groupSymbol] || { type: 'user', order: 0 };
				let color;
				if (name.endsWith('@!')) {
					name = name.slice(0, -2);
					color = '#888888';
				} else {
					color = BattleLog.usernameColor(userid);
				}
				return <li key={userid}><button class="userbutton username">
					<em class={`group${['leadership', 'staff'].includes(group.type!) ? ' staffgroup' : ''}`}>
						{groupSymbol}
					</em>
					{group.type === 'leadership' ? (
						<strong><em style={{ color }}>{name.substr(1)}</em></strong>
					) : group.type === 'staff' ? (
						<strong style={{ color }}>{name.substr(1)}</strong>
					) : (
						<span style={{ color }}>{name.substr(1)}</span>
					)}
				</button></li>;
			})}
		</ul>;
	}
}

export class ChatLog extends preact.Component<{
	class: string, room: ChatRoom, children?: preact.ComponentChildren,
	left?: number, top?: number, noSubscription?: boolean,
}> {
	subscription: PSSubscription | null = null;
	override componentDidMount() {
		const room = this.props.room;
		if (room.log) {
			const elem = room.log.elem;
			this.base!.replaceChild(elem, this.base!.firstChild!);
			elem.className = this.props.class;
			elem.style.left = `${this.props.left || 0}px`;
			elem.style.top = `${this.props.top || 0}px`;
		}
		if (!this.props.noSubscription) {
			room.log ||= new BattleLog(this.base!.firstChild as HTMLDivElement);
			if (room.backlog) {
				const backlog = room.backlog;
				room.backlog = null;
				for (const args of backlog) {
					room.log.add(args);
				}
			}
			this.subscription = room.subscribe(tokens => {
				if (!tokens) return;
				this.props.room.log!.add(tokens);
			});
		}
		this.setControlsJSX(this.props.children);
	}
	override componentWillUnmount() {
		this.subscription?.unsubscribe();
	}
	override shouldComponentUpdate(props: typeof ChatLog.prototype.props) {
		const elem = this.base!.firstChild as HTMLDivElement;
		if (props.class !== this.props.class) {
			elem.className = props.class;
		}
		if (props.left !== this.props.left) elem.style.left = `${props.left || 0}px`;
		if (props.top !== this.props.top) elem.style.top = `${props.top || 0}px`;
		this.setControlsJSX(props.children);
		this.updateScroll();
		return false;
	}
	setControlsJSX(jsx: preact.ComponentChildren | undefined) {
		const elem = this.base!.firstChild as HTMLDivElement;
		const children = elem.children;
		let controlsElem = children[children.length - 1] as HTMLDivElement | undefined;
		if (controlsElem && controlsElem.className !== 'controls') controlsElem = undefined;
		if (!jsx) {
			if (!controlsElem) return;
			preact.render(null, elem, controlsElem);
			this.updateScroll();
			return;
		}
		if (!controlsElem) {
			controlsElem = document.createElement('div');
			controlsElem.className = 'controls';
			elem.appendChild(controlsElem);
		}
		preact.render(<div class="controls">{jsx}</div>, elem, controlsElem);
		this.updateScroll();
	}
	updateScroll() {
		this.props.room.log?.updateScroll();
	}
	render() {
		return <div><div
			class={this.props.class} role="log"
			style={{ left: this.props.left || 0, top: this.props.top || 0 }}
		></div></div>;
	}
}

PS.addRoomType(ChatPanel);
