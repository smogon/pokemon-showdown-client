/**
 * Teambuilder team panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

import { PS, PSRoom, type RoomOptions, type Team } from "./client-main";
import { PSPanelWrapper, PSRoomPanel } from "./panels";
import { toID, type ID } from "./battle-dex";
import { BattleLog } from "./battle-log";
import { TeamEditor } from "./battle-team-editor";
import { Net, PSLoginServer } from "./client-connection";
import { Teams } from "./battle-teams";
import { CopyableURLBox } from "./panel-chat";

class TeamRoom extends PSRoom {
	/** Doesn't _literally_ always exist, but does in basically all code
	 * and constantly checking for its existence is legitimately annoying... */
	team!: Team;
	forceReload = false;
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
		this.load();
	}
	setFormat(format: string) {
		const team = this.team;
		team.format = toID(format);
	}
	load() {
		PS.teams.loadTeam(this.team, true)?.then(() => {
			const team = this.team;
			if (team.uploadedPackedTeam && team.uploadedPackedTeam !== team.packedTeam) {
				if (this.stripNicknames(team.packedTeam) === team.uploadedPackedTeam) {
					// Team matches but nicknames were stripped; treat as unmodified
					team.uploadedPackedTeam = team.packedTeam;
				}
			}
			this.update(null);
		});
	}
	upload(isPrivate: boolean) {
		const team = this.team;
		const cmd = team.uploaded ? 'update' : 'save';
		// teamName, formatid, rawPrivacy, rawTeam
		const buf = [];
		if (team.uploaded) {
			buf.push(team.uploaded.teamid);
		} else if (team.teamid) {
			return PS.alert(`This team is for a different account. Please log into the correct account to update it.`);
		}
		buf.push(team.name, team.format, isPrivate ? 1 : 0);
		const exported = team.packedTeam;
		if (!exported) return PS.alert(`Add a Pokemon to your team before uploading it.`);
		buf.push(exported);
		PS.teams.uploading = team;
		PS.send(`/teams ${cmd} ${buf.join(', ')}`);
		team.uploadedPackedTeam = exported;
		this.update(null);
	}
	stripNicknames(packedTeam: string) {
		const team = Teams.unpack(packedTeam);
		for (const pokemon of team) {
			pokemon.name = '';
		}
		return Teams.pack(team);
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
		room.upload(room.team.uploaded ? !!room.team.uploaded.private : PS.prefs.uploadprivacy);
	};
	restore = (ev: Event) => {
		const room = this.props.room;
		const team = room.team;
		if (!team.uploadedPackedTeam) {
			// should never happen
			PS.alert(`Must use on an uploaded team.`);
			return;
		}
		team.packedTeam = team.uploadedPackedTeam;
		room.forceReload = true;
		room.save();
		this.forceUpdate();
	};
	compare = (ev: Event) => {
		const team = this.props.room.team;
		if (!team.uploadedPackedTeam) {
			// should never happen
			PS.alert(`Must use on an uploaded team.`);
			return;
		}
		const uploadedTeam = Teams.export(Teams.unpack(team.uploadedPackedTeam));
		const localTeam = Teams.export(Teams.unpack(team.packedTeam));
		PS.alert(BattleLog.html`|html|<table class="table" style="width:100%;font-size:14px"><tr><th>Local</th><th>Uploaded</th></tr><tr><td>${localTeam}</td><td>${uploadedTeam}</td></tr></table>`, { width: 720 });
		ev.preventDefault();
		ev.stopImmediatePropagation();
	};

	changePrivacyPref = (ev: Event) => {
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
		this.forceUpdate();
	};
	renderResources() {
		const { room } = this.props;
		const team = room.team;
		const info = TeamPanel.formatResources[team.format];
		const formatName = BattleLog.formatName(team.format);
		return (info && (info.resources.length || info.url)) ? (
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
		) : null;
	}
	override componentDidUpdate() {
		const room = this.props.room;
		room.load();
	}
	override render() {
		const { room } = this.props;
		const team = room.team;
		if (!team || room.forceReload) {
			if (room.forceReload) {
				room.forceReload = false;
				room.update(null);
			}
			return <PSPanelWrapper room={room}>
				<a class="button" href="teambuilder" data-target="replace">
					<i class="fa fa-chevron-left" aria-hidden></i> List
				</a>
				<p class="error">
					Team doesn't exist
				</p>
			</PSPanelWrapper>;
		}

		const unsaved = team.uploaded && team.uploadedPackedTeam ? team.uploadedPackedTeam !== team.packedTeam : false;
		return <PSPanelWrapper room={room} scrollable><div class="pad">
			<a class="button" href="teambuilder" data-target="replace">
				<i class="fa fa-chevron-left" aria-hidden></i> Teams
			</a> {}
			{team.uploaded ? (
				<>
					<button class={`button${unsaved ? ' button-first' : ''}`} data-href={`teamstorage-${team.key}`}>
						<i class="fa fa-globe"></i> Account {team.uploaded.private ? '' : "(public)"}
					</button>
					{unsaved && <button class="button button-last" onClick={this.uploadTeam}>
						<strong>Upload changes</strong>
					</button>}
				</>
			) : team.teamid ? (
				<button class="button" data-href={`teamstorage-${team.key}`}>
					<i class="fa fa-plug"></i> Disconnected (wrong account?)
				</button>
			) : (
				<button class="button" data-href={`teamstorage-${team.key}`}>
					<i class="fa fa-laptop"></i> Local
				</button>
			)}
			<div style="float:right"><button
				name="format" value={team.format} data-selecttype="teambuilder"
				class="button" data-href="/formatdropdown" onChange={this.handleChangeFormat}
			>
				<i class="fa fa-folder-o"></i> {BattleLog.formatName(team.format)} {}
				{team.format.length <= 4 && <em>(uncategorized)</em>} <i class="fa fa-caret-down"></i>
			</button></div>
			<label class="label teamname">
				Team name:{}
				<input
					class="textbox" type="text" value={team.name}
					onInput={this.handleRename} onChange={this.handleRename} onKeyUp={this.handleRename}
				/>
			</label>
			<TeamEditor
				team={team} onChange={this.save} readOnly={!!team.teamid && !team.uploadedPackedTeam} resources={this.renderResources()}
			>
				{!!(team.packedTeam && team.format.length > 4) && <p>
					<button data-cmd="/validate" class="button"><i class="fa fa-check"></i> Validate</button>
				</p>}
				{!!(team.packedTeam || team.uploaded) && <p class="infobox" style="padding: 5px 8px">
					{team.uploadedPackedTeam && !team.uploaded ? <>
						Uploading...
					</> : team.uploaded ? <>
						<small>Share URL:</small> {}
						<CopyableURLBox
							url={`https://psim.us/t/${team.uploaded.teamid}${team.uploaded.private ? '-' + team.uploaded.private : ''}`}
						/> {}
						{unsaved && <div style="padding-top:5px">
							<button class="button" onClick={this.uploadTeam}>
								<i class="fa fa-upload"></i> <strong>Upload changes</strong>
							</button> {}
							<button class="button" onClick={this.restore}>
								Revert to uploaded version
							</button> {}
							<button class="button" onClick={this.compare}>
								Compare
							</button>
						</div>}
					</> : !team.teamid ? <>
						<label class="checkbox inline">
							<input
								name="teamprivacy" checked={!PS.prefs.uploadprivacy}
								type="checkbox" onChange={this.changePrivacyPref}
							/> Public
						</label>
						<button class="button exportbutton" onClick={this.uploadTeam}>
							<i class="fa fa-upload"></i> Upload for
							{PS.prefs.uploadprivacy ? ' shareable URL' : ' shareable/searchable URL'}
						</button>
					</> : <>
						This is a disconnected team. This could be because you uploaded it
						on a different account, or because you deleted or un-uploaded it on
						a different computer. For safety, you can't edit this team. You can,
						however, delete it, or make a copy (which will be editable).
					</>}
				</p>}
			</TeamEditor>
		</div></PSPanelWrapper>;
	}
}

