import preact from "../js/lib/preact";
import { Dex, toRoomid } from "./battle-dex";
import { BattleLog } from "./battle-log";
import { PSModel, type PSSubscription } from "./client-core";
import { PS, type RoomID, type Team } from "./client-main";
import { TeamForm } from "./panel-mainmenu";
import type { Args } from "./battle-text-parser";
import type { ChatRoom } from "./panel-chat";
// we check window.d3 before using it, so d3 doesn't need to be loaded before this file
import * as d3 from 'd3';
import { PSPanelWrapper, PSRoomPanel } from "./panels";

interface TreeNode {
	children?: TreeNode[];
}
interface TournamentTreeBracketNode extends TreeNode {
	parent?: TournamentTreeBracketNode;
	children?: TournamentTreeBracketNode[];
	x: number;
	y: number;
	state: string;
	team: string;
	room: string;
	result: string;
	score: [number, number];
}
interface TournamentElimBracketNode extends TournamentTreeBracketNode {
	parent?: TournamentElimBracketNode;
	children?: TournamentElimBracketNode[];
	team1: string;
	team2: string;
	highlightLink?: boolean;
	abbreviated?: boolean;
}
interface TournamentTreeBracketData {
	type: 'tree';
	users: string[];
	rootNode: TournamentTreeBracketNode;
}
interface TournamentTableBracketData {
	type: 'table';
	users: string[];
	tableContents: {
		state: string,
		room: string,
		result: string,
		score: [number, number],
	}[][];
	tableHeaders: {
		rows: string[],
		cols: string[],
	};
	scores: number[];
}
type TournamentInfo = {
	format?: string,
	teambuilderFormat?: string,
	generator?: string,
	isActive?: boolean,
	isJoined?: boolean,
	isStarted?: boolean,
	challenging?: string | null,
	challenged?: string | null,
	challenges?: string[],
	challengeBys?: string[],
	bracketData?: TournamentTreeBracketData | TournamentTableBracketData,
};
export class ChatTournament extends PSModel {
	info: TournamentInfo = {};
	updates: TournamentInfo = {};
	room: ChatRoom;
	boxVisible = false;
	selectedChallenge = 0;
	joinLeave: { join: string[], leave: string[], messageId: string } | null = null;
	constructor(room: ChatRoom) {
		super();
		this.room = room;
	}
	tryAdd(line: string) {
		if (PS.prefs.tournaments === 'hide') return false;
		this.room.add(line);
		return true;
	}
	static arrayToPhrase(array: string[], finalSeparator = 'and') {
		if (array.length <= 1)
			return array.join();
		return `${array.slice(0, -1).join(", ")} ${finalSeparator} ${array.slice(-1)[0]}`;
	}
	handleJoinLeave(action: 'join' | 'leave', name: string) {
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
		if (!this.joinLeave[action].includes(name)) this.joinLeave[action].push(name);
		let message = this.joinLeave['join'].length ?
			ChatTournament.arrayToPhrase(this.joinLeave['join']) + ' joined the tournament' :
			'';
		if (this.joinLeave['join'].length && this.joinLeave['leave'].length) message += '; ';
		message += this.joinLeave['leave'].length ?
			ChatTournament.arrayToPhrase(this.joinLeave['leave']) + ' left the tournament' :
			'';

		this.tryAdd(`|uhtml|${this.joinLeave.messageId}|<div class="tournament-message-joinleave">${message}.</div>`);
	}
	tournamentName() {
		if (!this.info.format || !this.info.generator) return "";
		const formatName = BattleLog.formatName(this.info.format);
		const type = this.info.generator;
		return `${formatName} ${type} Tournament`;
	}
	receiveLine(args: Args) {
		const data = args.slice(2);
		const notify = PS.prefs.tournaments === 'notify' || this.info.isJoined;
		let cmd = args[1].toLowerCase();
		if (args[0] === 'tournaments') {
			switch (cmd) {
			case 'info':
				const tournaments = JSON.parse(data.join('|'));
				let buf = `<div class="infobox tournaments-info">`;
				if (tournaments.length <= 0) {
					buf += `No tournaments are currently running.`;
				} else {
					buf += `<ul>`;
					for (const tournament of tournaments) {
						const formatName = BattleLog.formatName(tournament.format);
						buf += `<li>`;
						buf += BattleLog.html`<a class="ilink" href="${toRoomid(tournament.room)}">${tournament.room}</a>`;
						buf += BattleLog.html`: ${formatName} ${tournament.generator}${tournament.isStarted ? " (Started)" : ""}`;
						buf += `</li>`;
					}
					buf += `</ul>`;
				}
				buf += '</div>';
				this.tryAdd(`|html|${buf}`);
				break;

			default:
				return true;
			}
		} else if (args[0] === 'tournament') {
			switch (cmd) {
			case 'create': {
				this.info.format = args[2];
				this.info.generator = args[3];
				const formatName = BattleLog.formatName(args[2]);
				const type = args[3];
				const buf = BattleLog.html`<div class="tournament-message-create">${this.tournamentName()} created.</div>`;
				if (!this.tryAdd(`|html|${buf}`)) {
					const hiddenBuf = BattleLog.html`<div class="tournament-message-create">${this.tournamentName()} created (and hidden).</div>`;
					this.room.add(`|html|${hiddenBuf}`);
				}
				if (notify) {
					this.room.notify({
						title: "Tournament created",
						body: `Room: ${this.room.title}\nFormat: ${formatName}\nType: ${type}`,
						id: 'tournament-create',
					});
				}
				break;
			}

			case 'join':
			case 'leave': {
				this.handleJoinLeave(cmd, args[2]);
				break;
			}

			case 'replace': {
				this.tryAdd(`||${args[3]} has joined the tournament, replacing ${args[4]}.`);
				break;
			}

			case 'start':
				this.room.dismissNotification('tournament-create');
				if (!this.info.isJoined) {
					this.boxVisible = false;
				} else if (this.info.teambuilderFormat?.startsWith('gen5') && !Dex.loadedSpriteData['bw']) {
					Dex.loadSpriteData('bw');
				}
				let participants = data[0] ? ` (${data[0]} players)` : "";
				this.room.add(`|html|<div class="tournament-message-start">The tournament has started!${participants}</div>`);
				break;

			case 'disqualify':
				this.tryAdd(BattleLog.html`|html|<div class="tournament-message-disqualify">${data[0]} has been disqualified from the tournament.</div>`);
				break;

			case 'autodq':
				if (data[0] === 'off') {
					this.tryAdd(`|html|<div class="tournament-message-autodq-off">The tournament's automatic disqualify timer has been turned off.</div>`);
				} else if (data[0] === 'on') {
					let minutes = Math.round(parseInt(data[1]) / 1000 / 60);
					this.tryAdd(BattleLog.html`|html|<div class="tournament-message-autodq-on">The tournament's automatic disqualify timer has been set to ${minutes} minute${minutes === 1 ? "" : "s"}.</div>`);
				} else {
					let seconds = Math.floor(parseInt(data[1]) / 1000);
					PS.alert(`Please respond to the tournament within ${seconds} seconds or you may be automatically disqualified.`);
					if (notify) {
						this.room.notify({
							title: "Tournament Automatic Disqualification Warning",
							body: `Room: ${this.room.title}\nSeconds: ${seconds}`,
							id: 'tournament-autodq-warning',
						});
					}
				}
				break;

			case 'autostart':
				if (data[0] === 'off') {
					this.tryAdd(`|html|<div class="tournament-message-autostart">The tournament's automatic start is now off.</div>`);
				} else if (data[0] === 'on') {
					let minutes = (parseInt(data[1]) / 1000 / 60);
					this.tryAdd(BattleLog.html`|html|<div class="tournament-message-autostart">The tournament will automatically start in ${minutes} minute${minutes === 1 ? "" : "s"}.</div>`);
				}
				break;

			case 'scouting':
				if (data[0] === 'allow') {
					this.tryAdd(`|html|<div class="tournament-message-scouting">Scouting is now allowed (Tournament players can watch other tournament battles)</div>`);
				} else if (data[0] === 'disallow') {
					this.tryAdd(`|html|<div class="tournament-message-scouting">Scouting is now banned (Tournament players can't watch other tournament battles)</div>`);
				}
				break;

			case 'update':
				Object.assign(this.updates, JSON.parse(data.join('|')));
				break;

			case 'updateend':
				const info = { ...this.info, ...this.updates };
				if (!info.isActive) {
					if (!info.isStarted || info.isJoined)
						this.boxVisible = true;
					info.isActive = true;
				}

				if ('format' in this.updates || 'teambuilderFormat' in this.updates) {
					if (!info.teambuilderFormat) info.teambuilderFormat = info.format;
				}

				if (info.isStarted && info.isJoined) {
					// Update the challenges
					if ('challenges' in this.updates) {
						if (info.challenges?.length) {
							this.boxVisible = true;
							if (!this.info.challenges?.length) {
								// app.playNotificationSound();
								if (notify) {
									this.room.notify({
										title: "Tournament challenges available",
										body: `Room: ${this.room.title}`,
										id: 'tournament-challenges',
									});
								}
							}
						}
					}

					if ('challenged' in this.updates) {
						if (info.challenged) {
							this.boxVisible = true;
							if (!this.info.challenged) {
								if (notify) {
									this.room.notify({
										title: `Tournament challenge from ${info.challenged}`,
										body: `Room: ${this.room.title}`,
										id: 'tournament-challenged',
									});
								}
							}
						}
					}
				}

				this.info = info;
				this.updates = {};
				this.update();
				break;

			case 'battlestart': {
				const roomid = toRoomid(data[2]);
				this.tryAdd(`|uhtml|tournament-${roomid}|<div class="tournament-message-battlestart"><a href="${roomid}" class="ilink">Tournament battle between ${BattleLog.escapeHTML(data[0])} and ${BattleLog.escapeHTML(data[1])} started.</a></div>`);
				break;
			}

			case 'battleend': {
				let result = "drawn";
				if (data[2] === 'win')
					result = "won";
				else if (data[2] === 'loss')
					result = "lost";
				const message = `${BattleLog.escapeHTML(data[0])} has ${result} the match ${BattleLog.escapeHTML(data[3].split(',').join(' - '))} against ${BattleLog.escapeHTML(data[1])}${data[4] === 'fail' ? " but the tournament does not support drawing, so it did not count" : ""}.`;
				const roomid = toRoomid(data[5]);
				this.tryAdd(`|uhtml|tournament-${roomid}|<div class="tournament-message-battleend"><a href="${roomid}" class="ilink">${message}</a></div>`);
				break;
			}

			case 'end':
				let endData = JSON.parse(data.join('|'));
				this.info.format = endData.format;
				this.info.generator = endData.generator;
				if (endData.bracketData) this.info.bracketData = endData.bracketData;

				if (this.room.log) {
					const bracketNode = document.createElement('div');
					bracketNode.style.position = 'relative';
					this.room.log.addNode(bracketNode);
					preact.render(<TournamentBracket tour={this} abbreviated />, bracketNode);
				}

				this.room.add(BattleLog.html`|html|<div class="tournament-message-end-winner">Congratulations to ${ChatTournament.arrayToPhrase(endData.results[0])} for winning the ${this.tournamentName()}!</div>`);
				if (endData.results[1]) {
					this.tryAdd(BattleLog.html`|html|<div class="tournament-message-end-runnerup">Runner${endData.results[1].length > 1 ? "s" : ""}-up: ${ChatTournament.arrayToPhrase(endData.results[1])}</div>`);
				}

				// Fallthrough

			case 'forceend':
				this.room.dismissNotification('tournament-create');
				this.updates = {};

				this.info.isActive = false;
				this.boxVisible = false;

				if (cmd === 'forceend') {
					this.info = {}; // not needed; nothing to pop out
					this.room.add(`|html|<div class="tournament-message-forceend">The tournament was forcibly ended.</div>`);
				}
				// clear room's tour, so next tour gets a different tour object
				//  (and the bracket for this one's pop-out is unaffected)
				this.room.tour = null;
				this.update();
				break;

			case 'error': {
				let appendError = (message: string) => {
					this.tryAdd(`|html|<div class="tournament-message-forceend">${BattleLog.sanitizeHTML(message)}</div>`);
				};

				switch (data[0]) {
				case 'BracketFrozen':
				case 'AlreadyStarted':
					appendError("The tournament has already started.");
					break;

				case 'BracketNotFrozen':
				case 'NotStarted':
					appendError("The tournament hasn't started yet.");
					break;

				case 'UserAlreadyAdded':
					appendError("You are already in the tournament.");
					break;

				case 'AltUserAlreadyAdded':
					appendError("One of your alts is already in the tournament.");
					break;

				case 'UserNotAdded':
					appendError(`${data[1] && data[1] === PS.user.userid ? "You aren't" : "This user isn't"} in the tournament.`);
					break;

				case 'NotEnoughUsers':
					appendError("There aren't enough users.");
					break;

				case 'InvalidAutoDisqualifyTimeout':
				case 'InvalidAutoStartTimeout':
					appendError("That isn't a valid timeout value.");
					break;

				case 'InvalidMatch':
					appendError("That isn't a valid tournament matchup.");
					break;

				case 'UserNotNamed':
					appendError("You must have a name in order to join the tournament.");
					break;

				case 'Full':
					appendError("The tournament is already at maximum capacity for users.");
					break;

				case 'AlreadyDisqualified':
					appendError(`${data[1] && data[1] === PS.user.userid ? "You have" : "This user has"} already been disqualified.`);
					break;

				case 'Banned':
					appendError("You are banned from entering tournaments.");
					break;

				default:
					appendError("Unknown error: " + data[0]);
					break;
				}
				break;
			}

			default:
				return true;
			}
		}
	}
}

