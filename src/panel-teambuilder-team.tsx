/**
 * Teambuilder team panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

class TeamTextbox extends preact.Component<{sets: PokemonSet[]}> {
	setInfo: {
		species: string,
		bottomY: number,
	}[] = [];
	textbox: HTMLTextAreaElement = null!;
	heightTester: HTMLTextAreaElement = null!;
	activeType: 'pokemon' | 'move' | 'item' | 'ability' | '' = '';
	activeOffsetY = -1;
	search = new BattleSearch();
	getYAt(index: number, value: string) {
		if (index < 0) return 10;
		this.heightTester.value = value.slice(0, index);
		return this.heightTester.scrollHeight;
	}
	input = () => this.update();
	select = () => this.update(true);
	update = (cursorOnly?: boolean) => {
		const textbox = this.textbox;
		this.heightTester.style.width = `${textbox.offsetWidth}px`;
		const value = textbox.value;

		let index = 0;
		let setIndex = -1;
		if (!cursorOnly) this.setInfo = [];
		this.activeOffsetY = -1;
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
				}
				this.search.setType(this.activeType, 'gen7ou' as ID, this.props.sets[setIndex]);
				this.search.find('');
			}

			index = nlIndex + 1;
		}
		if (!cursorOnly) {
			const bottomY = this.getYAt(value.length, value);
			if (this.setInfo.length) {
				this.setInfo[this.setInfo.length - 1].bottomY = bottomY;
			}

			textbox.style.height = `${bottomY + 100}px`;
		}
		this.forceUpdate();
	};
	componentDidMount() {
		this.textbox = this.base!.getElementsByClassName('teamtextbox')[0] as HTMLTextAreaElement;
		this.heightTester = this.base!.getElementsByClassName('heighttester')[0] as HTMLTextAreaElement;

		const exportedTeam = PSTeambuilder.exportTeam(this.props.sets);
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
			{this.activeType && <PSSearchResults search={this.search} />}
		</div>;
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
			<div class="pad">
				<button class="button" onClick={this.backToList}>
					<i class="fa fa-chevron-left"></i> List
				</button>
				<h2>
					{team.name}
				</h2>
				<TeamTextbox sets={sets} />
			</div>
		</PSPanelWrapper>;
	}
}

PS.roomTypes['team'] = {
	Component: TeamPanel,
	title: "Team",
};
PS.updateRoomTypes();
