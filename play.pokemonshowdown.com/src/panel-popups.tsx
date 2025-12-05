import preact from "../js/lib/preact";
import { toID, toRoomid, toUserid, Dex } from "./battle-dex";
import type { ID } from "./battle-dex-data";
import { BattleLog } from "./battle-log";
import { PSLoginServer } from "./client-connection";
import { PSBackground } from "./client-core";
import {
	PS, PSRoom, Config, type RoomOptions, type PSLoginState, type RoomID, type TimestampOptions,
} from "./client-main";
import { type BattleRoom } from "./panel-battle";
import { ChatUserList, type ChatRoom } from "./panel-chat";
import { PSRoomPanel, PSPanelWrapper, PSView } from "./panels";
import { PSHeader } from "./panel-topbar";

/**
 * User popup
 */

export class UserRoom extends PSRoom {
	override readonly classType = 'user';
	userid!: ID;
	name!: string;
	isSelf!: boolean;
	constructor(options: RoomOptions) {
		super(options);
		const userid = (this.id.split('-')[1] || '') as ID;
		this.setName(options.args?.username as string || userid);
	}
	setName(name: string) {
		this.name = name;
		this.userid = toID(name);
		this.isSelf = (this.userid === PS.user.userid);
		if (/[a-zA-Z0-9]/.test(this.name.charAt(0))) this.name = ' ' + this.name;
		this.update(null);
		if (this.userid) PS.send(`/cmd userdetails ${this.userid}`);
	}
}

class UserPanel extends PSRoomPanel<UserRoom> {
	static readonly id = 'user';
	static readonly routes = ['user-*', 'viewuser-*', 'users'];
	static readonly Model = UserRoom;
	static readonly location = 'popup';

	renderUser() {
		const room = this.props.room;
		if (!room.userid) return null;
		const user = PS.mainmenu.userdetailsCache[room.userid] || {
			userid: room.userid, name: room.name.slice(1), avatar: '[loading]',
		};
		if (!user.avatar) {
			// offline; server doesn't know the actual username
			user.name = room.name;
		}
		const hideInteraction = room.id.startsWith('viewuser-');

		const parentRoom = room.getParent() as ChatRoom | null;
		const name = parentRoom?.users?.[user.userid] || room.name;
		const group = PS.server.getGroup(name);
		let groupName: preact.ComponentChild = group.name || null;
		if (group.type === 'punishment') {
			groupName = <span style="color:#777777">{groupName}</span>;
		}

		const globalGroup = PS.server.getGroup(user.group);
		let globalGroupName: preact.ComponentChild = globalGroup.name && `Global ${globalGroup.name}` || null;
		if (globalGroup.type === 'punishment') {
			globalGroupName = <span style="color:#777777">{globalGroupName}</span>;
		}
		if (globalGroup.name === group.name) groupName = null;

		let roomsList: preact.ComponentChild = null;
		if (user.rooms) {
			let battlebuf = [];
			let chatbuf = [];
			let privatebuf = [];
			for (let roomid in user.rooms) {
				if (roomid === 'global') continue;
				const curRoom = user.rooms[roomid];
				let roomrank: preact.ComponentChild = null;
				if (!/[A-Za-z0-9]/.test(roomid.charAt(0))) {
					roomrank = <small style="color: #888; font-size: 100%">{roomid.charAt(0)}</small>;
				}
				roomid = toRoomid(roomid);

				if (roomid.substr(0, 7) === 'battle-') {
					const p1 = curRoom.p1!.substr(1);
					const p2 = curRoom.p2!.substr(1);
					const ownBattle = (PS.user.userid === toUserid(p1) || PS.user.userid === toUserid(p2));
					const roomLink = <a
						href={`/${roomid}`} class={'ilink' + (ownBattle || roomid in PS.rooms ? ' yours' : '')}
						title={`${p1 || '?'} v. ${p2 || '?'}`}
					>{roomrank}{roomid.substr(7)}</a>;
					if (curRoom.isPrivate) {
						if (privatebuf.length) privatebuf.push(', ');
						privatebuf.push(roomLink);
					} else {
						if (battlebuf.length) battlebuf.push(', ');
						battlebuf.push(roomLink);
					}
				} else {
					const roomLink = <a href={`/${roomid}`} class={'ilink' + (roomid in PS.rooms ? ' yours' : '')}>
						{roomrank}{roomid}
					</a>;
					if (curRoom.isPrivate) {
						if (privatebuf.length) privatebuf.push(", ");
						privatebuf.push(roomLink);
					} else {
						if (chatbuf.length) chatbuf.push(', ');
						chatbuf.push(roomLink);
					}
				}
			}
			if (battlebuf.length) battlebuf.unshift(<br />, <em>Battles:</em>, " ");
			if (chatbuf.length) chatbuf.unshift(<br />, <em>Chatrooms:</em>, " ");
			if (privatebuf.length) privatebuf.unshift(<br />, <em>Private rooms:</em>, " ");
			if (battlebuf.length || chatbuf.length || privatebuf.length) {
				roomsList = <small class="rooms">{battlebuf}{chatbuf}{privatebuf}</small>;
			}
		} else if (user.rooms === false) {
			roomsList = <strong class="offline">OFFLINE</strong>;
		}

		const isSelf = user.userid === PS.user.userid;
		let away = false;
		let status = null;
		if (user.status) {
			away = user.status.startsWith('!');
			status = away ? user.status.slice(1) : user.status;
		}

		const buttonbar = [];
		if (!hideInteraction) {
			buttonbar.push(isSelf ? (
				<p class="buttonbar">
					<button class="button" disabled>Challenge</button> {}
					<button class="button" data-href="dm-">Chat Self</button>
				</p>
			) : !PS.user.named ? (
				<p class="buttonbar">
					<button class="button" disabled>Challenge</button> {}
					<button class="button" disabled>Chat</button> {}
					<button class="button" disabled>{'\u2026'}</button>
				</p>
			) : (
				<p class="buttonbar">
					<button class="button" data-href={`challenge-${user.userid}`}>Challenge</button> {}
					<button class="button" data-href={`dm-${user.userid}`}>Chat</button> {}
					<button class="button" data-href={`useroptions-${user.userid}-${room.parentRoomid || ''}`}>{'\u2026'}</button>
				</p>
			));
			if (isSelf) {
				buttonbar.push(
					<hr />,
					<p class="buttonbar" style="text-align: right">
						<button class="button" data-href="login"><i class="fa fa-pencil" aria-hidden></i> Change name</button> {}
						<button class="button" data-cmd="/logout"><i class="fa fa-power-off" aria-hidden></i> Log out</button>
					</p>
				);
			}
		}

		const avatar = user.avatar !== '[loading]' ? Dex.resolveAvatar(`${user.avatar || 'unknown'}`) : null;
		return [<div class="userdetails">
			{avatar && (room.isSelf ? (
				<img src={avatar} class="trainersprite yours" data-href="avatars" />
			) : (
				<img src={avatar} class="trainersprite" />
			))}
			<strong><a
				href={`//${Config.routes.users}/${user.userid}`} target="_blank"
				style={`color: ${away ? '#888888' : BattleLog.usernameColor(user.userid)}`}
			>
				{user.name}
			</a></strong><br />
			{status && <div class="userstatus">{status}</div>}
			{groupName && <div class="usergroup roomgroup">{groupName}</div>}
			{globalGroupName && <div class="usergroup globalgroup">{globalGroupName}</div>}
			{user.customgroup && <div class="usergroup globalgroup">{user.customgroup}</div>}
			{!hideInteraction && roomsList}
		</div>, buttonbar];
	}

	lookup = (ev: Event) => {
		ev.preventDefault();
		ev.stopImmediatePropagation();
		const room = this.props.room;
		const username = this.base!.querySelector<HTMLInputElement>('input[name=username]')?.value;
		room.setName(username || '');
	};
	maybeReset = (ev: Event) => {
		const room = this.props.room;
		const username = this.base!.querySelector<HTMLInputElement>('input[name=username]')?.value;
		if (toID(username) !== room.userid) {
			room.setName('');
		}
	};

	override render() {
		const room = this.props.room;
		const showLookup = room.id === 'users';

		return <PSPanelWrapper room={room}><div class="pad">
			{showLookup && <form onSubmit={this.lookup} style={{ minWidth: '278px' }}>
				<label class="label">
					Username: {}
					<input type="search" name="username" class="textbox autofocus" onInput={this.maybeReset} onChange={this.maybeReset} />
				</label>
				{!room.userid && <p class="buttonbar">
					<button type="submit" class="button"><strong>Look up</strong></button> {}
					<button name="closeRoom" class="button">Close</button>
				</p>}
				{!!room.userid && <hr />}
			</form>}

			{this.renderUser()}
		</div></PSPanelWrapper>;
	}
}