export class TournamentBox extends preact.Component<{ tour: ChatTournament, left?: number }> {
	subscription!: PSSubscription;
	override componentDidMount(): void {
		this.subscription = this.props.tour.subscribe(() => {
			this.forceUpdate();
		});
	}
	override componentWillUnmount(): void {
		this.subscription.unsubscribe();
	}
	selectChallengeUser(ev: Event) {
		const target = ev.target as HTMLSelectElement;
		if (target.tagName !== 'SELECT') return;
		const selectedIndex = target.selectedIndex;
		if (selectedIndex < 0) return;
		this.props.tour.selectedChallenge = selectedIndex;
		this.forceUpdate();
	}
	acceptChallenge = (ev: Event, format: string, team?: Team) => {
		const tour = this.props.tour;
		const room = tour.room;
		const packedTeam = team ? team.packedTeam : '';
		PS.send(`|/utm ${packedTeam}`);
		if (tour.info.challenged) {
			room.send(`/tournament acceptchallenge`);
		} else if (tour.info.challenges?.length) {
			const target = tour.info.challenges[tour.selectedChallenge] || tour.info.challenges[0];
			room.send(`/tournament challenge ${target}`);
		}
		room.update(null);
	};
	validate = (ev: Event, format: string, team?: Team) => {
		const room = this.props.tour.room;
		const packedTeam = team ? team.packedTeam : '';
		PS.send(`|/utm ${packedTeam}`);
		room.send(`/tournament vtm`);
		room.update(null);
	};
	toggleBoxVisibility = () => {
		this.props.tour.boxVisible = !this.props.tour.boxVisible;
		this.forceUpdate();
	};
	renderTournamentTools() {
		const tour = this.props.tour;
		const info = tour.info;
		if (!info.isJoined) {
			if (info.isStarted) return null;
			return <div class="tournament-tools">
				<p>
					<button data-cmd="/tournament join" class="button"><strong>Join</strong></button> {}
					<button onClick={this.toggleBoxVisibility} class="button">Close</button>
				</p>
			</div>;
		}

		// joined
		const noMatches = !info.challenges?.length && !info.challengeBys?.length && !info.challenging && !info.challenged;
		return <div class="tournament-tools">
			<TeamForm
				format={info.format} teamFormat={info.teambuilderFormat} hideFormat
				onSubmit={this.acceptChallenge} onValidate={this.validate}
			>
				{(info.isJoined && !info.challenging && !info.challenged && !info.challenges?.length) && (
					<button name="validate" class="button"><i class="fa fa-check" aria-hidden></i> Validate</button>
				)} {}
				{!!(!info.isStarted && info.isJoined) && (
					<button data-cmd="/tournament leave" class="button">Leave</button>
				)}
				{(info.isStarted && noMatches) && (
					<div class="tournament-nomatches">Waiting for battles to become available...</div>
				)}
				{!!info.challenges?.length && <div class="tournament-challenge">
					<div class="tournament-challenge-user">vs. {info.challenges[tour.selectedChallenge]}</div>
					<button type="submit" class="button"><strong>Ready!</strong></button>
					{info.challenges.length > 1 && <span class="tournament-challenge-user-menu">
						<select onChange={this.selectChallengeUser}>
							{info.challenges.map((challenge, index) => (
								<option value={index} selected={index === tour.selectedChallenge}>{challenge}</option>
							))}
						</select>
					</span>}
				</div>}
				{!!info.challengeBys?.length && <div class="tournament-challengeby">
					{info.challenges?.length ? "Or wait" : "Waiting"} for {ChatTournament.arrayToPhrase(info.challengeBys, "or")} {}
					to challenge you.
				</div>}
				{!!info.challenging && <div class="tournament-challenging">
					<div class="tournament-challenging-message">Waiting for {info.challenging}...</div>
					<button data-cmd="/tournament cancelchallenge" class="button">Cancel</button>
				</div>}
				{!!info.challenged && <div class="tournament-challenged">
					<div class="tournament-challenged-message">vs. {info.challenged}</div>
					<button type="submit" class="button"><strong>Ready!</strong></button>
				</div>}
			</TeamForm>
		</div>;
	}
	override render() {
		const tour = this.props.tour;
		const info = tour.info;
		return <div class={`tournament-wrapper ${info.isActive ? 'active' : ''}`} style={{ left: this.props.left || 0 }}>
			<button class="tournament-title" onClick={this.toggleBoxVisibility}>
				<span class="tournament-status">{info.isStarted ? "In Progress" : "Signups"}</span>
				{tour.tournamentName()}
				{tour.boxVisible ? <i class="fa fa-caret-up" aria-hidden></i> : <i class="fa fa-caret-down" aria-hidden></i>}
			</button>
			<div class={`tournament-box ${tour.boxVisible ? 'active' : ''}`}>
				<TournamentBracket tour={tour} />
				{this.renderTournamentTools()}
			</div>
		</div>;
	}
}

