/**
 * Team Selector Panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

import { PS, type Team } from "./client-main";
import { PSIcon, PSPanelWrapper, PSRoomPanel } from "./panels";
import { Dex, toID, type ID } from "./battle-dex";
import { Teams } from "./battle-teams";

export class PSTeambuilder {
	static exportPackedTeam(team: Team, newFormat?: boolean) {
		const sets = Teams.unpack(team.packedTeam);
		const dex = Dex.forFormat(team.format);
		return Teams.export(sets, dex, newFormat);
	}
	static splitPrefix(buffer: string, delimiter: string, prefixOffset = 0): [string, string] {
		const delimIndex = buffer.indexOf(delimiter);
		if (delimIndex < 0) return ['', buffer];
		return [buffer.slice(prefixOffset, delimIndex), buffer.slice(delimIndex + delimiter.length)];
	}
	static splitLast(buffer: string, delimiter: string): [string, string] {
		const delimIndex = buffer.lastIndexOf(delimiter);
		if (delimIndex < 0) return [buffer, ''];
		return [buffer.slice(0, delimIndex), buffer.slice(delimIndex + delimiter.length)];
	}
	static importTeamBackup(buffer: string): Team[] {
		const teams: Team[] = [];
		const lines = buffer.split("\n");

		let curTeam: Team | null = null;
		let sets: Dex.PokemonSet[] | null = null;

		let curSet: Dex.PokemonSet | null = null;

		while (lines.length && !lines[0]) lines.shift();
		while (lines.length && !lines[lines.length - 1]) lines.pop();

		for (let line of lines) {
			line = line.trim();
			if (line === '' || line === '---') {
				curSet = null;
			} else if (line.startsWith('===')) {
				if (curTeam) {
					// not the first team, store the previous team
					curTeam.packedTeam = Teams.pack(sets);
					teams.push(curTeam);
				}

				curTeam = {
					name: '',
					format: '' as ID,
					packedTeam: '',
					folder: '',
					key: '',
					iconCache: '',
					isBox: false,
				};
				sets = [];

				line = line.slice(3, -3).trim();
				[curTeam.format, line] = this.splitPrefix(line, ']', 1) as [ID, string];
				if (!curTeam.format) {
					curTeam.format = 'gen8' as ID;
				} else if (curTeam.format.endsWith('-box')) {
					curTeam.format = curTeam.format.slice(0, -4) as ID;
					curTeam.isBox = true;
				}
				if (curTeam.format.startsWith('[')) curTeam.format = curTeam.format.slice(1) as ID;
				if (!curTeam.format.startsWith('gen')) curTeam.format = `gen6${curTeam.format}` as ID;

				line = line.trim();
				[curTeam.folder, curTeam.name] = this.splitPrefix(line, '/');
			} else if (line.includes('|')) {
				if (curTeam) {
					// not the first team, store the previous team
					curTeam.packedTeam = Teams.pack(sets);
					teams.push(curTeam);
				}
				curTeam = null;
				curSet = null;
				const team = PS.teams.unpackLine(line);
				if (team) teams.push(team);
			} else if (!curSet) {
				if (!sets) continue; // corruption
				curSet = {
					name: '', species: '', gender: '',
					moves: [],
				};
				sets.push(curSet);
				Teams.parseExportedTeamLine(line, true, curSet);
			} else {
				Teams.parseExportedTeamLine(line, false, curSet);
			}
		}
		if (curTeam) {
			curTeam.packedTeam = Teams.pack(sets);
			teams.push(curTeam);
		}
		return teams;
	}

	static draggedTeam: Team | null = null;
	static dragStart(ev: DragEvent) {
		const href = (ev.currentTarget as HTMLAnchorElement)?.getAttribute('href');
		const team = href ? PS.teams.byKey[href.slice(5)] : null;
		if (!team) return;

		const dataTransfer = ev.dataTransfer;
		if (dataTransfer) {
			dataTransfer.effectAllowed = 'copyMove';
			dataTransfer.setData("text/plain", "[Team] " + team.name);
			let filename = team.name;
			if (team.format) filename = '[' + team.format + '] ' + filename;
			filename = $.trim(filename).replace(/[\\/]+/g, '') + '.txt';
			const urlprefix = "data:text/plain;base64,";
			const contents = PSTeambuilder.exportPackedTeam(team).replace(/\n/g, '\r\n');
			const downloadurl = "text/plain:" + filename + ":" + urlprefix + encodeURIComponent(window.btoa(unescape(encodeURIComponent(contents))));
			console.log(downloadurl);
			dataTransfer.setData("DownloadURL", downloadurl);
		}

		PS.dragging = { type: 'team', team, folder: null };
		// app.draggingRoom = this.id;
		// app.draggingLoc = parseInt(e.currentTarget.dataset.value, 10);
		// var elOffset = $(e.currentTarget).offset();
		// app.draggingOffsetX = e.originalEvent.pageX - elOffset.left;
		// app.draggingOffsetY = e.originalEvent.pageY - elOffset.top;
		// this.finalOffset = null;
		// setTimeout(function () {
		// 	$(e.currentTarget).parent().addClass('dragging');
		// }, 0);
	}
}

export function TeamBox(props: {
	team: Team | null,
	noLink?: boolean,
	button?: boolean,
	onClick?: () => void,
}) {
	const team = props.team;
	let contents;
	if (team) {
		team.iconCache ||= team.packedTeam ? (
			Teams.unpackSpeciesOnly(team.packedTeam).map(
				// can't use <PSIcon>, weird interaction with iconCache
				// don't try this at home; I'm a trained professional
				pokemon => PSIcon({ pokemon })
			)
		) : (
			<em>(empty {team.isBox ? 'box' : 'team'})</em>
		);
		let format = team.format as string;
		if (format.startsWith(Dex.modid)) format = format.slice(4);
		format = (format ? `[${format}] ` : ``) + (team.folder ? `${team.folder}/` : ``);
		contents = [
			<strong>{team.isBox && <i class="fa fa-archive"></i>} {format && <span>{format}</span>}{team.name}</strong>,
			<small>{team.iconCache}</small>,
		];
	} else {
		contents = [
			<em>Select a team</em>,
		];
	}
	const className = `team${team?.isBox ? ' pc-box' : ''}`;
	if (props.button) {
		return <button class={className} value={team ? team.key : ''}>
			{contents}
		</button>;
	}
	if (props.noLink) {
		return <div class={className}>
			{contents}
		</div>;
	}
	return <a
		href={`team-${team ? team.key : ''}`} class={className} draggable
		onDragStart={PSTeambuilder.dragStart} onClick={props.onClick}
	>
		{contents}
	</a>;
}

/**
 * Team selector popup
 */