class UserOptionsPanel extends PSRoomPanel {
	static readonly id = 'useroptions';
	static readonly routes = ['useroptions-*'];
	static readonly location = 'popup';
	static readonly noURL = true;
	declare state: {
		showMuteInput?: boolean,
		showBanInput?: boolean,
		showLockInput?: boolean,
		showConfirm?: boolean,
		requestSent?: boolean,
		data?: Record<string, string>,
	};
	getTargets() {
		const [, targetUser, targetRoomid] = this.props.room.id.split('-');
		let targetRoom = (PS.rooms[targetRoomid] || null) as ChatRoom | null;
		if (targetRoom?.type !== 'chat') targetRoom = targetRoom?.getParent() as ChatRoom;
		if (targetRoom?.type !== 'chat') targetRoom = targetRoom?.getParent() as ChatRoom;
		if (targetRoom?.type !== 'chat') targetRoom = null;
		return { targetUser: targetUser as ID, targetRoomid: targetRoomid as RoomID, targetRoom };
	}

	handleMute = (ev: Event) => {
		this.setState({ showMuteInput: true, showBanInput: false, showLockInput: false });
		ev.preventDefault();
		ev.stopImmediatePropagation();
	};
	handleBan = (ev: Event) => {
		this.setState({ showBanInput: true, showMuteInput: false, showLockInput: false });
		ev.preventDefault();
		ev.stopImmediatePropagation();
	};
	handleLock = (ev: Event) => {
		this.setState({ showLockInput: true, showMuteInput: false, showBanInput: false });
		ev.preventDefault();
		ev.stopImmediatePropagation();
	};

	handleCancel = (ev: Event) => {
		this.setState({ showBanInput: false, showMuteInput: false, showLockInput: false, showConfirm: false });
		ev.preventDefault();
		ev.stopImmediatePropagation();
	};

	handleConfirm = (ev: Event) => {
		const data = this.state.data;
		if (!data) return;
		const { targetUser, targetRoom } = this.getTargets();

		let cmd = '';
		if (data.action === "Mute") {
			cmd += data.duration === "1 hour" ? "/hourmute " : "/mute ";
		} else if (data.action === "Ban") {
			cmd += data.duration === "1 week" ? "/weekban " : "/ban ";
		} else if (data.action === "Lock") {
			cmd += data.duration === "1 week" ? "/weeklock " : "/lock ";
		} else if (data.action === "Namelock") {
			cmd += "/namelock ";
		} else {
			return;
		}
		cmd += `${targetUser} ${data.reason ? ',' + data.reason : ''}`;
		targetRoom?.send(cmd);
		this.close();
	};

	handleAddFriend = (ev: Event) => {
		const { targetUser, targetRoom } = this.getTargets();
		targetRoom?.send(`/friend add ${targetUser}`);
		this.setState({ requestSent: true });
		ev.preventDefault();
		ev.stopImmediatePropagation();
	};

	handleIgnore = () => {
		const { targetUser, targetRoom } = this.getTargets();
		targetRoom?.send(`/ignore ${targetUser}`);
		this.close();
	};

	handleUnignore = () => {
		const { targetUser, targetRoom } = this.getTargets();
		targetRoom?.send(`/unignore ${targetUser}`);
		this.close();
	};

	muteUser = (ev: Event) => {
		this.setState({ showMuteInput: false });
		const hrMute = (ev.currentTarget as HTMLButtonElement).value === "1hr";
		const reason = this.base?.querySelector<HTMLInputElement>("input[name=mutereason]")?.value;
		const data = {
			action: 'Mute',
			reason,
			duration: hrMute ? "1 hour" : "7 minutes",
		};
		this.setState({ data, showConfirm: true });
		ev.preventDefault();
		ev.stopImmediatePropagation();
	};

	banUser = (ev: Event) => {
		this.setState({ showBanInput: false });
		const weekBan = (ev.currentTarget as HTMLButtonElement).value === "1wk";
		const reason = this.base?.querySelector<HTMLInputElement>("input[name=banreason]")?.value;
		const data = {
			action: 'Ban',
			reason,
			duration: weekBan ? "1 week" : "2 days",
		};
		this.setState({ data, showConfirm: true });
		ev.preventDefault();
		ev.stopImmediatePropagation();
	};

	lockUser = (ev: Event) => {
		this.setState({ showLockInput: false });
		const weekLock = (ev.currentTarget as HTMLButtonElement).value === "1wk";
		const isNamelock = (ev.currentTarget as HTMLButtonElement).value === "nmlk";
		const reason = this.base?.querySelector<HTMLInputElement>("input[name=lockreason]")?.value;
		const data = {
			action: isNamelock ? 'Namelock' : 'Lock',
			reason,
			duration: weekLock ? "1 week" : "2 days",
		};
		this.setState({ data, showConfirm: true });
		ev.preventDefault();
		ev.stopImmediatePropagation();
	};

	isIgnoringUser = (userid: string) => {
		const ignoring = PS.prefs.ignore || {};
		if (ignoring[userid] === 1) return true;
		return false;
	};

	override render() {
		const room = this.props.room;
		const banPerms = ["@", "#", "~"];
		const mutePerms = ["%", ...banPerms];
		const { targetUser, targetRoom } = this.getTargets();
		const userRoomGroup = targetRoom?.users[PS.user.userid].charAt(0) || '';
		const canMute = mutePerms.includes(userRoomGroup);
		const canBan = banPerms.includes(userRoomGroup);
		const canLock = mutePerms.includes(PS.user.group);
		const isVisible = (actionName: string) => {
			if (actionName === 'mute') {
				return canMute && !this.state.showLockInput && !this.state.showBanInput && !this.state.showConfirm;
			}
			if (actionName === 'ban') {
				return canBan && !this.state.showLockInput && !this.state.showMuteInput && !this.state.showConfirm;
			}
			if (actionName === 'lock') {
				return canLock && !this.state.showBanInput && !this.state.showMuteInput && !this.state.showConfirm;
			}
		};

		return <PSPanelWrapper room={room} width={280}><div class="pad">
			<p>
				{this.isIgnoringUser(targetUser) ? (
					<button onClick={this.handleUnignore} class="button">
						Unignore
					</button>
				) : (
					<button onClick={this.handleIgnore} class="button">
						Ignore
					</button>
				)}
			</p>
			<p>
				<button data-href={`view-help-request-report-user-${targetUser}`} class="button">
					Report
				</button>
			</p>
			<p>
				{this.state.requestSent ? (
					<button class="button disabled">
						Sent request
					</button>
				) : (
					<button onClick={this.handleAddFriend} class="button">
						Add friend
					</button>
				)}
			</p>
			{(canMute || canBan || canLock) && <hr />}
			{this.state.showConfirm && <p>
				<small>
					{this.state.data?.action} <b>{targetUser}</b> {}
					{!this.state.data?.action.endsWith('ock') ? <>from <b>{targetRoom?.title}</b></> : ''} for {this.state.data?.duration}?
				</small>
				<p class="buttonbar">
					<button class="button" onClick={this.handleConfirm}>
						<i class="fa fa-confirm" aria-hidden></i> Confirm
					</button> {}
					<button class="button" onClick={this.handleCancel}>
						Cancel
					</button>
				</p>
			</p>}
			<p class="buttonbar">
				{isVisible('mute') && (this.state.showMuteInput ? (
					<div>
						<label class="label">
							Reason: {}
							<input name="mutereason" class="textbox autofocus" placeholder="Mute reason (optional)" />
						</label> {} <br />
						<button class="button" onClick={this.muteUser} value="7min">For 7 Mins</button> {}
						<button class="button" onClick={this.muteUser} value="1hr">For 1 Hour</button> {}
						<button class="button" onClick={this.handleCancel}> Cancel</button>
					</div>
				) : (
					<button class="button" onClick={this.handleMute}>
						<i class="fa fa-hourglass-half" aria-hidden></i> Mute
					</button>
				))} {}
				{isVisible('ban') && (this.state.showBanInput ? (
					<div>
						<label class="label">
							Reason: {}
							<input name="banreason" class="textbox autofocus" placeholder="Ban reason (optional)" />
						</label><br />
						<button class="button" onClick={this.banUser} value="2d">For 2 Days</button> {}
						<button class="button" onClick={this.banUser} value="1wk">For 1 Week</button> {}
						<button class="button" onClick={this.handleCancel}>Cancel</button>
					</div>
				) : (
					<button class="button" onClick={this.handleBan}>
						<i class="fa fa-gavel" aria-hidden></i> Ban
					</button>
				))} {}
				{isVisible('lock') && (this.state.showLockInput ? (
					<div>
						<label class="label">
							Reason: {}
							<input name="lockreason" class="textbox autofocus" placeholder="Lock reason (optional)" />
						</label><br />
						<button class="button" onClick={this.lockUser} value="2d">For 2 Days</button> {}
						<button class="button" onClick={this.lockUser} value="1wk">For 1 Week</button> {}
						<button class="button" onClick={this.lockUser} value="nmlk">Namelock</button> {}
						<button class="button" onClick={this.handleCancel}>Cancel</button>
					</div>
				) : (
					<button class="button" onClick={this.handleLock}>
						<i class="fa fa-lock" aria-hidden></i> Lock/Namelock
					</button>
				))}
			</p>
		</div></PSPanelWrapper>;
	}
}

