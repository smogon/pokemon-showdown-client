/**
 * Teambuilder panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

import { PS, PSRoom, type Team } from "./client-main";
import { PSPanelWrapper, PSRoomPanel } from "./panels";
import { TeamBox, TeamFolder } from "./panel-teamdropdown";
import { PSUtils, type ID } from "./battle-dex";

class TeambuilderRoom extends PSRoom {
	readonly DEFAULT_FORMAT = 'gen8' as ID;

	/**
	 * - `""` - all
	 * - `"gen[NUMBER][ID]"` - format folder
	 * - `"gen[NUMBER]"` - uncategorized gen folder
	 * - `"[ID]/"` - folder
	 * - `"/"` - not in folder
	 */
	curFolder = '';
	curFolderKeep = '';

	override clientCommands = this.parseClientCommands({
		'newteam'(target) {
			if (target === 'bottom') {
				PS.teams.push(this.createTeam());
			} else {
				PS.teams.unshift(this.createTeam());
			}
			this.update(null);
		},
		'deleteteam'(target) {
			const team = PS.teams.byKey[target];
			if (team) PS.teams.delete(team);
			this.update(null);
		},
		'undeleteteam'() {
			PS.teams.undelete();
			this.update(null);
		},
	});
	override sendDirect(msg: string): void {
		PS.alert(`Unrecognized command: ${msg}`);
	}

	createTeam(copyFrom?: Team): Team {
		if (copyFrom) {
			return {
				name: `Copy of ${copyFrom.name}`,
				format: copyFrom.format,
				folder: copyFrom.folder,
				packedTeam: copyFrom.packedTeam,
				iconCache: null,
				key: '',
			};
		} else {
			const format = this.curFolder && !this.curFolder.endsWith('/') ? this.curFolder as ID : this.DEFAULT_FORMAT;
			const folder = this.curFolder.endsWith('/') ? this.curFolder.slice(0, -1) : '';
			return {
				name: `Untitled ${PS.teams.list.length + 1}`,
				format,
				folder,
				packedTeam: '',
				iconCache: null,
				key: '',
			};
		}
	}
}

class TeambuilderPanel extends PSRoomPanel<TeambuilderRoom> {
	static readonly id = 'teambuilder';
	static readonly routes = ['teambuilder'];
	static readonly Model = TeambuilderRoom;
	static readonly icon = <i class="fa fa-pencil-square-o" aria-hidden></i>;
	static readonly title = 'Teambuilder';
	selectFolder = (e: MouseEvent) => {
		const room = this.props.room;
		let elem = e.target as HTMLElement | null;
		let folder: string | null = null;
		while (elem) {
			if (elem.className === 'selectFolder') {
				folder = elem.getAttribute('data-value') || '';
				break;
			} else if (elem.className === 'folderlist') {
				return;
			}
			elem = elem.parentElement;
		}
		if (folder === null) return;
		room.curFolderKeep = folder;
		room.curFolder = folder;
		e.preventDefault();
		e.stopImmediatePropagation();
		this.forceUpdate();
	};
	renderFolderList() {
		const room = this.props.room;
		// The folder list isn't actually saved anywhere:
		// it's regenerated anew from the team list every time.

		// (This is why folders you create will automatically disappear
		// if you leave them without adding anything to them.)

		const folderTable: { [folder: string]: 1 | undefined } = { '': 1 };
		const folders: string[] = [];
		for (const team of PS.teams.list) {
			const folder = team.folder;
			if (folder && !(`${folder}/` in folderTable)) {
				folders.push(`${folder}/`);
				folderTable[`${folder}/`] = 1;
				if (!('/' in folderTable)) {
					folders.push('/');
					folderTable['/'] = 1;
				}
			}

			const format = team.format || room.DEFAULT_FORMAT;
			if (!(format in folderTable)) {
				folders.push(format);
				folderTable[format] = 1;
			}
		}
		if (!(room.curFolderKeep in folderTable)) {
			folderTable[room.curFolderKeep] = 1;
			folders.push(room.curFolderKeep);
		}
		if (!(room.curFolder in folderTable)) {
			folderTable[room.curFolder] = 1;
			folders.push(room.curFolder);
		}

		PSUtils.sortBy(folders, folder => [
			folder.endsWith('/') ? 10 : -parseInt(folder.charAt(3), 10),
			folder,
		]);

		let renderedFormatFolders = [
			<div class="foldersep"></div>,
			<TeamFolder cur={false} value="+">
				<i class="fa fa-plus" aria-hidden></i><em>(add format folder)</em>
			</TeamFolder>,
		];

		let renderedFolders: preact.ComponentChild[] = [];

		let gen = -1;
		for (let format of folders) {
			const newGen = format.endsWith('/') ? 0 : parseInt(format.charAt(3), 10);
			if (gen !== newGen) {
				gen = newGen;
				if (gen === 0) {
					renderedFolders.push(...renderedFormatFolders);
					renderedFormatFolders = [];
					renderedFolders.push(<div class="foldersep"></div>);
					renderedFolders.push(<div class="folder"><h3>Folders</h3></div>);
				} else {
					renderedFolders.push(<div class="folder"><h3>Gen {gen}</h3></div>);
				}
			}
			const folderOpenIcon = room.curFolder === format ? 'fa-folder-open' : 'fa-folder';
			if (gen === 0) {
				renderedFolders.push(<TeamFolder cur={room.curFolder === format} value={format}>
					<i
						class={`fa ${folderOpenIcon}${format === '/' ? '-o' : ''}`}
					></i>
					{format.slice(0, -1) || '(uncategorized)'}
				</TeamFolder>);
				continue;
			}

			renderedFolders.push(<TeamFolder cur={room.curFolder === format} value={format}>
				<i class={`fa ${folderOpenIcon}-o`}></i>
				{format.slice(4) || '(uncategorized)'}
			</TeamFolder>);
		}
		renderedFolders.push(...renderedFormatFolders);

		return <div class="folderlist" onClick={this.selectFolder}>
			<div class="folderlistbefore"></div>

			<TeamFolder cur={!room.curFolder} value="">
				<em>(all)</em>
			</TeamFolder>
			{renderedFolders}
			<div class="foldersep"></div>
			<TeamFolder cur={false} value="++">
				<i class="fa fa-plus" aria-hidden></i><em>(add folder)</em>
			</TeamFolder>

			<div class="folderlistafter"></div>
		</div>;
	}

