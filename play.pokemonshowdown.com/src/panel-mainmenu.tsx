/**
 * Main menu panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

import preact from "../js/lib/preact";
import { PSLoginServer } from "./client-connection";
import { PS, PSRoom, type RoomID, type RoomOptions, type Team } from "./client-main";
import { PSPanelWrapper, PSRoomPanel } from "./panels";
import type { BattlesRoom } from "./panel-battle";
import type { ChatRoom } from "./panel-chat";
import type { LadderFormatRoom } from "./panel-ladder";
import type { RoomsRoom } from "./panel-rooms";
import { TeamBox } from "./panel-teamdropdown";
import { Dex, toID, type ID } from "./battle-dex";
import type { Args } from "./battle-text-parser";
import { BattleLog } from "./battle-log"; // optional

export type RoomInfo = {
	title: string, desc?: string, userCount?: number, section?: string, privacy?: 'hidden',
	spotlight?: string, subRooms?: string[],
};

export class MainMenuRoom extends PSRoom {
	override readonly classType: string = 'mainmenu';
	userdetailsCache: {
		[userid: string]: {
			userid: ID,
			name: string,
			avatar?: string | number,
			status?: string,
			group?: string,
			customgroup?: string,
			rooms?: { [roomid: string]: { isPrivate?: true, p1?: string, p2?: string } },
		},
	} = {};
	roomsCache: {
		battleCount?: number,
		userCount?: number,
		chat?: RoomInfo[],
		sectionTitles?: string[],
	} = {};
	searchCountdown: { format: string, packedTeam: string, countdown: number, timer: number } | null = null;
	/** used to track the moment between "search sent" and "server acknowledged search sent" */
	searchSent = false;
	search: { searching: string[], games: Record<RoomID, string> | null } = { searching: [], games: null };
	constructor(options: RoomOptions) {
		super(options);
		if (this.backlog) {
			// these aren't set yet, but a lot of things could go wrong if we don't
			PS.rooms[''] = this;
			PS.mainmenu = this;
			for (const args of this.backlog) {
				this.receiveLine(args);
			}
			this.backlog = null;
		}
	}
	startSearch = (format: string, team?: Team) => {
		if (this.searchCountdown) {
			PS.alert("Wait for this countdown to finish first...");
			return;
		}
		this.searchCountdown = {
			format,
			packedTeam: team?.packedTeam || '',
			countdown: 3,
			timer: setInterval(this.doSearchCountdown, 1000),
		};
		this.update(null);
	};
	cancelSearch = () => {
		if (this.searchCountdown) {
			clearTimeout(this.searchCountdown.timer);
			this.searchCountdown = null;
			this.update(null);
		}
		if (this.searchSent) {
			this.searchSent = false;
			PS.send('|/cancelsearch');
			this.update(null);
		}
	};
	doSearchCountdown = () => {
		if (!this.searchCountdown) return; // ??? race???

		this.searchCountdown.countdown--;
		if (this.searchCountdown.countdown <= 0) {
			this.doSearch(this.searchCountdown);
			clearTimeout(this.searchCountdown.timer);
			this.searchCountdown = null;
		}
		this.update(null);
	};
	doSearch = (search: NonNullable<typeof this.searchCountdown>) => {
		this.searchSent = true;
		PS.send(`|/utm ${search.packedTeam}`);
		PS.send(`|/search ${search.format}`);
	};
	override receiveLine(args: Args) {
		const [cmd] = args;
		switch (cmd) {
		case 'challstr': {
			const [, challstr] = args;
			PS.user.challstr = challstr;
			PSLoginServer.query(
				'upkeep', { challstr }
			).then(res => {
				if (!res?.username) {
					PS.user.initializing = false;
					return;
				}
				// | , ; are not valid characters in names
				res.username = res.username.replace(/[|,;]+/g, '');
				if (res.loggedin) {
					PS.user.registered = { name: res.username, userid: toID(res.username) };
				}
				PS.user.handleAssertion(res.username, res.assertion);
			});
			return;
		} case 'updateuser': {
			const [, fullName, namedCode, avatar] = args;
			const named = namedCode === '1';
			if (named) PS.user.initializing = false;
			PS.user.setName(fullName, named, avatar);
			return;
		} case 'updatechallenges': {
			const [, challengesBuf] = args;
			this.receiveChallenges(challengesBuf);
			return;
		} case 'updatesearch': {
			const [, searchBuf] = args;
			this.receiveSearch(searchBuf);
			return;
		} case 'queryresponse': {
			const [, queryId, responseJSON] = args;
			this.handleQueryResponse(queryId as ID, JSON.parse(responseJSON));
			return;
		} case 'pm': {
			const [, user1, user2, message] = args;
			this.handlePM(user1, user2, message);
			let sideRoom = PS.rightPanel as ChatRoom;
			if (sideRoom?.type === "chat" && PS.prefs.inchatpm) sideRoom?.log?.add(args);
			return;
		} case 'formats': {
			this.parseFormats(args);
			return;
		} case 'popup': {
			const [, message] = args;
			PS.alert(message.replace(/\|\|/g, '\n'));
			return;
		}
		}
		const lobby = PS.rooms['lobby'];
		if (lobby) lobby.receiveLine(args);
	}
	receiveChallenges(dataBuf: string) {
		let json;
		try {
			json = JSON.parse(dataBuf);
		} catch {}
		for (const userid in json.challengesFrom) {
			PS.getPMRoom(toID(userid));
		}
		if (json.challengeTo) {
			PS.getPMRoom(toID(json.challengeTo.to));
		}
		for (const roomid in PS.rooms) {
			const room = PS.rooms[roomid] as ChatRoom;
			if (!room.pmTarget) continue;
			const targetUserid = toID(room.pmTarget);
			if (!room.challenged && !(targetUserid in json.challengesFrom) &&
				!room.challenging && json.challengeTo?.to !== targetUserid) {
				continue;
			}
			room.challenged = room.parseChallenge(json.challengesFrom[targetUserid]);
			room.challenging = json.challengeTo?.to === targetUserid ? room.parseChallenge(json.challengeTo.format) : null;
			room.update(null);
		}
	}
	receiveSearch(dataBuf: string) {
		let json;
		this.searchSent = false;
		try {
			json = JSON.parse(dataBuf);
		} catch {}
		this.search = json;
		this.update(null);
	}
	parseFormats(formatsList: string[]) {
		let isSection = false;
		let section = '';

		let column = 0;

		window.NonBattleGames = { rps: 'Rock Paper Scissors' };
		for (let i = 3; i <= 9; i += 2) {
			window.NonBattleGames[`bestof${i}`] = `Best-of-${i}`;
		}
		window.BattleFormats = {};
		for (let j = 1; j < formatsList.length; j++) {
			const entry = formatsList[j];
			if (isSection) {
				section = entry;
				isSection = false;
			} else if (entry === ',LL') {
				PS.teams.usesLocalLadder = true;
			} else if (entry === '' || (entry.startsWith(',') && !isNaN(Number(entry.slice(1))))) {
				isSection = true;

				if (entry) {
					column = parseInt(entry.slice(1), 10) || 0;
				}
			} else {
				let name = entry;
				let searchShow = true;
				let challengeShow = true;
				let tournamentShow = true;
				let team: 'preset' | null = null;
				let teambuilderLevel: number | null = null;
				let lastCommaIndex = name.lastIndexOf(',');
				let code = lastCommaIndex >= 0 ? parseInt(name.substr(lastCommaIndex + 1), 16) : NaN;
				if (!isNaN(code)) {
					name = name.substr(0, lastCommaIndex);
					if (code & 1) team = 'preset';
					if (!(code & 2)) searchShow = false;
					if (!(code & 4)) challengeShow = false;
					if (!(code & 8)) tournamentShow = false;
					if (code & 16) teambuilderLevel = 50;
				} else {
					// Backwards compatibility: late 0.9.0 -> 0.10.0
					if (name.substr(name.length - 2) === ',#') { // preset teams
						team = 'preset';
						name = name.substr(0, name.length - 2);
					}
					if (name.substr(name.length - 2) === ',,') { // search-only
						challengeShow = false;
						name = name.substr(0, name.length - 2);
					} else if (name.substr(name.length - 1) === ',') { // challenge-only
						searchShow = false;
						name = name.substr(0, name.length - 1);
					}
				}
				let id = toID(name);
				let isTeambuilderFormat = !team && !name.endsWith('Custom Game');
				let teambuilderFormat = '' as ID;
				let teambuilderFormatName = '';
				if (isTeambuilderFormat) {
					teambuilderFormatName = name;
					if (!id.startsWith('gen')) {
						teambuilderFormatName = '[Gen 6] ' + name;
					}
					let parenPos = teambuilderFormatName.indexOf('(');
					if (parenPos > 0 && name.endsWith(')')) {
						// variation of existing tier
						teambuilderFormatName = teambuilderFormatName.slice(0, parenPos).trim();
					}
					if (teambuilderFormatName !== name) {
						teambuilderFormat = toID(teambuilderFormatName);
						if (BattleFormats[teambuilderFormat]) {
							BattleFormats[teambuilderFormat].isTeambuilderFormat = true;
						} else {
							BattleFormats[teambuilderFormat] = {
								id: teambuilderFormat,
								name: teambuilderFormatName,
								team,
								section,
								column,
								rated: false,
								isTeambuilderFormat: true,
								effectType: 'Format',
							};
						}
						isTeambuilderFormat = false;
					}
				}
				if (BattleFormats[id]?.isTeambuilderFormat) {
					isTeambuilderFormat = true;
				}
				// make sure formats aren't out-of-order
				if (BattleFormats[id]) delete BattleFormats[id];
				BattleFormats[id] = {
					id,
					name,
					team,
					section,
					column,
					searchShow,
					challengeShow,
					tournamentShow,
					rated: searchShow && id.substr(4, 7) !== 'unrated',
					teambuilderLevel,
					teambuilderFormat,
					isTeambuilderFormat,
					effectType: 'Format',
				};
			}
		}

		// Match base formats to their variants, if they are unavailable in the server.
		let multivariantFormats: { [id: string]: 1 } = {};
		for (let id in BattleFormats) {
			let teambuilderFormat = BattleFormats[BattleFormats[id].teambuilderFormat!];
			if (!teambuilderFormat || multivariantFormats[teambuilderFormat.id]) continue;
			if (!teambuilderFormat.searchShow && !teambuilderFormat.challengeShow && !teambuilderFormat.tournamentShow) {
				// The base format is not available.
				if (teambuilderFormat.battleFormat) {
					multivariantFormats[teambuilderFormat.id] = 1;
					teambuilderFormat.battleFormat = '';
				} else {
					teambuilderFormat.battleFormat = id;
				}
			}
		}
		PS.teams.update('format');
	}
	handlePM(user1: string, user2: string, message?: string) {
		const userid1 = toID(user1);
		const userid2 = toID(user2);
		const pmTarget = PS.user.userid === userid1 ? user2 : user1;
		const pmTargetid = PS.user.userid === userid1 ? userid2 : userid1;
		let roomid = `dm-${pmTargetid}` as RoomID;
		if (pmTargetid === PS.user.userid) roomid = 'dm-' as RoomID;
		let room = PS.rooms[roomid] as ChatRoom | undefined;
		if (!room) {
			PS.addRoom({
				id: roomid,
				args: { pmTarget },
			}, true);
			room = PS.rooms[roomid] as ChatRoom;
		} else {
			room.updateTarget(pmTarget);
		}
		if (message) room.receiveLine([`c`, user1, message]);
		PS.update();
	}
	handleQueryResponse(id: ID, response: any) {
		switch (id) {
		case 'userdetails':
			let userid = response.userid;
			let userdetails = this.userdetailsCache[userid];
			if (!userdetails) {
				this.userdetailsCache[userid] = response;
			} else {
				Object.assign(userdetails, response);
			}
			PS.rooms[`user-${userid}`]?.update(null);
			PS.rooms[`viewuser-${userid}`]?.update(null);
			PS.rooms[`users`]?.update(null);
			break;
		case 'rooms':
			if (response.pspl) {
				for (const roomInfo of response.pspl) roomInfo.spotlight = "Spotlight";
				response.chat = [...response.pspl, ...response.chat];
				response.pspl = null;
			}
			if (response.official) {
				for (const roomInfo of response.official) roomInfo.section = "Official";
				response.chat = [...response.official, ...response.chat];
				response.official = null;
			}
			this.roomsCache = response;
			const roomsRoom = PS.rooms[`rooms`] as RoomsRoom;
			if (roomsRoom) roomsRoom.update(null);
			break;
		case 'roomlist':
			const battlesRoom = PS.rooms[`battles`] as BattlesRoom;
			if (battlesRoom) {
				const battleTable = response.rooms;
				const battles = [];
				for (const battleid in battleTable) {
					battleTable[battleid].id = battleid;
					battles.push(battleTable[battleid]);
				}
				battlesRoom.battles = battles;
				battlesRoom.update(null);
			}
			break;
		case 'laddertop':
			for (const [roomid, ladderRoom] of Object.entries(PS.rooms)) {
				if (roomid.startsWith('ladder-')) {
					(ladderRoom as LadderFormatRoom).update(response);
				}
			}
			break;
		}
	}
}