class TeamDropdownPanel extends PSRoomPanel {
	static readonly id = 'teamdropdown';
	static readonly routes = ['teamdropdown'];
	static readonly location = 'semimodal-popup';
	static readonly noURL = true;
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
	setFormat = (ev: MouseEvent) => {
		const target = ev.currentTarget as HTMLButtonElement;
		this.format = (target.name === 'format' && target.value) || '';
		this.gen = (target.name === 'gen' && target.value) || '';
		ev.preventDefault();
		ev.stopImmediatePropagation();
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

		PS.teams.loadTeam(PS.teams.byKey[target.value], true);
		this.chooseParentValue(target.value);
	};
	override render() {
		const room = this.props.room;
		if (!room.parentElem) {
			return <PSPanelWrapper room={room}>
				<p>Error: You tried to open a team selector, but you have nothing to select a team for.</p>
			</PSPanelWrapper>;
		}
		const baseFormat = room.parentElem.getAttribute('data-format') || Dex.modid;
		let isFirstLoad = this.format === null;
		if (isFirstLoad) {
			this.format = baseFormat;
		}
		let teams = this.getTeams();
		if (!teams.length && this.format && isFirstLoad) {
			this.gen = this.format.slice(0, 4);
			this.format = '';
			teams = this.getTeams();
		}
		if (!teams.length && this.gen && isFirstLoad) {
			this.gen = '';
			teams = this.getTeams();
		}

		let availableWidth = document.body.offsetWidth;
		let width = 307;
		if (availableWidth > 636) width = 613;
		if (availableWidth > 945) width = 919;

		let teamBuckets: { [folder: string]: Team[] } = {};
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
			{baseFormat.length > 4 && (
				<button
					class={'button' + (baseFormat === this.format ? ' disabled' : '')}
					onClick={this.setFormat} name="format" value={baseFormat}
				>
					<i class="fa fa-folder-o" aria-hidden></i> [{baseFormat.slice(0, 4)}] {baseFormat.slice(4)}
				</button>
			)} {}
			<button
				class={'button' + (baseGen === this.format ? ' disabled' : '')} onClick={this.setFormat} name="format" value={baseGen}
			>
				<i class="fa fa-folder-o" aria-hidden></i> [{baseGen}] <em>(uncategorized)</em>
			</button> {}
			<button
				class={'button' + (baseGen === this.gen ? ' disabled' : '')} onClick={this.setFormat} name="gen" value={baseGen}
			>
				<i class="fa fa-folder-o" aria-hidden></i> [{baseGen}] <em>(all)</em>
			</button> {}
			{hasOtherGens && !this.gen && (
				<button class="button" onClick={this.setFormat} name="gen" value={baseGen}>Other gens</button>
			)}
		</p>);

