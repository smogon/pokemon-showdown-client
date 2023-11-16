/**
 * Teambuilder team panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

class TeamRoom extends PSRoom {
	team: Team | null = null;
}

class TeamTextbox extends preact.Component<{team: Team}> {
	setInfo: {
		species: string,
		bottomY: number,
	}[] = [];
	sets: PokemonSet[] = [];
	textbox: HTMLTextAreaElement = null!;
	heightTester: HTMLTextAreaElement = null!;
	activeType: 'pokemon' | 'move' | 'item' | 'ability' | '' = '';
	activeOffsetY = -1;
	activeSetIndex = -1;
	search = new DexSearch();
	getYAt(index: number, value: string) {
		if (index < 0) return 10;
		this.heightTester.value = value.slice(0, index);
		return this.heightTester.scrollHeight;
	}
	input = () => this.update();
	select = () => this.update(true);
	closeMenu = () => {
		this.activeType = '';
		this.forceUpdate();
		this.textbox.focus();
	};
	update = (cursorOnly?: boolean) => {
		const textbox = this.textbox;
		this.heightTester.style.width = `${textbox.offsetWidth}px`;
		const value = textbox.value;

		let index = 0;
		let setIndex = -1;
		if (!cursorOnly) this.setInfo = [];
		this.activeOffsetY = -1;
		this.activeSetIndex = -1;
		this.activeType = '';

		const selectionStart = textbox.selectionStart || 0;
		const selectionEnd = textbox.selectionEnd || 0;

		/** 0 = set top, 1 = set middle */
		let parseState: 0 | 1 = 0;
		while (index < value.length) {
			let nlIndex = value.indexOf('\n', index);
			if (nlIndex < 0) nlIndex = value.length;
			const line = value.slice(index, nlIndex).trim();

			if (!line) {
				parseState = 0;
				index = nlIndex + 1;
				continue;
			}

			if (parseState === 0 && index && !cursorOnly) {
				this.setInfo[this.setInfo.length - 1].bottomY = this.getYAt(index - 1, value);
			}

			if (parseState === 0) {
				if (!cursorOnly) {
					const atIndex = line.indexOf('@');
					let species = atIndex >= 0 ? line.slice(0, atIndex).trim() : line;
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
					});
				}
				parseState = 1;
				setIndex++;
			}

			const selectionEndCutoff = (selectionStart === selectionEnd ? nlIndex : nlIndex + 1);
			if (index <= selectionStart && selectionEnd <= selectionEndCutoff) {
				// both ends within range
				this.activeOffsetY = this.getYAt(index - 1, value);
				this.activeSetIndex = setIndex;

				const lcLine = line.toLowerCase().trim();
				if (lcLine.startsWith('ability:')) {
					this.activeType = 'ability';
				} else if (lcLine.startsWith('-')) {
					this.activeType = 'move';
				} else if (
					!lcLine || lcLine.startsWith('ivs:') || lcLine.startsWith('evs:') ||
					lcLine.startsWith('level:') || lcLine.startsWith('gender:') ||
					lcLine.endsWith(' nature') || lcLine.startsWith('shiny:')
				) {
					// leave activeType blank
				} else {
					this.activeType = 'pokemon';
					const atIndex = line.indexOf('@');
					if (atIndex >= 0 && selectionStart > index + atIndex) {
						this.activeType = 'item';
					}
				}
				this.search.setType(this.activeType, 'gen8ou' as ID, this.sets[setIndex]);
				this.search.find('');
				window.search = this.search;
			}

			index = nlIndex + 1;
		}
		if (!cursorOnly) {
			const bottomY = this.getYAt(value.length, value);
			if (this.setInfo.length) {
				this.setInfo[this.setInfo.length - 1].bottomY = bottomY;
			}

			textbox.style.height = `${bottomY + 100}px`;
			this.save();
		}
		this.forceUpdate();
	};
	save() {
		const sets = PSTeambuilder.importTeam(this.textbox.value);
		this.props.team.packedTeam = PSTeambuilder.packTeam(sets);
		this.props.team.iconCache = null;
		PS.teams.save();
	}
	componentDidMount() {
		this.textbox = this.base!.getElementsByClassName('teamtextbox')[0] as HTMLTextAreaElement;
		this.heightTester = this.base!.getElementsByClassName('heighttester')[0] as HTMLTextAreaElement;

		this.sets = PSTeambuilder.unpackTeam(this.props.team.packedTeam);
		const exportedTeam = PSTeambuilder.exportTeam(this.sets);
		this.textbox.value = exportedTeam;
		this.update();
	}
	componentWillUnmount() {
		this.textbox = null!;
		this.heightTester = null!;
	}
	render() {
		return <div class="teameditor">
			<textarea class="textbox teamtextbox" onInput={this.input} onSelect={this.select} onClick={this.select} onKeyUp={this.select} />
			<textarea
				class="textbox teamtextbox heighttester" style="visibility:hidden" tabIndex={-1} aria-hidden={true}
			/>
			<div class="teamoverlays">
				{this.setInfo.slice(0, -1).map(info =>
					<hr style={`top:${info.bottomY - 18}px`} />
				)}
				{this.setInfo.map((info, i) => {
					if (!info.species) return null;
					const prevOffset = i === 0 ? 8 : this.setInfo[i - 1].bottomY;
					const species = info.species;
					const num = Dex.getPokemonIconNum(toID(species));
					if (!num) return null;

					const top = Math.floor(num / 12) * 30;
					const left = (num % 12) * 40;
					const iconStyle = `background:transparent url(${Dex.resourcePrefix}sprites/pokemonicons-sheet.png) no-repeat scroll -${left}px -${top}px`;

					return <span class="picon" style={
						`top:${prevOffset + 1}px;left:50px;position:absolute;${iconStyle}`
					}></span>;
				})}
				{this.activeOffsetY >= 0 &&
					<div class="teaminnertextbox" style={{top: this.activeOffsetY - 1}}></div>
				}
			</div>
			{this.activeType && <div class="searchresults" style={{top: this.activeSetIndex >= 0 ? this.setInfo[this.activeSetIndex].bottomY - 12 : 0}}>
				<button class="button closesearch" onClick={this.closeMenu}><i class="fa fa-times"></i> Close</button>
				<PSSearchResults search={this.search} />
			</div>}
		</div>;
	}
}

class TeamPanel extends PSRoomPanel<TeamRoom> {
	rename = (e: Event) => {
		const textbox = e.currentTarget as HTMLInputElement;
		const room = this.props.room;

		room.team!.name = textbox.value.trim();
		PS.teams.save();
	};
	render() {
		const room = this.props.room;
		const team = PS.teams.byKey[room.id.slice(5)];
		if (!team) {
			return <PSPanelWrapper room={room}>
				<button class="button" data-href="teambuilder" data-target="replace">
					<i class="fa fa-chevron-left"></i> List
				</button>
				<p class="error">
					Team doesn't exist
				</p>
			</PSPanelWrapper>;
		}

		if (!room.team) room.team = team;
		return <PSPanelWrapper room={room} scrollable>
			<div class="pad">
				<button class="button" data-href="teambuilder" data-target="replace">
					<i class="fa fa-chevron-left"></i> List
				</button>
				<label class="label teamname">
					Team name:
					<input class="textbox" type="text" value={team.name} onInput={this.rename} onChange={this.rename} onKeyUp={this.rename} />
				</label>
				<TeamTextbox team={team} />
			</div>
		</PSPanelWrapper>;
	}
}

PS.roomTypes['team'] = {
	Model: TeamRoom,
	Component: TeamPanel,
	title: "Team",
};
PS.updateRoomTypes();
