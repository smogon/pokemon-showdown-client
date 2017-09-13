(function ($) {

	var Topbar = this.Topbar = Backbone.View.extend({
		events: {
			'click a': 'click',
			'click .username': 'clickUsername',
			'click button': 'dispatchClickButton',
			'dblclick button[name=openSounds]': 'toggleMute',

			'dragstart .roomtab': 'dragStartRoom',
			'dragend .roomtab': 'dragEndRoom',
			'dragenter .roomtab': 'dragEnterRoom',
			'dragover .roomtab': 'dragEnterRoom'
		},
		initialize: function () {
			// April Fool's 2016 - Digimon Showdown
			// this.$el.html('<img class="logo" src="' + Tools.resourcePrefix + 'sprites/afd/digimonshowdown.png" alt="Digimon Showdown! (beta)" width="146" height="44" /><div class="maintabbarbottom"></div><div class="tabbar maintabbar"><div class="inner"></div></div><div class="userbar"></div>');
			this.$el.html('<img class="logo" src="' + Tools.resourcePrefix + 'pokemonshowdownbeta.png" srcset="' + Tools.resourcePrefix + 'pokemonshowdownbeta@2x.png 2x" alt="Pok&eacute;mon Showdown! (beta)" width="146" height="44" /><div class="maintabbarbottom"></div><div class="tabbar maintabbar"><div class="inner"></div></div><div class="userbar"></div>');
			this.$tabbar = this.$('.maintabbar .inner');
			// this.$sidetabbar = this.$('.sidetabbar');
			this.$userbar = this.$('.userbar');
			this.dragging = false;
			this.updateTabbar();

			app.user.on('change', this.updateUserbar, this);
			this.updateUserbar();
		},

		// userbar
		updateUserbar: function () {
			var buf = '';
			var name = ' ' + app.user.get('name');
			var color = hashColor(app.user.get('userid'));
			if (!app.user.loaded) {
				buf = '<button disabled>Loading...</button>';
			} else if (app.user.get('named')) {
				buf = '<span class="username" data-name="' + Tools.escapeHTML(name) + '" style="' + color + '"><i class="fa fa-user" style="color:#779EC5"></i> ' + Tools.escapeHTML(name) + '</span>';
			} else {
				buf = '<button name="login">Choose name</button>';
			}
			buf += ' <button class="icon button" name="openSounds" title="Sound" aria-label="Sound"><i class="' + (Tools.prefs('mute') ? 'fa fa-volume-off' : 'fa fa-volume-up') + '"></i></button> <button class="icon button" name="openOptions" title="Options" aria-label="Options"><i class="fa fa-cog"></i></button>';
			this.$userbar.html(buf);
		},
		login: function () {
			app.addPopup(LoginPopup);
		},
		openSounds: function () {
			app.addPopup(SoundsPopup);
		},
		openOptions: function () {
			app.addPopup(OptionsPopup);
		},
		clickUsername: function (e) {
			e.preventDefault();
			e.stopPropagation();
			var name = $(e.currentTarget).data('name');
			app.addPopup(UserPopup, {name: name, sourceEl: e.currentTarget});
		},
		toggleMute: function () {
			var muted = !Tools.prefs('mute');
			Tools.prefs('mute', muted);
			BattleSound.setMute(muted);
			app.topbar.$('button[name=openSounds]').html('<i class="' + (muted ? 'fa fa-volume-off' : 'fa fa-volume-up') + '"></i>');
		},

		// tabbar
		renderRoomTab: function (room, id) {
			if (!room && id !== 'rooms') return '';
			if (!id) id = room.id;
			var buf = '<li><a class="roomtab button' + (app.curRoom === room || app.curSideRoom === room ? ' cur' : '') + (room && room.notificationClass || '') + (id === '' || id === 'rooms' ? '' : ' closable') + '" href="' + app.root + id + '"';
			if (room && room.notifications) {
				var title = '';
				for (var tag in room.notifications) {
					if (room.notifications[tag].title) title += room.notifications[tag].title + '\n';
					if (room.notifications[tag].body) title += room.notifications[tag].body + '\n';
				}
				if (title) buf += ' title="' + Tools.escapeHTML(title) + '"';
			}
			switch (id) {
			case '':
				return buf + '><i class="fa fa-home"></i> <span>Home</span></a></li>';
			case 'teambuilder':
				return buf + '><i class="fa fa-pencil-square-o"></i> <span>Teambuilder</span></a><button class="closebutton" name="closeRoom" value="' + 'teambuilder" aria-label="Close"><i class="fa fa-times-circle"></i></button></li>';
			case 'ladder':
				return buf + '><i class="fa fa-list-ol"></i> <span>Ladder</span></a><button class="closebutton" name="closeRoom" value="' + 'ladder" aria-label="Close"><i class="fa fa-times-circle"></i></button></li>';
			case 'battles':
				return buf + '><i class="fa fa-caret-square-o-right"></i> <span>Battles</span></a><button class="closebutton" name="closeRoom" value="' + 'battles" aria-label="Close"><i class="fa fa-times-circle"></i></button></li>';
			case 'rooms':
				return buf + ' aria-label="Join chatroom"><i class="fa fa-plus" style="margin:7px auto -6px auto"></i> <span>&nbsp;</span></a></li>';
			default:
				if (id.substr(0, 7) === 'battle-') {
					var name = Tools.escapeHTML(room.title);
					var formatid = id.substr(7).split('-')[0];
					if (!name) {
						var p1 = (room.battle && room.battle.p1 && room.battle.p1.name) || '';
						var p2 = (room.battle && room.battle.p2 && room.battle.p2.name) || '';
						if (p1 && p2) {
							name = '' + Tools.escapeHTML(p1) + ' v. ' + Tools.escapeHTML(p2);
						} else if (p1 || p2) {
							name = '' + Tools.escapeHTML(p1) + Tools.escapeHTML(p2);
						} else {
							name = '(empty room)';
						}
					}
					return buf + ' draggable="true"><i class="text">' + Tools.escapeFormat(formatid) + '</i><span>' + name + '</span></a><button class="closebutton" name="closeRoom" value="' + id + '" aria-label="Close"><i class="fa fa-times-circle"></i></a></li>';
				} else {
					return buf + ' draggable="true"><i class="fa fa-comment-o"></i> <span>' + (Tools.escapeHTML(room.title) || (id === 'lobby' ? 'Lobby' : id)) + '</span></a><button class="closebutton" name="closeRoom" value="' + id + '" aria-label="Close"><i class="fa fa-times-circle"></i></a></li>';
				}
			}
		},
		updateTabbar: function () {
			if ($(window).width() < 420) return this.updateTabbarMini();
			this.$('.logo').show();
			this.$('.maintabbar').removeClass('minitabbar');

			var curId = (app.curRoom ? app.curRoom.id : '');
			var curSideId = (app.curSideRoom ? app.curSideRoom.id : '');

			var buf = '<ul>' + this.renderRoomTab(app.rooms['']) + this.renderRoomTab(app.rooms['teambuilder']) + this.renderRoomTab(app.rooms['ladder']) + '</ul>';
			var sideBuf = '';

			var notificationCount = app.rooms[''].notifications ? 1 : 0;
			if (app.roomList.length) {
				buf += '<ul>';
				for (var i = 0; i < app.roomList.length; i++) {
					var room = app.roomList[i];
					if (room.notifications) notificationCount++;
					buf += this.renderRoomTab(room);
				}
				buf += '</ul>';
			}

			for (var i = 0; i < app.sideRoomList.length; i++) {
				var room = app.sideRoomList[i];
				if (room.notifications) notificationCount++;
				sideBuf += this.renderRoomTab(room);
			}
			if (window.nodewebkit) {
				if (nwWindow.setBadgeLabel) nwWindow.setBadgeLabel(notificationCount || '');
			} else {
				var $favicon = $('#dynamic-favicon');
				if (!!$favicon.data('on') !== !!notificationCount) {
					if (notificationCount) {
						$favicon.attr('href', Tools.resourcePrefix + '/favicon-notify.ico');
						$favicon.data('on', '1');
					} else {
						$favicon.attr('href', Tools.resourcePrefix + '/favicon.ico');
						$favicon.data('on', '');
					}
				}
			}
			sideBuf += this.renderRoomTab(app.rooms['rooms'], 'rooms');
			var margin = 0;
			if (sideBuf) {
				if (app.curSideRoom) {
					margin = app.curSideRoom.leftWidth - 144;
					buf += '<ul class="siderooms" style="float:none;margin-left:' + margin + 'px">' + sideBuf + '</ul>';
				} else {
					buf += '<ul>' + sideBuf + '</ul>';
				}
			}
			this.$tabbar.html(buf);
			var $lastUl = this.$tabbar.children().last();
			var $lastLi = $lastUl.children().last();
			var offset = $lastLi.offset();
			var width = $lastLi.outerWidth();
			// 166 here is the difference between the .maintabbar's right margin and the a.button's right margin.
			var overflow = offset.left + width + 166 - $(window).width();
			if (app.curSideRoom && overflow > 0) {
				margin -= overflow;
				$lastUl.css('margin-left', margin + 'px');
				offset = $lastLi.offset();
				overflow = offset.left + width + 166 - $(window).width();
			}
			if (offset.top >= 37 || overflow > 0) {
				this.$tabbar.append('<div class="overflow" aria-hidden="true"><button name="tablist" class="button" aria-label="More"><i class="fa fa-caret-down"></i></button></div>');
			}

			if (app.rooms['']) app.rooms[''].updateRightMenu();
		},
		updateTabbarMini: function () {
			this.$('.logo').hide();
			this.$('.maintabbar').addClass('minitabbar');
			var notificationClass = '';
			for (var i in app.rooms) {
				if (app.rooms[i] !== app.curRoom && app.rooms[i].notificationClass === ' notifying') notificationClass = ' notifying';
			}
			var buf = '<ul><li><a class="button minilogo' + notificationClass + '" href="' + app.root + '"><img src="' + Tools.resourcePrefix + 'favicon-128.png" width="32" height="32" alt="Pok&eacute;mon Showdown! (beta)" /><i class="fa fa-caret-down" style="display:inline-block"></i></a></li></ul>';

			buf += '<ul>' + this.renderRoomTab(app.curRoom) + '</ul>';

			this.$tabbar.html(buf);

			if (app.rooms['']) app.rooms[''].updateRightMenu();
		},
		dispatchClickButton: function (e) {
			var target = e.currentTarget;
			if (target.name) {
				app.dismissingSource = app.dismissPopups();
				app.dispatchingButton = target;
				e.preventDefault();
				e.stopImmediatePropagation();
				this[target.name](target.value, target, e);
				delete app.dismissingSource;
				delete app.dispatchingButton;
			}
		},
		click: function (e) {
			if (e.cmdKey || e.metaKey || e.ctrlKey) return;
			e.preventDefault();
			var $target = $(e.currentTarget);
			if ($target.hasClass('minilogo')) {
				app.addPopup(TabListPopup, {sourceEl: e.currentTarget});
				return;
			}
			var id = $target.attr('href');
			if (id.substr(0, app.root.length) === app.root) {
				id = id.substr(app.root.length);
			}
			if ($target.hasClass('closebutton')) {
				app.leaveRoom(id, e);
			} else {
				app.joinRoom(id);
			}
		},
		closeRoom: function (roomid, button, e) {
			app.leaveRoom(roomid, e);
		},
		tablist: function () {
			app.addPopup(TabListPopup);
		},

		// drag and drop

		roomidOf: function (room) {
			return room.id;
		},

		dragStartRoom: function (e) {
			var target = e.currentTarget;
			var dataTransfer = e.originalEvent.dataTransfer;

			var elWidth = $(e.currentTarget).outerWidth();

			dataTransfer.effectAllowed = 'all';
			// by default, Chrome displays links as a URL when dragging
			// this uses a hack to force it to drag the tab
			app.draggingOffsetX = Math.floor(elWidth / 2);
			app.draggingOffsetY = 18;
			dataTransfer.setDragImage(target, app.draggingOffsetX, app.draggingOffsetY);

			var roomRef = $(target).attr('href');
			app.draggingRoomList = app.roomList.map(this.roomidOf).concat('|').concat(app.sideRoomList.map(this.roomidOf));
			app.draggingLoc = app.draggingRoomList.indexOf(roomRef.slice(1));
			if (app.draggingLoc < 0) {
				// can't drag
				return;
			}

			app.dragging = roomRef;
			app.draggingRoom = null;
			app.$dragging = null;

			var iPipe = app.draggingRoomList.indexOf('|');
			app.draggingSideRoom = (app.draggingLoc > iPipe);

			setTimeout(function () {
				$(target).css('opacity', 0.5);
			}, 0);

			// console.log('dragstart: ' + app.dragging);
		},

		dragEnterRoom: function (e) {
			if (!app.dragging || typeof app.dragging !== 'string') return;
			var roomid = $(e.currentTarget).attr('href').slice(1);
			if (app.dragging.slice(1) === roomid) return;
			var i = app.draggingRoomList.indexOf(roomid);
			var iPipe = app.draggingRoomList.indexOf('|');
			if (iPipe < 0) return; // bug?

			if (!app.$dragging) {
				// the dragging element needs to stay in the DOM, or the dragEnd
				// event won't fire (at least when I tested in Chrome)
				app.$dragging = this.$('a.roomtab[href="' + app.dragging + '"]');
				this.$el.append(app.$dragging);
				app.$dragging.hide();
			} else if (app.draggingLastRoom === roomid) {
				if (app.draggingOffsetX > 0) {
					// dragged right, don't drag back if we're still going right
					if (e.originalEvent.pageX - app.draggingOffsetX >= -5) return;
				} else {
					// dragged left, don't drag back if we're still going left
					if (e.originalEvent.pageX + app.draggingOffsetX <= 5) return;
				}
			}

			if (roomid === 'rooms') i = app.draggingRoomList.length;
			if (i < 0) i = 0;

			var draggingRight = (i > app.draggingLoc);
			if (iPipe > app.draggingLoc && i > iPipe) draggingRight = false;
			app.draggingOffsetX = e.originalEvent.pageX * (draggingRight ? 1 : -1);
			app.draggingLastRoom = roomid;

			// remove tab from old position
			var room;
			if (app.draggingLoc < iPipe) {
				// old position is in left list
				room = app.roomList.splice(app.draggingLoc, 1)[0];
				iPipe--;
			} else {
				// old position is in right list
				room = app.sideRoomList.splice(app.draggingLoc - iPipe - 1, 1)[0];
			}
			if (app.draggingLoc < i) i--;

			// add tab to new position
			if (draggingRight) i++; // add after when dragging right
			if (i <= iPipe) {
				// insert into left list
				app.roomList.splice(i, 0, room);
			} else {
				// insert into right list
				app.sideRoomList.splice(i - iPipe - 1, 0, room);
			}

			app.draggingRoomList = app.roomList.map(this.roomidOf).concat('|').concat(app.sideRoomList.map(this.roomidOf));
			app.draggingLoc = app.draggingRoomList.indexOf(app.dragging.slice(1));

			this.updateTabbar();
			this.$('a.roomtab[href="' + app.dragging + '"]').css('opacity', 0.5);

			// console.log('dragenter: /' + roomid);
		},

		dragEndRoom: function (e) {
			if (!app.dragging) return;
			// console.log('dragend: ' + app.dragging);

			var room = app.rooms[app.dragging.slice(1)];
			var iPipe = app.draggingRoomList.indexOf('|');

			if (app.draggingLoc < iPipe && app.draggingSideRoom) {
				app.focusRoomLeft(room.id);
			} else if (app.draggingLoc > iPipe && !app.draggingSideRoom) {
				app.focusRoomRight(room.id);
			} else {
				this.updateTabbar();
			}

			if (room.type === 'chat') app.updateAutojoin();

			app.dragging = null;
			if (app.$dragging) app.$dragging.remove();
			app.draggingRoomList = null;
		}
	});

	var SoundsPopup = this.SoundsPopup = Popup.extend({
		initialize: function (data) {
			var buf = '';
			var muted = !!Tools.prefs('mute');
			buf += '<p class="effect-volume"><label class="optlabel">Effect volume:</label>' + (muted ? '<em>(muted)</em>' : '<input type="range" min="0" max="100" step="1" name="effectvolume" value="' + (Tools.prefs('effectvolume') || 50) + '" />') + '</p>';
			buf += '<p class="music-volume"><label class="optlabel">Music volume:</label>' + (muted ? '<em>(muted)</em>' : '<input type="range" min="0" max="100" step="1" name="musicvolume" value="' + (Tools.prefs('musicvolume') || 50) + '" />') + '</p>';
			buf += '<p class="notif-volume"><label class="optlabel">Notification volume:</label>' + (muted ? '<em>(muted)</em>' : '<input type="range" min="0" max="100" step="1" name="notifvolume" value="' + (Tools.prefs('notifvolume') || 50) + '" />') + '</p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="muted"' + (muted ? ' checked' : '') + ' /> Mute sounds</label></p>';
			this.$el.html(buf).css('min-width', 160);
		},
		events: {
			'change input[name=muted]': 'setMute',
			'change input[type=range]': 'updateVolume',
			'keyup input[type=range]': 'updateVolume',
			'input input[type=range]': 'updateVolume'
		},
		updateVolume: function (e) {
			var val = Number(e.currentTarget.value);
			switch (e.currentTarget.name) {
			case 'effectvolume':
				this.setEffectVolume(val);
				break;
			case 'musicvolume':
				this.setMusicVolume(val);
				break;
			case 'notifvolume':
				this.setNotifVolume(val);
				break;
			}
		},
		setMute: function (e) {
			var muted = !!e.currentTarget.checked;
			Tools.prefs('mute', muted);
			BattleSound.setMute(muted);

			if (!muted) {
				this.$('.effect-volume').html('<label class="optlabel">Effect volume:</label><input type="range" min="0" max="100" step="1" name="effectvolume" value="' + (Tools.prefs('effectvolume') || 50) + '" />');
				this.$('.music-volume').html('<label class="optlabel">Music volume:</label><input type="range" min="0" max="100" step="1" name="musicvolume" value="' + (Tools.prefs('musicvolume') || 50) + '" />');
				this.$('.notif-volume').html('<label class="optlabel">Notification volume:</label><input type="range" min="0" max="100" step="1" name="notifvolume" value="' + (Tools.prefs('notifvolume') || 50) + '" />');
			} else {
				this.$('.effect-volume').html('<label class="optlabel">Effect volume:</label><em>(muted)</em>');
				this.$('.music-volume').html('<label class="optlabel">Music volume:</label><em>(muted)</em>');
				this.$('.notif-volume').html('<label class="optlabel">Notification volume:</label><em>(muted)</em>');
			}

			app.topbar.$('button[name=openSounds]').html('<i class="' + (muted ? 'fa fa-volume-off' : 'fa fa-volume-up') + '"></i>');
		},
		setEffectVolume: function (volume) {
			BattleSound.setEffectVolume(volume);
			Tools.prefs('effectvolume', volume);
		},
		setMusicVolume: function (volume) {
			BattleSound.setBgmVolume(volume);
			Tools.prefs('musicvolume', volume);
		},
		setNotifVolume: function (volume) {
			Tools.prefs('notifvolume', volume);
		}
	});

	var OptionsPopup = this.OptionsPopup = Popup.extend({
		initialize: function (data) {
			app.user.on('change', this.update, this);
			app.send('/cmd userdetails ' + app.user.get('userid'));
			this.update();
		},
		events: {
			'change input[name=noanim]': 'setNoanim',
			'change input[name=bwgfx]': 'setBwgfx',
			'change input[name=nopastgens]': 'setNopastgens',
			'change input[name=notournaments]': 'setNotournaments',
			'change input[name=inchatpm]': 'setInchatpm',
			'change input[name=dark]': 'setDark',
			'change input[name=temporarynotifications]': 'setTemporaryNotifications',
			'change select[name=bg]': 'setBg',
			'change select[name=timestamps-lobby]': 'setTimestampsLobby',
			'change select[name=timestamps-pms]': 'setTimestampsPMs',
			'change select[name=onepanel]': 'setOnePanel',
			'change input[name=logchat]': 'setLogChat',
			'change input[name=selfhighlight]': 'setSelfHighlight',
			'click img': 'avatars'
		},
		update: function () {
			var name = app.user.get('name');
			var avatar = app.user.get('avatar');

			var buf = '';
			buf += '<p>' + (avatar ? '<img class="trainersprite" src="' + Tools.resolveAvatar(avatar) + '" width="40" height="40" style="vertical-align:middle;cursor:pointer" />' : '') + '<strong>' + Tools.escapeHTML(name) + '</strong></p>';
			buf += '<p><button name="avatars">Change avatar</button></p>';
			if (app.user.get('named')) {
				var registered = app.user.get('registered');
				if (registered && (registered.userid === app.user.get('userid'))) {
					buf += '<p><button name="changepassword">Password change</button></p>';
				} else {
					buf += '<p><button name="register">Register</button></p>';
				}
			}

			buf += '<hr />';
			buf += '<p><strong>Graphics</strong></p>';
			var onePanel = !!Tools.prefs('onepanel');
			if ($(window).width() >= 660) {
				buf += '<p><label class="optlabel">Layout: <select name="onepanel"><option value=""' + (!onePanel ? ' selected="selected"' : '') + '>&#x25EB; Left and right panels</option><option value="1"' + (onePanel ? ' selected="selected"' : '') + '>&#x25FB; Single panel</option></select></label></p>';
			}
			buf += '<p><label class="optlabel">Background: <button name="background">Change background</button></label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="dark"' + (Tools.prefs('dark') ? ' checked' : '') + ' /> Dark mode (beta)</label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="noanim"' + (Tools.prefs('noanim') ? ' checked' : '') + ' /> Disable animations</label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="bwgfx"' + (Tools.prefs('bwgfx') ? ' checked' : '') + ' /> Use BW sprites instead of XY models</label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="nopastgens"' + (Tools.prefs('nopastgens') ? ' checked' : '') + ' /> Use modern sprites for past generations</label></p>';

			buf += '<hr />';
			buf += '<p><strong>Chat</strong></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="notournaments"' + (Tools.prefs('notournaments') ? ' checked' : '') + ' /> Ignore tournaments</label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="inchatpm"' + (Tools.prefs('inchatpm') ? ' checked' : '') + ' /> Show PMs in chat rooms</label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="selfhighlight"' + (!Tools.prefs('noselfhighlight') ? ' checked' : '') + '> Highlight when your name is said in chat</label></p>';

			if (window.Notification) {
				buf += '<p><label class="optlabel"><input type="checkbox" name="temporarynotifications"' + (Tools.prefs('temporarynotifications') ? ' checked' : '') + ' /> Notifications disappear automatically</label></p>';
			}

			var timestamps = this.timestamps = (Tools.prefs('timestamps') || {});
			buf += '<p><label class="optlabel">Timestamps in chat rooms: <select name="timestamps-lobby"><option value="off">Off</option><option value="minutes"' + (timestamps.lobby === 'minutes' ? ' selected="selected"' : '') + '>[HH:MM]</option><option value="seconds"' + (timestamps.lobby === 'seconds' ? ' selected="selected"' : '') + '>[HH:MM:SS]</option></select></label></p>';
			buf += '<p><label class="optlabel">Timestamps in PMs: <select name="timestamps-pms"><option value="off">Off</option><option value="minutes"' + (timestamps.pms === 'minutes' ? ' selected="selected"' : '') + '>[HH:MM]</option><option value="seconds"' + (timestamps.pms === 'seconds' ? ' selected="selected"' : '') + '>[HH:MM:SS]</option></select></label></p>';
			buf += '<p><label class="optlabel">Chat preferences: <button name="formatting">Edit formatting</button></label></p>';

			if (window.nodewebkit) {
				buf += '<hr />';
				buf += '<p><strong>Desktop app</strong></p>';
				buf += '<p><label class="optlabel"><input type="checkbox" name="logchat"' + (Tools.prefs('logchat') ? ' checked' : '') + '> Log chat</label></p>';
				buf += '<p id="openLogFolderButton"' + (Storage.dir ? '' : ' style="display:none"') + '><button name="openLogFolder">Open log folder</button></p>';
			}

			buf += '<hr />';
			if (app.user.get('named')) {
				buf += '<p class="buttonbar" style="text-align:right"><button name="login"><i class="fa fa-pencil"></i> Change name</button> <button name="logout"><i class="fa fa-power-off"></i> Log out</button></p>';
			} else {
				buf += '<p class="buttonbar" style="text-align:right"><button name="login">Choose name</button></p>';
			}
			this.$el.html(buf).css('min-width', 160);
		},
		openLogFolder: function () {
			Storage.revealFolder();
		},
		setLogChat: function (e) {
			var logchat = !!e.currentTarget.checked;
			if (logchat) {
				Storage.startLoggingChat();
				$('#openLogFolderButton').show();
			} else {
				Storage.stopLoggingChat();
			}
			Tools.prefs('logchat', logchat);
		},
		setNoanim: function (e) {
			var noanim = !!e.currentTarget.checked;
			Tools.prefs('noanim', noanim);
			Tools.loadSpriteData(noanim || Tools.prefs('bwgfx') ? 'bw' : 'xy');
		},
		setDark: function (e) {
			var dark = !!e.currentTarget.checked;
			Tools.prefs('dark', dark);
			$('html').toggleClass('dark', dark);
		},
		setBwgfx: function (e) {
			var bwgfx = !!e.currentTarget.checked;
			Tools.prefs('bwgfx', bwgfx);
			Tools.loadSpriteData(bwgfx || Tools.prefs('noanim') ? 'bw' : 'xy');
		},
		setNopastgens: function (e) {
			var nopastgens = !!e.currentTarget.checked;
			Tools.prefs('nopastgens', nopastgens);
		},
		setNotournaments: function (e) {
			var notournaments = !!e.currentTarget.checked;
			Tools.prefs('notournaments', notournaments);
		},
		setSelfHighlight: function (e) {
			var noselfhighlight = !e.currentTarget.checked;
			Tools.prefs('noselfhighlight', noselfhighlight);
		},
		setInchatpm: function (e) {
			var inchatpm = !!e.currentTarget.checked;
			Tools.prefs('inchatpm', inchatpm);
		},
		setTemporaryNotifications: function (e) {
			var temporarynotifications = !!e.currentTarget.checked;
			Tools.prefs('temporarynotifications', temporarynotifications);
		},
		background: function (e) {
			app.addPopup(CustomBackgroundPopup);
		},
		setOnePanel: function (e) {
			app.singlePanelMode = !!e.currentTarget.value;
			Tools.prefs('onepanel', !!e.currentTarget.value);
			app.updateLayout();
		},
		setTimestampsLobby: function (e) {
			this.timestamps.lobby = e.currentTarget.value;
			Tools.prefs('timestamps', this.timestamps);
		},
		setTimestampsPMs: function (e) {
			this.timestamps.pms = e.currentTarget.value;
			Tools.prefs('timestamps', this.timestamps);
		},
		avatars: function () {
			app.addPopup(AvatarsPopup);
		},
		formatting: function () {
			app.addPopup(FormattingPopup);
		},
		login: function () {
			app.addPopup(LoginPopup);
		},
		register: function () {
			app.addPopup(RegisterPopup);
		},
		changepassword: function () {
			app.addPopup(ChangePasswordPopup);
		},
		logout: function () {
			app.user.logout();
			this.close();
		}
	});

	var FormattingPopup = this.FormattingPopup = Popup.extend({
		events: {
			'change input': 'setOption'
		},
		initialize: function () {
			var cur = this.chatformatting = Tools.prefs('chatformatting') || {};
			var buf = '<p class="optlabel">You can choose to display formatted text as normal text.</p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="bold" ' + (cur.hidebold ? 'checked' : '') + ' /> Suppress **<strong>bold</strong>**</label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="italics" ' + (cur.hideitalics ? 'checked' : '') + ' /> Suppress __<em>italics</em>__</label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="monospace" ' + (cur.hidemonospace ? 'checked' : '') + ' /> Suppress ``<code>code formatting</code>``</label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="strikethrough" ' + (cur.hidestrikethrough ? 'checked' : '') + ' /> Suppress ~~<s>strikethrough</s>~~</label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="superscript" ' + (cur.hidesuperscript ? 'checked' : '') + ' /> Suppress ^^<sup>superscript</sup>^^</label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="subscript" ' + (cur.hidesubscript ? 'checked' : '') + ' /> Suppress \\\\<sub>subscript</sub>\\\\</label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="me" ' + (cur.hideme ? 'checked' : '') + ' /> Suppress <kbd>/me</kbd> <em>action formatting</em></label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="greentext" ' + (cur.hidegreentext ? 'checked' : '') + ' /> Suppress <span class="greentext">&gt;' + ['meme arrows', 'greentext', 'quote formatting'][Math.floor(Math.random() * 3)] + '</span></label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="spoiler" ' + (cur.hidespoiler ? 'checked' : '') + ' /> Suppress spoiler hiding</label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="links" ' + (cur.hidelinks ? 'checked' : '') + ' /> Suppress clickable links</label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="interstice"' + (cur.hideinterstice ? 'checked' : '') + ' /> Don\'t warn for untrusted links</label></p>';
			buf += '<p><button name="close">Close</button></p>';
			this.$el.html(buf);
		},
		setOption: function (e) {
			var name = $(e.currentTarget).prop('name');
			this.chatformatting['hide' + name] = !!e.currentTarget.checked;
			Tools.prefs('chatformatting', this.chatformatting);
		}
	});

	var AvatarsPopup = this.AvatarsPopup = Popup.extend({
		type: 'semimodal',
		initialize: function () {
			var cur = +app.user.get('avatar');
			var buf = '';
			buf += '<p>Choose an avatar or <button name="close">Cancel</button></p>';

			buf += '<div class="avatarlist">';
			for (var i = 1; i <= 293; i++) {
				var offset = '-' + (((i - 1) % 16) * 80 + 1) + 'px -' + (Math.floor((i - 1) / 16) * 80 + 1) + 'px';
				buf += '<button name="setAvatar" value="' + i + '" style="background-position:' + offset + '"' + (i === cur ? ' class="cur"' : '') + ' title="/avatar ' + i + '"></button>';
			}
			buf += '</div><div style="clear:left"></div>';

			buf += '<p><button name="close">Cancel</button></p>';
			this.$el.html(buf).css('max-width', 780);
		},
		setAvatar: function (i) {
			app.send('/avatar ' + i);
			app.send('/cmd userdetails ' + app.user.get('userid'));
			Tools.prefs('avatar', i);
			this.close();
		}
	});

	var TabListPopup = this.TabListPopup = Popup.extend({
		type: 'semimodal',
		renderRooms: function (rooms) {
			var buf = '';
			for (var i = 0; i < rooms.length; i++) buf += app.topbar.renderRoomTab(rooms[i]);
			return buf;
		},
		initialize: function () {
			var curId = (app.curRoom ? app.curRoom.id : '');
			var curSideId = (app.curSideRoom ? app.curSideRoom.id : '');

			var buf = '<ul>' + this.renderRooms([app.rooms[''], app.rooms['teambuilder'], app.rooms['ladder']]) + '</ul>';
			if (app.roomList.length) buf += this.renderRooms(app.roomList);
			var sideBuf = this.renderRooms(app.sideRoomList);
			sideBuf += '<li><a class="button' + (curId === 'rooms' || curSideId === 'rooms' ? ' cur' : '') + '" href="' + app.root + 'rooms"><i class="fa fa-plus"></i> <span>&nbsp;</span></a></li>';
			if (sideBuf) {
				buf += '<ul>' + sideBuf + '</ul>';
			}
			this.$el.addClass('tablist').html(buf);
		},
		events: {
			'click a': 'click'
		},
		closeRoom: function (roomid, button, e) {
			app.leaveRoom(roomid);
			this.initialize();
		},
		click: function (e) {
			if (e.cmdKey || e.metaKey || e.ctrlKey) return;
			e.preventDefault();
			var $target = $(e.currentTarget);
			var id = $target.attr('href');
			if (id.substr(0, app.root.length) === app.root) {
				id = id.substr(app.root.length);
			}
			if ($target.hasClass('closebutton')) {
				app.leaveRoom(id);
				this.initialize();
			} else {
				this.close();
				app.focusRoom(id);
			}
		}
	});

	var CustomBackgroundPopup = this.CustomBackgroundPopup = Popup.extend({
		events: {
			'change input[name=bgfile]': 'setBgFile'
		},
		initialize: function () {
			var buf = '';
			var cur = Storage.bg.id;
			buf += '<p><strong>Default</strong></p>';
			buf += '<div class="bglist">';

			buf += '<button name="setBg" value=""' + (!cur ? ' class="cur"' : '') + '><strong style="background:#888888;color:white;padding:16px 18px;display:block;font-size:12pt">' + (location.host === 'play.pokemonshowdown.com' ? 'Random' : 'Default') + '</strong></button>';

			buf += '</div><div style="clear:left"></div>';
			buf += '<p><strong>Official</strong></p>';
			buf += '<div class="bglist">';
			var bgs = ['charizards', 'horizon', 'waterfall', 'ocean', 'shaymin'];

			buf += '<button name="setBg" value="charizards"' + (cur === 'charizards' ? ' class="cur"' : '') + '><span class="bg" style="background-position:0 -' + (90 * 0) + 'px"></span>Charizards</button>';
			buf += '<button name="setBg" value="horizon"' + (cur === 'horizon' ? ' class="cur"' : '') + '><span class="bg" style="background-position:0 -' + (90 * 1) + 'px"></span>Horizon</button>';
			buf += '<button name="setBg" value="waterfall"' + (cur === 'waterfall' ? ' class="cur"' : '') + '><span class="bg" style="background-position:0 -' + (90 * 2) + 'px"></span>Waterfall</button>';
			buf += '<button name="setBg" value="ocean"' + (cur === 'ocean' ? ' class="cur"' : '') + '><span class="bg" style="background-position:0 -' + (90 * 3) + 'px"></span>Ocean</button>';
			buf += '<button name="setBg" value="shaymin"' + (cur === 'shaymin' ? ' class="cur"' : '') + '><span class="bg" style="background-position:0 -' + (90 * 4) + 'px"></span>Shaymin</button>';
			buf += '<button name="setBg" value="solidblue"' + (cur === 'solidblue' ? ' class="cur"' : '') + '><span class="bg" style="background: #344b6c"></span>Solid blue</button>';

			buf += '</div><div style="clear:left"></div>';
			buf += '<p><strong>Custom</strong></p>';
			buf += '<p>Drag and drop an image to PS (the background settings don\'t need to be open), or upload:</p>';
			buf += '<p><input type="file" accept="image/*" name="bgfile"></p>';
			buf += '<p class="bgstatus"></p>';

			buf += '<p><button name="close"><strong>Done</strong></button></p>';

			// April Fool's 2016 - background change disabling
			// buf = '<p>Sorry, the background chooser is experiencing technical difficulties. Please try again tomorrow!</p><p><button name="close"><strong>Done</strong></button></p>';

			this.$el.css('max-width', 448).html(buf);
			this.$el.html(buf);
		},
		setBg: function (bgid) {
			var bgUrl = (bgid === 'solidblue' ? '#344b6c' : Tools.resourcePrefix + 'fx/client-bg-' + bgid + '.jpg');
			Storage.bg.set(bgUrl, bgid);
			this.$('.cur').removeClass('cur');
			this.$('button[value="' + bgid + '"]').addClass('cur');
		},
		setBgFile: function (e) {
			$('.bgstatus').text('Changing background image...');
			var file = e.currentTarget.files[0];
			CustomBackgroundPopup.readFile(file, this);
		}
	});
	CustomBackgroundPopup.readFile = function (file, popup) {
		var reader = new FileReader();
		reader.onload = function (e) {
			var noSave = false;
			if (String(e.target.result).length > 4200000) {
				if (popup) {
					$('.bgstatus').html('<strong style="background:red;color:white;padding:1px 4px;border-radius:4px;display:block">Image is too large and can\'t be saved. It should be under 3.5MB or so.</strong>');
				} else {
					app.addPopupMessage("Image is too large and can't be saved. It should be under 3.5MB or so.");
				}
				noSave = true;
			} else if (popup) {
				$('.bgstatus').html('Saved');
				popup.$('.cur').removeClass('cur');
			}
			Storage.bg.set(e.target.result, 'custom', noSave);
		};
		reader.readAsDataURL(file);
	};

	var LoginPopup = this.LoginPopup = Popup.extend({
		type: 'semimodal',
		initialize: function (data) {
			var buf = '<form>';

			if (data.error) {
				buf += '<p class="error">' + Tools.escapeHTML(data.error) + '</p>';
				if (data.error.indexOf('inappropriate') >= 0) {
					buf += '<p>Keep in mind these rules:</p>';
					buf += '<ol>';
					buf += '<li>Usernames may not impersonate a recognized user (a user with %, @, &, or ~ next to their name).</li>';
					buf += '<li>Usernames may not be derogatory or insulting in nature, to an individual or group (insulting yourself is okay as long as it\'s not too serious).</li>';
					buf += '<li>Usernames may not directly reference sexual activity, or be excessively disgusting.</li>';
					buf += '</ol>';
				}
			} else if (data.reason) {
				buf += '<p>' + Tools.parseMessage(data.reason) + '</p>';
			} else if (!data.force) {
				var noRenameGames = '';
				if (app.rooms[''].games) {
					for (var roomid in app.rooms[''].games) {
						var title = app.rooms[''].games[roomid];
						if (title.slice(-1) === '*') {
							noRenameGames += '<li>' + Tools.escapeHTML(title.slice(0, -1)) + '</li>';
						}
					}
				}
				if (noRenameGames) {
					buf += '<p>You can\'t change name in the middle of these games:</p>';
					buf += '<ul>' + noRenameGames + '</ul>';
					buf += '<p class="buttonbar"><button name="force"><small style="color:red">Forfeit and change name</small></button></p>';
					buf += '<p class="buttonbar"><button type="submit" autofocus><strong>Cancel</strong></button></p>';
					buf += '</form>';
					this.$el.html(buf);
					return;
				}
			}

			var name = (data.name || '');
			if (!name && app.user.get('named')) name = app.user.get('name');
			buf += '<p><label class="label">Username: <small class="preview" style="' + hashColor(toUserid(name)) + '">(color)</small><input class="textbox autofocus" type="text" name="username" value="' + Tools.escapeHTML(name) + '"></label></p>';
			if (name) {
				buf += '<p><small>(Others will be able to see your name change. To change name privately, use "Log out")</small></p>';
			}
			buf += '<p class="buttonbar"><button type="submit"><strong>Choose name</strong></button> <button name="close">Cancel</button></p>';

			buf += '</form>';
			this.$el.html(buf);
		},
		events: {
			'input .textbox': 'updateColor'
		},
		updateColor: function (e) {
			var name = e.currentTarget.value;
			var preview = this.$('.preview');
			var css = hashColor(toUserid(name)).slice(6, -1);
			preview.css('color', css);
		},
		force: function () {
			var sourceEl = this.sourceEl;
			this.close();
			app.addPopup(LoginPopup, {
				force: true,
				sourceEl: sourceEl,
				sourcePopup: app.popups[app.popups.length - 1]
			});
		},
		submit: function (data) {
			this.close();
			if (!$.trim(data.username)) return;
			app.user.rename(data.username);
		}
	});

	var ChangePasswordPopup = this.ChangePasswordPopup = Popup.extend({
		type: 'semimodal',
		initialize: function (data) {
			var buf = '<form>';
			if (data.error) {
				buf += '<p class="error">' + data.error + '</p>';
			} else {
				buf += '<p>Change your password:</p>';
			}
			buf += '<p><label class="label">Username: <strong>' + app.user.get('name') + '</strong></label></p>';
			buf += '<p><label class="label">Old password: <input class="textbox autofocus" type="password" name="oldpassword" /></label></p>';
			buf += '<p><label class="label">New password: <input class="textbox" type="password" name="password" /></label></p>';
			buf += '<p><label class="label">New password (confirm): <input class="textbox" type="password" name="cpassword" /></label></p>';
			buf += '<p class="buttonbar"><button type="submit"><strong>Change password</strong></button> <button name="close">Cancel</button></p></form>';
			this.$el.html(buf);
		},
		submit: function (data) {
			$.post(app.user.getActionPHP(), {
				act: 'changepassword',
				oldpassword: data.oldpassword,
				password: data.password,
				cpassword: data.cpassword
			}, Tools.safeJSON(function (data) {
				if (!data) data = {};
				if (data.actionsuccess) {
					app.addPopupMessage("Your password was successfully changed.");
				} else {
					app.addPopup(ChangePasswordPopup, {
						error: data.actionerror
					});
				}
			}), 'text');
		}
	});

	var RegisterPopup = this.RegisterPopup = Popup.extend({
		type: 'semimodal',
		initialize: function (data) {
			var buf = '<form>';
			if (data.error) {
				buf += '<p class="error">' + data.error + '</p>';
			} else if (data.reason) {
				buf += '<p>' + data.reason + '</p>';
			} else {
				buf += '<p>Register your account:</p>';
			}
			buf += '<p><label class="label">Username: <strong>' + Tools.escapeHTML(data.name || app.user.get('name')) + '</strong><input type="hidden" name="name" value="' + Tools.escapeHTML(data.name || app.user.get('name')) + '" /></label></p>';
			buf += '<p><label class="label">Password: <input class="textbox autofocus" type="password" name="password" /></label></p>';
			buf += '<p><label class="label">Password (confirm): <input class="textbox" type="password" name="cpassword" /></label></p>';
			buf += '<p><label class="label"><img src="' + Tools.resourcePrefix + 'sprites/bwani/pikachu.gif" /></label></p>';
			buf += '<p><label class="label">What is this pokemon? <input class="textbox" type="text" name="captcha" value="' + Tools.escapeHTML(data.captcha) + '" /></label></p>';
			buf += '<p class="buttonbar"><button type="submit"><strong>Register</strong></button> <button name="close">Cancel</button></p></form>';
			this.$el.html(buf);
		},
		submit: function (data) {
			var name = data.name;
			var captcha = data.captcha;
			$.post(app.user.getActionPHP(), {
				act: 'register',
				username: name,
				password: data.password,
				cpassword: data.cpassword,
				captcha: captcha,
				challstr: app.user.challstr
			}, Tools.safeJSON(function (data) {
				if (!data) data = {};
				var token = data.assertion;
				if (data.curuser && data.curuser.loggedin) {
					app.user.set('registered', data.curuser);
					var name = data.curuser.username;
					app.send('/trn ' + name + ',1,' + token);
					app.addPopupMessage("You have been successfully registered.");
				} else {
					app.addPopup(RegisterPopup, {
						name: name,
						captcha: captcha,
						error: data.actionerror
					});
				}
			}), 'text');
		}
	});

	var LoginPasswordPopup = this.LoginPasswordPopup = Popup.extend({
		type: 'semimodal',
		initialize: function (data) {
			var buf = '<form>';

			if (data.error) {
				buf += '<p class="error">' + Tools.escapeHTML(data.error) + '</p>';
				if (data.error.indexOf(' forced you to change ') >= 0) {
					buf += '<p>Keep in mind these rules:</p>';
					buf += '<ol>';
					buf += '<li>Usernames may not be derogatory or insulting in nature, to an individual or group (insulting yourself is okay as long as it\'s not too serious).</li>';
					buf += '<li>Usernames may not reference sexual activity, directly or indirectly.</li>';
					buf += '<li>Usernames may not impersonate a recognized user (a user with %, @, &, or ~ next to their name).</li>';
					buf += '</ol>';
				}
			} else if (data.reason) {
				buf += '<p>' + Tools.escapeHTML(data.reason) + '</p>';
			} else {
				buf += '<p class="error">The name you chose is registered.</p>';
			}

			buf += '<p>Log in:</p>';
			buf += '<p><label class="label">Username: <strong>' + Tools.escapeHTML(data.username) + '<input type="hidden" name="username" value="' + Tools.escapeHTML(data.username) + '" /></strong></label></p>';
			if (data.special === '@gmail') {
				buf += '<div id="gapi-custom-signin" style="width:240px;margin:0 auto">[loading Google log-in button]</div>';
				buf += '<p class="buttonbar"><button name="close">Cancel</button></p>';
			} else {
				buf += '<p><label class="label">Password: <input class="textbox autofocus" type="password" name="password"></label></p>';
				buf += '<p class="buttonbar"><button type="submit"><strong>Log in</strong></button> <button name="close">Cancel</button></p>';
			}

			buf += '<p class="or">or</p>';
			buf += '<p class="buttonbar"><button name="login">Choose another name</button></p>';

			buf += '</form>';
			this.$el.html(buf);

			if (data.special === '@gmail') {
				var self = this;
				window.gapiRenderButton = function () {
					gapi.signin2.render('gapi-custom-signin', { // eslint-disable-line no-undef
						'scope': 'email',
						'width': 240,
						'height': 50,
						'longtitle': true,
						'theme': 'dark',
						'onsuccess': function (googleUser) {
							var profile = googleUser.getBasicProfile();
							var id_token = googleUser.getAuthResponse().id_token;
							self.close();
							app.user.passwordRename(data.username, id_token, data.special);
						},
						'onfailure': function (googleUser) {
							alert('sign-in failed');
						}
					});
				};
				if (window.gapiLoaded) return setTimeout(window.gapiRenderButton, 100);
				window.gapiLoaded = true;

				var script = document.createElement('script');
				script.async = true;
				script.src = 'https://apis.google.com/js/platform.js?onload=gapiRenderButton';
				document.getElementsByTagName('head')[0].appendChild(script);
			}
		},
		login: function () {
			this.close();
			app.addPopup(LoginPopup);
		},
		submit: function (data) {
			this.close();
			app.user.passwordRename(data.username, data.password);
		}
	});

}).call(this, jQuery);
