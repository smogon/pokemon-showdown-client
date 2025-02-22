/**
 * Room-list panel (default right-panel)
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

import {PS, PSRoom, type RoomID, type RoomOptions} from "./client-main";
import {PSPanelWrapper, PSRoomPanel} from "./panels";
import type {RoomInfo} from "./panel-mainmenu";
import {toID} from "./battle-dex";

export class RoomsRoom extends PSRoom {
	override readonly classType: string = 'rooms';
	constructor(options: RoomOptions) {
		super(options);
		PS.send(`|/cmd rooms`);
	}
}

class RoomsPanel extends PSRoomPanel {
	hidden = false;
	search = '';
	lastKeyCode = 0;
	override componentDidMount() {
		super.componentDidMount();
		this.subscriptions.push(PS.user.subscribe(() => {
			if (PS.user.named) PS.send(`|/cmd rooms`);
		}));
	}
	hide = () => {
		this.hidden = true;
		PS.rightRoom = null;
		PS.room = PS.leftRoom;
		this.forceUpdate();
		PS.update();
	};
	changeSearch = (e: Event) => {
		const target = e.currentTarget as HTMLInputElement;
		if (target.selectionStart !== target.selectionEnd) return;
		this.search = target.value;
		this.forceUpdate();
	};
	keyDownSearch = (e: KeyboardEvent) => {
		this.lastKeyCode = e.keyCode;
		if (e.keyCode === 13) {
			const target = e.currentTarget as HTMLInputElement;
			let value = target.value;
			const arrowIndex = value.indexOf(' \u21d2 ');
			if (arrowIndex >= 0) value = value.slice(arrowIndex + 3);
			if (!/^[a-z0-9-]$/.test(value)) value = toID(value);

			e.preventDefault();
			e.stopImmediatePropagation();
			target.value = '';

			PS.join(value as RoomID);
		}
	};
	runSearch() {
		const searchid = toID(this.search);
		let exactMatch = false;

		const rooms = PS.mainmenu.roomsCache;
		let roomList = [...(rooms.chat || [])];
		for (const room of roomList) {
			if (!room.subRooms) continue;
			for (const title of room.subRooms) {
				roomList.push({
					title,
					desc: `Subroom of ${room.title}`,
				});
			}
		}

		let start = roomList.filter(room => {
			const titleid = toID(room.title);
			if (titleid === searchid) exactMatch = true;
			return titleid.startsWith(searchid) ||
				toID(room.title.replace(/^The /, '')).startsWith(searchid);
		});
		roomList = roomList.filter(room => !start.includes(room));

		let abbr = roomList.filter(room =>
			toID(room.title.toLowerCase().replace(/\b([a-z0-9])[a-z0-9]*\b/g, '$1')).startsWith(searchid) ||
			room.title.replace(/[^A-Z0-9]+/g, '').toLowerCase().startsWith(searchid)
		);

		const hidden = !exactMatch ? [{title: this.search, desc: "(Private room?)"}] : [];

		const autoFill = this.lastKeyCode !== 127 && this.lastKeyCode >= 32;
		if (autoFill) {
			const firstTitle = (start[0] || abbr[0] || hidden[0]).title;
			let firstTitleOffset = 0;
			while (
				searchid !== toID(firstTitle.slice(0, firstTitleOffset)) &&
				firstTitleOffset < firstTitle.length // should never happen, but sanity against infinite loop
			) {
				firstTitleOffset++;
			}
			let autoFillValue = firstTitle.slice(firstTitleOffset);
			if (!autoFillValue && toID(firstTitle) !== searchid) {
				autoFillValue = ' \u21d2 ' + firstTitle;
			}
			const oldSearch = this.search;
			const searchElem = this.base!.querySelector<HTMLInputElement>('input[type=search]')!;
			searchElem.value = oldSearch + autoFillValue;
			searchElem.setSelectionRange(oldSearch.length, oldSearch.length + autoFillValue.length);
		}

		return {start, abbr, hidden};
	}
	override focus() {
		this.base!.querySelector<HTMLInputElement>('input[type=search]')!.focus();
	}
	override render() {
		if (this.hidden && PS.isVisible(this.props.room)) this.hidden = false;
		if (this.hidden) {
			return <PSPanelWrapper room={this.props.room} scrollable>{null}</PSPanelWrapper>;
		}
		const rooms = PS.mainmenu.roomsCache;

		let roomList;
		if (this.search) {
			const search = this.runSearch();
			roomList = [
				this.renderRoomList("Search results", search.start),
				this.renderRoomList("Search results (acronym)", search.abbr),
				this.renderRoomList("Possible hidden room", search.hidden),
			];
		} else {
			roomList = [
				this.renderRoomList("Chat rooms", rooms.chat),
			];
		}

		return <PSPanelWrapper room={this.props.room} scrollable><div class="pad">
			<button class="button" style="float:right;font-size:10pt;margin-top:3px" onClick={this.hide}>
				<i class="fa fa-caret-right"></i> Hide
			</button>
			<div class="roomcounters">
				<button class="button" data-href="/users" title="Find an online user">
					<span
						class="pixelated usercount"
						title="Meloetta is PS's mascot! The Aria forme is about using its voice, and represents our chatrooms."
					></span>
					<strong>{rooms.userCount || '-'}</strong> users online
				</button> {}
				<button class="button" data-href="/battles" title="Watch an active battle">
					<span
						class="pixelated battlecount"
						title="Meloetta is PS's mascot! The Pirouette forme is Fighting-type, and represents our battles."
					></span>
					<strong>{rooms.battleCount || '-'}</strong> active battles
				</button>
			</div>
			<div>
				<input
					type="search" name="roomsearch" class="textbox" style="width: 100%; max-width: 480px"
					placeholder="Join or search for rooms"
					onInput={this.changeSearch} onKeyDown={this.keyDownSearch}
				/>
			</div>
			{PS.isOffline ? <h2>(offline)</h2> : rooms.userCount === undefined && <h2>Connecting...</h2>}
			{roomList}
		</div></PSPanelWrapper>;
	}
	renderRoomList(title: string, rooms?: RoomInfo[]) {
		if (!rooms?.length) return null;
		// Descending order
		const sortedRooms = rooms.sort((a, b) => (b.userCount || 0) - (a.userCount || 0));
		return <div class="roomlist">
			<h2>{title}</h2>
			{sortedRooms.map(roomInfo => <div>
				<a href={`/${toID(roomInfo.title)}`} class="blocklink">
					{roomInfo.userCount !== undefined && <small style="float:right">({roomInfo.userCount} users)</small>}
					<strong><i class="fa fa-comment-o"></i> {roomInfo.title}<br /></strong>
					<small>{roomInfo.desc || ''}</small>
					{roomInfo.subRooms && <small><br />
						<i class="fa fa-level-up fa-rotate-90"></i> Subrooms: <strong>
							{roomInfo.subRooms.map((roomName, i) => [
								<i class="fa fa-comment-o"></i>, " " + roomName + (i === roomInfo.subRooms!.length - 1 ? "" : ", "),
							])}
						</strong>
					</small>}
				</a>
			</div>)}
		</div>;
	}
}

PS.roomTypes['rooms'] = {
	Model: RoomsRoom,
	Component: RoomsPanel,
};
PS.updateRoomTypes();
