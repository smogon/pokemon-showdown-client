/**
 * Battle panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

import preact from "../js/lib/preact";
import {
	PS, PSRoom, type RoomOptions, type RoomID, Config, type BattlePanelLayout,
} from "./client-main";
import { PSIcon, PSPanelWrapper, PSRoomPanel } from "./panels";
import { ChatLog, ChatRoom, ChatTextEntry, ChatUserList } from "./panel-chat";
import { FormatDropdown } from "./panel-mainmenu";
import { Battle, type Pokemon, type ServerPokemon } from "./battle";
import { BattleScene } from "./battle-animations";
import { Dex, TL, toID, type ID } from "./battle-dex";
import {
	BattleChoiceBuilder, type BattleRequestActivePokemon, type BattleRequestSideInfo,
	type BattleRequest, type BattleMoveRequest, type BattleSwitchRequest, type BattleTeamRequest,
} from "./battle-choices";
import { BattleTextParser, type Args } from "./battle-text-parser";
import { ModifiableValue } from "./battle-tooltips";
import { Net } from "./client-connection";
import { BattleLog } from "./battle-log";

type BattleDesc = {
	id: RoomID,
	minElo?: number | string,
	p1?: string,
	p2?: string,
	p3?: string,
	p4?: string,
};
export class BattlesRoom extends PSRoom {
	override readonly classType = 'battles';
	/** null means still loading */
	format = '';
	filters = '';
	battles: BattleDesc[] | null = null;
	constructor(options: RoomOptions) {
		super(options);
		this.refresh();
		// If graphics preference is set to use BW sprites
		if (PS.prefs.bwgfx) {
			Dex.loadSpriteData('bw');
		}
	}
	setFormat(format: string) {
		if (format === this.format) return this.refresh();
		this.battles = null;
		this.format = format;
		this.update(null);
		this.refresh();
	}
	refresh() {
		PS.send(`/cmd roomlist ${toID(this.format)}, ${this.filters}`);
	}
}

class BattlesPanel extends PSRoomPanel<BattlesRoom> {
	static readonly id = 'battles';
	static readonly routes = ['battles'];
	static readonly Model = BattlesRoom;
	static readonly location = 'right';
	static readonly icon = <i class="fa fa-caret-square-o-right" aria-hidden></i>;
	static readonly title = 'Battles';
	static getTitle() {
		return TL`Battles`;
	}
	refresh = () => {
		this.props.room.refresh();
	};
	changeFormat = (e: Event) => {
		const value = (e.target as HTMLButtonElement).value;
		this.props.room.setFormat(value);
	};
	applyFilters = (e: Event) => {
		e.preventDefault();
		const minElo = this.base?.querySelector<HTMLInputElement>(`select[name=elofilter]`)?.value;
		const searchPrefix = this.base?.querySelector<HTMLInputElement>(`input[name=prefixsearch]`)?.value;
		this.props.room.filters = `${minElo || ''},${searchPrefix || ''}`;
		this.refresh();
	};
	renderBattleLink(battle: BattleDesc) {
		const format = battle.id.split('-')[1];
		const minEloMessage = typeof battle.minElo === 'number' ? TL`rated ${battle.minElo}` : battle.minElo;
		const players = TL`${battle.p1} vs. ${battle.p2}`;
		return <div key={battle.id}><a href={`/${battle.id}`} class="blocklink">
			{minEloMessage && <small style="float:right">({minEloMessage})</small>}
			<small>[{format}]</small><br />
			<em>{players}</em>
		</a></div>;
	}
	override render() {
		const room = this.props.room;
		return <PSPanelWrapper room={room}><div class="pad">
			<button class="button" style="float:right;font-size:10pt;margin-top:3px" name="closeRoom">
				<i class="fa fa-times" aria-hidden></i> {TL`[Close]`}
			</button>
			<div class="roomlist">
				<p>
					<button class="button" name="refresh" onClick={this.refresh}>
						<i class="fa fa-refresh" aria-hidden></i> {TL`[Refresh]`}
					</button> {}
					<span
						style={Dex.getPokemonIcon('meloetta-pirouette') + ';display:inline-block;vertical-align:middle'} class="picon"
						title={TL`Meloetta is PS's mascot! The Pirouette forme is Fighting-type, and represents our battles.`}
					></span>
				</p>

				<p>
					<label class="label">{TL.label(TL.term.format)}</label>
					<FormatDropdown onChange={this.changeFormat} placeholder={TL`(All formats)`} />
				</p>
				<label class="label">
					{TL.label(TL`Minimum Elo`)}<select name="elofilter" class="select" onChange={this.applyFilters}>
						<option value="none">{TL`None`}</option><option value="1100">1100</option><option value="1300">1300</option>
						<option value="1500">1500</option><option value="1700">1700</option><option value="1900">1900</option>
					</select>
				</label>

				<form class="search" onSubmit={this.applyFilters}>
					<p>
						<input type="text" name="prefixsearch" class="textbox" placeholder={TL`Username prefix`} autocomplete="off" />
						<button type="submit" class="button">{TL`[Search]`}</button>
					</p>
				</form>
				<div class="list">{!room.battles ? (
					<p>{TL`Loading...`}</p>
				) : !room.battles.length ? (
					<p>{TL`No battles are going on`}</p>
				) : (<>
					<p>{room.battles.length === 1 ? (
						TL`${1} battle`
					) : (
						TL`${room.battles.length === 100 ? '100+' : room.battles.length} battles`
					)}</p>
					{room.battles.map(battle => this.renderBattleLink(battle))}
				</>
				)}</div>
			</div>
		</div></PSPanelWrapper>;
	}
}

export class BattleRoom extends ChatRoom {
	override readonly classType = 'battle';
	declare pmTarget: null;
	declare challengeMenuOpen: false;
	declare challengingFormat: null;
	declare challengedFormat: null;

	override battle: Battle = null!;
	/** null if spectator, otherwise current player's info */
	side: BattleRequestSideInfo | null = null;
	request: BattleRequest | null = null;
	choices: BattleChoiceBuilder | null = null;
	autoTimerActivated: boolean | null = null;
	requireForfeit = false;
	/** should be false if we joined right after accepting or challenging a battle,
	  * and true if we refreshed and rejoined a battle.
		* null = initializing, we don't know yet */
	rejoining: boolean | null = null;
	overlayActive: 'move' | 'switch' | null = null;

	override interruptClose(explicit?: boolean, elem?: HTMLElement | null) {
		if (this.isPlaying() || this.requireForfeit) {
			PS.join('forfeitbattle' as RoomID, { parentElem: elem, parentRoomid: this.id });
			return TL`You are still in ${this.title}`;
		}
		return super.interruptClose(explicit, elem);
	}
	isPlaying() {
		return this.battle && !this.battle.ended && this.request && this.connectMode !== 'deleted';
	}
	updateChoiceNotification() {
		const oName = this.battle?.farSide.name;
		let title = '';
		let body = '';
		switch (this.request?.requestType) {
		case 'move':
			title = BattleTextParser.ui('notifyMoveTitle');
			body = oName ? BattleTextParser.ui('notifyMoveAgainst', { OPPONENT: oName }) : BattleTextParser.ui('notifyMove');
			break;
		case 'switch':
			title = BattleTextParser.ui('notifySwitchTitle');
			body = oName ? BattleTextParser.ui('notifySwitchAgainst', { OPPONENT: oName }) : BattleTextParser.ui('notifySwitch');
			break;
		case 'team':
			title = BattleTextParser.ui('notifyTeamTitle');
			body = oName ? BattleTextParser.ui('notifyTeamAgainst', { OPPONENT: oName }) : BattleTextParser.ui('notifyTeam');
			break;
		}

		if (!this.choices || this.choices.isDone()) body = '';

		const current = this.notifications.find(notification => notification.id === 'choice');
		if ((current?.body || '') === body) return;

		if (!body) {
			this.dismissNotification('choice');
		} else {
			this.notify({ title, body, id: 'choice', noAutoDismiss: true });
		}
	}

