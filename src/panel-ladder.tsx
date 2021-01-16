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
	constructor(options: RoomOptions) {
		super(options);
	}
}

interface LadderPanelState {
	showHelp: boolean,
	selectedFormat: string | null,
	searchValue: string,
	ladderData?: string
};

class LadderPanel extends PSRoomPanel<LadderRoom, LadderPanelState> {
	constructor() {
		super();
		this.state = { showHelp: false, selectedFormat: null, searchValue: '' }
	}
	subscription: PSSubscription | null = null;
	componentDidMount() {
		this.subscription = PS.teams.subscribe(() => {
			this.forceUpdate();
		});
	}
	componentWillUnmount() {
		if (this.subscription) {
			this.subscription.unsubscribe();
			this.subscription = null;
		}
	}
	componentDidUpdate(prevProps?: LadderRoom, prevState?: LadderPanelState) {
		const { selectedFormat } = this.state;
		if (selectedFormat !== null && selectedFormat !== prevState?.selectedFormat) {
			this.requestLadderData();
		}		
	}
	requestLadderData = () => {
		const { selectedFormat, searchValue } = this.state;
		this.setState( { ladderData: undefined }); // Back to "Loading..."
		$.get('/ladder.php', { // TO REVIEW: I imagine this may need to be changed to use PSLoginServer, but that does not have support for prepping GETs with query parameters
			format: selectedFormat,
			server: Config.server.id.split(':')[0],
			output: 'html',
			prefix: toID(searchValue)
		},
		this.setLadderData);
	}
	submitSearch = (e: Event) => {
		e.preventDefault();
		this.requestLadderData();
	}
	setLadderData = (ladderData: string | null) => ladderData !== null && this.setState({ ladderData });
	setShowHelp = (showHelp: boolean) => () => this.setState({ showHelp });
	setFormat = (selectedFormat: string | null) => () => this.setState({ selectedFormat });
	setSearchValue = (e: Event) => this.setState( { searchValue: (e.currentTarget as HTMLInputElement).value });
	Notice = () => {
		const { notice } = this.props.room;
		if (notice) {
			return <p><strong style="color:red">{notice}</strong></p>;
		}
		return null;
	}
	Help = () => {
		const { setShowHelp } = this;
		return <>
			<p><button name="selectFormat" onClick={setShowHelp(false)}><i class="fa fa-chevron-left"></i> Format List</button></p>
			<h3>How the ladder works</h3>
			<p>Our ladder displays three ratings: Elo, GXE, and Glicko-1.</p>
			<p><strong>Elo</strong> is the main ladder rating. It's a pretty normal ladder rating: goes up when you win and down when you lose.</p>
			<p><strong>GXE</strong> (Glicko X-Act Estimate) is an estimate of your win chance against an average ladder player.</p>
			<p><strong>Glicko-1</strong> is a different rating system. It has rating and deviation values.</p>
			<p>Note that win/loss should not be used to estimate skill, since who you play against is much more important than how many times you win or lose. Our other stats like Elo and GXE are much better for estimating skill.</p>
		</>
	}
	BattleFormatList = () => {
		const { setFormat } = this;
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
			formats.push(<li key={key} style="margin:5px"><button name="selectFormat" value={key} class="button" style="width:320px;height:30px;text-align:left;font:12pt Verdana" onClick={setFormat(key)}>{BattleLog.escapeFormat(format.id)}</button></li>)
		}
		return <>
			{sections}
		</>;
	}
	ShowFormatList = () => {
		const { Notice, BattleFormatList, setShowHelp } = this;
		return <>
			<p>See a user's ranking with <a class="button" href={`/${Config.routes.users}/`} target="_blank">User lookup</a></p>
			<Notice/>
			<p>(btw if you couldn't tell the ladder screens aren't done yet; they'll look nicer than this once I'm done.)</p>
			<p><button name="selectFormat" value="help" class="button" onClick={setShowHelp(true)}><i class="fa fa-info-circle"></i> How the ladder works</button></p>
			<BattleFormatList/>
		</>
	}
	FormatListButton = () => {
		const { setFormat } = this;
		return <button name="selectFormat" onClick={setFormat(null)}><i class="fa fa-chevron-left"></i> Format List</button>
	}
	ShowFormat = (props: { searchValue: string, ladderData: string | undefined }) => {
		const { send, teams } = PS;
		const { FormatListButton, submitSearch, setSearchValue, requestLadderData } = this;
		const selectedFormat = this.state.selectedFormat as string;
		const { searchValue, ladderData } = props;
		const prefix = toID(searchValue);
		if (teams.usesLocalLadder) {
			send('/cmd laddertop ' + selectedFormat + (prefix ? ' ,' + prefix : '')); // TO REVIEW: What does this do??
		} else if (ladderData !== undefined) {
			return <div class="ladder pad">
				<p><FormatListButton/></p><p><button class="button" name="refresh" onClick={requestLadderData}><i class="fa fa-refresh"></i> Refresh</button>
				<form class="search" onSubmit={submitSearch}><input type="text" name="searchValue" class="textbox searchinput" value={BattleLog.escapeHTML(searchValue)} placeholder="username prefix" onChange={setSearchValue} /><button type="submit"> Search</button></form></p>
				<h3>{BattleLog.escapeFormat(selectedFormat)} Top {BattleLog.escapeHTML(searchValue ? `- '${searchValue}'` : '500')}</h3>
			 	<div dangerouslySetInnerHTML={{__html: ladderData}}></div> 
			</div> // That's right, danger!
		}
		return <div class="ladder pad"><p><FormatListButton/></p><p><em>Loading...</em></p></div>
	}
	render() {
		const room = this.props.room;
		const { showHelp, selectedFormat, searchValue, ladderData } = this.state;
		const { Help, ShowFormatList, ShowFormat } = this;
		return <PSPanelWrapper room={room} scrollable>
			<div class="ladder pad">
				{showHelp && <Help/>}
				{!showHelp && selectedFormat === null && <ShowFormatList/>}
				{!showHelp && selectedFormat !== null && <ShowFormat searchValue={searchValue} ladderData={ladderData}/>}
			</div>
		</PSPanelWrapper>;
	}
}

PS.roomTypes['ladder'] = {
	Model: LadderRoom,
	Component: LadderPanel,
};