export class TournamentBracket extends preact.Component<{
	tour: ChatTournament, poppedOut?: boolean, abbreviated?: boolean,
}> {
	subscription!: PSSubscription;
	renderTableBracket(data: TournamentTableBracketData) {
		if (data.tableContents.length === 0)
			return null;

		if (data.tableHeaders.rows.length > 4 && this.props.abbreviated) {
			let rows = data.tableHeaders.rows.map((row, i) => ({
				name: row,
				score: data.scores[i],
			}));
			rows.sort((a, b) => b.score - a.score);
			rows = rows.slice(0, 4);
			return <div class="pad"><table class="tournament-bracket-table" style="border-bottom-width:0">
				{rows.map((row, i) => (
					<tr>
						<th>{row.name}</th><td>{row.score}</td>
						<td class="tournament-bracket-table-cell-null">{i < 3 ? (
							<i class="fa fa-trophy" aria-hidden style={{ color: ['#d6c939', '#adb2bb', '#ca8530'][i] }}></i>
						) : null}</td>
					</tr>
				))}
				<tr><th colSpan={2}>...</th><td class="tournament-bracket-table-cell-null"></td></tr>
			</table></div>;
		}

		return <div class="pad"><table class="tournament-bracket-table">
			<tr>
				<td class="empty"></td>
				{data.tableHeaders.cols.map(name => <th>{name}</th>)}
			</tr>
			{data.tableHeaders.rows.map((name, r) => <tr>
				<th>{name}</th>
				{data.tableContents[r].map(cell => cell ? (
					<td
						class={`tournament-bracket-table-cell-${cell.state}${cell.state === 'finished' ? (
							`tournament-bracket-table-cell-result-${cell.result}`
						) : ''}`}
					>
						{cell.state === 'unavailable' ? (
							"Unavailable"
						) : cell.state === 'available' ? (
							"Waiting"
						) : cell.state === 'challenging' ? (
							"Challenging"
						) : cell.state === 'inprogress' ? (
							<a href={toRoomid(cell.room)} class="ilink">In-progress</a>
						) : cell.state === 'finished' ? (
							cell.score.join(" - ")
						) : null}
					</td>
				) : (
					<td class="tournament-bracket-table-cell-null"></td>
				))}
				<th class="tournament-bracket-row-score">{data.scores[r]}</th>
			</tr>)}
		</table></div>;
	}
	dragging: {
		x: number,
		y: number,
	} | null = null;
	onMouseDown = (ev: MouseEvent) => {
		const elem = this.base!;
		const canScrollVertically = elem.scrollHeight > elem.clientHeight;
		const canScrollHorizontally = elem.scrollWidth > elem.clientWidth;
		if (!canScrollVertically && !canScrollHorizontally) return;
		if (ev.button) return;

		ev.preventDefault();
		// in case mouse moves outside the element
		window.addEventListener('mousemove', this.onMouseMove);
		window.addEventListener('mouseup', this.onMouseUp);
		this.dragging = {
			x: ev.clientX,
			y: ev.clientY,
		};
		elem.style.cursor = 'grabbing';
	};
	onMouseMove = (ev: MouseEvent) => {
		if (!this.dragging) return;
		const dx = ev.clientX - this.dragging.x;
		const dy = ev.clientY - this.dragging.y;
		this.dragging.x = ev.clientX;
		this.dragging.y = ev.clientY;
		const elem = this.base!;
		elem.scrollLeft -= dx;
		elem.scrollTop -= dy;
	};
	onMouseUp = (ev: MouseEvent) => {
		if (!this.dragging) return;
		this.dragging = null;
		const elem = this.base!;
		elem.style.cursor = 'grab';
		window.removeEventListener('mousemove', this.onMouseMove);
		window.removeEventListener('mouseup', this.onMouseUp);
	};
	override componentWillUnmount(): void {
		window.removeEventListener('mousemove', this.onMouseMove);
		window.removeEventListener('mouseup', this.onMouseUp);
	}
	override componentDidUpdate() {
		const elem = this.base!;
		const canScrollVertically = elem.scrollHeight > elem.clientHeight;
		const canScrollHorizontally = elem.scrollWidth > elem.clientWidth;
		if (!canScrollVertically && !canScrollHorizontally) {
			elem.style.cursor = 'default';
		} else {
			elem.style.cursor = 'grab';
		}
	}
	override componentDidMount() {
		this.componentDidUpdate();
	}
	popOut = (ev: Event) => {
		PS.join('tourpopout' as RoomID, {
			parentElem: ev.currentTarget as HTMLElement,
			args: { tour: this.props.tour },
		});
		ev.stopImmediatePropagation();
		ev.preventDefault();
	};
	render() {
		const data = this.props.tour.info.bracketData;
		return <div
			class={`tournament-bracket${this.props.poppedOut ? ' tournament-popout-bracket' : ''}`}
			onMouseDown={this.onMouseDown} onMouseUp={this.onMouseUp} onMouseMove={this.onMouseMove}
		>
			{data?.type === 'table' ? this.renderTableBracket(data) :
			data?.type === 'tree' ? <TournamentTreeBracket data={data} abbreviated={this.props.abbreviated} /> :
			null}
			{this.props.poppedOut ? (
				<button class="tournament-close-link button" data-cmd="/close">
					<i class="fa fa-times" aria-hidden></i> Close
				</button>
			) : (
				<button class="tournament-popout-link button" onClick={this.popOut}>
					<i class="fa fa-arrows-alt" aria-hidden></i> Pop-out
				</button>
			)}
		</div>;
	}
}
export class TournamentTreeBracket extends preact.Component<{
	data: TournamentTreeBracketData, abbreviated?: boolean,
}> {
	d3Loader: Promise<void> | null = null;
	forEachTreeNode<T extends TreeNode>(node: T, callback: (node: T, depth: number) => void, depth = 0) {
		callback(node, depth);
		if (node.children) {
			for (const child of node.children) {
				this.forEachTreeNode(child as T, callback, depth + 1);
			}
		}
	}
	cloneTree<T extends TreeNode>(node: T): T {
		const clonedNode = { ...node };
		if (node.children) {
			clonedNode.children = node.children.map(child => this.cloneTree(child));
		}
		return clonedNode;
	}
	/**
	 * Customize tree size. Height is for a single player, a full node is double that.
	 */
	static nodeSize = {
		width: 160, height: 15,
		radius: 5,
		separationX: 20, separationY: 10,
		// Safari bug: some issue with dominant-baseline. whatever, we can just manually v-align text
		textOffset: 4,
	};
	generateTreeBracket(data: TournamentTreeBracketData, abbreviated?: boolean) {
		const div = document.createElement('div');
		div.className = 'tournament-bracket-tree';

		if (!data.rootNode) {
			const users = data.users;
			if (users?.length) {
				div.innerHTML = `<b>${users.length}</b> user${users.length !== 1 ? 's' : ''}:<br />${BattleLog.escapeHTML(users.join(", "))}`;
			} else {
				div.innerHTML = `<b>0</b> users`;
			}
			return div;
		}
		if (!window.d3) {
			div.innerHTML = `<b>d3 not loaded yet</b>`;
			this.d3Loader ||= PS.libsLoaded.then(() => {
				this.forceUpdate();
			});
			return div;
		}
		this.d3Loader = null;

		let name = PS.user.name;

		// Construct the visual tree from the real tree

		const newTree = this.cloneTree(data.rootNode) as TournamentElimBracketNode;
		if (newTree.team) newTree.highlightLink = true;
		const highlightName = newTree.team; // if we have a root winner, trace it through double elim brackets

		this.forEachTreeNode(newTree, (node, depth) => {
			if (node.children?.length === 2) {
				node.team1 = node.children[0].team;
				node.team2 = node.children[1].team;
				const shouldHaveChildren = node.children.some(child => child.children?.length === 2);
				if (!shouldHaveChildren) node.children = [];
				if (depth >= 2 && node.children?.length && abbreviated) {
					node.children = [];
					node.abbreviated = true;
				}

				if (node.highlightLink) {
					for (const child of node.children) {
						if (child.team === node.team) {
							child.highlightLink = true;
						}
					}
				} else if (
					node.state === 'inprogress' || node.state === 'available' || node.state === 'challenging' ||
					node.state === 'unavailable'
				) {
					for (const child of node.children) {
						if (child.team && !child.team.startsWith('(')) {
							child.highlightLink = true;
						}
					}
				} else if (highlightName) {
					for (const child of node.children) {
						if (child.team === highlightName) {
							child.highlightLink = true;
						}
					}
				}
			}
		});

		// Calculate dimensions

		let numLeaves = 0;
		const hasLeafAtDepth: boolean[] = [];
		this.forEachTreeNode(newTree, (node, depth) => {
			hasLeafAtDepth[depth] ||= false;
			if (!node.children?.length) {
				numLeaves++;
				hasLeafAtDepth[depth] = true;
			}
		});

		// Setting `breadthCompression` to 0.8 for 3+ depths with leaves is
		// an extremely approximate guess for how tall a double+ elim tree
		// should be. The old algorithm also approximated, but its
		// approximation was arguably worse. This one is basically perfect
		// for single elim and pretty good for double elim.
		const depthsWithLeaves = hasLeafAtDepth.filter(Boolean).length;
		const breadthCompression = depthsWithLeaves > 2 ? 0.8 : 2;
		const maxBreadth = numLeaves - (depthsWithLeaves - 1) / breadthCompression;
		const maxDepth = hasLeafAtDepth.length;

		const nodeSize = TournamentTreeBracket.nodeSize;
		const size = {
			width: nodeSize.width * maxDepth + nodeSize.separationX * (maxDepth + 1),
			height: nodeSize.height * 2 * (maxBreadth + 0.5) + nodeSize.separationY * maxBreadth,
		};

		// Make d3 layout the tree

		const tree = d3.layout.tree<TournamentElimBracketNode>()
			.size([size.height, size.width - nodeSize.width - nodeSize.separationX])
			.separation(() => 1)
			.children(node => (
				node.children?.length ? node.children : null!
			));
		const nodes = tree.nodes(newTree);
		const links = tree.links(nodes);

		// Put the tree in the right place

		const layoutRoot = d3.select(div)
			.append('svg:svg').attr('width', size.width).attr('height', size.height)
			.append('svg:g')
			.attr('transform', `translate(${-(nodeSize.width) / 2 - 6},0)`);

		// Style the links between the nodes

		const diagonalLink = d3.svg.diagonal()
			.source(link => ({
				x: link.source.x, y: link.source.y + nodeSize.width / 2,
			}))
			.target(link => ({
				x: link.target.x, y: link.target.y - nodeSize.width / 2,
			}))
			.projection(link => [
				size.width - link.y, link.x,
			]);
		layoutRoot.selectAll('path.tournament-bracket-tree-link').data(links).enter()
			.append('svg:path')
			.attr('d', diagonalLink)
			.classed('tournament-bracket-tree-link', true)
			.classed('tournament-bracket-tree-link-active', link => (
				!!link.target.highlightLink
			));

		// Style the nodes themselves

		const nodeGroup = layoutRoot.selectAll('g.tournament-bracket-tree-node').data(nodes).enter()
			.append('svg:g').classed('tournament-bracket-tree-node', true).attr('transform', node => (
				`translate(${size.width - node.y},${node.x})`
			));
		nodeGroup.each(function (this: EventTarget, node) {
			let elem = d3.select(this);
			const outerElem = elem;

			if (node.abbreviated) {
				elem.append('svg:text').attr('y', -nodeSize.height / 2 + 4)
					.attr('x', -nodeSize.width / 2 - 7).classed('tournament-bracket-tree-abbreviated', true)
					.text('...');
			}

			if (node.state === 'inprogress') {
				elem = elem.append('svg:a').attr('xlink:href', toRoomid(node.room)).classed('ilink', true)
					.on('click', () => {
						const ev = d3.event as MouseEvent;
						if (ev.metaKey || ev.ctrlKey) return;
						ev.preventDefault();
						ev.stopPropagation();
						const roomid = (ev.currentTarget as Element).getAttribute('href');
						PS.join(roomid as RoomID);
					});
			}

			outerElem.classed('tournament-bracket-tree-node-match', true);
			outerElem.classed('tournament-bracket-tree-node-match-' + node.state, true);

			if (node.team && !node.team1 && !node.team2) {
				const rect = elem.append('svg:rect').classed('tournament-bracket-tree-draw', true)
					.attr('rx', nodeSize.radius)
					.attr('x', -nodeSize.width / 2).attr('width', nodeSize.width)
					.attr('y', -nodeSize.height / 2).attr('height', nodeSize.height);
				if (node.team === name) rect.attr('stroke-dasharray', '5,5').attr('stroke-width', 2);

				elem.append('svg:text').classed('tournament-bracket-tree-node-team', true)
					.attr('y', nodeSize.textOffset)
					.classed('tournament-bracket-tree-node-team-draw', true)
					.text(node.team || '');
			} else {
				const rect1 = elem.append('svg:rect')
					.attr('rx', nodeSize.radius)
					.attr('x', -nodeSize.width / 2).attr('width', nodeSize.width)
					.attr('y', -nodeSize.height).attr('height', nodeSize.height);
				const rect2 = elem.append('svg:rect')
					.attr('rx', nodeSize.radius)
					.attr('x', -nodeSize.width / 2).attr('width', nodeSize.width)
					.attr('y', 0).attr('height', nodeSize.height);
				if (node.team1 === name) rect1.attr('stroke-dasharray', '5,5').attr('stroke-width', 2);
				if (node.team2 === name) rect2.attr('stroke-dasharray', '5,5').attr('stroke-width', 2);

				const row1 = elem.append('svg:text').attr('y', -nodeSize.height / 2 + nodeSize.textOffset)
					.classed('tournament-bracket-tree-node-row1', true);
				const row2 = elem.append('svg:text').attr('y', nodeSize.height / 2 + nodeSize.textOffset)
					.classed('tournament-bracket-tree-node-row2', true);

				const team1 = row1.append('svg:tspan').classed('tournament-bracket-tree-team', true)
					.text(node.team1 || '');
				const team2 = row2.append('svg:tspan').classed('tournament-bracket-tree-team', true)
					.text(node.team2 || '');

				if (node.state === 'available') {
					elem.append('title').text("Waiting");
				} else if (node.state === 'challenging') {
					elem.append('title').text("Challenging");
				} else if (node.state === 'inprogress') {
					elem.append('title').text("In-progress");
				} else if (node.state === 'finished') {
					if (node.result === 'win') {
						rect1.classed('tournament-bracket-tree-win', true);
						rect2.classed('tournament-bracket-tree-loss', true);
						team1.classed('tournament-bracket-tree-team-win', true);
						team2.classed('tournament-bracket-tree-team-loss', true);
					} else if (node.result === 'loss') {
						rect1.classed('tournament-bracket-tree-loss', true);
						rect2.classed('tournament-bracket-tree-win', true);
						team1.classed('tournament-bracket-tree-team-loss', true);
						team2.classed('tournament-bracket-tree-team-win', true);
					} else {
						rect1.classed('tournament-bracket-tree-draw', true);
						rect2.classed('tournament-bracket-tree-draw', true);
						team1.classed('tournament-bracket-tree-team-draw', true);
						team2.classed('tournament-bracket-tree-team-draw', true);
					}

					elem.classed('tournament-bracket-tree-node-match-result-' + node.result, true);
					row1.append('svg:tspan').text(` (${node.score[0]})`).classed('tournament-bracket-tree-score', true);
					row2.append('svg:tspan').text(` (${node.score[1]})`).classed('tournament-bracket-tree-score', true);
				}
			}
		});

		return div;
	};
	override componentDidMount() {
		this.base!.appendChild(this.generateTreeBracket(this.props.data, this.props.abbreviated));
	}
	override shouldComponentUpdate(props: { data: TournamentTreeBracketData }) {
		if (props.data === this.props.data && !this.d3Loader) return false;
		this.base!.replaceChild(this.generateTreeBracket(props.data), this.base!.children[0]);
		return false;
	}
	render() {
		return <div class="pad"></div>;
	}
}

export class TourPopOutPanel extends PSRoomPanel {
	static readonly id = 'tourpopout';
	static readonly routes = ['tourpopout'];
	static readonly location = 'semimodal-popup';
	static readonly noURL = true;
	override componentDidMount() {
		const tour = this.props.room.args?.tour as ChatTournament;
		if (tour) this.subscribeTo(tour);
	}
	override render() {
		const room = this.props.room;
		const tour = room.args?.tour as ChatTournament;
		return <PSPanelWrapper room={room} fullSize>
			{tour && <TournamentBracket tour={tour} poppedOut />}
		</PSPanelWrapper>;
	}
}

PS.addRoomType(TourPopOutPanel);