class UserListPanel extends PSRoomPanel {
	static readonly id = 'userlist';
	static readonly routes = ['userlist'];
	static readonly location = 'semimodal-popup';
	static readonly noURL = true;
	override render() {
		const room = this.props.room;
		const parentRoom = room.getParent() as ChatRoom;
		if (parentRoom.type !== 'chat' && parentRoom.type !== 'battle') {
			throw new Error(`UserListPanel: ${room.id} is not a chat room`);
		}

		return <PSPanelWrapper room={room} width={280}><div class="pad">
			<ChatUserList room={parentRoom} static />
		</div></PSPanelWrapper>;
	}
}

class VolumePanel extends PSRoomPanel {
	static readonly id = 'volume';
	static readonly routes = ['volume'];
	static readonly location = 'popup';

	setVolume = (e: Event) => {
		const slider = e.currentTarget as HTMLInputElement;
		PS.prefs.set(slider.name as 'effectvolume', Number(slider.value));
		this.forceUpdate();
	};
	setMute = (e: Event) => {
		const checkbox = e.currentTarget as HTMLInputElement;
		PS.prefs.set('mute', !!checkbox.checked);
		PS.update();
	};
	override componentDidMount() {
		super.componentDidMount();
		this.subscriptions.push(PS.prefs.subscribe(() => {
			this.forceUpdate();
		}));
	}
	override render() {
		const room = this.props.room;
		return <PSPanelWrapper room={room}><div class="pad">
			<h3>Volume</h3>
			<p class="volume">
				<label class="optlabel">
					Effects: <span class="value">{!PS.prefs.mute && PS.prefs.effectvolume ? `${PS.prefs.effectvolume}%` : `-`}</span>
				</label>
				{PS.prefs.mute ?
					<em>(muted)</em> :
					<input
						type="range" min="0" max="100" step="1" name="effectvolume" value={PS.prefs.effectvolume}
						onChange={this.setVolume} onInput={this.setVolume} onKeyUp={this.setVolume}
					/>}
			</p>
			<p class="volume">
				<label class="optlabel">
					Music: <span class="value">{!PS.prefs.mute && PS.prefs.musicvolume ? `${PS.prefs.musicvolume}%` : `-`}</span>
				</label>
				{PS.prefs.mute ?
					<em>(muted)</em> :
					<input
						type="range" min="0" max="100" step="1" name="musicvolume" value={PS.prefs.musicvolume}
						onChange={this.setVolume} onInput={this.setVolume} onKeyUp={this.setVolume}
					/>}
			</p>
			<p class="volume">
				<label class="optlabel">
					Notifications: {}
					<span class="value">{!PS.prefs.mute && PS.prefs.notifvolume ? `${PS.prefs.notifvolume}%` : `-`}</span>
				</label>
				{PS.prefs.mute ?
					<em>(muted)</em> :
					<input
						type="range" min="0" max="100" step="1" name="notifvolume" value={PS.prefs.notifvolume}
						onChange={this.setVolume} onInput={this.setVolume} onKeyUp={this.setVolume}
					/>}
			</p>
			<p>
				<label class="checkbox">
					<input type="checkbox" name="mute" checked={PS.prefs.mute} onChange={this.setMute} /> Mute all
				</label>
			</p>
		</div></PSPanelWrapper>;
	}
}

class OptionsPanel extends PSRoomPanel {
	static readonly id = 'options';
	static readonly routes = ['options'];
	static readonly location = 'semimodal-popup';
	declare state: { showStatusInput?: boolean, showStatusUpdated?: boolean };

	override componentDidMount() {
		super.componentDidMount();
		this.subscribeTo(PS.user);
	}
	setTheme = (e: Event) => {
		const theme = (e.currentTarget as HTMLSelectElement).value as 'light' | 'dark' | 'system';
		PS.prefs.set('theme', theme);
		this.forceUpdate();
	};
	setLayout = (e: Event) => {
		const layout = (e.currentTarget as HTMLSelectElement).value;
		switch (layout) {
		case '':
			PS.prefs.set('onepanel', null);
			PS.rightPanel ||= PS.rooms['rooms'] || null;
			break;
		case 'onepanel':
			PS.prefs.set('onepanel', true);
			break;
		case 'vertical':
			PS.prefs.set('onepanel', 'vertical');
			break;
		}
		PS.update();
	};
	setChatroomTimestamp = (ev: Event) => {
		const timestamp = (ev.currentTarget as HTMLSelectElement).value as TimestampOptions;
		PS.prefs.set('timestamps', { ...PS.prefs.timestamps, chatrooms: timestamp || undefined });
	};
	setPMsTimestamp = (ev: Event) => {
		const timestamp = (ev.currentTarget as HTMLSelectElement).value as TimestampOptions;
		PS.prefs.set('timestamps', { ...PS.prefs.timestamps, pms: timestamp || undefined });
	};

	handleShowStatusInput = (ev: Event) => {
		ev.preventDefault();
		ev.stopImmediatePropagation();
		this.setState({ showStatusInput: !this.state.showStatusInput });
	};

	handleOnChange = (ev: Event) => {
		let elem = ev.currentTarget as HTMLInputElement;
		let setting = elem.name;
		let value = elem.checked;
		switch (setting) {
		case 'blockPMs': {
			PS.prefs.set("blockPMs", value);
			PS.send(value ? '/blockpms' : '/unblockpms');
			break;
		}
		case 'blockChallenges': {
			PS.prefs.set("blockChallenges", value);
			PS.send(value ? '/blockchallenges' : '/unblockchallenges');
			break;
		}
		case 'bwgfx': {
			PS.prefs.set('bwgfx', value);
			Dex.loadSpriteData(value || PS.prefs.noanim ? 'bw' : 'xy');
			break;
		}
		case 'language': {
			PS.prefs.set(setting, elem.value);
			PS.send(`/language ${elem.value}`);
			break;
		}
		case 'tournaments': {
			PS.prefs.set(setting, !elem.value ? null : elem.value as 'hide' | 'notify');
			break;
		}
		case 'refreshprompt':
		case 'noanim':
		case 'nopastgens':
		case 'noselfhighlight':
		case 'leavePopupRoom':
		case 'inchatpm':
			PS.prefs.set(setting, value);
			break;
		}
	};

	editStatus = (ev: Event) => {
		const statusInput = this.base!.querySelector<HTMLInputElement>('input[name=statustext]');
		PS.send(statusInput?.value?.length ? `/status ${statusInput.value}` : `/clearstatus`);
		this.setState({ showStatusUpdated: true, showStatusInput: false });
		ev.preventDefault();
		ev.stopImmediatePropagation();
	};

