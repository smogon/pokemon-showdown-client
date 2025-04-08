/**
 * Ladder Panel
 *
 * Panel for ladder formats and associated ladder tables.
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>, Adam Tran <aviettran@gmail.com>
 * @license MIT
 */

import preact from "../js/lib/preact";
import { PS, PSRoom } from "./client-main";
import { Net } from "./client-connection";
import { PSPanelWrapper, PSRoomPanel } from "./panels";
import { BattleLog } from "./battle-log";
import { toID, type ID } from "./battle-dex";

type LadderData = {
	formatid: ID,
	format: string,
	toplist: {
		userid: ID,
		username: string,
		w: number,
		l: number,
		t: number,
		gxe: number,
		r: number,
		rd: number,
		sigma: number,
		rptime: number,
		rpr: number,
		rprd: number,
		rpsigma: number,
		elo: number,
		first_played: number | null,
		last_played: number | null,
		coil?: number,
	}[],
};

export class LadderRoom extends PSRoom {
	override readonly classType: string = 'ladder';
	readonly format?: string = this.id.split('-')[1];
	notice?: string;
	searchValue = '';
	loading = false;
	error?: string;
	ladderData?: LadderData;

	constructor(options: any) {
		super(options);
		if (this.format) this.title = BattleLog.formatName(this.format);
	}

	setNotice = (notice: string) => {
		this.notice = notice;
		this.update(null);
	};
	setSearchValue = (searchValue: string) => {
		this.searchValue = searchValue;
		this.update(null);
	};
	setError = (error: Error) => {
		this.loading = false;
		this.error = error.message;
		this.update(null);
	};
	setLadderData = (ladderData: string | undefined) => {
		this.loading = false;
		if (ladderData) {
			this.ladderData = JSON.parse(ladderData);
		} else {
			this.ladderData = undefined;
		}
		this.update(null);
	};
	requestLadderData = (searchValue: string) => {
		if (!this.format) return;
		this.searchValue = searchValue;
		this.loading = true;
		if (PS.teams.usesLocalLadder) {
			this.send(`/cmd laddertop ${this.format} ${toID(this.searchValue)}`);
		} else if (this.format !== undefined) {
			Net(`//pokemonshowdown.com/ladder/${this.format}.json`)
				.get({
					query: {
						prefix: toID(searchValue),
					},
				})
				.then(this.setLadderData)
				.catch(this.setError);
		}
		this.update(null);
	};
}

