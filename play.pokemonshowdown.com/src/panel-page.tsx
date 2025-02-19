/**
 * Page Panel
 *
 * Panel for static content and server-rendered HTML.
 *
 * @author Adam Tran <aviettran@gmail.com>
 * @license MIT
 */

import {PS, PSRoom, type RoomOptions} from "./client-main";
import {PSPanelWrapper, PSRoomPanel, SanitizedHTML} from "./panels";
import {BattleLog} from "./battle-log";
import type {Args} from "./battle-text-parser";

class PageRoom extends PSRoom {
	override readonly classType: string = 'html';
	readonly page?: string = this.id.split("-")[1];
	override readonly canConnect = true;

	loading: boolean = true;
	htmlData?: string;

	setHTMLData = (htmlData?: string) => {
		this.loading = false;
		this.htmlData = htmlData;
		this.update(null);
	};

	constructor(options: RoomOptions) {
		super(options);
		this.connect();
	}
	override connect() {
		if (!this.connected) {
			PS.send(`|/join ${this.id}`);
			this.connected = true;
			this.connectWhenLoggedIn = false;
		}
	}
}

function PageLadderHelp(props: {room: PageRoom}) {
	const {room} = props;
	return <div class="ladder pad">
		<p>
			<button name="selectFormat" data-href="ladder" data-target="replace">
				<i class="fa fa-chevron-left"></i> Format List
			</button>
		</p>
		<h3>How the ladder works</h3>
		<p>
			Our ladder displays three ratings: Elo, GXE, and Glicko-1.
		</p>
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
	</div>;
}

class PagePanel extends PSRoomPanel<PageRoom> {
	clientRooms: {[key: string]: JSX.Element} = {'ladderhelp': <PageLadderHelp room={this.props.room}/>};

	/**
	 * @return true to prevent line from being sent to server
	 */
	override receiveLine(args: Args) {
		const {room} = this.props;
		switch (args[0]) {
		case 'title':
			room.title = args[1];
			PS.update();
			return true;
		case 'tempnotify': {
			const [, id, title, body] = args;
			room.notify({title, body, id});
			return true;
		}
		case 'tempnotifyoff': {
			const [, id] = args;
			room.dismissNotification(id);
			return true;
		}
		case 'selectorhtml':
			const pageHTMLContainer = this.base!.querySelector('.page-html-container');
			const selectedElement = pageHTMLContainer?.querySelector(args[1]);
			if (!selectedElement) return;
			selectedElement.innerHTML = BattleLog.sanitizeHTML(args.slice(2).join('|'));
			room.isSubtleNotifying = true;
			return true;
		case 'noinit':
			if (args[1] === 'namerequired') {
				room.setHTMLData(args[2]);
			}
			return true;
		case 'pagehtml':
			room.setHTMLData(args[1]);
			return true;
		}
	}
	override render() {
		const {room} = this.props;
		let renderPage;
		if (room.page !== undefined && this.clientRooms[room.page]) {
			renderPage = this.clientRooms[room.page];
		} else {
			if (room.loading) {
				renderPage = <p>Loading...</p>;
			} else {
				renderPage = <div class="page-html-container">
					<SanitizedHTML>{room.htmlData || ''}</SanitizedHTML>
				</div>;
			}
		}
		return <PSPanelWrapper room={room} scrollable>
			{renderPage}
		</PSPanelWrapper>;
	}
}

PS.roomTypes['html'] = {
	Model: PageRoom,
	Component: PagePanel,
};
PS.updateRoomTypes();
