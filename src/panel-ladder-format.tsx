/**
 * Ladder Format Panel
 *
 * Panel to display the Format's Ladder
 *
 * @author Adam Tran <aviettran@gmail.com>
 * @license MIT
 */

class LadderFormatRoom extends PSRoom {
	readonly classType: string = 'ladderformat';
	format: string = this.id.split('-')[1];
	searchValue: string = '';
	lastSearch: string = '';
	ladderData?: string;
	onSubmitSearch?: JSX.GenericEventHandler;
	onChangeSearch?: JSX.GenericEventHandler;

	setSearchValue = (searchValue: string) => {
		this.searchValue = searchValue;
		this.update(null);
	};
	setLastSearch = (lastSearch: string) => {
		this.lastSearch = lastSearch;
		this.update(null);
	};
	setLadderData = (ladderData: string | undefined) => {
		this.ladderData = ladderData;
		this.update(null);
	};
	requestLadderData = (searchValue?: string) => {
		const { teams } = PS;
		if (teams.usesLocalLadder) {
			this.setLadderData(undefined); // Loading...
			this.send(`/cmd laddertop ${this.format} ${toID(this.searchValue)}`);
		} else {
			this.setLadderData(undefined); // "Loading..."
			Net('/ladder.php').get({query: {
				format: this.format,
				server: Config.server.id.split(':')[0],
				output: 'html',
				prefix: toID(searchValue),
			}}).then(this.setLadderData);
		}
	};
}

class LadderFormatPanel extends PSRoomPanel<LadderFormatRoom> {
	componentDidMount() {
		const { room } = this.props;
		room.requestLadderData();
		this.subscriptions.push(room.subscribe((response: any) => {
			if (response) {
				const [ format, ladderData ] = response;
				if (room.selectedFormat === format) {
					room.ladderData = ladderData || '<p>Error getting ladder data from server</p>';
				}
			}
			this.forceUpdate();
		}));
		this.subscriptions.push(PS.teams.subscribe(() => {
			this.forceUpdate();
		}));
	}
	backToList = () => {
		const { room } = this.props;
		PS.removeRoom(room);
		PS.join('ladder' as RoomID);
	};
	initialize = () => {
		const { teams } = PS;
		const { room } = this.props;
		if (teams.usesLocalLadder) {
			room.setLadderData(undefined); // Loading...
			room.send(`/cmd laddertop ${room.format} ${toID(room.searchValue)}`);
		} else {
			room.requestLadderData();
		}
	};
	changeSearch = (e: Event) => {
		const { room } = this.props;
		room.setSearchValue((e.currentTarget as HTMLInputElement).value);
	};
	submitSearch = (e: Event) => {
		const { room } = this.props;
		e.preventDefault();
		room.setLastSearch(room.searchValue);
		room.requestLadderData(room.searchValue);
	};
	render() {
		const { room } = this.props;
		const { searchValue, lastSearch, onSubmitSearch, onChangeSearch } = room;
		const format = room.format;
		const ladderData = room.ladderData || '';
		return (
			<PSPanelWrapper room={room} scrollable>
				<div class="ladder pad">
					<p>
						<button onClick={this.backToList}>
							<i class="fa fa-chevron-left"></i> Format List
						</button>
					</p>
					<p>
						<button
							class="button"
							name="refresh"
							onClick={() => room.requestLadderData(lastSearch)}
						>
							<i class="fa fa-refresh"></i> Refresh
						</button>
						<form class="search" onSubmit={onSubmitSearch}>
							<input
								type="text"
								name="searchValue"
								class="textbox searchinput"
								value={BattleLog.escapeHTML(searchValue)}
								placeholder="username prefix"
								onChange={onChangeSearch}
							/>
							<button type="submit"> Search</button>
						</form>
					</p>
					<h3>
						{BattleLog.escapeFormat(format)} Top{" "}
						{BattleLog.escapeHTML(
							lastSearch ? `- '${lastSearch}'` : "500"
						)}
					</h3>
					<SanitizedHTML>{ladderData}</SanitizedHTML>
				</div>
			</PSPanelWrapper>
		);
	}
}

PS.roomTypes['ladderformat'] = {
	Model: LadderFormatRoom,
	Component: LadderFormatPanel,
};
PS.updateRoomTypes();