class NewsPanel extends PSRoomPanel {
	static readonly id = 'news';
	static readonly routes = ['news'];
	static readonly title = 'News';
	static readonly location = 'mini-window';
	change = (ev: Event) => {
		const target = ev.currentTarget as HTMLInputElement;
		if (target.value === '1') {
			document.cookie = "preactalpha=1; expires=Thu, 1 May 2025 12:00:00 UTC; path=/";
		} else {
			document.cookie = "preactalpha=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
		}
		if (target.value === 'leave') {
			document.location.href = `/`;
		}
	};
	override render() {
		const cookieSet = document.cookie.includes('preactalpha=1');
		return <PSPanelWrapper room={this.props.room} fullSize scrollable>
			<div class="construction"><div class="construction-inner">
				This is the Preact client alpha test.
				<form>
					<label class="checkbox">
						<input type="radio" name="preactalpha" value="1" onChange={this.change} checked={cookieSet} /> {}
						Use Preact always
					</label>
					<label class="checkbox">
						<input type="radio" name="preactalpha" value="0" onChange={this.change} checked={!cookieSet} /> {}
						Use Preact with URL
					</label>
					<label class="checkbox">
						<input type="radio" name="preactalpha" value="leave" onChange={this.change} /> {}
						Back to the old client
					</label>
				</form>
			</div></div>
			<div class="readable-bg" dangerouslySetInnerHTML={{ __html: PS.newsHTML }}></div>
		</PSPanelWrapper>;
	}
}

