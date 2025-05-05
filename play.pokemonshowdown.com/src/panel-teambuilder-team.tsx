/**
 * Teambuilder team panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

import { PS, PSRoom, type RoomOptions, type Team } from "./client-main";
import { PSPanelWrapper, PSRoomPanel } from "./panels";
import { PSTeambuilder, type FormatResource } from "./panel-teamdropdown";
import { toID } from "./battle-dex";
import { BattleLog } from "./battle-log";
import { FormatDropdown } from "./panel-mainmenu";
import { TeamEditor } from "./battle-team-editor";

class TeamRoom extends PSRoom {
	/** Doesn't _literally_ always exist, but does in basically all code
	 * and constantly checking for its existence is legitimately annoying... */
	team!: Team;
	constructor(options: RoomOptions) {
		super(options);
		const team = PS.teams.byKey[this.id.slice(5)] || null;
		this.team = team!;
		this.title = `[Team] ${this.team?.name || 'Error'}`;
		if (team) this.setFormat(team.format);
	}
	setFormat(format: string) {
		const team = this.team;
		team.format = toID(format);
	}
	save() {
		PS.teams.save();
		const title = `[Team] ${this.team?.name || 'Team'}`;
		if (title !== this.title) {
			this.title = title;
			PS.update();
		}
	}
}

class TeamPanel extends PSRoomPanel<TeamRoom> {
	static readonly id = 'team';
	static readonly routes = ['team-*'];
	static readonly Model = TeamRoom;
	static readonly title = 'Team';

	resources?: FormatResource;

	constructor(props?: { room: TeamRoom }) {
		super(props);
		const room = this.props.room;
		if (room.team) {
			PSTeambuilder.getFormatResources(room.team.format).then(resources => {
				this.resources = resources;
				this.forceUpdate();
			});
		} else {
			this.resources = null;
		}
	}

	handleRename = (ev: Event) => {
		const textbox = ev.currentTarget as HTMLInputElement;
		const room = this.props.room;

		room.team.name = textbox.value.trim();
		room.save();
	};
	handleChangeFormat = (ev: Event) => {
		const dropdown = ev.currentTarget as HTMLButtonElement;
		const room = this.props.room;

		room.setFormat(dropdown.value);
		room.save();
		this.forceUpdate();
	};
	save = () => {
		this.props.room.save();
	};

	override render() {
		const room = this.props.room;
		if (!room.team) {
			return <PSPanelWrapper room={room}>
				<a class="button" href="teambuilder" data-target="replace">
					<i class="fa fa-chevron-left" aria-hidden></i> List
				</a>
				<p class="error">
					Team doesn't exist
				</p>
			</PSPanelWrapper>;
		}

		const info = this.resources;
		const formatName = BattleLog.formatName(room.team.format);
		return <PSPanelWrapper room={room} scrollable><div class="pad">
			<a class="button" href="teambuilder" data-target="replace">
				<i class="fa fa-chevron-left" aria-hidden></i> Teams
			</a>
			<div style="float:right"><FormatDropdown
				format={room.team.format} placeholder="" selectType="teambuilder" onChange={this.handleChangeFormat}
			/></div>
			<label class="label teamname">
				Team name:{}
				<input
					class="textbox" type="text" value={room.team.name}
					onInput={this.handleRename} onChange={this.handleRename} onKeyUp={this.handleRename}
				/>
			</label>
			<TeamEditor team={room.team} onChange={this.save} />
			{!!(info && (info.resources.length || info.url)) && (
				<div style={{ paddingLeft: "5px" }}>
					<h3 style={{ fontSize: "12px" }}>Teambuilding resources for {formatName}:</h3>
					<ul>
						{info.resources.map(resource => (
							<li><p><a href={resource.url} target="_blank">{resource.resource_name}</a></p></li>
						))}
					</ul>
					<p>
						Find {info.resources.length ? 'more ' : ''}
						helpful resources for {formatName} on <a href={info.url} target="_blank">the Smogon Dex</a>.
					</p>
				</div>
			)}
		</div></PSPanelWrapper>;
	}
}

PS.addRoomType(TeamPanel);
