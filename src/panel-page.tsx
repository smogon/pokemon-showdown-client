/**
 * Page Panel
 *
 * Panel for static content and server-rendered HTML.
 *
 * @author Adam Tran <aviettran@gmail.com>
 * @license MIT
 */

class PageRoom extends PSRoom {
	readonly classType: string = 'html';
	readonly page?: string = this.id.split("-")[1];
	readonly canConnect = true;

	loading: boolean = true;
	htmlData?: string;

	setHtmlData = (htmlData?: string) => {
		this.loading = false;
		this.htmlData = htmlData;
		this.update(null);
	};

	constructor(options: RoomOptions) {
		super(options);
		this.connect();
	}
	connect() {
		if (!this.connected) {
			PS.send(`|/join ${this.id}`);
			this.connected = true;
			this.connectWhenLoggedIn = false;
		}
	}
}

function PageNotFound() {
	// Future development: server-rendered HTML panels
	return <p>Page not found</p>;
}

function PageLadderHelp(props: { room: PageRoom }) {
	const { room } = props;
	return (
		<div class="ladder pad">
			<p>
				<button name="selectFormat" onClick={LadderBackToFormatList(room)}>
					<i class="fa fa-chevron-left"></i> Format List
				</button>
			</p>
			<h3>How the ladder works</h3>
			<p>Our ladder displays three ratings: Elo, GXE, and Glicko-1.</p>
			<p>
				<strong>Elo</strong> is the main ladder rating. It's a pretty
				normal ladder rating: goes up when you win and down when you
				lose.
			</p>
			<p>
				<strong>GXE</strong> (Glicko X-Act Estimate) is an estimate of
				your win chance against an average ladder player.
			</p>
			<p>
				<strong>Glicko-1</strong> is a different rating system. It has
				rating and deviation values.
			</p>
			<p>
				Note that win/loss should not be used to estimate skill, since
				who you play against is much more important than how many times
				you win or lose. Our other stats like Elo and GXE are much better
				for estimating skill.
			</p>
		</div>
	);
}

function PageServerHtml(props: { room: PageRoom }) {
	const { room } = props;
	if (room.loading) {
		return <p>Loading...</p>;
	} else {
		return <SanitizedHTML>{room.htmlData || ''}</SanitizedHTML>;
	}
}

class PagePanel extends PSRoomPanel<PageRoom> {
	clientRooms: { [key: string]: JSX.Element } = { 'ladderhelp': <PageLadderHelp room={this.props.room}/> };

	/**
	 * @return true to prevent line from being sent to server
	 */
	receiveLine(args: Args) {
		const { room } = this.props;
		switch (args[0]) {
		case 'noinit':
			if (args[1] === 'namerequired') {
				room.setHtmlData(args[2]);
			}
			return true;
		case 'pagehtml':
			room.setHtmlData(args[1]);
			return true;
		}
	}
	render() {
		const { room } = this.props;
		const RenderPage = () => {
			if (room.page !== undefined && this.clientRooms[room.page]) {
				return this.clientRooms[room.page];
			} else {
				return <PageServerHtml room={room}/>;
			}
		};
		return (
			<PSPanelWrapper room={room} scrollable>
				<RenderPage />
			</PSPanelWrapper>
		);
	}
}

PS.roomTypes['html'] = {
	Model: PageRoom,
	Component: PagePanel,
};
PS.updateRoomTypes();
