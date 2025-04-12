/**
 * Page Panel
 *
 * Panel for static content and server-rendered HTML.
 *
 * @author Adam Tran <aviettran@gmail.com>
 * @license MIT
 */

import { PS, PSRoom, type RoomOptions } from "./client-main";
import { PSPanelWrapper, PSRoomPanel, SanitizedHTML } from "./panels";
import { BattleLog } from "./battle-log";
import type { Args } from "./battle-text-parser";

class PageRoom extends PSRoom {
	override readonly classType: string = 'html';
	readonly page?: string = this.id.split("-")[1];
	override readonly canConnect = true;

	loading = true;
	htmlData?: string;

	setHTMLData = (htmlData?: string) => {
		this.loading = false;
		this.htmlData = htmlData;
		this.update(null);
	};

	constructor(options: RoomOptions) {
		super(options);
		this.connect();
		this.title = this.id.split('-')[1];
	}
	override connect() {
		if (!this.connected && !PagePanel.clientRooms.hasOwnProperty(this.id.split('-')[1])) {
			PS.send(`|/join ${this.id}`);
			this.connected = true;
			this.connectWhenLoggedIn = false;
		}
	}
}

function PageLadderHelp() {
	return <div class="ladder pad">
		<p>
			<button class="button" data-href="/ladder" data-target="replace">
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
			<strong>Glicko-1</strong> is {}
			<a href="https://en.wikipedia.org/wiki/Glicko_rating_system">another rating system</a>.
			It has rating and deviation values.
		</p>
		<p>
			<strong>COIL</strong> (Converging Order Invariant Ladder) is
			used for suspect tests. The more games you play, the closer
			it will get to your GXE &times; 4000. How fast it reaches
			GXE &times; 4000 depends on {}
			<a href="https://www.smogon.com/forums/threads/reintroducing-coil.3747719/" target="_blank">a custom B value</a> {}
			which is different for each suspect test.
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
	static readonly id = 'html';
	static readonly routes = ['view-*'];
	static readonly Model = PageRoom;
	static clientRooms: { [key: string]: JSX.Element } = { 'ladderhelp': <PageLadderHelp /> };

	/**
	 * @return true to prevent line from being sent to server
	 */
	override receiveLine(args: Args) {
		const { room } = this.props;
		switch (args[0]) {
		case 'title':
			room.title = args[1];
			PS.update();
			return true;
		case 'tempnotify': {
			const [, id, title, body] = args;
			room.notify({ title, body, id });
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
			room.subtleNotify();
			return true;
		case 'noinit':
			if (args[1] === 'namerequired') {
				room.setHTMLData(args[2]);
			}
			return true;
		case 'pagehtml':
			room.setHTMLData(args[1]);
			room.subtleNotify();
			return true;
		}
	}
	override render() {
		const { room } = this.props;
		let renderPage;
		if (room.page !== undefined && PagePanel.clientRooms[room.page]) {
			renderPage = PagePanel.clientRooms[room.page];
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

PS.addRoomType(PagePanel);
