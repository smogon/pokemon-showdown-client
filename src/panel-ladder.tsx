/**
 * Ladder Panel
 *
 * Panel for Ladder Formats and associated ladder tables.
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

class LadderPanel extends PSRoomPanel<LadderRoom> {
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
	// Function Components
	Notice = () => {
		const { notice } = this.props.room;
		if (notice) {
			return <p><strong style="color:red">{notice}</strong></p>;
		}
		return null;
	}
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
					sections.push(<><h3>{currentSection}</h3><ul style="list-style:none;margin:0;padding:0">{formats}</ul></>); // The key needs to be added to this Fragment (key=currentSection)
					formats = [];
				}
				currentSection = format.section;
			}
			formats.push(<li key={key} style="margin:5px"><button name="selectFormat" value={key} class="button" style="width:320px;height:30px;text-align:left;font:12pt Verdana">{BattleLog.escapeFormat(format.id)}</button></li>)
		}
		return <>
			{sections}
		</>;
	}
	render() {
		const room = this.props.room;
		const { Notice, BattleFormatList } = this;
		return <PSPanelWrapper room={room}>
			<div class="ladder pad">
				<p>See a user's ranking with <a class="button" href={`/${Config.routes.users}/`} target="_blank">User lookup</a></p>
				<Notice/>
				<p>(btw if you couldn't tell the ladder screens aren't done yet; they'll look nicer than this once I'm done.)</p>
				<p><button name="selectFormat" value="help" class="button"><i class="fa fa-info-circle"></i> How the ladder works</button></p>
				<BattleFormatList/>
			</div>
		</PSPanelWrapper>;
	}
}

PS.roomTypes['ladder'] = {
	Model: LadderRoom,
	Component: LadderPanel,
};
