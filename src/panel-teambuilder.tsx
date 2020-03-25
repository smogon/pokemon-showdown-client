/**
 * Teambuilder panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

class TeambuilderPanel extends PSRoomPanel {
	readonly DEFAULT_FORMAT = 'gen8';

	curFolderKeep = '';
	/**
	 * - `""` - all
	 * - `"gen[NUMBER][ID]"` - format folder
	 * - `"gen[NUMBER]"` - uncategorized gen folder
	 * - `"[ID]/"` - folder
	 * - `"/"` - not in folder
	 */
	curFolder = '';
	selectFolder = (e: MouseEvent) => {
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
		this.curFolderKeep = folder;
		this.curFolder = folder;
		e.preventDefault();
		e.stopImmediatePropagation();
		this.forceUpdate();
	};
	renderFolderList() {
		// The folder list isn't actually saved anywhere:
		// it's regenerated anew from the team list every time.

		// (This is why folders you create will automatically disappear
		// if you leave them without adding anything to them.)

		const folderTable: {[folder: string]: 1 | undefined} = {'': 1};
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

			const format = team.format || this.DEFAULT_FORMAT;
			if (!(format in folderTable)) {
				folders.push(format);
				folderTable[format] = 1;
			}
		}
		if (!(this.curFolderKeep in folderTable)) {
			folderTable[this.curFolderKeep] = 1;
			folders.push(this.curFolderKeep);
		}
		if (!(this.curFolder in folderTable)) {
			folderTable[this.curFolder] = 1;
			folders.push(this.curFolder);
		}

		PSUtils.sortBy(folders, folder => [
			folder.endsWith('/') ? 10 : -parseInt(folder.charAt(3), 10),
			folder,
		]);

		let renderedFormatFolders = [
			<div class="foldersep"></div>,
			<TeamFolder cur={false} value="+">
				<i class="fa fa-plus"></i><em>(add format folder)</em>
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
			const folderOpenIcon = this.curFolder === format ? 'fa-folder-open' : 'fa-folder';
			if (gen === 0) {
				renderedFolders.push(<TeamFolder cur={this.curFolder === format} value={format}>
					<i class={
						`fa ${folderOpenIcon}${format === '/' ? '-o' : ''}`
					}></i>
					{format.slice(0, -1) || '(uncategorized)'}
				</TeamFolder>);
				continue;
			}

			renderedFolders.push(<TeamFolder cur={this.curFolder === format} value={format}>
				<i class={`fa ${folderOpenIcon}-o`}></i>
				{format.slice(4) || '(uncategorized)'}
			</TeamFolder>);
		}
		renderedFolders.push(...renderedFormatFolders);

		return <div class="folderlist" onClick={this.selectFolder}>
			<div class="folderlistbefore"></div>

			<TeamFolder cur={!this.curFolder} value="">
				<em>(all)</em>
			</TeamFolder>
			{renderedFolders}
			<div class="foldersep"></div>
			<TeamFolder cur={false} value="++">
				<i class="fa fa-plus"></i><em>(add folder)</em>
			</TeamFolder>

			<div class="folderlistafter"></div>
		</div>;
	}
	render() {
		const room = this.props.room;
		let teams = PS.teams.list;

		let filterFolder: string | null = null;
		let filterFormat: string | null = null;
		if (this.curFolder) {
			if (this.curFolder.slice(-1) === '/') {
				filterFolder = this.curFolder.slice(0, -1);
				teams = teams.filter(team => team.folder === filterFolder);
			} else {
				filterFormat = this.curFolder;
				teams = teams.filter(team => team.format === filterFormat);
			}
		}

		return <PSPanelWrapper room={room}>
			<div class="folderpane">
				{this.renderFolderList()}
			</div>
			<div class="teampane">
				{filterFolder ?
					<h2>
						<i class="fa fa-folder-open"></i> {filterFolder} {}
						<button class="button small" style="margin-left:5px" name="renameFolder">
							<i class="fa fa-pencil"></i> Rename
						</button> {}
						<button class="button small" style="margin-left:5px" name="promptDeleteFolder">
							<i class="fa fa-times"></i> Remove
						</button>
					</h2>
				: filterFolder === '' ?
					<h2><i class="fa fa-folder-open-o"></i> Teams not in any folders</h2>
				: filterFormat ?
					<h2><i class="fa fa-folder-open-o"></i> {filterFormat}</h2>
				:
					<h2>All Teams</h2>
				}
				<ul class="teamlist">
					{teams.map(team => <li key={PS.teams.getKey(team)}>
						<TeamBox team={team} />
					</li>)}
				</ul>
			</div>
		</PSPanelWrapper>;
	}
}

PS.roomTypes['teambuilder'] = {
	Component: TeambuilderPanel,
	title: "Teambuilder",
};
