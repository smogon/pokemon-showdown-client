/**
 * Ladder Panel
 *
 * Panel for ladder formats and associated ladder tables.
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

class LadderRoom extends PSRoom {
	readonly classType: string = 'ladder';
	readonly notice?: string;
	ladderData?: string;
	selectedFormat?: string;

	constructor(options: RoomOptions) {
		super(options);
	}
	setLadderData = (ladderData: string | undefined) => {
		if (ladderData !== undefined) {
			this.ladderData = ladderData;
		}
		this.update(null);
	};
	setFormat = (selectedFormat: string | undefined) => {
		const { teams } = PS;
		this.selectedFormat = selectedFormat;
		if (selectedFormat !== undefined) {
			if (teams.usesLocalLadder) {
				this.setLadderData(undefined);
				this.send(`/cmd laddertop ${selectedFormat} ${toID(this.searchValue)}`);
			} else {
				this.requestLadderData();
			}
		} else {
			this.update(null);
		}
	};
	requestLadderData = (searchValue?: string) => {
		this.setLadderData(undefined); // Back to "Loading..."
		$.get('/ladder.php', { // TO REVIEW: I imagine this may need to be changed to use PSLoginServer, but that does not have support for prepping GETs with query parameters
			format: this.selectedFormat,
			server: Config.server.id.split(':')[0],
			output: 'html',
			prefix: toID(searchValue),
		},
		this.setLadderData);
	};
}

interface LadderPanelState {
	showHelp: boolean;
	searchValue: string;
}

class LadderPanel extends PSRoomPanel<LadderRoom, LadderPanelState> {
	constructor() {
		super();
		this.state = { showHelp: false, searchValue: '' };
	}
	subscriptions: PSSubscription[] = [];
	componentDidMount = () => {
		const { room } = this.props;
		this.subscriptions.push(room.subscribe(() => {
			this.forceUpdate();
		}));
		this.subscriptions.push(PS.teams.subscribe(() => {
			this.forceUpdate();
		}));
	};
	componentWillUnmount() {
		for (const subscription of this.subscriptions) {
			subscription.unsubscribe();
		}
		this.subscriptions = [];
	}
	setShowHelp = (showHelp: boolean) => () => this.setState({ showHelp });
	setSearchValue = (e: Event) => this.setState({ searchValue: (e.currentTarget as HTMLInputElement).value });
	handleSetFormat = (selectedFormat?: string) => () => {
		this.props.room.setFormat(selectedFormat);
	};
	handleRequestLadderData = () => this.props.room.requestLadderData;
	submitSearch = (e: Event) => {
		const { room } = this.props;
		const { searchValue } = this.state;
		e.preventDefault();
		room.requestLadderData(searchValue);
	};
	Notice = () => {
		const { room } = this.props;
		if (room.notice) {
			return <p><strong style="color:red">{room.notice}</strong></p>;
		}
		return null;
	};
	Help = () => {
		return <>
			<p><button name="selectFormat" onClick={this.setShowHelp(false)}><i class="fa fa-chevron-left"></i> Format List</button></p>
			<h3>How the ladder works</h3>
			<p>Our ladder displays three ratings: Elo, GXE, and Glicko-1.</p>
			<p><strong>Elo</strong> is the main ladder rating. It's a pretty normal ladder rating: goes up when you win and down when you lose.</p>
			<p><strong>GXE</strong> (Glicko X-Act Estimate) is an estimate of your win chance against an average ladder player.</p>
			<p><strong>Glicko-1</strong> is a different rating system. It has rating and deviation values.</p>
			<p>Note that win/loss should not be used to estimate skill, since who you play against is much more important than how many times you win or lose. Our other stats like Elo and GXE are much better for estimating skill.</p>
		</>;
	};
	BattleFormatList = () => {
		if (!BattleFormats) {
			return <p>Loading...</p>;
		}
		let currentSection: string = '';
		let sections: JSX.Element[] = [];
		let formats: JSX.Element[] = [];
		for (const [key, format] of Object.entries(BattleFormats)) {
			if (!format.rated || !format.searchShow) continue;
			if (format.section !== currentSection) {
				if (formats.length > 0) {
					sections.push(<preact.Fragment key={currentSection}><h3>{currentSection}</h3><ul style="list-style:none;margin:0;padding:0">{formats}</ul></preact.Fragment>);
					formats = [];
				}
				currentSection = format.section;
			}
			formats.push(<li key={key} style="margin:5px"><button name="selectFormat" value={key} class="button" style="width:320px;height:30px;text-align:left;font:12pt Verdana" onClick={this.handleSetFormat(key)}>{BattleLog.escapeFormat(format.id)}</button></li>);
		}
		return <>
			{sections}
		</>;
	};
	ShowFormatList = () => {
		return <>
			<p>See a user's ranking with <a class="button" href={`/${Config.routes.users}/`} target="_blank">User lookup</a></p>
			<this.Notice/>
			<p>(btw if you couldn't tell the ladder screens aren't done yet; they'll look nicer than this once I'm done.)</p>
			<p><button name="selectFormat" value="help" class="button" onClick={this.setShowHelp(true)}><i class="fa fa-info-circle"></i> How the ladder works</button></p>
			<this.BattleFormatList/>
		</>;
	};
	FormatListButton = () => {
		return <button name="selectFormat" onClick={this.handleSetFormat(undefined)}><i class="fa fa-chevron-left"></i> Format List</button>;
	};
	ShowFormat = (props: { searchValue: string}) => {
		const { room } = this.props;
		const { searchValue } = props;
		const selectedFormat = room.selectedFormat as string;
		const { teams } = PS;
		if (room.ladderData === undefined) {
			return <div class="ladder pad"><p><this.FormatListButton/></p><p><em>Loading...</em></p></div>;
		} else if (teams.usesLocalLadder) {
			return <div class="ladder pad">
				<p><this.FormatListButton/></p>
				<div dangerouslySetInnerHTML={{__html: room.ladderData}}></div>
			</div>;
		}
		return <div class="ladder pad">
			<p><this.FormatListButton/></p><p><button class="button" name="refresh" onClick={this.handleRequestLadderData}><i class="fa fa-refresh"></i> Refresh</button>
			<form class="search" onSubmit={this.submitSearch}><input type="text" name="searchValue" class="textbox searchinput" value={BattleLog.escapeHTML(searchValue)} placeholder="username prefix" onChange={this.setSearchValue} /><button type="submit"> Search</button></form></p>
			<h3>{BattleLog.escapeFormat(selectedFormat)} Top {BattleLog.escapeHTML(searchValue ? `- '${searchValue}'` : '500')}</h3>
			<div dangerouslySetInnerHTML={{__html: room.ladderData}}></div>
		</div>; // That's right, danger!
	};
	render() {
		const room = this.props.room;
		const { showHelp, searchValue } = this.state;
		return <PSPanelWrapper room={room} scrollable>
			<div class="ladder pad">
				{showHelp && <this.Help/>}
				{!showHelp && room.selectedFormat === undefined && <this.ShowFormatList/>}
				{!showHelp && room.selectedFormat !== undefined && <this.ShowFormat searchValue={searchValue}/>}
			</div>
		</PSPanelWrapper>;
	}
}

PS.roomTypes['ladder'] = {
	Model: LadderRoom,
	Component: LadderPanel,
};
PS.updateRoomTypes();
