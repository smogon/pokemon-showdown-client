/**
 * Teambuilder Panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

class PSTeambuilder {
	static packTeam(team: PokemonSet[]) {
		let buf = '';
		if (!team) return '';

		for (const set of team) {
			let hasHP = '';
			if (buf) buf += ']';

			// name
			buf += set.name || set.species;

			// species
			let id = toId(set.species);
			buf += '|' + (toId(set.name || set.species) === id ? '' : id);

			// item
			buf += '|' + toId(set.item);

			// ability
			let template = Dex.getTemplate(set.species || set.name);
			let abilities = template.abilities;
			id = toId(set.ability);
			if (abilities) {
				if (id === toId(abilities['0'])) {
					buf += '|';
				} else if (id === toId(abilities['1'])) {
					buf += '|1';
				} else if (id === toId(abilities['H'])) {
					buf += '|H';
				} else {
					buf += '|' + id;
				}
			} else {
				buf += '|' + id;
			}

			// moves
			buf += '|';
			if (set.moves) {
				for (let j = 0; j < set.moves.length; j++) {
					let moveid = toId(set.moves[j]);
					if (j && !moveid) continue;
					buf += (j ? ',' : '') + moveid;
					if (moveid.substr(0, 11) === 'hiddenpower' && moveid.length > 11) {
						hasHP = moveid.slice(11);
					}
				}
			}

			// nature
			buf += '|' + (set.nature || '');

			// evs
			if (set.evs) {
				buf += '|' + (set.evs['hp'] || '') + ',' +
					(set.evs['atk'] || '') + ',' +
					(set.evs['def'] || '') + ',' +
					(set.evs['spa'] || '') + ',' +
					(set.evs['spd'] || '') + ',' +
					(set.evs['spe'] || '');
			} else {
				buf += '|';
			}

			// gender
			if (set.gender && set.gender !== template.gender) {
				buf += '|' + set.gender;
			} else {
				buf += '|';
			}

			// ivs
			if (set.ivs) {
				buf += '|' + (set.ivs['hp'] === 31 ? '' : set.ivs['hp']) + ',' +
					(set.ivs['atk'] === 31 ? '' : set.ivs['atk']) + ',' +
					(set.ivs['def'] === 31 ? '' : set.ivs['def']) + ',' +
					(set.ivs['spa'] === 31 ? '' : set.ivs['spa']) + ',' +
					(set.ivs['spd'] === 31 ? '' : set.ivs['spd']) + ',' +
					(set.ivs['spe'] === 31 ? '' : set.ivs['spe']);
			} else {
				buf += '|';
			}

			// shiny
			if (set.shiny) {
				buf += '|S';
			} else {
				buf += '|';
			}

			// level
			if (set.level) {
				buf += '|' + set.level;
			} else {
				buf += '|';
			}

			// happiness
			if (set.happiness !== undefined) {
				buf += '|' + set.happiness;
			} else {
				buf += '|';
			}

			if (set.pokeball || (set.hpType && toId(set.hpType) !== hasHP)) {
				buf += ',' + (set.hpType || '');
				buf += ',' + toId(set.pokeball);
			}
		}

		return buf;
	}

	static unpackTeam(buf: string) {
		if (!buf) return [];

		let team: PokemonSet[] = [];
		let i = 0;
		let j = 0;

		while (true) {
			let set: PokemonSet = {species: '', moves: []};
			team.push(set);

			// name
			j = buf.indexOf('|', i);
			set.name = buf.substring(i, j);
			i = j + 1;

			// species
			j = buf.indexOf('|', i);
			set.species = Dex.getTemplate(buf.substring(i, j)).species || set.name;
			i = j + 1;

			// item
			j = buf.indexOf('|', i);
			set.item = Dex.getItem(buf.substring(i, j)).name;
			i = j + 1;

			// ability
			j = buf.indexOf('|', i);
			let ability = Dex.getAbility(buf.substring(i, j)).name;
			let template = Dex.getTemplate(set.species);
			if (template.baseSpecies === 'Zygarde' && ability === 'H') ability = 'Power Construct';
			set.ability = ['', '0', '1', 'H', 'S'].includes(ability) ?
				template.abilities[ability as '0' || '0'] || (ability === '' ? '' : '!!!ERROR!!!') :
				ability;
			i = j + 1;

			// moves
			j = buf.indexOf('|', i);
			set.moves = buf.substring(i, j).split(',').map(moveid =>
				Dex.getMove(moveid).name
			);
			i = j + 1;

			// nature
			j = buf.indexOf('|', i);
			set.nature = buf.substring(i, j) as NatureName;
			if (set.nature as any === 'undefined') set.nature = undefined;
			i = j + 1;

			// evs
			j = buf.indexOf('|', i);
			if (j !== i) {
				let evstring = buf.substring(i, j);
				if (evstring.length > 5) {
					let evs = evstring.split(',');
					set.evs = {
						hp: Number(evs[0]) || 0,
						atk: Number(evs[1]) || 0,
						def: Number(evs[2]) || 0,
						spa: Number(evs[3]) || 0,
						spd: Number(evs[4]) || 0,
						spe: Number(evs[5]) || 0,
					};
				} else if (evstring === '0') {
					set.evs = {hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0};
				}
			}
			i = j + 1;

			// gender
			j = buf.indexOf('|', i);
			if (i !== j) set.gender = buf.substring(i, j);
			i = j + 1;

			// ivs
			j = buf.indexOf('|', i);
			if (j !== i) {
				let ivs = buf.substring(i, j).split(',');
				set.ivs = {
					hp: ivs[0] === '' ? 31 : Number(ivs[0]),
					atk: ivs[1] === '' ? 31 : Number(ivs[1]),
					def: ivs[2] === '' ? 31 : Number(ivs[2]),
					spa: ivs[3] === '' ? 31 : Number(ivs[3]),
					spd: ivs[4] === '' ? 31 : Number(ivs[4]),
					spe: ivs[5] === '' ? 31 : Number(ivs[5]),
				};
			}
			i = j + 1;

			// 1 + 'WARNING: /Users/zarel/Documents/psclient/src/panel-mainmenu.tsx:80:1 - Exceeds maximum line length of 140 WARNING: /Users/zarel/Documents/psclient/src/panel-mainmenu.tsx:80:1 - Exceeds maximum line length of 140 WARNING: /Users/zarel/Documents/psclient/src/panel-mainmenu.tsx:80:1 - Exceeds maximum line length of 140';
			// throw new Error('WARNING: /Users/zarel/Documents/psclient/src/panel-mainmenu.tsx:80:1 - Exceeds maximum line length of 140 WARNING: /Users/zarel/Documents/psclient/src/panel-mainmenu.tsx:80:1 - Exceeds maximum line length of 140 WARNING: /Users/zarel/Documents/psclient/src/panel-mainmenu.tsx:80:1 - Exceeds maximum line length of 140');

			// shiny
			j = buf.indexOf('|', i);
			if (i !== j) set.shiny = true;
			i = j + 1;

			// level
			j = buf.indexOf('|', i);
			if (i !== j) set.level = parseInt(buf.substring(i, j), 10);
			i = j + 1;

			// happiness
			j = buf.indexOf(']', i);
			let misc = undefined;
			if (j < 0) {
				if (i < buf.length) misc = buf.substring(i).split(',', 3);
			} else {
				if (i !== j) misc = buf.substring(i, j).split(',', 3);
			}
			if (misc) {
				set.happiness = (misc[0] ? Number(misc[0]) : undefined);
				set.hpType = misc[1];
				set.pokeball = misc[2];
			}
			if (j < 0) break;
			i = j + 1;
		}

		return team;
	}
	static exportTeam(sets: PokemonSet[]) {
		let text = '';
		for (const set of sets) {
			// core
			if (set.name && set.name !== set.species) {
				text += '' + set.name + ' (' + set.species + ')';
			} else {
				text += '' + set.species;
			}
			if (set.gender === 'M') text += ' (M)';
			if (set.gender === 'F') text += ' (F)';
			if (set.item) {
				text += ' @ ' + set.item;
			}
			text += "  \n";
			if (set.ability) {
				text += 'Ability: ' + set.ability + "  \n";
			}
			if (set.moves) {
				for (let move of set.moves) {
					if (move.substr(0, 13) === 'Hidden Power ') {
						move = move.substr(0, 13) + '[' + move.substr(13) + ']';
					}
					if (move) {
						text += '- ' + move + "  \n";
					}
				}
			}

			// stats
			let first = true;
			if (set.evs) {
				for (const stat of Dex.statNames) {
					if (!set.evs[stat]) continue;
					if (first) {
						text += 'EVs: ';
						first = false;
					} else {
						text += ' / ';
					}
					text += '' + set.evs[stat] + ' ' + BattleStatNames[stat];
				}
			}
			if (!first) {
				text += "  \n";
			}
			if (set.nature) {
				text += '' + set.nature + ' Nature' + "  \n";
			}
			first = true;
			if (set.ivs) {
				for (const stat of Dex.statNames) {
					if (set.ivs[stat] === undefined || isNaN(set.ivs[stat]) || set.ivs[stat] === 31) continue;
					if (first) {
						text += 'IVs: ';
						first = false;
					} else {
						text += ' / ';
					}
					text += '' + set.ivs[stat] + ' ' + BattleStatNames[stat];
				}
			}
			if (!first) {
				text += "  \n";
			}

			// details
			if (set.level && set.level !== 100) {
				text += 'Level: ' + set.level + "  \n";
			}
			if (set.shiny) {
				text += 'Shiny: Yes  \n';
			}
			if (typeof set.happiness === 'number' && set.happiness !== 255 && !isNaN(set.happiness)) {
				text += 'Happiness: ' + set.happiness + "  \n";
			}

			text += "\n";
		}
		return text;
	}
}

function TeamFolder(props: {cur?: boolean, value: string, children: preact.ComponentChildren}) {
	// folders are <div>s rather than <button>s because in theory it has
	// less weird interactions with HTML5 drag-and-drop
	if (props.cur) {
		return <div class="folder cur"><div class="folderhack3">
			<div class="folderhack1"></div><div class="folderhack2"></div>
			<div class="selectFolder" data-value={props.value}>{props.children}</div>
		</div></div>;
	}
	return <div class="folder">
		<div class="selectFolder" data-value={props.value}>{props.children}</div>
	</div>;
}

class TeambuilderPanel extends PSRoomPanel {
	curFolderKeep = '';
	curFolder = '';
	renderTeam(team: Team) {
		return <li>
			<div data-href={`/team-${PS.teams.getKey(team)}`} class="team" draggable>
				{team.name}
			</div>
		</li>;
	}
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

		let folderTable: {[folder: string]: 1 | undefined} = {};
		/**
		 * Folders, in a format where lexical sort will sort correctly.
		 */
		let folders = [];
		for (let i = -2; i < PS.teams.list.length; i++) {
			const team = i >= 0 ? PS.teams.list[i] : null;
			if (team) {
				let folder = team.folder;
				if (folder && !(`${folder}/` in folderTable)) {
					folders.push('Z' + folder);
					folderTable[folder + '/'] = 1;
					if (!('/' in folderTable)) {
						folders.push('Z~');
						folderTable['/'] = 1;
					}
				}
			}

			let format;
			if (i === -2) {
				format = this.curFolderKeep;
			} else if (i === -1) {
				format = this.curFolder;
			} else if (team) {
				format = team.format;
				if (!format) format = 'gen7';
			}
			if (!format) continue;
			if (format in folderTable) continue;
			folderTable[format] = 1;
			if (format.slice(-1) === '/') {
				folders.push('Z' + (format.slice(0, -1) || '~'));
				if (!('/' in folderTable)) {
					folders.push('Z~');
					folderTable['/'] = 1;
				}
				continue;
			}
			if (format === 'gen7') {
				folders.push('A~');
				continue;
			}
			switch (format.slice(0, 4)) {
			case 'gen1': format = 'G' + format.slice(4); break;
			case 'gen2': format = 'F' + format.slice(4); break;
			case 'gen3': format = 'E' + format.slice(4); break;
			case 'gen4': format = 'D' + format.slice(4); break;
			case 'gen5': format = 'C' + format.slice(4); break;
			case 'gen6': format = 'B' + format.slice(4); break;
			case 'gen7': format = 'A' + format.slice(4); break;
			default: format = 'X' + format; break;
			}
			folders.push(format);
		}
		folders.sort();

		let gen = '';
		let renderedFormatFolders = [
			<div class="foldersep"></div>,
			<TeamFolder cur={false} value="+">
				<i class="fa fa-plus"></i><em>(add format folder)</em>
			</TeamFolder>,
		];

		let renderedFolders = [];

		for (let format of folders) {
			let newGen = '';
			switch (format.charAt(0)) {
			case 'G': newGen = '1'; break;
			case 'F': newGen = '2'; break;
			case 'E': newGen = '3'; break;
			case 'D': newGen = '4'; break;
			case 'C': newGen = '5'; break;
			case 'B': newGen = '6'; break;
			case 'A': newGen = '7'; break;
			case 'X': newGen = 'X'; break;
			case 'Z': newGen = '/'; break;
			}
			if (gen !== newGen) {
				gen = newGen;
				if (gen === '/') {
					renderedFolders.push(...renderedFormatFolders);
					renderedFormatFolders = [];
					renderedFolders.push(<div class="foldersep"></div>);
					renderedFolders.push(<div class="folder"><h3>Folders</h3></div>);
				} else if (gen === 'X') {
					renderedFolders.push(<div class="folder"><h3>???</h3></div>);
				} else {
					renderedFolders.push(<div class="folder"><h3>Gen {gen}</h3></div>);
				}
			}
			let formatName;
			if (gen === '/') {
				formatName = format.slice(1);
				format = formatName + '/';
				if (formatName === '~') {
					formatName = '(uncategorized)';
					format = '/';
				} else {
					formatName = BattleLog.escapeHTML(formatName);
				}
				renderedFolders.push(<TeamFolder cur={this.curFolder === format} value={format}>
					<i class={'fa ' + (this.curFolder === format ? 'fa-folder-open' : 'fa-folder') + (format === '/' ? '-o' : '')}></i>
					{formatName}
				</TeamFolder>);
				continue;
			}
			formatName = format.slice(1);
			if (formatName === '~') formatName = '';
			format = 'gen' + newGen + formatName;
			if (format.length === 4) formatName = '(uncategorized)';
			renderedFolders.push(<TeamFolder cur={this.curFolder === format} value={format}>
				<i class={'fa ' + (this.curFolder === format ? 'fa-folder-open-o' : 'fa-folder-o')}></i>
				{formatName}
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
						<button class="button small" style="margin-left:5px" name="renameFolder"><i class="fa fa-pencil"></i> Rename</button> {}
						<button class="button small" style="margin-left:5px" name="promptDeleteFolder"><i class="fa fa-times"></i> Remove</button>
					</h2>
				: filterFolder === '' ?
					<h2><i class="fa fa-folder-open-o"></i> Teams not in any folders</h2>
				: filterFormat ?
					<h2><i class="fa fa-folder-open-o"></i> {filterFormat}</h2>
				:
					<h2>All Teams</h2>
				}
				<ul class="teamlist">
					{teams.map(team => this.renderTeam(team))}
				</ul>
			</div>
		</PSPanelWrapper>;
	}
}