class LadderFormat extends preact.Component<{ room: LadderRoom }> {
	changeSearch = (e: Event) => {
		e.preventDefault();
		this.props.room.requestLadderData(this.base!.querySelector<HTMLInputElement>('input[name=searchValue]')!.value);
	};
	renderHeader() {
		const room = this.props.room;
		if (!PS.teams.usesLocalLadder) {
			return <h3>
				{BattleLog.formatName(room.format!)} Top
				{room.searchValue ? ` - '${room.searchValue}'` : " 500"}
			</h3>;
		}
		return null;
	}
	renderSearch() {
		if (!PS.teams.usesLocalLadder) {
			const room = this.props.room;
			return <form class="search" onSubmit={this.changeSearch}><p>
				<input
					type="text"
					name="searchValue"
					class="textbox searchinput"
					value={BattleLog.escapeHTML(room.searchValue)}
					placeholder="username prefix"
					onChange={this.changeSearch}
				/> {}
				<button type="submit" class="button">Search</button>
			</p></form>;
		}
		return null;
	}
	renderTable() {
		const room = this.props.room;

		if (room.loading || !BattleFormats) {
			return <p>Loading...</p>;
		} else if (room.error !== undefined) {
			return <p>Error: {room.error}</p>;
		} else if (!room.ladderData) {
			return null;
		}
		const showCOIL = room.ladderData?.toplist[0]?.coil !== undefined;

		return <table class="table readable-bg">
			<tr class="table-header">
				<th></th>
				<th>Name</th>
				<th style={{ textAlign: 'center' }}><abbr title="Elo rating">Elo</abbr></th>
				<th style={{ textAlign: 'center' }}>
					<abbr title="user's percentage chance of winning a random battle (Glicko X-Act Estimate)">GXE</abbr>
				</th>
				<th style={{ textAlign: 'center' }}>
					<abbr title="Glicko-1 rating system: rating&plusmn;deviation (provisional if deviation>100)">Glicko-1</abbr>
				</th>
				{showCOIL && <th style={{ textAlign: 'center' }}>COIL</th>}
			</tr>
			{room.ladderData.toplist.map((row, i) => <tr>
				<td style={{ textAlign: 'right' }}>
					{i < 3 && <i class="fa fa-trophy" style={{ color: ['#d6c939', '#adb2bb', '#ca8530'][i] }}></i>} {i + 1}
				</td>
				<td><span
					class="username no-interact" style={{
						fontWeight: i < 10 ? 'bold' : 'normal', color: BattleLog.usernameColor(row.userid),
					}}
				>
					{row.username}
				</span></td>
				<td style={{ textAlign: 'center' }}><strong>{row.elo.toFixed(0)}</strong></td>
				<td style={{ textAlign: 'center' }}>{row.gxe.toFixed(1)}<small>%</small></td>
				<td style={{ textAlign: 'center' }}><em>{row.rpr.toFixed(0)}<small> &plusmn; {row.rprd.toFixed(0)}</small></em></td>
				{showCOIL && <td style={{ textAlign: 'center' }}>{row.coil?.toFixed(0)}</td>}
			</tr>)}
			{!room.ladderData.toplist.length && <tr><td colSpan={5}>
				<em>No one has played any ranked games yet.</em>
			</td></tr>}
		</table>;
	}
	renderFormat() {
		return <>
			<p>
				<button class="button" data-href="ladder" data-target="replace">
					<i class="fa fa-refresh"></i> Refresh
				</button> <a class="button" href="/view-seasonladder-gen9randombattle">
					<i class="fa fa-trophy"></i> Seasonal rankings
				</a>
				{this.renderSearch()}
			</p>
			{this.renderHeader()}
			{this.renderTable()}
		</>;
	};
	override render() {
		return <div class="ladder pad">
			<p>
				<button class="button" data-href="ladder" data-target="replace">
					<i class="fa fa-chevron-left"></i> Format List
				</button>
			</p>
			{this.renderFormat()}
		</div>;
	}
}

class LadderPanel extends PSRoomPanel<LadderRoom> {
	static readonly id = 'ladder';
	static readonly routes = ['ladder', 'ladder-*'];
	static readonly Model = LadderRoom;
	static readonly icon = <i class="fa fa-list-ol"></i>;
	static readonly title = 'Ladder';
	override componentDidMount() {
		const { room } = this.props;
		room.requestLadderData('');
		this.subscriptions.push(
			room.subscribe((response: any) => {
				if (response) {
					const [format, ladderData] = response;
					if (room.format === format) {
						if (!ladderData) {
							room.setError(new Error('No data returned from server.'));
						} else {
							room.setLadderData(ladderData);
						}
					}
				}
				this.forceUpdate();
			})
		);
		this.subscriptions.push(
			PS.teams.subscribe(() => {
				this.forceUpdate();
			})
		);
	}
	renderList() {
		if (!window.BattleFormats) {
			return <p>Loading...</p>;
		}
		let currentSection = "";
		const buf: JSX.Element[] = [];
		for (const [id, format] of Object.entries(BattleFormats)) {
			if (!format.rated || !format.searchShow) continue;
			if (format.section !== currentSection) {
				currentSection = format.section;
				buf.push(<h3>{currentSection}</h3>);
			}
			buf.push(<div>
				<a href={`/ladder-${id}`} class="blocklink" style={{ fontSize: '11pt', padding: '3px 6px' }}>
					{BattleLog.formatName(format.id)}
				</a>
			</div>);
		}
		return buf;
	}
	renderFormatList() {
		const room = this.props.room;
		return <>
			<p>
				<a class="button" href={`/${Config.routes.users}/`} target="_blank">
					Look up a specific user's rating
				</a>
			</p>
			{room.notice && <p>
				<strong style="color:red">{room.notice}</strong>
			</p>}
			<p>
				<button name="joinRoom" value="view-ladderhelp" class="button">
					<i class="fa fa-info-circle"></i> How the ladder works
				</button>
			</p>
			{this.renderList()}
		</>;
	};
	override render() {
		const room = this.props.room;
		return <PSPanelWrapper room={room} scrollable>
			<div class="ladder pad">
				{room.format === undefined && (
					this.renderFormatList()
				)}
				{room.format && <LadderFormat room={room} />}
			</div>
		</PSPanelWrapper>;
	}
}

PS.addRoomType(LadderPanel);