	override render() {
		const room = this.props.room;
		return <PSPanelWrapper room={room}><div class="pad">
			<p>
				<img
					class="trainersprite yours" width="40" height="40" style={{ verticalAlign: 'middle' }}
					src={Dex.resolveAvatar(`${PS.user.avatar}`)} data-href="avatars"
				/> {}
				<strong>{PS.user.name}</strong>
			</p>
			<p>
				<button class="button" data-href="avatars"> Avatar...</button>
			</p>

			{this.state.showStatusInput ? (
				<p>
					<input name="statustext" />
					<button class="button" onClick={this.editStatus}><i class="fa fa-pencil" aria-hidden></i></button>
				</p>
			) : (
				<p>
					<button class="button" onClick={this.handleShowStatusInput} disabled={this.state.showStatusUpdated}>
						{this.state.showStatusUpdated ? 'Status Updated' : 'Status...'}</button>
				</p>
			)}

			{PS.user.named && (PS.user.registered?.userid === PS.user.userid ?
				<button className="button" data-href="changepassword">Password...</button> :
				<button className="button" data-href="register">Register</button>)}

			<hr />
			<h3>Graphics</h3>
			<p>
				<label class="optlabel">Theme: <select name="theme" class="button" onChange={this.setTheme}>
					<option value="light" selected={PS.prefs.theme === 'light'}>Light</option>
					<option value="dark" selected={PS.prefs.theme === 'dark'}>Dark</option>
					<option value="system" selected={PS.prefs.theme === 'system'}>Match system theme</option>
				</select></label>
			</p>
			<p>
				<label class="optlabel">Layout: <select name="layout" class="button" onChange={this.setLayout}>
					<option value="" selected={!PS.prefs.onepanel}>Two panels (if wide enough)</option>
					<option value="onepanel" selected={PS.prefs.onepanel === true}>Single panel</option>
					<option value="vertical" selected={PS.prefs.onepanel === 'vertical'}>Vertical tabs</option>
				</select></label>
			</p>
			<p>
				<label class="optlabel">
					Background: <button class="button" data-href="changebackground">
						Change Background
					</button>
				</label>
			</p>
			<p>
				<label class="checkbox"> <input
					name="noanim" checked={PS.prefs.noanim || false} type="checkbox" onChange={this.handleOnChange}
				/> Disable animations</label>
			</p>
			<p>
				<label class="checkbox"><input
					name="bwgfx" checked={PS.prefs.bwgfx || false} type="checkbox" onChange={this.handleOnChange}
				/>  Use 2D sprites instead of 3D models</label>
			</p>
			<p>
				<label class="checkbox"><input
					name="nopastgens" checked={PS.prefs.nopastgens || false} type="checkbox" onChange={this.handleOnChange}
				/> Use modern sprites for past generations</label>
			</p>
			<hr />
			<h3>Chat</h3>
			<p>
				<label class="checkbox"><input
					name="blockPMs" checked={PS.prefs.blockPMs || false} type="checkbox" onChange={this.handleOnChange}
				/> Block PMs</label>
			</p>
			<p>
				<label class="checkbox"><input
					name="blockChallenges" checked={PS.prefs.blockChallenges || false} type="checkbox" onChange={this.handleOnChange}
				/> Block challenges</label>
			</p>
			<p>
				<label class="checkbox"><input
					name="inchatpm" checked={PS.prefs.inchatpm || false} type="checkbox" onChange={this.handleOnChange}
				/> Show PMs in chatrooms</label>
			</p>
			<p>
				<label class="checkbox"><input
					name="noselfhighlight" checked={PS.prefs.noselfhighlight || false} type="checkbox" onChange={this.handleOnChange}
				/> Do not highlight when your name is said in chat</label>
			</p>
			<p>
				<label class="checkbox"><input
					name="leavePopupRoom" checked={PS.prefs.leavePopupRoom || false} type="checkbox" onChange={this.handleOnChange}
				/> Confirm before leaving a room</label>
			</p>
			<p>
				<label class="checkbox"><input
					name="refreshprompt" checked={PS.prefs.refreshprompt || false} type="checkbox" onChange={this.handleOnChange}
				/> Confirm before refreshing</label>
			</p>
			<p>
				<label class="optlabel">
					Language: {}
					<select name="language" onChange={this.handleOnChange} class="button">
						<option value="german" selected={PS.prefs.language === "german"}>Deutsch</option>
						<option value="english" selected={PS.prefs.language === "english"}>English</option>
						<option value="spanish" selected={PS.prefs.language === "spanish"}>Español</option>
						<option value="french" selected={PS.prefs.language === "french"}>Français</option>
						<option value="italian" selected={PS.prefs.language === "italian"}>Italiano</option>
						<option value="dutch" selected={PS.prefs.language === "dutch"}>Nederlands</option>
						<option value="portuguese" selected={PS.prefs.language === "portuguese"}>Português</option>
						<option value="turkish" selected={PS.prefs.language === "turkish"}>Türkçe</option>
						<option value="hindi" selected={PS.prefs.language === "hindi"}>हिंदी</option>
						<option value="japanese" selected={PS.prefs.language === "japanese"}>日本語</option>
						<option value="simplifiedchinese" selected={PS.prefs.language === "simplifiedchinese"}>简体中文</option>
						<option value="traditionalchinese" selected={PS.prefs.language === "traditionalchinese"}>中文</option>
					</select>
				</label>
			</p>
			<p>
				<label class="optlabel">
					Tournaments: <select name="tournaments" class="button" onChange={this.handleOnChange}>
						<option value="" selected={!PS.prefs.tournaments}>Notify when joined</option>
						<option value="notify" selected={PS.prefs.tournaments === "notify"}>Always notify</option>
						<option value="hide" selected={PS.prefs.tournaments === "hide"}>Hide</option>
					</select>
				</label>
			</p>
			<p>
				<label class="optlabel">Timestamps: <select name="layout" class="button" onChange={this.setChatroomTimestamp}>
					<option value="" selected={!PS.prefs.timestamps.chatrooms}>Off</option>
					<option value="minutes" selected={PS.prefs.timestamps.chatrooms === "minutes"}>[HH:MM]</option>
					<option value="seconds" selected={PS.prefs.timestamps.chatrooms === "seconds"}>[HH:MM:SS]</option>
				</select></label>
			</p>
			<p>
				<label class="optlabel">Timestamps in DMs: <select name="layout" class="button" onChange={this.setPMsTimestamp}>
					<option value="" selected={!PS.prefs.timestamps.pms}>Off</option>
					<option value="minutes" selected={PS.prefs.timestamps.pms === "minutes"}>[HH:MM]</option>
					<option value="seconds" selected={PS.prefs.timestamps.pms === "seconds"}>[HH:MM:SS]</option>
				</select></label>
			</p>
			<p>
				<label class="optlabel">
					Chat preferences: {}
					<button class="button" data-href="chatformatting">Text formatting...</button>
				</label>
			</p>
			<hr />
			{PS.user.named ? <p class="buttonbar" style="text-align: right">
				<button class="button" data-href="login"><i class="fa fa-pencil" aria-hidden></i> Change name</button> {}
				<button class="button" data-cmd="/logout"><i class="fa fa-power-off" aria-hidden></i> Log out</button>
			</p> : <p class="buttonbar" style="text-align: right">
				<button class="button" data-href="login"><i class="fa fa-pencil" aria-hidden></i> Choose name</button>
			</p> }
		</div></PSPanelWrapper>;
	}
}

class GooglePasswordBox extends preact.Component<{ name: string }> {
	override componentDidMount() {
		window.gapiCallback = (response: any) => {
			PS.user.changeNameWithPassword(this.props.name, response.credential, { needsGoogle: true });
		};

		PS.user.gapiLoaded = true;
		const script = document.createElement('script');
		script.async = true;
		script.src = 'https://accounts.google.com/gsi/client';
		document.getElementsByTagName('head')[0].appendChild(script);
	}
	override render() {
		return <div class="google-password-box">
			<div
				id="g_id_onload" data-client_id="912270888098-jjnre816lsuhc5clj3vbcn4o2q7p4qvk.apps.googleusercontent.com"
				data-context="signin" data-ux_mode="popup" data-callback="gapiCallback" data-auto_prompt="false"
			></div>
			<div
				class="g_id_signin" data-type="standard" data-shape="pill" data-theme="filled_blue" data-text="continue_with"
				data-size="large" data-logo_alignment="left" data-auto_select="true" data-itp_support="true"
				style="width:fit-content;margin:0 auto"
			>[loading Google log-in button]</div>
		</div>;
	}
}

class LoginPanel extends PSRoomPanel {
	static readonly id = 'login';
	static readonly routes = ['login'];
	static readonly location = 'semimodal-popup';
	declare state: { passwordShown?: boolean };

	override componentDidMount() {
		super.componentDidMount();
		this.subscriptions.push(PS.user.subscribe(args => {
			if (args) {
				if (args.success) {
					this.close();
					return;
				}
				this.props.room.args = args;
				setTimeout(() => this.focus(), 1);
			}
			this.forceUpdate();
		}));
	}
	getUsername() {
		const loginName = PS.user.loggingIn || this.props.room.args?.name as string;
		if (loginName) return loginName;

		const input = this.base?.querySelector<HTMLInputElement>('input[name=username]');
		if (input && !input.disabled) {
			return input.value;
		}
		return PS.user.named ? PS.user.name : '';
	}
	handleSubmit = (ev: Event) => {
		ev.preventDefault();
		const passwordBox = this.base!.querySelector<HTMLInputElement>('input[name=password]');
		if (passwordBox) {
			PS.user.changeNameWithPassword(this.getUsername(), passwordBox.value);
		} else {
			PS.user.changeName(this.getUsername());
		}
	};
	update = () => {
		this.forceUpdate();
	};
	override focus() {
		const passwordBox = this.base!.querySelector<HTMLInputElement>('input[name=password]');
		const usernameBox = this.base!.querySelector<HTMLInputElement>('input[name=username]');
		(passwordBox || usernameBox)?.select();
	}
	reset = (ev: Event) => {
		ev.preventDefault();
		ev.stopImmediatePropagation();
		this.props.room.args = null;
		this.forceUpdate();
	};
	handleShowPassword = (ev: Event) => {
		ev.preventDefault();
		ev.stopImmediatePropagation();
		this.setState({ passwordShown: !this.state.passwordShown });
	};
	override render() {
		const room = this.props.room;
		const loginState = room.args as PSLoginState;
		return <PSPanelWrapper room={room} width={280}><div class="pad">
			<h3>Log in</h3>
			<form onSubmit={this.handleSubmit}>
				{loginState?.error && <p class="error">{loginState.error}</p>}
				<p><label class="label">
					Username: <small class="preview" style={`color:${BattleLog.usernameColor(toID(this.getUsername()))}`}>(color)</small>
					<input
						class="textbox" type="text" name="username"
						onInput={this.update} onChange={this.update} autocomplete="username"
						value={this.getUsername()} disabled={!!PS.user.loggingIn || !!loginState?.name}
					/>
				</label></p>
				{PS.user.named && !loginState && <p>
					<small>(Others will be able to see your name change. To change name privately, use "Log out")</small>
				</p>}
				{loginState?.needsPassword && <p>
					<i class="fa fa-level-up fa-rotate-90" aria-hidden></i> <strong>if you registered this name:</strong>
					<label class="label">
						Password: {}
						<input
							class="textbox" type={this.state.passwordShown ? 'text' : 'password'} name="password"
							autocomplete="current-password" style="width:173px"
						/>
						<button
							type="button" onClick={this.handleShowPassword} aria-label="Show password"
							class="button" style="float:right;margin:-21px 0 10px;padding: 2px 6px"
						><i class="fa fa-eye" aria-hidden></i></button>
					</label>
				</p>}
				{loginState?.needsGoogle && <>
					<p><i class="fa fa-level-up fa-rotate-90" aria-hidden></i> <strong>if you registered this name:</strong></p>
					<p><GooglePasswordBox name={this.getUsername()} /></p>
				</>}
				<p class="buttonbar">
					{PS.user.loggingIn ? (
						<button disabled class="cur">Logging in...</button>
					) : loginState?.needsPassword ? (
						<>
							<button type="submit" class="button"><strong>Log in</strong></button> {}
							<button type="button" onClick={this.reset} class="button">Cancel</button>
						</>
					) : loginState?.needsGoogle ? (
						<button type="button" onClick={this.reset} class="button">Cancel</button>
					) : (
						<>
							<button type="submit" class="button"><strong>Choose name</strong></button> {}
							<button type="button" name="closeRoom" class="button">Cancel</button>
						</>
					)} {}
				</p>
				{loginState?.name && <div>
					<p>
						<i class="fa fa-level-up fa-rotate-90" aria-hidden></i> <strong>if not:</strong>
					</p>
					<p style={{ maxWidth: '210px', margin: '0 auto' }}>
						This is someone else's account. Sorry.
					</p>
					<p class="buttonbar">
						<button class="button" onClick={this.reset}>Try another name</button>
					</p>
				</div>}
			</form>
		</div></PSPanelWrapper>;
	}
}