class TeamPanel extends PSRoomPanel {
	sets: PokemonSet[] | null = null;
	backToList = () => {
		PS.removeRoom(this.props.room);
		PS.join('teambuilder' as RoomID);
	};
	render() {
		const room = this.props.room;
		const team = PS.teams.byKey[room.id.slice(5)];
		if (!team) {
			return <PSPanelWrapper room={room}>
				<button class="button" onClick={this.backToList}>
					<i class="fa fa-chevron-left"></i> List
				</button>
				<p class="error">
					Team doesn't exist
				</p>
			</PSPanelWrapper>;
		}

		const sets = this.sets || PSTeambuilder.unpackTeam(team!.packedTeam);
		if (!this.sets) this.sets = sets;
		return <PSPanelWrapper room={room} scrollable>
			<button class="button" onClick={this.backToList}>
				<i class="fa fa-chevron-left"></i> List
			</button>
			<h2>
				{team.name}
			</h2>
			<pre>{PSTeambuilder.exportTeam(sets)}</pre>
		</PSPanelWrapper>;
	}
}

PS.roomTypes['teambuilder'] = {
	Model: PSRoom,
	Component: TeambuilderPanel,
	title: "Teambuilder",
};
PS.roomTypes['team'] = {
	Model: PSRoom,
	Component: TeamPanel,
	title: "Team",
};
PS.updateRoomTypes();