class ViewTeamPanel extends PSRoomPanel {
	static readonly id = 'viewteam';
	static readonly routes = ['viewteam-*'];
	static readonly Model = TeamRoom;
	static readonly title = 'Loading...';
	team: Team | null | undefined;
	teamData: {
		team: string, private: string | null, ownerid: ID, format: ID, title: string, views: number,
	} | null = null;
	override componentDidMount(): void {
		super.componentDidMount();
		const roomid = this.props.room.id;
		const [teamid, password] = roomid.slice(9).split('-');
		PSLoginServer.query('getteam', {
			teamid,
			password,
			full: true,
		}).then(untypedData => {
			const data = untypedData as ViewTeamPanel['teamData'];
			if (!data) {
				this.team = null;
				return;
			}
			this.team = {
				name: data.title,
				format: data.format,
				folder: '',
				packedTeam: data.team,
				iconCache: null,
				key: '',
				isBox: false,
				teamid: parseInt(teamid),
			};
			for (const localTeam of PS.teams.list) {
				if (localTeam.teamid === this.team.teamid) {
					this.team.key = localTeam.key;
					break;
				}
			}
			this.props.room.title = `[Team] ${this.team.name || 'Untitled team'}`;
			this.teamData = data;
			PS.update();
		});
	}

	override render() {
		const { room } = this.props;
		const team = this.team;
		const teamData = this.teamData!;
		if (!team) {
			return <PSPanelWrapper room={room}>
				{team === null ? <p class="error">
					Team doesn't exist
				</p> : <p>
					Loading...
				</p>}
			</PSPanelWrapper>;
		}

		return <PSPanelWrapper room={room} scrollable><div class="pad">
			<h1>{team.name || "Untitled team"}</h1>
			<CopyableURLBox
				url={`https://psim.us/t/${team.teamid!}${teamData.private ? '-' + teamData.private : ''}`}
			/> {}
			<p>Uploaded by: <strong>{teamData.ownerid}</strong></p>
			<p>Format: <strong>{teamData.format}</strong></p>
			<p>Views: <strong>{teamData.views}</strong></p>
			{team.key && <p><a class="button" href={`team-${team.key}`}>Edit</a></p>}
			<TeamEditor team={team} readOnly></TeamEditor>
		</div></PSPanelWrapper>;
	}
}

