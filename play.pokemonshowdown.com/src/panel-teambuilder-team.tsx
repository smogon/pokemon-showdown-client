/**
 * Teambuilder team panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

import { PS, PSRoom, type RoomOptions, type Team } from "./client-main";
import { PSPanelWrapper, PSRoomPanel } from "./panels";
import { toID } from "./battle-dex";
import { BattleLog } from "./battle-log";
import { FormatDropdown } from "./panel-mainmenu";
import { TeamEditor } from "./battle-team-editor";
import { Net } from "./client-connection";

class TeamRoom extends PSRoom {
	/** Doesn't _literally_ always exist, but does in basically all code
	 * and constantly checking for its existence is legitimately annoying... */
	team!: Team;
	uploaded = false;
	override clientCommands = this.parseClientCommands({
		'validate'(target) {
			if (this.team.format.length <= 4) {
				return this.errorReply(`You must select a format first.`);
			}
			this.send(`/utm ${this.team.packedTeam}`);
			this.send(`/vtm ${this.team.format}`);
		},
	});
	constructor(options: RoomOptions) {
		super(options);
		const team = PS.teams.byKey[this.id.slice(5)] || null;
		this.team = team!;
		this.title = `[Team] ${this.team?.name || 'Error'}`;
		if (team) this.setFormat(team.format);
		this.uploaded = !!team?.uploaded;
		this.load();
	}
	setFormat(format: string) {
		const team = this.team;
		team.format = toID(format);
	}
	load() {
		PS.teams.loadTeam(this.team, true)?.then(() => {
			this.update(null);
		});
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

export type FormatResource = { url: string, resources: { resource_name: string, url: string }[] } | null;
class TeamPanel extends PSRoomPanel<TeamRoom> {
	static readonly id = 'team';
	static readonly routes = ['team-*'];
	static readonly Model = TeamRoom;
	static readonly title = 'Team';

	constructor(props?: { room: TeamRoom }) {
		super(props);
		const room = this.props.room;
		if (room.team) {
			TeamPanel.getFormatResources(room.team.format).then(() => {
				this.forceUpdate();
			});
		}
	}

	static formatResources = {} as Record<string, FormatResource>;

	static getFormatResources(format: string): Promise<FormatResource> {
		if (format in this.formatResources) return Promise.resolve(this.formatResources[format]);
		return Net('https://www.smogon.com/dex/api/formats/by-ps-name/' + format).get()
			.then(result => {
				this.formatResources[format] = JSON.parse(result);
				return this.formatResources[format];
			}).catch(err => {
				this.formatResources[format] = null;
				return this.formatResources[format];
			});
	}

	handleRename = (ev: Event) => {
		const textbox = ev.currentTarget as HTMLInputElement;
		const room = this.props.room;

		room.team.name = textbox.value.trim();
		room.save();
	};

	uploadTeam = (ev: Event) => {
		const room = this.props.room;
		const team = PS.teams.byKey[room.id.slice(5)];
		if (!team) return;

		const cmd = team.uploaded ? 'update' : 'save';
		// teamName, formatid, rawPrivacy, rawTeam
		const buf = [];
		if (team.uploaded) {
			buf.push(team.uploaded.teamid);
		} else if (team.teamid) {
			return PS.alert(`This team is for a different account. Please log into the correct account to update it.`);
		}
		buf.push(team.name, team.format, PS.prefs.uploadprivacy ? 1 : 0);
		const exported = team.packedTeam;
		if (!exported) return PS.alert(`Add a Pokemon to your team before uploading it.`);
		buf.push(exported);
		PS.teams.uploading = team;
		PS.send(`|/teams ${cmd} ${buf.join(', ')}`);
		room.uploaded = true;
		this.forceUpdate();
	};

	changePrivacyPref = (ev: Event) => {
		this.props.room.uploaded = false;
		PS.prefs.uploadprivacy = !(ev.currentTarget as HTMLInputElement).checked;
		PS.prefs.save();
		this.forceUpdate();
	};
	handleChangeFormat = (ev: Event) => {
		const dropdown = ev.currentTarget as HTMLButtonElement;
		const room = this.props.room;

		room.setFormat(dropdown.value);
		room.save();
		this.forceUpdate();
		TeamPanel.getFormatResources(room.team.format).then(() => {
			this.forceUpdate();
		});
	};
	save = () => {
		this.props.room.save();
		this.props.room.uploaded = false;
		this.forceUpdate();
	};

	override render() {
		const room = this.props.room;
		const team = room.team;
		if (!team) {
			return <PSPanelWrapper room={room}>
				<a class="button" href="teambuilder" data-target="replace">
					<i class="fa fa-chevron-left" aria-hidden></i> List
				</a>
				<p class="error">
					Team doesn't exist
				</p>
			</PSPanelWrapper>;
		}

		const info = TeamPanel.formatResources[team.format];
		const formatName = BattleLog.formatName(team.format);
		return <PSPanelWrapper room={room} scrollable><div class="pad">
			<a class="button" href="teambuilder" data-target="replace">
				<i class="fa fa-chevron-left" aria-hidden></i> Teams
			</a> {}
			{team.uploaded?.private ? (
				<button class="button cur" disabled>
					<i class="fa fa-cloud"></i> Account
				</button>
			) : team.uploaded ? (
				<button class="button cur" disabled>
					<i class="fa fa-globe"></i> Account (public)
				</button>
			) : team.teamid ? (
				<button class="button cur" disabled>
					<i class="fa fa-plug"></i> Disconnected (wrong account?)
				</button>
			) : (
				<button class="button cur" disabled>
					<i class="fa fa-laptop"></i> Local
				</button>
			)}
			<div style="float:right"><FormatDropdown
				format={team.format} placeholder="" selectType="teambuilder" onChange={this.handleChangeFormat}
			/></div>
			<label class="label teamname">
				Team name:{}
				<input
					class="textbox" type="text" value={team.name}
					onInput={this.handleRename} onChange={this.handleRename} onKeyUp={this.handleRename}
				/>
			</label>
			<TeamEditor team={team} onChange={this.save} readonly={!!team.teamid && !team.uploaded}>
				{!!(team.packedTeam && team.format.length > 4) && <p>
					<button data-cmd="/validate" class="button"><i class="fa fa-check"></i> Validate</button>
				</p>}
				{team.uploaded?.private === null && <p>
					<small>Share URL:</small> {}
					<input type="text" class="textbox" value={`https://psim.us/t/${team.uploaded.teamid}`} readOnly size={24} />
				</p>}
				{!!(team.packedTeam || team.uploaded) && <p>
					<label class="checkbox inline">
						<input
							name="teamprivacy" checked={!PS.prefs.uploadprivacy}
							type="checkbox" onChange={this.changePrivacyPref}
						/> Public
					</label>
					{room.uploaded ? (
						<button class="button exportbutton" disabled>
							<i class="fa fa-check"></i> Saved to your account
						</button>
					) : (
						<button class="button exportbutton" onClick={this.uploadTeam}>
							<i class="fa fa-upload"></i> Save to my account {}
							({PS.prefs.uploadprivacy ? 'use on other devices' : 'share and make searchable'})
						</button>
					)}
				</p>}
			</TeamEditor>
			{!!(info && (info.resources.length || info.url)) && (
				<details class="details" open>
					<summary><strong>Teambuilding resources for {formatName}</strong></summary>
					<div style="margin-left:5px"><ul>
						{info.resources.map(resource => (
							<li><p><a href={resource.url} target="_blank">{resource.resource_name}</a></p></li>
						))}
					</ul>
					<p>
						Find {info.resources.length ? 'more ' : ''}
						helpful resources for {formatName} on <a href={info.url} target="_blank">the Smogon Dex</a>.
					</p></div>
				</details>
			)}
		</div></PSPanelWrapper>;
	}
}

PS.addRoomType(TeamPanel);