class AvatarsPanel extends PSRoomPanel {
	static readonly id = 'avatars';
	static readonly routes = ['avatars'];
	static readonly location = 'semimodal-popup';

	override render() {
		const room = this.props.room;

		const avatars: [number, string][] = [];
		for (let i = 1; i <= 293; i++) {
			if (i === 162 || i === 168) continue;
			avatars.push([i, window.BattleAvatarNumbers?.[i] || `${i}`]);
		}

		return <PSPanelWrapper room={room} width={1210}><div class="pad">
			<label class="optlabel"><strong>Choose an avatar or </strong>
				<button class="button" data-cmd="/close"> Cancel</button>
			</label>
			<div class="avatarlist">
				{avatars.map(([i, avatar]) => (
					<button
						data-cmd={`/closeand /avatar ${avatar}`} title={`/avatar ${avatar}`}
						class={`option pixelated${avatar === PS.user.avatar ? ' cur' : ''}`}
						style={`background-position: -${((i - 1) % 16) * 80 + 1}px -${Math.floor((i - 1) / 16) * 80 + 1}px`}
					></button>
				))}
			</div>
			<div style="clear:left"></div>
			<p><button class="button" data-cmd="/close">Cancel</button></p>
		</div></PSPanelWrapper>;
	}
}

class BattleForfeitPanel extends PSRoomPanel {
	static readonly id = 'forfeit';
	static readonly routes = ['forfeitbattle'];
	static readonly location = 'semimodal-popup';
	static readonly noURL = true;

	override render() {
		const room = this.props.room;
		const battleRoom = room.getParent() as BattleRoom;

		return <PSPanelWrapper room={room} width={480}><div class="pad">
			<p>Forfeiting makes you lose the battle. Are you sure?</p>
			<p>
				<button data-cmd="/closeand /inopener /closeand /forfeit" class="button"><strong>Forfeit and close</strong></button> {}
				<button data-cmd="/closeand /inopener /forfeit" class="button">Just forfeit</button> {}
				{!battleRoom.battle.rated && <button type="button" data-href="replaceplayer" class="button">
					Replace player
				</button>} {}
				<button type="button" data-cmd="/close" class="button">
					Cancel
				</button>
			</p>
		</div></PSPanelWrapper>;
	}
}

class ReplacePlayerPanel extends PSRoomPanel {
	static readonly id = 'replaceplayer';
	static readonly routes = ['replaceplayer'];
	static readonly location = 'semimodal-popup';
	static readonly noURL = true;

	handleReplacePlayer = (ev: Event) => {
		const room = this.props.room;
		const battleRoom = room.getParent()?.getParent() as BattleRoom;
		const newPlayer = this.base?.querySelector<HTMLInputElement>("input[name=newplayer]")?.value;
		if (!newPlayer?.length) return battleRoom.add("|error|Enter player's name");
		if (battleRoom.battle.ended) return battleRoom.add("|error|Cannot replace player, battle has already ended.");
		let playerSlot = battleRoom.battle.p1.id === PS.user.userid ? "p1" : "p2";
		battleRoom.send('/leavebattle');
		battleRoom.send(`/addplayer ${newPlayer}, ${playerSlot}`);
		this.close();
		ev.preventDefault();
	};

	override render() {
		const room = this.props.room;

		return <PSPanelWrapper room={room} width={480}><div class="pad">
			<form onSubmit={this.handleReplacePlayer}>
				<p>Replacement player's name:</p>
				<p>
					<input name="newplayer" class="textbox autofocus" />
				</p>
				<p>
					<button type="submit" class="button">
						<strong>Replace</strong>
					</button> {}
					<button type="button" data-cmd="/close" class="button">
						Cancel
					</button>
				</p>
			</form>
		</div></PSPanelWrapper>;
	}
}

class ChangePasswordPanel extends PSRoomPanel {
	static readonly id = "changepassword";
	static readonly routes = ["changepassword"];
	static readonly location = "semimodal-popup";
	static readonly noURL = true;

	declare state: { errorMsg: string };

	handleChangePassword = (ev: Event) => {
		ev.preventDefault();
		let oldpassword = this.base?.querySelector<HTMLInputElement>('input[name=oldpassword]')?.value;
		let password = this.base?.querySelector<HTMLInputElement>('input[name=password]')?.value;
		let cpassword = this.base?.querySelector<HTMLInputElement>('input[name=cpassword]')?.value;
		if (!oldpassword?.length ||
			!password?.length ||
			!cpassword?.length) return this.setState({ errorMsg: "All fields are required" });
		if (password !== cpassword) return this.setState({ errorMsg: 'Passwords do not match' });
		PSLoginServer.query("changepassword", {
			oldpassword,
			password,
			cpassword,
		}).then(data => {
			if (data?.actionerror) return this.setState({ errorMsg: data?.actionerror });
			PS.alert("Your password was successfully changed!");

		}).catch(err => {
			console.error(err);
			this.setState({ errorMsg: err.message });
		});

		this.setState({ errorMsg: '' });
	};

	override render() {
		const room = this.props.room;

		return <PSPanelWrapper room={room} width={280}><div class="pad">
			<form onSubmit={this.handleChangePassword}>
				{ !!this.state.errorMsg?.length && <p>
					<b class="message-error"> {this.state.errorMsg}</b>
				</p> }
				<p>Change your password:</p>
				<p>
					<label class="label">
						Username: {}
						<input name="username" value={PS.user.name} readOnly={true} autocomplete="username" class="textbox disabled" />
					</label>
				</p>
				<p>
					<label class="label">
						Old password: {}
						<input name="oldpassword" type="password" autocomplete="current-password" class="textbox autofocus" />
					</label>
				</p>
				<p>
					<label class="label">
						New password: {}
						<input name="password" type="password" autocomplete="new-password" class="textbox" />
					</label>
				</p>
				<p>
					<label class="label">
						New password (confirm): {}
						<input name="cpassword" type="password" autocomplete="new-password" class="textbox" />
					</label>
				</p>
				<p class="buttonbar">
					<button type="submit" class="button">
						<strong>Change password</strong>
					</button> {}
					<button type="button" data-cmd="/close" class="button">Cancel</button>
				</p>
			</form>
		</div>
		</PSPanelWrapper>;
	}
}

class RegisterPanel extends PSRoomPanel {
	static readonly id = "register";
	static readonly routes = ["register"];
	static readonly location = "semimodal-popup";
	static readonly noURL = true;
	static readonly rightPopup = true;

	declare state: { errorMsg: string };

	handleRegisterUser = (ev: Event) => {
		ev.preventDefault();
		let captcha = this.base?.querySelector<HTMLInputElement>('input[name=captcha]')?.value;
		let password = this.base?.querySelector<HTMLInputElement>('input[name=password]')?.value;
		let cpassword = this.base?.querySelector<HTMLInputElement>('input[name=cpassword]')?.value;
		if (!captcha?.length ||
			!password?.length ||
			!cpassword?.length) return this.setState({ errorMsg: "All fields are required" });
		if (password !== cpassword) return this.setState({ errorMsg: 'Passwords do not match' });
		PSLoginServer.query("register", {
			captcha,
			password,
			cpassword,
			username: PS.user.name,
			challstr: PS.user.challstr,
		}).then(data => {
			if (data?.actionerror) this.setState({ errorMsg: data?.actionerror });
			if (data?.curuser?.loggedin) {
				let name = data.curuser.username;
				PS.user.registered = { name, userid: toID(name) };
				if (data?.assertion) PS.user.handleAssertion(name, data?.assertion);
				this.close();
				PS.alert("You have been successfully registered.");
			}
		}).catch(err => {
			console.error(err);
			this.setState({ errorMsg: err.message });
		});

		this.setState({ errorMsg: '' });
	};

