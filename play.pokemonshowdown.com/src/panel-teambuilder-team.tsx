/**
 * Teambuilder team panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

import preact from "../js/lib/preact";
import { PS, PSRoom, type RoomOptions, type Team } from "./client-main";
import { PSPanelWrapper, PSRoomPanel } from "./panels";
import { PSTeambuilder, type FormatResource } from "./panel-teamdropdown";
import { Dex, type ModdedDex, toID, type ID } from "./battle-dex";
import { DexSearch } from "./battle-dex-search";
import { PSSearchResults } from "./battle-searchresults";
import { BattleLog } from "./battle-log";
import { FormatDropdown } from "./panel-mainmenu";
import { BattleNatures, BattleStatNames, type StatName } from "./battle-dex-data";
import { BattleStatGuesser, BattleStatOptimizer } from "./battle-tooltips";

class TeamRoom extends PSRoom {
	/** Doesn't _literally_ always exist, but does in basically all code
	 * and constantly checking for its existence is legitimately annoying... */
	team!: Team;
	gen = Dex.gen;
	dex: ModdedDex = Dex;
	search = new DexSearch();
	searchInitial: ID | null = null;
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
		this.gen = this.getGen(team.format);
		this.dex = Dex.forGen(this.gen);
		if (team.format.includes('letsgo')) {
			this.dex = Dex.mod('gen7letsgo' as ID);
		}
		if (team.format.includes('bdsp')) {
			this.dex = Dex.mod('gen8bdsp' as ID);
		}
	}
	getGen(format: ID) {
		if (!format) return Dex.gen;
		if (!format.startsWith('gen')) return 6;
		return parseInt(format.charAt(3)) || Dex.gen;
	}
	getHPType(set: Dex.PokemonSet): ID {
		if (set.moves) {
			for (const move of set.moves) {
				const moveid = toID(move);
				if (moveid.startsWith('hiddenpower')) {
					return moveid.slice(11) as ID;
				}
			}
		}
		return '' as ID;
	}
	canHyperTrain(set: Dex.PokemonSet) {
		let format: string = this.team.format;
		if (this.gen < 7 || format === 'gen7hiddentype') return false;
		if (!set.level || set.level === 100) return true;
		if (format.startsWith('gen')) format = format.slice(4);
		if (format.startsWith('battlespot') || format.startsWith('vgc') || format === 'ultrasinnohclassic') {
			if (set.level === 50) return true;
		}
		return false;
	}
	getHPIVs(hpType: ID) {
		switch (hpType) {
		case 'dark':
			return ['111111'];
		case 'dragon':
			return ['011111', '101111', '110111'];
		case 'ice':
			return ['010111', '100111', '111110'];
		case 'psychic':
			return ['011110', '101110', '110110'];
		case 'electric':
			return ['010110', '100110', '111011'];
		case 'grass':
			return ['011011', '101011', '110011'];
		case 'water':
			return ['100011', '111010'];
		case 'fire':
			return ['101010', '110010'];
		case 'steel':
			return ['100010', '111101'];
		case 'ghost':
			return ['101101', '110101'];
		case 'bug':
			return ['100101', '111100', '101100'];
		case 'rock':
			return ['001100', '110100', '100100'];
		case 'ground':
			return ['000100', '111001', '101001'];
		case 'poison':
			return ['001001', '110001', '100001'];
		case 'flying':
			return ['000001', '111000', '101000'];
		case 'fighting':
			return ['001000', '110000', '100000'];
		default:
			return null;
		}
	}
	getStat(stat: StatName, set: Dex.PokemonSet, evOverride?: number, natureOverride?: number) {
		const team = this.team;

		const supportsEVs = !team.format.includes('letsgo');
		const supportsAVs = !supportsEVs;

		// do this after setting set.evs because it's assumed to exist
		// after getStat is run
		const species = this.dex.species.get(set.species);
		if (!species.exists) return 0;

		const level = set.level || 100;

		const baseStat = species.baseStats[stat];
		let iv = set.ivs?.[stat] ?? 31;
		if (this.gen <= 2) iv &= 30;
		const ev = evOverride ?? set.evs?.[stat] ?? (this.gen > 2 ? 0 : 252);

		if (stat === 'hp') {
			if (baseStat === 1) return 1;
			if (!supportsEVs) return Math.trunc(Math.trunc(2 * baseStat + iv + 100) * level / 100 + 10) + (supportsAVs ? ev : 0);
			return Math.trunc(Math.trunc(2 * baseStat + iv + Math.trunc(ev / 4) + 100) * level / 100 + 10);
		}
		let val = Math.trunc(Math.trunc(2 * baseStat + iv + Math.trunc(ev / 4)) * level / 100 + 5);
		if (!supportsEVs) {
			val = Math.trunc(Math.trunc(2 * baseStat + iv) * level / 100 + 5);
		}
		if (natureOverride) {
			val *= natureOverride;
		} else if (BattleNatures[set.nature!]?.plus === stat) {
			val *= 1.1;
		} else if (BattleNatures[set.nature!]?.minus === stat) {
			val *= 0.9;
		}
		if (!supportsEVs) {
			const friendshipValue = Math.trunc((70 / 255 / 10 + 1) * 100);
			val = Math.trunc(val) * friendshipValue / 100 + (supportsAVs ? ev : 0);
		}
		return Math.trunc(val);
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

type SelectionType = 'pokemon' | 'move' | 'item' | 'ability' | 'stats' | 'details';
class TeamTextbox extends preact.Component<{ team: Team, room: TeamRoom }> {
	setInfo: {
		species: string,
		bottomY: number,
		index: number,
	}[] = [];
	sets: Dex.PokemonSet[] = [];
	textbox: HTMLTextAreaElement = null!;
	heightTester: HTMLTextAreaElement = null!;
	compat = false;
	/** we changed the set but are delaying updates until the selection form is closed */
	setDirty = false;
	windowing = true;
	selection: {
		setIndex: number,
		type: SelectionType | null,
		typeIndex: number,
		lineRange: [number, number] | null,
	} | null = null;
	innerFocus: {
		offsetY: number | null,
		setIndex: number,
		type: SelectionType,
		/** i.e. which move is this */
		typeIndex: number,
		range: [number, number],
		/** if you edit, you'll change the range end, so it needs to be updated with this in mind */
		rangeEndChar: string,
	} | null = null;
	getYAt(index: number, fullLine?: boolean) {
		if (index < 0) return 10;
		const newValue = this.textbox.value.slice(0, index);
		this.heightTester.value = fullLine && !newValue.endsWith('\n') ? newValue + '\n' : newValue;
		return this.heightTester.scrollHeight;
	}
	input = () => this.updateText();
	keyUp = () => this.updateText(true);
	click = (ev: MouseEvent | KeyboardEvent) => {
		if (ev.altKey || ev.ctrlKey || ev.metaKey) return;
		const oldRange = this.selection?.lineRange;
		this.updateText(true, true);
		if (this.selection) {
			// this shouldn't actually update anything, so the reference comparison is enough
			if (this.selection.lineRange === oldRange) return;
			if (this.textbox.selectionStart === this.textbox.selectionEnd) {
				const range = this.getSelectionTypeRange();
				if (range) this.textbox.setSelectionRange(range[0], range[1]);
			}
		}
	};
	keyDown = (ev: KeyboardEvent) => {
		switch (ev.keyCode) {
		case 27: // escape
			if (this.closeMenu()) {
				ev.stopImmediatePropagation();
				ev.preventDefault();
			}
			break;
		case 9: // tab
			if (!this.innerFocus) {
				if (
					this.textbox.selectionStart === this.textbox.value.length &&
					(this.textbox.value.endsWith('\n\n') || !this.textbox.value)
				) {
					this.addPokemon();
				} else {
					this.click(ev);
				}
				ev.stopImmediatePropagation();
				ev.preventDefault();
			}
			break;
		case 80: // p
			if (ev.metaKey) {
				PS.alert(PSTeambuilder.exportTeam(this.sets, this.props.room.dex));
				ev.stopImmediatePropagation();
				ev.preventDefault();
				break;
			}
		}
	};
	closeMenu = () => {
		if (this.innerFocus) {
			this.innerFocus = null;
			if (this.setDirty) {
				this.updateText();
			} else {
				this.forceUpdate();
			}
			this.textbox.focus();
			return true;
		}
		return false;
	};
	updateText = (noTextChange?: boolean, autoSelect?: boolean | SelectionType) => {
		const textbox = this.textbox;
		const value = textbox.value;
		const selectionStart = textbox.selectionStart || 0;
		const selectionEnd = textbox.selectionEnd || 0;

		if (this.innerFocus) {
			if (!noTextChange) {
				let lineEnd = this.textbox.value.indexOf('\n', this.innerFocus.range[0]);
				if (lineEnd < 0) lineEnd = this.textbox.value.length;
				const line = this.textbox.value.slice(this.innerFocus.range[0], lineEnd);
				if (this.innerFocus.rangeEndChar) {
					const index = line.indexOf(this.innerFocus.rangeEndChar);
					if (index >= 0) lineEnd = this.innerFocus.range[0] + index;
				}
				this.innerFocus.range[1] = lineEnd;
			}
			const [start, end] = this.innerFocus.range;
			if (selectionStart >= start && selectionStart <= end && selectionEnd >= start && selectionEnd <= end) {
				if (!noTextChange) {
					this.updateSearch();
					this.setDirty = true;
				}
				return;
			}
			this.innerFocus = null;
		}

		if (this.setDirty) {
			this.setDirty = false;
			noTextChange = false;
		}

		this.heightTester.style.width = `${textbox.offsetWidth}px`;
		/** index of `value` that we've parsed to */
		let index = 0;
		/** for the set we're currently parsing */
		let setIndex: number | null = null;
		let nextSetIndex = 0;
		if (!noTextChange) this.setInfo = [];
		this.selection = null;

		while (index < value.length) {
			let nlIndex = value.indexOf('\n', index);
			if (nlIndex < 0) nlIndex = value.length;
			const line = value.slice(index, nlIndex);

			if (!line.trim()) {
				setIndex = null;
				index = nlIndex + 1;
				continue;
			}

			if (setIndex === null && index && !noTextChange && this.setInfo.length) {
				this.setInfo[this.setInfo.length - 1].bottomY = this.getYAt(index - 1);
			}

			if (setIndex === null) {
				if (!noTextChange) {
					const atIndex = line.indexOf('@');
					let species = atIndex >= 0 ? line.slice(0, atIndex).trim() : line.trim();
					if (species.endsWith(' (M)') || species.endsWith(' (F)')) {
						species = species.slice(0, -4);
					}
					if (species.endsWith(')')) {
						const parenIndex = species.lastIndexOf(' (');
						if (parenIndex >= 0) {
							species = species.slice(parenIndex + 2, -1);
						}
					}
					this.setInfo.push({
						species,
						bottomY: -1,
						index,
					});
				}
				setIndex = nextSetIndex;
				nextSetIndex++;
			}

			const selectionEndCutoff = (selectionStart === selectionEnd ? nlIndex : nlIndex + 1);
			let start = index, end = index + line.length;
			if (index <= selectionStart && selectionEnd <= selectionEndCutoff) {
				// both ends within range
				let type: SelectionType | null = null;
				const lcLine = line.toLowerCase().trim();

				if (lcLine.startsWith('ability:')) {
					type = 'ability';
				} else if (lcLine.startsWith('-')) {
					type = 'move';
				} else if (
					!lcLine || lcLine.startsWith('level:') || lcLine.startsWith('gender:') ||
					(lcLine + ':').startsWith('shiny:') || (lcLine + ':').startsWith('gigantamax:') ||
					lcLine.startsWith('tera type:') || lcLine.startsWith('dynamax level:')
				) {
					type = 'details';
				} else if (
					lcLine.startsWith('ivs:') || lcLine.startsWith('evs:') ||
					lcLine.endsWith(' nature')
				) {
					type = 'stats';
				} else {
					type = 'pokemon';
					const atIndex = line.indexOf('@');
					if (atIndex >= 0) {
						if (selectionStart > index + atIndex) {
							type = 'item';
							start = index + atIndex + 1;
						} else {
							end = index + atIndex;
							if (line.charAt(atIndex - 1) === ']' || line.charAt(atIndex - 2) === ']') {
								type = 'ability';
							}
						}
					}
				}

				if (typeof autoSelect === 'string') autoSelect = autoSelect === type;
				this.selection = {
					setIndex, type, lineRange: [start, end], typeIndex: 0,
				};
				if (autoSelect) this.engageFocus();
			}

			index = nlIndex + 1;
		}
		if (!noTextChange) {
			const end = value.endsWith('\n\n') ? value.length - 1 : value.length;
			const bottomY = this.getYAt(end, true);
			if (this.setInfo.length) {
				this.setInfo[this.setInfo.length - 1].bottomY = bottomY;
			}

			textbox.style.height = `${bottomY + 100}px`;
			this.save();
		}
		this.forceUpdate();
	};
	engageFocus(focus?: this['innerFocus']) {
		if (this.innerFocus) return;
		const { room } = this.props;

		if (!focus) {
			if (!this.selection?.type) return;

			const range = this.getSelectionTypeRange();
			if (!range) return;
			const { type, setIndex } = this.selection;

			let rangeEndChar = this.textbox.value.charAt(range[1]);
			if (rangeEndChar === ' ') rangeEndChar += this.textbox.value.charAt(range[1] + 1);
			focus = {
				offsetY: this.getYAt(range[0]),
				setIndex,
				type,
				typeIndex: this.selection.typeIndex,
				range,
				rangeEndChar,
			};
		}
		this.innerFocus = focus;

		if (focus.type === 'details' || focus.type === 'stats') {
			this.forceUpdate();
			return;
		}

		room.search.setType(focus.type, room.team.format, this.sets[focus.setIndex]);
		this.textbox.setSelectionRange(focus.range[0], focus.range[1]);

		let value = this.textbox.value.slice(focus.range[0], focus.range[1]);
		room.searchInitial = null;
		switch (focus.type) {
		case 'pokemon':
			if (room.dex.species.get(value).exists) {
				room.searchInitial = toID(value);
				value = '';
			}
			break;
		case 'item':
			if (toID(value) === 'noitem') value = '';
			if (room.dex.items.get(value).exists) {
				room.searchInitial = toID(value);
				value = '';
			}
			break;
		case 'ability':
			if (toID(value) === 'selectability') value = '';
			if (toID(value) === 'noability') value = '';
			if (room.dex.abilities.get(value).exists) {
				room.searchInitial = toID(value);
				value = '';
			}
			break;
		case 'move':
			if (room.dex.moves.get(value).exists) {
				room.searchInitial = toID(value);
				value = '';
			}
			break;
		}

		room.search.find(value);
		this.windowing = true;
		this.forceUpdate();
	}
	updateSearch() {
		if (!this.innerFocus) return;
		const { range } = this.innerFocus;
		const { room } = this.props;
		const value = this.textbox.value.slice(range[0], range[1]);

		room.search.find(value);
		this.windowing = true;
		this.forceUpdate();
	}
	handleClick = (ev: Event) => {
		const { room } = this.props;
		let target = ev.target as HTMLElement | null;
		while (target && target.className !== 'dexlist') {
			if (target.tagName === 'A') {
				const entry = target.getAttribute('data-entry');
				if (entry) {
					const [type, name] = entry.split('|');
					if (room.search.addFilter([type, name])) {
						room.search.find('');
						if (room.search.query) {
							this.changeSet(this.selection!.type!, '');
						} else {
							this.forceUpdate();
						}
					} else {
						this.changeSet(type as SelectionType, name);
					}
					ev.preventDefault();
					ev.stopImmediatePropagation();
					break;
				}
			}
			if (target.tagName === 'BUTTON') {
				const filter = target.getAttribute('data-filter');
				if (filter) {
					room.search.removeFilter(filter.split(':') as any);
					room.search.find('');
					this.forceUpdate();
					ev.preventDefault();
					ev.stopPropagation();
					break;
				}

				// sort
				const sort = target.getAttribute('data-sort');
				if (sort) {
					room.search.toggleSort(sort);
					room.search.find('');
					this.forceUpdate();
					ev.preventDefault();
					ev.stopPropagation();
					break;
				}
			}

			target = target.parentElement;
		}
	};
	getSelectionTypeRange(): [number, number] | null {
		const selection = this.selection;
		if (!selection?.lineRange) return null;

		let [start, end] = selection.lineRange;
		let lcLine = this.textbox.value.slice(start, end).toLowerCase();
		if (lcLine.endsWith('  ')) {
			end -= 2;
			lcLine = lcLine.slice(0, -2);
		}

		switch (selection.type) {
		case 'pokemon': {
			// let atIndex = lcLine.lastIndexOf('@');
			// if (atIndex >= 0) {
			// 	if (lcLine.charAt(atIndex - 1) === ' ') atIndex--;
			// 	lcLine = lcLine.slice(0, atIndex);
			// 	end = start + atIndex;
			// }

			if (lcLine.endsWith(' ')) {
				lcLine = lcLine.slice(0, -1);
				end--;
			}

			if (lcLine.endsWith(' (m)') || lcLine.endsWith(' (f)')) {
				lcLine = lcLine.slice(0, -4);
				end -= 4;
			}

			if (lcLine.endsWith(')')) {
				const parenIndex = lcLine.lastIndexOf(' (');
				if (parenIndex >= 0) {
					start = start + parenIndex + 2;
					end--;
				}
			}

			return [start, end];
		}
		case 'item': {
			// let atIndex = lcLine.lastIndexOf('@');
			// if (atIndex < 0) return null;

			// if (lcLine.charAt(atIndex + 1) === ' ') atIndex++;
			// return { start: start + atIndex + 1, end };
			if (lcLine.startsWith(' ')) start++;
			return [start, end];
		}
		case 'ability': {
			if (lcLine.startsWith('[')) {
				start++;
				if (lcLine.endsWith(' ')) {
					end--;
					lcLine = lcLine.slice(0, -1);
				}
				if (lcLine.endsWith(']')) {
					end--;
				}
				return [start, end];
			}
			if (!lcLine.startsWith('ability:')) return null;
			start += lcLine.startsWith('ability: ') ? 9 : 8;
			return [start, end];
		}
		case 'move': {
			if (!lcLine.startsWith('-')) return null;
			start += lcLine.startsWith('- ') ? 2 : 1;
			return [start, end];
		}
		}
		return null;
	}
	changeSet(type: SelectionType, name: string) {
		const selection = this.selection;
		if (!selection) return;

		const range = this.getSelectionTypeRange();
		if (range) {
			this.replace(name, range[0], range[1]);
			this.updateText(false, true);
			return;
		}

		switch (type) {
		case 'pokemon': {
			const species = this.props.room.dex.species.get(name);
			const abilities = Object.values(species.abilities);
			this.sets[selection.setIndex] ||= {
				ability: abilities.length === 1 ? abilities[0] : undefined,
				species: '',
				moves: [],
			};
			this.sets[selection.setIndex].species = name;
			this.replaceSet(selection.setIndex);
			this.updateText(false, true);
			break;
		}
		case 'ability': {
			this.sets[selection.setIndex].ability = name;
			this.replaceSet(selection.setIndex);
			this.updateText(false, true);
			break;
		}
		}
	}
	getSetRange(index: number) {
		const start = this.setInfo[index]?.index ?? this.textbox.value.length;
		const end = this.setInfo[index + 1]?.index ?? this.textbox.value.length;
		return [start, end];
	}
	changeCompat = (ev: Event) => {
		const checkbox = ev.currentTarget as HTMLInputElement;
		this.compat = checkbox.checked;
		this.sets = PSTeambuilder.importTeam(this.textbox.value);
		this.textbox.value = PSTeambuilder.exportTeam(this.sets, this.props.room.dex, this.compat);
		this.updateText();
	};
	replaceSet(index: number) {
		const { room } = this.props;
		const { team } = room;
		if (!team) return;

		let newText = PSTeambuilder.exportSet(this.sets[index], room.dex, this.compat);
		const [start, end] = this.getSetRange(index);
		if (start && start === this.textbox.value.length && !this.textbox.value.endsWith('\n\n')) {
			newText = (this.textbox.value.endsWith('\n') ? '\n' : '\n\n') + newText;
		}
		this.replace(newText, start, end, start + newText.length);
		// we won't do a full update but we do need to update where the end is,
		// for future updates
		if (!this.setInfo[index]) {
			this.updateText();
		} else {
			if (this.setInfo[index + 1]) {
				this.setInfo[index + 1].index = start + newText.length;
			}
			// others don't need to be updated;
			// we'll do a full update next time we focus the textbox
			this.setDirty = true;
		}
	}
	replace(text: string, start: number, end: number, selectionStart = start, selectionEnd = start + text.length) {
		const textbox = this.textbox;
		const value = textbox.value;
		textbox.value = value.slice(0, start) + text + value.slice(end);
		textbox.setSelectionRange(selectionStart, selectionEnd);
		this.save();
	}
	save() {
		const sets = PSTeambuilder.importTeam(this.textbox.value);
		this.sets = sets;
		this.props.team.packedTeam = PSTeambuilder.packTeam(sets);
		this.props.team.iconCache = null;
		this.props.room.save();
	}
	override componentDidMount() {
		this.textbox = this.base!.getElementsByClassName('teamtextbox')[0] as HTMLTextAreaElement;
		this.heightTester = this.base!.getElementsByClassName('heighttester')[0] as HTMLTextAreaElement;

		this.sets = PSTeambuilder.unpackTeam(this.props.team.packedTeam);
		const exportedTeam = PSTeambuilder.exportTeam(this.sets, this.props.room.dex, this.compat);
		this.textbox.value = exportedTeam;
		this.updateText();
	}
	override componentWillUnmount() {
		this.textbox = null!;
		this.heightTester = null!;
	}
	clickDetails = (ev: Event) => {
		const target = ev.currentTarget as HTMLButtonElement;
		const i = parseInt(target.value || '0');
		if (this.innerFocus?.type === target.name) {
			this.innerFocus = null;
			this.forceUpdate();
			return;
		}
		this.innerFocus = {
			offsetY: null,
			setIndex: i,
			type: target.name as SelectionType,
			typeIndex: 0,
			range: [0, 0],
			rangeEndChar: '',
		};
		this.forceUpdate();
	};
	addPokemon = () => {
		if (!this.textbox.value.endsWith('\n\n')) {
			this.textbox.value += this.textbox.value.endsWith('\n') ? '\n' : '\n\n';
		}
		const end = this.textbox.value.length;
		this.textbox.setSelectionRange(end, end);
		this.textbox.focus();
		this.engageFocus({
			offsetY: this.getYAt(end, true),
			setIndex: this.setInfo.length,
			type: 'pokemon',
			typeIndex: 0,
			range: [end, end],
			rangeEndChar: '@',
		});
	};
	scrollResults = (ev: Event) => {
		this.windowing = false;
		if (PS.leftPanelWidth !== null) {
			(ev.currentTarget as any).scrollIntoViewIfNeeded?.();
		}
		this.forceUpdate();
	};
	windowResults() {
		if (this.windowing) {
			return Math.ceil(window.innerHeight / 33);
		}
		return null;
	}
	renderDetails(set: Dex.PokemonSet, i: number) {
		const { room } = this.props;
		const { team } = room;
		if (!team) return;
		const species = room.dex.species.get(set.species);

		const GenderChart = {
			'M': 'Male',
			'F': 'Female',
			'N': '\u2014', // em dash
		};
		const gender = GenderChart[(set.gender || species.gender || 'N') as 'N'];

		return <button class="textbox setdetails" name="details" value={i} onClick={this.clickDetails}>
			<span class="detailcell"><label>Level</label>{set.level || 100}</span>
			<span class="detailcell"><label>Shiny</label>{set.shiny ? 'Yes' : 'No'}</span>
			{room.gen < 9 && <span class="detailcell"><label>Gender</label>{gender}</span>}
			{room.gen === 9 && <span class="detailcell">
				<label>Tera</label>{set.teraType || species.forceTeraType || species.types[0]}
			</span>}
		</button>;
	}

	renderStatGraph(set: Dex.PokemonSet, i: number) {
		const { room } = this.props;
		const { team } = room;
		if (!team) return;

		// const supportsEVs = !team.format.includes('letsgo');

		// stat cell
		// const defaultEV = (room.gen > 2 ? 0 : 252);
		return <button class="textbox setstats" name="stats" value={i} onClick={this.clickDetails}>
			{Dex.statNames.map(statID => {
				if (statID === 'spd' && room.gen === 1) return null;

				let stat = room.getStat(statID, set);
				// const ev = set.evs?.[statID] ?? defaultEV;
				let width = stat * 75 / 504;
				if (statID === 'hp') width = stat * 75 / 704;
				if (width > 75) width = 75;
				let hue = Math.floor(stat * 180 / 714);
				if (hue > 360) hue = 360;
				const statName = room.gen === 1 && statID === 'spa' ? 'Spc' : BattleStatNames[statID];
				return <span class="statrow">
					<label>{statName}</label> {}
					<span class="statgraph"><span style={{ width: `${width}px`, background: `hsl(${hue},40%,75%)` }}></span></span> {}
					<em>{stat}</em>
					{/* {BattleNatures[set.nature!]?.plus === statID ? (
						<small>+</small>
					) : BattleNatures[set.nature!]?.minus === statID ? (
						<small>&minus;</small>
					) : null} */}
				</span>;
			})}
		</button>;
	}
	renderTypeIcon(type: string | null, b?: boolean) { // b is just for utilichart.js
		const { room } = this.props;
		if (!type) return null;
		type = room.dex.types.get(type).name;
		if (!type) type = '???';
		let sanitizedType = type.replace(/\?/g, '%3f');
		return <img
			src={`${Dex.resourcePrefix}sprites/types/${sanitizedType}.png`} alt={type}
			height="14" width="32" class={`pixelated${b ? ' b' : ''}`}
		/>;
	}
	handleSetChange = () => {
		if (this.selection) {
			this.replaceSet(this.selection.setIndex);
			this.forceUpdate();
		}
	};
	bottomY() {
		return this.setInfo[this.setInfo.length - 1]?.bottomY ?? 8;
	}
	render() {
		const { room } = this.props;
		const statsDetailsOffset = room.gen >= 3 ? 18 : -1;
		return <div class="teameditor">
			<textarea
				class="textbox teamtextbox"
				onInput={this.input} onClick={this.click} onKeyUp={this.keyUp} onKeyDown={this.keyDown}
			/>
			<textarea
				class="textbox teamtextbox heighttester" style="visibility:hidden;left:-15px" tabIndex={-1} aria-hidden={true}
			/>
			<div class="teamoverlays">
				{this.setInfo.slice(0, -1).map(info =>
					<hr style={`top:${info.bottomY - 18}px`} />
				)}
				{this.setInfo.length < 6 && !!this.setInfo.length && <hr style={`top:${this.bottomY() - 18}px`} />}
				{this.setInfo.map((info, i) => {
					if (!info.species) return null;
					const set = this.sets[i];
					const prevOffset = i === 0 ? 8 : this.setInfo[i - 1].bottomY;
					const species = info.species;
					const num = Dex.getPokemonIconNum(toID(species));
					if (!num) return null;

					const top = Math.floor(num / 12) * 30;
					const left = (num % 12) * 40;
					const iconStyle = `background:transparent url(${Dex.resourcePrefix}sprites/pokemonicons-sheet.png) no-repeat scroll -${left}px -${top}px`;

					const itemStyle = set.item && Dex.getItemIcon(room.dex.items.get(set.item));

					const types = room.dex.species.get(species).types.map(type => <div>{this.renderTypeIcon(type)}</div>);

					return [<div style={`top:${prevOffset + 1}px;left:50px;position:absolute;text-align:center`}>
						<div><span class="picon" style={iconStyle}></span></div>
						{types}
						<div><span class="itemicon" style={itemStyle}></span></div>
					</div>, <div style={`top:${prevOffset + statsDetailsOffset}px;right:9px;position:absolute`}>
						{this.renderStatGraph(set, i)}
					</div>, <div style={`top:${prevOffset + statsDetailsOffset}px;right:150px;position:absolute`}>
						{this.renderDetails(set, i)}
					</div>];
				})}
				{this.setInfo.length < 6 && !(this.innerFocus && this.innerFocus.setIndex >= this.setInfo.length) && (
					<div style={`top:${this.bottomY() - 3}px ;left:105px;position:absolute`}>
						<button class="button" onClick={this.addPokemon}>
							<i class="fa fa-plus" aria-hidden></i> Add Pok&eacute;mon
						</button>
					</div>
				)}
				{this.innerFocus?.offsetY != null && (
					<div
						class={`teaminnertextbox teaminnertextbox-${this.innerFocus.type}`} style={{ top: this.innerFocus.offsetY - 21 }}
					></div>
				)}
			</div>
			<p>
				<label class="checkbox"><input type="checkbox" name="compat" onChange={this.changeCompat} /> Old export format</label>
			</p>
			{this.innerFocus && (
				<div
					class="searchresults" style={{ top: (this.setInfo[this.innerFocus.setIndex]?.bottomY ?? this.bottomY() + 50) - 12 }}
					onClick={this.handleClick} onScroll={this.scrollResults}
				>
					<button class="button closesearch" onClick={this.closeMenu}>
						<kbd>Esc</kbd> <i class="fa fa-times" aria-hidden></i> Close
					</button>
					{this.innerFocus.type === 'stats' ? (
						<StatForm room={this.props.room} set={this.sets[this.innerFocus.setIndex]} onChange={this.handleSetChange} />
					) : this.innerFocus.type === 'details' ? (
						<DetailsForm room={this.props.room} set={this.sets[this.innerFocus.setIndex]} onChange={this.handleSetChange} />
					) : (
						<PSSearchResults search={room.search} searchInitial={room.searchInitial} windowing={this.windowResults()} />
					)}
				</div>
			)}
		</div>;
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
				<i class="fa fa-chevron-left" aria-hidden></i> List
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
			<TeamTextbox team={room.team} room={room} />
			{!!(info && (info.resources.length || info.url)) && (
				<div style={{ paddingLeft: "5px", paddingTop: "2em" }}>
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

class StatForm extends preact.Component<{
	room: TeamRoom,
	set: Dex.PokemonSet,
	onChange: () => void,
}> {
	renderIVMenu() {
		const { room, set } = this.props;
		if (room.gen <= 2) return null;

		const hpType = room.getHPType(set);
		const hpIVdata = hpType && !room.canHyperTrain(set) && room.getHPIVs(hpType) || null;
		if (!hpIVdata) {
			return <select name="ivspread" class="button" onChange={this.changeIVSpread}>
				<option value="" selected>IV spreads</option>
				<optgroup label="min Atk">
					<option value="31/0/31/31/31/31">31/0/31/31/31/31</option>
				</optgroup>
				<optgroup label="min Atk, min Spe">
					<option value="31/0/31/31/31/0">31/0/31/31/31/0</option>
				</optgroup>
				<optgroup label="max all">
					<option value="31/31/31/31/31/31">31/31/31/31/31/31</option>
				</optgroup>
				<optgroup label="min Spe">
					<option value="31/31/31/31/31/0">31/31/31/31/31/0</option>
				</optgroup>
			</select>;
		}
		const minStat = room.gen >= 6 ? 0 : 2;
		const hpIVs = hpIVdata.map(ivs => ivs.split('').map(iv => parseInt(iv)));

		return <select name="ivspread" class="button" onChange={this.changeIVSpread}>
			<option value="" selected>Hidden Power {hpType.charAt(0).toUpperCase() + hpType.slice(1)} IVs</option>
			<optgroup label="min Atk">
				{hpIVs.map(ivs => {
					const spread = ivs.map((iv, i) => (i === 1 ? minStat : 30) + iv).join('/');
					return <option value={spread}>{spread}</option>;
				})}
			</optgroup>
			<optgroup label="min Atk, min Spe">
				{hpIVs.map(ivs => {
					const spread = ivs.map((iv, i) => (i === 5 || i === 1 ? minStat : 30) + iv).join('/');
					return <option value={spread}>{spread}</option>;
				})}
			</optgroup>
			<optgroup label="max all">
				{hpIVs.map(ivs => {
					const spread = ivs.map(iv => 30 + iv).join('/');
					return <option value={spread}>{spread}</option>;
				})}
			</optgroup>
			<optgroup label="min Spe">
				{hpIVs.map(ivs => {
					const spread = ivs.map((iv, i) => (i === 5 ? minStat : 30) + iv).join('/');
					return <option value={spread}>{spread}</option>;
				})}
			</optgroup>
		</select>;
	}
	smogdexLink(s: string) {
		const { room } = this.props;
		const species = room.dex.species.get(s);
		let format: string = room.team.format;
		let smogdexid: string = toID(species.baseSpecies);

		if (species.id === 'meowstic') {
			smogdexid = 'meowstic-m';
		} else if (species.forme) {
			switch (species.baseSpecies) {
			case 'Alcremie':
			case 'Basculin':
			case 'Burmy':
			case 'Castform':
			case 'Cherrim':
			case 'Deerling':
			case 'Flabebe':
			case 'Floette':
			case 'Florges':
			case 'Furfrou':
			case 'Gastrodon':
			case 'Genesect':
			case 'Keldeo':
			case 'Mimikyu':
			case 'Minior':
			case 'Pikachu':
			case 'Polteageist':
			case 'Sawsbuck':
			case 'Shellos':
			case 'Sinistea':
			case 'Tatsugiri':
			case 'Vivillon':
				break;
			default:
				smogdexid += '-' + toID(species.forme);
				break;
			}
		}

		let generationNumber = 9;
		if (format.startsWith('gen')) {
			let number = parseInt(format.charAt(3), 10);
			if (1 <= number && number <= 8) {
				generationNumber = number;
			}
			format = format.slice(4);
		}
		const generation = ['rb', 'gs', 'rs', 'dp', 'bw', 'xy', 'sm', 'ss', 'sv'][generationNumber - 1];
		if (format === 'battlespotdoubles') {
			smogdexid += '/vgc15';
		} else if (format === 'doublesou' || format === 'doublesuu') {
			smogdexid += '/doubles';
		} else if (
			format === 'ou' || format === 'uu' || format === 'ru' || format === 'nu' || format === 'pu' ||
			format === 'lc' || format === 'monotype' || format === 'mixandmega' || format === 'nfe' ||
			format === 'nationaldex' || format === 'stabmons' || format === '1v1' || format === 'almostanyability'
		) {
			smogdexid += '/' + format;
		} else if (format === 'balancedhackmons') {
			smogdexid += '/bh';
		} else if (format === 'anythinggoes') {
			smogdexid += '/ag';
		} else if (format === 'nationaldexag') {
			smogdexid += '/national-dex-ag';
		}
		return `http://smogon.com/dex/${generation}/pokemon/${smogdexid}/`;
	}
	handleGuess = () => {
		const { room, set } = this.props;
		const team = room.team;

		const guess = new BattleStatGuesser(team.format).guess(set);
		set.evs = guess.evs;
		this.plus = guess.plusStat || null;
		this.minus = guess.minusStat || null;
		this.updateNatureFromPlusMinus();
		this.props.onChange();
	};
	handleOptimize = () => {
		const { room, set } = this.props;
		const team = room.team;

		const optimized = BattleStatOptimizer(set, team.format);
		if (!optimized) return;

		set.evs = optimized.evs;
		this.plus = optimized.plus || null;
		this.minus = optimized.minus || null;
		this.props.onChange();
	};
	renderSpreadGuesser() {
		const { room, set } = this.props;
		const team = room.team;

		if (room.gen < 3) {
			return <p>
				(<a target="_blank" href={this.smogdexLink(set.species)}>Smogon&nbsp;analysis</a>)
			</p>;
		}

		const guess = new BattleStatGuesser(team.format).guess(set);
		const role = guess.role;

		const guessedEVs = guess.evs;
		const guessedPlus = guess.plusStat || null;
		const guessedMinus = guess.minusStat || null;
		return <p class="suggested">
			<small>Guessed spread: </small>
			{role === '?' ? (
				"(Please choose 4 moves to get a guessed spread)"
			) : (
				<button name="setStatFormGuesses" class="button" onClick={this.handleGuess}>{role}: {}
					{
						Dex.statNames.map(statID => guessedEVs[statID] ? `${guessedEVs[statID]} ${BattleStatNames[statID]}` : null)
							.filter(Boolean).join(' / ')
					}
					{!!(guessedPlus && guessedMinus) && (
						` (+${BattleStatNames[guessedPlus]}, -${BattleStatNames[guessedMinus]})`
					)}
				</button>
			)}
			<small> (<a target="_blank" href={this.smogdexLink(set.species)}>Smogon&nbsp;analysis</a>)</small>
			{/* <small>
				({role} | bulk: phys {Math.round(guess.moveCount.physicalBulk / 1000)}
				{} + spec {Math.round(guess.moveCount.specialBulk / 1000)}
				{} = {Math.round(guess.moveCount.bulk / 1000)})
			</small> */}
		</p>;
	}
	renderStatOptimizer() {
		const optimized = BattleStatOptimizer(this.props.set, this.props.room.team.format);
		if (!optimized) return null;

		return <p>
			<small><em>Protip:</em> Use a different nature to {
				optimized.savedEVs ?
					`save ${optimized.savedEVs} EVs` :
					'get higher stats'
			}: </small>
			<button name="setStatFormOptimization" class="button" onClick={this.handleOptimize}>
				{
					Dex.statNames.map(statID => optimized.evs[statID] ? `${optimized.evs[statID]} ${BattleStatNames[statID]}` : null)
						.filter(Boolean).join(' / ')
				}
				{!!(optimized.plus && optimized.minus) && (
					` (+${BattleStatNames[optimized.plus]}, -${BattleStatNames[optimized.minus]})`
				)}
			</button>
		</p>;
	}
	setInput(name: string, value: string) {
		const evInput = this.base!.querySelector<HTMLInputElement>(`input[name="${name}"]`);
		if (evInput) evInput.value = value;
	}
	update(init?: boolean) {
		const { set } = this.props;
		const nature = BattleNatures[set.nature!];
		const skipID = !init ? this.base!.querySelector<HTMLInputElement>('input:focus')?.name : undefined;
		if (nature?.plus) {
			this.plus = nature?.plus || null;
			this.minus = nature?.minus || null;
		} else if (this.plus && this.minus) {
			// if only one of plus or minus is set, clearing Nature doesn't change them
			this.plus = null;
			this.minus = null;
		}
		for (const statID of Dex.statNames) {
			const ev = `${set.evs?.[statID] || ''}`;
			const plusMinus = this.plus === statID ? '+' : this.minus === statID ? '-' : '';
			const iv = this.ivToDv(set.ivs?.[statID]);
			if (skipID !== `ev-${statID}`) this.setInput(`ev-${statID}`, ev + plusMinus);
			if (skipID !== `iv-${statID}`) this.setInput(`iv-${statID}`, iv);
		}
	}
	override componentDidMount(): void {
		this.update(true);
	}
	override componentDidUpdate(): void {
		this.update();
	}
	plus: Dex.StatNameExceptHP | null = null;
	minus: Dex.StatNameExceptHP | null = null;
	renderStatbar(stat: number, statID: StatName) {
		let width = stat * 180 / 504;
		if (statID === 'hp') width = Math.floor(stat * 180 / 704);
		if (width > 179) width = 179;
		let color = Math.floor(stat * 180 / 714);
		if (color > 360) color = 360;
		return <span
			style={`width:${Math.floor(width)}px;background:hsl(${color},85%,45%);border-color:hsl(${color},85%,35%)`}
		></span>;
	}
	changeEV = (ev: Event) => {
		const target = ev.currentTarget as HTMLInputElement;
		const { set } = this.props;
		const statID = target.name.split('-')[1] as Dex.StatName;
		let value = Math.abs(parseInt(target.value));

		if (target.value.includes('+')) {
			if (statID === 'hp') {
				PS.alert("Natures cannot raise or lower HP.");
				return;
			}
			this.plus = statID;
		} else if (this.plus === statID) {
			this.plus = null;
		}
		if (target.value.includes('-')) {
			if (statID === 'hp') {
				PS.alert("Natures cannot raise or lower HP.");
				return;
			}
			this.minus = statID;
		} else if (this.minus === statID) {
			this.minus = null;
		}
		if (isNaN(value)) {
			if (set.evs) delete set.evs[statID];
		} else {
			set.evs ||= {};
			set.evs[statID] = value;
		}
		if (target.type === 'range') {
			// enforce limit
			const maxEv = this.maxEVs();
			if (maxEv < 6 * 252) {
				let totalEv = 0;
				for (const curEv of Object.values(set.evs || {})) totalEv += curEv;
				if (totalEv > maxEv && totalEv - value <= maxEv) {
					set.evs![statID] = maxEv - (totalEv - value) - (maxEv % 4);
				}
			}
		}

		this.updateNatureFromPlusMinus();
		this.props.onChange();
	};
	updateNatureFromPlusMinus = () => {
		const { set } = this.props;
		if (!this.plus || !this.minus) {
			delete set.nature;
		} else {
			for (const i in BattleNatures) {
				if (BattleNatures[i as Dex.NatureName].plus === this.plus && BattleNatures[i as Dex.NatureName].minus === this.minus) {
					set.nature = i as Dex.NatureName;
					break;
				}
			}
		}
	};
	/** Converts DV/IV in a textbox to the value in set. */
	dvToIv(dvOrIvString?: string): number | null {
		const dvOrIv = Number(dvOrIvString);
		if (isNaN(dvOrIv)) return null;
		const useIVs = this.props.room.gen > 2;
		return useIVs ? dvOrIv : (dvOrIv === 15 ? 31 : dvOrIv * 2);
	}
	/** Converts set.iv value to a DV/IV for a text box. */
	ivToDv(iv?: number | null): string {
		if (iv === null || iv === undefined) return '';
		const useIVs = this.props.room.gen > 2;
		return `${useIVs ? iv : Math.trunc(iv / 2)}`;
	}
	changeIV = (ev: Event) => {
		const target = ev.currentTarget as HTMLInputElement;
		const { set } = this.props;
		const statID = target.name.split('-')[1] as StatName;
		const value = this.dvToIv(target.value);
		if (value === null) {
			if (set.ivs) delete set.ivs[statID];
		} else {
			set.ivs ||= { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
			set.ivs[statID] = value;
		}
		this.props.onChange();
	};
	changeNature = (ev: Event) => {
		const target = ev.currentTarget as HTMLSelectElement;
		const { set } = this.props;
		const nature = target.value as Dex.NatureName;
		if (nature === 'Serious') {
			delete set.nature;
		} else {
			set.nature = nature;
		}
		this.props.onChange();
	};
	changeIVSpread = (ev: Event) => {
		const target = ev.currentTarget as HTMLSelectElement;
		const { set } = this.props;
		if (!target.value) return;

		const [hp, atk, def, spa, spd, spe] = target.value.split('/').map(Number);
		set.ivs = { hp, atk, def, spa, spd, spe };
		this.props.onChange();
	};
	maxEVs() {
		const { room } = this.props;
		const team = room.team;
		const useEVs = !team.format.includes('letsgo');
		return useEVs ? 510 : Infinity;
	}
	override render() {
		const { room, set } = this.props;
		const team = room.team;
		const species = room.dex.species.get(set.species);

		const baseStats = species.baseStats;

		const nature = BattleNatures[set.nature || 'Serious'];

		const useEVs = !team.format.includes('letsgo');
		// const useAVs = !useEVs && team.format.endsWith('norestrictions');
		const maxEV = useEVs ? 252 : 200;
		const stepEV = useEVs ? 4 : 1;
		const defaultEV = useEVs && room.gen <= 2 && !set.evs ? maxEV : 0;
		const useIVs = room.gen > 2;

		// label column
		const statNames = {
			hp: 'HP',
			atk: 'Attack',
			def: 'Defense',
			spa: 'Sp. Atk.',
			spd: 'Sp. Def.',
			spe: 'Speed',
		};
		if (room.gen === 1) statNames.spa = 'Special';

		const stats = Dex.statNames.filter(statID => room.gen > 1 || statID !== 'spd').map(statID => [
			statID, statNames[statID], room.getStat(statID, set),
		] as const);

		let remaining = null;
		const maxEv = this.maxEVs();
		if (maxEv < 6 * 252) {
			let totalEv = 0;
			for (const ev of Object.values(set.evs || {})) totalEv += ev;
			if (totalEv <= maxEv) {
				remaining = (totalEv > (maxEv - 2) ? 0 : (maxEv - 2) - totalEv);
			} else {
				remaining = maxEv - totalEv;
			}
			remaining ||= null;
		}

		return <div style="font-size:10pt" role="dialog" aria-label="Stats">
			<div class="resultheader"><h3>EVs, IVs, and Nature</h3></div>
			<div class="pad">
				{this.renderSpreadGuesser()}
				<table>
					<tr>
						<th>{/* Stat name */}</th>
						<th>Base</th>
						<th>{/* Stat bar */}</th>
						<th>{useEVs ? 'EVs' : 'AVs'}</th>
						<th>{/* EV slider */}</th>
						<th>{useIVs ? 'IVs' : 'DVs'}</th>
						<th>{/* Final stat */}</th>
					</tr>
					{stats.map(([statID, statName, stat]) => <tr>
						<th style="text-align:right;font-weight:normal">{statName}</th>
						<td style="text-align:right"><strong>{baseStats[statID]}</strong></td>
						<td class="setstatbar">{this.renderStatbar(stat, statID)}</td>
						<td><input
							name={`ev-${statID}`} placeholder={`${defaultEV || ''}`}
							type="text" inputMode="numeric" class="textbox default-placeholder" style="width:40px"
							onInput={this.changeEV} onChange={this.changeEV}
						/></td>
						<td><input
							name={`evslider-${statID}`} value={set.evs?.[statID] ?? defaultEV} min="0" max={maxEV} step={stepEV}
							type="range" class="evslider" tabIndex={-1} aria-hidden style="width:170px"
							onInput={this.changeEV} onChange={this.changeEV}
						/></td>
						<td><input
							name={`iv-${statID}`} min={0} max={useIVs ? 31 : 15} placeholder={useIVs ? '31' : '15'} style="width:40px"
							type="number" class="textbox default-placeholder" onInput={this.changeIV} onChange={this.changeIV}
						/></td>
						<td style="text-align:right"><strong>{stat}</strong></td>
					</tr>)}
					<tr>
						<td colSpan={3} style="text-align:right">{remaining !== null ? 'Remaining:' : ''}</td>
						<td style="text-align:center">{remaining && remaining < 0 ? <b class="message-error">{remaining}</b> : remaining}</td>
						<td colSpan={3} style="text-align:right">{this.renderIVMenu()}</td>
					</tr>
				</table>
				{room.gen >= 3 && <p>
					Nature: <select name="nature" class="button" onChange={this.changeNature}>
						{Object.entries(BattleNatures).map(([natureName, curNature]) => (
							<option value={natureName} selected={curNature === nature}>
								{natureName}
								{curNature.plus && ` (+${BattleStatNames[curNature.plus]}, -${BattleStatNames[curNature.minus!]})`}
							</option>
						))}
					</select>
				</p>}
				{room.gen >= 3 && <p>
					<small><em>Protip:</em> You can also set natures by typing <kbd>+</kbd> and <kbd>-</kbd> next to a stat.</small>
				</p>}
				{room.gen >= 3 && this.renderStatOptimizer()}
			</div>
		</div>;
	}
}

class DetailsForm extends preact.Component<{
	room: TeamRoom,
	set: Dex.PokemonSet,
	onChange: () => void,
}> {
	update(init?: boolean) {
		const { set } = this.props;
		const skipID = !init ? this.base!.querySelector<HTMLInputElement>('input:focus')?.name : undefined;

		const nickname = this.base!.querySelector<HTMLInputElement>('input[name="nickname"]');
		if (nickname && skipID !== 'nickname') nickname.value = set.name || '';
	}
	override componentDidMount(): void {
		this.update(true);
	}
	override componentDidUpdate(): void {
		this.update();
	}
	changeNickname = (ev: Event) => {
		const target = ev.currentTarget as HTMLInputElement;
		const { set } = this.props;
		if (target.value) {
			set.name = target.value.trim();
		} else {
			delete set.name;
		}
		this.props.onChange();
	};
	changeTera = (ev: Event) => {
		const target = ev.currentTarget as HTMLInputElement;
		const { set } = this.props;
		const species = this.props.room.dex.species.get(set.species);
		if (!target.value || target.value === (species.forceTeraType || species.types[0])) {
			delete set.teraType;
		} else {
			set.teraType = target.value.trim();
		}
		this.props.onChange();
	};
	render() {
		const { room, set } = this.props;
		const species = room.dex.species.get(set.species);
		return <div style="font-size:10pt" role="dialog" aria-label="Details">
			<div class="resultheader"><h3>Details</h3></div>
			<div class="pad">
				<p><label class="label">Nickname: <input
					name="nickname" class="textbox default-placeholder" placeholder={species.baseSpecies}
					onInput={this.changeNickname} onChange={this.changeNickname}
				/></label></p>

				<p>[insert the rest of the details pane]</p>
				{/*
buf += '<div class="formrow"><label class="formlabel">Level:</label><div><input type="number" min="1" max="100" step="1" name="level" value="' + (typeof set.level === 'number' ? set.level : 100) + '" class="textbox inputform numform" /></div></div>';

if (this.curTeam.gen > 1) {
	buf += '<div class="formrow"><label class="formlabel">Gender:</label><div>';
	if (species.gender && !isHackmons) {
		var genderTable = { 'M': "Male", 'F': "Female", 'N': "Genderless" };
		buf += genderTable[species.gender];
	} else {
		buf += '<label class="checkbox inline"><input type="radio" name="gender" value="M"' + (set.gender === 'M' ? ' checked' : '') + ' /> Male</label> ';
		buf += '<label class="checkbox inline"><input type="radio" name="gender" value="F"' + (set.gender === 'F' ? ' checked' : '') + ' /> Female</label> ';
		if (!isHackmons) {
			buf += '<label class="checkbox inline"><input type="radio" name="gender" value="N"' + (!set.gender ? ' checked' : '') + ' /> Random</label>';
		} else {
			buf += '<label class="checkbox inline"><input type="radio" name="gender" value="N"' + (set.gender === 'N' ? ' checked' : '') + ' /> Genderless</label>';
		}
	}
	buf += '</div></div>';

	if (isLetsGo) {
		buf += '<div class="formrow"><label class="formlabel">Happiness:</label><div><input type="number" name="happiness" value="70" class="textbox inputform numform" /></div></div>';
	} else {
		if (this.curTeam.gen < 8 || isNatDex)
			buf += '<div class="formrow"><label class="formlabel">Happiness:</label><div><input type="number" min="0" max="255" step="1" name="happiness" value="' + (typeof set.happiness === 'number' ? set.happiness : 255) + '" class="textbox inputform numform" /></div></div>';
	}

	buf += '<div class="formrow"><label class="formlabel">Shiny:</label><div>';
	buf += '<label class="checkbox inline"><input type="radio" name="shiny" value="yes"' + (set.shiny ? ' checked' : '') + ' /> Yes</label> ';
	buf += '<label class="checkbox inline"><input type="radio" name="shiny" value="no"' + (!set.shiny ? ' checked' : '') + ' /> No</label>';
	buf += '</div></div>';

	if (this.curTeam.gen === 8 && !isBDSP) {
		if (!species.cannotDynamax) {
			buf += '<div class="formrow"><label class="formlabel">Dmax Level:</label><div><input type="number" min="0" max="10" step="1" name="dynamaxlevel" value="' + (typeof set.dynamaxLevel === 'number' ? set.dynamaxLevel : 10) + '" class="textbox inputform numform" /></div></div>';
		}
		if (species.canGigantamax || species.forme === 'Gmax') {
			buf += '<div class="formrow"><label class="formlabel">Gigantamax:</label><div>';
			if (species.forme === 'Gmax') {
				buf += 'Yes';
			} else {
				buf += '<label class="checkbox inline"><input type="radio" name="gigantamax" value="yes"' + (set.gigantamax ? ' checked' : '') + ' /> Yes</label> ';
				buf += '<label class="checkbox inline"><input type="radio" name="gigantamax" value="no"' + (!set.gigantamax ? ' checked' : '') + ' /> No</label>';
			}
			buf += '</div></div>';
		}
	}
}

if (this.curTeam.gen > 2) {
	buf += '<div class="formrow" style="display:none"><label class="formlabel">Pokeball:</label><div><select name="pokeball" class="button">';
	buf += '<option value=""' + (!set.pokeball ? ' selected="selected"' : '') + '></option>'; // unset
	var balls = this.curTeam.dex.getPokeballs();
	for (var i = 0; i < balls.length; i++) {
		buf += '<option value="' + balls[i] + '"' + (set.pokeball === balls[i] ? ' selected="selected"' : '') + '>' + balls[i] + '</option>';
	}
	buf += '</select></div></div>';
}

if (!isLetsGo && (this.curTeam.gen === 7 || isNatDex || (isBDSP && species.baseSpecies === 'Unown'))) {
	buf += '<div class="formrow"><label class="formlabel" title="Hidden Power Type">Hidden Power:</label><div><select name="hptype" class="button">';
	buf += '<option value=""' + (!set.hpType ? ' selected="selected"' : '') + '>(automatic type)</option>'; // unset
	var types = Dex.types.all();
	for (var i = 0; i < types.length; i++) {
		if (types[i].HPivs) {
			buf += '<option value="' + types[i].name + '"' + (set.hpType === types[i].name ? ' selected="selected"' : '') + '>' + types[i].name + '</option>';
		}
	}
	buf += '</select></div></div>';
}

*/}
				{room.gen === 9 && <p>
					<label class="label" title="Tera Type">
						Tera Type: {}
						{species.forceTeraType ? (
							<select name="teratype" class="button cur" disabled><option>{species.forceTeraType}</option></select>
						) : (
							<select name="teratype" class="button" onChange={this.changeTera}>
								{Dex.types.all().map(type => (
									<option value={type.name} selected={(set.teraType || species.types[0]) === type.name}>
										{type.name}
									</option>
								))}
							</select>
						)}
					</label>
				</p>}
				{species.cosmeticFormes && <p>
					<button class="button">
						Change sprite
					</button>
				</p>}
			</div>
		</div>;
	}
}

PS.addRoomType(TeamPanel);
