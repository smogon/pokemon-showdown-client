/**
 * Main menu panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

import preact from "../js/lib/preact";
import {PSLoginServer} from "./client-connection";
import {PS, PSRoom, type RoomID, type Team} from "./client-main";
import {PSPanelWrapper, PSRoomPanel} from "./panels";
import type {BattlesRoom} from "./panel-battle";
import type {ChatRoom} from "./panel-chat";
import type {LadderRoom} from "./panel-ladder";
import type {RoomsRoom} from "./panel-rooms";
import {TeamBox} from "./panel-teamdropdown";
import type {UserRoom} from "./panel-topbar";
import {Dex, toID, type ID} from "./battle-dex";
import type {Args} from "./battle-text-parser";

export type RoomInfo = {
	title: string, desc?: string, userCount?: number, section?: string, spotlight?: string, subRooms?: string[],
};

export class MainMenuRoom extends PSRoom {
	override readonly classType: string = 'mainmenu';
	userdetailsCache: {[userid: string]: {
		userid: ID,
		avatar?: string | number,
		status?: string,
		group?: string,
		customgroup?: string,
		rooms?: {[roomid: string]: {isPrivate?: true, p1?: string, p2?: string}},
	}} = {};
	roomsCache: {
		battleCount?: number,
		userCount?: number,
		chat?: RoomInfo[],
		sectionTitles?: string[],
	} = {};
	override receiveLine(args: Args) {
		const [cmd] = args;
		switch (cmd) {
		case 'challstr': {
			const [, challstr] = args;
			PSLoginServer.query({
				act: 'upkeep',
				challstr,
			}).then(res => {
				if (!res) return;
				if (!res.loggedin) return;
				this.send(`/trn ${res.username},0,${res.assertion}`);
			});
			return;
		} case 'updateuser': {
			const [, fullName, namedCode, avatar] = args;
			PS.user.setName(fullName, namedCode === '1', avatar);
			return;
		} case 'updatechallenges': {
			const [, challengesBuf] = args;
			this.receiveChallenges(challengesBuf);
			return;
		} case 'queryresponse': {
			const [, queryId, responseJSON] = args;
			this.handleQueryResponse(queryId as ID, JSON.parse(responseJSON));
			return;
		} case 'pm': {
			const [, user1, user2, message] = args;
			this.handlePM(user1, user2, message);
			return;
		} case 'formats': {
			this.parseFormats(args);
			return;
		} case 'popup': {
			const [, message] = args;
			alert(message.replace(/\|\|/g, '\n'));
			return;
		}}
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
			if (!room.challengedFormat && !(targetUserid in json.challengesFrom) &&
				!room.challengingFormat && json.challengeTo?.to !== targetUserid) {
				continue;
			}
			room.challengedFormat = json.challengesFrom[targetUserid] || null;
			room.challengingFormat = json.challengeTo?.to === targetUserid ? json.challengeTo.format : null;
			room.update(null);
		}
	}
	parseFormats(formatsList: string[]) {
		let isSection = false;
		let section = '';

		let column = 0;

		window.NonBattleGames = {rps: 'Rock Paper Scissors'};
		for (let i = 3; i <= 9; i = i + 2) {
			window.NonBattleGames['bestof' + i] = 'Best-of-' + i;
		}
		window.BattleFormats = {};
		for (let j = 1; j < formatsList.length; j++) {
			const entry = formatsList[j];
			if (isSection) {
				section = entry;
				isSection = false;
			} else if (entry === ',LL') {
				PS.teams.usesLocalLadder = true;
			} else if (entry === '' || (entry.charAt(0) === ',' && !isNaN(Number(entry.slice(1))))) {
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
				let isTeambuilderFormat = !team && name.slice(-11) !== 'Custom Game';
				let teambuilderFormat = '' as ID;
				let teambuilderFormatName = '';
				if (isTeambuilderFormat) {
					teambuilderFormatName = name;
					if (id.slice(0, 3) !== 'gen') {
						teambuilderFormatName = '[Gen 6] ' + name;
					}
					let parenPos = teambuilderFormatName.indexOf('(');
					if (parenPos > 0 && name.slice(-1) === ')') {
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
		let multivariantFormats: {[id: string]: 1} = {};
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
	handlePM(user1: string, user2: string, message: string) {
		const userid1 = toID(user1);
		const userid2 = toID(user2);
		const roomid = `pm-${[userid1, userid2].sort().join('-')}` as RoomID;
		let room = PS.rooms[roomid];
		if (!room) {
			const pmTarget = PS.user.userid === userid1 ? user2 : user1;
			PS.addRoom({
				id: roomid,
				pmTarget,
			}, true);
			room = PS.rooms[roomid]!;
		}
		room.receiveLine([`c`, user1, message]);
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
			const userRoom = PS.rooms[`user-${userid}`] as UserRoom;
			if (userRoom) userRoom.update(null);
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
			const ladderRoomEntries = Object.entries(PS.rooms).filter(entry => entry[0].startsWith('ladder'));
			for (const [, ladderRoom] of ladderRoomEntries) {
				(ladderRoom as LadderRoom).update(response);
			}
			break;
		}
	}
}

class NewsPanel extends PSRoomPanel {
	override render() {
		return <PSPanelWrapper room={this.props.room} scrollable>
			<div class="mini-window-body" dangerouslySetInnerHTML={{__html: PS.newsHTML}}></div>
		</PSPanelWrapper>;
	}
}

class MainMenuPanel extends PSRoomPanel<MainMenuRoom> {
	override focus() {
		(this.base!.querySelector('button.big') as HTMLButtonElement).focus();
	}
	submit = (e: Event) => {
		alert('todo: implement');
	};
	handleDragStart = (e: DragEvent) => {
		const roomid = (e.currentTarget as HTMLElement).getAttribute('data-roomid') as RoomID;
		PS.dragging = {type: 'room', roomid};
	};
	renderMiniRoom(room: PSRoom) {
		const roomType = PS.roomTypes[room.type];
		const Panel = roomType ? roomType.Component : PSRoomPanel;
		return <Panel key={room.id} room={room} />;
	}
	renderMiniRooms() {
		return PS.miniRoomList.map(roomid => {
			const room = PS.rooms[roomid]!;
			return <div class="pmbox">
				<div class="mini-window">
					<h3 draggable onDragStart={this.handleDragStart} data-roomid={roomid}>
						<button class="closebutton" name="closeRoom" value={roomid} aria-label="Close" tabIndex={-1}><i class="fa fa-times-circle"></i></button>
						<button class="minimizebutton" tabIndex={-1}><i class="fa fa-minus-circle"></i></button>
						{room.title}
					</h3>
					{this.renderMiniRoom(room)}
				</div>
			</div>;
		});
	}
	renderSearchButton() {
		if (PS.down) {
			return <div class="menugroup" style="background: rgba(10,10,10,.6)">
				{PS.down === 'ddos' ?
					<p class="error"><strong>Pok&eacute;mon Showdown is offline due to a DDoS attack!</strong></p>
				:
					<p class="error"><strong>Pok&eacute;mon Showdown is offline due to technical difficulties!</strong></p>
				}
				<p>
					<div style={{textAlign: 'center'}}>
						<img width="96" height="96" src={`//${Config.routes.client}/sprites/gen5/teddiursa.png`} alt="" />
					</div>
					Bear with us as we freak out.
				</p>
				<p>(We'll be back up in a few hours.)</p>
			</div>;
		}

		if (!PS.user.userid || PS.isOffline) {
			return <TeamForm class="menugroup" onSubmit={this.submit}>
				<button class="mainmenu1 big button disabled" name="search">
					<em>{PS.isOffline ? "Disconnected" : "Connecting..."}</em>
				</button>
			</TeamForm>;
		}

		return <TeamForm class="menugroup" onSubmit={this.submit}>
			<button class="mainmenu1 big button" name="search">
				<strong>Battle!</strong><br />
				<small>Find a random opponent</small>
			</button>
		</TeamForm>;
	}
	override render() {
		const onlineButton = ' button' + (PS.isOffline ? ' disabled' : '');
		return <PSPanelWrapper room={this.props.room} scrollable>
			<div class="mainmenuwrapper">
				<div class="leftmenu">
					<div class="activitymenu">
						{this.renderMiniRooms()}
					</div>
					<div class="mainmenu">
						{this.renderSearchButton()}

						<div class="menugroup">
							<p><button class="mainmenu2 button" name="joinRoom" value="teambuilder">Teambuilder</button></p>
							<p><button class={"mainmenu3" + onlineButton} name="joinRoom" value="ladder">Ladder</button></p>
						</div>

						<div class="menugroup">
							<p><button class={"mainmenu4" + onlineButton} name="joinRoom" value="battles">Watch a battle</button></p>
							<p><button class={"mainmenu5" + onlineButton} name="finduser">Find a user</button></p>
						</div>
					</div>
				</div>
				<div class="rightmenu" style={{display: PS.leftRoomWidth ? 'none' : 'block'}}>
					<div class="menugroup">
						{PS.server.id === 'showdown' ?
							<p><button class={"mainmenu1" + onlineButton} name="joinRoom" value="rooms">Join chat</button></p>
						:
							<p><button class={"mainmenu1" + onlineButton} name="joinRoom" value="lobby">Join lobby chat</button></p>
						}
					</div>
				</div>
				<div class="mainmenufooter">
					<div class="bgcredit"></div>
					<small>
						<a href={`//${Config.routes.dex}/`} target="_blank">Pok&eacute;dex</a> | {}
						<a href={`//${Config.routes.replays}/`} target="_blank">Replays</a> | {}
						<a href={`//${Config.routes.root}/rules`} target="_blank">Rules</a> | {}
						<a href={`//${Config.routes.dex}/credits`} target="_blank">Credits</a> | {}
						<a href="//smogon.com/forums/" target="_blank">Forum</a>
					</small>
				</div>
			</div>
		</PSPanelWrapper>;
	}
}

export class FormatDropdown extends preact.Component<{format?: string, onChange?: JSX.EventHandler<Event>}> {
	declare base?: HTMLButtonElement;
	format = '[Gen 7] Random Battle';
	change = (e: Event) => {
		if (!this.base) return;
		this.format = this.base.value;
		this.forceUpdate();
		if (this.props.onChange) this.props.onChange(e);
	};
	render() {
		if (this.props.format) {
			return <button
			name="format" value={this.props.format} class="select formatselect preselected" disabled
			>{this.props.format}</button>;
		}
		return <button
			name="format" value={this.format}
			class="select formatselect" data-href="/formatdropdown" onChange={this.change}
		>
			{this.format}
		</button>;
	}
}

class TeamDropdown extends preact.Component<{format: string}> {
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
		if (formatData && formatData.team) {
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
	children: preact.ComponentChildren, class?: string, format?: string,
	onSubmit: null | ((e: Event, format: string, team?: Team) => void),
}> {
	override state = {format: '[Gen 7] Random Battle'};
	changeFormat = (e: Event) => {
		this.setState({format: (e.target as HTMLButtonElement).value});
	};
	submit = (e: Event) => {
		e.preventDefault();
		const format = (this.base!.querySelector('button[name=format]') as HTMLButtonElement).value;
		const teamKey = (this.base!.querySelector('button[name=team]') as HTMLButtonElement).value;
		const team = teamKey ? PS.teams.byKey[teamKey] : undefined;
		if (this.props.onSubmit) this.props.onSubmit(e, format, team);
	};
	render() {
		return <form class={this.props.class} onSubmit={this.submit}>
			<p>
				<label class="label">
					Format:<br />
					<FormatDropdown onChange={this.changeFormat} format={this.props.format} />
				</label>
			</p>
			<p>
				<label class="label">
					Team:<br />
					<TeamDropdown format={this.state.format} />
				</label>
			</p>
			<p>{this.props.children}</p>
		</form>;
	}
}

PS.roomTypes['news'] = {
	Component: NewsPanel,
};

PS.roomTypes['mainmenu'] = {
	Model: MainMenuRoom,
	Component: MainMenuPanel,
};
