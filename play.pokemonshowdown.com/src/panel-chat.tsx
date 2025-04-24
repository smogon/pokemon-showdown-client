/**
 * Chat panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

import preact from "../js/lib/preact";
import type { PSSubscription } from "./client-core";
import { PS, PSRoom, type RoomOptions, type RoomID, type Team } from "./client-main";
import { PSView, PSPanelWrapper, PSRoomPanel } from "./panels";
import { TeamForm } from "./panel-mainmenu";
import { BattleLog } from "./battle-log";
import type { Battle } from "./battle";
import { MiniEdit } from "./miniedit";
import { Dex, PSUtils, toID, type ID } from "./battle-dex";
import { BattleTextParser, type Args } from "./battle-text-parser";
import { PSLoginServer } from "./client-connection";
import type { BattleRoom } from "./panel-battle";
import { BattleChoiceBuilder } from "./battle-choices";
import { ChatTournament, TournamentBox } from "./panel-chat-tournament";

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
	tour: ChatTournament | null = null;
	lastMessage: Args | null = null;

	joinLeave: { join: string[], leave: string[], messageId: string } | null = null;
	/** in order from least to most recent */
	userActivity: string[] = [];
	timeOffset = 0;

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
			this.handleJoinLeave("join", args[1], args[0] === "J");
			return true;

		case 'leave': case 'l': case 'L':
			this.removeUser(args[1]);
			this.handleJoinLeave("leave", args[1], args[0] === "L");
			return true;

		case 'name': case 'n': case 'N':
			this.renameUser(args[1], args[2]);
			break;

		case 'tournament': case 'tournaments':
			this.tour ||= new ChatTournament(this);
			this.tour.receiveLine(args);
			return;

		case 'chat': case 'c':
			if (`${args[2]} `.startsWith('/challenge ')) {
				this.updateChallenge(args[1], args[2].slice(11));
				return;
			}
			// falls through
		case 'c:':
			if (args[0] === 'c:') PS.lastMessageTime = args[1];
			this.lastMessage = args;
			this.joinLeave = null;
			this.markUserActive(args[2]);
			if (this.tour) this.tour.joinLeave = null;
			this.subtleNotify();
			break;
		case ':':
			this.timeOffset = Math.trunc(Date.now() / 1000) - (parseInt(args[1], 10) || 0);
			break;
		}
		super.receiveLine(args);
	}
	override handleReconnect(msg: string): boolean | void {
		if (this.battle) {
			this.battle.reset();
			this.battle.stepQueue = [];
			return false;
		} else {
			let lines = msg.split('\n');

			// cut off starting lines until we get to PS.lastMessage timestamp
			// then cut off roomintro from the end
			let cutOffStart = 0;
			let cutOffEnd = lines.length;
			const cutOffTime = parseInt(PS.lastMessageTime);
			const cutOffExactLine = this.lastMessage ? '|' + this.lastMessage?.join('|') : '';
			let reconnectMessage = '|raw|<div class="infobox">You reconnected.</div>';
			for (let i = 0; i < lines.length; i++) {
				if (lines[i] === cutOffExactLine) {
					cutOffStart = i + 1;
				} else if (lines[i].startsWith(`|c:|`)) {
					const time = parseInt(lines[i].split('|')[2] || '');
					if (time < cutOffTime) cutOffStart = i;
				}
				if (lines[i].startsWith('|raw|<div class="infobox"> You joined ')) {
					reconnectMessage = `|raw|<div class="infobox">You reconnected to ${lines[i].slice(38)}`;
					cutOffEnd = i;
					if (!lines[i - 1]) cutOffEnd = i - 1;
				}
			}
			lines = lines.slice(cutOffStart, cutOffEnd);

			if (lines.length) {
				this.receiveLine([`raw`, `<div class="infobox">You disconnected.</div>`]);
				for (const line of lines) this.receiveLine(BattleTextParser.parseLine(line));
				this.receiveLine(BattleTextParser.parseLine(reconnectMessage));
			}
			this.update(null);
			return true;
		}
	}
	updateTarget(name?: string | null) {
		const selfWithGroup = `${PS.user.group || ' '}${PS.user.name}`;
		if (this.id === 'dm-') {
			this.pmTarget = selfWithGroup;
			this.setUsers(1, [selfWithGroup]);
			this.title = `Console`;
		} else if (this.id.startsWith('dm-')) {
			const id = this.id.slice(3);
			if (toID(name) !== id) name = null;
			name ||= this.pmTarget || id;
			if (/[A-Za-z0-9]/.test(name.charAt(0))) name = ` ${name}`;
			const nameWithGroup = name;
			name = name.slice(1);
			this.pmTarget = name;
			if (!PS.user.userid) {
				this.setUsers(1, [nameWithGroup]);
			} else {
				this.setUsers(2, [nameWithGroup, selfWithGroup]);
			}
			this.title = `[DM] ${nameWithGroup.trim()}`;
		}
	}
	handleHighlight = (message: string, name: string) => {
		if (!PS.prefs.noselfhighlight && PS.user.nameRegExp?.test(message)) {
			this.notify({
				title: `Mentioned by ${name} in ${this.id}`,
				body: `"${message}"`,
				id: 'highlight',
			});
			return true;
		}
		/*
		// TODO!
		if (!this.highlightRegExp) {
			try {
				//this.updateHighlightRegExp(highlights);
			} catch (e) {
				// If the expression above is not a regexp, we'll get here.
				// Don't throw an exception because that would prevent the chat
				// message from showing up, or, when the lobby is initialising,
				// it will prevent the initialisation from completing.
				return false;
			}
		}
		var id = PS.server.id + '#' + this.id;
		var globalHighlightsRegExp = this.highlightRegExp['global'];
		var roomHighlightsRegExp = this.highlightRegExp[id];

		return (((globalHighlightsRegExp &&
		 globalHighlightsRegExp.test(message)) ||
		  (roomHighlightsRegExp && roomHighlightsRegExp.test(message))));
		*/
		return false;
	};
	override clientCommands = this.parseClientCommands({
		'chall,challenge'(target) {
			if (target) {
				const [targetUser, format] = target.split(',');
				PS.join(`challenge-${toID(targetUser)}` as RoomID);
				return;
			}
			this.openChallenge();
		},
		'cchall,cancelchallenge'(target) {
			this.cancelChallenge();
		},
		'reject'(target) {
			this.challenged = null;
			this.update(null);
		},
		'clear'() {
			this.log?.reset();
			this.update(null);
		},
		'rank,ranking,rating,ladder'(target) {
			let arg = target;
			if (!arg) {
				arg = PS.user.userid;
			}
			if (this.battle && !arg.includes(',')) {
				arg += ", " + this.id.split('-')[1];
			}

			const targets = arg.split(',');
			let formatTargeting = false;
			const formats: { [key: string]: number } = {};
			const gens: { [key: string]: number } = {};
			for (let i = 1, len = targets.length; i < len; i++) {
				targets[i] = $.trim(targets[i]);
				if (targets[i].length === 4 && targets[i].startsWith('gen')) {
					gens[targets[i]] = 1;
				} else {
					formats[toID(targets[i])] = 1;
				}
				formatTargeting = true;
			}

			PSLoginServer.query("ladderget", {
				user: targets[0],
			}).then(data => {
				if (!data || !Array.isArray(data)) return this.add(`|error|Error: corrupted ranking data`);
				let buffer = `<div class="ladder"><table><tr><td colspan="9">User: <strong>${toID(targets[0])}</strong></td></tr>`;
				if (!data.length) {
					buffer += '<tr><td colspan="9"><em>This user has not played any ladder games yet.</em></td></tr>';
					buffer += '</table></div>';
					return this.add(`|html|${buffer}`);
				}
				buffer += '<tr><th>Format</th><th><abbr title="Elo rating">Elo</abbr></th><th><abbr title="user\'s percentage chance of winning a random battle (aka GLIXARE)">GXE</abbr></th><th><abbr title="Glicko-1 rating: rating &#177; deviation">Glicko-1</abbr></th><th>COIL</th><th>W</th><th>L</th><th>Total</th>';
				let suspect = false;
				for (const item of data) {
					if ('suspect' in item) suspect = true;
				}
				if (suspect) buffer += '<th>Suspect reqs possible?</th>';
				buffer += '</tr>';
				const hiddenFormats = [];
				for (const row of data) {
					if (!row) return this.add(`|error|Error: corrupted ranking data`);
					const formatId = toID(row.formatid);
					if (!formatTargeting ||
						formats[formatId] ||
						gens[formatId.slice(0, 4)] ||
						(gens['gen6'] && !formatId.startsWith('gen'))) {
						buffer += '<tr>';
					} else {
						buffer += '<tr class="hidden">';
						hiddenFormats.push(window.BattleLog.escapeFormat(formatId, true));
					}

					// Validate all the numerical data
					for (const value of [row.elo, row.rpr, row.rprd, row.gxe, row.w, row.l, row.t]) {
						if (typeof value !== 'number' && typeof value !== 'string') {
							return this.add(`|error|Error: corrupted ranking data`);
						}
					}

					buffer += `<td> ${BattleLog.escapeHTML(BattleLog.formatName(formatId, true))} </td><td><strong>${Math.round(row.elo)}</strong></td>`;
					if (row.rprd > 100) {
						// High rating deviation. Provisional rating.
						buffer += `<td>&ndash;</td>`;
						buffer += `<td><span style="color:#888"><em>${Math.round(row.rpr)} <small> &#177; ${Math.round(row.rprd)} </small></em> <small>(provisional)</small></span></td>`;
					} else {
						buffer += `<td>${Math.trunc(row.gxe)}<small>.${row.gxe.toFixed(1).slice(-1)}%</small></td>`;
						buffer += `<td><em>${Math.round(row.rpr)} <small> &#177; ${Math.round(row.rprd)}</small></em></td>`;
					}
					const N = parseInt(row.w, 10) + parseInt(row.l, 10) + parseInt(row.t, 10);
					const COIL_B = undefined;

					// Uncomment this after LadderRoom logic is implemented
					// COIL_B = LadderRoom?.COIL_B[formatId];

					if (COIL_B) {
						buffer += `<td>${Math.round(40.0 * parseFloat(row.gxe) * 2.0 ** (-COIL_B / N))}</td>`;
					} else {
						buffer += '<td>&mdash;</td>';
					}
					buffer += `<td> ${row.w} </td><td> ${row.l} </td><td> ${N} </td>`;
					if (suspect) {
						if (typeof row.suspect === 'undefined') {
							buffer += '<td>&mdash;</td>';
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
						const formatsText = Object.keys(gens).concat(Object.keys(formats)).join(', ');
						buffer += `<tr class="no-matches"><td colspan="8">` +
							BattleLog.html`<em>This user has not played any ladder games that match ${formatsText}.</em></td></tr>`;
					}
					const otherFormats = hiddenFormats.slice(0, 3).join(', ') +
						(hiddenFormats.length > 3 ? ` and ${hiddenFormats.length - 3} other formats` : '');
					buffer += `<tr><td colspan="8"><button name="showOtherFormats">` +
						BattleLog.html`${otherFormats} not shown</button></td></tr>`;
				}
				let userid = toID(targets[0]);
				let registered = PS.user.registered;
				if (registered && PS.user.userid === userid) {
					buffer += `<tr><td colspan="8" style="text-align:right"><a href="//${PS.routes.users}/${userid}">Reset W/L</a></tr></td>`;
				}
				buffer += '</table></div>';
				this.add(`|html|${buffer}`);
			});
		},

		// battle-specific commands
		// ------------------------
		'play'() {
			if (!this.battle) return this.add('|error|You are not in a battle');
			if (this.battle.atQueueEnd) {
				this.battle.reset();
			}
			this.battle.play();
			this.update(null);
		},
		'pause'() {
			if (!this.battle) return this.add('|error|You are not in a battle');
			this.battle.pause();
			this.update(null);
		},
		'ffto,fastfowardto'(target) {
			if (!this.battle) return this.add('|error|You are not in a battle');
			let turnNum = Number(target);
			if (target.startsWith('+') || turnNum < 0) {
				turnNum += this.battle.turn;
				if (turnNum < 0) turnNum = 0;
			} else if (target === 'end') {
				turnNum = Infinity;
			}
			if (isNaN(turnNum)) {
				this.receiveLine([`error`, `/ffto - Invalid turn number: ${target}`]);
				return;
			}
			this.battle.seekTurn(turnNum);
			this.update(null);
		},
		'switchsides'() {
			if (!this.battle) return this.add('|error|You are not in a battle');
			this.battle.switchViewpoint();
		},
		'cancel,undo'() {
			if (!this.battle) return this.send('/cancelchallenge');

			const room = this as any as BattleRoom;
			if (!room.choices || !room.request) {
				this.receiveLine([`error`, `/choose - You are not a player in this battle`]);
				return;
			}
			if (room.choices.isDone() || room.choices.isEmpty()) {
				this.sendDirect('/undo');
			}
			room.choices = new BattleChoiceBuilder(room.request);
			this.update(null);
		},
		'move,switch,team,pass,shift,choose'(target, cmd) {
			if (!this.battle) return this.add('|error|You are not in a battle');
			const room = this as any as BattleRoom;
			if (!room.choices) {
				this.receiveLine([`error`, `/choose - You are not a player in this battle`]);
				return;
			}
			if (cmd !== 'choose') target = `${cmd} ${target}`;
			const possibleError = room.choices.addChoice(target);
			if (possibleError) {
				this.receiveLine([`error`, possibleError]);
				return;
			}
			if (room.choices.isDone()) this.sendDirect(`/choose ${room.choices.toString()}`);
			this.update(null);
		},
	});
	openChallenge() {
		if (!this.pmTarget) {
			this.add(`|error|Can only be used in a PM.`);
			return;
		}
		this.challengeMenuOpen = true;
		this.update(null);
	}
	cancelChallenge() {
		if (!this.pmTarget) {
			this.add(`|error|Can only be used in a PM.`);
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
	markUserActive(name: string) {
		const userid = toID(name);
		const idx = this.userActivity.indexOf(userid);
		if (idx !== -1) {
			this.userActivity.splice(idx, 1);
		}
		this.userActivity.push(userid);
		if (this.userActivity.length > 100) {
			// Prune the list
			this.userActivity.splice(0, 20);
		}
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
		if (!username) return;

		const userid = toID(username);
		if (!(userid in this.users)) this.userCount++;
		this.users[userid] = username;
		this.update(null);
	}
	removeUser(username: string, noUpdate?: boolean) {
		if (!username) return;

		const userid = toID(username);
		if (userid in this.users) {
			this.userCount--;
			delete this.users[userid];
			if (!noUpdate) this.update(null);
		}
	}
	renameUser(username: string, oldUsername: string) {
		this.removeUser(oldUsername, true);
		this.addUser(username);
		this.update(null);
	}

	handleJoinLeave(action: 'join' | 'leave', name: string, silent: boolean) {
		if (action === 'join') {
			this.addUser(name);
		} else if (action === 'leave') {
			this.removeUser(name);
		}
		const showjoins = PS.prefs.showjoins?.[PS.server.id];
		if (!(showjoins?.[this.id] ?? showjoins?.['global'] ?? !silent)) return;

		this.joinLeave ||= {
			join: [],
			leave: [],
			messageId: `joinleave-${Date.now()}`,
		};
		if (action === 'join' && this.joinLeave['leave'].includes(name)) {
			this.joinLeave['leave'].splice(this.joinLeave['leave'].indexOf(name), 1);
		} else if (action === 'leave' && this.joinLeave['join'].includes(name)) {
			this.joinLeave['join'].splice(this.joinLeave['join'].indexOf(name), 1);
		} else {
			this.joinLeave[action].push(name);
		}

		let message = this.formatJoinLeave(this.joinLeave['join'], 'joined');
		if (this.joinLeave['join'].length && this.joinLeave['leave'].length) message += '; ';
		message += this.formatJoinLeave(this.joinLeave['leave'], 'left');

		this.add(`|uhtml|${this.joinLeave.messageId}|<small style="color: #555555">${message}</small>`);
	}

	formatJoinLeave(preList: string[], action: 'joined' | 'left') {
		if (!preList.length) return '';

		let message = '';
		let list: string[] = [];
		let named: { [key: string]: boolean } = {};
		for (let item of preList) {
			if (!named[item]) list.push(item);
			named[item] = true;
		}
		for (let j = 0; j < list.length; j++) {
			if (j >= 5) {
				message += `, and ${(list.length - 5)} others`;
				break;
			}
			if (j > 0) {
				if (j === 1 && list.length === 2) {
					message += ' and ';
				} else if (j === list.length - 1) {
					message += ', and ';
				} else {
					message += ', ';
				}
			}
			message += BattleLog.escapeHTML(list[j]);
		}
		return `${message} ${action}`;
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
	room: ChatRoom, onMessage: (msg: string) => void, onKey: (e: KeyboardEvent) => boolean,
	left?: number, tinyLayout?: boolean,
}> {
	subscription: PSSubscription | null = null;
	textbox: HTMLTextAreaElement = null!;
	miniedit: MiniEdit | null = null;
	history: string[] = [];
	historyIndex = 0;
	tabComplete: {
		candidates: { userid: string, prefixIndex: number }[],
		candidateIndex: number,
		/** the text left of the cursor before tab completing */
		prefix: string,
		/** the text left of the cursor after tab completing */
		cursor: string,
	} | null = null;
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
			this.setValue('/', 1);
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
		if (!this.miniedit) {
			const textbox = this.textbox;
			textbox.style.height = `12px`;
			const newHeight = Math.min(Math.max(textbox.scrollHeight - 2, 16), 600);
			textbox.style.height = `${newHeight}px`;
		}
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
		this.setValue('', 0);
		this.update();
		return true;
	}
	onKeyDown = (e: KeyboardEvent) => {
		if (this.handleKey(e) || this.props.onKey(e)) {
			e.preventDefault();
			e.stopImmediatePropagation();
		}
	};

	// Direct manipulation functions
	getValue() {
		return this.miniedit ? this.miniedit.getValue() : this.textbox.value;
	}
	setValue(value: string, start: number, end = start) {
		if (this.miniedit) {
			this.miniedit.setValue(value, { start, end });
		} else {
			this.textbox.value = value;
			this.textbox.setSelectionRange?.(start, end);
		}
	}
	getSelection() {
		const value = this.getValue();
		let { start, end } = this.miniedit ?
			(this.miniedit.getSelection() || { start: value.length, end: value.length }) :
			{ start: this.textbox.selectionStart, end: this.textbox.selectionEnd };
		return { value, start, end };
	}
	setSelection(start: number, end: number) {
		if (this.miniedit) {
			this.miniedit.setSelection({ start, end });
		} else {
			this.textbox.setSelectionRange?.(start, end);
		}
	}
	replaceSelection(text: string) {
		if (this.miniedit) {
			this.miniedit.replaceSelection(text);
		} else {
			const { value, start, end } = this.getSelection();
			const newSelection = start + text.length;
			this.setValue(value.slice(0, start) + text + value.slice(end), newSelection);
		}
	}

	historyUp(ifSelectionCorrect?: boolean) {
		if (ifSelectionCorrect) {
			const { value, start, end } = this.getSelection();
			if (start !== end) return false; // never traverse history if text is selected
			if (end !== 0) {
				if (end < value.length) return false; // only go up at start or end of line
			}
		}

		if (this.historyIndex === 0) return false;
		const line = this.getValue();
		if (line !== '') this.history[this.historyIndex] = line;
		const newValue = this.history[--this.historyIndex];
		this.setValue(newValue, newValue.length);
		return true;
	}
	historyDown(ifSelectionCorrect?: boolean) {
		if (ifSelectionCorrect) {
			const { value, start, end } = this.getSelection();
			if (start !== end) return false; // never traverse history if text is selected
			if (end < value.length) return false; // only go down at end of line
		}

		const line = this.getValue();
		if (line !== '') this.history[this.historyIndex] = line;
		if (this.historyIndex === this.history.length) {
			if (!line) return false;
			this.setValue('', 0);
		} else if (++this.historyIndex === this.history.length) {
			this.setValue('', 0);
		} else {
			const newValue = this.history[this.historyIndex];
			this.setValue(newValue, newValue.length);
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
		} else if (ev.keyCode === 13) { // enter
			this.replaceSelection('\n');
			return true;
		} else if (ev.keyCode === 73 && cmdKey) { // Ctrl + I key
			return this.toggleFormatChar('_');
		} else if (ev.keyCode === 66 && cmdKey) { // Ctrl + B key
			return this.toggleFormatChar('*');
		} else if (ev.keyCode === 192 && cmdKey) { // Ctrl + ` key
			return this.toggleFormatChar('`');
		} else if (ev.keyCode === 9 && !ev.ctrlKey) { // Tab key
			const reverse = !!ev.shiftKey; // Shift+Tab reverses direction
			return this.handleTabComplete(reverse);
		} else if (ev.keyCode === 38 && !ev.shiftKey && !ev.altKey) { // Up key
			return this.historyUp(true);
		} else if (ev.keyCode === 40 && !ev.shiftKey && !ev.altKey) { // Down key
			return this.historyDown(true);
		} else if (ev.keyCode === 27) { // esc
			if (this.undoTabComplete()) {
				return true;
			}
			if (PS.room !== PS.panel) { // only close if in mini-room mode
				PS.leave(PS.room.id);
				return true;
			}
		// } else if (e.keyCode === 32 && PS.user.lastPM && ['/reply', '/r', '/R'].includes(this.getValue())) { // '/reply ' is being written
		// 	const newValue = `/pm ${PS.user.lastPM}, `;
		// 	this.setValue(newValue, newValue.length);
		// 	return true;
		}
		return false;
	}
	// TODO - add support for commands tabcomplete
	handleTabComplete(reverse: boolean) {
		// Don't tab complete at the start of the text box.
		let { value, start, end } = this.getSelection();
		if (start !== end || end === 0) return false;

		const users = this.props.room.users;
		let prefix = value.slice(0, end);
		if (this.tabComplete && prefix === this.tabComplete.cursor) {
			// The user is cycling through the candidate names.
			if (reverse) {
				this.tabComplete.candidateIndex--;
				if (this.tabComplete.candidateIndex < 0) {
					this.tabComplete.candidateIndex = this.tabComplete.candidates.length - 1;
				}
			} else {
				this.tabComplete.candidateIndex++;
				if (this.tabComplete.candidateIndex >= this.tabComplete.candidates.length) {
					this.tabComplete.candidateIndex = 0;
				}
			}
		} else if (!value || reverse) {
			// not tab completing - let them focus things
			return false;
		} else {
			// This is a new tab completion.
			// There needs to be non-whitespace to the left of the cursor.
			// no command prefixes either, we're testing for usernames here.
			prefix = prefix.trim();

			/** match of the closest word left of the cursor */
			const match1 = /^([\s\S!/]*?)([A-Za-z0-9][^, \n]*)$/.exec(prefix);
			/** match of the closest two words left of the cursor */
			const match2 = /^([\s\S!/]*?)([A-Za-z0-9][^, \n]* [^, ]*)$/.exec(prefix);
			if (!match1 && !match2) return true;

			const idprefix = (match1 ? toID(match1[2]) : '');
			let spaceprefix = (match2 ? match2[2].replace(/[^A-Za-z0-9 ]+/g, '').toLowerCase() : '');
			const candidates: { userid: string, prefixIndex: number }[] = [];
			if (match2 && (match2[0] === '/' || match2[0] === '!')) spaceprefix = '';
			for (const userid in users) {
				if (spaceprefix && users[userid].slice(1).replace(/[^A-Za-z0-9 ]+/g, '')
					.toLowerCase()
					.startsWith(spaceprefix)) {
					if (match2) candidates.push({ userid, prefixIndex: match2[1].length });
				} else if (idprefix && userid.startsWith(idprefix)) {
					if (match1) candidates.push({ userid, prefixIndex: match1[1].length });
				}
			}
			// Sort by most recent to speak in the chat, or, in the case of a tie,
			// in alphabetical order.
			const userActivity = this.props.room.userActivity;
			candidates.sort((a, b) => {
				if (a.prefixIndex !== b.prefixIndex) {
					// shorter prefix length comes first
					return a.prefixIndex - b.prefixIndex;
				}
				const aIndex = userActivity?.indexOf(a.userid) ?? -1;
				const bIndex = userActivity?.indexOf(b.userid) ?? -1;
				if (aIndex !== bIndex) {
					return bIndex - aIndex; // -1 is fortunately already in the correct order
				}
				return (a.userid < b.userid) ? -1 : 1; // alphabetical order
			});

			if (!candidates.length) {
				this.tabComplete = null;
				return true;
			}
			this.tabComplete = {
				candidates,
				candidateIndex: 0,
				prefix,
				cursor: prefix,
			};
		}
		// Substitute in the tab-completed name
		const candidate = this.tabComplete.candidates[this.tabComplete.candidateIndex];
		let name = users[candidate.userid];
		if (!name) return true;

		name = Dex.getShortName(name.slice(1)); // Remove rank and busy characters
		const cursor = this.tabComplete.prefix.slice(0, candidate.prefixIndex) + name;
		this.setValue(cursor + value.slice(end), cursor.length);
		this.tabComplete.cursor = cursor;
		return true;
	}
	undoTabComplete() {
		if (!this.tabComplete) return false;
		const value = this.getValue();
		if (!value.startsWith(this.tabComplete.cursor)) return false;

		this.setValue(this.tabComplete.prefix + value.slice(this.tabComplete.cursor.length), this.tabComplete.prefix.length);
		this.tabComplete = null;
		return true;
	}
	toggleFormatChar(formatChar: string) {
		let { value, start, end } = this.getSelection();

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
		value = value.slice(0, start) + wrap + value.slice(start, end) + wrap + value.slice(end);
		start += 2;
		end += 2;

		// prevent nesting
		const nesting = wrap + wrap;
		if (value.slice(start - 4, start) === nesting) {
			value = value.slice(0, start - 4) + value.slice(start);
			start -= 4;
			end -= 4;
		} else if (start !== end && value.slice(start - 2, start + 2) === nesting) {
			value = value.slice(0, start - 2) + value.slice(start + 2);
			start -= 2;
			end -= 4;
		}
		if (value.slice(end, end + 4) === nesting) {
			value = value.slice(0, end) + value.slice(end + 4);
		} else if (start !== end && value.slice(end - 2, end + 2) === nesting) {
			value = value.slice(0, end - 2) + value.slice(end + 2);
			end -= 2;
		}

		this.setValue(value, start, end);
		return true;
	}
	override render() {
		const OLD_TEXTBOX = false;
		const canTalk = PS.user.named || this.props.room.id === 'dm-';
		return <div
			class="chat-log-add hasuserlist" onClick={this.focusIfNoSelection} style={{ left: this.props.left || 0 }}
		>
			<form class={`chatbox${this.props.tinyLayout ? ' nolabel' : ''}`} style={canTalk ? {} : { display: 'none' }}>
				<label style={{ color: BattleLog.usernameColor(PS.user.userid) }}>{PS.user.name}:</label>
				{OLD_TEXTBOX ? <textarea
					class={this.props.room.connected && canTalk ? 'textbox autofocus' : 'textbox disabled'}
					autofocus
					rows={1}
					onInput={this.update}
					onKeyDown={this.onKeyDown}
					style={{ resize: 'none', width: '100%', height: '16px', padding: '2px 3px 1px 3px' }}
					placeholder={PSView.focusPreview(this.props.room)}
				/> : <ChatTextBox
					disabled={!this.props.room.connected || !canTalk}
					placeholder={PSView.focusPreview(this.props.room)}
				/>}
			</form>
			{!canTalk && <button data-href="login" class="button autofocus">
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
	handleFocus = () => {
		PSView.setTextboxFocused(true);
	};
	handleBlur = () => {
		PSView.setTextboxFocused(false);
	};
	override render() {
		return <pre
			class={`textbox textbox-empty ${this.props.disabled ? ' disabled' : ' autofocus'}`} placeholder={this.props.placeholder}
			onFocus={this.handleFocus} onBlur={this.handleBlur}
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
		super.componentDidMount();
		this.subscribeTo(PS.user, () => {
			this.props.room.updateTarget();
		});
	}
	send = (text: string) => {
		this.props.room.send(text);
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
			<ChatLog class="chat-log" room={this.props.room} left={tinyLayout ? 0 : 146} top={room.tour?.info.isActive ? 30 : 0}>
				{challengeTo}{challengeFrom}{PS.isOffline && <p class="buttonbar">
					<button class="button" data-cmd="/reconnect"><i class="fa fa-plug"></i> <strong>Reconnect</strong></button>
				</p>}
			</ChatLog>
			{room.tour && <TournamentBox tour={room.tour} left={tinyLayout ? 0 : 146} />}
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
						<strong><em style={{ color }}>{name.slice(1)}</em></strong>
					) : group.type === 'staff' ? (
						<strong style={{ color }}>{name.slice(1)}</strong>
					) : (
						<span style={{ color }}>{name.slice(1)}</span>
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
			room.log.getHighlight = room.handleHighlight;
			if (room.backlog) {
				const backlog = room.backlog;
				room.backlog = null;
				for (const args of backlog) {
					room.log.add(args, undefined, undefined, PS.prefs.timestamps[room.pmTarget ? 'pms' : 'chatrooms']);
				}
			}
			this.subscription = room.subscribe(tokens => {
				if (!tokens) return;
				this.props.room.log!.add(tokens, undefined, undefined, PS.prefs.timestamps[room.pmTarget ? 'pms' : 'chatrooms']);
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