class MainMenuPanel extends PSRoomPanel<MainMenuRoom> {
	static readonly id = 'mainmenu';
	static readonly routes = [''];
	static readonly Model = MainMenuRoom;
	static readonly icon = <i class="fa fa-home"></i>;
	override focus() {
		this.base?.querySelector<HTMLButtonElement>('.formatselect')?.focus();
	}
	submitSearch = (ev: Event, format: string, team?: Team) => {
		if (!PS.user.named) {
			PS.join('login' as RoomID, {
				parentElem: this.base!.querySelector<HTMLElement>('.big.button'),
			});
			return;
		}
		PS.mainmenu.startSearch(format, team);
	};
	handleDragStart = (e: DragEvent) => {
		const room = PS.getRoom(e.currentTarget);
		if (!room) return;
		const foreground = (PS.leftPanel.id === room.id || PS.rightPanel?.id === room.id);
		PS.dragging = { type: 'room', roomid: room.id, foreground };
	};
	handleDragEnter = (e: DragEvent) => {
		// console.log('dragenter ' + e.dataTransfer!.dropEffect);
		e.preventDefault();
		if (!PS.dragging) return; // TODO: handle dragging other things onto roomtabs
		const draggingRoom = PS.dragging.roomid;
		if (draggingRoom === null) return;

		const draggedOverRoom = PS.getRoom(e.target as HTMLElement);
		if (draggingRoom === draggedOverRoom?.id) return;

		const index = PS.miniRoomList.indexOf(draggedOverRoom?.id as any);
		if (index >= 0) {
			PS.dragOnto(PS.rooms[draggingRoom]!, 'mini-window', index);
		} else if (PS.rooms[draggingRoom]?.location !== 'mini-window') {
			PS.dragOnto(PS.rooms[draggingRoom]!, 'mini-window', 0);
		}

		// dropEffect !== 'none' prevents bounce-back animation in
		// Chrome/Safari/Opera
		// if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
	};
	renderMiniRoom(room: PSRoom) {
		const RoomType = PS.roomTypes[room.type];
		const Panel = RoomType || PSRoomPanel;
		return <Panel key={room.id} room={room} />;
	}
	handleClickMinimize = (e: MouseEvent) => {
		if ((e.target as HTMLInputElement)?.name === 'closeRoom') {
			return;
		}
		if (((e.target as any)?.parentNode as HTMLInputElement)?.name === 'closeRoom') {
			return;
		}
		const room = PS.getRoom(e.currentTarget);
		if (room) {
			room.minimized = !room.minimized;
			this.forceUpdate();
		}
	};
	renderMiniRooms() {
		return PS.miniRoomList.map(roomid => {
			const room = PS.rooms[roomid]!;
			const notifying = room.notifications.length ? ' notifying' : room.isSubtleNotifying ? ' subtle-notifying' : '';
			return <div
				class={`mini-window${room.minimized ? ' collapsed' : ''}${room === PS.room ? ' focused' : ''}`}
				key={roomid} data-roomid={roomid}
			>
				<h3
					class={`mini-window-header${notifying}`} draggable onDragStart={this.handleDragStart} onClick={this.handleClickMinimize}
				>
					<button class="closebutton" data-cmd="/close" aria-label="Close" tabIndex={-1}>
						<i class="fa fa-times-circle"></i>
					</button>
					<button class="maximizebutton" data-cmd="/maximize" tabIndex={-1}><i class="fa fa-stop-circle"></i></button>
					<button class="minimizebutton" tabIndex={-1}><i class="fa fa-minus-circle"></i></button>
					{room.title}
				</h3>
				{this.renderMiniRoom(room)}
			</div>;
		});
	}
	renderGames() {
		if (!PS.mainmenu.search.games) return null;

		// This does not use the word "game" because it includes things like help tickets
		return <div class="menugroup">
			<p class="label">You are in:</p>
			{Object.entries(PS.mainmenu.search.games).map(([roomid, gameName]) => <div>
				<a class="blocklink" href={`${roomid}`}>{gameName}</a>
			</div>)}
		</div>;
	}
	renderSearchButton() {
		if (PS.down) {
			return <div class="menugroup" style="background: rgba(10,10,10,.6)">
				{PS.down === 'ddos' ? (
					<p class="error"><strong>Pok&eacute;mon Showdown is offline due to a DDoS attack!</strong></p>
				) : (
					<p class="error"><strong>Pok&eacute;mon Showdown is offline due to technical difficulties!</strong></p>
				)}
				<p>
					<div style={{ textAlign: 'center' }}>
						<img width="96" height="96" src={`//${Config.routes.client}/sprites/gen5/teddiursa.png`} alt="" />
					</div>
					Bear with us as we freak out.
				</p>
				<p>(We'll be back up in a few hours.)</p>
			</div>;
		}

		if (!PS.user.userid || PS.isOffline) {
			return <TeamForm class="menugroup" onSubmit={this.submitSearch}>
				<button class="mainmenu1 mainmenu big button disabled" disabled name="search">
					<em>{PS.isOffline ? [<span class="fa-stack fa-lg">
						<i class="fa fa-plug fa-flip-horizontal fa-stack-1x"></i>
						<i class="fa fa-ban fa-stack-2x text-danger"></i>
					</span>, " Disconnected"] : "Connecting..."}</em>
				</button>
				{PS.isOffline && <p class="buttonbar">
					<button class="button" data-cmd="/reconnect"><i class="fa fa-plug"></i> <strong>Reconnect</strong></button>
				</p>}
			</TeamForm>;
		}

		return <TeamForm class="menugroup" onSubmit={this.submitSearch}>
			{PS.mainmenu.searchCountdown ? (
				<>
					<button class="mainmenu1 mainmenu big button disabled" type="submit">
						<strong><i class="fa fa-refresh fa-spin"></i> Searching in {PS.mainmenu.searchCountdown.countdown}...</strong>
					</button>
					<p class="buttonbar"><button class="button" data-cmd="/cancelsearch">Cancel</button></p>
				</>
			) : (PS.mainmenu.searchSent || PS.mainmenu.search.searching.length) ? (
				<>
					<button class="mainmenu1 mainmenu big button disabled" type="submit">
						<strong><i class="fa fa-refresh fa-spin"></i> Searching...</strong>
					</button>
					<p class="buttonbar"><button class="button" data-cmd="/cancelsearch">Cancel</button></p>
				</>
			) : (
				<button class="mainmenu1 mainmenu big button" type="submit">
					<strong>Battle!</strong><br />
					<small>Find a random opponent</small>
				</button>
			)}
		</TeamForm>;
	}
	override render() {
		const onlineButton = ' button' + (PS.isOffline ? ' disabled' : '');
		const tinyLayout = this.props.room.width < 620 ? ' tiny-layout' : '';
		return <PSPanelWrapper room={this.props.room} scrollable onDragEnter={this.handleDragEnter}>
			<div class={`mainmenu-mini-windows${tinyLayout}`}>
				{this.renderMiniRooms()}
			</div>
			<div class={`mainmenu${tinyLayout}`}>
				<div class="mainmenu-left">
					{this.renderGames()}

					{this.renderSearchButton()}

					<div class="menugroup">
						<p><a class="mainmenu2 mainmenu button" href="teambuilder">Teambuilder</a></p>
						<p><a class={"mainmenu3 mainmenu" + onlineButton} href="ladder">Ladder</a></p>
						<p><a class={"mainmenu4 mainmenu" + onlineButton} href="view-tournaments-all">Tournaments</a></p>
					</div>

					<div class="menugroup">
						<p><a class={"mainmenu4 mainmenu" + onlineButton} href="battles">Watch a battle</a></p>
						<p><a class={"mainmenu5 mainmenu" + onlineButton} href="users">Find a user</a></p>
						<p><a class={"mainmenu6 mainmenu" + onlineButton} href="view-friends-all">Friends</a></p>
					</div>
				</div>
				<div class="mainmenu-right" style={{ display: PS.leftPanelWidth ? 'none' : 'block' }}>
					<div class="menugroup">
						<p><a class={"mainmenu1 mainmenu" + onlineButton} href="rooms">Chat rooms</a></p>
						{PS.server.id !== 'showdown' && (
							<p><a class={"mainmenu2 mainmenu" + onlineButton} href="lobby">Lobby chat</a></p>
						)}
					</div>
				</div>
				<div class="mainmenu-footer">
					<div class="bgcredit"></div>
					<small>
						<a href={`//${Config.routes.dex}/`} target="_blank">Pok&eacute;dex</a> | {}
						<a href={`//${Config.routes.replays}/`} target="_blank">Replays</a> | {}
						<a href={`//${Config.routes.root}/rules`} target="_blank">Rules</a> | {}
						<a href={`//${Config.routes.root}/credits`} target="_blank">Credits</a> | {}
						<a href="//smogon.com/forums/" target="_blank">Forum</a>
					</small>
				</div>
			</div>
		</PSPanelWrapper>;
	}
}

export class FormatDropdown extends preact.Component<{ format?: string, onChange?: JSX.EventHandler<Event> }> {
	declare base?: HTMLButtonElement;
	format = `[Gen ${Dex.gen}] Random Battle`;
	change = (e: Event) => {
		if (!this.base) return;
		this.format = this.base.value;
		this.forceUpdate();
		if (this.props.onChange) this.props.onChange(e);
	};
	render() {
		if (this.props.format) {
			let [formatName, customRules] = this.props.format.split('@@@');
			if (window.BattleLog) formatName = BattleLog.formatName(formatName);
			return <button
				name="format" value={this.props.format} class="select formatselect preselected" disabled
			>
				{formatName}
				{!!customRules && [<br />, <small>Custom rules: {customRules}</small>]}
			</button>;
		}
		return <button
			name="format" value={this.format}
			class="select formatselect" data-href="/formatdropdown" onChange={this.change}
		>
			{this.format}
		</button>;
	}
}

class TeamDropdown extends preact.Component<{ format: string }> {
	teamFormat = '';
	teamKey = '';
	change = () => {
		if (!this.base) return;
		this.teamKey = (this.base as HTMLButtonElement).value;
		this.forceUpdate();
	};
	getDefaultTeam(teambuilderFormat: string) {
		for (const team of PS.teams.list) {
			if (team.format === teambuilderFormat) return team.key;
		}
		return '';
	}
	render() {
		const teamFormat = PS.teams.teambuilderFormat(this.props.format);
		const formatData = window.BattleFormats?.[teamFormat];
		if (formatData?.team) {
			return <button class="select teamselect preselected" name="team" value="random" disabled>
				<div class="team">
					<strong>Random team</strong>
					<small>
						<span class="picon" style={Dex.getPokemonIcon(null)}></span>
						<span class="picon" style={Dex.getPokemonIcon(null)}></span>
						<span class="picon" style={Dex.getPokemonIcon(null)}></span>
						<span class="picon" style={Dex.getPokemonIcon(null)}></span>
						<span class="picon" style={Dex.getPokemonIcon(null)}></span>
						<span class="picon" style={Dex.getPokemonIcon(null)}></span>
					</small>
				</div>
			</button>;
		}
		if (teamFormat !== this.teamFormat) {
			this.teamFormat = teamFormat;
			this.teamKey = this.getDefaultTeam(teamFormat);
		}
		const team = PS.teams.byKey[this.teamKey] || null;
		return <button
			name="team" value={this.teamKey}
			class="select teamselect" data-href="/teamdropdown" data-format={teamFormat} onChange={this.change}
		>
			{PS.roomTypes['teamdropdown'] && <TeamBox team={team} noLink />}
		</button>;
	}
}

export class TeamForm extends preact.Component<{
	children: preact.ComponentChildren, class?: string, format?: string, teamFormat?: string, hideFormat?: boolean,
	onSubmit: ((e: Event, format: string, team?: Team) => void) | null,
	onValidate?: ((e: Event, format: string, team?: Team) => void) | null,
}> {
	override state = { format: `[Gen ${Dex.gen}] Random Battle` };
	changeFormat = (ev: Event) => {
		this.setState({ format: (ev.target as HTMLButtonElement).value });
	};
	submit = (ev: Event) => {
		ev.preventDefault();
		const format = this.state.format;
		const teamKey = this.base!.querySelector<HTMLButtonElement>('button[name=team]')!.value;
		const team = teamKey ? PS.teams.byKey[teamKey] : undefined;
		this.props.onSubmit?.(ev, format, team);
	};
	handleClick = (ev: Event) => {
		let target = ev.target as HTMLButtonElement | null;
		while (target && target !== this.base) {
			if (target.tagName === 'BUTTON' && target.name === 'validate') {
				ev.preventDefault();
				const format = this.state.format;
				const teamKey = this.base!.querySelector<HTMLButtonElement>('button[name=team]')!.value;
				const team = teamKey ? PS.teams.byKey[teamKey] : undefined;
				this.props.onSubmit?.(ev, format, team);
				return;
			}
			target = target.parentNode as HTMLButtonElement | null;
		}
	};
	render() {
		return <form class={this.props.class} onSubmit={this.submit} onClick={this.handleClick}>
			{!this.props.hideFormat && <p>
				<label class="label">
					Format:<br />
					<FormatDropdown onChange={this.changeFormat} format={this.props.format} />
				</label>
			</p>}
			<p>
				<label class="label">
					Team:<br />
					<TeamDropdown format={this.props.teamFormat || this.state.format} />
				</label>
			</p>
			<p>{this.props.children}</p>
		</form>;
	}
}

PS.addRoomType(NewsPanel, MainMenuPanel);
