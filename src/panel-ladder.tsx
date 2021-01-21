/**
 * Ladder Panel
 *
 * Panel for ladder formats and associated ladder tables.
 *
 * @author Adam Tran <aviettran@gmail.com>
 * @license MIT
 */

class LadderRoom extends PSRoom {
	readonly classType: string = 'ladder';
	readonly notice?: string;
	showHelp: boolean = false;

	setShowHelp = (showHelp: boolean) => {
		this.showHelp = showHelp;
		this.update(null);
	};
}

class LadderPanel extends PSRoomPanel<LadderRoom> {
	componentDidMount() {
		const { room } = this.props;
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
	static Notice =  (props: { notice: string | undefined }) => {
		const { notice } = props;
		if (notice) {
			return <p><strong style="color:red">{notice}</strong></p>;
		}
		return null;
	};
	static Help = (props: { onClick: JSX.MouseEventHandler }) => {
		const { onClick } = props;
		return <>
			<p><button name="selectFormat" onClick={onClick}><i class="fa fa-chevron-left"></i> Format List</button></p>
			<h3>How the ladder works</h3>
			<p>Our ladder displays three ratings: Elo, GXE, and Glicko-1.</p>
			<p><strong>Elo</strong> is the main ladder rating. It's a pretty normal ladder rating: goes up when you win and down when you lose.</p>ã
			<p><strong>GXE</strong> (Glicko X-Act Estimate) is an estimate of your win chance against an average ladder player.</p>
			<p><strong>Glicko-1</strong> is a different rating system. It has rating and deviation values.</p>
			<p>Note that win/loss should not be used to estimate skill, since who you play against is much more important than how many times you win or lose. Our other stats like Elo and GXE are much better for estimating skill.</p>
		</>;
	};
	static BattleFormatList = (props: { room: LadderRoom }) => {
		const onClick = (key: string) => () => PS.join(`ladderformat-${key}` as RoomID);
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
			formats.push(<li key={key} style="margin:5px"><button name="selectFormat" value={key} class="button" style="width:320px;height:30px;text-align:left;font:12pt Verdana" onClick={onClick(key)}>{BattleLog.escapeFormat(format.id)}</button></li>);
		}
		return <>
			{sections}
		</>;
	};
	static ShowFormatList = (props: { room: LadderRoom, onSelectFormat: JSX.MouseEventHandler }) => {
		const { room, onSelectFormat } = props;
		return <>
			<p>See a user's ranking with <a class="button" href={`/${Config.routes.users}/`} target="_blank">User lookup</a></p>
			<LadderPanel.Notice notice={room.notice}/>
			<p>(btw if you couldn't tell the ladder screens aren't done yet; they'll look nicer than this once I'm done.)</p>
			<p><button name="selectFormat" value="help" class="button" onClick={onSelectFormat}><i class="fa fa-info-circle"></i> How the ladder works</button></p>
			<LadderPanel.BattleFormatList room={room}/>
		</>;
	};
	render() {
		const { room } = this.props;
		return <PSPanelWrapper room={room} scrollable>
			<div class="ladder pad">
				{room.showHelp && <LadderPanel.Help onClick={() => room.setShowHelp(false)}/>}
				{!room.showHelp && room.selectedFormat === undefined && <LadderPanel.ShowFormatList room={room} onSelectFormat={() => room.setShowHelp(true)}/>}
			</div>
		</PSPanelWrapper>;
	}
}

PS.roomTypes['ladder'] = {
	Model: LadderRoom,
	Component: LadderPanel,
};
PS.updateRoomTypes();