	override render() {
		const room = this.props.room;

		return <PSPanelWrapper room={room} width={280}><div class="pad">
			<form onSubmit={this.handleRegisterUser}>
				{ !!this.state.errorMsg?.length && <p>
					<b class="message-error"> {this.state.errorMsg}</b>
				</p> }
				<p>Register your account:</p>
				<p>
					<label class="label">
						Username: {}
						<input name="name" value={PS.user.name} readOnly={true} autocomplete="username" class="textbox disabled" />
					</label>
				</p>
				<p>
					<label class="label">
						Password: {}
						<input name="password" type="password" autocomplete="new-password" class="textbox autofocus" />
					</label>
				</p>
				<p>
					<label class="label">
						Password (confirm): {}
						<input name="cpassword" type="password" autocomplete="new-password" class="textbox" />
					</label>
				</p>
				<p>
					<label class="label"><img
						src="https://play.pokemonshowdown.com/sprites/gen5ani/pikachu.gif"
						alt="An Electric-type mouse that is the mascot of the Pok&eacute;mon franchise."
					/></label>
				</p>
				<p>
					<label class="label">
						What is this pokemon? {}
						<input name="captcha" class="textbox" />
					</label>
				</p>
				<p class="buttonbar">
					<button type="submit" class="button"><strong>Register</strong></button> {}
					<button type="button" data-cmd="/close" class="button">Cancel</button>
				</p>
			</form>

		</div>
		</PSPanelWrapper>;
	}
}

class BackgroundListPanel extends PSRoomPanel {
	static readonly id = 'changebackground';
	static readonly routes = ['changebackground'];
	static readonly location = 'semimodal-popup';
	static readonly noURL = true;
	static handleDrop(ev: DragEvent) {
		const files = ev.dataTransfer?.files;
		if (files?.[0]?.type?.startsWith('image/')) {
			// It's an image file, try to set it as a background
			BackgroundListPanel.handleUploadedFiles(files);
			return true;
		}
	}

	declare state: { status?: string, bgUrl?: string };

	setBg = (ev: Event) => {
		let curtarget = ev.currentTarget as HTMLButtonElement;
		let bg = curtarget.value;
		if (bg === 'custom') {
			PSBackground.set(this.props.room.args?.bgUrl as string || '', 'custom');
			this.close();
		} else {
			PSBackground.set('', bg);
		}
		ev.preventDefault();
		ev.stopImmediatePropagation();
		this.forceUpdate();
	};

	static handleUploadedFiles(files: FileList | null | undefined, skipConfirm?: boolean) {
		if (!files?.[0]) return;

		const file = files[0];
		const reader = new FileReader();

		reader.onload = () => {
			const bgUrl = reader.result as string;
			if (bgUrl.length > 4200000) {
				PS.join('changebackground' as RoomID, {
					args: { error: `Image is too large and can't be saved. It should be under 3.5MB or so.` },
				});
				return;
			}
			if (skipConfirm) {
				PSBackground.set(bgUrl, 'custom');
			} else {
				PS.join('changebackground' as RoomID, {
					args: { bgUrl },
				});
			}
			PS.rooms['changebackground']?.update(null);
		};

		reader.onerror = () => {
			PS.join('changebackground' as RoomID, {
				args: { error: "Failed to load background image." },
			});
		};
		reader.readAsDataURL(file);
	}

	uploadBg = (ev: Event) => {
		this.setState({ status: undefined });
		const input = this.base?.querySelector<HTMLInputElement>('input[name=bgfile]');
		BackgroundListPanel.handleUploadedFiles(input?.files, true);
		ev.preventDefault();
		ev.stopImmediatePropagation();
	};

	renderUpload() {
		const room = this.props.room;
		if (room.args?.error) {
			return <PSPanelWrapper room={room} width={480}><div class="pad">
				<p class="error">{room.args.error}</p>
				<p class="buttonbar">
					<button data-cmd="/close" class="button"><strong>Done</strong></button>
				</p>
			</div></PSPanelWrapper>;
		}

		if (room.args?.bgUrl) {
			return <PSPanelWrapper room={room} width={480}><div class="pad">
				<p>
					<img src={room.args.bgUrl as string} style="display:block;margin:auto;max-width:90%;max-height:500px" />
				</p>
				<p class="buttonbar">
					<button onClick={this.setBg} value="custom" class="button"><strong>Set as background</strong></button> {}
					<button data-cmd="/close" class="button">Cancel</button>
				</p>
			</div></PSPanelWrapper>;
		}

		return null;
	}

	override render() {
		const room = this.props.room;
		const option = (val: string) => val === PSBackground.id ? 'option cur' : 'option';
		return this.renderUpload() || <PSPanelWrapper room={room} width={480}><div class="pad">
			<p><strong>Default</strong></p>
			<div class="bglist">
				<button onClick={this.setBg} value="" class={option('')}>
					<strong
						style="
						background: #888888;
						color: white;
						padding: 16px 18px;
						display: block;
						font-size: 12pt;
					"
					>Random</strong>
				</button>
			</div>
			<div style="clear: left"></div>
			<p><strong>Official</strong></p>
			<div class="bglist">
				<button onClick={this.setBg} value="charizards" class={option('charizards')}>
					<span class="bg" style="background-position: 0 -0px"></span>{}
					Charizards
				</button>
				<button onClick={this.setBg} value="horizon" class={option('horizon')}>
					<span class="bg" style="background-position: 0 -90px"></span>{}
					Horizon
				</button>
				<button onClick={this.setBg} value="waterfall" class={option('waterfall')}>
					<span class="bg" style="background-position: 0 -180px"></span>{}
					Waterfall
				</button>
				<button onClick={this.setBg} value="ocean" class={option('ocean')}>
					<span class="bg" style="background-position: 0 -270px"></span>{}
					Ocean
				</button>
				<button onClick={this.setBg} value="shaymin" class={option('shaymin')}>
					<span class="bg" style="background-position: 0 -360px"></span>{}
					Shaymin
				</button>
				<button onClick={this.setBg} value="solidblue" class={option('solidblue')}>
					<span class="bg" style="background: #344b6c"></span>{}
					Solid blue
				</button>
			</div>
			<div style="clear: left"></div>
			<p><strong>Custom</strong></p>
			<p>
				Upload:
			</p>
			<p><input type="file" accept="image/*" name="bgfile" onChange={this.uploadBg} /></p>
			{!!this.state.status && <p class="error">{this.state.status}</p>}
			<p class="buttonbar">
				<button data-cmd="/close" class="button"><strong>Done</strong></button>
			</p>
		</div>
		</PSPanelWrapper>;
	}
}

class ChatFormattingPanel extends PSRoomPanel {
	static readonly id = 'chatformatting';
	static readonly routes = ['chatformatting'];
	static readonly location = 'semimodal-popup';
	static readonly noURL = true;

	handleOnChange = (ev: Event) => {
		const setting = "hide" + (ev.currentTarget as HTMLInputElement).name;
		const value = (ev.currentTarget as HTMLInputElement).checked;
		let curPref = PS.prefs.chatformatting;
		curPref[setting] = value;
		PS.prefs.set("chatformatting", curPref);
		ev.preventDefault();
		ev.stopImmediatePropagation();
	};