		if (hasOtherGens && this.gen) {
			teamList.push(<h2>Other gens</h2>);
			teamList.push(<p>{genList.sort().map(gen => [
				<button class={'button' + (gen === this.gen ? ' disabled' : '')} onClick={this.setFormat} name="gen" value={gen}>
					<i class="fa fa-folder-o" aria-hidden></i> [{gen}] <em>(all)</em>
				</button>,
				" ",
			])}</p>);
		}

		let isEmpty = true;
		for (let folder in teamBuckets) {
			if (folder && (this.gen || this.format)) {
				teamList.push(<h2>
					<i class="fa fa-folder-open" aria-hidden></i> {folder} + {}
					<i class="fa fa-folder-open-o" aria-hidden></i> {this.format || this.gen}
				</h2>);
			} else if (folder) {
				teamList.push(<h2>
					<i class="fa fa-folder-open" aria-hidden></i> {folder}
				</h2>);
			} else if (this.gen || this.format) {
				teamList.push(<h2>
					<i class="fa fa-folder-open-o" aria-hidden></i> {this.format || this.gen}
				</h2>);
			} else {
				teamList.push(<h2>
					<i class="fa fa-folder-open-o" aria-hidden></i> Teams not in any folders
				</h2>);
			}
			teamList.push(<ul class="teamdropdown" onClick={this.click}>
				{teamBuckets[folder].map(team => <li key={team.key} style={{ display: 'inline-block' }}>
					<TeamBox team={team} button />
				</li>)}
			</ul>);
			isEmpty = false;
		}

		return <PSPanelWrapper room={room} width={width}><div class="pad">
			{teamList}
			{isEmpty && <p><em>No teams found</em></p>}
		</div></PSPanelWrapper>;
	}
}

export interface FormatData {
	id: ID;
	name: string;
	team?: 'preset' | null;
	section: string;
	column: number;
	searchShow?: boolean;
	challengeShow?: boolean;
	tournamentShow?: boolean;
	rated: boolean;
	teambuilderLevel?: number | null;
	teambuilderFormat?: ID;
	battleFormat?: string;
	isTeambuilderFormat: boolean;
	effectType: 'Format';
}

declare const BattleFormats: { [id: string]: FormatData };

