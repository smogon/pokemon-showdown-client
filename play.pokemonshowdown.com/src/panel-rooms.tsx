/**
 * Room-list panel (default right-panel)
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

import { PS, PSRoom, type RoomID, type RoomOptions } from "./client-main";
import { PSPanelWrapper, PSRoomPanel } from "./panels";
import type { RoomInfo } from "./panel-mainmenu";
import { toID } from "./battle-dex";

export class RoomsRoom extends PSRoom {
	override readonly classType: string = 'rooms';
	constructor(options: RoomOptions) {
		super(options);
		PS.send(`|/cmd rooms`);
	}
}

class RoomsPanel extends PSRoomPanel {
	static readonly id = 'rooms';
	static readonly routes = ['rooms'];
	static readonly Model = RoomsRoom;
	static readonly location = 'right';
	static readonly icon = <i class="fa fa-plus rooms-plus" aria-hidden></i>;
	static readonly title = "Chat Rooms";
	hidden = false;
	search = '';
	section = '';
	lastKeyCode = 0;
	focusedIndex = 0;
	focusedRoomId = '';
	override componentDidMount() {
		super.componentDidMount();
		this.subscriptions.push(PS.user.subscribe(update => {
			if (!update && PS.user.named) PS.send(`|/cmd rooms`);
		}));
	}
	override componentDidUpdate() {
		const el = this.base?.querySelector('a.blocklink.cur');
		if (!this.focusedIndex) return;
		el?.scrollIntoViewIfNeeded({ behavior: 'auto', block: 'nearest' });
	}
	hide = (e: Event) => {
		e.stopImmediatePropagation();
		PS.hideRightRoom();
	};
	changeSearch = (e: Event) => {
		const target = e.currentTarget as HTMLInputElement;
		if (target.selectionStart !== target.selectionEnd) return;
		this.search = target.value;
		this.focusedIndex = 1;
		this.forceUpdate();
	};
	changeSection = (e: Event) => {
		const target = e.currentTarget as HTMLSelectElement;
		this.section = target.value;
		this.forceUpdate();
	};
	handleOnBlur = (e: Event) => {
		this.focusedIndex = 0;
		this.focusedRoomId = '';
		this.forceUpdate();
	};
	keyDownSearch = (e: KeyboardEvent) => {
		this.lastKeyCode = e.keyCode;
		if (e.keyCode === 38) {
			// go up
			this.focusedIndex = Math.max(0, this.focusedIndex - 1);
			this.forceUpdate();
		} else if (e.keyCode === 40) {
			// go down
			this.focusedIndex++;
			this.forceUpdate();
		}
		if (e.keyCode === 13) {
			const target = e.currentTarget as HTMLInputElement;
			let value = this.focusedRoomId?.length ? this.focusedRoomId : target.value;
			const arrowIndex = value.indexOf(' \u21d2 ');
			if (arrowIndex >= 0) value = value.slice(arrowIndex + 3);
			if (!/^[a-z0-9-]$/.test(value)) value = toID(value);
			e.preventDefault();
			e.stopImmediatePropagation();
			target.value = '';
			this.focusedRoomId = '';

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

		const hidden = !exactMatch ? [{ title: this.search, desc: "(Private room?)" }] : [];

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

		return { start, abbr, hidden };
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
				this.renderRoomList("Search results", search.start, 0),
				this.renderRoomList("Search results (acronym)", search.abbr, search.start.length),
				this.renderRoomList("Possible hidden rooms", search.hidden, (search.start.length + search.abbr.length)),
			];
		} else if (PS.isOffline) {
			roomList = [<div class="roomlist"><h2>Offline</h2></div>];
		} else if (rooms.userCount === undefined) {
			roomList = [<div class="roomlist"><h2>Official chat rooms</h2><p><em>Connecting...</em></p></div>];
		} else {
			const roomSections = {
				official: [] as RoomInfo[], chat: [] as RoomInfo[], hidden: [] as RoomInfo[],
			};
			for (const room of rooms.chat || []) {
				if (room.section !== this.section && this.section !== '') continue;
				if (room.privacy === 'hidden') {
					roomSections.hidden.push(room);
				} else if (room.section === 'Official') {
					roomSections.official.push(room);
				} else {
					roomSections.chat.push(room);
				}
			}
			roomList = [
				this.renderRoomList("Official chat rooms", roomSections.official, 0),
				this.renderRoomList("Chat rooms", roomSections.chat, roomSections.official.length),
				this.renderRoomList("Hidden rooms", roomSections.hidden, (roomSections.official.length + roomSections.chat.length)),
			];
		}

		return <PSPanelWrapper room={this.props.room} scrollable><div class="pad">
			<button class="button" style="float:right;font-size:10pt;margin-top:3px" onClick={this.hide}>
				<i class="fa fa-caret-right" aria-hidden></i> Hide
			</button>
			<div class="roomcounters">
				<a class="button" href="users" title="Find an online user">
					<span
						class="pixelated usercount"
						title="Meloetta is PS's mascot! The Aria forme is about using its voice, and represents our chatrooms."
					></span>
					<strong>{rooms.userCount || '-'}</strong> users online
				</a> {}
				<a class="button" href="battles" title="Watch an active battle">
					<span
						class="pixelated battlecount"
						title="Meloetta is PS's mascot! The Pirouette forme is Fighting-type, and represents our battles."
					></span>
					<strong>{rooms.battleCount || '-'}</strong> active battles
				</a>
			</div>
			<div>
				<select name="sections" class="button" onChange={this.changeSection}>
					<option value="">(All rooms)</option>
					{rooms.sectionTitles?.map(title => {
						return <option value={title}> {title} </option>;
					})}
				</select>
				<br /><br />
				<input
					type="search" name="roomsearch" class="textbox autofocus" style="width: 100%; max-width: 480px"
					placeholder="Join or search for rooms"
					onInput={this.changeSearch} onKeyDown={this.keyDownSearch} onBlur={this.handleOnBlur}
				/>
			</div>
			{roomList}
		</div></PSPanelWrapper>;
	}
	renderRoomList(title: string, rooms?: RoomInfo[], indexStart = 0) {
		if (!rooms?.length) return null;
		const hoverStyle = `border-color: #AACCEE;background: rgba(30, 40, 50, 1);color: #AACCEE;`;
		// Descending order
		const sortedRooms = rooms.sort((a, b) => (b.userCount || 0) - (a.userCount || 0));
		let index = this.focusedIndex > indexStart ? this.focusedIndex - (indexStart) : 0;
		if (index) this.focusedRoomId = sortedRooms[index - 1]?.title;
		return <div class="roomlist">
			<h2>{title}</h2>
			{sortedRooms.map((roomInfo, i) => <div key={roomInfo.title}>
				<a
					style={(i + 1) === index ? hoverStyle : ''}
					href={`/${toID(roomInfo.title)}`}
					class={`blocklink${(i + 1) === index ? " cur" : ''}`}
				>
					{roomInfo.userCount !== undefined && <small style="float:right">({roomInfo.userCount} users)</small>}
					<strong><i class="fa fa-comment-o" aria-hidden></i> {roomInfo.title}<br /></strong>
					<small>{roomInfo.desc || ''}</small>
				</a>
				{roomInfo.subRooms && <div class="subrooms">
					<i class="fa fa-level-up fa-rotate-90" aria-hidden></i> Subrooms: {}
					{roomInfo.subRooms.map(roomName => [<a href={`/${toID(roomName)}`} class="blocklink">
						<i class="fa fa-comment-o" aria-hidden></i> <strong>{roomName}</strong>
					</a>, ' '])}
				</div>}
			</div>)}
		</div>;
	}
}

PS.addRoomType(RoomsPanel);