type TeamStorage = 'account' | 'public' | 'disconnected' | 'local';
class TeamStoragePanel extends PSRoomPanel {
	static readonly id = "teamstorage";
	static readonly routes = ["teamstorage-*"];
	static readonly location = "semimodal-popup";
	static readonly noURL = true;

	chooseOption = (ev: MouseEvent) => {
		const storage = (ev.currentTarget as HTMLButtonElement).value as TeamStorage;
		const room = this.props.room;
		const team = this.team();

		if (storage === 'local' && team.uploaded) {
			PS.send(`/teams delete ${team.uploaded.teamid}`);
			team.uploaded = undefined;
			team.teamid = undefined;
			team.uploadedPackedTeam = undefined;
			PS.teams.save();
			(room.getParent() as TeamRoom).update(null);
		} else if (storage === 'public' && team.uploaded?.private) {
			PS.send(`/teams setprivacy ${team.uploaded.teamid},no`);
		} else if (storage === 'account' && team.uploaded?.private === null) {
			PS.send(`/teams setprivacy ${team.uploaded.teamid},yes`);
		} else if (storage === 'public' && !team.teamid) {
			(room.getParent() as TeamRoom).upload(false);
		} else if (storage === 'account' && !team.teamid) {
			(room.getParent() as TeamRoom).upload(true);
		}
		ev.stopImmediatePropagation();
		ev.preventDefault();
		this.close();
	};
	team() {
		const teamKey = this.props.room.id.slice(12);
		const team = PS.teams.byKey[teamKey]!;
		return team;
	}

	override render() {
		const room = this.props.room;

		const team = this.team();
		const storage: TeamStorage = team.uploaded?.private ? (
			'account'
		) : team.uploaded ? (
			'public'
		) : team.teamid ? (
			'disconnected'
		) : (
			'local'
		);

		if (storage === 'disconnected') {
			return <PSPanelWrapper room={room} width={280}><div class="pad">
				<div><button class="option cur" data-cmd="/close">
					<i class="fa fa-plug"></i> <strong>Disconnected</strong><br />
					Not found in the Teams database. Maybe you uploaded it on a different account?
				</button></div>
			</div></PSPanelWrapper>;
		}
		return <PSPanelWrapper room={room} width={280}><div class="pad">
			<div><button class={`option${storage === 'local' ? ' cur' : ''}`} onClick={this.chooseOption} value="local">
				<i class="fa fa-laptop"></i> <strong>Local</strong><br />
				Stored in cookies on your computer. Warning: Your browser might delete these. Make sure to use backups.
			</button></div>
			<div><button class={`option${storage === 'account' ? ' cur' : ''}`} onClick={this.chooseOption} value="account">
				<i class="fa fa-cloud"></i> <strong>Account</strong><br />
				Uploaded to the Teams database. You can share with the URL.
			</button></div>
			<div><button class={`option${storage === 'public' ? ' cur' : ''}`} onClick={this.chooseOption} value="public">
				<i class="fa fa-globe"></i> <strong>Account (public)</strong><br />
				Uploaded to the Teams database publicly. Share with the URL or people can find it by searching.
			</button></div>
		</div></PSPanelWrapper>;
	}
}

PS.addRoomType(TeamPanel, TeamStoragePanel, ViewTeamPanel);