	override render() {
		const room = this.props.room;
		let teams: (Team | null)[] = PS.teams.list.slice();

		if (PS.teams.deletedTeams.length) {
			const undeleteIndex = PS.teams.deletedTeams[PS.teams.deletedTeams.length - 1][1];
			teams.splice(undeleteIndex, 0, null);
		}

		let filterFolder: string | null = null;
		let filterFormat: string | null = null;
		if (room.curFolder) {
			if (room.curFolder.endsWith('/')) {
				filterFolder = room.curFolder.slice(0, -1);
				teams = teams.filter(team => !team || team.folder === filterFolder);
			} else {
				filterFormat = room.curFolder;
				teams = teams.filter(team => !team || team.format === filterFormat);
			}
		}

		return <PSPanelWrapper room={room}>
			<div class="folderpane">
				{this.renderFolderList()}
			</div>
			<div class="teampane">
				{filterFolder ? (
					<h2>
						<i class="fa fa-folder-open" aria-hidden></i> {filterFolder} {}
						<button class="button small" style="margin-left:5px" name="renameFolder">
							<i class="fa fa-pencil" aria-hidden></i> Rename
						</button> {}
						<button class="button small" style="margin-left:5px" name="promptDeleteFolder">
							<i class="fa fa-times" aria-hidden></i> Remove
						</button>
					</h2>
				) : filterFolder === '' ? (
					<h2><i class="fa fa-folder-open-o" aria-hidden></i> Teams not in any folders</h2>
				) : filterFormat ? (
					<h2><i class="fa fa-folder-open-o" aria-hidden></i> {filterFormat} <small>({teams.length})</small></h2>
				) : (
					<h2>All Teams <small>({teams.length})</small></h2>
				)}
				<p>
					<button data-cmd="/newteam" class="button big"><i class="fa fa-plus-circle" aria-hidden></i> New Team</button>
				</p>
				<ul class="teamlist">
					{teams.map(team => team ? (
						<li key={team.key}>
							<TeamBox team={team} /> {}
							<button data-cmd={`/deleteteam ${team.key}`}><i class="fa fa-trash" aria-hidden></i> Delete</button>
						</li>
					) : (
						<li key="undelete">
							<button data-cmd="/undeleteteam"><i class="fa fa-undo" aria-hidden></i> Undo delete</button>
						</li>
					))}
				</ul>
				<p>
					<button data-cmd="/newteam bottom" class="button"><i class="fa fa-plus-circle" aria-hidden></i> New Team</button>
				</p>
			</div>
		</PSPanelWrapper>;
	}
}

PS.addRoomType(TeambuilderPanel);
