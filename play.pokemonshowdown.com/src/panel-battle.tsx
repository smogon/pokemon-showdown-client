/**
 * Battle panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

import preact from "../js/lib/preact";
import { PS, PSRoom, type RoomOptions, type RoomID } from "./client-main";
import { PSIcon, PSPanelWrapper, PSRoomPanel } from "./panels";
import { ChatLog, ChatRoom, ChatTextEntry, ChatUserList } from "./panel-chat";
import { FormatDropdown } from "./panel-mainmenu";
import { Battle, type Pokemon, type ServerPokemon } from "./battle";
import { BattleScene } from "./battle-animations";
import { Dex, toID } from "./battle-dex";
import {
	BattleChoiceBuilder, type BattleRequestActivePokemon, type BattleRequestSideInfo,
	type BattleRequest, type BattleMoveRequest, type BattleSwitchRequest, type BattleTeamRequest,
} from "./battle-choices";
import type { Args } from "./battle-text-parser";

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
		PS.send(`|/cmd roomlist ${toID(this.format)}`);
	}
}

class BattlesPanel extends PSRoomPanel<BattlesRoom> {
	static readonly id = 'battles';
	static readonly routes = ['battles'];
	static readonly Model = BattlesRoom;
	static readonly location = 'right';
	static readonly icon = <i class="fa fa-caret-square-o-right" aria-hidden></i>;
	static readonly title = 'Battles';
	refresh = () => {
		this.props.room.refresh();
	};
	changeFormat = (e: Event) => {
		const value = (e.target as HTMLButtonElement).value;
		this.props.room.setFormat(value);
	};
	renderBattleLink(battle: BattleDesc) {
		const format = battle.id.split('-')[1];
		const minEloMessage = typeof battle.minElo === 'number' ? `rated ${battle.minElo}` : battle.minElo;
		return <div key={battle.id}><a href={`/${battle.id}`} class="blocklink">
			{minEloMessage && <small style="float:right">({minEloMessage})</small>}
			<small>[{format}]</small><br />
			<em class="p1">{battle.p1}</em> <small class="vs">vs.</small> <em class="p2">{battle.p2}</em>
		</a></div>;
	}
	override render() {
		const room = this.props.room;
		return <PSPanelWrapper room={room} scrollable><div class="pad">
			<button class="button" style="float:right;font-size:10pt;margin-top:3px" name="closeRoom">
				<i class="fa fa-times" aria-hidden></i> Close
			</button>
			<div class="roomlist">
				<p>
					<button class="button" name="refresh" onClick={this.refresh}>
						<i class="fa fa-refresh" aria-hidden></i> Refresh
					</button> {}
					<span
						style={Dex.getPokemonIcon('meloetta-pirouette') + ';display:inline-block;vertical-align:middle'} class="picon"
						title="Meloetta is PS's mascot! The Pirouette forme is Fighting-type, and represents our battles."
					></span>
				</p>

				<p>
					<label class="label">Format:</label><FormatDropdown onChange={this.changeFormat} />
				</p>
				{/* <label>
					Minimum Elo: <select name="elofilter">
						<option value="none">None</option><option value="1100">1100</option><option value="1300">1300</option>
						<option value="1500">1500</option><option value="1700">1700</option><option value="1900">1900</option>
					</select>
				</label>

				<form class="search">
					<p>
						<input type="text" name="prefixsearch" class="textbox" placeholder="Username prefix"/>
						<button type="submit" class="button">Search</button>
					</p>
				</form> */}
				<div class="list">{!room.battles ? (
					<p>Loading...</p>
				) : !room.battles.length ? (
					<p>No battles are going on</p>
				) : (
					room.battles.map(battle => this.renderBattleLink(battle))
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

function MoveButton(props: {
	cmd: string, type: Dex.TypeName, tooltip: string, moveData: { pp: number, maxpp: number, disabled?: boolean },
	children: string,
}) {
	return <button
		data-cmd={props.cmd} data-tooltip={props.tooltip}
		class={`movebutton type-${props.type} has-tooltip${props.moveData.disabled ? ' disabled' : ''}`}
	>
		{props.children}<br />
		<small class="type">{props.type}</small> <small class="pp">{props.moveData.pp}/{props.moveData.maxpp}</small>&nbsp;
	</button>;
}
function PokemonButton(props: {
	pokemon: Pokemon | ServerPokemon | null, cmd: string, noHPBar?: boolean, disabled?: boolean | 'fade', tooltip: string,
}) {
	const pokemon = props.pokemon;
	if (!pokemon) {
		return <button
			data-cmd={props.cmd} class={`${props.disabled ? 'disabled ' : ''}has-tooltip`}
			style={{ opacity: props.disabled === 'fade' ? 0.5 : 1 }} data-tooltip={props.tooltip}
		>
			(empty slot)
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
		style={{ opacity: props.disabled === 'fade' ? 0.5 : 1 }} data-tooltip={props.tooltip}
	>
		<PSIcon pokemon={pokemon} />
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

class TimerButton extends preact.Component<{ room: BattleRoom }> {
	timerInterval: number | null = null;
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
		let time = 'Timer';
		const room = this.props.room;
		if (!this.timerInterval && room.battle.kickingInactive) {
			this.timerInterval = setInterval(() => {
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
			style={{ position: "absolute", right: '10px' }} data-href="battletimer" class={`button${timerTicking}`} role="timer"
		>
			<i class="fa fa-hourglass-start" aria-hidden></i> {time}
		</button>;
	}
};

class BattlePanel extends PSRoomPanel<BattleRoom> {
	static readonly id = 'battle';
	static readonly routes = ['battle-*'];
	static readonly Model = BattleRoom;
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
		scene.tooltips.listen($elem.find('.battle-controls-container'));
		scene.tooltips.listen(scene.log.elem);
		super.componentDidMount();
		battle.seekTurn(Infinity);
		battle.subscribe(() => this.forceUpdate());
	}
	battleHeight = 360;
	updateLayout() {
		if (!this.base) return;
		const room = this.props.room;
		const width = this.base.offsetWidth;
		if (width && width < 640) {
			const scale = (width / 640);
			room.battle?.scene.$frame!.css('transform', `scale(${scale})`);
			this.battleHeight = Math.round(360 * scale);
		} else {
			room.battle?.scene.$frame!.css('transform', 'none');
			this.battleHeight = 360;
		}
	}
	override receiveLine(args: Args) {
		const room = this.props.room;
		switch (args[0]) {
		case 'initdone':
			room.battle.seekTurn(Infinity);
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
				room.update(null);
			}
			break;
		}
		room.battle.add('|' + args.join('|'));
		if (PS.prefs.noanim) this.props.room.battle.seekTurn(Infinity);
	}
	receiveRequest(request: BattleRequest | null) {
		const room = this.props.room;
		if (!request) {
			room.request = null;
			room.choices = null;
			return;
		}

		if (PS.prefs.autotimer && !room.battle.kickingInactive && !room.autoTimerActivated) {
			this.send('/timer on');
			room.autoTimerActivated = true;
		}

		BattleChoiceBuilder.fixRequest(request, room.battle);

		if (request.side) {
			room.battle.myPokemon = request.side.pokemon;
			room.battle.setViewpoint(request.side.id);
			room.side = request.side;
		}

		room.request = request;
		room.choices = new BattleChoiceBuilder(request);
		room.update(null);
	}
	renderControls() {
		const room = this.props.room;
		if (!room.battle) return null;
		if (room.battle.ended) return this.renderAfterBattleControls();
		if (room.side && room.request) {
			return this.renderPlayerControls(room.request);
		}
		const atStart = !room.battle.started;
		const atEnd = room.battle.atQueueEnd;
		return <div class="controls">
			<p>
				{atEnd ? (
					<button class="button disabled" data-cmd="/play" style="min-width:4.5em">
						<i class="fa fa-play" aria-hidden></i><br />Play
					</button>
				) : room.battle.paused ? (
					<button class="button" data-cmd="/play" style="min-width:4.5em">
						<i class="fa fa-play" aria-hidden></i><br />Play
					</button>
				) : (
					<button class="button" data-cmd="/pause" style="min-width:4.5em">
						<i class="fa fa-pause" aria-hidden></i><br />Pause
					</button>
				)} {}
				<button class={"button button-first" + (atStart ? " disabled" : "")} data-cmd="/ffto 0" style="margin-right:2px">
					<i class="fa fa-undo" aria-hidden></i><br />First turn
				</button>
				<button class={"button button-first" + (atStart ? " disabled" : "")} data-cmd="/ffto -1">
					<i class="fa fa-step-backward" aria-hidden></i><br />Prev turn
				</button>
				<button class={"button button-last" + (atEnd ? " disabled" : "")} data-cmd="/ffto +1" style="margin-right:2px">
					<i class="fa fa-step-forward" aria-hidden></i><br />Skip turn
				</button>
				<button class={"button button-last" + (atEnd ? " disabled" : "")} data-cmd="/ffto end">
					<i class="fa fa-fast-forward" aria-hidden></i><br />Skip to end
				</button>
			</p>
			<p>
				<button class="button" data-cmd="/switchsides">
					<i class="fa fa-random" aria-hidden></i> Switch viewpoint
				</button>
			</p>
		</div>;
	}
	renderMoveMenu(choices: BattleChoiceBuilder) {
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
				You <strong>might</strong> have some moves disabled, so you won't be able to cancel an attack!
			</em></p>}
			{maybeLocked && <p><em class="movewarning">
				You <strong>might</strong> be locked into a move. {}
				<button class="button" data-cmd="/choose testfight">Try Fight button</button> {}
				(prevents switching if you're locked)
			</em></p>}
			{this.renderMoveControls(moveRequest, choices)}
			<div class="megaevo-box">
				{canDynamax && <label class={`megaevo${choices.current.max ? ' cur' : ''}`}>
					<input type="checkbox" name="max" checked={choices.current.max} onChange={this.toggleBoostedMove} /> {}
					{moveRequest.canGigantamax ? 'Gigantamax' : 'Dynamax'}
				</label>}
				{canMegaEvo && <label class={`megaevo${choices.current.mega ? ' cur' : ''}`}>
					<input type="checkbox" name="mega" checked={choices.current.mega} onChange={this.toggleBoostedMove} /> {}
					Mega Evolution
				</label>}
				{canMegaEvoX && <label class={`megaevo${choices.current.mega ? ' cur' : ''}`}>
					<input type="checkbox" name="megax" checked={choices.current.megax} onChange={this.toggleBoostedMove} /> {}
					Mega Evolution X
				</label>}
				{canMegaEvoY && <label class={`megaevo${choices.current.mega ? ' cur' : ''}`}>
					<input type="checkbox" name="megay" checked={choices.current.megay} onChange={this.toggleBoostedMove} /> {}
					Mega Evolution Y
				</label>}
				{canUltraBurst && <label class={`megaevo${choices.current.ultra ? ' cur' : ''}`}>
					<input type="checkbox" name="ultra" checked={choices.current.ultra} onChange={this.toggleBoostedMove} /> {}
					Ultra Burst
				</label>}
				{canZMove && <label class={`megaevo${choices.current.z ? ' cur' : ''}`}>
					<input type="checkbox" name="z" checked={choices.current.z} onChange={this.toggleBoostedMove} /> {}
					Z-Power
				</label>}
				{canTerastallize && <label class={`megaevo${choices.current.tera ? ' cur' : ''}`}>
					<input type="checkbox" name="tera" checked={choices.current.tera} onChange={this.toggleBoostedMove} /> {}
					Terastallize<br /><span dangerouslySetInnerHTML={{ __html: Dex.getTypeIcon(canTerastallize) }} />
				</label>}
			</div>
		</div>;
	}
	renderMoveControls(active: BattleRequestActivePokemon, choices: BattleChoiceBuilder) {
		const dex = this.props.room.battle.dex;
		const pokemonIndex = choices.index();

		if (choices.current.max || (active.maxMoves && !active.canDynamax)) {
			if (!active.maxMoves) {
				return <div class="message-error">Maxed with no max moves</div>;
			}
			return active.moves.map((moveData, i) => {
				const move = dex.moves.get(moveData.name);
				const maxMoveData = active.maxMoves![i];
				const gmaxTooltip = maxMoveData.id.startsWith('gmax') ? `|${maxMoveData.id}` : ``;
				const tooltip = `maxmove|${moveData.name}|${pokemonIndex}${gmaxTooltip}`;
				return <MoveButton cmd={`/move ${i + 1} max`} type={move.type} tooltip={tooltip} moveData={moveData}>
					{maxMoveData.name}
				</MoveButton>;
			});
		}

		if (choices.current.z) {
			if (!active.zMoves) {
				return <div class="message-error">No Z moves</div>;
			}
			return active.moves.map((moveData, i) => {
				const move = dex.moves.get(moveData.name);
				const zMoveData = active.zMoves![i];
				if (!zMoveData) {
					return <button class="movebutton" disabled>&nbsp;</button>;
				}
				const tooltip = `zmove|${moveData.name}|${pokemonIndex}`;
				return <MoveButton cmd={`/move ${i + 1} zmove`} type={move.type} tooltip={tooltip} moveData={{ pp: 1, maxpp: 1 }}>
					{zMoveData.name}
				</MoveButton>;
			});
		}

		const special = choices.moveSpecial(choices.current);
		return active.moves.map((moveData, i) => {
			const move = dex.moves.get(moveData.name);
			const tooltip = `move|${moveData.name}|${pokemonIndex}`;
			return <MoveButton cmd={`/move ${i + 1}${special}`} type={move.type} tooltip={tooltip} moveData={moveData}>
				{move.name}
			</MoveButton>;
		});
	}
	renderMoveTargetControls(request: BattleMoveRequest, choices: BattleChoiceBuilder) {
		const battle = this.props.room.battle;
		const moveTarget = choices.currentMove()?.target;
		const moveChoice = choices.stringChoice(choices.current);

		const userSlot = choices.index();
		const userSlotCross = battle.farSide.active.length - 1 - userSlot;

		return [
			battle.farSide.active.map((pokemon, i) => {
				let disabled = false;
				if (moveTarget === 'adjacentAlly' || moveTarget === 'adjacentAllyOrSelf') {
					disabled = true;
				} else if (moveTarget === 'normal' || moveTarget === 'adjacentFoe') {
					if (Math.abs(userSlotCross - i) > 1) disabled = true;
				}

				if (pokemon?.fainted) pokemon = null;
				return <PokemonButton
					pokemon={pokemon}
					cmd={disabled ? `` : `/${moveChoice} +${i + 1}`} disabled={disabled && 'fade'} tooltip={`activepokemon|1|${i}`}
				/>;
			}).reverse(),
			<div style="clear: left"></div>,
			battle.nearSide.active.map((pokemon, i) => {
				let disabled = false;
				if (moveTarget === 'adjacentFoe') {
					disabled = true;
				} else if (moveTarget === 'normal' || moveTarget === 'adjacentAlly' || moveTarget === 'adjacentAllyOrSelf') {
					if (Math.abs(userSlot - i) > 1) disabled = true;
				}
				if (moveTarget !== 'adjacentAllyOrSelf' && userSlot === i) disabled = true;

				if (pokemon?.fainted) pokemon = null;
				return <PokemonButton
					pokemon={pokemon}
					cmd={disabled ? `` : `/${moveChoice} -${i + 1}`} disabled={disabled && 'fade'} tooltip={`activepokemon|0|${i}`}
				/>;
			}),
		];
	}
	renderSwitchMenu(
		request: BattleMoveRequest | BattleSwitchRequest, choices: BattleChoiceBuilder, ignoreTrapping?: boolean
	) {
		const numActive = choices.requestLength();
		const maybeTrapped = !ignoreTrapping && choices.currentMoveRequest()?.maybeTrapped;
		const trapped = !ignoreTrapping && !maybeTrapped && choices.currentMoveRequest()?.trapped;

		return <div class="switchmenu">
			{maybeTrapped && <em class="movewarning">
				You <strong>might</strong> be trapped, so you won't be able to cancel a switch!<br />
			</em>}
			{trapped && <em class="movewarning">
				You're <strong>trapped</strong> and cannot switch!<br />
			</em>}
			{request.side.pokemon.map((serverPokemon, i) => {
				const cantSwitch = trapped || i < numActive || choices.alreadySwitchingIn.includes(i + 1) || serverPokemon.fainted;
				return <PokemonButton
					pokemon={serverPokemon} cmd={`/switch ${i + 1}`} disabled={cantSwitch} tooltip={`switchpokemon|${i}`}
				/>;
			})}
		</div>;
	}
	renderTeamControls(request: | BattleTeamRequest, choices: BattleChoiceBuilder) {
		return request.side.pokemon.map((serverPokemon, i) => {
			const cantSwitch = choices.alreadySwitchingIn.includes(i + 1);
			return <PokemonButton
				pokemon={serverPokemon} cmd={`/switch ${i + 1}`} noHPBar disabled={cantSwitch && 'fade'} tooltip={`switchpokemon|${i}`}
			/>;
		});
	}
	renderTeamList() {
		const team = this.props.room.battle.myPokemon;
		if (!team) return;
		return <div class="switchcontrols">
			<h3 class="switchselect">Team</h3>
			<div class="switchmenu">
				{team.map((serverPokemon, i) => {
					return <PokemonButton
						pokemon={serverPokemon} cmd="" noHPBar disabled tooltip={`switchpokemon|${i}`}
					/>;
				})}
			</div>
		</div>;
	}
	renderChosenTeam(request: BattleTeamRequest, choices: BattleChoiceBuilder) {
		return choices.alreadySwitchingIn.map(slot => {
			const serverPokemon = request.side.pokemon[slot - 1];
			return <PokemonButton
				pokemon={serverPokemon} cmd={`/switch ${slot}`} disabled tooltip={`switchpokemon|${slot - 1}`}
			/>;
		});
	}
	renderOldChoices(request: BattleRequest, choices: BattleChoiceBuilder) {
		if (!choices) return null; // should not happen
		if (request.requestType !== 'move' && request.requestType !== 'switch' && request.requestType !== 'team') return;
		if (choices.isEmpty()) return null;

		let buf: preact.ComponentChild[] = [
			<button data-cmd="/cancel" class="button"><i class="fa fa-chevron-left" aria-hidden></i> Back</button>, ' ',
		];
		if (choices.isDone() && choices.noCancel) {
			buf = ['Waiting for opponent...', <br />];
		} else if (choices.isDone() && choices.choices.length <= 1) {
			buf = [];
		}

		const battle = this.props.room.battle;
		for (let i = 0; i < choices.choices.length; i++) {
			const choiceString = choices.choices[i];
			if (choiceString === "testfight") {
				buf.push(`${request.side.pokemon[i].name} is locked into a move.`);
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
				buf.push(`${pokemon.name} will `);
				if (choice.mega) buf.push(<strong>Mega</strong>, ` Evolve and `);
				if (choice.megax) buf.push(<strong>Mega</strong>, ` Evolve (X) and `);
				if (choice.megay) buf.push(<strong>Mega</strong>, ` Evolve (Y) and `);
				if (choice.ultra) buf.push(<strong>Ultra</strong>, ` Burst and `);
				if (choice.tera) buf.push(`Terastallize (`, <strong>{active?.canTerastallize || '???'}</strong>, `) and `);
				if (choice.max && active?.canDynamax) buf.push(active?.canGigantamax ? `Gigantamax and ` : `Dynamax and `);
				buf.push(`use `, <strong>{choices.currentMove(choice, i)?.name}</strong>);
				if (choice.targetLoc > 0) {
					const target = battle.farSide.active[choice.targetLoc - 1];
					if (!target) {
						buf.push(` at slot ${choice.targetLoc}`);
					} else {
						buf.push(` at ${target.name}`);
					}
				} else if (choice.targetLoc < 0) {
					const target = battle.nearSide.active[-choice.targetLoc - 1];
					if (!target) {
						buf.push(` at ally slot ${choice.targetLoc}`);
					} else {
						buf.push(` at ally ${target.name}`);
					}
				}
			} else if (choice.choiceType === 'switch') {
				const target = request.side.pokemon[choice.targetPokemon - 1];
				buf.push(`${pokemon.name} will switch to `, <strong>{target.name}</strong>);
			} else if (choice.choiceType === 'shift') {
				buf.push(`${pokemon.name} will `, <strong>shift</strong>, ` to the center`);
			} else if (choice.choiceType === 'team') {
				const target = request.side.pokemon[choice.targetPokemon - 1];
				buf.push(`You picked `, <strong>{target.name}</strong>);
			}
			buf.push(<br />);
		}
		return buf;
	}
	renderPlayerControls(request: BattleRequest) {
		const room = this.props.room;
		let choices = room.choices;
		if (!choices) return 'Error: Missing BattleChoiceBuilder';
		if (choices.request !== request) {
			choices = new BattleChoiceBuilder(request);
			room.choices = choices;
		}

		if (choices.isDone()) {
			return <div class="controls">
				<div class="whatdo">
					{this.renderOldChoices(request, choices)}
				</div>
				<div class="pad">
					{choices.noCancel ? null : <button data-cmd="/cancel" class="button">Cancel</button>}
				</div>
				{this.renderTeamList()}
			</div>;
		}
		if (request.side) room.battle.myPokemon = request.side.pokemon;
		switch (request.requestType) {
		case 'move': {
			const index = choices.index();
			const pokemon = request.side.pokemon[index];

			if (choices.current.move) {
				const moveName = choices.currentMove()?.name;
				return <div class="controls">
					<div class="whatdo">
						{this.renderOldChoices(request, choices)}
						{pokemon.name} should use <strong>{moveName}</strong> at where? {}
					</div>
					<div class="switchcontrols">
						<div class="switchmenu">
							{this.renderMoveTargetControls(request, choices)}
						</div>
					</div>
				</div>;
			}

			const canShift = room.battle.gameType === 'triples' && index !== 1;

			return <div class="controls">
				<div class="whatdo">
					{this.renderOldChoices(request, choices)}
					What will <strong>{pokemon.name}</strong> do?
				</div>
				<div class="movecontrols">
					<h3 class="moveselect">Attack</h3>
					{this.renderMoveMenu(choices)}
				</div>
				<div class="switchcontrols">
					{canShift && [
						<h3 class="shiftselect">Shift</h3>,
						<button data-cmd="/shift">Move to center</button>,
					]}
					<h3 class="switchselect">Switch</h3>
					{this.renderSwitchMenu(request, choices)}
				</div>
			</div>;
		} case 'switch': {
			const pokemon = request.side.pokemon[choices.index()];
			return <div class="controls">
				<div class="whatdo">
					{this.renderOldChoices(request, choices)}
					What will <strong>{pokemon.name}</strong> do?
				</div>
				<div class="switchcontrols">
					<h3 class="switchselect">Switch</h3>
					{this.renderSwitchMenu(request, choices, true)}
				</div>
			</div>;
		} case 'team': {
			return <div class="controls">
				<div class="whatdo">
					{choices.alreadySwitchingIn.length > 0 ? (
						[<button data-cmd="/cancel" class="button"><i class="fa fa-chevron-left" aria-hidden></i> Back</button>,
							" What about the rest of your team? "]
					) : (
						"How will you start the battle? "
					)}
				</div>
				<div class="switchcontrols">
					<h3 class="switchselect">
						Choose {choices.alreadySwitchingIn.length <= 0 ? `lead` : `slot ${choices.alreadySwitchingIn.length + 1}`}
					</h3>
					<div class="switchmenu">
						{this.renderTeamControls(request, choices)}
						<div style="clear:left"></div>
					</div>
				</div>
				<div class="switchcontrols">
					{choices.alreadySwitchingIn.length > 0 && <h3 class="switchselect">Team so far</h3>}
					<div class="switchmenu">
						{this.renderChosenTeam(request, choices)}
					</div>
				</div>
			</div>;
		}
		}
		return null;
	}

	renderAfterBattleControls() {
		const room = this.props.room;
		const isNotTiny = room.width > 700;
		return <div class="controls">
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
						<i class="fa fa-upload" aria-hidden></i> Upload and share replay
					</button>
				</span>

				<button class="button" data-cmd="/play" style="min-width:4.5em">
					<i class="fa fa-undo" aria-hidden></i><br />Replay
				</button> {}
				{isNotTiny && <button class="button button-first" data-cmd="/ffto 0" style="margin-right:2px">
					<i class="fa fa-undo" aria-hidden></i><br />First turn
				</button>}
				{isNotTiny && <button class="button button-first" data-cmd="/ffto -1">
					<i class="fa fa-step-backward" aria-hidden></i><br />Prev turn
				</button>}
			</p>
			{room.side ? (
				<p>
					<button class="button" data-cmd="/close">
						<strong>Main menu</strong><br /><small>(closes this battle)</small>
					</button> {}
					<button class="button" data-cmd={`/closeand /challenge ${room.battle.farSide.id},${room.battle.tier}`}>
						<strong>Rematch</strong><br /><small>(closes this battle)</small>
					</button>
				</p>
			) : (
				<p>
					<button class="button" data-cmd="/switchsides"><i class="fa fa-random" aria-hidden></i> Switch viewpoint</button>
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
		const room = this.props.room;
		this.updateLayout();
		const id = `room-${room.id}`;
		const hardcoreStyle = room.battle?.hardcoreMode ? <style
			dangerouslySetInnerHTML={{ __html: `#${id} .battle .turn, #${id} .battle-history { display: none !important; }` }}
		></style> : null;

		if (room.width < 700) {
			return <PSPanelWrapper room={room} focusClick scrollable="hidden">
				{hardcoreStyle}
				<BattleDiv room={room} />
				<ChatLog
					class="battle-log hasuserlist" room={room} top={this.battleHeight} noSubscription
				>
					<div class="battle-controls" role="complementary" aria-label="Battle Controls">
						{this.renderControls()}
					</div>
				</ChatLog>
				<ChatTextEntry room={room} onMessage={this.send} onKey={this.onKey} left={0} />
				<ChatUserList room={room} top={this.battleHeight} minimized />
				<button
					data-href="battleoptions" class="button"
					style={{ position: 'absolute', right: '75px', top: this.battleHeight }}
				>
					Battle Options
				</button>
				{(room.battle && !room.battle.ended && room.request && room.battle.mySide.id === PS.user.userid) &&
					<TimerButton room={room} />}
				<div class="battle-controls-container"></div>
			</PSPanelWrapper>;
		}

		return <PSPanelWrapper room={room} focusClick scrollable="hidden">
			{hardcoreStyle}
			<BattleDiv room={room} />
			<ChatLog
				class="battle-log hasuserlist" room={room} left={640} noSubscription
			>
				{}
			</ChatLog>
			<ChatTextEntry room={room} onMessage={this.send} onKey={this.onKey} left={640} />
			<ChatUserList room={room} left={640} minimized />
			<button
				data-href="battleoptions" class="button"
				style={{ position: 'absolute', right: '15px' }}
			>
				Battle Options
			</button>
			<div class="battle-controls-container">
				<div class="battle-controls" role="complementary" aria-label="Battle Controls" style="top: 370px;">
					{(room.battle && !room.battle.ended && room.request && room.battle.mySide.id === PS.user.userid) &&
						<TimerButton room={room} />}
					{this.renderControls()}
				</div>
			</div>
		</PSPanelWrapper>;
	}
}

PS.addRoomType(BattlePanel, BattlesPanel);