	override render() {
		const room = this.props.room;
		const ctrl = PSView.isMac ? 'Cmd' : 'Ctrl';
		return <PSPanelWrapper room={room} width={480}><div class="pad">
			<p>Usable formatting:</p>
			<p>**<strong>bold</strong>** (<kbd>{ctrl}</kbd>+<kbd>B</kbd>)</p>
			<p>__<em>italics</em>__ (<kbd>{ctrl}</kbd>+<kbd>I</kbd>)</p>
			<p>``<code>code formatting</code>`` (<kbd>Ctrl</kbd>+<kbd>`</kbd>)</p>
			<p>~~<s>strikethrough</s>~~</p>
			<p>^^<sup>superscript</sup>^^</p>
			<p>\\<sub>subscript</sub>\\</p>
			<p>
				<label class="checkbox">
					<input
						onChange={this.handleOnChange}
						type="checkbox"
						name="greentext"
						checked={PS.prefs.chatformatting.hidegreentext}
					/> Suppress <span class="greentext">&gt;greentext</span>
				</label>
			</p>
			<p>
				<label class="checkbox">
					<input
						onChange={this.handleOnChange}
						type="checkbox"
						name="me"
						checked={PS.prefs.chatformatting.hideme}

					/> Suppress <code>/me</code> <em>action formatting</em>
				</label>
			</p>
			<p>
				<label class="checkbox">
					<input
						onChange={this.handleOnChange}
						type="checkbox"
						name="spoiler"
						checked={PS.prefs.chatformatting.hidespoiler}
					/> Auto-show spoilers: <span class="spoiler">these things</span>
				</label>
			</p>
			<p>
				<label class="checkbox">
					<input
						onChange={this.handleOnChange}
						type="checkbox"
						name="links"
						checked={PS.prefs.chatformatting.hidelinks}
					/> Make [[clickable links]] unclickable
				</label>
			</p>
			<p>
				<label class="checkbox">
					<input
						onChange={this.handleOnChange}
						type="checkbox"
						name="interstice"
						checked={PS.prefs.chatformatting.hideinterstice}
					/> Don't warn for untrusted links
				</label>
			</p>
			<p><button data-cmd="/close" class="button">Done</button></p>
		</div>
		</PSPanelWrapper>;
	}
}

class LeaveRoomPanel extends PSRoomPanel {
	static readonly id = 'confirmleaveroom';
	static readonly routes = ['confirmleaveroom'];
	static readonly location = 'semimodal-popup';
	static readonly noURL = true;

	override render() {
		const room = this.props.room;
		const parentRoomid = room.parentRoomid!;

		return <PSPanelWrapper room={room} width={480}><div class="pad">
			<p>Close <code>{parentRoomid || "ERROR"}</code>?</p>
			<p class="buttonbar">
				<button data-cmd={`/closeand /close ${parentRoomid}`} class="button autofocus">
					<strong>Close Room</strong>
				</button> {}
				<button data-cmd="/close" class="button">
					Cancel
				</button>
			</p>
		</div></PSPanelWrapper>;
	}
}
class BattleOptionsPanel extends PSRoomPanel {
	static readonly id = 'battleoptions';
	static readonly routes = ['battleoptions'];
	static readonly location = 'semimodal-popup';
	static readonly noURL = true;

	handleHardcoreMode = (ev: Event) => {
		const mode = (ev.currentTarget as HTMLInputElement).checked;
		const room = this.getBattleRoom();
		if (!room) return this.close();

		room.battle.setHardcoreMode(mode);
		if (mode) {
			room.add(`||Hardcore mode ON: Information not available in-game is now hidden.`);
		} else {
			room.add(`||Hardcore mode OFF: Information not available in-game is now shown.`);
		}
		room.update(null);
	};
	handleIgnoreSpectators = (ev: Event | boolean) => {
		const value = typeof ev === "object" ?
			(ev.currentTarget as HTMLInputElement).checked :
			ev;
		const room = this.getBattleRoom();
		if (!room) return this.close();

		room.battle.ignoreSpects = value;
		room.add(`||Spectators ${room.battle.ignoreSpects ? '' : 'no longer '}ignored.`);
		const chats = document.querySelectorAll<HTMLElement>('.battle-log .chat');
		const displaySetting = room.battle.ignoreSpects ? 'none' : '';
		for (const chat of chats) {
			const small = chat.querySelector('small');
			if (!small) continue;
			const text = small.innerText;
			const isPlayerChat = text.includes('\u2606') || text.includes('\u2605');
			if (!isPlayerChat) {
				chat.style.display = displaySetting;
			}
		}
		room.battle.scene.log.updateScroll();
	};
	handleIgnoreOpponent = (ev: Event | boolean) => {
		const value = typeof ev === "object" ?
			(ev.currentTarget as HTMLInputElement).checked :
			ev;
		const room = this.getBattleRoom();
		if (!room) return this.close();

		room.battle.ignoreOpponent = value;
		room.battle.resetToCurrentTurn();
	};
	handleIgnoreNicks = (ev: Event | boolean) => {
		const value = typeof ev === "object" ?
			(ev.currentTarget as HTMLInputElement).checked :
			ev;
		const room = this.getBattleRoom();
		if (!room) return this.close();

		room.battle.ignoreNicks = value;
		room.battle.resetToCurrentTurn();
	};
	handleAllSettings = (ev: Event) => {
		const setting = (ev.currentTarget as HTMLInputElement).name;
		const value = (ev.currentTarget as HTMLInputElement).checked;
		const room = this.getBattleRoom();

		switch (setting) {
		case 'autotimer': {
			PS.prefs.set('autotimer', value);
			if (value) {
				room?.send('/timer on');
			}
			break;
		}
		case 'ignoreopp': {
			PS.prefs.set('ignoreopp', value);
			this.handleIgnoreOpponent(value);
			break;
		}
		case 'ignorespects': {
			PS.prefs.set('ignorespects', value);
			this.handleIgnoreSpectators(value);
			break;
		}
		case 'ignorenicks': {
			PS.prefs.set('ignorenicks', value);
			this.handleIgnoreNicks(value);
			break;
		}
		case 'rightpanel': {
			PS.prefs.set('rightpanelbattles', value);
			break;
		}
		case 'disallowspectators': {
			PS.prefs.set('disallowspectators', value);
			PS.mainmenu.disallowSpectators = value;
			break;
		}
		}
	};
	getBattleRoom() {
		const battleRoom = this.props.room.getParent() as BattleRoom | null;
		return battleRoom?.battle ? battleRoom : null;
	}

	override render() {
		const room = this.props.room;
		const battleRoom = this.getBattleRoom();
		const isPlayer = !!battleRoom?.battle.myPokemon;
		const canOfferTie = battleRoom && ((battleRoom.battle.turn >= 100 && isPlayer) || PS.user.group === '~');
		return <PSPanelWrapper room={room} width={380}><div class="pad">
			{battleRoom && <>
				<p><strong>In this battle</strong></p>
				<p>
					<label class="checkbox">
						<input
							checked={battleRoom.battle.hardcoreMode}
							type="checkbox" onChange={this.handleHardcoreMode}
						/> Hardcore mode (hide info not shown in-game)
					</label>
				</p>
				<p>
					<label class="checkbox">
						<input
							checked={battleRoom.battle.ignoreSpects}
							type="checkbox" onChange={this.handleIgnoreSpectators}
						/> Ignore spectators
					</label>
				</p>
				<p>
					<label class="checkbox">
						<input
							checked={battleRoom.battle.ignoreOpponent}
							type="checkbox" onChange={this.handleIgnoreOpponent}
						/> Ignore opponent
					</label>
				</p>
				<p>
					<label class="checkbox">
						<input
							checked={battleRoom.battle?.ignoreNicks}
							type="checkbox" onChange={this.handleIgnoreNicks}
						/> Ignore nicknames
					</label>
				</p>
			</>}
			<p><strong>All battles</strong></p>
			<p>
				<label class="checkbox">
					<input
						name="disallowspectators" checked={PS.prefs.disallowspectators || false}
						type="checkbox" onChange={this.handleAllSettings}
					/> <abbr title="You can still invite spectators by giving them the URL or using the /invite command">Invite only (hide from Battles list)</abbr>
				</label>
			</p>
			<p>
				<label class="checkbox">
					<input
						name="ignorenicks" checked={PS.prefs.ignorenicks || false}
						type="checkbox" onChange={this.handleAllSettings}
					/> Ignore Pok&eacute;mon nicknames
				</label>
			</p>
			<p>
				<label class="checkbox">
					<input
						name="ignorespects" checked={PS.prefs.ignorespects || false}
						type="checkbox" onChange={this.handleAllSettings}
					/> Ignore spectators
				</label>
			</p>
			<p>
				<label class="checkbox">
					<input
						name="ignoreopp" checked={PS.prefs.ignoreopp || false}
						type="checkbox" onChange={this.handleAllSettings}
					/> Ignore opponent
				</label>
			</p>
			<p>
				<label class="checkbox">
					<input
						name="autotimer" checked={PS.prefs.autotimer || false}
						type="checkbox" onChange={this.handleAllSettings}
					/> Automatically start timer
				</label>
			</p>
			{!PS.prefs.onepanel && document.body.offsetWidth >= 800 && <p>
				<label class="checkbox">
					<input
						name="rightpanel" checked={PS.prefs.rightpanelbattles || false}
						type="checkbox" onChange={this.handleAllSettings}
					/> Open new battles in the right-side panel
				</label>
			</p>}
			<p class="buttonbar">
				<button data-cmd="/close" class="button">Done</button> {}
				{battleRoom && <button data-cmd="/closeand /inopener /offertie" class="button" disabled={!canOfferTie}>
					Offer Tie
				</button>}
			</p>
		</div>
		</PSPanelWrapper>;
	}
}

class PopupRoom extends PSRoom {
	returnValue: unknown = this.args?.cancelValue;
	override destroy() {
		(this.args?.callback as any)?.(this.returnValue);
		super.destroy();
	}
}

class PopupPanel extends PSRoomPanel<PopupRoom> {
	static readonly id = 'popup';
	static readonly routes = ['popup-*'];
	static readonly location = 'semimodal-popup';
	static readonly noURL = true;
	static readonly Model = PopupRoom;

	handleSubmit = (ev: Event) => {
		ev.preventDefault();
		ev.stopImmediatePropagation();
		const room = this.props.room;
		room.returnValue = room.args?.okValue;
		const textbox = this.base!.querySelector<HTMLInputElement>('input[name=value]');
		if (textbox) {
			room.returnValue = textbox.value;
		}
		this.close();
	};
	override componentDidMount() {
		super.componentDidMount();
		const textbox = this.base!.querySelector<HTMLInputElement>('input[name=value]');
		if (!textbox) return;
		textbox.value = this.props.room.args?.value as string || '';
		textbox.select();
	}
	parseMessage(message: string) {
		if (message.startsWith('|html|')) {
			return BattleLog.sanitizeHTML(message.slice(6));
		}
		return BattleLog.parseMessage(message);
	}

	override render() {
		const room = this.props.room;
		const okButton = room.args?.okButton as string || 'OK';
		const cancelButton = room.args?.cancelButton as string | undefined;
		const otherButtons = room.args?.otherButtons as preact.ComponentChildren;
		const value = room.args?.value as string | undefined;
		let type = (room.args?.type || (typeof value === 'string' ? 'text' : null)) as string | null;
		const inputMode = type === 'numeric' ? 'numeric' : undefined;
		if (type === 'numeric') type = 'text';
		const message = room.args?.message;
		return <PSPanelWrapper room={room} width={room.args?.width as number || 480}>
			<form class="pad" onSubmit={this.handleSubmit}>
				{message && <p
					style="white-space:pre-wrap;word-wrap:break-word"
					dangerouslySetInnerHTML={{ __html: this.parseMessage(message as string || '') }}
				></p>}
				{!!type && <p><input
					name="value" type={type} inputMode={inputMode} class="textbox autofocus" style="width:100%;box-sizing:border-box"
				/></p>}
				<p class="buttonbar">
					<button class={`button${!type ? ' autofocus' : ''}`} type="submit" style="min-width:50px">
						<strong>{okButton}</strong>
					</button> {}
					{otherButtons} {}
					{!!cancelButton && <button class="button" data-cmd="/close" type="button">
						{cancelButton}
					</button>}
				</p>
			</form>
		</PSPanelWrapper>;
	}
}

class RoomTabListPanel extends PSRoomPanel {
	static readonly id = 'roomtablist';
	static readonly routes = ['roomtablist'];
	static readonly location = 'semimodal-popup';
	static readonly noURL = true;

	startingLayout = PS.prefs.onepanel;
	handleLayoutChange = (ev: Event) => {
		const checkbox = ev.currentTarget as HTMLInputElement;
		PS.prefs.onepanel = checkbox.checked ? 'vertical' : this.startingLayout;
		PS.update();
	};
	override render() {
		const verticalTabs = PS.prefs.onepanel === 'vertical';
		return <PSPanelWrapper room={this.props.room}><div class="tablist">
			<ul>
				{PS.leftRoomList.map(roomid => PSHeader.renderRoomTab(roomid, true))}
			</ul>
			<ul>
				{PS.rightRoomList.map(roomid => PSHeader.renderRoomTab(roomid, true))}
			</ul>
			<div class="pad"><label class="checkbox"><input
				type="checkbox" checked={verticalTabs} onChange={this.handleLayoutChange}
			/> Try vertical tabs</label></div>
		</div></PSPanelWrapper>;
	}
}
class BattleTimerPanel extends PSRoomPanel {
	static readonly id = 'battletimer';
	static readonly routes = ['battletimer'];
	static readonly location = 'semimodal-popup';
	static readonly noURL = true;

	override render() {
		const room = this.props.room.getParent() as BattleRoom;
		return <PSPanelWrapper room={this.props.room}><div class="pad">
			{room.battle.kickingInactive ? (
				<button class="button" data-cmd="/closeand /inopener /timer stop">Stop Timer</button>
			) : (
				<button class="button" data-cmd="/closeand /inopener /timer start">Start Timer</button>
			)}
		</div>
		</PSPanelWrapper>;
	}
}

class RulesPanel extends PSRoomPanel<PopupRoom> {
	static readonly id = 'rules';
	static readonly routes = ['rules-*'];
	static readonly location = 'modal-popup';
	static readonly noURL = true;
	static readonly Model = PopupRoom;
	declare state: { canClose?: boolean | null, timeLeft?: number | null, timerRef?: any };

	override componentDidMount() {
		super.componentDidMount();
		const args = this.props.room.args;
		const isWarn = args?.type === 'warn';
		if (isWarn && args) {
			const timerRef = setInterval(() => {
				const timeLeft = this.state.timeLeft || 5;
				const canClose = timeLeft === 1;
				this.setState({ canClose, timeLeft: timeLeft - 1 });
				if (canClose) {
					clearInterval(this.state.timerRef);
					this.setState({ timerRef: null });
				}
			}, 1000);
			if (!this.state.timerRef) this.setState({ timerRef });
		}
	}

	override render() {
		const room = this.props.room;
		const type = room.args?.type;
		const isWarn = type === 'warn';
		const message = room.args?.message as string || '';
		return <PSPanelWrapper room={room} width={room.args?.width as number || 780}>
			<div class="pad">
				{
					isWarn &&
					<p><strong style="color:red">{(BattleLog.escapeHTML(message) || 'You have been warned for breaking the rules.')}
					</strong></p>
				}
				<h2>Pok&eacute;mon Showdown Rules</h2>
				<p><b>1.</b> Be nice to people. Respect people. Don't be rude or mean to people.</p>
				<p><b>2.</b> {' '}
					Follow US laws (PS is based in the US). No porn (minors use PS), don't distribute pirated material, {' '}
					and don't slander others.</p>
				<p><b>3.</b> {' '}
					&nbsp;No sex. Don't discuss anything sexually explicit, not even in private messages, {' '}
					not even if you're both adults.</p>
				<p><b>4.</b> {' '}
					&nbsp;No cheating. Don't exploit bugs to gain an unfair advantage. {' '}
					Don't game the system (by intentionally losing against yourself or a friend in a ladder match, by timerstalling, etc). {' '}
					Don't impersonate staff if you're not.</p>
				<p><b>5.</b> {' '}
					Moderators have discretion to punish any behaviour they deem inappropriate, whether or not it's on this list. {' '}
					If you disagree with a moderator ruling, appeal to an administrator (a user with ~ next to their name) or {' '}
					<a href="https://pokemonshowdown.com/appeal">Discipline Appeals</a>.</p>
				<p>(Note: The First Amendment does not apply to PS, since PS is not a government organization.)</p>
				<p><b>Chat</b></p>
				<p><b>1.</b> {' '}
					Do not spam, flame, or troll. This includes advertising, raiding, {' '}
					asking questions with one-word answers in the lobby, {' '}
					and flooding the chat such as by copy/pasting logs in the lobby.</p>
				<p><b>2.</b> {' '}
					Don't call unnecessary attention to yourself. Don't be obnoxious. ALL CAPS and <i>formatting</i> {' '}
					are acceptable to emphasize things, but should be used sparingly, not all the time.</p>
				<p><b>3.</b> {' '}
					No minimodding: don't mod if it's not your job. Don't tell people they'll be muted, {' '}
					don't ask for people to be muted, {' '}
					and don't talk about whether or not people should be muted ('inb4 mute\, etc). {' '}
					This applies to bans and other punishments, too.</p>
				<p><b>4.</b> {' '}
					We reserve the right to tell you to stop discussing moderator decisions if you become unreasonable or belligerent</p>
				<p><b>5.</b> English only, unless specified otherwise.</p>
				<p>(Note: You can opt out of chat rules in private chat rooms and battle rooms, {' '}
					but only if all ROs or players agree to it.)</p>
				{
					!isWarn && <>
						<p><b>Usernames</b></p>
						<p>Your username can be chosen and changed at any time. Keep in mind:</p>
						<p><b>1.</b> Usernames may not impersonate a recognized user (a user with %, @, #, or ~ next to their name) {' '}
							or a famous person/organization that uses PS or is associated with Pokémon.</p>
						<p><b>2.</b> Usernames may not be derogatory or insulting in nature, to an individual or group {' '}
							(insulting yourself is okay as long as it's not too serious).</p>
						<p><b>3.</b> Usernames may not directly reference sexual activity, or be excessively disgusting.</p>
						<p>This policy is less restrictive than that of many places, so you might see some "borderline" nicknames {' '}
							that might not be accepted elsewhere. You might consider it unfair that they are allowed to keep their {' '}
							nickname. The fact remains that their nickname follows the above rules, and {' '}
							if you were asked to choose a new name, yours does not.</p>
					</>
				}
				<p class="buttonbar"><button
					name="close"
					data-cmd="/close" class="button autofocus"
					disabled={!this.state.canClose}
				> Close {this.state.timerRef && <>({this.state.timeLeft} sec)</>}</button></p>
			</div>
		</PSPanelWrapper>;
	}
}

PS.addRoomType(
	UserPanel,
	UserOptionsPanel,
	UserListPanel,
	VolumePanel,
	OptionsPanel,
	LoginPanel,
	AvatarsPanel,
	ChangePasswordPanel,
	RegisterPanel,
	BattleForfeitPanel,
	ReplacePlayerPanel,
	BackgroundListPanel,
	LeaveRoomPanel,
	ChatFormattingPanel,
	PopupPanel,
	RoomTabListPanel,
	BattleOptionsPanel,
	BattleTimerPanel,
	RulesPanel
);