	override handleReconnect(): boolean | void {
		if (this.battle) {
			this.battle.stepQueue = [];
			this.battle.preemptStepQueue = [];
			this.battle.resetStep();
		}
		this.side = null;
		this.request = null;
		this.choices = null;
		this.updateChoiceNotification();
		return false;
	}

	override destroy() {
		this.request = null;
		this.choices = null;
		super.destroy();
	}

	loadReplay() {
		const replayid = this.id.slice(7);
		Net(`https://replay.pokemonshowdown.com/${replayid}.json`).get().catch(() => '').then(data => {
			try {
				const replay = JSON.parse(data);
				const [player1, player2] = replay.players;
				const players = replay.players.length === 2 ? TL`${player1} vs. ${player2}` : replay.players.join(' vs. ');
				this.title = `[${replay.format}] ${players}`;
				this.battle.stepQueue = replay.log.split('\n');
				this.battle.atQueueEnd = false;
				this.battle.pause();
				this.battle.seekTurn(0);
				this.connectMode = null;
				this.connectError = null;
				this.update(null);
			} catch {
				this.connectError = TL`Battle "${replayid}" not found`;
				if (!this.battle.stepQueue.length) {
					this.battle.scene.message(
						`<div class="broadcast-red pad"><strong>${BattleLog.escapeHTML(this.connectError)}</strong></div><br />` +
						`${TL`The battle you're looking for has expired. Battles expire after 15 minutes of inactivity unless they're saved.`}<br /><br />` +
						TL`In the future, remember to click "Save replay" to save a replay permanently.`
					);
				}
				this.update(null);
			}
		});
	}
}

class BattleDiv extends preact.Component<{ room: BattleRoom }> {
	override shouldComponentUpdate() {
		return false;
	}
	override componentDidMount() {
		const room = this.props.room;
		if (room.battle) {
			this.base!.replaceChild(room.battle.scene.$frame![0], this.base!.firstChild!);
		}
	}
	override render() {
		return <div><div class="battle"></div></div>;
	}
}

class TimerButton extends preact.Component<{ room: BattleRoom, top: number }> {
	timerInterval: ReturnType<typeof setInterval> | null = null;
	override componentWillUnmount() {
		if (this.timerInterval) {
			clearInterval(this.timerInterval);
			this.timerInterval = null;
		}
	}
	secondsToTime(seconds: number | true) {
		if (seconds === true) return '-:--';
		const minutes = Math.floor(seconds / 60);
		seconds -= minutes * 60;
		return `${minutes}:${(seconds < 10 ? '0' : '')}${seconds}`;
	}
	render() {
		let time = TL`Timer`;
		const room = this.props.room;
		if (!this.timerInterval && room.battle.kickingInactive) {
			this.timerInterval = setInterval(() => {
				if (room.choices?.isDone()) return;
				if (typeof room.battle.kickingInactive === 'number' && room.battle.kickingInactive > 1) {
					room.battle.kickingInactive--;
					if (room.battle.graceTimeLeft) room.battle.graceTimeLeft--;
					else if (room.battle.totalTimeLeft) room.battle.totalTimeLeft--;
				}
				this.forceUpdate();
			}, 1000);
		} else if (this.timerInterval && !room.battle.kickingInactive) {
			clearInterval(this.timerInterval);
			this.timerInterval = null;
		}

		let timerTicking = (room.battle.kickingInactive &&
			room.request && room.request.requestType !== "wait" && (room.choices && !room.choices.isDone())) ?
			' timerbutton-on' : '';

		if (room.battle.kickingInactive) {
			const secondsLeft = room.battle.kickingInactive;
			time = this.secondsToTime(secondsLeft);
			if (secondsLeft !== true) {
				if (secondsLeft <= 10 && timerTicking) {
					timerTicking = ' timerbutton-critical';
				}

				if (room.battle.totalTimeLeft) {
					const totalTime = this.secondsToTime(room.battle.totalTimeLeft);
					time += ` |  ${totalTime} total`;
				}
			}
		}

		return <button
			style={{ position: "absolute", right: '10px', top: `${this.props.top}px` }}
			data-href="battletimer" class={`button${timerTicking}`} role="timer"
		>
			<i class="fa fa-hourglass-start" aria-hidden></i> {time}
		</button>;
	}
};

