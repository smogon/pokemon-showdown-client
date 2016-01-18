(function ($) {

	var Topbar = this.Topbar = Backbone.View.extend({
		events: {
			'click a': 'click',
			'click .username': 'clickUsername',
			'click button': 'dispatchClickButton'
		},
		initialize: function () {
			this.$el.html('<img class="logo" src="' + Tools.resourcePrefix + 'pokemonshowdownbeta.png" alt="Pok&eacute;mon Showdown! (beta)" /><div class="maintabbarbottom"></div><div class="tabbar maintabbar"><div class="inner"></div></div><div class="userbar"></div>');
			this.$tabbar = this.$('.maintabbar .inner');
			// this.$sidetabbar = this.$('.sidetabbar');
			this.$userbar = this.$('.userbar');
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
				buf = '<button disabled>Loading...</button> <button class="icon" name="openSounds"><i class="' + (Tools.prefs('mute') ? 'fa fa-volume-off' : 'fa fa-volume-up') + '"></i></button> <button class="icon" name="openOptions"><i class="fa fa-cog"></i></button>';
			} else if (app.user.get('named')) {
				buf = '<span class="username" data-name="' + Tools.escapeHTML(name) + '" style="' + color + '"><i class="fa fa-user" style="color:#779EC5"></i> ' + Tools.escapeHTML(name) + '</span> <button class="icon" name="openSounds"><i class="' + (Tools.prefs('mute') ? 'fa fa-volume-off' : 'fa fa-volume-up') + '"></i></button> <button class="icon" name="openOptions"><i class="fa fa-cog"></i></button>';
			} else {
				buf = '<button name="login">Choose name</button> <button class="icon" name="openSounds"><i class="' + (Tools.prefs('mute') ? 'fa fa-volume-off' : 'fa fa-volume-up') + '"></i></button> <button class="icon" name="openOptions"><i class="fa fa-cog"></i></button>';
			}
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

		// tabbar
		renderRoomTab: function (room) {
			if (!room) return '';
			var id = room.id;
			var buf = '<li><a class="button' + (app.curRoom === room || app.curSideRoom === room ? ' cur' : '') + (room.notificationClass || '') + (id === '' || id === 'rooms' ? '' : ' closable') + '" href="' + app.root + id + '">';
			switch (id) {
			case '':
				return buf + '<i class="fa fa-home"></i> <span>Home</span></a></li>';
			case 'teambuilder':
				return buf + '<i class="fa fa-pencil-square-o"></i> <span>Teambuilder</span></a><a class="closebutton" href="' + app.root + 'teambuilder"><i class="fa fa-times-circle"></i></a></li>';
			case 'ladder':
				return buf + '<i class="fa fa-list-ol"></i> <span>Ladder</span></a><a class="closebutton" href="' + app.root + 'ladder"><i class="fa fa-times-circle"></i></a></li>';
			case 'rooms':
				return buf + '<i class="fa fa-plus" style="margin:7px auto -6px auto"></i> <span>&nbsp;</span></a></li>';
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
					return buf + '<i class="text">' + Tools.escapeFormat(formatid) + '</i><span>' + name + '</span></a><a class="closebutton" href="' + app.root + id + '"><i class="fa fa-times-circle"></i></a></li>';
				} else {
					return buf + '<i class="fa fa-comment-o"></i> <span>' + (Tools.escapeHTML(room.title) || (id === 'lobby' ? 'Lobby' : id)) + '</span></a><a class="closebutton" href="' + app.root + id + '"><i class="fa fa-times-circle"></i></a></li>';
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
			if (app.roomList.length) buf += '<ul>';
			for (var i = 0; i < app.roomList.length; i++) {
				var room = app.roomList[i];
				if (room.notifications) notificationCount++;
				buf += this.renderRoomTab(room);
			}
			if (app.roomList.length) buf += '</ul>';

			for (var i = 0; i < app.sideRoomList.length; i++) {
				var room = app.sideRoomList[i];
				if (room.notifications) notificationCount++;
				sideBuf += this.renderRoomTab(room);
			}
			if (window.nodewebkit) {
				if (nwWindow.setBadgeLabel) nwWindow.setBadgeLabel(notificationCount || '');
			}
			sideBuf += '<li><a class="button' + (curId === 'rooms' || curSideId === 'rooms' ? ' cur' : '') + '" href="' + app.root + 'rooms"><i class="fa fa-plus" style="margin:7px auto -6px auto"></i> <span>&nbsp;</span></a></li>';
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
				this.$tabbar.append('<div class="overflow"><button name="tablist" class="button"><i class="fa fa-caret-down"></i></button></div>');
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
			var buf = '<ul><li><a class="button minilogo' + notificationClass + '" href="' + app.root + '"><img src="' + Tools.resourcePrefix + 'favicon-128.png" width="32" height="32" alt="PS!" /><i class="fa fa-caret-down" style="display:inline-block"></i></a></li></ul>';

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
				this[target.name](target.value, target);
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
		tablist: function () {
			app.addPopup(TabListPopup);
		}
	});

	var SoundsPopup = this.SoundsPopup = Popup.extend({
		initialize: function (data) {
			var buf = '';
			var muted = !!Tools.prefs('mute');
			buf += '<p class="effect-volume"><label class="optlabel">Effect volume:</label>' + (muted ? '<em>(muted)</em>' : '<input type="slider" name="effectvolume" value="' + (Tools.prefs('effectvolume') || 50) + '" />') + '</p>';
			buf += '<p class="music-volume"><label class="optlabel">Music volume:</label>' + (muted ? '<em>(muted)</em>' : '<input type="slider" name="musicvolume" value="' + (Tools.prefs('musicvolume') || 50) + '" />') + '</p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="muted"' + (muted ? ' checked' : '') + ' /> Mute sounds</label></p>';
			this.$el.html(buf).css('min-width', 160);
		},
		events: {
			'change input[name=muted]': 'setMute'
		},
		domInitialize: function () {
			var self = this;
			this.$('.effect-volume input').slider({
				from: 0,
				to: 100,
				step: 1,
				dimension: '%',
				skin: 'round_plastic',
				onstatechange: function (val) {
					self.setEffectVolume(val);
				}
			});
			this.$('.music-volume input').slider({
				from: 0,
				to: 100,
				step: 1,
				dimension: '%',
				skin: 'round_plastic',
				onstatechange: function (val) {
					self.setMusicVolume(val);
				}
			});
		},
		setMute: function (e) {
			var muted = !!e.currentTarget.checked;
			Tools.prefs('mute', muted);
			BattleSound.setMute(muted);

			if (!muted) {
				this.$('.effect-volume').html('<label class="optlabel">Effect volume:</label><input type="slider" name="effectvolume" value="' + (Tools.prefs('effectvolume') || 50) + '" />');
				this.$('.music-volume').html('<label class="optlabel">Music volume:</label><input type="slider" name="musicvolume" value="' + (Tools.prefs('musicvolume') || 50) + '" />');
				this.domInitialize();
			} else {
				this.$('.effect-volume').html('<label class="optlabel">Effect volume:</label><em>(muted)</em>');
				this.$('.music-volume').html('<label class="optlabel">Music volume:</label><em>(muted)</em>');
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
			'change input[name=temporarynotifications]': 'setTemporaryNotifications',
			'change select[name=bg]': 'setBg',
			'change select[name=timestamps-lobby]': 'setTimestampsLobby',
			'change select[name=timestamps-pms]': 'setTimestampsPMs',
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
			buf += '<p><label class="optlabel">Background: <button name="background">Change background</button></label></p>';
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
			buf += '<p><label class="optlabel"><input type="checkbox" name="monospace" ' + (cur.hidemonospace ? 'checked' : '') + ' /> Suppress ``<code>monospace</code>``</label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="strikethrough" ' + (cur.hidestrikethrough ? 'checked' : '') + ' /> Suppress ~~<s>strikethrough</s>~~</label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="me" ' + (cur.hideme ? 'checked' : '') + ' /> Suppress <code>/me</code> <em>action formatting</em></label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="spoiler" ' + (cur.hidespoiler ? 'checked' : '') + ' /> Suppress spoiler hiding</label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="links" ' + (cur.hidelinks ? 'checked' : '') + ' /> Suppress clickable links</label></p>';
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
				var offset = '-' + (((i - 1) % 16) * 80) + 'px -' + (Math.floor((i - 1) / 16) * 80) + 'px';
				buf += '<button name="setAvatar" value="' + i + '" style="background-position:' + offset + '"' + (i === cur ? ' class="cur"' : '') + '></button>';
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
			buf += '<p><label class="label">Password: <input class="textbox autofocus" type="password" name="password"></label></p>';
			buf += '<p class="buttonbar"><button type="submit"><strong>Log in</strong></button> <button name="close">Cancel</button></p>';

			buf += '<p class="or">or</p>';
			buf += '<p class="buttonbar"><button name="login">Choose another name</button></p>';

			buf += '</form>';
			this.$el.html(buf);
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