export type SelectType = 'teambuilder' | 'challenge' | 'search' | 'tournament';
class FormatDropdownPanel extends PSRoomPanel {
	static readonly id = 'formatdropdown';
	static readonly routes = ['formatdropdown'];
	static readonly location = 'semimodal-popup';
	static readonly noURL = true;
	gen = '' as ID;
	format: string | null = null;
	search = '';
	click = (e: MouseEvent) => {
		let curTarget = e.target as HTMLElement | null;
		let target;
		if (curTarget?.tagName === 'I') return;
		while (curTarget && curTarget !== e.currentTarget) {
			if (curTarget.tagName === 'BUTTON') {
				target = curTarget as HTMLButtonElement;
			}
			curTarget = curTarget.parentElement;
		}
		if (!target) return;

		this.chooseParentValue(target.value);
	};
	updateSearch = (ev: Event) => {
		this.search = (ev.currentTarget as HTMLInputElement).value;
		this.forceUpdate();
	};
	toggleGen = (ev: Event) => {
		const target = ev.currentTarget as HTMLButtonElement;
		this.gen = this.gen === target.value ? '' as ID : target.value as ID;
		this.forceUpdate();
	};
	override render() {
		const room = this.props.room;
		if (!room.parentElem) {
			return <PSPanelWrapper room={room}>
				<p>Error: You tried to open a format selector, but you have nothing to select a format for.</p>
			</PSPanelWrapper>;
		}

		let formatsLoaded = !!window.BattleFormats;
		if (formatsLoaded) {
			formatsLoaded = false;
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			for (let i in window.BattleFormats) {
				formatsLoaded = true;
				break;
			}
		}
		const curGen = (gen: string) => this.gen === gen ? ' cur' : '';
		const searchBar = <div style="margin-bottom: 0.5em">
			<input
				type="search" name="search" placeholder="Search formats" class="textbox autofocus" autocomplete="off"
				onInput={this.updateSearch} onChange={this.updateSearch}
			/> {}
			<button onClick={this.toggleGen} value="gen9" class={`button button-first${curGen('gen9')}`}>Gen 9</button>
			<button onClick={this.toggleGen} value="gen8" class={`button button-middle${curGen('gen8')}`}>8</button>
			<button onClick={this.toggleGen} value="gen7" class={`button button-middle${curGen('gen7')}`}>7</button>
			<button onClick={this.toggleGen} value="gen6" class={`button button-middle${curGen('gen6')}`}>6</button>
			<button onClick={this.toggleGen} value="gen5" class={`button button-middle${curGen('gen5')}`}>5</button>
			<button onClick={this.toggleGen} value="gen4" class={`button button-middle${curGen('gen4')}`}>4</button>
			<button onClick={this.toggleGen} value="gen3" class={`button button-middle${curGen('gen3')}`}>3</button>
			<button onClick={this.toggleGen} value="gen2" class={`button button-middle${curGen('gen2')}`}>2</button>
			<button onClick={this.toggleGen} value="gen1" class={`button button-last${curGen('gen1')}`}>1</button>
		</div>;
		if (!formatsLoaded) {
			return <PSPanelWrapper room={room}><div class="pad">
				{searchBar}
				<p>Loading...</p>
			</div></PSPanelWrapper>;
		}

		/**
		 * 'challenge' hides search-only formats, and 'search' hides challenge-only
		 * formats. 'teambuilder' shows teambuilder formats (removing parentheses
		 * from format names).
		 */
		const selectType: SelectType = (
			room.parentElem.getAttribute('data-selecttype') as any || 'challenge'
		);
		const curFormat = toID((room.parentElem as HTMLButtonElement).value);
		const formats = Object.values(BattleFormats).filter(format => {
			if (selectType === 'challenge' && format.challengeShow === false) return false;
			if (selectType === 'search' && format.searchShow === false) return false;
			if (selectType === 'tournament' && format.tournamentShow === false) return false;
			if (selectType === 'teambuilder' && format.team) return false;
			return true;
		});

		let curSection = '';
		let curColumnNum = 0;
		let curColumn: ({ id: ID, name: string, section: string } | { id: null, section: string })[] = [];
		const columns = [curColumn];
		const searchID = toID(this.search);
		for (const format of formats) {
			if (searchID && !toID(format.name).includes(searchID)) {
				continue;
			}
			if (this.gen && !format.id.startsWith(this.gen)) continue;

			if (format.column !== curColumnNum) {
				if (curColumn.length) {
					curColumn = [];
					columns.push(curColumn);
				}
				curColumnNum = format.column;
			}
			if (format.section !== curSection) {
				curSection = format.section;
				if (curSection) {
					curColumn.push({ id: null, section: curSection });
				}
			}
			curColumn.push(format);
		}
		if (this.gen && selectType === 'teambuilder') {
			columns[0].unshift({
				id: this.gen,
				name: `[Gen ${this.gen.slice(3)}]`,
				section: 'No Format',
			});
		}

		const width = Math.max(columns.length, 2.1) * 225 + 30;
		const noResults = curColumn.length === 0;
		const starredPrefs = PS.prefs.starredformats || {};
		// reverse because the newest starred format should be the default
		const starred = Object.keys(starredPrefs).filter(id => starredPrefs[id] === true).reverse();
		let starredDone = false;

		return <PSPanelWrapper room={room} width={width}><div class="pad">
			{searchBar}
			{columns.map(column => (
				<ul class="options" onClick={this.click}>
					{!starredDone && starred?.map((id, i) => {
						if (this.gen && !id.startsWith(this.gen)) return null;
						let format = BattleFormats[id] as FormatData | undefined;
						if (/^gen[1-9]$/.test(id)) {
							format ||= {
								id: id as ID,
								name: `[Gen ${id.slice(3)}]`,
								section: 'No Format',
								challengeShow: false,
								searchShow: false,
							} as any;
						}
						if (!format) return null;
						if (i === starred.length - 1) starredDone = true;
						if (selectType === 'challenge' && format.challengeShow === false) return null;
						if (selectType === 'search' && format.searchShow === false) return null;
						if (selectType === 'teambuilder' && format.team) return null;
						return <li><button value={format.name} class={`option${curFormat === format.id ? ' cur' : ''}`}>
							{format.name.replace('[Gen 8 ', '[').replace('[Gen 9] ', '').replace('[Gen 7 ', '[')}
							{format.section === 'No Format' && <em> (uncategorized)</em>}
							<i class="star fa fa-star cur" data-cmd={`/unstar ${format.id}`}></i>
						</button></li>;
					})}
					{column.map(format => {
						// do not include starred formats
						if (starred.includes(format.id || '')) return '';
						if (format.id) {
							return <li><button
								value={format.name}
								class={`option${curFormat === format.id ? ' cur' : ''}`}
							>
								{format.name.replace('[Gen 8 ', '[').replace('[Gen 9] ', '').replace('[Gen 7 ', '[')}
								{format.section === 'No Format' && <em> (uncategorized)</em>}
								<i class="star fa fa-star-o" data-cmd={`/star ${format.id}`}></i>
							</button></li>;
						} else {
							return <li><h3>{format.section}</h3></li>;
						}
					})}
				</ul>
			))}
			{noResults && <p>
				<em>No formats{!!searchID && ` matching "${searchID}"`} found</em>
			</p>}
			<div style="float: left"></div>
		</div></PSPanelWrapper>;
	}
}

PS.addRoomType(TeamDropdownPanel, FormatDropdownPanel);