class BattlePanel extends PSRoomPanel<BattleRoom> {
	static readonly id = 'battle';
	static readonly routes = ['battle-*', 'game-*'];
	static readonly Model = BattleRoom;
	static getTitle(room: PSRoom) {
		const { battle, title } = room as BattleRoom;
		if (title === 'Uploaded replay') return TL`Uploaded replay`;

		const p1 = battle?.sides[0]?.name;
		const p2 = battle?.sides[1]?.name;
		if (!p1 || !p2) return title;

		const [, prefix = '', mainTitle] = /^(\[[^\]]*\] )?([^]*)$/.exec(title)!;
		if (battle.gameType === 'multi' && mainTitle === `Team ${p1} vs. Team ${p2}`) {
			const player1 = TL`Team ${p1}`;
			const player2 = TL`Team ${p2}`;
			return prefix + TL`${player1} vs. ${player2}`;
		} else if (battle.gameType === 'freeforall' && mainTitle === `${p1} and friends`) {
			return prefix + TL`${p1} and friends`;
		} else if (mainTitle === `${p1} vs. ${p2}`) {
			return prefix + TL`${p1} vs. ${p2}`;
		}
		return title;
	}
	static handleDrop(ev: DragEvent) {
		const file = ev.dataTransfer?.files?.[0];
		if (file?.type === 'text/html') {
			let roomNum = 1;
			for (; roomNum < 100; roomNum++) {
				if (!PS.rooms[`battle-uploaded-${roomNum}`]) break;
			}
			file.text().then(html => {
				const titleStart = html.indexOf('<title>');
				const titleEnd = html.indexOf('</title>');
				let title = 'Uploaded replay';
				if (titleStart >= 0 && titleEnd > titleStart) {
					title = html.slice(titleStart + 7, titleEnd - 1);
					const colonIndex = title.indexOf(':');
					const hyphenIndex = title.lastIndexOf('-');
					if (hyphenIndex > colonIndex + 2) {
						title = title.substring(colonIndex + 2, hyphenIndex - 1);
					} else {
						title = title.substring(colonIndex + 2);
					}
				}
				const index1 = html.indexOf('<script type="text/plain" class="battle-log-data">');
				const index2 = html.indexOf('<script type="text/plain" class="log">');
				if (index1 < 0 && index2 < 0) {
					PS.alert(TL`Unrecognized HTML file: Only replay files are supported.`);
					return;
				}
				if (index1 >= 0) {
					html = html.slice(index1 + 50);
				} else if (index2 >= 0) {
					html = html.slice(index2 + 38);
				}
				const index3 = html.indexOf('</script>');
				html = html.slice(0, index3);
				html = html.replace(/\\\//g, '/');

				PS.join(`battle-uploaded-${roomNum}` as RoomID);
				const room = PS.rooms[`battle-uploaded-${roomNum}`] as BattleRoom;
				if (!room) return;

				room.title = title;
				room.connectMode = null;
				PS.receive(`>battle-uploaded-${roomNum}\n${html}`);
			});
			return true;
		}
	}
	renderUIText(id: string, values?: { [placeholder: string]: string | undefined }) {
		return <span
			dangerouslySetInnerHTML={{
				__html: BattleLog.parseLogMessage(BattleTextParser.ui(id, values))[0],
			}}
		></span>;
	}
	/** last displayed team. will not show the most recent request until the last one is gone. */
	team: ServerPokemon[] | null = null;
	mobileChatShown = false;
	showMobileChat = () => {
		this.mobileChatShown = true;
		this.forceUpdate();
	};
	showMobileBattle = () => {
		this.mobileChatShown = false;
		this.forceUpdate();
	};
	send = (text: string, elem?: HTMLElement) => {
		this.props.room.send(text, elem);
	};
	focusIfNoSelection = () => {
		if (window.getSelection?.()?.type === 'Range') return;
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
	toggleBoostedMove = (e: Event) => {
		const checkbox = e.currentTarget as HTMLInputElement;
		const choices = this.props.room.choices;
		if (!choices) return; // shouldn't happen
		switch (checkbox.name) {
		case 'mega':
			choices.current.mega = checkbox.checked;
			break;
		case 'megax':
			choices.current.megax = checkbox.checked;
			choices.current.megay = false;
			break;
		case 'megay':
			choices.current.megay = checkbox.checked;
			choices.current.megax = false;
			break;
		case 'ultra':
			choices.current.ultra = checkbox.checked;
			break;
		case 'z':
			choices.current.z = checkbox.checked;
			break;
		case 'max':
			choices.current.max = checkbox.checked;
			break;
		case 'tera':
			choices.current.tera = checkbox.checked;
			break;
		}
		this.props.room.update(null);
	};
	override componentDidMount() {
		const room = this.props.room;
		const $elem = $(this.base!);
		const battle = (room.battle ||= new Battle({
			id: room.id as any,
			$frame: $elem.find('.battle'),
			$logFrame: $elem.find('.battle-log'),
			log: room.backlog?.map(args => '|' + args.join('|')),
		}));
		const scene = battle.scene as BattleScene;
		room.backlog = null;
		room.log ||= scene.log;
		room.log.getHighlight = room.handleHighlight;
		scene.tooltips.unlisten(scene.$frame);
		scene.tooltips.listen(this.base!);
		super.componentDidMount();
		if (!PS.prefs.spectatefromstart) battle.seekTurn(Infinity);
		if (PS.prefs.autohardcore) {
			battle.setHardcoreMode(true);
		}
		battle.subscribe(() => this.forceUpdate());
	}
	override componentWillUnmount() {
		const scene = this.props.room.battle?.scene as BattleScene | undefined;
		if (this.base) scene?.tooltips.unlisten(this.base);
		super.componentWillUnmount();
	}
	battleHeight = 360;
	updateLayout() {
		if (!this.base) return;
		const room = this.props.room;
		if (!room.width) return;
		const { battleHeight } = this.chooseLayout();
		this.battleHeight = battleHeight;
		if (battleHeight !== 360) {
			room.battle?.scene.$frame!.css('transform', `scale(${battleHeight / 360})`);
		} else {
			room.battle?.scene.$frame!.css('transform', 'none');
		}
	}
	chooseLayout(): {
		layout: BattlePanelLayout,
		battleHeight: number,
		battleWidth: number,
		overlayControls: boolean,
	} {
		const room = this.props.room;
		return PS.chooseBattleLayout(room.width, room.height, PS.prefs.battlelayout);
	}
	fastForwardIfRejoining() {
		const room = this.props.room;
		if (!room.rejoining || !room.side) return;
		room.rejoining = false;
		room.battle.seekTurn(Infinity);
	}
	override receiveLine(args: Args) {
		const room = this.props.room;
		switch (args[0]) {
		case 'cantleave':
			room.requireForfeit = true;
			return;
		case 'allowleave':
			room.requireForfeit = false;
			return;
		case 'initdone':
			if (!PS.prefs.spectatefromstart) room.battle.seekTurn(Infinity);
			return;
		case 'request':
			this.receiveRequest(args[1] ? JSON.parse(args[1]) : null);
			return;
		case 'win': case 'tie':
			this.receiveRequest(null);
			break;
		case 'c': case 'c:': case 'chat': case 'chatmsg': case 'inactive':
			room.battle.instantAdd('|' + args.join('|'));
			return;
		case 'error':
			if (args[1].startsWith('[Invalid choice]') && room.request) {
				room.choices = new BattleChoiceBuilder(room.request);
				room.updateChoiceNotification();
				room.update(null);
			}
			break;
		case 'sentchoice':
			if (room.request) {
				let choices = new BattleChoiceBuilder(room.request);
				const possibleError = choices.addChoices(args[1]);
				if (possibleError || !choices.isDone()) {
					choices = new BattleChoiceBuilder(room.request);
					choices.serializedChoice = args[1];
				}
				room.choices = choices;
			}
			room.updateChoiceNotification();
			room.update(null);
			return;
		}
		room.battle.add('|' + args.join('|'));
		if (PS.prefs.noanim) this.props.room.battle.seekTurn(Infinity);
	}
	receiveRequest(request: BattleRequest | null) {
		const room = this.props.room;
		if (!request) {
			room.request = null;
			room.choices = null;
			room.updateChoiceNotification();
			return;
		}

		if (PS.prefs.autotimer && !room.battle.kickingInactive && !room.autoTimerActivated) {
			this.send('/timer on');
			room.autoTimerActivated = true;
		}

		BattleChoiceBuilder.fixRequest(request, room.battle);

		if (request.side) {
			const wasPlayer = !!room.side;
			room.battle.myPokemon = request.side.pokemon;
			room.battle.setViewpoint(request.side.id);
			room.side = request.side;
			if (!wasPlayer) this.fastForwardIfRejoining();
		}
		if (request.ally) {
			room.battle.myAllyPokemon = request.ally.pokemon;
		}

		room.request = request;
		room.choices = new BattleChoiceBuilder(request);
		// A reconnect can send `|sentchoice|` immediately after `|request|`.
		// Wait until the entire protocol message has been processed before notifying.
		Promise.resolve().then(() => room.updateChoiceNotification());
		room.update(null);
	}
	renderConnectError() {
		const room = this.props.room;
		if (room.connectMode !== 'deleted' && room.connectMode !== 'not-found') {
			return null;
		}
		return <div class="pad"><div class="broadcast-red pad">
			<h3>{room.connectError || TL`Error`}</h3>
			<p class="buttonbar"><button class="button" data-cmd="/close"><strong>{TL`[Close]`}</strong></button></p>
		</div></div>;
	}
	renderControls(overlayVersion = false, hidePlayerControls = false) {
		const room = this.props.room;
		if (!room.battle) return null;
		if (overlayVersion) {
			if (!room.side || !room.request || room.battle.ended) return null;
			return this.renderPlayerControls(room.request, true);
		}
		if (room.battle.ended) return this.renderAfterBattleControls();
		if (room.side && room.request) {
			if (hidePlayerControls) return null;
			return this.renderPlayerControls(room.request);
		}
		if (room.battle.stepQueue.length === 0) return null;

		const atStart = !room.battle.started;
		const atEnd = room.battle.atQueueEnd;
		return <div class="inline-controls">
			<p>
				{atEnd ? (
					<button class="button disabled" aria-disabled data-cmd="/play" style="min-width:4.5em">
						<i class="fa fa-play" aria-hidden></i><br />{TL`[Play]`}
					</button>
				) : room.battle.paused ? (
					<button class="button" data-cmd="/play" style="min-width:4.5em">
						<i class="fa fa-play" aria-hidden></i><br />{TL`[Play]`}
					</button>
				) : (
					<button class="button" data-cmd="/pause" style="min-width:4.5em">
						<i class="fa fa-pause" aria-hidden></i><br />{TL`[Pause]`}
					</button>
				)} {}
				{!room.battle.hardcoreMode && <>
					<button class={"button button-first" + (atStart ? " disabled" : "")} data-cmd="/ffto 0" style="margin-right:2px">
						<i class="fa fa-undo" aria-hidden></i><br />{TL`[First turn]`}
					</button>
					<button class={"button button-first" + (atStart ? " disabled" : "")} data-cmd="/ffto -1">
						<i class="fa fa-step-backward" aria-hidden></i><br />{TL`[Prev turn]`}
					</button>
					<button class={"button button-last" + (atEnd ? " disabled" : "")} data-cmd="/ffto +1" style="margin-right:2px">
						<i class="fa fa-step-forward" aria-hidden></i><br />{TL`[Skip turn]`}
					</button>
					<button class={"button button-last" + (atEnd ? " disabled" : "")} data-cmd="/ffto end">
						<i class="fa fa-fast-forward" aria-hidden></i><br />{TL`[Skip to end]`}
					</button>
				</>}
			</p>
			<p>
				<button class="button" data-cmd="/switchsides">
					<i class="fa fa-random" aria-hidden></i> {TL`[Switch viewpoint]`}
				</button> {}
				{!room.battle.hardcoreMode && <button class="button" data-cmd="/ffto">
					<i class="fa fa-random" aria-hidden></i> {TL`[Go to turn]`}
				</button>}
			</p>
		</div>;
	}
	renderMoveButton(props: {
		name: string, cmd: string, type: Dex.TypeName, tags: string, tooltip: string,
		moveData: { pp?: number, maxpp?: number, disabled?: boolean },
	} | null) {
		if (!props) {
			return <button class="movebutton" disabled>&nbsp;</button>;
		}
		const pp = props.moveData.maxpp ? `${props.moveData.pp!}/${props.moveData.maxpp}` : '\u2014';
		return <button
			data-cmd={props.cmd} data-tooltip={props.tooltip}
			class={`movebutton has-tooltip ${props.moveData.disabled ? 'disabled' : `type-${props.type}`}`}
			aria-disabled={props.moveData.disabled}
		>
			{props.name}<br />
			<small class="type">{props.type} <span class="effectiveness-icon">{props.tags}</span></small> {}
			<small class="pp">{pp}</small>&nbsp;
		</button>;
	}
	renderPokemonButton(props: {
		pokemon: Pokemon | ServerPokemon | null, cmd: string, noHPBar?: boolean, disabled?: boolean | 'fade', tooltip: string,
	}) {
		const pokemon = props.pokemon;
		if (!pokemon) {
			return <button
				data-cmd={props.cmd} class={`${props.disabled ? 'disabled ' : ''}has-tooltip`}
				aria-disabled={props.disabled}
				style={props.disabled === 'fade' ? 'opacity: 0.5' : ''} data-tooltip={props.tooltip}
			>
				{TL`(empty slot)`}
			</button>;
		}

		let hpColorClass;
		switch (BattleScene.getHPColor(pokemon)) {
		case 'y': hpColorClass = 'hpbar hpbar-yellow'; break;
		case 'r': hpColorClass = 'hpbar hpbar-red'; break;
		default: hpColorClass = 'hpbar'; break;
		}

		return <button
			data-cmd={props.cmd} class={`${props.disabled ? 'disabled ' : ''}has-tooltip`}
			aria-disabled={props.disabled}
			style={props.disabled === 'fade' ? 'opacity: 0.5' : ''} data-tooltip={props.tooltip}
		>
			{PSIcon({ pokemon })}
			{pokemon.name}
			{
				!props.noHPBar && !pokemon.fainted &&
				<span class={hpColorClass}>
					<span style={{ width: Math.round(pokemon.hp * 92 / pokemon.maxhp) || 1 }}></span>
				</span>
			}
			{!props.noHPBar && pokemon.status && <span class={`status ${pokemon.status}`}></span>}
		</button>;
	}
	renderMoveMenu(choices: BattleChoiceBuilder, overlayVersion?: boolean) {
		const moveRequest = choices.currentMoveRequest()!;

		const canDynamax = moveRequest.canDynamax && !choices.alreadyMax;
		const canMegaEvo = moveRequest.canMegaEvo && !choices.alreadyMega;
		const canMegaEvoX = moveRequest.canMegaEvoX && !choices.alreadyMega;
		const canMegaEvoY = moveRequest.canMegaEvoY && !choices.alreadyMega;
		const canZMove = moveRequest.zMoves && !choices.alreadyZ;
		const canUltraBurst = moveRequest.canUltraBurst;
		const canTerastallize = moveRequest.canTerastallize;

		const maybeDisabled = moveRequest.maybeDisabled;
		const maybeLocked = moveRequest.maybeLocked;

		return <div class="movemenu">
			{maybeDisabled && <p><em class="movewarning">
				{this.renderUIText('mightBeDisabled')}
			</em></p>}
			{maybeLocked && <p><em class="movewarning">
				{this.renderUIText('mightBeLocked')} {}
				<button class="button" data-cmd="/choose testfight">{TL`[Try Fight button]`}</button> {}
				{this.renderUIText('lockedExplanation')}
			</em></p>}
			{!overlayVersion && this.renderMoveControls(moveRequest, choices)}
			<div class="megaevo-box">
				{canDynamax && <label class={`megaevo${choices.current.max ? ' cur' : ''}`}>
					<input type="checkbox" name="max" checked={choices.current.max} onChange={this.toggleBoostedMove} /> {}
					{moveRequest.gigantamax ? TL.tag.gigantamax : TL.term.dynamax}
				</label>}
				{canMegaEvo && <label class={`megaevo${choices.current.mega ? ' cur' : ''}`}>
					<input type="checkbox" name="mega" checked={choices.current.mega} onChange={this.toggleBoostedMove} /> {}
					{TL.term.megaevolution}
				</label>}
				{canMegaEvoX && <label class={`megaevo${choices.current.mega ? ' cur' : ''}`}>
					<input type="checkbox" name="megax" checked={choices.current.megax} onChange={this.toggleBoostedMove} /> {}
					{TL.term.megaevolution} X
				</label>}
				{canMegaEvoY && <label class={`megaevo${choices.current.mega ? ' cur' : ''}`}>
					<input type="checkbox" name="megay" checked={choices.current.megay} onChange={this.toggleBoostedMove} /> {}
					{TL.term.megaevolution} Y
				</label>}
				{canUltraBurst && <label class={`megaevo${choices.current.ultra ? ' cur' : ''}`}>
					<input type="checkbox" name="ultra" checked={choices.current.ultra} onChange={this.toggleBoostedMove} /> {}
					{TL.term.ultraburst}
				</label>}
				{canZMove && <label class={`megaevo${choices.current.z ? ' cur' : ''}`}>
					<input type="checkbox" name="z" checked={choices.current.z} onChange={this.toggleBoostedMove} /> {}
					{TL.term.zpower}
				</label>}
				{canTerastallize && <label class={`megaevo${choices.current.tera ? ' cur' : ''}`}>
					<input type="checkbox" name="tera" checked={choices.current.tera} onChange={this.toggleBoostedMove} /> {}
					{TL.term.tera} {PSIcon({ type: canTerastallize, new: true, tera: true })}
				</label>}
			</div>
			{overlayVersion && this.renderMoveControls(moveRequest, choices)}
		</div>;
	}
	renderMoveControls(active: BattleRequestActivePokemon, choices: BattleChoiceBuilder) {
		const battle = this.props.room.battle;
		const dex = battle.dex;
		const pokemonIndex = choices.index();
		const activeIndex = battle.mySide.n > 1 ? pokemonIndex + battle.pokemonControlled : pokemonIndex;
		const serverPokemon = choices.request.side!.pokemon[pokemonIndex];
		const valueTracker = new ModifiableValue(battle, battle.nearSide.active[activeIndex]!, serverPokemon);
		const tooltips = (battle.scene as BattleScene).tooltips;

		if (choices.current.max || (active.maxMoves && !active.canDynamax)) {
			if (!active.maxMoves) {
				return <div class="message-error">{TL`Maxed with no max moves`}</div>;
			}
			const gmax = active.gigantamax && dex.moves.get(active.gigantamax);
			return active.moves.map((moveData, i) => {
				const move = dex.moves.get(moveData.name);
				const [moveType, tags] = tooltips.getMoveTypeText(move, valueTracker, gmax || true);
				let maxMoveData: { name: string, id: ID } = active.maxMoves![i];
				if (maxMoveData.name !== 'Max Guard') {
					maxMoveData = tooltips.getMaxMoveFromType(moveType, gmax);
				}
				const gmaxTooltip = maxMoveData.id.startsWith('gmax') ? `|${maxMoveData.id}` : ``;
				const tooltip = `maxmove|${moveData.name}|${pokemonIndex}${gmaxTooltip}`;
				return this.renderMoveButton({
					name: TL(dex.moves.get(maxMoveData.name)),
					cmd: `/move ${i + 1} max`,
					type: moveType,
					tags,
					tooltip,
					moveData,
				});
			});
		}

		if (choices.current.z) {
			if (!active.zMoves) {
				return <div class="message-error">{TL`No Z moves`}</div>;
			}
			return active.moves.map((moveData, i) => {
				const zMoveData = active.zMoves![i];
				if (!zMoveData) {
					return this.renderMoveButton(null);
				}
				const specialMove = dex.moves.get(zMoveData.name);
				const move = specialMove.exists ? specialMove : dex.moves.get(moveData.name);
				let moveName = TL(move);
				if (zMoveData.name.startsWith('Z-') && !moveName.startsWith('Z-')) moveName = `Z-${moveName}`;
				const [moveType, tags] = tooltips.getMoveTypeText(move, valueTracker);
				const tooltip = `zmove|${moveData.name}|${pokemonIndex}`;
				return this.renderMoveButton({
					name: moveName,
					cmd: `/move ${i + 1} zmove`,
					type: moveType,
					tags,
					tooltip,
					moveData: { pp: 1, maxpp: 1 },
				});
			});
		}

		const special = choices.moveSpecial(choices.current);
		return active.moves.map((moveData, i) => {
			const move = dex.moves.get(moveData.name);
			const [moveType, tags] = tooltips.getMoveTypeText(move, valueTracker);
			const tooltip = `move|${moveData.name}|${pokemonIndex}`;
			return this.renderMoveButton({
				name: TL(move),
				cmd: `/move ${i + 1}${special}`,
				type: moveType,
				tags,
				tooltip,
				moveData,
			});
		});
	}
	renderMoveTargetControls(request: BattleMoveRequest, choices: BattleChoiceBuilder) {
		const battle = this.props.room.battle;
		let moveTarget = choices.currentMove()?.target;
		if ((moveTarget === 'adjacentAlly' || moveTarget === 'adjacentFoe') && battle.gameType === 'freeforall') {
			moveTarget = 'normal';
		}
		const moveChoice = choices.stringChoice(choices.current);

		const userSlot = choices.index() + Math.floor(battle.mySide.n / 2) * battle.pokemonControlled;
		const userSlotCross = battle.farSide.active.length - 1 - userSlot;

		return <>
			{battle.farSide.active.map((pokemon, i) => {
				let disabled = false;
				if (moveTarget === 'adjacentAlly' || moveTarget === 'adjacentAllyOrSelf') {
					disabled = true;
				} else if (moveTarget === 'normal' || moveTarget === 'adjacentFoe') {
					if (Math.abs(userSlotCross - i) > 1) disabled = true;
				}

				if (pokemon?.fainted) pokemon = null;
				return this.renderPokemonButton({
					pokemon,
					cmd: disabled ? `` : `/${moveChoice} +${i + 1}`,
					disabled: disabled && 'fade',
					tooltip: `activepokemon|1|${i}`,
				});
			}).reverse()}
			<div style={{ clear: 'left' }}></div>
			{battle.nearSide.active.map((pokemon, i) => {
				let disabled = false;
				if (moveTarget === 'adjacentFoe') {
					disabled = true;
				} else if (moveTarget === 'normal' || moveTarget === 'adjacentAlly' || moveTarget === 'adjacentAllyOrSelf') {
					if (Math.abs(userSlot - i) > 1) disabled = true;
				}
				if (moveTarget !== 'adjacentAllyOrSelf' && userSlot === i) disabled = true;

				if (pokemon?.fainted) pokemon = null;
				return this.renderPokemonButton({
					pokemon,
					cmd: disabled ? `` : `/${moveChoice} -${i + 1}`,
					disabled: disabled && 'fade',
					tooltip: `activepokemon|0|${i}`,
				});
			})}
		</>;
	}
	renderSwitchMenu(
		request: BattleMoveRequest | BattleSwitchRequest, choices: BattleChoiceBuilder, ignoreTrapping?: boolean
	) {
		const numActive = choices.requestLength();
		const maybeTrapped = !ignoreTrapping && choices.currentMoveRequest()?.maybeTrapped;
		const trapped = !ignoreTrapping && !maybeTrapped && choices.currentMoveRequest()?.trapped;
		const isReviving = choices.isReviving();

		return <div class="switchmenu">
			{maybeTrapped && <em class="movewarning">
				{this.renderUIText('mightBeTrapped')}<br />
			</em>}
			{trapped && <em class="movewarning">
				{this.renderUIText('cantSwitchTrapped')}<br />
			</em>}
			{request.side.pokemon.map((serverPokemon, i) => {
				let cantSwitch = trapped || i < numActive || choices.alreadySwitchingIn.includes(i + 1) || serverPokemon.fainted;
				if (isReviving) cantSwitch = !serverPokemon.fainted || choices.alreadySwitchingIn.includes(i + 1);
				return this.renderPokemonButton({
					pokemon: serverPokemon,
					cmd: `/switch ${i + 1}`,
					disabled: cantSwitch,
					tooltip: `switchpokemon|${i}`,
				});
			})}
			{request.ally?.pokemon?.map((serverPokemon, i) => {
				return this.renderPokemonButton({
					pokemon: serverPokemon,
					cmd: `/switch notMine`,
					disabled: true,
					tooltip: `allypokemon|${i}`,
				});
			})}
		</div>;
	}
	renderTeamPreviewChooser(request: | BattleTeamRequest, choices: BattleChoiceBuilder) {
		return request.side.pokemon.map((serverPokemon, i) => {
			const cantSwitch = choices.alreadySwitchingIn.includes(i + 1);
			return this.renderPokemonButton({
				pokemon: serverPokemon,
				cmd: `/switch ${i + 1}`,
				disabled: cantSwitch && 'fade',
				tooltip: `switchpokemon|${i}`,
			});
		});
	}
	renderTeamList(overlayVersion = false) {
		const team = this.team;
		if (!team) return;
		return <div class="switchcontrols">
			{!overlayVersion && <h3 class="switchselect">{TL`[Team]`}</h3>}
			<div class="switchmenu">
				{team.map((serverPokemon, i) => {
					return this.renderPokemonButton({
						pokemon: serverPokemon,
						cmd: "",
						disabled: true,
						tooltip: `switchpokemon|${i}`,
					});
				})}
			</div>
		</div>;
	}
	renderChosenTeam(request: BattleTeamRequest, choices: BattleChoiceBuilder) {
		return choices.alreadySwitchingIn.map(slot => {
			const serverPokemon = request.side.pokemon[slot - 1];
			return this.renderPokemonButton({
				pokemon: serverPokemon,
				cmd: `/switch ${slot}`,
				tooltip: `switchpokemon|${slot - 1}`,
			});
		});
	}
	renderOldChoices(request: BattleRequest, choices: BattleChoiceBuilder, overlayVersion = false) {
		if (!choices) return null; // should not happen
		if (
			(request.requestType !== 'move' && request.requestType !== 'switch' && request.requestType !== 'team') ||
			choices.isEmpty()
		) {
			return null;
		}

		let buf: preact.ComponentChild[] = [
			<button data-cmd="/cancelone" class="button"><i class="fa fa-chevron-left" aria-hidden></i> {TL`[Back]`}</button>, ' ',
		];
		if (choices.isDone() && (
			choices.noCancel || this.props.room.battle.hardcoreMode ||
			(choices.choices.length <= 1 && !overlayVersion)
		)) {
			buf = [];
		}

		if (choices.serializedChoice) {
			if (choices.serializedChoice === 'default') {
				return [BattleTextParser.ui('autoChoice'), <br />];
			}
			return [BattleTextParser.ui('unrecognizedChoice') + ' ', <code>{choices.serializedChoice}</code>, <br />];
		}

		const battle = this.props.room.battle;
		const pickedNames: string[] = [];
		for (let i = 0; i < choices.choices.length; i++) {
			const choiceString = choices.choices[i];
			if (choiceString === "testfight") {
				buf.push(this.renderUIText('lockedIntoMove', { POKEMON: request.side.pokemon[i].name }));
				return buf;
			}
			let choice;
			try {
				choice = choices.parseChoice(choiceString, i);
			} catch (err: any) {
				buf.push(<span class="message-error">{err.message}</span>);
			}
			if (!choice) continue;
			const pokemon = request.side.pokemon[i];
			const active = request.requestType === 'move' ? request.active[i] : null;
			if (choice.choiceType === 'move') {
				let actions = '';
				if (choice.mega) actions += BattleTextParser.ui('actionMegaEvolve');
				if (choice.megax) actions += BattleTextParser.ui('actionMegaEvolveX');
				if (choice.megay) actions += BattleTextParser.ui('actionMegaEvolveY');
				if (choice.ultra) actions += BattleTextParser.ui('actionUltraBurst');
				if (choice.tera) actions += BattleTextParser.ui('actionTerastallize', { TYPE: active?.canTerastallize || '???' });
				if (choice.max && active?.canDynamax) {
					actions += BattleTextParser.ui(active?.gigantamax ? 'actionGigantamax' : 'actionDynamax');
				}
				let target = '';
				if (choice.targetLoc > 0) {
					const targetPokemon = battle.farSide.active[choice.targetLoc - 1];
					target = targetPokemon ?
						BattleTextParser.ui('atTarget', { TARGET: targetPokemon.name }) :
						BattleTextParser.ui('atSlot', { NUMBER: `${choice.targetLoc}` });
				} else if (choice.targetLoc < 0) {
					const targetPokemon = battle.nearSide.active[-choice.targetLoc - 1];
					const isAlly = battle.gameType !== 'freeforall';
					if (targetPokemon) {
						target = BattleTextParser.ui(isAlly ? 'atAllyTarget' : 'atTarget', { TARGET: targetPokemon.name });
					} else {
						target = BattleTextParser.ui(isAlly ? 'atAllySlot' : 'atSlot', { NUMBER: `${choice.targetLoc}` });
					}
				}
				buf.push(this.renderUIText('willUseMove', {
					POKEMON: pokemon.name,
					ACTIONS: actions,
					MOVE: choices.currentMove(choice, i)?.name || '???',
					AT: target,
				}));
			} else if (choice.choiceType === 'switch') {
				const target = request.side.pokemon[choice.targetPokemon - 1];
				buf.push(this.renderUIText(choices.isReviving(i) ? 'willRevive' : 'willSwitch', {
					POKEMON: pokemon.name, TARGET: target.name,
				}));
			} else if (choice.choiceType === 'shift') {
				buf.push(this.renderUIText('willShift', { POKEMON: pokemon.name }));
			} else if (choice.choiceType === 'team') {
				const target = request.side.pokemon[choice.targetPokemon - 1];
				pickedNames.push(target.name);
			}
			if (!pickedNames.length) buf.push(<br />);
		}
		if (pickedNames.length) {
			const pickedList = pickedNames.map(name => `**${name}**`).join(BattleTextParser.ui('listComma'));
			buf.push(this.renderUIText('youPicked', { POKEMON: pickedList }), <br />);
		}
		return buf;
	}
	overlayControlClass(overlay: 'move' | 'switch') {
		return `button ${overlay}-button${this.props.room.overlayActive === overlay ? ' cur' : ''}`;
	}
	renderPlayerAnimationControls(overlayVersion = false) {
		const room = this.props.room;
		if (overlayVersion) {
			const canSkip = !room.battle.hardcoreMode;
			return <>
				{canSkip && <div class="overlay-controls-skip">
					<button class="button" data-cmd="/ffto end"><i class="fa fa-fast-forward" aria-hidden></i><br />{TL`[Skip]`}</button>
				</div>}
			</>;
		}
		return <div class="inline-controls">
			{!room.battle.hardcoreMode && <div class="whatdo" style="padding-bottom:0">
				<button class="button" data-cmd="/ffto end">
					<i class="fa fa-fast-forward" aria-hidden></i><br />{TL`[Skip animation]`}
				</button>
			</div>}
			{this.renderTeamList()}
		</div>;
	}
	renderPlayerMoveControls(request: BattleMoveRequest, choices: BattleChoiceBuilder, overlayVersion = false) {
		const room = this.props.room;
		const index = choices.index();
		const pokemon = request.side.pokemon[index];

		if (choices.current.move) {
			const moveName = choices.currentMove()?.name;
			if (overlayVersion) {
				return <>
					<div class="overlay-controls-list">
						<button class="button move-button cur"><strong>{TL`[Battle]`}</strong></button> {}
						<button class="button switch-button disabled"><strong>{TL`[Switch]`}</strong></button>
					</div>
					<div class="targetcontrols">
						<p class="overlay-message">
							{this.renderOldChoices(request, choices, true)}
							{this.renderUIText('moveTarget', { POKEMON: pokemon.name, MOVE: moveName })}
						</p>
						<div class="switchmenu">
							{this.renderMoveTargetControls(request, choices)}
						</div>
					</div>
				</>;
			}
			return <div class="inline-controls">
				<div class="whatdo">
					{this.renderOldChoices(request, choices)}
					{this.renderUIText('moveTarget', { POKEMON: pokemon.name, MOVE: moveName })} {}
				</div>
				<div class="switchcontrols">
					<div class="switchmenu">
						{this.renderMoveTargetControls(request, choices)}
					</div>
				</div>
			</div>;
		}

		const canShift = room.battle.gameType === 'triples' && index !== 1;

		if (overlayVersion) {
			return <>
				<div class="overlay-controls-list">
					<button class={this.overlayControlClass('move')} data-cmd="/movemenu"><strong>{TL`[Battle]`}</strong></button> {}
					<button class={this.overlayControlClass('switch')} data-cmd="/switchmenu"><strong>{TL`[Switch]`}</strong></button>
				</div>
				{!room.overlayActive && <div class="whatdo">
					{this.renderOldChoices(request, choices, true)}
					{this.renderUIText('whatDo', { POKEMON: pokemon.name })}
				</div>}
				{room.overlayActive === 'move' && <div class="movecontrols">
					{this.renderMoveMenu(choices, true)}
				</div>}
				{room.overlayActive === 'switch' && <div class="switchcontrols">
					{canShift && (
						<button data-cmd="/shift">{TL`[Move to center]`}</button>
					)}
					{this.renderSwitchMenu(request, choices)}
				</div>}
			</>;
		}
		return <div class="inline-controls">
			<div class="whatdo">
				{this.renderOldChoices(request, choices)}
				{this.renderUIText('whatDo', { POKEMON: pokemon.name })}
			</div>
			<div class="movecontrols">
				<h3 class="moveselect">{TL`[Battle]`}</h3>
				{this.renderMoveMenu(choices)}
			</div>
			<div class="switchcontrols">
				{canShift && [
					<h3 class="shiftselect">{TL`[Shift]`}</h3>,
					<button data-cmd="/shift">{TL`[Move to center]`}</button>,
				]}
				<h3 class="switchselect">{TL`[Switch]`}</h3>
				{this.renderSwitchMenu(request, choices)}
			</div>
		</div>;
	}
	renderPlayerSwitchControls(request: BattleSwitchRequest, choices: BattleChoiceBuilder, overlayVersion = false) {
		const pokemon = request.side.pokemon[choices.index()];
		const prompt = choices.isReviving() ?
			this.renderUIText('reviveWho', { POKEMON: pokemon.name }) :
			this.renderUIText('replaceWho', { POKEMON: pokemon.name });
		if (overlayVersion) {
			return <>
				<div class="overlay-controls-list">
					<button class="button switch-button cur"><strong>{TL`[Switch]`}</strong></button>
				</div>
				<div class="switchcontrols">
					<p class="overlay-message">
						{this.renderOldChoices(request, choices, true)}
						{prompt}
					</p>
					{this.renderSwitchMenu(request, choices, true)}
				</div>
			</>;
		}
		return <div class="inline-controls">
			<div class="whatdo">
				{this.renderOldChoices(request, choices)}
				{prompt}
			</div>
			<div class="switchcontrols">
				<h3 class="switchselect">{TL`[Switch]`}</h3>
				{this.renderSwitchMenu(request, choices, true)}
			</div>
		</div>;
	}
	renderPlayerTeamPreviewControls(request: BattleTeamRequest, choices: BattleChoiceBuilder, overlayVersion = false) {
		const prompt = choices.alreadySwitchingIn.length > 0 ? (
			[<button data-cmd="/cancelone" class="button"><i class="fa fa-chevron-left" aria-hidden></i> {TL`[Back]`}</button>,
				" ", this.renderUIText('teamRest'), " "]
		) : (
			[this.renderUIText('teamStart'), " "]
		);
		const chosenTeamSizeLabel = (request.chosenTeamSize || 0) > 1 ? ` / ${request.chosenTeamSize!}` : '';
		const chooseLabel = (choices.alreadySwitchingIn.length <= 0 ?
			BattleTextParser.ui('chooseLead') : BattleTextParser.ui('chooseSlot', { NUMBER: `${choices.alreadySwitchingIn.length + 1}` })) + chosenTeamSizeLabel;
		if (overlayVersion) {
			return <>
				<div class="overlay-controls-list">
					<button class="button switch-button cur"><strong>{TL`[Team]`}</strong></button>
				</div>
				<div class="teamcontrols">
					<p class="overlay-message">{prompt}</p>
					<h3 class="switchselect">{chooseLabel}</h3>
					<div class="switchmenu">
						{this.renderTeamPreviewChooser(request, choices)}
						<div style="clear:left"></div>
					</div>
					{choices.alreadySwitchingIn.length > 0 && <>
						<h3 class="switchselect">{this.renderUIText('teamSoFar')}</h3>
						<div class="switchmenu">
							{this.renderChosenTeam(request, choices)}
						</div>
					</>}
				</div>
			</>;
		}
		return <div class="inline-controls">
			<div class="whatdo">
				{prompt}
			</div>
			<div class="switchcontrols">
				<h3 class="switchselect">
					{chooseLabel}
				</h3>
				<div class="switchmenu">
					{this.renderTeamPreviewChooser(request, choices)}
					<div style="clear:left"></div>
				</div>
			</div>
			<div class="switchcontrols">
				{choices.alreadySwitchingIn.length > 0 && <h3 class="switchselect">
					{this.renderUIText('teamSoFar')}
				</h3>}
				<div class="switchmenu">
					{this.renderChosenTeam(request, choices)}
				</div>
			</div>
		</div>;
	}
	renderPlayerControls(request: BattleRequest, overlayVersion = false) {
		const room = this.props.room;
		const atEnd = room.battle.atQueueEnd;
		if (!atEnd) return this.renderPlayerAnimationControls(overlayVersion);

		let choices = room.choices;
		if (!choices) return 'Error: Missing BattleChoiceBuilder';
		if (choices.request !== request) {
			choices = new BattleChoiceBuilder(request);
			room.choices = choices;
			room.overlayActive = null;
		}

		if (choices.isDone()) {
			if (overlayVersion) {
				return <>
					<div class="overlay-controls-list">
						<button class={this.overlayControlClass('switch')} data-cmd="/switchmenu"><strong>{TL`[Team]`}</strong></button>
					</div>
					{!room.overlayActive && <div class="whatdo">
						{this.renderOldChoices(request, choices, true)}
					</div>}
					{room.overlayActive === 'switch' && this.renderTeamList(true)}
				</>;
			}
			return <div class="inline-controls">
				<div class="whatdo">
					{this.renderOldChoices(request, choices)}
					<em>{this.renderUIText('waitingOpponent')}</em> {choices.noCancel || room.battle.hardcoreMode ?
						null : <button data-cmd="/cancel" class="button">{TL`[Cancel]`}</button>}
				</div>
				{this.renderTeamList()}
			</div>;
		}
		if (request.side) {
			room.battle.myPokemon = request.side.pokemon;
			this.team = request.side.pokemon;
		}
		switch (request.requestType) {
		case 'move':
			return this.renderPlayerMoveControls(request, choices, overlayVersion);
		case 'switch':
			return this.renderPlayerSwitchControls(request, choices, overlayVersion);
		case 'team':
			return this.renderPlayerTeamPreviewControls(request, choices, overlayVersion);
		}
		return null;
	}

	renderAfterBattleControls() {
		const room = this.props.room;
		const isNotTiny = room.width > 700;
		return <div class="inline-controls">
			<p>
				<span style="float: right">
					<a
						onClick={this.handleDownloadReplay}
						href={`//${Config.routes.replays}/download`}
						class="button replayDownloadButton"
					>
						<i class="fa fa-download" aria-hidden></i> Download replay</a>
					<br />
					<br />
					<button class="button" data-cmd="/savereplay">
						<i class="fa fa-upload" aria-hidden></i> {TL`[Upload and share replay]`}
					</button>
				</span>

				<button class="button" data-cmd="/play" style="min-width:4.5em">
					<i class="fa fa-undo" aria-hidden></i><br />{TL`[Replay]`}
				</button> {}
				{isNotTiny && !room.battle.hardcoreMode && <>
					<button class="button button-first" data-cmd="/ffto 0" style="margin-right:2px">
						<i class="fa fa-undo" aria-hidden></i><br />{TL`[First turn]`}
					</button>
					<button class="button button-first" data-cmd="/ffto -1">
						<i class="fa fa-step-backward" aria-hidden></i><br />{TL`[Prev turn]`}
					</button>
				</>}
			</p>
			{room.side ? (
				<p>
					<button class="button" data-cmd="/close">
						<strong>{TL`[Main menu]`}</strong><br /><small>{TL`(closes this battle)`}</small>
					</button> {}
					<button class="button" data-cmd={`/closeand /challenge ${room.battle.farSide.id},${room.battle.tier}`}>
						<strong>{TL`[Rematch]`}</strong><br /><small>{TL`(closes this battle)`}</small>
					</button>
				</p>
			) : (
				<p>
					<button class="button" data-cmd="/switchsides">
						<i class="fa fa-random" aria-hidden></i> {TL`[Switch viewpoint]`}
					</button> {}
					{!room.battle.hardcoreMode && <button class="button" data-cmd="/ffto">
						<i class="fa fa-random" aria-hidden></i> {TL`[Go to turn]`}
					</button>}
				</p>
			)}
		</div>;
	}

	handleDownloadReplay = (e: MouseEvent) => {
		let room = this.props.room;
		const target = e.currentTarget as HTMLAnchorElement;
		// download replay
		let filename = (room.battle.tier || 'Battle').replace(/[^A-Za-z0-9]/g, '');
		let date = new Date();
		filename += `-${date.getFullYear()}`;
		filename += `-${date.getMonth() >= 9 ? '' : '0'}${date.getMonth() + 1}`;
		filename += `-${date.getDate() >= 10 ? '' : '0'}${date.getDate()}`;
		filename += '-' + toID(room.battle.p1.name);
		filename += '-' + toID(room.battle.p2.name);
		target.href = window.BattleLog.createReplayFileHref(room);
		target.download = filename + '.html';
		e.stopPropagation();
	};

	override render() {
		this.updateLayout();
		const room = this.props.room;
		const id = `room-${room.id}`;
		const hardcoreStyle = room.battle?.hardcoreMode ? <style
			dangerouslySetInnerHTML={{ __html: `#${id} .battle .turn, #${id} .battle-history { display: none !important; }` }}
		></style> : null;
		const { layout, battleHeight, battleWidth, overlayControls } = this.chooseLayout();
		const overlayVersion = overlayControls && !!room.battle && !!room.side && !!room.request && !room.battle.ended;

		if (layout === 'scrolling') {
			// low-width-low-height layout
			// TODO: nicer phone horizontal layout
			return <PSPanelWrapper room={room} focusClick noScroll="hidden">
				{hardcoreStyle}
				<ChatLog
					class="battle-log hasuserlist" room={room} noSubscription hasPreempt bottom={0}
				>
					<div style="height:18px;position:relative">
						<ChatUserList room={room} top={0} minimized />
					</div>
					<ChatTextEntry room={room} onMessage={this.send} onKey={this.onKey} left={0} tinyLayout={room.width < 400} />
					<div style={`height:${battleHeight}px;width:${battleWidth}px;margin: 0 auto;position:relative`}>
						<BattleDiv room={room} />
					</div>
					{overlayVersion && <div class="overlay-controls" style="position:relative;height:0">
						{this.renderControls(true)}
					</div>}
					<div
						class={`battle-controls inline-battle${room.width > 660 ? ' wide-controls' : ''}`}
						role="complementary" aria-label={TL`Battle controls`}
					>
						{this.renderControls(false, overlayVersion)}
						{this.renderConnectError()}
					</div>
				</ChatLog>
				{(room.battle && !room.battle.ended && room.request && room.battle.mySide.id === PS.user.userid) &&
					<TimerButton room={room} top={7} />}
				<div class="battle-controls-container"></div>
			</PSPanelWrapper>;
		}

		if (layout === 'top-and-bottom') {
			// phone vertical layout
			return <PSPanelWrapper room={room} focusClick noScroll="hidden">
				{hardcoreStyle}
				<div style={`position:relative;height:${battleHeight}px;width:${battleWidth}px;margin:0 auto`}>
					<BattleDiv room={room} />
				</div>
				{overlayVersion && <div
					class="overlay-controls"
					style={`position:absolute;left:0;top:${battleHeight}px;width:100%;height:0`}
				>
					{this.renderControls(true)}
				</div>}
				<ChatLog
					class="battle-log hasuserlist" room={room} top={battleHeight} noSubscription hasPreempt
				>
					<div
						class={`battle-controls${room.width > 660 ? ' wide-controls' : ''}`}
						role="complementary" aria-label={TL`Battle controls`}
					>
						{this.renderControls(false, overlayVersion)}
						{this.renderConnectError()}
					</div>
				</ChatLog>
				<ChatTextEntry room={room} onMessage={this.send} onKey={this.onKey} left={0} tinyLayout={room.width < 400} />
				<ChatUserList room={room} top={battleHeight} minimized />
				{(room.battle && !room.battle.ended && room.request && room.battle.mySide.id === PS.user.userid) &&
					<TimerButton room={room} top={battleHeight + 7} />}
				<div class="battle-controls-container"></div>
			</PSPanelWrapper>;
		}

		if (room.width < 500) {
			// oldclient phone layout
			const showingChat = this.mobileChatShown;
			return <PSPanelWrapper room={room} focusClick noScroll="hidden">
				{hardcoreStyle}
				<div class="scrollable-battle-container" style={`width:${battleWidth}px;${showingChat ? 'display:none;' : ''}`}>
					<BattleDiv room={room} />
					{overlayVersion && <div
						class="overlay-controls"
						style={`position:absolute;left:0;top:${battleHeight}px;width:${battleWidth}px;height:0`}
					>
						{this.renderControls(true)}
					</div>}
					<div class="battle-controls-container">
						<div
							class={`battle-controls${battleWidth >= 639 ? ' wide-controls' : ''}`}
							role="complementary" aria-label={TL`Battle controls`}
							style={`top:${battleHeight + 10}px;width:${battleWidth}px;`}
						>
							{(room.battle && !room.battle.ended && room.request &&
								room.battle.mySide.id === PS.user.userid) && <TimerButton room={room} top={0} />}
							{this.renderControls(false, overlayVersion)}
							{this.renderConnectError()}
						</div>
					</div>
				</div>
				<div style={!showingChat ? 'display:none;' : ''}>
					<ChatLog class="battle-log hasuserlist" room={room} noSubscription hasPreempt />
					<ChatTextEntry room={room} onMessage={this.send} onKey={this.onKey} tinyLayout />
					<ChatUserList room={room} minimized />
				</div>
				{showingChat ? (
					<button class="battle-chat-toggle button" name="hideChat" onClick={this.showMobileBattle}>
						{TL`Battle`} <i class="fa fa-caret-right" aria-hidden></i>
					</button>
				) : (
					<button class="battle-chat-toggle button" name="showChat" onClick={this.showMobileChat}>
						<i class="fa fa-caret-left" aria-hidden></i> {TL`Chat`}
					</button>
				)}
			</PSPanelWrapper>;
		}

		// regular layout
		return <PSPanelWrapper room={room} focusClick noScroll="hidden">
			{hardcoreStyle}
			<div class="scrollable-battle-container" style={`width:${battleWidth}px`}>
				<BattleDiv room={room} />
				{overlayVersion && <div
					class="overlay-controls"
					style={`position:absolute;left:0;top:${battleHeight}px;width:${battleWidth}px;height:0`}
				>
					{this.renderControls(true)}
				</div>}
				<div class="battle-controls-container">
					<div
						class={`battle-controls${battleWidth >= 639 ? ' wide-controls' : ''}`}
						role="complementary" aria-label={TL`Battle controls`}
						style={`top:${battleHeight + 10}px;width:${battleWidth}px;`}
					>
						{(room.battle && !room.battle.ended && room.request && room.battle.mySide.id === PS.user.userid) &&
							<TimerButton room={room} top={0} />}
						{this.renderControls(false, overlayVersion)}
						{this.renderConnectError()}
					</div>
				</div>
			</div>
			<ChatLog
				class="battle-log hasuserlist" room={room} left={battleWidth} noSubscription hasPreempt
			>
				{}
			</ChatLog>
			<ChatTextEntry
				room={room} onMessage={this.send} onKey={this.onKey} left={battleWidth} tinyLayout={room.width < battleWidth + 340}
			/>
			<ChatUserList room={room} left={battleWidth} minimized />
		</PSPanelWrapper>;
	}
}

PS.addRoomType(BattlePanel, BattlesPanel);
