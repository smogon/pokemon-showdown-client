/**
 * Team Selector Panel
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
			let id = toID(set.species);
			buf += '|' + (toID(set.name || set.species) === id ? '' : id);

			// item
			buf += '|' + toID(set.item);

			// ability
			let template = Dex.getTemplate(set.species || set.name);
			let abilities = template.abilities;
			id = toID(set.ability);
			if (abilities) {
				if (id === toID(abilities['0'])) {
					buf += '|';
				} else if (id === toID(abilities['1'])) {
					buf += '|1';
				} else if (id === toID(abilities['H'])) {
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
					let moveid = toID(set.moves[j]);
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

			if (set.pokeball || (set.hpType && toID(set.hpType) !== hasHP)) {
				buf += ',' + (set.hpType || '');
				buf += ',' + toID(set.pokeball);
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
	/**
	 * (Exports end with two spaces so linebreaks are preserved in Markdown;
	 * I assume mostly for Reddit.)
	 */
	static exportSet(set: PokemonSet) {
		let text = '';

		// core
		if (set.name && set.name !== set.species) {
			text += `${set.name} (${set.species})`;
		} else {
			text += `${set.species}`;
		}
		if (set.gender === 'M') text += ` (M)`;
		if (set.gender === 'F') text += ` (F)`;
		if (set.item) {
			text += ` @ ${set.item}`;
		}
		text += `  \n`;
		if (set.ability) {
			text += `Ability: ${set.ability}  \n`;
		}
		if (set.moves) {
			for (let move of set.moves) {
				if (move.substr(0, 13) === 'Hidden Power ') {
					const hpType = move.slice(13);
					move = move.slice(0, 13);
					move = `${move}[${hpType}]`;
				}
				if (move) {
					text += `- ${move}  \n`;
				}
			}
		}

		// stats
		let first = true;
		if (set.evs) {
			for (const stat of Dex.statNames) {
				if (!set.evs[stat]) continue;
				if (first) {
					text += `EVs: `;
					first = false;
				} else {
					text += ` / `;
				}
				text += `${set.evs[stat]} ${BattleStatNames[stat]}`;
			}
		}
		if (!first) {
			text += `  \n`;
		}
		if (set.nature) {
			text += `${set.nature} Nature  \n`;
		}
		first = true;
		if (set.ivs) {
			for (const stat of Dex.statNames) {
				if (set.ivs[stat] === undefined || isNaN(set.ivs[stat]) || set.ivs[stat] === 31) continue;
				if (first) {
					text += `IVs: `;
					first = false;
				} else {
					text += ` / `;
				}
				text += `${set.ivs[stat]} ${BattleStatNames[stat]}`;
			}
		}
		if (!first) {
			text += `  \n`;
		}

		// details
		if (set.level && set.level !== 100) {
			text += `Level: ${set.level}  \n`;
		}
		if (set.shiny) {
			text += `Shiny: Yes  \n`;
		}
		if (typeof set.happiness === 'number' && set.happiness !== 255 && !isNaN(set.happiness)) {
			text += `Happiness: ${set.happiness}  \n`;
		}

		text += `\n`;
		return text;
	}
	static exportTeam(sets: PokemonSet[]) {
		let text = '';
		for (const set of sets) {
			// core
			text += PSTeambuilder.exportSet(set);
		}
		return text;
	}

	static packedTeamNames(buf: string) {
		if (!buf) return [];

		const team = [];
		let i = 0;

		while (true) {
			const name = buf.slice(i, buf.indexOf('|', i));
			i = buf.indexOf('|', i) + 1;

			team.push(buf.slice(i, buf.indexOf('|', i)) || name);

			for (let k = 0; k < 9; k++) {
				i = buf.indexOf('|', i) + 1;
			}

			i = buf.indexOf(']', i) + 1;

			if (i < 1) break;
		}

		return team;
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

function TeamBox(props: {team: Team | null, noLink?: boolean, button?: boolean}) {
	const team = props.team;
	let contents;
	if (team) {
		let icons = team.iconCache;
		if (!icons) {
			if (!team.packedTeam) {
				icons = <em>(empty team)</em>;
			} else {
				icons = PSTeambuilder.packedTeamNames(team.packedTeam).map(species =>
					<span class="picon" style={Dex.getPokemonIcon(species)}></span>
				);
			}
			team.iconCache = icons;
		}
		let format = team.format as string;
		if (format.startsWith('gen7')) format = format.slice(4);
		format = (format ? `[${format}] ` : ``) + (team.folder ? `${team.folder}/` : ``);
		contents = [
			<strong>{format && <span>{format}</span>}{team.name}</strong>,
			<small>{icons}</small>,
		];
	} else {
		contents = [
			<em>Select a team</em>,
		];
	}
	if (props.button) {
		return <button class="team" value={PS.teams.getKey(team)}>
			{contents}
		</button>;
	}
	return <div data-href={props.noLink ? '' : `/team-${PS.teams.getKey(team)}`} class="team" draggable>
		{contents}
	</div>;
}

/**
 * Team selector popup
 */

class TeamDropdownRoom extends PSRoom {
	readonly classType: string = 'user';
	userid: ID;
	name: string;
	isSelf: boolean;
	constructor(options: RoomOptions) {
		super(options);
		this.userid = this.id.slice(5) as ID;
		this.isSelf = (this.userid === PS.user.userid);
		this.name = options.username as string || this.userid;
		if (/[a-zA-Z0-9]/.test(this.name.charAt(0))) this.name = ' ' + this.name;
		PS.send(`|/cmd userdetails ${this.userid}`);
	}
}

class TeamDropdownPanel extends PSRoomPanel<TeamDropdownRoom> {
	gen = '';
	format: string | null = null;
	getTeams() {
		if (!this.format && !this.gen) return PS.teams.list;
		return PS.teams.list.filter(team => {
			if (this.gen && !team.format.startsWith(this.gen)) return false;
			if (this.format && team.format !== this.format) return false;
			return true;
		});
	}
	setFormat = (e: MouseEvent) => {
		const target = e.currentTarget as HTMLButtonElement;
		this.format = (target.name === 'format' && target.value) || '';
		this.gen = (target.name === 'gen' && target.value) || '';
		this.forceUpdate();
	};
	click = (e: MouseEvent) => {
		let curTarget = e.target as HTMLElement | null;
		let target;
		while (curTarget && curTarget !== e.currentTarget) {
			if (curTarget.tagName === 'BUTTON') {
				target = curTarget as HTMLButtonElement;
			}
			curTarget = curTarget.parentElement;
		}
		if (!target) return;

		(this.props.room.parentElem as HTMLButtonElement).value = target.value;
		PS.closePopup();
	};
	render() {
		const room = this.props.room;
		if (!room.parentElem) {
			return <PSPanelWrapper room={room}>
				<p>Error: You tried to open a team selector, but you have nothing to select a team for.</p>
			</PSPanelWrapper>;
		}
		const baseFormat = room.parentElem.getAttribute('data-format') || Dex.modid;
		if (this.format === null) {
			this.format = baseFormat;
		}
		let teams = this.getTeams();
		if (!teams.length && this.format) {
			this.gen = this.format.slice(0, 4);
			this.format = '';
		}
		teams = this.getTeams();
		if (!teams.length && this.gen) {
			this.gen = '';
		}
		teams = this.getTeams();

		let availableWidth = document.body.offsetWidth;
		let width = 307;
		if (availableWidth > 636) width = 613;
		if (availableWidth > 945) width = 919;

		let teamBuckets: {[folder: string]: Team[]} = {};
		for (const team of teams) {
			const list = teamBuckets[team.folder] || (teamBuckets[team.folder] = []);
			list.push(team);
		}

		let teamList = [];

		const baseGen = baseFormat.slice(0, 4);
		let genList: string[] = [];
		for (const team of PS.teams.list) {
			const gen = team.format.slice(0, 4);
			if (gen && !genList.includes(gen)) genList.push(gen);
		}
		const hasOtherGens = genList.length > 1 || genList[0] !== baseGen;

		teamList.push(<p>
			{baseFormat.length > 4 && <button class={'button' + (baseFormat === this.format ? ' disabled' : '')} onClick={this.setFormat} name="format" value={baseFormat}>
				<i class="fa fa-folder-o"></i> [{baseFormat.slice(0, 4)}] {baseFormat.slice(4)}
			</button>} <button class={'button' + (baseGen === this.format ? ' disabled' : '')} onClick={this.setFormat} name="format" value={baseGen}>
				<i class="fa fa-folder-o"></i> [{baseGen}] <em>(uncategorized)</em>
			</button> <button class={'button' + (baseGen === this.gen ? ' disabled' : '')} onClick={this.setFormat} name="gen" value={baseGen}>
				<i class="fa fa-folder-o"></i> [{baseGen}] <em>(all)</em>
			</button> {hasOtherGens && !this.gen && <button class="button" onClick={this.setFormat} name="gen" value={baseGen}>Other gens</button>}
		</p>);

		if (hasOtherGens && this.gen) {
			teamList.push(<h2>Other gens</h2>);
			teamList.push(<p>{genList.sort().map(gen => [
				<button class={'button' + (gen === this.gen ? ' disabled' : '')} onClick={this.setFormat} name="gen" value={gen}>
					<i class="fa fa-folder-o"></i> [{gen}] <em>(all)</em>
				</button>,
				" ",
			])}</p>);
		}

		for (let folder in teamBuckets) {
			if (folder && (this.gen || this.format)) {
				teamList.push(<h2>
					<i class="fa fa-folder-open"></i> {folder} + {}
					<i class="fa fa-folder-open-o"></i> {this.format || this.gen}
				</h2>);
			} else if (folder) {
				teamList.push(<h2>
					<i class="fa fa-folder-open"></i> {folder}
				</h2>);
			} else if (this.gen || this.format) {
				teamList.push(<h2>
					<i class="fa fa-folder-open-o"></i> {this.format || this.gen}
				</h2>);
			} else {
				teamList.push(<h2>
					<i class="fa fa-folder-open-o"></i> Teams not in any folders
				</h2>);
			}
			teamList.push(<ul class="teamdropdown" onClick={this.click}>
				{teamBuckets[folder].map(team => <li key={PS.teams.getKey(team)} style={"display:inline-block"}>
					<TeamBox team={team} button />
				</li>)}
			</ul>);
		}

		return <PSPanelWrapper room={room} width={width}>
			{teamList}
		</PSPanelWrapper>;
	}
}

PS.roomTypes['teamdropdown'] = {
	Model: TeamDropdownRoom,
	Component: TeamDropdownPanel,
};
